/**
 * Backend neutral para un examen HTML.
 *
 * 1. Copia configuracion_ejemplo.js al proyecto Apps Script como Configuracion.gs.
 * 2. Sustituye todos los marcadores __...__ en esa configuración.
 * 3. Ejecuta setupExamWorkbook() una vez y revisa las cinco pestañas.
 * 4. Despliega como aplicación web y coloca su URL en appsScriptEndpoint.
 */
var CONFIG = null;

var SHEETS = Object.freeze({
  responses: 'Respuestas oficial',
  key: 'Clave oficial',
  grading: 'Calificación oficial',
  control: 'Control',
  reports: 'Reportes'
});

var RESPONSE_HEADERS = [
  'Fecha servidor', 'Submission ID', 'EXAM_ID', 'Versión', 'Grado', 'Unidad',
  'Nombre verificado', 'Correo verificado', 'Sección', 'Inicio', 'Fin',
  'Salidas de pantalla', 'Respuestas JSON', 'Puntaje automático',
  'Puntaje máximo', 'Pendiente docente', 'Estado'
];

var GRADING_HEADERS = [
  'Fecha servidor', 'Submission ID', 'EXAM_ID', 'Estudiante', 'Correo', 'Sección',
  'Automático', 'Docente', 'Total', 'Máximo', 'Escala', 'Estado', 'Retroalimentación'
];

var ADMIN_EMAILS = ['jorge.fernandez@colegiomilagrosdedios.edu.pe'];
var REPORT_HEADERS = ['submissionId', 'correo', 'nombre', 'puntajeFinal', 'nivel', 'detallePreguntas', 'comentario', 'liberado', 'reporte_json'];
var EDITABLE_REVIEW_QUESTIONS = {
  9: { maxTeacher: 2 },
  11: { maxTeacher: 1 },
  12: { maxTeacher: 4 }
};

function doGet(e) {
  try {
    validateConfiguration_();
    var action = String(e && e.parameter && e.parameter.action || 'health').toLowerCase();
    if (action === 'status') {
      return submissionStatus_(String(e.parameter.submissionId || ''), String(e.parameter.examId || ''));
    }
    if (action === 'report') return reportStatus_(String(e.parameter.requestId || ''));
    return json_({ ok: true, service: 'exam-template', examId: CONFIG.examId, version: CONFIG.version });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message || error) });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    validateConfiguration_();
    var payload = parsePayload_(e);
    var action = String(payload.action || '').toLowerCase();
    if (action === 'requestreport') return requestReport_(payload);
    if (action === 'savereportreview') return saveReportReview_(payload);
    var identity = validatePayload_(payload);
    var responses = getOrCreateSheet_(SHEETS.responses);
    ensureHeaders_(responses, RESPONSE_HEADERS);

    // Idempotencia real: el mismo submissionId nunca genera una segunda fila.
    if (findSubmissionRow_(responses, payload.submissionId) > 0) {
      return json_({ ok: true, duplicate: true, submissionId: payload.submissionId });
    }

    var score = scoreAnswers_(payload.answers);
    responses.appendRow(buildResponseRow_(payload, identity, score));
    appendGradingRow_(payload, identity, score);
    SpreadsheetApp.flush();
    return json_({ ok: true, duplicate: false, submissionId: payload.submissionId });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message || error) });
  } finally {
    lock.releaseLock();
  }
}

