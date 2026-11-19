import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T, T, TE, CL, EP_DUR } from './timeline';

export const S2E5_FRAMES = Math.ceil(EP_DUR * FPS);

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

1. NIH HIVinfo. Understanding How HIV Is Transmitted.
https://hivinfo.nih.gov/understanding-hiv/fact-sheets/understanding-hiv-transmission

2. NIH HIVinfo. You Can Safely Share... With Anyone With HIV.
https://hivinfo.nih.gov/understanding-hiv/infographics/you-can-safely-sharewith-anyone-hiv

3. World Health Organization. (2026). HIV and AIDS (fact sheet, 27 July 2026).
https://www.who.int/news-room/fact-sheets/detail/hiv-aids`;

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
const BG: Grad[] = [B1, B1, B2, B3, B1, B2, B4, B3, B2, B4, B3, B1];

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

const SceneWrap: React.FC<{ i: number; t: number; children: React.ReactNode }> = ({ i, t, children }) => {
  const o = win(t, SCENE_T[i], SCENE_T[i + 1] + 0.25, 0.45);
  if (o < 0.005) return null;
  return <g opacity={o}>{children}</g>;
};

// ---------------- tetes cairan (lima cairan, tiap tetes membawa virus) ----------------
const DROP_D = 'M 0 -90 C 40 -34 64 -6 64 30 A 64 64 0 0 1 -64 30 C -64 -6 -40 -34 0 -90 Z';
const FL = { darah: '#F0616A', mani: '#F2F4F8', vagina: '#F4A6C8', dubur: '#FFC38A', asi: '#FFE9A8', bening: '#8FD3F0' };
const FLUIDS = [FL.darah, FL.mani, FL.vagina, FL.dubur, FL.asi];
const Drop: React.FC<{ x: number; y: number; s?: number; color: string; op?: number; virus?: boolean; rot?: number; t?: number }> = ({ x, y, s = 1, color, op = 1, virus = true, rot = 0, t = 0 }) =>
  s < 0.02 || op < 0.01 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      <path d={DROP_D} fill={color} />
      <ellipse cx={-30} cy={22} rx={9} ry={18} fill="#fff" opacity={0.35} transform="rotate(20 -30 22)" />
      {virus && <FlatVirus cx={4} cy={30} r={25} rot={t * 24} />}
    </g>
  );
const bob = (t: number, i: number, a = 6) => Math.sin(t * 2.4 + i * 1.3) * a;
const pop = (t: number, a: number, d = 0.4) => pr(t, a, a + d, back);


// ---------------- komponen kecil episode ini ----------------
const SAL = '#CFE8F7'; // air liur (bening, tanpa virus)
const FOOD = ['#F4D77E', '#7ED6A8', '#FFB07A'];
const Plate: React.FC<{ x: number; y: number; s?: number; op?: number; food?: boolean }> = ({ x, y, s = 1, op = 1, food = true }) =>
  s < 0.02 || op < 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <ellipse cx={0} cy={10} rx={130} ry={34} fill="#B3C7DC" />
      <ellipse cx={0} cy={0} rx={130} ry={34} fill="#FFFFFF" />
      <ellipse cx={0} cy={-2} rx={86} ry={20} fill="#DDEBFF" />
      {food && (
        <>
          <ellipse cx={-26} cy={-10} rx={34} ry={20} fill={FOOD[0]} />
          <circle cx={22} cy={-12} r={16} fill={FOOD[1]} />
          <circle cx={44} cy={-6} r={11} fill={FOOD[2]} />
        </>
      )}
    </g>
  );
const Spoon: React.FC<{ x: number; y: number; rot?: number; s?: number; op?: number }> = ({ x, y, rot = 0, s = 1, op = 1 }) =>
  s < 0.02 || op < 0.01 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      <rect x={-8} y={0} width={16} height={120} rx={8} fill="#EAF2FB" />
      <ellipse cx={0} cy={-18} rx={26} ry={36} fill="#EAF2FB" />
      <ellipse cx={-8} cy={-26} rx={7} ry={15} fill="#fff" opacity={0.6} />
    </g>
  );
