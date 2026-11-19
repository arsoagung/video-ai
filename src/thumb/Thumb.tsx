import React from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from 'remotion';
import { FONT } from '../Board';
import { FlatCell, FlatVirus, Figure, SHAPE_COL } from '../shared/shapes';
import { Glass, VDot, WATER_CLEAR } from '../ep5/shapes5';
import { BodyLens, Calendar, Capsule, Clock, CrossBadge, Group, LineChart, Person, TestKit, Document, Clinic, Tablet, Heart, Mosquito } from '../shared/library';

// Thumbnail 9:16 (1080x1920) untuk "Apa bedanya HIV dan AIDS?". Tokoh dari src/shared/shapes.tsx, logo asli.
export const THUMB_W = 1080;
export const THUMB_H = 1920;

// Zona aman profil: grid IG/YT memotong 9:16 jadi 3:4 di tengah (1080x1440 => y 240..1680). Semua konten (logo, judul,
// ilustrasi, pill) diskalakan masuk ke y 300..1640 dengan margin >= 40 px dari tepi potong. Tata letak di bawah tetap
// ditulis dalam koordinat kanvas penuh 1080x1920 (susunan sama), lalu ThumbFrame mengecilkannya ke zona aman.
export const SAFE_S = 0.76;
export const SAFE_DX = (THUMB_W * (1 - SAFE_S)) / 2; // tetap di tengah horizontal
export const SAFE_DY = 300 - 90 * SAFE_S; // logo (y=90) jatuh di y=300; dasar ilustrasi (~1850) di ~1638

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
      <AbsoluteFill style={{ transformOrigin: '0 0', transform: `translate(${SAFE_DX}px, ${SAFE_DY}px) scale(${SAFE_S})` }}>
        <Logo x={390} y={90} w={300} />
        <div style={{ position: 'absolute', left: 0, width: THUMB_W, top: 320, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 116, lineHeight: 1.12, color: WHITE, whiteSpace: 'nowrap' }}>{title}</div>
        {children}
      </AbsoluteFill>
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

// Judul: "Bagaimana ARV menghentikan replikasi HIV?" (tema teal = ARV). Kapsul ARV -> satu virus; salinan virus hanya bayangan pucat (replikasi terhenti, virus tidak digambarkan lenyap).
export const ThumbArv: React.FC = () => (
  <ThumbFrame
    theme="teal"
    title={
      <>
        Bagaimana <span style={{ color: TEAL }}>ARV</span>
        <br />
        menghentikan
        <br />
        replikasi <span style={{ color: CORAL }}>HIV</span>?
      </>
    }
    glowY={1250}
  >
    <Svg>
      <Capsule cx={540} cy={1000} s={2.3} rot={-12} />
      <VArrow x={540} y1={1150} y2={1310} />
      <FlatVirus cx={540} cy={1520} r={105} />
      <FlatVirus cx={235} cy={1520} r={70} dim={0.2} rot={20} />
      <FlatVirus cx={845} cy={1520} r={70} dim={0.2} rot={-15} />
    </Svg>
    <Pill cx={540} cy={1790} text="HIV" bg="#FFA48E" fg="#4A1A10" size={56} />
  </ThumbFrame>
);

// Judul: "Apa itu CD4 dan kenapa penting?" (tema indigo = bagian tengah video). Sel CD4 + indikator baterai (analogi video).
export const ThumbApaCd4: React.FC = () => (
  <ThumbFrame
    theme="indigo"
    title={
      <>
        Apa itu <span style={{ color: SHAPE_COL.cd4 }}>CD4</span>
        <br />
        dan kenapa
        <br />
        penting?
      </>
    }
  >
    <Svg>
      <FlatCell cx={540} cy={1130} r={220} color={SHAPE_COL.cd4} nuc={SHAPE_COL.cd4Dark} rec={1} />
      <g transform="translate(540 1675)">
        <rect x={-210} y={-80} width={420} height={160} rx={36} fill="#EAF2FB" opacity={0.18} />
        <rect x={214} y={-28} width={26} height={56} rx={11} fill="#EAF2FB" opacity={0.3} />
        <rect x={-192} y={-62} width={300} height={124} rx={24} fill={TEAL} />
      </g>
    </Svg>
    <Pill cx={540} cy={1500} text="CD4" bg={SHAPE_COL.cd4} fg="#0B2A55" size={56} />
  </ThumbFrame>
);

