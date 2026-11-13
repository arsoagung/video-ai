// OTOMATIS dari scripts/retime.mjs build S1E8 (jangan diedit tangan; ubah src/s1e8/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Hasil tes HIV negatif, apakah berarti pasti bebas HIV?",
  "sa": 0,
  "sb": 4.23,
  "a": 0,
  "b": 4.23,
  "clauses": [
   {
    "text": "Hasil tes HIV negatif,",
    "a": 0,
    "b": 1.85,
    "anchored": true
   },
   {
    "text": "apakah berarti pasti bebas HIV?",
    "a": 2.09,
    "b": 4.23,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Belum tentu.",
  "sa": 4.68,
  "sb": 5.53,
  "a": 5.13,
  "b": 5.98,
  "clauses": [
   {
    "text": "Belum tentu.",
    "a": 5.13,
    "b": 5.98,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Kok bisa?",
  "sa": 5.97,
  "sb": 6.55,
  "a": 6.43,
  "b": 7.01,
  "clauses": [
   {
    "text": "Kok bisa?",
    "a": 6.43,
    "b": 7.01,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Bayangkan papan skor yang terlambat diperbarui.",
  "sa": 6.97,
  "sb": 9.54,
  "a": 7.91,
  "b": 10.48,
  "clauses": [
   {
    "text": "Bayangkan papan skor yang terlambat diperbarui.",
    "a": 7.91,
    "b": 10.48,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Gol sudah terjadi, tapi angkanya belum muncul.",
  "sa": 9.85,
  "sb": 13.14,
  "a": 10.93,
  "b": 14.22,
  "clauses": [
   {
    "text": "Gol sudah terjadi,",
    "a": 10.93,
    "b": 12.18,
    "anchored": true
   },
   {
    "text": "tapi angkanya belum muncul.",
    "a": 12.45,
    "b": 14.22,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Begitu juga dengan tes HIV.",
  "sa": 13.46,
  "sb": 15.24,
  "a": 15.62,
  "b": 17.4,
  "clauses": [
   {
    "text": "Begitu juga dengan tes HIV.",
    "a": 15.62,
    "b": 17.4,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Setelah virus masuk, tubuh membutuhkan waktu agar jejak infeksi bisa terdeteksi.",
  "sa": 15.53,
  "sb": 20.71,
  "a": 17.85,
  "b": 23.03,
  "clauses": [
   {
    "text": "Setelah virus masuk,",
    "a": 17.85,
    "b": 18.97,
    "anchored": true
   },
   {
    "text": "tubuh membutuhkan waktu agar jejak infeksi bisa terdeteksi.",
    "a": 19.28,
    "b": 23.03,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Ada tes yang mencari materi genetik virus, antigen, dan antibodi, yaitu zat yang diproduksi sistem imun untuk melawan virus.",
  "sa": 21.02,
  "sb": 29.18,
  "a": 24.23,
  "b": 32.39,
  "clauses": [
   {
    "text": "Ada tes yang mencari materi genetik virus,",
    "a": 24.23,
    "b": 26.64,
    "anchored": true
   },
   {
    "text": "antigen,",
    "a": 26.86,
    "b": 27.56,
    "anchored": false
   },
   {
    "text": "dan antibodi,",
    "a": 27.56,
    "b": 28.49,
    "anchored": false
   },
   {
    "text": "yaitu zat yang diproduksi sistem imun untuk melawan virus.",
    "a": 28.76,
    "b": 32.39,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Jeda inilah yang disebut window period atau masa jendela.",
  "sa": 29.43,
  "sb": 33.37,
  "a": 33.79,
  "b": 37.73,
  "clauses": [
   {
    "text": "Jeda inilah yang disebut window period atau masa jendela.",
    "a": 33.79,
    "b": 37.73,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Lamanya bergantung pada jenis tes.",
  "sa": 33.66,
  "sb": 35.8,
  "a": 38.73,
  "b": 40.87,
  "clauses": [
   {
    "text": "Lamanya bergantung pada jenis tes.",
    "a": 38.73,
    "b": 40.87,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Tes asam nukleat: 10–33 hari.",
  "sa": 36.2,
  "sb": 39.7,
  "a": 41.32,
  "b": 44.82,
  "clauses": [
   {
    "text": "Tes asam nukleat:",
    "a": 41.32,
    "b": 42.29,
    "anchored": true
   },
   {
    "text": "10–33 hari.",
    "a": 42.63,
    "b": 44.82,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Tes antigen dan antibodi di laboratorium: 18–45 hari.",
  "sa": 40,
  "sb": 45.13,
  "a": 45.52,
  "b": 50.65,
  "clauses": [
   {
    "text": "Tes antigen dan antibodi di laboratorium:",
    "a": 45.52,
    "b": 48.05,
    "anchored": true
   },
   {
    "text": "18–45 hari.",
    "a": 48.29,
    "b": 50.65,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "Tes antibodi, termasuk banyak tes cepat dan mandiri: 23–90 hari.",
  "sa": 45.41,
  "sb": 51.36,
  "a": 51.35,
  "b": 57.3,
  "clauses": [
   {
    "text": "Tes antibodi,",
    "a": 51.35,
    "b": 52.25,
    "anchored": true
   },
   {
    "text": "termasuk banyak tes cepat dan mandiri:",
    "a": 52.45,
    "b": 54.56,
    "anchored": true
   },
   {
    "text": "23–90 hari.",
    "a": 54.83,
    "b": 57.3,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Artinya, hasil negatif yang terlalu dini belum memastikan seseorang tidak terinfeksi.",
  "sa": 51.71,
  "sb": 57.3,
  "a": 58.5,
  "b": 64.09,
  "clauses": [
   {
    "text": "Artinya,",
    "a": 58.5,
    "b": 57.73,
    "anchored": false
   },
   {
    "text": "hasil negatif yang terlalu dini belum memastikan seseorang tidak terinfeksi.",
    "a": 57.73,
    "b": 64.09,
    "anchored": false
   }
  ]
 },
 {
  "n": 15,
  "text": "Jika pernah melakukan aktivitas yang berisiko tertular HIV, ulangi tes setelah masa jendela berakhir.",
  "sa": 57.58,
  "sb": 63.61,
  "a": 65.19,
  "b": 71.22,
  "clauses": [
   {
    "text": "Jika pernah melakukan aktivitas yang berisiko tertular HIV,",
    "a": 65.19,
    "b": 68.67,
    "anchored": true
   },
   {
    "text": "ulangi tes setelah masa jendela berakhir.",
    "a": 68.88,
    "b": 71.22,
    "anchored": true
   }
  ]
 },
 {
  "n": 16,
  "text": "Jika kejadian tersebut baru berlangsung dalam 72 jam terakhir, segera konsultasikan PEP, obat pencegahan darurat.",
  "sa": 63.87,
  "sb": 71.37,
  "a": 72.42,
  "b": 79.92,
  "clauses": [
   {
    "text": "Jika kejadian tersebut baru berlangsung dalam 72 jam terakhir,",
    "a": 72.42,
    "b": 76.36,
    "anchored": true
   },
   {
    "text": "segera konsultasikan PEP,",
    "a": 76.54,
    "b": 78.34,
    "anchored": true
   },
   {
    "text": "obat pencegahan darurat.",
    "a": 78.6,
    "b": 79.92,
    "anchored": true
   }
  ]
 },
 {
  "n": 17,
  "text": "Virusnya mungkin sudah ada.",
  "sa": 71.64,
  "sb": 73.36,
  "a": 81.12,
  "b": 82.84,
  "clauses": [
   {
    "text": "Virusnya mungkin sudah ada.",
    "a": 81.12,
    "b": 82.84,
    "anchored": true
   }
  ]
 },
 {
  "n": 18,
  "text": "Hanya saja, tes belum mampu mendeteksinya.",
  "sa": 73.61,
  "sb": 76.3,
  "a": 83.44,
  "b": 86.13,
  "clauses": [
   {
    "text": "Hanya saja,",
    "a": 83.44,
    "b": 84.28,
    "anchored": true
   },
   {
    "text": "tes belum mampu mendeteksinya.",
    "a": 84.47,
    "b": 86.13,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 86.13; // akhir ucapan terakhir (waktu video)
export const TAIL = 6; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 92.13;
