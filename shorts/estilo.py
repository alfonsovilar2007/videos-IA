"""Diseño "trabajado" del muñeco: sombreado cel-shading, cara detallada, ropa con detalles,
extremidades tipo rubber hose (mangas y pantalones con volumen), guantes y zapatos.
Lo usa rig.py. Todas las medidas en unidades de diseño; SS = supersampling.
"""
import math
from PIL import Image, ImageDraw, ImageChops, ImageFilter
from personaje import VESTUARIOS, _sombrero

SS = 2
TINTA = (33, 28, 52, 255)
PIEL = (255, 251, 246, 255)
PIEL_SOMBRA = (226, 220, 236, 255)
BRILLO = (255, 255, 255, 255)
MEJILLA = (255, 150, 160, 150)
GUANTE = (255, 255, 255, 255)
GUANTE_SOMBRA = (215, 215, 230, 255)

# Detalles extra por vestuario (además de los de personaje.VESTUARIOS)
EXTRA = {
    "normal":     dict(pantalon=(55, 65, 95), zapatos=(120, 70, 40), cuello="camisa"),
    "preso":      dict(pantalon=(245, 140, 40), zapatos=(60, 60, 60), cuello="redondo", numero=True),
    "policia":    dict(pantalon=(30, 40, 80), zapatos=(25, 25, 30), cuello="camisa", cinturon=True, placa=True),
    "guardia":    dict(pantalon=(30, 40, 80), zapatos=(25, 25, 30), cuello="camisa", cinturon=True, placa=True),
    "millonario": dict(pantalon=(235, 235, 235), zapatos=(30, 30, 30), cuello="solapas", pajarita=True),
    "caballero":  dict(pantalon=(50, 40, 50), zapatos=(30, 25, 25), cuello="solapas", corbata=(170, 40, 40)),
    "minero":     dict(pantalon=(70, 80, 110), zapatos=(90, 60, 30), cuello="redondo", tirantes=True),
    "vaquero":    dict(pantalon=(60, 90, 140), zapatos=(110, 60, 30), cuello="panuelo", cinturon=True),
    "soldado":    dict(pantalon=(80, 95, 55), zapatos=(50, 40, 30), cuello="camisa", cinturon=True),
    "general":    dict(pantalon=(50, 65, 40), zapatos=(25, 25, 25), cuello="camisa", cinturon=True, medallas=True),
    "marinero":   dict(pantalon=(30, 50, 120), zapatos=(25, 25, 30), cuello="marinero"),
    "capitan":    dict(pantalon=(25, 35, 80), zapatos=(25, 25, 30), cuello="solapas", galones=True),
    "samurai":    dict(pantalon=(40, 40, 60), zapatos=(60, 40, 30), cuello="kimono", cinturon=True),
    "rey":        dict(pantalon=(90, 30, 120), zapatos=(40, 30, 30), cuello="armino", capa=True),
    "cientifico": dict(pantalon=(70, 70, 80), zapatos=(50, 40, 35), cuello="solapas", corbata=(60, 110, 170), bolsillo=True),
    "conductor":  dict(pantalon=(50, 60, 90), zapatos=(230, 230, 230), cuello="redondo"),
    "obrero":     dict(pantalon=(50, 80, 140), zapatos=(110, 70, 30), cuello="redondo", chaleco=True),
    "granjero":   dict(pantalon=(60, 100, 160), zapatos=(100, 65, 35), cuello="camisa", tirantes=True),
    "cientifico_loco": dict(pantalon=(125, 92, 52), zapatos=(55, 50, 50), cuello="bata"),
    "doctor":     dict(pantalon=(90, 140, 160), zapatos=(240, 240, 240), cuello="solapas", bolsillo=True),
    "ninio":      dict(pantalon=(50, 90, 160), zapatos=(220, 50, 50), cuello="redondo"),
}


def _c(t, a=255):
    return t if len(t) == 4 else (*t, a)


def oscuro(c, f=0.72):
    return tuple(int(x * f) for x in c[:3]) + (255,)


def claro(c, f=0.35):
    return tuple(int(x + (255 - x) * f) for x in c[:3]) + (255,)


