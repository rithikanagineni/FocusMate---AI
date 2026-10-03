import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  Check,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Search,
  Filter,
  Sparkles,
  Play,
  ArrowUpRight,
  ShieldCheck,
  Eye,
  BookOpen,
  ChevronRight,
  RotateCcw,
  History,
  BarChart3,
  Layers,
  Award
} from 'lucide-react';
import { FocusSession, Priority, Category } from '../types';
import { api } from '../services/api';

interface AnalyticsScreenProps {
  onBack?: () => void;
  onStartFocus?: (taskTitle?: string) => void;
}

type Period = 'Day' | 'Week' | 'Month' | 'Year';
type WeekRange = 'This Week' | 'Last Week' | '2 Weeks Ago';
type ViewTab = 'overview' | 'history';
type StatusFilter = 'all' | 'completed' | 'in_progress';

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ onBack, onStartFocus }) => {
  // Top view switcher: Overview vs Focus History
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');

  // Overview Charts States
  const [activePeriod, setActivePeriod] = useState<Period>('Week');
  const [selectedWeek, setSelectedWeek] = useState<WeekRange>('This Week');
  const [isWeekDropdownOpen, setIsWeekDropdownOpen] = useState(false);

  // Focus History States
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load Focus Sessions
  useEffect(() => {
    async function loadSessions() {
      try {
        setIsLoadingSessions(true);
        const data = await api.getFocusSessions();
        setSessions(data);
      } catch (err) {
        console.error('Failed to load focus sessions:', err);
      } finally {
        setIsLoadingSessions(false);
      }
    }
    loadSessions();
  }, []);

  // Format CompletedAt date to human readable
  const formatSessionDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (isToday) return `Today, ${timeStr}`;
      if (isYesterday) return `Yesterday, ${timeStr}`;

      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    } catch {
      return dateStr;
    }
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    // Status filter
    if (statusFilter === 'completed' && !s.taskCompleted) return false;
    if (statusFilter === 'in_progress' && s.taskCompleted) return false;

    // Priority filter
    if (priorityFilter !== 'all' && s.priority !== priorityFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = s.taskTitle?.toLowerCase().includes(q);
      const matchesCategory = s.category?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesCategory) return false;
    }

    return true;
  });

  // Aggregate History Metrics
  const totalFocusMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalHours = Math.floor(totalFocusMinutes / 60);
  const remainingMins = totalFocusMinutes % 60;
  const completedSessionsCount = sessions.filter((s) => s.taskCompleted).length;
  const completionRate =
    sessions.length > 0 ? Math.round((completedSessionsCount / sessions.length) * 100) : 0;
  const averageDistractionScore =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + (s.distractionScore ?? 90), 0) / sessions.length
        )
      : 92;

  // Overview Period Data
  const periodData = {
    Day: {
      score: 92,
      trend: '+ 4%',
      wavePath: 'M 0 50 C 40 40, 90 20, 150 15 C 210 10, 260 25, 300 12',
      waveFill: 'M 0 50 C 40 40, 90 20, 150 15 C 210 10, 260 25, 300 12 L 300 60 L 0 60 Z',
      totalHours: '4.6',
      totalLabel: 'Today hrs',
      breakdown: [
        { label: 'Deep Work', hours: '2.5 hrs', pct: '54%', color: 'bg-indigo-500', stroke: '#6366F1', offset: 0, dash: 156 },
        { label: 'Meetings', hours: '1.0 hrs', pct: '22%', color: 'bg-sky-400', stroke: '#38BDF8', offset: 156, dash: 63 },
        { label: 'Learning', hours: '0.6 hrs', pct: '13%', color: 'bg-amber-400', stroke: '#FACC15', offset: 219, dash: 38 },
        { label: 'Other', hours: '0.5 hrs', pct: '11%', color: 'bg-rose-400', stroke: '#F87171', offset: 257, dash: 32 },
      ],
      bars: [
        { label: '9 AM', height: '80%', hours: '1.5h' },
        { label: '11 AM', height: '95%', hours: '2.0h' },
        { label: '1 PM', height: '25%', hours: '0.5h' },
        { label: '3 PM', height: '60%', hours: '1.2h' },
        { label: '5 PM', height: '40%', hours: '0.8h' },
        { label: '7 PM', height: '15%', hours: '0.3h' },
      ],
    },
    Week: {
      score: 85,
      trend: '↑ 18%',
      wavePath: 'M 0 45 C 50 15, 90 50, 140 25 C 190 5, 230 40, 300 10',
      waveFill: 'M 0 45 C 50 15, 90 50, 140 25 C 190 5, 230 40, 300 10 L 300 60 L 0 60 Z',
      totalHours: '18.5',
      totalLabel: 'Total hrs',
      breakdown: [
        { label: 'Deep Work', hours: '8.5 hrs', pct: '46%', color: 'bg-indigo-500', stroke: '#6366F1', offset: 0, dash: 133 },
        { label: 'Meetings', hours: '3.5 hrs', pct: '19%', color: 'bg-sky-400', stroke: '#38BDF8', offset: 133, dash: 55 },
        { label: 'Learning', hours: '3.0 hrs', pct: '16%', color: 'bg-amber-400', stroke: '#FACC15', offset: 188, dash: 46 },
        { label: 'Other', hours: '2.5 hrs', pct: '14%', color: 'bg-rose-400', stroke: '#F87171', offset: 234, dash: 40 },
      ],
      bars: selectedWeek === 'This Week'
        ? [
            { label: 'Mon', height: '62%', hours: '6.2h' },
            { label: 'Tue', height: '85%', hours: '8.5h' },
            { label: 'Wed', height: '70%', hours: '7.0h' },
            { label: 'Thu', height: '92%', hours: '9.2h' },
            { label: 'Fri', height: '54%', hours: '5.4h' },
            { label: 'Sat', height: '32%', hours: '3.2h' },
            { label: 'Sun', height: '40%', hours: '4.0h' },
          ]
        : selectedWeek === 'Last Week'
        ? [
            { label: 'Mon', height: '75%', hours: '7.5h' },
            { label: 'Tue', height: '60%', hours: '6.0h' },
            { label: 'Wed', height: '80%', hours: '8.0h' },
            { label: 'Thu', height: '65%', hours: '6.5h' },
            { label: 'Fri', height: '90%', hours: '9.0h' },
            { label: 'Sat', height: '20%', hours: '2.0h' },
            { label: 'Sun', height: '25%', hours: '2.5h' },
          ]
        : [
            { label: 'Mon', height: '50%', hours: '5.0h' },
            { label: 'Tue', height: '68%', hours: '6.8h' },
            { label: 'Wed', height: '55%', hours: '5.5h' },
            { label: 'Thu', height: '78%', hours: '7.8h' },
            { label: 'Fri', height: '60%', hours: '6.0h' },
            { label: 'Sat', height: '40%', hours: '4.0h' },
            { label: 'Sun', height: '30%', hours: '3.0h' },
          ],
    },
    Month: {
      score: 88,
      trend: '+ 12%',
      wavePath: 'M 0 40 C 60 50, 120 15, 180 30 C 240 10, 270 20, 300 8',
      waveFill: 'M 0 40 C 60 50, 120 15, 180 30 C 240 10, 270 20, 300 8 L 300 60 L 0 60 Z',
      totalHours: '74.2',
      totalLabel: 'Month hrs',
      breakdown: [
        { label: 'Deep Work', hours: '36.0 hrs', pct: '49%', color: 'bg-indigo-500', stroke: '#6366F1', offset: 0, dash: 142 },
        { label: 'Meetings', hours: '14.0 hrs', pct: '19%', color: 'bg-sky-400', stroke: '#38BDF8', offset: 142, dash: 55 },
        { label: 'Learning', hours: '12.0 hrs', pct: '16%', color: 'bg-amber-400', stroke: '#FACC15', offset: 197, dash: 46 },
        { label: 'Other', hours: '12.2 hrs', pct: '16%', color: 'bg-rose-400', stroke: '#F87171', offset: 243, dash: 46 },
      ],
      bars: [
        { label: 'Wk 1', height: '72%', hours: '18h' },
        { label: 'Wk 2', height: '88%', hours: '22h' },
        { label: 'Wk 3', height: '65%', hours: '16h' },
        { label: 'Wk 4', height: '75%', hours: '19h' },
      ],
    },
    Year: {
      score: 84,
      trend: '+ 24%',
      wavePath: 'M 0 35 C 70 20, 130 40, 200 15 C 250 25, 280 10, 300 5',
      waveFill: 'M 0 35 C 70 20, 130 40, 200 15 C 250 25, 280 10, 300 5 L 300 60 L 0 60 Z',
      totalHours: '890',
      totalLabel: 'Year hrs',
      breakdown: [
        { label: 'Deep Work', hours: '440 hrs', pct: '49%', color: 'bg-indigo-500', stroke: '#6366F1', offset: 0, dash: 142 },
        { label: 'Meetings', hours: '180 hrs', pct: '20%', color: 'bg-sky-400', stroke: '#38BDF8', offset: 142, dash: 58 },
        { label: 'Learning', hours: '150 hrs', pct: '17%', color: 'bg-amber-400', stroke: '#FACC15', offset: 200, dash: 49 },
        { label: 'Other', hours: '120 hrs', pct: '14%', color: 'bg-rose-400', stroke: '#F87171', offset: 249, dash: 40 },
      ],
      bars: [
        { label: 'Q1', height: '78%', hours: '215h' },
        { label: 'Q2', height: '85%', hours: '235h' },
        { label: 'Q3', height: '70%', hours: '195h' },
        { label: 'Q4', height: '90%', hours: '245h' },
      ],
    },
  };

  const currentData = periodData[activePeriod];

  return (
    <div className="space-y-4 pb-8 w-full max-w-3xl mx-auto animate-fade-in text-slate-800">
      {/* 1. Header with Back button and View Switcher */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition"
              title="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-base font-extrabold text-slate-900">Analytics & History</h2>
        </div>

        {/* View Toggle Tabs: Overview vs Focus History */}
        <div className="flex bg-slate-200/80 p-0.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Focus History</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'history' ? 'bg-purple-800 text-purple-100' : 'bg-slate-300 text-slate-700'
            }`}>
              {sessions.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: FOCUS HISTORY TAB                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider">Total Sessions</span>
                <History className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl font-black text-slate-900">{sessions.length}</div>
              <span className="text-[10px] text-slate-400 font-medium">Logged deep blocks</span>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider">Focus Time</span>
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="text-xl font-black text-slate-900">
                {totalHours}h {remainingMins}m
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Verified focus minutes</span>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider">Completion</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-600">{completionRate}%</div>
              <span className="text-[10px] text-slate-400 font-medium">
                {completedSessionsCount} of {sessions.length} finished
              </span>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider">Avg Attention</span>
                <Award className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-black text-slate-900">{averageDistractionScore}%</div>
              <span className="text-[10px] text-emerald-600 font-bold">Grade A • Proctor Verified</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search focus sessions by task title or category..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-800 placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'all', label: 'All Sessions' },
                  { id: 'completed', label: '✓ Completed' },
                  { id: 'in_progress', label: '⏳ In Progress' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setStatusFilter(chip.id as StatusFilter)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      statusFilter === chip.id
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                <Filter className="w-3 h-3 text-slate-400" />
                <span>Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="text-xs bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg px-2 py-0.5 focus:outline-hidden"
                >
                  <option value="all">All</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Session List */}
          <div className="space-y-2.5">
            {isLoadingSessions ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading your focus history...</span>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">No focus sessions found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                      ? 'Try clearing your filters or search query to see past sessions.'
                      : 'Complete your first focus block with camera proctoring to start logging your attention record.'}
                  </p>
                </div>

                {onStartFocus && (
                  <button
                    type="button"
                    onClick={() => onStartFocus()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start New Focus Session</span>
                  </button>
                )}
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-purple-200 transition shadow-xs space-y-2.5 group"
                >
                  {/* Top Row: Task Title & Status Tag */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {/* Category Badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                          {session.category || 'Study'}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                            session.priority === 'HIGH'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : session.priority === 'LOW'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {session.priority || 'MEDIUM'}
                        </span>

                        {/* Date and Time */}
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-slate-300" />
                          <span>{formatSessionDate(session.completedAt)}</span>
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-700 transition line-clamp-1">
                        {session.taskTitle}
                      </h4>
                    </div>

                    {/* Completion Status Badge */}
                    <div className="shrink-0 text-right">
                      {session.taskCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Task Completed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>In Progress</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Row: Duration & Proctoring Stats Badges */}
                  <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {/* Duration */}
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span>{session.durationMinutes} min focus block</span>
                    </div>

                    {/* Attention Score */}
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {session.distractionScore ?? 94}% Focus Score
                      </span>
                    </div>

                    {/* Incidents Breakdown */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                      <span className={session.tabSwitches ? 'text-rose-600 font-bold' : ''}>
                        {session.tabSwitches ? `${session.tabSwitches} Tab Switch(es)` : '0 Tab Switches'}
                      </span>
                      <span>•</span>
                      <span>
                        {session.lookAwayEvents ? `${session.lookAwayEvents} Look-Away` : '0 Look-Away'}
                      </span>
                    </div>
                  </div>

                  {/* Pauses breakdown if present */}
                  {session.pauseReasons && session.pauseReasons.length > 0 && (
                    <div className="text-[10px] text-slate-500 bg-amber-50/50 p-2 rounded-lg border border-amber-100/70 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="font-semibold text-amber-800">
                        {session.pauseReasons.length} Logged Pause(s):
                      </span>
                      <span className="truncate">{session.pauseReasons.join(', ')}</span>
                    </div>
                  )}

                  {/* Card Footer: Quick Action to Re-focus */}
                  {onStartFocus && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => onStartFocus(session.taskTitle)}
                        className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-purple-50 transition"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Focus on this task again</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: OVERVIEW CHARTS TAB                                               */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-fade-in">
          {/* Quick Focus History Banner Alert linking to History Tab */}
          <div
            onClick={() => setActiveTab('history')}
            className="p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border border-purple-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:border-purple-300 transition shadow-2xs group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition">
                  Focus History ({sessions.length} Sessions Logged)
                </h4>
                <p className="text-[10px] text-slate-500">
                  {totalHours}h {remainingMins}m total verified focus time • {completionRate}% task completion rate
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-purple-600 group-hover:translate-x-0.5 transition">
              <span>View Log</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* 1. Productivity Score Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-5 text-white shadow-lg shadow-purple-500/20">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-purple-200 font-medium">Productivity Score</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black tracking-tight">{currentData.score}</span>
                  <span className="text-xl font-bold text-purple-200">%</span>
                </div>
                <span className="text-xs text-purple-200 font-semibold">
                  {currentData.score >= 90 ? 'Peak Focus' : 'Excellent Performance'}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white border border-white/20">
                <span>{currentData.trend}</span>
              </div>
            </div>

            {/* Smooth Dynamic Wave Sparkline Chart */}
            <div className="mt-3 h-14 relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 60" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d={currentData.waveFill}
                  fill="url(#waveGrad)"
                  className="transition-all duration-500"
                />
                <path
                  d={currentData.wavePath}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                <circle cx="300" cy="10" r="3.5" fill="#FFFFFF" />
              </svg>
            </div>

            <div className="text-right text-[10px] text-purple-200 mt-1 font-medium">
              vs previous {activePeriod.toLowerCase()}
            </div>
          </div>

          {/* Period Filter Tabs (Day | Week | Month | Year) */}
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
            {(['Day', 'Week', 'Month', 'Year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activePeriod === period
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* 2. Time Distribution Section */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Time Distribution</h3>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                {activePeriod} View
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Dynamic Donut Chart */}
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {currentData.breakdown.map((item, idx) => (
                    <circle
                      key={idx}
                      cx="60"
                      cy="60"
                      r="46"
                      stroke={item.stroke}
                      strokeWidth="12"
                      strokeDasharray="289"
                      strokeDashoffset={item.offset}
                      fill="none"
                      className="transition-all duration-500"
                    />
                  ))}
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-slate-900 leading-tight">
                    {currentData.totalHours}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{currentData.totalLabel}</span>
                </div>
              </div>

              {/* Legend Items */}
              <div className="flex-1 space-y-2 text-xs">
                {currentData.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                      <span className="font-semibold text-slate-700">{item.label}</span>
                    </div>
                    <span className="text-slate-500 text-[11px] font-medium">
                      {item.hours} ({item.pct})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Daily / Period Focus Bar Chart WITH INTERACTIVE DROPDOWN */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs relative">
            <div className="flex items-center justify-between mb-4 relative">
              <h3 className="text-sm font-bold text-slate-900">
                {activePeriod === 'Day'
                  ? 'Hourly Focus'
                  : activePeriod === 'Week'
                  ? 'Daily Focus'
                  : activePeriod === 'Month'
                  ? 'Weekly Focus'
                  : 'Quarterly Focus'}
              </h3>

              {/* Interactive Week/Range Selector Button with Dropdown */}
              {activePeriod === 'Week' ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsWeekDropdownOpen(!isWeekDropdownOpen)}
                    className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-xl border border-purple-200 transition active:scale-95"
                  >
                    <span>{selectedWeek}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isWeekDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Popover Dropdown */}
                  {isWeekDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-fade-in">
                      {(['This Week', 'Last Week', '2 Weeks Ago'] as const).map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => {
                            setSelectedWeek(w);
                            setIsWeekDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition ${
                            selectedWeek === w
                              ? 'bg-purple-50 text-purple-700 font-bold'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{w}</span>
                          {selectedWeek === w && <Check className="w-3.5 h-3.5 text-purple-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-400">
                  {activePeriod === 'Day' ? 'Today' : activePeriod === 'Month' ? 'This Month' : 'This Year'}
                </span>
              )}
            </div>

            {/* Focus Bars */}
            <div className="flex items-end justify-between gap-2 h-40 pt-2 px-1">
              {currentData.bars.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition">
                    {d.hours}
                  </span>
                  <div className="w-full bg-slate-100 rounded-full overflow-hidden flex flex-col justify-end h-28 p-0.5">
                    <div
                      className="w-full rounded-full bg-purple-600 transition-all duration-500 group-hover:bg-purple-700"
                      style={{ height: d.height }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 truncate">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
