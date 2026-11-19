import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL, Star } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T, T, TE, CL, EP_DUR } from './timeline';

export const S2E10_FRAMES = Math.ceil(EP_DUR * FPS);

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

Centers for Disease Control and Prevention. (n.d.). Getting Tested for HIV.
https://www.cdc.gov/hiv/testing/index.html
Centers for Disease Control and Prevention. (n.d.). Clinical Testing Guidance for HIV.
https://www.cdc.gov/hivnexus/hcp/diagnosis-testing/index.html
Pitasi, M. A., et al. (2020). Performance of an alternative laboratory-based HIV diagnostic testing algorithm using HIV-1 RNA viral load. Sexually Transmitted Diseases, 47(5), S18–S25.
https://doi.org/10.1097/OLQ.0000000000001124
Centers for Disease Control and Prevention & Association of Public Health Laboratories. (2014). Laboratory Testing for the Diagnosis of HIV Infection: Updated Recommendations.
https://stacks.cdc.gov/view/cdc/23447`;

const parseRefs = (raw: string) => {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = lines[0];
  const items: { n: string; c: string; u: string }[] = [];
  for (const l of lines.slice(1)) {
    if (/^https?:\/\//.test(l) && items.length) items[items.length - 1].u += (items[items.length - 1].u ? ' ' : '') + l;
    else items.push({ n: '', c: l, u: '' });
  }
  return { title, items };
};

// ---------------- latar gradien (bergeser halus tiap adegan) ----------------
type Grad = [string, string, string];
const CLOSE_GRAD: Grad = ['#0A2540', '#0F3B66', '#0B4F63'];
const B1: Grad = ['#0A1F3D', '#123A60', '#17506F']; // biru laut
const B2: Grad = ['#0D1B45', '#1E2F6B', '#2B4A85']; // biru tua
const B3: Grad = ['#14183F', '#2A2A6B', '#3B4A8A']; // indigo
const B4: Grad = ['#08283A', '#0F4A5C', '#167A80']; // teal
const BG: Grad[] = [B1, B1, B3, B3, B3, B2, B2, B1, B4, B4, B1];

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



const PAS = '#7ED6A8'; // pasangan
const GRP = ['#F4D77E', '#7ED6A8', '#8FBDF7'];
const Virus: React.FC<{ x: number; y: number; r: number; dim?: number; t: number; seed?: number }> = ({ x, y, r, dim = 1, t, seed = 0 }) =>
  r < 2 || dim < 0.01 ? null : <FlatVirus cx={x} cy={y} r={r} dim={dim} rot={t * 5 + seed * 40} />;
const pr = (t: number, a: number, b: number, e: (x: number) => number = out3) => ez(t, a, b, e);

const SceneWrap: React.FC<{ i: number; t: number; children: React.ReactNode }> = ({ i, t, children }) => {
  const o = win(t, SCENE_T[i], SCENE_T[i + 1] + 0.25, 0.45);
  if (o < 0.005) return null;
  return <g opacity={o}>{children}</g>;
};

const pop = (t: number, a: number, d = 0.4) => pr(t, a, a + d, back);
// ================= komponen episode ini =================
const KAMU = '#B9A2F5'; // tokoh "kamu" (peran sama sepanjang episode)
const AB_COL = '#E9D8FF'; // antibodi
const RNA_COL = '#FF8E70'; // materi genetik virus
const AG_COL = '#9ADBF0'; // tes antigen dan antibodi
const SKY = '#DCE8F5';

// "kamu" dengan virus di dalam lensa di dada (vk 0..1 = ukuran virus di dalam tubuh)
const Body: React.FC<{ x: number; y: number; s?: number; op?: number; vk?: number; t: number }> = ({ x, y, s = 1, op = 1, vk = 1, t }) =>
  s < 0.02 || op < 0.01 ? null : (
    <>
      <L.Person cx={x} cy={y} s={s} op={op} color={KAMU} />
      <g opacity={op}>
        <circle cx={x} cy={y + 34 * s} r={34 * s} fill="#fff" opacity={0.28} />
        {vk > 0.02 && <FlatVirus cx={x} cy={y + 34 * s} r={15 * s * vk} rot={t * 14} />}
      </g>
    </>
  );

// kamera datar (analogi tes)
const Camera: React.FC<{ x: number; y: number; s?: number; op?: number; flash?: number }> = ({ x, y, s = 1, op = 1, flash = 0 }) =>
  s < 0.02 || op < 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <rect x={-48} y={-86} width={70} height={30} rx={10} fill={SKY} />
      <rect x={-110} y={-64} width={220} height={140} rx={30} fill={SKY} />
      <rect x={-110} y={-40} width={220} height={24} fill="#8FBDF7" opacity={0.55} />
      <circle cx={0} cy={14} r={52} fill="#173A5E" />
      <circle cx={0} cy={14} r={34} fill="#8FBDF7" />
      <circle cx={-12} cy={2} r={10} fill="#fff" opacity={0.45} />
      <circle cx={78} cy={-44} r={12} fill={flash > 0.05 ? '#F4D77E' : '#B3C7DC'} />
      {flash > 0.05 && <circle cx={78} cy={-44} r={12 + 50 * flash} fill="#F4D77E" opacity={0.5 * (1 - flash)} />}
    </g>
  );

