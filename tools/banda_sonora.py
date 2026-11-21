"""Música original + efectos de sonido sintetizados para un short, sincronizados con la voz.
Todo se genera aquí (sin muestras externas), así que no hay problemas de derechos.

Uso: python3 tools/banda_sonora.py <carpeta_del_short>
Lee  voz_ritmo.json y eventos.json  ->  escribe musica.wav y efectos.wav (48 kHz estéreo).

eventos.json:
{ "cortes": [segundos...],                      # whoosh en cada cambio de plano
  "secciones": [[ini, fin, "tipo"], ...],        # tipo: tension | groove | climax | final | silencio
  "efectos": [[segundo, "nombre"], ...] }        # nombre: grieta | explosion | sello | desgarro | pop | ding | latido | subida
"""
import json, sys, numpy as np, subprocess

SR = 48000
rng = np.random.default_rng(7)
carpeta = sys.argv[1]
pal = json.load(open(f"{carpeta}/voz_ritmo.json", encoding="utf-8"))
ev = json.load(open(f"{carpeta}/eventos.json", encoding="utf-8"))
DUR = pal[-1]["t1"] + 1.6
N = int(DUR * SR) + SR
t_all = np.arange(N) / SR


def lowpass(x, fc):
    """Filtro paso bajo de un polo (fc puede ser un número o un array por muestra)."""
    a = np.exp(-2 * np.pi * np.broadcast_to(fc, x.shape) / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc; y[i] = acc
    return y


def env(n, att=.005, rel=.2):
    e = np.ones(n); a = max(1, int(att * SR)); e[:a] = np.linspace(0, 1, a)
    r = np.exp(-np.arange(n) / (rel * SR)); return e * r


def nota(f):  # nombre -> Hz
    nombres = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}
    n, o = f[:-1], int(f[-1]); return 440 * 2 ** ((nombres[n] + (o - 4) * 12) / 12)


def pluck(freq, dur=.5):
    """Cuerda pulsada (Karplus-Strong): suena a pizzicato."""
    n = int(dur * SR); p = max(2, int(SR / freq)); buf = rng.uniform(-1, 1, p); out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .996
    return out * env(n, .002, dur * .5)


def poner(dst, src, t, g=1.0):
    i = int(t * SR); j = min(len(dst), i + len(src))
    if i < len(dst) and j > i: dst[i:j] += src[:j - i] * g


# ---------------- MÚSICA ----------------
BPM = 104; beat = 60 / BPM
mus_L = np.zeros(N); mus_R = np.zeros(N)
secciones = ev["secciones"]
def tipo_en(t):
    for a, b, k in secciones:
        if a <= t < b: return k
    return "silencio"

# progresiones (re menor misterioso; al final fa mayor luminoso)
prog_menor = [['D3', 'F3', 'A3', 'D4'], ['A#2', 'D3', 'F3', 'A#3'], ['F2', 'A2', 'C3', 'F3'], ['C3', 'E3', 'G3', 'C4']]
prog_final = [['F2', 'A2', 'C3', 'F3'], ['C3', 'E3', 'G3', 'C4'], ['D3', 'F3', 'A3', 'D4'], ['A#2', 'D3', 'F3', 'A#3']]
kick = np.sin(2 * np.pi * np.cumsum(np.linspace(140, 45, int(.25 * SR))) / SR) * env(int(.25 * SR), .001, .09)
hat = lowpass(rng.standard_normal(int(.06 * SR)), 9000) * env(int(.06 * SR), .001, .015)
hat = hat - lowpass(hat, 4000)
nb = int(DUR / beat) + 2
for b in range(nb):
    t = b * beat; k = tipo_en(t)
    if k == "silencio": continue
    compas, pulso = divmod(b, 4)
    acorde = (prog_final if k == "final" else prog_menor)[compas % 4]
    # bajo: una nota por pulso fuerte
    if pulso in (0, 2) and k != "tension":
        f = nota(acorde[0]) / 2; n = int(beat * 1.9 * SR); tt = np.arange(n) / SR
        bajo = (np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt)) * env(n, .01, .6)
        poner(mus_L, bajo, t, .32); poner(mus_R, bajo, t, .32)
    # pizzicato en corcheas (arpegio) — el "tic-tac" curioso de los explicadores
    if k in ("groove", "climax", "final"):
        for s in range(2):
            nt = acorde[(pulso * 2 + s) % 4]; f = nota(nt) * (2 if k != "groove" or s else 2)
            pl = pluck(f, .45); pan = .3 if s else -.3
            poner(mus_L, pl, t + s * beat / 2, .22 * (1 - pan)); poner(mus_R, pl, t + s * beat / 2, .22 * (1 + pan))
        poner(mus_L, kick, t, .55 if pulso in (0, 2) else .0); poner(mus_R, kick, t, .55 if pulso in (0, 2) else .0)
    if k in ("groove", "climax", "final", "tension"):
        for s in range(2):
            g = .10 if k != "tension" else .06
            poner(mus_L, hat, t + s * beat / 2, g * .8); poner(mus_R, hat, t + s * beat / 2, g)
    if k == "climax":
        for s in range(4): poner(mus_L, hat, t + s * beat / 4, .05); poner(mus_R, hat, t + s * beat / 4, .05)

