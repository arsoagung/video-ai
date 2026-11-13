// OTOMATIS dari scripts/retime.mjs build S1E7 (jangan diedit tangan; ubah src/s1e7/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Kalau sudah merasa sehat, mengapa ARV tidak boleh dihentikan?",
  "sa": 0,
  "sb": 3.91,
  "a": 0,
  "b": 3.91,
  "clauses": [
   {
    "text": "Kalau sudah merasa sehat,",
    "a": 0,
    "b": 1.37,
    "anchored": true
   },
   {
    "text": "mengapa ARV tidak boleh dihentikan?",
    "a": 1.75,
    "b": 3.91,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Bayangkan mobil yang melaju di jalan menurun.",
  "sa": 4.36,
  "sb": 7.34,
  "a": 5.11,
  "b": 8.09,
  "clauses": [
   {
    "text": "Bayangkan mobil yang melaju di jalan menurun.",
    "a": 5.11,
    "b": 8.09,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Rem membuatnya tetap terkendali, tetapi tidak menghilangkan jalan menurunnya.",
  "sa": 7.76,
  "sb": 12.48,
  "a": 8.69,
  "b": 13.41,
  "clauses": [
   {
    "text": "Rem membuatnya tetap terkendali,",
    "a": 8.69,
    "b": 10.58,
    "anchored": true
   },
   {
    "text": "tetapi tidak menghilangkan jalan menurunnya.",
    "a": 10.8,
    "b": 13.41,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Begitu juga ARV.",
  "sa": 12.9,
  "sb": 14.21,
  "a": 14.71,
  "b": 16.02,
  "clauses": [
   {
    "text": "Begitu juga ARV.",
    "a": 14.71,
    "b": 16.02,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Obat ini menekan HIV agar tidak bereplikasi, tetapi tidak menghilangkan seluruh virus dari tubuh.",
  "sa": 14.61,
  "sb": 21.45,
  "a": 17.02,
  "b": 23.86,
  "clauses": [
   {
    "text": "Obat ini menekan HIV agar tidak bereplikasi,",
    "a": 17.02,
    "b": 20.23,
    "anchored": true
   },
   {
    "text": "tetapi tidak menghilangkan seluruh virus dari tubuh.",
    "a": 20.53,
    "b": 23.86,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Saat ARV dihentikan, kadar obat dalam darah menurun.",
  "sa": 21.91,
  "sb": 25.69,
  "a": 25.26,
  "b": 29.04,
  "clauses": [
   {
    "text": "Saat ARV dihentikan,",
    "a": 25.26,
    "b": 26.8,
    "anchored": true
   },
   {
    "text": "kadar obat dalam darah menurun.",
    "a": 27.16,
    "b": 29.04,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "HIV yang bersembunyi di dalam sel laten bisa kembali aktif dan memperbanyak diri.",
  "sa": 26.05,
  "sb": 30.71,
  "a": 29.94,
  "b": 34.6,
  "clauses": [
   {
    "text": "HIV yang bersembunyi di dalam sel laten bisa kembali aktif dan memperbanyak diri.",
    "a": 29.94,
    "b": 34.6,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Dalam hitungan minggu, viral load atau jumlah virus dalam darah dapat meningkat, CD4 yang membantu pertahanan tubuh bisa menurun, dan risiko penularan dapat kembali meningkat.",
  "sa": 31.1,
  "sb": 42.17,
  "a": 35.8,
  "b": 46.87,
  "clauses": [
   {
    "text": "Dalam hitungan minggu,",
    "a": 35.8,
    "b": 36.94,
    "anchored": true
   },
   {
    "text": "viral load atau jumlah virus dalam darah dapat meningkat,",
    "a": 37.25,
    "b": 40.54,
    "anchored": true
   },
   {
    "text": "CD4 yang membantu pertahanan tubuh bisa menurun,",
    "a": 40.93,
    "b": 43.99,
    "anchored": true
   },
   {
    "text": "dan risiko penularan dapat kembali meningkat.",
    "a": 44.36,
    "b": 46.87,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Ini juga bisa terjadi pada orang yang bertahun-tahun memiliki viral load tidak terdeteksi.",
  "sa": 42.61,
  "sb": 48.07,
  "a": 48.07,
  "b": 53.53,
  "clauses": [
   {
    "text": "Ini juga bisa terjadi pada orang yang bertahun-tahun memiliki viral load tidak terdeteksi.",
    "a": 48.07,
    "b": 53.53,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Penelitian SMART menemukan bahwa penghentian terapi meningkatkan risiko penyakit serius atau kematian lebih dari dua kali lipat dibandingkan pengobatan berkelanjutan.",
  "sa": 48.5,
  "sb": 58.65,
  "a": 54.63,
  "b": 64.78,
  "clauses": [
   {
    "text": "Penelitian SMART menemukan bahwa penghentian terapi meningkatkan risiko penyakit serius atau kematian lebih dari dua kali lipat dibandingkan pengobatan berkelanjutan.",
    "a": 54.63,
    "b": 64.78,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Jadi, merasa sehat bukan berarti HIV sudah hilang.",
  "sa": 59.09,
  "sb": 62.75,
  "a": 66.28,
  "b": 69.94,
  "clauses": [
   {
    "text": "Jadi,",
    "a": 66.28,
    "b": 66.96,
    "anchored": false
   },
   {
    "text": "merasa sehat bukan berarti HIV sudah hilang.",
    "a": 66.96,
    "b": 69.94,
    "anchored": false
   }
  ]
 },
 {
  "n": 12,
  "text": "ARV perlu diminum rutin.",
  "sa": 63.08,
  "sb": 64.95,
  "a": 70.74,
  "b": 72.61,
  "clauses": [
   {
    "text": "ARV perlu diminum rutin.",
    "a": 70.74,
    "b": 72.61,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "Jangan menghentikannya sendiri.",
  "sa": 65.27,
  "sb": 66.95,
  "a": 73.81,
  "b": 75.49,
  "clauses": [
   {
    "text": "Jangan menghentikannya sendiri.",
    "a": 73.81,
    "b": 75.49,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Jika ada efek samping atau kendala, konsultasikan dengan tenaga kesehatan.",
  "sa": 67.31,
  "sb": 71.55,
  "a": 76.59,
  "b": 80.83,
  "clauses": [
   {
    "text": "Jika ada efek samping atau kendala,",
    "a": 76.59,
    "b": 78.57,
    "anchored": true
   },
   {
    "text": "konsultasikan dengan tenaga kesehatan.",
    "a": 78.8,
    "b": 80.83,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 80.83; // akhir ucapan terakhir (waktu video)
export const TAIL = 6; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 86.83;