/** Crea o repara la estructura fija. Es seguro ejecutarla más de una vez. */
function setupExamWorkbook() {
  validateConfiguration_();
  var responses = getOrCreateSheet_(SHEETS.responses);
  var key = getOrCreateSheet_(SHEETS.key);
  var grading = getOrCreateSheet_(SHEETS.grading);
  var control = getOrCreateSheet_(SHEETS.control);
  var reports = getOrCreateSheet_(SHEETS.reports);

  ensureHeaders_(responses, RESPONSE_HEADERS);
  ensureHeaders_(grading, GRADING_HEADERS);

  var keyRows = [['Pregunta', 'Tipo', 'Método', 'Puntaje', 'Clave', 'Aceptadas', 'Umbral', 'Puntaje automático', 'Rúbrica']];
  CONFIG.questions.forEach(function (question) {
    keyRows.push([
      question.id, question.type, question.grading.method, question.points,
      jsonCell_(question.grading.correct), jsonCell_(question.grading.accepted),
      value_(question.grading.threshold), value_(question.grading.automaticPoints),
      value_(question.grading.rubric)
    ]);
  });
  key.clearContents();
  key.getRange(1, 1, keyRows.length, keyRows[0].length).setValues(keyRows);

  var controlRows = [
    ['Clave', 'Valor'], ['EXAM_ID', CONFIG.examId], ['VERSIÓN', CONFIG.version],
    ['GRADO', CONFIG.grade], ['UNIDAD', CONFIG.unit], ['TÍTULO', CONFIG.title],
    ['DOMINIO', CONFIG.schoolDomain], ['REPORTES_ACTIVOS', CONFIG.reportsEnabled ? 'SÍ' : 'NO'],
    ['ÚLTIMA_PREPARACIÓN', new Date()]
  ];
  control.clearContents();
  control.getRange(1, 1, controlRows.length, 2).setValues(controlRows);

  ensureHeaders_(reports, REPORT_HEADERS);

  [responses, key, grading, control, reports].forEach(function (sheet) {
    styleHeader_(sheet);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, Math.max(1, sheet.getLastColumn()));
  });
  return { ok: true, sheets: Object.keys(SHEETS).map(function (keyName) { return SHEETS[keyName]; }) };
}

/** Autoriza y comprueba que Apps Script puede consultar tokeninfo. */
function authorizeGoogleIdentityVerification() {
  var response = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=authorization-check', { muteHttpExceptions: true });
  return { ok: true, httpStatus: response.getResponseCode() };
}

/** Pruebas puras de puntuación; no escriben datos ni requieren tokens. */
function runScoringSelfTest() {
  validateConfiguration_();
  var perfect = {};
  CONFIG.questions.forEach(function (q) {
    if (q.grading.correct !== undefined) perfect[q.id] = q.grading.correct;
    else if (q.grading.accepted && q.grading.accepted.length) perfect[q.id] = q.grading.accepted[0];
    else perfect[q.id] = '[respuesta docente de prueba]';
  });
  var result = scoreAnswers_(perfect);
  if (result.maximum <= 0) throw new Error('Puntaje máximo inválido.');
  if (result.automatic < 0 || result.automatic > result.maximum) throw new Error('Puntaje automático fuera de rango.');
  return { ok: true, result: result };
}

function validateConfiguration_() {
  if (!CONFIG && typeof EXAM_CONFIG === 'object') {
    CONFIG = EXAM_CONFIG;
  }
  if (!CONFIG) throw new Error('Falta Configuracion.gs con EXAM_CONFIG.');
  ['grade', 'unit', 'title', 'examId', 'version', 'spreadsheetId', 'googleClientId', 'schoolDomain'].forEach(function (key) {
    var value = String(CONFIG[key] || '');
    if (!value || value.indexOf('__') === 0) throw new Error('Falta configurar ' + key + '.');
  });
  if (!Array.isArray(CONFIG.questions) || CONFIG.questions.length !== 12) throw new Error('La matriz debe contener exactamente 12 preguntas.');
  if (!Array.isArray(CONFIG.achievementScale) || CONFIG.achievementScale.map(function (item) { return item.label; }).join(',') !== 'AD,A,B') throw new Error('La escala debe contener AD, A y B, sin C.');
  var ids = {};
  CONFIG.questions.forEach(function (question, index) {
    if (question.id !== 'q' + (index + 1) || ids[question.id]) throw new Error('IDs de pregunta inválidos o duplicados.');
    ids[question.id] = true;
    if (['single', 'multiple', 'text', 'sequence', 'dropdown'].indexOf(question.type) < 0) throw new Error('Tipo inválido en ' + question.id + '.');
    if (['automatic', 'mixed', 'teacher'].indexOf(question.grading && question.grading.method) < 0) throw new Error('Método inválido en ' + question.id + '.');
  });
}

