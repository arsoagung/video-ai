import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T, T, CL, EP_DUR } from './timeline';

export const S2E1_FRAMES = Math.ceil(EP_DUR * FPS);

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

UNAIDS. Confronting discrimination: Overcoming HIV-related stigma and discrimination in health-care settings and beyond. Geneva: UNAIDS; 2017.

UNAIDS. New report on confronting stigma and discrimination in health-care settings (siaran pers, 3 Oktober 2017).
https://unaids.org/en/resources/presscentre/pressreleaseandstatementarchive/2017/october/20171002_confronting-discrimination`;

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
const BG: Grad[] = [B1, B1, B2, B3, B2, B4, B4, B4, B1, B4, B2];

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



const KAMU = '#B9A2F5'; // tokoh "kamu" (peran sama sepanjang episode)
const DOK = '#8FBDF7';
const GRP = ['#F4D77E', '#7ED6A8', '#8FBDF7'];
const GREEN = '#7ED6A8';
const Virus: React.FC<{ x: number; y: number; r: number; dim?: number; t: number; seed?: number }> = ({ x, y, r, dim = 1, t, seed = 0 }) =>
  r < 2 || dim < 0.01 ? null : <FlatVirus cx={x} cy={y} r={r} dim={dim} rot={t * 5 + seed * 40} />;
const pr = (t: number, a: number, b: number, e: (x: number) => number = out3) => ez(t, a, b, e);

const SceneWrap: React.FC<{ i: number; t: number; children: React.ReactNode }> = ({ i, t, children }) => {
  const o = win(t, SCENE_T[i], SCENE_T[i + 1] + 0.25, 0.45);
  if (o < 0.005) return null;
  return <g opacity={o}>{children}</g>;
};

// ---- Adegan 1 (kalimat 1-2): "kamu" menerima kertas hasil pemeriksaan; dokter berbicara, gelembung "positif HIV"
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const s2 = T(2), c1 = CL(2, 1);
  const me = pr(t, 0.2, 1.0, back);
  const doc = pr(t, 1.2, 2.4, sine); // kertas meluncur dari kanan ke tangan "kamu"
  const dr = pr(t, s2, s2 + 0.8, back);
  const bub = pr(t, c1, c1 + 0.7, back);
  const myX = lerp(540, 330, pr(t, s2, s2 + 0.9, sine));
  return (
    <>
      <L.Person cx={myX} cy={1000} s={2.2 * me} op={me} color={KAMU} />
      <L.Document cx={lerp(1000, myX + 190, doc)} cy={lerp(760, 1010, doc)} s={1.0 * me} op={me * (1 - 0.0)} rot={lerp(-12, 8, doc)} />
      <L.Person cx={800} cy={1000} s={2.2 * dr} op={dr} color={DOK} />
      <L.SpeechBubble cx={760} cy={700} s={1.0 * bub} op={bub} text="positif HIV" w={420} tail="r" />
    </>
  );
};

// ---- Adegan 2 (kalimat 3-4): pikiran penuh (gelembung tanya bermunculan); lalu empat lingkaran orang terdekat muncul satu per satu
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const s3 = T(3);
  const me = pr(t, s3 - 0.4, s3 + 0.3, back);
  const q = [0, 1, 2].map((i) => pr(t, s3 + 0.1 + i * 0.35, s3 + 0.7 + i * 0.35, back));
  const qFade = pr(t, CL(4, 0) - 0.3, CL(4, 0) + 0.3);
  const k0 = pr(t, CL(4, 0) + 0.3, CL(4, 0) + 0.9, back);
  const k1 = pr(t, CL(4, 1) + 0.1, CL(4, 1) + 0.7, back);
  const k2 = pr(t, CL(4, 2) - 0.1, CL(4, 2) + 0.4, back);
  const k3 = pr(t, CL(4, 3) + 0.1, CL(4, 3) + 0.8, back);
  return (
    <>
      <L.Person cx={540} cy={1080} s={2.1 * me} op={me} color={KAMU} />
      {[[360, 760, 'l'], [540, 640, 'r'], [730, 780, 'r']].map(([x, y, tl], i) => (
        <L.SpeechBubble key={i} cx={x as number} cy={y as number} s={0.9 * q[i]} op={q[i] * (1 - qFade)} text="?" w={150} tail={tl as 'l' | 'r'} />
      ))}
      <L.Heart cx={170} cy={740} s={0.8 * k0} op={k0} color={GREEN} />
      <L.Home cx={400} cy={730} s={0.9 * k1} op={k1} />
      <L.Person cx={620} cy={750} s={1.0 * k2} op={k2} color={GRP[0]} />
      <L.Group cx={850} cy={775} s={0.7 * k3} op={k3} n={3} />
    </>
  );
};

