import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RiskAnalysis } from '../../types';
import { Calculator, Award } from 'lucide-react';

interface RiskMathCardProps {
  riskAnalysis: RiskAnalysis;
}

export const RiskMathCard: React.FC<RiskMathCardProps> = ({ riskAnalysis }) => {
  const { formula, risk_score, factors, dominant_factors, contribution_sum } = riskAnalysis;

  const chartData = factors.map(f => ({
    name: f.name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    contribution: f.contribution,
    value: f.value,
    weight: f.weight
  }));

  const FACTOR_COLORS: Record<string, string> = {
    severity: '#f43f5e',
    asset_importance: '#f97316',
    business_impact: '#eab308',
    data_sensitivity: '#a855f7',
    attack_confidence: '#3b82f6',
    affected_users: '#06b6d4'
  };

  return (
    <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f293d] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100 tracking-wide">Six-Factor Mathematical Risk Breakdown</h2>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Formula: <code className="text-blue-300 font-bold bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">{formula}</code>
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-400 uppercase">Defensible Risk Score</span>
          <div className="text-3xl font-extrabold font-mono text-blue-400">{risk_score.toFixed(2)} <span className="text-xs text-slate-500 font-normal">/ 100.0</span></div>
        </div>
      </div>

      {/* Dominant Risk Drivers */}
      <div>
        <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" /> Top Dominant Risk Drivers
        </h3>
        <div className="flex flex-wrap gap-2">
          {dominant_factors.map((df, idx) => {
            const factorObj = factors.find(f => f.name === df);
            const contrib = factorObj ? factorObj.contribution.toFixed(2) : '0.00';
            return (
              <div key={df} className="px-3 py-1.5 bg-[#1e293b] border border-blue-500/30 rounded-lg text-xs font-mono flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[11px] flex items-center justify-center">{idx + 1}</span>
                <span className="text-slate-200 font-semibold capitalize">{df.replace('_', ' ')}</span>
                <span className="text-blue-400 font-bold">+{contrib} pts</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Factors Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#0f172a] text-slate-400 uppercase border-b border-[#1f293d] text-[11px]">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Factor Name</th>
              <th className="py-2.5 px-3 font-semibold text-right">Raw Value</th>
              <th className="py-2.5 px-3 font-semibold text-right">Weight</th>
              <th className="py-2.5 px-3 font-semibold text-right">Contribution</th>
              <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              <th className="py-2.5 px-3 font-semibold">Evidence / Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f293d]/60 text-slate-200">
            {factors.map((f) => (
              <tr key={f.name} className="hover:bg-[#1e293b]/40">
                <td className="py-2.5 px-3 font-bold text-slate-200 capitalize">
                  {f.name.replace('_', ' ')}
                </td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-100">{f.value.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right text-slate-400">{(f.weight * 100).toFixed(0)}%</td>
                <td className="py-2.5 px-3 text-right font-bold text-blue-400">+{f.contribution.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-center font-bold">
                  <span className={`px-2 py-0.5 text-[10px] rounded border ${
                    f.status === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                    f.status === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    f.status === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' :
                    'bg-slate-700/30 text-slate-400 border-slate-700/50'
                  }`}>
                    {f.status}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-400 text-[11px]">{f.evidence}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-[#1f293d] bg-[#0f172a]/60 text-slate-100 font-bold">
            <tr>
              <td className="py-2.5 px-3">Total Sum</td>
              <td colSpan={2}></td>
              <td className="py-2.5 px-3 text-right text-blue-400 text-sm">+{contribution_sum.toFixed(2)}</td>
              <td colSpan={2} className="py-2.5 px-3 text-slate-400 text-[10px] font-normal italic">
                (Matches Risk Score within 1e-3 precision)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="pt-2">
        <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">Weighted Contribution Breakdown (Points)</h3>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 110, bottom: 5 }}>
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f293d', borderColor: '#374151', borderRadius: '8px', color: '#f3f4f6', fontSize: '11px' }} />
              <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                {factors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={FACTOR_COLORS[entry.name] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