// Judul: "Kenapa ARV harus diminum rutin?" (tema teal = ARV). Jam (rutin, sehari sekali) + kapsul ARV.
export const ThumbS1E5: React.FC = () => (
  <ThumbFrame
    theme="teal"
    title={
      <>
        Kenapa <span style={{ color: TEAL }}>ARV</span>
        <br />
        harus diminum
        <br />
        rutin?
      </>
    }
    glowY={1250}
  >
    <Svg>
      <Clock cx={540} cy={1150} s={2.5} frac={0} hour={2} />
      <Capsule cx={540} cy={1580} s={2.2} rot={-12} />
    </Svg>
    <Pill cx={540} cy={1790} text="ARV" bg="#72E3D3" fg="#063F38" size={56} />
  </ThumbFrame>
);

// Judul: "Apa yang terjadi kalau ARV dihentikan?" (tema indigo = tanpa pengobatan). Kapsul ARV disilang + virus yang kembali beranak.
export const ThumbS1E7: React.FC = () => (
  <ThumbFrame
    theme="indigo"
    title={
      <>
        Apa yang terjadi
        <br />
        kalau <span style={{ color: TEAL }}>ARV</span>
        <br />
        dihentikan?
      </>
    }
    glowY={1250}
  >
    <Svg>
      <FlatVirus cx={300} cy={1060} r={74} dim={0.75} rot={10} />
      <FlatVirus cx={780} cy={1060} r={74} dim={0.75} rot={50} />
      <FlatVirus cx={540} cy={1130} r={150} rot={20} />
      <Capsule cx={540} cy={1560} s={2.2} rot={-12} />
      <CrossBadge cx={760} cy={1500} s={1.5} />
    </Svg>
    <Pill cx={540} cy={1790} text="dihentikan" bg="#FF9C85" fg="#3B1308" size={56} />
  </ThumbFrame>
);

// Judul: "Apa itu window period HIV?" (tema biru). Virus di hari 0 -> bar tiga warna (merah belum terdeteksi, kuning kurang akurat, hijau akurat memudar) + jam.
export const ThumbS1E8: React.FC = () => (
  <ThumbFrame
    theme="biru"
    title={
      <>
        Apa itu
        <br />
        window period
        <br />
        <span style={{ color: CORAL }}>HIV</span>?
      </>
    }
    glowY={1250}
  >
    <Svg>
      <defs>
        <linearGradient id="gFade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#7ED6A8" stopOpacity="1" />
          <stop offset="1" stopColor="#7ED6A8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <Clock cx={650} cy={1180} s={1.9} frac={0.55} hour={3} />
      <rect x={250} y={1520} width={220} height={70} rx={35} fill="#FF6B4D" />
      <rect x={440} y={1520} width={330} height={70} rx={35} fill="#F4D77E" />
      <rect x={740} y={1520} width={340} height={70} fill="url(#gFade)" />
      <FlatVirus cx={170} cy={1555} r={70} rot={20} />
    </Svg>
    <Pill cx={540} cy={1730} text="masa jendela" bg="#F4D77E" fg="#4A3606" size={56} />
  </ThumbFrame>
);

// Judul: "Apa arti viral load tidak terdeteksi?" (tema biru tua/indigo). Grafik viral load turun di bawah batas alat (tetap di atas sumbu), virus kecil tetap ada.
export const ThumbS1E9: React.FC = () => (
  <ThumbFrame
    theme="indigo"
    title={
      <>
        Apa arti
        <br />
        <span style={{ color: CORAL }}>viral load</span>
        <br />
        tidak
        <br />
        terdeteksi?
      </>
    }
    glowY={1330}
  >
    <Svg>
      {/* grafik sendiri: kurva turun melengkung mulus (peluruhan eksponensial), bukan garis patah */}
      <g transform="translate(540 1330)">
        <rect x={-450} y={-280} width={900} height={560} rx={36} fill="#fff" fillOpacity={0.12} />
        <line x1={-406} y1={240} x2={406} y2={240} stroke="#fff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
        <line x1={-406} y1={-240} x2={-406} y2={240} stroke="#fff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
        <line x1={-406} y1={240 - 0.24 * 480} x2={406} y2={240 - 0.24 * 480} stroke="#FF6B4D" strokeOpacity={0.8} strokeWidth={5} strokeDasharray="14 12" strokeLinecap="round" />
        <path
          d={Array.from({ length: 61 }, (_, i) => {
            const u = i / 60;
            const v = 0.12 + 0.8 * Math.exp(-3.4 * u);
            return `${i ? 'L' : 'M'} ${-406 + u * 812} ${240 - v * 480}`;
          }).join(' ')}
          fill="none" stroke="#72E3D3" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round"
        />
        <circle cx={406} cy={240 - (0.12 + 0.8 * Math.exp(-3.4)) * 480} r={13} fill="#72E3D3" />
      </g>
      <FlatVirus cx={845} cy={1130} r={52} rot={20} dim={0.7} />
    </Svg>
    <Pill cx={540} cy={1790} text="tidak terdeteksi" bg="#72E3D3" fg="#063F38" size={56} />
  </ThumbFrame>
);

