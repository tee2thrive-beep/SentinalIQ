import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { IncidentSummaryItem, RiskAnalysis } from '../types';
import { Scale, ArrowRight, ArrowLeftRight, CheckCircle2, TrendingUp, ShieldAlert } from 'lucide-react';

export const CompareIncidentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [incidents, setIncidents] = useState<IncidentSummaryItem[]>([]);
  const [selectedIdA, setSelectedIdA] = useState<string>(searchParams.get('a') || '');
  const [selectedIdB, setSelectedIdB] = useState<string>(searchParams.get('b') || '');

  const [riskA, setRiskA] = useState<RiskAnalysis | null>(null);
  const [riskB, setRiskB] = useState<RiskAnalysis | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const listRes = await api.fetchIncidents(1, 100);
        setIncidents(listRes.items);

        const idA = searchParams.get('a') || listRes.items[0]?.incident_id || 'INC-0021';
        const idB = searchParams.get('b') || listRes.items[1]?.incident_id || 'INC-0001';

        setSelectedIdA(idA);
        setSelectedIdB(idB);

        const [rA, rB] = await Promise.all([
          api.fetchIncidentRisk(idA).catch(() => null),
          api.fetchIncidentRisk(idB).catch(() => null)
        ]);

        setRiskA(rA);
        setRiskB(rB);
      } catch (err) {
        console.error('Failed to load comparison data', err);
      }
    }
    loadData();
  }, [searchParams]);

  const handleSelectA = (id: string) => {
    setSelectedIdA(id);
    setSearchParams({ a: id, b: selectedIdB });
  };

  const handleSelectB = (id: string) => {
    setSelectedIdB(id);
    setSearchParams({ a: selectedIdA, b: id });
  };

  const handleSwap = () => {
    const tempA = selectedIdA;
    const tempB = selectedIdB;
    setSelectedIdA(tempB);
    setSelectedIdB(tempA);
    setSearchParams({ a: tempB, b: tempA });
  };

  const incA = incidents.find((i) => i.incident_id === selectedIdA);
  const incB = incidents.find((i) => i.incident_id === selectedIdB);

  const factorNames = [
    { key: 'severity', label: 'Severity', weight: '25%' },
    { key: 'asset_importance', label: 'Asset Importance', weight: '20%' },
    { key: 'affected_users', label: 'Affected Users', weight: '15%' },
    { key: 'data_sensitivity', label: 'Data Sensitivity', weight: '15%' },
    { key: 'confidence', label: 'Attack Confidence', weight: '15%' },
    { key: 'business_impact', label: 'Business Impact', weight: '10%' },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1f293d] pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Incident Rank & Risk Comparison</h1>
              <p className="text-xs text-slate-400">Algorithmic Justification Engine: Why Incident A outranks Incident B in the Priority Queue</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSwap}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] hover:bg-[#1e293b] text-slate-200 border border-[#1f293d] rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <ArrowLeftRight className="w-4 h-4 text-blue-400" />
          <span>Swap Order</span>
        </button>
      </div>

      {/* Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Incident A Selector */}
        <div className="p-4 bg-[#090d16] border border-blue-500/40 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 tracking-wider">INCIDENT A (HIGHER RANK TARGET)</span>
            <span className="px-2 py-0.5 bg-blue-950/60 border border-blue-500/40 text-blue-300 rounded text-[11px] font-bold">
              Rank #{incA?.priority_rank || '1'}
            </span>
          </div>
          <select
            value={selectedIdA}
            onChange={(e) => handleSelectA(e.target.value)}
            className="w-full bg-[#111827] border border-[#1f293d] text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-blue-500"
          >
            {incidents.map((inc) => (
              <option key={inc.incident_id} value={inc.incident_id}>
                #{inc.priority_rank} | {inc.incident_id} — {inc.incident_type} (Score: {inc.risk_score.toFixed(1)})
              </option>
            ))}
          </select>
        </div>

        {/* Incident B Selector */}
        <div className="p-4 bg-[#090d16] border border-purple-500/40 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 tracking-wider">INCIDENT B (COMPARISON TARGET)</span>
            <span className="px-2 py-0.5 bg-purple-950/60 border border-purple-500/40 text-purple-300 rounded text-[11px] font-bold">
              Rank #{incB?.priority_rank || '2'}
            </span>
          </div>
          <select
            value={selectedIdB}
            onChange={(e) => handleSelectB(e.target.value)}
            className="w-full bg-[#111827] border border-[#1f293d] text-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-purple-500"
          >
            {incidents.map((inc) => (
              <option key={inc.incident_id} value={inc.incident_id}>
                #{inc.priority_rank} | {inc.incident_id} — {inc.incident_type} (Score: {inc.risk_score.toFixed(1)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Justification Banner */}
      {incA && incB && (
        <div className="p-5 bg-[#090d16] border border-[#1f293d] rounded-2xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-950/50 border border-blue-500/30 rounded-xl text-blue-400 mt-0.5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Rank Justification Analysis:</span>
                <span className="text-blue-400">{incA.incident_id} (Rank #{incA.priority_rank})</span>
                <span className="text-slate-400">vs</span>
                <span className="text-purple-400">{incB.incident_id} (Rank #{incB.priority_rank})</span>
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed">
                {incA.priority_rank < incB.priority_rank ? (
                  <>
                    <strong className="text-emerald-400">{incA.incident_id} OUTRANKS {incB.incident_id}</strong> by{' '}
                    <span className="text-blue-400 font-bold">{(incA.risk_score - incB.risk_score).toFixed(2)} risk points</span>. 
                    The priority ranking is determined by the multi-factor weighted scoring formula + deterministic tie-breaking rules.
                  </>
                ) : incA.priority_rank > incB.priority_rank ? (
                  <>
                    <strong className="text-amber-400">{incA.incident_id} IS OUTRANKED BY {incB.incident_id}</strong> by{' '}
                    <span className="text-purple-400 font-bold">{(incB.risk_score - incA.risk_score).toFixed(2)} risk points</span>.
                  </>
                ) : (
                  <>Both incidents share the same priority rank.</>
                )}
              </p>
            </div>
          </div>

          {/* Core Driver Deltas */}
          <div className="pt-3 border-t border-[#1f293d]/80 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-[#111827] border border-[#1f293d] rounded-xl">
              <span className="text-[10px] text-slate-400 block">Risk Score Delta</span>
              <strong className={incA.risk_score >= incB.risk_score ? 'text-blue-400' : 'text-purple-400'}>
                {(incA.risk_score - incB.risk_score) >= 0 ? '+' : ''}{(incA.risk_score - incB.risk_score).toFixed(2)} pts
              </strong>
            </div>

            <div className="p-2.5 bg-[#111827] border border-[#1f293d] rounded-xl">
              <span className="text-[10px] text-slate-400 block">Alert Volume Ratio</span>
              <strong className="text-slate-200">
                {incA.alert_count} alerts vs {incB.alert_count} alerts
              </strong>
            </div>

            <div className="p-2.5 bg-[#111827] border border-[#1f293d] rounded-xl">
              <span className="text-[10px] text-slate-400 block">User Impact Ratio</span>
              <strong className="text-slate-200">
                {incA.affected_users} users vs {incB.affected_users} users
              </strong>
            </div>

            <div className="p-2.5 bg-[#111827] border border-[#1f293d] rounded-xl">
              <span className="text-[10px] text-slate-400 block">Primary Driver Difference</span>
              <strong className="text-blue-400 truncate block">
                {incA.dominant_factors[0] || 'severity'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Factor Breakdown Comparison Table */}
      {riskA && riskB && (
        <div className="p-5 bg-[#090d16] border border-[#1f293d] rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <span>6-Factor Risk Score Comparison</span>
            </h3>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> {selectedIdA} ({riskA.risk_score.toFixed(1)})
              </span>
              <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> {selectedIdB} ({riskB.risk_score.toFixed(1)})
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1f293d] text-slate-400 font-semibold bg-[#111827]/60">
                  <th className="py-2.5 px-3">Scoring Factor</th>
                  <th className="py-2.5 px-3">Weight</th>
                  <th className="py-2.5 px-3 text-blue-400 font-bold">{selectedIdA} Score</th>
                  <th className="py-2.5 px-3 text-purple-400 font-bold">{selectedIdB} Score</th>
                  <th className="py-2.5 px-3">Delta (A - B)</th>
                  <th className="py-2.5 px-3">Outranking Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f293d]/50 text-slate-300">
                {factorNames.map(({ key, label, weight }) => {
                  const factorA = riskA.factors.find((f) => f.name === key);
                  const factorB = riskB.factors.find((f) => f.name === key);
                  const valA = factorA ? factorA.value : 0;
                  const valB = factorB ? factorB.value : 0;
                  const delta = valA - valB;

                  return (
                    <tr key={key} className="hover:bg-[#111827]/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-200">{label}</td>
                      <td className="py-3 px-3 text-slate-400">{weight}</td>
                      
                      {/* Bar & Score A */}
                      <td className="py-3 px-3 font-mono font-bold text-blue-400">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-[#111827] border border-[#1f293d] h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, valA)}%` }}></div>
                          </div>
                          <span>{valA.toFixed(1)}</span>
                        </div>
                      </td>

                      {/* Bar & Score B */}
                      <td className="py-3 px-3 font-mono font-bold text-purple-400">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-[#111827] border border-[#1f293d] h-2 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, valB)}%` }}></div>
                          </div>
                          <span>{valB.toFixed(1)}</span>
                        </div>
                      </td>

                      {/* Delta */}
                      <td className="py-3 px-3 font-mono font-bold">
                        <span className={delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-slate-400'}>
                          {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                        </span>
                      </td>

                      {/* Driver verdict */}
                      <td className="py-3 px-3">
                        {delta > 0.5 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-blue-950/50 border border-blue-500/30 text-blue-300 rounded-md font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-blue-400" /> {selectedIdA} Higher
                          </span>
                        ) : delta < -0.5 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-purple-950/50 border border-purple-500/30 text-purple-300 rounded-md font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-purple-400" /> {selectedIdB} Higher
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Equal Impact</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Side by Side Quick Links */}
      {incA && incB && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to={`/incidents/${incA.incident_id}`}
            className="p-4 bg-[#090d16] hover:bg-[#111827] border border-blue-500/30 rounded-2xl flex items-center justify-between group transition-all"
          >
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">FULL INVESTIGATION REPORT</span>
              <strong className="text-sm font-bold text-blue-400 group-hover:text-blue-300 flex items-center gap-1">
                Open {incA.incident_id} Report <ArrowRight className="w-4 h-4" />
              </strong>
            </div>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold">Rank #{incA.priority_rank}</span>
          </Link>

          <Link
            to={`/incidents/${incB.incident_id}`}
            className="p-4 bg-[#090d16] hover:bg-[#111827] border border-purple-500/30 rounded-2xl flex items-center justify-between group transition-all"
          >
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">FULL INVESTIGATION REPORT</span>
              <strong className="text-sm font-bold text-purple-400 group-hover:text-purple-300 flex items-center gap-1">
                Open {incB.incident_id} Report <ArrowRight className="w-4 h-4" />
              </strong>
            </div>
            <span className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold">Rank #{incB.priority_rank}</span>
          </Link>
        </div>
      )}
    </div>
  );
};
