import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, SHAPE_COL } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T, T, CL, EP_DUR } from './timeline';

export const S1E9_FRAMES = Math.ceil(EP_DUR * FPS);

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

1. World Health Organization (2023). The role of HIV viral suppression in improving individual health and reducing transmission: policy brief.
https://www.who.int/publications/i/item/9789240055179

2. Broyles LN et al. (2023). The risk of sexual transmission of HIV in individuals with low-level HIV viraemia: a systematic review. Lancet.
https://doi.org/10.1016/S0140-6736(23)00877-2

3. Panel on Antiretroviral Guidelines for Adults and Adolescents. Antiretroviral Therapy to Prevent Sexual Transmission of HIV (Treatment as Prevention). Clinicalinfo.HIV.gov.
https://clinicalinfo.hiv.gov/node/9492

4. CDC (2023). HIV Treatment Is HIV Prevention (consumer info sheet).
https://www.cdc.gov/hiv/resourcelibrary/infosheets/cdc-hiv-consumer-info-sheet-treatment-2023-508.pdf`;

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
const BG: Grad[] = [
  ['#0A1F3D', '#123A60', '#17506F'], // 1 hook: biru laut
  ['#0D1B45', '#1E2F6B', '#2B4A85'], // 2 analogi jalan: biru tua
  ['#14183F', '#2A2A6B', '#3B4A8A'], // 3 hitung salinan: indigo
  ['#08283A', '#0F4A5C', '#167A80'], // 4 ramai-sepi-kosong + grafik: teal
  ['#0A1F3D', '#123A60', '#17506F'], // 5 tidak terdeteksi: biru laut
  ['#0D1B45', '#1E2F6B', '#2B4A85'], // 6 mobil mungil: biru tua
  ['#08283A', '#0F4A5C', '#167A80'], // 7 ARV: teal
  ['#0A1F3D', '#123A60', '#17506F'], // 8 enam bulan: biru laut
  ['#08283A', '#0F4A5C', '#167A80'], // 9 minum teratur: teal
  ['#14183F', '#2A2A6B', '#3B4A8A'], // 10 tidak menular: indigo
  ['#0D1B45', '#1E2F6B', '#2B4A85'], // 11 U=U: biru tua
  ['#14183F', '#2A2A6B', '#3B4A8A'], // 12 bukan hilang: indigo
];

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
  nrti: '#72E3D3', nnrti: '#72E3D3', pep: '#72E3D3', tld: '#72E3D3',
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


// ================= ADEGAN (ditulis per episode, animasi bercerita) =================
const pr = (t: number, a: number, b: number, e: (x: number) => number = out3) => ez(t, a, b, e);
const Virus: React.FC<{ x: number; y: number; r: number; dim?: number; t: number; seed?: number }> = ({ x, y, r, dim = 1, t, seed = 0 }) =>
  r < 2 || dim < 0.01 ? null : <FlatVirus cx={x} cy={y} r={r} dim={dim} rot={t * 5 + seed * 40} />;

const SceneWrap: React.FC<{ i: number; t: number; children: React.ReactNode }> = ({ i, t, children }) => {
  const o = win(t, SCENE_T[i], SCENE_T[i + 1] + 0.25, 0.45);
  if (o < 0.005) return null;
  return <g opacity={o}>{children}</g>;
};

const CAR = '#FF9C85'; // mobil = virus (analogi)
// slot mobil di jalan: 2 lajur x 4 kolom, relatif terhadap pusat jalan
const SLOTS: [number, number][] = [[190, -62], [400, -62], [610, -62], [820, -62], [190, 62], [400, 62], [610, 62], [820, 62]];
// satu mobil: masuk dari kanan di waktu `a`, keluar ke kiri di waktu `e` (opsional)
const RCar: React.FC<{ t: number; i: number; cy: number; a: number; e?: number; s?: number }> = ({ t, i, cy, a, e, s = 0.6 }) => {
  const [sx, sy] = SLOTS[i];
  const inK = pr(t, a, a + 0.9, out3);
  const outK = e === undefined ? 0 : pr(t, e, e + 1.0, in3);
  if (inK <= 0 || outK >= 1) return null;
  const x = outK > 0 ? lerp(sx, -220, outK) : lerp(1300, sx, inK);
  return <L.Car cx={x} cy={cy + sy} s={s} color={CAR} />;
};

