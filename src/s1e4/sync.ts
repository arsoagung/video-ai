// OTOMATIS dari scripts/retime.mjs build S1E4 (jangan diedit tangan; ubah src/s1e4/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = [
 {
  "n": 1,
  "text": "HIV tidak punya mesin produksi sendiri.",
  "sa": 0,
  "sb": 2.28,
  "a": 0,
  "b": 2.28,
  "clauses": [
   {
    "text": "HIV tidak punya mesin produksi sendiri.",
    "a": 0,
    "b": 2.28,
    "anchored": true
   }
  ]
 },
 {
  "n": 2,
  "text": "Tapi pada orang yang tidak diobati, tubuhnya bisa memproduksi sekitar sepuluh miliar virus baru.",
  "sa": 2.72,
  "sb": 8.81,
  "a": 3.18,
  "b": 9.27,
  "clauses": [
   {
    "text": "Tapi pada orang yang tidak diobati,",
    "a": 3.18,
    "b": 5.45,
    "anchored": true
   },
   {
    "text": "tubuhnya bisa memproduksi sekitar sepuluh miliar virus baru.",
    "a": 5.7,
    "b": 9.27,
    "anchored": true
   }
  ]
 },
 {
  "n": 3,
  "text": "Setiap hari.",
  "sa": 9.11,
  "sb": 10.28,
  "a": 9.72,
  "b": 10.89,
  "clauses": [
   {
    "text": "Setiap hari.",
    "a": 9.72,
    "b": 10.89,
    "anchored": true
   }
  ]
 },
 {
  "n": 4,
  "text": "Bagaimana caranya?",
  "sa": 10.68,
  "sb": 11.61,
  "a": 11.69,
  "b": 12.62,
  "clauses": [
   {
    "text": "Bagaimana caranya?",
    "a": 11.69,
    "b": 12.62,
    "anchored": true
   }
  ]
 },
 {
  "n": 5,
  "text": "Targetnya sel CD4, pengatur sistem kekebalan tubuh.",
  "sa": 12.04,
  "sb": 15.67,
  "a": 13.52,
  "b": 17.15,
  "clauses": [
   {
    "text": "Targetnya sel CD4,",
    "a": 13.52,
    "b": 15.09,
    "anchored": true
   },
   {
    "text": "pengatur sistem kekebalan tubuh.",
    "a": 15.46,
    "b": 17.15,
    "anchored": true
   }
  ]
 },
 {
  "n": 6,
  "text": "HIV menempel, masuk, lalu melepaskan materi genetiknya, semacam resep dirinya, berupa RNA.",
  "sa": 15.99,
  "sb": 23.37,
  "a": 17.6,
  "b": 24.98,
  "clauses": [
   {
    "text": "HIV menempel,",
    "a": 17.6,
    "b": 18.74,
    "anchored": true
   },
   {
    "text": "masuk,",
    "a": 19.05,
    "b": 19.46,
    "anchored": true
   },
   {
    "text": "lalu melepaskan materi genetiknya,",
    "a": 19.88,
    "b": 21.73,
    "anchored": true
   },
   {
    "text": "semacam resep dirinya,",
    "a": 21.98,
    "b": 23.29,
    "anchored": true
   },
   {
    "text": "berupa RNA.",
    "a": 23.59,
    "b": 24.98,
    "anchored": true
   }
  ]
 },
 {
  "n": 7,
  "text": "Masalahnya, sel kita hanya bisa membaca resep berbentuk DNA.",
  "sa": 23.8,
  "sb": 28.12,
  "a": 25.98,
  "b": 30.3,
  "clauses": [
   {
    "text": "Masalahnya,",
    "a": 25.98,
    "b": 26.74,
    "anchored": true
   },
   {
    "text": "sel kita hanya bisa membaca resep berbentuk DNA.",
    "a": 26.94,
    "b": 30.3,
    "anchored": true
   }
  ]
 },
 {
  "n": 8,
  "text": "Maka HIV membawa enzim reverse transcriptase, semacam mesin fotokopi yang mengubah RNA virus menjadi DNA.",
  "sa": 28.42,
  "sb": 36.26,
  "a": 30.75,
  "b": 38.59,
  "clauses": [
   {
    "text": "Maka HIV membawa enzim reverse transcriptase,",
    "a": 30.75,
    "b": 34.04,
    "anchored": true
   },
   {
    "text": "semacam mesin fotokopi yang mengubah RNA virus menjadi DNA.",
    "a": 34.32,
    "b": 38.59,
    "anchored": true
   }
  ]
 },
 {
  "n": 9,
  "text": "Lalu enzim integrase menyelipkan DNA virus ke dalam DNA sel kita.",
  "sa": 36.58,
  "sb": 41.09,
  "a": 39.79,
  "b": 44.3,
  "clauses": [
   {
    "text": "Lalu enzim integrase menyelipkan DNA virus ke dalam DNA sel kita.",
    "a": 39.79,
    "b": 44.3,
    "anchored": true
   }
  ]
 },
 {
  "n": 10,
  "text": "Mulai saat itu, resep virus jadi bagian dari sel itu sendiri.",
  "sa": 41.49,
  "sb": 45.4,
  "a": 45.2,
  "b": 49.11,
  "clauses": [
   {
    "text": "Mulai saat itu,",
    "a": 45.2,
    "b": 43.85,
    "anchored": false
   },
   {
    "text": "resep virus jadi bagian dari sel itu sendiri.",
    "a": 43.85,
    "b": 49.11,
    "anchored": false
   }
  ]
 },
 {
  "n": 11,
  "text": "Setiap kali sel bekerja, resep virus ikut terbaca, dan sel mulai memproduksi bahan-bahan virus yang lalu keluar sebagai virus baru.",
  "sa": 45.76,
  "sb": 54.01,
  "a": 49.56,
  "b": 57.81,
  "clauses": [
   {
    "text": "Setiap kali sel bekerja,",
    "a": 49.56,
    "b": 48.66,
    "anchored": false
   },
   {
    "text": "resep virus ikut terbaca,",
    "a": 48.66,
    "b": 50.98,
    "anchored": false
   },
   {
    "text": "dan sel mulai memproduksi bahan-bahan virus yang lalu keluar sebagai virus baru.",
    "a": 51.26,
    "b": 57.81,
    "anchored": true
   }
  ]
 },
 {
  "n": 12,
  "text": "Tapi virus baru ini belum siap.",
  "sa": 54.35,
  "sb": 56.26,
  "a": 58.81,
  "b": 60.72,
  "clauses": [
   {
    "text": "Tapi virus baru ini belum siap.",
    "a": 58.81,
    "b": 60.72,
    "anchored": true
   }
  ]
 },
 {
  "n": 13,
  "text": "Enzim protease bertindak seperti gunting, memotong bahan virus di titik yang tepat sehingga matang dan siap menginfeksi sel lain.",
  "sa": 56.59,
  "sb": 64.33,
  "a": 61.17,
  "b": 68.91,
  "clauses": [
   {
    "text": "Enzim protease bertindak seperti gunting,",
    "a": 61.17,
    "b": 63.57,
    "anchored": true
   },
   {
    "text": "memotong bahan virus di titik yang tepat sehingga matang dan siap menginfeksi sel lain.",
    "a": 63.8,
    "b": 68.91,
    "anchored": true
   }
  ]
 },
 {
  "n": 14,
  "text": "Dan ini yang mencengangkan.",
  "sa": 64.64,
  "sb": 66.25,
  "a": 70.11,
  "b": 71.72,
  "clauses": [
   {
    "text": "Dan ini yang mencengangkan.",
    "a": 70.11,
    "b": 71.72,
    "anchored": true
   }
  ]
 },
 {
  "n": 15,
  "text": "Mesin fotokopi tadi ceroboh.",
  "sa": 66.58,
  "sb": 68.31,
  "a": 72.52,
  "b": 74.25,
  "clauses": [
   {
    "text": "Mesin fotokopi tadi ceroboh.",
    "a": 72.52,
    "b": 74.25,
    "anchored": true
   }
  ]
 },
 {
  "n": 16,
  "text": "Ia tidak bisa memeriksa salinannya, sehingga kesalahan muncul di sekitar sepertiga sampai satu dari setiap salinan.",
  "sa": 68.57,
  "sb": 75.7,
  "a": 74.7,
  "b": 81.83,
  "clauses": [
   {
    "text": "Ia tidak bisa memeriksa salinannya,",
    "a": 74.7,
    "b": 76.6,
    "anchored": true
   },
   {
    "text": "sehingga kesalahan muncul di sekitar sepertiga sampai satu dari setiap salinan.",
    "a": 76.92,
    "b": 81.83,
    "anchored": true
   }
  ]
 },
 {
  "n": 17,
  "text": "Banyak virus baru jadi cacat dan tidak berfungsi.",
  "sa": 76,
  "sb": 78.87,
  "a": 83.03,
  "b": 85.9,
  "clauses": [
   {
    "text": "Banyak virus baru jadi cacat dan tidak berfungsi.",
    "a": 83.03,
    "b": 85.9,
    "anchored": true
   }
  ]
 },
 {
  "n": 18,
  "text": "Tapi dengan miliaran salinan per hari, selalu ada yang kebetulan lebih tahan obat.",
  "sa": 79.22,
  "sb": 84.25,
  "a": 86.35,
  "b": 91.38,
  "clauses": [
   {
    "text": "Tapi dengan miliaran salinan per hari,",
    "a": 86.35,
    "b": 88.73,
    "anchored": true
   },
   {
    "text": "selalu ada yang kebetulan lebih tahan obat.",
    "a": 89.02,
    "b": 91.38,
    "anchored": true
   }
  ]
 },
 {
  "n": 19,
  "text": "Mutasinya acak; obatlah yang menyisakan virus tahan itu.",
  "sa": 84.6,
  "sb": 87.97,
  "a": 92.28,
  "b": 95.65,
  "clauses": [
   {
    "text": "Mutasinya acak;",
    "a": 92.28,
    "b": 93.15,
    "anchored": true
   },
   {
    "text": "obatlah yang menyisakan virus tahan itu.",
    "a": 93.49,
    "b": 95.65,
    "anchored": true
   }
  ]
 },
 {
  "n": 20,
  "text": "Inilah seleksi alam dalam skala mikroskopis.",
  "sa": 88.29,
  "sb": 91.2,
  "a": 96.1,
  "b": 99.01,
  "clauses": [
   {
    "text": "Inilah seleksi alam dalam skala mikroskopis.",
    "a": 96.1,
    "b": 99.01,
    "anchored": true
   }
  ]
 },
 {
  "n": 21,
  "text": "Itulah sebabnya pengobatan HIV, yang disebut ARV atau antiretroviral, selalu memakai kombinasi beberapa obat yang menyerang tahapan berbeda.",
  "sa": 91.5,
  "sb": 100.85,
  "a": 99.81,
  "b": 109.16,
  "clauses": [
   {
    "text": "Itulah sebabnya pengobatan HIV,",
    "a": 99.81,
    "b": 101.74,
    "anchored": false
   },
   {
    "text": "yang disebut ARV atau antiretroviral,",
    "a": 101.74,
    "b": 104.93,
    "anchored": false
   },
   {
    "text": "selalu memakai kombinasi beberapa obat yang menyerang tahapan berbeda.",
    "a": 105.14,
    "b": 109.16,
    "anchored": true
   }
  ]
 },
 {
  "n": 22,
  "text": "Satu obat mudah dikalahkan mutasi, beberapa obat sekaligus jauh lebih sulit.",
  "sa": 101.18,
  "sb": 106.14,
  "a": 110.06,
  "b": 115.02,
  "clauses": [
   {
    "text": "Satu obat mudah dikalahkan mutasi,",
    "a": 110.06,
    "b": 112.23,
    "anchored": true
   },
   {
    "text": "beberapa obat sekaligus jauh lebih sulit.",
    "a": 112.54,
    "b": 115.02,
    "anchored": true
   }
  ]
 },
 {
  "n": 23,
  "text": "HIV memang licik dan cepat berubah.",
  "sa": 106.45,
  "sb": 108.77,
  "a": 116.32,
  "b": 118.64,
  "clauses": [
   {
    "text": "HIV memang licik dan cepat berubah.",
    "a": 116.32,
    "b": 118.64,
    "anchored": true
   }
  ]
 },
 {
  "n": 24,
  "text": "Tapi begitu cara kerjanya dipahami, titik lemahnya terlihat, dan di situlah ilmu pengetahuan menyerang.",
  "sa": 109.08,
  "sb": 115.49,
  "a": 119.09,
  "b": 125.5,
  "clauses": [
   {
    "text": "Tapi begitu cara kerjanya dipahami,",
    "a": 119.09,
    "b": 121.35,
    "anchored": true
   },
   {
    "text": "titik lemahnya terlihat,",
    "a": 121.59,
    "b": 122.8,
    "anchored": true
   },
   {
    "text": "dan di situlah ilmu pengetahuan menyerang.",
    "a": 123.1,
    "b": 125.5,
    "anchored": true
   }
  ]
 }
];
export const AUDIO_END = 125.5; // akhir ucapan terakhir (waktu video)
export const TAIL = 6; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = 131.5;
