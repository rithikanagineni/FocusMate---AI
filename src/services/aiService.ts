import { Priority, Task, ScheduleBlock, ExtractedTask } from '../types';

export interface ModelOption {
  id: string;
  name: string;
  tier: 'local' | 'cloud';
  description: string;
  speed: string;
  contextWindow: string;
}

export const SUPPORTED_MODELS: ModelOption[] = [
  {
    id: 'qwen-2.5-7b',
    name: 'Qwen 2.5 7B (On-Device / Local)',
    tier: 'local',
    description: 'Ultra-low latency edge model optimized for mobile task extraction and scheduling.',
    speed: '48 tok/s',
    contextWindow: '32k'
  },
  {
    id: 'llama-3.2-3b',
    name: 'Llama 3.2 3B (Compact Edge)',
    tier: 'local',
    description: 'Lightweight on-device model with minimal battery and memory footprint.',
    speed: '65 tok/s',
    contextWindow: '128k'
  },
  {
    id: 'gemma-2',
    name: 'Gemma 2 9B (Google Open Weights)',
    tier: 'local',
    description: 'High cognitive reasoning for complex schedule conflict resolution.',
    speed: '38 tok/s',
    contextWindow: '8k'
  },
  {
    id: 'phi-3.5',
    name: 'Phi 3.5 Mini (Microsoft)',
    tier: 'local',
    description: 'Specialized in logic, timeline planning, and structured JSON outputs.',
    speed: '55 tok/s',
    contextWindow: '128k'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Cloud Compute)',
    tier: 'cloud',
    description: 'Multimodal cloud engine for massive document extraction and audio files.',
    speed: 'Cloud API',
    contextWindow: '1M'
  }
];

export class AIService {
  static getSelectedModel(): string {
    return localStorage.getItem('focusmate_model') || 'qwen-2.5-7b';
  }

  static setSelectedModel(modelId: string) {
    localStorage.setItem('focusmate_model', modelId);
  }

  static getProcessingMode(): 'auto' | 'local' | 'cloud' {
    return (localStorage.getItem('focusmate_processing_mode') as any) || 'auto';
  }

  static setProcessingMode(mode: 'auto' | 'local' | 'cloud') {
    localStorage.setItem('focusmate_processing_mode', mode);
  }

  /**
   * Priority Engine: Calculates priority and transparent explanation
   */
  static computePriority(params: {
    deadlineHoursAway: number;
    estimatedMinutes: number;
    isExplicitlyImportant?: boolean;
    hasDependencies?: boolean;
  }): { priority: Priority; reason: string } {
    const { deadlineHoursAway, estimatedMinutes, isExplicitlyImportant } = params;

    if (deadlineHoursAway <= 24 || isExplicitlyImportant || estimatedMinutes >= 90) {
      return {
        priority: 'HIGH',
        reason: `High priority: ${
          deadlineHoursAway <= 24
            ? `Due in ${Math.round(deadlineHoursAway)} hours`
            : estimatedMinutes >= 90
            ? 'Requires uninterrupted deep-work block (90m+)'
            : 'Flagged as high-impact milestone'
        }.`
      };
    }

    if (deadlineHoursAway <= 72) {
      return {
        priority: 'MEDIUM',
        reason: `Medium priority: Due within 2–3 days (${Math.round(deadlineHoursAway / 24)} days left).`
      };
    }

    return {
      priority: 'LOW',
      reason: `Low priority: Flexible timeline (>3 days out). Ideal for buffer catch-up.`
    };
  }

  /**
   * Schedule Engine: Generates time blocks respecting working hours and buffers
   */
  static generateSchedule(tasks: (Task | ExtractedTask)[], startHour = 9): ScheduleBlock[] {
    const sorted = [...tasks].sort((a, b) => {
      const pWeights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return pWeights[b.priority] - pWeights[a.priority];
    });

    const blocks: ScheduleBlock[] = [];
    let currentHour = startHour;
    let currentMin = 0;

    sorted.forEach((item, index) => {
      const duration = item.estimatedMinutes || 45;
      const endTotal = currentHour * 60 + currentMin + duration;
      const endH = Math.floor(endTotal / 60);
      const endM = endTotal % 60;

      const pad = (n: number) => n.toString().padStart(2, '0');
      const startStr = `${pad(currentHour)}:${pad(currentMin)}`;
      const endStr = `${pad(endH)}:${pad(endM)}`;

      blocks.push({
        id: `block-${Date.now()}-${index}`,
        taskId: item.id,
        title: item.title,
        type: duration >= 60 ? 'deep_work' : item.category === 'Meeting' ? 'meeting' : 'study',
        startTime: startStr,
        endTime: endStr,
        durationMinutes: duration,
        priority: item.priority,
        reason: item.priorityReason || `Scheduled ${item.priority} task in optimal focus slot.`,
        status: index === 0 ? 'current' : 'upcoming'
      });

      // Add a 15m buffer or lunch break
      let nextStart = endTotal + 15;
      if (endH >= 12 && currentHour < 12) {
        blocks.push({
          id: `lunch-${Date.now()}`,
          title: 'Lunch & Screen Break',
          type: 'break',
          startTime: `${pad(endH)}:${pad(endM)}`,
          endTime: `${pad(endH + 1)}:${pad(endM)}`,
          durationMinutes: 60,
          priority: 'LOW',
          reason: 'Nutritional and mental recharge before afternoon work.',
          status: 'upcoming'
        });
        nextStart = endTotal + 60;
      }

      currentHour = Math.floor(nextStart / 60);
      currentMin = nextStart % 60;
    });

    // Add a final buffer block
    blocks.push({
      id: `buffer-${Date.now()}`,
      title: 'Buffer / Catch-up & Daily Wrap-up',
      type: 'buffer',
      startTime: '17:30',
      endTime: '18:15',
      durationMinutes: 45,
      priority: 'LOW',
      reason: 'Safety buffer before end-of-day deadline window.',
      status: 'upcoming'
    });

    return blocks;
  }
}
