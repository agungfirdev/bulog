# Banpang - Bulog

## Fitur yang Tersedia

- [ ] Fokuskan ke 1 Alokasi Banpang, Sehingga Semua Proses dapat di otomatis
- [ ] Download Berkas (SPTJM, PENGGANTI, PERWAKILAN, DTT, UNDANGAN, BLANK)
- [ ] Report (SPM+SURAT JALAN)
- [ ] Report Berkas Desa (SPTJM, PENGGANTI, PERWAKILAN, DTT) per PROVINSI, KABUPATEN, KECAMATAN, DESA
- [ ] Input Docout (Sumber Docout SPM, NO_DOCOUT)

LINK KEPERLUAN DESA BANPANG OKT-NOV 2025 (BNBA, CADANGAN,DTT, SPTJM, PENGGANTI, PERWAKILAN, UNDANGAN)
KEC. PEMALANG

Banjarmulya
https://drive.google.com/drive/folders/1HpWsYzD2BqXNm3_K9f-q8n9A1PTUO95v

Bojongbata
https://drive.google.com/drive/folders/16z0SASzQQ34rXWdFwvLywI6R_BWtbL3z

Bojongnangka
https://drive.google.com/drive/folders/18_03Ft-vsVvM0Ya96Y1KHxyxze0wHwmd

Danasari
https://drive.google.com/drive/folders/13CyJDyNi_y4Xvtp0xSlklqt4KLIHOkJ-

Kebondalem
https://drive.google.com/drive/folders/1myoQydvcCUGJJNMbq4NnJ5XnDAO5ZXvH

Kramat
https://drive.google.com/drive/folders/1wnFUpLfSGJ7x62VUnMZlQ_SCIlB7RJG-

Lawangrejo
https://drive.google.com/drive/folders/1A7dQX2g-38QEdLhlO9qAWA6FW_VYnnaJ

Mengori
https://drive.google.com/drive/folders/1Jib3Na3TO9YHnMP7KmJ_Q6AJCxeiF4fA

Mulyoharjo
https://drive.google.com/drive/folders/1yDOGEd4Wf3-PVN7I3lLwY_Goz5_Wus1Z

Paduraksa
https://drive.google.com/drive/folders/1Eh_tR4HuJgHZfyi8fvTouuYyt6-V0S2b

Pegongsoran
https://drive.google.com/drive/folders/1hZVAGVbE4PWaaotkwrCD5orci3UX0ROz

Pelutan
https://drive.google.com/drive/folders/1g-pMcvigDt8FDEnxPvsccFJL5NuLOr8L

Saradan
https://drive.google.com/drive/folders/12AYEmnDfVdNvkhMVDsjzPW9_q-TDRLp9

Sewaka
https://drive.google.com/drive/folders/1rvsD0fCaWTghAQ1bB_0UEw9vaHcS02ki

Sugihwaras
https://drive.google.com/drive/folders/12KiaGlKgYZEaieDD43Z1GFObd064JmOP

Sungapan
https://drive.google.com/drive/folders/1IM0ZE2yOfviK-kllg3fqhvrr_76Brw_X

Surajaya
https://drive.google.com/drive/folders/1ZWiLi5vdhg7bHzNb-nXT8_qEfV34JlnO

Tambakrejo
https://drive.google.com/drive/folders/1ZNH1pw-2QPiu6ZuM4P4MFhoRedQZiSMP

Wanamulya
https://drive.google.com/drive/folders/1vsCPH5XNs0j7ewCrPJqWQkVVEx9tOUPB

Widuri
https://drive.google.com/drive/folders/1sRicH5mlm5hgeKQ6CLx58FNst5FtbtXs

## Kelurahan With PBP

```js
const body = {kode_provinsi:33,kode_kabkota:33.27,kode_kecamatan:33.27.03,alokasi_bulan:11,alokasi_tahun:2025,komoditas_id:1};

fetch(
  "https://banpang.bulog.co.id/api/wilayah/kelurahan-with-pbp?kode_provinsi=33&kode_kabkota=33.27&kode_kecamatan=33.27.03&alokasi_bulan=11&alokasi_tahun=2025&komoditas_id=1",
  {
    headers: {
    },
    method: "GET",
    body: ,
  }
);
```

