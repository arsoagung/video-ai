// OTOMATIS dari scripts/retime.mjs build S1E6 (jangan diedit tangan; ubah src/s1e6/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Virus HIV terlalu kecil untuk dihitung satu per satu.",
  "sa": 0,
  "sb": 3.56,
  "a": 0,
  "b": 3.56,
  "clauses": [
   {
    "text": "Virus HIV terlalu kecil untuk dihitung satu per satu.",
    "a": 0,
    "b": 3.56,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Tapi dokter bisa tahu jumlahnya dari satu tabung darah.",
  "sa": 3.89,
  "sb": 7.55,
  "a": 4.56,
  "b": 8.22,
  "clauses": [
   {
    "text": "Tapi dokter bisa tahu jumlahnya dari satu tabung darah.",
    "a": 4.56,
    "b": 8.22,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Bayangkan danau luas yang ingin kamu ketahui kekeruhannya.",
  "sa": 8.02,
  "sb": 11.36,
  "a": 9.72,
  "b": 13.06,
  "clauses": [
   {
    "text": "Bayangkan danau luas yang ingin kamu ketahui kekeruhannya.",
    "a": 9.72,
    "b": 13.06,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Tidak perlu mengukur seluruh danau, cukup periksa satu gelas airnya.",
  "sa": 11.69,
  "sb": 15.81,
  "a": 13.66,
  "b": 17.78,
  "clauses": [
   {
    "text": "Tidak perlu mengukur seluruh danau,",
    "a": 13.66,
    "b": 15.57,
    "anchored": true
   },
   {
    "text": "cukup periksa satu gelas airnya.",
    "a": 15.98,
    "b": 17.78,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Begini caranya.",
  "sa": 16.19,
  "sb": 16.96,
  "a": 19.28,
  "b": 20.05,
  "clauses": [
   {
    "text": "Begini caranya.",
    "a": 19.28,
    "b": 20.05,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Pertama, darah dipisahkan hingga tersisa cairan beningnya.",
  "sa": 17.48,
  "sb": 21.35,
  "a": 20.45,
  "b": 24.32,
  "clauses": [
   {
    "text": "Pertama,",
    "a": 20.45,
    "b": 21.04,
    "anchored": true
   },
   {
    "text": "darah dipisahkan hingga tersisa cairan beningnya.",
    "a": 21.4,
    "b": 24.32,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Kedua, jejak genetik virus diambil dan digandakan sampai terbaca mesin.",
  "sa": 21.87,
  "sb": 26.76,
  "a": 25.32,
  "b": 30.21,
  "clauses": [
   {
    "text": "Kedua,",
    "a": 25.32,
    "b": 25.83,
    "anchored": true
   },
   {
    "text": "jejak genetik virus diambil dan digandakan sampai terbaca mesin.",
    "a": 26.24,
    "b": 30.21,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Ketiga, mesin menghitung salinan virus di setiap mililiter darah.",
  "sa": 27.26,
  "sb": 31.42,
  "a": 31.71,
  "b": 35.87,
  "clauses": [
   {
    "text": "Ketiga,",
    "a": 31.71,
    "b": 32.26,
    "anchored": true
   },
   {
    "text": "mesin menghitung salinan virus di setiap mililiter darah.",
    "a": 32.67,
    "b": 35.87,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Semakin banyak salinan, semakin aktif virusnya.",
  "sa": 31.87,
  "sb": 34.66,
  "a": 37.07,
  "b": 39.86,
  "clauses": [
   {
    "text": "Semakin banyak salinan,",
    "a": 37.07,
    "b": 38.3,
    "anchored": true
   },
   {
    "text": "semakin aktif virusnya.",
    "a": 38.51,
    "b": 39.86,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Tanpa obat, bisa puluhan ribu atau lebih.",
  "sa": 35.08,
  "sb": 37.77,
  "a": 40.36,
  "b": 43.05,
  "clauses": [
   {
    "text": "Tanpa obat,",
    "a": 40.36,
    "b": 40.98,
    "anchored": true
   },
   {
    "text": "bisa puluhan ribu atau lebih.",
    "a": 41.27,
    "b": 43.05,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Studi tahun seribu sembilan ratus sembilan puluh enam mengikuti seratus delapan puluh orang lebih dari sepuluh tahun.",
  "sa": 38.33,
  "sb": 44.56,
  "a": 43.95,
  "b": 50.18,
  "clauses": [
   {
    "text": "Studi tahun seribu sembilan ratus sembilan puluh enam mengikuti seratus delapan puluh orang lebih dari sepuluh tahun.",
    "a": 43.95,
    "b": 50.18,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Hasilnya, viral load lebih jitu meramalkan perjalanan penyakit dibanding CD4.",
  "sa": 45.09,
  "sb": 50.4,
  "a": 51.08,
  "b": 56.39,
  "clauses": [
   {
    "text": "Hasilnya,",
    "a": 51.08,
    "b": 51.7,
    "anchored": true
   },
   {
    "text": "viral load lebih jitu meramalkan perjalanan penyakit dibanding CD4.",
    "a": 51.91,
    "b": 56.39,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "Tapi gelas hanya menangkap virus yang beredar, bukan yang bersembunyi di dalam sel.",
  "sa": 50.92,
  "sb": 55.68,
  "a": 57.39,
  "b": 62.15,
  "clauses": [
   {
    "text": "Tapi gelas hanya menangkap virus yang beredar,",
    "a": 57.39,
    "b": 60.07,
    "anchored": true
   },
   {
    "text": "bukan yang bersembunyi di dalam sel.",
    "a": 60.3,
    "b": 62.15,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Jadi viral load adalah potret sebagian, bukan seluruh danau.",
  "sa": 56.04,
  "sb": 60.52,
  "a": 63.15,
  "b": 67.63,
  "clauses": [
   {
    "text": "Jadi viral load adalah potret sebagian,",
    "a": 63.15,
    "b": 66.22,
    "anchored": true
   },
   {
    "text": "bukan seluruh danau.",
    "a": 66.43,
    "b": 67.63,
    "anchored": true
   }
  ]
 },
 {
  "n": 15,
  "text": "Tapi potret itu berguna.",
  "sa": 60.97,
  "sb": 62.68,
  "a": 68.73,
  "b": 70.44,
  "clauses": [
   {
    "text": "Tapi potret itu berguna.",
    "a": 68.73,
    "b": 70.44,
    "anchored": true
   }
  ]
 },
 {
  "n": 16,
  "text": "Kalau ARV bekerja, angkanya turun tajam, bahkan bisa tidak terdeteksi.",
  "sa": 62.95,
  "sb": 68.35,
  "a": 70.84,
  "b": 76.24,
  "clauses": [
   {
    "text": "Kalau ARV bekerja,",
    "a": 70.84,
    "b": 72.47,
    "anchored": true
   },
   {
    "text": "angkanya turun tajam,",
    "a": 72.68,
    "b": 74.03,
    "anchored": true
   },
   {
    "text": "bahkan bisa tidak terdeteksi.",
    "a": 74.37,
    "b": 76.24,
    "anchored": true
   }
  ]
 },
 {
  "n": 17,
  "text": "Virusnya terlalu kecil untuk dihitung satu per satu.",
  "sa": 68.78,
  "sb": 71.51,
  "a": 77.54,
  "b": 80.27,
  "clauses": [
   {
    "text": "Virusnya terlalu kecil untuk dihitung satu per satu.",
    "a": 77.54,
    "b": 80.27,
    "anchored": true
   }
  ]
 },
 {
  "n": 18,
  "text": "Tapi satu gelas air cukup untuk tahu danaunya makin keruh atau makin jernih.",
  "sa": 71.83,
  "sb": 77.14,
  "a": 81.27,
  "b": 86.58,
  "clauses": [
   {
    "text": "Tapi satu gelas air cukup untuk tahu danaunya makin keruh atau makin jernih.",
    "a": 81.27,
    "b": 86.58,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 86.58; // akhir ucapan terakhir (waktu video)
export const TAIL = 6; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 92.58;
