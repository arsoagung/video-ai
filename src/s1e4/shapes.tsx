import React from 'react';

// ---------- palet (sama dengan episode lain) ----------
export const COL = {
  cell: '#8FBDF7',
  cellD: '#5C93E0',
  virus: '#FF9C85',
  virusD: '#F2674B',
  rt: '#72E3D3',
  yel: '#F4D77E',
  bad: '#FF6B5E',
  white: '#EAF2FB',
  gray: '#B9C3D0',
};

export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="gCell" cx="50%" cy="42%" r="62%">
      <stop offset="0%" stopColor="#BBD8FB" />
      <stop offset="70%" stopColor="#8FBDF7" />
      <stop offset="100%" stopColor="#6FA5EA" />
    </radialGradient>
    <radialGradient id="gVirus" cx="42%" cy="38%" r="70%">
      <stop offset="0%" stopColor="#FFC2B2" />
      <stop offset="100%" stopColor="#FF9078" />
    </radialGradient>
    <clipPath id="capR">
      <rect x="0" y="-42" width="110" height="84" />
    </clipPath>
  </defs>
);

// ---------- jalur gelombang & heliks ----------
export const wavePath = (x0: number, y0: number, len: number, amp: number, freq: number, phase = 0, n = 70) => {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const x = x0 + (len * i) / n;
    const y = y0 + amp * Math.sin(i * freq + phase);
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
  }
  return d;
};

export const Helix: React.FC<{
  x0: number; y0: number; len: number; amp?: number; turns?: number; k?: number; a?: string; b?: string; sw?: number; op?: number; rungs?: boolean; mark?: [number, number][];
}> = ({ x0, y0, len, amp = 26, turns = 4, k = 1, a = COL.rt, b = '#BDF3EA', sw = 8, op = 1, rungs = true, mark = [] }) => {
  const n = 72;
  const m = Math.max(2, Math.round(n * Math.min(1, Math.max(0, k))));
  let da = '', db = '';
  const rg: React.ReactNode[] = [];
  for (let i = 0; i <= m; i++) {
    const x = x0 + (len * i) / n;
    const ang = (Math.PI * 2 * turns * i) / n;
    const ya = y0 + amp * Math.sin(ang);
    const yb = y0 - amp * Math.sin(ang);
    da += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + ya.toFixed(1) + ' ';
    db += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + yb.toFixed(1) + ' ';
    if (rungs && i % 3 === 0 && Math.abs(Math.sin(ang)) > 0.3) rg.push(<line key={i} x1={x} y1={ya} x2={x} y2={yb} stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={sw * 0.5} strokeLinecap="round" />);
  }
  // bagian yang ditandai (kesalahan): rentang u 0..1, digambar merah di atas jalur
  const marks = mark.map(([u0, u1], j) => {
    let d = '';
    const s = Math.round(u0 * n), e = Math.round(u1 * n);
    for (let i = s; i <= e && i <= m; i++) {
      const x = x0 + (len * i) / n;
      const ang = (Math.PI * 2 * turns * i) / n;
      d += (i === s ? 'M' : 'L') + x.toFixed(1) + ' ' + (y0 + amp * Math.sin(ang)).toFixed(1) + ' ';
    }
    let d2 = '';
    for (let i = s; i <= e && i <= m; i++) {
      const x = x0 + (len * i) / n;
      const ang = (Math.PI * 2 * turns * i) / n;
      d2 += (i === s ? 'M' : 'L') + x.toFixed(1) + ' ' + (y0 - amp * Math.sin(ang)).toFixed(1) + ' ';
    }
    return (
      <g key={j}>
        <path d={d} fill="none" stroke={COL.bad} strokeWidth={sw + 3} strokeLinecap="round" />
        <path d={d2} fill="none" stroke={COL.bad} strokeWidth={sw + 3} strokeLinecap="round" />
      </g>
    );
  });
  return (
    <g opacity={op}>
      {rg}
      <path d={da} fill="none" stroke={a} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <path d={db} fill="none" stroke={b} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      {marks}
    </g>
  );
};

