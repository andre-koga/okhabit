CREATE TABLE one_time_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE one_time_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can see their own one time tasks." ON one_time_tasks FOR
SELECT USING (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can create one time tasks." ON one_time_tasks FOR
INSERT TO authenticated WITH CHECK (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can update their own one time tasks." ON one_time_tasks FOR
UPDATE TO authenticated USING (
        (
            SELECT auth.uid()
        ) = user_id
    ) WITH CHECK (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can delete their own one time tasks." ON one_time_tasks FOR DELETE TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
);