const Glass: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 1 }) =>
  s < 0.02 || op < 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <path d="M -34 -80 H 34 L 28 0 Q 27 8 18 8 H -18 Q -27 8 -28 0 Z" fill={LIB_COL.glass} opacity={0.85} />
      <path d="M -31 -36 H 31 L 28 0 Q 27 8 18 8 H -18 Q -27 8 -28 0 Z" fill="#72B9F0" opacity={0.8} />
    </g>
  );
const Lens: React.FC<{ x: number; y: number }> = ({ x, y }) => <circle cx={x} cy={y} r={42} fill="#fff" opacity={0.26} />;
const GREEN = { x: 170, y: 1050 };
const LAV = { x: 910, y: 1050 };
const Dpl: React.FC<{ x: number; y: number; s?: number; color: string; op?: number; virus?: boolean; t?: number }> = (p) => <Drop {...p} />;
const bez = (u: number, p0: number[], c: number[], p2: number[]) => [
  (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p2[0],
  (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p2[1],
];
const Badge: React.FC<{ kind: 'ok' | 'no'; x: number; y: number; s?: number; k: number }> = ({ kind, x, y, s = 0.6, k }) =>
  k < 0.02 ? null : kind === 'ok' ? <L.CheckBadge cx={x} cy={y} s={s * k} op={k} /> : <L.CrossBadge cx={x} cy={y} s={s * k} op={k} />;
const Persons: React.FC<{ a: number; t: number; green?: boolean; lav?: boolean }> = ({ a, t, green = true, lav = true }) => {
  const g = pop(t, a, 0.5), l = pop(t, a + 0.12, 0.5);
  return (
    <>
      {green && <L.Person cx={GREEN.x} cy={GREEN.y} s={1.15 * g} op={g} color={PAS} />}
      {green && g > 0.02 && <Lens x={GREEN.x} y={GREEN.y + 30} />}
      {lav && <L.Person cx={LAV.x} cy={LAV.y} s={1.15 * l} op={l} color={KAMU} />}
    </>
  );
};

// ---- Adegan 1 (kalimat 1): orang dengan HIV dan "kamu" duduk di meja; satu piring, lalu satu sendok jatuh di meja
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const tb = pop(t, 0.1, 0.5);
  const pl = pr(t, CL(1, 0), CL(1, 0) + 0.5, back);
  const sp = pr(t, CL(1, 1), CL(1, 1) + 0.5, back);
  return (
    <>
      <Persons a={0.05} t={t} />
      <g opacity={tb} transform={`translate(540 1136) scale(${tb} 1)`}>
        <rect x={-380} y={0} width={760} height={26} rx={13} fill={LIB_COL.light} />
        <rect x={-320} y={26} width={22} height={100} rx={10} fill={LIB_COL.track} />
        <rect x={298} y={26} width={22} height={100} rx={10} fill={LIB_COL.track} />
      </g>
      <Plate x={540} y={lerp(700, 1120, pl)} s={pl} op={pl} />
      <Spoon x={lerp(640, 690, sp)} y={lerp(760, 1090, sp)} rot={lerp(40, 80, sp)} s={sp} op={sp} />
      <FlatVirus cx={GREEN.x} cy={GREEN.y + 30} r={19 * tb} rot={t * 8} />
    </>
  );
};

// ---- Adegan 2 (kalimat 2-3): virus mencoba berpindah dari orang dengan HIV ke "kamu"; "Tidak." = terpental kembali
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const go = pr(t, T(2) + 0.15, T(2) + 1.9, sine) * 0.8;
  const back_ = pr(t, T(3) + 0.1, T(3) + 1.0, sine);
  const u = go * (1 - back_);
  const [vx, vy] = bez(u, [GREEN.x, GREEN.y + 30], [540, 650], [LAV.x - 40, LAV.y - 80]);
  const q = pop(t, T(2) + 0.9, 0.4) * (1 - pr(t, T(3), T(3) + 0.3));
  const cr = pop(t, T(3) + 0.05, 0.4) * (1 - pr(t, T(4) - 0.5, T(4) - 0.1));
  const spoonX = 690;
  return (
    <>
      <Persons a={-5} t={t} />
      <g transform="translate(540 1136)">
        <rect x={-380} y={0} width={760} height={26} rx={13} fill={LIB_COL.light} />
        <rect x={-320} y={26} width={22} height={100} rx={10} fill={LIB_COL.track} />
        <rect x={298} y={26} width={22} height={100} rx={10} fill={LIB_COL.track} />
      </g>
      <Plate x={540} y={1120} />
      <Spoon x={spoonX} y={1090} rot={80} />
      <L.SpeechBubble cx={LAV.x - 30} cy={LAV.y - 250} s={0.8 * q} op={q} text="?" w={200} tail="r" />
      <FlatVirus cx={vx} cy={vy} r={26} rot={t * 30} />
      <Badge kind="no" x={vx} y={vy - 90} s={0.7} k={cr} />
    </>
  );
};

