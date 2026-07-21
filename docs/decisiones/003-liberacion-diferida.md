# 003 — Liberación diferida del reporte

**Fecha:** 2026-07-20 · **Estado:** aplicado

## Problema

Al generarse la fila del reporte automáticamente (ver
[002](002-generacion-automatica-reportes.md)), aparece una ventana peligrosa: la
alumna tiene reporte **antes** de que el docente califique los 6 puntos docentes.
Si lo abre, ve una nota deflactada.

Pero el código tenía un callejón sin salida:

```js
// requestReport_ : sin liberar devuelve 'pending' — también al administrador
} else if (String(row[7]).trim().toUpperCase() !== 'SI') {

// saveReportReview_ : exige que ya esté liberado
if (String(row[7]).trim().toUpperCase() !== 'SI')
  throw new Error('El reporte aún no está liberado.');
```

Para calificar tenía que estar liberado; si estaba liberado, la alumna ya lo veía.

## Decisión

Separar **«el reporte existe»** de **«el alumno puede verlo»**. La fila nace con
`liberado = NO`; el docente califica sobre ella; libera cuando termina.

## Las 4 ediciones a Codigo.gs

**① `doPost` — desviar el examen nuevo**
```js
if (payload.examId === REZ_EXAM_ID) return REZ_handleSubmit_(payload);
```

**② `doGet` — estado del envío**
```js
if (e.parameter.examId === REZ_EXAM_ID)
  return REZ_submissionStatus_(e.parameter.submissionId || '');
```

**③ `requestReport_` — el administrador ve reportes sin liberar**
```js
} else if (!isAdmin && String(row[7] || '').trim().toUpperCase() !== 'SI') {
//         ^^^^^^^^^ agregado
```

**④ `saveReportReview_` — dos cambios**

Se elimina la guarda de liberación. **No es una brecha de seguridad:** la función
ya valida `ADMIN_EMAILS` contra la identidad verificada por Google unas líneas
antes. La guarda era redundante.

Y se corrige el guardado, que escribía `SI` fijo:

```js
// antes:  total, level, detail, comment, 'SI', json
// ahora:
total, level, detail, report.comment || '',
String(row[7] || 'NO').trim().toUpperCase() === 'SI' ? 'SI' : 'NO',
JSON.stringify(report)
```

Sin este último cambio, calificar **una sola** pregunta liberaba el reporte
automáticamente y anulaba todo el mecanismo. Fue el error más fácil de pasar por
alto de todo el trabajo.

## ⚠️ Advertencia para futuras auditorías

**La ausencia de la guarda de liberación en `saveReportReview_` es intencional.**
No es un bug. Reponerla vuelve a cerrar el callejón sin salida y hace imposible
calificar antes de liberar.

## Flujo resultante

```
envía → fila con NO → alumna ve "pendiente de revisión"
                    → docente califica (sigue en NO)
                    → REZ_liberarReporte(correo) → alumna ve su nota
```

## Alcance

Solo se aplicó a 2S. Al extenderlo a los demás grados, la edición ④ es la que hay
que replicar con más cuidado.