// foto hasil kamera: berisi orang dengan lensa (isi lensa = yang sudah muncul)
const Photo: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 1 }) =>
  op < 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <rect x={-135} y={-170} width={270} height={340} rx={22} fill="#EAF2FB" />
      <rect x={-112} y={-148} width={224} height={250} rx={14} fill="#CFE3F7" />
      <L.Person cx={0} cy={0} s={0.9} color={KAMU} />
      <circle cx={0} cy={31} r={30} fill="#fff" opacity={0.5} />
    </g>
  );

// busur panah melingkar (ulangi)
const LoopArrow: React.FC<{ x: number; y: number; r: number; k: number; op?: number }> = ({ x, y, r, k, op = 1 }) => {
  if (k < 0.01) return null;
  const a0 = -Math.PI * 0.15;
  const a1 = a0 + Math.PI * 1.6 * k;
  const px = (a: number) => x + Math.cos(a) * r;
  const py = (a: number) => y + Math.sin(a) * r;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const hx = px(a1), hy = py(a1);
  const ang = a1 + Math.PI / 2;
  return (
    <g opacity={op}>
      <path d={`M ${px(a0)} ${py(a0)} A ${r} ${r} 0 ${large} 1 ${hx} ${hy}`} fill="none" stroke="#72E3D3" strokeWidth={14} strokeLinecap="round" />
      <polygon
        points={`${hx + Math.cos(ang) * 30},${hy + Math.sin(ang) * 30} ${hx + Math.cos(ang + 2.4) * 24},${hy + Math.sin(ang + 2.4) * 24} ${hx + Math.cos(ang - 2.4) * 24},${hy + Math.sin(ang - 2.4) * 24}`}
        fill="#72E3D3"
      />
    </g>
  );
};

const Arrow: React.FC<{ x1: number; x2: number; y: number; k: number; c?: string }> = ({ x1, x2, y, k, c = '#EAF2FB' }) => {
  if (k < 0.01) return null;
  const xe = lerp(x1, x2, k);
  return (
    <g opacity={Math.min(1, k * 3)}>
      <line x1={x1} y1={y} x2={Math.max(x1, xe - 24)} y2={y} stroke={c} strokeWidth={12} strokeLinecap="round" />
      <polygon points={`${xe},${y} ${xe - 34},${y - 24} ${xe - 34},${y + 24}`} fill={c} />
    </g>
  );
};

const Y_AB: [number, number][] = [[-62, -34], [48, -50], [52, 42], [-44, 54]];

// antibodi terbang dari tubuh ke lensa kaca pembesar
const flyPt = (k: number, x0: number, y0: number, x1: number, y1: number, lift = 90): [number, number] => [lerp(x0, x1, k), lerp(y0, y1, k) - Math.sin(k * Math.PI) * lift];

