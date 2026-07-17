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

function doGet(e) {
  try {
    validateConfiguration_();
    var action = String(e && e.parameter && e.parameter.action || 'health').toLowerCase();
    if (action === 'status') {
      return submissionStatus_(String(e.parameter.submissionId || ''), String(e.parameter.examId || ''));
    }
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

  ensureHeaders_(reports, ['Fecha', 'EXAM_ID', 'Indicador', 'Dimensión', 'Valor', 'Filtro', 'Detalle', 'Versión de reporte']);
  reports.getRange('A2').setNote('Espacio reservado. No se generan reportes hasta implementar una rutina posterior y activar reportsEnabled.');

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



