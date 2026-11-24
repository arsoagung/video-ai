import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL, Star } from '../shared/shapes';
import { Actor, ActorSide, POSES_FRONT, POSES_SIDE, NEUTRAL, NEUTRAL_SIDE } from '../shared/actor';
import type { ActorRole, Pose, SidePose } from '../shared/actor';
import { CUES, CLOSE, SCENE_T, T, TE, CL, EP_DUR } from './timeline';

export const S2E8ALT_FRAMES = Math.ceil(EP_DUR * FPS);

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

1. Finzi D et al. (1999). Latent infection of CD4+ T cells provides a mechanism for lifelong persistence of HIV-1, even in patients on effective combination therapy. Nat Med. 5(5), 512-517.
https://doi.org/10.1038/8394

2. Siliciano JD et al. (2003). Long-term follow-up studies confirm the stability of the latent reservoir for HIV-1 in resting CD4+ T cells. Nat Med. 9(6), 727-728.
https://doi.org/10.1038/nm880

3. McMyn NF et al. (2023). The latent reservoir of inducible, infectious HIV-1 does not decrease despite decades of antiretroviral therapy. J Clin Invest. 133(17), e171554.
https://doi.org/10.1172/JCI171554

4. Chun TW et al. (1997). Presence of an inducible HIV-1 latent reservoir during highly active antiretroviral therapy. Proc Natl Acad Sci USA. 94(24), 13193-13197.
https://doi.org/10.1073/pnas.94.24.13193

5. Deeks SG et al. (2016). International AIDS Society global scientific strategy: towards an HIV cure 2016. Nat Med. 22(8), 839-850.
https://doi.org/10.1038/nm.4108`;

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
const BG: Grad[] = [B1, B4, B2, B3, B3, B2, B2, B4, B3, B1, B4, B1, B4];

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

const pop = (t: number, a: number, d = 0.4) => pr(t, a, a + d, back);

// =============== tokoh: HANYA karakter modular resmi (src/shared/actor.tsx). Gerak = interpolasi sudut sendi antar pose per frame. ===============
type J3 = [number, number, number];
const mj = (a: J3, b: J3, k: number): J3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const mixS = (a: SidePose, b: SidePose, k: number): SidePose => {
  const A = { ...NEUTRAL_SIDE, ...a }, B = { ...NEUTRAL_SIDE, ...b };
  return { lean: lerp(A.lean, B.lean, k), head: lerp(A.head, B.head, k), armN: mj(A.armN, B.armN, k), armF: mj(A.armF, B.armF, k), legN: mj(A.legN, B.legN, k), legF: mj(A.legF, B.legF, k) };
};
const mixF = (a: Pose, b: Pose, k: number): Pose => {
  const A = { ...NEUTRAL, ...a }, B = { ...NEUTRAL, ...b };
  return { lean: lerp(A.lean, B.lean, k), head: lerp(A.head, B.head, k), armL: mj(A.armL, B.armL, k), armR: mj(A.armR, B.armR, k), legL: mj(A.legL, B.legL, k), legR: mj(A.legR, B.legR, k) };
};
const cyOf = (gy: number, s: number) => gy - 354 * s;
const Fr: React.FC<{ x: number; gy: number; s: number; role: ActorRole; pose?: Pose; op?: number }> = ({ x, gy, s, role, pose, op = 1 }) =>
  op < 0.005 || s < 0.01 ? null : <Actor cx={x} cy={cyOf(gy, s)} s={s} role={role} pose={pose} op={op} />;
const Sd: React.FC<{ x: number; gy: number; s: number; role: ActorRole; pose?: SidePose; op?: number }> = ({ x, gy, s, role, pose, op = 1 }) =>
  op < 0.005 || s < 0.01 ? null : <ActorSide cx={x} cy={cyOf(gy, s)} s={s} role={role} pose={pose} op={op} />;
const MOUTH: Pose = { armL: [55, -125, 0] };
const POINT_L: Pose = POSES_FRONT.lenganNaik;
const POINT_R: Pose = { armR: [120, 0, 0] };

// ================= komponen episode ini =================
const SEEDC = '#D9A864';
const CD4C = '#8FBDF7', CD4N = '#5B97E0';
const dormCell = (k: number): [string, string] => [mix(CD4C, '#9FB0C6', k), mix(CD4N, '#7184A0', k)];
const Moon: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 1 }) =>
  op < 0.01 || s < 0.02 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <path d="M -6 -50 A 50 50 0 1 0 44 30 A 40 40 0 0 1 -6 -50 Z" fill="#F4D77E" />
    </g>
  );
