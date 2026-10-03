import React from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  Zap,
  Target,
  Camera,
  Mic,
  BarChart2,
  Flame,
  Play,
  FileText,
  Layers,
  Brain,
  HelpCircle,
  LogIn
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onSignUp,
}) => {
  return (
    <div className="min-h-screen bg-[#F8F9FE] text-slate-800 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onGetStarted}>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-purple-500/25">
              F.
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-tight">
                Focus<span className="text-purple-600">Mind</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-purple-600 -mt-0.5">
                AI Companion
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-purple-600 transition">Core Features</a>
            <a href="#how-it-works" className="hover:text-purple-600 transition">How It Works</a>
            <a href="#schedule" className="hover:text-purple-600 transition">Smart Schedule</a>
            <a href="#analytics" className="hover:text-purple-600 transition">Analytics</a>
            <a href="#faq" className="hover:text-purple-600 transition">FAQ</a>
          </nav>

          {/* Top Right Action Buttons (Sign In / Sign Up) */}
          <div className="flex items-center gap-3">
            <button
              onClick={onSignIn}
              className="text-xs font-bold text-slate-700 hover:text-purple-700 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition flex items-center gap-1.5"
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
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-14 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-gradient-to-b from-purple-100/70 via-indigo-50/40 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Next-Gen AI Productivity Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Turn Information Overload Into{' '}
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent">
              Focused Action
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Stop manually organizing to-do lists. FocusMind turns unstructured screenshots, voice notes, and professor messages into prioritized tasks, realistic schedules, and deep work sessions.
          </p>

          {/* CTA Buttons in Hero Section */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-purple-600/30 active:scale-95 transition flex items-center justify-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onSignIn}
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-2xs transition flex items-center justify-center gap-2"
            >
              <span>I Have an Account</span>
            </button>
          </div>

          {/* Feature Highlights Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Smart Multimodal Capture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Cognitive Priority Balancing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Auto-Dynamic Rescheduling</span>
            </div>
          </div>
        </div>

        {/* 3. Interactive Hero Preview Card */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-slate-400 ml-2">FocusMind Live Schedule Blueprint</span>
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                AI Engine Active
              </span>
            </div>

            <div className="pt-4 grid sm:grid-cols-3 gap-3">
              {/* Daily Schedule Preview */}
              <div className="sm:col-span-2 bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>Today's AI Schedule</span>
                  </span>
                  <span className="text-[11px] text-purple-600 font-semibold">4.6 hrs deep work</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">Complete ML Assignment</h4>
                      <p className="text-[11px] text-slate-500">09:00 - 10:30 · Deep Work</p>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md border border-rose-100">
                      HIGH
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">Team Architecture Review</h4>
                      <p className="text-[11px] text-slate-500">11:00 - 12:00 · Meeting</p>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md border border-amber-100">
                      HIGH
                    </span>
                  </div>
                </div>
              </div>

              {/* Productivity Card Preview */}
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-4 text-white flex flex-col justify-between">
                <div>
                  <span className="text-xs text-purple-200 font-semibold">Productivity Score</span>
                  <div className="text-3xl font-black mt-1">85%</div>
                  <p className="text-[11px] text-purple-100 mt-1">
                    ↑ 18% vs last week with 5-day focus streak
                  </p>
                </div>

                <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-bold">
                    <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>5 Days Active</span>
                  </span>
                  <span className="text-[11px] text-purple-200">On Track</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Everything You Need to Reclaim Your Focus
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              FocusMind works with how you naturally communicate and capture tasks.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Feature 1 */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Multimodal Input</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Take a photo of the whiteboard, upload a chat screenshot, or record a quick voice memo.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Explainable Priority</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clear reasoning on why every single task is High, Medium, or Low priority.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Smart Rescheduling</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tasks take longer than planned? One tap shifts downstream tasks without breaking focus.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Focus Analytics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Deep work metrics, weekly focus distribution, and streak monitoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 bg-slate-50/60 border-t border-slate-100">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
              Simple 3-Step Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">How FocusMind Works</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900">Capture Instantly</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Drop in screenshots of deadlines, voice memos from lectures, or quick text tasks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900">AI Priority & Plan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                FocusMind estimates duration, assigns transparent priority reasoning, and blocks out your schedule.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900">Execute in Deep Work</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Jump into the distraction-free focus timer and watch your productivity streak grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-16 px-4 sm:px-6 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Everything you need to know about FocusMind</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-xs text-slate-900 mb-1">How does FocusMind decide priority?</h4>
              <p className="text-xs text-slate-500">
                FocusMind calculates priority based on upcoming deadlines, estimated effort, task type, and cognitive bandwidth to protect you from burnout.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-xs text-slate-900 mb-1">What happens if a task takes longer than planned?</h4>
              <p className="text-xs text-slate-500">
                Simply click "Auto-Balance" or reschedule. FocusMind dynamically recalculates your remaining schedule and shifts downstream commitments.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-xs text-slate-900 mb-1">Are my tasks saved when I log out?</h4>
              <p className="text-xs text-slate-500">
                Yes! Every change, new task, and profile modification is saved to your account. When you log back in, all your tasks and progress are completely restored.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom Call to Action */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-[#2B1055] via-[#351469] to-[#1F0C42] text-white">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Ready to Take Control of Your Daily Schedule?
          </h2>
          <p className="text-xs sm:text-sm text-purple-200 max-w-xl mx-auto leading-relaxed">
            Join students and professionals who organize their day with FocusMind. Start free today.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="py-3.5 px-8 rounded-2xl bg-white hover:bg-slate-100 text-purple-900 font-extrabold text-sm shadow-xl active:scale-95 transition"
            >
              Get Started with FocusMind
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-6 px-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        <p>© 2026 FocusMind. Built for focused minds and high achievers.</p>
      </footer>
    </div>
  );
};
