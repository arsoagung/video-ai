import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL } from '../shared/shapes';
import { Actor, ActorSide, POSES_SIDE } from '../shared/actor';
import type { ActorRole, Pose, SidePose } from '../shared/actor';
import { CUES, CLOSE, SCENE_T, T, TE, CL, EP_DUR } from './timeline';

export const S2E6ALT_FRAMES = Math.ceil(EP_DUR * FPS);

const useFonts = () => {
  const [handle] = React.useState(() => delayRender('fontsArv'));
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


// ---------------- sumber data baris sheet ----------------
// referensi: isi kolom `referensi` apa adanya (baris pertama = judul panel)
const REFERENSI = `Referensi

1. Rodger AJ et al. (2019). Risk of HIV transmission through condomless sex in serodifferent gay couples with the HIV-positive partner taking suppressive antiretroviral therapy (PARTNER): final results of a multicentre, prospective, observational study. Lancet. 393(10189), 2428-2438.
https://doi.org/10.1016/S0140-6736(19)30418-0

2. Cohen MS et al. (2016). Antiretroviral therapy for the prevention of HIV-1 transmission. N Engl J Med. 375(9), 830-839.
https://doi.org/10.1056/NEJMoa1600693

3. Bavinton BR et al. (2018). Viral suppression and HIV transmission in serodiscordant male couples: an international, prospective, observational, cohort study. Lancet HIV. 5(8), e438-e447.
https://doi.org/10.1016/S2352-3018(18)30132-2

4. World Health Organization (2023). The role of HIV viral suppression in improving individual health and reducing transmission: policy brief.
https://www.who.int/publications/i/item/9789240055179

5. CDC (2023). HIV Treatment Is HIV Prevention (consumer info sheet).
https://www.cdc.gov/hiv/resourcelibrary/infosheets/cdc-hiv-consumer-info-sheet-treatment-2023-508.pdf`;

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
type Grad = [string, string, string];
const CLOSE_GRAD: Grad = ['#0A2540', '#0F3B66', '#0B4F63'];
const B1: Grad = ['#0A1F3D', '#123A60', '#17506F']; // biru laut
const B2: Grad = ['#0D1B45', '#1E2F6B', '#2B4A85']; // biru tua
const B3: Grad = ['#14183F', '#2A2A6B', '#3B4A8A']; // indigo
const B4: Grad = ['#08283A', '#0F4A5C', '#167A80']; // teal
const BG: Grad[] = [B1, B4, B2, B3, B2, B4, B3, B1, B2, B4];

const GRADS: { t: number; c: Grad }[] = [...BG.map((c, i) => ({ t: SCENE_T[i], c })), { t: CLOSE, c: CLOSE_GRAD }];
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
const settle = (t: number) => {
  let z = 0;
  for (const T of [...SCENE_T]) if (t >= T) z += 0.03 * (1 - ez(t, T, T + 1.0, out3));
  return 1 + z;
};

// ---------------- pill & label ----------------
const PK = {
  virus: { bg: '#FF9C85', fg: '#3B1308' },
  cell: { bg: '#8FBDF7', fg: '#0E2A52' },
  recep: { bg: '#F4D77E', fg: '#4A3606' },
  arv: { bg: '#72E3D3', fg: '#063F38' },
  neutral: { bg: '#EAF2FB', fg: '#12304F' },
  gray: { bg: '#B9C3D0', fg: '#1D2A3A' },
  imun: { bg: '#B9A2F5', fg: '#26104F' },
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

// pill versi SVG (dipakai di dalam adegan SVG)
const SvgPill: React.FC<{ x: number; y: number; text: string; k: KK; size?: number; op: number }> = ({ x, y, text, k, size = 36, op }) => {
  if (op < 0.01) return null;
  const w = pillW(text, size);
  const h = size * 1.9;
  const cx = Math.max(36 + w / 2, Math.min(1080 - 36 - w / 2, x));
  return (
    <g transform={`translate(${cx} ${y}) scale(${0.88 + 0.12 * op})`} opacity={op} style={{ filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.28))' }}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={PK[k].bg} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={PK[k].fg}>{text}</text>
    </g>
  );
};

// legenda kontekstual (hanya visual abstrak): pill kecil di y=250, titik warna + label, maks 3 item
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
// ---------------- subtitle (narasi_final persis) ----------------
const ACC: Record<string, string> = {
  cd4: '#8FBDF7', hiv: '#FFB7A5', viral: '#FFB7A5', load: '#FFB7A5', virus: '#FFB7A5', rna: '#FFB7A5', arv: '#72E3D3', obat: '#72E3D3',
  reverse: '#72E3D3', transcriptase: '#72E3D3', integrase: '#72E3D3', protease: '#72E3D3', dolutegravir: '#72E3D3',
  odhiv: '#FFB7A5', prep: '#86D0F5', nrti: '#72E3D3', nnrti: '#72E3D3', pep: '#72E3D3', tld: '#72E3D3',
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



const KAMU = '#B9A2F5'; // tokoh "kamu" (peran sama sepanjang episode)
const PAS = '#7ED6A8'; // pasangan
const GRP = ['#F4D77E', '#7ED6A8', '#8FBDF7'];
const Virus: React.FC<{ x: number; y: number; r: number; dim?: number; t: number; seed?: number }> = ({ x, y, r, dim = 1, t, seed = 0 }) =>
  r < 2 || dim < 0.01 ? null : <FlatVirus cx={x} cy={y} r={r} dim={dim} rot={t * 5 + seed * 40} />;
const pr = (t: number, a: number, b: number, e: (x: number) => number = out3) => ez(t, a, b, e);
const pop = (t: number, a: number, d = 0.4) => pr(t, a, a + d, back);

const SceneWrap: React.FC<{ i: number; t: number; children: React.ReactNode }> = ({ i, t, children }) => {
  const o = win(t, SCENE_T[i], SCENE_T[i + 1] + 0.25, 0.45);
  if (o < 0.005) return null;
  return <g opacity={o}>{children}</g>;
};

// ================= komponen kecil episode ini =================
const YEL = '#F4D77E';
const MICRO = '#C7A6E8';
const SvgTxt: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; op?: number }> = ({ x, y, text, size = 40, color = '#EAF2FB', op = 1 }) =>
  op < 0.01 ? null : (
    <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={color} opacity={op}>{text}</text>
  );
// virus di dada orang dengan HIV: lensa bening berisi FlatVirus; vr = jari-jari virus (mengecil saat ARV bekerja, tidak pernah hilang)
const Lens2: React.FC<{ x: number; y: number; vr: number; k?: number; t: number; glow?: number; ls?: number }> = ({ x, y, vr, k = 1, t, glow = 0, ls = 1 }) =>
  k < 0.02 ? null : (
    <g opacity={k}>
      <circle cx={x} cy={y} r={(60 + 60 * glow) * ls} fill="#72E3D3" opacity={0.4 * (1 - glow)} />
      <circle cx={x} cy={y} r={60 * ls} fill="#fff" opacity={0.28} />
      <FlatVirus cx={x} cy={y} r={vr} rot={t * 14} />
    </g>
  );
const Arrow2: React.FC<{ x1: number; x2: number; y: number; color?: string; op?: number }> = ({ x1, x2, y, color = '#EAF2FB', op = 1 }) =>
  op < 0.01 ? null : (
    <g opacity={op}>
      <line x1={x1} y1={y} x2={x2 - 26} y2={y} stroke={color} strokeWidth={14} strokeLinecap="round" />
      <polygon points={`${x2},${y} ${x2 - 42},${y - 30} ${x2 - 42},${y + 30}`} fill={color} />
    </g>
  );
const MiniCouple: React.FC<{ x: number; y: number; k: number; ok: number }> = ({ x, y, k, ok }) =>
  k < 0.02 ? null : (
    <g opacity={k}>
      <circle cx={x} cy={y} r={58 * k} fill="#72E3D3" opacity={0.3 * ok} />
      <Fr x={x - 24} gy={y + 52} s={0.145 * k} role="blue" />
      <Fr x={x + 24} gy={y + 52} s={0.145 * k} role="yellow" />
    </g>
  );

// ---- karakter modular (src/shared/actor.tsx): peran blue = kamu, yellow = pasangan (orang dengan HIV), teal = masyarakat ----
type J3 = [number, number, number];
const mj = (a: J3, b: J3, k: number): J3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const Fr: React.FC<{ x: number; gy: number; s: number; role: ActorRole; pose?: Pose; op?: number }> = ({ x, gy, s, role, pose, op = 1 }) =>
  op < 0.005 || s < 0.01 ? null : <Actor cx={x} cy={gy - 354 * s} s={s} role={role} pose={pose} op={op} />;
const Sd: React.FC<{ x: number; gy: number; s: number; role: ActorRole; pose?: SidePose; op?: number }> = ({ x, gy, s, role, pose, op = 1 }) =>
  op < 0.005 || s < 0.01 ? null : <ActorSide cx={x} cy={gy - 354 * s} s={s} role={role} pose={pose} op={op} />;
// pelukan: lengan sisi dalam melingkar ke arah pasangan, kepala saling condong (k 0..1). dir = +1 untuk tokoh di kiri layar, -1 di kanan
const hugPose = (k: number, dir: 1 | -1): Pose => {
  const arm = mj([7, 0, 0], [88, -30, 0], k);
  return { head: 12 * k * dir, lean: 4 * k * dir, ...(dir === 1 ? { armR: arm } : { armL: arm }) };
};
const walk = (ph: number): SidePose => {
  const a = POSES_SIDE.jalan;
  const m = (x: J3, y: J3) => mj(x, y, (Math.sin(ph) + 1) / 2);
  return { lean: 4, head: 0, legN: m(a.legN!, a.legF!), legF: m(a.legF!, a.legN!), armN: m(a.armN!, a.armF!), armF: m(a.armF!, a.armN!) };
};
const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ---- Adegan 1 (kalimat 1): ARV bekerja di tubuh pasangan (virus mengecil, tetap ada), lalu keduanya berpelukan; virus tidak berpindah
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const S = 0.9, GY = 1330, CHY = GY - 354 * S - 118 * S;
  const pl = pop(t, 0.25, 0.5), pg = pop(t, 0.45, 0.5);
  const tab = pop(t, 1.0, 0.4);
  const fly = pr(t, 1.5, 2.6, in3);
  const tabOp = tab * (1 - pr(t, 2.55, 2.85));
  const shrink = pr(t, 2.6, 3.7, sine);
  const glow = pr(t, 2.6, 3.4) * (t > 2.6 ? 1 : 0);
  const close = pr(t, 3.1, 4.0, sine);
  const hug = pr(t, 3.7, 4.4, sine);
  const lavX = lerp(260, 435, close), grX = lerp(820, 645, close);
  const heart = pop(t, 4.4, 0.5);
  const chk = pop(t, 4.9, 0.5);
  return (
    <>
      <Fr x={lavX} gy={GY} s={S * pl} role="blue" pose={hugPose(hug, 1)} op={pl} />
      <Fr x={grX} gy={GY} s={S * pg} role="yellow" pose={hugPose(hug, -1)} op={pg} />
      <Lens2 x={grX} y={CHY} vr={lerp(40, 16, shrink)} k={pg} t={t} glow={glow} ls={1.15} />
      <L.Tablet cx={820} cy={lerp(560, CHY, fly)} s={1.3 * tab} op={tabOp} />
      <L.Heart cx={540} cy={600} s={0.8 * heart} op={heart} color="#F4A6C8" />
      <L.CheckBadge cx={540} cy={450} s={0.85 * chk} op={chk} />
    </>
  );
};

// ---- Adegan 2 (kalimat 2): ARV menekan virus di darah: kurva turun di bawah batas deteksi, tes menunjukkan satu garis
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const s = T(2);
  const x0 = 170, x1 = 930, baseY = 1000, topY = 620, H = baseY - topY;
  const card = pop(t, s + 0.05, 0.5);
  const prog = pr(t, s + 1.0, s + 3.9, sine);
  const N = 60;
  const val = (u: number) => 0.07 + 0.88 * Math.pow(1 - u, 1.6);
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    if (u > prog) break;
    pts.push([lerp(x0, x1, u), baseY - val(u) * H]);
  }
  if (pts.length === 0) pts.push([x0, baseY - val(0) * H]);
  const head = pts[pts.length - 1];
  const thY = baseY - 0.22 * H;
  const tab = pop(t, s + 0.15, 0.5);
  const down = pop(t, s + 1.0, 0.4) * (1 - pr(t, s + 4.0, s + 4.4));
  const kit = pop(t, s + 3.9, 0.5);
  const pill = pr(t, s + 4.0, s + 4.4);
  const chk = pop(t, s + 4.5, 0.4);
  return (
    <>
      <g opacity={card}>
        <rect x={100} y={540} width={880} height={520} rx={40} fill="#fff" fillOpacity={0.12} />
        <line x1={x0} y1={baseY} x2={x1} y2={baseY} stroke="#E8F0FA" strokeWidth={5} strokeLinecap="round" />
        <line x1={x0} y1={topY - 10} x2={x0} y2={baseY} stroke="#E8F0FA" strokeWidth={5} strokeLinecap="round" />
        <line x1={x0} y1={thY} x2={x1} y2={thY} stroke={YEL} strokeWidth={6} strokeDasharray="16 12" strokeLinecap="round" />
        {pts.length > 1 && <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#FF6B4D" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />}
        <FlatVirus cx={head[0]} cy={head[1]} r={lerp(30, 16, prog)} rot={t * 20} />
      </g>
      <L.Tablet cx={200} cy={1250} s={1.7 * tab} op={tab} />
      <g opacity={down}>
        <polygon points="520,690 580,690 580,760 620,760 550,830 480,760 520,760" fill="#72E3D3" transform={`translate(${lerp(-60, 60, prog)} ${lerp(0, 80, prog)})`} />
      </g>
      <L.TestKit cx={860} cy={1230} s={1.0 * kit} op={kit} lines={1} />
      <L.CheckBadge cx={935} cy={1085} s={0.5 * chk} op={chk} />
      <SvgPill x={540} y={1250} text="tidak terdeteksi" k="neutral" size={36} op={pill} />
    </>
  );
};

