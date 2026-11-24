import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL } from '../shared/shapes';
import { Actor, ActorSide, POSES_FRONT, POSES_SIDE, NEUTRAL, NEUTRAL_SIDE } from '../shared/actor';
import type { ActorRole, Pose, SidePose } from '../shared/actor';
import { CUES, CLOSE, SCENE_T, T, CL, EP_DUR } from './timeline';

export const S2E3ALT_FRAMES = Math.ceil(EP_DUR * FPS);

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

Berg, R. C., Page, S., & Øgård-Repål, A. (2021). The effectiveness of peer-support for people living with HIV: A systematic review and meta-analysis. PLOS ONE, 16(6), e0252623.
https://doi.org/10.1371/journal.pone.0252623

Cook, C. L., Canidate, S., Ennis, N., & Cook, R. L. (2018). Types and delivery of emotional support to promote linkage and engagement in HIV care. Patient Preference and Adherence, 12, 45–52.
https://doi.org/10.2147/PPA.S145698

AKURAT.CO. 365 ribu ODHIV terdeteksi, Kemenkes fokus tekan penularan dan perkuat ARV (25 November 2025).
https://www.akurat.co/health/821353/365-ribu-odhiv-terdeteksi-kemenkes-fokus-tekan-penularan-dan-perkuat-arv`;

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
const BG: Grad[] = [B1, B2, B2, B1, B3, B4, B4, B1, B4, B2, B4, B1, B2, B4];

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
  odhiv: '#FFB7A5', nrti: '#72E3D3', nnrti: '#72E3D3', pep: '#72E3D3', tld: '#72E3D3',
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



// =============== tokoh: HANYA karakter modular resmi (src/shared/actor.tsx). Gerak = interpolasi sudut sendi per frame. ===============
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
const JALAN_B: SidePose = { legN: POSES_SIDE.jalan.legF, legF: POSES_SIDE.jalan.legN, armN: POSES_SIDE.jalan.armF, armF: POSES_SIDE.jalan.armN, lean: 4 };
const jalan = (ph: number) => mixS(POSES_SIDE.jalan, JALAN_B, (Math.sin(ph) + 1) / 2);
const cyOf = (gy: number, s: number) => gy - 354 * s;
// tampak depan; h = tinggi kira-kira dalam px (tinggi nominal karakter 720)
const Fr: React.FC<{ x: number; gy: number; h: number; role: ActorRole; pose?: Pose; op?: number; rot?: number }> = ({ x, gy, h, role, pose, op = 1, rot = 0 }) => {
  const sc = h / 720;
  return op < 0.005 || sc < 0.01 ? null : <Actor cx={x} cy={cyOf(gy, sc)} s={sc} role={role} pose={pose} op={op} rot={rot} />;
};
// tampak samping; face = -1 menghadap kiri
const Sd: React.FC<{ x: number; gy: number; h: number; role: ActorRole; pose?: SidePose; face?: 1 | -1; op?: number }> = ({ x, gy, h, role, pose, face = 1, op = 1 }) => {
  const sc = h / 720;
  if (op < 0.005 || sc < 0.01) return null;
  return (
    <g transform={face === -1 ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
      <ActorSide cx={x} cy={cyOf(gy, sc)} s={sc} role={role} pose={pose} op={op} />
    </g>
  );
};
const GY = 1200; // garis tanah
const H = 480; // tinggi tokoh utama

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

// ---------------- gelombang (ombak/laut): dipakai adegan 2, 3, 12 ----------------
const wavePath = (x0: number, x1: number, base: number, amp: number, wl: number, ph: number, bump: number, bumpX: number, bottom: number) => {
  let d = `M ${x0} ${bottom} L ${x0} ${base}`;
  for (let x = x0; x <= x1; x += 18) {
    const y = base - amp * Math.sin((x / wl) * Math.PI * 2 + ph) - bump * Math.exp(-(((x - bumpX) / 230) ** 2));
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return d + ` L ${x1} ${bottom} Z`;
};
const Wave: React.FC<{ t: number; base: number; amp?: number; bump?: number; bumpX?: number; op?: number; bottom?: number; x0?: number; x1?: number; wl?: number; speed?: number }> = ({ t, base, amp = 26, bump = 0, bumpX = 0, op = 1, bottom = 1920, x0 = -60, x1 = 1140, wl = 300, speed = 2.6 }) => (
  <g opacity={op}>
    <path d={wavePath(x0, x1, base + 34, amp * 0.8, wl * 0.8, -t * speed * 0.8 + 1.3, bump * 0.8, bumpX - 60, bottom)} fill="#2F5E92" opacity={0.85} />
    <path d={wavePath(x0, x1, base, amp, wl, -t * speed, bump, bumpX, bottom)} fill="#4A7FCC" opacity={0.92} />
  </g>
);
const Tear: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 1 }) => (
  <path d="M 0 -26 C 14 -4 20 6 20 14 A 20 20 0 0 1 -20 14 C -20 6 -14 -4 0 -26 Z" fill="#8FBDF7" opacity={op} transform={`translate(${x} ${y}) scale(${s})`} />
);