function validatePayload_(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Carga inválida.');
  if (payload.examId !== CONFIG.examId || payload.examVersion !== CONFIG.version) throw new Error('Examen o versión incorrectos.');
  if (!/^[A-Za-z0-9._:-]{8,160}$/.test(String(payload.submissionId || ''))) throw new Error('Submission ID inválido.');
  if (!payload.answers || typeof payload.answers !== 'object') throw new Error('Faltan respuestas.');
  CONFIG.questions.forEach(function (q) {
    if (!Object.prototype.hasOwnProperty.call(payload.answers, q.id)) throw new Error('Falta ' + q.id + '.');
  });
  var identity = verifyGoogleIdentity_(String(payload.googleCredential || ''));
  if (String(payload.studentEmail || '').toLowerCase() !== identity.email) throw new Error('El correo no coincide con el token.');
  return identity;
}

function verifyGoogleIdentity_(credential) {
  if (!credential || credential.split('.').length !== 3) throw new Error('Token de Google ausente.');
  var response = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential), { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) throw new Error('Google rechazó el token.');
  var identity = JSON.parse(response.getContentText());
  var email = String(identity.email || '').trim().toLowerCase();
  var issuer = String(identity.iss || '');
  var verified = identity.email_verified === true || String(identity.email_verified) === 'true';
  if (String(identity.aud || '') !== CONFIG.googleClientId) throw new Error('Audiencia OAuth incorrecta.');
  if (['accounts.google.com', 'https://accounts.google.com'].indexOf(issuer) < 0) throw new Error('Emisor OAuth incorrecto.');
  if (!verified || Number(identity.exp || 0) <= Math.floor(Date.now() / 1000)) throw new Error('Token no verificado o vencido.');
  if (!email.endsWith('@' + CONFIG.schoolDomain) || String(identity.hd || '').toLowerCase() !== CONFIG.schoolDomain.toLowerCase()) throw new Error('Cuenta fuera del dominio institucional.');
  return { email: email, name: String(identity.name || email), subject: String(identity.sub || '') };
}

function scoreAnswers_(answers) {
  var automatic = 0, maximum = 0, pending = [];
  CONFIG.questions.forEach(function (q) {
    maximum += Number(q.points || 0);
    var method = q.grading.method;
    if (method === 'teacher') { pending.push(q.id); return; }
    var earned = automaticPoints_(q, answers[q.id]);
    automatic += earned;
    if (method === 'mixed') pending.push(q.id);
  });
  return { automatic: round_(automatic), maximum: round_(maximum), pending: pending, status: pending.length ? 'Pendiente docente' : 'Calificado' };
}

function automaticPoints_(question, answer) {
  var grading = question.grading;
  var available = grading.method === 'mixed' ? Number(grading.automaticPoints || 0) : Number(question.points || 0);
  if (question.type === 'single') return String(answer) === String(grading.correct) ? available : 0;
  if (question.type === 'multiple' || question.type === 'sequence' || question.type === 'dropdown') return arraysEqual_(answer, grading.correct) ? available : 0;
  if (question.type === 'text') {
    var accepted = grading.accepted || [];
    var pass = accepted.some(function (candidate) { return similarity_(normalize_(answer), normalize_(candidate)) >= Number(grading.threshold || 0.82); });
    return pass ? available : 0;
  }
  return 0;
}

function buildResponseRow_(payload, identity, score) {
  return [new Date(), safeCell_(payload.submissionId), CONFIG.examId, CONFIG.version, CONFIG.grade, CONFIG.unit,
    safeCell_(identity.name), safeCell_(identity.email), safeCell_(payload.section), safeCell_(payload.startedAt),
    safeCell_(payload.finishedAt), Math.max(0, Number(payload.screenExits || 0)), JSON.stringify(payload.answers),
    score.automatic, score.maximum, score.pending.join(', '), score.status];
}

function appendGradingRow_(payload, identity, score) {
  var sheet = getOrCreateSheet_(SHEETS.grading);
  ensureHeaders_(sheet, GRADING_HEADERS);
  sheet.appendRow([new Date(), safeCell_(payload.submissionId), CONFIG.examId, safeCell_(identity.name), safeCell_(identity.email),
    safeCell_(payload.section), score.automatic, '', '', score.maximum, '', score.status, '']);
  var row = sheet.getLastRow();
  sheet.getRange(row, 9).setFormulaR1C1('=IF(RC[-1]="",IF(RC[3]="Calificado",RC[-2],""),RC[-2]+RC[-1])');
  var ad = Number(CONFIG.achievementScale[0].minRatio);
  var a = Number(CONFIG.achievementScale[1].minRatio);
  sheet.getRange(row, 11).setFormulaR1C1('=IF(RC[-2]="","",IF(RC[-2]/RC[-1]>=' + ad + ',"AD",IF(RC[-2]/RC[-1]>=' + a + ',"A","B")))');
}