// ---- Adegan 3 (kalimat 3): peneliti (kaca pembesar) mengikuti pasangan yang berjalan; enam bulan tidak terdeteksi
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const s = T(3);
  const mag = pop(t, s + 0.15, 0.5);
  const c1 = CL(3, 1), c2 = CL(3, 2);
  const pg = pop(t, c1 + 0.2, 0.5), pl = pop(t, c1 + 0.8, 0.5);
  const drift = pr(t, c1 + 0.4, c2 + 4.0, sine);
  const cx = lerp(330, 560, drift);
  const mx = lerp(260, cx - 110, pr(t, c1 - 0.2, c1 + 1.2, sine));
  const my = 720 + Math.sin(t * 2.2) * 8;
  const cal = pop(t, c2 + 0.1, 0.5);
  const n = Math.min(6, Math.floor(pr(t, c2 + 0.5, c2 + 3.6, sine) * 6.999));
  const bar = pop(t, c2 + 0.3, 0.4);
  const pill = pr(t, c2 + 3.2, c2 + 3.6);
  const S = 0.66, GY = 1290, ph = t * 5.2;
  const bob = Math.sin(ph * 2) * 3;
  return (
    <>
      <L.Calendar cx={540} cy={470} s={1.3 * cal} op={cal} marks={Array.from({ length: n }, (_, i) => 7 + i)} markColor="#2FB9A6" />
      <Sd x={cx - 170} gy={GY + bob} s={S * pl} role="blue" pose={walk(ph + 1)} op={pl} />
      <Sd x={cx + 110} gy={GY + bob} s={S * pg} role="yellow" pose={walk(ph)} op={pg} />
      <Lens2 x={cx + 118} y={GY - 354 * S - 112 * S} vr={15} k={pg} t={t} ls={0.95} />
      <g opacity={mag}>
        <L.Magnifier cx={mx} cy={my} s={1.05 * mag} />
      </g>
      <g opacity={bar}>
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={205 + i * 114} y={1320} width={100} height={46} rx={16} fill={i < n ? '#72E3D3' : '#B3C7DC'} opacity={i < n ? 1 : 0.4} />
        ))}
      </g>
      <SvgPill x={540} y={1395} text="enam bulan" k="neutral" size={32} op={pill} />
    </>
  );
};

