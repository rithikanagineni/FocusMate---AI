# FocusMate Architecture & Technical Specifications

**iQOO Hackathon 2026 - Productivity Track**  
*Your AI Productivity Companion: Turn Unstructured Information into Realistic Schedules and Focused Execution*

---

## 1. High-Level Concept Architecture

```
PHONE
Camera / Voice / Files / Text
        ↓
OCR / Speech-to-Text / Document Parser
        ↓
AI MODEL ABSTRACTION LAYER
(Qwen / Llama / Gemma / Phi / Gemini / Local Fallback)
        ↓
STRUCTURED EXTRACTION ENGINE
(Tasks, Deadlines, Dependencies, Durations)
        ↓
PRIORITY ENGINE
(Urgency, Impact, Effort, Cognitive Load)
        ↓
SCHEDULE ENGINE
(Time blocking, Deep Work, Rest Buffers, Auto-Rebalance)
        ↓
DISTRACTION-FREE FOCUS MODE
(AI Coach, Pomodoro, Soundscapes)
        ↓
PRODUCTIVITY ANALYTICS
```

---

## 2. Phone + Laptop "Office Kit" Workflow

FocusMate addresses the dual-screen reality of modern students and professionals:
1. **Phone as Capture Surface:** High-speed capture of WhatsApp screenshots, professor board photos, hallway voice memos, and document photos.
2. **AI Processing Pipeline:** Fast on-device parsing or cloud/laptop offload.
3. **Smart Synchronization:** Schedule auto-rebalances and triggers notifications on phone and web simultaneously.
4. **Execution:** Distraction-free phone focus timer with ambient soundscapes and gentle coaching prompts.

---

## 3. Data Schema

- **Users:** Core identity, auth tokens, productivity stats.
- **Tasks:** Priority, deadlines, estimated effort, actual minutes, source provenance (`camera`, `voice`, `screenshot`, `document`, `manual`).
- **Subtasks:** Granular breakdown items for complex deliverables.
- **AI Captures & Extractions:** Traceability logs for unstructured input and AI reasoning explanations.
- **Schedule Blocks:** Visual time-blocked day plan with contextual reasoning ("Why was this placed here?").
- **Focus Sessions:** Session logs, completion states, and productivity metrics.

---

## 4. Priority Engine Algorithm

Task Priority $P$ is calculated as a composite score:

$$P = w_1 \cdot \text{Urgency}(\Delta t) + w_2 \cdot \text{Impact} + w_3 \cdot \text{Effort} + w_4 \cdot \text{Dependencies}$$

- **High Priority:** Deadline $< 24$ hours OR high exam/milestone weight.
- **Medium Priority:** Deadline within $2-3$ days OR dependent task.
- **Low Priority:** Maintenance, backlogs, deadline $> 3$ days.

---

## 5. Model Abstraction Layer

FocusMate does not hard-code dependencies to a single vendor. It defines a pluggable interface:
- **Local Open-Source:** Qwen-2.5-7B, Llama-3.2-3B, Gemma-2-9B, Phi-3.5
- **Cloud AI:** Google Gemini 2.5 Flash
- **Deterministic Offline Fallback:** Regex and linguistic rule engine guaranteeing zero-failure demo even when offline or unauthenticated.
