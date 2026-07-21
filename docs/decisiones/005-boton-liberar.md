# 005 — Botón "Liberar reporte" en vez de liberación automática

**Fecha:** 2026-07-20 · **Estado:** aplicado y verificado

## Problema

La liberación diferida ([003](003-liberacion-diferida.md)) dejó el reporte
naciendo con `liberado = NO`. Pero liberarlo requería abrir el editor de Apps
Script y ejecutar a mano:

```js
REZ_liberarReporte("correo@colegiomilagrosdedios.edu.pe")
```

Funciona, pero es incómodo y desconectado del momento en que ocurre el trabajo:
el docente termina de calificar en el reporte y tiene que irse a otra aplicación.

## Opciones

**A. Liberación automática** al calificar las 4 preguntas abiertas.
→ **Descartada.** Dos problemas. Si el docente califica dos preguntas, lo
interrumpen y vuelve al día siguiente, el reporte queda invisible sin que sepa
por qué. Y si se equivoca en un puntaje, el alumno ya lo vio.

**B. Botón explícito al final del reporte.** ✅

## Decisión

Liberar es **la acción que el alumno ve**. Ese tipo de acciones conviene que sean
un clic deliberado, no un efecto secundario de otra cosa.

El botón va **al final, después de la pregunta 12**, siguiendo el orden natural
del trabajo: se lee, se califica, se libera.

## Implementación

**Servidor** — `REZ_handleRelease_` en `Rezagada.gs`:

- Verifica identidad contra Google y exige `ADMIN_EMAILS`
- Exige correo del dominio institucional
- Escribe `SI` o `NO` en la columna 8 de `Reportes`
- Toma `LockService` para evitar escrituras simultáneas
- Sirve para liberar **y** para ocultar (`liberar: false`)

**Dispatch** — en `doPost` de `Codigo.gs`:

```js
if (action === 'releasereport') {
  return REZ_handleRelease_(payload);
}
```

**Estado** — `requestReport_` ahora informa al cliente si el reporte está
liberado:

```js
liberado: String(row[7] || '').trim().toUpperCase() === 'SI'
```

**Cliente** — barra al final de `2S_U4_reporte_C2.html`, visible **solo en modo
administrador**, con confirmación antes de liberar y actualización en vivo sin
recargar.

## Verificación

Probado de punta a punta el 20/07 con el examen de prueba del docente:

| Antes | Después |
|---|---|
| 13.50 · nivel A | **17.25 · nivel AD** |
| `Docente 0/6 · P4 0/1 · P6 0/2 · P10 0/1 · P12 0/2` | `Docente 3.75/6 · P4 1/1 · P6 1.5/2 · P10 0/1 · P12 1.25/2` |
| `liberado = NO` | `liberado = SI` |

## Limitación conocida

**Liberar no exige tener las cuatro preguntas abiertas calificadas.** En la
prueba, P10 quedó en 0/1 y el reporte se liberó igual, sin advertencia.

Queda pendiente decidir si agregar un aviso del tipo *"Falta calificar la
pregunta 10. ¿Liberar de todos modos?"*.

## Lección sobre las pruebas

La primera verificación de este botón **fue defectuosa** y dio por instalado algo
que no existía:

```bash
# INUTIL: con examId de REZAGADA la peticion entra por REZ_handleSubmit_
# aunque falte el dispatch, y responde igual en ambos casos.
'{"action":"releaseReport","examId":"2S-U4-C2-REZAGADA-2026",...}'
```

El reporte manda `examId` **oficial**. Con ese valor, la ausencia del dispatch sí
se distingue. Costó dos ciclos de despliegue descubrirlo.

**Regla:** una prueba solo sirve si puede fallar. Antes de confiar en ella,
preguntarse qué respondería si lo que se está probando no existiera.