// ---- Adegan 1 (kalimat 1-2): hasil tes "tidak terdeteksi" (kaset 1 garis) -> pertanyaan: virus hilang? virus muncul dengan tanda tanya
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const s2 = T(2);
  const enter = pr(t, 0.2, 1.0, back);
  const kitX = lerp(1000, 760, pr(t, 0.3, 1.2));
  const check = pr(t, 1.9, 2.6, back);
  const q = pr(t, s2 + 0.1, s2 + 0.8, back);
  const v = pr(t, s2 + 0.8, s2 + 1.5, back);
  const sway = Math.sin(pr(t, s2, s2 + 2, sine) * Math.PI * 4) * 4;
  return (
    <>
      <L.Person cx={330} cy={900} s={2.1 * enter} op={enter} rot={sway} />
      <L.TestKit cx={kitX} cy={900} s={1.15} op={pr(t, 0.3, 0.9)} lines={1} />
      <L.CheckBadge cx={760} cy={650} s={0.8 * check * (1 - 0.35 * pr(t, s2, s2 + 0.8))} op={check} />
      <L.SpeechBubble cx={330} cy={580} s={q} op={q} text="?" />
      <Virus x={560} y={620} r={46 * v} dim={0.9} t={t} />
    </>
  );
};

// ---- Adegan 2 (kalimat 3-5): jalan dengan mobil. virus berubah jadi mobil; banyak mobil = ramai; mobil pergi = sepi
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const s3 = T(3), s4 = T(4), s5 = T(5);
  const road = pr(t, s3, s3 + 0.9, back);
  const vOut = pr(t, s3 + 1.6, s3 + 2.4);
  const vIn = pr(t, s3 + 0.5, s3 + 1.2, back);
  const cy = 900;
  const exits = [2, 3, 4, 6, 7, 1];
  return (
    <>
      <L.Road cx={540} cy={cy} s={road} op={road} w={1000} h={300} />
      <Virus x={300} y={560} r={64 * vIn * (1 - vOut)} t={t} />
      <RCar t={t} i={0} cy={cy} a={s3 + 1.8} />
      {[1, 2, 3, 4, 5, 6, 7].map((i) => {
        const k = exits.indexOf(i);
        const e = k >= 0 && i !== 5 ? s5 + 0.1 + k * 0.18 : undefined;
        return <RCar key={i} t={t} i={i} cy={cy} a={s4 + 0.1 + i * 0.16} e={e} />;
      })}
    </>
  );
};

// ---- Adegan 3 (kalimat 6): tabung darah; salinan HIV muncul satu per satu dan dihitung
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const s6 = T(6);
  const enter = pr(t, s6, s6 + 0.8, back);
  const spots: [number, number][] = [[-12, 10], [12, 60], [-8, 110], [10, 160], [-10, 210]];
  const n = spots.reduce((c, _, i) => c + (t >= s6 + 1.4 + i * 0.5 ? 1 : 0), 0);
  const cnt = pr(t, s6 + 1.3, s6 + 1.8, back);
  return (
    <>
      <L.BloodTube cx={330} cy={820} s={2.4 * enter} op={enter} level={0.75} />
      {spots.map(([dx, dy], i) => {
        const k = pr(t, s6 + 1.4 + i * 0.5, s6 + 1.9 + i * 0.5, back);
        return <Virus key={i} x={330 + dx * 2.0} y={620 + dy * 1.6} r={26 * k} t={t} seed={i} />;
      })}
      <g opacity={cnt} transform={`translate(760 ${860 + (1 - cnt) * 30})`}>
        <circle r={150} fill="#fff" fillOpacity={0.14} />
        <text textAnchor="middle" y={44} fontFamily={FONT} fontSize={150} fontWeight={800} fill="#FFFFFF">{n}</text>
      </g>
    </>
  );
};

