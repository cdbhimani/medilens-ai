import React from 'react';
import { EvaluatedMeasurement } from '../types/report';
import { StatusBadge } from './StatusBadge';
import { AlertCircle, HelpCircle, FileText } from 'lucide-react';

interface Props {
  measurements: EvaluatedMeasurement[];
  selectedTestId: string | null;
  onSelectTest: (measurement: EvaluatedMeasurement) => void;
  onVerifyAmbiguity?: (testId: string) => void;
}

export const TestResultsTable: React.FC<Props> = ({
  measurements,
  selectedTestId,
  onSelectTest,
  onVerifyAmbiguity
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-slate-900 text-base">Extracted Test Results</h3>
          <p className="text-xs text-slate-500">
            Direct laboratory facts extracted from document. Click any row to view plain-language explanation.
          </p>
        </div>
        <span className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
          {measurements.length} Biomarkers Extracted
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/70 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Test Name</th>
              <th className="py-3 px-3">Measured Value</th>
              <th className="py-3 px-3">Laboratory Reference Range</th>
              <th className="py-3 px-3">Evaluation Status</th>
              <th className="py-3 px-3 text-center">Source Snippet</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {measurements.map(m => {
              const isSelected = selectedTestId === m.id;
              return (
                <tr
                  key={m.id}
                  onClick={() => onSelectTest(m)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-teal-50/70 border-l-4 border-teal-600' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{m.testName}</span>
                      {m.isAmbiguous && (
                        <span
                          title={m.validationIssues.join('; ')}
                          className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded"
                        >
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Verify OCR
                        </span>
                      )}
                      {m.labAbnormalFlag && (
                        <span className="text-[11px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                          Lab: {m.labAbnormalFlag}
                        </span>
                      )}
                    </div>
                    {m.comments && (
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5">{m.comments}</p>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-slate-900">
                      {m.rawValue}
                    </span>{' '}
                    <span className="text-slate-500 text-xs">{m.unit}</span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-700 font-mono text-xs">
                    {m.referenceIntervalRaw || 'Not provided'}
                  </td>

                  <td className="py-3.5 px-3">
                    <StatusBadge status={m.evaluationStatus} size="sm" />
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {m.sourceLocationSnippet ? (
                      <span
                        title={m.sourceLocationSnippet}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-700"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Page {m.sourcePage}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTest(m);
                      }}
                      className="text-xs font-medium text-teal-700 hover:text-teal-900 hover:underline inline-flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Explain
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
