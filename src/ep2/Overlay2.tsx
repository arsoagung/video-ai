import React from 'react';
import * as THREE from 'three';
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, V, out3, sine, back } from '../motion';
import { CUES2 } from './timeline';
import { project2, memb2, virus3Pos, TOUCH_DIR, Plate2 } from './World2';

// ---------------- palet pill (sama dengan episode ARV) ----------------
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
const C_CD4 = '#8FBDF7';
const C_VIR = '#FF6B4D';
const C_TH = '#F4D77E';
const C_AX = '#E8F0FA';

const pillW = (text: string, size: number) => text.length * size * 0.56 + size * 1.5;
const PillBox: React.FC<{ x: number; y: number; text: string; k: KK; size?: number; op: number; sc?: number }> = ({ x, y, text, k, size = 36, op, sc = 1 }) => {
  const w = pillW(text, size);
  const h = size * 1.9;
  const left = Math.max(36, Math.min(1080 - 36 - w, x - w / 2));
  return (
    <div
      style={{
        position: 'absolute', left, top: y - h / 2, width: w, height: h, borderRadius: h / 2,
        background: PK[k].bg, color: PK[k].fg, fontFamily: FONT, fontWeight: 800, fontSize: size,
        display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap',
        opacity: op, transform: `scale(${0.85 + 0.15 * sc})`, boxShadow: '0 8px 22px rgba(0,0,0,0.28)',
      }}
    >
      {text}
    </div>
  );
};

const lin = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const fade = (t: number, a: number, b: number) => Math.min(ez(t, a, a + 0.4, out3), 1 - ez(t, b - 0.3, b));