// ---- Adegan 1 (kalimat 1): dokter menyampaikan diagnosis HIV; kertas hasil berpindah ke "kamu"
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const s1 = T(1);
  const me = pr(t, s1 + 0.2, s1 + 0.9, back);
  const dr = pr(t, s1 + 0.3, s1 + 1.0, back);
  const bub = pr(t, s1 + 1.0, s1 + 1.5, back);
  const mv = pr(t, s1 + 1.9, s1 + 3.3, sine);
  const lean = pr(t, s1 + 3.2, s1 + 3.8, sine);
  return (
    <>
      <Fr x={300} gy={GY} h={H * me} role="blue" op={me} pose={mixF({}, POSES_FRONT.kepalaMiring, lean)} />
      <Fr x={810} gy={GY} h={H * dr} role="purple" op={dr} pose={{ armL: [lerp(8, 70, Math.sin(Math.min(1, mv) * Math.PI)), -22 * Math.sin(Math.min(1, mv) * Math.PI), 0] }} />
      <L.SpeechBubble cx={730} cy={610} s={0.95 * bub} op={bub} text="diagnosis HIV" w={440} tail="r" />
      <L.Document cx={lerp(700, 460, mv)} cy={lerp(1010, 1060, mv) - 90 * Math.sin(mv * Math.PI)} s={0.9 * dr} op={dr} rot={lerp(-12, 6, mv)} />
    </>
  );
};

// ---- Adegan 2 (kalimat 2): perasaan datang seperti ombak: gelombang besar menyapu dari kiri dan menaikkan air di sekitar "kamu"
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const s2 = T(2);
  const me = pr(t, s2 - 0.3, s2 + 0.3, back);
  const sweep = pr(t, s2 + 0.1, s2 + 2.0, sine);
  const bx = lerp(-300, 1300, sweep);
  const rise = pr(t, s2 + 0.9, s2 + 2.2, sine);
  const base = lerp(1500, 1090, rise);
  const bump = 190 * Math.sin(Math.min(1, sweep) * Math.PI) * (1 - 0.7 * rise);
  const push = pr(t, s2 + 0.9, s2 + 2.0, sine);
  return (
    <>
      <Fr x={lerp(540, 500, push)} gy={GY} h={H * me} role="blue" op={me} rot={-9 * push} pose={mixF({}, POSES_FRONT.tanganDiDada, push)} />
      <Wave t={t} base={base} amp={22 + 18 * rise} bump={bump} bumpX={bx} />
    </>
  );
};

