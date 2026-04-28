-- Re-introduce activity group emoji metadata.
ALTER TABLE activity_groups
  ADD COLUMN IF NOT EXISTS emoji TEXT;
