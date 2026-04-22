import React from 'react'

export default function S2Personality({ formData, onNext, onBack, isSaving }) {
  const [data, setData] = React.useState(formData)
  const [errors, setErrors] = React.useState({})
  const [touched, setTouched] = React.useState({})
  const [submitAttempted, setSubmitAttempted] = React.useState(false)

  const handleChange = (field, value) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const validateField = (field, value) => {
    if (
      (field === 'male_temperament' || field === 'female_temperament') &&
      !value?.trim()
    ) {
      return 'This field is required'
    }
    return ''
  }

  const onBlurField = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: validateField(field, data?.[field]) }))
  }

  const fieldError = (field) =>
    touched[field] || submitAttempted ? errors[field] : ''

  const handleSubmit = async (e) => {
    e.preventDefault()

    setSubmitAttempted(true)
    const nextErrors = {
      male_temperament: validateField('male_temperament', data?.male_temperament),
      female_temperament: validateField('female_temperament', data?.female_temperament),
    }
    setErrors(nextErrors)
    setTouched({ male_temperament: true, female_temperament: true })

    if (Object.values(nextErrors).some(Boolean)) {
      return
    }

    await onNext?.(data)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-8'>
      <div>
        <h1 className='text-3xl font-serif font-bold mb-2'>
          Personality & Communication
        </h1>
        <p className='section-intro'>
          Understanding each other's personality helps build a stronger
          relationship. We recommend discussing these questions together as a
          couple before answering.
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
          Groom's Personality
        </h2>

        <div>
          <label className='male-label'>Temperament / Personality Type *</label>
          <textarea
            value={data?.male_temperament || ''}
            onChange={(e) => handleChange('male_temperament', e.target.value)}
            onBlur={() => onBlurField('male_temperament')}
            className={fieldError('male_temperament') ? 'input-error' : ''}
            placeholder='How would you describe your personality? (e.g., outgoing, introverted, calm, passionate)'
          />
          {fieldError('male_temperament') && (
            <p className='error-message'>{fieldError('male_temperament')}</p>
          )}
        </div>

        <div>
          <label className='male-label'>Love Language</label>
          <select
            value={data?.male_love_language || ''}
            onChange={(e) => handleChange('male_love_language', e.target.value)}
          >
            <option value=''>Select...</option>
            <option value='Words of Affirmation'>Words of Affirmation</option>
            <option value='Acts of Service'>Acts of Service</option>
            <option value='Receiving Gifts'>Receiving Gifts</option>
            <option value='Quality Time'>Quality Time</option>
            <option value='Physical Touch'>Physical Touch</option>
          </select>
        </div>
      </div>

      {/* Female */}
      <div className='female-section rounded-lg p-6 space-y-4'>
        <h2 className='text-2xl font-serif font-semibold female-label'>
          Bride's Personality
        </h2>

        <div>
          <label className='female-label'>
            Temperament / Personality Type *
          </label>
          <textarea
            value={data?.female_temperament || ''}
            onChange={(e) => handleChange('female_temperament', e.target.value)}
            onBlur={() => onBlurField('female_temperament')}
            className={fieldError('female_temperament') ? 'input-error' : ''}
            placeholder='How would you describe your personality? (e.g., outgoing, introverted, calm, passionate)'
          />
          {fieldError('female_temperament') && (
            <p className='error-message'>{fieldError('female_temperament')}</p>
          )}
        </div>

        <div>
          <label className='female-label'>Love Language</label>
          <select
            value={data?.female_love_language || ''}
            onChange={(e) =>
              handleChange('female_love_language', e.target.value)
            }
          >
            <option value=''>Select...</option>
            <option value='Words of Affirmation'>Words of Affirmation</option>
            <option value='Acts of Service'>Acts of Service</option>
            <option value='Receiving Gifts'>Receiving Gifts</option>
            <option value='Quality Time'>Quality Time</option>
            <option value='Physical Touch'>Physical Touch</option>
          </select>
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
