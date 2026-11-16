import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, in3, sine, back } from '../motion';
import { CUES, CLOSE, WARP, EP_DUR } from './timeline';
import { COL, Defs, Helix, CellBody, Virus, Check, Cross } from '../ep3/shapes';
import { Tube, Glass, Lake, VDot, Person, rnd, lakePoint, WATER_CLEAR } from './shapes';

export const S1E6_FRAMES = Math.ceil(EP_DUR * FPS);
const OLD_CLOSE = 77.64; // waktu mp3 asli saat kalimat penutup mulai (animasi memakai waktu mp3 asli lewat WARP)

const useFonts6 = () => {
  const [handle] = React.useState(() => delayRender('fonts6'));
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
type Grad = [string, string, string];
const GRADS: { t: number; c: Grad }[] = [
  { t: 0, c: ['#0A1F3D', '#123A60', '#17506F'] },
  { t: 8.0, c: ['#082C3A', '#0E5A63', '#1C8A85'] },
  { t: 16.19, c: ['#0D1B45', '#1E2F6B', '#2B4A85'] },
  { t: 31.87, c: ['#14183F', '#2A2A6B', '#3B4A8A'] },
  { t: 38.34, c: ['#0A1F3D', '#123A60', '#17506F'] },
  { t: 50.92, c: ['#0D1B45', '#1E2F6B', '#2B4A85'] },
  { t: 56.22, c: ['#082C3A', '#0E5A63', '#1C8A85'] },
  { t: 60.97, c: ['#08283A', '#0F4A5C', '#167A80'] },
  { t: 68.79, c: ['#0A1F3D', '#123A60', '#17506F'] },
  { t: OLD_CLOSE, c: ['#0A1830', '#12294F', '#1B3E63'] },
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
const SETTLE = [8.02, 16.19, 31.87, 38.34, 50.92, 60.97, 68.79, OLD_CLOSE];
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
  { a: 0.5, b: 3.5, text: 'virus HIV', k: 'virus', x: 540, y: 520, size: 52 },
  { a: 1.9, b: 3.5, text: 'terlalu kecil', k: 'gray', x: 540, y: 620, size: 42 },
  { a: 4.7, b: 7.5, text: 'satu tabung darah', k: 'neutral', x: 540, y: 560, size: 46 },
  { a: 8.5, b: 11.3, text: 'kekeruhan = jumlah virus', k: 'neutral', x: 540, y: 640, size: 38 },
  { a: 12.0, b: 13.8, text: 'seluruh danau', k: 'gray', x: 540, y: 640, size: 46 },
  { a: 14.3, b: 15.9, text: 'satu gelas', k: 'neutral', x: 540, y: 640, size: 50 },
  { a: 19.6, b: 21.8, text: 'cairan bening', k: 'neutral', x: 540, y: 590, size: 48 },
  { a: 22.4, b: 23.7, text: 'jejak genetik virus', k: 'virus', x: 680, y: 800, size: 40 },
  { a: 24.0, b: 26.7, text: 'digandakan', k: 'rt', x: 680, y: 800, size: 44 },
  { a: 28.3, b: 31.4, text: 'salinan virus', k: 'virus', x: 540, y: 1290, size: 46 },
  { a: 28.8, b: 31.4, text: 'per mililiter darah', k: 'neutral', x: 540, y: 1375, size: 38 },
  { a: 32.2, b: 35.0, text: 'sedikit salinan', k: 'gray', x: 300, y: 1260, size: 38 },
  { a: 33.6, b: 37.7, text: 'banyak salinan', k: 'virus', x: 780, y: 1260, size: 38 },
  { a: 35.1, b: 36.2, text: 'tanpa obat', k: 'gray', x: 540, y: 640, size: 46 },
  { a: 36.0, b: 37.8, text: 'puluhan ribu atau lebih', k: 'recep', x: 540, y: 640, size: 42 },
  { a: 39.5, b: 44.6, text: '180 orang', k: 'neutral', x: 540, y: 660, size: 46 },
  { a: 42.0, b: 44.7, text: 'lebih dari 10 tahun', k: 'gray', x: 540, y: 1375, size: 38 },
  { a: 46.0, b: 50.4, text: 'lebih jitu meramalkan', k: 'recep', x: 540, y: 640, size: 46 },
  { a: 46.8, b: 50.4, text: 'viral load', k: 'virus', x: 405, y: 1375, size: 42 },
  { a: 47.0, b: 50.4, text: 'CD4', k: 'cell', x: 675, y: 1375, size: 42 },
  { a: 51.3, b: 55.6, text: 'virus beredar', k: 'virus', x: 290, y: 1290, size: 40 },
  { a: 53.9, b: 55.7, text: 'virus di dalam sel', k: 'gray', x: 770, y: 1290, size: 40 },
  { a: 56.6, b: 60.4, text: 'potret sebagian', k: 'recep', x: 370, y: 790, size: 44 },
  { a: 59.3, b: 60.6, text: 'bukan seluruh danau', k: 'gray', x: 540, y: 1330, size: 44 },
  { a: 61.1, b: 62.7, text: 'viral load', k: 'virus', x: 330, y: 700, size: 46 },
  { a: 63.2, b: 68.4, text: 'ARV mulai', k: 'rt', x: 368, y: 690, size: 40 },
  { a: 65.2, b: 68.4, text: 'batas alat', k: 'recep', x: 800, y: 1185, size: 36 },
  { a: 66.6, b: 68.5, text: 'tidak terdeteksi', k: 'rt', x: 700, y: 1390, size: 42 },
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
  { a: 5.6, b: 10.2, items: [[COL.virus, 'Virus HIV']] },
  { a: 51.2, b: 55.6, items: [[COL.virus, 'Virus HIV'], [COL.cell, 'Sel CD4']] },
];

// ---------------- subtitle ----------------
const ACC: Record<string, string> = {
  cd4: '#8FBDF7', hiv: '#FFB7A5', virus: '#FFB7A5', virusnya: '#FFB7A5', viral: '#FFB7A5', load: '#FFB7A5', salinan: '#FFB7A5',
  arv: '#72E3D3', obat: '#72E3D3', '1996': '#F4D77E', '180': '#F4D77E',
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

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

// ================= SCENE AB: virus terlalu kecil -> kaca pembesar di tabung darah (0 - 8.0) =================
const SWARM = Array.from({ length: 90 }, (_, i) => {
  const a = rnd(i) * Math.PI * 2;
  const rr = Math.sqrt(rnd(i, 1)) * 300;
  return { x: 540 + Math.cos(a) * rr, y: 900 + Math.sin(a) * rr * 0.9, i };
});
const LENS_R = 190;
const LENS_DOTS = (() => {
  const out: { x: number; y: number; r: number; i: number }[] = [];
  for (let i = 0; out.length < 34 && i < 400; i++) {
    const x = (rnd(i, 21) - 0.5) * 250, y = (rnd(i, 22) - 0.5) * 2 * (LENS_R - 30);
    if (Math.hypot(x, y) < LENS_R - 32) out.push({ x, y, r: 12 + rnd(i, 23) * 6, i: out.length });
  }
  return out;
})();
const SceneAB: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 0, 7.98, 0.45);
  const shrink = ez(t, 0.3, 1.4, sine);
  const qK = ez(t, 2.4, 3.0, back) * (1 - ez(t, 3.7, 4.1));
  const tubeK = ez(t, 3.9, 4.6, out3);
  const lensK = ez(t, 4.7, 5.6, out3);
  const lx = lerp(540 + 300, 540, lensK), ly = lerp(1010 - 260, 1010, lensK);
  return (
    <g opacity={o}>
      {t < 1.6 && <Virus x={540} y={900} r={90} s={1 - 0.9 * shrink} op={1 - ez(t, 1.1, 1.6)} />}
      <g opacity={qK} transform={`translate(0 ${(1 - qK) * 14})`}>
        <circle cx={540} cy={1300} r={74} fill={COL.yel} />
        <text x={540} y={1348} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={120} fill="#4A3606">?</text>
      </g>
      <g opacity={tubeK}>
        <Tube x={540} y={1010} s={1.5} sep={0} />
      </g>
      {lensK > 0.01 && (
        <g transform={`translate(${lx} ${ly})`} opacity={lensK}>
          <g transform="rotate(48)">
            <rect x={LENS_R + 6} y={-24} width={170} height={48} rx={24} fill="#F4D77E" />
          </g>
          <circle r={LENS_R + 18} fill="#EAF2FB" />
          <circle r={LENS_R} fill="#12304F" opacity={0.92} />
          <clipPath id="lensClip">
            <circle r={LENS_R} />
          </clipPath>
          <g clipPath="url(#lensClip)">
            <rect x={-150} y={-LENS_R} width={300} height={LENS_R * 2} fill="#E4566B" />
            <rect x={-118} y={-LENS_R} width={26} height={LENS_R * 2} fill="#FFFFFF" opacity={0.2} />
            {LENS_DOTS.map((d) => {
              const on = ez(t, 5.6 + (d.i / 34) * 1.4, 5.95 + (d.i / 34) * 1.4, back);
              return on > 0.01 ? <VDot key={d.i} x={d.x + Math.sin(t * 3 + d.i) * 4} y={d.y + Math.cos(t * 2.6 + d.i) * 4} r={d.r * on} /> : null;
            })}
          </g>
          <path d={`M${-LENS_R * 0.7} ${-LENS_R * 0.35} A${LENS_R * 0.78} ${LENS_R * 0.78} 0 0 1 ${-LENS_R * 0.3} ${-LENS_R * 0.72}`} stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={12} strokeLinecap="round" fill="none" />
        </g>
      )}
    </g>
  );
};

