import { LoginForm } from "./subcomponents/LoginForm.tsx";
import { LoginVisualPanel } from "./subcomponents/LoginVisualPanel.tsx";
import type { Session } from "../session.ts";
import "./LoginPage.css";

export function LoginPage({ onAuthenticated }: { onAuthenticated: (session: Session) => void }) {
  return (
    <main className="login-page">
      <LoginVisualPanel />
      <LoginForm onAuthenticated={onAuthenticated} />
    </main>
  );
}
