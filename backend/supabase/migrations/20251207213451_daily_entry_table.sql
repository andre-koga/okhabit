CREATE TABLE daily_entries (
    id uuid PRIMARY KEY default gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date TIMESTAMPTZ,
    completed_tasks uuid []
);
-- RLS
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
-- Policies
CREATE POLICY "User can see their own daily entries only." ON daily_entries FOR
SELECT USING (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can create a daily entry." ON daily_entries FOR
INSERT TO authenticated WITH CHECK (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can update their own daily entries." ON daily_entries FOR
UPDATE TO authenticated USING (
        (
            SELECT auth.uid()
        ) = user_id
    ) WITH CHECK (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can delete their own daily entries." ON daily_entries FOR DELETE TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
)