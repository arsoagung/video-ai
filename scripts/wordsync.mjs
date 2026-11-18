#!/usr/bin/env node
// Waktu per kata (perkiraan) dari mp3: tiap klausa (batas dari retime) dibagi ke kata-kata sesuai jumlah suku kata
// pada timeline bicara aktif (jeda nyata >= 0,09 dtk dibuang). Angka/singkatan diperluas ke cara bacanya.
//   node scripts/wordsync.mjs <KODE>   -> src/<kode>/words.ts  (butuh src/<kode>/sync.ts dari retime build)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
const CODE = process.argv[2];
const kode = CODE.toLowerCase();
const src = fs.readFileSync(`src/${kode}/sync.ts`, 'utf8');
const segs = eval(src.slice(src.indexOf('= [') + 2, src.lastIndexOf(']') + 1));
const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', `public/vo/${CODE}.mp3`, '-af', 'silencedetect=noise=-32dB:d=0.09', '-f', 'null', '-'], { encoding: 'utf8' });
const pauses = [];
let cur = null;
for (const l of r.stderr.split('\n')) {
  let m = l.match(/silence_start:\s*(-?[\d.]+)/); if (m) { cur = Math.max(0, +m[1]); continue; }
  m = l.match(/silence_end:\s*([\d.]+)/); if (m && cur !== null) { pauses.push([cur, +m[1]]); cur = null; }
}
const SPOKEN = { 'cdc': 3, 'pep': 3, 'prep': 2, 'tbc': 3, 'arv': 3, 'hiv': 3, 'kemenkes': 4, '2025': 7, '72': 5, '68': 6, '13–64': 11, '13-64': 11, 'aids': 2, 'cd4': 4 };
const syl = (w) => {
  const k = w.toLowerCase().replace(/[^a-z0-9–-]/g, '');
  if (SPOKEN[k]) return SPOKEN[k];
  const v = (k.match(/[aeiou]+/g) || []).length;
  return Math.max(1, v) + (/[.,?!]$/.test(w) ? 0.4 : 0);
};
const out = [];
for (const s of segs) {
  for (let ci = 0; ci < s.clauses.length; ci++) {
    const c = s.clauses[ci];
    const ma = s.sa + (c.a - s.a), mb = s.sa + (c.b - s.a);
    const inner = pauses.filter(([a, b]) => a > ma + 0.02 && b < mb - 0.02).map(([a, b]) => [Math.max(a, ma), Math.min(b, mb)]);
    const act = []; let p = ma;
    for (const [a, b] of inner) { if (a > p) act.push([p, a]); p = b; }
    if (mb > p) act.push([p, mb]);
    const total = act.reduce((x, [a, b]) => x + b - a, 0);
    const ws = c.text.split(' ');
    const wt = ws.map(syl); const W = wt.reduce((x, y) => x + y, 0);
    const pos = (f) => { let d = f * total; for (const [a, b] of act) { if (d <= b - a) return a + d; d -= b - a; } return mb; };
    let cum = 0;
    ws.forEach((w, i) => {
      const a = pos(cum / W); cum += wt[i]; const b = pos(cum / W);
      out.push({ n: s.n, k: ci, text: w, a: +(a - s.sa + s.a).toFixed(2), b: +(b - s.sa + s.a).toFixed(2) });
    });
  }
}
fs.writeFileSync(`src/${kode}/words.ts`, `// OTOMATIS dari scripts/wordsync.mjs ${CODE} (jangan diedit tangan). Waktu VIDEO per kata (perkiraan berbasis suku kata + jeda nyata).\nexport type Word = { n: number; k: number; text: string; a: number; b: number };\nexport const WORDS: Word[] = ${JSON.stringify(out)};\n`);
console.log(out.length, 'kata ->', `src/${kode}/words.ts`);
