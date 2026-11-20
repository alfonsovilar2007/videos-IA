"""Dibuja el personaje propio del canal (estilo "cabeza de huevo" con extremidades de palo).

Diseño propio (no copia de otros canales):
  - Cabeza blanca ligeramente ovalada con mechón de pelo y mejillas rosadas.
  - Contorno azul marino oscuro.
  - Cuerpo de una pieza con el color del vestuario; brazos y piernas de palo.

Uso:
    img = dibujar_personaje(vestuario="minero", expresion="chulo", boca_abierta=False, pose="normal")
Devuelve una imagen RGBA de 600x1100 (el personaje de pie, con los pies en la base).
"""
from PIL import Image, ImageDraw
import math

SS = 2  # supersampling para bordes suaves
W, H = 600, 1100
TINTA = (29, 27, 58, 255)
BLANCO = (255, 255, 255, 255)
MEJILLA = (255, 170, 175, 200)
GROSOR = 9

# Vestuarios: color de cuerpo, sombrero, extras
VESTUARIOS = {
    "normal":      dict(cuerpo=(70, 130, 220), sombrero=None),
    "preso":       dict(cuerpo=(245, 140, 40), sombrero=None, rayas=True),
    "policia":     dict(cuerpo=(40, 60, 120), sombrero="gorra_policia", botones=True),
    "guardia":     dict(cuerpo=(40, 60, 120), sombrero="gorra_policia", botones=True, bigote=True),
    "millonario":  dict(cuerpo=(250, 250, 250), sombrero="chistera", botones=True, bigote=True, flor=True),
    "caballero":   dict(cuerpo=(90, 40, 70), sombrero="bombin"),
    "minero":      dict(cuerpo=(150, 100, 60), sombrero="casco_minero", barba=True),
    "vaquero":     dict(cuerpo=(170, 110, 60), sombrero="vaquero", bigote=True),
    "soldado":     dict(cuerpo=(90, 110, 60), sombrero="casco_militar"),
    "general":     dict(cuerpo=(60, 80, 50), sombrero="gorra_policia", botones=True, bigote=True),
    "marinero":    dict(cuerpo=(240, 240, 250), sombrero="gorra_marinero", rayas_azules=True),
    "capitan":     dict(cuerpo=(30, 40, 90), sombrero="gorra_capitan", botones=True, barba=True),
    "samurai":     dict(cuerpo=(170, 30, 40), sombrero="kabuto"),
    "rey":         dict(cuerpo=(130, 40, 160), sombrero="corona", barba=True),
    "cientifico":  dict(cuerpo=(250, 250, 250), sombrero=None, gafas=True, pelo_loco=True),
    "conductor":   dict(cuerpo=(200, 50, 50), sombrero="gorra", gafas=False),
    "obrero":      dict(cuerpo=(250, 160, 30), sombrero="casco_obra"),
    "granjero":    dict(cuerpo=(60, 110, 170), sombrero="paja"),
    "doctor":      dict(cuerpo=(250, 250, 250), sombrero=None, gafas=True),
    "ninio":       dict(cuerpo=(240, 200, 50), sombrero="gorra"),
}

EXPRESIONES = ["neutral", "feliz", "chulo", "enfadado", "furioso", "sorprendido", "triste", "asustado", "pensativo"]
POSES = ["normal", "saludo", "senyala", "brazos_arriba", "jarras"]


def _c(t):
    return t if len(t) == 4 else (*t, 255)


def _oscurecer(c, f=0.7):
    return tuple(int(x * f) for x in c[:3]) + (255,)


