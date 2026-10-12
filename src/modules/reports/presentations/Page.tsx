import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { apiRequest } from '../../../shared/services/api.ts'
import { Button } from '../../../shared/components/Button/index.ts'
import { Table } from '../../../shared/components/Table/index.ts'
import '../../../shared/styles/operations.css'

type MembersReport = { total: number; active: number; inactive: number; registrations: number }
type PaymentSummary = { count: number; amount: number }
type PaymentsReport = { currency: string; paid: PaymentSummary; pending: PaymentSummary; overdue: PaymentSummary }
type AttendanceReport = { totalEntries: number; uniqueMembers: number; entriesByDay: { date: string; entries: number }[] }
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

function Metric({ label, value, detail }: { label: string; value: ReactNode; detail?: string }) {
  return <div className="operations-metric"><span className="operations-muted">{label}</span><strong>{value}</strong>{detail && <span>{detail}</span>}</div>
}

function ReportSection<T>({ title, endpoint, periods = false, children }: { title: string; endpoint: string; periods?: boolean; children: (data: T) => ReactNode }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [request, setRequest] = useState({ query: '', version: 0, label: 'Todo el historial' })
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [validation, setValidation] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    apiRequest<T>(`/reports/${endpoint}${request.query}`, { signal: controller.signal }).then(result => { if (!controller.signal.aborted) setData(result) }).catch(() => {
      if (!controller.signal.aborted) setError('No pudimos cargar este reporte. Intentá nuevamente.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [endpoint, request])
  function apply(event: FormEvent) {
    event.preventDefault()
    if (Boolean(from) !== Boolean(to)) { setValidation('Completá ambos extremos del rango o dejá los dos vacíos.'); return }
    if (from && from > to) { setValidation('El inicio no puede ser posterior al fin.'); return }
    const params = new URLSearchParams(periods ? { periodFrom: from, periodTo: to } : { from, to })
    setValidation(''); setError(''); setData(null); setLoading(true)
    setRequest({ query: from ? `?${params}` : '', version: request.version + 1, label: from ? `${from} → ${to}` : 'Todo el historial' })
  }
  return <section className="operations-panel" aria-label={title}>
    <h2>{title}</h2>
    <form className="operations-toolbar" onSubmit={apply}>
      <label>Desde<input type={periods ? 'month' : 'date'} value={from} onChange={event => setFrom(event.target.value)} /></label>
      <label>Hasta<input type={periods ? 'month' : 'date'} value={to} onChange={event => setTo(event.target.value)} /></label>
      <Button type="submit">Aplicar</Button>
    </form>
    {validation && <p role="alert" className="operations-error">{validation}</p>}
    <p className="operations-muted">Rango consultado: {request.label}. Dejá ambos campos vacíos para consultar todo.</p>
    {loading && <p role="status">Cargando {title.toLocaleLowerCase()}…</p>}
    {error && <div className="operations-error" role="alert"><p>{error}</p><button className="operations-secondary" onClick={() => { setError(''); setLoading(true); setRequest({ ...request, version: request.version + 1 }) }}>Reintentar</button></div>}
    {!loading && !error && data && children(data)}
  </section>
}

export function ReportsPage() {
  return <main className="operations-page"><div className="operations-content">
    <div className="operations-intro"><h1>Reportes administrativos</h1><p className="operations-muted">Socios, cuotas e ingresos del gimnasio. Cada reporte tiene su propio rango de consulta.</p></div>
    <ReportSection<MembersReport> title="Socios" endpoint="members">{data => <>
      <div className="operations-metrics"><Metric label="Total de socios" value={data.total} /><Metric label="Activos" value={data.active} /><Metric label="Inactivos" value={data.inactive} /><Metric label="Altas en el rango" value={data.registrations} /></div>
      <p className="operations-muted">El rango filtra las altas. Total, activos e inactivos corresponden a todos los socios.</p>
    </>}</ReportSection>
    <ReportSection<PaymentsReport> title="Pagos" endpoint="payments" periods>{data => <>
      <div className="operations-metrics"><Metric label="Pagado" value={money.format(data.paid.amount)} detail={`${data.paid.count} cuotas`} /><Metric label="Pendiente" value={money.format(data.pending.amount)} detail={`${data.pending.count} cuotas`} /><Metric label="Vencido" value={money.format(data.overdue.amount)} detail={`${data.overdue.count} cuotas`} /></div>
      <p className="operations-muted">Importes en pesos argentinos. Los pagos anulados están excluidos.</p>
    </>}</ReportSection>
    <ReportSection<AttendanceReport> title="Asistencias" endpoint="attendance">{data => <>
      <div className="operations-metrics"><Metric label="Ingresos autorizados" value={data.totalEntries} /><Metric label="Socios que ingresaron" value={data.uniqueMembers} /></div>
      {data.entriesByDay.length ? <Table data={data.entriesByDay} getRowId={item => item.date} minWidth={300} columns={[
        { id: 'date', header: 'Fecha', render: item => new Intl.DateTimeFormat('es-AR').format(new Date(`${item.date}T12:00:00`)) },
        { id: 'entries', header: 'Ingresos', render: item => item.entries },
      ]} /> : <p>No hay ingresos autorizados en el rango consultado.</p>}
    </>}</ReportSection>
  </div></main>
}
