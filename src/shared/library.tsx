import React from 'react';
import { SHAPE_COL } from './shapes';

// Library objek SVG seri Makna Positif (prioritas 1). Melengkapi src/shared/shapes.tsx (FlatVirus, FlatCell, Figure, Star).
// Aturan: flat, tanpa outline/border pada objek, tanpa wajah. Koordinat lokal berpusat di (0,0);
// tiap komponen ditempatkan lewat cx, cy dan diskalakan lewat s (default 1). rot = derajat, op = opacity.
// Ukuran nominal ±200 satuan kecuali disebut lain.

export const LIB_COL = {
  ink: '#173A5E',
  light: '#EAF2FB',
  track: '#B3C7DC',
  good: '#72E3D3', // ARV, pemulihan, benar
  goodDark: '#2FB9A6',
  bad: '#FF6B4D', // virus, salah, bahaya
  tcell: '#7ED6A8',
  tcellDark: '#3FAF7C',
  bcell: '#B9A2F5',
  bcellDark: '#8468DB',
  antibody: '#E9D8FF',
  rna: '#FF8E70',
  dnaA: '#F4D77E',
  dnaB: '#72E3D3',
  rt: '#F4A6C8',
  integrase: '#FFC38A',
  protease: '#9ADBF0',
  blood: '#F0616A',
  bloodDark: '#C9434D',
  glass: '#DDEBFF',
  panel: '#FFFFFF',
};

