# SDD-07 Renovación de sesión — Frontend

Contrato compartido en `forge-fit-backend/docs/specs/19-renovacion-sesion.md`.

## Flujo

- Todos los pedidos a la API usan `credentials: 'include'`. Access y refresh viajan en cookies HttpOnly cifradas por el servidor. Login, registro y refresh dejan al navegador aplicar Set-Cookie. Al verificar o reemplazar una sesión, se limpia el almacenamiento legado.
- Tras iniciar sesión, consultar `GET /auth/me` antes de salir del formulario. Al abrir directamente una URL privada, verificar la sesión en el arranque. La navegación entre pantallas privadas conserva el contexto y no vuelve a montar `SessionBoundary`. Enviar `X-Session-Id` en pedidos autenticados para detectar cambios de cuenta.
- Ante un 401 de una ruta protegida, incluida `/auth/me`, compartir una renovación por pestaña. En navegadores con Web Locks, serializar cambios de cookies de autenticación entre pestañas. Dentro del lock, comprobar si otra pestaña ya renovó antes de llamar a `POST /auth/refresh`. Tras renovar, reintentar la solicitud original una vez con su sesión, cuerpo y señal de cancelación.
- Login, registro y logout no se renuevan ni se reintentan automáticamente. Un 401 definitivo o `SESSION_CHANGED` lleva al login. Un error de red o 5xx conserva el contexto y permite reintentar manualmente. Si se perdió la respuesta de un refresh ya aplicado en el servidor, un intento posterior puede detectar reutilización y pedir login.
- `POST /auth/logout` se usa desde el encabezado. Tras confirmar el cierre, ir al login. Una edición del propio usuario vuelve al login después de guardar, porque el backend invalida la sesión al actualizar la versión de autenticación. Los cambios de sesión se comunican entre pestañas por un evento de almacenamiento que contiene un identificador aleatorio sin credenciales.
- En Vercel, el frontend usa `/api` y la plataforma reenvía ese prefijo al backend. Esto mantiene las cookies SameSite=Lax en el dominio de la aplicación. En local usar el mismo nombre de host para frontend y API.

## Aceptación

- Recargar una página privada con access vencido recupera la sesión si el refresh sigue vigente. Si vencieron ambos, el usuario vuelve al login.
- Solicitudes simultáneas de una pestaña comparten el refresh y solo se reintentan después de un 401 de autenticación. Un 403 o un error de red no repite mutaciones.
- Verificar bloqueo entre pestañas, cierre y cambio de cuenta, y el envío real de cookies en el entorno de integración.
