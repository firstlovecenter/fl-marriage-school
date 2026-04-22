-- Normalize storage policies for browser uploads.
-- Some projects behave inconsistently with TO public in storage RLS,
-- so define explicit anon/authenticated policies.

-- Remove earlier policy variants
DROP POLICY IF EXISTS "Public upload to flms-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read from flms-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public update own uploads in flms-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public delete own uploads in flms-uploads" ON storage.objects;

DROP POLICY IF EXISTS "Anon/auth upload to flms-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anon/auth read from flms-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anon/auth update in flms-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anon/auth delete in flms-uploads" ON storage.objects;

-- Explicit role-based policies
CREATE POLICY "Anon/auth upload to flms-uploads"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'flms-uploads');

CREATE POLICY "Anon/auth read from flms-uploads"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'flms-uploads');

CREATE POLICY "Anon/auth update in flms-uploads"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'flms-uploads')
WITH CHECK (bucket_id = 'flms-uploads');

CREATE POLICY "Anon/auth delete in flms-uploads"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'flms-uploads');