// ---- Adegan 4 (kalimat 4): puluhan ribu hubungan tercatat (kisi pasangan terisi, penghitung naik), tidak ada satu pun penularan
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const s = T(4);
  const c1 = CL(4, 1);
  const lbl = pop(t, s + 0.15, 0.4);
  const cnt = pr(t, s + 0.5, s + 5.4, sine);
  const cntOp = pop(t, s + 0.4, 0.4) * (1 - pr(t, c1 - 0.15, c1 + 0.15));
  const ok = pr(t, c1 + 0.5, c1 + 0.9);
  const vir = pop(t, c1 + 0.2, 0.5);
  const cr = pop(t, c1 + 0.8, 0.45);
  const cells: React.ReactNode[] = [];
  for (let j = 0; j < 5; j++)
    for (let i = 0; i < 6; i++) {
      const k = j * 6 + i;
      cells.push(<MiniCouple key={k} x={165 + i * 150} y={790 + j * 120} k={pop(t, s + 0.8 + k * 0.14, 0.35)} ok={ok} />);
    }
  const w = 'PARTNER 2'.length * 34 * 0.56 + 51;
  return (
    <>
      <SvgPill x={540} y={440} text="PARTNER 2" k="cell" size={34} op={lbl} />
      <g opacity={cntOp}>
        <rect x={540 - 150} y={565} width={300} height={72} rx={36} fill="#EAF2FB" />
        <SvgTxt x={540} y={618} text={fmt(76000 * cnt)} size={44} color="#12304F" />
      </g>
      <g opacity={vir}>
        <FlatVirus cx={450} cy={630} r={58 * vir} rot={t * 12} />
        <L.CrossBadge cx={590} cy={630} s={0.7 * cr} op={cr} />
      </g>
      {cells}
    </>
  );
};

