-- FocusMate PostgreSQL Database Schema
-- Production-ready schema for iQOO Hackathon 2026 Productivity Track

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    tier VARCHAR(32) DEFAULT 'Pro',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    working_hours_start VARCHAR(8) DEFAULT '09:00',
    working_hours_end VARCHAR(8) DEFAULT '18:00',
    daily_focus_goal_minutes INT DEFAULT 180,
    ai_provider VARCHAR(32) DEFAULT 'auto', -- 'auto', 'local', 'cloud', 'mock'
    ai_model VARCHAR(64) DEFAULT 'qwen-2.5-7b', -- 'qwen-2.5-7b', 'llama-3.2-3b', 'gemma-2', 'phi-3.5', 'gemini-2.5-flash'
    deep_work_block_minutes INT DEFAULT 90,
    enable_haptics BOOLEAN DEFAULT TRUE,
    enable_ambient_sound BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    color_hex VARCHAR(16) NOT NULL,
    icon VARCHAR(32) DEFAULT 'folder',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(16) NOT NULL CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED')),
    category VARCHAR(64) DEFAULT 'Study',
    deadline TIMESTAMP WITH TIME ZONE,
    estimated_minutes INT DEFAULT 45,
    actual_minutes INT DEFAULT 0,
    source VARCHAR(32) DEFAULT 'manual' CHECK (source IN ('manual', 'camera', 'voice', 'document', 'screenshot', 'ai')),
    priority_reason TEXT,
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subtasks (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calendar_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_busy BOOLEAN DEFAULT TRUE,
    category VARCHAR(64) DEFAULT 'Meeting',
    source VARCHAR(32) DEFAULT 'external',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS focus_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    task_id VARCHAR(64) REFERENCES tasks(id) ON DELETE SET NULL,
    task_title VARCHAR(255),
    duration_minutes INT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    interrupted BOOLEAN DEFAULT FALSE,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS ai_captures (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    capture_type VARCHAR(32) NOT NULL CHECK (capture_type IN ('camera', 'voice', 'screenshot', 'document', 'text')),
    raw_payload_preview TEXT,
    ocr_extracted_text TEXT,
    speech_transcript TEXT,
    confidence_score FLOAT DEFAULT 0.95,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_extractions (
    id VARCHAR(64) PRIMARY KEY,
    capture_id VARCHAR(64) REFERENCES ai_captures(id) ON DELETE CASCADE,
    extracted_json JSONB NOT NULL,
    tasks_count INT DEFAULT 0,
    processing_time_ms INT,
    model_used VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_schedules (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL,
    blocks_json JSONB NOT NULL,
    optimization_reasoning TEXT,
    accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productivity_stats (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    tasks_completed INT DEFAULT 0,
    total_focus_minutes INT DEFAULT 0,
    productivity_score INT DEFAULT 80,
    streak_days INT DEFAULT 1,
    ai_insights JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, stat_date)
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON focus_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_ai_captures_user ON ai_captures(user_id);
