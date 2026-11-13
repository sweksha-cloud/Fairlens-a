import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { AnalysisResult } from '../App';
import type { Page } from './Navigation';
import { analyzeDataset, previewCsv, type CsvPreview } from '../lib/analyze';

type UploadPageProps = {
  onNavigate: (page: Page) => void;
  onFileAnalyzed: (result: AnalysisResult) => void;
};

const uniq = (a: string[]) => [...new Set(a)];

export default function UploadPage({ onNavigate, onFileAnalyzed }: UploadPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Column configuration (step 2)
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [targetColumn, setTargetColumn] = useState('');
  const [sensitive, setSensitive] = useState<string[]>([]);
  const [numerical, setNumerical] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    setError(null);
    previewCsv(file)
      .then((p) => {
        if (cancelled) return;
        setPreview(p);
        setTargetColumn(p.suggestedTarget);
        setSensitive(p.suggestedSensitive);
        setNumerical(p.suggestedNumeric);
        setShowAll(false);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [file]);

  const acceptFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a .csv file.');
      return;
    }
    setError(null);
    setFile(f);
  };

  const loadSample = async () => {
    setError(null);
    try {
      const res = await fetch('/sample-loans.csv');
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      setFile(new File([blob], 'sample-loans.csv', { type: 'text/csv' }));
    } catch {
      setError('Could not load the sample dataset.');
    }
  };

  const toggle = (list: string[], set: (v: string[]) => void, col: string) =>
    set(list.includes(col) ? list.filter((c) => c !== col) : [...list, col]);

  // Which chips to show: the suggested set (+ anything the user added), or every column.
  const sensitiveOptions = useMemo(() => {
    if (!preview) return [];
    const base = showAll ? preview.columns : uniq([...preview.categoricalColumns, ...sensitive]);
    return base.filter((c) => c !== targetColumn);
  }, [preview, showAll, sensitive, targetColumn]);

  const numericOptions = useMemo(() => {
    if (!preview) return [];
    const base = showAll ? preview.columns : uniq([...preview.suggestedNumeric, ...numerical]);
    return base.filter((c) => c !== targetColumn);
  }, [preview, showAll, numerical, targetColumn]);

  const hiddenCount = preview
    ? preview.columns.length - uniq([...sensitiveOptions, ...numericOptions, targetColumn].filter(Boolean)).length
    : 0;

  const handleAnalyze = async () => {
    if (!file || !targetColumn) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeDataset(file, {
        targetColumn,
        sensitiveAttributes: sensitive.filter((c) => c !== targetColumn),
        numericalFeatures: numerical.filter((c) => c !== targetColumn),
      });
      onFileAnalyzed(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(60,230,221,0.2)]">
        <div className="border-b border-[#E3E3E3] px-6 py-5 sm:px-8">
          <p className="font-ui text-xl font-semibold text-black sm:text-2xl">Analyze a dataset</p>
          <p className="mt-1 font-ui text-sm text-black/60">
            Check whether your data treats groups of people fairly <em>before</em> you train a model on it.
            Your file is only sent to the FairLens API for analysis.
          </p>
        </div>

        {/* Step 1 — file */}
        <div className="px-6 py-8 sm:px-8 sm:py-10">
          <p className="mb-3 font-ui font-semibold text-black">1. Choose a CSV file</p>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              acceptFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-6 rounded-xl border-2 border-dashed p-8 text-center transition-all sm:p-12 ${
              isDragging
                ? 'border-[#3CE6DD] bg-[#3CE6DD]/5'
                : 'border-[#E3E3E3] hover:border-[#3CE6DD]/50 hover:bg-[#3CE6DD]/5'
            }`}
          >
            <div className={`rounded-full p-5 transition-colors ${isDragging ? 'bg-[#3CE6DD]' : 'bg-[#E3E3E3]'}`}>
              <Upload className={`size-10 sm:size-12 ${isDragging ? 'text-white' : 'text-black'}`} />
            </div>
            {file ? (
              <div>
                <p className="mb-2 break-all font-ui text-lg font-semibold text-[#3CE6DD] sm:text-xl">
                  {file.name}
                </p>
                <p className="font-ui text-sm text-black/60 sm:text-base">
                  {preview
                    ? `${preview.rowCount.toLocaleString()} rows · ${preview.columns.length} columns · click to change`
                    : 'Click to change file'}
                </p>
              </div>
            ) : (
              <div>
                <p className="mb-2 font-ui text-lg font-semibold text-black sm:text-xl">
                  Choose or drag a CSV to upload
                </p>
                <p className="font-ui text-sm text-black/60 sm:text-base">.csv files</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => acceptFile(e.target.files?.[0] ?? undefined)}
              className="hidden"
            />
          </div>
          {!file && (
            <p className="mt-3 text-center font-ui text-sm text-black/60">
              No dataset handy?{' '}
              <button type="button" onClick={loadSample} className="font-semibold text-[#37B1E6] hover:underline">
                Try a sample loan-approval dataset
              </button>
            </p>
          )}

          {/* Step 2 — columns */}
          {preview && (
            <div className="mt-8 space-y-6">
              <div>
                <label className="mb-1 block font-ui font-semibold text-black">
                  2. What outcome are you predicting? <span className="text-[#EF4444]">*</span>
                </label>
                <p className="mb-2 font-ui text-sm text-black/60">
                  The column your model would learn to predict, e.g. <em>approved</em>, <em>hired</em> or{' '}
                  <em>reoffended</em>.{preview.suggestedTarget && targetColumn === preview.suggestedTarget && ' We picked a likely one; change it if needed.'}
                </p>
                <select
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  className="w-full rounded-lg border-2 border-[#E3E3E3] bg-white px-3 py-2 font-ui text-black focus:border-[#3CE6DD] focus:outline-none"
                >
                  <option value="">Select a column…</option>
                  {preview.columns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <fieldset>
                <legend className="mb-1 font-ui font-semibold text-black">
                  3. Which columns describe who people are?
                </legend>
                <p className="mb-2 font-ui text-sm text-black/60">
                  Groups that shouldn't affect the outcome, like race, sex or age group. FairLens checks whether
                  each group is fairly represented and whether outcomes differ between groups.
                </p>
                <div className="flex flex-wrap gap-2">
                  {sensitiveOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggle(sensitive, setSensitive, c)}
                      className={`rounded-full border-2 px-3 py-1 font-ui text-sm transition-colors ${
                        sensitive.includes(c)
                          ? 'border-[#3CE6DD] bg-[#3CE6DD]/15 text-black'
                          : 'border-[#E3E3E3] text-black/70 hover:border-[#3CE6DD]/50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                  {sensitiveOptions.length === 0 && (
                    <span className="font-ui text-sm text-black/50">
                      No categorical columns detected — use “show all”.
                    </span>
                  )}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-1 font-ui font-semibold text-black">
                  4. Numeric columns to check <span className="font-normal text-black/50">(optional)</span>
                </legend>
                <p className="mb-2 font-ui text-sm text-black/60">
                  Checked for lopsided distributions (a few extreme values), which can make a model behave
                  badly. Leave them all off to skip this check.
                </p>
                <div className="flex flex-wrap gap-2">
                  {numericOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggle(numerical, setNumerical, c)}
                      className={`rounded-full border-2 px-3 py-1 font-ui text-sm transition-colors ${
                        numerical.includes(c)
                          ? 'border-[#37B1E6] bg-[#37B1E6]/15 text-black'
                          : 'border-[#E3E3E3] text-black/70 hover:border-[#37B1E6]/50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                  {numericOptions.length === 0 && (
                    <span className="font-ui text-sm text-black/50">
                      No numeric columns detected — use “show all”.
                    </span>
                  )}
                </div>
              </fieldset>

              {(hiddenCount > 0 || showAll) && (
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="font-ui text-sm font-semibold text-[#37B1E6] hover:underline"
                >
                  {showAll ? 'Show suggested columns only' : `Show all ${preview.columns.length} columns`}
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border-l-4 border-[#EF4444] bg-red-50 p-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-[#EF4444]" />
              <p className="font-ui text-sm text-black/80">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-[#E3E3E3] px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:gap-4 sm:px-8">
          <button
            onClick={() => {
              setFile(null);
              setError(null);
              onNavigate('home');
            }}
            className="rounded-lg border-2 border-[#3CE6DD] bg-white px-8 py-3 font-ui font-semibold text-[#3CE6DD] transition-colors hover:bg-[#3CE6DD]/10"
          >
            Cancel
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!file || !targetColumn || isAnalyzing}
            className="rounded-lg border-2 border-[#37B1E6] bg-[#3CE6DD] px-8 py-3 font-ui font-semibold text-black transition-colors hover:bg-[#37B1E6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing…' : 'Analyze Dataset'}
          </button>
        </div>
      </div>
    </div>
  );
}
