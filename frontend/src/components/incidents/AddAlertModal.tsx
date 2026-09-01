import React, { useState } from 'react';
import { api } from '../../services/api';
import { PlusCircle, X, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';

interface AddAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertAdded: () => void;
}

export const AddAlertModal: React.FC<AddAlertModalProps> = ({ isOpen, onClose, onAlertAdded }) => {
  const [alertType, setAlertType] = useState('Data Exfiltration Attempt');
  const [category, setCategory] = useState('Exfiltration');
  const [severity, setSeverity] = useState(90);
  const [confidence, setConfidence] = useState(85);
  const [assetId, setAssetId] = useState('AST-0001');
  const [userId, setUserId] = useState('USR-0005');
  const [sourceIp, setSourceIp] = useState('192.168.1.150');
  const [destIp, setDestIp] = useState('10.0.4.22');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const res = await api.createCustomAlert({
        alert_type: alertType,
        category,
        severity: Number(severity),
        confidence: Number(confidence),
        asset_id: assetId,
        user_id: userId,
        source_ip: sourceIp,
        destination_ip: destIp
      });

      setSuccessMessage(res.message);
      onAlertAdded();
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to ingest alert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f293d] pb-3">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100">Ingest Custom Security Alert</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-[#1e293b]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-sm font-bold text-emerald-200">Alert Ingested & Prioritized!</h3>
            <p className="text-xs text-emerald-300/90 leading-relaxed">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-300">
                {error}
              </div>
            )}

            {/* Alert Type & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Alert Type</label>
                <select
                  value={alertType}
                  onChange={(e) => {
                    setAlertType(e.target.value);
                    if (e.target.value.includes('Exfiltration')) setCategory('Exfiltration');
                    else if (e.target.value.includes('Malware')) setCategory('Malware');
                    else if (e.target.value.includes('Login') || e.target.value.includes('Brute')) setCategory('Authentication');
                    else if (e.target.value.includes('Phish')) setCategory('Phishing');
                    else setCategory('Access');
                  }}
                  className="w-full bg-[#0f172a] border border-[#1f293d] text-slate-200 rounded-lg p-2 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="Data Exfiltration Attempt">Data Exfiltration Attempt</option>
                  <option value="Malware Outbreak">Malware Outbreak</option>
                  <option value="Brute Force Login">Brute Force Login</option>
                  <option value="Phishing Email Click">Phishing Email Click</option>
                  <option value="Unauthorized Access Attempt">Unauthorized Access Attempt</option>
                  <option value="DDoS Traffic Spike">DDoS Traffic Spike</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#1f293d] text-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Sliders for Severity & Confidence */}
            <div className="grid grid-cols-2 gap-4 bg-[#0f172a] p-3 rounded-xl border border-[#1f293d]">
              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Severity:</span>
                  <strong className="text-rose-400">{severity} / 100</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Confidence:</span>
                  <strong className="text-blue-400">{confidence} / 100</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Asset ID & User ID */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Target Asset</label>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#1f293d] text-slate-200 rounded-lg p-2 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="AST-0001">AST-0001 (payment-gateway)</option>
                  <option value="AST-0002">AST-0002 (core-db-cluster)</option>
                  <option value="AST-0003">AST-0003 (auth-identity-srv)</option>
                  <option value="AST-0005">AST-0005 (customer-portal)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Affected User</label>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#1f293d] text-slate-200 rounded-lg p-2 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="USR-0005">USR-0005 (usr_fin_mgr)</option>
                  <option value="USR-0001">USR-0001 (usr_sys_admin)</option>
                  <option value="USR-0008">USR-0008 (usr_sec_analyst)</option>
                </select>
              </div>
            </div>

            {/* IP Addresses */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Source IP</label>
                <input
                  type="text"
                  value={sourceIp}
                  onChange={(e) => setSourceIp(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#1f293d] text-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Destination IP</label>
                <input
                  type="text"
                  value={destIp}
                  onChange={(e) => setDestIp(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#1f293d] text-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-[#1f293d] flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-slate-300 border border-[#1f293d] rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Pipeline...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    Ingest & Prioritize Alert
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
