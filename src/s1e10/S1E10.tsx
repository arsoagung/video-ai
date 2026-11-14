import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T, T, CL, EP_DUR } from './timeline';

export const S1E10_FRAMES = Math.ceil(EP_DUR * FPS);

const useFonts = () => {
  const [handle] = React.useState(() => delayRender('fontsArv'));
  React.useEffect(() => {
    const defs: [number, string][] = [
      [400, 'plus-jakarta-sans-latin-400-normal.woff2'],
      [600, 'plus-jakarta-sans-latin-600-normal.woff2'],
      [800, 'plus-jakarta-sans-latin-800-normal.woff2'],
    ];
    Promise.all(
      defs.map(async ([w, file]) => {
        const ff = new FontFace('Plus Jakarta Sans', `url(${staticFile('fonts/' + file)})`, { weight: String(w) });
        await ff.load();
        document.fonts.add(ff);
      }),
    )
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};


// ---------------- sumber data baris sheet ----------------
// referensi: isi kolom `referensi` apa adanya (baris pertama = judul panel)
const REFERENSI = `Referensi

National Institutes of Health, HIVinfo. The Stages of HIV Infection. Ditinjau 31 Maret 2025.
https://hivinfo.nih.gov/understanding-hiv/fact-sheets/stages-hiv-infection

AIDS.gov. Signs and Symptoms of HIV (arsip, 2013).
https://webarchive.library.unt.edu/web/20130102200235/http://aids.gov/hiv-aids-basics/hiv-aids-101/signs-and-symptoms`;

const parseRefs = (raw: string) => {
  const blocks = raw.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const title = blocks[0];
  const items = blocks.slice(1).map((b) => {
    const lines = b.split('\n');
    const m = lines[0].match(/^(\d+)\.\s*(.*)$/);
    return { n: m ? m[1] : '', c: m ? m[2] : lines[0], u: lines.slice(1).join(' ') };
  });
  return { title, items };
};



// ---------------- latar gradien (bergeser halus tiap adegan) ----------------
type Grad = [string, string, string];
const CLOSE_GRAD: Grad = ['#0A2540', '#0F3B66', '#0B4F63'];
const BG: Grad[] = [
  ['#0A1F3D', '#123A60', '#17506F'], // 1 hook: biru laut
  ['#0D1B45', '#1E2F6B', '#2B4A85'], // 2 analogi mesin: biru tua
  ['#14183F', '#2A2A6B', '#3B4A8A'], // 3 gejala awal: indigo
  ['#08283A', '#0F4A5C', '#167A80'], // 4 fase kronis: teal
  ['#0A1F3D', '#123A60', '#17506F'], // 5 sepuluh tahun: biru laut
  ['#14183F', '#2A2A6B', '#3B4A8A'], // 6 tetap menular: indigo
  ['#08283A', '#0F4A5C', '#167A80'], // 7 tes: teal
  ['#0D1B45', '#1E2F6B', '#2B4A85'], // 8 penutup: biru tua
];

const GRADS: { t: number; c: Grad }[] = [...BG.map((c, i) => ({ t: SCENE_T[i], c })), { t: CLOSE, c: CLOSE_GRAD }];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
};
const gradAt = (t: number): Grad => {
  let i = 0;
  for (let j = 1; j < GRADS.length; j++) if (t >= GRADS[j].t) i = j;
  const prev = GRADS[Math.max(0, i - 1)].c;
  const cur = GRADS[i].c;
  const k = i === 0 ? 1 : Math.min(1, (t - GRADS[i].t) / 1.4);
  const e = k * k * (3 - 2 * k);
  return [mix(prev[0], cur[0], e), mix(prev[1], cur[1], e), mix(prev[2], cur[2], e)];
};

// zoom-out halus tiap layer baru masuk
const settle = (t: number) => {
  let z = 0;
  for (const T of [...SCENE_T]) if (t >= T) z += 0.03 * (1 - ez(t, T, T + 1.0, out3));
  return 1 + z;
};

// ---------------- pill & label ----------------
const PK = {
  virus: { bg: '#FF9C85', fg: '#3B1308' },
  cell: { bg: '#8FBDF7', fg: '#0E2A52' },
  recep: { bg: '#F4D77E', fg: '#4A3606' },
  arv: { bg: '#72E3D3', fg: '#063F38' },
  neutral: { bg: '#EAF2FB', fg: '#12304F' },
  gray: { bg: '#B9C3D0', fg: '#1D2A3A' },
  imun: { bg: '#B9A2F5', fg: '#26104F' },
} as const;
type KK = keyof typeof PK;
const pillW = (text: string, size: number) => text.length * size * 0.56 + size * 1.5;
const PillBox: React.FC<{ x: number; y: number; text: string; k: KK; size?: number; op: number }> = ({ x, y, text, k, size = 36, op }) => {
  const w = pillW(text, size);
  const h = size * 1.9;
  const left = Math.max(36, Math.min(1080 - 36 - w, x - w / 2));
  return (
    <div
      style={{
        position: 'absolute', left, top: y - h / 2, width: w, height: h, borderRadius: h / 2,
        background: PK[k].bg, color: PK[k].fg, fontFamily: FONT, fontWeight: 800, fontSize: size,
        display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap',
        opacity: op, transform: `scale(${0.88 + 0.12 * op})`, boxShadow: '0 8px 22px rgba(0,0,0,0.28)',
      }}
    >
      {text}
    </div>
  );
};

// legenda kontekstual (hanya visual abstrak): pill kecil di y=250, titik warna + label, maks 3 item
const LegendBox: React.FC<{ t: number; a: number; b: number; items: [string, string][] }> = ({ t, a, b, items }) => {
  const k = win(t, a, b, 0.5);
  if (k < 0.01) return null;
  return (
    <div style={{ position: 'absolute', top: 250, width: '100%', display: 'flex', justifyContent: 'center', opacity: 0.92 * k }}>
      <div style={{ display: 'flex', gap: 34, background: 'rgba(8,24,46,0.38)', borderRadius: 999, padding: '12px 30px', fontFamily: FONT, fontWeight: 600, fontSize: 28, color: '#EAF2FB' }}>
        {items.map(([c, label]) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
// ---------------- subtitle (narasi_final persis) ----------------
const ACC: Record<string, string> = {
  cd4: '#8FBDF7', hiv: '#FFB7A5', viral: '#FFB7A5', load: '#FFB7A5', virus: '#FFB7A5', rna: '#FFB7A5', arv: '#72E3D3', obat: '#72E3D3',
  reverse: '#72E3D3', transcriptase: '#72E3D3', integrase: '#72E3D3', protease: '#72E3D3', dolutegravir: '#72E3D3',
  nrti: '#72E3D3', nnrti: '#72E3D3', pep: '#72E3D3', tld: '#72E3D3',
};
const Sub: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(' ').map((w, i) => {
      const c = ACC[w.toLowerCase().replace(/[^a-z0-9]/g, '')];
      return (
        <React.Fragment key={i}>
          {i > 0 ? ' ' : ''}
          <span style={{ whiteSpace: 'nowrap', ...(c ? { color: c, fontWeight: 800 } : {}) }}>{w}</span>
        </React.Fragment>
      );
    })}
  </>
);


// ================= ADEGAN (ditulis per episode, animasi bercerita) =================
const pr = (t: number, a: number, b: number, e: (x: number) => number = out3) => ez(t, a, b, e);
const Virus: React.FC<{ x: number; y: number; r: number; dim?: number; t: number; seed?: number }> = ({ x, y, r, dim = 1, t, seed = 0 }) =>
  r < 2 || dim < 0.01 ? null : <FlatVirus cx={x} cy={y} r={r} dim={dim} rot={t * 5 + seed * 40} />;

const SceneWrap: React.FC<{ i: number; t: number; children: React.ReactNode }> = ({ i, t, children }) => {
  const o = win(t, SCENE_T[i], SCENE_T[i + 1] + 0.25, 0.45);
  if (o < 0.005) return null;
  return <g opacity={o}>{children}</g>;
};

const GREEN = '#7ED6A8';
const CD4C = '#8FBDF7';
const Cell: React.FC<{ x: number; y: number; r: number; op?: number }> = ({ x, y, r, op = 1 }) =>
  r < 2 || op < 0.01 ? null : <FlatCell cx={x} cy={y} r={r} color={SHAPE_COL.cd4} nuc={SHAPE_COL.cd4Dark} op={op} rec={0.7} />;

// ---- Adegan 1 (kalimat 1-2): orang tampak sehat (hati hijau, centang) tapi ada virus di dalam; lalu kalender bertahun-tahun terisi, orang tetap sama
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const s2 = T(2);
  const enter = pr(t, 0.2, 1.0, back);
  const heart = pr(t, 0.7, 1.4, back);
  const check = pr(t, 1.4, 2.1, back);
  const v = pr(t, 2.0, 2.7, back);
  const px = lerp(540, 290, pr(t, s2, s2 + 0.9, sine));
  const cal = pr(t, s2 + 0.5, s2 + 1.3, back);
  const prog = pr(t, s2 + 0.9, s2 + 4.0, sine);
  const marks = Array.from({ length: Math.floor(prog * 14) }, (_, i) => i * 2);
  const yrs = Math.min(8, Math.floor(prog * 8.4));
  const vx = lerp(0, -0, 0);
  return (
    <>
      <L.Person cx={px} cy={940} s={2.2 * enter} op={enter} />
      <L.Heart cx={px} cy={900} s={0.6 * heart} op={heart} color={GREEN} />
      <Virus x={px + 36 + vx} y={1010} r={24 * v} dim={0.95} t={t} />
      <L.CheckBadge cx={px + 230} cy={700} s={0.8 * check * (1 - 0.3 * pr(t, s2, s2 + 0.8))} op={check * (1 - 0.35 * pr(t, s2, s2 + 0.8))} />
      <L.Calendar cx={780} cy={800} s={1.55 * cal} op={cal} marks={marks} markColor={LIB_COL.good} />
      <text x={780} y={1090} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={800} fill="#FFFFFF" opacity={cal * (yrs > 0 ? 1 : 0)}>{yrs} tahun</text>
    </>
  );
};

// ---- Adegan 2 (kalimat 3-4): mesin (roda gigi) normal; casing menutup (terlihat baik); casing memudar, karat tumbuh di dalam
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const s3 = T(3), c1 = CL(4, 0), c2 = CL(4, 1);
  const enter = pr(t, s3, s3 + 0.8, back);
  const spin = (t - s3) * 36 * (1 - 0.65 * pr(t, c2, c2 + 3.4, sine));
  const ok = pr(t, s3 + 1.4, s3 + 2.1, back);
  const casing = pr(t, c1, c1 + 0.7) * (1 - 0.85 * pr(t, c2 - 0.1, c2 + 0.8));
  const rust = pr(t, c2 + 0.6, c2 + 3.5, sine);
  return (
    <>
      <L.Gear cx={540} cy={900} s={2.0 * enter} rot={spin} op={enter} rust={rust} />
      <rect x={300} y={660} width={480} height={480} rx={110} fill="#EAF2FB" opacity={0.92 * casing} />
      <L.CheckBadge cx={780} cy={680} s={0.8 * ok * (1 - 0.8 * pr(t, c2, c2 + 0.8))} op={ok} />
      <L.CrossBadge cx={780} cy={680} s={0.8 * pr(t, c2 + 2.3, c2 + 3.0, back)} op={pr(t, c2 + 2.3, c2 + 3.0)} />
    </>
  );
};

// ---- Adegan 3 (kalimat 5-7): virus masuk tubuh; minggu pertama: sebagian punya gejala (flu, ruam, tenggorokan); sebagian tanpa gejala
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const s5 = T(5), s6 = T(6), s7 = T(7);
  const enter = pr(t, s5, s5 + 0.7, back);
  const fly = pr(t, s5 + 0.5, s5 + 1.6, sine);
  const inside = pr(t, s5 + 1.5, s5 + 1.9);
  const ax = lerp(540, 290, pr(t, s6, s6 + 0.9, sine));
  const cal = pr(t, s6 + 0.2, s6 + 0.9, back);
  const marks = [0, 1, 2, 7, 8, 9].filter((_, i) => t >= s6 + 0.4 + i * 0.12);
  const bubbleOut = 1 - pr(t, s7 - 0.2, s7 + 0.4);
  const b = pr(t, s7 + 0.2, s7 + 0.9, back);
  const vb = pr(t, s7 + 0.9, s7 + 1.5, back);
  const x = pr(t, s7 + 1.3, s7 + 1.9, back);
  return (
    <>
      <L.Person cx={ax} cy={1000} s={2.0 * enter} op={enter} />
      <Virus x={lerp(100, ax + 30, fly)} y={lerp(700, 1070, fly)} r={46 * (1 - 0.45 * inside)} dim={pr(t, s5 + 0.3, s5 + 0.6) * (1 - 0.0 * inside)} t={t} />
      <g opacity={cal * bubbleOut}>
        <L.Calendar cx={ax + 380} cy={600} s={0.9 * cal} marks={marks} />
      </g>
      <L.Person cx={800} cy={1000} s={2.0 * b} op={b} color="#B9A2F5" />
      <Virus x={830} y={1070} r={22 * vb} dim={0.95} t={t} seed={2} />
      <L.CrossBadge cx={800} cy={720} s={0.75 * x} op={x} />
    </>
  );
};

