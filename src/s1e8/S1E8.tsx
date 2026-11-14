import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, SHAPE_COL } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T, T, EP_DUR } from './timeline';

export const S1E8_FRAMES = Math.ceil(EP_DUR * FPS);

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

HIV.gov. HIV Testing Overview. Diperbarui 27 Mei 2026.
https://www.hiv.gov/hiv-basics/hiv-testing/learn-about-hiv-testing/hiv-testing-overview

Centers for Disease Control and Prevention. HIV Testing (arsip, 2017).
https://webarchive.library.unt.edu/web/20170124225541/http://www.cdc.gov/hiv/testing/index.html`;

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
  ['#0D1B45', '#1E2F6B', '#2B4A85'], // 2 papan skor: biru tua
  ['#14183F', '#2A2A6B', '#3B4A8A'], // 3 virus masuk, waktu: indigo
  ['#08283A', '#0F4A5C', '#167A80'], // 4 jenis zat yang dicari: teal
  ['#0A1F3D', '#123A60', '#17506F'], // 5 window period: biru laut
  ['#0D1B45', '#1E2F6B', '#2B4A85'], // 6 rentang hari: biru tua
  ['#14183F', '#2A2A6B', '#3B4A8A'], // 7 terlalu dini: indigo
  ['#08283A', '#0F4A5C', '#167A80'], // 8 ulangi tes: teal
  ['#0A1F3D', '#123A60', '#17506F'], // 9 PEP: biru laut
  ['#14183F', '#2A2A6B', '#3B4A8A'], // 10 virus belum terdeteksi: indigo
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
  cd4: '#8FBDF7', hiv: '#FFB7A5', virus: '#FFB7A5', rna: '#FFB7A5', arv: '#72E3D3', obat: '#72E3D3',
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

// ---- Adegan 1 (kalimat 1-3): tes negatif (kaset 1 garis + centang) -> "Belum tentu" centang memudar jadi tanda tanya -> "Kok bisa?"
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const s2 = T(2), s3 = T(3);
  const enter = pr(t, 0.2, 1.0, back);
  const kitX = lerp(1000, 760, pr(t, 0.3, 1.2));
  const check = pr(t, 1.8, 2.5, back) * (1 - pr(t, s2 + 0.1, s2 + 0.6));
  const q = pr(t, s2 + 0.4, s2 + 1.1, back);
  const q2 = pr(t, s3, s3 + 0.6, back);
  const sway = Math.sin(pr(t, s2 + 0.2, s3 + 0.8, sine) * Math.PI * 4) * 4 * (1 - pr(t, s3 + 0.5, s3 + 0.9));
  return (
    <>
      <L.Person cx={330} cy={880} s={2.1 * enter} op={enter} rot={sway} />
      <L.TestKit cx={kitX} cy={900} s={1.15} op={pr(t, 0.3, 0.9)} lines={1} />
      <L.CheckBadge cx={760} cy={650} s={0.85 * check} op={check} />
      <L.SpeechBubble cx={340} cy={560} s={1.0 * q} op={q} text="?" />
      <L.SpeechBubble cx={720} cy={650} s={(0.85 + 0.12 * Math.sin(t * 7)) * q2} op={q2} text="?" tail="r" />
    </>
  );
};

// ---- Adegan 2 (kalimat 4-5): papan skor + jam berjalan (terlambat); bola masuk gawang, papan tetap 0:0 lalu baru berubah
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const s4 = T(4), s5 = T(5), s6 = T(6);
  const enter = pr(t, s4, s4 + 0.8, back);
  const clockOn = pr(t, s4 + 0.9, s4 + 1.6, back);
  const frac = pr(t, s4 + 1.2, s6 - 0.9, sine) * 0.95;
  const goalOn = pr(t, s5 - 0.1, s5 + 0.6, back);
  const k = pr(t, s5 + 0.3, s5 + 1.5, sine);
  const bx = lerp(840, 310, k), by = lerp(1330, 1150, k) - Math.sin(k * Math.PI) * 160;
  const inGoal = pr(t, s5 + 1.3, s5 + 1.8);
  const net = Math.sin(pr(t, s5 + 1.3, s5 + 2.4) * Math.PI);
  const upd = pr(t, s6 - 0.8, s6 - 0.3, back);
  const flash = 1 + 0.08 * Math.sin(upd * Math.PI);
  return (
    <>
      <L.Scoreboard cx={540} cy={640} s={1.4 * enter * flash} op={enter} home={upd > 0.5 ? 1 : 0} away={0} />
      <L.Clock cx={850} cy={1130} s={0.85 * clockOn} op={clockOn} frac={frac} hour={3} />
      <L.Goal cx={300} cy={1130} s={1.0 * goalOn} op={goalOn} net={net} />
      {k > 0 && <L.Ball cx={bx} cy={by} s={0.9 * (1 - 0.35 * inGoal)} rot={k * 480} op={1 - 0.0 * inGoal} />}
    </>
  );
};

