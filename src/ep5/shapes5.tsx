import React from 'react';
import { COL } from '../ep3/shapes';

// pseudo-acak deterministik (sama di setiap frame)
export const rnd = (i: number, s = 0) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const BLOOD = '#E4566B';
export const PLASMA = '#F6E7B4';
export const WATER_CLEAR = '#6FD0E6';
export const WATER_MURKY = '#9AA58A';

// ---------- tabung darah ----------
// sep: 0 = darah tercampur, 1 = plasma (kuning bening) terpisah di atas
export const Tube: React.FC<{ x: number; y: number; s?: number; sep?: number; rot?: number; op?: number }> = ({ x, y, s = 1, sep = 0, rot = 0, op = 1 }) => {
  const W = 120, H = 380, top = -H / 2, bot = H / 2;
  const plasmaH = (H - 60) * 0.55 * sep;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      <path d={`M${-W / 2} ${top + 36} L${-W / 2} ${bot - W / 2} A${W / 2} ${W / 2} 0 0 0 ${W / 2} ${bot - W / 2} L${W / 2} ${top + 36} Z`} fill="#EAF2FB" opacity={0.2} />
      <clipPath id="tubeClip">
        <path d={`M${-W / 2 + 8} ${top + 36} L${-W / 2 + 8} ${bot - W / 2} A${W / 2 - 8} ${W / 2 - 8} 0 0 0 ${W / 2 - 8} ${bot - W / 2} L${W / 2 - 8} ${top + 36} Z`} />
      </clipPath>
      <g clipPath="url(#tubeClip)">
        <rect x={-W / 2} y={top + 70} width={W} height={H} fill={BLOOD} />
        {plasmaH > 1 && <rect x={-W / 2} y={top + 70} width={W} height={plasmaH} fill={PLASMA} />}
        <rect x={-W / 2 + 14} y={top + 70} width={14} height={H} fill="#FFFFFF" opacity={0.22} />
      </g>
      <rect x={-W / 2 - 8} y={top} width={W + 16} height={44} rx={14} fill="#EAF2FB" />
      <rect x={-W / 2 + 6} y={top + 8} width={W - 12} height={10} rx={5} fill="#FFFFFF" opacity={0.45} />
    </g>
  );
};

// ---------- gelas ----------
export const GLASS_W_TOP = 190, GLASS_W_BOT = 140, GLASS_H = 230;
export const Glass: React.FC<{ x: number; y: number; s?: number; level?: number; water?: string; op?: number; children?: React.ReactNode }> = ({
  x, y, s = 1, level = 0.8, water = WATER_CLEAR, op = 1, children,
}) => {
  const top = -GLASS_H / 2, bot = GLASS_H / 2;
  const wt = GLASS_W_TOP / 2, wb = GLASS_W_BOT / 2;
  const ly = bot - GLASS_H * level;
  const wl = wb + (wt - wb) * level;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <path d={`M${-wt} ${top} L${-wb} ${bot} Q0 ${bot + 14} ${wb} ${bot} L${wt} ${top} Z`} fill="#EAF2FB" opacity={0.28} />
      {level > 0.01 && (
        <path d={`M${-wl} ${ly} L${-wb} ${bot} Q0 ${bot + 14} ${wb} ${bot} L${wl} ${ly} Z`} fill={water} opacity={0.92} />
      )}
      {children}
      <path d={`M${-wt + 16} ${top + 14} L${-wb + 10} ${bot - 22}`} stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={9} strokeLinecap="round" fill="none" />
    </g>
  );
};

// ---------- danau ----------
export const Lake: React.FC<{ cx: number; cy: number; rx?: number; ry?: number; murk?: number; op?: number; t?: number }> = ({ cx, cy, rx = 430, ry = 200, murk = 1, op = 1, t = 0 }) => {
  const mix = (a: string, b: string, k: number) => {
    const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
  };
  const c = mix(WATER_CLEAR, WATER_MURKY, murk);
  const waves = [-0.45, -0.1, 0.25].map((f, i) => {
    const y0 = cy + ry * f;
    const half = rx * Math.sqrt(Math.max(0, 1 - f * f)) * 0.82;
    let d = '';
    for (let k = 0; k <= 40; k++) {
      const xx = cx - half + (2 * half * k) / 40;
      const yy = y0 + 7 * Math.sin(k * 0.9 + t * 1.6 + i * 1.7);
      d += (k ? 'L' : 'M') + xx.toFixed(1) + ' ' + yy.toFixed(1) + ' ';
    }
    return <path key={i} d={d} stroke="#FFFFFF" strokeOpacity={0.28} strokeWidth={6} fill="none" strokeLinecap="round" />;
  });
  return (
    <g opacity={op}>
      <ellipse cx={cx} cy={cy} rx={rx + 26} ry={ry + 22} fill="#EAF2FB" opacity={0.1} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={c} />
      {waves}
    </g>
  );
};

// ---------- titik virus kecil ----------
export const VDot: React.FC<{ x: number; y: number; r?: number; op?: number; c?: string }> = ({ x, y, r = 8, op = 1, c = COL.virus }) => (
  <g opacity={op}>
    <circle cx={x} cy={y} r={r} fill={c} />
    <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.32} fill="#FFFFFF" opacity={0.45} />
  </g>
);

// ---------- ikon orang sederhana ----------
export const Person: React.FC<{ x: number; y: number; r?: number; op?: number; c?: string }> = ({ x, y, r = 11, op = 1, c = '#CFE0F2' }) => (
  <g opacity={op}>
    <circle cx={x} cy={y - r * 0.9} r={r * 0.62} fill={c} />
    <path d={`M${x - r} ${y + r * 1.25} Q${x - r} ${y} ${x} ${y} Q${x + r} ${y} ${x + r} ${y + r * 1.25} Z`} fill={c} />
  </g>
);
