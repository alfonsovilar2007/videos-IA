# Guía de los shorts (v3, la vigente)

Instrucciones del dueño del canal. **Mandan sobre todo lo anterior.** Leer entera antes de cada short.
Idioma: español de España.

## 0b. FÓRMULA VIRAL (la de los shorts que más funcionan: nuestro "cristal que un martillo no puede romper" y "Why the Second Draw Always Wins" de Ricks Clips)
1. **Paradoja visual en el segundo 1**: una afirmación que choca con la intuición + la prueba en imagen ("Un martillazo no la rompe. Un pellizco, sí."). Se entiende sin contexto.
2. **Mini-escena con personajes** que demuestra la paradoja (duelo, experimento, alguien que lo intenta y falla), con caras muy expresivas (sudor, ojos abiertos).
3. **Qué es / el porqué** explicado con imágenes clarísimas: código de colores, flechas, una metáfora cotidiana ("apretada como un puño").
4. **Momento espectacular hacia el 60 %** (cámara lenta, explosión, revelación).
5. **Giro histórico o dato extra** que no te esperas (un rey, un científico famoso que lo probó, cuánto se tardó en entender).
6. **Cierre que repite la frase del gancho** → bucle perfecto, la gente lo ve dos veces.
- 30-37 s, ~3 palabras/s, un corte cada ~1,5 s, 3-4 escenarios, cambios de luz (día/noche) para marcar el paso del tiempo.

## 0c. FORMATO "GUÍA PRÁCTICA / LO PEOR QUE PUEDES HACER" (reel viral del perro que se escapa, analizado tras el short 11)
Transcripción completa en `referencias/reel_perro_escapa_transcripcion.txt`. 82 s, ~2,5 palabras/s, un solo narrador cercano en 2.ª persona ("tú").
1. **Gancho (0-5 s)**: situación cotidiana + error común → "Si tu perro se te escapa, lo peor que puedes hacer es correr detrás de él." Imagen: el problema ya pasando (el perro huye, el dueño detrás).
2. **Error 1 + consecuencia que escala (5-14 s)**: por qué empeora ("cree que es el mejor juego del mundo") → peligro (directo a la avenida, coche rojo).
3. **Error 2 + consecuencia (14-24 s)**: "regañarlo cuando vuelve" → "la próxima vez ya no vuelve".
4. **Solución en pasos cortos (24-45 s)**: verbos en imperativo (agáchate, voz alegre, aplaude, corre hacia el otro lado, sacude la bolsa) y el porqué de cada uno.
5. **Re-gancho a mitad (45-55 s)**: "Lo que casi nadie sabe es que…" + truco contraintuitivo (no mirarle de frente, ponerse de lado).
6. **Cierre del proceso (55-62 s)**: qué hacer cuando llega (no agarrar del collar, premio, caricia, correa).
7. **Remate emocional/humor (62-70 s)**: "te mira como si el perdido fueras tú".
8. **Resumen exprés (70-77 s)**: "No lo correteas ni lo regañas. Te agachas, lo llamas contento y corres para el otro lado", repitiendo los planos clave con una X roja en los errores.
9. **Cierre que invita a guardar (77-82 s)**: "la próxima vez que se quede abierta la puerta de la calle, recuerda."
**Visual**: dibujo plano tipo cómic (cel shading, colores pastel, contorno fino), casas rosas/azules/verdes, cámara cenital o en picado que sigue la acción, pocos cortes duros (~6 en 82 s; el ritmo lo dan la animación y los movimientos de cámara). Personaje sin cara (gorra roja), el perro muy expresivo.
**Texto en pantalla**: solo la **palabra clave** de cada frase, arriba (y ≈ 3-5 %), en minúsculas gruesas con borde: **rojo = error**, **amarillo = lo que hay que hacer**, **morado = resumen**. Bocadillos de cómic pequeños ("¡CANELA!", "¡MAL HECHO!", "¡VAMOS A PASEAR!", "¿DÓNDE ANDABAS?"), flechas de trayectoria discontinuas rojas, X roja en lo incorrecto, "?" y "!" sobre el perro.
**Por qué funciona**: utilidad (se guarda y se comparte), miedo real y cotidiano, enfoque "errores que todos cometemos", un truco que casi nadie sabe a mitad, final emotivo y resumen para recordar.