const Cell: React.FC<{ x: number; y: number; r: number; dorm?: number; rec?: number; op?: number }> = ({ x, y, r, dorm = 0, rec = 0.6, op = 1 }) => {
  const [c, n] = dormCell(dorm);
  return r < 2 || op < 0.01 ? null : <FlatCell cx={x} cy={y} r={r} color={c} nuc={n} rec={rec} op={op} />;
};
const Proviral: React.FC<{ x: number; y: number; r: number; op?: number }> = ({ x, y, r, op = 1 }) =>
  op < 0.01 || r < 2 ? null : <FlatVirus cx={x} cy={y} r={r} dim={op} />;

// ---- adegan 1 (kalimat 1-2): grafik jumlah virus turun, lalu kaca pembesar menemukan virus yang tersisa ----
const CH_PTS = [0.95, 0.9, 0.72, 0.4, 0.18, 0.09, 0.06, 0.05];
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const prog = pr(t, 0.4, 3.5, sine);
  const act = pop(t, 0.1, 0.6);
  const take = pr(t, 1.0, 1.7, sine) * (1 - pr(t, 2.1, 2.7, sine));
  const tabK = pr(t, 0.5, 1.9, sine);
  const tabOut = pr(t, 1.8, 2.1);
  const vr = lerp(74, 24, prog);
  const mag = pr(t, T(2) + 0.2, T(2) + 1.3);
  const vin = pop(t, T(2) + 1.1, 0.5);
  const q = pop(t, T(2) + 1.9, 0.5);
  const tilt = pr(t, T(2) + 0.4, T(2) + 1.2, sine);
  const mx = lerp(1000, 850, mag);
  const pose = mixF(mixF({}, MOUTH, take), POSES_FRONT.kepalaMiring, tilt);
  return (
    <>
      <L.LineChart cx={540} cy={720} w={900} h={580} points={CH_PTS} threshold={0.12} progress={prog} smooth color="#FF9C85" />
      <Virus x={150} y={500} r={vr} t={t} />
      <Fr x={540} gy={1420} s={0.5 * act} role="blue" pose={pose} op={act} />
      <L.Tablet cx={lerp(860, 560, tabK)} cy={lerp(1250, 1100, tabK)} s={1.1 * (1 - tabOut)} op={act * (1 - tabOut)} />
      <g opacity={mag}>
        <L.Magnifier cx={mx} cy={925} s={1.0} />
        <circle cx={mx} cy={925} r={92} fill="#fff" opacity={0.12} />
        {vin > 0.02 && <FlatVirus cx={mx} cy={925} r={26 * vin} rot={t * 20} />}
      </g>
      {q > 0.02 && <L.SpeechBubble cx={270} cy={1140} s={0.9 * q} op={q} text="?" w={150} tail="r" />}
    </>
  );
};

// ---- adegan 2 (kalimat 3): taman, rumput dicabut, biji tertidur di dalam tanah ----
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const a = T(3), c1 = CL(3, 1);
  const soil = pop(t, a + 0.1, 0.6);
  const blades = Array.from({ length: 31 }, (_, i) => i);
  const SEEDS = [
    { x: 400, y: 1170, a: c1 + 0.3 },
    { x: 620, y: 1215, a: c1 + 0.8 },
    { x: 830, y: 1160, a: c1 + 1.3 },
  ];
  const pullK = 0.5 - 0.5 * Math.cos(Math.min(1, Math.max(0, (t - a - 0.9) / 1.4)) * Math.PI * 4);
  const look = pr(t, c1, c1 + 0.6, sine);
  const pose = mixS(mixS({}, POSES_SIDE.membungkuk, pullK), { head: 18 }, look);
  return (
    <>
      <g transform={`translate(0 ${(1 - soil) * 80})`} opacity={soil}>
        <rect x={60} y={940} width={960} height={400} rx={44} fill="#6E4F42" />
        <rect x={60} y={940} width={960} height={70} rx={34} fill="#8A6A58" />
        {blades.map((i) => {
          const x = 250 + i * 25.5;
          const pull = pr(t, a + 0.9 + i * 0.035, a + 1.7 + i * 0.035, in3);
          const h = 76 + ((i * 37) % 30);
          const wob = Math.sin(t * 2 + i) * 3 * (1 - pull);
          return (
            <g key={i} transform={`translate(${x + wob} ${940 - pull * 260}) rotate(${(i % 2 ? 1 : -1) * pull * 40})`} opacity={1 - pull}>
              <path d={`M -9 6 Q -3 ${-h * 0.5} ${(i % 3 - 1) * 8} ${-h} Q 6 ${-h * 0.5} 9 6 Z`} fill={i % 2 ? '#7ED6A8' : '#3FAF7C'} />
            </g>
          );
        })}
        {SEEDS.map((sd, i) => {
          const p = pop(t, sd.a, 0.5);
          const ring = pr(t, sd.a, sd.a + 0.9);
          return (
            <g key={i}>
              {ring > 0.01 && ring < 0.99 && <circle cx={sd.x} cy={sd.y} r={30 + ring * 70} fill="none" stroke="#fff" strokeWidth={5} opacity={0.5 * (1 - ring)} />}
              <L.Seed cx={sd.x} cy={sd.y} s={1.4 * p} op={p} rot={i * 25 - 20} />
            </g>
          );
        })}
      </g>
      <Sd x={150} gy={955} s={0.62 * soil} role="teal" pose={pose} op={soil} />
    </>
  );
};

