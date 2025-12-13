CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Auto-create profile when auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN
INSERT INTO public.users (id, email)
VALUES (NEW.id, NEW.email) ON CONFLICT (id) DO NOTHING;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public,
    auth;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
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