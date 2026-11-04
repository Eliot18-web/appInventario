import { Search } from 'lucide-react'

export default function DataTable({ columns, rows, loading, emptyLabel = 'No hay registros', search, onSearch, actions, pagination, title = 'Listado', subtitle = 'Consulta y administra tus registros.' }) {
  return (
    <section className="panel-card table-card">
      {onSearch && (
        <div className="table-toolbar">
          <div className="table-heading"><div><h2>{title}</h2><p>{subtitle}</p></div></div>
          <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar registros..." aria-label="Buscar registros" /></label>
        </div>
      )}
      {!onSearch && <div className="table-toolbar simple-toolbar"><div><h2>{title}</h2><p>{subtitle}</p></div></div>}
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}{actions && <th className="actions-heading">Acciones</th>}</tr></thead>
          <tbody>
            {loading ? <tr><td className="table-state" colSpan={columns.length + (actions ? 1 : 0)}><span className="spinner" />Cargando registros...</td></tr>
              : rows.length === 0 ? <tr><td className="table-state empty-state" colSpan={columns.length + (actions ? 1 : 0)}><span className="empty-icon"><Search size={20} /></span><strong>{emptyLabel}</strong><span>Prueba otra búsqueda o agrega un nuevo registro.</span></td></tr>
                : rows.map((row, index) => <tr key={row.id ?? index}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : (row[column.key] ?? '—')}</td>)}{actions && <td>{actions(row)}</td>}</tr>)}
          </tbody>
        </table>
      </div>
      {pagination}
    </section>
  )
}
