import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, in3, sine, back } from '../motion';
import { CUES, CLOSE } from './timeline';
import { SYNC_SEGS } from './sync';
import { COL, Defs, CellBody, Virus, Check, Capsule, Shield } from '../ep3/shapes';

const useFonts4 = () => {
  const [handle] = React.useState(() => delayRender('fonts4'));
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

// ---------------- latar gradien (bergeser halus tiap scene) ----------------
// Semua waktu adegan di bawah ini = waktu di mp3 ASLI (detik). Komponen akhir memetakan waktu video -> waktu mp3 (toAudio).
const A_CLOSE = 69.76;
type Grad = [string, string, string];
const GRADS: { t: number; c: Grad }[] = [
  { t: 0, c: ['#0A1F3D', '#123A60', '#17506F'] },
  { t: 8.59, c: ['#0D1B45', '#1E2F6B', '#2B4A85'] },
  { t: 16.46, c: ['#0A1F3D', '#123A60', '#17506F'] },
  { t: 26.82, c: ['#14183F', '#2A2A6B', '#3B4A8A'] },
  { t: 41.69, c: ['#0D1B45', '#1E2F6B', '#2B4A85'] },
  { t: 48.09, c: ['#08283A', '#0F4A5C', '#167A80'] },
  { t: 56.93, c: ['#0A1F3D', '#123A60', '#17506F'] },
  { t: 64.15, c: ['#14183F', '#2A2A6B', '#3B4A8A'] },
  { t: A_CLOSE, c: ['#0A1830', '#12294F', '#1B3E63'] },
];
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
const SETTLE = [8.59, 16.46, 26.82, 41.69, 48.09, 56.93, 64.15, A_CLOSE];
const settle = (t: number) => {
  let z = 0;
  for (const T of SETTLE) if (t >= T) z += 0.03 * (1 - ez(t, T, T + 1.0, out3));
  return 1 + z;
};

// ---------------- pill & label ----------------
const PK = {
  virus: { bg: '#FF9C85', fg: '#3B1308' },
  cell: { bg: '#8FBDF7', fg: '#0E2A52' },
  recep: { bg: '#F4D77E', fg: '#4A3606' },
  rt: { bg: '#72E3D3', fg: '#063F38' },
  bad: { bg: '#FF6B5E', fg: '#3B0A06' },
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
type P = { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number };
const PILLS: P[] = [
  { a: 0.5, b: 2.9, text: 'Sel CD4', k: 'cell', x: 330, y: 560, size: 46 },
  { a: 1.0, b: 2.9, text: 'Virus HIV', k: 'virus', x: 790, y: 700, size: 42 },
  { a: 8.8, b: 11.4, text: 'indikator baterai', k: 'recep', x: 540, y: 470, size: 48 },
  { a: 12.1, b: 14.2, text: 'bukan nasib', k: 'gray', x: 540, y: 470, size: 48 },
  { a: 14.5, b: 16.0, text: 'hanya sisa daya', k: 'rt', x: 540, y: 470, size: 48 },
  { a: 16.7, b: 19.9, text: 'Sel CD4 = penjaga tubuh', k: 'cell', x: 540, y: 470, size: 44 },
  { a: 20.4, b: 22.3, text: 'diserang HIV', k: 'virus', x: 540, y: 1290, size: 44 },
  { a: 22.9, b: 26.3, text: 'jumlah CD4', k: 'cell', x: 540, y: 430, size: 48 },
  { a: 24.4, b: 26.3, text: 'kekuatan penjagaan', k: 'neutral', x: 540, y: 1330, size: 42 },
  { a: 27.0, b: 29.7, text: 'tabung darah', k: 'virus', x: 540, y: 470, size: 52 },
  { a: 30.3, b: 33.7, text: 'hitung sel CD4', k: 'cell', x: 540, y: 470, size: 50 },
  { a: 34.3, b: 37.8, text: 'hasil sebelumnya', k: 'neutral', x: 540, y: 470, size: 46 },
  { a: 38.4, b: 41.2, text: 'arah', k: 'rt', x: 540, y: 1250, size: 56 },
  { a: 39.8, b: 41.2, text: 'bukan satu titik', k: 'gray', x: 540, y: 1340, size: 40 },
  { a: 41.9, b: 43.7, text: 'satu angka', k: 'neutral', x: 540, y: 620, size: 52 },
  { a: 44.3, b: 47.7, text: 'sedang sakit', k: 'gray', x: 300, y: 1130, size: 40 },
  { a: 45.8, b: 47.7, text: 'beda alat lab', k: 'gray', x: 780, y: 1130, size: 40 },
  { a: 48.3, b: 51.2, text: 'bisa diisi ulang', k: 'recep', x: 540, y: 470, size: 52 },
  { a: 51.8, b: 56.5, text: 'ARV', k: 'rt', x: 700, y: 560, size: 60 },
  { a: 54.8, b: 56.5, text: 'berhenti memperbanyak diri', k: 'gray', x: 540, y: 1240, size: 38 },
  { a: 57.2, b: 59.6, text: 'satu studi', k: 'neutral', x: 540, y: 410, size: 50 },
  { a: 61.6, b: 64.0, text: 'CD4 naik', k: 'cell', x: 540, y: 410, size: 52 },
  { a: 64.5, b: 67.0, text: 'video lain di seri ini', k: 'neutral', x: 540, y: 420, size: 46 },
  { a: 67.6, b: 70.0, text: 'CD4 bukan angka mati', k: 'cell', x: 540, y: 470, size: 46 },
];
const Pills: React.FC<{ t: number }> = ({ t }) => (
  <>
    {PILLS.map((p, i) => {
      const o = win(t, p.a, p.b, 0.35);
      return o > 0.01 ? <PillBox key={i} x={p.x} y={p.y} text={p.text} k={p.k} size={p.size} op={o} /> : null;
    })}
  </>
);

// legenda kontekstual (hanya visual abstrak): pill kecil di y=250, titik warna + label, maks 3 item. Waktu = waktu mp3 asli.
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
const Legend: React.FC<{ t: number }> = ({ t }) => (
  <>
    <LegendBox t={t} a={0.4} b={5.6} items={[['#8FBDF7', 'Sel CD4'], ['#FF9C85', 'Virus HIV']]} />
    <LegendBox t={t} a={17.0} b={22.2} items={[['#8FBDF7', 'Sel CD4'], ['#FF9C85', 'Virus HIV']]} />
    <LegendBox t={t} a={31.2} b={34.3} items={[['#8FBDF7', 'Titik = sel CD4']]} />
    <LegendBox t={t} a={34.5} b={41.4} items={[['#8FBDF7', 'Jumlah CD4']]} />
    <LegendBox t={t} a={42.0} b={46.6} items={[['#8FBDF7', 'Hasil CD4'], ['#F4D77E', 'Kisaran naik turun']]} />
    <LegendBox t={t} a={51.7} b={56.4} items={[['#72E3D3', 'Kapsul = obat ARV'], ['#FF9C85', 'Virus HIV']]} />
    <LegendBox t={t} a={57.3} b={62.0} items={[['#8FBDF7', 'Menyala = CD4 naik'], ['#B9C3D0', 'Abu = belum']]} />
  </>
);

// ---------------- subtitle ----------------
const ACC: Record<string, string> = {
  cd4: '#8FBDF7', hiv: '#FFB7A5', virus: '#FFB7A5', arv: '#72E3D3', obat: '#72E3D3',
  baterai: '#F4D77E', sembilan: '#F4D77E', puluh: '#F4D77E', dua: '#F4D77E', persen: '#F4D77E',
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

// ---------------- util & bentuk baru ----------------
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const pt = (cx: number, cy: number, r: number, a: number) => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });

const Battery: React.FC<{ x: number; y: number; w?: number; h?: number; level: number; op?: number; bolt?: number }> = ({ x, y, w = 440, h = 210, level, op = 1, bolt = 0 }) => {
  const lv = clamp(level);
  const col = lv < 0.35 ? COL.yel : COL.rt;
  return (
    <g transform={`translate(${x} ${y})`} opacity={op}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={38} fill="#EAF2FB" opacity={0.18} />
      <rect x={w / 2 + 4} y={-h * 0.17} width={28} height={h * 0.34} rx={12} fill="#EAF2FB" opacity={0.3} />
      <rect x={-w / 2 + 18} y={-h / 2 + 18} width={Math.max(0, (w - 36) * lv)} height={h - 36} rx={24} fill={col} />
      {bolt > 0.01 && (
        <g opacity={bolt} transform="scale(1.5)">
          <path d="M6 -46 L-22 6 L-2 6 L-10 46 L22 -10 L2 -10 Z" fill="#FFFFFF" opacity={0.95} />
        </g>
      )}
    </g>
  );
};

const Tube: React.FC<{ x: number; y: number; fill: number; op?: number; rot?: number; s?: number }> = ({ x, y, fill, op = 1, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    <rect x={-60} y={-210} width={120} height={420} rx={60} fill="#EAF2FB" opacity={0.2} />
    <rect x={-60} y={-250} width={120} height={64} rx={20} fill={COL.rt} />
    <clipPath id="tubeClip"><rect x={-48} y={-186} width={96} height={384} rx={48} /></clipPath>
    <g clipPath="url(#tubeClip)">
      <rect x={-48} y={198 - 384 * clamp(fill)} width={96} height={384 * clamp(fill) + 2} fill="#F27A72" />
    </g>
  </g>
);

// ================= SCENE A: pembuka (0 - 8.4) =================
const SceneA: React.FC<{ t: number }> = ({ t }) => {
  const o1 = win(t, 0, 3.45, 0.4);
  const o2 = win(t, 3.38, 6.65, 0.4);
  const o3 = win(t, 6.44, 9.05, 0.45);
  const appear = ez(t, 0.1, 1.0, back);
  const vk = ez(t, 0.8, 2.6, sine);
  // grafik naik turun
  const prog = ez(t, 6.6, 8.1, sine);
  const N = 40;
  let d = '';
  for (let i = 0; i <= Math.round(N * prog); i++) {
    const x = 170 + (740 * i) / N;
    const y = 900 - 120 * Math.sin(i * 0.55) - 60 * Math.sin(i * 1.3 + 1);
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
  }
  return (
    <g>
      <g opacity={o1}>
        <g transform={`translate(330 860) scale(${0.6 + 0.4 * appear}) translate(-330 -860)`}>
          <CellBody cx={330} cy={860} r={170} />
        </g>
        <Virus x={lerp(980, 790, vk)} y={860 + Math.sin(t * 2.4) * 10} r={56} rot={t * 6} />
      </g>
      <g opacity={o2}>
        <CellBody cx={540} cy={1040} r={120} />
        <circle cx={540} cy={640} r={110} fill={COL.yel} />
        <text x={540} y={692} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={150} fill="#4A3606">?</text>
      </g>
      <g opacity={o3}>
        <rect x={110} y={640} width={860} height={420} rx={44} fill="#EAF2FB" opacity={0.12} />
        <line x1={150} y1={1020} x2={930} y2={1020} stroke="#E8F0FA" strokeOpacity={0.5} strokeWidth={5} strokeLinecap="round" />
        <path d={d} fill="none" stroke={COL.cell} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
};

// ================= SCENE B: indikator baterai (8.59 - 16.2) =================
const SceneB: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 8.59, 16.75, 0.45);
  const appear = ez(t, 8.7, 9.7, back);
  const level = 0.62 + 0.26 * Math.sin(t * 1.5) + 0.08 * Math.sin(t * 3.7);
  return (
    <g opacity={o} transform={`translate(540 860) scale(${0.7 + 0.3 * appear}) translate(-540 -860)`}>
      <rect x={300} y={430} width={480} height={860} rx={72} fill="#EAF2FB" opacity={0.12} />
      <rect x={470} y={470} width={140} height={22} rx={11} fill="#EAF2FB" opacity={0.25} />
      <Battery x={540} y={860} w={420} h={200} level={level} />
    </g>
  );
};

// ================= SCENE C: CD4 sel penjaga (16.46 - 26.4) =================
const RING = 8;
const SceneC: React.FC<{ t: number }> = ({ t }) => {
  const oC1 = win(t, 16.46, 22.95, 0.45);
  const oC2 = win(t, 22.67, 26.9, 0.45);
  const cx = 540, cy = 800, R = 270;
  const vk = ez(t, 20.1, 21.5, sine);
  const touch = pt(cx, cy, R, -Math.PI * 0.75);
  const vx = lerp(130, touch.x - 60, vk), vy = lerp(430, touch.y - 40, vk);
  const lit = Math.floor(ez(t, 22.9, 25.5, sine) * RING + 0.01);
  return (
    <g>
      <g opacity={oC1}>
        <circle cx={cx} cy={cy} r={150} fill="#EAF2FB" opacity={0.12} />
        {Array.from({ length: RING }, (_, i) => {
          const a = (i / RING) * Math.PI * 2 - Math.PI * 0.75;
          const p = pt(cx, cy, R, a);
          const k = ez(t, 16.6 + i * 0.18, 17.4 + i * 0.18, back);
          return (
            <g key={i} opacity={k}>
              <CellBody cx={p.x} cy={p.y} r={62} rec={false} glow={i === 0 ? ez(t, 21.4, 22.0) : 0} />
              <Shield x={p.x} y={p.y} s={0.45} />
            </g>
          );
        })}
        {t > 20.0 && <Virus x={vx} y={vy} r={48} rot={t * 8} s={1 - 0.4 * ez(t, 21.4, 22.2)} />}
      </g>
      <g opacity={oC2}>
        {Array.from({ length: RING }, (_, i) => {
          const a = (i / RING) * Math.PI * 2 - Math.PI * 0.75;
          const p = pt(cx, cy - 60, 230, a);
          return <CellBody key={i} cx={p.x} cy={p.y} r={54} rec={false} op={i < lit ? 1 : 0.28} />;
        })}
        <Battery x={540} y={1130} w={520} h={170} level={lit / RING} />
      </g>
    </g>
  );
};

// ================= SCENE D: tiga langkah baca CD4 (26.82 - 41.5) =================
const VALS = [0.42, 0.55, 0.48, 0.66, 0.74];
const CHX = (i: number) => 200 + i * 170;
const CHY = (v: number) => 1120 - v * 520;
const SceneD: React.FC<{ t: number }> = ({ t }) => {
  const o1 = win(t, 26.82, 30.35, 0.4);
  const o2 = win(t, 30.09, 34.35, 0.4);
  const o3 = win(t, 34.11, 41.95, 0.45);
  const fillK = ez(t, 27.3, 29.4, sine);
  const slide = ez(t, 30.2, 31.2, out3);
  const nDots = Math.floor(ez(t, 31.4, 33.4, sine) * 12 + 0.01);
  const line = ez(t, 34.5, 37.4, sine);
  const arrow = ez(t, 38.4, 40.4, sine);
  const ax0 = 200, ay0 = CHY(0.38), ax1 = 880, ay1 = CHY(0.8);
  return (
    <g>
      <g opacity={o1}>
        <Tube x={540} y={860} fill={fillK} />
      </g>
      <g opacity={o2}>
        <rect x={160} y={700} width={760} height={420} rx={48} fill="#EAF2FB" opacity={0.15} />
        <rect x={230} y={760} width={500} height={300} rx={30} fill="#0A1F3D" opacity={0.4} />
        {Array.from({ length: 12 }, (_, i) => {
          const c = i % 4, r = Math.floor(i / 4);
          const k = i < nDots ? 1 : 0;
          return <circle key={i} cx={300 + c * 120} cy={830 + r * 90} r={30} fill={COL.cell} opacity={0.15 + 0.85 * k} />;
        })}
        <Tube x={lerp(1010, 820, slide)} y={910} fill={1} rot={90} s={0.5} />
      </g>
      <g opacity={o3}>
        <rect x={110} y={560} width={860} height={640} rx={44} fill="#EAF2FB" opacity={0.12} />
        <line x1={150} y1={1130} x2={930} y2={1130} stroke="#E8F0FA" strokeOpacity={0.5} strokeWidth={5} strokeLinecap="round" />
        {VALS.slice(1).map((v, i) => {
          const k = clamp(line * 4 - i);
          if (k <= 0) return null;
          const x0 = CHX(i), y0 = CHY(VALS[i]);
          const x1 = lerp(x0, CHX(i + 1), k), y1 = lerp(y0, CHY(v), k);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={COL.cell} strokeWidth={9} strokeLinecap="round" />;
        })}
        {VALS.map((v, i) => {
          const k = ez(t, 34.4 + i * 0.5, 34.9 + i * 0.5, back);
          return <circle key={i} cx={CHX(i)} cy={CHY(v)} r={19 * k} fill={COL.cell} />;
        })}
        {arrow > 0.01 && (
          <g opacity={0.95}>
            <line x1={ax0} y1={ay0} x2={lerp(ax0, ax1, arrow)} y2={lerp(ay0, ay1, arrow)} stroke={COL.rt} strokeWidth={14} strokeLinecap="round" strokeDasharray="2 26" />
            <g transform={`translate(${lerp(ax0, ax1, arrow)} ${lerp(ay0, ay1, arrow)}) rotate(${(Math.atan2(ay1 - ay0, ax1 - ax0) * 180) / Math.PI})`}>
              <path d="M0 0 L-40 -26 L-40 26 Z" fill={COL.rt} />
            </g>
          </g>
        )}
      </g>
    </g>
  );
};

// ================= SCENE E: satu angka bisa menipu (41.69 - 47.9) =================
const SceneE: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 41.69, 48.35, 0.45);
  const wob = t < 44.2 ? 26 * Math.sin(t * 5) * ez(t, 42.0, 42.8) : 0;
  const sick = ez(t, 44.3, 45.2, sine);
  const lab = ez(t, 45.8, 46.8, sine);
  const y = 860 + wob - 90 * sick + 150 * lab;
  return (
    <g opacity={o}>
      <rect x={110} y={740} width={860} height={240} rx={44} fill={COL.yel} opacity={0.14} />
      <line x1={150} y1={860} x2={930} y2={860} stroke="#E8F0FA" strokeOpacity={0.4} strokeWidth={4} strokeDasharray="4 18" strokeLinecap="round" />
      <circle cx={540} cy={y} r={48} fill={COL.cell} />
      <circle cx={540} cy={y} r={78} fill={COL.cell} opacity={0.2} />
    </g>
  );
};

