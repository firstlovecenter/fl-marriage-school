const ADMIN_SESSION_KEY = 'flms_admin_session'

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.error('Failed to read admin session:', error)
    return null
  }
}

export function setAdminSession(session) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY)
}

export function isAdminAuthenticated() {
  const session = getAdminSession()
  return Boolean(session?.email && session?.id)
}