// ---- Adegan 3 (kalimat 4): lima cairan disebut satu per satu, tiap tetes membawa virus
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const xs = [130, 335, 540, 745, 950];
  const labels = ['darah', 'air mani', 'cairan vagina', 'cairan dubur', 'ASI'];
  const ly = [1010, 1100, 1010, 1100, 1010];
  return (
    <>
      {FLUIDS.map((c, i) => {
        const slot = pop(t, T(4) + 1.4 + i * 0.35, 0.4);
        const a = CL(4, i + 1);
        const fill = pr(t, a - 0.05, a + 0.3, back);
        const hl = fill * (1 - pr(t, a + 0.7, a + 1.1));
        const lab = pr(t, a, a + 0.3);
        return (
          <React.Fragment key={i}>
            {fill < 0.98 && (
              <g transform={`translate(${xs[i]} 800) scale(${0.95 * slot})`} opacity={0.22 * slot * (1 - fill)}>
                <path d={DROP_D} fill="#fff" />
              </g>
            )}
            <Drop x={xs[i]} y={800 + bob(t, i, 4)} s={0.95 * fill * (1 + 0.22 * hl)} color={c} op={fill} t={t} />
            <SvgPill x={xs[i]} y={ly[i]} text={labels[i]} k="neutral" size={32} op={lab} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---- Adegan 4 (kalimat 5): makanan dan minuman bukan salah satu dari lima; sendok dan piring hanya bawa sisa makanan
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const s = T(5);
  const row = pr(t, s, s + 0.7, sine);
  const fd = pop(t, s + 0.5, 0.5);
  const x1 = pop(t, s + 1.5, 0.4);
  const c2 = CL(5, 1);
  const rm = pr(t, c2 - 0.2, c2 + 0.5);
  const sp = pop(t, c2 + 0.1, 0.5);
  const ok = pop(t, c2 + 1.4, 0.45);
  return (
    <>
      {FLUIDS.map((c, i) => (
        <Drop key={i} x={lerp(540 - 410 + i * 205, 150 + i * 195, row)} y={lerp(800, 560, row) + bob(t, i, 3)} s={lerp(0.95, 0.5, row)} color={c} op={1 - 0.3 * row} t={t} />
      ))}
      <g opacity={1 - rm}>
        <Plate x={380} y={960} s={1.0 * fd} op={fd} />
        <Glass x={690} y={950} s={1.5 * fd} op={fd} />
        <Badge kind="no" x={540} y={820} s={0.75} k={x1} />
      </g>
      <g>
        <Plate x={540} y={1020} s={1.15 * sp} op={sp} food={false} />
        <Spoon x={700} y={1000} rot={70} s={1.1 * sp} op={sp} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={470 + i * 40} cy={1012 + (i % 2) * 8} r={6} fill={FOOD[i % 3]} opacity={sp} />
        ))}
        <Badge kind="ok" x={540} y={880} s={0.65} k={ok} />
      </g>
    </>
  );
};

// ---- Adegan 5 (kalimat 6): air liur = tetes bening tanpa virus, tidak termasuk lima cairan
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const s = T(6);
  const sl = pop(t, s + 0.15, 0.5);
  const x1 = pop(t, s + 1.1, 0.45);
  return (
    <>
      {FLUIDS.map((c, i) => (
        <Drop key={i} x={150 + i * 195} y={560 + bob(t, i, 3)} s={0.5} color={c} op={0.7} t={t} />
      ))}
      <Drop x={540} y={950 + bob(t, 2, 5)} s={1.35 * sl} color={SAL} op={sl} virus={false} />
      <SvgPill x={540} y={1180} text="air liur" k="neutral" size={36} op={pop(t, s + 0.4, 0.3)} />
      <Badge kind="no" x={700} y={820} s={0.7} k={x1} />
    </>
  );
};

