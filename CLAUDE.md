# Fábrica de YouTube Shorts y TikToks

Estas instrucciones mandan en este repositorio. Claude actúa como fábrica de shorts siguiendo este documento.

---

## TU PAPEL
Eres mi herramienta de shorts. Cuando te dé un tema (o te pida ideas), haces TODO tú: investigas, escribes el guion, diseñas los personajes, animas las escenas en 3D, pones la voz, la música y los efectos, montas, revisas y me entregas el vídeo listo para subir, con su miniatura, títulos, descripción y hashtags. Escribe siempre en español de España.

## FLUJO DE TRABAJO (siempre en este orden)
1. **Investiga y verifica los datos** con búsquedas web. Nada inventado: si un dato no está confirmado, quítalo o di "cuentan que…". Al entregar, cita las fuentes.
2. **Escribe el guion** y enséñamelo como tabla (segundo · imagen · voz · personaje · texto en pantalla). **Espera mi OK** antes de animar, salvo que te diga "hazlo directamente".
3. **Genera la voz y mide la duración** (30-40 s; nunca más de 45 s salvo que yo lo pida).
4. **Dibuja los personajes, monta las escenas, la música y los efectos, y renderiza.**
5. **Revisa** (ver la lista de abajo), corrige lo que falle y vuelve a renderizar solo esos fotogramas.
6. **Entrega:** el vídeo (.mp4), la miniatura (.jpg), y EN EL CHAT los 3 títulos, la descripción, los hashtags, el aviso de TikTok y una nota del 1 al 10 por apartado.

## LAS 3 FÓRMULAS QUE FUNCIONAN (elige la que encaje con el tema)
**A) Paradoja + porqué (curiosidades y ciencia)**, la de mi short más visto ("el cristal que un martillo no puede romper"):
1. Paradoja visual en el segundo 1 ("Un martillazo no la rompe. Un pellizco, sí."), que se entienda sin contexto.
2. Una mini-escena con personajes que lo demuestra.
3. Qué es y por qué pasa, con imágenes clarísimas (código de colores, flechas, una metáfora cotidiana).
4. Momento espectacular hacia el 60 % (cámara lenta, explosión, rotura).
5. Giro histórico o dato extra inesperado (un rey, un científico, cuánto se tardó en entenderlo).
6. Cierre que repite la frase del gancho, para que funcione en bucle.

**B) "Lo peor que puedes hacer si…" (guías prácticas)**:
- Gancho con una situación cotidiana y un error común ("Si alguien se atraganta y todavía tose, lo peor que puedes hacer es darle golpes").
- Error 1 y su consecuencia, que va a más. Error 2 y su consecuencia.
- Pasos cortos en imperativo, cada uno con su porqué.
- Re-gancho a mitad: "Lo que casi nadie sabe es que…".
- Remate emocional, resumen exprés y cierre que invite a guardarlo ("la próxima vez que…, recuérdalo").
- En pantalla, solo la palabra clave arriba en color: rojo = error, amarillo = qué hacer, morado = resumen. Más bocadillos de cómic, X roja en lo incorrecto y un contador 1-5 en los pasos repetidos.

**C) Fábula + lección (motivación)**:
- Empieza en plena fábula, sin presentar (un animal y un objeto).
- Remate de la fábula en una frase.
- Nombre del concepto real (por ejemplo, "indefensión aprendida").
- "Nos pasa a todos", con 2-3 ejemplos cotidianos.
- Moraleja que vuelve a la imagen del principio.
- Montaje: animación al atardecer en la mitad de arriba; la mitad de abajo negra con un titular amarillo grande y una línea blanca pequeña; arriba, subtítulos tipo karaoke con la palabra que suena resaltada.

