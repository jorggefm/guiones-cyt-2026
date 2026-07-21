# Documentación del sistema de exámenes CYTEC

Esta carpeta es **memoria del proyecto**, no parte del sitio. Nada en `docs/`
está enlazado desde `index.html` ni se publica en GitHub Pages.

## Para qué existe

Los exámenes de este repositorio no son archivos sueltos: son un sistema con
tres piezas acopladas (HTML del examen → Apps Script → Google Sheets → HTML del
reporte). Ese acoplamiento no se ve leyendo un archivo solo, y varias decisiones
del código parecen errores hasta que se conoce el motivo.

Sin esta carpeta, cada auditoría del repositorio vuelve a empezar de cero — y en
el peor caso alguien "arregla" algo que era intencional.

## Cómo leer esto

| Si necesitas… | Lee |
|---|---|
| **Hacer un examen de principio a fin** | [`FLUJO-COMPLETO.md`](FLUJO-COMPLETO.md) ← **documento maestro** |
| **Entender qué es cada archivo** (si algo no se entiende) | [`que-es-cada-archivo.md`](que-es-cada-archivo.md) |
| **Instalar el código en Apps Script** | [`INSTALACION.md`](INSTALACION.md) |
| Entender cómo se conectan las piezas | [`arquitectura.md`](arquitectura.md) |
| Saber cómo se asignan los puntajes | [`reglas-calificacion.md`](reglas-calificacion.md) |
| Tomar el examen a un alumno rezagado | [`operacion-rezagados.md`](operacion-rezagados.md) |
| Saber qué cambió y cuándo | [`CHANGELOG.md`](CHANGELOG.md) |
| Entender **por qué** algo está así | [`decisiones/`](decisiones/) |

## Reglas de esta carpeta

1. **Cada cambio al sistema se registra en `CHANGELOG.md`.** Fecha, qué, por qué.
2. **Cada decisión no obvia va en `decisiones/`**, incluyendo las opciones que se
   descartaron y la razón. Lo descartado importa tanto como lo elegido.
3. **Si el código contradice a esta documentación, gana el código** — pero
   entonces la documentación está desactualizada y hay que corregirla.

## Estado

Lo documentado aquí describe **2.° de secundaria, Unidad 4**. Las mejoras
introducidas en julio de 2026 (generación automática del reporte, liberación
diferida, respaldo en PDF) están pensadas para extenderse después a 1S, 3S, 4S,
5S y 6P, pero **todavía no se han aplicado a esos grados**.
