import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import puppeteer from "puppeteer";
import wilayahs from "./data/wilayah.json";
import { getTab } from "./utils.js";

const wilayah = wilayahs.filter(
  ({ nama_kabkota, nama_kecamatan, nama_kelurahan }) =>
    nama_kabkota === "KAB. PEMALANG"
);
const LEMBAR_PERWAKILAN_DIR =
  "/Users/agungfir/Documents/BULOG/LAMPIRAN SPTJM PENGGANTI PERWAKILAN";

let index = 0;
let indexHalaman = 0;
let jumlahHalaman = 0;

function downloadLembarPerwakilan() {
  if (index < wilayah.length) {
    indexHalaman = 0;
    jumlahHalaman = 0;
    const {
      nama_provinsi,
      nama_kabkota,
      nama_kecamatan,
      nama_kelurahan,
      kode_kelurahan,
    } = wilayah[index];
    const no_bast = `BAST-202507${kode_kelurahan.replaceAll(".", "")}`;
    const text = getTab(
      `${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}_${no_bast}`,
      8
    );
    process.stdout.write(
      `${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}_${no_bast}`
    );
    process.stdout.write(text);
    process.stdout.write(`${index + 1}/${wilayah.length}\n`);
    let html = readFileSync(join(__dirname, "template", "HEADER.html"), "utf8");

    if (nama_kabkota === "KAB. PEMALANG") {
      const PBP = JSON.parse(
        readFileSync(
          join(
            __dirname,
            "rekap_pbp",
            `${nama_provinsi}_${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}.json`
          )
        )
      );
      let pbpFilter = PBP.filter((pbp, i) => pbp.status_pbp === "perwakilan");
      // urutakan berdasarkan nama pbp dan no_pbp

      if (pbpFilter.length === 0) {
        index++;
        downloadLembarPerwakilan();
      } else {
        const tambahanPBPPerwakilan = 18 - (pbpFilter.length % 18);
        if (pbpFilter.length % 18 !== 0) {
          for (let i = 0; i < tambahanPBPPerwakilan; i++) {
            pbpFilter.push({
              NO_PERWAKILAN: "",
              no_urut_dtt: "",
              no_pbp: "",
              nama: "",
              nik: "",
              nama_pengganti: "",
              nik_pengganti: "",
              alamat_pbp: "",
              status_pbp: "",
              no_bast: "",
              nama_provinsi: "",
              nama_kabkota: "",
              nama_kecamatan: "",
              nama_kelurahan: "",
            });
          }
        }

        jumlahHalaman = Math.ceil(pbpFilter.length / 18);
        pbpFilter.forEach((pbp, index) => {
          if ((index + 1) % 18 === 1) {
            indexHalaman++;

            html += generateHeaderPerwakilan({
              nama_provinsi,
              nama_kabkota,
              nama_kecamatan,
              nama_kelurahan,
              no_bast,
              indexHalaman,
            });
          }
          html += generateTr({
            NO_PERWAKILAN: index + 1,
            ...pbp,
          });

          if ((index + 1) % 18 === 0) {
            html += "</table>";
          }
        });
        html += `</body></html>`;
        html = html.replace(
          /<title>.*<\/title>/,
          `<title>${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}_PERWAKILAN</title>`
        );
        writeFileSync("CONTOH.html", html);
        downloadPerwakilan(
          `${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}_PERWAKILAN`,
          html
        );
      }
    } else {
      index++;
      downloadLembarPerwakilan();
    }
  } else {
    console.log("Selesai...");
  }
}

