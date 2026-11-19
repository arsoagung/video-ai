import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL, Star } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T, T, TE, CL, EP_DUR } from './timeline';

export const S2E9_FRAMES = Math.ceil(EP_DUR * FPS);

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
// ================= komponen episode ini =================
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
const FAM = '#B9A2F5'; // anggota keluarga / kamu
const KIDC = '#8FBDF7';
// orang dengan HIV = Person hijau dengan lensa berisi virus kecil di dada
const OD: React.FC<{ x: number; y: number; s?: number; op?: number; kid?: boolean; rot?: number }> = ({ x, y, s = 1, op = 1, kid = false, rot = 0 }) =>
  s < 0.02 || op < 0.01 ? null : (
    <>
      <L.Person cx={x} cy={y} s={s} rot={rot} op={op} color={PAS} kid={kid} />
      <g opacity={op}>
        <circle cx={x} cy={y + 34 * s * (kid ? 0.7 : 1)} r={30 * s * (kid ? 0.7 : 1)} fill="#fff" opacity={0.28} />
        <FlatVirus cx={x} cy={y + 34 * s * (kid ? 0.7 : 1)} r={13 * s * (kid ? 0.7 : 1)} />
      </g>
    </>
  );
const Ring: React.FC<{ x: number; y: number; t: number; a: number; r0?: number; r1?: number; c?: string }> = ({ x, y, t, a, r0 = 20, r1 = 120, c = '#fff' }) => {
  const k = pr(t, a, a + 0.9);
  return k > 0.01 && k < 0.99 ? <circle cx={x} cy={y} r={r0 + (r1 - r0) * k} fill="none" stroke={c} strokeWidth={6} opacity={0.6 * (1 - k)} /> : null;
};
const Spoon: React.FC<{ x: number; y: number; rot?: number; op?: number }> = ({ x, y, rot = 0, op = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={op}>
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

const IC = { drop: [300, 560], lock: [540, 560], virus: [780, 560] };
const VCL: [number, number][] = [[-52, -40], [42, -52], [-8, 8], [-58, 52], [52, 42]];
const VirusCluster: React.FC<{ x: number; y: number; s?: number; t: number; a?: number; op?: number }> = ({ x, y, s = 1, t, a = -99, op = 1 }) => (
  <>
    {VCL.map(([dx, dy], i) => {
      const k = a < -50 ? 1 : pop(t, a + i * 0.18, 0.4);
      return <Virus key={i} x={x + dx * s} y={y + dy * s} r={30 * s * k} dim={op} t={t} seed={i} />;
    })}
  </>
);

// ---- adegan 1 (kalimat 1-2): rumah berisi keluarga, satu di antaranya ODHIV; lalu tanda tanya ----
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const h = pop(t, 0.1, 0.6);
  const p1 = pop(t, 0.5, 0.5), p2 = pop(t, 0.9, 0.5), p3 = pop(t, 1.3, 0.5);
  const q = pop(t, T(2) + 0.15, 0.5);
  const wob = Math.sin(Math.max(0, t - T(2)) * 7) * 6 * pr(t, T(2), T(2) + 0.3) * (1 - pr(t, T(2) + 1.0, T(2) + 1.4));
  return (
    <>
      <L.Home cx={540} cy={720} s={2.4 * h} op={h} />
      <OD x={330} y={1120} s={1.4 * p1} op={p1} />
      <L.Person cx={540} cy={1120} s={1.4 * p2} op={p2} color={KAMU} rot={wob} />
      <L.Person cx={730} cy={1120} s={1.4 * p3} op={p3} color={KIDC} kid />
      {q > 0.02 && <L.SpeechBubble cx={560} cy={860} s={0.9 * q} op={q} text="?" w={150} tail="l" />}
    </>
  );
};

// ---- adegan 2 (kalimat 3): "Tidak": tanda tanya hilang, centang muncul; "sudah diteliti": dokumen + kaca pembesar ----
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const a = T(3), c1 = CL(3, 1);
  const q = 1 - pr(t, a, a + 0.4, in3);
  const ck = pop(t, a + 0.2, 0.5);
  const mv = pr(t, c1, c1 + 0.8, sine);
  const doc = pop(t, c1 + 0.1, 0.5);
  const mg = pr(t, c1 + 0.4, c1 + 1.5, sine);
  const st = pop(t, c1 + 1.5, 0.4);
  return (
    <>
      <L.Home cx={540} cy={720} s={2.4} op={0.3} />
      <OD x={330} y={1120} s={1.4} />
      <L.Person cx={540} cy={1120} s={1.4} color={KAMU} />
      <L.Person cx={730} cy={1120} s={1.4} color={KIDC} kid />
      {q > 0.02 && <L.SpeechBubble cx={560} cy={860} s={0.9 * q} op={q} text="?" w={150} tail="l" />}
      <L.CheckBadge cx={lerp(540, 840, mv)} cy={lerp(830, 780, mv)} s={lerp(1.0, 0.75, mv) * ck} op={ck} />
      <L.Document cx={380} cy={720} s={1.5 * doc} op={doc} kind="paper" stamp={st > 0.5} />
      <g opacity={mg}>
        <L.Magnifier cx={lerp(760, 400, mg)} cy={lerp(560, 700, mg)} s={1.2} />
      </g>
    </>
  );
};

