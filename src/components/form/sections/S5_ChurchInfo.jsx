import React from 'react'

export default function S5ChurchInfo({ formData, onNext, onBack, isSaving }) {
  const [data, setData] = React.useState(formData)

  const handleChange = (field, value) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = []
    if (!data?.male_church_name?.trim()) errors.push('Male church name')
    if (!data?.female_church_name?.trim()) errors.push('Female church name')
    if (!data?.male_pastor_name?.trim()) errors.push('Male pastor name')
    if (!data?.female_pastor_name?.trim()) errors.push('Female pastor name')
    if (errors.length > 0) {
      alert(`Please fill in: ${errors.join(', ')}`)
      return
    }
    await onNext?.(data)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      <div>
        <h1 className='text-3xl font-serif font-bold mb-2'>
          Church Information
        </h1>
        <p className='section-intro'>
          We'll contact your pastors to gather their pastoral recommendations.
          Make sure the information is correct.
        </p>
      </div>

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
            placeholder='Name of your church'
          />
        </div>

        <div className='form-grid'>
          <div>
            <label className='male-label'>Pastor's Name *</label>
            <input
              type='text'
              value={data?.male_pastor_name || ''}
              onChange={(e) => handleChange('male_pastor_name', e.target.value)}
              placeholder='Full name of your pastor'
            />
          </div>

          <div>
            <label className='male-label'>Pastor's Phone *</label>
            <input
              type='tel'
              value={data?.male_pastor_phone || ''}
              onChange={(e) =>
                handleChange('male_pastor_phone', e.target.value)
              }
              placeholder='+233 5XX XXX XXX'
            />
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
            placeholder='Name of your church'
          />
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
              placeholder='Full name of your pastor'
            />
          </div>

          <div>
            <label className='female-label'>Pastor's Phone *</label>
            <input
              type='tel'
              value={data?.female_pastor_phone || ''}
              onChange={(e) =>
                handleChange('female_pastor_phone', e.target.value)
              }
              placeholder='+233 5XX XXX XXX'
            />
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
