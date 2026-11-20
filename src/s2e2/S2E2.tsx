import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T, T, CL, EP_DUR } from './timeline';

export const S2E2_FRAMES = Math.ceil(EP_DUR * FPS);

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

Kementerian Kesehatan RI. Peraturan Menteri Kesehatan Nomor 3 Tahun 2026 tentang Penanggulangan Penyakit (Pasal 2 huruf d; Pasal 26 ayat 1).
https://www.peraturan.go.id/files/permenkes-no-3-tahun-2026.pdf

World Health Organization. (2015). Consolidated guidelines on HIV testing services: 5Cs: Consent, confidentiality, counselling, correct results and connection.
https://ncbi.nlm.nih.gov/books/NBK316021/

Prevention Access Campaign. (n.d.). Risk of sexual transmission of HIV from a person living with HIV who has an undetectable viral load: U=U consensus statement.
https://preventionaccess.org/wp-content/uploads/2021/07/UU-Consensus-Statement.pdf

Ginting, A. Pemeriksaan viral load bagi ODHA. Kementerian Kesehatan RI (15 Agustus 2022).
https://keslan.kemkes.go.id/view_artikel/1306/pemeriksaan-viral-load-bagi-odha

ANTARA. Kemenkes pastikan pengobatan HIV/AIDS gratis di faskes pemerintah (2023).
https://jambi.antaranews.com/berita/563478/kemenkes-pastikan-pengobatan-hiv-aids-gratis-di-faskes-pemerintah`;

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
const BG: Grad[] = [B1, B2, B1, B2, B3, B4, B4, B1, B4, B2, B4, B1, B2];

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
const PAS = '#7ED6A8'; // pasangan
const GRP = ['#F4D77E', '#7ED6A8', '#8FBDF7'];
const Virus: React.FC<{ x: number; y: number; r: number; dim?: number; t: number; seed?: number }> = ({ x, y, r, dim = 1, t, seed = 0 }) =>
  r < 2 || dim < 0.01 ? null : <FlatVirus cx={x} cy={y} r={r} dim={dim} rot={t * 5 + seed * 40} />;
const pr = (t: number, a: number, b: number, e: (x: number) => number = out3) => ez(t, a, b, e);

const SceneWrap: React.FC<{ i: number; t: number; children: React.ReactNode }> = ({ i, t, children }) => {
  const o = win(t, SCENE_T[i], SCENE_T[i + 1] + 0.25, 0.45);
  if (o < 0.005) return null;
  const k = Math.max(0, Math.min(1, (t - SCENE_T[i]) / (SCENE_T[i + 1] - SCENE_T[i])));
  const z = 1 + 0.04 * k;
  return <g opacity={o} transform={`translate(540 960) scale(${z}) translate(-540 -960)`}>{children}</g>;
};

// ---- Adegan 1 (kalimat 1-3): kertas hasil tes sampai ke "kamu" (positif HIV); pertanyaan bermunculan; lalu jalur ke klinik tergambar (yang biasanya terjadi)
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const s2 = T(2), s3 = T(3);
  const me = pr(t, 0.15, 0.9, back);
  const doc = pr(t, 0.5, 1.7, sine);
  const bub = pr(t, 1.1, 1.6, back) * (1 - pr(t, s2 - 0.1, s2 + 0.2));
  const q = [0, 1, 2].map((i) => pr(t, s2 + 0.05 + i * 0.25, s2 + 0.5 + i * 0.25, back) * (1 - pr(t, s3 + 0.1, s3 + 0.5)));
  const path = pr(t, s3 + 0.2, s3 + 1.2, sine);
  const cl = pr(t, s3 + 1.0, s3 + 1.6, back);
  return (
    <>
      <L.PersonPose cx={360} cy={1010} s={2.3 * me} op={me} color={KAMU} bow={pr(t, 0.9, 1.8, sine) - 1.6 * pr(t, s3 + 0.3, s3 + 1.3, sine)} />
      <L.Document cx={lerp(1000, 580, doc)} cy={lerp(760, 1030, doc)} s={0.95 * me} op={me} rot={lerp(-14, 6, doc)} />
      <L.SpeechBubble cx={700} cy={700} s={0.95 * bub} op={bub} text="positif HIV" w={400} tail="l" />
      {[[250, 700, 'l'], [440, 610, 'r'], [610, 720, 'r']].map(([x, y, tl], i) => (
        <L.SpeechBubble key={i} cx={x as number} cy={y as number} s={0.85 * q[i]} op={q[i]} text="?" w={150} tail={tl as 'l' | 'r'} />
      ))}
      <line x1={560} y1={1130} x2={lerp(560, 770, path)} y2={1130} stroke="#EAF2FB" strokeWidth={12} strokeLinecap="round" strokeDasharray="4 24" opacity={0.85 * path} />
      <L.Clinic cx={880} cy={1010} s={1.0 * cl} op={cl} />
    </>
  );
};

