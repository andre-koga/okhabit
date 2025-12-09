CREATE TABLE activities (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users on delete cascade,
    group_id uuid not null references "activity_groups" on delete cascade,
    created_at timestamptz default now(),
    name text,
    color text,
    routine text,
    is_completed bit
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