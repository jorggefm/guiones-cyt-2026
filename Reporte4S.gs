/**
 * Reporte4S.gs — Reportes del examen 4S U4 C2 V2
 * ==============================================
 * Archivo NUEVO. Se agrega al proyecto de Apps Script del examen v2
 * (Sheets 1RUozyb3Ps_1RfOxGR4tP3EU1m0jtFuaVJ-Z3AQd_oHM), junto al codigo
 * existente. No reemplaza nada. Todo va prefijado con R4_.
 *
 * Aporta lo que al examen v2 le faltaba: generar la fila del reporte,
 * permitir la calificacion docente y liberar el reporte al alumno.
 * Mismo patron ya probado en 2S. Ver docs/FLUJO-COMPLETO.md
 *
 * Reparto: 14 automaticos + 6 docentes = 20
 * Preguntas docentes: 5 (1.5), 7 (2), 12 (2.5)
 */

const R4_REPORTS_SHEET = 'Reportes';

/**
 * El Codigo.gs de 4S v2 NO define R4_ADMIN_EMAILS: ese examen solo capturaba
 * y corregia, nunca tuvo funciones de administrador. Se define aqui, con
 * prefijo propio para no chocar si algun dia se agrega alla.
 */
const R4_ADMIN_EMAILS = ['jorge.fernandez@colegiomilagrosdedios.edu.pe'];

/** Que preguntas admiten ajuste docente y cuanto aportan. */
const R4_TEACHER_QUESTIONS = { 5: 1.5, 7: 2, 12: 2.5 };
const R4_AUTO_MAX = 14;
const R4_TEACHER_MAX = 6;

/** Puntaje maximo por pregunta, tomado de KEY_ROWS. */
const R4_MAX = { 1: 1, 2: 2, 3: 1.5, 4: 2, 5: 1.5, 6: 1, 7: 2, 8: 2, 9: 2, 10: 1.5, 11: 1, 12: 2.5 };

/**
 * Imagenes del examen v2, por numero de pregunta.
 * Sin esto el reporte caia en la tabla fija heredada de 2S y mostraba
 * imagenes de otro grado (blastocisto en una pregunta de neuronas).
 */
const R4_IMAGENES = {
  3:  { src: 'assets/4s_u4_examen_v2/01_circuito_nervioso.png',
        alt: 'Circuito nervioso con neuronas señaladas A, B y C.',
        caption: 'Imagen usada en la pregunta 3.' },
  6:  { src: 'assets/4s_u4_examen_v2/02_especificidad_hormonal.png',
        alt: 'Hormona y células con distintos receptores.',
        caption: 'Imagen usada en la pregunta 6.' },
  8:  { src: 'assets/4s_u4_examen_v2/03_tipos_senales.png',
        alt: 'Receptores que detectan señales mecánica, luminosa, térmica y eléctrica.',
        caption: 'Imagen usada en la pregunta 8.' },
  11: { src: 'assets/4s_u4_examen_v2/04_bomba_na_k.png',
        alt: 'Bomba sodio-potasio con ATP.',
        caption: 'Imagen usada en la pregunta 11.' }
};

const R4_PROMPTS = {
  1: 'Un sonido fuerte activa una respuesta de alarma. ¿Qué ocurre primero?',
  2: 'Ordena la ruta nerviosa: receptor, neurona sensorial, SNC, neurona motora y músculo.',
  3: 'Identifica los tipos de neurona señalados con A, B y C.',
  4: 'Relaciona cada estructura del sistema nervioso con su función.',
  5: '¿Qué es la homeostasis? Explícalo con tus palabras.',
  6: '¿Sobre qué célula actúa la hormona y por qué?',
  7: 'Compara el receptor y el efector: qué hace cada uno y en qué parte de la ruta actúa.',
  8: 'Identifica el tipo de señal que detecta cada receptor (A, B, C y D).',
  9: 'Ordena las fases del potencial de acción.',
  10: '¿Por qué no se generó potencial de acción?',
  11: '¿Qué hace la bomba Na+/K+ según la imagen?',
  12: 'Explica la ruta completa de la respuesta al estrés: del estímulo a la respuesta.'
};

