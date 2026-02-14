-- Create public.users table to mirror auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Policy to allow users to see their own data
CREATE POLICY "Users can view own user data" ON public.users FOR
SELECT USING (auth.uid() = id);
-- Function to create a public.users record when a new auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN
INSERT INTO public.users (id, email, created_at, updated_at)
VALUES (
        NEW.id,
        NEW.email,
        NEW.created_at,
        NEW.updated_at
    ) ON CONFLICT (id) DO NOTHING;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger to automatically create a public.users record
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Insert existing auth.users into public.users
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT id,
    email,
    created_at,
    updated_at
FROM auth.users ON CONFLICT (id) DO NOTHING;