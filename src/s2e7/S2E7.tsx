import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL, Star } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T, T, TE, CL, EP_DUR } from './timeline';

export const S2E7_FRAMES = Math.ceil(EP_DUR * FPS);

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

Centers for Disease Control and Prevention. Can HIV be transmitted by mosquitoes or other insects? (HIV/AIDS Questions and Answers, arsip).
https://webarchive.library.unt.edu/web/20080917231759/http:/www.cdc.gov/hiv/resources/qa/qa32.htm

Centers for Disease Control and Prevention. How HIV Spreads.
https://www.cdc.gov/hiv/causes/index.html`;

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
const BG: Grad[] = [B1, B1, B2, B2, B3, B4, B1, B1, B3, B2, B4, B1];

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
      {green && g > 0.02 && <FlatVirus cx={GREEN.x} cy={GREEN.y + 30} r={17 * g} rot={t * 8} />}
      {lav && <L.Person cx={LAV.x} cy={LAV.y} s={1.15 * l} op={l} color={KAMU} />}
    </>
  );
};

// ================= komponen episode ini =================
const BLOOD = '#F0616A';
const rad = (d: number) => (d * Math.PI) / 180;
// nyamuk: flip = menghadap kiri. wing = fase kepak (cepat saat terbang)
const Mq: React.FC<{ x: number; y: number; s?: number; rot?: number; flip?: boolean; belly?: number; prob?: number; t: number; fly?: boolean; op?: number }> = ({ x, y, s = 1, rot = 0, flip = false, belly = 0, prob = 1, t, fly = true, op = 1 }) =>
  s < 0.02 || op < 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} opacity={op}>
      <L.Mosquito cx={0} cy={0} s={s} rot={rot} belly={belly} prob={prob} wing={fly ? t * 46 : 0.3} />
    </g>
  );
// ujung belalai (koordinat kanvas)
const tipOf = (x: number, y: number, s: number, rot: number, flip: boolean, prob = 1) => {
  const L_ = s * (70 + 90 * prob);
  return [x + (flip ? -1 : 1) * L_ * Math.cos(rad(rot)), y + L_ * Math.sin(rad(rot))];
};
// posisi badan nyamuk supaya ujung belalai tepat di (tx,ty)
const bodyFor = (tx: number, ty: number, s: number, rot: number, flip: boolean) => {
  const L_ = s * 160;
  return [tx - (flip ? -1 : 1) * L_ * Math.cos(rad(rot)), ty - L_ * Math.sin(rad(rot))];
};
const GATE = '#E8B896';

// ---- Adegan 1 (kalimat 1): nyamuk menggigit orang dengan HIV (perut terisi), lalu terbang dan menggigit "kamu"
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const s = 0.8;
  const [gx, gy] = bodyFor(215, 1040, s, 35, true); // gigit orang dengan HIV
  const [lx, ly] = bodyFor(868, 1040, s, 35, false); // gigit kamu
  const fin = pr(t, 0, 1.3, sine);
  const x1 = lerp(620, gx, fin), y1 = lerp(560, gy, fin);
  const belly = pr(t, 1.5, 2.6, sine);
  const mv = pr(t, CL(1, 1), CL(1, 1) + 1.1, sine);
  const arc = Math.sin(mv * Math.PI) * 170;
  const x = t < CL(1, 1) ? x1 : lerp(gx, lx, mv);
  const y = t < CL(1, 1) ? y1 : lerp(gy, ly, mv) - arc;
  const flip = mv < 0.5;
  const rot = t < CL(1, 1) ? lerp(0, 35, fin) : lerp(35, 35, mv);
  return (
    <>
      <Persons a={0.05} t={t} />
      <Mq x={x} y={y} s={s} rot={rot} flip={flip} belly={t < CL(1, 1) ? belly : 1} t={t} fly={fin < 1 || (mv > 0 && mv < 1)} prob={1} />
    </>
  );
};

