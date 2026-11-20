"""Sound for «La ciudad que pagaba por ratas»: original light comedic score + synthesized SFX under the Piper voice.
Uses the skill's synth helpers (dsp / instruments / sfx_gen). Writes audio/mix.wav (48 kHz stereo), loudness via ffmpeg.
Run: python -I audio/mix_ratas.py  (from the ratas project root)"""
import json, os, sys, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "../../.claude/skills/shorts-animados-3d/plantillas/audio"))
from dsp import SR, ns, tt, rng, lp, hp, fades, pan, place, read_wav, write_wav, dbg
import instruments as I
import sfx_gen as G

DUR = 1545 / 30
N = ns(DUR)
ROOT = os.path.join(HERE, "..")
words = json.load(open(os.path.join(ROOT, "public/ratas/palabras.json")))

# ---------------- music: oompah tuba + glockenspiel tune, 112 bpm, F major; softer vibes for the explanation ----------------
BPM = 112; B = 60 / BPM
m2f = lambda m: 440 * 2 ** ((m - 69) / 12)
def music():
    r = rng(3); out = np.zeros((2, N))
    prog = [(41, [65, 69, 72]), (36, [64, 67, 70]), (41, [65, 69, 72]), (36, [64, 67, 72])]  # F C7 F C
    tune = [72, 74, 76, 72, None, 69, 72, None, 74, 76, 77, 76, 74, 72, 70, None]
    t, bar = 0.05, 0
    while t < DUR - 0.2:
        root, ch = prog[bar % 4]
        soft = 34.3 < t < 47.0
        for k in range(4):
            tb = t + k * B
            if tb >= DUR: break
            if k % 2 == 0: place(out, pan(I.brass(m2f(root - (0 if k == 0 else -7)), B * 0.55, 0.55 if not soft else 0.3, r, kind="tuba"), -0.1), tb)
            elif not soft:
                for i, m in enumerate(ch): place(out, pan(0.18 * I.glock(m2f(m), 0.35, r, dur=0.25), 0.3 - 0.3 * i), tb)
            n = tune[(bar * 4 + k) % 16]
            if n is not None:
                y = I.vibes(m2f(n), 0.5, r, dur=0.9) if soft else I.glock(m2f(n + 12), 0.55, r, dur=0.6)
                place(out, pan(0.5 * y, 0.15), tb)
        t += 4 * B; bar += 1
    out *= np.minimum(1, np.minimum(np.arange(N) / (0.3 * SR), (N - np.arange(N)) / (0.4 * SR)))[None, :]
    return out

# ---------------- sfx ----------------
def squeak(r):
    d = 0.09 + 0.04 * r.random(); t = tt(d); f0 = 2600 + 1600 * r.random()
    f = f0 * (1 + 0.25 * np.sin(np.pi * t / d)) + 300 * np.sin(2 * np.pi * 38 * t)
    return fades(0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 0.6, 0.003, 0.01)
def coin(r):
    y = G.clink(r, 2600, 0.6, 1.2); t = tt(0.6)
    y = y + 0.4 * np.sin(2 * np.pi * 5200 * t) * np.exp(-t / 0.18) + 0.3 * np.sin(2 * np.pi * 3900 * t) * np.exp(-t / 0.25)
    return fades(y, 0.001, 0.05)
def pop(r):
    t = tt(0.07); f = 900 - 600 * t / 0.07
    return fades(0.6 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03), 0.001, 0.01)
def thud(r, f=80, d=0.35):
    t = tt(d); return fades(np.sin(2 * np.pi * f * t) * np.exp(-t / 0.09) + 0.4 * lp(r.standard_normal(len(t)), 400) * np.exp(-t / 0.04), 0.002, 0.05)
def snip(r):
    y = np.zeros(ns(0.12)); c = hp(r.standard_normal(ns(0.012)), 2500) * np.exp(-tt(0.012) / 0.002)
    for t0 in (0.0, 0.055): i = ns(t0); y[i:i + len(c)] += c
    return y
def sfx():
    r = rng(11); out = np.zeros((2, N))
    P = lambda y, t, g=0.0, p=0.0: place(out, pan(y * dbg(g), p), t)
    for t in [3.47, 5.0, 7.6, 9.9, 12.5, 15.07, 16.43, 20.4, 22.23, 24.3, 26.67, 28.8, 32.67, 34.27, 38.87, 41.73, 44.5, 47.07, 49.33]:
        P(G.whoosh(0.55, r, peak=0.22), t - 0.22, -10, r.uniform(-0.4, 0.4))
    P(thud(r, 60, 0.6), 3.72, -4)
    for k in range(10): P(squeak(r), 3.25 + k * 0.16, -11, r.uniform(-0.6, 0.6))
    for k in range(7): P(squeak(r), 10.2 + k * 0.28, -9, r.uniform(-0.5, 0.5)); P(pop(r), 10.2 + k * 0.28, -12)
    for k in range(4): P(thud(r, 110, 0.25), 15.06 + k * 0.12, -9)
    for k in range(5): P(squeak(r), 16.4 + k * 0.3, -13, -0.4 + 0.2 * k)
    P(coin(r), 20.82, -6); P(G.whoosh(0.3, r, peak=0.05, f_lo=1200, f_hi=4500), 23.7, -14)
    for k in range(8): P(squeak(r), 24.4 + k * 0.28, -13, -0.6 + 0.15 * k)
    for w in (31.96, 32.9, 33.82): P(squeak(r), w - 0.05, -7, 0.2); P(squeak(r), w + 0.12, -10, 0.3)
    P(thud(r, 70, 0.5), 35.14, -10); P(coin(r), 35.92, -7)
    for i in range(6): P(pop(r), 40.04 + i * 0.12, -8, -0.5 + 0.2 * i); P(squeak(r), 40.1 + i * 0.12, -14, -0.5 + 0.2 * i)
    for i in range(6): P(coin(r), 40.62 + i * 0.13, -11, -0.5 + 0.2 * i)
    P(snip(r), 42.7, -5); P(squeak(r), 42.8, -8); P(squeak(r), 43.8, -11, -0.3)
    for k in range(9): P(squeak(r), 44.6 + k * 0.27, -14, r.uniform(-0.6, 0.6))
    return out

# ---------------- mix ----------------
x, src_sr = read_wav(os.path.join(ROOT, "public/ratas/voz.wav"))
v = x.mean(axis=0)
if src_sr != SR:  # piper writes 22.05 kHz
    v = np.interp(np.arange(int(len(v) * SR / src_sr)) / SR, np.arange(len(v)) / src_sr, v)
voice = np.zeros((2, N)); n = min(N, len(v)); voice[:, :n] = v[None, :n]
# duck the music 6 dB under speech (word spans), 0.1 s attack / 0.4 s release
env = np.zeros(N)
for w in words: env[ns(max(0, w["s"] - 0.08)):ns(w["e"] + 0.12)] = 1
k = np.exp(-1 / (0.25 * SR)); g = np.empty(N); acc = 0.0
for i in range(N): acc = max(env[i], acc * k); g[i] = acc
duck = dbg(-6 * g)[None, :]
m, s = music(), sfx()
rms = lambda x: np.sqrt(np.mean(x ** 2) + 1e-12)
m *= 0.16 * rms(voice) / rms(m) * duck   # music bed ~ -16 dB under the voice, ducked further under words
s *= 0.9
mix = voice + m + s
mix /= max(1.0, np.abs(mix).max() / 0.95)
write_wav(os.path.join(HERE, "premix.wav"), mix)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(HERE, "premix.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000",
                os.path.join(HERE, "mix.wav")], check=True)
print("ok", DUR)
