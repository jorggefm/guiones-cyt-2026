# Flujo completo: del examen al reporte liberado

**Caso de estudio operativo de 2S.** Describe el ciclo entero, paso a paso, tal como quedó
**verificado el 20 de julio de 2026** con el examen de recuperación de 2.° de
secundaria (Unidad 4, competencia C2).

Todo lo que dice aquí fue ejecutado y comprobado, no supuesto.

Para generar un examen nuevo sin copiar las particularidades de 2S, usar
[`GENERACION-CON-AGENTE.md`](GENERACION-CON-AGENTE.md) y la plantilla neutral.

---

## 0. El modelo mental

Tres piezas en tres lugares distintos:

```
   GITHUB                    GOOGLE                      GITHUB
┌────────────┐         ┌──────────────────┐         ┌────────────┐
│  examen    │  POST   │   Apps Script    │         │  reporte   │
│   .html    │────────▶│  Codigo.gs       │◀────────│   .html    │
└────────────┘         │  Rezagada.gs     │   GET   └────────────┘
                       └────────┬─────────┘
                                │
                       ┌────────▼─────────┐
                       │  Google Sheets   │
                       │  (un solo libro) │
                       └──────────────────┘
```

**Dos exámenes distintos escriben en el mismo libro y comparten un solo reporte.**

| Examen | EXAM_ID | Hoja de respuestas |
|---|---|---|
| Oficial (el salón) | `2S-U4-C2-OFICIAL-2026` | `Respuestas oficial` |
| Recuperación (rezagada) | `2S-U4-C2-REZAGADA-2026` | `Respuestas rezagada` |

Ambos depositan su resultado en **la misma hoja `Reportes`**, y el archivo
`2S_U4_reporte_C2.html` sirve a los dos **sin ninguna diferencia**, porque busca
al alumno **por su correo**, no por el examen que rindió.

Esa es la decisión central del diseño. Ver
[`decisiones/001-examen-paralelo.md`](decisiones/001-examen-paralelo.md).

### Hojas del libro

| Hoja | Qué guarda | Quién escribe |
|---|---|---|
| `Respuestas` | simulacro viejo | — |
| `Respuestas oficial` | examen del salón | `doPost` |
| `Respuestas rezagada` | examen de recuperación | `REZ_handleSubmit_` |
| `Clave oficial` / `Clave rezagada` | respuestas correctas | `setup` |
| `Calificacion oficial` | consolidado | `saveReportReview_` |
| `Control` | `REPORTES_ACTIVOS` (llave maestra) | manual |
| **`Reportes`** | **de aquí sale la nota que ve el alumno** | `REZ_buildReportRow_` y `saveReportReview_` |

---

## 1. Preparar la matriz de preguntas

Antes de escribir una línea de código.

### Reglas que la matriz DEBE cumplir

**12 preguntas. 20 puntos. Reparto 14 automático / 6 docente.**

| Preguntas docentes | Puntos docentes |
|---|---|
| 4 | 1 |
| 6 | 2 |
| 10 | 1 |
| 12 | 2 |
| | **6** |

Ese reparto está **cableado** en `saveReportReview_`:

```js
Math.min(14, ...)                      // tope automático
[4, 6, 10, 12].reduce(...)             // qué preguntas suman al docente
Math.min(6, ...)                       // tope docente
```

⚠️ **Si la matriz reparte distinto, los topes truncan la nota en silencio** y el
alumno pierde puntos sin que nada avise.

### Tipos de pregunta disponibles

Reutilizar estos; no inventar widgets nuevos:

| Tipo | Widget | Ejemplo (recuperación) |
|---|---|---|
| Alternativa | radio ×4 | 1, 9, 11 |
| Ordenamiento | 5 desplegables 1–5 | 2 |
| Relacionar | desplegables letra→función | 3, 5 |
| Imagen + explicación | desplegable + textarea *(mixta)* | 4, 10 |
| Vocabulario | campo de texto | 8 |
| Lectura de imagen | campos de texto | 7 |
| Explicación abierta | textarea *(docente)* | 6, 12 |

### Verificar las imágenes ANTES de escribir las preguntas

