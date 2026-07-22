# Generación de exámenes y reportes con un agente

**Documento operativo para Codex, Claude Code o un agente local.** Describe el
procedimiento reproducible para crear un examen nuevo meses después, sin depender
del contexto de un chat anterior.

Este documento no autoriza al agente a cambiar la pedagogía. La matriz aprobada
y el manifiesto de imágenes son datos de entrada inmutables. El agente implementa,
valida y publica; el docente decide las preguntas, respuestas esperadas, puntajes
y criterios de revisión.

## 1. Qué recibe el agente

El trabajo solo puede comenzar cuando existen estos dos insumos:

1. **Matriz definitiva de 12 preguntas**, con tipo, enunciado, opciones o campos,
   respuesta correcta o ideal, pista, puntaje y método `automatic`, `mixed` o
   `teacher`.
2. **Manifiesto de imágenes**, con un identificador estable, URL pública, texto
   alternativo y pie opcional para cada imagen.

El manifiesto general agrega:

- grado, unidad, título, versión y fecha;
- color o tema visual del grado;
- dominio institucional;
- escala de logro;
- reparto automático/docente;
- nombres de los archivos de salida.

Formato recomendado para que un agente local no tenga que interpretar prosa:

```yaml
grade: 3S
unit: U4
title: "Título aprobado"
version: "2026-08-01-R1"
date: "2026-08-01"
exam_id: "3S-U4-C2-OFICIAL-2026"
school_domain: "colegiomilagrosdedios.edu.pe"
theme: "color definido para el grado"
scoring:
  total: 20
  automatic_max: 14
  teacher_max: 6
  scale: { AD: "17-20", A: "12-16.99", B: "0-11.99" }
files:
  exam_html: "3S_U4_examen_C2.html"
  config_js: "3S_U4_examen_configuracion.js"
  apps_script: "3S_U4_examen_apps_script.gs"
  report_html: "3S_U4_reporte_C2.html"
  guide_html: "Guion_3S.html"
google:
  spreadsheet_id: "PENDIENTE_HASTA_CREAR"
  apps_script_project_id: "PENDIENTE_HASTA_CREAR"
  endpoint_exec: "PENDIENTE_HASTA_DESPLEGAR"
  oauth_client_id: "PENDIENTE_HASTA_CONFIGURAR"
images:
  imagen_a:
    src: "https://..."
    alt: "Descripción accesible aprobada"
    caption: "Pie opcional"
```

La matriz puede adjuntarse como tabla o JSON, pero cada fila debe conservar su
identificador, tipo, contenido, enunciado, opciones, respuesta, pista, puntaje,
método y referencia de imagen.

No inventar información ausente. Si falta un dato técnico reversible puede
usarse un marcador explícito. Si falta una decisión pedagógica, detenerse y
pedirla al docente.

## 2. Fuentes de verdad, en este orden

Cuando dos archivos se contradicen, usar esta jerarquía:

1. matriz y manifiesto aprobados para el examen nuevo;
2. `plantillas/examen_html/` para la arquitectura fija;
3. configuración específica del examen;
4. HTML y Apps Script generados;
5. Google Sheets, deployment `/exec` y cliente OAuth realmente activos;
6. esta documentación y los chats anteriores.

La configuración debe ser la única fuente de datos variables. No duplicar una
respuesta correcta en varios archivos si puede leerse desde la configuración.

## 3. Límites que el agente no puede cruzar

- No rediseñar, simplificar, reemplazar ni «mejorar» preguntas aprobadas.
- No cambiar el equilibrio de formatos salvo orden expresa del docente.
- No copiar un examen de otro grado como nueva arquitectura. Usar la plantilla.
- No reutilizar el `EXAM_ID`, Spreadsheet ID, proyecto Apps Script, endpoint ni
  cliente OAuth de otro examen.
- No modificar ni vaciar hojas de un examen ya rendido.
- No ejecutar funciones con `clearContents()` o reconstrucción masiva sobre un
  libro con respuestas sin inspeccionar primero su código y alcance.
- No publicar claves o secretos OAuth. El Client ID público no es un secreto;
  un Client Secret sí lo es.
- No afirmar que una autorización, despliegue o prueba real terminó si no existe
  evidencia verificable.

## 4. Flujo completo

### Etapa A — auditoría de entrada

1. Ejecutar `git status`, `git worktree list` y `git fetch origin`.
2. Leer `origin/master`; no asumir que el worktree actual contiene lo último.
3. Si hay cambios locales de otra persona, crear un worktree o rama aislada. No
   descartarlos, sobrescribirlos ni incluirlos en el commit.
4. Localizar la plantilla, el guion del grado y los archivos oficiales del grado.
5. Usar exámenes anteriores solo como referencias de solo lectura.
6. Validar que haya exactamente 12 IDs únicos (`q1` a `q12`), que los puntajes
   sumen lo declarado y que toda `imageKey` exista en el manifiesto.

