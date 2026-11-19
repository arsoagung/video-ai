// OTOMATIS dari scripts/retime.mjs build S2E3 (jangan diedit tangan; ubah src/s2e3/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Tidak ada perasaan yang salah saat pertama kali mendengar diagnosis HIV.",
  "sa": 0,
  "sb": 4.32,
  "a": 0,
  "b": 4.32,
  "clauses": [
   {
    "text": "Tidak ada perasaan yang salah saat pertama kali mendengar diagnosis HIV.",
    "a": 0,
    "b": 4.32,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Perasaan itu datang seperti ombak.",
  "sa": 4.95,
  "sb": 7.19,
  "a": 5.12,
  "b": 7.36,
  "clauses": [
   {
    "text": "Perasaan itu datang seperti ombak.",
    "a": 5.12,
    "b": 7.36,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Ada yang kaget, takut, atau sedih.",
  "sa": 7.5,
  "sb": 10.27,
  "a": 8.26,
  "b": 11.03,
  "clauses": [
   {
    "text": "Ada yang kaget,",
    "a": 8.26,
    "b": 9.29,
    "anchored": true
   },
   {
    "text": "takut,",
    "a": 9.64,
    "b": 10.07,
    "anchored": true
   },
   {
    "text": "atau sedih.",
    "a": 10.35,
    "b": 11.03,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Itu reaksi manusia yang wajar, dan kamu tidak sendirian.",
  "sa": 10.83,
  "sb": 14.64,
  "a": 11.33,
  "b": 15.14,
  "clauses": [
   {
    "text": "Itu reaksi manusia yang wajar,",
    "a": 11.33,
    "b": 13.14,
    "anchored": true
   },
   {
    "text": "dan kamu tidak sendirian.",
    "a": 13.53,
    "b": 15.14,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Lalu apa yang membantu?",
  "sa": 15.16,
  "sb": 16.63,
  "a": 15.59,
  "b": 17.06,
  "clauses": [
   {
    "text": "Lalu apa yang membantu?",
    "a": 15.59,
    "b": 17.06,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Pertama, beri dirimu jeda.",
  "sa": 17.08,
  "sb": 19.13,
  "a": 17.36,
  "b": 19.41,
  "clauses": [
   {
    "text": "Pertama,",
    "a": 17.36,
    "b": 17.96,
    "anchored": true
   },
   {
    "text": "beri dirimu jeda.",
    "a": 18.28,
    "b": 19.41,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Tidak semua harus diputuskan hari ini.",
  "sa": 19.61,
  "sb": 21.81,
  "a": 19.71,
  "b": 21.91,
  "clauses": [
   {
    "text": "Tidak semua harus diputuskan hari ini.",
    "a": 19.71,
    "b": 21.91,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Kedua, cari satu orang yang aman untuk bercerita.",
  "sa": 22.31,
  "sb": 25.64,
  "a": 22.36,
  "b": 25.69,
  "clauses": [
   {
    "text": "Kedua,",
    "a": 22.36,
    "b": 22.86,
    "anchored": true
   },
   {
    "text": "cari satu orang yang aman untuk bercerita.",
    "a": 23.28,
    "b": 25.69,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Ketiga, cari teman sesama orang dengan HIV.",
  "sa": 26.15,
  "sb": 29.31,
  "a": 25.99,
  "b": 29.15,
  "clauses": [
   {
    "text": "Ketiga,",
    "a": 25.99,
    "b": 26.56,
    "anchored": true
   },
   {
    "text": "cari teman sesama orang dengan HIV.",
    "a": 26.95,
    "b": 29.15,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Penelitian menunjukkan dukungan sesama ODHIV membantu orang bertahan dalam perawatan.",
  "sa": 29.81,
  "sb": 35.44,
  "a": 29.45,
  "b": 35.08,
  "clauses": [
   {
    "text": "Penelitian menunjukkan dukungan sesama ODHIV membantu orang bertahan dalam perawatan.",
    "a": 29.45,
    "b": 35.08,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Keempat, mulai berobat bersama tenaga kesehatan.",
  "sa": 35.92,
  "sb": 39.1,
  "a": 35.38,
  "b": 38.56,
  "clauses": [
   {
    "text": "Keempat,",
    "a": 35.38,
    "b": 35.84,
    "anchored": true
   },
   {
    "text": "mulai berobat bersama tenaga kesehatan.",
    "a": 36.29,
    "b": 38.56,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Tapi ombak pertama bukan gambaran seluruh laut.",
  "sa": 39.54,
  "sb": 42.69,
  "a": 38.86,
  "b": 42.01,
  "clauses": [
   {
    "text": "Tapi ombak pertama bukan gambaran seluruh laut.",
    "a": 38.86,
    "b": 42.01,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "Di Indonesia, lebih dari dua ratus lima puluh ribu orang dengan HIV sedang menjalani pengobatan ARV.",
  "sa": 43.13,
  "sb": 49.74,
  "a": 42.71,
  "b": 49.32,
  "clauses": [
   {
    "text": "Di Indonesia,",
    "a": 42.71,
    "b": 43.74,
    "anchored": false
   },
   {
    "text": "lebih dari dua ratus lima puluh ribu orang dengan HIV sedang menjalani pengobatan ARV.",
    "a": 43.74,
    "b": 49.32,
    "anchored": false
   }
  ]
 },
 {
  "n": 14,
  "text": "Perasaan pertama itu nyata, tapi ia bukan satu-satunya bab dalam ceritamu.",
  "sa": 50.3,
  "sb": 55.49,
  "a": 49.67,
  "b": 54.86,
  "clauses": [
   {
    "text": "Perasaan pertama itu nyata,",
    "a": 49.67,
    "b": 51.34,
    "anchored": true
   },
   {
    "text": "tapi ia bukan satu-satunya bab dalam ceritamu.",
    "a": 51.77,
    "b": 54.86,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 54.86; // akhir ucapan terakhir (waktu video)
export const TAIL = 8; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 62.86;
