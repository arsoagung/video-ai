import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T, T, CL, EP_DUR } from './timeline';

export const S1E7_FRAMES = Math.ceil(EP_DUR * FPS);

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

1. SMART Study Group, El-Sadr WM et al. (2006). CD4+ count-guided interruption of antiretroviral treatment. N Engl J Med. 355(22), 2283-2296.
https://doi.org/10.1056/NEJMoa062360

2. Davey RT Jr et al. (1999). HIV-1 and T cell dynamics after interruption of highly active antiretroviral therapy (HAART) in patients with a history of sustained viral suppression. Proc Natl Acad Sci USA. 96(26), 15109-15114.
https://doi.org/10.1073/pnas.96.26.15109

3. Joos B et al. (2008). HIV rebounds from latently infected cells, rather than from continuing low-level replication. Proc Natl Acad Sci USA. 105(43), 16725-16730.
https://doi.org/10.1073/pnas.0804192105

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
  ['#0D1B45', '#1E2F6B', '#2B4A85'], // 2 mobil: biru tua
  ['#08283A', '#0F4A5C', '#167A80'], // 3 ARV menekan: teal
  ['#14183F', '#2A2A6B', '#3B4A8A'], // 4 laten: indigo
  ['#0D1B45', '#1E2F6B', '#2B4A85'], // 5 minggu: biru tua
  ['#14183F', '#2A2A6B', '#3B4A8A'], // 6 tak terdeteksi: indigo
  ['#0A1F3D', '#123A60', '#17506F'], // 7 SMART: biru laut
  ['#08283A', '#0F4A5C', '#167A80'], // 8 rutin: teal
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


// ================= ADEGAN (ditulis per episode, animasi bercerita) =================
const pr = (t: number, a: number, b: number, e: (x: number) => number = out3) => ez(t, a, b, e);
const keyed = (t: number, ks: [number, number][]) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], ez(t, ks[i - 1][0], ks[i][0], sine));
  }
  return ks[ks.length - 1][1];
};
const Virus: React.FC<{ x: number; y: number; r: number; dim?: number; t: number; seed?: number }> = ({ x, y, r, dim = 1, t, seed = 0 }) =>
  r < 2 || dim < 0.01 ? null : <FlatVirus cx={x} cy={y} r={r} dim={dim} rot={t * 5 + seed * 40} />;

const SceneWrap: React.FC<{ i: number; t: number; children: React.ReactNode }> = ({ i, t, children }) => {
  const o = win(t, SCENE_T[i], SCENE_T[i + 1] + 0.25, 0.45);
  if (o < 0.005) return null;
  return <g opacity={o}>{children}</g>;
};

// ---- Adegan 1 (kalimat 1): hanya kalender; tiap tanggal menyala merah berurutan (berhenti minum obat) sampai tanggal 30
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const enter = pr(t, 0.1, 0.9, back);
  const n = Math.floor(pr(t, 0.7, 4.9, sine) * 30.999);
  return <L.Calendar cx={540} cy={820} s={2.3 * enter} op={enter} marks={Array.from({ length: n }, (_, i) => i)} markColor={LIB_COL.bad} />;
};