// ---- Adegan 3 (kalimat 3): kaget (!), takut (titik-titik, gemetar), sedih (air mata, badan merunduk)
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const s3 = T(3), c1 = CL(3, 1), c2 = CL(3, 2);
  const me = pr(t, s3 - 0.3, s3 + 0.3, back);
  const b1 = pr(t, s3 + 0.05, s3 + 0.5, back);
  const b2 = pr(t, c1 + 0.0, c1 + 0.4, back);
  const b3 = pr(t, c2 + 0.0, c2 + 0.4, back);
  const jump = Math.max(0, Math.sin(Math.min(1, (t - s3) / 0.35) * Math.PI)) * 22;
  const shake = pr(t, c1, c1 + 0.2) * (1 - pr(t, c2, c2 + 0.2)) * Math.sin(t * 46) * 7;
  const slump = pr(t, c2, c2 + 0.7, sine);
  const tearK = pr(t, c2 + 0.3, c2 + 1.3, in3);
  const KAGET: Pose = { armL: [70, -20, 0], armR: [70, -20, 0], head: -6 };
  const SEDIH: Pose = { head: 25, lean: 9, armL: [10, -20, 0], armR: [10, -20, 0] };
  const poseKT = mixF(mixF(mixF({}, KAGET, pr(t, s3, s3 + 0.3)), POSES_FRONT.tanganDiDada, pr(t, c1, c1 + 0.3)), SEDIH, pr(t, c2, c2 + 0.5));
  return (
    <>
      <Fr x={540 + shake} gy={GY + 16 * slump - jump * (1 - b2)} h={H * me} role="blue" op={me} pose={poseKT} />
      <L.SpeechBubble cx={270} cy={730} s={0.9 * b1} op={b1} text="!" w={150} tail="r" />
      <L.SpeechBubble cx={540} cy={610} s={0.9 * b2} op={b2} text="..." w={190} tail="l" />
      <L.SpeechBubble cx={810} cy={730} s={0.9 * b3} op={b3} tail="l" w={170} />
      <Tear x={810} y={724} s={0.95 * b3} op={b3 * (1 - tearK)} />
      <Tear x={596 + 14 * slump} y={lerp(900, 1130, tearK)} s={0.8} op={tearK * (1 - pr(t, c2 + 1.3, c2 + 1.5))} />
    </>
  );
};

// ---- Adegan 4 (kalimat 4): reaksi wajar (hati hijau berdenyut); kamu tidak sendirian (orang lain datang dari kiri dan kanan)
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const s4 = T(4), c1 = CL(4, 1);
  const me = pr(t, s4 - 0.3, s4 + 0.3, back);
  const hr = pr(t, s4 + 0.3, s4 + 0.9, back);
  const beat = 1 + 0.12 * Math.max(0, Math.sin((t - s4) * 5.5)) ** 3;
  const come = pr(t, c1 - 0.1, c1 + 1.0, sine);
  const link = pr(t, c1 + 0.9, c1 + 1.5, sine);
  return (
    <>
      <Fr x={540} gy={GY} h={H * me} role="blue" op={me} pose={mixF({}, POSES_FRONT.tanganDiDada, hr)} />
      <L.Heart cx={540} cy={640} s={0.75 * hr * beat} op={hr} color="#7ED6A8" />
      <Fr x={lerp(-160, 150, come) - 5} gy={GY} h={300 * come} role="yellow" op={come} />
      <Fr x={lerp(-160, 150, come) + 95} gy={GY} h={300 * come} role="teal" op={come} />
      <Fr x={lerp(1240, 830, come) - 15} gy={GY} h={300 * come} role="teal" op={come} />
      <Fr x={lerp(1240, 830, come) + 85} gy={GY} h={300 * come} role="yellow" op={come} />
      <line x1={300} y1={1150} x2={lerp(300, 410, link)} y2={1150} stroke="#EAF2FB" strokeWidth={10} strokeLinecap="round" strokeDasharray="4 20" opacity={0.85 * link} />
      <line x1={780} y1={1150} x2={lerp(780, 670, link)} y2={1150} stroke="#EAF2FB" strokeWidth={10} strokeLinecap="round" strokeDasharray="4 20" opacity={0.85 * link} />
    </>
  );
};

