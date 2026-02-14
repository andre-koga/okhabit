-- Add title column to journal_entries table
ALTER TABLE journal_entries
ADD COLUMN title TEXT NOT NULL DEFAULT '';
-- Add constraint for title length (max 30 characters)
ALTER TABLE journal_entries
ADD CONSTRAINT title_length_check CHECK (
        char_length(title) <= 30
        AND char_length(title) > 0
    );
-- Remove the default after adding the column
ALTER TABLE journal_entries
ALTER COLUMN title DROP DEFAULT;