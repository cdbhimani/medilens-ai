import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact }) => {
  return (
    <div className={`bg-teal-50/90 border border-teal-200 text-teal-950 rounded-xl ${compact ? 'p-3 text-xs' : 'p-4 text-sm'} shadow-sm`}>
      <div className="flex items-start gap-3">
        <ShieldAlert className={`${compact ? 'w-4 h-4 mt-0.5' : 'w-5 h-5 mt-0.5'} text-teal-700 flex-shrink-0`} />
        <div>
          <span className="font-semibold text-teal-900 block mb-0.5">Educational Medical Disclaimer</span>
          <p className="text-teal-800 leading-relaxed">
            MediLens AI provides educational information to help you understand medical reports. It does not diagnose conditions, replace a qualified healthcare professional, or recommend treatment. Laboratory reference ranges and results must be interpreted in clinical context. Contact your healthcare professional for advice about your results.
          </p>
        </div>
      </div>
    </div>
  );
};