def sombreado(img, mascara, dx, dy, color, desenfoque=0):
    """Sombra en media luna: parte de la máscara que NO tapa la máscara desplazada."""
    m2 = ImageChops.offset(mascara, int(dx * SS), int(dy * SS))
    luna = ImageChops.subtract(mascara, m2)
    if desenfoque:
        luna = luna.filter(ImageFilter.GaussianBlur(desenfoque * SS))
        luna = ImageChops.multiply(luna, mascara)
    capa = Image.new("RGBA", img.size, color)
    capa.putalpha(ImageChops.multiply(luna, Image.new("L", img.size, color[3])))
    img.alpha_composite(capa)


def manguera(d, pts, ancho, color, borde=7):
    """Extremidad rubber hose: línea gruesa con contorno y articulaciones redondas."""
    S = [p * SS for xy in pts for p in xy]
    for w, col in ((ancho + 2 * borde, TINTA), (ancho, color)):
        d.line(S, fill=col, width=int(w * SS), joint="curve")
        for x, y in pts:
            r = w / 2
            d.ellipse([(x - r) * SS, (y - r) * SS, (x + r) * SS, (y + r) * SS], fill=col)


def guante(d, x, y, ang, sgn, abierta=False):
    """Mano con guante blanco tipo dibujo clásico: palma grande, pulgar y puño. ang = dirección del antebrazo."""
    S = lambda *xs: [v * SS for v in xs]
    ux, uy = sgn * math.sin(ang), math.cos(ang)       # dirección del antebrazo
    cx, cy = x + ux * 22, y + uy * 22                 # centro de la palma
    r = 32
    px, py = cx - uy * 26 * sgn + ux * 4, cy + ux * 26 * sgn - 6   # pulgar hacia el lado interior
    for rad, col in ((r + 7, TINTA), (r, GUANTE)):
        d.ellipse(S(cx - rad, cy - rad, cx + rad, cy + rad), fill=col)
    for rad, col in ((17, TINTA), (11, GUANTE)):
        d.ellipse(S(px - rad, py - rad, px + rad, py + rad), fill=col)
    d.ellipse(S(cx - r + 4, cy - r + 4, cx + r - 4, cy + r - 4), fill=GUANTE)
    d.chord(S(cx - r, cy - r, cx + r, cy + r), 25, 155, fill=GUANTE_SOMBRA)
    for k in (-1, 0, 1):
        bx, by = cx + ux * 10 + (-uy) * k * 12, cy + uy * 10 + ux * k * 12
        d.line(S(bx, by, bx + ux * 16, by + uy * 16), fill=TINTA, width=4 * SS)
    # puño de la manga (arandela)
    d.ellipse(S(x - 22, y - 22, x + 22, y + 22), fill=TINTA)
    d.ellipse(S(x - 16, y - 16, x + 16, y + 16), fill=GUANTE)
    d.arc(S(x - 16, y - 16, x + 16, y + 16), 20, 160, fill=GUANTE_SOMBRA, width=5 * SS)


def matraz(d, x, y, t, liquido=(110, 235, 90, 255)):
    """Matraz Erlenmeyer sujeto por el cuello en (x, y), con líquido y burbujas animadas."""
    S = lambda *xs: [v * SS for v in xs]
    cuerpo = [x - 14, y + 30, x + 14, y + 30, x + 62, y + 140, x - 62, y + 140]
    d.polygon(S(x - 22, y + 24, x + 22, y + 24, x + 72, y + 148, x - 72, y + 148), fill=TINTA)
    d.rounded_rectangle(S(x - 22, y - 40, x + 22, y + 40), radius=6 * SS, fill=TINTA)
    d.rectangle(S(x - 14, y - 34, x + 14, y + 36), fill=(225, 245, 250, 255))
    d.polygon(S(*cuerpo), fill=(225, 245, 250, 255))
    nivel = y + 78
    d.polygon(S(x - 38, nivel, x + 38, nivel, x + 62, y + 140, x - 62, y + 140), fill=liquido)
    d.line(S(x - 38, nivel, x + 38, nivel), fill=claro(liquido, 0.5), width=5 * SS)
    for k in range(6):  # burbujas que suben
        fase = (t * 0.9 + k * 0.37) % 1.0
        bx = x - 30 + (k * 23) % 60 + 4 * math.sin(t * 6 + k)
        by = y + 135 - fase * 60
        r = 4 + (k % 3) * 2
        if by > nivel + r:
            d.ellipse(S(bx - r, by - r, bx + r, by + r), fill=claro(liquido, 0.55))
    d.line(S(x - 40, y + 70, x - 54, y + 128), fill=(255, 255, 255, 200), width=5 * SS)
    d.rounded_rectangle(S(x - 26, y - 46, x + 26, y - 34), radius=5 * SS, fill=TINTA)
    # vapor
    for k in range(3):
        fase = (t * 0.6 + k / 3) % 1.0
        vy = y - 50 - fase * 90
        vx = x + 10 * math.sin(t * 3 + k * 2)
        r = 8 + fase * 14
        d.ellipse(S(vx - r, vy - r, vx + r, vy + r), fill=(200, 255, 190, int(150 * (1 - fase))))


