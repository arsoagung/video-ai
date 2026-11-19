// OTOMATIS dari scripts/retime.mjs build S2E6 (jangan diedit tangan; ubah src/s2e6/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "Orang dengan HIV yang terapinya berhasil tidak menularkan virus lewat hubungan seksual.",
  "sa": 0,
  "sb": 5.35,
  "a": 0,
  "b": 5.35,
  "clauses": [
   {
    "text": "Orang dengan HIV yang terapinya berhasil tidak menularkan virus lewat hubungan seksual.",
    "a": 0,
    "b": 5.35,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Obat ARV menekan jumlah virus di darah sampai tidak terdeteksi oleh tes.",
  "sa": 5.86,
  "sb": 10.92,
  "a": 6.35,
  "b": 11.41,
  "clauses": [
   {
    "text": "Obat ARV menekan jumlah virus di darah sampai tidak terdeteksi oleh tes.",
    "a": 6.35,
    "b": 11.41,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Untuk membuktikannya, peneliti mengikuti pasangan yang satu orang dengan HIV dan satu lagi tidak, dengan kondisi tidak terdeteksi yang dipertahankan minimal enam bulan.",
  "sa": 11.32,
  "sb": 22.11,
  "a": 12.01,
  "b": 22.8,
  "clauses": [
   {
    "text": "Untuk membuktikannya,",
    "a": 12.01,
    "b": 13.27,
    "anchored": false
   },
   {
    "text": "peneliti mengikuti pasangan yang satu orang dengan HIV dan satu lagi tidak,",
    "a": 13.27,
    "b": 18.15,
    "anchored": false
   },
   {
    "text": "dengan kondisi tidak terdeteksi yang dipertahankan minimal enam bulan.",
    "a": 18.44,
    "b": 22.8,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Studi PARTNER dua mencatat lebih dari tujuh puluh enam ribu hubungan seks tanpa kondom antarpasangan laki-laki, dan tidak ada satu pun penularan.",
  "sa": 22.56,
  "sb": 31.78,
  "a": 23.15,
  "b": 32.37,
  "clauses": [
   {
    "text": "Studi PARTNER dua mencatat lebih dari tujuh puluh enam ribu hubungan seks tanpa kondom antarpasangan laki-laki,",
    "a": 23.15,
    "b": 29.76,
    "anchored": true
   },
   {
    "text": "dan tidak ada satu pun penularan.",
    "a": 29.91,
    "b": 32.37,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Dua studi besar lain menemukan hasil serupa.",
  "sa": 32.15,
  "sb": 34.66,
  "a": 33.37,
  "b": 35.88,
  "clauses": [
   {
    "text": "Dua studi besar lain menemukan hasil serupa.",
    "a": 33.37,
    "b": 35.88,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "Hasilnya dirangkum jadi U sama dengan U: Undetectable sama dengan Untransmittable, tidak terdeteksi berarti tidak menular.",
  "sa": 35.04,
  "sb": 44.15,
  "a": 36.23,
  "b": 45.34,
  "clauses": [
   {
    "text": "Hasilnya dirangkum jadi U sama dengan U:",
    "a": 36.23,
    "b": 39.19,
    "anchored": true
   },
   {
    "text": "Undetectable sama dengan Untransmittable,",
    "a": 39.53,
    "b": 42.2,
    "anchored": true
   },
   {
    "text": "tidak terdeteksi berarti tidak menular.",
    "a": 42.52,
    "b": 45.34,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Tapi ada syaratnya: ARV diminum teratur dan hasil tidak terdeteksi bertahan.",
  "sa": 44.59,
  "sb": 50.23,
  "a": 46.14,
  "b": 51.78,
  "clauses": [
   {
    "text": "Tapi ada syaratnya:",
    "a": 46.14,
    "b": 47.43,
    "anchored": true
   },
   {
    "text": "ARV diminum teratur dan hasil tidak terdeteksi bertahan.",
    "a": 47.82,
    "b": 51.78,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Ini hanya berlaku untuk penularan seksual, dan tidak melindungi dari infeksi menular seksual lain.",
  "sa": 50.63,
  "sb": 56.47,
  "a": 52.13,
  "b": 57.97,
  "clauses": [
   {
    "text": "Ini hanya berlaku untuk penularan seksual,",
    "a": 52.13,
    "b": 54.71,
    "anchored": false
   },
   {
    "text": "dan tidak melindungi dari infeksi menular seksual lain.",
    "a": 54.71,
    "b": 57.97,
    "anchored": false
   }
  ]
 },
 {
  "n": 9,
  "text": "WHO menegaskan pada tahun dua ribu dua puluh tiga bahwa risikonya nol.",
  "sa": 56.88,
  "sb": 61.76,
  "a": 58.32,
  "b": 63.2,
  "clauses": [
   {
    "text": "WHO menegaskan pada tahun dua ribu dua puluh tiga bahwa risikonya nol.",
    "a": 58.32,
    "b": 63.2,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Artinya pasangan tidak perlu takut, dan orang dengan HIV tidak perlu dipandang sebagai ancaman.",
  "sa": 62.1,
  "sb": 68.36,
  "a": 64,
  "b": 70.26,
  "clauses": [
   {
    "text": "Artinya pasangan tidak perlu takut,",
    "a": 64,
    "b": 66.34,
    "anchored": true
   },
   {
    "text": "dan orang dengan HIV tidak perlu dipandang sebagai ancaman.",
    "a": 66.62,
    "b": 70.26,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 70.26; // akhir ucapan terakhir (waktu video)
export const TAIL = 8; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 78.26;
