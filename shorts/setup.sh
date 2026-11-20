#!/usr/bin/env bash
# Installs the free Short generator: Piper (local voice) + Spanish voice. Needs python3, ffmpeg.
set -e
cd "$(dirname "$0")"
pip install -q piper-tts
mkdir -p voices
for e in onnx onnx.json; do
  [ -f voices/es_ES-davefx-medium.$e ] || curl -sL -o voices/es_ES-davefx-medium.$e \
    https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/davefx/medium/es_ES-davefx-medium.$e
done
echo "Listo: python shorts/make_short.py guion.txt salida.mp4"
