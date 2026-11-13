// Episode S1E8: "Apa itu window period HIV?"
// Timing dari mp3: batas kalimat proporsional (karakter) lalu di-snap ke titik tengah jeda (17/17 batas di jeda; 6 digeser manual ke jeda terdekat yang cocok karena kalimat pendek/koma menghasilkan banyak jeda). Teks = narasi_final persis.
export const EP_AUDIO = 76.51;
export const EP_DUR = 82.5; // suara + ekor diam 6 dtk agar referensi terbaca
export const CLOSE = 71.51; // kalimat terakhir: tampil logo + referensi + Dukung dan follow kami

export type Seg = { a: number; b: number; text: string };
export const SEGS: Seg[] = [
  { a: 0.00, b: 4.36, text: "Hasil tes HIV negatif, apakah berarti pasti bebas HIV?" },
  { a: 4.46, b: 5.66, text: "Belum tentu." },
  { a: 5.76, b: 6.67, text: "Kok bisa?" },
  { a: 6.77, b: 9.60, text: "Bayangkan papan skor yang terlambat diperbarui." },
  { a: 9.70, b: 13.20, text: "Gol sudah terjadi, tapi angkanya belum muncul." },
  { a: 13.30, b: 15.29, text: "Begitu juga dengan tes HIV." },
  { a: 15.39, b: 20.77, text: "Setelah virus masuk, tubuh membutuhkan waktu agar jejak infeksi bisa terdeteksi." },
  { a: 20.87, b: 29.20, text: "Ada tes yang mencari materi genetik virus, antigen, dan antibodi, yaitu zat yang diproduksi sistem imun untuk melawan virus." },
  { a: 29.30, b: 33.42, text: "Jeda inilah yang disebut window period atau masa jendela." },
  { a: 33.52, b: 35.90, text: "Lamanya bergantung pada jenis tes." },
  { a: 36.00, b: 37.24, text: "Tes asam nukleat: 10–33 hari." },
  { a: 37.34, b: 39.75, text: "Tes antigen dan antibodi di laboratorium: 18–45 hari." },
  { a: 39.85, b: 45.17, text: "Tes antibodi, termasuk banyak tes cepat dan mandiri: 23–90 hari." },
  { a: 45.27, b: 48.65, text: "Artinya, hasil negatif yang terlalu dini belum memastikan seseorang tidak terinfeksi." },
  { a: 48.75, b: 57.34, text: "Jika pernah melakukan aktivitas yang berisiko tertular HIV, ulangi tes setelah masa jendela berakhir." },
  { a: 57.44, b: 69.82, text: "Jika kejadian tersebut baru berlangsung dalam 72 jam terakhir, segera konsultasikan PEP, obat pencegahan darurat." },
  { a: 69.92, b: 71.41, text: "Virusnya mungkin sudah ada." },
  { a: 71.51, b: 76.51, text: "Hanya saja, tes belum mampu mendeteksinya." },
];
// awal kalimat ke-n (1-based)
export const T = (n: number) => SEGS[n - 1].a;
// batas adegan (10 adegan + penutup)
export const SCENE_T = [0, T(4), T(6), T(8), T(9), T(10), T(14), T(15), T(16), T(17), CLOSE];

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
