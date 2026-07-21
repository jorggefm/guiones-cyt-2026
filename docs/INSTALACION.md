# Instalación — 10 minutos, una sola vez

Esto es lo **único** que no se puede hacer desde GitHub. Hay que hacerlo con la
cuenta `jorge.fernandez@colegiomilagrosdedios.edu.pe`.

> **Por qué:** un archivo `.gs` en GitHub es solo un respaldo. Para que funcione
> tiene que estar dentro del proyecto de Apps Script pegado al Google Sheets.
> Ver [`que-es-cada-archivo.md`](que-es-cada-archivo.md).

---

## Paso 0 — Abrir el editor

1. Abrir el Google Sheets `1J_zSUrgqXN0fg9H2ylyOpaXctvrxZpB6ewAutZwN9lQ`
2. Menú **Extensiones → Apps Script**
3. Se abre una pestaña nueva con el editor. A la izquierda está la lista de
   archivos; debería verse `Codigo.gs`.

---

## Paso 1 — Agregar `Rezagada.gs`

1. En la lista de archivos, clic en **+** → **Secuencia de comandos**
2. Nombrarlo **`Rezagada`** (sin `.gs`, se agrega solo)
3. Borrar todo lo que aparezca por defecto
4. Pegar el contenido completo de `Rezagada.gs`
5. **Ctrl+S**

⚠️ Es un archivo **nuevo**. No reemplaza `Codigo.gs`; los dos conviven.

---

## Paso 2 — Cuatro cambios en `Codigo.gs`

Clic en `Codigo.gs`. Usar **Ctrl+F** para encontrar cada punto.

### ① Buscar `savereportreview`

Después del bloque que termina así, agregar las tres líneas nuevas:

```js
    if (action === 'savereportreview') {
      return saveReportReview_(payload);
    }

    if (payload.examId === REZ_EXAM_ID) {        // ← AGREGAR
      return REZ_handleSubmit_(payload);          // ← AGREGAR
    }                                             // ← AGREGAR
```

### ② Buscar `action === 'status'`

Reemplazar esa línea por el bloque completo (son **dos** cosas: la señal de vida
y el estado del envío):

```js
  if (action === 'rezagada') return REZ_health_();
  if (action === 'status') {
    if (e.parameter.examId === REZ_EXAM_ID) {
      return REZ_submissionStatus_(e.parameter.submissionId || '');
    }
    return submissionStatus_(e.parameter.submissionId || '');
  }
```

### ③ Buscar `status: 'pending'`

Unas líneas arriba está el `else if`. Agregar `!isAdmin &&`:

```js
  } else if (!isAdmin && String(row[7] || '').trim().toUpperCase() !== 'SI') {
//           ^^^^^^^^^ AGREGAR
```

### ④ Buscar `El reporte aún no está liberado`

**a) Borrar esa línea completa:**

```js
if (String(row[7] || '').trim().toUpperCase() !== 'SI') throw new Error('El reporte aún no está liberado.');
```

**b) Buscar `setValues([[` (el que está unas 45 líneas más abajo, con `'SI'`) y
reemplazar el bloque:**

```js
    reportsSheet.getRange(sheetRow, 4, 1, 6).setValues([[
      total, level, detail, report.comment || '',
      String(row[7] || 'NO').trim().toUpperCase() === 'SI' ? 'SI' : 'NO',
      JSON.stringify(report)
    ]]);
```

Antes decía `'SI'` fijo en esa posición. **Este cambio es indispensable:** sin él,
calificar una sola pregunta libera el reporte solo.

**Ctrl+S**

---

## Paso 3 — Preparar las hojas

1. En el selector de funciones (arriba), elegir **`REZ_setupWorkbook`**
2. Clic en **Ejecutar**
3. La primera vez pide autorización: **Revisar permisos → elegir la cuenta →
   Avanzado → Ir a (no seguro) → Permitir**
4. Debe responder: *«Hojas listas…»*

Crea `Respuestas rezagada` y `Clave rezagada`. **No toca nada del examen oficial.**

---

## Paso 4 — Publicar

1. Botón azul **Implementar** (arriba a la derecha) → **Administrar implementaciones**
2. En la implementación que ya existe, clic en el **lápiz** (editar)
3. En «Versión», elegir **Versión nueva**
4. **Implementar**

⚠️ **Nunca «Nueva implementación».** Eso genera otra URL y deja el reporte
apuntando al código viejo. Al terminar, la URL debe seguir siendo la que termina
en `...FufkBRuYAQ/exec`.

---

## Paso 5 — Verificar el interruptor maestro

En el Google Sheets, pestaña **`Control`**: la fila `REPORTES_ACTIVOS` debe decir
**`SI`**.

Si dice `NO`, **ningún** alumno puede ver su reporte, ni siquiera los que ya lo
vieron. Cambiarlo a `SI` a mano.

---

## Comprobación

Abrir en el navegador:

```
https://script.google.com/macros/s/AKfycbxJQvanNhT4O1bsrC3WQaeti0YDmjYtMPZaOVYmnXqIPbsR-o5NynSradl2FufkBRuYAQ/exec?action=rezagada
```

**Instalado y publicado correctamente:**

```json
{"ok":true,"instalado":true,"examId":"2S-U4-C2-REZAGADA-2026",
 "version":"2026-07-21","hoja":"Respuestas rezagada"}
```

**Todavía NO instalado** (o publicado sin versión nueva) — responde lo del examen
viejo:

```json
{"ok":true,"examId":"2S-U4-C2-OFICIAL-2026","version":"2026-07-16",
 "message":"Endpoint activo para el examen oficial 2S U4 C2."}
```

> Si sale la segunda respuesta, lo más probable es que falte el **paso 4**
> (publicar una versión nueva sobre el deployment existente). Guardar con Ctrl+S
> **no** publica: el código queda guardado pero la URL sigue sirviendo la versión
> anterior. Es el error más común.

Con la primera respuesta, ya se puede rendir el examen.