// ---- adegan 1 (kalimat 1-2): hasil tes negatif padahal virus ada; lalu jam = soal waktu ----
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const b = pop(t, 0.15, 0.5), vk = pr(t, 0.7, 1.3, back);
  const kit = pop(t, 0.95, 0.5);
  const q = pop(t, 1.45, 0.4) * (1 - pr(t, T(2) - 0.05, T(2) + 0.3));
  const clk = pop(t, T(2) + 0.1, 0.5);
  const k = pr(t, T(2) + 0.3, TE(2) + 0.4, sine);
  const wob = 1 + 0.05 * Math.sin(Math.max(0, t - 1.5) * 8) * (1 - pr(t, 2.0, 2.4));
  return (
    <>
      <Body x={330} y={900} s={1.7 * b} op={b} vk={vk} t={t} />
      <L.TestKit cx={770} cy={900} s={1.3 * kit} op={kit} lines={1} />
      <text x={770} y={640} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={150 * wob} fill="#F4D77E" opacity={q} transform={`scale(${q > 0 ? 1 : 0})`}>?</text>
      <L.Clock cx={540} cy={560} s={1.25 * clk} op={clk} frac={0.04 + 0.7 * k} hour={9 * k} />
    </>
  );
};

// ---- adegan 2 (kalimat 3): kamera hanya memotret yang sudah muncul ----
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const a = T(3), c1 = CL(3, 1);
  const cam = pop(t, a + 0.1, 0.5);
  const body = pop(t, a + 0.2, 0.5);
  const fl = pr(t, c1 - 0.55, c1 - 0.05, out3) * (1 - pr(t, c1 - 0.05, c1 + 0.35));
  const fl2 = pr(t, c1 + 0.9, c1 + 1.2) * (1 - pr(t, c1 + 1.2, c1 + 1.6));
  const ph = pr(t, c1 + 0.2, c1 + 1.0);
  const vk = pr(t, c1 + 1.6, c1 + 2.8, back); // virus tumbuh di tubuh setelah foto diambil
  const cone = Math.max(fl, fl2);
  return (
    <>
      <polygon points="360,610 700,700 700,980" fill="#fff" opacity={0.12 * Math.min(1, cone * 3 + 0.0)} />
      <Camera x={290} y={640} s={1.6 * cam} op={cam} flash={Math.max(fl, fl2)} />
      <Body x={800} y={820} s={1.5 * body} op={body} vk={vk} t={t} />
      <Photo x={290} y={lerp(800, 1090, ph)} s={0.95 * ph} op={ph} />
    </>
  );
};

