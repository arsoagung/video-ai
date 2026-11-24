import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL, Star } from '../shared/shapes';
import { Actor, ActorSide, Chair, POSES_FRONT, POSES_SIDE, NEUTRAL, NEUTRAL_SIDE, ACTOR_COL } from '../shared/actor';
import type { ActorRole, Pose, SidePose } from '../shared/actor';
import { CUES, CLOSE, SCENE_T, T, TE, CL, EP_DUR } from './timeline';

export const S2E9ALT_FRAMES = Math.ceil(EP_DUR * FPS);

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

Rogers, M. F., White, C. R., Sanders, R., Schable, C., Ksell, T. E., Wasserman, R. L., Bellanti, J. A., Peters, S. M., & Wray, B. B. (1990). Lack of transmission of human immunodeficiency virus from infected children to their household contacts. Pediatrics, 85(2), 210–214.
https://pesquisa.bvsalud.org/perinatal/resource/pt/mdl-2296509

National Institutes of Health, HIVinfo. Understanding HIV Transmission.
https://hivinfo.nih.gov/understanding-hiv/fact-sheets/understanding-hiv-transmission

Centers for Disease Control and Prevention. How HIV Spreads.
https://www.cdc.gov/hiv/causes/index.html

AIDS.gov. How to Protect Yourself (arsip web, 24 Januari 2017).
https://webarchive.library.unt.edu/web/20170124235543/https://www.aids.gov/hiv-aids-basics/just-diagnosed-with-hiv-aids/helping-someone-recently-diagnosed/how-to-protect-yourself`;

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
const BG: Grad[] = [B1, B1, B3, B3, B2, B2, B2, B3, B1, B1, B4, B4, B4];

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



const Virus: React.FC<{ x: number; y: number; r: number; dim?: number; t: number; seed?: number }> = ({ x, y, r, dim = 1, t, seed = 0 }) =>
  r < 2 || dim < 0.01 ? null : <FlatVirus cx={x} cy={y} r={r} dim={dim} rot={t * 5 + seed * 40} />;
const pr = (t: number, a: number, b: number, e: (x: number) => number = out3) => ez(t, a, b, e);

const SceneWrap: React.FC<{ i: number; t: number; children: React.ReactNode }> = ({ i, t, children }) => {
  const o = win(t, SCENE_T[i], SCENE_T[i + 1] + 0.25, 0.45);
  if (o < 0.005) return null;
  return <g opacity={o}>{children}</g>;
};

const pop = (t: number, a: number, d = 0.4) => pr(t, a, a + d, back);
// ================= komponen episode ini (S2E9 alternatif: SEMUA tokoh manusia = karakter modular src/shared/actor.tsx) =================
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
const Moon: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 1 }) =>
  op < 0.01 || s < 0.02 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <path d="M -6 -50 A 50 50 0 1 0 44 30 A 40 40 0 0 1 -6 -50 Z" fill="#F4D77E" />
    </g>
  );
const SKIN = '#F2C9A5';
// peran warna karakter modular (satu warna, satu peran sepanjang episode)
const CB = ACTOR_COL.blue.main; // kamu
const CT = ACTOR_COL.teal.main; // orang dengan HIV (+ lensa virus di dada)
const CY = ACTOR_COL.yellow.main; // anggota keluarga lain

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
const JALAN_B: SidePose = { legN: POSES_SIDE.jalan.legF, legF: POSES_SIDE.jalan.legN, armN: POSES_SIDE.jalan.armF, armF: POSES_SIDE.jalan.armN, lean: 4 };
const jalan = (ph: number) => mixS(POSES_SIDE.jalan, JALAN_B, (Math.sin(ph) + 1) / 2);
const bump = (t: number, a: number, d = 0.7) => Math.sin(Math.PI * cl((t - a) / d, 0, 1));

