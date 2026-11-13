// Episode S1E3: "Bagaimana ARV menghentikan replikasi HIV?"
// Segmen suara dari deteksi jeda pada public/vo/S1E3.mp3 (detik). Teks = narasi_final persis (tidak diubah).
export const EP_AUDIO = 77.64; // durasi suara
export const EP_DUR = 83.64; // + ekor diam 6 dtk agar referensi terbaca
export const CLOSE = 72.51; // mulai kalimat penutup terakhir: tampil logo + referensi + Dukung dan follow kami

// batas adegan (13 adegan, disusun dari kalimat narasi_final; lihat Scenes.tsx)
export const SCENE_T = [0, 5.37, 16.65, 19.52, 24.12, 28.31, 35.11, 41.82, 45.72, 50.35, 55.31, 63.84, 71.0, CLOSE];

export const SEGS: { a: number; b: number; text: string }[] = [
  { a: 0.00, b: 4.78, text: "Bagaimana tiga obat dalam satu tablet bisa menghentikan HIV memperbanyak diri?" },
  { a: 5.37, b: 9.58, text: "Bayangkan HIV seperti proses produksi yang melewati beberapa tahap." },
  { a: 10.05, b: 16.21, text: "ARV bekerja dengan menghambat tahap-tahap tertentu agar virus tidak bisa terus memperbanyak diri." },
  { a: 16.65, b: 19.11, text: "Ada obat yang menghalangi virus masuk ke sel." },
  { a: 19.52, b: 23.76, text: "Ada yang mengganggu proses penyalinan materi genetiknya menjadi DNA." },
  { a: 24.12, b: 27.84, text: "Ada pula yang mencegah DNA virus menyatu dengan DNA sel." },
  { a: 28.31, b: 34.67, text: "Sementara itu, obat lain menghambat pematangan virus baru agar tidak bisa menginfeksi secara normal." },
  { a: 35.11, b: 41.40, text: "Nah, TLD menggabungkan tiga obat: tenofovir, lamivudin, dan dolutegravir." },
  { a: 41.82, b: 45.33, text: "Dua obat pertama menghambat proses penyalinan materi genetik." },
  { a: 45.72, b: 49.97, text: "Dolutegravir menghambat penyatuan DNA virus dengan DNA sel." },
  { a: 50.35, b: 54.94, text: "Jadi, tiga obat bekerja pada dua tahap penting replikasi HIV." },
  { a: 55.31, b: 63.43, text: "Kombinasi ini menekan jumlah virus sekaligus mengurangi risiko resistansi, yaitu ketika virus menjadi kebal terhadap obat." },
  { a: 63.84, b: 68.90, text: "Hasilnya, jumlah HIV dalam darah bisa ditekan hingga tidak terdeteksi." },
  { a: 69.29, b: 72.17, text: "Namun, bukan berarti virus hilang seluruhnya." },
  { a: 72.51, b: 77.64, text: "Karena itu, ARV harus diminum teratur sesuai arahan tenaga kesehatan." },
];

const MAXC = 36;
const chunk = (text: string): string[] => {
  const words = text.split(' ');
  const total = text.length;
  const n = Math.max(1, Math.ceil(total / MAXC));
  const target = total / n;
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (cur && next.length > target + 4) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
};

export type Cue = { a: number; b: number; text: string };
export const CUES: Cue[] = (() => {
  const cues: Cue[] = [];
  for (const s of SEGS) {
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
