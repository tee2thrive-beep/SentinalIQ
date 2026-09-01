import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, PlusCircle, Shield } from 'lucide-react';
import { AddAlertModal } from '../incidents/AddAlertModal';

export const Header: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = search.trim().toUpperCase();
    if (!query) return;

    if (query.startsWith('INC-') || query.length >= 3) {
      navigate(`/incidents/${query}`);
      setSearch('');
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Command Center Dashboard';
    if (path === '/incidents') return 'Priority Investigation Queue';
    if (path.startsWith('/incidents/')) return 'Incident Deep-Dive Triage';
    if (path === '/compare') return 'Incident Rank & Risk Comparison';
    if (path === '/priority-config') return 'Edit Priority Engine Weights';
    if (path === '/simulations') return 'What-If Weight Simulations';
    if (path === '/reports') return 'Reports & Data Exports';
    if (path === '/status') return 'Engine System Status';
    return 'SentinelIQ Triage Engine';
  };

  return (
    <>
      <header className="h-16 bg-[#090d16] border-b border-[#1e293b] px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
        {/* Left: Page Title & Context */}
        <div className="flex items-center space-x-3">
          <h2 className="text-base font-bold text-slate-100">{getPageTitle()}</h2>
        </div>

        {/* Right: Global Search & Action */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative w-72 hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Incident ID (e.g. INC-0021)..."
              className="w-full bg-[#111726] border border-[#1e293b] rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono transition-all"
            />
          </form>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Ingest Custom Alert</span>
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