// ---- Adegan 2 (kalimat 2-4): mobil menuruni jalan, rem menahan tapi jalan tetap menurun, lalu ARV = rem
const P0 = { x: 60, y: 640 }, P1 = { x: 1020, y: 1260 };
const ANG = (Math.atan2(P1.y - P0.y, P1.x - P0.x) * 180) / Math.PI;
const onRoad = (u: number, off = 64) => {
  const a = (ANG * Math.PI) / 180;
  return { x: lerp(P0.x, P1.x, u) + Math.sin(a) * off, y: lerp(P0.y, P1.y, u) - Math.cos(a) * off };
};
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const s2 = T(2), s3 = T(3), s4 = T(4);
  const road = pr(t, s2 - 0.1, s2 + 0.8);
  // maju dipercepat, lalu direm sampai berhenti di u=0.68
  const u = t < s3 + 0.5 ? lerp(0.06, 0.5, pr(t, s2 + 0.4, s3 + 0.5, in3)) : lerp(0.5, 0.68, pr(t, s3 + 0.5, s3 + 3.2, out3));
  const car = onRoad(u);
  const brake = pr(t, s3 + 0.5, s3 + 0.9) * (1 - pr(t, s3 + 4.8, s3 + 5.0));
  const carOp = 1 - 0.55 * pr(t, s4 + 0.2, s4 + 0.9);
  const arrowsOn = pr(t, s3 + 3.4, s3 + 4.0);
  const cap = pr(t, s4 + 0.3, s4 + 1.2, back);
  const ca = (ANG * Math.PI) / 180;
  return (
    <>
      <line x1={P0.x} y1={P0.y} x2={P1.x} y2={P1.y} stroke="#EAF2FB" strokeOpacity={0.3 * road} strokeWidth={26} strokeLinecap="round" />
      <line x1={P0.x} y1={P0.y} x2={lerp(P0.x, P1.x, road)} y2={lerp(P0.y, P1.y, road)} stroke="#EAF2FB" strokeOpacity={0.55} strokeWidth={8} strokeDasharray="30 26" strokeLinecap="round" />
      {[0.8, 0.88, 0.96].map((k, i) => {
        const x = lerp(P0.x, P1.x, k) + Math.sin(ca) * 4, y = lerp(P0.y, P1.y, k) - Math.cos(ca) * 4;
        const loop = (t * 1.2 + i * 0.3) % 1;
        return <polygon key={i} points="-16,-18 18,0 -16,18" transform={`translate(${x} ${y - 48}) rotate(${ANG})`} fill={LIB_COL.bad} opacity={arrowsOn * (0.35 + 0.65 * Math.sin(loop * Math.PI))} />;
      })}
      <g opacity={carOp}>
        <L.Car cx={car.x} cy={car.y} s={1.05 * road} rot={ANG} op={road} />
        <rect x={car.x - 124 * Math.cos(ca) - 14} y={car.y - 124 * Math.sin(ca) - 14 - 8} width={20} height={26} rx={8} fill={LIB_COL.bad} opacity={brake} transform={`rotate(${ANG} ${car.x} ${car.y})`} />
      </g>
      <L.Capsule cx={car.x - 10} cy={car.y - 150} s={1.0 * cap} op={cap} rot={ANG} />
    </>
  );
};

// ---- Adegan 3 (kalimat 5): virus beranak terus; kapsul datang -> replikasi langsung berhenti; virus yang sudah ada tidak mati
const COPY_POS: [number, number][] = [[330, 760], [750, 760], [270, 960], [810, 960], [400, 1110]];
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const s5 = T(5);
  const enter = pr(t, s5, s5 + 0.9, back);
  const capK = pr(t, s5 + 2.0, s5 + 3.0, sine);
  const stopK = pr(t, s5 + 3.0, s5 + 3.6, back);
  const nudge = Math.sin(pr(t, s5 + 3.0, s5 + 3.4) * Math.PI) * 10;
  return (
    <>
      {COPY_POS.map(([x, y], i) => {
        const k = pr(t, s5 + 0.3 + i * 0.45, s5 + 0.85 + i * 0.45, sine);
        return <Virus key={i} x={lerp(540, x, k)} y={lerp(900, y, k)} r={64 * k} dim={Math.min(1, k * 2)} t={t} seed={i + 1} />;
      })}
      <Virus x={540} y={900} r={96 * enter} t={t} />
      <L.Capsule cx={lerp(120, 380 + nudge, capK)} cy={lerp(1260, 900, capK)} s={0.95 * (capK > 0 ? 1 : 0)} rot={lerp(-40, 0, capK)} op={Math.min(1, capK * 4)} />
      <L.CrossBadge cx={540} cy={900} s={0.8 * stopK} op={stopK * 0.95} />
    </>
  );
};