type P = { cx: number; cy: number; s?: number; rot?: number; op?: number };
const G: React.FC<P & { children: React.ReactNode }> = ({ cx, cy, s = 1, rot = 0, op = 1, children }) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`} opacity={op}>
    {children}
  </g>
);
const FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

// ================= BIOLOGI =================

// Sel T sitotoksik: bola hijau dengan inti dua cuping dan tonjolan kecil.
export const TCytoCell: React.FC<P> = (p) => (
  <G {...p}>
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return <circle key={i} cx={Math.cos(a) * 104} cy={Math.sin(a) * 104} r={10} fill={LIB_COL.tcell} />;
    })}
    <circle r={100} fill={LIB_COL.tcell} />
    <circle cx={-30} cy={-35} r={36} fill="#fff" opacity={0.16} />
    <circle cx={-18} cy={14} r={34} fill={LIB_COL.tcellDark} opacity={0.9} />
    <circle cx={24} cy={26} r={30} fill={LIB_COL.tcellDark} opacity={0.9} />
  </G>
);

// Sel B: bola ungu dengan inti besar (penghasil antibodi).
export const BCell: React.FC<P> = (p) => (
  <G {...p}>
    <circle r={100} fill={LIB_COL.bcell} />
    <circle cx={-30} cy={-35} r={36} fill="#fff" opacity={0.16} />
    <circle cx={10} cy={14} r={44} fill={LIB_COL.bcellDark} opacity={0.9} />
  </G>
);

// Antibodi berbentuk Y.
export const Antibody: React.FC<P & { color?: string }> = ({ color = LIB_COL.antibody, ...p }) => (
  <G {...p}>
    <line x1={0} y1={50} x2={0} y2={0} stroke={color} strokeWidth={16} strokeLinecap="round" />
    <line x1={0} y1={0} x2={-38} y2={-48} stroke={color} strokeWidth={16} strokeLinecap="round" />
    <line x1={0} y1={0} x2={38} y2={-48} stroke={color} strokeWidth={16} strokeLinecap="round" />
    <circle cx={-38} cy={-48} r={11} fill={color} />
    <circle cx={38} cy={-48} r={11} fill={color} />
  </G>
);

// RNA: untai tunggal bergelombang bermanik. len = panjang.
export const RNAStrand: React.FC<P & { len?: number; color?: string; amp?: number; phase?: number }> = ({ len = 300, color = LIB_COL.rna, amp = 22, phase = 0, ...p }) => {
  const n = 48;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const x = -len / 2 + (i / n) * len;
    const y = Math.sin((i / n) * Math.PI * 6 + phase) * amp;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <G {...p}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      {Array.from({ length: 9 }, (_, i) => {
        const t = (i + 0.5) / 9;
        return <circle key={i} cx={-len / 2 + t * len} cy={Math.sin(t * Math.PI * 6 + phase) * amp} r={9} fill="#FFE3DA" />;
      })}
    </G>
  );
};

// DNA: heliks ganda dengan anak tangga. len = panjang.
export const DNAHelix: React.FC<P & { len?: number; colorA?: string; colorB?: string }> = ({ len = 300, colorA = LIB_COL.dnaA, colorB = LIB_COL.dnaB, ...p }) => {
  const n = 48;
  const amp = 36;
  const mk = (ph: number) =>
    Array.from({ length: n + 1 }, (_, i) => `${(-len / 2 + (i / n) * len).toFixed(1)},${(Math.sin((i / n) * Math.PI * 6 + ph) * amp).toFixed(1)}`).join(' ');
  return (
    <G {...p}>
      {Array.from({ length: 13 }, (_, i) => {
        const t = (i + 0.5) / 13;
        const a = Math.sin(t * Math.PI * 6) * amp;
        const b = Math.sin(t * Math.PI * 6 + Math.PI) * amp;
        return <line key={i} x1={-len / 2 + t * len} y1={a} x2={-len / 2 + t * len} y2={b} stroke="#fff" strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" />;
      })}
      <polyline points={mk(0)} fill="none" stroke={colorA} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={mk(Math.PI)} fill="none" stroke={colorB} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
    </G>
  );
};

// Enzim: kind 'rt' (reverse transcriptase), 'integrase', 'protease'. Tiap enzim punya siluet sendiri dengan takik tempat bekerja.
export const Enzyme: React.FC<P & { kind: 'rt' | 'integrase' | 'protease' }> = ({ kind, ...p }) => (
  <G {...p}>
    {kind === 'rt' && (
      <>
        <path d="M -80 -10 C -80 -70 -10 -90 40 -60 C 90 -30 90 40 40 70 C -10 95 -80 60 -80 -10 Z" fill={LIB_COL.rt} />
        <path d="M 30 -20 L 95 -20 L 95 20 L 30 20 Z" fill="#173A5E" opacity={0.0} />
        <path d="M 10 -10 C 40 -10 60 0 80 -2 L 80 24 C 55 26 35 20 10 18 Z" fill="#0A1F3D" opacity={0.28} />
        <circle cx={-34} cy={-34} r={20} fill="#fff" opacity={0.18} />
      </>
    )}
    {kind === 'integrase' && (
      <>
        <polygon points="-70,-40 0,-82 70,-40 70,40 0,82 -70,40" fill={LIB_COL.integrase} />
        <rect x={-26} y={-12} width={96} height={24} rx={12} fill="#0A1F3D" opacity={0.28} />
        <circle cx={-34} cy={-40} r={18} fill="#fff" opacity={0.2} />
      </>
    )}
    {kind === 'protease' && (
      <>
        <path d="M 0 0 L 78 -34 A 86 86 0 1 0 78 34 Z" fill={LIB_COL.protease} />
        <circle cx={-26} cy={-34} r={20} fill="#fff" opacity={0.22} />
        <circle cx={-14} cy={10} r={22} fill="#0A1F3D" opacity={0.18} />
      </>
    )}
  </G>
);

// Membran sel: pita lengkung dengan kepala lipid; receptors = posisi x tonjolan di atas membran.
// kind 'cd4' = batang kuning (seperti FlatCell), 'ccr5' = batang teal berujung bulat besar, 'cxcr4' = batang ungu berujung belah ketupat.
export const Membrane: React.FC<P & { w?: number; receptors?: { x: number; kind: 'cd4' | 'ccr5' | 'cxcr4' }[]; color?: string }> = ({ w = 700, receptors = [], color = SHAPE_COL.cd4, ...p }) => {
  const n = Math.floor(w / 34);
  return (
    <G {...p}>
      {receptors.map((r, i) => {
        const col = r.kind === 'cd4' ? SHAPE_COL.receptor : r.kind === 'ccr5' ? LIB_COL.good : LIB_COL.bcell;
        const knob = r.kind === 'cd4' ? SHAPE_COL.receptorKnob : r.kind === 'ccr5' ? '#D6FBF4' : '#E9D8FF';
        return (
          <g key={i} transform={`translate(${r.x} 0)`}>
            <line x1={0} y1={-12} x2={0} y2={-84} stroke={col} strokeWidth={12} strokeLinecap="round" />
            {r.kind === 'cxcr4' ? <polygon points="0,-118 18,-94 0,-70 -18,-94" fill={knob} /> : <circle cx={0} cy={-92} r={r.kind === 'ccr5' ? 20 : 14} fill={knob} />}
          </g>
        );
      })}
      <rect x={-w / 2} y={-22} width={w} height={44} rx={22} fill={color} opacity={0.35} />
      {Array.from({ length: n }, (_, i) => {
        const x = -w / 2 + 17 + i * 34;
        return (
          <g key={i}>
            <circle cx={x} cy={-12} r={13} fill={color} />
            <circle cx={x} cy={12} r={13} fill={color} />
          </g>
        );
      })}
    </G>
  );
};

// ================= OBAT =================

// Kapsul dua warna (teal + putih). Putar dengan rot.
export const Capsule: React.FC<P & { colorA?: string; colorB?: string }> = ({ colorA = LIB_COL.good, colorB = LIB_COL.light, ...p }) => (
  <G {...p}>
    <path d="M 0 -45 H -60 A 45 45 0 0 0 -60 45 H 0 Z" fill={colorA} />
    <path d="M 0 -45 H 60 A 45 45 0 0 1 60 45 H 0 Z" fill={colorB} />
    <rect x={-95} y={-28} width={92} height={14} rx={7} fill="#fff" opacity={0.38} />
  </G>
);

// Tablet lonjong: persegi panjang bersudut membulat (mirip kapsul tapi tablet, BUKAN bulat), dengan garis belah.
export const Tablet: React.FC<P & { color?: string }> = ({ color = LIB_COL.light, ...p }) => (
  <G {...p}>
    <rect x={-72} y={-40} width={144} height={80} rx={26} fill={color} />
    <rect x={-56} y={-28} width={52} height={14} rx={7} fill="#fff" opacity={0.4} />
    <rect x={-3} y={-40} width={6} height={80} fill={LIB_COL.ink} opacity={0.2} />
  </G>
);

// Strip obat (blister) 2x3. taken = jumlah sumur yang sudah kosong (dari kiri atas). Tablet lonjong bersudut membulat (bukan bulat).
export const Blister: React.FC<P & { taken?: number }> = ({ taken = 0, ...p }) => (
  <G {...p}>
    <rect x={-140} y={-92} width={280} height={184} rx={26} fill={LIB_COL.track} />
    {Array.from({ length: 6 }, (_, i) => {
      const x = -84 + (i % 3) * 84;
      const y = -42 + Math.floor(i / 3) * 84;
      const empty = i < taken;
      return (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x={-38} y={-27} width={76} height={54} rx={18} fill={empty ? '#8FA7BF' : '#DDEBFF'} />
          {!empty && (
            <>
              <rect x={-29} y={-17} width={58} height={34} rx={12} fill={LIB_COL.good} />
              <rect x={-22} y={-12} width={26} height={7} rx={3.5} fill="#fff" opacity={0.45} />
              <rect x={-1.5} y={-17} width={3} height={34} fill={LIB_COL.ink} opacity={0.18} />
            </>
          )}
        </g>
      );
    })}
  </G>
);

// Botol obat dengan tutup dan label.
export const PillBottle: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-60} y={-92} width={120} height={34} rx={12} fill={LIB_COL.goodDark} />
    <rect x={-70} y={-62} width={140} height={150} rx={24} fill={LIB_COL.good} />
    <rect x={-52} y={-18} width={104} height={64} rx={12} fill={LIB_COL.light} />
    <rect x={-34} y={-2} width={68} height={10} rx={5} fill={LIB_COL.ink} opacity={0.3} />
    <rect x={-34} y={18} width={44} height={10} rx={5} fill={LIB_COL.ink} opacity={0.2} />
    <rect x={-58} y={-56} width={18} height={130} rx={9} fill="#fff" opacity={0.25} />
  </G>
);

// Jarum suntik (horizontal, jarum ke kanan). fill 0..1 = isi cairan.
export const Syringe: React.FC<P & { fill?: number }> = ({ fill = 0.7, ...p }) => (
  <G {...p}>
    <rect x={-150} y={-8} width={40} height={16} rx={8} fill={LIB_COL.track} />
    <rect x={-110} y={-30} width={20} height={60} rx={8} fill={LIB_COL.track} />
    <rect x={-96} y={-26} width={150} height={52} rx={14} fill={LIB_COL.glass} />
    <rect x={-92} y={-22} width={150 * fill - 8} height={44} rx={11} fill={LIB_COL.good} />
    <rect x={54} y={-34} width={16} height={68} rx={8} fill={LIB_COL.track} />
    <rect x={70} y={-5} width={80} height={10} rx={5} fill="#C9D6E3" />
    <rect x={-80} y={-20} width={100} height={8} rx={4} fill="#fff" opacity={0.4} />
  </G>
);

// ================= DATA =================

// Grafik garis di dalam kartu. points = nilai 0..1 (kiri ke kanan), threshold = garis ambang 0..1, progress = 0..1 bagian garis yang tergambar.
export const LineChart: React.FC<P & { w?: number; h?: number; points: number[]; threshold?: number; progress?: number; color?: string; smooth?: boolean }> = ({
  w = 520,
  h = 320,
  points,
  threshold,
  progress = 1,
  color = LIB_COL.good,
  smooth = false,
  ...p
}) => {
  const padX = 44;
  const padY = 40;
  const iw = w - padX * 2;
  const ih = h - padY * 2;
  const xy = points.map((v, i) => [-w / 2 + padX + (i / (points.length - 1)) * iw, h / 2 - padY - v * ih] as const);
  const total = xy.length - 1;
  const upto = progress * total;
  const shown: (readonly [number, number])[] = [];
  for (let i = 0; i <= total; i++) {
    if (i <= upto) shown.push(xy[i]);
    else if (i - 1 < upto) {
      const f = upto - (i - 1);
      shown.push([xy[i - 1][0] + (xy[i][0] - xy[i - 1][0]) * f, xy[i - 1][1] + (xy[i][1] - xy[i - 1][1]) * f] as const);
    }
  }
  // smooth: kurva mulus (interpolasi kubik monoton, tanpa tikungan tajam), dipotong sesuai progress
  let curve = shown;
  if (smooth && xy.length > 2) {
    const n = xy.length;
    const dx = xy.slice(1).map((q, i) => q[0] - xy[i][0]);
    const sl = xy.slice(1).map((q, i) => (q[1] - xy[i][1]) / dx[i]);
    const m = xy.map((_, i) => (i === 0 ? sl[0] : i === n - 1 ? sl[n - 2] : sl[i - 1] * sl[i] <= 0 ? 0 : (sl[i - 1] + sl[i]) / 2));
    for (let i = 0; i < n - 1; i++) {
      if (sl[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / sl[i], b = m[i + 1] / sl[i], r = a * a + b * b;
      if (r > 9) { const t = 3 / Math.sqrt(r); m[i] = t * a * sl[i]; m[i + 1] = t * b * sl[i]; }
    }
    const dense: (readonly [number, number])[] = [];
    const steps = 14;
    for (let i = 0; i < n - 1; i++) {
      for (let k = 0; k < steps; k++) {
        const f = k / steps;
        if (i + f > upto) break;
        const h = dx[i], t2 = f * f, t3 = t2 * f;
        const y = (2 * t3 - 3 * t2 + 1) * xy[i][1] + (t3 - 2 * t2 + f) * h * m[i] + (-2 * t3 + 3 * t2) * xy[i + 1][1] + (t3 - t2) * h * m[i + 1];
        dense.push([xy[i][0] + f * h, y] as const);
      }
    }
    if (upto >= total) dense.push(xy[n - 1]);
    else {
      const i = Math.min(n - 2, Math.floor(upto)), f = upto - i, h = dx[i], t2 = f * f, t3 = t2 * f;
      dense.push([xy[i][0] + f * h, (2 * t3 - 3 * t2 + 1) * xy[i][1] + (t3 - 2 * t2 + f) * h * m[i] + (-2 * t3 + 3 * t2) * xy[i + 1][1] + (t3 - t2) * h * m[i + 1]] as const);
    }
    curve = dense;
  }
  const last = curve[curve.length - 1];
  return (
    <G {...p}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={36} fill="#fff" fillOpacity={0.12} />
      <line x1={-w / 2 + padX} y1={h / 2 - padY} x2={w / 2 - padX} y2={h / 2 - padY} stroke="#fff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
      <line x1={-w / 2 + padX} y1={-h / 2 + padY} x2={-w / 2 + padX} y2={h / 2 - padY} stroke="#fff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
      {threshold !== undefined && (
        <line x1={-w / 2 + padX} y1={h / 2 - padY - threshold * ih} x2={w / 2 - padX} y2={h / 2 - padY - threshold * ih} stroke={LIB_COL.bad} strokeOpacity={0.8} strokeWidth={5} strokeDasharray="14 12" strokeLinecap="round" />
      )}
      {curve.length > 1 && <polyline points={curve.map((q) => q.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />}
      {last && <circle cx={last[0]} cy={last[1]} r={13} fill={color} />}
    </G>
  );
};

// Bar persentase (mis. 95-95-95). items: label, pct 0..100, color.
export const PercentBars: React.FC<P & { w?: number; items: { label: string; pct: number; color?: string }[] }> = ({ w = 640, items, ...p }) => (
  <G {...p}>
    {items.map((it, i) => {
      const y = i * 96 - ((items.length - 1) * 96) / 2;
      const tw = w - 340;
      return (
        <g key={i} transform={`translate(0 ${y})`}>
          <text x={-w / 2} y={10} fontFamily={FONT} fontSize={32} fontWeight={600} fill={LIB_COL.light}>
            {it.label}
          </text>
          <rect x={-w / 2 + 210} y={-16} width={tw} height={32} rx={16} fill="#fff" fillOpacity={0.14} />
          <rect x={-w / 2 + 210} y={-16} width={Math.max(32, (tw * it.pct) / 100)} height={32} rx={16} fill={it.color ?? LIB_COL.good} />
          <text x={w / 2} y={10} textAnchor="end" fontFamily={FONT} fontSize={32} fontWeight={800} fill="#fff">
            {it.pct}%
          </text>
        </g>
      );
    })}
  </G>
);

// Jam dengan busur kemajuan. hour 0..12 menentukan jarum pendek, frac 0..1 = busur terisi (mis. 72 jam).
export const Clock: React.FC<P & { frac?: number; hour?: number }> = ({ frac = 0.5, hour = 3, ...p }) => {
  const R = 100;
  const a = -Math.PI / 2;
  const e = a + frac * Math.PI * 2;
  const large = frac > 0.5 ? 1 : 0;
  const ha = (hour / 12) * Math.PI * 2 - Math.PI / 2;
  return (
    <G {...p}>
      <circle r={R} fill={LIB_COL.light} />
      <circle r={R - 16} fill="#fff" fillOpacity={0.0} />
      {frac > 0 && frac < 1 && (
        <path d={`M 0 0 L ${(Math.cos(a) * (R - 10)).toFixed(1)} ${(Math.sin(a) * (R - 10)).toFixed(1)} A ${R - 10} ${R - 10} 0 ${large} 1 ${(Math.cos(e) * (R - 10)).toFixed(1)} ${(Math.sin(e) * (R - 10)).toFixed(1)} Z`} fill={LIB_COL.bad} opacity={0.35} />
      )}
      {Array.from({ length: 12 }, (_, i) => {
        const t = (i / 12) * Math.PI * 2;
        return <line key={i} x1={Math.cos(t) * 78} y1={Math.sin(t) * 78} x2={Math.cos(t) * 90} y2={Math.sin(t) * 90} stroke={LIB_COL.ink} strokeOpacity={0.5} strokeWidth={6} strokeLinecap="round" />;
      })}
      <line x1={0} y1={0} x2={Math.cos(ha) * 46} y2={Math.sin(ha) * 46} stroke={LIB_COL.ink} strokeWidth={10} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={-70} stroke={LIB_COL.ink} strokeWidth={7} strokeLinecap="round" />
      <circle r={9} fill={LIB_COL.ink} />
    </G>
  );
};

// Kalender: kepala + grid 7x5. marks = indeks hari (0..34) yang disorot; markColor warna sorotan.
export const Calendar: React.FC<P & { marks?: number[]; markColor?: string }> = ({ marks = [], markColor = LIB_COL.bad, ...p }) => (
  <G {...p}>
    <rect x={-130} y={-110} width={260} height={220} rx={26} fill={LIB_COL.light} />
    <path d="M -130 -84 A 26 26 0 0 1 -104 -110 H 104 A 26 26 0 0 1 130 -84 V -56 H -130 Z" fill={LIB_COL.bad} />
    <rect x={-80} y={-126} width={14} height={34} rx={7} fill={LIB_COL.ink} />
    <rect x={66} y={-126} width={14} height={34} rx={7} fill={LIB_COL.ink} />
    {Array.from({ length: 35 }, (_, i) => {
      const x = -96 + (i % 7) * 32;
      const y = -34 + Math.floor(i / 7) * 30;
      const on = marks.includes(i);
      return <circle key={i} cx={x} cy={y} r={on ? 11 : 6} fill={on ? markColor : LIB_COL.track} />;
    })}
  </G>
);

// ================= TES =================

// Tetes darah.
export const BloodDrop: React.FC<P> = (p) => (
  <G {...p}>
    <path d="M 0 -90 C 40 -34 64 -6 64 30 A 64 64 0 0 1 -64 30 C -64 -6 -40 -34 0 -90 Z" fill={LIB_COL.blood} />
    <ellipse cx={-26} cy={26} rx={12} ry={22} fill="#fff" opacity={0.28} transform="rotate(20 -26 26)" />
  </G>
);

// Tabung sampel darah. level 0..1.
export const BloodTube: React.FC<P & { level?: number }> = ({ level = 0.65, ...p }) => (
  <G {...p}>
    <rect x={-34} y={-130} width={68} height={250} rx={34} fill={LIB_COL.glass} />
    <rect x={-34} y={120 - 224 * level} width={68} height={224 * level + 6} rx={30} fill={LIB_COL.blood} />
    <rect x={-42} y={-146} width={84} height={44} rx={12} fill={LIB_COL.goodDark} />
    <rect x={-22} y={-118} width={10} height={170} rx={5} fill="#fff" opacity={0.45} />
  </G>
);

// Alat tes cepat (kaset). lines = 0 (tidak valid), 1 (non-reaktif: hanya garis kontrol), 2 (reaktif: kontrol + tes).
export const TestKit: React.FC<P & { lines?: 0 | 1 | 2 }> = ({ lines = 1, ...p }) => (
  <G {...p}>
    <rect x={-70} y={-160} width={140} height={320} rx={30} fill={LIB_COL.light} />
    <rect x={-40} y={-130} width={80} height={130} rx={18} fill={LIB_COL.glass} />
    {lines >= 1 && <rect x={-30} y={-96} width={60} height={9} rx={4.5} fill={LIB_COL.bad} />}
    {lines >= 2 && <rect x={-30} y={-52} width={60} height={9} rx={4.5} fill={LIB_COL.bad} />}
    <circle cx={0} cy={56} r={28} fill={LIB_COL.track} />
    <circle cx={0} cy={56} r={14} fill={LIB_COL.ink} opacity={0.35} />
    <rect x={-40} y={110} width={80} height={10} rx={5} fill={LIB_COL.ink} opacity={0.2} />
  </G>
);

// Lencana benar (centang teal) dan salah (silang koral), untuk mitos vs fakta.
export const CheckBadge: React.FC<P> = (p) => (
  <G {...p}>
    <circle r={70} fill={LIB_COL.good} />
    <polyline points="-32,2 -8,28 36,-24" fill="none" stroke={LIB_COL.ink} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
  </G>
);
export const CrossBadge: React.FC<P> = (p) => (
  <G {...p}>
    <circle r={70} fill={LIB_COL.bad} />
    <line x1={-28} y1={-28} x2={28} y2={28} stroke="#fff" strokeWidth={16} strokeLinecap="round" />
    <line x1={28} y1={-28} x2={-28} y2={28} stroke="#fff" strokeWidth={16} strokeLinecap="round" />
  </G>
);

// ================= ANALOGI =================

// Kereta: lokomotif + n gerbong. wagonColor mis. warna virus (koral) atau ARV (teal). Menghadap kanan.
export const Train: React.FC<P & { wagons?: number; wagonColor?: string }> = ({ wagons = 2, wagonColor = SHAPE_COL.virion, ...p }) => {
  const total = 190 + wagons * 150;
  const x0 = -total / 2;
  return (
    <G {...p}>
      {Array.from({ length: wagons }, (_, i) => (
        <g key={i} transform={`translate(${x0 + i * 150} 0)`}>
          <rect x={0} y={-60} width={136} height={96} rx={20} fill={wagonColor} />
          <rect x={14} y={-46} width={108} height={22} rx={11} fill="#fff" opacity={0.25} />
          <circle cx={34} cy={44} r={20} fill={LIB_COL.ink} />
          <circle cx={102} cy={44} r={20} fill={LIB_COL.ink} />
          <rect x={136} y={-4} width={14} height={10} rx={5} fill={LIB_COL.track} />
        </g>
      ))}
      <g transform={`translate(${x0 + wagons * 150} 0)`}>
        <rect x={0} y={-30} width={190} height={66} rx={18} fill={SHAPE_COL.cd4} />
        <rect x={0} y={-76} width={84} height={74} rx={16} fill={SHAPE_COL.cd4Dark} />
        <rect x={16} y={-62} width={52} height={32} rx={10} fill={LIB_COL.glass} />
        <rect x={150} y={-62} width={22} height={40} rx={8} fill={LIB_COL.track} />
        <circle cx={40} cy={44} r={20} fill={LIB_COL.ink} />
        <circle cx={140} cy={44} r={20} fill={LIB_COL.ink} />
      </g>
    </G>
  );
};

// Stasiun: tiang jalur bundar bernomor. state 'open' (netral), 'blocked' (ditutup ARV, teal), 'virus' (dilalui virus, koral).
export const Station: React.FC<P & { label?: string; state?: 'open' | 'blocked' | 'virus' }> = ({ label, state = 'open', ...p }) => {
  const col = state === 'blocked' ? LIB_COL.good : state === 'virus' ? LIB_COL.bad : '#fff';
  return (
    <G {...p}>
      <circle r={46} fill={col} fillOpacity={state === 'open' ? 0.9 : 1} />
      <circle r={17} fill={state === 'open' ? '#B9C3D0' : LIB_COL.ink} fillOpacity={state === 'open' ? 1 : 0.55} />
      {label && (
        <text y={86} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={LIB_COL.light}>
          {label}
        </text>
      )}
    </G>
  );
};

// Tanggul: dinding biru dengan air; level 0..1 (tinggi air obat). Dipakai untuk analogi kadar obat.
export const Dam: React.FC<P & { level?: number }> = ({ level = 0.7, ...p }) => (
  <G {...p}>
    <rect x={-140} y={-130} width={280} height={260} rx={22} fill="#fff" fillOpacity={0.10} />
    <rect x={-140} y={130 - 260 * level} width={280} height={260 * level} rx={22} fill={LIB_COL.good} fillOpacity={0.85} />
    <rect x={-170} y={-150} width={50} height={300} rx={18} fill={SHAPE_COL.cd4} />
    <rect x={120} y={-150} width={50} height={300} rx={18} fill={SHAPE_COL.cd4} />
    <rect x={-160} y={-140} width={14} height={240} rx={7} fill="#fff" opacity={0.2} />
  </G>
);

// Baterai: level 0..1.
export const Battery: React.FC<P & { level?: number }> = ({ level = 0.6, ...p }) => (
  <G {...p}>
    <rect x={-130} y={-70} width={250} height={140} rx={28} fill={LIB_COL.light} />
    <rect x={116} y={-24} width={26} height={48} rx={10} fill={LIB_COL.light} />
    <rect x={-112} y={-52} width={Math.max(20, 214 * level)} height={104} rx={18} fill={level < 0.3 ? LIB_COL.bad : LIB_COL.good} />
  </G>
);

// Kota (siluet gedung datar). lit = jumlah gedung yang jendelanya menyala (0..6).
export const City: React.FC<P & { lit?: number }> = ({ lit = 6, ...p }) => {
  const b = [
    { x: -210, w: 70, h: 120 },
    { x: -130, w: 80, h: 200 },
    { x: -40, w: 70, h: 150 },
    { x: 40, w: 90, h: 240 },
    { x: 140, w: 70, h: 130 },
    { x: 220, w: 70, h: 170 },
  ];
  return (
    <G {...p}>
      {b.map((q, i) => (
        <g key={i}>
          <rect x={q.x} y={100 - q.h} width={q.w} height={q.h} rx={12} fill={SHAPE_COL.cd4Dark} />
          {Array.from({ length: Math.floor(q.h / 46) }, (_, j) => (
            <rect key={j} x={q.x + q.w / 2 - 12} y={100 - q.h + 18 + j * 46} width={24} height={20} rx={6} fill={i < lit ? SHAPE_COL.receptor : '#1B2E52'} />
          ))}
        </g>
      ))}
      <rect x={-230} y={100} width={540} height={14} rx={7} fill="#fff" opacity={0.18} />
    </G>
  );
};

// Perisai teal (pelindung: ARV, PrEP, PEP).
export const Shield: React.FC<P & { color?: string }> = ({ color = LIB_COL.good, ...p }) => (
  <G {...p}>
    <path d="M 0 -110 C 40 -86 80 -80 100 -80 C 100 10 70 80 0 118 C -70 80 -100 10 -100 -80 C -80 -80 -40 -86 0 -110 Z" fill={color} />
    <path d="M 0 -110 C -40 -86 -80 -80 -100 -80 C -100 10 -70 80 0 118 Z" fill="#fff" opacity={0.18} />
    <polyline points="-34,0 -8,28 38,-28" fill="none" stroke={LIB_COL.ink} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
  </G>
);

// ================= PRIORITAS 2: MANUSIA, TEMPAT, KOMUNIKASI =================

const PERSON_COLS = ['#8FBDF7', '#B9A2F5', '#F4D77E', '#7ED6A8', '#FF9C85'];

// Orang polos (tanpa topi/wajah). Beda dengan Figure (tentara). tall 0..1 untuk anak (0.7) vs dewasa (1).
export const Person: React.FC<P & { color?: string; kid?: boolean }> = ({ color = PERSON_COLS[0], kid = false, ...p }) => (
  <G {...p} s={(p.s ?? 1) * (kid ? 0.7 : 1)}>
    <path d="M -70 90 Q -70 -10 0 -10 Q 70 -10 70 90 Z" fill={color} />
    <circle cx={0} cy={-60} r={34} fill={color} />
    <circle cx={-12} cy={-68} r={11} fill="#fff" opacity={0.18} />
  </G>
);

// Kelompok/komunitas: n orang berwarna-warni, jarak rapat.
export const Group: React.FC<P & { n?: number }> = ({ n = 3, ...p }) => (
  <G {...p}>
    {Array.from({ length: n }, (_, i) => (
      <Person key={i} cx={(i - (n - 1) / 2) * 120} cy={i % 2 ? 14 : 0} s={i % 2 ? 0.9 : 1} color={PERSON_COLS[i % PERSON_COLS.length]} />
    ))}
  </G>
);

// Hati. Warna default koral.
export const Heart: React.FC<P & { color?: string }> = ({ color = LIB_COL.bad, ...p }) => (
  <G {...p}>
    <path d="M 0 70 C -110 -2 -86 -76 -40 -76 C -14 -76 0 -56 0 -42 C 0 -56 14 -76 40 -76 C 86 -76 110 -2 0 70 Z" fill={color} />
    <ellipse cx={-48} cy={-40} rx={14} ry={20} fill="#fff" opacity={0.25} transform="rotate(30 -48 -40)" />
  </G>
);

// Pelukan/dukungan: dua orang berdekatan dengan hati di antara/atas.
export const Hug: React.FC<P> = (p) => (
  <G {...p}>
    <Person cx={-46} cy={20} color={PERSON_COLS[0]} s={1.05} />
    <Person cx={46} cy={20} color={PERSON_COLS[2]} s={1.05} />
    <Heart cx={0} cy={-100} s={0.45} />
  </G>
);

// Ibu dan bayi (konteks penularan ibu ke anak dan pencegahannya).
export const MotherBaby: React.FC<P> = (p) => (
  <G {...p}>
    <Person cx={-30} cy={0} color={PERSON_COLS[1]} s={1.1} />
    <circle cx={56} cy={34} r={30} fill={PERSON_COLS[4]} />
    <path d="M 22 100 Q 22 56 56 56 Q 90 56 90 100 Z" fill={PERSON_COLS[4]} />
    <circle cx={46} cy={26} r={9} fill="#fff" opacity={0.2} />
  </G>
);

// Rumah.
export const Home: React.FC<P> = (p) => (
  <G {...p}>
    <polygon points="-130,-10 0,-120 130,-10" fill={LIB_COL.bad} />
    <rect x={-100} y={-12} width={200} height={130} rx={14} fill={LIB_COL.light} />
    <rect x={-28} y={30} width={56} height={88} rx={12} fill={SHAPE_COL.cd4Dark} />
    <rect x={-84} y={14} width={42} height={40} rx={8} fill={SHAPE_COL.receptor} />
    <rect x={42} y={14} width={42} height={40} rx={8} fill={SHAPE_COL.receptor} />
  </G>
);

// Fasilitas kesehatan (puskesmas/klinik): gedung dengan palang medis.
export const Clinic: React.FC<P> = (p) => (
  <G {...p}>
    <rect x={-150} y={-70} width={300} height={190} rx={22} fill={LIB_COL.light} />
    <rect x={-150} y={-70} width={300} height={34} rx={17} fill={LIB_COL.goodDark} />
    <rect x={-14} y={-26} width={28} height={84} rx={8} fill={LIB_COL.bad} transform="translate(0 0)" />
    <rect x={-42} y={2} width={84} height={28} rx={8} fill={LIB_COL.bad} />
    <rect x={-120} y={20} width={50} height={46} rx={10} fill={LIB_COL.glass} />
    <rect x={70} y={20} width={50} height={46} rx={10} fill={LIB_COL.glass} />
    <rect x={-28} y={72} width={56} height={48} rx={10} fill={SHAPE_COL.cd4Dark} />
  </G>
);

// Gelembung ucap. dots = titik "..." bila tanpa teks; text opsional (pendek). tail 'l' | 'r'.
export const SpeechBubble: React.FC<P & { text?: string; tail?: 'l' | 'r'; color?: string; w?: number }> = ({ text, tail = 'l', color = '#fff', w = 260, ...p }) => (
  <G {...p}>
    <rect x={-w / 2} y={-64} width={w} height={128} rx={44} fill={color} />
    <polygon points={tail === 'l' ? `${-w / 2 + 60},56 ${-w / 2 + 40},112 ${-w / 2 + 110},60` : `${w / 2 - 60},56 ${w / 2 - 40},112 ${w / 2 - 110},60`} fill={color} />
    {text ? (
      <text textAnchor="middle" y={12} fontFamily={FONT} fontSize={40} fontWeight={800} fill={LIB_COL.ink}>
        {text}
      </text>
    ) : (
      [-50, 0, 50].map((x) => <circle key={x} cx={x} cy={0} r={13} fill={LIB_COL.ink} opacity={0.4} />)
    )}
  </G>
);

// Gembok. open = terbuka. Untuk privasi/kerahasiaan.
export const Lock: React.FC<P & { open?: boolean; color?: string }> = ({ open = false, color = LIB_COL.goodDark, ...p }) => (
  <G {...p}>
    <path d={open ? 'M -40 -30 V -62 A 40 40 0 0 1 40 -62 V -50' : 'M -40 -30 V -60 A 40 40 0 0 1 40 -60 V -30'} fill="none" stroke={LIB_COL.track} strokeWidth={18} strokeLinecap="round" />
    <rect x={-70} y={-34} width={140} height={110} rx={24} fill={color} />
    <circle cx={0} cy={14} r={14} fill={LIB_COL.ink} opacity={0.5} />
    <rect x={-5} y={20} width={10} height={26} rx={5} fill={LIB_COL.ink} opacity={0.5} />
    <rect x={-56} y={-24} width={14} height={90} rx={7} fill="#fff" opacity={0.2} />
  </G>
);

// Dokumen/kartu. kind 'paper' = kertas bergaris, 'card' = kartu (mis. kartu BPJS/KIA). stamp = centang.
export const Document: React.FC<P & { kind?: 'paper' | 'card'; stamp?: boolean }> = ({ kind = 'paper', stamp = false, ...p }) => (
  <G {...p}>
    {kind === 'paper' ? (
      <>
        <rect x={-80} y={-110} width={160} height={220} rx={20} fill={LIB_COL.light} />
        {[-70, -44, -18, 8].map((y, i) => (
          <rect key={y} x={-52} y={y} width={i === 0 ? 70 : 104} height={12} rx={6} fill={LIB_COL.track} />
        ))}
      </>
    ) : (
      <>
        <rect x={-130} y={-82} width={260} height={164} rx={26} fill={LIB_COL.light} />
        <circle cx={-72} cy={-14} r={34} fill={SHAPE_COL.cd4} />
        <rect x={-18} y={-40} width={110} height={14} rx={7} fill={LIB_COL.track} />
        <rect x={-18} y={-12} width={80} height={14} rx={7} fill={LIB_COL.track} />
        <rect x={-100} y={44} width={160} height={12} rx={6} fill={LIB_COL.track} />
      </>
    )}
    {stamp && <CheckBadge cx={kind === 'paper' ? 56 : 100} cy={kind === 'paper' ? 84 : 62} s={0.4} />}
  </G>
);

// ---- Tambahan (analogi kendaraan, papan skor, mesin) ----
export const Car: React.FC<P & { color?: string }> = ({ color = LIB_COL.glass, ...p }) => (
  <G {...p}>
    <path d="M -120 22 V -8 Q -120 -22 -104 -24 L -62 -30 L -38 -66 Q -32 -74 -20 -74 H 40 Q 52 -74 58 -66 L 84 -30 L 106 -24 Q 120 -20 120 -6 V 22 Z" fill={color} />
    <path d="M -28 -62 L -50 -32 H 6 V -62 Z" fill={LIB_COL.ink} fillOpacity={0.35} />
    <path d="M 18 -62 V -32 H 72 L 50 -60 Z" fill={LIB_COL.ink} fillOpacity={0.35} />
    <circle cx={-66} cy={24} r={26} fill={LIB_COL.ink} />
    <circle cx={-66} cy={24} r={11} fill={LIB_COL.light} />
    <circle cx={66} cy={24} r={26} fill={LIB_COL.ink} />
    <circle cx={66} cy={24} r={11} fill={LIB_COL.light} />
  </G>
);

export const Scoreboard: React.FC<P & { home?: number; away?: number; pending?: boolean }> = ({ home = 1, away = 0, pending = false, ...p }) => (
  <G {...p}>
    <rect x={-8} y={96} width={16} height={64} fill={LIB_COL.track} />
    <rect x={-72} y={154} width={144} height={16} rx={8} fill={LIB_COL.track} />
    <rect x={-190} y={-100} width={380} height={200} rx={28} fill={LIB_COL.ink} />
    <rect x={-170} y={-80} width={340} height={160} rx={18} fill="#0B2A47" />
    <text x={-84} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={104} fill={LIB_COL.dnaA}>{pending ? '-' : home}</text>
    <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={84} fill={LIB_COL.light}>:</text>
    <text x={84} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={104} fill={LIB_COL.dnaA}>{pending ? '-' : away}</text>
  </G>
);

export const Gear: React.FC<P & { rust?: number }> = ({ rust = 0, ...p }) => (
  <G {...p}>
    {Array.from({ length: 10 }, (_, i) => (
      <rect key={i} x={-16} y={-106} width={32} height={36} rx={8} fill={LIB_COL.track} transform={`rotate(${i * 36})`} />
    ))}
    <circle r={86} fill={LIB_COL.track} />
    <circle r={30} fill="#0F3B66" />
    {rust > 0 &&
      [[-44, -30, 26], [38, -48, 18], [50, 28, 24], [-30, 54, 20]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r * rust} fill="#E39A5B" opacity={0.5 + 0.5 * rust} />
      ))}
  </G>
);

// Perbandingan dua bar tanpa angka: bar B = 2,35x panjang bar A; garis putus-putus penanda "2x" panjang A.
// pa, pb = kemajuan isi bar (0..1); mark = 0..1 opacity penanda 2x.
export const CompareBars: React.FC<P & { w?: number; labelA?: string; labelB?: string; pa?: number; pb?: number; mark?: number }> = ({ w = 760, labelA = 'A', labelB = 'B', pa = 1, pb = 1, mark = 0, ...p }) => {
  const LA = 190;
  const LB = LA * 2.35;
  const x0 = -w / 2;
  return (
    <G {...p}>
      <text x={x0} y={-84} fontFamily={FONT} fontSize={32} fontWeight={600} fill={LIB_COL.light}>{labelA}</text>
      <rect x={x0} y={-62} width={w} height={44} rx={22} fill="#fff" fillOpacity={0.12} />
      <rect x={x0} y={-62} width={Math.max(44, LA * pa)} height={44} rx={22} fill={LIB_COL.good} />
      <text x={x0} y={46} fontFamily={FONT} fontSize={32} fontWeight={600} fill={LIB_COL.light}>{labelB}</text>
      <rect x={x0} y={68} width={w} height={44} rx={22} fill="#fff" fillOpacity={0.12} />
      <rect x={x0} y={68} width={Math.max(44, LB * pb)} height={44} rx={22} fill={LIB_COL.bad} />
      <g opacity={mark}>
        <line x1={x0 + LA * 2} y1={-70} x2={x0 + LA * 2} y2={124} stroke={LIB_COL.dnaA} strokeWidth={5} strokeDasharray="12 10" strokeLinecap="round" />
        <text x={x0 + LA * 2} y={158} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={800} fill={LIB_COL.dnaA}>2x</text>
      </g>
    </G>
  );
};

// Gawang bola (tampak depan) dengan jaring. net 0..1 = kembungnya jaring saat bola masuk. Lebar nominal 360.
export const Goal: React.FC<P & { net?: number }> = ({ net = 0, ...p }) => (
  <G {...p}>
    <rect x={-170} y={-100} width={340} height={200} rx={14} fill={LIB_COL.light} fillOpacity={0.14} />
    {Array.from({ length: 7 }, (_, i) => (
      <line key={`v${i}`} x1={-140 + i * 46.7} y1={-90} x2={-140 + i * 46.7} y2={92} stroke={LIB_COL.light} strokeOpacity={0.28} strokeWidth={4} />
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <line key={`h${i}`} x1={-160} y1={-70 + i * 40} x2={160} y2={-70 + i * 40 + net * 16} stroke={LIB_COL.light} strokeOpacity={0.28} strokeWidth={4} />
    ))}
    <path d="M -170 100 V -100 H 170 V 100" fill="none" stroke={LIB_COL.light} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
  </G>
);

// Bola sepak sederhana (bulat putih dengan bercak segi lima gelap).
export const Ball: React.FC<P> = (p) => (
  <G {...p}>
    <circle r={40} fill="#fff" />
    <polygon points="0,-16 15,-5 9,13 -9,13 -15,-5" fill={LIB_COL.ink} />
    <circle cx={-30} cy={-14} r={8} fill={LIB_COL.ink} />
    <circle cx={30} cy={-14} r={8} fill={LIB_COL.ink} />
    <circle cx={0} cy={34} r={8} fill={LIB_COL.ink} />
  </G>
);

// Jalan datar untuk analogi lalu lintas (mobil = virus). w = lebar, h = tinggi, garis marka putus-putus di tengah.
export const Road: React.FC<P & { w?: number; h?: number }> = ({ w = 1000, h = 300, ...p }) => (
  <G {...p}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={40} fill={LIB_COL.ink} fillOpacity={0.5} />
    <line x1={-w / 2 + 40} y1={0} x2={w / 2 - 40} y2={0} stroke={LIB_COL.light} strokeOpacity={0.55} strokeWidth={8} strokeDasharray="44 34" strokeLinecap="round" />
  </G>
);

// Kaca pembesar. Lensa berpusat di (0,0) radius 100 (isi lensa digambar oleh adegan, dipotong dengan clipPath lingkaran r=100*s); gagang ke kanan bawah.
export const Magnifier: React.FC<P> = (p) => (
  <G {...p}>
    <line x1={72} y1={72} x2={176} y2={176} stroke={LIB_COL.ink} strokeWidth={34} strokeLinecap="round" />
    <line x1={118} y1={118} x2={176} y2={176} stroke={LIB_COL.goodDark} strokeWidth={34} strokeLinecap="round" />
    <circle r={102} fill="none" stroke={LIB_COL.light} strokeWidth={20} />
    <circle r={92} fill={LIB_COL.glass} fillOpacity={0.14} />
    <path d="M -62 -30 A 70 70 0 0 1 -18 -66" fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={12} strokeLinecap="round" />
  </G>
);
