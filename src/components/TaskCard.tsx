import React, { useState } from 'react';
import { Task } from '../types';
import { PriorityBadge } from './PriorityBadge';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Camera,
  Mic,
  FileText,
  Sparkles,
  Smartphone,
  Play
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onReschedule?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStartFocus?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onReschedule,
  onEdit,
  onDelete,
  onStartFocus,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isCompleted = task.status === 'COMPLETED';

  const sourceIcons = {
    camera: <Camera className="w-3.5 h-3.5 text-purple-500" />,
    screenshot: <Smartphone className="w-3.5 h-3.5 text-blue-500" />,
    voice: <Mic className="w-3.5 h-3.5 text-rose-500" />,
    document: <FileText className="w-3.5 h-3.5 text-amber-500" />,
    ai: <Sparkles className="w-3.5 h-3.5 text-purple-600" />,
    manual: null,
  };

  const progressPercent = task.actualMinutes && task.estimatedMinutes
    ? Math.min(100, Math.round((task.actualMinutes / task.estimatedMinutes) * 100))
    : isCompleted ? 100 : 0;

  return (
    <div
      className={`group relative rounded-2xl bg-white p-4 transition-all duration-200 border ${
        isCompleted
          ? 'border-slate-200/80 bg-slate-50/70 opacity-75'
          : 'border-slate-100/90 shadow-sm hover:shadow-md hover:border-purple-200'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          aria-label={isCompleted ? 'Mark task incomplete' : 'Mark task complete'}
          className="mt-0.5 shrink-0 transition-transform active:scale-90 focus:outline-hidden"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
          ) : (
            <Circle className="w-5 h-5 text-slate-300 hover:text-purple-600 hover:fill-purple-50 transition-colors" />
          )}
        </button>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <PriorityBadge priority={task.priority} reason={task.priorityReason} size="sm" />
              {task.source && sourceIcons[task.source] && (
                <span
                  title={`Captured via ${task.source}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md"
                >
                  {sourceIcons[task.source]}
                  <span className="capitalize">{task.source}</span>
                </span>
              )}
            </div>

            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-30 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-xs text-slate-700 animate-fade-in">
                    {onStartFocus && !isCompleted && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onStartFocus(task);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-purple-50 text-purple-700 font-medium"
                      >
                        <Play className="w-3.5 h-3.5" /> Focus Now
                      </button>
                    )}
                    {onReschedule && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onReschedule(task);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50"
                      >
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Reschedule
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onEdit(task);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50"
                      >
                        Edit Task
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onDelete(task.id);
                        }}
                        className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <h4
            className={`font-semibold text-sm leading-snug transition-colors ${
              isCompleted ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-purple-950'
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Metadata Row */}
          <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              <span>{task.deadline || 'No deadline'}</span>
            </span>

            <span className="flex items-center gap-1 font-medium text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {task.estimatedMinutes >= 60
                  ? `${Math.floor(task.estimatedMinutes / 60)}h ${
                      task.estimatedMinutes % 60 ? `${task.estimatedMinutes % 60}m` : ''
                    }`
                  : `${task.estimatedMinutes}m`}
              </span>
            </span>

            {task.scheduledTime && (
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-semibold rounded-md border border-purple-100/60">
                {task.scheduledTime}
              </span>
            )}
          </div>

          {/* Progress bar if in progress or has actual minutes */}
          {task.actualMinutes > 0 && !isCompleted && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Focus progress</span>
                <span className="font-semibold text-purple-700">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Subtasks Accordion */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-600 hover:text-purple-700"
              >
                <span>
                  Subtasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
                </span>
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {expanded && (
                <div className="mt-2 space-y-1.5 pl-1 animate-fade-in">
                  {task.subtasks.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-2 text-xs text-slate-600">
                      <span
                        className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                          sub.completed ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {sub.completed && <CheckCircle2 className="w-2.5 h-2.5" />}
                      </span>
                      <span className={sub.completed ? 'line-through text-slate-400' : ''}>
                        {sub.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Focus Button */}
          {!isCompleted && onStartFocus && (
            <div className="mt-3 pt-2 border-t border-slate-100/60 flex items-center justify-end">
              <button
                onClick={() => onStartFocus(task)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-700 text-xs font-semibold rounded-xl border border-purple-200/60 transition active:scale-95"
              >
                <Play className="w-3 h-3 fill-purple-600 text-purple-600" />
                <span>Start Focus</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
