-- Create user record when a new user signs up
-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN -- Insert user record
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
-- Note: The trigger on_auth_user_created already exists and will use this updated function