// ---- Adegan 5 (kalimat 5): dua studi besar lain, hasilnya serupa
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const s = T(5);
  const d0 = pop(t, s + 0.05, 0.5);
  const d1 = pr(t, s + 0.5, s + 1.2, out3), d2 = pr(t, s + 0.9, s + 1.6, out3);
  const k0 = pop(t, s + 0.7, 0.4), k1 = pop(t, s + 1.3, 0.4), k2 = pop(t, s + 1.7, 0.4);
  return (
    <>
      <L.Document cx={540} cy={860} s={1.9 * d0} op={d0} stamp />
      <L.Document cx={lerp(540, 190, d1)} cy={900} s={1.5 * d1} op={d1} stamp />
      <L.Document cx={lerp(540, 890, d2)} cy={900} s={1.5 * d2} op={d2} stamp />
      <L.CheckBadge cx={540} cy={1200} s={0.7 * k0} op={k0} />
      <L.CheckBadge cx={190} cy={1200} s={0.6 * k1} op={k1} />
      <L.CheckBadge cx={890} cy={1200} s={0.6 * k2} op={k2} />
    </>
  );
};

// ---- Adegan 6 (kalimat 6): U = U; Undetectable = Untransmittable; tidak terdeteksi berarti tidak menular
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const c0 = CL(6, 0), c1 = CL(6, 1), c2 = CL(6, 2);
  const u1 = pop(t, c0 + 0.2, 0.5), eq = pop(t, c0 + 1.2, 0.4), u2 = pop(t, c0 + 1.8, 0.5);
  const w1 = pop(t, c1 + 0.1, 0.45), w2 = pop(t, c1 + 1.2, 0.45);
  const kit = pop(t, c2 + 0.1, 0.5), emb = pop(t, c2 + 0.8, 0.5);
  const arr = pr(t, c2 + 0.6, c2 + 1.2);
  const chk = pop(t, c2 + 1.5, 0.4);
  return (
    <>
      <circle cx={300} cy={640} r={115 * u1} fill="#72E3D3" opacity={u1} />
      <SvgTxt x={300} y={690} text="U" size={150} color="#0B3B45" op={u1} />
      <rect x={480} y={618} width={120 * eq} height={18} rx={9} fill="#EAF2FB" opacity={eq} transform={`translate(${60 - 60 * eq} 0)`} />
      <rect x={480} y={654} width={120 * eq} height={18} rx={9} fill="#EAF2FB" opacity={eq} transform={`translate(${60 - 60 * eq} 0)`} />
      <circle cx={780} cy={640} r={115 * u2} fill="#8FBDF7" opacity={u2} />
      <SvgTxt x={780} y={690} text="U" size={150} color="#0E2A52" op={u2} />
      <SvgPill x={300} y={840} text="Undetectable" k="arv" size={34} op={w1} />
      <SvgPill x={780} y={840} text="Untransmittable" k="cell" size={34} op={w2} />
      <L.TestKit cx={300} cy={1100} s={0.95 * kit} op={kit} lines={1} />
      <Arrow2 x1={440} x2={640} y={1110} op={arr} />
      <Fr x={705} gy={1240} s={0.5 * emb} role="blue" pose={hugPose(emb, 1)} op={emb} />
      <Fr x={855} gy={1240} s={0.5 * emb} role="yellow" pose={hugPose(emb, -1)} op={emb} />
      <L.CheckBadge cx={780} cy={930} s={0.5 * chk} op={chk} />
      <SvgPill x={300} y={1300} text="tidak terdeteksi" k="neutral" size={32} op={kit} />
      <SvgPill x={780} y={1300} text="tidak menular" k="neutral" size={32} op={emb} />
    </>
  );
};

