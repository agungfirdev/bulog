let tx = () => {
  if (!aD || !aE || !aG.size) return "";
  let e = Array.from(aG)[0]; // kode_kecamatan
  let a = new Date(),
    t = a.getDate().toString().padStart(2, "0"), // tanggal
    r = a.getMinutes().toString().padStart(2, "0"), // menit
    s = a.getSeconds().toString().padStart(2, "0"), // detik
    l = Math.floor(999999 * Math.random())
      .toString()
      .padStart(4, "0"); // random
  return "SPM"
    .concat(aD)
    .concat(aE.toString().padStart(2, "0"))
    .concat(e)
    .concat(t)
    .concat(r)
    .concat(s)
    .concat(l);
};

console.log(tx());
