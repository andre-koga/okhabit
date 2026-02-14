-- New tracking system: pixel grid with efficient storage
-- Each day tracks from wake_time to sleep_time
-- User switches between activities, never "stops" until sleep
-- We only store activity periods (start/end), not individual minutes
-- Update daily_entries to include wake/sleep times and current activity
ALTER TABLE daily_entries
ADD COLUMN wake_time TIMESTAMPTZ,
    ADD COLUMN sleep_time TIMESTAMPTZ,
    ADD COLUMN current_activity_id uuid REFERENCES activities(id) ON DELETE
SET NULL,
    ADD COLUMN is_awake BOOLEAN DEFAULT false;
-- Create activity_periods table to store each activity session
-- Frontend will calculate the pixel grid from these periods
CREATE TABLE activity_periods (
    id uuid PRIMARY KEY default gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    daily_entry_id uuid NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
    activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create indexes for efficient queries
CREATE INDEX idx_activity_periods_user_day ON activity_periods(user_id, daily_entry_id);
CREATE INDEX idx_activity_periods_times ON activity_periods(start_time, end_time);
-- RLS for activity_periods
ALTER TABLE activity_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can see their own activity periods only." ON activity_periods FOR
SELECT USING (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can create activity periods." ON activity_periods FOR
INSERT TO authenticated WITH CHECK (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can update their own activity periods." ON activity_periods FOR
UPDATE TO authenticated USING (
        (
            SELECT auth.uid()
        ) = user_id
    ) WITH CHECK (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can delete their own activity periods." ON activity_periods FOR DELETE TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
);