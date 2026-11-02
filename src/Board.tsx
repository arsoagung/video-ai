import React from 'react';
import { useCurrentFrame, Easing, interpolate } from 'remotion';
import { getLength, getPointAtLength } from '@remotion/paths';

export const FPS = 30;
export const INK = '#1E2A3A';
export const PAPER = '#F8F5EE';
export const RED = '#E4573D';
export const ORANGE = '#F0A03A';
export const BLUE = '#3B7DD8';
export const TEAL = '#16837A';
export const GRAY = '#9AA5B1';
export const FONT = "'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif";

export type Stroke = {
  k: 's';
  d: string;
  color: string;
  w: number;
  t0: number;
  dur: number;
  fill?: { d?: string; color: string; op: number };
  erase?: number;
  dashed?: boolean;
};
export type Text = {
  k: 't';
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  weight?: number;
  t0: number;
  dur: number;
  erase?: number;
};
export type Item = Stroke | Text;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeDraw = Easing.inOut(Easing.sin);

const textW = (t: Text) => t.text.length * t.size * (t.weight && t.weight >= 800 ? 0.6 : 0.56);

const lenCache = new Map<string, number>();
const lenOf = (d: string) => {
  let v = lenCache.get(d);
  if (v === undefined) {
    v = getLength(d);
    lenCache.set(d, v);
  }
  return v;
};

const eraseOp = (f: number, erase?: number) =>
  erase === undefined ? 1 : 1 - clamp01((f - erase * FPS) / (0.35 * FPS));

export const Board: React.FC<{ items: Item[] }> = ({ items }) => {
  const f = useCurrentFrame();
  let pen = null as { x: number; y: number; color: string } | null;
  let penStart = -1;

  const nodes = items.map((it, i) => {
    const t0 = it.t0 * FPS;
    const t1 = (it.t0 + it.dur) * FPS;
    if (f < t0 - 1) return null;
    const op = eraseOp(f, it.erase);
    if (op <= 0) return null;
    const p = clamp01((f - t0) / Math.max(1, t1 - t0));
    const pe = easeDraw(p);
    const drawing = f >= t0 - 2 && f <= t1 + 4 && op >= 1;

    if (it.k === 's') {
      const len = lenOf(it.d);
      if (drawing && t0 > penStart) {
        const pt = getPointAtLength(it.d, len * pe);
        pen = { x: pt?.x ?? 0, y: pt?.y ?? 0, color: it.color };
        penStart = t0;
      }
      const fillOp = it.fill ? clamp01((f - t1) / (0.45 * FPS)) * it.fill.op : 0;
      return (
        <g key={i} opacity={op}>
          {it.fill && fillOp > 0 && <path d={it.fill.d ?? it.d} fill={it.fill.color} opacity={fillOp} />}
          <path
            d={it.d}
            fill="none"
            stroke={it.color}
            strokeWidth={it.w}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={it.dashed ? `10 14` : len}
            strokeDashoffset={it.dashed ? 0 : len * (1 - pe)}
            opacity={it.dashed ? pe : 1}
          />
        </g>
      );
    }

    const w = textW(it);
    const left = it.x - w / 2;
    const reveal = left + w * pe;
    if (drawing && t0 > penStart) {
      pen = { x: reveal, y: it.y - it.size * 0.2, color: it.color };
      penStart = t0;
    }
    return (
      <g key={i} opacity={op}>
        <clipPath id={`c${i}`}>
          <rect x={left - 10} y={it.y - it.size * 1.1} width={Math.max(0, reveal - left + 10)} height={it.size * 1.5} />
        </clipPath>
        <text
          x={it.x}
          y={it.y}
          textAnchor="middle"
          fontFamily={FONT}
          fontWeight={it.weight ?? 800}
          fontSize={it.size}
          fill={it.color}
          clipPath={`url(#c${i})`}
        >
          {it.text}
        </text>
      </g>
    );
  });

  const pn = pen as { x: number; y: number; color: string } | null;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      {nodes}
      {pn && (
        <g transform={`translate(${pn.x} ${pn.y}) scale(0.6)`}>
          <line x1={14} y1={-20} x2={118} y2={-150} stroke="#00000022" strokeWidth={34} strokeLinecap="round" transform="translate(6 8)" />
          <line x1={14} y1={-20} x2={118} y2={-150} stroke="#2B3441" strokeWidth={32} strokeLinecap="round" />
          <line x1={34} y1={-46} x2={52} y2={-68} stroke={pn.color} strokeWidth={32} strokeLinecap="butt" />
          <line x1={0} y1={0} x2={16} y2={-22} stroke={pn.color} strokeWidth={13} strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

export const sec = (s: number) => Math.round(s * FPS);
export { interpolate };