// ---- Adegan 6 (kalimat 7): kata NIH; tetes air liur dan sendok berpindah, virus tetap di dalam orang pertama
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const nih = pop(t, T(7) + 0.1, 0.5);
  const dr = pr(t, CL(7, 1) + 0.1, CL(7, 1) + 1.7, sine);
  const [dx, dy] = bez(dr, [GREEN.x + 60, GREEN.y - 110], [540, 640], [LAV.x - 70, LAV.y - 110]);
  const drO = pop(t, CL(7, 1) + 0.05, 0.3) * (1 - pr(t, CL(7, 1) + 1.7, CL(7, 1) + 2.0));
  const okA = pop(t, CL(7, 1) + 1.5, 0.4) * (1 - pr(t, CL(7, 2) - 0.3, CL(7, 2)));
  const c2 = CL(7, 2);
  const toMouth = pr(t, c2 + 0.1, c2 + 1.2, sine);
  const toNext = pr(t, c2 + 1.9, c2 + 3.4, sine);
  const spx = lerp(lerp(560, GREEN.x + 80, toMouth), LAV.x - 80, toNext);
  const spy = lerp(lerp(900, GREEN.y - 135, toMouth), LAV.y - 135, toNext);
  const spO = pop(t, c2, 0.4);
  const okB = pop(t, c2 + 3.2, 0.45);
  return (
    <>
      <Persons a={T(7) - 0.4} t={t} />
      <FlatVirus cx={GREEN.x} cy={GREEN.y + 30} r={19} rot={t * 8} />
      <g opacity={nih}>
        <L.Document cx={540} cy={560} s={1.0 * nih} stamp />
        <SvgPill x={540} y={730} text="NIH" k="neutral" size={36} op={nih} />
      </g>
      <Drop x={dx} y={dy} s={0.5} color={SAL} op={drO} virus={false} />
      <Badge kind="ok" x={LAV.x} y={LAV.y - 250} s={0.6} k={okA} />
      <Spoon x={spx} y={spy} rot={lerp(60, 20, toMouth)} s={0.8} op={spO} />
      <Badge kind="ok" x={LAV.x} y={LAV.y - 250} s={0.6} k={okB} />
    </>
  );
};

