# Guía de los shorts (v3, la vigente)

Instrucciones del dueño del canal. **Mandan sobre todo lo anterior.** Leer entera antes de cada short.
Idioma: español de España.

## 0. Flujo de trabajo
1. Investigar el tema y comprobar con búsquedas cada fecha, nombre, cifra y lugar. Si no se confirma, no se usa.
2. Entregar el guion **plano a plano en una tabla** (segundo, imagen, voz, personaje, texto en pantalla) y **ESPERAR el OK** antes de animar.
3. Voces, animación, subtítulos y música.
4. Renderizar, revisar (punto 10) y corregir.
5. Entregar en `output/` como `tema_en_minusculas.mp4` + `tema.txt` (títulos, descripción, hashtags).
   (Además, si se pide, subir a Drive "videos IA" con la receta comprimida <3 MB; ver al final.)

## 1. Gancho (0-2 s)
- El primer segundo enseña el **MOMENTO ESTRELLA** (clímax, resultado, lo imposible). Nunca un plano tranquilo o de contexto.
- **Lo que dice el texto se ve en la imagen en ese momento** (si dice "giró", se ve girar).
- Movimiento desde el fotograma 1 (zoom rápido, time-lapse, acción).
- Texto GRANDE, **máx. 8 palabras, con un dato concreto y sorprendente**.
- La voz arranca en el segundo 0 con **la misma frase**. Prohibido "¿Sabías que…?" / "Hoy te cuento…".
- Prueba: sin sonido y solo el primer segundo, ¿quiero saber qué pasa? Si no, rehacer.

## 2. Voces
- Narrador: natural, cercano, con energía, ritmo ágil y claro (Álvaro, `es-ES-AlvaroNeural`, `+10%`, `-2Hz`).
- **Cada personaje que habla tiene su propia voz** acorde a edad, sexo, carácter y época; emoción acorde a la escena.
- Frases de personajes cortas (máx. 1 frase) y solo cuando están en pantalla.
- edge-tts solo tiene 3 voces de España (Álvaro, Elvira, Ximena): para más personajes se distinguen con velocidad y tono (`--rate`, `--pitch`).
- Música baja que cambia con la tensión; efectos en los momentos clave. Audio a -14 LUFS, voz siempre por encima.
- **Mezcla con `tools/mezclar.py`** (voz comprimida +6 dB, música -13 dB y efectos -4 dB, ambos con ducking bajo la voz). Objetivo: **la voz ≥ 15 LU por encima del fondo** (el script lo mide). El dueño se quejó de que el fondo aplastaba al narrador en el short 06.

## 3. Estructura (30-40 s)
- 0-2 s gancho · 2-8 s contexto mínimo (dónde, cuándo, quién) · 8-20 s problema/tensión ("iban a… pero") · 20-30 s solución o dato más sorprendente con un plano claro.
- **Últimos 3-5 s: un dato NUEVO + una pregunta para comentarios.** Nunca repetir al final lo que dijo el gancho.

## 4. Ritmo
- Cambio de plano/zoom/movimiento cada 1,5-2,5 s; **ningún plano de más de 3 s**. Sin pausas ni relleno. Un "pero…" o giro a mitad.

## 5. Calidad visual
- Luz principal con sombras suaves + **luz de contorno** que separe personajes y objetos del fondo.
- Texturas y decorado en cada escena (farolas, coches, árboles, gente de fondo). Nada de cajas lisas ni fondos vacíos.
- **Desenfoque de fondo** en primeros planos; atmósfera suave en planos lejanos.
- Cámara de cine con aceleración y frenada; generales, medios y primeros planos; contrapicados para dar grandeza.
- **Nada de cenitales** que conviertan un edificio en un rectángulo. Los planos clave se entienden sin sonido.
- Referencias visuales para cifras: flechas, contadores, relojes acelerados, personas para dar escala.
- Desenfoque de movimiento en objetos rápidos; personajes con expresiones y gestos que cambian.
- Transiciones con intención (zoom de impacto, barrido, match cut). Nada de fundidos lentos.
- Partículas, polvo, chispas, humo, destellos y temblor en los impactos.
- Color con estilo propio por vídeo (cálido = antiguo, frío = tensión), contraste alto, colores vivos.
- Coherencia de estilo. Textos en pantalla con animación de entrada.

## 6. Subtítulos
- Bloques de 2-4 palabras, grandes, blancos con borde negro, clave en amarillo, sincronizados.
- **Posición: más abajo del centro** → bloque con `top: 1320px` (96 px, máx. 2 líneas, acaba hacia 1530 px, por encima del texto de abajo de TikTok/YouTube). Lo pidió el dueño tras el short 06 ("los subtítulos más abajo"); manda sobre el "tercio central" de la v3.
- Sin títulos pequeños arriba ni textos repetidos.

## 7. Final y bucle
- Sin fundido a negro ni pantalla final. El último plano enlaza visualmente con el primero.
- (La voz final da el dato nuevo + pregunta; el bucle es visual.)

## 8. Exportación
- 1080×1920, 30 fps, H.264, **≥12 Mbps** (`-b:v 14M -minrate 12M -maxrate 18M -bufsize 24M`), AAC 48 kHz. Sin pixelado ni bandas (render en PNG o JPG de alta calidad; `-tune animation` si hace falta).

## 9. `tema.txt`
- 3 títulos (máx. 60 caracteres, distintos del gancho, pensados para búsquedas), descripción de 1-2 frases, 3-5 hashtags con #Shorts.
- Recordar en TikTok la etiqueta de contenido generado con IA.

## 10. Revisión obligatoria
- ffmpeg: fotogramas de 0, 1, 2, la mitad y el final (mirarlos); duración, resolución, cortes (scene detection), sonoridad -14 LUFS.
- Capturas a tamaño completo de 3 escenas distintas: si alguna está vacía, plana o sin sombras, mejorarla.
- Repasar cada punto; si falla, corregir y volver a renderizar.
- Al terminar, **nota del 1 al 10** en gancho, voces, ritmo, calidad visual, subtítulos y final, y qué mejoraría.

## Herramientas
- Voz: `tools/voz.py` + `tools/apretar_pausas.py`. Banda sonora: `tools/banda_sonora.py`. Render: `tools/render_film.js`. Personajes: `personajes/personajes.js` + `tools/sprite.js`.
- Drive (si se pide): el conector solo admite ~3 MB; versión 1080p a dos pasadas `-preset veryslow -tune animation -b:v 540k` + AAC 64k.

## Histórico
- Shorts 01-02 (v1, 52 s, palabra a palabra). Shorts 03-05 (v2, 30-40 s, bucle repitiendo la frase del gancho; ya no vale en v3).
