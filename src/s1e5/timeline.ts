// Episode S1E5: "Kenapa ARV harus diminum rutin?"
// Timing dari mp3: batas kalimat proporsional (karakter) lalu di-snap ke titik tengah jeda (14 dari 14 batas ter-snap). Teks = narasi_final persis.
export const EP_AUDIO = 73.09;
export const EP_DUR = 79.1; // suara + ekor diam 6 dtk agar referensi terbaca
export const CLOSE = 68.15; // kalimat terakhir: tampil logo + referensi + Dukung dan follow kami

export type Seg = { a: number; b: number; text: string };
export const SEGS: Seg[] = [
  { a: 0.00, b: 7.17, text: "Bagaimana kalau virus yang sudah berhasil ditekan, kembali memperbanyak diri hanya karena obat tidak diminum teratur?" },
  { a: 7.27, b: 11.77, text: "Itulah salah satu alasan mengapa ARV harus diminum rutin." },
  { a: 11.87, b: 17.22, text: "Bayangkan ARV seperti persediaan yang menjaga pertahanan tubuh tetap bekerja." },
  { a: 17.32, b: 22.35, text: "Obat ini menghambat proses yang digunakan HIV untuk membuat salinan dirinya." },
  { a: 22.45, b: 26.40, text: "Setelah diminum, obat diserap tubuh dan mulai bekerja." },
  { a: 26.50, b: 29.97, text: "Tubuh perlahan membuang obat sehingga kadarnya menurun." },
  { a: 30.07, b: 35.21, text: "Lalu dosis berikutnya menjaga kadar obat tetap cukup untuk menghambat virus." },
  { a: 35.31, b: 39.10, text: "Kalau dosis sering terlewat, perlindungan obat bisa melemah." },
  { a: 39.20, b: 41.91, text: "HIV berpeluang memperbanyak diri kembali." },
  { a: 42.01, b: 47.16, text: "Dalam kondisi tertentu, virus yang lebih tahan terhadap obat juga bisa berkembang." },
  { a: 47.26, b: 50.69, text: "Bukan berarti sekali lupa langsung membuat virus kebal." },
  { a: 50.79, b: 56.07, text: "Tetapi kebiasaan melewatkan obat dapat meningkatkan risiko kegagalan pengobatan." },
  { a: 56.17, b: 59.98, text: "Karena itu, ARV harus diminum sesuai jadwal." },
  { a: 60.08, b: 68.05, text: "Bukan karena obat harus selalu ada setiap detik, tetapi karena kadar obat perlu dijaga agar HIV tetap terkendali." },
  { a: 68.15, b: 72.99, text: "Konsistensi menjaga obat tetap bekerja, dan virus tetap tertekan." },
];
// awal kalimat ke-n (1-based)
export const T = (n: number) => SEGS[n - 1].a;
// batas adegan (6 adegan + penutup)
export const SCENE_T = [0, T(3), T(5), T(8), T(11), T(13), CLOSE];

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
