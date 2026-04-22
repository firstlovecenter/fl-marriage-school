import React from 'react'

function DetailSection({ title, children }) {
  return (
    <section className='rounded-lg border border-gray-200 bg-white p-4'>
      <h3 className='text-lg font-serif font-semibold mb-3'>{title}</h3>
      {children}
    </section>
  )
}

function DetailGrid({ items }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
      {items.map((item) => (
        <div key={item.label} className='rounded-lg bg-gray-50 p-3'>
          <p className='text-xs uppercase tracking-wide text-gray-500'>
            {item.label}
          </p>
          <p className='mt-1 text-deep break-words'>
            {item.value || 'Not provided'}
          </p>
        </div>
      ))}
    </div>
  )
}

export default function CoupleDetail({
  registration,
  onClose,
  onTogglePaymentVerified,
}) {
  if (!registration) return null

  const recommendations = registration.pastor_recommendations || []

  return (
    <div className='fixed inset-0 z-50 bg-black/40 overflow-y-auto p-4'>
      <div className='max-w-5xl mx-auto rounded-xl bg-cream shadow-xl'>
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
          <div>
            <h2 className='text-2xl font-serif font-bold'>
              {registration.male_name || 'Groom'} &{' '}
              {registration.female_name || 'Bride'}
            </h2>
            <p className='text-sm text-gray-600'>
              Session code: {registration.session_code || 'Unavailable'}
            </p>
          </div>
          <button onClick={onClose} className='btn btn-secondary btn-sm'>
            Close
          </button>
        </div>

        <div className='space-y-4 p-6'>
          <DetailSection title='Personal Details'>
            <DetailGrid
              items={[
                { label: 'Groom Email', value: registration.male_email },
                { label: 'Bride Email', value: registration.female_email },
                { label: 'Groom Phone', value: registration.male_phone },
                { label: 'Bride Phone', value: registration.female_phone },
                {
                  label: 'Groom Address',
                  value: registration.male_residential_address,
                },
                {
                  label: 'Bride Address',
                  value: registration.female_residential_address,
                },
              ]}
            />
          </DetailSection>

          <DetailSection title='Church Information'>
            <DetailGrid
              items={[
                { label: 'Groom Church', value: registration.male_church_name },
                {
                  label: 'Bride Church',
                  value: registration.female_church_name,
                },
                { label: 'Groom Pastor', value: registration.male_pastor_name },
                {
                  label: 'Bride Pastor',
                  value: registration.female_pastor_name,
                },
                {
                  label: 'Groom Pastor Phone',
                  value: registration.male_pastor_phone,
                },
                {
                  label: 'Bride Pastor Phone',
                  value: registration.female_pastor_phone,
                },
              ]}
            />
          </DetailSection>

          <DetailSection title='Payment Verification'>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <div>
                <p className='text-sm text-gray-600'>
                  Current status:{' '}
                  {registration.payment_verified ? 'Verified' : 'Not verified'}
                </p>
                {registration.payment_screenshot_url && (
                  <a
                    href={registration.payment_screenshot_url}
                    target='_blank'
                    rel='noreferrer'
                    className='text-sm text-gold underline'
                  >
                    Open payment screenshot
                  </a>
                )}
              </div>
              <button
                onClick={() =>
                  onTogglePaymentVerified(
                    registration.id,
                    !registration.payment_verified,
                  )
                }
                className='btn btn-primary'
              >
                Mark as{' '}
                {registration.payment_verified ? 'Unverified' : 'Verified'}
              </button>
            </div>
          </DetailSection>

          <DetailSection title='Pastor Recommendations'>
            <div className='space-y-3'>
              {recommendations.length === 0 && (
                <p className='text-sm text-gray-600'>
                  No pastor recommendations yet.
                </p>
              )}
              {recommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className='rounded-lg border border-gray-200 bg-gray-50 p-4'
                >
                  <div className='flex items-center justify-between gap-4'>
                    <div>
                      <p className='font-semibold'>
                        {recommendation.partner === 'male'
                          ? 'Groom Pastor'
                          : 'Bride Pastor'}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {recommendation.pastor_name || 'Pastor'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        recommendation.status === 'submitted'
                          ? 'bg-success/10 text-success'
                          : recommendation.status === 'expired'
                            ? 'bg-error/10 text-error'
                            : 'bg-gold/10 text-gold'
                      }`}
                    >
                      {recommendation.status}
                    </span>
                  </div>
                  <div className='mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
                    <div>
                      <p className='text-xs uppercase tracking-wide text-gray-500'>
                        Readiness Assessment
                      </p>
                      <p>
                        {recommendation.readiness_assessment ||
                          'Awaiting response'}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs uppercase tracking-wide text-gray-500'>
                        Concerns
                      </p>
                      <p>{recommendation.concerns || 'None provided'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  )
}
