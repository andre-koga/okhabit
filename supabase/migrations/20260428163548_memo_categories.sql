-- Memo categories for organizing one-time-task memos.

CREATE TABLE IF NOT EXISTS memo_categories (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_memo_categories_user_id ON memo_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_memo_categories_deleted_at ON memo_categories(deleted_at);

ALTER TABLE one_time_tasks
    ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES memo_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_one_time_tasks_category_id ON one_time_tasks(category_id);

ALTER TABLE memo_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own memo categories" ON memo_categories;
DROP POLICY IF EXISTS "Users can insert their own memo categories" ON memo_categories;
DROP POLICY IF EXISTS "Users can update their own memo categories" ON memo_categories;
DROP POLICY IF EXISTS "Users can delete their own memo categories" ON memo_categories;

CREATE POLICY "Users can view their own memo categories"
ON memo_categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memo categories"
ON memo_categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memo categories"
ON memo_categories FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memo categories"
ON memo_categories FOR DELETE
USING (auth.uid() = user_id);
