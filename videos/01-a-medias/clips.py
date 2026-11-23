"""Asigna clips reales de Mixkit (licencia gratuita, uso comercial) a los planos 'clip', los descarga y extrae fotogramas.
Cada clip se usa como máximo 2 veces y nunca en planos cercanos."""
import json, os, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, "tmp/mixkit"); from temas import temas_de
AQUI = os.path.dirname(os.path.abspath(__file__)); TMP = f"{AQUI}/tmp"; MK = f"{TMP}/mixkit"
ev = json.load(open(f"{TMP}/eventos.json")); tiempos = json.load(open(f"{TMP}/tiempos.json"))
cat = json.load(open(f"{MK}/catalogo.json"))
# palabras del guion (columna imagen + voz) -> temas
REGLAS = [
 (r"gimnasio|ejercicio|entren|deport|atleta|corredor|maratón|sudando", ["gym", "correr"]),
 (r"zapatilla|correr|corre|carrera|cuesta|kilómetros", ["correr"]),
 (r"camin|paseo|parque|pasea|paso|camino|sale|puerta", ["caminar"]),
 (r"lluvia|nubes|ventana", ["lluvia"]),
 (r"cama|techo|dormir|despert|alarma", ["cama", "tiempo"]),
 (r"móvil|teléfono|aplicación|notificación", ["movil"]),
 (r"libro|página|leer|lee|escrib|libreta|nota|cuaderno|curso|portátil", ["libro"]),
 (r"calendario|reloj|tiempo|lunes|enero|semana|día", ["tiempo"]),
 (r"montaña|sube|subir|cima|meta|llega", ["montana", "victoria"]),
 (r"rinde|abandon|falla|fracaso|culpa|tensa|duda|miedo|cansad|vago|enferm", ["triste"]),
 (r"pensa|piensa|pregúnta|espejo|identidad|quién eres", ["pensar"]),
 (r"victoria|orgullo|celebra|sonrisa|consigu|triunf", ["victoria"]),
 (r"ciudad|calle|farola|noche", ["ciudad"]),
 (r"escalera|escalón", ["escaleras"]),
 (r"amanecer|sol|luz|dorado", ["amanecer"]),
 (r"golpe|saco|lucha|pelea|boxe", ["boxeo"]),
]
DEFECTO = {0: ["ciudad", "lluvia"], 1: ["triste", "pensar"], 2: ["caminar", "correr"], 3: ["libro", "caminar"], 4: ["tiempo", "caminar"],
           5: ["triste", "correr"], 6: ["gym", "movil"], 7: ["lluvia", "caminar"], 8: ["triste", "caminar"], 9: ["gym", "correr"],
           10: ["pensar", "correr"], 11: ["victoria", "amanecer"], 12: ["amanecer", "victoria"]}
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
usos, ultimo, asig = {}, {}, {}
import random; rnd = random.Random(7)
clips_planos = [p for p in ev["planos"] if p["tipo"] == "clip"]
for idx, p in enumerate(clips_planos):
    elegido = None
    for ronda in (0, 1):                       # 1º clips sin usar; 2º clips usados una vez
        for t in temas_plano(p):
            cand = [v for v in por_tema.get(t, []) if int(v) < 100000 and v not in EXCL and usos.get(v, 0) == ronda and idx - ultimo.get(v, -99) > 12]
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
