import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle } from 'lucide-react';
import { AddAlertModal } from '../incidents/AddAlertModal';

export const Header: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <>
      <header className="h-16 bg-[#070b15]/90 backdrop-blur-md border-b border-[#151d30] px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
        {/* Left: Global Search Input */}
        <form onSubmit={handleSearch} className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incident ID (e.g. INC-0021)..."
            className="w-full bg-[#090e1c] border border-[#182238] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-mono transition-all"
          />
        </form>

        {/* Right Header Action: Ingest Custom Alert Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="cyber-btn-cyan inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-100">+ Ingest Custom Alert</span>
          </button>
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
