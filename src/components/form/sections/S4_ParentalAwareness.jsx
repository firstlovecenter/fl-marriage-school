import React from 'react'

export default function S4ParentalAwareness({
  formData,
  onNext,
  onBack,
  isSaving,
}) {
  const [data, setData] = React.useState(formData)
  const [errors, setErrors] = React.useState({})
  const [touched, setTouched] = React.useState({})
  const [submitAttempted, setSubmitAttempted] = React.useState(false)

  const parentPhoneFields = ['male_parent_contact', 'female_parent_contact']

  const isParentPhoneField = (field) => parentPhoneFields.includes(field)

  const sanitizePhoneInput = (value) =>
    String(value || '')
      .replace(/[^\d+]/g, '')
      .replace(/(?!^)\+/g, '')

  const normalizeParentPhone = (value) => {
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

  const isValidParentPhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '')
    return (
      (digits.length === 10 && digits.startsWith('0')) ||
      (digits.length === 12 && digits.startsWith('233')) ||
      digits.length === 9
    )
  }

  const handleChange = (field, value) => {
    const nextValue = isParentPhoneField(field)
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
    if (
      (field === 'male_father_name' || field === 'female_father_name') &&
      !value?.trim()
    ) {
      return "Father's name is required"
    }

    if (
      isParentPhoneField(field) &&
      value?.trim() &&
      !isValidParentPhone(value)
    ) {
      return 'Use a valid phone number (e.g. 0551234567 or +233551234567)'
    }

    return ''
  }

  const onBlurField = (field) => {
    let value = data?.[field]

    if (isParentPhoneField(field)) {
      const normalized = normalizeParentPhone(value)
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

    setSubmitAttempted(true)
    const nextErrors = {
      male_father_name: validateField(
        'male_father_name',
        data?.male_father_name,
      ),
      female_father_name: validateField(
        'female_father_name',
        data?.female_father_name,
      ),
    }
    setErrors(nextErrors)
    setTouched({ male_father_name: true, female_father_name: true })

    if (Object.values(nextErrors).some(Boolean)) {
      return
    }

    await onNext?.(data)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-8'>
      <div>
        <h1 className='text-3xl font-serif font-bold mb-2'>
          Parental Awareness & Family Background
        </h1>
        <p className='section-intro'>
          Understanding your family background helps us provide support that's
          appropriate for your unique situation.
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
          Groom's Family
        </h2>

        <div className='form-grid'>
          <div>
            <label className='male-label'>Father's Name *</label>
            <input
              type='text'
              value={data?.male_father_name || ''}
              onChange={(e) => handleChange('male_father_name', e.target.value)}
              onBlur={() => onBlurField('male_father_name')}
              className={fieldError('male_father_name') ? 'input-error' : ''}
            />
            {fieldError('male_father_name') && (
              <p className='error-message'>{fieldError('male_father_name')}</p>
            )}
          </div>

          <div>
            <label className='male-label'>Father's Occupation</label>
            <input
              type='text'
              value={data?.male_father_occupation || ''}
              onChange={(e) =>
                handleChange('male_father_occupation', e.target.value)
              }
            />
          </div>
        </div>

        <div className='form-grid'>
          <div>
            <label className='male-label'>
              Do your parents know about your engagement?
            </label>
            <select
              value={
                data?.male_parental_knowledge === undefined
                  ? ''
                  : data.male_parental_knowledge
                    ? 'yes'
                    : 'no'
              }
              onChange={(e) =>
                handleChange(
                  'male_parental_knowledge',
                  e.target.value === 'yes',
                )
              }
            >
              <option value=''>Select...</option>
              <option value='yes'>Yes</option>
              <option value='no'>No</option>
            </select>
          </div>

          <div>
            <label className='male-label'>Do you have parental consent?</label>
            <select
              value={
                data?.male_parental_consent === undefined
                  ? ''
                  : data.male_parental_consent
                    ? 'yes'
                    : 'no'
              }
              onChange={(e) =>
                handleChange('male_parental_consent', e.target.value === 'yes')
              }
            >
              <option value=''>Select...</option>
              <option value='yes'>Yes</option>
              <option value='no'>No</option>
            </select>
          </div>
        </div>

        <div>
          <label className='male-label'>Parent Contact</label>
          <input
            type='tel'
            value={data?.male_parent_contact || ''}
            onChange={(e) =>
              handleChange('male_parent_contact', e.target.value)
            }
            onBlur={() => onBlurField('male_parent_contact')}
            className={fieldError('male_parent_contact') ? 'input-error' : ''}
            inputMode='numeric'
            placeholder='+233 5XX XXX XXX'
          />
          {fieldError('male_parent_contact') && (
            <p className='error-message'>{fieldError('male_parent_contact')}</p>
          )}
        </div>

        <div>
          <label className='male-label'>Are your parents married?</label>
          <select
            value={
              data?.male_parents_married === undefined
                ? ''
                : data.male_parents_married
                  ? 'yes'
                  : 'no'
            }
            onChange={(e) =>
              handleChange('male_parents_married', e.target.value === 'yes')
            }
          >
            <option value=''>Select...</option>
            <option value='yes'>Yes</option>
            <option value='no'>No</option>
          </select>
        </div>

        {data?.male_parents_married && (
          <div>
            <label className='male-label'>Do your parents live together?</label>
            <select
              value={
                data?.male_parents_live_together === undefined
                  ? ''
                  : data.male_parents_live_together
                    ? 'yes'
                    : 'no'
              }
              onChange={(e) =>
                handleChange(
                  'male_parents_live_together',
                  e.target.value === 'yes',
                )
              }
            >
              <option value=''>Select...</option>
              <option value='yes'>Yes</option>
              <option value='no'>No</option>
            </select>
          </div>
        )}

        {!data?.male_parents_married && (
          <div>
            <label className='male-label'>
              What is their marriage situation?
            </label>
            <select
              value={data?.male_parents_marriage_condition || ''}
              onChange={(e) =>
                handleChange('male_parents_marriage_condition', e.target.value)
              }
            >
              <option value=''>Select...</option>
              <option value='Divorced'>Divorced</option>
              <option value='Separated'>Separated</option>
              <option value='Deceased'>Deceased</option>
              <option value='N/A'>Not Applicable</option>
            </select>
          </div>
        )}

        {data?.male_parents_marriage_condition === 'Deceased' && (
          <div>
            <label className='male-label'>Which parent is deceased?</label>
            <input
              type='text'
              value={data?.male_deceased_parent_alive || ''}
              onChange={(e) =>
                handleChange('male_deceased_parent_alive', e.target.value)
              }
              placeholder='Mother / Father'
            />
          </div>
        )}

        <div>
          <label className='male-label'>
            Did you grow up with both parents?
          </label>
          <select
            value={
              data?.male_grew_up_with_both_parents === undefined
                ? ''
                : data.male_grew_up_with_both_parents
                  ? 'yes'
                  : 'no'
            }
            onChange={(e) =>
              handleChange(
                'male_grew_up_with_both_parents',
                e.target.value === 'yes',
              )
            }
          >
            <option value=''>Select...</option>
            <option value='yes'>Yes</option>
            <option value='no'>No</option>
          </select>
        </div>

        {!data?.male_grew_up_with_both_parents && (
          <div>
            <label className='male-label'>
              Who raised you / your guardian?
            </label>
            <select
              value={data?.male_guardian_relationship || ''}
              onChange={(e) =>
                handleChange('male_guardian_relationship', e.target.value)
              }
            >
              <option value=''>Select...</option>
              <option value='Good'>Good relationship</option>
              <option value='Cordial'>Cordial</option>
              <option value='Bad'>Difficult relationship</option>
              <option value='N/A'>N/A</option>
            </select>
          </div>
        )}

        <div>
          <label className='male-label'>
            How is your relationship with your beloved family?
          </label>
          <textarea
            value={data?.male_beloved_family_relationship || ''}
            onChange={(e) =>
              handleChange('male_beloved_family_relationship', e.target.value)
            }
            placeholder='Describe your family relationships...'
          />
        </div>
      </div>

      {/* Female - similar pattern */}
      <div className='female-section rounded-lg p-6 space-y-4'>
        <h2 className='text-2xl font-serif font-semibold female-label'>
          Bride's Family
        </h2>

        <div className='form-grid'>
          <div>
            <label className='female-label'>Father's Name *</label>
            <input
              type='text'
              value={data?.female_father_name || ''}
              onChange={(e) =>
                handleChange('female_father_name', e.target.value)
              }
              onBlur={() => onBlurField('female_father_name')}
              className={fieldError('female_father_name') ? 'input-error' : ''}
            />
            {fieldError('female_father_name') && (
              <p className='error-message'>
                {fieldError('female_father_name')}
              </p>
            )}
          </div>

          <div>
            <label className='female-label'>Father's Occupation</label>
            <input
              type='text'
              value={data?.female_father_occupation || ''}
              onChange={(e) =>
                handleChange('female_father_occupation', e.target.value)
              }
            />
          </div>
        </div>

        <div className='form-grid'>
          <div>
            <label className='female-label'>
              Do your parents know about your engagement?
            </label>
            <select
              value={
                data?.female_parental_knowledge === undefined
                  ? ''
                  : data.female_parental_knowledge
                    ? 'yes'
                    : 'no'
              }
              onChange={(e) =>
                handleChange(
                  'female_parental_knowledge',
                  e.target.value === 'yes',
                )
              }
            >
              <option value=''>Select...</option>
              <option value='yes'>Yes</option>
              <option value='no'>No</option>
            </select>
          </div>

          <div>
            <label className='female-label'>
              Do you have parental consent?
            </label>
            <select
              value={
                data?.female_parental_consent === undefined
                  ? ''
                  : data.female_parental_consent
                    ? 'yes'
                    : 'no'
              }
              onChange={(e) =>
                handleChange(
                  'female_parental_consent',
                  e.target.value === 'yes',
                )
              }
            >
              <option value=''>Select...</option>
              <option value='yes'>Yes</option>
              <option value='no'>No</option>
            </select>
          </div>
        </div>

        <div>
          <label className='female-label'>Parent Contact</label>
          <input
            type='tel'
            value={data?.female_parent_contact || ''}
            onChange={(e) =>
              handleChange('female_parent_contact', e.target.value)
            }
            onBlur={() => onBlurField('female_parent_contact')}
            className={fieldError('female_parent_contact') ? 'input-error' : ''}
            inputMode='numeric'
            placeholder='+233 5XX XXX XXX'
          />
          {fieldError('female_parent_contact') && (
            <p className='error-message'>
              {fieldError('female_parent_contact')}
            </p>
          )}
        </div>

        <div>
          <label className='female-label'>Are your parents married?</label>
          <select
            value={
              data?.female_parents_married === undefined
                ? ''
                : data.female_parents_married
                  ? 'yes'
                  : 'no'
            }
            onChange={(e) =>
              handleChange('female_parents_married', e.target.value === 'yes')
            }
          >
            <option value=''>Select...</option>
            <option value='yes'>Yes</option>
            <option value='no'>No</option>
          </select>
        </div>

        {data?.female_parents_married && (
          <div>
            <label className='female-label'>
              Do your parents live together?
            </label>
            <select
              value={
                data?.female_parents_live_together === undefined
                  ? ''
                  : data.female_parents_live_together
                    ? 'yes'
                    : 'no'
              }
              onChange={(e) =>
                handleChange(
                  'female_parents_live_together',
                  e.target.value === 'yes',
                )
              }
            >
              <option value=''>Select...</option>
              <option value='yes'>Yes</option>
              <option value='no'>No</option>
            </select>
          </div>
        )}

        {!data?.female_parents_married && (
          <div>
            <label className='female-label'>
              What is their marriage situation?
            </label>
            <select
              value={data?.female_parents_marriage_condition || ''}
              onChange={(e) =>
                handleChange(
                  'female_parents_marriage_condition',
                  e.target.value,
                )
              }
            >
              <option value=''>Select...</option>
              <option value='Divorced'>Divorced</option>
              <option value='Separated'>Separated</option>
              <option value='Deceased'>Deceased</option>
              <option value='N/A'>Not Applicable</option>
            </select>
          </div>
        )}

        {data?.female_parents_marriage_condition === 'Deceased' && (
          <div>
            <label className='female-label'>Which parent is deceased?</label>
            <input
              type='text'
              value={data?.female_deceased_parent_alive || ''}
              onChange={(e) =>
                handleChange('female_deceased_parent_alive', e.target.value)
              }
              placeholder='Mother / Father'
            />
          </div>
        )}

        <div>
          <label className='female-label'>
            Did you grow up with both parents?
          </label>
          <select
            value={
              data?.female_grew_up_with_both_parents === undefined
                ? ''
                : data.female_grew_up_with_both_parents
                  ? 'yes'
                  : 'no'
            }
            onChange={(e) =>
              handleChange(
                'female_grew_up_with_both_parents',
                e.target.value === 'yes',
              )
            }
          >
            <option value=''>Select...</option>
            <option value='yes'>Yes</option>
            <option value='no'>No</option>
          </select>
        </div>

        {!data?.female_grew_up_with_both_parents && (
          <div>
            <label className='female-label'>
              Who raised you / your guardian?
            </label>
            <select
              value={data?.female_guardian_relationship || ''}
              onChange={(e) =>
                handleChange('female_guardian_relationship', e.target.value)
              }
            >
              <option value=''>Select...</option>
              <option value='Good'>Good relationship</option>
              <option value='Cordial'>Cordial</option>
              <option value='Bad'>Difficult relationship</option>
              <option value='N/A'>N/A</option>
            </select>
          </div>
        )}

        <div>
          <label className='female-label'>
            How is your relationship with your beloved family?
          </label>
          <textarea
            value={data?.female_beloved_family_relationship || ''}
            onChange={(e) =>
              handleChange('female_beloved_family_relationship', e.target.value)
            }
            placeholder='Describe your family relationships...'
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
