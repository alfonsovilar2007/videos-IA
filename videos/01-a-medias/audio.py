"""Música épica + efectos sintetizados (sin derechos) y mezcla final.
Uso: python3 audio.py   (lee tmp/eventos.json y tmp/voz.wav, escribe tmp/mezcla.wav)"""
import json, os, subprocess
import numpy as np
from scipy.signal import butter, sosfilt

AQUI = os.path.dirname(os.path.abspath(__file__)); TMP = f"{AQUI}/tmp"
SR = 48000
ev = json.load(open(f"{TMP}/eventos.json"))
DUR = ev["total"]; N = int(DUR * SR) + SR
rs = np.random.default_rng(7)

def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], "band", fs=SR, output="sos"), x)
def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def add(buf, t, x, g=1.0):
    i = int(t * SR)
    if i >= len(buf) or i + len(x) <= 0: return
    j = min(len(buf), i + len(x)); buf[max(0, i):j] += g * x[max(0, -i):j - i]
def nota(n): return 440 * 2 ** ((n - 69) / 12)

# ------------------------------------------------ instrumentos
def kick():
    n = int(0.5 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 30); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env_exp(n, 0.16) + 0.3 * rs.standard_normal(n) * env_exp(n, 0.004)
def snare():
    n = int(0.35 * SR); t = np.arange(n) / SR
    return 0.6 * hp(rs.standard_normal(n), 1500) * env_exp(n, 0.07) + 0.5 * np.sin(2 * np.pi * 185 * t) * env_exp(n, 0.05)
def hat():
    n = int(0.08 * SR); return hp(rs.standard_normal(n), 7000) * env_exp(n, 0.015)
def tom(f0):
    n = int(0.6 * SR); t = np.arange(n) / SR; f = f0 * (1 + 0.6 * np.exp(-t * 25))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.22)
def boom():
    n = int(3.5 * SR); t = np.arange(n) / SR
    f = 32 + 90 * np.exp(-t * 6); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.9)
    return s + 0.5 * lp(rs.standard_normal(n), 400) * env_exp(n, 0.5)
def riser(d):
    n = int(d * SR); t = np.arange(n) / SR; k = t / d
    x = rs.standard_normal(n); out = np.zeros(n); paso = 2400
    for a in range(0, n, paso):  # barrido de filtro por bloques
        f = 300 + 6000 * (a / n) ** 2; out[a:a + paso] = bp(x[a:a + paso], f * 0.7, min(f * 1.3, 20000))
    return out * k ** 2 * 0.8
def whoosh():
    n = int(0.45 * SR); t = np.arange(n) / SR; k = t / 0.45
    x = rs.standard_normal(n); out = np.zeros(n); paso = 1200
    for a in range(0, n, paso):
        f = 400 + 3000 * np.sin(np.pi * a / n); out[a:a + paso] = bp(x[a:a + paso], f * 0.6, f * 1.4)
    return out * np.sin(np.pi * k) ** 2
def golpe():
    n = int(0.3 * SR); t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * (60 + 80 * np.exp(-t * 40)) * t) * env_exp(n, 0.07)
    slap = bp(rs.standard_normal(n), 800, 3500) * env_exp(n, 0.012)
    return 1.0 * thump + 0.7 * slap
def trueno():
    n = int(4 * SR); t = np.arange(n) / SR
    crack = hp(rs.standard_normal(n), 2000) * env_exp(n, 0.05)
    rumble = lp(rs.standard_normal(n), 180, 4) * (1 - np.exp(-t * 8)) * env_exp(n, 1.2) * 6
    return 0.4 * crack + rumble

# ------------------------------------------------ música
BPM = 92; BEAT = 60 / BPM; BAR = 4 * BEAT
# Re menor: Dm  Bb  F  C  (raíz, notas del acorde)
ACORDES = [(50, [62, 65, 69]), (46, [62, 65, 70]), (53, [60, 65, 69]), (48, [60, 64, 67])]
# intensidad por sección (0-1) en el orden del guion
INT = {"GANCHO": .55, "EL ENEMIGO": .6, "PROMESA": .75, "RE-GANCHO": .25, "REPASO": 1.0, "CIERRE": .9}
secs = ev["secciones"]
def intensidad(t):
    v = .8
    for s in secs:
        if s["t"] - 0.5 <= t: v = INT.get(s["nombre"], .85 if "REGLA 7" not in s["nombre"] else 1.0)
    return v

