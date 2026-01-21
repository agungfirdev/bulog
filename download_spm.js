const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { CookieJSON } = require("./utils");
const argv = process.argv.slice(2);

require("dotenv").config();
const spms = require("./data/spm_data.json")
  .sort((a, b) => {
    // provinsi
    if (a.provinsi < b.provinsi) return -1;
    if (a.provinsi > b.provinsi) return 1;
    // kabupaten
    if (a.kabupaten < b.kabupaten) return -1;
    if (a.kabupaten > b.kabupaten) return 1;
    // kecamatan
    if (a.kecamatan < b.kecamatan) return -1;
    if (a.kecamatan > b.kecamatan) return 1;
    // kelurahan
    if (a.kelurahan < b.kelurahan) return -1;
    if (a.kelurahan > b.kelurahan) return 1;
    // no_spm
    if (a.no_spm < b.no_spm) return -1;
    if (a.no_spm > b.no_spm) return 1;
    return 0;
  })
  // .sort((a, b) => {
  //   // createdAt descending
  //   const dateA = new Date(a.createdAt);
  //   const dateB = new Date(b.createdAt);
  //   return dateB - dateA;
  // })
  .filter(
    ({
      driver,
      kelurahan,
      kecamatan,
      komoditas_name,
      no_spm,
      createdAt,
      id_qty_pengiriman,
    }) =>
      (kecamatan === "Watukumpul" || kecamatan === "Bantarbolang") &&
      driver === "11001-RAHARJO",
  );

let index = 0;
const isHeadless = true;
const namaAdmin = "AGUNG FIRMANSYAH";
const namaAdminGudang = "HENDRIK";
const pathFolder = "/Users/agungfir/Documents/BULOG/BANPANG 2025/SPM & BAST";
const is_sorted = argv.includes("--sorted");

function getOutputPath(spm) {
  const { kelurahan, kecamatan, provinsi, kabupaten, no_spm, driver } = spm;

  const outputDriver = path.join(
    pathFolder,
    `${provinsi}_${kabupaten}_${kecamatan}_${kelurahan}_${no_spm}_${driver}.pdf`,
  );

  const outputSorted = path.join(
    pathFolder,
    `${
      index + 1
    }_${provinsi}_${kabupaten}_${kecamatan}_${kelurahan}_${no_spm}.pdf`,
  );
  return is_sorted ? outputSorted : outputDriver;
}

puppeteer.use(StealthPlugin());

