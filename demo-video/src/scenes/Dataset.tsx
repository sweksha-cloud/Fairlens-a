import React from "react";
import { Caption, Glow, SceneFrame, TechTag, useAppear } from "../components";
import { C, monoFamily, sec } from "../theme";
import data from "../data/rows.json";

// rows.json is written by scripts/fetch-data.mjs: real rows of the UCI Adult census CSV.
const d = data as { total: number; columns: number; shown: string[]; rows: Record<string, string>[] };
export const UNKNOWN_AT = sec(2.6);

const Row: React.FC<{ r: Record<string, string>; i: number }> = ({ r, i }) => {
  const style = useAppear(6 + i * 3, Infinity, 10);
  return (
    <tr style={style}>
      {d.shown.map((k) => {
        const unknown = r[k] === "?";
        return (
          <td key={k} style={{ padding: "17px 20px", borderTop: `1px solid ${C.border}`, position: "relative" }}>
            {unknown ? <Unknown /> : r[k]}
          </td>
        );
      })}
    </tr>
  );
};

const Unknown: React.FC = () => {
  const style = useAppear(UNKNOWN_AT, Infinity, 0);
  return (
    <span style={{ position: "relative" }}>
      ?
      <span style={{ position: "absolute", left: -14, top: -8, right: -14, bottom: -8, border: `3px solid ${C.amber}`, borderRadius: 10, background: "rgba(245,158,11,.15)", ...style }} />
    </span>
  );
};

export const Dataset: React.FC = () => {
  const card = useAppear(0, Infinity, 24);
  return (
    <SceneFrame>
      <Glow strength={0.5} />
      <div style={{ position: "absolute", left: 130, right: 130, top: 120, ...card }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 42, fontWeight: 700 }}>adult-census-income.csv</div>
          <div style={{ fontSize: 30, color: C.dim }}>{d.total.toLocaleString("en-US")} rows · {d.columns} columns</div>
        </div>
        <div style={{ background: C.card, color: C.ink, borderRadius: 18, overflow: "hidden", boxShadow: "0 12px 48px rgba(60,230,221,.25)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: monoFamily, fontSize: 28, fontVariantLigatures: "none" }}>
            <thead>
              <tr style={{ background: "#f1f5f6" }}>
                {d.shown.map((k) => <th key={k} style={{ textAlign: "left", padding: "18px 20px", fontWeight: 500, color: C.muted }}>{k}</th>)}
              </tr>
            </thead>
            <tbody>{d.rows.map((r, i) => <Row key={i} r={r} i={i} />)}</tbody>
          </table>
        </div>
      </div>
      <Caption text={`Real data: the UCI Adult census, ${d.total.toLocaleString("en-US")} people`} from={sec(0.4)} to={UNKNOWN_AT - 2} />
      <Caption text={'Messy, like real data: "?" means the country is unknown'} from={UNKNOWN_AT} />
      <TechTag label="UCI Adult dataset" />
    </SceneFrame>
  );
};
