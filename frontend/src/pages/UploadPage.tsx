import React, { useState, useRef } from 'react';
import { uploadReport, loadDemoReport } from '../services/api';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  UploadCloud,
  FileCheck,
  X,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, reportId?: string) => void;
}

const STAGES = [
  'Stage 1: Document Intake & Format Validation',
  'Stage 2: Gemini Multimodal Data Extraction',
  'Stage 3: Validation Agent & OCR Ambiguity Detection',
  'Stage 4: Deterministic Reference Range Evaluation',
  'Stage 5: MedlinePlus & NIH Medical Evidence Retrieval (RAG)',
  'Stage 6: Grounded Plain-Language Explanation Generation',
  'Stage 7: Clinical Safety Triage & Panic Threshold Escalation',
  'Stage 8: Doctor Consultation Question Synthesis',
  'Stage 9: Report Assembly & Audit Serialization'
];

export const UploadPage: React.FC<Props> = ({ onNavigate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [fasting, setFasting] = useState<string>('unspecified');

  const [uploading, setUploading] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleQuickSample = async () => {
    try {
      setLoadingSample(true);
      setError(null);
      const res = await loadDemoReport('demo-cbc-standard');
      onNavigate('detail', res.reportId);
    } catch (err: any) {
      setError('Failed to load sample report: ' + err.message);
    } finally {
      setLoadingSample(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      const validExts = ['pdf', 'jpg', 'jpeg', 'png'];
      const ext = selected.name.split('.').pop()?.toLowerCase();

      if (!validTypes.includes(selected.type) && (!ext || !validExts.includes(ext))) {
        setError('Unsupported file type. Please upload a PDF, JPG, or PNG document.');
        return;
      }

      if (selected.size > 15 * 1024 * 1024) {
        setError('File size exceeds 15MB limit.');
        return;
      }

      setFile(selected);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a report file to upload.');
      return;
    }

    if (!consent) {
      setError('Explicit user consent is required before processing sensitive medical documents.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Simulate progress stages visually while API call processes
      const stageInterval = setInterval(() => {
        setCurrentStageIdx(prev => (prev < STAGES.length - 1 ? prev + 1 : prev));
      }, 550);

      const patientContext = {
        age: age ? Number(age) : undefined,
        gender: gender || undefined,
        fasting: fasting === 'yes' ? true : fasting === 'no' ? false : undefined
      };

      const res = await uploadReport(file, consent, patientContext);
      clearInterval(stageInterval);

      onNavigate('detail', res.reportId);
    } catch (err: any) {
      setError(err.message || 'Failed to upload and analyze report.');
    } finally {
      setUploading(false);
      setCurrentStageIdx(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upload Laboratory Report</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Submit your blood test, metabolic panel, or laboratory results document for AI-assisted understanding.
        </p>
      </div>

      <DisclaimerBanner compact />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1-Click Sample Report Quick Test Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-3 text-amber-950">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-amber-600 fill-amber-500" />
          </div>
          <div>
            <strong className="block text-slate-900 font-bold text-sm">Want to test right now without a file?</strong>
            <span className="text-amber-900">
              Run the full 9-stage analysis instantly on a pre-loaded synthetic Complete Blood Count (CBC) report.
            </span>
          </div>
        </div>
        <button
          type="button"
          disabled={uploading || loadingSample}
          onClick={handleQuickSample}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50 whitespace-nowrap"
        >
          {loadingSample ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Running Analysis...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white" />
              <span>Test with Sample Report (1-Click)</span>
            </>
          )}
        </button>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Dropzone / File Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
            Select Document File (PDF, JPG, JPEG, PNG — max 15MB)
          </label>

          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50/20 rounded-2xl p-8 text-center cursor-pointer transition space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  Click to browse or drag and drop your report here
                </p>
                <p className="text-xs text-slate-400">
                  Supports multi-page digital lab PDFs, scanned pages, and high-resolution mobile photos
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{file.name}</h4>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'application/pdf'}
                  </p>
                </div>
              </div>

              {!uploading && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Optional Clinical Context Inputs */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Optional Context for Contextual Interpretation
            </h4>
            <span className="text-[11px] text-slate-400">Optional</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Patient Age</label>
              <input
                type="number"
                placeholder="e.g. 42"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Biological Sex</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="">Select (Optional)</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other / Not Specified</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fasting Status</label>
              <select
                value={fasting}
                onChange={e => setFasting(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="unspecified">Unspecified / Unknown</option>
                <option value="yes">Fasting (8+ hours)</option>
                <option value="no">Non-Fasting</option>
              </select>
            </div>
          </div>
        </div>

        {/* Explicit Consent Checkbox */}
        <div className="border-t border-slate-100 pt-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
            />
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-900 block mb-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Explicit Medical Record Processing Consent
              </span>
              I consent to the processing of this laboratory document by MediLens AI solely for educational review and consultation preparation. I understand this service does not provide medical diagnoses or replace a qualified healthcare professional.
            </div>
          </label>
        </div>

        {/* Upload & Run Pipeline Button */}
        <div>
          <button
            type="submit"
            disabled={!file || !consent || uploading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running 9-Stage AI Workflow...</span>
              </>
            ) : (
              <>
                <span>Process & Analyze Report</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Real-time Agentic Pipeline Progress Display */}
      {uploading && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-teal-400">Agentic Orchestration Pipeline</h3>
            <span className="text-xs text-slate-400 font-mono">
              Stage {currentStageIdx + 1} of {STAGES.length}
            </span>
          </div>

          <div className="space-y-2">
            {STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 text-xs transition-colors ${
                    isPast
                      ? 'text-emerald-400 font-medium'
                      : isCurrent
                      ? 'text-teal-300 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700" />
                  )}
                  <span>{stage}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
