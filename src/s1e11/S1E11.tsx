import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T, T, WA, WB, EP_DUR } from './timeline';

export const S1E11_FRAMES = Math.ceil(EP_DUR * FPS);

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

World Health Organization. Consolidated guidelines on HIV testing services, 2019. Geneva: WHO; 2020.
https://bigg-rec.bvsalud.org/en/recommendations/f978322f83a354e4a3e8b83579ea9a19a87d5e6d

HIV.gov. HIV Testing Overview. Diperbarui 27 Mei 2026.
https://www.hiv.gov/hiv-basics/hiv-testing/learn-about-hiv-testing/hiv-testing-overview

Kementerian Kesehatan RI. Percepat Identifikasi, Perluas Pengobatan, dan Hapus Stigma untuk Akhiri HIV pada 2030.
https://www.kemkes.go.id/id/percepat-identifikasi-perluas-pengobatan-dan-hapus-stigma-untuk-akhiri-hiv-pada-2030

Branson, B. M., et al. Revised recommendations for HIV testing of adults, adolescents, and pregnant women in health-care settings. MMWR Recomm Rep. 2006;55(RR-14):1-17.`;

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
const B1: Grad = ['#0A1F3D', '#123A60', '#17506F'];
const B2: Grad = ['#0D1B45', '#1E2F6B', '#2B4A85'];
const B3: Grad = ['#14183F', '#2A2A6B', '#3B4A8A'];
const B4: Grad = ['#08283A', '#0F4A5C', '#167A80'];
const BG: Grad[] = [B1, B2, B3, B4, B1, B3, B2, B4, B1, B3, B4, B2]; // 12 adegan

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
  nrti: '#72E3D3', nnrti: '#72E3D3', pep: '#72E3D3', tld: '#72E3D3', prep: '#72E3D3', tbc: '#FFB7A5',
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

const GREEN = '#7ED6A8';
const TEAL = '#72E3D3';
const VIRUSC = '#FF9C85';

const Warn: React.FC<{ cx: number; cy: number; s?: number; op?: number }> = ({ cx, cy, s = 1, op = 1 }) =>
  op < 0.01 || s < 0.02 ? null : (
    <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={op}>
      <path d="M 0 -78 L 78 56 Q 86 72 66 72 H -66 Q -86 72 -78 56 Z" fill="#F4D77E" />
      <rect x={-8} y={-30} width={16} height={56} rx={8} fill="#4A3606" />
      <circle cx={0} cy={46} r={9} fill="#4A3606" />
    </g>
  );

const Card: React.FC<{ cx: number; cy: number; w: number; h: number; op?: number; s?: number }> = ({ cx, cy, w, h, op = 1, s = 1 }) =>
  op < 0.01 ? null : <rect x={cx - (w * s) / 2} y={cy - (h * s) / 2} width={w * s} height={h * s} rx={44} fill="#fff" fillOpacity={0.12} opacity={op} />;

const Big: React.FC<{ x: number; y: number; text: string; size: number; op: number; sc?: number; fill?: string }> = ({ x, y, text, size, op, sc = 1, fill = '#FFFFFF' }) =>
  op < 0.01 ? null : (
    <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={fill} opacity={op} transform={`translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}>
      {text}
    </text>
  );

// ---- Adegan 1 (k1): hook. Kalender terisi tanda hari, jam berputar, lalu alat tes muncul: kapan harus tes?
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const cal = pr(t, 0.1, 0.8, back), clk = pr(t, 0.4, 1.1, back), kit = pr(t, WA(1, 'tes') - 0.2, WA(1, 'tes') + 0.5, back);
  const sweep = pr(t, 0.6, 2.6, sine);
  const marks = [3, 10, 17, 24, 31].filter((_, i) => t >= 0.8 + i * 0.3);
  const q = pr(t, 0.2, 0.9, back);
  return (
    <>
      <Big x={540} y={560} text="?" size={240} op={q} sc={0.7 + 0.3 * q} />
      <L.Calendar cx={290} cy={790} s={1.5 * cal} op={cal} marks={marks} markColor={TEAL} />
      <L.Clock cx={790} cy={790} s={1.5 * clk} op={clk} frac={Math.max(0.02, 0.96 * sweep)} hour={3 + 3 * sweep} />
      <L.TestKit cx={540} cy={1170} s={0.9 * kit} op={kit} lines={1} />
    </>
  );
};

