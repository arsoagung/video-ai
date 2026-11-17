// OTOMATIS dari scripts/retime.mjs build S1E9 (jangan diedit tangan; ubah src/s1e9/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Pernah melihat hasil tes HIV bertuliskan \"tidak terdeteksi\"?",
  "sa": 0,
  "sb": 3.66,
  "a": 0,
  "b": 3.66,
  "clauses": [
   {
    "text": "Pernah melihat hasil tes HIV bertuliskan \"tidak terdeteksi\"?",
    "a": 0,
    "b": 3.66,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Apakah artinya virus sudah hilang?",
  "sa": 4.16,
  "sb": 6.16,
  "a": 4.11,
  "b": 6.11,
  "clauses": [
   {
    "text": "Apakah artinya virus sudah hilang?",
    "a": 4.11,
    "b": 6.11,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Bayangkan viral load seperti jumlah mobil di jalan.",
  "sa": 6.66,
  "sb": 10.01,
  "a": 7.11,
  "b": 10.46,
  "clauses": [
   {
    "text": "Bayangkan viral load seperti jumlah mobil di jalan.",
    "a": 7.11,
    "b": 10.46,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Semakin banyak virus, semakin ramai.",
  "sa": 10.37,
  "sb": 12.59,
  "a": 11.06,
  "b": 13.28,
  "clauses": [
   {
    "text": "Semakin banyak virus,",
    "a": 11.06,
    "b": 12.26,
    "anchored": true
   },
   {
    "text": "semakin ramai.",
    "a": 12.41,
    "b": 13.28,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Semakin sedikit, semakin sepi.",
  "sa": 12.97,
  "sb": 14.95,
  "a": 13.73,
  "b": 15.71,
  "clauses": [
   {
    "text": "Semakin sedikit,",
    "a": 13.73,
    "b": 14.53,
    "anchored": true
   },
   {
    "text": "semakin sepi.",
    "a": 14.87,
    "b": 15.71,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Viral load mengukur jumlah salinan HIV per mililiter darah.",
  "sa": 15.47,
  "sb": 19.22,
  "a": 17.41,
  "b": 21.16,
  "clauses": [
   {
    "text": "Viral load mengukur jumlah salinan HIV per mililiter darah.",
    "a": 17.41,
    "b": 21.16,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Di atas 1.000, jalan masih ramai.",
  "sa": 19.63,
  "sb": 21.89,
  "a": 21.61,
  "b": 23.87,
  "clauses": [
   {
    "text": "Di atas 1.000,",
    "a": 21.61,
    "b": 22.55,
    "anchored": true
   },
   {
    "text": "jalan masih ramai.",
    "a": 22.73,
    "b": 23.87,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Jika terdeteksi tetapi 1.000 atau kurang, jalan mulai sepi.",
  "sa": 22.32,
  "sb": 26.31,
  "a": 24.67,
  "b": 28.66,
  "clauses": [
   {
    "text": "Jika terdeteksi tetapi 1.000 atau kurang,",
    "a": 24.67,
    "b": 27.26,
    "anchored": true
   },
   {
    "text": "jalan mulai sepi.",
    "a": 27.51,
    "b": 28.66,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Jika berada di bawah batas kemampuan alat pemeriksaan, jalan terlihat kosong.",
  "sa": 26.72,
  "sb": 31.24,
  "a": 29.56,
  "b": 34.08,
  "clauses": [
   {
    "text": "Jika berada di bawah batas kemampuan alat pemeriksaan,",
    "a": 29.56,
    "b": 32.51,
    "anchored": true
   },
   {
    "text": "jalan terlihat kosong.",
    "a": 32.78,
    "b": 34.08,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Inilah yang disebut tidak terdeteksi.",
  "sa": 31.66,
  "sb": 33.93,
  "a": 35.38,
  "b": 37.65,
  "clauses": [
   {
    "text": "Inilah yang disebut tidak terdeteksi.",
    "a": 35.38,
    "b": 37.65,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Tapi jalan kosong bukan berarti tak ada mobil.",
  "sa": 34.36,
  "sb": 37.09,
  "a": 38.65,
  "b": 41.38,
  "clauses": [
   {
    "text": "Tapi jalan kosong bukan berarti tak ada mobil.",
    "a": 38.65,
    "b": 41.38,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Jumlahnya hanya terlalu sedikit untuk terbaca alat.",
  "sa": 37.39,
  "sb": 40.16,
  "a": 42.08,
  "b": 44.85,
  "clauses": [
   {
    "text": "Jumlahnya hanya terlalu sedikit untuk terbaca alat.",
    "a": 42.08,
    "b": 44.85,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "ARV membantu menekan replikasi HIV.",
  "sa": 40.69,
  "sb": 43.47,
  "a": 46.05,
  "b": 48.83,
  "clauses": [
   {
    "text": "ARV membantu menekan replikasi HIV.",
    "a": 46.05,
    "b": 48.83,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Kebanyakan orang mencapai kondisi ini dalam enam bulan.",
  "sa": 43.88,
  "sb": 46.77,
  "a": 49.83,
  "b": 52.72,
  "clauses": [
   {
    "text": "Kebanyakan orang mencapai kondisi ini dalam enam bulan.",
    "a": 49.83,
    "b": 52.72,
    "anchored": true
   }
  ]
 },
 {
  "n": 15,
  "text": "Obat tetap harus diminum teratur agar virus tidak kembali meningkat.",
  "sa": 47.12,
  "sb": 50.94,
  "a": 53.62,
  "b": 57.44,
  "clauses": [
   {
    "text": "Obat tetap harus diminum teratur agar virus tidak kembali meningkat.",
    "a": 53.62,
    "b": 57.44,
    "anchored": true
   }
  ]
 },
 {
  "n": 16,
  "text": "Selama viral load tetap tidak terdeteksi, HIV tidak menular melalui hubungan seksual.",
  "sa": 51.36,
  "sb": 57.65,
  "a": 58.64,
  "b": 64.93,
  "clauses": [
   {
    "text": "Selama viral load tetap tidak terdeteksi,",
    "a": 58.64,
    "b": 60.94,
    "anchored": true
   },
   {
    "text": "HIV tidak menular melalui hubungan seksual.",
    "a": 61.29,
    "b": 64.93,
    "anchored": true
   }
  ]
 },
 {
  "n": 17,
  "text": "Inilah U=U, Undetectable Equals Untransmittable: tidak terdeteksi sama dengan tidak menularkan.",
  "sa": 57.82,
  "sb": 65.95,
  "a": 65.93,
  "b": 74.06,
  "clauses": [
   {
    "text": "Inilah U=U,",
    "a": 65.93,
    "b": 68,
    "anchored": false
   },
   {
    "text": "Undetectable Equals Untransmittable:",
    "a": 68,
    "b": 70.55,
    "anchored": false
   },
   {
    "text": "tidak terdeteksi sama dengan tidak menularkan.",
    "a": 70.55,
    "b": 74.06,
    "anchored": true
   }
  ]
 },
 {
  "n": 18,
  "text": "Jadi, tidak terdeteksi bukan berarti HIV hilang.",
  "sa": 66.26,
  "sb": 68.97,
  "a": 75.46,
  "b": 78.17,
  "clauses": [
   {
    "text": "Jadi,",
    "a": 75.46,
    "b": 75.66,
    "anchored": false
   },
   {
    "text": "tidak terdeteksi bukan berarti HIV hilang.",
    "a": 75.66,
    "b": 78.17,
    "anchored": true
   }
  ]
 },
 {
  "n": 19,
  "text": "Ini tanda pengobatan bekerja dan harus terus dijaga.",
  "sa": 69.3,
  "sb": 72.55,
  "a": 79.37,
  "b": 82.62,
  "clauses": [
   {
    "text": "Ini tanda pengobatan bekerja dan harus terus dijaga.",
    "a": 79.37,
    "b": 82.62,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 82.62; // akhir ucapan terakhir (waktu video)
export const TAIL = 6; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 88.62;