// ================= SCENE F: diisi ulang + ARV (48.09 - 56.9) =================
const SceneF: React.FC<{ t: number }> = ({ t }) => {
  const o1 = win(t, 48.09, 51.95, 0.45);
  const o2 = win(t, 51.6, 57.35, 0.45);
  const charge = ez(t, 48.4, 51.0, sine);
  const level = lerp(0.18, 0.92, charge);
  const bolt = 0.6 + 0.4 * Math.sin(t * 6);
  const cap = ez(t, 53.0, 54.3, out3);
  const stop = ez(t, 54.4, 55.0);
  const copies = [0, 1, 2, 3, 4];
  return (
    <g>
      <g opacity={o1}>
        <Battery x={540} y={860} w={460} h={220} level={level} bolt={bolt * ez(t, 48.4, 48.9)} />
      </g>
      <g opacity={o2}>
        <Virus x={250} y={860} r={78} rot={t * 5} />
        {copies.map((i) => {
          const st = 52.0 + i * 0.28;
          const k = ez(t, st, st + 1.6, sine);
          if (k <= 0.01) return null;
          return <Virus key={i} x={lerp(300, 520, k)} y={860 + (i - 2) * 70 * k} r={26} op={(1 - 0.85 * stop) * (1 - ez(t, st + 1.2, st + 1.6))} spikes={false} />;
        })}
        <g opacity={cap}>
          <Capsule x={lerp(1080, 800, cap)} y={760} s={1.1} rot={-20} />
        </g>
        <g opacity={ez(t, 54.2, 54.8)}>
          <Shield x={560} y={860} s={1.5 * ez(t, 54.2, 54.9, back)} />
        </g>
        <Check x={820} y={1010} s={ez(t, 55.0, 55.7, back)} />
      </g>
    </g>
  );
};

