import React from "react";
import { BrandMark, Glow, RccBanner, SceneFrame, useAppear } from "../components";
import { C, displayFamily } from "../theme";

export const TitleCard: React.FC<{ tagline?: string; footer?: string; stack?: string; cta?: string }> = ({ tagline, footer, stack, cta }) => {
  const banner = useAppear(0, Infinity, -16);
  const mark = useAppear(2, Infinity, 24);
  const title = useAppear(6, Infinity, 24);
  const sub = useAppear(14, Infinity, 16);
  return (
    <SceneFrame>
      <Glow />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
        <div style={banner}><RccBanner /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={mark}><BrandMark size={112} /></div>
          <div style={{ fontFamily: displayFamily, fontSize: 132, fontWeight: 700, letterSpacing: -2, textShadow: "0 0 36px rgba(255,255,255,.4), 0 0 90px rgba(60,230,221,.4)", ...title }}>FairLens</div>
        </div>
        {tagline && <div style={{ fontSize: 44, color: C.dim, maxWidth: 1400, textAlign: "center", lineHeight: 1.3, ...sub }}>{tagline}</div>}
        {cta && <div style={{ fontFamily: displayFamily, fontSize: 52, fontWeight: 700, color: "#000", background: C.cyan, padding: "16px 40px", borderRadius: 18, boxShadow: "0 8px 40px rgba(60,230,221,.45)", ...sub }}>{cta}</div>}
        {stack && <div style={{ fontSize: 30, color: C.text, fontWeight: 500, ...sub }}>{stack}</div>}
        {footer && <div style={{ fontSize: 32, color: C.cyan, fontWeight: 500, ...sub }}>{footer}</div>}
      </div>
    </SceneFrame>
  );
};