// ---- Adegan 5 (kalimat 5): "Lalu apa yang membantu?": tanda tanya besar, lalu empat batu pijakan muncul menuju ke depan
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const s5 = T(5);
  const me = pr(t, s5 - 0.2, s5 + 0.3, back);
  const q = pr(t, s5 + 0.05, s5 + 0.5, back);
  const pulse = 1 + 0.06 * Math.sin((t - s5) * 7);
  const stones: [number, number][] = [[600, 1200], [730, 1130], [860, 1060], [990, 990]];
  return (
    <>
      <Fr x={300} gy={GY} h={H * me} role="blue" op={me} pose={mixF({}, POSES_FRONT.kepalaMiring, q)} />
      <L.SpeechBubble cx={470} cy={680} s={1.1 * q * pulse} op={q} text="?" w={240} tail="l" />
      {stones.map(([x, y], i) => {
        const k = pr(t, s5 + 0.55 + i * 0.22, s5 + 0.95 + i * 0.22, back);
        return <ellipse key={i} cx={x} cy={y} rx={62 * k} ry={30 * k} fill="#EAF2FB" opacity={0.9 * k} />;
      })}
    </>
  );
};

// ---- Adegan 6 (kalimat 6): beri dirimu jeda: jam berputar lalu berhenti, tanda jeda muncul, kamu bernapas tenang
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const s6 = T(6), c1 = CL(6, 1);
  const me = pr(t, s6 - 0.2, s6 + 0.3, back);
  const clk = pr(t, s6 + 0.05, s6 + 0.55, back);
  const spin = pr(t, s6 + 0.1, c1 + 0.1, in3);
  const pause = pr(t, c1 + 0.1, c1 + 0.6, back);
  const breathe = 1 + 0.03 * Math.sin(Math.max(0, t - c1) * 3.2);
  return (
    <>
      <Fr x={300} gy={GY + 6} h={H * me * breathe} role="blue" op={me} pose={mixF({}, POSES_FRONT.tanganDiDada, pr(t, s6 + 0.3, c1 + 0.3))} />
      <L.Clock cx={770} cy={850} s={1.7 * clk} op={clk} frac={spin} hour={3} />
      <g transform={`translate(770 1180) scale(${pause})`} opacity={pause}>
        <circle r={78} fill="#72E3D3" />
        <rect x={-30} y={-34} width={20} height={68} rx={8} fill="#173A5E" />
        <rect x={10} y={-34} width={20} height={68} rx={8} fill="#173A5E" />
      </g>
    </>
  );
};

// ---- Adegan 7 (kalimat 7): tidak semua diputuskan hari ini: tiga kertas keputusan dipindah ke tanggal-tanggal nanti di kalender
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const s7 = T(7);
  const me = pr(t, s7 - 0.2, s7 + 0.3, back);
  const cal = pr(t, s7 + 0.05, s7 + 0.6, back);
  const fly = [0, 1, 2].map((i) => pr(t, s7 + 0.6 + i * 0.5, s7 + 1.2 + i * 0.5, sine));
  const marks = [16, 23, 30].filter((_, i) => fly[i] >= 0.99);
  const relax = pr(t, s7 + 2.1, s7 + 2.6, back);
  const reach = pr(t, s7 + 0.5, s7 + 0.9) * (1 - pr(t, s7 + 2.0, s7 + 2.4));
  return (
    <>
      <Fr x={290} gy={GY + 10} h={H * me} role="blue" op={me} pose={{ armR: [lerp(8, 105, reach), -12 * reach, 0], head: 14 * relax, lean: 4 * relax }} />
      <L.Calendar cx={780} cy={900} s={1.6 * cal} op={cal} marks={marks} markColor="#72E3D3" />
      {[0, 1, 2].map((i) => {
        const k = fly[i];
        const vis = pr(t, s7 + 0.1 + i * 0.1, s7 + 0.4 + i * 0.1) * (1 - 0.0) * (k < 0.99 ? 1 : 0);
        return vis > 0.01 ? (
          <L.Document key={i} cx={lerp(240 + i * 55, 700 + i * 40, k)} cy={lerp(700 + i * 40, 900, k) - 120 * Math.sin(k * Math.PI)} s={lerp(0.8, 0.4, k)} rot={lerp(-12 + i * 12, 0, k)} op={vis} />
        ) : null;
      })}
      <L.Heart cx={290} cy={640} s={0.55 * relax} op={relax} color="#7ED6A8" />
    </>
  );
};

