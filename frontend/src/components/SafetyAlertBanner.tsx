import React from 'react';
import { SafetyAlert } from '../types/report';
import { AlertTriangle, AlertOctagon, Info, PhoneCall } from 'lucide-react';

interface Props {
  alerts: SafetyAlert[];
}

export const SafetyAlertBanner: React.FC<Props> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  const criticalOrEmergency = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency' || a.severity === 'urgent');
  const routineAlerts = alerts.filter(a => a.severity === 'info' || a.severity === 'warning');

  return (
    <div className="space-y-3 mb-6">
      {criticalOrEmergency.map((alert, idx) => (
        <div
          key={idx}
          className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 text-rose-950 shadow-sm"
          role="alert"
        >
          <div className="flex items-start gap-3.5">
            {alert.severity === 'emergency' ? (
              <AlertOctagon className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="bg-rose-200/80 text-rose-800 text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded">
                  {alert.severity === 'emergency' ? 'Emergency Alert' : 'Critical Laboratory Alert'}
                </span>
                <span className="text-xs text-rose-700 font-mono">
                  Rule: {alert.ruleId}
                </span>
              </div>
              <h4 className="text-base font-bold text-rose-900 mb-1">{alert.title}</h4>
              <p className="text-rose-800 text-sm mb-2.5 leading-relaxed">{alert.message}</p>
              
              <div className="bg-white/80 border border-rose-200 rounded-lg p-3 text-xs flex items-start gap-2">
                <PhoneCall className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-rose-950 block">Recommended Clinical Action:</span>
                  <p className="text-rose-800">{alert.recommendedAction}</p>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-rose-600">
                Threshold Source: <span className="font-medium">{alert.ruleSource}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {routineAlerts.map((alert, idx) => (
        <div
          key={`routine-${idx}`}
          className="bg-teal-50/50 border border-teal-200 rounded-xl p-3.5 text-teal-950"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold text-teal-900 block mb-0.5">{alert.title}</span>
              <p className="text-teal-800 text-xs leading-relaxed">{alert.message}</p>
              <p className="text-teal-700 text-xs mt-1">
                <span className="font-semibold">Next Step:</span> {alert.recommendedAction}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
