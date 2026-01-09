const fs = require("fs");
const path = require("path");
const https = require("https");
const { Cookie, kelurahans } = require("./utils");
const readline = require("readline");
const output = "/Users/agungfir/Documents/BULOG/BANPANG 2025/REKAP PBP";
const kode_alokasi = 11;

const wilayah = kelurahans;
let index = 0;

function getRekapPBP() {
  if (wilayah[index] === undefined) {
    console.log("All records processed.");
    const files = fs.readdirSync(path.join(__dirname, "processed"));

    for (const file of files) {
      const oldPath = path.join("processed", file);
      const newPath = path.join(output, file);
      fs.renameSync(oldPath, newPath);
    }
    return;
  }
  const {
    kode_provinsi,
    kode_kabkota,
    kode_kecamatan,
    kode_kelurahan,
    nama_provinsi,
    nama_kabkota,
    nama_kecamatan,
    nama_kelurahan,
  } = wilayah[index];

  const outputPath = path.join(
    path.join(
      __dirname,
      "processed",
      `${kode_alokasi}_${nama_provinsi}_${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}.json`
    )
  );
  if (fs.existsSync(outputPath)) {
    index++;
    setImmediate(getRekapPBP);
    return;
  }

  readline.clearLine(process.stdout, 0); // hapus seluruh baris
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(
    `${index + 1}/${
      wilayah.length
    } ${nama_kabkota} - ${nama_kecamatan} - ${nama_kelurahan}`
  );
  const body = JSON.stringify({
    alokasi_bulan: kode_alokasi,
    alokasi_tahun: "2025",
    kelurahan: kode_kelurahan,
    kode_kabupaten: kode_kabkota,
    kode_kecamatan,
    kode_provinsi: String(kode_provinsi),
  });
  const options = {
    method: "POST",
    headers: {
      "Content-Length": body.length,
      Cookie,
    },
  };
  const urlFilters = "https://banpang.bulog.co.id/api/file-upload/filters";

  const req = https.request(urlFilters, options, (r) => {
    let data = "";
    r.on("data", (chunk) => {
      data += chunk;
    });
    r.on("end", () => {
      let json;
      try {
        json = JSON.parse(data);
      } catch (error) {
        process.stdout.write(`✗ Gagal: ${error.message}`);
        // fs.writeFileSync("data_errors.json", JSON.stringify(data, null, 2));
        index++;
        getRekapPBP();
        return;
      }

      if (json.results === null) {
        // console.error(`No results found for ${nama_kelurahan}`);
        index++;
        setImmediate(getRekapPBP);
        return;
      }
      const bast_id = json.results.id;
      // ganti fetch dibawah ini dengan https
      const postData = JSON.stringify({ bast_id });

      const optionsRekapPbp = {
        method: "POST",
        headers: {
          "Content-Length": data.length,
          Cookie,
        },
      };

      const urlRekapPbp = "https://banpang.bulog.co.id/api/file-upload/pbp";
      const request = https.request(urlRekapPbp, optionsRekapPbp, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
          // console.log(data);
        });

        res.on("error", (err) => {
          process.stdout.write(`✗ Gagal ${err.message}`);
          getRekapPBP();
        });

        res.on("end", () => {
          let json;
          try {
            json = JSON.parse(data);
          } catch (error) {
            // console.error(`Error parsing JSON: ${error.message}`);
            // console.error(`Response data: ${data}`);
            process.stdout.write(` ${data}`);
            fs.writeFileSync("data_errors.json", JSON.stringify(data, null, 2));
            getRekapPBP();
            return;
          }

          const resultsPBP = json.results;
          const resultsSorted = resultsPBP.sort((a, b) => {
            if (a.nama < b.nama) return -1;
            if (a.nama > b.nama) return 1;
            return 0;
          });
          const rekapPBP = resultsSorted.map((item, index) => {
            return {
              no_urut_dtt: index + 1,
              ...item,
              nama_provinsi,
              nama_kabkota,
              nama_kecamatan,
              nama_kelurahan,
            };
          });

          const outputPath = path.join(
            __dirname,
            "processed",
            `${kode_alokasi}_${nama_provinsi}_${nama_kabkota}_${nama_kecamatan.replaceAll(
              "/",
              " "
            )}_${nama_kelurahan.replaceAll("/", " ")}.json`
          );
          fs.writeFileSync(outputPath, JSON.stringify(rekapPBP, null, 2));
          process.stdout.write(` ✓`);

          index++;
          setImmediate(getRekapPBP);
        });
      });

      request.on("timeout", () => {
        getRekapPBP();
        // console.error(`Request timed out`);
      });

      request.on("error", (e) => {
        getRekapPBP();
        // console.error(`Problem with request: ${e.message}`);
      });

      request.on("finish", () => {
        // console.log("Request finished 2");
      });
      request.write(postData);
      request.end();
    });
  });

  req.on("timeout", () => {
    getRekapPBP();
    // console.error(`Request timed out`);
  });

  req.on("error", (e) => {
    getRekapPBP();
    // console.error(`Problem with request: ${e.message}`);
  });

  req.on("finish", () => {
    // console.log("Request finished 1");
  });
  req.write(body);
  req.end();
}

getRekapPBP();
