import React from 'react';
import { ProductivityStats } from '../types';
import { Sparkles, TrendingUp, Clock, CheckCircle2, Zap } from 'lucide-react';

interface ProductivityChartProps {
  stats: ProductivityStats;
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({ stats }) => {
  const maxFocus = Math.max(...stats.weeklyData.map((d) => d.focusMinutes), 240);

  return (
    <div className="space-y-4">
      {/* 4 Score Badges Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-purple-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-purple-600 mb-1">
            <Zap className="w-4 h-4 fill-purple-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.productivityScore}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +14% vs last week
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-blue-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-blue-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Focus</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.focusTimeFormatted || '12h 35m'}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Daily avg: 2h 40m</div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-emerald-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.tasksCompleted}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across 7 days</div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-pink-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-pink-600 mb-1">
            <Sparkles className="w-4 h-4 text-pink-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completion</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.completionRate}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Top 5% student tier</div>
        </div>
      </div>

      {/* Weekly Focus Time Bar Chart */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Weekly Focus Activity</h4>
            <p className="text-[11px] text-slate-400">Minutes in uninterrupted deep work</p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
            This Week
          </span>
        </div>

        <div className="flex items-end justify-between gap-2 h-36 pt-4 px-1">
          {stats.weeklyData.map((d, i) => {
            const heightPercent = Math.max(15, Math.round((d.focusMinutes / maxFocus) * 100));
            const isToday = i === 3; // Thu

            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="text-[9px] font-bold text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.focusMinutes}m
                </div>
                <div className="w-full bg-slate-100 rounded-xl overflow-hidden flex flex-col justify-end h-28 p-0.5">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-purple-600 to-pink-500 shadow-xs'
                        : 'bg-gradient-to-t from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className={`text-[10px] font-semibold ${isToday ? 'text-purple-700 font-bold' : 'text-slate-400'}`}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs">
        <h4 className="text-sm font-bold text-slate-800 mb-1">Priority Distribution</h4>
        <p className="text-[11px] text-slate-400 mb-3">Workload breakdown by urgency level</p>

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> High Priority
              </span>
              <span>{stats.priorityDistribution.high} tasks</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${(stats.priorityDistribution.high / 7) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium Priority
              </span>
              <span>{stats.priorityDistribution.medium} tasks</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${(stats.priorityDistribution.medium / 7) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low Priority
              </span>
              <span>{stats.priorityDistribution.low} tasks</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${(stats.priorityDistribution.low / 7) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 rounded-3xl p-4 border border-purple-100/70 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-purple-950">AI Productivity Insights</h4>
        </div>

        <div className="space-y-2.5">
          {stats.insights.map((insight, idx) => (
            <div
              key={idx}
              className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-purple-100 text-xs text-slate-700 leading-relaxed shadow-2xs flex items-start gap-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
