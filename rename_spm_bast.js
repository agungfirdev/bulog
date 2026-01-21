const fs = require("fs");
const path = require("path");
const { naturalCompareAZ } = require("./utils.js");

const kecamatanSelected = "Watukumpul";
const spms = require("./data/spm_data.json")
  .filter((spm) => spm.kecamatan === kecamatanSelected)
  // sort provinsi, kabupaten, kecamatan, kelurahan, no_spm A-Z
  .sort((a, b) => {
    // provinsi
    if (a.provinsi < b.provinsi) return -1;
    if (a.provinsi > b.provinsi) return 1;
    // kabupaten
    if (a.kabupaten < b.kabupaten) return -1;
    if (a.kabupaten > b.kabupaten) return 1;
    // kecamatan
    if (a.kecamatan < b.kecamatan) return -1;
    if (a.kecamatan > b.kecamatan) return 1;
    // kelurahan
    if (a.kelurahan < b.kelurahan) return -1;
    if (a.kelurahan > b.kelurahan) return 1;
    // no_spm
    if (a.no_spm < b.no_spm) return -1;
    if (a.no_spm > b.no_spm) return 1;
    return 0;
  });

const pathFile = `/Users/agungfir/Documents/SCAN/OKT-NOV 2025/`;

const files = fs
  .readdirSync(pathFile)
  .filter((file) => file.endsWith(".pdf"))
  .sort(naturalCompareAZ);
console.log(files);

// files.forEach((file, index) => {
//   const { no_spm, provinsi, kabupaten, kecamatan, kelurahan } =
//     filterSpms[index];
//   const dirPath = path.join(
//     pathFile,
//     provinsi,
//     kabupaten,
//     kecamatan,
//     kelurahan
//   );

//   fs.mkdirSync(dirPath, { recursive: true });
//   const newPath = path.join(dirPath, `${no_spm}.pdf`);
//   const oldPath = path.join(pathFile, file);

//   fs.renameSync(oldPath, newPath);
// });

if (files.length !== spms.length * 2) {
  throw new Error("Jumlah file tidak sama dengan jumlah SPM");
}

const filterFileGanjil = files.filter((file, index) => index % 2 === 0);
const filterFileGenap = files.filter((file, index) => index % 2 === 1);

// Jika Ganjil Maka file SPM, lalu rename dengan SPM
filterFileGanjil.forEach((file, index) => {
  const no_spm = spms[index].no_spm;
  const [ext] = file.split(".").slice(-1);
  const newName = `${no_spm}.${ext}`;
  const folder = "SPM";
  const folderSaved = path.join(pathFile, folder, kecamatanSelected);
  if (!fs.existsSync(folderSaved)) {
    fs.mkdirSync(folderSaved, { recursive: true });
  }
  fs.renameSync(path.join(pathFile, file), path.join(folderSaved, newName));
});

// Jika Genap Maka file BAST
filterFileGenap.forEach((file, index) => {
  const { no_spm, kelurahan } = spms[index];
  const [ext] = file.split(".").slice(-1);
  const folder = "Surat Jalan";
  const folderSaved = path.join(pathFile, folder, kecamatanSelected);
  if (!fs.existsSync(folderSaved)) {
    fs.mkdirSync(folderSaved, { recursive: true });
  }

  const newName = `${no_spm} ${kelurahan.toUpperCase()}.${ext}`;
  fs.renameSync(path.join(pathFile, file), path.join(folderSaved, newName));
});
