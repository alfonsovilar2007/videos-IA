#!/usr/bin/env bash
# Joins the Remotion picture (out/video.mp4, silent track) with the mix and the captions.
# -> out/ratas_subtitulos.mp4 (with one-word captions) and out/ratas_limpio.mp4 (no captions)
set -e
cd "$(dirname "$0")"
[ -f out/video.mp4 ] && [ -f audio/mix.wav ] && [ -f out/subs.ass ] || { echo "Falta out/video.mp4, audio/mix.wav o out/subs.ass"; exit 1; }
ffmpeg -y -loglevel error -i out/video.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -vf "ass=out/subs.ass" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/ratas_subtitulos.mp4
ffmpeg -y -loglevel error -i out/video.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/ratas_limpio.mp4
for f in out/ratas_subtitulos.mp4 out/ratas_limpio.mp4; do ffprobe -v error -show_entries stream=codec_type,width,height -show_entries format=duration -of compact "$f"; done