// ---- Adegan 4 (kalimat 8-9): fase kronis: virus memperbanyak diri sementara sel CD4 perlahan berkurang; grafik CD4 turun
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const s8 = T(8), s9 = T(9), c2 = CL(9, 1), c4 = CL(9, 3);
  const xs = [190, 410, 630, 850];
  const cellIn = (i: number) => pr(t, s8 + 0.1 + i * 0.14, s8 + 0.8 + i * 0.14, back);
  const fade = (i: number) => 1 - [0.0, 0.55, 0.75, 0.85][i] * pr(t, c2 + 0.4 + i * 0.5, c2 + 2.0 + i * 0.9, sine);
  const vIn = pr(t, s8 + 0.9, s8 + 1.6, back);
  const copies = [[-190, 40], [210, -40], [-100, 160], [140, 150], [-300, 140], [300, 130]];
  const chartOn = pr(t, s9 + 0.2, s9 + 1.0, back);
  const prog = pr(t, c2, c4 + 2.6, sine);
  return (
    <>
      {xs.map((x, i) => (
        <Cell key={i} x={x} y={900} r={78 * cellIn(i) * (0.78 + 0.22 * fade(i))} op={cellIn(i) * (0.35 + 0.65 * fade(i))} />
      ))}
      <Virus x={540} y={560} r={52 * vIn} t={t} />
      {copies.map(([dx, dy], i) => {
        const k = pr(t, s9 + 0.3 + i * 0.28, s9 + 0.9 + i * 0.28, back);
        return <Virus key={i} x={540 + dx * k} y={560 + dy * k} r={30 * k} dim={0.9} t={t} seed={i + 1} />;
      })}
      <L.LineChart cx={540} cy={1200} s={chartOn} op={chartOn} w={800} h={320} color={CD4C} points={[0.9, 0.84, 0.76, 0.66, 0.54, 0.42, 0.32]} progress={prog} />
    </>
  );
};

