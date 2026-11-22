"""Mezcla final de un short: voz delante, música y efectos por debajo (con ducking) y -14 LUFS.
Uso: python3 tools/mezclar.py <carpeta_del_short> <duracion_s>
Lee voz_ritmo.wav, musica.wav y efectos.wav; escribe mezcla.wav e informa de cuántos LU queda la voz por encima del fondo."""
import subprocess, sys, re
c, dur = sys.argv[1], sys.argv[2]
VOZ = "aformat=sample_rates=48000:channel_layouts=stereo,highpass=f=90,equalizer=f=170:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.3:g=3.5,acompressor=threshold=-22dB:ratio=3.5:attack=4:release=90:makeup=2,volume=6dB"
MUS, FX = -13, -4          # dB: música muy por debajo; efectos presentes pero sin tapar la voz
def correr(filtro, salida):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{c}/voz_ritmo.wav", "-i", f"{c}/musica.wav", "-i", f"{c}/efectos.wav",
                    "-filter_complex", filtro, "-map", "[out]", "-ar", "48000", "-t", dur, salida], check=True)
def lufs(f):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])
base = (f"[0:a]{VOZ},apad=whole_dur={dur}[voz];[voz]asplit=3[v1][vs1][vs2];"
        f"[1:a]volume={MUS}dB[mus];[mus][vs1]sidechaincompress=threshold=0.02:ratio=6:attack=15:release=350[musd];"
        f"[2:a]volume={FX}dB[fx];[fx][vs2]sidechaincompress=threshold=0.03:ratio=4:attack=5:release=200[fxd];")
correr(base + "[v1][musd][fxd]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.9:level=false,loudnorm=I=-14:TP=-1:LRA=9[out]", f"{c}/mezcla.wav")
# medida: voz sola frente a fondo solo (mismas ganancias)
correr(base + "[musd][fxd]amix=inputs=2:normalize=0:duration=first,anullsink;[v1]anull[out]", "/tmp/_voz.wav")
correr(base + "[v1]anullsink;[musd][fxd]amix=inputs=2:normalize=0:duration=first[out]", "/tmp/_fondo.wav")
v, f = lufs("/tmp/_voz.wav"), lufs("/tmp/_fondo.wav")
print(f"mezcla: {lufs(c + '/mezcla.wav'):.1f} LUFS · voz {v - f:+.1f} LU por encima del fondo")
