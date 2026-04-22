/**
 * Session management utilities
 * Handles creation, resumption, and expiry of registration sessions
 */

import { supabase } from './supabase'

/**
 * Generate a human-readable session code
 * Format: FLMS-XXXX (4 random uppercase alphanumeric characters)
 */
function generateSessionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `FLMS-${code}`
}

/**
 * Create a new registration session
 */
export async function createNewSession() {
  const sessionCode = generateSessionCode()

  const { data, error } = await supabase
    .from('sessions')
    .insert([
      {
        session_code: sessionCode,
        status: 'incomplete',
        expires_at: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`)
  }

  return data
}

/**
 * Resume an existing session by code
 */
export async function resumeSessionByCode(sessionCode) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('session_code', sessionCode.toUpperCase())
    .single()

  if (error) {
    throw new Error(`Session not found: ${sessionCode}`)
  }

  if (data.status === 'expired') {
    throw new Error(
      'This session has expired. Please start a new registration.',
    )
  }

  return data
}

/**
 * Get session by ID
 */
export async function getSessionById(sessionId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    throw new Error(`Session not found: ${error.message}`)
  }

  return data
}

/**
 * Get or create registration for a session
 */
export async function getOrCreateRegistration(sessionId) {
  // Try to get existing registration (latest, in case legacy duplicates exist)
  const { data: existingRows, error: existingError } = await supabase
    .from('registrations')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (existingError) {
    throw new Error(`Failed to get registration: ${existingError.message}`)
  }

  const existing = existingRows?.[0]

  if (existing) {
    return existing
  }

  // Create or reuse registration safely (requires unique index on session_id)
  const { data: newReg, error } = await supabase
    .from('registrations')
    .upsert([{ session_id: sessionId }], { onConflict: 'session_id' })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create registration: ${error.message}`)
  }

  return newReg
}

/**
 * Infer which sections are complete based on data
 * Returns array of section numbers (1-8)
 */
export function inferCompletedSections(registration) {
  const completed = []

  // S1: Personal Details
  if (registration.male_name && registration.female_name) {
    completed.push(1)
  }

  // S2: Personality
  if (registration.male_temperament && registration.female_temperament) {
    completed.push(2)
  }

  // S3: Education
  if (registration.male_occupation && registration.female_occupation) {
    completed.push(3)
  }

  // S4: Parental
  if (registration.male_father_name && registration.female_father_name) {
    completed.push(4)
  }

  // S5: Church
  if (registration.male_church_name && registration.female_church_name) {
    completed.push(5)
  }

  // S6: Personal History
  if (
    registration.male_been_married !== undefined &&
    registration.female_been_married !== undefined
  ) {
    completed.push(6)
  }

  // S7: Medical
  if (
    registration.male_medical_report_urls ||
    registration.female_medical_report_urls
  ) {
    completed.push(7)
  }

  // S8: Declaration
  if (registration.male_signature_url && registration.female_signature_url) {
    completed.push(8)
  }

  return completed
}

/**
 * Get the last completed section
 * Used to resume form at correct position
 */
export function getLastCompletedSection(completedSections) {
  if (completedSections.length === 0) return 1
  return Math.max(...completedSections)
}
