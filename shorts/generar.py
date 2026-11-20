"""Genera un short vertical completo a partir de un guion JSON. 100 % gratis y local.

    /opt/shorts-venv/bin/python shorts/generar.py guiones/mi_short.json

Salida en salida/<nombre>/: short.mp4, subtitulos.srt, titulo.txt
Herramientas: Kokoro (voz), faster-whisper (tiempos de palabras), SDXL-Turbo (fondos),
personaje.py (muñecos), Pillow + ffmpeg (montaje). Ver shorts/FORMATO_GUION.md.
"""
import json, sys, os, re, math, hashlib, subprocess, unicodedata, difflib, time
from pathlib import Path
import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont, ImageFilter

RAIZ = Path(__file__).resolve().parent
sys.path.insert(0, str(RAIZ))
from personaje import dibujar_personaje

ANCHO, ALTO, FPS, SR = 1080, 1920, 30, 24000
FUENTE = str(RAIZ / "fuentes" / "Nunito.ttf")
CACHE_FONDOS = RAIZ.parent / ".cache_fondos"
SUFIJO_FONDO = (", stylized 3D render, video game art style, vibrant saturated colors, cinematic lighting, "
                "volumetric light, highly detailed, wide shot, empty scene, no people, no characters, no text")
PAUSA = 0.18  # segundos de silencio entre escenas


def log(*a):
    print("[short]", *a, flush=True)


# ---------------------------------------------------------------- voz
def generar_voz(escenas, voz, velocidad):
    from kokoro import KPipeline
    tts = KPipeline(lang_code="e", repo_id="hexgrad/Kokoro-82M")
    trozos, tiempos, t = [], [], 0.0
    for e in escenas:
        a = np.concatenate([r.audio.numpy() for r in tts(e["texto"], voice=voz, speed=velocidad)])
        tiempos.append((t, t + len(a) / SR))
        trozos += [a, np.zeros(int(PAUSA * SR), dtype=np.float32)]
        t += len(a) / SR + PAUSA
    return np.concatenate(trozos).astype(np.float32), tiempos


# ---------------------------------------------------------------- subtítulos
def _norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9ñ]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def tiempos_palabras(audio, escenas, tiempos):
    """Tiempo de cada palabra DEL GUION (no de lo que oye Whisper), alineando ambas listas."""
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
        # rellenar huecos interpolando
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
            g = palabras[i:i + por_linea]
            f.write(f"{n}\n{ts(g[0][0])} --> {ts(g[-1][1])}\n{' '.join(w for _, _, w in g)}\n\n")


# ---------------------------------------------------------------- fondos
def generar_fondos(escenas):
    CACHE_FONDOS.mkdir(exist_ok=True)
    rutas, pendientes = [], []
    for e in escenas:
        prompt = e["fondo"] + SUFIJO_FONDO
        r = CACHE_FONDOS / (hashlib.md5(prompt.encode()).hexdigest()[:16] + ".png")
        rutas.append(r)
        if not r.exists():
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
            log(f"fondo {k}/{len(pendientes)} ({time.time() - t:.0f}s)")
    return rutas


# ---------------------------------------------------------------- efectos de sonido
def whoosh(dur=0.35):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    ruido = np.random.default_rng(1).standard_normal(n)
    # filtro paso-bajo móvil simple: suaviza más al principio -> barrido
    out = np.zeros(n)
    acc = 0.0
    for i in range(n):
        a = 0.02 + 0.25 * t[i]
        acc += a * (ruido[i] - acc)
        out[i] = acc
    env = np.sin(np.pi * t) ** 2
    return (out * env / (np.abs(out).max() + 1e-9) * 0.18).astype(np.float32)


