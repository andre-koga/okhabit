CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Policies
CREATE POLICY "User can view own profile" ON public.users FOR
SELECT USING (
        (
            SELECT auth.uid() = id
        )
    );
CREATE POLICY "User can update own profile" ON public.users FOR
UPDATE USING (
        (
            SELECT auth.uid() = id
        )
    );