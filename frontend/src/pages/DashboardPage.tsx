import React, { useState, useEffect } from 'react';
import { ReportSummaryItem } from '../types/report';
import { fetchReports, deleteReport } from '../services/api';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { DemoSelector } from '../components/DemoSelector';
import {
  FileText,
  UploadCloud,
  History,
  Trash2,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, reportId?: string) => void;
}

export const DashboardPage: React.FC<Props> = ({ onNavigate }) => {
  const [reports, setReports] = useState<ReportSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchReports();
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this report and its extracted records?')) {
      return;
    }

    try {
      setDeletingId(reportId);
      await deleteReport(reportId);
      setReports(prev => prev.filter(r => r.reportId !== reportId));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Medical Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View extracted measurements, review clinical safety triage, and prepare for doctor visits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh reports"
            className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('upload')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-semibold text-xs rounded-lg shadow-sm transition"
          >
            <UploadCloud className="w-4 h-4" />
            Upload New Report
          </button>
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading your medical reports...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-white border border-rose-300 rounded font-medium text-rose-800 hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Report List */}
      {!loading && !error && reports.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {reports.map(r => (
              <div
                key={r.reportId}
                onClick={() => onNavigate('detail', r.reportId)}
                className="bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md rounded-xl p-4 sm:p-5 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {r.labName || 'Medical Laboratory Report'}
                      </h3>
                      {r.criticalCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Critical Alert
                        </span>
                      )}
                      {r.hasAmbiguities && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          OCR Notice
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span>Report Date: <strong className="text-slate-700">{r.reportDate || 'Not specified'}</strong></span>
                      <span>•</span>
                      <span>File: <span className="font-mono">{r.fileName}</span></span>
                      <span>•</span>
                      <span>Analyzed: {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                        {r.testCount} Tests Extracted
                      </span>
                      {r.abnormalCount > 0 ? (
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 font-medium px-2 py-0.5 rounded">
                          {r.abnormalCount} Out-of-Range
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          All Within Lab Ranges
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={(e) => handleDelete(e, r.reportId)}
                    disabled={deletingId === r.reportId}
                    title="Delete report and records"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 rounded-lg transition">
                    <span>View Analysis</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {reports.length >= 2 && (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-sky-900 font-medium">
                You have {reports.length} reports available for historical longitudinal trend analysis.
              </span>
              <button
                onClick={() => onNavigate('compare')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg"
              >
                <History className="w-3.5 h-3.5" />
                Compare Across Dates
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && reports.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-slate-900 text-base">No Medical Reports Uploaded Yet</h3>
            <p className="text-xs text-slate-500">
              Upload your medical laboratory document (PDF or Image) or select one of the pre-configured synthetic demo cases below.
            </p>
          </div>
          <button
            onClick={() => onNavigate('upload')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Report Now
          </button>
        </div>
      )}

      {/* Evaluator Demo Mode Selector is always accessible on the dashboard */}
      <DemoSelector onReportLoaded={(repId) => onNavigate('detail', repId)} />
    </div>
  );
};