// ---- Adegan 3 (kalimat 5-6): kelompok mendekat dengan tanda tanya; lalu menjauh, "kamu" tinggal sendiri
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const s5 = T(5), s6 = T(6);
  const me = pr(t, s5 - 0.2, s5 + 0.5, back);
  const come = pr(t, s5, s5 + 0.9, sine);
  const bub = pr(t, s5 + 0.9, s5 + 1.4, back) * (1 - pr(t, s6 - 0.2, s6 + 0.1));
  const away = pr(t, s6 + 0.1, s6 + 1.6, in3);
  const gx = lerp(1250, 780, come) + 150 * away;
  const gop = pr(t, s5, s5 + 0.4) * (1 - 0.6 * pr(t, s6 + 0.8, s6 + 1.7));
  const bub2 = pr(t, s6 + 0.05, s6 + 0.6, back) * (1 - pr(t, s6 + 1.2, s6 + 1.7));
  const gap = pr(t, s6 + 1.4, s6 + 2.2, sine);
  return (
    <>
      <L.Person cx={300} cy={1020} s={2.1 * me} op={me} color={KAMU} />
      <L.Group cx={gx} cy={1030 - 20 * away} s={1.2 - 0.5 * away} op={gop} n={3} />
      <L.SpeechBubble cx={gx - 40} cy={730} s={0.9 * bub} op={bub} text="tahu?" w={240} tail="l" />
      <L.SpeechBubble cx={gx - 20} cy={730} s={0.9 * bub2} op={bub2} text="jauh" w={240} tail="l" />
    </>
  );
};

// ---- Adegan 4 (kalimat 7): virus tampak menakutkan (membesar); lalu "penerimaan" (pelukan) memudar dan pergi
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const s7 = T(7), c1 = CL(7, 1), c2 = CL(7, 2);
  const me = pr(t, s7 - 0.2, s7 + 0.5, back);
  const v = pr(t, c1, c1 + 0.7, back);
  const vShrink = 1 - 0.45 * pr(t, c2 - 0.2, c2 + 1.0, sine);
  const hug = pr(t, c2 - 0.3, c2 + 0.4, back);
  const hugGo = pr(t, c2 + 1.4, c2 + 3.0, sine);
  return (
    <>
      <L.Person cx={300} cy={1030} s={2.1 * me} op={me} color={KAMU} />
      <Virus x={800} y={820} r={90 * v * vShrink} t={t} />
      <L.Hug cx={lerp(700, 1000, hugGo)} cy={1120} s={1.5 * hug} op={hug * (1 - hugGo)} />
      <L.CrossBadge cx={720} cy={1000} s={0.8 * pr(t, c2 + 1.8, c2 + 2.5, back)} op={pr(t, c2 + 1.8, c2 + 2.5)} />
    </>
  );
};

// ---- Adegan 5 (kalimat 8): "bukan akhir kehidupan": kalender terus terisi hari demi hari (hijau), orang tetap berdiri
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const s8 = T(8), c1 = CL(8, 1);
  const me = pr(t, s8 - 0.2, s8 + 0.5, back);
  const cal = pr(t, c1 - 0.1, c1 + 0.6, back);
  const prog = pr(t, c1 + 0.3, c1 + 2.0, sine);
  const marks = Array.from({ length: Math.floor(prog * 22) }, (_, i) => i);
  const ok = pr(t, c1 + 1.9, c1 + 2.6, back);
  return (
    <>
      <L.Person cx={320} cy={1020} s={2.1 * me} op={me} color={KAMU} />
      <L.Calendar cx={730} cy={880} s={1.9 * cal} op={cal} marks={marks} markColor={GREEN} />
      <L.CheckBadge cx={900} cy={660} s={0.8 * ok} op={ok} />
    </>
  );
};

// ---- Adegan 6 (kalimat 9): ARV diminum rutin (blister terisi/diminum satu per satu); virus mengecil, terkendali
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const s9 = T(9), c1 = CL(9, 1);
  const bl = pr(t, s9, s9 + 0.7, back);
  const taken = Math.floor(pr(t, s9 + 0.8, c1 - 0.2, sine) * 6.2);
  const v = pr(t, s9 + 0.2, s9 + 0.9, back);
  const shrink = 1 - 0.62 * pr(t, c1 - 0.3, c1 + 1.2, sine);
  const ok = pr(t, c1 + 1.0, c1 + 1.6, back);
  return (
    <>
      <L.Blister cx={340} cy={950} s={1.5 * bl} op={bl} taken={taken} />
      <Virus x={790} y={900} r={100 * v * shrink} t={t} />
      <L.CheckBadge cx={790} cy={1130} s={0.8 * ok} op={ok} />
    </>
  );
};