// ---- Adegan 2 (kalimat 4): minum ARV setiap hari: tablet dari strip terbang ke orang satu per satu, kalender terisi tiap hari
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const s4 = T(4);
  const me = pr(t, s4 - 0.3, s4 + 0.3, back);
  const bl = pr(t, s4 - 0.1, s4 + 0.5, back);
  const n = 4;
  const fl = Array.from({ length: n }, (_, i) => pr(t, s4 + 0.55 + i * 0.6, s4 + 1.05 + i * 0.6, sine));
  const taken = fl.filter((k) => k >= 0.99).length;
  const marks = Array.from({ length: taken }, (_, i) => i);
  return (
    <>
      <L.Person cx={290} cy={1020} s={2.0 * me} op={me} color={KAMU} />
      <L.Calendar cx={780} cy={800} s={1.5 * bl} op={bl} marks={marks} markColor="#72E3D3" />
      <L.Blister cx={780} cy={1180} s={1.2 * bl} op={bl} taken={taken} />
      {fl.map((k, i) =>
        k > 0.01 && k < 0.99 ? (
          <L.Tablet key={i} cx={lerp(700 + i * 40, 320, k)} cy={lerp(1150, 900, k) - 120 * Math.sin(k * Math.PI)} s={0.7} rot={lerp(-30, 20, k)} op={1 - 0.6 * k} />
        ) : null,
      )}
    </>
  );
};

// ---- Adegan 3 (kalimat 5): jumlah virus di darah dipantau berkala: tabung darah diperiksa kaca pembesar berulang, jam melompat tiap pemeriksaan
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const s5 = T(5);
  const tube = pr(t, s5 - 0.2, s5 + 0.5, back);
  const mg = pr(t, s5 + 0.2, s5 + 0.8, back);
  const checks = [0, 1, 2].map((i) => pr(t, s5 + 0.9 + i * 0.75, s5 + 1.3 + i * 0.75, back));
  const nChk = checks.filter((k) => k > 0.5).length;
  const clk = pr(t, s5 + 0.1, s5 + 0.7, back);
  const mx = 300 + 0 * nChk;
  const bob = Math.sin(Math.max(0, t - s5 - 0.8) * 5.5) * 12;
  return (
    <>
      <L.BloodTube cx={300} cy={1030} s={1.5 * tube} op={tube} level={0.7} />
      <g opacity={mg}>
        <L.Magnifier cx={mx + 40} cy={900 + bob} s={1.25 * mg} />
        <defs>
          <clipPath id="lens3"><circle cx={mx + 40} cy={900 + bob} r={92 * 1.25 * mg} /></clipPath>
        </defs>
        <g clipPath="url(#lens3)">
          <Virus x={mx + 40} y={900 + bob} r={34 * mg} t={t} />
        </g>
      </g>
      <L.Clock cx={790} cy={870} s={1.2 * clk} op={clk} frac={Math.min(0.98, nChk / 3)} hour={2 + nChk * 3} />
      {checks.map((k, i) => (
        <L.CheckBadge key={i} cx={650 + i * 140} cy={1150} s={0.42 * k} op={k} />
      ))}
    </>
  );
};