function submissionStatus_(submissionId, examId) {
  if (examId !== CONFIG.examId || !submissionId) return json_({ ok: false, found: false });
  var sheet = getOrCreateSheet_(SHEETS.responses);
  ensureHeaders_(sheet, RESPONSE_HEADERS);
  return json_({ ok: true, found: findSubmissionRow_(sheet, submissionId) > 0 });
}

function findSubmissionRow_(sheet, submissionId) {
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var match = sheet.getRange(2, 2, last - 1, 1).createTextFinder(String(submissionId)).matchEntireCell(true).findNext();
  return match ? match.getRow() : -1;
}

function requestReport_(payload) {
  if (!payload || payload.examId !== CONFIG.examId) throw new Error('Examen no reconocido.');
  var requestId = String(payload.requestId || '').trim();
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) throw new Error('Identificador de consulta no válido.');
  var identity = verifyGoogleIdentity_(String(payload.googleCredential || ''));
  var email = String(identity.email || '').toLowerCase();
  var isAdmin = ADMIN_EMAILS.indexOf(email) !== -1;
  var targetEmail = String(payload.targetEmail || '').trim().toLowerCase();
  var cache = CacheService.getScriptCache();
  var cacheKey = 'report:' + requestId;
  if (!reportsEnabled_()) {
    cache.put(cacheKey, JSON.stringify({ ok: true, status: 'disabled' }), 300);
    return json_({ ok: true, accepted: true, requestId: requestId });
  }
  var sheet = getOrCreateSheet_(SHEETS.reports);
  ensureHeaders_(sheet, REPORT_HEADERS);
  var rows = sheet.getLastRow() < 2 ? [] : sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getDisplayValues();
  if (isAdmin && !targetEmail) {
    var reports = rows.filter(function (row) { return String(row[7]).toUpperCase() === 'SI'; }).map(function (row) {
      var section = '';
      try { section = String(JSON.parse(String(row[8] || '{}')).section || ''); } catch (_) {}
      return { email: String(row[1]).toLowerCase(), name: row[2], section: section, total: Number(row[3] || 0), level: row[4] };
    }).sort(function (a, b) { return a.name.localeCompare(b.name); });
    cache.put(cacheKey, JSON.stringify({ ok: true, status: 'admin_index', reports: reports }), 300);
    return json_({ ok: true, accepted: true, requestId: requestId });
  }
  var lookup = isAdmin && targetEmail ? targetEmail : email;
  var row = rows.find(function (item) { return String(item[1]).toLowerCase() === lookup; });
  if (!row) cache.put(cacheKey, JSON.stringify({ ok: true, status: 'not_found' }), 300);
  else if (String(row[7]).toUpperCase() !== 'SI') cache.put(cacheKey, JSON.stringify({ ok: true, status: 'pending' }), 300);
  else {
    var report = JSON.parse(String(row[8] || '{}'));
    if (String(report.studentEmail || '').toLowerCase() !== lookup) throw new Error('El reporte no coincide con la identidad verificada.');
    cache.put(cacheKey, JSON.stringify({ ok: true, status: 'ready', report: isAdmin ? prepareAdminReport_(report) : report, admin: isAdmin }), 300);
  }
  return json_({ ok: true, accepted: true, requestId: requestId });
}

