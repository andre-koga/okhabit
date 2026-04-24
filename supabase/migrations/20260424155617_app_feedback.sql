-- Store user-submitted app feedback requests.
CREATE TABLE IF NOT EXISTS app_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_feedback_user_id ON app_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_app_feedback_created_at ON app_feedback(created_at DESC);

ALTER TABLE app_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own app feedback" ON app_feedback;
DROP POLICY IF EXISTS "Users can insert their own app feedback" ON app_feedback;

CREATE POLICY "Users can view their own app feedback"
ON app_feedback
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own app feedback"
ON app_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);