// ---- Adegan 3 (kalimat 6-7): virus masuk tubuh; jam berjalan (tubuh butuh waktu); baru garis kedua tes muncul
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const s6 = T(6), s7 = T(7), s8 = T(8);
  const enter = pr(t, s6, s6 + 0.8, back);
  const fly = pr(t, s6 + 0.9, s6 + 2.5, in3);
  const inside = pr(t, s6 + 2.5, s6 + 3.2);
  const clockOn = pr(t, s7 - 0.1, s7 + 0.7, back);
  const frac = pr(t, s7 + 0.9, s8 - 1.0, sine) * 0.96;
  const line2 = pr(t, s8 - 0.9, s8 - 0.3, back);
  return (
    <>
      <L.Person cx={330} cy={930} s={2.0 * enter} op={enter} />
      <L.TestKit cx={790} cy={1010} s={1.05 * enter} op={enter} lines={line2 > 0.4 ? 2 : 1} />
      <Virus x={lerp(900, 330, fly)} y={lerp(560, 960, fly) - Math.sin(fly * Math.PI) * 60} r={52 - 22 * fly} dim={fly > 0 ? 1 - 0.4 * inside : 0} t={t} />
      <L.Clock cx={790} cy={620} s={1.15 * clockOn} op={clockOn} frac={frac} hour={3} />
      <circle cx={790} cy={1010} r={150 * pr(t, s8 - 0.9, s8 - 0.1)} fill="none" stroke={LIB_COL.good} strokeWidth={8} opacity={0.5 * (1 - pr(t, s8 - 0.1, s8 + 0.5)) * (line2 > 0 ? 1 : 0)} />
    </>
  );
};

// ---- Adegan 4 (kalimat 8): tabung darah -> RNA, antigen, antibodi keluar satu per satu; sel B menghasilkan antibodi yang menempel pada virus
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const s8 = T(8);
  const enter = pr(t, s8, s8 + 0.8, back);
  const popA = (a: number) => pr(t, s8 + a, s8 + a + 0.9, back);
  const slide = (a: number) => pr(t, s8 + a, s8 + a + 1.0, sine);
  const rna = slide(1.3), ag = slide(3.0), ab = slide(3.8);
  const b = pr(t, s8 + 4.7, s8 + 5.5, back);
  const emit = (i: number) => pr(t, s8 + 5.6 + i * 0.35, s8 + 6.4 + i * 0.35, sine);
  const vir = pr(t, s8 + 5.3, s8 + 6.1, back);
  const att = (i: number) => pr(t, s8 + 6.9 + i * 0.25, s8 + 7.6 + i * 0.25, sine);
  const pos = (u: number, x0: number, y0: number, x1: number, y1: number) => [lerp(x0, x1, u), lerp(y0, y1, u)] as const;
  const [rx, ry] = pos(rna, 540, 760, 200, 960);
  const [ax, ay] = pos(ag, 540, 760, 540, 960);
  const [bx, by] = pos(ab, 540, 760, 860, 960);
  const angs = [-150, -90, -30, 30];
  return (
    <>
      <L.BloodTube cx={540} cy={560} s={1.0 * enter} op={enter} level={0.7} />
      <L.RNAStrand cx={rx} cy={ry} s={0.9 * rna} op={rna} len={210} />
      <Virus x={ax} y={ay} r={52 * ag} t={t} />
      <L.Antibody cx={bx} cy={by} s={1.4 * ab} op={ab} rot={20 * (1 - ab)} />
      <L.BCell cx={250} cy={1240} s={0.95 * b} op={b} />
      <Virus x={800} y={1240} r={56 * vir} t={t} seed={2} />
      {[0, 1, 2, 3].map((i) => {
        const e = emit(i), a = att(i);
        if (e <= 0) return null;
        const ang = (angs[i] * Math.PI) / 180;
        const tx = 800 + Math.cos(ang) * 92, ty = 1240 + Math.sin(ang) * 92;
        const x0 = 250 + 60 + i * 16, y0 = 1240 - 40 + i * 10;
        const x = lerp(lerp(x0, 560, e), tx, a), y = lerp(lerp(y0, 1180 + i * 40, e), ty, a);
        return <L.Antibody key={i} cx={x} cy={y} s={0.8} rot={lerp(lerp(0, 90, e), (angs[i] * 180) / Math.PI / 1 + 90, a)} op={Math.min(1, e * 3)} />;
      })}
    </>
  );
};

