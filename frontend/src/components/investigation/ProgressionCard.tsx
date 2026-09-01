import React from 'react';
import { TimelineEvent } from '../../types';
import { GitCommit, ArrowRight, ShieldCheck } from 'lucide-react';

interface ProgressionCardProps {
  incidentType: string;
  timeline: TimelineEvent[];
}

export const ProgressionCard: React.FC<ProgressionCardProps> = ({ incidentType, timeline }) => {
  const ALL_STAGES = [
    { key: 'Initial Access', label: 'Initial Access' },
    { key: 'Execution', label: 'Execution' },
    { key: 'Persistence', label: 'Persistence / Priv Esc' },
    { key: 'Lateral Movement', label: 'Lateral Movement' },
    { key: 'Collection', label: 'Collection / Access' },
    { key: 'Exfiltration', label: 'Exfiltration / Impact' }
  ];

  // Determine active stages based on alert categories/types in timeline
  const alertText = timeline.map(t => `${t.category} ${t.alert_type}`).join(' ').toLowerCase();

  const isStageActive = (stageKey: string) => {
    if (stageKey === 'Initial Access' && (alertText.includes('phish') || alertText.includes('login') || alertText.includes('access'))) return true;
    if (stageKey === 'Execution' && (alertText.includes('malware') || alertText.includes('script') || alertText.includes('execution'))) return true;
    if (stageKey === 'Persistence' && (alertText.includes('privilege') || alertText.includes('escalation') || alertText.includes('persistence'))) return true;
    if (stageKey === 'Lateral Movement' && (alertText.includes('lateral') || alertText.includes('smb') || alertText.includes('psexec'))) return true;
    if (stageKey === 'Collection' && (alertText.includes('unauthorized') || alertText.includes('database') || alertText.includes('access'))) return true;
    if (stageKey === 'Exfiltration' && (alertText.includes('exfiltration') || alertText.includes('ransomware') || alertText.includes('ddos'))) return true;

    // Fallback: if Multi-stage Attack, activate key stages
    if (incidentType.includes('Multi-stage')) return true;
    if (incidentType.includes('Exfiltration') && (stageKey === 'Initial Access' || stageKey === 'Exfiltration')) return true;
    if (incidentType.includes('Ransomware') && (stageKey === 'Execution' || stageKey === 'Exfiltration')) return true;

    return false;
  };

  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 space-y-4">
      <div className="flex items-center space-x-2 border-b border-[#1f293d] pb-3">
        <GitCommit className="w-5 h-5 text-blue-400" />
        <h2 className="text-base font-bold text-slate-100 tracking-wide">Attack Progression Stage Pipeline</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {ALL_STAGES.map((stage, idx) => {
          const active = isStageActive(stage.key);
          return (
            <div
              key={stage.key}
              className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                active
                  ? 'bg-blue-600/15 border-blue-500/40 text-blue-300 shadow-md shadow-blue-950'
                  : 'bg-[#0f172a]/40 border-[#1f293d] text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold">Stage {idx + 1}</span>
                {active && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <span className="text-xs font-bold font-mono tracking-tight">{stage.label}</span>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={active ? 'text-blue-400 font-semibold' : 'text-slate-600'}>
                  {active ? 'OBSERVED' : 'INACTIVE'}
                </span>
                {idx < ALL_STAGES.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600 hidden lg:block" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
