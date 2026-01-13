const fs = require("fs");
const path = require("path");
const wilayah = require("./data/wilayah.json");
const { JSDOM } = require("jsdom");
const { kelurahans } = require("./utils");
const puppeteer = require("puppeteer");
const outPath = "/Users/agungfir/Documents/BULOG/BANPANG 2025/LAPORAN";
const output = "rekap_docs";

let indexWilayah = 0;
let rekap = [];
let rekapPBP = [];
const kode_alokasi = 11;

let kecamatanMap = kelurahans.reduce((acc, item) => {
  const { nama_kecamatan, nama_kabkota } = item;
  if (!acc[`${nama_kabkota}/${nama_kecamatan}`]) {
    acc[`${nama_kabkota}/${nama_kecamatan}`] = [];
  }
  acc[`${nama_kabkota}/${nama_kecamatan}`].push(item);
  return acc;
}, {});
const kecamatanNames = Object.keys(kecamatanMap);

const kotaMap = wilayah.reduce((acc, item) => {
  const { nama_kabkota } = item;
  if (!acc[nama_kabkota]) {
    acc[nama_kabkota] = [];
  }
  acc[nama_kabkota].push(item);
  return acc;
}, {});
const kotaNames = Object.keys(kotaMap);

function rekapFoto() {
  const { nama_provinsi, nama_kabkota, nama_kecamatan, nama_kelurahan } =
    kelurahans[indexWilayah];

  const fileName = path.join(
    output,
    `${nama_provinsi}_${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}.json`
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
  const docs = JSON.parse(fs.readFileSync(fileName, "utf8"));

  const rekapDesa = {
    nama_provinsi,
    nama_kabkota,
    nama_kecamatan,
    nama_kelurahan,
    ...docs,
  };

  rekap.push(rekapDesa);
  indexWilayah++;
  if (indexWilayah < kelurahans.length) {
    rekapFoto();
  } else {
    console.log("Semua wilayah telah diproses.");
    // memisahkan menjadi per-kecamatan
    // contoh { "Ampelgading": [ { ... }, { ... } ] }
    // filter rekap hanya untuk persentaseSudahDiserahkan === "100"
    // rekap = rekap.filter((item) => item.persentaseSudahDiserahkan === "100");

    const rekapPerKota = rekap.reduce((acc, item) => {
      const { nama_kabkota } = item;
      if (!acc[`${nama_kabkota}`]) {
        acc[`${nama_kabkota}`] = [];
      }
      acc[`${nama_kabkota}`].push(item);
      return acc;
    }, {});

    rekapPBP = rekapPerKota;

    kecamatanMap = rekap.reduce((acc, item) => {
      const key = `${item.nama_kabkota}/${item.nama_kecamatan}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    indexWilayah = 0;
    rekapFotoPBP();
  }
}

function rekapFotoPBP() {
  const template = fs.readFileSync(
    path.join(__dirname, "template", "TEMPLATE_REKAP_DOC_KOTA_DESA.html"),
    "utf8"
  );
  const dom = new JSDOM(template);

  // mendapatkan nama kota dari kotaNames
  const namaKota = kotaNames[indexWilayah];

  if (rekapPBP[namaKota] === undefined) {
    console.log(`Tidak ada data PBP untuk kota: ${namaKota}`);
    indexWilayah++;
    setImmediate(rekapFotoPBP);
    return;
  }
  const { nama_provinsi, nama_kabkota, nama_kecamatan } = rekapPBP[namaKota][0];
  console.log(`Membuat rekap PBP untuk kota: ${namaKota}`);
  if (!namaKota) {
    console.log("Semua kota telah diproses.");
    return;
  }
  dom.window.document.querySelector(
    "#nama_wilayah"
  ).textContent = `${nama_provinsi} / ${nama_kabkota}`;
  dom.window.document.querySelector(
    "#nama_wilayah"
  ).innerHTML = `LAPORAN BERKAS DESA<br>${nama_provinsi} / ${nama_kabkota}`;
  // ).innerHTML = `PENERIMAAN BIAYA OPERASIONAL BANPANG<br>OKTOBER - NOVEMBER 2025<br>KEC. ${nama_kecamatan.toUpperCase()}`;
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

  fs.writeFileSync(
    path.join(
      `REKAP_BERKAS_${nama_provinsi}_${nama_kabkota}_${date.getDate}_${
        date.getMonth() + 1
      }_${date.getFullYear()}.json`
    ),
    JSON.stringify(rekapPBP[namaKota], null, 2),
    "utf8"
  );

  rekapPBP[namaKota].forEach((item, index) => {
    const tr = dom.window.document.createElement("tr");
    // if (item.persentaseSudahDiserahkan === "100") {
    //   tr.classList.add("success");
    // }
    // tr.style.pageBreakInside = "avoid";
    // tr.style.breakInside = "avoid";

    tr.innerHTML = `
      <td class="visible_border">
        <p class="normal no_margin">${index + 1}</p>
      </td>`;

    // pada tr pertama rowspan sesuai jumlah value yang sama
    if (
      index === 0 ||
      rekapPBP[namaKota][index - 1].nama_kecamatan !== item.nama_kecamatan
    ) {
      tr.innerHTML += `
      <td class="visible_border" rowspan="${
        kecamatanMap[`${nama_kabkota}/${item.nama_kecamatan}`].length
      }">
        <p class="normal no_margin text-center">${item.nama_kecamatan.toUpperCase()}</p>
      </td>`;
    }

    // cari item history_verification_document yang verifikasi_document adalah diterima
    const history = item.history_verification_document.find(
      (h) => h.verifikasi_document === "diterima"
    );

    // buat variable isVerified jika history ada dan history.verifikasi_document === "diterima"
    const isVerified = history ? true : false;
    tr.innerHTML += `
    <td class="visible_border">
      <p class="normal no_margin">${item.nama_kelurahan.toUpperCase()}</p>
    </td>
    <td class="visible_border">
        <p class="normal no_margin">${
          isVerified ? "✅" : item.file_sptjm === null ? "" : "V"
        }</p>
    </td>
    <td class="visible_border">
      <p class="normal no_margin">${
        isVerified ? "✅" : item.file_bast_pengganti === null ? "" : "V"
      }</p>
    </td>
    <td class="visible_border">
        <p class="normal no_margin">${
          isVerified ? "✅" : item.file_bast_perwakilan === null ? "" : "V"
        }</p>
    </td>
    <td class="visible_border">
      <p class="normal no_margin">${
        isVerified ? "✅" : item.file_bast_pbp === null ? "" : "V"
      }</p>
    </td>
    `;
    tbody.appendChild(tr);

    // ketika selanjutnya beda kecamatan maka tambahkan page break
    // if (
    //   index === 0 ||
    //   rekapPBP[namaKota][index - 1].nama_kecamatan !== item.nama_kecamatan
    // ) {
    //   const pageBreak = dom.window.document.createElement("div");
    //   pageBreak.classList.add("page-break");
    //   dom.window.document.body.appendChild(pageBreak);
    // }
  });
  const totalJumlahPbpPerKota = rekapPBP[namaKota].reduce(
    (acc, item) => acc + item.jumlahPbp,
    0
  );

  const totalJumlahPerwakilanPerKota = rekapPBP[namaKota].reduce(
    (acc, item) => acc + item.jumlahPerwakilan,
    0
  );

  const totalJumlahPerwakilan1KKPerKota = rekapPBP[namaKota].reduce(
    (acc, item) => acc + item.jumlahPerwakilan1KK,
    0
  );

  const totalJumlahPenggantiPerKota = rekapPBP[namaKota].reduce(
    (acc, item) => acc + item.jumlahPengganti,
    0
  );

  const totalJumlahSudahDiserahkan = rekapPBP[namaKota].reduce(
    (acc, item) => acc + item.jumlahPbp - item.jumlahBelumDiserahkan,
    0
  );
  const totalJumlahBelumDiserahkanPerKota = rekapPBP[namaKota].reduce(
    (acc, item) => acc + item.jumlahBelumDiserahkan,
    0
  );
  const totalJumlahTerverifikasiPerKota = rekapPBP[namaKota].reduce(
    (acc, item) => acc + item.jumlahTerverifikasi,
    0
  );
  const persentaseDiserahkanPerKecamatan = (
    (totalJumlahSudahDiserahkan / totalJumlahPbpPerKota) *
    100
  ).toFixed(0);
  // add total row
  const tr = dom.window.document.createElement("tr");

  tr.innerHTML = `
      <td class="visible_border" colspan="3">
        <p class="normal no_margin"><b>Total</b></p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin"><b>${totalJumlahPbpPerKota.toLocaleString(
          "id-ID"
        )}</b></p>
      </td>
      <!-- <td class="visible_border">
        <p class="normal no_margin"><b>${totalJumlahBelumDiserahkanPerKota.toLocaleString(
          "id-ID"
        )}</b></p>
      </td> -->
      <td class="visible_border">
        <p class="normal no_margin"><b>${totalJumlahPerwakilan1KKPerKota.toLocaleString(
          "id-ID"
        )}</b></p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin"><b>${totalJumlahPerwakilanPerKota.toLocaleString(
          "id-ID"
        )}</b></p>
      </td>
      <td class="visible_border">
        <p class="normal no_margin"><b>${totalJumlahPenggantiPerKota.toLocaleString(
          "id-ID"
        )}</b></p>
      </td>
      <!-- <td class="visible_border">
        <p class="normal no_margin"><b>${totalJumlahTerverifikasiPerKota.toLocaleString(
          "id-ID"
        )}</b></p>
      </td> -->
      <!-- <td class="visible_border">
        <p class="normal no_margin"><b>${persentaseDiserahkanPerKecamatan}%</b></p>
      </td> -->
    `;
  // jika tidak dikasih total tinggal beri komentar
  // tbody.appendChild(tr);

  const dateReport = new Date();
  const formattedDate = `${dateReport.getDate()} ${dateReport.toLocaleString(
    "id-ID",
    { month: "long" }
  )} ${dateReport.getFullYear()}`;
  // save menjadi gambar dengan memanggil screenshotTable
  const outputPath = path.join(
    outPath,
    `REKAP DOKUMEN_${nama_provinsi}_${nama_kabkota}_${formattedDate.toUpperCase()}.pdf`
  );

  savePdf(dom.serialize(), outputPath);
}

async function savePdf(html, outputPath) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  // screenshot table
  const table = await page.$(".document");
  const boundingBox = await table.boundingBox();
  // simpan sesuai ukuran class .document

  // await page.screenshot({
  //   path: outputPath,
  //   clip: {
  //     x: Math.floor(boundingBox.x),
  //     y: Math.floor(boundingBox.y),
  //     width: Math.ceil(boundingBox.width),
  //     height: Math.ceil(boundingBox.height),
  //   },
  // });

  // save pdf
  await page.pdf({
    path: outputPath,
    format: "A4",
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
