---
name: crear-short
description: Crea un short vertical viral completo (guion con gancho, voz, fondos, muñecos, subtítulos palabra a palabra y montaje) a partir de un tema que pida el usuario, gratis y en local. Úsala siempre que el usuario pida un short, un vídeo, un guion o "hazme uno sobre X".
---

# Crear un short de curiosidades

El usuario solo dice el tema (o pide ideas). Tú haces todo lo demás y entregas el MP4.

## 0. Preparación (solo si falta)
Si `/opt/shorts-venv/bin/python` no existe, ejecuta `bash shorts/instalar.sh` (unos 5 min).

## 1. Lee lo aprendido
Lee **`shorts/APRENDIZAJES.md`** antes de escribir nada. Ahí están las correcciones del usuario y mandan sobre todo lo de este archivo.

## 2. Elige y verifica el tema
- Si el usuario no da tema, propón 5 con la fórmula de abajo y deja que elija.
- Comprueba los datos con una búsqueda web. **Nunca te inventes hechos históricos.** Si algo es dudoso, dilo en el guion ("se dice que…") o descártalo.
- Temas que funcionan: algo real, poco conocido y **contraintuitivo**, que se explique en menos de 45 s. Hay 4 familias:
  1. Trampas, engaños y golpes históricos.
  2. Ingeniería invisible del día a día (por qué X tiene esta forma).
  3. Experimentos y psicología raros.
  4. Tácticas militares o marinas ingeniosas.

## 3. Escribe el guion (`guiones/<slug>.json`)
El formato exacto está en `shorts/FORMATO_GUION.md`. Reglas:

**Título** (4-7 palabras, Title Case, sin emojis). Usa una de estas plantillas:
- "Por Qué [grupo/cosa] [hecho raro]"
- "Cómo Funcionaba [cosa]" / "Cómo Un/Una [cosa pequeña] [hizo algo enorme]"
- "El/La [cosa] Que [consecuencia]"
- "Este/Esta [cosa] Salvó [algo]"

**Estructura** (100-130 palabras en total, 30-45 s, 7-10 escenas de 1-2 frases):
1. **Gancho, escena 1 (≤ 2 s, ≤ 12 palabras):** una pregunta o paradoja que obligue a quedarse. Nada de saludos ni "hoy os cuento".
2. **Contexto:** quién, cuándo, dónde, con un personaje que tenga actitud.
3. **Explicación:** el truco paso a paso, una idea por escena.
4. **Giro:** el dato más sorprendente o la consecuencia graciosa, guardado para el final.
5. **Cierre en bucle:** la última frase termina de forma que enlace con la primera ("…por qué la luz roja siempre está arriba." → vuelve a empezar "¿Por qué la luz roja…").

Estilo: frases cortas, lenguaje hablado, segunda persona ("fíjate", "imagina"), números escritos con letras ("mil ochocientos") para que la voz los lea bien.

**Escenas:** el `fondo` es un prompt **en inglés** que describe solo el lugar (sin personas). Cambia de lugar o de plano en cada escena. Los personajes salen de `shorts/personaje.py`: elige vestuario por época y rol, y una expresión que exagere la emoción de la frase.

## 4. Genera
```bash
/opt/shorts-venv/bin/python shorts/generar.py guiones/<slug>.json
```
Tarda unos 10 min, sobre todo por los fondos, que tardan ~55 s cada uno y se guardan en caché. Lánzalo en segundo plano.

## 5. Revisa antes de entregar
- Mira `salida/<slug>/vista_previa.jpg` y extrae algún fotograma más con ffmpeg si hace falta. Comprueba que el fondo encaja, que no aparecen personas ni texto raro generados por la IA y que los subtítulos no tapan caras.
- Si un fondo sale mal, cambia su prompt y vuelve a generar (los demás salen de la caché).

## 6. Entrega
Envía `salida/<slug>/short.mp4` al usuario con `titulo.txt` (título, descripción y hashtags) y `subtitulos.srt`. Haz commit del guion (los MP4 no se suben, están en .gitignore).

## 7. Aprende
Cada vez que el usuario corrija algo (tono, ritmo, voz, tipo de gancho, personajes, temas que no le gustan…), **añádelo a `shorts/APRENDIZAJES.md`** con fecha y haz commit. Ese archivo es el entrenamiento.
