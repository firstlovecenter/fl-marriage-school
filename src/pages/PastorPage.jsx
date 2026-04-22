import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { updatePastorResponseInSheets } from '../lib/sheets'

const initialFormState = {
  pastor_name: '',
  pastor_church: '',
  pastor_contact_confirmed: '',
  knows_couple_personally: '',
  knows_couple_duration: '',
  readiness_assessment: '',
  both_believers: '',
  concerns: '',
  recommends_couple: false,
}

function StatusCard({ title, message }) {
  return (
    <div className='min-h-screen bg-cream flex items-center justify-center p-4'>
      <div className='max-w-xl w-full bg-white rounded-lg shadow-sm p-8 text-center'>
        <h1 className='text-3xl font-serif font-bold mb-3'>{title}</h1>
        <p className='text-gray-600'>{message}</p>
      </div>
    </div>
  )
}

export default function PastorPage() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [record, setRecord] = useState(null)
  const [done, setDone] = useState(false)
  const [formData, setFormData] = useState(initialFormState)

  useEffect(() => {
    if (!token) return
    loadRecommendation()
  }, [token])

  async function loadRecommendation() {
    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('pastor_recommendations')
      .select('*')
      .eq('token', token)
      .single()

    if (fetchError || !data) {
      setRecord({ state: 'invalid' })
      setLoading(false)
      return
    }

    const expired = new Date(data.expires_at) < new Date()
    if (expired && data.status !== 'submitted') {
      await supabase
        .from('pastor_recommendations')
        .update({ status: 'expired' })
        .eq('id', data.id)

      setRecord({ ...data, state: 'expired', status: 'expired' })
      setLoading(false)
      return
    }

    if (data.status === 'submitted') {
      setRecord({ ...data, state: 'submitted' })
      setLoading(false)
      return
    }

    setRecord({ ...data, state: 'pending' })
    setFormData({
      pastor_name: data.pastor_name || '',
      pastor_church: data.pastor_church || '',
      pastor_contact_confirmed:
        data.pastor_contact_confirmed || data.pastor_phone || '',
      knows_couple_personally:
        typeof data.knows_couple_personally === 'boolean'
          ? String(data.knows_couple_personally)
          : '',
      knows_couple_duration: data.knows_couple_duration || '',
      readiness_assessment: data.readiness_assessment || '',
      both_believers: data.both_believers || '',
      concerns: data.concerns || '',
      recommends_couple: Boolean(data.recommends_couple),
    })
    setLoading(false)
  }

  function updateField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!formData.pastor_name.trim()) {
      setError("Please add the pastor's name.")
      return
    }

    if (!formData.pastor_contact_confirmed.trim()) {
      setError('Please add the pastor contact number.')
      return
    }

    if (!formData.readiness_assessment.trim()) {
      setError('Please add your assessment of the couple.')
      return
    }

    if (!formData.both_believers) {
      setError('Please indicate whether both partners are believers.')
      return
    }

    if (!formData.recommends_couple) {
      setError('Please confirm that you recommend this couple for counselling.')
      return
    }

    setSubmitting(true)
    setError('')

    const payload = {
      pastor_name: formData.pastor_name.trim(),
      pastor_church: formData.pastor_church.trim(),
      pastor_contact_confirmed: formData.pastor_contact_confirmed.trim(),
      knows_couple_personally:
        formData.knows_couple_personally === ''
          ? null
          : formData.knows_couple_personally === 'true',
      knows_couple_duration: formData.knows_couple_duration.trim(),
      readiness_assessment: formData.readiness_assessment.trim(),
      both_believers: formData.both_believers,
      concerns: formData.concerns.trim(),
      recommends_couple: formData.recommends_couple,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from('pastor_recommendations')
      .update(payload)
      .eq('id', record.id)
      .eq('status', 'pending')

    if (updateError) {
      setSubmitting(false)
      setError(updateError.message || 'Unable to submit recommendation.')
      return
    }

    try {
      await updatePastorResponseInSheets(record.id)
    } catch (sheetError) {
      console.error('Pastor sheets sync failed:', sheetError)
    }

    setSubmitting(false)
    setDone(true)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-cream flex items-center justify-center'>
        <div className='text-center'>
          <div className='spinner mb-4 h-8 w-8 border-4 border-gold border-t-transparent rounded-full mx-auto'></div>
          <p>Loading recommendation link...</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <StatusCard
        title='Thank You'
        message='Your pastoral recommendation has been received successfully. The couple and church team can now continue the counselling process.'
      />
    )
  }

  if (record?.state === 'invalid') {
    return (
      <StatusCard
        title='Invalid Link'
        message='This recommendation link is invalid. Please confirm you used the full link that was sent to you.'
      />
    )
  }

  if (record?.state === 'expired') {
    return (
      <StatusCard
        title='Link Expired'
        message='This recommendation link has expired. Please contact the couple or the church office for a fresh recommendation request.'
      />
    )
  }

  if (record?.state === 'submitted') {
    return (
      <StatusCard
        title='Already Submitted'
        message='You have already submitted this recommendation. Thank you for taking the time to support this couple.'
      />
    )
  }

  return (
    <div className='min-h-screen bg-cream py-10 px-4'>
      <div className='max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6 md:p-8'>
        <h1 className='text-4xl font-serif font-bold mb-2'>
          Pastor Recommendation
        </h1>
        <p className='text-gray-600 mb-6'>
          Thank you for supporting this couple. Please complete the
          recommendation below with honesty and pastoral care.
        </p>

        {error && (
          <div className='mb-6 rounded-lg border border-error bg-error/10 p-4 text-error'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='form-grid-2'>
            <div>
              <label>Pastor's Name</label>
              <input
                type='text'
                value={formData.pastor_name}
                onChange={(event) =>
                  updateField('pastor_name', event.target.value)
                }
              />
            </div>
            <div>
              <label>Church</label>
              <input
                type='text'
                value={formData.pastor_church}
                onChange={(event) =>
                  updateField('pastor_church', event.target.value)
                }
              />
            </div>
          </div>

          <div className='form-grid-2'>
            <div>
              <label>Pastor Contact Number</label>
              <input
                type='tel'
                value={formData.pastor_contact_confirmed}
                onChange={(event) =>
                  updateField('pastor_contact_confirmed', event.target.value)
                }
              />
            </div>
            <div>
              <label>Do you know this couple personally?</label>
              <select
                value={formData.knows_couple_personally}
                onChange={(event) =>
                  updateField('knows_couple_personally', event.target.value)
                }
              >
                <option value=''>Select...</option>
                <option value='true'>Yes</option>
                <option value='false'>No</option>
              </select>
            </div>
          </div>

          <div>
            <label>How long have you known them?</label>
            <input
              type='text'
              value={formData.knows_couple_duration}
              onChange={(event) =>
                updateField('knows_couple_duration', event.target.value)
              }
              placeholder='For example: 3 years, since childhood, 8 months'
            />
          </div>

          <div>
            <label>Assessment of their readiness for marriage</label>
            <textarea
              value={formData.readiness_assessment}
              onChange={(event) =>
                updateField('readiness_assessment', event.target.value)
              }
              placeholder='Share your pastoral assessment of their maturity, relationship health, and readiness for counselling and marriage.'
            />
          </div>

          <div>
            <label>Are both partners committed believers?</label>
            <select
              value={formData.both_believers}
              onChange={(event) =>
                updateField('both_believers', event.target.value)
              }
            >
              <option value=''>Select...</option>
              <option value='Yes'>Yes</option>
              <option value='No'>No</option>
              <option value='One of them'>One of them</option>
            </select>
          </div>

          <div>
            <label>Do you have any concerns or red flags? (Optional)</label>
            <textarea
              value={formData.concerns}
              onChange={(event) => updateField('concerns', event.target.value)}
              placeholder='Share any pastoral concerns that should be considered during counselling.'
            />
          </div>

          <label className='flex items-start gap-3 cursor-pointer'>
            <input
              type='checkbox'
              checked={formData.recommends_couple}
              onChange={(event) =>
                updateField('recommends_couple', event.target.checked)
              }
              className='mt-1'
            />
            <span className='text-sm'>
              I recommend this couple for premarital counselling.
            </span>
          </label>

          <div className='pt-4 border-t'>
            <button
              type='submit'
              disabled={submitting}
              className={`btn w-full ${submitting ? 'bg-gray-300 text-gray-600' : 'btn-primary'}`}
            >
              {submitting ? 'Submitting...' : 'Submit Recommendation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