const cyOf = (gy: number, s: number) => gy - 354 * s;
// tampak depan; lens = lensa berisi virus kecil di dada (orang dengan HIV)
const Fr: React.FC<{ x: number; gy: number; s: number; role: ActorRole; pose?: Pose; op?: number; lens?: boolean }> = ({ x, gy, s, role, pose, op = 1, lens = false }) => {
  if (op < 0.005 || s < 0.005) return null;
  const cy = cyOf(gy, s);
  return (
    <>
      <Actor cx={x} cy={cy} s={s} role={role} pose={pose} op={op} />
      {lens && (
        <g opacity={op}>
          <circle cx={x} cy={cy - 112 * s} r={44 * s} fill="#fff" opacity={0.3} />
          <FlatVirus cx={x} cy={cy - 112 * s} r={19 * s} />
        </g>
      )}
    </>
  );
};
// posisi dunia dari titik lokal tampak samping
const sideW = (x: number, cy: number, s: number, face: number, lean: number, lx: number, ly: number) => {
  const r = (cl(lean, -20, 40) * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  const dx = lx, dy = ly + 50;
  return { x: x + face * s * (dx * c - dy * sn), y: cy + s * (dx * sn + dy * c - 50) };
};
const dirA = (deg: number) => [Math.sin((deg * Math.PI) / 180), Math.cos((deg * Math.PI) / 180)];
// tampak samping, berdiri atau duduk (seat 0..1 = peralihan berdiri -> duduk, kursi muncul)
const Hum: React.FC<{ x: number; gy: number; s: number; role: ActorRole; pose?: SidePose; face?: 1 | -1; seat?: number; op?: number; lens?: boolean }> = ({ x, gy, s, role, pose, face = 1, seat = 0, op = 1, lens = false }) => {
  if (op < 0.005 || s < 0.005) return null;
  const cy = gy - lerp(354, 218, seat) * s;
  const lean = cl(({ ...NEUTRAL_SIDE, ...pose }).lean, -20, 40);
  const ln = sideW(x, cy, s, face, lean, 26, -118);
  return (
    <>
      <g transform={face === -1 ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
        {seat > 0.02 && <Chair cx={x} cy={cy} s={s} op={op * seat} />}
        <ActorSide cx={x} cy={cy} s={s} role={role} pose={pose} op={op} />
      </g>
      {lens && (
        <g opacity={op}>
          <circle cx={ln.x} cy={ln.y} r={36 * s} fill="#fff" opacity={0.3} />
          <FlatVirus cx={ln.x} cy={ln.y} r={16 * s} />
        </g>
      )}
    </>
  );
};
const handSide = (x: number, gy: number, s: number, pose: SidePose, face: 1 | -1) => {
  const P = { ...NEUTRAL_SIDE, ...pose };
  const a = P.armN;
  const a0 = cl(a[0], -60, 165), a1 = cl(a[1], 0, 135);
  const u = dirA(a0), f = dirA(a0 + a1);
  return sideW(x, cyOf(gy, s), s, face, P.lean, 4 + 108 * u[0] + 120 * f[0], -196 + 108 * u[1] + 120 * f[1]);
};
const GY = 1330; // garis tanah
const S = 0.7; // skala tokoh standar (tinggi ±505 px)
const Floor: React.FC<{ y?: number; op?: number }> = ({ y = GY, op = 1 }) => <rect x={-120} y={y} width={1320} height={14} rx={7} fill="#fff" opacity={0.2 * op} />;
const UP_BOTH: Pose = { armL: [140, 0, 0], armR: [140, 0, 0] };
const THINK: Pose = { head: 18, lean: 6, armL: [22, -100, 0], armR: [22, -100, 0] };
const REACH: SidePose = { armN: [88, 10, 0], lean: 3 };
const HUGP: SidePose = { armN: [74, 78, 0], armF: [64, 72, 0], lean: 8, head: 5 };
const SIT: SidePose = POSES_SIDE.duduk;

const Ring: React.FC<{ x: number; y: number; t: number; a: number; r0?: number; r1?: number; c?: string }> = ({ x, y, t, a, r0 = 20, r1 = 120, c = '#fff' }) => {
  const k = pr(t, a, a + 0.9);
  return k > 0.01 && k < 0.99 ? <circle cx={x} cy={y} r={r0 + (r1 - r0) * k} fill="none" stroke={c} strokeWidth={6} opacity={0.6 * (1 - k)} /> : null;
};
const Spoon: React.FC<{ x: number; y: number; rot?: number; op?: number; s?: number }> = ({ x, y, rot = 0, op = 1, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
    <rect x={-5} y={0} width={10} height={70} rx={5} fill="#DCE8F5" />
    <ellipse cx={0} cy={-6} rx={17} ry={23} fill="#EAF2FB" />
  </g>
);
const Towel: React.FC<{ x: number; y: number; s?: number; rot?: number; op?: number }> = ({ x, y, s = 1, rot = 0, op = 1 }) =>
  op < 0.01 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      <rect x={-80} y={-46} width={160} height={92} rx={22} fill="#CFE3F7" />
      <rect x={-80} y={-20} width={160} height={14} fill="#8FBDF7" />
      <rect x={-80} y={8} width={160} height={14} fill="#8FBDF7" />
    </g>
  );
// meja makan (library) skala 1,6 supaya kaki sampai tanah; mengembalikan posisi piring
const TABLE_TOP = 1107;
const TableSet: React.FC<{ op?: number }> = ({ op = 1 }) => (op < 0.01 ? null : <L.DiningTable cx={540} cy={TABLE_TOP} s={1.6} w={262} op={op} />);

const IC = { drop: [300, 500], lock: [540, 500], virus: [780, 500] };
const VCL: [number, number][] = [[-52, -40], [42, -52], [-8, 8], [-58, 52], [52, 42]];
const VirusCluster: React.FC<{ x: number; y: number; s?: number; t: number; a?: number; op?: number }> = ({ x, y, s = 1, t, a = -99, op = 1 }) => (
  <>
    {VCL.map(([dx, dy], i) => {
      const k = a < -50 ? 1 : pop(t, a + i * 0.18, 0.4);
      return <Virus key={i} x={x + dx * s} y={y + dy * s} r={30 * s * k} dim={op} t={t} seed={i} />;
    })}
  </>
);

// ---- adegan 1 (kalimat 1-2): rumah berisi keluarga, satu di antaranya ODHIV; "kamu" bertanya-tanya (tangan di dada, kepala miring) ----
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const h = pop(t, 0.1, 0.6);
  const p = [0.5, 0.9, 1.3, 1.7].map((a) => pop(t, a, 0.5));
  const q = pop(t, T(2) + 0.15, 0.5);
  const think = pr(t, T(2) + 0.1, T(2) + 0.8, sine);
  return (
    <>
      <L.Home cx={540} cy={560} s={1.8 * h} op={h} />
      <Floor op={h} />
      <Fr x={230} gy={GY} s={S * p[0]} role="teal" lens op={p[0]} />
      <Fr x={470} gy={GY} s={S * p[1]} role="blue" pose={mixF({}, THINK, think)} op={p[1]} />
      <Fr x={700} gy={GY} s={S * p[2]} role="yellow" op={p[2]} />
      <Fr x={880} gy={GY} s={S * 0.62 * p[3]} role="yellow" op={p[3]} />
      {q > 0.02 && <L.SpeechBubble cx={540} cy={760} s={0.9 * q} op={q} text="?" w={150} tail="l" />}
    </>
  );
};

// ---- adegan 2 (kalimat 3): "Tidak": kamu menggeleng dan rileks, centang muncul; "sudah diteliti": dokumen + kaca pembesar ----
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const a = T(3), c1 = CL(3, 1);
  const q = 1 - pr(t, a, a + 0.4, in3);
  const ck = pop(t, a + 0.2, 0.5);
  const mv = pr(t, c1, c1 + 0.8, sine);
  const doc = pop(t, c1 + 0.1, 0.5);
  const mg = pr(t, c1 + 0.4, c1 + 1.5, sine);
  const st = pop(t, c1 + 1.5, 0.4);
  const shake = 18 * Math.sin(Math.max(0, t - a) * 9) * pr(t, a, a + 0.15) * (1 - pr(t, a + 0.9, a + 1.3));
  const relax = pr(t, a, a + 0.5, sine);
  const kp = mixF(mixF({}, THINK, 1 - relax), { head: shake }, relax);
  return (
    <>
      <L.Home cx={540} cy={560} s={1.8} op={0.3} />
      <Floor />
      <Fr x={230} gy={GY} s={S} role="teal" lens />
      <Fr x={470} gy={GY} s={S} role="blue" pose={{ ...kp, head: (kp.head ?? 0) * 1 + shake * relax * 0 }} />
      <Fr x={700} gy={GY} s={S} role="yellow" />
      <Fr x={880} gy={GY} s={S * 0.62} role="yellow" />
      {q > 0.02 && <L.SpeechBubble cx={540} cy={760} s={0.9 * q} op={q} text="?" w={150} tail="l" />}
      <L.CheckBadge cx={lerp(470, 850, mv)} cy={lerp(700, 640, mv)} s={lerp(1.1, 0.8, mv) * ck} op={ck} />
      <L.Document cx={330} cy={640} s={1.5 * doc} op={doc} kind="paper" stamp={st > 0.5} />
      <g opacity={mg}>
        <L.Magnifier cx={lerp(760, 350, mg)} cy={lerp(520, 630, mg)} s={1.2} />
      </g>
    </>
  );
};

