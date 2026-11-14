import React from "react";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { TitleCard } from "./scenes/TitleCard";
import { Dataset } from "./scenes/Dataset";
import { Site } from "./scenes/Site";
import { Findings } from "./scenes/Findings";
import { sec } from "./theme";
import timing from "./data/site-timing.json";

export const TRANSITION = 12;
export const SCENES = {
  title: sec(3.2),
  dataset: sec(5.5),
  site: Math.min(sec(30), sec(timing.durationSec)), // as long as the recording, capped at 30 s
  findings: sec(6.5),
  end: sec(4.5),
};
// Four transitions overlap their neighbours, so they shorten the total.
export const TOTAL = Object.values(SCENES).reduce((a, b) => a + b, 0) - 4 * TRANSITION;

// An element, not a component: TransitionSeries only accepts its own element types as children.
const T = <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION })} />;

export const FairLensDemo: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={SCENES.title}>
      <TitleCard tagline="Check a dataset for bias before you train a model on it." />
    </TransitionSeries.Sequence>
    {T}
    <TransitionSeries.Sequence durationInFrames={SCENES.dataset}><Dataset /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: TRANSITION })} />
    <TransitionSeries.Sequence durationInFrames={SCENES.site}><Site /></TransitionSeries.Sequence>
    {T}
    <TransitionSeries.Sequence durationInFrames={SCENES.findings}><Findings /></TransitionSeries.Sequence>
    {T}
    <TransitionSeries.Sequence durationInFrames={SCENES.end}>
      <TitleCard cta="Try it: fairlens-a.vercel.app" stack="Python · FastAPI · pandas · SciPy · React · TypeScript · Vercel" footer="github.com/sweksha-cloud/Fairlens-a" />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
