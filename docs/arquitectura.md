# Arquitectura del sistema de exámenes

Referencia: **2.° de secundaria, Unidad 4, competencia C2.**

## Vista general

```
┌──────────────────────────┐
│ 2S_U4_examen_C2.html     │  examen oficial
│ 2S_U4_examen_..._rezagada│  examen de recuperación
└───────────┬──────────────┘
            │ POST  {examId, submissionId, googleCredential, q1..q12}
            ▼
┌──────────────────────────────────────────────┐
│  Apps Script (un solo deployment)            │
│  ┌────────────┐        ┌──────────────────┐  │
│  │ Codigo.gs  │◄──────►│  Rezagada.gs     │  │
│  │  oficial   │dispatch│  recuperación    │  │
│  └────────────┘        └──────────────────┘  │
└───────────┬──────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────┐
│  Google Sheets  1J_zSUrg…N9lQ                │
│   • Respuestas            (simulacro previo) │
│   • Respuestas oficial    ← examen oficial   │
│   • Respuestas rezagada   ← recuperación     │
│   • Clave oficial / Clave rezagada           │
│   • Calificacion oficial                     │
│   • Control               ← REPORTES_ACTIVOS │
│   • Reportes              ← LEE EL REPORTE   │
└───────────┬──────────────────────────────────┘
            │ GET ?action=report
            ▼
┌──────────────────────────┐
│ 2S_U4_reporte_C2.html    │  sirve para AMBOS exámenes
└──────────────────────────┘
```

## La pieza clave: la hoja "Reportes"

El reporte **no lee las respuestas**. Lee únicamente la hoja `Reportes`, y
localiza al alumno **por su correo** (columna 2). Todo lo que muestra sale del
JSON de la columna 9 de esa fila.

Consecuencia central: **el reporte es agnóstico al examen.** Cualquier examen que
deposite una fila bien formada en `Reportes` se muestra sin modificar el HTML del
reporte. Por eso el examen de recuperación no necesitó un reporte propio.

### Columnas de "Reportes"

| # | Columna | Contenido |
|---|---|---|
| 1 | `submissionId` | identificador del envío |
| 2 | `correo` | **clave de búsqueda** |
| 3 | `nombre` | |
| 4 | `puntajeFinal` | 0–20 |
| 5 | `nivel` | AD / A / B |
| 6 | `detallePreguntas` | cadena legible **que se vuelve a parsear** (ver abajo) |
| 7 | `comentario` | |
| 8 | `liberado` | `SI` = el alumno puede verlo |
| 9 | `reporte_json` | el reporte completo |

⚠️ **La columna 6 no es decorativa.** `parseTeacherBreakdown_` la lee con una
expresión regular para recuperar el puntaje docente por pregunta:

```
Automático 11.5/14 · Docente 4/6 · P4 1/1 · P6 1.5/2 · P10 0.5/1 · P12 1/2
```

Si se cambia ese formato, la calificación docente deja de recuperarse y los
puntajes se corrompen al editar. **No tocar sin ajustar `parseTeacherBreakdown_`.**

## Autenticación

Ambos exámenes y el reporte exigen cuenta institucional:

- El navegador obtiene un token con Google Identity Services.
- `verifyGoogleIdentity_` lo valida **en el servidor** contra
  `oauth2.googleapis.com/tokeninfo`, y verifica emisor, audiencia, expiración,
  `email_verified` y que `hd` sea `colegiomilagrosdedios.edu.pe`.
- La validación del navegador es solo comodidad; **la que manda es la del
  servidor**. Nadie puede rendir ni ver un reporte sin correo del colegio.

El token vive **1 hora**. Un examen más largo que eso falla al enviar — de ahí el
respaldo en PDF (ver [`decisiones/004-respaldo-pdf.md`](decisiones/004-respaldo-pdf.md)).

## Los dos exámenes son estructuralmente idénticos

Solo cambia el contenido. Comparten:

- 12 preguntas, 20 puntos
- **14 puntos automáticos + 6 docentes**
- Preguntas docentes: **4 (1pt), 6 (2pts), 10 (1pt), 12 (2pts)**
- Las mismas 6 imágenes de `assets/2s_u4_examen_oficial/`

Por eso `EDITABLE_REVIEW_QUESTIONS`, `saveReportReview_` y toda la matemática de
recálculo sirven **sin cambios** para ambos. Ver
[`decisiones/001-examen-paralelo.md`](decisiones/001-examen-paralelo.md).

## Constantes compartidas

Viven en `Codigo.gs` y `Rezagada.gs` las reutiliza:

| Constante | Valor |
|---|---|
| `SPREADSHEET_ID` | `1J_zSUrgqXN0fg9H2ylyOpaXctvrxZpB6ewAutZwN9lQ` |
| `SCHOOL_DOMAIN` | `colegiomilagrosdedios.edu.pe` |
| `ADMIN_EMAILS` | `jorge.fernandez@colegiomilagrosdedios.edu.pe` |
| `EXAM_ID` oficial | `2S-U4-C2-OFICIAL-2026` |
| `REZ_EXAM_ID` | `2S-U4-C2-REZAGADA-2026` |

**Un solo deployment** sirve a todo. Al publicar una versión nueva del proyecto
hay que hacerlo sobre el deployment existente (*Administrar implementaciones →
editar → versión nueva*) para conservar la URL. Un deployment nuevo generaría
otra URL y dejaría al reporte apuntando al código viejo.

## Interruptores globales

- **`Control` → `REPORTES_ACTIVOS`**: si no es `SI`, `reportsEnabled_()` bloquea
  **todos** los reportes, de todos los alumnos. Llave maestra.
- **`Reportes` → columna `liberado`**: control por alumno.

## Funciones peligrosas

| Función | Riesgo |
|---|---|
| `setupExamWorkbook()` | Hace `clearContents()` sobre `Clave oficial` y `Control`. **Solo para instalación inicial.** |
| `generateOfficialReports()` *(existe en 1S, no en 2S)* | Hace `clearContents()` sobre `Reportes`: **borra los reportes de todo el salón**. Nunca usar para agregar un alumno. |
| `REZ_regenerarReporte()` | Rehace la fila y **descarta la calificación docente ya puesta**. |
