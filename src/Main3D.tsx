import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { AbsoluteFill, Audio, Easing, staticFile, useCurrentFrame } from 'remotion';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CUES } from './captions';
import { FONT, FPS } from './Board';
import {
  ez, lerp, win, V, out3, in3, sine, back, NUC, rnaCurve, rnaPoint, HELIX_C, helixPoint,
  virusFly, enzymeUC, enzymeUGH, enzymePosC, enzymePosGH, virionPos, virionAssembly, camAt, FOV, project,
} from './motion';
import { Virus, Enzyme, Pill, Helix, Strand, Blocker, Cross3D, Check3D, PauseIcon, CellSet } from './parts3d';

const mkTube = (curve: THREE.Curve<THREE.Vector3>, seg = 140, r = 0.05) => new THREE.TubeGeometry(curve, seg, r, 10, false);
const rnaGeoC = mkTube(rnaCurve, 160);
const rnaGeoG = mkTube(rnaCurve, 160);

const mRNA = (target: THREE.Vector3, seed: number) => {
  const a = V(NUC.x + (seed - 1) * 0.3, NUC.y + 1.45, NUC.z + 0.2);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24;
    const p = a.clone().lerp(target, u);
    p.x += Math.sin(i * 1.1 + seed) * 0.12 * Math.sin(u * Math.PI);
    p.z += Math.cos(i * 1.1 + seed) * 0.12 * Math.sin(u * Math.PI);
    pts.push(p);
  }
  return new THREE.CatmullRomCurve3(pts);
};
export const MR_T = [V(-1.9, 0.5, 0.4), V(1.9, 0.9, 0.3), V(0.3, 1.7, 0.6)];
const mrGeos = MR_T.map((t, i) => mkTube(mRNA(t, i), 90, 0.045));
const PROT_COL = ['#FFD166', '#6EE7B7', '#93C5FD', '#F9A8D4'];

const scribble = (seed: number) => {
  let s = seed;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const pts = Array.from({ length: 14 }, () => V((r() - 0.5) * 0.7, (r() - 0.5) * 0.7, (r() - 0.5) * 0.7));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 80, 0.022, 6, true);
};
const scribbles = [scribble(11), scribble(22), scribble(33)];

// kurva grafik viral load
const GX = (u: number) => -2.4 + 4.9 * u;
const GY = (u: number) => -2.2 + 4.6 * (0.08 + 0.92 * Math.exp(-4.4 * u));
const graphCurve = new THREE.CatmullRomCurve3(Array.from({ length: 50 }, (_, i) => V(GX(i / 49), GY(i / 49), 0)));
const graphGeo = mkTube(graphCurve, 200, 0.07);
const TH_Y = -2.2 + 4.6 * 0.1;

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
  const { p, l } = camAt(t);
  camera.position.copy(p);
  camera.lookAt(l);
  camera.updateProjectionMatrix();
  return null;
};

const Pop: React.FC<{ s: number; pos?: THREE.Vector3 | [number, number, number]; children: React.ReactNode }> = ({ s, pos, children }) => {
  if (s <= 0.002) return null;
  const p = pos instanceof THREE.Vector3 ? pos.toArray() : pos;
  return (
    <group position={p as [number, number, number]} scale={s}>
      {children}
    </group>
  );
};

