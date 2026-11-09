import "./App.css";
import { useEffect, useState, type MouseEvent } from "react";
import { Sidebar } from "./shared/components/Sidebar/index.ts";
import { Header } from "./shared/components/Header/index.ts";
import { MembersPage } from "./modules/members/presentations/Page.tsx";
import { HomePage } from "./modules/home/presentations/Page.tsx";
import { LandingPage } from "./modules/home/presentations/LandingPage.tsx";
import { LoginPage } from "./modules/auth/presentations/LoginPage.tsx";
import { RegisterPage } from "./modules/auth/presentations/RegisterPage.tsx";
import { MemberDetailPage } from "./modules/members/presentations/Detail/Page.tsx";
import { PaymentsPage } from "./modules/payments/presentations/List/Page.tsx";
import { AttendancePage } from "./modules/attendance/presentations/List/Page.tsx";
import { SettingsPage } from "./modules/settings/presentations/Page.tsx";
import { ToastifyProvider } from './shared/components/Toastify/index.ts'
import { SessionBoundary } from './modules/auth/presentations/SessionBoundary.tsx'
import { canVisit, useSession, type Session } from './modules/auth/session.ts'
import { CheckInPage } from './modules/attendance/presentations/CheckInPage.tsx'
import { UsersPage } from './modules/users/presentations/Page.tsx'
import { ReportsPage } from './modules/reports/presentations/Page.tsx'
import { AccountPage } from './modules/auth/presentations/AccountPage.tsx'

const currentPath = () => window.location.pathname.replace(/\/+$/, "") || "/";
const isPrivate = (path: string) => path !== "/" && !path.startsWith("/auth/");

function App() {
  const [pathname, setPathname] = useState(currentPath);
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    const onPopState = () => setPathname(currentPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function followPrivateLink(event: MouseEvent) {
    if (!isPrivate(pathname) || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(link instanceof HTMLAnchorElement) || link.origin !== window.location.origin || link.target || link.hasAttribute("download") || link.hash || !isPrivate(link.pathname)) return;
    event.preventDefault();
    window.history.pushState(null, "", link.href);
    setPathname(currentPath());
  }

  return <ToastifyProvider><div onClick={followPrivateLink}>
    {pathname === "/" ? <LandingPage />
      : pathname === "/auth/register" ? <RegisterPage />
      : pathname === "/auth/login" ? <LoginPage onAuthenticated={(profile) => {
        setSession(profile);
        window.history.replaceState(null, "", "/members");
        setPathname("/members");
      }} />
        : <SessionBoundary initialSession={session}><AuthenticatedApp pathname={pathname} /></SessionBoundary>}
  </div></ToastifyProvider>;
}

function AuthenticatedApp({ pathname }: { pathname: string }) {
  const { user } = useSession();

  const isMemberDetailPage = pathname.startsWith("/members/");
  const isMembersPage = pathname === "/members" || isMemberDetailPage;
  const isPaymentsPage = pathname === "/payments";
  const isAttendancePage = pathname === "/attendance";
  const isSettingsPage = pathname === "/settings";
  const page = !canVisit(user.role, pathname) ? (
    <main className="operations-page"><div className="operations-content"><h1>Acceso restringido</h1><p>Tu rol no tiene permiso para consultar esta sección.</p><a href="/dashboard">Volver al inicio</a></div></main>
  ) : pathname === '/account' ? <AccountPage /> : pathname === '/check-in' ? <CheckInPage /> : pathname === '/users' ? <UsersPage /> : pathname === '/reports' ? <ReportsPage /> : isMemberDetailPage ? (
    <MemberDetailPage />
  ) : isMembersPage ? (
    <MembersPage />
  ) : isPaymentsPage ? (
    <PaymentsPage />
  ) : isAttendancePage ? (
    <AttendancePage />
  ) : isSettingsPage ? (
    <SettingsPage />
  ) : (
    <HomePage />
  );
  const title = pathname === '/account' ? 'Configuración de mi cuenta' : pathname === '/check-in' ? 'Control de ingreso' : pathname === '/users' ? 'Usuarios' : pathname === '/reports' ? 'Reportes' : isMemberDetailPage
    ? "Detalle del socio"
    : isMembersPage
      ? "Socios"
      : isPaymentsPage
        ? "Pagos"
        : isAttendancePage
          ? "Asistencias"
          : isSettingsPage
            ? "Configuración"
            : "Inicio";

  return (
    <>
      <Sidebar pathname={pathname} />
      <Header title={title} />
      <div className="app-shell" key={pathname}>{page}</div>
    </>
  );
}

export default App;
