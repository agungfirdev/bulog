const fs = require("fs");
const path = require("path");
const { kelurahans } = require("./utils");
const { JSDOM } = require("jsdom");
const puppeteer = require("puppeteer");
const outPath = "/Users/agungfir/Documents/BULOG/BANPANG 2025/LAPORAN";
const output = "/Users/agungfir/Documents/BULOG/BANPANG 2025/REKAP PBP";

const wilayah = kelurahans;

// memisahkan menjadi per-kecamatan
// contoh { "Ampelgading": [ { ... }, { ... } ] }
const kecamatanMap = wilayah.reduce((acc, item) => {
  const { nama_kecamatan, nama_kabkota } = item;
  if (!acc[`${nama_kabkota}/${nama_kecamatan}`]) {
    acc[`${nama_kabkota}/${nama_kecamatan}`] = [];
  }
  acc[`${nama_kabkota}/${nama_kecamatan}`].push(item);
  return acc;
}, {});

const kecamatanNames = Object.keys(kecamatanMap);

let indexWilayah = 0;
let rekap = [];
let rekapPBP = [];
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
  console.log(`Memproses file: ${nama_kelurahan}`);
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
  const jumlahPbp = pbps.length;
  const jumlahSudahDiserahkan = sudahDiserahkan.length;
  const jumlahBelumDiserahkan = belumDiserahkan.length;
  const persentaseSudahDiserahkan = Math.floor(
    (jumlahSudahDiserahkan / jumlahPbp) * 100
  ).toString();
  const jumlahTerverifikasi = pbps.filter(
    (item) => item.verification_status === "verified"
  ).length;
  const jumlahPengganti = pbps.filter(
    (pbp) => pbp.status_pbp === "pengganti"
  ).length;
  const jumlahPerwakilan = pbps.filter(
    (pbp) => pbp.status_pbp === "perwakilan"
  ).length;
  const jumlahPerwakilan1KK = pbps.filter(
    (pbp) => pbp.status_pbp === "normal" && pbp.nama_pengganti !== null
  ).length;

  const rekapDesa = {
    nama_provinsi,
    nama_kabkota,
    nama_kecamatan,
    nama_kelurahan,
    jumlahPbp,
    jumlahBelumDiserahkan,
    jumlahTerverifikasi,
    jumlahPerwakilan,
    jumlahPerwakilan1KK,
    jumlahPengganti,
    persentaseSudahDiserahkan,
  };

  rekap.push(rekapDesa);
  indexWilayah++;
  if (indexWilayah < wilayah.length) {
    rekapFoto();
  } else {
    console.log("Semua wilayah telah diproses.");
    // memisahkan menjadi per-kecamatan
    // contoh { "Ampelgading": [ { ... }, { ... } ] }
    const rekapPerKecamatan = rekap.reduce((acc, item) => {
      const { nama_kecamatan, nama_kabkota } = item;
      if (!acc[`${nama_kabkota}/${nama_kecamatan}`]) {
        acc[`${nama_kabkota}/${nama_kecamatan}`] = [];
      }
      acc[`${nama_kabkota}/${nama_kecamatan}`].push(item);
      return acc;
    }, {});

    rekapPBP = rekapPerKecamatan;
    indexWilayah = 0;
    rekapFotoPBP();
  }
}

function rekapFotoPBP() {
  const template = fs.readFileSync(
    path.join(__dirname, "template", "TEMPLATE_REKAP_PBP_KECAMATAN.html"),
    "utf8"
  );
  const dom = new JSDOM(template);

  // mendapatkan nama kecamatan dari kecamatanNames
  const namaKecamatan = kecamatanNames[indexWilayah];

  const { nama_provinsi, nama_kabkota, nama_kecamatan } =
    rekapPBP[namaKecamatan][0];
  console.log(`Membuat rekap PBP untuk kecamatan: ${namaKecamatan}`);
  if (!namaKecamatan) {
    console.log("Semua kecamatan telah diproses.");
    return;
  }
  dom.window.document.querySelector(
    "#nama_wilayah"
  ).textContent = `${nama_provinsi} / ${nama_kabkota} / ${nama_kecamatan}`;
  // tanggal laporan hari ini dengan format 22 Juli 2025 18:00 dalam Indonesia
  const date = new Date();
  dom.window.document.querySelector(
    "#tanggal_laporan"
  ).textContent = `${date.getDate()} ${date.toLocaleString("id-ID", {
    month: "long",
  })} ${date.getFullYear()} ${date.getHours()}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  // mengisi data rekapPBP ke dalam tabel
  const tbody = dom.window.document.querySelector("tbody:nth-child(2)");
  rekapPBP[namaKecamatan].forEach((item, index) => {
    const tr = dom.window.document.createElement("tr");
    if (item.persentaseSudahDiserahkan === "100") {
      tr.classList.add("success");
    }

    tr.innerHTML = `
      <td class="visible_border">
        <p class="normal no_margin">${index + 1}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${item.nama_kelurahan.toUpperCase()}</p>
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
      <!-- <td class="visible_border">
        <p class="normal no_margin">${item.jumlahPerwakilan1KK.toLocaleString(
          "id-ID"
        )}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${item.jumlahPerwakilan.toLocaleString(
          "id-ID"
        )}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${item.jumlahPengganti.toLocaleString(
          "id-ID"
        )}</p>
      </td> -->
      <td class="visible_border">
        <p class="normal no_margin">${item.persentaseSudahDiserahkan}%</p>
      </td>
    `;
    tbody.appendChild(tr);
  });
  const totalJumlahPbpPerKecamatan = rekapPBP[namaKecamatan].reduce(
    (acc, item) => acc + item.jumlahPbp,
    0
  );
  const totalJumlahSudahDiserahkan = rekapPBP[namaKecamatan].reduce(
    (acc, item) => acc + item.jumlahPbp - item.jumlahBelumDiserahkan,
    0
  );
  const totalJumlahBelumDiserahkanPerKecamatan = rekapPBP[namaKecamatan].reduce(
    (acc, item) => acc + item.jumlahBelumDiserahkan,
    0
  );
  const totalJumlahTerverifikasiPerKecamatan = rekapPBP[namaKecamatan].reduce(
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
  tbody.appendChild(tr);

  const dateReport = new Date();
  const formattedDate = `${dateReport.getDate()} ${dateReport.toLocaleString(
    "id-ID",
    { month: "long" }
  )} ${dateReport.getFullYear()}`;
  // save menjadi gambar dengan memanggil screenshotTable
  const outputPath = path.join(
    outPath,
    `REKAP_PBP_${nama_provinsi}_${nama_kabkota}_${nama_kecamatan.toUpperCase()}_${formattedDate.toUpperCase()}.png`
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
  if (indexWilayah < kecamatanNames.length) {
    rekapFotoPBP();
  } else {
    console.log("Semua kecamatan telah diproses.");
  }
}
rekapFoto();