// ---- Adegan 5 (kalimat 10-11): garis waktu sepuluh tahun tanpa gejala; lalu perisai kekebalan melemah, CD4 jatuh di bawah batas (tahap AIDS)
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const s10 = T(10), s11 = T(11);
  const bar = pr(t, s10, s10 + 0.7, back);
  const k = pr(t, s10 + 0.5, s10 + 3.6, sine);
  const yrs = Math.min(10, Math.floor(k * 10.4));
  const tl = 1 - pr(t, s11 - 0.1, s11 + 0.5);
  const x0 = 150, x1 = 930;
  const sh = pr(t, s11 + 0.1, s11 + 0.9, back);
  const weak = pr(t, CL(11, 0) + 0.2, CL(11, 0) + 3.2, sine);
  const chartOn = pr(t, s11 + 0.8, s11 + 1.5, back);
  return (
    <>
      <g opacity={tl}>
        <rect x={x0} y={796} width={x1 - x0} height={24} rx={12} fill="#fff" fillOpacity={0.18} opacity={bar} />
        <rect x={x0} y={796} width={Math.max(24, (x1 - x0) * k)} height={24} rx={12} fill={LIB_COL.good} opacity={bar} />
        {Array.from({ length: 11 }, (_, i) => (
          <circle key={i} cx={x0 + ((x1 - x0) * i) / 10} cy={808} r={i <= yrs ? 12 : 7} fill={i <= yrs ? '#FFFFFF' : LIB_COL.track} opacity={bar} />
        ))}
        <L.Person cx={x0 + (x1 - x0) * k} cy={650} s={0.8 * bar} op={bar} />
        <text x={540} y={1010} textAnchor="middle" fontFamily={FONT} fontSize={110} fontWeight={800} fill="#FFFFFF" opacity={bar}>{yrs}+ tahun</text>
        <L.CheckBadge cx={540} cy={1160} s={0.7 * pr(t, s10 + 2.6, s10 + 3.3, back)} op={pr(t, s10 + 2.6, s10 + 3.3)} />
      </g>
      <L.Shield cx={540} cy={640} s={(1.25 - 0.45 * weak) * sh} op={sh * (1 - 0.65 * weak)} color={lerp(0, 1, weak) > 0.5 ? '#B9C3D0' : LIB_COL.good} />
      <L.LineChart cx={540} cy={1060} s={chartOn} op={chartOn} w={800} h={320} color={CD4C} threshold={0.22} points={[0.7, 0.55, 0.42, 0.3, 0.2, 0.12]} progress={pr(t, CL(11, 0) + 0.4, CL(11, 0) + 3.4, sine)} />
    </>
  );
};

