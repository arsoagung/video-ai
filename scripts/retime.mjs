#!/usr/bin/env node
// Sinkron suara per kalimat + jeda kontekstual (tanpa ElevenLabs, tanpa model transkripsi).
//
//   node scripts/retime.mjs analyze <KODE> <narasi.txt>   -> src/<kode>/segments.json (+ laporan)
//   node scripts/retime.mjs build   <KODE>                -> src/<kode>/sync.ts + out/<KODE>/vo_synced.wav
//
// analyze: bagi narasi jadi kalimat, deteksi jeda di mp3 (ffmpeg silencedetect), lalu cocokkan batas kalimat
//          ke jeda lewat pencocokan monoton (DP), BUKAN sekadar "jeda terdekat". Hasil: jendela bicara tiap kalimat.
// build:   baca src/<kode>/holds.json (jeda yang dipilih pembuat video), susun ulang audio: tiap kalimat dipotong
//          dari mp3 lalu ditaruh di waktu video baru dengan jeda sesuai konteks. Menulis sync.ts (waktu video)
//          dan wav untuk dimuxing oleh skrip render.
//
// holds.json (opsional; default 0.45 dtk):
//   { "default": 0.45, "lead": 0, "tail": 6, "after": { "3": 1.6, "9": 1.2 } }
//   "after": { "<nomor kalimat 1-based>": detik jeda SETELAH kalimat itu }.  "tail": ekor diam di akhir video.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [cmd, CODE, narasiFile] = process.argv.slice(2);
if (!cmd || !CODE) {
  console.error('usage: node scripts/retime.mjs analyze <KODE> <narasi.txt> | build <KODE>');
  process.exit(1);
}
const kode = CODE.toLowerCase();
const mp3 = `public/vo/${CODE}.mp3`;
const dir = `src/${kode}`;
const segFile = `${dir}/segments.json`;
const r2 = (x) => Math.round(x * 100) / 100;

// ---------------------------------------------------------------- analyze
function duration(file) {
  return parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }));
}

function detectPauses(file, noise, minDur, D) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', `silencedetect=noise=${noise}dB:d=${minDur}`, '-f', 'null', '-'], { encoding: 'utf8' });
  const out = [];
  let cur = null;
  for (const line of (r.stderr || '').split('\n')) {
    let m = line.match(/silence_start:\s*(-?[\d.]+)/);
    if (m) { cur = { s: Math.max(0, parseFloat(m[1])) }; continue; }
    m = line.match(/silence_end:\s*([\d.]+)/);
    if (m && cur) { cur.e = parseFloat(m[1]); out.push(cur); cur = null; }
  }
  if (cur) { cur.e = D; out.push(cur); }
  return out.map((p) => ({ s: p.s, e: p.e, d: p.e - p.s, m: (p.s + p.e) / 2 }));
}

function splitSentences(text) {
  const t = text.replace(/\r/g, '').trim();
  const re = /[.?!]["”')\]]*(?=\s|$)/g;
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(t))) {
    const end = m.index + m[0].length;
    const raw = t.slice(last, end);
    const rest = t.slice(end).match(/^\s*/)[0];
    out.push({ text: raw.replace(/\s+/g, ' ').trim(), para: rest.includes('\n') });
    last = end;
  }
  const tail = t.slice(last).replace(/\s+/g, ' ').trim();
  if (tail) out.push({ text: tail, para: false });
  return out.filter((s) => s.text);
}

// pecah satu kalimat jadi klausa di , : ; (kecuali angka seperti 1,5 atau 1.000)
function splitClauses(text) {
  const parts = [];
  let last = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if ((c === ',' || c === ':' || c === ';') && !(/\d/.test(text[i - 1] || '') && /\d/.test(text[i + 1] || ''))) {
      parts.push(text.slice(last, i + 1).trim());
      last = i + 1;
    }
  }
  const rest = text.slice(last).trim();
  if (rest) parts.push(rest);
  return parts.filter(Boolean);
}