// ---- Adegan 5 (kalimat 9): garis waktu virus -> hasil tes; jeda di antaranya menyala (window period) sambil jam berputar
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const s9 = T(9);
  const enter = pr(t, s9, s9 + 0.7, back);
  const grow = pr(t, s9 + 0.6, s9 + 2.9, sine);
  const clockOn = pr(t, s9 + 0.4, s9 + 1.1, back);
  const after = pr(t, s9 + 2.8, s9 + 3.6, sine);
  return (
    <>
      <line x1={100} y1={1000} x2={1030} y2={1000} stroke={LIB_COL.light} strokeOpacity={0.3 * enter} strokeWidth={14} strokeLinecap="round" />
      <rect x={170} y={972} width={520 * grow} height={56} rx={28} fill={SHAPE_COL.receptor} opacity={0.95} />
      <rect x={830} y={972} width={190 * after} height={56} rx={28} fill={LIB_COL.good} opacity={0.9} />
      <polygon points="1000,946 1056,1000 1000,1054" fill={LIB_COL.good} opacity={after} />
      <Virus x={110} y={1000} r={46 * enter} t={t} />
      <L.TestKit cx={760} cy={1000} s={0.62 * enter} op={enter} lines={1} />
      <L.Clock cx={lerp(170, 690, grow)} cy={730} s={1.25 * clockOn} op={clockOn} frac={grow * 0.95} hour={3} />
    </>
  );
};

// ---- Adegan 6 (kalimat 10-13): tiga jenis tes, tiap bar menunjukkan rentang hari (mulai terdeteksi sampai kisaran akhir)
const DX = (d: number) => 150 + d * 8.4;
const ROWS = [
  { y: 640, label: 'Tes asam nukleat', from: 10, to: 33, color: '#72E3D3', t0: 11, text: '10–33 hari' },
  { y: 900, label: 'Tes antigen dan antibodi (laboratorium)', from: 18, to: 45, color: '#8FBDF7', t0: 12, text: '18–45 hari' },
  { y: 1160, label: 'Tes antibodi (termasuk tes cepat dan mandiri)', from: 23, to: 90, color: '#F4D77E', t0: 13, text: '23–90 hari' },
];
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const s10 = T(10);
  const axis = pr(t, s10, s10 + 0.8);
  return (
    <>
      <g opacity={axis}>
        <line x1={DX(0)} y1={1300} x2={1010} y2={1300} stroke={LIB_COL.light} strokeOpacity={0.5} strokeWidth={5} strokeLinecap="round" />
        <polygon points="1004,1286 1034,1300 1004,1314" fill={LIB_COL.light} opacity={0.6} />
        <text x={1034} y={1262} textAnchor="end" fontFamily={FONT} fontWeight={600} fontSize={30} fill={LIB_COL.good}>dan seterusnya</text>
      </g>
      {[0, 30, 60, 90].map((d) => (
        <g key={d} opacity={axis}>
          <line x1={DX(d)} y1={560} x2={DX(d)} y2={1296} stroke={LIB_COL.light} strokeOpacity={0.18} strokeWidth={3} strokeDasharray="4 12" />
          <text x={DX(d)} y={1340} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={32} fill={LIB_COL.light} opacity={0.85}>{d === 90 ? '90' : d}</text>
        </g>
      ))}
      <defs>
        <linearGradient id="tail" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#72E3D3" stopOpacity="0.85" />
          <stop offset="1" stopColor="#72E3D3" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {ROWS.map((r, i) => {
        const on = pr(t, s10 + 0.4 + i * 0.6, s10 + 1.1 + i * 0.6, back);
        const gt = T(r.t0 as number);
        const g = pr(t, gt + 0.1, gt + (i === 2 ? 3.0 : 1.2), sine);
        const w = (DX(r.to) - DX(r.from)) * g;
        const tx = pr(t, gt + (i === 2 ? 3.0 : 1.2), gt + (i === 2 ? 3.6 : 1.8), back);
        const endX = DX(r.from) + w;
        return (
          <g key={i} opacity={on}>
            <text x={DX(0)} y={r.y - 52} fontFamily={FONT} fontWeight={800} fontSize={34} fill="#EAF2FB">{r.label}</text>
            <rect x={DX(0)} y={r.y - 28} width={1020 - DX(0)} height={56} rx={28} fill="#fff" fillOpacity={0.12} />
            <rect x={DX(r.to) - 28} y={r.y - 28} width={1020 - DX(r.to) + 28} height={56} rx={28} fill="url(#tail)" opacity={tx} />
            <rect x={DX(r.from)} y={r.y - 28} width={Math.max(0, w)} height={56} rx={28} fill={r.color} />
            <text x={i === 2 ? DX(r.from) + 40 : endX + 20} y={r.y + 12} fontFamily={FONT} fontWeight={800} fontSize={36} fill={i === 2 ? '#3A2A00' : '#fff'} opacity={tx} transform={`translate(0 ${(1 - tx) * 10})`}>{r.text}</text>
          </g>
        );
      })}
    </>
  );
};

