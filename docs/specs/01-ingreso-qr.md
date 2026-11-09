# SDD: ingreso por QR

## Objetivo y alcance
Implementar `/check-in` para OWNER, ADMIN y RECEPTIONIST. Leer una credencial con lector USB en modo teclado o captura manual, solicitar la validación del servidor y mostrar autorización o rechazo junto al resumen del socio identificado.

## Contrato
`POST /attendance/check-in`, body `{ qrPayload, requestId }`: payload de al menos 10 caracteres y UUID. Respuesta `{ allowed, reason, attendance, replayed }`. La asistencia autorizada contiene `entryAt` y `memberId`. Motivos: ACCESS_GRANTED, QR_INVALID, MEMBER_INACTIVE, PAYMENT_MISSING, PAYMENT_PENDING, PAYMENT_OVERDUE, PAYMENT_CONFLICT. Un rechazo HTTP 200 es un resultado de negocio, no una falla de conexión.

## Diseño
Página con captura manual o lector USB. Mostrar recepción del código, validación y resultado. El indicador describe el estado del flujo y la última entrada recibida. Bloquear envíos simultáneos. Reutilizar requestId al reintentar una solicitud fallida. Un nuevo ingreso requiere una acción explícita. La decisión y la hora del ingreso provienen del servidor. Mantener la credencial QR en memoria.

## Aceptación y ejecución
- [x] Ruta, navegación y verificación de sesión.
- [x] Entrada por teclado o lector USB.
- [x] Resultado accesible, motivos traducidos y hora del servidor.
- [x] Exclusión de doble envío y reintento idempotente.
- [x] Estados de espera, error y siguiente ingreso.
- [ ] Validación física con lector USB y credencial del gimnasio.

## Validación prevista
Compilación, lint y pruebas de interfaz con contratos simulados para autorización, rechazo, recepción por Enter, fallo de red y reintento. La prueba física requiere el lector USB y un backend activo con datos.
