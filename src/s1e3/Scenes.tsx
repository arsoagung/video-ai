import React from 'react';
import { FONT } from '../Board';
import { ez, lerp, win, out3, sine, back } from '../motion';
import * as L from '../shared/library';
import { FlatVirus } from '../shared/shapes';
import { Helix, wavePath, COL } from '../ep3/shapes';

// Animasi penjelasan S1E3, disusun dari narasi_final (bukan dari objek/gerak storyboard).
// Tiap scene = fungsi waktu lokal u (detik sejak scene mulai). Zona aman: y 300-1400 (subtitle di y=1462).

export const SCENE_T = [0, 5.37, 16.65, 19.52, 24.12, 28.31, 35.11, 41.82, 45.72, 50.35, 55.31, 63.84, 71.0, 72.51];

export const SCENE_GRAD: [string, string, string][] = [
  ['#0A1F3D', '#123A60', '#17506F'],
  ['#14183F', '#2A2A6B', '#3B4A8A'],
  ['#0A1F3D', '#123A60', '#17506F'],
  ['#0D1B45', '#1E2F6B', '#2B4A85'],
  ['#14183F', '#2A2A6B', '#3B4A8A'],
  ['#08283A', '#0F4A5C', '#167A80'],
  ['#08283A', '#0F4A5C', '#167A80'],
  ['#0D1B45', '#1E2F6B', '#2B4A85'],
  ['#14183F', '#2A2A6B', '#3B4A8A'],
  ['#08283A', '#0F4A5C', '#167A80'],
  ['#14183F', '#2A2A6B', '#3B4A8A'],
  ['#0D1B45', '#1E2F6B', '#2B4A85'],
  ['#08283A', '#0F4A5C', '#167A80'],
];

// legenda per scene (hanya hal abstrak). mode: intro = ±4,5 dtk lalu fade; hold = selama scene
export const LEGENDS: Record<number, { items: { color: string; label: string }[]; mode: 'intro' | 'hold' }> = {
  2: { items: [{ color: '#FF9C85', label: 'HIV' }, { color: '#F4D77E', label: 'Reseptor CD4' }, { color: '#72E3D3', label: 'Obat' }], mode: 'intro' },
  3: { items: [{ color: '#FF8E70', label: 'RNA virus' }, { color: '#F4A6C8', label: 'Enzim RT' }, { color: '#F4D77E', label: 'DNA virus' }], mode: 'intro' },
  4: { items: [{ color: '#F4D77E', label: 'DNA virus' }, { color: '#8FBDF7', label: 'DNA sel' }, { color: '#FFC38A', label: 'Enzim integrase' }], mode: 'intro' },
  5: { items: [{ color: '#9ADBF0', label: 'Enzim protease' }, { color: '#FF9C85', label: 'Virus matang' }, { color: '#B9C3D0', label: 'Belum matang' }], mode: 'intro' },
  10: { items: [{ color: '#FF9C85', label: 'Virus biasa' }, { color: '#B9A2F5', label: 'Virus kebal' }, { color: '#72E3D3', label: 'Obat' }], mode: 'intro' },
  11: { items: [{ color: '#72E3D3', label: 'Jumlah virus' }, { color: '#FF6B4D', label: 'Batas terdeteksi' }], mode: 'hold' },
};

const TEAL = '#72E3D3';
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

// ---------------- komponen kecil ----------------
export const Pill: React.FC<{ x: number; y: number; text: string; bg?: string; fg?: string; size?: number; op?: number }> = ({ x, y, text, bg = '#EAF2FB', fg = '#12304F', size = 32, op = 1 }) => {
  if (op < 0.01) return null;
  const w = text.length * size * 0.58 + size * 1.7;
  const h = size * 1.85;
  return (
    <g opacity={op} transform={`translate(${x} ${y}) scale(${0.9 + 0.1 * op})`}>
      <rect x={-w / 2 + 2} y={-h / 2 + 7} width={w} height={h} rx={h / 2} fill="#000" opacity={0.2} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={bg} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={fg}>
        {text}
      </text>
    </g>
  );
};
const TealPill: React.FC<{ x: number; y: number; text: string; size?: number; op?: number }> = (p) => <Pill {...p} bg={TEAL} fg="#063F38" />;

