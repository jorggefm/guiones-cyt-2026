# Reglas de calificación

Estas reglas documentan el caso de **2S U4 y su recuperación**. Son criterio
pedagógico del docente, no una convención técnica global. Cada examen nuevo debe
respetar su propia matriz y configuración; por ejemplo, 3S U4 suma 24 puntos y
reparte 16 automáticos / 8 docentes.

## 1. En 2S, el reparto 14 / 6 es obligatorio

| | Puntos |
|---|---|
| Corrección automática | **14** |
| Revisión docente | **6** |
| **Total** | **20** |

No es una convención suelta: está **cableado** en `saveReportReview_`.

```js
const automaticScore = Math.round(Math.max(0, Math.min(14, ...)) * 100) / 100;
const teacherScore   = [4, 6, 10, 12].reduce(...);
const roundedTeacher = Math.round(Math.max(0, Math.min(6, teacherScore)) * 100) / 100;
```

Si un examen reparte distinto (por ejemplo 13.5 / 6.5), **los topes truncan la
nota en silencio** y el alumno pierde puntos sin que nada avise.

Reparto docente fijo: **Q4 = 1 · Q6 = 2 · Q10 = 1 · Q12 = 2**.

## 2. Puntaje proporcional por componente

Una pregunta con varias partes reparte su puntaje **en proporción a las partes
correctas**. Nunca es todo o nada, y nunca se redondea a la mitad.

> Una pregunta de 1 punto con 4 componentes, de los que acierta 3 → **0.75**.
> Una pregunta de 2 puntos con 4 componentes, de los que acierta 3 → **1.5**.

Reparto vigente en el examen de recuperación:

| Pregunta | Puntos | Componentes | Cada uno |
|---|---|---|---|
| 2 — cronología | 2 | 5 | 0.4 |
| 3 — letra/función | 2 | 3 | 0.667 |
| 5 — capa/derivados | 2 | 3 | 0.667 |
| 7 — capa + 2 derivados | 1.5 | 3 | 0.5 |
| 10 — A y D (parte auto) | 1 | 2 | 0.5 |

### Efecto secundario de las preguntas de 3 opciones y 3 casillas

En las preguntas 3 y 5, con tres opciones para tres casillas, **es imposible
acertar exactamente dos**: quien acierta dos acierta las tres por descarte. Los
resultados posibles son 3, 1 o 0 aciertos. Es una consecuencia conocida del
formato, no un error de cálculo.

## 3. Tolerancia ortográfica en respuestas escritas

Un error de tipeo no es un error conceptual. En los campos de texto libre,
`accepted_()` da por buena la respuesta si se cumple **cualquiera** de estas:

1. La respuesta contiene el término esperado, o el término contiene a la respuesta
2. Similitud ≥ **0.82** (Levenshtein normalizado); **0.78** en la pregunta 8

Antes de comparar, `normalize_()` quita tildes, mayúsculas, puntuación y espacios
sobrantes.

Casos reales que **aprueban**: `neurulacion`, `neurulasion`, `mezodermo`,
`musculo` por «músculos», `trofoblast`.
Caso que **no aprueba**: `organogénesis` cuando se pide `neurulación` — es otro
término, no un error de tipeo.

**Los menús desplegables se comparan de forma exacta.** No hace falta tolerancia:
la alumna elige de una lista.

## 4. Sin doble conteo

Cuando una pregunta pide **dos elementos distintos** de una lista de válidos, el
mismo elemento no puede puntuar dos veces.

Pregunta 7 (dos derivados del mesodermo, de seis posibles):

| Responde | Obtiene |
|---|---|
| huesos / sangre | 1.0 |
| huesos / pulmones | 0.5 |
| **huesos / huesos** | **0.5** |
| **huesos / hueso** | **0.5** *(mismo concepto)* |

`REZ_scoreMesodermo_` marca cada grupo apenas se usa, de modo que el segundo
campo no puede reclamarlo otra vez. Los sinónimos están agrupados: `huesos`,
`hueso`, `esqueleto` y `tejido oseo` cuentan como **un solo** derivado.

## 5. Todo es editable por el docente

Las 12 preguntas admiten ajuste manual de puntaje y comentario desde el reporte
en modo administrador (`EDITABLE_REVIEW_QUESTIONS`). La corrección automática es
un punto de partida, no la última palabra.

Al ajustar una pregunta automática se recalcula el subtotal automático; al
ajustar una mixta o abierta se conserva el desglose docente.

## 6. Escala de nivel

```js
if (score < 12) return 'B';
if (score < 17) return 'A';
return 'AD';
```

| Nota | Nivel |
|---|---|
| 0 – 11.99 | **B** |
| 12 – 16.99 | **A** |
| 17 – 20 | **AD** |

## Verificación

Las reglas 1 a 4 tienen pruebas en `docs/pruebas/test_calificacion_rezagada.js`
(20 casos: máximo, vacío, doble conteo, tolerancia, parciales y alternativas).
**Correrlas ante cualquier cambio en la corrección automática.**