// ---- Adegan 4 (kalimat 7-9): jalan ramai -> mulai sepi -> kosong, sambil garis viral load turun di bawah batas alat
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const s7 = T(7), s8 = T(8), s9 = T(9);
  const c2 = CL(8, 1), c9b = CL(9, 1);
  const road = pr(t, s7, s7 + 0.7, back);
  const cy = 700;
  // 8 mobil -> 3 saat "mulai sepi" -> 0 saat "kosong"
  const outA = [1, 2, 4, 5, 7];
  const outB = [0, 3, 6];
  const prog = lerp(0, 0.3, pr(t, s7 + 0.3, s7 + 1.8, sine)) + 0.38 * pr(t, c2, c2 + 2.0, sine) + 0.32 * pr(t, c9b, c9b + 1.6, sine);
  const chartOn = pr(t, s7 + 0.2, s7 + 0.9, back);
  const thr = pr(t, s9, s9 + 0.6);
  return (
    <>
      <L.Road cx={540} cy={cy} s={road} op={road} w={1000} h={290} />
      {Array.from({ length: 8 }, (_, i) => {
        const e = outA.includes(i) ? c2 + 0.1 + outA.indexOf(i) * 0.15 : outB.includes(i) ? c9b + 0.1 + outB.indexOf(i) * 0.2 : undefined;
        return <RCar key={i} t={t} i={i} cy={cy} a={s7 + 0.15 + i * 0.1} e={e} s={0.58} />;
      })}
      <L.LineChart cx={540} cy={1120} s={chartOn} op={chartOn} w={800} h={340} points={[0.92, 0.9, 0.86, 0.5, 0.38, 0.3, 0.14, 0.1]} threshold={thr > 0.5 ? 0.2 : undefined} progress={Math.min(1, prog)} />
    </>
  );
};

// ---- Adegan 5 (kalimat 10): jalan kosong, mobil terakhir pergi -> kaset tes: tidak terdeteksi
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const s10 = T(10);
  const road = pr(t, s10, s10 + 0.5);
  const cy = 780;
  const kit = pr(t, s10 + 1.2, s10 + 2.0, back);
  const ok = pr(t, s10 + 2.0, s10 + 2.7, back);
  return (
    <>
      <L.Road cx={540} cy={cy} op={road} w={1000} h={290} />
      <L.TestKit cx={470} cy={1150} s={0.95 * kit} op={kit} lines={1} />
      <L.CheckBadge cx={720} cy={1110} s={0.8 * ok} op={ok} />
    </>
  );
};

// ---- Adegan 6 (kalimat 11-12): jalan kosong tapi mobil mungil tetap ada; alat pemindai lewat dan tidak membaca
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const s11 = T(11), s12 = T(12);
  const cy = 780;
  const tiny: [number, number][] = [[260, -50], [560, 52], [820, -44]];
  const sweepK = pr(t, s12 + 0.5, s12 + 2.0, sine);
  const bx = lerp(90, 990, sweepK);
  const beamOn = pr(t, s12 + 0.3, s12 + 0.7) * (1 - pr(t, s12 + 2.0, s12 + 2.4));
  return (
    <>
      <L.Road cx={540} cy={cy} w={1000} h={290} />
      {tiny.map(([x, dy], i) => {
        const k = pr(t, s11 + 1.4 + i * 0.35, s11 + 2.0 + i * 0.35, back);
        const near = 1 - Math.min(1, Math.abs(bx - x) / 120);
        return <L.Car key={i} cx={x} cy={cy + dy} s={0.24 * k * (1 + 0.15 * near * beamOn)} color={CAR} op={k} />;
      })}
      <rect x={bx - 22} y={cy - 190} width={44} height={380} rx={22} fill="#EAF2FB" opacity={0.28 * beamOn} />
      <rect x={bx - 5} y={cy - 190} width={10} height={380} rx={5} fill="#FFFFFF" opacity={0.7 * beamOn} />
      <L.CrossBadge cx={540} cy={1110} s={0.65 * pr(t, s12 + 2.0, s12 + 2.6, back)} op={pr(t, s12 + 2.0, s12 + 2.6)} />
    </>
  );
};

