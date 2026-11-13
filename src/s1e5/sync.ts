// OTOMATIS dari scripts/retime.mjs build S1E5 (jangan diedit tangan; ubah src/s1e5/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Bagaimana kalau virus yang sudah berhasil ditekan, kembali memperbanyak diri hanya karena obat tidak diminum teratur?",
  "sa": 0,
  "sb": 7.05,
  "a": 0,
  "b": 7.05,
  "clauses": [
   {
    "text": "Bagaimana kalau virus yang sudah berhasil ditekan,",
    "a": 0,
    "b": 2.9,
    "anchored": true
   },
   {
    "text": "kembali memperbanyak diri hanya karena obat tidak diminum teratur?",
    "a": 3.08,
    "b": 7.05,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Itulah salah satu alasan mengapa ARV harus diminum rutin.",
  "sa": 7.49,
  "sb": 11.66,
  "a": 8.25,
  "b": 12.42,
  "clauses": [
   {
    "text": "Itulah salah satu alasan mengapa ARV harus diminum rutin.",
    "a": 8.25,
    "b": 12.42,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Bayangkan ARV seperti persediaan yang menjaga pertahanan tubuh tetap bekerja.",
  "sa": 12.09,
  "sb": 17.13,
  "a": 13.32,
  "b": 18.36,
  "clauses": [
   {
    "text": "Bayangkan ARV seperti persediaan yang menjaga pertahanan tubuh tetap bekerja.",
    "a": 13.32,
    "b": 18.36,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Obat ini menghambat proses yang digunakan HIV untuk membuat salinan dirinya.",
  "sa": 17.5,
  "sb": 22.26,
  "a": 18.81,
  "b": 23.57,
  "clauses": [
   {
    "text": "Obat ini menghambat proses yang digunakan HIV untuk membuat salinan dirinya.",
    "a": 18.81,
    "b": 23.57,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Setelah diminum, obat diserap tubuh dan mulai bekerja.",
  "sa": 22.64,
  "sb": 26.32,
  "a": 24.87,
  "b": 28.55,
  "clauses": [
   {
    "text": "Setelah diminum,",
    "a": 24.87,
    "b": 25.84,
    "anchored": true
   },
   {
    "text": "obat diserap tubuh dan mulai bekerja.",
    "a": 26.03,
    "b": 28.55,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Tubuh perlahan membuang obat sehingga kadarnya menurun.",
  "sa": 26.67,
  "sb": 29.89,
  "a": 29,
  "b": 32.22,
  "clauses": [
   {
    "text": "Tubuh perlahan membuang obat sehingga kadarnya menurun.",
    "a": 29,
    "b": 32.22,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Lalu dosis berikutnya menjaga kadar obat tetap cukup untuk menghambat virus.",
  "sa": 30.24,
  "sb": 35.15,
  "a": 33.22,
  "b": 38.13,
  "clauses": [
   {
    "text": "Lalu dosis berikutnya menjaga kadar obat tetap cukup untuk menghambat virus.",
    "a": 33.22,
    "b": 38.13,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Kalau dosis sering terlewat, perlindungan obat bisa melemah.",
  "sa": 35.47,
  "sb": 39.03,
  "a": 38.58,
  "b": 42.14,
  "clauses": [
   {
    "text": "Kalau dosis sering terlewat,",
    "a": 38.58,
    "b": 40,
    "anchored": true
   },
   {
    "text": "perlindungan obat bisa melemah.",
    "a": 40.41,
    "b": 42.14,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "HIV berpeluang memperbanyak diri kembali.",
  "sa": 39.36,
  "sb": 41.85,
  "a": 42.59,
  "b": 45.08,
  "clauses": [
   {
    "text": "HIV berpeluang memperbanyak diri kembali.",
    "a": 42.59,
    "b": 45.08,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Dalam kondisi tertentu, virus yang lebih tahan terhadap obat juga bisa berkembang.",
  "sa": 42.17,
  "sb": 47.11,
  "a": 46.48,
  "b": 51.42,
  "clauses": [
   {
    "text": "Dalam kondisi tertentu,",
    "a": 46.48,
    "b": 47.81,
    "anchored": true
   },
   {
    "text": "virus yang lebih tahan terhadap obat juga bisa berkembang.",
    "a": 48.14,
    "b": 51.42,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Bukan berarti sekali lupa langsung membuat virus kebal.",
  "sa": 47.42,
  "sb": 50.65,
  "a": 51.87,
  "b": 55.1,
  "clauses": [
   {
    "text": "Bukan berarti sekali lupa langsung membuat virus kebal.",
    "a": 51.87,
    "b": 55.1,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Tetapi kebiasaan melewatkan obat dapat meningkatkan risiko kegagalan pengobatan.",
  "sa": 50.91,
  "sb": 56.01,
  "a": 55.55,
  "b": 60.65,
  "clauses": [
   {
    "text": "Tetapi kebiasaan melewatkan obat dapat meningkatkan risiko kegagalan pengobatan.",
    "a": 55.55,
    "b": 60.65,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "Karena itu, ARV harus diminum sesuai jadwal.",
  "sa": 56.34,
  "sb": 59.94,
  "a": 61.1,
  "b": 64.7,
  "clauses": [
   {
    "text": "Karena itu,",
    "a": 61.1,
    "b": 62.06,
    "anchored": true
   },
   {
    "text": "ARV harus diminum sesuai jadwal.",
    "a": 62.21,
    "b": 64.7,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Bukan karena obat harus selalu ada setiap detik, tetapi karena kadar obat perlu dijaga agar HIV tetap terkendali.",
  "sa": 60.21,
  "sb": 68,
  "a": 65.8,
  "b": 73.59,
  "clauses": [
   {
    "text": "Bukan karena obat harus selalu ada setiap detik,",
    "a": 65.8,
    "b": 68.33,
    "anchored": true
   },
   {
    "text": "tetapi karena kadar obat perlu dijaga agar HIV tetap terkendali.",
    "a": 68.63,
    "b": 73.59,
    "anchored": true
   }
  ]
 },
 {
  "n": 15,
  "text": "Konsistensi menjaga obat tetap bekerja, dan virus tetap tertekan.",
  "sa": 68.31,
  "sb": 72.92,
  "a": 74.04,
  "b": 78.65,
  "clauses": [
   {
    "text": "Konsistensi menjaga obat tetap bekerja,",
    "a": 74.04,
    "b": 76.55,
    "anchored": true
   },
   {
    "text": "dan virus tetap tertekan.",
    "a": 76.9,
    "b": 78.65,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 78.65; // akhir ucapan terakhir (waktu video)
export const TAIL = 6; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 84.65;
