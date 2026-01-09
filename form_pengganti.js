import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import puppeteer from "puppeteer";
import { kelurahans } from "./utils.js";
import { getTab } from "./utils.js";
const outputRekap = "/Users/agungfir/Documents/BULOG/BANPANG 2025/REKAP PBP";

const LEMBAR_PENGGANTI_DIR =
  "/Users/agungfir/Documents/BULOG/BANPANG 2025/LEMBAR PENGGANTI";

let index = 0;
let indexHalaman = 0;
let jumlahHalaman = 0;

function downloadLembarPengganti() {
  if (index < kelurahans.length) {
    indexHalaman = 0;
    jumlahHalaman = 0;
    const {
      nama_provinsi,
      nama_kabkota,
      nama_kecamatan,
      nama_kelurahan,
      kode_kelurahan,
    } = kelurahans[index];
    const no_bast = `BAST-202511${kode_kelurahan.replaceAll(".", "")}`;
    const text = getTab(
      `${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}_${no_bast}`,
      8
    );
    process.stdout.write(
      `${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}_${no_bast}`
    );
    process.stdout.write(text);
    process.stdout.write(`${index + 1}/${kelurahans.length}\n`);
    let html = readFileSync(join(__dirname, "template", "HEADER.html"), "utf8");

    if (nama_kabkota === "KAB. PEMALANG") {
      const PBP = JSON.parse(
        readFileSync(
          join(
            outputRekap,
            `11_${nama_provinsi}_${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}.json`
          )
        )
      );
      let pbpFilter = PBP.filter((pbp, i) => pbp.status_pbp === "pengganti");

      if (pbpFilter.length === 0) {
        index++;
        downloadLembarPengganti();
      } else {
        const tambahanPBPPengganti = 18 - (pbpFilter.length % 18);
        if (pbpFilter.length % 18 !== 0) {
          for (let i = 0; i < tambahanPBPPengganti; i++) {
            pbpFilter.push({
              NO_PENGGANTI: "",
              no_urut_dtt: "",
              no_pbp: "",
              nama: "",
              nik: "",
              nama_pengganti: "",
              nik_pengganti: "",
              alamat_pbp: "",
              status_pbp: "",
              notes: "tidak ada",
              no_bast: "",
              nama_provinsi: "",
              nama_kabkota: "",
              nama_kecamatan: "",
              nama_kelurahan: "",
            });
          }
        }

        pbpFilter.forEach((pbp, index) => {
          if ((index + 1) % 18 === 1) {
            indexHalaman++;

            jumlahHalaman = Math.ceil(pbpFilter.length / 18);
            html += generateHeaderPengganti({
              nama_provinsi,
              nama_kabkota,
              nama_kecamatan,
              nama_kelurahan,
              no_bast,
              indexHalaman,
            });
          }
          html += generateTr({
            NO_PENGGANTI: index + 1,
            ...pbp,
          });

          if ((index + 1) % 18 === 0) {
            html += "</table>";
          }
        });
        html += `</body></html>`;
        // replace title string in html with regex
        html = html.replace(
          /<title>.*<\/title>/,
          `<title>${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}_PENGGANTI</title>`
        );
        writeFileSync("CONTOH.html", html);

        downloadPengganti(
          `${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}_PENGGANTI`,
          html
        );
      }
    } else {
      index++;
      downloadLembarPengganti();
    }
  } else {
    console.log("Selesai...");
  }
}

