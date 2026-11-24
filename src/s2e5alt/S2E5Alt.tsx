import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL } from '../shared/shapes';
import { Actor, ActorSide, Chair, POSES_FRONT, POSES_SIDE, NEUTRAL, NEUTRAL_SIDE } from '../shared/actor';
import type { ActorRole, Pose, SidePose } from '../shared/actor';
import { CUES, CLOSE, SCENE_T, T, TE, CL, EP_DUR } from './timeline';

export const S2E5ALT_FRAMES = Math.ceil(EP_DUR * FPS);

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

const Badge: React.FC<{ kind: 'ok' | 'no'; x: number; y: number; s?: number; k: number }> = ({ kind, x, y, s = 0.6, k }) =>
  k < 0.02 ? null : kind === 'ok' ? <L.CheckBadge cx={x} cy={y} s={s * k} op={k} /> : <L.CrossBadge cx={x} cy={y} s={s * k} op={k} />;

const bez = (u: number, p0: number[], c: number[], p2: number[]) => [
  (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p2[0],
  (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p2[1],
];

// =============== tokoh: HANYA karakter modular resmi (src/shared/actor.tsx). Gerak = interpolasi sudut sendi antar pose per frame. ===============
type J3 = [number, number, number];
const cl = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const mj = (a: J3, b: J3, k: number): J3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const mixS = (a: SidePose, b: SidePose, k: number): SidePose => {
  const A = { ...NEUTRAL_SIDE, ...a }, B = { ...NEUTRAL_SIDE, ...b };
  return { lean: lerp(A.lean, B.lean, k), head: lerp(A.head, B.head, k), armN: mj(A.armN, B.armN, k), armF: mj(A.armF, B.armF, k), legN: mj(A.legN, B.legN, k), legF: mj(A.legF, B.legF, k) };
};
const mixF = (a: Pose, b: Pose, k: number): Pose => {
  const A = { ...NEUTRAL, ...a }, B = { ...NEUTRAL, ...b };
  return { lean: lerp(A.lean, B.lean, k), head: lerp(A.head, B.head, k), armL: mj(A.armL, B.armL, k), armR: mj(A.armR, B.armR, k), legL: mj(A.legL, B.legL, k), legR: mj(A.legR, B.legR, k) };
};
// siklus jalan: dua ujung langkah (N dan F bertukar), diinterpolasi dengan sinus
const JALAN_B: SidePose = { legN: POSES_SIDE.jalan.legF, legF: POSES_SIDE.jalan.legN, armN: POSES_SIDE.jalan.armF, armF: POSES_SIDE.jalan.armN, lean: 4 };
const jalan = (ph: number) => mixS(POSES_SIDE.jalan, JALAN_B, (Math.sin(ph) + 1) / 2);

const cyOf = (gy: number, s: number, seated = false) => gy - (seated ? 218 : 354) * s;
type SideProps = { x: number; gy: number; s: number; role: ActorRole; pose?: SidePose; face?: 1 | -1; seated?: boolean; chair?: boolean; op?: number };
// orang tampak samping; face = -1 mencerminkan (menghadap kiri). Kursi dan orang duduk berbagi titik pusat panggul.
const Hum: React.FC<SideProps> = ({ x, gy, s, role, pose, face = 1, seated = false, chair = false, op = 1 }) => {
  if (op < 0.005 || s < 0.01) return null;
  const cy = cyOf(gy, s, seated);
  return (
    <g transform={face === -1 ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
      {chair && <Chair cx={x} cy={cy} s={s} op={op} />}
      <ActorSide cx={x} cy={cy} s={s} role={role} pose={pose} op={op} />
    </g>
  );
};
const Fr: React.FC<{ x: number; gy: number; s: number; role: ActorRole; pose?: Pose; op?: number }> = ({ x, gy, s, role, pose, op = 1 }) =>
  op < 0.005 || s < 0.01 ? null : <Actor cx={x} cy={cyOf(gy, s)} s={s} role={role} pose={pose} op={op} />;

// posisi dunia dari titik lokal tampak samping (memperhitungkan lean dan cermin)
const sideW = (x: number, cy: number, s: number, face: number, lean: number, lx: number, ly: number) => {
  const r = (cl(lean, -20, 40) * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  const dx = lx, dy = ly + 50;
  return { x: x + face * s * (dx * c - dy * sn), y: cy + s * (dx * sn + dy * c - 50) };
};
const dirA = (deg: number) => [Math.sin((deg * Math.PI) / 180), Math.cos((deg * Math.PI) / 180)];
// pusat telapak tangan (sendi sudah dibatasi seperti di actor.tsx)
const handSide = (x: number, gy: number, s: number, pose: SidePose, face: 1 | -1, seated = false, which: 'armN' | 'armF' = 'armN') => {
  const P = { ...NEUTRAL_SIDE, ...pose };
  const a = P[which];
  const a0 = cl(a[0], -60, 165), a1 = cl(a[1], 0, 135);
  const u = dirA(a0), f = dirA(a0 + a1);
  return sideW(x, cyOf(gy, s, seated), s, face, P.lean, 4 + 108 * u[0] + 120 * f[0], -196 + 108 * u[1] + 120 * f[1]);
};
// IK dua ruas: sudut [bahu, siku, 0] supaya telapak tangan mencapai target (batas sendi diterapkan sesudahnya oleh actor.tsx)
const ikSide = (x: number, gy: number, s: number, pose: SidePose, face: 1 | -1, seated: boolean, target: { x: number; y: number }): J3 => {
  const cy = cyOf(gy, s, seated);
  const lean = cl(({ ...NEUTRAL_SIDE, ...pose }).lean, -20, 40);
  const r = (-lean * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  const lx0 = ((target.x - x) * face) / s, ly0 = (target.y - cy) / s + 50;
  const lx = lx0 * c - ly0 * sn, ly = lx0 * sn + ly0 * c - 50;
  const vx = lx - 4, vy = ly + 196;
  const L1 = 108, L2 = 120;
  const d = cl(Math.hypot(vx, vy), Math.abs(L1 - L2) + 2, L1 + L2 - 0.5);
  const phi = (Math.atan2(vx, vy) * 180) / Math.PI;
  const al = (Math.acos(cl((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)) * 180) / Math.PI;
  const ga = (Math.acos(cl((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1)) * 180) / Math.PI;
  return [phi - al, 180 - ga, 0];
};
const Floor: React.FC<{ y?: number; op?: number }> = ({ y = GY, op = 1 }) => <rect x={-120} y={y} width={1320} height={14} rx={7} fill="#fff" opacity={0.2 * op} />;
// ======== karakter modular: panggung makan (dua orang duduk di meja), semua gerak lewat sudut sendi ========
type V2 = { x: number; y: number };
const lv = (a: V2, b: V2, k: number): V2 => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
const ss = (t: number, a: number, b: number) => ez(t, a, b, sine);
const S = 1.1; // skala tokoh
const GY = 1300; // garis tanah
const XL = 350; // orang dengan HIV (teal = orang lain/masyarakat), menghadap kanan
const XR = 730; // kamu (biru), menghadap kiri
const SEAT: SidePose = POSES_SIDE.duduk;
const CYS = cyOf(GY, S, true);
const TT = Math.round(CYS - 44); // permukaan meja
const mouthL = sideW(XL, CYS, S, 1, 0, 56, -292);
const mouthR = sideW(XR, CYS, S, -1, 0, 56, -292);
const chestL = sideW(XL, CYS, S, 1, 0, 22, -124);
const REST_SP: V2 = { x: 478, y: TT - 12 };
const HOFF: V2 = { x: 540, y: TT - 52 };
const RH_L: V2 = { x: XL + 112, y: TT - 10 };
const RH_R: V2 = { x: XR - 112, y: TT - 10 };
const sitPose = (x: number, face: 1 | -1, tgt: V2, extra: SidePose = {}): SidePose => {
  const base = { ...SEAT, ...extra };
  return { ...base, armN: ikSide(x, GY, S, base, face, true, tgt), armF: [6, 96, 0] };
};

// urutan mengoper sendok: p = detik sejak mulai. ext = lanjut: kamu mengembalikan, orang dengan HIV meletakkan.
const spoonSeq = (p: number, ext: boolean) => {
  const tH = ext ? [2.4, 4.9] : [2.4];
  const pts: [number, V2][] = [
    [0, REST_SP], [0.4, REST_SP], [1.2, mouthL], [1.6, mouthL], [2.4, HOFF], [3.3, mouthR],
    ...(ext ? ([[4.2, mouthR], [4.9, HOFF], [5.6, REST_SP]] as [number, V2][]) : []),
  ];
  let pos = pts[pts.length - 1][1];
  for (let i = 0; i < pts.length - 1; i++) if (p >= pts[i][0] && p <= pts[i + 1][0]) pos = lv(pts[i][1], pts[i + 1][1], ss(p, pts[i][0], pts[i + 1][0]));
  if (p < 0) pos = REST_SP;
  const holder: 0 | 1 = p >= 2.4 && !(ext && p >= 4.9) ? 1 : 0;
  const w = (hh: number) => Math.max(0, ...tH.map((h) => (p < h ? ss(p, h - 0.7, h) : 1 - ss(p, h, h + 0.5)) * (Math.abs(p - h) < 1.2 ? 1 : 0)));
  const mine = (me: 0 | 1): V2 => {
    const rest = me === 0 ? RH_L : RH_R;
    if (p < 0) return rest;
    if (holder === me) return me === 0 && p < 0.5 ? lv(rest, pos, ss(p, 0, 0.35)) : pos;
    return lv(rest, HOFF, w(me));
  };
  const hold = p < 0 ? 0 : p < 0.5 ? ss(p, 0, 0.4) : 1;
  const rest5 = ext && p > 5.4 ? 1 - ss(p, 5.4, 5.8) : 1;
  const rot = lerp(80, clamp((540 - pos.x) * 0.8, -35, 35), hold * rest5);
  return { pos, rot, tgtL: mine(0), tgtR: mine(1) };
};
const clamp = cl;

const WIN_STAGE: [number, number][] = [[-1, T(4) + 0.2], [T(5) - 0.3, T(8) + 0.2], [T(10) - 0.3, T(11) + 0.2], [CL(12, 0) - 0.3, T(13) + 0.1], [T(14) - 0.3, CLOSE]];
const SEQ_A = CL(7, 2) + 0.1;
const SEQ_B = CL(12, 1) + 0.2;
const EAT0 = T(10) + 0.2;
const VIR_P0: V2 = chestL;

const virusPos = (t: number): V2 => {
  const go = pr(t, T(2) + 0.15, T(2) + 1.9, sine) * 0.8;
  const bk = pr(t, T(3) + 0.1, T(3) + 1.0, sine);
  const u = go * (1 - bk);
  const mid: V2 = { x: 540, y: 640 }, end: V2 = { x: XR - 90, y: 760 };
  const [x, y] = bez(u, [VIR_P0.x, VIR_P0.y], [mid.x, mid.y], [end.x, end.y]);
  return { x, y };
};

const Stage: React.FC<{ t: number }> = ({ t }) => {
  const op = Math.max(...WIN_STAGE.map(([a, b]) => win(t, a, b, 0.4)));
  if (op < 0.01) return null;
  const enter = t < 2 ? pr(t, 0.05, 0.8, back) : 1;
  const s = S * Math.max(0.02, enter);
  // pose
  let tL = RH_L, tR = RH_R, spPos = REST_SP, spRot = 80, sp2: V2 | null = null;
  let headR = 0, headL = 0;
  const pA = t - SEQ_A, pB = t - SEQ_B;
  if (t >= SEQ_A - 0.8 && t < T(8)) {
    const q = spoonSeq(pA, false);
    tL = q.tgtL; tR = q.tgtR; spPos = q.pos; spRot = q.rot;
  } else if (t >= SEQ_B - 0.8) {
    const q = spoonSeq(pB, true);
    tL = q.tgtL; tR = q.tgtR; spPos = q.pos; spRot = q.rot;
  } else if (t >= T(10) - 0.3 && t < T(11) + 0.3) {
    const p = t - EAT0;
    const b1 = 0.5 - 0.5 * Math.cos((Math.PI * 2 * Math.max(0, p)) / 2.4);
    const b2 = 0.5 - 0.5 * Math.cos((Math.PI * 2 * Math.max(0, p - 1.2)) / 2.4);
    spPos = lv({ x: 500, y: TT - 22 }, mouthL, ez(b1, 0, 1)); spRot = lerp(70, 35, ez(b1, 0, 0.4));
    sp2 = lv({ x: 585, y: TT - 22 }, mouthR, p > 1.2 ? ez(b2, 0, 1) : 0);
    tL = p > 0 ? spPos : RH_L; tR = p > 1.2 ? sp2 : RH_R;
  }
  // "Tidak." = kamu menggeleng
  const shake = Math.sin(pr(t, T(3) + 0.05, T(3) + 1.1, sine) * Math.PI * 4) * 14 * (1 - pr(t, T(3) + 0.6, T(3) + 1.2));
  headR = shake;
  const curious = pr(t, T(2) + 0.6, T(2) + 1.3, sine) * (1 - pr(t, T(3), T(3) + 0.3));
  const PL = sitPose(XL, 1, tL, { head: headL });
  const PR = sitPose(XR, -1, tR, { head: headR + 10 * curious });
  const vp = virusPos(t);
  // pelengkap
  const plateIn = pr(t, CL(1, 0), CL(1, 0) + 0.5, back);
  const spIn = pr(t, CL(1, 1), CL(1, 1) + 0.5, back);
  const s14 = T(14);
  const split = pr(t, s14 + 0.3, s14 + 1.0, sine) * (1 - pr(t, s14 + 2.0, s14 + 2.7, sine));
  const bar = pop(t, s14 + 0.8, 0.4) * (1 - pr(t, s14 + 1.9, s14 + 2.3));
  const xk = pop(t, s14 + 1.2, 0.4) * (1 - pr(t, s14 + 1.9, s14 + 2.3));
  const c1 = CL(15, 1);
  const ext = pop(t, c1 - 0.3, 0.6);
  const hw = lerp(230, 470, ext);
  const gx = [75, 195, 885, 1005];
  const gr: ActorRole[] = ['yellow', 'teal', 'yellow', 'teal'];
  return (
    <g opacity={op}>
      <Floor op={1} />
      {gx.map((x, i) => {
        const k = pop(t, c1 + 0.2 + i * 0.22, 0.45);
        return <Fr key={i} x={x} gy={GY - 24} s={0.62} role={gr[i]} pose={i % 2 ? POSES_FRONT.tanganDiDada : {}} op={k} />;
      })}
      <Hum x={XL} gy={GY} s={s} role="teal" pose={PL} seated chair />
      <Hum x={XR} gy={GY} s={s} role="blue" pose={PR} face={-1} seated chair />
      <g opacity={Math.min(1, enter)}>
        <rect x={540 - hw} y={TT} width={2 * hw} height={26} rx={13} fill={LIB_COL.light} />
        <rect x={540 - hw + 20} y={TT + 26} width={22} height={GY - TT - 26} rx={10} fill={LIB_COL.track} />
        <rect x={540 + hw - 42} y={TT + 26} width={22} height={GY - TT - 26} rx={10} fill={LIB_COL.track} />
        <Glass x={640} y={TT - 8} s={1.0} />
        {ext > 0.01 && [-1, 1].map((sg) => (
          <g key={sg} opacity={ext}>
            <Plate x={540 + sg * 330} y={TT - 14} s={0.8} />
          </g>
        ))}
        {split < 0.01 ? (
          <Plate x={lerp(540, 540, 0)} y={TT - 12} s={0.9 * plateIn} op={plateIn} />
        ) : (
          <>
            <Plate x={lerp(540, 462, split)} y={TT - 12} s={0.8} />
            <Plate x={lerp(540, 618, split)} y={TT - 12} s={0.8} />
          </>
        )}
        <g opacity={bar}>
          <rect x={522} y={TT - 232} width={36} height={240} rx={18} fill="#EAF2FB" />
        </g>
        <Badge kind="no" x={540} y={TT - 292} s={0.8} k={xk} />
      </g>
      <circle cx={chestL.x} cy={chestL.y} r={40} fill="#fff" opacity={0.26 * enter} />
      <FlatVirus cx={vp.x} cy={vp.y} r={22} rot={t * 14} />
            <Spoon x={spPos.x} y={spPos.y + 10} rot={spRot} s={0.75 * spIn} op={spIn} />
      {sp2 && <Spoon x={sp2.x} y={sp2.y + 10} rot={-35} s={0.75} />}
    </g>
  );
};


// ================= adegan =================
// Adegan 1 (kalimat 1): panggung (dua orang duduk, meja, piring, sendok) dirender oleh Stage
const Scene1: React.FC<{ t: number }> = () => null;

// Adegan 2 (kalimat 2-3): virus mencoba berpindah ke "kamu" (kamu memiringkan kepala, "?"); "Tidak." = terpental kembali, kamu menggeleng
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const q = pop(t, T(2) + 0.9, 0.4) * (1 - pr(t, T(3), T(3) + 0.3));
  const vp = virusPos(t);
  const cr = pop(t, T(3) + 0.05, 0.4) * (1 - pr(t, T(4) - 0.5, T(4) - 0.1));
  return (
    <>
      <L.SpeechBubble cx={XR + 40} cy={540} s={0.95 * q} op={q} text="?" w={220} tail="r" />
      <Badge kind="no" x={vp.x} y={vp.y - 100} s={0.8} k={cr} />
    </>
  );
};

// Adegan 3 (kalimat 4): lima cairan disebut satu per satu, tiap tetes membawa virus
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const xs = [130, 335, 540, 745, 950];
  const labels = ['darah', 'air mani', 'cairan vagina', 'cairan dubur', 'ASI'];
  const ly = [1060, 1160, 1060, 1160, 1060];
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
              <g transform={`translate(${xs[i]} 840) scale(${1.25 * slot})`} opacity={0.22 * slot * (1 - fill)}>
                <path d={DROP_D} fill="#fff" />
              </g>
            )}
            <Drop x={xs[i]} y={840 + bob(t, i, 5)} s={1.25 * fill * (1 + 0.2 * hl)} color={c} op={fill} t={t} />
            <SvgPill x={xs[i]} y={ly[i]} text={labels[i]} k="neutral" size={36} op={lab} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// Adegan 4 (kalimat 5): makanan dan minuman bukan salah satu dari lima cairan; sendok dan piring hanya membawa sisa makanan (sorotan lensa)
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const s = T(5);
  const row = pr(t, s, s + 0.7, sine);
  const x1 = pop(t, s + 1.3, 0.45) * (1 - pr(t, CL(5, 1) - 0.1, CL(5, 1) + 0.3));
  const c2 = CL(5, 1);
  const lens = pop(t, c2 + 0.1, 0.5);
  const ok = pop(t, c2 + 1.5, 0.45);
  return (
    <>
      {FLUIDS.map((c, i) => (
        <Drop key={i} x={lerp(540 - 410 + i * 205, 150 + i * 195, row)} y={lerp(700, 400, row) + bob(t, i, 3)} s={lerp(1.0, 0.55, row)} color={c} op={1 - 0.25 * row} t={t} />
      ))}
      <Badge kind="no" x={540} y={620} s={0.9} k={x1} />
      <g opacity={lens} transform={`translate(540 590) scale(${lens * 0.8})`}>
        <circle r={190} fill="#0A1F3D" opacity={0.4} />
        <circle r={180} fill="#123A60" />
        <Plate x={0} y={20} s={1.15} food={false} />
        <Spoon x={110} y={-60} rot={50} s={1.0} />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={-70 + i * 32} cy={8 + (i % 2) * 14} r={7} fill={FOOD[i % 3]} />
        ))}
      </g>
      <Badge kind="ok" x={800} y={470} s={0.8} k={ok} />
    </>
  );
};