## 0d. FORMATO "FÁBULA + LECCIÓN" (reel de la serpiente y el serrucho; usado en el short 13, el elefante)
Transcripción en `referencias/reel_serpiente_serrucho_transcripcion.txt`. 1) Empieza en plena fábula, sin presentar (animal + objeto). 2) Remate de la fábula en una frase ("No fue el serrucho, fue su reacción"). 3) Nombre del concepto ("efecto caballo salvaje", "indefensión aprendida") + fórmula corta. 4) "Nos pasa a todos": 2-3 ejemplos cotidianos. 5) Moraleja que vuelve a la imagen del principio ("acuérdate de la serpiente / del elefante").
**Montaje**: animación en la mitad de arriba (atardecer naranja-morado, siluetas, sin cortes duros), mitad de abajo negra con **titular amarillo grande** (2-3 palabras, mayúsculas) + línea blanca pequeña; arriba subtítulo tipo **karaoke** con la palabra que suena resaltada en amarillo. Tono tranquilo. Máximo 40 s (pedido del dueño).

## 0. Flujo de trabajo
1. Investigar el tema y comprobar con búsquedas cada fecha, nombre, cifra y lugar. Si no se confirma, no se usa.
2. Entregar el guion **plano a plano en una tabla** (segundo, imagen, voz, personaje, texto en pantalla) y **ESPERAR el OK** antes de animar.
3. Voces, animación, subtítulos y música.
4. Renderizar, revisar (punto 10) y corregir.
5. Entregar en `output/` como `tema_en_minusculas.mp4` + `tema.txt` (títulos, descripción, hashtags).
   (Además, si se pide, subir a Drive "videos IA" con la receta comprimida <3 MB; ver al final.)

## 1. Gancho (0-2 s)
- **Golpe sonoro antes de la primera palabra**: ~0,45 s de tambor + cañonazo/impacto con destello y temblor, y luego entra la voz (retrasar la voz con `adelay` y sumar el mismo tiempo al JSON). Pedido tras el short 10.
- Preferencia del dueño: **gancho brutal** (impacto, catástrofe, lo imposible) y, si puede ser, **curiosidad histórica**.
- Tras el short 07 pidió un gancho **todavía más fuerte, "como una bala de pistola"**: acción extrema en cámara lenta, en primerísimo plano, desde el fotograma 1.
- El primer segundo enseña el **MOMENTO ESTRELLA** (clímax, resultado, lo imposible). Nunca un plano tranquilo o de contexto.
- **Lo que dice el texto se ve en la imagen en ese momento** (si dice "giró", se ve girar).
- Movimiento desde el fotograma 1 (zoom rápido, time-lapse, acción).
- Texto GRANDE, **máx. 8 palabras, con un dato concreto y sorprendente**.
- La voz arranca en el segundo 0 con **la misma frase**. Prohibido "¿Sabías que…?" / "Hoy te cuento…".
- Prueba: sin sonido y solo el primer segundo, ¿quiero saber qué pasa? Si no, rehacer.

## 2. Voces
- **Narrador SIEMPRE con la misma voz, velocidad y tono** (`narrador` de `tools/voces.py`: Álvaro +10 %, -2 Hz), sin cambiar de una frase a otra y sin ecualizador extra. El dueño lo pidió tras el short 10 ("cambia todo el rato, me gustaba más la de antes"). La variedad la ponen los personajes (soldado, sultán…), no el narrador.
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
- Preferencia del dueño: **fondos lo más realistas posible** (texturas con relieve, luz de sol y cielo creíbles, bruma, mucho detalle de época). El escenario del short 07 (calle de Boston) le gustó mucho: **cada short, un paso más realista** (materiales PBR con relieve, reflejos del cielo, sombras largas, detalle de fondo, nada oscuro ni vacío).
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

## 6. Subtítulos (v4, elegido por el dueño tras el short 09: opción "B, mucho más abajo")
- Fuente **Montserrat Black (900)**, local en `fuentes/montserrat-latin-900-normal.woff2` (cargar con `@font-face` desde `/fuentes/...`).
- **66 px**, blanco, borde negro fino `-webkit-text-stroke: 11px #000` + `paint-order: stroke`, sombra `0 6px 0 rgba(0,0,0,.5)`, `letter-spacing: -.5px`. Palabras clave en amarillo `#FFD93B`.
- **Una sola línea** de 2-4 palabras (si no cabe, partir el bloque), sincronizada con la voz, pequeño "pop" de escala al entrar.
- **Posición: mucho más abajo → `top: 1530px`** (la línea acaba hacia 1610 px). Manda sobre los 1320 px anteriores.
- Frases de personajes en cursiva. Sin títulos pequeños arriba ni textos repetidos.
- El texto del gancho (arriba) puede seguir en Montserrat Black más grande (~76 px).