// ---- adegan 3-5: tiga jenis tes, kaca pembesar membaca apa yang ada ----
const BODY = { x: 290, y: 880, s: 1.45 };
const LENS = { x: 760, y: 700, s: 1.5 };
const Detector: React.FC<{ t: number; kind: 'ab' | 'agab' | 'nat'; a: number }> = ({ t, kind, a }) => {
  const body = pop(t, a + 0.05, 0.5);
  const mag = pop(t, a + 0.2, 0.5);
  const scan = Math.sin(Math.max(0, t - a - 0.7) * 3.2) * 18 * (1 - pr(t, a + 1.6, a + 2.2));
  const lx = LENS.x + scan, ly = LENS.y + scan * 0.4;
  const bcx = BODY.x, bcy = BODY.y + 34 * BODY.s;
  const items: React.ReactNode[] = [];
  if (kind === 'ab' || kind === 'agab') {
    const starts = kind === 'ab' ? [CL(4, 1) + 0.15, CL(4, 1) + 0.7, CL(4, 1) + 1.25, CL(4, 1) + 1.8] : [a + 0.8, a + 1.4];
    const n = kind === 'ab' ? 4 : 2;
    for (let i = 0; i < n; i++) {
      const k = pr(t, starts[i], starts[i] + 1.0, sine);
      if (k <= 0.01) continue;
      const [fx, fy] = flyPt(k, bcx + 20, bcy - 20, lx + Y_AB[i][0], ly + Y_AB[i][1], 120);
      items.push(<L.Antibody key={'ab' + i} cx={fx} cy={fy} s={0.8 - 0.1 * k} rot={lerp(-30, 0, k)} op={Math.min(1, k * 4)} color={AB_COL} />);
    }
  }
  if (kind === 'agab') {
    // bagian dari virus (satu duri) ikut terbaca
    const st = CL(5, 0) + 2.2;
    const k = pr(t, st, st + 1.1, sine);
    if (k > 0.01) {
      const [fx, fy] = flyPt(k, bcx + 30, bcy - 14, lx + 20, ly + 50, 120);
      items.push(
        <g key="spk" transform={`translate(${fx} ${fy}) rotate(${lerp(40, 0, k)}) scale(${1.15})`} opacity={Math.min(1, k * 4)}>
          <rect x={-5} y={-4} width={10} height={44} rx={5} fill={SHAPE_COL.spike} />
          <circle cx={0} cy={-6} r={15} fill={SHAPE_COL.spikeKnob} />
        </g>,
      );
    }
  }
  if (kind === 'nat') {
    const st = a + 0.9;
    const k = pr(t, st, st + 1.5, sine);
    if (k > 0.01) {
      const [fx, fy] = flyPt(k, bcx + 90, bcy - 10, lx, ly + 20, 110);
      items.push(<L.RNAStrand key="rna" cx={fx} cy={fy} s={0.8 + 0.25 * k} len={190} amp={16} phase={t * 2} color={RNA_COL} op={Math.min(1, k * 4)} />);
    }
  }
  const pulse = 1 + 0.05 * Math.sin(t * 4);
  return (
    <>
      <Body x={BODY.x} y={BODY.y} s={BODY.s * body} op={body} vk={pulse} t={t} />
      <circle cx={lx} cy={ly} r={92 * LENS.s * mag} fill="#EAF2FB" opacity={0.14} />
      <L.Magnifier cx={lx} cy={ly} s={LENS.s * mag} op={mag} />
      {items}
    </>
  );
};
const Scene3: React.FC<{ t: number }> = ({ t }) => <Detector t={t} kind="ab" a={T(4)} />;
const Scene4: React.FC<{ t: number }> = ({ t }) => <Detector t={t} kind="agab" a={T(5)} />;
const Scene5: React.FC<{ t: number }> = ({ t }) => <Detector t={t} kind="nat" a={T(6)} />;

// ---- adegan 6 (kalimat 7): jendela waktu antara paparan dan tes bisa membaca ----
const WX0 = 140, WX1 = 700;
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const a = T(7), c1 = CL(7, 1);
  const v = pop(t, a + 0.1, 0.5);
  const tr = pr(t, a + 0.2, a + 0.9);
  const win_k = pr(t, a + 0.7, CL(7, 0) + 1.5, sine);
  const run = pr(t, c1 + 0.1, c1 + 2.9, sine);
  const dx = lerp(WX0, WX1, run);
  const mag = pop(t, c1 + 3.0, 0.5);
  const vv = pop(t, c1 + 3.5, 0.5);
  return (
    <>
      <FlatVirus cx={WX0 + 10} cy={790} r={46 * v} rot={t * 12} />
      <line x1={WX0} y1={1000} x2={lerp(WX0, 940, tr)} y2={1000} stroke="#fff" strokeOpacity={0.3} strokeWidth={18} strokeLinecap="round" />
      <rect x={WX0 - 10} y={925} width={Math.max(0.01, (WX1 - WX0 + 20) * win_k)} height={150} rx={46} fill="#fff" opacity={0.16} />
      {run > 0.005 && run < 0.999 && <circle cx={dx} cy={1000} r={26} fill="#F4D77E" />}
      {run >= 0.999 && <circle cx={WX1} cy={1000} r={26} fill="#72E3D3" />}
      <circle cx={760} cy={730} r={92 * 0.95 * mag} fill="#EAF2FB" opacity={0.14} />
      <L.Magnifier cx={760} cy={730} s={0.95 * mag} op={mag} />
      {vv > 0.01 && <FlatVirus cx={758} cy={728} r={34 * vv} rot={t * 12} />}
    </>
  );
};

