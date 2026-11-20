"""Genera un short vertical completo a partir de un guion JSON. 100 % gratis y local.

    /opt/shorts-venv/bin/python shorts/generar.py guiones/mi_short.json

Pasos:
  1. Voz: Chatterbox Multilingual (natural) o Kokoro (rápida), por escena.
  2. Tiempos de cada palabra con faster-whisper (subtítulos y gestos).
  3. Fondos con SDXL-Turbo + mapa de profundidad con Depth Anything V2.
  4. Escenario 3D: la imagen se convierte en malla 3D y una cámara se mueve por ella (three.js en Chromium).
  5. Muñecos 2D articulados (rig.py) pegados al suelo 3D, subtítulos palabra a palabra y montaje con ffmpeg.
Salida en salida/<nombre>/: short.mp4, subtitulos.srt, titulo.txt, vista_previa.jpg
"""
import json, sys, os, re, math, hashlib, subprocess, unicodedata, difflib, time, shutil
from pathlib import Path
from multiprocessing import Pool
import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont, ImageFilter

RAIZ = Path(__file__).resolve().parent
REPO = RAIZ.parent
sys.path.insert(0, str(RAIZ))

ANCHO, ALTO, FPS, SR = 1080, 1920, 30, 24000
FUENTE = str(RAIZ / "fuentes" / "Nunito.ttf")
CACHE = REPO / ".cache_fondos"
PY_VOZ = "/opt/voz-venv/bin/python"
SUFIJO_FONDO = (", stylized 3D render, video game art style, vibrant saturated colors, cinematic lighting, "
                "volumetric light, highly detailed, wide shot, open empty ground in the center foreground, "
                "empty scene, no people, no characters, no text")
PAUSA = 0.12
CAMARAS = ["avance", "orbita", "paneo_der", "grua", "avance", "paneo_izq", "orbita", "retroceso"]


def log(*a):
    print("[short]", *a, flush=True)


# ================================================================ 1. voz
def generar_voz(g, escenas, tmp):
    motor = g.get("motor_voz", "chatterbox")
    trozos = []
    if motor == "chatterbox" and Path(PY_VOZ).exists():
        pet = dict(textos=[e["texto"] for e in escenas],
                   referencia=str(REPO / g.get("voz_referencia", "shorts/voces/narrador.wav")),
                   expresividad=g.get("expresividad", 0.6), cfg=g.get("cfg", 0.4), salida=str(tmp / "voz"))
        (tmp / "voz.json").write_text(json.dumps(pet, ensure_ascii=False), encoding="utf-8")
        subprocess.run([PY_VOZ, str(RAIZ / "voz_chatterbox.py"), str(tmp / "voz.json")], check=True)
        for i in range(len(escenas)):
            a, sr = sf.read(tmp / "voz" / f"escena_{i:02d}.wav", dtype="float32")
            assert sr == SR
            trozos.append(a)
    else:
        from kokoro import KPipeline
        tts = KPipeline(lang_code="e", repo_id="hexgrad/Kokoro-82M")
        for e in escenas:
            trozos.append(np.concatenate([r.audio.numpy() for r in tts(e["texto"], voice=g.get("voz", "em_alex"),
                                                                       speed=g.get("velocidad", 1.1))]))
    vel = g.get("velocidad_audio", 1.0)
    audio, tiempos, t = [], [], 0.0
    for a in trozos:
        tiempos.append((t, t + len(a) / SR))
        audio += [a, np.zeros(int(PAUSA * SR), dtype=np.float32)]
        t += len(a) / SR + PAUSA
    audio = np.concatenate(audio).astype(np.float32)
    if vel != 1.0:  # acelerar sin cambiar el tono
        sf.write(tmp / "v0.wav", audio, SR)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp / "v0.wav"), "-af", f"atempo={vel}",
                        str(tmp / "v1.wav")], check=True)
        audio, _ = sf.read(tmp / "v1.wav", dtype="float32")
        tiempos = [(a / vel, b / vel) for a, b in tiempos]
    return audio, tiempos


