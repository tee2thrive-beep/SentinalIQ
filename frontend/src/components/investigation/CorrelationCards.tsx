import React from 'react';
import { Correlation } from '../../types';
import { Network, Link2, CheckCircle2 } from 'lucide-react';

interface CorrelationCardsProps {
  correlations: Correlation[];
}

export const CorrelationCards: React.FC<CorrelationCardsProps> = ({ correlations }) => {
  if (!correlations || correlations.length === 0) {
    return (
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 text-center text-slate-400 font-mono text-xs">
        *Singleton Incident: No multi-alert correlation pairs detected.*
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 space-y-4">
      <div className="flex items-center space-x-2 border-b border-[#1f293d] pb-3">
        <Network className="w-5 h-5 text-blue-400" />
        <h2 className="text-base font-bold text-slate-100 tracking-wide">Multi-Signal Alert Correlation Evidence ({correlations.length} Pairs)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {correlations.map((corr) => (
          <div key={corr.correlation_id} className="p-4 bg-[#0f172a] border border-[#1f293d] rounded-xl space-y-3">
            <div className="flex items-center justify-between font-mono text-xs border-b border-[#1f293d] pb-2">
              <div className="flex items-center space-x-2">
                <Link2 className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-blue-300">{corr.alert_id_1}</span>
                <span className="text-slate-500">↔</span>
                <span className="font-bold text-blue-300">{corr.alert_id_2}</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded font-bold">
                Score: {corr.correlation_score.toFixed(1)}
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Matched Signals:</span>
              <div className="flex flex-wrap gap-1.5">
                {corr.signals?.map((sig, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    {sig.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-xs font-mono text-slate-300 bg-[#111827] p-2.5 rounded-lg border border-[#1f293d]/60">
              <span className="text-slate-400 font-semibold">Evidence Summary:</span>
              <p className="mt-1 text-slate-200 text-[11px]">{corr.evidence_summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
