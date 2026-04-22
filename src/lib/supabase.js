import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the workspace .env.local file, then restart the Vite dev server.',
  )
}

if (
  !isValidHttpUrl(supabaseUrl) ||
  supabaseUrl.includes('your_supabase_project_url')
) {
  throw new Error(
    `Invalid VITE_SUPABASE_URL: "${supabaseUrl}". Use your real Supabase project URL (https://<project-ref>.supabase.co) in .env.local, then restart the Vite dev server.`,
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to get current session from localStorage
export function getStoredSessionId() {
  return localStorage.getItem('flms_session_id')
}

export function setStoredSessionId(sessionId) {
  localStorage.setItem('flms_session_id', sessionId)
}

export function clearStoredSessionId() {
  localStorage.removeItem('flms_session_id')
}
