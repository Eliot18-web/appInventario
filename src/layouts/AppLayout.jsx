import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { ToastProvider } from '../components/ToastProvider'
import { useSession } from '../components/SessionContext.js'

export default function AppLayout({ Navigation, children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useSession()
  return (
    <ToastProvider>
      <Navigation onMenuClick={() => setMobileOpen(true)} user={user} />
      <div className="app-layout">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="main-shell">
          <main className="page-content">{children}</main>
          <footer className="app-footer">SENATI · Sistema de Inventario <span>© {new Date().getFullYear()}</span></footer>
        </div>
      </div>
    </ToastProvider>
  )
}
