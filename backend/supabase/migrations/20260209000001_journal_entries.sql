-- Create journal entries table for end-of-day reflections
CREATE TABLE journal_entries (
    id uuid PRIMARY KEY default gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    daily_entry_id uuid REFERENCES daily_entries(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Journal content
    text_content TEXT,
    day_quality INTEGER CHECK (
        day_quality >= 1
        AND day_quality <= 5
    ),
    is_bookmarked BOOLEAN DEFAULT FALSE,
    day_emoji TEXT,
    -- File references (stored in Supabase Storage)
    photo_urls TEXT [],
    -- Array of storage paths
    video_url TEXT,
    -- Single video storage path
    -- Ensure one journal entry per user per day
    UNIQUE(user_id, entry_date)
);
-- Add character limit constraint on text_content (500 characters)
ALTER TABLE journal_entries
ADD CONSTRAINT text_content_length_check CHECK (char_length(text_content) <= 500);
-- Add emoji validation (ensure it's a single emoji/character)
ALTER TABLE journal_entries
ADD CONSTRAINT day_emoji_length_check CHECK (char_length(day_emoji) <= 10);
-- Allow up to 10 chars for complex emojis
-- Create indexes for efficient queries
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_bookmarked ON journal_entries(user_id, is_bookmarked)
WHERE is_bookmarked = TRUE;
-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
-- RLS Policies
CREATE POLICY "Users can view their own journal entries" ON journal_entries FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own journal entries" ON journal_entries FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON journal_entries FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON journal_entries FOR DELETE USING (auth.uid() = user_id);