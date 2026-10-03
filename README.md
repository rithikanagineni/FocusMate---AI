# FocusMate — AI Productivity & Focus Proctoring Companion

> **"Turn Chaos into Clear Action, and Stay Truly Focused."**  
> AI-powered task capture, automatic time-blocked scheduling, and an **intelligent camera-monitored Focus Mode** that detects distractions and holds students accountable.

---

## 🚀 Key Highlights & Features

### 1. Unstructured to Structured AI Capture
- **Multimodal Inputs:** Takes raw screenshots (e.g. WhatsApp announcements, syllabus photos), voice memos (via Web Speech API), or documents and converts them directly into actionable tasks.
- **Priority & Cognitive Effort Engine:** Automatically computes deadline urgency, cognitive load, and assigns human-readable explanations (e.g., *"High priority because due tomorrow and requires 90 mins deep work"*).
- **Time-Blocked Daily Schedule:** Arranges tasks into deep work blocks, study slots, lunch buffers, and catch-up breaks.

---

### 2. Intelligent Camera Proctoring & Attention Monitoring
To ensure students do not slack off, open other tabs, or turn away while the timer runs:
- **Mandatory Camera Requirement:**
  - When clicking **"Start Focus"**, the application automatically requests camera access (`getUserMedia`).
  - If the user refuses or camera is blocked, **Focus Mode will not run**.
  - A live Picture-in-Picture (PIP) camera HUD displays in the top corner of the focus card with a real-time status badge and an animated indicator.
- **Distraction Detection (Screen & Desk Notes Allowed):**
  - 💻 **Screen View:** Looking directly at the screen is verified and permitted.
  - ✍️ **Desk Notes View:** Looking down at a physical notebook or study desk is recognized and permitted.
  - ❌ **Head Turned Away:** Turning the face sideways (left or right) or looking up away from desk notes is immediately detected.
  - ❌ **No Face / Absence:** Stepping away from the camera or covering the lens is immediately flagged.
  - ❌ **Tab Switching / Inactivity:** Switching tabs or minimizing the window is caught instantly via `visibilitychange` and window blur listeners.
- **Audible Danger Sound Alarm:**
  - Whenever a distraction occurs, a synthesized dual-frequency error buzzer (`soundEngine.playDangerAlert()`) sounds immediately, accompanied by a high-contrast danger alert banner.

---

### 3. Accountable Pause Verification
- **No Silent Pausing:** Clicking **"Pause Focus"** opens a mandatory accountability dialog.
- **Reason Requirement:** The student must select or enter why they are stepping away (e.g., *Grabbing textbook or notes*, *Getting calculator*, *Water/restroom break*).
- All pauses, reasons, and timestamps are logged into the session's audit trail.
- Clicking **"Resume Focus"** restarts camera proctoring and continues the timer.

---

### 4. Task Completion Verification & Continuous Focus Loop
When the timer countdown reaches `00:00`:
- The alarm sound rings continuously until silenced with the **STOP ALARM** button.
- The app directly prompts the user:  
  **"Did you complete your task: '{Task Title}'?"**
- **Option 1: "Yes, Completed!"**
  - Automatically marks the task as **`COMPLETED`** in the database and task list.
  - Adds the actual minutes spent into analytics.
  - Returns to the dashboard with a success confirmation.
- **Option 2: "No, Need More Time"**
  - Keeps the task in progress.
  - Displays quick time extension options: **`+5m`**, **`+10m`**, **`+15m`**, **`+25m`**, or repeat previous duration.
  - **Reopens the focus timer and resumes camera proctoring immediately**, continuing until the task is truly finished!

---

