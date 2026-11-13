import { useState } from 'react';
import Navigation, { type Page } from './components/Navigation';
import HomePage from './components/HomePage';
import UploadPage from './components/UploadPage';
import AnalysisPage from './components/AnalysisPage';
import AboutPage from './components/AboutPage';

export type AnalysisResult = {
  fileName: string;
  totalRows?: number;
  skewness_analysis: {
    [feature: string]: {
      skewness: number;
      interpretation: string;
    };
  };
  class_imbalance: {
    class_counts: { [key: string]: number };
    class_proportions: { [key: string]: number };
    imbalance_ratio: number;
  };
  representation_bias: {
    [attribute: string]: {
      counts: { [key: string]: number };
      proportions: { [key: string]: number };
      representation_ratio: number;
      underrepresented_groups?: { [group: string]: number };
    };
  };
  correlation_bias: {
    [attribute: string]: {
      chi2_statistic: number;
      p_value: number;
      is_correlated: boolean;
      cramers_v?: number;
      strength?: string;
      statistically_significant?: boolean;
      low_expected_counts?: boolean;
      /** Share of each outcome within each group, e.g. { "Group A": { "1": 0.8, "0": 0.2 } }. */
      outcome_rates?: { [group: string]: { [outcome: string]: number } };
      max_rate_gap?: number;
    };
  };
  detected_issues: string[];
  notes?: string[];
  summary: {
    total_issues_detected: number;
    bias_severity: string;
  };
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleFileAnalyzed = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentPage('analysis');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>
        {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}

        {currentPage === 'upload' && (
          <UploadPage onNavigate={setCurrentPage} onFileAnalyzed={handleFileAnalyzed} />
        )}

        {currentPage === 'about' && <AboutPage onNavigate={setCurrentPage} />}

        {currentPage === 'analysis' &&
          (analysisResult ? (
            <AnalysisPage onNavigate={setCurrentPage} result={analysisResult} />
          ) : (
            <div className="mx-auto max-w-2xl px-4 py-24 text-center">
              <h1 className="font-display text-3xl font-bold sm:text-4xl">No analysis yet</h1>
              <p className="mt-4 font-body text-lg text-white/80">
                Upload a dataset to generate a bias report.
              </p>
              <button
                onClick={() => setCurrentPage('upload')}
                className="mt-8 rounded-xl bg-[#3CE6DD] px-8 py-4 font-display font-bold text-black transition-colors hover:bg-[#37B1E6]"
              >
                Go to Upload
              </button>
            </div>
          ))}
      </main>
    </div>
  );
}