// ---- adegan 3 (kalimat 4): tiga syarat sekaligus: cairan, jalan masuk, jumlah virus ----
const CARD_X = [240, 540, 840];
const CY3 = 860;
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const a = T(4);
  const c1 = CL(4, 1), c2 = CL(4, 2), c3 = CL(4, 3);
  const full = pr(t, c3 + 1.3, c3 + 2.0);
  const plus = pop(t, c3 + 1.2, 0.5);
  return (
    <>
      {CARD_X.map((x, i) => {
        const k = pop(t, a + 0.3 + i * 0.25, 0.5);
        return (
          <g key={i} opacity={k} transform={`translate(0 ${(1 - k) * 40})`}>
            <rect x={x - 130} y={CY3 - 190} width={260} height={380} rx={40} fill={full > 0.5 ? '#72E3D3' : '#FFFFFF'} opacity={lerp(0.13, 0.26, full)} />
          </g>
        );
      })}
      {(() => {
        const k = pop(t, c1 + 0.1, 0.5);
        return <L.BloodDrop cx={240} cy={CY3 + 10} s={1.25 * k} op={k} />;
      })()}
      {(() => {
        const k = pop(t, c2 + 0.05, 0.5);
        return <L.Lock cx={540} cy={CY3} s={1.35 * k} op={k} open />;
      })()}
      <VirusCluster x={840} y={CY3} s={1.15} t={t} a={c3 + 0.05} />
      {[390, 690].map((x) => (
        <g key={x} transform={`translate(${x} ${CY3}) scale(${plus})`} opacity={plus}>
          <rect x={-26} y={-6} width={52} height={12} rx={6} fill="#fff" />
          <rect x={-6} y={-26} width={12} height={52} rx={6} fill="#fff" />
        </g>
      ))}
    </>
  );
};

