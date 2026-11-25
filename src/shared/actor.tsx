import React from 'react';

// Karakter modular Makna Positif (FILE BARU, terpisah dari library.tsx dan shapes.tsx; tidak mengubah komponen lama).
// Untuk episode BERCERITA (S2 dst.: orang, dokter, keluarga, masyarakat), BUKAN skala mikro (virus, sel). Person/PersonPose/Doctor lama di library.tsx tetap dipakai episode lama.
// Bahasa bentuk: ROUNDED, SOFT, SIMPLE, FRIENDLY. Kepala besar, badan berisi, anggota badan kapsul gemuk, tanpa lekuk anatomi.
// Flat, tanpa outline, tanpa wajah. Satu anatomi; yang berubah hanya warna dan pose.
//
// DUA TAMPAK, satu rig bidang-layar:
//   Actor      = tampak depan (simetris). Rotasi sendi = ayunan di bidang layar.
//   Peran (role): blue = tokoh utama, purple = dokter (jas putih + stetoskop otomatis, atau coat={false}), yellow = keluarga, teal = masyarakat.
//   ActorSide  = tampak samping (menghadap kanan). Rotasi sendi = fleksi nyata (duduk, jalan, menekuk siku/lutut).
//
// KOORDINAT LOKAL: (0,0) = pusat panggul. Tinggi total ±720 (5,8 x diameter kepala 124). Tanah y=+354.
//
// SUDUT (derajat), 0 = menggantung lurus ke bawah.
//   TAMPAK DEPAN (kiri/kanan dicerminkan otomatis, nilai sama = gerakan simetris):
//     bahu/pinggul: + = menjauh dari badan (180 = lurus ke atas). siku/lutut/pergelangan: + = lanjut ke luar, - = menekuk ke badan.
//     head: + = miring ke kanan layar.  lean: + = condong ke kanan layar.  armL/legL = sisi KIRI layar.
//   TAMPAK SAMPING (menghadap kanan):
//     bahu/pinggul: + = ayun ke DEPAN.  siku/lutut: + = menekuk (lengan bawah naik ke depan / betis menekuk ke belakang).
//     pergelangan kaki: + = ujung kaki naik.  head: + = menunduk.  lean: + = membungkuk ke depan.

export type Pose = {
  lean?: number;
  head?: number;
  armL?: [number, number, number]; // bahu, siku, pergelangan
  armR?: [number, number, number];
  legL?: [number, number, number]; // pinggul, lutut, pergelangan kaki
  legR?: [number, number, number];
};
export type SidePose = {
  lean?: number;
  head?: number;
  armN?: [number, number, number]; // lengan dekat penonton
  armF?: [number, number, number]; // lengan jauh
  legN?: [number, number, number];
  legF?: [number, number, number];
};

export type ActorRole = 'blue' | 'purple' | 'yellow' | 'teal' | 'pink';
// Gaya rambut = penanda gender (layer di kepala; anatomi tidak berubah). Default: pink = ikat kuda, peran lain = tanpa rambut.
export type ActorHair = 'none' | 'ponytail' | 'bun' | 'bob';

export const ACTOR_COL: Record<ActorRole, { main: string; dark: string; trousers: string }> = {
  blue: { main: '#7FB3FF', dark: '#3F7FCB', trousers: '#3F7FCB' },
  purple: { main: '#C8A6FF', dark: '#9A7DE8', trousers: '#9A7DE8' },
  yellow: { main: '#FFE082', dark: '#E0A84E', trousers: '#E0A84E' },
  teal: { main: '#7FE3C6', dark: '#2E9E7D', trousers: '#2E9E7D' },
  pink: { main: '#FF9EC4', dark: '#D9648F', trousers: '#D9648F' },
};