// ------- posisi bersama (objek dan label) -------
export const HOST = { y: NUC.y, z: NUC.z };
const hostL = { x0: -0.8, x1: 0.0, y: HOST.y, z: HOST.z, r: 0.22, turns: 1 };
const hostGap = { x0: 0.0, x1: 0.8, y: HOST.y, z: HOST.z, r: 0.22, turns: 1 };
const hostR = { x0: 0.8, x1: 1.6, y: HOST.y, z: HOST.z, r: 0.22, turns: 1 };
const pieceOffD = (t: number) => V(0, (1 - ez(t, 18.6, 19.7, sine)) * 1.4, 0);
export const pieceOffI = (t: number) => {
  const a = V(-1.8, 1.2, 0);
  const n = V(-0.4, 0.4, 0);
  const b1 = V(-1.3, 0.9, 0);
  const b2 = V(-1.5, 1.0, 0);
  if (t < 43.6) return a;
  if (t < 44.4) return a.clone().lerp(n, ez(t, 43.6, 44.4, sine));
  if (t < 45.4) return n.clone().lerp(b1, ez(t, 44.4, 45.1, Easing.out(Easing.back(3))));
  if (t < 46.2) return b1.clone().lerp(n, ez(t, 45.4, 46.2, sine));
  return n.clone().lerp(b2, ez(t, 46.2, 46.9, Easing.out(Easing.back(3))));
};
export const integraseP = V(0.4, HOST.y + 0.7, HOST.z + 0.5);

const HOOK_V = V(0, 2.25, 0);
const HOOK_P = V(0, -1.55, 0);
const stagePill = V(0, 0.4, 0);

