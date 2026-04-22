import React from 'react'
import { supabase } from '../../../lib/supabase'

export default function S7Medical({ formData, onNext, onBack, isSaving }) {
  const [data, setData] = React.useState(formData)
  const [uploadProgress, setUploadProgress] = React.useState({})

  const handleFileUpload = async (file, field, sessionId, isArray = false) => {
    if (!file) return

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert(`File too large. Maximum size is 10MB.`)
      return
    }

    try {
      setUploadProgress((prev) => ({ ...prev, [field]: 'uploading' }))

      const ext = file.name.split('.').pop()
      const filename = `${sessionId}/${field}-${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('flms-uploads')
        .upload(filename, file, { cacheControl: '3600', upsert: false })

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from('flms-uploads').getPublicUrl(filename)

      if (isArray) {
        const current = data[field] || []
        setData((prev) => ({ ...prev, [field]: [...current, publicUrl] }))
      } else {
        setData((prev) => ({ ...prev, [field]: publicUrl }))
      }

      setUploadProgress((prev) => ({ ...prev, [field]: 'done' }))
    } catch (err) {
      console.error('Upload error:', err)
      setUploadProgress((prev) => ({ ...prev, [field]: 'error' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onNext?.(data)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      <div>
        <h1 className='text-3xl font-serif font-bold mb-2'>
          Medical Information
        </h1>
        <p className='section-intro'>
          Medical reports are optional but recommended. They help ensure you're
          both healthy for marriage and future family planning.
        </p>
      </div>

      {/* Male */}
      <div className='male-section rounded-lg p-6 space-y-4'>
        <h2 className='text-2xl font-serif font-semibold male-label'>
          Groom's Medical Reports
        </h2>
        <p className='text-sm text-gray-600'>
          You can upload multiple medical reports (e.g., blood test, general
          checkup)
        </p>

        <div>
          <label className='male-label'>Medical Reports (Optional)</label>
          <div className='upload-area'>
            <input
              type='file'
              accept='.pdf,.jpg,.png'
              multiple
              onChange={(e) => {
                Array.from(e.target.files || []).forEach((file) =>
                  handleFileUpload(
                    file,
                    'male_medical_report_urls',
                    data?.session_id,
                    true,
                  ),
                )
              }}
              className='hidden'
              id='male-medical'
            />
            <label htmlFor='male-medical' className='cursor-pointer block'>
              <p className='text-gold font-semibold'>Click to upload</p>
              <p className='text-sm text-gray-500'>
                PDF or images (max 10MB each)
              </p>
            </label>
          </div>

          {data?.male_medical_report_urls?.length > 0 && (
            <div className='mt-2 space-y-1'>
              {data.male_medical_report_urls.map((url, idx) => (
                <div
                  key={idx}
                  className='flex items-center justify-between bg-gray-100 p-2 rounded'
                >
                  <span className='text-sm'>Medical report {idx + 1}</span>
                  <button
                    type='button'
                    onClick={() => {
                      const updated = data.male_medical_report_urls.filter(
                        (_, i) => i !== idx,
                      )
                      setData((prev) => ({
                        ...prev,
                        male_medical_report_urls: updated,
                      }))
                    }}
                    className='text-error text-sm'
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Female */}
      <div className='female-section rounded-lg p-6 space-y-4'>
        <h2 className='text-2xl font-serif font-semibold female-label'>
          Bride's Medical Reports
        </h2>
        <p className='text-sm text-gray-600'>
          You can upload multiple medical reports (e.g., blood test, general
          checkup)
        </p>

        <div>
          <label className='female-label'>Medical Reports (Optional)</label>
          <div className='upload-area'>
            <input
              type='file'
              accept='.pdf,.jpg,.png'
              multiple
              onChange={(e) => {
                Array.from(e.target.files || []).forEach((file) =>
                  handleFileUpload(
                    file,
                    'female_medical_report_urls',
                    data?.session_id,
                    true,
                  ),
                )
              }}
              className='hidden'
              id='female-medical'
            />
            <label htmlFor='female-medical' className='cursor-pointer block'>
              <p className='text-gold font-semibold'>Click to upload</p>
              <p className='text-sm text-gray-500'>
                PDF or images (max 10MB each)
              </p>
            </label>
          </div>

          {data?.female_medical_report_urls?.length > 0 && (
            <div className='mt-2 space-y-1'>
              {data.female_medical_report_urls.map((url, idx) => (
                <div
                  key={idx}
                  className='flex items-center justify-between bg-gray-100 p-2 rounded'
                >
                  <span className='text-sm'>Medical report {idx + 1}</span>
                  <button
                    type='button'
                    onClick={() => {
                      const updated = data.female_medical_report_urls.filter(
                        (_, i) => i !== idx,
                      )
                      setData((prev) => ({
                        ...prev,
                        female_medical_report_urls: updated,
                      }))
                    }}
                    className='text-error text-sm'
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className='flex gap-4 pt-6 border-t'>
        <button
          type='button'
          onClick={onBack}
          className='btn btn-secondary flex-1'
        >
          Back
        </button>
        <button
          type='submit'
          disabled={isSaving}
          className={`btn flex-1 ${isSaving ? 'bg-gray-300' : 'btn-primary'}`}
        >
          {isSaving ? 'Saving...' : 'Next'}
        </button>
      </div>
    </form>
  )
}
