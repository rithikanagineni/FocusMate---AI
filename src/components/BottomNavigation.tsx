import React from 'react';
import { Home, CheckSquare, BarChart2, User, Plus, Calendar } from 'lucide-react';

export type MainTab = 'home' | 'tasks' | 'calendar' | 'analytics' | 'profile';

interface BottomNavigationProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onOpenAICreate: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
  onOpenAICreate,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-100 px-4 py-2.5 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between relative px-2">
        {/* HOME */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === 'home' ? 'text-purple-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* TASKS */}
        <button
          onClick={() => onTabChange('tasks')}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === 'tasks' ? 'text-purple-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Tasks"
        >
          <CheckSquare className={`w-5 h-5 ${currentTab === 'tasks' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">Tasks</span>
        </button>

        {/* CENTER FLOATING '+' AI CREATION BUTTON */}
        <div className="flex justify-center -mt-6">
          <button
            onClick={onOpenAICreate}
            className="group relative w-13 h-13 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-700 p-0.5 shadow-lg shadow-purple-600/30 active:scale-95 transition-all hover:scale-105 flex items-center justify-center text-white"
            aria-label="Create with AI"
          >
            <Plus className="w-7 h-7 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* ANALYTICS (Requested in prompt!) */}
        <button
          onClick={() => onTabChange('analytics')}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === 'analytics' ? 'text-purple-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Analytics"
        >
          <BarChart2 className={`w-5 h-5 ${currentTab === 'analytics' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">Analytics</span>
        </button>

        {/* PROFILE */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentTab === 'profile' ? 'text-purple-600 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Profile"
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