def dibujar_personaje(vestuario="normal", expresion="neutral", boca_abierta=False, pose="normal",
                      mirar=0, piel=(255, 255, 255)):
    v = VESTUARIOS.get(vestuario, VESTUARIOS["normal"])
    img = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    s = lambda *xs: [x * SS for x in xs]
    g = GROSOR * SS
    cuerpo_col = _c(v["cuerpo"])

    hx, hy, hrx, hry = 300, 330, 190, 175       # cabeza
    by0, by1, bw = 490, 760, 115                # cuerpo
    # --- piernas
    for dx in (-45, 45):
        d.line(s(300 + dx, by1 - 10, 300 + dx * 1.2, 1060), fill=TINTA, width=g)
        d.ellipse(s(300 + dx * 1.2 - 30, 1045, 300 + dx * 1.2 + 30, 1080), fill=TINTA)
    # --- brazos
    hombro_y = by0 + 60
    brazos = {
        "normal":        [(-1, 120, 230), (1, 120, 230)],
        "saludo":        [(-1, 120, 230), (1, 150, -150)],
        "senyala":       [(-1, 120, 230), (1, 230, -20)],
        "brazos_arriba": [(-1, 150, -170), (1, 150, -170)],
        "jarras":        [(-1, 90, 110), (1, 90, 110)],
    }[pose if pose in POSES else "normal"]
    for lado, dx, dy in brazos:
        x0 = 300 + lado * (bw - 15)
        if pose == "jarras":
            codo = (x0 + lado * dx, hombro_y + 50)
            d.line(s(x0, hombro_y, *codo), fill=TINTA, width=g)
            d.line(s(*codo, x0 + lado * 5, hombro_y + dy), fill=TINTA, width=g)
        else:
            x1, y1 = x0 + lado * dx, hombro_y + dy
            d.line(s(x0, hombro_y, x1, y1), fill=TINTA, width=g)
            d.ellipse(s(x1 - 18, y1 - 18, x1 + 18, y1 + 18), fill=TINTA)
    # --- cuerpo
    d.rounded_rectangle(s(300 - bw, by0, 300 + bw, by1), radius=60 * SS, fill=cuerpo_col, outline=TINTA, width=g)
    if v.get("rayas") or v.get("rayas_azules"):
        col = (40, 40, 40, 255) if v.get("rayas") else (40, 70, 170, 255)
        for y in range(by0 + 50, by1 - 20, 55):
            d.line(s(300 - bw + 12, y, 300 + bw - 12, y), fill=col, width=12 * SS)
    if v.get("botones"):
        for y in range(by0 + 70, by1 - 30, 60):
            d.ellipse(s(285, y, 315, y + 30), fill=TINTA)
    if v.get("flor"):
        d.ellipse(s(330, by0 + 40, 380, by0 + 90), fill=(220, 30, 50, 255), outline=TINTA, width=4 * SS)

    # --- cabeza
    d.ellipse(s(hx - hrx, hy - hry, hx + hrx, hy + hry), fill=_c(piel), outline=TINTA, width=g)
    # mechón de pelo (rasgo propio)
    if not v.get("sombrero") or v.get("sombrero") in ("gorra", "gorra_policia"):
        for i, ang in enumerate((-20, 0, 20)):
            a = math.radians(ang - 90)
            x0, y0 = hx + 10 * i - 10, hy - hry + 5
            d.line(s(x0, y0, x0 + 45 * math.cos(a) + ang, y0 + 45 * math.sin(a)), fill=TINTA, width=g)
    if v.get("pelo_loco"):
        for ang in range(-160, -10, 18):
            a = math.radians(ang)
            d.line(s(hx + hrx * 0.9 * math.cos(a), hy + hry * 0.9 * math.sin(a),
                     hx + (hrx + 60) * math.cos(a), hy + (hry + 60) * math.sin(a)), fill=(150, 150, 160, 255), width=14 * SS)

    _cara(d, s, hx + mirar * 25, hy + 20, expresion, boca_abierta, v)
    _sombrero(d, s, v.get("sombrero"), hx, hy - hry, hrx)

    return img.resize((W, H), Image.LANCZOS)


