// Episode S1E7: "Apa yang terjadi kalau ARV dihentikan?"
// Timing dari mp3: batas kalimat proporsional (karakter) lalu di-snap ke titik tengah jeda (14 dari 15 batas ter-snap; batas kalimat 6 digeser manual ke jeda 25,87). Teks = narasi_final persis.
export const EP_AUDIO = 71.71;
export const EP_DUR = 77.7; // suara + ekor diam 6 dtk agar referensi terbaca
export const CLOSE = 67.23; // kalimat terakhir: tampil logo + referensi + Dukung dan follow kami

export type Seg = { a: number; b: number; text: string };
export const SEGS: Seg[] = [
  { a: 0.00, b: 4.13, text: "Kalau sudah merasa sehat, mengapa ARV tidak boleh dihentikan?" },
  { a: 4.23, b: 7.55, text: "Bayangkan mobil yang melaju di jalan menurun." },
  { a: 7.65, b: 12.69, text: "Rem membuatnya tetap terkendali, tetapi tidak menghilangkan jalan menurunnya." },
  { a: 12.79, b: 14.41, text: "Begitu juga ARV." },
  { a: 14.51, b: 21.68, text: "Obat ini menekan HIV agar tidak bereplikasi, tetapi tidak menghilangkan seluruh virus dari tubuh." },
  { a: 21.78, b: 25.87, text: "Saat ARV dihentikan, kadar obat dalam darah menurun." },
  { a: 25.97, b: 30.91, text: "HIV yang bersembunyi di dalam sel laten bisa kembali aktif dan memperbanyak diri." },
  { a: 31.01, b: 36.04, text: "Dalam hitungan minggu, viral load atau jumlah virus dalam darah dapat meningkat," },
  { a: 36.14, b: 39.47, text: "CD4 yang membantu pertahanan tubuh bisa menurun," },
  { a: 39.57, b: 42.39, text: "dan risiko penularan dapat kembali meningkat." },
  { a: 42.49, b: 48.28, text: "Ini juga bisa terjadi pada orang yang bertahun-tahun memiliki viral load tidak terdeteksi." },
  { a: 48.38, b: 58.87, text: "Penelitian SMART menemukan bahwa penghentian terapi meningkatkan risiko penyakit serius atau kematian lebih dari dua kali lipat dibandingkan pengobatan berkelanjutan." },
  { a: 58.97, b: 62.92, text: "Jadi, merasa sehat bukan berarti HIV sudah hilang." },
  { a: 63.02, b: 65.11, text: "ARV perlu diminum rutin." },
  { a: 65.21, b: 67.13, text: "Jangan menghentikannya sendiri." },
  { a: 67.23, b: 71.71, text: "Jika ada efek samping atau kendala, konsultasikan dengan tenaga kesehatan." },
];
// awal kalimat ke-n (1-based)
export const T = (n: number) => SEGS[n - 1].a;
// batas adegan (8 adegan + penutup)
export const SCENE_T = [0, T(2), T(5), T(6), T(8), T(11), T(12), T(13), CLOSE];

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
