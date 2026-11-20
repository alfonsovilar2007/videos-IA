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
- 2026-11-20 · Voz elegida: **C** = Chatterbox con referencia enérgica `shorts/voces/narrador_vivo.wav`, expresividad 1.0, cfg 0.3, velocidad 1.1. La quiere **viva**, no plana.
- 2026-11-20 · El diseño del muñeco era **demasiado simple** → versión trabajada: sombreado, guantes, zapatos, mangas y pantalones con volumen, ropa con detalle.
- 2026-11-20 · Personaje recurrente: **científico loco propio** (`vestuario: cientifico_loco`, pelo de pinchos, gafas gruesas, bata, `objeto: matraz`). El usuario pasó una imagen de Rick (Rick y Morty): **no copiar personajes con copyright**, solo el arquetipo.
- 2026-11-20 · Fórmula pedida: fondo de **laboratorio** aunque el dato no sea de laboratorio (mini gancho visual) + **mega gancho** en la primera frase (afirmación imposible sobre el espectador: "ahora mismo tu cuerpo…") + `gancho: true` (golpe de zoom y boom).
- 2026-11-20 · Duración pedida: **20 s** (≈ 55-60 palabras, 6 escenas).
- 2026-11-20 · Prompts de fondo: palabras como "mad scientist" hacen que la IA pinte **una persona** en el fondo. Usar "empty …", "nobody in the room" y describir solo el lugar. Revisar siempre el primer fotograma de cada fondo.
