import React, { useState } from 'react';
import { Priority } from '../types';
import { Info } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  reason?: string;
  size?: 'sm' | 'md';
  showReasonIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  reason,
  size = 'md',
  showReasonIcon = true,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const configs = {
    HIGH: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
      label: 'HIGH',
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500',
      label: 'MEDIUM',
    },
    LOW: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
      label: 'LOW',
    },
  };

  const config = configs[priority] || configs.MEDIUM;
  const isSm = size === 'sm';

  return (
    <div className="relative inline-flex items-center">
      <span
        onClick={() => reason && setShowTooltip(!showTooltip)}
        className={`inline-flex items-center gap-1.5 font-bold tracking-wider rounded-lg border transition-all ${
          config.bg
        } ${isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} ${
          reason ? 'cursor-pointer hover:shadow-xs' : ''
        }`}
      >
        <span className={`rounded-full shrink-0 animate-pulse ${config.dot} ${isSm ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
        <span>{config.label}</span>
        {reason && showReasonIcon && (
          <Info className={`${isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} opacity-70 hover:opacity-100`} />
        )}
      </span>

      {showTooltip && reason && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShowTooltip(false)} />
          <div className="absolute bottom-full left-0 mb-2 z-40 w-52 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl leading-relaxed animate-fade-in border border-slate-700">
            <div className="font-semibold text-purple-300 mb-1 flex items-center gap-1">
              <span>Why {config.label}?</span>
            </div>
            <p className="text-slate-200">{reason}</p>
            <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-900" />
          </div>
        </>
      )}
    </div>
  );
};
