import { useEffect, useState } from 'react'
import { Activity, Boxes, CircleAlert, Truck, UsersRound } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import DataTable from '../components/DataTable'
import KpiCard from '../components/KpiCard'
import { getDashboard } from '../services/dashboardService'
import { getErrorMessage } from '../services/resourceService'
import { useToast } from '../components/ToastContext'

const chartColors = ['#765039', '#a16e48', '#bd8b5e', '#d2ad82', '#8b9270']

function firstValue(data, keys) {
  for (const key of keys) if (data?.[key] !== undefined) return data[key]
  return undefined
}

export default function Dashboard() {
  const { notify } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getDashboard().then((result) => { if (active) setData(result) })
      .catch((error) => { if (active) notify(getErrorMessage(error, 'No se pudo cargar el dashboard.'), 'error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [notify])

  const stats = data?.kpis ?? data?.resumen ?? data ?? {}
  const movements = firstValue(data, ['ultimos_movimientos', 'movimientosRecientes', 'movimientos_recientes', 'recentMovements', 'ultimosMovimientos']) ?? []
  const categories = firstValue(data, ['stock_por_categoria', 'stockPorCategoria', 'stockByCategory', 'categorias']) ?? []
  const chartData = categories.map((item) => ({
    name: item.categoria ?? item.nombre ?? item.name ?? item.categoria_nombre ?? 'Sin categoría',
    value: Number(item.stock_total ?? item.stock ?? item.cantidad ?? item.value ?? item.total ?? 0),
  }))
  const movementColumns = [
    { key: 'fecha_hora', label: 'Fecha', render: (row) => (row.fecha_hora ?? row.fecha) ? new Date(row.fecha_hora ?? row.fecha).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : '—' },
    { key: 'producto', label: 'Producto', render: (row) => <strong className="text-strong">{row.producto?.nombre ?? row.producto_nombre ?? row.producto ?? '—'}</strong> },
    { key: 'tipo_movimiento', label: 'Tipo', render: (row) => {
      const type = row.tipo_movimiento ?? row.tipo
      return <span className={`status-badge ${String(type).toLowerCase() === 'salida' ? 'badge-danger' : String(type).toLowerCase() === 'ajuste' ? 'badge-warning' : 'badge-success'}`}>{type}</span>
    } },
    { key: 'cantidad', label: 'Cantidad', render: (row) => <strong>{row.cantidad ?? '—'}</strong> },
    { key: 'usuario', label: 'Usuario', render: (row) => row.usuario?.nombre ?? row.usuario_nombre ?? row.usuario ?? '—' },
  ]

  return (
    <div className="page-container dashboard-page">
      <div className="page-header dashboard-heading"><div><div className="eyebrow">RESUMEN GENERAL</div><h1>Dashboard</h1><p>Bienvenido al panel de control de tu inventario.</p></div><div className="date-chip"><Activity size={16} /> Resumen de inventario</div></div>
      <div className="kpi-grid">
        <KpiCard label="Total de Productos" value={firstValue(stats, ['total_productos', 'totalProductos', 'productos', 'totalProducts'])} note="Productos registrados" icon={Boxes} tone="blue" />
        <KpiCard label="Categorías" value={firstValue(stats, ['total_categorias', 'totalCategorias', 'categorias', 'totalCategories'])} note="Categorías activas" icon={Activity} tone="violet" />
        <KpiCard label="Proveedores" value={firstValue(stats, ['total_proveedores', 'totalProveedores', 'proveedores', 'totalSuppliers'])} note="Proveedores registrados" icon={Truck} tone="teal" />
        <KpiCard label="Bajo Stock" value={firstValue(stats, ['productos_bajo_stock', 'bajoStock', 'bajo_stock', 'productosBajoStock', 'lowStock'])} note="Requieren reposición" icon={CircleAlert} tone="red" alert />
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-table">
          <DataTable columns={movementColumns} rows={movements} loading={loading} emptyLabel="No hay movimientos recientes" title="Movimientos Recientes" subtitle="Última actividad registrada en el inventario." />
        </div>
        <section className="panel-card chart-card">
          <div className="chart-heading"><div><h2>Stock por Categoría</h2><p>Distribución de existencias por categoría.</p></div><div className="chart-icon"><UsersRound size={18} /></div></div>
          {loading ? <div className="chart-loading"><span className="spinner" />Cargando gráfico...</div> : chartData.length === 0 ? <div className="chart-empty">No hay datos disponibles</div> : (
            <>
              <div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="84%" paddingAngle={3} stroke="none">{chartData.map((item, index) => <Cell key={item.name} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip formatter={(value) => [`${value} unidades`, 'Stock']} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{chartData.reduce((sum, item) => sum + item.value, 0)}</strong><span>unidades</span></div></div>
              <div className="chart-legend">{chartData.map((item, index) => <div key={item.name}><span><i style={{ backgroundColor: chartColors[index % chartColors.length] }} />{item.name}</span><strong>{item.value}</strong></div>)}</div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