// ---- Adegan 7 (kalimat 7): dua syarat: ARV diminum teratur (blister terisi bergantian) dan hasil tidak terdeteksi bertahan (garis tetap di bawah batas)
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const c0 = CL(7, 0), c1 = CL(7, 1);
  const cards = pop(t, c0 + 0.1, 0.45);
  const taken = Math.min(3, Math.floor(pr(t, c1 + 0.1, c1 + 1.6) * 3.99));
  const chk1 = pop(t, c1 + 1.6, 0.4);
  const r2 = pop(t, c1 + 1.7, 0.4);
  const line = pr(t, c1 + 1.9, c1 + 3.5, sine);
  const chk2 = pop(t, c1 + 3.5, 0.4);
  const p1 = pr(t, c1 + 0.1, c1 + 0.4);
  const rowY = [800, 1110];
  return (
    <>
      {rowY.map((y, i) => (
        <rect key={i} x={70} y={y - 125} width={940} height={250} rx={44} fill="#fff" fillOpacity={0.12} opacity={cards} />
      ))}
      <g opacity={cards}>
        <rect x={880} y={rowY[0] - 40} width={80} height={80} rx={22} fill="#EAF2FB" opacity={0.35} />
        <rect x={880} y={rowY[1] - 40} width={80} height={80} rx={22} fill="#EAF2FB" opacity={0.35} />
      </g>
      <L.Blister cx={260} cy={rowY[0]} s={0.78 * cards} op={cards} taken={taken} />
      <SvgPill x={640} y={rowY[0]} text="ARV diminum teratur" k="arv" size={30} op={p1} />
      <L.CheckBadge cx={920} cy={rowY[0]} s={0.4 * chk1} op={chk1} />
      <g opacity={r2}>
        <line x1={100} y1={rowY[1] + 60} x2={340} y2={rowY[1] + 60} stroke="#E8F0FA" strokeWidth={4} strokeLinecap="round" />
        <line x1={100} y1={rowY[1] - 28} x2={340} y2={rowY[1] - 28} stroke={YEL} strokeWidth={5} strokeDasharray="14 10" strokeLinecap="round" />
        <line x1={110} y1={rowY[1] + 30} x2={lerp(110, 330, line)} y2={rowY[1] + 30} stroke="#FF6B4D" strokeWidth={11} strokeLinecap="round" />
        <FlatVirus cx={lerp(110, 330, line)} cy={rowY[1] + 30} r={15} rot={t * 20} />
      </g>
      <SvgPill x={620} y={rowY[1]} text="hasil tidak terdeteksi bertahan" k="neutral" size={24} op={r2} />
      <L.CheckBadge cx={920} cy={rowY[1]} s={0.4 * chk2} op={chk2} />
    </>
  );
};

