import React, { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useFormSession } from '../../hooks/useFormSession'
import { getLastCompletedSection } from '../../lib/session'
import { supabase } from '../../lib/supabase'
import { sendArkeselMessage } from '../../lib/arkesel'
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
  const [submitState, setSubmitState] = useState({
    loading: false,
    error: '',
  })

  const registration = session.formData

  const generatePastorToken = () => crypto.randomUUID()

  const getCoupleName = () =>
    [registration?.male_name, registration?.female_name]
      .filter(Boolean)
      .join(' & ')

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

    const tasks = recommendations
      .filter((recommendation) => recommendation.pastor_phone)
      .map((recommendation) => {
        const pastorName = recommendation.pastor_name || 'Pastor'
        const link = `${baseUrl}/pastor/${recommendation.token}`

        return sendArkeselMessage({
          to: recommendation.pastor_phone,
          message: `Dear ${pastorName}, ${coupleName} have registered for premarital counselling at First Love Marriage School and listed you as a recommending pastor. Please complete your pastoral recommendation here: ${link}`,
        })
      })

    return Promise.allSettled(tasks)
  }

  const sendCoupleNotifications = async () => {
    const tasks = [
      registration?.male_phone
        ? sendArkeselMessage({
            to: registration.male_phone,
            message: `Hi ${registration.male_name || 'there'}, your registration with First Love Marriage School is complete. Your pastors have been notified and a counsellor will be assigned once their recommendations are received.`,
          })
        : null,
      registration?.female_phone
        ? sendArkeselMessage({
            to: registration.female_phone,
            message: `Hi ${registration.female_name || 'there'}, your registration with First Love Marriage School is complete. Your pastors have been notified and a counsellor will be assigned once their recommendations are received.`,
          })
        : null,
    ].filter(Boolean)

    return Promise.allSettled(tasks)
  }

  // Determine which section to start at
  React.useEffect(() => {
    if (!session.loading && !showReview && !showConfirmation) {
      const lastComplete = getLastCompletedSection(session.completedSections)
      if (lastComplete === 8) {
        // All sections complete, go to review
        setShowReview(true)
      } else {
        setCurrentSection(lastComplete)
      }
    }
  }, [session.loading, session.completedSections, showReview, showConfirmation])

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
      }
    },
    [currentSection, session],
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
    return <ConfirmationScreen sessionId={sessionId} />
  }

  return (
    <div className='min-h-screen bg-cream'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Desktop Sidebar */}
          <aside className='hidden lg:block'>
            <div className='bg-white rounded-lg shadow-sm p-4 sticky top-8'>
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
              />
            ) : (
              <div>
                {/* Mobile Progress Indicator */}
                <div className='lg:hidden mb-6 bg-white rounded-lg shadow-sm p-4'>
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
