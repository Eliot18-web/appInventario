import { useCallback, useMemo, useState } from 'react'
import { CircleCheck, CircleX, X } from 'lucide-react'
import { ToastContext } from './ToastContext'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const notify = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, message, type }])
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200)
  }, [])
  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div className={`toast-message toast-${toast.type}`} key={toast.id} role="status">
            {toast.type === 'error' ? <CircleX size={19} /> : <CircleCheck size={19} />}
            <span>{toast.message}</span>
            <button type="button" aria-label="Cerrar aviso" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