// ---- Adegan 7 (kalimat 8): tiga tetes bening (keringat, air mata, urine), tidak ada virus, masing-masing disilang
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const xs = [200, 540, 880];
  const cols = ['#BFE3F7', '#9ED0F2', '#F2DC7C'];
  const labels = ['keringat', 'air mata', 'urine'];
  const cs = [CL(8, 0), CL(8, 1), CL(8, 2)];
  return (
    <>
      {xs.map((x, i) => {
        const k = pop(t, cs[i], 0.45);
        const c = pop(t, cs[i] + 0.35, 0.4);
        return (
          <React.Fragment key={i}>
            <Drop x={x} y={880 + bob(t, i, 5)} s={1.1 * k} color={cols[i]} op={k} virus={false} />
            <SvgPill x={x} y={1090} text={labels[i]} k="neutral" size={34} op={k} />
            <Badge kind="no" x={x + 80} y={760} s={0.5} k={c} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---- Adegan 8 (kalimat 9): penularan butuh jalan masuk: gembok, lalu selaput lendir dan aliran darah
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const c1 = CL(9, 1), c2 = CL(9, 2);
  const lk = pop(t, c1 - 0.1, 0.45);
  const knock = pr(t, c1 + 0.3, c1 + 1.0, in3) * (1 - pr(t, c1 + 1.0, c1 + 1.5, out3));
  const lkS = lerp(2.3, 0.8, pr(t, c2 - 0.2, c2 + 0.5));
  const lkY = lerp(900, 520, pr(t, c2 - 0.2, c2 + 0.5));
  const A = win(t, c2 - 0.1, c2 + 2.3, 0.35);
  const B = win(t, c2 + 2.2, T(10) + 0.2, 0.35);
  const pa = pr(t, c2 + 0.3, c2 + 1.9, sine);
  const pb = pr(t, c2 + 2.3, c2 + 3.9, sine);
  const flowX = (t * 190) % 160;
  return (
    <>
      <g transform={`translate(${540 + 0} ${lkY})`}>
        <L.Lock cx={0} cy={0} s={lkS * lk} op={lk} />
      </g>
      <Drop x={lerp(180, 330, knock)} y={lerp(1000, 940, knock)} s={0.6 * lk * (1 - pr(t, c2 - 0.2, c2 + 0.2))} color={FL.darah} op={lk} t={t} />
      <g opacity={A}>
        <g transform="translate(540 1000)">
          <Tissue w={640} />
        </g>
        <Drop x={lerp(540, 540, pa)} y={lerp(700, 985, pa)} s={0.6 * (1 - 0.5 * pa)} color={FL.darah} op={1 - 0.5 * pa} t={t} />
        <SvgPill x={540} y={1330} text="selaput lendir" k="neutral" size={38} op={A} />
      </g>
      <g opacity={B}>
        <g transform="translate(540 1040)">
          <rect x={-470} y={-70} width={940} height={140} rx={70} fill="#C9434D" />
          <rect x={-450} y={-52} width={900} height={104} rx={52} fill="#F0616A" />
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse key={i} cx={-420 + ((i * 130 + flowX) % 840)} cy={i % 2 ? 14 : -14} rx={22} ry={13} fill="#C9434D" opacity={0.7} />
          ))}
        </g>
        <Drop x={540} y={lerp(720, 1040, pb)} s={0.6 * (1 - 0.6 * pb)} color={FL.darah} op={1 - pb} t={t} />
        <SvgPill x={540} y={1330} text="aliran darah" k="neutral" size={38} op={B} />
      </g>
    </>
  );
};

const Tissue: React.FC<{ w?: number }> = ({ w = 760 }) => (
  <g>
    <rect x={-w / 2} y={0} width={w} height={230} rx={40} fill="#E59A92" />
    <rect x={-w / 2} y={-34} width={w} height={64} rx={32} fill="#F6C1B8" />
    <rect x={-w / 2 + 40} y={-22} width={w - 200} height={12} rx={6} fill="#FFFFFF" opacity={0.5} />
  </g>
);

// ---- Adegan 9 (kalimat 10): makan bersama tidak membuka gembok: piring, sendok, gelas mendekat, gembok tetap tertutup
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const s = T(10);
  const lk = pop(t, s - 0.1, 0.4);
  const mv = pr(t, s + 0.2, s + 1.1, sine);
  const ok = pop(t, s + 1.2, 0.45);
  const bump = Math.sin(pr(t, s + 1.0, s + 1.4) * Math.PI) * 6;
  return (
    <>
      <L.Lock cx={760} cy={900} s={2.2 * lk} op={lk} />
      <Drop x={900} y={1110} s={0.55 * lk} color={FL.darah} op={lk} t={t} />
      <Plate x={lerp(160, 360, mv) - bump} y={1000} s={0.9} op={lk} />
      <Spoon x={lerp(160, 360, mv) + 100 - bump} y={900} rot={70} s={0.9} op={lk} />
      <Glass x={lerp(160, 360, mv) - bump} y={1130} s={1.2} op={lk} />
      <Badge kind="ok" x={760} y={690} s={0.65} k={ok} />
    </>
  );
};