// Adegan 5 (kalimat 6): air liur keluar dari mulut orang dengan HIV: tetes bening tanpa virus, melayang ke tengah, disilang
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const s = T(6);
  const mv = pr(t, s + 0.1, s + 1.0, out3);
  const sl = pop(t, s + 0.1, 0.4);
  const x1 = pop(t, s + 1.2, 0.45);
  return (
    <>
      {FLUIDS.map((c, i) => (
        <Drop key={i} x={150 + i * 195} y={400 + bob(t, i, 3)} s={0.55} color={c} op={0.7} t={t} />
      ))}
      <Drop x={lerp(mouthL.x, 540, mv)} y={lerp(mouthL.y, 640, mv) + bob(t, 2, 4) * mv} s={lerp(0.3, 1.5, mv) * sl} color={SAL} op={sl} virus={false} />
      <SvgPill x={540} y={810} text="air liur" k="neutral" size={40} op={pop(t, s + 0.8, 0.3)} />
      <Badge kind="no" x={680} y={560} s={0.8} k={x1} />
    </>
  );
};

// Adegan 6 (kalimat 7): dokumen NIH; tetes air liur melayang ke kamu tanpa virus; sendok dari mulut orang dengan HIV dioper ke kamu, virus tetap di dada
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const nih = pop(t, T(7) + 0.1, 0.5);
  const c1 = CL(7, 1);
  const dr = pr(t, c1 + 0.1, c1 + 1.7, sine);
  const [dx, dy] = bez(dr, [mouthL.x + 20, mouthL.y - 10], [540, 640], [mouthR.x - 10, mouthR.y - 20]);
  const drO = pop(t, c1 + 0.05, 0.3) * (1 - pr(t, c1 + 1.7, c1 + 2.0));
  const okA = pop(t, c1 + 1.5, 0.4) * (1 - pr(t, CL(7, 2) - 0.3, CL(7, 2)));
  const okB = pop(t, CL(7, 2) + 3.3, 0.45);
  return (
    <>
      <g opacity={nih}>
        <L.Document cx={540} cy={470} s={1.0 * nih} stamp />
        <SvgPill x={540} y={640} text="NIH" k="neutral" size={38} op={nih} />
      </g>
      <Drop x={dx} y={dy} s={0.5} color={SAL} op={drO} virus={false} />
      <Badge kind="ok" x={XR} y={560} s={0.7} k={okA} />
      <Badge kind="ok" x={XR} y={560} s={0.7} k={okB} />
    </>
  );
};