// ---- adegan 3 (kalimat 4): tiga syarat sekaligus: cairan, jalan masuk, jumlah virus ----
const CARD_X = [240, 540, 840];
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
            <rect x={x - 125} y={635} width={250} height={330} rx={40} fill={full > 0.5 ? '#72E3D3' : '#FFFFFF'} opacity={lerp(0.13, 0.26, full)} />
          </g>
        );
      })}
      {(() => {
        const k = pop(t, c1 + 0.1, 0.5);
        return <L.BloodDrop cx={240} cy={810} s={1.05 * k} op={k} />;
      })()}
      {(() => {
        const k = pop(t, c2 + 0.05, 0.5);
        return <L.Lock cx={540} cy={800} s={1.15 * k} op={k} open />;
      })()}
      <VirusCluster x={840} y={800} t={t} a={c3 + 0.05} />
      {[390, 690].map((x) => (
        <g key={x} transform={`translate(${x} 800) scale(${plus})`} opacity={plus}>
          <rect x={-26} y={-6} width={52} height={12} rx={6} fill="#fff" />
          <rect x={-6} y={-26} width={12} height={52} rx={6} fill="#fff" />
        </g>
      ))}
    </>
  );
};

// ---- adegan 4 (kalimat 5): kehidupan serumah tidak menyediakan ketiganya ----
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const a = T(5);
  const h = pop(t, a + 0.2, 0.6);
  const xs = [a + 0.9, a + 1.25, a + 1.6];
  const kk = xs.map((x) => pop(t, x, 0.4));
  const dim = (i: number) => 1 - 0.6 * kk[i];
  return (
    <>
      <L.BloodDrop cx={IC.drop[0]} cy={IC.drop[1]} s={0.55} op={dim(0)} />
      <L.Lock cx={IC.lock[0]} cy={IC.lock[1]} s={0.6} open op={dim(1)} />
      <VirusCluster x={IC.virus[0]} y={IC.virus[1]} s={0.5} t={t} op={dim(2)} />
      {kk.map((k, i) => (
        <L.CrossBadge key={i} cx={[IC.drop, IC.lock, IC.virus][i][0]} cy={[IC.drop, IC.lock, IC.virus][i][1]} s={0.85 * k} op={k} />
      ))}
      <L.Home cx={540} cy={1040} s={2.0 * h} op={h} />
    </>
  );
};

