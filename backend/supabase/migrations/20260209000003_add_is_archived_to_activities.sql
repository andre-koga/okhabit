-- Add is_archived column to activities table
ALTER TABLE activities
ADD COLUMN is_archived BOOLEAN DEFAULT false;
-- Create index for efficient queries on archived activities
CREATE INDEX IF NOT EXISTS idx_activities_archived ON activities(user_id, is_archived);