// Adegan 7 (kalimat 8): tiga tetes bening (keringat, air mata, urine), tidak ada virus, masing-masing disilang
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
            <Drop x={x} y={860 + bob(t, i, 5)} s={1.45 * k} color={cols[i]} op={k} virus={false} />
            <SvgPill x={x} y={1110} text={labels[i]} k="neutral" size={38} op={k} />
            <Badge kind="no" x={x + 100} y={700} s={0.6} k={c} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// Adegan 8 (kalimat 9): penularan butuh jalan masuk: gembok, lalu selaput lendir dan aliran darah
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const c1 = CL(9, 1), c2 = CL(9, 2);
  const lk = pop(t, c1 - 0.1, 0.45);
  const knock = pr(t, c1 + 0.3, c1 + 1.0, in3) * (1 - pr(t, c1 + 1.0, c1 + 1.5, out3));
  const lkS = lerp(2.5, 0.9, pr(t, c2 - 0.2, c2 + 0.5));
  const lkY = lerp(900, 520, pr(t, c2 - 0.2, c2 + 0.5));
  const A = win(t, c2 - 0.1, c2 + 2.3, 0.35);
  const B = win(t, c2 + 2.2, T(10) + 0.2, 0.35);
  const pa = pr(t, c2 + 0.3, c2 + 1.9, sine);
  const pb = pr(t, c2 + 2.3, c2 + 3.9, sine);
  const flowX = (t * 190) % 160;
  return (
    <>
      <g transform={`translate(540 ${lkY})`}>
        <L.Lock cx={0} cy={0} s={lkS * lk} op={lk} />
      </g>
      <Drop x={lerp(160, 330, knock)} y={lerp(1000, 940, knock)} s={0.8 * lk * (1 - pr(t, c2 - 0.2, c2 + 0.2))} color={FL.darah} op={lk} t={t} />
      <g opacity={A}>
        <g transform="translate(540 1000)">
          <Tissue w={760} />
        </g>
        <Drop x={540} y={lerp(700, 985, pa)} s={0.8 * (1 - 0.5 * pa)} color={FL.darah} op={1 - 0.5 * pa} t={t} />
        <SvgPill x={540} y={1330} text="selaput lendir" k="neutral" size={42} op={A} />
      </g>
      <g opacity={B}>
        <g transform="translate(540 1040)">
          <rect x={-470} y={-70} width={940} height={140} rx={70} fill="#C9434D" />
          <rect x={-450} y={-52} width={900} height={104} rx={52} fill="#F0616A" />
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse key={i} cx={-420 + ((i * 130 + flowX) % 840)} cy={i % 2 ? 14 : -14} rx={22} ry={13} fill="#C9434D" opacity={0.7} />
          ))}
        </g>
        <Drop x={540} y={lerp(720, 1040, pb)} s={0.8 * (1 - 0.6 * pb)} color={FL.darah} op={1 - pb} t={t} />
        <SvgPill x={540} y={1330} text="aliran darah" k="neutral" size={42} op={B} />
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

