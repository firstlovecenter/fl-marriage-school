import React from 'react'

export default function S5ChurchInfo({ formData, onNext, onBack, isSaving }) {
  const [data, setData] = React.useState(formData)
  const [errors, setErrors] = React.useState({})
  const [touched, setTouched] = React.useState({})
  const [submitAttempted, setSubmitAttempted] = React.useState(false)

  const pastorPhoneFields = ['male_pastor_phone', 'female_pastor_phone']

  const isPastorPhoneField = (field) => pastorPhoneFields.includes(field)

  const sanitizePhoneInput = (value) =>
    String(value || '')
      .replace(/[^\d+]/g, '')
      .replace(/(?!^)\+/g, '')

  const normalizePastorPhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '')
    if (!digits) return ''

    if (digits.startsWith('0') && digits.length === 10) {
      return `+233${digits.slice(1)}`
    }

    if (digits.startsWith('233') && digits.length === 12) {
      return `+${digits}`
    }

    if (digits.length === 9) {
      return `+233${digits}`
    }

    return String(value || '').trim()
  }

  const isValidPastorPhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '')
    return (
      (digits.length === 10 && digits.startsWith('0')) ||
      (digits.length === 12 && digits.startsWith('233')) ||
      digits.length === 9
    )
  }

  const handleChange = (field, value) => {
    const nextValue = isPastorPhoneField(field)
      ? sanitizePhoneInput(value)
      : value

    setData((prev) => ({ ...prev, [field]: nextValue }))

    if (touched[field] || submitAttempted) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, nextValue),
      }))
    }
  }

  const validateField = (field, value) => {
    const requiredFields = [
      'male_church_name',
      'female_church_name',
      'male_pastor_name',
      'female_pastor_name',
      'male_pastor_phone',
      'female_pastor_phone',
    ]
    if (requiredFields.includes(field) && !value?.trim()) {
      return 'This field is required'
    }

    if (
      isPastorPhoneField(field) &&
      value?.trim() &&
      !isValidPastorPhone(value)
    ) {
      return 'Use a valid phone number (e.g. 0551234567 or +233551234567)'
    }

    return ''
  }

  const onBlurField = (field) => {
    let value = data?.[field]

    if (isPastorPhoneField(field)) {
      const normalized = normalizePastorPhone(value)
      if (normalized !== value) {
        setData((prev) => ({ ...prev, [field]: normalized }))
      }
      value = normalized
    }

    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, value),
    }))
  }

  const fieldError = (field) =>
    touched[field] || submitAttempted ? errors[field] : ''

  const handleSubmit = async (e) => {
    e.preventDefault()

    const normalizedData = {
      ...data,
      male_pastor_phone: normalizePastorPhone(data?.male_pastor_phone),
      female_pastor_phone: normalizePastorPhone(data?.female_pastor_phone),
    }

    setData(normalizedData)

    setSubmitAttempted(true)
    const requiredFields = [
      'male_church_name',
      'female_church_name',
      'male_pastor_name',
      'female_pastor_name',
      'male_pastor_phone',
      'female_pastor_phone',
    ]
    const nextErrors = {}
    requiredFields.forEach((field) => {
      const message = validateField(field, normalizedData?.[field])
      if (message) nextErrors[field] = message
    })
    setErrors(nextErrors)
    setTouched((prev) => {
      const touchedMap = { ...prev }
      requiredFields.forEach((field) => {
        touchedMap[field] = true
      })
      return touchedMap
    })

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    await onNext?.(normalizedData)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-8'>
      <div>
        <h1 className='text-3xl font-serif font-bold mb-2'>
          Church Information
        </h1>
        <p className='section-intro'>
          We'll contact your pastors to gather their pastoral recommendations.
          Make sure the information is correct.
        </p>
      </div>

      {submitAttempted && Object.values(errors).some(Boolean) && (
        <div className='bg-error/10 border border-error text-error rounded-lg p-4'>
          Please fix the highlighted fields before continuing.
        </div>
      )}

      {/* Male */}
      <div className='male-section rounded-lg p-6 space-y-4'>
        <h2 className='text-2xl font-serif font-semibold male-label'>
          Groom's Church
        </h2>

        <div>
          <label className='male-label'>Church Name *</label>
          <input
            type='text'
            value={data?.male_church_name || ''}
            onChange={(e) => handleChange('male_church_name', e.target.value)}
            onBlur={() => onBlurField('male_church_name')}
            className={fieldError('male_church_name') ? 'input-error' : ''}
            placeholder='Name of your church'
          />
          {fieldError('male_church_name') && (
            <p className='error-message'>{fieldError('male_church_name')}</p>
          )}
        </div>

        <div className='form-grid'>
          <div>
            <label className='male-label'>Pastor's Name *</label>
            <input
              type='text'
              value={data?.male_pastor_name || ''}
              onChange={(e) => handleChange('male_pastor_name', e.target.value)}
              onBlur={() => onBlurField('male_pastor_name')}
              className={fieldError('male_pastor_name') ? 'input-error' : ''}
              placeholder='Full name of your pastor'
            />
            {fieldError('male_pastor_name') && (
              <p className='error-message'>{fieldError('male_pastor_name')}</p>
            )}
          </div>

          <div>
            <label className='male-label'>Pastor's Phone *</label>
            <input
              type='tel'
              value={data?.male_pastor_phone || ''}
              onChange={(e) =>
                handleChange('male_pastor_phone', e.target.value)
              }
              onBlur={() => onBlurField('male_pastor_phone')}
              className={fieldError('male_pastor_phone') ? 'input-error' : ''}
              placeholder='+233 5XX XXX XXX'
            />
            {fieldError('male_pastor_phone') && (
              <p className='error-message'>{fieldError('male_pastor_phone')}</p>
            )}
          </div>
        </div>

        <div>
          <label className='male-label'>Pastor's Email</label>
          <input
            type='email'
            value={data?.male_pastor_email || ''}
            onChange={(e) => handleChange('male_pastor_email', e.target.value)}
            placeholder='pastor@church.com'
          />
        </div>

        <div className='form-grid'>
          <div>
            <label className='male-label'>When did you join this church?</label>
            <input
              type='date'
              value={data?.male_church_joined_date || ''}
              onChange={(e) =>
                handleChange('male_church_joined_date', e.target.value)
              }
            />
          </div>

          <div>
            <label className='male-label'>
              Your ministry / area of service
            </label>
            <input
              type='text'
              value={data?.male_ministry || ''}
              onChange={(e) => handleChange('male_ministry', e.target.value)}
              placeholder='e.g., Ushering, Choir, Youth Group'
            />
          </div>
        </div>

        <div>
          <label className='male-label'>Brief history with this church</label>
          <textarea
            value={data?.male_church_history || ''}
            onChange={(e) =>
              handleChange('male_church_history', e.target.value)
            }
            placeholder='How you came to this church, spiritual growth, etc.'
          />
        </div>

        <div>
          <label className='male-label'>Your level of church involvement</label>
          <select
            value={data?.male_church_involvement || ''}
            onChange={(e) =>
              handleChange('male_church_involvement', e.target.value)
            }
          >
            <option value=''>Select...</option>
            <option value='Excellent'>Excellent</option>
            <option value='Good'>Good</option>
            <option value='Fair'>Fair</option>
            <option value='Poor'>Poor</option>
          </select>
        </div>

        <div>
          <label className='male-label'>Your church attendance</label>
          <select
            value={data?.male_church_attendance || ''}
            onChange={(e) =>
              handleChange('male_church_attendance', e.target.value)
            }
          >
            <option value=''>Select...</option>
            <option value='Regular'>Regular (every Sunday)</option>
            <option value='Usual'>Usual (most Sundays)</option>
            <option value='Irregular'>Irregular</option>
          </select>
        </div>

        <div>
          <label className='male-label'>If irregular, please explain</label>
          <textarea
            value={data?.male_attendance_reason || ''}
            onChange={(e) =>
              handleChange('male_attendance_reason', e.target.value)
            }
            placeholder='Why your attendance is irregular...'
          />
        </div>
      </div>

      {/* Female - similar */}
      <div className='female-section rounded-lg p-6 space-y-4'>
        <h2 className='text-2xl font-serif font-semibold female-label'>
          Bride's Church
        </h2>

        <div>
          <label className='female-label'>Church Name *</label>
          <input
            type='text'
            value={data?.female_church_name || ''}
            onChange={(e) => handleChange('female_church_name', e.target.value)}
            onBlur={() => onBlurField('female_church_name')}
            className={fieldError('female_church_name') ? 'input-error' : ''}
            placeholder='Name of your church'
          />
          {fieldError('female_church_name') && (
            <p className='error-message'>{fieldError('female_church_name')}</p>
          )}
        </div>

        <div className='form-grid'>
          <div>
            <label className='female-label'>Pastor's Name *</label>
            <input
              type='text'
              value={data?.female_pastor_name || ''}
              onChange={(e) =>
                handleChange('female_pastor_name', e.target.value)
              }
              onBlur={() => onBlurField('female_pastor_name')}
              className={fieldError('female_pastor_name') ? 'input-error' : ''}
              placeholder='Full name of your pastor'
            />
            {fieldError('female_pastor_name') && (
              <p className='error-message'>
                {fieldError('female_pastor_name')}
              </p>
            )}
          </div>

          <div>
            <label className='female-label'>Pastor's Phone *</label>
            <input
              type='tel'
              value={data?.female_pastor_phone || ''}
              onChange={(e) =>
                handleChange('female_pastor_phone', e.target.value)
              }
              onBlur={() => onBlurField('female_pastor_phone')}
              className={fieldError('female_pastor_phone') ? 'input-error' : ''}
              placeholder='+233 5XX XXX XXX'
            />
            {fieldError('female_pastor_phone') && (
              <p className='error-message'>
                {fieldError('female_pastor_phone')}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className='female-label'>Pastor's Email</label>
          <input
            type='email'
            value={data?.female_pastor_email || ''}
            onChange={(e) =>
              handleChange('female_pastor_email', e.target.value)
            }
            placeholder='pastor@church.com'
          />
        </div>

        <div className='form-grid'>
          <div>
            <label className='female-label'>
              When did you join this church?
            </label>
            <input
              type='date'
              value={data?.female_church_joined_date || ''}
              onChange={(e) =>
                handleChange('female_church_joined_date', e.target.value)
              }
            />
          </div>

          <div>
            <label className='female-label'>
              Your ministry / area of service
            </label>
            <input
              type='text'
              value={data?.female_ministry || ''}
              onChange={(e) => handleChange('female_ministry', e.target.value)}
              placeholder='e.g., Ushering, Choir, Youth Group'
            />
          </div>
        </div>

        <div>
          <label className='female-label'>Brief history with this church</label>
          <textarea
            value={data?.female_church_history || ''}
            onChange={(e) =>
              handleChange('female_church_history', e.target.value)
            }
            placeholder='How you came to this church, spiritual growth, etc.'
          />
        </div>

        <div>
          <label className='female-label'>
            Your level of church involvement
          </label>
          <select
            value={data?.female_church_involvement || ''}
            onChange={(e) =>
              handleChange('female_church_involvement', e.target.value)
            }
          >
            <option value=''>Select...</option>
            <option value='Excellent'>Excellent</option>
            <option value='Good'>Good</option>
            <option value='Fair'>Fair</option>
            <option value='Poor'>Poor</option>
          </select>
        </div>

        <div>
          <label className='female-label'>Your church attendance</label>
          <select
            value={data?.female_church_attendance || ''}
            onChange={(e) =>
              handleChange('female_church_attendance', e.target.value)
            }
          >
            <option value=''>Select...</option>
            <option value='Regular'>Regular (every Sunday)</option>
            <option value='Usual'>Usual (most Sundays)</option>
            <option value='Irregular'>Irregular</option>
          </select>
        </div>

        <div>
          <label className='female-label'>If irregular, please explain</label>
          <textarea
            value={data?.female_attendance_reason || ''}
            onChange={(e) =>
              handleChange('female_attendance_reason', e.target.value)
            }
            placeholder='Why your attendance is irregular...'
          />
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
