"""Narración con Azure (Jorge HD), frase a frase con pausas propias.
Uso: python3 voz_azure.py  -> tmp/voz.wav y tmp/tiempos.json (mismo formato que voz.py)
La clave de Azure se lee de $AZURE_KEY_FILE (nunca se guarda en el repo)."""
import json, os, re, subprocess, wave, html
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from scipy.signal import butter, sosfilt

AQUI = os.path.dirname(os.path.abspath(__file__)); TMP = f"{AQUI}/tmp"; os.makedirs(f"{TMP}/az", exist_ok=True)
KEY = open(os.environ["AZURE_KEY_FILE"]).read().strip()
URL = "https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1"
VOZ, RATE, PITCH = "es-MX-Jorge:DragonHDV3Neural", "+10%", "-5%"
SR = 48000
INICIO, PAUSA_SECCION = 1.0, 2.0
PAUSA = {".": 0.6, "?": 1.0, "!": 0.7, "…": 0.8, ":": 0.5, ";": 0.5}
ENFASIS = re.compile(r"\b(nunca|ahora|tú)\b", re.I)
# Frases de empuje: Jorge sube la voz (más energía, volumen y tono). Frases de caída: baja grave.
IMPULSO = re.compile(r"^(Regla número|Y la regla número|Empieza|Hazlo|Haz |Decide|Deja de|Prepárate|Mide|Cambia|Apúntalo|Celebra|No esperes|No quieras|Conviértete|Quédate|Así que|No es que seas|Si tu plan|Prometerte|Escríbelo|¿Estás listo|Empezamos|La motivación te hace|Pero es la constancia|Y cuando no tengas|Nada puede|Solo asegúrate|No te castigues)", re.I)
CAIDA = re.compile(r"^(nada\.|Y tres semanas|¿Te suena|Solo eso|Y lo dejas|Simplemente eres así|Un voto no cambia)", re.I)
def nivel(fr):
    if IMPULSO.search(fr) or fr.endswith("!"): return "alto"
    if CAIDA.search(fr): return "bajo"
    return "normal"
NIVELES = {"normal": (RATE, PITCH, "+0%"), "alto": ("+15%", "+3%", "+25%"), "bajo": ("+4%", "-11%", "-5%")}

src = open(f"{AQUI}/../../guiones/01-guion.py").read().split("WPM =")[0]
ns = {}; exec(src, ns); S = ns["S"]
filas = [(si, nombre, voz, img, txt) for si, (nombre, fs) in enumerate(S) for (voz, img, txt) in fs]

def frases_de(texto):
    partes = re.findall(r"[^.?!…]+[.?!…]+[”\"]?|[^.?!…]+$", texto)
    return [p.strip() for p in partes if p.strip()]

def ssml(texto):
    nv = nivel(texto); rate, pitch, vol = NIVELES[nv]
    if nv == "alto" and texto.endswith("."): texto = texto[:-1] + "!"
    t = html.escape(texto, quote=False)
    t = ENFASIS.sub(lambda m: f'<emphasis level="strong">{m.group(0)}</emphasis>', t)
    return (f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-MX">'
            f'<voice name="{VOZ}"><prosody rate="{rate}" pitch="{pitch}" volume="{vol}">{t}</prosody></voice></speak>')

def sintetiza(args):
    k, texto = args
    import hashlib
    out = f"{TMP}/az/f_{hashlib.md5(ssml(texto).encode()).hexdigest()[:12]}.wav"
    if os.path.exists(out) and os.path.getsize(out) > 2000: return
    for _ in range(5):
        r = subprocess.run(["curl", "-s", "-o", out, "-w", "%{http_code}", "-X", "POST", URL,
                            "-H", f"Ocp-Apim-Subscription-Key: {KEY}", "-H", "Content-Type: application/ssml+xml",
                            "-H", "X-Microsoft-OutputFormat: riff-48khz-16bit-mono-pcm", "-H", "User-Agent: videos",
                            "--data-binary", ssml(texto).encode()], capture_output=True, text=True)
        if r.stdout == "200" and os.path.getsize(out) > 2000: return
        import time; time.sleep(3)
    raise SystemExit(f"Azure falló en la frase {k}: {texto}")

def leer(p):
    a = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", p, "-af",
                        "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse",
                        "-ar", str(SR), "-ac", "1", "-f", "s16le", "-"], capture_output=True).stdout
    return np.frombuffer(a, np.int16).astype(np.float32) / 32768

# lista de frases con su fila
lista = []
for i, f in enumerate(filas):
    for fr in frases_de(f[2]): lista.append((i, fr))
with ThreadPoolExecutor(4) as ex: list(ex.map(sintetiza, [(k, fr) for k, (_, fr) in enumerate(lista)]))

rs = np.random.default_rng(1); n = int(0.32 * SR); tt = np.arange(n) / SR
resp = sosfilt(butter(2, [400, 2400], "band", fs=SR, output="sos"), rs.standard_normal(n)) * np.sin(np.pi * tt / 0.32) ** 1.5
resp = resp / np.abs(resp).max() * 0.025

partes = [np.zeros(int(INICIO * SR))]; t = INICIO
palabras = []; out_filas = {}; prev_sec = 0; prev_pausa = 1.0
for k, (i, fr) in enumerate(lista):
    si = filas[i][0]
    if si != prev_sec:
        partes.append(np.zeros(int(PAUSA_SECCION * SR))); t += PAUSA_SECCION; prev_pausa = 2.0
    if prev_pausa >= 0.8:
        partes.append(resp); t += len(resp) / SR
    import hashlib
    a = leer(f"{TMP}/az/f_{hashlib.md5(ssml(fr).encode()).hexdigest()[:12]}.wav"); d = len(a) / SR
    if nivel(fr) == "alto": a = a * 1.0  # el volumen ya lo sube Azure; la compresión lo iguala sin aplastarlo
    # tiempos de palabra repartidos por longitud dentro de la frase
    ws = fr.split(); pesos = np.array([len(w) + 1.5 for w in ws], float); cum = np.concatenate([[0], np.cumsum(pesos)]) / pesos.sum()
    for j, w in enumerate(ws):
        palabras.append({"t0": round(t + cum[j] * d, 3), "t1": round(t + cum[j + 1] * d - 0.02, 3), "w": w, "fila": i})
    f = out_filas.setdefault(i, {"i": i, "sec": si, "seccion": filas[i][1], "t0": round(t, 3), "texto": filas[i][4], "img": filas[i][3], "voz": filas[i][2]})
    f["t1"] = round(t + d, 3)
    partes.append(a); t += d
    p = PAUSA.get(fr.rstrip("”\"")[-1], 0.5)
    if k + 1 < len(lista) and lista[k + 1][0] != i: p += 0.25
    partes.append(np.zeros(int(p * SR))); t += p; prev_pausa = p; prev_sec = si
partes.append(np.zeros(int(2.5 * SR))); total = t + 2.5
x = np.concatenate(partes); x = x / np.abs(x).max() * 0.9
with wave.open(f"{TMP}/voz.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
json.dump({"total": round(total, 3), "palabras": palabras, "filas": [out_filas[i] for i in sorted(out_filas)],
           "secciones": [n for n, _ in S]}, open(f"{TMP}/tiempos.json", "w"), ensure_ascii=False)
print(f"voz: {int(total // 60)}:{total % 60:04.1f}  frases={len(lista)} palabras={len(palabras)}")
