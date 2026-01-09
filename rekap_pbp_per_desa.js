const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const { kelurahans } = require("./utils");
const puppeteer = require("puppeteer");
const { JSDOM } = require("jsdom");
const outPath = "/Users/agungfir/Documents/BULOG/BANPANG 2025/LAPORAN";
const output = "/Users/agungfir/Documents/BULOG/BANPANG 2025/REKAP PBP";
const QRCode = require("qrcode");

const wilayah = kelurahans;

// memisahkan menjadi per-kecamatan
// contoh { "Ampelgading": [ { ... }, { ... } ] }
const kecamatanMap = wilayah.reduce((acc, item) => {
  const { nama_kecamatan } = item;
  if (!acc[nama_kecamatan]) {
    acc[nama_kecamatan] = [];
  }
  acc[nama_kecamatan].push(item);
  return acc;
}, {});

let indexWilayah = 0;
let indexPBP = 0;
let pbps = [];
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

  console.log(`Memproses file: ${nama_kelurahan}`);
  if (!fileName) {
    console.log("Semua wilayah telah diproses.");
    return;
  }
  pbps = JSON.parse(fs.readFileSync(fileName, "utf8"))
    // sort by nama A-Z
    .sort((a, b) => {
      if (a.nama < b.nama) return -1;
      if (a.nama > b.nama) return 1;
      return 0;
    })
    // add nomor urut
    .map((item, index) => {
      return {
        no: index + 1,
        ...item,
      };
    })
    .filter((item) => item.foto_pbp === null);

  // jika sisa penyerahan 0 maka tidak usah jadikan pdf
  if (pbps.length === 0) {
    console.log(`Tidak ada PBP yang perlu direkap untuk ${nama_kelurahan}.`);
    indexWilayah++;
    if (indexWilayah < wilayah.length) {
      rekapFoto();
    } else {
      console.log("Semua kecamatan telah diproses.");
    }
    return;
  }

  const mapPBPForExcel = pbps.map((item) => {
    return {
      NO: item.no,
      NAMA: item.nama.toUpperCase(),
      NIK: item.nik ? item.nik.replace(/\d{4}$/, "****") : "",
      ALAMAT_PBP: item.alamat_pbp,
    };
  });
  // save xls
  const fileNameExcel = `${nama_provinsi}_${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}`;
  // const outputPath = path.join(outPath, fileNameExcel);

  // toExcel(mapPBPForExcel, fileNameExcel);
  rekapFotoPBP();
}

async function rekapFotoPBP() {
  const template = fs.readFileSync(
    path.join(__dirname, "template", "TEMPLATE_REKAP_PBP_DESA.html"),
    "utf8"
  );
  const dom = new JSDOM(template);

  const { nama_kabkota, nama_kecamatan, nama_kelurahan } =
    wilayah[indexWilayah];

  console.log(`Membuat rekap PBP untuk kelurahan: ${nama_kelurahan}`);

  if (!nama_kelurahan) {
    console.log("Semua kelurahan telah diproses.");
    return;
  }
  dom.window.document.querySelector("#nama_kabkota").textContent =
    nama_kabkota.toUpperCase();
  dom.window.document.querySelector("#nama_kecamatan").textContent =
    nama_kecamatan.toUpperCase();
  dom.window.document.querySelector("#nama_kelurahan").textContent =
    nama_kelurahan.toUpperCase();

  // mengisi data rekapPBP ke dalam tabel
  const tbody = dom.window.document.querySelector("tbody:nth-child(2)");
  for (const { no, no_bast, no_pbp, nik, nama, alamat_pbp } of pbps) {
    const tr = dom.window.document.createElement("tr");

    const qrCodeObj = {
      no_pbp,
      no_bast,
      nik,
      nama,
    };

    const qrCodeSVG = await QRCode.toString(JSON.stringify(qrCodeObj), {
      type: "svg",
      width: 125, // optional — library scales modules to this width
      margin: 0, // optional — white space around QR code
    });

    tr.innerHTML = `
      <td class="visible_border">
        <p class="normal no_margin">${no}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${nama.toUpperCase()}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${no_pbp}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${nik.replace(/\d{4}$/, "****")}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${alamat_pbp}</p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin">${qrCodeSVG}</p>
      </td>
    `;
    tbody.appendChild(tr);
  }

  // save menjadi pdf dengan memanggil screenshotTable
  const outputPath = path.join(
    outPath,
    `${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}.pdf`
  );
  screenshotTable(dom.serialize(), outputPath);
}

async function screenshotTable(html, outputPath) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  // simpan sebagai PDF
  await page.emulateMediaType("print");
  await page.pdf({
    path: outputPath,
    format: "A4",
  });

  await browser.close();

  indexWilayah++;
  pbps = [];
  if (indexWilayah < wilayah.length) {
    rekapFoto();
  } else {
    console.log("Semua kelurahan telah diproses.");
  }
}

function toExcel(data, fileName) {
  // Ubah data array JS ke worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  // Atur lebar kolom otomatis sesuai konten
  const cols = Object.keys(data[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => (row[key] ? String(row[key]).length : 0))
    );
    return { wch: maxLen + 2 };
  });
  ws["!cols"] = cols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  // Simpan file Excel ke outPath
  const filePath = path.join(outPath, fileName + ".xlsx");
  XLSX.writeFile(wb, filePath);
  console.log(`File Excel berhasil disimpan: ${filePath}`);
  indexWilayah++;
  if (indexWilayah < wilayah.length) {
    rekapFoto();
  } else {
    console.log("Semua kelurahan telah diproses.");
  }
}

rekapFoto();