def zapato(d, x, y, sgn, color):
    S = lambda *xs: [v * SS for v in xs]
    cx = x + sgn * 16
    d.rounded_rectangle(S(cx - 46, y - 30, cx + 46, y + 14), radius=22 * SS, fill=TINTA)
    d.rounded_rectangle(S(cx - 40, y - 24, cx + 40, y + 8), radius=17 * SS, fill=_c(color))
    d.rounded_rectangle(S(cx - 40, y + 1, cx + 40, y + 8), radius=4 * SS, fill=oscuro(color, 0.5))
    d.ellipse(S(cx + sgn * 10 - 14, y - 20, cx + sgn * 10 + 6, y - 12), fill=claro(color, 0.6))


# ------------------------------------------------------------------ cabeza
def cabeza(vestuario, expr, boca, parpadeo, mirar):
    v = VESTUARIOS.get(vestuario, VESTUARIOS["normal"])
    OX, OY = 0, 120
    W, H = 600, 760
    im = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    s = lambda *xs: [(x + (OX if i % 2 == 0 else OY)) * SS for i, x in enumerate(xs)]
    hx, hy, rx, ry = 300, 330, 188, 172
    B = 10
    # pelo loco por detrás
    if v.get("pelo_loco"):
        for ang in range(-170, -5, 15):
            a = math.radians(ang)
            d.line(s(hx + rx * 0.85 * math.cos(a), hy + ry * 0.85 * math.sin(a),
                     hx + (rx + 70) * math.cos(a), hy + (ry + 70) * math.sin(a)), fill=TINTA, width=24 * SS)
            d.line(s(hx + rx * 0.85 * math.cos(a), hy + ry * 0.85 * math.sin(a),
                     hx + (rx + 65) * math.cos(a), hy + (ry + 65) * math.sin(a)), fill=(175, 175, 190, 255), width=14 * SS)
    if v.get("pelo_pinchos"):
        pts_o, pts_i = [], []
        angs = list(range(-205, 26, 15))
        for k, ang in enumerate(angs):
            a = math.radians(ang)
            r_ext = (95 + 25 * ((k * 7) % 3)) if k % 2 == 0 else 15
            for lista, extra in ((pts_o, 12), (pts_i, 0)):
                lista += [hx + (rx + r_ext + extra) * math.cos(a), hy - 10 + (ry + r_ext + extra) * math.sin(a)]
        d.polygon(s(*pts_o), fill=TINTA)
        d.polygon(s(*pts_i), fill=(222, 226, 236, 255))
        for k, ang in enumerate(angs[::2]):
            a = math.radians(ang)
            d.line(s(hx + (rx + 10) * math.cos(a), hy + (ry + 0) * math.sin(a),
                     hx + (rx + 70) * math.cos(a), hy - 10 + (ry + 70) * math.sin(a)), fill=(185, 190, 205, 255), width=6 * SS)
    # orejas
    for sg in (-1, 1):
        ex = hx + sg * (rx - 8)
        d.ellipse(s(ex - 34, hy - 5, ex + 34, hy + 70), fill=TINTA)
        d.ellipse(s(ex - 25, hy + 4, ex + 25, hy + 61), fill=PIEL)
        d.arc(s(ex - 14, hy + 16, ex + 14, hy + 50), 90 - sg * 70, 270 - sg * 70, fill=PIEL_SOMBRA, width=6 * SS)
    # cabeza con contorno
    d.ellipse(s(hx - rx - B, hy - ry - B, hx + rx + B, hy + ry + B), fill=TINTA)
    mascara = Image.new("L", im.size, 0)
    ImageDraw.Draw(mascara).ellipse(s(hx - rx, hy - ry, hx + rx, hy + ry), fill=255)
    piel = Image.new("RGBA", im.size, PIEL)
    im.paste(piel, (0, 0), mascara)
    sombreado(im, mascara, -32, -26, PIEL_SOMBRA, 2)
    # brillo
    d = ImageDraw.Draw(im)
    d.ellipse(s(hx - 120, hy - 140, hx - 60, hy - 100), fill=(255, 255, 255, 200))
    d.ellipse(s(hx - 50, hy - 150, hx - 30, hy - 132), fill=(255, 255, 255, 200))
    # mechón
    if v.get("pelo_pinchos"):  # flequillo de pinchos sobre la frente
        for k in range(-2, 3):
            x0 = hx + k * 38
            d.polygon(s(x0 - 30, hy - ry + 30, x0 + 30, hy - ry + 30, x0 + 6, hy - ry - 22), fill=TINTA)
            d.polygon(s(x0 - 22, hy - ry + 26, x0 + 22, hy - ry + 26, x0 + 5, hy - ry - 10), fill=(222, 226, 236, 255))
    elif not v.get("sombrero") or v.get("sombrero") in ("gorra", "gorra_policia"):
        for k, (ang, lon) in enumerate(((-28, 50), (-5, 62), (20, 46))):
            a = math.radians(ang - 90)
            x0, y0 = hx - 12 + 12 * k, hy - ry + 8
            x1, y1 = x0 + lon * math.cos(a), y0 + lon * math.sin(a)
            d.line(s(x0, y0, (x0 + x1) / 2 + 8, (y0 + y1) / 2, x1, y1), fill=TINTA, width=11 * SS, joint="curve")
    _cara_pro(d, s, hx + mirar * 22, hy + 22, expr, boca, v, parpadeo)
    _sombrero(d, s, v.get("sombrero"), hx, hy - ry, rx)
    return im