// ---- adegan 5 (kalimat 6): sentuhan, pelukan, berbagi piring/sendok hanya mengenai kulit utuh (bukan jalan masuk) ----
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const a = T(6), c1 = CL(6, 1), c2 = CL(6, 2), c3 = CL(6, 3);
  const kx = lerp(760, 535, pr(t, a + 0.05, a + 0.55, sine));
  const persOp = (t < c1 + 0.4 ? 1 - pr(t, c1 + 0.05, c1 + 0.4) : pr(t, c2 + 0.3, c2 + 0.8)) * (1 - 0.7 * pr(t, c3 - 0.1, c3 + 0.4));
  const emb = pr(t, c1 + 0.1, c1 + 0.45) * (1 - pr(t, c2 + 0.05, c2 + 0.45));
  const tab = pop(t, c2 + 0.25, 0.6) * (1 - 0.7 * pr(t, c3 - 0.1, c3 + 0.4));
  // sendok bolak-balik antar piring
  const sp = pr(t, c2 + 0.9, c2 + 2.1, sine);
  const sp2 = pr(t, c2 + 2.1, c2 + 3.0, sine);
  const spx = t < c2 + 2.1 ? lerp(373, 707, sp) : lerp(707, 560, sp2);
  const spy = 1090 - Math.sin((t < c2 + 2.1 ? sp : sp2) * Math.PI) * 90;
  const spOp = pr(t, c2 + 0.7, c2 + 1.0) * (1 - pr(t, c3 - 0.1, c3 + 0.3));
  const bar = pop(t, c3 + 0.1, 0.5);
  const vy = t < c3 + 1.0 ? lerp(520, 895, pr(t, c3 + 0.4, c3 + 1.0, in3)) : lerp(895, 735, pr(t, c3 + 1.0, c3 + 1.8, out3));
  const vOp = pop(t, c3 + 0.3, 0.3);
  const lk = pop(t, c3 + 1.0, 0.4);
  return (
    <>
      <g opacity={persOp}>
        <OD x={330} y={1000} s={1.5} />
        <L.Person cx={kx} cy={1000} s={1.5} color={KAMU} />
      </g>
      <Ring x={430} y={985} t={t} a={a + 0.5} />
      {emb > 0.01 && <L.Embrace cx={540} cy={1010} s={2.1} op={emb} />}
      <g opacity={tab}>
        <L.DiningTable cx={540} cy={1130} w={600} />
      </g>
      <Spoon x={spx} y={spy} rot={20} op={spOp} />
      <g opacity={bar} transform={`translate(0 ${(1 - bar) * 30})`}>
        <rect x={190} y={965} width={700} height={110} rx={55} fill={SKIN} />
      </g>
      <L.Lock cx={540} cy={1020} s={0.7 * lk} op={lk} color="#9AA9BC" />
      {vOp > 0.02 && <Virus x={540} y={vy} r={52 * vOp} t={t} />}
    </>
  );
};

// ---- adegan 6 (kalimat 7): lima cairan tidak dipertukarkan di dalam rumah ----
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const a = T(7);
  const dts = [CL(7, 0) + 1.7, CL(7, 1), CL(7, 2), CL(7, 3), CL(7, 4) + 0.45];
  const h = pop(t, a + 0.05, 0.6);
  return (
    <>
      <L.Home cx={540} cy={1190} s={1.2 * h} op={h} />
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
  const sw: [number, number, number, number, number][] = [
    [235, 880, 150, 790, a + 0.15], [275, 860, 255, 740, a + 0.4], [335, 870, 370, 770, a + 0.65],
  ];
  const sl: [number, number, number][] = [[560, 925, a + 1.3], [600, 985, a + 1.7]];
  const ck = pop(t, a + 2.1, 0.5);
  return (
    <>
      <OD x={300} y={1010} s={1.6} />
      <L.Person cx={800} cy={1010} s={1.6} color={KAMU} />
      {sw.map(([x0, y0, x1, y1, s0], i) => {
        const k = pr(t, s0, s0 + 1.1, out3);
        const op = pop(t, s0, 0.3) * (1 - 0.25 * k);
        return <Drop key={i} x={lerp(x0, x1, k)} y={lerp(y0, y1, k)} s={0.34 * op} color={FL.bening} op={op} virus={false} />;
      })}
      {sl.map(([x1, y1, s0], i) => {
        const k = pr(t, s0, s0 + 1.1, sine);
        const op = pop(t, s0, 0.3);
        return <Drop key={'l' + i} x={lerp(350, x1, k)} y={lerp(975, y1, k) - Math.sin(k * Math.PI) * 40} s={0.34 * op} color={FL.bening} op={op} virus={false} rot={-20} />;
      })}
      <L.CheckBadge cx={540} cy={690} s={1.05 * ck} op={ck} />
    </>
  );
};