export const World: React.FC<{ t: number }> = ({ t }) => {
  const cellOp = Math.max(win(t, 4.3, 29.9, 0.6), win(t, 32.9, 48.5, 0.6));
  const rec = ez(t, 4.4, 5.2) * (1 - ez(t, 7.6, 8.7));
  const flash = ez(t, 19.6, 19.9, out3) * (1 - ez(t, 19.9, 21.0));

  // ---- hook (A)
  const hookS = win(t, 0.0, 4.4, 0.5);
  // ---- virus B-C
  const vS = win(t, 4.6, 10.7, 0.3) * (1 - ez(t, 9.4, 10.6, in3));
  const spikeS = 1 - ez(t, 8.6, 9.4, in3);
  const shellOp = 0.55 * (1 - ez(t, 9.0, 10.2));
  // ---- RT (C)
  const cFade = 1 - ez(t, 16.4, 17.1);
  const rnaP = ez(t, 9.0, 10.8, out3);
  const uC = enzymeUC(t);
  const dnaP = Math.max(0, uC - 0.03);
  const enzC = ez(t, 10.5, 11.2, back) * cFade;
  // ---- integrasi (D)
  const hostP = ez(t, 17.2, 18.3);
  const hostVis = Math.max(win(t, 17.0, 30.0, 0.5), win(t, 41.0, 48.5, 0.5));
  const pieceD = win(t, 17.6, 30.0, 0.5);
  const intD = ez(t, 18.0, 18.7, back) * (1 - ez(t, 21.0, 21.8));
  // ---- produksi (E)
  const eVis = win(t, 21.9, 29.9, 0.5);
  const virionS = ez(t, 26.4, 27.6, back) * (1 - ez(t, 29.4, 29.9));
  // ---- ARV pill (F)
  const fVis = win(t, 29.9, 33.1, 0.45);
  const pillS = fVis * (1 - ez(t, 31.4, 32.0, in3));
  const orbR = lerp(0.5, 2.0, ez(t, 31.5, 32.7, out3));
  const orbS = ez(t, 31.5, 32.1, back) * (1 - ez(t, 32.7, 33.1));
  // ---- GH
  const ghVis = win(t, 33.1, 41.4, 0.5);
  const enzGH = ez(t, 33.4, 34.0, back) * (1 - ez(t, 41.0, 41.5));
  const ePGH = enzymePosGH(t);
  const dnaGH = Math.max(0, enzymeUGH(t) - 0.03);
  const dock1 = ez(t, 34.6, 35.8, sine);
  const dock2 = ez(t, 35.2, 36.4, sine);
  const enzColGH = t < 36.2 ? '#22C3B0' : '#7E9BA8';
  const shake = ez(t, 39.3, 39.5) * (1 - ez(t, 40.0, 40.4));
  const sparks = ez(t, 39.3, 40.1, out3);
  // ---- I
  const iVis = win(t, 41.5, 48.4, 0.4);
  const intI = ez(t, 42.0, 42.7, back) * (1 - ez(t, 48.0, 48.5));
  const dockI = ez(t, 42.6, 43.5, sine);
  // ---- J
  const jVis = win(t, 48.6, 56.5, 0.5);
  const dockJ = ez(t, 50.4, 51.6, sine);
  // ---- K
  const kVis = 0;
  const kConv = ez(t, 59.3, 60.2, sine);
  const kPill = ez(t, 60.0, 61.0, back);
  // ---- L
  const lVis = 0;
  const lDraw = ez(t, 64.4, 68.0, Easing.inOut(Easing.sin));
  // ---- M/N
  const mVis = 0;
  const nVis = 0;
  // ---- O
  const oVis = 0;

  const pulse = 1 + Math.sin(t * 1.3) * 0.0;
  const proteins = Array.from({ length: 16 }, (_, i) => {
    const j = i % 3;
    const d = 23.6 + i * 0.16;
    const e = ez(t, d, d + 2.2, sine);
    const from = MR_T[j];
    const p = from.clone().lerp(virionAssembly, e);
    const sw = (1 - e) * 0.35 + Math.sin(i * 1.7) * 0.15 * e;
    p.x += Math.sin(t * 2 + i) * sw;
    p.y += Math.cos(t * 2.3 + i) * sw;
    const s = ez(t, d - 0.2, d + 0.2) * (1 - ez(t, 26.6, 27.4));
    return { p, s, c: PROT_COL[i % 4], r: 0.09 + (i % 3) * 0.025 };
  });

  return (
    <>
      <Env />
      <Rig t={t} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <pointLight position={[-3, 2, 3]} intensity={30} color="#FFB48A" />
      <pointLight position={[3, -2, 2]} intensity={20} color="#7FD6FF" />
      {flash > 0.01 && <pointLight position={[0.4, HOST.y, HOST.z + 0.8]} intensity={80 * flash} color="#FFD27A" />}

      <CellSet t={t} op={cellOp} receptors={rec} />

      {/* A: hook */}
      <Pop s={hookS} pos={V(HOOK_V.x, HOOK_V.y + Math.sin(t * 1.6) * 0.1, 0)}>
        <Virus t={t} scale={1.7} />
      </Pop>
      <Pop s={hookS} pos={V(HOOK_P.x, HOOK_P.y + Math.cos(t * 1.4) * 0.1, 0)}>
        <Pill t={t} scale={1.5} rot={0.6} />
      </Pop>

      {/* B-C: virus -> RNA -> enzim -> DNA */}
      <Pop s={vS} pos={virusFly(t)}>
        <Virus t={t} spikeS={spikeS} shellOp={shellOp} capsid={t < 10.3} />
      </Pop>
      <group scale={cFade * pulse}>
        <Strand geo={rnaGeoC} progress={rnaP} color="#FF5A3C" />
        <Helix h={HELIX_C} progress={dnaP} c1="#FFB020" c2="#FFD66B" />
      </group>
      <Pop s={enzC} pos={enzymePosC(t)}>
        <Enzyme t={t} />
      </Pop>

      {/* D: integrasi */}
      <group visible={hostVis > 0.01}>
        <group scale={hostVis}>
          <Helix h={hostL} progress={hostP} c1="#4C86E8" c2="#8FB4F2" tube={0.05} />
          <Helix h={hostR} progress={hostP} c1="#4C86E8" c2="#8FB4F2" tube={0.05} />
        </group>
      </group>
      <Pop s={pieceD} pos={pieceOffD(t)}>
        <Helix h={hostGap} progress={ez(t, 18.3, 18.8)} c1="#FFB020" c2="#FFD66B" tube={0.05} />
      </Pop>
      <Pop s={iVis > 0.01 ? iVis : 0} pos={pieceOffI(t)}>
        <Helix h={hostGap} progress={1} c1="#FFB020" c2="#FFD66B" tube={0.05} />
      </Pop>
      <Pop s={intD} pos={integraseP}>
        <Enzyme t={t} color="#9B7BFF" scale={0.9} />
      </Pop>
      {flash > 0.01 && (
        <mesh position={[0.4, HOST.y, HOST.z]} scale={0.3 + (1 - flash) * 2.6}>
          <sphereGeometry args={[0.6, 24, 24]} />
          <meshBasicMaterial color="#FFE08A" transparent opacity={flash * 0.45} depthWrite={false} />
        </mesh>
      )}

      {/* E: produksi virus baru */}
      {mrGeos.map((g, i) => (
        <group key={i} visible={eVis > 0.01} scale={eVis}>
          <Strand geo={g} progress={ez(t, 22.0 + i * 0.5, 24.0 + i * 0.5, out3)} color="#FF5A3C" glow={0.5} />
        </group>
      ))}
      {proteins.map((p, i) => (
        <Pop key={i} s={p.s} pos={p.p}>
          <mesh>
            <icosahedronGeometry args={[p.r, 2]} />
            <meshPhysicalMaterial color={p.c} roughness={0.25} clearcoat={1} emissive={p.c} emissiveIntensity={0.15} />
          </mesh>
        </Pop>
      ))}
      <Pop s={virionS} pos={virionPos(t)}>
        <Virus t={t} scale={1} color="#C7869E" spikeColor="#D7A0B4" capsid={false} />
      </Pop>
      {ez(t, 27.8, 28.4) > 0.01 && virionS > 0.01 && (
        <mesh position={virionPos(t).toArray()} scale={0.95 * ez(t, 27.8, 28.6)}>
          <sphereGeometry args={[0.8, 24, 24]} />
          <meshPhysicalMaterial color="#6FB1F2" transparent opacity={0.17 * (1 - ez(t, 29.0, 29.5))} roughness={0.15} clearcoat={1} depthWrite={false} />
        </mesh>
      )}

      {/* F: pil ARV */}
      <Pop s={pillS} pos={V(0, stagePill.y + Math.sin(t * 1.5) * 0.12, 0)}>
        <Pill t={t} scale={2.0} rot={0.4} />
      </Pop>
      {[0, 1, 2].map((i) => {
        const a = t * 1.1 + (i * Math.PI * 2) / 3;
        return (
          <Pop key={i} s={orbS} pos={V(Math.cos(a) * orbR, stagePill.y + Math.sin(a * 1.3) * 0.5, Math.sin(a) * orbR * 0.6)}>
            <Blocker t={t} scale={1.5} color={['#2FD6C4', '#9B7BFF', '#4C9BFF'][i]} kind={(['oct', 'dodeca', 'ico'] as const)[i]} />
          </Pop>
        );
      })}

      {/* G-H: NRTI & NNRTI menghambat RT */}
      <group visible={ghVis > 0.01} scale={ghVis}>
        <Strand geo={rnaGeoG} progress={1} color="#FF5A3C" />
        <Helix h={HELIX_C} progress={dnaGH} c1="#FFB020" c2="#FFD66B" />
        <Helix h={HELIX_C} progress={t > 39.3 ? 1 : 0} c1="#FFB020" c2="#FFD66B" ghost />
      </group>
      <Pop s={enzGH} pos={ePGH}>
        <Enzyme t={t} color={enzColGH} shake={shake} />
      </Pop>
      <Pop s={enzGH * ez(t, 34.4, 34.8)} pos={V(lerp(-3, ePGH.x - 0.4, dock1), lerp(2.6, ePGH.y + 0.32, dock1), lerp(1.2, ePGH.z + 0.1, dock1))}>
        <Blocker t={t} scale={1.3} color="#2FD6C4" kind="oct" />
      </Pop>
      <Pop s={enzGH * ez(t, 35.0, 35.4)} pos={V(lerp(3, ePGH.x + 0.4, dock2), lerp(2.6, ePGH.y + 0.32, dock2), lerp(1.2, ePGH.z + 0.1, dock2))}>
        <Blocker t={t} scale={1.5} color="#9B7BFF" kind="dodeca" />
      </Pop>
      <Pop s={ez(t, 36.8, 37.4, back) * enzGH} pos={V(ePGH.x, ePGH.y + 1.0, ePGH.z)}>
        <Cross3D scale={0.9} />
      </Pop>
      {sparks > 0.01 &&
        Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const o = helixPoint(HELIX_C, 0.15);
          return (
            <mesh key={i} position={[o.x + Math.cos(a) * sparks * 0.7, o.y + Math.sin(a) * sparks * 0.7, o.z + Math.sin(a * 2) * 0.3]} scale={1 - ez(t, 39.6, 40.2)}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#FF5A3C" />
            </mesh>
          );
        })}

      {/* I: integrase inhibitor */}
      <Pop s={intI} pos={integraseP}>
        <Enzyme t={t} color={t < 43.5 ? '#9B7BFF' : '#8E88A8'} scale={0.9} />
      </Pop>
      <Pop s={intI * ez(t, 42.4, 42.8)} pos={V(lerp(2.6, integraseP.x + 0.38, dockI), lerp(-0.2, integraseP.y + 0.12, dockI), lerp(-0.2, integraseP.z + 0.1, dockI))}>
        <Blocker t={t} scale={1.5} color="#FF9F43" kind="ico" />
      </Pop>
      <Pop s={ez(t, 45.0, 45.6, back) * intI} pos={V(0.4, HOST.y + 1.2, HOST.z + 0.6)}>
        <Cross3D scale={0.75} />
      </Pop>

      {/* J: protease inhibitor */}
      <Pop s={jVis} pos={V(0, 0.4 + Math.sin(t * 1.4) * 0.08, 0)}>
        <Virus t={t} scale={2.0} color="#8E9AAF" spikeColor="#AAB4C6" shellOp={0.42} capsid={false} spin={0.5} />
        {scribbles.map((g, i) => (
          <mesh key={i} geometry={g} rotation={[t * 0.3 + i, t * 0.2, i]} scale={1.3}>
            <meshStandardMaterial color="#C98A5A" roughness={0.5} />
          </mesh>
        ))}
      </Pop>
      <Pop s={jVis} pos={V(1.45, 1.75, 0.7)}>
        <Enzyme t={t} color="#4C9BFF" scale={0.8} />
      </Pop>
      <Pop s={jVis * ez(t, 50.2, 50.6)} pos={V(lerp(-2.4, 1.1, dockJ), lerp(2.8, 2.15, dockJ), lerp(1.2, 0.8, dockJ))}>
        <Blocker t={t} scale={1.5} color="#2FD6C4" kind="dodeca" />
      </Pop>
      <Pop s={ez(t, 52.5, 53.1, back) * jVis} pos={V(1.2, 2.95, 0.7)}>
        <Cross3D scale={0.8} />
      </Pop>

      {/* K: kombinasi */}
      {[0, 1, 2].map((i) => {
        const a = t * 1.0 + (i * Math.PI * 2) / 3;
        const rr = lerp(2.3, 0.0, kConv);
        return (
          <Pop key={i} s={kVis * (1 - kConv * 0.95)} pos={V(Math.cos(a) * rr, 0.2 + Math.sin(a * 1.2) * 0.6 * (1 - kConv), Math.sin(a) * rr * 0.7)}>
            <Blocker t={t} scale={2.0} color={['#2FD6C4', '#9B7BFF', '#4C9BFF'][i]} kind={(['oct', 'dodeca', 'ico'] as const)[i]} />
          </Pop>
        );
      })}
      <Pop s={kPill * kVis} pos={V(0, 0.2 + Math.sin(t * 1.5) * 0.1, 0)}>
        <Pill t={t} scale={2.0} rot={0.4} />
      </Pop>

      {/* L: grafik viral load */}
      <group visible={lVis > 0.01} scale={lVis}>
        <gridHelper args={[9, 18, '#5C86B8', '#2B4B75']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.2, -0.3]} />
        <mesh position={[-2.7, 0.3, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 5.2, 8]} />
          <meshStandardMaterial color="#DCE6F2" />
        </mesh>
        <mesh position={[0.1, -2.3, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 5.6, 8]} />
          <meshStandardMaterial color="#DCE6F2" />
        </mesh>
        {Array.from({ length: 24 }, (_, i) => (
          <mesh key={i} position={[-2.5 + i * 0.22, TH_Y, 0]}>
            <boxGeometry args={[0.12, 0.04, 0.04]} />
            <meshBasicMaterial color="#9AA8BA" />
          </mesh>
        ))}
        <Strand geo={graphGeo} progress={lDraw} color="#FF5A3C" glow={0.5} />
        {lDraw > 0.01 && (
          <mesh position={graphCurve.getPointAt(Math.min(0.999, lDraw)).toArray()}>
            <sphereGeometry args={[0.16, 20, 20]} />
            <meshPhysicalMaterial color="#FFB020" emissive="#FF9A00" emissiveIntensity={0.6} clearcoat={1} />
          </mesh>
        )}
      </group>

      {/* M-N: masih ada, tapi ditekan */}
      {[V(-1.7, 0.7, 0.3), V(1.8, -0.2, 0.2), V(-0.5, 2.0, -0.3), V(0.7, -0.7, 0.8)].map((p, i) => (
        <Pop key={i} s={mVis * ez(t, 69.3 + i * 0.12, 69.8 + i * 0.12, back)} pos={V(p.x, p.y + Math.sin(t * 0.8 + i) * 0.06, p.z)}>
          <Virus t={t} scale={0.65} color="#8E9AAF" spikeColor="#AAB4C6" shellOp={0.5} capsid={false} spin={0.15} />
        </Pop>
      ))}
      <Pop s={nVis * ez(t, 71.9, 72.5, back)} pos={V(0, 0.6, 1.8)}>
        <PauseIcon scale={1.6} />
      </Pop>

      {/* O: penutup */}
      <Pop s={oVis} pos={V(0, 1.15 + Math.sin(t * 1.4) * 0.1, 0)}>
        <Pill t={t} scale={2.2} rot={0.45} />
      </Pop>
      <Pop s={oVis * ez(t, 76.2, 76.9, back)} pos={V(0, -1.35, 0.6)}>
        <Check3D scale={1.5} />
      </Pop>
    </>
  );
};