def _cara_pro(d, s, cx, cy, expr, boca, v, parp):
    T = TINTA
    ex, ey = 72, cy - 28
    # mejillas
    for dx in (-112, 112):
        d.ellipse(s(cx + dx - 36, cy + 34, cx + dx + 36, cy + 62), fill=MEJILLA)
    # ojos
    for sg in (-1, 1):
        x = cx + sg * ex
        if parp and expr not in ("feliz",):
            d.arc(s(x - 28, ey - 18, x + 28, ey + 16), 15, 165, fill=T, width=9 * SS)
        elif expr == "feliz":
            d.arc(s(x - 30, ey - 8, x + 30, ey + 38), 200, 340, fill=T, width=10 * SS)
        elif expr == "furioso":
            d.ellipse(s(x - 30, ey - 26, x + 30, ey + 26), fill=T)
            d.ellipse(s(x - 24, ey - 20, x + 24, ey + 20), fill=(240, 40, 40, 255))
            d.ellipse(s(x - 10, ey - 10, x + 10, ey + 10), fill=(255, 235, 140, 255))
        elif expr in ("sorprendido", "asustado"):
            d.ellipse(s(x - 36, ey - 40, x + 36, ey + 40), fill=T)
            d.ellipse(s(x - 30, ey - 34, x + 30, ey + 34), fill=(255, 255, 255, 255))
            d.ellipse(s(x - 14, ey - 14, x + 14, ey + 14), fill=T)
            d.ellipse(s(x - 9, ey - 11, x - 1, ey - 3), fill=BRILLO)
        else:
            d.ellipse(s(x - 21, ey - 27, x + 21, ey + 27), fill=T)
            d.ellipse(s(x - 10, ey - 19, x + 4, ey - 5), fill=BRILLO)
            d.ellipse(s(x + 5, ey + 6, x + 12, ey + 13), fill=BRILLO)
            if expr == "chulo":  # párpado caído
                d.chord(s(x - 26, ey - 34, x + 26, ey + 8), 180, 360, fill=PIEL)
                d.line(s(x - 27, ey - 6, x + 27, ey - 8), fill=T, width=9 * SS)
            if expr == "pensativo" and sg == 1:
                d.chord(s(x - 26, ey - 34, x + 26, ey + 4), 180, 360, fill=PIEL)
                d.line(s(x - 27, ey - 10, x + 27, ey - 10), fill=T, width=8 * SS)
        # cejas con forma (polígonos)
        by = ey - 58
        if expr in ("enfadado", "furioso"):
            pts = [(x - sg * 45, by - 14), (x + sg * 32, by + 18), (x + sg * 30, by + 32), (x - sg * 46, by + 2)]
        elif expr in ("triste", "asustado"):
            pts = [(x - sg * 42, by + 18), (x + sg * 32, by - 10), (x + sg * 34, by + 2), (x - sg * 40, by + 30)]
        elif expr == "chulo":
            dy = -22 if sg == 1 else 4
            pts = [(x - 38, by + dy + 6), (x, by + dy - 6), (x + 38, by + dy + 2), (x, by + dy + 6)]
        elif expr == "sorprendido":
            pts = [(x - 38, by - 6), (x, by - 30), (x + 38, by - 6), (x, by - 18)]
        elif expr == "pensativo":
            dy = -18 if sg == 1 else 6
            pts = [(x - 36, by + dy + 4), (x + 36, by + dy - 2), (x + 36, by + dy + 10), (x - 36, by + dy + 14)]
        else:
            pts = [(x - 36, by + 6), (x, by - 6), (x + 36, by + 4), (x, by + 6)]
        d.polygon(s(*[c for p in pts for c in p]), fill=T)
    # nariz
    d.ellipse(s(cx - 15, cy + 18, cx + 15, cy + 40), fill=(255, 205, 200, 255))
    d.arc(s(cx - 15, cy + 18, cx + 15, cy + 40), 20, 160, fill=(220, 150, 150, 255), width=4 * SS)
    # boca
    my = cy + 78
    if boca:
        ancho = 44 if boca == 2 else 34
        alto = 52 if boca == 2 else 28
        if expr in ("sorprendido", "asustado"):
            ancho = 26
        d.ellipse(s(cx - ancho - 6, my - 12 - 6, cx + ancho + 6, my - 12 + alto + 6), fill=T)
        d.ellipse(s(cx - ancho, my - 12, cx + ancho, my - 12 + alto), fill=(110, 25, 45, 255))
        d.chord(s(cx - ancho * 0.8, my - 12, cx + ancho * 0.8, my + 12), 180, 360, fill=(255, 255, 255, 255))  # dientes
        d.ellipse(s(cx - ancho * 0.55, my + alto - 32, cx + ancho * 0.55, my + alto - 8), fill=(240, 100, 120, 255))
    elif expr == "feliz":
        d.chord(s(cx - 52, my - 34, cx + 52, my + 36), 0, 180, fill=T)
        d.chord(s(cx - 44, my - 26, cx + 44, my + 28), 0, 180, fill=(110, 25, 45, 255))
        d.chord(s(cx - 40, my - 26, cx + 40, my - 4), 0, 180, fill=(255, 255, 255, 255))
        d.ellipse(s(cx - 20, my + 6, cx + 20, my + 26), fill=(240, 100, 120, 255))
    elif expr == "chulo":
        d.arc(s(cx - 20, my - 36, cx + 50, my + 10), 25, 125, fill=T, width=9 * SS)
    elif expr in ("triste", "enfadado", "furioso"):
        d.arc(s(cx - 36, my, cx + 36, my + 40), 205, 335, fill=T, width=10 * SS)
    elif expr in ("sorprendido", "asustado"):
        d.ellipse(s(cx - 20, my - 10, cx + 20, my + 32), fill=T)
        d.ellipse(s(cx - 14, my - 4, cx + 14, my + 26), fill=(110, 25, 45, 255))
    elif expr == "pensativo":
        d.line(s(cx - 24, my + 8, cx + 28, my - 2), fill=T, width=9 * SS)
    else:
        d.arc(s(cx - 32, my - 24, cx + 32, my + 14), 30, 150, fill=T, width=9 * SS)
    # bigote / barba / gafas
    if v.get("bigote"):
        for sg in (-1, 1):
            pts = [(cx, my - 30), (cx + sg * 30, my - 42), (cx + sg * 62, my - 30), (cx + sg * 78, my - 50),
                   (cx + sg * 74, my - 22), (cx + sg * 40, my - 14), (cx, my - 20)]
            d.polygon(s(*[c for p in pts for c in p]), fill=(80, 45, 30, 255), outline=T)
    if v.get("barba"):
        d.chord(s(cx - 140, my - 120, cx + 140, my + 96), 5, 175, fill=T)
        d.chord(s(cx - 132, my - 112, cx + 132, my + 88), 6, 174, fill=(105, 70, 45, 255))
        d.chord(s(cx - 96, my - 80, cx + 96, my + 70), 20, 160, fill=(130, 90, 60, 255))
        if boca:
            d.ellipse(s(cx - 30, my - 18, cx + 30, my + 24), fill=(110, 25, 45, 255), outline=T, width=6 * SS)
        else:
            d.arc(s(cx - 28, my - 26, cx + 28, my + 6), 30, 150, fill=T, width=8 * SS)
    if v.get("gafas_gruesas"):
        for sg in (-1, 1):
            x = cx + sg * ex
            d.line(s(x + sg * 52, ey - 4, cx + sg * 182, ey - 14), fill=T, width=16 * SS)
            d.line(s(x + sg * 52, ey - 4, cx + sg * 182, ey - 14), fill=(95, 100, 112, 255), width=8 * SS)
            d.ellipse(s(x - 58, ey - 56, x + 58, ey + 56), fill=T)
            d.ellipse(s(x - 50, ey - 48, x + 50, ey + 48), fill=(110, 116, 128, 255))
            d.ellipse(s(x - 40, ey - 38, x + 40, ey + 38), fill=(235, 245, 255, 255))
            # el ojo se vuelve a dibujar grande (efecto lupa)
            if parp:
                d.arc(s(x - 26, ey - 16, x + 26, ey + 14), 15, 165, fill=T, width=9 * SS)
            else:
                d.ellipse(s(x - 17, ey - 17, x + 17, ey + 17), fill=T)
                d.ellipse(s(x - 9, ey - 12, x + 1, ey - 2), fill=BRILLO)
            d.arc(s(x - 34, ey - 32, x + 6, ey), 190, 260, fill=(255, 255, 255, 255), width=6 * SS)
        d.line(s(cx - 22, ey - 6, cx + 22, ey - 6), fill=T, width=14 * SS)
    if v.get("gafas"):
        for sg in (-1, 1):
            x = cx + sg * ex
            d.ellipse(s(x - 46, ey - 44, x + 46, ey + 44), outline=T, width=9 * SS)
            d.arc(s(x - 36, ey - 34, x + 10, ey), 190, 260, fill=(255, 255, 255, 230), width=6 * SS)
        d.arc(s(cx - 28, ey - 14, cx + 28, ey + 14), 200, 340, fill=T, width=8 * SS)


