import React from 'react';
import * as THREE from 'three';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { CUES } from './captions';
import { FONT, FPS } from './Board';
import { ez, win, V, out3, sine, back, project, virusFly, enzymePosC, enzymePosGH, virionPos, rnaPoint, helixPoint, HELIX_C, NUC } from './motion';
import { integraseP, pieceOffI, MR_T } from './Main3D';

// ---------------- palet pill ----------------
const PK = {
  virus: { bg: '#FF9C85', fg: '#3B1308' },
  cell: { bg: '#8FBDF7', fg: '#0E2A52' },
  recep: { bg: '#F4D77E', fg: '#4A3606' },
  rna: { bg: '#FF8F73', fg: '#431106' },
  dnaV: { bg: '#FFD27A', fg: '#4A3300' },
  dnaC: { bg: '#9EC0F5', fg: '#0E2A52' },
  rt: { bg: '#72E3D3', fg: '#063F38' },
  integ: { bg: '#BDA8FF', fg: '#2A1566' },
  pi: { bg: '#7DB4FF', fg: '#0A2A5C' },
  prot: { bg: '#FFD166', fg: '#4A3300' },
  bad: { bg: '#FF6B5E', fg: '#3B0A06' },
  neutral: { bg: '#EAF2FB', fg: '#12304F' },
  gray: { bg: '#B9C3D0', fg: '#1D2A3A' },
} as const;
type KK = keyof typeof PK;

const pillW = (text: string, size: number) => text.length * size * 0.56 + size * 1.5;

const PillBox: React.FC<{ x: number; y: number; text: string; k: KK; size?: number; op: number; sc?: number }> = ({ x, y, text, k, size = 36, op, sc = 1 }) => {
  const w = pillW(text, size);
  const h = size * 1.9;
  const left = Math.max(36, Math.min(1080 - 36 - w, x - w / 2));
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: y - h / 2,
        width: w,
        height: h,
        borderRadius: h / 2,
        background: PK[k].bg,
        color: PK[k].fg,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        opacity: op,
        transform: `scale(${0.85 + 0.15 * sc})`,
        boxShadow: '0 8px 22px rgba(0,0,0,0.28)',
      }}
    >
      {text}
    </div>
  );
};

