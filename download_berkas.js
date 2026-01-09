const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const { kelurahans, CookieJSON, naturalCompareAZ } = require("./utils");
const { argv } = require("process");
const { PDFDocument, degrees } = require("pdf-lib");
require("dotenv").config();
const pathFolder = "/Users/agungfir/Documents/BULOG/BANPANG 2025/BERKAS DESA";

const isHeadless = true;
const isPrint = argv[3] === "print" ? true : false;

let index = 0;
const kode_alokasi = 11;
const alokasi_tahun = "2025";
let kodeDokumen = argv[2] ? parseInt(argv[2], 10) : 1;
const selectors = {
  1: "#react-aria-\\:R2cdb79uukva\\: .z-0",
  2: "#react-aria-\\:R2bdb79uukva\\: .z-0",
  3: "#react-aria-\\:R2adb79uukva\\: .z-0",
  4: "#react-aria-\\:R29db79uukva\\: .z-0",
};
let selector = selectors[kodeDokumen] || selectors[1];

let documentName = getDocumentName(kodeDokumen);

function getDocumentName(code) {
  switch (code) {
    case 1:
      return "SPTJM";
    case 2:
      return "Pengganti";
    case 3:
      return "Perwakilan";
    case 4:
      return "DTT";
    default:
      return "Dokumen Tidak Dikenal";
  }
}

function getOutputPath(kelurahan) {
  const outputPath = path.join(
    pathFolder,
    `${kelurahan.nama_provinsi}_${kelurahan.nama_kabkota}_${kelurahan.nama_kecamatan}_${kelurahan.nama_kelurahan}_${documentName}.pdf`
  );
  return outputPath;
}

function getDocument() {
  if (kelurahans[index] !== undefined) {
    const kelurahan = kelurahans[index];
    const { nama_provinsi, nama_kabkota, nama_kecamatan, nama_kelurahan } =
      kelurahan;

    const outputPath = getOutputPath(kelurahan);
    if (fs.existsSync(outputPath)) {
      console.log(`✓ ${documentName} ${nama_kelurahan}`);
      index++;
      getDocument();
    } else {
      getDocumentPdf(kelurahan);
    }
  } else {
    console.log("Semua kelurahan sudah diproses.");
  }
}

