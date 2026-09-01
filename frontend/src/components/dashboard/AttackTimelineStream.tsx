import React from 'react';
import { UserCheck, ShieldAlert, Play, ArrowRightLeft, Database, UploadCloud } from 'lucide-react';

export const AttackTimelineStream: React.FC = () => {
  const steps = [
    { time: '02:13:07', title: 'Initial Access', desc: 'Suspicious login from external location', icon: UserCheck, color: 'border-cyan-500 text-cyan-400 bg-cyan-950/60' },
    { time: '02:13:12', title: 'Privilege Escalation', desc: 'Abnormal privilege escalation detected', icon: ShieldAlert, color: 'border-blue-500 text-blue-400 bg-blue-950/60' },
    { time: '02:13:16', title: 'Execution', desc: 'Malware execution on domain controller', icon: Play, color: 'border-purple-500 text-purple-400 bg-purple-950/60' },
    { time: '02:13:21', title: 'Lateral Movement', desc: 'Access to critical internal assets', icon: ArrowRightLeft, color: 'border-purple-500 text-purple-400 bg-purple-950/60' },
    { time: '02:13:27', title: 'Collection', desc: 'Sensitive data identified', icon: Database, color: 'border-rose-500 text-rose-400 bg-rose-950/60' },
    { time: '02:13:34', title: 'Exfiltration', desc: 'Data transfer to external location', icon: UploadCloud, color: 'border-rose-500 text-rose-400 bg-rose-950/60' },
  ];

  return (
    <div className="p-4 cyber-card rounded-2xl border border-purple-500/30 shadow-2xl font-mono space-y-3">
      <div className="flex items-center justify-between border-b border-[#1e2438] pb-2">
        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>ATTACK TIMELINE — INCIDENT-042</span>
        </h3>
        <span className="text-[10px] text-slate-400">6 Stages Correlated (Confidence: 90%)</span>
      </div>

      {/* Horizontal Timeline Chain */}
      <div className="relative pt-2 pb-1 overflow-x-auto">
        {/* Connecting Gradient Line */}
        <div className="absolute top-7 left-8 right-8 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500 rounded-full z-0"></div>

        <div className="flex items-start justify-between min-w-[700px] relative z-10">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center space-y-1.5 w-32">
                <span className="text-[9px] text-slate-400 font-bold bg-[#050713] px-1.5 py-0.5 rounded border border-[#1e2438]">
                  {s.time}
                </span>

                {/* Glowing Stage Node Circle */}
                <div className={`w-9 h-9 rounded-full border-2 ${s.color} flex items-center justify-center shadow-lg transition-transform hover:scale-110`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div>
                  <strong className="text-[11px] font-bold text-slate-100 block">{s.title}</strong>
                  <p className="text-[9px] text-slate-400 leading-tight">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
