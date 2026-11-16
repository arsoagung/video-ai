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

// ---------- danau (tepi berkelok, air biru) ----------
export const WATER_LAKE = '#4DAEDB';
const lakeF = (a: number) => 1 + 0.13 * Math.sin(2 * a + 0.6) + 0.09 * Math.sin(3 * a + 1.9) + 0.06 * Math.sin(5 * a + 0.3) + 0.035 * Math.sin(7 * a + 2.4);
// titik di dalam danau: sudut a, k = 0..1 (1 = tepi)
export const lakePoint = (cx: number, cy: number, rx: number, ry: number, a: number, k: number) => ({
  x: cx + rx * lakeF(a) * Math.cos(a) * k * 0.76,
  y: cy + ry * lakeF(a) * Math.sin(a) * k * 0.76,
});
const lakePath = (cx: number, cy: number, rx: number, ry: number, k: number) => {
  const N = 48;
  const P = Array.from({ length: N }, (_, i) => lakePoint(cx, cy, rx, ry, (i / N) * Math.PI * 2, k));
  let d = `M${P[0].x.toFixed(1)} ${P[0].y.toFixed(1)}`;
  for (let i = 0; i < N; i++) {
    const p0 = P[(i - 1 + N) % N], p1 = P[i], p2 = P[(i + 1) % N], p3 = P[(i + 2) % N];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d + 'Z';
};
export const Lake: React.FC<{ cx: number; cy: number; rx?: number; ry?: number; op?: number; t?: number; glow?: number }> = ({ cx, cy, rx = 520, ry = 250, op = 1, t = 0, glow = 0 }) => {
  const waves = [-0.35, 0, 0.32].map((f, i) => {
    const y0 = cy + ry * f * 0.7;
    const half = rx * 0.3;
    let d = '';
    for (let k = 0; k <= 30; k++) {
      const xx = cx - half + (2 * half * k) / 30 + (i - 1) * 40;
      const yy = y0 + 6 * Math.sin(k * 0.9 + t * 1.6 + i * 1.7);
      d += (k ? 'L' : 'M') + xx.toFixed(1) + ' ' + yy.toFixed(1) + ' ';
    }
    return <path key={i} d={d} stroke="#FFFFFF" strokeOpacity={0.3} strokeWidth={6} fill="none" strokeLinecap="round" />;
  });
  return (
    <g opacity={op}>
      <path d={lakePath(cx, cy, rx, ry, 1.1)} fill="#EAF2FB" opacity={0.12} />
      <path d={lakePath(cx, cy, rx, ry, 1)} fill={WATER_LAKE} />
      <path d={lakePath(cx, cy, rx, ry, 0.72)} fill="#7CCBF0" opacity={0.3} />
      {waves}
      {glow > 0.01 && <path d={lakePath(cx, cy, rx, ry, 1)} fill="#FFFFFF" opacity={0.4 * glow} />}
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
