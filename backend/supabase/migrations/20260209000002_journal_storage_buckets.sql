-- Create storage buckets for journal media
-- Note: Storage buckets are typically created via Supabase Dashboard or API
-- This file documents the required bucket configuration
-- Create storage bucket for journal photos
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'journal-photos',
        'journal-photos',
        FALSE,
        -- Private bucket, only accessible by owner
        5242880,
        -- 5MB limit per photo
        ARRAY ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    );
-- Create storage bucket for journal videos  
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'journal-videos',
        'journal-videos',
        FALSE,
        -- Private bucket, only accessible by owner
        52428800,
        -- 50MB limit for videos
        ARRAY ['video/mp4', 'video/quicktime', 'video/webm']
    );
-- RLS Policies for journal-photos bucket
CREATE POLICY "Users can upload their own journal photos" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
        bucket_id = 'journal-photos'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Users can view their own journal photos" ON storage.objects FOR
SELECT TO authenticated USING (
        bucket_id = 'journal-photos'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Users can update their own journal photos" ON storage.objects FOR
UPDATE TO authenticated USING (
        bucket_id = 'journal-photos'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Users can delete their own journal photos" ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'journal-photos'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- RLS Policies for journal-videos bucket
CREATE POLICY "Users can upload their own journal videos" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
        bucket_id = 'journal-videos'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Users can view their own journal videos" ON storage.objects FOR
SELECT TO authenticated USING (
        bucket_id = 'journal-videos'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Users can update their own journal videos" ON storage.objects FOR
UPDATE TO authenticated USING (
        bucket_id = 'journal-videos'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Users can delete their own journal videos" ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'journal-videos'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);