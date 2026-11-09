# SDD-05 Registrar un pago desde Pagos

Ubicar **Registrar pago** a la derecha de **Buscar pago**, en la misma fila. Abrir un modal para los roles que ya tienen `payments:write`. Pedir socio, período, importe entero en ARS, fecha y medio. Inicializar fecha y período con el día actual en Argentina.

Consultar los pagos del socio antes de guardar. Crear con `POST /api/payments` si el período está vacío. Si existe un único pago pendiente o vencido, actualizarlo con `PUT /api/payments/:id`. Bloquear un período ya pagado o con varios registros activos. Enviar `status: PAID`.

Durante el guardado bloquear nuevos envíos. Conservar el formulario si la API falla. Tras guardar, confirmar el cambio y actualizar el listado. La consulta previa protege el flujo habitual de la pantalla. La exclusión de altas concurrentes entre operadores requiere una garantía del backend.
