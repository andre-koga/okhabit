-- Fix BIT types to BOOLEAN
ALTER TABLE activity_groups
ALTER COLUMN is_archived DROP DEFAULT,
    ALTER COLUMN is_archived TYPE BOOLEAN USING (is_archived::int::boolean),
    ALTER COLUMN is_archived
SET DEFAULT false;
ALTER TABLE activities
ALTER COLUMN is_completed DROP DEFAULT,
    ALTER COLUMN is_completed TYPE BOOLEAN USING (is_completed::int::boolean),
    ALTER COLUMN is_completed
SET DEFAULT false;
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_groups_user_id ON activity_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_group_id ON activities(group_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_activity_id ON time_entries(activity_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_id ON daily_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_date ON daily_entries(date);
-- Note: Unique constraint on (user_id, date) is handled in application logic
-- since TIMESTAMPTZ to DATE cast is not IMMUTABLE in PostgreSQL (timezone dependent)