// ---- Adegan 6 (kalimat 12-14): tanpa gejala bukan berarti aman (perisai dicoret); virus berpindah ke orang lain; di awal infeksi virus di darah sangat banyak
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const s12 = T(12), s13 = T(13), s14 = T(14), c3 = CL(14, 2);
  const a = pr(t, s12, s12 + 0.7, back);
  const aOut = 1 - pr(t, s14 - 0.2, s14 + 0.4);
  const ok = pr(t, s12 + 0.6, s12 + 1.2, back);
  const sh = pr(t, s12 + 0.9, s12 + 1.6, back) * (1 - pr(t, s13 - 0.3, s13 + 0.2));
  const crossK = pr(t, s12 + 1.7, s12 + 2.3, back);
  const bIn = pr(t, s13 + 0.1, s13 + 0.8, back);
  const go = pr(t, s13 + 0.4, s13 + 1.5, sine);
  const arrive = pr(t, s13 + 1.3, s13 + 1.7);
  const tube = pr(t, s14, s14 + 0.8, back);
  const cols = [-52, 0, 52];
  const spots: [number, number][] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) spots.push([cols[c] + (r % 2 ? 14 : -14), 1100 - r * 56]);
  return (
    <>
      <g opacity={aOut}>
        <L.Person cx={250} cy={950} s={1.9 * a} op={a} />
        <L.CheckBadge cx={250} cy={690} s={0.7 * ok} op={ok} />
        <L.Shield cx={640} cy={900} s={0.95 * sh} op={sh} />
        <L.CrossBadge cx={640} cy={900} s={0.8 * crossK} op={crossK * sh} />
        <L.Person cx={830} cy={950} s={1.9 * bIn} op={bIn} color="#B9A2F5" />
        <Virus x={lerp(300, 770, go)} y={lerp(1010, 1000, go)} r={34 * pr(t, s13 + 0.3, s13 + 0.6) * (1 - arrive)} dim={0.95} t={t} />
        <Virus x={850} y={1010} r={24 * arrive} t={t} seed={3} />
      </g>
      <L.BloodTube cx={540} cy={860} s={2.4 * tube} op={tube} level={0.75} />
      {spots.map(([dx, y], i) => {
        const k = pr(t, s14 + 0.9 + i * 0.07 + (i > 4 ? 1.3 : 0) + (i > 9 ? 0.4 : 0), s14 + 1.4 + i * 0.07 + (i > 4 ? 1.3 : 0) + (i > 9 ? 0.4 : 0), back);
        return <Virus key={i} x={540 + dx} y={y} r={17 * k} dim={0.95} t={t} seed={i} />;
      })}
    </>
  );
};

