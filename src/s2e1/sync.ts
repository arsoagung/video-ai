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
  "sb": 8.94,
  "a": 4.78,
  "b": 8.79,
  "clauses": [
   {
    "text": "Dokter mengatakan,",
    "a": 4.78,
    "b": 5.83,
    "anchored": true
   },
   {
    "text": "hasil pemeriksaanmu positif HIV.",
    "a": 6.31,
    "b": 8.79,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Pikiranmu mendadak penuh.",
  "sa": 9.48,
  "sb": 10.87,
  "a": 9.69,
  "b": 11.08,
  "clauses": [
   {
    "text": "Pikiranmu mendadak penuh.",
    "a": 9.69,
    "b": 11.08,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Bukan hanya soal kesehatanmu, tetapi juga keluarga, teman, dan orang-orang di sekitarmu.",
  "sa": 11.36,
  "sb": 17.01,
  "a": 11.53,
  "b": 17.18,
  "clauses": [
   {
    "text": "Bukan hanya soal kesehatanmu,",
    "a": 11.53,
    "b": 13.03,
    "anchored": true
   },
   {
    "text": "tetapi juga keluarga,",
    "a": 13.3,
    "b": 14.91,
    "anchored": true
   },
   {
    "text": "teman,",
    "a": 15.12,
    "b": 15.36,
    "anchored": false
   },
   {
    "text": "dan orang-orang di sekitarmu.",
    "a": 15.36,
    "b": 17.18,
    "anchored": false
   }
  ]
 },
 {
  "n": 5,
  "text": "Bagaimana kalau mereka tahu?",
  "sa": 17.41,
  "sb": 18.75,
  "a": 17.63,
  "b": 18.97,
  "clauses": [
   {
    "text": "Bagaimana kalau mereka tahu?",
    "a": 17.63,
    "b": 18.97,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Bagaimana kalau mereka menjauh?",
  "sa": 19.24,
  "sb": 20.9,
  "a": 19.27,
  "b": 20.93,
  "clauses": [
   {
    "text": "Bagaimana kalau mereka menjauh?",
    "a": 19.27,
    "b": 20.93,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Kadang, yang paling menakutkan bukan hanya virusnya, tetapi kehilangan penerimaan dari orang lain.",
  "sa": 21.31,
  "sb": 27.43,
  "a": 21.43,
  "b": 27.55,
  "clauses": [
   {
    "text": "Kadang,",
    "a": 21.43,
    "b": 21.97,
    "anchored": true
   },
   {
    "text": "yang paling menakutkan bukan hanya virusnya,",
    "a": 22.34,
    "b": 24.82,
    "anchored": true
   },
   {
    "text": "tetapi kehilangan penerimaan dari orang lain.",
    "a": 25.25,
    "b": 27.55,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Padahal, diagnosis HIV bukan akhir kehidupan.",
  "sa": 27.97,
  "sb": 31.45,
  "a": 28.45,
  "b": 31.93,
  "clauses": [
   {
    "text": "Padahal,",
    "a": 28.45,
    "b": 29.11,
    "anchored": true
   },
   {
    "text": "diagnosis HIV bukan akhir kehidupan.",
    "a": 29.29,
    "b": 31.93,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Dengan pengobatan antiretroviral atau ARV secara rutin, HIV dapat dikendalikan.",
  "sa": 31.76,
  "sb": 37.52,
  "a": 32.38,
  "b": 38.14,
  "clauses": [
   {
    "text": "Dengan pengobatan antiretroviral atau ARV secara rutin,",
    "a": 32.38,
    "b": 36.12,
    "anchored": true
   },
   {
    "text": "HIV dapat dikendalikan.",
    "a": 36.29,
    "b": 38.14,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Jumlah virus dalam darah bisa ditekan hingga tidak terdeteksi.",
  "sa": 37.83,
  "sb": 41.31,
  "a": 38.59,
  "b": 42.07,
  "clauses": [
   {
    "text": "Jumlah virus dalam darah bisa ditekan hingga tidak terdeteksi.",
    "a": 38.59,
    "b": 42.07,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Ketika jumlah virus dalam darah berhasil ditekan dan dipertahankan hingga tidak terdeteksi, HIV tidak lagi dapat ditularkan kepada orang lain.",
  "sa": 41.62,
  "sb": 50.12,
  "a": 42.57,
  "b": 51.07,
  "clauses": [
   {
    "text": "Ketika jumlah virus dalam darah berhasil ditekan dan dipertahankan hingga tidak terdeteksi,",
    "a": 42.57,
    "b": 47.68,
    "anchored": true
   },
   {
    "text": "HIV tidak lagi dapat ditularkan kepada orang lain.",
    "a": 47.88,
    "b": 51.07,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Kamu tetap bisa bangun pagi, berangkat kerja, dan tertawa di meja makan bersama orang yang kamu sayang.",
  "sa": 50.42,
  "sb": 56.58,
  "a": 51.87,
  "b": 58.03,
  "clauses": [
   {
    "text": "Kamu tetap bisa bangun pagi,",
    "a": 51.87,
    "b": 53.48,
    "anchored": false
   },
   {
    "text": "berangkat kerja,",
    "a": 53.48,
    "b": 54.44,
    "anchored": false
   },
   {
    "text": "dan tertawa di meja makan bersama orang yang kamu sayang.",
    "a": 54.44,
    "b": 58.03,
    "anchored": false
   }
  ]
 },
 {
  "n": 13,
  "text": "HIV adalah persoalan kesehatan yang butuh pengobatan, bukan alasan untuk menghakimi orang.",
  "sa": 56.88,
  "sb": 62.6,
  "a": 58.48,
  "b": 64.2,
  "clauses": [
   {
    "text": "HIV adalah persoalan kesehatan yang butuh pengobatan,",
    "a": 58.48,
    "b": 61.83,
    "anchored": true
   },
   {
    "text": "bukan alasan untuk menghakimi orang.",
    "a": 62.16,
    "b": 64.2,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Karena yang perlu kita lawan adalah virusnya, bukan manusianya.",
  "sa": 62.88,
  "sb": 66.8,
  "a": 64.8,
  "b": 68.72,
  "clauses": [
   {
    "text": "Karena yang perlu kita lawan adalah virusnya,",
    "a": 64.8,
    "b": 67.33,
    "anchored": true
   },
   {
    "text": "bukan manusianya.",
    "a": 67.67,
    "b": 68.72,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 68.72; // akhir ucapan terakhir (waktu video)
export const TAIL = 8; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 76.72;
