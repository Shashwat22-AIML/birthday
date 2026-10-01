import sharp from "sharp";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "public/photos";
const COUNT = 15;
const WIDTH = 1050;
const HEIGHT = 1400;

const GRADIENTS = [
  { start: "#F2A7B8", end: "#F4EEE6" },
  { start: "#F4EEE6", end: "#C9955C" },
  { start: "#C9955C", end: "#F2A7B8" },
  { start: "#F2D1C9", end: "#F4EEE6" },
  { start: "#E8D5B7", end: "#C9955C" },
  { start: "#D4C4A8", end: "#F2A7B8" },
  { start: "#F4EEE6", end: "#F2D1C9" },
  { start: "#C9955C", end: "#E8D5B7" },
  { start: "#F2A7B8", end: "#D4C4A8" },
  { start: "#E8D5B7", end: "#F4EEE6" },
  { start: "#D4C4A8", end: "#F2D1C9" },
  { start: "#F2D1C9", end: "#C9955C" },
  { start: "#F4EEE6", end: "#F2A7B8" },
  { start: "#C9955C", end: "#D4C4A8" },
  { start: "#F2A7B8", end: "#E8D5B7" }
];

async function generatePlaceholders() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Generating ${COUNT} placeholder images...`);

  for (let i = 0; i < COUNT; i++) {
    const outputName = `photo-${String(i + 1).padStart(2, "0")}.webp`;
    const outputPath = path.join(OUTPUT_DIR, outputName);
    const gradient = GRADIENTS[i % GRADIENTS.length];
    const number = String(i + 1).padStart(2, "0");

    const svg = `
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${gradient.start};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${gradient.end};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Georgia, serif" font-size="${Math.min(WIDTH, HEIGHT) * 0.12}" 
              font-style="italic" fill="rgba(27,22,18,0.15)">
          ${number}
        </text>
        <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" 
              font-family="JetBrains Mono, monospace" font-size="${Math.min(WIDTH, HEIGHT) * 0.025}" 
              fill="rgba(27,22,18,0.1)">
          PLACEHOLDER
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .webp({ quality: 78, effort: 4 })
      .toFile(outputPath);

    console.log(`✓ ${outputName}`);
  }

  const manifest = [];
  for (let i = 0; i < COUNT; i++) {
    const outputName = `photo-${String(i + 1).padStart(2, "0")}.webp`;
    manifest.push({
      filename: outputName,
      originalName: outputName,
      width: WIDTH,
      height: HEIGHT,
      optimizedWidth: WIDTH,
      optimizedHeight: HEIGHT,
      sizeKB: Math.round(WIDTH * HEIGHT * 0.02)
    });
  }

  fs.writeFileSync("src/photos.generated.json", JSON.stringify(manifest, null, 2));
  console.log(`\nManifest written to src/photos.generated.json`);
  console.log(`\nDone! Generated ${COUNT} placeholder photos.`);
}

generatePlaceholders().catch(console.error);