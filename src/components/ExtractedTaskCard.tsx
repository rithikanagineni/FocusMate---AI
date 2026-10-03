import React, { useState } from 'react';
import { ExtractedTask, Priority } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { Clock, Calendar, CheckSquare, Square, Edit3, Check } from 'lucide-react';

interface ExtractedTaskCardProps {
  task: ExtractedTask;
  onUpdate: (updated: ExtractedTask) => void;
  onToggleSelect: (id: string) => void;
}

export const ExtractedTaskCard: React.FC<ExtractedTaskCardProps> = ({
  task,
  onUpdate,
  onToggleSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [deadline, setDeadline] = useState(task.deadline);
  const [estimatedMinutes, setEstimatedMinutes] = useState(task.estimatedMinutes);
  const [priority, setPriority] = useState<Priority>(task.priority);

  const handleSave = () => {
    onUpdate({
      ...task,
      title,
      deadline,
      estimatedMinutes,
      priority,
    });
    setIsEditing(false);
  };

  const isSelected = task.selected !== false;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 bg-white ${
        isSelected
          ? 'border-purple-200/90 shadow-sm'
          : 'border-slate-200 opacity-60 bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleSelect(task.id)}
          className="mt-0.5 text-purple-600 focus:outline-hidden"
        >
          {isSelected ? (
            <CheckSquare className="w-5 h-5 fill-purple-100 text-purple-600" />
          ) : (
            <Square className="w-5 h-5 text-slate-300" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-semibold p-2 border border-purple-200 rounded-lg focus:outline-purple-500 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Deadline</label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Duration (min)</label>
                  <input
                    type="number"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Priority</label>
                <div className="flex gap-2 mt-1">
                  {(['HIGH', 'MEDIUM', 'LOW'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition ${
                        priority === p
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-purple-700"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <PriorityBadge priority={task.priority} reason={task.priorityReason} size="sm" />
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="text-sm font-bold text-slate-800 leading-snug">{task.title}</h4>

              {task.description && (
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{task.description}</p>
              )}

              <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-purple-500" />
                  <span>{task.deadline}</span>
                </span>

                <span className="flex items-center gap-1 font-medium text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{task.estimatedMinutes} min</span>
                </span>
              </div>

              {task.priorityReason && (
                <div className="mt-2 text-[11px] text-purple-700 bg-purple-50/70 p-2 rounded-xl border border-purple-100/50">
                  <span className="font-semibold">AI Rationale:</span> {task.priorityReason}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