// ---------------- label dengan garis penunjuk ----------------
type Lbl = { a: number; b: number; text: string; color: string; anchor: (t: number) => THREE.Vector3; side: 'L' | 'R'; y: number };
const TEAL = '#5FE3D1';
const RED = '#FF8E70';
const BLU = '#9CCBFF';
const YEL = '#FFC53D';
const VIO = '#B7A0FF';
const WHITE = '#E8F0FA';
const memb = (x: number, y: number, z: number) => V(x, y, z).normalize().multiplyScalar(4.6);
const LABELS: Lbl[] = [
  { a: 0.6, b: 4.0, text: 'HIV', color: RED, anchor: () => V(0.9, 2.5, 0), side: 'L', y: 330 },
  { a: 1.5, b: 4.0, text: 'ARV', color: TEAL, anchor: () => V(0.9, -1.4, 0), side: 'R', y: 1080 },
  { a: 5.0, b: 7.6, text: 'Sel CD4', color: BLU, anchor: () => memb(0.55, 0.65, 0.5), side: 'R', y: 330 },
  { a: 5.6, b: 7.6, text: 'reseptor CD4', color: WHITE, anchor: () => memb(-0.85, 0.05, 0.5), side: 'L', y: 700 },
  { a: 6.3, b: 7.8, text: 'HIV', color: RED, anchor: virusFly, side: 'L', y: 980 },
  { a: 9.3, b: 11.2, text: 'RNA virus', color: RED, anchor: () => rnaPoint(0.9), side: 'R', y: 330 },
  { a: 11.5, b: 15.5, text: 'reverse transcriptase', color: TEAL, anchor: enzymePosC, side: 'L', y: 330 },
  { a: 12.6, b: 16.2, text: 'DNA virus', color: YEL, anchor: () => helixPoint(HELIX_C, 0.1), side: 'R', y: 900 },
  { a: 17.6, b: 21.3, text: 'DNA sel', color: BLU, anchor: () => V(-0.5, HOST.y + 0.2, HOST.z), side: 'L', y: 1100 },
  { a: 19.8, b: 21.3, text: 'DNA virus menyatu', color: YEL, anchor: () => V(0.4, HOST.y + 0.2, HOST.z), side: 'R', y: 330 },
  { a: 18.4, b: 20.6, text: 'integrase', color: VIO, anchor: () => integraseP, side: 'L', y: 330 },
  { a: 22.6, b: 25.5, text: 'RNA baru', color: RED, anchor: () => MR_T[1].clone().lerp(V(NUC.x, NUC.y + 1.45, NUC.z), 0.4), side: 'L', y: 330 },
  { a: 24.6, b: 28.0, text: 'protein baru', color: YEL, anchor: () => V(2.3, 1.0, 0.4), side: 'R', y: 1020 },
  { a: 27.8, b: 29.6, text: 'virus baru', color: RED, anchor: virionPos, side: 'R', y: 330 },
  { a: 30.4, b: 32.8, text: 'obat ARV', color: TEAL, anchor: () => V(0.5, 0.9, 0), side: 'L', y: 330 },
  { a: 34.0, b: 38.0, text: 'NRTI', color: TEAL, anchor: () => enzymePosGH(35.8).add(V(-0.4, 0.3, 0)), side: 'L', y: 330 },
  { a: 35.0, b: 38.0, text: 'NNRTI', color: VIO, anchor: () => enzymePosGH(35.8).add(V(0.4, 0.3, 0)), side: 'R', y: 330 },
  { a: 37.0, b: 41.0, text: 'RT terhambat', color: WHITE, anchor: enzymePosGH, side: 'L', y: 1000 },
  { a: 39.6, b: 41.0, text: 'DNA terhenti', color: RED, anchor: () => helixPoint(HELIX_C, 0.15), side: 'R', y: 900 },
  { a: 42.4, b: 46.0, text: 'integrase inhibitor', color: YEL, anchor: () => integraseP.clone().add(V(0.38, 0.12, 0.1)), side: 'R', y: 330 },
  { a: 42.2, b: 48.0, text: 'integrase', color: VIO, anchor: () => integraseP, side: 'L', y: 330 },
  { a: 44.0, b: 47.8, text: 'DNA virus ditolak', color: RED, anchor: () => pieceOffI(45.0).add(V(0.4, HOST.y, HOST.z)), side: 'L', y: 1100 },
  { a: 49.6, b: 52.2, text: 'virus baru', color: WHITE, anchor: () => V(-0.5, 0.9, 0), side: 'L', y: 330 },
  { a: 51.6, b: 56.2, text: 'protease inhibitor', color: TEAL, anchor: () => V(1.1, 2.15, 0.8), side: 'R', y: 330 },
  { a: 53.4, b: 56.2, text: 'belum matang', color: RED, anchor: () => V(-0.4, -0.2, 0), side: 'L', y: 980 },
  { a: 57.2, b: 59.4, text: 'NRTI / NNRTI', color: TEAL, anchor: () => V(2.0, 0.6, 0), side: 'R', y: 330 },
  { a: 57.6, b: 59.4, text: 'integrase inhibitor', color: VIO, anchor: () => V(-1.5, 0.8, 0), side: 'L', y: 1000 },
  { a: 58.0, b: 59.4, text: 'protease inhibitor', color: BLU, anchor: () => V(0.2, 1.0, 1.1), side: 'L', y: 330 },
  { a: 60.6, b: 61.8, text: 'kombinasi ARV', color: TEAL, anchor: () => V(0.6, 0.5, 0), side: 'R', y: 1020 },
  { a: 62.8, b: 68.6, text: 'jumlah virus', color: RED, anchor: () => V(-2.4, 2.4, 0), side: 'R', y: 330 },
  { a: 64.0, b: 68.6, text: 'tidak terdeteksi', color: WHITE, anchor: () => V(2.3, TH_Y, 0), side: 'R', y: 1080 },
  { a: 69.5, b: 71.5, text: 'masih ada', color: RED, anchor: () => V(-1.7, 0.7, 0.3), side: 'L', y: 330 },
  { a: 72.3, b: 74.2, text: 'replikasi ditekan', color: TEAL, anchor: () => V(0, 0.6, 1.8), side: 'R', y: 330 },
];