// ---- Adegan 7 (kalimat 15-17): gejala dicoret sebagai patokan; tetes darah -> alat tes -> hasil/status diketahui; jam cepat lalu kapsul ARV sampai ke orang
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const s15 = T(15), c2 = CL(15, 1), s16 = T(16), s17 = T(17), c2b = CL(17, 1);
  const a = pr(t, s15, s15 + 0.7, back);
  const bub = pr(t, s15 + 0.4, s15 + 1.0, back) * (1 - pr(t, s16 - 0.1, s16 + 0.5));
  const cr = pr(t, c2 + 0.4, c2 + 1.0, back) * (1 - pr(t, s16 - 0.1, s16 + 0.5));
  const kitIn = pr(t, s16 + 0.1, s16 + 0.8, back) * (1 - pr(t, s17 - 0.3, s17 + 0.3));
  const drop = pr(t, s16 + 0.5, s16 + 1.3, in3);
  const dropOp = pr(t, s16 + 0.4, s16 + 0.7) * (1 - pr(t, s16 + 1.3, s16 + 1.6));
  const doc = pr(t, s16 + 1.9, s16 + 2.6, back) * (1 - pr(t, s17 - 0.3, s17 + 0.3));
  const clk = pr(t, s17, s17 + 0.7, back);
  const sweep = pr(t, s17 + 0.4, c2b + 0.1, sine);
  const cap = pr(t, c2b, c2b + 1.5, sine);
  const heart = pr(t, c2b + 1.4, c2b + 2.0, back);
  return (
    <>
      <L.Person cx={300} cy={1020} s={2.0 * a} op={a} />
      <L.SpeechBubble cx={400} cy={640} s={bub} op={bub} text="gejala" w={300} />
      <L.CrossBadge cx={400} cy={640} s={0.8 * cr} op={cr} />
      <L.TestKit cx={780} cy={1050} s={1.15 * kitIn} op={kitIn} lines={1} />
      <L.BloodDrop cx={780} cy={lerp(620, 900, drop)} s={0.55} op={dropOp} />
      <L.Document cx={780} cy={640} s={1.0 * doc} op={doc} stamp />
      <L.Clock cx={720} cy={680} s={1.2 * clk} op={clk} frac={0.02 + 0.96 * sweep} hour={3} />
      <L.Capsule cx={lerp(1150, 520, cap)} cy={lerp(900, 1020, cap)} s={0.9} rot={lerp(-30, 0, cap)} op={pr(t, c2b, c2b + 0.4) * (1 - heart)} />
      <L.Heart cx={300} cy={980} s={0.6 * heart} op={heart} color={GREEN} />
    </>
  );
};

