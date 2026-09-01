import React, { useEffect, useState } from 'react';
import { Loader2, Server, Zap } from 'lucide-react';

interface LoaderProps {
  label?: string;
}

export const Loader: React.FC<LoaderProps> = ({ label = 'Loading SentinelIQ data...' }) => {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSlow(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 font-mono text-center">
      <div className="p-3 bg-blue-950/60 border border-blue-500/30 rounded-2xl">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>

      <span className="text-sm font-semibold text-slate-200 tracking-wide">{label}</span>

      {isSlow && (
        <div className="p-4 max-w-md bg-[#111726] border border-amber-500/30 rounded-xl space-y-2 text-xs text-slate-300 animate-fade-in shadow-lg">
          <div className="flex items-center justify-center space-x-2 text-amber-400 font-bold">
            <Server className="w-4 h-4 animate-pulse" />
            <span>Render Free Tier Server Waking Up...</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Because our backend is deployed on Render's free tier, the server spins down after 15 minutes of inactivity. Cold starts take ~15–30 seconds.
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/60 border border-amber-500/40 text-amber-300 rounded text-[10px] font-mono">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Once awake, subsequent requests load in 0.1s!</span>
          </div>
        </div>
      )}
    </div>
  );
};