// ---- Adegan 8 (kalimat 8): cari satu orang yang aman untuk bercerita: kamu mendekat ke satu orang, perisai aman, bubble cerita, hati
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const s8 = T(8), c1 = CL(8, 1);
  const me = pr(t, s8 - 0.2, s8 + 0.3, back);
  const fr = pr(t, c1, c1 + 0.6, back);
  const walk = pr(t, c1 + 0.2, c1 + 1.6, sine);
  const sh = pr(t, c1 + 0.9, c1 + 1.5, back);
  const talk = pr(t, c1 + 1.3, c1 + 1.8, back);
  const heart = pr(t, c1 + 1.9, c1 + 2.4, back);
  return (
    <>
      <Sd x={lerp(260, 400, walk)} gy={GY} h={H * me} role="blue" op={me} pose={walk > 0.01 && walk < 0.99 ? jalan(t * 7) : POSES_SIDE.berdiri} />
      <Sd x={820} gy={GY} h={H * fr} role="yellow" face={-1} op={fr} pose={{ armN: [lerp(4, 28, talk), 12, 0], head: 6 * talk }} />
      <L.Shield cx={820} cy={690} s={0.9 * sh} op={sh} />
      <L.SpeechBubble cx={400} cy={690} s={0.85 * talk} op={talk} text="..." w={190} tail="r" />
      <L.Heart cx={600} cy={800} s={0.6 * heart} op={heart} color="#7ED6A8" />
    </>
  );
};

// ---- Adegan 9 (kalimat 9): cari teman sesama orang dengan HIV: kelompok datang, garis terhubung, kamu bergabung
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const s9 = T(9), c1 = CL(9, 1);
  const me = pr(t, s9 - 0.2, s9 + 0.3, back);
  const come = pr(t, c1 + 0.0, c1 + 0.9, sine);
  const link = pr(t, c1 + 0.9, c1 + 1.4, sine);
  const join = pr(t, c1 + 1.3, c1 + 1.9, sine);
  return (
    <>
      <Sd x={lerp(200, 330, join)} gy={GY} h={H * me} role="blue" op={me} pose={join > 0.01 && join < 0.99 ? jalan(t * 7) : POSES_SIDE.berdiri} />
      {[-130, 0, 130].map((o, i) => (
        <Sd key={i} x={lerp(1300, 800, come) + o} gy={GY} h={400 * come} role={i === 1 ? 'yellow' : 'teal'} face={-1} op={come} pose={come > 0.01 && come < 0.99 ? jalan(t * 7 + i) : POSES_SIDE.berdiri} />
      ))}
      <line x1={lerp(330, 420, join) + 90} y1={1160} x2={lerp(330, 420, join) + 90 + (560 - 90 - lerp(0, 90, join)) * link} y2={1160} stroke="#EAF2FB" strokeWidth={10} strokeLinecap="round" strokeDasharray="4 20" opacity={0.85 * link * (1 - join)} />
      <L.Heart cx={560} cy={760} s={0.6 * join} op={join} color="#7ED6A8" />
    </>
  );
};

