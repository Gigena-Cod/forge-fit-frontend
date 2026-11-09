import { useRef, useState, type FormEvent } from 'react'
import { apiRequest } from '../../../shared/services/api.ts'
import { Button } from '../../../shared/components/Button/index.ts'
import '../../../shared/styles/operations.css'
import './CheckInPage.css'

type CheckIn = {
  allowed: boolean
  reason: string
  replayed: boolean
  attendance: { memberId: string; entryAt: string } | null
  member?: { id: string; name: string; dni: string; membershipStatus: string } | null
  payment?: { period: string; status: string }
}

const reasons: Record<string, string> = {
  ACCESS_GRANTED: 'La asistencia quedó registrada.',
  QR_INVALID: 'El QR no es válido. Verificá la credencial del socio.',
  MEMBER_INACTIVE: 'El socio está inactivo.',
  PAYMENT_MISSING: 'No hay una cuota registrada para el período actual.',
  PAYMENT_PENDING: 'La cuota está pendiente de pago.',
  PAYMENT_OVERDUE: 'La cuota está vencida.',
  PAYMENT_CONFLICT: 'Hay cuotas en conflicto. Revisá los pagos del socio.',
}

const paymentLabels: Record<string, string> = {
  PAID: 'Pagada', PENDING: 'Pendiente', OVERDUE: 'Vencida', MISSING: 'Sin registrar', CONFLICT: 'En conflicto',
}

export function CheckInPage() {
  const [payload, setPayload] = useState('')
  const [result, setResult] = useState<CheckIn | null>(null)
  const [busy, setBusy] = useState(false)
  const [retry, setRetry] = useState(false)
  const [lastRead, setLastRead] = useState<Date | null>(null)
  const pending = useRef<{ qrPayload: string; requestId: string } | null>(null)
  const locked = useRef(false)
  const input = useRef<HTMLInputElement>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    const qrPayload = payload.trim()
    if (locked.current || result || qrPayload.length < 10) return
    locked.current = true
    setBusy(true)
    setRetry(false)
    try {
      if (!pending.current) {
        pending.current = { qrPayload, requestId: crypto.randomUUID() }
        setLastRead(new Date())
      }
      const response = await apiRequest<CheckIn>('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify(pending.current),
      })
      setResult(response)
      pending.current = null
    } catch {
      setRetry(true)
    } finally {
      locked.current = false
      setBusy(false)
    }
  }

  function next() {
    pending.current = null
    setPayload('')
    setResult(null)
    setRetry(false)
    input.current?.focus()
  }

  const member = result?.member
  const memberId = member?.id ?? result?.attendance?.memberId
  const status = busy ? 'Validando ingreso…'
    : retry ? 'Validación sin confirmar'
    : result ? 'Validación finalizada'
    : payload ? 'Recibiendo código…' : 'Esperando lectura'

  return (
    <main className="operations-page"><div className="operations-content">
      <header className="operations-intro">
        <h1>Control de ingreso</h1>
        <p className="operations-muted">Escaneá la credencial del socio para verificar su habilitación y registrar la asistencia.</p>
      </header>

      <div className="check-in-grid">
        <section className="operations-panel check-in-panel" aria-labelledby="reader-title">
          <div className="operations-intro">
            <h2 id="reader-title">Lector QR USB</h2>
            <p className="check-in-status" role="status" data-active={busy || (!!payload && !result && !retry)}>{status}</p>
            <p className="operations-muted">
              {lastRead ? `Último código recibido a las ${lastRead.toLocaleTimeString('es-AR')}.` : 'Todavía no se recibió ningún código.'}
              {' '}El navegador recibe el código como texto. El estado del cable USB se verifica en la computadora.
            </p>
          </div>
          <form onSubmit={submit} className="operations-intro">
            <label>Credencial QR
              <input ref={input} autoFocus type="password" value={payload} onChange={event => setPayload(event.target.value)}
                placeholder="Escaneá o pegá el código" aria-describedby="usb-reader-help" autoComplete="off"
                minLength={10} required readOnly={busy || retry || !!result} />
            </label>
            <p id="usb-reader-help" className="operations-muted">Hacé clic en el campo y escaneá. Si tu lector no envía Enter, pulsá Verificar ingreso.</p>
            <div className="operations-actions">
              <Button type="submit" disabled={busy || !!result || payload.trim().length < 10}>
                {busy ? 'Validando…' : retry ? 'Reintentar el mismo ingreso' : 'Verificar ingreso'}
              </Button>
              {(result || retry) && <button type="button" className="operations-secondary" onClick={next}>
                {retry ? 'Descartar reintento' : 'Siguiente ingreso'}
              </button>}
            </div>
          </form>
          {retry && <p className="operations-error" role="alert">El resultado no pudo confirmarse. Reintentá el mismo ingreso para evitar duplicados.</p>}
        </section>

        <section className="operations-panel check-in-panel" aria-labelledby="check-in-member-title">
          <h2 id="check-in-member-title">Datos del socio</h2>
          {result ? (
            <>
              <div className={result.allowed ? 'operations-success operations-intro' : 'operations-error operations-intro'} role="status">
                <h3>{result.allowed ? 'Ingreso permitido' : 'Ingreso rechazado'}</h3>
                <p>{reasons[result.reason] ?? 'No fue posible autorizar el ingreso. Consultá en administración.'}</p>
                {result.replayed && <p>Este ingreso ya estaba registrado; no se creó otra asistencia.</p>}
              </div>
              {member && <dl className="check-in-details">
                <div><dt>Nombre</dt><dd>{member.name}</dd></div>
                <div><dt>DNI</dt><dd>{member.dni}</dd></div>
                <div><dt>Membresía</dt><dd>{member.membershipStatus === 'ACTIVE' ? 'Activa' : 'Inactiva'}</dd></div>
                {result.payment && <div><dt>Cuota · {result.payment.period}</dt><dd>{paymentLabels[result.payment.status] ?? result.payment.status}</dd></div>}
              </dl>}
              {result.attendance && <p>Fecha y hora: {new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(result.attendance.entryAt))}</p>}
              {memberId && <a href={`/members/${encodeURIComponent(memberId)}`}>Ver socio</a>}
            </>
          ) : <p className="check-in-empty operations-muted">
            {busy ? 'Consultando la habilitación del socio…' : 'Acá vas a ver los datos del socio y el resultado de la validación.'}
          </p>}
        </section>
      </div>
    </div></main>
  )
}