// ---- Adegan 10 (kalimat 11-12): kondisi sangat jarang (satu titik langka), lalu berbagi alat makan tetap bukan aktivitas berisiko
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const c1 = CL(11, 1), c2 = CL(11, 2);
  const dots = pr(t, T(11), T(11) + 0.9);
  const rare = pop(t, c1 + 0.6, 0.5);
  const grid = (1 - pr(t, c2 - 0.3, c2 + 0.4));
  const bl = pop(t, c2 + 0.1, 0.5);
  const sa = pop(t, c2 + 0.4, 0.5);
  const mix = pr(t, c2 + 1.5, c2 + 2.4, sine);
  const toWound = pr(t, c2 + 2.6, c2 + 4.2, sine);
  const wound = pop(t, c2 + 2.3, 0.45);
  const small = pr(t, CL(12, 0) - 0.3, CL(12, 0) + 0.6, sine);
  const mixO = 1 - small;
  const shared = pop(t, CL(12, 1), 0.5);
  const sw = pr(t, CL(12, 1) + 0.5, CL(12, 1) + 2.0, sine);
  const ok = pop(t, CL(12, 1) + 2.0, 0.5);
  const dotsList = Array.from({ length: 24 }, (_, i) => ({ x: 150 + (i % 6) * 156, y: 640 + Math.floor(i / 6) * 120 }));
  const mixX = lerp(lerp(300, 540, mix), 700, toWound);
  const mixY = lerp(lerp(900, 880, mix), 1000, toWound);
  return (
    <>
      <g opacity={grid * (1 - small)}>
        {dotsList.map((d, i) => (i === 14 ? null : <circle key={i} cx={d.x} cy={d.y} r={20 * dots} fill="#B9C3D0" opacity={0.7 * dots} />))}
        <Drop x={dotsList[14].x} y={dotsList[14].y + 6} s={0.42 * rare} color={FL.darah} op={rare} t={t} />
        <circle cx={dotsList[14].x} cy={dotsList[14].y} r={64 * rare} fill="none" stroke="#F4D77E" strokeWidth={6} opacity={rare} />
        <SvgPill x={540} y={1210} text="sangat tidak biasa" k="neutral" size={36} op={rare} />
      </g>
      <g opacity={mixO} transform={`translate(${lerp(0, -300, small)} ${lerp(0, -380, small)}) scale(${lerp(1, 0.55, small)})`}>
        {t >= c2 && t < CL(12, 0) + 0.8 && (
          <>
            <g opacity={1 - mix * 0.0}>
              <Drop x={mixX - lerp(130, 0, mix) * (1 - toWound)} y={mixY} s={1.3 * bl * (1 - 0.0)} color={FL.darah} op={bl} t={t} />
              <Drop x={mixX + lerp(150, 0, mix) * (1 - toWound)} y={mixY + 20} s={0.8 * sa} color={SAL} op={sa * (1 - 0.5 * mix)} virus={false} />
            </g>
            <g opacity={wound}>
              <g transform="translate(700 1110)">
                <rect x={-210} y={0} width={420} height={130} rx={36} fill="#F7C6A5" />
                <path d="M -26 0 L 0 62 L 26 0 Z" fill="#C9434D" />
              </g>
              <SvgPill x={700} y={1290} text="luka" k="neutral" size={34} op={wound} />
            </g>
          </>
        )}
      </g>
      <g opacity={shared}>
        <L.Person cx={GREEN.x + 40} cy={1050} s={1.1 * shared} color={PAS} />
        <L.Person cx={LAV.x - 40} cy={1050} s={1.1 * shared} color={KAMU} />
        <Plate x={540} y={1120} s={shared} />
        <Spoon x={lerp(GREEN.x + 130, LAV.x - 130, sw)} y={lerp(960, 960, sw) - Math.sin(sw * Math.PI) * 120} rot={lerp(40, -40, sw)} s={0.85} />
        <Badge kind="ok" x={540} y={760} s={0.8} k={ok} />
      </g>
    </>
  );
};

