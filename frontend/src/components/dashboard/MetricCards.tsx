import React from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle, Award, BarChart2 } from 'lucide-react';

interface MetricCardsProps {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  maxScore: number;
  avgScore: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  total,
  critical,
  high,
  medium,
  low,
  maxScore,
  avgScore
}) => {
  const cards = [
    { label: 'Total Incidents', value: total, sub: '100% Queue Coverage', icon: BarChart2, color: 'text-blue-400', border: 'border-blue-500/30' },
    { label: 'CRITICAL Band', value: critical, sub: 'Immediate SOC Action', icon: ShieldAlert, color: 'text-rose-400', border: 'border-rose-500/40 bg-rose-950/20' },
    { label: 'HIGH Band', value: high, sub: 'Elevated Threat Level', icon: AlertTriangle, color: 'text-amber-400', border: 'border-amber-500/30' },
    { label: 'MEDIUM Band', value: medium, sub: 'Moderate Risk Clusters', icon: Info, color: 'text-yellow-400', border: 'border-yellow-500/20' },
    { label: 'LOW Band', value: low, sub: 'Standard Operational Noise', icon: CheckCircle, color: 'text-cyan-400', border: 'border-cyan-500/20' },
    { label: 'Highest Risk Score', value: `${maxScore.toFixed(2)}`, sub: 'Peak Prioritization Score', icon: Award, color: 'text-rose-400', border: 'border-rose-500/30' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div key={idx} className={`p-4 bg-[#111827] border rounded-xl flex flex-col justify-between ${c.border}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.label}</span>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div className="mt-3">
              <span className={`text-2xl font-bold font-mono tracking-tight ${c.color}`}>{c.value}</span>
              <p className="text-[10px] font-mono text-slate-400 mt-1">{c.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
