-- Vacation system: day-level break day and per-activity paused state
-- Adds fields used to exclude dates/tasks from streak and completion calculations.

ALTER TABLE daily_entries
ADD COLUMN IF NOT EXISTS paused_task_ids JSONB;

ALTER TABLE daily_entries
ADD COLUMN IF NOT EXISTS is_break_day BOOLEAN DEFAULT FALSE;