// ---- Adegan 10 (kalimat 10): penelitian (kertas + kaca pembesar + centang) -> dukungan sesama (rangkulan) -> bertahan dalam perawatan (tablet terminum satu per satu)
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const s10 = T(10);
  const doc = pr(t, s10 - 0.1, s10 + 0.5, back);
  const mg = pr(t, s10 + 0.3, s10 + 0.9, back);
  const sweep = Math.sin(Math.max(0, t - s10 - 0.7) * 3.6) * 18;
  const ck = pr(t, s10 + 1.6, s10 + 2.1, back);
  const shrink = pr(t, s10 + 2.2, s10 + 3.0, sine);
  const hug = pr(t, s10 + 2.3, s10 + 3.0, back);
  const bl = pr(t, s10 + 3.0, s10 + 3.6, back);
  const taken = Math.floor(pr(t, s10 + 3.7, s10 + 5.3, sine) * 6.2);
  const dx = lerp(430, 270, shrink), dy = lerp(960, 760, shrink), ds = lerp(1.7, 0.95, shrink);
  return (
    <>
      <L.Document cx={dx} cy={dy} s={ds * doc} op={doc} kind="paper" />
      <L.Magnifier cx={dx + 90 * ds + sweep} cy={dy + 60 * ds} s={1.2 * ds / 1.7 * mg + 0.0} op={mg} />
      <L.CheckBadge cx={dx - 10} cy={dy - 10} s={0.5 * ds / 1.7 * ck} op={ck} />
      <Fr x={495} gy={1210} h={440 * hug} role="blue" op={hug} pose={{ armR: [86, -8, 0], head: 8 }} />
      <L.Heart cx={565} cy={690} s={0.55 * hug} op={hug} color="#7ED6A8" />
      <Fr x={635} gy={1210} h={440 * hug} role="teal" op={hug} pose={{ armL: [86, -8, 0], head: -8 }} />
      <L.Blister cx={880} cy={760} s={1.05 * bl} op={bl} taken={taken} />
    </>
  );
};

// ---- Adegan 11 (kalimat 11): mulai berobat bersama tenaga kesehatan: kamu melangkah ke klinik, dokter menyerahkan tablet ARV
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const s11 = T(11), c1 = CL(11, 1);
  const me = pr(t, s11 - 0.2, s11 + 0.3, back);
  const step = pr(t, s11 + 0.2, c1 + 0.8, sine);
  const cl = pr(t, s11 + 0.1, s11 + 0.7, back);
  const dr = pr(t, c1 - 0.1, c1 + 0.5, back);
  const hand = pr(t, c1 + 0.5, c1 + 1.5, sine);
  const ok = pr(t, c1 + 1.6, c1 + 2.1, back);
  const offer = pr(t, c1 + 0.2, c1 + 0.6) * (1 - pr(t, c1 + 1.5, c1 + 2.0));
  return (
    <>
      <L.Clinic cx={810} cy={590} s={1.0 * cl} op={cl} />
      <Sd x={lerp(220, 360, step)} gy={GY} h={H * me} role="blue" op={me} pose={step > 0.01 && step < 0.99 ? jalan(t * 7) : POSES_SIDE.berdiri} />
      <Sd x={810} gy={GY + 10} h={H * dr} role="purple" face={-1} op={dr} pose={{ armN: [lerp(6, 82, offer), lerp(6, 22, offer), 0] }} />
      {hand > 0.01 && hand < 0.99 && <L.Tablet cx={lerp(700, 480, hand)} cy={lerp(1000, 1010, hand) - 100 * Math.sin(hand * Math.PI)} s={0.9} rot={lerp(-30, 15, hand)} />}
      <L.CheckBadge cx={360} cy={700} s={0.6 * ok} op={ok} />
    </>
  );
};