// ================= SCENE G: 92 dari 100 (56.93 - 64.1) =================
const SceneG: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 56.93, 64.75, 0.45);
  const prog = ez(t, 57.6, 62.6, sine);
  const nLit = Math.round(prog * 92);
  const gray = ez(t, 62.6, 63.4);
  return (
    <g opacity={o}>
      {Array.from({ length: 100 }, (_, i) => {
        const c = i % 10, r = Math.floor(i / 10);
        const on = i < nLit;
        const isGrayTail = i >= 92;
        const fill = on ? COL.cell : '#B9C3D0';
        const op = on ? 1 : isGrayTail ? 0.25 + 0.2 * gray : 0.18;
        return <circle key={i} cx={225 + c * 70} cy={500 + r * 70} r={24} fill={fill} opacity={op} />;
      })}
      <text x={540} y={1330} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={190} fill="#FFFFFF">
        {nLit}%
      </text>
    </g>
  );
};

// ================= SCENE H: video lain di seri (64.15 - 67.2) =================
const SceneH: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 64.15, 67.9, 0.35);
  const k = ez(t, 64.4, 65.3, back);
  const cards = [
    { y: 650, a: 0.2 },
    { y: 900, a: 1 },
    { y: 1150, a: 0.2 },
  ];
  return (
    <g opacity={o}>
      {cards.map((c, i) => (
        <g key={i} opacity={c.a} transform={`translate(0 ${(1 - k) * (i - 1) * 60})`}>
          <rect x={150} y={c.y - 100} width={780} height={200} rx={44} fill="#EAF2FB" opacity={c.a === 1 ? 0.26 : 0.14} />
          <circle cx={260} cy={c.y} r={52} fill={c.a === 1 ? COL.rt : '#B9C3D0'} />
          <path d={`M248 ${c.y - 26} L248 ${c.y + 26} L288 ${c.y} Z`} fill={c.a === 1 ? '#063F38' : '#1D2A3A'} />
          {c.a === 1 ? (
            <text x={350} y={c.y + 16} fontFamily={FONT} fontWeight={800} fontSize={48} fill="#FFFFFF">Cara kerja ARV</text>
          ) : (
            <rect x={350} y={c.y - 14} width={380} height={28} rx={14} fill="#EAF2FB" opacity={0.35} />
          )}
        </g>
      ))}
    </g>
  );
};

