# Registro de cambios

Orden cronológico inverso. Cada entrada dice **qué** cambió y **por qué**.

---

## 2026-07-20 — Examen de recuperación 2S U4 y mejoras al sistema

**Motivo:** una alumna de 2.° de secundaria no rindió el examen de Unidad 4 y lo
dará el 21 de julio. El resto del salón ya vio su reporte.

### Archivos nuevos

| Archivo | Qué es |
|---|---|
| `2S_U4_examen_C2_rezagada.html` | Examen de recuperación. 12 preguntas nuevas, mismas 6 imágenes, mismo formato |
| `Rezagada.gs` | Lógica del examen nuevo. Se agrega al proyecto de Apps Script; **no reemplaza** `Codigo.gs` |
| `docs/` | Esta documentación |

### Cambios en `Codigo.gs`

Cuatro ediciones quirúrgicas. Detalle en
[`decisiones/003-liberacion-diferida.md`](decisiones/003-liberacion-diferida.md).

1. `doPost` — desvía el examen nuevo a `REZ_handleSubmit_`
2. `doGet` — estado del envío para el examen nuevo
3. `requestReport_` — el administrador puede abrir reportes sin liberar
4. `saveReportReview_` — se quita la guarda de liberación **y** se corrige el
   guardado, que escribía `SI` fijo y liberaba el reporte solo

### Sin cambios

- **`2S_U4_reporte_C2.html` no se tocó.** Ni una línea. El reporte busca por
  correo en la hoja `Reportes` y es agnóstico al examen.
- El camino del examen oficial queda intacto salvo las 4 ediciones anteriores.

### Mejoras al sistema

**Generación automática del reporte.** Antes, el paso de `Respuestas` a
`Reportes` lo hacía un agente externo escribiendo celdas a mano. Ahora ocurre al
enviar, dentro de un `try/catch` que garantiza que un fallo del reporte nunca
haga perder las respuestas. Ver
[`decisiones/002`](decisiones/002-generacion-automatica-reportes.md).

**Liberación diferida.** La fila nace con `liberado = NO`. El docente califica
las 4 preguntas abiertas y libera con `REZ_liberarReporte(correo)`. La alumna
nunca ve una nota provisional sin los 6 puntos docentes.

**Respaldo en PDF y borrador local.** El token de Google caduca en 1 hora. Se
agregó guardado automático en `localStorage` y un botón de copia en PDF que
funciona sin internet ni sesión. Ver
[`decisiones/004`](decisiones/004-respaldo-pdf.md).

### Contenido del examen

Misma estructura, mismo reparto **14 automático / 6 docente**, docentes en las
preguntas 4, 6, 10 y 12. Cambios respecto del oficial:

- Q3 pasó de 4 a 3 componentes, y de texto libre a relacionar letra–función
- Q4 se le agregó un desplegable para conservar sus 0.5 puntos automáticos
- Q7 pasó de 2 a 3 componentes y pide **dos** derivados del mesodermo de seis
  posibles, con control de doble conteo
- Q11 cambió su alternativa correcta de `b` a `a`
- Q2 cambió sus cinco etapas por completo

Las cuatro referencias visuales se verificaron **abriendo las imágenes**:
`03_capas_embrionarias` tiene B en la capa media (mesodermo),
`04_secuencia_neurulacion` tiene 4 paneles,
`05_soporte_temprano` tiene A, B, C y D,
`06_cierre_tubo_neural` tiene A y B.

### Pruebas

`docs/pruebas/test_calificacion_rezagada.js` — 20 casos sobre la corrección
automática. Todos pasan. Correr ante cualquier cambio:

```bash
node docs/pruebas/test_calificacion_rezagada.js Rezagada.gs
```

### Botón "Liberar reporte" (misma fecha, más tarde)

Se agregó un botón al final del reporte individual, después de la pregunta 12,
para liberar sin salir del reporte. Antes había que abrir Apps Script y ejecutar
`REZ_liberarReporte()` a mano. Ver [`decisiones/005`](decisiones/005-boton-liberar.md).

También se corrigió el índice de administrador, que filtraba a `liberado = 'SI'`
y por tanto **impedía seleccionar un reporte pendiente para calificarlo** — lo
que anulaba por completo la liberación diferida. Ese arreglo era necesario para
que [`decisiones/003`](decisiones/003-liberacion-diferida.md) funcionara de verdad.

### Tres pegados fallidos en Apps Script

Durante la instalación, tres pegados de código **no entraron y el editor no dio
ningún aviso**. El sistema quedó a medias y el error solo apareció al usarlo.

Causa: el editor pierde el foco al cambiar de archivo; `Ctrl+A` seleccionaba la
lista de archivos en vez del código.

El método correcto quedó documentado en
[`FLUJO-COMPLETO.md`](FLUJO-COMPLETO.md) §4: hacer clic en una línea de código,
confirmar que quedó activa, pegar, y **buscar con `Ctrl+F` antes de guardar**.

Se agregó `REZ_health_` (`?action=rezagada`) porque la verificación anterior
(`?action=status`) devolvía lo mismo con el código viejo y con el nuevo, y por
tanto no verificaba nada.

### Publicación en el repositorio

Se subió **todo**, por decisión explícita del docente (20/07): el examen, el
`.gs` con la clave de respuestas y esta documentación.

Queda constancia del riesgo evaluado: el repositorio es **público**, de modo que
`Rezagada.gs` y el CHANGELOG dejan las respuestas correctas al alcance de
cualquiera que busque el repositorio. El docente consideró el riesgo aceptable
para el caso concreto de una sola alumna de 2.° de secundaria.

**Para exámenes futuros esto debería reconsiderarse**, sobre todo si el examen se
toma a un salón entero o a grados mayores.

### Pendiente

- **Instalar el código en Apps Script** (ver [`INSTALACION.md`](INSTALACION.md)).
  Hasta que se haga, el examen carga pero **el envío falla**: el servidor no
  conoce el `EXAM_ID` nuevo. Un `.gs` en GitHub es solo respaldo.
- Confirmar que `Control → REPORTES_ACTIVOS` esté en `SI`
- Extender estas mejoras a 1S, 3S, 4S, 5S y 6P
- Evaluar pasar el repositorio a privado