// ---- Adegan 4 (kalimat 6-7): ARV dihentikan, kadar obat turun; virus laten dalam sel kembali aktif dan menyalin
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const s6 = T(6), s7 = T(7);
  const enter = pr(t, s6, s6 + 0.7, back);
  const stop = pr(t, s6 + 0.2, s6 + 0.9, back);
  const level = keyed(t, [[s6 + 0.5, 0.95], [s6 + 3.8, 0.08], [s6 + 9, 0.08]]);
  const capFade = 1 - pr(t, s6 + 0.8, s6 + 1.6);
  const cell = pr(t, s7 + 0.1, s7 + 1.0, back);
  const wake = pr(t, s7 + 2.2, s7 + 3.6, sine);
  const out = pr(t, s7 + 3.2, s7 + 4.6, back);
  const vr = lerp(34, 74, wake);
  return (
    <>
      <L.Capsule cx={250} cy={640} s={0.95 * enter} op={enter * capFade} rot={-20} />
      <L.CrossBadge cx={330} cy={590} s={0.6 * stop} op={stop * (1 - pr(t, s6 + 2.2, s6 + 2.8))} />
      <L.Battery cx={640} cy={640} s={1.25 * enter} op={enter} level={level} />
      <FlatCell cx={540} cy={1130} r={150 * cell} color="#B9C3D0" nuc="#8C99AB" op={cell} />
      <Virus x={540} y={1130} r={vr * cell} dim={lerp(0.3, 1, wake)} t={t} />
      <Virus x={lerp(540, 250, out)} y={lerp(1130, 1110, out)} r={56 * out} dim={out} t={t} seed={1} />
      <Virus x={lerp(540, 830, out)} y={lerp(1130, 1110, out)} r={56 * out} dim={out} t={t} seed={2} />
    </>
  );
};

// ---- Adegan 5 (kalimat 8-10): dalam hitungan minggu viral load naik, CD4 turun, risiko penularan naik
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const s8 = T(8), s9 = CL(8, 2), s10 = CL(8, 3); // s8: viral load (klausa 1 mulai s8+1,4), s9: CD4, s10: risiko penularan
  const enter = pr(t, s8 - 0.1, s8 + 0.7, back);
  const days = Math.floor(pr(t, s8 + 0.3, s8 + 3.4, sine) * 28.99);
  const prog = pr(t, s8 + 0.7, s8 + 4.6, sine);
  const cellsIn = pr(t, s9, s9 + 0.8, back);
  const cd4 = [0, 1, 2, 3, 4].map((i) => 1 - pr(t, s9 + 0.9 + i * 0.4, s9 + 1.5 + i * 0.4) * (i >= 2 ? 1 : 0));
  const pe = pr(t, s10 - 0.1, s10 + 0.7, back);
  const shield = 1 - pr(t, s10 + 0.7, s10 + 1.9, sine);
  const fly = pr(t, s10 + 1.7, s10 + 2.7, sine);
  return (
    <>
      <L.Calendar cx={540} cy={560} s={0.95 * enter} op={enter} marks={Array.from({ length: days }, (_, i) => i)} markColor={LIB_COL.bad} />
      <L.LineChart cx={540} cy={880} s={enter} op={enter} w={800} h={320} points={[0.1, 0.12, 0.16, 0.3, 0.55, 0.8, 0.95]} progress={prog} color={LIB_COL.bad} />
      {cd4.map((k, i) => (
        <FlatCell key={i} cx={140 + 200 * i} cy={1130} r={42 * cellsIn * (0.55 + 0.45 * k)} color={SHAPE_COL.cd4} nuc={SHAPE_COL.cd4Dark} rec={0.8} op={cellsIn * (0.2 + 0.8 * k)} />
      ))}
      <L.Person cx={260} cy={1300} s={0.8 * pe} op={pe} />
      <L.Person cx={820} cy={1300} s={0.8 * pe} op={pe} color="#B9A2F5" />
      <L.Shield cx={540} cy={1300} s={0.7 * pe * (0.4 + 0.6 * shield)} op={pe * shield} />
      <Virus x={lerp(300, 780, fly)} y={1290 - Math.sin(fly * Math.PI) * 70} r={26 * pr(t, s10 + 1.6, s10 + 2.0)} t={t} />
    </>
  );
};

