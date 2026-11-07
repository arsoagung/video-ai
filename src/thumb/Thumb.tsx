import React from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from 'remotion';
import { FONT } from '../Board';
import { FlatCell, FlatVirus, Figure, SHAPE_COL } from '../shared/shapes';
import { Glass, VDot, WATER_CLEAR } from '../ep5/shapes5';

// Thumbnail 9:16 (1080x1920) untuk "Apa bedanya HIV dan AIDS?". Tokoh dari src/shared/shapes.tsx, logo asli.
export const THUMB_W = 1080;
export const THUMB_H = 1920;

// Tema latar = gradien dari video (pilih yang sama dengan warna dominan videonya).
export const THEMES = {
  biru: ['#0A1F3D', '#123A60', '#17506F'] as [string, string, string], // biru laut (pembuka/sel)
  indigo: ['#13194A', '#25306E', '#35487F'] as [string, string, string], // indigo (grafik/tanpa pengobatan)
  teal: ['#082C3A', '#0E5A63', '#1C8A85'] as [string, string, string], // hijau teal (ARV/pemulihan)
  biruLembut: ['#14264A', '#2A4F7E', '#3F7C9A'] as [string, string, string], // biru lembut (penutup)
  ungu: ['#14183F', '#2A2A6B', '#3B4A8A'] as [string, string, string], // ungu-indigo (di dalam sel)
};

