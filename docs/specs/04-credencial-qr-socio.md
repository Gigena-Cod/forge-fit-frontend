# SDD-04 Credencial QR en la ficha del socio

## Alcance

Desde **Socios → Detalle → Credencial QR**, OWNER y ADMIN pueden consultar, generar y renovar la credencial. Ocultar el panel y omitir las solicitudes para RECEPTIONIST. Reutilizar la sesión y el cliente HTTP existentes.

## Contrato

- `GET /api/members/:id/qr` devuelve 200 con `{ data: { memberId, qrPayload, issuedAt } }`. Solo 404 `QR_NOT_ASSIGNED` muestra «Generar QR».
- `POST /api/members/:id/qr` recibe `{}` para generar o recuperar la vigente y `{ "rotate": true }` para renovar. Aceptar 200 y 201 con la misma estructura.
- Un 401 sigue el manejo de sesión existente. Mostrar feedback específico ante 403, socio inexistente y fallas de red. Permitir reintentar la consulta.

## Interacción

1. Consultar el QR al abrir la ficha y mostrar el estado de carga.
2. Generar la imagen localmente desde el payload opaco. Mostrar fecha de emisión y un texto alternativo sin el payload. Conservar los datos en memoria y limpiar el panel al cambiar de socio.
3. Antes de renovar, pedir confirmación de que el QR anterior dejará de funcionar. Bloquear envíos simultáneos. Si se pierde la respuesta de una renovación, volver a consultar antes de ofrecer otra renovación.
4. Mostrar confirmación tras cada cambio. El check-in existente recibe el mismo formato mediante cámara o lector.

## Aceptación

- Probar estados sin QR, generación, recarga con la misma credencial y renovación cancelada o confirmada.
- Probar errores, bloqueo de doble envío y acceso por rol.
- Ensayar contra MongoDB con un socio activo y el período vigente pagado. Escanear el QR mostrado con una segunda pantalla, verificar la asistencia y confirmar que el código anterior se rechaza tras renovar.