// ---------------- label ----------------
type P = { a: number; b: number; text: string; k: KK; x?: number; y?: number; size?: number; anchor?: (t: number) => THREE.Vector3; dx?: number; dy?: number; line?: boolean };
const PILLS: P[] = [
  // S1 hook
  { a: 0.4, b: 4.25, text: 'HIV', k: 'virus', x: 235, y: 450, size: 58 },
  { a: 0.8, b: 4.25, text: 'AIDS', k: 'bad', x: 845, y: 450, size: 58 },
  { a: 4.45, b: 8.3, text: 'Belum tentu.', k: 'neutral', x: 540, y: 450, size: 66 },
  // S2
  { a: 8.7, b: 10.5, text: 'Sel CD4', k: 'cell', anchor: () => memb2(0.7, 0.45, 0.55), dx: 200, dy: -230, line: true, size: 46 },
  // S3
  { a: 10.8, b: 15.6, text: 'Virus HIV', k: 'virus', anchor: virus3Pos, dx: -250, dy: -60, line: true },
  { a: 11.0, b: 15.8, text: 'Sel CD4', k: 'cell', anchor: () => memb2(-0.75, -0.35, 0.55), dx: 40, dy: 230, line: true },
  { a: 12.8, b: 14.0, text: 'Reseptor CD4', k: 'recep', anchor: () => TOUCH_DIR.clone().multiplyScalar(4.6), dx: -60, dy: 250, line: true, size: 34 },
  // S4-S5 grafik
  { a: 16.3, b: 20.2, text: 'Jumlah CD4', k: 'cell', x: 360, y: 455, size: 38 },
  { a: 16.6, b: 20.2, text: 'HIV tidak diobati', k: 'virus', x: 720, y: 455, size: 36 },
  { a: 21.0, b: 29.7, text: '200', k: 'recep', x: 262, y: 950, size: 34 },
  { a: 23.5, b: 29.7, text: 'CD4 < 200 sel/mm³', k: 'bad', x: 540, y: 1330, size: 40 },
  // S6-S7 dua jalur
  { a: 31.5, b: 41.1, text: 'CD4 < 200', k: 'cell', x: 285, y: 868, size: 34 },
  { a: 34.0, b: 41.1, text: 'ATAU', k: 'recep', x: 540, y: 1010, size: 34 },
  { a: 38.6, b: 41.1, text: 'Kondisi penentu AIDS', k: 'neutral', x: 795, y: 868, size: 34 },
  { a: 32.0, b: 41.1, text: 'AIDS', k: 'bad', x: 540, y: 1225, size: 72 },
  // S8
  { a: 45.1, b: 47.95, text: 'Viral load', k: 'virus', x: 285, y: 590, size: 42 },
  { a: 45.5, b: 47.95, text: 'CD4', k: 'cell', x: 795, y: 590, size: 42 },
  // S9
  { a: 48.3, b: 52.9, text: 'Viral load', k: 'virus', x: 540, y: 430, size: 56 },
  // S10
  { a: 53.1, b: 57.7, text: 'Sel CD4', k: 'cell', x: 540, y: 430, size: 56 },
  // S11
  { a: 57.8, b: 69.4, text: 'HIV', k: 'virus', x: 540, y: 520, size: 60 },
  { a: 58.4, b: 69.4, text: '= virus', k: 'neutral', x: 790, y: 520, size: 34 },
  { a: 61.8, b: 69.4, text: 'Infeksi HIV', k: 'virus', x: 540, y: 730, size: 46 },
  { a: 64.4, b: 69.4, text: 'Kerusakan sistem imun', k: 'gray', x: 540, y: 920, size: 46 },
  { a: 66.0, b: 69.4, text: 'AIDS', k: 'bad', x: 540, y: 1110, size: 64 },
  { a: 67.7, b: 69.4, text: 'CD4 < 200', k: 'cell', x: 270, y: 1235, size: 32 },
  { a: 67.9, b: 69.4, text: 'Kondisi penentu AIDS', k: 'neutral', x: 790, y: 1235, size: 32 },
  // S12
  { a: 69.9, b: 74.7, text: 'ARV', k: 'rt', x: 540, y: 450, size: 52 },
  { a: 71.6, b: 74.7, text: 'CD4 terjaga', k: 'cell', x: 760, y: 925, size: 34 },
  { a: 72.0, b: 74.7, text: 'Viral load ditekan', k: 'virus', x: 760, y: 1215, size: 34 },
  // S13
  { a: 74.95, b: 76.5, text: 'Jadi jangan tertukar:', k: 'neutral', x: 540, y: 470, size: 40 },
];

// ---------------- komponen datar ----------------
const FlatVirus: React.FC<{ cx: number; cy: number; r: number; color?: string; dim?: number }> = ({ cx, cy, r, color = '#FF9C85', dim = 1 }) => (
  <g transform={`translate(${cx} ${cy})`} opacity={dim}>
    {Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + 0.2;
      return (
        <g key={i}>
          <line x1={Math.cos(a) * r * 0.95} y1={Math.sin(a) * r * 0.95} x2={Math.cos(a) * r * 1.34} y2={Math.sin(a) * r * 1.34} stroke="#FF8E70" strokeWidth={r * 0.1} strokeLinecap="round" />
          <circle cx={Math.cos(a) * r * 1.42} cy={Math.sin(a) * r * 1.42} r={r * 0.12} fill="#FFE3DA" />
        </g>
      );
    })}
    <circle r={r} fill={color} />
    <circle cx={-r * 0.3} cy={-r * 0.35} r={r * 0.35} fill="#FFFFFF" opacity={0.18} />
  </g>
);

const FlatCapsule: React.FC<{ cx: number; cy: number; len: number; w: number; rot: number }> = ({ cx, cy, len, w, rot }) => {
  const id = `cap${Math.round(cx)}${Math.round(cy)}`;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <clipPath id={id}>
        <rect x={-len / 2} y={-w / 2} width={len} height={w} rx={w / 2} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect x={-len / 2} y={-w / 2} width={len / 2} height={w} fill="#16A394" />
        <rect x={0} y={-w / 2} width={len / 2} height={w} fill="#F4F7FA" />
        <rect x={-len / 2 + 18} y={-w / 2 + 10} width={len - 36} height={w * 0.18} rx={w * 0.09} fill="#FFFFFF" opacity={0.28} />
      </g>
    </g>
  );
};

