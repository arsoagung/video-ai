import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, in3, sine, back } from '../motion';
import { CUES, CLOSE, WARP, EP_DUR } from './timeline';
import { COL, Defs, wavePath, Helix, CellBody, Virus, Check, Cross, Capsule, Shield, Scissors, Factory } from './shapes';

const useFonts3 = () => {
  const [handle] = React.useState(() => delayRender('fonts3'));
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

export const S1E4_FRAMES = Math.ceil(EP_DUR * FPS);
const OLD_CLOSE = 106.46; // waktu mp3 asli saat kalimat penutup mulai (animasi adegan memakai waktu mp3 asli lewat WARP)

// ---------------- latar gradien (bergeser halus tiap scene) ----------------
type Grad = [string, string, string];
const GRADS: { t: number; c: Grad }[] = [
  { t: 0, c: ['#0A1F3D', '#123A60', '#17506F'] },
  { t: 2.7, c: ['#0D1B45', '#1E2F6B', '#2B4A85'] },
  { t: 12.0, c: ['#0A1F3D', '#123A60', '#17506F'] },
  { t: 23.7, c: ['#14183F', '#2A2A6B', '#3B4A8A'] },
  { t: 45.7, c: ['#08283A', '#0F4A5C', '#167A80'] },
  { t: 54.3, c: ['#0A1F3D', '#123A60', '#17506F'] },
  { t: 64.5, c: ['#14183F', '#2A2A6B', '#3B4A8A'] },
  { t: 75.9, c: ['#0D1B45', '#1E2F6B', '#2B4A85'] },
  { t: 91.4, c: ['#082C3A', '#0E5A63', '#1C8A85'] },
  { t: 106.3, c: ['#0A2540', '#0F3B66', '#0B4F63'] },
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
const SETTLE = [12.04, 23.8, 45.76, 54.35, 64.64, 76.0, 91.51, OLD_CLOSE];
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
// label (pill): hanya istilah kunci benda abstrak (enzim, konsep); kalimat yang sudah jelas di narasi tidak diulang. Waktu = mp3 asli.
const PILLS: P[] = [
  { a: 28.6, b: 36.2, text: 'reverse transcriptase', k: 'rt', x: 540, y: 820, size: 40 },
  { a: 37.0, b: 41.0, text: 'integrase', k: 'rt', x: 540, y: 560, size: 46 },
  { a: 56.8, b: 62.4, text: 'protease', k: 'rt', x: 540, y: 520, size: 52 },
  { a: 88.5, b: 91.2, text: 'seleksi alam', k: 'neutral', x: 540, y: 340, size: 56 },
];
const Pills: React.FC<{ t: number }> = ({ t }) => (
  <>
    {PILLS.map((p, i) => {
      const o = win(t, p.a, p.b, 0.35);
      return o > 0.01 ? <PillBox key={i} x={p.x} y={p.y} text={p.text} k={p.k} size={p.size} op={o} /> : null;
    })}
  </>
);

// legenda kontekstual (hanya visual abstrak): pill kecil di y=250, titik warna + label, maks 3 item, tampil penuh ±4-5 dtk lalu fade
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
const LEGENDS: { a: number; b: number; items: [string, string][] }[] = [
  { a: 3.2, b: 7.7, items: [[COL.virus, 'Virus HIV']] },
  { a: 12.3, b: 16.0, items: [[COL.cell, 'Sel CD4']] },
  { a: 16.3, b: 20.8, items: [[COL.virus, 'Virus HIV']] },
  { a: 24.0, b: 28.5, items: [[COL.virusD, 'RNA virus'], [COL.cell, 'DNA sel']] },
  { a: 36.8, b: 41.4, items: [[COL.cell, 'DNA sel'], [COL.virus, 'DNA virus']] },
  { a: 46.8, b: 51.4, items: [[COL.virus, 'Bahan virus']] },
  { a: 68.9, b: 73.4, items: [[COL.bad, 'Kesalahan salin']] },
  { a: 76.6, b: 80.4, items: [['#8E9AAB', 'Virus cacat']] },
  { a: 81.7, b: 86.2, items: [[COL.yel, 'Virus tahan obat']] },
  { a: 92.2, b: 96.7, items: [[COL.rt, 'Perisai = obat ARV']] },
];

// ---------------- subtitle ----------------
const ACC: Record<string, string> = {
  cd4: '#8FBDF7', hiv: '#FFB7A5', virus: '#FFB7A5', rna: '#FFB7A5', arv: '#72E3D3', obat: '#72E3D3',
  reverse: '#72E3D3', transcriptase: '#72E3D3', integrase: '#72E3D3', protease: '#72E3D3', miliar: '#F4D77E',
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

// ---------------- util ----------------
const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const CX = 540, CY = 820, CR = 400; // sel di scene "dalam sel"
const NY = 860, NR = 170; // inti sel
const pt = (cx: number, cy: number, r: number, a: number) => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });

// ================= SCENE A: pembuka (0 - 13.6) =================
const SceneA: React.FC<{ t: number }> = ({ t }) => {
  const o1 = win(t, 0, 2.7, 0.4);
  const o2 = win(t, 2.7, 12.0, 0.5);
  const kNum = ez(t, 2.9, 8.7, out3);
  const virK = ez(t, 0.8, 2.0, sine);
  const dots = Array.from({ length: 56 }, (_, i) => {
    const a = (i * 137.5 * Math.PI) / 180;
    const rr = 250 + (i % 7) * 34;
    return { x: 540 + rr * Math.cos(a) * 1.15, y: 820 + rr * Math.sin(a) * 0.92, i };
  });
  const sweep = ez(t, 9.2, 10.2, sine);
  const q = win(t, 10.75, 12.0, 0.4);
  return (
    <g>
      <g opacity={o1}>
        <Factory x={540} y={880} lit={ez(t, 1.6, 2.5)} />
        <Virus x={lerp(220, 540, virK)} y={lerp(560, 970, virK)} r={46} s={1 - 0.7 * ez(t, 1.7, 2.2)} />
      </g>
      <g opacity={o2}>
        {dots.map((d) => {
          const on = ez(t, 3.0 + (d.i / 56) * 5.6, 3.35 + (d.i / 56) * 5.6);
          return on > 0.01 ? <circle key={d.i} cx={d.x} cy={d.y} r={9 + (d.i % 3) * 3} fill={COL.virus} opacity={0.75 * on} /> : null;
        })}
        <text x={540} y={868} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={112} fill="#FFFFFF">
          {fmt(kNum * 10000000000)}
        </text>
        <g opacity={win(t, 9.15, 10.45, 0.3)}>
          <circle cx={540} cy={1180} r={120} fill="#EAF2FB" opacity={0.14} />
          <path
            d={`M540 1180 L540 1060 A120 120 0 ${sweep > 0.5 ? 1 : 0} 1 ${540 + 120 * Math.sin(sweep * Math.PI * 2)} ${1180 - 120 * Math.cos(sweep * Math.PI * 2)} Z`}
            fill={COL.virus}
            opacity={0.9}
          />
          <text x={540} y={1190} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#FFFFFF" opacity={ez(t, 9.6, 10.1)}>
            24 jam
          </text>
        </g>
        <g opacity={q}>
          <circle cx={540} cy={1180} r={110} fill={COL.yel} />
          <text x={540} y={1232} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={150} fill="#4A3606">?</text>
        </g>
      </g>
    </g>
  );
};

// ================= SCENE B: HIV masuk sel CD4 (13.98 - 23.4) =================
const SceneB: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 12.04, 23.5, 0.45);
  const cx = 540, cy = 860, r = 250;
  const appear = ez(t, 12.1, 13.1, back);
  const touchAng = -2.3;
  const tp = pt(cx, cy, r + 40, touchAng);
  const k1 = ez(t, 16.0, 17.8, sine);
  const vx = lerp(150, tp.x, k1), vy = lerp(470, tp.y, k1) + Math.sin(t * 3) * 6 * (1 - k1);
  const fuse = ez(t, 17.9, 19.0, sine);
  const rnaK = ez(t, 18.6, 19.9, sine);
  const glow = win(t, 17.6, 19.0, 0.3);
  return (
    <g opacity={o} transform={`translate(540 860) scale(${appear * 0.4 + 0.6}) translate(-540 -860)`}>
      <CellBody cx={cx} cy={cy} r={r} glow={glow} />
      {t > 15.9 && <Virus x={vx} y={vy} r={52} s={1 - 0.55 * fuse} op={1 - 0.2 * fuse} rot={t * 8} />}
      {rnaK > 0.01 && (
        <g opacity={clamp(rnaK * 1.5)}>
          <path d={wavePath(cx - 150, cy + 10, 300 * rnaK, 22, 0.5, t * 4)} stroke={COL.virusD} strokeWidth={11} fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

// ================= scene dalam sel (23.8 - 54.0) =================
const InsideCell: React.FC<{ t: number; o: number }> = ({ t, o }) => (
  <g opacity={o}>
    <circle cx={CX} cy={CY} r={CR + 36} fill="#8FBDF7" opacity={0.1} />
    <circle cx={CX} cy={CY} r={CR} fill="#8FBDF7" opacity={0.3} />
    <circle cx={CX} cy={NY} r={NR} fill="#5C93E0" opacity={0.55} />
  </g>
);

// 23.8 - 28.1: sel hanya membaca DNA
const SceneC1: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 23.8, 28.5, 0.4);
  const rx = ez(t, 24.0, 25.2, sine);
  return (
    <g opacity={o}>
      <path d={wavePath(180, 1000, 300, 22, 0.5, t * 3)} stroke={COL.virusD} strokeWidth={11} fill="none" strokeLinecap="round" opacity={0.95} />
      <Cross x={lerp(150, 520, 0) + 340} y={1000} s={ez(t, 25.2, 25.8, back)} />
      <Helix x0={420} y0={NY} len={240} amp={28} turns={3} a={COL.cell} b="#D6E8FC" k={ez(t, 24.6, 25.6)} />
      <Check x={540} y={NY - 130} s={ez(t, 26.4, 27.0, back)} />
    </g>
  );
};

// 28.4 - 36.4: reverse transcriptase
const SceneC2: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 28.4, 36.5, 0.4);
  const k = ez(t, 29.6, 35.6, sine);
  const x0 = lerp(-240, 550, k);
  const L = 380;
  return (
    <g opacity={o}>
      <rect x={140} y={1000} width={800} height={260} rx={36} fill="#EAF2FB" opacity={0.15} />
      <rect x={140} y={968} width={800} height={46} rx={23} fill="#EAF2FB" opacity={0.22} />
      <rect x={520} y={1000} width={40} height={260} fill="#0A1F3D" opacity={0.28} />
      <defs>
        <clipPath id="cL"><rect x={140} y={1000} width={400} height={260} /></clipPath>
        <clipPath id="cR"><rect x={540} y={1000} width={400} height={260} /></clipPath>
      </defs>
      <g clipPath="url(#cL)">
        <path d={wavePath(x0, 1130, L, 26, 0.5, t * 2)} stroke={COL.virusD} strokeWidth={13} fill="none" strokeLinecap="round" />
      </g>
      <g clipPath="url(#cR)">
        <Helix x0={x0} y0={1130} len={L} amp={30} turns={5} />
      </g>
    </g>
  );
};

