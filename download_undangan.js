const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const path = require("path");
const { kelurahans, titleCaseNormalize, CookieJSON } = require("./utils");
const QRCode = require("qrcode");
require("dotenv").config();

let index = 0;
const kode_alokasi = 11;
const alokasi_tahun = "2025";
const hariCetak = "Kamis";
const tanggal = "11 Desember 2025";
const hari_serah = "Jum'at";
const tanggal_serah = "12 Desember 2025";
const jam_serah = "08:00";
const jam_serah_selesai = "17:00";
const tempat_serah = "KANTOR KELURAHAN/DESA";
const pathFolder = "/Users/agungfir/Documents/BULOG/BANPANG 2025/BERKAS DESA";

puppeteer.use(StealthPlugin());

function getOutputPath(kelurahan) {
  const outputPath = path.join(
    pathFolder,
    `${kelurahan.nama_provinsi}_${kelurahan.nama_kabkota}_${kelurahan.nama_kecamatan}_${kelurahan.nama_kelurahan}_UNDANGAN.pdf`
  );
  return outputPath;
}

function getDocument() {
  if (kelurahans[index] !== undefined) {
    const kelurahan = kelurahans[index];
    const { nama_kelurahan } = kelurahan;

    const outputPath = getOutputPath(kelurahan);
    if (fs.existsSync(outputPath)) {
      console.log(`✓ Undangan ${nama_kelurahan}`);
      index++;
      getDocument();
    } else {
      console.log(`☒ Undangan ${nama_kelurahan}`);
      getDocumentPdf(kelurahans[index]);
    }
  } else {
    console.log("Semua kelurahan sudah diproses.");
  }
}

async function getDocumentPdf(kelurahan) {
  const { kode_kabkota, kode_kecamatan, nama_kelurahan, kode_kelurahan } =
    kelurahan;
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 60000 * 10, // 10 minutes
    args: ["--start-maximized"], // Start Chromium in maximized mode
  });
  try {
    const page = await browser.newPage();

    await page.setCookie(...CookieJSON);

    await page.goto(
      `https://banpang.bulog.co.id/undangan?alokasi_bulan=${kode_alokasi}&alokasi_tahun=${alokasi_tahun}&kode_provinsi=33&kode_kabupaten=${kode_kabkota}&kode_kecamatan=${kode_kecamatan}&kelurahan=${kode_kelurahan}`,
      { waitUntil: "networkidle0", timeout: 60000 * 10 }
    );

    await page.click("button.bg-primary");

    // get value from html page with selector input#react-aria-\:R27f9uukva\:
    const value = await page.$eval(
      "input#react-aria-\\:R27f9uukva\\:",
      (el) => el.value
    );

    const res = await page.waitForResponse((response) => {
      return (
        response.url().includes("/api/undangan/filter") &&
        response.status() === 200 &&
        response.request().method() === "POST"
      );
    });

    const responseJSON = await res.json();
    const data = {
      ...responseJSON,
      results: {
        ...responseJSON.results,
        pbp: responseJSON.results.pbp.map((item, index) => ({
          ...item,
          no_urut: index + 1,
        })),
      },
    };

    await browser.close();
    const outputPath = getOutputPath(kelurahan);
    const content = await dataToHTML(data, kelurahan, value);
    const contentUpdated = content.replace(
      "<title></title>",
      `<title>UNDANGAN - ${nama_kelurahan}</title>`
    );

    // fs.writeFileSync("CONTOH.html", contentUpdated);
    await convertToPDF(contentUpdated, outputPath);
  } catch (error) {
    await browser.close();
    console.error(`✗ Error proses ${nama_kelurahan}:`, error);
    getDocument();
  }
}