// ---- Adegan 4 (kalimat 6): ARV menekan virus (mengecil, meredup) tapi virus tetap ada; "menghapus" ditandai silang
const Scene4: React.FC<{ t: number }> = ({ t }) => {
  const s6 = T(6), c1 = CL(6, 1);
  const v = pr(t, s6 - 0.2, s6 + 0.5, back);
  const tb = pr(t, s6 + 0.3, s6 + 1.0, sine);
  const shrink = 1 - 0.62 * pr(t, s6 + 0.9, s6 + 2.0, sine);
  const dim = 1 - 0.45 * pr(t, s6 + 0.9, s6 + 2.0, sine);
  const ghost = pr(t, c1 - 0.1, c1 + 0.5, back);
  const cross = pr(t, c1 + 0.3, c1 + 0.9, back);
  const vx = lerp(540, 330, pr(t, c1 - 0.2, c1 + 0.5, sine));
  return (
    <>
      <Virus x={vx} y={1010} r={140 * v * shrink} dim={dim} t={t} />
      <L.Tablet cx={lerp(980, 660, tb)} cy={lerp(700, 800, tb)} s={1.1} rot={lerp(-35, -18, tb)} op={pr(t, s6 + 0.3, s6 + 0.6) * (1 - pr(t, s6 + 1.4, s6 + 1.8))} />
      <circle cx={740} cy={1010} r={86} fill="none" stroke="#EAF2FB" strokeWidth={10} strokeDasharray="14 18" strokeLinecap="round" opacity={0.8 * ghost} />
      <L.CrossBadge cx={740} cy={1010} s={0.8 * cross} op={cross} />
    </>
  );
};

// ---- Adegan 5 (kalimat 7): satu sampai enam bulan: kalender terisi, grafik virus turun sampai di bawah batas deteksi (tetap di atas sumbu)
const Scene5: React.FC<{ t: number }> = ({ t }) => {
  const s7 = T(7), c1 = CL(7, 1);
  const cal = pr(t, s7 - 0.2, s7 + 0.5, back) * (1 - pr(t, c1 - 0.3, c1 + 0.3));
  const marks = Array.from({ length: Math.floor(pr(t, s7 + 0.4, c1 - 0.3, sine) * 6.9) }, (_, i) => i * 5 % 35);
  const ch = pr(t, c1 - 0.1, c1 + 0.6, back);
  const prog = pr(t, c1 + 0.3, c1 + 2.0, sine);
  return (
    <>
      <L.Calendar cx={540} cy={900} s={2.0 * cal} op={cal} marks={marks} markColor="#72E3D3" />
      <L.LineChart cx={540} cy={920} s={ch} op={ch} w={860} h={460} color="#F4D77E" threshold={0.2} points={[0.92, 0.78, 0.6, 0.42, 0.26, 0.14, 0.1, 0.09, 0.09]} progress={prog} smooth />
    </>
  );
};

// ---- Adegan 6 (kalimat 8): enam bulan ARV rutin + tidak terdeteksi; virus tidak menyeberang ke pasangan; syaratnya ARV tetap diminum
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const s8 = T(8), c1 = CL(8, 1), c2 = CL(8, 2);
  const bl = pr(t, s8, s8 + 0.6, back) * (1 - pr(t, c1 - 0.3, c1 + 0.2));
  const taken = Math.floor(pr(t, s8 + 0.6, c1 - 0.8, sine) * 6.2);
  const tube = pr(t, s8 + 1.2, s8 + 1.8, back) * (1 - pr(t, c1 - 0.3, c1 + 0.2));
  const ok = pr(t, c1 - 1.6, c1 - 1.0, back) * (1 - pr(t, c1 - 0.3, c1 + 0.2));
  const pA = pr(t, c1, c1 + 0.6, back);
  const pB = pr(t, c1 + 0.2, c1 + 0.8, back);
  const arrow = pr(t, c1 + 0.7, c1 + 1.5, sine);
  const cross = pr(t, c1 + 1.5, c1 + 2.0, back);
  const bl2 = pr(t, c2 - 0.1, c2 + 0.5, back);
  const taken2 = Math.floor(pr(t, c2 + 0.4, c2 + 2.0, sine) * 3.2);
  const hold = pr(t, c2 + 0.2, c2 + 0.8);
  return (
    <>
      <L.Blister cx={310} cy={880} s={1.5 * bl} op={bl} taken={taken} />
      <L.BloodTube cx={780} cy={900} s={1.3 * tube} op={tube} level={0.12} />
      <L.CheckBadge cx={780} cy={1160} s={0.7 * ok} op={ok} />
      <L.Person cx={230} cy={960} s={2.0 * pA} op={pA} color={KAMU} />
      <Virus x={280} y={1020} r={26 * pA} t={t} />
      <L.Person cx={850} cy={960} s={2.0 * pB} op={pB} color={PAS} />
      <line x1={400} y1={860} x2={lerp(400, 680, arrow)} y2={860} stroke="#EAF2FB" strokeWidth={14} strokeLinecap="round" strokeDasharray="6 22" opacity={0.85 * arrow * (1 - 0.5 * hold)} />
      <L.CrossBadge cx={540} cy={860} s={0.9 * cross} op={cross} />
      <L.Blister cx={540} cy={1170} s={0.75 * bl2} op={bl2} taken={taken2} />
    </>
  );
};