function saveReportReview_(payload) {
  if (!payload || payload.examId !== CONFIG.examId) throw new Error('Examen no reconocido.');
  var requestId = String(payload.requestId || '').trim();
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) throw new Error('Identificador de actualización no válido.');
  var identity = verifyGoogleIdentity_(String(payload.googleCredential || ''));
  if (ADMIN_EMAILS.indexOf(String(identity.email || '').toLowerCase()) === -1) throw new Error('Esta cuenta no tiene permisos para editar calificaciones.');
  var targetEmail = String(payload.targetEmail || '').trim().toLowerCase();
  var number = Number(payload.questionNumber);
  var edit = EDITABLE_REVIEW_QUESTIONS[number];
  if (!edit) throw new Error('Esta pregunta no admite revisión manual.');
  var points = round_(Number(payload.pointsEarned));
  var feedback = String(payload.feedback || '').trim();
  if (!Number.isFinite(points) || points < 0 || points > edit.maxTeacher) throw new Error('Puntaje fuera del rango permitido.');
  if (!feedback || feedback.length > 1200) throw new Error('Escribe un comentario válido.');
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var sheet = getOrCreateSheet_(SHEETS.reports);
    var rows = sheet.getRange(2, 1, Math.max(0, sheet.getLastRow() - 1), 9).getDisplayValues();
    var index = rows.findIndex(function (row) { return String(row[1]).toLowerCase() === targetEmail; });
    if (index < 0) throw new Error('No se encontró el reporte del estudiante.');
    var report = JSON.parse(String(rows[index][8] || '{}'));
    var question = (report.questions || []).find(function (item) { return Number(item.number) === number; });
    if (!question) throw new Error('No se encontró la pregunta.');
    question.pointsEarned = points;
    question.feedback = feedback;
    question.status = reviewStatus_(points, Number(question.pointsMax || 0), question.studentAnswer);
    var teacher = [9, 11, 12].reduce(function (sum, n) {
      var q = (report.questions || []).find(function (item) { return Number(item.number) === n; });
      return sum + Number(q && q.pointsEarned || 0);
    }, 0);
    var automatic = Number(report.score && report.score.automatic || 0);
    var rawTotal = round_(automatic + teacher);
    var total = round_(rawTotal / 23 * 20);
    var level = levelFromScore_(total);
    report.score = { automatic: automatic, automaticMax: 16, teacher: round_(teacher), teacherMax: 7, rawTotal: rawTotal, rawMaximum: 23, total: total, level: level };
    report.reviewedAt = new Date().toISOString();
    var detail = buildTeacherDetail_(report);
    sheet.getRange(index + 2, 4, 1, 6).setValues([[total, level, detail, report.comment || '', 'SI', JSON.stringify(report)]]);
    var grading = getOrCreateSheet_(SHEETS.grading);
    if (grading.getLastRow() >= 2) {
      var emails = grading.getRange(2, 5, grading.getLastRow() - 1, 1).getDisplayValues();
      var gi = emails.findIndex(function (item) { return String(item[0]).toLowerCase() === targetEmail; });
      if (gi >= 0) grading.getRange(gi + 2, 7, 1, 7).setValues([[automatic, round_(teacher), total, 20, level, 'Liberado', feedback]]);
    }
    SpreadsheetApp.flush();
    CacheService.getScriptCache().put('report:' + requestId, JSON.stringify({ ok: true, status: 'ready', report: prepareAdminReport_(report), admin: true, saved: true }), 300);
    return json_({ ok: true, accepted: true, requestId: requestId });
  } finally { try { lock.releaseLock(); } catch (_) {} }
}

function prepareAdminReport_(report) {
  var copy = JSON.parse(JSON.stringify(report || {}));
  (copy.questions || []).forEach(function (question) {
    if (EDITABLE_REVIEW_QUESTIONS[Number(question.number)]) {
      question.adminEditable = true;
      question.minimumPoints = 0;
    }
  });
  return copy;
}

function buildTeacherDetail_(report) {
  function p(number) { var q = (report.questions || []).find(function (item) { return Number(item.number) === number; }); return Number(q && q.pointsEarned || 0); }
  return ['Automático ' + Number(report.score.automatic || 0) + '/16', 'Docente ' + Number(report.score.teacher || 0) + '/7', 'P9 ' + p(9) + '/2', 'P11 ' + p(11) + '/1', 'P12 ' + p(12) + '/4'].join(' · ');
}

function reviewStatus_(points, maximum, answer) {
  if (points <= 0) return String(answer || '').trim() ? 'incorrect' : 'unanswered';
  return points >= maximum ? 'correct' : 'partial';
}