// ---- adegan 7 (kalimat 8): tiga tes dan lamanya jendela (angka dari narasi/CDC) ----
const DX = (d: number) => 140 + d * 8.89;
const BARS = [
  { d0: 10, d1: 33, c: RNA_COL, y: 760, cl: 1, label: 'tes asam nukleat', dur: '10–33 hari' },
  { d0: 18, d1: 45, c: AG_COL, y: 980, cl: 2, label: 'tes antigen dan antibodi', dur: '18–45 hari' },
  { d0: 23, d1: 90, c: AB_COL, y: 1200, cl: 3, label: 'tes antibodi', dur: '23–90 hari' },
];
const barT = (i: number) => CL(8, BARS[i].cl) + 0.2;
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const a = T(8);
  const v = pop(t, a + 0.1, 0.5);
  const ln = pr(t, a + 0.1, a + 0.9);
  return (
    <>
      <line x1={140} y1={lerp(1300, 640, ln)} x2={140} y2={1300} stroke="#fff" strokeOpacity={0.35} strokeWidth={5} strokeDasharray="14 12" />
      <FlatVirus cx={140} cy={1330} r={34 * v} rot={t * 12} />
      {BARS.map((b, i) => {
        const k = pr(t, barT(i), barT(i) + 1.5, sine);
        const w1 = (DX(b.d0) - 140) * Math.min(1, k * 2);
        const w2 = (DX(b.d1) - DX(b.d0)) * Math.max(0, k * 2 - 1);
        return (
          <g key={i}>
            <rect x={140} y={b.y - 24} width={Math.max(0.01, w1)} height={48} rx={24} fill="#fff" opacity={0.14} />
            <rect x={DX(b.d0)} y={b.y - 30} width={Math.max(0.01, w2)} height={60} rx={30} fill={b.c} />
          </g>
        );
      })}
    </>
  );
};

// ---- adegan 8 (kalimat 9): tes sebelum jendela lewat tampak negatif padahal virus ada ----
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const a = T(9);
  const tr = pr(t, a + 0.1, a + 0.7);
  const dx = lerp(WX0, 420, pr(t, a + 0.5, a + 1.9, sine));
  const b = pop(t, a + 0.2, 0.5);
  const kit = pop(t, a + 1.9, 0.5);
  const pulse = 1 + 0.12 * Math.sin(Math.max(0, t - (a + 3.0)) * 6) * pr(t, a + 3.0, a + 3.3);
  return (
    <>
      <Body x={310} y={780} s={1.45 * b} op={b} vk={pulse * 1.0} t={t} />
      <L.TestKit cx={790} cy={760} s={1.15 * kit} op={kit} lines={1} />
      <line x1={WX0} y1={1170} x2={lerp(WX0, 940, tr)} y2={1170} stroke="#fff" strokeOpacity={0.3} strokeWidth={18} strokeLinecap="round" />
      <rect x={WX0 - 10} y={1095} width={(WX1 - WX0 + 20) * tr} height={150} rx={46} fill="#fff" opacity={0.16} />
      {tr > 0.05 && <circle cx={dx} cy={1170} r={26} fill="#F4D77E" />}
    </>
  );
};

// ---- adegan 9 (kalimat 10): hasil reaktif dikonfirmasi tes lanjutan, hasil keliru tidak jadi diagnosis ----
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const a = T(10), c1 = CL(10, 1);
  const k1 = pop(t, a + 0.1, 0.5);
  const ar = pr(t, a + 0.9, a + 1.6);
  const k2 = pop(t, a + 1.5, 0.5);
  const ck = pop(t, a + 2.6, 0.45);
  const wrong = pop(t, c1 + 0.1, 0.45);
  const bounce = pr(t, c1 + 0.7, c1 + 1.3, sine) * (1 - pr(t, c1 + 1.3, c1 + 1.9, sine));
  const doc = pop(t, c1 + 0.3, 0.5);
  const stamp = pop(t, c1 + 1.5, 0.45);
  return (
    <>
      <L.TestKit cx={230} cy={700} s={1.0 * k1} op={k1} lines={2} />
      <Arrow x1={350} x2={560} y={700} k={ar} />
      <L.TestKit cx={800} cy={700} s={1.0 * k2} op={k2} lines={2} />
      <L.CheckBadge cx={890} cy={850} s={0.7 * ck} op={ck} />
      <L.TestKit cx={200 + 120 * bounce} cy={1150} s={0.6 * wrong} op={wrong} lines={2} />
      <L.CrossBadge cx={260 + 120 * bounce} cy={1250} s={0.5 * wrong} op={wrong} />
      <L.Document cx={760} cy={1150} s={1.1 * doc} op={doc} kind="paper" />
      <L.CheckBadge cx={840} cy={1250} s={0.55 * stamp} op={stamp} />
    </>
  );
};