# ================================================================ 2. palabras
def _norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9ñ]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def tiempos_palabras(audio, escenas, tiempos):
    """Tiempo de cada palabra DEL GUION alineando con lo que oye Whisper."""
    from faster_whisper import WhisperModel
    from scipy.signal import resample_poly
    modelo = WhisperModel("small", device="cpu", compute_type="int8")
    salida = []
    for e, (t0, t1) in zip(escenas, tiempos):
        trozo = resample_poly(audio[int(t0 * SR):int(t1 * SR)], 2, 3).astype(np.float32)
        segs, _ = modelo.transcribe(trozo, language="es", word_timestamps=True)
        oidas = [w for s in segs for w in s.words]
        guion = e["texto"].split()
        sm = difflib.SequenceMatcher(a=[_norm(w) for w in guion], b=[_norm(w.word) for w in oidas], autojunk=False)
        ini = [None] * len(guion)
        for blq in sm.get_matching_blocks():
            for k in range(blq.size):
                ini[blq.a + k] = oidas[blq.b + k].start
        dur = t1 - t0
        conocidos = [(i, v) for i, v in enumerate(ini) if v is not None] or [(0, 0.0)]
        for i in range(len(guion)):
            if ini[i] is None:
                antes = [(j, v) for j, v in conocidos if j < i]
                despues = [(j, v) for j, v in conocidos if j > i]
                ja, va = antes[-1] if antes else (-1, 0.0)
                jd, vd = despues[0] if despues else (len(guion), dur)
                ini[i] = va + (vd - va) * (i - ja) / (jd - ja)
        for i, w in enumerate(guion):
            fin = ini[i + 1] if i + 1 < len(guion) else dur
            salida.append((t0 + ini[i], t0 + max(fin, ini[i] + 0.08), w))
    return salida


def escribir_srt(palabras, ruta, por_linea=4):
    def ts(t):
        h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
        return f"{h:02d}:{m:02d}:{int(s):02d},{int(s % 1 * 1000):03d}"
    with open(ruta, "w", encoding="utf-8") as f:
        for n, i in enumerate(range(0, len(palabras), por_linea), 1):
            gr = palabras[i:i + por_linea]
            f.write(f"{n}\n{ts(gr[0][0])} --> {ts(gr[-1][1])}\n{' '.join(w for _, _, w in gr)}\n\n")


# ================================================================ 3. fondos + profundidad
def generar_fondos(escenas):
    CACHE.mkdir(exist_ok=True)
    rutas, pendientes = [], []
    for e in escenas:
        prompt = e["fondo"] + SUFIJO_FONDO
        r = CACHE / (hashlib.md5(prompt.encode()).hexdigest()[:16] + ".png")
        rutas.append(r)
        if not r.exists() and (prompt, r) not in pendientes:
            pendientes.append((prompt, r))
    if pendientes:
        import torch
        from diffusers import AutoPipelineForText2Image
        torch.set_num_threads(os.cpu_count() or 4)
        pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float32)
        pipe.set_progress_bar_config(disable=True)
        for k, (prompt, r) in enumerate(pendientes, 1):
            t = time.time()
            pipe(prompt, num_inference_steps=2, guidance_scale=0.0, width=576, height=1024).images[0].save(r)
            log(f"   fondo {k}/{len(pendientes)} ({time.time() - t:.0f}s)")
        del pipe
    # profundidad
    prof = [r.with_name(r.stem + "_prof.png") for r in rutas]
    if any(not p.exists() for p in prof):
        from transformers import pipeline
        dp = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device="cpu")
        for r, p in zip(rutas, prof):
            if p.exists():
                continue
            im = Image.open(r)
            d = np.array(dp(im)["depth"].resize(im.size, Image.BILINEAR), dtype=np.float32)
            d = (d - d.min()) / (d.max() - d.min() + 1e-6)
            Image.fromarray((d * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)).save(p)
    return rutas, prof


# ================================================================ efectos de sonido
def whoosh(dur=0.35):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    ruido = np.random.default_rng(1).standard_normal(n)
    out, acc = np.zeros(n), 0.0
    for i in range(n):
        acc += (0.02 + 0.25 * t[i]) * (ruido[i] - acc)
        out[i] = acc
    return (out * np.sin(np.pi * t) ** 2 / (np.abs(out).max() + 1e-9) * 0.16).astype(np.float32)


# ================================================================ 5. composición (en paralelo)
_W = {}


def _ini_worker(estado):
    _W.update(estado)
    _W["pjs"] = {}
    f = ImageFont.truetype(FUENTE, 118); f.set_variation_by_name("Black")
    _W["fuente"] = f


def _personajes_escena(ie):
    if ie not in _W["pjs"]:
        from rig import Personaje
        e = _W["escenas"][ie]
        t0, t1 = _W["limites"][ie]
        pal = [(a - t0, w) for a, b, w in _W["palabras"] if t0 <= a < t1]
        lista = []
        for j, p in enumerate(e.get("personajes", [])):
            p = dict(p)
            p.setdefault("habla", j == 0)
            lista.append(Personaje(p, semilla=ie * 10 + j, duracion=t1 - t0, palabras=pal if p["habla"] else ()))
        _W["pjs"][ie] = lista
    return _W["pjs"][ie]


