import React, { useState } from 'react';
import { ScheduleBlock } from '../types';
import { ScheduleTimeline } from '../components/ScheduleTimeline';
import { SmartRescheduleModal } from '../components/SmartRescheduleModal';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  RotateCcw,
  Play,
  Clock,
  Sliders,
  ShieldCheck
} from 'lucide-react';

interface AIScheduleScreenProps {
  schedule: ScheduleBlock[];
  onAcceptPlan: () => void;
  onRegenerate: () => void;
  onStartFocus: (taskId?: string, taskTitle?: string) => void;
  onRescheduleBlock: (blockId: string) => void;
}

export const AIScheduleScreen: React.FC<AIScheduleScreenProps> = ({
  schedule,
  onAcceptPlan,
  onRegenerate,
  onStartFocus,
  onRescheduleBlock,
}) => {
  const [selectedMissedBlock, setSelectedMissedBlock] = useState<ScheduleBlock | null>(null);
  const [planAccepted, setPlanAccepted] = useState(false);

  const handleAccept = () => {
    setPlanAccepted(true);
    onAcceptPlan();
  };

  const handleSimulateMissed = (block: ScheduleBlock) => {
    setSelectedMissedBlock(block);
  };

  const totalFocusMinutes = schedule
    .filter((b) => b.type === 'deep_work' || b.type === 'study')
    .reduce((acc, cur) => acc + cur.durationMinutes, 0);

  return (
    <div className="space-y-4 pb-8 px-4 pt-3 max-w-md mx-auto animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Schedule Engine v2.5
            </span>
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/20">
              Today's Blueprint
            </span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">Your AI Plan</h2>
          <p className="text-xs text-purple-100 mt-0.5">
            Here's how I'd structure your day based on deadlines and focus capacity.
          </p>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Clock className="w-4 h-4 text-pink-300" />
              <span>{Math.floor(totalFocusMinutes / 60)}h {totalFocusMinutes % 60}m deep work</span>
            </div>
            <div className="flex items-center gap-1 text-purple-200">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Protected Buffers</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Strategy Rationale */}
      <div className="bg-purple-50/80 rounded-2xl p-3.5 border border-purple-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5 shadow-2xs">
        <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div>
          <strong className="text-purple-900 block mb-0.5">Why this schedule?</strong>
          <span>
            I placed your ML assignment first at 09:00 because it has the nearest deadline and requires the longest uninterrupted focus period. Chapter review is scheduled before lunch, and meeting obligations are isolated to the afternoon.
          </span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-98 ${
            planAccepted
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-600/20'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{planAccepted ? 'Plan Accepted & Synced' : 'Accept Plan & Start Today'}</span>
        </button>

        <button
          onClick={onRegenerate}
          className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs transition active:scale-95"
          title="Regenerate timeline with different constraints"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Smart Rescheduling Trigger Note */}
      <div className="bg-purple-50/60 rounded-2xl p-2.5 border border-purple-200/60 text-[11px] text-purple-900 flex items-center justify-between">
        <span>⚡ Smart Rebalance automatically reorganizes remaining blocks if tasks run over</span>
        <span className="font-bold text-purple-700 text-[10px]">Auto-Sync</span>
      </div>

      {/* Timeline Section */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600" />
          <span>Daily Schedule Blocks</span>
        </h3>

        <ScheduleTimeline
          blocks={schedule}
          onStartFocus={onStartFocus}
          onMissedTaskTrigger={handleSimulateMissed}
        />
      </div>

      {/* Smart Reschedule Modal if user triggers missed task */}
      {selectedMissedBlock && (
        <SmartRescheduleModal
          block={selectedMissedBlock}
          onClose={() => setSelectedMissedBlock(null)}
          onAutoReschedule={(blockId) => {
            onRescheduleBlock(blockId);
            setSelectedMissedBlock(null);
          }}
          onKeepTime={() => setSelectedMissedBlock(null)}
          onMarkComplete={() => setSelectedMissedBlock(null)}
        />
      )}
    </div>
  );
};
