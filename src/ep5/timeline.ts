// Episode 5: "Apa itu viral load? Bagaimana diukurnya?"  (segmen suara dari deteksi jeda pada mp3, detik)
export const EP5_AUDIO = 77.32; // durasi suara
export const EP5_DUR = 83.4; // + ekor diam agar referensi terbaca
export const CLOSE = 72.03; // mulai kalimat penutup terakhir: tampil logo + referensi

// Teks subtitle mengikuti kolom narasi. Angka yang diucapkan dengan huruf ditampilkan sebagai angka (lihat DISPLAY_MAP).
export const SEGS5: { a: number; b: number; text: string }[] = [
  { a: 0.00, b: 3.56, text: "Virus HIV terlalu kecil untuk dihitung satu per satu." },
  { a: 4.14, b: 7.53, text: "Tapi dokter bisa tahu jumlahnya dari satu tabung darah." },
  { a: 8.02, b: 11.34, text: "Bayangkan danau luas yang ingin kamu ketahui kekeruhannya." },
  { a: 11.85, b: 15.78, text: "Tidak perlu mengukur seluruh danau, cukup periksa satu gelas airnya." },
  { a: 16.19, b: 16.96, text: "Begini caranya." },
  { a: 17.48, b: 21.35, text: "Pertama, darah dipisahkan hingga tersisa cairan beningnya." },
  { a: 21.87, b: 26.75, text: "Kedua, jejak genetik virus diambil dan digandakan sampai terbaca mesin." },
  { a: 27.26, b: 31.41, text: "Ketiga, mesin menghitung salinan virus di setiap mililiter darah." },
  { a: 31.87, b: 34.64, text: "Semakin banyak salinan, semakin aktif virusnya." },
  { a: 35.08, b: 37.75, text: "Tanpa obat, bisa puluhan ribu atau lebih." },
  { a: 38.34, b: 44.55, text: "Studi tahun seribu sembilan ratus sembilan puluh enam mengikuti seratus delapan puluh orang lebih dari sepuluh tahun." },
  { a: 45.09, b: 50.40, text: "Hasilnya, viral load lebih jitu meramalkan perjalanan penyakit dibanding CD4." },
  { a: 50.92, b: 55.65, text: "Tapi gelas hanya menangkap virus yang beredar, bukan yang bersembunyi di dalam sel." },
  { a: 56.22, b: 60.51, text: "Jadi viral load adalah potret sebagian, bukan seluruh danau." },
  { a: 60.97, b: 62.67, text: "Tapi potret itu berguna." },
  { a: 63.15, b: 68.35, text: "Kalau ARV bekerja, angkanya turun tajam, bahkan bisa tidak terdeteksi." },
  { a: 68.79, b: 71.50, text: "Virusnya terlalu kecil untuk dihitung satu per satu." },
  { a: 72.03, b: 77.12, text: "Tapi satu gelas air cukup untuk tahu danaunya makin keruh atau makin jernih." },
];

// frasa yang diucapkan dengan huruf -> tampil sebagai angka di subtitle (suara tetap membaca huruf)
const DISPLAY_MAP: [string, string][] = [
  ['seribu sembilan ratus sembilan puluh enam', '1996'],
  ['seratus delapan puluh', '180'],
];
const NB = ' ';
const protect = (s: string) => {
  let o = s;
  for (const [k] of DISPLAY_MAP) o = o.split(k).join(k.split(' ').join(NB));
  return o;
};
const display = (s: string) => {
  let o = s;
  for (const [k, v] of DISPLAY_MAP) o = o.split(k.split(' ').join(NB)).join(v);
  return o;
};

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

export type Cue5 = { a: number; b: number; text: string };
export const CUES5: Cue5[] = (() => {
  const cues: Cue5[] = [];
  for (const s of SEGS5) {
    // panjang diukur dari teks yang diucapkan (huruf), tampilan memakai angka
    const parts = chunk(protect(s.text));
    const totalC = parts.reduce((x, p) => x + p.length, 0);
    let t = s.a;
    parts.forEach((p, i) => {
      const d = ((s.b - s.a) * p.length) / totalC;
      cues.push({ a: t, b: i === parts.length - 1 ? s.b + 0.25 : t + d, text: display(p) });
      t += d;
    });
  }
  return cues;
})();
