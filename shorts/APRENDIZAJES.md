# Aprendizajes (el "entrenamiento")

Correcciones y preferencias del usuario. **Mandan sobre las reglas generales de la skill.** Añade cada nueva corrección con fecha y en una línea.

## Preferencias fijas
- 2026-11-20 · Idioma: **español** (guion, voz y subtítulos).
- 2026-11-20 · **Todo gratis**: nada de APIs de pago ni planes de prueba (ni ElevenLabs ni Creative Claw). Solo herramientas locales y gratuitas.
- 2026-11-20 · Referencia de formato: @RicksClips3000 (ver `analisis/ricksclips3000/ANALISIS.md`). Se copia el formato, **no** sus personajes ni sus temas exactos.

## Correcciones
- 2026-11-20 · El escenario **no puede ser una imagen plana**: tiene que verse en 3D, con la cámara moviéndose (paralaje real) → motor3d (malla 3D a partir de la profundidad). No volver al zoom 2D.
- 2026-11-20 · El muñeco tiene que **moverse de forma natural**: articulado, con gestos, parpadeo, respiración y al caminar → rig.py. Usar `accion: caminar` y poses variadas.
- 2026-11-20 · La voz de Kokoro suena **demasiado robótica** → por defecto Chatterbox Multilingual con voz de referencia.