function generateHeaderPengganti({
  nama_provinsi,
  nama_kabkota,
  nama_kecamatan,
  nama_kelurahan,
  no_bast,
  indexHalaman,
}) {
  return `<table width="100%" style="break-before: page">
      <colgroup>
        <col width="42*" />
        <col width="87*" />
        <col width="87*" />
        <col width="41*" />
      </colgroup>
      <tbody>
        <tr>
          <td rowspan="4" width="20%" height="43" valign="top" class="centered">
            <p class="normal centered">
              <img
                src="http://127.0.0.1:5500/img/Logo-BULOG_colored_small.svg"
                alt="Bulog"
                style="
                  max-height: 100%;
                  max-width: 100%;
                  width: 175px;
                  height: 125px;
                  object-fit: contain;
                "
              />
            </p>
          </td>
          <td colspan="2" width="60%">
            <p class="heading">
              <b>LAMPIRAN BERITA ACARA SERAH TERIMA (BAST)</b>
            </p>
            <p class="heading">
              <b>PENERIMA BANTUAN PANGAN PENGGANTI TAHUN 2025</b>
            </p>
          </td>
          <td rowspan="4" width="20%" height="43" valign="top" class="centered">
            <p class="normal centered">
            <img src="https://quickchart.io/qr?text=${no_bast}&ecLevel=H&size=400&margin=0"
                style="
                    max-height: 100%;
                    max-width: 100%;
                    width: 96px;
                    height: 96px;
                  "/>  
            <br />
            </p>
            <p class="centered" style="font-size: 10px">
              <b>${no_bast}</b>
            </p>
          </td>
        </tr>
        <tr>
          <td class="no_border">
            <p class="normal no_margin">Provinsi: ${nama_provinsi}</p>
          </td>
          <td class="no_border">
            <p class="normal no_margin">Kecamatan: ${nama_kecamatan}</p>
          </td>
        </tr>
        <tr>
          <td class="no_border">
            <p class="normal no_margin">Kota/Kab: ${nama_kabkota}</p>
          </td>
          <td class="no_border">
            <p class="normal no_margin">Kelurahan/Desa: ${nama_kelurahan}</p>
          </td>
        </tr>
        <tr>
          <td class="no_border">
            <p class="normal no_margin">Alokasi Bulan: Juni - Juli</p>
          </td>
          <td class="no_border">
              <p class="normal no_margin">Halaman: ${indexHalaman} / ${jumlahHalaman}</p>
          </td>
        </tr>
      </tbody>
    </table>
    <br />
    <table class="visible_border" width="100%" cellpadding="7" cellspacing="0">
      <!-- <colgroup>
        <col width="3%" />
        <col width="8%" />
        <col width="20%" />
        <col width="20%" />
        <col width="10%" />
        <col width="20%" />
        <col width="10%" />
        <col width="9%" />
      </colgroup> -->
      <thead>
        <tr class="visible_border" style="vertical-align: top">
          <td rowspan="2" class="visible_border">
            <p class="table_heading">No.</p>
          </td>
          <td rowspan="2" class="visible_border" width="6%">
            <p class="table_heading">No. Urut PBP</p>
          </td>
          <td rowspan="2" class="visible_border">
            <p class="table_heading">Nama PBP Awal</p>
          </td>
          <td colspan="3" class="visible_border">
            <p class="table_heading">PBP Pengganti</p>
          </td>
          <td rowspan="2" class="visible_border">
            <p class="table_heading">Sebab Penggantian*</p>
          </td>
          <td rowspan="2" class="visible_border">
            <p class="table_heading">TTD PBP Pengganti</p>
          </td>
        </tr>
        <tr class="visible_border">
          <td class="visible_border">
            <p class="table_heading">Nama</p>
          </td>
          <td class="visible_border" width="12.5%">
            <p class="table_heading">NIK</p>
          </td>
          <td class="visible_border" width="10%">
            <p class="table_heading">Alamat</p>
          </td>
        </tr>
      </thead>
      `;
}

function generateTr({
  nama_kelurahan,
  NO_PENGGANTI,
  NO,
  nama,
  nama_pengganti,
  nik,
  nik_pengganti,
  alamat_pbp,
  notes,
  no_urut_dtt,
}) {
  const nama_camelcase = nama
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const nama_pengganti_camelcase = nama_pengganti
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  let alasan = "";
  if (notes === "tidak ditemukan alamatnya") {
    alasan = "Alamat Tidak Ditemukan";
  } else if (
    notes ===
    "tidak memenuhi syarat sebagai PBP (Sudah Mampu/ASN/TNI/POLRI/Perangkat Daerah)"
  ) {
    alasan = "tidak memenuhi syarat";
  } else if (
    notes === "PBP tidak mengambil dalam batas waktu paling lambat 5 hari kerja"
  ) {
    alasan = "Tidak Mengambil dalam 5 hari";
  } else if (notes === "Tidak ditemukan pada alamat terdata") {
    alasan = "Alamat tidak ditemukan";
  } else if (notes === "Dicatat lebih dari 1 kali") {
    alasan = "Data Ganda";
  } else if (notes === null) {
    alasan = "Berhalangan Hadir";
  } else if (notes.includes("Sudah Mampu/ASN/TNI/POLRI")) {
    alasan = "Tidak Memenuhi Syarat";
  } else if (notes === "") {
    alasan = "Tidak Memenuhi Syarat";
  } else if (notes === "tidak ada") {
    alasan = "";
  } else {
    alasan = notes;
  }

  const alasan_camelcase = alasan
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return `
        <tr class="visible_border" style="height: 28px">
            <td class="visible_border">
                <p class="normal no_margin">${NO_PENGGANTI}</p>
            </td>
            <td class="visible_border">
                <p class="normal no_margin">${no_urut_dtt}</p>
            </td>
            <td class="visible_border">
                <p class="normal no_margin">${nama_camelcase}</p>
            </td>
            <td class="visible_border">
                <p class="normal no_margin">${
                  nama_pengganti_camelcase === undefined
                    ? ""
                    : nama_pengganti_camelcase
                }</p>
            </td>
            <td class="visible_border">
                <p class="normal no_margin">${nik_pengganti}</p>
            </td>
            <td class="visible_border">
                <p class="normal no_margin">${nama_kelurahan}</p>
            </td>
            <td class="visible_border">
              <p class="normal no_margin">${alasan_camelcase}</p>
            </td>
            <td class="visible_border"></td>
        </tr>
  `;
}

async function downloadPengganti(filename, html) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 120000 });
    await page.emulateMediaType("print");
    page.title = filename;
    await page.pdf({
      path: join(LEMBAR_PENGGANTI_DIR, `${filename}.pdf`),
      // margin: {
      //   top: 28, // ~1 cm
      //   bottom: 28,
      //   left: 28,
      //   right: 28,
      // },
      landscape: true,
      format: "A4",
    });
    await browser.close();
    index++;
    downloadLembarPengganti();
  } catch (e) {
    console.log(e);
    downloadLembarPengganti();
  }
}
downloadLembarPengganti();