// ================= SCENE C: danau & satu gelas (8.0 - 16.2) =================
const LAKE_DOTS = Array.from({ length: 70 }, (_, i) => {
  const p = lakePoint(540, 980, 520, 250, rnd(i, 3) * Math.PI * 2, Math.sqrt(rnd(i, 4)) * 0.9);
  return { x: p.x, y: p.y, i };
});
const GLASS_DOTS = Array.from({ length: 16 }, (_, i) => ({ x: (rnd(i, 5) - 0.5) * 100, y: -10 + rnd(i, 6) * 90, i }));
const SceneC: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 8.0, 16.1, 0.45);
  const appear = ez(t, 8.1, 9.2, back);
  const k1 = ez(t, 14.0, 14.8, sine);
  const fill = ez(t, 14.6, 15.3);
  const k2 = ez(t, 15.3, 16.1, sine);
  const gx = k2 > 0 ? lerp(420, 540, k2) : lerp(160, 420, k1);
  const gy = k2 > 0 ? lerp(960, 1010, k2) : lerp(500, 960, k1);
  const gs = lerp(1.3, 1.9, k2);
  const lakeOp = 1 - 0.7 * ez(t, 15.2, 15.9);
  // "mengukur seluruh danau": seluruh permukaan danau menyala bergelombang, lalu tanda silang
  const glow = ez(t, 11.9, 12.5) * (1 - ez(t, 13.3, 13.8)) * (0.6 + 0.4 * Math.sin(t * 7));
  const crossK = ez(t, 12.9, 13.5, back) * (1 - ez(t, 13.7, 14.0));
  return (
    <g opacity={o} transform={`translate(540 980) scale(${0.85 + 0.15 * appear}) translate(-540 -980)`}>
      <g opacity={lakeOp}>
        <Lake cx={540} cy={980} rx={520} ry={250} t={t} glow={glow} />
        {LAKE_DOTS.map((d) => {
          const on = ez(t, 8.6 + (d.i / 70) * 1.8, 9.0 + (d.i / 70) * 1.8);
          return on > 0.01 ? <VDot key={d.i} x={d.x + Math.sin(t * 2 + d.i) * 4} y={d.y + Math.cos(t * 1.7 + d.i) * 3} r={8} op={0.9 * on} /> : null;
        })}
      </g>
      {crossK > 0.01 && <Cross x={540} y={980} s={crossK * 1.6} />}
      {t > 13.9 && (
        <Glass x={gx} y={gy} s={gs} level={0.82 * fill} water={WATER_CLEAR}>
          {GLASS_DOTS.map((d) => (
            <VDot key={d.i} x={d.x} y={d.y} r={7} op={fill > 0.5 ? 1 : 0} />
          ))}
        </Glass>
      )}
    </g>
  );
};