# colchón (pad): dientes de sierra desafinados y filtrados; grave y oscuro en tensión
pad = np.zeros(N)
for b in range(0, nb, 4):
    t = b * beat; k = tipo_en(t)
    if k == "silencio": continue
    acorde = (prog_final if k == "final" else prog_menor)[(b // 4) % 4]
    n = int(beat * 4 * SR) + int(.3 * SR); tt = np.arange(n) / SR
    s = np.zeros(n)
    for nt in acorde[:3]:
        for det in (-.15, .15):
            f = nota(nt) * 2 ** (det / 12); s += 2 * ((tt * f) % 1) - 1
    e = np.minimum(1, tt / .25) * np.minimum(1, (n / SR - tt) / .3)
    poner(pad, s * e, t, .05 if k != "tension" else .07)
pad = lowpass(pad, 900)
# drone grave de tensión con pulso de latido
dron = np.zeros(N)
for a, b, k in secciones:
    if k != "tension": continue
    i, j = int(a * SR), int(b * SR); tt = t_all[i:j] - a
    d = np.sin(2 * np.pi * 55 * tt) + .5 * np.sin(2 * np.pi * 55.4 * tt) + .3 * np.sin(2 * np.pi * 82.5 * tt)
    d *= np.minimum(1, tt / .4) * np.minimum(1, (b - a - tt) / .2)
    dron[i:j] += d * .16
mus_L += pad + dron; mus_R += pad * .9 + dron
# pequeña reverb (ecos difusos) para dar espacio
def reverb(x):
    y = x.copy()
    for d, g in [(.031, .35), (.047, .3), (.071, .25), (.113, .2), (.163, .15)]:
        k = int(d * SR); y[k:] += x[:-k] * g
    return y
mus_L, mus_R = reverb(mus_L), reverb(mus_R[::1])

# ---------------- EFECTOS ----------------
fx = np.zeros(N)
def whoosh(dur=.38):
    n = int(dur * SR); tt = np.arange(n) / SR; ruido = rng.standard_normal(n)
    fc = 300 + 5000 * np.sin(np.pi * tt / dur) ** 2
    w = lowpass(ruido, fc) * np.sin(np.pi * tt / dur) ** 2
    return w / (np.abs(w).max() + 1e-9)
def grieta():
    n = int(.9 * SR); out = np.zeros(n)
    for i in range(14):  # chasquidos sueltos que se aceleran
        p = int((1 - (1 - i / 14) ** 1.7) * .8 * SR); c = rng.standard_normal(int(.012 * SR)) * env(int(.012 * SR), .0005, .004)
        out[p:p + len(c)] += c * (.4 + i / 20)
    tt = np.arange(n) / SR; out += np.sin(2 * np.pi * 180 * tt * (1 + tt)) * env(n, .2, .3) * .15  # crujido metálico
    return out
def explosion():
    n = int(2.2 * SR); tt = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(np.linspace(90, 28, n)) / SR) * env(n, .002, .7)
    r = lowpass(rng.standard_normal(n), 1200 * np.exp(-tt * 1.5) + 120) * env(n, .002, .6) * 3
    return (sub + r) / 2
def sello():
    n = int(.35 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * np.cumsum(np.linspace(160, 50, n)) / SR) * env(n, .001, .08) + lowpass(rng.standard_normal(n), 2500) * env(n, .001, .02) * .8)
