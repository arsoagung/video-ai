// OTOMATIS dari scripts/retime.mjs build S2E10 (jangan diedit tangan; ubah src/s2e10/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Kenapa hasil tes HIV bisa keliru?",
  "sa": 0,
  "sb": 2.24,
  "a": 0,
  "b": 2.24,
  "clauses": [
   {
    "text": "Kenapa hasil tes HIV bisa keliru?",
    "a": 0,
    "b": 2.24,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Sering kali ini soal waktu.",
  "sa": 2.75,
  "sb": 4.53,
  "a": 3.04,
  "b": 4.82,
  "clauses": [
   {
    "text": "Sering kali ini soal waktu.",
    "a": 3.04,
    "b": 4.82,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Anggap tes HIV seperti kamera: ia hanya bisa memotret apa yang sudah muncul.",
  "sa": 4.97,
  "sb": 10.45,
  "a": 5.22,
  "b": 10.7,
  "clauses": [
   {
    "text": "Anggap tes HIV seperti kamera:",
    "a": 5.22,
    "b": 7.28,
    "anchored": true
   },
   {
    "text": "ia hanya bisa memotret apa yang sudah muncul.",
    "a": 7.63,
    "b": 10.7,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Tes antibodi mencari antibodi, yaitu protein yang dibuat tubuh untuk melawan virus.",
  "sa": 10.91,
  "sb": 16.69,
  "a": 11.6,
  "b": 17.38,
  "clauses": [
   {
    "text": "Tes antibodi mencari antibodi,",
    "a": 11.6,
    "b": 13.72,
    "anchored": true
   },
   {
    "text": "yaitu protein yang dibuat tubuh untuk melawan virus.",
    "a": 13.95,
    "b": 17.38,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Tes antigen dan antibodi mencari antibodi sekaligus bagian dari virus.",
  "sa": 17.07,
  "sb": 21.9,
  "a": 17.78,
  "b": 22.61,
  "clauses": [
   {
    "text": "Tes antigen dan antibodi mencari antibodi sekaligus bagian dari virus.",
    "a": 17.78,
    "b": 22.61,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Tes asam nukleat mencari materi genetik virus.",
  "sa": 22.28,
  "sb": 25.25,
  "a": 23.01,
  "b": 25.98,
  "clauses": [
   {
    "text": "Tes asam nukleat mencari materi genetik virus.",
    "a": 23.01,
    "b": 25.98,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Masalahnya ada jendela waktu, yaitu jeda antara paparan sampai tes bisa membacanya.",
  "sa": 25.68,
  "sb": 32.05,
  "a": 26.38,
  "b": 32.75,
  "clauses": [
   {
    "text": "Masalahnya ada jendela waktu,",
    "a": 26.38,
    "b": 28.48,
    "anchored": true
   },
   {
    "text": "yaitu jeda antara paparan sampai tes bisa membacanya.",
    "a": 28.69,
    "b": 32.75,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Menurut CDC, tes asam nukleat butuh sepuluh sampai tiga puluh tiga hari, tes antigen dan antibodi di laboratorium delapan belas sampai empat puluh lima hari, dan tes antibodi dua puluh tiga sampai sembilan puluh hari.",
  "sa": 32.49,
  "sb": 46.81,
  "a": 33.55,
  "b": 47.87,
  "clauses": [
   {
    "text": "Menurut CDC,",
    "a": 33.55,
    "b": 34.57,
    "anchored": true
   },
   {
    "text": "tes asam nukleat butuh sepuluh sampai tiga puluh tiga hari,",
    "a": 34.85,
    "b": 38.3,
    "anchored": true
   },
   {
    "text": "tes antigen dan antibodi di laboratorium delapan belas sampai empat puluh lima hari,",
    "a": 38.58,
    "b": 43.71,
    "anchored": true
   },
   {
    "text": "dan tes antibodi dua puluh tiga sampai sembilan puluh hari.",
    "a": 43.93,
    "b": 47.87,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Tes sebelum jendela itu lewat bisa tampak negatif padahal virus sudah ada.",
  "sa": 47.23,
  "sb": 52.13,
  "a": 48.77,
  "b": 53.67,
  "clauses": [
   {
    "text": "Tes sebelum jendela itu lewat bisa tampak negatif padahal virus sudah ada.",
    "a": 48.77,
    "b": 53.67,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Hasil reaktif awal dikonfirmasi lewat tes lanjutan, supaya hasil keliru tidak jadi diagnosis.",
  "sa": 52.52,
  "sb": 59.02,
  "a": 54.17,
  "b": 60.67,
  "clauses": [
   {
    "text": "Hasil reaktif awal dikonfirmasi lewat tes lanjutan,",
    "a": 54.17,
    "b": 57.42,
    "anchored": true
   },
   {
    "text": "supaya hasil keliru tidak jadi diagnosis.",
    "a": 57.59,
    "b": 60.67,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Jadi kalau ada paparan, ulangi tes setelah jendela waktu lewat.",
  "sa": 59.36,
  "sb": 63.27,
  "a": 61.07,
  "b": 64.98,
  "clauses": [
   {
    "text": "Jadi kalau ada paparan,",
    "a": 61.07,
    "b": 62.74,
    "anchored": true
   },
   {
    "text": "ulangi tes setelah jendela waktu lewat.",
    "a": 62.91,
    "b": 64.98,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Kalau memakai PEP atau PrEP, tanya tenaga kesehatan soal jadwal tes.",
  "sa": 63.68,
  "sb": 69.25,
  "a": 65.78,
  "b": 71.35,
  "clauses": [
   {
    "text": "Kalau memakai PEP atau PrEP,",
    "a": 65.78,
    "b": 68.27,
    "anchored": true
   },
   {
    "text": "tanya tenaga kesehatan soal jadwal tes.",
    "a": 68.55,
    "b": 71.35,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 71.35; // akhir ucapan terakhir (waktu video)
export const TAIL = 8; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 79.35;