function analyze() {
  if (!narasiFile) { console.error('butuh <narasi.txt>'); process.exit(1); }
  if (!fs.existsSync(mp3)) { console.error('mp3 tidak ada: ' + mp3); process.exit(1); }
  const D = duration(mp3);
  const sents = splitSentences(fs.readFileSync(narasiFile, 'utf8'));
  const N = sents.length;
  const NOISE = -38, MIN = 0.15;
  let pauses = detectPauses(mp3, NOISE, MIN, D);
  let sp0 = 0, sp1 = D;
  if (pauses.length && pauses[0].s < 0.05) { sp0 = pauses[0].e; pauses = pauses.slice(1); }
  if (pauses.length && pauses[pauses.length - 1].e > D - 0.08) { sp1 = pauses[pauses.length - 1].s; pauses = pauses.slice(0, -1); }
  const M = pauses.length;

  // klausa berurutan di seluruh narasi; batas antar-klausa bertipe: akhir kalimat (S), akhir paragraf (P), koma/titik dua (C)
  const spoken = (s) => s.length + 5 * (s.match(/\d/g) || []).length; // angka dibaca panjang
  const clauses = [];
  sents.forEach((s, si) => splitClauses(s.text).forEach((c, ci, arr) => clauses.push({ si, text: c, last: ci === arr.length - 1, para: s.para })));
  const K = clauses.length, B = K - 1;
  const totalW = clauses.reduce((x, c) => x + spoken(c.text), 0);
  // "jam ucapan": waktu tanpa jeda. Perkiraan posisi batas dihitung di jam ini supaya jeda tidak merusak perkiraan.
  let cp = 0;
  const pTau = pauses.map((p) => { const v = p.s - sp0 - cp; cp += p.d; return v; });
  const totalSpeech = sp1 - sp0 - pauses.reduce((x, p) => x + p.d, 0);
  const realOf = (tau) => sp0 + tau + pauses.reduce((x, p, i) => x + (pTau[i] <= tau ? p.d : 0), 0);
  let cum = 0;
  const bd = clauses.slice(0, B).map((c) => {
    cum += spoken(c.text);
    const tau = (cum / totalW) * totalSpeech;
    return { tau, exp: realOf(tau), type: c.last ? (c.para ? 'P' : 'S') : 'C', colon: /[:;]$/.test(c.text) };
  });

  // penyelarasan monoton (DP): tiap batas klausa dicocokkan ke satu jeda atau dilewati; jeda juga boleh tidak terpakai.
  const SIG = 1.2;
  const cMatch = (k, m) => {
    const p = pauses[m], q = bd[k];
    const dev = ((pTau[m] - q.tau) / SIG) ** 2;
    const reward = q.type === 'P' ? 3.0 : q.type === 'S' ? 2.0 : 0.3;
    return dev - reward * Math.min(p.d, 0.8) / 0.8;
  };
  const cSkipB = (k) => (bd[k].type === 'C' ? (bd[k].colon ? 0.9 : 0.5) : 8);
  const cSkipP = (m) => 0.5 + 2.0 * Math.min(pauses[m].d, 0.8) / 0.8;
  const INF = 1e9;
  const f = Array.from({ length: B + 1 }, () => new Float64Array(M + 1).fill(INF));
  const bt = Array.from({ length: B + 1 }, () => new Int8Array(M + 1));
  f[0][0] = 0;
  for (let k = 0; k <= B; k++)
    for (let m = 0; m <= M; m++) {
      const v = f[k][m];
      if (v >= INF) continue;
      if (m < M && v + cSkipP(m) < f[k][m + 1]) { f[k][m + 1] = v + cSkipP(m); bt[k][m + 1] = 1; }
      if (k < B && v + cSkipB(k) < f[k + 1][m]) { f[k + 1][m] = v + cSkipB(k); bt[k + 1][m] = 2; }
      if (k < B && m < M && v + cMatch(k, m) < f[k + 1][m + 1]) { f[k + 1][m + 1] = v + cMatch(k, m); bt[k + 1][m + 1] = 3; }
    }
  const match = Array(B).fill(-1);
  for (let k = B, m = M; k > 0 || m > 0; ) {
    const o = bt[k][m];
    if (o === 3) { match[k - 1] = m - 1; k--; m--; } else if (o === 2) k--; else if (o === 1) m--; else break;
  }

  // waktu tiap batas klausa: dari jeda yang cocok; kalau tidak ada, interpolasi di antara jangkar
  const bEdge = bd.map((q, k) => (match[k] >= 0 ? { s: pauses[match[k]].s, e: pauses[match[k]].e, anchored: true } : { s: q.exp, e: q.exp, anchored: false }));
  const clauseT = clauses.map((c, k) => ({
    a: k === 0 ? sp0 : bEdge[k - 1].e,
    b: k === K - 1 ? sp1 : bEdge[k].s,
    anchoredA: k === 0 || bEdge[k - 1].anchored,
    anchoredB: k === K - 1 || bEdge[k].anchored,
  }));

  const segs = sents.map((s, si) => {
    const cs = clauses.map((c, k) => ({ c, k })).filter((x) => x.c.si === si);
    const first = cs[0].k, lastK = cs[cs.length - 1].k;
    const a = clauseT[first].a, b = clauseT[lastK].b;
    const cl = cs.map(({ c, k }) => ({ text: c.text, a: r2(clauseT[k].a), b: r2(clauseT[k].b), anchored: clauseT[k].anchoredA && clauseT[k].anchoredB }));
    const flags = [];
    if (si < N - 1) {
      const q = bEdge[lastK];
      if (!q.anchored) flags.push('batas kalimat tanpa jeda (pakai perkiraan)');
      else {
        const p = pauses[match[lastK]];
        if (p.d < 0.25) flags.push('jeda pendek');
        if (Math.abs(pTau[match[lastK]] - bd[lastK].tau) > 1.5) flags.push(`menyimpang ${r2(pTau[match[lastK]] - bd[lastK].tau)}s dari perkiraan`);
      }
    }
    const pauseAfter = si < N - 1 && bEdge[lastK].anchored ? r2(bEdge[lastK].e - bEdge[lastK].s) : 0;
    return { n: si + 1, text: s.text, a: r2(a), b: r2(b), pauseAfter, clauses: cl, flags };
  });
  const out = { code: CODE, duration: r2(D), speech: [r2(sp0), r2(sp1)], noiseDb: NOISE, minPause: MIN, sentences: segs };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(segFile, JSON.stringify(out, null, 1));

  const used = match.filter((x) => x >= 0).length;
  console.log(`${CODE}: durasi ${r2(D)} dtk, bicara ${r2(sp0)}-${r2(sp1)}, ${N} kalimat / ${K} klausa, ${M} jeda terdeteksi (${used} cocok ke batas klausa)`);
  for (const s of segs) {
    const mark = s.flags.length ? '  !! ' + s.flags.join(', ') : '';
    console.log(`  ${String(s.n).padStart(2)} ${String(s.a).padStart(6)}-${String(s.b).padEnd(6)} jeda ${String(s.pauseAfter).padEnd(5)} klausa:${s.clauses.length}  ${s.text.slice(0, 46)}${mark}`);
  }
  const low = segs.filter((s) => s.flags.length).map((s) => s.n);
  console.log(low.length ? `Perlu dicek manual: kalimat ${low.join(', ')} (periksa still frame di batas itu)` : 'Semua batas kalimat meyakinkan.');
  console.log('->', segFile);
}

