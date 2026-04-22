# First Love Marriage School — Copilot Build Prompt

> Paste this entire document into GitHub Copilot Chat in VS Code as your opening prompt.
> It contains the full project context, architecture, data models, and build instructions.

---

## Project Overview

Build a full-stack web application for the **First Love Marriage School (FLMS)** — a premarital counselling programme run by a church. The system replaces an existing Google Form and adds automated pastor notification and an admin dashboard.

**The product has three parts:**
1. A multi-step couple registration form (the main intake)
2. A pastor recommendation form (accessed via a unique auto-sent link)
3. A password-protected admin dashboard

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Vite | Fast, component-friendly for multi-step forms |
| Styling | Tailwind CSS | Utility-first, consistent spacing |
| Backend/DB | Supabase | Postgres DB + file storage + auth, generous free tier |
| Notifications | Arkesel API | Ghana-based, supports WhatsApp + SMS fallback from one API |
| Google Sheets sync | Google Sheets API v4 | Admin needs a spreadsheet view |
| Hosting | Vercel | Free tier, auto-deploys from GitHub |
| Signatures | react-signature-canvas | In-browser canvas signature pad |
| File uploads | Supabase Storage | Passport photos, medical docs, divorce papers, payment screenshots |

---

## Repository Structure

```
flms-registration/
├── src/
│   ├── components/
│   │   ├── form/
│   │   │   ├── FormShell.jsx          # Progress sidebar + section router
│   │   │   ├── sections/
│   │   │   │   ├── S1_PersonalDetails.jsx
│   │   │   │   ├── S2_Personality.jsx
│   │   │   │   ├── S3_Education.jsx
│   │   │   │   ├── S4_ParentalAwareness.jsx
│   │   │   │   ├── S5_ChurchInfo.jsx
│   │   │   │   ├── S6_PersonalHistory.jsx
│   │   │   │   ├── S7_Medical.jsx
│   │   │   │   └── S8_Declaration.jsx
│   │   │   ├── ReviewScreen.jsx       # Full summary before final submit
│   │   │   └── ConfirmationScreen.jsx
│   │   ├── pastor/
│   │   │   └── PastorForm.jsx         # Accessed via unique token link
│   │   └── admin/
│   │       ├── AdminLogin.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── CoupleRow.jsx
│   │       └── CoupleDetail.jsx
│   ├── lib/
│   │   ├── supabase.js                # Supabase client
│   │   ├── arkesel.js                 # Notification helper
│   │   ├── sheets.js                  # Google Sheets sync helper
│   │   └── session.js                 # Save/resume session logic
│   ├── hooks/
│   │   └── useFormSession.js          # Persists form state to Supabase
│   ├── pages/
│   │   ├── index.jsx                  # Landing — start or resume
│   │   ├── register/[sessionId].jsx   # Main form
│   │   ├── pastor/[token].jsx         # Pastor recommendation form
│   │   └── admin/
│   │       ├── index.jsx              # Login
│   │       └── dashboard.jsx
│   └── styles/
│       └── global.css
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.local
└── README.md
```

---

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Arkesel (WhatsApp/SMS)
ARKESEL_API_KEY=your_arkesel_api_key
ARKESEL_SENDER_ID=FLMS

# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=your_private_key

# Admin
ADMIN_PASSWORD_HASH=bcrypt_hashed_password
```

---

## Database Schema (Supabase / Postgres)

```sql
-- 001_initial_schema.sql

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
  male_church_attendance TEXT,            -- Regular | Usual | Irregular
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
  declaration_agreed_at TIMESTAMPTZ
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
  both_believers BOOLEAN,
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

