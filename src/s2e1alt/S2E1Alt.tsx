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

// ---- Adegan 1: ruang konsultasi. Tokoh utama (kiri, duduk) dan dokter (kanan, duduk, menghadap kiri); dokter menyerahkan hasil pemeriksaan, tokoh menerima dengan tangan terulur
const Scene1: React.FC<{ t: number }> = ({ t }) => {
  const a = CL(2, 0) - 0.4, b = CL(2, 1) - 0.1;
  const enter = pr(t, 0.2, 1.0, back);
  const hand = pr(t, a, b, sine);
  const S = 0.9, bx = 345, dx = 735;
  const rest = POSES_SIDE.duduk;
  const mePose = mixS({ ...rest, head: 4 }, { ...rest, head: 10, armN: [78, 12, 0] }, hand);
  const drPose = mixS(rest, { ...rest, armN: [82, 10, 0] }, hand);
  const dH = handSide(dx, 1390, S * enter, drPose, -1, true);
  const mH = handSide(bx, 1390, S * enter, mePose, 1, true);
  const k = hand * 0.55;
  return (
    <>
      <Floor y={1390} op={enter} />
      <Hum x={bx} gy={1390} s={S * enter} role="blue" pose={mePose} seated chair op={enter} />
      <Hum x={dx} gy={1390} s={S * enter} role="purple" pose={drPose} face={-1} seated chair op={enter} />
      <L.Document cx={lerp(dH.x, mH.x, k) - 4} cy={lerp(dH.y, mH.y, k) - 26} s={0.5 * enter} op={enter} rot={-6} />
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
  const S = 0.85, X = 520, G2 = 1340;
  const pose = mixS(
    { lean: 6, head: 4, armN: [30, 75, 0], armF: [28, 72, 0] },
    { lean: 30, head: 24, armN: [34, 82, 0], armF: [30, 78, 0] },
    mv,
  );
  const actorOp = pr(t, a, a + 0.6);
  const hh = handSide(X, G2, S, pose, 1);
  const sc = lerp(3.4, 0.7, mv);
  return (
    <>
      <rect x={-200} y={-200} width={1500} height={2400} fill="#06122B" opacity={dimK} />
      <Hum x={X} gy={G2} s={S} role="blue" pose={pose} op={actorOp} />
      <g transform={`translate(${lerp(540, hh.x + 6, mv)} ${lerp(940, hh.y - 14, mv)}) scale(${sc})`}>
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
  const mePose = mixF(POSES_FRONT.berdiri, { ...POSES_FRONT.tanganDiDada, head: 16, lean: 5 }, tight);
  return (
    <>
      <Fr x={540} gy={1330} s={0.8 * enter} role="blue" pose={mePose} op={enter} />
      <circle cx={540} cy={640} r={86 * bubble} fill="#fff" opacity={0.18 * bubble} />
      <text x={540} y={668} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={90 * bubble} fill="#fff" opacity={0.7 * bubble}>?</text>
      {pos.map(([x, y], i) => (
        <g key={i} opacity={ks[i]} transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * ks[i]})`}>
          <circle r={122} fill="#fff" opacity={0.15} />
          {i === 0 && <L.Heart cx={0} cy={4} s={0.9} color={GREEN} />}
          {i === 1 && (
            <>
              <L.Home cx={0} cy={-22} s={0.7} />
              <Fr x={-34} gy={84} s={0.16} role="yellow" />
              <Fr x={34} gy={84} s={0.16} role="yellow" />
            </>
          )}
          {i === 2 && <Fr x={0} gy={88} s={0.25} role="teal" />}
          {i === 3 && (
            <>
              <Fr x={-50} gy={84} s={0.17} role="teal" />
              <Fr x={50} gy={84} s={0.17} role="teal" />
              <Fr x={0} gy={90} s={0.2} role="yellow" />
            </>
          )}
        </g>
      ))}
    </>
  );
};

// ---- Adegan 4+5: tokoh di depan menatap kelompok di kejauhan (di dalam panel pikiran); kelompok perlahan berjalan menjauh (ketakutan, bukan kenyataan); pelukan penerimaan terlepas
const Scene45: React.FC<{ t: number }> = ({ t }) => {
  const s5 = T(5), s6 = T(6), c2 = CL(7, 2);
  const enter = pr(t, s5 - 0.3, s5 + 0.5, back);
  const panel = pr(t, s5, s5 + 0.8, back);
  const away = pr(t, s6 + 0.1, s6 + 2.2, sine);
  const hug = pr(t, c2 - 0.2, c2 + 0.6, back);
  const hugGo = pr(t, c2 + 1.4, c2 + 3.0, sine);
  const roles: ActorRole[] = ['yellow', 'teal', 'teal', 'yellow'];
  const mePose = mixS({ head: 12, lean: 8 }, { head: 22, lean: 14 }, away);
  // pelukan: dua tokoh depan, lengan melingkar; lepas = lengan membuka dan menjauh
  const open = hugGo;
  const hugPoseL = mixF({ lean: 8, head: 8, armL: [8, 0, 0], armR: [70, -75, 0] }, { lean: 0, head: 0, armL: [8, 0, 0], armR: [20, -10, 0] }, open);
  const hugPoseR = mixF({ lean: -8, head: -8, armR: [8, 0, 0], armL: [70, -75, 0] }, { lean: 0, head: 0, armR: [8, 0, 0], armL: [20, -10, 0] }, open);
  const hs = 0.5 * hug * (1 - 0.4 * hugGo);
  const sep = lerp(92, 150, open) * hs / 0.5;
  return (
    <>
      <ellipse cx={690} cy={840} rx={300 * panel} ry={210 * panel} fill="#fff" opacity={0.12} />
      {roles.map((r, i) => {
        const x = 600 + i * 78 + away * (60 + i * 40);
        const ph = t * 7 + i * 1.7;
        const pose = away < 0.02 ? POSES_SIDE.berdiri : mixS(POSES_SIDE.berdiri, jalan(ph), Math.min(1, away * 6));
        return <Hum key={i} x={x} gy={1000 + (i % 2) * 14 - away * 10} s={(0.4 - 0.15 * away) * panel} role={r} pose={pose} op={panel * (1 - 0.75 * away)} />;
      })}
      <g opacity={hug * (1 - hugGo)}>
        <Fr x={690 - sep / 2} gy={1000} s={hs} role="yellow" pose={hugPoseL} op={hug * (1 - hugGo)} />
        <Fr x={690 + sep / 2} gy={1000} s={hs} role="teal" pose={hugPoseR} op={hug * (1 - hugGo)} />
        <L.Heart cx={690} cy={1000 - 354 * hs - 30} s={0.55 * hug} color={GREEN} />
      </g>
      <Hum x={250} gy={1330} s={0.95 * enter} role="blue" pose={mePose} op={enter} />
    </>
  );
};

// ---- Adegan 6: bukan akhir kehidupan. Tokoh menegakkan badan perlahan, latar menerang, matahari terbit
const Scene6: React.FC<{ t: number }> = ({ t }) => {
  const a = SCENE_T[4], b = SCENE_T[5];
  const k = pr(t, a + 0.3, b - 0.2, sine);
  const sun = pr(t, a + 0.4, b, sine);
  const pose = mixS(POSES_SIDE.membungkuk, { lean: 0, head: -10, armN: [14, 10, 0], armF: [10, 8, 0] }, k);
  return (
    <>
      <L.Sun cx={830} cy={lerp(1000, 760, sun)} s={1.6} op={0.85 * sun} />
      <BigText t={t} a={a + 0.2} b={b + 0.1} y={400} lines={['DIAGNOSIS BUKAN', 'AKHIR KEHIDUPAN']} size={62} />
      <Floor y={1340} />
      <Hum x={400} gy={1340} s={0.9} role="blue" pose={pose} />
    </>
  );
};

// ---- Adegan 7: pengobatan ARV sebagai rutinitas. Tangan mengambil obat dari strip di meja, membawa ke arah mulut, kembali
const Scene7: React.FC<{ t: number }> = ({ t }) => {
  const a = SCENE_T[5], b = SCENE_T[6];
  const enter = pr(t, a, a + 0.6, back);
  const ph = pr(t, a + 0.6, b - 0.3, sine); // 0..1 sepanjang aksi
  const reach = ph < 0.35 ? ph / 0.35 : ph < 0.7 ? 1 : 1 - (ph - 0.7) / 0.3;
  const toHead = ph < 0.35 ? 0 : ph < 0.7 ? (ph - 0.35) / 0.35 : 1 - (ph - 0.7) / 0.3 * 1;
  const S = 0.8, X = 330, G7 = 1310;
  const cy = cyOf(G7, S);
  const table = 985;
  const pill = { x: 500, y: table - 36 };
  const mouth = sideW(X, cy, S, 1, 4, 78, -282);
  const rest = { x: X + 70, y: cy + 10 };
  // target tangan: diam di sisi badan -> strip obat -> mulut -> kembali
  const tgt = toHead > 0 ? { x: lerp(pill.x, mouth.x, toHead), y: lerp(pill.y, mouth.y, toHead) } : { x: lerp(rest.x, pill.x, reach), y: lerp(rest.y, pill.y, reach) };
  const base: SidePose = { lean: 4, head: -4 * toHead };
  const arm = ikSide(X, G7, S, base, 1, false, tgt);
  const pose: SidePose = { ...base, armN: arm };
  const hp = handSide(X, G7, S, pose, 1);
  const taken = Math.min(5, Math.floor(ph * 6));
  const hasPill = reach > 0.35 && toHead < 0.98 && ph < 0.95;
  return (
    <>
      <Floor y={G7} op={enter} />
      <g opacity={enter}>
        <rect x={430} y={table} width={620} height={26} rx={13} fill="#D6E6F5" />
        <rect x={462} y={table + 26} width={22} height={G7 - table - 26} rx={10} fill={LIB_COL.track} />
        <rect x={996} y={table + 26} width={22} height={G7 - table - 26} rx={10} fill={LIB_COL.track} />
      </g>
      <L.Blister cx={640} cy={table - 54} s={0.9 * enter} op={enter} taken={taken} />
      <L.PillBottle cx={930} cy={table - 52} s={0.7 * enter} op={enter} />
      <Hum x={X} gy={G7} s={S * enter} role="blue" pose={pose} op={enter} />
      {hasPill && <L.Tablet cx={hp.x + 14} cy={hp.y - 6} s={0.26} rot={-30} op={enter} />}
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

// ---- Adegan 9: tidak lagi dapat ditularkan. Dua orang berhadapan; virus kecil tidak menyeberang
const Scene9: React.FC<{ t: number }> = ({ t }) => {
  const c1 = SCENE_T[7];
  const pA = pr(t, c1 - 0.2, c1 + 0.6, back);
  const pB = pr(t, c1, c1 + 0.8, back);
  const arrow = pr(t, c1 + 0.9, c1 + 1.7, sine);
  const cross = pr(t, c1 + 1.7, c1 + 2.3, back);
  const ok = pr(t, c1 + 2.0, c1 + 2.8);
  const S = 0.78, G9 = 1330;
  const chest = sideW(270, cyOf(G9, S), S, 1, 0, 20, -110);
  return (
    <>
      <Floor y={G9} op={pA} />
      <Hum x={270} gy={G9} s={S * pA} role="blue" pose={{ head: 4 }} op={pA} />
      <L.BodyLens cx={chest.x} cy={chest.y} s={1.0 * pA} op={pA} />
      <Hum x={810} gy={G9} s={S * pB} role="teal" face={-1} pose={{ head: 2 }} op={pB} />
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
  const G10 = 1230;
  const mePose = mixS({ lean: 2, head: 4 }, { lean: -2, head: -12, armN: [26, 14, 0], armF: [20, 10, 0] }, sun);
  const mx = me > 0 ? lerp(320, 250, tab) : 320;
  const ST = 0.45;
  const fPose = { ...POSES_SIDE.duduk, armN: [40, 60, 0] as J3 };
  return (
    <>
      <L.Sun cx={760} cy={lerp(1040, 780, sun)} s={1.5} op={sun} />
      <Floor y={G10} />
      <Hum x={mx} gy={G10} s={0.8 * me} role="blue" pose={mePose} op={me} />
      <L.Car cx={carX} cy={1190} s={1.4} op={car} />
      <Hum x={650} gy={1180} s={ST * tab} role="yellow" pose={fPose} seated chair op={tab} />
      <Fr x={765} gy={1085} s={0.4 * tab} role="teal" op={tab} />
      <Hum x={880} gy={1180} s={ST * tab} role="yellow" pose={fPose} face={-1} seated chair op={tab} />
      <L.DiningTable cx={765} cy={1042} w={560} op={tab} />
      <L.Heart cx={765} cy={720} s={0.6 * hrt} op={hrt} color={GREEN} />
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
  const S = 0.8, G11 = 1320, dx = 330, mx0 = 740;
  const mx = mx0 + 40 * back2;
  // dokter: lengan kanan terulur membawa tablet; tokoh: lengan menyambut
  const dBase: SidePose = { head: 2, lean: 2 };
  const drRest = { x: dx + 60, y: cyOf(G11, S) + 20 };
  const mid = { x: (dx + mx0) / 2 + 10, y: cyOf(G11, S) - 40 };
  const tabletPos = { x: lerp(drRest.x, mid.x, tb), y: lerp(drRest.y, mid.y, tb) };
  const dArm = ikSide(dx, G11, S, dBase, 1, false, tabletPos);
  const mBase: SidePose = { head: 6 * (1 - back2) + 12 * back2, lean: lerp(2, -8, back2) };
  const mRest = { x: mx0 - 50, y: cyOf(G11, S) + 20 };
  const mArm = ikSide(mx, G11, S, mBase, -1, false, { x: lerp(mRest.x, mid.x + 46, tb * (1 - back2)), y: lerp(mRest.y, mid.y, tb * (1 - back2)) });
  return (
    <>
      <Floor y={G11} />
      <Hum x={dx} gy={G11} s={S * dr} role="purple" pose={{ ...dBase, armN: dArm }} op={dr} />
      <Hum x={mx} gy={G11} s={S * me} role="blue" face={-1} pose={{ ...mBase, armN: mArm }} op={me} />
      <L.Tablet cx={tabletPos.x + 12} cy={tabletPos.y - 4} s={0.5} rot={0} op={tAlpha} />
      <L.CheckBadge cx={mx} cy={640} s={0.8 * ok} op={ok} />
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
  const S = 0.8, G12 = 1330;
  const sx = lerp(0, 92, hug);
  const mePose = mixF({ head: 0 }, { lean: 8, head: 10, armL: [8, 0, 0], armR: [72, -75, 0] }, hug);
  const frPose = mixF({ armL: [20, -10, 0] }, { lean: -8, head: -10, armR: [8, 0, 0], armL: [72, -75, 0] }, hug);
  const chestY = cyOf(G12, S) - 120 * S;
  return (
    <>
      <Floor y={G12} op={me} />
      <Fr x={540 - sx} gy={G12} s={S * me} role="blue" pose={mePose} op={me} />
      <L.BodyLens cx={540} cy={chestY} s={1.2 * lens} op={lens} />
      <Virus x={lerp(540, 880, lift)} y={lerp(chestY, 700, lift)} r={lerp(20, 46, lift) * pr(t, s14 + 0.7, s14 + 1.0)} t={t} />
      <Fr x={540 + sx + 40 * (1 - hug)} gy={G12} s={S * hug} role="teal" pose={frPose} op={hug} />
      <L.Heart cx={540} cy={cyOf(G12, S) - 354 * S - 100} s={0.7 * hug} op={hug} color={GREEN} />
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
