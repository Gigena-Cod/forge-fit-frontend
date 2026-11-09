# SDD-08 Paginación de tablas

Extender el patrón de Pagos a Socios, Usuarios, Asistencias y las tablas de pagos y asistencias de la ficha de socio. Cada tabla pide 20 filas al servidor con `page`, `limit` y los filtros aplicables. Consumir `data: { items, page, limit, total }`. Mostrar rango, total, Anterior y Siguiente con el mismo estilo de Pagos.

En listados con buscador, aplicar la búsqueda al conjunto completo en el servidor. Volver a página 1 al cambiar búsqueda, filtros o socio. Cancelar o descartar respuestas obsoletas. Después de una mutación, recargar y ajustar la página si quedó fuera de rango. Cada tabla de la ficha conserva su propia página. Distinguir carga, error, ausencia de registros y búsqueda sin coincidencias.

En Reportes, paginar solo la tabla diaria de asistencias con Anterior y Siguiente sobre los resultados agrupados del reporte. Mantener los totales para todo el período y reiniciar al aplicar filtros.

Al registrar un pago, consultar el período exacto del socio en el servidor. Resolver todos los resultados de ese período antes de decidir si se crea, actualiza o bloquea el pago.

Verificar navegación de extremo a extremo, búsqueda de un registro que estaba fuera de la primera página, cambio de socio y actualización después de guardar. Contrato detallado en SDD-20 del backend.
