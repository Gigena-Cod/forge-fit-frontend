# SDD-06 Paginación del listado de pagos

Consultar `GET /api/payments?page=1&limit=20&q=` y consumir `{ items, page, limit, total }` dentro de `data`. El servidor filtra todo el listado y ordena de más reciente a más antiguo por fecha de pago o creación si falta. No reordenar ni filtrar los resultados localmente.

Mostrar rango, total y controles **Anterior** y **Siguiente**. Reiniciar a página 1 al buscar o registrar un pago. Cancelar solicitudes obsoletas. Distinguir carga, error, búsqueda vacía y listado sin pagos. Mantener el modal y el botón alineado con el buscador.

Verificar que se conserve el orden de la API, que la búsqueda se envíe al servidor y que los controles se deshabiliten en los extremos.
