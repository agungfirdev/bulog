import { join } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";
import puppeteer from "puppeteer";
import { getTab, kelurahans } from "./utils.js";
const outputRekap = "/Users/agungfir/Documents/BULOG/BANPANG 2025/REKAP PBP";
const LEMBAR_PENGGANTI_DIR =
  "/Users/agungfir/Documents/BULOG/BANPANG 2025/LAMPIRAN SPTJM";

let index = 0;
let indexHalaman = 0;
let jumlahHalaman = 0;

function downloadLembarSptjm() {
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
    let html = readFileSync(
      join(__dirname, "template", "HEADER_PORTRAIT.html"),
      "utf8"
    );

    if (nama_kabkota === "KAB. PEMALANG") {
      const PBP = JSON.parse(
        readFileSync(
          join(
            outputRekap,
            `11_${nama_provinsi}_${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}.json`
          )
        )
      );
      const pathPBPPekerjaan = join(
        __dirname,
        "rekap_pekerjaan_pengganti",
        `${nama_provinsi}_${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}.json`
      );
      if (!existsSync(pathPBPPekerjaan)) {
        console.log(
          `File pekerjaan pengganti tidak ditemukan: ${pathPBPPekerjaan}`
        );
        index++;
        downloadLembarSptjm();
        return;
      }
      const pekerjaanPBPPengganti = JSON.parse(readFileSync(pathPBPPekerjaan));
      let pbpFilter = PBP.filter(
        (pbp, i) => pbp.status_pbp === "pengganti"
      ).map((pbp) => {
        const pekerjaan = pekerjaanPBPPengganti.find(
          (p) => p["NIK PENERIMA"] === pbp.nik_pengganti
        );
        return {
          ...pbp,
          pekerjaan: pekerjaan ? pekerjaan.PEKERJAAN : "",
        };
      });

      if (pbpFilter.length === 0) {
        index++;
        downloadLembarSptjm();
      } else {
        const tambahanPBPPengganti = 30 - (pbpFilter.length % 30);
        if (pbpFilter.length % 30 !== 0) {
          for (let i = 0; i < tambahanPBPPengganti; i++) {
            pbpFilter.push({
              NO_PENGGANTI: "",
              NO: "",
              no_pbp: "",
              nama: "",
              nik: "",
              nama_pengganti: "",
              nik_pengganti: "",
              alamat_pbp: "",
              status_pbp: "",
              notes: "",
              no_bast: "",
              nama_provinsi: "",
              nama_kabkota: "",
              nama_kecamatan: "",
              nama_kelurahan: "",
              pekerjaan: "",
            });
          }
        }

        pbpFilter.forEach((pbp, index) => {
          if ((index + 1) % 30 === 1) {
            indexHalaman++;

            jumlahHalaman = Math.ceil(pbpFilter.length / 30);
            html += generateHeaderSptjm({
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

          if ((index + 1) % 30 === 0) {
            html += "</table>";
          }
        });
        html += `</body></html>`;
        // replace title string in html with regex
        html = html.replace(
          /<title>.*<\/title>/,
          `<title>${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}_SPTJM</title>`
        );
        writeFileSync("CONTOH.html", html);
        downloadSptjm(
          `${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}_SPTJM`,
          html
        );
      }
    } else {
      index++;
      downloadLembarSptjm();
    }
  } else {
    console.log("Selesai...");
  }
}

function generateHeaderSptjm({
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
              <img
                src="http://127.0.0.1:5500/img/Logo-BULOG_colored.svg"
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
            <p class="heading">
              <b>LAMPIRAN SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK</b>
            </p>
            <p class="heading"><b>PENGGANTIAN PBP BERAS TAHUN 2025</b></p>
          </td>
          <td
            rowspan="4"
            width="20%"
            height="43"
            valign="top"
            class="centered visible_border"
          >
            <p class="normal centered">
            <img src="https://quickchart.io/qr?text=${no_bast}&ecLevel=H&size=400&margin=0"
                style="
                    max-height: 100%;
                    max-width: 100%;
                    width: 96px;
                    height: 96px;
                  "/>  
            <br />
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
            <p class="normal no_margin">HALAMAN: <b>${indexHalaman}/${jumlahHalaman}</b></p>
          </td>
        </tr>
      </tbody>
    </table>
    <br />
    <table class="visible_border" width="100%" cellpadding="7" cellspacing="0">
      <!-- <colgroup>
        <col width="3.36%" />
        <col width="7.75%" />
        <col width="11.11%" />
        <col width="11.11%" />
        <col width="11.11%" />
        <col width="11.11%" />
        <col width="11.11%" />
        <col width="11.11%" />
      </colgroup> -->
      <tbody>
        <tr class="visible_border" style="height: 24px">
          <td class="visible_border"><p class="table_heading">No</p></td>
          <td class="visible_border">
            <p class="table_heading">Nama PBP Awal</p>
          </td>
          <td class="visible_border"><p class="table_heading">Alamat</p></td>
          <td class="visible_border"><p class="table_heading">NIK</p></td>
          <td class="visible_border">
            <p class="table_heading">Nama PBP Pengganti</p>
          </td>
          <td class="visible_border"><p class="table_heading">Alamat</p></td>
          <td class="visible_border"><p class="table_heading">NIK</p></td>
          <td class="visible_border"><p class="table_heading">Pekerjaan</p></td>
        </tr>
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
  pekerjaan,
}) {
  let nama_camelcase = nama
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const namaWords = nama_camelcase.split(" ");
  if (namaWords.length > 2) {
    nama_camelcase =
      namaWords[0] +
      " " +
      namaWords
        .slice(1)
        .map((word) => word.charAt(0).toUpperCase() + ".")
        .join(" ");
  }
  let nama_pengganti_camelcase = nama_pengganti
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // jika nama_pengganti_camelcase lebih dari 1 kata, maka disingkat saja di belakang dengan inisial yang tersisa
  const namaPenggantiWords = nama_pengganti_camelcase.split(" ");
  if (namaPenggantiWords.length > 2) {
    nama_pengganti_camelcase =
      namaPenggantiWords[0] +
      " " +
      namaPenggantiWords
        .slice(1)
        .map((word) => word.charAt(0).toUpperCase() + ".")
        .join(" ");
  }

  let pekerjaan_camelcase = pekerjaan
    ? pekerjaan
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

  if (
    pekerjaan_camelcase === "Irt" ||
    pekerjaan_camelcase === "Mrt" ||
    pekerjaan_camelcase === "Phl" ||
    pekerjaan_camelcase === "Bhl"
  ) {
    pekerjaan_camelcase = pekerjaan_camelcase.toUpperCase();
  }

  pekerjaan_camelcase =
    pekerjaan_camelcase === "Karyawan Swasta"
      ? "Karyawan"
      : pekerjaan_camelcase;

  return `
        <tr class="visible_border" style="height: 24px">
            <td class="visible_border">
                <p class="normal no_margin">${NO_PENGGANTI}</p>
            </td>
            <td class="visible_border">
                <p class="normal no_margin">${nama_camelcase}</p>
            </td>
            <td class="visible_border">
                <p class="normal no_margin">${nama_kelurahan}</p>
            </td>
            <td class="visible_border">
                <p class="normal no_margin">${nik}</p>
            </td>
            <td class="visible_border">
                <p class="normal no_margin">${nama_pengganti_camelcase}</p>
            </td>
            <td class="visible_border">
              <p class="normal no_margin">${nama_kelurahan}</p>
            </td>
            <td class="visible_border">
              <p class="normal no_margin">${nik_pengganti}</p>
            </td>
            <td class="visible_border">
              <p class="normal no_margin">${
                pekerjaan ? pekerjaan_camelcase : ""
              }</p>
            </td>
        </tr>
  `;
}

async function downloadSptjm(filename, html) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 120000 });
    await page.emulateMediaType("print");
    page.title = filename;
    await page.pdf({
      path: join(LEMBAR_PENGGANTI_DIR, `${filename}.pdf`),
      format: "A4",
    });
    await browser.close();
    index++;
    downloadLembarSptjm();
  } catch (e) {
    console.log(e);
    downloadLembarSptjm();
  }
}
downloadLembarSptjm();
