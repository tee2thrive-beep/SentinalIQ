import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Layers, Users } from 'lucide-react';
import { IncidentSummaryItem } from '../../types';
import { RiskBadge } from '../common/RiskBadge';

interface PriorityQueueTableProps {
  items: IncidentSummaryItem[];
}

export const PriorityQueueTable: React.FC<PriorityQueueTableProps> = ({ items }) => {
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="p-8 text-center bg-[#111827] border border-[#1f293d] rounded-xl text-slate-400 font-mono text-sm">
        No incidents match the selected filter criteria.
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#0f172a] text-slate-400 uppercase border-b border-[#1f293d] tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4 font-semibold text-center w-16">Rank</th>
              <th className="py-3.5 px-4 font-semibold">Incident ID</th>
              <th className="py-3.5 px-4 font-semibold">Incident Type</th>
              <th className="py-3.5 px-4 font-semibold text-right">Risk Score</th>
              <th className="py-3.5 px-4 font-semibold text-center">Risk Level</th>
              <th className="py-3.5 px-4 font-semibold text-center">Alerts</th>
              <th className="py-3.5 px-4 font-semibold text-center">Users</th>
              <th className="py-3.5 px-4 font-semibold">Main Risk Drivers</th>
              <th className="py-3.5 px-4 font-semibold text-center w-28">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f293d]/60 text-slate-200">
            {items.map((item) => {
              const drivers = item.dominant_factors?.slice(0, 3).map(f => f.replace('_', ' ')).join(', ') || 'N/A';
              return (
                <tr
                  key={item.incident_id}
                  onClick={() => navigate(`/incidents/${item.incident_id}`)}
                  className="hover:bg-[#1e293b]/70 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 text-center font-bold text-slate-400 group-hover:text-blue-400">
                    #{item.priority_rank}
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-400 group-hover:underline">
                    {item.incident_id}
                    {item.tie_group_id && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">
                        TIE
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-200">{item.incident_type}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-100 text-sm">
                    {item.risk_score.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <RiskBadge level={item.risk_level} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-center text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {item.alert_count}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      {item.affected_users}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-xs capitalize">
                    {drivers}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/incidents/${item.incident_id}`);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-md text-[11px] font-semibold transition-colors group-hover:border-blue-400"
                    >
                      Investigate
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
