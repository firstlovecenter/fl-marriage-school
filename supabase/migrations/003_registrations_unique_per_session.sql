-- Ensure one registration row per session.
-- 1) Keep the most recently updated row for each session_id.
-- 2) Delete older duplicates.
-- 3) Enforce uniqueness moving forward.

WITH ranked AS (
  SELECT
    id,
    session_id,
    ROW_NUMBER() OVER (
      PARTITION BY session_id
      ORDER BY COALESCE(updated_at, created_at) DESC, created_at DESC, id DESC
    ) AS rn
  FROM registrations
)
DELETE FROM registrations r
USING ranked x
WHERE r.id = x.id
  AND x.rn > 1;

DROP INDEX IF EXISTS idx_registrations_session;

CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_session_unique
ON registrations(session_id);