**Abrir cada imagen y confirmar que las letras que menciona la pregunta existen.**
Esto salvó dos errores el 20/07: la matriz mencionaba `B` en el disco trilaminar
y `A`, `C`, `D` en el soporte temprano. Ambas resultaron correctas, pero solo se
supo al mirarlas.

Imágenes de 2S U4 en `assets/2s_u4_examen_oficial/`:

| Archivo | Etiquetas reales |
|---|---|
| `01_blastocisto.png` | A, B, C |
| `02_implantacion.png` | A |
| `03_capas_embrionarias.png` | A=ectodermo, **B=mesodermo**, C=endodermo |
| `04_secuencia_neurulacion.png` | 4 paneles numerados 1–4 |
| `05_soporte_temprano.png` | A=embrión, B=saco vitelino, C=cordón, D=placenta |
| `06_cierre_tubo_neural.png` | A=cerrado, B=cierre incompleto |

---

## 2. Escribir el examen (.html)

**No escribirlo desde cero. Derivarlo del examen existente.**

Así el CSS, el login con Google, el contador de salidas de pantalla y la lógica
de envío —todo ya probado con 30 alumnos— quedan intactos.

```bash
# 1) bajar el original
gh api repos/jorggefm/guiones-cyt-2026/contents/2S_U4_examen_C2.html \
   --jq '.content' | base64 -d > base.html

# 2) conservar cabecera+intro (1-359) y pie+script (489-fin),
#    reemplazar solo el bloque <form>
sed -n '1,359p' base.html  > nuevo.html
cat preguntas_nuevas.html >> nuevo.html
sed -n '489,808p' base.html >> nuevo.html
```

### Cambios obligatorios en el .html

```js
const EXAM_ID      = "2S-U4-C2-REZAGADA-2026";   // nuevo
const EXAM_VERSION = "2026-07-21";                // nuevo
// y en verifySubmission, agregar examId a la URL:
`${SUBMIT_ENDPOINT}?action=status&examId=${encodeURIComponent(EXAM_ID)}&submissionId=...`
```

El `SUBMIT_ENDPOINT`, el `GOOGLE_CLIENT_ID` y el `SCHOOL_DOMAIN` **no se tocan**.

### Verificación obligatoria

Los nombres de campo del HTML deben coincidir **exactamente** con los que lee el
`.gs`. Un solo campo mal escrito = esa pregunta vale 0 y nadie se entera.

```bash
grep -oE 'name="q[0-9]+[a-z_0-9]*"' examen.html | sed 's/name="//;s/"//' | sort -u > campos_html.txt
grep -oE '\b(data|p|payload)\.q[0-9]+[a-z_0-9]*' Rezagada.gs | sed 's/^[a-z]*\.//' | sort -u > campos_gs.txt
comm -3 campos_html.txt campos_gs.txt     # debe salir VACIO
```

También verificar que los valores de las opciones correctas existan en el HTML:

```bash
for v in implantacion_placenta forma_embrion trofoblasto embrion placenta; do
  echo "$v: $(grep -c "value=\"$v\"" examen.html)"
done
```

---

## 3. Escribir la lógica (.gs)

**Archivo NUEVO, no modificar el del examen oficial.** Todo prefijado con `REZ_`
porque Apps Script comparte un único ámbito global entre archivos: un nombre
repetido rompe el proyecto entero.

`Rezagada.gs` contiene:

| Elemento | Para qué |
|---|---|
| `REZ_EXAM_ID`, `REZ_RESPONSES_SHEET` | identidad y hoja propia |
| `REZ_KEY_ROWS` | clave de respuestas, puntajes y explicaciones |
| `REZ_PROMPTS` | enunciados que verá el docente al calificar |
| `REZ_scoreAutomatic_` | los 14 puntos automáticos |
| `REZ_buildReportRow_` | **crea la fila en `Reportes`** |
| `REZ_handleRelease_` | el botón "Liberar reporte" |
| `REZ_health_` | señal de vida para verificar la instalación |

### Probar la corrección ANTES de instalar

```bash
node docs/pruebas/test_calificacion_rezagada.js Rezagada.gs
```

20 casos: máximo, vacío, doble conteo, tolerancia ortográfica, parciales y
alternativas. **Deben pasar los 20.** Si se toca `REZ_scoreAutomatic_`, correrlas
otra vez.