/* ------------------------------------------------------------------ *
 * PUNTAJE POR PREGUNTA
 * scoreAutomatic_ del examen solo devuelve el total. Aqui se calcula
 * el desglose, que es lo que el reporte necesita mostrar.
 * ------------------------------------------------------------------ */

function R4_scorePerQuestion_(d) {
  const per = {};
  per[1] = d.q1 === 'b' ? 1 : 0;

  per[2] = [
    correctNumber_(d.q2_receptor, 1), correctNumber_(d.q2_sensorial, 2),
    correctNumber_(d.q2_snc, 3), correctNumber_(d.q2_motora, 4),
    correctNumber_(d.q2_musculo, 5)
  ].reduce((s, x) => s + x, 0) * (2 / 5);

  per[3] = (d.q3_a === 'sensorial' ? 0.5 : 0)
         + (d.q3_b === 'interneurona' ? 0.5 : 0)
         + (d.q3_c === 'motora' ? 0.5 : 0);

  per[4] = (d.q4_encefalo === 'integra' ? 0.5 : 0)
         + (d.q4_medula === 'reflejos' ? 0.5 : 0)
         + (d.q4_nervios === 'conducen' ? 0.5 : 0)
         + (d.q4_receptores === 'detectan' ? 0.5 : 0);

  per[5] = 0;                       // docente
  per[6] = d.q6 === 'b' ? 1 : 0;
  per[7] = 0;                       // docente

  per[8] = (d.q8_a === 'mecanica' ? 0.5 : 0)
         + (d.q8_b === 'luminosa' ? 0.5 : 0)
         + (d.q8_c === 'termica' ? 0.5 : 0)
         + (d.q8_d === 'electrica' ? 0.5 : 0);

  per[9] = [
    correctNumber_(d.q9_reposo_inicial, 1), correctNumber_(d.q9_umbral, 2),
    correctNumber_(d.q9_despolarizacion, 3), correctNumber_(d.q9_repolarizacion, 4),
    correctNumber_(d.q9_hiperpolarizacion, 5), correctNumber_(d.q9_retorno, 6)
  ].reduce((s, x) => s + x, 0) * (2 / 6);

  per[10] = d.q10 === 'b' ? 1.5 : 0;
  per[11] = d.q11 === 'b' ? 1 : 0;
  per[12] = 0;                      // docente

  Object.keys(per).forEach(k => { per[k] = R4_round_(per[k]); });
  return per;
}

/** Texto legible de la respuesta del alumno, por pregunta. */
function R4_answer_(n, d) {
  const v = x => String(x == null ? '' : x).trim();
  const o = x => v(x) || '—';
  switch (Number(n)) {
    case 1: return o(d.q1);
    case 2: return 'Receptor: ' + o(d.q2_receptor) + ' · Sensorial: ' + o(d.q2_sensorial) +
                   ' · SNC: ' + o(d.q2_snc) + ' · Motora: ' + o(d.q2_motora) + ' · Músculo: ' + o(d.q2_musculo);
    case 3: return 'A: ' + o(d.q3_a) + ' · B: ' + o(d.q3_b) + ' · C: ' + o(d.q3_c);
    case 4: return 'Encéfalo: ' + o(d.q4_encefalo) + ' · Médula: ' + o(d.q4_medula) +
                   ' · Nervios: ' + o(d.q4_nervios) + ' · Receptores: ' + o(d.q4_receptores);
    case 5: return v(d.q5) || '(sin responder)';
    case 6: return o(d.q6);
    case 7: return v(d.q7) || '(sin responder)';
    case 8: return 'A: ' + o(d.q8_a) + ' · B: ' + o(d.q8_b) + ' · C: ' + o(d.q8_c) + ' · D: ' + o(d.q8_d);
    case 9: return 'Reposo: ' + o(d.q9_reposo_inicial) + ' · Umbral: ' + o(d.q9_umbral) +
                   ' · Despol.: ' + o(d.q9_despolarizacion) + ' · Repol.: ' + o(d.q9_repolarizacion) +
                   ' · Hiperpol.: ' + o(d.q9_hiperpolarizacion) + ' · Retorno: ' + o(d.q9_retorno);
    case 10: return o(d.q10);
    case 11: return o(d.q11);
    case 12: return v(d.q12) || '(sin responder)';
    default: return '';
  }
}

/* ------------------------------------------------------------------ *
 * GENERACION DE REPORTES
 * ------------------------------------------------------------------ */