// ---- Adegan 8 (kalimat 8): berlaku untuk penularan seksual; infeksi lain tetap bisa datang, pelindung tidak berlaku
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const c0 = CL(8, 0), c1 = CL(8, 1);
  const emb = pop(t, c0 + 0.1, 0.5);
  const lab = pr(t, c0 + 0.9, c0 + 1.3);
  const chk = pop(t, c0 + 1.5, 0.4);
  const sh = pop(t, c1 + 0.1, 0.45);
  const go = pr(t, c1 + 0.3, c1 + 2.0, sine);
  const micro = pop(t, c1 + 0.2, 0.4);
  const mx = lerp(990, 800, go), my = lerp(1010, 1100, go);
  const cr = pop(t, c1 + 2.0, 0.4);
  const shDim = 1 - 0.55 * pr(t, c1 + 1.9, c1 + 2.3);
  const pill = pr(t, c1 + 0.9, c1 + 1.3);
  const S = 0.8, GY = 1300;
  return (
    <>
      <L.CheckBadge cx={540} cy={440} s={0.7 * chk} op={chk} />
      <SvgPill x={540} y={570} text="penularan seksual" k="neutral" size={36} op={lab} />
      <L.Heart cx={540} cy={690} s={0.7 * emb} op={emb} color="#F4A6C8" />
      <Fr x={430} gy={GY} s={S * emb} role="blue" pose={hugPose(1, 1)} op={emb} />
      <Fr x={650} gy={GY} s={S * emb} role="yellow" pose={hugPose(1, -1)} op={emb} />
      <Lens2 x={650} y={GY - 354 * S - 118 * S} vr={14} k={emb} t={t} ls={1.0} />
      <g opacity={shDim}>
        <L.Shield cx={170} cy={1090} s={0.75 * sh} op={sh} />
      </g>
      <L.CrossBadge cx={170} cy={1090} s={0.55 * cr} op={cr} />
      <L.Microbe cx={mx} cy={my} s={1.15 * micro} op={micro} rot={Math.sin(t * 3) * 6} />
      <SvgPill x={640} y={1370} text="infeksi menular seksual lain" k="gray" size={28} op={pill} />
    </>
  );
};

