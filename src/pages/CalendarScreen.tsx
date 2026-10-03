import React, { useState } from 'react';
import { ScheduleBlock, Task } from '../types';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { PriorityBadge } from '../components/PriorityBadge';

interface CalendarScreenProps {
  schedule: ScheduleBlock[];
  onStartFocus: (taskTitle?: string) => void;
  onOpenAICreate: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  schedule,
  onStartFocus,
  onOpenAICreate,
}) => {
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);

  // Generate 7 days around current
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const weekDays = [-2, -1, 0, 1, 2, 3, 4].map((offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    return {
      offset,
      dayName: days[d.getDay()],
      dateNum: d.getDate(),
      isToday: offset === 0,
    };
  });

  return (
    <div className="space-y-4 pb-8 px-4 pt-3 max-w-md mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Calendar</h2>
          <p className="text-xs text-slate-500 font-medium">Smart AI Time-Blocking</p>
        </div>

        <button
          onClick={onOpenAICreate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Add via AI</span>
        </button>
      </div>

      {/* Week Day Carousel */}
      <div className="bg-white rounded-3xl p-3 border border-slate-100 shadow-xs flex items-center justify-between gap-1">
        {weekDays.map((d) => {
          const isSelected = selectedDayOffset === d.offset;
          return (
            <button
              key={d.offset}
              onClick={() => setSelectedDayOffset(d.offset)}
              className={`flex-1 py-2 px-1 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                isSelected
                  ? 'bg-gradient-to-b from-purple-600 to-indigo-600 text-white shadow-md scale-105'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>
                {d.dayName}
              </span>
              <span className="text-sm font-extrabold">{d.dateNum}</span>
              {d.isToday && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-purple-600'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Day Overview Banner */}
      <div className="bg-purple-50/80 rounded-2xl p-3.5 border border-purple-100 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-purple-950">
            {selectedDayOffset === 0 ? "Today's Schedule" : selectedDayOffset === 1 ? "Tomorrow's Schedule" : "Planned Schedule"}
          </span>
          <p className="text-slate-500 text-[11px] mt-0.5">5 time blocks · 3h 15m dedicated focus</p>
        </div>
        <span className="text-[10px] font-bold bg-white text-purple-700 px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs">
          Synced with Phone
        </span>
      </div>

      {/* Time Blocks List */}
      <div className="space-y-3">
        {schedule.map((block) => (
          <div
            key={block.id}
            className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 shadow-xs transition flex items-start justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{block.startTime} - {block.endTime}</span>
                </span>
                <span className="text-[10px] text-slate-400">({block.durationMinutes}m)</span>
                {block.priority && <PriorityBadge priority={block.priority} size="sm" showReasonIcon={false} />}
              </div>

              <h4 className="text-sm font-bold text-slate-900 truncate">{block.title}</h4>
              {block.reason && (
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{block.reason}</p>
              )}
            </div>

            {block.type !== 'break' && (
              <button
                onClick={() => onStartFocus(block.title)}
                className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-xl hover:bg-purple-100 transition shrink-0"
              >
                Focus
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
