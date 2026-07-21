# Qué es cada archivo y por qué existe

Explicación sin tecnicismos de las piezas del sistema.

## Las tres piezas

Un examen no es un archivo: son **tres cosas distintas**, cada una en un lugar
distinto, que se hablan entre sí.

```
1. El examen        →  vive en GitHub      →  lo abre la alumna
2. El programa      →  vive en Google      →  corrige y guarda
3. El reporte       →  vive en GitHub      →  muestra la nota
```

---

## 1. Archivos `.html` — lo que se ve

`2S_U4_examen_C2_rezagada.html`, `2S_U4_reporte_C2.html`, `Guion_2S.html`…

Son **páginas web**. Es lo único que la alumna ve y toca. Se suben a GitHub y
quedan disponibles en un enlace `jorggefm.github.io/...`.

Un `.html` **no sabe corregir**. Solo muestra las preguntas y recoge respuestas.
Cuando la alumna presiona «enviar», se las manda al programa.

> **Por qué el examen no tiene las respuestas adentro:** si estuvieran ahí,
> cualquiera podría verlas con clic derecho → «Ver código fuente». Las respuestas
> viven en el programa, en el servidor de Google, donde nadie las puede leer.

## 2. Archivos `.gs` — el programa que corrige

`Codigo.gs`, `Rezagada.gs`

**`.gs` significa «Google Script».** Es un programa que corre en los servidores de
Google, no en la computadora de nadie. Es el cerebro del sistema: recibe las
respuestas, las corrige, calcula la nota y escribe en el Excel.

### Por qué hay que pegarlo a mano

Este es el punto que más confunde. Un `.gs` **no funciona por estar en GitHub**.
En GitHub es solo un respaldo, un texto guardado.

Para que funcione de verdad tiene que estar **dentro del proyecto de Apps Script
que está pegado al Google Sheets**. Y a ese lugar solo se entra con la cuenta de
Google del colegio.

Por eso:

| | |
|---|---|
| Subir un `.html` a GitHub | ✅ ya funciona, con solo el enlace |
| Subir un `.gs` a GitHub | ❌ **no hace nada**, es solo respaldo |
| Pegar el `.gs` en Apps Script | ✅ **esto es lo que lo activa** |

Es como la diferencia entre tener la receta escrita en un cuaderno y tenerla
puesta en la cocina. El cuaderno no cocina.

### Qué hace cada uno

- **`Codigo.gs`** — el examen oficial que ya rindió el salón.
- **`Rezagada.gs`** — el examen de recuperación. Es un archivo **aparte** que se
  agrega al mismo proyecto; no reemplaza al anterior. Ambos conviven.

## 3. El Google Sheets — donde queda todo

Un solo archivo de Excel con varias pestañas:

| Pestaña | Qué guarda |
|---|---|
| `Respuestas` | un simulacro viejo |
| `Respuestas oficial` | el examen que rindió el salón |
| `Respuestas rezagada` | el examen de recuperación *(nueva)* |
| `Reportes` | **de aquí sale la nota que ve el alumno** |
| `Control` | interruptores generales |
| `Clave oficial` / `Clave rezagada` | las respuestas correctas |

## 4. La carpeta `docs/` — esta documentación

No es parte del sistema. Es **memoria del proyecto**: para que dentro de seis
meses tú, o cualquier agente que audite el repositorio, entienda por qué las
cosas están como están sin tener que deducirlo.

---

## Preguntas frecuentes

**¿El reporte es un archivo nuevo?**
**No.** Es exactamente el mismo `2S_U4_reporte_C2.html` de siempre, sin un solo
cambio. Funciona porque busca al alumno **por su correo** en la pestaña
`Reportes`, sin importar qué examen rindió.

**¿Sigo necesitando que un agente genere el reporte?**
**No.** Antes, alguien tenía que pasar los datos de `Respuestas` a `Reportes` a
mano. Ahora eso pasa solo, al momento en que la alumna envía el examen. Lo único
manual son las 4 preguntas abiertas, que las calificas tú desde el reporte.

**¿Por qué la alumna no ve su nota apenas termina?**
Porque su reporte nace «no liberado». Vería una nota incompleta, sin los 6 puntos
de las preguntas abiertas. Tú calificas primero y luego lo liberas.

**¿Qué pasa si algo falla al enviar?**
Las respuestas se guardan antes que el reporte, así que no se pierden. Y el
examen tiene un botón de «Guardar copia en PDF» que funciona sin internet.