const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; color?: string; w?: number }> = ({ x1, y1, x2, y2, k, color = '#9CCBFF', w = 8 }) => {
  const dx = x2 - x1, dy = y2 - y1;
  const L = Math.hypot(dx, dy);
  const ux = dx / L, uy = dy / L;
  const hx = x1 + dx * k, hy = y1 + dy * k;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y1} x2={hx - ux * 6} y2={hy - uy * 6} stroke={color} strokeWidth={w} strokeLinecap="round" />
      {k > 0.92 && <polygon points={`${x2},${y2} ${x2 - ux * 30 - uy * 18},${y2 - uy * 30 + ux * 18} ${x2 - ux * 30 + uy * 18},${y2 - uy * 30 - ux * 18}`} fill={color} />}
    </g>
  );
};

// ---------- grafik CD4 ----------
const GX0 = 170, GX1 = 950, GY0 = 500, GY1 = 1220;
const cd4X = (u: number) => GX0 + 40 + (GX1 - GX0 - 80) * u;
const cd4Y = (u: number) => 560 + 640 * Math.pow(u, 1.3);
const U_C = 0.75;
const TH_Y = cd4Y(U_C);

const polyU = (u0: number, u1: number, fx: (u: number) => number, fy: (u: number) => number) => {
  if (u1 <= u0) return '';
  const n = Math.max(2, Math.ceil((u1 - u0) * 90));
  return Array.from({ length: n + 1 }, (_, i) => {
    const u = u0 + ((u1 - u0) * i) / n;
    return `${fx(u).toFixed(1)},${fy(u).toFixed(1)}`;
  }).join(' ');
};

const Cd4Graph: React.FC<{ t: number }> = ({ t }) => {
  const d = lin(t, 16.2, 25.7);
  const th = ez(t, 21.0, 21.8, out3);
  const ring = lin(t, 23.3, 24.2);
  const hx = cd4X(d), hy = cd4Y(d);
  return (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={GX0} x2={GX1} y1={GY0 + 120 + i * 200} y2={GY0 + 120 + i * 200} stroke="#FFFFFF" strokeOpacity={0.08} strokeWidth={2} />
      ))}
      <line x1={GX0} y1={GY0 - 20} x2={GX0} y2={GY1} stroke={C_AX} strokeWidth={6} strokeLinecap="round" />
      <line x1={GX0} y1={GY1} x2={GX1} y2={GY1} stroke={C_AX} strokeWidth={6} strokeLinecap="round" />
      <line x1={GX0 + 6} x2={GX1} y1={TH_Y} y2={TH_Y} stroke={C_TH} strokeWidth={5} strokeDasharray="16 14" opacity={th} />
      <polyline points={polyU(0, Math.min(d, U_C), cd4X, cd4Y)} fill="none" stroke={C_CD4} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
      {d > U_C && <polyline points={polyU(U_C, d, cd4X, cd4Y)} fill="none" stroke={C_VIR} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />}
      {d > 0.01 && d < 0.999 && (
        <>
          <circle cx={hx} cy={hy} r={26} fill="#FFB020" opacity={0.3} />
          <circle cx={hx} cy={hy} r={15} fill="#FFB020" />
        </>
      )}
      {ring > 0 && ring < 1 && <circle cx={cd4X(U_C)} cy={TH_Y} r={20 + ring * 110} fill="none" stroke={C_VIR} strokeWidth={8 * (1 - ring)} opacity={1 - ring} />}
    </g>
  );
};

