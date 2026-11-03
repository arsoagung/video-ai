import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { FPS } from '../Board';
import { ez, lerp, win, V, out3, sine, FOV } from '../motion';
import { Virus, CellSet } from '../parts3d';

// ---------------- kamera ----------------
type K = { t: number; p: [number, number, number]; l: [number, number, number] };
const KEYS: K[] = [
  { t: 0, p: [0, 0.5, 16], l: [0, 0.4, 0] },
  { t: 4.3, p: [0.3, 0.6, 12.5], l: [0, 0.4, 0] },
  { t: 4.4, p: [0, 1.6, 27], l: [0, 0, 0] },
  { t: 8.5, p: [0.6, 1.2, 22], l: [0, 0, 0] },
  { t: 10.4, p: [0.3, 1.2, 18], l: [0, 0.2, 0] },
  { t: 16, p: [0.2, 1.2, 17.5], l: [0, 0.2, 0] },
  { t: 16.1, p: [0, 0.5, 14], l: [0, 0, 0] },
  { t: 52.9, p: [0, 0.5, 21], l: [0, 0, 0] },
  { t: 53.0, p: [0, 0.6, 13.5], l: [0, 0, 0] },
  { t: 60, p: [0.3, 0.6, 12.5], l: [0, 0, 0] },
];
export const camAt2 = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1].t) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const k = ez(t, a.t, b.t, sine);
  const p = V(lerp(a.p[0], b.p[0], k), lerp(a.p[1], b.p[1], k), lerp(a.p[2], b.p[2], k));
  const l = V(lerp(a.l[0], b.l[0], k), lerp(a.l[1], b.l[1], k), lerp(a.l[2], b.l[2], k));
  p.x += Math.sin(t * 0.33) * 0.07;
  p.y += Math.sin(t * 0.27) * 0.05;
  l.y -= 0.065 * p.distanceTo(l); // isi sedikit ke atas, subtitle di bawah bebas
  return { p, l };
};
const projCam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 120);
export const project2 = (t: number, w: THREE.Vector3): [number, number] => {
  const { p, l } = camAt2(t);
  projCam.position.copy(p);
  projCam.lookAt(l);
  projCam.updateMatrixWorld(true);
  projCam.updateProjectionMatrix();
  const v = w.clone().project(projCam);
  return [(v.x * 0.5 + 0.5) * 1080, (-v.y * 0.5 + 0.5) * 1920];
};

const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    return null;
  }, [gl, scene]);
  return null;
};
const Rig: React.FC<{ t: number }> = ({ t }) => {
  const { camera } = useThree();
  const { p, l } = camAt2(t);
  camera.position.copy(p);
  camera.lookAt(l);
  camera.updateProjectionMatrix();
  return null;
};
const Pop: React.FC<{ s: number; pos?: THREE.Vector3; children: React.ReactNode }> = ({ s, pos, children }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos ? (pos.toArray() as [number, number, number]) : [0, 0, 0]} scale={s}>
      {children}
    </group>
  );
};

// ---------------- posisi bersama (objek dan label) ----------------
export const memb2 = (x: number, y: number, z: number) => V(x, y, z).normalize().multiplyScalar(4.6);
export const TOUCH_DIR = V(0.3, 0.3, 0.9).normalize();
export const TOUCH = TOUCH_DIR.clone().multiplyScalar(4.6 + 0.85);
export const INSIDE = V(0, 1.05, 0);
const V_START = V(6.5, 7.5, 6);
export const virus3Pos = (t: number) => {
  if (t < 13.3) {
    const k = ez(t, 10.6, 13.0, out3);
    const p = V_START.clone().lerp(TOUCH, k);
    p.x += Math.sin(t * 2.1) * 0.08 * (1 - k);
    return p;
  }
  if (t < 13.9) return TOUCH.clone();
  return TOUCH.clone().lerp(INSIDE, ez(t, 13.9, 15.3, sine));
};
const virus1Pos = (t: number) => V(Math.sin(t * 0.8) * 0.25, 0.9 + Math.sin(t * 1.1) * 0.12, lerp(-7, 0.5, ez(t, 0, 3.4, out3)));