// ---- Adegan 2 (k2-4): analogi kendaraan: mobil melaju; "rutin" = kalender + centang; "setelah kejadian" = tanda bahaya, mobil mengerem, lalu diperiksa; lalu giliran orang dengan tes HIV
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const s2 = T(2), s4 = T(4);
  const rutin = WA(3, 'rutin'), setelah = WA(3, 'setelah'), kejadian = WA(3, 'kejadian'), tertentu = WA(3, 'tertentu');
  const road = pr(t, s2 - 0.1, s2 + 0.5);
  const drive = pr(t, s2 + 0.1, s2 + 1.9, sine);
  const stop = pr(t, setelah + 0.1, kejadian + 0.3, sine);
  const carX = lerp(-180, 330, drive) + 150 * stop;
  const bump = Math.sin(pr(t, kejadian + 0.1, kejadian + 0.5) * Math.PI * 2) * 7;
  const cal = pr(t, rutin - 0.2, rutin + 0.5, back);
  const marks = [4, 11, 18, 25].filter((_, i) => t >= rutin + i * 0.2);
  const ck1 = pr(t, rutin + 0.3, rutin + 0.9, back) * (1 - pr(t, setelah, setelah + 0.3));
  const warn = pr(t, setelah, setelah + 0.5, back);
  const ck2 = pr(t, tertentu, tertentu + 0.5, back);
  const carOut = 1 - pr(t, s4 - 0.1, s4 + 0.6);
  const person = pr(t, s4 + 0.2, s4 + 0.9, back);
  const kit = pr(t, WA(4, 'tes') + 0.1, WA(4, 'tes') + 0.8, back);
  const ok = pr(t, WA(4, 'begitu') + 0.2, WA(4, 'begitu') + 0.8, back);
  const px = lerp(1100, 330, pr(t, s4 + 0.1, s4 + 0.9, sine));
  return (
    <>
      <g opacity={carOut}>
        <L.Road cx={540} cy={1120} s={road} op={road} w={1000} h={260} />
        <L.Car cx={carX} cy={1090 + bump} s={1.6 * pr(t, s2, s2 + 0.3)} />
        <L.Calendar cx={290} cy={640} s={1.1 * cal} op={cal} marks={marks} markColor={TEAL} />
        <L.CheckBadge cx={carX} cy={850} s={0.62 * ck1} op={ck1} />
        <Warn cx={830} cy={1000} s={0.9 * warn} op={warn} />
        <L.CheckBadge cx={carX} cy={850} s={0.62 * ck2} op={ck2} />
      </g>
      <L.Person cx={px} cy={1020} s={1.9 * person} op={person} />
      <L.TestKit cx={790} cy={1040} s={1.1 * kit} op={kit} lines={1} />
      <L.CheckBadge cx={790} cy={740} s={0.7 * ok} op={ok} />
    </>
  );
};

// ---- Adegan 3 (k5-6): kontak berisiko -> jam 72 jam -> PEP (tablet ARV) melindungi
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const s5 = T(5), s6 = T(6);
  const kontak = WA(5, 'kontak'), lewat = WA(6, 'lewat'), jam = WB(6, 'jam'), pep = WA(6, 'PEP'), obat = WA(6, 'obat'), darurat = WA(6, 'darurat');
  const a = pr(t, s5, s5 + 0.7, back), b = pr(t, s5 + 0.1, s5 + 0.8, back);
  const meet = pr(t, kontak, kontak + 1.0, sine);
  const bx = lerp(800, 640, meet), ax = lerp(280, 440, meet);
  const vk = pr(t, kontak + 0.4, kontak + 1.3, sine);
  const warn = pr(t, kontak + 1.0, kontak + 1.6, back) * (1 - pr(t, s6 - 0.1, s6 + 0.4));
  const bOut = 1 - pr(t, s6 - 0.1, s6 + 0.5);
  const slide = pr(t, s6, s6 + 0.9, sine);
  const aX = lerp(ax, 290, slide);
  const clk = pr(t, s6 + 0.2, s6 + 0.9, back);
  const sweep = pr(t, lewat, jam, sine);
  const cap = pr(t, pep, pep + 0.6, back);
  const capGo = pr(t, obat, darurat + 0.2, sine);
  const shield = pr(t, darurat, darurat + 0.7, back);
  const vOn = pr(t, kontak + 0.3, kontak + 0.6);
  const vFade = 1 - pr(t, darurat, darurat + 0.6);
  return (
    <>
      <L.Person cx={aX} cy={1050} s={1.8 * a} op={a} />
      <g opacity={bOut}>
        <L.Person cx={bx} cy={1050} s={1.8 * b} op={b} color="#B9A2F5" />
      </g>
      <Virus x={lerp(bx - 10, ax + 60, vk)} y={lerp(1050, 1060, vk) - 80 * Math.sin(vk * Math.PI)} r={26 * vOn} dim={0.95 * (bOut > 0.5 ? 1 : vFade)} t={t} />
      <Warn cx={540} cy={760} s={0.95 * warn} op={warn} />
      <L.Clock cx={640} cy={760} s={1.5 * clk} op={clk} frac={Math.max(0.02, 0.78 * sweep)} hour={4} />
      <L.Tablet cx={lerp(860, aX + 100, capGo)} cy={lerp(1040, 1010, capGo)} s={1.5 * cap} rot={lerp(-25, 0, capGo)} op={cap * (1 - pr(t, darurat + 0.6, darurat + 1.0))} />
      <L.Shield cx={aX} cy={1010} s={1.75 * shield} op={0.55 * shield} />
    </>
  );
};