const Drug: React.FC<{ x: number; y: number; s?: number; rot?: number; op?: number }> = ({ x, y, s = 0.55, rot = 0, op = 1 }) => (
  <L.Capsule cx={x} cy={y} s={s} rot={rot} op={op} />
);

const Pause: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) =>
  k < 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={clamp(k)}>
      <circle r={46} fill={TEAL} />
      <rect x={-17} y={-20} width={11} height={40} rx={4} fill="#063F38" />
      <rect x={6} y={-20} width={11} height={40} rx={4} fill="#063F38" />
    </g>
  );

const Stop: React.FC<{ x: number; y: number; k: number; s?: number }> = ({ x, y, k, s = 1 }) =>
  k < 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k * s})`} opacity={clamp(k)}>
      <circle r={34} fill="#FF6B5E" />
      <path d="M -13 -13 L 13 13 M 13 -13 L -13 13" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
    </g>
  );

const MiniRail: React.FC<{ stage: number; u: number }> = ({ stage, u }) => {
  const xs = [390, 490, 590, 690];
  const o = ez(u, 0.1, 0.6);
  return (
    <g opacity={o}>
      <rect x={xs[0]} y={327} width={xs[3] - xs[0]} height={6} rx={3} fill="#EAF2FB" opacity={0.2} />
      {xs.map((x, i) => {
        const on = i + 1 === stage;
        return (
          <g key={i}>
            {on && <circle cx={x} cy={330} r={34} fill={TEAL} opacity={0.3} />}
            <circle cx={x} cy={330} r={on ? 24 : 18} fill={on ? TEAL : '#EAF2FB'} opacity={on ? 1 : 0.3} />
            <text x={x} y={330 + (on ? 9 : 7)} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={on ? 26 : 20} fill={on ? '#063F38' : '#0A1F3D'}>
              {i + 1}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// ================= S0: pertanyaan pembuka (0 - 5.37) =================
const S0: React.FC<{ u: number }> = ({ u }) => {
  const tabK = ez(u, 0.2, 0.9, back);
  const split = ez(u, 1.4, 2.3, out3);
  const vk = ez(u, 0.5, 1.3, back);
  const tgt: [number, number, number][] = [[320, 1090, -14], [540, 1150, 0], [760, 1090, 14]];
  const g = ez(u, 2.7, 3.6, sine) * (1 - ez(u, 3.9, 4.7, sine));
  const pulse = 1 + 0.08 * Math.sin(Math.max(0, u - 3.2) * 6) * ez(u, 3.2, 3.5);
  return (
    <g>
      <FlatVirus cx={540} cy={640 + Math.sin(u * 2) * 6} r={82 * vk} dim={vk} rot={u * 8} />
      {g > 0.02 && <FlatVirus cx={540 + 210 * g} cy={640} r={72 * Math.pow(g, 0.7)} dim={0.5} rot={-u * 8} />}
      <Pause x={760} y={640} k={ez(u, 4.2, 4.8, back)} />
      <g opacity={1 - split}>
        <L.Tablet cx={540} cy={860} s={1.9 * tabK * (1 - 0.3 * split)} />
      </g>
      {tgt.map(([x, y, r], i) => {
        const k = ez(u, 1.5 + i * 0.12, 2.5 + i * 0.12, out3);
        return <Drug key={i} x={lerp(540, x, k)} y={lerp(860, y, k)} s={0.85 * pulse} rot={r * k} op={k} />;
      })}
    </g>
  );
};

// ================= S1: jalur produksi bertahap + ARV menghambat (5.37 - 16.65) =================
const XS = [180, 420, 660, 900];
const RY = 900;
const STN_LBL = ['Masuk sel', 'Salin DNA', 'Menyatu', 'Matang'];
const StationIcon: React.FC<{ i: number }> = ({ i }) => {
  if (i === 0)
    return (
      <g>
        <circle cx={0} cy={8} r={28} fill="#8FBDF7" />
        <line x1={0} y1={-18} x2={0} y2={-34} stroke="#F4D77E" strokeWidth={6} strokeLinecap="round" />
        <circle cx={0} cy={-38} r={7} fill="#FFF3C4" />
      </g>
    );
  if (i === 1)
    return (
      <g>
        <path d={wavePath(-32, -14, 64, 6, 0.9)} stroke="#FF8E70" strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M 0 -2 L 0 10 M -7 4 L 0 12 L 7 4" stroke="#EAF2FB" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d={wavePath(-32, 22, 64, 6, 0.9)} stroke="#F4D77E" strokeWidth={7} fill="none" strokeLinecap="round" />
      </g>
    );
  if (i === 2)
    return (
      <g strokeWidth={11} strokeLinecap="round">
        <line x1={-38} y1={0} x2={-14} y2={0} stroke="#8FBDF7" />
        <line x1={-12} y1={0} x2={12} y2={0} stroke="#F4D77E" />
        <line x1={14} y1={0} x2={38} y2={0} stroke="#8FBDF7" />
      </g>
    );
  return <FlatVirus cx={0} cy={0} r={22} />;
};

const Rail: React.FC<{ u: number; blocked: number[]; inK?: number; dim?: number[]; glow?: number[] }> = ({ u, blocked, inK = 0.3, dim = [], glow = [] }) => (
  <g>
    <rect x={120} y={RY - 6} width={840} height={12} rx={6} fill="#EAF2FB" opacity={0.14 * ez(u, inK, inK + 0.5)} />
    {XS.map((x, i) => {
      const k = ez(u, inK + i * 0.22, inK + i * 0.22 + 0.55, back);
      const bl = blocked.includes(i) ? 1 : 0;
      const dm = dim.includes(i) ? 0.45 : 1;
      const gl = glow.includes(i) ? 1 : 0;
      return (
        <g key={i} opacity={k * dm} transform={`translate(${x} ${RY}) scale(${0.7 + 0.3 * k})`}>
          {gl > 0 && <circle r={96} fill={TEAL} opacity={0.22} />}
          <circle r={72} fill="#EAF2FB" opacity={0.16} />
          <circle r={72} fill={TEAL} opacity={0.34 * bl} />
          <StationIcon i={i} />
        </g>
      );
    })}
    {XS.map((x, i) => (
      <Pill key={i} x={x} y={RY + 118} text={STN_LBL[i]} size={26} op={ez(u, inK + 0.4 + i * 0.22, inK + 0.9 + i * 0.22)} />
    ))}
  </g>
);

const S1: React.FC<{ u: number }> = ({ u }) => {
  const A = [1.2, 2.1, 3.0, 3.9];
  // token virus bergerak antar stasiun
  let x = -80;
  if (u < A[0]) x = lerp(-80, XS[0], ez(u, 0.5, A[0], sine));
  else {
    x = XS[0];
    for (let k = 1; k < 4; k++) if (u >= A[k - 1] + 0.3) x = lerp(XS[k - 1], XS[k], ez(u, A[k - 1] + 0.3, A[k], sine));
  }
  const tok1 = win(u, 0.5, 4.5, 0.25);
  const glow = XS.map((_, i) => win(u, A[i] - 0.15, A[i] + 0.6, 0.2));
  // salinan baru di stasiun akhir
  const cp = ez(u, 4.05, 4.9, out3) * (1 - ez(u, 5.3, 6.0));
  // kapsul turun menghambat tiap tahap
  const capT = [5.6, 6.4, 7.2, 8.0];
  const caps = XS.map((_, i) => ez(u, capT[i], capT[i] + 0.7, back));
  const blockedNow = XS.map((_, i) => (caps[i] > 0.9 ? 1 : 0));
  // virus mencoba lagi dan terhenti
  const x2 = ez(u, 9.1, 9.9, sine) * XS[0] + (1 - ez(u, 9.1, 9.9, sine)) * -80;
  const bounce = ez(u, 10.0, 10.9, sine);
  const tokX = u < 10.0 ? x2 : lerp(XS[0], -90, bounce);
  const tok2 = u > 9.0 ? win(u, 9.0, 11.2, 0.3) : 0;
  const ghost = ez(u, 9.6, 10.4);
  return (
    <g>
      <Rail u={u} blocked={XS.map((_, i) => i).filter((i) => blockedNow[i])} />
      {tok1 > 0.01 && <FlatVirus cx={x} cy={RY - 6} r={34} dim={tok1} rot={u * 40} />}
      {glow.map((g, i) => (g > 0.02 ? <circle key={i} cx={XS[i]} cy={RY} r={88} fill="#fff" opacity={0.12 * g} /> : null))}
      {cp > 0.01 &&
        [[-1, -150], [1, -170]].map(([d, dy], i) => (
          <FlatVirus key={i} cx={XS[3] + d * 70 * cp + d * 20} cy={RY + dy * cp - 40} r={26 * cp} dim={0.9 * cp} rot={u * 60} />
        ))}
      {XS.map((xx, i) => (
        <Drug key={i} x={xx} y={lerp(560, RY - 118, caps[i])} s={0.5} rot={90 * caps[i] + 0} op={caps[i]} />
      ))}
      {tok2 > 0.01 && <FlatVirus cx={tokX} cy={RY - 6} r={34} dim={tok2} rot={u * 40} />}
      {ghost > 0.01 && (
        <g opacity={ghost}>
          <circle cx={XS[3]} cy={RY - 150} r={44} fill="none" stroke="#EAF2FB" strokeOpacity={0.4} strokeWidth={5} strokeDasharray="10 10" />
          <Stop x={XS[3]} y={RY - 150} k={ghost} s={0.9} />
        </g>
      )}
    </g>
  );
};

// ================= S2: obat menghalangi virus masuk sel (16.65 - 19.52) =================
const S2: React.FC<{ u: number }> = ({ u }) => {
  const vy = lerp(540, 960, ez(u, 0.2, 1.4, sine)) - 90 * Math.sin(ez(u, 1.5, 2.5, sine) * Math.PI) * 0 + (u > 1.5 ? -ez(u, 1.6, 2.6, out3) * 250 : 0);
  const rot = u * 20 + (u > 1.5 ? ez(u, 1.5, 2.6) * 100 : 0);
  const rx = [290, 540, 790];
  return (
    <g>
      <MiniRail stage={1} u={u} />
      <L.Membrane cx={540} cy={1180} w={900} receptors={rx.map((x) => ({ x: x - 540, kind: 'cd4' as const }))} />
      {rx.map((x, i) => {
        const k = ez(u, 0.4 + i * 0.18, 1.2 + i * 0.18, back);
        return (
          <g key={i} opacity={clamp(k)} transform={`translate(${x} ${lerp(760, 1074, k)})`}>
            <circle r={38} fill={TEAL} opacity={0.35} />
            <circle r={26} fill={TEAL} />
            <circle cx={-8} cy={-9} r={8} fill="#fff" opacity={0.45} />
          </g>
        );
      })}
      <FlatVirus cx={540} cy={vy} r={86} rot={rot} />
      <Stop x={540} y={lerp(1010, 860, 0)} k={ez(u, 1.7, 2.2, back) * (1 - ez(u, 2.6, 2.9))} />
    </g>
  );
};

// ================= RT: penyalinan RNA -> DNA (S3, S7) =================
const RTScene: React.FC<{ u: number; dock: number; caps: { name?: string; dx: number }[] }> = ({ u, dock, caps }) => {
  const p = 0.55 * ez(u, 0.4, dock, sine);
  const ex = lerp(190, 800, p);
  const stopK = ez(u, dock, dock + 0.4, back);
  const done = Math.min(1, (ex - 130) / 820);
  const shake = u > dock ? Math.sin((u - dock) * 30) * 3 * (1 - ez(u, dock, dock + 0.6)) : 0;
  return (
    <g>
      <path d={wavePath(130, 630, 820, 20, 0.55, u * 1.5)} stroke="#FF8E70" strokeWidth={12} fill="none" strokeLinecap="round" opacity={ez(u, 0, 0.5)} />
      <Helix x0={130} y0={810} len={820} amp={22} turns={9} k={Math.max(0.03, done)} a={COL.yel} b="#FFF3C4" sw={9} op={ez(u, 0.3, 0.7)} />
      {u > dock && <line x1={ex + 10} y1={810} x2={960} y2={810} stroke="#F4D77E" strokeWidth={9} strokeLinecap="round" strokeDasharray="4 22" opacity={0.55 * ez(u, dock + 0.2, dock + 0.8)} />}
      <L.Enzyme kind="rt" cx={ex + shake} cy={720} s={1.45 * ez(u, 0, 0.5, back)} />
      {caps.map((c, i) => {
        const st = dock - 0.8 + i * 0.12;
        const k = ez(u, st, st + 0.8, back);
        return (
          <g key={i}>
            <Drug x={ex + c.dx} y={lerp(430, 560, k)} s={0.6} rot={lerp(70, 90, k)} op={k} />
            {c.name && <TealPill x={ex + c.dx} y={lerp(430, 560, k) - 70} text={c.name} size={28} op={k} />}
          </g>
        );
      })}
      <Pause x={ex} y={1000} k={stopK} />
    </g>
  );
};

// ================= integrase: DNA virus menyatu dengan DNA sel (S4, S8) =================
const IntScene: React.FC<{ u: number; dock: number; name?: string }> = ({ u, dock, name }) => {
  const p = 0.55 * ez(u, 0.4, dock, sine);
  const back_ = ez(u, dock + 0.7, dock + 1.7, sine);
  const q = p * (1 - back_);
  const fy = lerp(1180, 860, q);
  const dk = ez(u, dock - 0.7, dock, back);
  return (
    <g>
      <Helix x0={100} y0={860} len={360} amp={24} turns={3} a={COL.cell} b="#D6E8FC" op={ez(u, 0, 0.5)} />
      <Helix x0={620} y0={860} len={360} amp={24} turns={3} a={COL.cell} b="#D6E8FC" op={ez(u, 0, 0.5)} />
      <rect x={470} y={800} width={140} height={120} rx={30} fill="#EAF2FB" opacity={0.12 * ez(u, 0.2, 0.7)} />
      <Helix x0={465} y0={fy} len={150} amp={22} turns={2} a={COL.yel} b="#FFF3C4" op={ez(u, 0.2, 0.7)} />
      <L.Enzyme kind="integrase" cx={540} cy={fy + 100} s={1.15 * ez(u, 0.1, 0.6, back)} />
      <g opacity={clamp(dk)}>
        <Drug x={lerp(860, 650, dk)} y={lerp(1000, fy + 100, dk)} s={0.6} rot={lerp(20, 0, dk)} />
        {name && <TealPill x={lerp(860, 650, dk) + 30} y={lerp(1000, fy + 100, dk) + 78} text={name} size={28} />}
      </g>
      <Stop x={540} y={720} k={ez(u, dock + 0.3, dock + 0.8, back) * (1 - ez(u, dock + 2.4, dock + 2.7))} />
    </g>
  );
};

// ================= S5: pematangan virus (28.31 - 35.11) =================
const Immature: React.FC<{ x: number; y: number; r: number; m: number }> = ({ x, y, r, m }) => (
  <g transform={`translate(${x} ${y})`}>
    <g opacity={1 - m}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * r * 1.08} cy={Math.sin(a) * r * 1.08} r={r * 0.1} fill="#B9C3D0" opacity={0.7} />;
      })}
      <circle r={r} fill="#B9C3D0" />
      <circle cx={-r * 0.3} cy={-r * 0.35} r={r * 0.3} fill="#fff" opacity={0.2} />
    </g>
    <FlatVirus cx={0} cy={0} r={r} dim={m} />
  </g>
);

const S5: React.FC<{ u: number }> = ({ u }) => {
  const m = ez(u, 2.0, 3.0, sine);
  const pa = win(u, 0.8, 3.3, 0.5);
  const pyA = lerp(1130, 930, ez(u, 0.8, 1.6, out3));
  const snip = u > 1.6 && u < 2.6 ? Math.sin(u * 22) * 10 : 0;
  // kanan: dengan obat
  const kR = ez(u, 3.4, 4.0, back);
  const pyB = lerp(1130, 930, ez(u, 4.0, 4.8, out3));
  const capK = ez(u, 4.9, 5.6, back);
  const nudge = u > 5.6 ? Math.sin((u - 5.6) * 18) * 3 * (1 - ez(u, 5.6, 6.2)) : 0;
  return (
    <g>
      <Pill x={300} y={560} text="tanpa obat" size={30} op={ez(u, 0.3, 0.8)} />
      <TealPill x={780} y={560} text="dengan obat" size={30} op={ez(u, 3.2, 3.7)} />
      <g opacity={ez(u, 0.2, 0.7)}>
        <Immature x={300} y={780} r={90} m={m} />
      </g>
      <g opacity={pa}>
        <L.Enzyme kind="protease" cx={300} cy={pyA} s={1.1} rot={snip * 3} />
      </g>
      <Pill x={300} y={1070} text="matang" bg="#FF9C85" fg="#3B1308" size={30} op={ez(u, 3.0, 3.5)} />
      <g opacity={clamp(kR)}>
        <Immature x={780} y={780} r={90} m={0} />
        <L.Enzyme kind="protease" cx={780 + nudge} cy={pyB} s={1.1} op={1 - 0.45 * capK} />
        <Drug x={lerp(960, 800, capK)} y={lerp(1040, 960, capK)} s={0.55} rot={lerp(40, 0, capK)} op={capK} />
        <Stop x={780} y={1060} k={ez(u, 5.7, 6.2, back)} />
      </g>
      <Pill x={780} y={1150} text="belum matang" bg="#B9C3D0" fg="#1D2A3A" size={30} op={ez(u, 5.8, 6.3)} />
    </g>
  );
};

// ================= S6: TLD = tiga obat (35.11 - 41.82) =================
const S6: React.FC<{ u: number }> = ({ u }) => {
  const tabK = ez(u, 0.2, 0.9, back);
  const split = ez(u, 1.1, 2.0, out3);
  const tgt: [number, number, number, string, number][] = [[230, 1010, -10, 'tenofovir', 1.8], [540, 1090, 0, 'lamivudin', 3.1], [850, 1010, 10, 'dolutegravir', 4.2]];
  return (
    <g>
      <g opacity={1 - split}>
        <L.Tablet cx={540} cy={800} s={2.4 * tabK} />
        <text x={540} y={800 + 20} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={62} fill="#173A5E" opacity={tabK}>
          TLD
        </text>
      </g>
      <Pill x={540} y={560} text="TLD" bg={TEAL} fg="#063F38" size={44} op={ez(u, 1.5, 2.1)} />
      {tgt.map(([x, y, r, n, tt], i) => {
        const k = ez(u, 1.2 + i * 0.1, 2.2 + i * 0.1, out3);
        const hi = 1 + 0.12 * win(u, tt - 0.1, tt + 0.9, 0.2);
        return (
          <g key={i}>
            <Drug x={lerp(540, x, k)} y={lerp(800, y, k)} s={0.95 * hi} rot={r * k} op={k} />
            <Pill x={x} y={y + 90} text={n} size={30} op={ez(u, tt, tt + 0.45)} />
          </g>
        );
      })}
    </g>
  );
};

// ================= S9: tiga obat, dua tahap (50.35 - 55.31) =================
const S9: React.FC<{ u: number }> = ({ u }) => {
  const t1 = ez(u, 0.5, 1.3, back), t2 = ez(u, 0.8, 1.6, back), t3 = ez(u, 1.1, 1.9, back);
  const glow = u > 2.0 ? [1, 2] : [];
  const x = u < 3.3 ? -80 : u < 4.0 ? lerp(-80, XS[0], ez(u, 3.3, 4.0, sine)) : lerp(XS[0], XS[1] - 90, ez(u, 4.1, 4.6, sine));
  const bounce = ez(u, 4.6, 5.0);
  const tokOp = win(u, 3.3, 5.0, 0.25);
  return (
    <g>
      <Rail u={u} blocked={[1, 2].filter(() => u > 1.9)} dim={u > 2.0 ? [0, 3] : []} glow={glow} inK={0} />
      <Drug x={XS[1] - 36} y={lerp(560, RY - 118, t1)} s={0.5} rot={90 * t1} op={t1} />
      <Drug x={XS[1] + 36} y={lerp(560, RY - 118, t2)} s={0.5} rot={90 * t2} op={t2} />
      <Drug x={XS[2]} y={lerp(560, RY - 118, t3)} s={0.5} rot={90 * t3} op={t3} />
      <TealPill x={300} y={640} text="3 obat" size={40} op={ez(u, 1.5, 2.1)} />
      <Pill x={780} y={640} text="2 tahap" size={40} op={ez(u, 2.5, 3.1)} />
      <path d="M 340 650 L 440 740 M 740 650 L 640 740" stroke="#EAF2FB" strokeOpacity={0.3 * ez(u, 2.5, 3.1)} strokeWidth={5} strokeLinecap="round" fill="none" />
      {tokOp > 0.01 && <FlatVirus cx={u > 4.6 ? lerp(XS[1] - 90, XS[0] - 60, bounce) : x} cy={RY - 6} r={34} dim={tokOp} rot={u * 40} />}
    </g>
  );
};

// ================= S10: kombinasi + resistansi (55.31 - 63.84) =================
const Gate: React.FC<{ x: number; y: number; op?: number; flick?: number }> = ({ x, y, op = 1, flick = 0 }) => (
  <g opacity={op * (1 - 0.6 * flick)}>
    <rect x={x - 12} y={y - 74} width={24} height={148} rx={12} fill={TEAL} opacity={0.3} />
    <Drug x={x} y={y} s={0.7} rot={90} />
  </g>
);

const S10: React.FC<{ u: number }> = ({ u }) => {
  const p1 = win(u, 0, 4.4, 0.45);
  const p2 = win(u, 4.4, 8.6, 0.5);
  // bagian 1: banyak virus tertahan gerbang kombinasi
  const vs = Array.from({ length: 8 }, (_, i) => i);
  // bagian 2: virus kebal
  const mut = ez(u, 5.3, 6.0);
  const vcol = (a: string, b: string, k: number) => (k > 0.5 ? b : a);
  const xA = lerp(150, 900, ez(u, 6.1, 7.6, sine));
  const xB = u < 6.1 ? 150 : u < 7.0 ? lerp(150, 520 - 70, ez(u, 6.1, 6.9, sine)) : u < 7.2 ? 450 : 450;
  // B: lewati gerbang1 (x=520) lalu terhenti di gerbang2 (x=780)
  const bX = u < 6.1 ? 150 : u < 7.3 ? lerp(150, 700, ez(u, 6.1, 7.3, sine)) : lerp(700, 560, ez(u, 7.6, 8.3, sine));
  return (
    <g>
      <g opacity={p1}>
        <TealPill x={540} y={560} text="kombinasi obat" size={34} op={ez(u, 0.3, 0.9)} />
        {[0, 1, 2].map((i) => (
          <Gate key={i} x={680} y={760 + i * 150} op={ez(u, 0.4 + i * 0.15, 1.0 + i * 0.15)} />
        ))}
        {vs.map((i) => {
          const row = i % 4;
          const st = 0.8 + i * 0.32;
          const k = ez(u, st, st + 1.1, sine);
          const y = 700 + row * 130 + (i > 3 ? 40 : 0);
          const x = lerp(110 + (i % 3) * 40, 560 - (i > 3 ? 70 : 0), k);
          const fade = 1 - 0.85 * ez(u, st + 1.1, st + 1.6);
          return <FlatVirus key={i} cx={x} cy={y} r={30} dim={fade * ez(u, st - 0.3, st)} rot={u * 40 + i * 30} />;
        })}
        <Pill x={300} y={1280} text="jumlah virus turun" size={30} op={ez(u, 3.0, 3.6)} />
      </g>
      <g opacity={p2}>
        <Pill x={170} y={640} text="1 obat" size={30} />
        <rect x={100} y={680} width={880} height={160} rx={44} fill="#EAF2FB" opacity={0.1} />
        <Gate x={600} y={760} flick={win(u, 6.9, 7.8, 0.2)} />
        <FlatVirus cx={xA} cy={760} r={36} color={vcol('#FF9C85', '#B9A2F5', mut)} rot={u * 40} />
        <Pill x={170} y={950} text="kombinasi" bg={TEAL} fg="#063F38" size={30} />
        <rect x={100} y={990} width={880} height={160} rx={44} fill="#EAF2FB" opacity={0.1} />
        <Gate x={520} y={1070} flick={win(u, 6.5, 7.4, 0.2)} />
        <Gate x={780} y={1070} />
        <FlatVirus cx={bX} cy={1070} r={36} color={vcol('#FF9C85', '#B9A2F5', mut)} rot={u * 40} />
        <Pill x={880} y={1230} text="kebal" bg="#B9A2F5" fg="#241446" size={30} op={ez(u, 6.0, 6.5)} />
        <Stop x={700} y={1070} k={ez(u, 7.7, 8.2, back)} s={0.8} />
      </g>
    </g>
  );
};

// ================= S11: viral load turun, virus tetap ada (63.84 - 71.0) =================
const S11: React.FC<{ u: number }> = ({ u }) => {
  const pr = ez(u, 0.8, 4.8, sine);
  const dots = Array.from({ length: 24 }, (_, i) => i);
  return (
    <g>
      <L.LineChart cx={540} cy={760} s={1.6} points={[1, 0.78, 0.5, 0.3, 0.18, 0.1, 0.06]} threshold={0.1} progress={pr} color={TEAL} op={ez(u, 0.1, 0.6)} />
      {dots.map((i) => {
        const a = (i * 137.5 * Math.PI) / 180;
        const rr = 40 + (i % 6) * 26;
        const keep = i < 3;
        const gone = keep ? 0 : ez(u, 0.8 + (i / 24) * 4.0, 1.2 + (i / 24) * 4.0);
        const op = (1 - gone) * (keep ? 0.5 + 0.3 * ez(u, 4.8, 5.4) : 1);
        return <circle key={i} cx={540 + rr * Math.cos(a) * 1.9} cy={1215 + rr * Math.sin(a) * 0.9} r={keep ? 12 : 11} fill="#FF9C85" opacity={op * ez(u, 0.2, 0.7)} />;
      })}
      <Pill x={540} y={1090} text="tidak terdeteksi" size={32} op={ez(u, 4.0, 4.6)} />
      <Pill x={540} y={1350} text="virus tetap ada" bg="#FF9C85" fg="#3B1308" size={32} op={ez(u, 5.4, 6.0)} />
    </g>
  );
};

// ================= S12: ARV diminum teratur (71.0 - 72.51) =================
const S12: React.FC<{ u: number }> = ({ u }) => (
  <g>
    <L.Blister cx={540} cy={800} s={1.4} taken={u > 0.9 ? 2 : u > 0.4 ? 1 : 0} op={ez(u, 0, 0.4)} />
    <L.Clock cx={540} cy={1150} s={1.0} frac={0.5} hour={Math.round(3 + u * 2)} op={ez(u, 0.2, 0.6)} />
  </g>
);

// ================= daftar scene =================
export const renderScene = (i: number, u: number): React.ReactNode => {
  switch (i) {
    case 0: return <S0 u={u} />;
    case 1: return <S1 u={u} />;
    case 2: return <S2 u={u} />;
    case 3: return (<><MiniRail stage={2} u={u} /><RTScene u={u} dock={2.3} caps={[{ dx: 0 }]} /></>);
    case 4: return (<><MiniRail stage={3} u={u} /><IntScene u={u} dock={2.2} /></>);
    case 5: return (<><MiniRail stage={4} u={u} /><S5 u={u} /></>);
    case 6: return <S6 u={u} />;
    case 7: return (<><MiniRail stage={2} u={u} /><RTScene u={u} dock={1.9} caps={[{ name: 'tenofovir', dx: -90 }, { name: 'lamivudin', dx: 90 }]} /></>);
    case 8: return (<><MiniRail stage={3} u={u} /><IntScene u={u} dock={2.1} name="dolutegravir" /></>);
    case 9: return <S9 u={u} />;
    case 10: return <S10 u={u} />;
    case 11: return <S11 u={u} />;
    case 12: return <S12 u={u} />;
    default: return null;
  }
};