// ---- adegan 3 (kalimat 4): HIV masuk sel CD4 memori, lalu materi genetiknya disisipkan ke DNA sel ----
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const a = T(4), c1 = CL(4, 1);
  const cellP = pop(t, a + 0.1, 0.6);
  const mv = pr(t, a + 0.6, a + 2.0, sine);
  const vx = lerp(130, 395, mv), vy = lerp(520, 740, mv);
  const enter = pr(t, a + 2.1, a + 3.0);
  const vr = 56 * (1 - enter);
  const lens = pr(t, c1 + 0.2, c1 + 0.9);
  const dnaP = pop(t, c1 + 0.3, 0.6);
  const rnaMv = pr(t, c1 + 1.2, c1 + 3.0, sine);
  const ins = pr(t, c1 + 3.0, c1 + 3.6, back);
  const flash = pr(t, c1 + 3.0, c1 + 4.2);
  return (
    <>
      <Cell x={540} y={900} r={235} rec={0.6 * cellP} op={cellP * (1 - 0.55 * lens)} />
      {vr > 2 && <Virus x={vx} y={vy} r={vr} t={t} />}
      <g opacity={lens}>
        <circle cx={540} cy={900} r={260} fill="#0B2A4F" opacity={0.55} />
        <circle cx={540} cy={900} r={260} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={6} />
      </g>
      <L.DNAHelix cx={540} cy={900} len={380} s={dnaP * 1.0} op={dnaP} />
      {rnaMv < 0.999 && rnaMv > 0 && (
        <g opacity={lens * (1 - ins)}>
          <L.RNAStrand cx={lerp(150, 540, rnaMv)} cy={lerp(520, 900, rnaMv)} len={110} s={1} amp={14} />
        </g>
      )}
      {ins > 0.01 && (
        <g opacity={ins}>
          <rect x={540 - 62} y={900 - 22 * ins} width={124} height={44 * ins} rx={22} fill="#FF9C85" />
          <rect x={540 - 50} y={900 - 7} width={100} height={14} rx={7} fill="#FFE3DA" opacity={0.7} />
        </g>
      )}
      {flash > 0.01 && flash < 0.99 && <circle cx={540} cy={900} r={60 + flash * 160} fill="none" stroke="#FFB7A5" strokeWidth={8} opacity={0.6 * (1 - flash)} />}
    </>
  );
};

// ---- adegan 4 (kalimat 5): sel beristirahat, virus di dalamnya diam ----
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const a = T(5), c1 = CL(5, 1);
  const p = pop(t, a + 0.05, 0.5);
  const rest = pr(t, a + 0.2, a + 1.4, sine);
  const vdim = pr(t, c1, c1 + 1.0);
  const breathe = 1 + 0.03 * Math.sin(Math.max(0, t - a) * 1.6) * (1 - rest * 0.7);
  const R = lerp(215, 190, rest) * breathe;
  return (
    <>
      <Cell x={540} y={900} r={R * p} dorm={rest} rec={lerp(0.6, 0.15, rest)} op={p} />
      <Proviral x={578} y={936} r={lerp(36, 30, vdim)} op={lerp(1, 0.55, vdim) * p} />
      <Moon x={lerp(380, 780, 1)} y={620} s={1.3 * pop(t, a + 0.7, 0.5)} op={pr(t, a + 0.7, a + 1.3)} />
    </>
  );
};

