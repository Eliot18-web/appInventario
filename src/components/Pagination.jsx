import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, pages, total, limit, onPageChange, onLimitChange }) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  return (
    <div className="pagination-bar">
      <span>Mostrando <strong>{start}–{end}</strong> de <strong>{total}</strong></span>
      <div className="pagination-controls">
        <label>Filas
          <select value={limit} onChange={(event) => onLimitChange(Number(event.target.value))} aria-label="Filas por página">
            {[5, 10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
        <button type="button" className="page-button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Página anterior"><ChevronLeft size={17} /></button>
        <span className="page-number">{page} / {Math.max(pages, 1)}</span>
        <button type="button" className="page-button" onClick={() => onPageChange(page + 1)} disabled={page >= pages} aria-label="Página siguiente"><ChevronRight size={17} /></button>
      </div>
    </div>
  )
}
