import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { Actor } from '../shared/actor';
import type { ActorRole, Pose } from '../shared/actor';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T, T, CL, EP_DUR } from './timeline';

export const S2E4ALT_FRAMES = Math.ceil(EP_DUR * FPS);

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

National Institutes of Health, HIVinfo. Understanding HIV Transmission.
https://hivinfo.nih.gov/understanding-hiv/fact-sheets/understanding-hiv-transmission

HIV.gov. How Is HIV Transmitted?
https://www.hiv.gov/hiv-basics/overview/about-hiv-and-aids/how-is-hiv-transmitted`;

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
const BG: Grad[] = [B1, B2, B3, B1, B2, B4, B3, B2, B4, B4, B1];

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
      {virus && <FlatVirus cx={4} cy={30} r={29} rot={t * 24} />}
    </g>
  );
const bob = (t: number, i: number, a = 6) => Math.sin(t * 2.4 + i * 1.3) * a;
const pop = (t: number, a: number, d = 0.4) => pr(t, a, a + d, back);

// ---------------- karakter modular (src/shared/actor.tsx) ----------------
const cyOf = (gy: number, s: number) => gy - 354 * s; // gy = garis tanah
const Fr: React.FC<{ x: number; gy: number; s: number; role: ActorRole; pose?: Pose; op?: number }> = ({ x, gy, s, role, pose, op = 1 }) =>
  op < 0.005 || s < 0.01 ? null : <Actor cx={x} cy={cyOf(gy, s)} s={s} role={role} pose={pose} op={op} />;
type A3 = [number, number, number];
const bl = (a: A3, b: A3, k: number): A3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---- Adegan 1 (kalimat 1): lima tetes cairan muncul satu per satu, tiap tetes membawa virus
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const s = T(1);
  return (
    <>
      {FLUIDS.map((c, i) => {
        const k = pop(t, s + 0.3 + i * 0.5, 0.45);
        return <Drop key={i} x={140 + i * 200} y={900 + bob(t, i, 8) * k} s={1.45 * k} color={c} op={k} t={t} />;
      })}
    </>
  );
};

// ---- Adegan 2 (kalimat 2): lima tetes mengecil ke atas; tetes bening (tanpa virus) muncul di bawah, virus dicoret
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const s = T(2);
  const mv = pr(t, s + 0.0, s + 0.6, sine);
  const cl = [0, 1, 2, 3].map((i) => pop(t, s + 0.45 + i * 0.15, 0.4));
  const cr = pop(t, s + 0.9, 0.4);
  return (
    <>
      {FLUIDS.map((c, i) => (
        <Drop key={i} x={lerp(140 + i * 200, 220 + i * 160, mv)} y={lerp(900, 620, mv) + bob(t, i, 4)} s={lerp(1.45, 0.8, mv)} color={c} t={t} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Drop key={'b' + i} x={200 + i * 227} y={1150 + bob(t, i + 2, 5) * cl[i]} s={1.3 * cl[i]} color={FL.bening} op={cl[i]} virus={false} />
      ))}
      <g opacity={cr}>
        <FlatVirus cx={540} cy={890} r={56 * cr} dim={0.85} rot={t * 10} />
        <L.CrossBadge cx={628} cy={826} s={0.7 * cr} />
      </g>
    </>
  );
};

// ---- Adegan 3 (kalimat 3): "Kenapa bisa setegas itu?": kaca pembesar menyisir lima tetes + tanda tanya
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const s = T(3);
  const mg = pop(t, s + 0.05, 0.4);
  const sweep = pr(t, s + 0.2, s + 1.55, sine);
  const q = pop(t, s + 0.6, 0.4);
  const fade = 1 - 0.65 * pr(t, s, s + 0.4);
  return (
    <>
      {FLUIDS.map((c, i) => (
        <Drop key={i} x={220 + i * 160} y={620 + bob(t, i, 4)} s={0.8} color={c} t={t} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Drop key={'b' + i} x={200 + i * 227} y={1150} s={1.3} color={FL.bening} op={fade} virus={false} />
      ))}
      <L.Magnifier cx={lerp(180, 780, sweep) - 100} cy={620 - 70 + 24 * Math.sin(sweep * Math.PI)} s={1.5 * mg} op={mg} />
      <L.SpeechBubble cx={540} cy={930} s={1.3 * q} op={q} text="?" w={220} tail="l" />
    </>
  );
};

