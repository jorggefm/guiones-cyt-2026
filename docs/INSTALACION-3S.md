# Instalación de los reportes de 3.° de secundaria

**Estado: el código está escrito y subido, pero NO instalado.** Hasta que se
pegue en Apps Script y se publique, el examen funciona pero **no se genera
ningún reporte**.

Tiempo: ~10 minutos. Con la cuenta `jorge.fernandez@colegiomilagrosdedios.edu.pe`.

---

## Por qué 3S es distinto de 2S y 4S

| | 2S / 4S | **3S** |
|---|---|---|
| Total | 20 puntos | **24 puntos** |
| Automático / docente | 14 / 6 | **16 / 8** |
| Escala | corte fijo (12 / 17) | **por ratio** (0.70 / 0.90) |
| Preguntas y clave | dentro del `.gs` | **`3S_U4_examen_configuracion.js`** |

Por eso `Reporte3S.gs` **no copia ningún dato del examen**: lee todo de la
config y reutiliza `automaticPoints_()`, la misma función que corrige el examen
de verdad. Así la nota del reporte no puede divergir de la nota real.

También abandona el modelo de "cubos" (automático + docente) que usan 2S y 4S.
Aquí cada pregunta guarda su puntaje y **el total es la suma**. Más simple, y sin
el frágil reparseo de la columna de detalle.

**Preguntas con parte docente: 2, 6, 8, 9 y 12** (1+1+1+1+4 = 8 puntos).

---

## Paso 1 — Agregar `Reporte3S.gs`

1. Abrir el Sheets `1bkNqkOtCfLmn_icVFPsgZVO8tUHJUFrAZy_-SIgxkfc`
2. **Extensiones → Apps Script**
3. **+ → Secuencia de comandos**, nombrarlo `Reporte3S`
4. Pegar el contenido de `Reporte3S.gs`
5. **`Ctrl+F` y buscar `function R3_generarReportes`. Debe decir `1 of 1`.**
   Si dice *No results*, el pegado no entró: hacer clic sobre una línea de
   código, confirmar que se resalta, y repetir.
6. `Ctrl+S`

---

## Paso 2 — Tres cambios en el archivo del examen

### ① Buscar `action === 'status'` (dentro de `doGet`)

Agregar debajo del bloque:

```js
    if (action === 'r3health') return R3_health_();
    if (action === 'report') return R3_reportStatus_(String(e.parameter.requestId || ''));
```

### ② Buscar `var identity = validatePayload_(payload);`

Agregar **encima**:

```js
    var accion = String(payload.action || '').toLowerCase();
    if (accion === 'requestreport') return R3_requestReport_(payload);
    if (accion === 'savereportreview') return R3_saveReview_(payload);
    if (accion === 'releasereport') return R3_release_(payload);
```

### ③ Buscar `appendGradingRow_(payload, identity, score);`

Reemplazar el final del `try` por:

```js
    appendGradingRow_(payload, identity, score);
    SpreadsheetApp.flush();

    var reporteOk = true;
    try {
      payload.studentName = identity.name || payload.studentName || '';
      payload.studentEmail = String(identity.email || '').toLowerCase();
      R3_generarUno_(payload, payload.answers);
    } catch (err) {
      reporteOk = false;
      console.error('R3: fallo al generar el reporte: ' + err);
    }

    return json_({ ok: true, duplicate: false, submissionId: payload.submissionId, reportGenerated: reporteOk });
```

`Ctrl+S`.

> El `try/catch` es deliberado: si la generación del reporte falla, **las
> respuestas ya se guardaron** y el alumno no pierde su examen. La fila se
> rehace después con `R3_generarTodos()`.

---

## Paso 3 — Publicar

**Implementar → Administrar las implementaciones → lápiz → Versión: "Nueva
versión" → Implementar.**

⚠️ **Nunca "Nueva implementación"**: cambiaría la URL y el examen dejaría de
funcionar.

> Guardar con `Ctrl+S` **no** publica. Es el error más común.

---

## Paso 4 — Verificar

```bash
EP="https://script.google.com/macros/s/AKfycbwcu8b674jxWTiw0nvBNd-mHf0u7pRc1QCG-2h_b9RVer8b9wSbcht2RuHpeAm1Ual3sA/exec"
curl -sL "$EP?action=r3health"
```

**Correcto:**
```json
{"ok":true,"instalado":true,"examId":"3S-U4-C2-OFICIAL-2026",
 "maximo":24,"preguntasDocentes":[2,6,8,9,12]}
```

**Mal:** si responde `{"ok":true,"service":"exam-template",...}` falta publicar
la versión nueva.

Y la prueba del dispatch de liberación (debe exigir sesión):

```bash
curl -sL -X POST "$EP" -H "Content-Type: text/plain;charset=utf-8" --data-binary \
 '{"action":"releaseReport","examId":"3S-U4-C2-OFICIAL-2026","requestId":"verifica1234567890","targetEmail":"x@colegiomilagrosdedios.edu.pe"}' -o /dev/null
sleep 4 && curl -sL "$EP?action=report&requestId=verifica1234567890"
```

Debe responder **`"Falta iniciar sesión con Google."`**
Si responde `R3_release_ is not defined`, falta pegar `Reporte3S.gs`.

---

## Paso 5 — Prueba en seco (opcional pero recomendado)

Con al menos un envío en la hoja, ejecutar desde el editor:

```js
R3_probar()        // no escribe nada; devuelve la nota calculada
```

Devuelve algo como `18/24 · A · Total 18/24 · P2 1/2 · P6 0/2 …`.
Sirve para confirmar que la corrección funciona **antes** de que rinda el salón.

---

## El día del examen

```
Alumno envía
 ├─▶ "Respuestas oficial"     : respuestas + puntaje automático
 ├─▶ "Calificación oficial"   : fila de consolidado
 └─▶ "Reportes"               : fila nueva, liberado = NO   ← lo nuevo
```

Automático, en el mismo instante. **No hay que correr nada.**

Después:

1. Abrir `3S_U4_reporte_C2.html` con la cuenta de administrador
2. Los pendientes aparecen marcados `PENDIENTE · Nombre`
3. Calificar las preguntas **2, 6, 8, 9 y 12**
4. Botón **"Liberar reporte"** al final, después de la pregunta 12

Si un alumno rinde dos veces, cada intento conserva su fila y aparece como
`Nombre · Intento 1` y `Nombre · Intento 2`. El alumno ve el más reciente.

---

## Si algo falla

| Mensaje | Causa | Solución |
|---|---|---|
| `R3_release_ is not defined` | Falta `Reporte3S.gs` | Paso 1 |
| Responde `service: exam-template` a `?action=r3health` | Falta publicar | Paso 3 |
| `CONFIG no se cargo` | El archivo de configuración no está en el proyecto | Verificar que `3S_U4_examen_configuracion.js` esté en Apps Script |
| El reporte dice "no encontrado" | No hay fila en `Reportes` | `R3_generarTodos()` |
| `La revisión docente todavía no ha sido liberada` | **Correcto**: falta liberar | Botón "Liberar reporte" |

⚠️ **`R3_generarReportes()` reconstruye desde las respuestas y descarta la
calificación docente de los envíos que procesa.** Pasarle correos para acotar,
o no usarla después de haber calificado.
