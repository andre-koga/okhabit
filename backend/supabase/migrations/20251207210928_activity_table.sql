CREATE TABLE activities (
    id uuid PRIMARY KEY default gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    group_id uuid NOT NULL REFERENCES "activity_groups" ON DELETE CASCADE,
    created_at timestamptz default NOW(),
    name TEXT,
    color TEXT,
    routine TEXT,
    is_completed BIT
);
-- RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
-- Policies
CREATE POLICY "User can see their own activity groups only." ON activities FOR
SELECT USING (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can create a group." ON activities FOR
INSERT TO authenticated WITH CHECK (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can update their own groups." ON activities FOR
UPDATE TO authenticated USING (
        (
            SELECT auth.uid()
        ) = user_id
    ) WITH CHECK (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can delete their own groups." ON activities FOR DELETE TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
)