import React from "react";
import { Glow, SceneFrame, useAppear } from "../components";
import { C, displayFamily, sec } from "../theme";

// What FairLens makes possible. The "next steps" are the suggestions the report itself gives.
const POINTS = [
  {
    title: "Catch it before training",
    body: "Find unfair patterns while they're still in the data, before a model learns them and they reach real decisions.",
  },
  {
    title: "Anywhere data judges people",
    body: "Hiring, lending, admissions, healthcare: check the dataset first. Free, no sign-up, nothing stored.",
  },
  {
    title: "Clear next steps",
    body: "Each finding says what to do: reweight or resample, collect more data for rare groups, report accuracy per group.",
  },
  {
    title: "Built for SJSU",
    body: "Students checking class-project data and researchers vetting data before a study, through the Responsible Computing Club.",
  },
];

const Point: React.FC<{ p: (typeof POINTS)[number]; i: number }> = ({ p, i }) => {
  const style = useAppear(sec(0.6) + i * sec(0.9), Infinity, 22);
  return (
    <div style={{ background: "rgba(13,20,22,.92)", border: "1px solid rgba(60,230,221,.35)", borderRadius: 22, padding: "40px 44px", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
        <span style={{ width: 40, height: 40, borderRadius: 99, background: C.cyan, color: "#000", display: "grid", placeItems: "center", fontFamily: displayFamily, fontWeight: 700, fontSize: 24 }}>{i + 1}</span>
        <span style={{ fontFamily: displayFamily, fontSize: 46, fontWeight: 700 }}>{p.title}</span>
      </div>
      <div style={{ fontSize: 32, color: C.dim, lineHeight: 1.4 }}>{p.body}</div>
    </div>
  );
};

export const Impact: React.FC = () => {
  const head = useAppear(0, Infinity, 16);
  return (
    <SceneFrame>
      <Glow strength={0.45} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 130, ...head }}>
        <div style={{ fontFamily: displayFamily, fontSize: 72, fontWeight: 700 }}>Why it matters</div>
      </div>
      <div style={{ position: "absolute", left: 130, right: 130, top: 270, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        {POINTS.map((p, i) => <Point key={p.title} p={p} i={i} />)}
      </div>
    </SceneFrame>
  );
};
