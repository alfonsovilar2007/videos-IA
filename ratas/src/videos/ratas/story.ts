// Timeline of the bridge short: shots timed to the the voice words (~/bridge-short/voice/words.json),
// story physics (column position, march phase, deck bounce, collapse) and the camera grammar measured in the
// reference study: continuous slow push-ins; symmetric ease-in-out moves ~23 f (10 in / 10 out), peak ~15 px/f at 720p;
export const TOTAL = 1545;
// big reframes are cuts; impacts are 7-frame kicks that flip sign every frame; no hand-held float.
export const FPS = 30;
export const D0 = 6.0; // bank top + deck height (m)
export const HALF = 27; // towers at z = +-27, span 54 m
export const FILES = [-1.65, -0.55, 0.55, 1.65];
export const ROW_GAP = 1.3;
export const COUNT = 74;
export const PARK: V3 = [70, D0, -75]; // swing pivot base (x, ground y, z)
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
const lin = (pts: [number, number][], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
};

// ---------------- story physics (tau = story time in seconds) ----------------
export const front = (tau: number) => 26 - 1.6 * (tau - 4.4); // z of the front row, marching toward -z
export const marchPhase = (tau: number) => ((tau % 1) + 1) % 1; // 1 Hz cycle = 2 steps/s, footfalls at 0 and 0.5
export const SNAP = 34.62, DROP0 = 36.35, DROP1 = 36.95;
export const amp = (tau: number) =>
  lin([[14.85, 0], [17.8, 0.07], [21.4, 0.13], [27.4, 0.26], [33.0, 0.46], [SNAP, 0.55], [SNAP + 0.35, 0.0]], tau);
export const stomp = (tau: number) => lin([[21.4, 1.0], [27.4, 1.35], [33, 1.5]], tau); // "a little harder every step"
export const shapeZ = (z: number) => (Math.abs(z) < HALF ? Math.cos((Math.PI * z) / (2 * HALF)) : 0);
export const dropW = (z: number) => smooth((20 - z) / 26); // 1 on the near half, 0 at the far tower
export const dropU = (tau: number) => (tau < DROP0 ? 0 : Math.min(1, ((tau - DROP0) / (DROP1 - DROP0)) ** 2));
export const DROP_H = 6.6;

export type BridgeState = { bounce: number; drop: number; snap: number; collapsed: boolean };
export const deckY = (z: number, b: BridgeState) => D0 + b.bounce * shapeZ(z) - b.drop * DROP_H * dropW(z);

// ---------------- shots ----------------
// ---------------- shots (Ratas de Hanói, voz en ../../public/ratas/palabras.json) ----------------
export type Light = "day" | "golden";
export type Crowd = "none";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd; tau: (t: number) => number; towns?: boolean; sunAz?: number; sunEl?: number };
const sh = (id: number, a: number, b: number, light: Light, extra: Partial<ShotDef> = {}): ShotDef => ({ id, a, b, light, crowd: "none", tau: (t) => t, ...extra });
export const SHOTS: ShotDef[] = [
  sh(1, 0, 150, "day"),      // gancho: el funcionario paga... y le rodean las ratas
  sh(2, 150, 297, "day"),    // Hanói, alcantarillas nuevas, orgullo
  sh(3, 297, 375, "day"),    // a las ratas también les encantan
  sh(4, 375, 493, "day"),    // cazadores, miles al día
  sh(5, 493, 667, "day"),    // oferta: un centavo por rata
  sh(6, 667, 729, "day"),    // trae la cola
  sh(7, 729, 864, "day"),    // la ciudad caza, colas por miles
  sh(8, 864, 1032, "day"),   // una rata sin cola... y otra, y otra
  sh(9, 1032, 1252, "golden", { sunAz: 140, sunEl: 16 }), // Fíjate: muerta = 1 centavo; viva = crías con cola
  sh(10, 1252, 1416, "golden", { sunAz: 140, sunEl: 16 }), // tijeras y granjas
  sh(11, 1416, TOTAL, "golden", { sunAz: 140, sunEl: 16 }), // remate
];
export const XFADE: Record<number, number> = { 9: 8, 11: 8 };
export const FLASH_AT = 150;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};
export const bridgeState = (_id: number, _t: number): BridgeState => ({ bounce: 0, drop: 0, snap: 0, collapsed: false });

// ---------------- places ----------------
export const TABLE: V3 = [-11.0, D0, -35.2];   // mesa de pago en el muelle, frente al río
export const OFFICIAL: V3 = [-11.0, D0, -35.95];
export const GRATE: V3 = [-17.0, D0, -33.6];    // alcantarilla nueva del muelle
export const GRATE2: V3 = [9.6, D0, -33.3];   // alcantarilla donde sueltan las ratas
export const STREET_Z = -58;
export const FARM: V3 = [58, D0, -62];

