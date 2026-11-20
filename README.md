# videos-IA

## Generador de Shorts gratis e ilimitado (`shorts/`)

Convierte un guion de texto en un Short vertical (1080×1920, MP4) con voz en off en español y subtítulos grandes palabra a palabra. Todo se hace en tu propio ordenador o servidor, sin créditos ni cuotas.

```bash
bash shorts/setup.sh                                  # una sola vez
python shorts/make_short.py guion.txt short.mp4       # fondo animado
python shorts/make_short.py guion.txt short.mp4 --bg clip.mp4   # con vídeo de fondo
```

- `guion.txt`: una frase por línea (mira `shorts/ejemplo.txt`; el resultado es `shorts/ejemplo.mp4`).
- `--bg`: cualquier vídeo (de stock, generado con IA o grabado por ti). Se repite en bucle y se recorta a 9:16.
- Velocidad: un Short de 16 s tarda unos 15 s en un servidor de 4 núcleos sin GPU.
