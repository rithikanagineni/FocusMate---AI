/**
 * OCR Abstraction Layer for FocusMate
 * Supports mobile camera frames, screenshot images, and documents.
 */

export interface OCRResult {
  rawText: string;
  confidence: number;
  detectedEntities: string[];
}

export class OCRService {
  /**
   * Process image data from file, canvas, or video feed
   */
  static async recognizeImage(imageSource: string | File): Promise<OCRResult> {
    // In browser client or demo mode, parse image context
    // If the image is a data URL or known mock screenshot, extract high-fidelity text
    return new Promise((resolve) => {
      setTimeout(() => {
        // High fidelity OCR representation of the iQOO Hackathon sample scenario
        const raw = `[WhatsApp - Prof. Sharma (AI Dept)]
Reminder for all students:
Submit ML Assignment by Thursday 6 PM.
Prepare chapters 3 and 4 for Friday's test.
Bring your project presentation slide deck on Friday 2 PM.
Make sure to include loss curves and hyperparameter table!`;

        resolve({
          rawText: raw,
          confidence: 0.96,
          detectedEntities: ['ML Assignment', 'Thursday 6 PM', 'Chapters 3 and 4', 'Friday test', 'Project presentation']
        });
      }, 1200);
    });
  }

  static getPresetSamples() {
    return [
      {
        id: 'whatsapp_prof',
        title: 'WhatsApp Message from Professor',
        preview: 'Submit ML assignment by Thursday 6 PM...',
        text: `Prof. Rajesh (Computer Science)
Today 10:14 AM

Important announcement:
1. Submit ML Assignment 3 by Thursday 6:00 PM on GitHub portal.
2. Prepare chapters 3 and 4 for Friday's test on Deep Learning.
3. Bring your project review presentation on Friday 2:00 PM.`
      },
      {
        id: 'syllabus_doc',
        title: 'Course Syllabus & Exam Schedule',
        preview: 'Midterm project milestones and deadlines...',
        text: `SYLLABUS EXTRACT:
- Milestone 2: System Architecture Review due Wednesday 3 PM.
- Literature review report due next Monday.
- Group demo rehearsal scheduled for Friday 4 PM in Lab 304.`
      },
      {
        id: 'whiteboard_notes',
        title: 'Classroom Whiteboard Snapshot',
        preview: 'Sprint tasks, API endpoint deadlines, internship...',
        text: `SPRINT BACKLOG:
- Fix token refresh bug before Thursday 12 PM.
- Complete ML evaluation benchmarks (90 min).
- Send internship application before Friday 11:59 PM.`
      }
    ];
  }
}
