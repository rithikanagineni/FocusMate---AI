import React from 'react';
import { Camera, Brain, Calendar, CheckSquare, Sparkles } from 'lucide-react';
import { RobotBuddy } from './RobotBuddy';

export const ShowcaseHeroPanel: React.FC = () => {
  return (
    <div className="hidden lg:flex flex-col justify-between w-80 xl:w-96 p-8 bg-gradient-to-b from-purple-50/70 via-indigo-50/40 to-white select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Sparkles className="w-6 h-6 fill-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Focus<span className="text-purple-600">Mate</span>
          </h1>
        </div>

        <p className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-6">
          Your AI Productivity Companion
        </p>

        <p className="text-sm text-slate-600 leading-relaxed font-normal mb-8">
          <strong className="text-slate-800">Capture. Understand. Plan. Achieve.</strong>
          <br />
          Turn your ideas, messages and files into actionable tasks — automatically.
        </p>

        {/* 4 Feature Step Cards */}
        <div className="space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Capture</h4>
              <p className="text-[11px] text-slate-500">Screenshots, voice, files, text</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">AI Understands</h4>
              <p className="text-[11px] text-slate-500">Extracts tasks, deadlines, priorities</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Plan</h4>
              <p className="text-[11px] text-slate-500">Builds your perfect schedule</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Achieve</h4>
              <p className="text-[11px] text-slate-500">Stay focused and get more done</p>
            </div>
          </div>
        </div>
      </div>

      {/* Robot Mascot with "Smarter Days Ahead" */}
      <div className="mt-12 flex flex-col items-center text-center">
        <RobotBuddy size={110} />
        <div className="mt-3 text-lg font-extrabold text-purple-600 rotate-[-4deg] tracking-wide" style={{ fontFamily: 'cursive, sans-serif' }}>
          Smarter Days Ahead
        </div>
      </div>
    </div>
  );
};
