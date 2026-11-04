import { Link, Navigate } from 'react-router-dom'
import { useSession } from '../SessionContext.js'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, user } = useSession()

  if (!token) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger" role="alert">
          No tienes permisos para acceder a esta sección. Se requiere el rol Administrador.
        </div>
        <Link className="btn btn-primary" to="/productos">Volver a productos</Link>
      </main>
    )
  }

  return children
}
