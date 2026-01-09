import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import puppeteer from "puppeteer";
import wilayahs from "./data/wilayah.json";
import { getTab } from "./utils.js";

const wilayah = wilayahs.filter((w) => w.nama_kabkota === "KAB. PEMALANG");

const LEMBAR_PENGGANTI_DIR =
  "/Users/agungfir/Documents/BULOG/LAMPIRAN SPTJM PENGGANTI PERWAKILAN";

let index = 0;
let indexHalaman = 0;
let jumlahHalaman = 0;

function downloadLembarPengganti() {
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

      console.log(
        `Memproses wilayah ${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}`
      );
      const pbpPengganti = PBP.filter((pbp) => pbp.status_pbp === "pengganti");
      const alasanPengganti = JSON.parse(
        readFileSync(join(__dirname, "alasan_pengganti.json"))
      );

      const mapAlasanPengganti = pbpPengganti.map((pbp) => {
        if (pbp.notes === null) {
          console.log(pbp);
          const alasanNull = JSON.parse(
            readFileSync(join(__dirname, "alasan_null.json"))
          );
          // save file alasan_null.json
          alasanNull.push(pbp);
          writeFileSync(
            join(__dirname, "alasan_null.json"),
            JSON.stringify(alasanNull, null, 2)
          );
        }
        return pbp.notes;
      });
      alasanPengganti.push(...mapAlasanPengganti);

      // save file
      writeFileSync(
        join(__dirname, "alasan_pengganti.json"),
        JSON.stringify(alasanPengganti, null, 2)
      );
      index++;
      downloadLembarPengganti();
    } else {
      index++;
      downloadLembarPengganti();
    }
  } else {
    console.log("Selesai...");
    // remove duplikat
    // const alasanPengganti = JSON.parse(
    //   readFileSync(join(__dirname, "alasan_pengganti.json"))
    // );
    // const uniqueAlasan = [...new Set(alasanPengganti)];
    // writeFileSync(
    //   join(__dirname, "alasan_pengganti.json"),
    //   JSON.stringify(uniqueAlasan, null, 2)
    // );
  }
}

downloadLembarPengganti();