---

## 4. Instalar en Apps Script

⚠️ **El paso donde más se falla.** El 20/07 tres pegados no entraron y el sistema
quedó roto sin aviso.

### Por qué falla

El editor de Apps Script pierde el foco al cambiar de archivo. Si el foco está en
la **lista de archivos**, `Ctrl+A` selecciona los nombres de archivo, no el
código, y `Ctrl+V` no hace nada. **El editor no da ningún error.**

### Método correcto, paso a paso

1. Abrir el Sheets → **Extensiones → Apps Script**
2. Seleccionar el archivo en la lista de la izquierda
3. **Hacer clic sobre una línea de código** (no en el vacío)
4. **Confirmar que esa línea quedó activa** (se resalta con un borde)
5. `Ctrl+A` → `Ctrl+V`
6. **`Ctrl+F` y buscar algo que solo exista en la versión nueva.** Debe decir
   `1 of 1`. Si dice `No results`, el pegado no entró — volver al paso 3.
7. `Esc` → `Ctrl+S`

**No saltarse el paso 6.** Es la única forma de saber si el pegado entró.

### Publicar

**Implementar → Administrar las implementaciones → lápiz (editar) →
Versión: "Nueva versión" → Implementar**

⚠️ **Nunca "Nueva implementación".** Eso crea otra URL y deja al reporte
apuntando al código viejo.

Al terminar, el ID debe seguir siendo el mismo:
`AKfycbxJQvanNhT4O1bsr…FufkBRuYAQ`

> **Guardar con Ctrl+S no publica.** El código queda guardado pero la URL sigue
> sirviendo la versión anterior. Es el error más común.

### Verificar la instalación

```bash
EP="https://script.google.com/macros/s/AKfycbxJQvanNhT4O1bsrC3WQaeti0YDmjYtMPZaOVYmnXqIPbsR-o5NynSradl2FufkBRuYAQ/exec"

# 1) el examen nuevo esta instalado?
curl -sL "$EP?action=rezagada"
# CORRECTO: {"ok":true,"instalado":true,"examId":"2S-U4-C2-REZAGADA-2026",...}
# MAL:      {"ok":true,"examId":"2S-U4-C2-OFICIAL-2026",...}   <- falta publicar

# 2) el boton de liberar esta cableado?  (OJO: examId OFICIAL, ver seccion 8)
curl -sL -X POST "$EP" -H "Content-Type: text/plain;charset=utf-8" --data-binary \
 '{"action":"releaseReport","examId":"2S-U4-C2-OFICIAL-2026","requestId":"verifica1234567890","targetEmail":"x@colegiomilagrosdedios.edu.pe"}' -o /dev/null
sleep 4 && curl -sL "$EP?action=report&requestId=verifica1234567890"
# CORRECTO: {"ok":false,"error":"Falta iniciar sesión con Google."}
# MAL:      "REZ_handleRelease_ is not defined"      <- falta pegar Rezagada.gs
# MAL:      "Falta el identificador del envío."      <- falta pegar Codigo.gs

# 3) el examen oficial sigue intacto?
curl -sL "$EP"
```

### Verificar la llave maestra

Hoja **`Control`** → `REPORTES_ACTIVOS` debe decir **`SI`**.
Si dice `NO`, `reportsEnabled_()` bloquea **todos** los reportes, incluidos los
que el salón ya vio.

---

## 5. Publicar el examen

```bash
python - <<'PY'
import json, base64, subprocess
REPO="jorggefm/guiones-cyt-2026"
data=base64.b64encode(open("2S_U4_examen_C2_rezagada.html","rb").read()).decode()
sha=subprocess.run(["gh","api",f"repos/{REPO}/contents/2S_U4_examen_C2_rezagada.html","--jq",".sha"],
                   capture_output=True,text=True).stdout.strip()
p={"message":"Examen de recuperacion","content":data,"branch":"master"}
if sha and "message" not in sha: p["sha"]=sha
json.dump(p,open("p.json","w"))
subprocess.run(["gh","api","-X","PUT",f"repos/{REPO}/contents/2S_U4_examen_C2_rezagada.html","--input","p.json"])
PY
```