// ================= SCENE D: tiga langkah (16.19 - 31.6) =================
const MINI: { x: number; y: number }[] = Array.from({ length: 8 }, (_, i) => ({ x: 395 + (i % 4) * 150, y: 1010 + Math.floor(i / 4) * 150 }));
const BOX_DOTS = Array.from({ length: 64 }, (_, i) => ({ x: 340 + 12 + rnd(i, 7) * 396, y: 810 + 12 + rnd(i, 8) * 396, i }));
const SceneD: React.FC<{ t: number }> = ({ t }) => {
  // tabung: tengah (langkah 1) -> kiri (langkah 2) -> hilang
  const tubeOp = win(t, 16.2, 27.6, 0.4);
  const mv = ez(t, 21.6, 22.6, sine);
  const tx = lerp(540, 200, mv), ty = lerp(1000, 1180, mv), ts = lerp(1.7, 0.9, mv);
  const spin = win(t, 18.4, 20.8, 0.3);
  const rot = 6 * Math.sin(t * 16) * spin;
  const sep = ez(t, 18.6, 21.0);
  // langkah 2: mesin penggandaan
  const oCard = win(t, 21.85, 27.3, 0.4);
  const copies = t < 22.8 ? 0 : t < 23.9 ? 1 : t < 24.8 ? 2 : t < 25.7 ? 4 : 8;
  // langkah 3: kotak 1 mL
  const oBox = win(t, 27.25, 31.7, 0.4);
  return (
    <g>
      <g opacity={tubeOp}>
        <Tube x={tx} y={ty} s={ts} sep={sep} rot={rot} />
      </g>
      <g opacity={oCard}>
        <rect x={350} y={900} width={640} height={400} rx={40} fill="#EAF2FB" opacity={0.14} />
        {MINI.map((m, i) => {
          if (i >= copies) return null;
          const born = i === 0 ? 22.4 : i === 1 ? 23.6 : i < 4 ? 24.6 : 25.5;
          const kk = ez(t, born, born + 0.7, back);
          return (
            <g key={i} transform={`translate(${m.x} ${m.y}) scale(${kk}) translate(${-m.x} ${-m.y})`}>
              <Helix x0={m.x} y0={m.y} len={120} amp={16} turns={2} sw={7} a={COL.virusD} b="#FFB7A5" />
            </g>
          );
        })}
      </g>
      <g opacity={oBox}>
        <rect x={340} y={810} width={420} height={420} rx={36} fill="#EAF2FB" opacity={0.16} />
        {BOX_DOTS.map((d) => {
          const on = ez(t, 28.4 + (d.i / 64) * 2.6, 28.7 + (d.i / 64) * 2.6, back);
          return on > 0.01 ? <VDot key={d.i} x={d.x + Math.sin(t * 5 + d.i) * 2} y={d.y} r={9 * on} /> : null;
        })}
        <text x={550} y={770} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={60} fill="#FFFFFF" opacity={ez(t, 28.0, 28.6)}>1 mL</text>
      </g>
    </g>
  );
};