// ---- Adegan 8 (kalimat 18): "merasa sehat bukan bukti" - orang sehat dicoret; alat tes muncul sebagai jalan untuk mengetahui
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const s18 = T(18);
  const a = pr(t, s18, s18 + 0.7, back);
  const h = pr(t, s18 + 0.3, s18 + 0.9, back);
  const x = pr(t, s18 + 0.9, s18 + 1.5, back);
  const kit = pr(t, s18 + 2.1, s18 + 2.8, back);
  const ok = pr(t, s18 + 2.7, s18 + 3.3, back);
  const px = lerp(540, 300, pr(t, s18 + 1.9, s18 + 2.6, sine));
  return (
    <>
      <L.Person cx={px} cy={980} s={2.1 * a} op={a} />
      <L.Heart cx={px} cy={940} s={0.55 * h} op={h} color={GREEN} />
      <L.CrossBadge cx={px + 220} cy={720} s={0.8 * x} op={x} />
      <L.TestKit cx={780} cy={1000} s={1.2 * kit} op={kit} lines={1} />
      <L.CheckBadge cx={780} cy={720} s={0.8 * ok} op={ok} />
    </>
  );
};

const PILLS: { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number }[] = [
  { a: 1.4, b: T(2) - 0.2, text: 'tampak sehat', k: 'neutral', x: 540, y: 1250, size: 38 },
  { a: T(2) + 1.2, b: T(3) - 0.2, text: 'tanpa gejala', k: 'neutral', x: 780, y: 1200, size: 38 },
  { a: T(3) + 1.0, b: T(4) - 0.1, text: 'mesin normal', k: 'neutral', x: 540, y: 1200, size: 46 },
  { a: CL(4, 1) + 2.0, b: T(5) - 0.2, text: 'karat', k: 'virus', x: 540, y: 1200, size: 52 },
  { a: T(5) + 0.4, b: T(6) - 0.1, text: 'tanpa pengobatan', k: 'neutral', x: 540, y: 520, size: 40 },
  { a: CL(6, 1) + 0.8, b: T(7) - 0.2, text: 'gejala seperti flu', k: 'neutral', x: 560, y: 440, size: 34 },
  { a: CL(6, 2) - 0.2, b: T(7) - 0.2, text: 'ruam', k: 'neutral', x: 560, y: 520, size: 34 },
  { a: CL(6, 3) - 0.2, b: T(7) - 0.2, text: 'sakit tenggorokan', k: 'neutral', x: 560, y: 600, size: 34 },
  { a: T(7) + 1.8, b: T(8) - 0.3, text: 'tanpa gejala', k: 'neutral', x: 800, y: 1260, size: 38 },
  { a: T(8) + 0.9, b: T(9) - 0.2, text: 'fase kronis', k: 'neutral', x: 540, y: 380, size: 46 },
  { a: CL(9, 0) + 0.2, b: CL(9, 1) - 0.1, text: 'virus memperbanyak diri', k: 'virus', x: 540, y: 380, size: 38 },
  { a: CL(9, 2) + 0.2, b: T(10) - 0.2, text: 'CD4 menurun', k: 'cell', x: 540, y: 380, size: 44 },
  { a: T(10) + 1.0, b: T(11) - 0.3, text: 'tanpa gejala', k: 'neutral', x: 540, y: 470, size: 46 },
  { a: T(11) + 1.0, b: T(12) - 0.2, text: 'tahap AIDS', k: 'virus', x: 540, y: 400, size: 48 },
  { a: T(12) + 1.0, b: T(13) - 0.3, text: 'bukan berarti aman', k: 'neutral', x: 540, y: 1230, size: 40 },
  { a: T(13) + 0.5, b: T(14) - 0.2, text: 'menular', k: 'virus', x: 540, y: 1230, size: 46 },
  { a: CL(14, 1) + 0.1, b: T(15) - 0.2, text: 'awal infeksi', k: 'neutral', x: 540, y: 400, size: 44 },
  { a: CL(14, 2) + 0.4, b: T(15) - 0.2, text: 'virus sangat banyak', k: 'virus', x: 540, y: 1260, size: 40 },
  { a: T(16) + 0.3, b: T(17) - 0.3, text: 'tes HIV', k: 'recep', x: 780, y: 1250, size: 44 },
  { a: T(16) + 2.0, b: T(17) - 0.3, text: 'status diketahui', k: 'neutral', x: 780, y: 470, size: 36 },
  { a: T(17) + 0.5, b: CL(17, 1) - 0.1, text: 'cepat diketahui', k: 'neutral', x: 720, y: 470, size: 38 },
  { a: CL(17, 1) + 0.9, b: T(18) - 0.2, text: 'ARV dimulai', k: 'arv', x: 540, y: 470, size: 46 },
  { a: T(18) + 1.0, b: CLOSE - 0.2, text: 'bukan bukti', k: 'neutral', x: 540, y: 1240, size: 46 },
];
const Pills: React.FC<{ t: number }> = ({ t }) => (
  <>
    {PILLS.map((p, i) => {
      const o = win(t, p.a, p.b, 0.3);
      return o > 0.01 ? <PillBox key={i} x={p.x} y={p.y} text={p.text} k={p.k} size={p.size} op={o} /> : null;
    })}
  </>
);


