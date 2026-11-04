import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import './App.css'
import Dashboard from './pages/Dashboard'
import Kardex from './pages/Kardex'
import ResourcePage from './pages/ResourcePage'
import AppLayout from './layouts/AppLayout'
import CrudProductos from './components/Productos/crudProductos'
import Login from './components/Login/Login'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { useSession } from './components/SessionContext.js'
import { SessionProvider } from './components/SessionContext.jsx'
import { categoriasService } from './services/categoriasService'
import { proveedoresService } from './services/proveedoresService'
import { usuariosService } from './services/usuariosService'

const resourcePages = [
  { path: 'categorias', title: 'Categorías', description: 'Organiza los productos de tu inventario.', service: categoriasService },
  { path: 'proveedores', title: 'Proveedores', description: 'Mantén actualizada la información de tus proveedores.', service: proveedoresService },
  { path: 'usuarios', title: 'Usuarios', description: 'Administra el acceso y los roles del sistema.', service: usuariosService },
]

function Navigation({ onMenuClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user, endSession } = useSession()

  const handleLogout = () => {
    endSession()
    navigate('/', { replace: true })
  }

  return (
    <nav
      className={`navbar navbar-dark bg-dark px-3 px-md-4${onMenuClick ? ' app-navigation-app' : ''}`}
      aria-label={location.pathname === '/' ? 'Navegación de inicio de sesión' : 'Navegación del sistema'}
    >
      {onMenuClick && (
        <button
          type="button"
          className="btn btn-outline-light d-md-none me-2"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu size={19} />
        </button>
      )}
      <span className="navbar-brand mb-0 h1">SENATI - Sistema de Inventario</span>
      {token && (
        <div className="navbar-session-controls d-flex align-items-center gap-3">
          <div className="navbar-session-user text-end text-white">
            <div className="small fw-semibold">{user.nombre}</div>
            <div className="small opacity-75">{user.rol}</div>
          </div>
          <button type="button" className="btn btn-outline-light logout-button" onClick={handleLogout}>
            <LogOut size={15} aria-hidden="true" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  )
}

function LoginPage() {
  const { token } = useSession()
  return token ? <Navigate to="/productos" replace /> : <><Navigation /><Login /></>
}

function ProtectedPage({ children, allowedRoles }) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <AppLayout Navigation={Navigation}>{children}</AppLayout>
    </ProtectedRoute>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
      <Route path="/productos" element={<ProtectedPage allowedRoles={['Administrador', 'Almacenero']}><CrudProductos /></ProtectedPage>} />
      {resourcePages.map((page) => (
        <Route
          key={page.path}
          path={`/${page.path}`}
          element={(
            <ProtectedPage allowedRoles={page.path === 'usuarios' ? ['Administrador'] : undefined}>
              <ResourcePage {...page} />
            </ProtectedPage>
          )}
        />
      ))}
      <Route path="/kardex" element={<ProtectedPage><Kardex /></ProtectedPage>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <AppRoutes />
      </SessionProvider>
    </BrowserRouter>
  )
}

export default App
