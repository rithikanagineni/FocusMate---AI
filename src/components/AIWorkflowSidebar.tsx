import React from 'react';
import { Home, Camera, CheckSquare, Calendar, Target, BarChart2, Sparkles, Layers } from 'lucide-react';
import { AIWorkflowStep } from './AIWorkflowBar';

interface AIWorkflowSidebarProps {
  currentStep?: AIWorkflowStep | null;
  onSelectStep?: (step: AIWorkflowStep) => void;
  onGoHome?: () => void;
  onGoTasks?: () => void;
  onGoAnalytics?: () => void;
}

export const AIWorkflowSidebar: React.FC<AIWorkflowSidebarProps> = ({
  currentStep,
  onSelectStep,
  onGoHome,
  onGoTasks,
  onGoAnalytics,
}) => {
  return (
    <aside className="w-13 sm:w-14 bg-gradient-to-b from-purple-700 via-indigo-700 to-purple-800 text-white flex flex-col items-center py-4 justify-between shrink-0 shadow-lg select-none z-30">
      {/* Top Logo */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onGoHome}
          className="w-9 h-9 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center font-extrabold text-sm text-white shadow-xs active:scale-95 transition"
          title="FocusMate Home"
        >
          <span className="tracking-tight">F.</span>
        </button>

        {/* Home Button */}
        <button
          onClick={onGoHome}
          className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-white/10 transition active:scale-95"
          title="Dashboard"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* Capture Step */}
        <button
          onClick={() => onSelectStep?.('capture')}
          className={`p-2 rounded-xl transition active:scale-95 ${
            currentStep === 'capture'
              ? 'bg-white text-purple-700 shadow-md font-bold'
              : 'text-purple-200 hover:text-white hover:bg-white/10'
          }`}
          title="Capture Anything"
        >
          <Camera className="w-5 h-5" />
        </button>

        {/* AI Results / Tasks Step */}
        <button
          onClick={() => onSelectStep?.('results')}
          className={`p-2 rounded-xl transition active:scale-95 ${
            currentStep === 'results' || currentStep === 'processing'
              ? 'bg-white text-purple-700 shadow-md font-bold'
              : 'text-purple-200 hover:text-white hover:bg-white/10'
          }`}
          title="AI Results"
        >
          <CheckSquare className="w-5 h-5" />
        </button>

        {/* Plan / Schedule Step */}
        <button
          onClick={() => onSelectStep?.('plan')}
          className={`p-2 rounded-xl transition active:scale-95 ${
            currentStep === 'plan'
              ? 'bg-white text-purple-700 shadow-md font-bold'
              : 'text-purple-200 hover:text-white hover:bg-white/10'
          }`}
          title="AI Plan"
        >
          <Calendar className="w-5 h-5" />
        </button>

        {/* Focus Mode Step */}
        <button
          onClick={() => onSelectStep?.('focus')}
          className={`p-2 rounded-xl transition active:scale-95 ${
            currentStep === 'focus'
              ? 'bg-white text-purple-700 shadow-md font-bold'
              : 'text-purple-200 hover:text-white hover:bg-white/10'
          }`}
          title="Focus Mode"
        >
          <Target className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Analytics link */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onGoAnalytics}
          className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-white/10 transition"
          title="Analytics"
        >
          <BarChart2 className="w-5 h-5" />
        </button>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="AI Engine Active" />
      </div>
    </aside>
  );
};