// ---- Adegan 7 (kalimat 13): virus mulai membuat salinan; kapsul ARV datang, salinan baru berhenti terbentuk (virus tetap ada)
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const s13 = T(13);
  const vIn = pr(t, s13, s13 + 0.7, back);
  const copy = (a: number, dx: number, dy: number) => ({ k: pr(t, s13 + a, s13 + a + 0.8, sine), dx, dy });
  const c1 = copy(0.5, 190, -40), c2 = copy(1.0, 120, 150);
  const caps = pr(t, s13 + 1.3, s13 + 2.2, sine);
  const stopK = pr(t, s13 + 2.1, s13 + 2.6);
  const tryK = Math.sin(pr(t, s13 + 2.3, s13 + 2.9) * Math.PI); // salinan ketiga mencoba lalu batal
  const dim = 1 - 0.35 * stopK;
  return (
    <>
      <Virus x={320} y={900} r={66 * vIn} dim={dim} t={t} />
      <Virus x={320 + c1.dx * c1.k} y={900 + c1.dy * c1.k} r={46 * c1.k} dim={0.55} t={t} seed={1} />
      <Virus x={320 + c2.dx * c2.k} y={900 + c2.dy * c2.k} r={46 * c2.k} dim={0.55} t={t} seed={2} />
      <Virus x={320 - 150 * tryK} y={900 - 30 * tryK} r={40 * tryK} dim={0.4} t={t} seed={3} />
      <L.Capsule cx={lerp(1150, 700, caps)} cy={lerp(860, 900, caps)} s={1.1} rot={lerp(-30, 0, caps)} op={pr(t, s13 + 1.3, s13 + 1.7)} />
    </>
  );
};

// ---- Adegan 8 (kalimat 14): kalender enam bulan terisi, garis viral load turun di bawah batas alat
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const s14 = T(14);
  const enter = pr(t, s14, s14 + 0.8, back);
  const prog = pr(t, s14 + 0.6, s14 + 3.4, sine);
  const marks = Array.from({ length: Math.min(6, Math.floor(prog * 6.2)) }, (_, i) => i);
  const chartOn = pr(t, s14 + 0.3, s14 + 1.0, back);
  return (
    <>
      <L.Calendar cx={540} cy={720} s={1.7 * enter} op={enter} marks={marks} />
      <L.LineChart cx={540} cy={1150} s={chartOn} op={chartOn} w={800} h={340} points={[0.92, 0.8, 0.55, 0.35, 0.2, 0.12]} threshold={0.2} progress={prog} />
    </>
  );
};

// ---- Adegan 9 (kalimat 15): strip obat diminum satu per satu; garis tetap rendah, garis naik (jika berhenti) memudar
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const s15 = T(15);
  const enter = pr(t, s15, s15 + 0.7, back);
  const taken = Math.min(6, Math.floor(Math.max(0, t - (s15 + 0.5)) / 0.3));
  const chartOn = pr(t, s15 + 0.2, s15 + 0.9, back);
  const ghost = pr(t, s15 + 1.5, s15 + 2.2, sine);
  const ghostOp = 0.5 * (1 - pr(t, s15 + 2.2, s15 + 2.9));
  return (
    <>
      <L.Blister cx={540} cy={760} s={1.55 * enter} op={enter} taken={taken} />
      <L.LineChart cx={540} cy={1150} s={chartOn} op={chartOn} w={800} h={340} points={[0.14, 0.12, 0.13, 0.12, 0.13]} progress={pr(t, s15 + 0.4, s15 + 1.4, sine)} />
      <L.LineChart cx={540} cy={1150} w={800} h={340} op={ghostOp} color={LIB_COL.bad} points={[0.12, 0.13, 0.4, 0.7, 0.9]} progress={ghost} />
    </>
  );
};