```json
{
  "results": [
    {
      "nama_kelurahan": "Badak",
      "pbp_count": 1659,
      "dtt_number": "BAST-2025113327032005",
      "total_allocation": 33180,
      "teralokasikan": 33180,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Belik",
      "pbp_count": 1615,
      "dtt_number": "BAST-2025113327032002",
      "total_allocation": 32300,
      "teralokasikan": 0,
      "sisa": 32300
    },
    {
      "nama_kelurahan": "Beluk",
      "pbp_count": 2179,
      "dtt_number": "BAST-2025113327032009",
      "total_allocation": 43580,
      "teralokasikan": 40600,
      "sisa": 2980
    },
    {
      "nama_kelurahan": "Bulakan",
      "pbp_count": 1451,
      "dtt_number": "BAST-2025113327032010",
      "total_allocation": 29020,
      "teralokasikan": 0,
      "sisa": 29020
    },
    {
      "nama_kelurahan": "Gombong",
      "pbp_count": 1419,
      "dtt_number": "BAST-2025113327032001",
      "total_allocation": 28380,
      "teralokasikan": 0,
      "sisa": 28380
    },
    {
      "nama_kelurahan": "Gunungjaya",
      "pbp_count": 1445,
      "dtt_number": "BAST-2025113327032006",
      "total_allocation": 28900,
      "teralokasikan": 0,
      "sisa": 28900
    },
    {
      "nama_kelurahan": "Gunungtiga",
      "pbp_count": 451,
      "dtt_number": "BAST-2025113327032003",
      "total_allocation": 9020,
      "teralokasikan": 0,
      "sisa": 9020
    },
    {
      "nama_kelurahan": "Kalisaleh",
      "pbp_count": 188,
      "dtt_number": "BAST-2025113327032012",
      "total_allocation": 3760,
      "teralokasikan": 0,
      "sisa": 3760
    },
    {
      "nama_kelurahan": "Kuta",
      "pbp_count": 1842,
      "dtt_number": "BAST-2025113327032004",
      "total_allocation": 36840,
      "teralokasikan": 36840,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Mendelem",
      "pbp_count": 1907,
      "dtt_number": "BAST-2025113327032008",
      "total_allocation": 38140,
      "teralokasikan": 23400,
      "sisa": 14740
    },
    {
      "nama_kelurahan": "Sikasur",
      "pbp_count": 818,
      "dtt_number": "BAST-2025113327032011",
      "total_allocation": 16360,
      "teralokasikan": 16360,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Simpur",
      "pbp_count": 908,
      "dtt_number": "BAST-2025113327032007",
      "total_allocation": 18160,
      "teralokasikan": 18160,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Sodong Basari",
      "pbp_count": 534,
      "dtt_number": "BAST-2025113327032013",
      "total_allocation": 10680,
      "teralokasikan": 0,
      "sisa": 10680
    }
  ],
  "komoditas": {
    "selected": {
      "id": 1,
      "nama": "Beras",
      "kuantum": 20,
      "satuan": "Kg",
      "is_active": true
    },
    "list": [
      {
        "id": 1,
        "nama": "Beras",
        "kuantum": 20,
        "satuan": "Kg",
        "is_active": true
      },
      {
        "id": 2,
        "nama": "Minyak Goreng",
        "kuantum": 4,
        "satuan": "L",
        "is_active": true
      }
    ]
  }
}
```

### CREATE SPM

```js
const bodyJSON = {
  no_spm: "SPM20251133.27.11093105987710",
  no_so: "-",
  no_out: "-",
  plat_number: "G 9182 LG",
  gudang: "KOMPLEKS PERGUDANGAN KEDUNGKELOR",
  driver: "11001-IMRON",
  no_hp: "082322642100",
  driver_id: 55593,
  kode_provinsi: "33",
  provinsi: "JAWA TENGAH",
  kode_kabupaten: "33.27",
  kabupaten: "KAB. PEMALANG",
  kode_kecamatan: "33.27.11",
  kecamatan: "Ampelgading",
  kelurahan: "Sidokare",
  alokasi_tahun: "2025",
  alokasi_bulan: "11",
  total_pbp: "7072", // ini total pagu kecamatan
  qty: 2188,
  kelurahanData: [
    {
      kelurahan: "Sidokare",
      qty: 2188,
      id_dtt: "BAST-2025113327112015",
      total_allocation: 2188,
    },
  ],
  transporter_id: 2,
  start_date: "2025-12-09T00:00:00.000Z",
  end_date: "2025-12-09T00:00:00.000Z",
  komoditas_id: 2,
};

fetch("https://banpang.bulog.co.id/api/spm/create", {
  headers: {
    accept: "application/json, text/plain, */*",
    body: '{"no_spm":"SPM20251133.27.11093105987710","no_so":"-","no_out":"-","plat_number":"G 9182 LG","gudang":"KOMPLEKS PERGUDANGAN KEDUNGKELOR","driver":"11001-IMRON","no_hp":"082322642100","driver_id":55593,"kode_provinsi":"33","provinsi":"JAWA TENGAH","kode_kabupaten":"33.27","kabupaten":"KAB. PEMALANG","kode_kecamatan":"33.27.11","kecamatan":"Ampelgading","kelurahan":"Sidokare","alokasi_tahun":"2025","alokasi_bulan":"11","total_pbp":"7072","qty":2188,"kelurahanData":[{"kelurahan":"Sidokare","qty":2188,"id_dtt":"BAST-2025113327112015","total_allocation":2188}],"transporter_id":2,"start_date":"2025-12-09T00:00:00.000Z","end_date":"2025-12-09T00:00:00.000Z","komoditas_id":2}',
    method: "POST",
  },
});
```

