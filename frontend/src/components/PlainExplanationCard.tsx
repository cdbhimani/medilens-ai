import React from 'react';
import { MeasurementExplanation, EvaluatedMeasurement } from '../types/report';
import { StatusBadge } from './StatusBadge';
import { ExternalLink, Sparkles, BookOpen, AlertCircle, Check } from 'lucide-react';

interface Props {
  measurement: EvaluatedMeasurement;
  explanation?: MeasurementExplanation;
  onVerifyAmbiguity?: (id: string) => void;
}

export const PlainExplanationCard: React.FC<Props> = ({
  measurement,
  explanation,
  onVerifyAmbiguity
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Card Header */}
      <div className="p-4 bg-gradient-to-r from-teal-50/70 to-blue-50/70 border-b border-slate-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-lg">
              {measurement.testName}
            </h3>
          </div>
          <StatusBadge status={measurement.evaluationStatus} />
        </div>
      </div>

      <div className="p-5 space-y-4 text-sm text-slate-700">
        {/* Extracted Facts Section */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-slate-400 block font-medium">Measured Value</span>
            <span className="text-slate-900 font-bold text-sm">
              {measurement.rawValue} {measurement.unit}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Reference Range</span>
            <span className="text-slate-900 font-mono text-sm">
              {measurement.referenceIntervalRaw}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Specimen</span>
            <span className="text-slate-800 text-sm font-medium">
              {measurement.specimenType || 'Blood'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Extraction Confidence</span>
            <span className="text-slate-800 text-sm font-medium">
              {Math.round(measurement.extractionConfidence * 100)}%
            </span>
          </div>
        </div>

        {/* OCR Ambiguity notice if present */}
        {measurement.isAmbiguous && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Extraction Ambiguity Warning:</span>
                <p className="leading-relaxed">
                  {measurement.validationIssues.join(' ')}
                </p>
                {onVerifyAmbiguity && (
                  <button
                    onClick={() => onVerifyAmbiguity(measurement.id)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md text-xs transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Confirm Document Value Matches Paper Report
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Plain-Language Explanation */}
        {explanation ? (
          <div className="space-y-3 pt-1">
            <div>
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wide mb-1 text-teal-800">
                Plain-Language Overview
              </h4>
              <p className="text-slate-800 leading-relaxed text-sm">
                {explanation.plainLanguageSummary}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wide mb-1 text-slate-600">
                What this test measures
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                {explanation.whatItMeasures}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wide mb-1 text-slate-600">
                Factors that can cause variation
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                {explanation.potentialHighLowReasons}
              </p>
            </div>

            {/* Medical Citations next to explanation */}
            {explanation.citations && explanation.citations.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                  Supporting Authoritative Medical Reference
                </span>
                {explanation.citations.map(c => (
                  <div key={c.id} className="bg-slate-50 border border-slate-200 rounded p-2.5 text-xs mb-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-teal-900">{c.title}</span>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 hover:text-teal-900 inline-flex items-center gap-0.5"
                      >
                        Source <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-slate-600 italic">"{c.passage}"</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Publisher: {c.publisher} | Reviewed: {c.publishedOrReviewedDate || 'Current'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-2.5 bg-slate-50 rounded text-[11px] text-slate-500 italic">
              {explanation.limitationsAndContext}
            </div>
          </div>
        ) : (
          <p className="text-slate-500 italic text-sm">
            Select a test from the table to inspect plain-language explanation and clinical context.
          </p>
        )}
      </div>
    </div>
  );
};