// 36.6 - 45.4: integrase
const SceneC3: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 36.6, 45.5, 0.4);
  const kIn = ez(t, 37.8, 40.0, sine);
  const glow = win(t, 41.5, 45.2, 0.3) * (0.6 + 0.4 * Math.sin(t * 5));
  const vy = lerp(1190, NY, kIn);
  return (
    <g opacity={o}>
      <Helix x0={380} y0={NY} len={140} amp={26} turns={2} a={COL.cell} b="#D6E8FC" />
      <Helix x0={660} y0={NY} len={140} amp={26} turns={2} a={COL.cell} b="#D6E8FC" />
      {kIn < 0.98 && <Helix x0={520} y0={vy} len={140} amp={26} turns={2} a={COL.virus} b="#FFD9CF" />}
      {kIn >= 0.98 && (
        <>
          <circle cx={590} cy={NY} r={90} fill={COL.virus} opacity={0.35 * glow} />
          <Helix x0={520} y0={NY} len={140} amp={26} turns={2} a={COL.virusD} b="#FFB7A5" />
        </>
      )}
    </g>
  );
};

// 45.76 - 54.0: produksi virus baru
const SceneD: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 45.76, 54.3, 0.4);
  const buds = [{ x: 380, d: 0 }, { x: 540, d: 0.5 }, { x: 700, d: 1.0 }];
  const parts = Array.from({ length: 18 }, (_, i) => i);
  return (
    <g opacity={o}>
      <Helix x0={380} y0={NY} len={140} amp={26} turns={2} a={COL.cell} b="#D6E8FC" />
      <Helix x0={520} y0={NY} len={140} amp={26} turns={2} a={COL.virusD} b="#FFB7A5" />
      <Helix x0={660} y0={NY} len={140} amp={26} turns={2} a={COL.cell} b="#D6E8FC" />
      {parts.map((i) => {
        const tg = buds[i % 3];
        const st = 46.6 + i * 0.22;
        const k = ez(t, st, st + 2.2, sine);
        if (k <= 0.01 || k >= 0.995) return null;
        const sx = 540 + ((i * 37) % 160) - 80;
        const x = lerp(sx, tg.x, k), y = lerp(NY + 30, CY + CR - 30, k);
        return <circle key={i} cx={x} cy={y} r={11 + (i % 3) * 3} fill={COL.virus} opacity={0.9} />;
      })}
      {buds.map((b, i) => {
        const g = ez(t, 49.4 + b.d, 51.8 + b.d, sine);
        const det = ez(t, 52.0 + b.d * 0.5, 53.4 + b.d * 0.5, sine);
        const y = lerp(CY + CR - 14, 1345, det);
        return g > 0.01 ? <Virus key={i} x={b.x} y={y} r={54} s={g} m={lerp(0.2, 0.3, det)} /> : null;
      })}
    </g>
  );
};

