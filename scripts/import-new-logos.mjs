/**
 * Imports ICOs from public/icons/new logos/ into the paths the app uses.
 * Run: node scripts/import-new-logos.mjs
 */
import { readFile, writeFile, copyFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import decodeIco from "decode-ico";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const srcDir = join(root, "public", "icons", "new logos");
const appDir = join(root, "src", "app");

async function icoToPng(icoPath, outPath) {
  const buf = await readFile(icoPath);
  const images = decodeIco(buf);
  if (!images.length) throw new Error(`No images in ${icoPath}`);
  const img = images[0];

  if (img.type === "png") {
    await writeFile(outPath, Buffer.from(img.data));
    return;
  }

  const raw = Buffer.from(img.data);
  await sharp(raw, {
    raw: {
      width: img.width,
      height: img.height,
      channels: 4,
    },
  })
    .png()
    .toFile(outPath);
}

const jobs = [
  ["192x192.ico", join(root, "public", "icons", "icon-192.png")],
  ["512x512.ico", join(root, "public", "icons", "icon-512.png")],
  ["180x180.ico", join(root, "public", "icons", "apple-touch-icon.png")],
  ["32x32.ico", join(root, "public", "favicon-32x32.png")],
  ["16x16.ico", join(root, "public", "favicon-16x16.png")],
];

for (const [file, out] of jobs) {
  await icoToPng(join(srcDir, file), out);
  console.log(`${file} -> ${out.replace(root + "\\", "").replace(root + "/", "")}`);
}

// Next.js App Router picks up favicon.ico from src/app/
await mkdir(appDir, { recursive: true });
await copyFile(join(srcDir, "32x32.ico"), join(appDir, "favicon.ico"));
console.log("Copied 32x32.ico -> src/app/favicon.ico");

console.log("Done.");
