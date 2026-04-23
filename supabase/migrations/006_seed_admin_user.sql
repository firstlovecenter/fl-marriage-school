-- Seed default admin user for initial dashboard access
-- Update credentials after first login in production.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO admin_users (email, password_hash)
VALUES (
  'admin@flms.local',
  crypt('Admin@12345', gen_salt('bf', 10))
)
ON CONFLICT (email)
DO UPDATE SET
  password_hash = EXCLUDED.password_hash;
