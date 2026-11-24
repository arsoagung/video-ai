import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL } from '../shared/shapes';
import { CUES, CLOSE, SCENE_T, T, CL, EP_DUR } from './timeline';

export const S2E1ALT_FRAMES = Math.ceil(EP_DUR * FPS);

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
const B0: Grad = ['#08162F', '#0E2552', '#1B3F6E']; // biru malam (suasana berat)
const BG: Grad[] = [B1, B0, B0, B0, B1, B4, B4, B4, B1, B4, B2];

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



const MAIN = '#8FBDF7'; // tokoh utama (biru)
const DOC = '#B9A2F5'; // dokter (ungu, jas putih + stetoskop)
const FAM = '#F4D77E'; // keluarga (kuning)
const COM = '#4FC3C9'; // teman & masyarakat (teal, beda dari teal ARV)
const GREEN = '#7ED6A8';
const pr = (t: number, a: number, b: number, e: (x: number) => number = out3) => ez(t, a, b, e);
const tip = (cx: number, cy: number, len: number, ang: number) => ({ x: cx + len * Math.cos((ang * Math.PI) / 180), y: cy + len * Math.sin((ang * Math.PI) / 180) });
const Virus: React.FC<{ x: number; y: number; r: number; dim?: number; t: number; seed?: number }> = ({ x, y, r, dim = 1, t, seed = 0 }) =>
  r < 2 || dim < 0.01 ? null : <FlatVirus cx={x} cy={y} r={r} dim={dim} rot={t * 5 + seed * 40} />;

// kamera 2D: zoom (push-in/pull-back) + geser (pan) selama adegan i
type CamSpec = { z0: number; z1: number; fx: number; fy: number; dx0?: number; dx1?: number; dy0?: number; dy1?: number };
const SceneWrap: React.FC<{ i: number; t: number; cam: CamSpec; children: React.ReactNode }> = ({ i, t, cam, children }) => {
  const o = win(t, SCENE_T[i], SCENE_T[i + 1] + 0.25, 0.45);
  if (o < 0.005) return null;
  const k = ez(t, SCENE_T[i], SCENE_T[i + 1], sine);
  const z = lerp(cam.z0, cam.z1, k);
  const dx = lerp(cam.dx0 ?? 0, cam.dx1 ?? 0, k);
  const dy = lerp(cam.dy0 ?? 0, cam.dy1 ?? 0, k);
  return (
    <g opacity={o}>
      <g transform={`translate(${cam.fx + dx} ${cam.fy + dy}) scale(${z}) translate(${-cam.fx} ${-cam.fy})`}>{children}</g>
    </g>
  );
};

const BigText: React.FC<{ t: number; a: number; b: number; y: number; lines: string[]; size?: number; color?: string }> = ({ t, a, b, y, lines, size = 60, color = '#FFFFFF' }) => {
  const o = win(t, a, b, 0.5);
  if (o < 0.01) return null;
  return (
    <g opacity={o} transform={`translate(0 ${(1 - o) * 14})`}>
      {lines.map((l, i) => (
        <text key={i} x={540} y={y + size + i * size * 1.18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={color} style={{ paintOrder: 'stroke' }}>
          {l}
        </text>
      ))}
    </g>
  );
};

// ---- Adegan 1: ruang konsultasi. Tokoh utama (kiri, duduk) dan dokter (kanan, duduk); dokter menyerahkan hasil pemeriksaan, tokoh menerima dengan kedua tangan
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const a = CL(2, 0) - 0.4, b = CL(2, 1) - 0.1;
  const enter = pr(t, 0.2, 1.0, back);
  const hand = pr(t, a, b, sine);
  const dr = { x: 800, y: 1035 };
  const dLen = lerp(110, 250, hand);
  const dTip = tip(dr.x - 105, dr.y, dLen, 176);
  const mLen = lerp(60, 175, hand);
  const m1 = tip(290 + 105, 1035, mLen, 4);
  return (
    <>
      <L.Chair cx={290} cy={960} s={2.0 * enter} op={enter} />
      <L.Chair cx={800} cy={960} s={2.0 * enter} op={enter} />
      <L.PersonPose cx={290} cy={985} s={2.1 * enter} op={enter} color={MAIN} bow={0.15} />
      <L.Doctor cx={800} cy={985} s={2.1 * enter} op={enter} color={DOC} />
      <L.ArmReach cx={dr.x - 105} cy={dr.y} rot={176} len={dLen} color="#F4F8FF" op={enter} />
      <L.ArmReach cx={395} cy={1035} rot={4} len={mLen} color={MAIN} op={enter} />
      <L.Document cx={lerp(dTip.x, (dTip.x + m1.x) / 2 + 20, hand * 0.8)} cy={dTip.y - 20} s={0.62 * enter} op={enter} rot={-8} />
      <L.DeskFront cx={540} cy={1100} w={980} op={enter} />
    </>
  );
};