// ---- Adegan 9 (kalimat 9): WHO 2023 menegaskan, ukuran risiko turun sampai nol
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const s = T(9);
  const doc = pop(t, s + 0.15, 0.5);
  const who = pr(t, s + 0.5, s + 0.9);
  const yr = pr(t, s + 1.5, s + 1.9);
  const m = pop(t, s + 2.4, 0.45);
  const drain = pr(t, s + 3.0, s + 4.3, sine);
  const lvl = lerp(0.85, 0.0, drain);
  const fill = 540 * lvl;
  const pill = pr(t, s + 4.0, s + 4.4);
  const chk = pop(t, s + 4.4, 0.45);
  return (
    <>
      <L.Document cx={290} cy={840} s={1.9 * doc} op={doc} stamp />
      <SvgPill x={290} y={1140} text="WHO" k="neutral" size={40} op={who} />
      <SvgPill x={290} y={1255} text="2023" k="gray" size={36} op={yr} />
      <g opacity={m}>
        <rect x={680} y={580} width={120} height={560} rx={60} fill="#fff" fillOpacity={0.14} />
        <rect x={690} y={1130 - fill - 10} width={100} height={fill + 0.001} rx={50} fill="#FF6B4D" opacity={fill > 8 ? 1 : 0} />
      </g>
      <L.CheckBadge cx={740} cy={500} s={0.6 * chk} op={chk} />
      <SvgPill x={740} y={1260} text="risiko nol" k="neutral" size={38} op={pill} />
    </>
  );
};