// ---- adegan 4 (kalimat 5): kehidupan serumah tidak menyediakan ketiganya; keluarga lega (tangan terangkat) ----
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const a = T(5);
  const h = pop(t, a + 0.2, 0.6);
  const xs = [a + 0.9, a + 1.25, a + 1.6];
  const kk = xs.map((x) => pop(t, x, 0.4));
  const dim = (i: number) => 1 - 0.6 * kk[i];
  const cheer = pr(t, a + 2.0, a + 2.8, sine);
  const g4 = 1400;
  return (
    <>
      <L.BloodDrop cx={IC.drop[0]} cy={IC.drop[1]} s={0.65} op={dim(0)} />
      <L.Lock cx={IC.lock[0]} cy={IC.lock[1]} s={0.72} open op={dim(1)} />
      <VirusCluster x={IC.virus[0]} y={IC.virus[1]} s={0.6} t={t} op={dim(2)} />
      {kk.map((k, i) => (
        <L.CrossBadge key={i} cx={[IC.drop, IC.lock, IC.virus][i][0]} cy={[IC.drop, IC.lock, IC.virus][i][1]} s={0.95 * k} op={k} />
      ))}
      <L.Home cx={540} cy={830} s={1.7 * h} op={h} />
      <Floor y={g4} op={h} />
      <Fr x={330} gy={g4} s={0.55 * h} role="teal" lens pose={mixF({}, UP_BOTH, cheer)} op={h} />
      <Fr x={540} gy={g4} s={0.55 * h} role="blue" pose={mixF({}, UP_BOTH, cheer)} op={h} />
      <Fr x={750} gy={g4} s={0.55 * h} role="yellow" pose={mixF({}, UP_BOTH, cheer)} op={h} />
    </>
  );
};

// ---- adegan 5 (kalimat 6): sentuhan, pelukan, berbagi piring/sendok -> semuanya hanya mengenai kulit utuh (bukan jalan masuk) ----
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const a = T(6), c1 = CL(6, 1), c2 = CL(6, 2), c3 = CL(6, 3);
  const pop0 = pop(t, 0.0 + a, 0.4);
  // fase A: mendekat dan bersentuhan; fase B: pelukan; fase C: duduk di meja
  const A = pr(t, a + 0.05, a + 0.6, sine);
  const B = pr(t, c1 + 0.05, c1 + 0.5, sine);
  const C = pr(t, c2 + 0.15, c2 + 0.7, sine);
  const Cx = pr(t, c2 + 0.1, c2 + 0.55);
  let kx = lerp(250, 380, A); kx = lerp(kx, 470, B); kx = lerp(kx, 300, C);
  let ox = lerp(830, 700, A); ox = lerp(ox, 610, B); ox = lerp(ox, 780, C);
  const walking = A > 0.02 && A < 0.98;
  const wph = t * 9;
  const base = walking ? jalan(wph) : {};
  const touch = pr(t, a + 0.5, a + 0.9, sine);
  let kp: SidePose = mixS(base, REACH, touch);
  kp = mixS(kp, HUGP, B);
  kp = mixS(kp, SIT, C);
  let op: SidePose = mixS(walking ? jalan(wph + 1.5) : {}, REACH, touch);
  op = mixS(op, HUGP, B);
  op = mixS(op, SIT, C);
  const dimD = 1 - 0.7 * pr(t, c3 - 0.1, c3 + 0.4);
  const hk = handSide(380, GY, S, REACH, 1);
  const hg = pop(t, c1 + 0.25, 0.45) * (1 - pr(t, c2 + 0.15, c2 + 0.5));
  const tab = Cx * dimD;
  const sp = pr(t, c2 + 0.9, c2 + 2.1, sine);
  const sp2 = pr(t, c2 + 2.1, c2 + 3.0, sine);
  const spx = t < c2 + 2.1 ? lerp(424, 656, sp) : lerp(656, 560, sp2);
  const spy = TABLE_TOP - 30 - Math.sin((t < c2 + 2.1 ? sp : sp2) * Math.PI) * 90;
  const spOp = pr(t, c2 + 0.7, c2 + 1.0) * (1 - pr(t, c3 - 0.1, c3 + 0.3));
  // fase D: lensa memperbesar kulit; virus menabrak kulit utuh dan terpental
  const mg = pop(t, c3 + 0.1, 0.5);
  const vy = t < c3 + 1.1 ? lerp(720 - 165, 720 - 12, pr(t, c3 + 0.5, c3 + 1.1, in3)) : lerp(720 - 12, 720 - 110, pr(t, c3 + 1.1, c3 + 1.9, out3));
  const lk = pop(t, c3 + 1.1, 0.4);
  const LX = 540, LY = 720, LS = 1.9, LR = 92 * LS;
  return (
    <>
      <Floor op={pop0 * dimD} />
      <g opacity={dimD}>
        <Hum x={kx} gy={GY} s={S} role="blue" pose={kp} seat={C} op={pop0} />
        <Hum x={ox} gy={GY} s={S} role="teal" lens pose={op} face={-1} seat={C} op={pop0} />
      </g>
      <Ring x={hk.x + 4} y={hk.y} t={t} a={a + 0.55} />
      {hg > 0.02 && <L.Heart cx={540} cy={720} s={0.55 * hg} op={hg} />}
      <TableSet op={tab} />
      <Spoon x={spx} y={spy} rot={20} op={spOp} />
      <g opacity={mg}>
        <L.Magnifier cx={LX} cy={LY} s={LS * mg} />
        <defs><clipPath id="lensSkin"><circle cx={LX} cy={LY} r={LR * mg} /></clipPath></defs>
        <g clipPath="url(#lensSkin)">
          <rect x={LX - 200} y={LY - 200} width={400} height={400} fill="#0B2A4F" opacity={0.65} />
          <rect x={LX - 220} y={LY + 30} width={440} height={60} rx={30} fill={SKIN} />
          <rect x={LX - 220} y={LY + 90} width={440} height={120} fill="#E6A98A" />
          <Virus x={LX} y={vy} r={40} t={t} />
        </g>
        <L.Lock cx={LX} cy={LY + 60} s={0.55 * lk} op={lk} color="#9AA9BC" />
      </g>
    </>
  );
};

