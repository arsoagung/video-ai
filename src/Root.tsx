import { S1E5Full, S1E5_FRAMES } from './s1e5/S1E5';
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
import { ThumbHivAids, ThumbCd4, ThumbReplikasi, ThumbViralLoad, ThumbArv, THUMB_W, THUMB_H } from './thumb/Thumb';

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
    <Composition id="Ep5Full" component={Ep5Full} durationInFrames={2502} fps={FPS} width={1080} height={1920} />
    <Composition id="ThumbHivAids" component={ThumbHivAids} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbCd4" component={ThumbCd4} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbReplikasi" component={ThumbReplikasi} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbArv" component={ThumbArv} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
    <Composition id="ThumbViralLoad" component={ThumbViralLoad} durationInFrames={1} fps={FPS} width={THUMB_W} height={THUMB_H} />
  </>
);
