import { useState, type FormEvent } from "react";
import { Button } from "../../../../shared/components/Button/index.ts";
import { Checkbox } from "../../../../shared/components/Checkbox/index.ts";
import { Input, InputType } from "../../../../shared/components/Input/index.ts";
import {
  Text,
  TextColor,
  TextSize,
  TextWeight,
} from "../../../../shared/components/Text/index.ts";
import { PasswordVisibilityIcon } from "./PasswordVisibilityIcon.tsx";
import { login } from '../../services/auth.ts'
import { useErrorToast } from '../../../../shared/hooks/useErrorToast.ts'

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useErrorToast(error)
  const canLogin = Boolean(email.trim() && password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canLogin) return;

    setIsLoading(true); setError(null)
    try { await login(email, password); window.location.assign('/members') } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No pudimos iniciar sesión.') } finally { setIsLoading(false) }
  }

  return (
    <section className="login-form-panel">
      <div className="login-form-panel__card">
        <div className="login-form-panel__intro">
          <span className="login-form-panel__mark" aria-hidden="true">
            FF
          </span>
          <Text as="h1" size={TextSize.XLarge} weight={TextWeight.ExtraBold}>
            Bienvenido a ForgeFit
          </Text>
          <Text color={TextColor.Secondary}>
            Accedé al panel de administración de tu gimnasio.
          </Text>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <Input
            id="login-email"
            name="email"
            label="Email"
            type={InputType.Email}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Ingresá tu email"
            autoComplete="email"
            startIcon={<MailIcon />}
          />
          <Input
            id="login-password"
            name="password"
            label="Contraseña"
            type={isPasswordVisible ? InputType.Text : InputType.Password}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Ingresá tu contraseña"
            autoComplete="current-password"
            endIcon={<PasswordVisibilityIcon isVisible={isPasswordVisible} />}
            onEndIconClick={() =>
              setIsPasswordVisible((isVisible) => !isVisible)
            }
          />

          <div className="login-form__options">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              label="Recordarme"
            />
            <button className="login-form__text-action" type="button">
              <Text as="span" size={TextSize.Small} weight={TextWeight.Medium}>
                ¿Olvidaste tu contraseña?
              </Text>
            </button>
          </div>

          <Button
            className="login-form__submit"
            type="submit"
            disabled={!canLogin || isLoading}
          >
            <Text as="span" weight={TextWeight.Bold}>
              {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
            </Text>
          </Button>
          <div className="login-form__register">
            <Text as="span" size={TextSize.Small} color={TextColor.Secondary}>
              ¿No tenés una cuenta?
            </Text>
            <a className="login-form__text-action" href="/auth/register">
              <Text as="span" size={TextSize.Small} weight={TextWeight.Bold}>
                Registrar gimnasio
              </Text>
            </a>
          </div>
        </form>
      </div>

      <footer className="login-form-panel__footer">
        <Text as="span" size={TextSize.Small} color={TextColor.Secondary}>
          Términos y condiciones
        </Text>
        <Text as="span" size={TextSize.Small} color={TextColor.Secondary}>
          Política de privacidad
        </Text>
      </footer>
    </section>
  );
}
