import React from 'react';
import { SidebarNavigation, NavTab } from './SidebarNavigation';
import { OfflineIndicator } from './OfflineIndicator';
import { UserProfile } from '../services/authService';

interface AppShellProps {
  children: React.ReactNode;
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAICreate: () => void;
  productivityScore?: number;
  user?: UserProfile | null;
  onSignOut?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  currentTab,
  onTabChange,
  onOpenAICreate,
  user,
  onSignOut,
}) => {
  return (
    <div className="min-h-screen bg-[#F8F9FE] text-slate-800 flex antialiased selection:bg-purple-200 selection:text-purple-900">
      <OfflineIndicator />

      {/* Unified Side Navigation Bar on Left (Collapsible / Expandable) */}
      <SidebarNavigation
        currentTab={currentTab}
        onSelectTab={onTabChange}
        onOpenCreate={onOpenAICreate}
        user={user}
        onSignOut={onSignOut}
      />

      {/* Screen Content - Clean full-screen responsive presentation */}
      <main className="flex-1 min-w-0 overflow-y-auto min-h-screen flex flex-col bg-[#F8F9FE]">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-5 flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};
