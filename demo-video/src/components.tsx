import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, displayFamily, fontFamily } from "./theme";

/** Fades and slides in at `from`, out at `to` (frames, relative to the scene). */
export const useAppear = (from: number, to = Infinity, distance = 16) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame: frame - from, fps, config: { damping: 200 }, durationInFrames: 14 });
  const outP = to === Infinity ? 0 : interpolate(frame, [to - 8, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { opacity: inP * (1 - outP), transform: `translateY(${(1 - inP) * distance}px)` };
};

/** 0 → 1 over `len` frames starting at `from`, eased. */
export const useGrow = (from: number, len = 24) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - from, fps, config: { damping: 200 }, durationInFrames: len });
};

/** A caption pill at the bottom of the frame, describing only what is on screen. */
export const Caption: React.FC<{ text: string; from: number; to?: number }> = ({ text, from, to = Infinity }) => {
  const style = useAppear(from, to, 10);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 52, display: "flex", justifyContent: "center", ...style }}>
      <div
        style={{
          fontFamily, fontSize: 34, fontWeight: 600, color: "#fff", background: "rgba(10,14,16,.92)",
          border: `1px solid rgba(60,230,221,.45)`, padding: "14px 30px", borderRadius: 999, letterSpacing: -0.2,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** The heart-glow backdrop of the site's hero, as soft radial light. */
export const Glow: React.FC<{ strength?: number }> = ({ strength = 1 }) => (
  <>
    <div style={{ position: "absolute", left: "18%", top: "8%", width: 900, height: 820, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(60,230,221,.38), rgba(60,230,221,0))", filter: "blur(30px)", opacity: strength }} />
    <div style={{ position: "absolute", right: "14%", top: "20%", width: 760, height: 700, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(55,177,230,.34), rgba(55,177,230,0))", filter: "blur(30px)", opacity: strength }} />
  </>
);

export const SceneFrame: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = C.bg }) => (
  <div style={{ position: "absolute", inset: 0, background: bg, fontFamily, color: C.text, overflow: "hidden" }}>{children}</div>
);

/** The navbar's "FL" badge. */
export const BrandMark: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <div
    style={{
      width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg, #0FDBFA, #1CB4EB)",
      display: "grid", placeItems: "center", color: "#fff", fontFamily: displayFamily, fontWeight: 700, fontSize: size * 0.4,
      boxShadow: "0 0 48px rgba(15,219,250,.55)",
    }}
  >
    FL
  </div>
);

/** The RCC credit, styled like the site's banner. */
export const RccBanner: React.FC<{ style?: React.CSSProperties; size?: number }> = ({ style, size = 24 }) => (
  <div
    style={{
      background: C.cyan, color: "#000", fontFamily: displayFamily, fontWeight: 700, fontSize: size, letterSpacing: 1.2,
      textTransform: "uppercase", padding: `${size * 0.45}px ${size * 1.1}px`, borderRadius: 999,
      boxShadow: "0 0 40px rgba(60,230,221,.55)", ...style,
    }}
  >
    Made for the Responsible Computing Club at SJSU
  </div>
);

/** A small label naming the technology behind what is on screen. */
export const TechTag: React.FC<{ label: string; from?: number; to?: number }> = ({ label, from = 4, to = Infinity }) => {
  const style = useAppear(from, to, -8);
  return (
    <div style={{ position: "absolute", top: 30, right: 40, display: "flex", alignItems: "center", gap: 10, fontFamily, fontSize: 21, fontWeight: 600, color: C.dim, background: "rgba(10,14,16,.9)", border: `1px solid ${C.faint}`, borderRadius: 999, padding: "9px 18px", ...style }}>
      <span style={{ width: 9, height: 9, borderRadius: 99, background: C.cyan }} />
      {label}
    </div>
  );
};
