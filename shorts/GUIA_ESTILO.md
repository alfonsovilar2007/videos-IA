# Guía de estilo de los shorts

Leer antes de hacer cada short nuevo. Recoge lo que el dueño del canal ha aprobado o pedido.

## Formato
- Vertical 1080×1920, 30 fps, 50-60 s. Locución de 150-170 palabras.
- Estructura: gancho 0-4 s (la paradoja + a veces un adelanto del final), desarrollo, giro a mitad ("O eso creían…"), remate y pregunta final al espectador.
- Un corte cada 2-4 s, cámara siempre en movimiento, zoom de golpe en cada corte, sacudida en los golpes.

## Imagen
- Escenarios 3D (three.js) con personajes 2D planos dentro ("3D raro").
- Personajes del canal: cabeza de judía color crema, contorno azul marino, brazos y piernas "fideo", coloretes; la ropa dice quién es (`personajes/personajes.js`).
- Cuidado con la luz: el bloom quema el papel claro y los sprites. Revisar hoja de contactos antes del render completo.

## Subtítulos
- Una palabra cada vez, centrada, blanca con contorno negro grueso; palabras clave en amarillo #FFD93B; "pop" de escala al entrar.
- **Posición vertical: `top: 1340px`** (pedido del dueño tras el short de Agloe: "un poco más abajo, no mucho más"; antes estaba en 1220px).
- Línea fija de contexto arriba (top 150px, 44px).

## Sonido
- Voz: edge-tts `es-ES-AlvaroNeural`, `--rate=+10%`, `--pitch=-2Hz`; pausas recortadas a 0,28 s (`tools/apretar_pausas.py`).
- Música y efectos originales (`tools/banda_sonora.py`); música atenuada bajo la voz; mezcla final a -14 LUFS, pico -1 dB.

## Entrega
- Enviar el MP4 en máxima calidad (CRF 18) como archivo descargable. No subir a Drive salvo que se pida (el conector solo admite ~3 MB).