export const mix = (a: string, b: string, k: number) => {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = h(a), B = h(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

export const NEUTRAL: Required<Pose> = { lean: 0, head: 0, armL: [7, 0, 0], armR: [7, 0, 0], legL: [2, 0, 0], legR: [2, 0, 0] };
export const NEUTRAL_SIDE: Required<SidePose> = { lean: 0, head: 0, armN: [4, 6, 0], armF: [2, 4, 0], legN: [0, 0, 0], legF: [0, 0, 0] };

// ---------- pembangun bentuk ----------
type Seg = [number, number, number, number, number, number];
// Siluet simetris: tulis separuh kanan dari tengah-atas ke tengah-bawah; sisi kiri dicerminkan otomatis.
const symPath = (start: [number, number], segs: Seg[]) => {
  let d = `M ${start[0]} ${start[1]}`;
  for (const s of segs) d += ` C ${s[0]} ${s[1]} ${s[2]} ${s[3]} ${s[4]} ${s[5]}`;
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i];
    const t: [number, number] = i === 0 ? start : [segs[i - 1][4], segs[i - 1][5]];
    d += ` C ${-s[2]} ${s[3]} ${-s[0]} ${s[1]} ${-t[0]} ${t[1]}`;
  }
  return d + ' Z';
};

// Kapsul gemuk meruncing halus: dari pivot (0,0) ke (0,L). Ujung bulat berpusat tepat di pivot, jadi sambungan tidak terlihat putus.
const limbPath = (L: number, r0: number, rm: number, r1: number) => {
  const cx = 2 * rm - 0.5 * (r0 + r1);
  const my = L * 0.45;
  return `M ${-r0} 0 A ${r0} ${r0} 0 0 1 ${r0} 0 Q ${cx} ${my} ${r1} ${L} A ${r1} ${r1} 0 0 1 ${-r1} ${L} Q ${-cx} ${my} ${-r0} 0 Z`;
};

// ---------- ukuran ----------
export const SZ = {
  head: 62, // jari-jari kepala (diameter 124)
  upperL: 108, foreL: 96, thighL: 166, calfL: 142,
  shoulder: { x: 86, y: -192 },
  hipX: 50,
  waistY: -50,
  headPivotY: -250,
  ground: 354,
};
export const SHAPE = {
  upperArm: limbPath(SZ.upperL, 32, 31, 28),
  foreArm: limbPath(SZ.foreL, 28, 28, 23),
  thigh: limbPath(SZ.thighL, 50, 49, 44),
  calf: limbPath(SZ.calfL, 44, 43, 37),
  neck: limbPath(36, 24, 24, 28),
  // ---- jas dokter (layer pakaian, anatomi di bawahnya tidak berubah) ----
  sleeveUp: limbPath(SZ.upperL, 37, 36, 34),
  sleeveFore: limbPath(SZ.foreL, 34, 33, 31),
  coat: symPath([0, -234], [
    [26, -234, 58, -232, 82, -224],
    [104, -218, 120, -202, 120, -170],
    [120, -130, 117, -90, 117, -30],
    [117, 14, 114, 54, 108, 88],
    [80, 98, 40, 98, 0, 98],
  ]),
  sideCoat: 'M -20 -234 C 32 -238 86 -216 90 -166 C 94 -120 90 -70 86 -20 C 84 30 82 70 76 96 C 44 104 -52 104 -80 96 C -88 54 -88 0 -88 -40 C -90 -100 -88 -170 -72 -208 C -62 -226 -42 -234 -20 -234 Z',
  // torso: rounded organic trapezoid. Bahu landai, sisi hampir lurus (sedikit melengkung), pinggang hanya sedikit lebih sempit dari dada.
  torso: symPath([0, -232], [
    [26, -232, 56, -230, 78, -222],
    [98, -216, 112, -200, 112, -170],
    [112, -130, 106, -90, 104, -54],
    [103, -30, 102, -8, 88, 6],
    [78, 16, 44, 18, 0, 18],
  ]),
  // panggul: menyatu dengan torso dan paha, lebar sama dengan hem torso
  pelvis: symPath([0, -40], [
    [58, -40, 96, -36, 101, -6],
    [105, 24, 96, 54, 66, 64],
    [44, 72, 20, 72, 0, 72],
  ]),
  // ---- tampak samping (menghadap kanan) ----
  sideTorso:
    'M -20 -232 C 30 -236 76 -214 80 -166 C 84 -120 78 -70 72 -30 C 68 -2 40 14 0 14 C -44 14 -72 -2 -74 -40 C -78 -100 -76 -170 -62 -206 C -54 -224 -40 -232 -20 -232 Z',
  sidePelvis:
    'M -64 -40 C -20 -48 40 -48 66 -36 C 82 -16 84 40 60 66 C 30 80 -40 80 -62 60 C -80 30 -78 -20 -64 -40 Z',
};

