# IA local agéntica de Jorge Luis

> Manual técnico, inventario y documento de continuidad.
> Estado verificado: **24 de julio de 2026 (America/Lima)**.
> Alcance: instalación local, servicio de inferencia, interfaz web, agente de archivos, red local, seguridad, pruebas, errores resueltos y trabajo pendiente.

## 1. Propósito y regla de continuidad

Este documento permite que otro agente o una persona técnica continúe el proyecto sin reconstruirlo desde la conversación original. La instalación busca:

- ejecutar un modelo de lenguaje local en la RTX 5060 Ti;
- conversar mediante Open WebUI;
- dar al modelo herramientas controladas de archivos y terminal mediante Computer (`cptr`);
- compartir **solo el chat** dentro de la red doméstica;
- añadir más adelante OCR, visión, edición de documentos, Gmail/Drive y acceso remoto privado;
- reutilizar instrucciones estables para automatizaciones repetitivas, incluidos exámenes y reportes, pero únicamente después de validar el agente en espacios aislados.

### Restricción crítica

Durante la fase actual, el agente solo trabaja en:

`C:\Users\jorfe\IA-Local\espacios\pruebas-oficina`

No debe acceder a exámenes, repositorios, documentos personales ni credenciales sin una autorización explícita y un espacio de trabajo separado. **Este manual no modifica ningún examen.**

## 2. Estado verificado

| Componente | Estado | Dirección | Exposición |
|---|---|---|---|
| `llama.cpp` / `llama-server` | Operativo | `http://127.0.0.1:8080/v1` | Solo esta PC |
| Open WebUI | Operativo | `http://127.0.0.1:3000` | Esta PC y red local autorizada |
| Computer (`cptr`) | Operativo | `http://127.0.0.1:8000` | Solo esta PC |
| Qwen3.5 9B Q4_K_M | Cargado | alias `qwen9b` | A través de `llama-server` |
| Micrófono / dictado | Pendiente | botón visible, STT no configurado | No validado |
| OCR y visión | Pendiente | — | No instalados como herramientas |
| Tailscale | Planificado | — | No implementado |

La prueba de estado mostró los tres servicios activos. Los procesos hijos escuchaban exactamente en:

- `127.0.0.1:8080` — modelo;
- `127.0.0.1:8000` — agente;
- `0.0.0.0:3000` — interfaz web.

## 3. Arquitectura

```text
Teléfono o PC de la red local
            |
            | HTTP, puerto 3000 (solo subred 192.168.0.0/24)
            v
      Open WebUI 0.10.1
            |
            | API compatible con OpenAI, solo localhost
            v
 llama-server / Qwen3.5 9B
   127.0.0.1:8080/v1

En la PC principal, de forma separada:

Navegador -> Computer 0.9.15 -> herramientas de archivos/terminal
             127.0.0.1:8000        |
                                      v
                           pruebas-oficina (espacio aislado)
```

Open WebUI sirve para conversar. `llama-server` realiza la inferencia. Computer es la capa agéntica: expone herramientas y limita el directorio de trabajo. El modelo por sí solo no mueve archivos, no abre documentos y no hace OCR; esas capacidades proceden de las herramientas.

## 4. Inventario de hardware y software

### Hardware comprobado

- GPU: NVIDIA GeForce RTX 5060 Ti.
- VRAM informada: 16 311 MiB.
- Controlador NVIDIA: 610.74.
- El equipo está pensado para permanecer encendido y servir el chat en la red local.

### Software comprobado

- `llama.cpp`: compilación `10098 (0278d8362)`, Clang 20.1.8, Windows x86_64, CUDA.
- Open WebUI: 0.10.1.
- Computer / `cptr`: 0.9.15.
- Python de gestión: CPython 3.11.15 administrado por `uv`.
- Modelo principal: Qwen3.5 9B, cuantización Q4_K_M, archivo aproximado de 5.24 GiB.

### Modelos registrados

| Alias | Modelo | Perfil actual |
|---|---|---|
| `qwen9b` | Qwen3.5 9B Q4_K_M | Predeterminado y equilibrado |
| `gemma4e4b` | Gemma 4 E4B Q4_K_M | Ligero, para tareas simples |
| `gemma26b` | Gemma 4 26B A4B QAT Q4_0 | Más capaz; requiere prueba de memoria y velocidad |

## 5. Rutas principales

### Núcleo operativo

`C:\Users\jorfe\IA-Local`

