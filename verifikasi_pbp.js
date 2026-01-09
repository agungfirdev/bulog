const { Cookie } = require("./utils");
const wilayahs = require("./data/wilayah.json");
const fs = require("fs");
const path = require("path");
const wilayah = wilayahs.filter(
  (wilayah) => wilayah.nama_kabkota === "KAB. PEMALANG"
);

let index = 0;
let indexWilayah = 150;

function verifikasi() {
  const { nama_provinsi, nama_kabkota, nama_kecamatan, nama_kelurahan } =
    wilayah[indexWilayah];
  const pathFile = path.join(
    __dirname,
    "rekap_pbp",
    `${nama_provinsi}_${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}.json`
  );
  const pbpVerify = JSON.parse(fs.readFileSync(pathFile)).filter(
    (pbp) => pbp.verification_status === "unverified"
  );

  if (indexWilayah >= wilayah.length) {
    console.log("All regions processed.");
    return;
  }

  if (index >= pbpVerify.length) {
    console.log("All records processed.");
    index = 0;
    indexWilayah++;
    return verifikasi();
  }

  const { id: pbp_id } = pbpVerify[index];

  fetch("https://banpang.bulog.co.id/api/file-upload/pbp/verify", {
    headers: {
      "content-type": "application/json",
      Cookie,
    },
    body: JSON.stringify({
      pbp_id,
      status: "verified",
      catatan: "",
    }),
    method: "POST",
  })
    .then((response) => {
      if (response.ok) {
        console.log(
          `Record ${nama_kabkota},${nama_kelurahan} ${index} verified successfully.`
        );
        return response.json();
      } else {
        console.error(`Failed to verify record ${index + 1}.`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    })
    .then((data) => {
      console.log(`Message: ${data.message}`);
      index++;
      setImmediate(verifikasi);
    })
    .catch((error) => {
      console.error(`Error verifying record ${index + 1}: ${error.message}`);
      setImmediate(verifikasi);
    });
}

verifikasi();
