import * as THREE from 'three';
import { Easing, interpolate } from 'remotion';

export const ez = (t: number, a: number, b: number, e: (x: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const out3 = Easing.out(Easing.cubic);
export const in3 = Easing.in(Easing.cubic);
export const sine = Easing.inOut(Easing.sin);
export const back = Easing.out(Easing.back(2.0));
// jendela tampil: fade in di a, fade out di b
export const win = (t: number, a: number, b: number, f = 0.35) => ez(t, a, a + f, out3) * (1 - ez(t, b - f, b, in3));
export const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export const R_CELL = 4.6;
export const NUC = V(0.4, -2.3, -1.2);

// ---------- RNA virus (lurus-bergelombang) & heliks ----------
export const rnaCurve = (() => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    pts.push(V(-1.9 + 3.8 * u, 1.15 + 0.2 * Math.sin(i * 0.95), 0.16 * Math.cos(i * 0.95)));
  }
  return new THREE.CatmullRomCurve3(pts);
})();
export const rnaPoint = (u: number) => rnaCurve.getPoint(Math.min(0.999, Math.max(0, u)));

export const HELIX_C = { x0: -1.9, x1: 1.9, y: 0.28, z: 0, r: 0.28, turns: 3.2 };
export const helixPoint = (h: typeof HELIX_C, u: number, phase = 0) => {
  const a = u * Math.PI * 2 * h.turns + phase;
  return V(h.x0 + (h.x1 - h.x0) * u, h.y + h.r * Math.cos(a), h.z + h.r * Math.sin(a));
};

// ---------- posisi objek yang bergerak (dipakai objek 3D dan label) ----------
export const virusFly = (t: number) => {
  const k = ez(t, 4.6, 7.8);
  return V(lerp(-4.4, 0, k), lerp(3.6, 1.05, k) + Math.sin(t * 2.0) * 0.06 + Math.sin(k * Math.PI) * 0.9, lerp(2.0, 0, k));
};
export const enzymeUC = (t: number) => ez(t, 11.2, 15.0, sine);
export const enzymeUGH = (t: number) => ez(t, 38.0, 39.2, sine) * 0.18;
export const enzymePosC = (t: number) => rnaPoint(enzymeUC(t)).add(V(0, 0.1, 0));
export const enzymePosGH = (t: number) => rnaPoint(enzymeUGH(t)).add(V(0, 0.1, 0));

export const HOST_GAP = { x: 0.4, y: NUC.y, z: NUC.z };
export const virionAssembly = V(3.0, 0.9, 0.4);
export const virionOut = V(5.0, 1.0, 0.5);
export const virionPos = (t: number) => {
  const k = ez(t, 28.0, 29.5, sine);
  return virionAssembly.clone().lerp(virionOut, k);
};

// ---------- kamera ----------
type K = { t: number; p: [number, number, number]; l: [number, number, number] };
export const KEYS: K[] = [
  { t: 0, p: [1.2, 0.6, 10.5], l: [0, 0.2, 0] },
  { t: 3.9, p: [-0.8, 0.4, 9.6], l: [0, 0.2, 0] },
  { t: 4.7, p: [0.5, 2.0, 17], l: [0, -0.2, 0] },
  { t: 7.7, p: [0, 1.4, 13], l: [0, -0.1, 0] },
  { t: 8.1, p: [0, 1.4, 13], l: [0, -0.1, 0] },
  { t: 11, p: [0, 1.2, 9.2], l: [0, 0.5, 0] },
  { t: 16.0, p: [0, 0.9, 7.4], l: [0, 0.5, 0] },
  { t: 17.4, p: [1.4, -0.6, 6.6], l: [0.4, -1.9, -1.2] },
  { t: 21.4, p: [0.6, -0.9, 6.2], l: [0.4, -1.9, -1.2] },
  { t: 22.4, p: [1.0, 0.8, 12.5], l: [1.3, 0.3, 0] },
  { t: 29.4, p: [1.4, 0.9, 12.0], l: [1.4, 0.4, 0] },
  { t: 30.2, p: [0, 0.3, 9], l: [0, 0.2, 0] },
  { t: 32.9, p: [0, 0.3, 8.5], l: [0, 0.2, 0] },
  { t: 33.6, p: [-0.3, 1.0, 8.8], l: [-0.3, 0.5, 0] },
  { t: 41.1, p: [-0.3, 0.9, 8.6], l: [-0.3, 0.5, 0] },
  { t: 42.0, p: [1.4, -0.6, 6.6], l: [0.4, -1.9, -1.2] },
  { t: 48.0, p: [0.6, -0.9, 6.2], l: [0.4, -1.9, -1.2] },
  { t: 49.0, p: [0, 0.6, 8.5], l: [0, 0.3, 0] },
  { t: 56.3, p: [0.4, 0.5, 8.0], l: [0, 0.3, 0] },
  { t: 57.2, p: [0, 0.3, 9.2], l: [0, 0, 0] },
  { t: 61.8, p: [0, 0.3, 8.6], l: [0, 0, 0] },
  { t: 62.6, p: [1.6, 1.6, 13.8], l: [0, 0.1, 0] },
  { t: 68.5, p: [-1.0, 1.2, 13.4], l: [0, 0.1, 0] },
  { t: 69.4, p: [0, 1.2, 13.5], l: [0, 0, 0] },
  { t: 74.0, p: [0, 1.0, 11], l: [0, 0, 0] },
  { t: 75.0, p: [0, 0.4, 9.6], l: [0, 0, 0] },
  { t: 81, p: [0, 0.4, 9.2], l: [0, 0, 0] },
];

export const camAt = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1].t) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const k = ez(t, a.t, b.t, sine);
  const p = V(lerp(a.p[0], b.p[0], k), lerp(a.p[1], b.p[1], k), lerp(a.p[2], b.p[2], k));
  const l = V(lerp(a.l[0], b.l[0], k), lerp(a.l[1], b.l[1], k), lerp(a.l[2], b.l[2], k));
  p.x += Math.sin(t * 0.33) * 0.07;
  p.y += Math.sin(t * 0.27) * 0.05;
  // geser isi ke atas agar area subtitle di bawah bebas
  l.y -= 0.065 * p.distanceTo(l);
  return { p, l };
};

export const FOV = 55;
const projCam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 80);
export const project = (t: number, w: THREE.Vector3): [number, number] => {
  const { p, l } = camAt(t);
  projCam.position.copy(p);
  projCam.lookAt(l);
  projCam.updateMatrixWorld(true);
  projCam.updateProjectionMatrix();
  const v = w.clone().project(projCam);
  return [(v.x * 0.5 + 0.5) * 1080, (-v.y * 0.5 + 0.5) * 1920];
};
