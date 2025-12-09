CREATE TABLE time_entries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users on delete cascade,
    activity_id uuid not null references "activity_table" on delete cascade,
    time_start timestamptz default now(),
    time_end timestamptz default NULL,
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