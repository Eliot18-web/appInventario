import './App.css'
import CrudProductos from './components/Productos/crudProductos'

function App() {
  return (
    <div className="app-shell">
      <nav className="navbar app-navbar">
        <div className="container app-navbar-content">
          <a className="navbar-brand app-brand" href="/" aria-label="Inventario SENATI, inicio">
            <span className="app-brand-mark" aria-hidden="true">S</span>
            <span>
              <strong>SENATI</strong>
              <small>Control de inventario</small>
            </span>
          </a>
          <span className="app-navbar-label">Panel de administración</span>
        </div>
      </nav>
      <main>
        <CrudProductos />
      </main>
    </div>
  );
}

export default App;