// ---------- sel CD4 ----------
export const CellBody: React.FC<{ cx: number; cy: number; r: number; op?: number; rec?: boolean; glow?: number; recAngles?: number[] }> = ({ cx, cy, r, op = 1, rec = true, glow = 0, recAngles }) => {
  const angs = recAngles ?? Array.from({ length: 18 }, (_, i) => (i / 18) * Math.PI * 2 + 0.1);
  return (
    <g opacity={op}>
      <circle cx={cx} cy={cy} r={r + 40} fill="#8FBDF7" opacity={0.12 + glow * 0.1} />
      <circle cx={cx} cy={cy} r={r} fill="url(#gCell)" />
      {rec &&
        angs.map((a, i) => {
          const bx = cx + r * Math.cos(a), by = cy + r * Math.sin(a);
          const tx = cx + (r + r * 0.1) * Math.cos(a), ty = cy + (r + r * 0.1) * Math.sin(a);
          const L = r * 0.06;
          const p1 = [tx + L * Math.cos(a - 0.7), ty + L * Math.sin(a - 0.7)];
          const p2 = [tx + L * Math.cos(a + 0.7), ty + L * Math.sin(a + 0.7)];
          return (
            <g key={i} stroke={COL.yel} strokeWidth={Math.max(4, r * 0.025)} strokeLinecap="round" fill="none">
              <line x1={bx} y1={by} x2={tx} y2={ty} />
              <line x1={tx} y1={ty} x2={p1[0]} y2={p1[1]} />
              <line x1={tx} y1={ty} x2={p2[0]} y2={p2[1]} />
            </g>
          );
        })}
    </g>
  );
};

// ---------- virus HIV ----------
const FRAG = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2 + (i % 2) * 0.35;
  const rr = 0.34 + 0.28 * ((i * 7) % 5) / 4;
  return { a, rr, rot: (i * 53) % 180 };
});
const CORE = Array.from({ length: 14 }, (_, i) => {
  const row = i % 7, col = Math.floor(i / 7);
  return { x: (col - 0.5) * 0.28 + (row % 2 ? 0.04 : -0.04), y: -0.5 + row * 0.165 };
});

export const Virus: React.FC<{
  x: number; y: number; r?: number; op?: number; s?: number; m?: number; halo?: boolean; dead?: boolean; rot?: number; spikes?: boolean; tint?: string;
}> = ({ x, y, r = 60, op = 1, s = 1, m = 1, halo = false, dead = false, rot = 0, spikes = true, tint }) => {
  const fill = dead ? '#8E9AAB' : tint ?? 'url(#gVirus)';
  const sk = dead ? '#8E9AAB' : COL.virus;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      {halo && <circle r={r + 22} fill={COL.yel} opacity={0.38} />}
      {spikes &&
        Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const x1 = Math.cos(a) * r, y1 = Math.sin(a) * r;
          const x2 = Math.cos(a) * (r + r * 0.3), y2 = Math.sin(a) * (r + r * 0.3);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={sk} strokeWidth={r * 0.1} strokeLinecap="round" />
              <circle cx={x2} cy={y2} r={r * 0.115} fill={sk} />
            </g>
          );
        })}
      <circle r={r} fill={fill} opacity={0.55 + 0.45 * m} />
      {!dead && (
        <>
          {FRAG.map((f, i) => {
            const k = Math.min(1, Math.max(0, m));
            const px = (1 - k) * Math.cos(f.a) * f.rr * r + k * CORE[i].x * r;
            const py = (1 - k) * Math.sin(f.a) * f.rr * r + k * CORE[i].y * r;
            return <line key={i} x1={px - r * 0.1} y1={py} x2={px + r * 0.1} y2={py} transform={`rotate(${(1 - k) * f.rot} ${px} ${py})`} stroke="#FFE3DA" strokeOpacity={0.85 * (1 - k * k)} strokeWidth={r * 0.07} strokeLinecap="round" />;
          })}
          <path
            d={`M${-0.32 * r} ${-0.52 * r} L${0.32 * r} ${-0.52 * r} L${0.14 * r} ${0.5 * r} L${-0.14 * r} ${0.5 * r} Z`}
            fill={COL.virusD}
            opacity={m * m}
          />
        </>
      )}
      {dead && (
        <g stroke="#2A3342" strokeWidth={r * 0.14} strokeLinecap="round">
          <line x1={-r * 0.34} y1={-r * 0.34} x2={r * 0.34} y2={r * 0.34} />
          <line x1={r * 0.34} y1={-r * 0.34} x2={-r * 0.34} y2={r * 0.34} />
        </g>
      )}
    </g>
  );
};