GitHub Pages tarda **1–3 minutos**. Verificar:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://jorggefm.github.io/guiones-cyt-2026/2S_U4_examen_C2_rezagada.html"
```

> **Nota de privacidad:** el examen `.html` **no** contiene las respuestas —
> la corrección vive en el servidor. Pero `Rezagada.gs` **sí** es la clave
> completa, y el repositorio es público. Considerar subirlo después del examen.

---

## 6. El día del examen

### Lo que hace el alumno

1. Abre el enlace
2. **Inicia sesión con su correo `@colegiomilagrosdedios.edu.pe`** — sin eso no
   puede rendir. `verifyGoogleIdentity_` valida contra Google el emisor, la
   audiencia, la expiración y el dominio.
3. Responde las 12 preguntas
4. Envía

### Lo que pasa solo

```
Envío
 ├─▶ "Respuestas rezagada"  : respuestas + 14 pts automáticos
 └─▶ "Reportes"             : fila nueva, liberado = NO
```

Ambas cosas ocurren en el mismo instante. **No hay que correr nada.**

La fila del reporte se genera dentro de un `try/catch` **posterior** al guardado
de las respuestas: si la generación falla, las respuestas ya están a salvo y la
fila se rehace con `REZ_regenerarReporte("correo")`.

### Si el alumno no logra enviar

El examen tiene dos respaldos que funcionan **sin internet y sin sesión**:

- **Borrador automático** en `localStorage`: al recargar, sus respuestas vuelven.
- **Botón "Guardar copia en PDF"**: genera un resumen con sus 12 respuestas, su
  código de envío, y dice claramente si el examen fue enviado o no.

El token de Google vive **1 hora**. Si el alumno se demora más, el envío falla y
el PDF es la salida.

---

## 7. Calificar y liberar

### Entrar

Abrir `2S_U4_reporte_C2.html` **con la cuenta de administrador**
(`jorge.fernandez@colegiomilagrosdedios.edu.pe`).

Aparece el índice de todos los reportes. Los que faltan liberar salen marcados:

```
PENDIENTE · Jorge Luis Fernandez Manrique · 13.5/20 · A
Abigail Alessia Trejo Briceño · 18.5/20 · AD
```

> El administrador **no necesita liberar nada para ver un reporte**. Ve los
> pendientes directamente. La liberación es solo para el alumno.

> El índice **lista todos los reportes, liberados o no**, incluida la fila del
> propio administrador si rindió el examen de prueba. Originalmente filtraba a
> `liberado = 'SI'` y excluía al administrador; ambos filtros se quitaron el
> 20/07, porque impedían seleccionar un reporte pendiente para calificarlo y
> anulaban la liberación diferida. Ver
> [`decisiones/003`](decisiones/003-liberacion-diferida.md).

### Calificar

Bajar por las 12 preguntas. En cada una se ve:

- la respuesta del alumno
- la respuesta ideal (de `REZ_KEY_ROWS`)
- la explicación
- un comentario de arranque ya redactado, editable

**Calificar las cuatro abiertas: 4, 6, 10 y 12.** Cada guardado recalcula la nota
al instante y actualiza `detallePreguntas` en el Sheets.

### Liberar

Al final, **después de la pregunta 12**, está la barra:

```
Pendiente: el estudiante todavía NO ve este reporte.     [Liberar reporte]
Revisa las 12 preguntas y califica las abiertas
(4, 6, 10 y 12) antes de liberar.
```

Un clic, confirmación, y listo. La columna `liberado` pasa a `SI` y el alumno ya
lo ve.

Es reversible: el botón cambia a **"Ocultar reporte"** por si hay que corregir.

⚠️ **Liberar no exige tener las cuatro calificadas.** Si se salta una, el alumno
ve la nota sin esos puntos y no hay advertencia. Revisar antes de liberar.

### Alternativa por consola

Si el botón falla, desde el editor de Apps Script:

```js
REZ_liberarReporte("correo@colegiomilagrosdedios.edu.pe")
REZ_ocultarReporte("correo@colegiomilagrosdedios.edu.pe")
```

---

## 8. Cómo diagnosticar cuando algo falla

Cada mensaje de error apunta a una línea distinta. **Usar el texto exacto.**

| Mensaje | Significa | Solución |
|---|---|---|
| `Falta el identificador del envío` | La petición no trae `action` reconocida y cayó a `validatePayload_` | Falta un dispatch en `doPost` de `Codigo.gs` |
| `REZ_handleRelease_ is not defined` | El dispatch existe pero la función no | Falta pegar `Rezagada.gs` |
| `Examen no reconocido` | `examId` no coincide | Revisar la constante en el `.html` |
| `Falta iniciar sesión con Google` | **Correcto** en pruebas anónimas | — |
| `La revisión docente todavía no ha sido liberada` | **Correcto**, falta liberar | Botón "Liberar reporte" |
| `No encontramos un examen liberado` | No hay fila en `Reportes` | `REZ_regenerarReporte("correo")` |
| `Los reportes todavía no han sido habilitados` | `REPORTES_ACTIVOS` ≠ `SI` | Corregir en la hoja `Control` |

### ⚠️ Cómo NO diseñar una prueba

El 20/07 se dio por bueno un dispatch que no existía, por una prueba mal armada:

```bash
# PRUEBA INUTIL: con examId de REZAGADA, la peticion entra por REZ_handleSubmit_
# aunque falte el dispatch, y responde lo mismo en ambos casos.
'{"action":"releaseReport","examId":"2S-U4-C2-REZAGADA-2026",...}'

