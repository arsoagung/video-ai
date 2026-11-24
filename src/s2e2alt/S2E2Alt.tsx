import React from 'react';
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { FONT, FPS } from '../Board';
import { ez, lerp, win, out3, sine, back, in3 } from '../motion';
import * as L from '../shared/library';
import { LIB_COL } from '../shared/library';
import { FlatVirus, FlatCell, SHAPE_COL } from '../shared/shapes';
import { Actor, ActorSide, Chair, POSES_FRONT, POSES_SIDE, NEUTRAL, NEUTRAL_SIDE } from '../shared/actor';
import type { ActorRole, Pose, SidePose } from '../shared/actor';
import { CUES, CLOSE, SCENE_T, T, CL, EP_DUR } from './timeline';

export const S2E2ALT_FRAMES = Math.ceil(EP_DUR * FPS);

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

// =============== tokoh: HANYA karakter modular resmi (src/shared/actor.tsx). Gerak = interpolasi sudut sendi antar pose per frame. ===============
type J3 = [number, number, number];
const cl = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const mj = (a: J3, b: J3, k: number): J3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const mixS = (a: SidePose, b: SidePose, k: number): SidePose => {
  const A = { ...NEUTRAL_SIDE, ...a }, B = { ...NEUTRAL_SIDE, ...b };
  return { lean: lerp(A.lean, B.lean, k), head: lerp(A.head, B.head, k), armN: mj(A.armN, B.armN, k), armF: mj(A.armF, B.armF, k), legN: mj(A.legN, B.legN, k), legF: mj(A.legF, B.legF, k) };
};
const mixF = (a: Pose, b: Pose, k: number): Pose => {
  const A = { ...NEUTRAL, ...a }, B = { ...NEUTRAL, ...b };
  return { lean: lerp(A.lean, B.lean, k), head: lerp(A.head, B.head, k), armL: mj(A.armL, B.armL, k), armR: mj(A.armR, B.armR, k), legL: mj(A.legL, B.legL, k), legR: mj(A.legR, B.legR, k) };
};
// siklus jalan: dua ujung langkah (N dan F bertukar), diinterpolasi dengan sinus
const JALAN_B: SidePose = { legN: POSES_SIDE.jalan.legF, legF: POSES_SIDE.jalan.legN, armN: POSES_SIDE.jalan.armF, armF: POSES_SIDE.jalan.armN, lean: 4 };
const jalan = (ph: number) => mixS(POSES_SIDE.jalan, JALAN_B, (Math.sin(ph) + 1) / 2);