// ================= SCENE I: callback hook, baterai naik turun (67.46 - 70) =================
const SceneI: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 67.46, 70.4, 0.4);
  const level = 0.5 + 0.28 * Math.sin((t - 67.46) * 3.2) * (1 - ez(t, 68.6, 69.6)) + 0.2 * ez(t, 68.8, 69.9);
  return (
    <g opacity={o}>
      <Battery x={540} y={860} w={460} h={220} level={level} bolt={0.85 * ez(t, 68.9, 69.5)} />
    </g>
  );
};

// ================= peta waktu video -> waktu mp3 asli =================
// Dalam kalimat: kecepatan 1x. Dalam jeda: animasi berjalan secepat jeda lama lalu menahan hasilnya sampai kalimat berikutnya mulai.
const toAudio = (t: number) => {
  const S = SYNC_SEGS;
  if (t <= S[0].a) return S[0].sa - (S[0].a - t);
  let n = 0;
  for (let i = 0; i < S.length; i++) if (t >= S[i].a) n = i;
  const c = S[n];
  if (t <= c.b) return c.sa + (t - c.a);
  const nx = S[n + 1];
  if (!nx) return c.sb + (t - c.b);
  return c.sb + Math.min(t - c.b, nx.sa - c.sb);
};

const REFERENSI = `Referensi

1. Moore RD, Keruly JC (2007). CD4+ cell count 6 years after commencement of highly active antiretroviral therapy in persons with sustained virologic suppression. Clin Infect Dis. 44(3), 441-446.
https://doi.org/10.1086/510746

2. Panel on Guidelines for the Prevention and Treatment of Opportunistic Infections in Adults and Adolescents with HIV (NIH, CDC, HIVMA/IDSA). Guidelines for the Prevention and Treatment of Opportunistic Infections in Adults and Adolescents with HIV.
https://clinicalinfo.hiv.gov/en/guidelines/adult-and-adolescent-opportunistic-infection

3. Kementerian Kesehatan RI (2019). Keputusan Menteri Kesehatan RI Nomor HK.01.07/MENKES/90/2019 tentang Pedoman Nasional Pelayanan Kedokteran Tata Laksana HIV.`;
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
  if (name === 'th')
    return (
      <svg width={34} height={34} viewBox="0 0 34 34" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <circle cx={17} cy={17} r={4.6} />
        <path d="M21.6 17 V19.2 A3 3 0 0 0 27.5 19.2 V17 A10.5 10.5 0 1 0 22 26" />
      </svg>
    );
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
  { key: 'th', name: 'Threads', handle: '@maknapositif', icon: '#0B0B0F', btn: '+ Follow', done: 'Following' },
  { key: 'sw', name: 'Saweria', handle: 'saweria.co/maknapositif', icon: '#F97316', btn: 'Donate', done: 'Donate' },
];