### Etapa B — instancia local

1. Copiar, sin reconstruir, los archivos de `plantillas/examen_html/` a nombres
   independientes para el nuevo examen.
2. Completar la configuración con la matriz exacta y el manifiesto.
3. Generar un `EXAM_ID` legible y exclusivo, por ejemplo
   `3S-U4-C2-OFICIAL-2026`.
4. Mantener el examen bloqueado hasta que Google verifique una cuenta del dominio
   `colegiomilagrosdedios.edu.pe`.
5. Conservar la verificación del token también en Apps Script. La validación del
   navegador es solo informativa y nunca sustituye al servidor.
6. Conservar idempotencia: un `submissionId` estable por intento, bloqueo del
   servidor y búsqueda previa antes de escribir.
7. Mostrar éxito únicamente después de confirmar en el servidor que la fila
   existe.
8. Mantener borrador local y copia imprimible/PDF de emergencia cuando estén
   disponibles en la versión base.

### Etapa C — Google independiente

Crear para cada examen:

- un Google Sheets exclusivo;
- un proyecto Apps Script exclusivo;
- un deployment web `/exec` exclusivo;
- un cliente OAuth web propio o expresamente asignado al examen.

El libro debe preparar estas pestañas:

- `Respuestas oficial`;
- `Clave oficial`;
- `Calificación oficial`;
- `Control`;
- `Reportes`.

Antes de ejecutar una función `setup`, leerla. En un libro nuevo debe crear o
reparar encabezados. En un libro con datos nunca debe borrar respuestas,
calificaciones o reportes existentes.

Cuando Google muestre una autorización, el agente debe detenerse exactamente en
esa pantalla y pedir al usuario que la conceda. Después puede continuar y
verificar el resultado. Una autorización del usuario no permite fingir un clic
que no ocurrió.

### Etapa D — despliegue y conexión

1. Guardar el Apps Script no publica el servicio.
2. Para actualizar un endpoint existente usar **Administrar implementaciones →
   editar → versión nueva**. No crear otro deployment si el HTML ya apunta al
   actual.
3. Copiar el `/exec` real a la configuración del HTML y comprobar coincidencia
   exacta con el proyecto del mismo grado.
4. Registrar el origen HTTPS de GitHub Pages en el cliente OAuth.
5. Añadir enlaces del examen y del reporte al `Guion_[GRADO].html` sin eliminar
   enlaces existentes.

### Etapa E — reporte

Al enviar, el orden seguro es:

```text
verificar identidad → guardar respuestas → flush
                    → intentar crear reporte dentro de try/catch
                    → confirmar el envío
```

Un fallo del reporte nunca debe hacer perder la respuesta. La fila de `Reportes`
nace con `liberado = NO`. El docente puede verla, editar puntajes y comentarios
de las preguntas habilitadas por el reporte —o de todas, si así lo exige el
manifiesto— y liberarla mediante una acción explícita. El alumnado
solo puede consultar su propio correo y únicamente cuando el reporte está
liberado. Solo los correos administradores pueden listar o editar a otros
estudiantes.

La corrección objetiva debe ser determinista y proporcional por componente. En
selección múltiple, cada opción correcta marcada suma su fracción y una opción
incorrecta no resta, salvo que la matriz declare otra regla. Las respuestas
abiertas o mixtas conservan la rúbrica y revisión docente.

La escala vigente se toma de la configuración del examen. No asumir siempre
20 puntos ni un reparto 14/6: 3S U4, por ejemplo, usa 24 puntos y reparto 16/8.

## 5. Arquitectura fija que debe sobrevivir

- interfaz responsiva en tablet vertical y horizontal;
- acceso real con Google y mensaje de estado de sesión;
- dominio institucional validado en cliente y servidor;
- token verificado en Apps Script;
- formulario bloqueado antes del login;
- contador de preguntas completadas;
- pistas desplegables;
- validación de al menos un carácter en campos escritos;
- prevención de duplicados;
- confirmación real del servidor;
- calificación automática, mixta y docente;
- reportes privados con modo administrador;
- escala `AD`, `A`, `B`, sin `C`;
- advertencia al cerrar mientras hay respuestas no enviadas;
- respaldo local/PDF para pérdida de red o expiración del token.

### Contador de salidas

La versión de producción actual registra cambios de visibilidad y, cuando se
requiere detectar una ventana superpuesta, también `window.blur`. Ambos caminos
deben compartir un único bloqueo antirrebote para que una acción nunca sume dos
veces. No usar `focusout` ni `pagehide`.

Debe cumplir:

- login y regreso: 0;
- primera salida y regreso: 1;
- segunda salida y regreso: 2;
- giro de tablet: no aumenta;
- durante o después del envío: no aumenta.

Si un examen concreto exige **solo** `visibilitychange`, esa condición de su
manifiesto prevalece y se elimina el listener de `blur`.