mus = np.zeros(N); drums = np.zeros(N)
nb = int(DUR / BAR) + 1
for b in range(nb):
    t0 = b * BAR; I = intensidad(t0 + 0.01)
    raiz, notas = ACORDES[b % 4]
    n = int(BAR * SR); tt = np.arange(n) / SR
    # colchón de cuerdas: sierras desafinadas
    pad = np.zeros(n)
    for m in notas + [notas[0] + 12]:
        for det in (-0.004, 0.0, 0.005):
            f = nota(m) * (1 + det); pad += 2 * ((tt * f) % 1) - 1
    pad = lp(pad, 900 + 1800 * I) * 0.05
    fade = np.minimum(1, np.minimum(tt / 0.25, (BAR - tt) / 0.25)); add(mus, t0, pad * fade)
    # bajo
    if I > .45:
        for q in range(8):
            ts = q * BEAT / 2; d = int(BEAT / 2 * SR); x = np.arange(d) / SR
            add(mus, t0 + ts, np.sin(2 * np.pi * nota(raiz - 12) * x) * env_exp(d, 0.18) * (0.35 if q % 2 == 0 else 0.2) * I)
    else:
        add(mus, t0, np.sin(2 * np.pi * nota(raiz - 12) * tt) * 0.25 * fade)
    # motivo de piano en la parte tranquila y el cierre
    if I < .4 or I >= .9:
        for q, m in enumerate([notas[2] + 12, notas[1] + 12, notas[0] + 12, notas[1] + 12]):
            d = int(1.5 * SR); x = np.arange(d) / SR
            tono = sum(np.sin(2 * np.pi * nota(m) * h * x) / h ** 1.5 for h in (1, 2, 3))
            add(mus, t0 + q * BEAT, tono * env_exp(d, 0.5) * 0.09)
    # batería
    if I > .5:
        for q in range(4):
            add(drums, t0 + q * BEAT, kick(), 0.9 if q in (0, 2) else (0.5 if I > .8 else 0))
            if I > .75 and q in (1, 3): add(drums, t0 + q * BEAT, snare(), 0.55)
        if I > .7:
            for q in range(8): add(drums, t0 + q * BEAT / 2, hat(), 0.18 if q % 2 else 0.1)
        if b % 4 == 3 and I > .7:
            for q, f in enumerate([150, 120, 95, 75]): add(drums, t0 + 3 * BEAT + q * BEAT / 4, tom(f), 0.5)

# riser + golpe en cada cambio de sección; golpe inicial
for s in secs[1:]:
    add(mus, s["t"] - 2.0, riser(2.0), 0.35)
    add(drums, s["t"] - 0.35, boom(), 0.9)
add(drums, 0.0, boom(), 1.0)
# la parte gris (regla 5): música filtrada mientras dura lo gris
gris = next((s for s in secs if "REGLA 5" in s["nombre"]), None)
if gris:
    sig = secs[secs.index(gris) + 1]["t"]
    a, z = int(gris["t"] * SR), int((sig - 6) * SR)
    mus[a:z] = lp(mus[a:z], 500); drums[a:z] *= 0.35
musica = mus + drums
fade_out = int(3 * SR); musica[int((DUR - 3) * SR):int(DUR * SR)] *= np.linspace(1, 0, fade_out); musica[int(DUR * SR):] = 0

# ------------------------------------------------ efectos
sfx = np.zeros(N)
for c in ev["cortes"]:
    if c["t"] > 0.3 and not c["titulo"]: add(sfx, c["t"] - 0.2, whoosh(), 0.35)
G = golpe()
for t in ev["golpes"]: add(sfx, t - 0.01, G, 0.55 * (0.85 + 0.3 * rs.random()))
for t in ev["truenos"]: add(sfx, t, trueno(), 0.45)
# lluvia de fondo según la sección
LLUVIA = [1, 1, 1, 1, 1, .9, 1, .6, .8, .9, .4, .2, 0]
lluvia = hp(lp(rs.standard_normal(N), 6000), 300) * 0.05
nivel = np.zeros(N)
for k, s in enumerate(secs):
    a = int(max(0, s["t"] - 0.4) * SR); nivel[a:] = LLUVIA[k] if k < len(LLUVIA) else 0
nivel = lp(nivel, 0.5, 1)
sfx += lluvia * nivel

def guardar(nombre, x):
    x = np.clip(x / max(1e-9, np.abs(x).max()) * 0.9, -1, 1)
    from wave import open as wopen
    with wopen(f"{TMP}/{nombre}", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
guardar("musica.wav", musica); guardar("sfx.wav", sfx)

# ------------------------------------------------ mezcla con ffmpeg
fc = (
    "[0]highpass=f=90,equalizer=f=3000:t=q:w=1:g=3,equalizer=f=200:t=q:w=1:g=2,"
    "acompressor=threshold=-20dB:ratio=4:attack=5:release=80:makeup=6dB,asplit=3[voz][sc1][sc2];"
    "[1]volume=-15dB[m];[2]volume=-6dB[s];"
    "[m][sc1]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[md];"
    "[s][sc2]sidechaincompress=threshold=0.05:ratio=4:attack=10:release=250[sd];"
    "[voz][md][sd]amix=inputs=3:normalize=0,alimiter=limit=0.9,loudnorm=I=-14:TP=-1.5:LRA=11[o]"
)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{TMP}/voz.wav", "-i", f"{TMP}/musica.wav", "-i", f"{TMP}/sfx.wav",
                "-filter_complex", fc, "-map", "[o]", "-ar", "48000", "-ac", "2", f"{TMP}/mezcla.wav"], check=True)
print("mezcla lista")
