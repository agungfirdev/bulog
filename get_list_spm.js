const fs = require("fs");
const { Cookie } = require("./utils");
const path = require("path");
const so = require("./data/so.json");

fetch(
  "https://banpang.bulog.co.id/api/spm?rows=2000&offset=0&kode_provinsi=33&kode_kabupaten=33.27&allowed_provinces=33&&alokasi_bulan=11&alokasi_tahun=2025",
  {
    headers: {
      Cookie,
    },
  }
)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("SPM data fetched successfully");
    // console body
    response.json().then((data) => {
      //   Length of results
      console.log("Number of SPM results:", data.results.length);
      const spmsSorted = data.results.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateA - dateB;
      });

      fs.writeFileSync(
        path.join(__dirname, "data", "spm_data.json"),
        JSON.stringify(spmsSorted, null, 2)
      );

      spmsSorted.map((item) => {
        const matchingSo = so.find(
          (soItem) =>
            soItem.kecamatan === item.kecamatan &&
            soItem.no_so === item.no_so &&
            item.komoditas_name === soItem.komoditas_name
        );
        if (!matchingSo) {
          console.log(
            `No matching found SO for ${item.kecamatan}, NO SPM : ${item.no_spm}`
          );
        }
      });
      console.log(`Jumlah SPM untuk KAB. PEMALANG: ${data.results.length}`);
    });
  })
  .catch((error) => {
    console.error("Error fetching SPM data:", error);
  });