def dibujar_palabra(img, palabra, edad):
    escala = 1.0 + 0.18 * max(0.0, 1 - edad / 0.12)
    f = _W["fuente"].font_variant(size=int(118 * escala))
    f.set_variation_by_name("Black")
    d = ImageDraw.Draw(img)
    caja = d.textbbox((0, 0), palabra, font=f, stroke_width=12)
    w, h = caja[2] - caja[0], caja[3] - caja[1]
    if w > ANCHO - 80:
        f = f.font_variant(size=int(118 * escala * (ANCHO - 80) / w)); f.set_variation_by_name("Black")
        caja = d.textbbox((0, 0), palabra, font=f, stroke_width=12); w, h = caja[2] - caja[0], caja[3] - caja[1]
    x, y = (ANCHO - w) // 2 - caja[0], int(ALTO * 0.66) - h // 2 - caja[1]
    d.text((x + 6, y + 9), palabra, font=f, fill=(0, 0, 0, 150), stroke_width=12, stroke_fill=(0, 0, 0, 150))
    d.text((x, y), palabra, font=f, fill=(255, 255, 255, 255), stroke_width=12, stroke_fill=(15, 15, 25, 255))


def componer_frame(k):
    W = _W
    t = k / FPS
    ie = max(i for i, (a, _) in enumerate(W["limites"]) if a <= t + 1e-6)
    t0, t1 = W["limites"][ie]
    kf = min(int(round((t - t0) * FPS)), W["nframes"][ie] - 1)
    fondo = Image.open(Path(W["dir3d"]) / f"{ie:02d}" / f"{kf:05d}.jpg").convert("RGBA")
    anclas = W["anclas"][ie][kf]
    e = W["escenas"][ie]
    voz = float(W["voz"][min(k, len(W["voz"]) - 1)])
    capa = Image.new("RGBA", fondo.size, (0, 0, 0, 0))
    ds = ImageDraw.Draw(capa)
    sprites = []
    for j, (p, pj) in enumerate(zip(e.get("personajes", []), _personajes_escena(ie))):
        ia = W["indice_ancla"][ie][j]
        u, v, esc = anclas[ia]
        if p.get("accion") == "caminar":  # interpola entre el ancla de salida y la de llegada
            u2, v2, esc2 = anclas[ia + 1]
            s_ = min(1, (t - t0) / max(0.1, t1 - t0))
            u, v, esc = u + (u2 - u) * s_, v + (v2 - v) * s_, esc + (esc2 - esc) * s_
        im, (fx, fy) = pj.frame(t - t0, voz if p.get("habla", j == 0) else 0.0)
        tam = p.get("escala", 1.0 if len(e.get("personajes", [])) == 1 else 0.8) * esc
        im = im.resize((int(im.width * tam), int(im.height * tam)), Image.BILINEAR)
        px, py = u * ANCHO - fx * tam, v * ALTO - fy * tam
        # sombra de contacto en el suelo
        sw, sh = 190 * tam, 38 * tam
        ds.ellipse((u * ANCHO - sw, v * ALTO - sh, u * ANCHO + sw, v * ALTO + sh * 0.7), fill=(0, 0, 0, 110))
        sprites.append((v, im, int(px), int(py)))
    fondo.alpha_composite(capa.filter(ImageFilter.GaussianBlur(12)))
    for _, im, px, py in sorted(sprites, key=lambda s: s[0]):  # el más cercano (más abajo) delante
        fondo.alpha_composite(im, (px, py))
    # subtítulo
    pal = W["palabras"]
    iw = max([i for i, (a, _, _) in enumerate(pal) if a <= t] or [0])
    if pal[iw][0] <= t <= pal[iw][1] + 0.25:
        dibujar_palabra(fondo, pal[iw][2], t - pal[iw][0])
    # destello suave en cada corte
    if ie > 0 and t - t0 < 0.08:
        fondo = Image.blend(fondo, Image.new("RGBA", fondo.size, (255, 255, 255, 255)), 0.35 * (1 - (t - t0) / 0.08))
    fondo.convert("RGB").save(Path(W["dirout"]) / f"{k:05d}.jpg", quality=94)
    return k