// ---- Adegan 2 (kalimat 2-3): virus mencoba berpindah lewat nyamuk ke "kamu"; "Tidak." = terpental kembali
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const s = 0.8;
  const [lx, ly] = bodyFor(868, 1040, s, 35, false);
  const go = pr(t, T(2) + 0.15, T(2) + 1.9, sine) * 0.8;
  const back_ = pr(t, T(3) + 0.1, T(3) + 1.0, sine);
  const u = go * (1 - back_);
  const [vx, vy] = bez(u, [GREEN.x, GREEN.y + 30], [540, 650], [LAV.x - 110, LAV.y - 90]);
  const q = pop(t, T(2) + 0.9, 0.4) * (1 - pr(t, T(3), T(3) + 0.3));
  const cr = pop(t, T(3) + 0.05, 0.4) * (1 - pr(t, T(4) - 0.5, T(4) - 0.1));
  return (
    <>
      <Persons a={-5} t={t} />
      <Mq x={lx} y={ly} s={s} rot={35} belly={1} t={t} fly={false} />
      <L.SpeechBubble cx={LAV.x - 30} cy={LAV.y - 280} s={0.8 * q} op={q} text="?" w={200} tail="r" />
      <FlatVirus cx={vx} cy={vy} r={26} rot={t * 30} />
      <Badge kind="no" x={vx} y={vy - 90} s={0.7} k={cr} />
    </>
  );
};

// ---- Adegan 3 (kalimat 4-5): alasan pertama; nyamuk menyuntikkan air liur sendiri, bukan darah korban sebelumnya
const BIGP = { x: 720, y: 1130, s: 1.5 };
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const s = 1.1;
  const [bx, by] = bodyFor(668, 1100, s, 40, false);
  const fin = pr(t, T(4) + 0.1, T(5) + 0.9, sine);
  const poke = pr(t, CL(5, 1), CL(5, 1) + 0.5) * 12;
  const x = lerp(160, bx, fin) - poke * 0.7, y = lerp(560, by, fin) + poke * 0.5;
  const pp = pop(t, T(4), 0.5);
  const [tx, ty] = tipOf(bx, by, s, 40, false);
  const c2 = CL(5, 2);
  const drops = [0, 1, 2, 3].map((i) => {
    const u = ((t - (c2 + 0.1 + i * 0.5)) / 0.9);
    return u < 0 || u > 1 ? null : { u, i };
  });
  const lab = pr(t, c2 + 0.1, c2 + 0.5) * (1 - pr(t, CL(5, 3) - 0.2, CL(5, 3) + 0.1));
  const c3 = CL(5, 3);
  const rd = pop(t, c3, 0.5);
  const crs = pop(t, c3 + 0.9, 0.4);
  const fade = 1 - pr(t, T(6) - 0.7, T(6) - 0.2);
  return (
    <g opacity={fade}>
      <L.Person cx={BIGP.x} cy={BIGP.y} s={BIGP.s * pp} op={pp} color={KAMU} />
      <Mq x={x} y={y} s={s} rot={40} belly={0.3} t={t} fly={fin < 1} />
      {drops.map((d) =>
        d ? (
          <g key={d.i} transform={`translate(${tx + d.u * 22} ${ty + d.u * 70}) scale(${0.34})`} opacity={Math.sin(d.u * Math.PI)}>
            <path d={DROP_D} fill={SAL} />
          </g>
        ) : null,
      )}
      <SvgPill x={420} y={1030} text="air liur" k="neutral" size={32} op={lab} />
      <g opacity={rd * (1 - crs * 0.0)}>
        <g transform={`translate(330 800) scale(${0.8 * rd})`}>
          <path d={DROP_D} fill={BLOOD} />
          <FlatVirus cx={4} cy={30} r={25} rot={t * 24} />
        </g>
        <Badge kind="no" x={330} y={800} s={0.85} k={crs} />
      </g>
    </g>
  );
};

