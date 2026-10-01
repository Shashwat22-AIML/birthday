import sharp from "sharp";
import fs from "fs";
import path from "path";

const INPUT_DIR = "photos-original";
const OUTPUT_DIR = "public/photos";
const MANIFEST_PATH = "src/photos.generated.json";
const MAX_WIDTH = 1400;
const QUALITY = 78;

async function optimizePhotos() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.log(`Input directory ${INPUT_DIR} does not exist. Creating it...`);
    fs.mkdirSync(INPUT_DIR, { recursive: true });
    console.log(`Please add your original photos to ${INPUT_DIR} and run again.`);
    return;
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => /\.(jpe?g|png|webp|heic|heif|tiff?)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.log(`No images found in ${INPUT_DIR}. Please add photos and run again.`);
    return;
  }

  console.log(`Found ${files.length} images to process...`);

  const manifest = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = path.join(INPUT_DIR, file);
    const outputName = `photo-${String(i + 1).padStart(2, "0")}.webp`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    try {
      const metadata = await sharp(inputPath).metadata();
      const { width, height } = metadata;

      let resizeOptions = {};
      if (width > MAX_WIDTH) {
        resizeOptions = { width: MAX_WIDTH, withoutEnlargement: true };
      }

      await sharp(inputPath)
        .rotate()
        .resize(resizeOptions)
        .webp({ quality: QUALITY, effort: 4 })
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const sizeKB = Math.round(outputStats.size / 1024);

      manifest.push({
        filename: outputName,
        originalName: file,
        width,
        height,
        optimizedWidth: width > MAX_WIDTH ? MAX_WIDTH : width,
        optimizedHeight: width > MAX_WIDTH ? Math.round(height * (MAX_WIDTH / width)) : height,
        sizeKB
      });

      console.log(`✓ ${file} → ${outputName} (${width}x${height} → ${manifest[manifest.length - 1].optimizedWidth}x${manifest[manifest.length - 1].optimizedHeight}, ${sizeKB}KB)`);
    } catch (err) {
      console.error(`✗ Failed to process ${file}:`, err.message);
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest written to ${MANIFEST_PATH}`);
  console.log(`\nDone! Processed ${manifest.length} photos.`);
  console.log(`\nTo use these photos, update src/content.js with the filenames from the manifest.`);
}

optimizePhotos().catch(console.error);