// Adegan 9 (kalimat 10): makan bersama: keduanya menyuap bergantian; gembok di atas meja tetap tertutup, tetes virus terpental
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const s = T(10);
  const lk = pop(t, s - 0.1, 0.4);
  const ok = pop(t, s + 1.2, 0.45);
  const knock = pr(t, s + 0.4, s + 1.1, in3) * (1 - pr(t, s + 1.1, s + 1.6, out3));
  return (
    <>
      <L.Lock cx={540} cy={560} s={1.6 * lk} op={lk} />
      <Drop x={lerp(180, 400, knock)} y={lerp(480, 580, knock)} s={0.6 * lk} color={FL.darah} op={lk} t={t} />
      <Badge kind="ok" x={760} y={540} s={0.8} k={ok} />
    </>
  );
};

// Adegan 10 (kalimat 11-12): kondisi sangat jarang (satu titik langka), darah besar + air liur masuk luka; lalu berbagi alat makan tetap bukan aktivitas berisiko (panggung kembali)
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const c1 = CL(11, 1), c2 = CL(11, 2);
  const dots = pr(t, T(11), T(11) + 0.9);
  const rare = pop(t, c1 + 0.6, 0.5);
  const grid = 1 - pr(t, c2 - 0.3, c2 + 0.4);
  const bl = pop(t, c2 + 0.1, 0.5);
  const sa = pop(t, c2 + 0.4, 0.5);
  const mix_ = pr(t, c2 + 1.5, c2 + 2.4, sine);
  const toWound = pr(t, c2 + 2.6, c2 + 4.2, sine);
  const wound = pop(t, c2 + 2.3, 0.45);
  const gone = 1 - pr(t, CL(12, 0) - 0.4, CL(12, 0) - 0.05);
  const ok = pop(t, SEQ_B + 3.4, 0.5);
  const dotsList = Array.from({ length: 24 }, (_, i) => ({ x: 150 + (i % 6) * 156, y: 620 + Math.floor(i / 6) * 130 }));
  const mixX = lerp(lerp(300, 540, mix_), 700, toWound);
  const mixY = lerp(lerp(860, 840, mix_), 1000, toWound);
  return (
    <>
      <g opacity={gone}>
        <g opacity={grid}>
          {dotsList.map((d, i) => (i === 14 ? null : <circle key={i} cx={d.x} cy={d.y} r={22 * dots} fill="#B9C3D0" opacity={0.7 * dots} />))}
          <Drop x={dotsList[14].x} y={dotsList[14].y + 6} s={0.48 * rare} color={FL.darah} op={rare} t={t} />
          <circle cx={dotsList[14].x} cy={dotsList[14].y} r={70 * rare} fill="none" stroke="#F4D77E" strokeWidth={6} opacity={rare} />
          <SvgPill x={540} y={1210} text="sangat tidak biasa" k="neutral" size={40} op={rare} />
        </g>
        {t >= c2 && (
          <>
            <Drop x={mixX - lerp(140, 0, mix_) * (1 - toWound)} y={mixY} s={1.6 * bl} color={FL.darah} op={bl} t={t} />
            <Drop x={mixX + lerp(160, 0, mix_) * (1 - toWound)} y={mixY + 20} s={1.0 * sa} color={SAL} op={sa * (1 - 0.5 * mix_)} virus={false} />
            <g opacity={wound}>
              <g transform="translate(700 1110)">
                <rect x={-230} y={0} width={460} height={140} rx={36} fill="#F7C6A5" />
                <path d="M -28 0 L 0 66 L 28 0 Z" fill="#C9434D" />
              </g>
              <SvgPill x={700} y={1300} text="luka" k="neutral" size={38} op={wound} />
            </g>
          </>
        )}
      </g>
      <Badge kind="ok" x={XR} y={560} s={0.8} k={ok} />
    </>
  );
};

