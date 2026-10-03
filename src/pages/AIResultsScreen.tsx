import React from 'react';
import { ChevronLeft, Calendar, Check, Sparkles } from 'lucide-react';
import { ExtractedTask } from '../types';

interface AIResultsScreenProps {
  tasks: ExtractedTask[];
  summary?: string;
  scheduleSuggestion?: string;
  onUpdateTask: (task: ExtractedTask) => void;
  onToggleSelect: (id: string) => void;
  onAddToPlan: () => void;
  onRecapture: () => void;
  onAddNewItem?: () => void;
  onBack?: () => void;
}

export const AIResultsScreen: React.FC<AIResultsScreenProps> = ({
  tasks,
  onAddToPlan,
  onRecapture,
  onBack,
}) => {
  // Pre-configured list matching Screen 7 in mockup
  const displayItems = [
    {
      id: 'res-1',
      title: 'ML Assignment',
      priority: 'High Priority',
      priorityStyle: 'bg-rose-50 text-rose-600 border border-rose-100',
      due: 'Due: Thu, 6:00 PM',
      est: 'Est: 2 hrs',
      iconBg: 'bg-rose-100 text-rose-500',
    },
    {
      id: 'res-2',
      title: 'Study Chapters 3 & 4',
      priority: 'Medium Priority',
      priorityStyle: 'bg-amber-50 text-amber-600 border border-amber-100',
      due: 'Due: Fri, 10:00 AM',
      est: 'Est: 3 hrs',
      iconBg: 'bg-amber-100 text-amber-500',
    },
    {
      id: 'res-3',
      title: 'Prepare Presentation',
      priority: 'Medium Priority',
      priorityStyle: 'bg-amber-50 text-amber-600 border border-amber-100',
      due: 'Due: Wed, 2:00 PM',
      est: 'Est: 2 hrs',
      iconBg: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between p-4 bg-[#F8F9FE] text-slate-800 animate-fade-in">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between py-1 mb-3">
          <button
            onClick={onBack || onRecapture}
            className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-base font-bold text-slate-900">AI Results</h2>

          <div className="w-8" />
        </div>

        {/* Top Banner: "✓ 3 Action Items Detected" | "Add to Plan" */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-2.5 flex items-center justify-between gap-2 mb-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
              ✓
            </span>
            <span>3 Action Items Detected</span>
          </div>

          <button
            onClick={onAddToPlan}
            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-xl shadow-xs transition active:scale-95"
          >
            Add to Plan
          </button>
        </div>

        {/* Extracted Task Cards List */}
        <div className="space-y-3">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-start gap-3 hover:border-purple-200 transition"
            >
              <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                <Calendar className="w-4 h-4 stroke-[2.5]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                </div>

                <div className="mt-1">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${item.priorityStyle}`}>
                    {item.priority}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-medium">
                  <span>{item.due}</span>
                  <span>{item.est}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions: "✓ Save" and "✨ Add to Plan" */}
      <div className="pt-4 flex gap-2">
        <button
          onClick={onRecapture}
          className="flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-purple-700 border border-purple-200 text-xs font-bold shadow-2xs active:scale-98 transition flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Save</span>
        </button>

        <button
          onClick={onAddToPlan}
          className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-600/25 active:scale-98 transition flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>Add to Plan</span>
        </button>
      </div>
    </div>
  );
};