```text
IA-Local\
├─ configuracion.json          parámetros del servidor y catálogo de modelos
├─ servidor_local.py           inicia/detiene/verifica llama-server
├─ interfaz_web.py             inicia/detiene/verifica Open WebUI
├─ agente_local.py             inicia/detiene/verifica Computer
├─ INICIAR_TODO.cmd            arranque diario de los tres componentes
├─ INICIAR_TODO_SILENCIOSO.vbs arranque diario sin ventanas CMD visibles
├─ DETENER_TODO.cmd            apagado ordenado
├─ ESTADO_TODO.cmd             diagnóstico de los tres componentes
├─ INICIAR_*.cmd               arranque individual
├─ DETENER_*.cmd               apagado individual
├─ ESTADO_*.cmd                estado individual
├─ AUTORIZAR_RED_LOCAL.cmd     elevación administrativa para configurar la LAN
├─ CONFIGURAR_LAN.ps1          perfil de red y firewall
├─ PROBAR_IA_LOCAL.cmd         prueba del servidor local
├─ .webui_secret_key           secreto privado de Open WebUI; no publicar
├─ datos-open-webui\           base de datos y estado de Open WebUI
├─ datos-cptr\                 base, auditoría y configuración de Computer
└─ espacios\pruebas-oficina\  espacio seguro de validación
```

### Ejecutables y modelo

- `llama-server.exe`: `C:\Users\jorfe\llama.cpp-cuda\llama-server.exe`
- `cptr.exe`: `C:\Users\jorfe\.local\bin\cptr.exe`
- `open-webui.exe`: `C:\Users\jorfe\.local\bin\open-webui.exe`
- Qwen GGUF: `C:\Users\jorfe\.lmstudio\models\lmstudio-community\Qwen3.5-9B-GGUF\Qwen3.5-9B-Q4_K_M.gguf`
- Estado y logs: `%LOCALAPPDATA%\IA-Local\runtime`

### Espacio de prueba

```text
pruebas-oficina\
├─ .cptr\system.md        instrucciones permanentes del agente
├─ .cptr\chats\           conversaciones del espacio
├─ .cptr\memory\          memoria local del espacio
├─ .cptr\task_logs\       resultados de tareas de terminal
├─ LEEME.md                alcance de la prueba
├─ bandeja_prueba\         archivos ficticios de entrada
├─ documentos\            salida para TXT
├─ datos\                  salida para CSV
└─ notas\                  salida para MD
```

## 6. Función de cada archivo operativo

### `configuracion.json`

Define ruta de `llama-server`, host, puerto, contexto, capas GPU, alias predeterminado y rutas de modelos. La configuración verificada es conceptualmente:

```json
{
  "llamaServer": "C:\\...\\llama-server.exe",
  "host": "127.0.0.1",
  "port": 8080,
  "contextSize": 16384,
  "gpuLayers": 99,
  "apiKey": "<CLAVE_LOCAL>",
  "defaultModel": "qwen9b"
}
```

La clave real no se incluye aquí. Actualmente existe una clave local en el archivo; una mejora futura es leerla solo desde una variable de entorno o un almacén de secretos.

### `servidor_local.py`

Lee `configuracion.json`, valida el ejecutable y el GGUF, inicia el modelo sin ventana visible y guarda PID/logs. Construye el equivalente de:

```powershell
llama-server.exe `
  -m "<MODELO.gguf>" `
  -ngl 99 `
  -c 16384 `
  --host 127.0.0.1 `
  --port 8080 `
  --api-key "<CLAVE_LOCAL>" `
  --alias qwen9b