// Adegan 11 (kalimat 13): menurut WHO, ciuman, pelukan, berbagi makanan tidak menularkan HIV; tiga vignet dengan karakter modular
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const who = pop(t, T(13) + 0.1, 0.5);
  const cols = [180, 540, 900];
  const starts = [CL(13, 1), CL(13, 2), CL(13, 3)];
  const labels = ['ciuman', 'pelukan', 'berbagi makanan'];
  const GYV = 1270, SV = 0.52;
  return (
    <>
      <g opacity={who}>
        <L.Document cx={470} cy={480} s={0.85 * who} stamp />
        <SvgPill x={650} y={480} text="WHO" k="neutral" size={40} op={who} />
      </g>
      {cols.map((cx, i) => {
        const k = pop(t, starts[i], 0.5);
        const c = pop(t, starts[i] + 0.9, 0.45);
        const mv = pr(t, starts[i] + 0.1, starts[i] + 0.8, sine);
        const A: SidePose = i === 0 ? { lean: lerp(0, 14, mv), head: lerp(0, 8, mv) } : i === 1 ? { lean: lerp(0, 8, mv), armN: [lerp(10, 80, mv), lerp(10, 25, mv), 0], armF: [lerp(10, 70, mv), 20, 0] } : { armN: [lerp(10, 70, mv), 18, 0], armF: [8, 8, 0] };
        const gap = i === 0 ? lerp(150, 96, mv) : i === 1 ? lerp(150, 104, mv) : 150;
        return (
          <React.Fragment key={i}>
            <Hum x={cx - gap / 2} gy={GYV} s={SV * k} role="teal" pose={A} op={k} />
            <Hum x={cx + gap / 2} gy={GYV} s={SV * k} role="blue" pose={A} face={-1} op={k} />
            {i === 0 && <L.Heart cx={cx} cy={820} s={0.34 * mv} op={mv} color="#F4A6C8" />}
            {i === 2 && <Plate x={cx} y={GYV - 190} s={0.55 * k} op={k} />}
            <Badge kind="ok" x={cx} y={700} s={0.6} k={c} />
            <SvgPill x={cx} y={1360} text={labels[i]} k="neutral" size={34} op={k} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// Adegan 12 (kalimat 14-15): dua piring dipisah penghalang yang disilang lalu menyatu; piring sama; meja makan ramai (Stage)
const Scene12: React.FC<{ t: number }> = ({ t }) => {
  const same = pop(t, CL(15, 0) + 0.1, 0.5);
  return <Badge kind="ok" x={540} y={TT - 300} s={0.9} k={same * (1 - pr(t, CL(15, 1) - 0.2, CL(15, 1) + 0.3))} />;
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
export const S2E5AltFull: React.FC = () => {
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
            <Stage t={t} />
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
