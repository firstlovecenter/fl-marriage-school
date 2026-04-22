/**
 * Arkesel SMS/WhatsApp notification helper
 * Ghana-based API supporting WhatsApp and SMS with automatic fallback
 */

export async function sendArkeselMessage({ to, message }) {
  // Normalise Ghanaian phone numbers to +233XXXXXXXXX format
  const normalised = normalisePhoneNumber(to)

  const apiKey = import.meta.env.VITE_ARKESEL_API_KEY
  const senderId = import.meta.env.VITE_ARKESEL_SENDER_ID

  if (!apiKey) {
    console.error('VITE_ARKESEL_API_KEY not set')
    return { success: false, error: 'Missing API key' }
  }

  try {
    const res = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: senderId || 'FLMS',
        message,
        recipients: [normalised],
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('Arkesel API error:', error)
      return { success: false, error }
    }

    const data = await res.json()
    return { success: true, data }
  } catch (err) {
    console.error('Failed to send Arkesel message:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Normalise Ghanaian phone numbers
 * Converts 0XXXXXXXXX or 233XXXXXXXXX to +233XXXXXXXXX format
 */
function normalisePhoneNumber(phone) {
  if (!phone) return phone

  let normalised = phone.trim()

  // Remove leading + if present
  if (normalised.startsWith('+')) {
    normalised = normalised.slice(1)
  }

  // Convert 0XXXXXXXXX to +233XXXXXXXXX
  if (normalised.startsWith('0')) {
    normalised = '233' + normalised.slice(1)
  }

  // Ensure it starts with 233
  if (!normalised.startsWith('233')) {
    normalised = '233' + normalised
  }

  return '+' + normalised
}

/**
 * Send multiple messages simultaneously
 * Used for sending to both partners or both pastors
 */
export async function sendBulkMessages(recipients) {
  return Promise.all(recipients.map(sendArkeselMessage))
}
