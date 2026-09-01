import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, PlusCircle, Sparkles, Shield, User, Clock, ChevronDown } from 'lucide-react';
import { AddAlertModal } from '../incidents/AddAlertModal';

export const Header: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <>
      <header className="h-16 bg-[#050713]/95 backdrop-blur-xl border-b border-[#1e2438] px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-[0_4px_25px_rgba(5,7,19,0.8)]">
        {/* Left Tagline & Search */}
        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-[#0c0f1d] border border-[#1e2438] rounded-xl text-[11px] text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>In a world of noise, we find the <strong className="text-cyan-400 font-bold">signal</strong> that matters.</span>
          </div>

          <form onSubmit={handleSearch} className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incident ID (e.g. INC-0021)..."
              className="w-full bg-[#0c0f1d] border border-[#1e2438] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/80 font-mono transition-colors"
            />
          </form>
        </div>

        {/* Center Live Clock */}
        <div className="flex items-center space-x-3 bg-[#0c0f1d] border border-[#1e2438] px-4 py-1.5 rounded-xl font-mono text-center shadow-inner">
          <Clock className="w-4 h-4 text-purple-400" />
          <div>
            <div className="text-sm font-bold text-slate-100 tracking-widest">{currentTime || '02:13:47 AM'}</div>
            <div className="text-[10px] text-slate-400">{currentDate || 'May 18, 2025'}</div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Active Window */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-[#0c0f1d] border border-[#1e2438] rounded-xl text-xs text-slate-300 font-mono cursor-pointer hover:border-purple-500/50 transition-colors">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Window:</span>
            <span className="text-cyan-400 font-bold">Last 1 Hour</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Ingest Alert Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-md shadow-purple-950/60"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ingest Custom Alert</span>
          </button>

          {/* AI Assistant */}
          <button className="p-2 bg-[#0c0f1d] border border-[#1e2438] hover:border-purple-500/50 text-cyan-400 hover:text-cyan-300 rounded-xl transition-colors">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </button>

          {/* Notifications */}
          <button className="p-2 bg-[#0c0f1d] border border-[#1e2438] hover:border-purple-500/50 text-slate-400 hover:text-slate-200 rounded-xl transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </button>

          {/* Analyst Level 7 Profile */}
          <div className="flex items-center space-x-2.5 px-3 py-1 bg-[#0c0f1d] border border-[#1e2438] rounded-xl">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white relative">
              <User className="w-4 h-4" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#050713]"></span>
            </div>
            <div className="text-left font-mono">
              <span className="text-[9px] text-slate-500 uppercase block font-semibold leading-none">ANALYST</span>
              <strong className="text-xs text-slate-200 font-bold leading-none">Level 7</strong>
            </div>
          </div>
        </div>
      </header>

      <AddAlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAlertAdded={() => {
          window.location.reload();
        }}
      />
    </>
  );
};