// ---- Adegan 12 (kalimat 12): ombak pertama bukan seluruh laut: kamera menjauh, ombak besar mengecil jadi riak kecil di laut luas yang tenang, matahari terbit
const Scene12: React.FC<{ t: number }> = ({ t }) => {
  const s12 = T(12);
  const z = pr(t, s12 + 0.4, s12 + 2.0, sine);
  const sea = pr(t, s12 + 1.1, s12 + 2.1, sine);
  const sun = pr(t, s12 + 1.9, s12 + 2.7, back);
  const k = lerp(1, 0.28, z);
  const me = pr(t, s12 - 0.2, s12 + 0.3, back);
  const bottomScreen = lerp(1920, 1430, z);
  const bottomWorld = 1090 + (bottomScreen - 1090) / k;
  return (
    <>
      <L.Sun cx={820} cy={lerp(1000, 740, sun)} s={1.3 * sun} op={sun} />
      <g transform={`translate(540 1090) scale(${k}) translate(-540 -1090)`}>
        <Fr x={440} gy={GY} h={H * me} role="blue" op={me} rot={-9} pose={POSES_FRONT.tanganDiDada} />
        <Wave t={t} base={1090} amp={16} bump={230} bumpX={540} bottom={bottomWorld} x0={-4000} x1={5000} wl={420} />
      </g>
      <g opacity={sea}>
        <Wave t={t} base={1230} amp={12} wl={420} speed={1.4} bottom={1430} x0={-60} x1={1140} />
        <Wave t={t} base={1320} amp={10} wl={380} speed={1.1} bottom={1430} x0={-60} x1={1140} />
      </g>
    </>
  );
};