// ---------------------------------------------------------------- build
function build() {
  if (!fs.existsSync(segFile)) { console.error('jalankan analyze dulu: ' + segFile); process.exit(1); }
  const A = JSON.parse(fs.readFileSync(segFile, 'utf8'));
  const holdsFile = `${dir}/holds.json`;
  const H = fs.existsSync(holdsFile) ? JSON.parse(fs.readFileSync(holdsFile, 'utf8')) : {};
  const DEF = H.default ?? 0.45, LEAD = H.lead ?? 0, TAIL = H.tail ?? 6, AFTER = H.after ?? {};
  const S = A.sentences, N = S.length;
  const PAD = 0.04, FADE = 0.03;

  let t = LEAD;
  const placed = S.map((s, i) => {
    const len = s.b - s.a;
    const va = t, vb = t + len;
    const gap = i < N - 1 ? (AFTER[String(s.n)] ?? DEF) : 0;
    t = vb + gap;
    return { n: s.n, text: s.text, sa: s.a, sb: s.b, a: r2(va), b: r2(vb), gap: r2(gap), clauses: s.clauses.map((c) => ({ text: c.text, a: r2(c.a - s.a + va), b: r2(c.b - s.a + va), anchored: c.anchored })) };
  });
  const audioEnd = placed[N - 1].b;

  // audio: potong tiap kalimat (sedikit pad, di dalam jeda sumber) dan sambung dengan jeda baru
  const sp = placed.map((_, i) => `[s${i}]`).join('');
  const chain = [`[0:a]aformat=sample_rates=44100:channel_layouts=mono,asplit=${N}${sp}`];
  const order = [];
  if (LEAD > 0) { chain.push(`anullsrc=r=44100:cl=mono,atrim=0:${LEAD},asetpts=PTS-STARTPTS[g_lead]`); order.push('[g_lead]'); }
  placed.forEach((p, i) => {
    const x = Math.max(0, p.sa - PAD);
    const y = Math.min(A.duration, p.sb + PAD);
    const len = y - x;
    const fo = Math.max(0, len - FADE);
    chain.push(`[s${i}]atrim=start=${x.toFixed(3)}:end=${y.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${FADE},afade=t=out:st=${fo.toFixed(3)}:d=${FADE}[p${i}]`);
    order.push(`[p${i}]`);
    // jeda baru dihitung dari tepi bicara, jadi kurangi pad yang ikut terbawa di kedua sisi
    const gap = i < N - 1 ? Math.max(0, p.gap - (p.sb + PAD > S[i + 1].a - PAD ? 0 : 2 * PAD)) : 0;
    if (i < N - 1 && gap > 0) {
      chain.push(`anullsrc=r=44100:cl=mono,atrim=0:${gap.toFixed(3)},asetpts=PTS-STARTPTS[g${i}]`);
      order.push(`[g${i}]`);
    }
  });
  chain.push(`${order.join('')}concat=n=${order.length}:v=0:a=1[out]`);
  const outDir = `out/${CODE}`;
  fs.mkdirSync(outDir, { recursive: true });
  const wav = `${outDir}/vo_synced.wav`;
  const res = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp3, '-filter_complex', chain.join(';'), '-map', '[out]', '-c:a', 'pcm_s16le', wav], { encoding: 'utf8' });
  if (res.status !== 0) { console.error(res.stderr); process.exit(1); }

  const ts = `// OTOMATIS dari scripts/retime.mjs build ${CODE} (jangan diedit tangan; ubah src/${kode}/holds.json lalu jalankan ulang).
// a,b = waktu VIDEO (detik) awal/akhir ucapan tiap kalimat setelah jeda disusun ulang. sa,sb = waktu di mp3 asli.
// clauses = potongan klausa tiap kalimat (waktu video; anchored=true bila waktunya dari jeda nyata), dipakai untuk subtitle.
export type SyncClause = { text: string; a: number; b: number; anchored: boolean };
export type SyncSeg = { n: number; text: string; a: number; b: number; sa: number; sb: number; clauses: SyncClause[] };
export const SYNC_SEGS: SyncSeg[] = ${JSON.stringify(placed.map(({ gap, ...p }) => p), null, 1)};
export const AUDIO_END = ${audioEnd}; // akhir ucapan terakhir (waktu video)
export const TAIL = ${TAIL}; // ekor diam setelah ucapan terakhir
export const SYNC_DUR = ${r2(audioEnd + TAIL)};
`;
  fs.writeFileSync(`${dir}/sync.ts`, ts);

  const got = duration(wav);
  console.log(`${CODE}: ${N} kalimat disusun ulang. Ucapan berakhir ${audioEnd} dtk (wav ${r2(got)} dtk), total video ${r2(audioEnd + TAIL)} dtk (mp3 asli ${A.duration} dtk).`);
  console.log('jeda setelah kalimat (dtk):', placed.slice(0, -1).map((p) => `${p.n}:${p.gap}`).join(' '));
  console.log('->', `${dir}/sync.ts`, wav);
}

if (cmd === 'analyze') analyze();
else if (cmd === 'build') build();
else { console.error('perintah tidak dikenal: ' + cmd); process.exit(1); }
