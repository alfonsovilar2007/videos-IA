# Guía de estilo de los shorts

Leer antes de hacer cada short nuevo. Recoge lo que el dueño del canal ha aprobado o pedido.
Las **instrucciones obligatorias** (v2) mandan sobre cualquier costumbre anterior.

## 1. Formato (obligatorio)
- Vertical 9:16, 1080×1920, 30 fps.
- **Duración 30-40 s. Nunca más de 45 s.** (≈ 95-115 palabras con la voz de Álvaro y pausas recortadas).
- Audio a -14 LUFS; la voz clara y por encima de la música.

## 2. Gancho (0-2 s): lo más importante
- **El primer fotograma es el plano MÁS impactante** del vídeo (el momento clave, el choque, el resultado, el antes/después). Nada de introducción.
- **Movimiento desde el primer fotograma.** Nada de planos estáticos.
- La frase gancho se dice en el segundo 0 **y se escribe GRANDE en pantalla** (máx. 8 palabras, que genere curiosidad o sorpresa).
- **Nada de títulos pequeños arriba.** Si hay título, grande y solo los 2 primeros segundos.

## 3. Ritmo
- Cambio de plano, zoom o movimiento de cámara **cada 1,5-2,5 s**. Primer cambio de plano **antes del segundo 2**.
- Sin pausas ni silencios; cada frase aporta algo nuevo.
- Estructura: gancho → contexto rápido → giro o dato sorprendente → explicación → cierre.

## 4. Subtítulos
- **Bloques de 2 a 4 palabras, nunca palabra a palabra.**
- Letra grande, blanca con borde negro, palabras clave en amarillo #FFD93B.
- En el **tercio central** de la pantalla (entre 640 y 1280 px de alto), lejos de los botones de la derecha y del texto de abajo de TikTok/YouTube. Margen lateral ≥ 90 px.
- No repetir en pantalla un texto que ya está en el subtítulo (sellos y rótulos solo si dicen algo distinto).

## 5. Aspecto visual
- Colores vivos y buen contraste; nada de escenas grises o apagadas.
- Colores de acento (rojo, azul, amarillo) para marcar los momentos clave.
- Escenarios 3D (three.js) con personajes 2D planos dentro. Personajes del canal: cabeza de judía crema, contorno azul marino, brazos "fideo" (`personajes/personajes.js`).
- Cuidado con la luz: el bloom quema el papel claro y los sprites. Revisar hoja de contactos antes del render completo.

## 6. Final
- **Nada de fundido a negro ni pantalla final.**
- El último plano y la última frase enlazan con el principio para que el vídeo haga **bucle**.

## 7. Datos
- **Comprobar con búsqueda** cada fecha, nombre, cifra y modelo antes de usarlo. Si no se puede confirmar, no se pone.

## 8. Publicación (entregar aparte en texto)
- 3 opciones de título corto (máx. 60 caracteres).
- Descripción de 1-2 frases + 3-5 hashtags relevantes (incluye #Shorts).
- Recordar que en TikTok hay que **marcarlo como contenido generado con IA**.

## Antes de entregar
- Capturas de los segundos **0, 1, 2 y del final**; comprobar cada punto de esta guía y corregir lo que falle.
- Enviar el MP4 en máxima calidad (CRF 18) como archivo descargable.
- **Subir a la carpeta "videos IA" de Drive** (id `1A4aA9L1MdYE9bFSJOSG1mQla2KeTns15`). Ojo: el conector solo admite ~3 MB por envío desde las sesiones en la nube; si el vídeo no cabe, avisar y proponer opciones.

## Sonido y voz
- Voz: edge-tts `es-ES-AlvaroNeural`, `--rate=+10%`, `--pitch=-2Hz`; pausas recortadas a 0,28 s (`tools/apretar_pausas.py`).
- Música y efectos originales (`tools/banda_sonora.py`); música atenuada bajo la voz; mezcla final a -14 LUFS, pico -1 dB.

## Histórico
- Short 01 (Agloe) y 02 (ventanas): 52 s, subtítulos palabra a palabra y línea de contexto arriba. Ya no se hace así (v2).
