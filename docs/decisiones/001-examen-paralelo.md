# 001 — Examen paralelo en lugar de modificar el oficial

**Fecha:** 2026-07-20 · **Estado:** aplicado

## Problema

Una alumna de 2.° de secundaria no rindió el examen de Unidad 4. El resto del
salón ya lo dio y ya vio su reporte. Hace falta un examen nuevo, con el mismo
formato y las mismas imágenes, pero con otras preguntas.

## Opciones

**A. Sobrescribir el examen oficial.** Cambiar `KEY_ROWS`, `HEADERS` y
`scoreAutomatic_` en el script existente.
→ **Descartada.** Rompe la corrección de los reportes ya emitidos. Si después
hubiera que reeditar la nota de cualquier alumno del salón, el script calificaría
contra una clave que no corresponde a su examen.

**B. Examen paralelo con deployment propio.**
→ **Descartada.** El reporte apunta a un único deployment. Uno nuevo no sabría
corregir el examen nuevo ni calificar sus preguntas abiertas, y habría que
duplicar también el HTML del reporte.

**C. Examen paralelo sobre el mismo deployment y el mismo Sheets.** ✅

## Decisión

Un examen nuevo (`2S_U4_examen_C2_rezagada.html`) con su propio `EXAM_ID` y su
propia hoja de respuestas, atendido por el **mismo deployment** y depositando su
reporte en la **misma hoja Reportes**.

## Por qué funciona sin tocar el reporte

`requestReport_` y `saveReportReview_` **nunca leen las respuestas**: trabajan
sobre la hoja `Reportes` y buscan por correo. El reporte es agnóstico al examen.
Basta con que la fila esté bien formada.

`2S_U4_reporte_C2.html` **no se modificó en absoluto.**

## Por qué no hizo falta un refactor multi-examen

La primera versión de este plan proponía un mapa `EXAMS` que generalizara
`KEY_ROWS`, `HEADERS`, `EDITABLE_REVIEW_QUESTIONS` y los topes.

Fue **sobre-ingeniería**: los dos exámenes son estructuralmente idénticos —
12 preguntas, 14/6, docentes en 4, 6, 10 y 12. `EDITABLE_REVIEW_QUESTIONS` y toda
la matemática de `saveReportReview_` sirven para ambos sin un solo cambio.

Se optó por un archivo nuevo con prefijo `REZ_` y **tres líneas de dispatch** en
`Codigo.gs`. El camino del examen oficial queda prácticamente intacto: menos
superficie para romper algo que ya funciona para 30 alumnos.

## Consecuencias

- Un examen futuro con **otra estructura** (distinto reparto o distintas
  preguntas docentes) sí obligaría al refactor descartado aquí.
- El prefijo `REZ_` es obligatorio: Apps Script comparte un único ámbito global
  entre todos los archivos del proyecto, y un nombre repetido rompe el proyecto
  entero.