// ================= SCENE E: sedikit vs banyak salinan (31.87 - 38.1) =================
const FEW = Array.from({ length: 7 }, (_, i) => ({ x: 120 + 14 + rnd(i, 9) * 332, y: 820 + 14 + rnd(i, 10) * 332, i }));
const MANY = Array.from({ length: 84 }, (_, i) => ({ x: 600 + 14 + rnd(i, 11) * 332, y: 820 + 14 + rnd(i, 12) * 332, i }));
const SceneE: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 31.87, 38.2, 0.45);
  const glow = win(t, 35.1, 37.8, 0.4) * (0.55 + 0.45 * Math.sin(t * 5));
  return (
    <g opacity={o}>
      <rect x={120} y={820} width={360} height={360} rx={36} fill="#EAF2FB" opacity={0.16} />
      <rect x={600} y={820} width={360} height={360} rx={36} fill="#EAF2FB" opacity={0.16} />
      <rect x={600} y={820} width={360} height={360} rx={36} fill={COL.virus} opacity={0.22 * glow} />
      {FEW.map((d) => {
        const on = ez(t, 32.2 + d.i * 0.08, 32.6 + d.i * 0.08, back);
        return on > 0.01 ? <VDot key={d.i} x={d.x + Math.sin(t * 2 + d.i) * 2} y={d.y} r={9 * on} /> : null;
      })}
      {MANY.map((d) => {
        const on = ez(t, 32.4 + (d.i / 84) * 2.0, 32.7 + (d.i / 84) * 2.0, back);
        return on > 0.01 ? <VDot key={d.i} x={d.x + Math.sin(t * 8 + d.i) * 5} y={d.y + Math.cos(t * 7 + d.i) * 5} r={9 * on} /> : null;
      })}
    </g>
  );
};

