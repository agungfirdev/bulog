const fs = require("fs");
const path = require("path");

const dirPath = "/Users/agungfir/Documents/BULOG/BANPANG 2025/BERKAS DESA";
const files = fs
  .readdirSync(dirPath)
  .filter(
    (f) =>
      f.endsWith(".pdf") &&
      !f.includes("SEPERANGKAT DTT") &&
      f.includes("Bantarbolang")
  );
// const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".xlsx"));

for (const file of files) {
  const [nama_provinsi, nama_kabkota, nama_kecamatan, nama_kelurahan, ...rest] =
    file.replace(".pdf", "").split("_");
  // const [doc_type, nama_kabkota, nama_kecamatan, nama_kelurahan, ...rest] = file
  //   .replace(".xlsx", "")
  //   .replace("")
  //   .split("_");

  // buat folder jika belum ada dengan nama folder nama_kabkota
  // lalu di dalam folder nama_kabkota buat folder nama_kecamatan
  // lalu di dalam folder nama_kecamatan buat folder nama_kelurahan
  const kabkotaPath = path.join(dirPath, nama_kabkota);
  if (!fs.existsSync(kabkotaPath)) {
    fs.mkdirSync(kabkotaPath);
  }
  const kecamatanPath = path.join(kabkotaPath, nama_kecamatan);
  if (!fs.existsSync(kecamatanPath)) {
    fs.mkdirSync(kecamatanPath);
  }
  const kelurahanPath = path.join(kecamatanPath, nama_kelurahan);
  if (!fs.existsSync(kelurahanPath)) {
    fs.mkdirSync(kelurahanPath);
  }

  // pindahkan file ke dalam folder nama_kelurahan dengan nama file baru
  const oldFilePath = path.join(dirPath, file);
  const newFilePath = path.join(kelurahanPath, file);
  // kalau UNDANGAN di copy ke dalam folder nama_kelurahan, yang lain di pindah
  if (file.includes("UNDANGAN")) {
    fs.copyFileSync(oldFilePath, newFilePath);
    console.log(`Copied: ${file} -> ${newFilePath}`);
    continue;
  }
  fs.renameSync(oldFilePath, newFilePath);

  console.log(`Renamed and moved: ${file} -> ${newFilePath}`);
}