-- Indexes
CREATE INDEX idx_sessions_code ON sessions(session_code);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_pastor_token ON pastor_recommendations(token);
CREATE INDEX idx_pastor_reg ON pastor_recommendations(registration_id);
```

---

## Core Logic — Step by Step

### 1. Landing Page (`/`)
- Two options: **Start new registration** or **Resume with session code**
- "Start new" generates a UUID session, creates a `sessions` row, generates a human-readable `session_code` (format: `FLMS-XXXX`, 4 random uppercase alphanumeric chars)
- Redirects to `/register/[sessionId]`
- "Resume" takes a session code input, looks up the session, redirects to `/register/[sessionId]` at the last completed section

### 2. Form Shell (`/register/[sessionId]`)
- Left sidebar (desktop) or top stepper (mobile) showing 8 sections
- Each section marked: ○ not started / ◑ in progress / ● complete
- Current section rendered in the main content area
- On "Next": validate current section → save to Supabase `registrations` table (upsert) → advance to next section
- On "Back": navigate to previous section, no data loss
- Auto-save on any field blur (debounced 800ms)
- On page load: fetch existing `registrations` row for this session and pre-populate all fields

### 3. Section Navigation Order
```
S1 Personal Details
S2 Personality
S3 Educational Background
S4 Parental Awareness
S5 Church Information
S6 Personal History
S7 Medical (optional uploads)
S8 Declaration + Signatures
→ Review Screen
→ Final Submit
→ Confirmation Screen
```

### 4. Conditional Field Logic
Implement show/hide logic for these fields:

**S1 — Personal Details:**
- `male_born_again_when` → show only if `male_born_again === true`
- `male_born_again_why_not` → show only if `male_born_again === false`
- Same pattern for female

**S4 — Parental Awareness:**
- `male_parents_live_together` → show only if `male_parents_married === true`
- `male_parents_marriage_condition` → show only if `male_parents_married === false`
- `male_deceased_parent_alive` → show only if `male_parents_marriage_condition === 'Deceased'`
- `male_guardian_relationship` → show only if `male_grew_up_with_both_parents === false`
- Same pattern for female

**S6 — Personal History:**
- `male_marriage_type`, `male_prev_marriage_status` → show only if `male_been_married === true`
- `male_has_divorce_docs` → show only if `male_prev_marriage_status === 'Divorced'`
- `male_divorce_docs_url` (upload) → show only if `male_has_divorce_docs === true`
- `male_children_details` → show only if `male_has_children === true`
- Same pattern for female

### 5. File Uploads
Use Supabase Storage. Bucket structure:
```
flms-uploads/
  {sessionId}/
    male-passport.jpg
    female-passport.jpg
    payment-screenshot.jpg
    male-medical-1.pdf
    female-medical-1.pdf
    male-divorce-docs.pdf
    male-signature.png
    female-signature.png
