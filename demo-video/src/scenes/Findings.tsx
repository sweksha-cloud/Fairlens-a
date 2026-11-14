import React from "react";
import { Caption, Glow, SceneFrame, TechTag, useAppear, useGrow } from "../components";
import { C, displayFamily, sec } from "../theme";
import report from "../data/report.json";

// Every number here is the live API's answer for the Adult census data (src/data/report.json).
type Rate = { group: string; rate: number; rows: number };
const pct = (x: number) => `${Math.round(x * 100)}%`;
const fmtP = (p: number) => (p < 0.001 ? "p < 0.001" : `p = ${p.toFixed(3)}`);

const Bar: React.FC<{ r: Rate; max: number; delay: number; color: string }> = ({ r, max, delay, color }) => {
  const g = useGrow(delay, 26);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16 }}>
      <div style={{ width: 120, fontSize: 28, color: C.dim, textAlign: "right" }}>{r.group}</div>
      <div style={{ flex: 1, height: 38, background: "rgba(255,255,255,.08)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ width: `${(r.rate / max) * 100 * g}%`, height: "100%", background: color, borderRadius: 10 }} />
      </div>
      <div style={{ width: 80, fontSize: 32, fontWeight: 700, opacity: g }}>{pct(r.rate)}</div>
    </div>
  );
};

const Panel: React.FC<{ title: string; rates: Rate[]; delay: number; foot: string }> = ({ title, rates, delay, foot }) => {
  const style = useAppear(delay, Infinity, 20);
  const max = Math.max(...rates.map((r) => r.rate)) * 1.1;
  return (
    <div style={{ flex: 1, background: "rgba(13,20,22,.92)", border: `1px solid rgba(60,230,221,.3)`, borderRadius: 22, padding: "34px 40px", ...style }}>
      <div style={{ fontFamily: displayFamily, fontSize: 40, fontWeight: 700, marginBottom: 26 }}>{title}</div>
      {rates.map((r, i) => <Bar key={r.group} r={r} max={max} delay={delay + 6 + i * 4} color={i % 2 ? C.blue : C.cyan} />)}
      <div style={{ fontSize: 24, color: C.dim, marginTop: 14 }}>{foot}</div>
    </div>
  );
};

export const Findings: React.FC = () => {
  const head = useAppear(0, Infinity, 16);
  const sex = [...report.sex.rates].sort((a, b) => a.rate - b.rate);
  const age = report.age.rates;
  return (
    <SceneFrame>
      <Glow strength={0.45} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 80, ...head }}>
        <div style={{ fontFamily: displayFamily, fontSize: 60, fontWeight: 700 }}>Share earning over $50K, by group</div>
        <div style={{ fontSize: 30, color: C.dim, marginTop: 6 }}>
          Severity: <span style={{ color: C.red, fontWeight: 700 }}>{report.severity[0].toUpperCase() + report.severity.slice(1)}</span> · {report.issues} issues found · {report.unknownCountry} unknown countries set aside, not counted as a group
        </div>
      </div>
      <div style={{ position: "absolute", left: 130, right: 130, top: 270, display: "flex", gap: 40, alignItems: "flex-start" }}>
        <Panel title="By sex" rates={sex} delay={8} foot={`χ² test ${fmtP(report.sex.pValue)} · Cramér's V ${report.sex.cramersV.toFixed(2)}`} />
        <Panel title="By age (grouped automatically)" rates={age} delay={20} foot={`χ² test ${fmtP(report.age.pValue)} · Cramér's V ${report.age.cramersV.toFixed(2)}`} />
      </div>
      <Caption text="A model trained on this data would learn these gaps" from={sec(1.2)} />
      <TechTag label="χ² test + effect size (SciPy)" />
    </SceneFrame>
  );
};
