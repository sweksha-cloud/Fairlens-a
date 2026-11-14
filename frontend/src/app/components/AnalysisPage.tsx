import { AlertTriangle, TrendingUp, BarChart3, AlertCircle, Activity } from 'lucide-react';
import { AnalysisResult } from '../App';
import type { Page } from './Navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

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

const COLORS = ['#3CE6DD', '#37B1E6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4'];

const CARD = 'rounded-2xl bg-white p-6 shadow-[0_8px_32px_rgba(60,230,221,0.2)] sm:p-10';
const CARD_H2 = 'mb-6 flex items-center gap-4 font-display text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold text-black';

export default function AnalysisPage({ onNavigate, result }: AnalysisPageProps) {
  const severityColor = getSeverityColor(result.summary.bias_severity);
  const classCounts = result.class_imbalance?.class_counts ?? {};
  const hasClassImbalance = Object.keys(classCounts).length > 0;
  const findings = buildFindings(result);
  const totalRows =
    result.totalRows || Object.values(classCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="font-display text-[clamp(1.875rem,5vw,3.5rem)] font-bold text-white">
          Statistical Bias Analysis Report
        </h1>
        <p className="mt-3 font-body text-lg text-[#3CE6DD] sm:text-2xl break-all">{result.fileName}</p>
      </div>

      {/* Overview cards */}
      <div className="mb-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#3CE6DD]/20 bg-white/10 p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <BarChart3 className="size-8 text-[#3CE6DD]" />
            <p className="font-ui font-semibold text-white sm:text-lg">Total Rows</p>
          </div>
          <p className="font-display text-4xl font-bold text-[#3CE6DD] sm:text-5xl">
            {totalRows.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-[#3CE6DD]/20 bg-white/10 p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <AlertTriangle className="size-8 text-[#3CE6DD]" />
            <p className="font-ui font-semibold text-white sm:text-lg">Issues Detected</p>
          </div>
          <p className="font-display text-4xl font-bold text-[#3CE6DD] sm:text-5xl">
            {result.summary.total_issues_detected}
          </p>
        </div>

        <div className="rounded-2xl border border-[#3CE6DD]/20 bg-white/10 p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="size-8 rounded-full" style={{ backgroundColor: severityColor }} />
            <p className="font-ui font-semibold text-white sm:text-lg">Bias Severity</p>
          </div>
          <p className="font-display text-3xl font-bold capitalize sm:text-4xl" style={{ color: severityColor }}>
            {result.summary.bias_severity}
          </p>
        </div>
      </div>

      {/* Plain-English summary */}
      <div className={`${CARD} mb-10`}>
        <h2 className={CARD_H2}>
          <BarChart3 className="size-8 shrink-0 text-[#3CE6DD]" />
          What this means
        </h2>
        {(result.notes ?? []).map((n) => (
          <p key={n} className="mb-4 rounded-lg border-l-4 border-[#37B1E6] bg-[#37B1E6]/10 p-3 font-ui text-sm text-black/80">
            {n}
          </p>
        ))}
        {findings.length === 0 ? (
          <p className="font-ui text-black/80 sm:text-lg">
            None of FairLens's checks found a problem. Groups are reasonably represented and outcomes don't differ
            meaningfully between them. That's a good sign, but it doesn't prove the data is fair; it only covers
            the columns you selected.
          </p>
        ) : (
          <div className="space-y-5">
            {findings.map((f) => (
              <div key={f.title} className="border-l-4 py-1 pl-5" style={{ borderColor: TONE[f.tone] }}>
                <p className="font-ui text-lg font-semibold" style={{ color: TONE[f.tone] }}>{f.title}</p>
                <p className="mt-1 font-ui text-black/80">{f.meaning}</p>
                <p className="mt-1 font-ui text-sm text-black/60"><strong>What you can do:</strong> {f.action}</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-6 font-ui text-xs text-black/50">
          Severity: <strong>high</strong> if outcomes differ strongly by group (or by two or more attributes),{' '}
          <strong>moderate</strong> for an outcome gap or rare groups, <strong>low</strong> for data-quality notes only.
          These are statistical warning signs in the data, not proof of discrimination.
        </p>
      </div>

      {/* Detected issues */}
      <div className={`${CARD} mb-10`}>
        <h2 className={CARD_H2}>
          <AlertTriangle className="size-8 shrink-0 text-[#EF4444]" />
          Detected Issues
        </h2>
        {result.detected_issues.length === 0 && (
          <p className="font-ui text-black/70">No issues detected.</p>
        )}
        <div className="space-y-4">
          {result.detected_issues.map((issue, index) => {
            const issueType = issue.split(':')[0];
            const issueDescription = issue.split(':').slice(1).join(':');
            const color =
              issueType.includes('HIGH') || issueType.includes('CORRELATION') ? '#EF4444' : '#F59E0B';

            return (
              <div key={index} className="border-l-4 py-3 pl-5" style={{ borderColor: color }}>
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-5 shrink-0" style={{ color }} />
                  <p className="font-ui text-sm sm:text-base">
                    <span className="font-semibold" style={{ color }}>
                      {issueType}:
                    </span>
                    <span className="text-black/80">{issueDescription}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skewness */}
      {Object.keys(result.skewness_analysis).length > 0 && (
        <div className={`${CARD} mb-10`}>
          <h2 className={CARD_H2}>
            <Activity className="size-8 shrink-0 text-[#3CE6DD]" />
            Skewness Analysis
          </h2>
          <p className="mb-6 font-ui text-sm text-black/70 sm:text-base">
            How lopsided each numeric column is. Near 0 means values are spread evenly around the
            middle; above 1 (or below -1) means a long tail of extreme values. Between -0.5 and 0.5 is
            fairly symmetric.
          </p>
          <div className="grid gap-6">
            {Object.entries(result.skewness_analysis).map(([feature, data]) => (
              <div
                key={feature}
                className="rounded-xl border-2 p-5"
                style={{ borderColor: getSkewnessColor(data.interpretation) }}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-ui text-lg font-semibold text-black sm:text-xl">{feature}</h3>
                  <span
                    className="rounded-full px-4 py-1.5 text-sm capitalize text-white"
                    style={{ backgroundColor: getSkewnessColor(data.interpretation) }}
                  >
                    {data.interpretation}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="mb-1 font-ui text-xs text-black/60 sm:text-sm">Skewness Value</p>
                    <p
                      className="font-display text-2xl font-bold sm:text-3xl"
                      style={{ color: getSkewnessColor(data.interpretation) }}
                    >
                      {data.skewness.toFixed(3)}
                    </p>
                  </div>
                  <div className="min-w-[140px] flex-1">
                    <div className="h-3 overflow-hidden rounded-full bg-[#E3E3E3]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(Math.abs(data.skewness) * 50, 100)}%`,
                          backgroundColor: getSkewnessColor(data.interpretation),
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class imbalance */}
      {hasClassImbalance && (
      <div className={`${CARD} mb-10`}>
        <h2 className={CARD_H2}>
          <TrendingUp className="size-8 shrink-0 text-[#3CE6DD]" />
          Class Imbalance Analysis
        </h2>

        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <p className="font-ui font-semibold text-black/80 sm:text-lg">Imbalance Ratio:</p>
            <span
              className="rounded-full px-5 py-2 text-white"
              style={{
                backgroundColor:
                  result.class_imbalance.imbalance_ratio > 5
                    ? '#EF4444'
                    : result.class_imbalance.imbalance_ratio > 3
                    ? '#F59E0B'
                    : '#10B981',
              }}
            >
              {result.class_imbalance.imbalance_ratio.toFixed(2)}:1
            </span>
          </div>
          <p className="font-ui text-xs text-black/60 sm:text-sm">
            How many times more common the most frequent outcome is than the rarest. Above 3 means
            a model may mostly learn the common outcome.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-5 font-ui text-lg font-semibold text-black">Class Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(result.class_imbalance.class_counts).map(([label, value]) => ({
                  label,
                  value,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '2px solid #3CE6DD' }} />
                <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>
                  {Object.entries(result.class_imbalance.class_counts).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="mb-5 font-ui text-lg font-semibold text-black">Class Proportions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(result.class_imbalance.class_proportions).map(([name, value]) => ({
                    name,
                    value: value * 100,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                  outerRadius={90}
                  dataKey="value"
                >
                  {Object.entries(result.class_imbalance.class_proportions).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      )}

      {/* Representation bias */}
      {Object.keys(result.representation_bias).length > 0 && (
        <div className={`${CARD} mb-10`}>
          <h2 className={CARD_H2}>
            <BarChart3 className="size-8 shrink-0 text-[#3CE6DD]" />
            Representation Bias Analysis
          </h2>
          <p className="mb-8 font-ui text-sm text-black/70 sm:text-base">
            How many rows each group has. Rare groups (under 10% of rows, or less when there are many groups) are shown in red: a model sees few examples of
            them, so it tends to be less accurate for them. The ratio compares the largest group to the
            smallest.
          </p>

          {Object.entries(result.representation_bias).map(([attribute, data], attrIndex) => (
            <div key={attribute} className={attrIndex > 0 ? 'mt-12' : ''}>
              <div className="mb-6">
                <h3 className="mb-3 font-ui text-xl font-semibold text-black sm:text-2xl">
                  {attribute.replace(/_/g, ' ')}
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-ui font-semibold text-black/80">Representation Ratio:</p>
                  <span
                    className="rounded-full px-4 py-1.5 text-white"
                    style={{
                      backgroundColor:
                        data.representation_ratio > 5
                          ? '#EF4444'
                          : data.representation_ratio > 3
                          ? '#F59E0B'
                          : '#10B981',
                    }}
                  >
                    {data.representation_ratio.toFixed(2)}:1
                  </span>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <h4 className="mb-4 font-ui font-semibold text-black">Distribution by Count</h4>
                  <ResponsiveContainer width="100%" height={Math.max(300, Object.keys(data.counts).length * 22)}>
                    <BarChart
                      data={Object.entries(data.counts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([label, value]) => ({ label, value }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="label" type="category" width={150} interval={0} tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '2px solid #3CE6DD' }} />
                      <Bar dataKey="value" name="Count" radius={[0, 8, 8, 0]}>
                        {Object.entries(data.counts).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="mb-4 font-ui font-semibold text-black">Percentage Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(data.proportions)
                      .sort((a, b) => b[1] - a[1])
                      .map(([label, proportion], index) => {
                        const percentage = proportion * 100;
                        const isUnderrepresented = proportion < (data.rare_threshold ?? 0.1);

                        return (
                          <div key={label}>
                            <div className="mb-1.5 flex justify-between font-ui text-sm font-semibold">
                              <span className="text-black">{label}</span>
                              <span style={{ color: isUnderrepresented ? '#EF4444' : '#3CE6DD' }}>
                                {percentage.toFixed(2)}%
                              </span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-[#E3E3E3]">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: isUnderrepresented
                                    ? '#EF4444'
                                    : COLORS[index % COLORS.length],
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Correlation bias */}
      {Object.keys(result.correlation_bias).length > 0 && (
        <div className={`${CARD} mb-10`}>
          <h2 className={CARD_H2}>
            <AlertTriangle className="size-8 shrink-0 text-[#EF4444]" />
            Correlation Bias (Chi-Square Test)
          </h2>
          <p className="mb-8 font-ui text-sm text-black/70 sm:text-base">
            Whether the outcome rate differs between groups. A difference is flagged when it is
            statistically significant (p {'<'} 0.05) <em>and</em> large enough to matter: a gap of 10+
            percentage points between groups with at least 30 rows, or an association strength
            (Cramér's V, 0 = none to 1 = total) of 0.1 or more.
          </p>

          <div className="space-y-6">
            {Object.entries(result.correlation_bias).map(([attribute, data]) => (
              <div
                key={attribute}
                className={`rounded-xl border-2 p-5 ${data.is_correlated ? 'bg-red-50' : 'bg-green-50'}`}
                style={{ borderColor: data.is_correlated ? '#EF4444' : '#10B981' }}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-ui text-lg font-semibold text-black sm:text-xl">
                    {attribute.replace(/_/g, ' ')}
                  </h3>
                  <span
                    className="rounded-full px-4 py-2 text-sm text-white"
                    style={{ backgroundColor: data.is_correlated ? '#EF4444' : '#10B981' }}
                  >
                    {data.is_correlated ? 'OUTCOMES DIFFER' : 'NO MEANINGFUL DIFFERENCE'}
                  </span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 font-ui text-xs text-black/60 sm:text-sm">Chi-Square Statistic</p>
                    <p className="font-display text-2xl font-bold text-black">
                      {data.chi2_statistic.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 font-ui text-xs text-black/60 sm:text-sm">P-Value</p>
                    <p
                      className="font-display text-2xl font-bold"
                      style={{ color: data.is_correlated ? '#EF4444' : '#10B981' }}
                    >
                      {formatPValue(data.p_value)}
                    </p>
                  </div>
                </div>

                {data.cramers_v !== undefined && (
                  <p className="mt-4 font-ui text-sm text-black/70">
                    Association strength: <strong className="capitalize">{data.strength}</strong> (Cramér's V ={' '}
                    {data.cramers_v.toFixed(2)})
                    {data.statistically_significant && !data.is_correlated &&
                      ' — statistically significant but too small to flag.'}
                  </p>
                )}
                {data.outcome_rates && (() => {
                  const outcome = focusOutcome(data.outcome_rates);
                  return (
                    <div className="mt-4 space-y-2">
                      <p className="font-ui text-sm font-semibold text-black">Share with outcome "{outcome}" by group</p>
                      {Object.entries(data.outcome_rates)
                        .map(([g, r]) => [g, r[outcome] ?? 0] as const)
                        .sort((a, b) => b[1] - a[1])
                        .map(([g, rate], i) => (
                          <div key={g}>
                            <div className="mb-1 flex justify-between font-ui text-sm">
                              <span className="text-black">{g}</span>
                              <span className="font-semibold text-black/80">{pct(rate)}</span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-[#E3E3E3]">
                              <div className="h-full rounded-full" style={{ width: `${rate * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                            </div>
                          </div>
                        ))}
                    </div>
                  );
                })()}
                {data.low_expected_counts && (
                  <p className="mt-3 font-ui text-xs text-black/60">
                    Some groups are small, so this test is less reliable for {attribute.replace(/_/g, ' ')}.
                  </p>
                )}
                {data.is_correlated && (
                  <div className="mt-4 rounded-lg border-l-4 border-[#EF4444] bg-white p-4">
                    <p className="font-ui text-sm text-black/80">
                      <strong>Warning:</strong> This attribute shows significant correlation with the
                      target variable, which may lead to discriminatory predictions based on{' '}
                      {attribute.replace(/_/g, ' ').toLowerCase()}.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <button
          onClick={() => onNavigate('upload')}
          className="rounded-xl border-2 border-[#3CE6DD] bg-white px-10 py-4 font-ui font-semibold text-[#3CE6DD] transition-colors hover:bg-[#3CE6DD]/10"
        >
          Analyze Another Dataset
        </button>
        <button
          onClick={() => onNavigate('home')}
          className="rounded-xl border-2 border-[#37B1E6] bg-[#3CE6DD] px-10 py-4 font-ui font-semibold text-black transition-colors hover:bg-[#37B1E6]"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
