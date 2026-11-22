"""Locución con varios personajes (edge-tts): cada línea "personaje|texto" con su voz, pausas recortadas y tiempos por palabra.
Uso: python3 tools/voces.py <guion.txt> <salida_base>
Escribe <base>_ritmo.wav y <base>_ritmo.json (palabras con t0, t1, w y quien)."""
import asyncio, json, os, re, ssl, subprocess, sys, tempfile, numpy as np, edge_tts, edge_tts.communicate as _c

PROXY = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
if os.environ.get("SSL_CERT_FILE"): _c._SSL_CTX = ssl.create_default_context(cafile=os.environ["SSL_CERT_FILE"])
SR = 48000; MAX_PAUSA = .26; MARGEN = .09; HUECO = .16
# Voces de España: solo hay 3 (Álvaro, Elvira, Ximena); el resto se distingue con velocidad y tono
VOCES = {
    "narrador": ("es-ES-AlvaroNeural", "+10%", "-2Hz"),
    "ladron":   ("es-ES-AlvaroNeural", "-6%", "-14Hz"),    # grave, lento, susurrante
    "viuda":    ("es-ES-ElviraNeural", "-8%", "-4Hz"),     # suave, triste
    "joven":    ("es-ES-XimenaNeural", "+8%", "+4Hz"),
    "viejo":    ("es-ES-AlvaroNeural", "-12%", "-20Hz"),
}

async def sintetizar(texto, voz, rate, pitch):
    com = edge_tts.Communicate(texto, voz, rate=rate, pitch=pitch, boundary="WordBoundary", proxy=PROXY)
    audio, pal = b"", []
    async for c in com.stream():
        if c["type"] == "audio": audio += c["data"]
        elif c["type"] == "WordBoundary": pal.append((c["offset"] / 1e7, (c["offset"] + c["duration"]) / 1e7, c["text"]))
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "-", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], input=audio, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy(), pal

def puntuar(texto, pal):
    tokens = re.findall(r"\S+", texto); j = 0; out = []
    limpio = lambda s: re.sub(r"[^\wáéíóúñü]", "", s.lower())
    for a, b, w in pal:
        tok = w
        for k in range(j, min(j + 4, len(tokens))):
            if limpio(tokens[k]) == limpio(w): tok, j = tokens[k], k + 1; break
        out.append([a, b, tok])
    return out

def apretar(audio, pal):
    """Quita silencios largos dentro de la línea y recorta el principio y el final."""
    ini = max(0, pal[0][0] - .04); fin = pal[-1][1] + .12
    quitar = [(a[1] + MARGEN, b[0] - (MAX_PAUSA - MARGEN)) for a, b in zip(pal, pal[1:]) if b[0] - a[1] > MAX_PAUSA]
    trozos, pos = [], ini
    for q0, q1 in quitar: trozos.append(audio[int(pos * SR):int(q0 * SR)]); pos = q1
    trozos.append(audio[int(pos * SR):int(fin * SR)])
    f = int(.005 * SR); ramp = np.linspace(0, 1, f, dtype=np.float32)
    for i, t in enumerate(trozos):
        if len(t) > 2 * f: t[:f] *= ramp; t[-f:] *= ramp[::-1]
    mover = lambda t: t - ini - sum(min(max(t - a, 0), b - a) for a, b in quitar)
    return np.concatenate(trozos), [[mover(a), mover(b), w] for a, b, w in pal]

async def main(guion, base):
    lineas = [l.split("|", 1) for l in open(guion, encoding="utf-8").read().strip().splitlines() if "|" in l]
    total, palabras, t = [], [], 0.0
    for quien, texto in lineas:
        voz, rate, pitch = VOCES[quien.strip()]
        audio, pal = await sintetizar(texto.strip(), voz, rate, pitch)
        audio, pal = apretar(audio, puntuar(texto.strip(), pal))
        for a, b, w in pal: palabras.append({"t0": round(t + a, 3), "t1": round(t + b, 3), "w": w, "quien": quien.strip()})
        total.append(audio); t += len(audio) / SR
        total.append(np.zeros(int(HUECO * SR), np.float32)); t += HUECO
    audio = np.concatenate(total[:-1])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", base + "_ritmo.wav"], input=audio.tobytes(), check=True)
    json.dump(palabras, open(base + "_ritmo.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"{len(palabras)} palabras, {len(audio) / SR:.1f} s")

asyncio.run(main(*sys.argv[1:]))
