# Plantilla neutral de examen HTML

Base reutilizable para exámenes de Ciencia y Tecnología con 12 preguntas. No está asociada a un grado, no es un examen desplegado y no contiene estudiantes, secretos, IDs reales ni endpoints activos.

## Archivos

- `examen_base.html`: interfaz responsiva, render de la matriz, Google Identity Services, validación, contador y envío confirmado.
- `apps_script_base.gs`: verificación del token, idempotencia, calificación y preparación del libro.
- `configuracion_ejemplo.js`: única fuente de datos variables; funciona en navegador y Apps Script V8.
- `PROMPT_NUEVO_EXAMEN.md`: prompt listo para generar una nueva configuración a partir de una matriz y un manifiesto de imágenes.

## Generar un examen nuevo

1. Crea una carpeta independiente para el examen. Copia `examen_base.html` sin alterar su lógica y renómbralo si lo deseas.
2. Copia `configuracion_ejemplo.js` junto al HTML conservando ese nombre. Sustituye todos los marcadores `__...__`, mantén exactamente 12 preguntas y valida que cada `imageKey` exista en `images`.
3. Crea un Google Sheets exclusivo y un proyecto Apps Script exclusivo. No reutilices los de otro examen.
4. Copia `apps_script_base.gs` al proyecto. Copia también el contenido de `configuracion_ejemplo.js` a un archivo llamado `Configuracion.gs`.
5. En Apps Script, ejecuta `setupExamWorkbook()`. Se crearán o repararán estas pestañas: `Respuestas oficial`, `Clave oficial`, `Calificación oficial`, `Control` y `Reportes`.
6. Ejecuta `authorizeGoogleIdentityVerification()` para conceder a Apps Script permiso de consultar la verificación de Google.
7. Despliega Apps Script como aplicación web con ejecución como propietario y acceso compatible con el alumnado institucional. Copia la URL `/exec` a `appsScriptEndpoint`.
8. Crea un cliente web OAuth propio del examen, registra el origen desde el que se servirá el HTML y copia su identificador público a `googleClientId`. El identificador no es un secreto; nunca agregues secretos OAuth al HTML.
9. Sirve el HTML por HTTPS. No lo abras con `file://`, porque Google Identity Services necesita un origen web autorizado.
10. Ejecuta las verificaciones de esta guía antes de publicar. Esta carpeta de plantilla no se despliega.

## Configuración y tipos

Cada pregunta declara `id`, `type`, `prompt`, alternativas o ítems, `hint`, `points`, `imageKey` (una imagen) o `imageKeys` (varias) y `grading`. `achievementScale` define AD, A y B, sin C; la pestaña de calificación calcula el nivel cuando el puntaje queda completo.

Para mantener un examen ágil en tableta, usa como máximo tres preguntas abiertas `text` y distribuye las demás entre alternativas, selección múltiple, ordenamientos y palabras clave desplegables.

- `single`: una alternativa; `grading.correct` es un valor.
- `multiple`: varias alternativas; `grading.correct` es el arreglo de valores correctos. Cada alternativa correcta marcada suma una fracción igual del puntaje y las incorrectas no descuentan.
- `sequence`: un selector por ítem; `grading.correct` es el arreglo de posiciones esperado y cada posición correcta suma su fracción del puntaje.
- `dropdown`: una palabra o expresión desplegable por ítem; puede usar `options` comunes o alternativas propias dentro de cada ítem. Cada desplegable correcto suma su fracción del puntaje.
- `text`: respuesta abierta con longitud mínima.
- `automatic`: todo el puntaje se asigna en Apps Script.
- `mixed`: Apps Script asigna `automaticPoints` si la respuesta coincide y deja la pregunta pendiente para revisión.
- `teacher`: todo el puntaje queda pendiente; documenta el criterio en `rubric`.

El navegador nunca decide la nota oficial. La clave viaja en la configuración porque el mismo archivo se usa en Apps Script; por ello, sirve el HTML solo en el contexto previsto y considera que cualquier clave enviada al navegador puede ser inspeccionada. Si se necesita ocultar la clave, crea una configuración pública sin `grading` para el navegador y conserva la configuración completa solo como `Configuracion.gs`; la arquitectura del backend no cambia.

## Salidas de pantalla

El contador combina `document.visibilitychange` con `window.blur` para registrar tanto el cambio de pestaña como otra ventana colocada sobre el examen.

- Empieza con la primera entrada, cambio u apertura de pista dentro de una pregunta; el login, la sección y otros controles no lo inician.
- Incrementa solo si el estado anterior era visible y el nuevo estado es hidden.
- Un segundo evento hidden durante la misma ausencia se ignora.
- El giro de la tableta solo reorganiza el CSS y no incrementa el contador.
- `exitCounter.stop()` se ejecuta antes de iniciar el POST. Desde ese momento no vuelve a contar, aunque la conexión falle y sea necesario reintentar.
- `visibilitychange` y `blur` comparten un mismo bloqueo de salida; una acción nunca suma dos veces.
- No hay listeners de `focusout` ni `pagehide`.

Pruebas incluidas en `examen_base.html`:

```text
Login y regreso: 0
Una salida y regreso: 1
Segunda salida y regreso: 2
Giro de tablet: 2 (no aumenta)
Envío: 2 (no aumenta)
```

Para ejecutarlas, abre una copia servida por HTTP con `?pruebas=salidas`, o ejecuta `runScreenExitCounterTests()` en la consola. La función devuelve cinco resultados con `ok`, `expected` y `actual`.

## Seguridad e integridad

- El cliente comprueba el dominio para dar retroalimentación rápida, pero la decisión confiable ocurre en Apps Script.
- Apps Script consulta `tokeninfo` y valida audiencia OAuth, emisor, expiración, correo verificado, dominio alojado y coincidencia del correo enviado.
- El `submissionId` se crea una sola vez. Apps Script usa un bloqueo y busca ese ID antes de escribir, por lo que los reintentos son idempotentes.
- La pantalla de éxito aparece únicamente después de que el GET de estado confirma la fila en Sheets.
- Los textos que podrían iniciar fórmulas se neutralizan antes de escribirse en celdas.
- `Reportes` queda preparado, pero vacío y desactivado hasta implementar una rutina posterior.

## Lista de verificación

- No quedan marcadores `__...__` en la copia del examen.
- Los IDs son `q1` a `q12`, sin saltos ni duplicados.
- Todas las imágenes cargan, tienen texto alternativo y pertenecen al manifiesto.
- El Google Sheets, Apps Script, endpoint y cliente OAuth son exclusivos de este examen.
- `setupExamWorkbook()` y `runScoringSelfTest()` terminan sin error.
- Las cinco pruebas de salidas muestran `ok: true`.
- Se prueba en tablet vertical y horizontal, y con una cuenta institucional de prueba autorizada.
- Un segundo envío con el mismo `submissionId` no crea otra fila.
- La confirmación no aparece si se impide la escritura en Sheets.

## Sintaxis local

Con Node.js disponible, extrae el último `<script>` embebido del HTML y compruébalo con `node --check`; comprueba también `configuracion_ejemplo.js`. `apps_script_base.gs` usa JavaScript V8, pero sus servicios (`SpreadsheetApp`, `UrlFetchApp`, etc.) solo pueden ejecutarse dentro de Apps Script.
