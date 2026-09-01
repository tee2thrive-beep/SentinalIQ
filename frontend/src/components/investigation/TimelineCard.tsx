import React from 'react';
import { TimelineEvent } from '../../types';
import { Clock, ShieldAlert, Monitor, User, Globe } from 'lucide-react';

interface TimelineCardProps {
  timeline: TimelineEvent[];
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ timeline }) => {
  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 space-y-4">
      <div className="flex items-center space-x-2 border-b border-[#1f293d] pb-3">
        <Clock className="w-5 h-5 text-blue-400" />
        <h2 className="text-base font-bold text-slate-100 tracking-wide">Chronological Attack Timeline ({timeline.length} Events)</h2>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#1f293d]">
        {timeline.map((event, idx) => {
          const isHighSev = event.severity >= 80;
          return (
            <div key={event.alert_id || idx} className="relative group">
              {/* Timeline Dot */}
              <div className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 ${
                isHighSev ? 'bg-rose-500 border-rose-950 animate-ping' : 'bg-blue-500 border-blue-950'
              }`} />
              <div className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 ${
                isHighSev ? 'bg-rose-500 border-rose-950' : 'bg-blue-500 border-blue-950'
              }`} />

              {/* Event Content */}
              <div className="bg-[#0f172a] border border-[#1f293d] hover:border-blue-500/40 rounded-xl p-4 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="text-slate-400">{event.timestamp}</span>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded font-semibold">{event.alert_id}</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-medium">{event.category}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="text-slate-400">Severity:</span>
                    <span className={`font-bold ${isHighSev ? 'text-rose-400' : 'text-amber-400'}`}>{event.severity}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mb-3">{event.alert_type}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono bg-[#111827] p-2.5 rounded-lg border border-[#1f293d]/50">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-500">Src IP:</span>
                    <span>{event.source_ip}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-500">Dst IP:</span>
                    <span>{event.destination_ip}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300 truncate">
                    <Monitor className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-500">Asset:</span>
                    <span className="text-blue-300 font-semibold truncate">{event.asset_name}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-300 truncate">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-500">User:</span>
                    <span className="text-slate-200 font-semibold truncate">{event.username}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
