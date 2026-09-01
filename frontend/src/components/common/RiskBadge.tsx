import React from 'react';

interface RiskBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const upper = level?.toUpperCase() || 'LOW';

  let colorClasses = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  if (upper === 'CRITICAL') {
    colorClasses = 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-900/20 animate-pulse';
  } else if (upper === 'HIGH') {
    colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  } else if (upper === 'MEDIUM') {
    colorClasses = 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
  }

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs border font-medium rounded-md',
    md: 'px-2.5 py-1 text-xs border font-semibold rounded-md uppercase tracking-wider',
    lg: 'px-3 py-1.5 text-sm border font-bold rounded-lg uppercase tracking-wider'
  }[size];

  return (
    <span className={`inline-flex items-center justify-center font-mono ${colorClasses} ${sizeClasses}`}>
      {upper}
    </span>
  );
};
