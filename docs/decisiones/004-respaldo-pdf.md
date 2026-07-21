# 004 — Respaldo en PDF y borrador local

**Fecha:** 2026-07-20 · **Estado:** aplicado

## Problema

El token de Google Identity vive **1 hora**. `verifyGoogleIdentity_` rechaza el
envío si expiró:

```js
if (expiresAt <= Math.floor(Date.now() / 1000))
  throw new Error('La sesión de Google expiró.');
```

Una alumna que se demore más de una hora —o que pierda conexión, o cierre el
navegador sin querer— podía perder el examen completo. Con un solo alumno
rindiendo, sin el salón alrededor, no hay red de contención.

## Decisión

Dos respaldos independientes. **Ambos funcionan sin internet y sin sesión.**

### 1. Borrador local automático

Cada cambio en el formulario se guarda en `localStorage`. Al recargar, las
respuestas vuelven y se avisa cuándo se guardaron. Se borra al enviar con éxito.

**La identidad nunca se restaura** (`NO_RESTAURAR = ["studentName",
"studentEmail"]`): esos campos los llena Google al verificar. Restaurarlos daría
la apariencia de una sesión iniciada que no existe.

Si `localStorage` no está disponible (modo privado, cuota llena), falla en
silencio y el examen sigue funcionando igual.

### 2. Copia en PDF

Botón **«Guardar copia en PDF»**, disponible durante el examen y en la pantalla
final. Arma un resumen imprimible con los datos de la alumna, el código de envío
y las 12 preguntas con su respuesta.

Decisiones de implementación:

- **No se imprime el formulario**, se genera un resumen aparte (`#printSheet` +
  `body.printing-backup`). Los `select` y `textarea` imprimen mal y de forma
  inconsistente entre navegadores.
- **Se imprime la etiqueta visible, no el valor interno.** En el PDF aparece
  «Participa en la implantación y la futura placenta», no
  `implantacion_placenta`.
- **Las preguntas sin responder salen marcadas en rojo**, no en blanco: el
  docente debe poder distinguir «no respondió» de «se perdió al imprimir».
- **El PDF dice si el examen fue enviado o no.** Es la información más importante
  de la hoja: determina si hay que calificarlo a mano.

## Alternativas descartadas

**Generar el PDF en el servidor.** Requiere que el envío funcione — justo lo que
puede estar fallando.

**Librería de PDF en el cliente** (jsPDF y similares). Dependencia externa que
hay que descargar; si la alumna está sin conexión, no carga. `window.print()` es
nativo y siempre está disponible.

## Consecuencia

Peor escenario posible: la alumna guarda el PDF, lo envía por otro medio y el
docente lo califica a mano. Deja de existir el caso «se perdió el examen».
