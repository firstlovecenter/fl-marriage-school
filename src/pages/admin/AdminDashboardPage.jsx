import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { clearAdminSession, getAdminSession } from '../../lib/adminAuth'
import CoupleDetail from '../../components/admin/CoupleDetail'

function formatDate(value) {
  if (!value) return 'Not submitted'
  return format(new Date(value), 'dd MMM yyyy')
}

function exportRegistrationsToCsv(rows) {
  const header = [
    'Couple',
    'Session Code',
    'Status',
    'Submitted',
    'Male Pastor',
    'Female Pastor',
    'Payment Verified',
  ]

  const csvRows = rows.map((row) => [
    `${row.male_name || 'Groom'} & ${row.female_name || 'Bride'}`,
    row.session_code || '',
    row.session_status || '',
    row.submitted_at || '',
    row.male_pastor_name || '',
    row.female_pastor_name || '',
    row.payment_verified ? 'Yes' : 'No',
  ])

  const content = [header, ...csvRows]
    .map((cells) =>
      cells.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','),
    )
    .join('\n')

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'flms-registrations.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const adminSession = getAdminSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [registrations, setRegistrations] = useState([])
  const [selectedRegistration, setSelectedRegistration] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    setError('')

    const { data: registrationsData, error: registrationsError } =
      await supabase
        .from('registrations')
        .select('*, sessions(session_code,status)')
        .order('created_at', { ascending: false })

    if (registrationsError) {
      setLoading(false)
      setError(registrationsError.message)
      return
    }

    const registrationIds = registrationsData.map(
      (registration) => registration.id,
    )
    let recommendations = []

    if (registrationIds.length) {
      const { data: recommendationsData, error: recommendationsError } =
        await supabase
          .from('pastor_recommendations')
          .select('*')
          .in('registration_id', registrationIds)

      if (recommendationsError) {
        setLoading(false)
        setError(recommendationsError.message)
        return
      }

      recommendations = recommendationsData
    }

    const merged = registrationsData.map((registration) => ({
      ...registration,
      session_code: registration.sessions?.session_code,
      session_status: registration.sessions?.status,
      pastor_recommendations: recommendations.filter(
        (recommendation) => recommendation.registration_id === registration.id,
      ),
    }))

    setRegistrations(merged)
    setLoading(false)
  }

  async function togglePaymentVerified(registrationId, value) {
    const { error: updateError } = await supabase
      .from('registrations')
      .update({ payment_verified: value })
      .eq('id', registrationId)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setRegistrations((current) =>
      current.map((registration) =>
        registration.id === registrationId
          ? { ...registration, payment_verified: value }
          : registration,
      ),
    )

    setSelectedRegistration((current) =>
      current?.id === registrationId
        ? { ...current, payment_verified: value }
        : current,
    )
  }

  function logout() {
    clearAdminSession()
    navigate('/admin', { replace: true })
  }

  const filteredRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase()

    return registrations.filter((registration) => {
      const coupleName =
        `${registration.male_name || ''} ${registration.female_name || ''}`.toLowerCase()
      const matchesSearch =
        !query ||
        coupleName.includes(query) ||
        (registration.session_code || '').toLowerCase().includes(query)

      const pendingPastor = registration.pastor_recommendations.some(
        (recommendation) => recommendation.status === 'pending',
      )
      const submittedThisMonth = registration.submitted_at
        ? new Date(registration.submitted_at).getMonth() ===
            new Date().getMonth() &&
          new Date(registration.submitted_at).getFullYear() ===
            new Date().getFullYear()
        : false

      const matchesFilter =
        filter === 'all' ||
        (filter === 'pastor-pending' && pendingPastor) ||
        (filter === 'payment-unverified' && !registration.payment_verified) ||
        (filter === 'this-month' && submittedThisMonth)

      return matchesSearch && matchesFilter
    })
  }, [filter, registrations, search])

  if (loading) {
    return (
      <div className='min-h-screen bg-cream flex items-center justify-center'>
        <div className='text-center'>
          <div className='spinner mb-4 h-8 w-8 border-4 border-gold border-t-transparent rounded-full mx-auto'></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-cream p-4 md:p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <h1 className='text-4xl font-serif font-bold'>Admin Dashboard</h1>
            <p className='text-gray-600'>
              Signed in as {adminSession?.email || 'admin'}
            </p>
          </div>
          <div className='flex gap-2'>
            <button
              onClick={() => exportRegistrationsToCsv(filteredRegistrations)}
              className='btn btn-secondary'
            >
              Export CSV
            </button>
            <button onClick={logout} className='btn btn-primary'>
              Sign Out
            </button>
          </div>
        </div>

        {error && (
          <div className='rounded-lg border border-error bg-error/10 p-4 text-error'>
            {error}
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          <input
            type='text'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Search by couple name or session code'
          />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value='all'>All registrations</option>
            <option value='pastor-pending'>Pastor pending</option>
            <option value='payment-unverified'>Payment unverified</option>
            <option value='this-month'>This month</option>
          </select>
          <button onClick={loadDashboard} className='btn btn-secondary'>
            Refresh Data
          </button>
        </div>

        <div className='overflow-x-auto rounded-xl bg-white shadow-sm'>
          <table className='min-w-full text-sm'>
            <thead className='border-b border-gray-200 bg-gray-50 text-left text-gray-600'>
              <tr>
                <th className='px-4 py-3'>Couple</th>
                <th className='px-4 py-3'>Submitted</th>
                <th className='px-4 py-3'>Male Pastor</th>
                <th className='px-4 py-3'>Female Pastor</th>
                <th className='px-4 py-3'>Payment</th>
                <th className='px-4 py-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((registration) => {
                const maleRecommendation =
                  registration.pastor_recommendations.find(
                    (recommendation) => recommendation.partner === 'male',
                  )
                const femaleRecommendation =
                  registration.pastor_recommendations.find(
                    (recommendation) => recommendation.partner === 'female',
                  )

                return (
                  <tr
                    key={registration.id}
                    className='border-b border-gray-100'
                  >
                    <td className='px-4 py-3'>
                      <div className='font-semibold'>
                        {registration.male_name || 'Groom'} &{' '}
                        {registration.female_name || 'Bride'}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {registration.session_code ||
                          registration.session_status ||
                          'No session code'}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      {formatDate(registration.submitted_at)}
                    </td>
                    <td className='px-4 py-3'>
                      {maleRecommendation?.status === 'submitted'
                        ? 'Received'
                        : 'Pending'}
                    </td>
                    <td className='px-4 py-3'>
                      {femaleRecommendation?.status === 'submitted'
                        ? 'Received'
                        : 'Pending'}
                    </td>
                    <td className='px-4 py-3'>
                      {registration.payment_verified
                        ? 'Verified'
                        : 'Unverified'}
                    </td>
                    <td className='px-4 py-3'>
                      <button
                        onClick={() => setSelectedRegistration(registration)}
                        className='btn btn-secondary btn-sm'
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filteredRegistrations.length === 0 && (
                <tr>
                  <td
                    colSpan='6'
                    className='px-4 py-8 text-center text-gray-500'
                  >
                    No registrations match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CoupleDetail
        registration={selectedRegistration}
        onClose={() => setSelectedRegistration(null)}
        onTogglePaymentVerified={togglePaymentVerified}
      />
    </div>
  )
}