// ---------- ikon ----------
export const Check: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <circle r={38} fill={COL.rt} />
    <path d="M-17 1 L-5 13 L18 -13" fill="none" stroke="#063F38" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
export const Cross: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <circle r={38} fill={COL.bad} />
    <path d="M-14 -14 L14 14 M14 -14 L-14 14" fill="none" stroke="#3B0A06" strokeWidth={9} strokeLinecap="round" />
  </g>
);

export const Capsule: React.FC<{ x: number; y: number; s?: number; rot?: number; op?: number }> = ({ x, y, s = 1, rot = 0, op = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    <rect x={-110} y={-42} width={220} height={84} rx={42} fill={COL.rt} />
    <g clipPath="url(#capR)">
      <rect x={-110} y={-42} width={220} height={84} rx={42} fill="#EAF7F5" />
    </g>
    <rect x={-100} y={-30} width={90} height={14} rx={7} fill="#FFFFFF" opacity={0.35} />
  </g>
);

export const Shield: React.FC<{ x: number; y: number; s?: number; op?: number; broken?: boolean }> = ({ x, y, s = 1, op = 1, broken = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <path d="M0 -62 L50 -42 L50 8 Q50 46 0 68 Q-50 46 -50 8 L-50 -42 Z" fill={broken ? '#7F98A6' : COL.rt} />
    {broken ? (
      <path d="M-4 -50 L12 -14 L-10 6 L8 40" fill="none" stroke="#1A3340" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M-20 2 L-6 16 L22 -16" fill="none" stroke="#063F38" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
    )}
  </g>
);

export const Scissors: React.FC<{ x: number; y: number; rot?: number; open?: number; s?: number; op?: number }> = ({ x, y, rot = 0, open = 18, s = 1, op = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    {[-1, 1].map((d) => (
      <g key={d} transform={`rotate(${d * open})`}>
        <path d="M0 0 L-14 -120 Q0 -138 14 -120 Z" fill="#EAF2FB" />
        <path d="M-9 26 Q-30 36 -26 62 Q-14 82 0 62 Q8 40 9 26 Z" fill="none" stroke="#EAF2FB" strokeWidth={11} strokeLinejoin="round" />
      </g>
    ))}
    <circle r={9} fill={COL.rt} />
  </g>
);

export const Factory: React.FC<{ x: number; y: number; lit?: number; op?: number }> = ({ x, y, lit = 0, op = 1 }) => {
  const win = [[-170, -60], [-60, -60], [50, -60], [160, -60]];
  return (
    <g transform={`translate(${x} ${y})`} opacity={op}>
      <rect x={-250} y={-120} width={500} height={250} rx={18} fill="#EAF2FB" opacity={0.16} />
      <path d="M-250 -120 L-250 -190 L-170 -120 L-170 -190 L-90 -120 L-90 -190 L-10 -120 Z" fill="#EAF2FB" opacity={0.16} />
      <rect x={140} y={-250} width={50} height={140} rx={8} fill="#EAF2FB" opacity={0.16} />
      {win.map(([wx, wy], i) => (
        <rect key={i} x={wx - 32} y={wy - 32} width={64} height={64} rx={12} fill={lit > i / 4 ? COL.virus : '#0A1F3D'} opacity={lit > i / 4 ? 0.95 : 0.55} />
      ))}
      <rect x={-45} y={10} width={90} height={120} rx={12} fill="#0A1F3D" opacity={0.55} />
    </g>
  );
};
