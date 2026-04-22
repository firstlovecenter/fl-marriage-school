import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import bcrypt from 'bcryptjs'
import { supabase } from '../../lib/supabase'
import { isAdminAuthenticated, setAdminSession } from '../../lib/adminAuth'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('admin_users')
      .select('id, email, password_hash')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (fetchError || !data) {
      setLoading(false)
      setError('We could not find an admin account with that email.')
      return
    }

    const valid = await bcrypt.compare(password, data.password_hash)
    if (!valid) {
      setLoading(false)
      setError('The password you entered is incorrect.')
      return
    }

    setAdminSession({ id: data.id, email: data.email, loggedInAt: Date.now() })
    navigate('/admin/dashboard', { replace: true })
  }

  return (
    <div className='min-h-screen bg-cream flex items-center justify-center p-4'>
      <div className='max-w-md w-full rounded-xl bg-white p-8 shadow-sm'>
        <h1 className='text-4xl font-serif font-bold mb-2'>Admin Login</h1>
        <p className='text-gray-600 mb-6'>
          Sign in to review registrations, track pastor responses, and verify
          payments.
        </p>

        {error && (
          <div className='mb-4 rounded-lg border border-error bg-error/10 p-4 text-error'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <label>Email Address</label>
            <input
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className={`btn w-full ${loading ? 'bg-gray-300 text-gray-600' : 'btn-primary'}`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
