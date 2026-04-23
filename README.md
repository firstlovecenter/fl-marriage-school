# First Love Marriage School (FLMS) Registration System

A full-stack web application for premarital counselling registration, pastoral recommendations, and admin management.

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at https://app.supabase.com
2. Copy your project URL and anonymous key
3. In the Supabase dashboard, go to **SQL Editor** and run the migration:

   ```sql
   -- Copy the contents of supabase/migrations/001_initial_schema.sql
   ```

4. Create a storage bucket called `flms-uploads`:
   - Go to **Storage** → **New Bucket**
   - Name: `flms-uploads`
   - Set as Public

5. Set up Row Level Security (RLS) policies on the storage bucket:
   - Go to Storage → Policies
   - Allow public reads for files
   - Allow authenticated uploads

### 2. Google Sheets Setup (Optional)

1. Create a new Google Sheets document for data sync
2. Set up a Google Service Account:
   - Go to https://console.cloud.google.com
   - Create a new service account
   - Generate a JSON key file
   - Share the spreadsheet with the service account email

3. Add the following columns to your spreadsheet:
   - Submission Date
   - Male Name, Email, Phone
   - Female Name, Email, Phone
   - Male Pastor (name, phone), Female Pastor (name, phone)
   - Payment Verified
   - Status
   - [All other registration fields...]

### 3. MNotify SMS Setup

1. Sign up for MNotify: https://mnotify.com
2. Get your API key from the dashboard
3. Register your sender ID "FLMS" (or custom)

### 4. SMTP Email Setup (Optional but Recommended)

1. Use your SMTP provider details (e.g., Google Workspace/Gmail SMTP)
2. Set SMTP environment variables in Vercel/local env:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`
3. The app will send pastor recommendation links and start-notification emails via `/api/notifications/email`

### 5. Local Development

```bash
# Install dependencies
npm install

# Create .env.local with your credentials
cp .env.local.example .env.local

# Add your credentials:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY)
# - VITE_MNOTIFY_API_KEY
# - VITE_MNOTIFY_SENDER_ID
# - SMTP_HOST / SMTP_USER / SMTP_PASS (for email notifications)
# - GOOGLE_SHEETS_SPREADSHEET_ID (optional)
# - etc.

# Start dev server
npm run dev
```

The app will open at http://localhost:5173

### 6. Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# During deployment, add your environment variables
```

Or connect your GitHub repo to Vercel dashboard for automatic deployments.

## Project Structure

```
src/
├── components/
│   ├── form/
│   │   ├── FormShell.jsx          # Main form container
│   │   ├── sections/              # 8 form sections
│   │   ├── ReviewScreen.jsx
│   │   └── ConfirmationScreen.jsx
│   ├── pastor/
│   │   └── PastorForm.jsx
│   └── admin/
│       ├── AdminLogin.jsx
│       ├── AdminDashboard.jsx
│       └── CoupleDetail.jsx
├── lib/
│   ├── supabase.js               # Supabase client
│   ├── mnotify.js                # SMS notifications
│   ├── emailNotifications.js     # Email notification client helper
│   ├── sheets.js                 # Google Sheets sync
│   └── session.js                # Session management
├── hooks/
│   └── useFormSession.js          # Form state hook
├── pages/
│   ├── index.jsx                 # Landing
│   ├── register/
│   ├── pastor/
│   └── admin/
└── styles/
    └── global.css

supabase/
└── migrations/
    └── 001_initial_schema.sql
```

## Key Features

- ✅ 8-section couple registration form
- ✅ Auto-save and session resumption
- ✅ File uploads (photos, documents)
- ✅ Signature capture (canvas-based)
- ✅ Pastoral recommendation links (token-based)
- ✅ SMS notifications (MNotify)
- ✅ Email notifications (SMTP via Vercel serverless route)
- ✅ Admin dashboard with couple management
- ✅ Google Sheets sync
- ✅ 14-day session expiry with day-10 reminders
- ✅ Payment verification tracking
- ✅ Mobile-friendly UI

## Build Order

This project follows a specific build order for development:

1. Supabase setup & database schema
2. Landing page (start new / resume session)
3. Form shell & useFormSession hook
4. Sections 1-5 (Personal, Personality, Education, Parental, Church)
5. Section 6 (Personal History with conditionals)
6. Sections 7-8 (Medical uploads & Signature declaration)
7. Review screen & final submit logic
8. Pastor form & token validation
9. Admin login & dashboard
10. Google Sheets sync
11. Session expiry cron job (Supabase Edge Function)
12. Production deployment

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Notifications**: MNotify API (SMS) + SMTP (Email)
- **Data Sync**: Google Sheets API v4
- **Signatures**: react-signature-canvas
- **Deployment**: Vercel

## Color Palette

```
Primary: Gold (#B8955A)
Secondary: Deep (#1C1612)
Background: Cream (#FAF7F2)
Male Partner: Blue-tinted (#EDF4F9)
Female Partner: Rose-tinted (#F9EDF4)
Success: Green (#2A6B4A)
Error: Red (#9B3A2A)
```

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
# Optional fallback:
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
VITE_APP_URL=http://localhost:5173

# MNotify
VITE_MNOTIFY_API_KEY=
VITE_MNOTIFY_SENDER_ID=FLMS

# SMTP (for /api/notifications/email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=

# Admin
VITE_ADMIN_PASSWORD_HASH=
```

## Testing

Test data for development:

**Sample couple registration:**

- Male: Kofi Mensah (kofi@example.com, +233541234567)
- Female: Ama Adjei (ama@example.com, +233551234567)

**Sample pastor:**

- Name: Rev. Samuel Owusu
- Phone: +233541111111

## Business Rules

- Sessions expire after **14 days**
- Day-10 reminder sent to both partners if incomplete
- Pastor links expire after **30 days**
- Both partners' signatures required before submission
- Medical uploads are optional
- Payment verification is manual (admin task)
- Google Sheets updates on couple submission and pastor submission

## Support & Documentation

- Arkesel API: https://developers.arkesel.com
- Supabase Docs: https://supabase.com/docs
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com

## License

Internal use only - First Love Marriage School

---

**Last Updated**: April 2026
**Version**: 1.0.0
