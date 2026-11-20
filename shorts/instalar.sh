#!/usr/bin/env bash
# Instala todo lo necesario para generar shorts (gratis, sin claves API). Tarda ~8 min la primera vez.
set -e
cd "$(dirname "$0")"
command -v espeak-ng >/dev/null || { apt-get update -qq && apt-get install -y -qq espeak-ng ffmpeg; }
command -v uv >/dev/null || pip install -q uv
# Entorno principal: Kokoro, Whisper, SDXL-Turbo, Depth Anything
[ -x /opt/shorts-venv/bin/python ] || uv venv -q -p python3.12 /opt/shorts-venv
VIRTUAL_ENV=/opt/shorts-venv uv pip install -q torch kokoro soundfile faster-whisper diffusers transformers accelerate pillow scipy
# Entorno de voz natural: Chatterbox Multilingual (MIT)
[ -x /opt/voz-venv/bin/python ] || uv venv -q -p python3.11 /opt/voz-venv
VIRTUAL_ENV=/opt/voz-venv uv pip install -q chatterbox-tts "setuptools<81"
# Motor 3D: three.js (Chromium y Playwright ya vienen en el entorno)
(cd motor3d && npm install --silent)
echo "Listo"
