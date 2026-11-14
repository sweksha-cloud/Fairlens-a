import { AlertTriangle, TrendingUp, BarChart3, AlertCircle, Activity, Users, ChevronDown } from 'lucide-react';
import { AnalysisResult } from '../App';
import type { Page } from './Navigation';

type AnalysisPageProps = {
  onNavigate: (page: Page) => void;
  result: AnalysisResult;
};

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'high': return '#EF4444';
    case 'medium':
    case 'moderate': return '#F59E0B';
    case 'low': return '#10B981';
    default: return '#6B7280';
  }
};

const getSkewnessColor = (interpretation: string) => {
  if (interpretation.includes('highly')) return '#EF4444';
  if (interpretation.includes('moderately')) return '#F59E0B';
  return '#10B981';
};

const formatPValue = (pValue: number) => {
  if (pValue < 0.001) return 'p < 0.001';
  return `p = ${pValue.toFixed(4)}`;
};

/** Pick the outcome value to talk about: the "positive" one if recognisable, else the rarest. */
const focusOutcome = (rates: { [group: string]: { [outcome: string]: number } }) => {
  const outcomes = [...new Set(Object.values(rates).flatMap((r) => Object.keys(r)))];
  const positive = outcomes.find((o) => /^(1|1\.0|yes|true|y|approved|hired|positive)$/i.test(o));
  return positive ?? outcomes[outcomes.length - 1];
};

const pct = (x: number) => `${(x * 100).toFixed(x < 0.01 ? 1 : 0)}%`;

type Finding = { tone: 'bad' | 'warn' | 'info'; title: string; meaning: string; action: string };

function buildFindings(result: AnalysisResult): Finding[] {
  const out: Finding[] = [];
  for (const [attr, d] of Object.entries(result.correlation_bias)) {
    if (!d.is_correlated || !d.outcome_rates) continue;
    const outcome = focusOutcome(d.outcome_rates);
    // Compare only groups with enough rows to trust (30+, as the API does), when sizes are known.
    const counts = result.representation_bias[attr]?.counts ?? {};
    const all = Object.entries(d.outcome_rates).map(([g, r]) => [g, r[outcome] ?? 0] as const);
    const big = all.filter(([g]) => (counts[g] ?? Infinity) >= 30);
    const sorted = (big.length >= 2 ? big : all).sort((a, b) => b[1] - a[1]);
    const [hi, lo] = [sorted[0], sorted[sorted.length - 1]];
    out.push({
      tone: 'bad',
      title: `Outcomes differ by ${attr.replace(/_/g, ' ')}`,
      meaning: `The share with outcome "${outcome}" ranges from ${pct(lo[1])} (${lo[0]}) to ${pct(hi[1])} (${hi[0]}). A model trained on this data is likely to learn and repeat that gap.`,
      action: `Check whether the gap has a legitimate cause. If not, consider reweighting or resampling, and measure your model's results per ${attr.replace(/_/g, ' ')} group.`,
    });
  }
  for (const [attr, d] of Object.entries(result.representation_bias)) {
    const small = Object.entries(d.underrepresented_groups ?? {});
    if (!small.length) continue;
    out.push({
      tone: 'warn',
      title: `Some ${attr.replace(/_/g, ' ')} groups are rare`,
      meaning: `${small
        .sort((a, b) => a[1] - b[1])
        .slice(0, 8)
        .map(([g, v]) => `${g} (${pct(v)})`)
        .join(', ')}${small.length > 8 ? ` and ${small.length - 8} more` : ''} each make up under ${+((d.rare_threshold ?? 0.1) * 100).toFixed(1)}% of rows, so a model will see few examples of them and may perform worse for them.`,
      action: 'Collect more data for these groups if you can, and report model accuracy separately for them.',
    });
  }
  const ci = result.class_imbalance;
  if (ci && ci.imbalance_ratio > 3) {
    out.push({
      tone: 'warn',
      title: 'The outcome is lopsided',
      meaning: `The most common outcome is ${ci.imbalance_ratio.toFixed(1)}× as frequent as the rarest, so a model can look accurate by mostly predicting the common one.`,
      action: 'Use metrics like precision/recall per class instead of plain accuracy, or rebalance the classes.',
    });
  }
  const skewed = Object.entries(result.skewness_analysis).filter(([, d]) => d.interpretation.includes('highly'));
  if (skewed.length) {
    out.push({
      tone: 'info',
      title: 'Some numeric columns have extreme values',
      meaning: `${skewed.map(([f]) => f).join(', ')} ${skewed.length === 1 ? 'is' : 'are'} highly skewed: most values are small with a long tail of large ones. This is a data-quality note rather than unfairness by itself.`,
      action: 'Consider a log transform or capping extreme values before training.',
    });
  }
  return out;
}