// ---- adegan 6 (kalimat 7): lima cairan tidak dipertukarkan di dalam rumah ----
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const a = T(7);
  const dts = [CL(7, 0) + 1.7, CL(7, 1), CL(7, 2), CL(7, 3), CL(7, 4) + 0.45];
  const h = pop(t, a + 0.05, 0.6);
  const g6 = 1390;
  return (
    <>
      <L.Home cx={540} cy={1150} s={1.5 * h} op={h} />
      <Floor y={g6} op={h} />
      <Fr x={170} gy={g6} s={0.55 * h} role="teal" lens op={h} />
      <Fr x={910} gy={g6} s={0.55 * h} role="blue" op={h} />
      {FLUIDS.map((c, i) => {
        const k = pop(t, dts[i], 0.45);
        const cr = pop(t, dts[i] + 0.55, 0.4);
        return (
          <g key={i}>
            <Drop x={140 + i * 200} y={720 + Math.sin(t * 2.4 + i * 1.3) * 5 * k} s={0.95 * k} color={c} op={k} t={t} />
            <L.CrossBadge cx={140 + i * 200 + 62} cy={650} s={0.46 * cr} op={cr} />
          </g>
        );
      })}
    </>
  );
};

// ---- adegan 7 (kalimat 8): keringat dan air liur: tetes bening tanpa virus, aman ----
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const a = T(8);
  const hx = 300, hy = cyOf(GY, 0.75) - 306 * 0.75; // pusat kepala ODHIV
  const sw: [number, number, number, number, number][] = [
    [hx - 60, hy - 10, hx - 130, hy - 110, a + 0.15], [hx - 10, hy - 55, hx - 30, hy - 160, a + 0.4], [hx + 50, hy - 40, hx + 80, hy - 140, a + 0.65],
  ];
  const sl: [number, number, number][] = [[570, hy + 120, a + 1.3], [610, hy + 190, a + 1.7]];
  const ck = pop(t, a + 2.1, 0.5);
  const tilt = 12 * bump(t, a + 1.2, 1.4);
  return (
    <>
      <Floor />
      <Fr x={hx} gy={GY} s={0.75} role="teal" lens pose={{ head: tilt }} />
      <Fr x={800} gy={GY} s={0.75} role="blue" />
      {sw.map(([x0, y0, x1, y1, s0], i) => {
        const k = pr(t, s0, s0 + 1.1, out3);
        const op = pop(t, s0, 0.3) * (1 - 0.25 * k);
        return <Drop key={i} x={lerp(x0, x1, k)} y={lerp(y0, y1, k)} s={0.36 * op} color={FL.bening} op={op} virus={false} />;
      })}
      {sl.map(([x1, y1, s0], i) => {
        const k = pr(t, s0, s0 + 1.1, sine);
        const op = pop(t, s0, 0.3);
        return <Drop key={'l' + i} x={lerp(hx + 50, x1, k)} y={lerp(hy + 70, y1, k) - Math.sin(k * Math.PI) * 40} s={0.36 * op} color={FL.bening} op={op} virus={false} rot={-20} />;
      })}
      <L.CheckBadge cx={540} cy={640} s={1.1 * ck} op={ck} />
    </>
  );
};

