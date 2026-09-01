import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, Bell, Clock, UserCheck, Shield, Sparkles } from 'lucide-react';
import { AddAlertModal } from '../incidents/AddAlertModal';

export const Header: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });

  return (
    <>
      <header className="h-16 bg-[#070b15]/90 backdrop-blur-md border-b border-[#151d30] px-6 flex items-center justify-between sticky top-0 z-30 font-mono">
        {/* Left: Cyber Tagline Quote */}
        <div className="hidden lg:flex items-center space-x-2.5 px-3.5 py-1.5 bg-[#090e1c] border border-[#182238] rounded-xl text-xs">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-slate-400">
            In a world of noise, we find the <strong className="text-cyan-400 font-bold">signal</strong> that matters.
          </span>
        </div>

        {/* Center: Live Digital Cyber Clock (Matching screenshot) */}
        <div className="flex items-center space-x-3 bg-[#090e1c] border border-blue-500/30 px-4 py-1.5 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.15)]">
          <Clock className="w-4 h-4 text-blue-400" />
          <div className="text-center">
            <span className="text-xs font-extrabold text-slate-100 tracking-wider block leading-tight font-mono">
              {formattedTime}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-3">
          {/* Global Search */}
          <form onSubmit={handleSearch} className="relative w-64 hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incident (INC-0021)..."
              className="w-full bg-[#090e1c] border border-[#182238] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-mono transition-all"
            />
          </form>

          {/* Ingest Custom Alert Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="cyber-btn-cyan inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-100">Ingest Custom Alert</span>
          </button>

          {/* Notifications Bell */}
          <button className="p-2 bg-[#090e1c] border border-[#182238] hover:bg-[#111827] text-slate-400 hover:text-slate-200 rounded-xl transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </button>

          {/* Analyst Level 7 Profile Avatar (Matching screenshot) */}
          <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-[#090e1c] border border-purple-500/30 rounded-xl text-xs">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs border border-purple-400/50">
                L7
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#090e1c] rounded-full"></span>
            </div>
            <div className="hidden md:block text-left font-mono">
              <strong className="text-[11px] text-slate-200 block leading-tight font-bold">ANALYST</strong>
              <span className="text-[9px] text-purple-400 font-semibold block">Level 7 SOC Lead</span>
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
