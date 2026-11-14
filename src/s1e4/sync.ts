// OTOMATIS dari scripts/retime.mjs build S1E4 (jangan diedit tangan; ubah src/s1e4/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "CD4 sering disebut bareng HIV.",
  "sa": 0,
  "sb": 2.97,
  "a": 0,
  "b": 2.97,
  "clauses": [
   {
    "text": "CD4 sering disebut bareng HIV.",
    "a": 0,
    "b": 2.97,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Tapi sebenarnya, CD4 itu apa?",
  "sa": 3.38,
  "sb": 6,
  "a": 3.47,
  "b": 6.09,
  "clauses": [
   {
    "text": "Tapi sebenarnya,",
    "a": 3.47,
    "b": 4.51,
    "anchored": true
   },
   {
    "text": "CD4 itu apa?",
    "a": 4.7,
    "b": 6.09,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Dan kenapa angkanya naik turun?",
  "sa": 6.33,
  "sb": 8.17,
  "a": 6.59,
  "b": 8.43,
  "clauses": [
   {
    "text": "Dan kenapa angkanya naik turun?",
    "a": 6.59,
    "b": 8.43,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Jawabannya mirip indikator baterai di ponselmu.",
  "sa": 8.59,
  "sb": 11.46,
  "a": 9.63,
  "b": 12.5,
  "clauses": [
   {
    "text": "Jawabannya mirip indikator baterai di ponselmu.",
    "a": 9.63,
    "b": 12.5,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Ia tidak menentukan nasib ponselnya, hanya memberi tahu sisa daya.",
  "sa": 11.9,
  "sb": 16.03,
  "a": 13.3,
  "b": 17.43,
  "clauses": [
   {
    "text": "Ia tidak menentukan nasib ponselnya,",
    "a": 13.3,
    "b": 15.37,
    "anchored": true
   },
   {
    "text": "hanya memberi tahu sisa daya.",
    "a": 15.66,
    "b": 17.43,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "CD4 adalah sel penjaga sistem kekebalan tubuh, dan sel inilah yang diserang HIV.",
  "sa": 16.46,
  "sb": 22.38,
  "a": 18.33,
  "b": 24.25,
  "clauses": [
   {
    "text": "CD4 adalah sel penjaga sistem kekebalan tubuh,",
    "a": 18.33,
    "b": 21.77,
    "anchored": true
   },
   {
    "text": "dan sel inilah yang diserang HIV.",
    "a": 22.05,
    "b": 24.25,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Jumlahnya menunjukkan seberapa kuat penjagaan tubuh saat ini.",
  "sa": 22.67,
  "sb": 26.42,
  "a": 25.25,
  "b": 29,
  "clauses": [
   {
    "text": "Jumlahnya menunjukkan seberapa kuat penjagaan tubuh saat ini.",
    "a": 25.25,
    "b": 29,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Pertama, petugas mengambil satu tabung darah.",
  "sa": 26.82,
  "sb": 29.79,
  "a": 29.6,
  "b": 32.57,
  "clauses": [
   {
    "text": "Pertama,",
    "a": 29.6,
    "b": 30.21,
    "anchored": true
   },
   {
    "text": "petugas mengambil satu tabung darah.",
    "a": 30.45,
    "b": 32.57,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Kedua, laboratorium menghitung sel CD4 di dalamnya.",
  "sa": 30.07,
  "sb": 33.79,
  "a": 33.57,
  "b": 37.29,
  "clauses": [
   {
    "text": "Kedua,",
    "a": 33.57,
    "b": 34.11,
    "anchored": true
   },
   {
    "text": "laboratorium menghitung sel CD4 di dalamnya.",
    "a": 34.37,
    "b": 37.29,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Ketiga, dokter membandingkan hasilnya dengan hasil sebelumnya, karena yang dibaca adalah arah, bukan satu titik.",
  "sa": 34.11,
  "sb": 41.27,
  "a": 38.29,
  "b": 45.45,
  "clauses": [
   {
    "text": "Ketiga,",
    "a": 38.29,
    "b": 38.86,
    "anchored": true
   },
   {
    "text": "dokter membandingkan hasilnya dengan hasil sebelumnya,",
    "a": 39.1,
    "b": 42.1,
    "anchored": true
   },
   {
    "text": "karena yang dibaca adalah arah,",
    "a": 42.37,
    "b": 44.28,
    "anchored": true
   },
   {
    "text": "bukan satu titik.",
    "a": 44.51,
    "b": 45.45,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Tapi satu angka bisa menipu.",
  "sa": 41.69,
  "sb": 43.73,
  "a": 46.75,
  "b": 48.79,
  "clauses": [
   {
    "text": "Tapi satu angka bisa menipu.",
    "a": 46.75,
    "b": 48.79,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Sedang sakit atau beda alat lab saja bisa menggeser hasilnya.",
  "sa": 44.04,
  "sb": 47.76,
  "a": 49.59,
  "b": 53.31,
  "clauses": [
   {
    "text": "Sedang sakit atau beda alat lab saja bisa menggeser hasilnya.",
    "a": 49.59,
    "b": 53.31,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "Kabar baiknya, baterai ini bisa diisi ulang.",
  "sa": 48.09,
  "sb": 51.25,
  "a": 54.21,
  "b": 57.37,
  "clauses": [
   {
    "text": "Kabar baiknya,",
    "a": 54.21,
    "b": 55.13,
    "anchored": true
   },
   {
    "text": "baterai ini bisa diisi ulang.",
    "a": 55.38,
    "b": 57.37,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Obat HIV yang disebut ARV menahan virus supaya berhenti memperbanyak diri.",
  "sa": 51.6,
  "sb": 56.6,
  "a": 58.57,
  "b": 63.57,
  "clauses": [
   {
    "text": "Obat HIV yang disebut ARV menahan virus supaya berhenti memperbanyak diri.",
    "a": 58.57,
    "b": 63.57,
    "anchored": true
   }
  ]
 },
 {
  "n": 15,
  "text": "Dalam satu studi, sembilan puluh dua persen orang yang virusnya tertekan oleh ARV mengalami kenaikan CD4.",
  "sa": 56.93,
  "sb": 63.81,
  "a": 65.17,
  "b": 72.05,
  "clauses": [
   {
    "text": "Dalam satu studi,",
    "a": 65.17,
    "b": 66.25,
    "anchored": true
   },
   {
    "text": "sembilan puluh dua persen orang yang virusnya tertekan oleh ARV mengalami kenaikan CD4.",
    "a": 66.43,
    "b": 72.05,
    "anchored": true
   }
  ]
 },
 {
  "n": 16,
  "text": "Cara kerja ARV ada di video lain di seri ini.",
  "sa": 64.15,
  "sb": 67.13,
  "a": 73.25,
  "b": 76.23,
  "clauses": [
   {
    "text": "Cara kerja ARV ada di video lain di seri ini.",
    "a": 73.25,
    "b": 76.23,
    "anchored": true
   }
  ]
 },
 {
  "n": 17,
  "text": "CD4 bukan angka mati.",
  "sa": 67.46,
  "sb": 69.46,
  "a": 76.83,
  "b": 78.83,
  "clauses": [
   {
    "text": "CD4 bukan angka mati.",
    "a": 76.83,
    "b": 78.83,
    "anchored": true
   }
  ]
 },
 {
  "n": 18,
  "text": "Ia indikator baterai yang naik turun, dan bisa diisi ulang.",
  "sa": 69.76,
  "sb": 73.76,
  "a": 79.73,
  "b": 83.73,
  "clauses": [
   {
    "text": "Ia indikator baterai yang naik turun,",
    "a": 79.73,
    "b": 81.94,
    "anchored": true
   },
   {
    "text": "dan bisa diisi ulang.",
    "a": 82.17,
    "b": 83.73,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 83.73; // akhir ucapan terakhir (waktu video)
export const TAIL = 6; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 89.73;
