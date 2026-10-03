import React, { useState } from 'react';
import {
  Home,
  CheckSquare,
  Plus,
  Calendar,
  BarChart2,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut
} from 'lucide-react';
import { UserProfile } from '../services/authService';

export type NavTab = 'home' | 'tasks' | 'create_ai' | 'calendar' | 'analytics' | 'profile';

interface SidebarNavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenCreate: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  user?: UserProfile | null;
  onSignOut?: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreate,
  isExpanded: controlledExpanded,
  onToggleExpand: controlledToggle,
  user,
  onSignOut,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const toggleExpand = controlledToggle || (() => setInternalExpanded((prev) => !prev));

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'tasks' as const, label: 'My Tasks', icon: CheckSquare },
    { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart2 },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <aside
      className={`bg-gradient-to-b from-[#2B1055] via-[#351469] to-[#1F0C42] text-white flex flex-col py-4 justify-between shrink-0 shadow-2xl z-40 select-none border-r border-purple-900/40 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-48 sm:w-52 px-3' : 'w-14 sm:w-16 items-center px-1'
      }`}
    >
      {/* Top Header with Expand/Compress Toggle Button */}
      <div className="flex flex-col gap-4 w-full">
        {/* Toggle Button */}
        <button
          onClick={toggleExpand}
          className={`flex items-center gap-2.5 p-2 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white shadow-xs group ${
            isExpanded ? 'justify-between w-full px-3' : 'justify-center w-10 h-10 mx-auto'
          }`}
          title={isExpanded ? 'Collapse Navigation Bar' : 'Expand Navigation Bar'}
          aria-label={isExpanded ? 'Collapse Navigation Bar' : 'Expand Navigation Bar'}
        >
          {isExpanded ? (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-purple-500/40 flex items-center justify-center font-black text-xs text-white">
                  F.
                </div>
                <span className="font-extrabold text-xs tracking-tight text-white truncate">
                  Focus<span className="text-purple-300">Mind</span>
                </span>
              </div>
              <PanelLeftClose className="w-4 h-4 text-purple-200 group-hover:text-white shrink-0" />
            </>
          ) : (
            <PanelLeftOpen className="w-5 h-5 text-purple-200 group-hover:text-white" />
          )}
        </button>

        {/* Center Action '+' Button */}
        <button
          onClick={onOpenCreate}
          className={`rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 text-white shadow-lg shadow-purple-600/30 flex items-center transition-all hover:scale-102 active:scale-95 group relative ${
            isExpanded
              ? 'w-full py-2.5 px-3 gap-2.5 justify-start'
              : 'w-10 h-10 justify-center mx-auto'
          }`}
          title="Create with AI"
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <Plus className="w-5 h-5 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
          </div>
          {isExpanded && (
            <span className="text-xs font-bold text-white tracking-tight truncate animate-fade-in">
              Create with AI
            </span>
          )}
          {!isExpanded && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-[#2B1055]" />
          )}
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 w-full mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative rounded-2xl flex items-center transition-all group ${
                  isExpanded
                    ? 'w-full px-3 py-2.5 gap-3'
                    : 'w-10 h-10 justify-center mx-auto'
                } ${
                  isActive
                    ? 'bg-white text-purple-700 shadow-md font-bold'
                    : 'text-purple-200/70 hover:text-white hover:bg-white/10'
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />

                {isExpanded && (
                  <span className="text-xs font-bold tracking-tight truncate animate-fade-in text-left flex-1">
                    {item.label}
                  </span>
                )}

                {isActive && !isExpanded && (
                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-purple-400 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Sign Out (if logged in) + Status */}
      <div className="flex flex-col gap-2 w-full pt-2 border-t border-purple-900/40">
        {user && onSignOut && (
          <button
            onClick={onSignOut}
            className={`rounded-2xl flex items-center transition-all text-rose-300 hover:text-white hover:bg-rose-600/30 active:scale-95 group ${
              isExpanded
                ? 'w-full px-3 py-2 gap-2.5'
                : 'w-10 h-10 justify-center mx-auto'
            }`}
            title="Sign Out to Home Page"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400 group-hover:text-rose-200" />
            {isExpanded && (
              <span className="text-xs font-bold tracking-tight truncate text-left text-rose-300 group-hover:text-white">
                Sign Out
              </span>
            )}
          </button>
        )}

        <div
          className={`flex items-center gap-2 ${
            isExpanded ? 'px-2' : 'flex-col items-center justify-center'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400 animate-pulse shrink-0" />
          {isExpanded ? (
            <span className="text-[11px] font-semibold text-purple-200/80 truncate">
              AI Engine Ready
            </span>
          ) : (
            <span className="text-[9px] font-semibold text-purple-300/60 uppercase tracking-widest">
              AI
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};
