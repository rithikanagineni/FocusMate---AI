import React, { useState } from 'react';
import { ScheduleBlock } from '../types';
import { Sparkles, Calendar, Clock, AlertTriangle, ArrowRight, X, Check } from 'lucide-react';

interface SmartRescheduleModalProps {
  block: ScheduleBlock;
  onClose: () => void;
  onAutoReschedule: (blockId: string) => void;
  onKeepTime: (blockId: string) => void;
  onMarkComplete: (blockId: string) => void;
}

export const SmartRescheduleModal: React.FC<SmartRescheduleModalProps> = ({
  block,
  onClose,
  onAutoReschedule,
  onKeepTime,
  onMarkComplete,
}) => {
  const [isReorganizing, setIsReorganizing] = useState(false);
  const [reorganized, setReorganized] = useState(false);

  const handleAutoClick = () => {
    setIsReorganizing(true);
    setTimeout(() => {
      setIsReorganizing(false);
      setReorganized(true);
      setTimeout(() => {
        onAutoReschedule(block.id);
      }, 700);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with warning icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Looks like you missed this task
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Don't worry. I can reorganize your remaining schedule.
            </p>
          </div>
        </div>

        {/* Task Details Card */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 mb-4">
          <div className="text-xs font-bold text-slate-800">{block.title}</div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Original slot: {block.startTime} — {block.endTime}</span>
            </span>
            <span>{block.durationMinutes} min</span>
          </div>
        </div>

        {/* AI Proposal Card */}
        <div className="bg-purple-50/70 rounded-2xl p-3.5 border border-purple-100 mb-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Rebalancing Strategy</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            I analyzed your remaining working hours and identified an open evening buffer slot at <strong>17:30</strong>. We can shift this task there without delaying any higher priority deadlines.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleAutoClick}
            disabled={isReorganizing || reorganized}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 disabled:opacity-75"
          >
            {reorganized ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Schedule Reorganized!</span>
              </>
            ) : isReorganizing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                <span>Reorganizing remaining blocks...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Reschedule Automatically</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onKeepTime(block.id)}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              Keep Original
            </button>
            <button
              onClick={() => onMarkComplete(block.id)}
              className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl border border-emerald-200 transition"
            >
              Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