// ---- adegan 8 (kalimat 9): hanya darah yang dijaga; pisau cukur dan sikat gigi tidak dipakai bersama ----
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const a = T(9), c1 = CL(9, 1);
  const dr = pop(t, a + 0.2, 0.55);
  const rz = pop(t, c1 + 0.5, 0.45), tb = pop(t, c1 + 1.5, 0.45);
  const S = c1 + 2.8;
  const sh = 1 - pr(t, S, S + 0.4);
  const mv = pr(t, S + 0.1, S + 1.1, sine);
  const own = pr(t, S + 0.1, S + 0.5);
  const cr = pop(t, S + 0.15, 0.4);
  return (
    <>
      <Drop x={540} y={740} s={1.4 * dr} color={FL.darah} op={dr} t={t} />
      <g opacity={sh}>
        <L.Razor cx={440} cy={1090} s={1.0 * rz} op={rz} color="#B9C3D0" />
        <L.Toothbrush cx={640} cy={1090} s={1.0 * tb} op={tb} color="#B9C3D0" />
      </g>
      <L.CrossBadge cx={540} cy={1100} s={0.9 * cr} op={cr} />
      <L.Razor cx={lerp(440, 150, mv)} cy={1090} s={1.0} op={own} color={PAS} />
      <L.Toothbrush cx={lerp(640, 300, mv)} cy={1090} s={1.0} op={own} color={PAS} />
      <L.Toothbrush cx={lerp(640, 790, mv)} cy={1090} s={1.0} op={own} color={KAMU} />
      <L.Razor cx={lerp(440, 930, mv)} cy={1090} s={1.0} op={own} color={KAMU} />
    </>
  );
};

// ---- adegan 9 (kalimat 10): peneliti menguji: kaca pembesar memeriksa rumah, dokumen penelitian ----
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const a = T(10);
  const h = pop(t, a + 0.1, 0.5);
  const doc = pop(t, a + 0.4, 0.5);
  const mg = pr(t, a + 0.3, a + 1.4, sine);
  const st = pop(t, a + 1.3, 0.4);
  return (
    <>
      <L.Home cx={720} cy={960} s={1.5 * h} op={h} />
      <OD x={640} y={1190} s={0.9 * h} op={h} />
      <L.Person cx={780} cy={1190} s={0.9 * h} op={h} color={KAMU} />
      <L.Document cx={270} cy={900} s={1.6 * doc} op={doc} kind="paper" stamp={st > 0.5} />
      <g opacity={mg}>
        <L.Magnifier cx={lerp(960, 700, mg)} cy={lerp(600, 940, mg)} s={1.3} />
      </g>
    </>
  );
};

// ---- adegan 10 (kalimat 11): 89 anggota keluarga serumah dengan 25 anak dengan HIV, kebanyakan balita ----
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const a = T(11), c1 = CL(11, 1);
  const kidClause = a + 3.0;
  const young = pr(t, c1 + 0.1, c1 + 1.0, sine);
  return (
    <>
      {Array.from({ length: 89 }, (_, i) => {
        const k = pop(t, a + 0.1 + i * 0.024, 0.3);
        const col = i % 10, row = Math.floor(i / 10);
        return <L.Person key={i} cx={540 + (col - 4.5) * 52} cy={560 + row * 46} s={0.24 * k} op={k} color={FAM} />;
      })}
      {Array.from({ length: 25 }, (_, i) => {
        const k = pop(t, kidClause + i * 0.04, 0.3);
        const col = i % 5, row = Math.floor(i / 5);
        const x = 540 + (col - 2) * 62, y = 1085 + row * 56;
        const sc = 0.34 * lerp(1, 0.75, young) * k;
        return (
          <g key={i}>
            <L.Person cx={x} cy={y} s={sc} op={k} color={PAS} kid />
            <FlatVirus cx={x} cy={y + 8 * k} r={4.5 * k} />
          </g>
        );
      })}
    </>
  );
};