// ================= penutup: logo, referensi, Dukung dan follow kami =================
const Glyph: React.FC<{ name: string }> = ({ name }) => {
  if (name === 'ig')
    return (
      <svg width={34} height={34} viewBox="0 0 34 34">
        <rect x={5} y={5} width={24} height={24} rx={7} fill="none" stroke="#fff" strokeWidth={3} />
        <circle cx={17} cy={17} r={5.5} fill="none" stroke="#fff" strokeWidth={3} />
        <circle cx={24} cy={10} r={1.9} fill="#fff" />
      </svg>
    );
  if (name === 'yt')
    return (
      <svg width={34} height={34} viewBox="0 0 34 34">
        <rect x={3} y={8} width={28} height={18} rx={6} fill="#fff" />
        <polygon points="14,12 14,22 23,17" fill="#FF0000" />
      </svg>
    );
  if (name === 'tt') {
    const d = 'M19 6 V21 A5 5 0 1 1 14 16 M19 6 C19 10 22 12 26 12';
    return (
      <svg width={34} height={34} viewBox="0 0 34 34" fill="none" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} stroke="#25F4EE" transform="translate(-1.6 -1)" />
        <path d={d} stroke="#FE2C55" transform="translate(1.6 1)" />
        <path d={d} stroke="#fff" />
      </svg>
    );
  }
  return (
    <svg width={34} height={34} viewBox="0 0 34 34">
      <path d="M17 28 C6 20 4 13 8.5 9.5 C12 7 15.5 8.5 17 11.5 C18.5 8.5 22 7 25.5 9.5 C30 13 28 20 17 28 Z" fill="#fff" />
    </svg>
  );
};

const HeartIcon: React.FC<{ s?: number; c?: string }> = ({ s = 1, c = '#fff' }) => (
  <svg width={26 * s} height={26 * s} viewBox="0 0 34 34">
    <path d="M17 28 C6 20 4 13 8.5 9.5 C12 7 15.5 8.5 17 11.5 C18.5 8.5 22 7 25.5 9.5 C30 13 28 20 17 28 Z" fill={c} />
  </svg>
);

const PLATFORMS = [
  { key: 'ig', name: 'Instagram', handle: '@maknapositif', icon: 'linear-gradient(135deg,#FEDA75 0%,#FA7E1E 28%,#D62976 55%,#962FBF 78%,#4F5BD5 100%)', btn: '+ Follow', done: 'Following' },
  { key: 'yt', name: 'YouTube', handle: '@maknapositif', icon: '#FF0000', btn: '+ Subscribe', done: 'Subscribed' },
  { key: 'tt', name: 'TikTok', handle: '@maknapositif', icon: '#0B0B0F', btn: '+ Follow', done: 'Following' },
  { key: 'sw', name: 'Saweria', handle: 'saweria.co/maknapositif', icon: '#F97316', btn: 'Donate', done: 'Donate' },
];

