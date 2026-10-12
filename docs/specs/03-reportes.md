# SDD: reportes administrativos

## Objetivo y alcance
Implementar `/reports` para OWNER y ADMIN. Tres secciones: socios, pagos y asistencias. No incluir exportaciones ni datos inventados. Conservar Inicio existente.

## Contratos
- `GET /reports/members?from=YYYY-MM-DD&to=YYYY-MM-DD`: total, active, inactive, registrations. El rango afecta altas; los otros totales son globales.
- `GET /reports/payments?periodFrom=YYYY-MM&periodTo=YYYY-MM`: currency ARS, paid/pending/overdue con count y amount. Excluye pagos anulados.
- `GET /reports/attendance?from=YYYY-MM-DD&to=YYYY-MM-DD`: totalEntries, uniqueMembers, entriesByDay (`date`, `entries`). Solo ingresos autorizados.
- Ambos extremos del rango son obligatorios cuando se filtra; inicio <= fin. Sin parámetros consulta todo.

## Diseño
Secciones independientes con filtros de fechas/períodos y botón Aplicar. Cargar las tres consultas independientemente; un error no oculta las otras. Limpiar resultados al consultar para no atribuir datos anteriores a filtros nuevos. Cancelar lecturas obsoletas al desmontar. Tarjetas de métricas y tabla diaria accesibles y responsive.

## Aceptación y ejecución
- [x] Ruta y navegación según permisos.
- [x] Métricas reales, moneda ARS y distinción de totales globales/altas filtradas.
- [x] Filtros validados y restablecimiento mediante campos vacíos.
- [x] Estados independientes de carga/error/vacío y reintento.
- [x] Tabla de ingresos diarios.

## Validación prevista
Build, lint y pruebas con contratos simulados: rangos válidos/incompletos/invertidos, ceros, error independiente y restricción RECEPTIONIST. La consistencia de agregaciones se valida en backend.
