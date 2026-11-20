"""One-word-at-a-time burned captions (the reference style) from the script text, timed by Whisper's word stamps."""
import json, re, difflib, unicodedata, os
R = os.path.dirname(os.path.abspath(__file__)) + "/.."
words = json.load(open(f"{R}/public/ratas/palabras.json"))
text = open(f"{R}/out/voz.txt", encoding="utf-8").read().replace("mil novecientos dos", "1902")
toks = text.split()
norm = lambda w: re.sub(r"[^a-z0-9ñ]", "", unicodedata.normalize("NFD", w.lower()).encode("ascii", "ignore").decode())
A, B = [norm(t) for t in toks], [norm(w["w"]) for w in words]
times = [None] * len(toks)
for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes():
    if op == "equal" or (i2 - i1 == j2 - j1):
        for k in range(i2 - i1): times[i1 + k] = (words[j1 + k]["s"], words[j1 + k]["e"])
    elif j2 > j1:  # spread the script tokens over the matched span
        s0, e0 = words[j1]["s"], words[j2 - 1]["e"]
        for k in range(i2 - i1): times[i1 + k] = (s0 + (e0 - s0) * k / (i2 - i1), s0 + (e0 - s0) * (k + 1) / (i2 - i1))
for i, t in enumerate(times):  # any token left without a stamp sits between its neighbours
    if t is None: p = times[i - 1]; times[i] = (p[1], p[1] + 0.2)
assert all(times[i][0] <= times[i + 1][0] + 1e-6 for i in range(len(times) - 1)), "caption times must not go backwards"
ts = lambda t: f"{int(t // 3600)}:{int(t // 60 % 60):02d}:{int(t % 60):02d}.{int(round(t * 100)) % 100:02d}"
out = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "", "[V4+ Styles]",
       "Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, BorderStyle, Outline, Shadow, Alignment, MarginV",
       "Style: W,DejaVu Sans,86,&H00FFFFFF,&H00000000,&H64000000,1,1,7,3,5,0", "", "[Events]", "Format: Layer, Start, End, Style, Text"]
for i, (tok, (s, e)) in enumerate(zip(toks, times)):
    end = min(times[i + 1][0], e + 0.35) if i + 1 < len(toks) else e + 0.3
    out.append(f"Dialogue: 0,{ts(s)},{ts(max(end, s + 0.08))},W,{{\\pos(540,1260)\\fscx82\\fscy82\\t(0,80,\\fscx100\\fscy100)}}{tok}")
open(f"{R}/out/subs.ass", "w", encoding="utf-8").write("\n".join(out) + "\n")
print(len(toks), "words")
