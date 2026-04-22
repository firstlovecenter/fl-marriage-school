import React from 'react'

export default function S3Education({ formData, onNext, onBack, isSaving }) {
  const [data, setData] = React.useState(formData)

  const handleChange = (field, value) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = []
    if (!data?.male_education_level?.trim()) errors.push('Male education level')
    if (!data?.female_education_level?.trim())
      errors.push('Female education level')
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
          Educational & Work Background
        </h1>
        <p className='section-intro'>
          Information about your education and career helps us understand your
          aspirations and life goals as a couple.
        </p>
      </div>

      {/* Male */}
      <div className='male-section rounded-lg p-6 space-y-4'>
        <h2 className='text-2xl font-serif font-semibold male-label'>
          Groom's Education & Work
        </h2>

        <div>
          <label className='male-label'>Education Level *</label>
          <select
            value={data?.male_education_level || ''}
            onChange={(e) =>
              handleChange('male_education_level', e.target.value)
            }
          >
            <option value=''>Select...</option>
            <option value='Primary'>Primary</option>
            <option value='Secondary'>Secondary / GCE</option>
            <option value='Tertiary'>Tertiary / Diploma</option>
            <option value='University'>University Degree</option>
            <option value='Postgraduate'>Postgraduate</option>
          </select>
        </div>

        <div>
          <label className='male-label'>Schools Attended</label>
          <textarea
            value={data?.male_schools_attended || ''}
            onChange={(e) =>
              handleChange('male_schools_attended', e.target.value)
            }
            placeholder='List the schools you attended'
          />
        </div>

        <div>
          <label className='male-label'>Current Occupation</label>
          <input
            type='text'
            value={data?.male_occupation || ''}
            onChange={(e) => handleChange('male_occupation', e.target.value)}
            placeholder='Your job title or profession'
          />
        </div>

        <div>
          <label className='male-label'>Employer / Business Name</label>
          <input
            type='text'
            value={data?.male_employer || ''}
            onChange={(e) => handleChange('male_employer', e.target.value)}
          />
        </div>

        <div>
          <label className='male-label'>How long have you worked there?</label>
          <input
            type='text'
            value={data?.male_employer_duration || ''}
            onChange={(e) =>
              handleChange('male_employer_duration', e.target.value)
            }
            placeholder='e.g., 2 years, 6 months'
          />
        </div>

        <div>
          <label className='male-label'>Work Contact Number</label>
          <input
            type='tel'
            value={data?.male_contact_number || ''}
            onChange={(e) =>
              handleChange('male_contact_number', e.target.value)
            }
          />
        </div>
      </div>

      {/* Female */}
      <div className='female-section rounded-lg p-6 space-y-4'>
        <h2 className='text-2xl font-serif font-semibold female-label'>
          Bride's Education & Work
        </h2>

        <div>
          <label className='female-label'>Education Level *</label>
          <select
            value={data?.female_education_level || ''}
            onChange={(e) =>
              handleChange('female_education_level', e.target.value)
            }
          >
            <option value=''>Select...</option>
            <option value='Primary'>Primary</option>
            <option value='Secondary'>Secondary / GCE</option>
            <option value='Tertiary'>Tertiary / Diploma</option>
            <option value='University'>University Degree</option>
            <option value='Postgraduate'>Postgraduate</option>
          </select>
        </div>

        <div>
          <label className='female-label'>Schools Attended</label>
          <textarea
            value={data?.female_schools_attended || ''}
            onChange={(e) =>
              handleChange('female_schools_attended', e.target.value)
            }
            placeholder='List the schools you attended'
          />
        </div>

        <div>
          <label className='female-label'>Current Occupation</label>
          <input
            type='text'
            value={data?.female_occupation || ''}
            onChange={(e) => handleChange('female_occupation', e.target.value)}
            placeholder='Your job title or profession'
          />
        </div>

        <div>
          <label className='female-label'>Employer / Business Name</label>
          <input
            type='text'
            value={data?.female_employer || ''}
            onChange={(e) => handleChange('female_employer', e.target.value)}
          />
        </div>

        <div>
          <label className='female-label'>
            How long have you worked there?
          </label>
          <input
            type='text'
            value={data?.female_employer_duration || ''}
            onChange={(e) =>
              handleChange('female_employer_duration', e.target.value)
            }
            placeholder='e.g., 2 years, 6 months'
          />
        </div>

        <div>
          <label className='female-label'>Work Contact Number</label>
          <input
            type='tel'
            value={data?.female_contact_number || ''}
            onChange={(e) =>
              handleChange('female_contact_number', e.target.value)
            }
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
