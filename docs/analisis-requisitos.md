# Análisis de cumplimiento de requisitos

Este análisis compara el borrador funcional con el frontend de ForgeFit en el commit `917944e`. El repositorio inspeccionado es una aplicación React que consume una API externa (`VITE_API_URL`); por ese motivo, todo requisito que dependa de persistencia, concurrencia, roles o reglas de negocio del servidor queda marcado como **parcial** o **pendiente de verificar** si no existe evidencia en este repositorio.

## Criterio de estado

| Estado | Significado |
| --- | --- |
| Cumplido en frontend | Hay interfaz y llamada a API que cubren el requisito. El comportamiento final todavía depende de la API. |
| Parcial | Existe una parte visible o técnica, pero falta una condición relevante. |
| No cumplido | No se encontró interfaz, servicio ni flujo que lo cubra. |
| Pendiente de verificar | Solo puede confirmarse revisando backend, despliegue o infraestructura. |

## Requisitos funcionales

| ID | Requisito | Estado | Evidencia y observación |
| --- | --- | --- | --- |
| RF01 | Registrar socio | Cumplido en frontend | Formulario de alta y `POST /members`. |
| RF02 | Modificar socio | Cumplido en frontend | Edición y `PUT /members/:id`. |
| RF03 | Consultar socio | Cumplido en frontend | Listado, búsqueda y detalle mediante `GET /members` y `GET /members/:id`. |
| RF04 | Dar de baja sin perder historial | No cumplido | La interfaz ejecuta `DELETE /members/:id` y advierte que eliminará pagos y asistencias permanentemente. Debe reemplazarse por baja lógica o cambio de estado. |
| RF05 | Consultar estado del socio | Parcial | Se muestra el estado `ACTIVO/INACTIVO`; no se muestra una habilitación calculada con su situación de pago. |
| RF06 | Registrar pago | No cumplido | Solo existe consulta de pagos; no hay formulario ni `POST /payments`. |
| RF07 | Consultar estado de pago | Parcial | Se muestran estados Pagado, Pendiente y Vencido, pero no hay consulta específica de cuota por socio ni cálculo visible. |
| RF08 | Mantener historial de pagos | Cumplido en frontend | Se visualiza el historial general y el del socio. La retención real depende del backend. |
| RF09 | Validar habilitación de ingreso | No cumplido | No existe flujo de ingreso que combine estado del socio y pagos. |
| RF10 | Generar o asociar QR | No cumplido | No se encontró campo, generación ni asociación de QR. |
| RF11 | Leer QR | No cumplido | No se encontró integración con cámara o lector. |
| RF12 | Identificar socio por QR | No cumplido | No se encontró búsqueda o endpoint por código QR. |
| RF13 | Registrar asistencia autorizada | No cumplido | El proyecto solo consulta asistencias; no puede registrarlas. |
| RF14 | Registrar fecha y hora de ingreso | Parcial | La vista presenta fecha y hora que llegan de la API, pero no existe el flujo que las cree. |
| RF15 | Confirmar acceso | No cumplido | No hay pantalla o mensaje de autorización de ingreso. |
| RF16 | Rechazar acceso | No cumplido | No hay pantalla o mensaje de rechazo de ingreso. |
| RF17 | Gestionar usuarios | No cumplido | Solo hay registro inicial de administrador y edición de configuración. No hay ABM de usuarios. |
| RF18 | Gestionar roles | No cumplido | No se encontraron modelos, pantallas ni operaciones de roles. |
| RF19 | Controlar permisos por rol | No cumplido | Las rutas se renderizan sin guardas y el menú no cambia según permisos. |
| RF20 | Autenticar usuario | Parcial | Login y registro llaman a `/auth/*` y guardan un token, pero no hay protección de rutas, cierre de sesión ni restauración/verificación de sesión. |
| RF21 | Consultar asistencias | Cumplido en frontend | Listado, búsqueda e historial por socio mediante endpoints de consulta. |
| RF22 | Consultar reportes administrativos | No cumplido | El inicio es una portada y no hay reportes ni indicadores consolidados. |

## Requisitos no funcionales

| ID | Requisito | Estado | Evidencia y observación |
| --- | --- | --- | --- |
| RNF01 | Sistema web | Cumplido | Aplicación web React/Vite. |
| RNF02 | Acceso desde múltiples dispositivos | Parcial | Hay reglas responsive para pantallas pequeñas, pero falta prueba real en dispositivos y navegadores objetivo. |
| RNF03 | Acceso simultáneo | Pendiente de verificar | Depende de la API, base de datos e infraestructura. |
| RNF04 | Base de datos centralizada | Pendiente de verificar | El frontend consume una API central, pero este repositorio no contiene la base de datos. |
| RNF05 | Seguridad de acceso | Parcial | Se envía token Bearer; faltan guardas de ruta, roles en cliente y verificación del servidor. |
| RNF06 | Integridad de la información | Parcial | Hay validaciones de formulario y manejo de errores; las reglas de integridad y autorización dependen del backend. |
| RNF07 | Disponibilidad de la información | Pendiente de verificar | No hay configuración de despliegue, monitoreo ni disponibilidad en este repositorio. |
| RNF08 | Facilidad de uso | Parcial | Formularios, búsqueda, estados de carga y mensajes de error aportan usabilidad; requiere validación con usuarios. |
| RNF09 | Compatibilidad con lectura QR | No cumplido | No hay soporte de cámara ni lector QR. |
| RNF10 | Trazabilidad | Parcial | Se exponen historiales de pagos y asistencias; la eliminación permanente de socios contradice conservar el historial. |

## Resultado

De los 22 requisitos funcionales: 5 están cubiertos en el frontend, 5 están parcialmente cubiertos y 12 no están cubiertos. De los 10 no funcionales: 1 está cubierto, 4 son parciales, 3 requieren verificación de backend o infraestructura y 1 no está cubierto.

## Prioridad recomendada

1. Corregir RF04 con baja lógica para preservar pagos y asistencias.
2. Implementar el módulo de pagos: alta, consulta por socio y estado de cuota.
3. Implementar el flujo completo de asistencia: QR, identificación, validación, respuesta y registro.
4. Implementar usuarios, roles, permisos y protección de rutas.
5. Crear el panel de reportes administrativos y luego verificar los requisitos de backend, concurrencia y disponibilidad.