### GET WILAYAH

```js
fetch(
  "https://banpang.bulog.co.id/api/wilayah/filters?&kode_provinsi=33&kode_kabkota=33.27",
  {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9,id;q=0.8",
      "sec-ch-ua":
        '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    },
    referrer: "https://banpang.bulog.co.id/surat-perintah-muat",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  }
);
```

```json
{
  "message": "Filters retrieved",
  "count_provinsi": 1,
  "provinsi": [
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH"
    }
  ],
  "count_kabKota": 1,
  "kabKota": [
    {
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG"
    }
  ],
  "count_kecamatan": 14,
  "kecamatan": [
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH",
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG",
      "kode_kecamatan": "33.27.01",
      "nama_kecamatan": "Moga"
    },
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH",
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG",
      "kode_kecamatan": "33.27.02",
      "nama_kecamatan": "Pulosari"
    },
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH",
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG",
      "kode_kecamatan": "33.27.03",
      "nama_kecamatan": "Belik"
    },
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH",
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG",
      "kode_kecamatan": "33.27.04",
      "nama_kecamatan": "Watukumpul"
    },
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH",
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG",
      "kode_kecamatan": "33.27.05",
      "nama_kecamatan": "Bodeh"
    },
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH",
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG",
      "kode_kecamatan": "33.27.06",
      "nama_kecamatan": "Bantarbolang"
    },
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH",
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG",
      "kode_kecamatan": "33.27.07",
      "nama_kecamatan": "Randudongkal"
    },
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH",
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG",
      "kode_kecamatan": "33.27.08",
      "nama_kecamatan": "Pemalang"
    },
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH",
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG",
      "kode_kecamatan": "33.27.09",
      "nama_kecamatan": "Taman"
    },
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH",
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG",
      "kode_kecamatan": "33.27.10",
      "nama_kecamatan": "Petarukan"
    },
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH",
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG",
      "kode_kecamatan": "33.27.11",
      "nama_kecamatan": "Ampelgading"
    },
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH",
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG",
      "kode_kecamatan": "33.27.12",
      "nama_kecamatan": "Comal"
    },
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH",
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG",
      "kode_kecamatan": "33.27.13",
      "nama_kecamatan": "Ulujami"
    },
    {
      "kode_provinsi": "33",
      "nama_provinsi": "JAWA TENGAH",
      "kode_kabkota": "33.27",
      "nama_kabkota": "KAB. PEMALANG",
      "kode_kecamatan": "33.27.14",
      "nama_kecamatan": "Warungpring"
    }
  ],
  "count_kelurahan": 0,
  "kelurahan": []
}
```

### Kelurahan With PBP

```js
fetch(
  "https://banpang.bulog.co.id/api/wilayah/kelurahan-with-pbp?kode_provinsi=33&kode_kabkota=33.27&kode_kecamatan=33.27.02&alokasi_bulan=11&alokasi_tahun=2025",
  {
    headers: {
      accept: "application/json, text/plain, */*",
    },
    referrer: "https://banpang.bulog.co.id/surat-perintah-muat/form-spm",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  }
);
```

