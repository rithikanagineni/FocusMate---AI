import React from 'react';
import { Camera, Brain, CheckSquare, Calendar, Target, ChevronRight } from 'lucide-react';

export type AIWorkflowStep = 'capture' | 'processing' | 'results' | 'plan' | 'focus';

interface AIWorkflowBarProps {
  currentStep: AIWorkflowStep;
  onStepClick?: (step: AIWorkflowStep) => void;
}

const STEPS: { id: AIWorkflowStep; label: string; icon: any }[] = [
  { id: 'capture', label: 'Capture', icon: Camera },
  { id: 'processing', label: 'Processing', icon: Brain },
  { id: 'results', label: 'Results', icon: CheckSquare },
  { id: 'plan', label: 'Plan', icon: Calendar },
  { id: 'focus', label: 'Focus', icon: Target },
];

export const AIWorkflowBar: React.FC<AIWorkflowBarProps> = ({ currentStep, onStepClick }) => {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-b border-orange-200/80 px-3 py-2">
      <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar max-w-md mx-auto">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <React.Fragment key={step.id}>
              <div
                onClick={() => isDone && onStepClick?.(step.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                    : isDone
                    ? 'text-orange-900 bg-orange-100/70 hover:bg-orange-200 cursor-pointer'
                    : 'text-slate-400 opacity-60'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{step.label}</span>
              </div>

              {idx < STEPS.length - 1 && (
                <ChevronRight className="w-3 h-3 text-orange-300 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
