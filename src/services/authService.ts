import { Task } from '../types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  bio?: string;
  streakDays: number;
}

const INITIAL_TASK_TEMPLATES: Partial<Task>[] = [
  {
    title: 'Complete Project Milestone',
    description: 'Review objectives, finalize deliverables, and update summary notes.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    category: 'Project',
    deadline: 'Today, 6:00 PM',
    estimatedMinutes: 90,
    actualMinutes: 30,
    source: 'manual',
    priorityReason: 'Key deliverable due today at 6:00 PM.',
  },
  {
    title: 'Deep Work: Review Materials',
    description: 'Read chapters, synthesize core concepts, and prepare action items.',
    priority: 'MEDIUM',
    status: 'PENDING',
    category: 'Study',
    deadline: 'Tomorrow, 10:00 AM',
    estimatedMinutes: 45,
    actualMinutes: 0,
    source: 'manual',
    priorityReason: 'Requires 45 min focused study block.',
  },
  {
    title: 'Team Sync & Status Review',
    description: 'Coordinate next steps with project team members.',
    priority: 'HIGH',
    status: 'PENDING',
    category: 'Meeting',
    deadline: 'Today, 11:00 AM',
    estimatedMinutes: 60,
    actualMinutes: 0,
    source: 'manual',
    priorityReason: 'Fixed meeting time.',
  },
];

export class AuthService {
  private static USERS_KEY = 'focusmind_registered_users';
  private static CURRENT_USER_KEY = 'focusmind_current_user_session';

  static getRegisteredUsers(): UserProfile[] {
    try {
      const stored = localStorage.getItem(this.USERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  }

  static getCurrentUser(): UserProfile | null {
    try {
      const session = localStorage.getItem(this.CURRENT_USER_KEY);
      if (session) {
        return JSON.parse(session);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  static login(email: string): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      const users = this.getRegisteredUsers();
      const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (existing) {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(existing));
        resolve(existing);
      } else {
        // Create account on login if first time with this email
        const newUser: UserProfile = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          email: email.trim().toLowerCase(),
          role: 'Active Member',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
          streakDays: 1,
        };
        const updatedUsers = [...users, newUser];
        localStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));

        // Seed initial tasks for new account
        this.initializeUserTasks(newUser.id);
        resolve(newUser);
      }
    });
  }

  static signup(name: string, email: string): Promise<UserProfile> {
    return new Promise((resolve) => {
      const users = this.getRegisteredUsers();
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: name.trim() || 'New User',
        email: email.trim().toLowerCase(),
        role: 'Pro Member',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        streakDays: 1,
      };

      const filtered = users.filter((u) => u.email.toLowerCase() !== newUser.email);
      const updatedUsers = [...filtered, newUser];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));

      this.initializeUserTasks(newUser.id);
      resolve(newUser);
    });
  }

  private static initializeUserTasks(userId: string) {
    const key = `focusmind_tasks_${userId}`;
    const initialTasks: Task[] = INITIAL_TASK_TEMPLATES.map((tmpl, index) => ({
      id: `task-${Date.now()}-${index}`,
      userId,
      title: tmpl.title || 'Task',
      description: tmpl.description || '',
      priority: tmpl.priority || 'HIGH',
      status: tmpl.status || 'PENDING',
      category: tmpl.category || 'Study',
      deadline: tmpl.deadline || 'Today, 5:00 PM',
      estimatedMinutes: tmpl.estimatedMinutes || 45,
      actualMinutes: tmpl.actualMinutes || 0,
      source: tmpl.source || 'manual',
      priorityReason: tmpl.priorityReason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    localStorage.setItem(key, JSON.stringify(initialTasks));
  }

  static logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  static updateProfile(updatedUser: UserProfile): UserProfile {
    const users = this.getRegisteredUsers();
    const idx = users.findIndex((u) => u.id === updatedUser.id);
    if (idx !== -1) {
      users[idx] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }

  static getUserTasks(userId: string): Task[] {
    try {
      const key = `focusmind_tasks_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    // If not found, initialize clean tasks for this user
    this.initializeUserTasks(userId);
    try {
      const stored = localStorage.getItem(`focusmind_tasks_${userId}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  }

  static saveUserTasks(userId: string, tasks: Task[]): void {
    try {
      const key = `focusmind_tasks_${userId}`;
      localStorage.setItem(key, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }
}
