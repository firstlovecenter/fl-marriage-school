import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { inferCompletedSections } from '../lib/session'

/**
 * useFormSession Hook
 * Manages form state, auto-save, and session persistence
 */
export function useFormSession(sessionId) {
  const [formData, setFormData] = useState({})
  const [completedSections, setCompletedSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [registrationId, setRegistrationId] = useState(null)
  const isInitializingRef = useRef(false)
  const initializedSessionIdRef = useRef(null)

  // Load existing registration on mount
  useEffect(() => {
    if (!sessionId) return
    if (initializedSessionIdRef.current === sessionId) return
    loadSession(sessionId)
  }, [sessionId])

  async function loadSession(sessionId) {
    if (isInitializingRef.current) return

    try {
      isInitializingRef.current = true
      setLoading(true)
      setSaveError('')

      // Get latest registration for this session (handles legacy duplicate rows safely)
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (regError) {
        throw regError
      }

      const registration = registrations?.[0] || null

      if (registration) {
        setFormData(registration)
        setRegistrationId(registration.id)
        // Infer which sections are complete
        const completed = inferCompletedSections(registration)
        setCompletedSections(completed)
      } else {
        // Create or reuse registration safely (requires unique index on session_id)
        const { data: newReg, error: createError } = await supabase
          .from('registrations')
          .upsert([{ session_id: sessionId }], { onConflict: 'session_id' })
          .select()
          .single()

        if (createError) throw createError
        setFormData(newReg)
        setRegistrationId(newReg.id)
        setCompletedSections([])
      }

      initializedSessionIdRef.current = sessionId
    } catch (err) {
      console.error('Error loading session:', err)
      setSaveError('Failed to load your registration data')
    } finally {
      isInitializingRef.current = false
      setLoading(false)
    }
  }

  /**
   * Update a single field (for auto-save on blur)
   * Debounced via parent component
   */
  async function updateField(fieldName, value) {
    if (!registrationId) return

    try {
      setIsSaving(true)
      setSaveError('')

      // Update local state immediately for responsiveness
      setFormData((prev) => ({ ...prev, [fieldName]: value }))

      // Save to Supabase
      const { error } = await supabase
        .from('registrations')
        .update({ [fieldName]: value, updated_at: new Date().toISOString() })
        .eq('id', registrationId)

      if (error) throw error
    } catch (err) {
      console.error('Error saving field:', err)
      setSaveError(`Failed to save ${fieldName}`)
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Save entire section and mark as complete
   */
  async function saveSection(sectionNumber, sectionData) {
    if (!registrationId) return

    try {
      setIsSaving(true)
      setSaveError('')

      // Update local state
      const updated = { ...formData, ...sectionData }
      setFormData(updated)

      // Save to Supabase
      const { error } = await supabase
        .from('registrations')
        .update({ ...sectionData, updated_at: new Date().toISOString() })
        .eq('id', registrationId)

      if (error) throw error

      // Update completed sections
      setCompletedSections((prev) => {
        const newCompleted = new Set(prev)
        newCompleted.add(sectionNumber)
        return Array.from(newCompleted).sort((a, b) => a - b)
      })

      return true
    } catch (err) {
      console.error('Error saving section:', err)
      setSaveError(`Failed to save section ${sectionNumber}`)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Update multiple fields at once
   */
  async function updateFields(fields) {
    if (!registrationId) return

    try {
      setIsSaving(true)
      setSaveError('')

      // Update local state
      setFormData((prev) => ({ ...prev, ...fields }))

      // Save to Supabase
      const { error } = await supabase
        .from('registrations')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', registrationId)

      if (error) throw error
      return true
    } catch (err) {
      console.error('Error saving fields:', err)
      setSaveError('Failed to save data')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Get a specific field value
   */
  function getField(fieldName) {
    return formData[fieldName]
  }

  /**
   * Check if a section is complete
   */
  function isSectionComplete(sectionNumber) {
    return completedSections.includes(sectionNumber)
  }

  return {
    formData,
    registrationId,
    completedSections,
    loading,
    isSaving,
    saveError,
    updateField,
    updateFields,
    saveSection,
    getField,
    isSectionComplete,
    setSaveError, // Allow components to clear error messages
  }
}
