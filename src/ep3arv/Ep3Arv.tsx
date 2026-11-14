import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back } from '../motion';
import * as L from '../shared/library';
import { FlatVirus } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T } from './timeline';
import { SCENES, Obj } from './spec';

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

1. NIH HIVinfo. FDA-Approved HIV Medicines (fact sheet).
https://hivinfo.nih.gov/understanding-hiv/fact-sheets/fda-approved-hiv-medicines

2. Kementerian Kesehatan RI. Mengenal Dolutegravir, Obat Antiretroviral yang Menjadi Pilihan Utama Pengobatan Pasien HIV Saat Ini.
https://keslan.kemkes.go.id/view_artikel/87/mengenal-dolutegravir-obat-antiretroviral-yang-menjadi-pilihan-utama-pengobatan-pasien-hiv-saat-ini

3. Kementerian Kesehatan RI (2019). Keputusan Menteri Kesehatan RI Nomor HK.01.07/MENKES/90/2019 tentang Pedoman Nasional Pelayanan Kedokteran Tata Laksana HIV.`;

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

// ---------------- latar gradien (bergeser halus tiap scene) ----------------
type Grad = [string, string, string];
const CLOSE_GRAD: Grad = ['#0A2540', '#0F3B66', '#0B4F63'];
const GRADS: { t: number; c: Grad }[] = [
  ...SCENES.map((s, i) => ({ t: SCENE_T[i], c: s.bg as Grad })),
  { t: CLOSE, c: CLOSE_GRAD },
];
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
type P = { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number };
// hemat: hanya istilah kunci yang disebut di narasi
const PILLS: P[] = [
  { a: 7.0, b: 11.0, text: 'siklus hidup HIV', k: 'virus', x: 540, y: 560, size: 44 },
  { a: 16.4, b: 19.3, text: 'Sel CD4', k: 'cell', x: 540, y: 1290, size: 50 },
  { a: 19.9, b: 22.4, text: 'cegah menempel', k: 'arv', x: 380, y: 1010, size: 38 },
  { a: 22.4, b: 24.8, text: 'cegah menyatu', k: 'arv', x: 720, y: 1010, size: 38 },
  { a: 27.0, b: 31.6, text: 'RNA virus', k: 'virus', x: 540, y: 815, size: 42 },
  { a: 28.0, b: 31.6, text: 'reverse transcriptase', k: 'arv', x: 540, y: 1150, size: 40 },
  { a: 30.0, b: 35.4, text: 'DNA virus', k: 'cell', x: 540, y: 1405, size: 40 },
  { a: 32.0, b: 35.4, text: 'NRTI', k: 'arv', x: 250, y: 1000, size: 46 },
  { a: 36.0, b: 40.0, text: 'NNRTI', k: 'arv', x: 830, y: 1000, size: 46 },
  { a: 41.9, b: 46.8, text: 'integrase', k: 'arv', x: 230, y: 1100, size: 42 },
  { a: 42.4, b: 46.8, text: 'DNA virus masuk ke DNA sel', k: 'neutral', x: 540, y: 1290, size: 34 },
  { a: 47.2, b: 50.2, text: 'dolutegravir', k: 'arv', x: 840, y: 1100, size: 40 },
  { a: 50.6, b: 52.6, text: 'pematangan', k: 'virus', x: 540, y: 1170, size: 46 },
  { a: 52.9, b: 57.0, text: 'protease', k: 'arv', x: 540, y: 1170, size: 48 },
  { a: 57.4, b: 61.9, text: 'belum matang', k: 'gray', x: 540, y: 1170, size: 44 },
  { a: 62.4, b: 64.2, text: '1 obat belum cukup', k: 'neutral', x: 540, y: 590, size: 40 },
  { a: 64.6, b: 71.2, text: 'kombinasi obat', k: 'arv', x: 540, y: 590, size: 44 },
  { a: 71.7, b: 75.3, text: 'TLD', k: 'arv', x: 540, y: 590, size: 52 },
  { a: 75.6, b: 80.6, text: 'lini pertama dewasa', k: 'neutral', x: 540, y: 590, size: 42 },
  { a: 81.0, b: 85.0, text: 'tenofovir + lamivudin', k: 'arv', x: 780, y: 700, size: 34 },
  { a: 85.3, b: 87.3, text: 'dolutegravir', k: 'arv', x: 780, y: 990, size: 38 },
  { a: 87.6, b: 90.1, text: '3 obat, 2 tahapan', k: 'neutral', x: 540, y: 590, size: 44 },
  { a: 90.4, b: 94.0, text: 'sekali sehari', k: 'recep', x: 540, y: 1195, size: 40 },
  { a: 94.4, b: 99.0, text: 'di bawah batas deteksi', k: 'neutral', x: 540, y: 570, size: 42 },
  { a: 99.4, b: 101.3, text: 'ARV tetap diminum', k: 'arv', x: 540, y: 570, size: 42 },
];
const Pills: React.FC<{ t: number }> = ({ t }) => (
  <>
    {PILLS.map((p, i) => {
      const o = win(t, p.a, p.b, 0.35);
      return o > 0.01 ? <PillBox key={i} x={p.x} y={p.y} text={p.text} k={p.k} size={p.size} op={o} /> : null;
    })}
  </>
);

// legenda kecil statis (muncul saat CD4 pertama disebut, hilang menjelang penutup)
const Legend: React.FC<{ t: number }> = ({ t }) => {
  const k = Math.min(ez(t, 16.1, 16.8), 1 - ez(t, CLOSE - 0.8, CLOSE - 0.2));
  if (k < 0.01) return null;
  const item = (c: string, label: string) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
      {label}
    </span>
  );
  return (
    <div style={{ position: 'absolute', top: 250, width: '100%', display: 'flex', justifyContent: 'center', opacity: 0.9 * k }}>
      <div style={{ display: 'flex', gap: 34, background: 'rgba(8,24,46,0.38)', borderRadius: 999, padding: '12px 30px', fontFamily: FONT, fontWeight: 600, fontSize: 28, color: '#EAF2FB' }}>
        {item('#8FBDF7', 'CD4')}
        {item('#FF9C85', 'Virus HIV')}
      </div>
    </div>
  );
};

// ---------------- subtitle (narasi_final persis) ----------------
const ACC: Record<string, string> = {
  cd4: '#8FBDF7', hiv: '#FFB7A5', virus: '#FFB7A5', rna: '#FFB7A5', arv: '#72E3D3', obat: '#72E3D3',
  reverse: '#72E3D3', transcriptase: '#72E3D3', integrase: '#72E3D3', protease: '#72E3D3', dolutegravir: '#72E3D3',
  nrti: '#72E3D3', nnrti: '#72E3D3', tld: '#72E3D3',
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

// ---------------- render scene dari scene-spec ----------------
const REG: Record<string, React.FC<any>> = L as any;

const NUDGE: Record<string, number> = { FlatVirus: 1340, Clock: 1360, Calendar: 1340 };

const ObjView: React.FC<{ o: Obj; idx: number; sceneN: number; t: number; t0: number; t1: number }> = ({ o, idx, sceneN, t, t0, t1 }) => {
  const st = t0 + 0.35 + idx * 0.32;
  const k = ez(t, st, st + 0.7, back);
  if (k < 0.005) return null;
  const fade = Math.min(1, k * 1.6);
  const baseOp = o.op ?? 1;
  const rise = (1 - k) * 36;
  const bob = Math.sin(t * 1.6 + idx * 1.7) * 6;
  // penyesuaian kecil: objek yang jatuh ke zona subtitle (y>1462) digeser naik agar subtitle tidak menutupi animasi
  const baseY = NUDGE[o.c] !== undefined && o.cy > 1380 ? NUDGE[o.c] : o.cy;
  const cy = baseY + rise + bob;
  const s = o.s ?? 1;
  const props: Record<string, any> = { ...(o.props || {}) };
  let cx = o.cx;

  if (o.c === 'FlatVirus') {
    return <FlatVirus cx={cx} cy={cy} r={(props.r ?? 80) * s * (0.6 + 0.4 * k)} dim={baseOp * fade} rot={t * 6 + idx * 40} />;
  }
  const Comp = REG[o.c];
  if (!Comp) return null;
  let sc = s * (0.8 + 0.2 * k);
  if (o.c === 'Train') cx = lerp(o.cx - 380, o.cx, ez(t, st, st + 2.0, out3));
  if (o.c === 'Enzyme') sc *= 1 + 0.03 * Math.sin(t * 3.2);
  if (o.c === 'LineChart') props.progress = ez(t, t0 + 1.0, t0 + Math.min(5.5, t1 - t0 - 1.0), sine);
  if (o.c === 'Calendar') {
    const marks: number[] = props.marks || [];
    const n = Math.floor(ez(t, t0 + 2.2, t0 + 5.2) * (marks.length + 0.999));
    props.marks = marks.slice(0, n);
  }
  return <Comp cx={cx} cy={cy} s={sc} rot={o.rot ?? 0} op={baseOp * fade} {...props} />;
};

const SceneView: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  const t0 = SCENE_T[i], t1 = SCENE_T[i + 1];
  const o = win(t, t0 - 0.0, t1 + 0.25, 0.45);
  if (o < 0.005) return null;
  return (
    <g opacity={o}>
      {SCENES[i].objects.map((ob, j) => (
        <ObjView key={j} o={ob} idx={j} sceneN={SCENES[i].n} t={t} t0={t0} t1={t1} />
      ))}
    </g>
  );
};

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
                <div style={{ fontWeight: 800, fontSize: 25, color: '#72E3D3', width: 34, flexShrink: 0 }}>{r.n}.</div>
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
export const Ep3ArvFull: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = gradAt(t);
  const cue = CUES.find((c) => t >= c.a - 0.05 && t < c.b);
  const ck = cue ? Math.min(1, (t - cue.a + 0.05) / 0.18) : 0;
  const subOn = t < CLOSE - 0.05;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg,${g[0]} 0%,${g[1]} 55%,${g[2]} 100%)` }}>
      <AbsoluteFill style={{ background: 'radial-gradient(760px 760px at 50% 40%, rgba(120,190,255,0.22), transparent 70%)' }} />
      {t < CLOSE + 0.3 && (
        <AbsoluteFill style={{ transform: `scale(${settle(t)})`, transformOrigin: '50% 45%', opacity: 1 - ez(t, CLOSE - 0.1, CLOSE + 0.4) }}>
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
            {SCENES.map((_, i) => (
              <SceneView key={i} i={i} t={t} />
            ))}
          </svg>
          <Pills t={t} />
          <Legend t={t} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile('vo.mp3')} />
    </AbsoluteFill>
  );
};