# ================================================================ principal
def render(guion_path):
    t_ini = time.time()
    g = json.load(open(guion_path, encoding="utf-8"))
    nombre = Path(guion_path).stem
    out = REPO / "salida" / nombre
    tmp = out / "tmp"
    shutil.rmtree(tmp, ignore_errors=True)
    tmp.mkdir(parents=True)
    escenas = g["escenas"]

    log("1/6 voz…")
    audio, tiempos = generar_voz(g, escenas, tmp)
    log("2/6 tiempos de palabras…")
    palabras = tiempos_palabras(audio, escenas, tiempos)
    escribir_srt(palabras, out / "subtitulos.srt")
    log("3/6 fondos y profundidad…")
    fondos, profs = generar_fondos(escenas)

    total = len(audio) / SR + 0.5
    limites = [(0.0 if i == 0 else t0, tiempos[i + 1][0] if i + 1 < len(tiempos) else total)
               for i, (t0, _) in enumerate(tiempos)]

    log("4/6 escenario 3D…")
    plan_esc, indice_ancla = [], []
    for i, (e, f, p) in enumerate(zip(escenas, fondos, profs)):
        anclas, idx = [], []
        pjs = e.get("personajes", [])
        for j, pj in enumerate(pjs):
            x = pj.get("x", 0.5 if len(pjs) == 1 else 0.3 + 0.4 * j / max(1, len(pjs) - 1))
            y = pj.get("y", 0.9)
            idx.append(len(anclas))
            if pj.get("accion") == "caminar":
                anclas += [[pj.get("desde", x - 0.25), y], [pj.get("hasta", x + 0.25), y]]
            else:
                anclas.append([x, y])
        indice_ancla.append(idx)
        a, b = limites[i]
        plan_esc.append(dict(imagen=str(f), profundidad=str(p), frames=int(math.ceil((b - a) * FPS)) + 1,
                             duracion=b - a, movimiento=e.get("camara", CAMARAS[i % len(CAMARAS)]),
                             intensidad=e.get("intensidad_camara", 1.0), particulas=e.get("particulas", "polvo"),
                             anclas=anclas or [[0.5, 0.9]], salida=str(tmp / "3d" / f"{i:02d}")))
    (tmp / "plan3d.json").write_text(json.dumps(dict(ancho=ANCHO, alto=ALTO, fps=FPS, escenas=plan_esc)))
    subprocess.run(["node", str(RAIZ / "motor3d" / "render.js"), str(tmp / "plan3d.json")], check=True)
    anclas_frames = [json.load(open(Path(pe["salida"]) / "anclas.json")) for pe in plan_esc]

    # volumen de voz por frame (0..1) para la boca y la cabeza
    nfr = int(total * FPS)
    rms = np.array([np.sqrt(np.mean(audio[int(k / FPS * SR):int((k + 1) / FPS * SR)] ** 2) + 1e-12)
                    if int(k / FPS * SR) < len(audio) else 0.0 for k in range(nfr)])
    ref = np.percentile(rms[rms > 0.005], 95) if (rms > 0.005).any() else 1.0
    voz = np.clip(rms / ref, 0, 1)
    voz = np.convolve(voz, [0.25, 0.5, 0.25], mode="same")

    log(f"5/6 componiendo {nfr} frames en paralelo…")
    dirout = tmp / "frames"; dirout.mkdir()
    estado = dict(escenas=escenas, limites=limites, palabras=palabras, anclas=anclas_frames, indice_ancla=indice_ancla,
                  nframes=[pe["frames"] for pe in plan_esc], voz=voz.tolist(), dir3d=str(tmp / "3d"), dirout=str(dirout))
    with Pool(os.cpu_count() or 4, initializer=_ini_worker, initargs=(estado,)) as pool:
        for n, _ in enumerate(pool.imap_unordered(componer_frame, range(nfr), chunksize=8)):
            if n % 150 == 0:
                log(f"   {n}/{nfr}")

    log("6/6 audio y vídeo final…")
    mezcla = np.zeros(int(total * SR), dtype=np.float32)
    mezcla[:len(audio)] += audio
    wh = whoosh()
    for t0, _ in limites[1:]:
        i = max(0, int((t0 - 0.2) * SR)); mezcla[i:i + len(wh)] += wh[:len(mezcla) - i]
    sf.write(tmp / "audio.wav", mezcla, SR)
    musica = g.get("musica")
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(dirout / "%05d.jpg"),
           "-i", str(tmp / "audio.wav")]
    if musica:
        cmd += ["-stream_loop", "-1", "-i", str(REPO / musica)]
        filtro = "[2:a]volume=0.12[m];[1:a][m]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]"
    else:
        filtro = "[1:a]loudnorm=I=-14:TP=-1.5:LRA=11[a]"
    cmd += ["-filter_complex", filtro, "-map", "0:v", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "19",
            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart",
            str(out / "short.mp4")]
    subprocess.run(cmd, check=True)

    with open(out / "titulo.txt", "w", encoding="utf-8") as f:
        f.write(g.get("titulo", nombre) + "\n\n" + g.get("descripcion", "") + "\n\n" + " ".join(g.get("hashtags", [])) + "\n")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(out / "short.mp4"), "-vf",
                    "fps=1/3,scale=270:-1,tile=6x2", "-frames:v", "1", str(out / "vista_previa.jpg")])
    if not g.get("conservar_temporales"):
        shutil.rmtree(tmp, ignore_errors=True)
    log(f"listo -> {out / 'short.mp4'} ({total:.1f}s de vídeo, {(time.time() - t_ini) / 60:.1f} min)")


if __name__ == "__main__":
    render(sys.argv[1])
