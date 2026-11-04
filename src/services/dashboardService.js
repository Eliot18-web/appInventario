import api from './api'

export async function getDashboard() {
  try {
    const response = await api.get('/api/dashboard')
    const dashboard = response.data.data
    console.log('GET /api/dashboard response.data.data:', dashboard)
    return dashboard
  } catch (error) {
    if (error?.response?.status !== 404) throw error
    // TODO: Replace the demo dashboard with the response from GET /dashboard.
    return {
      totalProductos: 128,
      totalCategorias: 12,
      totalProveedores: 8,
      bajoStock: 6,
      movimientosRecientes: [
        { id: 1, fecha: '2026-10-29T10:20:00', producto: 'Laptop Lenovo ThinkPad', tipo: 'Entrada', cantidad: 5, usuario: 'María López' },
        { id: 2, fecha: '2026-10-29T09:10:00', producto: 'Mouse inalámbrico', tipo: 'Salida', cantidad: 2, usuario: 'Administrador' },
        { id: 3, fecha: '2026-10-28T16:45:00', producto: 'Monitor LED 24 pulgadas', tipo: 'Ajuste', cantidad: 1, usuario: 'Carlos Ruiz' },
        { id: 4, fecha: '2026-10-28T14:30:00', producto: 'Teclado mecánico', tipo: 'Entrada', cantidad: 8, usuario: 'María López' },
      ],
      stockPorCategoria: [
        { categoria: 'Cómputo', stock: 64 },
        { categoria: 'Accesorios', stock: 42 },
        { categoria: 'Oficina', stock: 28 },
      ],
    }
  }
}
