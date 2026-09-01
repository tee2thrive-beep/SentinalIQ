import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface RiskDistributionProps {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export const RiskDistributionChart: React.FC<RiskDistributionProps> = ({ critical, high, medium, low }) => {
  const data = [
    { name: 'CRITICAL', value: critical, color: '#f43f5e' },
    { name: 'HIGH', value: high, color: '#f97316' },
    { name: 'MEDIUM', value: medium, color: '#eab308' },
    { name: 'LOW', value: low, color: '#06b6d4' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Donut Chart */}
      <div className="p-5 bg-[#111827] border border-[#1f293d] rounded-xl flex flex-col justify-between">
        <h3 className="text-sm font-semibold text-slate-200 tracking-wide mb-2">Risk Level Distribution (Donut View)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#111827" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f293d', borderColor: '#374151', borderRadius: '8px', color: '#f3f4f6', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono pt-2 border-t border-[#1f293d]">
          {data.map((item, idx) => (
            <div key={idx}>
              <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: item.color }}></span>
              <span className="text-slate-400">{item.name}:</span> <strong className="text-slate-200">{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="p-5 bg-[#111827] border border-[#1f293d] rounded-xl flex flex-col justify-between">
        <h3 className="text-sm font-semibold text-slate-200 tracking-wide mb-2">Incident Count by Priority Tier</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f293d', borderColor: '#374151', borderRadius: '8px', color: '#f3f4f6', fontSize: '12px' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-slate-400 font-mono text-center pt-2 border-t border-[#1f293d]">
          Categorized using SentinelIQ 4-tier risk threshold boundaries.
        </p>
      </div>
    </div>
  );
};