```

`-ngl 99` intenta descargar a la GPU todas las capas posibles. `-c 16384` fija el contexto en 16 384 tokens.

### `interfaz_web.py`

Inicia Open WebUI en `0.0.0.0:3000`, desactiva Ollama y conecta la API OpenAI-compatible de `llama-server`. Usa un directorio de datos independiente y el nombre “IA Local de Jorge Luis”.

Variables importantes:

```text
DATA_DIR=C:\Users\jorfe\IA-Local\datos-open-webui
ENABLE_OLLAMA_API=False
ENABLE_OPENAI_API=True
OPENAI_API_BASE_URL=http://127.0.0.1:8080/v1
OPENAI_API_KEY=<CLAVE_LOCAL>
DEFAULT_LOCALE=es
```

### `agente_local.py`

Inicia Computer en `127.0.0.1:8000`, con el directorio inicial `pruebas-oficina`. La variable añadida durante la corrección más reciente es:

```text
CPTR_EXECUTE_TIMEOUT=30
```

Esto hace que un comando corto espere hasta 30 segundos y entregue al modelo el resultado final. Un comando más largo puede seguir en segundo plano y debe consultarse con `check_task`.

### Archivos CMD

Son accesos directos ejecutables para no tener que escribir comandos. Ejecutan los gestores Python con la versión de Python instalada por `uv`. Los servicios se lanzan separados de la ventana, de modo que cerrar un CMD después del arranque no debería detenerlos.

### `.cptr\system.md`

Es la instrucción permanente del agente en ese espacio. Establece que Windows usa `cmd.exe`, prohíbe comandos Linux, limita el acceso, exige revisar códigos de salida y obliga a consultar tareas que sigan ejecutándose.

## 7. Instalación y reconstrucción reproducible

> Nota de trazabilidad: el historial íntegro de cada comando interactivo original no se conservó como un registro inmutable. Los comandos siguientes son la reconstrucción canónica basada en los ejecutables, versiones, rutas y scripts que están funcionando. Los comandos exactos de las correcciones recientes sí aparecen en la sección de incidencias.

### 7.1 Requisitos

1. Windows 11 actualizado.
2. Controlador NVIDIA compatible con la RTX 5060 Ti.
3. `uv` instalado y disponible.
4. Binarios CUDA de `llama.cpp` descomprimidos en `C:\Users\jorfe\llama.cpp-cuda`.
5. Modelos GGUF descargados en la biblioteca local indicada.

Comprobaciones:

```powershell
nvidia-smi
& "C:\Users\jorfe\llama.cpp-cuda\llama-server.exe" --version
Get-Item "C:\Users\jorfe\.lmstudio\models\lmstudio-community\Qwen3.5-9B-GGUF\Qwen3.5-9B-Q4_K_M.gguf"
```

### 7.2 Instalar las interfaces Python

Comandos reproducibles equivalentes:

```powershell
uv tool install open-webui
uv tool install cptr
uv tool list
```

La verificación actual de `uv tool list` devuelve `open-webui v0.10.1` y `cptr v0.9.15`.

### 7.3 Crear el núcleo operativo

Crear `C:\Users\jorfe\IA-Local`, colocar los tres gestores Python, los accesos CMD y `configuracion.json`. No copiar claves en documentación, chats ni repositorios públicos.

### 7.4 Configurar Computer

En Computer, crear una conexión:

- proveedor: OpenAI;
- tipo de API: Chat Completions;
- URL base: `http://127.0.0.1:8080/v1`;
- clave: la misma clave local del servidor;
- modelo: `qwen9b`, o detección automática si está disponible.

Crear el espacio `pruebas-oficina` y añadir `.cptr\system.md` antes de otorgar acceso a carpetas reales.

### 7.5 Arrancar y comprobar

Uso recomendado:

```powershell
& "C:\Users\jorfe\IA-Local\INICIAR_TODO.cmd"
& "C:\Users\jorfe\IA-Local\ESTADO_TODO.cmd"
```

Comprobación de puertos:

```powershell
Get-NetTCPConnection -State Listen |
  Where-Object LocalPort -in 3000,8000,8080 |
  Format-Table LocalAddress,LocalPort,OwningProcess
```

Detener:

```powershell
& "C:\Users\jorfe\IA-Local\DETENER_TODO.cmd"
```

## 8. Uso diario

1. Ejecutar `INICIAR_TODO_SILENCIOSO.vbs` para un arranque sin ventanas CMD. Usar `INICIAR_TODO.cmd` solo cuando se necesite observar el diagnóstico.
2. Esperar el mensaje “IA local, interfaz y agente listos”.
3. Chat: abrir `http://127.0.0.1:3000`.
4. Agente: abrir `http://127.0.0.1:8000`.
5. Antes de una tarea importante, ejecutar `ESTADO_TODO.cmd`.
6. Al terminar, ejecutar `DETENER_TODO.cmd`.

Si se reinicia Windows, los servicios no se inician solos. Debe ejecutarse `INICIAR_TODO_SILENCIOSO.vbs`, salvo que más adelante se cree una tarea programada.

## 9. Red local

La interfaz Ethernet se configuró como red **Privada**. Esto no bloquea una futura conexión por Tailscale.

Regla de firewall verificada:

