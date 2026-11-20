// Our cast as lit flat sprites in the 3D world. Each frame every character asks for a drawing (a key + a draw call);
// the pool keeps one canvas per distinct drawing, so soldiers marching in step share canvases (7 head shapes x 4
// outfits). Characters are yaw-only billboards shaded by cardShade() (scene tint, bright floor, side gradient toward
// the sun, painted crescent in the drawing); standing ones get a soft multiply contact blob. Effects are unlit cards.
// Cards, effects and blobs live on the NOINK layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, soldier, townsfolk, fxBurst, fxShadow, fxContact, FRENCH, FRENCH2, hanoi, INK,
  Outfit, Expr, FrontOpts, SideOpts, Prop,
} from "./toon";
import {
  FPS, D0, SHOTS, V3, smooth, clamp01, BridgeState, OFFICIAL, TABLE, GRATE, GRATE2, STREET_Z, FARM,
} from "./story";
import { LIGHTS } from "./lights";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
export const SU_SWING = 2.3 / 1830; // swing canvas: rope of 1830 units = 2.3 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
const vOf = (i: number) => (i * 7 + (i >> 2)) % 4;
/** head-shape seed: 7 shapes, so marching soldiers in step still share canvases */
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

/** front / side view and mirroring for someone at (x, z) walking along (dx, dz); fs = foreshortening of the walk */
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks and reaction timing ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half, plus a blink across
 *  every expression swap (the shut frames hide the swap) */
const LID = [0.5, 1, 1, 0.5];
const SWAPS: Record<number, number[]> = {};
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13)); // next blink 0.5-2.3 s later
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h; // feet at v = .2 of the card
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

// ---------------- Ratas de Hanói: drawings ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };
const RAT = "#8b8592", RAT_D = "#6d6776", PINK = "#eba5ab";
/** rat seen from the side, facing right, on a 400 x 260 canvas, feet on y = 248 */
const drawRat = (p: Pen, o: { tail: boolean; run: number; dead?: boolean; dir?: number; look?: number }) => {
  const g = p.g;
  g.save();
  if (o.dir === -1) { g.translate(400, 0); g.scale(-1, 1); }
  if (o.dead) { g.translate(0, 260); g.scale(1, -1); g.translate(0, 18); }
  const legs = (x: number, ph: number) => { const a = Math.sin(o.run * Math.PI * 2 + ph) * 16; p.stroke([[x, 200], [x + a, 244]], 9); };
  legs(140, 0); legs(250, Math.PI);
  if (o.tail) {
    const tl: [number, number][] = [];
    for (let i = 0; i <= 18; i++) { const v = i / 18; tl.push([92 - 88 * v, 182 - 70 * v + 18 * Math.sin(v * 6 + o.run * 6)]); }
    p.stroke(tl, 12, INK); p.stroke(tl, 7, PINK);
  } else { p.ell(86, 180, 9, 7, PINK, 5); } // stub
  p.ell(190, 168, 112, 62, RAT, 7);
  p.ell(200, 196, 70, 26, "#a7a1ad", 0);
  legs(160, Math.PI); legs(270, 0);
  p.poly([[262, 112], [370, 158], [366, 176], [270, 196]], RAT, 7);
  p.ell(282, 150, 52, 46, RAT, 7);
  p.ell(268, 100, 28, 28, RAT, 7); p.ell(268, 100, 15, 15, PINK, 0);
  p.dot(370, 165, 9, "#d9707e");
  if (o.dead) { for (const s of [-1, 1]) p.stroke([[306 - 10, 136 - 10 * s], [306 + 10, 136 + 10 * s]], 6); }
  else { p.dot(306 + 4 * (o.look ?? 0), 138, 9); p.dot(309, 134, 3, "#ffffff"); }
  for (const dy of [-8, 4]) p.stroke([[352, 166], [392, 166 + dy * 1.6]], 2.5);
  g.restore();
};
const fxCoin = (p: Pen) => {
  p.ell(100, 100, 86, 86, "#f2c84b", 9); p.ell(100, 100, 64, 64, null, 4);
  p.g.fillStyle = "#8a6414"; p.g.font = "bold 70px DejaVu Sans, sans-serif"; p.g.textAlign = "center"; p.g.textBaseline = "middle"; p.g.fillText("1¢", 100, 104);
};
const tailPts = (x: number, y: number, len: number, a: number, w: number): [number, number][] =>
  Array.from({ length: 13 }, (_, i) => { const v = i / 12; return [x + Math.cos(a) * len * v + w * Math.sin(v * 7), y + Math.sin(a) * len * v + w * Math.cos(v * 5)]; });
