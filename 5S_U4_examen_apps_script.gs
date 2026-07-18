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
  1: { scoreBucket: 'automatic' },
  2: { scoreBucket: 'automatic' },
  3: { scoreBucket: 'teacher' },
  4: { scoreBucket: 'automatic' },
  5: { scoreBucket: 'automatic' },
  6: { scoreBucket: 'automatic' },
  7: { scoreBucket: 'teacher' },
  8: { scoreBucket: 'automatic' },
  9: { scoreBucket: 'automatic' },
  10: { scoreBucket: 'automatic' },
  11: { scoreBucket: 'automatic' },
  12: { scoreBucket: 'teacher' }
};

function doGet(e) {
  try {
    // Ejecutar doGet manualmente desde el editor regenera los reportes oficiales.
    // Las solicitudes web reales siempre reciben el objeto de evento `e`.
    if (!e) return generateOfficialReports();
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
  if (question.type === 'multiple') return multipleChoicePoints_(answer, grading.correct, available);
  if (question.type === 'sequence' || question.type === 'dropdown') return componentPoints_(answer, grading.correct, available);
  if (question.type === 'text') {
    var accepted = grading.accepted || [];
    var pass = accepted.some(function (candidate) { return similarity_(normalize_(answer), normalize_(candidate)) >= Number(grading.threshold || 0.82); });
    return pass ? available : 0;
  }
  return 0;
}

function strictAutomaticPoints_(question, answer) {
  var grading = question.grading;
  var available = grading.method === 'mixed' ? Number(grading.automaticPoints || 0) : Number(question.points || 0);
  if (question.type === 'single') return String(answer) === String(grading.correct) ? available : 0;
  if (question.type === 'multiple' || question.type === 'sequence' || question.type === 'dropdown') return arraysEqual_(answer, grading.correct) ? available : 0;
  return automaticPoints_(question, answer);
}

function multipleChoicePoints_(answer, correct, available) {
  if (!Array.isArray(answer) || !Array.isArray(correct) || !correct.length) return 0;
  var selected = {};
  answer.forEach(function (value) { selected[String(value)] = true; });
  var expected = {};
  correct.forEach(function (value) { expected[String(value)] = true; });
  var correctValues = Object.keys(expected);
  var hits = correctValues.reduce(function (sum, value) { return sum + (selected[value] ? 1 : 0); }, 0);
  return round_(Number(available || 0) * hits / correctValues.length);
}

function componentPoints_(answer, correct, available) {
  if (!Array.isArray(answer) || !Array.isArray(correct) || !correct.length) return 0;
  var hits = correct.reduce(function (sum, value, index) {
    return sum + (String(answer[index]) === String(value) ? 1 : 0);
  }, 0);
  return round_(Number(available || 0) * hits / correct.length);
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
  if (!Number.isFinite(points)) throw new Error('Puntaje fuera del rango permitido.');
  if (!feedback || feedback.length > 1200) throw new Error('Escribe un comentario válido.');
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var sheet = getOrCreateSheet_(SHEETS.reports);
    var rows = sheet.getLastRow() < 2 ? [] : sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getDisplayValues();
    var index = rows.findIndex(function (row) { return String(row[1]).toLowerCase() === targetEmail; });
    if (index < 0) throw new Error('No se encontró el reporte del estudiante.');
    var report = JSON.parse(String(rows[index][8] || '{}'));
    var question = (report.questions || []).find(function (item) { return Number(item.number) === number; });
    if (!question) throw new Error('No se encontró la pregunta.');
    var maximum = Number(question.pointsMax || 0);
    if (points < 0 || points > maximum) throw new Error('El puntaje debe estar entre 0 y ' + maximum + '.');
    var previousPoints = Number(question.pointsEarned || 0);
    question.pointsEarned = points;
    question.feedback = feedback;
    question.status = reviewStatus_(points, maximum, question.studentAnswer);
    var teacher = [3, 7, 12].reduce(function (sum, n) {
      var q = (report.questions || []).find(function (item) { return Number(item.number) === n; });
      return sum + Number(q && q.pointsEarned || 0);
    }, 0);
    var automatic = Number(report.score && report.score.automatic || 0);
    if (edit.scoreBucket === 'automatic') automatic = round_(Math.max(0, Math.min(16, automatic + points - previousPoints)));
    var rawTotal = round_(automatic + teacher);
    var total = round_(rawTotal / 24 * 20);
    var level = levelFromScore_(total);
    report.score = { automatic: automatic, automaticMax: 16, teacher: round_(teacher), teacherMax: 8, rawTotal: rawTotal, rawMaximum: 24, total: total, level: level };
    report.reviewedAt = new Date().toISOString();
    report.comment = summaryComment_(level);
    var detail = buildTeacherDetail_(report);
    sheet.getRange(index + 2, 4, 1, 6).setValues([[total, level, detail, report.comment, 'SI', JSON.stringify(report)]]);
    var grading = getOrCreateSheet_(SHEETS.grading);
    if (grading.getLastRow() >= 2) {
      var emails = grading.getRange(2, 5, grading.getLastRow() - 1, 1).getDisplayValues();
      var gi = emails.findIndex(function (item) { return String(item[0]).toLowerCase() === targetEmail; });
      if (gi >= 0) grading.getRange(gi + 2, 7, 1, 7).setValues([[automatic, round_(teacher), total, 20, level, 'Liberado', report.comment]]);
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
  return ['Automático ' + Number(report.score.automatic || 0) + '/16', 'Docente ' + Number(report.score.teacher || 0) + '/8', 'P3 ' + p(3) + '/2', 'P7 ' + p(7) + '/2', 'P12 ' + p(12) + '/4'].join(' · ');
}

function reviewStatus_(points, maximum, answer) {
  if (points <= 0) return String(answer || '').trim() && String(answer || '').trim() !== '.' ? 'incorrect' : 'unanswered';
  return points >= maximum ? 'correct' : 'partial';
}

function levelFromScore_(value) { var score = Math.max(0, Math.min(20, Number(value) || 0)); return score < 12 ? 'B' : (score < 17 ? 'A' : 'AD'); }
function summaryComment_(level) {
  return level === 'AD'
    ? 'Logro destacado: analizas los sistemas ecológicos y ambientales con claridad. Revisa los comentarios para seguir afinando tus argumentos.'
    : (level === 'A'
      ? 'Logro esperado: comprendiste los contenidos centrales. Revisa cada comentario para precisar mejor las relaciones científicas.'
      : 'Estás en proceso. Usa las respuestas ideales y los comentarios para reforzar las relaciones ecológicas, ambientales y bioelectroquímicas.');
}

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

/** Genera y libera los diez reportes oficiales de 5S a partir de las respuestas registradas. */
function generateOfficialReports() {
  validateConfiguration_();
  var reviews = {
    'josue_ynga@colegiomilagrosdedios.edu.pe': [1.25, 1, 0],
    'andre_nizama@colegiomilagrosdedios.edu.pe': [1.25, 0.75, 0],
    'adrian_vasquez@colegiomilagrosdedios.edu.pe': [2, 1.5, 1],
    'emily_fuentes@colegiomilagrosdedios.edu.pe': [2, 2, 1.25],
    'lucas_vidal@colegiomilagrosdedios.edu.pe': [1.5, 2, 1.25],
    'katherine_cortez@colegiomilagrosdedios.edu.pe': [0.75, 1.5, 1],
    'angel_galdos@colegiomilagrosdedios.edu.pe': [2, 0, 0],
    'belth_jara@colegiomilagrosdedios.edu.pe': [0, 0.5, 1.25],
    'yanina_loyola@colegiomilagrosdedios.edu.pe': [0, 1.25, 3],
    'joseph_valencia@colegiomilagrosdedios.edu.pe': [0.75, 1, 0.5]
  };
  var ideals = {
    1: 'Un ecosistema está formado por componentes bióticos, componentes abióticos y las interacciones entre ambos.',
    2: 'Hábitat: lugar donde vive el organismo. Nicho: rol funcional, alimentación, recursos, competencia y regulación.',
    3: 'Representa una red trófica porque existen varias relaciones y rutas alimentarias conectadas, no una sola secuencia lineal.',
    4: 'La energía disminuye porque parte se utiliza en metabolismo y movimiento y parte se disipa como calor.',
    5: 'A: agua; B: carbono; C: nitrógeno; D: oxígeno.',
    6: 'Los microorganismos fijan nitrógeno, degradan materia orgánica y devuelven nutrientes al ecosistema.',
    7: 'Se vuelve un problema cuando las actividades humanas aumentan los GEI y se retiene más calor del equilibrio natural.',
    8: 'El retroceso glaciar altera el agua, los caudales, la agricultura, los hábitats y la biodiversidad.',
    9: 'Biodiversidad genética, de especies, de ecosistemas y funcional.',
    10: 'El filtro puede mejorar apariencia o turbidez, pero no garantiza potabilidad ni esterilización.',
    11: 'Adsorber significa retener moléculas en la superficie interna del carbón activado, no destruirlas.',
    12: 'Medir voltaje abierto no demuestra mucha energía útil: se necesita medir corriente y potencia bajo carga, estabilidad, tratamiento real y reconocer que la energía de una MFC es limitada.'
  };
  var explanations = {
    1: 'Los seres vivos, el ambiente físico y sus interacciones funcionan como un sistema.',
    2: 'El hábitat describe dónde vive una especie; el nicho explica qué función cumple y cómo utiliza los recursos.',
    3: 'Una red integra varias cadenas y rutas de transferencia de materia y energía.',
    4: 'En cada transferencia solo una fracción de la energía queda disponible para el siguiente nivel.',
    5: 'Cada ciclo se reconoce por los procesos y sustancias que circulan entre ambiente y seres vivos.',
    6: 'La actividad microbiana permite transformar y reciclar nutrientes esenciales.',
    7: 'El efecto natural es necesario; su intensificación antropogénica produce calentamiento adicional.',
    8: 'Los glaciares son reservas de agua y sostienen actividades humanas y ecosistemas.',
    9: 'La biodiversidad existe en genes, especies, ambientes y funciones ecológicas.',
    10: 'Eliminar partículas visibles no equivale a eliminar microorganismos o sustancias peligrosas.',
    11: 'La adsorción ocurre sobre una superficie; no implica destrucción química del contaminante.',
    12: 'La potencia depende del voltaje y la corriente bajo una carga real; también importan estabilidad, eficiencia y tratamiento.'
  };
  var responses = getOrCreateSheet_(SHEETS.responses);
  var values = responses.getRange(2, 1, responses.getLastRow() - 1, 17).getDisplayValues();
  var students = values.filter(function (row) { return reviews[String(row[7] || '').toLowerCase()]; });
  if (students.length !== 10) throw new Error('Se esperaban 10 estudiantes y se encontraron ' + students.length + '.');
  var reportRows = [REPORT_HEADERS];
  var grading = getOrCreateSheet_(SHEETS.grading);
  ensureHeaders_(grading, GRADING_HEADERS);
  students.forEach(function (row) {
    var submissionId = row[1], name = row[6], email = String(row[7]).toLowerCase(), section = row[8] || 'Única';
    var answers = JSON.parse(row[12] || '{}');
    var objective = CONFIG.questions.reduce(function (sum, q) {
      return sum + (q.grading.method === 'automatic' ? automaticPoints_(q, answers[q.id]) : 0);
    }, 0);
    objective = round_(objective);
    var teacherParts = reviews[email];
    var teacher = round_(teacherParts[0] + teacherParts[1] + teacherParts[2]);
    var raw = round_(objective + teacher);
    var total = round_(raw / 24 * 20);
    var level = levelFromScore_(total);
    var questions = CONFIG.questions.map(function (q, index) {
      var number = index + 1;
      var points = number === 3 ? teacherParts[0] : (number === 7 ? teacherParts[1] : (number === 12 ? teacherParts[2] : automaticPoints_(q, answers[q.id])));
      return {
        number: number, label: q.label, prompt: q.prompt, studentAnswer: formatReportAnswer_(q, answers[q.id]), idealAnswer: idealAnswerForQuestion_(q, ideals[number]),
        explanation: explanations[number], pointsEarned: round_(points), pointsMax: Number(q.points || 0), status: reviewStatus_(points, Number(q.points || 0), answers[q.id]),
        feedback: feedbackForQuestion_(number, points, Number(q.points || 0))
      };
    });
    var report = {
      examId: CONFIG.examId, version: CONFIG.version, grade: CONFIG.grade, unit: CONFIG.unit, title: CONFIG.title,
      submissionId: submissionId, studentName: name, studentEmail: email, section: section, submittedAt: row[10],
      score: { automatic: objective, automaticMax: 16, teacher: teacher, teacherMax: 8, rawTotal: raw, rawMaximum: 24, total: total, level: level },
      comment: summaryComment_(level), questions: questions, reviewedAt: new Date().toISOString()
    };
    var detail = buildTeacherDetail_(report);
    reportRows.push([submissionId, email, name, total, level, detail, report.comment, 'SI', JSON.stringify(report)]);
    var emailValues = grading.getLastRow() < 2 ? [] : grading.getRange(2, 5, grading.getLastRow() - 1, 1).getDisplayValues();
    var gradingIndex = emailValues.findIndex(function (item) { return String(item[0]).toLowerCase() === email; });
    if (gradingIndex >= 0) grading.getRange(gradingIndex + 2, 7, 1, 7).setValues([[objective, teacher, total, 20, level, 'Liberado', report.comment]]);
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

/**
 * Recalcula únicamente los componentes automáticos de los reportes existentes.
 * Conserva puntajes y comentarios que ya fueron ajustados manualmente por el
 * docente. Nunca reduce una nota: la regla parcial solo puede mantenerla o subirla.
 */
function recalculateStoredReportsWithPartialCredit() {
  validateConfiguration_();
  var responses = getOrCreateSheet_(SHEETS.responses);
  var responseRows = responses.getLastRow() < 2 ? [] : responses.getRange(2, 1, responses.getLastRow() - 1, 17).getDisplayValues();
  var responseBySubmission = {};
  responseRows.forEach(function (row, index) { responseBySubmission[String(row[1])] = { row: row, sheetRow: index + 2 }; });

  var reports = getOrCreateSheet_(SHEETS.reports);
  var reportRows = reports.getLastRow() < 2 ? [] : reports.getRange(2, 1, reports.getLastRow() - 1, 9).getDisplayValues();
  var grading = getOrCreateSheet_(SHEETS.grading);
  var gradingIds = grading.getLastRow() < 2 ? [] : grading.getRange(2, 2, grading.getLastRow() - 1, 1).getDisplayValues();
  var changedReports = 0;
  var changedQuestions = 0;
  var benefitedStudents = 0;

  reportRows.forEach(function (row, reportIndex) {
    var report = JSON.parse(String(row[8] || '{}'));
    var source = responseBySubmission[String(report.submissionId || row[0])];
    if (!source) return;
    var answers = JSON.parse(String(source.row[12] || '{}'));
    var previousTotal = Number(report.score && report.score.total || row[3] || 0);
    var reportChanged = false;

    CONFIG.questions.forEach(function (configQuestion, index) {
      var number = index + 1;
      var reportQuestion = (report.questions || []).find(function (item) { return Number(item.number) === number; });
      if (!reportQuestion) return;
      if (configQuestion.type === 'multiple') {
        var listedIdeal = idealAnswerForQuestion_(configQuestion, reportQuestion.idealAnswer);
        if (String(reportQuestion.idealAnswer || '') !== listedIdeal) {
          reportQuestion.idealAnswer = listedIdeal;
          reportChanged = true;
        }
      }
      if (configQuestion.grading.method !== 'automatic') return;
      var stored = round_(Number(reportQuestion.pointsEarned || 0));
      var strict = round_(strictAutomaticPoints_(configQuestion, answers[configQuestion.id]));
      var partial = round_(automaticPoints_(configQuestion, answers[configQuestion.id]));
      if (Math.abs(stored - strict) > 0.001 || partial === stored) return;
      var previousDefaultFeedback = feedbackForQuestion_(number, stored, Number(configQuestion.points || 0));
      reportQuestion.pointsEarned = partial;
      reportQuestion.status = reviewStatus_(partial, Number(configQuestion.points || 0), answers[configQuestion.id]);
      if (String(reportQuestion.feedback || '') === previousDefaultFeedback) {
        reportQuestion.feedback = feedbackForQuestion_(number, partial, Number(configQuestion.points || 0));
      }
      changedQuestions += 1;
      reportChanged = true;
    });

    if (!reportChanged) return;
    var automatic = round_(CONFIG.questions.reduce(function (sum, configQuestion, index) {
      if (configQuestion.grading.method !== 'automatic') return sum;
      var reportQuestion = (report.questions || []).find(function (item) { return Number(item.number) === index + 1; });
      return sum + Number(reportQuestion && reportQuestion.pointsEarned || 0);
    }, 0));
    var teacher = round_([3, 7, 12].reduce(function (sum, number) {
      var reportQuestion = (report.questions || []).find(function (item) { return Number(item.number) === number; });
      return sum + Number(reportQuestion && reportQuestion.pointsEarned || 0);
    }, 0));
    var rawTotal = round_(automatic + teacher);
    var total = round_(rawTotal / 24 * 20);
    var level = levelFromScore_(total);
    report.score = { automatic: automatic, automaticMax: 16, teacher: teacher, teacherMax: 8, rawTotal: rawTotal, rawMaximum: 24, total: total, level: level };
    report.comment = summaryComment_(level);
    report.reviewedAt = new Date().toISOString();
    var detail = buildTeacherDetail_(report);
    reports.getRange(reportIndex + 2, 4, 1, 6).setValues([[total, level, detail, report.comment, 'SI', JSON.stringify(report)]]);
    responses.getRange(source.sheetRow, 14).setValue(automatic);
    var gradingIndex = gradingIds.findIndex(function (item) { return String(item[0]) === String(report.submissionId); });
    if (gradingIndex >= 0) grading.getRange(gradingIndex + 2, 7, 1, 7).setValues([[automatic, teacher, total, 20, level, 'Liberado', report.comment]]);
    if (total > previousTotal) benefitedStudents += 1;
    changedReports += 1;
  });

  SpreadsheetApp.flush();
  return { ok: true, reportsReviewed: reportRows.length, changedReports: changedReports, changedQuestions: changedQuestions, benefitedStudents: benefitedStudents };
}

function formatReportAnswer_(q, answer) {
  if (Array.isArray(answer)) {
    var items = q.items || [];
    return answer.map(function (value, index) {
      var item = items[index];
      var itemLabel = item && typeof item === 'object' ? String(item.label || item.prompt || item.text || '') : String(item || '');
      var options = item && typeof item === 'object' && Array.isArray(item.options) ? item.options : (q.options || []);
      var option = options.find(function (candidate) { return String(candidate.value) === String(value); });
      var valueLabel = option ? String(option.label) : String(value);
      return (itemLabel ? itemLabel + ': ' : '') + valueLabel;
    }).join(' | ');
  }
  if (q.type === 'single') {
    var option = (q.options || []).find(function (item) { return String(item.value) === String(answer); });
    return option ? option.label : String(answer || '');
  }
  return String(answer == null ? '' : answer);
}

function idealAnswerForQuestion_(q, fallback) {
  if (q.type !== 'multiple' || !Array.isArray(q.grading && q.grading.correct)) return fallback;
  return q.grading.correct.map(function (value) {
    var option = (q.options || []).find(function (item) { return String(item.value) === String(value); });
    return option ? String(option.label) : String(value);
  }).join(' | ');
}

function feedbackForQuestion_(number, points, maximum) {
  if (points >= maximum) return number === 3
    ? 'Explicaste correctamente por qué una red trófica contiene varias relaciones y rutas conectadas.'
    : (number === 7
      ? 'Diferenciaste el efecto invernadero natural de su intensificación por actividades humanas.'
      : (number === 12
        ? 'Evaluaste correctamente la afirmación usando potencia bajo carga, estabilidad y límites de la MFC.'
        : 'Respuesta correcta: identificaste todos los elementos solicitados.'));
  if (points <= 0) return 'Revisa la respuesta ideal y vuelve a identificar los conceptos científicos que pide la pregunta.';
  if (number === 3) return 'Reconociste algunas relaciones de la red; faltó explicar con mayor claridad que existen varias rutas conectadas y no una sola cadena lineal.';
  if (number === 7) return 'Reconociste parte del problema; faltó conectar con precisión actividad humana, aumento de GEI y retención adicional de calor.';
  if (number === 12) return 'Incluiste una idea relevante, pero faltó evaluar la energía útil mediante corriente y potencia bajo carga, estabilidad y tratamiento real.';
  return 'Respuesta parcialmente correcta: compara tu selección con la respuesta ideal.';
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