// ---- Adegan 4 (kalimat 4): lima cairan disebut satu per satu, tiap tetes menyala dan diberi label
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const xs = [130, 335, 540, 745, 950];
  const labels = ['darah', 'air mani', 'cairan vagina', 'cairan dubur', 'ASI'];
  const ly = [1060, 1150, 1060, 1150, 1060];
  const s0 = T(4);
  return (
    <>
      {FLUIDS.map((c, i) => {
        const a = CL(4, i);
        const hl = pr(t, a - 0.05, a + 0.3, back) * (1 - pr(t, a + 0.7, a + 1.1));
        const lab = pr(t, a, a + 0.3);
        return (
          <React.Fragment key={i}>
            <Drop x={xs[i]} y={840 + bob(t, i, 4)} s={lerp(1.0, 1.3, pr(t, s0, s0 + 0.6)) * (1 + 0.2 * hl)} color={c} t={t} />
            <SvgPill x={xs[i]} y={ly[i]} text={labels[i]} k="neutral" size={32} op={lab} />
          </React.Fragment>
        );
      })}
      {(() => {
        const a = CL(4, 1) + 0.9;
        const k = pop(t, a, 0.45);
        return <Drop x={lerp(335, 405, k)} y={lerp(840, 700, k)} s={0.6 * k} color={FL.mani} op={k} />;
      })()}
    </>
  );
};

// ---- Adegan 5 (kalimat 5): "cairan saja belum cukup": kawanan tetes mendekati gembok tertutup lalu terpental
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const s = T(5);
  const lk = pop(t, s - 0.1, 0.4);
  const go = pr(t, s + 0.35, s + 1.0, in3);
  const back_ = pr(t, s + 1.0, s + 1.7, out3);
  const dx = lerp(0, 300, go) - lerp(0, 190, back_);
  const shake = pr(t, s + 1.0, s + 1.05) * (1 - pr(t, s + 1.0, s + 1.5)) * Math.sin(t * 60) * 8;
  return (
    <>
      <L.Lock cx={790 + shake} cy={1000} s={2.4 * lk} op={lk} />
      {FLUIDS.map((c, i) => (
        <Drop key={i} x={170 + dx + (i % 3) * 110} y={880 + Math.floor(i / 3) * 190 + (i % 3 === 1 ? -36 : 0)} s={0.8} color={c} t={t} />
      ))}
    </>
  );
};

