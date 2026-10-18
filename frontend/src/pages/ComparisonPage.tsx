import React, { useState, useEffect } from 'react';
import { ReportSummaryItem, HistoricalComparisonItem } from '../types/report';
import { fetchReports, compareReports } from '../services/api';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  History,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Loader2,
  Calendar,
  Layers
} from 'lucide-react';

export const ComparisonPage: React.FC = () => {
  const [reports, setReports] = useState<ReportSummaryItem[]>([]);
  const [earlierReportId, setEarlierReportId] = useState<string>('');
  const [newerReportId, setNewerReportId] = useState<string>('');
  const [comparisons, setComparisons] = useState<HistoricalComparisonItem[]>([]);
  const [earlierDate, setEarlierDate] = useState<string>('');
  const [newerDate, setNewerDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingList, setFetchingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports()
      .then(list => {
        setReports(list);
        if (list.length >= 2) {
          // Default: earlier = 2nd report, newer = 1st report
          setEarlierReportId(list[1].reportId);
          setNewerReportId(list[0].reportId);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setFetchingList(false));
  }, []);

  const handleCompare = async () => {
    if (!earlierReportId || !newerReportId) {
      setError('Please select both an earlier and a newer report to compare.');
      return;
    }

    if (earlierReportId === newerReportId) {
      setError('Please select two distinct reports to compare.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await compareReports(earlierReportId, newerReportId);
      setComparisons(res.comparisons);
      setEarlierDate(res.earlierDate);
      setNewerDate(res.newerDate);
    } catch (err: any) {
      setError(err.message || 'Failed to compare reports.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-teal-600" />
          Historical Report Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track numerical changes between laboratory visits with verified unit conversions and clinically neutral trend descriptions.
        </p>
      </div>

      <DisclaimerBanner compact />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Selector Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
          Select Reports for Comparison
        </h3>

        {fetchingList ? (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            Loading previous reports...
          </div>
        ) : reports.length < 2 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            You need at least two uploaded reports to perform historical comparisons. Tip: Try loading the synthetic historical baseline and follow-up demo reports from the dashboard!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Baseline (Earlier Report)
              </label>
              <select
                value={earlierReportId}
                onChange={e => setEarlierReportId(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
              >
                {reports.map(r => (
                  <option key={`earlier-${r.reportId}`} value={r.reportId}>
                    {r.reportDate || r.createdAt.split('T')[0]} — {r.labName || r.fileName} ({r.testCount} tests)
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1 flex items-center justify-center pb-2">
              <ArrowRight className="w-5 h-5 text-slate-400 hidden md:block" />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Follow-up (Newer Report)
              </label>
              <select
                value={newerReportId}
                onChange={e => setNewerReportId(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
              >
                {reports.map(r => (
                  <option key={`newer-${r.reportId}`} value={r.reportId}>
                    {r.reportDate || r.createdAt.split('T')[0]} — {r.labName || r.fileName} ({r.testCount} tests)
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleCompare}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <History className="w-4 h-4" />}
                Compare
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {comparisons.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Matched Biomarker Comparisons</h3>
              <p className="text-xs text-slate-500">
                Comparing Baseline ({earlierDate}) with Follow-up ({newerDate})
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
              {comparisons.length} Comparable Tests Matched
            </span>
          </div>

          <div className="p-4 divide-y divide-slate-100">
            {comparisons.map((c, idx) => {
              const hasChange = c.absoluteChange !== null && c.absoluteChange !== 0;
              const isIncrease = c.absoluteChange !== null && c.absoluteChange > 0;
              const isDecrease = c.absoluteChange !== null && c.absoluteChange < 0;

              return (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm">{c.testName}</span>

                    <div className="flex items-center gap-3 text-xs">
                      {/* Earlier Value */}
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">
                        {earlierDate}: <strong>{c.earlierValue} {c.earlierUnit}</strong>
                      </span>

                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

                      {/* Newer Value */}
                      <span className="bg-slate-100 text-slate-900 px-2 py-1 rounded font-semibold">
                        {newerDate}: <strong>{c.newerValue} {c.newerUnit}</strong>
                      </span>

                      {/* Delta Tag */}
                      {c.isComparable && hasChange && (
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded ${
                            isIncrease
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-sky-100 text-sky-900'
                          }`}
                        >
                          {isIncrease ? <TrendingUp className="w-3 h-3 text-amber-700" /> : <TrendingDown className="w-3 h-3 text-sky-700" />}
                          {isIncrease ? '+' : ''}{c.absoluteChange} {c.normalizedUnit} ({c.percentChange}%)
                        </span>
                      )}

                      {c.isComparable && !hasChange && (
                        <span className="inline-flex items-center gap-1 font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          <Minus className="w-3 h-3" />
                          0.0 {c.normalizedUnit} (No Change)
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    {c.trendDescription}
                  </p>

                  {c.comparabilityNote && c.comparabilityNote !== 'Units match directly.' && (
                    <p className="text-[11px] text-teal-800 italic">
                      Note: {c.comparabilityNote}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
            <strong>Important Clinical Reminder:</strong> Laboratory trends alone do not infer whether an underlying health condition has improved or worsened. Many physiological, dietary, and laboratory variables influence numbers over time. Always discuss longitudinal trends directly with your qualified doctor.
          </div>
        </div>
      )}
    </div>
  );
};