const Callouts: React.FC<{ t: number }> = ({ t }) => (
  <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
    {LABELS.map((l, i) => {
      if (t < l.a || t > l.b) return null;
      const k = Math.min(ez(t, l.a, l.a + 0.4, out3), 1 - ez(t, l.b - 0.3, l.b));
      const [ax, ay] = project(t, l.anchor(t));
      const size = 40;
      const w = l.text.length * size * 0.56;
      const tx = l.side === 'L' ? 60 : 1020;
      const ex = l.side === 'L' ? tx + w + 14 : tx - w - 14;
      const ey = l.y - size * 0.35;
      return (
        <g key={i} opacity={k}>
          <line x1={ex} y1={ey} x2={ax} y2={ay} stroke={l.color} strokeWidth={3} strokeLinecap="round" opacity={0.9} />
          <circle cx={ax} cy={ay} r={8} fill={l.color} />
          <circle cx={ax} cy={ay} r={15} fill={l.color} opacity={0.25} />
          <text x={tx} y={l.y} textAnchor={l.side === 'L' ? 'start' : 'end'} fontFamily={FONT} fontWeight={800} fontSize={size} fill={l.color} style={{ paintOrder: 'stroke' }} stroke="#08182E" strokeWidth={6} strokeOpacity={0.5}>
            {l.text}
          </text>
        </g>
      );
    })}
  </svg>
);

