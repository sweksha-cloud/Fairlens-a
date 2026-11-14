import React from "react";
import { Glow, SceneFrame, useAppear } from "../components";
import { C, displayFamily, sec } from "../theme";

/** The problem, in one line, before the product appears. */
export const Hook: React.FC = () => {
  const a = useAppear(0, Infinity, 20);
  const b = useAppear(sec(1.1), Infinity, 20);
  return (
    <SceneFrame>
      <Glow strength={0.35} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, fontFamily: displayFamily, fontWeight: 700, textAlign: "center" }}>
        <div style={{ fontSize: 92, ...a }}>AI learns from data.</div>
        <div style={{ fontSize: 92, color: C.cyan, textShadow: "0 0 40px rgba(60,230,221,.5)", ...b }}>If the data is biased, so is the AI.</div>
      </div>
    </SceneFrame>
  );
};
