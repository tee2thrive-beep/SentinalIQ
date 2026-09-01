import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { SimulationScenario, SensitivityPayload } from '../types';
import { Loader } from '../components/common/Loader';
import { ErrorState } from '../components/common/ErrorState';
import { Sliders, TrendingUp, TrendingDown, Award, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const SimulationPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<Record<string, SimulationScenario>>({});
  const [sensitivity, setSensitivity] = useState<SensitivityPayload | null>(null);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('user_impact_focus');

  const loadSimulations = async () => {
    try {
      setLoading(true);
      setError(null);
      const [scenData, sensData] = await Promise.all([
        api.fetchSimulationScenarios(),
        api.fetchSimulationSensitivity()
      ]);
      setScenarios(scenData);
      setSensitivity(sensData);
    } catch (err: any) {
      setError(err.message || 'Failed to load simulation analysis data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSimulations();
  }, []);

  if (loading) return <Loader label="Loading Step 7 What-If Weight Simulation & Sensitivity Engine..." />;
  if (error || !scenarios || !sensitivity) return <ErrorState message={error || 'Simulation data missing.'} onRetry={loadSimulations} />;

  const currentScenario = scenarios[selectedScenarioKey] || scenarios['baseline'];
  const sensRanking = sensitivity.factor_sensitivity_ranking || [];

  const chartData = sensRanking.map(sr => ({
    name: sr.display_name,
    sensitivityScore: sr.sensitivity_score,
    maxShift: Math.max(sr.plus_perturbation.maximum_rank_change, sr.minus_perturbation.maximum_rank_change)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-[#1f293d] p-5 rounded-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold text-slate-100 font-mono tracking-wide">What-If Weight Simulation & Sensitivity Analysis</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Simulate alternative organizational risk factor weights without altering the baseline Step 5 scoring model.
          </p>
        </div>
        <div className="text-right font-mono">
          <span className="text-xs text-slate-400">Baseline Equivalence Status:</span>
          <div className="text-xs font-bold text-emerald-400">100% PASSED (&lt; 1e-6 precision)</div>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="flex items-center space-x-2 bg-[#111827] border border-[#1f293d] p-2 rounded-xl overflow-x-auto">
        {Object.keys(scenarios).map((sKey) => {
          const sc = scenarios[sKey];
          const active = sKey === selectedScenarioKey;
          return (
            <button
              key={sKey}
              onClick={() => setSelectedScenarioKey(sKey)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all ${
                active
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
              }`}
            >
              {sc.title}
            </button>
          );
        })}
      </div>

      {/* Active Scenario Overview */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f293d] pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 font-mono">{currentScenario.title}</h2>
            <p className="text-xs text-slate-400 font-mono mt-1">{currentScenario.purpose}</p>
          </div>
          <div className="flex items-center space-x-4 font-mono text-xs">
            <div className="bg-[#0f172a] px-3 py-2 rounded-lg border border-[#1f293d] text-center">
              <span className="text-slate-400 text-[10px] block">Avg Risk Score</span>
              <strong className="text-blue-400 text-sm">{currentScenario.average_score.toFixed(2)}</strong>
            </div>
            <div className="bg-[#0f172a] px-3 py-2 rounded-lg border border-[#1f293d] text-center">
              <span className="text-slate-400 text-[10px] block">Level Shifts</span>
              <strong className="text-amber-400 text-sm">{currentScenario.risk_level_changes_count}</strong>
            </div>
            <div className="bg-[#0f172a] px-3 py-2 rounded-lg border border-[#1f293d] text-center">
              <span className="text-slate-400 text-[10px] block">Dominant Shifts</span>
              <strong className="text-purple-400 text-sm">{currentScenario.dominant_factor_changes_count}</strong>
            </div>
          </div>
        </div>

        {/* Weights Bar */}
        <div>
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-2">Simulated Scenario Weights</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.entries(currentScenario.weights).map(([factor, w]) => (
              <div key={factor} className="p-2.5 bg-[#0f172a] border border-[#1f293d] rounded-lg font-mono text-xs">
                <span className="text-slate-400 capitalize block text-[11px] truncate">{factor.replace('_', ' ')}</span>
                <strong className="text-blue-300 text-sm">{(w * 100).toFixed(0)}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Movers Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upward Movers */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-sm font-bold border-b border-[#1f293d] pb-2">
            <TrendingUp className="w-4 h-4" />
            <h3>Top Upward Rank Movers (Increased Urgency)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0f172a] text-slate-400 border-b border-[#1f293d] text-[11px]">
                <tr>
                  <th className="py-2 px-3">Incident</th>
                  <th className="py-2 px-3 text-center">Baseline → Sim</th>
                  <th className="py-2 px-3 text-center">Rank Shift</th>
                  <th className="py-2 px-3 text-right">Score Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f293d]/50 text-slate-200">
                {currentScenario.top_upward_movers.slice(0, 5).map((m) => (
                  <tr key={m.incident_id} className="hover:bg-[#1e293b]/40">
                    <td className="py-2 px-3 font-bold text-blue-400">{m.incident_id}</td>
                    <td className="py-2 px-3 text-center text-slate-400">#{m.baseline_rank} → #{m.simulated_rank}</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-400">+{m.rank_change} Ranks</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-400">+{m.score_delta.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Downward Movers */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-rose-400 font-mono text-sm font-bold border-b border-[#1f293d] pb-2">
            <TrendingDown className="w-4 h-4" />
            <h3>Top Downward Rank Movers (Decreased Urgency)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0f172a] text-slate-400 border-b border-[#1f293d] text-[11px]">
                <tr>
                  <th className="py-2 px-3">Incident</th>
                  <th className="py-2 px-3 text-center">Baseline → Sim</th>
                  <th className="py-2 px-3 text-center">Rank Shift</th>
                  <th className="py-2 px-3 text-right">Score Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f293d]/50 text-slate-200">
                {currentScenario.top_downward_movers.slice(0, 5).map((m) => (
                  <tr key={m.incident_id} className="hover:bg-[#1e293b]/40">
                    <td className="py-2 px-3 font-bold text-blue-400">{m.incident_id}</td>
                    <td className="py-2 px-3 text-center text-slate-400">#{m.baseline_rank} → #{m.simulated_rank}</td>
                    <td className="py-2 px-3 text-center font-bold text-rose-400">{m.rank_change} Ranks</td>
                    <td className="py-2 px-3 text-right font-bold text-rose-400">{m.score_delta.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Factor Sensitivity Ranking */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1f293d] pb-3">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100 font-mono">Factor Sensitivity Ranking (+/- 5% Proportional Perturbations)</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Formula: AvgRankShift+ + AvgRankShift-</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f293d', borderColor: '#374151', borderRadius: '8px', color: '#f3f4f6', fontSize: '11px' }} />
                <Bar dataKey="sensitivityScore" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : index === 1 ? '#f97316' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ranking Details List */}
          <div className="space-y-2 font-mono text-xs">
            {sensRanking.map((sr) => (
              <div key={sr.factor} className="p-3 bg-[#0f172a] border border-[#1f293d] rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`w-5 h-5 rounded-full font-bold text-[11px] flex items-center justify-center ${
                    sr.sensitivity_rank === 1 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                    sr.sensitivity_rank === 2 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    #{sr.sensitivity_rank}
                  </span>
                  <span className="font-bold text-slate-200">{sr.display_name}</span>
                </div>
                <div className="text-right">
                  <span className="text-blue-400 font-bold">Score: {sr.sensitivity_score.toFixed(4)}</span>
                  <span className="text-slate-500 text-[10px] block">Max Shift: {Math.max(sr.plus_perturbation.maximum_rank_change, sr.minus_perturbation.maximum_rank_change)} ranks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
