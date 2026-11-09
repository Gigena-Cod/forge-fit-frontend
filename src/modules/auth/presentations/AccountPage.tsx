import { useSession } from '../session.ts'
import { roleLabels } from '../../users/services/users.ts'
import '../../../shared/styles/operations.css'

export function AccountPage() {
  const { user } = useSession()
  return <main className="operations-page"><div className="operations-content">
    <h1>Mi cuenta</h1>
    <section className="operations-panel" aria-label="Datos de la cuenta">
      <h2>Datos de la cuenta</h2>
      <p><strong>Nombre:</strong> {user.fullName}</p>
      {user.email && <p><strong>Email:</strong> {user.email}</p>}
      <p><strong>Rol:</strong> {roleLabels[user.role]}</p>
    </section>
  </div></main>
}
