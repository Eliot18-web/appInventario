import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Boxes, ChartNoAxesCombined, ChevronLeft, ChevronRight, ClipboardList, LayoutDashboard, Truck, Users, X } from 'lucide-react'
import { useSession } from './SessionContext.js'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/productos', label: 'Productos', icon: Boxes },
  { to: '/categorias', label: 'Categorías', icon: ClipboardList },
  { to: '/proveedores', label: 'Proveedores', icon: Truck },
  { to: '/kardex', label: 'Kardex', icon: ChartNoAxesCombined },
  { to: '/usuarios', label: 'Usuarios', icon: Users },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useSession()
  const visibleNavigation = navigation.filter(({ to }) => to !== '/usuarios' || user?.rol === 'Administrador')
  return (
    <>
      {mobileOpen && <button className="sidebar-backdrop" aria-label="Cerrar menú" onClick={onClose} />}
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-symbol">S</div>
          <div className="brand-copy"><strong>SENATI</strong><span>Sistema de Inventario</span></div>
          <button className="mobile-close" aria-label="Cerrar menú" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="nav-caption">MENÚ PRINCIPAL</div>
        <nav className="side-nav" aria-label="Navegación principal">
          {visibleNavigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} title={collapsed ? label : undefined} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={onClose}>
              <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="collapse-button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}<span>Contraer menú</span>
        </button>
        <div className="sidebar-foot"><span className="online-dot" /> Sistema operativo</div>
      </aside>
    </>
  )
}