// ---- adegan 5 (kalimat 6): ARV menghentikan virus yang memperbanyak diri, tapi sel diam tidak tersentuh ----
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const a = T(6), c1 = CL(6, 1);
  const p = pop(t, a + 0.05, 0.5);
  const AX = 270, AY = 930;
  const EM = [a + 0.8, a + 1.5, a + 2.2];
  const cap = pr(t, a + 2.3, a + 3.0, sine);
  const bud4 = pr(t, a + 2.7, a + 3.2) * (1 - pr(t, a + 3.3, a + 3.7));
  const shield = pop(t, a + 3.3, 0.5);
  const dp = pop(t, c1 + 0.1, 0.5);
  const pass = pr(t, c1 + 0.5, c1 + 2.2, sine);
  const cross = pop(t, c1 + 1.6, 0.5);
  return (
    <>
      <Cell x={AX} y={AY} r={150 * p} rec={0.6} op={p} />
      {EM.map((e, i) => {
        const u = pr(t, e, e + 1.4, out3);
        const bud = pr(t, e, e + 0.4);
        const dir = [-0.5, 0.1, 0.7][i];
        const x = AX + Math.sin(dir) * (150 + u * 150), y = AY - Math.cos(dir) * (150 + u * 190);
        return bud > 0.02 ? <Virus key={i} x={x} y={y} r={30 * bud} t={t} seed={i} /> : null;
      })}
      {bud4 > 0.02 && <Virus x={AX + 120} y={AY + 100} r={30 * bud4} t={t} seed={4} />}
      <L.Tablet cx={pass > 0 ? lerp(AX + 50, 1010, pass) : lerp(70, AX + 50, cap)} cy={lerp(1290, 1250, cap)} s={1.1 * cap} op={cap * (1 - pr(t, c1 + 2.0, c1 + 2.3))} />
      {shield > 0.02 && <L.Shield cx={AX + 110} cy={AY + 110} s={0.5 * shield} op={shield} />}
      <Cell x={810} y={AY} r={150 * dp} dorm={1} rec={0.15} op={dp} />
      <Proviral x={840} y={AY + 28} r={26} op={0.55 * dp} />
      <Moon x={860} y={AY - 215} s={0.9 * dp} op={dp} />
      {cross > 0.02 && <L.CrossBadge cx={810} cy={AY + 215} s={0.62 * cross} op={cross} />}
    </>
  );
};

// ---- adegan 6 (kalimat 7): perkiraan lama: biji menyusut separuh tiap 44 bulan, habis dalam 70 tahun ----
const DECAY = [1, 0.5, 0.25, 0.125, 0.0625, 0.032, 0.016, 0.01];
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const a = T(7), c1 = CL(7, 1);
  const p = pop(t, a + 0.05, 0.5);
  const prog = pr(t, a + 0.5, a + 3.6, sine) * 0.43 + pr(t, c1, c1 + 2.5, sine) * 0.57;
  const gone = (i: number) => {
    const k = [99, a + 2.0, a + 3.8, c1 + 0.5, c1 + 2.4];
    return i === 0 ? pr(t, k[4], k[4] + 0.5) : i === 1 ? pr(t, k[3], k[3] + 0.5) : i < 4 ? pr(t, k[2], k[2] + 0.5) : pr(t, k[1], k[1] + 0.5);
  };
  const pt = pr(t, a + 0.6, a + 1.4, sine);
  return (
    <>
      <L.LineChart cx={540} cy={740} w={900} h={560} points={DECAY} progress={prog} smooth color="#F4D77E" op={p} />
      {Array.from({ length: 8 }, (_, i) => {
        const g = gone(i);
        return <L.Seed key={i} cx={130 + i * 72} cy={1290} s={0.8 * (1 - g) * p} op={(1 - g) * p} />;
      })}
      <Fr x={920} gy={1420} s={0.5 * p} role="purple" pose={mixF({}, POINT_L, pt)} op={p} />
    </>
  );
};