// ---- Adegan 7 (kalimat 14): tes terlalu dini -> negatif (centang), padahal virus ada; centang memudar dan virus terungkap
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const s14 = T(14);
  const enter = pr(t, s14, s14 + 0.7, back);
  const clockOn = pr(t, s14 + 0.1, s14 + 0.8, back);
  const check = pr(t, s14 + 1.0, s14 + 1.6, back) * (1 - 0.65 * pr(t, s14 + 3.3, s14 + 3.9));
  const reveal = pr(t, s14 + 3.3, s14 + 4.1, back);
  return (
    <>
      <L.Person cx={330} cy={930} s={2.0 * enter} op={enter} />
      <Virus x={330} y={960} r={34 * reveal} dim={0.95} t={t} />
      <L.TestKit cx={790} cy={1020} s={1.05 * enter} op={enter} lines={1} />
      <L.Clock cx={790} cy={640} s={1.0 * clockOn} op={clockOn} frac={0.1} hour={3} />
      <L.CheckBadge cx={790} cy={830} s={0.5 * check} op={check} />
    </>
  );
};

// ---- Adegan 8 (kalimat 15): hari berisiko ditandai, tes diulang setelah jendela: kalender terisi kuning lalu teal, kaset menyala
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const s15 = T(15);
  const enter = pr(t, s15 - 0.1, s15 + 0.7, back);
  const mark0 = pr(t, s15 + 1.0, s15 + 1.6, back);
  const days = Math.floor(pr(t, s15 + 3.3, s15 + 5.6, sine) * 34.99);
  const done = pr(t, s15 + 5.7, s15 + 6.3, back);
  const kit = pr(t, s15 + 3.0, s15 + 3.9, back);
  const kitX = lerp(1100, 790, pr(t, s15 + 3.0, s15 + 4.0));
  const kitOp = 0.45 + 0.55 * done;
  const spin = pr(t, s15 + 3.2, s15 + 6.3, sine) * 360;
  const color = done > 0.5 ? LIB_COL.good : SHAPE_COL.receptor;
  const marks = days > 0 ? Array.from({ length: days }, (_, i) => i + 1) : [];
  if (mark0 > 0.3) marks.unshift(0);
  return (
    <>
      <L.Calendar cx={330} cy={780} s={1.85 * enter} op={enter} marks={marks} markColor={color} />
      <L.TestKit cx={kitX} cy={1000} s={1.05 * kit} op={kit * kitOp} lines={1} rot={Math.sin(done * Math.PI) * 6} />
      <g transform={`translate(790 690) rotate(${spin})`} opacity={kit}>
        <path d="M -52 0 A 52 52 0 1 1 0 52" fill="none" stroke={LIB_COL.light} strokeWidth={12} strokeLinecap="round" />
        <polygon points="-2,34 -2,70 -34,52" fill={LIB_COL.light} />
      </g>
      <L.CheckBadge cx={790} cy={1260} s={0.55 * done} op={done} />
    </>
  );
};