const Check: React.FC = () => (
  <svg width={26} height={26} viewBox="0 0 26 26" style={{ marginRight: 6 }}>
    <path d="M5 13.5 L10.5 19 L21 7.5" fill="none" stroke="#14B8A6" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Closing: React.FC<{ t: number }> = ({ t }) => {
  const k = ez(t, CLOSE, CLOSE + 1.0, out3); // logo
  if (k < 0.01) return null;
  const kRef = ez(t, CLOSE + 0.7, CLOSE + 1.7, out3);
  const kBox = ez(t, CLOSE + 1.5, CLOSE + 2.5, out3);
  const refs = parseRefs(REFERENSI);
  const hasRef = refs.items.length > 0;
  const tRows = CLOSE + 2.2;
  const tPress = tRows + 4 * 0.15 + 1.2;
  const pressed = t >= tPress + 0.25;
  const press = (t >= tPress && t < tPress + 0.5) ? 1 - 0.12 * Math.sin(((t - tPress) / 0.5) * Math.PI) : 1;
  const pulse = 1 + 0.045 * Math.sin(Math.max(0, t - tRows) * 4.2);
  const beat = 1 + 0.18 * Math.max(0, Math.sin(Math.max(0, t - tRows) * 5.2)) ** 3;
  return (
    <>
      <Img
        src={staticFile('logo-makna-positif.png')}
        style={{ position: 'absolute', left: 540 - 280, top: 60, width: 560, height: 560, opacity: k, transform: `scale(${0.96 + 0.04 * k})` }}
      />
      <div style={{ position: 'absolute', left: 60, top: 500, width: 960, display: 'flex', flexDirection: 'column', gap: 50 }}>
        {hasRef && (
          <div
            style={{
              borderRadius: 40, padding: '34px 46px 26px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.08))', boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
              opacity: kRef, transform: `translateY(${(1 - kRef) * 20}px)`, fontFamily: FONT, color: '#EAF2FB',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 38, letterSpacing: 1, marginBottom: 18, color: '#FFFFFF' }}>{refs.title}</div>
            {refs.items.map((r, i) => (
              <div key={i} style={{ marginBottom: 16, display: 'flex', gap: 14 }}>
                {r.n && <div style={{ fontWeight: 800, fontSize: 25, color: '#72E3D3', width: 34, flexShrink: 0 }}>{r.n}.</div>}
                <div>
                  <div style={{ fontWeight: 400, fontSize: 25, lineHeight: 1.28 }}>{r.c}</div>
                  {r.u && <div style={{ fontWeight: 600, fontSize: 24, lineHeight: 1.25, color: '#8FBDF7', wordBreak: 'break-all' }}>{r.u}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
        <div
          style={{
            borderRadius: 40, padding: '34px 46px 20px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.08))', boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
            opacity: kBox, transform: `translateY(${(1 - kBox) * 20}px)`, fontFamily: FONT, color: '#FFFFFF',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 38, marginBottom: 14 }}>Dukung dan follow kami</div>
          {PLATFORMS.map((p, i) => {
            const r = ez(t, tRows + i * 0.15, tRows + i * 0.15 + 0.55, out3);
            const isDonate = p.key === 'sw';
            const done = pressed && !isDonate;
            return (
              <div key={p.key} style={{ height: 82, display: 'flex', alignItems: 'center', opacity: r, transform: `translateY(${(1 - r) * 26}px)` }}>
                <div style={{ width: 58, height: 58, borderRadius: 16, background: p.icon, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transform: isDonate ? `scale(${beat})` : undefined }}>
                  <Glyph name={p.key} />
                </div>
                <div style={{ width: 190, marginLeft: 20, fontWeight: 600, fontSize: 30, flexShrink: 0 }}>{p.name}</div>
                <div style={{ fontWeight: 800, fontSize: 28, flex: 1, whiteSpace: 'nowrap' }}>{p.handle}</div>
                <div
                  style={{
                    width: 196, height: 52, borderRadius: 26, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 25, color: done ? '#14B8A6' : '#FFFFFF',
                    background: done ? 'rgba(8,24,46,0.55)' : isDonate ? '#F97316' : '#2F80ED',
                    transform: `scale(${isDonate ? pulse : press})`,
                  }}
                >
                  {done && <Check />}
                  {isDonate && <span style={{ marginRight: 8, display: 'flex' }}><HeartIcon s={0.9} /></span>}
                  {done ? p.done : p.btn}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ================= komposisi =================
export const S1E10Full: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = gradAt(t);
  const cue = CUES.find((c) => t >= c.a - 0.05 && t < c.b);
  const ck = cue ? Math.min(1, (t - cue.a + 0.05) / 0.18) : 0;
  const subOn = t < CLOSE - 0.05;
  const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg,${g[0]} 0%,${g[1]} 55%,${g[2]} 100%)` }}>
      <AbsoluteFill style={{ background: 'radial-gradient(760px 760px at 50% 40%, rgba(120,190,255,0.22), transparent 70%)' }} />
      {t < CLOSE + 0.3 && (
        <AbsoluteFill style={{ transform: `scale(${settle(t)})`, transformOrigin: '50% 45%', opacity: 1 - ez(t, CLOSE - 0.1, CLOSE + 0.4) }}>
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
            {scenes.map((S, i) => (
              <SceneWrap key={i} i={i} t={t}>
                <S t={t} />
              </SceneWrap>
            ))}
          </svg>
          <Pills t={t} />
          <LegendBox t={t} a={2.0} b={T(2) - 0.3} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={CL(4, 1) + 0.3} b={T(5) - 0.2} items={[['#E39A5B', 'Karat = virus HIV'], ['#B3C7DC', 'Mesin = tubuh']]} />
          <LegendBox t={t} a={T(5) + 0.3} b={T(6) - 0.2} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(8) + 0.2} b={T(9) - 0.1} items={[['#8FBDF7', 'Sel CD4'], ['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(9) + 0.2} b={T(10) - 0.2} items={[['#8FBDF7', 'Jumlah CD4']]} />
          <LegendBox t={t} a={CL(11, 0) + 0.2} b={T(12) - 0.2} items={[['#8FBDF7', 'Jumlah CD4'], ['#FF6B4D', 'Batas tahap lanjut']]} />
          <LegendBox t={t} a={T(13) + 0.2} b={T(14) - 0.2} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(14) + 0.3} b={T(15) - 0.2} items={[['#FF9C85', 'Virus HIV di dalam tabung darah']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile("vo/S1E10.mp3")} />
    </AbsoluteFill>
  );
};
