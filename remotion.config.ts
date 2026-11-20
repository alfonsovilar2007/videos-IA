import { Config } from "@remotion/cli/config";
import { existsSync } from "fs";

// El 3D usa la tarjeta gráfica si la hay; si no, Chrome lo pinta por software (más lento, mismo resultado).
Config.setChromiumOpenGlRenderer(process.platform === "darwin" ? "angle" : "angle");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
// en ordenadores lentos los fondos tardan en cargar
Config.setDelayRenderTimeoutInMilliseconds(300000);

// En la nube de Claude Code (Linux) no se puede descargar el Chrome de Remotion: usa el que ya trae la máquina.
const chromeNube = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (process.platform === "linux" && existsSync(chromeNube)) {
  Config.setBrowserExecutable(chromeNube);
}
