import React from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from 'remotion';
import { FONT } from '../Board';
import { FlatCell, FlatVirus, Figure, SHAPE_COL } from '../shared/shapes';

// Thumbnail 19:6 (1900x600) untuk "Apa bedanya HIV dan AIDS?". Tokoh dari src/shared/shapes.tsx, logo asli.
export const THUMB_W = 1900;
export const THUMB_H = 600;

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

const Bg: React.FC<{ g: [string, string, string]; glowX?: number }> = ({ g, glowX = 1500 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(120deg,${g[0]} 0%,${g[1]} 55%,${g[2]} 100%)` }}>
    <AbsoluteFill style={{ background: `radial-gradient(700px 520px at ${glowX}px 300px, rgba(120,190,255,0.22), transparent 70%)` }} />
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

// A: judul besar kiri, virus -> sel CD4 yang meredup di kanan (satu rangkaian)
export const ThumbA: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Bg g={['#0A1F3D', '#123A60', '#17506F']} />
      <div style={{ position: 'absolute', left: 90, top: 92, fontFamily: FONT, color: WHITE }}>
        <div style={{ fontWeight: 600, fontSize: 80, lineHeight: 1.05 }}>Apa bedanya</div>
        <div style={{ fontWeight: 800, fontSize: 124, lineHeight: 1.08, marginTop: 6, whiteSpace: 'nowrap' }}>
          <span style={{ color: CORAL }}>HIV</span> dan <span style={{ color: RED }}>AIDS</span>?
        </div>
      </div>
      <Logo x={92} y={468} w={200} />
      <Svg>
        <FlatVirus cx={1130} cy={270} r={92} />
        <Arrow x1={1270} x2={1470} y={270} />
        <FlatCell cx={1560} cy={270} r={52} color={SHAPE_COL.cd4} nuc={SHAPE_COL.cd4Dark} rec={1} op={1} />
        <FlatCell cx={1680} cy={270} r={52} color={SHAPE_COL.cd4} nuc={SHAPE_COL.cd4Dark} rec={1} op={0.5} />
        <FlatCell cx={1800} cy={270} r={52} color={SHAPE_COL.cd4} nuc={SHAPE_COL.cd4Dark} rec={1} op={0.2} />
      </Svg>
      <Pill cx={1130} cy={470} text="HIV" bg="#FFA48E" fg="#4A1A10" />
      <Pill cx={1680} cy={470} text="AIDS" bg="#FF6B5E" fg="#4A0F0C" />
    </AbsoluteFill>
  );
};

// B: simetris, HIV -> AIDS, "bukan dua penyakit yang terpisah"
export const ThumbB: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Bg g={['#13194A', '#25306E', '#35487F']} glowX={950} />
      <div style={{ position: 'absolute', left: 0, width: THUMB_W, top: 48, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 60, color: WHITE }}>
        Satu rangkaian, <span style={{ color: TEAL }}>bukan dua penyakit</span>
      </div>
      <Svg>
        <FlatVirus cx={330} cy={315} r={84} />
        <Arrow x1={520} x2={1290} y={315} w={16} />
        <FlatCell cx={1470} cy={315} r={60} color={SHAPE_COL.cd4} nuc={SHAPE_COL.cd4Dark} rec={1} op={0.4} />
        <FlatCell cx={1590} cy={245} r={46} color={SHAPE_COL.cd4} nuc={SHAPE_COL.cd4Dark} rec={1} op={0.25} />
        <FlatCell cx={1610} cy={395} r={50} color={SHAPE_COL.cd4} nuc={SHAPE_COL.cd4Dark} rec={1} op={0.3} />
        <FlatCell cx={1730} cy={315} r={40} color={SHAPE_COL.cd4} nuc={SHAPE_COL.cd4Dark} rec={1} op={0.18} />
      </Svg>
      <div style={{ position: 'absolute', left: 520, width: 770, top: 360, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 40, color: '#EAF2FB' }}>stadium lanjut dari infeksi</div>
      <Pill cx={330} cy={505} text="HIV" bg="#FFA48E" fg="#4A1A10" size={56} />
      <Pill cx={1600} cy={505} text="AIDS" bg="#FF6B5E" fg="#4A0F0C" size={56} />
      <Logo x={865} y={480} w={170} />
    </AbsoluteFill>
  );
};

// C: hook "HIV ≠ AIDS", virus mengincar komandan (CD4)
export const ThumbC: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Bg g={['#082C3A', '#0E5A63', '#1C8A85']} glowX={1550} />
      <div style={{ position: 'absolute', left: 90, top: 78, fontFamily: FONT, color: WHITE, whiteSpace: 'nowrap' }}>
        <div style={{ fontWeight: 800, fontSize: 176, lineHeight: 1.0 }}>
          <span style={{ color: CORAL }}>HIV</span> <span style={{ color: TEAL }}>≠</span> <span style={{ color: RED }}>AIDS</span>
        </div>
        <div style={{ fontWeight: 600, fontSize: 62, marginTop: 26 }}>Apa bedanya? Ini jawabannya.</div>
      </div>
      <Logo x={92} y={468} w={200} />
      <Svg>
        <FlatVirus cx={1290} cy={250} r={78} rot={20} />
        <Figure cx={1640} cy={310} s={1.0} c={SHAPE_COL.cd4} cap={SHAPE_COL.cd4Dark} cmd />
      </Svg>
      <Pill cx={1640} cy={552} text="CD4" bg="#8FBDF7" fg="#0E2A4F" size={36} />
    </AbsoluteFill>
  );
};
