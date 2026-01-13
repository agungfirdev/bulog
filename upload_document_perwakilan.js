const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const https = require("https");
const { Cookie } = require("./utils.js");
const wilayah = require("./data/REKAP_DESA.json");
const pathFileUpload = "/Users/agungfir/Documents/SCAN/DOKUMEN DESA";

function getDocumentTypeUpload(typeDocString) {
  return typeDocString === "SPTJM"
    ? "file_sptjm"
    : typeDocString === "DTT"
    ? "file_bast_pbp"
    : typeDocString === "PERWAKILAN"
    ? "file_bast_perwakilan"
    : typeDocString === "PENGGANTI"
    ? "file_bast_pengganti"
    : "";
}
let index = 0;
console.log("Upload starting...");
function upload() {
  if (index < wilayah.length) {
    console.log(`Memproses ${index + 1} dari ${wilayah.length}`);
    const {
      kode_provinsi,
      kode_kabkota,
      kode_kecamatan,
      kode_kelurahan,
      nama_provinsi,
      nama_kabkota,
      nama_kecamatan,
      nama_kelurahan,
    } = wilayah[index];
    console.log(`Mengupload dokumen untuk ${nama_kecamatan}_${nama_kelurahan}`);
    const no_bast = `BAST-202511${kode_kelurahan.replaceAll(".", "")}`;

    const fileNameUpload = `${nama_provinsi}_${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}_PERWAKILAN.pdf`;
    const filePathUpload = path.join(
      pathFileUpload,
      nama_provinsi,
      nama_kabkota,
      nama_kecamatan,
      nama_kelurahan,
      fileNameUpload
    );

    if (!fs.existsSync(filePathUpload)) {
      index++;
      upload();
    } else {
      const pathRekap = path.join(
        __dirname,
        "rekap_docs",
        `${nama_provinsi}_${nama_kabkota}_${nama_kecamatan}_${nama_kelurahan}.json`
      );
      const rekapData = JSON.parse(fs.readFileSync(pathRekap));

      if (
        rekapData.file_bast_perwakilan_verification_status === "verified" &&
        rekapData.file_bast_perwakilan_catatan === ""
      ) {
        console.log(
          `Dokumen untuk ${nama_kecamatan}_${nama_kelurahan} sudah diupload sebelumnya`
        );
        index++;
        upload();
      } else {
        const form = new FormData();

        form.append("filename", `${no_bast}`);
        form.append("document_type", getDocumentTypeUpload("PERWAKILAN"));
        form.append("alokasi_bulan", "11");
        form.append("alokasi_tahun", "2025");
        form.append("kode_provinsi", `${kode_provinsi}`);
        form.append("provinsi", `${nama_provinsi}`);
        form.append("kode_kabupaten", `${kode_kabkota}`);
        form.append("kabupaten", `${nama_kabkota}`);
        form.append("kode_kecamatan", `${kode_kecamatan}`);
        form.append("kecamatan", `${nama_kecamatan}`);
        form.append("nama_kelurahan", `${nama_kelurahan}`);
        form.append("kelurahan", `${kode_kelurahan}`);
        form.append("created_at", "");
        // form ke json
        form.append(
          "dokumen",
          fs.createReadStream(filePathUpload), // ganti path file sesuai lokal
          {
            filename: fileNameUpload,
            contentType: "application/pdf",
          }
        );

        // kasih try catch
        const url = "https://banpang.bulog.co.id/api/file-upload";
        const options = {
          method: "POST",
          headers: {
            ...form.getHeaders(),
            Cookie,
          },
        };
        const req = https.request(url, options, (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk.toString();
          });

          res.on("end", () => {
            // console.log("Response data", data);
            const jsonResponse = JSON.parse(data);
            if (jsonResponse.message === "File baru berhasil ditambahkan") {
              index++;
              upload();
            } else if (
              jsonResponse.message ===
              "Dokumen dengan tipe file_bast_perwakilan sudah diverifikasi."
            ) {
              index++;
              upload();
            }
            console.log(jsonResponse.message);
          });
        });

        req.on("error", (error) => {
          console.error("Error uploading file:", error);
          upload();
        });

        form.pipe(req);
      }
    }
  } else {
    console.log("Semua file telah diupload");
  }
}

upload();
