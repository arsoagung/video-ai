// Episode: "Apa bedanya HIV dan AIDS?"  (segmen suara dari deteksi jeda pada mp3, detik)
export const EP2_DUR = 82;

export const SEGS2: { a: number; b: number; text: string }[] = [
  { a: 0.0, b: 3.98, text: 'Kalau seseorang punya HIV, apakah berarti dia sudah AIDS?' },
  { a: 4.35, b: 8.17, text: 'Belum tentu. Ada satu angka yang penting untuk memahami bedanya:' },
  { a: 8.64, b: 9.8, text: 'CD4.' },
  { a: 10.44, b: 15.53, text: 'HIV adalah virus yang menyerang sistem kekebalan tubuh, termasuk sel CD4.' },
  { a: 15.96, b: 19.92, text: 'Kalau HIV tidak diobati, jumlah CD4 bisa terus menurun.' },
  { a: 20.22, b: 25.49, text: 'Dan ketika jumlah CD4 turun sampai di bawah 200 sel per milimeter kubik darah,' },
  { a: 25.85, b: 29.4, text: 'seseorang dengan HIV memenuhi salah satu kriteria AIDS.' },
  { a: 29.79, b: 31.54, text: 'Tapi ada hal penting lainnya.' },
  { a: 31.97, b: 38.23, text: 'AIDS juga bisa didiagnosis ketika seseorang dengan HIV mengalami kondisi atau infeksi tertentu' },
  { a: 38.56, b: 40.65, text: 'yang disebut kondisi penentu AIDS.' },
  { a: 41.02, b: 44.68, text: 'Jadi, AIDS bukan sekadar berarti “virus HIV-nya banyak”.' },
  { a: 45.05, b: 47.9, text: 'Di sinilah viral load berbeda dari CD4.' },
  { a: 48.2, b: 52.67, text: 'Viral load menunjukkan seberapa banyak HIV yang terdeteksi di dalam darah.' },
  { a: 52.95, b: 57.34, text: 'Sedangkan CD4 memberi gambaran tentang kondisi sistem kekebalan tubuh.' },
  { a: 57.68, b: 59.96, text: 'Jadi, HIV adalah virusnya.' },
  { a: 60.32, b: 63.53, text: 'AIDS adalah kondisi tahap lanjut dari infeksi HIV,' },
  { a: 63.9, b: 69.29, text: 'ketika sistem kekebalan sudah mengalami kerusakan berat atau muncul kondisi penentu AIDS.' },
  { a: 69.58, b: 74.52, text: 'Dan dengan pengobatan ARV yang efektif, perkembangan menuju AIDS dapat dicegah.' },
  { a: 74.87, b: 76.21, text: 'Jadi jangan tertukar:' },
  { a: 76.6, b: 78.4, text: 'HIV belum tentu AIDS.' },
  { a: 78.78, b: 79.8, text: 'Pahami faktanya.' },
  { a: 80.17, b: 81.71, text: 'Hargai manusianya.' },
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

export type Cue2 = { a: number; b: number; text: string };
export const CUES2: Cue2[] = (() => {
  const cues: Cue2[] = [];
  for (const s of SEGS2) {
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
