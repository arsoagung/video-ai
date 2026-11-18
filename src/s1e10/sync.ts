// OTOMATIS dari scripts/retime.mjs build S1E10 (jangan diedit tangan; ubah src/s1e10/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Merasa sehat bukan berarti bebas HIV.",
  "sa": 0,
  "sb": 2.9,
  "a": 0,
  "b": 2.9,
  "clauses": [
   {
    "text": "Merasa sehat bukan berarti bebas HIV.",
    "a": 0,
    "b": 2.9,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Banyak orang dengan HIV tidak merasakan gejala selama bertahun-tahun.",
  "sa": 3.28,
  "sb": 7.48,
  "a": 3.9,
  "b": 8.1,
  "clauses": [
   {
    "text": "Banyak orang dengan HIV tidak merasakan gejala selama bertahun-tahun.",
    "a": 3.9,
    "b": 8.1,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Bayangkan mesin yang masih bekerja normal.",
  "sa": 7.86,
  "sb": 10.36,
  "a": 9,
  "b": 11.5,
  "clauses": [
   {
    "text": "Bayangkan mesin yang masih bekerja normal.",
    "a": 9,
    "b": 11.5,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Dari luar terlihat baik-baik saja, padahal karat perlahan menggerogoti komponen di dalamnya.",
  "sa": 10.72,
  "sb": 16.6,
  "a": 12.1,
  "b": 17.98,
  "clauses": [
   {
    "text": "Dari luar terlihat baik-baik saja,",
    "a": 12.1,
    "b": 14.09,
    "anchored": true
   },
   {
    "text": "padahal karat perlahan menggerogoti komponen di dalamnya.",
    "a": 14.4,
    "b": 17.98,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Begitulah HIV tanpa pengobatan.",
  "sa": 16.97,
  "sb": 19.15,
  "a": 19.38,
  "b": 21.56,
  "clauses": [
   {
    "text": "Begitulah HIV tanpa pengobatan.",
    "a": 19.38,
    "b": 21.56,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Beberapa minggu setelah infeksi, sebagian orang mengalami gejala seperti flu, ruam, atau sakit tenggorokan.",
  "sa": 19.55,
  "sb": 26.42,
  "a": 22.01,
  "b": 28.88,
  "clauses": [
   {
    "text": "Beberapa minggu setelah infeksi,",
    "a": 22.01,
    "b": 23.83,
    "anchored": true
   },
   {
    "text": "sebagian orang mengalami gejala seperti flu,",
    "a": 24.02,
    "b": 26.62,
    "anchored": true
   },
   {
    "text": "ruam,",
    "a": 26.91,
    "b": 27.91,
    "anchored": false
   },
   {
    "text": "atau sakit tenggorokan.",
    "a": 27.91,
    "b": 28.88,
    "anchored": false
   }
  ]
 },
 {
  "n": 7,
  "text": "Sebagian lainnya tidak merasakan apa pun.",
  "sa": 26.71,
  "sb": 29.01,
  "a": 30.18,
  "b": 32.48,
  "clauses": [
   {
    "text": "Sebagian lainnya tidak merasakan apa pun.",
    "a": 30.18,
    "b": 32.48,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "HIV kemudian memasuki fase kronis.",
  "sa": 29.36,
  "sb": 31.94,
  "a": 33.48,
  "b": 36.06,
  "clauses": [
   {
    "text": "HIV kemudian memasuki fase kronis.",
    "a": 33.48,
    "b": 36.06,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Virus tetap memperbanyak diri, sementara CD4, sel yang membantu mengatur pertahanan tubuh, perlahan menurun.",
  "sa": 32.24,
  "sb": 39.39,
  "a": 36.51,
  "b": 43.66,
  "clauses": [
   {
    "text": "Virus tetap memperbanyak diri,",
    "a": 36.51,
    "b": 38.3,
    "anchored": true
   },
   {
    "text": "sementara CD4,",
    "a": 38.56,
    "b": 39.86,
    "anchored": true
   },
   {
    "text": "sel yang membantu mengatur pertahanan tubuh,",
    "a": 40.09,
    "b": 42.43,
    "anchored": true
   },
   {
    "text": "perlahan menurun.",
    "a": 42.65,
    "b": 43.66,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Fase ini bisa berlangsung sepuluh tahun atau lebih tanpa gejala.",
  "sa": 39.69,
  "sb": 43.57,
  "a": 45.06,
  "b": 48.94,
  "clauses": [
   {
    "text": "Fase ini bisa berlangsung sepuluh tahun atau lebih tanpa gejala.",
    "a": 45.06,
    "b": 48.94,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Seseorang bisa baru sakit ketika kekebalan tubuh sangat melemah dan mencapai tahap AIDS.",
  "sa": 43.9,
  "sb": 49.33,
  "a": 49.94,
  "b": 55.37,
  "clauses": [
   {
    "text": "Seseorang bisa baru sakit ketika kekebalan tubuh sangat melemah dan mencapai tahap AIDS.",
    "a": 49.94,
    "b": 55.37,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Namun, tanpa gejala bukan berarti aman.",
  "sa": 49.62,
  "sb": 52.41,
  "a": 56.77,
  "b": 59.56,
  "clauses": [
   {
    "text": "Namun,",
    "a": 56.77,
    "b": 57.31,
    "anchored": true
   },
   {
    "text": "tanpa gejala bukan berarti aman.",
    "a": 57.52,
    "b": 59.56,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "HIV tetap bisa menular.",
  "sa": 52.68,
  "sb": 54.41,
  "a": 60.46,
  "b": 62.19,
  "clauses": [
   {
    "text": "HIV tetap bisa menular.",
    "a": 60.46,
    "b": 62.19,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Bahkan, pada awal infeksi, jumlah virus dalam darah bisa sangat tinggi.",
  "sa": 54.72,
  "sb": 59.5,
  "a": 63.19,
  "b": 67.97,
  "clauses": [
   {
    "text": "Bahkan,",
    "a": 63.19,
    "b": 65.08,
    "anchored": true
   },
   {
    "text": "pada awal infeksi,",
    "a": 65.29,
    "b": 65.91,
    "anchored": false
   },
   {
    "text": "jumlah virus dalam darah bisa sangat tinggi.",
    "a": 65.91,
    "b": 67.97,
    "anchored": false
   }
  ]
 },
 {
  "n": 15,
  "text": "Karena itu, gejala bukan patokan.",
  "sa": 59.8,
  "sb": 62.16,
  "a": 69.27,
  "b": 71.63,
  "clauses": [
   {
    "text": "Karena itu,",
    "a": 69.27,
    "b": 70.72,
    "anchored": false
   },
   {
    "text": "gejala bukan patokan.",
    "a": 70.72,
    "b": 71.63,
    "anchored": false
   }
  ]
 },
 {
  "n": 16,
  "text": "Hanya tes HIV yang bisa mengetahui status HIV.",
  "sa": 62.4,
  "sb": 65.64,
  "a": 72.33,
  "b": 75.57,
  "clauses": [
   {
    "text": "Hanya tes HIV yang bisa mengetahui status HIV.",
    "a": 72.33,
    "b": 75.57,
    "anchored": true
   }
  ]
 },
 {
  "n": 17,
  "text": "Semakin cepat diketahui, semakin cepat ARV dimulai.",
  "sa": 65.94,
  "sb": 69.28,
  "a": 76.57,
  "b": 79.91,
  "clauses": [
   {
    "text": "Semakin cepat diketahui,",
    "a": 76.57,
    "b": 77.96,
    "anchored": true
   },
   {
    "text": "semakin cepat ARV dimulai.",
    "a": 78.14,
    "b": 79.91,
    "anchored": true
   }
  ]
 },
 {
  "n": 18,
  "text": "Merasa sehat bukan bukti.",
  "sa": 69.62,
  "sb": 71.34,
  "a": 81.11,
  "b": 82.83,
  "clauses": [
   {
    "text": "Merasa sehat bukan bukti.",
    "a": 81.11,
    "b": 82.83,
    "anchored": true
   }
  ]
 },
 {
  "n": 19,
  "text": "Tes adalah cara untuk mengetahui.",
  "sa": 71.73,
  "sb": 73.84,
  "a": 84.03,
  "b": 86.14,
  "clauses": [
   {
    "text": "Tes adalah cara untuk mengetahui.",
    "a": 84.03,
    "b": 86.14,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 86.14; // akhir ucapan terakhir (waktu video)
export const TAIL = 8; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 94.14;