// ================= SCENE E: protease (54.35 - 64.4) =================
const SceneE: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 54.35, 64.5, 0.4);
  const m = ez(t, 58.6, 61.8, sine);
  const sc = ez(t, 56.7, 57.7, out3) * (1 - ez(t, 60.0, 61.2));
  const snip = Math.abs(Math.sin(t * 7)) * 22;
  const move = ez(t, 62.6, 64.2, sine);
  return (
    <g opacity={o}>
      <Virus x={lerp(540, 450, move)} y={lerp(900, 1010, move)} r={lerp(220, 120, move)} m={m} />
      {sc > 0.01 && (
        <g opacity={sc}>
          <Scissors x={lerp(960, 650, ez(t, 56.7, 57.9, out3))} y={lerp(1240, 860, ez(t, 56.7, 57.9, out3))} rot={-55} open={snip} s={1.1} />
        </g>
      )}
      <g opacity={ez(t, 62.4, 63.0)}>
        <CellBody cx={880} cy={1180} r={120} rec={true} />
      </g>
    </g>
  );
};

// ================= SCENE F: salinan ceroboh (64.64 - 75.9) =================
const COPIES: { y: number; x: number; mark?: [number, number] }[] = [
  { x: 150, y: 780 }, { x: 570, y: 780, mark: [0.38, 0.5] },
  { x: 150, y: 920, mark: [0.62, 0.74] }, { x: 570, y: 920 },
  { x: 150, y: 1060 }, { x: 570, y: 1060, mark: [0.22, 0.34] },
];
const SceneF: React.FC<{ t: number }> = ({ t }) => {
  const oEx = win(t, 64.64, 66.4, 0.35);
  const o = win(t, 66.5, 75.9, 0.4);
  return (
    <g>
      <g opacity={oEx}>
        <circle cx={540} cy={860} r={130} fill={COL.yel} />
        <text x={540} y={918} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={170} fill="#4A3606">!</text>
      </g>
      <g opacity={o}>
        <rect x={140} y={560} width={800} height={150} rx={30} fill="#EAF2FB" opacity={0.15} />
        <rect x={140} y={540} width={800} height={34} rx={17} fill="#EAF2FB" opacity={0.22} />
        <Helix x0={200} y0={635} len={680} amp={26} turns={9} sw={7} k={ez(t, 66.8, 68.2)} />
        {COPIES.map((c, i) => {
          const st = 68.7 + i * 0.55;
          const k = ez(t, st, st + 0.7, back);
          if (k < 0.01) return null;
          return (
            <g key={i} opacity={k}>
              <rect x={c.x - 10} y={c.y - 52} width={380} height={104} rx={26} fill="#EAF2FB" opacity={0.13} />
              <Helix x0={c.x + 20} y0={c.y} len={320} amp={24} turns={4} sw={7} mark={c.mark ? [c.mark] : []} />
            </g>
          );
        })}
      </g>
    </g>
  );
};