// ---- Adegan 2: close-up dokumen "POSITIF HIV", teks memudar, kamera naik ke kepala tokoh yang tertunduk
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const a = SCENE_T[1], b = SCENE_T[2];
  const k = pr(t, a, b, sine);
  const mv = pr(t, a + 1.0, a + 2.6, sine);
  const txt = (1 - pr(t, a + 1.4, a + 2.2)) * pr(t, a, a + 0.5);
  const dimK = 0.22 * k;
  const sc = lerp(3.4, 1.15, mv);
  return (
    <>
      <rect x={-200} y={-200} width={1500} height={2400} fill="#06122B" opacity={dimK} />
      <L.PersonPose cx={540} cy={1010} s={2.4} color={MAIN} bow={lerp(0.2, 0.9, mv)} op={pr(t, a, a + 0.6)} />
      <L.ArmReach cx={420} cy={1085} rot={lerp(40, 55, mv)} len={150} color={MAIN} />
      <L.ArmReach cx={660} cy={1085} rot={lerp(140, 125, mv)} len={150} color={MAIN} />
      <g transform={`translate(540 ${lerp(940, 1240, mv)}) scale(${sc})`}>
        <L.Document cx={0} cy={0} s={1} />
        <text x={0} y={-22} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={27} fill={LIB_COL.bad} opacity={txt}>POSITIF</text>
        <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={LIB_COL.bad} opacity={txt}>HIV</text>
      </g>
    </>
  );
};