async function dataToHTML(data, kelurahan, nomor_undangan) {
  // sort berdasarkan rt lalu rw tapi kalau rt rw ada yang bukan angka maka taruh di paling bawah dan 0 maka taruh di bawah
  const sortedPbp = data.results.pbp.sort((a, b) => {
    const rtA =
      isNaN(parseInt(a.rt)) || parseInt(a.rt) === 0 ? Infinity : parseInt(a.rt);
    const rtB =
      isNaN(parseInt(b.rt)) || parseInt(b.rt) === 0 ? Infinity : parseInt(b.rt);
    if (rtA !== rtB) return rtA - rtB;
    const rwA =
      isNaN(parseInt(a.rw)) || parseInt(a.rw) === 0 ? Infinity : parseInt(a.rw);
    const rwB =
      isNaN(parseInt(b.rw)) || parseInt(b.rw) === 0 ? Infinity : parseInt(b.rw);
    return rwA - rwB;
  });
  // const sortedPbp = data.results.pbp;
  let html = fs.readFileSync(
    path.join(__dirname, "template", "HEADER_UNDANGAN.html")
  );

  for (const [index, pbp] of sortedPbp.entries()) {
    const { no_urut, no_pbp, nama, nik, rt, rw } = pbp;
    const { nama_provinsi, nama_kabkota, nama_kecamatan, nama_kelurahan } =
      kelurahan;
    const qrCodeObj = {
      no_pbp,
      no_bast: data.results.bast.no_bast,
      nik,
      nama,
    };
    const qrCodeSVG = await QRCode.toString(JSON.stringify(qrCodeObj), {
      type: "svg",
      width: 125, // optional — library scales modules to this width
      margin: 0, // optional — white space around QR code
    });

    // jika setiap memasuki penambahan item pertama dari 4 item maka tambahkan string pembuka grid lalu tutup ketika item sudah 4
    if (index % 4 === 0) {
      html += `
            <div style="break-after: page; padding: 0.12in">
                <div
                    style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 1fr 1fr;
                    height: 100%;
                    gap: 4px;
                    box-sizing: border-box;
                    max-height: calc(-28.8px + 100vh);
                    "
                >
            `;
    }
    // tambahkan item pbp
    html += `
        <div
          style="
            border: 1px dashed rgb(204, 204, 204);
            margin: 1px;
            padding: 5px;
            font-size: 0.72em;
            height: calc(100% - 7px);
            overflow: hidden;
          "
        >
          <table width="100%" style="margin-bottom: 3px">
            <colgroup>
              <col width="20%" />
              <col width="60%" />
              <col width="20%" />
            </colgroup>
            <tbody>
              <tr style="vertical-align: top">
                <td width="20%"></td>
                <td width="60%" style="text-align: center">
                  <p
                    class="centered heading"
                    style="font-size: 12px; margin: 1px 0px"
                  >
                    <b>UNDANGAN PENERIMA</b><br /><b
                      >BANTUAN PANGAN TAHUN 2025</b
                    >
                  </p>
                </td>
                <td width="20%" style="text-align: center"></td>
              </tr>
              <tr style="vertical-align: top">
                <td colspan="3" style="text-align: center">
                  <table width="100%" class="no_border" style="font-size: 9px">
                    <tbody>
                      <tr style="vertical-align: top">
                        <td width="25%">Provinsi</td>
                        <td width="25%">${nama_provinsi}</td>
                        <td width="25%">Kabupaten/Kota</td>
                        <td width="25%">${nama_kabkota}</td>
                      </tr>
                      <tr style="vertical-align: top">
                        <td width="25%">Kecamatan</td>
                        <td width="25%">${nama_kecamatan}</td>
                        <td width="25%">Kelurahan/Desa</td>
                        <td width="25%">${nama_kelurahan}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          <hr style="margin: 1px 0px; border-width: 0.5px" />
          <p style="text-align: right; margin: 4px 0px; font-size: 10px">
            ${titleCaseNormalize(nama_kabkota)}, ${hariCetak}, ${tanggal}
          </p>
          <div
            style="
              display: flex;
              justify-content: space-between;
              margin: 1px 0px;
            "
          >
            <div style="width: 45%">
              <table
                width="100%"
                class="no_border"
                cellpadding="0"
                cellspacing="0"
              >
                <tbody>
                  <tr style="vertical-align: top">
                    <td width="30%">
                      <p style="margin: 0px; font-size: 10px">Nomor</p>
                    </td>
                    <td width="5%">
                      <p style="margin: 0px; font-size: 10px">:</p>
                    </td>
                    <td>
                      <p style="margin: 0px; font-size: 10px">
                        ${nomor_undangan}
                      </p>
                    </td>
                  </tr>
                  <tr style="vertical-align: top">
                    <td><p style="margin: 0px; font-size: 10px">Perihal</p></td>
                    <td><p style="margin: 0px; font-size: 10px">:</p></td>
                    <td>
                      <p style="margin: 0px; font-size: 10px">
                        <b>UNDANGAN</b>
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style="width: 55%">
              <p style="margin: 0px; font-size: 10px">Kepada Yth :</p>
              <p style="margin: 0px; font-size: 10px"><b>${nama}</b></p>
              <p style="margin: 0px; font-size: 9px"><b>${nik.replace(
                /^.{6}/,
                "*".repeat(6)
              )}</b></p>
              <p style="margin: 0px; font-size: 9px">${nama_kelurahan.toUpperCase()}</p>
              <p style="margin: 0px; font-size: 9px">RT ${rt} / RW ${rw}</p>
            </div>
          </div>
          <p style="margin: 1px 0px; font-size: 10px">
            Mengharapkan kehadiran Bapak/Ibu/Saudara besok pada :
          </p>
          <table
            width="100%"
            class="no_border"
            cellpadding="0"
            cellspacing="0"
            style="font-size: 9px; line-height: 0.2"
          >
            <tbody>
              <tr style="vertical-align: top">
                <td width="20%"><p style="margin: 0px">Hari/Tanggal</p></td>
                <td width="2%"><p style="margin: 0px">:</p></td>
                <td>
                  <p style="margin: 0px"><b>${hari_serah}, ${tanggal_serah}</b></p>
                </td>
              </tr>
              <tr style="vertical-align: top">
                <td><p style="margin: 0px">Jam</p></td>
                <td><p style="margin: 0px">:</p></td>
                <td>
                  <p style="margin: 0px">
                    <b>${jam_serah} s.d ${jam_serah_selesai} Waktu Setempat</b>
                  </p>
                </td>
              </tr>
              <tr style="vertical-align: top">
                <td><p style="margin: 0px">Tempat</p></td>
                <td><p style="margin: 0px">:</p></td>
                <td>
                  <p style="margin: 0px"><b>${tempat_serah}</b></p>
                </td>
              </tr>
              <tr style="vertical-align: top">
                <td><p style="margin: 0px">Keperluan</p></td>
                <td><p style="margin: 0px">:</p></td>
                <td>
                  <p style="margin: 0px">
                    Mengambil Bantuan Pangan alokasi bulan Oktober - November
                    2025 sebanyak <b>20 Kg Beras</b> dan
                    <b>4 liter Minyak Goreng</b>
                  </p>
                </td>
              </tr>
              <tr style="vertical-align: top">
                <td><p style="margin: 0px">Persyaratan</p></td>
                <td><p style="margin: 0px">:</p></td>
                <td>
                  <p style="margin: 0px; line-height: 1">
                    1. Membawa undangan ini
                  </p>
                  <p style="margin: 0px; line-height: 1">
                    2. Jika diambil sendiri: Membawa KTP
                  </p>
                  <p style="margin: 0px; line-height: 1">
                    3. Jika diwakilkan dalam 1 KK: membawa KTP orang yang
                    mewakili, Fotocopy KTP orang yang diwakili, dan KK
                  </p>
                  <p style="margin: 0px; line-height: 1">
                    4. Jika diwakilkan diluar KK: membawa KTP orang yang
                    mewakili dan fotocopy KTP orang yang diwakili
                  </p>
                  <p style="margin: 0px; line-height: 1">
                    Harap diambil tepat pada waktunya. Jika setelah 5 (lima)
                    hari tidak diambil tanpa keterangan, akan dilakukan
                    penggantian PBP
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          <p style="margin: 1px 0px; font-size: 9px">
            Demikian atas kehadirannya disampaikan terima kasih
          </p>
          <br />
          <div style="margin-top: 2px; width: 100%">
            <table width="100%" class="no_border">
              <tbody>
                <tr>
                  <td width="60%" rowspan="2" style="text-align: center">
                    ${qrCodeSVG}
                    <p
                      class="centered"
                      style="font-size: 10px; margin: 2px 0px"
                    >
                      ${no_pbp}
                    </p>
                  </td>
                  <td width="40%" style="text-align: center; font-size: 9px">
                    <p style="margin: 0px">
                      Hormat Kami,<br />Perum BULOG<br /><img
                        src="/images/logo/Logo-BULOG_colored.svg"
                        alt="Bulog"
                        style="
                          max-height: 100%;
                          max-width: 100%;
                          width: 40px;
                          height: 20px;
                          object-fit: contain;
                        "
                      />
                    </p>
                    <br /><br /><br />
                    <p style="font-size: 10px; margin: 2px 0px">
                      <b>No. Urut</b>
                    </p>
                    <p style="font-size: 50px; margin: 0px"><b>${no_urut}</b></p>
                  </td>
                </tr>
                <tr>
                  <td width="40%" style="text-align: center; font-size: 9px">
                    <p style="margin: 0px"></p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        `;
    // jika sudah 4 item atau item terakhir maka tutup grid dan div pembungkus halaman
    if (index % 4 === 3 || index === data.results.pbp.length - 1) {
      html += `
                </div>
            </div>
        `;
    }
  }

  html += "</body></html>";

  html = html.replaceAll(
    /\/images\/logo\/Logo-BULOG_colored\.svg/g,
    "file:///Users/agungfir/code/bulog/img/Logo-BULOG_colored_small.svg"
  );

  html = html.replace(/src=["']file:\/\/([^"']+)["']/gi, (match, filePath) => {
    // Ubah %20 dan escape karakter aneh
    filePath = decodeURIComponent(filePath);

    // Kalau path-nya relatif, coba resolve dari folder HTML
    let absolutePath;
    if (path.isAbsolute(filePath)) {
      absolutePath = filePath;
    } else {
      absolutePath = path.resolve(
        path.dirname("/home/budi/project/test.html"),
        filePath
      );
    }

    if (fs.existsSync(absolutePath)) {
      const ext = path.extname(absolutePath).toLowerCase();
      const mime =
        {
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".gif": "image/gif",
          ".webp": "image/webp",
          ".svg": "image/svg+xml",
        }[ext] || "application/octet-stream";

      const base64 = fs.readFileSync(absolutePath, "base64");
      return `src="data:${mime};base64,${base64}"`;
    } else {
      console.warn("File tidak ditemukan:", absolutePath);
      return match; // biarin broken
    }
  });

  return html;
}

async function convertToPDF(html, filename) {
  const { nama_kecamatan, nama_kelurahan } = kelurahans[index];
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 60000 * 10,
  });
  try {
    const page = await browser.newPage();

    const htmlSize = Buffer.byteLength(html, "utf8");
    if (htmlSize > 5 * 1024 * 1024) {
      console.warn(`⚠︎ ${nama_kelurahan}: ${htmlSize / 1024} KB`);
    }

    await page.setContent(html, {
      waitUntil: "networkidle0", // Use domcontentloaded instead of networkidle0
      timeout: 60000 * 10, // 1 minute
    });

    await page.emulateMediaType("print");
    await page.pdf({
      path: filename,
      format: "A4",
      printBackground: false, // Ensure backgrounds are included
      timeout: 60000 * 10, // 1 minute
    });
    await browser.close();
    console.log(`✓ Sukses membuat PDF: ${nama_kelurahan}`);
    index++;
    getDocument();
  } catch (e) {
    await browser.close();
    console.error(`✗ Error : ${nama_kelurahan}:`, e);
    getDocument();
  }
}

getDocument();
