// Simple SVG-based icon generator
// Run: node scripts/generate-icons.mjs

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Generate SVG icon
function makeSVG(size) {
  const radius = size * 0.22;
  const gradient1 = "#7c6aff";
  const gradient2 = "#a78bfa";
  const fontSize = size * 0.42;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradient1}"/>
      <stop offset="100%" stop-color="${gradient2}"/>
    </linearGradient>
    <clipPath id="clip">
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}"/>
    </clipPath>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#g)"/>
  <text
    x="${size / 2}"
    y="${size / 2 + fontSize * 0.37}"
    font-family="-apple-system, BlinkMacSystemFont, sans-serif"
    font-size="${fontSize}"
    font-weight="700"
    fill="white"
    text-anchor="middle"
    dominant-baseline="middle"
  >H</text>
</svg>`;
}

// Write SVGs as PNG placeholders (SVG saved as .png for simplicity)
// For production, use a proper image converter
const sizes = [192, 512];
for (const size of sizes) {
  const svg = makeSVG(size);
  // Save as SVG first
  writeFileSync(join(root, "public", "icons", `icon-${size}.svg`), svg);
  console.log(`Generated icon-${size}.svg`);
}

// Apple touch icon (180px)
writeFileSync(join(root, "public", "icons", "apple-touch-icon.svg"), makeSVG(180));
console.log("Generated apple-touch-icon.svg");

console.log("\nNote: Convert SVGs to PNGs for production.");
console.log("You can use: https://svgtopng.com/ or install 'sharp' to convert programmatically.");
