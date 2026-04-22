import React from 'react'
import { supabase } from '../../../lib/supabase'

export default function S6PersonalHistory({
  formData,
  onNext,
  onBack,
  isSaving,
}) {
  const [data, setData] = React.useState(formData)
  const [uploadProgress, setUploadProgress] = React.useState({})
  const [uploadError, setUploadError] = React.useState('')
  const [errors, setErrors] = React.useState({})
  const [touched, setTouched] = React.useState({})
  const [submitAttempted, setSubmitAttempted] = React.useState(false)

  const handleChange = (field, value) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const validateField = (field, value) => {
    if (
      (field === 'male_been_married' || field === 'female_been_married') &&
      value === undefined
    ) {
      return 'Please select Yes or No'
    }
    return ''
  }

  const onBlurField = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: validateField(field, data?.[field]) }))
  }

  const fieldError = (field) =>
    touched[field] || submitAttempted ? errors[field] : ''

  const handleFileUpload = async (file, field, sessionId) => {
    if (!file) return

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError(`File too large. Maximum size is 10MB.`)
      return
    }

    try {
      setUploadProgress((prev) => ({ ...prev, [field]: 'uploading' }))
      setUploadError('')

      const ext = file.name.split('.').pop()
      const filename = `${sessionId}/${field}-${Date.now()}.${ext}`

      const { data: uploadData, error } = await supabase.storage
        .from('flms-uploads')
        .upload(filename, file, { cacheControl: '3600', upsert: false })

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from('flms-uploads').getPublicUrl(filename)
      setData((prev) => ({ ...prev, [field]: publicUrl }))
      setUploadProgress((prev) => ({ ...prev, [field]: 'done' }))
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError(`Failed to upload file: ${err.message}`)
      setUploadProgress((prev) => ({ ...prev, [field]: 'error' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setSubmitAttempted(true)
    const nextErrors = {
      male_been_married: validateField('male_been_married', data?.male_been_married),
      female_been_married: validateField('female_been_married', data?.female_been_married),
    }
    setErrors(nextErrors)
    setTouched({ male_been_married: true, female_been_married: true })

    if (Object.values(nextErrors).some(Boolean)) {
      return
    }

    await onNext?.(data)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-8'>
      <div>
        <h1 className='text-3xl font-serif font-bold mb-2'>Personal History</h1>
        <p className='section-intro'>
          This information helps us understand your background and provide
          appropriate pastoral support and guidance.
        </p>
      </div>

      {submitAttempted && Object.values(errors).some(Boolean) && (
        <div className='bg-error/10 border border-error text-error rounded-lg p-4'>
          Please fix the highlighted fields before continuing.
        </div>
      )}

      {uploadError && (
        <div className='bg-error/10 border border-error text-error rounded-lg p-4'>
          {uploadError}
        </div>
      )}

      {/* Male */}
      <div className='male-section rounded-lg p-6 space-y-4'>
        <h2 className='text-2xl font-serif font-semibold male-label'>
          Groom's Personal History
        </h2>

        <div>
          <label className='male-label'>Have you been married before?</label>
          <select
            value={
              data?.male_been_married === undefined
                ? ''
                : data.male_been_married
                  ? 'yes'
                  : 'no'
            }
            onChange={(e) =>
              handleChange('male_been_married', e.target.value === 'yes')
            }
            onBlur={() => onBlurField('male_been_married')}
            className={fieldError('male_been_married') ? 'input-error' : ''}
          >
            <option value=''>Select...</option>
            <option value='yes'>Yes</option>
            <option value='no'>No</option>
          </select>
          {fieldError('male_been_married') && (
            <p className='error-message'>{fieldError('male_been_married')}</p>
          )}
        </div>

        {data?.male_been_married && (
          <>
            <div>
              <label className='male-label'>Type of previous marriage</label>
              <select
                value={data?.male_marriage_type || ''}
                onChange={(e) =>
                  handleChange('male_marriage_type', e.target.value)
                }
              >
                <option value=''>Select...</option>
                <option value='Customary'>Customary</option>
                <option value='Under The Ordinance'>
                  Under The Ordinance (Church)
                </option>
                <option value='Marriage of Convenience'>
                  Marriage of Convenience
                </option>
                <option value='Civil'>Civil Marriage</option>
              </select>
            </div>

            <div>
              <label className='male-label'>
                What happened to that marriage?
              </label>
              <select
                value={data?.male_prev_marriage_status || ''}
                onChange={(e) =>
                  handleChange('male_prev_marriage_status', e.target.value)
                }
              >
                <option value=''>Select...</option>
                <option value='Divorced'>Divorced</option>
                <option value='Separated'>Separated</option>
                <option value='Spouse Deceased'>Spouse Deceased</option>
                <option value='N/A'>N/A</option>
              </select>
            </div>

            {data?.male_prev_marriage_status === 'Divorced' && (
              <>
                <div>
                  <label className='male-label'>
                    Do you have divorce documents?
                  </label>
                  <select
                    value={
                      data?.male_has_divorce_docs === undefined
                        ? ''
                        : data.male_has_divorce_docs
                          ? 'yes'
                          : 'no'
                    }
                    onChange={(e) =>
                      handleChange(
                        'male_has_divorce_docs',
                        e.target.value === 'yes',
                      )
                    }
                  >
                    <option value=''>Select...</option>
                    <option value='yes'>Yes</option>
                    <option value='no'>No</option>
                  </select>
                </div>

                {data?.male_has_divorce_docs && (
                  <div>
                    <label className='male-label'>
                      Upload divorce documents
                    </label>
                    <div className='upload-area'>
                      <input
                        type='file'
                        accept='.pdf,.jpg,.png'
                        onChange={(e) =>
                          handleFileUpload(
                            e.target.files?.[0],
                            'male_divorce_docs_url',
                            data?.session_id,
                          )
                        }
                        className='hidden'
                        id='male-divorce'
                      />
                      <label
                        htmlFor='male-divorce'
                        className='cursor-pointer block'
                      >
                        {uploadProgress.male_divorce_docs_url ===
                          'uploading' && <span>Uploading...</span>}
                        {uploadProgress.male_divorce_docs_url === 'done' && (
                          <span className='text-success'>✓ Uploaded</span>
                        )}
                        {!uploadProgress.male_divorce_docs_url && (
                          <div>
                            <p className='text-gold font-semibold'>
                              Click to upload
                            </p>
                            <p className='text-sm text-gray-500'>
                              PDF or image (max 10MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <div>
          <label className='male-label'>Do you have children?</label>
          <select
            value={
              data?.male_has_children === undefined
                ? ''
                : data.male_has_children
                  ? 'yes'
                  : 'no'
            }
            onChange={(e) =>
              handleChange('male_has_children', e.target.value === 'yes')
            }
          >
            <option value=''>Select...</option>
            <option value='yes'>Yes</option>
            <option value='no'>No</option>
          </select>
        </div>

        {data?.male_has_children && (
          <div>
            <label className='male-label'>Children details</label>
            <textarea
              value={data?.male_children_details || ''}
              onChange={(e) =>
                handleChange('male_children_details', e.target.value)
              }
              placeholder='List children: names, ages, mother/arrangement'
            />
          </div>
        )}

        <div>
          <label className='male-label'>
            Have you impregnated anyone outside marriage?
          </label>
          <select
            value={
              data?.male_has_impregnated === undefined
                ? ''
                : data.male_has_impregnated
                  ? 'yes'
                  : 'no'
            }
            onChange={(e) =>
              handleChange('male_has_impregnated', e.target.value === 'yes')
            }
          >
            <option value=''>Select...</option>
            <option value='yes'>Yes</option>
            <option value='no'>No</option>
          </select>
        </div>
      </div>

      {/* Female - similar pattern */}
      <div className='female-section rounded-lg p-6 space-y-4'>
        <h2 className='text-2xl font-serif font-semibold female-label'>
          Bride's Personal History
        </h2>

        <div>
          <label className='female-label'>Have you been married before?</label>
          <select
            value={
              data?.female_been_married === undefined
                ? ''
                : data.female_been_married
                  ? 'yes'
                  : 'no'
            }
            onChange={(e) =>
              handleChange('female_been_married', e.target.value === 'yes')
            }
            onBlur={() => onBlurField('female_been_married')}
            className={fieldError('female_been_married') ? 'input-error' : ''}
          >
            <option value=''>Select...</option>
            <option value='yes'>Yes</option>
            <option value='no'>No</option>
          </select>
          {fieldError('female_been_married') && (
            <p className='error-message'>{fieldError('female_been_married')}</p>
          )}
        </div>

        {data?.female_been_married && (
          <>
            <div>
              <label className='female-label'>Type of previous marriage</label>
              <select
                value={data?.female_marriage_type || ''}
                onChange={(e) =>
                  handleChange('female_marriage_type', e.target.value)
                }
              >
                <option value=''>Select...</option>
                <option value='Customary'>Customary</option>
                <option value='Under The Ordinance'>
                  Under The Ordinance (Church)
                </option>
                <option value='Marriage of Convenience'>
                  Marriage of Convenience
                </option>
                <option value='Civil'>Civil Marriage</option>
              </select>
            </div>

            <div>
              <label className='female-label'>
                What happened to that marriage?
              </label>
              <select
                value={data?.female_prev_marriage_status || ''}
                onChange={(e) =>
                  handleChange('female_prev_marriage_status', e.target.value)
                }
              >
                <option value=''>Select...</option>
                <option value='Divorced'>Divorced</option>
                <option value='Separated'>Separated</option>
                <option value='Spouse Deceased'>Spouse Deceased</option>
                <option value='N/A'>N/A</option>
              </select>
            </div>

            {data?.female_prev_marriage_status === 'Divorced' && (
              <>
                <div>
                  <label className='female-label'>
                    Do you have divorce documents?
                  </label>
                  <select
                    value={
                      data?.female_has_divorce_docs === undefined
                        ? ''
                        : data.female_has_divorce_docs
                          ? 'yes'
                          : 'no'
                    }
                    onChange={(e) =>
                      handleChange(
                        'female_has_divorce_docs',
                        e.target.value === 'yes',
                      )
                    }
                  >
                    <option value=''>Select...</option>
                    <option value='yes'>Yes</option>
                    <option value='no'>No</option>
                  </select>
                </div>

                {data?.female_has_divorce_docs && (
                  <div>
                    <label className='female-label'>
                      Upload divorce documents
                    </label>
                    <div className='upload-area'>
                      <input
                        type='file'
                        accept='.pdf,.jpg,.png'
                        onChange={(e) =>
                          handleFileUpload(
                            e.target.files?.[0],
                            'female_divorce_docs_url',
                            data?.session_id,
                          )
                        }
                        className='hidden'
                        id='female-divorce'
                      />
                      <label
                        htmlFor='female-divorce'
                        className='cursor-pointer block'
                      >
                        {uploadProgress.female_divorce_docs_url ===
                          'uploading' && <span>Uploading...</span>}
                        {uploadProgress.female_divorce_docs_url === 'done' && (
                          <span className='text-success'>✓ Uploaded</span>
                        )}
                        {!uploadProgress.female_divorce_docs_url && (
                          <div>
                            <p className='text-gold font-semibold'>
                              Click to upload
                            </p>
                            <p className='text-sm text-gray-500'>
                              PDF or image (max 10MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <div>
          <label className='female-label'>Do you have children?</label>
          <select
            value={
              data?.female_has_children === undefined
                ? ''
                : data.female_has_children
                  ? 'yes'
                  : 'no'
            }
            onChange={(e) =>
              handleChange('female_has_children', e.target.value === 'yes')
            }
          >
            <option value=''>Select...</option>
            <option value='yes'>Yes</option>
            <option value='no'>No</option>
          </select>
        </div>

        {data?.female_has_children && (
          <div>
            <label className='female-label'>Children details</label>
            <textarea
              value={data?.female_children_details || ''}
              onChange={(e) =>
                handleChange('female_children_details', e.target.value)
              }
              placeholder='List children: names, ages, father/arrangement'
            />
          </div>
        )}

        <div>
          <label className='female-label'>
            Have you been pregnant outside marriage?
          </label>
          <select
            value={
              data?.female_has_been_pregnant === undefined
                ? ''
                : data.female_has_been_pregnant
                  ? 'yes'
                  : 'no'
            }
            onChange={(e) =>
              handleChange('female_has_been_pregnant', e.target.value === 'yes')
            }
          >
            <option value=''>Select...</option>
            <option value='yes'>Yes</option>
            <option value='no'>No</option>
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