```
- Upload on file select (not on form submit) — show upload progress
- Store the returned public URL in the registrations row
- Accept: images (jpg, png, webp) and PDFs
- Max file size: 10MB per file

### 6. Signatures (S8)
- Use `react-signature-canvas` for each partner
- On section save, export canvas as PNG blob → upload to Supabase Storage → store URL
- Show "Clear" button to redo signature
- Both signatures required before proceeding to Review

### 7. Review Screen
- Show all filled data grouped by section
- Each section has an "Edit" button that navigates back to that section
- "Submit Registration" button at the bottom
- Button disabled until both signatures are present

### 8. On Final Submit
Execute in this order:
```javascript
async function handleFinalSubmit(sessionId, registrationId) {
  // 1. Mark session as submitted
  await supabase
    .from('sessions')
    .update({ status: 'submitted' })
    .eq('id', sessionId)

  // 2. Set submitted_at on registration
  await supabase
    .from('registrations')
    .update({ submitted_at: new Date().toISOString() })
    .eq('session_id', sessionId)

  // 3. Generate pastor recommendation tokens
  const maleToken = generateToken()   // crypto.randomUUID() or nanoid
  const femaleToken = generateToken()

  const malePastorPhone = registration.male_pastor_phone
  const femalePastorPhone = registration.female_pastor_phone
  const sameP = malePastorPhone === femalePastorPhone

  // 4. Insert pastor_recommendations rows
  await supabase.from('pastor_recommendations').insert([
    {
      registration_id: registrationId,
      token: maleToken,
      partner: 'male',
      pastor_name: registration.male_pastor_name,
      pastor_phone: malePastorPhone,
      pastor_email: registration.male_pastor_email,
    },
    // Only insert female row if different pastor
    ...(!sameP ? [{
      registration_id: registrationId,
      token: femaleToken,
      partner: 'female',
      pastor_name: registration.female_pastor_name,
      pastor_phone: femalePastorPhone,
      pastor_email: registration.female_pastor_email,
    }] : [])
  ])

  // 5. Send pastor notifications (both fire simultaneously)
  const baseUrl = import.meta.env.VITE_APP_URL
  const coupleName = `${registration.male_name} & ${registration.female_name}`

  await Promise.all([
    sendArkeselMessage({
      to: malePastorPhone,
      message: `Dear ${registration.male_pastor_name}, ${coupleName} have registered for premarital counselling at First Love Marriage School and listed you as a recommending pastor. Please complete your pastoral recommendation here: ${baseUrl}/pastor/${maleToken}`
    }),
    ...(!sameP ? [sendArkeselMessage({
      to: femalePastorPhone,
      message: `Dear ${registration.female_pastor_name}, ${coupleName} have registered for premarital counselling at First Love Marriage School and listed you as a recommending pastor. Please complete your pastoral recommendation here: ${baseUrl}/pastor/${femaleToken}`
    })] : [])
  ])

  // 6. Send couple confirmation
  await Promise.all([
    sendArkeselMessage({
      to: registration.male_phone,
      message: `Hi ${registration.male_name}, your registration with First Love Marriage School is complete! Your pastors have been notified. A counsellor will be assigned once their recommendations are received.`
    }),
    sendArkeselMessage({
      to: registration.female_phone,
      message: `Hi ${registration.female_name}, your registration with First Love Marriage School is complete! Your pastors have been notified. A counsellor will be assigned once their recommendations are received.`
    })
  ])

  // 7. Sync to Google Sheets
  await syncToGoogleSheets(registrationId)
}
```

### 9. Arkesel Helper (`src/lib/arkesel.js`)
```javascript
export async function sendArkeselMessage({ to, message }) {
  // Normalise Ghanaian numbers: strip leading 0, add +233
  const normalised = to.startsWith('0')
    ? '+233' + to.slice(1)
    : to.startsWith('233')
    ? '+' + to
    : to

  const res = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
    method: 'POST',
    headers: {
      'api-key': import.meta.env.ARKESEL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: 'FLMS',
      message,
      recipients: [normalised]
    })
  })
  return res.json()
}
```
> Note: Arkesel also supports WhatsApp Business API. If the church sets up a WhatsApp Business number, swap the endpoint to their WhatsApp send API. The message content and number normalisation stay the same.

### 10. Session Persistence Hook (`src/hooks/useFormSession.js`)
```javascript
// Saves form state to Supabase on every section completion
// Loads existing state on mount
// Tracks which sections are complete for the sidebar

export function useFormSession(sessionId) {
  const [formData, setFormData] = useState({})
  const [completedSections, setCompletedSections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load existing registration on mount
    loadSession(sessionId)
  }, [sessionId])

  async function loadSession(sessionId) {
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .eq('session_id', sessionId)
      .single()
    if (data) {
      setFormData(data)
      setCompletedSections(inferCompletedSections(data))
    }
    setLoading(false)
  }

  async function saveSection(sectionKey, sectionData) {
    const updated = { ...formData, ...sectionData }
    setFormData(updated)
    await supabase
      .from('registrations')
      .upsert({ session_id: sessionId, ...updated })
    setCompletedSections(prev => [...new Set([...prev, sectionKey])])
  }

  return { formData, completedSections, saveSection, loading }
}
```

### 11. 14-Day Session Expiry + Day-10 Reminder
Run this as a **Supabase Edge Function** on a daily cron schedule:

```javascript
// supabase/functions/session-reminders/index.ts
// Schedule: every day at 8am GMT

const today = new Date()

// Find sessions expiring in 4 days (i.e. created 10 days ago) that haven't had reminder sent
const { data: toRemind } = await supabase
  .from('sessions')
  .select('*, registrations(*)')
  .eq('status', 'incomplete')
  .is('reminder_sent_at', null)
  .lt('expires_at', new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString())

