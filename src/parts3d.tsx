import React, { useMemo } from 'react';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ez, V, out3 } from './motion';

const UP = V(0, 1, 0);
const fib = (n: number, jitter = 0) =>
  Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = Math.PI * (3 - Math.sqrt(5)) * i;
    return V(Math.cos(th) * r, y + jitter * Math.sin(i * 7), Math.sin(th) * r).normalize();
  });
const quatTo = (d: THREE.Vector3) => new THREE.Quaternion().setFromUnitVectors(UP, d);

// ---------------- Virus (HIV) ----------------
const SPIKES = fib(28).map(quatTo);
const TRI: [number, number][] = [
  [0.05, 0],
  [-0.025, 0.043],
  [-0.025, -0.043],
];
const capsidGeo = new THREE.ConeGeometry(0.21, 0.46, 28);
const innerRna = (() => {
  const mk = (ph: number) =>
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(Array.from({ length: 12 }, (_, i) => V(Math.sin(i * 0.9 + ph) * 0.07, 0.18 - i * 0.03, Math.cos(i * 0.9 + ph) * 0.07))),
      40, 0.014, 6, false,
    );
  return [mk(0), mk(2.1)];
})();

export const Virus: React.FC<{
  t: number;
  scale?: number;
  shellOp?: number;
  spikeS?: number;
  color?: string;
  spikeColor?: string;
  capsid?: boolean;
  spin?: number;
}> = ({ t, scale = 1, shellOp = 0.55, spikeS = 1, color = '#FF6A4B', spikeColor = '#FF8E70', capsid = true, spin = 0.7 }) => (
  <group scale={scale} rotation={[0.25, t * spin, Math.sin(t * 0.8) * 0.12]}>
    <mesh>
      <sphereGeometry args={[0.55, 48, 48]} />
      <meshPhysicalMaterial color={color} transparent opacity={shellOp} roughness={0.28} clearcoat={1} clearcoatRoughness={0.15} envMapIntensity={0.7} depthWrite={false} />
    </mesh>
    {capsid && (
      <group>
        <mesh geometry={capsidGeo} rotation={[Math.PI, 0, 0.35]} position={[0, 0, 0]}>
          <meshPhysicalMaterial color="#FFC24D" roughness={0.35} clearcoat={0.6} envMapIntensity={0.5} />
        </mesh>
        {innerRna.map((g, i) => (
          <mesh key={i} geometry={g} rotation={[Math.PI, 0, 0.35]}>
            <meshStandardMaterial color="#C0392B" emissive="#7A1F12" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>
    )}
    {SPIKES.map((q, i) => {
      const w = spikeS * (1 + Math.sin(t * 3 + i) * 0.07);
      return (
        <group key={i} quaternion={q} scale={w}>
          <mesh position={[0, 0.66, 0]}>
            <cylinderGeometry args={[0.024, 0.034, 0.24, 10]} />
            <meshPhysicalMaterial color={spikeColor} roughness={0.4} clearcoat={0.5} />
          </mesh>
          {TRI.map(([x, z], j) => (
            <mesh key={j} position={[x, 0.82, z]}>
              <sphereGeometry args={[0.052, 14, 14]} />
              <meshPhysicalMaterial color="#FFD9CC" roughness={0.2} clearcoat={1} />
            </mesh>
          ))}
          <mesh position={[0, 0.86, 0]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshPhysicalMaterial color="#FFFFFF" roughness={0.2} clearcoat={1} />
          </mesh>
        </group>
      );
    })}
  </group>
);

// ---------------- Protein berbonggol (enzim) ----------------
const bumpy = (seed: number) => {
  const g0 = new THREE.IcosahedronGeometry(1, 5);
  g0.deleteAttribute('normal');
  g0.deleteAttribute('uv');
  const g = mergeVertices(g0);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const d = 1 + 0.11 * Math.sin(5 * v.x + seed) * Math.sin(4 * v.y + seed * 2) * Math.sin(6 * v.z + 1) + 0.05 * Math.sin(11 * v.x + 3 * v.z + seed);
    pos.setXYZ(i, v.x * d, v.y * d, v.z * d);
  }
  g.computeVertexNormals();
  return g;
};
const enzGeoA = bumpy(1.3);
const enzGeoB = bumpy(4.1);

export const Enzyme: React.FC<{ t: number; scale?: number; color?: string; shake?: number }> = ({ t, scale = 1, color = '#22C3B0', shake = 0 }) => {
  const wob = 1 + Math.sin(t * 7) * 0.05;
  const sx = Math.sin(t * 60) * shake * 0.05;
  return (
    <group scale={scale} position={[sx, 0, 0]}>
      <mesh geometry={enzGeoA} scale={[0.52 * wob, 0.34 / wob, 0.4 * wob]}>
        <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={1} envMapIntensity={0.7} />
      </mesh>
      <mesh geometry={enzGeoB} scale={[0.3, 0.22, 0.26]} position={[0.06, -0.3, 0.05]}>
        <meshPhysicalMaterial color={color} roughness={0.22} clearcoat={1} envMapIntensity={0.6} emissive={color} emissiveIntensity={0.08} />
      </mesh>
      <mesh geometry={enzGeoB} scale={[0.17, 0.14, 0.17]} position={[-0.34, 0.06, 0.1]}>
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={1} envMapIntensity={0.6} />
      </mesh>
    </group>
  );
};

// ---------------- Kapsul ARV ----------------
export const Pill: React.FC<{ t?: number; scale?: number; rot?: number }> = ({ t = 0, scale = 1, rot = 0.5 }) => (
  <group scale={scale} rotation={[0.25, Math.sin(t * 0.7) * 0.7, rot]}>
    <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.28, 0, 0]}>
      <cylinderGeometry args={[0.34, 0.34, 0.56, 36]} />
      <meshPhysicalMaterial color="#16A394" roughness={0.18} clearcoat={1} envMapIntensity={0.8} />
    </mesh>
    <mesh position={[-0.56, 0, 0]}>
      <sphereGeometry args={[0.34, 36, 36]} />
      <meshPhysicalMaterial color="#16A394" roughness={0.18} clearcoat={1} envMapIntensity={0.8} />
    </mesh>
    <mesh rotation={[0, 0, Math.PI / 2]} position={[0.28, 0, 0]}>
      <cylinderGeometry args={[0.34, 0.34, 0.56, 36]} />
      <meshPhysicalMaterial color="#F4F7FA" roughness={0.18} clearcoat={1} envMapIntensity={0.8} />
    </mesh>
    <mesh position={[0.56, 0, 0]}>
      <sphereGeometry args={[0.34, 36, 36]} />
      <meshPhysicalMaterial color="#F4F7FA" roughness={0.18} clearcoat={1} envMapIntensity={0.8} />
    </mesh>
  </group>
);

// ---------------- Heliks DNA ----------------
type HP = { x0: number; x1: number; y: number; z: number; r: number; turns: number };
const helixCurve = (h: HP, phase: number) => {
  const pts: THREE.Vector3[] = [];
  const N = Math.max(40, Math.round(h.turns * 40));
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const a = u * Math.PI * 2 * h.turns + phase;
    pts.push(V(h.x0 + (h.x1 - h.x0) * u, h.y + h.r * Math.cos(a), h.z + h.r * Math.sin(a)));
  }
  return new THREE.CatmullRomCurve3(pts);
};
const BASES: [string, string][] = [
  ['#FF6B6B', '#6BCBFF'],
  ['#6BCBFF', '#FF6B6B'],
  ['#FFD93D', '#6BFF95'],
  ['#6BFF95', '#FFD93D'],
];

