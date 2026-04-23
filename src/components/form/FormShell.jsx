import React, { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useFormSession } from '../../hooks/useFormSession'
import { getLastCompletedSection } from '../../lib/session'
import { supabase } from '../../lib/supabase'
import { sendSmsMessage } from '../../lib/mnotify'
import { sendEmailNotification } from '../../lib/emailNotifications'
import { syncToGoogleSheets } from '../../lib/sheets'

// Section components (we'll create these next)
import S1PersonalDetails from './sections/S1_PersonalDetails'
import S2Personality from './sections/S2_Personality'
import S3Education from './sections/S3_Education'
import S4ParentalAwareness from './sections/S4_ParentalAwareness'
import S5ChurchInfo from './sections/S5_ChurchInfo'
import S6PersonalHistory from './sections/S6_PersonalHistory'
import S7Medical from './sections/S7_Medical'
import S8Declaration from './sections/S8_Declaration'
import ReviewScreen from './ReviewScreen'
import ConfirmationScreen from './ConfirmationScreen'

const SECTIONS = [
  { number: 1, title: 'Personal Details', component: S1PersonalDetails },
  { number: 2, title: 'Personality', component: S2Personality },
  { number: 3, title: 'Education', component: S3Education },
  { number: 4, title: 'Parental Awareness', component: S4ParentalAwareness },
  { number: 5, title: 'Church Information', component: S5ChurchInfo },
  { number: 6, title: 'Personal History', component: S6PersonalHistory },
  { number: 7, title: 'Medical Info', component: S7Medical },
  { number: 8, title: 'Declaration', component: S8Declaration },
]

