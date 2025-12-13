CREATE TABLE activity_groups (
    id uuid PRIMARY KEY default gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ default NOW(),
    name TEXT,
    color TEXT,
    is_archived BIT
);
-- RLS
ALTER TABLE activity_groups ENABLE ROW LEVEL SECURITY;
-- Policies
CREATE POLICY "User can see their own activity groups only." ON activity_groups FOR
SELECT USING (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can create a group." ON activity_groups FOR
INSERT TO authenticated WITH CHECK (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can update their own groups." ON activity_groups FOR
UPDATE TO authenticated USING (
        (
            SELECT auth.uid()
        ) = user_id
    ) WITH CHECK (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "User can delete their own groups." ON activity_groups FOR DELETE TO authenticated USING (
    (
        SELECT auth.uid()
    ) = user_id
)