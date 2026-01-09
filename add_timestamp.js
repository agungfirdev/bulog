const sharp = require("sharp");

async function addTextToImage() {
  const inputImage = "input.jpg";
  const outputImage = "output.jpg";

  const text = `Ini adalah contoh teks yang sangat panjang supaya otomatis wrap
dan tidak terpotong walaupun lebarnya mengikuti gambar.
Teks rata kiri dan berada di bagian bawah gambar.`;

  const image = sharp(inputImage);
  const metadata = await image.metadata();

  const margin = 16; // 🔹 margin luar overlay
  const padding = 20; // 🔹 padding dalam box
  const fontSize = 28;
  const boxHeight = 160;

  const overlayWidth = metadata.width - margin * 2;

  const svg = `
  <svg width="${overlayWidth}" height="${boxHeight}">
    <rect
      x="0"
      y="0"
      width="${overlayWidth}"
      height="${boxHeight}"
      rx="12"
      fill="rgba(0,0,0,0.6)"
    />
    <text
      x="${padding}"
      y="${padding + fontSize}"
      font-size="${fontSize}"
      fill="#ffffff"
      font-family="Arial, Helvetica, sans-serif"
    >
      ${text
        .split("\n")
        .map(
          (line, i) =>
            `<tspan x="${padding}" dy="${
              i === 0 ? 0 : "1.4em"
            }">${line}</tspan>`
        )
        .join("")}
    </text>
  </svg>
  `;

  await image
    .composite([
      {
        input: Buffer.from(svg),
        left: margin,
        top: metadata.height - boxHeight - margin,
      },
    ])
    .jpeg({ quality: 90 })
    .toFile(outputImage);

  console.log("✅ Selesai:", outputImage);
}

addTextToImage();