def _cara(d, s, cx, cy, expr, boca, v):
    g = 8 * SS
    ex = 70  # separación de ojos
    ey = cy - 25
    # mejillas
    for dx in (-110, 110):
        d.ellipse(s(cx + dx - 32, cy + 35, cx + dx + 32, cy + 65), fill=MEJILLA)
    # ojos
    for lado in (-1, 1):
        x = cx + lado * ex
        if expr == "feliz":
            d.arc(s(x - 28, ey - 10, x + 28, ey + 35), 200, 340, fill=TINTA, width=g)
        elif expr == "chulo":
            d.chord(s(x - 26, ey - 26, x + 26, ey + 26), 0, 180, fill=TINTA)
            d.line(s(x - 30, ey, x + 30, ey), fill=TINTA, width=g)
        elif expr in ("sorprendido", "asustado"):
            d.ellipse(s(x - 30, ey - 34, x + 30, ey + 34), fill=(255, 255, 255, 255), outline=TINTA, width=6 * SS)
            d.ellipse(s(x - 11, ey - 11, x + 11, ey + 11), fill=TINTA)
        elif expr == "furioso":
            d.ellipse(s(x - 26, ey - 22, x + 26, ey + 22), fill=(235, 30, 30, 255), outline=TINTA, width=5 * SS)
            d.ellipse(s(x - 9, ey - 9, x + 9, ey + 9), fill=(255, 230, 120, 255))
        else:
            d.ellipse(s(x - 17, ey - 22, x + 17, ey + 22), fill=TINTA)
            d.ellipse(s(x - 3, ey - 15, x + 8, ey - 4), fill=(255, 255, 255, 255))
        # cejas
        by = ey - 55
        if expr in ("enfadado", "furioso"):
            d.line(s(x - lado * 40, by - 10, x + lado * 30, by + 20), fill=TINTA, width=12 * SS)
        elif expr in ("triste", "asustado"):
            d.line(s(x - lado * 40, by + 15, x + lado * 30, by - 8), fill=TINTA, width=10 * SS)
        elif expr == "chulo":
            dy = -18 if lado == 1 else 6
            d.line(s(x - 35, by + dy, x + 35, by + dy - 4), fill=TINTA, width=10 * SS)
        elif expr == "pensativo":
            dy = -15 if lado == 1 else 5
            d.line(s(x - 30, by + dy, x + 30, by + dy), fill=TINTA, width=10 * SS)
        elif expr == "sorprendido":
            d.arc(s(x - 35, by - 25, x + 35, by + 15), 200, 340, fill=TINTA, width=10 * SS)
    # boca
    my = cy + 70
    if boca:
        alto = 45 if expr in ("sorprendido", "asustado", "furioso", "feliz") else 32
        d.ellipse(s(cx - 30, my - 10, cx + 30, my - 10 + alto), fill=(120, 30, 50, 255), outline=TINTA, width=6 * SS)
        d.ellipse(s(cx - 16, my + alto - 30, cx + 16, my + alto - 14), fill=(240, 110, 130, 255))
    elif expr == "feliz":
        d.chord(s(cx - 45, my - 30, cx + 45, my + 30), 0, 180, fill=(120, 30, 50, 255), outline=TINTA, width=6 * SS)
    elif expr == "chulo":
        d.arc(s(cx - 10, my - 30, cx + 50, my + 10), 20, 120, fill=TINTA, width=g)
    elif expr in ("triste", "enfadado", "furioso"):
        d.arc(s(cx - 35, my, cx + 35, my + 40), 200, 340, fill=TINTA, width=g)
    elif expr in ("sorprendido", "asustado"):
        d.ellipse(s(cx - 15, my - 5, cx + 15, my + 30), fill=(120, 30, 50, 255), outline=TINTA, width=6 * SS)
    elif expr == "pensativo":
        d.line(s(cx - 20, my + 8, cx + 25, my), fill=TINTA, width=g)
    else:
        d.arc(s(cx - 30, my - 20, cx + 30, my + 15), 30, 150, fill=TINTA, width=g)
    # bigote / barba / gafas
    if v.get("bigote"):
        for lado in (-1, 1):
            d.chord(s(cx + (0 if lado == 1 else -70), my - 40, cx + (70 if lado == 1 else 0), my + 5), 180, 360, fill=(70, 40, 30, 255))
            d.arc(s(cx + lado * 55 - 18, my - 50, cx + lado * 55 + 18, my - 15), 0, 360, fill=(70, 40, 30, 255), width=8 * SS)
    if v.get("barba"):
        d.chord(s(cx - 120, my - 40, cx + 120, my + 110), 10, 170, fill=(90, 60, 40, 255), outline=TINTA, width=6 * SS)
    if v.get("gafas"):
        for lado in (-1, 1):
            x = cx + lado * ex
            d.ellipse(s(x - 42, ey - 40, x + 42, ey + 40), outline=TINTA, width=7 * SS)
        d.line(s(cx - 28, ey, cx + 28, ey), fill=TINTA, width=7 * SS)


