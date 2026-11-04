import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import { useToast } from '../components/ToastContext'
import { categoriasService } from '../services/categoriasService'
import { proveedoresService } from '../services/proveedoresService'
import { getErrorMessage, getItems, getTotal } from '../services/resourceService'

const configs = {
  productos: {
    fields: [
      { name: 'nombre', label: 'Nombre del producto', required: true, placeholder: 'Ej. Laptop Lenovo' },
      { name: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Detalles del producto' },
      { name: 'precio', label: 'Precio (S/)', type: 'number', required: true, min: 0, step: '0.01' },
      { name: 'stock', label: 'Stock', type: 'number', required: true, min: 0, step: '1' },
      { name: 'categoria_id', label: 'Categoría', type: 'category', required: true },
      { name: 'proveedor_id', label: 'Proveedor', type: 'supplier' },
    ],
  },
  categorias: {
    fields: [
      { name: 'nombre', label: 'Nombre de la categoría', required: true, placeholder: 'Ej. Equipos de cómputo' },
      { name: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Describe esta categoría' },
    ],
  },
  proveedores: {
    fields: [
      { name: 'razon_social', label: 'Razón social', required: true, placeholder: 'Nombre de la empresa' },
      { name: 'contacto', label: 'Persona de contacto', required: true, placeholder: 'Nombre y apellido' },
      { name: 'telefono', label: 'Teléfono', type: 'tel', placeholder: '+51 999 999 999' },
      { name: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'contacto@empresa.com' },
    ],
  },
  usuarios: {
    fields: [
      { name: 'nombre', label: 'Nombre completo', required: true, placeholder: 'Nombre y apellido' },
      { name: 'email', label: 'Correo electrónico', type: 'email', required: true, placeholder: 'usuario@senati.edu.pe' },
      { name: 'rol', label: 'Rol', type: 'select', required: true, options: ['Administrador', 'Almacenero', 'Supervisor', 'Consulta'] },
      { name: 'estado', label: 'Estado', type: 'select', required: true, options: ['Activo', 'Inactivo'] },
      { name: 'password', label: 'Contraseña', type: 'password', requiredOnCreate: true, placeholder: 'Ingresa una contraseña segura' },
    ],
  },
}

function getColumns(type, categories = []) {
  if (type === 'productos') return [
    { key: 'id', label: 'ID', render: (row) => <span className="id-label">#{row.id}</span> },
    { key: 'nombre', label: 'Producto', render: (row) => <div className="primary-cell"><strong>{row.nombre}</strong>{row.descripcion && <span>{row.descripcion}</span>}</div> },
    { key: 'categoria', label: 'Categoría', render: (row) => row.categoria?.nombre ?? row.categoria_nombre ?? (typeof row.categoria === 'string' ? row.categoria : null) ?? categories.find((category) => String(category.id) === String(row.categoria_id ?? row.categoriaId))?.nombre ?? '—' },
    { key: 'precio', label: 'Precio', render: (row) => `S/ ${Number(row.precio ?? 0).toFixed(2)}` },
    { key: 'stock', label: 'Stock', render: (row) => <span className={`status-badge ${Number(row.stock) <= 5 ? 'badge-danger' : 'badge-success'}`}>{row.stock ?? 0} unidades</span> },
  ]
  if (type === 'categorias') return [
    { key: 'id', label: 'ID', render: (row) => <span className="id-label">#{row.id}</span> },
    { key: 'nombre', label: 'Categoría', render: (row) => <div className="primary-cell"><strong>{row.nombre}</strong><span>{row.descripcion || 'Sin descripción'}</span></div> },
    { key: 'cantidad_productos', label: 'Productos', render: (row) => <span className="count-badge">{row.cantidad_productos ?? row.productos_count ?? row.cantidadProductos ?? 0}</span> },
  ]
  if (type === 'proveedores') return [
    { key: 'id', label: 'ID', render: (row) => <span className="id-label">#{row.id}</span> },
    { key: 'razon_social', label: 'Razón social', render: (row) => <strong className="text-strong">{row.razon_social}</strong> },
    { key: 'contacto', label: 'Contacto' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Correo electrónico' },
  ]
  return [
    { key: 'id', label: 'ID', render: (row) => <span className="id-label">#{row.id}</span> },
    { key: 'nombre', label: 'Usuario', render: (row) => <div className="primary-cell"><strong>{row.nombre}</strong></div> },
    { key: 'email', label: 'Correo electrónico' },
    { key: 'rol', label: 'Rol', render: (row) => <span className="role-badge">{row.rol}</span> },
    { key: 'estado', label: 'Estado', render: (row) => <span className={`status-badge ${String(row.estado).toLowerCase() === 'inactivo' ? 'badge-neutral' : 'badge-success'}`}>{row.estado || 'Activo'}</span> },
  ]
}

const initialForm = (fields) => Object.fromEntries(fields.map((field) => [field.name, field.options?.[0] ?? '']))

export default function ResourcePage({ path, title, description, service }) {
  const config = configs[path]
  const fields = config.fields
  const { notify } = useToast()
  const [rows, setRows] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState(() => initialForm(fields))
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const pages = Math.ceil(total / limit)

  const loadRows = useCallback(async () => {
    try {
      const payload = await service.list({ page, limit, search })
      const items = getItems(payload)
      setRows(items)
      setTotal(getTotal(payload, items))
    } catch (error) {
      notify(getErrorMessage(error, `No se pudieron cargar ${title.toLocaleLowerCase()}.`), 'error')
    } finally {
      setLoading(false)
    }
  }, [limit, notify, page, search, service, title])

  useEffect(() => {
    let active = true
    service.list({ page, limit, search })
      .then((payload) => {
        if (!active) return
        const items = getItems(payload)
        setRows(items)
        setTotal(getTotal(payload, items))
      })
      .catch((error) => { if (active) notify(getErrorMessage(error, `No se pudieron cargar ${title.toLocaleLowerCase()}.`), 'error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [limit, notify, page, search, service, title])

  useEffect(() => {
    if (path !== 'productos') return
    Promise.all([
      categoriasService.list({ page: 1, limit: 100 }),
      proveedoresService.list({ page: 1, limit: 100 }),
    ]).then(([categoryPayload, supplierPayload]) => {
      setCategories(getItems(categoryPayload))
      setSuppliers(getItems(supplierPayload))
    }).catch((error) => notify(getErrorMessage(error, 'No se pudieron cargar categorías y proveedores.'), 'error'))
  }, [notify, path])

  const columns = useMemo(() => getColumns(path, categories), [categories, path])
  const openNew = () => {
    setEditing(null)
    setForm(initialForm(fields))
    setOpen(true)
  }
  const openEdit = (row) => {
    setEditing(row)
    const values = initialForm(fields)
    fields.forEach((field) => {
      if (field.name === 'categoria_id') values[field.name] = row.categoria_id ?? row.categoriaId ?? row.categoria?.id ?? ''
      else if (field.name === 'proveedor_id') values[field.name] = row.proveedor_id ?? row.proveedorId ?? row.proveedor?.id ?? ''
      else if (field.name === 'estado') values[field.name] = row.estado ? `${row.estado[0].toLocaleUpperCase()}${row.estado.slice(1).toLocaleLowerCase()}` : 'Activo'
      else values[field.name] = row[field.name] ?? ''
    })
    setForm(values)
    setOpen(true)
  }
  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if (path === 'productos') {
        payload.precio = Number(payload.precio)
        payload.stock = Number(payload.stock)
        payload.categoria_id = Number(payload.categoria_id)
        if (payload.proveedor_id) payload.proveedor_id = Number(payload.proveedor_id)
        else delete payload.proveedor_id
      }
      if (path === 'usuarios' && !payload.password) delete payload.password
      if (editing) await service.update(editing.id, payload)
      else await service.create(payload)
      setOpen(false)
      const singular = { Productos: 'Producto', Categorías: 'Categoría', Proveedores: 'Proveedor', Usuarios: 'Usuario' }[title] ?? 'Registro'
      notify(`${singular} ${editing ? 'actualizado' : 'creado'} correctamente.`)
      await loadRows()
    } catch (error) {
      const singular = { Productos: 'el producto', Categorías: 'la categoría', Proveedores: 'el proveedor', Usuarios: 'el usuario' }[title] ?? 'el registro'
      notify(getErrorMessage(error, `No se pudo guardar ${singular}.`), 'error')
    } finally {
      setSaving(false)
    }
  }
  const remove = async (row) => {
    const label = row.nombre ?? row.razon_social
    if (!window.confirm(`¿Seguro que deseas eliminar "${label}"? Esta acción no se puede deshacer.`)) return
    try {
      await service.remove(row.id)
      notify('Registro eliminado correctamente.')
      if (rows.length === 1 && page > 1) setPage(page - 1)
      else await loadRows()
    } catch (error) {
      notify(getErrorMessage(error, 'No se pudo eliminar el registro.'), 'error')
    }
  }
  const changeSearch = (value) => { setLoading(true); setSearch(value); setPage(1) }
  const pagination = <Pagination page={page} pages={pages} total={total} limit={limit} onPageChange={(value) => { setLoading(true); setPage(value) }} onLimitChange={(value) => { setLoading(true); setLimit(value); setPage(1) }} />

  return (
    <div className="page-container">
      <div className="page-header">
        <div><div className="eyebrow">GESTIÓN DE INVENTARIO</div><h1>{title}</h1><p>{description}</p></div>
        <button className="button button-primary" onClick={openNew}><Plus size={18} /> Nuevo {path === 'productos' ? 'Producto' : path === 'categorias' ? 'Categoría' : path === 'proveedores' ? 'Proveedor' : 'Usuario'}</button>
      </div>
      <DataTable columns={columns} rows={rows} loading={loading} search={search} onSearch={changeSearch} emptyLabel="No hay registros" actions={(row) => (
        <div className="row-actions">
          <button type="button" className="icon-button action-edit" aria-label={`Editar ${row.nombre ?? row.razon_social}`} title="Editar" onClick={() => openEdit(row)}><Pencil size={16} /></button>
          <button type="button" className="icon-button action-delete" aria-label={`Eliminar ${row.nombre ?? row.razon_social}`} title="Eliminar" onClick={() => remove(row)}><Trash2 size={16} /></button>
        </div>
      )} pagination={pagination} />
      <Modal open={open} onClose={() => setOpen(false)} title={`${editing ? 'Editar' : 'Nuevo'} ${path === 'productos' ? 'producto' : path === 'categorias' ? 'categoría' : path === 'proveedores' ? 'proveedor' : 'usuario'}`} description="Completa los datos del formulario para continuar.">
        <form className="record-form" onSubmit={submit}>
          <div className="form-grid">
            {fields.map((field) => (
              <label className={`form-field ${field.type === 'textarea' ? 'field-full' : ''}`} key={field.name}>
                <span>{field.label}{field.required && <i> *</i>}</span>
                {field.type === 'textarea' ? <textarea name={field.name} value={form[field.name]} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} placeholder={field.placeholder} rows="3" />
                  : field.type === 'category' || field.type === 'supplier' ? (
                    <select name={field.name} value={form[field.name]} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} required={field.required}>
                      <option value="">{field.type === 'category' ? 'Selecciona una categoría' : 'Sin proveedor'}</option>
                      {(field.type === 'category' ? categories : suppliers).map((option) => <option key={option.id} value={option.id}>{option.nombre ?? option.razon_social}</option>)}
                    </select>
                  ) : field.type === 'select' ? (
                    <select name={field.name} value={form[field.name]} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} required={field.required}>
                      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : <input name={field.name} type={field.type || 'text'} value={form[field.name]} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} placeholder={field.placeholder} required={field.required || (field.requiredOnCreate && !editing)} min={field.min} minLength={field.name === 'password' ? 6 : undefined} step={field.step} autoComplete={field.name === 'password' ? 'new-password' : undefined} />}
              </label>
            ))}
          </div>
          {path === 'usuarios' && <p className="form-hint">La contraseña no se muestra en el sistema. Al editar, déjala vacía para conservar la actual.</p>}
          <div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setOpen(false)}>Cancelar</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear registro'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
