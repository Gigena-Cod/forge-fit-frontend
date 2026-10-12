# SDD: ingreso por QR

## Objetivo y alcance
Implementar `/check-in` para OWNER, ADMIN y RECEPTIONIST. Leer una credencial con cámara o lector de teclado, solicitar la validación del servidor y mostrar autorización o rechazo. La emisión de credenciales pertenece a una futura ampliación del detalle del socio.

## Contrato
`POST /attendance/check-in`, body `{ qrPayload, requestId }`: payload de al menos 10 caracteres y UUID. Respuesta `{ allowed, reason, attendance, replayed }`. La asistencia autorizada contiene `entryAt` y `memberId`. Motivos: ACCESS_GRANTED, QR_INVALID, MEMBER_INACTIVE, PAYMENT_MISSING, PAYMENT_PENDING, PAYMENT_OVERDUE, PAYMENT_CONFLICT. Un rechazo HTTP 200 es un resultado de negocio, no una falla de conexión.

## Diseño
Página con captura manual/lector y cámara iniciada explícitamente. ZXing decodifica QR; detener cámara después de una lectura y al abandonar la página. Bloquear envíos simultáneos. Reutilizar requestId al reintentar una solicitud fallida; un nuevo ingreso requiere una acción explícita. La decisión y la hora siempre provienen del servidor. No almacenar credenciales QR en almacenamiento persistente.

## Aceptación y ejecución
- [x] Ruta, navegación y verificación de sesión.
- [x] Entrada por teclado/lector y cámara con manejo de permisos denegados.
- [x] Resultado accesible, motivos traducidos y hora del servidor.
- [x] Exclusión de doble envío y reintento idempotente.
- [x] Estados de espera, error y siguiente ingreso.
- [ ] Validación física con cámara y credencial del gimnasio.

## Validación prevista
Compilación, lint y pruebas de interfaz con contratos simulados: autorización, rechazo, fallo de red/reintento, doble lectura y liberación de cámara. La prueba física requiere cámara y backend activo con datos.
