import type { ReactNode } from "react";
import "./Sidebar.css";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
      <rect x="14" y="14" width="6.5" height="6.5" rx="1" />
    </svg>
  );
}

function MembersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c.8-3.5 3.3-5.5 7.5-5.5s6.7 2 7.5 5.5" />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function AttendanceIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12 2.3 2.3 4.8-5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5.3v-3h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

function ForgeFitMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 8h18M3 16h18M6 5v14M18 5v14M9 12h6" />
    </svg>
  );
}

type NavigationItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/", icon: <DashboardIcon /> },
  { label: "Socios", href: "/members", icon: <MembersIcon /> },
  { label: "Pagos", href: "/payments", icon: <PaymentsIcon /> },
  { label: "Asistencias", href: "/attendance", icon: <AttendanceIcon /> },
  { label: "Configuración", href: "/settings", icon: <SettingsIcon /> },
];

/** Navegación colapsada: su expansión se agregará en una iteración posterior. */
export function Sidebar() {
  const pathname = window.location.pathname;

  return (
    <aside className="sidebar" aria-label="Navegación principal">
      <a className="sidebar__brand" href="/" aria-label="Ir al inicio">
        <ForgeFitMark />
      </a>
      <nav className="sidebar__navigation">
        {navigationItems.map((item) => (
          <a
            key={item.label}
            className={`sidebar__item${pathname === item.href || (item.href === "/members" && pathname.startsWith("/members/")) ? " sidebar__item--active" : ""}`}
            href={item.href}
            title={item.label}
            aria-label={item.label}
            aria-current={
              pathname === item.href ||
              (item.href === "/members" && pathname.startsWith("/members/"))
                ? "page"
                : undefined
            }
          >
            {item.icon}
          </a>
        ))}
      </nav>
    </aside>
  );
}