// ================= SCENE F: studi 1996 (38.34 - 50.6) =================
const COLS = 18;
const SceneF: React.FC<{ t: number }> = ({ t }) => {
  const o1 = win(t, 38.34, 45.0, 0.45);
  const o2 = win(t, 44.9, 50.6, 0.45);
  const prog = ez(t, 41.6, 44.5, sine);
  const bV = ez(t, 46.0, 48.2, out3);
  const bC = ez(t, 46.3, 48.0, out3);
  return (
    <g>
      <g opacity={o1}>
        <text x={540} y={545} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={130} fill="#FFFFFF" opacity={ez(t, 38.4, 39.2)}>1996</text>
        {Array.from({ length: 180 }, (_, i) => {
          const c = i % COLS, r = Math.floor(i / COLS);
          const on = ez(t, 39.2 + i * 0.016, 39.5 + i * 0.016, back);
          return on > 0.01 ? <Person key={i} x={115 + c * 50} y={730 + r * 54} r={11 * on} op={on} c={c % 5 === 0 && r % 3 === 0 ? '#8FBDF7' : '#CFE0F2'} /> : null;
        })}
        <rect x={140} y={1305} width={800} height={18} rx={9} fill="#EAF2FB" opacity={0.2} />
        <rect x={140} y={1305} width={800 * prog} height={18} rx={9} fill={COL.rt} />
      </g>
      <g opacity={o2}>
        <rect x={250} y={1300 - 560 * bV} width={170} height={560 * bV} rx={20} fill={COL.virus} />
        <rect x={520} y={1300 - 280 * bC} width={170} height={280 * bC} rx={20} fill={COL.cell} />
        <Check x={335} y={1300 - 560 * bV - 70} s={ez(t, 48.3, 48.9, back)} />
      </g>
    </g>
  );
};

