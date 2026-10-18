import React, { useState, useEffect } from 'react';
import { ReportAnalysis, EvaluatedMeasurement } from '../types/report';
import { fetchReportAnalysis } from '../services/api';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { SafetyAlertBanner } from '../components/SafetyAlertBanner';
import { TestResultsTable } from '../components/TestResultsTable';
import { PlainExplanationCard } from '../components/PlainExplanationCard';
import { DoctorQuestionsCard } from '../components/DoctorQuestionsCard';
import { SourcesSection } from '../components/SourcesSection';
import {
  ArrowLeft,
  Calendar,
  Building2,
  Clock,
  Layers,
  Cpu,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';

interface Props {
  reportId: string;
  onNavigate: (tab: string, reportId?: string) => void;
}

export const AnalysisDetailPage: React.FC<Props> = ({ reportId, onNavigate }) => {
  const [analysis, setAnalysis] = useState<ReportAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeasurement, setSelectedMeasurement] = useState<EvaluatedMeasurement | null>(null);
  const [showAuditMetadata, setShowAuditMetadata] = useState(false);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchReportAnalysis(reportId);
        setAnalysis(data);
        if (data.measurements && data.measurements.length > 0) {
          // Select first abnormal test if any, else first test
          const firstAbnormal = data.measurements.find(m => m.evaluationStatus === 'above' || m.evaluationStatus === 'below');
          setSelectedMeasurement(firstAbnormal || data.measurements[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load report analysis.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [reportId]);

  const handleVerifyAmbiguity = (testId: string) => {
    if (!analysis) return;
    setAnalysis(prev => {
      if (!prev) return null;
      return {
        ...prev,
        measurements: prev.measurements.map(m =>
          m.id === testId ? { ...m, isAmbiguous: false, userVerified: true } : m
        )
      };
    });
    alert('Thank you. Ambiguity marker verified against original report.');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-600">Loading analysis and retrieving grounded clinical sources...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error || 'Report analysis could not be loaded.'}</span>
        </div>
      </div>
    );
  }

  const selectedExplanation = analysis.explanations.find(e => e.testName === selectedMeasurement?.testName);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Navigation & Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports Dashboard
        </button>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setShowAuditMetadata(!showAuditMetadata)}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>{showAuditMetadata ? 'Hide Audit Log' : 'View Workflow Audit'}</span>
          </button>
        </div>
      </div>

      {/* Report Identification Title Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {analysis.labName || 'Medical Laboratory Analysis'}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                ID: {analysis.reportId}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Report Date: <strong className="text-slate-700 font-semibold">{analysis.reportDate || 'Not specified'}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Source File: <span className="font-mono text-slate-700">{analysis.processingMetadata.fileName}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                Model: <span className="text-slate-700 font-medium">{analysis.processingMetadata.modelUsed}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Tests</span>
              <span className="text-lg font-extrabold text-slate-900">{analysis.measurements.length}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Flagged</span>
              <span className="text-lg font-extrabold text-amber-700">
                {analysis.measurements.filter(m => m.evaluationStatus === 'above' || m.evaluationStatus === 'below').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Metadata Drawer */}
      {showAuditMetadata && (
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 shadow-sm text-xs space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-teal-400">Agentic Workflow Audit Metadata</span>
            <span className="text-slate-400">Execution Duration: {analysis.processingMetadata.totalDurationMs} ms</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1 text-[11px] uppercase">Completed Logical Stages:</span>
            <ul className="space-y-1 list-disc list-inside text-slate-300">
              {analysis.processingMetadata.stagesCompleted.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Document Type: {analysis.processingMetadata.isScannedOrDigital} • Fallback Active: {String(analysis.processingMetadata.usedFallback)}
          </div>
        </div>
      )}

      {/* Safety Alerts (Critical Alerts & Non-reassurance Notice) */}
      <SafetyAlertBanner alerts={analysis.safetyAlerts} />

      {/* Main Analysis Grid: Table + Detail Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Test Results Table (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <TestResultsTable
            measurements={analysis.measurements}
            selectedTestId={selectedMeasurement?.id || null}
            onSelectTest={m => setSelectedMeasurement(m)}
            onVerifyAmbiguity={handleVerifyAmbiguity}
          />
        </div>

        {/* Right Column: Interactive Plain Explanation Card (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 space-y-6">
          {selectedMeasurement ? (
            <PlainExplanationCard
              measurement={selectedMeasurement}
              explanation={selectedExplanation}
              onVerifyAmbiguity={handleVerifyAmbiguity}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Select any test result from the table to view plain explanation.
            </div>
          )}
        </div>
      </div>

      {/* Doctor Consultation Preparation Card */}
      <DoctorQuestionsCard
        consultation={analysis.consultationPrep}
        reportId={analysis.reportId}
      />

      {/* Authoritative Medical Sources Section */}
      <SourcesSection sources={analysis.sourceKnowledgeDocuments} />

      {/* Educational Medical Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
};