// ---------------- label dengan posisi 3D ----------------
type L3 = { a: number; b: number; text: string; k: KK; anchor: (t: number) => THREE.Vector3; dx: number; dy: number; line?: boolean };
const memb = (x: number, y: number, z: number) => V(x, y, z).normalize().multiplyScalar(4.6);
const LABELS: L3[] = [
  // A
  { a: 0.5, b: 4.0, text: 'Virus HIV', k: 'virus', anchor: () => V(0.5, 2.2, 0), dx: 230, dy: -230 },
  { a: 1.4, b: 4.0, text: 'Obat ARV', k: 'rt', anchor: () => V(0.8, -1.4, 0), dx: 240, dy: 150 },
  // B
  { a: 5.0, b: 7.7, text: 'Sel CD4', k: 'cell', anchor: () => memb(0.55, 0.65, 0.5), dx: 190, dy: -170 },
  { a: 5.6, b: 7.7, text: 'Reseptor CD4', k: 'recep', anchor: () => memb(-0.85, 0.05, 0.5), dx: 170, dy: 120, line: true },
  { a: 6.3, b: 7.9, text: 'Virus HIV', k: 'virus', anchor: virusFly, dx: 200, dy: -120 },
  // C
  { a: 9.3, b: 11.4, text: 'RNA virus', k: 'rna', anchor: () => rnaPoint(0.88), dx: 0, dy: -110 },
  { a: 11.5, b: 15.6, text: 'Enzim reverse transcriptase', k: 'rt', anchor: enzymePosC, dx: 0, dy: -130 },
  { a: 12.6, b: 16.3, text: 'DNA virus (baru)', k: 'dnaV', anchor: () => helixPoint(HELIX_C, 0.2), dx: 20, dy: 110 },
  // D
  { a: 17.6, b: 21.3, text: 'DNA sel', k: 'dnaC', anchor: () => V(-0.5, NUC.y, NUC.z), dx: -190, dy: 140, line: true },
  { a: 19.8, b: 21.3, text: 'DNA virus menyatu', k: 'dnaV', anchor: () => V(0.4, NUC.y + 0.2, NUC.z), dx: 120, dy: 190 },
  { a: 18.4, b: 21.0, text: 'Enzim integrase', k: 'integ', anchor: () => integraseP, dx: 10, dy: -150 },
  // E
  { a: 22.7, b: 25.5, text: 'RNA baru', k: 'rna', anchor: () => MR_T[1].clone().lerp(V(NUC.x, NUC.y + 1.45, NUC.z), 0.45), dx: 210, dy: -50 },
  { a: 24.6, b: 28.0, text: 'Protein baru', k: 'prot', anchor: () => V(2.3, 1.0, 0.4), dx: 80, dy: 150 },
  { a: 27.8, b: 29.7, text: 'Virus baru', k: 'virus', anchor: virionPos, dx: -80, dy: -140 },
  // F
  { a: 30.4, b: 32.9, text: 'Obat ARV', k: 'rt', anchor: () => V(0.5, 0.9, 0), dx: 0, dy: -300 },
  // G-H
  { a: 34.0, b: 38.6, text: 'NRTI', k: 'rt', anchor: () => enzymePosGH(35.8).add(V(-0.4, 0.3, 0)), dx: -20, dy: -130 },
  { a: 35.0, b: 38.6, text: 'NNRTI', k: 'integ', anchor: () => enzymePosGH(35.8).add(V(0.4, 0.3, 0)), dx: 150, dy: -140 },
  { a: 37.0, b: 41.0, text: 'Enzim terhambat', k: 'gray', anchor: enzymePosGH, dx: 80, dy: 130 },
  { a: 39.6, b: 41.0, text: 'DNA terhenti', k: 'bad', anchor: () => helixPoint(HELIX_C, 0.15), dx: 250, dy: 150 },
  // I
  { a: 42.4, b: 47.9, text: 'Enzim integrase', k: 'integ', anchor: () => integraseP, dx: -60, dy: -170 },
  { a: 43.0, b: 47.9, text: 'Integrase inhibitor', k: 'rt', anchor: () => integraseP.clone().add(V(0.38, 0.12, 0.1)), dx: 220, dy: -80 },
  { a: 44.0, b: 47.9, text: 'DNA virus ditolak', k: 'bad', anchor: () => pieceOffI(45.0).add(V(0.4, NUC.y, NUC.z)), dx: -60, dy: 220 },
  // J
  { a: 49.6, b: 52.3, text: 'Virus baru', k: 'gray', anchor: () => V(-0.6, 0.9, 0), dx: -110, dy: -170 },
  { a: 51.6, b: 56.3, text: 'Protease inhibitor', k: 'pi', anchor: () => V(1.1, 2.15, 0.8), dx: 120, dy: 150 },
  { a: 53.4, b: 56.3, text: 'Belum matang, tidak infeksius', k: 'bad', anchor: () => V(0, -1.2, 0), dx: 0, dy: 160 },
];

// ---------------- langkah (pill judul) ----------------
const STEPS: { a: number; b: number; n?: number; text: string }[] = [
  { a: 4.7, b: 8.0, n: 1, text: 'HIV mendekati sel CD4' },
  { a: 8.1, b: 16.4, n: 2, text: 'RNA virus disalin jadi DNA' },
  { a: 16.5, b: 21.7, n: 3, text: 'DNA virus menyatu ke DNA sel' },
  { a: 21.9, b: 29.9, n: 4, text: 'Virus baru dirakit' },
  { a: 30.0, b: 33.2, n: 5, text: 'Obat ARV masuk' },
  { a: 33.4, b: 41.4, n: 6, text: 'NRTI & NNRTI menghambat penyalinan' },
  { a: 41.5, b: 48.5, n: 7, text: 'Integrase inhibitor menghambat penyisipan' },
  { a: 48.7, b: 56.6, n: 8, text: 'Protease inhibitor menghambat pematangan' },
  { a: 56.8, b: 62.1, n: 9, text: 'Beberapa obat bekerja bersama' },
  { a: 62.2, b: 69.0, n: 10, text: 'Jumlah virus di darah turun' },
  { a: 69.1, b: 71.8, n: 11, text: 'Virus belum hilang' },
  { a: 71.9, b: 74.6, n: 12, text: 'Replikasi virus ditekan' },
  { a: 74.8, b: 80.0, text: 'Kesimpulan' },
];

