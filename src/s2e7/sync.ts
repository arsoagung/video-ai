// OTOMATIS dari scripts/retime.mjs build S2E7 (jangan diedit tangan; ubah src/s2e7/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Satu nyamuk menggigit orang dengan HIV, lalu menggigit kamu.",
  "sa": 0,
  "sb": 4.21,
  "a": 0,
  "b": 4.21,
  "clauses": [
   {
    "text": "Satu nyamuk menggigit orang dengan HIV,",
    "a": 0,
    "b": 2.69,
    "anchored": true
   },
   {
    "text": "lalu menggigit kamu.",
    "a": 2.93,
    "b": 4.21,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Apakah HIV berpindah?",
  "sa": 4.63,
  "sb": 6.15,
  "a": 4.56,
  "b": 6.08,
  "clauses": [
   {
    "text": "Apakah HIV berpindah?",
    "a": 4.56,
    "b": 6.08,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Tidak.",
  "sa": 6.53,
  "sb": 7.03,
  "a": 6.58,
  "b": 7.08,
  "clauses": [
   {
    "text": "Tidak.",
    "a": 6.58,
    "b": 7.08,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Ini alasannya.",
  "sa": 7.41,
  "sb": 8.24,
  "a": 7.98,
  "b": 8.81,
  "clauses": [
   {
    "text": "Ini alasannya.",
    "a": 7.98,
    "b": 8.81,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Pertama, saat menggigit, nyamuk menyuntikkan air liurnya sendiri, bukan darah korban sebelumnya.",
  "sa": 8.62,
  "sb": 14.53,
  "a": 9.21,
  "b": 15.12,
  "clauses": [
   {
    "text": "Pertama,",
    "a": 9.21,
    "b": 9.78,
    "anchored": true
   },
   {
    "text": "saat menggigit,",
    "a": 10.02,
    "b": 10.83,
    "anchored": true
   },
   {
    "text": "nyamuk menyuntikkan air liurnya sendiri,",
    "a": 11.13,
    "b": 13.25,
    "anchored": true
   },
   {
    "text": "bukan darah korban sebelumnya.",
    "a": 13.54,
    "b": 15.12,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Kedua, belalainya hanya menyisakan darah dalam jumlah sangat kecil.",
  "sa": 14.86,
  "sb": 19.28,
  "a": 15.62,
  "b": 20.04,
  "clauses": [
   {
    "text": "Kedua,",
    "a": 15.62,
    "b": 16.13,
    "anchored": true
   },
   {
    "text": "belalainya hanya menyisakan darah dalam jumlah sangat kecil.",
    "a": 16.39,
    "b": 20.04,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Ketiga, setelah makan, serangga biasanya istirahat dulu untuk mencerna, bukan langsung menggigit orang lain.",
  "sa": 19.61,
  "sb": 26.24,
  "a": 20.44,
  "b": 27.07,
  "clauses": [
   {
    "text": "Ketiga,",
    "a": 20.44,
    "b": 19.88,
    "anchored": false
   },
   {
    "text": "setelah makan,",
    "a": 19.88,
    "b": 20.98,
    "anchored": false
   },
   {
    "text": "serangga biasanya istirahat dulu untuk mencerna,",
    "a": 21.25,
    "b": 25.01,
    "anchored": true
   },
   {
    "text": "bukan langsung menggigit orang lain.",
    "a": 25.33,
    "b": 27.07,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Keempat, dan ini yang terpenting, HIV tidak berkembang biak dan tidak bertahan hidup di dalam serangga.",
  "sa": 26.51,
  "sb": 33.03,
  "a": 27.57,
  "b": 34.09,
  "clauses": [
   {
    "text": "Keempat,",
    "a": 27.57,
    "b": 28.07,
    "anchored": true
   },
   {
    "text": "dan ini yang terpenting,",
    "a": 28.32,
    "b": 29.62,
    "anchored": true
   },
   {
    "text": "HIV tidak berkembang biak dan tidak bertahan hidup di dalam serangga.",
    "a": 29.94,
    "b": 34.09,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Bagaimana dengan daerah yang banyak nyamuk dan banyak kasus HIV?",
  "sa": 33.45,
  "sb": 37.03,
  "a": 34.99,
  "b": 38.57,
  "clauses": [
   {
    "text": "Bagaimana dengan daerah yang banyak nyamuk dan banyak kasus HIV?",
    "a": 34.99,
    "b": 38.57,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Justru di sana pun, CDC menyebut tidak ditemukan bukti penularan lewat nyamuk atau serangga lain.",
  "sa": 37.43,
  "sb": 43.65,
  "a": 38.87,
  "b": 45.09,
  "clauses": [
   {
    "text": "Justru di sana pun,",
    "a": 38.87,
    "b": 40.12,
    "anchored": true
   },
   {
    "text": "CDC menyebut tidak ditemukan bukti penularan lewat nyamuk atau serangga lain.",
    "a": 40.29,
    "b": 45.09,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Penularan HIV butuh kontak dengan cairan tubuh tertentu lewat selaput lendir, luka terbuka, atau langsung ke aliran darah.",
  "sa": 43.96,
  "sb": 51.57,
  "a": 45.49,
  "b": 53.1,
  "clauses": [
   {
    "text": "Penularan HIV butuh kontak dengan cairan tubuh tertentu lewat selaput lendir,",
    "a": 45.49,
    "b": 49.97,
    "anchored": true
   },
   {
    "text": "luka terbuka,",
    "a": 50.35,
    "b": 51.25,
    "anchored": true
   },
   {
    "text": "atau langsung ke aliran darah.",
    "a": 51.4,
    "b": 53.1,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Itu berbeda dengan jarum suntik yang dipakai bergantian, yang memang bisa menularkan.",
  "sa": 51.87,
  "sb": 56.59,
  "a": 53.5,
  "b": 58.22,
  "clauses": [
   {
    "text": "Itu berbeda dengan jarum suntik yang dipakai bergantian,",
    "a": 53.5,
    "b": 56.37,
    "anchored": true
   },
   {
    "text": "yang memang bisa menularkan.",
    "a": 56.54,
    "b": 58.22,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "Jadi tidak perlu takut pada nyamuk, apalagi menjauhi orang dengan HIV.",
  "sa": 56.94,
  "sb": 61.61,
  "a": 58.72,
  "b": 63.39,
  "clauses": [
   {
    "text": "Jadi tidak perlu takut pada nyamuk,",
    "a": 58.72,
    "b": 60.87,
    "anchored": true
   },
   {
    "text": "apalagi menjauhi orang dengan HIV.",
    "a": 61.2,
    "b": 63.39,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Dari gigitan nyamuk, yang perlu kamu khawatirkan hanya gatalnya.",
  "sa": 61.92,
  "sb": 65.96,
  "a": 64.09,
  "b": 68.13,
  "clauses": [
   {
    "text": "Dari gigitan nyamuk,",
    "a": 64.09,
    "b": 65.15,
    "anchored": true
   },
   {
    "text": "yang perlu kamu khawatirkan hanya gatalnya.",
    "a": 65.41,
    "b": 68.13,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 68.13; // akhir ucapan terakhir (waktu video)
export const TAIL = 8; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 76.13;
