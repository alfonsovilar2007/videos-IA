"""Genera la voz por filas del guion, con marcas de tiempo por palabra.
Uso: python3 voz.py  -> tmp/voz.wav, tmp/palabras.json, tmp/filas.json
Para usar otra voz (grabada/clonada), sustituir tmp/fila_XXX.wav y volver a ejecutar con --solo-montar."""
import asyncio, json, os, subprocess, sys, re
import edge_tts
AQUI = os.path.dirname(os.path.abspath(__file__)); TMP = f"{AQUI}/tmp"
src = open(f"{AQUI}/../../guiones/01-guion.py").read().split("WPM =")[0]
ns = {}; exec(src, ns); S = ns["S"]
VOZ, RATE, PITCH = "es-ES-AlvaroNeural", "+8%", "-6Hz"
INICIO, PAUSA, PAUSA_SECCION = 0.6, 0.7, 2.5
filas = [(si, nombre, voz, img, txt) for si,(nombre, fs) in enumerate(S) for (voz,img,txt) in fs]

async def una(i, voz, sem):
    wav = f"{TMP}/fila_{i:03d}.wav"; js = f"{TMP}/fila_{i:03d}.json"
    if os.path.exists(wav) and os.path.exists(js): return
    async with sem:
        for intento in range(4):
            try:
                c = edge_tts.Communicate(voz, VOZ, rate=RATE, pitch=PITCH, boundary="WordBoundary", proxy=os.environ.get("HTTPS_PROXY"))
                audio = b""; pals = []
                async for ch in c.stream():
                    if ch["type"] == "audio": audio += ch["data"]
                    elif ch["type"] == "WordBoundary":
                        pals.append([ch["offset"]/1e7, (ch["offset"]+ch["duration"])/1e7, ch["text"]])
                open(f"{TMP}/fila_{i:03d}.mp3","wb").write(audio)
                subprocess.run(["ffmpeg","-v","error","-y","-i",f"{TMP}/fila_{i:03d}.mp3","-ar","48000","-ac","1",wav],check=True)
                json.dump(pals, open(js,"w"), ensure_ascii=False); return
            except Exception as e:
                print("reintento", i, e); await asyncio.sleep(2)
        raise SystemExit(f"falló la fila {i}")

async def main():
    sem = asyncio.Semaphore(6)
    if "--solo-montar" not in sys.argv:
        await asyncio.gather(*[una(i, f[2], sem) for i,f in enumerate(filas)])
    # montar: concatenar con pausas, recortando silencios de borde
    t = INICIO; partes = []; palabras = []; out_filas = []
    prev_sec = -1
    for i,(si,nombre,voz,img,txt) in enumerate(filas):
        if si != prev_sec and i>0: t += PAUSA_SECCION - PAUSA
        dur = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f"{TMP}/fila_{i:03d}.wav"],capture_output=True,text=True).stdout)
        pals = json.load(open(f"{TMP}/fila_{i:03d}.json"))
        # edge-tts deja ~0.1 s al principio y algo al final; usamos el audio entero y avanzamos hasta el final de la última palabra
        fin = pals[-1][1] if pals else dur
        partes.append((t, i))
        for a,b,w in pals: palabras.append({"t0":round(t+a,3),"t1":round(t+b,3),"w":w,"fila":i})
        out_filas.append({"i":i,"sec":si,"seccion":nombre,"t0":round(t,3),"t1":round(t+fin,3),"texto":txt,"img":img,"voz":voz})
        t += fin + PAUSA; prev_sec = si
    total = t + 2.5
    # mezcla de filas en una pista
    args = ["ffmpeg","-v","error","-y"]
    for _,i in partes: args += ["-i", f"{TMP}/fila_{i:03d}.wav"]
    fc = "".join(f"[{k}]adelay={int(t0*1000)}:all=1[a{k}];" for k,(t0,i) in enumerate(partes))
    fc += "".join(f"[a{k}]" for k in range(len(partes))) + f"amix=inputs={len(partes)}:normalize=0,apad=whole_dur={total}[o]"
    args += ["-filter_complex", fc, "-map","[o]","-ar","48000","-ac","1", f"{TMP}/voz.wav"]
    subprocess.run(args, check=True)
    json.dump({"total":round(total,3),"palabras":palabras,"filas":out_filas,"secciones":[n for n,_ in S]}, open(f"{TMP}/tiempos.json","w"), ensure_ascii=False)
    print(f"voz: {int(total//60)}:{total%60:04.1f}  filas={len(filas)} palabras={len(palabras)}")
asyncio.run(main())
