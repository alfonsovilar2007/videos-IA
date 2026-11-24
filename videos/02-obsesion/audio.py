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

# ------------------------------------------------ música oscura: piano grave, chelos, latido que crece
BPM = 64; BEAT = 60 / BPM; BAR = 4 * BEAT
PROG = [(50, [62, 65, 69]), (46, [62, 65, 70]), (43, [62, 67, 70]), (45, [61, 64, 69])]   # Dm Bb Gm A
INT = {"GANCHO": .35, "EL ENEMIGO": .45, "PROMESA": .6, "RE-GANCHO": .25, "REPASO": .9, "CIERRE": 1.0}
secs = ev["secciones"]
def intensidad(t):
    v = .6
    for s in secs:
        if s["t"] - 0.5 <= t: v = INT.get(s["nombre"], .85 if "VERDAD 6" in s["nombre"] else .6 + 0.04 * secs.index(s))
    return min(v, 1.0)
def piano(m, d=3.0):
    n = int(d * SR); x = np.arange(n) / SR; f = nota(m)
    s = sum(np.sin(2 * np.pi * f * h * x * (1 + 0.0005 * h)) / h ** 1.4 * np.exp(-x * (0.9 + 0.8 * h)) for h in range(1, 7))
    return lp(s * (1 - np.exp(-x * 200)), 2500)
def chelo(m, d):
    n = int(d * SR); x = np.arange(n) / SR; s = np.zeros(n); f = nota(m)
    for det in (-0.002, 0.003):
        ff = f * (1 + det) * (1 + 0.004 * np.sin(2 * np.pi * 5.2 * x)); s += 2 * ((np.cumsum(ff) / SR) % 1) - 1
    return lp(s, 900) * np.minimum(1, x / 1.5) * np.minimum(1, (d - x) / 1.0) * 0.05
def latido():
    n = int(0.6 * SR); x = np.arange(n) / SR; out = np.zeros(n)
    for t0, g in ((0, 1.0), (0.22, 0.7)):
        i = int(t0 * SR); m = n - i; xx = np.arange(m) / SR
        out[i:] += g * np.sin(2 * np.pi * (48 + 40 * np.exp(-xx * 30)) * xx) * np.exp(-xx * 9)
    return out
LAT = latido(); cache_p = {}
def P(m):
    if m not in cache_p: cache_p[m] = piano(m)
    return cache_p[m]
mus = np.zeros(N); drums = np.zeros(N)
nb = int(DUR / BAR) + 1
for b in range(nb):
    t0 = b * BAR; I = intensidad(t0 + 0.01); raiz, ac = PROG[b % 4]
    add(mus, t0, chelo(raiz - 12, BAR + 1.2), 0.8 + 1.4 * I)
    if I > .5: add(mus, t0, chelo(ac[0] - 12, BAR + 1.2), 0.5 * I)
    for q, m in enumerate([ac[0] + 12, ac[2], ac[1] + 12, ac[2]]):   # motivo de piano lento
        add(mus, t0 + q * BEAT, P(m), 0.10 + 0.05 * I)
    add(mus, t0, P(raiz), 0.12)
    if I >= .45:
        for q in range(4): add(drums, t0 + q * BEAT, LAT, 0.35 + 0.35 * I)
    if I >= .85: add(drums, t0, boom(), 0.25)

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
# efectos dramáticos de la voz: silencios con golpe y frenazo de cinta
efs = json.load(open(f"{TMP}/tiempos.json")).get("efectos", [])
for e in efs:
    t = e["t"]; i0 = int((t - 1.0) * SR); i1 = int(t * SR)
    if e["tipo"] == "silencio":
        f = int(0.08 * SR); musica[i0:i0 + f] *= np.linspace(1, 0, f); musica[i0 + f:i1] = 0
        rampa = int(0.6 * SR); musica[i1:i1 + rampa] *= np.linspace(0, 1, rampa)
        add(musica, t - 0.05, boom(), 0.9)
    elif e["tipo"] == "frenazo":
        d = int(0.8 * SR); a0 = i1 - d; seg = musica[a0:i1].copy()
        vel = np.linspace(1, 0.05, d); pos = np.cumsum(vel); pos = np.clip(pos, 0, d - 1)
        musica[a0:i1] = np.interp(pos, np.arange(d), seg) * np.linspace(1, 0.3, d)
        musica[i1:i1 + int(1.0 * SR)] = 0
        rampa = int(1.2 * SR); musica[i1 + int(1.0 * SR):i1 + int(1.0 * SR) + rampa] *= np.linspace(0, 1, rampa)
fade_out = int(3 * SR); musica[int((DUR - 3) * SR):int(DUR * SR)] *= np.linspace(1, 0, fade_out); musica[int(DUR * SR):] = 0

# ------------------------------------------------ efectos
sfx = np.zeros(N)
for c in ev["cortes"]:
    if c["t"] > 1.5 and not c["titulo"] and rs.random() < 0.55: add(sfx, c["t"] - 0.22, whoosh(), 0.18)
def tic():
    n = int(0.05 * SR); return hp(rs.standard_normal(n), 3000) * env_exp(n, 0.006)
TIC = tic()
for t in ev.get("tics", []): add(sfx, t, TIC, 0.35)
# ambiente: crepitar de brasas muy suave
amb = np.zeros(N); k = 0
while k < N:
    k += int(SR * (0.03 + 0.25 * rs.random())); n = int(0.01 * SR)
    if k + n < N: amb[k:k + n] += hp(rs.standard_normal(n), 2000) * env_exp(n, 0.002) * (0.2 + 0.8 * rs.random())
sfx += amb * 0.08 + lp(rs.standard_normal(N), 250) * 0.01

def guardar(nombre, x):
    x = np.clip(x / max(1e-9, np.abs(x).max()) * 0.9, -1, 1)
    from wave import open as wopen
    with wopen(f"{TMP}/{nombre}", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
guardar("musica.wav", musica); guardar("sfx.wav", sfx)

# ------------------------------------------------ mezcla con ffmpeg
fc = (
    "[0]highpass=f=65,equalizer=f=160:t=q:w=1:g=2.5,equalizer=f=380:t=q:w=1.2:g=-2,equalizer=f=3500:t=q:w=1:g=2.5,highshelf=f=10000:g=1.5,deesser=i=0.4,"
    "acompressor=threshold=-24dB:ratio=4:attack=4:release=90:makeup=5dB,asoftclip=type=atan:param=1.1,asplit=3[voz][sc1][sc2];"
    "[1]volume=-18dB[m];[2]volume=-6dB[s];"
    "[m][sc1]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[md];"
    "[s][sc2]sidechaincompress=threshold=0.05:ratio=4:attack=10:release=250[sd];"
    "[voz][md][sd]amix=inputs=3:normalize=0,alimiter=limit=0.9,loudnorm=I=-14:TP=-1.5:LRA=11[o]"
)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{TMP}/voz.wav", "-i", f"{TMP}/musica.wav", "-i", f"{TMP}/sfx.wav",
                "-filter_complex", fc, "-map", "[o]", "-ar", "48000", "-ac", "2", f"{TMP}/mezcla.wav"], check=True)
print("mezcla lista")
