import { Menu, Bell } from 'lucide-react'

export default function Navbar({ onMenuClick }) {
  return (
    <header className="topbar">
      <button className="menu-toggle" onClick={onMenuClick} aria-label="Abrir menú"><Menu size={21} /></button>
      <div className="topbar-context"><span>Administración</span><span className="topbar-divider">/</span><strong>Inventario</strong></div>
      <div className="topbar-user">
        <button className="notification-button" aria-label="Notificaciones"><Bell size={19} /><i /></button>
        <div className="user-avatar">AD</div>
        <div className="user-details"><strong>Administrador</strong><span>Administrador</span></div>
      </div>
    </header>
  )
}