// ---- adegan 8 (kalimat 9): hanya darah yang dijaga; pisau cukur dan sikat gigi tidak dipakai bersama ----
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const a = T(9), c1 = CL(9, 1);
  const dr = pop(t, a + 0.2, 0.55);
  const rz = pop(t, c1 + 0.5, 0.45), tb = pop(t, c1 + 1.5, 0.45);
  const S8 = c1 + 2.8;
  const sh = 1 - pr(t, S8, S8 + 0.4);
  const mv = pr(t, S8 + 0.1, S8 + 1.1, sine);
  const own = pr(t, S8 + 0.1, S8 + 0.5);
  const cr = pop(t, S8 + 0.15, 0.4);
  const g8 = 1400;
  const reachA = mixF({}, { armL: [60, -50, 0] }, pr(t, S8 + 0.9, S8 + 1.6, sine));
  const reachB = mixF({}, { armR: [60, -50, 0] }, pr(t, S8 + 0.9, S8 + 1.6, sine));
  return (
    <>
      <Floor y={g8} />
      <Fr x={150} gy={g8} s={0.6} role="teal" lens pose={reachB} />
      <Fr x={930} gy={g8} s={0.6} role="blue" pose={reachA} />
      <Drop x={540} y={720} s={1.5 * dr} color={FL.darah} op={dr} t={t} />
      <g opacity={sh}>
        <L.Razor cx={440} cy={1120} s={1.0 * rz} op={rz} color="#B9C3D0" />
        <L.Toothbrush cx={640} cy={1120} s={1.0 * tb} op={tb} color="#B9C3D0" />
      </g>
      <L.CrossBadge cx={540} cy={1130} s={0.9 * cr} op={cr} />
      <L.Razor cx={lerp(440, 300, mv)} cy={1120} s={1.0} op={own} color={CT} />
      <L.Toothbrush cx={lerp(640, 410, mv)} cy={1120} s={1.0} op={own} color={CT} />
      <L.Toothbrush cx={lerp(640, 680, mv)} cy={1120} s={1.0} op={own} color={CB} />
      <L.Razor cx={lerp(440, 790, mv)} cy={1120} s={1.0} op={own} color={CB} />
    </>
  );
};

// ---- adegan 9 (kalimat 10): peneliti (jas putih) menguji dengan kaca pembesar; dokumen penelitian ----
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const a = T(10);
  const h = pop(t, a + 0.05, 0.5);
  const doc = pop(t, a + 0.4, 0.5);
  const st = pop(t, a + 1.3, 0.4);
  const k = pr(t, a + 0.2, a + 1.2, sine);
  const rp: SidePose = mixS({ armN: [55, 70, 0] }, { armN: [100, 12, 0] }, k);
  const hand = handSide(340, GY, S, rp, 1);
  const mg = 1.05;
  return (
    <>
      <Floor op={h} />
      <L.Home cx={800} cy={940} s={1.5 * h} op={h} />
      <Fr x={960} gy={GY} s={0.5 * h} role="teal" lens op={h} />
      <Hum x={340} gy={GY} s={S * h} role="purple" pose={rp} op={h} />
      <g transform={`translate(${hand.x} ${hand.y}) scale(-1 1)`} opacity={h}>
        <L.Magnifier cx={-30} cy={-30} s={mg} />
      </g>
      <L.Document cx={300} cy={600} s={1.5 * doc} op={doc} kind="paper" stamp={st > 0.5} />
    </>
  );
};

// grid orang kecil (karakter modular, skala kecil)
const GRIDN = 89;
const FamGrid: React.FC<{ t: number; a: number; dt?: number; y0: number; op?: number }> = ({ t, a, dt = 0.024, y0, op = 1 }) => (
  <g opacity={op}>
    {Array.from({ length: GRIDN }, (_, i) => {
      const k = pop(t, a + i * dt, 0.3);
      const col = i % 15, row = Math.floor(i / 15);
      return <Fr key={i} x={540 + (col - 7) * 60} gy={y0 + row * 70} s={0.095 * k} role="yellow" op={k} />;
    })}
  </g>
);

// ---- adegan 10 (kalimat 11): 89 anggota keluarga serumah dengan 25 anak dengan HIV, kebanyakan balita ----
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const a = T(11), c1 = CL(11, 1);
  const kidClause = a + 3.0;
  const young = pr(t, c1 + 0.1, c1 + 1.0, sine);
  return (
    <>
      <FamGrid t={t} a={a + 0.1} y0={640} />
      {Array.from({ length: 25 }, (_, i) => {
        const k = pop(t, kidClause + i * 0.04, 0.3);
        const col = i % 9, row = Math.floor(i / 9);
        return <Fr key={i} x={540 + (col - 4) * 70} gy={1190 + row * 80} s={0.08 * lerp(1, 0.78, young) * k} role="teal" op={k} />;
      })}
    </>
  );
};

