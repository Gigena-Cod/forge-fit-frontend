# Lector USB de ingreso

El equipo informado es un X3-800. Según la publicación suministrada, decodifica códigos 1D y 2D, incluidos QR, admite lectura desde pantallas de teléfonos y se conecta por USB Plug & Play. La publicación no especifica expresamente si utiliza USB HID (teclado) o una interfaz serie.

La pantalla `/check-in` ya admite lectores que escriben como teclado. En ese modo no se necesita una librería adicional. La dependencia `@zxing/browser` se utiliza para la opción de cámara de video.

## Verificación con el equipo

1. Conectar el lector y abrir un editor de texto vacío. Escanear un QR de prueba sin datos sensibles y comprobar si escribe exactamente su contenido.
2. Si escribe como teclado, abrir `/check-in`, seleccionar el campo Credencial QR y escanear una credencial de prueba. Si el lector agrega Enter, el formulario se envía; de lo contrario, usar Verificar ingreso. La prueba de ingreso puede registrar asistencia.
3. Después del resultado, pulsar Siguiente ingreso para habilitar otra lectura.
4. Si el lector no escribe texto, consultar su manual para identificar o configurar el modo USB. No se debe asumir que ofrece video ni instalar un controlador sin identificar la interfaz.

La compatibilidad física queda pendiente de esta prueba. Para el modo teclado, verificar también que la distribución de teclado del lector coincida con la de Windows y que no se alteren los símbolos del contenido QR.
