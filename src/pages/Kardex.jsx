import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import { useToast } from '../components/ToastContext'
import { productosService } from '../services/productosService'
import { movimientosService, registrarMovimiento } from '../services/movimientosService'
import { usuariosService } from '../services/usuariosService'
import { getErrorMessage, getItems, getTotal } from '../services/resourceService'
import { useSession } from '../components/SessionContext.js'

const emptyForm = { producto_id: '', usuario_id: '', tipo_movimiento: 'Entrada', cantidad: '', observaciones: '' }

export default function Kardex() {
  const { notify } = useToast()
  const { user } = useSession()
  const isAdmin = user.rol === 'Administrador'
  const [rows, setRows] = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const pages = Math.ceil(total / limit)

  const loadRows = useCallback(async () => {
    setLoading(true)
    try {
      const payload = await movimientosService.list({ page, limit, search })
      const items = getItems(payload)
      setRows(items)
      setTotal(getTotal(payload, items))
    } catch (error) {
      notify(getErrorMessage(error, 'No se pudieron cargar los movimientos.'), 'error')
    } finally { setLoading(false) }
  }, [limit, notify, page, search])

  useEffect(() => {
    let active = true
    movimientosService.list({ page, limit, search })
      .then((payload) => {
        if (!active) return
        const items = getItems(payload)
        setRows(items)
        setTotal(getTotal(payload, items))
      })
      .catch((error) => { if (active) notify(getErrorMessage(error, 'No se pudieron cargar los movimientos.'), 'error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [limit, notify, page, search])
  useEffect(() => {
    productosService.list({ page: 1, limit: 100 }).then((payload) => setProducts(getItems(payload)))
      .catch((error) => notify(getErrorMessage(error, 'No se pudieron cargar los productos.'), 'error'))
    if (isAdmin) {
      usuariosService.list().then((payload) => setUsers(getItems(payload)))
        .catch((error) => notify(getErrorMessage(error, 'No se pudieron cargar los usuarios.'), 'error'))
    }
  }, [isAdmin, notify])

  const columns = [
    { key: 'fecha_hora', label: 'Fecha y hora', render: (row) => (row.fecha_hora ?? row.fecha) ? new Date(row.fecha_hora ?? row.fecha).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : '—' },
    { key: 'producto', label: 'Producto', render: (row) => <strong className="text-strong">{row.producto?.nombre ?? row.producto_nombre ?? row.producto ?? '—'}</strong> },
    { key: 'tipo_movimiento', label: 'Tipo', render: (row) => {
      const type = row.tipo_movimiento ?? row.tipo
      return <span className={`status-badge ${String(type).toLowerCase() === 'salida' ? 'badge-danger' : String(type).toLowerCase() === 'ajuste' ? 'badge-warning' : 'badge-success'}`}>{type}</span>
    } },
    { key: 'cantidad', label: 'Cantidad', render: (row) => {
      const type = String(row.tipo_movimiento ?? row.tipo).toLowerCase()
      const amount = Number(row.cantidad) || 0
      const signed = type === 'salida' ? -Math.abs(amount) : type === 'entrada' ? Math.abs(amount) : amount
      return <strong className={signed < 0 ? 'quantity-negative' : 'quantity-positive'}>{signed > 0 ? '+' : ''}{signed}</strong>
    } },
    { key: 'usuario', label: 'Usuario', render: (row) => row.usuario?.nombre ?? row.usuario_nombre ?? row.usuario ?? '—' },
    { key: 'observaciones', label: 'Observaciones' },
  ]

  const submit = async (event) => {
    event.preventDefault()
    if (!form.usuario_id) {
      notify('Debes crear o seleccionar un usuario activo antes de registrar movimientos.', 'error')
      return
    }
    setSaving(true)
    try {
      await registrarMovimiento({
        producto_id: Number(form.producto_id),
        usuario_id: Number(form.usuario_id),
        tipo_movimiento: form.tipo_movimiento,
        cantidad: Number(form.cantidad),
        observaciones: form.observaciones,
      })
      setOpen(false)
      setForm(emptyForm)
      notify('Movimiento registrado correctamente.')
      await loadRows()
    } catch (error) {
      notify(getErrorMessage(error, 'No se pudo registrar el movimiento.'), 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div><div className="eyebrow">TRAZABILIDAD</div><h1>Kardex</h1><p>Consulta y registra los movimientos de inventario.</p></div>
        <button className="button button-primary" onClick={() => { setForm({ ...emptyForm, usuario_id: isAdmin ? '' : user.id }); setOpen(true) }}><Plus size={18} /> Registrar Movimiento</button>
      </div>
      <DataTable columns={columns} rows={rows} loading={loading} search={search} onSearch={(value) => { setLoading(true); setSearch(value); setPage(1) }} emptyLabel="No hay registros" pagination={<Pagination page={page} pages={pages} total={total} limit={limit} onPageChange={(value) => { setLoading(true); setPage(value) }} onLimitChange={(value) => { setLoading(true); setLimit(value); setPage(1) }} />} />
      <Modal open={open} onClose={() => setOpen(false)} title="Registrar movimiento" description="Registra una entrada, salida o ajuste de inventario.">
        <form className="record-form" onSubmit={submit}>
          <div className="form-grid">
            <label className="form-field field-full"><span>Producto <i>*</i></span><select value={form.producto_id} onChange={(event) => setForm((current) => ({ ...current, producto_id: event.target.value }))} required><option value="">Selecciona un producto</option>{products.map((product) => <option key={product.id} value={product.id}>{product.nombre}</option>)}</select></label>
            <label className="form-field"><span>Tipo <i>*</i></span><select value={form.tipo_movimiento} onChange={(event) => setForm((current) => ({ ...current, tipo_movimiento: event.target.value }))} required>{['Entrada', 'Salida', 'Ajuste'].map((type) => <option key={type}>{type}</option>)}</select></label>
            <label className="form-field"><span>Cantidad <i>*</i></span><input type="number" min={form.tipo_movimiento === 'Ajuste' ? '0' : '1'} step="1" value={form.cantidad} onChange={(event) => setForm((current) => ({ ...current, cantidad: event.target.value }))} required /><small className="field-note">{form.tipo_movimiento === 'Ajuste' ? 'En Ajuste, la cantidad es el nuevo stock final.' : 'Las salidas no pueden superar el stock disponible.'}</small></label>
            {isAdmin ? (
              <label className="form-field field-full"><span>Usuario responsable <i>*</i></span><select value={form.usuario_id} onChange={(event) => setForm((current) => ({ ...current, usuario_id: event.target.value }))} required><option value="">Selecciona un usuario activo</option>{users.filter((listedUser) => String(listedUser.estado).toLowerCase() !== 'inactivo').map((listedUser) => <option key={listedUser.id} value={listedUser.id}>{listedUser.nombre}</option>)}</select>{users.length === 0 && <small className="field-note">No hay usuarios registrados.</small>}</label>
            ) : (
              <label className="form-field field-full"><span>Usuario responsable</span><input value={`${user.nombre} (${user.rol})`} readOnly /></label>
            )}
            <label className="form-field field-full"><span>Observaciones</span><textarea rows="3" value={form.observaciones} onChange={(event) => setForm((current) => ({ ...current, observaciones: event.target.value }))} placeholder="Detalles adicionales del movimiento" /></label>
          </div>
          <div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setOpen(false)}>Cancelar</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Registrando...' : 'Registrar movimiento'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
