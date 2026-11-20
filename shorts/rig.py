"""Muñeco 2D con esqueleto articulado y animación procedural natural.

    from rig import Personaje
    p = Personaje(dict(vestuario="minero", expresion="chulo", pose="senyala"))
    img, pie = p.frame(t, nivel_voz, palabra_nueva)   # img RGBA; pie = (x, y) del punto entre los pies

Animación:
  - Reposo: respiración (estirar/encoger), balanceo suave, parpadeo aleatorio, mirada que se mueve.
  - Hablando: la cabeza acompaña el volumen, la boca tiene 3 aperturas según el volumen, y en las
    palabras importantes hace gestos con los brazos (explicar, abrir, señalar, puño) que vuelven a la pose base.
  - Entrada: pequeño salto anticipado al empezar la escena.
  - "accion": "caminar" -> ciclo de piernas y brazos mientras se desplaza.
"""
import math, random
from functools import lru_cache
from PIL import Image, ImageDraw
from personaje import VESTUARIOS, TINTA, _c, _cara, _sombrero

SS = 2
G = 9                 # grosor de línea (unidades de diseño)
CW, CH = 900, 1350    # lienzo del muñeco (unidades de diseño)
SUELO = 1300          # y de los pies
L_MUSLO, L_PIERNA = 150, 155
L_BRAZO, L_ANTEBRAZO = 125, 120
CUERPO_W, CUERPO_H = 230, 270

# Ángulos de brazo: (hombro, codo). Hombro: 0 = hacia abajo, positivo = hacia fuera/arriba. Codo: giro adicional del antebrazo.
POSES = {
    "normal":        {"izq": (18, 8),   "der": (18, 8)},
    "saludo":        {"izq": (18, 8),   "der": (150, 35)},
    "senyala":       {"izq": (18, 8),   "der": (100, -5)},
    "brazos_arriba": {"izq": (155, 15), "der": (155, 15)},
    "jarras":        {"izq": (62, -132), "der": (62, -132)},
    "pensar":        {"izq": (62, -132), "der": (40, -150)},
    "cruzados":      {"izq": (30, -120), "der": (30, -120)},
}
GESTOS = [
    {"der": (75, 55)},                       # explicar con una mano
    {"izq": (70, 40), "der": (70, 40)},      # abrir los brazos
    {"der": (105, -5)},                      # señalar
    {"izq": (60, 75)},                       # explicar con la otra
    {"der": (40, 120)},                      # puño arriba
    {"izq": (85, 20), "der": (85, 20)},      # "¡así de grande!"
]


def _rot(px, py, cx, cy, ang):
    a = math.radians(ang)
    dx, dy = px - cx, py - cy
    return cx + dx * math.cos(a) - dy * math.sin(a), cy + dx * math.sin(a) + dy * math.cos(a)


