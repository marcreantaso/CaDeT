// With sharp installed: node scripts/generate-icons.mjs
// Or set CADET_SHARP_PATH to the absolute sharp package directory.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require(process.env.CADET_SHARP_PATH || "sharp");
for (const [filename, size] of [
  ["pwa-maskable-512x512.png", 512],
  ["apple-touch-icon.png", 180],
]) {
  await sharp(new URL("../public/icon-maskable.svg", import.meta.url).pathname)
    .resize(size, size)
    .removeAlpha()
    .png()
    .toFile(new URL(`../public/${filename}`, import.meta.url).pathname);
}
