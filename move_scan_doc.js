const fs = require("fs");
const path = require("path");
const pathScan = "/Users/agungfir/Documents/SCAN";
const { kelurahans, naturalCompareAZ } = require("./utils");
let index = 0;
const today = new Date();
// format yyyy-mm-dd menit-jam
const formattedDate = `${today.getFullYear()}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")} ${String(
  today.getHours()
).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`;

function typeDocumentString(type) {
  return type === 1
    ? "SPTJM"
    : type === 2
    ? "PENGGANTI"
    : type === 3
    ? "PERWAKILAN"
    : type === 4
    ? "DTT"
    : "";
}

const files = fs
  .readdirSync(pathScan)
  .filter((file) => file.endsWith(".pdf"))
  .filter((file) => {
    const stats = fs.statSync(path.join(pathScan, file));
    return stats.size > 0;
  })
  .sort(naturalCompareAZ);

function pindahScanDocument() {
  console.log(`Memproses file ke-${index + 1}/${files.length}`);

  if (index < files.length) {
    const file = files[index];
    const fileParts = file.split(" ");
    if (fileParts.length < 2) {
      console.log(`Skipping file ${file} due to invalid naming convention.`);
      index++;
      return pindahScanDocument();
    }

    const kelurahanKode = fileParts[0];
    const typeDocument = Number(fileParts[1].split(".")[0]);

    // jikka typeDocument tidak valid, skip
    if (![1, 2, 3, 4].includes(typeDocument)) {
      console.log(
        `Tipe dokumen ${typeDocument} tidak valid. Melewati file ${file}.`
      );
      index++;
      return pindahScanDocument();
    }

    const typeDocString = typeDocumentString(typeDocument);
    const foundKelurahan = kelurahans.find(
      (kel) => kel.kode_kelurahan.split(".").slice(2).join("") === kelurahanKode
    );

    // jika tidak ditemukan, skip
    if (!foundKelurahan) {
      console.log(
        `Kelurahan dengan kode ${kelurahanKode} tidak ditemukan. Melewati file ${file}.`
      );
      index++;
      return pindahScanDocument();
    }
    const {
      nama_provinsi: provinsi,
      nama_kabkota: kabkota,
      nama_kecamatan: kecamatan,
      nama_kelurahan: kelurahan,
    } = foundKelurahan;

    // print info pemindahan
    // console.log(
    //   `${provinsi}_${kabkota}_${kecamatan}_${kelurahan}_${typeDocString}`
    // );

    const destDir = path.join(
      pathScan,
      "DOKUMEN DESA",
      provinsi,
      kabkota,
      kecamatan,
      kelurahan
    );
    fs.mkdirSync(destDir, { recursive: true });
    fs.renameSync(
      path.join(pathScan, file),
      path.join(
        destDir,
        `${provinsi}_${kabkota}_${kecamatan}_${kelurahan}_${typeDocString}.pdf`
      )
    );

    // update REKAP_DESA.json dengan mencentang dokumen yang sudah diupload
    const findIndex = kelurahans.findIndex(
      (kel) => kel.kode_kelurahan === foundKelurahan.kode_kelurahan
    );
    kelurahans[findIndex][typeDocString] = "X"; // ceklis saja
    kelurahans[findIndex][`UP ${typeDocString}`] = formattedDate;

    // simpan ke REKAP_DESA.json
    fs.writeFileSync(
      "./data/REKAP_DESA.json",
      JSON.stringify(kelurahans, null, 2)
    );

    index++;
    pindahScanDocument();
  } else {
    console.log("Semua file scan telah dipindahkan.");
  }
}

pindahScanDocument();
