import React from 'react';
import { Flame, Bell } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface TopBarProps {
  productivityScore?: number;
  streakDays?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  productivityScore = 85,
  streakDays = 5,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100/90 px-4 py-2 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-black tracking-tight text-slate-900">
          Focus<span className="text-purple-600">Mate</span>
        </span>
        <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-200">
          AI
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Streak Pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200/60 text-xs font-bold shadow-2xs">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-orange-500" />
          <span>{streakDays} days</span>
        </div>

        {/* PWA Install */}
        <PWAInstallButton variant="compact" />
      </div>
    </header>
  );
};