for (const session of toRemind) {
  const reg = session.registrations[0]
  if (!reg) continue
  const resumeUrl = `${BASE_URL}/register/${session.id}`

  await Promise.all([
    reg.male_phone && sendArkeselMessage({
      to: reg.male_phone,
      message: `Hi ${reg.male_name}, your First Love Marriage School registration (code: ${session.session_code}) expires in 4 days. Resume here: ${resumeUrl}`
    }),
    reg.female_phone && sendArkeselMessage({
      to: reg.female_phone,
      message: `Hi ${reg.female_name}, your First Love Marriage School registration (code: ${session.session_code}) expires in 4 days. Resume here: ${resumeUrl}`
    })
  ])

  await supabase
    .from('sessions')
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq('id', session.id)
}

// Expire old incomplete sessions
await supabase
  .from('sessions')
  .update({ status: 'expired' })
  .eq('status', 'incomplete')
  .lt('expires_at', today.toISOString())
```

---

## Pastor Form (`/pastor/[token]`)

```
Page loads → look up pastor_recommendations by token
  → if not found: show "This link is invalid"
  → if expired: show "This recommendation link has expired. Please contact the couple."
  → if already submitted: show "You have already submitted your recommendation. Thank you."
  → if valid + pending: show the form

Form fields:
  - Pastor's name (pre-filled from registration, editable)
  - Pastor's church
  - Pastor's contact number (pre-filled, editable)
  - Do you know this couple personally? (Yes / No)
  - How long have you known them? (text)
  - Assessment of their readiness for marriage (textarea)
  - Are both partners committed believers? (Yes / No / One of them)
  - Do you have any concerns or red flags? (textarea, optional)
  - I recommend this couple for premarital counselling (checkbox, required)

