const fs = require("fs");
const path = require("path");
const { Cookie } = require("./utils");
const drivers = fs.readFileSync(path.join(__dirname, "data", "drivers.json"));

fetch(
  "https://banpang.bulog.co.id/api/management/akun-lapangan?&rows=200&offset=0",
  {
    headers: {
      Cookie,
    },
  }
)
  .then((res) => res.json())
  .then((data) => {
    const filePath = path.join(__dirname, "data", "drivers_system.json");
    fs.writeFileSync(filePath, JSON.stringify(data.results, null, 2));
    const driversSystem = data.results;

    console.log(`Saved ${data.results.length} drivers to drivers_system.json`);
  })
  .catch((error) => {
    console.error("Error fetching drivers data:", error);
  });