type LG = { a: number; b: number; items: [string, string][] };
const LEGENDS: LG[] = [
  { a: 4.8, b: 8.0, items: [['Virus HIV', '#FF9C85'], ['Sel CD4', '#8FBDF7'], ['Reseptor', '#F4D77E']] },
  { a: 8.2, b: 16.4, items: [['RNA virus', '#FF8F73'], ['Enzim', '#72E3D3'], ['DNA virus', '#FFD27A']] },
  { a: 16.6, b: 21.7, items: [['DNA sel', '#9EC0F5'], ['DNA virus', '#FFD27A'], ['Integrase', '#BDA8FF']] },
  { a: 22.0, b: 29.9, items: [['RNA baru', '#FF8F73'], ['Protein', '#FFD166'], ['Virus baru', '#FF9C85']] },
  { a: 33.5, b: 41.4, items: [['Obat ARV', '#72E3D3'], ['Enzim RT', '#72E3D3'], ['DNA virus', '#FFD27A']] },
  { a: 41.6, b: 48.5, items: [['Integrase', '#BDA8FF'], ['Obat', '#FF9F43'], ['DNA sel', '#9EC0F5']] },
  { a: 48.8, b: 56.6, items: [['Virus belum matang', '#B9C3D0'], ['Protease', '#7DB4FF'], ['Obat', '#72E3D3']] },
];

// ---------------- komponen datar ----------------
const FlatVirus: React.FC<{ cx: number; cy: number; r: number; color: string; spike: string; dim?: number }> = ({ cx, cy, r, color, spike, dim = 1 }) => (
  <g transform={`translate(${cx} ${cy})`} opacity={dim}>
    {Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2 + 0.2;
      return (
        <g key={i}>
          <line x1={Math.cos(a) * r * 0.95} y1={Math.sin(a) * r * 0.95} x2={Math.cos(a) * r * 1.34} y2={Math.sin(a) * r * 1.34} stroke={spike} strokeWidth={r * 0.08} strokeLinecap="round" />
          <circle cx={Math.cos(a) * r * 1.42} cy={Math.sin(a) * r * 1.42} r={r * 0.1} fill="#FFE3DA" />
        </g>
      );
    })}
    <circle r={r} fill={color} />
    <circle cx={-r * 0.3} cy={-r * 0.35} r={r * 0.35} fill="#FFFFFF" opacity={0.18} />
  </g>
);

const FlatPill: React.FC<{ cx: number; cy: number; len: number; w: number; rot: number }> = ({ cx, cy, len, w, rot }) => {
  const id = `pc${Math.round(cx)}${Math.round(cy)}`;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <clipPath id={id}>
        <rect x={-len / 2} y={-w / 2} width={len} height={w} rx={w / 2} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect x={-len / 2} y={-w / 2} width={len / 2} height={w} fill="#16A394" />
        <rect x={0} y={-w / 2} width={len / 2} height={w} fill="#F4F7FA" />
        <rect x={-len / 2 + 24} y={-w / 2 + 14} width={len - 48} height={w * 0.18} rx={w * 0.09} fill="#FFFFFF" opacity={0.28} />
      </g>
    </g>
  );
};

const Poly: React.FC<{ n: number; r: number; rot?: number }> = ({ n, r, rot = 0 }) => (
  <polygon points={Array.from({ length: n }, (_, i) => `${Math.cos(rot + (i / n) * Math.PI * 2) * r},${Math.sin(rot + (i / n) * Math.PI * 2) * r}`).join(' ')} fill="#FFFFFF" opacity={0.92} />
);

const FlatK: React.FC<{ t: number }> = ({ t }) => {
  const vis = win(t, 56.7, 62.0, 0.4);
  if (vis <= 0.01) return null;
  const conv = ez(t, 59.3, 60.2, sine);
  const items = [
    { x: 200, c: '#2FD6C4', n: 4, label: 'NRTI / NNRTI', k: 'rt' as KK, d: 57.0 },
    { x: 540, c: '#9B7BFF', n: 5, label: 'Integrase inhibitor', k: 'integ' as KK, d: 57.6 },
    { x: 880, c: '#4C9BFF', n: 6, label: 'Protease inhibitor', k: 'pi' as KK, d: 58.2 },
  ];
  const pillIn = ez(t, 60.0, 61.0, back);
  return (
    <g opacity={vis}>
      {items.map((it, i) => {
        const s = ez(t, it.d, it.d + 0.5, back) * (1 - conv);
        const x = it.x + (540 - it.x) * conv;
        const y = 760 + Math.sin(t * 1.6 + i) * 8;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <circle r={125} fill={it.c} />
            <circle cx={-35} cy={-40} r={44} fill="#FFFFFF" opacity={0.2} />
            <Poly n={it.n} r={52} rot={-Math.PI / 2 + i * 0.25} />
          </g>
        );
      })}
      <g transform={`translate(540 ${760 + Math.sin(t * 1.5) * 8}) scale(${pillIn})`}>
        <FlatPill cx={0} cy={0} len={480} w={200} rot={-15} />
      </g>
    </g>
  );
};