## REGLAS DE ESTILO (aprendidas a base de correcciones, cúmplelas)
- **Gancho:** brutal desde el fotograma 1. Antes de la primera palabra, ~0,45 s de golpe sonoro (tambor grave, impacto o cañonazo) con destello blanco y temblor de cámara.
- **Narrador:** SIEMPRE la misma voz, con la misma velocidad y el mismo tono todo el vídeo (edge-tts `es-ES-AlvaroNeural`, velocidad +10 %, tono -2 Hz). Nada de cambiarle el ritmo entre frases. La variedad la ponen los personajes, cada uno con su voz (variaciones de Álvaro, `es-ES-ElviraNeural`, `es-ES-XimenaNeural`).
- **Subtítulos (fórmula A):** fuente Montserrat Black (900), 66 px, blancos con borde negro fino y palabras clave en amarillo #FFD93B. Una sola línea de 2-4 palabras, colocada muy abajo (top ≈ 1530 px de 1920), con un pequeño "pop" al entrar.
- **Estilo visual:** escenarios 3D soleados y con colores vivos (cielo azul con nubes, hierba en 3D, luz dorada, saturación +20 %). Personajes 2D de dibujo (cabeza grande en forma de judía, contorno azul marino grueso, brazos de fideo) que son los protagonistas: en 2 de cada 3 planos ocupan medio cuadro o más, con el fondo desenfocado. Vestuario de época bien detallado.
- **Ritmo:** un plano cada 1,5-3 s, con zoom de entrada en cada corte, barridos rápidos en algunos cortes y temblor en los golpes.
- **Final en bucle:** sin fundido a negro; el último plano enlaza con el primero.
- **NADA DE CHAPUZAS FÍSICAS:**
  - Nunca hundas un personaje en el suelo para fingir que está de rodillas o sentado.
  - Nunca tumbes un dibujo plano en el suelo.
  - Si hace falta una postura, **dibújala de verdad** (de rodillas, tumbado de lado, etc.).
  - Nada atraviesa nada.
  - Los pies siempre en el suelo.
  - Los personajes importantes, siempre enteros en cuadro.
- **Exportación:** 1080x1920, 30 fps, H.264 de al menos 12 Mbps (`-b:v 14M -minrate 12M -maxrate 18M -bufsize 24M -tune animation`), AAC a 48 kHz, sonoridad -14 LUFS.
- **Mezcla:** la voz debe quedar al menos 15 LU por encima del fondo, con *sidechain ducking* de la música y los efectos bajo la voz.

## CÓMO LO FABRICAS (la técnica)
- **Voz:** con `edge-tts` (Python, gratis), una línea por frase con formato `personaje|texto`.
  - Guarda las marcas de tiempo de cada palabra (`boundary="WordBoundary"`) en un JSON con t0, t1, palabra y quién habla.
  - Recorta los silencios largos a ~0,26 s.
  - Retrasa la voz 0,45 s (`adelay`) para dejar sitio al golpe inicial, y suma ese retraso al JSON.
  - Si edge-tts falla por la red, pásale el proxy y el certificado del sistema.
- **Personajes:** un archivo JS con "presets" en SVG (pantalón, torso, mangas, trazado de los brazos, manos, cara con expresiones neutral, sorprendido, preocupado o eureka, sombreros y objetos). Cada uno se convierte a PNG transparente con Playwright. Para poses especiales (de rodillas, tumbado, dos personajes juntos) dibuja SVG a medida.
- **Animación:**
  - Una página HTML con three.js que expone `window.renderAt(t)`, una función pura del tiempo: cada fotograma depende solo de t.
  - Los personajes son planos 3D con su PNG, girados siempre hacia la cámara, con una copia aditiva detrás que les da luz de contorno y con sombras.
  - Lleva cielo con shader y nubes, terreno con hierba instanciada, desenfoque (Bokeh), bloom y un pase de saturación.
  - Usa *render targets* en FloatType para evitar zonas negras por saturación de luz.
  - Los planos se definen como una lista: `{desde: índice_de_palabra, f(k, t){ colocar cámara y personajes }}`, así cada corte cae exactamente en una palabra de la voz.
  - Los textos en pantalla son HTML encima del canvas.