async function getDocumentPdf(kelurahan) {
  let content = "";
  const browser = await puppeteer.launch({
    headless: isHeadless,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // WAJIB di Mac!
    defaultViewport: null,
    args: [
      `--app=`,
      "--no-sandbox",
      // "--disable-setuid-sandbox",
      "--start-maximized",
      // "--disable-web-security",
      // "--allow-running-insecure-content",
      // "--disable-features=IsolateOrigins,site-per-process",
      // "--no-first-run",
      // "--no-default-browser-check",
      // "--disable-infobars",
    ],
    ignoreDefaultArgs: ["--enable-automation"],
  });

  try {
    const pages = await browser.pages();
    const page = pages[0];
    await page.setCookie(...CookieJSON);

    const { kode_kabkota, kode_kecamatan, kode_kelurahan, nama_kelurahan } =
      kelurahan;
    console.log(`🔄 ${documentName} - ${nama_kelurahan}`);

    await page.goto(
      `https://banpang.bulog.co.id/file-upload?alokasi_bulan=${kode_alokasi}&alokasi_tahun=${alokasi_tahun}&kode_provinsi=33&kode_kabupaten=${kode_kabkota}&kode_kecamatan=${kode_kecamatan}&kelurahan=${kode_kelurahan}`,
      { waitUntil: "networkidle0", timeout: 600000 }
    );

    await page.click("button.z-0:nth-child(7)");
    await page.waitForResponse(
      (r) => r.url().includes("/api/file-upload/filters") && r.status() === 200
    );
    await page.waitForSelector("div:nth-child(2) > h2", { timeout: 30000 });

    const tabPromise = new Promise((resolve, reject) => {
      const onTargetCreated = async (target) => {
        if (target.type() === "page") {
          const newPage = await target.page();
          resolve(newPage);
        }
      };
      browser.on("targetcreated", onTargetCreated);
    });

    await page.click(selector);

    await page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        return el && el.innerText !== "Loading";
      },
      { polling: "mutation", timeout: 60000 },
      selector
    );

    console.log(`→ Membuka tab dokumen ${documentName} - ${nama_kelurahan}`);

    // Pindah ke tab baru
    const newPage = await tabPromise;
    await newPage.bringToFront();
    content = await newPage.evaluate(() => document.documentElement.outerHTML);
    if (kodeDokumen === 2) {
      content = content.replace("</p><br>", "</p>");
    }

    content = content.replaceAll(
      /\/uploads\/transporter\/JPL logo\.png/g,
      "file:///Users/agungfir/code/bulog/img/JPL%20logo.png"
    );

    content = content.replaceAll(
      /\/images\/logo\/Logo-BULOG_colored\.svg/g,
      "file:///Users/agungfir/code/bulog/img/Logo-BULOG_colored_small.svg"
    );

    const sizeColumn = `
    <colgroup>
      <col width="3.25%">
      <col width="8.75%">
      <col width="12.50%">
      <col width="12.50%">
      <col width="12.50%">
      <col width="12.50%">
      <col width="12.50%">
      <col width="12.50%">
      <col width="12.50%">
    </colgroup>
    `;
    const sizeColumn2 = `
    <colgroup>
      <col width="3.25%">
      <col width="5%">
      <col width="14%">
      <col width="14%">
      <col width="16%">
      <col width="16%">
      <col width="10%">
      <col width="10%">
      <col width="10%">
    </colgroup>
    `;
    const rawFirst =
      '<colgroup><col width="3.25%"><col width="8.75%"><col width="12.50%"><col width="12.50%"><col width="12.50%"><col width="12.50%"><col width="12.50%"><col width="12.50%"><col width="12.50%"></colgroup>';
    content = content
      .replace(rawFirst, sizeColumn)
      .replace(rawFirst, sizeColumn2);

    content = content.replaceAll(
      'style="height: 24px;"',
      'style="height: 26px;"'
    );
    content = content.replace(
      /src=["']file:\/\/([^"']+)["']/gi,
      (match, filePath) => {
        filePath = decodeURIComponent(filePath);

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
      }
    );

    // fs.writeFileSync(outputPath, content);

    // await newPage.close();
    // await tabPromise;
    await browser.close();
    const outputPath = getOutputPath(kelurahan);
    fsp.writeFile("PERWAKILAN.html", content);
    await convertToPDF(content, outputPath);
  } catch (error) {
    console.error(
      `✗ Gagal ${documentName} ${kelurahan.nama_kelurahan}:`,
      error.message
    );
    await browser.close().catch(() => {});
    getDocument();
  }
}

async function convertToPDF(html, filename) {
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 60000 * 10,
  });
  try {
    const page = await browser.newPage();

    const htmlSize = Buffer.byteLength(html, "utf8");
    if (htmlSize > 5 * 1024 * 1024) {
      console.warn(
        `⚠︎ ${kelurahans[index].nama_kelurahan}: ${htmlSize / 1024} KB`
      );
    }

    await page.setContent(html, {
      waitUntil: "networkidle0", // Use domcontentloaded instead of networkidle0
      timeout: 60000 * 10, // 1 minute
    });

    await page.emulateMediaType("print");

    //rotate pages with pdf-lib (90 degrees clockwise example)
    let pdfBuffer;
    if (kodeDokumen === 2 || kodeDokumen === 3) {
      pdfBuffer = await page.pdf({
        path: filename,
        format: "A4",
        printBackground: false,
        timeout: 60000 * 10,
      });
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      pages.forEach((p) => p.setRotation(degrees(90)));

      const rotatedBytes = await pdfDoc.save();

      // Ensure directory exists and write file before continuing
      await fsp.mkdir(path.dirname(filename), { recursive: true });
      await fsp.writeFile(filename, rotatedBytes);
      await browser.close();
    } else {
      await page.pdf({
        path: filename,
        format: "A4",
        printBackground: false, // Ensure backgrounds are included
        timeout: 60000 * 10, // 1 minute
      });
      await browser.close();
    }
    index++;
    getDocument();
  } catch (e) {
    await browser.close();
    console.error(`✗ Error converting to PDF: ${path.basename(filename)}`, e);
    getDocument();
  }
}

getDocument();