// ---- Adegan 6 (kalimat 11): bertahun-tahun tak terdeteksi (kalender penuh, garis rendah) lalu ARV dihentikan -> naik
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const s11 = T(9);
  const enter = pr(t, s11 - 0.1, s11 + 0.7, back);
  const days = Math.floor(pr(t, s11 + 0.4, s11 + 3.2, sine) * 35.99);
  const prog = keyed(t, [[s11 + 0.5, 0], [s11 + 3.4, 0.8], [s11 + 4.0, 0.8], [s11 + 5.4, 1]]);
  const hot = prog > 0.82;
  const x = pr(t, s11 + 3.9, s11 + 4.6, back);
  return (
    <>
      <L.Calendar cx={540} cy={600} s={1.4 * enter} op={enter} marks={Array.from({ length: days }, (_, i) => i)} markColor={LIB_COL.good} />
      <L.LineChart cx={540} cy={1020} s={enter} op={enter} w={860} h={400} points={[0.07, 0.07, 0.07, 0.07, 0.07, 0.07, 0.07, 0.07, 0.07, 0.45, 0.9]} threshold={0.2} progress={prog} color={hot ? LIB_COL.bad : LIB_COL.good} />
      <L.CrossBadge cx={860} cy={800} s={0.6 * x} op={x} />
    </>
  );
};

// ---- Adegan 7 (kalimat 12): studi SMART; bar henti obat > 2x bar lanjut
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const s12 = T(10);
  const enter = pr(t, s12 - 0.1, s12 + 0.8, back);
  const stamp = pr(t, s12 + 1.2, s12 + 1.8, back);
  const pa = pr(t, s12 + 2.0, s12 + 3.2, sine);
  const pb = pr(t, s12 + 3.0, s12 + 7.2, sine);
  const mark = pr(t, s12 + 7.2, s12 + 7.9, back);
  const pulse = 1 + 0.05 * Math.sin(pr(t, s12 + 9.0, s12 + 10.0) * Math.PI);
  return (
    <>
      <L.Document cx={540} cy={560} s={1.35 * enter} op={enter} kind="paper" stamp={stamp > 0.5} />
      <L.CompareBars cx={540} cy={1030} s={enter * pulse} op={enter} labelA="ARV lanjut" labelB="ARV dihentikan" pa={pa} pb={pb} mark={mark} />
    </>
  );
};

// ---- Adegan 8 (kalimat 11-13): sehat != HIV hilang; ARV rutin (kapsul terbang dari strip ke kalender, tiap kapsul menandai satu hari); jangan berhenti sendiri
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const s13 = T(11), s14 = T(12), s15 = T(13);
  const enter = pr(t, s13 - 0.1, s13 + 0.8, back);
  const beat = 1 + 0.12 * Math.max(0, Math.sin(t * 6)) ** 2;
  const vi = pr(t, s13 + 1.2, s13 + 2.0, back);
  const swap = pr(t, s14 - 0.1, s14 + 0.7, sine);
  const NC = 7;
  const CAL = { x: 420, y: 760, s: 1.5 };
  const cell = (i: number) => ({ x: CAL.x + CAL.s * (-96 + (i % 7) * 32), y: CAL.y + CAL.s * -34 });
  const launch = (i: number) => s14 + 0.3 + i * 0.3;
  const fly = Array.from({ length: NC }, (_, i) => pr(t, launch(i), launch(i) + 0.7, sine));
  const arrived = fly.filter((f) => f >= 1).length;
  const launched = fly.filter((f) => f > 0).length;
  const x = pr(t, s15 + 0.2, s15 + 0.9, back);
  const personOp = enter * (1 - swap);
  return (
    <>
      <L.Person cx={420} cy={820} s={1.7 * enter} op={personOp} />
      <L.Heart cx={620} cy={690} s={0.55 * beat * enter} op={personOp} />
      <Virus x={760} y={1020} r={40 * vi} dim={0.5 * vi * (1 - swap)} t={t} />
      <L.Calendar cx={CAL.x} cy={CAL.y} s={CAL.s * swap} op={swap} marks={Array.from({ length: arrived }, (_, i) => i)} markColor={LIB_COL.good} />
      <L.Blister cx={700} cy={1180} s={1.2 * swap} op={swap} taken={Math.min(6, launched)} />
      {fly.map((f, i) => {
        if (f <= 0 || f >= 1) return null;
        const c = cell(i);
        return <L.Capsule key={i} cx={lerp(700, c.x, f)} cy={lerp(1150, c.y, f) - Math.sin(f * Math.PI) * 120} s={lerp(0.6, 0.2, f)} rot={lerp(-30, 90, f)} op={1 - 0.4 * f} />;
      })}
      <L.CrossBadge cx={760} cy={1130} s={0.8 * x} op={x} />
    </>
  );
};