# ------------------------------------------------------------------ cuerpo
def cuerpo(vestuario, CW_, CH_):
    """Torso detallado. Devuelve (imagen, pivote cadera)."""
    v = VESTUARIOS.get(vestuario, VESTUARIOS["normal"])
    e = EXTRA.get(vestuario, EXTRA["normal"])
    m = 26
    bata = e.get("cuello") == "bata"
    w, h = CW_ + 2 * m, CH_ + 2 * m + (150 if bata else 0)
    im = Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    S = lambda *xs: [x * SS for x in xs]
    x0, y0, x1, y1 = m, m, m + CW_, m + CH_
    cx = (x0 + x1) / 2
    col = _c(v["cuerpo"])
    B = 10
    if bata:  # faldones de la bata (por debajo de la cadera, abiertos en el centro)
        for sg in (-1, 1):
            xa, xb = (x0 - 4, cx - 6) if sg < 0 else (cx + 6, x1 + 4)
            pts = [xa, y1 - 60, xb, y1 - 60, xb + sg * 6, y1 + 135, xa - sg * 18, y1 + 128]
            d.polygon(S(*pts), fill=(250, 250, 252, 255), outline=TINTA, width=9 * SS)
            d.line(S(xb - sg * 30, y1, xb - sg * 26, y1 + 120), fill=(215, 218, 232, 255), width=10 * SS)
    # forma: un poco más ancha abajo (tipo bolo)
    d.rounded_rectangle(S(x0 - B, y0 - B, x1 + B, y1 + B), radius=70 * SS, fill=TINTA)
    mascara = Image.new("L", im.size, 0)
    ImageDraw.Draw(mascara).rounded_rectangle(S(x0, y0, x1, y1), radius=62 * SS, fill=255)
    im.paste(Image.new("RGBA", im.size, col), (0, 0), mascara)
    d = ImageDraw.Draw(im)
    # detalles de ropa (se dibujan dentro de la máscara)
    det = Image.new("RGBA", im.size, (0, 0, 0, 0))
    dd = ImageDraw.Draw(det)
    if v.get("rayas") or v.get("rayas_azules"):
        c2 = (45, 45, 45, 255) if v.get("rayas") else (40, 70, 170, 255)
        for y in range(y0 + 40, y1, 52):
            dd.rectangle(S(x0, y, x1, y + 16), fill=c2)
    if e.get("chaleco"):
        dd.rectangle(S(x0, y0, x1, y1), fill=(250, 140, 20, 255))
        for y in (y0 + 110, y0 + 170):
            dd.rectangle(S(x0, y, x1, y + 16), fill=(230, 235, 120, 255))
    if e.get("tirantes"):
        for sg in (-1, 1):
            dd.line(S(cx + sg * 55, y0, cx + sg * 45, y1), fill=(140, 40, 30, 255), width=16 * SS)
            dd.ellipse(S(cx + sg * 45 - 9, y0 + 150, cx + sg * 45 + 9, y0 + 168), fill=(240, 200, 60, 255))
    cuello = e.get("cuello")
    if cuello == "solapas":
        for sg in (-1, 1):
            dd.polygon(S(cx, y0 + 150, cx + sg * 16, y0, cx + sg * 80, y0, cx + sg * 30, y0 + 70), fill=oscuro(col, 0.8), outline=TINTA)
        dd.polygon(S(cx - 16, y0, cx + 16, y0, cx, y0 + 150), fill=(255, 255, 255, 255))
    elif cuello == "camisa":
        for sg in (-1, 1):
            dd.polygon(S(cx, y0 + 34, cx + sg * 56, y0 - 4, cx + sg * 62, y0 + 30), fill=claro(col, 0.75), outline=TINTA)
    elif cuello == "redondo":
        dd.chord(S(cx - 60, y0 - 40, cx + 60, y0 + 30), 0, 180, fill=oscuro(col, 0.82))
    elif cuello == "marinero":
        dd.polygon(S(cx - 90, y0, cx + 90, y0, cx, y0 + 90), fill=(40, 70, 170, 255))
        dd.polygon(S(cx - 20, y0 + 70, cx + 20, y0 + 70, cx + 30, y0 + 110, cx - 30, y0 + 110), fill=(220, 40, 40, 255))
    elif cuello == "bata":
        dd.rectangle(S(cx - 44, y0, cx + 44, y1), fill=(52, 72, 118, 255))
        dd.chord(S(cx - 46, y0 - 30, cx + 46, y0 + 26), 0, 180, fill=(40, 58, 98, 255))
        for sg in (-1, 1):
            dd.polygon(S(cx + sg * 44, y0, cx + sg * 100, y0, cx + sg * 72, y0 + 90, cx + sg * 44, y0 + 150),
                       fill=(244, 245, 250, 255), outline=TINTA)
            dd.line(S(cx + sg * 44, y0, cx + sg * 44, y1), fill=TINTA, width=6 * SS)
        px0 = cx + 58
        for k, cc in enumerate([(40, 80, 200, 255), (210, 50, 50, 255), (240, 140, 30, 255)]):
            xx = px0 + 8 + k * 12
            dd.line(S(xx, y1 - 125, xx + (6 if k == 2 else 0), y1 - 75), fill=cc, width=7 * SS)
        dd.rectangle(S(px0, y1 - 95, px0 + 52, y1 - 45), fill=(250, 250, 252, 255), outline=TINTA, width=5 * SS)
    elif cuello == "panuelo":
        dd.polygon(S(cx - 70, y0, cx + 70, y0, cx, y0 + 80), fill=(200, 40, 40, 255), outline=TINTA)
    elif cuello == "kimono":
        for sg in (-1, 1):
            dd.line(S(cx + sg * 70, y0, cx - sg * 30, y0 + 150), fill=(240, 230, 210, 255), width=26 * SS)
    elif cuello == "armino":
        dd.rounded_rectangle(S(x0 - 5, y0 - 5, x1 + 5, y0 + 50), radius=25 * SS, fill=(250, 250, 250, 255))
        for k in range(5):
            xx = x0 + 25 + k * 45
            dd.ellipse(S(xx - 5, y0 + 15, xx + 5, y0 + 30), fill=(20, 20, 20, 255))
    if e.get("corbata"):
        dd.polygon(S(cx - 14, y0 + 8, cx + 14, y0 + 8, cx + 20, y0 + 120, cx, y0 + 145, cx - 20, y0 + 120), fill=_c(e["corbata"]), outline=TINTA)
    if e.get("pajarita"):
        dd.polygon(S(cx, y0 + 14, cx - 38, y0 - 6, cx - 38, y0 + 34), fill=(20, 20, 25, 255))
        dd.polygon(S(cx, y0 + 14, cx + 38, y0 - 6, cx + 38, y0 + 34), fill=(20, 20, 25, 255))
        dd.ellipse(S(cx - 9, y0 + 5, cx + 9, y0 + 23), fill=(40, 40, 45, 255))
    if v.get("botones"):
        for y in range(y0 + 80, y1 - 40, 55):
            dd.ellipse(S(cx - 11, y, cx + 11, y + 22), fill=oscuro(col, 0.45))
            dd.ellipse(S(cx - 5, y + 4, cx + 1, y + 10), fill=claro(col, 0.5))
    if e.get("cinturon"):
        dd.rectangle(S(x0, y1 - 62, x1, y1 - 34), fill=(55, 35, 25, 255))
        dd.rounded_rectangle(S(cx - 22, y1 - 68, cx + 22, y1 - 28), radius=6 * SS, fill=(235, 195, 60, 255), outline=TINTA, width=4 * SS)
    if e.get("placa"):
        dd.regular_polygon((((cx + 60) * SS, (y0 + 75) * SS), 22 * SS), 6, fill=(240, 200, 60, 255), outline=TINTA)
    if e.get("medallas"):
        for k in range(3):
            xx = cx + 35 + k * 26
            dd.rectangle(S(xx - 8, y0 + 50, xx + 8, y0 + 70), fill=[(200, 40, 40, 255), (40, 90, 200, 255), (240, 200, 60, 255)][k])
            dd.ellipse(S(xx - 10, y0 + 70, xx + 10, y0 + 90), fill=(240, 200, 60, 255))
    if e.get("galones"):
        for sg in (-1, 1):
            dd.rectangle(S(cx + sg * 95 - 22, y0 + 4, cx + sg * 95 + 22, y0 + 18), fill=(240, 200, 60, 255))
    if e.get("bolsillo"):
        dd.rectangle(S(cx - 85, y0 + 70, cx - 40, y0 + 112), outline=oscuro(col, 0.7), width=5 * SS)
        dd.line(S(cx - 75, y0 + 60, cx - 75, y0 + 95), fill=(40, 90, 200, 255), width=6 * SS)
    if e.get("numero"):
        dd.rectangle(S(cx - 50, y0 + 90, cx + 50, y0 + 130), fill=(255, 255, 255, 255), outline=TINTA, width=4 * SS)
        for k in range(4):
            dd.line(S(cx - 38 + k * 25, y0 + 98, cx - 38 + k * 25, y0 + 122), fill=TINTA, width=6 * SS)
    if v.get("flor"):
        dd.ellipse(S(cx + 45, y0 + 40, cx + 85, y0 + 80), fill=(220, 30, 50, 255), outline=TINTA, width=4 * SS)
        dd.ellipse(S(cx + 58, y0 + 52, cx + 72, y0 + 66), fill=(160, 20, 40, 255))
    det.putalpha(ImageChops.multiply(det.getchannel("A"), mascara))
    im.alpha_composite(det)
    sombreado(im, mascara, -34, -22, (0, 0, 0, 55), 3)
    sombreado(im, mascara, 18, 18, (255, 255, 255, 60), 3)
    return im, (w / 2, y1 - 10)
