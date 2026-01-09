const fs = require("fs").promises;
const path = require("path");
const sharp = require("sharp");

const pathFolder = "/Users/agungfir/Documents/BULOG/BANPANG 2025/KTP";

let indexFile = 0;
const files = (await fs.readdir(pathFolder)).filter((file) =>
  file.toLowerCase().endsWith(".jpg")
);

const TARGET_WIDTH = 900; // lebar tetap
const TARGET_HEIGHT = 900; // tinggi tetap (rasio umum KTP)
const CORNER_RADIUS = 60;
const RADIUS_PERCENT = 6;
// Mode: 'resolution' keeps original pixel dimensions and sets DPI
//       'size' forces output to TARGET_WIDTH x TARGET_HEIGHT
const MODE = process.env.MODE || "resolution";
const TARGET_DPI = process.env.TARGET_DPI
  ? parseInt(process.env.TARGET_DPI, 10)
  : 300;

async function processNext() {
  const file = files[indexFile];

  const input = path.join(pathFolder, file);
  const output = path.join(
    pathFolder,
    `padded_${file.replace(".jpg", ".png")}`
  );

  // cek apakah file sudah ada, kalau ada skip
  if (
    await fs
      .access(output)
      .then(() => true)
      .catch(() => false)
  ) {
    console.log(`Skipped (already exists): ${file}`);
    indexFile++;
    processNext();
    return;
  }

  try {
    // Choose processing mode.
    // 'size' => force pixel size to TARGET_WIDTH x TARGET_HEIGHT (letterbox with white)
    // 'resolution' => preserve pixel dimensions and set DPI metadata to TARGET_DPI
    let image;
    if (MODE === "size") {
      image = sharp(input).resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
        withoutEnlargement: false,
      });
    } else {
      image = sharp(input);
    }

    const { width, height } = await image.metadata();

    if (!width || !height) throw new Error("Metadata tidak valid");

    // Hitung radius proporsional (10% dari sisi terkecil)
    // 2. Hitung radius proporsional dari tinggi aktual
    let radius = Math.round((height * RADIUS_PERCENT) / 100);
    // Safety: jangan sampai radius terlalu besar
    radius = Math.min(radius, Math.floor(height / 2) - 20);

    // 3. Buat SVG mask dengan ukuran yang sama persis dengan gambar setelah resize
    const maskSvg = Buffer.from(`
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect x="0" y="0" width="${width}" height="${height}"
              rx="${radius}" ry="${radius}" fill="white"/>
      </svg>
    `);

    // Apply rounded-corner mask and write file.
    if (MODE === "size") {
      await image
        .composite([
          {
            input: maskSvg,
            blend: "dest-in",
          },
        ])
        .extend({
          top: 25,
          bottom: 25,
          left: 25,
          right: 25,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ quality: 100 })
        .toFile(output);
    } else {
      // resolution mode: preserve pixels, set DPI metadata
      await image
        .composite([
          {
            input: maskSvg,
            blend: "dest-in",
          },
        ])
        .withMetadata({ density: TARGET_DPI })
        .extend({
          top: 25,
          bottom: 25,
          left: 25,
          right: 25,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ quality: 100 })
        .toFile(output);
    }
    console.log(`Processed: ${file}`);
    indexFile++;
    processNext();
  } catch (err) {
    indexFile++;
    processNext();
    console.error(`Error processing ${file}:`, err.message);
  }
}

processNext().catch((err) => console.error(err));