// ---- Adegan 10 (kalimat 10): pasangan tidak perlu takut; orang dengan HIV tidak dipandang sebagai ancaman (yang menuding menurunkan tangan, orang lain mendekat)
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const c0 = CL(10, 0), c1 = CL(10, 1);
  const emb = pop(t, c0 - 0.2, 0.5);
  const bub = pop(t, c0 + 0.3, 0.4) * (1 - pr(t, c0 + 1.5, c0 + 1.9));
  const heart = pop(t, c0 + 1.7, 0.5);
  const hIn = pr(t, c1 + 0.1, c1 + 0.8, out3);
  const hOut = pr(t, c1 + 1.6, c1 + 2.4, sine);
  const arm = mj([7, 0, 0], [100, -4, 0], hIn * (1 - hOut));
  const cr = pop(t, c1 + 1.3, 0.4) * (1 - pr(t, c1 + 2.2, c1 + 2.6));
  const gA = pop(t, c1 + 2.0, 0.5);
  const wave = mj([7, 0, 0], [60, -40, 0], gA);
  const S = 0.8, GY = 1300;
  return (
    <>
      <L.Heart cx={540} cy={660} s={0.8 * heart} op={heart} color="#F4A6C8" />
      <L.SpeechBubble cx={380} cy={640} s={0.9 * bub} op={bub} text="..." w={220} tail="r" />
      <Fr x={400} gy={GY} s={S * emb} role="blue" pose={hugPose(1, 1)} op={emb} />
      <Fr x={620} gy={GY} s={S * emb} role="yellow" pose={hugPose(1, -1)} op={emb} />
      <Lens2 x={620} y={GY - 354 * S - 118 * S} vr={14} k={emb} t={t} ls={1.0} />
      <Fr x={975} gy={GY} s={S * pop(t, c1 + 0.0, 0.4)} role="teal" pose={{ armL: arm, head: -6 * hIn * (1 - hOut) }} />
      <L.CrossBadge cx={860} cy={760} s={0.55 * cr} op={cr} />
      <Fr x={150} gy={GY} s={S * gA} role="yellow" pose={{ armR: wave, head: 8 * gA }} />
    </>
  );
};

const PILLS: { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number }[] = [];
const Pills: React.FC<{ t: number }> = ({ t }) => (
  <>
    {PILLS.map((p, i) => {
      const o = win(t, p.a, p.b, 0.3);
      return o > 0.01 ? <PillBox key={i} x={p.x} y={p.y} text={p.text} k={p.k} size={p.size} op={o} /> : null;
    })}
  </>
);

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

const Check: React.FC = () => (
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
                  {done && <Check />}
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
export const S2E6AltFull: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = gradAt(t);
  const cue = CUES.find((c) => t >= c.a - 0.05 && t < c.b);
  const ck = cue ? Math.min(1, (t - cue.a + 0.05) / 0.18) : 0;
  const subOn = t < CLOSE - 0.05;
  const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg,${g[0]} 0%,${g[1]} 55%,${g[2]} 100%)` }}>
      <AbsoluteFill style={{ background: 'radial-gradient(760px 760px at 50% 40%, rgba(120,190,255,0.22), transparent 70%)' }} />
      {t < CLOSE + 0.3 && (
        <AbsoluteFill style={{ transform: `scale(${settle(t)})`, transformOrigin: '50% 45%', opacity: 1 - ez(t, CLOSE - 0.1, CLOSE + 0.4) }}>
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
            {scenes.map((S, i) => (
              <SceneWrap key={i} i={i} t={t}>
                <S t={t} />
              </SceneWrap>
            ))}
          </svg>
          <Pills t={t} />
          <LegendBox t={t} a={T(1) + 0.8} b={T(1) + 5.2} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(2) + 1.0} b={T(3) - 0.1} items={[['#FF6B4D', 'Jumlah virus'], ['#F4D77E', 'Batas deteksi tes']]} />
          <LegendBox t={t} a={CL(4, 1) + 0.1} b={T(5) - 0.2} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={CL(7, 1) + 1.9} b={T(8) - 0.1} items={[['#F4D77E', 'Batas deteksi tes']]} />
          <LegendBox t={t} a={CL(8, 1) + 0.3} b={T(9) - 0.1} items={[['#C7A6E8', 'Infeksi lain']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile("vo/S2E6.mp3")} />
    </AbsoluteFill>
  );
};