- nombre: `IA Local - Open WebUI LAN`;
- entrada TCP;
- puerto local 3000;
- perfil Private;
- remoto permitido: `192.168.0.0/24`;
- puertos 8000 y 8080 no expuestos.

El script `CONFIGURAR_LAN.ps1` valida antes que la interfaz sea `Ethernet`, esté activa y pertenezca a `192.168.0.0/24`. Luego aplica el perfil privado y recrea la regla de firewall.

Acceso verificado/esperado desde otro equipo de la casa:

`http://192.168.0.211:3000`

La IP puede cambiar por DHCP. Consultar la dirección actual con:

```powershell
ipconfig
```

No se debe abrir el puerto 3000 en el router. Para acceso externo se planifica Tailscale.

## 10. Incidencias y soluciones

### 10.1 Contexto insuficiente: 4096 tokens

**Síntoma:** Open WebUI mostró `request (5771 tokens) exceeds the available context size (4096 tokens)`.

**Causa:** el prompt del agente, herramientas e historial superaban el contexto de 4096.

**Solución:** aumentar `contextSize` a `16384` y reiniciar `llama-server`.

### 10.2 “Failed to fetch” tras cerrar ventanas CMD

**Síntoma:** Computer no podía abrir el espacio o la interfaz no encontraba el backend.

**Diagnóstico:** alguno de los servicios había dejado de estar disponible después de cerrar procesos/ventanas anteriores.

**Solución:** ejecutar `INICIAR_TODO.cmd`, confirmar con `ESTADO_TODO.cmd` y recargar el navegador. Los gestores actuales usan procesos separados y logs/PID, por lo que no dependen de mantener una ventana CMD abierta.

### 10.3 El modelo usó `mv`

**Síntoma:** intentó mover archivos con un comando Linux que no existe en `cmd.exe`.

**Solución:** se añadió a `.cptr\system.md` la instrucción explícita de usar `move`, `copy`, `dir`, `mkdir` y barras invertidas. PowerShell debe invocarse expresamente cuando sea necesario.

### 10.4 El modelo usó barras `/`

**Síntoma:** incluso después de cambiar a `move`, construyó rutas como `bandeja_prueba/documento1.txt`.