// ---- Adegan 6 (kalimat 6): jalur masuk satu per satu
const Vig: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) => {
  const o = win(t, a, b, 0.3);
  return o < 0.01 ? null : <g opacity={o}>{children}</g>;
};
const HUG_L: A3 = [62, -48, 0];
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const c = (k: number) => CL(6, k);
  const end = (k: number) => (k < 6 ? CL(6, k + 1) : T(7));
  // V0: gembok terbuka, tetes lewat
  const v0a = c(0);
  const lockOpen = t > v0a + 0.9;
  const lk = pop(t, v0a - 0.1, 0.4);
  const pass = pr(t, v0a + 1.1, v0a + 1.9, sine);
  // V1: seks tanpa pelindung (dua orang berdekatan, saling merangkul bahu)
  const v1a = c(1);
  const e1 = pop(t, v1a - 0.05, 0.4);
  const sh = pop(t, v1a + 0.35, 0.4);
  const x1 = pr(t, v1a + 0.7, v1a + 1.4, sine);
  const hug1 = pr(t, v1a + 0.1, v1a + 0.7, sine);
  // V2: jarum bergantian
  const v2a = c(2);
  const p2 = pop(t, v2a - 0.05, 0.4);
  const reach = pr(t, v2a + 0.0, v2a + 0.4, sine);
  const sy1 = pr(t, v2a + 0.2, v2a + 0.95, sine);
  const sy2 = pr(t, v2a + 1.05, v2a + 1.8, sine);
  const synX = lerp(lerp(340, 740, sy1), 340, sy2);
  // V3-V5: ibu dan bayi
  const m0 = c(3);
  const mo = pop(t, m0 - 0.05, 0.45);
  const dr1 = pr(t, m0 + 0.35, m0 + 1.2, sine);
  const out_ = pr(t, c(4) + 0.0, c(4) + 0.6, sine);
  const asi = pr(t, c(5) + 0.1, c(5) + 0.95, sine);
  const hold = pr(t, c(5) - 0.1, c(5) + 0.4, sine);
  const babyS = lerp(0.2, 0.34, out_);
  const babyX = lerp(380, 700, out_);
  const babyGy = lerp(1000, 1170, out_);
  // V6: transfusi / tusukan
  const v6a = c(6);
  const t6 = pop(t, v6a - 0.05, 0.4);
  const flow = pr(t, v6a + 0.2, v6a + 1.3, sine);
  const jab = pr(t, v6a + 1.7, v6a + 2.4, sine);
  const dots = [c(1) + 0.8, c(2) + 0.8, m0 + 0.8, v6a + 0.5];
  return (
    <>
      <Vig t={t} a={v0a} b={end(0)}>
        <L.Lock cx={540} cy={900} s={2.4 * lk} op={lk} open={lockOpen} />
        <Drop x={lerp(150, 930, pass)} y={900 + bob(t, 0, 5)} s={0.8} color={FL.darah} t={t} />
        <line x1={110} y1={1110} x2={970} y2={1110} stroke="#EAF2FB" strokeWidth={8} strokeLinecap="round" strokeDasharray="2 22" opacity={0.7} />
      </Vig>
      <Vig t={t} a={v1a} b={end(1)}>
        <Fr x={lerp(400, 460, hug1)} gy={1180} s={0.66} role="yellow" op={e1} pose={{ armR: bl([7, 0, 0], HUG_L, hug1), head: 6 * hug1 }} />
        <Fr x={lerp(680, 620, hug1)} gy={1180} s={0.66} role="teal" op={e1} pose={{ armL: bl([7, 0, 0], HUG_L, hug1), head: -6 * hug1 }} />
        <L.Shield cx={540} cy={470} s={0.95 * sh} op={sh} color="#72E3D3" />
        <L.CrossBadge cx={630} cy={540} s={0.6 * sh} op={sh} />
        <Drop x={lerp(470, 610, x1)} y={660 - 60 * Math.sin(x1 * Math.PI)} s={0.5} color={FL.mani} op={x1 > 0 ? 1 : 0} t={t} />
      </Vig>
      <Vig t={t} a={v2a} b={end(2)}>
        <Fr x={200} gy={1180} s={0.7} role="teal" op={p2} pose={{ armR: bl([7, 0, 0], [84, -8, 0], reach) }} />
        <Fr x={880} gy={1180} s={0.7} role="yellow" op={p2} pose={{ armL: bl([7, 0, 0], [84, -8, 0], reach) }} />
        <L.Syringe cx={synX} cy={845} s={1.05} fill={0.7} op={reach} />
        <Drop x={synX - 5} y={760} s={0.4} color={FL.darah} op={reach} t={t} />
      </Vig>
      <Vig t={t} a={m0} b={end(5)}>
        <Fr x={380} gy={1180} s={0.82} role="yellow" op={mo} pose={{ armR: bl([7, 0, 0], [48, -42, 0], hold), head: 5 * hold }} />
        <circle cx={380} cy={cyOf(1180, 0.82) - 4} r={96 * mo} fill="#FFFFFF" opacity={0.5 * mo * (1 - out_)} />
        <Fr x={babyX} gy={babyGy} s={babyS * mo} role="yellow" op={mo} />
        <Drop x={380} y={lerp(800, 900, dr1)} s={0.42} color={FL.darah} op={dr1 > 0 && t < c(4) ? 1 : 0} virus />
        <Drop x={lerp(450, 690, asi)} y={lerp(900, 1000, asi) - 60 * Math.sin(asi * Math.PI)} s={0.42} color={FL.asi} op={asi > 0 && asi < 0.99 ? 1 : 0} t={t} />
      </Vig>
      <Vig t={t} a={v6a} b={end(6)}>
        <L.BloodTube cx={230} cy={900} s={1.3 * t6} op={t6} level={lerp(0.8, 0.2, flow)} />
        <path d="M 290 760 C 430 760 560 880 716 940" fill="none" stroke="#F0616A" strokeWidth={14} strokeLinecap="round" opacity={0.85 * t6} />
        <Fr x={840} gy={1180} s={0.7} role="teal" op={t6} pose={{ armL: [26, -14, 0] }} />
        <Drop x={lerp(290, 716, flow)} y={lerp(760, 940, flow) - 30 * Math.sin(flow * Math.PI)} s={0.38} color={FL.darah} op={flow > 0 && flow < 0.98 ? 1 : 0} t={t} />
        <L.Syringe cx={lerp(560, 650, jab)} cy={lerp(640, 930, jab)} s={0.75} rot={lerp(30, 8, jab)} fill={0.6} op={jab > 0 ? 1 : 0} />
      </Vig>
      {dots.map((a, i) => {
        const k = pop(t, a, 0.3);
        return <circle key={i} cx={540 + (i - 1.5) * 64} cy={1335} r={14 * k} fill="#72E3D3" opacity={k} />;
      })}
    </>
  );
};

