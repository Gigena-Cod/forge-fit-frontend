import { useRef, useState } from 'react';
import { useErrorToast } from '../../hooks/useErrorToast.ts';
import { logout } from '../../../modules/auth/services/auth.ts';
import { useSession } from '../../../modules/auth/session.ts';
import { Text, TextSize, TextWeight } from "../Text/index.ts";
import "./Header.css";

type HeaderProps = {
  title: string;
};

const actions = [
  { label: "Buscar", icon: "⌕" },
  { label: "Aplicaciones", icon: "⊞" },
  { label: "Notificaciones", icon: "♧" },
];

export function Header({ title }: HeaderProps) {
  const { user } = useSession();
  const initials = user.fullName.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase() || 'FF';
  const [loggingOut, setLoggingOut] = useState(false);
  const accountPopover = useRef<HTMLDivElement>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  useErrorToast(logoutError);

  async function closeSession() {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
    } catch {
      setLogoutError("No pudimos cerrar la sesión. Volvé a intentarlo.");
      setLoggingOut(false);
    }
  }

  return (
    <header className="header">
      <Text as="h2" size={TextSize.Large} weight={TextWeight.Bold}>
        {title}
      </Text>
      <div className="header__actions" aria-label="Acciones rápidas">
        {actions.map((action) => (
          <button
            key={action.label}
            className="header__action"
            type="button"
            aria-label={action.label}
            title={action.label}
          >
            {action.icon}
          </button>
        ))}
        <button type="button" className="header__avatar" aria-label="Mi cuenta" popoverTarget="account-popover">
          {initials}
        </button>
        <div ref={accountPopover} className="header__account" id="account-popover" popover="auto" aria-label="Opciones de cuenta">
          <p className="header__account-name">{user.fullName}</p>
          <a href="/account" onClick={() => accountPopover.current?.hidePopover()}>Configuración de mi cuenta</a>
          <button type="button" disabled={loggingOut} onClick={closeSession}>
            {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </div>
      </div>
    </header>
  );
}