export const Helix: React.FC<{
  h: HP;
  progress: number;
  c1: string;
  c2: string;
  tube?: number;
  ghost?: boolean;
  bases?: boolean;
}> = ({ h, progress, c1, c2, tube = 0.055, ghost = false, bases = true }) => {
  const key = `${h.x0}|${h.x1}|${h.y}|${h.z}|${h.r}|${h.turns}|${tube}`;
  const geo = useMemo(
    () => ({
      a: new THREE.TubeGeometry(helixCurve(h, 0), Math.round(h.turns * 70), tube, 10, false),
      b: new THREE.TubeGeometry(helixCurve(h, Math.PI), Math.round(h.turns * 70), tube, 10, false),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  [geo.a, geo.b].forEach((g) => {
    const total = g.index ? g.index.count : 0;
    g.setDrawRange(0, Math.max(0, Math.floor((total * progress) / 6) * 6));
  });
  const nR = Math.max(6, Math.round(h.turns * 8));
  const op = ghost ? 0.16 : 1;
  return (
    <group>
      <mesh geometry={geo.a} visible={progress > 0.001}>
        <meshPhysicalMaterial color={c1} transparent={ghost} opacity={op} emissive={c1} emissiveIntensity={ghost ? 0 : 0.3} roughness={0.28} clearcoat={0.8} envMapIntensity={0.6} />
      </mesh>
      <mesh geometry={geo.b} visible={progress > 0.001}>
        <meshPhysicalMaterial color={c2} transparent={ghost} opacity={op} emissive={c2} emissiveIntensity={ghost ? 0 : 0.25} roughness={0.28} clearcoat={0.8} envMapIntensity={0.6} />
      </mesh>
      {Array.from({ length: nR }, (_, i) => {
        const u = (i + 0.5) / nR;
        const s = ghost ? (progress > 0.001 ? 1 : 0) : ez(progress, u - 0.015, u + 0.015, out3);
        if (s <= 0.001) return null;
        const a = u * Math.PI * 2 * h.turns;
        const [ca, cb] = BASES[i % 4];
        return (
          <group key={i} position={[h.x0 + (h.x1 - h.x0) * u, h.y, h.z]} rotation={[a, 0, 0]} scale={[s, s, s]}>
            {bases ? (
              <>
                <mesh position={[0, h.r / 2, 0]}>
                  <cylinderGeometry args={[0.022, 0.022, h.r, 8]} />
                  <meshPhysicalMaterial color={ca} transparent={ghost} opacity={op} roughness={0.3} clearcoat={0.6} />
                </mesh>
                <mesh position={[0, -h.r / 2, 0]}>
                  <cylinderGeometry args={[0.022, 0.022, h.r, 8]} />
                  <meshPhysicalMaterial color={cb} transparent={ghost} opacity={op} roughness={0.3} clearcoat={0.6} />
                </mesh>
              </>
            ) : (
              <mesh>
                <cylinderGeometry args={[0.02, 0.02, h.r * 2, 8]} />
                <meshPhysicalMaterial color="#FFE9A8" roughness={0.3} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

export const Strand: React.FC<{ geo: THREE.BufferGeometry; progress: number; color: string; glow?: number }> = ({ geo, progress, color, glow = 0.45 }) => {
  const total = geo.index ? geo.index.count : 0;
  const count = Math.max(0, Math.floor((total * progress) / 6) * 6);
  geo.setDrawRange(0, count);
  return (
    <mesh geometry={geo} visible={count > 0}>
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={glow} roughness={0.3} clearcoat={0.8} envMapIntensity={0.6} />
    </mesh>
  );
};

// ---------------- Penghambat (molekul obat) ----------------
export const Blocker: React.FC<{ t: number; scale?: number; color?: string; kind?: 'oct' | 'dodeca' | 'ico' }> = ({ t, scale = 1, color = '#2FD6C4', kind = 'oct' }) => (
  <group scale={scale} rotation={[t * 1.2, t * 0.9, 0]}>
    <mesh>
      {kind === 'oct' && <octahedronGeometry args={[0.2, 0]} />}
      {kind === 'dodeca' && <dodecahedronGeometry args={[0.2, 0]} />}
      {kind === 'ico' && <icosahedronGeometry args={[0.2, 0]} />}
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.45} roughness={0.12} clearcoat={1} envMapIntensity={0.9} />
    </mesh>
    <mesh scale={1.7}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.14} depthWrite={false} />
    </mesh>
  </group>
);

export const Cross3D: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <group scale={scale}>
    {[Math.PI / 4, -Math.PI / 4].map((r, i) => (
      <mesh key={i} rotation={[0, 0, r]}>
        <boxGeometry args={[0.95, 0.15, 0.15]} />
        <meshPhysicalMaterial color="#FF3B30" emissive="#FF2A1F" emissiveIntensity={0.55} roughness={0.25} clearcoat={0.8} />
      </mesh>
    ))}
  </group>
);

export const Check3D: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <group scale={scale}>
    <mesh position={[-0.28, -0.12, 0]} rotation={[0, 0, -Math.PI / 4]}>
      <boxGeometry args={[0.5, 0.17, 0.17]} />
      <meshPhysicalMaterial color="#16A394" emissive="#16A394" emissiveIntensity={0.3} roughness={0.2} clearcoat={1} />
    </mesh>
    <mesh position={[0.15, 0.06, 0]} rotation={[0, 0, Math.PI / 4]}>
      <boxGeometry args={[0.95, 0.17, 0.17]} />
      <meshPhysicalMaterial color="#16A394" emissive="#16A394" emissiveIntensity={0.3} roughness={0.2} clearcoat={1} />
    </mesh>
  </group>
);

export const PauseIcon: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <group scale={scale}>
    {[-0.3, 0.3].map((x, i) => (
      <mesh key={i} position={[x, 0, 0]}>
        <capsuleGeometry args={[0.15, 0.7, 8, 16]} />
        <meshPhysicalMaterial color="#16A394" emissive="#16A394" emissiveIntensity={0.3} roughness={0.2} clearcoat={1} />
      </mesh>
    ))}
    <mesh>
      <torusGeometry args={[0.95, 0.05, 16, 64]} />
      <meshPhysicalMaterial color="#5FE3D1" emissive="#5FE3D1" emissiveIntensity={0.4} roughness={0.2} />
    </mesh>
  </group>
);

// ---------------- Sel ----------------
const RECEPTORS = fib(34).map((d) => ({ q: quatTo(d), p: d.clone().multiplyScalar(4.6) }));
const PORES = fib(16).map((d) => ({ q: new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), d), p: d.clone().multiplyScalar(1.5) }));
const MITO: { p: [number, number, number]; r: [number, number, number] }[] = [
  { p: [-3.1, -0.8, -2.4], r: [0.4, 0.2, 1.1] },
  { p: [3.2, -1.0, -2.2], r: [0.1, 0.5, 0.4] },
  { p: [-2.6, 2.4, -3.0], r: [0.7, 0.1, 2.0] },
];
const chromatin = (() => {
  const mk = (s: number) =>
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(Array.from({ length: 24 }, (_, i) => V(Math.sin(i * 0.8 + s) * 0.9, Math.cos(i * 0.55 + s * 2) * 0.8, Math.sin(i * 0.7 + s * 3) * 0.8))),
      90, 0.03, 6, false,
    );
  return [mk(0.3), mk(1.7), mk(3.1)];
})();

const dust = (() => {
  let s = 12345;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  return Array.from({ length: 70 }, () => {
    const th = r() * Math.PI * 2;
    const ph = Math.acos(2 * r() - 1);
    const rad = 1.2 + r() * 3.0;
    return { x: Math.sin(ph) * Math.cos(th) * rad, y: Math.cos(ph) * rad * 0.8, z: Math.sin(ph) * Math.sin(th) * rad, s: 0.02 + r() * 0.05, p: r() * 6, c: r() > 0.7 ? '#FFD7A8' : '#BFE3FF' };
  });
})();

export const CellSet: React.FC<{ t: number; op: number; receptors: number }> = ({ t, op, receptors }) => {
  if (op <= 0.01) return null;
  return (
    <group>
      <mesh>
        <sphereGeometry args={[4.6, 64, 64]} />
        <meshPhysicalMaterial color="#6FB1F2" transparent opacity={0.16 * op} roughness={0.12} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} envMapIntensity={0.6} />
      </mesh>
      <mesh scale={1.003}>
        <sphereGeometry args={[4.6, 28, 28]} />
        <meshBasicMaterial color="#9CCBFF" wireframe transparent opacity={0.07 * op} />
      </mesh>
      {receptors > 0.01 &&
        RECEPTORS.map((r, i) => (
          <group key={i} position={r.p} quaternion={r.q} scale={receptors}>
            <mesh position={[0, 0.17, 0]}>
              <cylinderGeometry args={[0.03, 0.04, 0.34, 8]} />
              <meshPhysicalMaterial color="#8FD0FF" roughness={0.3} clearcoat={0.5} />
            </mesh>
            {[-0.5, 0.5].map((a, j) => (
              <group key={j} position={[0, 0.34, 0]} rotation={[0, 0, a]}>
                <mesh position={[0, 0.1, 0]}>
                  <cylinderGeometry args={[0.022, 0.03, 0.2, 8]} />
                  <meshPhysicalMaterial color="#B9E3FF" roughness={0.3} />
                </mesh>
                <mesh position={[0, 0.22, 0]}>
                  <sphereGeometry args={[0.05, 10, 10]} />
                  <meshPhysicalMaterial color="#FFFFFF" roughness={0.2} clearcoat={1} />
                </mesh>
              </group>
            ))}
          </group>
        ))}
      {/* nukleus */}
      <group position={[NUC_X, NUC_Y, NUC_Z]}>
        <mesh>
          <sphereGeometry args={[1.5, 48, 48]} />
          <meshPhysicalMaterial color="#8FB9EE" transparent opacity={0.5 * op} roughness={0.25} clearcoat={1} envMapIntensity={0.6} depthWrite={false} />
        </mesh>
        {PORES.map((p, i) => (
          <mesh key={i} position={p.p} quaternion={p.q}>
            <torusGeometry args={[0.1, 0.03, 8, 16]} />
            <meshPhysicalMaterial color="#CFE3FA" transparent opacity={0.85 * op} roughness={0.3} />
          </mesh>
        ))}
        {chromatin.map((g, i) => (
          <mesh key={i} geometry={g}>
            <meshStandardMaterial color="#5F8FE0" transparent opacity={0.22 * op} roughness={0.5} depthWrite={false} />
          </mesh>
        ))}
      </group>
      {/* organel */}
      {MITO.map((m, i) => (
        <group key={i} position={m.p} rotation={m.r}>
          <mesh>
            <capsuleGeometry args={[0.2, 0.6, 6, 18]} />
            <meshPhysicalMaterial color="#B9786B" transparent opacity={0.5 * op} roughness={0.4} clearcoat={0.6} envMapIntensity={0.5} depthWrite={false} />
          </mesh>
          <mesh scale={[0.7, 0.8, 0.7]}>
            <capsuleGeometry args={[0.2, 0.6, 6, 18]} />
            <meshStandardMaterial color="#7E4A44" transparent opacity={0.35 * op} roughness={0.7} depthWrite={false} />
          </mesh>
        </group>
      ))}
      {dust.map((it, i) => (
        <mesh key={i} position={[it.x + Math.sin(t * 0.5 + it.p) * 0.15, it.y + Math.cos(t * 0.4 + it.p) * 0.15, it.z]}>
          <sphereGeometry args={[it.s, 8, 8]} />
          <meshBasicMaterial color={it.c} transparent opacity={0.4 * op} />
        </mesh>
      ))}
    </group>
  );
};

const NUC_X = 0.4;
const NUC_Y = -2.3;
const NUC_Z = -1.2;
