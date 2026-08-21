import { useState, type FormEvent } from "react";
import { Button } from "../../../shared/components/Button/index.ts";
import { Input, InputType } from "../../../shared/components/Input/index.ts";
import {
  Text,
  TextColor,
  TextSize,
  TextWeight,
} from "../../../shared/components/Text/index.ts";
import { PasswordVisibilityIcon } from "./subcomponents/PasswordVisibilityIcon.tsx";
import { register } from '../services/auth.ts'
import { useErrorToast } from '../../../shared/hooks/useErrorToast.ts'
import "./RegisterPage.css";

export function RegisterPage() {
  const [adminFullName, setAdminFullName] = useState("");
  const [adminDni, setAdminDni] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gymName, setGymName] = useState("");
  const [gymAddress, setGymAddress] = useState("");
  const [gymPhone, setGymPhone] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useErrorToast(error)
  const passwordsDoNotMatch =
    confirmPassword.length > 0 && password !== confirmPassword;
  const isFormValid = Boolean(
    adminFullName &&
    adminDni &&
    adminPhone &&
    adminEmail &&
    password &&
    confirmPassword &&
    gymName &&
    gymAddress &&
    !passwordsDoNotMatch,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFormValid) return
    setIsLoading(true); setError(null)
    try { await register({ administrator: { fullName: adminFullName, dni: adminDni, phone: adminPhone, email: adminEmail, password }, gym: { name: gymName, address: gymAddress, phone: gymPhone, contactEmail: adminEmail } }); window.location.assign('/members') } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No pudimos registrar el gimnasio.') } finally { setIsLoading(false) }
  }

  return (
    <main className="register-page">
      <section className="register-page__content">
        <div className="register-page__intro">
          <span className="register-page__mark" aria-hidden="true">
            FF
          </span>
          <Text as="h1" size={TextSize.XXLarge} weight={TextWeight.ExtraBold}>
            Registrá tu gimnasio en ForgeFit
          </Text>
          <Text color={TextColor.Secondary}>
            Creá tu cuenta de administrador y completá los datos básicos de tu
            gimnasio para comenzar.
          </Text>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <section className="register-form__section">
            <Text as="h2" size={TextSize.Large} weight={TextWeight.Bold}>
              Datos del administrador
            </Text>
            <Input
              id="register-full-name"
              name="name"
              label="Nombre completo"
              type={InputType.Text}
              value={adminFullName}
              onChange={(event) => setAdminFullName(event.target.value)}
              placeholder="Ingresá tu nombre completo"
              autoComplete="name"
            />
            <Input
              id="register-dni"
              name="dni"
              label="DNI"
              type={InputType.Text}
              value={adminDni}
              onChange={(event) => setAdminDni(event.target.value)}
              placeholder="Ingresá tu DNI"
            />
            <Input
              id="register-phone"
              name="phone"
              label="Teléfono"
              type={InputType.Tel}
              value={adminPhone}
              onChange={(event) => setAdminPhone(event.target.value)}
              placeholder="Ingresá tu teléfono"
              autoComplete="tel"
            />
            <Input
              id="register-email"
              name="email"
              label="Email"
              type={InputType.Email}
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              placeholder="Ingresá tu email"
              autoComplete="email"
            />
            <Input
              id="register-password"
              name="password"
              label="Contraseña"
              type={isPasswordVisible ? InputType.Text : InputType.Password}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresá una contraseña"
              autoComplete="new-password"
              endIcon={<PasswordVisibilityIcon isVisible={isPasswordVisible} />}
              onEndIconClick={() =>
                setIsPasswordVisible((isVisible) => !isVisible)
              }
            />
            <Input
              id="register-confirm-password"
              name="confirm-password"
              label="Confirmar contraseña"
              type={
                isConfirmPasswordVisible ? InputType.Text : InputType.Password
              }
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repetí tu contraseña"
              autoComplete="new-password"
              error={passwordsDoNotMatch}
              helperText={
                passwordsDoNotMatch
                  ? "Las contraseñas no coinciden."
                  : undefined
              }
              endIcon={
                <PasswordVisibilityIcon isVisible={isConfirmPasswordVisible} />
              }
              onEndIconClick={() =>
                setIsConfirmPasswordVisible((isVisible) => !isVisible)
              }
            />
          </section>

          <section className="register-form__section register-form__section--access">
            <Text as="h2" size={TextSize.Large} weight={TextWeight.Bold}>
              Datos del gimnasio
            </Text>
            <Input
              id="register-gym-name"
              name="gym-name"
              label="Nombre del gimnasio"
              type={InputType.Text}
              value={gymName}
              onChange={(event) => setGymName(event.target.value)}
              placeholder="Ingresá el nombre de tu gimnasio"
            />
            <Input
              id="register-gym-address"
              name="gym-address"
              label="Dirección"
              type={InputType.Text}
              value={gymAddress}
              onChange={(event) => setGymAddress(event.target.value)}
              placeholder="Ingresá la dirección del gimnasio"
            />
            <Input
              id="register-gym-phone"
              name="gym-phone"
              label="Teléfono del gimnasio"
              type={InputType.Tel}
              value={gymPhone}
              onChange={(event) => setGymPhone(event.target.value)}
              placeholder="Ingresá un teléfono de contacto"
              autoComplete="tel"
            />
          </section>

          <div className="register-form__actions">
            <Button type="submit" disabled={!isFormValid || isLoading}>
              <Text as="span" weight={TextWeight.Bold}>
                {isLoading ? 'Registrando...' : 'Registrar gimnasio'}
              </Text>
            </Button>
            <div className="register-form__login">
              <Text as="span" size={TextSize.Small} color={TextColor.Secondary}>
                ¿Ya tenés una cuenta?
              </Text>
              <a className="register-form__login-button" href="/auth/login">
                <Text as="span" size={TextSize.Small} weight={TextWeight.Bold}>
                  Iniciar sesión
                </Text>
              </a>
            </div>
          </div>
        </form>
      </section>

      <footer className="register-page__footer">
        <Text as="span" size={TextSize.Small} color={TextColor.Secondary}>
          Términos y condiciones
        </Text>
        <Text as="span" size={TextSize.Small} color={TextColor.Secondary}>
          Política de privacidad
        </Text>
      </footer>
    </main>
  );
}
