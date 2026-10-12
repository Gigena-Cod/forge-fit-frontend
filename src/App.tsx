import "./App.css";
import { Sidebar } from "./shared/components/Sidebar/index.ts";
import { Header } from "./shared/components/Header/index.ts";
import { MembersPage } from "./modules/members/presentations/Page.tsx";
import { HomePage } from "./modules/home/presentations/Page.tsx";
import { LoginPage } from "./modules/auth/presentations/LoginPage.tsx";
import { RegisterPage } from "./modules/auth/presentations/RegisterPage.tsx";
import { MemberDetailPage } from "./modules/members/presentations/Detail/Page.tsx";
import { PaymentsPage } from "./modules/payments/presentations/List/Page.tsx";
import { AttendancePage } from "./modules/attendance/presentations/List/Page.tsx";
import { SettingsPage } from "./modules/settings/presentations/Page.tsx";
import { ToastifyProvider } from './shared/components/Toastify/index.ts'
import { SessionBoundary } from './modules/auth/presentations/SessionBoundary.tsx'
import { canVisit, useSession } from './modules/auth/session.ts'
import { CheckInPage } from './modules/attendance/presentations/CheckInPage.tsx'
import { UsersPage } from './modules/users/presentations/Page.tsx'
import { ReportsPage } from './modules/reports/presentations/Page.tsx'

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

  return <ToastifyProvider>
    {pathname === "/auth/register" ? <RegisterPage />
      : pathname === "/auth/login" ? <LoginPage />
        : <SessionBoundary><AuthenticatedApp pathname={pathname} /></SessionBoundary>}
  </ToastifyProvider>;
}

function AuthenticatedApp({ pathname }: { pathname: string }) {
  const { user } = useSession();

  const isMemberDetailPage = pathname.startsWith("/members/");
  const isMembersPage = pathname === "/members" || isMemberDetailPage;
  const isPaymentsPage = pathname === "/payments";
  const isAttendancePage = pathname === "/attendance";
  const isSettingsPage = pathname === "/settings";
  const page = !canVisit(user.role, pathname) ? (
    <main className="operations-page"><div className="operations-content"><h1>Acceso restringido</h1><p>Tu rol no tiene permiso para consultar esta sección.</p><a href="/">Volver al inicio</a></div></main>
  ) : pathname === '/check-in' ? <CheckInPage /> : pathname === '/users' ? <UsersPage /> : pathname === '/reports' ? <ReportsPage /> : isMemberDetailPage ? (
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
  const title = pathname === '/check-in' ? 'Control de ingreso' : pathname === '/users' ? 'Usuarios' : pathname === '/reports' ? 'Reportes' : isMemberDetailPage
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
      <Sidebar />
      <Header title={title} />
      <div className="app-shell">{page}</div>
    </>
  );
}

export default App;
