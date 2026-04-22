ALTER TABLE pastor_recommendations
ADD COLUMN IF NOT EXISTS knows_couple_duration TEXT,
ADD COLUMN IF NOT EXISTS recommends_couple BOOLEAN DEFAULT FALSE;