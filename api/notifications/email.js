import nodemailer from 'nodemailer'

function toBoolean(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return false
}

function buildTransport() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 465)
  const secure = toBoolean(process.env.SMTP_SECURE ?? port === 465)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('SMTP credentials are not configured')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { to, subject, text, html } = req.body || {}
  const recipients = Array.isArray(to)
    ? to.filter(Boolean)
    : [to].filter(Boolean)

  if (!recipients.length || !subject || (!text && !html)) {
    return res.status(400).json({
      message: 'Missing required fields: to, subject and text/html',
    })
  }

  try {
    const transporter = buildTransport()
    const from = process.env.SMTP_FROM || process.env.SMTP_USER

    const info = await transporter.sendMail({
      from,
      to: recipients,
      subject,
      text,
      html,
    })

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    })
  } catch (error) {
    console.error('Email send failed:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email',
    })
  }
}
