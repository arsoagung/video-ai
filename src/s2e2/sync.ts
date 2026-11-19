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
  "a": 2.17,
  "b": 2.99,
  "clauses": [
   {
    "text": "Harus gimana?",
    "a": 2.17,
    "b": 2.99,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Ini yang biasanya terjadi.",
  "sa": 3.49,
  "sb": 5.02,
  "a": 3.34,
  "b": 4.87,
  "clauses": [
   {
    "text": "Ini yang biasanya terjadi.",
    "a": 3.34,
    "b": 4.87,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Kamu akan diminta untuk minum ARV setiap hari.",
  "sa": 5.4,
  "sb": 8.37,
  "a": 5.67,
  "b": 8.64,
  "clauses": [
   {
    "text": "Kamu akan diminta untuk minum ARV setiap hari.",
    "a": 5.67,
    "b": 8.64,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Jumlah virus di darahmu akan dipantau secara berkala.",
  "sa": 8.68,
  "sb": 11.73,
  "a": 9.04,
  "b": 12.09,
  "clauses": [
   {
    "text": "Jumlah virus di darahmu akan dipantau secara berkala.",
    "a": 9.04,
    "b": 12.09,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "ARV akan menekan replikasi virus, bukan menghapusnya.",
  "sa": 12.06,
  "sb": 15.82,
  "a": 12.44,
  "b": 16.2,
  "clauses": [
   {
    "text": "ARV akan menekan replikasi virus,",
    "a": 12.44,
    "b": 14.94,
    "anchored": true
   },
   {
    "text": "bukan menghapusnya.",
    "a": 15.08,
    "b": 16.2,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Umumnya dalam satu sampai enam bulan, virus turun sampai tidak terdeteksi.",
  "sa": 16.14,
  "sb": 21.15,
  "a": 16.6,
  "b": 21.61,
  "clauses": [
   {
    "text": "Umumnya dalam satu sampai enam bulan,",
    "a": 16.6,
    "b": 18.95,
    "anchored": true
   },
   {
    "text": "virus turun sampai tidak terdeteksi.",
    "a": 19.29,
    "b": 21.61,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Setelah sekitar enam bulan minum ARV rutin dan hasil tes viral load tidak terdeteksi, kamu tidak menularkan virus ke pasanganmu, selama ARV tetap rutin diminum.",
  "sa": 21.55,
  "sb": 32.12,
  "a": 22.41,
  "b": 32.98,
  "clauses": [
   {
    "text": "Setelah sekitar enam bulan minum ARV rutin dan hasil tes viral load tidak terdeteksi,",
    "a": 22.41,
    "b": 27.6,
    "anchored": true
   },
   {
    "text": "kamu tidak menularkan virus ke pasanganmu,",
    "a": 28.02,
    "b": 30.28,
    "anchored": true
   },
   {
    "text": "selama ARV tetap rutin diminum.",
    "a": 30.61,
    "b": 32.98,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Istilahnya U sama dengan U.",
  "sa": 32.44,
  "sb": 34.62,
  "a": 33.78,
  "b": 35.96,
  "clauses": [
   {
    "text": "Istilahnya U sama dengan U.",
    "a": 33.78,
    "b": 35.96,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Di fasilitas pemerintah, ARV gratis lewat jalur program Kemenkes.",
  "sa": 34.91,
  "sb": 39.29,
  "a": 36.31,
  "b": 40.69,
  "clauses": [
   {
    "text": "Di fasilitas pemerintah,",
    "a": 36.31,
    "b": 37.7,
    "anchored": true
   },
   {
    "text": "ARV gratis lewat jalur program Kemenkes.",
    "a": 37.87,
    "b": 40.69,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Statusmu dirahasiakan, itu prinsip layanan tes HIV.",
  "sa": 39.56,
  "sb": 43.39,
  "a": 40.99,
  "b": 44.82,
  "clauses": [
   {
    "text": "Statusmu dirahasiakan,",
    "a": 40.99,
    "b": 43.02,
    "anchored": true
   },
   {
    "text": "itu prinsip layanan tes HIV.",
    "a": 43.15,
    "b": 44.82,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Aturan Kemenkes juga menargetkan penghapusan stigma dan diskriminasi.",
  "sa": 43.65,
  "sb": 47.84,
  "a": 45.12,
  "b": 49.31,
  "clauses": [
   {
    "text": "Aturan Kemenkes juga menargetkan penghapusan stigma dan diskriminasi.",
    "a": 45.12,
    "b": 49.31,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "Kalau minum ARV secara rutin, kamu masih bisa hidup normal.",
  "sa": 48.19,
  "sb": 51.88,
  "a": 49.71,
  "b": 53.4,
  "clauses": [
   {
    "text": "Kalau minum ARV secara rutin,",
    "a": 49.71,
    "b": 51.58,
    "anchored": true
   },
   {
    "text": "kamu masih bisa hidup normal.",
    "a": 51.73,
    "b": 53.4,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Jadi hasil positif bukan akhir.",
  "sa": 52.17,
  "sb": 54.55,
  "a": 53.85,
  "b": 56.23,
  "clauses": [
   {
    "text": "Jadi hasil positif bukan akhir.",
    "a": 53.85,
    "b": 56.23,
    "anchored": true
   }
  ]
 },
 {
  "n": 15,
  "text": "Itu awal perawatan, dan kamu tidak sendirian.",
  "sa": 54.88,
  "sb": 58.49,
  "a": 56.53,
  "b": 60.14,
  "clauses": [
   {
    "text": "Itu awal perawatan,",
    "a": 56.53,
    "b": 58.01,
    "anchored": true
   },
   {
    "text": "dan kamu tidak sendirian.",
    "a": 58.32,
    "b": 60.14,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 60.14; // akhir ucapan terakhir (waktu video)
export const TAIL = 8; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 68.14;