const FlatL: React.FC<{ t: number }> = ({ t }) => {
  const vis = win(t, 62.2, 69.0, 0.5);
  if (vis <= 0.01) return null;
  const d = ez(t, 64.2, 68.0, Easing.inOut(Easing.sin));
  const X0 = 170;
  const X1 = 950;
  const Y0 = 1240;
  const YT = 480;
  const yOf = (u: number) => YT + 70 + (Y0 - 60 - YT - 70) * ((1 - Math.exp(-4 * u)) / (1 - Math.exp(-4)));
  const pts: string[] = [];
  const n = Math.max(2, Math.floor(d * 90));
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * d;
    pts.push(`${(X0 + 30 + (X1 - X0 - 60) * u).toFixed(1)},${yOf(u).toFixed(1)}`);
  }
  const hx = X0 + 30 + (X1 - X0 - 60) * d;
  const hy = yOf(d);
  const thY = 1130;
  return (
    <g opacity={vis}>
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={X0} x2={X1} y1={YT + i * 190} y2={YT + i * 190} stroke="#FFFFFF" strokeOpacity={0.1} strokeWidth={2} />
      ))}
      <line x1={X0} y1={YT - 30} x2={X0} y2={Y0} stroke="#E8F0FA" strokeWidth={6} strokeLinecap="round" />
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="#E8F0FA" strokeWidth={6} strokeLinecap="round" />
      <line x1={X0 + 6} x2={X1} y1={thY} y2={thY} stroke="#B9C3D0" strokeWidth={4} strokeDasharray="14 14" />
      <polyline points={pts.join(' ')} fill="none" stroke="#FF6B4D" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
      {d > 0.01 && (
        <>
          <circle cx={hx} cy={hy} r={26} fill="#FFB020" opacity={0.3} />
          <circle cx={hx} cy={hy} r={15} fill="#FFB020" />
        </>
      )}
    </g>
  );
};

const FlatMN: React.FC<{ t: number }> = ({ t }) => {
  const vis = win(t, 68.9, 74.8, 0.5);
  if (vis <= 0.01) return null;
  const pos: [number, number][] = [
    [380, 700],
    [720, 640],
    [700, 950],
    [400, 930],
  ];
  const pauseS = ez(t, 71.9, 72.5, back);
  return (
    <g opacity={vis}>
      <circle cx={540} cy={820} r={340} fill="#6FB1F2" opacity={0.22} />
      <circle cx={600} cy={960} r={110} fill="#8FB9EE" opacity={0.4} />
      {pos.map(([x, y], i) => (
        <FlatVirus key={i} cx={x} cy={y + Math.sin(t * 1.1 + i) * 6} r={42} color="#8E9AAF" spike="#AAB4C6" dim={ez(t, 69.3 + i * 0.12, 69.8 + i * 0.12) * (1 - 0.35 * ez(t, 72.5, 73.2))} />
      ))}
      <g transform={`translate(540 800) scale(${pauseS})`}>
        <circle r={150} fill="#16A394" opacity={0.95} />
        <rect x={-62} y={-66} width={38} height={132} rx={19} fill="#FFFFFF" />
        <rect x={24} y={-66} width={38} height={132} rx={19} fill="#FFFFFF" />
      </g>
    </g>
  );
};

