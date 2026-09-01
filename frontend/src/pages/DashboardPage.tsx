import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { IncidentSummaryItem } from '../types';
import { MetricCards } from '../components/dashboard/MetricCards';
import { RiskDistributionChart } from '../components/dashboard/RiskDistributionChart';
import { Loader } from '../components/common/Loader';
import { ErrorState } from '../components/common/ErrorState';
import { ArrowRight, ShieldAlert, Zap } from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<IncidentSummaryItem[]>([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchIncidents(1, 100);
      setIncidents(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loader label="Loading SentinelIQ SOC Dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const critical = incidents.filter(i => i.risk_level === 'CRITICAL').length;
  const high = incidents.filter(i => i.risk_level === 'HIGH').length;
  const medium = incidents.filter(i => i.risk_level === 'MEDIUM').length;
  const low = incidents.filter(i => i.risk_level === 'LOW').length;

  const scores = incidents.map(i => i.risk_score);
  const maxScore = scores.length ? Math.max(...scores) : 0;
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const top1 = incidents[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-900/40 p-6 rounded-xl">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-wide font-mono">SOC Prioritization Dashboard</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time multi-attribute cyber alert prioritization & investigation queue.
          </p>
        </div>
        {top1 && (
          <div className="flex items-center gap-4 bg-[#0f172a] border border-rose-500/30 p-3 rounded-lg">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg shrink-0">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Top Investigation Priority (#1)</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm font-mono text-rose-300">{top1.incident_id}</span>
                <RiskBadge level={top1.risk_level} size="sm" />
                <span className="text-xs font-mono font-bold text-slate-200">Score: {top1.risk_score.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/incidents/${top1.incident_id}`)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-mono font-bold transition-colors shrink-0"
            >
              Investigate Now
            </button>
          </div>
        )}
      </div>

      {/* Summary Metric Cards */}
      <MetricCards
        total={total}
        critical={critical}
        high={high}
        medium={medium}
        low={low}
        maxScore={maxScore}
        avgScore={avgScore}
      />

      {/* Risk Distribution Visualizations */}
      <RiskDistributionChart
        critical={critical}
        high={high}
        medium={medium}
        low={low}
      />

      {/* Top 5 Priority Queue Quick Preview */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1f293d] pb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-100 tracking-wide font-mono">Top Priority Incidents Awaiting Analyst Action</h2>
          </div>
          <button
            onClick={() => navigate('/incidents')}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            View Full Queue ({total})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0f172a] text-slate-400 uppercase border-b border-[#1f293d] text-[11px]">
              <tr>
                <th className="py-2.5 px-3 text-center w-14">Rank</th>
                <th className="py-2.5 px-3">Incident ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Risk Score</th>
                <th className="py-2.5 px-3 text-center">Level</th>
                <th className="py-2.5 px-3">Main Risk Drivers</th>
                <th className="py-2.5 px-3 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f293d]/60 text-slate-200">
              {incidents.slice(0, 5).map((item) => (
                <tr key={item.incident_id} className="hover:bg-[#1e293b]/50 cursor-pointer" onClick={() => navigate(`/incidents/${item.incident_id}`)}>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-400">#{item.priority_rank}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-400">{item.incident_id}</td>
                  <td className="py-2.5 px-3 font-semibold">{item.incident_type}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-100">{item.risk_score.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-center"><RiskBadge level={item.risk_level} size="sm" /></td>
                  <td className="py-2.5 px-3 text-slate-400 capitalize">{item.dominant_factors.slice(0, 2).map(f => f.replace('_', ' ')).join(', ')}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button onClick={() => navigate(`/incidents/${item.incident_id}`)} className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded text-[11px] font-semibold">
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
