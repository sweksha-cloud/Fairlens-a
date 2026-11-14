import React from "react";
import { OffthreadVideo, staticFile } from "remotion";
import { Caption, SceneFrame, TechTag } from "../components";
import { C, sec } from "../theme";
import timing from "../data/site-timing.json";
import report from "../data/report.json";

// public/site.mp4 is the live site (fairlens-a.vercel.app), recorded by scripts/record-site.mjs.
// site-timing.json holds when each step happened in that recording.
const t = timing as Record<"uploadAt" | "fileAt" | "columnsAt" | "analyzeAt" | "reportAt" | "summaryAt" | "sexAt" | "durationSec", number>;
const rate = (g: string) => Math.round(100 * report.sex.rates.find((r) => r.group === g)!.rate);
const seconds = Math.max(1, Math.round(t.reportAt - t.analyzeAt));

export const Site: React.FC = () => (
  <SceneFrame bg="#071012">
    <div style={{ position: "absolute", left: 150, right: 150, top: 36, bottom: 144, borderRadius: 14, overflow: "hidden", boxShadow: "0 20px 70px rgba(60,230,221,.22)", border: `1px solid ${C.faint}`, background: "#000", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 44, background: "#1b1f22", display: "flex", alignItems: "center", gap: 9, padding: "0 18px", borderBottom: `1px solid ${C.faint}` }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{ width: 13, height: 13, borderRadius: 99, background: c }} />)}
        <div style={{ marginLeft: 18, flex: 1, maxWidth: 520, height: 28, borderRadius: 8, background: "#2a2f33", fontSize: 16, color: C.dim, display: "flex", alignItems: "center", padding: "0 12px" }}>fairlens-a.vercel.app</div>
      </div>
      <OffthreadVideo src={staticFile("site.mp4")} style={{ width: "100%", flex: 1, objectFit: "cover", objectPosition: "top" }} muted />
    </div>
    <Caption text="The live site: fairlens-a.vercel.app" from={sec(0.3)} to={sec(t.uploadAt) - 2} />
    <Caption text="Upload the CSV" from={sec(t.uploadAt)} to={sec(t.columnsAt) - 2} />
    <Caption text="It picks the outcome (income) and the columns about people" from={sec(t.columnsAt)} to={sec(t.analyzeAt) - 2} />
    <Caption text={`32,561 rows checked in about ${seconds} seconds`} from={sec(t.analyzeAt)} to={sec(t.summaryAt) - 2} />
    <Caption text="Plain English: what each finding means, and what to do" from={sec(t.summaryAt)} to={sec(t.sexAt) - 2} />
    <Caption text={`Over $50K: ${rate("Male")}% of men vs ${rate("Female")}% of women`} from={sec(t.sexAt)} />
    <TechTag label="React · FastAPI · pandas · SciPy · Vercel" />
  </SceneFrame>
);