// ---- Adegan 10 (kalimat 16): viral load rendah; virus mencoba berpindah ke orang lain, terhenti oleh perisai
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const s16 = T(16), c2 = CL(16, 1);
  const enter = pr(t, s16, s16 + 0.8, back);
  const chartOn = pr(t, s16 + 0.5, s16 + 1.2, back);
  const sh = pr(t, c2 - 0.2, c2 + 0.5, back);
  const go = pr(t, c2 + 0.3, c2 + 1.2, sine);
  const stop = pr(t, c2 + 1.0, c2 + 1.5);
  const heart = pr(t, c2 + 1.5, c2 + 2.0, back);
  return (
    <>
      <L.Person cx={230} cy={1000} s={1.8 * enter} op={enter} color="#8FBDF7" />
      <L.Person cx={850} cy={1000} s={1.8 * enter} op={enter} color="#B9A2F5" />
      <L.LineChart cx={230} cy={640} s={0.8 * chartOn} op={chartOn} w={400} h={260} points={[0.12, 0.11, 0.12, 0.1]} />
      <L.Shield cx={650} cy={1000} s={0.9 * sh} op={sh} />
      <Virus x={lerp(300, 560, go)} y={1000} r={36 * pr(t, c2 + 0.1, c2 + 0.4) * (1 - stop)} dim={0.9} t={t} />
      <L.Heart cx={540} cy={760} s={0.8 * heart} op={heart} />
    </>
  );
};

// ---- Adegan 11 (kalimat 17): U=U dibuka huruf per huruf; "tidak terdeteksi" = "tidak menularkan"
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const s17 = T(17), c1 = CL(17, 1), c2 = CL(17, 2);
  const uu = pr(t, s17, s17 + 0.7, back);
  const rows = ['Undetectable', 'Equals', 'Untransmittable'];
  const left = pr(t, c2, c2 + 0.6, back);
  const eq = pr(t, c2 + 1.2, c2 + 1.7, back);
  const right = pr(t, c2 + 1.7, c2 + 2.3, back);
  return (
    <>
      <text x={540} y={560} textAnchor="middle" fontFamily={FONT} fontSize={230} fontWeight={800} fill="#FFFFFF" opacity={uu} transform={`translate(0 ${(1 - uu) * 30})`}>U=U</text>
      {rows.map((w, i) => {
        const k = pr(t, c1 + i * 0.28, c1 + i * 0.28 + 0.5, back);
        return (
          <text key={w} x={540} y={700 + i * 78} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={52} fill="#EAF2FB" opacity={k} transform={`translate(0 ${(1 - k) * 18})`}>
            <tspan fill="#F4D77E" fontWeight={800} fontSize={64}>{w[0]}</tspan>{w.slice(1)}
          </text>
        );
      })}
      <L.LineChart cx={250} cy={1090} s={left} op={left} w={380} h={240} points={[0.12, 0.1, 0.11, 0.1]} />
      <text x={540} y={1130} textAnchor="middle" fontFamily={FONT} fontSize={110} fontWeight={800} fill="#FFFFFF" opacity={eq} transform={`scale(${eq})`} style={{ transformOrigin: '540px 1100px' }}>=</text>
      <L.Shield cx={830} cy={1090} s={0.8 * right} op={right} />
    </>
  );
};

// ---- Adegan 12 (kalimat 18): virus meredup seolah hilang, tanda silang menegaskan bukan hilang; virus tetap ada (redup, tidak hilang total)
const Scene12: React.FC<{ t: number }> = ({ t }) => {
  const s18 = T(18), c1 = CL(18, 1);
  const v = pr(t, s18, s18 + 0.7, back);
  const fade = pr(t, s18 + 0.5, s18 + 1.4, sine);
  const back2 = pr(t, c1 + 0.9, c1 + 1.7, sine);
  const dim = 1 - 0.55 * fade + 0.35 * back2;
  const cross = pr(t, c1 + 0.2, c1 + 0.8, back);
  const pulse = 1 + 0.05 * Math.sin(Math.max(0, t - (c1 + 1.7)) * 3.2);
  return (
    <>
      <Virus x={540} y={880} r={110 * v * pulse} dim={dim} t={t} />
      <L.CrossBadge cx={760} cy={720} s={0.75 * cross} op={cross} />
    </>
  );
};

