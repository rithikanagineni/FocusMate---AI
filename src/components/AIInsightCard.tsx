import React, { useState } from 'react';
import { Sparkles, ArrowRight, Zap, Check } from 'lucide-react';

interface AIInsightCardProps {
  onOptimizeDay: () => void;
  message?: string;
  hasApplied?: boolean;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  onOptimizeDay,
  message = "You have 3 high-priority tasks today. I found a 45-minute gap between 2:00 PM and 3:00 PM. Would you like me to schedule your ML revision there?",
  hasApplied = false,
}) => {
  const [applied, setApplied] = useState(hasApplied);

  const handleClick = () => {
    setApplied(true);
    onOptimizeDay();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-pink-500/10 p-4 border border-amber-200/60 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
          <Zap className="w-5 h-5 fill-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" /> AI Schedule Insight
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            {applied
              ? "Day optimized! I scheduled your 45-minute ML revision block at 2:00 PM to protect your morning focus."
              : message}
          </p>

          <div className="mt-3">
            {applied ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl">
                <Check className="w-3.5 h-3.5" /> Day Optimized
              </span>
            ) : (
              <button
                onClick={handleClick}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition active:scale-95"
              >
                <span>Optimize My Day</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
