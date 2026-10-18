import React, { useState } from 'react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { DemoSelector } from '../components/DemoSelector';
import { Activity, ShieldCheck, ArrowRight, UploadCloud, Stethoscope, Search, Layers, Clock, AlertTriangle, Zap, Loader2 } from 'lucide-react';
import { loadDemoReport } from '../services/api';

interface Props {
  onNavigate: (tab: string, reportId?: string) => void;
}

export const LandingPage: React.FC<Props> = ({ onNavigate }) => {
  const [loadingSample, setLoadingSample] = useState(false);

  const handleQuickSample = async () => {
    try {
      setLoadingSample(true);
      const res = await loadDemoReport('demo-cbc-standard');
      onNavigate('detail', res.reportId);
    } catch (err: any) {
      alert('Failed to load sample report: ' + err.message);
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-5 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Activity className="w-4 h-4 text-teal-600" />
          <span>Safety-Grounded Agentic Medical Intelligence</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Understand your medical reports.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600">
            Prepare for better conversations.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          MediLens AI extracts complex laboratory biomarkers, evaluates values against stated reference ranges deterministically, grounds plain-language explanations in authoritative MedlinePlus evidence, and generates focused questions for your doctor visit.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleQuickSample}
            disabled={loadingSample}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition disabled:opacity-50"
          >
            {loadingSample ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading Sample Report...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Quick Test with Sample Report</span>
              </>
            )}
          </button>

          <button
            onClick={() => onNavigate('upload')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 transition"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Your Lab Report
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
          >
            View Dashboard
          </button>
        </div>
      </section>

      {/* Safety Disclaimer Banner */}
      <div className="max-w-5xl mx-auto px-4">
        <DisclaimerBanner />
      </div>

      {/* Evaluator Demo Mode Box */}
      <div className="max-w-5xl mx-auto px-4">
        <DemoSelector onReportLoaded={(repId) => onNavigate('detail', repId)} />
      </div>

      {/* 3 Core Value Pillars */}
      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">9-Stage Agentic Workflow</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Deterministic reference-range comparisons, OCR ambiguity flagging, and schema validation keep raw laboratory facts distinct from AI explanations.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Grounded RAG Retrieval</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Every biomarker explanation cites curated medical literature from MedlinePlus (U.S. National Library of Medicine) and NIH without hallucinating citations.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Clinical Safety Triage</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Versioned clinician-reviewed rules identify critical acute thresholds (e.g. severe electrolyte or cardiac anomalies) with conservative escalation advice.
          </p>
        </div>
      </section>

      {/* Privacy and Consent Notice */}
      <section className="max-w-4xl mx-auto px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Patient Privacy & Consent Architecture</span>
        </div>
        <p className="leading-relaxed max-w-2xl mx-auto">
          Documents require explicit user consent before intake. Processing uses user-isolated records, private storage access controls, and allows one-click deletion of all report data at any time.
        </p>
      </section>
    </div>
  );
};