### 5. Session Focus & Proctoring Report
After every focus session, an **AI Focus & Proctoring Report** is generated:
- **Focus Integrity Score (0–100%):** Calculated based on focus duration versus distraction occurrences.
- **Academic Rating:** (e.g. *Grade A • Exceptional Focus*, *Grade B • Moderate*, *Grade C • High Distraction*).
- **Incident Metrics:** Exact counts of tab switches, look-away events, and absences.
- **Pause Log:** Chronological list of student-provided pause reasons.
- **AI Proctor Evaluation:** Personalized narrative feedback on study discipline.

---

### 6. Focus Timer Audio Engine & Settings
- **Duration Presets:** Quick sprint chips: `5m`, `10m`, `15m`, `25m` (Pomodoro), `45m`, `60m`, `90m`, plus `+`/`-` 1-minute stepper buttons.
- **Built-in Melodic Alarms:**
  - 🔔 *Digital Chime* (Pleasant 4-note ascending chord)
  - 🧘 *Zen Singing Bowl* (432Hz harmonic gong)
  - ⏰ *Classic Digital Beep* (Triple-pulse alert)
  - 🎶 *Melodic Gong* (Deep resonant gong)
- **Custom Music Upload:** Upload any `.mp3`, `.wav`, `.ogg`, or `.m4a` audio file to use as your custom completion alarm.
- **Ambient Background Audio:** Built-in generative audio synthesis while focusing:
  - *Deep Brown Noise*
  - *Gentle Rain*
  - *40Hz Gamma Focus Binaural Beats*
- Independent volume sliders for alarm sound and ambient sound.

---

## 🛠️ Architecture & Tech Stack

```
FOCUSMATE
├── Frontend
│   ├── React 19 + TypeScript
│   ├── Tailwind CSS (v4)
│   ├── Lucide React Icons
│   ├── SoundEngine (Web Audio API synthesis & custom audio player)
│   ├── Camera Proctoring Engine (Native FaceDetector API + YCbCr Skin/Yaw Analyzer)
│   └── Progressive Web App (PWA) with service workers
├── Backend
│   ├── Express (Node.js) on Port 3000
│   ├── Vite middleware integration
│   ├── REST API endpoints (/api/tasks, /api/auth, /api/analytics, /api/ai/*)
│   └── LocalStorage & In-Memory persistence
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/tasks` | Get all tasks for the current user |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update task details |
| `DELETE` | `/api/tasks/:id` | Remove a task |
| `POST` | `/api/tasks/:id/complete` | Toggle task completion |
| `POST` | `/api/focus/complete` | Record completed focus session and update analytics |
| `GET` | `/api/analytics/dashboard` | Get focus score, weekly hours, and productivity metrics |
| `POST` | `/api/ai/capture` | Extract structured tasks from text, voice, or image inputs |
| `POST` | `/api/ai/generate-plan` | Generate an optimized, time-blocked daily schedule |

---

## 💻 Quick Start & Running Locally

### Prerequisites
- Node.js 18 or higher
- npm or pnpm

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

### Production Build
```bash
# Build production bundle
npm run build

# Run linter and type-check
npm run lint
```

---

## 🎯 Typical User Journey

1. **Capture Tasks:** Use the **Capture Hub** to paste study messages, upload syllabus screenshots, or speak voice memos.
2. **Review Priority & Plan:** The AI organizes tasks by urgency and generates a time-blocked day.
3. **Start Focus Mode:**
   - Tap **"Start Focus"** on a selected task.
   - Choose your duration (`5m`, `15m`, `25m`, etc.).
   - Allow camera access when prompted.
4. **Deep Work & Attention Tracking:**
   - Keep your eyes on the screen or down on your desk notes.
   - If you switch tabs or turn your head away, the danger buzzer sounds immediately.
   - If you need to fetch study materials, click **"Pause Focus"** and submit your reason.
5. **Session Finish & Task Completion:**
   - When the countdown finishes, the alarm sounds until stopped.
   - The app asks: *"Did you complete '{Task Title}'?"*
   - Tap **"Yes, Completed!"** to check off the task and record your focus stats, or **"No, Need More Time"** to restart the timer and keep working!