```json
{
  "results": [
    {
      "nama_kelurahan": "Batursari",
      "pbp_count": 644,
      "dtt_number": "BAST-2025113327022002",
      "total_allocation": 12880,
      "teralokasikan": 12880,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Cikendung",
      "pbp_count": 715,
      "dtt_number": "BAST-2025113327022012",
      "total_allocation": 14300,
      "teralokasikan": 14300,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Clekatakan",
      "pbp_count": 589,
      "dtt_number": "BAST-2025113327022001",
      "total_allocation": 11780,
      "teralokasikan": 11780,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Gambuhan",
      "pbp_count": 1216,
      "dtt_number": "BAST-2025113327022006",
      "total_allocation": 24320,
      "teralokasikan": 24320,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Gunungsari",
      "pbp_count": 550,
      "dtt_number": "BAST-2025113327022004",
      "total_allocation": 11000,
      "teralokasikan": 11000,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Jurangmangu",
      "pbp_count": 177,
      "dtt_number": "BAST-2025113327022005",
      "total_allocation": 3540,
      "teralokasikan": 3540,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Karangsari",
      "pbp_count": 621,
      "dtt_number": "BAST-2025113327022007",
      "total_allocation": 12420,
      "teralokasikan": 12420,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Nyalembeng",
      "pbp_count": 398,
      "dtt_number": "BAST-2025113327022008",
      "total_allocation": 7960,
      "teralokasikan": 7960,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Pagenteran",
      "pbp_count": 319,
      "dtt_number": "BAST-2025113327022010",
      "total_allocation": 6380,
      "teralokasikan": 6380,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Penakir",
      "pbp_count": 694,
      "dtt_number": "BAST-2025113327022003",
      "total_allocation": 13880,
      "teralokasikan": 13880,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Pulosari",
      "pbp_count": 1087,
      "dtt_number": "BAST-2025113327022009",
      "total_allocation": 21740,
      "teralokasikan": 21740,
      "sisa": 0
    },
    {
      "nama_kelurahan": "Siremeng",
      "pbp_count": 918,
      "dtt_number": "BAST-2025113327022011",
      "total_allocation": 18360,
      "teralokasikan": 10200,
      "sisa": 8160
    }
  ],
  "komoditas": {
    "selected": {
      "id": 1,
      "nama": "Beras",
      "kuantum": 20,
      "satuan": "Kg",
      "is_active": true
    },
    "list": [
      {
        "id": 1,
        "nama": "Beras",
        "kuantum": 20,
        "satuan": "Kg",
        "is_active": true
      },
      {
        "id": 2,
        "nama": "Minyak Goreng",
        "kuantum": 4,
        "satuan": "L",
        "is_active": true
      }
    ]
  }
}
```

### Get Kelurahan With Quantities

```js
fetch(
  "https://banpang.bulog.co.id/api/spm/get-kelurahan-quantities?kelurahan=Siremeng&id_dtt=BAST-2025113327022011&alokasi_bulan=11&alokasi_tahun=2025&komoditas_id=1",
  {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9,id;q=0.8",
      "sec-ch-ua":
        '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    },
    referrer: "https://banpang.bulog.co.id/surat-perintah-muat/form-spm",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  }
);
```

```json
{ "totalUsed": 10200 }
```

### Create SPM

```js
fetch("https://banpang.bulog.co.id/api/spm/create", {
  headers: {
    accept: "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,id;q=0.8",
    "content-type": "application/json",
    "sec-ch-ua":
      '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
  },
  referrer: "https://banpang.bulog.co.id/surat-perintah-muat/form-spm",
  body: '{"no_spm":"SPM20251133.27.02105020413043","no_so":"-","no_out":"-","plat_number":"G 9883 ZM","gudang":"KOMPLEKS PERGUDANGAN KEDUNGKELOR","driver":"11001-WAGE","no_hp":"085290408366","driver_id":587,"kode_provinsi":"33","provinsi":"JAWA TENGAH","kode_kabupaten":"33.27","kabupaten":"KAB. PEMALANG","kode_kecamatan":"33.27.02","kecamatan":"Pulosari","kelurahan":"Siremeng","alokasi_tahun":"2025","alokasi_bulan":"11","total_pbp":"7928","qty":8160,"kelurahanData":[{"kelurahan":"Siremeng","qty":8160,"id_dtt":"BAST-2025113327022011","total_allocation":18360}],"transporter_id":2,"start_date":"2025-12-10T00:00:00.000Z","end_date":"2025-12-10T00:00:00.000Z","komoditas_id":1}',
  method: "POST",
  mode: "cors",
  credentials: "include",
});
```