// ---- adegan 11 (kalimat 12): berbagi piring/sendok dan handuk, saling memeluk, tidur sekasur ----
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const a = T(12), c1 = CL(12, 1), c2 = CL(12, 2);
  const in1 = pop(t, a + 0.0, 0.4);
  const B = pr(t, c1 - 0.05, c1 + 0.35, sine); // berdiri dan memeluk
  const seatK = (1 - B) * in1;
  const Kx = lerp(300, 490, B), Ax = lerp(780, 600, B);
  const kidP = mixS(SIT, HUGP, B), adP = mixS(SIT, HUGP, B);
  const bed = pr(t, c2 + 0.3, c2 + 0.9);
  const hugOp = (1 - bed) * in1;
  const tbl = in1 * (1 - B);
  const sp = pr(t, a + 0.5, a + 1.5, sine);
  const spx = lerp(424, 656, sp), spy = TABLE_TOP - 30 - Math.sin(sp * Math.PI) * 80;
  const spOp = pr(t, a + 0.4, a + 0.7) * (1 - pr(t, c1 - 0.2, c1 + 0.1));
  const tw = pr(t, a + 1.65, a + 2.5, sine);
  const twOp = pr(t, a + 1.55, a + 1.8) * (1 - pr(t, c1 - 0.2, c1 + 0.1));
  const hg = pop(t, c1 + 0.3, 0.45) * (1 - bed);
  const moon = pop(t, c2 + 0.8, 0.5);
  const BX = 540, BY = 1130; // pusat panggul orang yang berbaring
  return (
    <g transform="translate(540 1330) scale(1.35) translate(-540 -1330)">
      <Floor op={1 - bed} />
      <g opacity={1 - bed}>
        <Hum x={Kx} gy={GY} s={0.55} role="teal" lens pose={kidP} seat={seatK} op={in1} />
        <Hum x={Ax} gy={GY} s={S} role="yellow" pose={adP} face={-1} seat={seatK} op={in1} />
      </g>
      <TableSet op={tbl} />
      <Spoon x={spx} y={spy} rot={20} op={spOp} />
      <Towel x={lerp(360, 720, tw)} y={880 - Math.sin(tw * Math.PI) * 70} op={twOp} s={0.9} />
      {hg > 0.02 && <L.Heart cx={545} cy={740} s={0.5 * hg} op={hg} />}
      {bed > 0.01 && (
        <g opacity={bed}>
          <rect x={250} y={BY - 190} width={36} height={340} rx={18} fill="#8A6A58" />
          <rect x={250} y={BY + 90} width={580} height={64} rx={24} fill="#8A6A58" />
          <rect x={262} y={BY + 40} width={560} height={64} rx={26} fill="#EAF2FB" />
          <rect x={290} y={BY - 22} width={190} height={44} rx={22} fill="#FFFFFF" />
          <ActorSide cx={BX + 60} cy={BY - 24} s={0.36} role="teal" rot={-90} op={bed} />
          <ActorSide cx={BX - 50} cy={BY + 6} s={0.46} role="yellow" rot={-90} op={bed} />
          <rect x={BX - 130} y={BY - 10} width={380} height={70} rx={30} fill="#7FB5E8" opacity={0.95} />
          <rect x={BX - 130} y={BY - 10} width={380} height={18} rx={9} fill="#fff" opacity={0.25} />
        </g>
      )}
      <Moon x={850} y={640} s={1.6 * moon} op={moon} />
    </g>
  );
};

// ---- adegan 12 (kalimat 13): hasil penelitian 1990: tidak ada satu pun yang terinfeksi ----
const Scene12: React.FC<{ t: number }> = ({ t }) => {
  const a = T(13), c1 = CL(13, 1);
  const doc = pop(t, a + 0.2, 0.5);
  const gridT = a + 1.2;
  const ck = pop(t, c1 + 0.1, 0.55);
  const dim = 1 - 0.55 * pr(t, c1, c1 + 0.5);
  return (
    <>
      <L.Document cx={540} cy={560} s={1.6 * doc} op={doc} kind="paper" stamp={ck > 0.5} />
      <FamGrid t={t} a={gridT} dt={0.02} y0={960} op={dim} />
      <L.CheckBadge cx={540} cy={1160} s={1.9 * ck} op={ck * 0.96} />
    </>
  );
};

