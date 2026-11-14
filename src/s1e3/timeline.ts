// Episode ARV (sheet episode 3): "Bagaimana ARV menghentikan replikasi HIV?"
// Segmen suara dari deteksi jeda pada mp3 (detik). Teks = narasi_final persis (tidak diubah).
export const EP_AUDIO = 105.25; // durasi suara
export const EP_DUR = 111.3; // + ekor diam agar referensi terbaca
export const CLOSE = 101.43; // mulai kalimat penutup terakhir: tampil logo + referensi + Dukung dan follow kami

// batas adegan sesuai scene-spec (urutan adegan 1..8), disesuaikan dengan timeline suara asli
export const SCENE_T = [0, 6.2, 16.0, 26.4, 40.3, 50.4, 62.1, 94.0, CLOSE];

export const SEGS: { a: number; b: number; text: string }[] = [
  { a: 0.00, b: 4.60, text: "Satu tablet. Tiga obat. Dua tahapan HIV yang dihentikan." },
  { a: 4.99, b: 5.96, text: "Bagaimana caranya?" },
  { a: 6.43, b: 10.88, text: "Bayangkan siklus hidup HIV sebagai jalur kereta dengan beberapa stasiun." },
  { a: 11.21, b: 15.51, text: "ARV tidak menghancurkan keretanya, hanya menghambat stasiun tertentu." },
  { a: 16.11, b: 19.25, text: "Stasiun pertama: pintu masuk sel CD4." },
  { a: 19.64, b: 24.68, text: "Ada obat yang mencegah virus menempel, ada yang mencegah penyatuan dengan membran." },
  { a: 25.03, b: 26.01, text: "Dua cara berbeda." },
  { a: 26.62, b: 31.54, text: "Stasiun kedua: penyalinan materi genetik oleh enzim reverse transcriptase." },
  { a: 31.83, b: 35.35, text: "NRTI menghentikan pemanjangan rantai DNA virus." },
  { a: 35.60, b: 39.89, text: "NNRTI menempel di sisi lain enzim dan mengganggu kerjanya." },
  { a: 40.50, b: 46.72, text: "Stasiun ketiga: integrasi, saat enzim integrase menyambungkan DNA virus ke DNA sel." },
  { a: 47.04, b: 49.99, text: "Dolutegravir menghambat tahap strand transfer-nya." },
  { a: 50.58, b: 52.43, text: "Stasiun keempat: pematangan." },
  { a: 52.72, b: 56.93, text: "Enzim protease memotong protein prekursor jadi protein fungsional." },
  { a: 57.20, b: 61.78, text: "Bila dihambat, virus yang terbentuk belum matang dan tidak infeksius normal." },
  { a: 62.27, b: 64.09, text: "Tapi satu obat belum cukup." },
  { a: 64.44, b: 71.11, text: "Kombinasi menghambat beberapa target dan menekan resistansi, yakni terseleksinya varian virus tahan obat." },
  { a: 71.57, b: 75.15, text: "TLD hanya satu kombinasi, bukan semua ARV." },
  { a: 75.49, b: 80.58, text: "Pedoman nasional menjadikannya pilihan lini pertama dewasa, dengan penyesuaian klinis." },
  { a: 80.84, b: 84.95, text: "Tenofovir dan lamivudin sama-sama NRTI di stasiun kedua." },
  { a: 85.24, b: 89.98, text: "Dolutegravir di stasiun ketiga. Jadi tiga obat, dua tahapan." },
  { a: 90.27, b: 93.88, text: "Umumnya sekali sehari, mengikuti arahan tenaga kesehatan." },
  { a: 94.17, b: 98.95, text: "HIV di darah ditekan hingga bisa di bawah batas deteksi, bukan hilang." },
  { a: 99.24, b: 101.10, text: "ARV tetap diminum teratur." },
  { a: 101.43, b: 105.25, text: "Satu tablet, tiga obat, dua tahapan dihentikan." },
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