// ---- Adegan 4 (k7): masa jendela: kadar virus naik sampai melewati batas deteksi alat tes, lalu tes mampu mendeteksi
const WIN_P = 0.63;
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const s7 = T(7);
  const mampu = WA(7, 'mampu'), mendeteksi = WA(7, 'mendeteksi');
  const chart = pr(t, s7, s7 + 0.8, back);
  const p0 = s7 + 0.6, p1 = p0 + (mampu - p0) / WIN_P; // kurva melewati batas tepat di kata "mampu"
  const prog = pr(t, p0, p1, (x) => x);
  const bandW = Math.min(prog, WIN_P) * 772;
  const kit = pr(t, mendeteksi, mendeteksi + 0.6, back);
  return (
    <>
      <L.LineChart cx={540} cy={880} s={chart} op={chart} w={860} h={380} color={VIRUSC} threshold={0.3} points={[0.02, 0.03, 0.07, 0.16, 0.34, 0.58, 0.82]} progress={prog} />
      {chart > 0.5 && <rect x={154} y={730} width={bandW} height={300} rx={24} fill="#F4D77E" opacity={0.22} />}
      <L.TestKit cx={540} cy={1275} s={0.85 * kit} op={kit} lines={2} />
      <L.CheckBadge cx={760} cy={1250} s={0.5 * pr(t, mendeteksi + 0.4, mendeteksi + 1.0, back)} op={pr(t, mendeteksi + 0.4, mendeteksi + 1.0)} />
    </>
  );
};

// ---- Adegan 5 (k8-9): risiko berlanjut -> tes berkala (alat tes muncul berurutan); pengguna PrEP -> garis waktu tiga bulan -> tes
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const s8 = T(8), s9 = T(9);
  const risiko = WA(8, 'risiko'), berkala = WA(8, 'berkala');
  const prep = WA(9, 'PrEP'), tiga = WA(9, 'tiga'), bulan = WB(9, 'bulan');
  const a = pr(t, s8, s8 + 0.7, back);
  const v = pr(t, risiko, risiko + 0.6, back);
  const kitsOut = 1 - pr(t, s9 - 0.1, s9 + 0.5);
  const xs = [520, 700, 880];
  const cap = pr(t, prep, prep + 0.6, back);
  const bar = pr(t, tiga - 0.3, tiga + 0.3, back);
  const k = pr(t, tiga, bulan, (x) => x);
  const months = Math.min(3, Math.floor(k * 3.02));
  const kit = pr(t, bulan - 0.1, bulan + 0.5, back);
  const x0 = 150, x1 = 930;
  return (
    <>
      <L.Person cx={290} cy={900} s={1.7 * a} op={a} />
      <Virus x={470} y={980} r={26 * v} dim={0.95} t={t} />
      <g opacity={kitsOut}>
        {xs.map((x, i) => {
          const q = pr(t, berkala + i * 0.55, berkala + 0.6 + i * 0.55, back);
          return <L.TestKit key={i} cx={x} cy={900} s={0.7 * q} op={q} lines={1} />;
        })}
      </g>
      <L.Tablet cx={500} cy={790} s={1.4 * cap} rot={-20} op={cap} />
      <Big x={700} y={640} text="3 bulan" size={104} op={bar} />
      <rect x={x0} y={1080} width={x1 - x0} height={24} rx={12} fill="#fff" fillOpacity={0.18} opacity={bar} />
      <rect x={x0} y={1080} width={Math.max(24, (x1 - x0) * k)} height={24} rx={12} fill={TEAL} opacity={bar} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={x0 + ((x1 - x0) * i) / 3} cy={1092} r={i <= months ? 15 : 8} fill={i <= months ? '#FFFFFF' : LIB_COL.track} opacity={bar} />
      ))}
      <L.TestKit cx={870} cy={850} s={0.75 * kit} op={kit} lines={1} />
    </>
  );
};