// ---- Adegan 7 (kalimat 9): U sama dengan U. Kiri: viral load tidak terdeteksi (tabung darah hampir kosong); kanan: pasangan terlindung (tidak tertular)
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const s9 = T(9);
  const u1 = pr(t, s9, s9 + 0.5, back);
  const tube = pr(t, s9 + 0.3, s9 + 0.9, back);
  const eq = pr(t, s9 + 0.7, s9 + 1.1, back);
  const u2 = pr(t, s9 + 1.0, s9 + 1.5, back);
  const pas = pr(t, s9 + 1.2, s9 + 1.8, back);
  const sh = pr(t, s9 + 1.5, s9 + 2.1, back);
  const g = (cx: number, k: number) => (
    <g opacity={k} transform={`translate(${cx} 800) scale(${k})`}>
      <circle r={140} fill="#72E3D3" />
      <text textAnchor="middle" y={58} fontFamily={FONT} fontWeight={800} fontSize={180} fill="#173A5E">U</text>
    </g>
  );
  return (
    <>
      {g(250, u1)}
      <g opacity={eq} transform={`translate(540 800) scale(${eq})`}>
        <rect x={-50} y={-34} width={100} height={20} rx={10} fill="#EAF2FB" />
        <rect x={-50} y={14} width={100} height={20} rx={10} fill="#EAF2FB" />
      </g>
      {g(830, u2)}
      <L.BloodTube cx={250} cy={1150} s={1.2 * tube} op={tube} level={0.12} />
      <Virus x={330} y={1190} r={20 * tube} t={t} />
      <L.Person cx={800} cy={1130} s={1.7 * pas} op={pas} color={PAS} />
      <L.Shield cx={870} cy={1160} s={0.95 * sh} op={sh} />
    </>
  );
};

// ---- Adegan 8 (kalimat 10): fasilitas pemerintah (klinik); ARV gratis: tablet mengalir ke orang tanpa koin (koin disilang)
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const s10 = T(10), c1 = CL(10, 1);
  const cl = pr(t, s10, s10 + 0.7, back);
  const me = pr(t, s10 + 0.3, s10 + 0.9, back);
  const n = 3;
  const fl = Array.from({ length: n }, (_, i) => pr(t, c1 + 0.1 + i * 0.5, c1 + 0.9 + i * 0.5, sine));
  const coin = pr(t, c1 + 0.2, c1 + 0.8, back);
  const cross = pr(t, c1 + 1.0, c1 + 1.6, back);
  return (
    <>
      <L.Clinic cx={300} cy={940} s={1.5 * cl} op={cl} />
      <L.Person cx={830} cy={1010} s={2.0 * me} op={me} color={KAMU} />
      {fl.map((k, i) =>
        k > 0.01 && k < 0.99 ? <L.Tablet key={i} cx={lerp(430, 740, k)} cy={lerp(1040, 1060, k) - 90 * Math.sin(k * Math.PI)} s={0.55} op={1} /> : null,
      )}
      <L.Coin cx={540} cy={700} s={0.8 * coin} op={coin} />
      <L.CrossBadge cx={540} cy={700} s={0.7 * cross} op={cross} />
    </>
  );
};

// ---- Adegan 9 (kalimat 11): status dirahasiakan: kertas hasil tes digembok (gembok jatuh dan menutup), pengamat tidak boleh melihat; lalu prinsip layanan tes (alat tes + centang)
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const s11 = T(11), c1 = CL(11, 1);
  const me = pr(t, s11 - 0.2, s11 + 0.4, back);
  const doc = pr(t, s11 + 0.1, s11 + 0.7, back);
  const drop = pr(t, s11 + 0.7, s11 + 1.3, in3);
  const obs = pr(t, s11 + 0.4, s11 + 0.9, back) * (1 - pr(t, c1 - 0.2, c1 + 0.3));
  const cross = pr(t, s11 + 1.3, s11 + 1.8, back) * (1 - pr(t, c1 - 0.2, c1 + 0.3));
  const kit = pr(t, c1, c1 + 0.7, back);
  const ok = pr(t, c1 + 0.9, c1 + 1.5, back);
  return (
    <>
      <L.Person cx={230} cy={1020} s={2.0 * me} op={me} color={KAMU} />
      <L.Document cx={520} cy={930} s={1.7 * doc} op={doc} rot={-4} />
      <L.Lock cx={590} cy={lerp(600, 1000, drop)} s={1.4} op={pr(t, s11 + 0.6, s11 + 0.9)} open={drop < 0.95} />
      <L.Group cx={880} cy={1050} s={0.95 * obs} op={obs} n={3} />
      <L.CrossBadge cx={880} cy={830} s={0.6 * cross} op={cross} />
      <L.TestKit cx={880} cy={1010} s={0.9 * kit} op={kit} lines={1} />
      <L.CheckBadge cx={880} cy={730} s={0.55 * ok} op={ok} />
    </>
  );
};