function levelFromScore_(value) { var score = Math.max(0, Math.min(20, Number(value) || 0)); return score < 12 ? 'B' : (score < 17 ? 'A' : 'AD'); }
function reportStatus_(requestId) {
  var clean = String(requestId || '').trim();
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(clean)) return json_({ ok: false, error: 'Consulta no válida.' });
  var value = CacheService.getScriptCache().get('report:' + clean);
  return value ? json_(JSON.parse(value)) : json_({ ok: true, pendingRequest: true });
}
function reportsEnabled_() {
  var sheet = getOrCreateSheet_(SHEETS.control);
  if (sheet.getLastRow() < 2) return false;
  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getDisplayValues();
  var row = rows.find(function (item) { return String(item[0]).toUpperCase() === 'REPORTES_ACTIVOS'; });
  return !!row && ['SI', 'SÍ'].indexOf(String(row[1]).toUpperCase()) >= 0;
}

/** Genera y libera los doce reportes oficiales de 1S a partir de las respuestas registradas. */
function generateOfficialReports() {
  validateConfiguration_();
  var reviews = {
    'sebastian_pacheco@colegiomilagrosdedios.edu.pe': [0.75, 0.25, 0.75],
    'paul_moreno@colegiomilagrosdedios.edu.pe': [2, 1, 2],
    'mariana_ochoa@colegiomilagrosdedios.edu.pe': [0.75, 0.25, 1.5],
    'emily_canales@colegiomilagrosdedios.edu.pe': [0.25, 0.6, 2.25],
    'jazmin_cusi@colegiomilagrosdedios.edu.pe': [1, 0.5, 3],
    'favio_valverde@colegiomilagrosdedios.edu.pe': [1.5, 0.85, 3.75],
    'mathew_sanchez@colegiomilagrosdedios.edu.pe': [1.25, 0.9, 3.25],
    'fabricio_navarro@colegiomilagrosdedios.edu.pe': [1.25, 0.25, 3.5],
    'lucianna_alvarado@colegiomilagrosdedios.edu.pe': [1.25, 1, 2.75],
    'tatiana_santos@colegiomilagrosdedios.edu.pe': [1, 1, 1],
    'vania_zarate@colegiomilagrosdedios.edu.pe': [2, 0.4, 2.5],
    'brittany_reyna@colegiomilagrosdedios.edu.pe': [1, 0.6, 2.5]
  };
  var ideals = {
    1: 'La actividad tectónica del Cinturón de Fuego del Pacífico explica la alta sismicidad del Perú.',
    2: 'Roca madre → meteorización → fragmentación de rocas → mezcla con materia orgánica.',
    3: 'Arenoso: rápido; con humus: equilibrado; arcilloso: lento.',
    4: 'Contaminación → aumento de GEI → calor atrapado → derretimiento de glaciares → menos agua disponible.',
    5: 'Arenoso deja pasar; humus equilibra; arcilloso retiene.',
    6: 'La placa de Nazca subduce bajo la Sudamericana, se acumula energía y luego se libera en forma de sismo.',
    7: 'B → C → D → A.',
    8: 'Son GEI; atrapan calor; al aumentar calientan más la atmósfera.',
    9: 'Las raíces sujetan el suelo y reducen la erosión; el humus retiene humedad y ayuda a conservar agua.',
    10: 'El suelo arenoso deja pasar el agua más rápido y el arcilloso la retiene más.',
    11: 'El Perú está junto al Océano Pacífico, en el Cinturón de Fuego; la placa de Nazca subduce bajo la Sudamericana y produce sismos.',
    12: 'Debe conectar correctamente tectónica del Pacífico, contaminación/GEI y formación o permeabilidad del suelo.'
  };
  var explanations = {
    1: 'El mar no causa los sismos: importa la ubicación tectónica del Perú.', 2: 'La roca madre se altera, se fragmenta y después se mezcla con materia orgánica.',
    3: 'Los poros grandes del suelo arenoso dejan pasar más agua; la arcilla retiene más.', 4: 'Más GEI retienen calor, favorecen el retroceso glaciar y reducen reservas de agua.',
    5: 'Cada suelo se distingue por cuánto deja pasar o retiene el agua.', 6: 'La liberación súbita de la energía acumulada en el contacto de placas produce sismos.',
    7: 'La secuencia va de roca intacta a roca meteorizada, fragmentos y suelo fértil.', 8: 'Los gases de efecto invernadero retienen parte del calor en la atmósfera.',
    9: 'La vegetación protege físicamente el suelo y el humus mejora su capacidad de conservar humedad.', 10: 'Arenoso y arcilloso presentan comportamientos opuestos frente al agua.',
    11: 'La explicación completa une ubicación, placas, subducción y consecuencia sísmica.', 12: 'Una integración científica conecta las tres ideas mediante relaciones claras de causa y efecto.'
  };
  var responses = getOrCreateSheet_(SHEETS.responses);
  var values = responses.getRange(2, 1, responses.getLastRow() - 1, 17).getDisplayValues();
  var students = values.filter(function (row) { return reviews[String(row[7] || '').toLowerCase()]; });
  if (students.length !== 12) throw new Error('Se esperaban 12 estudiantes y se encontraron ' + students.length + '.');
  var reportRows = [REPORT_HEADERS];
  var grading = getOrCreateSheet_(SHEETS.grading);
  ensureHeaders_(grading, GRADING_HEADERS);
  students.forEach(function (row) {
    var submissionId = row[1], name = row[6], email = String(row[7]).toLowerCase(), section = row[8] || 'Única';
    var answers = JSON.parse(row[12] || '{}');
    var automatic = Number(row[13] || 0);
    var teacherParts = reviews[email];
    var teacher = round_(teacherParts[0] + teacherParts[1] + teacherParts[2]);
    var raw = round_(automatic + teacher);
    var total = round_(raw / 23 * 20);
    var level = levelFromScore_(total);
    var questions = CONFIG.questions.map(function (q, index) {
      var number = index + 1;
      var points = number === 9 ? teacherParts[0] : (number === 11 ? teacherParts[1] : (number === 12 ? teacherParts[2] : automaticPoints_(q, answers[q.id])));
      return {
        number: number, label: q.label, prompt: q.prompt, studentAnswer: formatReportAnswer_(q, answers[q.id]), idealAnswer: ideals[number],
        explanation: explanations[number], pointsEarned: round_(points), pointsMax: Number(q.points || 0), status: reviewStatus_(points, Number(q.points || 0), answers[q.id]),
        feedback: feedbackForQuestion_(number, points, Number(q.points || 0))
      };
    });
    var report = {
      examId: CONFIG.examId, version: CONFIG.version, grade: CONFIG.grade, unit: CONFIG.unit, title: CONFIG.title,
      submissionId: submissionId, studentName: name, studentEmail: email, section: section, submittedAt: row[10],
      score: { automatic: automatic, automaticMax: 16, teacher: teacher, teacherMax: 7, rawTotal: raw, rawMaximum: 23, total: total, level: level },
      comment: level === 'AD' ? 'Logro destacado: conectas los conceptos con claridad. Revisa los comentarios para seguir afinando tus explicaciones.' : (level === 'A' ? 'Logro esperado: comprendiste los contenidos centrales. Revisa cada comentario para precisar mejor las relaciones científicas.' : 'Estás en proceso. Usa las respuestas ideales y los comentarios para reforzar las relaciones de causa y efecto.'),
      questions: questions, reviewedAt: new Date().toISOString()
    };
    var detail = buildTeacherDetail_(report);
    reportRows.push([submissionId, email, name, total, level, detail, report.comment, 'SI', JSON.stringify(report)]);
    var emailValues = grading.getLastRow() < 2 ? [] : grading.getRange(2, 5, grading.getLastRow() - 1, 1).getDisplayValues();
    var gradingIndex = emailValues.findIndex(function (item) { return String(item[0]).toLowerCase() === email; });
    if (gradingIndex >= 0) grading.getRange(gradingIndex + 2, 7, 1, 7).setValues([[automatic, teacher, total, 20, level, 'Liberado', report.comment]]);
  });
  var reports = getOrCreateSheet_(SHEETS.reports);
  reports.clearContents();
  reports.getRange(1, 1, reportRows.length, 9).setValues(reportRows);
  styleHeader_(reports); reports.setFrozenRows(1); reports.autoResizeColumns(1, 9);
  var control = getOrCreateSheet_(SHEETS.control);
  var controlValues = control.getRange(1, 1, control.getLastRow(), 2).getDisplayValues();
  var controlIndex = controlValues.findIndex(function (item) { return String(item[0]).toUpperCase() === 'REPORTES_ACTIVOS'; });
  if (controlIndex >= 0) control.getRange(controlIndex + 1, 2).setValue('SI');
  SpreadsheetApp.flush();
  return { ok: true, reports: students.length };
}