const FlatO: React.FC<{ t: number }> = ({ t }) => {
  const vis = win(t, 74.7, 81, 0.5);
  if (vis <= 0.01) return null;
  const chk = ez(t, 76.2, 76.9, back);
  return (
    <g opacity={vis}>
      <g transform={`translate(0 ${Math.sin(t * 1.4) * 10})`}>
        <FlatPill cx={540} cy={640} len={560} w={230} rot={-18} />
      </g>
      <g transform={`translate(540 1000) scale(${chk})`}>
        <circle r={95} fill="#16A394" />
        <polyline points="-42,2 -12,34 46,-30" fill="none" stroke="#FFFFFF" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
};

// pill label untuk adegan datar (posisi layar tetap)
type LF = { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number };
const FLAT_LABELS: LF[] = [
  { a: 57.8, b: 59.3, text: 'NRTI / NNRTI', k: 'rt', x: 200, y: 960, size: 32 },
  { a: 58.3, b: 59.3, text: 'Integrase inhibitor', k: 'integ', x: 540, y: 1030, size: 32 },
  { a: 58.8, b: 59.3, text: 'Protease inhibitor', k: 'pi', x: 880, y: 960, size: 32 },
  { a: 60.6, b: 61.9, text: 'Kombinasi ARV', k: 'rt', x: 540, y: 1000 },
  { a: 62.6, b: 68.9, text: 'Jumlah virus', k: 'virus', x: 390, y: 460 },
  { a: 63.0, b: 68.9, text: 'Mulai minum ARV', k: 'rt', x: 520, y: 600, size: 32 },
  { a: 64.6, b: 68.9, text: 'Tidak terdeteksi', k: 'neutral', x: 760, y: 1190 },
  { a: 69.6, b: 71.8, text: 'Masih ada (dorman)', k: 'gray', x: 540, y: 1260 },
  { a: 72.4, b: 74.5, text: 'Replikasi ditekan', k: 'rt', x: 540, y: 1260 },
];

export const Overlay: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cue = CUES.find((c) => t >= c.a - 0.05 && t < c.b);
  const ck = cue ? Math.min(1, (t - cue.a + 0.05) / 0.18) : 0;
  const step = STEPS.find((s) => t >= s.a && t < s.b);
  const sk = step ? Math.min(ez(t, step.a, step.a + 0.4, out3), 1 - ez(t, step.b - 0.3, step.b)) : 0;
  const lg = LEGENDS.find((l) => t >= l.a && t < l.b);
  const lk = lg ? Math.min(ez(t, lg.a, lg.a + 0.4, out3), 1 - ez(t, lg.b - 0.3, lg.b)) : 0;
  const endK = ez(t, 76.8, 77.6, out3);

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <FlatK t={t} />
        <FlatL t={t} />
        <FlatMN t={t} />
        <FlatO t={t} />
        {LABELS.filter((l) => l.line && t >= l.a && t <= l.b).map((l, i) => {
          const [ax, ay] = project(t, l.anchor(t));
          const k = Math.min(ez(t, l.a, l.a + 0.4, out3), 1 - ez(t, l.b - 0.3, l.b));
          return (
            <g key={i} opacity={k}>
              <line x1={ax + l.dx} y1={ay + l.dy} x2={ax} y2={ay} stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={3} strokeLinecap="round" />
              <circle cx={ax} cy={ay} r={7} fill="#FFFFFF" />
            </g>
          );
        })}
      </svg>

      {LABELS.filter((l) => t >= l.a && t <= l.b).map((l, i) => {
        const [ax, ay] = project(t, l.anchor(t));
        const k = Math.min(ez(t, l.a, l.a + 0.4, out3), 1 - ez(t, l.b - 0.3, l.b));
        return <PillBox key={i} x={ax + l.dx} y={ay + l.dy} text={l.text} k={l.k} op={k} sc={k} />;
      })}
      {FLAT_LABELS.filter((l) => t >= l.a && t <= l.b).map((l, i) => {
        const k = Math.min(ez(t, l.a, l.a + 0.4, out3), 1 - ez(t, l.b - 0.3, l.b));
        return <PillBox key={`f${i}`} x={l.x} y={l.y} text={l.text} k={l.k} size={l.size ?? 38} op={k} sc={k} />;
      })}

      {step && (
        <div style={{ position: 'absolute', top: 250, width: '100%', display: 'flex', justifyContent: 'center', opacity: sk, transform: `translateY(${(1 - sk) * -14}px)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#F7FAFD', borderRadius: 999, padding: '20px 44px', fontFamily: FONT, fontWeight: 800, fontSize: step.text.length > 33 ? 35 : 42, color: '#12304F', boxShadow: '0 10px 30px rgba(0,0,0,0.28)', whiteSpace: 'nowrap' }}>
            {step.n !== undefined && <span style={{ color: '#17A294' }}>{step.n}</span>}
            <span>{step.text}</span>
          </div>
        </div>
      )}

      {lg && (
        <div style={{ position: 'absolute', top: 1378, width: '100%', display: 'flex', justifyContent: 'center', opacity: lk }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 34, background: 'rgba(8,24,46,0.82)', borderRadius: 999, padding: '16px 40px', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#EAF2FB' }}>
            {lg.items.map(([txt, c]) => (
              <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 20, height: 20, borderRadius: 10, background: c, display: 'inline-block' }} />
                {txt}
              </div>
            ))}
          </div>
        </div>
      )}

      {endK > 0 && (
        <div style={{ position: 'absolute', top: 1160, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 84, color: '#6CF0DC', opacity: endK, transform: `translateY(${(1 - endK) * 18}px)`, textShadow: '0 6px 30px #00000066' }}>
          Minum ARV teratur
        </div>
      )}

      {cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          {cue.text}
        </div>
      )}
    </AbsoluteFill>
  );
};