// ---- Adegan 10 (kalimat 12): stigma dan diskriminasi dihapus: kelompok menjauh dengan gelembung titik, gelembung disilang, lalu kelompok mendekat dan merangkul
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const s12 = T(12), c1 = s12 + 1.7;
  const me = pr(t, s12 - 0.2, s12 + 0.4, back);
  const gr = pr(t, s12 + 0.1, s12 + 0.7, back);
  const bub = pr(t, s12 + 0.5, s12 + 1.0, back) * (1 - pr(t, c1 + 0.5, c1 + 0.9));
  const cross = pr(t, c1 - 0.2, c1 + 0.4, back) * (1 - pr(t, c1 + 0.6, c1 + 1.0));
  const near = pr(t, c1 + 0.5, c1 + 1.7, sine);
  const hug = pr(t, c1 + 1.5, c1 + 2.2, back);
  return (
    <>
      <L.Person cx={lerp(780, 600, near)} cy={1020} s={2.1 * me * (1 - hug)} op={me * (1 - hug)} color={KAMU} />
      <L.Group cx={lerp(260, 400, near)} cy={1040} s={1.1 * gr * (1 - hug)} op={gr * (1 - hug)} n={3} />
      <L.SpeechBubble cx={330} cy={760} s={0.9 * bub} op={bub} tail="r" w={240} />
      <L.CrossBadge cx={330} cy={760} s={0.8 * cross} op={cross} />
      <L.Embrace cx={540} cy={1010} s={2.2 * hug} op={hug} colorB="#8FBDF7" />
    </>
  );
};

// ---- Adegan 11 (kalimat 13): minum ARV rutin (strip terisi dikonsumsi) -> hidup normal (jam pagi, rumah, mobil lewat)
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const s13 = T(13), c1 = CL(13, 1);
  const bl = pr(t, s13, s13 + 0.6, back) * (1 - pr(t, c1 - 0.2, c1 + 0.3));
  const taken = Math.floor(pr(t, s13 + 0.5, c1 - 0.3, sine) * 6.2);
  const me = pr(t, c1 - 0.1, c1 + 0.5, back);
  const home = pr(t, c1 + 0.1, c1 + 0.7, back);
  const car = pr(t, c1 + 0.3, c1 + 0.5) * (1 - pr(t, c1 + 1.5, c1 + 1.8));
  const carX = lerp(-120, 1200, pr(t, c1 + 0.3, c1 + 1.8, sine));
  const hr = pr(t, c1 + 0.9, c1 + 1.5, back);
  return (
    <>
      <L.Blister cx={540} cy={960} s={1.9 * bl} op={bl} taken={taken} />
      <L.Person cx={300} cy={1010} s={2.0 * me} op={me} color={KAMU} />
      <L.Home cx={760} cy={870} s={1.3 * home} op={home} />
      <rect x={0} y={1180} width={1080} height={14} rx={7} fill="#FFFFFF" opacity={0.25 * car} />
      <L.Car cx={carX} cy={1120} s={1.3} op={car} color="#8FBDF7" />
      <L.Heart cx={540} cy={680} s={0.7 * hr} op={hr} color="#7ED6A8" />
    </>
  );
};

