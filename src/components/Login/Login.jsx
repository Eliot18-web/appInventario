import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useSession } from '../SessionContext.js'
import { getErrorMessage } from '../../services/resourceService'

const initialCredentials = {
  email: '',
  password: '',
}

export default function Login() {
  const [credenciales, setCredenciales] = useState(initialCredentials)
  const location = useLocation()
  const [error, setError] = useState(Boolean(location.state?.message))
  const [errorMessage, setErrorMessage] = useState(location.state?.message ?? '')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()
  const { startSession } = useSession()

  const handleChange = (event) => {
    setCredenciales({
      ...credenciales,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: null })
    }
    setError(false)
    setErrorMessage('')
    setEnviando(true)

    try {
      const response = await api.post('/api/auth/login', credenciales)
      startSession(response.data.token, response.data.usuario)
      setCredenciales(initialCredentials)
      navigate('/productos', { replace: true })
    } catch (requestError) {
      console.error('No se pudo iniciar sesión.', requestError)
      const status = requestError.response?.status
      const message = status === 401
        ? 'Credenciales inválidas. Intenta nuevamente.'
        : status === 403
          ? 'Tu cuenta no tiene permisos para iniciar sesión.'
          : getErrorMessage(requestError, 'No se pudo iniciar sesión. Verifica tus credenciales y la conexión con el servidor.')
      setErrorMessage(message)
      setError(true)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="login-page container d-flex align-items-center justify-content-center py-5">
      <div className="card shadow-sm w-100 login-card">
        <div className="card-body p-4 p-md-5">
          <h1 className="h3 text-center mb-4">Iniciar sesión</h1>
          {(error || location.state?.message) && (
            <div className="alert alert-danger" role="alert">
              {error ? errorMessage : location.state.message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Correo electrónico</label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-control"
                value={credenciales.email}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-control"
                value={credenciales.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={enviando}>
              {enviando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