// ---- Adegan 6 (k10): tiga keadaan: hamil, gejala, TBC -> semuanya mengarah ke tes
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const s10 = T(10);
  const hamil = WA(10, 'hamil'), gejala = WA(10, 'gejala'), tbc = WA(10, 'TBC');
  const q = (a: number) => pr(t, a, a + 0.6, back);
  const m = q(hamil - 0.1), g = q(gejala - 0.1), b = q(WA(10, 'didiagnosis') - 0.1);
  const link = pr(t, WB(10, 'TBC') - 0.3, WB(10, 'TBC') + 0.4, sine);
  const kit = pr(t, WB(10, 'TBC') - 0.1, WB(10, 'TBC') + 0.6, back);
  const xs = [210, 540, 870];
  const fade = pr(t, s10, s10 + 0.5);
  void tbc;
  return (
    <>
      <Big x={540} y={600} text="Ketiga" size={80} op={fade * (1 - pr(t, hamil - 0.2, hamil + 0.2))} />
      <Card cx={xs[0]} cy={830} w={300} h={400} op={m} s={m} />
      <Card cx={xs[1]} cy={830} w={300} h={400} op={g} s={g} />
      <Card cx={xs[2]} cy={830} w={300} h={400} op={b} s={b} />
      <L.MotherBaby cx={xs[0]} cy={800} s={1.2 * m} op={m} />
      <L.Person cx={xs[1]} cy={830} s={1.3 * g} op={g} />
      <L.SpeechBubble cx={xs[1] + 40} cy={690} s={0.5 * g} op={g} w={200} />
      <L.Document cx={xs[2]} cy={810} s={1.2 * b} op={b} />
      {xs.map((x, i) => (
        <line key={i} x1={x} y1={1070} x2={lerp(x, 540, link)} y2={lerp(1070, 1150, link)} stroke="#fff" strokeOpacity={0.45} strokeWidth={8} strokeLinecap="round" strokeDasharray="4 18" opacity={link} />
      ))}
      <L.TestKit cx={540} cy={1290} s={0.85 * kit} op={kit} lines={1} />
    </>
  );
};