// ---- Adegan 4 (kalimat 6): belalai hanya menyisakan darah sangat kecil (tetes mengecil jauh di bawah ukuran semula)
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const s = 1.5;
  const fin = pop(t, T(6), 0.6);
  const [tx, ty] = tipOf(460, 880, s, 0, false);
  const c = CL(6, 1);
  const shrink = pr(t, c + 0.4, c + 3.0, sine);
  const dropS = lerp(1, 0.1, shrink);
  const ghost = pop(t, c, 0.5) * (1 - pr(t, TE(6) - 0.3, TE(6) + 0.2));
  const mag = pop(t, c + 2.6, 0.5);
  return (
    <>
      <Mq x={460} y={880} s={s * fin} rot={0} belly={0.35} t={t} fly={false} op={fin} />
      <g opacity={0.3 * ghost} transform={`translate(${tx + 10} ${ty + 120}) scale(0.95)`}>
        <path d={DROP_D} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="14 12" />
      </g>
      <g transform={`translate(${tx + 10} ${ty + 20 + 100 * dropS}) scale(${0.95 * dropS})`}>
        <path d={DROP_D} fill={BLOOD} />
        <FlatVirus cx={4} cy={30} r={25} rot={t * 24} dim={1 - 0.4 * shrink} />
      </g>
      <g opacity={mag}>
        <L.Magnifier cx={tx + 10} cy={ty + 40} s={0.7 * mag} />
      </g>
    </>
  );
};

// ---- Adegan 5 (kalimat 7): setelah makan nyamuk istirahat di daun untuk mencerna (jam berjalan), tidak langsung menggigit orang lain
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const c1 = CL(7, 1), c2 = CL(7, 2);
  const land = pr(t, T(7), T(7) + 1.0, sine);
  const digest = pr(t, c1, TE(7) - 2.2, sine);
  const clk = pop(t, c1 - 0.2, 0.5);
  const lav = pop(t, c2 - 0.1, 0.5);
  const arrow = pop(t, c2 + 0.3, 0.5);
  const cr = pop(t, c2 + 0.9, 0.5);
  return (
    <>
      <g transform="translate(330 1170) rotate(-6)">
        <ellipse cx={0} cy={0} rx={250} ry={46} fill="#5FBF8F" />
        <path d="M -230 2 Q 0 -6 230 2" fill="none" stroke="#3FAF7C" strokeWidth={8} />
      </g>
      <Mq x={lerp(240, 330, land)} y={lerp(700, 1070, land)} s={1.1} rot={0} belly={lerp(1, 0.15, digest)} t={t} fly={land < 1} />
      <g opacity={clk}>
        <L.Clock cx={700} cy={760} s={0.95 * clk} frac={digest * 0.8 + 0.1} hour={3} />
      </g>
      <L.Person cx={890} cy={1150} s={1.1 * lav} op={lav} color={KAMU} />
      <g opacity={arrow}>
        <path d="M 440 1060 Q 650 880 790 1080" fill="none" stroke="#EAF2FB" strokeWidth={9} strokeDasharray="22 16" strokeLinecap="round" />
      </g>
      <Badge kind="no" x={640} y={950} s={0.7} k={cr} />
    </>
  );
};

// ---- Adegan 6 (kalimat 8): HIV tidak berkembang biak dan tidak bertahan hidup di dalam serangga
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const s = 2.2;
  const mx = 450, my = 960;
  const big = pop(t, T(8), 0.6);
  const star = pop(t, CL(8, 1), 0.5) * (1 - pr(t, CL(8, 2) - 0.2, CL(8, 2) + 0.2));
  const c3 = CL(8, 2);
  const vin = pop(t, c3 + 0.2, 0.5);
  const tryA = pr(t, c3 + 1.2, c3 + 2.0, sine);
  const tryB = pr(t, c3 + 2.0, c3 + 2.6, in3);
  const cr = pop(t, c3 + 2.5, 0.4);
  const die = pr(t, c3 + 2.9, TE(8) - 0.2, sine);
  const bx = mx - 70 * s, by = my + 4 * s;
  return (
    <>
      <Mq x={mx} y={my} s={s * big} rot={0} belly={1} t={t} fly={false} op={big} />
      <g opacity={star}>
        <Star cx={mx} cy={560 + 14 * Math.sin(t * 6)} r={70} fill={SHAPE_COL.receptor} />
      </g>
      {[0, 1].map((i) => (
        <g key={i} opacity={tryA * (1 - tryB) * 0.55}>
          <FlatVirus cx={bx + (i ? 44 : -44) * tryA} cy={by + (i ? -26 : 30) * tryA} r={22 * tryA} />
        </g>
      ))}
      <Virus x={bx} y={by} r={34 * vin * (1 - 0.35 * die)} dim={1 - 0.7 * die} t={t} />
      <Badge kind="no" x={bx + 10} y={by - 150} s={0.8} k={cr} />
    </>
  );
};

