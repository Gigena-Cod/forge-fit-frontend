const mockSessionCookieName = "forgefit_mock_session";

/** Sesión temporal para probar la interfaz hasta contar con autenticación real. */
export function createMockSession() {
  const secureAttribute =
    window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${mockSessionCookieName}=authenticated; Path=/; Max-Age=86400; SameSite=Lax${secureAttribute}`;
}

export function hasMockSession() {
  return document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith(`${mockSessionCookieName}=`));
}
