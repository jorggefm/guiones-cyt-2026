/**
 * Reporte3S.gs — Reportes del examen 3S U4 C2
 * ===========================================
 * Archivo NUEVO. Se agrega al proyecto de Apps Script de 3.° de secundaria,
 * junto al codigo existente. No reemplaza nada. Todo va prefijado con R3_.
 *
 * Aporta lo que al examen le faltaba: generar la fila del reporte, permitir
 * la calificacion docente y liberar el reporte al alumno.
 *
 * DIFERENCIAS con 2S y 4S (importante):
 *   - La matriz conserva 24 puntos brutos (16 automaticos + 8 docentes),
 *     pero la nota oficial se convierte a 20 (14 automaticos + 6 docentes).
 *   - La escala oficial usa cortes B/A/AD sobre 20.
 *   - Las preguntas y las imagenes salen de 3S_U4_examen_configuracion.js,
 *     asi que aqui NO se duplica ningun dato del examen.
 *
 * Cada pregunta conserva su puntaje bruto para que la revision siga siendo
 * auditable. R3_aplicarEscala20_ calcula los dos subtotales y la nota final.
 *
 * Ver docs/FLUJO-COMPLETO.md
 */

const R3_REPORTS_SHEET = 'Reportes';
const R3_ADMIN_EMAILS = ['jorge.fernandez@colegiomilagrosdedios.edu.pe'];
const R3_FINAL_MAX = 20;
const R3_AUTO_FINAL_MAX = 14;
const R3_TEACHER_FINAL_MAX = 6;

/** Cabecera propia. La ultima columna guarda el reporte completo. */
const R3_HEADERS = ['submissionId', 'correo', 'nombre', 'puntajeFinal', 'maximo',
                    'nivel', 'detallePreguntas', 'comentario', 'liberado', 'reporte_json'];

/* ------------------------------------------------------------------ *
 * AYUDAS
 * ------------------------------------------------------------------ */

function R3_cfg_() {
  validateConfiguration_();          // deja CONFIG cargado
  if (!CONFIG) throw new Error('CONFIG no se cargo. Revisa 3S_U4_examen_configuracion.js');
  return CONFIG;
}

/** Escala oficial comun: B hasta 11.99, A hasta 16.99 y AD desde 17. */
function R3_nivel_(total) {
  const nota = Math.max(0, Math.min(R3_FINAL_MAX, Number(total) || 0));
  if (nota < 12) return 'B';
  if (nota < 17) return 'A';
  return 'AD';
}

/** Una pregunta admite ajuste docente si su metodo no es puramente automatico. */
function R3_esDocente_(q) {
  const m = q.grading && q.grading.method;
  return m === 'mixed' || m === 'teacher';
}

/** Texto legible de lo que respondio el alumno. */
function R3_respuesta_(q, valor) {
  if (valor === null || valor === undefined || valor === '') return '(sin responder)';
  if (Array.isArray(valor)) return valor.join(' · ');
  if (typeof valor === 'object') {
    return Object.keys(valor).map(k => k + ': ' + valor[k]).join(' · ');
  }
  return String(valor);
}

/** Respuesta ideal, tomada de la clave del examen. */
function R3_ideal_(q) {
  const g = q.grading || {};
  if (g.correct !== undefined) {
    return Array.isArray(g.correct) ? g.correct.join(' · ') : String(g.correct);
  }
  if (g.accepted) return g.accepted.join(' / ');
  if (g.rubric) return String(g.rubric);
  return '';
}

function R3_round_(n) { return Math.round(Number(n || 0) * 100) / 100; }

/** Maximos de la matriz original. No cambia preguntas ni respuestas. */
function R3_maximosBrutos_() {
  const cfg = R3_cfg_();
  let automatico = 0, docente = 0, total = 0;
  cfg.questions.forEach(function (q) {
    const puntos = Number(q.points || 0);
    const metodo = q.grading && q.grading.method;
    const auto = metodo === 'automatic' ? puntos
      : metodo === 'mixed' ? Number(q.grading.automaticPoints || 0) : 0;
    total += puntos;
    automatico += auto;
    docente += Math.max(0, puntos - auto);
  });
  return { automatico: automatico, docente: docente, total: total };
}

