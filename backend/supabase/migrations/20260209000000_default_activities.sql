-- Create default activities for new users
-- This migration adds Downtime and Transition activities automatically when a user signs up
-- Update the handle_new_user function to create default activities
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
DECLARE default_group_id uuid;
transition_activity_id uuid;
BEGIN -- Insert user record
INSERT INTO public.users (id, email, created_at, updated_at)
VALUES (
        NEW.id,
        NEW.email,
        NEW.created_at,
        NEW.updated_at
    ) ON CONFLICT (id) DO NOTHING;
-- Create a default activity group for system activities
INSERT INTO activity_groups (user_id, name, color, is_archived)
VALUES (NEW.id, 'System', '#6B7280', B '0')
RETURNING id INTO default_group_id;
-- Create Transition activity
INSERT INTO activities (
        user_id,
        group_id,
        name,
        color,
        routine,
        is_completed
    )
VALUES (
        NEW.id,
        default_group_id,
        'Transition',
        '#F59E0B',
        'default',
        B '0'
    )
RETURNING id INTO transition_activity_id;
-- Create Downtime activity
INSERT INTO activities (
        user_id,
        group_id,
        name,
        color,
        routine,
        is_completed
    )
VALUES (
        NEW.id,
        default_group_id,
        'Downtime',
        '#6B7280',
        'default',
        B '0'
    );
-- Create initial time entry for Transition activity (user is starting their day)
INSERT INTO time_entries (user_id, activity_id, time_start)
VALUES (NEW.id, transition_activity_id, NOW());
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Note: The trigger on_auth_user_created already exists and will use this updated function