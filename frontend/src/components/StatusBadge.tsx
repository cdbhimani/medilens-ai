import React from 'react';
import { EvaluationStatus } from '../types/report';
import { CheckCircle2, ArrowDownCircle, ArrowUpCircle, HelpCircle } from 'lucide-react';

interface Props {
  status: EvaluationStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const iconClass = isSm ? 'w-3.5 h-3.5' : 'w-4 h-4';

  switch (status) {
    case 'within':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${isSm ? 'text-xs' : 'text-sm'} bg-emerald-50 text-emerald-800 border border-emerald-200`}>
          <CheckCircle2 className={`${iconClass} text-emerald-600`} />
          Within Range
        </span>
      );
    case 'below':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${isSm ? 'text-xs' : 'text-sm'} bg-sky-50 text-sky-800 border border-sky-200`}>
          <ArrowDownCircle className={`${iconClass} text-sky-600`} />
          Below Range
        </span>
      );
    case 'above':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${isSm ? 'text-xs' : 'text-sm'} bg-amber-50 text-amber-900 border border-amber-200`}>
          <ArrowUpCircle className={`${iconClass} text-amber-700`} />
          Above Range
        </span>
      );
    case 'indeterminate':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${isSm ? 'text-xs' : 'text-sm'} bg-slate-100 text-slate-700 border border-slate-200`}>
          <HelpCircle className={`${iconClass} text-slate-500`} />
          Indeterminate
        </span>
      );
  }
};