const SHADOW = 0.09;
const COAT = '#F7F9FC';
const COAT_SH = '#E8EDF5';
const STETH = '#43506B';
const cl = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
type J3 = [number, number, number];
// Batas sendi: menjaga pose tetap terbaca (tidak menumpuk / menembus badan).
const limitArmSide = (a: J3): J3 => [cl(a[0], -60, 165), cl(a[1], 0, 135), cl(a[2], -30, 30)];
const limitLegSide = (a: J3): J3 => [cl(a[0], -40, 100), cl(a[1], 0, 125), cl(a[2], -25, 25)];
const limitArmFront = (a: J3): J3 => [cl(a[0], -25, 165), cl(a[1], -135, 0), cl(a[2], -30, 30)];
const PivotDot: React.FC<{ on?: boolean }> = ({ on }) => (on ? <circle r={7} fill="#fff" opacity={0.95} /> : null);
const HAIR_TIE = '#FFFFFF';
const Head: React.FC<{ skin: string; dx?: number; hair?: ActorHair; hairCol?: string; side?: boolean }> = ({ skin, dx = 0, hair = 'none', hairCol = '#5A2E4A', side = false }) => {
  const x = (n: number) => dx + n;
  const back = (() => {
    if (hair === 'ponytail') return side
      ? <><path d={`M ${x(-46)} -100 C ${x(-100)} -98 ${x(-108)} -40 ${x(-86)} 0 C ${x(-78)} 14 ${x(-58)} 6 ${x(-62)} -10 C ${x(-60)} -40 ${x(-52)} -70 ${x(-34)} -86 Z`} fill={hairCol} /></>
      : <><path d={`M ${x(-40)} -104 C ${x(-88)} -112 ${x(-98)} -56 ${x(-80)} -12 C ${x(-72)} 8 ${x(-52)} 4 ${x(-54)} -14 C ${x(-52)} -44 ${x(-52)} -78 ${x(-30)} -96 Z`} fill={hairCol} /></>;
    if (hair === 'bun') return <circle cx={x(side ? -16 : 0)} cy={-136} r={28} fill={hairCol} />;
    if (hair === 'bob') return side
      ? <path d={`M ${x(-66)} -70 C ${x(-86)} -30 ${x(-78)} 0 ${x(-56)} 8 L ${x(-8)} 8 L ${x(-8)} -60 Z`} fill={hairCol} />
      : <path d={`M ${x(-70)} -70 C ${x(-84)} -30 ${x(-76)} 0 ${x(-58)} 8 L ${x(58)} 8 C ${x(76)} 0 ${x(84)} -30 ${x(70)} -70 Z`} fill={hairCol} />;
    return null;
  })();
  const cap = (() => {
    if (hair === 'none') return null;
    const d = side
      ? `M ${x(-66)} -40 A 66 66 0 0 1 ${x(52)} -93 C ${x(30)} -92 ${x(6)} -76 ${x(-6)} -38 C ${x(-30)} -30 ${x(-52)} -28 ${x(-66)} -40 Z`
      : `M ${x(-65)} -52 A 65 65 0 0 1 ${x(65)} -52 C ${x(44)} -70 ${x(-6)} -90 ${x(-65)} -52 Z`;
    return <path d={d} fill={hairCol} />;
  })();
  const tie = hair === 'ponytail'
    ? <circle cx={x(side ? -50 : -48)} cy={-96} r={10} fill={HAIR_TIE} />
    : hair === 'bun'
      ? <ellipse cx={x(side ? -16 : 0)} cy={-114} rx={22} ry={8} fill={HAIR_TIE} />
      : null;
  return (
    <>
      {back}
      <circle cx={dx} cy={-56} r={SZ.head} fill={skin} />
      {cap}
      {tie}
      <circle cx={dx - 22} cy={-84} r={22} fill="#fff" opacity={0.18} />
    </>
  );
};