const cyOf = (gy: number, s: number, seated = false) => gy - (seated ? 218 : 354) * s;
type SideProps = { x: number; gy: number; s: number; role: ActorRole; pose?: SidePose; face?: 1 | -1; seated?: boolean; chair?: boolean; op?: number };
// orang tampak samping; face = -1 mencerminkan (menghadap kiri). Kursi dan orang duduk berbagi titik pusat panggul.
const Hum: React.FC<SideProps> = ({ x, gy, s, role, pose, face = 1, seated = false, chair = false, op = 1 }) => {
  if (op < 0.005 || s < 0.01) return null;
  const cy = cyOf(gy, s, seated);
  return (
    <g transform={face === -1 ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
      {chair && <Chair cx={x} cy={cy} s={s} op={op} />}
      <ActorSide cx={x} cy={cy} s={s} role={role} pose={pose} op={op} />
    </g>
  );
};
const Fr: React.FC<{ x: number; gy: number; s: number; role: ActorRole; pose?: Pose; op?: number }> = ({ x, gy, s, role, pose, op = 1 }) =>
  op < 0.005 || s < 0.01 ? null : <Actor cx={x} cy={cyOf(gy, s)} s={s} role={role} pose={pose} op={op} />;

// posisi dunia dari titik lokal tampak samping (memperhitungkan lean dan cermin)
const sideW = (x: number, cy: number, s: number, face: number, lean: number, lx: number, ly: number) => {
  const r = (cl(lean, -20, 40) * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  const dx = lx, dy = ly + 50;
  return { x: x + face * s * (dx * c - dy * sn), y: cy + s * (dx * sn + dy * c - 50) };
};
const dirA = (deg: number) => [Math.sin((deg * Math.PI) / 180), Math.cos((deg * Math.PI) / 180)];
// pusat telapak tangan (sendi sudah dibatasi seperti di actor.tsx)
const handSide = (x: number, gy: number, s: number, pose: SidePose, face: 1 | -1, seated = false, which: 'armN' | 'armF' = 'armN') => {
  const P = { ...NEUTRAL_SIDE, ...pose };
  const a = P[which];
  const a0 = cl(a[0], -60, 165), a1 = cl(a[1], 0, 135);
  const u = dirA(a0), f = dirA(a0 + a1);
  return sideW(x, cyOf(gy, s, seated), s, face, P.lean, 4 + 108 * u[0] + 120 * f[0], -196 + 108 * u[1] + 120 * f[1]);
};
// IK dua ruas: sudut [bahu, siku, 0] supaya telapak tangan mencapai target (batas sendi diterapkan sesudahnya oleh actor.tsx)
const ikSide = (x: number, gy: number, s: number, pose: SidePose, face: 1 | -1, seated: boolean, target: { x: number; y: number }): J3 => {
  const cy = cyOf(gy, s, seated);
  const lean = cl(({ ...NEUTRAL_SIDE, ...pose }).lean, -20, 40);
  const r = (-lean * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
  const lx0 = ((target.x - x) * face) / s, ly0 = (target.y - cy) / s + 50;
  const lx = lx0 * c - ly0 * sn, ly = lx0 * sn + ly0 * c - 50;
  const vx = lx - 4, vy = ly + 196;
  const L1 = 108, L2 = 120;
  const d = cl(Math.hypot(vx, vy), Math.abs(L1 - L2) + 2, L1 + L2 - 0.5);
  const phi = (Math.atan2(vx, vy) * 180) / Math.PI;
  const al = (Math.acos(cl((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)) * 180) / Math.PI;
  const ga = (Math.acos(cl((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1)) * 180) / Math.PI;
  return [phi - al, 180 - ga, 0];
};
const GY = 1250; // garis tanah adegan dalam ruang
const Floor: React.FC<{ y?: number; op?: number }> = ({ y = GY, op = 1 }) => <rect x={-120} y={y} width={1320} height={14} rx={7} fill="#fff" opacity={0.2 * op} />;

// ======== adegan dengan karakter modular (src/shared/actor.tsx). Skala mikro (virus, darah, grafik) tetap library. ========
const S = 0.78; // skala standar tokoh (tinggi ±460 px)
const bump = (t: number, a: number, d = 0.7) => Math.sin(Math.PI * cl((t - a) / d, 0, 1));
const REACH: SidePose = { armN: [85, 15, 0] };
const READ: SidePose = { armN: [60, 112, 0], head: 22, lean: 8 };
const MINUM: SidePose = { armN: [78, 125, 0], head: -4 };

// ---- Adegan 1 (kalimat 1-3): dokter menyerahkan hasil tes ke "kamu" (positif HIV); kamu menunduk membaca, pertanyaan muncul; dokter menunjuk ke klinik, kamu perlahan tegak
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const s2 = T(2), s3 = T(3);
  const pop = pr(t, 0.1, 0.7, back);
  const kx = 330, dx = 690;
  const dP = mixS(mixS(mixS({}, REACH, pr(t, 0.3, 1.0, sine)), {}, pr(t, s2 + 0.5, s2 + 1.1, sine)), POSES_SIDE.menunjukAtas, pr(t, s3 + 0.2, s3 + 0.9, sine));
  const kP = mixS(mixS(mixS({}, REACH, pr(t, s2, s2 + 0.5, sine)), READ, pr(t, s2 + 0.5, s2 + 1.2, sine)), { armN: [22, 40, 0], head: 4 }, pr(t, s3 + 0.5, s3 + 1.5, sine));
  const taken = t >= s2 + 0.5;
  const hd = handSide(dx, GY, S, dP, -1);
  const hk = handSide(kx, GY, S, kP, 1);
  const h = taken ? hk : hd;
  const bub = pr(t, 1.1, 1.6, back) * (1 - pr(t, s2 + 0.1, s2 + 0.4));
  const q = [0, 1, 2].map((i) => pr(t, s2 + 0.9 + i * 0.25, s2 + 1.35 + i * 0.25, back) * (1 - pr(t, s3 + 0.1, s3 + 0.5)));
  const cl1 = pr(t, s3 + 0.6, s3 + 1.3, back);
  return (
    <>
      <Floor op={pop} />
      <Hum x={kx} gy={GY} s={S} role="blue" pose={kP} op={pop} />
      <Hum x={dx} gy={GY} s={S} role="purple" pose={dP} face={-1} op={pop} />
      <L.Document cx={h.x + (taken ? 8 : -8)} cy={h.y} s={0.5 * pop} op={pop} rot={taken ? 8 : -6} />
      <L.SpeechBubble cx={dx - 20} cy={560} s={0.95 * bub} op={bub} text="positif HIV" w={400} tail="r" />
      {[[190, 640, 'l'], [370, 540, 'r'], [530, 650, 'r']].map(([x, y, tl], i) => (
        <L.SpeechBubble key={i} cx={x as number} cy={y as number} s={0.8 * q[i]} op={q[i]} text="?" w={140} tail={tl as 'l' | 'r'} />
      ))}
      <L.Clinic cx={870} cy={560} s={0.8 * cl1} op={cl1} />
    </>
  );
};

// ---- Adegan 2 (kalimat 4): minum ARV setiap hari: tablet dari strip terbang ke mulut, kamu mengangkat tangan tiap kali, kalender terisi
const Scene2: React.FC<{ t: number }> = ({ t }) => {
  const s4 = T(4);
  const pop = pr(t, s4 - 0.3, s4 + 0.3, back);
  const kx = 280;
  const n = 4;
  const arr = Array.from({ length: n }, (_, i) => s4 + 0.9 + i * 0.6);
  const pulse = Math.max(...arr.map((a) => bump(t, a - 0.35, 0.7)));
  const kP = mixS({}, MINUM, pulse);
  const mouth = sideW(kx, cyOf(GY, S), S, 1, 0, 40, -292);
  const fl = arr.map((a) => pr(t, a - 0.55, a, sine));
  const taken = fl.filter((k) => k >= 0.99).length;
  return (
    <>
      <Floor op={pop} />
      <Hum x={kx} gy={GY} s={S} role="blue" pose={kP} op={pop} />
      <L.Calendar cx={760} cy={800} s={1.4 * pop} op={pop} marks={Array.from({ length: taken }, (_, i) => i)} markColor="#72E3D3" />
      <L.Blister cx={760} cy={1130} s={1.15 * pop} op={pop} taken={taken} />
      {fl.map((k, i) =>
        k > 0.01 && k < 0.99 ? <L.Tablet key={i} cx={lerp(700 + i * 30, mouth.x, k)} cy={lerp(1110, mouth.y, k) - 140 * Math.sin(k * Math.PI)} s={0.5} rot={lerp(-20, 20, k)} op={1 - 0.5 * k} /> : null,
      )}
    </>
  );
};

// ---- Adegan 3 (kalimat 5): jumlah virus di darah dipantau berkala: dokter menunjuk tabung darah yang diperiksa kaca pembesar tiga kali, jam melompat tiap pemeriksaan
const Scene3: React.FC<{ t: number }> = ({ t }) => {
  const s5 = T(5);
  const pop = pr(t, s5 - 0.3, s5 + 0.4, back);
  const mg = pr(t, s5 + 0.2, s5 + 0.8, back);
  const checks = [0, 1, 2].map((i) => pr(t, s5 + 0.9 + i * 0.75, s5 + 1.3 + i * 0.75, back));
  const nChk = checks.filter((k) => k > 0.5).length;
  const dP = mixS({}, { armN: [78, 20, 0], head: 6 }, pr(t, s5 + 0.2, s5 + 0.8, sine));
  const bob = Math.sin(Math.max(0, t - s5 - 0.8) * 5.5) * 12;
  const mx = 600;
  return (
    <>
      <Floor op={pop} />
      <Hum x={200} gy={GY} s={S} role="purple" pose={dP} op={pop} />
      <L.BloodTube cx={mx} cy={1000} s={1.5 * pop} op={pop} level={0.7} />
      <g opacity={mg}>
        <L.Magnifier cx={mx + 40} cy={870 + bob} s={1.2 * mg} />
        <defs><clipPath id="lensA"><circle cx={mx + 40} cy={870 + bob} r={92 * 1.2 * mg} /></clipPath></defs>
        <g clipPath="url(#lensA)"><Virus x={mx + 40} y={870 + bob} r={32 * mg} t={t} /></g>
      </g>
      <L.Clock cx={880} cy={780} s={1.1 * pop} op={pop} frac={Math.min(0.98, nChk / 3)} hour={2 + nChk * 3} />
      {checks.map((k, i) => (
        <L.CheckBadge key={i} cx={780 + i * 100} cy={1010} s={0.36 * k} op={k} />
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
  const gy = 1230, ss = 0.7;
  return (
    <>
      <L.Blister cx={310} cy={880} s={1.5 * bl} op={bl} taken={taken} />
      <L.BloodTube cx={780} cy={900} s={1.3 * tube} op={tube} level={0.78} />
      <Virus x={780} y={900} r={12 * tube} dim={0.9} t={t} />
      <L.CheckBadge cx={780} cy={1160} s={0.7 * ok} op={ok} />
      <Fr x={240} gy={gy} s={ss * pA} role="blue" op={pA} />
      <Virus x={240} y={gy - 494 * ss} r={26 * pA} t={t} />
      <Fr x={840} gy={gy} s={ss * pB} role="yellow" op={pB} pose={mixF({}, { head: 8 }, hold)} />
      <line x1={400} y1={900} x2={lerp(400, 680, arrow)} y2={900} stroke="#EAF2FB" strokeWidth={14} strokeLinecap="round" strokeDasharray="6 22" opacity={0.85 * arrow * (1 - 0.5 * hold)} />
      <L.CrossBadge cx={540} cy={900} s={0.9 * cross} op={cross} />
      <L.Blister cx={540} cy={1170} s={0.75 * bl2} op={bl2} taken={taken2} />
    </>
  );
};

// ---- Adegan 7 (kalimat 9): "U sama dengan U" tampil sebagai teks sederhana (istilah resmi U=U)
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const s9 = T(9);
  const k = pr(t, s9 + 0.1, s9 + 0.8, back);
  return (
    <text x={540} y={960} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={190} fill="#72E3D3" opacity={k} transform={`translate(0 ${(1 - k) * 24})`}>
      U = U
    </text>
  );
};

// ---- Adegan 8 (kalimat 10): fasilitas pemerintah (klinik); ARV gratis: tablet mengalir dari klinik ke tangan kamu, koin disilang
const Scene8: React.FC<{ t: number }> = ({ t }) => {
  const s10 = T(10), c1 = CL(10, 1);
  const cl = pr(t, s10, s10 + 0.7, back);
  const me = pr(t, s10 + 0.3, s10 + 0.9, back);
  const kx = 850;
  const kP = mixS({}, { armN: [80, 20, 0], head: 4 }, pr(t, c1, c1 + 0.5, sine));
  const hand = handSide(kx, GY, S, kP, -1);
  const n = 3;
  const fl = Array.from({ length: n }, (_, i) => pr(t, c1 + 0.2 + i * 0.5, c1 + 1.0 + i * 0.5, sine));
  const coin = pr(t, c1 + 0.2, c1 + 0.8, back);
  const cross = pr(t, c1 + 1.0, c1 + 1.6, back);
  return (
    <>
      <Floor op={me} />
      <L.Clinic cx={260} cy={1060} s={1.5 * cl} op={cl} />
      <Hum x={kx} gy={GY} s={S} role="blue" pose={kP} face={-1} op={me} />
      {fl.map((k, i) =>
        k > 0.01 && k < 0.99 ? <L.Tablet key={i} cx={lerp(440, hand.x, k)} cy={lerp(1150, hand.y, k) - 90 * Math.sin(k * Math.PI)} s={0.5} op={1} /> : null,
      )}
      <L.Coin cx={540} cy={720} s={0.8 * coin} op={coin} />
      <L.CrossBadge cx={540} cy={720} s={0.7 * cross} op={cross} />
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
      <Floor op={me} />
      <Fr x={230} gy={GY} s={0.72 * me} role="blue" op={me} pose={POSES_FRONT.tanganDiDada} />
      <L.Document cx={520} cy={930} s={1.7 * doc} op={doc} rot={-4} />
      <L.Lock cx={590} cy={lerp(600, 1000, drop)} s={1.4} op={pr(t, s11 + 0.6, s11 + 0.9)} open={drop < 0.95} />
      <Fr x={820} gy={GY} s={0.6 * obs} role="teal" op={obs} pose={{ head: 14 }} />
      <Fr x={950} gy={GY} s={0.6 * obs} role="teal" op={obs} pose={{ head: -14 }} />
      <L.CrossBadge cx={885} cy={830} s={0.6 * cross} op={cross} />
      <L.TestKit cx={880} cy={1010} s={0.9 * kit} op={kit} lines={1} />
      <L.CheckBadge cx={880} cy={730} s={0.55 * ok} op={ok} />
    </>
  );
};

// ---- Adegan 10 (kalimat 12): stigma dan diskriminasi dihapus: kelompok menuding kamu, tudingan disilang dan tangan turun, lalu kelompok bergeser mendekat dan menaruh tangan di bahu
const Scene10: React.FC<{ t: number }> = ({ t }) => {
  const s12 = T(12), c1 = s12 + 1.7;
  const me = pr(t, s12 - 0.2, s12 + 0.4, back);
  const gr = pr(t, s12 + 0.1, s12 + 0.7, back);
  const point = pr(t, s12 + 0.5, s12 + 1.0, back) * (1 - pr(t, c1 + 0.3, c1 + 0.8, sine));
  const cross = pr(t, c1 - 0.2, c1 + 0.4, back) * (1 - pr(t, c1 + 0.6, c1 + 1.0));
  const near = pr(t, c1 + 0.5, c1 + 2.0, sine);
  const bob = near > 0.01 && near < 0.99 ? Math.abs(Math.sin(near * 18)) * 10 : 0;
  const touch = pr(t, c1 + 1.9, c1 + 2.5, sine);
  const armR: J3 = mj(mj([7, 0, 0], [80, -4, 0], point), [75, -10, 0], touch);
  const gp: Pose = { armR, head: -6 * point };
  const kP = mixF({ head: 14, lean: 6 }, {}, pr(t, c1 + 1.4, c1 + 2.4, sine));
  const heart = pr(t, c1 + 2.2, c1 + 2.8, back);
  const ax = lerp(150, 534, near), bx = lerp(-20, 268, near);
  return (
    <>
      <Floor op={me} />
      <Fr x={800} gy={GY} s={0.72 * me} role="blue" op={me} pose={kP} />
      <Fr x={bx} gy={GY - bob} s={0.72 * gr} role="teal" op={gr} pose={gp} />
      <Fr x={ax} gy={GY - bob} s={0.72 * gr} role="teal" op={gr} pose={gp} />
      <L.CrossBadge cx={560} cy={820} s={0.7 * cross} op={cross} />
      <L.Heart cx={800} cy={590} s={0.7 * heart} op={heart} color="#7ED6A8" />
    </>
  );
};

// ---- Adegan 11 (kalimat 13): minum ARV rutin (tablet ke mulut) -> hidup normal (berjalan pulang ke rumah)
const Scene11: React.FC<{ t: number }> = ({ t }) => {
  const s13 = T(13), c1 = CL(13, 1);
  const pop = pr(t, s13 - 0.2, s13 + 0.4, back);
  const bl = pr(t, s13, s13 + 0.6, back) * (1 - pr(t, c1 - 0.2, c1 + 0.3));
  const arr = [s13 + 0.9, s13 + 1.5, s13 + 2.1].filter((a) => a < c1 - 0.2);
  const pulse = Math.max(0, ...arr.map((a) => bump(t, a - 0.35, 0.7)));
  const walk = pr(t, c1 + 0.2, c1 + 2.2, sine);
  const kx = lerp(300, 620, walk);
  const kP = mixS(mixS({}, MINUM, pulse), jalan(t * 6), pr(t, c1 + 0.1, c1 + 0.4) * (1 - pr(t, c1 + 2.0, c1 + 2.3)));
  const home = pr(t, c1 + 0.1, c1 + 0.7, back);
  const hrt = pr(t, c1 + 1.8, c1 + 2.4, back);
  const mouth = sideW(300, cyOf(GY, S), S, 1, 0, 40, -292);
  const fl = arr.map((a) => pr(t, a - 0.55, a, sine));
  return (
    <>
      <Floor op={pop} />
      <Hum x={kx} gy={GY} s={S} role="blue" pose={kP} op={pop} />
      <L.Blister cx={740} cy={1130} s={1.2 * bl} op={bl} taken={fl.filter((k) => k >= 0.99).length} />
      {fl.map((k, i) =>
        k > 0.01 && k < 0.99 ? <L.Tablet key={i} cx={lerp(700, mouth.x, k)} cy={lerp(1110, mouth.y, k) - 130 * Math.sin(k * Math.PI)} s={0.5} rot={lerp(-20, 20, k)} /> : null,
      )}
      <L.Home cx={860} cy={1080} s={1.5 * home} op={home} />
      <L.Heart cx={860} cy={780} s={0.7 * hrt} op={hrt} color="#7ED6A8" />
    </>
  );
};

// ---- Adegan 12 (kalimat 14): hasil positif bukan akhir: kamu berjalan di jalan yang terus ke depan, matahari terbit menyambut, lengan terangkat lega
const Scene12: React.FC<{ t: number }> = ({ t }) => {
  const s14 = T(14);
  const road = pr(t, s14 - 0.2, s14 + 0.5, back);
  const x = lerp(160, 560, pr(t, s14 + 0.1, s14 + 2.2, sine));
  const sun = pr(t, s14 + 0.5, s14 + 2.2, sine);
  const lift = pr(t, s14 + 1.9, s14 + 2.6, sine);
  const walking = pr(t, s14 + 0.1, s14 + 0.4) * (1 - pr(t, s14 + 2.0, s14 + 2.3));
  const kP = mixS(mixS({}, jalan(t * 6), walking), POSES_SIDE.menunjukAtas, lift);
  return (
    <>
      <defs><clipPath id="hz12a"><rect x={0} y={0} width={1080} height={1095} /></clipPath></defs>
      <g clipPath="url(#hz12a)"><L.Sun cx={780} cy={lerp(1190, 760, sun)} s={1.7} op={pr(t, s14 + 0.3, s14 + 0.7)} /></g>
      <L.Road cx={540} cy={1200} s={1.0 * road} op={road} w={1000} h={220} />
      <Hum x={x} gy={1215} s={S} role="blue" pose={kP} op={road} />
    </>
  );
};

// ---- Adegan 13 (kalimat 15): awal perawatan (dokter + klinik + tablet), lalu tidak sendirian: keluarga dan teman melangkah ke samping, tangan di bahu
const Scene13: React.FC<{ t: number }> = ({ t }) => {
  const s15 = T(15), c1 = CL(15, 1);
  const me = pr(t, s15 - 0.2, s15 + 0.4, back);
  const cl = pr(t, s15, s15 + 0.7, back) * (1 - pr(t, c1 + 0.3, c1 + 0.8));
  const tb = pr(t, s15 + 0.6, s15 + 1.4, sine) * (1 - pr(t, c1 - 0.2, c1 + 0.2));
  const gr = pr(t, c1 - 0.1, c1 + 0.5, back);
  const near = pr(t, c1 + 0.3, c1 + 1.5, sine);
  const bob = near > 0.01 && near < 0.99 ? Math.abs(Math.sin(near * 16)) * 10 : 0;
  const touch = pr(t, c1 + 1.4, c1 + 2.0, sine);
  const aP = mixF({}, { armR: [75, -10, 0] }, touch);
  const bP = mixF({}, { armL: [75, -10, 0] }, touch);
  const kP = mixF({}, { head: 6 }, bump(t, c1 + 1.5, 1.0));
  const heart = pr(t, c1 + 1.8, c1 + 2.4, back);
  return (
    <>
      <Floor op={me} />
      <Fr x={540} gy={GY} s={0.72 * me} role="blue" op={me} pose={kP} />
      <L.Clinic cx={230} cy={800} s={1.05 * cl} op={cl} />
      <Fr x={850} gy={GY} s={0.7 * cl} role="purple" op={cl} />
      <L.Tablet cx={lerp(400, 620, tb)} cy={lerp(900, 960, tb)} s={0.6} op={pr(t, s15 + 0.6, s15 + 0.9) * (1 - pr(t, c1 - 0.2, c1 + 0.2))} />
      <Fr x={lerp(-60, 274, near)} gy={GY - bob} s={0.72 * gr} role="yellow" op={gr} pose={aP} />
      <Fr x={lerp(1140, 806, near)} gy={GY - bob} s={0.72 * gr} role="teal" op={gr} pose={bP} />
      <L.Heart cx={540} cy={590} s={0.7 * heart} op={heart} color="#7ED6A8" />
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
export const S2E2AltFull: React.FC = () => {
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

