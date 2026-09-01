import React from 'react';
import { Radio, AlertOctagon, Terminal, ArrowUpRight } from 'lucide-react';

export const LiveAlertStream: React.FC = () => {
  const alerts = [
    { time: '02:13:47', event: 'Malicious File Detected', details: 'Endpoint • PC-23', level: 'text-rose-400', dot: 'bg-rose-500' },
    { time: '02:13:45', event: 'Privilege Escalation', details: 'DC-01 • Administrator', level: 'text-rose-400', dot: 'bg-rose-500' },
    { time: '02:13:44', event: 'Suspicious Login', details: '185.44.21.10 • HR-Login', level: 'text-amber-400', dot: 'bg-amber-500' },
    { time: '02:13:43', event: 'Outbound Connection', details: 'FIN-DB-01 • 91.204.11.72', level: 'text-cyan-400', dot: 'bg-cyan-500' },
    { time: '02:13:41', event: 'Brute Force Attempt', details: '103.22.44.91 • SSH', level: 'text-rose-400', dot: 'bg-rose-500' },
  ];

  return (
    <div className="p-4 cyber-card rounded-2xl border border-[#1e2438] flex flex-col justify-between shadow-xl font-mono">
      <div className="flex items-center justify-between border-b border-[#1e2438] pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">LIVE ALERT STREAM</h3>
        </div>
        <span className="text-[10px] text-purple-400 cursor-pointer hover:underline">See All</span>
      </div>

      <div className="space-y-2 text-xs">
        {alerts.map((a, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-[#050713]/80 border border-[#1e2438] rounded-xl hover:border-purple-500/40 transition-colors">
            <div className="flex items-center space-x-2.5">
              <span className={`w-2 h-2 rounded-full ${a.dot} animate-pulse`}></span>
              <span className="text-[10px] text-slate-500 font-bold">{a.time}</span>
              <div>
                <strong className={`block ${a.level} font-bold text-[11px]`}>{a.event}</strong>
                <span className="text-[9px] text-slate-400 block">{a.details}</span>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </div>
        ))}
      </div>
    </div>
  );
};
