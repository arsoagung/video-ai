import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CUES } from './captions';
import { FONT, FPS } from './Board';

const OFFSET = 4.4; // detik audio asli yang menjadi t=0 pada tes ini

const ez = (t: number, a: number, b: number, e: (x: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e });
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const backOut = Easing.out(Easing.back(2.2));

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
  const approach = ez(t, 0, 3.6);
  const dolly = ez(t, 3.6, 12.2, Easing.inOut(Easing.sin));
  const ang = lerp(0.4, 0.0, approach) + Math.sin(t * 0.35) * 0.05;
  const dist = lerp(lerp(16, 13, approach), 7.4, dolly);
  const h = lerp(lerp(2.4, 1.4, approach), 0.9, dolly);
  camera.position.set(Math.sin(ang) * dist, h, Math.cos(ang) * dist);
  camera.lookAt(0, lerp(lerp(-1.1, -1.2, approach), -0.1, dolly), 0);
  camera.updateProjectionMatrix();
  return null;
};

const spikeDirs = (() => {
  const n = 34;
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = Math.PI * (3 - Math.sqrt(5)) * i;
    out.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r));
  }
  return out;
})();
const UP = new THREE.Vector3(0, 1, 0);
const spikeQuats = spikeDirs.map((d) => new THREE.Quaternion().setFromUnitVectors(UP, d));

