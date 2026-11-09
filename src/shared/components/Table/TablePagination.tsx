import './TablePagination.css'

export function TablePagination({ page, limit, total, count, label, onPage }: {
  page: number; limit: number; total: number; count: number; label: string; onPage: (page: number) => void
}) {
  if (!total) return null
  const offset = (page - 1) * limit
  return <nav className="table-pagination" aria-label={`Paginación de ${label.toLocaleLowerCase()}`}>
    <p role="status">{label} {offset + 1}–{offset + count} de {total}</p>
    <div>
      <button type="button" className="operations-secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>Anterior</button>
      <button type="button" className="operations-secondary" disabled={offset + limit >= total} onClick={() => onPage(page + 1)}>Siguiente</button>
    </div>
  </nav>
}