const CheckMk: React.FC = () => (
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
                  {done && <CheckMk />}
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
const CLOSE_GRAD = ['#0A2540', '#0F3B66', '#0B4F63'];
export const S1E4Full: React.FC = () => {
  useFonts4();
  const f = useCurrentFrame();
  const tv = f / FPS; // waktu video
  const t = toAudio(tv); // waktu mp3 asli untuk adegan
  const g = gradAt(t);
  const kc = ez(tv, CLOSE - 0.3, CLOSE + 0.7);
  const cue = CUES.find((c) => tv >= c.a - 0.05 && tv < c.b);
  const ck = cue ? Math.min(1, (tv - cue.a + 0.05) / 0.18) : 0;
  const subOn = tv < CLOSE - 0.05;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg,${g[0]} 0%,${g[1]} 55%,${g[2]} 100%)` }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg,${CLOSE_GRAD[0]} 0%,${CLOSE_GRAD[1]} 55%,${CLOSE_GRAD[2]} 100%)`, opacity: kc }} />
      <AbsoluteFill style={{ background: 'radial-gradient(760px 760px at 50% 40%, rgba(120,190,255,0.22), transparent 70%)' }} />
      {tv < CLOSE + 0.5 && (
        <AbsoluteFill style={{ transform: `scale(${settle(t)})`, transformOrigin: '50% 45%', opacity: 1 - ez(tv, CLOSE - 0.1, CLOSE + 0.4) }}>
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
            <Defs />
            <SceneA t={t} />
            <SceneB t={t} />
            <SceneC t={t} />
            <SceneD t={t} />
            <SceneE t={t} />
            <SceneF t={t} />
            <SceneG t={t} />
            <SceneH t={t} />
            <SceneI t={t} />
          </svg>
          <Pills t={t} />
          <Legend t={t} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={tv} />
      <Audio src={staticFile('vo/S1E4.mp3')} />
    </AbsoluteFill>
  );
};