// ================= SCENE G: seleksi (76.0 - 91.2) =================
const COLS = 6, ROWS = 8;
const GX = (c: number) => 170 + c * 148;
const GY = (r: number) => 470 + r * 112;
const dead = (i: number) => [0, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 16, 17, 19, 20, 21, 23, 24, 26, 27, 28, 30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47].includes(i);
const resist = (i: number) => [1, 8, 15, 22, 29, 4, 40, 34].includes(i);
const SceneG: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 76.0, 91.3, 0.4);
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => i);
  const sweep = ez(t, 84.8, 87.4, sine);
  const mult = ez(t, 88.4, 90.6, sine);
  return (
    <g opacity={o}>
      {cells.map((i) => {
        const c = i % COLS, r = Math.floor(i / COLS);
        const appear = ez(t, 76.1 + (i / 48) * 1.8, 76.5 + (i / 48) * 1.8, back);
        const isDead = dead(i);
        const isRes = resist(i);
        const deadK = isDead ? ez(t, 77.3 + (i % 6) * 0.2, 77.8 + (i % 6) * 0.2) : 0;
        const resK = isRes ? ez(t, 81.8 + (i % 5) * 0.25, 82.4 + (i % 5) * 0.25) : 0;
        // sapuan obat: virus biasa (bukan cacat, bukan tahan obat) memudar saat sapuan lewat barisnya
        const swept = !isDead && !isRes ? ez(sweep * ROWS, r, r + 0.8) : 0;
        // setelah obat: yang tahan obat berlipat ganda mengisi petak yang kosong
        const reborn = (swept > 0.9 || isDead) && (i % 3 !== 0) ? mult * ez(mult * 10, (i % 7), (i % 7) + 2) : 0;
        const x = GX(c), y = GY(r);
        return (
          <g key={i}>
            {isDead && deadK > 0 && <Virus x={x} y={y} r={30} s={appear} dead spikes op={deadK > 0.5 ? 0.65 * (1 - 0.8 * ez(sweep, 0.2, 0.6)) : 1} />}
            {isDead && deadK < 0.5 && <Virus x={x} y={y} r={30} s={appear} op={1 - deadK * 2} />}
            {!isDead && <Virus x={x} y={y} r={30} s={appear} halo={resK > 0.5} op={(1 - swept * 0.9)} />}
            {reborn > 0.02 && <Virus x={x} y={y} r={30} s={reborn} halo />}
          </g>
        );
      })}
      {sweep > 0.01 && sweep < 0.99 && <Capsule x={lerp(-160, 1240, sweep)} y={lerp(460, 1320, sweep)} rot={55} s={1.5} />}
    </g>
  );
};

