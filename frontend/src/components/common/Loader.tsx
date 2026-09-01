import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  label?: string;
}

export const Loader: React.FC<LoaderProps> = ({ label = 'Loading SentinelIQ data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <span className="text-sm font-medium text-slate-400 font-mono tracking-wide">{label}</span>
    </div>
  );
};
