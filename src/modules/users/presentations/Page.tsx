import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '../../../shared/components/Button/index.ts'
import { Table, type TableColumn } from '../../../shared/components/Table/index.ts'
import { ApiError, clearAccessToken } from '../../../shared/services/api.ts'
import { useSession } from '../../auth/session.ts'
import { getRoles, getUsers, roleLabels, saveUser, type RoleDefinition, type User } from '../services/users.ts'
import '../../../shared/styles/operations.css'

function errorMessage(cause: unknown) {
  if (cause instanceof ApiError) {
    if (cause.code === 'EMAIL_ALREADY_EXISTS') return 'Ese email ya pertenece a otra cuenta.'
    if (cause.code === 'LAST_OWNER') return 'No se puede desactivar ni cambiar el rol del último propietario activo.'
    if (cause.status === 403) return 'No tenés permiso para realizar esta acción.'
  }
  return 'No pudimos completar la operación. Intentá nuevamente.'
}

function UserEditor({ user, roles, onClose, onSaved }: { user: User | null; roles: RoleDefinition[]; onClose: () => void; onSaved: (user: User) => void }) {
  const session = useSession()
  const [role, setRole] = useState(user?.role ?? 'RECEPTIONIST')
  const [status, setStatus] = useState(user?.accountStatus ?? 'ACTIVE')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const locked = useRef(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (locked.current) return
    const data = new FormData(event.currentTarget)
    const body: Record<string, string> = {}
    for (const key of ['fullName', 'dni', 'phone', 'email']) body[key] = String(data.get(key) ?? '').trim()
    if (Object.values(body).some(value => !value)) { setError('Completá todos los datos del usuario.'); return }
    if (!user) body.password = String(data.get('password') ?? '')
    if (role !== 'OWNER') body.role = role
    if (user) body.accountStatus = status
    locked.current = true; setBusy(true); setError('')
    try {
      const saved = await saveUser(user?._id, body)
      if (user?._id === session.user.id) { clearAccessToken(); window.location.assign('/auth/login'); return }
      onSaved(saved)
    } catch (cause) { setError(errorMessage(cause)) }
    finally { locked.current = false; setBusy(false) }
  }
  return <form className="operations-panel" onSubmit={submit} aria-label={user ? 'Editar usuario' : 'Nuevo usuario'}>
    <h2>{user ? 'Editar usuario' : 'Nuevo usuario'}</h2>
    <div className="operations-fields">
      <label>Nombre completo<input autoFocus name="fullName" defaultValue={user?.fullName} required disabled={busy} autoComplete="name" /></label>
      <label>DNI<input name="dni" defaultValue={user?.dni} required disabled={busy} /></label>
      <label>Teléfono<input name="phone" type="tel" defaultValue={user?.phone} required disabled={busy} autoComplete="tel" /></label>
      <label>Email<input name="email" type="email" defaultValue={user?.email} required disabled={busy} autoComplete="email" /></label>
      {!user && <label>Contraseña inicial<input name="password" type="password" minLength={8} required disabled={busy} autoComplete="new-password" /><span className="operations-muted">Mínimo 8 caracteres.</span></label>}
      <label htmlFor="user-role"><span id="user-role-label">Rol</span><select id="user-role" aria-labelledby="user-role-label" value={role} onChange={event => setRole(event.target.value as User['role'])} disabled={busy}>
        {user?.role === 'OWNER' && <option value="OWNER">Propietario (actual)</option>}
        {roles.filter(item => item.code !== 'OWNER').map(item => <option key={item.code} value={item.code}>{roleLabels[item.code]}</option>)}
      </select></label>
      {user && <label htmlFor="user-status"><span id="user-status-label">Estado</span><select id="user-status" aria-labelledby="user-status-label" value={status} onChange={event => setStatus(event.target.value as User['accountStatus'])} disabled={busy}><option value="ACTIVE">Activo</option><option value="INACTIVE">Inactivo</option></select></label>}
    </div>
    {user?.accountStatus === 'ACTIVE' && status === 'INACTIVE' && <label><span><input type="checkbox" required disabled={busy} /> Confirmo que este usuario dejará de acceder al sistema.</span></label>}
    {user?._id === session.user.id && <p className="operations-muted">Al guardar tus datos, vas a tener que iniciar sesión nuevamente.</p>}
    {error && <p role="alert" className="operations-error">{error}</p>}
    <div className="operations-actions"><Button type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar usuario'}</Button><button type="button" className="operations-secondary" disabled={busy} onClick={onClose}>Cancelar</button></div>
  </form>
}

export function UsersPage() {
  const session = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<{ user: User | null } | null>(null)
  const [notice, setNotice] = useState('')
  const canWrite = roles.find(item => item.code === session.user.role)?.permissions.includes('users:write') ?? false
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([getUsers(controller.signal), getRoles(controller.signal)]).then(([list, catalog]) => { setUsers(list); setRoles(catalog) }).catch(cause => {
      if (!controller.signal.aborted) setError(errorMessage(cause))
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [attempt])
  const filtered = users.filter(user => [user.fullName, user.email, user.dni, roleLabels[user.role]].some(value => value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())))
  const columns: TableColumn<User>[] = [
    { id: 'name', header: 'Nombre', render: user => user.fullName },
    { id: 'email', header: 'Email', render: user => user.email },
    { id: 'dni', header: 'DNI', render: user => user.dni },
    { id: 'phone', header: 'Teléfono', render: user => user.phone },
    { id: 'role', header: 'Rol', render: user => roleLabels[user.role] },
    { id: 'status', header: 'Estado', render: user => user.accountStatus === 'ACTIVE' ? 'Activo' : 'Inactivo' },
    ...(canWrite ? [{ id: 'actions', header: 'Acciones', render: (user: User) => <button className="operations-secondary" disabled={!!editor} onClick={() => { setNotice(''); setEditor({ user }) }} aria-label={`Editar ${user.fullName}`}>Editar</button> }] : []),
  ]
  return <main className="operations-page"><div className="operations-content">
    <div className="operations-intro"><h1>Usuarios del gimnasio</h1><p className="operations-muted">Consultá el equipo y sus accesos.{canWrite ? ' Administrá cuentas, roles y estados.' : ' Tu acceso permite consultar usuarios.'}</p></div>
    {notice && <p role="status" className="operations-success">{notice}</p>}
    {loading ? <p role="status">Cargando usuarios…</p> : error ? <div className="operations-error" role="alert"><p>{error}</p><button className="operations-secondary" onClick={() => { setError(''); setLoading(true); setAttempt(attempt + 1) }}>Reintentar</button></div> : <>
      <div className="operations-toolbar"><label>Buscar usuario<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nombre, email, DNI o rol" /></label>{canWrite && <Button disabled={!!editor} onClick={() => { setNotice(''); setEditor({ user: null }) }}>Nuevo usuario</Button>}</div>
      {editor && <UserEditor key={editor.user?._id ?? 'new'} user={editor.user} roles={roles} onClose={() => setEditor(null)} onSaved={saved => { setUsers(current => [...current.filter(user => user._id !== saved._id), saved].sort((a, b) => a.fullName.localeCompare(b.fullName))); setEditor(null); setNotice('Usuario guardado correctamente.') }} />}
      {filtered.length ? <Table columns={columns} data={filtered} getRowId={user => user._id} minWidth={900} /> : <p>{users.length ? 'No hay usuarios que coincidan con la búsqueda.' : 'No hay usuarios registrados.'}</p>}
    </>}
  </div></main>
}