function generateHeaderPerwakilan({
  nama_provinsi,
  nama_kabkota,
  nama_kecamatan,
  nama_kelurahan,
  no_bast,
  indexHalaman,
}) {
  return `<table width="100%" class="visible_border" style="break-before: page">
        <colgroup>
          <col width="42*" />
          <col width="87*" />
          <col width="87*" />
          <col width="41*" />
        </colgroup>
        <tbody>
          <tr class="visible_border">
            <td
              rowspan="4"
              width="20%"
              height="43"
              valign="top"
              class="centered visible_border"
            >
              <p class="normal centered">
                <br />
                <img
                src="http://127.0.0.1:5500/Logo-BULOG_colored.svg"
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
            <td colspan="2" width="60%" class="visible_border">
              <p class="heading"><b>LAMPIRAN BERITA ACARA PERWAKILAN</b></p>
              <p class="heading">
                <b>PENERIMA BANTUAN PANGAN BERAS TAHUN 2025</b>
              </p>
            </td>
            <td
              rowspan="4"
              width="20%"
              height="43"
              valign="top"
              class="centered visible_border"
            >
              <p class="normal centered">
                <br />
                <img src="https://quickchart.io/qr?text=${no_bast}&ecLevel=H&size=400&margin=0"
                style="
                    max-height: 100%;
                    max-width: 100%;
                    width: 96px;
                    height: 96px;
                  "/>
              </p>
              <p class="centered" style="font-size: 10px">
                <b>${no_bast}</b>
              </p>
            </td>
          </tr>
          <tr>
            <td class="visible_border">
              <p class="normal no_margin">PROVINSI: <b>${nama_provinsi}</b></p>
            </td>
            <td class="visible_border">
              <p class="normal no_margin">KECAMATAN: <b>${nama_kecamatan}</b></p>
            </td>
          </tr>
          <tr class="visible_border">
            <td class="visible_border">
              <p class="normal no_margin">KOTA/KAB: <b>${nama_kabkota}</b></p>
            </td>
            <td class="visible_border">
              <p class="normal no_margin">KELURAHAN/DESA: <b>${nama_kelurahan}</b></p>
            </td>
          </tr>
          <tr class="visible_border">
            <td class="visible_border">
              <p class="normal no_margin">ALOKASI BULAN: <b>Juni - Juli</b></p>
            </td>
            <td class="visible_border">
              <p class="normal no_margin">HALAMAN:<b> ${indexHalaman} / ${jumlahHalaman}</b></p>
            </td>
          </tr>
        </tbody>
      </table>
      <br />
      <table
        class="visible_border"
        width="100%"
        cellpadding="7"
        cellspacing="0"
      >
        <!-- <colgroup>
          <col width="3.25%" />
          <col width="8.75%" />
          <col width="12.50%" />
          <col width="12.50%" />
          <col width="12.50%" />
          <col width="12.50%" />
          <col width="12.50%" />
          <col width="12.50%" />
          <col width="12.50%" />
        </colgroup> -->
        <tbody>
          <tr class="visible_border" style="height: 24px">
            <td rowspan="2" class="visible_border">
              <p class="table_heading">No</p>
            </td>
            <td rowspan="2" class="visible_border" width="6%">
              <p class="table_heading">No Urut PBP</p>
            </td>
            <td colspan="2" class="visible_border">
              <p class="table_heading">Nama</p>
            </td>
            <td colspan="2" class="visible_border">
              <p class="table_heading">NIK</p>
            </td>
            <td colspan="2" class="visible_border">
              <p class="table_heading">Alamat</p>
            </td>
            <td rowspan="2" class="visible_border" width="12.50%">
              <p class="table_heading">Tanda Tangan Perwakilan PBP</p>
            </td>
          </tr>
          <tr class="visible_border" style="height: 24px">
            <td class="visible_border"><p class="table_heading">PBP</p></td>
            <td class="visible_border">
              <p class="table_heading">Yang Mewakili</p>
            </td>
            <td class="visible_border" width="12.50%"><p class="table_heading">PBP</p></td>
            <td class="visible_border" width="12.50%">
              <p class="table_heading">Yang Mewakili</p>
            </td>
            <td class="visible_border" width="12.50%"><p class="table_heading">PBP</p></td>
            <td class="visible_border" width="12.50%">
              <p class="table_heading">Yang Mewakili</p>
            </td>
          </tr>
      `;
}

function generateTr({
  nama_kelurahan,
  NO_PERWAKILAN,
  NO,
  nama,
  nama_pengganti,
  nik,
  nik_pengganti,
  alamat_pbp,
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
  return `
        <tr class="visible_border" style="height: 24px">
            <td class="visible_border">
                <p class="normal no_margin">${NO_PERWAKILAN}</p>
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
                <p class="normal no_margin">${nik}</p>
            </td>
            <td class="visible_border">
                <p class="normal no_margin">${nik_pengganti}</p>
            </td>
            <td class="visible_border">
                <p class="normal no_margin">${nama_kelurahan}</p>
            </td>
            <td class="visible_border">
                <p class="normal no_margin">${nama_kelurahan}</p>
            </td>
            <td class="visible_border"></td>
        </tr>
  `;
}

async function downloadPerwakilan(filename, html) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 120000 });
    await page.emulateMediaType("print");
    page.title = filename;
    await page.pdf({
      path: join(LEMBAR_PERWAKILAN_DIR, `${filename}.pdf`),
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
    downloadLembarPerwakilan();
  } catch (e) {
    console.log(e);
    downloadLembarPerwakilan();
  }
}
downloadLembarPerwakilan();