// ---- bagian bersama adegan 7-8: daerah banyak nyamuk dan banyak kasus HIV
const SWARM = [
  [180, 760, 0.55, 0], [330, 640, 0.5, 1.1], [520, 720, 0.6, 2.2], [700, 620, 0.5, 3.3], [880, 740, 0.55, 4.4], [420, 860, 0.5, 5.5], [800, 880, 0.5, 6.6],
];
const SwarmArea: React.FC<{ t: number; a: number }> = ({ t, a }) => (
  <>
    {[130, 335, 540, 745, 950].map((x, i) => {
      const k = pop(t, a + i * 0.18, 0.5);
      return (
        <g key={i} opacity={k}>
          <L.Person cx={x} cy={lerp(1230, 1170, k)} s={0.9 * k} color={PAS} />
          <L.BodyLens cx={x} cy={1170 + 24} s={0.85 * k} />
        </g>
      );
    })}
    {SWARM.map(([x, y, s, ph], i) => {
      const k = pop(t, a + 0.2 + i * 0.12, 0.5);
      return <Mq key={i} x={x + 40 * Math.sin(t * 1.6 + ph)} y={y + 30 * Math.cos(t * 2.1 + ph)} s={s * k} rot={Math.sin(t * 2 + ph) * 8} flip={Math.cos(t * 1.6 + ph) < 0} t={t + ph} op={k} />;
    })}
  </>
);

// ---- Adegan 7 (kalimat 9): bagaimana dengan daerah yang banyak nyamuk dan banyak kasus HIV?
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const q = pop(t, T(9) + 1.4, 0.5);
  return (
    <>
      <SwarmArea t={t} a={T(9) + 0.05} />
      <L.SpeechBubble cx={540} cy={470} s={0.9 * q} op={q} text="?" w={220} tail="l" />
    </>
  );
};

// ---- Adegan 8 (kalimat 10): CDC tidak menemukan bukti penularan lewat nyamuk atau serangga lain
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const doc = pop(t, CL(10, 1), 0.6);
  const sx = pr(t, CL(10, 1) + 0.4, CL(10, 1) + 3.4, sine);
  const mag = pop(t, CL(10, 1) + 0.2, 0.4);
  const cr = pop(t, CL(10, 1) + 3.5, 0.45);
  return (
    <>
      <SwarmArea t={t} a={-9} />
      <g opacity={doc}>
        <L.Document cx={540} cy={470} s={0.95 * doc} stamp />
        <SvgPill x={730} y={470} text="CDC" k="neutral" size={36} op={doc} />
      </g>
      <g opacity={mag}>
        <L.Magnifier cx={lerp(190, 880, sx)} cy={lerp(820, 760, Math.sin(sx * Math.PI))} s={0.9 * mag} />
      </g>
      <g opacity={cr}>
        <path d="M 520 800 Q 420 1000 335 1140" fill="none" stroke="#EAF2FB" strokeWidth={9} strokeDasharray="22 16" strokeLinecap="round" />
        <Badge kind="no" x={430} y={980} s={0.8} k={cr} />
      </g>
    </>
  );
};