const fxTails = (p: Pen, n: number) => { // heap of tails, 600 x 360
  let s = 7;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < n; i++) {
    const x = 300 + (r() - 0.5) * 480 * (1 - i / (n * 1.6)), y = 340 - (i / n) * 230 - r() * 40;
    const pts = tailPts(x, y, 120 + r() * 80, -0.4 + r() * 0.8 + (r() < 0.5 ? Math.PI : 0), 10);
    p.stroke(pts, 13, INK); p.stroke(pts, 8, PINK);
  }
};
const fxSack = (p: Pen) => { // 300 x 340
  for (let i = 0; i < 5; i++) { const pts = tailPts(110 + i * 22, 90, 80, -1.2 - i * 0.18, 8); p.stroke(pts, 11, INK); p.stroke(pts, 6, PINK); }
  p.poly([[60, 330], [240, 330], [262, 200], [200, 92], [100, 92], [38, 200]], "#a9824c", 7);
  p.stroke([[96, 112], [204, 112]], 9, "#7a5a32");
  for (const [x, y] of [[100, 220], [170, 270], [190, 180]]) p.stroke([[x, y], [x + 26, y + 6]], 3, "#9a7a48");
};
const fxGrate = (p: Pen) => { // flat 400 x 400
  p.ell(200, 200, 186, 186, "#5d6068", 10); p.ell(200, 200, 150, 150, "#1c1a22", 6);
  for (let k = -3; k <= 3; k++) p.band([[200 + k * 40, 70], [200 + k * 40, 330]], "#5d6068", 14, 4);
};
const fxSign = (p: Pen) => { // 640 x 300
  p.poly([[14, 14], [626, 14], [626, 286], [14, 286]], "#efe3c2", 9);
  const g = p.g; g.fillStyle = "#3a2a20"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "bold 76px DejaVu Sans, sans-serif"; g.fillText("1¢ = 1 RATA", 320, 118);
  g.font = "bold 50px DejaVu Sans, sans-serif"; g.fillStyle = "#b5402f"; g.fillText("¡TRAE LA COLA!", 320, 222);
};
const fxCrate = (p: Pen, k: number) => { // 520 x 420, rat heads peeking through the slats
  p.poly([[20, 60], [500, 60], [500, 410], [20, 410]], "#7a5130", 8);
  for (let i = 0; i < 4; i++) {
    const x = 85 + i * 118, up = Math.sin(k * 6.28 + i * 1.7) * 14;
    p.ell(x, 120 + up, 44, 38, RAT, 6); p.ell(x - 26, 90 + up, 16, 16, RAT, 5); p.ell(x + 26, 90 + up, 16, 16, RAT, 5);
    p.dot(x - 14, 116 + up, 7); p.dot(x + 14, 116 + up, 7); p.dot(x, 140 + up, 9, "#d9707e");
  }
  for (const y of [170, 260, 350]) p.poly([[20, y - 30], [500, y - 30], [500, y + 30], [20, y + 30]], "#b98a55", 6);
  p.poly([[20, 60], [500, 60], [500, 410], [20, 410]], null, 9);
};
const fxSweat = (p: Pen) => { p.poly([[60, 10], [100, 90], [60, 120], [20, 90]], "#9fd4f5", 6); };
const fxSnip = (p: Pen, u: number) => { // severed tail piece flying, 300 x 300
  const pts = tailPts(80, 200 - 120 * u, 140, -0.5 + u * 2, 10); p.stroke(pts, 12, INK); p.stroke(pts, 7, PINK);
};

