-- FLMS Initial Database Schema
-- First Love Marriage School - Premarital Counselling System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions (one per couple registration attempt)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT UNIQUE NOT NULL,       -- e.g. FLMS-2847, shown to user for resuming
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  reminder_sent_at TIMESTAMPTZ,            -- tracks if day-10 reminder was sent
  status TEXT DEFAULT 'incomplete'         -- incomplete | submitted | expired
);

-- Main couple registration data
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ,

  -- Section 1: Personal Details
  male_name TEXT,
  male_email TEXT,
  male_dob DATE,
  male_phone TEXT,                         -- WhatsApp number
  male_place_of_birth TEXT,
  male_residential_address TEXT,
  male_born_again BOOLEAN,
  male_born_again_when TEXT,
  male_born_again_why_not TEXT,
  male_passport_photo_url TEXT,            -- Supabase Storage URL

  female_name TEXT,
  female_email TEXT,
  female_dob DATE,
  female_phone TEXT,
  female_place_of_birth TEXT,
  female_residential_address TEXT,
  female_born_again BOOLEAN,
  female_born_again_when TEXT,
  female_born_again_why_not TEXT,
  female_passport_photo_url TEXT,

  payment_screenshot_url TEXT,
  payment_verified BOOLEAN DEFAULT FALSE,  -- admin marks this

  -- Section 2: Personality
  male_temperament TEXT,
  male_love_language TEXT,
  female_temperament TEXT,
  female_love_language TEXT,

  -- Section 3: Educational Background
  male_education_level TEXT,               -- Primary | Secondary | Tertiary | Postgraduate
  male_schools_attended TEXT,
  male_occupation TEXT,
  male_employer TEXT,
  male_employer_duration TEXT,
  male_contact_number TEXT,

  female_education_level TEXT,
  female_schools_attended TEXT,
  female_occupation TEXT,
  female_employer TEXT,
  female_employer_duration TEXT,
  female_contact_number TEXT,

  -- Section 4: Parental Awareness
  male_father_name TEXT,
  male_father_occupation TEXT,
  male_parental_knowledge BOOLEAN,
  male_parental_consent BOOLEAN,
  male_parent_contact TEXT,
  male_parents_married BOOLEAN,
  male_parents_live_together BOOLEAN,
  male_parents_marriage_condition TEXT,    -- Divorced | Separated | Deceased | N/A
  male_deceased_parent_alive TEXT,
  male_grew_up_with_both_parents BOOLEAN,
  male_guardian_relationship TEXT,         -- Good | Cordial | Bad | N/A
  male_beloved_parents_relationship TEXT,
  male_beloved_family_relationship TEXT,

  female_father_name TEXT,
  female_father_occupation TEXT,
  female_parental_knowledge BOOLEAN,
  female_parental_consent BOOLEAN,
  female_parent_contact TEXT,
  female_parents_married BOOLEAN,
  female_parents_live_together BOOLEAN,
  female_parents_marriage_condition TEXT,
  female_deceased_parent_alive TEXT,
  female_grew_up_with_both_parents BOOLEAN,
  female_guardian_relationship TEXT,
  female_beloved_parents_relationship TEXT,
  female_beloved_family_relationship TEXT,

  -- Section 5: Church Information
  male_church_name TEXT,
  male_ministry TEXT,
  male_pastor_name TEXT,
  male_pastor_phone TEXT,
  male_pastor_email TEXT,
  male_church_joined_date DATE,
  male_church_history TEXT,
  male_church_involvement TEXT,            -- Excellent | Good | Fair | Poor
  male_church_attendance TEXT,             -- Regular | Usual | Irregular
  male_attendance_reason TEXT,

  female_church_name TEXT,
  female_ministry TEXT,
  female_pastor_name TEXT,
  female_pastor_phone TEXT,
  female_pastor_email TEXT,
  female_church_joined_date DATE,
  female_church_history TEXT,
  female_church_involvement TEXT,
  female_church_attendance TEXT,
  female_attendance_reason TEXT,

  -- Section 6: Personal History
  male_been_married BOOLEAN,
  male_marriage_type TEXT,                 -- Customary | Under The Ordinance | Marriage of Convenience | N/A
  male_prev_marriage_status TEXT,          -- Divorced | Separated | Deceased | N/A
  male_has_divorce_docs BOOLEAN,
  male_divorce_docs_url TEXT,
  male_has_children BOOLEAN,
  male_children_details TEXT,
  male_has_impregnated BOOLEAN,

  female_been_married BOOLEAN,
  female_marriage_type TEXT,
  female_prev_marriage_status TEXT,
  female_has_divorce_docs BOOLEAN,
  female_divorce_docs_url TEXT,
  female_has_children BOOLEAN,
  female_children_details TEXT,
  female_has_been_pregnant BOOLEAN,

  -- Section 7: Medical
  male_medical_report_urls TEXT[],         -- array of Supabase Storage URLs
  female_medical_report_urls TEXT[],

  -- Section 8: Declaration
  male_signature_url TEXT,                 -- Supabase Storage URL (canvas export)
  female_signature_url TEXT,
  declaration_agreed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastor recommendations (one row per pastor per couple)
CREATE TABLE pastor_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,              -- unique URL token, e.g. /pastor/abc123xyz
  partner TEXT NOT NULL,                   -- 'male' or 'female' (which partner's pastor)
  pastor_name TEXT,
  pastor_phone TEXT,
  pastor_email TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  submitted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',           -- pending | submitted | expired

  -- Pastor form responses
  knows_couple_personally BOOLEAN,
  readiness_assessment TEXT,               -- free text
  both_believers TEXT,                     -- Yes | No | One of them
  concerns TEXT,                           -- free text, nullable
  pastor_church TEXT,
  pastor_contact_confirmed TEXT
);

-- Admin users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sessions_code ON sessions(session_code);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_pastor_token ON pastor_recommendations(token);
CREATE INDEX idx_pastor_reg ON pastor_recommendations(registration_id);
CREATE INDEX idx_pastor_status ON pastor_recommendations(status);
CREATE INDEX idx_registrations_session ON registrations(session_id);
CREATE INDEX idx_registrations_submitted ON registrations(submitted_at);

-- Set up timestamps with automatic update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
