import React, { useEffect, useState } from 'react';
import { ChevronLeft, Sparkles, Check, Loader2 } from 'lucide-react';
import { RobotBuddy } from './RobotBuddy';

interface AIProcessingAnimationProps {
  onComplete: () => void;
  speedMs?: number;
  onBack?: () => void;
}

const STEPS = [
  { label: 'OCR Text Extract', key: 'ocr' },
  { label: 'AI Understanding', key: 'ai' },
  { label: 'Organizing Tasks', key: 'tasks' },
  { label: 'Done', key: 'done' },
];

export const AIProcessingAnimation: React.FC<AIProcessingAnimationProps> = ({
  onComplete,
  speedMs = 700,
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(onComplete, 600);
          return prev;
        }
      });
    }, speedMs);

    return () => clearInterval(timer);
  }, [onComplete, speedMs]);

  return (
    <div className="flex-1 flex flex-col justify-between p-4 bg-[#F8F9FE] text-slate-800 animate-fade-in min-h-[460px]">
      {/* Header */}
      <div className="flex items-center justify-between py-1">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold text-slate-900">AI Processing</h2>

        <div className="w-8" />
      </div>

      {/* Center 3D Mascot & Status */}
      <div className="my-auto flex flex-col items-center justify-center text-center px-4">
        {/* Cute 3D Robot Buddy */}
        <div className="mb-6 relative">
          <div className="absolute -inset-4 rounded-full bg-purple-200/40 blur-xl animate-pulse" />
          <RobotBuddy size={130} />
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-1">
          Analyzing your input...
        </h3>
        <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
          Extracting tasks, deadlines, priorities and more...
        </p>
      </div>

      {/* Bottom Step Progress Dots */}
      <div className="pt-6 pb-2">
        <div className="flex items-center justify-between gap-1 max-w-xs mx-auto">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={step.key} className="flex-1 flex flex-col items-center gap-1 text-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isDone
                      ? 'bg-purple-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-purple-600 text-white ring-4 ring-purple-200 animate-pulse'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isCurrent ? (
                    <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                  ) : (
                    <span>+</span>
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold leading-tight ${
                    isDone || isCurrent ? 'text-purple-700' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
