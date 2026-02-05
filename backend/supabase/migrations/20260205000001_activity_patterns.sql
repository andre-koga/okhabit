-- Change activity color to pattern
-- Groups have colors, activities have patterns
-- Remove color from activities, add pattern
ALTER TABLE activities DROP COLUMN IF EXISTS color;
ALTER TABLE activities
ADD COLUMN pattern TEXT DEFAULT 'solid';