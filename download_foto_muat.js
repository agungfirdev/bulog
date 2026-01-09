const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { Cookie, kelurahans } = require("./utils");
let spms = require("./data/spm_data.json");
const pathFolder =
  "/Users/agungfir/Documents/BULOG/BANPANG 2025/FOTO MUAT, BONGKAR & SURAT JALAN";

const argv = process.argv.slice(2);
const filterKec = argv.find((arg) => arg.startsWith("--kec="));
if (filterKec) {
  const filterValue = filterKec.split("=")[1].toLowerCase();
  spms = spms.filter((kel) =>
    `${kel.nama_kecamatan}`.toLowerCase().includes(filterValue)
  );
}

let fotoType = null;
argv.find((arg) => {
  if (arg.startsWith("--type=")) {
    fotoType = arg.split("=")[1];
  }
});

let index = 0;

function downloadFotoMuat() {
  if (index >= spms.length) {
    console.log("Semua SPM telah diproses.");
    return;
  }
  const {
    provinsi,
    kabupaten,
    kecamatan,
    kelurahan,
    no_spm,
    foto_muat_barang,
    driver,
    qty,
    alokasi_bulan,
    alokasi_tahun,
    kode_kecamatan,
  } = spms[index];

  // jika foto_muat_barang null atau kosong, lewati
  if (!foto_muat_barang) {
    console.log(`⚠️  Tidak ada foto muat untuk SPM ${no_spm}`);
    index++;
    downloadFotoMuat();
  }
  // oss sign
  const urlOSSSIgn = "https://banpang.bulog.co.id/api/utils/oss-sign";
  // cari kode kelurahan dari kelurahans
  const kelurahanData = kelurahans.find(
    (k) => k.nama_kelurahan === kelurahan && k.kode_kecamatan === kode_kecamatan
  );
  const noBast = `BAST-${alokasi_tahun}${alokasi_bulan}${
    kelurahanData?.kode_kelurahan.replaceAll(".", "") || "0000"
  }`;

  let urlFoto = null;

  const fotoBongkar = `${alokasi_tahun}/${alokasi_bulan}/jpl/BAST/${noBast}/drop/bongkar/${noBast.replace(
    "-",
    ""
  )}-${no_spm.replaceAll(".", "")}-.jpg`;
  const fotoSuratJalan = fotoBongkar.replace("bongkar", "surat");

  if (fotoType === "sj") {
    urlFoto = fotoSuratJalan;
  } else if (fotoType === "bongkar") {
    urlFoto = fotoBongkar;
  } else {
    urlFoto = foto_muat_barang;
  }

  const data = JSON.stringify({
    url: urlFoto,
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
      const ext = path.extname(foto_muat_barang);
      if (ext === "") {
        console.error(`404: Ext File Not Found ${foto_muat_barang}`);
        downloadFotoMuat();
        return;
      }
      const dirPath = path.join(
        pathFolder,
        fotoType === "bongkar" ? "Foto Bongkar" : "Foto Muat",
        kabupaten,
        kecamatan
      );

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const filePathMuat = path.join(
        dirPath,
        `${driver.replace(
          "11001-",
          ""
        )} - ${kelurahan.toUpperCase()} ${qty} - ${no_spm}${ext}`
      );
      const filePathBongkar = path.join(
        dirPath,
        `${driver.replace(
          "11001-",
          ""
        )} - ${kelurahan.toUpperCase()} ${qty} - ${noBast.replace(
          "-",
          ""
        )}-${no_spm}-${ext}`
      );
      const filePath = fotoType === "bongkar" ? filePathBongkar : filePathMuat;

      if (fs.existsSync(filePath)) {
        // skip
        console.log(`⏩ ${driver} - ${kelurahan} ${qty} - ${no_spm}`);
        index++;
        downloadFotoMuat();
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      http
        .get(signedUrl, (response) => {
          response.pipe(fileStream);
          fileStream.on("finish", () => {
            fileStream.close(() => {
              console.log(
                `✅ ${driver} - ${kelurahan} ${qty} - ${no_spm}${ext}`
              );
              index++;
              downloadFotoMuat();
            });
          });
        })
        .on("error", (err) => {
          console.error(`🚫 ${no_spm}:`, err.message);
          downloadFotoMuat();
        });
    });
  });
  req.on("error", (err) => {
    console.error(`🚫 OSS Sign ${no_spm}:`, err.message);
    downloadFotoMuat();
  });
  req.write(data);
  req.end();
  req.on("timeout", () => {
    console.error(`⏳ OSS Sign Timeout ${no_spm}:`, err.message);
    req.destroy();
    downloadFotoMuat();
  });
  req.setTimeout(10000 * 60); // Set timeout to 10 minutes
}

downloadFotoMuat();
