"""Genera la narración con Chatterbox Multilingual (licencia MIT, gratis, local).
Se ejecuta con /opt/voz-venv/bin/python (entorno separado por versiones de torch).

    voz_chatterbox.py peticion.json
peticion.json: {"textos": [...], "referencia": "ruta.wav", "expresividad": 0.6, "cfg": 0.4, "salida": "dir"}
Escribe salida/escena_00.wav, escena_01.wav… (24 kHz, mono, sin silencios al principio y al final).
"""
import json, sys, os, time
import numpy as np
import torch
import soundfile as sf
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

torch.set_num_threads(os.cpu_count() or 4)
p = json.load(open(sys.argv[1], encoding="utf-8"))
os.makedirs(p["salida"], exist_ok=True)
torch.manual_seed(p.get("semilla", 7))
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")


def recortar(a, sr, umbral=0.012, margen=0.04):
    activo = np.where(np.abs(a) > umbral)[0]
    if not len(activo):
        return a
    i0 = max(0, activo[0] - int(margen * sr))
    i1 = min(len(a), activo[-1] + int(margen * 2 * sr))
    return a[i0:i1]


for i, texto in enumerate(p["textos"]):
    t = time.time()
    w = m.generate(texto, language_id="es", audio_prompt_path=p.get("referencia"),
                   exaggeration=p.get("expresividad", 0.6), cfg_weight=p.get("cfg", 0.4))
    a = recortar(w.squeeze(0).numpy(), m.sr)
    sf.write(os.path.join(p["salida"], f"escena_{i:02d}.wav"), a, m.sr)
    print(f"[voz] escena {i + 1}/{len(p['textos'])}: {len(a) / m.sr:.1f}s en {time.time() - t:.0f}s", flush=True)
