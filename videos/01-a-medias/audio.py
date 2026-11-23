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

# ------------------------------------------------ música: beat trap motivacional con gancho melódico
BPM = 84; BEAT = 60 / BPM; BAR = 4 * BEAT; S16 = BEAT / 4
# Re menor: Dm  Bb  F  C
ACORDES = [(50, [62, 65, 69]), (46, [62, 65, 70]), (53, [60, 65, 69]), (48, [60, 64, 67])]
# gancho: 8 corcheas por compás (None = silencio), se repite cada 4 compases
GANCHO = [[74, None, 77, None, 81, 79, 77, None],
          [74, None, 77, None, 82, 81, 79, None],
          [77, None, 81, None, 84, 81, 79, 77],
          [79, None, 76, None, 72, None, 74, None]]
INT = {"GANCHO": .5, "RE-GANCHO": .25, "REPASO": 1.0, "CIERRE": 1.0}
secs = ev["secciones"]
def intensidad(t):
    v = .85
    for s in secs:
        if s["t"] - 0.5 <= t: v = INT.get(s["nombre"], 1.0 if "REGLA 7" in s["nombre"] else .85)
    return v
def pluck(f, d=0.55):
    n = int(d * SR); x = np.arange(n) / SR; out = np.zeros(n)
    for h in range(1, 9): out += np.sin(2 * np.pi * f * h * x) / h * np.exp(-x * (5 + 7 * h))
    return out * (1 - np.exp(-x * 400))
def b808(f, d=0.9):
    n = int(d * SR); x = np.arange(n) / SR
    fr = f * (1 + 1.5 * np.exp(-x * 40)); s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x * 2.6)
    return np.tanh(s * 2.2) * 0.8
def clap():
    n = int(0.3 * SR); x = rs.standard_normal(n); e = np.zeros(n)
    for k in (0, 0.011, 0.022): i = int(k * SR); e[i:] += np.exp(-np.arange(n - i) / (0.012 * SR))
    e += np.exp(-np.arange(n) / (0.09 * SR)) * 0.5
    return bp(x, 900, 5000) * e
def hat_o(): n = int(0.35 * SR); return hp(rs.standard_normal(n), 6000) * env_exp(n, 0.12)

mus = np.zeros(N); drums = np.zeros(N)
P808 = [0, 6, 10]; nb = int(DUR / BAR) + 1
PK, PH, PC, PHO = pluck, hat(), clap(), hat_o()
cache_pl = {}
for b in range(nb):
    t0 = b * BAR; I = intensidad(t0 + 0.01)
    raiz, notas = ACORDES[b % 4]
    n = int(BAR * SR); tt = np.arange(n) / SR
    pad = np.zeros(n)
    for m in notas:
        for det in (-0.004, 0.005): f = nota(m) * (1 + det); pad += 2 * ((tt * f) % 1) - 1
    fade = np.minimum(1, np.minimum(tt / 0.2, (BAR - tt) / 0.2))
    add(mus, t0, lp(pad, 700 + 900 * I) * 0.035 * fade)
    # melodía gancho (siempre: es lo que engancha); octava extra en el cierre
    for q, m in enumerate(GANCHO[b % 4]):
        if m is None: continue
        if m not in cache_pl: cache_pl[m] = pluck(nota(m))
        add(mus, t0 + q * BEAT / 2, cache_pl[m], 0.16)
        if I >= 1.0: add(mus, t0 + q * BEAT / 2, pluck(nota(m + 12), 0.35), 0.06)
    if I < .4:  # parte tranquila: solo colchón, melodía y un bajo largo
        add(mus, t0, np.sin(2 * np.pi * nota(raiz - 12) * tt) * 0.2 * fade); continue
    for q in P808:
        add(drums, t0 + q * S16, b808(nota(raiz - 12)), 0.55)
        add(drums, t0 + q * S16, kick(), 0.6)
    if I >= .6:
        add(drums, t0 + 8 * S16, PC, 0.55)
        for q in range(16):
            if q == 14: add(drums, t0 + q * S16, PHO, 0.12); continue
            add(drums, t0 + q * S16, PH, 0.16 if q % 2 == 0 else 0.1)
        if b % 2 == 1:  # redoble de charles en el último tiempo
            for r in range(6): add(drums, t0 + 12 * S16 + r * (BEAT / 6), PH, 0.12)
    else:
        for q in (4, 12): add(drums, t0 + q * S16, PC, 0.3)

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
    "[1]volume=-12dB[m];[2]volume=-6dB[s];"
    "[m][sc1]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[md];"
    "[s][sc2]sidechaincompress=threshold=0.05:ratio=4:attack=10:release=250[sd];"
    "[voz][md][sd]amix=inputs=3:normalize=0,alimiter=limit=0.9,loudnorm=I=-14:TP=-1.5:LRA=11[o]"
)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{TMP}/voz.wav", "-i", f"{TMP}/musica.wav", "-i", f"{TMP}/sfx.wav",
                "-filter_complex", fc, "-map", "[o]", "-ar", "48000", "-ac", "2", f"{TMP}/mezcla.wav"], check=True)
print("mezcla lista")