async function getSPM() {
  if (spms[index] !== undefined) {
    // check file dtt sudah ada atau belum
    const { kelurahan, no_spm, driver } = spms[index];

    console.log(
      `→ ${index + 1}/${spms.length} ${kelurahan} ${no_spm} ${driver}`,
    );

    // jika file sudah ada, skip
    const outputPath = getOutputPath(spms[index]);
    if (fs.existsSync(outputPath)) {
      console.log(`⏩ ${kelurahan} ${no_spm}`);
      index++;
      return getSPM();
    }

    getSPMPdf(spms[index]);
  } else {
    console.log("Semua kelurahan sudah diproses.");
  }
}
async function getSPMPdf(spm) {
  const { no_spm, id_qty_pengiriman, kelurahan, driver, no_hp } = spm;

  let content = "";
  const browser = await puppeteer.launch({
    headless: isHeadless,
    timeout: 60000 * 10, // 10 minutes
    args: ["--start-maximized", "--allow-file-access-from-files"], // Start Chromium in maximized mode
  });
  try {
    const page = await browser.newPage();

    await page.setCookie(...CookieJSON);

    console.log(`🔄 ${kelurahan} ${no_spm} ${driver}`);

    await page.goto(
      `https://banpang.bulog.co.id/surat-perintah-muat/${id_qty_pengiriman}`,
      { waitUntil: "networkidle0", timeout: 60000 * 10 },
    );

    const tabPromise = new Promise((resolve, reject) => {
      const onTargetCreated = async (target) => {
        if (target.type() === "page") {
          const newPage = await target.page();
          newPage.setDefaultTimeout(60000 * 10);
          await newPage.bringToFront();
          content = await newPage.evaluate(
            () => document.documentElement.outerHTML,
          );

          // ganti title
          const outputPath = getOutputPath(spm);
          const title = path.basename(outputPath, ".pdf");
          // replace <title>...</title>
          content = content.replace(
            /<title>[\s\S]*?<\/title>/i,
            `<title>${title}</title>`,
          );

          // tambah style untuk selain class SO agar transparent
          const style = `<style>
          :not(.SO) {
            color: transparent;
            background-color: transparent;
            border-color: transparent;
          }
          table .visible_border {
                  border: 1px solid transparent !important;
        }

          img, svg {
            opacity: 0;
          }
          .SO {
            color: black;
          }
          </style>`;
          // tambahkan style sebelum </head>
          content = content.replace(/<\/head>/i, `${style}</head>`);

          // const match = content.match(/<b>(SO\/[^<]*)</); // SO
          const match = content.match(/<b>(SPM[^<]*)</); // SPM

          // const soValue = match ? match[1] : "SO/UNKNOWN";
          const spmValue = match ? match[1] : "SPM/UNKNOWN";
          // Jika ketemu, match[1] berisi "SO/9675/12/2025/11060"
          if (match) {
            console.log(match[1]); // Output: SO/9675/12/2025/11060
          } else {
            console.log("Tidak ditemukan");
          }

          // content = content.replaceAll("", "");
          // ganti sebagai contoh <b>SO/9675/12/2025/11060</b> dengan <b class="SO">SO/...</b>
          // content = content.replaceAll(
          //   /<b>SO\/\d{21}<\/b>/g,
          //   `<b class="SO">${soValue}</b>`,
          // );

          // ganti menjadi kosong dengan regex SPM20251133.27.06124224970076
          // content = content.replaceAll("11001-RAHARJO", "11001-DWI YOGI S");
          // content = content.replaceAll("087837897911", "0882005318186");
          // content = content.replaceAll("G 9627 JZ", "G 8615 JZ");
          content = content.replaceAll(
            `<b>${spmValue}/1-1</b>`,
            `<b class="SO">${spmValue}/1-1</b>`,
          );
          content = content.replaceAll(
            `<b>${spmValue}</b>`,
            `<b class="SO">${spmValue}</b>`,
          );

          // content = content.replaceAll("3980", "3080");
          // content = content.replaceAll("846", "532");

          // content = content.replaceAll(
          //   /(<b)(?![^>]*\bclass\s*=)([^>]*>)(\s*)(SO\/[^<]+)(\s*)(<\/b>)/gi,
          //   '$1 class="SO"$2$3$4$5$6'
          // );

          // SPM
          content = content.replaceAll(
            /(<b)(?![^>]*\bclass\s*=)([^>]*>)(\s*)(SPM\/[^<]+)(\s*)(<\/b>)/gi,
            '$1 class="SO"$2$3$4$5$6',
          );

          content = content.replace(
            "border: 1px solid rgb(0, 0, 0);",
            "border: 1px solid transparent;color: transparent;",
          );

          content = content.replaceAll(
            /\/uploads\/transporter\/JPL logo\.png/g,
            "file:///Users/agungfir/code/bulog/img/JPL%20logo.png",
          );
          content = content.replaceAll(
            /\/images\/logo\/Logo-BULOG_colored\.png/g,
            "file:///Users/agungfir/code/bulog/img/Logo-BULOG_colored_small.svg",
          );
          content = content.replaceAll(
            /\/images\/logo\/Logo-Banpang_colored\.png/g,
            "file:///Users/agungfir/code/bulog/img/Logo-Banpang_colored.png",
          );

          content = content.replaceAll(
            `<p class="normal">KOMPLEKS PERGUDANGAN KEDUNGKELOR</p></td><td class="visible_border text-center"><p class="normal"></p></td><td class="visible_border text-center"><p class="normal">${driver}</p><p class="normal">${no_hp}</p></td>`,
            `<p style="font-size: 9pt;">${namaAdminGudang}</p><p style="font-size: 9pt;">KOMPLEKS PERGUDANGAN KEDUNGKELOR</p></td><td class="visible_border text-center"><p style="font-size: 9pt;">${namaAdmin}</p></td><td class="visible_border text-center"><p style="font-size: 9pt;">${driver}</p><p style="font-size: 9pt;">${no_hp}</p></td>`,
          );

          content = content.replace(
            `<td class="visible_border text-center" width="33%"><p class="normal"><b>ADMIN GUDANG BULOG</b></p></td><td class="visible_border text-center" width="33%"><p class="normal"><b>ADMIN GUDANG TRANSPORTER</b></p></td><td class="visible_border text-center" width="33%"><p class="normal"><b>DRIVER</b></p></td>`,
            `<td class="visible_border text-center" width="33%"><p style="font-size: 9pt;"><b>ADMIN GUDANG BULOG</b></p></td><td class="visible_border text-center" width="33%"><p style="font-size: 9pt;"><b>ADMIN GUDANG TRANSPORTER</b></p></td><td class="visible_border text-center" width="33%"><p style="font-size: 9pt;"><b>DRIVER</b></p></td>`,
          );

          content = content.replace(
            `<td class="visible_border text-center"><p class="normal">${driver}</p><p class="normal">${no_hp}</p></td><td class="visible_border text-center"><p class="normal">(Nama Jelas &amp; TTD)</p></td><td class="visible_border text-center"><p class="normal">(Nama Jelas &amp; TTD)</p></td>`,
            `<td class="visible_border text-center"><p style="font-size: 9pt;">${driver}</p><p style="font-size: 9pt;">${no_hp}</p></td><td class="visible_border text-center"><p style="font-size: 9pt;">(Nama Jelas &amp; TTD)</p></td><td class="visible_border text-center"><p style="font-size: 9pt;">(Nama Jelas &amp; TTD)</p></td>`,
          );

          content = content.replace(
            `<p class="normal"><b>DRIVER</b></p></td><td class="visible_border text-center" width="33%"><p class="normal"><b>PETUGAS TRANSPORTER</b></p></td><td class="visible_border text-center" width="33%"><p class="normal"><b>SATGAS BANPANG / PERANGKAT DESA</b></p>`,
            `<p style="font-size: 9pt;"><b>DRIVER</b></p></td><td class="visible_border text-center" width="33%"><p style="font-size: 9pt;"><b>PETUGAS TRANSPORTER</b></p></td><td class="visible_border text-center" width="33%"><p style="font-size: 9pt;"><b>SATGAS BANPANG / PERANGKAT DESA</b></p>`,
          );
          // content = content.replaceAll("AB 8404 ME", "G 8469 WM");
          content = content.replace(
            /src=["']file:\/\/([^"']+)["']/gi,
            (match, filePath) => {
              // Ubah %20 dan escape karakter aneh
              filePath = decodeURIComponent(filePath);

              // Kalau path-nya relatif, coba resolve dari folder HTML
              let absolutePath;
              if (path.isAbsolute(filePath)) {
                absolutePath = filePath;
              } else {
                absolutePath = path.resolve(
                  path.dirname("/home/budi/project/test.html"),
                  filePath,
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
                console.warn("✗ File not found ", absolutePath);
                return match; // biarin broken
              }
            },
          );
          await browser.close();
          resolve();
        }
      };
      browser.on("targetcreated", onTargetCreated);
    });
    await page.click("button.bg-gray-500");

    await tabPromise;
    await browser.close();
    const outputPath = getOutputPath(spm);
    // hapus script javascript apapun
    content = content.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      "",
    );
    fs.writeFileSync("SPM_debug.html", content);
    await convertToPDF(content, outputPath);
  } catch (e) {
    await browser.close();
    index++;
    console.error("✗ Gagal ", e.message);
    getSPM();
  }
}

async function convertToPDF(html, filename) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      timeout: 60000 * 10,
      args: ["--start-maximized", "--allow-file-access-from-files"], // Start Chromium in maximized mode
    });
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "networkidle0", // Use domcontentloaded instead of networkidle0
      timeout: 60000 * 10, // 1 minute
    });
    await page.emulateMediaType("print");
    await page.pdf({
      path: filename,
      format: "A4",
      printBackground: true,
      timeout: 60000 * 10,
    });
    await browser.close();
    index++;
    getSPM();
  } catch (e) {
    console.error("✗ Gagal ", e.message);
    getSPM();
  }
}

(async () => await getSPM())();