// ---- Adegan 7 (kalimat 7): cairan harus bertemu selaput lendir / luka terbuka / aliran darah
const Tissue: React.FC<{ w?: number }> = ({ w = 760 }) => (
  <g>
    <rect x={-w / 2} y={0} width={w} height={230} rx={40} fill="#E59A92" />
    <rect x={-w / 2} y={-34} width={w} height={64} rx={32} fill="#F6C1B8" />
    <rect x={-w / 2 + 40} y={-22} width={w - 200} height={12} rx={6} fill="#FFFFFF" opacity={0.5} />
  </g>
);
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const c = (k: number) => CL(7, k);
  const A = win(t, c(1) - 0.3, c(3) - 0.05, 0.4);
  const B = win(t, c(3) - 0.05, c(4) - 0.05, 0.35);
  const C = win(t, c(4) - 0.05, T(8) + 0.2, 0.35);
  const d0 = pop(t, T(7) + 0.05, 0.4);
  const touch = pr(t, c(1) + 0.15, c(1) + 1.5, in3);
  const moist = pr(t, c(2) + 0.1, c(2) + 1.0, sine);
  const pulse = 0.5 + 0.5 * Math.sin(Math.max(0, t - c(2)) * 5);
  const cut = pr(t, c(3) - 0.05, c(3) + 0.35, back);
  const enter = pr(t, c(3) + 0.35, c(3) + 1.1, sine);
  const vein = pr(t, c(4) - 0.05, c(4) + 0.4, back);
  const merge = pr(t, c(4) + 0.3, c(4) + 0.9, in3);
  const flowX = (t * 190) % 840;
  return (
    <>
      <g opacity={A}>
        <g transform="translate(540 960) scale(1.1)">
          <Tissue />
          <rect x={-380} y={-34} width={760} height={64} rx={32} fill="#FFFFFF" opacity={0.18 * moist * (0.6 + 0.8 * pulse)} />
          {[-250, -120, 20, 150, 270].map((x, i) => (
            <ellipse key={i} cx={x} cy={-40 - 3 * Math.sin(t * 3 + i)} rx={14 * moist} ry={8 * moist} fill="#CFEFFB" opacity={0.9 * moist} />
          ))}
        </g>
      </g>
      <g opacity={B}>
        <g transform="translate(540 960) scale(1.1)">
          <rect x={-380} y={-34} width={760} height={230} rx={40} fill="#F7C6A5" />
          <path d={`M -34 -34 L 0 ${lerp(-34, 150, cut)} L 34 -34 Z`} fill="#C9434D" />
          <path d={`M -34 -34 L 0 ${lerp(-34, 150, cut)} L 34 -34 Z`} fill="#F0616A" opacity={0.6} transform="scale(0.55 0.9) translate(0 -2)" />
        </g>
      </g>
      <g opacity={C}>
        <L.Vessel cx={540} cy={1010} w={940} h={190} op={vein} />
        {Array.from({ length: 6 }, (_, i) => {
          const x = 90 + ((i * 150 + flowX) % 900);
          return <ellipse key={i} cx={x} cy={1010 + (i % 2 ? 22 : -22)} rx={26} ry={15} fill="#C9434D" opacity={0.75 * vein} />;
        })}
      </g>
      {t < c(3) - 0.05 && <Drop x={lerp(270, 540, touch)} y={lerp(680, 900, touch)} s={0.8 * d0} color={FL.darah} op={d0} t={t} />}
      {t >= c(3) - 0.05 && t < c(4) - 0.05 && <Drop x={lerp(380, 540, enter)} y={lerp(680, 930, enter)} s={0.8 * (1 - 0.55 * enter)} color={FL.darah} op={1 - 0.6 * enter} t={t} />}
      {t >= c(4) - 0.05 && <Drop x={lerp(300, 540, merge)} y={lerp(680, 1010, merge)} s={0.8 * (1 - 0.6 * merge)} color={FL.darah} op={1 - merge} t={t} />}
      {t >= c(4) + 0.9 && <FlatVirus cx={lerp(540, 900, pr(t, c(4) + 0.9, T(8) + 0.2, sine))} cy={1010} r={30} rot={t * 20} />}
      <SvgPill x={540} y={1330} text="selaput lendir" k="neutral" size={40} op={win(t, c(1) + 0.4, c(3) - 0.05, 0.3)} />
      <SvgPill x={540} y={1330} text="luka terbuka" k="neutral" size={40} op={win(t, c(3) + 0.1, c(4) - 0.05, 0.3)} />
      <SvgPill x={540} y={1330} text="aliran darah" k="neutral" size={40} op={win(t, c(4) + 0.1, T(8) + 0.1, 0.3)} />
    </>
  );
};