// ---------------- staging helpers ----------------
const T = (s: number) => s - LEAD; // reactions land 0-3 f before the word
const after = (t: number, s: number) => t >= T(s);
const pop = (t: number, s: number, d = 0.18) => smooth((t - T(s)) / d); // 0 -> 1 appear
let fxN = 0;
const rat = (out: Stage, x: number, z: number, o: { tail: boolean; run: number; dead?: boolean; dir?: number; s?: number; y?: number }) => {
  const s = o.s ?? 1, run = q(o.run % 1, 12);
  out.fx.push({ key: `rat|${o.tail}|${run}|${!!o.dead}|${o.dir ?? 1}`, cw: 400, ch: 260, draw: (p) => drawRat(p, { ...o, run }),
    x, y: (o.y ?? D0) + 0.13 * s, z, w: 0.42 * s, h: 0.273 * s });
  out.fx.push({ key: "blob|contact|#4f4a66", cw: 128, ch: 128, draw: (p) => fxContact(p, "#4f4a66"), x, y: D0 + 0.021, z, w: 0.36 * s, h: 0.2 * s, flat: true });
  fxN++;
};
const coin = (out: Stage, x: number, y: number, z: number, k: number, s = 0.26) => {
  if (k <= 0) return;
  out.fx.push({ key: "coin", cw: 200, ch: 200, draw: fxCoin, x, y: y + 0.15 * (1 - k), z, w: s * k, h: s * k });
};
const burst = (out: Stage, t: number, s0: number, x: number, y: number, z: number, w = 0.9) => {
  if (t >= s0 && t < s0 + 0.2) { const u = q((t - s0) / 0.2, 30); out.fx.push({ key: `burst${u}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u), x, y, z, w, h: w }); }
};
const who = (i: number, o: Outfit, k: string) => ({ i, o, okey: k });
const front = (out: Stage, cam: CamInfo, t: number, i: number, o: Outfit, k: string, x: number, z: number, fo: FrontOpts, y = D0, shadow = true) => {
  out.places.push(person(cam, who(i, o, k), x, y, z, { side: false, mirror: false }, { blink: lidAt(t, i), ...fo }, {}));
  if (shadow) blob(out, x, y, z);
};
const walker = (out: Stage, cam: CamInfo, t: number, i: number, o: Outfit, k: string, x: number, z: number, dx: number, dz: number, phase: number, expr: Expr, fo: Partial<FrontOpts> = {}, stride = 1) => {
  const view = viewOf(cam, x, z, dx, dz);
  out.places.push(person(cam, who(i, o, k), x, D0, z, view, { mode: "stroll", phase: q(phase % 1, 60), expr, blink: lidAt(t, i), ...fo },
    { mode: "march", phase: q(phase % 1, 60), expr, stomp: 0.5, stride: stride * view.fs, blink: lidAt(t, i) }));
  blob(out, x, D0, z);
};
const HUNT = [0, 1, 3, 4, 5, 0, 1, 3].map((v) => hanoi(v));
const TOWN = [0, 1, 2, 3, 4, 5, 2, 0, 4].map((v) => hanoi(v));
const [OX, , OZ] = OFFICIAL;
/** the official behind the payment table (the table hides his legs) */
const official = (out: Stage, cam: CamInfo, t: number, expr: Expr, prop: Prop = null, look = 0, y = D0) =>
  front(out, cam, t, 90, FRENCH, "fr", OX, OZ, { mode: "stand", expr, prop, look, facing: 0 }, y, false);
const table = (out: Stage) => out.fx.push({ key: "sign", cw: 640, ch: 300, draw: fxSign, x: TABLE[0], y: D0 + 0.55, z: TABLE[2] + 0.56, w: 1.15, h: 0.54 });
const grates = (out: Stage) => {
  for (const [x, , z] of [GRATE, GRATE2]) out.fx.push({ key: "grate", cw: 400, ch: 400, draw: fxGrate, x, y: D0 + 0.016, z, w: 0.95, h: 0.95, flat: true });
  out.fx.push({ key: "grate", cw: 400, ch: 400, draw: fxGrate, x: 0.5, y: D0 + 0.016, z: STREET_Z + 3, w: 0.95, h: 0.95, flat: true });
};

// ---------------- the shots ----------------
const S: Record<number, (cam: CamInfo, t: number, out: Stage) => void> = {
  1: (cam, t, out) => { // "pagó por matar ratas... y acabó con más ratas que nunca"
    table(out);
    official(out, cam, t, after(t, 3.74) ? "shock" : after(t, 2.18) ? "grin" : "smile", ["coin", 0], 0);
    const n = Math.floor(clamp01((t - 3.2) / 1.6) * 14);
    for (let i = 0; i < n; i++) {
      const a = i * 2.4 + t * (0.9 + 0.1 * (i % 3)), r = 1.1 + (i % 4) * 0.35;
      rat(out, OX + Math.cos(a) * r, OZ + 1.4 + Math.sin(a) * r * 0.6, { tail: true, run: t * 3 + i * 0.3, dir: Math.sin(a) > 0 ? -1 : 1 });
    }
  },
  2: (cam, t, out) => { // Hanói, alcantarillas nuevas, su gran orgullo
    grates(out);
    const cheer = after(t, 9.22);
    front(out, cam, t, 91, FRENCH, "fr", GRATE[0] - 0.9, GRATE[2] - 0.6, { mode: "stand", expr: cheer ? "laugh" : "grin", wave: cheer ? q(Math.sin(t * 9), 30) : undefined });
    front(out, cam, t, 92, FRENCH2, "fr2", GRATE[0] + 0.95, GRATE[2] - 0.7, { mode: "stand", expr: "grin", facing: -1 });
    for (let i = 0; i < 9; i++) {
      const x = GRATE[0] - 5.5 + i * 1.35 + hh(i) * 0.4, z = GRATE[2] - 2.4 - (i % 2) * 0.9;
      front(out, cam, t, 100 + i, TOWN[i], `t${i}`, x, z, { mode: "stand", expr: cheer ? (["laugh", "grin", "smile"] as Expr[])[i % 3] : "smile", wave: cheer && i % 2 ? q(Math.sin(t * 8 + i), 30) : undefined });
    }
  },
  3: (cam, t, out) => { // a las ratas también les encantan
    grates(out);
    for (let i = 0; i < 7; i++) {
      const s0 = 10.2 + i * 0.28, u = t - s0;
      if (u < 0) continue;
      const a = i * 2.1, d = Math.min(2.6, u * 1.4);
      rat(out, GRATE[0] + Math.cos(a) * d, GRATE[2] + Math.sin(a) * d * 0.7, { tail: true, run: t * 3.2 + i * 0.2, dir: Math.cos(a) < 0 ? -1 : 1, y: D0 - 0.25 * (1 - smooth(u / 0.25)) });
    }
  },
  4: (cam, t, out) => { // contratan cazadores, y funcionan. Miles de ratas al día
    grates(out);
    const stop = Math.min(t, 15.0);
    for (let i = 0; i < 4; i++) {
      const x = -2.1 + i * 1.4, z = STREET_Z - 7 + (stop - 12.4) * 1.1 + (i % 2) * 0.6;
      if (t < 15.0) walker(out, cam, t, 110 + i, HUNT[i], `h${i}`, x, z, 0, 1, (t - 12.4) * 0.8 + i * 0.25, "stern", { prop: ["stick", 0] });
      else front(out, cam, t, 110 + i, HUNT[i], `h${i}`, x, z, { mode: "stand", expr: i % 2 ? "grin" : "laugh", prop: ["stick", 0] });
      if (after(t, 15.06 + i * 0.12)) out.fx.push({ key: "sack", cw: 300, ch: 340, draw: fxSack, x: x + 0.55, y: D0 + 0.48 * pop(t, 15.06 + i * 0.12), z: z + 0.5, w: 0.85, h: 0.96 * pop(t, 15.06 + i * 0.12) });
    }
  },
  5: (cam, t, out) => { // no es suficiente; un centavo por cada rata
    table(out);
    const coinUp = after(t, 20.68);
    official(out, cam, t, after(t, 18.0) ? "grin" : "nervous", coinUp ? ["coin", 0] : null, 0, D0 + 0.25);
    burst(out, t, 20.82, OX + 0.42, D0 + 2.75, OZ + 0.1, 0.8);
    for (let i = 0; i < 6; i++) {
      const sx = i % 2 ? 1 : -1, x = OX + sx * (0.95 + (i >> 1) * 0.45), z = OZ + 2.6 + (i >> 1) * 0.75;
      out.places.push(person(cam, who(120 + i, TOWN[i + 2], `c${i}`), x, D0, z, { side: true, mirror: sx > 0 }, {},
        { mode: "stand", expr: coinUp ? (i % 2 ? "grin" : "shock") : "neutral", blink: lidAt(t, 120 + i) }));
      blob(out, x, D0, z);
    }
    if (t > 16.3 && t < 18.0) for (let i = 0; i < 4; i++) rat(out, OX - 3 + (t - 16.3) * 4.2 + i * 0.6, OZ + 1.0 + (i % 2) * 0.4, { tail: true, run: t * 3 + i * 0.4 });
  },
  6: (cam, t, out) => { // solo tienes que traer la cola
    table(out);
    official(out, cam, t, after(t, 23.8) ? "grin" : "stern", ["tail", q(t * 0.6, 20)], 0, D0 + 0.25);
  },
  7: (cam, t, out) => { // la ciudad entera se pone a cazar; colas por miles; encantados
    if (t < 26.67) {
      for (let i = 0; i < 5; i++) {
        const x = -5 + (t - 24.3) * 2.6 + i * 0.95 - (i % 2) * 0.4, z = STREET_Z + 1 - (i % 3) * 1.1;
        walker(out, cam, t, 130 + i, TOWN[i], `t${i}`, x, z, 1, 0, (t - 24.3) * 1.9 + i * 0.3, i % 2 ? "laugh" : "grin", {}, 1.5);
      }
      for (let i = 0; i < 6; i++) rat(out, -1.5 + (t - 24.3) * 3.0 + i * 0.7, STREET_Z + 2.4 - (i % 3) * 0.9, { tail: true, run: t * 4 + i * 0.3 });
    } else {
      table(out);
      const k = clamp01((t - 26.6) / 1.6), happy = after(t, 28.32);
      official(out, cam, t, happy ? "laugh" : "grin", null, 0);
      front(out, cam, t, 93, FRENCH2, "fr2", OX + 1.1, OZ - 0.3, { mode: "stand", expr: happy ? "laugh" : "grin", facing: -1 }, D0, false);
      out.fx.push({ key: `tails${Math.round(k * 10)}`, cw: 600, ch: 360, draw: (p) => fxTails(p, 6 + Math.round(k * 10) * 4), x: TABLE[0] - 0.55, y: D0 + 0.95 + 0.14, z: TABLE[2] + 0.15, w: 1.0, h: 0.5 });
    }
  },
  8: (cam, t, out) => { // una rata sin cola... y otra... y otra
    grates(out);
    const sh = after(t, 31.76);
    front(out, cam, t, 94, FRENCH, "fr", 0.3, STREET_Z, { mode: "stand", expr: sh ? "shock" : "neutral", look: sh ? 1 : 0 });
    for (const [i, w] of [[0, 31.96], [1, 32.9], [2, 33.82]] as const) {
      const x = 0.45 + (t - w) * 2.6 * (i % 2 ? -1 : 1);
      if (Math.abs(x) > 2.4) continue;
      rat(out, x, STREET_Z + 1.7 - i * 0.2, { tail: false, run: t * 3.4 + i * 0.3, s: 1.35, dir: i % 2 ? -1 : 1 });
    }
  },
  9: (cam, t, out) => { // Fíjate: muerta = 1 centavo una vez; viva sin cola = crías, cada una con cola
    if (after(t, 35.14)) {
      rat(out, 9.85, -34.5, { tail: true, run: 0, dead: true, s: 1.0 });
      coin(out, 9.85, D0 + 0.5, -34.5, pop(t, 35.92));
    }
    if (after(t, 37.82)) {
      const x = 10.85 + 1.2 * (1 - smooth((t - T(37.82)) / 0.5));
      rat(out, x, -34.5, { tail: false, run: t < 38.4 ? t * 3 : 0.25, s: 1.25, dir: -1 });
      for (let i = 0; i < 6; i++) {
        const s0 = 40.04 + i * 0.12, k = pop(t, s0);
        if (k <= 0) continue;
        const bx = 10.85 + (i - 2.5) * 0.27, bz = -34.0 + (i % 2) * 0.22;
        rat(out, bx, bz, { tail: true, run: t * 2 + i * 0.4, s: 0.5 * k, dir: i % 2 ? 1 : -1 });
        coin(out, bx, D0 + 0.42, bz, pop(t, 40.62 + i * 0.13), 0.18);
      }
    }
  },
  10: (cam, t, out) => { // cortaban la cola y la soltaban; granjas de ratas
    if (t < 44.5) {
      grates(out);
      const snip = after(t, 42.72);
      front(out, cam, t, 140, HUNT[2], "h2", 11.7, -34.6, { mode: "stand", expr: snip ? "grin" : "stern", prop: ["scissors", snip ? 1 : 0], facing: -1 });
      const go = t - 43.75, rx = go < 0 ? 11.0 : 11.0 + (GRATE2[0] - 11.0) * clamp01(go / 0.55);
      if (go < 0.65) rat(out, rx, -34.2 + (GRATE2[2] + 34.2) * clamp01(go / 0.55), { tail: !snip, run: go > 0 ? t * 4 : 0, dir: -1, y: go > 0.55 ? D0 - 0.3 * (go - 0.55) / 0.1 : D0 });
      if (snip && t < 43.6) { const u = q(clamp01((t - 42.72) / 0.8), 20); out.fx.push({ key: `snip${u}`, cw: 300, ch: 300, draw: (p) => fxSnip(p, u), x: 11.3, y: D0 + 0.5, z: -34.1, w: 0.6, h: 0.6 }); }
    } else {
      const k = q((t % 1.5) / 1.5, 20);
      for (let i = 0; i < 4; i++) out.fx.push({ key: `crate${q((k + i * 0.25) % 1, 20)}`, cw: 520, ch: 420, draw: (p) => fxCrate(p, (k + i * 0.25) % 1),
        x: FARM[0] - 1.0 + (i === 3 ? 1.25 : i * 1.25), y: D0 + 0.49 + (i === 3 ? 0.95 : 0), z: FARM[2] + (i === 3 ? -0.05 : 0), w: 1.2, h: 0.97 });
      front(out, cam, t, 141, HUNT[4], "h4", FARM[0] + 1.15, FARM[2] + 1.7, { mode: "stand", expr: after(t, 45.98) ? "laugh" : "grin", prop: ["stick", 0], facing: -1 });
      for (let i = 0; i < 5; i++) rat(out, FARM[0] - 1.5 + ((t * 0.9 + i * 0.7) % 3.4), FARM[2] + 2.0 + (i % 2) * 0.5, { tail: true, run: t * 3 + i, dir: 1 });
    }
  },
  11: (cam, t, out) => { // el mejor negocio de Hanói
    table(out);
    const end = after(t, 50.06);
    official(out, cam, t, end ? "shock" : "nervous", null, 1);
    if (Math.floor(t * 2.2) % 2 === 0) out.fx.push({ key: "sweat", cw: 120, ch: 130, draw: fxSweat, x: OX + 0.38, y: D0 + 2.12, z: OZ + 0.2, w: 0.13, h: 0.14 });
    out.fx.push({ key: "tails16", cw: 600, ch: 360, draw: (p) => fxTails(p, 46), x: TABLE[0] + 0.2, y: D0 + 1.13, z: TABLE[2] + 0.1, w: 1.3, h: 0.78 });
    for (let i = 0; i < 6; i++) {
      const x = OX + 1.6 + i * 1.05, z = OZ + 1.15 + i * 0.32;
      front(out, cam, t, 150 + i, HUNT[i], `h${i}`, x, z, { mode: "stand", expr: end ? (i % 2 ? "laugh" : "grin") : "grin", facing: -1 });
      out.fx.push({ key: "sack", cw: 300, ch: 340, draw: fxSack, x: x + 0.45, y: D0 + 0.34, z: z + 0.3, w: 0.58, h: 0.66 });
    }
  },
};

/** everything with a face in shot `id` at time t */
export const stage = (id: number, t: number, _b: BridgeState, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  LNAME = SHOTS[id - 1].light;
  findSun(cam, SUN);
  fxN = 0;
  S[id]?.(cam, t, out);
  return out;
};
export const SIGN_AT: V3 = [0, -50, 0];
export { FPS };
