import React, { useState, useEffect } from 'react';
import { Task, ScheduleBlock, ExtractedTask, ProductivityStats } from './types';
import { api } from './services/api';
import { AuthService, UserProfile } from './services/authService';
import { AppShell } from './components/AppShell';
import { NavTab } from './components/SidebarNavigation';
import { LandingPage } from './pages/LandingPage';
import { AuthScreen } from './pages/AuthScreen';
import { HomeScreen } from './pages/HomeScreen';
import { TasksScreen } from './pages/TasksScreen';
import { CreateWithAIScreen } from './pages/CreateWithAIScreen';
import { AIResultsScreen } from './pages/AIResultsScreen';
import { AIScheduleScreen } from './pages/AIScheduleScreen';
import { CalendarScreen } from './pages/CalendarScreen';
import { AnalyticsScreen } from './pages/AnalyticsScreen';
import { ProfileScreen } from './pages/ProfileScreen';
import { CaptureCard } from './components/CaptureCard';
import { AIProcessingAnimation } from './components/AIProcessingAnimation';
import { FocusTimer } from './components/FocusTimer';
import { NotificationsModal } from './components/NotificationsModal';

type AppView =
  | 'tab'
  | 'create_ai'
  | 'capture'
  | 'processing'
  | 'ai_results'
  | 'ai_schedule'
  | 'focus_mode';

