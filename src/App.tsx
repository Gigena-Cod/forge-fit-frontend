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

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/auth/register") {
    return <RegisterPage />;
  }

  if (pathname === "/auth/login") {
    return <LoginPage />;
  }

  const isMemberDetailPage = pathname.startsWith("/members/");
  const isMembersPage = pathname === "/members" || isMemberDetailPage;
  const isPaymentsPage = pathname === "/payments";
  const isAttendancePage = pathname === "/attendance";
  const isSettingsPage = pathname === "/settings";
  const page = isMemberDetailPage ? (
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
  const title = isMemberDetailPage
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
    <ToastifyProvider>
    <>
      <Sidebar />
      <Header title={title} />
      <div className="app-shell">{page}</div>
    </>
    </ToastifyProvider>
  );
}

export default App;
