import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T, T, EP_DUR } from './timeline';

export const S1E5_FRAMES = Math.ceil(EP_DUR * FPS);

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

1. Paterson DL et al. (2000). Adherence to protease inhibitor therapy and outcomes in patients with HIV infection. Ann Intern Med. 133(1), 21-30.
https://doi.org/10.7326/0003-4819-133-1-200007040-00004

2. Harrigan PR et al. (2005). Predictors of HIV drug-resistance mutations in a large antiretroviral-naive cohort initiating triple antiretroviral therapy. J Infect Dis. 191(3), 339-347.
https://doi.org/10.1086/427192

3. CDC (2023). HIV Treatment Is HIV Prevention (consumer info sheet).
https://www.cdc.gov/hiv/resourcelibrary/infosheets/cdc-hiv-consumer-info-sheet-treatment-2023-508.pdf

4. Kementerian Kesehatan RI (2019). Keputusan Menteri Kesehatan RI Nomor HK.01.07/MENKES/90/2019 tentang Pedoman Nasional Pelayanan Kedokteran Tata Laksana HIV.`;

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
  ['#08283A', '#0F4A5C', '#167A80'], // 2 persediaan: teal
  ['#14183F', '#2A2A6B', '#3B4A8A'], // 3 kadar obat: indigo
  ['#0D1B45', '#1E2F6B', '#2B4A85'], // 4 dosis terlewat: biru tua
  ['#0A1F3D', '#123A60', '#17506F'], // 5 sekali vs sering: biru laut
  ['#08283A', '#0F4A5C', '#167A80'], // 6 jadwal: teal
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
// interpolasi bertahap antar kunci waktu [t, nilai]
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

// ---- Adegan 1 (kalimat 1-2): virus tertekan -> dosis terlewat -> virus membesar & menyalin; lalu rutin = tertekan lagi
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const s1 = T(1), s2 = T(2);
  const enter = pr(t, 0.3, 1.3, back);
  const miss = pr(t, 3.4, 4.2, back); // silang di strip: dosis terlewat
  const grow = pr(t, 4.4, 6.4, sine); // virus kembali aktif
  const split = pr(t, 5.6, 7.0, back); // dua salinan muncul
  const calm = pr(t, s2 + 0.2, s2 + 1.8, sine); // rutin: salinan hilang, virus ditekan lagi
  const vr = lerp(52, 98, grow) * (1 - calm * 0.44) * enter;
  const vd = lerp(0.5, 1, grow) * (1 - calm * 0.5);
  const cp = split * (1 - calm);
  const cal = pr(t, s2 + 0.6, s2 + 1.6, back);
  const nMark = Math.floor(pr(t, s2 + 1.4, s2 + 4.2, sine) * 7.999);
  const bl = (1 - pr(t, s2 + 0.2, s2 + 1.0)) ;
  return (
    <>
      <Virus x={540} y={calm > 0.01 ? 1170 : 820} r={vr} dim={vd} t={t} />
      <Virus x={300} y={850} r={92 * cp} dim={cp} t={t} seed={1} />
      <Virus x={780} y={850} r={92 * cp} dim={cp} t={t} seed={2} />
      <L.Blister cx={540} cy={1180} s={1.25 * enter} op={enter * bl} taken={t < 2.6 ? 2 : 2} />
      <L.CrossBadge cx={700} cy={1090} s={0.8 * miss} op={miss * bl} />
      <L.Calendar cx={540} cy={800} s={1.55 * cal} op={cal} marks={Array.from({ length: nMark }, (_, i) => i)} markColor={LIB_COL.good} />
    </>
  );
};

// ---- Adegan 2 (kalimat 3-4): botol -> kapsul mengisi perisai (persediaan); virus mencoba menyalin, kapsul menahan
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const a = T(3), b = T(4);
  const enter = pr(t, a + 0.2, a + 1.0, back);
  const hits = [a + 1.5, a + 2.9, a + 4.2];
  const fill = hits.reduce((s, h) => s + pr(t, h + 0.9, h + 1.2) * 0.34, 0);
  const caps = hits.map((h, i) => {
    const k = pr(t, h, h + 0.9, sine);
    if (k <= 0 || k >= 1) return null;
    const x = lerp(250, 540, k), y = lerp(640, 960, k) - Math.sin(k * Math.PI) * 120;
    return <L.Capsule key={i} cx={x} cy={y} s={0.8} rot={lerp(-20, 40, k)} />;
  });
  const pop = hits.reduce((s, h) => s + Math.sin(pr(t, h + 0.9, h + 1.5, sine) * Math.PI) * 0.06, 0);
  // bagian 2: perisai ke kiri, virus mencoba membuat salinan, kapsul menahan
  const mv = pr(t, b + 0.2, b + 1.2, sine);
  const shX = lerp(540, 250, mv), shY = lerp(960, 1050, mv), shS = lerp(1.5, 1.0, mv);
  const bottle = (1 - mv) * enter;
  const vIn = pr(t, b + 0.5, b + 1.4, back);
  const budGrow = pr(t, b + 1.4, b + 3.0, sine); // salinan mulai terbentuk
  const stop = pr(t, b + 3.0, b + 3.9, sine); // kapsul menahan, salinan surut
  const bud = budGrow * (1 - stop * 0.8);
  const capK = pr(t, b + 2.6, b + 3.6, sine);
  return (
    <>
      <L.PillBottle cx={250} cy={640} s={1.4 * enter} op={bottle} rot={-12} />
      {caps}
      <L.Shield cx={shX} cy={shY} s={(shS + pop) * (0.75 + 0.25 * enter)} op={lerp(0.35, 1, Math.min(1, fill))} />
      <Virus x={620} y={1050} r={85 * vIn} t={t} />
      <Virus x={lerp(640, 850, budGrow)} y={1050} r={70 * bud} dim={0.4 * Math.min(1, bud * 3)} t={t} seed={3} />
      {capK > 0 && <L.Capsule cx={lerp(shX + 70, 760, capK)} cy={1050 - Math.sin(capK * Math.PI) * 60} s={0.85} rot={lerp(0, 90, capK)} op={Math.min(1, capK * 3)} />}
    </>
  );
};

// ---- Adegan 3 (kalimat 5-7): kapsul diminum -> kadar naik; waktu berjalan -> turun; dosis berikut -> naik lagi
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const s5 = T(5), s6 = T(6), s7 = T(7);
  const enter = pr(t, s5 - 0.1, s5 + 0.6, back);
  const progress = keyed(t, [[s5 + 0.2, 0], [s5 + 1.9, 1], [s6, 1], [s7 - 0.2, 4], [s7 + 1.6, 5], [s7 + 5.0, 7.3]]) / 8;
  const d1 = pr(t, s5 + 0.2, s5 + 1.3, in3);
  const d2 = pr(t, s7 + 0.1, s7 + 1.2, in3);
  // jam realistis: dosis sekali sehari. Tiap titik grafik = 6 jam; dosis 1 di jam 0, dosis 2 setelah 24 jam (jarum pendek 2 putaran)
  const hour = Math.max(0, 6 * (progress * 8 - 1));
  return (
    <>
      <L.LineChart cx={540} cy={800} s={enter} op={enter} w={840} h={520} points={[0.05, 0.9, 0.74, 0.58, 0.42, 0.92, 0.76, 0.6, 0.46]} threshold={0.35} progress={progress} />
      {d1 > 0 && d1 < 1 && <L.Capsule cx={lerp(360, 255, d1)} cy={lerp(420, 760, d1)} s={0.8} rot={-30 + d1 * 60} op={1 - d1 * 0.5} />}
      {d2 > 0 && d2 < 1 && <L.Capsule cx={lerp(600, 585, d2)} cy={lerp(420, 640, d2)} s={0.8} rot={-30 + d2 * 60} op={1 - d2 * 0.5} />}
      <L.Clock cx={540} cy={1230} s={1.15 * enter} op={enter} frac={0} hour={hour} />
    </>
  );
};

// ---- Adegan 4 (kalimat 8-10): dosis terlewat -> kadar jatuh di bawah batas -> virus menyalin -> varian tahan obat
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const s8 = T(8), s9 = T(9), s10 = T(10);
  const enter = pr(t, s8 - 0.1, s8 + 0.6, back);
  const progress = keyed(t, [[s8 + 0.3, 0], [s9 + 0.6, 4.4], [s10, 5.6], [s10 + 4, 6]]) / 6;
  const cross = pr(t, s8 + 1.4, s8 + 2.1, back);
  const cv = pr(t, s9 + 0.1, s9 + 1.0, back); // virus muncul
  const act = pr(t, s9 + 0.4, s9 + 2.4, sine);
  const cp = pr(t, s9 + 1.4, s9 + 2.6, back);
  // s10: kapsul menekan salinan kiri (mengecil), salinan kanan menolak -> kapsul memantul
  const hitL = pr(t, s10 + 0.4, s10 + 1.6, sine);
  const hitR = pr(t, s10 + 2.2, s10 + 3.8, sine);
  const capLx = lerp(120, 300, hitL) - (hitL > 0.98 ? 0 : 0);
  const capLop = hitL > 0 && hitL < 1 ? 1 : pr(t, s10 + 1.6, s10 + 2.2) < 1 && hitL >= 1 ? 1 - pr(t, s10 + 1.6, s10 + 2.0) : 0;
  const capR = t >= s10 + 2.2 && t <= s10 + 4.4 ? hitR : -1;
  const bounce = capR < 0 ? 0 : capR < 0.5 ? capR * 2 : 1 - (capR - 0.5) * 2;
  const leftShrink = hitL;
  const rightPulse = 1 + 0.08 * Math.sin(pr(t, s10 + 3.0, s10 + 3.8) * Math.PI);
  return (
    <>
      <L.LineChart cx={540} cy={600} s={enter} op={enter} w={840} h={380} points={[0.9, 0.74, 0.58, 0.42, 0.26, 0.14, 0.08]} threshold={0.35} progress={progress} />
      <L.Blister cx={300} cy={1330} s={0.95 * enter} op={enter} taken={2} />
      <L.CrossBadge cx={430} cy={1270} s={0.55 * cross} op={cross} />
      <Virus x={540} y={1010} r={lerp(50, 82, act) * cv} dim={lerp(0.5, 1, act)} t={t} />
      <Virus x={290} y={1040} r={lerp(70, 40, leftShrink) * cp} dim={cp * lerp(1, 0.5, leftShrink)} t={t} seed={1} />
      <Virus x={800} y={1040} r={70 * cp * rightPulse} dim={cp} t={t} seed={2} />
      {hitL > 0 && hitL < 1 && <L.Capsule cx={capLx} cy={1040} s={0.8} rot={hitL * 90} />}
      {capR >= 0 && <L.Capsule cx={lerp(560, 690, bounce)} cy={1040} s={0.8} rot={bounce * 120} />}
    </>
  );
};

// ---- Adegan 5 (kalimat 11-12): sekali lupa (obat masih bekerja) vs kebiasaan lupa (risiko naik)
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const s11 = T(11), s12 = T(12);
  const enter = pr(t, s11 - 0.1, s11 + 0.7, back);
  const one = pr(t, s11 + 0.7, s11 + 1.4, back);
  const many = Math.floor(pr(t, s12 + 0.3, s12 + 3.6, sine) * 9.999);
  const marks = [9, ...[3, 12, 16, 5, 19, 10, 23, 14, 26, 7].slice(0, many)].filter((m) => t >= s11 + 0.7);
  const capK = pr(t, s11 + 1.9, s11 + 3.0, sine);
  const rust = pr(t, s12 + 0.6, s12 + 4.4, sine);
  const gearIn = pr(t, s12 + 0.2, s12 + 1.0, back);
  const vx = lerp(540, 330, gearIn);
  const vr = lerp(50, 62, pr(t, s11, s11 + 2)) + 34 * rust;
  const vdim = lerp(0.5, 1, rust);
  const fail = pr(t, s12 + 4.0, s12 + 4.8, back);
  return (
    <>
      <L.Calendar cx={540} cy={760} s={1.55 * enter} op={enter} marks={marks} markColor={LIB_COL.bad} />
      <Virus x={vx} y={1170} r={vr * enter} dim={vdim} t={t} />
      {capK > 0 && capK < 1 && <L.Capsule cx={lerp(120, vx - 60, capK)} cy={1170 - Math.sin(capK * Math.PI) * 40} s={0.8} rot={capK * 60} op={1 - pr(t, s11 + 2.8, s11 + 3.0)} />}
      <L.Gear cx={760} cy={1170} s={0.95 * gearIn} op={gearIn} rust={rust} />
      <L.CrossBadge cx={850} cy={1060} s={0.6 * fail} op={fail} />
    </>
  );
};

// ---- Adegan 6 (kalimat 13-14): jadwal teratur; bukan tiap detik, tapi kadar terjaga di atas batas; virus tetap tertekan
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const s13 = T(13), s14 = T(14);
  const enter = pr(t, s13 - 0.1, s13 + 0.7, back);
  const drops = [s13 + 0.8, s13 + 1.9, s13 + 3.0];
  const days = drops.filter((h) => t >= h + 0.8).length; // satu tanda per kapsul = satu hari
  const dayF = Math.min(3, Math.max(0, (t - drops[0]) / 1.1)); // 1 hari = 24 jam = 2 putaran jarum pendek
  const capDrops = drops.map((h, i) => {
    const k = pr(t, h, h + 0.9, sine);
    return k > 0 && k < 1 ? <L.Capsule key={i} cx={lerp(300, 700, k)} cy={880 - Math.sin(k * Math.PI) * 120} s={0.7} rot={k * 120} /> : null;
  });
  const swap = pr(t, s14 + 0.1, s14 + 1.0, sine); // kalender & kapsul keluar, kembali ke satu jam
  const spin = pr(t, s14 + 0.3, s14 + 2.2, sine);
  const noX = pr(t, s14 + 2.0, s14 + 2.7, back);
  const toChart = pr(t, s14 + 2.8, s14 + 3.6, sine);
  const ch = pr(t, s14 + 3.3, s14 + 7.0, sine);
  const vy = pr(t, s14 + 5.4, s14 + 6.4, back);
  return (
    <>
      <L.Clock cx={lerp(300, 540, swap) * (1 - toChart) + lerp(540, 270, toChart) * toChart} cy={lerp(760, 800, swap) * (1 - toChart) + 560 * toChart} s={lerp(1.3, 1.2, swap) * (1 - toChart * 0.45)} op={enter} frac={0} hour={t < s14 ? 24 * dayF : 72 + 48 * spin} />
      <L.Calendar cx={700} cy={760} s={1.3 * enter} op={enter * (1 - swap)} marks={Array.from({ length: days }, (_, i) => i)} markColor={LIB_COL.good} />
      {capDrops}
      <L.CrossBadge cx={640} cy={720} s={0.6 * noX} op={noX * (1 - toChart)} />
      <L.LineChart cx={540} cy={1020} s={toChart} op={toChart} w={860} h={420} points={[0.55, 0.92, 0.72, 0.52, 0.92, 0.72, 0.52, 0.92, 0.72, 0.52]} threshold={0.35} progress={ch} />
      <Virus x={540} y={1300} r={46 * vy} dim={0.5 * vy} t={t} />
    </>
  );
};

const PILLS: { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number }[] = [
  { a: T(8) + 1.5, b: T(9), text: 'dosis terlewat', k: 'neutral', x: 540, y: 1190, size: 38 },
  { a: T(10) + 3.4, b: T(11) - 0.05, text: 'tahan obat', k: 'virus', x: 800, y: 1170, size: 40 },
  { a: T(12) + 4.8, b: T(13), text: 'pengobatan', k: 'neutral', x: 760, y: 1320, size: 38 },
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
export const S1E5Full: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = gradAt(t);
  const cue = CUES.find((c) => t >= c.a - 0.05 && t < c.b);
  const ck = cue ? Math.min(1, (t - cue.a + 0.05) / 0.18) : 0;
  const subOn = t < CLOSE - 0.05;
  const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];
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
          <LegendBox t={t} a={0.4} b={5.0} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(4) + 0.1} b={T(4) + 4.6} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(5) + 0.3} b={T(8) - 0.3} items={[[LIB_COL.good, 'Kadar obat'], [LIB_COL.bad, 'Batas cukup']]} />
          <LegendBox t={t} a={T(8) + 0.3} b={T(11) - 0.3} items={[[LIB_COL.good, 'Kadar obat'], [LIB_COL.bad, 'Batas cukup'], ['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(14) + 3.3} b={CLOSE - 0.8} items={[[LIB_COL.good, 'Kadar obat'], [LIB_COL.bad, 'Batas cukup']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile('vo/S1E5.mp3')} />
    </AbsoluteFill>
  );
};