// ---- Adegan 7 (k11-12): kartu penjelas CDC; usia 13-64 tahun, tes setidaknya sekali; lalu pertanyaan "mengapa penting?"
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const s12 = T(12);
  const cdc = WA(11, 'CDC'), usia = WA(11, '13–64'), tahun = WB(11, 'tahun'), sekali = WA(11, 'sekali');
  const card = pr(t, cdc, cdc + 0.6, back);
  const num = pr(t, usia, usia + 0.6, back);
  const k = pr(t, usia, tahun, (x) => x);
  const bar = pr(t, usia - 0.1, usia + 0.4, back);
  const xs = [210, 375, 540, 705, 870];
  const grpOut = 1 - pr(t, s12 - 0.1, s12 + 0.4);
  const chk = pr(t, sekali, sekali + 0.6, back);
  const q = pr(t, s12, s12 + 0.8, back);
  const wob = Math.sin((t - s12) * 5) * 4 * q;
  return (
    <>
      <g opacity={grpOut}>
        <g opacity={card} transform={`translate(0 ${(1 - card) * 24})`}>
          <rect x={90} y={380} width={900} height={290} rx={44} fill="#fff" fillOpacity={0.14} />
          <text x={540} y={475} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={84} fill="#8FBDF7">CDC</text>
          <text x={540} y={535} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill="#FFFFFF">Centers for Disease Control</text>
          <text x={540} y={579} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill="#FFFFFF">and Prevention</text>
          <text x={540} y={632} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={30} fill="#EAF2FB">lembaga kesehatan masyarakat Amerika Serikat</text>
        </g>
        <Big x={540} y={800} text="13–64 tahun" size={96} op={num} sc={0.85 + 0.15 * num} />
        <rect x={150} y={1150} width={780} height={22} rx={11} fill="#fff" fillOpacity={0.18} opacity={bar} />
        <rect x={150} y={1150} width={Math.max(22, 780 * k)} height={22} rx={11} fill={TEAL} opacity={bar} />
        {xs.map((x, i) => {
          const p = pr(t, usia + i * 0.25, usia + 0.5 + i * 0.25, back);
          return <L.Person key={i} cx={x} cy={975} s={1.0 * p} op={p} kid={i === 0} color={['#8FBDF7', '#B9A2F5', '#F4D77E', '#7ED6A8', '#FF9C85'][i]} />;
        })}
        <L.CheckBadge cx={540} cy={1255} s={0.6 * chk} op={chk} />
      </g>
      <Big x={540} y={1010 + wob} text="?" size={640} op={0.95 * q} sc={0.6 + 0.4 * q} />
    </>
  );
};

// ---- Adegan 8 (k13): 100 orang dengan HIV; titik teal bertambah sampai 68 (yang tahu status), sisanya abu
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const yrW = WA(13, '2025'), kem = WA(13, 'Kemenkes'), baru = WA(13, 'baru'), persen = WB(13, 'persen');
  const yr = pr(t, yrW, yrW + 0.6, back);
  const doc = pr(t, kem - 0.2, kem + 0.5, back);
  const fillK = pr(t, baru + 0.2, persen, (x) => x);
  const n = Math.round(68 * fillK);
  const pct = pr(t, baru + 0.2, baru + 0.7);
  return (
    <>
      <Big x={290} y={620} text="2025" size={120} op={yr} sc={0.85 + 0.15 * yr} />
      <L.Document cx={820} cy={570} s={0.7 * doc} op={doc} kind="paper" stamp />
      {Array.from({ length: 100 }, (_, i) => {
        const r = Math.floor(i / 10), c = i % 10;
        const appear = pr(t, kem + 0.2 + i * 0.01, kem + 0.6 + i * 0.01, back);
        const on = i < n;
        return <circle key={i} cx={540 + (c - 4.5) * 62} cy={1030 + (r - 4.5) * 56 - 10} r={21 * appear} fill={on ? TEAL : '#B9C3D0'} opacity={on ? 1 : 0.55 * appear} />;
      })}
      <Big x={540} y={1370} text={`${n}%`} size={90} op={pct} fill={TEAL} />
    </>
  );
};

// ---- Adegan 9 (k14-15): hasil negatif terlalu dini (virus belum terbaca) -> tanda tanya; lalu kalender masa jendela -> tes ulang
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const s14 = T(14), s15 = T(15);
  const neg = WA(14, 'negatif'), belum = WA(14, 'belum'), diulang = WA(15, 'diulang'), jendela = WA(15, 'masa'), berakhir = WA(15, 'berakhir');
  const a = pr(t, s14, s14 + 0.7, back);
  const v = pr(t, neg, neg + 0.5, back);
  const kit = pr(t, neg, neg + 0.7, back);
  const ok = pr(t, WB(14, 'negatif'), WB(14, 'negatif') + 0.5, back) * (1 - pr(t, belum, belum + 0.3));
  const q = pr(t, belum + 0.2, belum + 0.8, back);
  const out = 1 - pr(t, s15 - 0.1, s15 + 0.4);
  const cal = pr(t, s15 + 0.1, s15 + 0.8, back);
  const marks = [2, 5, 8, 11, 14, 17, 20].filter((_, i) => t >= jendela + i * 0.12);
  const kit2 = pr(t, berakhir, berakhir + 0.6, back);
  const spin = pr(t, diulang, diulang + 1.0, sine);
  return (
    <>
      <g opacity={out}>
        <L.Person cx={300} cy={1010} s={1.8 * a} op={a} />
        <Virus x={335} y={1045} r={26 * v} dim={0.6} t={t} />
        <L.TestKit cx={780} cy={1010} s={1.1 * kit} op={kit} lines={1} />
        <L.CheckBadge cx={780} cy={720} s={0.7 * ok} op={ok} />
        <L.SpeechBubble cx={800} cy={700} s={0.9 * q} op={q} text="?" w={170} />
      </g>
      <L.Calendar cx={540} cy={700} s={1.6 * cal} op={cal} marks={marks} markColor={TEAL} />
      <L.TestKit cx={300} cy={1100} s={0.9 * cal} op={0.5 * cal} lines={1} />
      <g transform={`translate(540 1100) rotate(${spin * 360})`} opacity={pr(t, diulang - 0.1, diulang + 0.3)}>
        <path d="M -60 0 A 60 60 0 1 1 0 60" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
        <polygon points="-16,38 18,64 -6,86" fill="#fff" />
      </g>
      <L.TestKit cx={780} cy={1100} s={1.0 * kit2} op={kit2} lines={1} />
    </>
  );
};

