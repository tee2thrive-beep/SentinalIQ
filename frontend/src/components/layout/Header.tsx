import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Activity, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = search.trim().toUpperCase();
    if (!query) return;

    if (query.startsWith('INC-') || query.length >= 3) {
      navigate(`/incidents/${query}`);
      setSearch('');
    }
  };

  return (
    <header className="h-16 bg-[#090d16]/90 backdrop-blur border-b border-[#1f293d] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Global Search */}
      <form onSubmit={handleSearch} className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search incident ID (e.g. INC-0021)..."
          className="w-full bg-[#111827] border border-[#1f293d] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500/60 font-mono transition-colors"
        />
      </form>

      {/* Header Actions */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#111827] border border-[#1f293d] rounded-lg font-mono text-xs text-slate-300">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>SOC STATUS: <strong className="text-emerald-400 font-semibold">Operational</strong></span>
        </div>
        <button className="p-2 bg-[#111827] border border-[#1f293d] hover:bg-[#1e293b] text-slate-400 hover:text-slate-200 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