## 6b. Animación tipo "Ricks Clips" (pedido tras el short 09)
Referencia: youtube.com/shorts/i4hYq1oSXTg. Parecerse en la animación **sin perder nuestra esencia** (nuestros personajes, voz, gancho brutal, subtítulos grandes con clave en amarilla).
- **Personajes protagonistas**: en 2 de cada 3 planos un personaje ocupa medio cuadro o más, a la altura de los ojos o en contrapicado suave, con fondo desenfocado (DOF). El escenario es decorado, no el protagonista.
- **Escenas de diálogo y grupo**: 2-4 personajes que se miran y reaccionan; multitudes y ejércitos de personajes con estandartes cuando toque.
- **Luz soleada y colores saturados**: cielo azul con nubes, luz dorada, sombras definidas, hierba con briznas en 3D, piedra y madera con mucho relieve. Nada de neblina gris que lave la imagen.
- **Vestuario rico**: cascos, armaduras, uniformes y peinados de la época sobre nuestra cabeza de judía.
- Cámara cercana con movimientos suaves (empujes y arcos lentos alrededor del personaje).

## 7. Final y bucle
- Sin fundido a negro ni pantalla final. El último plano enlaza visualmente con el primero.
- (La voz final da el dato nuevo + pregunta; el bucle es visual.)

## 8. Exportación
- 1080×1920, 30 fps, H.264, **≥12 Mbps** (`-b:v 14M -minrate 12M -maxrate 18M -bufsize 24M`), AAC 48 kHz. Sin pixelado ni bandas (render en PNG o JPG de alta calidad; `-tune animation` si hace falta).

## 9. `tema.txt` y textos en el mensaje
- **OBLIGATORIO: en el mensaje de entrega del vídeo, poner SIEMPRE en el propio chat los 3 títulos y la descripción con hashtags lista para copiar** (en bloque de código), además de guardarlos en `output/tema.txt`. El dueño lo pidió tras el short 06: no basta con el archivo.
- 3 títulos (máx. 60 caracteres, distintos del gancho, pensados para búsquedas), descripción de 1-2 frases, 3-5 hashtags con #Shorts.
- Recordar en TikTok la etiqueta de contenido generado con IA.

## 10. Revisión obligatoria
- Checklist final del mensaje de entrega: vídeo (tarjeta), revisión técnica, **títulos + descripción + hashtags en el chat**, aviso de etiqueta IA en TikTok, notas del 1 al 10.
- ffmpeg: fotogramas de 0, 1, 2, la mitad y el final (mirarlos); duración, resolución, cortes (scene detection), sonoridad -14 LUFS.
- Capturas a tamaño completo de 3 escenas distintas: si alguna está vacía, plana o sin sombras, mejorarla.
- Repasar cada punto; si falla, corregir y volver a renderizar.
- Al terminar, **nota del 1 al 10** en gancho, voces, ritmo, calidad visual, subtítulos y final, y qué mejoraría.

## 10b. NADA DE CHAPUZAS FÍSICAS (pedido tras el short 12: "meter al personaje debajo de tierra")
- **Nunca hundir un personaje en el suelo** para fingir que está de rodillas o sentado: se dibuja la **pose de verdad** en `personajes.js` (de rodillas, sentado, tumbado de lado…).
- **Nada de sprites tumbados en plano** (un dibujo plano tirado en el suelo queda raro): para tumbado se hace una pose dibujada de perfil o se encuadra para que no se note.
- Nada atraviesa nada: personajes, mesas, sillas y objetos no se cruzan; los pies siempre apoyados en el suelo (ni flotando ni enterrados).
- Cada acción la hace la pose correcta: si el guion dice "de rodillas haciendo la reanimación", el dibujo está de rodillas con las manos en el pecho, no un personaje genérico movido.
- Todos los personajes que hablan o importan salen **enteros en cuadro**.
- En la revisión, mirar **cada plano a tamaño completo** buscando estas chapuzas antes de renderizar; si hay alguna, se arregla antes de entregar.

## Herramientas
- Voz: `tools/voz.py` + `tools/apretar_pausas.py`. Banda sonora: `tools/banda_sonora.py`. Render: `tools/render_film.js`. Personajes: `personajes/personajes.js` + `tools/sprite.js`.
- Drive (si se pide): el conector solo admite ~3 MB; versión 1080p a dos pasadas `-preset veryslow -tune animation -b:v 540k` + AAC 64k.

## Histórico
- Shorts 01-02 (v1, 52 s, palabra a palabra). Shorts 03-05 (v2, 30-40 s, bucle repitiendo la frase del gancho; ya no vale en v3).