// ---- Adegan 9 (kalimat 11): HIV butuh kontak cairan tubuh lewat selaput lendir, luka terbuka, atau langsung ke aliran darah
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const gx = [200, 540, 880];
  const gy = 1130;
  const a = [T(11) + 2.6, CL(11, 1) - 0.5, CL(11, 2) - 0.4];
  const arrive = [T(11) + 3.4, CL(11, 1) + 0.3, CL(11, 2) + 0.3];
  const k = a.map((v) => pop(t, v, 0.5));
  const dr = pop(t, T(11) + 0.1, 0.5);
  // posisi tetes: awal di atas, lalu ke tiap gerbang
  const p0 = [540, 640];
  const pts = [p0, [gx[0] + 30, gy - 130], [gx[1], gy - 130], [gx[2] - 30, gy - 130]];
  const e1 = pr(t, arrive[0] - 0.9, arrive[0], sine);
  const e2 = pr(t, arrive[1] - 0.9, arrive[1], sine);
  const e3 = pr(t, arrive[2] - 0.9, arrive[2], sine);
  const px = lerp(lerp(lerp(pts[0][0], pts[1][0], e1), pts[2][0], e2), pts[3][0], e3);
  const py = lerp(lerp(lerp(pts[0][1], pts[1][1], e1), pts[2][1], e2), pts[3][1], e3);
  const hit = [arrive[0], arrive[1], arrive[2]].map((v) => Math.sin(Math.min(1, Math.max(0, (t - v) / 0.5)) * Math.PI));
  const end = pr(t, arrive[2], arrive[2] + 1.0, sine);
  return (
    <>
      {/* selaput lendir */}
      <g opacity={k[0]} transform={`translate(${gx[0]} ${gy}) scale(${k[0]})`}>
        <path d="M -120 -20 Q -60 -60 0 -20 Q 60 20 120 -20 L 120 50 Q 60 90 0 50 Q -60 10 -120 50 Z" fill="#F4A6C8" />
        <ellipse cx={-50} cy={-8} rx={30} ry={8} fill="#fff" opacity={0.3} />
      </g>
      {/* kulit dengan luka terbuka */}
      <g opacity={k[1]} transform={`translate(${gx[1]} ${gy}) scale(${k[1]})`}>
        <path d="M -120 -30 H -18 L 0 10 L 18 -30 H 120 V 50 H -120 Z" fill={GATE} />
        <path d="M -18 -30 L 0 10 L 18 -30 Z" fill={BLOOD} />
      </g>
      {/* pembuluh darah */}
      <g opacity={k[2]} transform={`translate(${gx[2]} ${gy}) scale(${k[2]})`}>
        <rect x={-120} y={-34} width={240} height={84} rx={42} fill="#C9434D" />
        <rect x={-114} y={-26} width={228} height={68} rx={34} fill={BLOOD} />
        {[-70, -10, 50].map((x) => (
          <ellipse key={x} cx={x + ((t * 60) % 40)} cy={8} rx={18} ry={11} fill="#FF9AA0" opacity={0.8} />
        ))}
      </g>
      {hit.map((h, i) => (h > 0.02 ? <circle key={i} cx={gx[i]} cy={gy - 20} r={30 + 90 * h} fill="#fff" opacity={0.22 * (1 - h)} /> : null))}
      <Drop x={px} y={py} s={0.95 * dr * (1 - 0.0) } color={FL_BLOOD} op={dr * (1 - end * 0.15)} t={t} />
      <SvgPill x={gx[0]} y={gy + 130} text="selaput lendir" k="neutral" size={28} op={k[0]} />
      <SvgPill x={gx[1]} y={gy + 130} text="luka terbuka" k="neutral" size={28} op={k[1]} />
      <SvgPill x={gx[2]} y={gy + 130} text="aliran darah" k="neutral" size={28} op={k[2]} />
    </>
  );
};
const FL_BLOOD = '#F0616A';

// ---- Adegan 10 (kalimat 12): jarum suntik yang dipakai bergantian memang bisa menularkan (bukan nyamuk)
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const c1 = T(12), c2 = CL(12, 1);
  const pp = pop(t, c1 - 0.2, 0.5);
  const sy = pop(t, c1 + 0.1, 0.5);
  const draw = pr(t, c1 + 0.7, c1 + 1.5, sine);
  const mv = pr(t, c1 + 1.7, c2 - 0.1, sine);
  const inj = pr(t, c2 + 0.2, c2 + 1.0, sine);
  const rot = lerp(180, 0, mv);
  const x = lerp(430, 650, mv), y = lerp(1010, 1000, mv) - Math.sin(mv * Math.PI) * 120;
  const fill = lerp(0.25, 0.95, draw) * (1 - 0.65 * inj);
  const vk = pr(t, c2 + 0.1, c2 + 1.2, sine);
  const [vx, vy] = [lerp(x + 120, LAV.x - 40, vk), lerp(y, LAV.y - 30, vk)];
  const ring = Math.sin(pr(t, c2 + 1.1, c2 + 1.8) * Math.PI);
  return (
    <>
      <L.Person cx={200} cy={1100} s={1.1 * pp} op={pp} color={PAS} />
      {pp > 0.02 && <Lens x={200} y={1130} />}
      <L.Person cx={880} cy={1100} s={1.1 * pp} op={pp} color={KAMU} />
      <g opacity={sy} transform={`translate(${x} ${y}) rotate(${rot}) scale(${1.25 * sy})`}>
        <L.Syringe cx={0} cy={0} fill={0.06} />
        <rect x={-92} y={-22} width={Math.max(0, 150 * fill - 8)} height={44} rx={11} fill={BLOOD} />
        <rect x={-92} y={-22} width={Math.max(0, 150 * fill - 8)} height={44} rx={11} fill="#fff" opacity={0} />
      </g>
      {vk > 0.02 && vk < 0.999 && <FlatVirus cx={vx} cy={vy} r={22} rot={t * 30} />}
      {ring > 0.01 && <circle cx={LAV.x} cy={LAV.y + 20} r={80 + 70 * ring} fill="#fff" opacity={0.22 * (1 - ring)} />}
    </>
  );
};

