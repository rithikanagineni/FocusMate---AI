import React, { useState } from 'react';
import { Sparkles, Camera, Brain, Target, ArrowRight, Play, Check } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
  onStartDemo: () => void;
}

const SLIDES = [
  {
    icon: Sparkles,
    iconBg: 'bg-purple-100 text-purple-600',
    title: 'Meet FocusMate',
    subtitle: 'Your AI companion for turning information into action.',
    description: 'Stop manually typing to-do lists. FocusMate understands the messages, voice memos, and photos you already receive and builds your schedule.'
  },
  {
    icon: Camera,
    iconBg: 'bg-blue-100 text-blue-600',
    title: 'Capture anything',
    subtitle: 'Screenshot it. Say it. Upload it.',
    description: 'Snap a WhatsApp chat from your professor, speak a thought aloud, or drop a class syllabus. The phone itself is your productivity sensor.'
  },
  {
    icon: Brain,
    iconBg: 'bg-pink-100 text-pink-600',
    title: 'Let AI organize it',
    subtitle: 'Tasks, deadlines and priorities — automatically.',
    description: 'Our on-device priority engine balances urgency, cognitive effort, and deadlines with complete transparency on why every task is ranked.'
  },
  {
    icon: Target,
    iconBg: 'bg-emerald-100 text-emerald-600',
    title: 'Own your day',
    subtitle: 'Get a realistic plan and focus on what matters.',
    description: 'Execute in a distraction-free Focus Mode with an intelligent AI coach and automated dynamic rescheduling when life happens.'
  }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose, onStartDemo }) => {
  const [step, setStep] = useState(0);

  const isLast = step === SLIDES.length - 1;
  const current = SLIDES[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 relative text-center">
        {/* Step indicator dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-purple-600' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Slide Graphic */}
        <div className="mb-4">
          <div className={`w-16 h-16 rounded-3xl ${current.iconBg} flex items-center justify-center mx-auto shadow-sm`}>
            <Icon className="w-8 h-8" />
          </div>
        </div>

        {/* Slide Content */}
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1">
          {current.title}
        </h3>
        <p className="text-xs font-semibold text-purple-700 mb-3">
          {current.subtitle}
        </p>
        <p className="text-xs text-slate-500 leading-relaxed mb-6 px-2">
          {current.description}
        </p>

        {/* Controls */}
        <div className="space-y-2">
          {isLast ? (
            <>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Get Started with FocusMate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="py-2.5 px-4 text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Skip
              </button>
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