// ---- Adegan 12 (kalimat 14): hasil positif bukan akhir: orang berjalan di jalan yang terus ke depan, matahari terbit menyambut, lengan terangkat lega
const Scene12: React.FC<{ t: number }> = ({ t }) => {
  const s14 = T(14);
  const road = pr(t, s14 - 0.2, s14 + 0.5, back);
  const x = lerp(160, 560, pr(t, s14 + 0.1, s14 + 2.2, sine));
  const sun = pr(t, s14 + 0.5, s14 + 2.2, sine);
  const sc = pr(t, s14 - 0.2, s14 + 0.4, back);
  const bob = Math.abs(Math.sin(Math.max(0, t - s14) * 6)) * 8 * (1 - pr(t, s14 + 2.0, s14 + 2.4));
  const lift = pr(t, s14 + 1.8, s14 + 2.5, back);
  return (
    <>
      <defs><clipPath id="hz12"><rect x={0} y={0} width={1080} height={1095} /></clipPath></defs>
      <g clipPath="url(#hz12)"><L.Sun cx={780} cy={lerp(1190, 760, sun)} s={1.7} op={pr(t, s14 + 0.3, s14 + 0.7)} /></g>
      <L.Road cx={540} cy={1200} s={1.0 * road} op={road} w={1000} h={220} />
      <L.PersonPose cx={x} cy={1100 - bob} s={1.8 * sc} op={sc} color={KAMU} bow={-lift} lift={lift} />
    </>
  );
};

// ---- Adegan 13 (kalimat 15): awal perawatan (klinik + tablet) lalu tidak sendirian (kelompok mendekat, rangkulan)
const Scene13: React.FC<{ t: number }> = ({ t }) => {
  const s15 = T(15), c1 = CL(15, 1);
  const me = pr(t, s15 - 0.2, s15 + 0.4, back);
  const cl = pr(t, s15, s15 + 0.7, back) * (1 - pr(t, c1 + 0.8, c1 + 1.2));
  const tb = pr(t, s15 + 0.6, s15 + 1.4, sine);
  const gr = pr(t, c1 - 0.1, c1 + 0.5, back);
  const near = pr(t, c1 + 0.3, c1 + 1.3, sine);
  const hug = pr(t, c1 + 1.2, c1 + 1.9, back);
  return (
    <>
      <L.PersonPose cx={lerp(540, 600, near)} cy={1020} s={2.1 * me * (1 - hug)} op={me * (1 - hug)} color={KAMU} bow={lerp(0.5, -1, pr(t, c1 - 0.2, c1 + 1.2, sine))} lift={0} />
      <L.Clinic cx={820} cy={800} s={1.1 * cl} op={cl} />
      <L.Tablet cx={lerp(780, 640, tb)} cy={lerp(900, 930, tb)} s={0.7} op={pr(t, s15 + 0.6, s15 + 0.9) * (1 - pr(t, c1 - 0.2, c1 + 0.2))} />
      <L.Group cx={lerp(120, 380, near)} cy={1040} s={1.1 * gr * (1 - hug)} op={gr * (1 - hug)} n={3} />
      <L.Embrace cx={540} cy={1010} s={2.2 * hug} op={hug} colorB="#8FBDF7" />
    </>
  );
};

const PILLS: { a: number; b: number; text: string; k: KK; x: number; y: number; size?: number }[] = [
  { a: CL(7, 1) + 2.2, b: T(8) - 0.2, text: 'tidak terdeteksi', k: 'neutral', x: 540, y: 1320, size: 44 },
  { a: CL(8, 1) + 1.9, b: CL(8, 2) - 0.1, text: 'tidak menularkan', k: 'arv', x: 540, y: 1385, size: 46 },
  { a: CL(10, 1) + 1.0, b: T(11) - 0.2, text: 'ARV gratis', k: 'arv', x: 540, y: 1300, size: 46 },
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
export const S2E2Full: React.FC = () => {
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
          <LegendBox t={t} a={T(4) + 0.2} b={T(4) + 3.0} items={[['#FFA27B', 'Obat ARV']]} />
          <LegendBox t={t} a={T(5) + 0.3} b={T(6) - 0.2} items={[['#FF9C85', 'Virus HIV']]} />
          <LegendBox t={t} a={T(6) + 0.2} b={T(7) - 0.2} items={[['#FF9C85', 'Virus HIV'], ['#FFA27B', 'Obat ARV']]} />
          <LegendBox t={t} a={CL(7, 1) + 0.3} b={T(8) - 0.2} items={[['#F4D77E', 'Jumlah virus'], ['#FF6B4D', 'Batas deteksi']]} />
          <LegendBox t={t} a={CL(8, 1) + 0.3} b={CL(8, 2) - 0.2} items={[['#FF9C85', 'Virus HIV']]} />
        </AbsoluteFill>
      )}
      {subOn && cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          <div><Sub text={cue.text} /></div>
        </div>
      )}
      <Closing t={t} />
      <Audio src={staticFile("vo/S2E2.mp3")} />
    </AbsoluteFill>
  );
};
