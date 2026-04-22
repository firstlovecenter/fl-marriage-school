import React, { useState, useCallback, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function S1PersonalDetails({
  formData,
  onNext,
  onBack,
  isFirstSection,
  isSaving,
  saveError,
}) {
  const [localData, setLocalData] = useState(formData || {})
  const [uploadProgress, setUploadProgress] = useState({})
  const [uploadError, setUploadError] = useState('')
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const minAdultDate = new Date()
  minAdultDate.setFullYear(minAdultDate.getFullYear() - 18)
  const minAdultDateString = minAdultDate.toISOString().split('T')[0]

  useEffect(() => {
    setLocalData(formData || {})
  }, [formData])

  const validateEmail = (value) => {
    if (!value?.trim()) return 'Email is required'
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(value.trim())) {
      return 'Please enter a valid email address'
    }
    return ''
  }

  const validatePhone = (value) => {
    if (value === null || value === undefined || String(value).trim() === '') {
      return 'WhatsApp number is required'
    }

    const digits = String(value).replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 12) {
      return 'Please enter a valid WhatsApp number'
    }

    return ''
  }

  const validateDob = (value) => {
    if (!value) return 'Date of birth is required'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Please enter a valid date of birth'

    if (date > minAdultDate) {
      return 'Applicant must be at least 18 years old'
    }

    return ''
  }

  const validateField = (field, value) => {
    switch (field) {
      case 'male_name':
      case 'female_name':
        return value?.trim() ? '' : 'Name is required'
      case 'male_email':
      case 'female_email':
        return validateEmail(value)
      case 'male_phone':
      case 'female_phone':
        return validatePhone(value)
      case 'male_dob':
      case 'female_dob':
        return validateDob(value)
      default:
        return ''
    }
  }

  const validateAll = (data) => {
    const fieldsToValidate = [
      'male_name',
      'male_email',
      'male_phone',
      'male_dob',
      'female_name',
      'female_email',
      'female_phone',
      'female_dob',
    ]

    const nextErrors = {}
    fieldsToValidate.forEach((field) => {
      const message = validateField(field, data[field])
      if (message) nextErrors[field] = message
    })

    return nextErrors
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const message = validateField(field, localData?.[field])
    setErrors((prev) => ({ ...prev, [field]: message }))
  }

  const fieldError = (field) => {
    const shouldShow = touched[field] || submitAttempted
    return shouldShow ? errors[field] : ''
  }

  const handleFileUpload = useCallback(
    async (file, field, sessionId) => {
      if (!file) return

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setUploadError(`File too large. Maximum size is 10MB.`)
        return
      }

      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
      ]
      if (!validTypes.includes(file.type)) {
        setUploadError(`Invalid file type. Please use JPG, PNG, WebP, or PDF.`)
        return
      }

      try {
        setUploadProgress((prev) => ({ ...prev, [field]: 'uploading' }))
        setUploadError('')

        // Create unique filename
        const ext = file.name.split('.').pop()
        const filename = `${sessionId}/${field}-${Date.now()}.${ext}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('flms-uploads')
          .upload(filename, file, { cacheControl: '3600', upsert: false })

        if (error) throw error

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('flms-uploads').getPublicUrl(filename)

        // Update form data
        setLocalData((prev) => ({ ...prev, [field]: publicUrl }))

        setUploadProgress((prev) => ({ ...prev, [field]: 'done' }))
      } catch (err) {
        console.error('Upload error:', err)
        setUploadError(`Failed to upload file: ${err.message}`)
        setUploadProgress((prev) => ({ ...prev, [field]: 'error' }))
      }
    },
    [onNext],
  )

  const handleInputChange = (field, value) => {
    setLocalData((prev) => {
      const updated = { ...prev, [field]: value }

      if (touched[field] || submitAttempted) {
        const message = validateField(field, value)
        setErrors((prevErrors) => ({ ...prevErrors, [field]: message }))
      }

      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setSubmitAttempted(true)
    const nextErrors = validateAll(localData)
    setErrors(nextErrors)
    setTouched((prev) => ({
      ...prev,
      male_name: true,
      male_email: true,
      male_phone: true,
      male_dob: true,
      female_name: true,
      female_email: true,
      female_phone: true,
      female_dob: true,
    }))

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    await onNext?.({
      male_name: localData.male_name,
      female_name: localData.female_name,
      male_email: localData.male_email,
      female_email: localData.female_email,
      male_phone: localData.male_phone,
      female_phone: localData.female_phone,
      male_dob: localData.male_dob,
      female_dob: localData.female_dob,
      male_place_of_birth: localData.male_place_of_birth,
      female_place_of_birth: localData.female_place_of_birth,
      male_residential_address: localData.male_residential_address,
      female_residential_address: localData.female_residential_address,
      male_born_again: localData.male_born_again,
      female_born_again: localData.female_born_again,
      male_born_again_when: localData.male_born_again_when,
      female_born_again_when: localData.female_born_again_when,
      male_born_again_why_not: localData.male_born_again_why_not,
      female_born_again_why_not: localData.female_born_again_why_not,
      male_passport_photo_url: localData.male_passport_photo_url,
      female_passport_photo_url: localData.female_passport_photo_url,
      payment_screenshot_url: localData.payment_screenshot_url,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-8'>
      <div>
        <h1 className='text-3xl font-serif font-bold mb-2'>Personal Details</h1>
        <p className='section-intro'>
          Tell us about yourselves. This information helps us understand your
          background and get to know you as a couple.
        </p>
      </div>

      {uploadError && (
        <div className='bg-error/10 border border-error text-error rounded-lg p-4'>
          {uploadError}
        </div>
      )}

      {saveError && (
        <div className='bg-error/10 border border-error text-error rounded-lg p-4'>
          {saveError}
        </div>
      )}

      {submitAttempted && Object.values(errors).some(Boolean) && (
        <div className='bg-error/10 border border-error text-error rounded-lg p-4'>
          Please fix the highlighted fields below before continuing.
        </div>
      )}

      {/* Male Partner Section */}
      <div className='male-section rounded-lg p-6 space-y-4'>
        <h2 className='text-2xl font-serif font-semibold male-label'>
          Groom / Male Partner
        </h2>

        <div className='form-grid'>
          <div>
            <label className='male-label'>Full Name *</label>
            <input
              type='text'
              value={localData?.male_name || ''}
              onChange={(e) => handleInputChange('male_name', e.target.value)}
              onBlur={() => handleBlur('male_name')}
              className={fieldError('male_name') ? 'input-error' : ''}
              placeholder='Your full name'
            />
            {fieldError('male_name') && (
              <p className='error-message'>{fieldError('male_name')}</p>
            )}
          </div>

          <div>
            <label className='male-label'>Email Address *</label>
            <input
              type='email'
              value={localData?.male_email || ''}
              onChange={(e) => handleInputChange('male_email', e.target.value)}
              onBlur={() => handleBlur('male_email')}
              className={fieldError('male_email') ? 'input-error' : ''}
              placeholder='your.email@example.com'
            />
            {fieldError('male_email') && (
              <p className='error-message'>{fieldError('male_email')}</p>
            )}
          </div>
        </div>

        <div className='form-grid'>
          <div>
            <label className='male-label'>WhatsApp Phone Number *</label>
            <input
              type='number'
              value={localData?.male_phone || ''}
              onChange={(e) => handleInputChange('male_phone', e.target.value)}
              onBlur={() => handleBlur('male_phone')}
              className={fieldError('male_phone') ? 'input-error' : ''}
              inputMode='numeric'
              placeholder='e.g. 0541234567'
            />
            {fieldError('male_phone') && (
              <p className='error-message'>{fieldError('male_phone')}</p>
            )}
          </div>

          <div>
            <label className='male-label'>Date of Birth *</label>
            <input
              type='date'
              value={localData?.male_dob || ''}
              onChange={(e) => handleInputChange('male_dob', e.target.value)}
              onBlur={() => handleBlur('male_dob')}
              max={minAdultDateString}
              className={fieldError('male_dob') ? 'input-error' : ''}
            />
            {fieldError('male_dob') && (
              <p className='error-message'>{fieldError('male_dob')}</p>
            )}
          </div>
        </div>

        <div className='form-grid'>
          <div>
            <label className='male-label'>Place of Birth</label>
            <input
              type='text'
              value={localData?.male_place_of_birth || ''}
              onChange={(e) =>
                handleInputChange('male_place_of_birth', e.target.value)
              }
            />
          </div>

          <div>
            <label className='male-label'>Residential Address</label>
            <input
              type='text'
              value={localData?.male_residential_address || ''}
              onChange={(e) =>
                handleInputChange('male_residential_address', e.target.value)
              }
            />
          </div>
        </div>

        {/* Passport photo upload */}
        <div>
          <label className='male-label'>Passport Photo</label>
          <div className='upload-area'>
            <input
              type='file'
              accept='image/*'
              onChange={(e) =>
                handleFileUpload(
                  e.target.files?.[0],
                  'male_passport_photo_url',
                  localData?.session_id,
                )
              }
              className='hidden'
              id='male-passport'
            />
            <label htmlFor='male-passport' className='cursor-pointer block'>
              {uploadProgress.male_passport_photo_url === 'uploading' && (
                <span>Uploading...</span>
              )}
              {uploadProgress.male_passport_photo_url === 'done' && (
                <span className='text-success'>✓ Uploaded</span>
              )}
              {uploadProgress.male_passport_photo_url === 'error' && (
                <span className='text-error'>Upload failed. Try again.</span>
              )}
              {!uploadProgress.male_passport_photo_url && (
                <div>
                  <p className='text-gold font-semibold'>Click to upload</p>
                  <p className='text-sm text-gray-500'>
                    JPG, PNG, or WebP (max 10MB)
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Born Again */}
        <div>
          <label className='male-label'>Are you a born-again Christian?</label>
          <select
            value={
              localData?.male_born_again === undefined
                ? ''
                : localData.male_born_again
                  ? 'yes'
                  : 'no'
            }
            onChange={(e) => {
              const val = e.target.value === 'yes'
              handleInputChange('male_born_again', val)
            }}
          >
            <option value=''>Select...</option>
            <option value='yes'>Yes</option>
            <option value='no'>No</option>
          </select>
        </div>

        {/* Conditional: Born again when */}
        {localData?.male_born_again && (
          <div>
            <label className='male-label'>
              When did you become a born-again Christian?
            </label>
            <input
              type='text'
              value={localData?.male_born_again_when || ''}
              onChange={(e) =>
                handleInputChange('male_born_again_when', e.target.value)
              }
              placeholder='e.g., 2015, Childhood, Recently'
            />
          </div>
        )}

        {/* Conditional: Born again why not */}
        {localData?.male_born_again === false && (
          <div>
            <label className='male-label'>Why not?</label>
            <textarea
              value={localData?.male_born_again_why_not || ''}
              onChange={(e) =>
                handleInputChange('male_born_again_why_not', e.target.value)
              }
              placeholder='Tell us about your spiritual journey...'
            />
          </div>
        )}
      </div>

      {/* Female Partner Section */}
      <div className='female-section rounded-lg p-6 space-y-4'>
        <h2 className='text-2xl font-serif font-semibold female-label'>
          Bride / Female Partner
        </h2>

        <div className='form-grid'>
          <div>
            <label className='female-label'>Full Name *</label>
            <input
              type='text'
              value={localData?.female_name || ''}
              onChange={(e) => handleInputChange('female_name', e.target.value)}
              onBlur={() => handleBlur('female_name')}
              className={fieldError('female_name') ? 'input-error' : ''}
              placeholder='Your full name'
            />
            {fieldError('female_name') && (
              <p className='error-message'>{fieldError('female_name')}</p>
            )}
          </div>

          <div>
            <label className='female-label'>Email Address *</label>
            <input
              type='email'
              value={localData?.female_email || ''}
              onChange={(e) =>
                handleInputChange('female_email', e.target.value)
              }
              onBlur={() => handleBlur('female_email')}
              className={fieldError('female_email') ? 'input-error' : ''}
              placeholder='your.email@example.com'
            />
            {fieldError('female_email') && (
              <p className='error-message'>{fieldError('female_email')}</p>
            )}
          </div>
        </div>

        <div className='form-grid'>
          <div>
            <label className='female-label'>WhatsApp Phone Number *</label>
            <input
              type='number'
              value={localData?.female_phone || ''}
              onChange={(e) =>
                handleInputChange('female_phone', e.target.value)
              }
              onBlur={() => handleBlur('female_phone')}
              className={fieldError('female_phone') ? 'input-error' : ''}
              inputMode='numeric'
              placeholder='e.g. 0551234567'
            />
            {fieldError('female_phone') && (
              <p className='error-message'>{fieldError('female_phone')}</p>
            )}
          </div>

          <div>
            <label className='female-label'>Date of Birth *</label>
            <input
              type='date'
              value={localData?.female_dob || ''}
              onChange={(e) => handleInputChange('female_dob', e.target.value)}
              onBlur={() => handleBlur('female_dob')}
              max={minAdultDateString}
              className={fieldError('female_dob') ? 'input-error' : ''}
            />
            {fieldError('female_dob') && (
              <p className='error-message'>{fieldError('female_dob')}</p>
            )}
          </div>
        </div>

        <div className='form-grid'>
          <div>
            <label className='female-label'>Place of Birth</label>
            <input
              type='text'
              value={localData?.female_place_of_birth || ''}
              onChange={(e) =>
                handleInputChange('female_place_of_birth', e.target.value)
              }
            />
          </div>

          <div>
            <label className='female-label'>Residential Address</label>
            <input
              type='text'
              value={localData?.female_residential_address || ''}
              onChange={(e) =>
                handleInputChange('female_residential_address', e.target.value)
              }
            />
          </div>
        </div>

        {/* Passport photo upload */}
        <div>
          <label className='female-label'>Passport Photo</label>
          <div className='upload-area'>
            <input
              type='file'
              accept='image/*'
              onChange={(e) =>
                handleFileUpload(
                  e.target.files?.[0],
                  'female_passport_photo_url',
                  localData?.session_id,
                )
              }
              className='hidden'
              id='female-passport'
            />
            <label htmlFor='female-passport' className='cursor-pointer block'>
              {uploadProgress.female_passport_photo_url === 'uploading' && (
                <span>Uploading...</span>
              )}
              {uploadProgress.female_passport_photo_url === 'done' && (
                <span className='text-success'>✓ Uploaded</span>
              )}
              {uploadProgress.female_passport_photo_url === 'error' && (
                <span className='text-error'>Upload failed. Try again.</span>
              )}
              {!uploadProgress.female_passport_photo_url && (
                <div>
                  <p className='text-gold font-semibold'>Click to upload</p>
                  <p className='text-sm text-gray-500'>
                    JPG, PNG, or WebP (max 10MB)
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Born Again */}
        <div>
          <label className='female-label'>
            Are you a born-again Christian?
          </label>
          <select
            value={
              localData?.female_born_again === undefined
                ? ''
                : localData.female_born_again
                  ? 'yes'
                  : 'no'
            }
            onChange={(e) => {
              const val = e.target.value === 'yes'
              handleInputChange('female_born_again', val)
            }}
          >
            <option value=''>Select...</option>
            <option value='yes'>Yes</option>
            <option value='no'>No</option>
          </select>
        </div>

        {/* Conditional: Born again when */}
        {localData?.female_born_again && (
          <div>
            <label className='female-label'>
              When did you become a born-again Christian?
            </label>
            <input
              type='text'
              value={localData?.female_born_again_when || ''}
              onChange={(e) =>
                handleInputChange('female_born_again_when', e.target.value)
              }
              placeholder='e.g., 2015, Childhood, Recently'
            />
          </div>
        )}

        {/* Conditional: Born again why not */}
        {localData?.female_born_again === false && (
          <div>
            <label className='female-label'>Why not?</label>
            <textarea
              value={localData?.female_born_again_why_not || ''}
              onChange={(e) =>
                handleInputChange('female_born_again_why_not', e.target.value)
              }
              placeholder='Tell us about your spiritual journey...'
            />
          </div>
        )}
      </div>

      {/* Payment Screenshot */}
      <div className='section'>
        <h3 className='text-xl font-serif font-semibold mb-4'>
          Payment Receipt
        </h3>
        <label className='block text-sm font-semibold mb-2'>
          Payment Screenshot
        </label>
        <div className='upload-area'>
          <input
            type='file'
            accept='image/*,.pdf'
            onChange={(e) =>
              handleFileUpload(
                e.target.files?.[0],
                'payment_screenshot_url',
                localData?.session_id,
              )
            }
            className='hidden'
            id='payment-screenshot'
          />
          <label htmlFor='payment-screenshot' className='cursor-pointer block'>
            {uploadProgress.payment_screenshot_url === 'uploading' && (
              <span>Uploading...</span>
            )}
            {uploadProgress.payment_screenshot_url === 'done' && (
              <span className='text-success'>✓ Uploaded</span>
            )}
            {uploadProgress.payment_screenshot_url === 'error' && (
              <span className='text-error'>Upload failed. Try again.</span>
            )}
            {!uploadProgress.payment_screenshot_url && (
              <div>
                <p className='text-gold font-semibold'>Click to upload</p>
                <p className='text-sm text-gray-500'>
                  JPG, PNG, WebP, or PDF (max 10MB)
                </p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex gap-4 pt-6 border-t'>
        {!isFirstSection && (
          <button
            type='button'
            onClick={onBack}
            className='btn btn-secondary flex-1'
          >
            Back
          </button>
        )}
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
