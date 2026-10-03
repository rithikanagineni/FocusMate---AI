import React, { useState } from 'react';
import {
  ChevronLeft,
  Plus,
  Calendar,
  CheckSquare,
  Square,
  Sparkles,
  Camera,
  Mic,
  Folder,
  FileText
} from 'lucide-react';
import { Priority } from '../types';

interface CreateWithAIScreenProps {
  onBack?: () => void;
  onSubmitGeneratedTasks: (tasks: any[]) => void;
  onOpenQuickCapture?: (type: string) => void;
}

export const CreateWithAIScreen: React.FC<CreateWithAIScreenProps> = ({
  onBack,
  onSubmitGeneratedTasks,
  onOpenQuickCapture,
}) => {
  const [goalText, setGoalText] = useState('Create a project architecture and study schedule for midterm exams.');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [dueDate, setDueDate] = useState('Today, 5:00 PM');

  const [suggestedTasks, setSuggestedTasks] = useState([
    {
      id: 'sug-1',
      title: 'Submit ML Assignment 3',
      desc: 'Complete loss curves and export validation code',
      tag: 'High',
      tagColor: 'bg-rose-50 text-rose-600 border border-rose-200/60',
      checked: true,
    },
    {
      id: 'sug-2',
      title: 'Review Chapter 3 & 4',
      desc: 'Deep work study session for Friday midterm exam',
      tag: 'Medium',
      tagColor: 'bg-amber-50 text-amber-600 border border-amber-200/60',
      checked: true,
    },
    {
      id: 'sug-3',
      title: 'Team Architecture Review',
      desc: 'Prepare slide deck and practice live demo pitch',
      tag: 'High',
      tagColor: 'bg-rose-50 text-rose-600 border border-rose-200/60',
      checked: true,
    },
  ]);

  const toggleCheck = (id: string) => {
    setSuggestedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t))
    );
  };

  const handleGenerateAndAdd = () => {
    const selected = suggestedTasks
      .filter((t) => t.checked)
      .map((t) => ({
        id: `task-${Date.now()}-${t.id}`,
        title: t.title,
        description: t.desc,
        priority: t.tag === 'High' ? 'HIGH' : t.tag === 'Medium' ? 'MEDIUM' : 'LOW',
        deadline: dueDate,
        estimatedMinutes: 60,
        status: 'PENDING',
        category: 'Project',
        source: 'ai',
      }));

    onSubmitGeneratedTasks(selected);
  };

  return (
    <div className="space-y-5 pb-8 w-full max-w-2xl mx-auto animate-fade-in text-slate-800">
      {/* 1. Header */}
      <div className="flex items-center justify-between py-1">
        <button
          onClick={onBack}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition flex items-center gap-1.5 text-xs font-bold"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <h2 className="text-base font-extrabold text-slate-900">Create With AI</h2>

        <div className="w-12" />
      </div>

      {/* Multimodal Quick Capture Row */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-2">
        <span className="text-xs font-bold text-slate-700 block">
          Or Capture directly from Source:
        </span>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onOpenQuickCapture?.('camera')}
            className="py-2.5 px-2 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex flex-col items-center gap-1 transition active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Camera</span>
          </button>

          <button
            onClick={() => onOpenQuickCapture?.('voice')}
            className="py-2.5 px-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex flex-col items-center gap-1 transition active:scale-95"
          >
            <Mic className="w-4 h-4" />
            <span>Voice</span>
          </button>

          <button
            onClick={() => onOpenQuickCapture?.('files')}
            className="py-2.5 px-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex flex-col items-center gap-1 transition active:scale-95"
          >
            <Folder className="w-4 h-4" />
            <span>Files</span>
          </button>

          <button
            onClick={() => onOpenQuickCapture?.('text')}
            className="py-2.5 px-2 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex flex-col items-center gap-1 transition active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Text</span>
          </button>
        </div>
      </div>

      {/* 2. Goal Description Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600 block">
          Describe your task or goal:
        </label>
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs focus-within:border-purple-600 transition">
          <textarea
            rows={2}
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="Describe your goal..."
            className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden resize-none bg-transparent"
          />
        </div>
      </div>

      {/* 3. AI Suggested Tasks Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-purple-700">AI Suggested Tasks</h3>

        <div className="space-y-2">
          {suggestedTasks.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-purple-200 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCheck(item.id);
                  }}
                  className="text-purple-600 focus:outline-hidden"
                >
                  {item.checked ? (
                    <CheckSquare className="w-5 h-5 fill-purple-600 text-white" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300" />
                  )}
                </button>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{item.desc}</p>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${item.tagColor}`}>
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="pt-2">
        <button
          onClick={handleGenerateAndAdd}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-600/25 active:scale-95 transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>Add Selected to Plan ({suggestedTasks.filter((t) => t.checked).length})</span>
        </button>
      </div>
    </div>
  );
};
