import React, { useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { supabase } from '../../../lib/supabase'

export default function S8Declaration({ formData, onNext, onBack, isSaving }) {
  const [data, setData] = React.useState(formData)
  const maleSignatureRef = useRef(null)
  const femaleSignatureRef = useRef(null)
  const [signingProgress, setSigningProgress] = React.useState({})
  const [agreed, setAgreed] = React.useState(false)
  const [errors, setErrors] = React.useState({})
  const [submitAttempted, setSubmitAttempted] = React.useState(false)

  useEffect(() => {
    setData(formData || {})
    setAgreed(Boolean(formData?.declaration_agreed_at))
    setSigningProgress({
      male_signature_url: formData?.male_signature_url ? 'done' : undefined,
      female_signature_url: formData?.female_signature_url ? 'done' : undefined,
    })

    if (maleSignatureRef.current) maleSignatureRef.current.clear()
    if (femaleSignatureRef.current) femaleSignatureRef.current.clear()
  }, [formData])

  const saveSignature = async (canvasRef, field, sessionId) => {
    if (!canvasRef.current || canvasRef.current.isEmpty()) {
      setErrors((prev) => ({
        ...prev,
        [field]: 'Please sign before saving your signature',
      }))
      return
    }

    try {
      setSigningProgress((prev) => ({ ...prev, [field]: 'uploading' }))

      // Export canvas to blob
      canvasRef.current.getCanvas().toBlob(async (blob) => {
        const ext = 'png'
        const filename = `${sessionId}/${field}-${Date.now()}.${ext}`

        const { error } = await supabase.storage
          .from('flms-uploads')
          .upload(filename, blob, { cacheControl: '3600', upsert: false })

        if (error) throw error

        const {
          data: { publicUrl },
        } = supabase.storage.from('flms-uploads').getPublicUrl(filename)
        setData((prev) => ({ ...prev, [field]: publicUrl }))
        setSigningProgress((prev) => ({ ...prev, [field]: 'done' }))
        setErrors((prev) => ({ ...prev, [field]: '' }))
      })
    } catch (err) {
      console.error('Signature upload error:', err)
      setSigningProgress((prev) => ({ ...prev, [field]: 'error' }))
      setErrors((prev) => ({
        ...prev,
        [field]: 'Failed to upload signature. Please try again.',
      }))
    }
  }

  const validateAll = () => {
    const nextErrors = {
      male_signature_url: data?.male_signature_url
        ? ''
        : 'Groom must sign before continuing',
      female_signature_url: data?.female_signature_url
        ? ''
        : 'Bride must sign before continuing',
      agreed: agreed
        ? ''
        : 'You must agree to the declaration before continuing',
    }
    setErrors((prev) => ({ ...prev, ...nextErrors }))
    return nextErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setSubmitAttempted(true)
    const nextErrors = validateAll()
    if (Object.values(nextErrors).some(Boolean)) {
      return
    }

    await onNext?.({
      ...data,
      declaration_agreed_at: new Date().toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className='space-y-8'>
      <div>
        <h1 className='text-3xl font-serif font-bold mb-2'>
          Declaration & Signatures
        </h1>
        <p className='section-intro'>
          By signing below, you confirm that all information provided is true
          and you're ready for premarital counselling.
        </p>
      </div>

      {submitAttempted && Object.values(errors).some(Boolean) && (
        <div className='bg-error/10 border border-error text-error rounded-lg p-4'>
          Please complete all required declaration steps before continuing.
        </div>
      )}

      {/* Declaration Text */}
      <div className='section'>
        <h3 className='text-lg font-serif font-semibold mb-4'>Declaration</h3>
        <div className='bg-gray-50 p-4 rounded border border-gray-300 max-h-48 overflow-y-auto text-sm leading-relaxed'>
          <p className='mb-3'>
            We, the undersigned couple, hereby declare that:
          </p>
          <ul className='list-disc list-inside space-y-2'>
            <li>
              All information provided in this registration form is true and
              accurate to the best of our knowledge.
            </li>
            <li>
              We are entering into marriage of our own free will and with full
              consent of our families.
            </li>
            <li>
              We understand the purpose and importance of premarital
              counselling.
            </li>
            <li>We commit to attend all counselling sessions as scheduled.</li>
            <li>
              We are both in good mental and spiritual health for marriage.
            </li>
            <li>
              There are no hidden facts or information that would affect this
              registration.
            </li>
          </ul>
          <p className='mt-3'>
            We hereby authorize First Love Marriage School to process our
            application and contact our pastoral recommenders.
          </p>
        </div>
      </div>

      {/* Male Signature */}
      <div className='male-section rounded-lg p-6 space-y-4'>
        <h2 className='text-2xl font-serif font-semibold male-label'>
          Groom's Signature
        </h2>
        <p className='text-sm text-gray-600'>
          {data?.male_name || 'Groom'}, please sign in the box below
        </p>

        <div className='border-2 border-deep rounded-lg overflow-hidden bg-white'>
          {data?.male_signature_url ? (
            <div className='flex min-h-[200px] items-center justify-center bg-gray-50 p-4'>
              <img
                src={data.male_signature_url}
                alt='Saved groom signature'
                className='max-h-44 w-full object-contain'
              />
            </div>
          ) : (
            <SignatureCanvas
              ref={maleSignatureRef}
              canvasProps={{ width: 500, height: 200, className: 'w-full' }}
              penColor='#1C1612'
            />
          )}
        </div>

        <div className='flex gap-2'>
          <button
            type='button'
            onClick={() => {
              maleSignatureRef.current?.clear()
              setSigningProgress((prev) => ({
                ...prev,
                male_signature_url: undefined,
              }))
              setData((prev) => ({ ...prev, male_signature_url: undefined }))
              setErrors((prev) => ({ ...prev, male_signature_url: '' }))
            }}
            className='btn btn-secondary text-sm'
          >
            Clear Signature
          </button>

          <button
            type='button'
            onClick={() =>
              saveSignature(
                maleSignatureRef,
                'male_signature_url',
                data?.session_id,
              )
            }
            disabled={signingProgress.male_signature_url === 'uploading'}
            className={`btn text-sm ${
              signingProgress.male_signature_url === 'done'
                ? 'btn-success'
                : 'btn-primary'
            }`}
          >
            {signingProgress.male_signature_url === 'uploading' && 'Saving...'}
            {signingProgress.male_signature_url === 'done' && '✓ Signed'}
            {!signingProgress.male_signature_url && 'Save Signature'}
          </button>
        </div>
        {errors.male_signature_url && (
          <p className='error-message'>{errors.male_signature_url}</p>
        )}
      </div>

      {/* Female Signature */}
      <div className='female-section rounded-lg p-6 space-y-4'>
        <h2 className='text-2xl font-serif font-semibold female-label'>
          Bride's Signature
        </h2>
        <p className='text-sm text-gray-600'>
          {data?.female_name || 'Bride'}, please sign in the box below
        </p>

        <div className='border-2 border-deep rounded-lg overflow-hidden bg-white'>
          {data?.female_signature_url ? (
            <div className='flex min-h-[200px] items-center justify-center bg-gray-50 p-4'>
              <img
                src={data.female_signature_url}
                alt='Saved bride signature'
                className='max-h-44 w-full object-contain'
              />
            </div>
          ) : (
            <SignatureCanvas
              ref={femaleSignatureRef}
              canvasProps={{ width: 500, height: 200, className: 'w-full' }}
              penColor='#1C1612'
            />
          )}
        </div>

        <div className='flex gap-2'>
          <button
            type='button'
            onClick={() => {
              femaleSignatureRef.current?.clear()
              setSigningProgress((prev) => ({
                ...prev,
                female_signature_url: undefined,
              }))
              setData((prev) => ({ ...prev, female_signature_url: undefined }))
              setErrors((prev) => ({ ...prev, female_signature_url: '' }))
            }}
            className='btn btn-secondary text-sm'
          >
            Clear Signature
          </button>

          <button
            type='button'
            onClick={() =>
              saveSignature(
                femaleSignatureRef,
                'female_signature_url',
                data?.session_id,
              )
            }
            disabled={signingProgress.female_signature_url === 'uploading'}
            className={`btn text-sm ${
              signingProgress.female_signature_url === 'done'
                ? 'btn-success'
                : 'btn-primary'
            }`}
          >
            {signingProgress.female_signature_url === 'uploading' &&
              'Saving...'}
            {signingProgress.female_signature_url === 'done' && '✓ Signed'}
            {!signingProgress.female_signature_url && 'Save Signature'}
          </button>
        </div>
        {errors.female_signature_url && (
          <p className='error-message'>{errors.female_signature_url}</p>
        )}
      </div>

      {/* Agreement Checkbox */}
      <div className='section'>
        <label className='flex items-start gap-3 cursor-pointer'>
          <input
            type='checkbox'
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked)
              if (e.target.checked) {
                setErrors((prev) => ({ ...prev, agreed: '' }))
              }
            }}
            className='mt-1'
          />
          <span className='text-sm'>
            <strong>I/We confirm</strong> that we have read and understand the
            declaration above, and that both partners have signed in the
            presence of each other.
          </span>
        </label>
        {errors.agreed && <p className='error-message mt-2'>{errors.agreed}</p>}
      </div>

      {/* Signature Status */}
      <div className='section bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <h4 className='font-semibold mb-2'>Signature Status</h4>
        <div className='space-y-1 text-sm'>
          <div>
            Groom:{' '}
            {data?.male_signature_url ? (
              <span className='text-success font-semibold'>✓ Signed</span>
            ) : (
              <span className='text-error'>Not signed</span>
            )}
          </div>
          <div>
            Bride:{' '}
            {data?.female_signature_url ? (
              <span className='text-success font-semibold'>✓ Signed</span>
            ) : (
              <span className='text-error'>Not signed</span>
            )}
          </div>
          <div>
            Declaration:{' '}
            {agreed ? (
              <span className='text-success font-semibold'>✓ Agreed</span>
            ) : (
              <span className='text-error'>Not agreed</span>
            )}
          </div>
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
          disabled={
            isSaving ||
            !data?.male_signature_url ||
            !data?.female_signature_url ||
            !agreed
          }
          className={`btn flex-1 ${
            isSaving ||
            !data?.male_signature_url ||
            !data?.female_signature_url ||
            !agreed
              ? 'bg-gray-300'
              : 'btn-primary'
          }`}
        >
          {isSaving ? 'Saving...' : 'Review Registration'}
        </button>
      </div>
    </form>
  )
}