// ================= SCENE G: gelas vs sel, potret sebagian (50.92 - 60.8) =================
const FLOAT = Array.from({ length: 9 }, (_, i) => ({ x: (rnd(i, 13) - 0.5) * 110, y: -5 + rnd(i, 14) * 90, i }));
const HIDDEN = [0.15, 0.85, 5.6].map((a) => lakePoint(540, 1030, 520, 250, a, 0.7));
const FRAME = { x: 170, y: 880, w: 400, h: 250 };
const Corner: React.FC<{ x: number; y: number; sx: number; sy: number }> = ({ x, y, sx, sy }) => (
  <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
    <rect x={0} y={0} width={84} height={14} rx={7} fill="#FFFFFF" />
    <rect x={0} y={0} width={14} height={84} rx={7} fill="#FFFFFF" />
  </g>
);
const SceneG: React.FC<{ t: number }> = ({ t }) => {
  const o1 = win(t, 50.92, 56.0, 0.45);
  const o2 = win(t, 56.0, 60.9, 0.45);
  const frameK = ez(t, 56.6, 57.6, back);
  const flash = ez(t, 58.35, 58.5) * (1 - ez(t, 58.5, 59.1));
  const dim = ez(t, 58.6, 59.2) * 0.38;
  const { x: fx, y: fy, w: fw, h: fh } = FRAME;
  return (
    <g>
      <g opacity={o1}>
        <Glass x={290} y={1040} s={1.5} level={0.82} water={WATER_CLEAR}>
          {FLOAT.map((d) => (
            <VDot key={d.i} x={d.x + Math.sin(t * 2 + d.i) * 6} y={d.y + Math.cos(t * 1.8 + d.i) * 5} r={7} />
          ))}
        </Glass>
        <CellBody cx={770} cy={1040} r={170} rec />
        <Virus x={770} y={1040} r={46} halo />
        <Check x={290} y={800} s={ez(t, 52.0, 52.6, back)} />
        <Cross x={770} y={800} s={ez(t, 54.1, 54.7, back)} />
      </g>
      <g opacity={o2}>
        <Lake cx={540} cy={1030} rx={520} ry={250} t={t} />
        {HIDDEN.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={46} fill="#DCEBFF" opacity={0.95} />
            <VDot x={p.x} y={p.y} r={14} />
          </g>
        ))}
        {Array.from({ length: 34 }, (_, i) => {
          const p = lakePoint(540, 1030, 520, 250, rnd(i, 15) * Math.PI * 2, Math.sqrt(rnd(i, 16)) * 0.92);
          return <VDot key={i} x={p.x} y={p.y} r={7} op={0.85} />;
        })}
        {dim > 0.01 && (
          <path d={`M0 0H1080V1920H0Z M${fx} ${fy}V${fy + fh}H${fx + fw}V${fy}Z`} fill="#000000" opacity={dim} fillRule="evenodd" />
        )}
        <g opacity={frameK} transform={`translate(${fx + fw / 2} ${fy + fh / 2}) scale(${1.12 - 0.12 * frameK}) translate(${-(fx + fw / 2)} ${-(fy + fh / 2)})`}>
          <Corner x={fx} y={fy} sx={1} sy={1} />
          <Corner x={fx + fw} y={fy} sx={-1} sy={1} />
          <Corner x={fx} y={fy + fh} sx={1} sy={-1} />
          <Corner x={fx + fw} y={fy + fh} sx={-1} sy={-1} />
          <rect x={fx + fw / 2 - 22} y={fy + fh / 2 - 3} width={44} height={6} rx={3} fill="#FFFFFF" opacity={0.8} />
          <rect x={fx + fw / 2 - 3} y={fy + fh / 2 - 22} width={6} height={44} rx={3} fill="#FFFFFF" opacity={0.8} />
        </g>
        {flash > 0.01 && (
          <>
            <rect x={-40} y={-40} width={1160} height={2000} fill="#FFFFFF" opacity={0.85 * flash} />
            <circle cx={fx + fw / 2} cy={fy + fh / 2} r={520 * (0.4 + 0.6 * flash)} fill="#FFFFFF" opacity={0.5 * flash} />
          </>
        )}
      </g>
    </g>
  );
};

// ================= SCENE H: grafik viral load turun (60.97 - 68.6) =================
const AX0 = 150, AX1 = 930, AYB = 1330, AYT = 700, THR = 1235, U0 = 0.28;
const curveY = (u: number) => (u < U0 ? 800 + 16 * Math.sin(u * 40) : 1290 - 490 * Math.exp(-(u - U0) * 9));
const SceneH: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 60.97, 68.7, 0.45);
  const ud = ez(t, 61.3, 67.7, (x) => x);
  let d = '';
  const n = Math.round(160 * ud);
  for (let i = 0; i <= n; i++) {
    const u = i / 160;
    d += (i ? 'L' : 'M') + (AX0 + (AX1 - AX0) * u).toFixed(1) + ' ' + curveY(u).toFixed(1) + ' ';
  }
  const hx = AX0 + (AX1 - AX0) * ud, hy = curveY(ud);
  const arv = ez(t, 63.1, 63.8);
  return (
    <g opacity={o}>
      <line x1={AX0} y1={AYB} x2={AX1} y2={AYB} stroke="#E8F0FA" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      <line x1={AX0} y1={AYT} x2={AX0} y2={AYB} stroke="#E8F0FA" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      <line x1={AX0} y1={THR} x2={AX1} y2={THR} stroke="#F4D77E" strokeWidth={5} strokeDasharray="16 14" opacity={ez(t, 65.0, 65.8)} />
      <line x1={AX0 + (AX1 - AX0) * U0} y1={AYT + 40} x2={AX0 + (AX1 - AX0) * U0} y2={AYB} stroke={COL.rt} strokeWidth={5} strokeDasharray="10 12" opacity={0.8 * arv} />
      {n > 1 && <path d={d} fill="none" stroke="#FF6B4D" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />}
      {n > 1 && <circle cx={hx} cy={hy} r={15} fill="#FF6B4D" />}
    </g>
  );
};

