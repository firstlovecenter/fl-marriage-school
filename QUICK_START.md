# FLMS Quick Start Guide

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

The app will open at `http://localhost:5173`

---

## 🔐 Environment Setup

1. **Create Supabase Project**:
   - Go to https://app.supabase.com
   - Create new project
   - Copy `Project URL` and `Anon Key`

2. **Run Database Migration**:
   - Open SQL Editor in Supabase
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run

3. **Create Storage Bucket**:
   - Go to Storage in Supabase
   - Create bucket named `flms-uploads`
   - Set as Public

4. **Configure `.env.local`**:

   ```env
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   VITE_APP_URL=http://localhost:5173
   VITE_ARKESEL_API_KEY=your_key
   VITE_ARKESEL_SENDER_ID=FLMS
   ```

5. **(Optional) Arkesel Setup**:
   - Sign up at https://dashboard.arkesel.com
   - Get API key
   - Register "FLMS" as Sender ID

---

## 🧪 Testing the Form

1. **Start at home page**: http://localhost:5173
2. **Click "Start New Registration"**
3. **Fill out all 8 sections**:
   - Section 1: Personal details (upload passport photos)
   - Section 2: Personality
   - Section 3: Education
   - Section 4: Family background
   - Section 5: Church info
   - Section 6: Marriage history
   - Section 7: Medical (optional)
   - Section 8: Sign declaration
4. **Review** all information
5. **Submit** (not fully implemented yet)

---

## 📋 Form Features Checklist

### ✅ Implemented

- 8-section form shell
- Session creation & resumption
- Form validation
- Auto-save on blur
- File uploads (Supabase Storage)
- Conditional field visibility
- Signature capture (canvas)
- Progress tracking
- Responsive mobile design
- Landing page

### ⏳ Next to Build

- Review screen with summaries
- Final submit (pastor notifications, etc.)
- Pastor recommendation form
- Admin dashboard
- Google Sheets sync
- Session reminder cron job

---

## 🗂️ File Structure Reference

```
src/
├── pages/                  # Route pages
├── components/form/        # Form components (8 sections)
├── lib/                    # Utilities (supabase, arkesel, etc.)
├── hooks/                  # useFormSession hook
└── styles/                 # Global CSS
```

---

## 🔗 API Integrations

### Supabase

- **DB**: PostgreSQL (8 tables)
- **Storage**: File uploads to `flms-uploads` bucket
- **Usage**: In `src/lib/supabase.js`

### Arkesel (SMS/WhatsApp)

- **Endpoint**: https://sms.arkesel.com/api/v2/sms/send
- **Usage**: `src/lib/arkesel.js` (ready to use)
- **Status**: Helper created, not called yet

### Google Sheets

- **API**: Google Sheets API v4
- **Usage**: `src/lib/sheets.js` (ready to use)
- **Status**: Helper created, not called yet

---

## 🎨 Custom Colors

```css
--cream: #faf7f2 /* Main background */ --gold: #b8955a /* Primary accent */
  --deep: #1c1612 /* Text color */ --male-bg: #edf4f9 /* Groom section bg */
  --male-accent: #4a7fa0 /* Groom accent */ --female-bg: #f9edf4
  /* Bride section bg */ --female-accent: #a04a7f /* Bride accent */
  --success: #2a6b4a --error: #9b3a2a;
```

---

## 🐛 Troubleshooting

**Form not saving?**

- Check Supabase connection in console
- Verify .env.local has correct credentials
- Check Supabase RLS policies

**Files not uploading?**

- Verify `flms-uploads` bucket exists
- Check bucket is set to Public
- File size under 10MB?

**Signatures not working?**

- Check react-signature-canvas is installed
- Canvas width/height might need adjustment for mobile

**Mobile layout broken?**

- Form uses Tailwind's responsive classes
- Check browser zoom is 100%
- Test in actual mobile device

---

## 📞 Next Phase Tasks

1. **Implement Review Screen**
   - Show all 8 sections with data summaries
   - Edit buttons for each section
   - Submit button (requires all signatures)

2. **Implement Final Submit**
   - Generate pastor tokens
   - Send Arkesel notifications
   - Call Google Sheets sync
   - Show confirmation

3. **Build Pastor Form**
   - Token validation
   - Recommendation form
   - Response submission

4. **Build Admin Dashboard**
   - Login page
   - Couples table
   - Detail view
   - Payment verification
   - CSV export

---

## 🚀 Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables during deploy
```

Or connect GitHub repo to Vercel dashboard for auto-deployments.

---

## 📚 Resources

- **React Router**: https://reactrouter.com
- **Tailwind CSS**: https://tailwindcss.com
- **Supabase**: https://supabase.com/docs
- **Vite**: https://vitejs.dev
- **Arkesel API**: https://developers.arkesel.com

---

## ✨ Pro Tips

1. Use Supabase Studio to view/edit data in real-time
2. Check browser console for Supabase errors
3. Test uploads by checking Storage bucket in Supabase
4. Use Tailwind's responsive prefixes: `md:`, `lg:`, `sm:`
5. Mobile first: design for small screens, then add desktop

---

**Last Updated**: April 21, 2026  
**Status**: 54% Complete (7/13 tasks)
