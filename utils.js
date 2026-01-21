const fs = require("fs");
const path = require("path");
const wilayah = require("./data/wilayah.json");
// natural compare A-Z
function naturalCompareAZ(a, b) {
  return a.localeCompare(b, undefined, { numeric: true });
}

// natural compare Z-A
function naturalCompareZA(a, b) {
  return b.localeCompare(a, undefined, { numeric: true });
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
const CookieJSON = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "cookies.json"), "utf8"),
).map((cookie) => ({ ...cookie, sameSite: "" }));

const Cookie = CookieJSON.map((c) => `${c.name}=${c.value}`).join("; ");

function getTab(text, width) {
  const count_tab = text.length / 8;
  const add_tab = width - count_tab;
  let string = "";
  for (let i = 0; i < add_tab; i++) {
    string += "\t";
  }
  return string;
}

function titleCaseNormalize(s) {
  if (!s) return s;
  return s
    .trim()
    .split(/\s+/)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

let kelurahans = wilayah
  .sort((a, b) => {
    if (a.nama_provinsi < b.nama_provinsi) return -1;
    if (a.nama_provinsi > b.nama_provinsi) return 1;
    if (a.nama_kabkota < b.nama_kabkota) return -1;
    if (a.nama_kabkota > b.nama_kabkota) return 1;
    if (a.nama_kecamatan < b.nama_kecamatan) return -1;
    if (a.nama_kecamatan > b.nama_kecamatan) return 1;
    if (a.nama_kelurahan < b.nama_kelurahan) return -1;
    if (a.nama_kelurahan > b.nama_kelurahan) return 1;
    return 0;
  })
  .filter(
    ({ nama_kabkota }) =>
      //  nama_kabkota === "KAB. BATANG"
      // nama_kabkota === "KAB. BREBES"
      nama_kabkota === "KAB. PEMALANG",
    // nama_kabkota === "KAB. TEGAL"
    // nama_kabkota === "KAB. PEKALONGAN"
    // nama_kabkota === "KOTA TEGAL"
    // nama_kabkota === "KOTA PEKALONGAN"
  );
// .filter(
//   ({ nama_kecamatan, nama_kelurahan }) =>
// nama_kecamatan === "Ampelgading" ||
// nama_kecamatan === "Bantarbolang" ||
// nama_kecamatan !== "Belik"
// nama_kecamatan === "Bodeh" && nama_kelurahan === "Kebandaran"
// nama_kecamatan === "Comal" ||
// nama_kecamatan === "Moga" ||
// nama_kecamatan === "Pemalang" ||
// nama_kecamatan === "Petarukan"
// nama_kecamatan === "Pulosari" ||
// nama_kecamatan === "Randudongkal" &&
// nama_kecamatan === "Taman"
// nama_kecamatan === "Ulujami" ||
// nama_kecamatan === "Warungpring"
// nama_kecamatan === "Watukumpul"
// );

module.exports = {
  naturalCompareAZ,
  naturalCompareZA,
  delay,
  Cookie,
  CookieJSON,
  getTab,
  kelurahans,
  titleCaseNormalize,
};