// ---- adegan 11 (kalimat 12): berbagi peralatan makan dan handuk, saling memeluk, tidur sekasur ----
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const a = T(12), c1 = CL(12, 1), c2 = CL(12, 2);
  const tbl = pop(t, a + 0.1, 0.5);
  const pers = pr(t, a + 0.05, a + 0.4) * (1 - pr(t, c1 - 0.05, c1 + 0.3));
  const sp = pr(t, a + 0.5, a + 1.5, sine);
  const spx = lerp(373, 707, sp), spy = 1090 - Math.sin(sp * Math.PI) * 80;
  const spOp = pr(t, a + 0.4, a + 0.7) * (1 - pr(t, c1 - 0.2, c1 + 0.1));
  const tw = pr(t, a + 1.65, a + 2.5, sine);
  const twOp = pr(t, a + 1.55, a + 1.8) * (1 - pr(t, c1 - 0.2, c1 + 0.1));
  const emb = pr(t, c1, c1 + 0.35) * (1 - pr(t, c2 + 0.05, c2 + 0.45));
  const bed = pr(t, c2 + 0.3, c2 + 0.9);
  const moon = pop(t, c2 + 0.8, 0.5);
  return (
    <>
      <g opacity={pers * tbl}>
        <OD x={310} y={1010} s={1.5} kid />
        <L.Person cx={770} cy={1010} s={1.4} color={KAMU} />
        <L.DiningTable cx={540} cy={1150} w={620} />
      </g>
      <Spoon x={spx} y={spy} rot={20} op={spOp} />
      <Towel x={lerp(330, 750, tw)} y={lerp(840, 840, tw) - Math.sin(tw * Math.PI) * 70} op={twOp} s={0.9} />
      {emb > 0.01 && <L.Embrace cx={540} cy={1020} s={2.1} op={emb} colorA={KAMU} colorB={PAS} />}
      {bed > 0.01 && (
        <g opacity={bed} transform={`translate(540 1040)`}>
          <rect x={-340} y={-170} width={44} height={300} rx={20} fill="#8A6A58" />
          <rect x={-340} y={60} width={680} height={72} rx={26} fill="#8A6A58" />
          <rect x={-320} y={-10} width={650} height={76} rx={30} fill="#EAF2FB" />
          <rect x={-290} y={-34} width={210} height={44} rx={22} fill="#FFFFFF" />
          <circle cx={-235} cy={-40} r={46} fill={KAMU} />
          <circle cx={-135} cy={-40} r={46} fill={PAS} />
          <rect x={-190} y={-10} width={500} height={86} rx={36} fill="#7FB5E8" />
          <rect x={-190} y={-10} width={500} height={22} rx={11} fill="#fff" opacity={0.25} />
        </g>
      )}
      <Moon x={830} y={680} s={1.6 * moon} op={moon} />
    </>
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
      <g opacity={dim}>
        {Array.from({ length: 89 }, (_, i) => {
          const k = pop(t, gridT + i * 0.02, 0.3);
          const col = i % 10, row = Math.floor(i / 10);
          return <L.Person key={i} cx={540 + (col - 4.5) * 52} cy={910 + row * 46} s={0.24 * k} op={k} color={FAM} />;
        })}
      </g>
      <L.CheckBadge cx={540} cy={1090} s={1.9 * ck} op={ck * 0.96} />
    </>
  );
};