// ---- adegan 13 (kalimat 14): peluk saja ----
const Scene13: React.FC<{ t: number }> = ({ t }) => {
  const a = T(14), c1 = CL(14, 1);
  const h = pop(t, a + 0.1, 0.55);
  const e = pop(t, a + 0.4, 0.6);
  const hug = pr(t, a + 0.5, a + 1.5, sine);
  const sq = 1 + 0.025 * Math.sin(pr(t, c1, c1 + 0.9) * Math.PI);
  const gy = 1400, sc = 0.9 * sq;
  const hp = mixS({}, HUGP, hug);
  return (
    <>
      <L.Home cx={540} cy={500} s={1.2 * h} op={h} />
      <Floor y={gy} op={e} />
      <Hum x={lerp(300, 470, hug)} gy={gy} s={sc} role="blue" pose={hp} op={e} />
      <Hum x={lerp(780, 620, hug)} gy={gy} s={sc} role="teal" lens pose={hp} face={-1} op={e} />
      {(() => {
        const k = pop(t, c1 + 0.1, 0.5);
        return <L.Heart cx={545} cy={690} s={0.6 * k} op={k} />;
      })()}
      {[0, 1, 2].map((i) => {
        const k = pr(t, c1 + 0.3 + i * 0.3, c1 + 1.7 + i * 0.3);
        return k > 0.01 && k < 0.99 ? <L.Heart key={i} cx={[330, 545, 760][i]} cy={lerp(800, 600, k)} s={0.28} op={Math.sin(k * Math.PI)} /> : null;
      })}
    </>
  );
};

const PILLS: { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number }[] = [
  { a: CL(4, 1) + 0.15, b: T(5) - 0.1, text: 'cairan', k: 'neutral', x: 240, y: CY3 + 230, size: 30 },
  { a: CL(4, 2) + 0.1, b: T(5) - 0.1, text: 'jalan masuk', k: 'neutral', x: 540, y: CY3 + 230, size: 30 },
  { a: CL(4, 3) + 0.1, b: T(5) - 0.1, text: 'jumlah virus', k: 'neutral', x: 840, y: CY3 + 230, size: 30 },
  { a: CL(6, 3) + 0.3, b: T(7) - 0.1, text: 'kulit utuh', k: 'neutral', x: 540, y: 1000, size: 34 },
  ...['darah', 'air mani', 'cairan vagina', 'cairan dubur', 'ASI'].map((text, i) => ({
    a: [CL(7, 0) + 1.8, CL(7, 1) + 0.1, CL(7, 2) + 0.1, CL(7, 3) + 0.1, CL(7, 4) + 0.55][i], b: T(8) - 0.1, text, k: 'neutral' as KK, x: 140 + i * 200, y: i % 2 ? 925 : 860, size: 26,
  })),
  { a: T(8) + 0.3, b: T(9) - 0.1, text: 'keringat', k: 'neutral', x: 170, y: 560, size: 30 },
  { a: T(8) + 1.4, b: T(9) - 0.1, text: 'air liur', k: 'neutral', x: 560, y: 900, size: 30 },
  { a: T(9) + 0.4, b: T(10) - 0.1, text: 'darah', k: 'neutral', x: 540, y: 905, size: 32 },
  { a: CL(9, 1) + 0.6, b: CL(9, 1) + 2.7, text: 'pisau cukur', k: 'neutral', x: 440, y: 1290, size: 26 },
  { a: CL(9, 1) + 1.6, b: CL(9, 1) + 2.7, text: 'sikat gigi', k: 'neutral', x: 640, y: 1290, size: 26 },
  { a: T(11) + 1.5, b: T(12) - 0.1, text: '89 anggota keluarga', k: 'neutral', x: 540, y: 1060, size: 30 },
  { a: T(11) + 3.4, b: CL(11, 1) + 0.1, text: '25 anak', k: 'neutral', x: 540, y: 1400, size: 30 },
  { a: CL(11, 1) + 0.2, b: T(12) - 0.1, text: 'balita', k: 'neutral', x: 540, y: 1400, size: 30 },
  { a: T(13) + 0.6, b: CL(13, 1) - 0.1, text: '1990', k: 'neutral', x: 540, y: 800, size: 34 },
  { a: CL(13, 1) + 0.5, b: T(14) - 0.1, text: '0 terinfeksi', k: 'arv', x: 540, y: 800, size: 34 },
];
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
export const S2E9AltFull: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = gradAt(t);
  const cue = CUES.find((c) => t >= c.a - 0.05 && t < c.b);
  const ck = cue ? Math.min(1, (t - cue.a + 0.05) / 0.18) : 0;
  const subOn = t < CLOSE - 0.05;
  const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10, Scene11, Scene12, Scene13];
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
          <LegendBox t={t} a={0.8} b={T(2) - 0.2} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={CL(4, 3) + 0.2} b={T(5) - 0.2} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={CL(6, 3) + 0.2} b={T(7) - 0.1} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(11) + 0.3} b={T(11) + 4.8} items={[['#FFE082', 'Anggota keluarga'], ['#7FE3C6', 'Anak dengan HIV']]} />
          <LegendBox t={t} a={T(13) + 1.4} b={T(13) + 4.6} items={[['#FFE082', 'Anggota keluarga']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile("vo/S2E9.mp3")} />
    </AbsoluteFill>
  );
};
