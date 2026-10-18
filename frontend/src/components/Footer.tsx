import React from 'react';
import { Activity, ShieldCheck, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-800">MediLens AI</span>
            <span>— Educational Medical Report Understanding Assistant</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1 text-slate-600">
              <Cpu className="w-3.5 h-3.5 text-sky-600" />
              Powered by Google Gemini & GenAI SDK
            </span>
            <span className="inline-flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Grounded in MedlinePlus & NIH Knowledge
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center leading-relaxed">
          MediLens AI provides educational information to help you understand medical reports. It does not diagnose conditions, replace a qualified healthcare professional, or recommend treatment. Laboratory reference ranges and results must be interpreted in clinical context.
        </div>
      </div>
    </footer>
  );
};