const MedSymbol: React.FC<{ cx: number; cy: number; s: number }> = ({ cx, cy, s }) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`}>
    <rect x={-95} y={-95} width={190} height={190} rx={44} fill="#EAF2FB" />
    <rect x={-17} y={-60} width={34} height={120} rx={12} fill="#16A394" />
    <rect x={-60} y={-17} width={120} height={34} rx={12} fill="#16A394" />
  </g>
);

const Person: React.FC<{ cx: number; cy: number; k: number; c: string; s?: number }> = ({ cx, cy, k, c, s = 1 }) => (
  <g transform={`translate(${cx} ${cy + (1 - k) * 40}) scale(${s})`} opacity={k}>
    <circle cx={0} cy={-120} r={66} fill={c} />
    <path d="M -135 170 Q -135 -20 0 -20 Q 135 -20 135 170 Z" fill={c} />
    <circle cx={-22} cy={-130} r={24} fill="#FFFFFF" opacity={0.16} />
  </g>
);

// ---------------- layer datar utama ----------------
const Flat: React.FC<{ t: number }> = ({ t }) => {
  // ---- S1 =? ----
  const eq = win(t, 0.6, 4.3, 0.35);
  // ---- S4-S7 grafik -> kartu A ----
  const gVis = win(t, 15.9, 41.3, 0.45);
  const gs = ez(t, 29.8, 31.3, sine);
  const sc = lerp(1, 0.46, gs);
  const tx = lerp(0, 285 - 560 * 0.46, gs);
  const ty = lerp(0, 645 - 860 * 0.46, gs);
  const card = ez(t, 29.9, 30.8);
  // ---- S7 jalur ----
  const nodeB = ez(t, 34.6, 35.6, back);
  const lineA = ez(t, 32.2, 33.6, sine);
  const lineB = ez(t, 36.0, 37.6, sine);
  const jVis = win(t, 31.9, 41.3, 0.4);
  // ---- S8 dua kartu ----
  const s8 = win(t, 41.2, 48.0, 0.45);
  const cardIn = ez(t, 41.9, 42.7, out3);
  // ---- S11 rantai ----
  const s11 = win(t, 57.8, 69.5, 0.45);
  // ---- S12 ----
  const s12 = win(t, 69.7, 74.9, 0.45);
  const rLine = lin(t, 70.0, 71.2);
  const rAfter = lin(t, 71.2, 73.4);
  const marker = ez(t, 70.5, 71.0);
  // ---- S13 ----
  const s13 = win(t, 74.9, 82, 0.6);

  const virPos: [number, number][] = [
    [-110, -190], [30, -230], [140, -150], [-140, -60], [-20, -90], [100, -10], [-100, 70], [20, 60], [140, 110], [-30, 190], [90, 200], [-150, 190], [60, -90], [-70, -150],
  ];

  // grafik S12
  const C0 = 170, C1 = 950, CY1 = 1260, MX = 470;
  const redY = (x: number) => (x <= MX ? 800 : 800 + 370 * (1 - Math.exp(-4.2 * ((x - MX) / (C1 - 40 - MX)))));
  const blueY = (x: number) => (x <= MX ? 850 + 150 * Math.pow((x - 210) / (MX - 210), 1.2) : 1000 + 6 * Math.sin((x - MX) / 40));
  const ptsLine = (x0: number, x1: number, f: (x: number) => number) => {
    if (x1 <= x0) return '';
    const n = Math.max(2, Math.ceil((x1 - x0) / 8));
    return Array.from({ length: n + 1 }, (_, i) => {
      const x = x0 + ((x1 - x0) * i) / n;
      return `${x.toFixed(1)},${f(x).toFixed(1)}`;
    }).join(' ');
  };

  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <filter id="cardsh" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#031327" floodOpacity="0.35" />
        </filter>
        <linearGradient id="cardfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.13" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.06" />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#9FDCFF" stopOpacity="0.42" />
          <stop offset="1" stopColor="#9FDCFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* S1 tanda sama dengan */}
      {eq > 0.01 && (
        <text x={540} y={478} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={96} fill="#EAF2FB" opacity={eq}>
          =?
        </text>
      )}

      {/* S4-S7: grafik CD4 yang mengecil jadi kartu */}
      {gVis > 0.01 && (
        <g opacity={gVis}>
          {card > 0.01 && <rect x={65} y={430} width={440} height={430} rx={46} fill="url(#cardfill)" opacity={card} filter="url(#cardsh)" />}
          <g transform={`translate(${tx} ${ty}) scale(${sc})`}>
            <Cd4Graph t={t} />
          </g>
        </g>
      )}

      {/* S7: kartu B, jalur menuju AIDS */}
      {jVis > 0.01 && (
        <g opacity={jVis}>
          <g opacity={nodeB}>
            <rect x={575} y={430} width={440} height={430} rx={46} fill="url(#cardfill)" filter="url(#cardsh)" />
            <MedSymbol cx={795} cy={625} s={1.15 * nodeB} />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={725 + i * 70} cy={785} r={14} fill="#F4D77E" opacity={0.9} />
            ))}
          </g>
          <Arrow x1={285} y1={915} x2={470} y2={1150} k={lineA} />
          <Arrow x1={795} y1={915} x2={610} y2={1150} k={lineB} />
        </g>
      )}

      {/* S8: viral load vs CD4 */}
      {s8 > 0.01 && (
        <g opacity={s8}>
          <g opacity={cardIn}>
            <rect x={65} y={620} width={440} height={620} rx={46} fill="url(#cardfill)" filter="url(#cardsh)" />
            <rect x={575} y={620} width={440} height={620} rx={46} fill="url(#cardfill)" filter="url(#cardsh)" />
            {virPos.map(([x, y], i) => (
              <FlatVirus key={i} cx={285 + x * 0.95} cy={930 + y + Math.sin(t * 1.2 + i) * 6} r={26} dim={ez(t, 42.0 + i * 0.07, 42.5 + i * 0.07)} />
            ))}
            {/* CD4: garis menurun kecil + garis 200 */}
            <line x1={645} y1={680} x2={645} y2={1170} stroke={C_AX} strokeWidth={5} strokeLinecap="round" />
            <line x1={645} y1={1170} x2={950} y2={1170} stroke={C_AX} strokeWidth={5} strokeLinecap="round" />
            <line x1={652} y1={1050} x2={950} y2={1050} stroke={C_TH} strokeWidth={4} strokeDasharray="12 12" />
            <polyline points={polyU(0, 1, (u) => 680 + 270 * u, (u) => 740 + 380 * Math.pow(u, 1.3))} fill="none" stroke={C_CD4} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" transform="translate(0 0)" />
          </g>
          {t > 45.0 && (
            <g opacity={ez(t, 45.0, 45.6)}>
              <line x1={540} y1={880} x2={540} y2={980} stroke="#EAF2FB" strokeWidth={0} />
              <g transform="translate(540 930)">
                <line x1={-34} y1={-14} x2={34} y2={-14} stroke="#EAF2FB" strokeWidth={10} strokeLinecap="round" />
                <line x1={-34} y1={14} x2={34} y2={14} stroke="#EAF2FB" strokeWidth={10} strokeLinecap="round" />
                <line x1={-22} y1={-38} x2={22} y2={38} stroke="#EAF2FB" strokeWidth={10} strokeLinecap="round" />
              </g>
            </g>
          )}
        </g>
      )}

      {/* S11: rantai HIV -> infeksi -> kerusakan -> AIDS */}
      {s11 > 0.01 && (
        <g opacity={s11}>
          <Arrow x1={540} y1={580} x2={540} y2={655} k={ez(t, 61.5, 62.0)} />
          <Arrow x1={540} y1={790} x2={540} y2={845} k={ez(t, 64.1, 64.6)} />
          <Arrow x1={540} y1={980} x2={540} y2={1035} k={ez(t, 65.7, 66.2)} />
          <FlatVirus cx={300} cy={520} r={44} dim={ez(t, 57.9, 58.4)} />
          <Arrow x1={270} y1={1190} x2={430} y2={1160} k={ez(t, 67.8, 68.2)} color="#F4D77E" w={6} />
          <Arrow x1={790} y1={1190} x2={650} y2={1160} k={ez(t, 68.0, 68.4)} color="#F4D77E" w={6} />
        </g>
      )}

      {/* S12: ARV, viral load ditekan, CD4 terjaga */}
      {s12 > 0.01 && (
        <g opacity={s12}>
          <g opacity={ez(t, 69.9, 70.5)}>
            <FlatCapsule cx={540} cy={570} len={230} w={96} rot={-12} />
          </g>
          <line x1={C0} y1={700} x2={C0} y2={CY1} stroke={C_AX} strokeWidth={6} strokeLinecap="round" />
          <line x1={C0} y1={CY1} x2={C1} y2={CY1} stroke={C_AX} strokeWidth={6} strokeLinecap="round" />
          {marker > 0 && <line x1={MX} y1={750} x2={MX} y2={CY1} stroke="#72E3D3" strokeWidth={5} strokeDasharray="12 12" opacity={marker} />}
          <polyline points={ptsLine(210, 210 + (MX - 210) * rLine, blueY)} fill="none" stroke={C_CD4} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
          {rAfter > 0 && <polyline points={ptsLine(MX, MX + (C1 - 40 - MX) * rAfter, blueY)} fill="none" stroke={C_CD4} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />}
          <polyline points={ptsLine(210, 210 + (MX - 210) * rLine, redY)} fill="none" stroke={C_VIR} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
          {rAfter > 0 && <polyline points={ptsLine(MX, MX + (C1 - 40 - MX) * rAfter, redY)} fill="none" stroke={C_VIR} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />}
        </g>
      )}

      {/* S13: manusia */}
      {s13 > 0.01 && (
        <g opacity={s13}>
          <circle cx={540} cy={760} r={470 + Math.sin(t * 0.9) * 14} fill="url(#glow)" />
          <Person cx={235} cy={790 + Math.sin(t * 1.1) * 6} k={ez(t, 75.2, 76.0, out3)} c="#FF9C85" s={0.95} />
          <Person cx={540} cy={760 + Math.sin(t * 1.1 + 1.2) * 6} k={ez(t, 75.4, 76.2, out3)} c="#8FBDF7" s={1.12} />
          <Person cx={845} cy={790 + Math.sin(t * 1.1 + 2.4) * 6} k={ez(t, 75.6, 76.4, out3)} c="#72E3D3" s={0.95} />
        </g>
      )}
    </svg>
  );
};

const useFonts2 = () => {
  const [handle] = React.useState(() => delayRender('fonts'));
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

// ---------------- kontinuitas, legenda, subtitle beraksen ----------------
const SHOW_LEGEND = true;
// zoom-out halus tiap kali layer datar baru masuk
const settle = (t: number) => {
  let z = 0;
  for (const T of [15.9, 57.8, 69.7, 74.9]) if (t >= T) z += 0.035 * (1 - ez(t, T, T + 1.0, out3));
  return 1 + z;
};
const Legend: React.FC<{ t: number }> = ({ t }) => {
  const k = Math.min(ez(t, 8.7, 9.4), 1 - ez(t, 74.3, 74.9));
  if (!SHOW_LEGEND || k < 0.01) return null;
  const item = (c: string, label: string) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
      {label}
    </span>
  );
  return (
    <div style={{ position: 'absolute', top: 250, width: '100%', display: 'flex', justifyContent: 'center', opacity: 0.9 * k }}>
      <div style={{ display: 'flex', gap: 34, background: 'rgba(8,24,46,0.38)', borderRadius: 999, padding: '12px 30px', fontFamily: FONT, fontWeight: 600, fontSize: 28, color: '#EAF2FB' }}>
        {item('#8FBDF7', 'CD4')}
        {item('#FF9C85', 'Virus HIV')}
      </div>
    </div>
  );
};
const ACC: Record<string, string> = { cd4: '#8FBDF7', aids: '#FF8A7A', hiv: '#FFB7A5', virus: '#FFB7A5', viral: '#FFB7A5', load: '#FFB7A5', arv: '#72E3D3', '200': '#F4D77E' };
const Sub: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(' ').map((w, i) => {
      const c = ACC[w.toLowerCase().replace(/[^a-z0-9]/g, '')];
      return (
        <React.Fragment key={i}>
          {i > 0 ? ' ' : ''}
          {c ? <span style={{ color: c, fontWeight: 800 }}>{w}</span> : w}
        </React.Fragment>
      );
    })}
  </>
);

export const Overlay2: React.FC = () => {
  useFonts2();
  const f = useCurrentFrame();
  const t = f / FPS;
  const cue = CUES2.find((c) => t >= c.a - 0.05 && t < c.b);
  const ck = cue ? Math.min(1, (t - cue.a + 0.05) / 0.18) : 0;
  const e1 = ez(t, 76.6, 77.6, out3);
  const e2 = ez(t, 78.78, 79.7, out3);
  const e3 = ez(t, 80.17, 81.1, out3);

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${settle(t)})`, transformOrigin: '540px 960px' }}>
        <Flat t={t} />
      </div>
      <Legend t={t} />

      {/* garis penunjuk label 3D */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {PILLS.filter((p) => p.anchor && p.line && t >= p.a && t <= p.b).map((p, i) => {
          const [ax, ay] = project2(t, p.anchor!(t));
          const k = fade(t, p.a, p.b);
          return (
            <g key={i} opacity={k}>
              <line x1={ax + (p.dx ?? 0)} y1={ay + (p.dy ?? 0)} x2={ax} y2={ay} stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={3} strokeLinecap="round" />
              <circle cx={ax} cy={ay} r={7} fill="#FFFFFF" />
            </g>
          );
        })}
      </svg>

      {PILLS.filter((p) => t >= p.a && t <= p.b).map((p, i) => {
        const k = fade(t, p.a, p.b);
        let x = p.x ?? 540;
        let y = p.y ?? 540;
        if (p.anchor) {
          const [ax, ay] = project2(t, p.anchor(t));
          x = ax + (p.dx ?? 0);
          y = ay + (p.dy ?? 0);
        }
        return <PillBox key={i} x={x} y={y} text={p.text} k={p.k} size={p.size ?? 38} op={k} sc={k} />;
      })}


      {t >= 76.5 && (
        <>
          <div style={{ position: 'absolute', top: 1065, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 74, color: '#6CF0DC', opacity: e1, transform: `translateY(${(1 - e1) * 18}px)`, textShadow: '0 6px 30px #00000066' }}>
            HIV belum tentu AIDS.
          </div>
          <div style={{ position: 'absolute', top: 1190, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 54, color: '#FFFFFF', opacity: e2, transform: `translateY(${(1 - e2) * 14}px)`, textShadow: '0 4px 24px #00000066' }}>
            Pahami faktanya.
          </div>
          <div style={{ position: 'absolute', top: 1275, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 54, color: '#FFFFFF', opacity: e3, transform: `translateY(${(1 - e3) * 14}px)`, textShadow: '0 4px 24px #00000066' }}>
            Hargai manusianya.
          </div>
        </>
      )}

      {cue && t < 76.5 && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <span><Sub text={cue.text} /></span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// pratinjau: lapisan 3D + lapisan datar + audio (untuk cek still)
export const Ep2Full: React.FC = () => (
  <AbsoluteFill>
    <Plate2 />
    <Overlay2 />
    <Audio src={staticFile('vo.mp3')} />
  </AbsoluteFill>
);
