CREATE TABLE activity_groups (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users on delete cascade,
    created_at timestamptz default now(),
    name text,
    color text,
    is_archived bit
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