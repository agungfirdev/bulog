const fs = require("fs");
const path = require("path");
const { kelurahans } = require("./utils");
const { JSDOM } = require("jsdom");
const puppeteer = require("puppeteer");
const outPath = "/Users/agungfir/Documents/BULOG/BANPANG 2025/LAPORAN";
const output = "/Users/agungfir/Documents/BULOG/BANPANG 2025/REKAP PBP";

const wilayah = kelurahans;

const kotaMap = wilayah.reduce((acc, item) => {
  const { nama_kota, nama_kabkota } = item;
  if (!acc[nama_kabkota]) {
    acc[nama_kabkota] = [];
  }
  acc[nama_kabkota].push(item);
  return acc;
}, {});

const kecamatanMap = wilayah.reduce((acc, item) => {
  const { nama_kecamatan, nama_kabkota } = item;
  if (!acc[`${nama_kabkota}/${nama_kecamatan}`]) {
    acc[`${nama_kabkota}/${nama_kecamatan}`] = [];
  }
  acc[`${nama_kabkota}/${nama_kecamatan}`].push(item);
  return acc;
}, {});

const kotaNames = Object.keys(kotaMap);
const kecamatanNames = Object.keys(kecamatanMap);
console.log(kotaNames);

let indexWilayah = 0;
let rekap = [];
let rekapPBP = [];
let rekapPBPPerKota = [];
const kode_alokasi = 11;
function rekapFoto() {
  const { nama_provinsi, nama_kabkota, nama_kecamatan, nama_kelurahan } =
    wilayah[indexWilayah];

  const fileName = path.join(
    output,
    `${kode_alokasi}_${nama_provinsi}_${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}.json`
  );

  // jika file tidak ada, skip
  if (!fs.existsSync(fileName)) {
    console.log(`File tidak ditemukan untuk ${nama_kelurahan}, skipping...`);
    indexWilayah++;
    setImmediate(rekapFoto);
    return;
  }
  if (!fileName) {
    console.log("Semua wilayah telah diproses.");
    return;
  }

  if (nama_kabkota === "KAB. BOYOLALI") {
    console.log(`Skipping Guwo in ${nama_kabkota}...`);
    indexWilayah++;
    setImmediate(rekapFoto);
    return;
  }

  const pbps = JSON.parse(fs.readFileSync(fileName, "utf8"));
  const sudahDiserahkan = pbps.filter((item) => item.foto_pbp !== null);
  const belumDiserahkan = pbps.filter((item) => item.foto_pbp === null);
  const terverifikasi = pbps.filter(
    (item) => item.verification_status === "verified"
  );

  const jumlahPbp = pbps.length;
  const jumlahSudahDiserahkan = sudahDiserahkan.length;
  const jumlahBelumDiserahkan = belumDiserahkan.length;
  const jumlahTerverifikasi = terverifikasi.length;
  const persentaseSudahDiserahkan = Math.floor(
    (jumlahSudahDiserahkan / jumlahPbp) * 100
  );

  const rekapDesa = {
    nama_provinsi,
    nama_kabkota,
    nama_kecamatan,
    nama_kelurahan,
    jumlahPbp,
    jumlahBelumDiserahkan,
    jumlahTerverifikasi,
    persentaseSudahDiserahkan,
  };

  rekap.push(rekapDesa);
  indexWilayah++;
  if (indexWilayah < wilayah.length) {
    rekapFoto();
  } else {
    console.log("Semua wilayah telah diproses.");
    // memisahkan menjadi per-kecamatan
    // contoh { "KAB. PEMALANG": [ "Ampelgading": { jumlahPbp;20, jumlahBelumDiserahkan:120, jumlahSudahDiserahkan: 0, persentaseBelumDiserahkan: 0} ] }
    const rekapPerKota = kotaNames.reduce((acc, namaKota) => {
      acc[namaKota] = [];
      Object.keys(kecamatanMap).forEach((key) => {
        const [kabkota, kecamatan] = key.split("/");
        if (kabkota === namaKota) {
          const rekapKecamatan = rekap.filter(
            (item) => item.nama_kecamatan === kecamatan
          );
          if (rekapKecamatan.length > 0) {
            const totalJumlahPbp = rekapKecamatan.reduce(
              (acc, item) => acc + item.jumlahPbp,
              0
            );
            const totalJumlahBelumDiserahkan = rekapKecamatan.reduce(
              (acc, item) => acc + item.jumlahBelumDiserahkan,
              0
            );
            const totalJumlahSudahDiserahkan = rekapKecamatan.reduce(
              (acc, item) => acc + item.jumlahPbp - item.jumlahBelumDiserahkan,
              0
            );

            const totalJumlahTerverifikasi = rekapKecamatan.reduce(
              (acc, item) => acc + item.jumlahTerverifikasi,
              0
            );
            const jumlahDesa = rekapKecamatan.length;

            // Bulatkan ke bawah agar 99.99 menjadi 99, bukan 100
            const persentaseSudahDiserahkan = Math.floor(
              (totalJumlahSudahDiserahkan / totalJumlahPbp) * 100
            ).toString();

            acc[namaKota].push({
              nama_provinsi,
              nama_kabkota: namaKota,
              nama_kecamatan: kecamatan,
              jumlahPbp: totalJumlahPbp,
              jumlahDesa: jumlahDesa,
              jumlahBelumDiserahkan: totalJumlahBelumDiserahkan,
              jumlahTerverifikasi: totalJumlahTerverifikasi,
              persentaseSudahDiserahkan,
            });
          }
        }
      });
      return acc;
    }, {});

    rekapPBP = rekapPerKota;
    indexWilayah = 0;
    rekapFotoPBP();
  }
}