export default function FormShell() {
  const { sessionId } = useParams()
  const session = useFormSession(sessionId)
  const [currentSection, setCurrentSection] = useState(1)
  const [showReview, setShowReview] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const hasAutoRoutedRef = React.useRef(false)
  const [submitState, setSubmitState] = useState({
    loading: false,
    error: '',
  })

  const registration = session.formData
  const alreadySubmitted =
    Boolean(registration?.submitted_at) || session.sessionStatus === 'submitted'

  const generatePastorToken = () => crypto.randomUUID()

  const getCoupleName = () =>
    [registration?.male_name, registration?.female_name]
      .filter(Boolean)
      .join(' & ')

  const referenceCode = session.sessionCode || 'Loading...'

  const getStartNotificationFlagKey = () =>
    sessionId ? `flms_start_notified_${sessionId}` : ''

  const hasSentStartNotification = () => {
    const key = getStartNotificationFlagKey()
    return key ? localStorage.getItem(key) === '1' : false
  }

  const markStartNotificationSent = () => {
    const key = getStartNotificationFlagKey()
    if (key) {
      localStorage.setItem(key, '1')
    }
  }

  const upsertPastorRecommendations = async () => {
    const { data: existingRecommendations, error: existingError } =
      await supabase
        .from('pastor_recommendations')
        .select('*')
        .eq('registration_id', session.registrationId)

    if (existingError) {
      throw new Error(existingError.message)
    }

    if (existingRecommendations?.length) {
      return existingRecommendations
    }

    const maleToken = generatePastorToken()
    const femaleToken = generatePastorToken()
    const malePastorPhone = registration?.male_pastor_phone
    const femalePastorPhone = registration?.female_pastor_phone
    const samePastor =
      malePastorPhone &&
      femalePastorPhone &&
      malePastorPhone.trim() === femalePastorPhone.trim()

    const rows = [
      {
        registration_id: session.registrationId,
        token: maleToken,
        partner: 'male',
        pastor_name: registration?.male_pastor_name,
        pastor_phone: malePastorPhone,
        pastor_email: registration?.male_pastor_email,
      },
      ...(!samePastor
        ? [
            {
              registration_id: session.registrationId,
              token: femaleToken,
              partner: 'female',
              pastor_name: registration?.female_pastor_name,
              pastor_phone: femalePastorPhone,
              pastor_email: registration?.female_pastor_email,
            },
          ]
        : []),
    ]

    const { data, error } = await supabase
      .from('pastor_recommendations')
      .insert(rows)
      .select('*')

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  const sendPastorNotifications = async (recommendations) => {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin
    const coupleName = getCoupleName()

    const smsTasks = recommendations
      .filter((recommendation) => recommendation.pastor_phone)
      .map((recommendation) => {
        const pastorName = recommendation.pastor_name || 'Pastor'
        const link = `${baseUrl}/pastor/${recommendation.token}`

        return sendSmsMessage({
          to: recommendation.pastor_phone,
          message: `Dear ${pastorName}, ${coupleName} have registered for premarital counselling at First Love Marriage School and listed you as a recommending pastor. Kindly complete your pastoral recommendation here: ${link}`,
        })
      })

    const emailTasks = recommendations
      .filter((recommendation) => recommendation.pastor_email)
      .map((recommendation) => {
        const pastorName = recommendation.pastor_name || 'Pastor'
        const link = `${baseUrl}/pastor/${recommendation.token}`

        return sendEmailNotification({
          to: recommendation.pastor_email,
          subject: 'FLMS Pastoral Recommendation Request',
          text: `Dear ${pastorName}, ${coupleName} have registered for premarital counselling at First Love Marriage School and listed you as a recommending pastor. Kindly complete your pastoral recommendation here: ${link}`,
          html: `<p>Dear ${pastorName},</p><p>${coupleName} have registered for premarital counselling at First Love Marriage School and listed you as a recommending pastor.</p><p>Please complete your pastoral recommendation here:</p><p><a href="${link}">${link}</a></p>`,
        })
      })

    return Promise.allSettled([...smsTasks, ...emailTasks])
  }

  const sendCoupleNotifications = async () => {
    const tasks = [
      registration?.male_phone
        ? sendSmsMessage({
            to: registration.male_phone,
            message: `Hi ${registration.male_name || 'there'}, your First Love Marriage School registration has been received. Your reference code is ${session.sessionCode}. Keep it to resume or track your submission.`,
          })
        : null,
      registration?.female_phone
        ? sendSmsMessage({
            to: registration.female_phone,
            message: `Hi ${registration.female_name || 'there'}, your First Love Marriage School registration has been received. Your reference code is ${session.sessionCode}. Keep it to resume or track your submission.`,
          })
        : null,
    ].filter(Boolean)

    return Promise.allSettled(tasks)
  }

  const sendStartNotifications = async (sectionData) => {
    if (!session.sessionCode) return false

    const maleName =
      sectionData?.male_name || registration?.male_name || 'there'
    const femaleName =
      sectionData?.female_name || registration?.female_name || 'there'
    const malePhone = sectionData?.male_phone || registration?.male_phone
    const femalePhone = sectionData?.female_phone || registration?.female_phone
    const maleEmail = sectionData?.male_email || registration?.male_email
    const femaleEmail = sectionData?.female_email || registration?.female_email

    const smsTasks = [
      malePhone
        ? sendSmsMessage({
            to: malePhone,
            message: `Hi ${maleName}, your FLMS registration has started. Your reference code is ${session.sessionCode}. We'll send important updates by SMS to this number.`,
          })
        : null,
      femalePhone
        ? sendSmsMessage({
            to: femalePhone,
            message: `Hi ${femaleName}, your FLMS registration has started. Your reference code is ${session.sessionCode}. We'll send important updates by SMS to this number.`,
          })
        : null,
    ].filter(Boolean)

    const emailTasks = [
      maleEmail
        ? sendEmailNotification({
            to: maleEmail,
            subject: 'FLMS Registration Started',
            text: `Hi ${maleName}, your First Love Marriage School registration has started. Your reference code is ${session.sessionCode}. Keep this code to resume your form anytime.`,
            html: `<p>Hi ${maleName},</p><p>Your First Love Marriage School registration has started.</p><p><strong>Reference code:</strong> ${session.sessionCode}</p><p>Keep this code to resume your form anytime.</p>`,
          })
        : null,
      femaleEmail
        ? sendEmailNotification({
            to: femaleEmail,
            subject: 'FLMS Registration Started',
            text: `Hi ${femaleName}, your First Love Marriage School registration has started. Your reference code is ${session.sessionCode}. Keep this code to resume your form anytime.`,
            html: `<p>Hi ${femaleName},</p><p>Your First Love Marriage School registration has started.</p><p><strong>Reference code:</strong> ${session.sessionCode}</p><p>Keep this code to resume your form anytime.</p>`,
          })
        : null,
    ].filter(Boolean)

    await Promise.allSettled([...smsTasks, ...emailTasks])
    return true
  }

  // Reset one-time auto-routing when the session changes.
  React.useEffect(() => {
    hasAutoRoutedRef.current = false
  }, [sessionId])

  // Determine which section to start at (once per session load).
  React.useEffect(() => {
    if (!session.loading && !showConfirmation && !hasAutoRoutedRef.current) {
      if (alreadySubmitted) {
        setShowReview(false)
        setShowConfirmation(true)
        hasAutoRoutedRef.current = true
        return
      }

      const lastComplete = getLastCompletedSection(session.completedSections)
      if (lastComplete === 8) {
        // All sections complete, go to review
        setShowReview(true)
      } else {
        setCurrentSection(lastComplete)
      }

      hasAutoRoutedRef.current = true
    }
  }, [
    alreadySubmitted,
    session.loading,
    session.completedSections,
    showConfirmation,
  ])

  const handleNext = useCallback(
    async (sectionData) => {
      // Save current section
      const saved = await session.saveSection(currentSection, sectionData)
      if (!saved) return

      if (currentSection === 8) {
        // After section 8, go to review
        setShowReview(true)
      } else {
        // Move to next section
        setCurrentSection(currentSection + 1)

        if (currentSection === 1 && !hasSentStartNotification()) {
          void sendStartNotifications(sectionData)
            .then((didAttempt) => {
              if (didAttempt) {
                markStartNotificationSent()
              }
            })
            .catch((error) => {
              console.error('Start notification failed:', error)
              markStartNotificationSent()
            })
        }
      }
    },
    [currentSection, registration, session, sessionId],
  )

  const handleBack = useCallback(() => {
    if (showReview) {
      setShowReview(false)
      setCurrentSection(8)
    } else if (currentSection > 1) {
      setCurrentSection(currentSection - 1)
    }
  }, [currentSection, showReview])

  const handleEditSection = useCallback((sectionNumber) => {
    setShowReview(false)
    setCurrentSection(sectionNumber)
  }, [])

  const handleSubmit = async () => {
    if (!session.registrationId) {
      setSubmitState({
        loading: false,
        error: 'Registration record is missing. Please refresh and try again.',
      })
      return
    }

    setSubmitState({ loading: true, error: '' })

    try {
      const submittedAt = new Date().toISOString()

      const { error: sessionError } = await supabase
        .from('sessions')
        .update({ status: 'submitted' })
        .eq('id', sessionId)

      if (sessionError) {
        throw new Error(sessionError.message)
      }

      const { error: registrationError } = await supabase
        .from('registrations')
        .update({ submitted_at: submittedAt })
        .eq('id', session.registrationId)

      if (registrationError) {
        throw new Error(registrationError.message)
      }

      const recommendations = await upsertPastorRecommendations()

      await Promise.allSettled([
        sendPastorNotifications(recommendations),
        sendCoupleNotifications(),
        syncToGoogleSheets(session.registrationId),
      ])

      setShowConfirmation(true)
    } catch (error) {
      console.error('Final submission failed:', error)
      setSubmitState({
        loading: false,
        error:
          error.message ||
          'We could not complete your submission. Please try again.',
      })
      return
    }

    setSubmitState({ loading: false, error: '' })
  }

  if (session.loading) {
    return (
      <div className='min-h-screen bg-cream flex items-center justify-center'>
        <div className='text-center'>
          <div className='spinner mb-4 h-8 w-8 border-4 border-gold border-t-transparent rounded-full mx-auto'></div>
          <p>Loading your registration...</p>
        </div>
      </div>
    )
  }

  if (showConfirmation) {
    return <ConfirmationScreen sessionCode={session.sessionCode} />
  }

  return (
    <div className='min-h-screen bg-cream'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Desktop Sidebar */}
          <aside className='hidden lg:block'>
            <div className='bg-white rounded-lg shadow-sm p-4 sticky top-8'>
              <div className='mb-4 rounded-lg border border-gold/40 bg-gold/10 p-3'>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-600'>
                  Reference Code
                </p>
                <p className='mt-1 font-mono text-lg font-bold text-gold'>
                  {referenceCode}
                </p>
                <p className='mt-1 text-xs text-gray-600'>
                  Keep this code. You can use it to resume or track this
                  registration.
                </p>
              </div>

              <h3 className='font-serif font-bold text-lg mb-4'>Progress</h3>
              <nav className='space-y-2'>
                {SECTIONS.map((section) => (
                  <button
                    key={section.number}
                    onClick={() => {
                      if (showReview) {
                        handleEditSection(section.number)
                      } else {
                        setCurrentSection(section.number)
                      }
                    }}
                    className={`progress-item w-full text-left ${
                      session.completedSections.includes(section.number)
                        ? 'complete'
                        : currentSection === section.number
                          ? 'in-progress'
                          : 'incomplete'
                    }`}
                  >
                    <span className='progress-icon'>
                      {session.completedSections.includes(section.number) ? (
                        <span className='text-lg'>●</span>
                      ) : currentSection === section.number ? (
                        <span className='text-lg'>◑</span>
                      ) : (
                        <span className='text-lg'>○</span>
                      )}
                    </span>
                    <span className='truncate'>{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className='lg:col-span-3'>
            {showReview ? (
              <ReviewScreen
                formData={session.formData}
                completedSections={session.completedSections}
                onEditSection={handleEditSection}
                onSubmit={handleSubmit}
                onBack={handleBack}
                submitError={submitState.error}
                submitting={submitState.loading}
                alreadySubmitted={alreadySubmitted}
              />
            ) : (
              <div>
                {/* Mobile Progress Indicator */}
                <div className='lg:hidden mb-6 bg-white rounded-lg shadow-sm p-4'>
                  <div className='mb-4 rounded-lg border border-gold/40 bg-gold/10 p-3'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-gray-600'>
                      Reference Code
                    </p>
                    <p className='mt-1 font-mono text-base font-bold text-gold'>
                      {referenceCode}
                    </p>
                  </div>

                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-semibold'>
                      Section {currentSection} of 8
                    </span>
                    <span className='text-xs text-gray-500'>
                      {session.completedSections.length +
                        (currentSection > session.completedSections.length ||
                        session.completedSections.includes(currentSection)
                          ? 0
                          : 1)}
                      /8 complete
                    </span>
                  </div>
                  <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-gold h-2 rounded-full transition-all duration-300'
                      style={{
                        width: `${(session.completedSections.length / 8) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Section Content */}
                <div className='bg-white rounded-lg shadow-sm p-6 md:p-8'>
                  {(() => {
                    const section = SECTIONS.find(
                      (s) => s.number === currentSection,
                    )
                    if (!section) return null
                    const SectionComponent = section.component
                    return (
                      <SectionComponent
                        formData={session.formData}
                        onNext={handleNext}
                        onBack={handleBack}
                        isFirstSection={currentSection === 1}
                        isSaving={session.isSaving}
                        saveError={session.saveError}
                      />
                    )
                  })()}
                </div>

                {/* Save indicator */}
                {session.isSaving && (
                  <div className='mt-4 text-center text-sm text-gold font-medium'>
                    <span className='spinner inline-block mr-2 h-4 w-4 border-2 border-gold border-t-transparent rounded-full'></span>
                    Saving...
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
