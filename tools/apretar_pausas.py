"""Recorta los silencios largos entre frases de una voz de edge-tts y reajusta los tiempos de las palabras.
Uso: python3 tools/apretar_pausas.py <base>   (lee base.mp3 y base_palabras.json, escribe base_ritmo.wav y base_ritmo.json)"""
import json, subprocess, sys, numpy as np
base = sys.argv[1]; SR = 48000; MAX_PAUSA = 0.28; MARGEN = 0.10
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", base + ".mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(raw, np.float32)
pal = json.load(open(base + "_palabras.json", encoding="utf-8"))
quitar = []  # intervalos (ini, fin) en segundos a eliminar
for a, b in zip(pal, pal[1:]):
    hueco = b["t0"] - a["t1"]
    if hueco > MAX_PAUSA:
        quitar.append((a["t1"] + MARGEN, b["t0"] - (MAX_PAUSA - MARGEN)))
trozos, desplaz, pos = [], [], 0.0
for ini, fin in quitar:
    trozos.append(audio[int(pos * SR):int(ini * SR)]); pos = fin
trozos.append(audio[int(pos * SR):])
# fundido de 5 ms en cada unión para que no haya clics
f = int(0.005 * SR); ramp = np.linspace(0, 1, f, dtype=np.float32)
for i, t in enumerate(trozos):
    t = t.copy()
    if i > 0 and len(t) > f: t[:f] *= ramp
    if i < len(trozos) - 1 and len(t) > f: t[-f:] *= ramp[::-1]
    trozos[i] = t
salida = np.concatenate(trozos)
def mover(t):
    return t - sum(min(max(t - ini, 0), fin - ini) for ini, fin in quitar)
for p in pal: p["t0"], p["t1"] = round(mover(p["t0"]), 3), round(mover(p["t1"]), 3)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", base + "_ritmo.wav"], input=salida.tobytes(), check=True)
json.dump(pal, open(base + "_ritmo.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(f"{len(audio)/SR:.1f} s -> {len(salida)/SR:.1f} s ({len(quitar)} pausas recortadas)")
