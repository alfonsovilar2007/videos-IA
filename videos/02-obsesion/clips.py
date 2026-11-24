"""Asigna clips reales de Mixkit (licencia gratuita, uso comercial) a los planos 'clip', los descarga y extrae fotogramas.
Cada clip se usa como máximo 2 veces y nunca en planos cercanos."""
import json, os, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../01-a-medias/tmp/mixkit")); from temas import temas_de
AQUI = os.path.dirname(os.path.abspath(__file__)); TMP = f"{AQUI}/tmp"; MK = f"{AQUI}/../01-a-medias/tmp/mixkit"
ev = json.load(open(f"{TMP}/eventos.json")); tiempos = json.load(open(f"{TMP}/tiempos.json"))
cat = json.load(open(f"{MK}/catalogo.json"))
# palabras del guion (columna imagen + voz) -> temas
REGLAS = [
 (r"\breloj|4:00|segundero", ["reloj"]),
 (r"móvil|pantalla|notificaci|redes", ["movil"]),
 (r"sofá|serie|televis", ["sofa"]),
 (r"cama|despertador|madrugada|dormid", ["cama", "reloj"]),
 (r"ciudad|tráfico|calle", ["ciudad", "noche"]),
 (r"fuego|chispas|brasas", ["fuego"]),
 (r"sudor|agotad|cansad|respirando", ["sudor", "gym"]),
 (r"boxe|saco|ring|guantes|vendad|golpe", ["boxeo"]),
 (r"gimnasio|entren|atleta|repeticiones", ["gym", "sudor"]),
 (r"corre|corredor|zapatillas", ["correr"]),
 (r"lluvia", ["lluvia", "correr"]),
 (r"estudi|libro|escrib|cuaderno|trabajando|oficina|manos trabajando", ["estudio", "libro"]),
 (r"cancha|balón", ["cancha"]),
 (r"estadio|público|aplau|podio", ["publico"]),
 (r"construcción|grúa|ladrillo|edificio", ["obra"]),
 (r"montaña|cima", ["montana"]),
 (r"amanecer", ["amanecer"]),
 (r"pensando|espejo|mirada|ventana|sentada|esperando", ["pensar", "triste"]),
 (r"caminando|camino|calle llena", ["caminar"]),
 (r"noche|oscuridad", ["noche"]),
]
DEFECTO = {0: ["reloj", "noche"], 1: ["movil", "noche"], 2: ["fuego", "gym"], 3: ["reloj", "estudio"], 4: ["gym", "noche"], 5: ["sudor", "boxeo"],
           6: ["sudor", "correr"], 7: ["noche", "fuego"], 8: ["boxeo", "correr"], 9: ["fuego", "gym"], 10: ["reloj", "fuego"], 11: ["amanecer", "correr"], 12: ["amanecer", "reloj"]}
filas = {f["i"]: f for f in tiempos["filas"]}
def temas_plano(p):
    if p["tema"]: return [p["tema"]]
    f = filas.get(p["fila"]); txt = (f["img"] + " " + f["voz"]).lower() if f else ""
    out = []
    for rx, ts in REGLAS:
        if re.search(rx, txt): out += [t for t in ts if t not in out]
    return out + [t for t in DEFECTO[p["s"]] if t not in out]
por_tema = {}
for vid, v in sorted(cat.items()):
    for t in temas_de(v["titulo"]): por_tema.setdefault(t, []).append(vid)
EXCL = set(json.load(open(f"{MK}/excluidos.json"))) if os.path.exists(f"{MK}/excluidos.json") else set()
EXCL |= {a["id"] for a in json.load(open(f"{AQUI}/../01-a-medias/tmp/clips_asig.json")).values()}
usos, ultimo, asig = {}, {}, {}
import random; rnd = random.Random(7)
clips_planos = [p for p in ev["planos"] if p["tipo"] == "clip"]
for idx, p in enumerate(clips_planos):
    elegido = None
    for ronda in (0, 1):                       # 1º clips sin usar; 2º clips usados una vez
        for t in temas_plano(p):
            cand = [v for v in por_tema.get(t, []) if int(v) < 100000 and v not in EXCL and usos.get(v, 0) == ronda and idx - ultimo.get(v, -99) > 25]
            if cand: elegido = rnd.choice(cand); tema = t; break
        if elegido: break
    if not elegido: continue
    asig[p["n"]] = {"id": elegido, "uso": usos.get(elegido, 0), "dur": p["t1"] - p["t0"], "tema": tema, "titulo": cat[elegido]["titulo"]}
    usos[elegido] = usos.get(elegido, 0) + 1; ultimo[elegido] = idx
os.makedirs(f"{MK}/videos", exist_ok=True)
def baja(vid):
    out = f"{MK}/videos/{vid}.mp4"
    if os.path.exists(out) and os.path.getsize(out) > 100000: return
    for res in ("1080", "720"):
        r = subprocess.run(["curl", "-s", "-m", "120", "-o", out, "-w", "%{http_code}", f"https://assets.mixkit.co/videos/{vid}/{vid}-{res}.mp4"], capture_output=True, text=True)
        if r.stdout == "200" and os.path.getsize(out) > 100000: return
with ThreadPoolExecutor(6) as ex: list(ex.map(baja, sorted({a["id"] for a in asig.values()})))
def duracion(f): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout or 0)
def frames(item):
    n, a = item
    src = f"{MK}/videos/{a['id']}.mp4"; D = duracion(src); need = a["dur"] + 0.2
    if D < need: return n, None
    off = 0.5 if a["uso"] == 0 else max(0.0, D - need - 0.3)       # segundo uso: otra parte del clip
    d = f"{TMP}/clipframes/{n}"; os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(f"{d}/{f}")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-ss", f"{off:.2f}", "-i", src, "-t", f"{need:.2f}", "-vf",
                    "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30", "-q:v", "3", f"{d}/%04d.jpg"], check=True)
    return n, len(os.listdir(d))
with ThreadPoolExecutor(4) as ex: res = dict(ex.map(frames, asig.items()))
EXCL |= {a["id"] for n, a in asig.items() if not res.get(n)}; json.dump(sorted(EXCL), open(f"{MK}/excluidos.json", "w"))
final = {str(n): {"frames": res[n], "id": a["id"], "lado": 1 if int(a["id"]) % 2 else -1} for n, a in asig.items() if res.get(n)}
open(f"{TMP}/clips_asig.js", "w").write("window.CLIPS_ASIG=" + json.dumps(final) + ";\n")
json.dump(asig, open(f"{TMP}/clips_asig.json", "w"), ensure_ascii=False, indent=1)
from collections import Counter
print("planos clip:", len(clips_planos), "asignados:", len(final), "clips distintos:", len({a['id'] for a in asig.values()}),
      "máx usos:", max(Counter(a['id'] for a in asig.values()).values()), Counter(a['tema'] for a in asig.values()))
