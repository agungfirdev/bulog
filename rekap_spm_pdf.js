const fs = require("fs");
const path = require("path");
const wilayah = require("./data/wilayah.json");
const { JSDOM } = require("jsdom");
const puppeteer = require("puppeteer");
const spms = require("./data/spm_data.json").sort((a, b) => {
  if (a.provinsi < b.provinsi) return -1;
  if (a.provinsi > b.provinsi) return 1;
  if (a.kabupaten < b.kabupaten) return -1;
  if (a.kabupaten > b.kabupaten) return 1;
  if (a.kecamatan < b.kecamatan) return -1;
  if (a.kecamatan > b.kecamatan) return 1;
  if (a.kelurahan < b.kelurahan) return -1;
  if (a.kelurahan > b.kelurahan) return 1;
  if (a.no_spm < b.no_spm) return -1;
  if (a.no_spm > b.no_spm) return 1;
  return 0;
});

// .sort((a, b) => {
//   // Komoditas 'Minyak Goreng' ditaruh di bawah (akhir list)
//   const aIsMG = (a.komoditas_name || "")
//     .toLowerCase()
//     .includes("minyak goreng");
//   const bIsMG = (b.komoditas_name || "")
//     .toLowerCase()
//     .includes("minyak goreng");
//   if (aIsMG && !bIsMG) return 1;
//   if (!aIsMG && bIsMG) return -1;
//   return 0;
// });

const pathFolder = "/Users/agungfir/Documents/BULOG/BANPANG 2025/LAPORAN";

function getOutputPath(data) {
  const { kecamatan, provinsi, kabupaten } = data;
  const dateReport = new Date();
  const formattedDate = `${dateReport.getDate()} ${dateReport.toLocaleString(
    "id-ID",
    { month: "long" }
  )} ${dateReport.getFullYear()}`;

  const outputPath = path.join(
    pathFolder,
    `REKAP SPM_${provinsi}_${kabupaten}_${kecamatan.toUpperCase()}_${formattedDate.toUpperCase()}.pdf`
  );
  return outputPath;
}

const wilayahFiltered = wilayah.filter((item) => {
  return item.nama_kabkota === "KAB. PEMALANG";
});

// memisahkan menjadi per-kecamatan
// contoh { "Ampelgading": [ { ... }, { ... } ] }
const kecamatanMap = wilayahFiltered.reduce((acc, item) => {
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

function rekapFoto() {
  const { nama_provinsi, nama_kabkota, nama_kecamatan, nama_kelurahan } =
    wilayahFiltered[indexWilayah];
  // If kecamatan Ampelgading skip

  indexWilayah++;
  if (indexWilayah < wilayahFiltered.length) {
    rekapFoto();
  } else {
    console.log("Semua wilayah telah diproses.");

    rekapPBP = spms.reduce((acc, item) => {
      const { kecamatan, kabupaten } = item;
      if (!acc[`${kabupaten}/${kecamatan}`]) {
        acc[`${kabupaten}/${kecamatan}`] = [];
      }
      acc[`${kabupaten}/${kecamatan}`].push(item);
      return acc;
    }, {});
    indexWilayah = 0;
    rekapFotoPBP();
  }
}

function rekapFotoPBP() {
  const template = fs.readFileSync(
    path.join(__dirname, "template", "TEMPLATE_REKAP_SPM_PER_KECAMATAN.html"),
    "utf8"
  );
  const dom = new JSDOM(template);

  const namaKecamatan = kecamatanNames[indexWilayah];

  if (!namaKecamatan) {
    console.log("Semua kecamatan telah diproses.");
    return;
  }

  if (rekapPBP[namaKecamatan] === undefined) {
    indexWilayah++;
    rekapFotoPBP();
    return;
  }
  const { provinsi, kabupaten, kecamatan } = rekapPBP[namaKecamatan][0];
  // skip
  // if (
  //   kecamatan !== "Watukumpul"
  // ) {
  //   indexWilayah++;
  //   rekapFotoPBP();
  //   return;
  // }
  console.log(`Membuat rekap PBP untuk kecamatan: ${namaKecamatan}`);

  dom.window.document.querySelector(
    "#nama_wilayah"
  ).textContent = `${provinsi} / ${kabupaten} / ${kecamatan}`;

  const noSOBeras = rekapPBP[namaKecamatan].filter(
    (i) => i.komoditas_name === "Beras"
  )[0].no_so;
  const noSOMinyak = rekapPBP[namaKecamatan].filter(
    (i) => i.komoditas_name === "Minyak Goreng"
  )[0].no_so;
  dom.window.document.querySelector(
    "#nomor_so"
  ).textContent = `Beras : ${noSOBeras}, Minyak : ${noSOMinyak}`;

  const tbody = dom.window.document.querySelector("tbody:nth-child(2)");
  rekapPBP[namaKecamatan].forEach((item, index) => {
    const {
      createdAt: created_at,
      kelurahan,
      no_spm,
      no_out,
      driver,
      plat_number,
      no_hp,
      qty,
      komoditas_name,
    } = item;
    const tr = dom.window.document.createElement("tr");
    // format tanggal dengan format seperti berikut 31-01-2025 dari createdAt
    const createdAt = new Date(created_at);
    const tanggal = `${createdAt.getDate().toString().padStart(2, "0")}/${(
      createdAt.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${createdAt.getFullYear()}`;
    tr.innerHTML = `
      <td class="visible_border">
        <p class="normal no_margin">${index + 1}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${kelurahan.toUpperCase()}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${no_spm}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${no_out}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${driver
          .replace("11001-", "")
          .replace("11001 - ", "")}</p>
        </td>
      <td class="visible_border">
        <p class="normal no_margin">${plat_number}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${no_hp}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${qty.toLocaleString("id-ID")} ${
      komoditas_name === "Minyak Goreng" ? "L" : "Kg"
    }</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${tanggal}</p>
      </td>
    `;
    tbody.appendChild(tr);
  });
  // save menjadi gambar dengan memanggil screenshotTable

  const outputPath = getOutputPath({
    provinsi,
    kabupaten,
    kecamatan,
  });
  screenshotTable(dom.serialize(), outputPath);
}

async function screenshotTable(html, outputPath) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.emulateMediaType("print");
  await page.pdf({
    path: outputPath,
    format: "A4",
    landscape: true,
    printBackground: true,
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