```json
{
  "success": true,
  "id_qty_pengiriman": "b2a605e8-b4f2-464d-811d-b297eff40fed",
  "driver_id": "587",
  "transporter_id": "2"
}
```

## Alasan pengganti

- meninggal dunia
- pindah domisili
- dicatat lebih dari 1 (satu) kali
- tidak ditemukan alamatnya
- tidak ditemukan pada alamat terdata
- menolak menerima bantuan
- tidak memenuhi syarat sebagai PBP (Sudah Mampu/ASN/TNI/POLRI/Perangkat Daerah)
- PBP tidak mengambil dalam batas waktu paling lambat 5 hari kerja

### UPDATE DATA PBP

PUT

https://banpang.bulog.co.id/api/pbp/86985294-6569-4032-9099-f927b7ac9c3c

201

```json
{
  "status_pbp": "pengganti",
  "nama_pengganti": "EKA NUR OKTAVIAWULANDARI",
  "nik_pengganti": "3327115410070002",
  "alamat_pengganti": "Tegalsari Timur",
  "notes": "tidak ditemukan pada alamat terdata"
}
```

```json
{
  "status_pbp": "pengganti",
  "nama_pengganti": "HERAWATI",
  "nik_pengganti": "3327114603840003",
  "alamat_pengganti": "Tegalsari Timur",
  "notes": "PBP tidak mengambil dalam batas waktu paling lambat 5 hari kerja"
}
```

```json
{
  "status_pbp": "pengganti",
  "nama_pengganti": "WASTIYOWATI",
  "nik_pengganti": "3327116611770002",
  "alamat_pengganti": "Tegalsari Timur",
  "notes": "PBP tidak mengambil dalam batas waktu paling lambat 5 hari kerja"
}
```

SEMUA BERKAS DITERIMA

```json
{
  "message": "Data retrieved",
  "results": {
    "id": "fba920ca-9e78-4714-b5b6-7e398d3f3ac1",
    "file_bast_pbp": "2025/11/jpl/BAST/BAST-2025113327042012/files/bast-2025113327042012-normal.pdf",
    "file_bast_pengganti": null,
    "file_bast_khusus_kolektif": null,
    "file_bast_perwakilan": null,
    "file_sptjm": null,
    "file_sptjm_khusus_kolektif": null,
    "file_perwakilan_pbp_khusus_kolektif": null,
    "file_bast_pbp_verification_status": "verified",
    "file_bast_pengganti_verification_status": "unverified",
    "file_bast_khusus_kolektif_verification_status": "unverified",
    "file_bast_perwakilan_verification_status": "unverified",
    "file_sptjm_verification_status": "unverified",
    "file_sptjm_khusus_kolektif_verification_status": "unverified",
    "file_perwakilan_pbp_khusus_kolektif_verification_status": "unverified",
    "file_bast_pbp_catatan": "",
    "file_bast_pengganti_catatan": "",
    "file_bast_khusus_kolektif_catatan": "",
    "file_bast_perwakilan_catatan": "",
    "file_sptjm_catatan": "",
    "file_sptjm_khusus_kolektif_catatan": "",
    "file_perwakilan_pbp_khusus_kolektif_catatan": "",
    "verifikasi_document": "diterima",
    "verifikasi_by": "111",
    "transporter_name": "jpl",
    "file_bast_pbp_verification_by": "111",
    "file_bast_pengganti_verification_by": "111",
    "file_bast_khusus_kolektif_verification_by": null,
    "file_bast_perwakilan_verification_by": "111",
    "file_sptjm_verification_by": "111",
    "file_sptjm_khusus_kolektif_verification_by": null,
    "file_perwakilan_pbp_khusus_kolektif_verification_by": null,
    "file_bast_pbp_verification_at": "2026-01-09T14:49:57.089Z",
    "file_bast_pengganti_verification_at": "2026-01-09T14:49:54.515Z",
    "file_bast_khusus_kolektif_verification_at": null,
    "file_bast_perwakilan_verification_at": "2026-01-09T14:49:55.716Z",
    "file_sptjm_verification_at": "2026-01-09T14:49:53.449Z",
    "file_sptjm_khusus_kolektif_verification_at": null,
    "file_perwakilan_pbp_khusus_kolektif_verification_at": null,
    "file_bast_pbp_verification_by_user": {
      "name": "KANTOR CABANG TEGAL"
    },
    "file_bast_pengganti_verification_by_user": {
      "name": "KANTOR CABANG TEGAL"
    },
    "file_bast_khusus_kolektif_verification_by_user": null,
    "file_bast_perwakilan_verification_by_user": {
      "name": "KANTOR CABANG TEGAL"
    },
    "file_sptjm_verification_by_user": {
      "name": "KANTOR CABANG TEGAL"
    },
    "file_sptjm_khusus_kolektif_verification_by_user": null,
    "file_perwakilan_pbp_khusus_kolektif_verification_by_user": null,
    "verifikasi_by_user": {
      "name": "KANTOR CABANG TEGAL"
    },
    "history_verification_document": [
      {
        "id": "792554",
        "validation_reason": null,
        "verifikasi_document": "diterima",
        "bast_id": "fba920ca-9e78-4714-b5b6-7e398d3f3ac1",
        "created_at": "2026-01-10T09:52:35.926Z",
        "updated_at": "2026-01-10T09:52:35.926Z",
        "deleted_at": null
      }
    ],
    "file_logo": "/uploads/transporter/JPL logo.png"
  }
}
```

