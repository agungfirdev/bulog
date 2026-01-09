const sharp = require("sharp");
const { createCanvas } = require("canvas");

async function addWatermark(
  inputPath,
  outputPath,
  lines = [
    new Date().toISOString().slice(0, 10),
    "Kabupaten/Kota",
    "Kecamatan",
    "Kelurahan/Desa",
    "Latitude",
    "Longitude",
  ],
  customFontSize = null // tambahkan parameter opsional font size
) {
  // Baca metadata gambar
  const image = sharp(inputPath);
  const { width, height } = await image.metadata();

  // Estimasi font size proporsional (minimal 16) atau pakai custom
  const minFontSize = 16;
  const maxFontSize = Math.floor(height * 0.04); // max 4% tinggi gambar
  let fontSize = customFontSize
    ? customFontSize
    : Math.max(minFontSize, maxFontSize);

  // Dummy canvas untuk hitung kebutuhan tinggi watermark
  const padding = 10;
  const lineSpacing = 4;
  const dummyCanvas = createCanvas(width, 100);
  const dummyCtx = dummyCanvas.getContext("2d");
  dummyCtx.font = `bold ${fontSize}px sans-serif`;

  // Fungsi untuk membagi teks menjadi beberapa baris jika perlu wrap
  function wrapLines(text, maxWidth, ctx) {
    const lines = [];
    let current = text;
    while (ctx.measureText(current).width > maxWidth) {
      let i = current.length - 1;
      while (i > 0 && ctx.measureText(current.slice(0, i)).width > maxWidth)
        i--;
      const wrapAt =
        current.lastIndexOf(" ", i) > 0 ? current.lastIndexOf(" ", i) : i;
      lines.push(current.slice(0, wrapAt));
      current = current.slice(wrapAt).trim();
    }
    lines.push(current);
    return lines;
  }

  // Hitung total baris hasil wrap
  let wrappedLines = [];
  for (const line of lines) {
    wrappedLines = wrappedLines.concat(
      wrapLines(line, width - 2 * padding, dummyCtx)
    );
  }

  // Hitung tinggi watermark yang dibutuhkan
  const watermarkHeight =
    padding + wrappedLines.length * (fontSize + lineSpacing) + padding;

  // Buat canvas final watermark
  const canvas = createCanvas(width, watermarkHeight);
  const ctx = canvas.getContext("2d");

  // Background hitam dengan opacity 75%
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, watermarkHeight);
  ctx.globalAlpha = 1.0;

  // Tulis teks
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = "#fff";
  let y = padding + fontSize;
  for (const line of wrappedLines) {
    ctx.fillText(line, padding, y);
    y += fontSize + lineSpacing;
  }

  // Gabungkan watermark dengan gambar asli
  const watermarkBuffer = canvas.toBuffer();
  await image
    .composite([
      { input: watermarkBuffer, top: height - watermarkHeight, left: 0 },
    ])
    .toFile(outputPath);
}

// Contoh pemakaian:
addWatermark(
  "input.jpeg",
  "output.jpg",
  [
    new Date().toISOString().slice(0, 10),
    "KAB. PEMALANG",
    "KEC. AMPELGADING",
    "DESA JATIREJO",
    "-6.900000",
    "109.400000",
  ],
  18 // contoh custom font size, bisa diubah sesuai kebutuhan
);