const useFonts = () => {
  const [handle] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    Promise.all(
      ([[400, 'plus-jakarta-sans-latin-400-normal.woff2'], [600, 'plus-jakarta-sans-latin-600-normal.woff2'], [800, 'plus-jakarta-sans-latin-800-normal.woff2']] as [number, string][]).map(async ([w, file]) => {
        const ff = new FontFace('Plus Jakarta Sans', `url(${staticFile('fonts/' + file)})`, { weight: String(w) });
        await ff.load();
        document.fonts.add(ff);
      }),
    )
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

const CORAL = '#FFB7A5';
const RED = '#FF8A7A';
const TEAL = '#72E3D3';
const WHITE = '#FFFFFF';

const Bg: React.FC<{ g: [string, string, string]; glowY?: number }> = ({ g, glowY = 1200 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg,${g[0]} 0%,${g[1]} 55%,${g[2]} 100%)` }}>
    <AbsoluteFill style={{ background: `radial-gradient(800px 800px at 540px ${glowY}px, rgba(120,190,255,0.22), transparent 70%)` }} />
  </AbsoluteFill>
);

// Logo Makna Positif asli (area isi 1067x601 dari 1254x1254), putih transparan.
const Logo: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => {
  const sc = w / 1067;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: 601 * sc, overflow: 'hidden' }}>
      <Img src={staticFile('logo-makna-positif.png')} style={{ position: 'absolute', width: 1254 * sc, height: 1254 * sc, left: -105 * sc, top: -328 * sc }} />
    </div>
  );
};

const Pill: React.FC<{ cx: number; cy: number; text: string; bg: string; fg: string; size?: number }> = ({ cx, cy, text, bg, fg, size = 52 }) => {
  const w = text.length * size * 0.62 + size * 1.6;
  const h = size * 1.9;
  return (
    <div style={{ position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, borderRadius: h / 2, background: bg, color: fg, fontFamily: FONT, fontWeight: 800, fontSize: size, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 26px rgba(0,0,0,0.28)' }}>
      {text}
    </div>
  );
};

const Arrow: React.FC<{ x1: number; x2: number; y: number; color?: string; w?: number }> = ({ x1, x2, y, color = '#EAF2FB', w = 14 }) => (
  <g>
    <line x1={x1} y1={y} x2={x2 - 30} y2={y} stroke={color} strokeWidth={w} strokeLinecap="round" />
    <polygon points={`${x2},${y} ${x2 - 44},${y - 30} ${x2 - 44},${y + 30}`} fill={color} />
  </g>
);

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={THUMB_W} height={THUMB_H} style={{ position: 'absolute', inset: 0 }}>{children}</svg>
);

const VArrow: React.FC<{ x: number; y1: number; y2: number }> = ({ x, y1, y2 }) => (
  <g>
    <line x1={x} y1={y1} x2={x} y2={y2 - 30} stroke="#EAF2FB" strokeWidth={16} strokeLinecap="round" />
    <polygon points={`${x},${y2} ${x - 32},${y2 - 46} ${x + 32},${y2 - 46}`} fill="#EAF2FB" />
  </g>
);
const Cell: React.FC<{ cx: number; cy: number; r: number; op: number }> = ({ cx, cy, r, op }) => (
  <FlatCell cx={cx} cy={cy} r={r} color={SHAPE_COL.cd4} nuc={SHAPE_COL.cd4Dark} rec={1} op={op} />
);

// ===== TEMPLATE THUMBNAIL (9:16) =====
// Susunan baku: logo Makna Positif di atas -> judul (HANYA judul episode, persis seperti di sheet) -> ilustrasi di bawah.
// Episode baru: buat komposisi baru yang membungkus <ThumbFrame theme=... title=...> dengan ilustrasi sesuai judul.
export const ThumbFrame: React.FC<{ theme: keyof typeof THEMES; title: React.ReactNode; children: React.ReactNode; glowY?: number }> = ({ theme, title, children, glowY = 1150 }) => {
  useFonts();
  return (
    <AbsoluteFill>
      <Bg g={THEMES[theme]} glowY={glowY} />
      <Logo x={390} y={90} w={300} />
      <div style={{ position: 'absolute', left: 0, width: THUMB_W, top: 320, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 116, lineHeight: 1.12, color: WHITE, whiteSpace: 'nowrap' }}>{title}</div>
      {children}
    </AbsoluteFill>
  );
};

// Judul: "Apa bedanya HIV dan AIDS?" (kata kunci diberi warna aksen, sama seperti subtitle video)
export const ThumbHivAids: React.FC = () => (
  <ThumbFrame
    theme="indigo"
    title={
      <>
        Apa bedanya
        <br />
        <span style={{ color: CORAL }}>HIV</span> dan <span style={{ color: RED }}>AIDS</span>?
      </>
    }
  >
    <Svg>
      <FlatVirus cx={540} cy={850} r={120} />
      <VArrow x={540} y1={1215} y2={1410} />
      <Cell cx={430} cy={1570} r={62} op={0.4} />
      <Cell cx={570} cy={1520} r={50} op={0.25} />
      <Cell cx={640} cy={1630} r={54} op={0.3} />
      <Cell cx={760} cy={1550} r={42} op={0.18} />
    </Svg>
    <Pill cx={540} cy={1125} text="HIV" bg="#FFA48E" fg="#4A1A10" size={56} />
    <Pill cx={540} cy={1790} text="AIDS" bg="#FF6B5E" fg="#4A0F0C" size={56} />
  </ThumbFrame>
);

// Judul: "Kenapa HIV menyerang CD4?" (tema biru = pembuka video). Virus mendekati sel CD4 berreseptor kuning.
export const ThumbCd4: React.FC = () => (
  <ThumbFrame
    theme="biru"
    title={
      <>
        Kenapa <span style={{ color: CORAL }}>HIV</span>
        <br />
        menyerang <span style={{ color: SHAPE_COL.cd4 }}>CD4</span>?
      </>
    }
  >
    <Svg>
      <FlatCell cx={600} cy={1350} r={210} color={SHAPE_COL.cd4} nuc={SHAPE_COL.cd4Dark} rec={1} />
      <FlatVirus cx={350} cy={980} r={105} rot={20} />
    </Svg>
    <Pill cx={230} cy={1235} text="HIV" bg="#FFA48E" fg="#4A1A10" size={56} />
    <Pill cx={600} cy={1735} text="CD4" bg={SHAPE_COL.cd4} fg="#0B2A55" size={56} />
  </ThumbFrame>
);

// Judul: "Bagaimana HIV memperbanyak diri?" (tema ungu = adegan dalam sel). Satu virus menjadi banyak salinan.
export const ThumbReplikasi: React.FC = () => (
  <ThumbFrame
    theme="ungu"
    title={
      <>
        Bagaimana <span style={{ color: CORAL }}>HIV</span>
        <br />
        memperbanyak
        <br />
        diri?
      </>
    }
  >
    <Svg>
      <FlatVirus cx={540} cy={985} r={115} />
      <VArrow x={540} y1={1200} y2={1340} />
      <FlatVirus cx={345} cy={1520} r={62} rot={15} />
      <FlatVirus cx={540} cy={1520} r={62} rot={-10} />
      <FlatVirus cx={735} cy={1520} r={62} rot={25} />
      <FlatVirus cx={440} cy={1700} r={55} rot={5} />
      <FlatVirus cx={640} cy={1700} r={55} rot={-20} />
    </Svg>
    <Pill cx={225} cy={985} text="HIV" bg="#FFA48E" fg="#4A1A10" size={56} />
  </ThumbFrame>
);

// Judul: "Apa itu viral load? Bagaimana diukurnya?" (tema teal = danau/grafik di video). Satu gelas air berisi virus = sampel yang diukur.
const GLASS_VIRUS = [
  { x: -34, y: 38, r: 13, rot: 10 },
  { x: 30, y: 8, r: 12, rot: -20 },
  { x: 4, y: 78, r: 11, rot: 30 },
];
const GLASS_DOTS = [[-52, 18], [-8, -6], [52, 52], [-40, 84], [36, 88], [-14, 50], [58, 18], [14, 36]];
export const ThumbViralLoad: React.FC = () => (
  <ThumbFrame
    theme="teal"
    title={
      <>
        Apa itu
        <br />
        <span style={{ color: CORAL }}>viral load</span>?
        <br />
        Bagaimana
        <br />
        diukurnya?
      </>
    }
    glowY={1330}
  >
    <Svg>
      <Glass x={540} y={1330} s={3} level={0.82} water={WATER_CLEAR}>
        {GLASS_DOTS.map(([x, y], i) => (
          <VDot key={i} x={x} y={y} r={5} />
        ))}
        {GLASS_VIRUS.map((v, i) => (
          <FlatVirus key={i} cx={v.x} cy={v.y} r={v.r} rot={v.rot} />
        ))}
      </Glass>
    </Svg>
    <Pill cx={540} cy={1815} text="viral load" bg="#FFA48E" fg="#4A1A10" size={56} />
  </ThumbFrame>
);