# PRUEBA CORRECTA: el reporte manda examId OFICIAL. Solo asi se distingue.
'{"action":"releaseReport","examId":"2S-U4-C2-OFICIAL-2026",...}'
```

**Regla: una prueba solo sirve si puede fallar.** Antes de confiar en ella,
preguntarse *"¿qué respuesta daría si la cosa que estoy probando no existiera?"*.
Si la respuesta es la misma, la prueba no prueba nada.

Lo mismo pasó con la verificación de instalación: `?action=status` devolvía
`{"ok":true,"found":false}` con el código viejo y con el nuevo. Por eso se agregó
`REZ_health_`, que responde algo **imposible** de producir sin el código nuevo.

---

## 9. Lo que nunca hay que hacer

| ❌ | Por qué |
|---|---|
| Ejecutar `generateOfficialReports()` *(existe en 1S)* | Hace `clearContents()` en `Reportes`: **borra los reportes de todo el salón** |
| Ejecutar `setupExamWorkbook()` | Borra `Clave oficial` y reinicia `Control` |
| Crear una **implementación nueva** | Cambia la URL; el reporte queda hablándole al código viejo |
| Cambiar el formato de `detallePreguntas` | `parseTeacherBreakdown_` deja de leer el puntaje docente y las notas se corrompen |
| Repartir distinto de 14/6 | Los topes truncan la nota sin avisar |
| `REZ_regenerarReporte()` después de calificar | Descarta la calificación docente |
| Reponer la guarda de `'SI'` en `saveReportReview_` | Es intencional que no esté. Ver [`decisiones/003`](decisiones/003-liberacion-diferida.md) |
| Pegar código sin verificar con `Ctrl+F` | El editor no avisa cuando el pegado no entra |

---

## 10. Lista de verificación

**Antes del examen**

- [ ] Matriz cuadra 14/6 con docentes en 4, 6, 10 y 12
- [ ] Imágenes abiertas y etiquetas confirmadas
- [ ] `comm -3` de campos HTML vs `.gs` sale vacío
- [ ] Las 20 pruebas de calificación pasan
- [ ] `?action=rezagada` responde `instalado: true`
- [ ] La prueba de `releaseReport` responde *"Falta iniciar sesión"*
- [ ] `REPORTES_ACTIVOS = SI`
- [ ] El examen responde HTTP 200 en GitHub Pages
- [ ] El ID de implementación no cambió

**Después del examen**

- [ ] Aparece su fila en `Respuestas rezagada`
- [ ] Aparece su fila en `Reportes` con `liberado = NO`
- [ ] El reporte le dice "pendiente de revisión"
- [ ] Calificadas las preguntas 4, 6, 10 y 12
- [ ] Botón "Liberar reporte" pulsado
- [ ] La columna `liberado` dice `SI`
- [ ] El alumno confirma que ve su nota
