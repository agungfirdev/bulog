const fs = require("fs");
const path = require("path");
const { delay, Cookie } = require("./utils");
const docouts = require("./data/realisasi_spm.json");
const spms = require("./data/spm_data.json");
const soData = require("./data/so.json");

let index = 0;

let listDocouts = [];

console.log(docouts.length);

spms.forEach((docout) => {
  // jika di split no_out ada lebih dari 1 maka buat terpisah
  const outs = docout.no_out.split(", ").map((item) => item.trim());

  outs.forEach((out) => {
    listDocouts.push({
      ...docout,
      no_out: out,
    });
  });
});
console.log("Total docout after split:", listDocouts.length);

const doSO = [];
// spms.forEach((docout) => {
//   // jika di split no_out ada lebih dari 1 maka buat terpisah
//   const outs = docout.no_so.split(", ").map((item) => item.trim());

//   outs.forEach((so) => {
//     doSO.push({
//       ...docout,
//       no_so: so,
//     });
//   });
// });

// rename docout
const pathDo = "/Users/agungfir/Documents/SCAN/DOCOUT/DOCOUTS";
// listDocouts.forEach((docout) => {
//   const { provinsi, kabupaten, kecamatan, kelurahan, komoditas_id, qty } =
//     docout;

//   // cek jika ada file dengan nama yang sama di destDir
//   if (fs.existsSync(path.join(pathDo, `${docout.no_out.split("/")[1]}.pdf`))) {
//     const destDir = path.join(pathDo, provinsi, kabupaten, kecamatan);
//     console.log("Moving file to:", destDir);
//     fs.mkdirSync(destDir, { recursive: true });
//     fs.renameSync(
//       path.join(pathDo, `${docout.no_out.split("/")[1]}.pdf`),
//       path.join(
//         destDir,
//         `${docout.no_out.split(".")[0].replaceAll("/", "-")} - ${kelurahan} - ${qty}.pdf`,
//       ),
//     );
//   }
// });

// remove yang value no_so nya sama di doSO
// const uniqueDoSO = {};
// doSO.forEach((item) => {
//   uniqueDoSO[item.no_so] = item;
// });

// const finalDoSO = Object.values(uniqueDoSO);

// console.log("Total docout after split:", listDocouts.length);
// console.log("Total SO after split:", finalDoSO.length);
// finalDoSO.forEach((so) => {
//   const { provinsi, kabupaten, kecamatan, kelurahan, komoditas_id } = so;
//   const pathSaved = "/Users/agungfir/Documents/SCAN/SO";
//   const destDir = path.join(pathSaved, provinsi, kabupaten, kecamatan);
//   fs.mkdirSync(destDir, { recursive: true });

//   fs.renameSync(
//     path.join(pathSaved, `${so.no_so.split(".")[0].replaceAll("/", ".")}.pdf`),
//     path.join(
//       destDir,
//       `${so.no_so.split(".")[0].replaceAll("/", "-")} - ${kecamatan} - ${komoditas_id === 2 ? "MINYAK" : "BERAS"}.pdf`,
//     ),
//   );
// });

// cek file yang tidak ada
const docoutNotFound = [];
listDocouts.forEach((docout) => {
  const { provinsi, kabupaten, kecamatan, kelurahan, komoditas_id, qty } =
    docout;
  const destDir = path.join(pathDo, provinsi, kabupaten, kecamatan);
  const filePath = path.join(
    destDir,
    `${docout.no_out.split(".")[0].replaceAll("/", "-")} - ${kelurahan} - ${qty}.pdf`,
  );
  if (!fs.existsSync(filePath)) {
    docoutNotFound.push(docout);
  }
});

console.log("Total docout not found:", docoutNotFound.length);

fs.writeFileSync(
  "docout_not_found.json",
  JSON.stringify(docoutNotFound, null, 2),
);