// ---------------- camera ----------------
// Grammar (motion.md): every move is a symmetric smootherstep glide of 18-40 f (peak speed = 1.875 x distance / dur,
// so dur >= 0.075 x the move in 720p px keeps the peak near the reference 14-25 px/f); a reframe bigger than about
// half a frame width or 40 % zoom is a hard cut on its key frame. Glides are centred on the old key frame (the
// whoosh in the sound mix peaks there), so a glide key starts dur/2 earlier. Holds push in (dolly toward the look
// point or a fov zoom near walls/towers): 0.15-0.35 %/f, ~0.6 %/f for ~35 f on the punch words. Rolls of 4-8 deg
// over >= 18 f on emphasis beats, held tilt <= 0.07 rad.
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
/** reference camera ease: symmetric smootherstep (attack = release, ~10 f each on a 23 f move) */
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const T = (f: number) => f / FPS;
const Fz = (id: number, f: number) => front(SHOTS[id - 1].tau(T(f)));
/** push-in factor since f0: the subject grows ~rate per frame; `punch` raises it (with 8 f soft edges) for the first n frames */
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
/** dolly push: camera slides toward the look point by factor k */
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
/** zoom push (camera stays put, for lenses next to towers / houses): tan(fov/2) shrinks by k */
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
/** a roll-only move on top of an existing framing */
const rolled = (s: (f: number) => Shot, roll: number) => (f: number): Shot => ({ ...s(f), roll });

// near-left anchorage where the bolt lives, and the free end of the snapped backstay
export const ANCHOR: V3 = [-2.7, D0 + 0.62, -37];
export const snapEnd = (snap: number): V3 => {
  const u = easeOut(snap);
  return [ANCHOR[0] - 0.6 * u, ANCHOR[1] + 5.5 * u - 2.0 * u * u, ANCHOR[2] + 4.5 * u];
};

