import React from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from 'remotion';
import { FONT } from '../Board';
import { FlatCell, FlatVirus, Figure, SHAPE_COL } from '../shared/shapes';

// Thumbnail 9:16 (1080x1920) untuk "Apa bedanya HIV dan AIDS?". Tokoh dari src/shared/shapes.tsx, logo asli.
export const THUMB_W = 1080;
export const THUMB_H = 1920;

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

const T: React.CSSProperties = { position: 'absolute', left: 0, width: THUMB_W, textAlign: 'center', fontFamily: FONT, color: WHITE, whiteSpace: 'nowrap' };
const Cell: React.FC<{ cx: number; cy: number; r: number; op: number }> = ({ cx, cy, r, op }) => (
  <FlatCell cx={cx} cy={cy} r={r} color={SHAPE_COL.cd4} nuc={SHAPE_COL.cd4Dark} rec={1} op={op} />
);
const VArrow: React.FC<{ x: number; y1: number; y2: number }> = ({ x, y1, y2 }) => (
  <g>
    <line x1={x} y1={y1} x2={x} y2={y2 - 30} stroke="#EAF2FB" strokeWidth={16} strokeLinecap="round" />
    <polygon points={`${x},${y2} ${x - 32},${y2 - 46} ${x + 32},${y2 - 46}`} fill="#EAF2FB" />
  </g>
);

// A: judul bertingkat besar, virus -> sel CD4 yang meredup
export const ThumbA: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Bg g={['#0A1F3D', '#123A60', '#17506F']} />
      <div style={{ ...T, top: 150, fontWeight: 600, fontSize: 84 }}>Apa bedanya</div>
      <div style={{ ...T, top: 240, fontWeight: 800, fontSize: 270, lineHeight: 1, color: CORAL }}>HIV</div>
      <div style={{ ...T, top: 520, fontWeight: 600, fontSize: 96, lineHeight: 1 }}>dan</div>
      <div style={{ ...T, top: 630, fontWeight: 800, fontSize: 270, lineHeight: 1, color: RED }}>AIDS?</div>
      <Svg>
        <FlatVirus cx={230} cy={1250} r={100} />
        <Arrow x1={370} x2={560} y={1250} />
        <Cell cx={660} cy={1250} r={52} op={1} />
        <Cell cx={780} cy={1250} r={52} op={0.5} />
        <Cell cx={900} cy={1250} r={52} op={0.2} />
      </Svg>
      <Pill cx={230} cy={1475} text="HIV" bg="#FFA48E" fg="#4A1A10" />
      <Pill cx={780} cy={1475} text="AIDS" bg="#FF6B5E" fg="#4A0F0C" />
      <Logo x={370} y={1650} w={340} />
    </AbsoluteFill>
  );
};

// B: alur vertikal HIV -> AIDS, "satu rangkaian"
export const ThumbB: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Bg g={['#13194A', '#25306E', '#35487F']} glowY={950} />
      <Logo x={390} y={90} w={300} />
      <div style={{ ...T, top: 330, fontWeight: 800, fontSize: 78, lineHeight: 1.1 }}>
        Satu rangkaian,
        <br />
        <span style={{ color: TEAL }}>bukan dua penyakit</span>
      </div>
      <Svg>
        <FlatVirus cx={540} cy={790} r={115} />
        <VArrow x={540} y1={1090} y2={1300} />
        <Cell cx={430} cy={1470} r={62} op={0.4} />
        <Cell cx={570} cy={1420} r={50} op={0.25} />
        <Cell cx={640} cy={1530} r={54} op={0.3} />
        <Cell cx={760} cy={1450} r={42} op={0.18} />
      </Svg>
      <Pill cx={540} cy={1025} text="HIV" bg="#FFA48E" fg="#4A1A10" size={56} />
      <div style={{ position: 'absolute', left: 600, top: 1160, fontFamily: FONT, fontWeight: 600, fontSize: 40, color: '#EAF2FB', lineHeight: 1.2 }}>stadium lanjut<br />dari infeksi</div>
      <Pill cx={540} cy={1700} text="AIDS" bg="#FF6B5E" fg="#4A0F0C" size={56} />
    </AbsoluteFill>
  );
};

// C: hook "HIV ≠ AIDS", virus mendekati komandan (CD4)
export const ThumbC: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Bg g={['#082C3A', '#0E5A63', '#1C8A85']} />
      <div style={{ ...T, top: 130, fontWeight: 800, fontSize: 290, lineHeight: 1, color: CORAL }}>HIV</div>
      <div style={{ ...T, top: 420, fontWeight: 800, fontSize: 230, lineHeight: 1, color: TEAL }}>≠</div>
      <div style={{ ...T, top: 650, fontWeight: 800, fontSize: 290, lineHeight: 1, color: RED }}>AIDS</div>
      <div style={{ ...T, top: 960, fontWeight: 600, fontSize: 74 }}>Apa bedanya?</div>
      <Svg>
        <FlatVirus cx={250} cy={1330} r={92} rot={20} />
        <Figure cx={780} cy={1370} s={1.05} c={SHAPE_COL.cd4} cap={SHAPE_COL.cd4Dark} cmd />
      </Svg>
      <Pill cx={780} cy={1640} text="CD4" bg="#8FBDF7" fg="#0E2A4F" size={38} />
      <Logo x={390} y={1710} w={300} />
    </AbsoluteFill>
  );
};