// ---- Adegan 8 (kalimat 8): grafik titik 89 dari 100 diagnosis baru berasal dari kontak seksual (CDC)
const WAFFLE_C = '#8FD3F0';
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const s = T(8), c1 = CL(8, 1);
  const cdc = pop(t, s + 0.1, 0.4);
  const fill = pr(t, c1 + 0.3, c1 + 3.3, sine) * 89;
  const num = pop(t, c1 + 3.3, 0.45);
  const as_ = pop(t, c1 + 4.1, 0.4);
  return (
    <>
      <SvgPill x={290} y={600} text="CDC" k="cell" size={56} op={cdc} />
      <g opacity={num} transform={`translate(760 635) scale(${0.85 + 0.15 * num})`}>
        <text textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={112} fill="#FFFFFF">89%</text>
      </g>
      <g transform="translate(540 990)">
        {Array.from({ length: 100 }, (_, n) => {
          const r = Math.floor(n / 10), c = n % 10;
          const lit = n < fill;
          const appear = pr(t, s + 0.15 + n * 0.004, s + 0.6 + n * 0.004);
          return <circle key={n} cx={(c - 4.5) * 62} cy={(r - 4.5) * 62} r={24 * (0.6 + 0.4 * appear)} fill={lit ? WAFFLE_C : '#B9C3D0'} opacity={(lit ? 1 : 0.55) * appear} />;
        })}
      </g>
      <SvgPill x={540} y={1395} text="Amerika Serikat" k="neutral" size={34} op={as_} />
    </>
  );
};

