// Geometri tangan-bebas (deterministik, tanpa random per frame)
export type Pt = [number, number];
export type Sub = Pt[];

const f1 = (n: number) => n.toFixed(1);
export const toPath = (subs: Sub[], close = false) =>
  subs.map((p) => 'M' + p.map((q) => `${f1(q[0])} ${f1(q[1])}`).join(' L ') + (close ? ' Z' : '')).join(' ');

const rad = (d: number) => (d * Math.PI) / 180;

// lingkaran bergoyang halus + sedikit overshoot saat menutup
export const circleSub = (cx: number, cy: number, r: number, phase = 0, startDeg = -90): Sub => {
  const n = Math.max(28, Math.round(r * 0.55));
  const pts: Pt[] = [];
  const total = 360 + 7;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * total;
    const a = rad(startDeg + t);
    const w = 1 + 0.012 * Math.sin(rad(2 * t) + phase) + 0.008 * Math.sin(rad(5 * t) + phase * 2);
    pts.push([cx + Math.cos(a) * r * w, cy + Math.sin(a) * r * w]);
  }
  return pts;
};

export const ellipseSub = (cx: number, cy: number, rx: number, ry: number, phase = 0, startDeg = -90): Sub => {
  const n = Math.max(48, Math.round((rx + ry) * 0.18));
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * 364;
    const a = rad(startDeg + t);
    const w = 1 + 0.018 * Math.sin(rad(3 * t) + phase) + 0.01 * Math.sin(rad(7 * t) + phase);
    pts.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]);
  }
  return pts;
};

export const lineSub = (x1: number, y1: number, x2: number, y2: number, bow = 0): Sub => {
  const n = Math.max(6, Math.round(Math.hypot(x2 - x1, y2 - y1) / 10));
  const nx = -(y2 - y1);
  const ny = x2 - x1;
  const len = Math.hypot(nx, ny) || 1;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const o = Math.sin(Math.PI * t) * bow;
    pts.push([x1 + (x2 - x1) * t + (nx / len) * o, y1 + (y2 - y1) * t + (ny / len) * o]);
  }
  return pts;
};

export const waveSub = (x1: number, x2: number, y: number, amp: number, waves: number, phase = 0): Sub => {
  const n = Math.round(Math.abs(x2 - x1) / 5);
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([x1 + (x2 - x1) * t, y + Math.sin(phase + t * waves * Math.PI * 2) * amp]);
  }
  return pts;
};

export const arrowSubs = (x1: number, y1: number, x2: number, y2: number, head = 26, bow = 0): Sub[] => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  return [
    lineSub(x1, y1, x2, y2, bow),
    [
      [x2 - Math.cos(a - 0.5) * head, y2 - Math.sin(a - 0.5) * head],
      [x2, y2],
      [x2 - Math.cos(a + 0.5) * head, y2 - Math.sin(a + 0.5) * head],
    ],
  ];
};

export const crossSubs = (cx: number, cy: number, s: number): Sub[] => [
  lineSub(cx - s, cy - s, cx + s, cy + s, 2),
  lineSub(cx + s, cy - s, cx - s, cy + s, -2),
];

export const checkSub = (cx: number, cy: number, s: number): Sub => [
  [cx - s, cy],
  [cx - s * 0.3, cy + s * 0.7],
  [cx + s, cy - s * 0.8],
];

// virus: badan + paku bertitik
export const virusSubs = (cx: number, cy: number, r: number, spikes = 12): { body: Sub[]; spikes: Sub[] } => {
  const sp: Sub[] = [];
  for (let i = 0; i < spikes; i++) {
    const a = rad((i / spikes) * 360 + 8);
    const r0 = r * 1.02;
    const r1 = r * 1.34;
    sp.push([
      [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0],
      [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1],
    ]);
    const k = circleSub(cx + Math.cos(a) * (r1 + r * 0.1), cy + Math.sin(a) * (r1 + r * 0.1), r * 0.1, i, 0);
    sp.push(k);
  }
  return { body: [circleSub(cx, cy, r, 0.6)], spikes: sp };
};

// heliks DNA horizontal
export const helixSubs = (x1: number, x2: number, y: number, amp: number, turns: number): Sub[] => {
  const a = waveSub(x1, x2, y, amp, turns, 0);
  const b = waveSub(x1, x2, y, amp, turns, Math.PI);
  const rungs: Sub[] = [];
  const m = Math.round(turns * 4);
  for (let i = 1; i < m; i++) {
    const t = i / m;
    const x = x1 + (x2 - x1) * t;
    const yy = Math.sin(t * turns * Math.PI * 2) * amp;
    rungs.push([
      [x, y + yy],
      [x, y - yy],
    ]);
  }
  return [a, b, ...rungs];
};

// kapsul (stadium) berotasi; mengembalikan outline dan separuh kiri untuk isian
export const capsule = (cx: number, cy: number, len: number, w: number, deg: number) => {
  const r = w / 2;
  const half = len / 2 - r;
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  const rot = (x: number, y: number): Pt => [cx + x * c - y * s, cy + x * s + y * c];
  const outline: Pt[] = [];
  const left: Pt[] = [];
  const steps = 18;
  // sisi atas kiri->kanan
  outline.push(rot(-half, -r), rot(half, -r));
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (i / steps) * Math.PI;
    outline.push(rot(half + Math.cos(a) * r, Math.sin(a) * r));
  }
  outline.push(rot(-half, r));
  for (let i = 0; i <= steps; i++) {
    const a = Math.PI / 2 + (i / steps) * Math.PI;
    outline.push(rot(-half + Math.cos(a) * r, Math.sin(a) * r));
  }
  // separuh kiri
  left.push(rot(0, -r));
  left.push(rot(-half, -r));
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 - (i / steps) * Math.PI;
    left.push(rot(-half + Math.cos(a) * r, Math.sin(a) * r));
  }
  left.push(rot(0, r));
  return { outline: [outline] as Sub[], leftFill: toPath([left], true), divider: [[rot(0, -r), rot(0, r)]] as Sub[] };
};