function formatReportAnswer_(q, answer) {
  if (Array.isArray(answer)) {
    var items = q.items || [];
    return answer.map(function (value, index) {
      var item = items[index];
      var label = item && typeof item === 'object' ? String(item.label || item.prompt || item.text || '') : String(item || '');
      return (label ? label + ': ' : '') + value;
    }).join(' | ');
  }
  if (q.type === 'single') {
    var option = (q.options || []).find(function (item) { return String(item.value) === String(answer); });
    return option ? option.label : String(answer || '');
  }
  return String(answer == null ? '' : answer);
}

function feedbackForQuestion_(number, points, maximum) {
  if (points >= maximum) return number === 9 ? 'Explicaste correctamente cómo la vegetación y el humus ayudan a conservar el suelo y el agua.' : (number === 11 ? 'Relacionaste correctamente la ubicación del Perú, las placas, la subducción y los sismos.' : (number === 12 ? 'Integraste correctamente las tres ideas principales de la unidad.' : 'Respuesta correcta: identificaste todos los elementos solicitados.'));
  if (points <= 0) return 'Revisa la respuesta ideal y vuelve a identificar los conceptos científicos que pide la pregunta.';
  if (number === 9) return 'Reconociste parte de la función de la vegetación; faltó explicar con claridad el papel del humus o la conservación del agua.';
  if (number === 11) return 'Reconociste parte de la causa de los sismos; faltó conectar algunos de estos conceptos: Océano Pacífico, Cinturón de Fuego, placas y subducción.';
  if (number === 12) return 'Incluiste algunas ideas correctas, pero faltó conectarlas mediante una cadena científica clara entre Tierra, atmósfera y suelo.';
  return 'Respuesta parcialmente correcta: compara tu orden o selección con la respuesta ideal.';
}

