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
  "sb": 3.67,
  "a": 0,
  "b": 3.67,
  "clauses": [
   {
    "text": "Pernah melihat hasil tes HIV bertuliskan \"tidak terdeteksi\"?",
    "a": 0,
    "b": 3.67,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Apakah artinya virus sudah hilang?",
  "sa": 4.16,
  "sb": 6.16,
  "a": 4.12,
  "b": 6.12,
  "clauses": [
   {
    "text": "Apakah artinya virus sudah hilang?",
    "a": 4.12,
    "b": 6.12,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Bayangkan viral load seperti jumlah mobil di jalan.",
  "sa": 6.66,
  "sb": 10.02,
  "a": 7.12,
  "b": 10.48,
  "clauses": [
   {
    "text": "Bayangkan viral load seperti jumlah mobil di jalan.",
    "a": 7.12,
    "b": 10.48,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Semakin banyak virus, semakin ramai.",
  "sa": 10.36,
  "sb": 12.6,
  "a": 11.08,
  "b": 13.32,
  "clauses": [
   {
    "text": "Semakin banyak virus,",
    "a": 11.08,
    "b": 12.29,
    "anchored": false
   },
   {
    "text": "semakin ramai.",
    "a": 12.29,
    "b": 13.32,
    "anchored": false
   }
  ]
 },
 {
  "n": 5,
  "text": "Semakin sedikit, semakin sepi.",
  "sa": 12.96,
  "sb": 14.96,
  "a": 13.77,
  "b": 15.77,
  "clauses": [
   {
    "text": "Semakin sedikit,",
    "a": 13.77,
    "b": 14.58,
    "anchored": true
   },
   {
    "text": "semakin sepi.",
    "a": 14.88,
    "b": 15.77,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Viral load mengukur jumlah salinan HIV per mililiter darah.",
  "sa": 15.45,
  "sb": 19.24,
  "a": 16.77,
  "b": 20.56,
  "clauses": [
   {
    "text": "Viral load mengukur jumlah salinan HIV per mililiter darah.",
    "a": 16.77,
    "b": 20.56,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Di atas 1.000, jalan masih ramai.",
  "sa": 19.63,
  "sb": 21.9,
  "a": 21.01,
  "b": 23.28,
  "clauses": [
   {
    "text": "Di atas 1.000,",
    "a": 21.01,
    "b": 21.95,
    "anchored": true
   },
   {
    "text": "jalan masih ramai.",
    "a": 22.13,
    "b": 23.28,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Jika terdeteksi tetapi 1.000 atau kurang, jalan mulai sepi.",
  "sa": 22.32,
  "sb": 29.68,
  "a": 24.08,
  "b": 31.44,
  "clauses": [
   {
    "text": "Jika terdeteksi tetapi 1.000 atau kurang,",
    "a": 24.08,
    "b": 28.08,
    "anchored": true
   },
   {
    "text": "jalan mulai sepi.",
    "a": 28.48,
    "b": 31.44,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Jika berada di bawah batas kemampuan alat pemeriksaan, jalan terlihat kosong.",
  "sa": 29.93,
  "sb": 33.94,
  "a": 32.34,
  "b": 36.35,
  "clauses": [
   {
    "text": "Jika berada di bawah batas kemampuan alat pemeriksaan,",
    "a": 32.34,
    "b": 33.66,
    "anchored": true
   },
   {
    "text": "jalan terlihat kosong.",
    "a": 34.07,
    "b": 36.35,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Inilah yang disebut tidak terdeteksi.",
  "sa": 34.36,
  "sb": 37.1,
  "a": 37.65,
  "b": 40.39,
  "clauses": [
   {
    "text": "Inilah yang disebut tidak terdeteksi.",
    "a": 37.65,
    "b": 40.39,
    "anchored": true
   }
  ]
 },
 {
  "n": 11,
  "text": "Tapi jalan kosong bukan berarti tak ada mobil.",
  "sa": 37.39,
  "sb": 40.16,
  "a": 41.39,
  "b": 44.16,
  "clauses": [
   {
    "text": "Tapi jalan kosong bukan berarti tak ada mobil.",
    "a": 41.39,
    "b": 44.16,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Jumlahnya hanya terlalu sedikit untuk terbaca alat.",
  "sa": 40.69,
  "sb": 43.48,
  "a": 44.61,
  "b": 47.4,
  "clauses": [
   {
    "text": "Jumlahnya hanya terlalu sedikit untuk terbaca alat.",
    "a": 44.61,
    "b": 47.4,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "ARV membantu menekan replikasi HIV.",
  "sa": 43.88,
  "sb": 46.77,
  "a": 48.6,
  "b": 51.49,
  "clauses": [
   {
    "text": "ARV membantu menekan replikasi HIV.",
    "a": 48.6,
    "b": 51.49,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Kebanyakan orang mencapai kondisi ini dalam enam bulan.",
  "sa": 47.12,
  "sb": 50.94,
  "a": 51.94,
  "b": 55.76,
  "clauses": [
   {
    "text": "Kebanyakan orang mencapai kondisi ini dalam enam bulan.",
    "a": 51.94,
    "b": 55.76,
    "anchored": true
   }
  ]
 },
 {
  "n": 15,
  "text": "Obat tetap harus diminum teratur agar virus tidak kembali meningkat.",
  "sa": 51.36,
  "sb": 53.82,
  "a": 56.66,
  "b": 59.12,
  "clauses": [
   {
    "text": "Obat tetap harus diminum teratur agar virus tidak kembali meningkat.",
    "a": 56.66,
    "b": 59.12,
    "anchored": true
   }
  ]
 },
 {
  "n": 16,
  "text": "Selama viral load tetap tidak terdeteksi, HIV tidak menular melalui hubungan seksual.",
  "sa": 54,
  "sb": 58.94,
  "a": 60.32,
  "b": 65.26,
  "clauses": [
   {
    "text": "Selama viral load tetap tidak terdeteksi,",
    "a": 60.32,
    "b": 63.06,
    "anchored": true
   },
   {
    "text": "HIV tidak menular melalui hubungan seksual.",
    "a": 63.47,
    "b": 65.26,
    "anchored": true
   }
  ]
 },
 {
  "n": 17,
  "text": "Inilah U=U, Undetectable Equals Untransmittable: tidak terdeteksi sama dengan tidak menularkan.",
  "sa": 59.26,
  "sb": 64.96,
  "a": 66.26,
  "b": 71.96,
  "clauses": [
   {
    "text": "Inilah U=U,",
    "a": 66.26,
    "b": 67.5,
    "anchored": false
   },
   {
    "text": "Undetectable Equals Untransmittable:",
    "a": 67.5,
    "b": 68.67,
    "anchored": false
   },
   {
    "text": "tidak terdeteksi sama dengan tidak menularkan.",
    "a": 69.05,
    "b": 71.96,
    "anchored": true
   }
  ]
 },
 {
  "n": 18,
  "text": "Jadi, tidak terdeteksi bukan berarti HIV hilang.",
  "sa": 65.39,
  "sb": 68.97,
  "a": 73.36,
  "b": 76.94,
  "clauses": [
   {
    "text": "Jadi,",
    "a": 73.36,
    "b": 74.05,
    "anchored": true
   },
   {
    "text": "tidak terdeteksi bukan berarti HIV hilang.",
    "a": 74.23,
    "b": 76.94,
    "anchored": true
   }
  ]
 },
 {
  "n": 19,
  "text": "Ini tanda pengobatan bekerja dan harus terus dijaga.",
  "sa": 69.3,
  "sb": 72.61,
  "a": 78.14,
  "b": 81.45,
  "clauses": [
   {
    "text": "Ini tanda pengobatan bekerja dan harus terus dijaga.",
    "a": 78.14,
    "b": 81.45,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 81.45; // akhir ucapan terakhir (waktu video)
export const TAIL = 6; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 87.45;
