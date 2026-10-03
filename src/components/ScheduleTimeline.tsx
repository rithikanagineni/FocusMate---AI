import React from 'react';
import { ScheduleBlock } from '../types';
import { PriorityBadge } from './PriorityBadge';
import {
  Clock,
  Sparkles,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';

interface ScheduleTimelineProps {
  blocks: ScheduleBlock[];
  onStartFocus?: (taskId?: string, taskTitle?: string) => void;
  onBlockClick?: (block: ScheduleBlock) => void;
  onMissedTaskTrigger?: (block: ScheduleBlock) => void;
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  blocks,
  onStartFocus,
  onBlockClick,
  onMissedTaskTrigger,
}) => {
  const typeConfigs = {
    deep_work: {
      badge: 'Deep Work',
      badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
      dotClass: 'bg-purple-600',
      lineClass: 'border-purple-300',
    },
    study: {
      badge: 'Study Block',
      badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
      dotClass: 'bg-blue-500',
      lineClass: 'border-blue-300',
    },
    meeting: {
      badge: 'Meeting',
      badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500',
      lineClass: 'border-amber-300',
    },
    break: {
      badge: 'Break & Recharge',
      badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
      lineClass: 'border-emerald-300',
    },
    buffer: {
      badge: 'Buffer / Catch-up',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      dotClass: 'bg-slate-400',
      lineClass: 'border-slate-200',
    },
  };

  return (
    <div className="space-y-4">
      <div className="relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {blocks.map((block) => {
          const config = typeConfigs[block.type] || typeConfigs.study;
          const isBreak = block.type === 'break' || block.type === 'buffer';
          const isCompleted = block.status === 'completed';
          const isMissed = block.status === 'missed';

          return (
            <div key={block.id} className="relative mb-6 last:mb-0 group">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 shadow-xs'
                    : isMissed
                    ? 'bg-rose-500 shadow-xs'
                    : config.dotClass
                }`}
              >
                {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                {isMissed && <AlertCircle className="w-2.5 h-2.5 text-white" />}
              </div>

              {/* Time indicator */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>
                    {block.startTime} — {block.endTime}
                  </span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {block.durationMinutes} min
                </span>
              </div>

              {/* Schedule Block Card */}
              <div
                onClick={() => onBlockClick?.(block)}
                className={`rounded-2xl p-3.5 border transition-all duration-200 ${
                  isMissed
                    ? 'bg-rose-50/70 border-rose-200'
                    : isBreak
                    ? 'bg-slate-50/80 border-slate-200/80'
                    : 'bg-white border-slate-100 shadow-xs hover:shadow-md hover:border-purple-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${config.badgeClass}`}
                      >
                        {isBreak ? (
                          <span className="flex items-center gap-1">
                            <Coffee className="w-2.5 h-2.5" />
                            {config.badge}
                          </span>
                        ) : (
                          config.badge
                        )}
                      </span>
                      {!isBreak && block.priority && (
                        <PriorityBadge priority={block.priority} size="sm" showReasonIcon={false} />
                      )}
                    </div>

                    <h4
                      className={`text-sm font-bold ${
                        isCompleted
                          ? 'line-through text-slate-400'
                          : isMissed
                          ? 'text-rose-800'
                          : 'text-slate-900'
                      }`}
                    >
                      {block.title}
                    </h4>

                    {block.reason && (
                      <p className="mt-1.5 text-[11px] text-slate-600 flex items-start gap-1 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100/60">
                        <Sparkles className="w-3 h-3 text-purple-500 shrink-0 mt-0.5" />
                        <span>{block.reason}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {!isBreak && !isCompleted && !isMissed && onStartFocus && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartFocus(block.taskId, block.title);
                        }}
                        className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 active:scale-95 transition"
                        title="Start Focus Mode on this task"
                      >
                        <Play className="w-4 h-4 fill-purple-600 text-purple-600" />
                      </button>
                    )}

                    {/* Rebalance Schedule Trigger */}
                    {!isBreak && !isCompleted && !isMissed && onMissedTaskTrigger && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMissedTaskTrigger(block);
                        }}
                        className="text-[10px] text-slate-400 hover:text-purple-600 flex items-center gap-0.5"
                        title="Rebalance or adjust time block"
                      >
                        <RotateCcw className="w-3 h-3" /> Adjust
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
