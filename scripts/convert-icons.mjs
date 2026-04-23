import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const iconsDir = join(root, "public", "icons");

const conversions = [
  { svg: "icon-192.svg", png: "icon-192.png", size: 192 },
  { svg: "icon-512.svg", png: "icon-512.png", size: 512 },
  { svg: "apple-touch-icon.svg", png: "apple-touch-icon.png", size: 180 },
];

for (const { svg, png, size } of conversions) {
  const svgBuf = readFileSync(join(iconsDir, svg));
  await sharp(svgBuf)
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, png));
  console.log(`Converted ${svg} → ${png}`);
}

console.log("All icons generated!");
