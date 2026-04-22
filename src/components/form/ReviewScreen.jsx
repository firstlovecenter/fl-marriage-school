import React from 'react'

function formatBoolean(value) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return 'Not provided'
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : 'Not provided'
  }

  if (value === true || value === false) {
    return formatBoolean(value)
  }

  return value || 'Not provided'
}

function SummaryGrid({ items }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
      {items.map((item) => (
        <div key={item.label} className='rounded-lg bg-gray-50 p-3'>
          <p className='text-xs uppercase tracking-wide text-gray-500'>
            {item.label}
          </p>
          <p className='mt-1 text-deep'>{formatValue(item.value)}</p>
        </div>
      ))}
    </div>
  )
}

export default function ReviewScreen({
  formData,
  completedSections,
  onEditSection,
  onSubmit,
  onBack,
  submitError,
  submitting,
  alreadySubmitted,
}) {
  const bothSignaturesPresent =
    formData?.male_signature_url && formData?.female_signature_url

  const sections = [
    { number: 1, title: 'Personal Details' },
    { number: 2, title: 'Personality' },
    { number: 3, title: 'Education' },
    { number: 4, title: 'Parental Awareness' },
    { number: 5, title: 'Church Information' },
    { number: 6, title: 'Personal History' },
    { number: 7, title: 'Medical Info' },
    { number: 8, title: 'Declaration' },
  ]

  return (
    <div>
      <div className='bg-white rounded-lg shadow-sm p-6 md:p-8'>
        <h1 className='text-4xl font-serif font-bold mb-2'>
          Review Your Registration
        </h1>
        <p className='text-gray-600 mb-6'>
          Please review all your information below. You can edit any section by
          clicking the "Edit" button.
        </p>

        {!bothSignaturesPresent && (
          <div className='bg-error/10 border border-error rounded-lg p-4 mb-6 text-error'>
            <strong>Signatures Required:</strong> Both partners must sign in
            Section 8 before you can submit.
          </div>
        )}

        {submitError && (
          <div className='bg-error/10 border border-error rounded-lg p-4 mb-6 text-error'>
            <strong>Submission failed:</strong> {submitError}
          </div>
        )}

        {alreadySubmitted && (
          <div className='bg-success/10 border border-success rounded-lg p-4 mb-6 text-success'>
            <strong>Registration already submitted:</strong> This application has already been sent for review. You can still inspect the saved information below.
          </div>
        )}

        {/* Sections Summary */}
        <div className='space-y-6 mb-8'>
          {sections.map((section) => (
            <div key={section.number} className='border-t pt-4'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-serif font-semibold'>
                  {section.title}
                </h2>
                <button
                  onClick={() => onEditSection(section.number)}
                  className='btn btn-sm btn-secondary'
                >
                  Edit
                </button>
              </div>

              {/* Show summary for this section */}
              {section.number === 1 && (
                <SummaryGrid
                  items={[
                    { label: 'Groom Name', value: formData?.male_name },
                    { label: 'Bride Name', value: formData?.female_name },
                    { label: 'Groom Email', value: formData?.male_email },
                    { label: 'Bride Email', value: formData?.female_email },
                    { label: 'Groom Phone', value: formData?.male_phone },
                    { label: 'Bride Phone', value: formData?.female_phone },
                    { label: 'Groom Date of Birth', value: formData?.male_dob },
                    {
                      label: 'Bride Date of Birth',
                      value: formData?.female_dob,
                    },
                    {
                      label: 'Groom Born Again',
                      value: formData?.male_born_again,
                    },
                    {
                      label: 'Bride Born Again',
                      value: formData?.female_born_again,
                    },
                    {
                      label: 'Payment Screenshot Uploaded',
                      value: Boolean(formData?.payment_screenshot_url),
                    },
                  ]}
                />
              )}

              {section.number === 2 && (
                <SummaryGrid
                  items={[
                    {
                      label: 'Groom Temperament',
                      value: formData?.male_temperament,
                    },
                    {
                      label: 'Bride Temperament',
                      value: formData?.female_temperament,
                    },
                    {
                      label: 'Groom Love Language',
                      value: formData?.male_love_language,
                    },
                    {
                      label: 'Bride Love Language',
                      value: formData?.female_love_language,
                    },
                  ]}
                />
              )}

              {section.number === 3 && (
                <SummaryGrid
                  items={[
                    {
                      label: 'Groom Education Level',
                      value: formData?.male_education_level,
                    },
                    {
                      label: 'Bride Education Level',
                      value: formData?.female_education_level,
                    },
                    {
                      label: 'Groom Occupation',
                      value: formData?.male_occupation,
                    },
                    {
                      label: 'Bride Occupation',
                      value: formData?.female_occupation,
                    },
                    { label: 'Groom Employer', value: formData?.male_employer },
                    {
                      label: 'Bride Employer',
                      value: formData?.female_employer,
                    },
                  ]}
                />
              )}

              {section.number === 4 && (
                <SummaryGrid
                  items={[
                    {
                      label: 'Groom Father Name',
                      value: formData?.male_father_name,
                    },
                    {
                      label: 'Bride Father Name',
                      value: formData?.female_father_name,
                    },
                    {
                      label: 'Groom Parental Consent',
                      value: formData?.male_parental_consent,
                    },
                    {
                      label: 'Bride Parental Consent',
                      value: formData?.female_parental_consent,
                    },
                    {
                      label: 'Groom Grew Up With Both Parents',
                      value: formData?.male_grew_up_with_both_parents,
                    },
                    {
                      label: 'Bride Grew Up With Both Parents',
                      value: formData?.female_grew_up_with_both_parents,
                    },
                  ]}
                />
              )}

              {section.number === 5 && (
                <SummaryGrid
                  items={[
                    {
                      label: 'Groom Church',
                      value: formData?.male_church_name,
                    },
                    {
                      label: 'Bride Church',
                      value: formData?.female_church_name,
                    },
                    {
                      label: 'Groom Pastor',
                      value: formData?.male_pastor_name,
                    },
                    {
                      label: 'Bride Pastor',
                      value: formData?.female_pastor_name,
                    },
                    {
                      label: 'Groom Pastor Phone',
                      value: formData?.male_pastor_phone,
                    },
                    {
                      label: 'Bride Pastor Phone',
                      value: formData?.female_pastor_phone,
                    },
                  ]}
                />
              )}

              {section.number === 6 && (
                <SummaryGrid
                  items={[
                    {
                      label: 'Groom Previously Married',
                      value: formData?.male_been_married,
                    },
                    {
                      label: 'Bride Previously Married',
                      value: formData?.female_been_married,
                    },
                    {
                      label: 'Groom Has Children',
                      value: formData?.male_has_children,
                    },
                    {
                      label: 'Bride Has Children',
                      value: formData?.female_has_children,
                    },
                    {
                      label: 'Groom Divorce Docs Uploaded',
                      value: Boolean(formData?.male_divorce_docs_url),
                    },
                    {
                      label: 'Bride Divorce Docs Uploaded',
                      value: Boolean(formData?.female_divorce_docs_url),
                    },
                  ]}
                />
              )}

              {section.number === 7 && (
                <SummaryGrid
                  items={[
                    {
                      label: 'Groom Medical Reports',
                      value: formData?.male_medical_report_urls?.length || 0,
                    },
                    {
                      label: 'Bride Medical Reports',
                      value: formData?.female_medical_report_urls?.length || 0,
                    },
                  ]}
                />
              )}

              {section.number === 8 && (
                <SummaryGrid
                  items={[
                    {
                      label: 'Groom Signature Captured',
                      value: Boolean(formData?.male_signature_url),
                    },
                    {
                      label: 'Bride Signature Captured',
                      value: Boolean(formData?.female_signature_url),
                    },
                    {
                      label: 'Declaration Agreed At',
                      value: formData?.declaration_agreed_at,
                    },
                  ]}
                />
              )}

              {!completedSections.includes(section.number) && (
                <p className='mt-3 text-sm text-error'>
                  This section is not fully complete yet.
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className='flex gap-4 pt-6 border-t'>
          <button onClick={onBack} className='btn btn-secondary flex-1'>
            Back
          </button>
          {alreadySubmitted ? (
            <div className='flex-1 rounded-lg border border-success bg-success/10 px-4 py-3 text-center font-semibold text-success'>
              Already Submitted
            </div>
          ) : (
            <button
              onClick={onSubmit}
              disabled={!bothSignaturesPresent || submitting}
              className={`btn flex-1 ${
                bothSignaturesPresent && !submitting
                  ? 'btn-primary'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