def _suave(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


@lru_cache(maxsize=256)
def capa_cabeza(vestuario, expresion, boca, parpadeo, mirar):
    """Cabeza + cara + sombrero en su propia capa. Pivote (cuello) en (300, 625) de la capa."""
    v = VESTUARIOS.get(vestuario, VESTUARIOS["normal"])
    OX, OY = 0, 120
    im = Image.new("RGBA", (600 * SS, 760 * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    s = lambda *xs: [(x + (OX if i % 2 == 0 else OY)) * SS for i, x in enumerate(xs)]
    hx, hy, hrx, hry = 300, 330, 190, 175
    g = G * SS
    if v.get("pelo_loco"):
        for ang in range(-160, -10, 18):
            a = math.radians(ang)
            d.line(s(hx + hrx * 0.9 * math.cos(a), hy + hry * 0.9 * math.sin(a),
                     hx + (hrx + 60) * math.cos(a), hy + (hry + 60) * math.sin(a)), fill=(150, 150, 160, 255), width=14 * SS)
    d.ellipse(s(hx - hrx, hy - hry, hx + hrx, hy + hry), fill=(255, 255, 255, 255), outline=TINTA, width=g)
    if not v.get("sombrero") or v.get("sombrero") in ("gorra", "gorra_policia"):
        for i, ang in enumerate((-20, 0, 20)):
            a = math.radians(ang - 90)
            x0, y0 = hx + 10 * i - 10, hy - hry + 5
            d.line(s(x0, y0, x0 + 45 * math.cos(a) + ang, y0 + 45 * math.sin(a)), fill=TINTA, width=g)
    _cara(d, s, hx + mirar * 22, hy + 20, expresion, boca, v, parpadeo)
    _sombrero(d, s, v.get("sombrero"), hx, hy - hry, hrx)
    return im


@lru_cache(maxsize=64)
def capa_cuerpo(vestuario):
    """Cuerpo en su propia capa. Pivote (cadera) en el centro de la base."""
    v = VESTUARIOS.get(vestuario, VESTUARIOS["normal"])
    m = 20
    w, h = CUERPO_W + 2 * m, CUERPO_H + 2 * m
    im = Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    s = lambda *xs: [x * SS for x in xs]
    x0, y0, x1, y1 = m, m, m + CUERPO_W, m + CUERPO_H
    cx = (x0 + x1) / 2
    d.rounded_rectangle(s(x0, y0, x1, y1), radius=60 * SS, fill=_c(v["cuerpo"]), outline=TINTA, width=G * SS)
    if v.get("rayas") or v.get("rayas_azules"):
        col = (40, 40, 40, 255) if v.get("rayas") else (40, 70, 170, 255)
        for y in range(y0 + 50, y1 - 20, 55):
            d.line(s(x0 + 12, y, x1 - 12, y), fill=col, width=12 * SS)
    if v.get("botones"):
        for y in range(y0 + 70, y1 - 30, 60):
            d.ellipse(s(cx - 15, y, cx + 15, y + 30), fill=TINTA)
    if v.get("flor"):
        d.ellipse(s(cx + 30, y0 + 40, cx + 80, y0 + 90), fill=(220, 30, 50, 255), outline=TINTA, width=4 * SS)
    return im, (w / 2, y1 - 10)


class Personaje:
    def __init__(self, cfg, semilla=0, duracion=4.0, palabras=()):
        """palabras: [(t_inicio_en_la_escena, palabra)] que dice el narrador mientras este personaje habla.
        Todo se programa aquí, así frame(t) no tiene estado y se puede renderizar en paralelo."""
        self.cfg = cfg
        self.vest = cfg.get("vestuario", "normal")
        self.expr = cfg.get("expresion", "neutral")
        self.base = POSES.get(cfg.get("pose", "normal"), POSES["normal"])
        self.habla = cfg.get("habla", False)
        self.caminar = cfg.get("accion") == "caminar"
        rng = random.Random(semilla)
        self.fase = rng.random() * 10
        t, self.parpadeos = rng.uniform(0.6, 2.0), []
        while t < duracion + 1:
            self.parpadeos.append(t)
            t += rng.uniform(1.8, 4.2)
        # gestos: [(t0, brazos_previos, gesto)]
        self.eventos = []
        if self.habla and not self.caminar:
            ultimo = -9
            for tp, w in palabras:
                importante = len(w.strip("¿?¡!.,;:")) >= 7 or w[-1:] in "?!" or w[:1] in "¿¡"
                if tp - ultimo > 1.0 and (importante or rng.random() < 0.18):
                    previo = self._brazos_en(tp)
                    self.eventos.append((tp, previo, rng.choice(GESTOS)))
                    ultimo = tp
        # mirada: [(t, objetivo)]
        self.miradas, t, ant = [(0.0, 0.0)], rng.uniform(1.0, 2.5), 0.0
        while t < duracion + 1:
            ant = rng.choice([-1, -0.5, 0, 0, 0.5, 1])
            self.miradas.append((t, ant))
            t += rng.uniform(1.5, 3.5)

    def _brazos_en(self, t):
        ev = None
        for e in self.eventos:
            if e[0] <= t:
                ev = e
        res = {}
        for lado in ("izq", "der"):
            base = self.base[lado]
            if ev and lado in ev[2]:
                t0, previo, gesto = ev
                dt = t - t0
                ini, obj = previo[lado], gesto[lado]
                if dt < 0.25:
                    k = _suave(dt / 0.25)
                    res[lado] = tuple(a + (b - a) * k for a, b in zip(ini, obj))
                elif dt < 1.1:
                    res[lado] = obj
                else:
                    k = _suave((dt - 1.1) / 0.35)
                    res[lado] = tuple(a + (b - a) * k for a, b in zip(obj, base))
            elif ev:
                res[lado] = ev[1][lado] if t - ev[0] < 0.25 else base
            else:
                res[lado] = base
        return res

    def _mirada_en(self, t):
        prev, act, t0 = 0.0, 0.0, 0.0
        for tm, obj in self.miradas:
            if tm <= t:
                prev, act, t0 = act, obj, tm
        return prev + (act - prev) * _suave((t - t0) / 0.15)

    # ----------------------------------------------------------- frame
    def frame(self, t, voz=0.0):
        """voz: 0..1 volumen de la voz si este personaje habla. Devuelve (imagen RGBA, punto de los pies)."""
        hablando = self.habla and voz > 0.08
        f = self.fase
        # entrada con anticipación: agacharse y estirarse
        e = t / 0.35
        entrada_sq = (-0.07 * math.sin(e * math.pi)) if e < 1 else 0
        resp = math.sin((t + f) * 2 * math.pi / 3.2)
        estirar = 1 + 0.018 * resp + entrada_sq
        balanceo = 1.8 * math.sin((t + f) * 2 * math.pi / 4.5)
        incl_cabeza = 2.5 * math.sin((t + f) * 2 * math.pi / 3.7 + 1)
        cab_dy = 0
        if hablando:
            incl_cabeza += 5 * voz * math.sin(t * 9 + f)
            cab_dy = -6 * voz
            balanceo += 1.2 * voz * math.sin(t * 5)
        brazos = self._brazos_en(t)
        if self.cfg.get("pose") == "saludo":
            h, c = brazos["der"]
            brazos["der"] = (h, c + 18 * math.sin(t * 10))
        # piernas: (cadera, rodilla) por lado; ángulo 0 = vertical
        piernas = {"izq": (-6, 0), "der": (6, 0)}
        bote = 0
        if self.caminar:
            ciclo = t * 2 * math.pi * 1.7
            piernas = {"izq": (24 * math.sin(ciclo), 28 * max(0, math.sin(ciclo + 1.6))),
                       "der": (24 * math.sin(ciclo + math.pi), 28 * max(0, math.sin(ciclo + math.pi + 1.6)))}
            brazos = {"izq": (18 + 22 * math.sin(ciclo + math.pi), 10), "der": (18 + 22 * math.sin(ciclo), 10)}
            bote = -10 * abs(math.sin(ciclo))
            balanceo += 4
        # parpadeo y mirada
        parp = any(0 <= t - p < 0.13 for p in self.parpadeos)
        mirar = round(self._mirada_en(t) * 2) / 2 + self.cfg.get("mirar", 0)
        boca = 0 if not hablando else (2 if voz > 0.55 else 1)

        im = Image.new("RGBA", (CW * SS, CH * SS), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        S = lambda *xs: [x * SS for x in xs]
        g = G * SS
        cadera_x = CW / 2
        long_pierna = (L_MUSLO + L_PIERNA)
        cadera_y = SUELO - long_pierna * (0.97 + 0.03 * estirar) + bote

        # piernas
        for lado, sgn in (("izq", -1), ("der", 1)):
            ah, ar = piernas[lado]
            hx = cadera_x + sgn * 45
            kx = hx + L_MUSLO * math.sin(math.radians(ah))
            ky = cadera_y + L_MUSLO * math.cos(math.radians(ah))
            a2 = ah - ar
            fx = kx + L_PIERNA * math.sin(math.radians(a2))
            fy = min(SUELO, ky + L_PIERNA * math.cos(math.radians(a2)))
            d.line(S(hx, cadera_y - 15, kx, ky, fx, fy), fill=TINTA, width=g, joint="curve")
            for (x, y) in ((kx, ky),):
                d.ellipse(S(x - G / 2, y - G / 2, x + G / 2, y + G / 2), fill=TINTA)
            d.ellipse(S(fx - 30 + 8, fy - 15, fx + 30 + 8, fy + 18), fill=TINTA)

        # cuerpo (rotado por el balanceo alrededor de la cadera)
        cuerpo, (pvx, pvy) = capa_cuerpo(self.vest)
        cw, ch = cuerpo.size
        nh = int(ch * estirar)
        cuerpo_e = cuerpo.resize((cw, nh), Image.BILINEAR)
        piv = (pvx * SS, pvy * SS * estirar)
        cuerpo_r = cuerpo_e.rotate(-balanceo, center=piv, resample=Image.BICUBIC, expand=False)
        ox, oy = cadera_x * SS - piv[0], cadera_y * SS - piv[1]
        im.alpha_composite(cuerpo_r, (int(ox), int(oy)))
        alto_cuerpo = (CUERPO_H - 10) * estirar
        cuello = _rot(cadera_x, cadera_y - alto_cuerpo, cadera_x, cadera_y, balanceo)
        hombros = {lado: _rot(cadera_x + sgn * (CUERPO_W / 2 - 15), cadera_y - alto_cuerpo + 60, cadera_x, cadera_y, balanceo)
                   for lado, sgn in (("izq", -1), ("der", 1))}

        # cabeza (rotada alrededor del cuello)
        cab = capa_cabeza(self.vest, self.expr, boca, parp, mirar)
        ang_cab = balanceo * 0.6 + incl_cabeza
        piv_c = (300 * SS, 625 * SS)
        cab_r = cab.rotate(-ang_cab, center=piv_c, resample=Image.BICUBIC)
        im.alpha_composite(cab_r, (int(cuello[0] * SS - piv_c[0]), int((cuello[1] + 12 + cab_dy) * SS - piv_c[1])))

        # brazos (delante del cuerpo)
        for lado, sgn in (("izq", -1), ("der", 1)):
            ah, ae = brazos[lado]
            sx, sy = hombros[lado]
            a1 = math.radians(ah + (balanceo if sgn > 0 else -balanceo) * 0.3)
            ex, ey = sx + sgn * L_BRAZO * math.sin(a1), sy + L_BRAZO * math.cos(a1)
            a2 = a1 + math.radians(ae)
            hx, hy = ex + sgn * L_ANTEBRAZO * math.sin(a2), ey + L_ANTEBRAZO * math.cos(a2)
            d = ImageDraw.Draw(im)
            d.line(S(sx, sy, ex, ey, hx, hy), fill=TINTA, width=g, joint="curve")
            d.ellipse(S(sx - G / 2, sy - G / 2, sx + G / 2, sy + G / 2), fill=TINTA)
            d.ellipse(S(hx - 18, hy - 18, hx + 18, hy + 18), fill=TINTA)

        out = im.reduce(SS)
        if self.cfg.get("voltear"):
            out = out.transpose(Image.FLIP_LEFT_RIGHT)
        return out, (CW / 2, SUELO + 15)


if __name__ == "__main__":
    # tira de prueba: 8 fotogramas hablando con gestos
    p = Personaje(dict(vestuario="millonario", expresion="chulo", pose="normal", habla=True), duracion=4,
                  palabras=[(k * 0.5, "importantísimo") for k in range(8)])
    tira = Image.new("RGBA", (8 * 300, 450), (200, 215, 235, 255))
    for k in range(8):
        t = k * 0.5
        im, _ = p.frame(t, voz=0.7 if k % 2 else 0.3)
        tira.alpha_composite(im.resize((300, 450)), (k * 300, 0))
    q = Personaje(dict(vestuario="vaquero", expresion="enfadado", accion="caminar"), duracion=2)
    tira2 = Image.new("RGBA", (8 * 300, 450), (220, 230, 210, 255))
    for k in range(8):
        im, _ = q.frame(k * 0.075)
        tira2.alpha_composite(im.resize((300, 450)), (k * 300, 0))
    hoja = Image.new("RGB", (2400, 900)); hoja.paste(tira.convert("RGB"), (0, 0)); hoja.paste(tira2.convert("RGB"), (0, 450))
    import sys; hoja.save(sys.argv[1] if len(sys.argv) > 1 else "rig_prueba.jpg")