def desgarro():
    n = int(1.3 * SR); tt = np.arange(n) / SR
    r = lowpass(rng.standard_normal(n), 3000) * (1 + np.sin(2 * np.pi * 37 * tt)) * env(n, .01, .35)
    ring = sum(np.sin(2 * np.pi * f * tt) for f in (523, 811, 1247)) * env(n, .001, .5) * .12
    return r * .9 + ring + explosion()[:n] * .5
def pop():
    n = int(.12 * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(np.linspace(500, 1100, n)) / SR) * env(n, .001, .04)
def ding():
    n = int(2 * SR); tt = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * tt) * g for f, g in ((1046.5, 1), (1568, .5), (2093, .25))) * env(n, .001, .7) * .5
def latido():
    a = sello() * .8; out = np.zeros(int(.6 * SR)); out[:len(a)] += a; out[int(.22 * SR):int(.22 * SR) + len(a)] += a * .7; return out
def subida(dur=1.6):
    n = int(dur * SR); tt = np.arange(n) / SR
    r = lowpass(rng.standard_normal(n), 200 + 7000 * (tt / dur) ** 2) * (tt / dur) ** 2
    return r / (np.abs(r).max() + 1e-9)
def frenazo():
    """Disco que se para de golpe (rayado de vinilo)."""
    n = int(.7 * SR); tt = np.arange(n) / SR
    f = 900 * np.exp(-tt * 5) + 60; fase = 2 * np.pi * np.cumsum(f) / SR
    return (np.sign(np.sin(fase)) * .4 + lowpass(rng.standard_normal(n), 2000) * .6) * env(n, .002, .25)
def martillo():
    out = np.zeros(int(2.4 * SR))
    for i in range(7):
        g = sello() * .7; tt = np.arange(len(g)) / SR; g = g + np.sin(2 * np.pi * 2300 * tt) * env(len(g), .001, .03) * .3
        p = int((i * .32 + rng.uniform(0, .06)) * SR); out[p:p + len(g)] += g[:len(out) - p]
    return out
def motor(dur=3.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    m = lowpass(np.sign(np.sin(2 * np.pi * 38 * tt)) + rng.standard_normal(n) * .3, 400) * (1 + .3 * np.sin(2 * np.pi * 6 * tt))
    return m * np.minimum(1, tt / .8) * np.minimum(1, (dur - tt) / .5)
def confeti():
    out = np.zeros(int(1.5 * SR)); out[:int(.12 * SR)] += lowpass(rng.standard_normal(int(.12 * SR)), 5000) * env(int(.12 * SR), .001, .03) * 2
    for i in range(30):
        c = pop() * .25; p = int(rng.uniform(.1, 1.3) * SR); out[p:p + len(c)] += c[:len(out) - p]
    return out
SFX = {"frenazo": (frenazo, .8), "martillo": (martillo, .7), "motor": (motor, .5), "confeti": (confeti, .6), "grieta": (grieta, .9), "explosion": (explosion, 1.0), "sello": (sello, .8), "desgarro": (desgarro, 1.0), "pop": (pop, .35), "ding": (ding, .5), "latido": (latido, .7), "subida": (subida, .35)}
for c in ev["cortes"]:
    poner(fx, whoosh(), c - .2, .28)
for t, nombre in ev["efectos"]:
    f, g = SFX[nombre]; s = f(); poner(fx, s, t - (1.6 if nombre == "subida" else 0), g)

def guardar(nombre, L, R):
    est = np.stack([L, R], 1)[:int(DUR * SR)]; est = est / (np.abs(est).max() + 1e-9) * .89
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", f"{carpeta}/{nombre}"], input=est.astype(np.float32).tobytes(), check=True)
guardar("musica.wav", mus_L, mus_R); guardar("efectos.wav", fx, fx)
print(f"{DUR:.1f} s de música y efectos")
