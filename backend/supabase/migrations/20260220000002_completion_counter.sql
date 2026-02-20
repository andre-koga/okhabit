-- Replace boolean task completion with a numeric counter system.
-- Each activity gets a `completion_target` (default 1, i.e. previous boolean behaviour).
-- Each daily entry stores a JSONB map of { activity_id: count } instead of the uuid[].
-- 1. Add completion_target to activities
ALTER TABLE activities
ADD COLUMN completion_target INTEGER NOT NULL DEFAULT 1;
-- 2. Drop legacy is_completed column (was boolean, never actively used by the app)
ALTER TABLE activities DROP COLUMN IF EXISTS is_completed;
-- 3. Add task_counts JSONB to daily_entries
ALTER TABLE daily_entries
ADD COLUMN task_counts JSONB NOT NULL DEFAULT '{}';
-- 4. Migrate existing completed_tasks data → task_counts (each completed task = count of 1)
UPDATE daily_entries
SET task_counts = (
        SELECT COALESCE(jsonb_object_agg(task_id::text, 1), '{}')
        FROM unnest(completed_tasks) AS task_id
    )
WHERE completed_tasks IS NOT NULL
    AND cardinality(completed_tasks) > 0;
-- 5. Drop the old completed_tasks column
ALTER TABLE daily_entries DROP COLUMN completed_tasks;