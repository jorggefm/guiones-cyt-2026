# Prompt para generar un examen nuevo

Copia el texto siguiente y adjunta únicamente la matriz de 12 preguntas y el manifiesto de imágenes.

---

Usa la plantilla neutral ubicada en `plantillas/examen_html/` para preparar la configuración de un examen nuevo de Ciencia y Tecnología.

Trabaja sobre copias en una carpeta nueva. No modifiques la plantilla, exámenes existentes, Apps Scripts, endpoints ni Google Sheets existentes. No despliegues, publiques ni incluyas estudiantes, secretos o identificadores privados.

Datos generales:

- Grado: [COMPLETAR]
- Unidad: [COMPLETAR]
- Título: [COMPLETAR]
- EXAM_ID único: [COMPLETAR]
- Versión: [COMPLETAR]
- Spreadsheet ID exclusivo o marcador: [COMPLETAR]
- Endpoint Apps Script exclusivo o marcador: [COMPLETAR]
- Identificador público OAuth exclusivo o marcador: [COMPLETAR]
- Dominio institucional: `colegiomilagrosdedios.edu.pe`

Matriz de 12 preguntas:

[PEGAR AQUÍ. Para cada pregunta incluye: id q1–q12, tipo, enunciado, alternativas o ítems, respuesta correcta o respuesta modelo, pista, puntaje, método automatic/mixed/teacher, umbral o rúbrica cuando corresponda e imageKey opcional.]

Manifiesto de imágenes:

[PEGAR AQUÍ. Para cada imageKey incluye ruta o URL, texto alternativo y pie opcional.]

Entrega:

1. Una carpeta independiente con una copia de `examen_base.html` y una `configuracion_ejemplo.js` completa.
2. Una copia de `apps_script_base.gs` y el mismo contenido de configuración listo para copiar como `Configuracion.gs`.
3. Ningún marcador pendiente salvo IDs que yo haya proporcionado explícitamente como marcadores.
4. Un informe corto de validación: 12 IDs únicos, puntaje total, distribución de métodos, referencias de imágenes resueltas y sintaxis JavaScript.
5. Resultado de `runScreenExitCounterTests()` con estos valores: login 0, primera salida 1, segunda salida 2, giro sin aumento y envío sin aumento.

Conserva sin cambios la arquitectura fija: interfaz responsiva para tablet, acceso Google institucional, validación de dominio en cliente y servidor, verificación del token en Apps Script, progreso, pistas, validación, idempotencia, confirmación real, cinco pestañas de Sheets, calificación automática/mixta/docente y espacio de reportes.

No añadas `blur`, `focusout` ni `pagehide`. El contador debe escuchar únicamente `visibilitychange`, comenzar después de la primera interacción con una pregunta, ignorar el login y quedar detenido antes del envío.

---
