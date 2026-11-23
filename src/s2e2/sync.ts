// OTOMATIS dari scripts/retime.mjs build S2E2 (jangan diedit tangan; ubah src/s2e2/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Hasil tes HIV-mu positif?",
  "sa": 0,
  "sb": 1.82,
  "a": 0,
  "b": 1.82,
  "clauses": [
   {
    "text": "Hasil tes HIV-mu positif?",
    "a": 0,
    "b": 1.82,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Harus gimana?",
  "sa": 2.2,
  "sb": 3.02,
  "a": 2.52,
  "b": 3.34,
  "clauses": [
   {
    "text": "Harus gimana?",
    "a": 2.52,
    "b": 3.34,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Ini yang biasanya terjadi.",
  "sa": 3.49,
  "sb": 5.02,
  "a": 4.04,
  "b": 5.57,
  "clauses": [
   {
    "text": "Ini yang biasanya terjadi.",
    "a": 4.04,
    "b": 5.57,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Kamu akan diminta untuk minum ARV setiap hari.",
  "sa": 5.4,
  "sb": 8.37,
  "a": 6.77,
  "b": 9.74,
  "clauses": [
   {
    "text": "Kamu akan diminta untuk minum ARV setiap hari.",
    "a": 6.77,
    "b": 9.74,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Jumlah virus di darahmu akan dipantau secara berkala.",
  "sa": 8.68,
  "sb": 11.73,
  "a": 10.44,
  "b": 13.49,
  "clauses": [
   {
    "text": "Jumlah virus di darahmu akan dipantau secara berkala.",
    "a": 10.44,
    "b": 13.49,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "ARV akan menekan replikasi virus, bukan menghapusnya.",
  "sa": 12.06,
  "sb": 15.82,
  "a": 14.19,
  "b": 17.95,
  "clauses": [
   {
    "text": "ARV akan menekan replikasi virus,",
    "a": 14.19,
    "b": 16.69,
    "anchored": true
   },
   {
    "text": "bukan menghapusnya.",
    "a": 16.83,
    "b": 17.95,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Umumnya dalam satu sampai enam bulan, virus turun sampai tidak terdeteksi.",
  "sa": 16.14,
  "sb": 21.15,
  "a": 18.65,
  "b": 23.66,
  "clauses": [
   {
    "text": "Umumnya dalam satu sampai enam bulan,",
    "a": 18.65,
    "b": 21,
    "anchored": true
   },
   {
    "text": "virus turun sampai tidak terdeteksi.",
    "a": 21.34,
    "b": 23.66,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Setelah sekitar enam bulan minum ARV rutin dan hasil tes viral load tidak terdeteksi, kamu tidak menularkan virus ke pasanganmu, selama ARV tetap rutin diminum.",
  "sa": 21.55,
  "sb": 32.12,
  "a": 24.86,
  "b": 35.43,
  "clauses": [
   {
    "text": "Setelah sekitar enam bulan minum ARV rutin dan hasil tes viral load tidak terdeteksi,",
    "a": 24.86,
    "b": 30.05,
    "anchored": true
   },
   {
    "text": "kamu tidak menularkan virus ke pasanganmu,",
    "a": 30.47,
    "b": 32.73,
    "anchored": true
   },
   {
    "text": "selama ARV tetap rutin diminum.",
    "a": 33.06,
    "b": 35.43,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Istilahnya U sama dengan U.",
  "sa": 32.44,
  "sb": 34.62,
  "a": 36.63,
  "b": 38.81,
  "clauses": [
   {
    "text": "Istilahnya U sama dengan U.",
    "a": 36.63,
    "b": 38.81,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Di fasilitas pemerintah, ARV gratis lewat jalur program Kemenkes.",
  "sa": 34.91,
  "sb": 39.29,
  "a": 39.91,
  "b": 44.29,
  "clauses": [
   {
    "text": "Di fasilitas pemerintah,",
    "a": 39.91,
    "b": 41.3,
    "anchored": true
   },
   {
    "text": "ARV gratis lewat jalur program Kemenkes.",
    "a": 41.47,
    "b": 44.29,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Statusmu dirahasiakan, itu prinsip layanan tes HIV.",
  "sa": 39.56,
  "sb": 43.39,
  "a": 44.89,
  "b": 48.72,
  "clauses": [
   {
    "text": "Statusmu dirahasiakan,",
    "a": 44.89,
    "b": 46.92,
    "anchored": true
   },
   {
    "text": "itu prinsip layanan tes HIV.",
    "a": 47.05,
    "b": 48.72,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Aturan Kemenkes juga menargetkan penghapusan stigma dan diskriminasi.",
  "sa": 43.65,
  "sb": 47.84,
  "a": 49.42,
  "b": 53.61,
  "clauses": [
   {
    "text": "Aturan Kemenkes juga menargetkan penghapusan stigma dan diskriminasi.",
    "a": 49.42,
    "b": 53.61,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "Kalau minum ARV secara rutin, kamu masih bisa hidup normal.",
  "sa": 48.19,
  "sb": 51.88,
  "a": 54.41,
  "b": 58.1,
  "clauses": [
   {
    "text": "Kalau minum ARV secara rutin,",
    "a": 54.41,
    "b": 56.28,
    "anchored": true
   },
   {
    "text": "kamu masih bisa hidup normal.",
    "a": 56.43,
    "b": 58.1,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Jadi hasil positif bukan akhir.",
  "sa": 52.17,
  "sb": 54.55,
  "a": 58.9,
  "b": 61.28,
  "clauses": [
   {
    "text": "Jadi hasil positif bukan akhir.",
    "a": 58.9,
    "b": 61.28,
    "anchored": true
   }
  ]
 },
 {
  "n": 15,
  "text": "Itu awal perawatan, dan kamu tidak sendirian.",
  "sa": 54.88,
  "sb": 58.49,
  "a": 62.38,
  "b": 65.99,
  "clauses": [
   {
    "text": "Itu awal perawatan,",
    "a": 62.38,
    "b": 63.86,
    "anchored": true
   },
   {
    "text": "dan kamu tidak sendirian.",
    "a": 64.17,
    "b": 65.99,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 65.99; // akhir ucapan terakhir (waktu video)
export const TAIL = 8; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 73.99;