// ================= SCENE I: kembali ke gelas (68.79 - akhir kalimat terakhir) =================
const SceneI: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, 68.79, 78.2, 0.4);
  // "makin keruh atau makin jernih": virus bertambah (keruh) lalu menghilang (jernih)
  const more = ez(t, 72.6, 74.2);
  const clear = ez(t, 75.0, 77.0);
  const dotOp = 1 - clear;
  return (
    <g opacity={o}>
      {SWARM.map((d) => {
        const on = ez(t, 69.0 + (d.i / 90) * 1.4, 69.3 + (d.i / 90) * 1.4);
        return on > 0.01 ? <VDot key={d.i} x={d.x + Math.sin(t * 3 + d.i) * 5} y={d.y - 60 + Math.cos(t * 2.5 + d.i) * 5} r={6} op={0.65 * on * dotOp} /> : null;
      })}
      <Glass x={540} y={1180} s={1.6} level={0.82} water={WATER_CLEAR}>
        {FLOAT.map((d) => (
          <VDot key={d.i} x={d.x} y={d.y} r={6} op={dotOp} />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <VDot key={'m' + i} x={(rnd(i, 31) - 0.5) * 110} y={-10 + rnd(i, 32) * 90} r={6} op={more * dotOp} />
        ))}
      </Glass>
    </g>
  );
};

const REFERENSI = `Referensi

1. Mellors JW et al. (1996). Prognosis in HIV-1 infection predicted by the quantity of virus in plasma. Science. 272(5265), 1167-1170.
https://doi.org/10.1126/science.272.5265.1167

2. Palmer S et al. (2003). New real-time reverse transcriptase-initiated PCR assay with single-copy sensitivity for human immunodeficiency virus type 1 RNA in plasma. J Clin Microbiol. 41(10), 4531-4536.
https://doi.org/10.1128/JCM.41.10.4531-4536.2003

3. World Health Organization (2023). The role of HIV viral suppression in improving individual health and reducing transmission: policy brief.
https://www.who.int/publications/i/item/9789240055179

4. Kementerian Kesehatan RI (2019). Keputusan Menteri Kesehatan RI Nomor HK.01.07/MENKES/90/2019 tentang Pedoman Nasional Pelayanan Kedokteran Tata Laksana HIV.`;

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
export const S1E6Full: React.FC = () => {
  useFonts6();
  const f = useCurrentFrame();
  const tn = f / FPS; // waktu video
  const t = WARP(tn); // waktu mp3 asli untuk animasi adegan
  const g = gradAt(t);
  const cue = CUES.find((c) => tn >= c.a - 0.05 && tn < c.b);
  const ck = cue ? Math.min(1, (tn - cue.a + 0.05) / 0.18) : 0;
  const subOn = tn < CLOSE - 0.05;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg,${g[0]} 0%,${g[1]} 55%,${g[2]} 100%)` }}>
      <AbsoluteFill style={{ background: 'radial-gradient(760px 760px at 50% 40%, rgba(120,190,255,0.22), transparent 70%)' }} />
      {tn < CLOSE + 0.3 && (
        <AbsoluteFill style={{ transform: `scale(${settle(t)})`, transformOrigin: '50% 45%', opacity: 1 - ez(tn, CLOSE - 0.1, CLOSE + 0.5) }}>
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
            <Defs />
            <SceneAB t={t} />
            <SceneC t={t} />
            <SceneD t={t} />
            <SceneE t={t} />
            <SceneF t={t} />
            <SceneG t={t} />
            <SceneH t={t} />
            <SceneI t={t} />
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
    </AbsoluteFill>
  );
};
