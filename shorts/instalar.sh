#!/usr/bin/env bash
# Instala todo lo necesario para generar shorts (gratis, sin claves API).
set -e
command -v espeak-ng >/dev/null || { apt-get update -qq && apt-get install -y -qq espeak-ng ffmpeg; }
command -v uv >/dev/null || pip install -q uv
[ -x /opt/shorts-venv/bin/python ] || uv venv -q -p python3.12 /opt/shorts-venv
VIRTUAL_ENV=/opt/shorts-venv uv pip install -q torch kokoro soundfile faster-whisper diffusers transformers accelerate pillow scipy
echo "Listo: /opt/shorts-venv"
