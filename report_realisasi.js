const spms = require("./data/spm_data.json");
const drivers = require("./data/drivers.json");
const xlsx = require("xlsx");

const outputhPath =
  "/Users/agungfir/Documents/BULOG/BANPANG 2025/LAPORAN/REPORT REALISASI SPM.xlsx";
const toNumber = (v) => {
  if (v === null || v === undefined || v === "") return NaN;
  if (typeof v === "number") return v;
  // try direct parse
  const n1 = Number(String(v).trim());
  if (!Number.isNaN(n1)) return n1;
  // try replace common thousand/decimal separators (e.g. "1.234,56" -> "1234.56")
  const alt = Number(String(v).trim().replace(/\./g, "").replace(/,/g, "."));
  return Number.isNaN(alt) ? NaN : alt;
};
const fmt = (v) => {
  const n = toNumber(v);
  if (Number.isNaN(n)) return v === null || v === undefined ? "" : String(v);
  return new Intl.NumberFormat("id-ID").format(n); // e.g. 1000 -> "1.000"
};

// sorted by createdAt
const spmsSorted = spms.sort((a, b) => {
  const dateA = new Date(a.start_date);
  const dateB = new Date(b.start_date);
  return dateA - dateB;
});

// mapping NO, TANGGAL, NOPOL, DRIVER, NIK, NO SPM, DOC OUT, KECAMATAN, DESA, TONASE BERAS (Kg), JUMLAH BERAS (Kg), TONASE MINYAK (Ltr), JUMLAH MINYAK (Ltr), GUDANG PENGAMBILAN
const mappedData = spmsSorted.map((spm, index) => {
  const driver = drivers.find((d) => d.NO_TELPON === spm.no_hp) || {};
  // formate date to DD-MM-YYYY
  const date = new Date(spm.start_date).toLocaleDateString("id-ID");
  return {
    NO: index + 1,
    TANGGAL: date,
    NOPOL: spm.plat_number,
    DRIVER: spm.driver || "N/A",
    NIK: driver.NIK || "N/A",
    "NO SPM": spm.no_spm,
    "DOC OUT": spm.no_out || "N/A",
    KECAMATAN: spm.kecamatan.toUpperCase(),
    DESA: spm.kelurahan.toUpperCase(),
    "TONASE BERAS (Kg)": spm.komoditas_name === "Beras" ? fmt(spm.qty) : "",
    "JUMLAH BERAS (Kg)": spm.komoditas_name === "Beras" ? fmt(spm.qty) : "",
    "TONASE MINYAK (Ltr)":
      spm.komoditas_name === "Minyak Goreng" ? fmt(spm.qty) : "",
    "JUMLAH MINYAK (Ltr)":
      spm.komoditas_name === "Minyak Goreng" ? fmt(spm.qty) : "",
    "GUDANG PENGAMBILAN": spm.gudang,
  };
});

const data = [];

mappedData.forEach((spm, index) => {
  data.push(spm);
  // Jika spm saat ini dan spm berikutnya memiliki nama driver yang sama maka beri pemisah berupa baris kosong setelah data spm saat ini, jika start_date berbeda beri pemisah
  if (
    index < mappedData.length - 1 &&
    (spm.DRIVER !== mappedData[index + 1].DRIVER ||
      spm.TANGGAL !== mappedData[index + 1].TANGGAL)
  ) {
    data.push({
      NO: "",
      TANGGAL: "",
      NOPOL: "",
      DRIVER: "",
      NIK: "",
      "NO SPM": "",
      "DOC OUT": "",
      KECAMATAN: "",
      DESA: "",
      "TONASE BERAS (Kg)": "",
      "JUMLAH BERAS (Kg)": "",
      "TONASE MINYAK (Ltr)": "",
      "JUMLAH MINYAK (Ltr)": "",
      "GUDANG PENGAMBILAN": "",
    });
  }
});

// create xlsx
// kumpulkan semua header (agar kolom konsisten)
const headersSet = new Set();
data.forEach((r) => Object.keys(r).forEach((k) => headersSet.add(k)));
const headers = Array.from(headersSet);

const worksheet = xlsx.utils.json_to_sheet(data, {
  header: headers,
  raw: true,
});

// hitung lebar tiap kolom berdasarkan panjang value dan header
const colWidths = headers.map((h) => {
  const maxLen = Math.max(
    String(h).length,
    ...data.map((r) => {
      const v = r[h];
      return v === undefined || v === null ? 0 : String(v).length;
    })
  );
  return { wch: Math.min(Math.max(5, maxLen + 2), 100) }; // padding + cap
});
worksheet["!cols"] = colWidths;

const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Realisasi SPM");
xlsx.writeFile(workbook, outputhPath);

console.log(`Report '${outputhPath}' generated successfully.`);