// ---- Adegan 11 (kalimat 13): tidak perlu takut pada nyamuk, apalagi menjauhi orang dengan HIV
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const c2 = CL(13, 1);
  const lv = pop(t, T(13), 0.5);
  const ok = pop(t, T(13) + 0.6, 0.5);
  const near = pr(t, c2 + 0.1, c2 + 1.4, sine);
  const g = pop(t, c2 - 0.2, 0.5);
  const emb = pr(t, c2 + 1.3, c2 + 1.8, sine);
  return (
    <>
      <g opacity={1 - emb}>
        <L.Person cx={lerp(330, 480, near)} cy={1110} s={1.15 * lv} op={lv} color={KAMU} />
        <L.Person cx={lerp(900, 600, near)} cy={1110} s={1.15 * g} op={g} color={PAS} />
        {g > 0.02 && <Lens x={lerp(900, 600, near)} y={1140} />}
      </g>
      <g opacity={emb}>
        <L.Embrace cx={540} cy={1100} s={1.25} />
      </g>
      <g opacity={1 - emb * 0.0}>
        <Mq x={700 + 30 * Math.sin(t * 1.4)} y={700 + 20 * Math.cos(t * 1.9)} s={0.75 * lv} rot={Math.sin(t * 2) * 6} t={t} op={lv} />
        <Badge kind="ok" x={700} y={560} s={0.6} k={ok} />
      </g>
    </>
  );
};

// ---- Adegan 12 (kalimat 14): dari gigitan nyamuk, yang perlu dikhawatirkan hanya gatalnya
const Scene12: React.FC<{ t: number }> = ({ t }) => {
  const s = 0.85;
  const p = pop(t, T(14), 0.5);
  const [bx, by] = bodyFor(640, 1060, s, 40, false);
  const fin = pr(t, T(14), CL(14, 0) + 0.8, sine);
  const leave = pr(t, CL(14, 1) - 0.3, CL(14, 1) + 1.2, in3);
  const x = lerp(lerp(180, bx, fin), 980, leave), y = lerp(lerp(600, by, fin), 380, leave);
  const bump = pop(t, CL(14, 0) + 0.8, 0.5);
  const wig = Math.sin(t * 22) * 4;
  const itch = pop(t, CL(14, 1) + 0.1, 0.5);
  return (
    <>
      <L.Person cx={720} cy={1130} s={1.5 * p} op={p} color={KAMU} />
      <Mq x={x} y={y} s={s} rot={lerp(0, 40, fin * (1 - leave))} belly={0.4} t={t} fly={fin < 1 || leave > 0} />
      <circle cx={640} cy={1062} r={20 * bump} fill="#FF8A7A" />
      <g opacity={itch} stroke="#FF8A7A" strokeWidth={8} strokeLinecap="round">
        {[0, 1, 2].map((i) => (
          <line key={i} x1={600 + i * 38 + wig} y1={985 - (i === 1 ? 14 : 0)} x2={618 + i * 38 + wig} y2={1010 - (i === 1 ? 14 : 0)} />
        ))}
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
export const S2E7Full: React.FC = () => {
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
          <LegendBox t={t} a={0.4} b={T(2) + 1.6} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={CL(5, 3) + 0.2} b={CL(5, 3) + 2.4} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={CL(8, 2) + 0.4} b={CL(8, 2) + 4.6} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(11) + 0.4} b={T(11) + 4.4} items={[['#FF9C85', 'Virus HIV']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile("vo/S2E7.mp3")} />
    </AbsoluteFill>
  );
};
