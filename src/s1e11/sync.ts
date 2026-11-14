// OTOMATIS dari scripts/retime.mjs build S1E11 (jangan diedit tangan; ubah src/s1e11/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Kapan waktu tepat untuk tes HIV?",
  "sa": 0,
  "sb": 2.2,
  "a": 0,
  "b": 2.2,
  "clauses": [
   {
    "text": "Kapan waktu tepat untuk tes HIV?",
    "a": 0,
    "b": 2.2,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Bayangkan seperti pemeriksaan kendaraan.",
  "sa": 2.76,
  "sb": 5.04,
  "a": 3.2,
  "b": 5.48,
  "clauses": [
   {
    "text": "Bayangkan seperti pemeriksaan kendaraan.",
    "a": 3.2,
    "b": 5.48,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Ada pemeriksaan rutin dan pemeriksaan setelah kejadian tertentu.",
  "sa": 5.35,
  "sb": 9.49,
  "a": 6.38,
  "b": 10.52,
  "clauses": [
   {
    "text": "Ada pemeriksaan rutin dan pemeriksaan setelah kejadian tertentu.",
    "a": 6.38,
    "b": 10.52,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Tes HIV pun begitu.",
  "sa": 9.83,
  "sb": 11.34,
  "a": 11.12,
  "b": 12.63,
  "clauses": [
   {
    "text": "Tes HIV pun begitu.",
    "a": 11.12,
    "b": 12.63,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Pertama, setelah kontak berisiko.",
  "sa": 11.8,
  "sb": 14.13,
  "a": 13.53,
  "b": 15.86,
  "clauses": [
   {
    "text": "Pertama,",
    "a": 13.53,
    "b": 14.14,
    "anchored": true
   },
   {
    "text": "setelah kontak berisiko.",
    "a": 14.32,
    "b": 15.86,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Jika belum lewat 72 jam, segera konsultasikan PEP, obat pencegahan darurat.",
  "sa": 14.45,
  "sb": 20.08,
  "a": 16.36,
  "b": 21.99,
  "clauses": [
   {
    "text": "Jika belum lewat 72 jam,",
    "a": 16.36,
    "b": 18.41,
    "anchored": true
   },
   {
    "text": "segera konsultasikan PEP,",
    "a": 18.58,
    "b": 20.36,
    "anchored": true
   },
   {
    "text": "obat pencegahan darurat.",
    "a": 20.67,
    "b": 21.99,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Tes dilakukan sesuai masa jendela, yaitu waktu hingga tes mampu mendeteksi virus.",
  "sa": 20.54,
  "sb": 26.21,
  "a": 23.39,
  "b": 29.06,
  "clauses": [
   {
    "text": "Tes dilakukan sesuai masa jendela,",
    "a": 23.39,
    "b": 25.37,
    "anchored": true
   },
   {
    "text": "yaitu waktu hingga tes mampu mendeteksi virus.",
    "a": 25.62,
    "b": 29.06,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Kedua, secara berkala jika risiko berlanjut.",
  "sa": 26.61,
  "sb": 29.82,
  "a": 30.36,
  "b": 33.57,
  "clauses": [
   {
    "text": "Kedua,",
    "a": 30.36,
    "b": 30.87,
    "anchored": true
   },
   {
    "text": "secara berkala jika risiko berlanjut.",
    "a": 31.21,
    "b": 33.57,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Pengguna PrEP biasanya perlu tes setiap tiga bulan.",
  "sa": 30.2,
  "sb": 33.51,
  "a": 34.07,
  "b": 37.38,
  "clauses": [
   {
    "text": "Pengguna PrEP biasanya perlu tes setiap tiga bulan.",
    "a": 34.07,
    "b": 37.38,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Ketiga, saat hamil, mengalami gejala yang mengarah ke HIV, atau didiagnosis TBC.",
  "sa": 33.9,
  "sb": 40.19,
  "a": 38.58,
  "b": 44.87,
  "clauses": [
   {
    "text": "Ketiga,",
    "a": 38.58,
    "b": 39.16,
    "anchored": true
   },
   {
    "text": "saat hamil,",
    "a": 39.4,
    "b": 40.2,
    "anchored": true
   },
   {
    "text": "mengalami gejala yang mengarah ke HIV,",
    "a": 40.53,
    "b": 42.48,
    "anchored": false
   },
   {
    "text": "atau didiagnosis TBC.",
    "a": 42.48,
    "b": 44.87,
    "anchored": false
   }
  ]
 },
 {
  "n": 11,
  "text": "CDC juga menganjurkan setiap orang berusia 13–64 tahun tes setidaknya sekali.",
  "sa": 40.57,
  "sb": 45.57,
  "a": 46.07,
  "b": 51.07,
  "clauses": [
   {
    "text": "CDC juga menganjurkan setiap orang berusia 13–64 tahun tes setidaknya sekali.",
    "a": 46.07,
    "b": 51.07,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Mengapa penting?",
  "sa": 45.74,
  "sb": 46.97,
  "a": 52.07,
  "b": 53.3,
  "clauses": [
   {
    "text": "Mengapa penting?",
    "a": 52.07,
    "b": 53.3,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "Pada 2025, menurut perkiraan Kemenkes, baru sekitar 68 persen orang dengan HIV di Indonesia mengetahui statusnya.",
  "sa": 47.49,
  "sb": 57.76,
  "a": 54.2,
  "b": 64.47,
  "clauses": [
   {
    "text": "Pada 2025,",
    "a": 54.2,
    "b": 55.02,
    "anchored": true
   },
   {
    "text": "menurut perkiraan Kemenkes,",
    "a": 55.47,
    "b": 56.95,
    "anchored": true
   },
   {
    "text": "baru sekitar 68 persen orang dengan HIV di Indonesia mengetahui statusnya.",
    "a": 57.12,
    "b": 64.47,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Hasil negatif yang terlalu dini belum tentu memastikan seseorang bebas HIV.",
  "sa": 58.16,
  "sb": 62.97,
  "a": 66.07,
  "b": 70.88,
  "clauses": [
   {
    "text": "Hasil negatif yang terlalu dini belum tentu memastikan seseorang bebas HIV.",
    "a": 66.07,
    "b": 70.88,
    "anchored": true
   }
  ]
 },
 {
  "n": 15,
  "text": "Tes perlu diulang setelah masa jendela berakhir.",
  "sa": 63.53,
  "sb": 66.23,
  "a": 72.08,
  "b": 74.78,
  "clauses": [
   {
    "text": "Tes perlu diulang setelah masa jendela berakhir.",
    "a": 72.08,
    "b": 74.78,
    "anchored": true
   }
  ]
 },
 {
  "n": 16,
  "text": "Tes tersedia di puskesmas, rumah sakit, klinik, dan layanan komunitas.",
  "sa": 66.68,
  "sb": 71.47,
  "a": 75.78,
  "b": 80.57,
  "clauses": [
   {
    "text": "Tes tersedia di puskesmas,",
    "a": 75.78,
    "b": 77.47,
    "anchored": true
   },
   {
    "text": "rumah sakit,",
    "a": 77.64,
    "b": 78.3,
    "anchored": true
   },
   {
    "text": "klinik,",
    "a": 78.69,
    "b": 79.01,
    "anchored": true
   },
   {
    "text": "dan layanan komunitas.",
    "a": 79.17,
    "b": 80.57,
    "anchored": true
   }
  ]
 },
 {
  "n": 17,
  "text": "Semakin cepat mengetahui status, semakin cepat ARV dimulai.",
  "sa": 71.84,
  "sb": 75.87,
  "a": 81.17,
  "b": 85.2,
  "clauses": [
   {
    "text": "Semakin cepat mengetahui status,",
    "a": 81.17,
    "b": 83.1,
    "anchored": true
   },
   {
    "text": "semakin cepat ARV dimulai.",
    "a": 83.26,
    "b": 85.2,
    "anchored": true
   }
  ]
 },
 {
  "n": 18,
  "text": "Jadi, jangan tunggu sakit untuk tes HIV.",
  "sa": 76.25,
  "sb": 79.05,
  "a": 86.2,
  "b": 89,
  "clauses": [
   {
    "text": "Jadi,",
    "a": 86.2,
    "b": 86.32,
    "anchored": false
   },
   {
    "text": "jangan tunggu sakit untuk tes HIV.",
    "a": 86.32,
    "b": 89,
    "anchored": false
   }
  ]
 },
 {
  "n": 19,
  "text": "Seperti kendaraan, jangan tunggu rusak untuk diperiksa.",
  "sa": 79.47,
  "sb": 82.6,
  "a": 90.2,
  "b": 93.33,
  "clauses": [
   {
    "text": "Seperti kendaraan,",
    "a": 90.2,
    "b": 91.28,
    "anchored": true
   },
   {
    "text": "jangan tunggu rusak untuk diperiksa.",
    "a": 91.46,
    "b": 93.33,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 93.33; // akhir ucapan terakhir (waktu video)
export const TAIL = 6; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 99.33;