// ---- Adegan 9 (kalimat 9): di luar jalur itu, enam hal sehari-hari tidak menularkan (garis dari virus ke tiap hal dicoret)
const Wind: React.FC = () => (
  <g fill="none" stroke="#EAF2FB" strokeWidth={10} strokeLinecap="round">
    <path d="M -80 -30 H 30 A 22 22 0 1 0 8 -52" />
    <path d="M -80 10 H 70 A 26 26 0 1 1 44 36" />
    <path d="M -60 50 H 0" />
  </g>
);
const Water: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d={`M -90 -10 ${Array.from({ length: 19 }, (_, i) => `L ${-90 + i * 10} ${-12 - 8 * Math.sin(i * 0.9 + t * 3)}`).join(' ')} L 90 60 L -90 60 Z`} fill="#4A7FCC" />
    <rect x={-90} y={10} width={180} height={52} rx={10} fill="#2F5E92" opacity={0.6} />
  </g>
);
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const s = T(9);
  const vi = pop(t, s + 0.05, 0.45);
  const items: { x: number; y: number; a: number; label: string; node: React.ReactNode }[] = [
    { x: 190, y: 760, a: CL(9, 1), label: 'udara', node: <Wind /> },
    { x: 190, y: 1020, a: CL(9, 2), label: 'air', node: <Water t={t} /> },
    { x: 190, y: 1280, a: CL(9, 3), label: 'gigitan nyamuk', node: <L.Mosquito cx={10} cy={0} s={0.9} wing={t * 30} prob={0.8} /> },
    {
      x: 890, y: 760, a: CL(9, 4), label: 'pelukan',
      node: (
        <>
          <Actor cx={-24} cy={-4} s={0.24} role="teal" pose={{ armR: [62, -48, 0], head: 6 }} />
          <Actor cx={24} cy={-4} s={0.24} role="yellow" pose={{ armL: [62, -48, 0], head: -6 }} />
        </>
      ),
    },
    {
      x: 890, y: 1020, a: CL(9, 5), label: 'jabat tangan',
      node: (
        <>
          <Actor cx={-48} cy={-4} s={0.24} role="teal" pose={{ armR: [86, -8, 0] }} />
          <Actor cx={48} cy={-4} s={0.24} role="yellow" pose={{ armL: [86, -8, 0] }} />
        </>
      ),
    },
    { x: 890, y: 1280, a: CL(9, 6), label: 'berbagi makanan', node: <L.DiningTable cx={0} cy={-20} w={300} s={0.7} /> },
  ];
  const end = pop(t, CL(9, 6) + 1.3, 0.4);
  return (
    <>
      <FlatVirus cx={540} cy={1020} r={70 * vi} dim={vi} rot={t * 9} />
      {items.map((it, i) => {
        const k = pop(t, it.a - 0.05, 0.35);
        const ln = pr(t, it.a + 0.1, it.a + 0.45);
        const sx = it.x < 540 ? 460 : 620, ex = it.x < 540 ? it.x + 125 : it.x - 125;
        const bx = lerp(sx, ex, 0.55), by = lerp(1020, it.y - 10, 0.55);
        return (
          <React.Fragment key={i}>
            <line x1={sx} y1={1020} x2={lerp(sx, ex, ln)} y2={lerp(1020, it.y - 10, ln)} stroke="#EAF2FB" strokeWidth={7} strokeLinecap="round" strokeDasharray="2 18" opacity={0.8 * ln} />
            <g transform={`translate(${it.x} ${it.y}) scale(${k * 1.15})`} opacity={k}>{it.node}</g>
            <L.CrossBadge cx={bx} cy={by} s={(0.38 + 0.05 * end) * pr(t, it.a + 0.25, it.a + 0.6, back)} op={pr(t, it.a + 0.25, it.a + 0.5)} />
            <SvgPill x={it.x} y={it.y + 120} text={it.label} k="neutral" size={30} op={k} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---- Adegan 10 (kalimat 10): jalur jelas -> pencegahan tepat sasaran: kondom, jarum steril, PrEP, ARV menekan virus
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const c = (k: number) => CL(10, k);
  const path = pr(t, c(0) + 0.1, c(0) + 1.0, sine);
  const pers = pop(t, c(0), 0.4);
  const c0o = 1 - pr(t, c(1) - 0.1, c(1) + 0.3);
  const tg = pop(t, c(1) - 0.05, 0.4);
  const arrow = pr(t, c(1) + 0.3, c(1) + 0.9, in3);
  const k2 = pop(t, c(2) - 0.05, 0.4);
  const k3 = pop(t, c(3) - 0.05, 0.4);
  const k4 = pop(t, c(4) - 0.1, 0.35);
  const k5 = pop(t, c(5) - 0.05, 0.4);
  const tab = pr(t, c(5) + 0.2, c(5) + 1.0, sine);
  const shrink = pr(t, c(5) + 1.0, c(5) + 2.4, sine);
  return (
    <>
      <g opacity={c0o}>
        <Drop x={190} y={950} s={1.1 * pers} color={FL.darah} op={pers} t={t} />
        <Fr x={870} gy={1180} s={0.7} role="blue" op={pers} />
        <line x1={310} y1={960} x2={lerp(310, 700, path)} y2={960} stroke="#EAF2FB" strokeWidth={10} strokeLinecap="round" strokeDasharray="2 22" opacity={0.9} />
        <polygon points={`${lerp(310, 700, path) + 24},960 ${lerp(310, 700, path) - 6},938 ${lerp(310, 700, path) - 6},982`} fill="#EAF2FB" opacity={path > 0.05 ? 1 : 0} />
      </g>
      <g opacity={tg} transform="translate(540 620) scale(1.5)">
        {[[118, '#EAF2FB'], [84, '#FF9C85'], [50, '#EAF2FB'], [18, '#FF6B4D']].map(([r, c], i) => (
          <circle key={i} r={(r as number)} fill={c as string} />
        ))}
        <g transform={`translate(${lerp(260, 0, arrow)} ${lerp(-220, 0, arrow)}) rotate(-42)`} opacity={arrow > 0.02 ? 1 : 0}>
          <rect x={-90} y={-5} width={100} height={10} rx={5} fill="#F4D77E" />
          <polygon points="10,-14 36,0 10,14" fill="#EAF2FB" />
          <polygon points="-90,-5 -110,-18 -100,0 -110,18 -90,5" fill="#72E3D3" />
        </g>
      </g>
      <L.Shield cx={270} cy={1010} s={1.25 * k2} op={k2} color="#72E3D3" />
      <SvgPill x={270} y={1200} text="kondom" k="neutral" size={34} op={k2} />
      <L.Syringe cx={810} cy={1010} s={1.15 * k3} op={k3} fill={0.7} />
      <L.CheckBadge cx={930} cy={930} s={0.45 * k3} op={k3} />
      <SvgPill x={810} y={1200} text="jarum steril" k="neutral" size={34} op={k3} />
      <L.TabletPrEP cx={270} cy={1320} s={1.6 * k4} op={k4} />
      <L.Tablet cx={lerp(590, 790, tab)} cy={1320} s={1.4 * k5} op={k5} />
      <FlatVirus cx={965} cy={1320} r={lerp(52, 15, shrink) * k5} dim={lerp(1, 0.6, shrink)} rot={t * 12} />
      <SvgPill x={780} y={1410} text="tidak terdeteksi" k="arv" size={30} op={pr(t, c(5) + 2.0, c(5) + 2.4)} />
    </>
  );
};

// ---- Adegan 11 (kalimat 11): kenali jalurnya, lalu putus: ikatan antara tetes (virus) dan kamu terputus; kamu mengangkat lengan
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const s = T(11), c1 = CL(11, 1);
  const a = pop(t, s - 0.1, 0.45);
  const mg = pop(t, s + 0.2, 0.4);
  const mgO = 1 - pr(t, c1 + 0.2, c1 + 0.6);
  const brk = pr(t, c1 + 0.25, c1 + 1.0, sine);
  const up = pr(t, c1 + 0.8, c1 + 1.5, sine);
  const heart = pop(t, c1 + 1.0, 0.45);
  const beat = 1 + 0.1 * Math.max(0, Math.sin((t - c1) * 5.5)) ** 3;
  return (
    <>
      <Drop x={lerp(220, 150, brk)} y={1020} s={1.4 * a} op={a} color={FL.darah} t={t} />
      <Fr x={800} gy={1260} s={0.85} role="blue" op={a} pose={{ armL: bl([7, 0, 0], [150, 0, 0], up), armR: bl([7, 0, 0], [35, 0, 0], up), head: 8 * up }} />
      <L.Tie cx={500} cy={1030} len={380} broken={brk} op={a} />
      <L.Magnifier cx={480} cy={930} s={1.15 * mg} op={mg * mgO} />
      <L.Heart cx={790} cy={500} s={0.8 * heart * beat} op={heart} color="#7ED6A8" />
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
export const S2E4AltFull: React.FC = () => {
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
          <LegendBox t={t} a={T(1) + 0.8} b={T(2) + 1.4} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={CL(8, 1) + 0.2} b={T(9) - 0.2} items={[[WAFFLE_C, 'kontak seksual'], ['#B9C3D0', 'lainnya']]} />
          <LegendBox t={t} a={CL(10, 5) + 0.1} b={T(11) - 0.3} items={[['#FFA27B', 'Obat ARV'], ['#FF9C85', 'Virus HIV']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile("vo/S2E4.mp3")} />
    </AbsoluteFill>
  );
};
