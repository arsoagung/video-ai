// OTOMATIS dari scripts/retime.mjs build S1E3 (jangan diedit tangan; ubah src/s1e3/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Bagaimana tiga obat dalam satu tablet bisa menghentikan HIV memperbanyak diri?",
  "sa": 0,
  "sb": 4.79,
  "a": 0,
  "b": 4.79,
  "clauses": [
   {
    "text": "Bagaimana tiga obat dalam satu tablet bisa menghentikan HIV memperbanyak diri?",
    "a": 0,
    "b": 4.79,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Bayangkan HIV seperti proses produksi yang melewati beberapa tahap.",
  "sa": 5.37,
  "sb": 9.58,
  "a": 5.99,
  "b": 10.2,
  "clauses": [
   {
    "text": "Bayangkan HIV seperti proses produksi yang melewati beberapa tahap.",
    "a": 5.99,
    "b": 10.2,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "ARV bekerja dengan menghambat tahap-tahap tertentu agar virus tidak bisa terus memperbanyak diri.",
  "sa": 10.02,
  "sb": 16.21,
  "a": 10.9,
  "b": 17.09,
  "clauses": [
   {
    "text": "ARV bekerja dengan menghambat tahap-tahap tertentu agar virus tidak bisa terus memperbanyak diri.",
    "a": 10.9,
    "b": 17.09,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Ada obat yang menghalangi virus masuk ke sel.",
  "sa": 16.65,
  "sb": 19.11,
  "a": 18.49,
  "b": 20.95,
  "clauses": [
   {
    "text": "Ada obat yang menghalangi virus masuk ke sel.",
    "a": 18.49,
    "b": 20.95,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Ada yang mengganggu proses penyalinan materi genetiknya menjadi DNA.",
  "sa": 19.52,
  "sb": 23.76,
  "a": 21.95,
  "b": 26.19,
  "clauses": [
   {
    "text": "Ada yang mengganggu proses penyalinan materi genetiknya menjadi DNA.",
    "a": 21.95,
    "b": 26.19,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Ada pula yang mencegah DNA virus menyatu dengan DNA sel.",
  "sa": 24.12,
  "sb": 27.88,
  "a": 27.19,
  "b": 30.95,
  "clauses": [
   {
    "text": "Ada pula yang mencegah DNA virus menyatu dengan DNA sel.",
    "a": 27.19,
    "b": 30.95,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Sementara itu, obat lain menghambat pematangan virus baru agar tidak bisa menginfeksi secara normal.",
  "sa": 28.31,
  "sb": 34.7,
  "a": 31.65,
  "b": 38.04,
  "clauses": [
   {
    "text": "Sementara itu,",
    "a": 31.65,
    "b": 32.64,
    "anchored": true
   },
   {
    "text": "obat lain menghambat pematangan virus baru agar tidak bisa menginfeksi secara normal.",
    "a": 32.8,
    "b": 38.04,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Nah, TLD menggabungkan tiga obat: tenofovir, lamivudin, dan dolutegravir.",
  "sa": 35.1,
  "sb": 41.4,
  "a": 39.54,
  "b": 45.84,
  "clauses": [
   {
    "text": "Nah,",
    "a": 39.54,
    "b": 39.95,
    "anchored": true
   },
   {
    "text": "TLD menggabungkan tiga obat:",
    "a": 40.19,
    "b": 42.26,
    "anchored": true
   },
   {
    "text": "tenofovir,",
    "a": 42.65,
    "b": 43.44,
    "anchored": true
   },
   {
    "text": "lamivudin,",
    "a": 43.75,
    "b": 44.54,
    "anchored": true
   },
   {
    "text": "dan dolutegravir.",
    "a": 44.67,
    "b": 45.84,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Dua obat pertama menghambat proses penyalinan materi genetik.",
  "sa": 41.82,
  "sb": 45.33,
  "a": 46.64,
  "b": 50.15,
  "clauses": [
   {
    "text": "Dua obat pertama menghambat proses penyalinan materi genetik.",
    "a": 46.64,
    "b": 50.15,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Dolutegravir menghambat penyatuan DNA virus dengan DNA sel.",
  "sa": 45.72,
  "sb": 49.97,
  "a": 50.75,
  "b": 55,
  "clauses": [
   {
    "text": "Dolutegravir menghambat penyatuan DNA virus dengan DNA sel.",
    "a": 50.75,
    "b": 55,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Jadi, tiga obat bekerja pada dua tahap penting replikasi HIV.",
  "sa": 50.35,
  "sb": 54.95,
  "a": 55.6,
  "b": 60.2,
  "clauses": [
   {
    "text": "Jadi,",
    "a": 55.6,
    "b": 56.24,
    "anchored": true
   },
   {
    "text": "tiga obat bekerja pada dua tahap penting replikasi HIV.",
    "a": 56.46,
    "b": 60.2,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Kombinasi ini menekan jumlah virus sekaligus mengurangi risiko resistansi, yaitu ketika virus menjadi kebal terhadap obat.",
  "sa": 55.31,
  "sb": 63.43,
  "a": 61.2,
  "b": 69.32,
  "clauses": [
   {
    "text": "Kombinasi ini menekan jumlah virus sekaligus mengurangi risiko resistansi,",
    "a": 61.2,
    "b": 66.04,
    "anchored": true
   },
   {
    "text": "yaitu ketika virus menjadi kebal terhadap obat.",
    "a": 66.26,
    "b": 69.32,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "Hasilnya, jumlah HIV dalam darah bisa ditekan hingga tidak terdeteksi.",
  "sa": 63.83,
  "sb": 68.9,
  "a": 70.92,
  "b": 75.99,
  "clauses": [
   {
    "text": "Hasilnya,",
    "a": 70.92,
    "b": 71.69,
    "anchored": true
   },
   {
    "text": "jumlah HIV dalam darah bisa ditekan hingga tidak terdeteksi.",
    "a": 71.86,
    "b": 75.99,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Namun, bukan berarti virus hilang seluruhnya.",
  "sa": 69.29,
  "sb": 72.17,
  "a": 76.59,
  "b": 79.47,
  "clauses": [
   {
    "text": "Namun,",
    "a": 76.59,
    "b": 77.43,
    "anchored": false
   },
   {
    "text": "bukan berarti virus hilang seluruhnya.",
    "a": 77.43,
    "b": 79.47,
    "anchored": false
   }
  ]
 },
 {
  "n": 15,
  "text": "Karena itu, ARV harus diminum teratur sesuai arahan tenaga kesehatan.",
  "sa": 72.51,
  "sb": 77.64,
  "a": 81.27,
  "b": 86.4,
  "clauses": [
   {
    "text": "Karena itu,",
    "a": 81.27,
    "b": 82.1,
    "anchored": true
   },
   {
    "text": "ARV harus diminum teratur sesuai arahan tenaga kesehatan.",
    "a": 82.27,
    "b": 86.4,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 86.4; // akhir ucapan terakhir (waktu video)
export const TAIL = 6; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 92.4;