TIDAK DITERIMA

```json
{
  "message": "Data retrieved",
  "results": {
    "id": "69c76421-37fa-45d7-918c-ad9bb330ac4a",
    "file_bast_pbp": "2025/11/jpl/BAST/BAST-2025113327142005/files/bast-2025113327142005-normal.pdf",
    "file_bast_pengganti": "2025/11/jpl/BAST/BAST-2025113327142005/files/bast-2025113327142005-pengganti.pdf",
    "file_bast_khusus_kolektif": null,
    "file_bast_perwakilan": "2025/11/jpl/BAST/BAST-2025113327142005/files/bast-2025113327142005-perwakilan.pdf",
    "file_sptjm": "2025/11/jpl/BAST/BAST-2025113327142005/files/bast-2025113327142005-sptjm_pengganti.pdf",
    "file_sptjm_khusus_kolektif": null,
    "file_perwakilan_pbp_khusus_kolektif": null,
    "file_bast_pbp_verification_status": "verified",
    "file_bast_pengganti_verification_status": "unverified",
    "file_bast_khusus_kolektif_verification_status": "unverified",
    "file_bast_perwakilan_verification_status": "verified",
    "file_sptjm_verification_status": "unverified",
    "file_sptjm_khusus_kolektif_verification_status": "unverified",
    "file_perwakilan_pbp_khusus_kolektif_verification_status": "unverified",
    "file_bast_pbp_catatan": "",
    "file_bast_pengganti_catatan": "",
    "file_bast_khusus_kolektif_catatan": "",
    "file_bast_perwakilan_catatan": "",
    "file_sptjm_catatan": "",
    "file_sptjm_khusus_kolektif_catatan": "",
    "file_perwakilan_pbp_khusus_kolektif_catatan": "",
    "verifikasi_document": "menunggu",
    "verifikasi_by": null,
    "transporter_name": "jpl",
    "file_bast_pbp_verification_by": "111",
    "file_bast_pengganti_verification_by": null,
    "file_bast_khusus_kolektif_verification_by": null,
    "file_bast_perwakilan_verification_by": "111",
    "file_sptjm_verification_by": null,
    "file_sptjm_khusus_kolektif_verification_by": null,
    "file_perwakilan_pbp_khusus_kolektif_verification_by": null,
    "file_bast_pbp_verification_at": "2026-01-09T14:45:30.518Z",
    "file_bast_pengganti_verification_at": null,
    "file_bast_khusus_kolektif_verification_at": null,
    "file_bast_perwakilan_verification_at": "2026-01-09T14:45:29.065Z",
    "file_sptjm_verification_at": null,
    "file_sptjm_khusus_kolektif_verification_at": null,
    "file_perwakilan_pbp_khusus_kolektif_verification_at": null,
    "file_bast_pbp_verification_by_user": {
      "name": "KANTOR CABANG TEGAL"
    },
    "file_bast_pengganti_verification_by_user": null,
    "file_bast_khusus_kolektif_verification_by_user": null,
    "file_bast_perwakilan_verification_by_user": {
      "name": "KANTOR CABANG TEGAL"
    },
    "file_sptjm_verification_by_user": null,
    "file_sptjm_khusus_kolektif_verification_by_user": null,
    "file_perwakilan_pbp_khusus_kolektif_verification_by_user": null,
    "verifikasi_by_user": null,
    "history_verification_document": [],
    "file_logo": "/uploads/transporter/JPL logo.png"
  }
}
```
