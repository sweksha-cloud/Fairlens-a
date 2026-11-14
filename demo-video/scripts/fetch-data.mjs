// Runs the real FairLens API over the UCI Adult census data and saves what the video shows:
//   src/data/rows.json    - a few real rows of the CSV (including one with an unknown "?" country)
//   src/data/report.json  - the API's actual findings for those columns
//
//   ADULT_CSV=~/Downloads/adult-census-income.csv npm run data
//
// The CSV is the UCI Adult dataset (archive.ics.uci.edu/dataset/2/adult) with a header row added.
import { readFileSync, writeFileSync } from "node:fs";

const CSV = process.env.ADULT_CSV ?? `${process.env.HOME}/Downloads/adult-census-income.csv`;
const API = process.env.FAIRLENS_API ?? "https://fairlens-a.vercel.app/api";
const SENSITIVE = ["age", "marital_status", "race", "sex", "native_country"]; // what the site suggests
const here = new URL("..", import.meta.url).pathname;

const text = readFileSync(CSV, "utf8");
const lines = text.trim().split(/\r?\n/);
const header = lines[0].split(",");
const SHOWN = ["age", "education", "occupation", "race", "sex", "native_country", "income"];
const row = (l) => Object.fromEntries(l.split(",").map((v, i) => [header[i], v]));
const all = lines.slice(1).map(row);
const firstUnknown = all.findIndex((r) => r.native_country === "?");
const picked = [...all.slice(0, 7), all[firstUnknown]].map((r) => Object.fromEntries(SHOWN.map((k) => [k, r[k]])));
writeFileSync(`${here}src/data/rows.json`, JSON.stringify({ total: all.length, columns: header.length, shown: SHOWN, rows: picked }, null, 2) + "\n");

const form = new FormData();
form.append("file", new Blob([text], { type: "text/csv" }), "adult-census-income.csv");
form.append("target_column", "income");
form.append("sensitive_attributes", SENSITIVE.join(","));
const res = await fetch(`${API}/analyze-bias-csv`, { method: "POST", body: form });
if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
const { bias_report: r } = await res.json();

const rates = (attr) =>
  Object.entries(r.correlation_bias[attr].outcome_rates).map(([group, o]) => ({
    group,
    rate: o[">50K"],
    rows: r.representation_bias[attr].counts[group],
  }));
const report = {
  severity: r.summary.bias_severity,
  issues: r.summary.total_issues_detected,
  notes: r.notes,
  sex: { rates: rates("sex"), cramersV: r.correlation_bias.sex.cramers_v, pValue: r.correlation_bias.sex.p_value },
  age: { rates: rates("age"), cramersV: r.correlation_bias.age.cramers_v, pValue: r.correlation_bias.age.p_value },
  race: { rates: rates("race"), cramersV: r.correlation_bias.race.cramers_v, pValue: r.correlation_bias.race.p_value },
  unknownCountry: r.representation_bias.native_country.missing,
  countries: Object.keys(r.representation_bias.native_country.counts).length,
};
writeFileSync(`${here}src/data/report.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 1).slice(0, 1500));
