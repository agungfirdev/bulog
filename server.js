const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const cors = require("cors");
const { kelurahans } = require("./utils");
const pathRekap = "/Users/agungfir/Documents/BULOG/BANPANG 2025/REKAP PBP";

app.use(express.json());
app.use(
  cors({
    // origin: "https://cd6741fa47b1.ngrok-free.app", // Ganti dengan URL Ngrok Anda
    methods: ["GET", "POST", "PUT", "DELETE"], // Metode yang diizinkan
    credentials: true, // Jika menggunakan cookie atau autentikasi
  })
);
const port = process.env.PORT || 3000;
const pathStatic =
  "/Users/agungfir/Documents/BULOG/BANPANG 2025/FOTO PBP OKT-NOV";

app.use(express.static(pathStatic));
app.get("/recipients/:id", (req, res) => {
  const { id } = req.params;
  const { type, status } = req.query;

  // found region in regions in file json wilayah
  const region = kelurahans.find((r) => r.kode_kelurahan === id);
  if (!region) {
    return res.status(404).json({ error: "Region not found" });
  }

  const recipientsPath = path.join(
    pathRekap,
    `11_${region.nama_provinsi}_${region.nama_kabkota}_${region.nama_kecamatan}_${region.nama_kelurahan}.json`
  );

  fs.readFile(recipientsPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading recipients file:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    try {
      const recipients = JSON.parse(data);
      // filter recipients where verification_status is "unverified" in file process_verified.json
      const processVerifiedPath = path.join(
        __dirname,
        "data",
        "process_verified.json"
      );
      const processVerifiedData = fs.readFileSync(processVerifiedPath, "utf8");
      const processVerified = JSON.parse(processVerifiedData);
      const verifiedIds = processVerified.map((p) => p.pbp_id);
      let filterRecipients = [];
      if (type === "unverified") {
        filterRecipients = recipients.filter(
          (recipient) => recipient.verification_status === "unverified"
        );
      } else if (type === "verified") {
        filterRecipients = recipients.filter(
          (recipient) => recipient.verification_status === "verified"
        );
      } else {
        filterRecipients = recipients;
      }

      if (status === "perwakilan") {
        filterRecipients = recipients.filter(
          (recipient) => recipient.status_pbp === "perwakilan"
        );
      } else if (status === "pengganti") {
        filterRecipients = recipients.filter(
          (recipient) => recipient.status_pbp === "pengganti"
        );
      } else if (status === "1kk") {
        filterRecipients = recipients.filter(
          (recipient) =>
            recipient.status_pbp === "normal" &&
            recipient.nama_pengganti !== null
        );
      } else {
        filterRecipients = recipients;
      }

      res.json(filterRecipients);
    } catch (parseError) {
      console.error("Error parsing recipients JSON:", parseError);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
});

app.get("/wilayah", (req, res) => {
  const wilayahPath = path.join(__dirname, "data", "wilayah.json");
  fs.readFile(wilayahPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading wilayah file:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    try {
      const wilayah = JSON.parse(data).filter(
        (w) => w.nama_kabkota === "KAB. PEMALANG"
      );
      res.json(wilayah);
    } catch (parseError) {
      console.error("Error parsing wilayah JSON:", parseError);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
});

app.get("/docs", (req, res) => {
  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, "template", "recipients", "docs", "index.html"),
    "utf8"
  );
  res.send(htmlTemplate);
});

app.post("/recipients/verify", (req, res) => {
  const { pbp_id } = req.body;
  const pbps = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "data", "process_verified.json"),
      "utf8"
    )
  );
  const pbp = pbps.find((p) => p.pbp_id === pbp_id);
  if (!pbp) {
    const pbp = {
      pbp_id,
      status: "verified",
      catatan: "",
    };
    pbps.push(pbp);
    fs.writeFileSync(
      path.join(__dirname, "data", "process_verified.json"),
      JSON.stringify(pbps, null, 2)
    );
    res.json({ message: "PBP verified successfully" });
  } else {
    res.status(404).json({ error: "PBP Already Verified" });
  }
});

app.get("/recipients/verify/:id", (req, res) => {
  const { id } = req.params;

  // return html template
  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, "template", "recipients", "verify", "index.html"),
    "utf8"
  );
  // change :id di dalam htmlTemplate menjadi id
  const updatedHtmlTemplate = htmlTemplate.replace(/:id/g, id);
  res.send(updatedHtmlTemplate);
});

app.get("/wilayah", (req, res) => {
  const { wilayahId } = req.query;
  const wilayahPath = path.join(__dirname, "data", "wilayah.json");
  fs.readFile(wilayahPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading wilayah file:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    try {
      const wilayah = JSON.parse(data);
      const filteredWilayah = wilayah.filter(
        (w) => w.nama_kabkota === "KAB. PEMALANG"
      );
      if (filteredWilayah.length > 0) {
        res.json(filteredWilayah);
      } else {
        res.status(404).json({ error: "Wilayah not found" });
      }
    } catch (parseError) {
      console.error("Error parsing wilayah JSON:", parseError);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
});

app.get("/recipients/gallery/:id", (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  // return html template
  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, "template", "recipients", "gallery", "index.html"),
    "utf8"
  );

  const updatedHtmlTemplate = htmlTemplate
    .replace(/:id/g, id)
    .replace(/:type/g, type);
  res.send(updatedHtmlTemplate);
});

app.get("/recipients", (req, res) => {
  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, "template", "recipients", "index.html"),
    "utf8"
  );
  res.send(htmlTemplate);
});

app.get("/", (req, res) => {
  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, "template", "index.html"),
    "utf8"
  );
  res.send(htmlTemplate);
});

app.get("/pengganti/:id", (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, "template", "recipients", "pengganti", "index.html"),
    "utf8"
  );

  const updatedHtmlTemplate = htmlTemplate
    .replace(/:id/g, id)
    .replace(/:type/g, type);

  res.send(updatedHtmlTemplate);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});
