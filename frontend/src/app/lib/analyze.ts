import { environment } from '../config';
import type { AnalysisResult } from '../App';

/** Minimal CSV row splitter — handles commas inside double-quoted fields. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export type CsvPreview = {
  /** Every column in the file. */
  columns: string[];
  /** Numeric columns that look like real measurements (not identifiers). Pre-checked. */
  suggestedNumeric: string[];
  /** Low-cardinality categorical columns — the sensible sensitive-attribute candidates. */
  categoricalColumns: string[];
  rowCount: number;
};

/** Column name looks like an identifier, key, or boolean flag — not a measurement. */
function looksLikeId(name: string): boolean {
  return (
    /(^|[_\s-])(id|uuid|guid|pk|index|idx)([_\s-]|$)/i.test(name) ||
    /id$/i.test(name) ||
    /^(is|has|flag)[_\sA-Z]/i.test(name)
  );
}

/** Column name looks like a person identifier / timestamp — not a group category. */
function looksLikePii(name: string): boolean {
  return /(name|date|dob|birth|timestamp|_dt$|_ts$|email|phone|address|ssn|zip)/i.test(name);
}

/** Read headers + profile columns from a sample of the file, client-side. */
export async function previewCsv(file: File): Promise<CsvPreview> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) throw new Error('CSV needs a header row and at least one data row.');

  const columns = splitCsvLine(lines[0]);
  const sample = lines.slice(1, 201).map(splitCsvLine); // up to 200 rows

  const suggestedNumeric: string[] = [];
  const categoricalColumns: string[] = [];

  columns.forEach((name, idx) => {
    const vals = sample.map((r) => r[idx]).filter((v) => v !== undefined && v !== '');
    if (vals.length === 0) return;

    const isNumeric = vals.every((v) => Number.isFinite(Number(v)));
    const uniqueRatio = new Set(vals).size / vals.length;

    if (isNumeric) {
      // A measurement, not an identifier: not ID-named and not near-unique.
      if (!looksLikeId(name) && uniqueRatio < 0.9) suggestedNumeric.push(name);
    } else {
      // A usable group category: few distinct values, not a name/timestamp.
      if (uniqueRatio < 0.5 && !looksLikePii(name)) categoricalColumns.push(name);
    }
  });

  return { columns, suggestedNumeric, categoricalColumns, rowCount: lines.length - 1 };
}

export type AnalyzeParams = {
  targetColumn: string;
  sensitiveAttributes: string[];
  numericalFeatures: string[];
};

type ApiResponse = {
  status: string;
  dataset_info: { rows: number; columns: number; column_names: string[] };
  bias_report: Omit<AnalysisResult, 'fileName' | 'totalRows'>;
};

/** POST the file + params to the backend and map the response to AnalysisResult. */
export async function analyzeDataset(file: File, params: AnalyzeParams): Promise<AnalysisResult> {
  const form = new FormData();
  form.append('file', file);
  form.append('target_column', params.targetColumn);
  if (params.sensitiveAttributes.length)
    form.append('sensitive_attributes', params.sensitiveAttributes.join(','));
  if (params.numericalFeatures.length)
    form.append('numerical_features', params.numericalFeatures.join(','));

  let res: Response;
  try {
    res = await fetch(`${environment.backendUrl}/analyze-bias-csv`, { method: 'POST', body: form });
  } catch {
    throw new Error(
      `Could not reach the API at ${environment.backendUrl}. Is the backend running?`,
    );
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = String(body.detail);
    } catch {
      /* keep default */
    }
    throw new Error(detail);
  }

  const json = (await res.json()) as ApiResponse;
  return {
    fileName: file.name,
    totalRows: json.dataset_info?.rows,
    ...json.bias_report,
  };
}
