-- Remove pattern column from activities
-- Activities no longer need individual patterns; they inherit the group's color
ALTER TABLE activities DROP COLUMN IF EXISTS pattern;