On submit:
  - Save responses to pastor_recommendations row
  - Update status to 'submitted', set submitted_at
  - Trigger Google Sheets update (add pastor response to couple's row)
  - Show thank you screen
```

---

## Admin Dashboard (`/admin`)

### Login
- Simple email + bcrypt password check against `admin_users` table
- Store session in localStorage (or use Supabase Auth for admins)
- All dashboard routes redirect to login if not authenticated

### Dashboard — Couples List
Show a table with one row per submitted registration:

| Couple | Submitted | Male Pastor | Female Pastor | Payment | Actions |
|---|---|---|---|---|---|
| Kofi & Ama | 15 Apr 2026 | ✓ Received | ⏳ Pending | ✓ Verified | View |

- Filter by: All / Pastor pending / Payment unverified / This month
- Search by couple name
- Export to CSV button

### Couple Detail View
- All form data displayed in readable sections
- Payment screenshot shown inline with "Mark as verified" toggle
- Pastor recommendation status for each pastor
  - If submitted: show full recommendation text
  - If pending: show "Awaiting response" + "Resend notification" button
- Download all uploaded files as a ZIP (nice to have)

### Google Sheets Sync
Each submitted registration creates one row in the sheet with columns matching all registration fields. Pastor recommendation columns update when pastors submit. Use the Google Sheets API v4 with a service account.

```javascript
// src/lib/sheets.js
import { google } from 'googleapis'

export async function syncToGoogleSheets(registrationId) {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  )
  const sheets = google.sheets({ version: 'v4', auth })
  const reg = await getRegistrationById(registrationId)

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: 'Sheet1!A1',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[
        reg.submitted_at,
        reg.male_name, reg.male_email, reg.male_phone,
        reg.female_name, reg.female_email, reg.female_phone,
        reg.male_pastor_name, reg.male_pastor_phone,
        reg.female_pastor_name, reg.female_pastor_phone,
        reg.payment_verified ? 'Yes' : 'No',
        // ... all other fields
      ]]
    }
  })
}
```

---

## UI / UX Guidelines

### Tone & Voice
This form is a **premarital counselling exercise**, not just data collection. The copy should feel warm, pastoral, and intentional — not clinical or bureaucratic.

- Section intros should explain *why* the section matters
- Sensitive sections (S6 personal history) use calm, non-judgmental language
- S2 (personality) should include a note encouraging the couple to take the tests together and discuss before filling in their answers
- Error messages should be encouraging, not harsh ("Please add your date of birth" not "Date of birth is required")

### Layout
- Mobile-first (most users in Ghana will be on phones)
- Single column on mobile
- Progress indicator always visible (top bar on mobile, left sidebar on desktop)
- Each section fits on one screen where possible — avoid very long scrolling sections
- Male fields use a subtle blue-tinted background card
- Female fields use a subtle rose-tinted background card
- Shared intro text and section headers are full-width neutral

### Accessibility
- All inputs have visible labels (no placeholder-only labels)
- Sufficient colour contrast
- File upload areas are large tap targets
- Date pickers use native `<input type="date">` for mobile compatibility

### Fonts (suggested)
- Headings: Cormorant Garamond (serif, elegant, appropriate for a marriage programme)
- Body: DM Sans (clean, readable on mobile)

### Colour Palette
```css
--cream: #FAF7F2;
--gold: #B8955A;
--deep: #1C1612;
--male-bg: #EDF4F9;
--male-accent: #4A7FA0;
--female-bg: #F9EDF4;
--female-accent: #A04A7F;
--success: #2A6B4A;
--error: #9B3A2A;
```

---

## Build Order (recommended)

Work in this sequence so each piece is testable before the next:

1. **Supabase setup** — create project, run migration SQL, create storage bucket, add RLS policies
2. **Landing page** — start new / resume with code
3. **Form shell** — sidebar progress, section routing, useFormSession hook
4. **S1 Personal Details** — including file uploads for passport photos and payment screenshot
5. **S2–S5** — straightforward sections
6. **S6 Personal History** — conditional logic, divorce doc uploads
7. **S7 Medical** — optional multi-file upload
8. **S8 Declaration** — signature canvas, both required
9. **Review screen**
10. **Submit logic** — pastor token generation, Arkesel notifications, confirmation screen
11. **Pastor form** — token validation, form, thank you screen
12. **Admin login + dashboard**
13. **Google Sheets sync**
14. **Supabase Edge Function** — session expiry + day-10 reminder cron
15. **Deploy to Vercel**

---

## Key Business Rules (do not miss these)

- A couple's session expires **14 days** after creation
- A day-10 reminder WhatsApp/SMS is sent to **both partners** if the session is still incomplete
- Pastor notification links expire after **30 days**
- If both partners share the same pastor phone number, send only **one** notification (not two)
- Both pastor notifications fire **simultaneously** (use `Promise.all`)
- Couple confirmation messages fire **simultaneously** to both partners (use `Promise.all`)
- Admin can mark payment as verified — this does not affect the registration flow, it's just a flag
- The admin dashboard shows all registrations including incomplete ones (so staff can follow up)
- Google Sheets sync happens on: (a) couple final submission, (b) each pastor submission
- Signatures must be captured for **both** partners before the form can be submitted
- Medical uploads are **optional** — the form can be submitted without them

---

## Arkesel Quick Reference

- Docs: https://developers.arkesel.com
- SMS endpoint: `POST https://sms.arkesel.com/api/v2/sms/send`
- WhatsApp endpoint: check Arkesel dashboard for WhatsApp Business API URL
- Auth: `api-key` header
- Ghana numbers: normalise to `+233XXXXXXXXX` format before sending
- Sender ID `FLMS` must be registered with Arkesel before use

---

## Supabase Storage — RLS Policies

```sql
-- Allow anyone to upload to their own session folder
CREATE POLICY "Session upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'flms-uploads');

-- Only authenticated admins can read all files
CREATE POLICY "Admin read"
ON storage.objects FOR SELECT
USING (auth.role() = 'authenticated');

-- Public read for passport photos (used in admin dashboard previews)
CREATE POLICY "Public passport read"
ON storage.objects FOR SELECT
USING (bucket_id = 'flms-uploads' AND name LIKE '%passport%');
```

---

*End of prompt. Paste this into Copilot Chat and begin with: "Start with step 1 — Supabase setup. Generate the migration SQL and storage bucket configuration."*