/**
 * Convierte los puntajes brutos por pregunta a la escala oficial de 20.
 * La parte automatica de cada pregunta se asigna primero hasta su maximo;
 * cualquier resto corresponde a revision docente. Asi ambos subtotales suman
 * exactamente la nota final y nunca exceden 14/6.
 */
function R3_aplicarEscala20_(rep) {
  const cfg = R3_cfg_();
  const maximos = R3_maximosBrutos_();
  let automaticoBruto = 0, docenteBruto = 0, totalBruto = 0;

  (rep.questions || []).forEach(function (pregunta, idx) {
    const q = cfg.questions.find(function (item) { return item.id === pregunta.id; }) || cfg.questions[idx] || {};
    const puntos = Number(q.points || pregunta.pointsMax || 0);
    const metodo = q.grading && q.grading.method;
    const autoMax = metodo === 'automatic' ? puntos
      : metodo === 'mixed' ? Number(q.grading.automaticPoints || 0) : 0;
    const ganado = Math.max(0, Math.min(puntos, Number(pregunta.pointsEarned || 0)));
    const autoGanado = Math.min(autoMax, ganado);
    const docenteGanado = Math.max(0, ganado - autoGanado);
    automaticoBruto += autoGanado;
    docenteBruto += docenteGanado;
    totalBruto += ganado;
  });

  automaticoBruto = R3_round_(automaticoBruto);
  docenteBruto = R3_round_(docenteBruto);
  totalBruto = R3_round_(totalBruto);
  const automatico = maximos.automatico > 0
    ? R3_round_(automaticoBruto * R3_AUTO_FINAL_MAX / maximos.automatico) : 0;
  const docente = maximos.docente > 0
    ? R3_round_(docenteBruto * R3_TEACHER_FINAL_MAX / maximos.docente) : 0;
  const total = R3_round_(Math.min(R3_FINAL_MAX, automatico + docente));

  rep.rawScore = {
    automatic: automaticoBruto, automaticMaximum: maximos.automatico,
    teacher: docenteBruto, teacherMaximum: maximos.docente,
    total: totalBruto, maximum: maximos.total
  };
  rep.score = {
    automatic: automatico, automaticMaximum: R3_AUTO_FINAL_MAX,
    teacher: docente, teacherMaximum: R3_TEACHER_FINAL_MAX,
    total: total, maximum: R3_FINAL_MAX, level: R3_nivel_(total)
  };
  return rep;
}

