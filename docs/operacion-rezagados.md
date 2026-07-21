# Procedimiento: tomar el examen a un alumno rezagado

Qué hacer cuando un alumno no rindió con su salón y debe dar el examen después.

## Antes (una sola vez)

1. **Preparar la matriz nueva.** Mismos tipos de pregunta y mismas imágenes;
   solo cambia el contenido. Debe cumplir el reparto **14 automático / 6 docente**
   con las docentes en las preguntas **4, 6, 10 y 12**
   (ver [`reglas-calificacion.md`](reglas-calificacion.md)).

2. **Instalar el código.** En el proyecto de Apps Script del Sheets:
   - Agregar `Rezagada.gs` como archivo **nuevo** (no reemplaza `Codigo.gs`).
   - Aplicar las 4 ediciones a `Codigo.gs`
     (ver [`decisiones/003-liberacion-diferida.md`](decisiones/003-liberacion-diferida.md)).
   - **Publicar sobre el deployment existente**, nunca uno nuevo:
     *Administrar implementaciones → editar (lápiz) → Versión: Nueva → Implementar*.
     La URL debe quedar igual.

3. **Preparar las hojas.** Ejecutar `REZ_setupWorkbook()` una vez. Crea
   `Respuestas rezagada` y `Clave rezagada`. No toca nada del examen oficial.

4. **Verificar la llave maestra.** En la hoja `Control`, `REPORTES_ACTIVOS` debe
   estar en `SI`. Si está en `NO`, **ningún** alumno puede ver su reporte.

5. **Publicar el examen** en el repositorio y darle el enlace al alumno.

## El día del examen

El alumno entra con su correo **@colegiomilagrosdedios.edu.pe**. Sin esa cuenta
no puede rendir.

Al enviar ocurre solo:

```
Respuestas rezagada   ← sus respuestas + 14 puntos automáticos
Reportes              ← su fila, con liberado = NO
```

Si algo falla al generar el reporte, **las respuestas ya quedaron guardadas**: la
fila se rehace después con `REZ_regenerarReporte("correo")`.

### Si no logra enviar

El botón **«Guardar copia en PDF»** funciona sin internet y sin sesión de Google.
El alumno guarda el PDF, lo envía por otro medio y se califica a mano. El PDF
indica claramente si el examen fue enviado o no.

## Después: calificar

1. Abrir `2S_U4_reporte_C2.html` **con la cuenta de administrador**.
2. Buscar al alumno. Su reporte se abre aunque esté sin liberar.
3. Calificar las cuatro preguntas docentes: **4, 6, 10 y 12**. En pantalla están
   su respuesta, la respuesta ideal y la explicación.
4. Ajustar cualquier pregunta automática si hiciera falta.
5. Liberar, desde el editor de Apps Script:

```js
REZ_liberarReporte("nombre_apellido@colegiomilagrosdedios.edu.pe")
```

6. Avisar al alumno.

> **Mientras no se libere**, el alumno ve *«La revisión docente todavía no ha
> sido liberada»*. Nunca ve una nota provisional sin los 6 puntos docentes.
> Para volver a ocultarlo: `REZ_ocultarReporte("correo")`.

## Errores que hay que evitar

| ❌ No hacer | Por qué |
|---|---|
| Ejecutar `generateOfficialReports()` | Hace `clearContents()` en `Reportes`: **borra los reportes de todo el salón** |
| Ejecutar `setupExamWorkbook()` | Borra `Clave oficial` y reinicia `Control` |
| Crear un deployment nuevo | El reporte queda apuntando al código viejo |
| Modificar el formato de `detallePreguntas` | `parseTeacherBreakdown_` deja de leer el puntaje docente |
| Repartir distinto de 14/6 | Los topes truncan la nota sin avisar |
| `REZ_regenerarReporte()` después de calificar | Descarta la calificación docente ya puesta |

## Comprobación rápida

```js
REZ_setupWorkbook()                       // prepara hojas (una vez)
REZ_regenerarReporte("correo@...")        // rehace la fila si falló
REZ_liberarReporte("correo@...")          // el alumno ya puede verlo
REZ_ocultarReporte("correo@...")          // lo vuelve a ocultar
```
