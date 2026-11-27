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
    "roosevelt": ("es-ES-AlvaroNeural", "-4%", "-9Hz"),   # enérgico y rotundo, más grave que el narrador
    "marinero": ("es-ES-AlvaroNeural", "+18%", "+6Hz"),   # gritando, urgente
    "soldado":  ("es-ES-AlvaroNeural", "+16%", "+9Hz"),   # soldado joven, alarmado
    "toni":     ("es-ES-AlvaroNeural", "+14%", "+10Hz"),  # Toni, la mascota: nervioso y gracioso
    "funcionario": ("es-ES-AlvaroNeural", "-2%", "-12Hz"),  # funcionario francés, estirado
    "abogado":  ("es-ES-AlvaroNeural", "+6%", "-8Hz"),    # abogado enfadado y rotundo
    "meredith": ("es-ES-AlvaroNeural", "-4%", "-10Hz"),   # mayor del ejército, muy seguro de sí mismo
    "granjero": ("es-ES-AlvaroNeural", "+14%", "+4Hz"),   # granjero indignado
    "almirante": ("es-ES-AlvaroNeural", "-8%", "-16Hz"),  # almirante británico, solemne
    "onoda":    ("es-ES-AlvaroNeural", "-6%", "-8Hz"),    # soldado firme, desconfiado
    "comandante": ("es-ES-AlvaroNeural", "-12%", "-18Hz"), # anciano comandante, sereno
    "concejal": ("es-ES-AlvaroNeural", "+12%", "-6Hz"),   # concejal medieval, convencido
    "remy":     ("fr-FR-RemyMultilingualNeural", "+36%", "+20Hz"),  # narrador inglés: presentador agudo y rápido (muestra 13)
    "meredith_en": ("en-AU-WilliamMultilingualNeural", "+6%", "-8Hz"),  # mayor australiano, muy seguro de sí mismo
    "lustig":   ("en-GB-RyanNeural", "-4%", "-6Hz"),   # estafador elegante, susurrante y seguro
    "dali":     ("it-IT-GiuseppeMultilingualNeural", "+4%", "-6Hz"),  # Dalí: teatral, con acento
    "bernat":   ("es-ES-AlvaroNeural", "+0%", "-4Hz"),
    "remy_es":  ("fr-FR-RemyMultilingualNeural", "+32%", "+20Hz"),  # narrador en español (Remy)
    "dali_es":  ("es-ES-AlvaroNeural", "-6%", "-12Hz"),  # Dalí en español, teatral
    "mehmed":   ("es-ES-AlvaroNeural", "-8%", "-15Hz"),   # sultán: grave, seguro, solemne
}
# Variación por línea (voz con carisma): "narrador[+22%,+4Hz]|texto" cambia velocidad y tono de esa frase;
# un tercer valor fija el hueco tras la línea en segundos: "narrador[+10%,-2Hz,0.05]|texto".

async def sintetizar(texto, voz, rate, pitch):
    for intento in range(20):   # el servicio gratuito a veces no devuelve audio: reintentar con espera
        try:
            com = edge_tts.Communicate(texto, voz, rate=rate, pitch=pitch, boundary="WordBoundary", proxy=PROXY)
            audio, pal = b"", []
            async for c in com.stream():
                if c["type"] == "audio": audio += c["data"]
                elif c["type"] == "WordBoundary": pal.append((c["offset"] / 1e7, (c["offset"] + c["duration"]) / 1e7, c["text"]))
            break
        except edge_tts.exceptions.NoAudioReceived:
            if intento == 19: raise
            await asyncio.sleep(4 + min(intento, 6) * 4)
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
        quien = quien.strip(); hueco = HUECO
        m = re.match(r"(\w+)\[(.*)\]", quien)
        if m:
            quien, extra = m.group(1), [x.strip() for x in m.group(2).split(",")]
            voz, rate, pitch = VOCES[quien]; rate, pitch = extra[0] or rate, extra[1] if len(extra) > 1 and extra[1] else pitch
            if len(extra) > 2: hueco = float(extra[2])
        else: voz, rate, pitch = VOCES[quien]
        audio, pal = await sintetizar(texto.strip(), voz, rate, pitch)
        audio, pal = apretar(audio, puntuar(texto.strip(), pal))
        for a, b, w in pal: palabras.append({"t0": round(t + a, 3), "t1": round(t + b, 3), "w": w, "quien": quien.strip()})
        total.append(audio); t += len(audio) / SR
        total.append(np.zeros(int(hueco * SR), np.float32)); t += hueco
    audio = np.concatenate(total[:-1])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", base + "_ritmo.wav"], input=audio.tobytes(), check=True)
    json.dump(palabras, open(base + "_ritmo.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"{len(palabras)} palabras, {len(audio) / SR:.1f} s")

asyncio.run(main(*sys.argv[1:]))
