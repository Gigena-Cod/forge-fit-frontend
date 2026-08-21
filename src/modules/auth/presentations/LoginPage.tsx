import { LoginForm } from "./subcomponents/LoginForm.tsx";
import { LoginVisualPanel } from "./subcomponents/LoginVisualPanel.tsx";
import "./LoginPage.css";

export function LoginPage() {
  return (
    <main className="login-page">
      <LoginVisualPanel />
      <LoginForm />
    </main>
  );
}