// ---- Adegan 9 (kalimat 16): jam berputar tiga kali = 72 jam; klinik; kapsul PEP menuju orang dan perisai terbentuk
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const s16 = T(16);
  const enter = pr(t, s16, s16 + 0.7, back);
  const laps = pr(t, s16 + 0.3, s16 + 3.7, sine) * 3;
  const frac = laps >= 3 ? 0.999 : laps % 1 || 0.001;
  const hrs = Math.round(pr(t, s16 + 0.3, s16 + 3.7, sine) * 72);
  const clinic = pr(t, s16 + 4.0, s16 + 4.8, back);
  const person = pr(t, s16 + 4.2, s16 + 5.0, back);
  const mv = pr(t, s16 + 5.4, s16 + 7.0, sine);
  const shield = pr(t, s16 + 7.2, s16 + 8.0, back);
  const pulse = 1 + 0.04 * Math.sin(Math.max(0, t - (s16 + 8.0)) * 4);
  return (
    <>
      <L.Clock cx={300} cy={680} s={1.4 * enter} op={enter} frac={frac} hour={3} />
      <text x={760} y={720} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={150} fill="#F4D77E" opacity={enter}>{hrs}</text>
      <text x={760} y={790} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={48} fill="#EAF2FB" opacity={enter}>jam</text>
      <L.Clinic cx={250} cy={1150} s={1.15 * clinic} op={clinic} />
      <L.Person cx={800} cy={1130} s={1.35 * person} op={person} />
      <L.Capsule cx={lerp(300, 770, mv)} cy={lerp(1140, 1150, mv) - Math.sin(mv * Math.PI) * 120} s={0.8 * (mv > 0 ? 1 : 0)} rot={mv * 360} op={mv > 0 && mv < 0.98 ? 1 : 0} />
      <L.Shield cx={800} cy={1135} s={0.95 * shield * pulse} op={0.85 * shield} />
    </>
  );
};

// ---- Adegan 10 (kalimat 17): tabung darah berisi virus (muncul satu per satu), kaset tes masih satu garis
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const s17 = T(17);
  const enter = pr(t, s17, s17 + 0.5, back);
  const v = (i: number) => pr(t, s17 + 0.2 + i * 0.3, s17 + 0.6 + i * 0.3, back);
  return (
    <>
      <L.BloodTube cx={360} cy={900} s={1.55 * enter} op={enter} level={0.75} />
      <Virus x={360} y={840} r={22 * v(0)} t={t} />
      <Virus x={362} y={925} r={22 * v(1)} t={t} seed={1} />
      <Virus x={358} y={1000} r={22 * v(2)} t={t} seed={2} />
      <L.TestKit cx={740} cy={900} s={1.3 * enter} op={enter} lines={1} />
    </>
  );
};

const PILLS: { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number }[] = [
  { a: 1.9, b: 4.3, text: 'negatif', k: 'neutral', x: 760, y: 1160, size: 40 },
  { a: T(8) + 1.5, b: T(9) - 0.3, text: 'materi genetik', k: 'virus', x: 200, y: 1105, size: 32 },
  { a: T(8) + 3.1, b: T(9) - 0.3, text: 'antigen', k: 'virus', x: 540, y: 1105, size: 32 },
  { a: T(8) + 3.9, b: T(9) - 0.3, text: 'antibodi', k: 'neutral', x: 860, y: 1105, size: 32 },
  { a: T(8) + 5.0, b: T(9) - 0.3, text: 'sistem imun', k: 'neutral', x: 250, y: 1380, size: 32 },
  { a: T(9) + 1.5, b: T(10) - 0.2, text: 'window period', k: 'recep', x: 540, y: 1180, size: 46 },
  { a: T(9) + 2.8, b: T(10) - 0.2, text: 'masa jendela', k: 'neutral', x: 540, y: 1290, size: 42 },
  { a: T(9) + 3.2, b: T(10) - 0.2, text: 'hasil lebih andal', k: 'arv', x: 880, y: 1130, size: 34 },
  { a: T(14) + 0.3, b: T(15) - 0.2, text: 'terlalu dini', k: 'neutral', x: 790, y: 1240, size: 36 },
  { a: T(15) + 3.2, b: T(15) + 6.4, text: 'ulangi tes', k: 'neutral', x: 790, y: 1240, size: 40 },
  { a: T(15) + 3.6, b: T(16) - 0.2, text: 'masa jendela', k: 'recep', x: 330, y: 1290, size: 36 },
  { a: T(16) + 5.4, b: T(17) - 0.2, text: 'PEP', k: 'arv', x: 540, y: 1340, size: 44 },
  { a: T(16) + 4.3, b: T(16) + 5.3, text: 'konsultasi', k: 'neutral', x: 250, y: 1340, size: 36 },
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
export const S1E8Full: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = gradAt(t);
  const cue = CUES.find((c) => t >= c.a - 0.05 && t < c.b);
  const ck = cue ? Math.min(1, (t - cue.a + 0.05) / 0.18) : 0;
  const subOn = t < CLOSE - 0.05;
  const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10];
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
          <LegendBox t={t} a={T(6) + 0.2} b={T(6) + 4.8} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(14) + 0.1} b={T(14) + 3.2} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(17) + 0.05} b={T(18) - 0.1} items={[['#FF9C85', 'Virus HIV']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile("vo/S1E8.mp3")} />
    </AbsoluteFill>
  );
};
