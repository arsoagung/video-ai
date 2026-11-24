import { S1E5Full, S1E5_FRAMES } from './s1e5/S1E5';
import { S1E7Full, S1E7_FRAMES } from './s1e7/S1E7';
import { S1E8Full, S1E8_FRAMES } from './s1e8/S1E8';
import { S1E9Full, S1E9_FRAMES } from './s1e9/S1E9';
import { S1E10Full, S1E10_FRAMES } from './s1e10/S1E10';
import { S1E11Full, S1E11_FRAMES } from './s1e11/S1E11';
import { S1E4Full, S1E4_FRAMES } from './s1e4/S1E4';
import { S1E6Full, S1E6_FRAMES } from './s1e6/S1E6';
import { S2E1Full, S2E1_FRAMES } from './s2e1/S2E1';
import { S2E1AltFull, S2E1ALT_FRAMES } from './s2e1alt/S2E1Alt';
import { S2E2Full, S2E2_FRAMES } from './s2e2/S2E2';
import { S2E2AltFull, S2E2ALT_FRAMES } from './s2e2alt/S2E2Alt';
import { S2E3Full, S2E3_FRAMES } from './s2e3/S2E3';
import { S2E4Full, S2E4_FRAMES } from './s2e4/S2E4';
import { S2E4AltFull, S2E4ALT_FRAMES } from './s2e4alt/S2E4Alt';
import { S2E5Full, S2E5_FRAMES } from './s2e5/S2E5';
import { S2E6Full, S2E6_FRAMES } from './s2e6/S2E6';
import { S2E6AltFull, S2E6ALT_FRAMES } from './s2e6alt/S2E6Alt';
import { S2E7Full, S2E7_FRAMES } from './s2e7/S2E7';
import { S2E7AltFull, S2E7ALT_FRAMES } from './s2e7alt/S2E7Alt';
import { S2E8Full, S2E8_FRAMES } from './s2e8/S2E8';
import { S2E8AltFull, S2E8ALT_FRAMES } from './s2e8alt/S2E8Alt';
import { S3E2Full } from './s3e2/S3E2';
import { S2E9Full } from './s2e9/S2E9';
import { EP_DUR as S2E9_DUR } from './s2e9/timeline';
import { S2E10Full } from './s2e10/S2E10';
import { EP_DUR as S2E10_DUR } from './s2e10/timeline';
import { EP_DUR as S3E2_DUR } from './s3e2/timeline';
import React from 'react';
import { AbsoluteFill, Audio, Composition, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { Board, FONT, FPS, INK, PAPER } from './Board';
import { ITEMS } from './items';
import { CUES } from './captions';
import { Test3D } from './Scene3D';
import { Main3D, Plate3D } from './Main3D';
import { Overlay } from './Overlay';
import { Plate2 } from './ep2/World2';
import { Overlay2, Ep2Full } from './ep2/Overlay2';
import { Ep3Full } from './ep3/Ep3';
import { Ep5Full } from './ep5/Ep5';
import { Ep3ArvFull } from './ep3arv/Ep3Arv';
import { ThumbHivAids, ThumbCd4, ThumbReplikasi, ThumbViralLoad, ThumbArv, ThumbApaCd4, ThumbS1E5, ThumbS1E7, ThumbS1E8, ThumbS1E9, ThumbS1E10, ThumbS1E11, ThumbS2E1, ThumbS2E2, ThumbS2E3, ThumbS2E4, ThumbS2E5, ThumbS2E6, ThumbS2E7, ThumbS2E8, ThumbS2E9, ThumbS2E10, THUMB_W, THUMB_H } from './thumb/Thumb';

const useFonts = () => {
  const [handle] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    const defs: [number, string][] = [
      [400, 'plus-jakarta-sans-latin-400-normal.woff2'],
      [600, 'plus-jakarta-sans-latin-600-normal.woff2'],
      [800, 'plus-jakarta-sans-latin-800-normal.woff2'],
    ];
    Promise.all(
      defs.map(async ([w, file]) => {
        const ff = new FontFace('Plus Jakarta Sans', `url(${staticFile('fonts/' + file)})`, { weight: String(w) });
        await ff.load();
        document.fonts.add(ff);
      }),
    )
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cue = CUES.find((c) => t >= c.a - 0.05 && t < c.b);
  if (!cue) return null;
  const k = Math.min(1, (t - cue.a + 0.05) / 0.18);
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        width: 940,
        top: 1330,
        height: 230,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 64,
        lineHeight: 1.18,
        color: INK,
        opacity: k,
        transform: `translateY(${(1 - k) * 12}px)`,
      }}
    >
      {cue.text}
    </div>
  );
};

