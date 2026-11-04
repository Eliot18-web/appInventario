import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, title, description, onClose, children, wide = false }) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    document.body.classList.add('modal-open')
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('modal-open')
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className={`modal-panel ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <div><h2 id="modal-title">{title}</h2>{description && <p>{description}</p>}</div>
          <button className="icon-button" type="button" aria-label="Cerrar" onClick={onClose}><X size={20} /></button>
        </header>
        {children}
      </section>
    </div>
  )
}
