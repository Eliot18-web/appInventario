import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SessionContext } from './SessionContext.js'

const SESSION_TOKEN_KEY = 'token'
const SESSION_USER_KEY = 'usuario'

function clearStoredSession() {
  sessionStorage.removeItem(SESSION_TOKEN_KEY)
  sessionStorage.removeItem(SESSION_USER_KEY)
  localStorage.removeItem(SESSION_TOKEN_KEY)
}

function readStoredSession() {
  localStorage.removeItem(SESSION_TOKEN_KEY)
  const token = sessionStorage.getItem(SESSION_TOKEN_KEY)
  const storedUser = sessionStorage.getItem(SESSION_USER_KEY)

  if (!token || !storedUser) {
    clearStoredSession()
    return null
  }

  try {
    const user = JSON.parse(storedUser)
    if (!user || user.id == null || !user.nombre || !user.rol) {
      clearStoredSession()
      return null
    }

    return { token, user }
  } catch (error) {
    console.error('No se pudo recuperar el usuario de la sesión.', error)
    clearStoredSession()
    return null
  }
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(readStoredSession)
  const navigate = useNavigate()

  useEffect(() => {
    const handleSessionExpired = () => {
      clearStoredSession()
      setSession(null)
      navigate('/', {
        replace: true,
        state: { message: 'Tu sesión expiró. Inicia sesión nuevamente.' },
      })
    }

    window.addEventListener('app:session-expired', handleSessionExpired)
    return () => window.removeEventListener('app:session-expired', handleSessionExpired)
  }, [navigate])

  const startSession = useCallback((token, user) => {
    if (!token || !user || user.id == null || !user.nombre || !user.rol) {
      throw new Error('La respuesta de inicio de sesión no contiene un usuario válido.')
    }

    const safeUser = {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol,
    }
    const nextSession = { token, user: safeUser }
    sessionStorage.setItem(SESSION_TOKEN_KEY, token)
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(safeUser))
    setSession(nextSession)
  }, [])

  const endSession = useCallback(() => {
    clearStoredSession()
    setSession(null)
  }, [])

  const value = useMemo(() => ({
    token: session?.token ?? null,
    user: session?.user ?? null,
    startSession,
    endSession,
  }), [endSession, session, startSession])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
