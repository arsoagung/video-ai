// Episode 3: "Bagaimana HIV memperbanyak diri?"  (segmen suara dari deteksi jeda pada mp3, detik)
export const EP3_AUDIO = 115.64; // durasi suara
export const EP3_DUR = 119.7; // + ekor diam agar referensi terbaca
export const CLOSE = 106.46; // mulai kalimat penutup terakhir: tampil referensi + logo

export const SEGS3: { a: number; b: number; text: string }[] = [
  { a: 0.00, b: 2.28, text: "HIV tidak punya mesin produksi sendiri." },
  { a: 2.72, b: 10.26, text: "Tapi pada orang yang tidak diobati, tubuhnya bisa memproduksi sekitar sepuluh miliar virus baru." },
  { a: 10.68, b: 11.60, text: "Setiap hari." },
  { a: 12.05, b: 13.61, text: "Bagaimana caranya?" },
  { a: 13.98, b: 17.12, text: "Targetnya sel CD4, pengatur sistem kekebalan tubuh." },
  { a: 17.44, b: 23.37, text: "HIV menempel, masuk, lalu melepaskan materi genetiknya, semacam resep dirinya, berupa RNA." },
  { a: 23.80, b: 28.09, text: "Masalahnya, sel kita hanya bisa membaca resep berbentuk DNA." },
  { a: 28.42, b: 36.22, text: "Maka HIV membawa enzim reverse transcriptase, semacam mesin fotokopi yang mengubah RNA virus menjadi DNA." },
  { a: 36.58, b: 41.05, text: "Lalu enzim integrase menyelipkan DNA virus ke dalam DNA sel kita." },
  { a: 41.50, b: 45.40, text: "Mulai saat itu, resep virus jadi bagian dari sel itu sendiri." },
  { a: 45.76, b: 54.01, text: "Setiap kali sel bekerja, resep virus ikut terbaca, dan sel mulai memproduksi bahan-bahan virus yang lalu keluar sebagai virus baru." },
  { a: 54.35, b: 56.25, text: "Tapi virus baru ini belum siap." },
  { a: 56.59, b: 64.33, text: "Enzim protease bertindak seperti gunting, memotong bahan virus di titik yang tepat sehingga matang dan siap menginfeksi sel lain." },
  { a: 64.64, b: 66.24, text: "Dan ini yang mencengangkan." },
  { a: 66.58, b: 68.29, text: "Mesin fotokopi tadi ceroboh." },
  { a: 68.57, b: 75.69, text: "Ia tidak bisa memeriksa salinannya, sehingga kesalahan muncul di sekitar sepertiga sampai satu dari setiap salinan." },
  { a: 76.00, b: 78.84, text: "Banyak virus baru jadi cacat dan tidak berfungsi." },
  { a: 79.22, b: 84.25, text: "Tapi dengan miliaran salinan per hari, selalu ada yang kebetulan lebih tahan obat." },
  { a: 84.60, b: 87.93, text: "Mutasinya acak; obatlah yang menyisakan virus tahan itu." },
  { a: 88.30, b: 91.19, text: "Inilah seleksi alam dalam skala mikroskopis." },
  { a: 91.51, b: 100.82, text: "Itulah sebabnya pengobatan HIV, yang disebut ARV atau antiretroviral, selalu memakai kombinasi beberapa obat yang menyerang tahapan berbeda." },
  { a: 101.19, b: 106.14, text: "Satu obat mudah dikalahkan mutasi, beberapa obat sekaligus jauh lebih sulit." },
  { a: 106.46, b: 108.74, text: "HIV memang licik dan cepat berubah." },
  { a: 109.08, b: 115.54, text: "Tapi begitu cara kerjanya dipahami, titik lemahnya terlihat, dan di situlah ilmu pengetahuan menyerang." },
];

const MAXC = 44;
const chunk = (text: string): string[] => {
  const words = text.split(' ');
  const total = text.length;
  const n = Math.max(1, Math.ceil(total / MAXC));
  const target = total / n;
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (cur && next.length > target + 6) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
};

export type Cue3 = { a: number; b: number; text: string };
export const CUES3: Cue3[] = (() => {
  const cues: Cue3[] = [];
  for (const s of SEGS3) {
    const parts = chunk(s.text);
    const totalC = parts.reduce((x, p) => x + p.length, 0);
    let t = s.a;
    parts.forEach((p, i) => {
      const d = ((s.b - s.a) * p.length) / totalC;
      cues.push({ a: t, b: i === parts.length - 1 ? s.b + 0.25 : t + d, text: p });
      t += d;
    });
  }
  return cues;
})();