// Judul: "HIV bisa ada tanpa gejala. kok bisa?" (tema biru = pembuka video). Orang tampak sehat (hati hijau, centang), virus kecil tetap ada di dalam.
export const ThumbS1E10: React.FC = () => (
  <ThumbFrame
    theme="biru"
    title={
      <>
        <span style={{ color: CORAL }}>HIV</span> bisa ada
        <br />
        tanpa gejala.
        <br />
        kok bisa?
      </>
    }
    glowY={1350}
  >
    <Svg>
      <g transform="translate(540 1420) scale(3.3)">
        <path d="M -70 90 Q -70 -10 0 -10 Q 70 -10 70 90 Z" fill="#8FBDF7" />
        <circle cx={0} cy={-60} r={34} fill="#8FBDF7" />
        <circle cx={-12} cy={-68} r={11} fill="#fff" opacity={0.18} />
        <path d="M 0 40 C -30 18 -34 -4 -18 -12 C -8 -16 -2 -10 0 -4 C 2 -10 8 -16 18 -12 C 34 -4 30 18 0 40 Z" fill="#7ED6A8" />
      </g>
      <FlatVirus cx={600} cy={1560} r={50} rot={20} />
      <circle cx={900} cy={1180} r={62} fill="#72E3D3" />
      <polyline points="872,1180 892,1202 930,1158" fill="none" stroke="#173A5E" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
    </Svg>
    <Pill cx={900} cy={1330} text="sehat" bg="#EAF2FB" fg="#12304F" size={46} />
  </ThumbFrame>
);

// Judul: "Kapan waktu terbaik untuk tes HIV?" (tema biru). Kalender (waktu) + alat tes, pill "tes HIV".
export const ThumbS1E11: React.FC = () => (
  <ThumbFrame
    theme="biru"
    title={
      <>
        Kapan waktu
        <br />
        terbaik untuk
        <br />
        tes <span style={{ color: CORAL }}>HIV</span>?
      </>
    }
    glowY={1330}
  >
    <Svg>
      <Calendar cx={380} cy={1330} s={2.1} marks={[9, 16, 23]} markColor="#72E3D3" />
      <TestKit cx={790} cy={1360} s={1.5} lines={1} />
    </Svg>
    <Pill cx={540} cy={1780} text="tes HIV" bg="#72E3D3" fg="#063F38" size={56} />
  </ThumbFrame>
);

// Judul: "Yang paling menyakitkan kadang bukan virusnya, tapi stigma." (S2E1, tema biru = pembuka video).
// Orang (lavender = tokoh "kamu") dengan virus kecil; sekelompok orang di seberang menjauh, pill "stigma".
export const ThumbS2E1: React.FC = () => (
  <ThumbFrame
    theme="biru"
    title={
      <>
        Yang paling
        <br />
        menyakitkan
        <br />
        kadang bukan
        <br />
        <span style={{ color: CORAL }}>virusnya</span>,
        <br />
        tapi stigma.
      </>
    }
    glowY={1450}
  >
    <Svg>
      <Person cx={270} cy={1500} s={2.6} color="#B9A2F5" />
      <BodyLens cx={272} cy={1585} s={2.2} />
      {[0, 1, 2].map((i) => (
        <Person key={i} cx={690 + i * 130} cy={1540 + (i % 2) * 14} s={1.5 - i * 0.12} rot={10 + i * 3} color={['#F4D77E', '#7ED6A8', '#8FBDF7'][i]} />
      ))}
    </Svg>
    <Pill cx={540} cy={1790} text="stigma" bg="#EAF2FB" fg="#12304F" size={52} />
  </ThumbFrame>
);