// ---- Adegan 11 (kalimat 13): menurut WHO, ciuman, pelukan, berbagi makanan tidak menularkan HIV
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const who = pop(t, T(13) + 0.1, 0.5);
  const cols = [180, 540, 900];
  const starts = [CL(13, 1), CL(13, 2), CL(13, 3)];
  const labels = ['ciuman', 'pelukan', 'berbagi makanan'];
  const kis = pr(t, starts[0] + 0.2, starts[0] + 1.0, sine);
  const hug = pr(t, starts[1] + 0.05, starts[1] + 0.6, sine);
  return (
    <>
      <g opacity={who}>
        <L.Document cx={540} cy={480} s={0.8 * who} stamp />
        <SvgPill x={700} y={480} text="WHO" k="neutral" size={36} op={who} />
      </g>
      {cols.map((cx, i) => {
        const k = pop(t, starts[i], 0.5);
        const c = pop(t, starts[i] + 0.9, 0.45);
        return (
          <React.Fragment key={i}>
            <g opacity={k}>
              {i === 0 && (
                <>
                  <L.Person cx={cx - lerp(70, 40, kis)} cy={950} s={0.8} color={PAS} rot={lerp(0, 14, kis)} />
                  <L.Person cx={cx + lerp(70, 40, kis)} cy={950} s={0.8} color={KAMU} rot={lerp(0, -14, kis)} />
                  <L.Heart cx={cx} cy={780} s={0.32 * kis} op={kis} color="#F4A6C8" />
                </>
              )}
              {i === 1 && <L.Embrace cx={cx} cy={960} s={lerp(0.75, 0.95, hug)} heart={false} />}
              {i === 2 && (
                <>
                  <L.Person cx={cx - 90} cy={950} s={0.8} color={PAS} />
                  <L.Person cx={cx + 90} cy={950} s={0.8} color={KAMU} />
                  <Plate x={cx} y={1030} s={0.55} />
                </>
              )}
            </g>
            <Badge kind="ok" x={cx} y={700} s={0.5} k={c} />
            <SvgPill x={cx} y={1160} text={labels[i]} k="neutral" size={30} op={k} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---- Adegan 12 (kalimat 14-15): tidak perlu memisahkan alat makan; piring sama, meja makan ramai
const Scene12: React.FC<{ t: number }> = ({ t }) => {
  const s = T(14);
  const sets = pop(t, s, 0.5);
  const split = pr(t, s + 0.3, s + 1.0, sine);
  const bar = pop(t, s + 0.8, 0.4) * (1 - pr(t, s + 1.9, s + 2.3));
  const x1 = pop(t, s + 1.2, 0.4) * (1 - pr(t, s + 1.9, s + 2.3));
  const merge = pr(t, s + 2.0, s + 2.7, sine) * (1 - 0);
  const lx = lerp(lerp(300, 150, split), 400, merge);
  const rx = lerp(lerp(780, 930, split), 680, merge);
  const c1 = CL(15, 1);
  const tbl = pop(t, c1 - 0.2, 0.5);
  const cols = ['#8FBDF7', '#F4D77E', '#FF9C85', '#B9A2F5', '#7ED6A8', '#8FBDF7'];
  const xs = [140, 290, 440, 640, 790, 940];
  const solo = 1 - pr(t, c1 - 0.3, c1 + 0.2);
  const same = pop(t, CL(15, 0) + 0.1, 0.5);
  return (
    <>
      <g opacity={solo * (1 - same * 0)}>
        <g opacity={sets * (1 - same)}>
          <Plate x={lx} y={1040} s={0.8} />
          <Spoon x={lx + 90} y={960} rot={70} s={0.7} />
          <Plate x={rx} y={1040} s={0.8} />
          <Spoon x={rx + 90} y={960} rot={70} s={0.7} />
        </g>
        <g opacity={bar}>
          <rect x={522} y={760} width={36} height={420} rx={18} fill="#EAF2FB" />
          <Badge kind="no" x={540} y={700} s={0.7} k={x1} />
        </g>
        <g opacity={same}>
          <Plate x={540} y={1040} s={1.0 * same} />
          <Spoon x={640} y={960} rot={70} s={0.85} />
          <Badge kind="ok" x={540} y={820} s={0.7} k={same} />
        </g>
      </g>
      <g opacity={tbl}>
        {xs.map((x, i) => {
          const k = pop(t, c1 + 0.2 + i * 0.22, 0.45);
          return <L.Person key={i} cx={x} cy={lerp(1060, 1010, k)} s={0.95 * k} op={k} color={cols[i]} />;
        })}
        <g transform="translate(540 1070) scale(1.4)">
          <L.DiningTable cx={0} cy={0} w={680} s={1} />
        </g>
      </g>
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
export const S2E5Full: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = gradAt(t);
  const cue = CUES.find((c) => t >= c.a - 0.05 && t < c.b);
  const ck = cue ? Math.min(1, (t - cue.a + 0.05) / 0.18) : 0;
  const subOn = t < CLOSE - 0.05;
  const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10, Scene11, Scene12];
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
          <LegendBox t={t} a={T(1) + 0.6} b={T(4) - 0.1} items={[['#FF9C85', 'Virus HIV']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile("vo/S2E5.mp3")} />
    </AbsoluteFill>
  );
};
