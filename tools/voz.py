"""Genera voz en off con edge-tts + subtítulos SRT palabra a palabra y por frases.
Uso: python3 tools/voz.py guion.txt salida_base [voz] [rate] [pitch]"""
import asyncio, os, ssl, sys, edge_tts, edge_tts.communicate as _c

# En entornos con proxy HTTPS (p. ej. sesiones en la nube) hay que usar el proxy y su CA.
PROXY = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
if os.environ.get("SSL_CERT_FILE"):
    _c._SSL_CTX = ssl.create_default_context(cafile=os.environ["SSL_CERT_FILE"])

def ts(t):  # t en unidades de 100 ns
    ms = int(t / 10_000); h, ms = divmod(ms, 3_600_000); m, ms = divmod(ms, 60_000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

async def main(src, out, voice="es-ES-AlvaroNeural", rate="+10%", pitch="-2Hz"):
    text = open(src, encoding="utf-8").read().strip()
    words = []
    com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary", proxy=PROXY)
    with open(out + ".mp3", "wb") as f:
        async for c in com.stream():
            if c["type"] == "audio": f.write(c["data"])
            elif c["type"] == "WordBoundary": words.append((c["offset"], c["offset"] + c["duration"], c["text"]))
    # Subtítulos palabra a palabra: cada palabra dura hasta que empieza la siguiente (sin parpadeos)
    with open(out + "_palabras.srt", "w", encoding="utf-8") as f:
        for i, (a, b, w) in enumerate(words):
            end = words[i + 1][0] if i + 1 < len(words) and words[i + 1][0] - b < 4_000_000 else b
            f.write(f"{i+1}\n{ts(a)} --> {ts(end)}\n{w}\n\n")
    print(f"{len(words)} palabras, {words[-1][1]/1e7:.1f} s")

asyncio.run(main(*sys.argv[1:]))