## 6. Pruebas obligatorias antes de publicar

### Estáticas

- no quedan marcadores `__...__`, `[COMPLETAR]` ni endpoints de otro grado;
- 12 preguntas, IDs únicos y puntaje total correcto;
- métodos y máximos automático/docente coinciden con la matriz;
- respuestas ideales, explicaciones, puntajes y métodos están presentes;
- cada imagen responde, carga y tiene texto alternativo;
- sintaxis JavaScript válida en configuración, HTML y Apps Script;
- `git diff --check` sin errores.

### Funcionales locales

- las 12 preguntas se pueden completar;
- cada campo y valor enviado coincide con lo que lee Apps Script;
- tablet vertical y horizontal;
- contador de salidas con los cinco casos anteriores;
- aviso de cierre antes del envío;
- reintento conserva el mismo `submissionId`.

### Integración HTTPS

- login institucional correcto;
- rechazo de cuenta externa;
- token vencido rechazado con mensaje recuperable y posibilidad de volver a
  iniciar sesión sin perder respuestas;
- envío crea una sola fila en el Sheets correcto;
- confirmación solo después de verificar esa fila;
- reporte se crea con `liberado = NO`;
- cuenta administradora lista y edita; estudiante solo ve su propio reporte;
- actualización docente persiste en Sheets y reaparece al recargar;
- liberación hace visible el reporte al estudiante.

## 7. Lecciones verificadas en 3S

1. **Extensiones → Apps Script puede abrir un proyecto vinculado vacío que no es
   el backend activo.** En 3S el proyecto real es independiente. Verificar el
   Project ID y el endpoint, no el lugar desde donde se abrió el editor.
2. **Guardar respuestas no demuestra que el reporte funciona.** En 3S la fila de
   respuestas existía, pero un encabezado incompatible en `Reportes` impedía
   generar el JSON. Probar ambos resultados por separado.
3. **El esquema de `Reportes` es parte de la API.** Los encabezados, su orden y el
   JSON deben coincidir con el generador y el HTML del reporte.
4. **La señal de vida debe probar la versión nueva.** Un endpoint genérico puede
   contestar aunque falte el código buscado. Cada backend debe exponer un health
   check que devuelva `EXAM_ID`, máximo y preguntas docentes.
5. **Las preguntas habilitadas para revisión manual en 3S U4 son 2, 6, 7, 8, 9,
   11 y 12.** Q7 y Q11 son mixtas y editables, aunque su punto completo se
   calcula automáticamente. El health check es la referencia operativa.

Inventario 3S U4 verificado el 22 de julio de 2026:

| Elemento | Valor |
|---|---|
| EXAM_ID | `3S-U4-C2-OFICIAL-2026` |
| Spreadsheet ID | `1bkNqkOtCfLmn_icVFPsgZVO8tUHJUFrAZy_-SIgxkfc` |
| Apps Script Project ID | `1Q6L5qhgDaiJim8FRg1_WnIw_K5f3TKycOyf5UgYVeCBIAqHerl7UyY6u` |
| Deployment | versión 5 |
| Endpoint | `https://script.google.com/macros/s/AKfycbwcu8b674jxWTiw0nvBNd-mHf0u7pRc1QCG-2h_b9RVer8b9wSbcht2RuHpeAm1Ual3sA/exec` |
| Máximo | 24 |
| Automático / docente | 16 / 8 |
| Reportes activos | `Control!REPORTES_ACTIVOS = SI` |

## 8. Qué puede hacer solo un agente local

**Autónomo y verificable:** auditar Git, validar la matriz, generar los archivos,
comprobar sintaxis, ejecutar pruebas locales, comparar IDs, revisar enlaces,
preparar commits y redactar el informe.

**Requiere sesión o confirmación humana:** autorizar Google, crear o elegir
recursos en Drive, desplegar Apps Script, configurar OAuth, publicar a producción
y liberar notas. Un agente con control de navegador puede continuar después de
la confirmación, pero debe dejar evidencia de cada acción.

Con estas reglas y pruebas, un modelo local competente puede realizar la mayor
parte mecánica. El docente sigue siendo responsable de aprobar la matriz, juzgar
respuestas abiertas y autorizar la publicación final.

## 9. Entrega obligatoria

El agente no declara «terminado» sin entregar:

- enlace HTTPS del examen;
- enlace del guion;
- enlace del Google Sheets;
- enlace o Project ID de Apps Script;
- endpoint `/exec`;
- `EXAM_ID` y versión;
- puntajes máximos automático/docente;
- lista de pruebas con resultado y evidencia;
- autorizaciones o verificaciones pendientes;
- commit o PR que contiene exactamente los archivos del trabajo.

El prompt mínimo reutilizable está en
[`plantillas/examen_html/PROMPT_NUEVO_EXAMEN.md`](../plantillas/examen_html/PROMPT_NUEVO_EXAMEN.md).