// ---- Adegan 3: pikiran mendadak penuh. Panel transparan (kesehatan, keluarga, teman, masyarakat) muncul satu per satu dan merapat mengelilingi tokoh
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const s3 = T(3);
  const enter = pr(t, s3 - 0.4, s3 + 0.4, back);
  const ks = [CL(4, 0) + 0.1, CL(4, 1) + 0.0, CL(4, 2) - 0.1, CL(4, 3) + 0.0].map((a) => pr(t, a, a + 0.7, back));
  const tight = pr(t, CL(4, 0), SCENE_T[3], sine);
  const P = [[190, 740], [890, 740], [150, 1060], [930, 1060]];
  const pos = P.map(([x, y]) => [lerp(x, 540 + (x - 540) * 0.86, tight), lerp(y, 1010 + (y - 1010) * 0.88, tight)]);
  const bubble = pr(t, s3, s3 + 0.7, back) * (1 - pr(t, CL(4, 0), CL(4, 0) + 0.5));
  return (
    <>
      <L.PersonPose cx={540} cy={1150} s={1.9 * enter} op={enter} color={MAIN} bow={lerp(0.3, 0.6, tight)} />
      <circle cx={540} cy={640} r={86 * bubble} fill="#fff" opacity={0.18 * bubble} />
      <text x={540} y={668} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={90 * bubble} fill="#fff" opacity={0.7 * bubble}>?</text>
      {pos.map(([x, y], i) => (
        <g key={i} opacity={ks[i]} transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * ks[i]})`}>
          <circle r={122} fill="#fff" opacity={0.15} />
          {i === 0 && <L.Heart cx={0} cy={4} s={0.9} color={GREEN} />}
          {i === 1 && (
            <>
              <L.Home cx={0} cy={-10} s={0.8} />
              <L.PersonPose cx={-38} cy={44} s={0.45} color={FAM} />
              <L.PersonPose cx={38} cy={44} s={0.45} color={FAM} />
            </>
          )}
          {i === 2 && <L.PersonPose cx={0} cy={0} s={0.9} color={COM} />}
          {i === 3 && (
            <>
              <L.PersonPose cx={-52} cy={10} s={0.6} color={COM} />
              <L.PersonPose cx={52} cy={10} s={0.6} color={COM} />
              <L.PersonPose cx={0} cy={-6} s={0.72} color={FAM} />
            </>
          )}
        </g>
      ))}
    </>
  );
};

// ---- Adegan 4+5: tokoh di depan menatap kelompok di kejauhan (di dalam panel pikiran); kelompok perlahan menjauh (ketakutan, bukan kenyataan); pelukan penerimaan terlepas
const Scene45: React.FC<{ t: number }> = ({ t }) => {
  const s5 = T(5), s6 = T(6), c2 = CL(7, 2);
  const enter = pr(t, s5 - 0.3, s5 + 0.5, back);
  const panel = pr(t, s5, s5 + 0.8, back);
  const away = pr(t, s6 + 0.1, s6 + 2.2, sine);
  const hug = pr(t, c2 - 0.2, c2 + 0.6, back);
  const hugGo = pr(t, c2 + 1.4, c2 + 3.0, sine);
  const people = [FAM, COM, COM, FAM];
  return (
    <>
      <ellipse cx={690} cy={840} rx={300 * panel} ry={210 * panel} fill="#fff" opacity={0.12} />
      {people.map((c, i) => (
        <L.PersonPose key={i} cx={540 + i * 90 + away * (60 + i * 40)} cy={880 + (i % 2) * 14 - away * 10} s={0.8 - 0.25 * away} op={panel * (1 - 0.75 * away)} color={c} />
      ))}
      <L.Embrace cx={690} cy={880} s={1.35 * hug * (1 - 0.4 * hugGo)} op={hug * (1 - hugGo)} colorA={FAM} colorB={COM} heart />
      <L.PersonPose cx={250} cy={1160} s={2.6 * enter} op={enter} color={MAIN} bow={lerp(0.45, 0.7, away)} />
    </>
  );
};

// ---- Adegan 6: bukan akhir kehidupan. Tokoh menegakkan badan perlahan, latar menerang, matahari terbit
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const a = SCENE_T[4], b = SCENE_T[5];
  const k = pr(t, a + 0.3, b - 0.2, sine);
  const sun = pr(t, a + 0.4, b, sine);
  return (
    <>
      <L.Sun cx={830} cy={lerp(1000, 760, sun)} s={1.6} op={0.85 * sun} />
      <BigText t={t} a={a + 0.2} b={b + 0.1} y={400} lines={['DIAGNOSIS BUKAN', 'AKHIR KEHIDUPAN']} size={62} />
      <L.PersonPose cx={400} cy={1100} s={2.4} color={MAIN} bow={lerp(0.85, -0.8, k)} lift={0} />
    </>
  );
};

// ---- Adegan 7: pengobatan ARV sebagai rutinitas. Tangan mengambil obat dari strip, membawa ke arah kepala, kembali
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const a = SCENE_T[5], b = SCENE_T[6];
  const enter = pr(t, a, a + 0.6, back);
  const ph = pr(t, a + 0.6, b - 0.3, sine); // 0..1 sepanjang aksi
  const reach = ph < 0.35 ? ph / 0.35 : ph < 0.7 ? 1 : 1 - (ph - 0.7) / 0.3;
  const toHead = ph < 0.35 ? 0 : ph < 0.7 ? (ph - 0.35) / 0.35 : 1 - (ph - 0.7) / 0.3 * 1;
  const ang = lerp(lerp(30, 12, reach), -70, toHead);
  const len = lerp(110, 230, Math.max(reach * (1 - toHead), toHead * 0.45));
  const sh = { x: 395, y: 1060 };
  const tp = tip(sh.x, sh.y, len, ang);
  const taken = Math.min(5, Math.floor(ph * 6));
  return (
    <>
      <rect x={560} y={1175} width={460} height={26} rx={13} fill="#D6E6F5" opacity={enter} />
      <L.Blister cx={760} cy={1080} s={1.0 * enter} op={enter} taken={taken} />
      <L.PillBottle cx={940} cy={1090} s={0.7 * enter} op={enter} />
      <L.PersonPose cx={290} cy={1010} s={2.2 * enter} op={enter} color={MAIN} bow={lerp(0.1, -0.2, toHead)} />
      <L.ArmReach cx={sh.x} cy={sh.y} rot={ang} len={len} color={MAIN} op={enter} />
      <L.Tablet cx={tp.x + 10} cy={tp.y - 10} s={0.34} rot={ang} op={enter} />
      <BigText t={t} a={a + 0.2} b={b} y={430} lines={['ARV — ANTIRETROVIRAL']} size={52} color="#72E3D3" />
    </>
  );
};

// ---- Adegan 8: viral load ditekan. Partikel virus di pembuluh darah berkurang; grafik turun melewati batas deteksi (tetap di atas sumbu)
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const a = SCENE_T[6], b = SCENE_T[7];
  const enter = pr(t, a, a + 0.7, back);
  const k = pr(t, a + 0.8, b - 0.8, sine);
  const prog = pr(t, a + 1.2, b - 0.6, sine);
  const chart = pr(t, a + 1.0, a + 1.8, back);
  const N = 9;
  return (
    <>
      <L.Vessel cx={540} cy={760} w={1040} h={250} s={enter} op={enter} />
      {Array.from({ length: N }, (_, i) => {
        const fade = 1 - pr(t, a + 1.0 + (i / N) * (b - a - 2.2), a + 1.0 + (i / N) * (b - a - 2.2) + 0.7);
        const x = 120 + ((i * 117 - (t - a) * 55) % 860 + 860) % 860 + 30;
        return <Virus key={i} x={x} y={760 + ((i % 3) - 1) * 52} r={30} dim={fade * enter} t={t} seed={i} />;
      })}
      <L.LineChart cx={540} cy={1180} s={chart} op={chart} w={900} h={330} color="#F4D77E" threshold={0.2} points={[0.92, 0.78, 0.6, 0.42, 0.26, 0.14, 0.1, 0.09, 0.09]} progress={prog} smooth />
      <BigText t={t} a={a + 0.2} b={b - 0.2} y={430} lines={['JUMLAH VIRUS DITEKAN', 'TIDAK TERDETEKSI']} size={52} />
    </>
  );
};

// ---- Adegan 9: tidak lagi dapat ditularkan. Dua orang berdampingan; virus kecil tidak menyeberang
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const c1 = SCENE_T[7];
  const pA = pr(t, c1 - 0.2, c1 + 0.6, back);
  const pB = pr(t, c1, c1 + 0.8, back);
  const arrow = pr(t, c1 + 0.9, c1 + 1.7, sine);
  const cross = pr(t, c1 + 1.7, c1 + 2.3, back);
  const ok = pr(t, c1 + 2.0, c1 + 2.8);
  return (
    <>
      <L.PersonPose cx={270} cy={1060} s={2.0 * pA} op={pA} color={MAIN} bow={0.1} />
      <L.BodyLens cx={272} cy={1100} s={1.1 * pA} op={pA} />
      <L.PersonPose cx={810} cy={1060} s={2.0 * pB} op={pB} color={COM} />
      <line x1={420} y1={920} x2={lerp(420, 650, arrow)} y2={920} stroke="#EAF2FB" strokeWidth={14} strokeLinecap="round" strokeDasharray="6 22" opacity={0.85 * arrow} />
      <L.CrossBadge cx={540} cy={920} s={0.9 * cross} op={cross} />
      <L.CheckBadge cx={810} cy={780} s={0.8 * ok} op={ok} />
    </>
  );
};

// ---- Adegan 10: hidup tetap berjalan. Matahari terbit, berangkat kerja (mobil), meja makan bersama keluarga
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const s12 = T(12), c1 = CL(12, 1), c2 = CL(12, 2);
  const out1 = pr(t, c1 - 0.1, c1 + 0.4);
  const sun = pr(t, s12, s12 + 1.4, sine) * (1 - out1);
  const me = pr(t, s12 - 0.2, s12 + 0.5, back);
  const car = pr(t, c1, c1 + 0.2) * (1 - pr(t, c1 + 0.8, c1 + 1.2));
  const carX = lerp(-120, 1200, pr(t, c1, c1 + 1.3, sine));
  const tab = pr(t, c2, c2 + 0.6, back);
  const hrt = pr(t, c2 + 0.8, c2 + 1.5, back);
  return (
    <>
      <L.Sun cx={760} cy={lerp(1040, 780, sun)} s={1.5} op={sun} />
      <L.PersonPose cx={me > 0 ? lerp(320, 260, tab) : 320} cy={1010} s={2.0 * me} op={me} color={MAIN} bow={lerp(0.1, -0.4, sun)} />
      <rect x={0} y={1150} width={1080} height={14} rx={7} fill="#fff" opacity={0.25 * car} />
      <L.Car cx={carX} cy={1090} s={1.4} op={car} />
      <L.PersonPose cx={620} cy={940} s={1.15 * tab} op={tab} color={FAM} />
      <L.PersonPose cx={760} cy={940} s={1.15 * tab} op={tab} color={COM} />
      <L.PersonPose cx={880} cy={950} s={0.9 * tab} op={tab} color={FAM} />
      <L.DiningTable cx={760} cy={1040} w={560} op={tab} />
      <L.Heart cx={760} cy={720} s={0.6 * hrt} op={hrt} color={GREEN} />
    </>
  );
};

// ---- Adegan 11: persoalan kesehatan butuh pengobatan (dokter ungu memberi tablet); menghakimi = tangan menuding, disilang dan mundur
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const s13 = T(13), c1 = CL(13, 1);
  const me = pr(t, s13 - 0.2, s13 + 0.5, back);
  const dr = pr(t, s13, s13 + 0.7, back) * (1 - pr(t, c1 - 0.3, c1 + 0.3));
  const tb = pr(t, s13 + 1.0, s13 + 2.2, sine);
  const ok = pr(t, s13 + 2.3, s13 + 2.9, back) * (1 - pr(t, c1 - 0.3, c1 + 0.2));
  const hands = pr(t, c1 + 0.1, c1 + 0.8, back);
  const cross = pr(t, c1 + 0.9, c1 + 1.5, back);
  const back2 = pr(t, c1 + 1.5, c1 + 2.0, sine);
  const tAlpha = pr(t, s13 + 1.0, s13 + 1.3) * (1 - pr(t, c1 - 0.3, c1 + 0.2));
  return (
    <>
      <L.Doctor cx={250} cy={1040} s={2.0 * dr} op={dr} color={DOC} />
      <L.ArmReach cx={355} cy={1090} rot={lerp(10, -5, tb)} len={lerp(80, 220, tb)} color="#F4F8FF" op={dr} />
      <L.PersonPose cx={790} cy={1040} s={2.0 * me} op={me} color={MAIN} bow={0.1} />
      <L.Tablet cx={lerp(430, 640, tb)} cy={lerp(1090, 1050, tb)} s={0.8} rot={0} op={tAlpha} />
      <L.CheckBadge cx={790} cy={780} s={0.8 * ok} op={ok} />
      <L.PointHand cx={lerp(120, 420, hands) - 40 * back2} cy={900} s={1.3} flip op={hands * (1 - 0.85 * back2)} />
      <L.PointHand cx={lerp(120, 450, hands) - 40 * back2} cy={1040} s={1.3} flip op={hands * (1 - 0.85 * back2)} />
      <L.CrossBadge cx={560} cy={970} s={1.0 * cross} op={cross} />
    </>
  );
};

// ---- Adegan 12: yang dilawan virusnya. Virus terlepas dari dada dan menjauh; tokoh dipeluk orang lain
const Scene12: React.FC<{ t: number }> = ({ t }) => {
  const s14 = T(14), c1 = CL(14, 1);
  const me = pr(t, s14 - 0.2, s14 + 0.5, back);
  const lens = pr(t, s14, s14 + 0.5, back) * (1 - pr(t, s14 + 0.7, s14 + 1.1));
  const lift = pr(t, s14 + 0.8, c1 - 0.2, sine);
  const hug = pr(t, c1 + 0.1, c1 + 0.9, back);
  return (
    <>
      <L.PersonPose cx={540} cy={1020} s={2.1 * me * (1 - hug)} op={me * (1 - hug)} color={MAIN} bow={0.1} />
      <L.BodyLens cx={542} cy={1060} s={1.2 * lens} op={lens} />
      <Virus x={lerp(542, 880, lift)} y={lerp(1060, 700, lift)} r={lerp(20, 46, lift) * pr(t, s14 + 0.7, s14 + 1.0)} t={t} />
      <L.Embrace cx={540} cy={1010} s={2.0 * hug} op={hug} colorA={MAIN} colorB={COM} />
    </>
  );
};

const SCENES: { C: React.FC<{ t: number }>; cam: CamSpec }[] = [
  { C: Scene1, cam: { z0: 1.0, z1: 1.14, fx: 540, fy: 1000 } },
  { C: Scene2, cam: { z0: 1.0, z1: 1.0, fx: 540, fy: 1000, dy0: 0, dy1: 20 } },
  { C: Scene3, cam: { z0: 1.12, z1: 1.0, fx: 540, fy: 1000 } },
  { C: Scene45, cam: { z0: 1.12, z1: 1.0, fx: 300, fy: 1000, dx0: 0, dx1: -40 } },
  { C: Scene6, cam: { z0: 1.0, z1: 1.12, fx: 540, fy: 1000, dy0: 0, dy1: 30 } },
  { C: Scene7, cam: { z0: 1.12, z1: 1.0, fx: 540, fy: 1050 } },
  { C: Scene8, cam: { z0: 1.0, z1: 1.06, fx: 540, fy: 900 } },
  { C: Scene9, cam: { z0: 1.0, z1: 1.08, fx: 540, fy: 1000 } },
  { C: Scene10, cam: { z0: 1.0, z1: 1.06, fx: 540, fy: 1000 } },
  { C: Scene11, cam: { z0: 1.0, z1: 1.08, fx: 540, fy: 1000 } },
  { C: Scene12, cam: { z0: 1.0, z1: 1.1, fx: 540, fy: 1000 } },
];

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
export const S2E1AltFull: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = gradAt(t);
  let cue = CUES.find((c) => t >= c.a - 0.05 && t < c.b);
  if (!cue) { const prev = [...CUES].reverse().find((c) => c.b <= t); const nxt = CUES.find((c) => c.a - 0.05 > t); if (prev && nxt && nxt.a - prev.b < 1.4) cue = prev; } // tahan subtitle selama jeda
  const ck = cue ? Math.min(1, (t - cue.a + 0.05) / 0.18) : 0;
  const subOn = t < CLOSE - 0.05;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg,${g[0]} 0%,${g[1]} 55%,${g[2]} 100%)` }}>
      <AbsoluteFill style={{ background: 'radial-gradient(760px 760px at 50% 40%, rgba(120,190,255,0.22), transparent 70%)' }} />
      {t < CLOSE + 0.3 && (
        <AbsoluteFill style={{ transform: `scale(${settle(t)})`, transformOrigin: '50% 45%', opacity: 1 - ez(t, CLOSE - 0.1, CLOSE + 0.4) }}>
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0 }}>
            {SCENES.map(({ C, cam }, i) => (
              <SceneWrap key={i} i={i} t={t} cam={cam}>
                <C t={t} />
              </SceneWrap>
            ))}
          </svg>
          <LegendBox t={t} a={SCENE_T[6] + 0.3} b={SCENE_T[7] - 0.3} items={[['#FF9C85', 'Virus HIV'], ['#F4D77E', 'Jumlah virus'], ['#FF6B4D', 'Batas deteksi']]} />
          <LegendBox t={t} a={SCENE_T[5] + 0.3} b={SCENE_T[5] + 5.0} items={[['#FFA27B', 'Obat ARV']]} />
          <LegendBox t={t} a={SCENE_T[7] + 0.3} b={SCENE_T[8] - 0.2} items={[['#FF9C85', 'Virus HIV']]} />
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
