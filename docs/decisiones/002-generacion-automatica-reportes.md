# 002 — La fila del reporte se genera sola

**Fecha:** 2026-07-20 · **Estado:** aplicado

## Cómo se hacía antes

No existía código que pasara de `Respuestas oficial` a `Reportes`. Al terminar el
examen el salón, el docente le pedía a un agente (Codex/ChatGPT) con acceso al
Sheets que «generara el reporte». El agente leía las respuestas, calificaba de
paso las cuatro preguntas abiertas y escribía las filas a mano.

Por eso el `.gs` no tenía ese paso: **nunca fue código, fue un agente escribiendo
celdas.**

El script de 1S sí tiene `generateOfficialReports()`, pero con las notas del
docente incrustadas a mano y un `clearContents()` que reescribe la hoja entera.
Sirve una vez para un salón; **no sirve para agregar a un alumno**.

## Problema

1. El criterio de calificación vivía en un chat que se pierde. No reproducible,
   no auditable.
2. Para un solo alumno rezagado no hay ningún camino: la única función existente
   borra la hoja completa.
3. Sin ese paso, la alumna termina el examen y el reporte le dice «no encontrado».

## Decisión

`REZ_buildReportRow_` se ejecuta **automáticamente al enviar el examen**, dentro
de `REZ_handleSubmit_`. Arma el JSON del reporte con las 12 preguntas, la
respuesta ideal, la explicación y el puntaje automático, y lo deposita en
`Reportes`.

La calificación docente **no** se automatiza: son los 6 puntos de criterio del
profesor. Se hace en el reporte, en modo administrador.

## Salvaguardas

**La generación del reporte no puede costarle el examen a la alumna.** Va dentro
de un `try/catch` posterior al guardado de las respuestas:

```js
sheet.appendRow(REZ_buildResponseRow_(payload, result));
SpreadsheetApp.flush();          // las respuestas ya están a salvo
try { REZ_buildReportRow_(payload, result); }
catch (err) { reportOk = false; console.error(err); }
```

Si falla, las respuestas están guardadas y la fila se rehace con
`REZ_regenerarReporte()`.

**No duplica.** Si ya existe una fila con ese correo, la actualiza en lugar de
agregar otra.

## Comentarios de arranque

Con el agente fuera del circuito se perdían los comentarios pre-escritos. Se
recuperan con `REZ_defaultFeedback_`, que redacta un comentario según el puntaje
obtenido. Al calificar, el docente encuentra un borrador editable en vez de una
caja vacía.

## Consecuencia

Ya no hace falta un agente con acceso de escritura al Sheets para cerrar un
examen. El sistema se cierra solo, y lo único manual es lo que debe serlo.