# ---------------------------------------------------------------- composición
class Escena:
    def __init__(self, datos, fondo, t0, t1):
        self.t0, self.t1 = t0, t1
        bg = Image.open(fondo).convert("RGB")
        # ampliado un 12 % para el zoom lento
        self.bg = bg.resize((int(ANCHO * 1.12), int(ALTO * 1.12)), Image.LANCZOS)
        self.zoom_in = datos.get("zoom", "in") == "in"
        self.pjs = []
        n = len(datos.get("personajes", []))
        for i, p in enumerate(datos.get("personajes", [])):
            esc = p.get("escala", 1.15 if n == 1 else 0.95)
            x = p.get("x", 0.5 if n == 1 else (0.28 + 0.44 * i / max(1, n - 1)))
            sprites = []
            for boca in (False, True):
                im = dibujar_personaje(p.get("vestuario", "normal"), p.get("expresion", "neutral"), boca,
                                       p.get("pose", "normal"), p.get("mirar", 0))
                if p.get("voltear"):
                    im = im.transpose(Image.FLIP_LEFT_RIGHT)
                im = im.resize((int(im.width * esc), int(im.height * esc)), Image.LANCZOS)
                sombra = Image.new("RGBA", im.size, (0, 0, 0, 0))
                sombra.putalpha(im.getchannel("A").point(lambda a: int(a * 0.35)))
                sprites.append((im, sombra.filter(ImageFilter.GaussianBlur(10))))
            self.pjs.append(dict(sprites=sprites, x=x, habla=p.get("habla", i == 0), fase=i * 1.7,
                                 pie=p.get("y", 0.95)))

    def frame(self, t, voz_activa, abierta):
        d = (t - self.t0) / max(0.01, self.t1 - self.t0)
        z = 1.0 + 0.10 * (d if self.zoom_in else 1 - d)
        w, h = int(ANCHO * 1.12 / z), int(ALTO * 1.12 / z)
        x0, y0 = (self.bg.width - w) // 2, (self.bg.height - h) // 2
        img = self.bg.crop((x0, y0, x0 + w, y0 + h)).resize((ANCHO, ALTO), Image.BILINEAR).convert("RGBA")
        entrada = min(1.0, (t - self.t0) / 0.2)
        for p in self.pjs:
            boca = p["habla"] and voz_activa and abierta
            im, sombra = p["sprites"][1 if boca else 0]
            bote = math.sin((t + p["fase"]) * 2 * math.pi * (2.2 if p["habla"] and voz_activa else 0.6)) * (8 if p["habla"] and voz_activa else 4)
            px = int(p["x"] * ANCHO - im.width / 2)
            py = int(p["pie"] * ALTO - im.height + bote + (1 - entrada) * 120)
            img.alpha_composite(sombra, (px + 14, py + 18))
            img.alpha_composite(im, (px, py))
        return img


def dibujar_palabra(img, palabra, edad):
    """Una palabra en pantalla, blanca con contorno negro, con un pequeño 'pop' al aparecer."""
    escala = 1.0 + 0.18 * max(0.0, 1 - edad / 0.12)
    f = ImageFont.truetype(FUENTE, int(118 * escala))
    f.set_variation_by_name("Black")
    d = ImageDraw.Draw(img)
    caja = d.textbbox((0, 0), palabra, font=f, stroke_width=12)
    w, h = caja[2] - caja[0], caja[3] - caja[1]
    if w > ANCHO - 80:  # palabras muy largas
        f = ImageFont.truetype(FUENTE, int(118 * escala * (ANCHO - 80) / w)); f.set_variation_by_name("Black")
        caja = d.textbbox((0, 0), palabra, font=f, stroke_width=12); w, h = caja[2] - caja[0], caja[3] - caja[1]
    x, y = (ANCHO - w) // 2 - caja[0], int(ALTO * 0.64) - h // 2 - caja[1]
    d.text((x + 6, y + 9), palabra, font=f, fill=(0, 0, 0, 150), stroke_width=12, stroke_fill=(0, 0, 0, 150))
    d.text((x, y), palabra, font=f, fill=(255, 255, 255, 255), stroke_width=12, stroke_fill=(15, 15, 25, 255))