// ---------------- latar ----------------
const rnd = (seed: number) => {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};
const BOKEH = (() => {
  const r = rnd(7);
  return Array.from({ length: 46 }, () => ({ x: (r() - 0.5) * 22, y: (r() - 0.5) * 30, z: -3 - r() * 9, s: 0.08 + r() * 0.22, p: r() * 6, c: r() > 0.6 ? '#FFD7A8' : '#BFE3FF' }));
})();

const DISTRACT = [
  { p: [-9.5, 6.0, -9], r: 3.0, c: '#E7A1A1', ph: 0.4 },
  { p: [10.5, -3.5, -11], r: 3.6, c: '#C9C3E6', ph: 1.7 },
  { p: [-8.0, -9.0, -8], r: 2.6, c: '#F2D9A0', ph: 2.9 },
  { p: [9.5, 8.5, -13], r: 3.2, c: '#A9D6C9', ph: 4.2 },
] as const;

// ---------------- sel CD4 kecil ----------------
const fibDirs = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = Math.PI * (3 - Math.sqrt(5)) * i;
    return V(Math.cos(th) * r, y, Math.sin(th) * r).normalize();
  });
const REC_Q = fibDirs(14).map((d) => ({ q: new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d), d }));
const MiniCell: React.FC<{ r: number }> = ({ r }) => (
  <group scale={r}>
    <mesh>
      <sphereGeometry args={[1, 36, 36]} />
      <meshPhysicalMaterial color="#6FB1F2" transparent opacity={0.3} roughness={0.12} clearcoat={1} depthWrite={false} envMapIntensity={0.6} />
    </mesh>
    <mesh scale={0.42} position={[0.12, -0.08, 0.05]}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshPhysicalMaterial color="#8FB9EE" transparent opacity={0.75} roughness={0.25} clearcoat={1} />
    </mesh>
    {REC_Q.map((rq, i) => (
      <group key={i} position={rq.d.toArray()} quaternion={rq.q}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.02, 0.028, 0.2, 8]} />
          <meshPhysicalMaterial color="#8FD0FF" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshPhysicalMaterial color="#FFFFFF" roughness={0.2} clearcoat={1} />
        </mesh>
      </group>
    ))}
  </group>
);

const CD4_CELLS = (() => {
  const r = rnd(21);
  const xs = [-2.5, 0, 2.5];
  const ys = [1.8, -0.2, -2.2];
  return Array.from({ length: 9 }, (_, i) => ({ x: xs[i % 3] + (r() - 0.5) * 0.5, y: ys[Math.floor(i / 3)] + (r() - 0.5) * 0.4, z: (r() - 0.5) * 1.5, r: 0.7 + r() * 0.12, ph: r() * 6, i }));
})();

const VIR_STREAM = (() => {
  const r = rnd(33);
  return Array.from({ length: 15 }, (_, i) => ({ ph: i * (20 / 15), sp: 1.1, y: (r() - 0.5) * 3.2, z: (r() - 0.5) * 2.2, wob: r() * 6 }));
})();