// ---- Adegan 10 (k16): tempat tes: puskesmas, rumah sakit, klinik, layanan komunitas
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const cl = [WA(16, 'puskesmas'), WA(16, 'rumah'), WA(16, 'klinik'), WA(16, 'komunitas')];
  const pos: [number, number][] = [[300, 760], [780, 760], [300, 1130], [780, 1130]];
  return (
    <>
      {pos.map(([x, y], i) => {
        const q = pr(t, cl[i] - 0.1, cl[i] + 0.5, back);
        const kit = pr(t, cl[i] + 0.4, cl[i] + 1.0, back);
        return (
          <React.Fragment key={i}>
            <Card cx={x} cy={y} w={420} h={320} op={q} s={q} />
            {i === 3 ? <L.Group cx={x} cy={y - 10} s={0.8 * q} op={q} n={3} /> : <L.Clinic cx={x} cy={y - 10} s={(i === 1 ? 1.0 : 0.85) * q} op={q} />}
            <L.TestKit cx={x + 150} cy={y + 90} s={0.32 * kit} op={kit} lines={1} />
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---- Adegan 11 (k17): tahu status lebih cepat -> ARV (tablet) lebih cepat dimulai
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const s17 = T(17);
  const status = WA(17, 'status'), cepat = WA(17, 'cepat'), arv = WA(17, 'ARV'), mulai = WB(17, 'dimulai');
  const a = pr(t, s17, s17 + 0.7, back);
  const kit = pr(t, WA(17, 'mengetahui'), WA(17, 'mengetahui') + 0.6, back);
  const doc = pr(t, status, status + 0.6, back);
  const clk = pr(t, cepat - 0.4, cepat + 0.3, back);
  const sweep = pr(t, cepat, arv, sine);
  const cap = pr(t, arv - 0.9, mulai, sine);
  const heart = pr(t, mulai - 0.1, mulai + 0.5, back);
  const gone = pr(t, arv - 0.9, arv - 0.4);
  return (
    <>
      <L.Person cx={290} cy={1040} s={1.9 * a} op={a} />
      <L.Clock cx={640} cy={680} s={1.2 * clk} op={clk} frac={Math.max(0.02, 0.96 * sweep)} hour={2 + 8 * sweep} />
      <L.TestKit cx={820} cy={1060} s={1.0 * kit * (1 - gone)} op={kit * (1 - gone)} lines={1} />
      <L.Document cx={400} cy={780} s={0.9 * doc} op={doc * (1 - pr(t, arv, arv + 0.5))} stamp />
      <L.Tablet cx={lerp(1150, 420, cap)} cy={lerp(1000, 1040, cap)} s={1.5} rot={lerp(-25, 0, cap)} op={pr(t, arv - 0.9, arv - 0.5) * (1 - heart)} />
      <L.Heart cx={290} cy={1000} s={0.6 * heart} op={heart} color={GREEN} />
    </>
  );
};

// ---- Adegan 12 (k18): jangan tunggu sakit: gejala dicoret, tes sebagai jalan
const Scene12: React.FC<{ t: number }> = ({ t }) => {
  const s18 = T(18);
  const sakit = WA(18, 'sakit'), tes = WA(18, 'tes'), hiv = WA(18, 'HIV');
  const a = pr(t, s18, s18 + 0.7, back);
  const bub = pr(t, sakit - 0.2, sakit + 0.4, back);
  const x = pr(t, sakit + 0.3, sakit + 0.9, back);
  const kit = pr(t, tes - 0.1, tes + 0.6, back);
  const ok = pr(t, hiv, hiv + 0.6, back);
  return (
    <>
      <L.Person cx={300} cy={1030} s={1.9 * a} op={a} />
      <L.SpeechBubble cx={400} cy={680} s={bub} op={bub} text="sakit" w={260} />
      <L.CrossBadge cx={400} cy={680} s={0.8 * x} op={x} />
      <L.TestKit cx={800} cy={1040} s={1.1 * kit} op={kit} lines={1} />
      <L.CheckBadge cx={800} cy={740} s={0.7 * ok} op={ok} />
    </>
  );
};

// Pill label hemat (README): hanya istilah kunci / penanda ikon yang tidak jelas dari bentuknya. Kalimat yang sudah jelas di narasi/subtitle tidak diulang.
const PILLS: { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number }[] = [
  { a: WB(6, 'jam') - 0.5, b: WA(6, 'PEP'), text: '72 jam', k: 'neutral', x: 640, y: 540, size: 54 },
  { a: WA(6, 'PEP'), b: T(7) - 0.2, text: 'PEP', k: 'arv', x: 860, y: 1180, size: 50 },
  { a: WA(7, 'masa'), b: WA(7, 'mampu') + 0.8, text: 'masa jendela', k: 'recep', x: 540, y: 540, size: 48 },
  { a: WA(9, 'PrEP') + 0.1, b: T(10) - 0.2, text: 'PrEP', k: 'arv', x: 290, y: 560, size: 50 },
  { a: WA(10, 'hamil') + 0.3, b: T(11) - 0.05, text: 'hamil', k: 'neutral', x: 210, y: 1005, size: 36 },
  { a: WA(10, 'gejala') + 0.3, b: T(11) - 0.05, text: 'gejala', k: 'neutral', x: 540, y: 1005, size: 36 },
  { a: WA(10, 'TBC') - 0.3, b: T(11) - 0.05, text: 'TBC', k: 'neutral', x: 870, y: 1005, size: 36 },
  { a: WA(13, 'Kemenkes') + 0.3, b: T(14) - 0.2, text: 'Kemenkes', k: 'neutral', x: 820, y: 690, size: 30 },
  { a: WA(15, 'diulang'), b: T(16) - 0.3, text: 'tes ulang', k: 'recep', x: 540, y: 1330, size: 44 },
  { a: WA(16, 'puskesmas') + 0.5, b: T(17) - 0.05, text: 'puskesmas', k: 'neutral', x: 300, y: 940, size: 32 },
  { a: WA(16, 'rumah') + 0.5, b: T(17) - 0.05, text: 'rumah sakit', k: 'neutral', x: 780, y: 940, size: 32 },
  { a: WA(16, 'klinik') + 0.5, b: T(17) - 0.05, text: 'klinik', k: 'neutral', x: 300, y: 1310, size: 32 },
  { a: WA(16, 'komunitas') + 0.5, b: T(17) - 0.05, text: 'komunitas', k: 'neutral', x: 780, y: 1310, size: 32 },
  { a: WA(17, 'ARV') + 0.3, b: T(18) - 0.2, text: 'ARV', k: 'arv', x: 540, y: 1300, size: 46 },
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
export const S1E11Full: React.FC = () => {
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
          <LegendBox t={t} a={WA(5, 'kontak') + 0.9} b={WA(5, 'kontak') + 5.0} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(7) + 0.3} b={T(8) - 0.2} items={[['#FF9C85', 'Kadar virus HIV'], ['#FF6B4D', 'Batas terdeteksi tes']]} />
          <LegendBox t={t} a={WA(8, 'risiko')} b={WA(8, 'risiko') + 3.5} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={WA(13, 'Kemenkes') + 0.2} b={T(14) - 0.2} items={[['#72E3D3', 'Sudah tahu status'], ['#B9C3D0', 'Belum tahu']]} />
          <LegendBox t={t} a={WA(14, 'negatif') + 0.2} b={T(15) - 0.3} items={[['#FF9C85', 'Virus HIV (belum terbaca tes)']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile("vo/S1E11.mp3")} />
    </AbsoluteFill>
  );
};
