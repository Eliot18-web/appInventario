import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3006'

const api = axios.create({
  baseURL: apiUrl.replace(/\/api\/?$/, ''),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  config.headers['Content-Type'] = 'application/json'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const isLoginRequest = error.config?.url?.includes('/api/auth/login')
    const responseMessage = [
      error.response?.data?.code,
      error.response?.data?.message,
      error.response?.data?.error,
    ].filter(Boolean).join(' ')
    const expiredSession = status === 401
      || (status === 403 && /token|jwt|sesion|session/i.test(responseMessage) && /expir/i.test(responseMessage))

    if (expiredSession && !isLoginRequest) {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('usuario')
      window.dispatchEvent(new Event('app:session-expired'))
    }

    return Promise.reject(error)
  },
)

export default api