**Solución:** reforzar rutas Windows con `\` en las instrucciones.

Comando que terminó correctamente la prueba:

```cmd
move "bandeja_prueba\*.txt" "documentos\" && move "bandeja_prueba\*.csv" "datos\" && move "bandeja_prueba\*.md" "notas\" && dir /s /b
```

Resultado comprobado:

- `documentos\documento1.txt`, `documentos\documento2.txt`;
- `datos\datos_registro1.csv`, `datos\datos_registro2.csv`;
- `notas\nota1.md`, `notas\nota2.md`.

### 10.5 El comando funcionó, pero no hubo mensaje final

**Síntoma:** Computer mostraba la ejecución, movía los archivos, pero el modelo terminaba el turno sin decir “trabajo realizado”.

**Causa:** `run_command` devolvía `Task <id>: running`. El modelo interpretaba la llamada como suficiente y no consultaba la tarea hasta obtener el código de salida.

**Corrección aplicada:** dos capas complementarias:

1. `agente_local.py`: `CPTR_EXECUTE_TIMEOUT=30`.
2. `.cptr\system.md`: si una tarea sigue `running`, llamar a `check_task` con espera de 30 segundos hasta obtener `exited (code ...)` o un error, y después entregar siempre un mensaje final.

Prueba técnica posterior:

```text
run_command("dir /b") -> Task ce673a93: exited (code 0)
```

Esto confirma que los comandos breves ya devuelven el resultado definitivo. Se debe repetir una prueba conversacional completa después de cada actualización de Computer o del modelo.

### 10.6 El nombre de archivo parece enlace pero no abre

Computer puede presentar un nombre con apariencia de enlace sin implementar navegación directa al archivo local. No implica que el archivo falte. Verificarlo en el panel del espacio o con `dir`. La instrucción permanente pide mencionar archivos entre comillas invertidas y no inventar URL.

### 10.7 Micrófono visible pero dictado sin funcionar

El botón no garantiza que exista reconocimiento de voz. Falta:

1. verificar permiso de micrófono del navegador;
2. decidir si se usa Web Speech del navegador o STT completamente local;
3. instalar/configurar Whisper o `faster-whisper` si se exige privacidad local;
4. conectar Open WebUI al proveedor STT;
5. medir latencia y probar español e inglés.

No declarar el micrófono operativo hasta completar una prueba de grabación, transcripción y envío.

## 11. Seguridad

- No publicar `.webui_secret_key`, `datos-cptr\config.toml`, bases de datos, cookies, tokens ni claves API.
- El repositorio público solo contiene marcadores como `<CLAVE_LOCAL>`.
- Mantener 8080 y 8000 en localhost.
- No usar red “Pública” para la regla doméstica.
- Crear espacios separados por proyecto y otorgar solo las carpetas necesarias.
- Pedir confirmación antes de borrar, sobrescribir, enviar correos, publicar o desplegar.
- Respaldar `IA-Local` excluyendo secretos si el respaldo va a la nube.
- No usar reenvío de puertos del router para acceso remoto.

## 12. Formatos y conceptos

| Término | Significado práctico |
|---|---|
| GGUF | Archivo empaquetado y cuantizado del modelo para `llama.cpp` |
| Q4_K_M | Cuantización de 4 bits: menos memoria a cambio de algo de precisión |
| JSON | Configuración estructurada con claves y valores |
| JSONL | Un objeto JSON por línea; útil para auditoría y registros |
| TOML | Formato de configuración legible usado por varias herramientas |
| SQLite / DB | Base de datos local en un solo archivo |
| WAL / SHM | Archivos auxiliares temporales de SQLite; no borrar con el servicio activo |
| PY | Script Python que administra procesos y comprobaciones |
| CMD | Guion de comandos de Windows para uso con doble clic |
| PS1 | Script de PowerShell; aquí se usa para red y firewall |
| MD | Markdown: texto con títulos, listas, tablas y enlaces |
| CSV | Tabla de texto separada por comas |
| DOCX | Documento Word editable |
| XLSX | Libro de Excel |
| PPTX | Presentación PowerPoint |
| API | Interfaz mediante la que dos programas se comunican |
| localhost / 127.0.0.1 | Solo la propia computadora |
| 0.0.0.0 | Escuchar en todas las interfaces de red de la PC |
| Puerto | Número que identifica un servicio: 3000, 8000 o 8080 |
| Contexto | Cantidad de tokens que el modelo puede considerar en una petición |
| STT | Speech-to-text: voz a texto |
| OCR | Reconocimiento de texto dentro de imágenes o escaneos |

## 13. Pruebas mínimas antes de ampliar permisos

### Arranque

- [ ] `INICIAR_TODO.cmd` finaliza sin error.
- [ ] `ESTADO_TODO.cmd` muestra modelo, interfaz y agente activos.
- [ ] Los puertos respetan 3000=`0.0.0.0`, 8000/8080=`127.0.0.1`.

### Agente de archivos

- [ ] Crear archivos ficticios en `pruebas-oficina`.
- [ ] Leer y resumir sin alterar.
- [ ] Organizar TXT/CSV/MD.
- [ ] Verificar rutas finales.
- [ ] Emitir mensaje final después del código 0.
- [ ] Informar y corregir un comando deliberadamente inválido.
- [ ] Rechazar el acceso fuera del espacio sin autorización.

### Red

- [ ] Abrir Open WebUI desde otro equipo de la misma red.
- [ ] Confirmar que `http://<IP>:8000` y `:8080` no están expuestos.
- [ ] Probar cuentas y privacidad entre usuarios antes de uso compartido real.

### Persistencia

- [ ] Reiniciar Windows.
- [ ] Arrancar de nuevo con `INICIAR_TODO.cmd`.
- [ ] Confirmar que usuarios, chats y espacios siguen disponibles.

## 14. Capacidades pendientes y plan recomendado

### Fase A — Oficina segura

Agregar herramientas con carpetas de prueba y casos pequeños:

- DOCX: `python-docx`;
- XLSX/CSV: `openpyxl` y `pandas`;
- PPTX: `python-pptx`;
- PDF: PyMuPDF o `pdfplumber`;
- imágenes: Pillow y OpenCV.

Cada herramienta debe incluir lectura, escritura en copia, validación posterior y prohibición de sobrescribir el original sin confirmación.

### Fase B — OCR y reconocimiento visual

- OCR local: evaluar Tesseract, PaddleOCR o Surya.
- Visión general: añadir un modelo multimodal compatible y, si el formato GGUF lo requiere, su archivo `mmproj`.
- Clasificación de animales, autos y objetos: diseñar pruebas con imágenes etiquetadas.
- Reconocimiento facial: solo local, voluntario y con consentimiento; separar las plantillas biométricas y cifrar su almacenamiento.

