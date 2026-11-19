// OTOMATIS dari scripts/retime.mjs build S2E1 (jangan diedit tangan; ubah src/s2e1/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Kamu baru saja menerima diagnosis yang mengubah cara pandangmu terhadap hidup.",
  "sa": 0,
  "sb": 4.33,
  "a": 0,
  "b": 4.33,
  "clauses": [
   {
    "text": "Kamu baru saja menerima diagnosis yang mengubah cara pandangmu terhadap hidup.",
    "a": 0,
    "b": 4.33,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Dokter mengatakan, hasil pemeriksaanmu positif HIV.",
  "sa": 4.93,
  "sb": 8.88,
  "a": 5.53,
  "b": 9.48,
  "clauses": [
   {
    "text": "Dokter mengatakan,",
    "a": 5.53,
    "b": 6.57,
    "anchored": true
   },
   {
    "text": "hasil pemeriksaanmu positif HIV.",
    "a": 7.06,
    "b": 9.48,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Pikiranmu mendadak penuh.",
  "sa": 9.48,
  "sb": 10.81,
  "a": 11.08,
  "b": 12.41,
  "clauses": [
   {
    "text": "Pikiranmu mendadak penuh.",
    "a": 11.08,
    "b": 12.41,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Bukan hanya soal kesehatanmu, tetapi juga keluarga, teman, dan orang-orang di sekitarmu.",
  "sa": 11.36,
  "sb": 18.74,
  "a": 13.21,
  "b": 20.59,
  "clauses": [
   {
    "text": "Bukan hanya soal kesehatanmu,",
    "a": 13.21,
    "b": 15.5,
    "anchored": false
   },
   {
    "text": "tetapi juga keluarga,",
    "a": 15.5,
    "b": 18.02,
    "anchored": false
   },
   {
    "text": "teman,",
    "a": 18.02,
    "b": 18.39,
    "anchored": false
   },
   {
    "text": "dan orang-orang di sekitarmu.",
    "a": 18.39,
    "b": 20.59,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Bagaimana kalau mereka tahu?",
  "sa": 19.24,
  "sb": 20.86,
  "a": 21.29,
  "b": 22.91,
  "clauses": [
   {
    "text": "Bagaimana kalau mereka tahu?",
    "a": 21.29,
    "b": 22.91,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Bagaimana kalau mereka menjauh?",
  "sa": 21.32,
  "sb": 23.13,
  "a": 23.41,
  "b": 25.22,
  "clauses": [
   {
    "text": "Bagaimana kalau mereka menjauh?",
    "a": 23.41,
    "b": 25.22,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Kadang, yang paling menakutkan bukan hanya virusnya, tetapi kehilangan penerimaan dari orang lain.",
  "sa": 23.28,
  "sb": 28.62,
  "a": 26.62,
  "b": 31.96,
  "clauses": [
   {
    "text": "Kadang,",
    "a": 26.62,
    "b": 27.08,
    "anchored": false
   },
   {
    "text": "yang paling menakutkan bukan hanya virusnya,",
    "a": 27.08,
    "b": 29.19,
    "anchored": false
   },
   {
    "text": "tetapi kehilangan penerimaan dari orang lain.",
    "a": 29.19,
    "b": 31.96,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Padahal, diagnosis HIV bukan akhir kehidupan.",
  "sa": 29,
  "sb": 31.44,
  "a": 33.76,
  "b": 36.2,
  "clauses": [
   {
    "text": "Padahal,",
    "a": 33.76,
    "b": 34.11,
    "anchored": false
   },
   {
    "text": "diagnosis HIV bukan akhir kehidupan.",
    "a": 34.11,
    "b": 36.2,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Dengan pengobatan antiretroviral atau ARV secara rutin, HIV dapat dikendalikan.",
  "sa": 31.76,
  "sb": 37.51,
  "a": 37.4,
  "b": 43.15,
  "clauses": [
   {
    "text": "Dengan pengobatan antiretroviral atau ARV secara rutin,",
    "a": 37.4,
    "b": 40.77,
    "anchored": true
   },
   {
    "text": "HIV dapat dikendalikan.",
    "a": 40.9,
    "b": 43.15,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Jumlah virus dalam darah bisa ditekan hingga tidak terdeteksi.",
  "sa": 37.83,
  "sb": 41.29,
  "a": 43.75,
  "b": 47.21,
  "clauses": [
   {
    "text": "Jumlah virus dalam darah bisa ditekan hingga tidak terdeteksi.",
    "a": 43.75,
    "b": 47.21,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Ketika jumlah virus dalam darah berhasil ditekan dan dipertahankan hingga tidak terdeteksi, HIV tidak lagi dapat ditularkan kepada orang lain.",
  "sa": 41.63,
  "sb": 50.11,
  "a": 48.41,
  "b": 56.89,
  "clauses": [
   {
    "text": "Ketika jumlah virus dalam darah berhasil ditekan dan dipertahankan hingga tidak terdeteksi,",
    "a": 48.41,
    "b": 53.51,
    "anchored": true
   },
   {
    "text": "HIV tidak lagi dapat ditularkan kepada orang lain.",
    "a": 53.89,
    "b": 56.89,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Kamu tetap bisa bangun pagi, berangkat kerja, dan tertawa di meja makan bersama orang yang kamu sayang.",
  "sa": 50.43,
  "sb": 56.57,
  "a": 58.49,
  "b": 64.63,
  "clauses": [
   {
    "text": "Kamu tetap bisa bangun pagi,",
    "a": 58.49,
    "b": 59.8,
    "anchored": false
   },
   {
    "text": "berangkat kerja,",
    "a": 59.8,
    "b": 60.69,
    "anchored": true
   },
   {
    "text": "dan tertawa di meja makan bersama orang yang kamu sayang.",
    "a": 60.82,
    "b": 64.63,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "HIV adalah persoalan kesehatan yang butuh pengobatan, bukan alasan untuk menghakimi orang.",
  "sa": 56.89,
  "sb": 62.59,
  "a": 66.03,
  "b": 71.73,
  "clauses": [
   {
    "text": "HIV adalah persoalan kesehatan yang butuh pengobatan,",
    "a": 66.03,
    "b": 69.35,
    "anchored": true
   },
   {
    "text": "bukan alasan untuk menghakimi orang.",
    "a": 69.71,
    "b": 71.73,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Karena yang perlu kita lawan adalah virusnya, bukan manusianya.",
  "sa": 62.89,
  "sb": 66.8,
  "a": 72.73,
  "b": 76.64,
  "clauses": [
   {
    "text": "Karena yang perlu kita lawan adalah virusnya,",
    "a": 72.73,
    "b": 74.91,
    "anchored": false
   },
   {
    "text": "bukan manusianya.",
    "a": 74.91,
    "b": 76.64,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 76.64; // akhir ucapan terakhir (waktu video)
export const TAIL = 8; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 84.64;
