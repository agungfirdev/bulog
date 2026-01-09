const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { delay, Cookie } = require("./utils");
const docouts = require("./data/realisasi_spm.json");
const spms = require("./data/spm_data.json");
const soData = require("./data/so.json");

let index = 0;

puppeteer.use(StealthPlugin());

function getSPM() {
  if (spms[index] !== undefined) {
    const { kelurahan, kecamatan, driver } = spms[index];

    const { no_spm, no_out } = spms[index];

    const docout = docouts.find((docout) => docout.no_spm === no_spm);
    // if (!docout) {
    //   console.error(`No SPM ${no_spm} tidak ditemukan di dokumen out.`);
    //   index++;
    //   getSPM();
    //   return;
    // }

    if (no_out !== "-" && !no_out.includes("SPM")) {
      console.log(`⏩ ${kecamatan}-${kelurahan} ${no_spm} ${driver}`);
      index++;
      getSPM();
      return;
    }

    if (docout && docout.no_out === spms[index].no_out) {
      console.log(`⏩ ${kecamatan}-${kelurahan} ${no_spm} ${driver}`);
      index++;
      getSPM();
      return;
    }

    if (docout === undefined) {
      getAsyncSPM(spms[index], "-");
    } else {
      getAsyncSPM(spms[index], docout.no_out);
    }
  } else {
    console.log("Semua kelurahan sudah diproses.");
  }
}

async function getAsyncSPM(spm, no_out = "") {
  const outs = no_out.split(", ").map((item) => item.trim());
  const soMatcher = soData.find(
    (so) =>
      so.kecamatan === spm.kecamatan && so.komoditas_name === spm.komoditas_name
  );
  // jika tidak ditemukan so maka lanjutkan
  if (!soMatcher) {
    console.error(`❌ SO ${spm.no_spm} NOT FOUND`);
    index++;
    getSPM();
    return;
  }
  if (spm.no_so === soMatcher.no_so && no_out !== outs.join(", ")) {
    console.log(`✔︎ SO ${spm.no_spm} HAVE BEEN INPUTTED`);
    index++;
    getSPM();
    return;
  }

  const { gudang, no_hp, driver } = spm;

  const body = JSON.stringify({
    updatedAt: new Date().toISOString(),
    no_so: spm.no_so,
    no_out: outs.length === 0 ? "-" : outs,
    driver,
    gudang,
    no_hp,
  });
  try {
    const res = await fetch(
      `https://banpang.bulog.co.id/api/spm/${spm.id_qty_pengiriman}`,
      {
        headers: {
          Cookie,
        },
        body,
        method: "PUT",
      }
    );
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    index++;
    console.log(`✔︎ ${spm.no_spm} ${no_out}`);
    getSPM();
  } catch (error) {
    console.error(`✗ ${spm.no_spm}:`, error);
  }
}

getSPM();