const TONE = { bad: '#EF4444', warn: '#F59E0B', info: '#37B1E6' };

const COLORS = ['#3CE6DD', '#37B1E6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4'];

const CARD = 'rounded-2xl bg-white p-5 shadow-[0_8px_32px_rgba(60,230,221,0.2)] sm:p-7';
const CARD_H2 = 'mb-1 flex items-center gap-3 font-display text-2xl font-bold text-black sm:text-[28px]';
const CARD_INTRO = 'mb-5 font-ui text-sm text-black/60';
const MAX_BARS = 10; // groups shown per chart; the rest are summarised in one line

const label = (attr: string) => attr.replace(/_/g, ' ');

/** A labelled horizontal bar, used by every chart on the page. */
function RateBar({ name, value, max = 1, color, right }: { name: string; value: number; max?: number; color: string; right: string }) {
  return (
    <div>
      <div className="mb-0.5 flex justify-between gap-3 font-ui text-sm">
        <span className="truncate text-black">{name}</span>
        <span className="shrink-0 font-semibold text-black/80">{right}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#E3E3E3]">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function MoreGroups({ n, what }: { n: number; what: string }) {
  if (n <= 0) return null;
  return <p className="font-ui text-xs text-black/50">and {n} more {n === 1 ? 'group' : 'groups'} {what}</p>;
}

export default function AnalysisPage({ onNavigate, result }: AnalysisPageProps) {
  const severityColor = getSeverityColor(result.summary.bias_severity);
  const classCounts = result.class_imbalance?.class_counts ?? {};
  const hasClassImbalance = Object.keys(classCounts).length > 0;
  const findings = buildFindings(result);
  const totalRows =
    result.totalRows || Object.values(classCounts).reduce((a, b) => a + b, 0);
  // Flagged attributes first, so the gaps that matter are at the top of the grid.
  const correlation = Object.entries(result.correlation_bias).sort(
    (a, b) => Number(b[1].is_correlated) - Number(a[1].is_correlated) || (b[1].cramers_v ?? 0) - (a[1].cramers_v ?? 0),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      {/* Header + overview */}
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight text-white">
            Bias Report
          </h1>
          <p className="mt-1 break-all font-body text-lg text-[#3CE6DD]">{result.fileName}</p>
        </div>
        <div className="grid grid-cols-3 gap-3 lg:w-[560px]">
          {[
            { icon: <BarChart3 className="size-5 text-[#3CE6DD]" />, title: 'Rows', value: totalRows.toLocaleString(), color: '#3CE6DD' },
            { icon: <AlertTriangle className="size-5 text-[#3CE6DD]" />, title: 'Issues', value: String(result.summary.total_issues_detected), color: '#3CE6DD' },
            { icon: <span className="size-4 rounded-full" style={{ backgroundColor: severityColor }} />, title: 'Severity', value: result.summary.bias_severity, color: severityColor },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-[#3CE6DD]/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 font-ui text-sm font-semibold text-white/80">{c.icon}{c.title}</div>
              <p className="mt-1 truncate font-display text-xl font-bold capitalize sm:text-3xl" style={{ color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plain-English summary */}
      <div className={`${CARD} mb-6`}>
        <h2 className={CARD_H2}>
          <BarChart3 className="size-6 shrink-0 text-[#3CE6DD]" />
          What this means
        </h2>
        <p className={CARD_INTRO}>The findings in plain English, most important first.</p>
        {(result.notes ?? []).map((n) => (
          <p key={n} className="mb-3 rounded-lg border-l-4 border-[#37B1E6] bg-[#37B1E6]/10 px-3 py-2 font-ui text-sm text-black/80">
            {n}
          </p>
        ))}
        {findings.length === 0 ? (
          <p className="font-ui text-black/80">
            None of FairLens's checks found a problem. Groups are reasonably represented and outcomes don't differ
            meaningfully between them. That's a good sign, but it doesn't prove the data is fair; it only covers
            the columns you selected.
          </p>
        ) : (
          <div className="grid gap-x-8 gap-y-4 lg:grid-cols-2">
            {findings.map((f) => (
              <div key={f.title} className="border-l-4 pl-4" style={{ borderColor: TONE[f.tone] }}>
                <p className="font-ui font-semibold" style={{ color: TONE[f.tone] }}>{f.title}</p>
                <p className="mt-0.5 font-ui text-sm text-black/80">{f.meaning}</p>
                <p className="mt-0.5 font-ui text-xs text-black/60"><strong>What you can do:</strong> {f.action}</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-5 font-ui text-xs text-black/50">
          Severity: <strong>high</strong> if outcomes differ strongly by group (or by two or more attributes),{' '}
          <strong>moderate</strong> for an outcome gap or rare groups, <strong>low</strong> for data-quality notes only.
          These are statistical warning signs in the data, not proof of discrimination.
        </p>
      </div>

      {/* Outcome rates by group */}
      {correlation.length > 0 && (
        <div className={`${CARD} mb-6`}>
          <h2 className={CARD_H2}>
            <AlertTriangle className="size-6 shrink-0 text-[#EF4444]" />
            Outcome rate by group
          </h2>
          <p className={CARD_INTRO}>
            Flagged when the difference is statistically significant (χ² test, p {'<'} 0.05) <em>and</em> large enough
            to matter: a gap of 10+ points between groups with 30+ rows, or Cramér's V (0 = none, 1 = total) of 0.1+.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {correlation.map(([attribute, data]) => {
              const outcome = data.outcome_rates ? focusOutcome(data.outcome_rates) : '';
              const counts = result.representation_bias[attribute]?.counts ?? {};
              const rows = Object.entries(data.outcome_rates ?? {})
                .map(([g, r]) => ({ g, rate: r[outcome] ?? 0, n: counts[g] ?? 0 }))
                .sort((a, b) => b.n - a.n);
              const shown = rows.slice(0, MAX_BARS).sort((a, b) => b.rate - a.rate);
              const flagged = data.is_correlated;
              return (
                <div
                  key={attribute}
                  className={`rounded-xl border-2 p-4 ${flagged ? 'bg-red-50' : 'bg-green-50'}`}
                  style={{ borderColor: flagged ? '#EF4444' : '#10B981' }}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h3 className="font-ui text-lg font-semibold capitalize text-black">{label(attribute)}</h3>
                    <span
                      className="shrink-0 rounded-full px-3 py-1 font-ui text-xs font-semibold text-white"
                      style={{ backgroundColor: flagged ? '#EF4444' : '#10B981' }}
                    >
                      {flagged ? 'OUTCOMES DIFFER' : 'NO MEANINGFUL DIFFERENCE'}
                    </span>
                  </div>
                  <p className="mb-3 font-ui text-xs text-black/60">
                    χ² = {data.chi2_statistic.toFixed(1)} · {formatPValue(data.p_value)} · Cramér's V = {(data.cramers_v ?? 0).toFixed(2)}
                    {data.strength && <> (<span className="capitalize">{data.strength}</span>)</>}
                    {data.statistically_significant && !flagged && ' · significant but too small to flag'}
                  </p>
                  {outcome && (
                    <div className="space-y-2">
                      <p className="font-ui text-xs font-semibold uppercase tracking-wide text-black/50">Share with "{outcome}"</p>
                      {shown.map(({ g, rate }, i) => (
                        <RateBar key={g} name={g} value={rate} color={COLORS[i % COLORS.length]} right={pct(rate)} />
                      ))}
                      <MoreGroups n={rows.length - shown.length} what="with fewer rows" />
                    </div>
                  )}
                  {data.low_expected_counts && (
                    <p className="mt-2 font-ui text-xs text-black/60">
                      Some groups are small, so this test is less reliable for {label(attribute)}.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Group sizes */}
      {Object.keys(result.representation_bias).length > 0 && (
        <div className={`${CARD} mb-6`}>
          <h2 className={CARD_H2}>
            <Users className="size-6 shrink-0 text-[#3CE6DD]" />
            Group sizes
          </h2>
          <p className={CARD_INTRO}>
            Share of rows in each group. Rare groups (red) give a model few examples, so it tends to be less accurate
            for them.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(result.representation_bias).map(([attribute, data]) => {
              const entries = Object.entries(data.proportions).sort((a, b) => b[1] - a[1]);
              const shown = entries.slice(0, MAX_BARS);
              const threshold = data.rare_threshold ?? 0.1;
              return (
                <div key={attribute} className="rounded-xl border border-[#E3E3E3] p-4">
                  <div className="mb-3 flex items-baseline justify-between gap-2">
                    <h3 className="font-ui text-lg font-semibold capitalize text-black">{label(attribute)}</h3>
                    <span className="font-ui text-xs text-black/50">
                      largest ÷ smallest = {data.representation_ratio.toFixed(1)}×
                    </span>
                  </div>
                  <div className="space-y-2">
                    {shown.map(([g, share], i) => {
                      const rare = share < threshold;
                      return (
                        <RateBar
                          key={g}
                          name={g}
                          value={share}
                          color={rare ? '#EF4444' : COLORS[i % COLORS.length]}
                          right={`${(share * 100).toFixed(share < 0.01 ? 2 : 1)}%`}
                        />
                      );
                    })}
                    <MoreGroups n={entries.length - shown.length} what="that are smaller" />
                    {!!data.missing && (
                      <p className="font-ui text-xs text-black/50">{data.missing.toLocaleString()} rows unknown (left out)</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Outcome balance + extreme values */}
      {(hasClassImbalance || Object.keys(result.skewness_analysis).length > 0) && (
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {hasClassImbalance && (
            <div className={CARD}>
              <h2 className={CARD_H2}>
                <TrendingUp className="size-6 shrink-0 text-[#3CE6DD]" />
                Outcome balance
              </h2>
              <p className={CARD_INTRO}>
                The most common outcome is {result.class_imbalance.imbalance_ratio.toFixed(1)}× as frequent as the rarest.
                Above 3×, a model may mostly learn the common one.
              </p>
              <div className="space-y-2">
                {Object.entries(result.class_imbalance.class_proportions)
                  .sort((a, b) => b[1] - a[1])
                  .map(([o, share], i) => (
                    <RateBar
                      key={o}
                      name={o}
                      value={share}
                      color={COLORS[i % COLORS.length]}
                      right={`${(share * 100).toFixed(1)}% · ${(classCounts[o] ?? 0).toLocaleString()} rows`}
                    />
                  ))}
              </div>
            </div>
          )}
          {Object.keys(result.skewness_analysis).length > 0 && (
            <div className={CARD}>
              <h2 className={CARD_H2}>
                <Activity className="size-6 shrink-0 text-[#3CE6DD]" />
                Extreme values
              </h2>
              <p className={CARD_INTRO}>Skewness of each numeric column: near 0 is even; above 1 means a long tail of extreme values.</p>
              <div className="space-y-2">
                {Object.entries(result.skewness_analysis)
                  .sort((a, b) => Math.abs(b[1].skewness) - Math.abs(a[1].skewness))
                  .map(([feature, data]) => (
                    <RateBar
                      key={feature}
                      name={feature}
                      value={Math.min(Math.abs(data.skewness), 2)}
                      max={2}
                      color={getSkewnessColor(data.interpretation)}
                      right={`${data.skewness.toFixed(2)} · ${data.interpretation}`}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Raw issue list */}
      <details className={`${CARD} group mb-8`}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-xl font-bold text-black">
          <span className="flex items-center gap-3">
            <AlertCircle className="size-6 shrink-0 text-[#F59E0B]" />
            All detected issues ({result.detected_issues.length})
          </span>
          <ChevronDown className="size-5 text-black/50 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-4 space-y-2">
          {result.detected_issues.length === 0 && <p className="font-ui text-black/70">No issues detected.</p>}
          {result.detected_issues.map((issue, index) => {
            const issueType = issue.split(':')[0];
            const issueDescription = issue.split(':').slice(1).join(':');
            const color = issueType.includes('HIGH') || issueType.includes('CORRELATION') ? '#EF4444' : '#F59E0B';
            return (
              <p key={index} className="border-l-4 py-1 pl-3 font-ui text-sm" style={{ borderColor: color }}>
                <span className="font-semibold" style={{ color }}>{issueType}:</span>
                <span className="text-black/80">{issueDescription}</span>
              </p>
            );
          })}
        </div>
      </details>

      {/* Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <button
          onClick={() => onNavigate('upload')}
          className="rounded-xl border-2 border-[#3CE6DD] bg-white px-10 py-3 font-ui font-semibold text-[#3CE6DD] transition-colors hover:bg-[#3CE6DD]/10"
        >
          Analyze Another Dataset
        </button>
        <button
          onClick={() => onNavigate('home')}
          className="rounded-xl border-2 border-[#37B1E6] bg-[#3CE6DD] px-10 py-3 font-ui font-semibold text-black transition-colors hover:bg-[#37B1E6]"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
