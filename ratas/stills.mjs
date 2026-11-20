// node stills.mjs 20,100,200 [scale] -> out/s_<frame>.png  (one bundle, many stills)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
const frames = process.argv[2].split(",").map(Number), scale = Number(process.argv[3] ?? 0.5);
const serveUrl = await bundle({ entryPoint: "src/index.ts" });
const browser = await openBrowser("chrome", { browserExecutable: "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", chromiumOptions: { gl: "angle" } });
const composition = await selectComposition({ serveUrl, id: "Ratas", puppeteerInstance: browser });
for (const frame of frames) {
  await renderStill({ serveUrl, composition, frame, output: `out/s_${frame}.png`, scale, puppeteerInstance: browser, timeoutInMilliseconds: 240000 });
  console.log("ok", frame);
}
await browser.close({ silent: true });
