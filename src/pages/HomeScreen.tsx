import React, { useState } from 'react';
import { Task, ScheduleBlock } from '../types';
import {
  Bell,
  Flame,
  Clock,
  Calendar,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Circle,
  CheckCircle2,
  Camera,
  Mic,
  FileUp,
  Folder,
  FileText,
  Plus,
  LogIn,
  LogOut,
  RefreshCw,
  Check
} from 'lucide-react';
import { RobotBuddy } from '../components/RobotBuddy';
import { UserProfile } from '../services/authService';

interface HomeScreenProps {
  tasks: Task[];
  schedule?: ScheduleBlock[];
  user?: UserProfile | null;
  onToggleComplete: (id: string) => void;
  onOpenQuickAction: (action: 'camera' | 'voice' | 'files' | 'text') => void;
  onStartFocus: (task: Task | string) => void;
  onViewAllTasks: () => void;
  onOptimizeDay: () => void;
  onOpenNotifications?: () => void;
  onEditTask?: (task: Task) => void;
  onRescheduleTask?: (task: Task) => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
  onGetStarted?: () => void;
  onSignOut?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  tasks,
  schedule,
  user,
  onToggleComplete,
  onOpenQuickAction,
  onStartFocus,
  onViewAllTasks,
  onOptimizeDay,
  onOpenNotifications,
  onSignIn,
  onSignUp,
  onGetStarted,
  onSignOut,
}) => {
  const [isBalancing, setIsBalancing] = useState(false);
  const [balanceMessage, setBalanceMessage] = useState<string | null>(null);

  const handleAutoBalance = async () => {
    setIsBalancing(true);
    setBalanceMessage(null);
    try {
      await onOptimizeDay();
      setBalanceMessage('AI Schedule Rebalanced!');
      setTimeout(() => setBalanceMessage(null), 3500);
    } catch (err) {
      console.error('Failed to balance schedule:', err);
    } finally {
      setIsBalancing(false);
    }
  };

  // Real dynamic schedule items mapped from schedule prop or active user tasks
  const scheduleItems =
    schedule && schedule.length > 0
      ? schedule.map((block) => ({
          id: block.id,
          title: block.title,
          time: `${block.startTime} - ${block.endTime}`,
          color:
            block.type === 'deep_work'
              ? 'bg-indigo-600'
              : block.type === 'study'
              ? 'bg-amber-500'
              : block.type === 'meeting'
              ? 'bg-purple-600'
              : 'bg-emerald-500',
          completed: block.status === 'completed',
          type: block.type,
          reason: block.reason,
        }))
      : tasks.length > 0
      ? tasks.slice(0, 4).map((t, idx) => ({
          id: `dyn-${t.id}`,
          title: t.title,
          time:
            t.scheduledTime ||
            (idx === 0
              ? '9:00 AM - 10:30 AM'
              : idx === 1
              ? '11:00 AM - 12:00 PM'
              : idx === 2
              ? '2:00 PM - 3:00 PM'
              : '4:00 PM - 5:00 PM'),
          color:
            t.priority === 'HIGH'
              ? 'bg-indigo-600'
              : t.priority === 'MEDIUM'
              ? 'bg-amber-500'
              : 'bg-emerald-500',
          completed: t.status === 'COMPLETED',
          type: 'deep_work',
          reason: t.priorityReason || 'AI Priority Slot',
        }))
      : [];

  const highPriorityTasks = tasks.filter((t) => t.priority === 'HIGH').slice(0, 3);

  return (
    <div className="space-y-5 pb-8 w-full max-w-3xl mx-auto animate-fade-in text-slate-800">
      {/* 1. Header with Avatar & Bell (Logged In) OR Sign In / Sign Up (Logged Out) */}
      <div className="flex items-center justify-between pb-1">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-400 p-0.5 shadow-sm shrink-0 overflow-hidden">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'}
                alt={user.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-400 leading-tight">
                Good Morning,
              </h2>
              <div className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                {user.name ? user.name.split(' ')[0] : 'Rithika'} <span className="inline-block text-amber-500">👋</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Let's make today productive!</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-500/25">
              F.
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                Focus<span className="text-purple-600">Mind</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Your AI Productivity Companion</p>
            </div>
          </div>
        )}

        {/* Top Right Controls */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNotifications}
                className="relative p-2.5 rounded-2xl bg-white border border-slate-100 shadow-xs hover:bg-slate-50 text-slate-600 transition"
                aria-label="Open notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5 stroke-[2]" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border border-white animate-pulse" />
              </button>

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl shadow-xs transition active:scale-95"
                  title="Sign Out to Home Page"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onSignIn}
                className="text-xs font-bold text-slate-700 hover:text-purple-700 px-3 py-2 rounded-xl hover:bg-slate-100 transition flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                onClick={onSignUp || onGetStarted}
                className="text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-4 py-2 rounded-xl shadow-md shadow-purple-500/20 active:scale-95 transition flex items-center gap-1.5"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Hero Section: Logged In (Today's Progress) vs Logged Out (Get Started Hero) */}
      {user ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-700 p-6 text-white shadow-xl shadow-purple-500/20 flex items-center justify-between">
          <div className="relative z-10 flex-1 pr-4 space-y-2">
            <span className="text-xs text-purple-200 font-bold block uppercase tracking-wider">
              Today's Progress
            </span>
            <div className="text-4xl font-black tracking-tight">62%</div>

            {/* Progress Bar */}
            <div className="w-full max-w-[220px] bg-black/25 rounded-full h-2.5 overflow-hidden">
              <div className="bg-white rounded-full h-full w-[62%] transition-all duration-500" />
            </div>

            <div className="flex items-center gap-3 pt-1 text-xs text-purple-100 font-medium">
              <span>4h 20m planned</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>5-day streak</span>
              </span>
            </div>
          </div>

          {/* Robot Buddy Mascot */}
          <div className="relative z-10 shrink-0">
            <RobotBuddy size={96} />
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2B1055] via-[#351469] to-[#1F0C42] p-6 sm:p-8 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="relative z-10 flex-1 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>AI-Powered Focus Engine</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Turn Information Overload Into{' '}
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-amber-200 bg-clip-text text-transparent">
                Focused Action
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed max-w-lg">
              FocusMind transforms messy chat messages, voice memos, and syllabus screenshots into prioritized daily schedules and deep work sessions.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onGetStarted || onSignUp}
                className="py-3 px-6 rounded-2xl bg-white hover:bg-slate-100 text-purple-900 font-extrabold text-xs shadow-lg active:scale-95 transition flex items-center gap-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onSignIn}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition"
              >
                Sign In
              </button>
            </div>
          </div>

          <div className="relative z-10 shrink-0 hidden sm:block">
            <RobotBuddy size={110} />
          </div>
        </div>
      )}

      {/* 3. Four Mini-Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Tasks</div>
            <div className="text-sm font-black text-slate-900">12/18</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Focus Time</div>
            <div className="text-sm font-black text-slate-900">4.6 hrs</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Streak</div>
            <div className="text-sm font-black text-slate-900">5 Days</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
            <div className="text-sm font-black text-slate-900">85%</div>
          </div>
        </div>
      </div>

      {/* 4. Quick Capture Actions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
          <span>Quick Capture with AI</span>
          <span className="text-[11px] text-purple-600 font-semibold">Multimodal</span>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          <button
            onClick={() => onOpenQuickAction('camera')}
            className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-purple-300 transition flex flex-col items-center gap-1.5 group active:scale-95"
            title="Open Camera Scanner"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Camera</span>
          </button>

          <button
            onClick={() => onOpenQuickAction('voice')}
            className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-rose-300 transition flex flex-col items-center gap-1.5 group active:scale-95"
            title="Record Voice Note"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-105 transition">
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Voice</span>
          </button>

          <button
            onClick={() => onOpenQuickAction('files')}
            className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-emerald-300 transition flex flex-col items-center gap-1.5 group active:scale-95"
            title="Upload Files & Documents"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <Folder className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Files</span>
          </button>

          <button
            onClick={() => onOpenQuickAction('text')}
            className="p-3 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-sky-300 transition flex flex-col items-center gap-1.5 group active:scale-95"
            title="Paste or Type Text"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center group-hover:scale-105 transition">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Text</span>
          </button>
        </div>
      </div>

      {/* 5. Today's AI Time-Blocked Schedule */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Today's Schedule</h3>
              <p className="text-[10px] text-slate-400">AI-optimized time blocks</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {balanceMessage && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1 animate-fade-in">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{balanceMessage}</span>
              </span>
            )}
            <button
              onClick={handleAutoBalance}
              disabled={isBalancing}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 active:scale-95 ${
                isBalancing
                  ? 'bg-purple-100 text-purple-400 border-purple-200 cursor-not-allowed'
                  : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200 hover:shadow-xs'
              }`}
              title="Automatically organize your tasks into optimal deep focus and break windows"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBalancing ? 'animate-spin' : ''}`} />
              <span>{isBalancing ? 'Balancing...' : 'Auto-Balance'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {scheduleItems.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1.5">
              <p className="text-xs text-slate-500 font-medium">No schedule blocks generated yet.</p>
              <button
                onClick={handleAutoBalance}
                className="text-[11px] font-bold text-purple-600 hover:underline"
              >
                Click Auto-Balance to generate your schedule
              </button>
            </div>
          ) : (
            scheduleItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onStartFocus(item.title)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-purple-50/50 border border-slate-100 hover:border-purple-200 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-900 transition">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400">{item.time}</p>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-purple-600 group-hover:underline">
                  Start Focus
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. High Priority Deadlines */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
          <span>Priority Tasks</span>
          <button
            onClick={onViewAllTasks}
            className="text-[11px] text-purple-600 font-semibold hover:underline"
          >
            View All ({tasks.length})
          </button>
        </div>

        <div className="space-y-2">
          {highPriorityTasks.map((t) => {
            const isDone = t.status === 'COMPLETED';
            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-center justify-between gap-3 hover:border-purple-200 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onToggleComplete(t.id)}
                    className="text-purple-600 hover:text-purple-700 transition shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 fill-purple-600 text-white" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-purple-600" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <h4
                      className={`text-xs font-bold truncate ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {t.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {t.deadline} · {t.estimatedMinutes} min
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onStartFocus(t)}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] rounded-lg shrink-0 transition"
                >
                  Focus
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
