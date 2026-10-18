import React, { useState, useEffect } from 'react';
import { DemoReportSummary } from '../types/report';
import { fetchDemoReports, loadDemoReport } from '../services/api';
import { PlayCircle, Sparkles, Loader2, Info } from 'lucide-react';

interface Props {
  onReportLoaded: (reportId: string) => void;
}

export const DemoSelector: React.FC<Props> = ({ onReportLoaded }) => {
  const [demos, setDemos] = useState<DemoReportSummary[]>([]);
  const [loadingDemoId, setLoadingDemoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDemoReports()
      .then(setDemos)
      .catch(err => setError(err.message));
  }, []);

  const handleSelectDemo = async (demoId: string) => {
    try {
      setLoadingDemoId(demoId);
      setError(null);
      const res = await loadDemoReport(demoId);
      onReportLoaded(res.reportId);
    } catch (err: any) {
      setError(err.message || 'Failed to load demo.');
    } finally {
      setLoadingDemoId(null);
    }
  };

  return (
    <div className="bg-gradient-to-r from-teal-50 via-white to-blue-50 border border-teal-200/80 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-base">
            Evaluator Demo Mode: Test with Synthetic Reports
          </h3>
        </div>
        <span className="text-xs bg-teal-100 text-teal-800 font-semibold px-2.5 py-0.5 rounded-full">
          100% Synthetic Data — No Real PHI
        </span>
      </div>

      <p className="text-xs text-slate-600 mb-4 leading-relaxed">
        Select any synthetic scenario below to instantly run the 9-stage agentic pipeline and inspect how MediLens AI extracts data, evaluates ranges, flags ambiguities, checks critical thresholds, and generates grounded doctor consultation questions:
      </p>

      {error && (
        <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg mb-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {demos.map(d => {
          const isLoading = loadingDemoId === d.id;
          return (
            <div
              key={d.id}
              className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-teal-400 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-semibold text-slate-900 text-xs line-clamp-1">{d.name}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {d.category}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] line-clamp-2 mb-3 leading-relaxed">
                  {d.description}
                </p>
              </div>

              <button
                type="button"
                disabled={isLoading || loadingDemoId !== null}
                onClick={() => handleSelectDemo(d.id)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-700 text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Running 9 Stages...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-3.5 h-3.5" />
                    Load & Analyze Demo
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