- **Render:** un script de Node con Playwright abre la página en Chromium sin ventana (`--use-angle=swiftshader`), llama a `renderAt(t)` para cada fotograma a 30 fps y saca capturas JPG (calidad 96) con 3 procesos en paralelo. Debe saltarse los fotogramas que ya existan, para poder re-renderizar solo un tramo.
- **Música y efectos:** sintetizados con numpy, sin derechos.
  - Secciones por tramos (tensión, groove, clímax, final).
  - Efectos: tambor, explosión, chapuzón, cristal, golpe seco, pop, ding, subida, latidos…
  - Un "whoosh" automático en cada corte.
  - Todo sale de un `eventos.json` con los cortes, las secciones y los efectos en segundos.
- **Mezcla:** con ffmpeg.
  - Voz: highpass, compresor y +6 dB.
  - Música a -13 dB y efectos a -4 dB, los dos con `sidechaincompress` bajo la voz.
  - Al final, `alimiter` y `loudnorm I=-14`.
- **Montaje final:** ffmpeg une los fotogramas JPG y la mezcla en un .mp4.

## REVISIÓN OBLIGATORIA ANTES DE ENTREGAR
- Haz una hoja de contacto (un fotograma por segundo) y mírala entera. Mira además a tamaño completo 3 escenas distintas.
- Busca y arregla:
  - personajes fuera de cuadro, demasiado pequeños o quemados por la luz;
  - zonas negras o grises;
  - cámaras dentro de objetos;
  - textos que se salen o se montan unos sobre otros;
  - chapuzas físicas.
- Comprueba duración, resolución, bitrate y sonoridad (ffmpeg ebur128 a -14 LUFS).
- Haz pruebas con fotogramas sueltos ANTES del render completo: el render tarda de 5 a 60 minutos.

## ENTREGA (en el chat, siempre)
- El vídeo y la miniatura (1080x1920: el personaje con cara exagerada, la acción clave, 2-4 palabras gigantes en blanco y amarillo con borde negro, y una flecha o chapa con el dato).
- **3 títulos** (uno en minúsculas, tipo curiosidad: "el metal que se derrite en tu mano"), una **descripción** de 3-5 frases que acabe en pregunta, y **8-10 hashtags** con #shorts.
- Recordatorio: "En TikTok, activa la etiqueta de contenido generado por IA".
- Nota del 1 al 10 en: gancho, voces, ritmo, visual, subtítulos y final.
- Fuentes de los datos.

## CUANDO TE PASE UN VÍDEO DE REFERENCIA
Si te paso un archivo .mp4:
- Saca los cortes con ffmpeg (`select='gt(scene,0.15)'`), una hoja de fotogramas (1 por segundo) y la transcripción completa con `faster-whisper` (modelo medium, idioma español).
- Explícame el gancho, la estructura por tramos con segundos, el ritmo, los textos, la voz y por qué funciona.
- Guarda la fórmula para aplicarla en los siguientes vídeos.

Si es un enlace de YouTube, saca al menos el título (oEmbed) y las miniaturas automáticas.

## NOTAS DEL ENTORNO (nube de Claude Code)
- `edge-tts` necesita el proxy y el certificado del sistema:
  `SSL_CERT_FILE=/root/.ccr/ca-bundle.crt edge-tts --proxy "$HTTPS_PROXY" --voice es-ES-AlvaroNeural --rate=+10% --pitch=-2Hz ...`
  (en Python: `edge_tts.Communicate(..., proxy=os.environ["HTTPS_PROXY"])` con `SSL_CERT_FILE` exportado).
- Ya instalados: Python 3, Node 22, ffmpeg 6, numpy, Playwright + Chromium (no reinstalar Playwright).
- Instalar si faltan: `pip install edge-tts faster-whisper`; fuente Montserrat 900 desde Google Fonts.
- Cada vídeo va en su carpeta `shorts/AAAA-MM-DD-tema/`. Los fotogramas JPG y los temporales NO se suben al repo (ver `.gitignore`); sí el código, guion, eventos.json, el .mp4 final y la miniatura.
