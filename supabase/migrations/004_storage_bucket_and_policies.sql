-- Storage setup for FLMS uploads
-- This enables browser uploads from the public registration form.

-- 1) Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('flms-uploads', 'flms-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 2) Remove old versions of policies if they exist
DROP POLICY IF EXISTS "Public upload to flms-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read from flms-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public update own uploads in flms-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public delete own uploads in flms-uploads" ON storage.objects;

-- 3) Public upload policy for registration/pastor forms (anon key)
CREATE POLICY "Public upload to flms-uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'flms-uploads');

-- 4) Public read policy for previews/download links used by the app
CREATE POLICY "Public read from flms-uploads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'flms-uploads');

-- 5) Optional: allow users to replace/delete files in same bucket (useful in dev)
CREATE POLICY "Public update own uploads in flms-uploads"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'flms-uploads')
WITH CHECK (bucket_id = 'flms-uploads');

CREATE POLICY "Public delete own uploads in flms-uploads"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'flms-uploads');