// ================= SCENE H: ARV (91.5 - 106.3) =================
const STAGES = [
  { y: 570, name: 'reverse transcriptase', sub: 'RNA menjadi DNA' },
  { y: 790, name: 'integrase', sub: 'DNA virus masuk ke DNA sel' },
  { y: 1010, name: 'protease', sub: 'virus menjadi matang' },
];
const SceneH: React.FC<{ t: number }> = ({ t }) => {
  const o1 = win(t, 91.5, 101.0, 0.45);
  const o2 = win(t, 100.9, 106.5, 0.45);
  const vx1 = lerp(150, 790, ez(t, 102.0, 104.4, sine));
  const vx2 = lerp(150, 475, ez(t, 102.4, 104.4, sine));
  const blocked = ez(t, 104.5, 105.0);
  return (
    <g>
      <g opacity={o1}>
        {STAGES.map((s, i) => {
          const k = ez(t, 92.4 + i * 0.5, 93.2 + i * 0.5, out3);
          const sh = ez(t, 95.2 + i * 1.4, 96.0 + i * 1.4, back);
          return (
            <g key={i} opacity={k} transform={`translate(0 ${(1 - k) * 24})`}>
              <rect x={90} y={s.y - 88} width={900} height={176} rx={36} fill="#EAF2FB" opacity={0.15} />
              <text x={150} y={s.y - 8} fontFamily={FONT} fontWeight={800} fontSize={44} fill="#FFFFFF">{s.name}</text>
              <text x={150} y={s.y + 44} fontFamily={FONT} fontWeight={600} fontSize={32} fill="#CFE0F2">{s.sub}</text>
              <Shield x={870} y={s.y - 4} s={sh * 0.85} />
            </g>
          );
        })}
      </g>
      <g opacity={o2}>
        {/* 1 obat: virus tahan obat lolos */}
        <rect x={90} y={500} width={900} height={250} rx={36} fill="#EAF2FB" opacity={0.13} />
        <Shield x={540} y={625} s={0.8} broken={ez(t, 103.6, 104.0) > 0.5} />
        <Virus x={vx1} y={625} r={44} halo spikes />
        <CellBody cx={895} cy={625} r={46} rec={false} />
        {/* beberapa obat: virus tertahan */}
        <rect x={90} y={820} width={900} height={250} rx={36} fill="#EAF2FB" opacity={0.13} />
        <Shield x={400} y={945} s={0.75} />
        <Shield x={540} y={945} s={0.75} />
        <Shield x={680} y={945} s={0.75} />
        <Virus x={vx2} y={945} r={44} halo spikes op={1 - blocked * 0.6} />
        <Cross x={vx2 + 70} y={1010} s={blocked * 0.8} />
        <CellBody cx={895} cy={945} r={46} rec={false} />
      </g>
    </g>
  );
};