// ---- Adegan 13 (kalimat 13): di Indonesia: banyak sekali orang (kerumunan 28 orang muncul bergelombang), tiap orang memegang tablet ARV
const CROWD_COLS = ['#8FBDF7', '#B9A2F5', '#F4D77E', '#7ED6A8', '#FF9C85'];
const Scene13: React.FC<{ t: number }> = ({ t }) => {
  const s13 = T(13), c1 = CL(13, 1);
  const cols = 7, rows = 4;
  const items = Array.from({ length: cols * rows }, (_, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const x = 540 + (c - (cols - 1) / 2) * 148;
    const y = 700 + r * 180;
    const d = Math.hypot(c - (cols - 1) / 2, (r - (rows - 1) / 2) * 1.2);
    return { x, y, d, col: CROWD_COLS[(c + r * 2) % CROWD_COLS.length] };
  });
  return (
    <>
      {items.map((it, i) => {
        const a = pr(t, s13 + 0.1 + it.d * 0.14, s13 + 0.55 + it.d * 0.14, back);
        const b = pr(t, c1 + 0.2 + it.d * 0.22, c1 + 0.7 + it.d * 0.22, back);
        return (
          <React.Fragment key={i}>
            <Fr x={it.x} gy={it.y + 68} h={150 * a} role={(i + Math.floor(i / 7)) % 2 ? 'yellow' : 'teal'} op={a} />
            <L.Tablet cx={it.x + 52} cy={it.y - 44} s={0.4 * b} op={b} rot={-20} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---- Adegan 14 (kalimat 14): buku: bab pertama = ombak; halaman terbalik menunjukkan bab lain (matahari, hati, rumah); tumpukan halaman menebal
const PageGlyph: React.FC<{ k: number; gx: number; gy: number }> = ({ k, gx, gy }) => {
  if (k === 0) return (
    <>
      <clipPath id="pgclip"><rect x={gx - 130} y={gy - 100} width={260} height={230} rx={18} /></clipPath>
      <g clipPath="url(#pgclip)"><path d={wavePath(gx - 140, gx + 140, gy + 40, 26, 120, 0.4, 0, gx, gy + 130)} fill="#5B97E0" /><path d={wavePath(gx - 140, gx + 140, gy + 10, 30, 130, 1.6, 0, gx, gy + 130)} fill="#8FBDF7" /></g>
    </>
  );
  if (k === 1) return <L.Sun cx={gx} cy={gy} s={0.8} />;
  if (k === 2) return <L.Heart cx={gx} cy={gy} s={0.9} color="#7ED6A8" />;
  return <L.Home cx={gx} cy={gy} s={0.85} />;
};
const Scene14: React.FC<{ t: number }> = ({ t }) => {
  const s14 = T(14), c1 = CL(14, 1);
  const bk = pr(t, s14 - 0.1, s14 + 0.6, back);
  const pop = pr(t, c1 + 0.0, c1 + 0.5, back);
  const f1 = pr(t, c1 + 0.2, c1 + 1.1, sine);
  const f2 = pr(t, c1 + 1.3, c1 + 2.2, sine);
  const done = (f1 >= 0.99 ? 1 : 0) + (f2 >= 0.99 ? 1 : 0);
  const flipping = f1 > 0 && f1 < 0.99 ? 1 : f2 > 0 && f2 < 0.99 ? 2 : 0;
  const fk = flipping === 1 ? f1 : f2;
  const stack = 1 + Math.floor(pr(t, c1 + 0.2, c1 + 2.4, sine) * 5);
  const gxR = 170, gxL = -170, gy = -20;
  const rightIdx = done + 1;
  const sx = Math.cos(fk * Math.PI);
  return (
    <g transform={`translate(540 1010) scale(${1.3 * bk})`} opacity={bk}>
      <rect x={-350} y={-235} width={700} height={470} rx={34} fill="#2F5E92" />
      {Array.from({ length: stack }, (_, i) => (
        <rect key={i} x={6 + i * 5} y={-215 + i * 3} width={324} height={420} rx={20} fill="#DCE8F7" />
      ))}
      <rect x={-330} y={-215} width={324} height={420} rx={20} fill="#F5F9FF" />
      <rect x={6} y={-215} width={324} height={420} rx={20} fill="#F5F9FF" />
      <rect x={-5} y={-215} width={10} height={420} fill="#BBD0EA" />
      <PageGlyph k={done} gx={gxL} gy={gy} />
      {!flipping && <g opacity={done === 0 ? pop : 1}><PageGlyph k={rightIdx} gx={gxR} gy={gy} /></g>}
      {flipping > 0 && <PageGlyph k={done + 2} gx={gxR} gy={gy} />}
      {flipping > 0 && (
        <g transform={`scale(${sx} 1)`}>
          <rect x={6} y={-215} width={324} height={420} rx={20} fill="#F5F9FF" />
          <g transform={sx < 0 ? `translate(${2 * gxR} 0) scale(-1 1)` : undefined}><PageGlyph k={done + 1} gx={gxR} gy={gy} /></g>
        </g>
      )}
    </g>
  );
};

const PILLS: { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number }[] = [
  { a: CL(9, 1) + 1.5, b: T(10) + 0.15, text: 'orang dengan HIV', k: 'neutral', x: 540, y: 1330, size: 44 },
  { a: CL(13, 1) + 2.3, b: T(14) + 0.15, text: 'lebih dari 250 ribu', k: 'arv', x: 540, y: 1385, size: 46 },
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
export const S2E3AltFull: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = gradAt(t);
  const cue = CUES.find((c) => t >= c.a - 0.05 && t < c.b);
  const ck = cue ? Math.min(1, (t - cue.a + 0.05) / 0.18) : 0;
  const subOn = t < CLOSE - 0.05;
  const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10, Scene11, Scene12, Scene13, Scene14];
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
          <LegendBox t={t} a={T(10) + 3.9} b={T(11) - 0.2} items={[['#FFA27B', 'Obat ARV']]} />
          <LegendBox t={t} a={CL(13, 1) + 0.5} b={CL(13, 1) + 4.8} items={[['#FFA27B', 'Obat ARV']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile("vo/S2E3.mp3")} />
    </AbsoluteFill>
  );
};