// ---- Adegan 7 (kalimat 10): grafik jumlah virus dalam darah turun di bawah batas deteksi (tetap di atas sumbu: tidak hilang total)
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const s10 = T(10);
  const ch = pr(t, s10, s10 + 0.7, back);
  const prog = pr(t, s10 + 0.5, s10 + 3.0, sine);
  const tube = pr(t, s10 + 0.3, s10 + 1.0, back);
  return (
    <>
      <L.LineChart cx={540} cy={920} s={ch} op={ch} w={860} h={460} color="#F4D77E" threshold={0.2} points={[0.92, 0.78, 0.6, 0.42, 0.26, 0.14, 0.1, 0.09, 0.09]} progress={prog} smooth />
      <L.BloodTube cx={170} cy={1330} s={0.8 * tube} op={tube} level={lerp(0.8, 0.3, prog)} />
    </>
  );
};

// ---- Adegan 8 (kalimat 11): tidak terdeteksi dipertahankan (jam berputar, grafik tetap rendah); lalu virus tidak menyeberang ke orang lain
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const s11 = T(11), c1 = CL(11, 1);
  const ch = pr(t, s11, s11 + 0.7, back) * (1 - pr(t, c1 - 0.3, c1 + 0.4));
  const prog = pr(t, s11 + 0.3, c1 - 0.8, sine);
  const clk = pr(t, s11 + 0.8, s11 + 1.5, back) * (1 - pr(t, c1 - 0.3, c1 + 0.4));
  const sweep = pr(t, s11 + 1.0, c1 - 0.5, sine);
  const pA = pr(t, c1, c1 + 0.7, back);
  const pB = pr(t, c1 + 0.2, c1 + 0.9, back);
  const arrow = pr(t, c1 + 0.9, c1 + 1.7, sine);
  const cross = pr(t, c1 + 1.7, c1 + 2.3, back);
  const hold = pr(t, c1 + 2.0, c1 + 2.8);
  return (
    <>
      <L.LineChart cx={380} cy={900} s={ch} op={ch} w={620} h={380} color="#F4D77E" threshold={0.2} points={[0.1, 0.09, 0.09, 0.08, 0.09, 0.08, 0.09]} progress={prog} smooth />
      <L.Clock cx={850} cy={900} s={1.1 * clk} op={clk} frac={0.02 + 0.96 * sweep} hour={3} />
      <L.Person cx={260} cy={1050} s={2.0 * pA} op={pA} color={KAMU} />
      <Virus x={300} y={1100} r={30 * pA} dim={0.95} t={t} />
      <L.Person cx={820} cy={1050} s={2.0 * pB} op={pB} color={GRP[1]} />
      <line x1={420} y1={900} x2={lerp(420, 640, arrow)} y2={900} stroke="#EAF2FB" strokeWidth={14} strokeLinecap="round" opacity={0.85 * arrow * (1 - 0.5 * hold)} strokeDasharray="6 22" />
      <L.CrossBadge cx={540} cy={900} s={0.9 * cross} op={cross} />
      <L.CheckBadge cx={820} cy={760} s={0.8 * hold} op={hold} />
    </>
  );
};

// ---- Adegan 9 (kalimat 12): bangun pagi (jam pagi), berangkat kerja (mobil melintas), tertawa di meja makan (orang berkumpul + hati)
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const s12 = T(12), c1 = CL(12, 1), c2 = CL(12, 2);
  const clk = pr(t, s12, s12 + 0.7, back) * (1 - pr(t, c1 - 0.1, c1 + 0.4));
  const sweep = pr(t, s12 + 0.1, c1, sine);
  const me = pr(t, s12 - 0.2, s12 + 0.5, back) * (1 - pr(t, c1 + 0.2, c1 + 0.6));
  const car = pr(t, c1, c1 + 0.2) * (1 - pr(t, c1 + 1.6, c1 + 2.0));
  const carX = lerp(-120, 1200, pr(t, c1, c1 + 1.9, sine));
  const tab = pr(t, c2, c2 + 0.6, back);
  const hrt = pr(t, c2 + 1.0, c2 + 1.7, back);
  const beat = 1 + 0.08 * Math.max(0, Math.sin(Math.max(0, t - c2 - 1.2) * 6));
  return (
    <>
      <L.Person cx={320} cy={1000} s={2.0 * me} op={me} color={KAMU} />
      <L.Clock cx={720} cy={800} s={1.3 * clk} op={clk} frac={0.02 + 0.5 * sweep} hour={7} />
      <rect x={0} y={1150} width={1080} height={14} rx={7} fill="#FFFFFF" opacity={0.25 * car} />
      <L.Car cx={carX} cy={1090} s={1.4} op={car} color={KAMU} />
      <rect x={250} y={1020} width={580} height={26} rx={13} fill="#EAF2FB" opacity={tab} transform={`translate(0 ${(1 - tab) * 30})`} />
      <rect x={290} y={1046} width={26} height={110} rx={10} fill="#B3C7DC" opacity={tab} />
      <rect x={764} y={1046} width={26} height={110} rx={10} fill="#B3C7DC" opacity={tab} />
      <L.Group cx={540} cy={900} s={1.25 * tab} op={tab} n={3} />
      <L.Heart cx={540} cy={680} s={0.7 * hrt * beat} op={hrt} color={GREEN} />
    </>
  );
};