// ---- adegan 7 (kalimat 8): studi 2023: penyusutan berhenti; sel pembawa terus membelah ----
const FLAT = [1, 0.62, 0.42, 0.33, 0.29, 0.28, 0.28, 0.28];
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const a = T(8), c1 = CL(8, 1);
  const p = pop(t, a + 0.05, 0.5);
  const shrink = pr(t, c1 - 0.2, c1 + 0.7, sine);
  const cy = lerp(740, 560, shrink), sc = lerp(1, 0.62, shrink);
  const prog = pr(t, a + 0.8, a + 6.0, sine);
  const mg = pr(t, a + 6.2, a + 7.2);
  const mgo = 1 - pr(t, c1 - 0.5, c1 + 0.1);
  const div1 = pr(t, c1 + 0.5, c1 + 1.6, out3);
  const div2 = pr(t, c1 + 2.2, c1 + 3.3, out3);
  const cp = pop(t, c1 + 0.1, 0.5);
  const CY = 1130;
  const xs = [540 - 110, 540 + 110];
  const cells = div2 < 0.01
    ? [{ x: lerp(540, 430, div1) }, { x: lerp(540, 650, div1) }]
    : [{ x: lerp(430, 195, div2) }, { x: lerp(430, 425, div2) }, { x: lerp(650, 655, div2) }, { x: lerp(650, 885, div2) }];
  return (
    <>
      <g transform={`translate(540 ${cy}) scale(${sc}) translate(-540 -740)`} opacity={p}>
        <L.LineChart cx={540} cy={740} w={900} h={560} points={DECAY} progress={1} smooth color="#B9C3D0" op={0.4} />
        <L.LineChart cx={540} cy={740} w={900} h={560} points={FLAT} progress={prog} smooth color="#F4D77E" />
      </g>
      {mg * mgo > 0.01 && (
        <g opacity={mg * mgo}>
          <L.Magnifier cx={lerp(260, 720, mg)} cy={lerp(1000, 745, mg)} />
          <circle cx={lerp(260, 720, mg)} cy={lerp(1000, 745, mg)} r={92} fill="#fff" opacity={0.12} />
          <L.Seed cx={lerp(260, 720, mg)} cy={lerp(1000, 770, mg) + 8} s={0.62} sprout={0.8} />
        </g>
      )}
      {cp > 0.01 && div1 < 0.01 && (
        <>
          <Cell x={540} y={CY} r={95 * cp} rec={0} op={cp} />
          <Proviral x={560} y={CY + 18} r={20} op={0.9 * cp} />
        </>
      )}
      {div1 > 0.01 && div2 < 0.01 &&
        cells.map((c, i) => (
          <React.Fragment key={i}>
            <Cell x={c.x} y={CY} r={95 * (0.82 + 0.18 * div1)} rec={0} />
            <Proviral x={c.x + 20} y={CY + 18} r={20} />
          </React.Fragment>
        ))}
      {div2 > 0.01 &&
        cells.map((c, i) => (
          <React.Fragment key={i}>
            <Cell x={c.x} y={CY} r={95 * (0.82 + 0.18 * div2)} rec={0} />
            <Proviral x={c.x + 20} y={CY + 18} r={20} />
          </React.Fragment>
        ))}
    </>
  );
};

// ---- adegan 8 (kalimat 9): obat tidak lemah ----
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const a = T(9);
  const p = pop(t, a + 0.1, 0.6);
  const ck = pop(t, a + 0.9, 0.5);
  const ray = pr(t, a + 0.5, a + 1.5);
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={-6} y={-250 - ray * 60} width={12} height={46} rx={6} fill="#72E3D3" opacity={0.7 * (1 - ray) * p} transform={`translate(540 860) rotate(${i * 45})`} />
      ))}
      <L.Tablet cx={540} cy={860} s={2.0 * p} op={p} rot={-20} />
      <L.CheckBadge cx={760} cy={680} s={0.9 * ck} op={ck} />
    </>
  );
};

// ---- adegan 9 (kalimat 10): target = sel yang tidur, bukan sekadar tidur ----
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const a = T(10);
  const p = pop(t, a + 0.05, 0.5);
  const rg = [0, 1, 2].map((i) => pr(t, a + 0.2 + i * 0.2, a + 1.2 + i * 0.2, out3));
  const cx = pop(t, a + 1.3, 0.5);
  return (
    <>
      <Cell x={540} y={880} r={170 * p} dorm={1} rec={0.15} op={p} />
      <Proviral x={566} y={906} r={24} op={0.55 * p} />
      <Moon x={700} y={700} s={0.85 * p} op={p} />
      {rg.map((k, i) => (
        <circle key={i} cx={540} cy={880} r={lerp(520, 235 + i * 52, k)} fill="none" stroke="#fff" strokeWidth={9} opacity={0.55 * k} />
      ))}
      <g opacity={rg[2] * 0.6} stroke="#fff" strokeWidth={8} strokeLinecap="round">
        <line x1={540} y1={540} x2={540} y2={640} />
        <line x1={540} y1={1120} x2={540} y2={1220} />
        <line x1={200} y1={880} x2={300} y2={880} />
        <line x1={780} y1={880} x2={880} y2={880} />
      </g>
      <L.CrossBadge cx={700} cy={700} s={0.5 * cx} op={cx} />
    </>
  );
};