function R3_hoja_() {
  const hoja = getOrCreateSheet_(R3_REPORTS_SHEET);
  const actual = hoja.getLastColumn() >= R3_HEADERS.length
    ? hoja.getRange(1, 1, 1, R3_HEADERS.length).getDisplayValues()[0] : [];
  if (actual.join('|') !== R3_HEADERS.join('|')) {
    if (hoja.getLastRow() > 1) {
      throw new Error('La hoja Reportes tiene datos con otro formato. Revisar a mano.');
    }
    hoja.clear();
    hoja.getRange(1, 1, 1, R3_HEADERS.length).setValues([R3_HEADERS]);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

/** Fila por submissionId (columna 1). Cada intento conserva la suya. */
function R3_filaPorEnvio_(hoja, submissionId) {
  const last = hoja.getLastRow();
  if (last < 2 || !submissionId) return 0;
  const ids = hoja.getRange(2, 1, last - 1, 1).getDisplayValues();
  const i = ids.findIndex(x => String(x[0] || '').trim() === String(submissionId).trim());
  return i >= 0 ? i + 2 : 0;
}

/** Acepta 'correo' o 'correo::submissionId'. Con solo correo, el mas reciente. */
function R3_fila_(hoja, clave) {
  const txt = String(clave || '').trim().toLowerCase();
  if (txt.indexOf('::') !== -1) return R3_filaPorEnvio_(hoja, txt.split('::')[1]);
  const last = hoja.getLastRow();
  if (last < 2) return 0;
  const correos = hoja.getRange(2, 2, last - 1, 1).getDisplayValues();
  let ultima = 0;
  correos.forEach((x, i) => { if (String(x[0] || '').trim().toLowerCase() === txt) ultima = i + 2; });
  return ultima;
}

/* ------------------------------------------------------------------ *
 * GENERACION
 * ------------------------------------------------------------------ */

/**
 * Construye el reporte de un envio a partir de sus respuestas.
 * Reutiliza automaticPoints_() del examen: la nota del reporte NO puede
 * divergir de la correccion real porque es exactamente la misma funcion.
 */
function R3_construir_(datos) {
  const cfg = R3_cfg_();
  const respuestas = datos.answers || {};
  let total = 0, maximo = 0;

  const questions = cfg.questions.map(function (q, idx) {
    const puntos = Number(q.points || 0);
    const docente = R3_esDocente_(q);
    const ganado = R3_round_(automaticPoints_(q, respuestas[q.id]));
    const img = q.imageKey && cfg.images ? cfg.images[q.imageKey] : null;
    maximo += puntos;
    total += ganado;
    return {
      number: idx + 1,
      id: q.id,
      label: q.type || '',
      prompt: q.prompt || '',
      studentAnswer: R3_respuesta_(q, respuestas[q.id]),
      idealAnswer: R3_ideal_(q),
      explanation: (q.grading && q.grading.rubric) || q.hint || '',
      image: img ? img.src : '',
      imageAlt: img ? (img.alt || '') : '',
      imageCaption: img ? (img.caption || '') : '',
      pointsEarned: ganado,
      pointsMax: puntos,
      teacherEditable: docente,
      status: ganado <= 0 ? 'incorrect' : (ganado >= puntos ? 'correct' : 'partial'),
      feedback: docente
        ? 'Pendiente de revisión docente.'
        : (ganado >= puntos ? 'Respuesta correcta y completa.'
           : ganado > 0 ? 'Respuesta parcialmente correcta. Revisa la respuesta ideal.'
           : 'Revisa la respuesta ideal y la explicación.')
    };
  });

  total = R3_round_(total);
  const pendientes = questions.filter(q => q.teacherEditable).map(q => q.number);

  const rep = {
    examId: cfg.examId,
    version: cfg.version,
    grade: cfg.grade,
    unit: cfg.unit,
    title: cfg.title,
    submissionId: datos.submissionId,
    studentName: datos.nombre,
    studentEmail: datos.correo,
    section: datos.seccion,
    submittedAt: datos.fecha,
    score: { total: total, maximum: maximo },
    comment: 'Reporte preliminar: faltan calificar las preguntas ' + pendientes.join(', ') + '.',
    questions: questions,
    reviewedAt: ''
  };
  return R3_aplicarEscala20_(rep);
}

function R3_detalle_(rep) {
  const bruto = rep.rawScore || {};
  return 'Nota ' + rep.score.total + '/' + rep.score.maximum +
    ' · Automático ' + rep.score.automatic + '/' + rep.score.automaticMaximum +
    ' · Docente ' + rep.score.teacher + '/' + rep.score.teacherMaximum +
    ' · Bruto ' + Number(bruto.total || 0) + '/' + Number(bruto.maximum || 24) +
    ' · ' + (rep.questions || []).filter(q => q.teacherEditable)
      .map(q => 'P' + q.number + ' ' + q.pointsEarned + '/' + q.pointsMax).join(' · ');
}

/**
 * Genera (o regenera) las filas del reporte.
 * Una fila POR ENVIO: si un alumno rinde dos veces, conserva ambos intentos.
 *
 * OJO: reconstruye desde las respuestas, asi que descarta la calificacion
 * docente ya puesta en los envios que procesa. Pasar correos para acotar.
 */
function R3_generarReportes(correos) {
  const cfg = R3_cfg_();
  const filtro = (correos || []).map(c => String(c).trim().toLowerCase()).filter(Boolean);

  const hojaResp = getOrCreateSheet_(SHEETS.responses);
  const last = hojaResp.getLastRow();
  if (last < 2) throw new Error('No hay respuestas registradas.');
  const ancho = hojaResp.getLastColumn();
  const cab = hojaResp.getRange(1, 1, 1, ancho).getDisplayValues()[0];
  const filas = hojaResp.getRange(2, 1, last - 1, ancho).getDisplayValues();

  const iSub = cab.indexOf('Submission ID');
  const iNom = cab.indexOf('Nombre verificado');
  const iCor = cab.indexOf('Correo verificado');
  const iSec = cab.indexOf('Sección');
  const iJson = cab.indexOf('Respuestas JSON');
  const iFecha = cab.indexOf('Fecha servidor');
  if (iCor < 0 || iJson < 0) throw new Error('La hoja de respuestas no tiene las columnas esperadas.');

  const total = {}, vistos = {};
  filas.forEach(f => {
    const c = String(f[iCor] || '').trim().toLowerCase();
    if (c) total[c] = (total[c] || 0) + 1;
  });

  const hoja = R3_hoja_();
  let hechos = 0;

  filas.forEach(function (f) {
    const correo = String(f[iCor] || '').trim().toLowerCase();
    if (!correo || correo.indexOf('@' + cfg.schoolDomain) === -1) return;
    vistos[correo] = (vistos[correo] || 0) + 1;
    const intento = vistos[correo];
    const varios = (total[correo] || 0) > 1;
    if (filtro.length && filtro.indexOf(correo) === -1) return;

    let answers = {};
    try { answers = JSON.parse(f[iJson] || '{}'); } catch (_) { return; }

    const rep = R3_construir_({
      answers: answers,
      submissionId: iSub >= 0 ? f[iSub] : '',
      nombre: (iNom >= 0 ? String(f[iNom] || '') : '') + (varios ? ' · Intento ' + intento : ''),
      correo: correo,
      seccion: iSec >= 0 ? f[iSec] : '',
      fecha: iFecha >= 0 ? f[iFecha] : ''
    });

    const nueva = [rep.submissionId, correo, rep.studentName, rep.score.total,
                   rep.score.maximum, rep.score.level, R3_detalle_(rep),
                   rep.comment, 'NO', JSON.stringify(rep)];

    const dest = R3_filaPorEnvio_(hoja, rep.submissionId);
    if (dest > 0) hoja.getRange(dest, 1, 1, R3_HEADERS.length).setValues([nueva]);
    else hoja.appendRow(nueva);
    hechos += 1;
  });

  SpreadsheetApp.flush();
  return 'Reportes generados: ' + hechos;
}

/**
 * Se llama sola al enviar el examen, desde doPost.
 * Va envuelta en try/catch alla: si falla, las respuestas YA estan guardadas.
 */
function R3_generarUno_(payload, answers) {
  const rep = R3_construir_({
    answers: answers,
    submissionId: payload.submissionId,
    nombre: payload.studentName || '',
    correo: String(payload.studentEmail || '').toLowerCase(),
    seccion: payload.section || '',
    fecha: new Date().toISOString()
  });
  const hoja = R3_hoja_();
  const nueva = [rep.submissionId, rep.studentEmail, rep.studentName, rep.score.total,
                 rep.score.maximum, rep.score.level, R3_detalle_(rep),
                 rep.comment, 'NO', JSON.stringify(rep)];
  const dest = R3_filaPorEnvio_(hoja, rep.submissionId);
  if (dest > 0) hoja.getRange(dest, 1, 1, R3_HEADERS.length).setValues([nueva]);
  else hoja.appendRow(nueva);
  SpreadsheetApp.flush();
  return rep;
}

/* ------------------------------------------------------------------ *
 * CONSULTA, CALIFICACION Y LIBERACION
 * ------------------------------------------------------------------ */

function R3_requestReport_(payload) {
  const cfg = R3_cfg_();
  const requestId = String(payload.requestId || '').trim();
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) throw new Error('Identificador de consulta no válido.');

  const identity = verifyGoogleIdentity_(payload.googleCredential || '');
  const email = String(identity.email || '').trim().toLowerCase();
  const isAdmin = R3_ADMIN_EMAILS.indexOf(email) !== -1;
  const target = String(payload.targetEmail || '').trim().toLowerCase();
  const cache = CacheService.getScriptCache();
  const key = 'r3report:' + requestId;

  const hoja = getOrCreateSheet_(R3_REPORTS_SHEET);
  const last = hoja.getLastRow();
  if (last < 2) {
    cache.put(key, JSON.stringify({ ok: true, status: 'not_found' }), 300);
    return json_({ ok: true, accepted: true, requestId: requestId });
  }
  const filas = hoja.getRange(2, 1, last - 1, R3_HEADERS.length).getDisplayValues();

  if (isAdmin && !target) {
    const lista = filas.map(function (f) {
      const lib = String(f[8] || '').trim().toUpperCase() === 'SI';
      return {
        email: String(f[1] || '').trim().toLowerCase() + '::' + String(f[0] || '').trim(),
        name: (lib ? '' : 'PENDIENTE · ') + String(f[2] || '').trim(),
        section: '',
        total: Number(f[3] || 0),
        level: String(f[5] || '').trim()
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
    cache.put(key, JSON.stringify({ ok: true, status: 'admin_index', reports: lista }), 300);
    return json_({ ok: true, accepted: true, requestId: requestId });
  }

  const buscar = isAdmin && target ? target : email;
  const soloCorreo = buscar.indexOf('::') !== -1 ? buscar.split('::')[0] : buscar;
  const dest = R3_fila_(hoja, buscar);
  const fila = dest > 0 ? filas[dest - 2] : null;

  if (!fila) {
    cache.put(key, JSON.stringify({ ok: true, status: 'not_found' }), 300);
  } else if (!isAdmin && String(fila[8] || '').trim().toUpperCase() !== 'SI') {
    cache.put(key, JSON.stringify({ ok: true, status: 'pending',
      message: 'La revisión docente todavía no ha sido liberada.' }), 300);
  } else {
    const rep = R3_aplicarEscala20_(JSON.parse(String(fila[9] || '{}')));
    if (!rep.studentEmail || String(rep.studentEmail).toLowerCase() !== soloCorreo) {
      throw new Error('El reporte no coincide con la identidad verificada.');
    }
    if (isAdmin) {
      (rep.questions || []).forEach(function (q) {
        if (q.teacherEditable) { q.adminEditable = true; q.minimumPoints = 0; }
      });
    }
    cache.put(key, JSON.stringify({
      ok: true, status: 'ready', report: rep, admin: isAdmin,
      liberado: String(fila[8] || '').trim().toUpperCase() === 'SI'
    }), 300);
  }
  return json_({ ok: true, accepted: true, requestId: requestId });
}

function R3_saveReview_(payload) {
  const requestId = String(payload.requestId || '').trim();
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) throw new Error('Identificador no válido.');
  const identity = verifyGoogleIdentity_(payload.googleCredential || '');
  const admin = String(identity.email || '').trim().toLowerCase();
  if (R3_ADMIN_EMAILS.indexOf(admin) === -1) throw new Error('Esta cuenta no puede editar calificaciones.');

  const target = String(payload.targetEmail || '').trim().toLowerCase();
  const n = Number(payload.questionNumber);
  const puntos = Number(payload.pointsEarned);
  if (!Number.isFinite(puntos)) throw new Error('El puntaje no es válido.');
  const feedback = String(payload.feedback || '').trim();
  if (!feedback) throw new Error('Escribe un comentario para el estudiante.');

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const hoja = getOrCreateSheet_(R3_REPORTS_SHEET);
    const dest = R3_fila_(hoja, target);
    if (!dest) throw new Error('No se encontró el reporte del estudiante.');
    const fila = hoja.getRange(dest, 1, 1, R3_HEADERS.length).getDisplayValues()[0];

    const rep = R3_aplicarEscala20_(JSON.parse(String(fila[9] || '{}')));
    const q = (rep.questions || []).find(x => Number(x.number) === n);
    if (!q) throw new Error('No se encontró la pregunta.');
    if (!q.teacherEditable) throw new Error('Esta pregunta no admite revisión manual.');
    const max = Number(q.pointsMax || 0);
    const val = R3_round_(puntos);
    if (val < 0 || val > max) throw new Error('El puntaje debe estar entre 0 y ' + max + '.');

    q.pointsEarned = val;
    q.feedback = feedback;
    q.status = val <= 0 ? 'incorrect' : (val >= max ? 'correct' : 'partial');

    R3_aplicarEscala20_(rep);
    const total = rep.score.total;
    const maximo = rep.score.maximum;
    rep.reviewedAt = new Date().toISOString();

    hoja.getRange(dest, 4, 1, 7).setValues([[
      total, maximo, rep.score.level, R3_detalle_(rep), rep.comment || '',
      String(fila[8] || 'NO').trim().toUpperCase() === 'SI' ? 'SI' : 'NO',   // conserva liberado
      JSON.stringify(rep)
    ]]);
    SpreadsheetApp.flush();

    (rep.questions || []).forEach(function (x) {
      if (x.teacherEditable) { x.adminEditable = true; x.minimumPoints = 0; }
    });
    CacheService.getScriptCache().put('r3report:' + requestId, JSON.stringify({
      ok: true, status: 'ready', report: rep, admin: true,
      liberado: String(fila[8] || '').trim().toUpperCase() === 'SI',
      saved: true, savedQuestion: n
    }), 300);
    return json_({ ok: true, accepted: true, requestId: requestId });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function R3_release_(payload) {
  const cfg = R3_cfg_();
  const identity = verifyGoogleIdentity_(payload.googleCredential || '');
  const admin = String(identity.email || '').trim().toLowerCase();
  if (R3_ADMIN_EMAILS.indexOf(admin) === -1) throw new Error('Esta cuenta no puede liberar reportes.');

  const target = String(payload.targetEmail || '').trim().toLowerCase();
  const solo = target.indexOf('::') !== -1 ? target.split('::')[0] : target;
  if (solo.indexOf('@' + cfg.schoolDomain) === -1) throw new Error('Correo de estudiante no válido.');
  const liberar = payload.liberar !== false;

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const hoja = getOrCreateSheet_(R3_REPORTS_SHEET);
    const dest = R3_fila_(hoja, target);
    if (!dest) throw new Error('No se encontró el reporte de ' + solo);
    hoja.getRange(dest, 9).setValue(liberar ? 'SI' : 'NO');
    SpreadsheetApp.flush();
    const requestId = String(payload.requestId || '').trim();
    if (/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) {
      CacheService.getScriptCache().put('r3report:' + requestId, JSON.stringify({
        ok: true, status: 'released', liberado: liberar, targetEmail: solo
      }), 300);
    }
    return json_({ ok: true, accepted: true, liberado: liberar });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function R3_reportStatus_(requestId) {
  const id = String(requestId || '').trim();
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(id)) return json_({ ok: false, error: 'Consulta no válida.' });
  const v = CacheService.getScriptCache().get('r3report:' + id);
  if (!v) return json_({ ok: true, pendingRequest: true });
  return json_(JSON.parse(v));
}

/** Señal de vida: comprueba que este archivo esta instalado Y publicado. */
function R3_health_() {
  const cfg = R3_cfg_();
  const bruto = R3_maximosBrutos_();
  let docentes = [];
  cfg.questions.forEach(function (q, i) {
    if (R3_esDocente_(q)) docentes.push(i + 1);
  });
  return json_({ ok: true, instalado: true, examId: cfg.examId,
                 maximo: R3_FINAL_MAX, maximoBruto: bruto.total,
                 automatico: R3_AUTO_FINAL_MAX, docente: R3_TEACHER_FINAL_MAX,
                 preguntasDocentes: docentes });
}

/* ------------------------------------------------------------------ *
 * UTILIDADES PARA EL DOCENTE
 * ------------------------------------------------------------------ */

function R3_generarTodos() { return R3_generarReportes([]); }

/**
 * Migra reportes existentes a la escala de 20 sin reconstruir preguntas ni
 * perder comentarios, puntajes docentes o estado de liberacion.
 */
function R3_migrarEscala20() {
  validateConfiguration_();
  const hoja = getOrCreateSheet_(R3_REPORTS_SHEET);
  const last = hoja.getLastRow();
  if (last < 2) return 'No hay reportes para migrar.';
  const filas = hoja.getRange(2, 1, last - 1, R3_HEADERS.length).getDisplayValues();
  let actualizados = 0, omitidos = 0;
  filas.forEach(function (fila, idx) {
    try {
      const rep = R3_aplicarEscala20_(JSON.parse(String(fila[9] || '{}')));
      hoja.getRange(idx + 2, 4, 1, 7).setValues([[
        rep.score.total, rep.score.maximum, rep.score.level, R3_detalle_(rep),
        rep.comment || '', String(fila[8] || 'NO').trim().toUpperCase() === 'SI' ? 'SI' : 'NO',
        JSON.stringify(rep)
      ]]);
      actualizados += 1;
    } catch (err) {
      omitidos += 1;
      console.error('R3 migracion fila ' + (idx + 2) + ': ' + err);
    }
  });
  SpreadsheetApp.flush();
  return 'Reportes actualizados: ' + actualizados + '. Omitidos: ' + omitidos + '.';
}

function R3_liberar(correo) {
  const hoja = getOrCreateSheet_(R3_REPORTS_SHEET);
  const d = R3_fila_(hoja, String(correo || '').trim().toLowerCase());
  if (!d) throw new Error('No se encontró el reporte de ' + correo);
  hoja.getRange(d, 9).setValue('SI');
  SpreadsheetApp.flush();
  return 'Liberado: ' + correo;
}

function R3_ocultar(correo) {
  const hoja = getOrCreateSheet_(R3_REPORTS_SHEET);
  const d = R3_fila_(hoja, String(correo || '').trim().toLowerCase());
  if (!d) throw new Error('No se encontró el reporte de ' + correo);
  hoja.getRange(d, 9).setValue('NO');
  SpreadsheetApp.flush();
  return 'Oculto: ' + correo;
}

/** Comprobacion en seco: calcula el reporte de un envio sin escribir nada. */
function R3_probar(correo) {
  const cfg = R3_cfg_();
  const hojaResp = getOrCreateSheet_(SHEETS.responses);
  const last = hojaResp.getLastRow();
  if (last < 2) return 'No hay respuestas.';
  const ancho = hojaResp.getLastColumn();
  const cab = hojaResp.getRange(1, 1, 1, ancho).getDisplayValues()[0];
  const filas = hojaResp.getRange(2, 1, last - 1, ancho).getDisplayValues();
  const iCor = cab.indexOf('Correo verificado');
  const iJson = cab.indexOf('Respuestas JSON');
  const f = correo
    ? filas.filter(x => String(x[iCor] || '').toLowerCase() === String(correo).toLowerCase()).pop()
    : filas[filas.length - 1];
  if (!f) return 'No se encontró ese correo.';
  const rep = R3_construir_({ answers: JSON.parse(f[iJson] || '{}'), submissionId: 'PRUEBA',
                              nombre: 'PRUEBA', correo: 'prueba', seccion: '', fecha: '' });
  return rep.score.total + '/' + rep.score.maximum + ' · ' + rep.score.level + ' · ' + R3_detalle_(rep);
}