// ---- Adegan 10 (kalimat 13): persoalan kesehatan butuh pengobatan (klinik + tablet); menghakimi dicoret (gelembung tuding dicoret)
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const s13 = T(13), c1 = CL(13, 1);
  const cl = pr(t, s13, s13 + 0.8, back);
  const tb = pr(t, s13 + 0.8, s13 + 1.6, sine);
  const ok = pr(t, s13 + 2.0, s13 + 2.7, back);
  const me = pr(t, c1 - 0.2, c1 + 0.5, back);
  const bub = pr(t, c1 + 0.1, c1 + 0.7, back);
  const cross = pr(t, c1 + 0.9, c1 + 1.5, back);
  return (
    <>
      <g opacity={1 - pr(t, c1 - 0.3, c1 + 0.3)}>
        <L.Clinic cx={400} cy={900} s={1.6 * cl} op={cl} />
        <L.Tablet cx={lerp(1100, 780, tb)} cy={lerp(780, 960, tb)} s={1.1} rot={lerp(-40, 0, tb)} op={pr(t, s13 + 0.8, s13 + 1.1)} />
        <L.CheckBadge cx={400} cy={640} s={0.8 * ok} op={ok} />
      </g>
      <L.Person cx={760} cy={1040} s={2.0 * me} op={me} color={KAMU} />
      <L.SpeechBubble cx={400} cy={760} s={1.0 * bub} op={bub} text="salah!" w={320} tail="r" />
      <L.CrossBadge cx={400} cy={760} s={1.0 * cross} op={cross} />
    </>
  );
};

// ---- Adegan 11 (kalimat 14): virus terlepas dari orang dan menjauh (yang dilawan = virusnya); orang-orang berpelukan (bukan manusianya)
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const s14 = T(14), c1 = CL(14, 1);
  const me = pr(t, s14 - 0.2, s14 + 0.5, back);
  const v = pr(t, s14, s14 + 0.6, back);
  const lift = pr(t, s14 + 0.8, c1 - 0.2, sine);
  const hug = pr(t, c1 + 0.1, c1 + 0.9, back);
  const meX = lerp(540, 380, pr(t, c1 - 0.2, c1 + 0.6, sine));
  return (
    <>
      <L.Person cx={meX} cy={1020} s={2.1 * me * (1 - hug)} op={me * (1 - hug)} color={KAMU} />
      <L.Hug cx={540} cy={1010} s={2.0 * hug} op={hug} />
      <Virus x={lerp(meX + 30, 880, lift)} y={lerp(1100, 700, lift)} r={46 * v} t={t} />
    </>
  );
};

const PILLS: { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number }[] = [
  { a: CL(9, 0) + 0.3, b: CL(9, 1) + 0.2, text: 'ARV rutin', k: 'arv', x: 340, y: 1250, size: 44 },
  { a: T(10) + 2.4, b: T(11) - 0.2, text: 'tidak terdeteksi', k: 'neutral', x: 540, y: 1260, size: 44 },
  { a: CL(11, 1) + 2.4, b: T(12) - 0.2, text: 'tidak menular', k: 'arv', x: 540, y: 1330, size: 46 },
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
export const S2E1Full: React.FC = () => {
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
          <LegendBox t={t} a={CL(7, 1) + 0.2} b={T(8) - 0.3} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(9) + 0.3} b={T(9) + 5.0} items={[['#FF9C85', 'Virus HIV'], ['#FFA27B', 'Obat ARV']]} />
          <LegendBox t={t} a={T(10) + 0.4} b={T(11) - 0.2} items={[['#F4D77E', 'Jumlah virus'], ['#FF6B4D', 'Batas deteksi']]} />
          <LegendBox t={t} a={T(11) + 0.3} b={CL(11, 1) - 0.2} items={[['#F4D77E', 'Jumlah virus'], ['#FF6B4D', 'Batas deteksi']]} />
          <LegendBox t={t} a={CL(11, 1) + 0.3} b={T(12) - 0.2} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(14) + 0.2} b={T(14) + 4.2} items={[['#FF9C85', 'Virus HIV']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile("vo/S2E1.mp3")} />
    </AbsoluteFill>
  );
};