// ---- adegan 10 (kalimat 11, klausa 1): membangunkan lalu membersihkan ----
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const a = CL(11, 0), b = CL(11, 1);
  const p = pop(t, a - 0.1, 0.5);
  const sun = pr(t, a + 0.2, a + 1.2, out3);
  const wake = pr(t, a + 0.9, a + 1.8);
  const clean = pr(t, a + 2.3, a + 3.3, in3);
  const ck = pop(t, a + 3.0, 0.5);
  void b;
  const vpop = pop(t, a + 1.6, 0.5);
  const pt = pr(t, a + 0.3, a + 1.0, sine) * (1 - pr(t, a + 2.4, a + 3.1, sine));
  return (
    <>
      <Fr x={160} gy={1360} s={0.55 * p} role="purple" pose={mixF({}, POINT_R, pt)} op={p} />
      <Sun cx={lerp(930, 800, sun)} cy={lerp(1200, 620, sun)} s={0.9 * sun} op={sun * (1 - clean)} />
      <Cell x={540} y={900} r={200 * p * (1 - clean)} dorm={1 - wake} rec={lerp(0.15, 0.6, wake)} op={p * (1 - 0.3 * clean)} />
      <Moon x={400} y={680} s={0.9} op={p * (1 - wake)} />
      <Proviral x={lerp(566, 540, vpop)} y={lerp(930, 640, vpop)} r={lerp(30, 44, vpop) * (1 - clean)} op={lerp(0.55, 1, wake) * p} />
      <L.CheckBadge cx={540} cy={900} s={1.1 * ck} op={ck} />
    </>
  );
};
const Sun = L.Sun;

// ---- adegan 11 (kalimat 11, klausa 2): mengunci biji agar tidak tumbuh ----
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const a = CL(11, 1);
  const p = pop(t, a - 0.1, 0.5);
  const grow = pr(t, a + 0.2, a + 1.0, sine) * (1 - pr(t, a + 2.1, a + 2.7, in3));
  const lk = pop(t, a + 0.9, 0.5);
  const closed = t > a + 1.6;
  const bump = 1 + 0.12 * Math.sin(pr(t, a + 1.6, a + 2.0) * Math.PI);
  const pt = pr(t, a + 0.6, a + 1.2, sine);
  return (
    <>
      <Fr x={160} gy={1360} s={0.55 * p} role="purple" pose={mixF({}, POINT_R, pt)} op={p} />
      <g opacity={p}>
        <rect x={300} y={1020} width={660} height={250} rx={44} fill="#6E4F42" />
        <rect x={300} y={1020} width={660} height={60} rx={30} fill="#8A6A58" />
      </g>
      <L.Seed cx={630} cy={1040} s={1.5 * p} op={p} sprout={grow * 0.85} />
      <L.Lock cx={630} cy={lerp(520, 650, lk)} s={1.5 * lk * bump} op={lk} open={!closed} />
      {closed && <circle cx={630} cy={960} r={180} fill="#fff" opacity={0.08} />}
    </>
  );
};

// ---- adegan 12 (kalimat 12): keduanya masih diriset ----
const Scene12: React.FC<{ t: number }> = ({ t }) => {
  const a = T(12);
  const p1 = pop(t, a + 0.05, 0.5), p2 = pop(t, a + 0.2, 0.5);
  const mv = pr(t, a + 0.3, a + 0.9, sine) + pr(t, a + 0.9, a + 1.1);
  const mx = mv < 1 ? lerp(330, 330, 0) + 0 : 0;
  void mx;
  const m = pr(t, a + 0.35, a + 0.8) * (1 - pr(t, a + 0.8, a + 1.0)) + 0;
  void m;
  const first = pr(t, a + 0.25, a + 0.55);
  const move = pr(t, a + 0.55, a + 0.95, sine);
  const x = lerp(330, 750, move);
  const th = pr(t, a + 0.3, a + 0.9, sine);
  return (
    <>
      <Fr x={540} gy={1400} s={0.55 * p1} role="purple" pose={mixF({}, POSES_FRONT.kepalaMiring, th)} op={p1} />
      <Sun cx={330} cy={820} s={0.85 * p1} op={p1} />
      <L.Lock cx={750} cy={830} s={1.3 * p2} op={p2} open={false} />
      <g opacity={first}>
        <L.Magnifier cx={x} cy={820} s={1.15} />
        <circle cx={x} cy={820} r={105} fill="#fff" opacity={0.1} />
      </g>
    </>
  );
};