function parsePayload_(e) {
  var body = e && e.postData && e.postData.contents;
  if (!body || body.length > 250000) throw new Error('Cuerpo ausente o demasiado grande.');
  return JSON.parse(body);
}

function getOrCreateSheet_(name) {
  var book = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  return book.getSheetByName(name) || book.insertSheet(name);
}

function ensureHeaders_(sheet, headers) {
  var current = sheet.getLastColumn() ? sheet.getRange(1, 1, 1, Math.max(headers.length, sheet.getLastColumn())).getDisplayValues()[0] : [];
  if (headers.some(function (value, index) { return current[index] !== value; })) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function styleHeader_(sheet) {
  if (sheet.getLastColumn() < 1) return;
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold').setBackground('#176b55').setFontColor('#ffffff').setWrap(true);
}

function arraysEqual_(actual, expected) {
  if (!Array.isArray(actual) || !Array.isArray(expected) || actual.length !== expected.length) return false;
  return actual.every(function (value, index) { return String(value) === String(expected[index]); });
}

function normalize_(value) {
  return String(value == null ? '' : value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function similarity_(a, b) {
  if (!a || !b) return 0;
  if (a === b || a.indexOf(b) >= 0 || b.indexOf(a) >= 0) return 1;
  var distance = levenshtein_(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

function levenshtein_(a, b) {
  var row = Array.from({ length: b.length + 1 }, function (_, index) { return index; });
  for (var i = 1; i <= a.length; i += 1) {
    var previous = row[0]; row[0] = i;
    for (var j = 1; j <= b.length; j += 1) {
      var saved = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1)); previous = saved;
    }
  }
  return row[b.length];
}

function safeCell_(value) {
  var text = String(value == null ? '' : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}
function jsonCell_(value) { return value === undefined ? '' : JSON.stringify(value); }
function value_(value) { return value === undefined || value === null ? '' : value; }
function round_(value) { return Math.round(Number(value || 0) * 100) / 100; }
function json_(object) { return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON); }
