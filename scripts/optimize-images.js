/* One-time image optimizer: emits resized WebP copies of every raster image
   in src/images into src/images/opt/. Non-destructive (originals untouched).
   Run with: node scripts/optimize-images.js */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src', 'images');
const OUT = path.join(SRC, 'opt');
const MAX_WIDTH = 1600;
const QUALITY = 76;
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.avif']);

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const files = fs.readdirSync(SRC).filter((f) => EXTS.has(path.extname(f).toLowerCase()));
  const seen = new Map();
  let before = 0;
  let after = 0;

  for (const f of files) {
    const inPath = path.join(SRC, f);
    const base = path.basename(f, path.extname(f));
    if (seen.has(base)) {
      console.log(`!! basename collision: ${f} vs ${seen.get(base)} -> skipping ${f}`);
      continue;
    }
    seen.set(base, f);
    const outPath = path.join(OUT, base + '.webp');
    try {
      const meta = await sharp(inPath).metadata();
      const pipeline = sharp(inPath, { animated: false });
      if (meta.width && meta.width > MAX_WIDTH) pipeline.resize({ width: MAX_WIDTH });
      await pipeline.webp({ quality: QUALITY }).toFile(outPath);
      const bIn = fs.statSync(inPath).size;
      const bOut = fs.statSync(outPath).size;
      before += bIn;
      after += bOut;
      console.log(`${f}: ${Math.round(bIn / 1024)}KB -> ${Math.round(bOut / 1024)}KB`);
    } catch (e) {
      console.log(`${f}: ERROR ${e.message}`);
    }
  }
  console.log(
    `\nTOTAL: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB ` +
      `(${Math.round((1 - after / before) * 100)}% smaller across ${seen.size} images)`
  );
})();
