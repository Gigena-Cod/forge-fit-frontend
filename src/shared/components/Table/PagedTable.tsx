import type { ComponentProps } from 'react'
import type { usePagedList } from '../../hooks/usePagedList.ts'
import { Table } from './Table.tsx'
import { TablePagination } from './TablePagination.tsx'

export function PagedTable<T>({ list, label, empty, ...props }: Omit<ComponentProps<typeof Table<T>>, 'data'> & {
  list: ReturnType<typeof usePagedList<T>>
  label: string
  empty: string
}) {
  if (list.loading) return <p role="status">Cargando {label.toLocaleLowerCase()}…</p>
  if (list.error) return <div className="operations-error" role="alert">
    <p>No pudimos cargar {label.toLocaleLowerCase()}.</p>
    <button type="button" className="operations-secondary" onClick={list.reload}>Reintentar</button>
  </div>
  if (!list.data?.items.length) return <p>{empty}</p>
  return <>
    <Table {...props} data={list.data.items} />
    <TablePagination {...list.data} count={list.data.items.length} label={label} onPage={list.setPage} />
  </>
}
