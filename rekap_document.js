const { kelurahans } = require("./utils");
const { Cookie } = require("./utils");
const { writeFileSync } = require("fs");
const { join } = require("path");
const https = require("https");
let index = 0;

function getRekapDoc() {
  if (index < kelurahans.length) {
    const {
      kode_provinsi,
      kode_kabkota,
      kode_kecamatan,
      kode_kelurahan,
      nama_provinsi,
      nama_kabkota,
      nama_kecamatan,
      nama_kelurahan,
    } = kelurahans[index];

    console.log(`Mendapatkan rekap untuk ${nama_kelurahan}`);

    const body = JSON.stringify({
      kelurahan: kode_kelurahan,
      kode_kabupaten: kode_kabkota,
      kode_kecamatan,
      kode_provinsi: String(kode_provinsi),
      alokasi_bulan: 11,
      alokasi_tahun: "2025",
    });

    const req = https.request(
      "https://banpang.bulog.co.id/api/file-upload/filters",
      {
        method: "POST",
        headers: {
          Cookie,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            console.log(`Response for ${nama_kelurahan}: ${json.message}`);
            if (res.statusCode === 200) {
              writeFileSync(
                join(
                  __dirname,
                  "rekap_docs",
                  `${nama_provinsi}_${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}.json`
                ),
                JSON.stringify(json.results)
              );
              index++;
              getRekapDoc();
            } else {
              getRekapDoc();
            }
          } catch (e) {
            getRekapDoc();
          }
        });
      }
    );

    req.on("error", (e) => {
      console.error(`Error: ${e.message}`);
    });

    req.write(body);
    req.end();
  } else {
    console.log("Selesai");
  }
}

getRekapDoc();