function rekapFotoPBP() {
  const template = fs.readFileSync(
    path.join(__dirname, "template", "TEMPLATE_REKAP_PBP_KOTA.html"),
    "utf8"
  );
  const dom = new JSDOM(template);

  // mendapatkan nama kota dari kotaNames
  const namaKota = kotaNames[indexWilayah];

  const { nama_provinsi, nama_kabkota } = rekapPBP[namaKota][0];
  console.log(`Membuat rekap PBP untuk kota: ${nama_kabkota}`);

  if (!namaKota) {
    console.log("Semua kecamatan telah diproses.");
    return;
  }
  dom.window.document.querySelector("#nama_wilayah").textContent =
    nama_kabkota.toUpperCase();
  const date = new Date();
  dom.window.document.querySelector(
    "#tanggal_laporan"
  ).textContent = `${date.getDate()} ${date.toLocaleString("id-ID", {
    month: "long",
  })} ${date.getFullYear()} ${date.getHours()}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  const tbody = dom.window.document.querySelector("tbody:nth-child(2)");
  rekapPBP[namaKota].forEach((item, index) => {
    const tr = dom.window.document.createElement("tr");
    if (item.persentaseSudahDiserahkan === "100") {
      tr.classList.add("success");
    }

    tr.innerHTML = `
      <td class="visible_border">
        <p class="normal no_margin">${index + 1}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${item.nama_kecamatan.toUpperCase()} <strong>(${
      item.jumlahDesa
    })</strong></p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${item.jumlahPbp.toLocaleString(
          "id-ID"
        )}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${item.jumlahBelumDiserahkan.toLocaleString(
          "id-ID"
        )}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${item.jumlahTerverifikasi.toLocaleString(
          "id-ID"
        )}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${item.persentaseSudahDiserahkan}%</p>
      </td>
    `;
    tbody.appendChild(tr);
  });
  const totalJumlahPbpPerKecamatan = rekapPBP[namaKota].reduce(
    (acc, item) => acc + item.jumlahPbp,
    0
  );
  const totalJumlahSudahDiserahkan = rekapPBP[namaKota].reduce(
    (acc, item) => acc + item.jumlahPbp - item.jumlahBelumDiserahkan,
    0
  );
  const totalJumlahBelumDiserahkanPerKecamatan = rekapPBP[namaKota].reduce(
    (acc, item) => acc + item.jumlahBelumDiserahkan,
    0
  );
  const totalJumlahTerverifikasiPerKecamatan = rekapPBP[namaKota].reduce(
    (acc, item) => acc + item.jumlahTerverifikasi,
    0
  );
  const persentaseDiserahkanPerKecamatan = Math.floor(
    (totalJumlahSudahDiserahkan / totalJumlahPbpPerKecamatan) * 100
  );
  // add total row
  const tr = dom.window.document.createElement("tr");

  tr.innerHTML = `
      <td class="visible_border" colspan="2">
        <p class="normal no_margin"><b>Total</b></p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin"><b>${totalJumlahPbpPerKecamatan.toLocaleString(
          "id-ID"
        )}</b></p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin"><b>${totalJumlahBelumDiserahkanPerKecamatan.toLocaleString(
          "id-ID"
        )}</b></p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin"><b>${totalJumlahTerverifikasiPerKecamatan.toLocaleString(
          "id-ID"
        )}</b></p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin"><b>${persentaseDiserahkanPerKecamatan}%</b></p>
      </td>
    `;

  // date report dengan format 22 AGUSTUS 2025
  const dateReport = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = dateReport
    .toLocaleDateString("id-ID", options)
    .toUpperCase();

  tbody.appendChild(tr);

  // save menjadi gambar dengan memanggil screenshotTable
  const outputPath = path.join(
    outPath,
    `REKAP_PBP_${nama_provinsi}_${nama_kabkota}_${formattedDate}.png`
  );
  screenshotTable(dom.serialize(), outputPath);
}

async function screenshotTable(html, outputPath) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  // screenshot table
  const table = await page.$(".document");
  const boundingBox = await table.boundingBox();
  // simpan sesuai ukuran class .document

  await page.screenshot({
    path: outputPath,
    clip: {
      x: Math.floor(boundingBox.x),
      y: Math.floor(boundingBox.y),
      width: Math.ceil(boundingBox.width),
      height: Math.ceil(boundingBox.height),
    },
  });

  await browser.close();

  indexWilayah++;
  if (indexWilayah < kotaNames.length) {
    rekapFotoPBP();
  } else {
    console.log("Semua kecamatan telah diproses.");
  }
}
rekapFoto();
