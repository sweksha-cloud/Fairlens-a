import React from "react";
import { Composition } from "remotion";
import { FairLensDemo, TOTAL } from "./Video";
import { FPS } from "./theme";

export const Root: React.FC = () => (
  <Composition id="FairLensDemo" component={FairLensDemo} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
);