// ---- adegan 13 (kalimat 13): sampai saat itu, ARV tetap harus diminum ----
const Scene13: React.FC<{ t: number }> = ({ t }) => {
  const a = T(13), c1 = CL(13, 1);
  const p = pop(t, a + 0.05, 0.5);
  const days = Math.min(20, Math.floor(Math.max(0, t - a - 0.3) * 14));
  const marks = Array.from({ length: days }, (_, i) => i);
  const sw = pr(t, c1 - 0.2, c1 + 0.6, sine);
  const bl = pop(t, c1 + 0.2, 0.5);
  const taken = t > c1 + 1.1 ? (t > c1 + 1.5 ? 2 : 1) : 0;
  const ck = pop(t, c1 + 1.5, 0.5);
  const take = Math.max(0, 1 - Math.abs(t - (c1 + 1.1)) / 0.35, 1 - Math.abs(t - (c1 + 1.5)) / 0.35);
  return (
    <>
      <Fr x={190} gy={1400} s={0.6 * p} role="blue" pose={mixF({}, MOUTH, take)} op={p} />
      <L.Calendar cx={lerp(540, 250, sw)} cy={lerp(820, 780, sw)} s={lerp(1.6, 0.95, sw) * p} op={p} marks={marks} markColor="#72E3D3" />
      <L.Blister cx={640} cy={900} s={1.5 * bl} op={bl} taken={taken} />
      <L.CheckBadge cx={880} cy={700} s={0.7 * ck} op={ck} />
    </>
  );
};


const PILLS: { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number }[] = [
  { a: T(7) + 3.3, b: T(7) + 5.4, text: '44 bulan', k: 'neutral', x: 690, y: 700 },
  { a: CL(7, 1) + 1.4, b: CL(7, 1) + 4.4, text: '70 tahun', k: 'neutral', x: 690, y: 700 },
  { a: T(8) + 0.3, b: T(8) + 4.0, text: '2023', k: 'neutral', x: 540, y: 410 },
  { a: T(8) + 5.4, b: CL(8, 1) - 0.3, text: '7 tahun', k: 'neutral', x: 600, y: 1110 },
];const Pills: React.FC<{ t: number }> = ({ t }) => (
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
export const S2E8AltFull: React.FC = () => {
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
          <LegendBox t={t} a={0.3} b={T(2) - 0.2} items={[['#FF9C85', 'Jumlah virus'], ['#FF6B4D', 'Batas deteksi tes']]} />
          <LegendBox t={t} a={CL(3, 1) + 0.3} b={CL(3, 1) + 4.6} items={[['#D9A864', 'Biji = virus yang bersembunyi']]} />
          <LegendBox t={t} a={T(4) + 0.2} b={T(4) + 3.3} items={[['#FF9C85', 'Virus HIV'], ['#8FBDF7', 'Sel CD4 memori']]} />
          <LegendBox t={t} a={CL(4, 1) + 0.3} b={CL(4, 1) + 4.2} items={[['#F4D77E', 'DNA sel'], ['#FF9C85', 'Materi genetik virus']]} />
          <LegendBox t={t} a={T(6) + 0.4} b={T(6) + 4.4} items={[['#FF9C85', 'Virus HIV'], ['#8FBDF7', 'Sel CD4']]} />
          <LegendBox t={t} a={T(7) + 0.3} b={T(7) + 4.5} items={[['#F4D77E', 'Jumlah biji']]} />
          <LegendBox t={t} a={T(8) + 0.5} b={T(8) + 5.0} items={[['#F4D77E', 'Studi terbaru'], ['#B9C3D0', 'Perkiraan awal']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile("vo/S2E8.mp3")} />
    </AbsoluteFill>
  );
};