def render(guion_path):
    g = json.load(open(guion_path, encoding="utf-8"))
    nombre = Path(guion_path).stem
    out = RAIZ.parent / "salida" / nombre
    out.mkdir(parents=True, exist_ok=True)
    escenas = g["escenas"]

    log("1/5 voz…")
    audio, tiempos = generar_voz(escenas, g.get("voz", "em_alex"), g.get("velocidad", 1.1))
    log("2/5 tiempos de palabras…")
    palabras = tiempos_palabras(audio, escenas, tiempos)
    escribir_srt(palabras, out / "subtitulos.srt")
    log("3/5 fondos…")
    fondos = generar_fondos(escenas)

    # pista de audio: voz + whoosh en cada corte (+ música opcional)
    total = len(audio) / SR + 0.4
    mezcla = np.zeros(int(total * SR), dtype=np.float32)
    mezcla[:len(audio)] += audio
    wh = whoosh()
    for t0, _ in tiempos[1:]:
        i = max(0, int((t0 - 0.2) * SR)); mezcla[i:i + len(wh)] += wh[:len(mezcla) - i]
    sf.write(out / "audio_tmp.wav", mezcla, SR)

    # actividad de voz por frame (para mover la boca)
    nfr = int(total * FPS)
    rms = np.array([np.sqrt(np.mean(audio[int(k / FPS * SR):int((k + 1) / FPS * SR)] ** 2) + 1e-12)
                    if int(k / FPS * SR) < len(audio) else 0 for k in range(nfr)])
    umbral = 0.25 * np.percentile(rms[rms > 0], 90) if (rms > 0).any() else 1

    log("4/5 componiendo frames…")
    objs = [Escena(e, f, t0, (tiempos[i + 1][0] if i + 1 < len(tiempos) else total))
            for i, (e, f, (t0, _)) in enumerate(zip(escenas, fondos, tiempos))]
    objs[0].t0 = 0.0
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                           "-s", f"{ANCHO}x{ALTO}", "-r", str(FPS), "-i", "-", "-i", str(out / "audio_tmp.wav"),
                           "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
                           "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                           "-shortest", "-movflags", "+faststart", str(out / "short.mp4")], stdin=subprocess.PIPE)
    ie, iw = 0, 0
    for k in range(nfr):
        t = k / FPS
        while ie + 1 < len(objs) and t >= objs[ie + 1].t0:
            ie += 1
        activa = rms[k] > umbral
        img = objs[ie].frame(t, activa, (k // 3) % 2 == 0)
        while iw + 1 < len(palabras) and t >= palabras[iw + 1][0]:
            iw += 1
        if palabras[iw][0] <= t <= palabras[iw][1] + 0.25:
            dibujar_palabra(img, palabras[iw][2], t - palabras[iw][0])
        # destello blanco breve en cada corte
        dt = t - objs[ie].t0
        if ie > 0 and dt < 0.1:
            img = Image.blend(img, Image.new("RGBA", img.size, (255, 255, 255, 255)), 0.5 * (1 - dt / 0.1))
        ff.stdin.write(img.convert("RGB").tobytes())
        if k % (FPS * 5) == 0:
            log(f"   {t:.0f}/{total:.0f}s")
    ff.stdin.close(); ff.wait()
    os.remove(out / "audio_tmp.wav")

    log("5/5 textos de publicación…")
    with open(out / "titulo.txt", "w", encoding="utf-8") as f:
        f.write(g.get("titulo", nombre) + "\n\n" + g.get("descripcion", "") + "\n\n" + " ".join(g.get("hashtags", [])) + "\n")
    # portada para revisar: fotogramas al 10/50/90 %
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(out / "short.mp4"), "-vf",
                    f"select='eq(n\\,{int(nfr*.1)})+eq(n\\,{int(nfr*.5)})+eq(n\\,{int(nfr*.9)})',scale=360:-1,tile=3x1",
                    "-frames:v", "1", str(out / "vista_previa.jpg")])
    log(f"listo -> {out / 'short.mp4'} ({total:.1f}s)")


if __name__ == "__main__":
    render(sys.argv[1])