def _sombrero(d, s, tipo, cx, top, r):
    g = 8 * SS
    T = TINTA
    if tipo is None:
        return
    if tipo == "chistera":
        d.rounded_rectangle(s(cx - 190, top + 30, cx + 190, top + 70), radius=20 * SS, fill=(30, 30, 35, 255), outline=T, width=g)
        d.rectangle(s(cx - 120, top - 170, cx + 120, top + 45), fill=(30, 30, 35, 255), outline=T, width=g)
        d.rectangle(s(cx - 116, top + 0, cx + 116, top + 30), fill=(170, 30, 40, 255))
    elif tipo == "bombin":
        d.chord(s(cx - 140, top - 110, cx + 140, top + 130), 180, 360, fill=(30, 30, 35, 255), outline=T, width=g)
        d.rounded_rectangle(s(cx - 175, top + 2, cx + 175, top + 35), radius=16 * SS, fill=(30, 30, 35, 255), outline=T, width=g)
    elif tipo in ("gorra_policia", "gorra_capitan"):
        col = (30, 40, 90, 255) if tipo == "gorra_policia" else (250, 250, 250, 255)
        d.chord(s(cx - 170, top - 60, cx + 170, top + 90), 180, 360, fill=col, outline=T, width=g)
        d.rectangle(s(cx - 150, top + 10, cx + 150, top + 50), fill=(20, 20, 30, 255), outline=T, width=g)
        d.chord(s(cx - 120, top + 30, cx + 120, top + 90), 0, 180, fill=(20, 20, 30, 255), outline=T, width=g)
        d.ellipse(s(cx - 20, top - 25, cx + 20, top + 15), fill=(240, 200, 60, 255), outline=T, width=5 * SS)
    elif tipo == "gorra":
        d.chord(s(cx - 160, top - 70, cx + 160, top + 110), 180, 360, fill=(200, 40, 40, 255), outline=T, width=g)
        d.chord(s(cx - 30, top + 5, cx + 230, top + 70), 180, 360, fill=(160, 30, 30, 255), outline=T, width=g)
    elif tipo == "vaquero":
        d.ellipse(s(cx - 250, top + 5, cx + 250, top + 75), fill=(140, 90, 50, 255), outline=T, width=g)
        d.rounded_rectangle(s(cx - 120, top - 110, cx + 120, top + 45), radius=50 * SS, fill=(140, 90, 50, 255), outline=T, width=g)
        d.rectangle(s(cx - 116, top + 5, cx + 116, top + 30), fill=(60, 35, 20, 255))
    elif tipo in ("casco_militar", "casco_minero", "casco_obra"):
        col = {"casco_militar": (80, 100, 55, 255), "casco_minero": (230, 190, 40, 255), "casco_obra": (250, 200, 30, 255)}[tipo]
        d.chord(s(cx - 185, top - 100, cx + 185, top + 140), 180, 360, fill=col, outline=T, width=g)
        d.rounded_rectangle(s(cx - 200, top + 10, cx + 200, top + 40), radius=14 * SS, fill=col, outline=T, width=g)
        if tipo == "casco_minero":
            d.ellipse(s(cx - 35, top - 70, cx + 35, top - 10), fill=(255, 250, 200, 255), outline=T, width=g)
    elif tipo == "gorra_marinero":
        d.ellipse(s(cx - 150, top - 20, cx + 150, top + 50), fill=(250, 250, 250, 255), outline=T, width=g)
        d.rectangle(s(cx - 110, top + 15, cx + 110, top + 45), fill=(40, 70, 170, 255), outline=T, width=6 * SS)
    elif tipo == "kabuto":
        d.chord(s(cx - 180, top - 90, cx + 180, top + 140), 180, 360, fill=(40, 40, 45, 255), outline=T, width=g)
        d.polygon(s(cx, top - 70, cx - 130, top - 230, cx - 60, top - 60), fill=(230, 180, 40, 255), outline=T)
        d.polygon(s(cx, top - 70, cx + 130, top - 230, cx + 60, top - 60), fill=(230, 180, 40, 255), outline=T)
        d.rectangle(s(cx - 220, top + 20, cx + 220, top + 55), fill=(170, 30, 40, 255), outline=T, width=g)
    elif tipo == "corona":
        pts = [cx - 130, top + 40, cx - 130, top - 60, cx - 65, top - 10, cx, top - 90, cx + 65, top - 10,
               cx + 130, top - 60, cx + 130, top + 40]
        d.polygon(s(*pts), fill=(245, 200, 40, 255), outline=T, width=g)
    elif tipo == "paja":
        d.ellipse(s(cx - 240, top + 5, cx + 240, top + 70), fill=(235, 200, 110, 255), outline=T, width=g)
        d.chord(s(cx - 120, top - 90, cx + 120, top + 90), 180, 360, fill=(235, 200, 110, 255), outline=T, width=g)


if __name__ == "__main__":
    # Hoja de muestra con todos los vestuarios y expresiones
    import sys
    vs = list(VESTUARIOS)
    cols = 5
    filas = math.ceil(len(vs) / cols)
    hoja = Image.new("RGBA", (cols * 300, filas * 550), (200, 215, 235, 255))
    for i, vv in enumerate(vs):
        e = EXPRESIONES[i % len(EXPRESIONES)]
        p = POSES[i % len(POSES)]
        im = dibujar_personaje(vv, e, boca_abierta=(i % 3 == 0), pose=p).resize((300, 550))
        hoja.alpha_composite(im, ((i % cols) * 300, (i // cols) * 550))
    hoja.convert("RGB").save(sys.argv[1] if len(sys.argv) > 1 else "muestra_personajes.jpg")