const Main: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <AbsoluteFill style={{ background: 'radial-gradient(900px 900px at 50% 40%, #FFFFFF55, #00000008)' }} />
      <Board items={ITEMS} />
      <Captions />
      <Audio src={staticFile('vo.mp3')} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ARV" component={Main} durationInFrames={2400} fps={FPS} width={1080} height={1920} />
    <Composition id="Plate3D" component={Plate3D} durationInFrames={2400} fps={FPS} width={1080} height={1920} />
    <Composition id="Overlay" component={Overlay} durationInFrames={2400} fps={FPS} width={1080} height={1920} />
    <Composition id="ARV3D" component={Main3D} durationInFrames={2400} fps={FPS} width={1080} height={1920} />
    <Composition id="Test3D" component={Test3D} durationInFrames={366} fps={FPS} width={1080} height={1920} />
    <Composition id="Plate2" component={Plate2} durationInFrames={2460} fps={FPS} width={1080} height={1920} />
    <Composition id="Overlay2" component={Overlay2} durationInFrames={2460} fps={FPS} width={1080} height={1920} />
    <Composition id="Ep2Full" component={Ep2Full} durationInFrames={2460} fps={FPS} width={1080} height={1920} />
    <Composition id="Ep3Full" component={Ep3Full} durationInFrames={3591} fps={FPS} width={1080} height={1920} />
    <Composition id="Ep3ArvFull" component={Ep3ArvFull} durationInFrames={3339} fps={FPS} width={1080} height={1920} />
    <Composition id="S1E5Full" component={S1E5Full} durationInFrames={S1E5_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="S1E7Full" component={S1E7Full} durationInFrames={S1E7_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="S1E8Full" component={S1E8Full} durationInFrames={S1E8_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="S1E9Full" component={S1E9Full} durationInFrames={S1E9_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="S1E6Full" component={S1E6Full} durationInFrames={S1E6_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="S1E4Full" component={S1E4Full} durationInFrames={S1E4_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="S3E2Full" component={S3E2Full} durationInFrames={Math.ceil(S3E2_DUR * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="S2E9Full" component={S2E9Full} durationInFrames={Math.ceil(S2E9_DUR * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="S2E10Full" component={S2E10Full} durationInFrames={Math.ceil(S2E10_DUR * FPS)} fps={FPS} width={1080} height={1920} />
    <Composition id="S1E10Full" component={S1E10Full} durationInFrames={S1E10_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="S1E11Full" component={S1E11Full} durationInFrames={S1E11_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="Ep5Full" component={Ep5Full} durationInFrames={2502} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbHivAids" component={ThumbHivAids} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbCd4" component={ThumbCd4} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbReplikasi" component={ThumbReplikasi} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbArv" component={ThumbArv} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbApaCd4" component={ThumbApaCd4} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbS1E5" component={ThumbS1E5} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbS1E7" component={ThumbS1E7} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbS1E8" component={ThumbS1E8} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbS1E9" component={ThumbS1E9} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbS1E10" component={ThumbS1E10} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbS1E11" component={ThumbS1E11} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="S2E1Full" component={S2E1Full} durationInFrames={S2E1_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="S2E1AltFull" component={S2E1AltFull} durationInFrames={S2E1ALT_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbS2E1" component={ThumbS2E1} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="S2E2AltFull" component={S2E2AltFull} durationInFrames={S2E2ALT_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="S2E2Full" component={S2E2Full} durationInFrames={S2E2_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbS2E2" component={ThumbS2E2} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="S2E3Full" component={S2E3Full} durationInFrames={S2E3_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbS2E3" component={ThumbS2E3} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="S2E4AltFull" component={S2E4AltFull} durationInFrames={S2E4ALT_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="S2E4Full" component={S2E4Full} durationInFrames={S2E4_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbS2E4" component={ThumbS2E4} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="S2E5Full" component={S2E5Full} durationInFrames={S2E5_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbS2E5" component={ThumbS2E5} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="S2E6Full" component={S2E6Full} durationInFrames={S2E6_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="S2E6AltFull" component={S2E6AltFull} durationInFrames={S2E6ALT_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbS2E6" component={ThumbS2E6} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="S2E7Full" component={S2E7Full} durationInFrames={S2E7_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="S2E8Full" component={S2E8Full} durationInFrames={S2E8_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="S2E7AltFull" component={S2E7AltFull} durationInFrames={S2E7ALT_FRAMES} fps={FPS} width={1080} height={1920} />

    <Composition id="S2E8AltFull" component={S2E8AltFull} durationInFrames={S2E8ALT_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbS2E7" component={ThumbS2E7} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbS2E8" component={ThumbS2E8} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbS2E9" component={ThumbS2E9} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbS2E10" component={ThumbS2E10} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbViralLoad" component={ThumbViralLoad} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
  </>
);