// ---- adegan 10 (kalimat 11): ada paparan, ulangi tes setelah jendela lewat ----
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const a = T(11), c1 = CL(11, 1);
  const v = pop(t, a + 0.1, 0.5);
  const tr = pr(t, a + 0.3, a + 0.9);
  const w = pr(t, a + 0.6, a + 1.5, sine);
  const run = pr(t, c1 + 0.1, c1 + 1.6, sine);
  const dx = lerp(WX0, 800, run);
  const tube = pop(t, c1 + 1.5, 0.5);
  const lp = pr(t, c1 + 1.7, c1 + 2.5, sine);
  return (
    <>
      <FlatVirus cx={WX0 + 10} cy={790} r={46 * v} rot={t * 12} />
      <line x1={WX0} y1={1000} x2={lerp(WX0, 940, tr)} y2={1000} stroke="#fff" strokeOpacity={0.3} strokeWidth={18} strokeLinecap="round" />
      <rect x={WX0 - 10} y={925} width={(WX1 - WX0 + 20) * w} height={150} rx={46} fill="#fff" opacity={0.16} />
      {run > 0.005 && run < 0.999 && <circle cx={dx} cy={1000} r={26} fill="#F4D77E" />}
      {run >= 0.999 && <circle cx={800} cy={1000} r={26} fill="#72E3D3" />}
      <L.BloodTube cx={800} cy={720} s={1.0 * tube} op={tube} level={0.7} />
      <LoopArrow x={800} y={720} r={170} k={lp} />
    </>
  );
};

// ---- adegan 11 (kalimat 12): PEP atau PrEP, tanya tenaga kesehatan soal jadwal tes ----
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const a = T(12), c1 = CL(12, 1);
  const pep = pop(t, a + 0.15, 0.5);
  const prep = pop(t, a + 1.2, 0.5);
  const doc = pop(t, c1 + 0.05, 0.55);
  const bub = pop(t, c1 + 0.6, 0.45);
  const cal = pop(t, c1 + 1.2, 0.5);
  const marks = [3, 10, 17].filter((_, i) => t > c1 + 1.7 + i * 0.35);
  return (
    <>
      <L.Tablet cx={320} cy={640} s={1.5 * pep} op={pep} />
      <L.TabletPrEP cx={750} cy={640} s={1.25 * prep} op={prep} />
      <L.Doctor cx={260} cy={1010} s={1.5 * doc} op={doc} />
      <L.SpeechBubble cx={560} cy={940} s={0.8 * bub} op={bub} tail="l" w={220} />
      <L.Calendar cx={800} cy={1090} s={1.15 * cal} op={cal} marks={marks} markColor="#72E3D3" />
    </>
  );
};