const PILLS: { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number }[] = [
  { a: 1.9, b: T(2) - 0.2, text: 'tidak terdeteksi', k: 'neutral', x: 760, y: 1160, size: 36 },
  { a: T(3) + 0.5, b: T(3) + 2.4, text: 'viral load', k: 'virus', x: 300, y: 470, size: 40 },
  { a: T(4) + 1.0, b: T(5) - 0.1, text: 'ramai', k: 'virus', x: 540, y: 1130, size: 52 },
  { a: T(5) + 0.9, b: T(6) - 0.2, text: 'sepi', k: 'neutral', x: 540, y: 1130, size: 52 },
  { a: T(6) + 1.0, b: T(7) - 0.2, text: 'per mililiter darah', k: 'neutral', x: 400, y: 1180, size: 36 },
  { a: T(7) + 0.5, b: T(8) + 0.2, text: '> 1.000', k: 'virus', x: 540, y: 420, size: 50 },
  { a: T(8) + 0.4, b: T(9) - 0.1, text: '≤ 1.000', k: 'neutral', x: 540, y: 420, size: 50 },
  { a: T(9) + 0.3, b: T(10) - 0.3, text: 'di bawah batas alat', k: 'neutral', x: 540, y: 420, size: 40 },
  { a: T(10) + 1.4, b: T(11) - 0.2, text: 'tidak terdeteksi', k: 'arv', x: 540, y: 520, size: 46 },
  { a: T(11) + 1.9, b: T(12) - 0.2, text: 'masih ada', k: 'virus', x: 540, y: 1130, size: 46 },
  { a: T(12) + 2.7, b: T(13) - 0.2, text: 'alat tidak membaca', k: 'neutral', x: 540, y: 1260, size: 36 },
  { a: T(13) + 1.0, b: T(14) - 0.2, text: 'replikasi', k: 'virus', x: 440, y: 1130, size: 40 },
  { a: T(14) + 0.7, b: T(15) - 0.2, text: '6 bulan', k: 'recep', x: 540, y: 470, size: 46 },
  { a: T(15) + 0.4, b: T(16) - 0.2, text: 'minum teratur', k: 'arv', x: 540, y: 470, size: 44 },
  { a: CL(17, 2) + 0.9, b: T(18) - 0.2, text: 'tidak terdeteksi', k: 'neutral', x: 250, y: 1290, size: 32 },
  { a: CL(17, 2) + 2.4, b: T(18) - 0.2, text: 'tidak menularkan', k: 'neutral', x: 830, y: 1290, size: 32 },
  { a: T(18) + 2.4, b: CLOSE - 0.2, text: 'masih ada', k: 'virus', x: 540, y: 1130, size: 46 },
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
export const S1E9Full: React.FC = () => {
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
          <LegendBox t={t} a={T(1) + 1.0} b={T(2) + 3.8} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(3) + 2.2} b={T(3) + 7.5} items={[['#FF9C85', 'Mobil = virus']]} />
          <LegendBox t={t} a={T(6) + 0.4} b={T(7) - 0.2} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(7) + 0.3} b={T(9) - 0.1} items={[['#FF9C85', 'Mobil = virus'], ['#72E3D3', 'Viral load']]} />
          <LegendBox t={t} a={T(9) - 0.0} b={T(10) - 0.2} items={[['#72E3D3', 'Viral load'], ['#FF6B4D', 'Batas alat']]} />
          <LegendBox t={t} a={T(11) + 1.3} b={T(11) + 5.8} items={[['#FF9C85', 'Mobil mungil = virus']]} />
          <LegendBox t={t} a={T(13) + 0.2} b={T(13) + 3.0} items={[['#FF9C85', 'Virus HIV'], ['#72E3D3', 'ARV']]} />
          <LegendBox t={t} a={T(14) + 0.2} b={T(14) + 3.6} items={[['#72E3D3', 'Viral load'], ['#FF6B4D', 'Batas alat']]} />
          <LegendBox t={t} a={T(15) + 0.2} b={T(16) - 0.2} items={[['#72E3D3', 'Viral load stabil'], ['#FF6B4D', 'Jika berhenti']]} />
          <LegendBox t={t} a={CL(16, 1) + 0.0} b={T(17) - 0.1} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(18) + 0.2} b={T(18) + 3.4} items={[['#FF9C85', 'Virus HIV']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile("vo/S1E9.mp3")} />
    </AbsoluteFill>
  );
};
