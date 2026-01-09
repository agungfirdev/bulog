const { fs } = require("appium/support");
const outs = require("./data/realisasi_bast.json");
const spms = require("./data/spm_data.json");
const { kelurahans } = require("./utils");

let realisasi = [];

for (const out of outs) {
  const spm = spms.find((s) => s.no_out.includes(out.no_out));

  if (spm) {
    realisasi.push({
      out: out,
      ...spm,
    });
  }
}

console.log(realisasi.length);
console.log(outs.length);

const spmsMap = realisasi.map(
  ({ no_spm, no_out, out, createdAt, kode_kecamatan, kelurahan }) => {
    // format created date to DD/MM/YYYY
    const createdDate = new Date(createdAt);
    const day = String(createdDate.getDate()).padStart(2, "0");
    const month = String(createdDate.getMonth() + 1).padStart(2, "0");
    const year = createdDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // cari kode kelurahan berdasarkan kode_kecamatan dan nama kelurahan
    const spmFound = kelurahans.find(
      (k) =>
        k.kode_kecamatan === kode_kecamatan && k.nama_kelurahan === kelurahan
    );
    return {
      no_out: out,
      no_spm: no_spm,
      createdAt: formattedDate,
      no_bast: spmFound
        ? `BAST-202507${spmFound.kode_kelurahan.replaceAll(".", "")}`
        : "UNKNOWN",
    };
  }
);

fs.writeFile("SPM_JULI.json", JSON.stringify(spmsMap));