export const ThumbS2E2: React.FC = () => (
  <ThumbFrame
    theme="biru"
    title={
      <>
        Kalau hasil tes
        <br />
        <span style={{ color: CORAL }}>HIV</span> positif,
        <br />
        apa yang terjadi
        <br />
        selanjutnya?
      </>
    }
    glowY={1450}
  >
    <Svg>
      <Person cx={250} cy={1500} s={2.5} color="#B9A2F5" />
      <Document cx={470} cy={1540} s={0.9} rot={6} />
      <line x1={560} y1={1630} x2={690} y2={1630} stroke="#EAF2FB" strokeWidth={12} strokeLinecap="round" strokeDasharray="4 24" />
      <Clinic cx={850} cy={1520} s={1.15} />
      <Tablet cx={850} cy={1700} s={0.8} />
    </Svg>
    <Pill cx={540} cy={1790} text="HIV positif" bg="#EAF2FB" fg="#12304F" size={52} />
  </ThumbFrame>
);

// "Baru didiagnosis HIV? Merasa kaget itu wajar." (tema biru): orang (lavender) dengan hati hijau, ombak mengelilingi, pill "kaget itu wajar"
export const ThumbS2E3: React.FC = () => {
  const wave = (base: number, amp: number, ph: number, bump: number) => {
    let d = `M -700 1900 L -700 ${base}`;
    for (let x = -700; x <= 1800; x += 18) d += ` L ${x} ${(base - amp * Math.sin((x / 300) * Math.PI * 2 + ph) - bump * Math.exp(-(((x - 300) / 230) ** 2))).toFixed(1)}`;
    return d + ' L 1800 1900 Z';
  };
  return (
    <ThumbFrame
      theme="biru"
      title={
        <>
          Baru
          <br />
          didiagnosis <span style={{ color: CORAL }}>HIV</span>?
          <br />
          Merasa kaget
          <br />
          itu wajar.
        </>
      }
      glowY={1450}
    >
      <svg width={THUMB_W} height={THUMB_H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <Person cx={600} cy={1520} s={2.6} color="#B9A2F5" />
        <Heart cx={600} cy={1210} s={0.6} color="#7ED6A8" />
        <defs>
          <linearGradient id="wvA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2F5E92" stopOpacity="0.9" /><stop offset="1" stopColor="#2F5E92" stopOpacity="0" /></linearGradient>
          <linearGradient id="wvB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A7FCC" stopOpacity="0.95" /><stop offset="1" stopColor="#4A7FCC" stopOpacity="0" /></linearGradient>
        </defs>
        <path d={wave(1610, 24, 1.3, 0)} fill="url(#wvA)" />
        <path d={wave(1570, 30, 0.2, 120)} fill="url(#wvB)" />
      </svg>
      <Pill cx={540} cy={1790} text="kaget itu wajar" bg="#EAF2FB" fg="#12304F" size={52} />
    </ThumbFrame>
  );
};

// "Cuma lima cairan tubuh yang bisa menularkan HIV. Sisanya aman." (tema biru): lima tetes cairan berwarna, tiap tetes membawa virus; pill "lima cairan"
export const ThumbS2E4: React.FC = () => {
  const cols = ['#F0616A', '#F2F4F8', '#F4A6C8', '#FFC38A', '#FFE9A8'];
  return (
    <ThumbFrame
      theme="biru"
      title={
        <>
          Cuma lima
          <br />
          cairan tubuh
          <br />
          yang bisa
          <br />
          menularkan <span style={{ color: CORAL }}>HIV</span>.
          <br />
          Sisanya aman.
        </>
      }
      glowY={1450}
    >
      <Svg>
        {cols.map((c, i) => (
          <g key={i} transform={`translate(${130 + i * 205} ${1540 + (i % 2) * 26}) scale(1.5)`}>
            <path d="M 0 -90 C 40 -34 64 -6 64 30 A 64 64 0 0 1 -64 30 C -64 -6 -40 -34 0 -90 Z" fill={c} />
            <ellipse cx={-30} cy={22} rx={9} ry={18} fill="#fff" opacity={0.35} transform="rotate(20 -30 22)" />
            <FlatVirus cx={4} cy={30} r={25} />
          </g>
        ))}
      </Svg>
      <Pill cx={540} cy={1790} text="lima cairan" bg="#EAF2FB" fg="#12304F" size={52} />
    </ThumbFrame>
  );
};

// "Makan sepiring dengan ODHIV, tertular nggak ya?" (tema biru): dua orang (hijau = ODHIV dengan virus kecil di dada, lavender = kamu) di meja, satu piring + satu sendok di tengah; pill "sepiring"
export const ThumbS2E5: React.FC = () => (
  <ThumbFrame
    theme="biru"
    title={
      <>
        Makan sepiring
        <br />
        dengan <span style={{ color: CORAL }}>ODHIV</span>,
        <br />
        tertular
        <br />
        nggak ya?
      </>
    }
    glowY={1450}
  >
    <Svg>
      <Person cx={220} cy={1500} s={2.3} color="#7ED6A8" />
      <circle cx={220} cy={1560} r={70} fill="#fff" opacity={0.26} />
      <FlatVirus cx={220} cy={1560} r={30} />
      <Person cx={860} cy={1500} s={2.3} color="#B9A2F5" />
      <rect x={90} y={1640} width={900} height={36} rx={18} fill="#EAF2FB" />
      <rect x={160} y={1676} width={32} height={120} rx={14} fill="#B3C7DC" />
      <rect x={888} y={1676} width={32} height={120} rx={14} fill="#B3C7DC" />
      <ellipse cx={540} cy={1640} rx={210} ry={52} fill="#B3C7DC" />
      <ellipse cx={540} cy={1628} rx={210} ry={52} fill="#FFFFFF" />
      <ellipse cx={540} cy={1624} rx={140} ry={32} fill="#DDEBFF" />
      <ellipse cx={500} cy={1612} rx={54} ry={30} fill="#F4D77E" />
      <circle cx={580} cy={1608} r={26} fill="#7ED6A8" />
      <circle cx={626} cy={1618} r={18} fill="#FFB07A" />
      <g transform="translate(760 1600) rotate(75)">
        <rect x={-12} y={0} width={24} height={150} rx={12} fill="#EAF2FB" />
        <ellipse cx={0} cy={-24} rx={38} ry={52} fill="#EAF2FB" />
      </g>
    </Svg>
    <Pill cx={540} cy={1790} text="sepiring" bg="#EAF2FB" fg="#12304F" size={52} />
  </ThumbFrame>
);

// ---- S2E6: "Tidak terdeteksi maka tidak menularkan. Ini Buktinya."
export const ThumbS2E6: React.FC = () => (
  <ThumbFrame
    theme="teal"
    title={
      <>
        <span style={{ color: TEAL }}>Tidak terdeteksi</span>
        <br />
        maka tidak
        <br />
        menularkan.
        <br />
        Ini Buktinya.
      </>
    }
    glowY={1450}
  >
    <Svg>
      <TestKit cx={250} cy={1470} s={1.4} lines={1} />
      <Document cx={540} cy={1500} s={1.5} stamp />
      <Person cx={800} cy={1530} s={1.4} color="#B9A2F5" />
      <Person cx={950} cy={1530} s={1.4} color="#7ED6A8" />
      <circle cx={950} cy={1575} r={50} fill="#fff" opacity={0.26} />
      <FlatVirus cx={950} cy={1575} r={14} />
      <Heart cx={875} cy={1330} s={0.6} color="#F4A6C8" />
    </Svg>
    <Pill cx={540} cy={1790} text="tidak menular" bg="#EAF2FB" fg="#12304F" size={52} />
  </ThumbFrame>
);

// ---- S2E7: "Nyamuk gigit ODHIV, lalu gigit kamu. Bisa ketularan?" (tema biru)
export const ThumbS2E7: React.FC = () => (
  <ThumbFrame
    theme="biru"
    title={
      <>
        Nyamuk gigit
        <br />
        <span style={{ color: CORAL }}>ODHIV</span>, lalu
        <br />
        gigit kamu.
        <br />
        Bisa ketularan?
      </>
    }
    glowY={1450}
  >
    <Svg>
      <Person cx={170} cy={1560} s={2.0} color="#7ED6A8" />
      <circle cx={170} cy={1610} r={62} fill="#fff" opacity={0.26} />
      <FlatVirus cx={170} cy={1610} r={26} />
      <Person cx={920} cy={1560} s={2.0} color="#B9A2F5" />
      <Mosquito cx={520} cy={1430} s={1.9} belly={1} wing={0.5} />
      <CrossBadge cx={660} cy={1290} s={0.8} />
    </Svg>
    <Pill cx={540} cy={1790} text="bisa ketularan" bg="#EAF2FB" fg="#12304F" size={52} />
  </ThumbFrame>
);