// ---- framings (f -> camera); each pushes in from the frame its key starts. Word times in seconds from palabras.json ----
const [OX, , OZ] = OFFICIAL;
// 1 gancho: plano medio del funcionario en su mesa -> baja y abre cuando llegan las ratas ("más ratas" 3.74 s)
const S1a = (f: number) => dolly([OX + 0.7, D0 + 1.85, OZ + 4.3], [OX, D0 + 1.4, OZ + 0.3], pushK(f, 0, 0.003), { fov: 44 });
const S1b = (f: number) => dolly([OX + 2.2, D0 + 0.95, OZ + 6.4], [OX, D0 + 0.75, OZ + 0.6], pushK(f, 104, 0.0025), { fov: 46, roll: 0.04 });
// 2 Hanói: gran plano del muelle y el barrio francés -> se acerca a los funcionarios orgullosos junto a la alcantarilla
const S2a = (f: number) => zoom([-3, D0 + 8, -13], [-15, D0 + 2.0, -37], 46, pushK(f, 150, 0.0018));
const S2b = (f: number) => dolly([GRATE[0] + 3.0, D0 + 1.9, GRATE[2] + 6.4], [GRATE[0] - 0.4, D0 + 1.3, GRATE[2] - 0.6], pushK(f, 228, 0.0025, 0.006, 30), { fov: 40 });
// 3 rejilla a ras de suelo, las ratas salen
const S3a = (f: number) => dolly([GRATE[0] + 1.1, D0 + 0.5, GRATE[2] + 2.3], [GRATE[0], D0 + 0.12, GRATE[2] - 0.2], pushK(f, 297, 0.004, 0.008, 25), { fov: 42, roll: -0.03 });
// 4 calle: los cazadores avanzan hacia la cámara; "Miles de ratas al día" 15.06 s
const S4a = (f: number) => dolly([1.4, D0 + 1.35, STREET_Z + 8], [0, D0 + 1.25, STREET_Z - 4], pushK(f, 375, 0.0025), { fov: 40 });
const S4b = (f: number) => dolly([1.0, D0 + 0.7, STREET_Z + 7.5], [0, D0 + 0.6, STREET_Z + 1], pushK(f, 452, 0.003, 0.007, 30), { fov: 42, roll: 0.035 });
// 5 la oferta: desde detrás de la gente hacia el funcionario subido a su caja; golpe en "centavo" 20.82 s
const S5a = (f: number) => dolly([OX + 1.0, D0 + 2.1, OZ + 7.0], [OX, D0 + 2.0, OZ], pushK(f, 493, 0.002), { fov: 42 });
const S5b = (f: number) => dolly([OX + 0.5, D0 + 2.3, OZ + 4.4], [OX, D0 + 2.25, OZ], pushK(f, 612, 0.0025, 0.006, 30), { fov: 38, roll: -0.03 });
// 6 primer plano: la cola en alto
const S6a = (f: number) => dolly([OX + 0.3, D0 + 2.0, OZ + 3.1], [OX + 0.22, D0 + 1.95, OZ], pushK(f, 667, 0.003), { fov: 42 });
// 7 la ciudad caza (calle, la cámara sigue la carrera) -> la montaña de colas en la mesa
const S7a = (f: number) => { const u = glide((f - 729) / 70); return { pos: [-2.5 + 4 * u, D0 + 1.0, STREET_Z + 8.5] as V3, look: [-2.5 + 5 * u, D0 + 0.9, STREET_Z] as V3, fov: 44 }; };
const S7b = (f: number) => dolly([OX + 1.8, D0 + 1.6, OZ + 4.0], [OX, D0 + 1.3, OZ + 0.5], pushK(f, 800, 0.003), { fov: 40 });
// 8 calle, cámara baja: el funcionario ve pasar ratas sin cola ("sin cola" 31.96, "otra" 32.9, 33.82)
const S8a = (f: number) => dolly([0.6, D0 + 0.45, STREET_Z + 5.5], [0.3, D0 + 0.75, STREET_Z], pushK(f, 864, 0.0025), { fov: 46 });
const S8b = (f: number) => dolly([0.5, D0 + 0.35, STREET_Z + 4.4], [0.3, D0 + 0.8, STREET_Z], pushK(f, 980, 0.003, 0.007, 20), { fov: 44, roll: -0.04 });
// 9 Fíjate (atardecer): a ras de suelo, rata muerta / rata viva con crías
const S9a = (f: number) => dolly([10.1, D0 + 0.55, -31.6], [10.1, D0 + 0.3, -34.3], pushK(f, 1028, 0.0018), { fov: 46 });
const S9b = (f: number) => dolly([10.85, D0 + 0.5, -32.0], [10.85, D0 + 0.28, -34.3], pushK(f, 1166, 0.002, 0.006, 25), { fov: 44, roll: 0.03 });
// 10 tijeras junto a la segunda alcantarilla -> corte a la granja de las afueras ("granjas" 45.98)
const S10a = (f: number) => dolly([12.6, D0 + 1.3, -30.3], [11.4, D0 + 0.9, -34.2], pushK(f, 1252, 0.0025), { fov: 42 });
const S10b = (f: number) => dolly([FARM[0] + 1.6, D0 + 1.6, FARM[2] + 7.0], [FARM[0] + 0.3, D0 + 0.9, FARM[2]], pushK(f, 1335, 0.003, 0.006, 30), { fov: 44 });
// 11 remate: la fila de cazadores con sacos de colas, el funcionario sudando; empuje final
const S11a = (f: number) => dolly([OX + 6.5, D0 + 1.9, OZ + 5.6], [OX + 0.6, D0 + 1.4, OZ + 0.6], pushK(f, 1412, 0.002), { fov: 44 });
const S11b = (f: number) => dolly([OX + 1.6, D0 + 1.75, OZ + 3.4], [OX, D0 + 1.6, OZ], pushK(f, 1480, 0.003, 0.007, 40), { fov: 38, roll: 0.03 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }, { f: 104, dur: 22, s: S1b }],
  2: [{ f: 150, s: S2a }, { f: 228, cut: true, s: S2b }],
  3: [{ f: 297, s: S3a }],
  4: [{ f: 375, s: S4a }, { f: 452, dur: 24, s: S4b }],
  5: [{ f: 493, s: S5a }, { f: 612, dur: 24, s: S5b }],
  6: [{ f: 667, s: S6a }],
  7: [{ f: 729, s: S7a }, { f: 800, cut: true, s: S7b }],
  8: [{ f: 864, s: S8a }, { f: 980, dur: 20, s: S8b }],
  9: [{ f: 1028, s: S9a }, { f: 1166, dur: 26, s: S9b }],
  10: [{ f: 1252, s: S10a }, { f: 1335, cut: true, s: S10b }],
  11: [{ f: 1412, s: S11a }, { f: 1480, dur: 30, s: S11b }],
};

const KICKS: [number, number][] = [[3.74, 0.8], [20.82, 0.6], [31.96, 0.7], [32.9, 0.4], [33.82, 0.5], [40.04, 0.4], [42.72, 0.5]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
export const keyEnd = (id: number, f: number) => {
  let e = 0;
  for (const k of CAMS[id]) if (f >= k.f) e = k.f + (k.cut ? 0 : k.dur ?? 24);
  return Math.max(f, e);
};

// ---------------- lens ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 13 }, { f: 104, dur: 22, cInf: 10 }, { f: 150, cInf: 0 }, { f: 228, cInf: 10 }, { f: 297, cInf: 13 },
  { f: 375, cInf: 7 }, { f: 452, dur: 24, cInf: 10 }, { f: 493, cInf: 9 }, { f: 612, dur: 24, cInf: 12 }, { f: 667, cInf: 14 },
  { f: 729, cInf: 6 }, { f: 800, cInf: 11 }, { f: 864, cInf: 12 }, { f: 1028, cInf: 14 }, { f: 1252, cInf: 10 }, { f: 1335, cInf: 6 },
  { f: 1412, cInf: 8 }, { f: 1480, dur: 30, cInf: 13 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
export const focusAt = (id: number, f: number): V3 => {
  const d = dofAt(f);
  return d.focus ? d.focus(f) : camAt(id, f).look;
};
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [];
