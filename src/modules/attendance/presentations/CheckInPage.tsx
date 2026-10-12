import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { IScannerControls } from '@zxing/browser'
import { apiRequest } from '../../../shared/services/api.ts'
import { Button } from '../../../shared/components/Button/index.ts'
import '../../../shared/styles/operations.css'

type CheckIn = { allowed: boolean; reason: string; replayed: boolean; attendance: { memberId: string; entryAt: string } | null }
const reasons: Record<string, string> = {
  ACCESS_GRANTED: 'La asistencia quedó registrada.', QR_INVALID: 'El QR no es válido. Verificá la credencial del socio.',
  MEMBER_INACTIVE: 'El socio está inactivo.', PAYMENT_MISSING: 'No hay una cuota registrada para el período actual.',
  PAYMENT_PENDING: 'La cuota está pendiente de pago.', PAYMENT_OVERDUE: 'La cuota está vencida.',
  PAYMENT_CONFLICT: 'Hay cuotas en conflicto. Revisá los pagos del socio.',
}

export function CheckInPage() {
  const [payload, setPayload] = useState('')
  const [result, setResult] = useState<CheckIn | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [camera, setCamera] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [retry, setRetry] = useState(false)
  const pending = useRef<{ qrPayload: string; requestId: string } | null>(null)
  const locked = useRef(false)
  const video = useRef<HTMLVideoElement>(null)
  const input = useRef<HTMLInputElement>(null)

  async function submit(qrPayload: string) {
    if (locked.current || result || qrPayload.trim().length < 10) return
    locked.current = true
    setBusy(true); setError(''); setCamera(false)
    try {
      pending.current ??= { qrPayload: qrPayload.trim(), requestId: crypto.randomUUID() }
      const response = await apiRequest<CheckIn>('/attendance/check-in', { method: 'POST', body: JSON.stringify(pending.current) })
      setResult(response); setRetry(false); pending.current = null
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos verificar el ingreso.')
      setRetry(true)
    } finally { locked.current = false; setBusy(false) }
  }
  // The ref lets the camera use the latest submit state without restarting its stream.
  const onScan = useRef(submit)
  useEffect(() => { onScan.current = submit })
  useEffect(() => {
    if (!camera) return
    let cancelled = false
    let controls: IScannerControls | undefined
    let stream: MediaStream | undefined
    let captured = false
    async function start() {
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser')
        if (cancelled) return
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        if (cancelled) { stream.getTracks().forEach(track => track.stop()); return }
        controls = await new BrowserQRCodeReader().decodeFromStream(stream, video.current!, (code, _error, scanner) => {
          if (!code || cancelled || captured) return
          captured = true; scanner.stop()
          const value = code.getText()
          setPayload(value); setCamera(false)
          if (value.trim().length < 10) setCameraError('El código leído no es una credencial válida.')
          else void onScan.current(value)
        })
        if (cancelled || captured) controls.stop()
      } catch {
        if (!cancelled) { setCameraError('No pudimos abrir la cámara. Revisá sus permisos y usá HTTPS o localhost. También podés usar un lector o pegar el código.'); setCamera(false) }
        stream?.getTracks().forEach(track => track.stop())
      }
    }
    void start()
    return () => { cancelled = true; controls?.stop(); stream?.getTracks().forEach(track => track.stop()) }
  }, [camera])

  function next() {
    pending.current = null; setPayload(''); setResult(null); setError(''); setCameraError(''); setRetry(false)
    input.current?.focus()
  }
  function handleSubmit(event: FormEvent) { event.preventDefault(); void submit(payload) }
  return <main className="operations-page"><div className="operations-content">
    <div className="operations-intro"><h1>Control de ingreso</h1><p className="operations-muted">Escaneá la credencial del socio para verificar su habilitación y registrar la asistencia.</p></div>
    <section className="operations-panel" aria-label="Lectura de credencial">
      <form onSubmit={handleSubmit} className="operations-intro">
        <label>Credencial QR<input ref={input} autoFocus value={payload} onChange={event => setPayload(event.target.value)} placeholder="Escaneá o pegá el contenido del QR" aria-describedby="usb-reader-help" autoComplete="off" minLength={10} required readOnly={busy || retry || !!result || camera} /></label>
        <p id="usb-reader-help" className="operations-muted">Para usar un lector USB en modo teclado, seleccioná el campo y escaneá la credencial. Si el lector no envía Enter al terminar, presioná Verificar ingreso.</p>
        <div className="operations-actions"><Button type="submit" disabled={busy || !!result || camera || payload.trim().length < 10}>{busy ? 'Verificando…' : retry ? 'Reintentar el mismo ingreso' : 'Verificar ingreso'}</Button>
        <button type="button" className="operations-secondary" disabled={busy || retry || !!result} onClick={() => { setCameraError(''); setCamera(!camera) }}>{camera ? 'Detener cámara' : 'Usar cámara'}</button></div>
      </form>
      {camera && <video className="operations-camera" ref={video} muted playsInline aria-label="Vista de cámara para leer QR" />}
      {cameraError && <p className="operations-error" role="alert">{cameraError}</p>}
    </section>
    {busy && <p role="status">Consultando la habilitación…</p>}
    {error && <div className="operations-error" role="alert"><p>{error}</p><p>El resultado no pudo confirmarse. Reintentá el mismo ingreso para evitar duplicados.</p></div>}
    {result && <section className={`operations-result ${result.allowed ? 'operations-success' : 'operations-error'}`} role="status">
      <h2>{result.allowed ? 'Ingreso permitido' : 'Ingreso rechazado'}</h2><p>{reasons[result.reason] ?? 'No fue posible autorizar el ingreso. Consultá en administración.'}</p>
      {result.attendance && <><p>Fecha y hora: {new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(result.attendance.entryAt))}</p><a href={`/members/${encodeURIComponent(result.attendance.memberId)}`}>Ver socio</a></>}
      {result.replayed && <p>Este ingreso ya estaba registrado; no se creó otra asistencia.</p>}
    </section>}
    {(result || retry) && <button className="operations-secondary" disabled={busy} onClick={next}>{retry ? 'Descartar reintento y comenzar otro ingreso' : 'Siguiente ingreso'}</button>}
  </div></main>
}
