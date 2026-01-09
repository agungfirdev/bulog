const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
// import BNBA.json
const bnbaJson = require("./data/bnba.json").sort((a, b) => {
  // sort by KEC_NAME then KEL_NAME
  if (a["KEC_NAME"] < b["KEC_NAME"]) return -1;
  if (a["KEC_NAME"] > b["KEC_NAME"]) return 1;
  if (a["KEL_NAME"] < b["KEL_NAME"]) return -1;
  if (a["KEL_NAME"] > b["KEL_NAME"]) return 1;
  return 0;
});

const csv = require("csv-parser");
const results = [];

// fs.createReadStream(pathCsv)
//   .pipe(
//     csv({
//       separator: ";",
//       mapHeaders: ({ header }) => header.replace(/^\uFEFF/, ""),
//     })
//   )
//   .on("data", (row) => {
//     results.push(row);
//   })
//   .on("end", () => {
//     // console.log(results);
//     fs.writeFileSync(
//       path.join(__dirname, "data", "BNBA.json"),
//       JSON.stringify(results, null, 2)
//     );
//     // print length
//     console.log(results.length);
//     console.log("CSV berhasil dikonversi ke JSON!");
//   });

// mapping ke per desa dengan nama object "KEC_NAME/KEL_NAME" simpan dengan array of object
const bnbaPerDesa = [];

for (const entry of bnbaJson) {
  const kecName = entry["KEC_NAME"].trim();
  const kelName = entry["KEL_NAME"].trim();
  const key = `${kecName}/${kelName}`;

  if (!bnbaPerDesa[key]) {
    bnbaPerDesa[key] = [];
  }
  bnbaPerDesa[key].push(entry);
}

for (const key in bnbaPerDesa) {
  console.log(`${key}: ${bnbaPerDesa[key].length}`);

  const rows = bnbaPerDesa[key]
    .sort((a, b) => {
      // sort by NAMA_PENERIMA A-Z
      if (a["NAMA"] < b["NAMA"]) return -1;
      if (a["NAMA"] > b["NAMA"]) return 1;
      return 0;
    })
    .map((entry, index) => {
      delete entry["ID_WILAYAH"];
      return {
        NO: index + 1,
        ...entry,
      };
    });

  // kumpulkan semua header (agar kolom konsisten)
  const headersSet = new Set();
  rows.forEach((r) => Object.keys(r).forEach((k) => headersSet.add(k)));
  const headers = Array.from(headersSet);

  // buat worksheet dengan header yang sudah disusun
  const worksheet = xlsx.utils.json_to_sheet(rows, {
    header: headers,
    raw: true,
  });

  // hitung lebar tiap kolom berdasarkan panjang value dan header
  const colWidths = headers.map((h) => {
    const maxLen = Math.max(
      String(h).length,
      ...rows.map((r) => {
        const v = r[h];
        return v === undefined || v === null ? 0 : String(v).length;
      })
    );
    return { wch: Math.min(Math.max(5, maxLen + 2), 100) }; // padding + cap
  });
  worksheet["!cols"] = colWidths;

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "BNBA");
  const outDir = "/Users/agungfir/Documents/BULOG/BANPANG 2025/BNBA EXCEL";
  fs.mkdirSync(outDir, { recursive: true });

  const fileName = `BNBA_KAB. PEMALANG_${key.replaceAll("/", "_")}.xlsx`;
  xlsx.writeFile(workbook, path.join(outDir, fileName));
}
// ...existing code...
