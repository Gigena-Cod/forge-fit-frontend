# SDD: gestión de usuarios

## Objetivo y alcance
Implementar `/users`: listado, búsqueda, alta y edición de datos, rol y estado de cuenta. OWNER administra; ADMIN consulta; RECEPTIONIST no accede. No crear roles personalizados ni nuevos propietarios.

## Contratos
- `GET /auth/me`: usuario actual (`id`, `role`) y gimnasio.
- `GET /users`: usuarios con `_id`, fullName, dni, phone, email, role, accountStatus.
- `GET /roles`: catálogo `{ code, permissions }[]`.
- `POST /users`: fullName, dni, phone, email, password (mínimo 8), role ADMIN o RECEPTIONIST.
- `PATCH /users/:id`: datos, role opcional ADMIN/RECEPTIONIST y accountStatus ACTIVE/INACTIVE; no recibe contraseña.
- EMAIL_ALREADY_EXISTS y LAST_OWNER deben mostrarse sin perder formulario. Actualizar la propia cuenta invalida el token; solicitar nuevo login.

## Diseño
Tabla reutilizada y editor en panel con campos etiquetados, validación nativa, estado de guardado y cancelación. Rol OWNER visible pero no asignable; al mantenerlo se omite role del PATCH. Confirmación dentro del editor antes de guardar una desactivación. Los permisos se resuelven desde la sesión verificada y catálogo del servidor; el backend conserva la autoridad.

## Aceptación y ejecución
- [x] Listado, búsqueda, estados vacío/carga/error y reintento.
- [x] Alta con contraseña solo para nuevos usuarios.
- [x] Edición y cambio de estado sin eliminación física.
- [x] Restricciones de rol y protección de rutas.
- [x] Mensajes de conflicto y recuperación de sesión tras editarse.

## Validación prevista
Build, lint y pruebas de interfaz con API simulada para OWNER, ADMIN y RECEPTIONIST; validar cuerpos de alta/PATCH, bloqueo del último propietario y errores recuperables. Verificación contra base de datos fuera de estas pruebas.
