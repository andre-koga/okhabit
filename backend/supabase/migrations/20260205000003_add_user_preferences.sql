-- Add user preferences for typical wake/sleep times
ALTER TABLE public.users
ADD COLUMN typical_wake_time TIME DEFAULT '07:00:00',
    ADD COLUMN typical_sleep_time TIME DEFAULT '23:00:00';
-- Policy to allow users to insert their own record (in case trigger didn't fire)
CREATE POLICY "Users can insert own user data" ON public.users FOR
INSERT WITH CHECK (auth.uid() = id);
-- Policy to allow users to update their own preferences
CREATE POLICY "Users can update own user data" ON public.users FOR
UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);