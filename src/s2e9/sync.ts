// OTOMATIS dari scripts/retime.mjs build S2E9 (jangan diedit tangan; ubah src/s2e9/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Tinggal serumah dengan orang dengan HIV.",
  "sa": 0,
  "sb": 2.37,
  "a": 0,
  "b": 2.37,
  "clauses": [
   {
    "text": "Tinggal serumah dengan orang dengan HIV.",
    "a": 0,
    "b": 2.37,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Perlu takut tertular?",
  "sa": 2.84,
  "sb": 3.84,
  "a": 2.67,
  "b": 3.67,
  "clauses": [
   {
    "text": "Perlu takut tertular?",
    "a": 2.67,
    "b": 3.67,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Tidak, dan ini sudah diteliti.",
  "sa": 4.33,
  "sb": 6.69,
  "a": 3.97,
  "b": 6.33,
  "clauses": [
   {
    "text": "Tidak,",
    "a": 3.97,
    "b": 4.42,
    "anchored": true
   },
   {
    "text": "dan ini sudah diteliti.",
    "a": 4.67,
    "b": 6.33,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Penularan HIV butuh tiga hal sekaligus: cairan yang tepat, jalan masuk, dan jumlah virus yang cukup.",
  "sa": 7.09,
  "sb": 13.85,
  "a": 7.13,
  "b": 13.89,
  "clauses": [
   {
    "text": "Penularan HIV butuh tiga hal sekaligus:",
    "a": 7.13,
    "b": 9.85,
    "anchored": true
   },
   {
    "text": "cairan yang tepat,",
    "a": 10.21,
    "b": 11.07,
    "anchored": true
   },
   {
    "text": "jalan masuk,",
    "a": 11.41,
    "b": 12.09,
    "anchored": false
   },
   {
    "text": "dan jumlah virus yang cukup.",
    "a": 12.09,
    "b": 13.89,
    "anchored": false
   }
  ]
 },
 {
  "n": 5,
  "text": "Kehidupan serumah tidak menyediakannya.",
  "sa": 14.28,
  "sb": 16.53,
  "a": 14.49,
  "b": 16.74,
  "clauses": [
   {
    "text": "Kehidupan serumah tidak menyediakannya.",
    "a": 14.49,
    "b": 16.74,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Sentuhan, pelukan, dan berbagi piring atau sendok hanya mengenai kulit utuh, yang bukan jalan masuk bagi HIV.",
  "sa": 16.95,
  "sb": 24.21,
  "a": 17.44,
  "b": 24.7,
  "clauses": [
   {
    "text": "Sentuhan,",
    "a": 17.44,
    "b": 18.04,
    "anchored": false
   },
   {
    "text": "pelukan,",
    "a": 18.04,
    "b": 18.53,
    "anchored": false
   },
   {
    "text": "dan berbagi piring atau sendok hanya mengenai kulit utuh,",
    "a": 18.53,
    "b": 22.43,
    "anchored": false
   },
   {
    "text": "yang bukan jalan masuk bagi HIV.",
    "a": 22.64,
    "b": 24.7,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Hidup serumah biasanya tidak mempertukarkan darah, air mani, cairan vagina, cairan dubur, atau ASI.",
  "sa": 24.56,
  "sb": 31.38,
  "a": 25.15,
  "b": 31.97,
  "clauses": [
   {
    "text": "Hidup serumah biasanya tidak mempertukarkan darah,",
    "a": 25.15,
    "b": 27.71,
    "anchored": false
   },
   {
    "text": "air mani,",
    "a": 27.71,
    "b": 28.14,
    "anchored": false
   },
   {
    "text": "cairan vagina,",
    "a": 28.36,
    "b": 29.04,
    "anchored": true
   },
   {
    "text": "cairan dubur,",
    "a": 29.21,
    "b": 30.16,
    "anchored": true
   },
   {
    "text": "atau ASI.",
    "a": 30.31,
    "b": 31.97,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Keringat dan air liur pun bukan cairan penular HIV.",
  "sa": 31.72,
  "sb": 34.73,
  "a": 32.37,
  "b": 35.38,
  "clauses": [
   {
    "text": "Keringat dan air liur pun bukan cairan penular HIV.",
    "a": 32.37,
    "b": 35.38,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Yang perlu dijaga hanya darah, jadi pisau cukur dan sikat gigi sebaiknya tidak dipakai bersama.",
  "sa": 35.15,
  "sb": 41.56,
  "a": 35.68,
  "b": 42.09,
  "clauses": [
   {
    "text": "Yang perlu dijaga hanya darah,",
    "a": 35.68,
    "b": 37.56,
    "anchored": true
   },
   {
    "text": "jadi pisau cukur dan sikat gigi sebaiknya tidak dipakai bersama.",
    "a": 37.76,
    "b": 42.09,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Peneliti pernah mengujinya.",
  "sa": 41.96,
  "sb": 43.45,
  "a": 42.79,
  "b": 44.28,
  "clauses": [
   {
    "text": "Peneliti pernah mengujinya.",
    "a": 42.79,
    "b": 44.28,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Delapan puluh sembilan anggota keluarga tinggal bersama dua puluh lima anak dengan HIV, kebanyakan masih balita.",
  "sa": 43.84,
  "sb": 50.41,
  "a": 44.68,
  "b": 51.25,
  "clauses": [
   {
    "text": "Delapan puluh sembilan anggota keluarga tinggal bersama dua puluh lima anak dengan HIV,",
    "a": 44.68,
    "b": 49.5,
    "anchored": true
   },
   {
    "text": "kebanyakan masih balita.",
    "a": 49.82,
    "b": 51.25,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Mereka berbagi peralatan makan dan handuk, saling memeluk, bahkan tidur sekasur.",
  "sa": 50.74,
  "sb": 55.81,
  "a": 51.65,
  "b": 56.72,
  "clauses": [
   {
    "text": "Mereka berbagi peralatan makan dan handuk,",
    "a": 51.65,
    "b": 53.88,
    "anchored": true
   },
   {
    "text": "saling memeluk,",
    "a": 54.2,
    "b": 54.83,
    "anchored": false
   },
   {
    "text": "bahkan tidur sekasur.",
    "a": 54.83,
    "b": 56.72,
    "anchored": false
   }
  ]
 },
 {
  "n": 13,
  "text": "Hasil penelitian tahun seribu sembilan ratus sembilan puluh itu: tidak ada satu pun yang terinfeksi.",
  "sa": 56.12,
  "sb": 61.79,
  "a": 57.02,
  "b": 62.69,
  "clauses": [
   {
    "text": "Hasil penelitian tahun seribu sembilan ratus sembilan puluh itu:",
    "a": 57.02,
    "b": 60.18,
    "anchored": true
   },
   {
    "text": "tidak ada satu pun yang terinfeksi.",
    "a": 60.47,
    "b": 62.69,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Jadi kalau keluargamu hidup dengan HIV, peluk saja.",
  "sa": 62.13,
  "sb": 65.56,
  "a": 63.59,
  "b": 67.02,
  "clauses": [
   {
    "text": "Jadi kalau keluargamu hidup dengan HIV,",
    "a": 63.59,
    "b": 65.99,
    "anchored": true
   },
   {
    "text": "peluk saja.",
    "a": 66.3,
    "b": 67.02,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 67.02; // akhir ucapan terakhir (waktu video)
export const TAIL = 8; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 75.02;
