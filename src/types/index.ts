export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
export type Category = 'Study' | 'Deep Work' | 'Meeting' | 'Personal' | 'Project';
export type CaptureSource = 'manual' | 'camera' | 'voice' | 'document' | 'screenshot' | 'ai';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  category: Category;
  deadline: string;
  estimatedMinutes: number;
  actualMinutes: number;
  source: CaptureSource;
  priorityReason?: string;
  subtasks?: Subtask[];
  scheduledTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleBlock {
  id: string;
  taskId?: string;
  title: string;
  type: 'deep_work' | 'study' | 'meeting' | 'break' | 'buffer';
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  durationMinutes: number;
  priority: Priority;
  reason: string;
  status: 'upcoming' | 'current' | 'completed' | 'missed';
}

export interface ExtractedTask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  deadline: string;
  estimatedMinutes: number;
  category: Category;
  priorityReason: string;
  selected?: boolean;
}

export interface FocusSession {
  id: string;
  taskId: string;
  taskTitle: string;
  durationMinutes: number;
  completedAt: string;
  taskCompleted?: boolean;
  distractionScore?: number;
  tabSwitches?: number;
  lookAwayEvents?: number;
  absenceEvents?: number;
  pauseCount?: number;
  pauseReasons?: string[];
  category?: Category;
  priority?: Priority;
}

export interface ProductivityStats {
  productivityScore: number;
  focusTimeFormatted: string;
  tasksCompleted: number;
  totalTasks: number;
  completionRate: string;
  weeklyData: { day: string; completed: number; focusMinutes: number }[];
  priorityDistribution: { high: number; medium: number; low: number };
  insights: string[];
}

export interface AIModelConfig {
  provider: 'auto' | 'local' | 'cloud' | 'mock';
  model: 'qwen-2.5-7b' | 'llama-3.2-3b' | 'gemma-2' | 'phi-3.5' | 'gemini-2.5-flash';
  apiKey?: string;
  temperature: number;
}