export const World2: React.FC<{ t: number }> = ({ t }) => {
  // jendela adegan
  const s1 = win(t, 0.0, 4.4, 0.45);
  const cellS = win(t, 4.4, 15.9, 0.55);
  const distS = win(t, 4.4, 10.4, 0.5);
  const lock = ez(t, 8.5, 9.4) * (1 - ez(t, 10.2, 11.0));
  const rec = ez(t, 4.6, 5.6);
  const v3 = win(t, 10.5, 15.9, 0.35) * (1 - 0 * 1);
  const tube = win(t, 47.9, 53.0, 0.5);
  const cd4 = win(t, 52.8, 57.8, 0.5);

  return (
    <>
      <Env />
      <Rig t={t} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <pointLight position={[-3, 2, 3]} intensity={30} color="#FFB48A" />
      <pointLight position={[3, -2, 2]} intensity={20} color="#7FD6FF" />

      {BOKEH.map((b, i) => (
        <mesh key={i} position={[b.x + Math.sin(t * 0.4 + b.p) * 0.3, b.y + Math.cos(t * 0.35 + b.p) * 0.3, b.z]}>
          <sphereGeometry args={[b.s, 8, 8]} />
          <meshBasicMaterial color={b.c} transparent opacity={0.35} />
        </mesh>
      ))}

      {/* S1: satu partikel HIV */}
      <Pop s={s1} pos={virus1Pos(t)}>
        <Virus t={t} scale={2.1} />
      </Pop>

      {/* S2-S3: sel CD4 di antara sel lain */}
      <group visible={cellS > 0.01}>
        <group scale={cellS}>
          <CellSet t={t} op={cellS} receptors={rec} />
          {lock > 0.01 && (
            <mesh scale={1.02 + Math.sin(t * 4) * 0.01}>
              <sphereGeometry args={[4.6, 48, 48]} />
              <meshBasicMaterial color="#9CCBFF" transparent opacity={0.16 * lock} depthWrite={false} side={THREE.BackSide} />
            </mesh>
          )}
        </group>
      </group>
      {DISTRACT.map((d, i) => (
        <Pop key={i} s={distS} pos={V(d.p[0] + Math.sin(t * 0.3 + d.ph) * 0.6, d.p[1] + Math.cos(t * 0.25 + d.ph) * 0.5, d.p[2])}>
          <mesh>
            <sphereGeometry args={[d.r, 36, 36]} />
            <meshPhysicalMaterial color={d.c} transparent opacity={0.34} roughness={0.2} clearcoat={0.8} depthWrite={false} />
          </mesh>
          <mesh scale={0.4}>
            <sphereGeometry args={[d.r, 24, 24]} />
            <meshPhysicalMaterial color={d.c} transparent opacity={0.6} roughness={0.3} />
          </mesh>
        </Pop>
      ))}
      <Pop s={v3} pos={virus3Pos(t)}>
        <Virus t={t} scale={1.0} spikeS={1 - 0.6 * ez(t, 14.0, 15.0)} shellOp={0.55 * (1 - ez(t, 14.2, 15.2))} capsid />
      </Pop>

      {/* S9: HIV di dalam aliran darah (gaya abstrak) */}
      <group visible={tube > 0.01} scale={tube}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[2.5, 2.5, 20, 56, 1, true]} />
          <meshPhysicalMaterial color="#FF9F8F" transparent opacity={0.13} side={THREE.DoubleSide} roughness={0.2} clearcoat={1} depthWrite={false} />
        </mesh>
        {[-6, -2, 2, 6].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[2.5, 0.025, 8, 48]} />
            <meshBasicMaterial color="#FFC4B8" transparent opacity={0.35} />
          </mesh>
        ))}
        {VIR_STREAM.map((v, i) => {
          const x = ((v.ph + t * v.sp) % 20) - 10;
          return (
            <group key={i} position={[x, v.y + Math.sin(t * 1.3 + v.wob) * 0.18, v.z]}>
              <Virus t={t + i} scale={0.5} capsid={false} spin={0.9} shellOp={0.6} />
            </group>
          );
        })}
      </group>

      {/* S10: sel CD4 sebagai gambaran kondisi imun */}
      <group visible={cd4 > 0.01} scale={cd4}>
        {CD4_CELLS.map((c, i) => (
          <group key={i} position={[c.x + Math.sin(t * 0.5 + c.ph) * 0.25, c.y + Math.cos(t * 0.45 + c.ph) * 0.25, c.z]} rotation={[t * 0.12 + c.ph, t * 0.1, 0]}>
            <MiniCell r={c.r} />
          </group>
        ))}
      </group>
    </>
  );
};

const BG = 'linear-gradient(180deg,#0A1F3D 0%,#123A60 55%,#17506F 100%)';
export const Plate2: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const on = t < 16.4 || (t > 47.6 && t < 58.0);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ background: 'radial-gradient(760px 760px at 50% 40%, #3C86C455, transparent 70%)' }} />
      {on && (
        <ThreeCanvas width={1080} height={1920} camera={{ fov: FOV, position: [0, 1, 16], near: 0.1, far: 120 }} gl={{ alpha: true, antialias: true }}>
          <World2 t={t} />
        </ThreeCanvas>
      )}
    </AbsoluteFill>
  );
};