export default function App() {
  // Authentication State (Default to logged-in user Rithika if available, or null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => AuthService.getCurrentUser());
  const [showAuthModal, setShowAuthModal] = useState<'signin' | 'signup' | null>(null);

  // App Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [currentView, setCurrentView] = useState<AppView>('tab');
  const [showNotifications, setShowNotifications] = useState(false);

  // Core Data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [analytics, setAnalytics] = useState<ProductivityStats | null>(null);

  // Workflow State
  const [captureMode, setCaptureMode] = useState<'camera' | 'voice' | 'screenshot' | 'upload' | 'files' | 'text'>('camera');
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [extractionSummary, setExtractionSummary] = useState('');
  const [scheduleSuggestion, setScheduleSuggestion] = useState('');
  const [activeFocusTask, setActiveFocusTask] = useState<{ id?: string; title: string; estimatedMinutes?: number }>({
    title: 'Focused Task Session',
    estimatedMinutes: 25,
  });

  // Load initial data for logged-in or guest user
  useEffect(() => {
    async function loadData() {
      const userId = currentUser?.id || 'user-rithika';
      const userSavedTasks = AuthService.getUserTasks(userId);
      const [s, a] = await Promise.all([
        api.getSchedule(),
        api.getAnalytics(),
      ]);

      setTasks(userSavedTasks);
      setSchedule(s);
      setAnalytics(a);
    }
    loadData();
  }, [currentUser]);

  // Handle Auth Success
  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setShowAuthModal(null);
    const userTasks = AuthService.getUserTasks(user.id);
    setTasks(userTasks);
    setCurrentTab('home');
    setCurrentView('tab');
  };

  // Handle Sign Out
  const handleSignOut = () => {
    AuthService.logout();
    setCurrentUser(null);
    setCurrentTab('home');
    setCurrentView('tab');
  };

  // Handle User Profile Update
  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
  };

  // Task Actions (persist directly to user storage)
  const handleToggleComplete = async (id: string) => {
    const updated = await api.toggleTaskComplete(id);
    setTasks((prev) => {
      const nextTasks = prev.map((t) => (t.id === id ? updated : t));
      const userId = currentUser?.id || 'user-rithika';
      AuthService.saveUserTasks(userId, nextTasks);
      return nextTasks;
    });

    const freshAnalytics = await api.getAnalytics();
    setAnalytics(freshAnalytics);
  };

  const handleAddTask = async (newTaskData: Partial<Task>) => {
    const userId = currentUser?.id || 'user-rithika';
    const created = await api.createTask({
      ...newTaskData,
      userId,
    });

    setTasks((prev) => {
      const nextTasks = [created, ...prev];
      AuthService.saveUserTasks(userId, nextTasks);
      return nextTasks;
    });
  };

  const handleEditTask = async (task: Task) => {
    const userId = currentUser?.id || 'user-rithika';
    const updated = await api.updateTask(task.id, task);
    setTasks((prev) => {
      const nextTasks = prev.map((t) => (t.id === task.id ? updated : t));
      AuthService.saveUserTasks(userId, nextTasks);
      return nextTasks;
    });
  };

  const handleDeleteTask = async (id: string) => {
    const userId = currentUser?.id || 'user-rithika';
    await api.deleteTask(id);
    setTasks((prev) => {
      const nextTasks = prev.filter((t) => t.id !== id);
      AuthService.saveUserTasks(userId, nextTasks);
      return nextTasks;
    });
  };

  const handleRescheduleTask = async (task: Task) => {
    const userId = currentUser?.id || 'user-rithika';
    const updated = await api.rescheduleTask(task.id, 'Tomorrow, 10:00 AM', '11:00 - 12:00');
    setTasks((prev) => {
      const nextTasks = prev.map((t) => (t.id === task.id ? updated : t));
      AuthService.saveUserTasks(userId, nextTasks);
      return nextTasks;
    });
  };

  const handleBatchUpdateTasks = async (taskIds: string[], updates: Partial<Task>) => {
    const userId = currentUser?.id || 'user-rithika';
    await api.batchUpdateTasks(taskIds, updates);
    setTasks((prev) => {
      const nextTasks = prev.map((t) => (taskIds.includes(t.id) ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
      AuthService.saveUserTasks(userId, nextTasks);
      return nextTasks;
    });
  };

  const handleBatchDeleteTasks = async (taskIds: string[]) => {
    const userId = currentUser?.id || 'user-rithika';
    await api.batchDeleteTasks(taskIds);
    setTasks((prev) => {
      const nextTasks = prev.filter((t) => !taskIds.includes(t.id));
      AuthService.saveUserTasks(userId, nextTasks);
      return nextTasks;
    });
  };

  const handleOptimizeDay = async () => {
    const regenerated = await api.generatePlan(tasks);
    setSchedule(regenerated);
  };

  // Start Focus Mode
  const handleStartFocus = (taskOrTitle?: Task | string, explicitTitle?: string) => {
    let title = 'Focused Task Session';
    let id: string | undefined = undefined;
    let estimatedMinutes = 25;

    if (typeof taskOrTitle === 'object' && taskOrTitle !== null) {
      title = taskOrTitle.title;
      id = taskOrTitle.id;
      estimatedMinutes = taskOrTitle.estimatedMinutes || 25;
    } else if (typeof taskOrTitle === 'string') {
      title = taskOrTitle;
      const found = tasks.find((t) => t.title.toLowerCase() === taskOrTitle.toLowerCase());
      if (found) {
        id = found.id;
        estimatedMinutes = found.estimatedMinutes || 25;
      }
    } else if (explicitTitle) {
      title = explicitTitle;
    }

    setActiveFocusTask({ id, title, estimatedMinutes });
    setCurrentView('focus_mode');
  };

  const handleFinishFocus = async (
    durationMinutes: number,
    markCompleted = true,
    sessionMeta?: {
      distractionScore: number;
      tabSwitches: number;
      lookAwayEvents: number;
      absenceEvents: number;
      pauseReasons: string[];
    }
  ) => {
    const relatedTask = tasks.find((t) => t.id === activeFocusTask.id);
    await api.completeFocusSession(
      activeFocusTask.id || 'task-1',
      activeFocusTask.title,
      durationMinutes,
      markCompleted,
      {
        category: relatedTask?.category || 'Study',
        priority: relatedTask?.priority || 'MEDIUM',
        taskCompleted: markCompleted,
        distractionScore: sessionMeta?.distractionScore,
        tabSwitches: sessionMeta?.tabSwitches,
        lookAwayEvents: sessionMeta?.lookAwayEvents,
        absenceEvents: sessionMeta?.absenceEvents,
        pauseCount: sessionMeta?.pauseReasons?.length || 0,
        pauseReasons: sessionMeta?.pauseReasons || [],
      }
    );

    if (activeFocusTask.id && markCompleted) {
      setTasks((prev) => {
        const nextTasks = prev.map((t) =>
          t.id === activeFocusTask.id
            ? {
                ...t,
                status: 'COMPLETED' as const,
                actualMinutes: (t.actualMinutes || 0) + durationMinutes,
                updatedAt: new Date().toISOString(),
              }
            : t
        );
        const userId = currentUser?.id || 'user-rithika';
        AuthService.saveUserTasks(userId, nextTasks);
        return nextTasks;
      });
    }

    setCurrentTab('tasks');
    setCurrentView('tab');
    const freshStats = await api.getAnalytics();
    setAnalytics(freshStats);
  };

  // Navigation handlers
  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    setCurrentView('tab');
  };

  const handleOpenAICreate = () => {
    setCurrentView('create_ai');
  };

  // AI Workflow Progression
  const handleSelectCaptureMode = (mode: 'camera' | 'voice' | 'screenshot' | 'upload' | 'files' | 'text') => {
    setCaptureMode(mode);
    setCurrentView('capture');
  };

  const handleCaptureCompleted = async (type: string, content: string) => {
    setCurrentView('processing');

    const result = await api.captureInput(type, content);
    setExtractedTasks(result.tasks);
    setExtractionSummary(result.summary);
    setScheduleSuggestion(result.scheduleSuggestion);
  };

  const handleAIProcessingDone = () => {
    setCurrentView('ai_results');
  };

  const handleUpdateExtractedTask = (updated: ExtractedTask) => {
    setExtractedTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleToggleSelectExtracted = (id: string) => {
    setExtractedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const handleAddToPlan = async () => {
    const userId = currentUser?.id || 'user-rithika';
    const selected = extractedTasks.filter((t) => t.selected !== false);
    const newTasksCreated: Task[] = [];
    for (const item of selected) {
      const created = await api.createTask({
        title: item.title,
        description: item.description,
        priority: item.priority,
        deadline: item.deadline,
        estimatedMinutes: item.estimatedMinutes,
        category: item.category,
        priorityReason: item.priorityReason,
        source: 'screenshot',
        userId,
      });
      newTasksCreated.push(created);
    }

    setTasks((prev) => {
      const updated = [...newTasksCreated, ...prev];
      AuthService.saveUserTasks(userId, updated);
      return updated;
    });

    const newSchedule = await api.generatePlan([...newTasksCreated, ...tasks]);
    setSchedule(newSchedule);

    setCurrentView('ai_schedule');
  };

  const handleAcceptPlan = () => {
    const firstTask = schedule.find((b) => b.type === 'deep_work' || b.type === 'study');
    if (firstTask) {
      handleStartFocus(firstTask.taskId, firstTask.title);
    } else {
      setCurrentTab('home');
      setCurrentView('tab');
    }
  };

  const handleRescheduleBlock = async (blockId: string) => {
    const block = schedule.find((b) => b.id === blockId);
    if (block?.taskId) {
      const updatedSchedule = await api.smartReschedule(block.taskId);
      setSchedule(updatedSchedule);
    }
  };

  const handleClearAllTasks = () => {
    const userId = currentUser?.id || 'user-rithika';
    AuthService.saveUserTasks(userId, []);
    setTasks([]);
  };

  // If Not Logged In -> Show the comprehensive FocusMind Details Home Page (not the user dashboard)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F9FE] text-slate-800">
        <LandingPage
          onGetStarted={() => setShowAuthModal('signup')}
          onSignIn={() => setShowAuthModal('signin')}
          onSignUp={() => setShowAuthModal('signup')}
        />

        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-sm">
              <AuthScreen
                initialMode={showAuthModal}
                onSuccess={handleAuthSuccess}
                onBackToLanding={() => setShowAuthModal(null)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={handleTabChange}
      onOpenAICreate={handleOpenAICreate}
      productivityScore={analytics?.productivityScore || 85}
      user={currentUser}
      onSignOut={handleSignOut}
    >
      {/* 1. Create with AI Screen */}
      {currentView === 'create_ai' && (
        <CreateWithAIScreen
          onBack={() => {
            setCurrentView('tab');
          }}
          onSubmitGeneratedTasks={async (generatedTasks) => {
            for (const t of generatedTasks) {
              await handleAddTask(t);
            }
            setCurrentTab('tasks');
            setCurrentView('tab');
          }}
          onOpenQuickCapture={(mode) => handleSelectCaptureMode(mode as any)}
        />
      )}

      {/* 2. Capture Screen */}
      {currentView === 'capture' && (
        <CaptureCard
          initialMode={captureMode}
          onCaptureCompleted={handleCaptureCompleted}
          onCancel={() => {
            setCurrentView('tab');
          }}
        />
      )}

      {/* 3. AI Processing Screen */}
      {currentView === 'processing' && (
        <AIProcessingAnimation
          onComplete={handleAIProcessingDone}
          speedMs={650}
          onBack={() => {
            setCurrentView('capture');
          }}
        />
      )}

      {/* 4. AI Results Screen */}
      {currentView === 'ai_results' && (
        <AIResultsScreen
          tasks={extractedTasks}
          summary={extractionSummary}
          scheduleSuggestion={scheduleSuggestion}
          onUpdateTask={handleUpdateExtractedTask}
          onToggleSelect={handleToggleSelectExtracted}
          onAddToPlan={handleAddToPlan}
          onRecapture={() => {
            setCurrentView('capture');
          }}
          onBack={() => {
            setCurrentView('capture');
          }}
        />
      )}

      {/* 5. AI Schedule Screen */}
      {currentView === 'ai_schedule' && (
        <AIScheduleScreen
          schedule={schedule}
          onAcceptPlan={handleAcceptPlan}
          onRegenerate={handleOptimizeDay}
          onStartFocus={(taskId, title) => handleStartFocus(taskId, title)}
          onRescheduleBlock={handleRescheduleBlock}
        />
      )}

      {/* 6. Focus Mode Screen */}
      {currentView === 'focus_mode' && (
        <FocusTimer
          taskTitle={activeFocusTask.title}
          initialMinutes={activeFocusTask.estimatedMinutes || 25}
          onFinish={handleFinishFocus}
          onExit={() => {
            setCurrentView('tab');
          }}
        />
      )}

      {/* MAIN SCREENS (Controlled via unified side navigation) */}
      {currentView === 'tab' && currentTab === 'home' && (
        <HomeScreen
          tasks={tasks}
          schedule={schedule}
          user={currentUser}
          onToggleComplete={handleToggleComplete}
          onOpenQuickAction={(action) => handleSelectCaptureMode(action)}
          onStartFocus={(task) => handleStartFocus(task)}
          onViewAllTasks={() => setCurrentTab('tasks')}
          onOptimizeDay={handleOptimizeDay}
          onOpenNotifications={() => setShowNotifications(true)}
          onEditTask={handleEditTask}
          onRescheduleTask={handleRescheduleTask}
          onSignIn={() => setShowAuthModal('signin')}
          onSignUp={() => setShowAuthModal('signup')}
          onGetStarted={() => setShowAuthModal('signup')}
          onSignOut={handleSignOut}
        />
      )}

      {currentView === 'tab' && currentTab === 'tasks' && (
        <TasksScreen
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onRescheduleTask={handleRescheduleTask}
          onBatchUpdateTasks={handleBatchUpdateTasks}
          onBatchDeleteTasks={handleBatchDeleteTasks}
          onStartFocus={(task) => handleStartFocus(task)}
          onOpenAICreate={handleOpenAICreate}
        />
      )}

      {/* Dedicated Analytics Page */}
      {currentView === 'tab' && currentTab === 'analytics' && (
        <AnalyticsScreen
          onBack={() => setCurrentTab('home')}
          onStartFocus={(task) => handleStartFocus(task)}
        />
      )}

      {/* Calendar Screen */}
      {currentView === 'tab' && currentTab === 'calendar' && (
        <CalendarScreen
          schedule={schedule}
          onStartFocus={(title) => handleStartFocus(title)}
          onOpenAICreate={handleOpenAICreate}
        />
      )}

      {/* Profile Screen */}
      {currentView === 'tab' && currentTab === 'profile' && (
        <ProfileScreen
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onSignOut={handleSignOut}
          onClearTasks={handleClearAllTasks}
        />
      )}

      {/* Notifications Drawer Modal */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onSelectTask={(taskTitle) => handleStartFocus(taskTitle)}
      />

      {/* Sign In / Sign Up Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm">
            <AuthScreen
              initialMode={showAuthModal}
              onSuccess={handleAuthSuccess}
              onBackToLanding={() => setShowAuthModal(null)}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
