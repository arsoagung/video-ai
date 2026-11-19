// OTOMATIS dari scripts/retime.mjs build S2E4 (jangan diedit tangan; ubah src/s2e4/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Hanya lima cairan tubuh yang bisa menularkan HIV.",
  "sa": 0,
  "sb": 3.25,
  "a": 0,
  "b": 3.25,
  "clauses": [
   {
    "text": "Hanya lima cairan tubuh yang bisa menularkan HIV.",
    "a": 0,
    "b": 3.25,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Cairan lainnya tidak.",
  "sa": 3.57,
  "sb": 5.01,
  "a": 4.15,
  "b": 5.59,
  "clauses": [
   {
    "text": "Cairan lainnya tidak.",
    "a": 4.15,
    "b": 5.59,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Kenapa bisa setegas itu?",
  "sa": 5.4,
  "sb": 6.87,
  "a": 5.94,
  "b": 7.41,
  "clauses": [
   {
    "text": "Kenapa bisa setegas itu?",
    "a": 5.94,
    "b": 7.41,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Lima cairan itu adalah darah, air mani termasuk cairan pra-ejakulasi, cairan vagina, cairan dubur, dan ASI.",
  "sa": 7.22,
  "sb": 15.28,
  "a": 8.01,
  "b": 16.07,
  "clauses": [
   {
    "text": "Lima cairan itu adalah darah,",
    "a": 8.01,
    "b": 10.01,
    "anchored": true
   },
   {
    "text": "air mani termasuk cairan pra-ejakulasi,",
    "a": 10.3,
    "b": 12.85,
    "anchored": true
   },
   {
    "text": "cairan vagina,",
    "a": 13.22,
    "b": 14.17,
    "anchored": true
   },
   {
    "text": "cairan dubur,",
    "a": 14.47,
    "b": 15.28,
    "anchored": true
   },
   {
    "text": "dan ASI.",
    "a": 15.45,
    "b": 16.07,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Tapi cairan saja belum cukup.",
  "sa": 15.64,
  "sb": 17.71,
  "a": 16.42,
  "b": 18.49,
  "clauses": [
   {
    "text": "Tapi cairan saja belum cukup.",
    "a": 16.42,
    "b": 18.49,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Ia harus masuk lewat jalur tertentu: hubungan seks tanpa pelindung, jarum suntik yang dipakai bergantian, dari ibu ke bayi saat hamil, persalinan, atau menyusui, dan transfusi darah atau tusukan jarum yang tidak aman.",
  "sa": 18.08,
  "sb": 32.07,
  "a": 19.19,
  "b": 33.18,
  "clauses": [
   {
    "text": "Ia harus masuk lewat jalur tertentu:",
    "a": 19.19,
    "b": 21.36,
    "anchored": true
   },
   {
    "text": "hubungan seks tanpa pelindung,",
    "a": 21.73,
    "b": 23.25,
    "anchored": true
   },
   {
    "text": "jarum suntik yang dipakai bergantian,",
    "a": 23.54,
    "b": 25.57,
    "anchored": true
   },
   {
    "text": "dari ibu ke bayi saat hamil,",
    "a": 25.82,
    "b": 27.66,
    "anchored": true
   },
   {
    "text": "persalinan,",
    "a": 27.91,
    "b": 28.6,
    "anchored": false
   },
   {
    "text": "atau menyusui,",
    "a": 28.6,
    "b": 29.74,
    "anchored": false
   },
   {
    "text": "dan transfusi darah atau tusukan jarum yang tidak aman.",
    "a": 29.98,
    "b": 33.18,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Intinya, cairan itu harus bertemu selaput lendir, yaitu lapisan lembap di dalam tubuh, atau luka terbuka, atau masuk langsung ke aliran darah.",
  "sa": 32.38,
  "sb": 41.65,
  "a": 33.78,
  "b": 43.05,
  "clauses": [
   {
    "text": "Intinya,",
    "a": 33.78,
    "b": 34.31,
    "anchored": false
   },
   {
    "text": "cairan itu harus bertemu selaput lendir,",
    "a": 34.31,
    "b": 36.89,
    "anchored": false
   },
   {
    "text": "yaitu lapisan lembap di dalam tubuh,",
    "a": 37.14,
    "b": 39.31,
    "anchored": true
   },
   {
    "text": "atau luka terbuka,",
    "a": 39.51,
    "b": 40.77,
    "anchored": true
   },
   {
    "text": "atau masuk langsung ke aliran darah.",
    "a": 41.03,
    "b": 43.05,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Menurut CDC, kontak seksual menyumbang sekitar delapan puluh sembilan persen diagnosis HIV baru di Amerika Serikat.",
  "sa": 41.97,
  "sb": 48.82,
  "a": 43.55,
  "b": 50.4,
  "clauses": [
   {
    "text": "Menurut CDC,",
    "a": 43.55,
    "b": 44.58,
    "anchored": true
   },
   {
    "text": "kontak seksual menyumbang sekitar delapan puluh sembilan persen diagnosis HIV baru di Amerika Serikat.",
    "a": 44.8,
    "b": 50.4,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Di luar jalur itu, udara, air, gigitan nyamuk, pelukan, jabat tangan, dan berbagi makanan tidak menularkan HIV.",
  "sa": 49.14,
  "sb": 57.7,
  "a": 50.9,
  "b": 59.46,
  "clauses": [
   {
    "text": "Di luar jalur itu,",
    "a": 50.9,
    "b": 52.07,
    "anchored": true
   },
   {
    "text": "udara,",
    "a": 52.31,
    "b": 52.9,
    "anchored": true
   },
   {
    "text": "air,",
    "a": 53.18,
    "b": 53.65,
    "anchored": true
   },
   {
    "text": "gigitan nyamuk,",
    "a": 53.87,
    "b": 54.8,
    "anchored": true
   },
   {
    "text": "pelukan,",
    "a": 55.02,
    "b": 55.64,
    "anchored": true
   },
   {
    "text": "jabat tangan,",
    "a": 55.82,
    "b": 56.85,
    "anchored": false
   },
   {
    "text": "dan berbagi makanan tidak menularkan HIV.",
    "a": 56.85,
    "b": 59.46,
    "anchored": false
   }
  ]
 },
 {
  "n": 10,
  "text": "Karena jalurnya jelas, pencegahannya tepat sasaran: kondom, jarum steril, PrEP, dan ARV yang menekan virus sampai tidak terdeteksi.",
  "sa": 58.03,
  "sb": 66.96,
  "a": 59.96,
  "b": 68.89,
  "clauses": [
   {
    "text": "Karena jalurnya jelas,",
    "a": 59.96,
    "b": 61.28,
    "anchored": true
   },
   {
    "text": "pencegahannya tepat sasaran:",
    "a": 61.46,
    "b": 63.21,
    "anchored": true
   },
   {
    "text": "kondom,",
    "a": 63.48,
    "b": 64.03,
    "anchored": true
   },
   {
    "text": "jarum steril,",
    "a": 64.19,
    "b": 65.02,
    "anchored": true
   },
   {
    "text": "PrEP,",
    "a": 65.29,
    "b": 65.49,
    "anchored": true
   },
   {
    "text": "dan ARV yang menekan virus sampai tidak terdeteksi.",
    "a": 65.77,
    "b": 68.89,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Kenali jalurnya, dan kamu bisa memutusnya.",
  "sa": 67.26,
  "sb": 70.26,
  "a": 69.89,
  "b": 72.89,
  "clauses": [
   {
    "text": "Kenali jalurnya,",
    "a": 69.89,
    "b": 70.85,
    "anchored": true
   },
   {
    "text": "dan kamu bisa memutusnya.",
    "a": 71.1,
    "b": 72.89,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 72.89; // akhir ucapan terakhir (waktu video)
export const TAIL = 8; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 80.89;