Qwen de texto no adquiere visión por instrucciones. Requiere un modelo multimodal o una herramienta de visión.

### Fase C — Gmail y Google Drive

Requiere OAuth, permisos mínimos y una política de acciones:

- lectura/búsqueda primero;
- borradores antes de enviar;
- confirmación humana para enviar, borrar, mover o compartir;
- registro de auditoría;
- tokens fuera de repositorios.

### Fase D — Acceso remoto privado

Implementar Tailscale cuando la operación local sea estable:

1. instalar Tailscale en servidor y dispositivos autorizados;
2. autenticar bajo la cuenta privada;
3. publicar Open WebUI solo dentro de la tailnet;
4. mantener autenticación de Open WebUI;
5. no exponer 8000/8080 directamente;
6. evitar port forwarding del router.

### Fase E — Imágenes generativas

Instalar un servidor especializado, por ejemplo ComfyUI con un modelo Stable Diffusion o FLUX compatible con la VRAM. Integrarlo como herramienta del agente. Es un componente separado; `llama.cpp` con Qwen no genera imágenes por sí solo.

### Fase F — Automatización de exámenes y reportes

Solo después de aprobar las fases anteriores:

1. copiar una plantilla y su documentación a un espacio aislado;
2. trabajar en un Git worktree limpio;
3. generar únicamente archivos de una instancia nueva;
4. ejecutar validadores HTML/JS/Apps Script;
5. mostrar diferencias antes de commit;
6. exigir autorización humana para OAuth, Apps Script, Sheets y publicación;
7. nunca reutilizar IDs, endpoints o hojas de otro grado;
8. mantener pruebas y manuales actualizados.

La IA local puede imitar flujos bien documentados, pero será más lenta y menos fiable que un agente de frontera en navegador, autenticación y recuperación de errores. Debe operar por etapas con controles, no con acceso irrestricto.

### Fase G — Tutor conversacional de idiomas

Crear un servicio separado con agenda, memoria de progreso y recordatorios. Primero definir plan pedagógico, límites de insistencia, privacidad de audio y modo de pausa. El chat principal no debe asumir este rol sin una política explícita.

## 15. Instrucciones para el agente que continúe

1. Leer este documento y `C:\Users\jorfe\IA-Local\README.md`.
2. Ejecutar `ESTADO_TODO.cmd` antes de cambiar nada.
3. Trabajar solo en `C:\Users\jorfe\IA-Local` y `pruebas-oficina`, salvo nueva autorización.
4. No tocar exámenes ni el repositorio educativo durante las pruebas del agente local.
5. No mostrar ni copiar secretos en informes.
6. Hacer un cambio por vez y probarlo.
7. Registrar el problema, diagnóstico, cambio, prueba y resultado.
8. Mantener 8000/8080 en localhost y 3000 limitado por firewall.
9. Prioridad inmediata: verificar la confirmación final, luego configurar el micrófono; después herramientas de oficina y OCR.
10. Actualizar este manual y la Wiki después de cada modificación material.

## 16. Comandos de diagnóstico

```powershell
# GPU
nvidia-smi

# Versiones instaladas por uv
uv tool list

# Estado completo
& "C:\Users\jorfe\IA-Local\ESTADO_TODO.cmd"

# Puertos
Get-NetTCPConnection -State Listen |
  Where-Object LocalPort -in 3000,8000,8080

# Perfil de red
Get-NetConnectionProfile

# Regla de firewall
Get-NetFirewallRule -DisplayName "IA Local - Open WebUI LAN" |
  Format-List DisplayName,Enabled,Profile,Direction,Action

# Logs
Get-ChildItem "$env:LOCALAPPDATA\IA-Local\runtime"
Get-Content "$env:LOCALAPPDATA\IA-Local\runtime\servidor.err.log" -Tail 100
Get-Content "$env:LOCALAPPDATA\IA-Local\runtime\interfaz.err.log" -Tail 100
Get-Content "$env:LOCALAPPDATA\IA-Local\runtime\agente.err.log" -Tail 100
```

## 17. Criterio de “operativo”

El sistema base está operativo cuando el modelo, la interfaz y Computer arrancan, responden y preservan el aislamiento. No se consideran todavía operativos el micrófono, OCR, visión, edición completa de Office, Gmail/Drive, Tailscale, generación de imágenes ni automatización de exámenes. Cada capacidad se declarará lista solo después de una prueba reproducible y documentada.