export const Main3D: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cue = CUES.find((c) => t >= c.a - 0.05 && t < c.b);
  const ck = cue ? Math.min(1, (t - cue.a + 0.05) / 0.18) : 0;
  const endK = ez(t, 76.8, 77.6, out3);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#0A1F3D 0%,#123A60 55%,#17506F 100%)' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(760px 760px at 50% 40%, #3C86C455, transparent 70%)' }} />
      <ThreeCanvas width={1080} height={1920} camera={{ fov: FOV, position: [0, 1, 16], near: 0.1, far: 80 }} gl={{ alpha: true, antialias: true }}>
        <World t={t} />
      </ThreeCanvas>
      <Callouts t={t} />
      {endK > 0 && (
        <div style={{ position: 'absolute', top: 1285, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 84, color: '#6CF0DC', opacity: endK, transform: `translateY(${(1 - endK) * 18}px)`, textShadow: '0 6px 30px #00000066' }}>
          Minum ARV teratur
        </div>
      )}
      {cue && (
        <div style={{ position: 'absolute', left: 70, width: 940, top: 1462, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 42, lineHeight: 1.2, color: '#FFFFFF', textShadow: '0 3px 16px #000000AA', opacity: ck, transform: `translateY(${(1 - ck) * 10}px)` }}>
          {cue.text}
        </div>
      )}
      <Audio src={staticFile('vo.mp3')} />
    </AbsoluteFill>
  );
};

// Lapisan 3D saja (tanpa label, subtitle, atau audio) untuk komposit hibrida
export const Plate3D: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#0A1F3D 0%,#123A60 55%,#17506F 100%)' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(760px 760px at 50% 40%, #3C86C455, transparent 70%)' }} />
      {t < 57.0 && (
        <ThreeCanvas width={1080} height={1920} camera={{ fov: FOV, position: [0, 1, 16], near: 0.1, far: 80 }} gl={{ alpha: true, antialias: true }}>
          <World t={t} />
        </ThreeCanvas>
      )}
    </AbsoluteFill>
  );
};
