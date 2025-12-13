CREATE TABLE time_entries (
    id uuid PRIMARY KEY default gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    activity_id uuid NOT NULL REFERENCES "activities" ON DELETE CASCADE,
    time_start TIMESTAMPTZ default NOW(),
    time_end TIMESTAMPTZ default NULL
);
-- RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
-- Policies
CREATE POLICY "User can see their own time entries only." ON time_entries FOR
SELECT USING (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can create a time entry." ON time_entries FOR
INSERT TO authenticated WITH CHECK (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can update their own time entries." ON time_entries FOR
UPDATE TO authenticated USING (
        (
            SELECT auth.uid()
        ) = user_id
    ) WITH CHECK (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can delete their own time entries." ON time_entries FOR DELETE TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
)