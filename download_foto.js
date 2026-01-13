const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { Cookie } = require("./utils");
let { kelurahans } = require("./utils");
const pathFolder = "/Users/agungfir/Documents/BULOG/BANPANG 2025/REKAP PBP";

const argv = process.argv.slice(2);
const filterKec = argv.find((arg) => arg.startsWith("--kec="));
const filterKel = argv.find((arg) => arg.startsWith("--kel="));
if (filterKec) {
  const filterValue = filterKec.split("=")[1].toLowerCase();
  kelurahans = kelurahans.filter((kel) =>
    `${kel.nama_kecamatan}`.toLowerCase().includes(filterValue)
  );
}
if (filterKel) {
  const filterValue = filterKel.split("=")[1].toLowerCase();
  kelurahans = kelurahans.filter((kel) =>
    `${kel.nama_kelurahan}`.toLowerCase().includes(filterValue)
  );
}

let index = 0;
let indexWilayah = 0;

const pathPhoto =
  "/Users/agungfir/Documents/BULOG/BANPANG 2025/FOTO PBP OKT-NOV";
const fotoType = argv.includes("--ktp") ? "KTP" : "PBP"; // 'KTP' or 'PBP'

let pbps = [];

function downloadFoto() {
  const { nama_provinsi, nama_kabkota, nama_kecamatan, nama_kelurahan } =
    kelurahans[indexWilayah];

  const fileName = path.join(
    pathFolder,
    `11_${nama_provinsi}_${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}.json`
  );
  const fileName2 = path.join(
    pathFolder,
    `${nama_provinsi}_${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}.json`
  );

  console.log(
    `→ ${nama_provinsi}-${nama_kabkota}-${nama_kecamatan}-${nama_kelurahan}`
  );
  if (!fileName) {
    console.log("Semua wilayah telah diproses.");
    return;
  }

  console.log(
    "↡ Mengunduh: ",
    nama_provinsi,
    nama_kabkota,
    nama_kecamatan,
    nama_kelurahan
  );
  pbps = JSON.parse(fs.readFileSync(fileName, "utf8"));
  pbps = pbps.sort((a, b) => a.nama - b.nama);
  // pbps = pbps.filter((p) => p.foto_pbp === null);
  // console.log("↡ Total PBP:", pbps.length);
  // let pbps2 = JSON.parse(fs.readFileSync(fileName2, "utf8"));
  // // filter pbps2 jika ada di pbps maka dihapus dari pbps2
  // const noPbpSet = new Set(pbps.map((p) => p.nik));
  // pbps2 = pbps2.filter((p) => noPbpSet.has(p.nik));
  // console.log("↡ Total PBP2 (filter dari PBP1):", pbps2.length);
  // pbps = pbps2;
  // fs.writeFileSync("LONGKEYANG.json", JSON.stringify(pbps, null, 2));
  // console.log("↡ Total PBP setelah filter:", pbps.length);
  // console.log(pbps);

  // filter pbps jika ada di pbps2 maka dihapus dari pbps
  // const noPbpSet2 = new Set(pbps2.map((p) => p.nik_pengganti));
  // pbps = pbps.filter((p) => !noPbpSet2.has(p.nik));

  // const noPbpSet3 = new Set(pbps2.map((p) => p.nik_pengganti));
  // pbps = pbps.filter((p) => !noPbpSet3.has(p.nik));

  console.log("=========================================");

  downloadFotoPBP();
}

function downloadFotoPBP() {
  const {
    nama_provinsi: provinsi,
    nama_kabkota: kabkota,
    nama_kecamatan: kecamatan,
    nama_kelurahan: kelurahan,
  } = kelurahans[indexWilayah];
  if (index >= pbps.length) {
    console.log(`✅ ${provinsi} - ${kabkota} - ${kecamatan} - ${kelurahan}`);
    indexWilayah++;
    if (indexWilayah < kelurahans.length) {
      index = 0;
      pbps = [];
      downloadFoto();
    } else {
      console.log("Semua wilayah telah diproses.");
    }
    return;
  }

  let foto_url = "";
  const { nama, no_pbp, foto_ktp, foto_pbp, status_pbp, nama_pengganti } =
    pbps[index];

  if (status_pbp !== "pengganti") {
    index++;
    setTimeout(downloadFotoPBP, 0);
    return;
  }

  const dirPath = path.join(pathPhoto, kabkota, kecamatan, kelurahan);

  if (fotoType === "KTP") {
    foto_url = foto_ktp;
  } else if (fotoType === "PBP") {
    foto_url = foto_pbp;
  }

  // check file exist
  if (
    fs.existsSync(path.join(dirPath, `${no_pbp}_${fotoType}.jpg`)) ||
    foto_url === null
  ) {
    console.log(
      `⏩ ${provinsi}-${kabkota}-${kecamatan}-${kelurahan} ${no_pbp}_${fotoType}`
    );
    index++;
    downloadFotoPBP();
    return;
  }

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // oss sign
  const urlOSSSIgn = "https://banpang.bulog.co.id/api/utils/oss-sign";
  const data = JSON.stringify({
    url: foto_url,
  });

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
      // Cookie string
      Cookie,
    },
  };
  const req = https.request(urlOSSSIgn, options, (res) => {
    let body = "";
    res.on("data", (chunk) => {
      body += chunk;
    });
    res.on("end", () => {
      const {
        results: { url: signedUrl },
      } = JSON.parse(body);
      const ext = path.extname(foto_url);
      if (ext === "") {
        console.error(`404: Ext File Not Found ${foto_url}`);
        downloadFotoPBP();
        return;
      }

      const filePath = path.join(dirPath, `${no_pbp}_${fotoType}${ext}`);
      const fileStream = fs.createWriteStream(filePath);
      http
        .get(signedUrl, (response) => {
          response.pipe(fileStream);
          fileStream.on("finish", () => {
            fileStream.close(() => {
              console.log(
                `✅ ${provinsi}-${kabkota}-${kecamatan}-${kelurahan} ${no_pbp}_${fotoType}`
              );
              index++;
              downloadFotoPBP();
            });
          });
        })
        .on("error", (err) => {
          console.error(`🚫 ${no_pbp}:`, err.message);
          downloadFotoPBP();
        });
    });
  });
  req.on("error", (err) => {
    console.error(`🚫 OSS Sign ${no_pbp}:`, err.message);
    downloadFotoPBP();
  });
  req.write(data);
  req.end();
  req.on("timeout", () => {
    console.error(`⏳ OSS Sign Timeout ${no_pbp}:`, err.message);
    req.destroy();
    downloadFotoPBP();
  });
  req.setTimeout(10000 * 60); // Set timeout to 10 minutes
}

downloadFoto();
