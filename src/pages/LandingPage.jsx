import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createNewSession, resumeSessionByCode } from '../lib/session'
import { setStoredSessionId } from '../lib/supabase'

export default function LandingPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState(null) // 'new' or 'resume'
  const [sessionCode, setSessionCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleStartNew() {
    setLoading(true)
    setError('')

    try {
      const session = await createNewSession()
      setStoredSessionId(session.id)
      navigate(`/register/${session.id}`)
    } catch (err) {
      setError(err.message || 'Failed to start new registration')
      setLoading(false)
    }
  }

  async function handleResumeSession() {
    if (!sessionCode.trim()) {
      setError('Please enter your session code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const session = await resumeSessionByCode(sessionCode)
      setStoredSessionId(session.id)
      navigate(`/register/${session.id}`)
    } catch (err) {
      setError(err.message || 'Could not find session')
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-cream flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl md:text-5xl font-serif font-bold text-deep mb-3'>
            First Love Marriage School
          </h1>
          <p className='text-lg text-gray-600'>
            Premarital Counselling Registration
          </p>
        </div>

        {/* Main content */}
        {!mode ? (
          <div className='space-y-4'>
            {error && (
              <div className='bg-error/10 border border-error text-error rounded-lg p-4'>
                {error}
              </div>
            )}

            <button
              onClick={() => setMode('new')}
              className='btn btn-primary w-full text-lg py-4'
            >
              Start New Registration
            </button>

            <div className='relative py-4'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-cream text-gray-500'>or</span>
              </div>
            </div>

            <button
              onClick={() => setMode('resume')}
              className='btn btn-secondary w-full text-lg py-4'
            >
              Resume with Session Code
            </button>

            {/* Info section */}
            <div className='mt-8 pt-8 border-t border-gray-300 space-y-4'>
              <div>
                <h3 className='font-serif font-semibold mb-2'>
                  New Registration?
                </h3>
                <p className='text-sm text-gray-600'>
                  Click "Start New Registration" to begin. You'll receive a
                  reference code on-screen that you can use to resume later if
                  needed.
                </p>
              </div>

              <div>
                <h3 className='font-serif font-semibold mb-2'>Returning?</h3>
                <p className='text-sm text-gray-600'>
                  Enter your session code (format: FLMS-XXXX) to pick up where
                  you left off. Your data is saved for 14 days.
                </p>
              </div>

              <div className='bg-gold/10 border border-gold rounded-lg p-4 mt-4'>
                <p className='text-sm text-gray-700'>
                  <strong>Questions?</strong> Contact your church administrator
                  or pastoral team.
                </p>
              </div>
            </div>
          </div>
        ) : mode === 'new' ? (
          <div className='space-y-4'>
            {error && (
              <div className='bg-error/10 border border-error text-error rounded-lg p-4'>
                {error}
              </div>
            )}

            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h2 className='text-2xl font-serif font-semibold mb-4'>
                Start New Registration
              </h2>
              <p className='text-gray-600 mb-6'>
                You're about to begin the First Love Marriage School
                registration process. This will take about 30-40 minutes to
                complete.
              </p>

              <div className='space-y-3 mb-6 bg-blue-50 border border-blue-200 rounded p-4'>
                <h3 className='font-semibold text-deep'>What you'll need:</h3>
                <ul className='text-sm text-gray-700 space-y-1 list-disc list-inside'>
                  <li>Your passport photos (both partners)</li>
                  <li>Your pastor's contact information</li>
                  <li>Information about your parents and family</li>
                  <li>Details about your education and employment</li>
                  <li>Payment receipt screenshot</li>
                </ul>
              </div>

              <button
                onClick={handleStartNew}
                disabled={loading}
                className='btn btn-primary w-full mb-2'
              >
                {loading ? 'Starting...' : 'Begin Registration'}
              </button>

              <button
                onClick={() => {
                  setMode(null)
                  setError('')
                }}
                className='btn btn-secondary w-full'
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            {error && (
              <div className='bg-error/10 border border-error text-error rounded-lg p-4'>
                {error}
              </div>
            )}

            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h2 className='text-2xl font-serif font-semibold mb-4'>
                Resume Registration
              </h2>
              <p className='text-gray-600 mb-6'>
                Enter your session code to continue where you left off.
              </p>

              <label className='block text-sm font-semibold mb-2'>
                Session Code
              </label>
              <input
                type='text'
                placeholder='e.g., FLMS-A1B2'
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleResumeSession()}
                className='mb-6'
              />

              <p className='text-xs text-gray-500 mb-6 bg-gray-50 p-2 rounded'>
                Your reference code is shown throughout the registration flow
                and again after submission. It looks like: FLMS-XXXX
              </p>

              <button
                onClick={handleResumeSession}
                disabled={loading || !sessionCode.trim()}
                className='btn btn-primary w-full mb-2'
              >
                {loading ? 'Resuming...' : 'Resume Registration'}
              </button>

              <button
                onClick={() => {
                  setMode(null)
                  setError('')
                  setSessionCode('')
                }}
                className='btn btn-secondary w-full'
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