// ---- adegan 13 (kalimat 14): peluk saja ----
const Scene13: React.FC<{ t: number }> = ({ t }) => {
  const a = T(14), c1 = CL(14, 1);
  const h = pop(t, a + 0.1, 0.55);
  const e = pop(t, a + 0.5, 0.6);
  const sq = 1 + 0.1 * Math.sin(pr(t, c1, c1 + 0.9) * Math.PI);
  const es = 2.2 * e * sq;
  return (
    <>
      <L.Home cx={540} cy={570} s={1.3 * h} op={h} />
      <L.Embrace cx={540} cy={1130} s={es} op={e} colorA={KAMU} colorB={PAS} />
      <g opacity={e}>
        <circle cx={540 + 37 * es} cy={1130 + 34 * es} r={22 * es * 0.9} fill="#fff" opacity={0.28} />
        <FlatVirus cx={540 + 37 * es} cy={1130 + 34 * es} r={10 * es * 0.9} />
      </g>
      {[0, 1, 2].map((i) => {
        const k = pr(t, c1 + 0.2 + i * 0.3, c1 + 1.6 + i * 0.3);
        return k > 0.01 && k < 0.99 ? <L.Heart key={i} cx={470 + i * 70} cy={lerp(900, 720, k)} s={0.3} op={Math.sin(k * Math.PI)} /> : null;
      })}
    </>
  );
};

const PILLS: { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number }[] = [
  { a: CL(4, 1) + 0.15, b: T(5) - 0.1, text: 'cairan', k: 'neutral', x: 240, y: 1040, size: 30 },
  { a: CL(4, 2) + 0.1, b: T(5) - 0.1, text: 'jalan masuk', k: 'neutral', x: 540, y: 1040, size: 30 },
  { a: CL(4, 3) + 0.1, b: T(5) - 0.1, text: 'jumlah virus', k: 'neutral', x: 840, y: 1040, size: 30 },
  { a: CL(6, 3) + 0.3, b: T(7) - 0.1, text: 'kulit utuh', k: 'neutral', x: 540, y: 1150, size: 32 },
  ...['darah', 'air mani', 'cairan vagina', 'cairan dubur', 'ASI'].map((text, i) => ({
    a: [CL(7, 0) + 1.8, CL(7, 1) + 0.1, CL(7, 2) + 0.1, CL(7, 3) + 0.1, CL(7, 4) + 0.55][i], b: T(8) - 0.1, text, k: 'neutral' as KK, x: 140 + i * 200, y: i % 2 ? 925 : 860, size: 26,
  })),
  { a: T(8) + 0.3, b: T(9) - 0.1, text: 'keringat', k: 'neutral', x: 190, y: 700, size: 30 },
  { a: T(8) + 1.4, b: T(9) - 0.1, text: 'air liur', k: 'neutral', x: 560, y: 880, size: 30 },
  { a: T(9) + 0.4, b: T(10) - 0.1, text: 'darah', k: 'neutral', x: 540, y: 905, size: 32 },
  { a: CL(9, 1) + 0.6, b: CL(9, 1) + 2.7, text: 'pisau cukur', k: 'neutral', x: 440, y: 1260, size: 26 },
  { a: CL(9, 1) + 1.6, b: CL(9, 1) + 2.7, text: 'sikat gigi', k: 'neutral', x: 640, y: 1260, size: 26 },
  { a: T(11) + 1.5, b: T(12) - 0.1, text: '89 anggota keluarga', k: 'neutral', x: 540, y: 1005, size: 30 },
  { a: T(11) + 3.4, b: CL(11, 1) + 0.1, text: '25 anak', k: 'neutral', x: 540, y: 1385, size: 30 },
  { a: CL(11, 1) + 0.2, b: T(12) - 0.1, text: 'balita', k: 'neutral', x: 540, y: 1385, size: 30 },
  { a: T(13) + 0.6, b: CL(13, 1) - 0.1, text: '1990', k: 'neutral', x: 540, y: 810, size: 34 },
  { a: CL(13, 1) + 0.5, b: T(14) - 0.1, text: '0 terinfeksi', k: 'arv', x: 540, y: 810, size: 34 },
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
export const S2E9Full: React.FC = () => {
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
          <LegendBox t={t} a={T(11) + 0.3} b={T(11) + 4.8} items={[['#B9A2F5', 'Anggota keluarga'], ['#7ED6A8', 'Anak dengan HIV']]} />
          <LegendBox t={t} a={T(13) + 1.4} b={T(13) + 4.6} items={[['#B9A2F5', 'Anggota keluarga']]} />
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