// ---------------- sumber data baris sheet ----------------
// referensi: isi kolom `referensi` apa adanya (baris pertama = judul panel)
const REFERENSI = `Referensi

1. Perelson, A. S., et al. (1996). HIV-1 Dynamics in Vivo: Virion Clearance Rate, Infected Cell Life-Span, and Viral Generation Time. Science, 271(5255), 1582–1586.
https://doi.org/10.1126/science.271.5255.1582

2. Jang, S., & Engelman, A. N. (2023). Capsid-host interactions for HIV-1 ingress. Microbiology and Molecular Biology Reviews.
https://doi.org/10.1128/mmbr.00048-22

3. HIV-1 assembly, budding, and maturation. (2012). Cold Spring Harbor Perspectives in Medicine.
https://doi.org/10.1101/cshperspect.a006924

4. Yeo, Y., et al. (2020). The Determination of HIV-1 RT Mutation Rate, Its Possible Allosteric Effects, and Its Implications on Drug Resistance. Viruses, 12(3), 297.
https://doi.org/10.3390/v12030297

5. NIH HIVinfo. The HIV Life Cycle.
https://hivinfo.nih.gov/understanding-hiv/fact-sheets/hiv-life-cycle`;

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

const CheckMark: React.FC = () => (
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
                  {done && <CheckMark />}
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
export const S1E4Full: React.FC = () => {
  useFonts3();
  const f = useCurrentFrame();
  const tn = f / FPS; // waktu video
  const t = WARP(tn); // waktu mp3 asli untuk animasi adegan
  const g = gradAt(t);
  const cue = CUES.find((c) => tn >= c.a - 0.05 && tn < c.b);
  const ck = cue ? Math.min(1, (tn - cue.a + 0.05) / 0.18) : 0;
  const subOn = tn < CLOSE - 0.05;
  const inside = win(t, 23.8, 54.4, 0.4);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg,${g[0]} 0%,${g[1]} 55%,${g[2]} 100%)` }}>
      <AbsoluteFill style={{ background: 'radial-gradient(760px 760px at 50% 40%, rgba(120,190,255,0.22), transparent 70%)' }} />
      {tn < CLOSE + 0.3 && (
        <AbsoluteFill style={{ transform: `scale(${settle(t)})`, transformOrigin: '50% 45%', opacity: 1 - ez(tn, CLOSE - 0.1, CLOSE + 0.4) }}>
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
            <Defs />
            <InsideCell t={t} o={inside} />
            <SceneA t={t} />
            <SceneB t={t} />
            <SceneC1 t={t} />
            <SceneC2 t={t} />
            <SceneC3 t={t} />
            <SceneD t={t} />
            <SceneE t={t} />
            <SceneF t={t} />
            <SceneG t={t} />
            <SceneH t={t} />
          </svg>
          <Pills t={t} />
          {LEGENDS.map((l, i) => (
            <LegendBox key={i} t={t} a={l.a} b={l.b} items={l.items} />
          ))}
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={tn} />
      <Audio src={staticFile('vo/S1E4.mp3')} />
    </AbsoluteFill>
  );
};
