import React from 'react';
import { DoctorConsultationPrep } from '../types/report';
import { MessageSquarePlus, AlertCircle, FileDown, Printer, Stethoscope } from 'lucide-react';
import { getExportUrl } from '../services/api';

interface Props {
  consultation: DoctorConsultationPrep;
  reportId: string;
}

export const DoctorQuestionsCard: React.FC<Props> = ({ consultation, reportId }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-slate-900 text-base">
            Consultation Preparation & Doctor Questions
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={getExportUrl(reportId)}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition"
          >
            <FileDown className="w-3.5 h-3.5 text-teal-700" />
            Download Summary
          </a>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Concise Report Summary */}
        <div>
          <h4 className="text-xs uppercase font-bold tracking-wide text-slate-500 mb-1.5">
            Concise Factual Summary
          </h4>
          <p className="text-slate-800 text-sm leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            {consultation.reportSummaryText}
          </p>
        </div>

        {/* Suggested Questions for Physician */}
        <div>
          <h4 className="text-xs uppercase font-bold tracking-wide text-teal-800 mb-2 flex items-center gap-1.5">
            <MessageSquarePlus className="w-4 h-4 text-teal-600" />
            Suggested Questions to Ask Your Doctor
          </h4>
          <div className="space-y-2">
            {consultation.suggestedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-teal-50/20 text-slate-800 text-xs sm:text-sm"
              >
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Context That May Affect Interpretation */}
        <div>
          <h4 className="text-xs uppercase font-bold tracking-wide text-slate-500 mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Missing Clinical Context Checklist
          </h4>
          <p className="text-xs text-slate-500 mb-2">
            The laboratory document lacked the following context, which often influences laboratory thresholds and clinical interpretation:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {consultation.missingContext.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
