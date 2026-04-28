-- Replace memo_categories with a direct reference to activity_groups (projects).
-- Drops the just-added memo_categories table and one_time_tasks.category_id,
-- then adds one_time_tasks.group_id pointing at activity_groups.

ALTER TABLE one_time_tasks
    DROP COLUMN IF EXISTS category_id;

DROP INDEX IF EXISTS idx_one_time_tasks_category_id;

ALTER TABLE one_time_tasks
    ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES activity_groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_one_time_tasks_group_id ON one_time_tasks(group_id);

DROP POLICY IF EXISTS "Users can view their own memo categories" ON memo_categories;
DROP POLICY IF EXISTS "Users can insert their own memo categories" ON memo_categories;
DROP POLICY IF EXISTS "Users can update their own memo categories" ON memo_categories;
DROP POLICY IF EXISTS "Users can delete their own memo categories" ON memo_categories;

DROP TABLE IF EXISTS memo_categories;
