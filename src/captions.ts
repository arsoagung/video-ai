// Segmen suara (detik) dari deteksi jeda pada mp3 asli
export const SEGS: { id: string; a: number; b: number; text: string }[] = [
  { id: 'A', a: 0.0, b: 4.119, text: 'Bagaimana sebenarnya obat ARV menekan HIV di dalam tubuh?' },
  { id: 'B', a: 4.593, b: 7.613, text: 'Kuncinya ada di cara HIV memperbanyak diri.' },
  { id: 'C', a: 8.032, b: 16.111, text: 'Setelah masuk ke sel CD4, HIV memakai enzim reverse transcriptase untuk mengubah RNA-nya menjadi DNA.' },
  { id: 'D', a: 16.484, b: 21.462, text: 'Lalu enzim integrase menyisipkan DNA itu ke dalam DNA sel manusia.' },
  { id: 'E', a: 21.812, b: 29.548, text: 'Sejak itu, sel yang terinfeksi dipaksa membuat RNA dan protein HIV baru, lalu dirakit menjadi virus baru.' },
  { id: 'F', a: 29.936, b: 32.976, text: 'ARV bekerja dengan menghambat tahapan-tahapan ini.' },
  { id: 'G', a: 33.343, b: 37.478, text: 'NRTI dan NNRTI menghambat reverse transcriptase,' },
  { id: 'H', a: 37.889, b: 41.082, text: 'jadi RNA tidak bisa disalin menjadi DNA.' },
  { id: 'I', a: 41.43, b: 48.25, text: 'Integrase inhibitor menghambat integrase, jadi DNA virus tidak bisa disisipkan ke DNA sel.' },
  { id: 'J', a: 48.617, b: 56.349, text: 'Protease inhibitor mengganggu pemrosesan protein virus, sehingga virus baru tidak bisa matang dan tidak infeksius.' },
  { id: 'K', a: 56.708, b: 61.807, text: 'Karena itu, terapi HIV biasanya memakai kombinasi obat dari beberapa kelas.' },
  { id: 'L', a: 62.157, b: 68.693, text: 'Hasilnya, produksi virus ditekan, dan jumlah HIV di darah bisa turun sampai tidak terdeteksi.' },
  { id: 'M', a: 69.097, b: 71.529, text: 'Tapi virusnya belum hilang dari tubuh.' },
  { id: 'N', a: 71.858, b: 74.23, text: 'Yang ditekan adalah replikasinya.' },
  { id: 'O', a: 74.704, b: 77.949, text: 'Itu sebabnya ARV harus diminum teratur.' },
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
