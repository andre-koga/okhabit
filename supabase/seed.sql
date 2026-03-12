-- OkHabit seed data
-- Runs automatically after migrations during `supabase db reset`.
-- Add test users or sample data here for local development.

-- Ensure required extension for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_user_id UUID;
  v_encrypted_pw TEXT;
BEGIN
  -- Only create the user if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'test@test.com'
  ) THEN
    v_user_id := gen_random_uuid();
    v_encrypted_pw := crypt('password', gen_salt('bf'));

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change_token_current,
      reauthentication_token,
      email_change,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'test@test.com',
      v_encrypted_pw,
      NOW(),
      '',
      '',
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}',
      '{}'::jsonb,
      NOW(),
      NOW()
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      v_user_id,
      format('{"sub": "%s", "email": "test@test.com"}', v_user_id)::jsonb,
      'email',
      v_user_id,
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END $$;

