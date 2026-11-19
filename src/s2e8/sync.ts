// OTOMATIS dari scripts/retime.mjs build S2E8 (jangan diedit tangan; ubah src/s2e8/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "ARV bisa menekan HIV sampai tidak terdeteksi.",
  "sa": 0,
  "sb": 3.86,
  "a": 0,
  "b": 3.86,
  "clauses": [
   {
    "text": "ARV bisa menekan HIV sampai tidak terdeteksi.",
    "a": 0,
    "b": 3.86,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Tapi kenapa HIV belum bisa benar-benar sembuh?",
  "sa": 4.37,
  "sb": 7.28,
  "a": 4.16,
  "b": 7.07,
  "clauses": [
   {
    "text": "Tapi kenapa HIV belum bisa benar-benar sembuh?",
    "a": 4.16,
    "b": 7.07,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Bayangkan taman yang rumputnya sudah dicabut, tapi di dalam tanah masih ada biji yang tertidur.",
  "sa": 7.63,
  "sb": 13.6,
  "a": 8.07,
  "b": 14.04,
  "clauses": [
   {
    "text": "Bayangkan taman yang rumputnya sudah dicabut,",
    "a": 8.07,
    "b": 10.48,
    "anchored": true
   },
   {
    "text": "tapi di dalam tanah masih ada biji yang tertidur.",
    "a": 10.94,
    "b": 14.04,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "HIV bisa bersembunyi di sel kekebalan CD4 memori, lalu menyisipkan materi genetiknya ke DNA sel itu.",
  "sa": 14.02,
  "sb": 21.56,
  "a": 14.84,
  "b": 22.38,
  "clauses": [
   {
    "text": "HIV bisa bersembunyi di sel kekebalan CD4 memori,",
    "a": 14.84,
    "b": 17.97,
    "anchored": false
   },
   {
    "text": "lalu menyisipkan materi genetiknya ke DNA sel itu.",
    "a": 17.97,
    "b": 22.38,
    "anchored": false
   }
  ]
 },
 {
  "n": 5,
  "text": "Sel itu beristirahat, dan virus di dalamnya diam.",
  "sa": 21.93,
  "sb": 25.13,
  "a": 23.18,
  "b": 26.38,
  "clauses": [
   {
    "text": "Sel itu beristirahat,",
    "a": 23.18,
    "b": 24.42,
    "anchored": true
   },
   {
    "text": "dan virus di dalamnya diam.",
    "a": 24.76,
    "b": 26.38,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "ARV hanya bisa menghentikan virus yang sedang memperbanyak diri, jadi biji yang diam tidak tersentuh.",
  "sa": 25.53,
  "sb": 32.1,
  "a": 26.78,
  "b": 33.35,
  "clauses": [
   {
    "text": "ARV hanya bisa menghentikan virus yang sedang memperbanyak diri,",
    "a": 26.78,
    "b": 30.47,
    "anchored": true
   },
   {
    "text": "jadi biji yang diam tidak tersentuh.",
    "a": 30.71,
    "b": 33.35,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Awalnya peneliti memperkirakan biji ini menyusut separuh setiap empat puluh empat bulan, dan butuh lebih dari tujuh puluh tahun untuk habis.",
  "sa": 32.46,
  "sb": 41.03,
  "a": 34.15,
  "b": 42.72,
  "clauses": [
   {
    "text": "Awalnya peneliti memperkirakan biji ini menyusut separuh setiap empat puluh empat bulan,",
    "a": 34.15,
    "b": 39.39,
    "anchored": true
   },
   {
    "text": "dan butuh lebih dari tujuh puluh tahun untuk habis.",
    "a": 39.57,
    "b": 42.72,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Tapi studi tahun dua ribu dua puluh tiga pada biji yang masih bisa tumbuh menemukan penyusutan itu berhenti setelah tujuh tahun, karena sel pembawa biji terus membelah dan menyalin DNA virusnya.",
  "sa": 41.32,
  "sb": 53.92,
  "a": 43.12,
  "b": 55.72,
  "clauses": [
   {
    "text": "Tapi studi tahun dua ribu dua puluh tiga pada biji yang masih bisa tumbuh menemukan penyusutan itu berhenti setelah tujuh tahun,",
    "a": 43.12,
    "b": 51.11,
    "anchored": true
   },
   {
    "text": "karena sel pembawa biji terus membelah dan menyalin DNA virusnya.",
    "a": 51.35,
    "b": 55.72,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Jadi bukan obatnya yang lemah.",
  "sa": 54.29,
  "sb": 56.16,
  "a": 56.52,
  "b": 58.39,
  "clauses": [
   {
    "text": "Jadi bukan obatnya yang lemah.",
    "a": 56.52,
    "b": 58.39,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Targetnya bukan sekadar tidur.",
  "sa": 56.52,
  "sb": 58.31,
  "a": 58.74,
  "b": 60.53,
  "clauses": [
   {
    "text": "Targetnya bukan sekadar tidur.",
    "a": 58.74,
    "b": 60.53,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Peneliti kini mencoba membangunkan lalu membersihkannya, atau mengunci biji agar tidak tumbuh.",
  "sa": 58.68,
  "sb": 64.94,
  "a": 60.93,
  "b": 67.19,
  "clauses": [
   {
    "text": "Peneliti kini mencoba membangunkan lalu membersihkannya,",
    "a": 60.93,
    "b": 64.3,
    "anchored": true
   },
   {
    "text": "atau mengunci biji agar tidak tumbuh.",
    "a": 64.55,
    "b": 67.19,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Keduanya masih riset.",
  "sa": 65.24,
  "sb": 66.32,
  "a": 67.79,
  "b": 68.87,
  "clauses": [
   {
    "text": "Keduanya masih riset.",
    "a": 67.79,
    "b": 68.87,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "Sampai saat itu, ARV tetap harus diminum.",
  "sa": 66.77,
  "sb": 69.95,
  "a": 69.37,
  "b": 72.55,
  "clauses": [
   {
    "text": "Sampai saat itu,",
    "a": 69.37,
    "b": 70.43,
    "anchored": true
   },
   {
    "text": "ARV tetap harus diminum.",
    "a": 70.68,
    "b": 72.55,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 72.55; // akhir ucapan terakhir (waktu video)
export const TAIL = 8; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 80.55;
