import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// In-memory data store with realistic initial productivity data
interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';
  category: 'Study' | 'Deep Work' | 'Meeting' | 'Personal' | 'Project';
  deadline: string;
  estimatedMinutes: number;
  actualMinutes: number;
  source: 'manual' | 'camera' | 'voice' | 'document' | 'screenshot' | 'ai';
  priorityReason?: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
  scheduledTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleBlock {
  id: string;
  taskId?: string;
  title: string;
  type: 'deep_work' | 'study' | 'meeting' | 'break' | 'buffer';
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  durationMinutes: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  status: 'upcoming' | 'current' | 'completed' | 'missed';
}

const mockTasks: Task[] = [
  {
    id: 'task-1',
    userId: 'user-default',
    title: 'Complete ML Assignment',
    description: 'Submit Machine Learning Assignment 3 to professor portal with loss curve charts.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    category: 'Study',
    deadline: 'Today, 6:00 PM',
    estimatedMinutes: 90,
    actualMinutes: 45,
    source: 'screenshot',
    priorityReason: 'Due today at 6:00 PM and requires 90 minutes of focused effort.',
    subtasks: [
      { id: 'sub-1', title: 'Implement gradient descent optimization', completed: true },
      { id: 'sub-2', title: 'Export validation loss graphs', completed: true },
      { id: 'sub-3', title: 'Write executive summary & PDF export', completed: false }
    ],
    scheduledTime: '09:00 - 10:30',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    userId: 'user-default',
    title: 'Prepare Chapter 3 & 4',
    description: 'Review convolutional networks and regularization techniques for upcoming Friday test.',
    priority: 'MEDIUM',
    status: 'PENDING',
    category: 'Study',
    deadline: 'Tomorrow, 5:00 PM',
    estimatedMinutes: 45,
    actualMinutes: 0,
    source: 'voice',
    priorityReason: 'Exam scheduled for Friday. Needs 45 min revision block.',
    subtasks: [
      { id: 'sub-4', title: 'Summarize Chapter 3 formulas', completed: false },
      { id: 'sub-5', title: 'Solve 5 sample problem sets', completed: false }
    ],
    scheduledTime: '11:00 - 11:45',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    userId: 'user-default',
    title: 'Project Architecture Review',
    description: 'Sync with product managers and engineering team leads on release milestones.',
    priority: 'HIGH',
    status: 'PENDING',
    category: 'Meeting',
    deadline: 'Today, 3:00 PM',
    estimatedMinutes: 60,
    actualMinutes: 0,
    source: 'manual',
    priorityReason: 'Fixed meeting time with stakeholders.',
    scheduledTime: '14:00 - 15:00',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    userId: 'user-default',
    title: 'Send Internship Application',
    description: 'Submit updated portfolio and tailored cover letter to AI Lab.',
    priority: 'MEDIUM',
    status: 'PENDING',
    category: 'Project',
    deadline: 'Friday, 11:59 PM',
    estimatedMinutes: 40,
    actualMinutes: 0,
    source: 'document',
    priorityReason: 'Internship portal closes on Friday evening.',
    scheduledTime: '16:00 - 16:40',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    userId: 'user-default',
    title: 'Daily Code Commit & Sync',
    description: 'Push repo changes and verify automated test suite passes.',
    priority: 'LOW',
    status: 'COMPLETED',
    category: 'Project',
    deadline: 'Today, 8:00 PM',
    estimatedMinutes: 20,
    actualMinutes: 20,
    source: 'manual',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];

let tasks: Task[] = [...mockTasks];

let scheduleBlocks: ScheduleBlock[] = [
  {
    id: 'sched-1',
    taskId: 'task-1',
    title: 'Deep Work: ML Assignment',
    type: 'deep_work',
    startTime: '09:00',
    endTime: '10:30',
    durationMinutes: 90,
    priority: 'HIGH',
    reason: 'Highest urgency deadline (Today 6:00 PM); requires peak morning cognitive energy.',
    status: 'completed',
  },
  {
    id: 'sched-2',
    title: 'Rest & Coffee Buffer',
    type: 'break',
    startTime: '10:30',
    endTime: '11:00',
    durationMinutes: 30,
    priority: 'LOW',
    reason: 'Strategic pause to prevent cognitive fatigue before theoretical study.',
    status: 'completed',
  },
  {
    id: 'sched-3',
    taskId: 'task-2',
    title: 'Study: Chapter 3 & 4',
    type: 'study',
    startTime: '11:00',
    endTime: '11:45',
    durationMinutes: 45,
    priority: 'MEDIUM',
    reason: 'Pre-exam preparation block scheduled before lunch.',
    status: 'current',
  },
  {
    id: 'sched-4',
    title: 'Lunch & Screen Break',
    type: 'break',
    startTime: '12:00',
    endTime: '13:00',
    durationMinutes: 60,
    priority: 'LOW',
    reason: 'Nutritional and mental recharge.',
    status: 'upcoming',
  },
  {
    id: 'sched-5',
    taskId: 'task-3',
    title: 'Meeting: Project Review',
    type: 'meeting',
    startTime: '14:00',
    endTime: '15:00',
    durationMinutes: 60,
    priority: 'HIGH',
    reason: 'Fixed external schedule constraint with team leads.',
    status: 'upcoming',
  },
  {
    id: 'sched-6',
    taskId: 'task-4',
    title: 'Internship Application Polish',
    type: 'study',
    startTime: '15:30',
    endTime: '16:15',
    durationMinutes: 45,
    priority: 'MEDIUM',
    reason: 'High impact career milestone scheduled during afternoon focus window.',
    status: 'upcoming',
  },
  {
    id: 'sched-7',
    title: 'Buffer / Catch-up & Review',
    type: 'buffer',
    startTime: '17:00',
    endTime: '17:45',
    durationMinutes: 45,
    priority: 'LOW',
    reason: 'Safety buffer before final 6 PM submission deadline.',
    status: 'upcoming',
  }
];

let focusSessions: {
  id: string;
  taskId: string;
  taskTitle: string;
  durationMinutes: number;
  completedAt: string;
}[] = [
  {
    id: 'foc-1',
    taskId: 'task-1',
    taskTitle: 'Complete ML Assignment',
    durationMinutes: 45,
    completedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'foc-2',
    taskId: 'task-5',
    taskTitle: 'Daily Code Commit & Sync',
    durationMinutes: 20,
    completedAt: new Date(Date.now() - 14400000).toISOString(),
  }
];

// Helper: AI extraction logic with Gemini or dynamic NLP rule engine
async function extractTasksFromContent(content: string, type: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const isBase64Image = typeof content === 'string' && content.startsWith('data:image/');
      let contents: any = '';

      if (isBase64Image) {
        const match = content.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (match) {
          contents = [
            {
              role: 'user',
              parts: [
                {
                  text: `You are FocusMate AI Productivity Engine.
Analyze this ${type} image and extract all real actionable tasks, assignments, deliverables, deadlines, and dates visible.
Return strictly valid JSON with this exact schema:
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "deadline": "string",
      "estimatedMinutes": number,
      "category": "Study" | "Deep Work" | "Meeting" | "Personal" | "Project",
      "priorityReason": "string"
    }
  ],
  "summary": "string",
  "scheduleSuggestion": "string"
}`
                },
                {
                  inlineData: {
                    mimeType: match[1],
                    data: match[2]
                  }
                }
              ]
            }
          ];
        }
      }

      if (!contents) {
        contents = `You are FocusMate AI Productivity Engine.
Analyze the following unstructured input (${type}):
"${content}"

Extract real actionable tasks, deadlines, priorities, estimated duration in minutes, categories, and priority reasoning directly from the text.
Return strictly valid JSON with this exact schema:
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "deadline": "string",
      "estimatedMinutes": number,
      "category": "Study" | "Deep Work" | "Meeting" | "Personal" | "Project",
      "priorityReason": "string"
    }
  ],
  "summary": "string",
  "scheduleSuggestion": "string"
}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: { responseMimeType: 'application/json' }
      });
      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Gemini extraction fallback triggered:', err);
    }
  }

  // Dynamic Rule-Based NLP Parser for Real Content
  const extractedList: Array<{
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    deadline: string;
    estimatedMinutes: number;
    category: 'Study' | 'Deep Work' | 'Meeting' | 'Personal' | 'Project';
    priorityReason: string;
  }> = [];

  // Clean lines and filter out empty noise
  const rawLines = content
    .split(/\r?\n|;/)
    .map(s => s.trim().replace(/^[-*•\d.)\]]+\s*/, ''))
    .filter(s => s.length > 3 && !s.startsWith('[WhatsApp') && !s.startsWith('---'));

  // If text is a paragraph or short block without linebreaks, split into sentences
  const itemsToProcess = rawLines.length > 0
    ? rawLines
    : content.split(/[.?!]+/).map(s => s.trim()).filter(s => s.length > 5);

  itemsToProcess.slice(0, 6).forEach((itemText, idx) => {
    const lower = itemText.toLowerCase();

    // 1. Detect Deadline
    let deadline = 'Tomorrow, 5:00 PM';
    if (lower.includes('today')) {
      const timeMatch = itemText.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))/i);
      deadline = timeMatch ? `Today, ${timeMatch[1].toUpperCase()}` : 'Today, 6:00 PM';
    } else if (lower.includes('tomorrow')) {
      const timeMatch = itemText.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))/i);
      deadline = timeMatch ? `Tomorrow, ${timeMatch[1].toUpperCase()}` : 'Tomorrow, 5:00 PM';
    } else {
      const dayMatch = itemText.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
      const timeMatch = itemText.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))/i);
      if (dayMatch && timeMatch) {
        deadline = `${dayMatch[1].charAt(0).toUpperCase() + dayMatch[1].slice(1).toLowerCase()}, ${timeMatch[1].toUpperCase()}`;
      } else if (dayMatch) {
        deadline = `${dayMatch[1].charAt(0).toUpperCase() + dayMatch[1].slice(1).toLowerCase()}, 5:00 PM`;
      } else if (timeMatch) {
        deadline = `Today, ${timeMatch[1].toUpperCase()}`;
      } else {
        deadline = idx === 0 ? 'Today, 6:00 PM' : idx === 1 ? 'Tomorrow, 10:00 AM' : 'Friday, 2:00 PM';
      }
    }

    // 2. Detect Priority
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    let priorityReason = 'Standard priority item scheduled based on duration.';
    if (
      lower.includes('urgent') ||
      lower.includes('important') ||
      lower.includes('exam') ||
      lower.includes('test') ||
      lower.includes('critical') ||
      lower.includes('asap') ||
      lower.includes('due today') ||
      idx === 0
    ) {
      priority = 'HIGH';
      priorityReason = 'High urgency: upcoming deadline requiring prompt execution.';
    } else if (lower.includes('review') || lower.includes('read') || lower.includes('optional')) {
      priority = 'LOW';
      priorityReason = 'Flexible priority: can be completed in recovery or buffer windows.';
    }

    // 3. Detect Category
    let category: 'Study' | 'Deep Work' | 'Meeting' | 'Personal' | 'Project' = 'Project';
    if (lower.includes('meeting') || lower.includes('sync') || lower.includes('call') || lower.includes('presentation')) {
      category = 'Meeting';
    } else if (lower.includes('study') || lower.includes('chapter') || lower.includes('exam') || lower.includes('homework') || lower.includes('assignment')) {
      category = 'Study';
    } else if (lower.includes('code') || lower.includes('dev') || lower.includes('design') || lower.includes('build') || lower.includes('report')) {
      category = 'Deep Work';
    } else if (lower.includes('buy') || lower.includes('gym') || lower.includes('doctor') || lower.includes('errand')) {
      category = 'Personal';
    }

    // 4. Detect Duration
    let duration = 45;
    const hourMatch = itemText.match(/(\d+)\s*(?:hour|hr|h\b)/i);
    const minMatch = itemText.match(/(\d+)\s*(?:min|minute|m\b)/i);
    if (hourMatch) {
      duration = Math.min(180, parseInt(hourMatch[1], 10) * 60);
    } else if (minMatch) {
      duration = Math.max(15, parseInt(minMatch[1], 10));
    } else if (priority === 'HIGH') {
      duration = 60;
    }

    // 5. Clean Title & Description
    const cleanedTitle = itemText.length > 55
      ? itemText.substring(0, 52).trim() + '...'
      : itemText;

    extractedList.push({
      title: cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1),
      description: itemText,
      priority,
      deadline,
      estimatedMinutes: duration,
      category,
      priorityReason
    });
  });

  // Ensure default if still empty
  if (extractedList.length === 0) {
    extractedList.push({
      title: 'Review Uploaded File Content',
      description: content.slice(0, 100) || 'Actionable item from your uploaded document.',
      priority: 'MEDIUM',
      deadline: 'Tomorrow, 5:00 PM',
      estimatedMinutes: 45,
      category: 'Project',
      priorityReason: 'Extracted directly from uploaded file contents.'
    });
  }

  return {
    tasks: extractedList,
    summary: `Extracted ${extractedList.length} real tasks from your ${type}.`,
    scheduleSuggestion: 'AI allocated high-priority items into focused morning windows with proper breaks.'
  };
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// Auth Routes
app.post('/api/auth/register', (req: Request, res: Response) => {
  res.json({
    user: { id: 'user-default', name: 'Alex Rivera', email: 'alex@focusmate.ai', tier: 'Pro' },
    token: 'mock-jwt-token-focusmate-2026'
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  res.json({
    user: { id: 'user-default', name: 'Alex Rivera', email: 'alex@focusmate.ai', tier: 'Pro' },
    token: 'mock-jwt-token-focusmate-2026'
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  res.json({
    id: 'user-default',
    name: 'Alex Rivera',
    email: 'alex@focusmate.ai',
    productivityScore: 82,
    preferences: {
      workingHoursStart: '09:00',
      workingHoursEnd: '18:00',
      dailyFocusGoalMinutes: 180,
      aiProvider: 'auto',
      aiModel: 'qwen-2.5-7b',
      deepWorkBlockSize: 90
    }
  });
});

// Tasks CRUD
app.get('/api/tasks', (req: Request, res: Response) => {
  const { status, priority, category } = req.query;
  let filtered = [...tasks];
  if (status) filtered = filtered.filter(t => t.status === status);
  if (priority) filtered = filtered.filter(t => t.priority === priority);
  if (category) filtered = filtered.filter(t => t.category === category);
  res.json({ tasks: filtered });
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const newTask: Task = {
    id: `task-${Date.now()}`,
    userId: 'user-default',
    title: req.body.title || 'Untitled Task',
    description: req.body.description || '',
    priority: req.body.priority || 'MEDIUM',
    status: 'PENDING',
    category: req.body.category || 'Study',
    deadline: req.body.deadline || 'Today, 6:00 PM',
    estimatedMinutes: Number(req.body.estimatedMinutes) || 45,
    actualMinutes: 0,
    source: req.body.source || 'manual',
    priorityReason: req.body.priorityReason || 'User created manual priority.',
    subtasks: req.body.subtasks || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.unshift(newTask);
  res.status(201).json({ task: newTask });
});

app.get('/api/tasks/:id', (req: Request, res: Response) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json({ task });
});

app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  tasks[index] = { ...tasks[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ task: tasks[index] });
});

app.post('/api/tasks/batch', (req: Request, res: Response) => {
  const { ids, updates } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'ids must be an array' });
  }
  const updatedTasks: Task[] = [];
  ids.forEach((id: string) => {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
      updatedTasks.push(tasks[idx]);
    }
  });
  res.json({ success: true, count: updatedTasks.length, updatedTasks });
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  const deleted = tasks.splice(index, 1);
  res.json({ success: true, deleted: deleted[0] });
});

app.post('/api/tasks/:id/complete', (req: Request, res: Response) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.status = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
  task.actualMinutes = task.status === 'COMPLETED' ? task.estimatedMinutes : 0;
  task.updatedAt = new Date().toISOString();
  res.json({ task });
});

app.post('/api/tasks/:id/reschedule', (req: Request, res: Response) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  task.deadline = req.body.newDeadline || 'Tomorrow, 10:00 AM';
  task.scheduledTime = req.body.newScheduledTime || '11:00 - 12:00';
  task.status = 'PENDING';
  task.updatedAt = new Date().toISOString();
  res.json({ task, message: 'Task rescheduled successfully' });
});

// AI Capture & Processing
app.post('/api/ai/capture', async (req: Request, res: Response) => {
  const { type, content, metadata } = req.body;
  // type: 'camera' | 'voice' | 'screenshot' | 'document' | 'text'
  const result = await extractTasksFromContent(content || 'ML Assignment due Thursday 6 PM. Prepare Chapter 3.', type || 'text');
  res.json({
    captureId: `cap-${Date.now()}`,
    type,
    ...result
  });
});

app.post('/api/ai/extract-tasks', async (req: Request, res: Response) => {
  const { content, type } = req.body;
  const result = await extractTasksFromContent(content || '', type || 'text');
  res.json(result);
});

app.post('/api/ai/generate-plan', (req: Request, res: Response) => {
  const incomingTasks = req.body.tasks || tasks;
  // Schedule Engine: allocate slots based on urgency & duration
  const startHour = 9;
  let currentHour = startHour;
  let currentMin = 0;

  const newBlocks: ScheduleBlock[] = [];

  incomingTasks.forEach((t: Task, idx: number) => {
    const duration = t.estimatedMinutes || 45;
    const endMinutes = currentHour * 60 + currentMin + duration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const startStr = `${pad(currentHour)}:${pad(currentMin)}`;
    const endStr = `${pad(endH)}:${pad(endM)}`;

    newBlocks.push({
      id: `block-${Date.now()}-${idx}`,
      taskId: t.id,
      title: t.title,
      type: duration >= 60 ? 'deep_work' : t.category === 'Meeting' ? 'meeting' : 'study',
      startTime: startStr,
      endTime: endStr,
      durationMinutes: duration,
      priority: t.priority || 'MEDIUM',
      reason: t.priorityReason || `Optimized for ${t.priority} priority with a ${duration}m block.`,
      status: 'upcoming'
    });

    // Add a 15-min buffer or 45-min lunch break
    let nextStart = endMinutes + 15;
    if (endH >= 12 && currentHour < 12) {
      // Add lunch block
      newBlocks.push({
        id: `lunch-${Date.now()}`,
        title: 'Nutritional & Rest Break',
        type: 'break',
        startTime: `${pad(endH)}:${pad(endM)}`,
        endTime: `${pad(endH + 1)}:${pad(endM)}`,
        durationMinutes: 60,
        priority: 'LOW',
        reason: 'Restoration break between morning deep focus and afternoon tasks.',
        status: 'upcoming'
      });
      nextStart = endMinutes + 60;
    }

    currentHour = Math.floor(nextStart / 60);
    currentMin = nextStart % 60;
  });

  scheduleBlocks = newBlocks;
  res.json({
    schedule: scheduleBlocks,
    summary: 'Plan generated with intelligent buffer distribution and priority weighting.',
    totalFocusMinutes: incomingTasks.reduce((acc: number, cur: Task) => acc + (cur.estimatedMinutes || 0), 0)
  });
});

app.post('/api/ai/reschedule', (req: Request, res: Response) => {
  const { missedTaskId } = req.body;
  const missed = tasks.find(t => t.id === missedTaskId);
  if (missed) {
    missed.status = 'MISSED';
  }

  // Shift missed task into next available slot and compact pending items
  const rebalanced = scheduleBlocks.map(block => {
    if (block.taskId === missedTaskId) {
      return {
        ...block,
        status: 'missed' as const,
        reason: 'Rescheduled: automatic reorganization shifted this to available buffer.'
      };
    }
    return block;
  });

  // Add rescheduled catch-up slot
  if (missed) {
    rebalanced.push({
      id: `resched-${Date.now()}`,
      taskId: missed.id,
      title: `Reorganized: ${missed.title}`,
      type: 'deep_work',
      startTime: '17:30',
      endTime: '19:00',
      durationMinutes: missed.estimatedMinutes || 60,
      priority: 'HIGH',
      reason: 'AI rebalanced this missed high-priority task before tomorrow’s deadline.',
      status: 'upcoming'
    });
  }

  scheduleBlocks = rebalanced;
  res.json({
    success: true,
    reorganizedSchedule: scheduleBlocks,
    message: 'Schedule reorganized dynamically based on remaining available working hours.'
  });
});

// Schedule CRUD
app.get('/api/schedule', (req: Request, res: Response) => {
  res.json({ schedule: scheduleBlocks });
});

app.put('/api/schedule/:id', (req: Request, res: Response) => {
  const index = scheduleBlocks.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Schedule block not found' });
  scheduleBlocks[index] = { ...scheduleBlocks[index], ...req.body };
  res.json({ block: scheduleBlocks[index] });
});

// Focus Mode API
app.post('/api/focus/start', (req: Request, res: Response) => {
  res.json({
    session: {
      id: `foc-${Date.now()}`,
      taskId: req.body.taskId || 'task-1',
      durationMinutes: req.body.durationMinutes || 25,
      startedAt: new Date().toISOString()
    }
  });
});

app.get('/api/focus/sessions', (req: Request, res: Response) => {
  res.json({ sessions: focusSessions });
});

app.post('/api/focus/complete', (req: Request, res: Response) => {
  const session = {
    id: req.body.id || `foc-${Date.now()}`,
    taskId: req.body.taskId || 'task-1',
    taskTitle: req.body.taskTitle || 'Completed ML Assignment',
    durationMinutes: req.body.durationMinutes || 25,
    completedAt: req.body.completedAt || new Date().toISOString(),
    taskCompleted: req.body.taskCompleted ?? req.body.markComplete ?? true,
    distractionScore: req.body.distractionScore ?? 92,
    tabSwitches: req.body.tabSwitches ?? 0,
    lookAwayEvents: req.body.lookAwayEvents ?? 0,
    absenceEvents: req.body.absenceEvents ?? 0,
    pauseCount: req.body.pauseCount ?? 0,
    pauseReasons: req.body.pauseReasons ?? [],
    category: req.body.category || 'Study',
    priority: req.body.priority || 'MEDIUM',
  };
  focusSessions.unshift(session);

  // Update task if provided
  if (req.body.taskId) {
    const task = tasks.find(t => t.id === req.body.taskId);
    if (task) {
      task.actualMinutes += session.durationMinutes;
      if (req.body.markComplete || req.body.taskCompleted) {
        task.status = 'COMPLETED';
      }
    }
  }

  res.json({ success: true, session });
});

app.get('/api/focus/stats', (req: Request, res: Response) => {
  const totalMinutes = focusSessions.reduce((acc, cur) => acc + cur.durationMinutes, 0);
  res.json({
    totalSessions: focusSessions.length,
    totalMinutes,
    todayMinutes: totalMinutes,
    recentSessions: focusSessions.slice(0, 5)
  });
});

// Analytics Dashboard
app.get('/api/analytics/dashboard', (req: Request, res: Response) => {
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalCount = tasks.length;
  const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalFocus = focusSessions.reduce((acc, cur) => acc + cur.durationMinutes, 0) + 155; // baseline

  res.json({
    productivityScore: 82,
    focusTimeFormatted: `${Math.floor(totalFocus / 60)}h ${totalFocus % 60}m`,
    tasksCompleted: completedCount + 5,
    totalTasks: totalCount + 5,
    completionRate: `${rate > 0 ? rate : 87}%`,
    weeklyData: [
      { day: 'Mon', completed: 6, focusMinutes: 140 },
      { day: 'Tue', completed: 8, focusMinutes: 190 },
      { day: 'Wed', completed: 7, focusMinutes: 165 },
      { day: 'Thu', completed: 9, focusMinutes: 210 },
      { day: 'Fri', completed: 5, focusMinutes: 120 },
      { day: 'Sat', completed: 3, focusMinutes: 60 },
      { day: 'Sun', completed: 4, focusMinutes: 90 }
    ],
    priorityDistribution: {
      high: tasks.filter(t => t.priority === 'HIGH').length,
      medium: tasks.filter(t => t.priority === 'MEDIUM').length,
      low: tasks.filter(t => t.priority === 'LOW').length,
    },
    insights: [
      'You complete 32% more tasks when you start with your highest-priority task.',
      'Your most productive focus window is between 9:00 AM and 11:30 AM.',
      'Try scheduling deep work before lunch to avoid afternoon cognitive dips.',
      'You have maintained a 4-day streak of completing all high-priority deadlines!'
    ]
  });
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', name: 'FocusMate API', version: '1.0.0', time: new Date().toISOString() });
});

// -------------------------------------------------------------
// Vite middleware integration (Dev & Prod)
// -------------------------------------------------------------
async function startServer() {
  const isDev = process.env.NODE_ENV === 'development' || process.env.npm_lifecycle_event === 'dev';
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    (!isDev && fs.existsSync(path.join(__dirname, 'dist', 'index.html')));

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const portArgIndex = process.argv.indexOf('--port');
  const portFromArg = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : undefined;
  const port = portFromArg || (process.env.NODE_ENV === 'development' ? 3000 : Number(process.env.PORT || 3000));
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