const PILLS: { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number }[] = [
  { a: T(4) + 0.1, b: T(5) - 0.2, text: 'ARV = rem', k: 'arv', x: 540, y: 760, size: 42 },
  { a: CL(5, 1) + 1.0, b: T(6) - 0.2, text: 'virus tetap ada', k: 'virus', x: 540, y: 1260, size: 38 },
  { a: T(6) + 0.3, b: T(7) - 0.2, text: 'kadar obat', k: 'arv', x: 640, y: 480, size: 38 },
  { a: CL(8, 3) + 0.4, b: T(9) - 0.2, text: 'risiko penularan', k: 'neutral', x: 540, y: 1395, size: 34 },
  { a: T(9) + 3.9, b: T(10) - 0.2, text: 'ARV dihentikan', k: 'arv', x: 540, y: 1290, size: 40 },
  { a: T(10) + 0.6, b: T(10) + 7.0, text: 'Studi SMART', k: 'neutral', x: 540, y: 760, size: 40 },
  { a: T(11) + 1.3, b: T(12) - 0.2, text: 'HIV belum hilang', k: 'virus', x: 760, y: 1110, size: 36 },
];
const SubNote: React.FC<{ t: number }> = ({ t }) => {
  const o = win(t, T(10) + 1.0, T(10) + 7.0, 0.4);
  if (o < 0.01) return null;
  return (
    <div style={{ position: 'absolute', top: 818, left: 0, width: 1080, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 28, lineHeight: 1.3, color: '#EAF2FB', opacity: 0.92 * o }}>
      Strategi untuk Manajemen Terapi Antiretroviral
      <br />
      <span style={{ opacity: 0.8 }}>Strategies for Management of Antiretroviral Therapy</span>
    </div>
  );
};
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
export const S1E7Full: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = gradAt(t);
  const cue = CUES.find((c) => t >= c.a - 0.05 && t < c.b);
  const ck = cue ? Math.min(1, (t - cue.a + 0.05) / 0.18) : 0;
  const subOn = t < CLOSE - 0.05;
  const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8];
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
          <SubNote t={t} />
          <LegendBox t={t} a={T(5) + 0.1} b={T(5) + 4.6} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(7) + 0.1} b={T(8) - 0.3} items={[['#B9C3D0', 'Sel laten'], ['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(8) + 0.1} b={CL(8, 2) + 0.2} items={[[LIB_COL.bad, 'Viral load']]} />
          <LegendBox t={t} a={CL(8, 2) + 0.1} b={T(9) - 0.3} items={[[LIB_COL.bad, 'Viral load'], ['#8FBDF7', 'Sel CD4']]} />
          <LegendBox t={t} a={T(9) + 0.3} b={T(10) - 0.3} items={[[LIB_COL.good, 'Viral load'], [LIB_COL.bad, 'Batas terdeteksi']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile('vo/S1E7.mp3')} />
    </AbsoluteFill>
  );
};
