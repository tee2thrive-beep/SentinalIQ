import React, { useState } from 'react';
import { api } from '../services/api';
import { SlidersHorizontal, RefreshCw, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Mover {
  incident_id: string;
  incident_type: string;
  baseline_rank: number;
  simulated_rank: number;
  rank_change: number;
  baseline_score: number;
  simulated_score: number;
}

export const PriorityConfigPage: React.FC = () => {
  const [weights, setWeights] = useState<Record<string, number>>({
    severity: 25,
    asset_importance: 20,
    affected_users: 15,
    data_sensitivity: 15,
    attack_confidence: 15,
    business_impact: 10,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    simulated_queue: any[];
    top_movers: Mover[];
  } | null>(null);

  const totalSum = Object.values(weights).reduce((a, b) => a + b, 0);
  const isValid = Math.abs(totalSum - 100) < 0.1;

  const handleSliderChange = (factor: string, val: number) => {
    setWeights((prev) => ({
      ...prev,
      [factor]: val,
    }));
  };

  const handleAutoBalance = () => {
    if (totalSum === 0) return;
    const balanced: Record<string, number> = {};
    Object.keys(weights).forEach((k) => {
      balanced[k] = Math.round((weights[k] / totalSum) * 100);
    });
    setWeights(balanced);
  };

  const applyPreset = (presetWeights: Record<string, number>) => {
    setWeights(presetWeights);
  };

  const handleRecalculate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert integer percentages to 0.0-1.0 floats
      const floatWeights: Record<string, number> = {};
      Object.keys(weights).forEach((k) => {
        floatWeights[k] = Number((weights[k] / 100).toFixed(4));
      });

      const res = await api.simulateCustomWeights(floatWeights);
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to simulate custom weights.');
    } finally {
      setLoading(false);
    }
  };

  const factorLabels: Record<string, { label: string; desc: string; color: string }> = {
    severity: { label: 'Alert Severity', desc: 'Normalized alert severity rating', color: 'text-rose-400' },
    asset_importance: { label: 'Asset Importance', desc: 'Criticality & business value of target asset', color: 'text-blue-400' },
    affected_users: { label: 'Affected Users', desc: 'Volume of compromised or affected user accounts', color: 'text-purple-400' },
    data_sensitivity: { label: 'Data Sensitivity', desc: 'Sensitivity of data handled by asset (PCI/PII)', color: 'text-amber-400' },
    attack_confidence: { label: 'Attack Confidence', desc: 'Correlation confidence & detection certainty', color: 'text-cyan-400' },
    business_impact: { label: 'Business Impact', desc: 'Overall potential revenue & operational risk', color: 'text-emerald-400' },
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-[#1f293d] pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Edit Priority Engine Weights</h1>
            <p className="text-xs text-slate-400">SOC Weight Customization: Dynamically tune scoring factor weights and preview live queue re-ranking</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1.5 border rounded-xl text-xs font-bold ${
            isValid ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}>
            {isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            <span>Total Weight: {totalSum}% {isValid ? '(Valid)' : '(Must Equal 100%)'}</span>
          </div>

          {!isValid && (
            <button
              onClick={handleAutoBalance}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-xl font-bold transition-colors"
            >
              Auto-Balance (100%)
            </button>
          )}
        </div>
      </div>

      {/* Presets Row */}
      <div className="p-4 bg-[#090d16] border border-[#1f293d] rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Quick Weight Presets:
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => applyPreset({ severity: 25, asset_importance: 20, affected_users: 15, data_sensitivity: 15, attack_confidence: 15, business_impact: 10 })}
            className="p-3 bg-[#111827] hover:bg-[#1e293b] border border-[#1f293d] rounded-xl text-left transition-all group"
          >
            <strong className="text-xs text-slate-200 block group-hover:text-blue-400">⚖️ Default Balanced</strong>
            <span className="text-[10px] text-slate-400">25% Sev, 20% Asset, 15% User...</span>
          </button>

          <button
            onClick={() => applyPreset({ severity: 10, asset_importance: 40, affected_users: 5, data_sensitivity: 20, attack_confidence: 5, business_impact: 20 })}
            className="p-3 bg-[#111827] hover:bg-[#1e293b] border border-[#1f293d] rounded-xl text-left transition-all group"
          >
            <strong className="text-xs text-slate-200 block group-hover:text-blue-400">🚨 High Asset Focus</strong>
            <span className="text-[10px] text-slate-400">40% Asset, 20% Biz, 20% Data...</span>
          </button>

          <button
            onClick={() => applyPreset({ severity: 20, asset_importance: 10, affected_users: 40, data_sensitivity: 10, attack_confidence: 10, business_impact: 10 })}
            className="p-3 bg-[#111827] hover:bg-[#1e293b] border border-[#1f293d] rounded-xl text-left transition-all group"
          >
            <strong className="text-xs text-slate-200 block group-hover:text-blue-400">👥 User-Centric Focus</strong>
            <span className="text-[10px] text-slate-400">40% Users, 20% Sev, 10% Asset...</span>
          </button>

          <button
            onClick={() => applyPreset({ severity: 10, asset_importance: 20, affected_users: 5, data_sensitivity: 25, attack_confidence: 5, business_impact: 35 })}
            className="p-3 bg-[#111827] hover:bg-[#1e293b] border border-[#1f293d] rounded-xl text-left transition-all group"
          >
            <strong className="text-xs text-slate-200 block group-hover:text-blue-400">💥 Impact-First Focus</strong>
            <span className="text-[10px] text-slate-400">35% Biz, 25% Data, 20% Asset...</span>
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(factorLabels).map(([key, info]) => (
          <div key={key} className="p-4 bg-[#090d16] border border-[#1f293d] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xs font-bold ${info.color}`}>{info.label}</h3>
                <p className="text-[10px] text-slate-400">{info.desc}</p>
              </div>
              <strong className="text-sm font-bold text-slate-100 bg-[#111827] border border-[#1f293d] px-2.5 py-1 rounded-lg">
                {weights[key]}%
              </strong>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={weights[key]}
              onChange={(e) => handleSliderChange(key, Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* Recalculate Button */}
      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
          {error}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          onClick={handleRecalculate}
          disabled={loading || !isValid}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Re-calculating Queue Order...' : 'Re-calculate & Re-rank Priority Queue'}</span>
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 pt-4 border-t border-[#1f293d]">
          {/* Top Movers Callout */}
          <div className="p-5 bg-[#090d16] border border-blue-500/30 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <span>Top Queue Rank Movers Under Custom Weights</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.top_movers.slice(0, 6).map((mover) => (
                <div
                  key={mover.incident_id}
                  className={`p-3 border rounded-xl flex items-center justify-between text-xs font-mono ${
                    mover.rank_change > 0
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : mover.rank_change < 0
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : 'bg-[#111827] border-[#1f293d] text-slate-300'
                  }`}
                >
                  <div>
                    <strong className="block text-slate-100 font-bold">{mover.incident_id}</strong>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">{mover.incident_type}</span>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold">
                      {mover.rank_change > 0 ? (
                        <>
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">+{mover.rank_change} Ranks</span>
                        </>
                      ) : mover.rank_change < 0 ? (
                        <>
                          <ArrowDownRight className="w-4 h-4 text-rose-400" />
                          <span className="text-rose-400">{mover.rank_change} Ranks</span>
                        </>
                      ) : (
                        <span className="text-slate-400">No Change</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">#{mover.baseline_rank} → #{mover.simulated_rank}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated Queue Table Preview */}
          <div className="p-5 bg-[#090d16] border border-[#1f293d] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Simulated Re-ranked Priority Queue (Top 10)</h3>
              <Link to="/incidents" className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1">
                View Full Queue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1f293d] text-slate-400 font-semibold bg-[#111827]/60">
                    <th className="py-2.5 px-3 text-center">New Rank</th>
                    <th className="py-2.5 px-3">Incident ID</th>
                    <th className="py-2.5 px-3">Incident Type</th>
                    <th className="py-2.5 px-3 text-right">New Risk Score</th>
                    <th className="py-2.5 px-3 text-center">Risk Level</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f293d]/50 text-slate-300">
                  {result.simulated_queue.slice(0, 10).map((item) => (
                    <tr key={item.incident_id} className="hover:bg-[#111827]/40 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-blue-400">#{item.priority_rank}</td>
                      <td className="py-3 px-3 font-bold text-slate-100">{item.incident_id}</td>
                      <td className="py-3 px-3">{item.incident_type}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-100">{item.risk_score.toFixed(2)}</td>
                      <td className="py-3 px-3 text-center font-bold text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.risk_level === 'CRITICAL' ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40' :
                          item.risk_level === 'HIGH' ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40' :
                          'bg-blue-950/60 text-blue-300 border border-blue-500/40'
                        }`}>
                          {item.risk_level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Link
                          to={`/incidents/${item.incident_id}`}
                          className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-md text-[11px] font-semibold transition-colors"
                        >
                          Investigate
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