type P = { cx: number; cy: number; s?: number; rot?: number; op?: number };

// ================= TAMPAK DEPAN =================
export const Actor: React.FC<P & { role?: ActorRole; pose?: Pose; debug?: boolean; coat?: boolean; hair?: ActorHair; hairColor?: string }> = ({
  cx, cy, s = 1, rot = 0, op = 1, role = 'blue', pose = {}, debug = false, coat = role === 'purple',
  hair = role === 'pink' ? 'ponytail' : 'none', hairColor,
}) => {
  const c = ACTOR_COL[role];
  const p0 = { ...NEUTRAL, ...pose };
  const p = { ...p0, armL: limitArmFront(p0.armL), armR: limitArmFront(p0.armR), head: cl(p0.head, -30, 30), lean: cl(p0.lean, -20, 20) };
  const skin = c.main;
  const limbFront = mix(c.main, '#ffffff', 0.2);
  const limbBack = mix(c.main, '#ffffff', 0.08);
  const footCol = mix(c.dark, '#000000', 0.1);

  // Lengan di DEPAN torso: ujung atasnya yang membulat menjadi garis bahu (seperti referensi), jadi bahu landai tanpa bantalan.
  const arm = (side: 1 | -1, a: [number, number, number]) => {
    const limb = coat ? (side === 1 ? COAT : COAT_SH) : (side === 1 ? limbFront : limbBack);
    return (
    <g transform={`translate(${-side * SZ.shoulder.x} ${SZ.shoulder.y}) rotate(${side * a[0]})`}>
      <path d={coat ? SHAPE.sleeveUp : SHAPE.upperArm} fill={limb} />
      <g transform={`translate(0 ${SZ.upperL}) rotate(${side * a[1]})`}>
        <path d={coat ? SHAPE.sleeveFore : SHAPE.foreArm} fill="#0A1F3D" opacity={SHADOW} transform="scale(1.1 1.04)" />
        <path d={coat ? SHAPE.sleeveFore : SHAPE.foreArm} fill={limb} />
        <g transform={`translate(0 ${SZ.foreL}) rotate(${side * a[2]})`}>
          <ellipse cx={0} cy={24} rx={31} ry={36} fill="#0A1F3D" opacity={SHADOW} />
          <ellipse cx={0} cy={24} rx={28} ry={33} fill={skin} />
          <PivotDot on={debug} />
        </g>
        <PivotDot on={debug} />
      </g>
      <PivotDot on={debug} />
    </g>
    );
  };

  const leg = (side: 1 | -1, a: [number, number, number]) => (
    <g transform={`translate(${-side * SZ.hipX} 0) rotate(${side * a[0]})`}>
      <path d={SHAPE.thigh} fill={c.trousers} />
      <g transform={`translate(0 ${SZ.thighL}) rotate(${side * a[1]})`}>
        <path d={SHAPE.calf} fill={c.trousers} />
        <g transform={`translate(0 ${SZ.calfL}) rotate(${side * a[2]})`}>
          <ellipse cx={-side * 14} cy={22} rx={52} ry={24} fill={footCol} />
          <PivotDot on={debug} />
        </g>
        <PivotDot on={debug} />
      </g>
      <PivotDot on={debug} />
    </g>
  );

  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`} opacity={op}>
      {leg(1, p.legL)}
      {leg(-1, p.legR)}
      <path d={SHAPE.pelvis} fill={c.trousers} />
      <g transform={`rotate(${p.lean} 0 ${SZ.waistY})`}>
        <g transform={`translate(0 ${SZ.headPivotY - 14})`}>
          <path d={SHAPE.neck} fill={mix(skin, '#000000', 0.08)} />
        </g>
        <path d={SHAPE.torso} fill={skin} />
        <ellipse cx={-54} cy={-186} rx={34} ry={20} transform="rotate(-24 -54 -186)" fill="#fff" opacity={0.14} />
        {coat && (
          <>
            <path d={SHAPE.coat} fill={COAT} />
            <path d="M -28 -234 L 28 -234 L 9 70 L -9 70 Z" fill={mix(skin, '#ffffff', 0.35)} />
            <path d="M -30 -234 L -9 -234 L 6 -150 L -2 -146 Z" fill={COAT_SH} />
            <path d="M 30 -234 L 9 -234 L -6 -150 L 2 -146 Z" fill={COAT_SH} />
            <ellipse cx={-62} cy={-190} rx={34} ry={18} transform="rotate(-24 -62 -190)" fill="#fff" opacity={0.5} />
            <path d="M -26 -228 C -30 -178 -14 -150 8 -142" fill="none" stroke={STETH} strokeWidth={7} strokeLinecap="round" />
            <path d="M 26 -228 C 30 -178 16 -152 8 -142" fill="none" stroke={STETH} strokeWidth={7} strokeLinecap="round" />
            <circle cx={36} cy={-112} r={14} fill={STETH} />
            <circle cx={36} cy={-112} r={6} fill="#8A97B3" />
            <path d="M 8 -142 C 10 -128 28 -122 36 -112" fill="none" stroke={STETH} strokeWidth={6} strokeLinecap="round" />
          </>
        )}
        {arm(-1, p.armR)}
        {arm(1, p.armL)}
        <g transform={`translate(0 ${SZ.headPivotY}) rotate(${p.head})`}>
          <Head skin={skin} hair={hair} hairCol={hairColor ?? mix(c.main, '#3B1238', 0.5)} />
          <PivotDot on={debug} />
        </g>
        <PivotDot on={debug} />
      </g>
    </g>
  );
};

// ================= TAMPAK SAMPING =================
export const ActorSide: React.FC<P & { role?: ActorRole; pose?: SidePose; debug?: boolean; coat?: boolean; hair?: ActorHair; hairColor?: string }> = ({
  cx, cy, s = 1, rot = 0, op = 1, role = 'blue', pose = {}, debug = false, coat = role === 'purple',
  hair = role === 'pink' ? 'ponytail' : 'none', hairColor,
}) => {
  const c = ACTOR_COL[role];
  const p0 = { ...NEUTRAL_SIDE, ...pose };
  const p = { ...p0, armN: limitArmSide(p0.armN), armF: limitArmSide(p0.armF), legN: limitLegSide(p0.legN), legF: limitLegSide(p0.legF), head: cl(p0.head, -30, 30), lean: cl(p0.lean, -20, 40) };
  const skin = c.main;
  const limb = mix(c.main, '#ffffff', 0.2);
  const limbFar = mix(c.main, '#000000', 0.04);
  const trN = c.trousers;
  const trF = mix(c.trousers, '#000000', 0.16);
  const footN = mix(c.dark, '#000000', 0.1);
  const footF = mix(c.dark, '#000000', 0.26);
  const SH = { x: 4, y: -196 };

  const arm = (a: [number, number, number], col: string, hand: string) => (
    <g transform={`translate(${SH.x} ${SH.y}) rotate(${-a[0]})`}>
      <path d={coat ? SHAPE.sleeveUp : SHAPE.upperArm} fill={coat ? (col === limb ? COAT : COAT_SH) : col} />
      <g transform={`translate(0 ${SZ.upperL}) rotate(${-a[1]})`}>
        <path d={coat ? SHAPE.sleeveFore : SHAPE.foreArm} fill="#0A1F3D" opacity={SHADOW} transform="scale(1.1 1.04)" />
        <path d={coat ? SHAPE.sleeveFore : SHAPE.foreArm} fill={coat ? (col === limb ? COAT : COAT_SH) : col} />
        <g transform={`translate(0 ${SZ.foreL}) rotate(${-a[2]})`}>
          <ellipse cx={0} cy={24} rx={30} ry={35} fill="#0A1F3D" opacity={SHADOW} />
          <ellipse cx={0} cy={24} rx={27} ry={32} fill={hand} />
          <PivotDot on={debug} />
        </g>
        <PivotDot on={debug} />
      </g>
      <PivotDot on={debug} />
    </g>
  );
  const leg = (a: [number, number, number], tr: string, foot: string) => (
    <g transform={`translate(2 0) rotate(${-a[0]})`}>
      <path d={SHAPE.thigh} fill={tr} />
      <g transform={`translate(0 ${SZ.thighL}) rotate(${a[1]})`}>
        <path d={SHAPE.calf} fill={tr} />
        <g transform={`translate(0 ${SZ.calfL}) rotate(${-a[2]})`}>
          <ellipse cx={20} cy={22} rx={58} ry={24} fill={foot} />
          <PivotDot on={debug} />
        </g>
        <PivotDot on={debug} />
      </g>
      <PivotDot on={debug} />
    </g>
  );

  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`} opacity={op}>
      {leg(p.legF, trF, footF)}
      {arm(p.armF, limbFar, mix(skin, '#000000', 0.04))}
      <path d={SHAPE.sidePelvis} fill={trN} />
      {leg(p.legN, trN, footN)}
      <g transform={`rotate(${p.lean} 0 ${SZ.waistY})`}>
        <g transform={`translate(2 ${SZ.headPivotY - 14})`}>
          <path d={SHAPE.neck} fill={mix(skin, '#000000', 0.08)} />
        </g>
        <path d={SHAPE.sideTorso} fill={skin} />
        <ellipse cx={-6} cy={-186} rx={30} ry={18} transform="rotate(-24 -6 -186)" fill="#fff" opacity={0.14} />
        {coat && (
          <>
            <path d={SHAPE.sideCoat} fill={COAT} />
            <path d="M 40 -236 L 72 -236 L 82 96 L 66 96 Z" fill={mix(skin, '#ffffff', 0.35)} opacity={0.0} />
            <path d="M 30 -212 C 40 -184 56 -158 66 -134" fill="none" stroke={STETH} strokeWidth={7} strokeLinecap="round" />
            <circle cx={68} cy={-124} r={13} fill={STETH} />
            <circle cx={68} cy={-124} r={5} fill="#8A97B3" />
          </>
        )}
        {arm(p.armN, limb, skin)}
        <g transform={`translate(2 ${SZ.headPivotY}) rotate(${p.head})`}>
          <Head skin={skin} dx={6} side hair={hair} hairCol={hairColor ?? mix(c.main, '#3B1238', 0.5)} />
          <PivotDot on={debug} />
        </g>
        <PivotDot on={debug} />
      </g>
    </g>
  );
};

