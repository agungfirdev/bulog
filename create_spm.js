const fs = require("fs");
const path = require("path");

let index = 1;

function createSPM() {
  fetch("https://banpang.bulog.co.id/api/spm/create", {
    headers: {
      accept: "application/json, text/plain, */*",
    },
    method: "POST",
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      setTimeout(() => {
        index++;
        createSPM();
      }, 5000);
    })
    .catch((error) => {
      console.error("Error fetching SPM data:", error);
    });
}

// createSPM();

const html = `...beberapa teks <b>SO/9675/12/2025/11060</b> teks lain...`;
const match = html.match(/<b>(SO\/[^<]*)</);

// Jika ketemu, match[1] berisi "SO/9675/12/2025/11060"
if (match) {
  console.log(match[1]); // Output: SO/9675/12/2025/11060
} else {
  console.log("Tidak ditemukan");
}

// const html = `beberapa teks sebelumnya <b>SO/9675/12/2025/11060</b> dan sesudahnya`;

// Ganti hanya tag <b> yang isinya dimulai dengan SO/
