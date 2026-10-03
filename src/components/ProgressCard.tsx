import React from 'react';
import { Sparkles, Trophy, Clock, CheckCircle } from 'lucide-react';

interface ProgressCardProps {
  progressPercent?: number;
  completedTasks?: number;
  totalTasks?: number;
  focusTime?: string;
  productivityScore?: number;
  onOptimizeDay?: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  progressPercent = 65,
  completedTasks = 5,
  totalTasks = 8,
  focusTime = '2h 35m',
  productivityScore = 82,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-5 text-white shadow-lg shadow-purple-500/20">
      {/* Decorative ambient glowing circles */}
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-pink-400/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-indigo-300/20 blur-xl pointer-events-none" />

      {/* Header with Title and Productivity Score */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-200">
            Daily Momentum
          </span>
          <h3 className="text-xl font-extrabold tracking-tight">Today's Progress</h3>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full border border-white/20">
          <Trophy className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-xs font-bold text-white">Score {productivityScore}</span>
        </div>
      </div>

      {/* Progress percentage bar */}
      <div className="relative z-10 mb-5">
        <div className="flex items-baseline justify-between mb-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tight">{progressPercent}%</span>
            <span className="text-xs text-purple-200 font-medium">completed</span>
          </div>
          <span className="text-xs font-semibold text-purple-100 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-300" /> On track for 100%
          </span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden backdrop-blur-xs p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 via-pink-300 to-white shadow-xs transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats 3-column Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-2.5 pt-3 border-t border-white/15">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-2.5 border border-white/10">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <div className="text-[10px] text-purple-200 font-medium">Tasks Completed</div>
            <div className="text-sm font-bold text-white tracking-tight">
              {completedTasks} <span className="text-xs text-purple-200 font-normal">/ {totalTasks}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-2.5 border border-white/10">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-pink-300" />
          </div>
          <div>
            <div className="text-[10px] text-purple-200 font-medium">Focus Time</div>
            <div className="text-sm font-bold text-white tracking-tight">{focusTime}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