const Virus: React.FC<{ t: number }> = ({ t }) => {
  // posisi: mendekat dari kiri-atas lalu masuk ke dalam sel
  const k = ez(t, 0.2, 3.4, Easing.inOut(Easing.cubic));
  const x = lerp(-4.4, 0, k);
  const y = lerp(3.6, 1.05, k) + Math.sin(t * 2.0) * 0.06 + Math.sin(k * Math.PI) * 0.9;
  const z = lerp(2.0, 0, k);
  const spikeS = 1 - ez(t, 4.2, 5.0, Easing.in(Easing.cubic));
  const bodyS = 1 - ez(t, 4.8, 6.0, Easing.in(Easing.cubic));
  const pulse = 1 + Math.sin(t * 4) * 0.015;
  return (
    <group position={[x, y, z]} rotation={[0.2, t * 0.7, Math.sin(t * 0.8) * 0.15]} scale={bodyS * pulse}>
      <mesh>
        <sphereGeometry args={[0.55, 48, 48]} />
        <meshPhysicalMaterial color="#FF6A4B" roughness={0.28} clearcoat={1} clearcoatRoughness={0.15} envMapIntensity={0.7} />
      </mesh>
      {spikeQuats.map((q, i) => {
        const w = 1 + Math.sin(t * 3 + i) * 0.08;
        return (
          <group key={i} quaternion={q} scale={spikeS * w}>
            <mesh position={[0, 0.72, 0]}>
              <cylinderGeometry args={[0.03, 0.04, 0.34, 10]} />
              <meshPhysicalMaterial color="#FF8E70" roughness={0.35} clearcoat={0.6} />
            </mesh>
            <mesh position={[0, 0.93, 0]}>
              <sphereGeometry args={[0.085, 16, 16]} />
              <meshPhysicalMaterial color="#FFD2C4" roughness={0.2} clearcoat={1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const rnaCurve = (() => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    pts.push(new THREE.Vector3(-1.9 + 3.8 * u, 1.15 + 0.2 * Math.sin(i * 0.95), 0.16 * Math.cos(i * 0.95)));
  }
  return new THREE.CatmullRomCurve3(pts);
})();
const rnaGeo = new THREE.TubeGeometry(rnaCurve, 160, 0.05, 10, false);

const helix = (phase: number) => {
  const pts: THREE.Vector3[] = [];
  const N = 120;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const a = u * Math.PI * 2 * 3.2 + phase;
    pts.push(new THREE.Vector3(-1.9 + 3.8 * u, 0.28 + 0.28 * Math.cos(a), 0.28 * Math.sin(a)));
  }
  return new THREE.CatmullRomCurve3(pts);
};
const dnaGeoA = new THREE.TubeGeometry(helix(0), 200, 0.055, 10, false);
const dnaGeoB = new THREE.TubeGeometry(helix(Math.PI), 200, 0.055, 10, false);
const rungs = Array.from({ length: 26 }, (_, i) => {
  const u = (i + 0.5) / 26;
  return { u, a: u * Math.PI * 2 * 3.2, x: -1.9 + 3.8 * u };
});

const Strand: React.FC<{ geo: THREE.BufferGeometry; progress: number; color: string; emissive: string; glow?: number }> = ({ geo, progress, color, emissive, glow = 0.35 }) => {
  const total = geo.index ? geo.index.count : 0;
  const count = Math.max(0, Math.floor((total * progress) / 6) * 6);
  geo.setDrawRange(0, count);
  return (
    <mesh geometry={geo} visible={count > 0}>
      <meshPhysicalMaterial color={color} emissive={emissive} emissiveIntensity={glow} roughness={0.3} clearcoat={0.8} envMapIntensity={0.6} />
    </mesh>
  );
};

const Enzyme: React.FC<{ t: number }> = ({ t }) => {
  const appear = ez(t, 6.1, 6.8, backOut);
  const u = ez(t, 6.8, 10.6, Easing.inOut(Easing.sin));
  const p = rnaCurve.getPoint(Math.min(0.999, u));
  const wob = 1 + Math.sin(t * 7) * 0.06;
  return (
    <group position={[p.x, p.y + 0.1 - 0.35 * 0.0, p.z]} scale={appear}>
      <mesh scale={[0.5 * wob, 0.34 / wob, 0.4 * wob]} position={[0, 0.0, 0]}>
        <icosahedronGeometry args={[1, 4]} />
        <meshPhysicalMaterial color="#22C3B0" roughness={0.18} clearcoat={1} emissive="#0B7F73" emissiveIntensity={0.25} />
      </mesh>
      <mesh scale={[0.3, 0.2, 0.26]} position={[0, -0.28, 0]}>
        <icosahedronGeometry args={[1, 3]} />
        <meshPhysicalMaterial color="#18A596" roughness={0.2} clearcoat={1} />
      </mesh>
    </group>
  );
};

const Particles: React.FC<{ t: number }> = ({ t }) => {
  const items = useMemo(() => {
    let s = 12345;
    const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    return Array.from({ length: 90 }, () => {
      const th = r() * Math.PI * 2;
      const ph = Math.acos(2 * r() - 1);
      const rad = 1.5 + r() * 2.4;
      return { x: Math.sin(ph) * Math.cos(th) * rad, y: Math.cos(ph) * rad * 0.8, z: Math.sin(ph) * Math.sin(th) * rad, s: 0.02 + r() * 0.05, p: r() * 6 };
    });
  }, []);
  return (
    <group>
      {items.map((it, i) => (
        <mesh key={i} position={[it.x + Math.sin(t * 0.5 + it.p) * 0.15, it.y + Math.cos(t * 0.4 + it.p) * 0.15, it.z]}>
          <sphereGeometry args={[it.s, 8, 8]} />
          <meshBasicMaterial color="#BFE3FF" transparent opacity={0.45} />
        </mesh>
      ))}
    </group>
  );
};

const World: React.FC<{ t: number }> = ({ t }) => {
  const rna = ez(t, 4.6, 6.4, Easing.out(Easing.cubic));
  const uEnz = ez(t, 6.8, 10.6, Easing.inOut(Easing.sin));
  const dna = Math.max(0, uEnz - 0.03);
  return (
    <>
      <Env />
      <Rig t={t} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <pointLight position={[-3, 2, 3]} intensity={30} color="#FFB48A" />
      <pointLight position={[3, -2, 2]} intensity={20} color="#7FD6FF" />

      {/* membran sel */}
      <mesh>
        <sphereGeometry args={[4.6, 64, 64]} />
        <meshPhysicalMaterial color="#6FB1F2" transparent opacity={0.16} roughness={0.12} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh scale={1.003}>
        <sphereGeometry args={[4.6, 28, 28]} />
        <meshBasicMaterial color="#9CCBFF" wireframe transparent opacity={0.08} />
      </mesh>
      {/* nukleus */}
      <mesh position={[0.4, -2.3, -1.2]}>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshPhysicalMaterial color="#8FB9EE" transparent opacity={0.55} roughness={0.25} clearcoat={1} />
      </mesh>

      <Particles t={t} />
      <Virus t={t} />
      <Strand geo={rnaGeo} progress={rna} color="#FF5A3C" emissive="#FF3B1F" glow={0.5} />
      <Enzyme t={t} />
      <Strand geo={dnaGeoA} progress={dna} color="#FFB020" emissive="#FF9A00" glow={0.4} />
      <Strand geo={dnaGeoB} progress={dna} color="#FFD66B" emissive="#FFC53D" glow={0.3} />
      {rungs.map((r, i) => {
        const s = ez(dna, r.u - 0.02, r.u + 0.02, Easing.out(Easing.cubic));
        return (
          <mesh key={i} position={[r.x, 0.28, 0]} rotation={[r.a, 0, 0]} scale={[s, s, s]}>
            <cylinderGeometry args={[0.022, 0.022, 0.56, 8]} />
            <meshPhysicalMaterial color="#FFE9A8" roughness={0.3} clearcoat={0.6} />
          </mesh>
        );
      })}
    </>
  );
};

const LABELS: { a: number; b: number; text: string; color: string }[] = [
  { a: 0.3, b: 3.5, text: 'Sel CD4', color: '#9CCBFF' },
  { a: 3.9, b: 6.4, text: 'RNA virus', color: '#FF8E70' },
  { a: 6.6, b: 8.8, text: 'reverse transcriptase', color: '#5FE3D1' },
  { a: 9.0, b: 12.2, text: 'DNA virus', color: '#FFC53D' },
];

export const Test3D: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cue = CUES.find((c) => t + OFFSET >= c.a - 0.05 && t + OFFSET < c.b);
  const label = LABELS.find((l) => t >= l.a && t < l.b);
  const lk = label ? Math.min(ez(t, label.a, label.a + 0.35, Easing.out(Easing.cubic)), 1 - ez(t, label.b - 0.3, label.b)) : 0;
  const ck = cue ? Math.min(1, (t + OFFSET - cue.a + 0.05) / 0.18) : 0;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#0A1F3D 0%,#123A60 55%,#17506F 100%)' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(700px 700px at 50% 42%, #3C86C455, transparent 70%)' }} />
      <ThreeCanvas width={1080} height={1920} camera={{ fov: 55, position: [0, 1, 16], near: 0.1, far: 80 }} gl={{ alpha: true, antialias: true }}>
        <World t={t} />
      </ThreeCanvas>
      {label && (
        <div style={{ position: 'absolute', top: 270, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 64, color: label.color, opacity: lk, transform: `translateY(${(1 - lk) * 16}px)` }}>
          {label.text}
        </div>
      )}
      {cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1330, height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.18, color: '#FFFFFF', textShadow: '0 4px 24px #00000066', opacity: ck, transform: `translateY(${(1 - ck) * 12}px)` }}>
          {cue.text}
        </div>
      )}
      <Audio src={staticFile('vo-test.mp3')} />
    </AbsoluteFill>
  );
};
