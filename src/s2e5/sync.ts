// OTOMATIS dari scripts/retime.mjs build S2E5 (jangan diedit tangan; ubah src/s2e5/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Satu piring, satu sendok.",
  "sa": 0,
  "sb": 1.97,
  "a": 0,
  "b": 1.97,
  "clauses": [
   {
    "text": "Satu piring,",
    "a": 0,
    "b": 0.94,
    "anchored": true
   },
   {
    "text": "satu sendok.",
    "a": 1.14,
    "b": 1.97,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Apakah HIV bisa ikut berpindah?",
  "sa": 2.39,
  "sb": 4.5,
  "a": 2.77,
  "b": 4.88,
  "clauses": [
   {
    "text": "Apakah HIV bisa ikut berpindah?",
    "a": 2.77,
    "b": 4.88,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Tidak.",
  "sa": 4.93,
  "sb": 5.36,
  "a": 5.18,
  "b": 5.61,
  "clauses": [
   {
    "text": "Tidak.",
    "a": 5.18,
    "b": 5.61,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "HIV hanya menular lewat lima cairan: darah, air mani, cairan vagina, cairan dubur, dan ASI.",
  "sa": 5.68,
  "sb": 13.61,
  "a": 6.61,
  "b": 14.54,
  "clauses": [
   {
    "text": "HIV hanya menular lewat lima cairan:",
    "a": 6.61,
    "b": 9.32,
    "anchored": true
   },
   {
    "text": "darah,",
    "a": 9.78,
    "b": 9.11,
    "anchored": false
   },
   {
    "text": "air mani,",
    "a": 9.11,
    "b": 10.38,
    "anchored": false
   },
   {
    "text": "cairan vagina,",
    "a": 10.59,
    "b": 11.31,
    "anchored": true
   },
   {
    "text": "cairan dubur,",
    "a": 11.49,
    "b": 12.46,
    "anchored": true
   },
   {
    "text": "dan ASI.",
    "a": 12.69,
    "b": 14.54,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Makanan dan minuman bukan salah satunya, jadi sendok dan piring hanya membawa sisa makanan.",
  "sa": 14.02,
  "sb": 19.69,
  "a": 15.24,
  "b": 20.91,
  "clauses": [
   {
    "text": "Makanan dan minuman bukan salah satunya,",
    "a": 15.24,
    "b": 17.47,
    "anchored": true
   },
   {
    "text": "jadi sendok dan piring hanya membawa sisa makanan.",
    "a": 17.72,
    "b": 20.91,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Air liur juga bukan cairan penular.",
  "sa": 20.07,
  "sb": 22.08,
  "a": 21.21,
  "b": 23.22,
  "clauses": [
   {
    "text": "Air liur juga bukan cairan penular.",
    "a": 21.21,
    "b": 23.22,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Menurut NIH, HIV tidak menyebar lewat air liur, jadi sendok yang menyentuh mulut tidak membawa HIV ke orang berikutnya.",
  "sa": 22.49,
  "sb": 30.38,
  "a": 23.72,
  "b": 31.61,
  "clauses": [
   {
    "text": "Menurut NIH,",
    "a": 23.72,
    "b": 24.8,
    "anchored": true
   },
   {
    "text": "HIV tidak menyebar lewat air liur,",
    "a": 25.11,
    "b": 27.31,
    "anchored": true
   },
   {
    "text": "jadi sendok yang menyentuh mulut tidak membawa HIV ke orang berikutnya.",
    "a": 27.56,
    "b": 31.61,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Keringat, air mata, dan urine pun bukan.",
  "sa": 30.75,
  "sb": 33.32,
  "a": 31.91,
  "b": 34.48,
  "clauses": [
   {
    "text": "Keringat,",
    "a": 31.91,
    "b": 32.01,
    "anchored": false
   },
   {
    "text": "air mata,",
    "a": 32.01,
    "b": 32.38,
    "anchored": false
   },
   {
    "text": "dan urine pun bukan.",
    "a": 32.67,
    "b": 34.48,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Lalu, penularan butuh jalan masuk: cairan penular harus bertemu selaput lendir atau aliran darah.",
  "sa": 33.7,
  "sb": 40.11,
  "a": 34.78,
  "b": 41.19,
  "clauses": [
   {
    "text": "Lalu,",
    "a": 34.78,
    "b": 35.3,
    "anchored": true
   },
   {
    "text": "penularan butuh jalan masuk:",
    "a": 35.52,
    "b": 37.06,
    "anchored": true
   },
   {
    "text": "cairan penular harus bertemu selaput lendir atau aliran darah.",
    "a": 37.29,
    "b": 41.19,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Makan bersama tidak membuka jalan itu.",
  "sa": 40.46,
  "sb": 42.86,
  "a": 41.49,
  "b": 43.89,
  "clauses": [
   {
    "text": "Makan bersama tidak membuka jalan itu.",
    "a": 41.49,
    "b": 43.89,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Memang, dalam kondisi yang sangat tidak biasa, darah dalam jumlah cukup besar yang bercampur air liur bisa menimbulkan risiko jika masuk melalui luka.",
  "sa": 43.22,
  "sb": 52.53,
  "a": 44.49,
  "b": 53.8,
  "clauses": [
   {
    "text": "Memang,",
    "a": 44.49,
    "b": 44.89,
    "anchored": false
   },
   {
    "text": "dalam kondisi yang sangat tidak biasa,",
    "a": 44.89,
    "b": 47.35,
    "anchored": false
   },
   {
    "text": "darah dalam jumlah cukup besar yang bercampur air liur bisa menimbulkan risiko jika masuk melalui luka.",
    "a": 47.35,
    "b": 53.8,
    "anchored": false
   }
  ]
 },
 {
  "n": 12,
  "text": "Namun, hal ini tidak menjadikan berbagi peralatan makan sebagai aktivitas berisiko menularkan HIV.",
  "sa": 52.92,
  "sb": 59.26,
  "a": 54.1,
  "b": 60.44,
  "clauses": [
   {
    "text": "Namun,",
    "a": 54.1,
    "b": 54.7,
    "anchored": false
   },
   {
    "text": "hal ini tidak menjadikan berbagi peralatan makan sebagai aktivitas berisiko menularkan HIV.",
    "a": 54.7,
    "b": 60.44,
    "anchored": false
   }
  ]
 },
 {
  "n": 13,
  "text": "Menurut WHO, HIV tidak menyebar lewat ciuman, pelukan, atau berbagi makanan.",
  "sa": 59.62,
  "sb": 65.25,
  "a": 60.74,
  "b": 66.37,
  "clauses": [
   {
    "text": "Menurut WHO,",
    "a": 60.74,
    "b": 61.81,
    "anchored": true
   },
   {
    "text": "HIV tidak menyebar lewat ciuman,",
    "a": 62.07,
    "b": 63.98,
    "anchored": false
   },
   {
    "text": "pelukan,",
    "a": 63.98,
    "b": 64.34,
    "anchored": false
   },
   {
    "text": "atau berbagi makanan.",
    "a": 64.53,
    "b": 66.37,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Tidak perlu memisahkan peralatan makan.",
  "sa": 65.54,
  "sb": 67.74,
  "a": 66.87,
  "b": 69.07,
  "clauses": [
   {
    "text": "Tidak perlu memisahkan peralatan makan.",
    "a": 66.87,
    "b": 69.07,
    "anchored": true
   }
  ]
 },
 {
  "n": 15,
  "text": "Piring boleh sama, meja makan boleh ramai.",
  "sa": 68.16,
  "sb": 71.05,
  "a": 70.07,
  "b": 72.96,
  "clauses": [
   {
    "text": "Piring boleh sama,",
    "a": 70.07,
    "b": 71.09,
    "anchored": true
   },
   {
    "text": "meja makan boleh ramai.",
    "a": 71.34,
    "b": 72.96,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 72.96; // akhir ucapan terakhir (waktu video)
export const TAIL = 8; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 80.96;
