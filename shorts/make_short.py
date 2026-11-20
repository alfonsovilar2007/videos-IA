"""Generate a vertical YouTube Short (1080x1920) from a text script, 100% free and local.

Usage:
  python shorts/make_short.py guion.txt salida.mp4 [--voice voices/es_ES-davefx-medium.onnx] [--bg fondo.mp4]

guion.txt: one sentence per line. Voice: Piper (local). Captions: burned-in, word by word.
Background: --bg video (stock, AI clip, your footage), looped and cropped to 9:16; otherwise an animated gradient.
"""
import argparse, subprocess, sys, tempfile, wave
from pathlib import Path

W, H, FPS, PAUSE = 1080, 1920, 30, 0.25
WORDS_PER_CAPTION = 3


def tts(text, model, out):
    subprocess.run([sys.executable, "-m", "piper", "-m", model, "-f", str(out)],
                   input=text.encode(), check=True, capture_output=True)
    with wave.open(str(out)) as w:
        return w.getparams(), w.readframes(w.getnframes())


def ass_time(t):
    cs = round(t * 100)
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def captions(timed_sentences):
    head = (
        "[Script Info]\nScriptType: v4.00+\nPlayResX: %d\nPlayResY: %d\n\n[V4+ Styles]\n"
        "Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, "
        "BorderStyle, Outline, Shadow, Alignment, MarginV\n"
        "Style: C,DejaVu Sans,96,&H00FFFFFF,&H00000000,&H80000000,1,1,7,3,5,0\n\n"
        "[Events]\nFormat: Layer, Start, End, Style, Text\n" % (W, H))
    lines = []
    for start, dur, text in timed_sentences:
        words = text.split()
        # shortcut: word timing is proportional to word length, not aligned to audio; use whisper alignment if captions drift
        total = sum(len(w) + 1 for w in words)
        t = start
        for i in range(0, len(words), WORDS_PER_CAPTION):
            chunk = words[i:i + WORDS_PER_CAPTION]
            d = dur * sum(len(w) + 1 for w in chunk) / total
            lines.append(f"Dialogue: 0,{ass_time(t)},{ass_time(t + d)},C,"
                         "{\\fscx80\\fscy80\\t(0,90,\\fscx100\\fscy100)}" + " ".join(chunk).upper())
            t += d
    return head + "\n".join(lines) + "\n"


def main():
    p = argparse.ArgumentParser()
    p.add_argument("script"); p.add_argument("out")
    p.add_argument("--voice", default=str(Path(__file__).parent / "voices/es_ES-davefx-medium.onnx"))
    p.add_argument("--bg")
    a = p.parse_args()

    sentences = [l.strip() for l in Path(a.script).read_text(encoding="utf-8").splitlines() if l.strip()]
    if not sentences:
        sys.exit("El guion está vacío")
    tmp = Path(tempfile.mkdtemp())
    audio, timed, t, params = b"", [], 0.0, None
    for i, s in enumerate(sentences):
        params, frames = tts(s, a.voice, tmp / f"{i}.wav")
        dur = params.nframes / params.framerate
        timed.append((t, dur, s))
        silence = b"\0" * (int(PAUSE * params.framerate) * params.sampwidth * params.nchannels)
        audio += frames + silence
        t += dur + PAUSE
    if t > 60:
        print(f"Aviso: dura {t:.0f}s; un Short debe durar 60s o menos", file=sys.stderr)
    with wave.open(str(tmp / "voice.wav"), "wb") as w:
        w.setparams(params); w.writeframes(audio)
    (tmp / "subs.ass").write_text(captions(timed), encoding="utf-8")

    if a.bg:
        bg = ["-stream_loop", "-1", "-i", a.bg]
        vf = f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},eq=brightness=-0.08,fps={FPS}"
    else:
        bg = ["-f", "lavfi", "-i", f"gradients=s={W}x{H}:r={FPS}:speed=0.008:c0=0x1a1446:c1=0x6b1f7a:c2=0x0d4f6b:c3=0x2a0f3d"]
        vf = "[0:v]null"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *bg, "-i", str(tmp / "voice.wav"),
                    "-filter_complex", f"{vf},ass={tmp / 'subs.ass'}[v]",
                    "-map", "[v]", "-map", "1:a", "-t", f"{t:.2f}",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "192k", a.out], check=True)
    print(f"OK {a.out} ({t:.1f}s)")


if __name__ == "__main__":
    main()
