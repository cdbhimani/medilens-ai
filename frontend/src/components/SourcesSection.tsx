import React from 'react';
import { MedicalKnowledgeCitation } from '../types/report';
import { BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

interface Props {
  sources: MedicalKnowledgeCitation[];
}

export const SourcesSection: React.FC<Props> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-slate-900 text-base">
            Authoritative Medical Knowledge Sources (RAG)
          </h3>
        </div>
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          MedlinePlus & NIH Curated Provenance
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map(src => (
          <div
            key={src.id}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-xs transition"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="font-bold text-slate-900 text-sm">{src.title}</span>
              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="text-teal-700 hover:text-teal-900 flex-shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-slate-600 line-clamp-3 mb-2 leading-relaxed">
              "{src.passage}"
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 pt-1.5">
              <span>{src.publisher}</span>
              <span>Reviewed: {src.publishedOrReviewedDate || 'Current'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