/**
 * Genera (o regenera) la fila del reporte de cada alumno en 'Reportes'.
 * Solo procesa los correos indicados; si no se indica ninguno, procesa
 * todos los envios reales.
 *
 * NO borra nada: actualiza si el correo ya existe, agrega si no.
 * Nace con liberado = NO. El docente califica 5, 7 y 12 y luego libera.
 */
function R4_generarReportes(correos) {
  const filtro = (correos || []).map(c => String(c).trim().toLowerCase()).filter(Boolean);

  const respuestas = getOrCreateSheet_(RESPONSES_SHEET);
  const lastRow = respuestas.getLastRow();
  if (lastRow < 2) throw new Error('No hay respuestas registradas.');

  const ancho = respuestas.getLastColumn();
  const filas = respuestas.getRange(2, 1, lastRow - 1, ancho).getDisplayValues();
  const cab = respuestas.getRange(1, 1, 1, ancho).getDisplayValues()[0];
  const iCorreo = cab.indexOf('correo');
  const iNombre = cab.indexOf('nombre');
  const iSub = cab.indexOf('submissionId');
  const iJson = cab.indexOf('respuestas_json');
  const iSeccion = cab.indexOf('seccion');
  const iTs = cab.indexOf('timestamp');
  if (iCorreo < 0 || iJson < 0) throw new Error('La hoja de respuestas no tiene las columnas esperadas.');

  const reportes = R4_prepararHojaReportes_();
  let hechos = 0;

  // Cuantos envios tiene cada correo, para numerar los intentos.
  const totalPorCorreo = {};
  filas.forEach(f => {
    const c = String(f[iCorreo] || '').trim().toLowerCase();
    if (c) totalPorCorreo[c] = (totalPorCorreo[c] || 0) + 1;
  });
  const vistos = {};

  filas.forEach(fila => {
    const correo = String(fila[iCorreo] || '').trim().toLowerCase();
    if (!correo || !correo.endsWith('@' + SCHOOL_DOMAIN)) return;
    vistos[correo] = (vistos[correo] || 0) + 1;
    const intento = vistos[correo];
    const hayVarios = (totalPorCorreo[correo] || 0) > 1;      // descarta pruebas sin correo real
    if (filtro.length && filtro.indexOf(correo) === -1) return;

    let d = {};
    try { d = JSON.parse(fila[iJson] || '{}'); } catch (_) { return; }

    const per = R4_scorePerQuestion_(d);
    const automatico = R4_round_(Object.keys(per).reduce((s, k) => s + Number(per[k] || 0), 0));
    const total = automatico;                       // docente aun en 0
    const nivel = R4_nivel_(total);

    const questions = Object.keys(R4_MAX).map(Number).sort((a, b) => a - b).map(n => {
      const max = R4_MAX[n];
      const earned = Number(per[n] || 0);
      const esDocente = !!R4_TEACHER_QUESTIONS[n];
      return {
        number: n,
        label: '',
        prompt: R4_PROMPTS[n] || '',
        image: (R4_IMAGENES[n] || {}).src || '',
        imageAlt: (R4_IMAGENES[n] || {}).alt || '',
        imageCaption: (R4_IMAGENES[n] || {}).caption || '',
        studentAnswer: R4_answer_(n, d),
        idealAnswer: R4_claveIdeal_(n),
        explanation: R4_claveExplicacion_(n),
        pointsEarned: earned,
        pointsMax: max,
        status: earned <= 0 ? 'incorrect' : (earned >= max ? 'correct' : 'partial'),
        feedback: esDocente
          ? 'Pendiente de revisión docente.'
          : (earned >= max ? 'Respuesta correcta y completa.'
             : earned > 0 ? 'Respuesta parcialmente correcta. Revisa la respuesta ideal.'
             : 'Revisa la respuesta ideal y la explicación.')
      };
    });

    const report = {
      examId: EXAM_ID,
      version: EXAM_VERSION,
      grade: '4.° Secundaria',
      unit: 'Unidad 4',
      title: 'Sistema nervioso y endocrino',
      submissionId: iSub >= 0 ? fila[iSub] : '',
      studentName: (iNombre >= 0 ? String(fila[iNombre] || '') : '') + (hayVarios ? ' · Intento ' + intento : ''),
      studentEmail: correo,
      section: iSeccion >= 0 ? fila[iSeccion] : '',
      submittedAt: iTs >= 0 ? fila[iTs] : '',
      score: { automatic: automatico, teacher: 0, total: total, level: nivel },
      comment: 'Reporte preliminar: faltan calificar las preguntas 5, 7 y 12.',
      questions: questions,
      reviewedAt: ''
    };

    const detalle = R4_detalle_(automatico, 0, { 5: 0, 7: 0, 12: 0 });
    const nuevaFila = [
      report.submissionId, correo, report.studentName,
      total, nivel, detalle, report.comment, 'NO', JSON.stringify(report)
    ];

    const destino = R4_buscarPorEnvio_(reportes, report.submissionId);  // una fila por INTENTO
    if (destino > 0) reportes.getRange(destino, 1, 1, 9).setValues([nuevaFila]);
    else reportes.appendRow(nuevaFila);
    hechos += 1;
  });

  SpreadsheetApp.flush();
  return 'Reportes generados: ' + hechos;
}

