import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function ConfirmationScreen({ sessionId }) {
  const navigate = useNavigate()
  const [sessionCode, setSessionCode] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessionCode()
  }, [sessionId])

  async function fetchSessionCode() {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('session_code')
        .eq('id', sessionId)
        .single()

      if (error) throw error
      setSessionCode(data.session_code)
    } catch (err) {
      console.error('Error fetching session code:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-cream flex items-center justify-center p-4'>
        <div className='spinner h-8 w-8 border-4 border-gold border-t-transparent rounded-full'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-cream flex items-center justify-center p-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
        <div className='text-5xl mb-4'>✓</div>
        <h1 className='text-3xl font-serif font-bold mb-2 text-success'>
          Registration Submitted!
        </h1>

        <p className='text-gray-600 mb-6'>
          Thank you for registering with First Love Marriage School. Your
          submission has been successfully received.
        </p>

        <div className='bg-gold/10 border border-gold rounded-lg p-4 mb-6'>
          <p className='text-sm text-gray-700 mb-2'>
            <strong>Your Session Code:</strong>
          </p>
          <p className='text-2xl font-mono font-bold text-gold mb-3'>
            {sessionCode}
          </p>
          <p className='text-xs text-gray-600'>
            Save this code for your records. You'll need it if you want to
            access your submission.
          </p>
        </div>

        <div className='space-y-4 mb-6'>
          <div>
            <h3 className='font-semibold mb-2'>What happens next?</h3>
            <ul className='text-sm text-gray-600 space-y-2 text-left'>
              <li>
                ✓ Your pastors will receive notification and can submit their
                recommendations
              </li>
              <li>✓ Our team will review your information and payment</li>
              <li>
                ✓ You'll be assigned a counsellor once all recommendations are
                received
              </li>
              <li>✓ We'll contact you via WhatsApp with next steps</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className='btn btn-primary w-full'
        >
          Return to Home
        </button>

        <p className='text-xs text-gray-500 mt-4'>
          Questions? Contact your church administrator.
        </p>
      </div>
    </div>
  )
}
