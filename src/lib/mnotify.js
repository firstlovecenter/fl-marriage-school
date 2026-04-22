/**
 * MNotify SMS helper
 * Sends transactional SMS through MNotify's quick SMS API.
 */

function toMnotifyPhoneNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '')

  if (!digits) return ''

  if (digits.length === 10 && digits.startsWith('0')) {
    return digits
  }

  if (digits.length === 12 && digits.startsWith('233')) {
    return `0${digits.slice(3)}`
  }

  if (digits.length === 9) {
    return `0${digits}`
  }

  return String(phone || '').trim()
}

export async function sendSmsMessage({ to, message }) {
  const apiKey = import.meta.env.VITE_MNOTIFY_API_KEY
  const senderId = import.meta.env.VITE_MNOTIFY_SENDER_ID || 'FLMS'
  const recipient = toMnotifyPhoneNumber(to)

  if (!apiKey) {
    console.error('VITE_MNOTIFY_API_KEY not set')
    return { success: false, error: 'Missing MNotify API key' }
  }

  if (!recipient) {
    return { success: false, error: 'Missing recipient phone number' }
  }

  try {
    const url = new URL('https://api.mnotify.com/api/sms/quick')
    url.searchParams.set('key', apiKey)

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        api_key: apiKey,
      },
      body: JSON.stringify({
        recipient: [recipient],
        sender: senderId,
        message,
        is_schedule: false,
        schedule_date: '',
      }),
    })

    const payload = await res.json().catch(() => null)

    if (!res.ok || payload?.status !== 'success') {
      const errorMessage =
        payload?.message || `MNotify request failed with status ${res.status}`
      console.error('MNotify API error:', payload || errorMessage)
      return { success: false, error: errorMessage, data: payload }
    }

    return { success: true, data: payload }
  } catch (err) {
    console.error('Failed to send MNotify SMS:', err)
    return { success: false, error: err.message }
  }
}

export function normalizeSmsPhoneNumber(phone) {
  return toMnotifyPhoneNumber(phone)
}