// Kursi (objek terpisah). Koordinat relatif ke pusat panggul orang yang duduk di tampak samping (menghadap kanan).
export const Chair: React.FC<P> = ({ cx, cy, s = 1, rot = 0, op = 1 }) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`} opacity={op}>
    <rect x={-96} y={64} width={14} height={124} rx={7} fill="#B8C6DD" transform="rotate(6 -89 64)" />
    <rect x={104} y={64} width={14} height={124} rx={7} fill="#B8C6DD" transform="rotate(-6 111 64)" />
    <rect x={-124} y={-170} width={26} height={236} rx={13} fill="#FFD27A" transform="rotate(-5 -111 66)" />
    <rect x={-112} y={50} width={246} height={26} rx={13} fill="#FFD27A" />
  </g>
);

// Bagian tunggal untuk lembar anatomi (digambar di pivot-nya).
export type PartName = 'head' | 'neck' | 'torso' | 'pelvis' | 'upperArm' | 'foreArm' | 'hand' | 'thigh' | 'calf' | 'foot' | 'sideTorso' | 'sidePelvis' | 'sideFoot';
export const PartPreview: React.FC<{ part: PartName; role?: ActorRole }> = ({ part, role = 'blue' }) => {
  const c = ACTOR_COL[role];
  const skin = c.main;
  const limb = mix(c.main, '#ffffff', 0.2);
  const footCol = mix(c.dark, '#000000', 0.1);
  let body: React.ReactNode = null;
  let pv: [number, number] = [0, 0];
  switch (part) {
    case 'head': body = <Head skin={skin} />; break;
    case 'neck': body = <path d={SHAPE.neck} fill={mix(skin, '#000000', 0.08)} />; break;
    case 'torso': body = <><path d={SHAPE.torso} fill={skin} /><ellipse cx={-54} cy={-186} rx={34} ry={20} transform="rotate(-24 -54 -186)" fill="#fff" opacity={0.14} /></>; pv = [0, SZ.waistY]; break;
    case 'pelvis': body = <path d={SHAPE.pelvis} fill={c.trousers} />; break;
    case 'upperArm': body = <path d={SHAPE.upperArm} fill={limb} />; break;
    case 'foreArm': body = <path d={SHAPE.foreArm} fill={limb} />; break;
    case 'hand': body = <ellipse cx={0} cy={24} rx={28} ry={33} fill={skin} />; break;
    case 'thigh': body = <path d={SHAPE.thigh} fill={c.trousers} />; break;
    case 'calf': body = <path d={SHAPE.calf} fill={c.trousers} />; break;
    case 'foot': body = <ellipse cx={-14} cy={22} rx={52} ry={24} fill={footCol} />; break;
    case 'sideTorso': body = <path d={SHAPE.sideTorso} fill={skin} />; pv = [0, SZ.waistY]; break;
    case 'sidePelvis': body = <path d={SHAPE.sidePelvis} fill={c.trousers} />; break;
    case 'sideFoot': body = <ellipse cx={20} cy={22} rx={58} ry={24} fill={footCol} />; break;
  }
  return (
    <g>
      {body}
      <circle cx={pv[0]} cy={pv[1]} r={7} fill="#fff" />
    </g>
  );
};

// ---------- preset pose (nilai yang sudah diuji di lembar uji sendi) ----------
export const POSES_FRONT: Record<string, Pose> = {
  berdiri: {},
  tanganDiDada: { armL: [22, -100, 0], armR: [22, -100, 0] },
  kepalaMiring: { head: 20, lean: 8 },
  melangkah: { legL: [22, 18, 0], legR: [-14, -30, 0] },
  lenganNaik: { armL: [150, 0, 0], armR: [35, 0, 0] },
};
export const POSES_SIDE: Record<string, SidePose> = {
  berdiri: {},
  duduk: { legN: [90, 90, 0], legF: [86, 92, 0], armN: [8, 100, 0], armF: [6, 96, 0] },
  jalan: { legN: [20, 10, -4], legF: [-16, 28, 8], armN: [-28, 18, 0], armF: [30, 34, 0], lean: 4 },
  menunjukAtas: { armN: [125, 8, 0], head: -6 },
  membungkuk: { lean: 30, head: 15, armN: [20, 20, 0] },
  tanganDiDagu: { lean: 12, head: 10, armN: [40, 120, 0], armF: [30, 100, 0], legN: [55, 100, 10], legF: [35, 95, 0] },
};