/**
 * La hoja 'Reportes' del examen v2 nacio con 8 columnas y sin reporte_json,
 * que es de donde el reporte dibuja las 12 preguntas. Aqui se normaliza al
 * formato de 9 columnas. Solo reescribe la cabecera si hace falta.
 */
function R4_prepararHojaReportes_() {
  const CAB = ['submissionId', 'correo', 'nombre', 'puntajeFinal', 'nivel',
               'detallePreguntas', 'comentario', 'liberado', 'reporte_json'];
  const hoja = getOrCreateSheet_(R4_REPORTS_SHEET);
  const actual = hoja.getLastColumn() >= 9
    ? hoja.getRange(1, 1, 1, 9).getDisplayValues()[0]
    : [];
  if (actual.join('|') !== CAB.join('|')) {
    if (hoja.getLastRow() > 1) {
      throw new Error('La hoja Reportes tiene datos con otro formato. Revisar a mano antes de continuar.');
    }
    hoja.clear();
    hoja.getRange(1, 1, 1, 9).setValues([CAB]);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

/** Localiza la fila de un envio concreto (columna 1 = submissionId). */
function R4_buscarPorEnvio_(hoja, submissionId) {
  const lastRow = hoja.getLastRow();
  if (lastRow < 2 || !submissionId) return 0;
  const ids = hoja.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  const i = ids.findIndex(x => String(x[0] || '').trim() === String(submissionId).trim());
  return i >= 0 ? i + 2 : 0;
}

/**
 * Acepta 'correo' o la clave compuesta 'correo::submissionId'.
 * Con solo el correo devuelve el intento MAS RECIENTE, que es lo que
 * corresponde mostrarle al alumno.
 */
function R4_buscarFila_(hoja, clave) {
  const txt = String(clave || '').trim().toLowerCase();
  if (txt.indexOf('::') !== -1) return R4_buscarPorEnvio_(hoja, txt.split('::')[1]);
  const lastRow = hoja.getLastRow();
  if (lastRow < 2) return 0;
  const correos = hoja.getRange(2, 2, lastRow - 1, 1).getDisplayValues();
  let ultima = 0;
  correos.forEach((x, i) => { if (String(x[0] || '').trim().toLowerCase() === txt) ultima = i + 2; });
  return ultima;
}

function R4_buscarFilaObsoleta_(hoja, correo) {
  const lastRow = hoja.getLastRow();
  if (lastRow < 2) return 0;
  const correos = hoja.getRange(2, 2, lastRow - 1, 1).getDisplayValues();
  const i = correos.findIndex(x => String(x[0] || '').trim().toLowerCase() === correo);
  return i >= 0 ? i + 2 : 0;
}

/** Mismo formato que 2S: parseable de vuelta para recuperar el desglose docente. */
function R4_detalle_(automatico, docente, desglose) {
  return ['Automático ' + automatico + '/' + R4_AUTO_MAX,
          'Docente ' + docente + '/' + R4_TEACHER_MAX,
          'P5 ' + Number(desglose[5] || 0) + '/1.5',
          'P7 ' + Number(desglose[7] || 0) + '/2',
          'P12 ' + Number(desglose[12] || 0) + '/2.5'].join(' · ');
}

function R4_parseDetalle_(detalle) {
  const r = { 5: 0, 7: 0, 12: 0 };
  [5, 7, 12].forEach(n => {
    const m = String(detalle || '').match(new RegExp('P' + n + '\\s+([0-9]+(?:\\.[0-9]+)?)/'));
    if (m) r[n] = Number(m[1] || 0);
  });
  return r;
}

function R4_claveIdeal_(n) {
  const f = KEY_ROWS.find(x => Number(x[0]) === Number(n));
  return f ? f[2] : '';
}

function R4_claveExplicacion_(n) {
  const f = KEY_ROWS.find(x => Number(x[0]) === Number(n));
  return f ? f[4] : '';
}

function R4_nivel_(v) {
  const s = Math.max(0, Math.min(20, Number(v) || 0));
  if (s < 12) return 'B';
  if (s < 17) return 'A';
  return 'AD';
}

function R4_sharedSummary_(level) {
  if (level === 'AD') return 'Logro destacado: comprendiste y aplicaste los contenidos centrales con claridad. Revisa los comentarios para seguir afinando tus explicaciones.';
  if (level === 'A') return 'Logro esperado: comprendiste los contenidos centrales. Revisa cada comentario para precisar mejor las relaciones cientificas.';
  return 'Estas en proceso: usa las respuestas ideales y los comentarios para reforzar los contenidos y sus relaciones cientificas.';
}

function R4_round_(n) { return Math.round(Number(n || 0) * 100) / 100; }

/* ------------------------------------------------------------------ *
 * CONSULTA Y CALIFICACION (lo que usa el HTML del reporte)
 * ------------------------------------------------------------------ */

function R4_requestReport_(payload) {
  const requestId = String(payload.requestId || '').trim();
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) throw new Error('Identificador de consulta no válido.');

  const identity = verifyGoogleIdentity_(payload.googleCredential || '');
  const email = String(identity.email || '').trim().toLowerCase();
  const isAdmin = R4_ADMIN_EMAILS.indexOf(email) !== -1;
  const targetEmail = String(payload.targetEmail || '').trim().toLowerCase();
  const cache = CacheService.getScriptCache();
  const key = 'r4report:' + requestId;

  const hoja = getOrCreateSheet_(R4_REPORTS_SHEET);
  const lastRow = hoja.getLastRow();
  if (lastRow < 2) {
    cache.put(key, JSON.stringify({ ok: true, status: 'not_found' }), 300);
    return json_({ ok: true, accepted: true, requestId: requestId });
  }
  const filas = hoja.getRange(2, 1, lastRow - 1, 9).getDisplayValues();

  // Administrador sin alumno elegido: indice completo, pendientes marcados.
  if (isAdmin && !targetEmail) {
    const lista = filas.map(f => {
      const liberado = String(f[7] || '').trim().toUpperCase() === 'SI';
      return {
        email: String(f[1] || '').trim().toLowerCase() + '::' + String(f[0] || '').trim(),
        name: (liberado ? '' : 'PENDIENTE · ') + String(f[2] || '').trim(),
        section: '',
        total: Number(f[3] || 0),
        level: String(f[4] || '').trim()
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
    cache.put(key, JSON.stringify({ ok: true, status: 'admin_index', reports: lista }), 300);
    return json_({ ok: true, accepted: true, requestId: requestId });
  }

  const buscar = isAdmin && targetEmail ? targetEmail : email;
  const correoBuscado = buscar.indexOf('::') !== -1 ? buscar.split('::')[0] : buscar;
  const dest = R4_buscarFila_(hoja, buscar);
  const fila = dest > 0 ? filas[dest - 2] : null;
  if (!fila) {
    cache.put(key, JSON.stringify({ ok: true, status: 'not_found' }), 300);
  } else if (!isAdmin && String(fila[7] || '').trim().toUpperCase() !== 'SI') {
    cache.put(key, JSON.stringify({ ok: true, status: 'pending',
      message: 'La revisión docente todavía no ha sido liberada.' }), 300);
  } else {
    const report = JSON.parse(String(fila[8] || '{}'));
    if (!report.studentEmail || String(report.studentEmail).toLowerCase() !== correoBuscado) {
      throw new Error('El reporte no coincide con la identidad verificada.');
    }
    if (isAdmin) {
      (report.questions || []).forEach(q => {
        if (R4_TEACHER_QUESTIONS[Number(q.number)]) { q.adminEditable = true; q.minimumPoints = 0; }
      });
    }
    cache.put(key, JSON.stringify({
      ok: true, status: 'ready', report: report, admin: isAdmin,
      liberado: String(fila[7] || '').trim().toUpperCase() === 'SI'
    }), 300);
  }
  return json_({ ok: true, accepted: true, requestId: requestId });
}

function R4_saveReview_(payload) {
  const requestId = String(payload.requestId || '').trim();
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) throw new Error('Identificador no válido.');

  const identity = verifyGoogleIdentity_(payload.googleCredential || '');
  const admin = String(identity.email || '').trim().toLowerCase();
  if (R4_ADMIN_EMAILS.indexOf(admin) === -1) throw new Error('Esta cuenta no puede editar calificaciones.');

  const targetEmail = String(payload.targetEmail || '').trim().toLowerCase();
  const n = Number(payload.questionNumber);
  if (!R4_TEACHER_QUESTIONS[n]) throw new Error('Esta pregunta no admite revisión manual.');
  const puntos = Number(payload.pointsEarned);
  if (!Number.isFinite(puntos)) throw new Error('El puntaje no es válido.');
  const feedback = String(payload.feedback || '').trim();
  if (!feedback) throw new Error('Escribe un comentario para el estudiante.');

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const hoja = getOrCreateSheet_(R4_REPORTS_SHEET);
    const destino = R4_buscarFila_(hoja, targetEmail);
    if (!destino) throw new Error('No se encontró el reporte del estudiante.');
    const fila = hoja.getRange(destino, 1, 1, 9).getDisplayValues()[0];

    const report = JSON.parse(String(fila[8] || '{}'));
    const q = (report.questions || []).find(x => Number(x.number) === n);
    if (!q) throw new Error('No se encontró la pregunta.');
    const max = Number(q.pointsMax || 0);
    const val = R4_round_(puntos);
    if (val < 0 || val > max) throw new Error('El puntaje debe estar entre 0 y ' + max + '.');

    const desglose = R4_parseDetalle_(String(fila[5] || ''));
    desglose[n] = val;
    q.pointsEarned = val;
    q.feedback = feedback;
    q.status = val <= 0 ? 'incorrect' : (val >= max ? 'correct' : 'partial');

    const docente = R4_round_(Math.min(R4_TEACHER_MAX,
      [5, 7, 12].reduce((s, k) => s + Number(desglose[k] || 0), 0)));
    const automatico = Number(report.score && report.score.automatic || 0);
    const total = R4_round_(Math.min(20, automatico + docente));
    report.score = { automatic: automatico, teacher: docente, total: total, level: R4_nivel_(total) };
    if (String(fila[7] || '').trim().toUpperCase() === 'SI') report.comment = R4_sharedSummary_(report.score.level);
    report.reviewedAt = new Date().toISOString();

    hoja.getRange(destino, 4, 1, 6).setValues([[
      total, R4_nivel_(total), R4_detalle_(automatico, docente, desglose),
      report.comment || '',
      String(fila[7] || 'NO').trim().toUpperCase() === 'SI' ? 'SI' : 'NO',   // conserva el estado
      JSON.stringify(report)
    ]]);
    SpreadsheetApp.flush();

    (report.questions || []).forEach(x => {
      if (R4_TEACHER_QUESTIONS[Number(x.number)]) { x.adminEditable = true; x.minimumPoints = 0; }
    });
    CacheService.getScriptCache().put('r4report:' + requestId, JSON.stringify({
      ok: true, status: 'ready', report: report, admin: true,
      liberado: String(fila[7] || '').trim().toUpperCase() === 'SI',
      saved: true, savedQuestion: n
    }), 300);
    return json_({ ok: true, accepted: true, requestId: requestId });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function R4_release_(payload) {
  const identity = verifyGoogleIdentity_(payload.googleCredential || '');
  const admin = String(identity.email || '').trim().toLowerCase();
  if (R4_ADMIN_EMAILS.indexOf(admin) === -1) throw new Error('Esta cuenta no puede liberar reportes.');

  const targetEmail = String(payload.targetEmail || '').trim().toLowerCase();
  const soloCorreo = targetEmail.indexOf('::') !== -1 ? targetEmail.split('::')[0] : targetEmail;
  if (!soloCorreo.endsWith('@' + SCHOOL_DOMAIN)) throw new Error('Correo de estudiante no válido.');
  const liberar = payload.liberar !== false;

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const hoja = getOrCreateSheet_(R4_REPORTS_SHEET);
    const destino = R4_buscarFila_(hoja, targetEmail);
    if (!destino) throw new Error('No se encontró el reporte de ' + targetEmail);
    const fila = hoja.getRange(destino, 1, 1, 9).getDisplayValues()[0];
    if (liberar) {
      try {
        const report = JSON.parse(String(fila[8] || '{}'));
        report.comment = R4_sharedSummary_(String((report.score || {}).level || fila[4] || ''));
        hoja.getRange(destino, 7).setValue(report.comment);
        hoja.getRange(destino, 9).setValue(JSON.stringify(report));
      } catch (_) {}
    }
    hoja.getRange(destino, 8).setValue(liberar ? 'SI' : 'NO');
    SpreadsheetApp.flush();

    const requestId = String(payload.requestId || '').trim();
    if (/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) {
      CacheService.getScriptCache().put('r4report:' + requestId, JSON.stringify({
        ok: true, status: 'released', liberado: liberar, targetEmail: targetEmail
      }), 300);
    }
    return json_({ ok: true, accepted: true, liberado: liberar });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function R4_reportStatus_(requestId) {
  const id = String(requestId || '').trim();
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(id)) return json_({ ok: false, error: 'Consulta no válida.' });
  const v = CacheService.getScriptCache().get('r4report:' + id);
  if (!v) return json_({ ok: true, pendingRequest: true });
  return json_(JSON.parse(v));
}

/** Señal de vida, para comprobar que este archivo esta instalado y publicado. */
function R4_health_() {
  return json_({ ok: true, instalado: true, examId: EXAM_ID, reportes: R4_REPORTS_SHEET });
}

/* ------------------------------------------------------------------ *
 * UTILIDADES PARA EL DOCENTE
 * ------------------------------------------------------------------ */

/** Genera el reporte SOLO de los dos alumnos que rindieron el 20/07. */
function R4_generarLosDos() {
  return R4_generarReportes([
    'rodrigo_santos@colegiomilagrosdedios.edu.pe',
    'nahum_lopez@colegiomilagrosdedios.edu.pe'
  ]);
}

/** Genera el reporte de todos los envios con correo institucional. */
function R4_generarTodos() {
  return R4_generarReportes([]);
}

function R4_estandarizarComentariosLiberados() {
  const hoja = getOrCreateSheet_(R4_REPORTS_SHEET);
  const last = hoja.getLastRow();
  if (last < 2) return { ok: true, updated: 0 };
  const filas = hoja.getRange(2, 1, last - 1, 9).getDisplayValues();
  let updated = 0;
  filas.forEach(function (fila, idx) {
    if (String(fila[7] || '').trim().toUpperCase() !== 'SI') return;
    try {
      const report = JSON.parse(String(fila[8] || '{}'));
      const comment = R4_sharedSummary_(String((report.score || {}).level || fila[4] || ''));
      report.comment = comment;
      hoja.getRange(idx + 2, 7).setValue(comment);
      hoja.getRange(idx + 2, 9).setValue(JSON.stringify(report));
      updated += 1;
    } catch (_) {}
  });
  SpreadsheetApp.flush();
  return { ok: true, updated: updated };
}

function R4_liberar(correo) {
  const hoja = getOrCreateSheet_(R4_REPORTS_SHEET);
  const d = R4_buscarFila_(hoja, String(correo || '').trim().toLowerCase());
  if (!d) throw new Error('No se encontró el reporte de ' + correo);
  hoja.getRange(d, 8).setValue('SI');
  SpreadsheetApp.flush();
  return 'Liberado: ' + correo;
}

function R4_ocultar(correo) {
  const hoja = getOrCreateSheet_(R4_REPORTS_SHEET);
  const d = R4_buscarFila_(hoja, String(correo || '').trim().toLowerCase());
  if (!d) throw new Error('No se encontró el reporte de ' + correo);
  hoja.getRange(d, 8).setValue('NO');
  SpreadsheetApp.flush();
  return 'Oculto: ' + correo;
}
