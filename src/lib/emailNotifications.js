export async function sendEmailNotification({ to, subject, text, html }) {
  try {
    const response = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, text, html }),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok || payload?.success === false) {
      return {
        success: false,
        error:
          payload?.message ||
          `Email request failed with status ${response.status}`,
      }
    }

    return { success: true, data: payload }
  } catch (error) {
    console.error('Email notification error:', error)
    return { success: false, error: error.message }
  }
}