const PILLS: { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number }[] = [
  { a: CL(3, 1) + 2.1, b: T(4) - 0.1, text: 'sudah muncul', k: 'neutral', x: 290, y: 1340, size: 30 },
  { a: T(4) + 0.4, b: T(5) - 0.1, text: 'tes antibodi', k: 'neutral', x: 540, y: 1250, size: 34 },
  { a: T(5) + 0.4, b: T(6) - 0.1, text: 'tes antigen dan antibodi', k: 'neutral', x: 540, y: 1250, size: 32 },
  { a: T(6) + 0.4, b: T(7) - 0.1, text: 'tes asam nukleat', k: 'neutral', x: 540, y: 1250, size: 34 },
  { a: T(7) + 0.6, b: CL(7, 1) - 0.1, text: 'paparan', k: 'neutral', x: 150, y: 880, size: 30 },
  { a: T(7) + 1.2, b: T(8) - 0.1, text: 'jendela waktu', k: 'neutral', x: 420, y: 880, size: 32 },
  { a: T(8) + 0.1, b: CL(8, 1) + 4.5, text: 'CDC', k: 'neutral', x: 540, y: 560, size: 36 },
  { a: T(8) + 0.5, b: T(9) - 0.1, text: 'paparan', k: 'neutral', x: 150, y: 1405, size: 26 },
  ...BARS.flatMap((b, i) => [
    { a: barT(i), b: T(9) - 0.1, text: b.label, k: 'neutral' as KK, x: (DX(b.d0) + DX(b.d1)) / 2, y: b.y - 66, size: 28 },
    { a: barT(i) + 1.4, b: T(9) - 0.1, text: b.dur, k: 'neutral' as KK, x: (DX(b.d0) + DX(b.d1)) / 2, y: b.y + 68, size: 28 },
  ]),
  { a: T(9) + 2.0, b: T(10) - 0.1, text: 'tampak negatif', k: 'neutral', x: 790, y: 990, size: 30 },
  { a: T(9) + 3.2, b: T(10) - 0.1, text: 'virus sudah ada', k: 'neutral', x: 310, y: 990, size: 30 },
  { a: T(10) + 0.5, b: T(11) - 0.1, text: 'reaktif', k: 'neutral', x: 230, y: 920, size: 30 },
  { a: T(10) + 2.0, b: T(11) - 0.1, text: 'tes lanjutan', k: 'neutral', x: 800, y: 920, size: 30 },
  { a: CL(10, 1) + 1.6, b: T(11) - 0.1, text: 'diagnosis', k: 'neutral', x: 760, y: 1345, size: 30 },
  { a: T(11) + 0.4, b: CL(11, 1) - 0.1, text: 'paparan', k: 'neutral', x: 150, y: 880, size: 30 },
  { a: CL(11, 1) + 2.0, b: T(12) - 0.1, text: 'ulangi tes', k: 'neutral', x: 800, y: 928, size: 32 },
  { a: T(12) + 0.6, b: T(12) + 99, text: 'PEP', k: 'neutral', x: 320, y: 740, size: 32 },
  { a: T(12) + 1.6, b: T(12) + 99, text: 'PrEP', k: 'neutral', x: 750, y: 740, size: 32 },
  { a: CL(12, 1) + 0.9, b: T(12) + 99, text: 'tenaga kesehatan', k: 'neutral', x: 260, y: 1190, size: 28 },
  { a: CL(12, 1) + 2.3, b: T(12) + 99, text: 'jadwal tes', k: 'neutral', x: 800, y: 1270, size: 30 },
];
const Pills: React.FC<{ t: number }> = ({ t }) => (
  <>
    {PILLS.map((p, i) => {
      const o = win(t, p.a, Math.min(p.b, CLOSE - 0.1), 0.3);
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
export const S2E10Full: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = gradAt(t);
  const cue = CUES.find((c) => t >= c.a - 0.05 && t < c.b);
  const ck = cue ? Math.min(1, (t - cue.a + 0.05) / 0.18) : 0;
  const subOn = t < CLOSE - 0.05;
  const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10, Scene11];
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
          <LegendBox t={t} a={0.9} b={T(2) - 0.2} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(4) + 0.2} b={T(4) + 4.6} items={[[AB_COL, 'Antibodi'], ['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(5) + 0.2} b={T(5) + 4.0} items={[[AB_COL, 'Antibodi'], ['#FF9C85', 'Bagian virus']]} />
          <LegendBox t={t} a={T(6) + 0.2} b={T(6) + 3.0} items={[[RNA_COL, 'Materi genetik virus']]} />
          <LegendBox t={t} a={CL(7, 1) + 3.3} b={T(8) - 0.1} items={[['#FF9C85', 'Virus HIV']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile("vo/S2E10.mp3")} />
    </AbsoluteFill>
  );
};
