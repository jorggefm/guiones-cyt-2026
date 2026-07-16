const SPREADSHEET_ID = '1RUozyb3Ps_1RfOxGR4tP3EU1m0jtFuaVJ-Z3AQd_oHM';
const RESPONSES_SHEET = 'Respuestas oficial';
const EXAM_ID = '4S-U4-C2-V2-OFICIAL-2026';
const EXAM_VERSION = '2026-07-17';
const GOOGLE_CLIENT_ID = '120108159327-6toqcr7bt3rljc8gfhtm7bonpnmueme3.apps.googleusercontent.com';
const SCHOOL_DOMAIN = 'colegiomilagrosdedios.edu.pe';

const HEADERS = [
  'timestamp', 'submissionId', 'examId', 'version', 'nombre', 'correo',
  'grado', 'seccion', 'salidasPantalla', 'puntajeAutomatico',
  'maximoAutomatico', 'revisionDocente', 'q1_alarma',
  'q2_ruta_nerviosa', 'q3_tipos_neuronas', 'q4_estructuras_snc',
  'q5_homeostasis', 'q6_celula_diana', 'q7_receptor_efector',
  'q8_tipos_senales', 'q9_potencial_accion', 'q10_umbral',
  'q11_bomba_na_k', 'q12_cortisol', 'respuestas_json'
];

const KEY_ROWS = [
  ['1', 'Alternativa contextualizada', 'Receptor auditivo detecta estímulo mecánico', 'b', 'El sonido primero debe ser detectado.', 1, 'Automática'],
  ['2', 'Ordenamiento', 'Receptor → sensorial → SNC → motora → músculo', 'Coincidencia de cinco posiciones', 'La información entra por la sensorial.', 2, 'Automática parcial'],
  ['3', 'Imagen con flechas', 'A sensorial; B interneurona; C motora', 'Coincidencia de tres tipos', 'Entrada, conexión interna y salida.', 1.5, 'Automática'],
  ['4', 'Relación estructura-función', 'Encéfalo integra; médula comunica; nervios conducen; receptores detectan', 'Coincidencia de cuatro relaciones', 'Detectar, conducir, comunicar e integrar.', 2, 'Automática'],
  ['5', 'Vocabulario científico tolerante', 'Equilibrio interno mediante detección y respuesta', 'Respuesta abierta', 'Aceptar expresiones equivalentes sobre estabilidad interna.', 1.5, 'Docente'],
  ['6', 'Imagen interpretativa', 'Célula B por receptor compatible', 'b', 'La respuesta depende del receptor.', 1, 'Automática'],
  ['7', 'Comparación', 'Receptor detecta al inicio; efector ejecuta al final', 'Respuesta abierta', 'Debe comparar función y posición en la ruta.', 2, 'Docente'],
  ['8', 'Imagen con flechas', 'A mecánica; B luminosa; C térmica; D eléctrica', 'Coincidencia de cuatro señales', 'Presión, luz, temperatura e iones.', 2, 'Automática'],
  ['9', 'Ordenamiento', 'Reposo → umbral → despolarización → repolarización → hiperpolarización → reposo', 'Coincidencia de seis posiciones', 'Sube, cae, sobrepasa y se estabiliza.', 2, 'Automática parcial'],
  ['10', 'Respuesta causal', 'No alcanzó el umbral aproximado de −55 mV', 'b', 'El potencial es todo o nada.', 1.5, 'Automática'],
  ['11', 'Imagen interpretativa', '3 Na+ fuera y 2 K+ dentro usando ATP', 'b', 'Cuenta iones y observa ATP.', 1, 'Automática'],
  ['12', 'Pregunta integradora', 'Estrés → suprarrenales → cortisol → sangre → células diana → respuesta', 'Respuesta abierta', 'Evaluar ruta, distribución y duración.', 2.5, 'Mixta']
];

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'health').toLowerCase();
  if (action === 'status') return submissionStatus_(e.parameter.submissionId || '');
  return json_({
    ok: true,
    examId: EXAM_ID,
    version: EXAM_VERSION,
    message: 'Endpoint activo para el examen oficial 4S U4 C2 V2.'
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const payload = parsePayload_(e);
    const identity = validatePayload_(payload);
    payload.studentName = identity.name || payload.studentName || '';
    payload.studentEmail = String(identity.email || '').toLowerCase();
    payload.googleSubject = identity.sub || '';
    delete payload.googleCredential;

    const sheet = getOrCreateSheet_(RESPONSES_SHEET);
    ensureHeaders_(sheet);
    if (findSubmissionRow_(sheet, payload.submissionId) > 0) {
      return json_({ ok: true, duplicate: true, submissionId: payload.submissionId });
    }

    const result = scoreAutomatic_(payload);
    sheet.appendRow(buildResponseRow_(payload, result));
    SpreadsheetApp.flush();
    return json_({ ok: true, duplicate: false, submissionId: payload.submissionId });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function setupExamWorkbook() {
  validateConfiguration_();
  const responses = getOrCreateSheet_(RESPONSES_SHEET);
  ensureHeaders_(responses);
  responses.setFrozenRows(1);

  const key = getOrCreateSheet_('Clave oficial');
  key.clearContents();
  key.getRange(1, 1, 1, 7).setValues([[
    'pregunta', 'tipo', 'respuestaIdeal', 'criterioAutomatico',
    'explicacion', 'puntajeMaximo', 'revision'
  ]]);
  key.getRange(2, 1, KEY_ROWS.length, KEY_ROWS[0].length).setValues(KEY_ROWS);
  key.setFrozenRows(1);

  const grading = getOrCreateSheet_('Calificación oficial');
  if (grading.getLastRow() === 0) {
    grading.getRange(1, 1, 1, 10).setValues([[
      'submissionId', 'nombre', 'correo', 'puntajeAutomatico',
      'maximoAutomatico', 'revisionDocente', 'totalInterno',
      'nivel AD/A/B/C', 'comentario', 'liberado'
    ]]);
  }
  grading.setFrozenRows(1);

  const control = getOrCreateSheet_('Control');
  control.clearContents();
  control.getRange(1, 1, 8, 2).setValues([
    ['configuración', 'valor'],
    ['EXAM_ID', EXAM_ID],
    ['versión', EXAM_VERSION],
    ['dominio', SCHOOL_DOMAIN],
    ['total interno', 20],
    ['máximo automático', 14],
    ['revisión docente o mixta', 6],
    ['estado', 'Backend V2 configurado']
  ]);
  control.setFrozenRows(1);

  const reports = getOrCreateSheet_('Reportes');
  if (reports.getLastRow() === 0) {
    reports.getRange(1, 1, 1, 8).setValues([[
      'submissionId', 'nombre', 'correo', 'nivel AD/A/B/C',
      'detallePreguntas', 'fortalezas', 'porMejorar', 'liberado'
    ]]);
  }
  reports.setFrozenRows(1);

  [responses, key, grading, control, reports].forEach(sheet => {
    styleHeader_(sheet);
    sheet.autoResizeColumns(1, sheet.getLastColumn());
  });
}

function authorizeGoogleIdentityVerification() {
  return UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=authorization-check',
    { muteHttpExceptions: true }
  ).getResponseCode();
}

function runTechnicalSelfTest() {
  validateConfiguration_();
  const payload = {
    submissionId: 'TEST-4S-V2-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss'),
    examId: EXAM_ID,
    examVersion: EXAM_VERSION,
    studentName: 'PRUEBA TÉCNICA 4S V2',
    studentEmail: 'prueba.tecnica@' + SCHOOL_DOMAIN,
    grade: '4.° Secundaria',
    section: 'TEST',
    screenExits: 0,
    finishedAt: new Date().toISOString(),
    q1: 'b',
    q2_receptor: '1', q2_sensorial: '2', q2_snc: '3', q2_motora: '4', q2_musculo: '5',
    q3_a: 'sensorial', q3_b: 'interneurona', q3_c: 'motora',
    q4_encefalo: 'integra', q4_medula: 'reflejos', q4_nervios: 'conducen', q4_receptores: 'detectan',
    q5: 'La homeostasis mantiene estable el medio interno mediante señales que detectan cambios y coordinan respuestas.',
    q6: 'b',
    q7: 'El receptor detecta el estímulo al inicio y el efector ejecuta la respuesta al final.',
    q8_a: 'mecanica', q8_b: 'luminosa', q8_c: 'termica', q8_d: 'electrica',
    q9_reposo_inicial: '1', q9_umbral: '2', q9_despolarizacion: '3',
    q9_repolarizacion: '4', q9_hiperpolarizacion: '5', q9_retorno: '6',
    q10: 'b', q11: 'b',
    q12: 'El estrés activa las suprarrenales, que liberan cortisol a la sangre. La hormona llega a células diana con receptores y produce una respuesta distribuida y sostenida.'
  };
  const sheet = getOrCreateSheet_(RESPONSES_SHEET);
  ensureHeaders_(sheet);
  const result = scoreAutomatic_(payload);
  sheet.appendRow(buildResponseRow_(payload, result));
  SpreadsheetApp.flush();
  return payload.submissionId;
}

function validateConfiguration_() {
  if (SPREADSHEET_ID.indexOf('__') === 0) throw new Error('Falta configurar el Google Sheets exclusivo de 4S V2.');
  if (GOOGLE_CLIENT_ID.indexOf('__') === 0) throw new Error('Falta configurar OAuth institucional.');
}

function validatePayload_(payload) {
  validateConfiguration_();
  if (!payload || payload.examId !== EXAM_ID) throw new Error('Examen no reconocido.');
  if (payload.examVersion !== EXAM_VERSION) throw new Error('Versión de examen no válida.');
  if (!payload.submissionId) throw new Error('Falta el identificador del envío.');
  if (!payload.answersComplete) throw new Error('El examen llegó incompleto.');
  return verifyGoogleIdentity_(payload.googleCredential || '');
}

function verifyGoogleIdentity_(credential) {
  if (!credential) throw new Error('Falta iniciar sesión con Google.');
  const response = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential),
    { muteHttpExceptions: true }
  );
  if (response.getResponseCode() !== 200) throw new Error('Google no pudo verificar la sesión.');

  const identity = JSON.parse(response.getContentText());
  const email = String(identity.email || '').trim().toLowerCase();
  const issuer = String(identity.iss || '');
  const verified = identity.email_verified === true || String(identity.email_verified) === 'true';
  const expiresAt = Number(identity.exp || 0);

  if (identity.aud !== GOOGLE_CLIENT_ID) throw new Error('La sesión pertenece a otra aplicación.');
  if (issuer !== 'accounts.google.com' && issuer !== 'https://accounts.google.com') throw new Error('Emisor de sesión no válido.');
  if (!verified) throw new Error('Google no confirmó el correo.');
  if (expiresAt <= Math.floor(Date.now() / 1000)) throw new Error('La sesión de Google expiró.');
  if (String(identity.hd || '').toLowerCase() !== SCHOOL_DOMAIN || !email.endsWith('@' + SCHOOL_DOMAIN)) {
    throw new Error('Debes usar el correo institucional del colegio.');
  }
  return identity;
}

function buildResponseRow_(payload, result) {
  return [
    payload.finishedAt || new Date().toISOString(), payload.submissionId,
    payload.examId, payload.examVersion || '', payload.studentName || '',
    payload.studentEmail || '', payload.grade || '', payload.section || '',
    Number(payload.screenExits || 0), result.points, result.max, 'PENDIENTE',
    payload.q1 || '', orderSummary_(payload, 'q2'),
    ['A: ' + value_(payload.q3_a), 'B: ' + value_(payload.q3_b), 'C: ' + value_(payload.q3_c)].join(' | '),
    ['Encéfalo: ' + value_(payload.q4_encefalo), 'Médula: ' + value_(payload.q4_medula), 'Nervios: ' + value_(payload.q4_nervios), 'Receptores: ' + value_(payload.q4_receptores)].join(' | '),
    payload.q5 || '', payload.q6 || '', payload.q7 || '',
    ['A: ' + value_(payload.q8_a), 'B: ' + value_(payload.q8_b), 'C: ' + value_(payload.q8_c), 'D: ' + value_(payload.q8_d)].join(' | '),
    orderSummary_(payload, 'q9'), payload.q10 || '', payload.q11 || '',
    payload.q12 || '', JSON.stringify(payload)
  ];
}

function scoreAutomatic_(data) {
  let points = 0;
  let max = 0;

  max += 1;
  if (data.q1 === 'b') points += 1;

  max += 2;
  const q2Correct = [
    correctNumber_(data.q2_receptor, 1), correctNumber_(data.q2_sensorial, 2),
    correctNumber_(data.q2_snc, 3), correctNumber_(data.q2_motora, 4),
    correctNumber_(data.q2_musculo, 5)
  ].reduce((sum, item) => sum + item, 0);
  points += q2Correct * (2 / 5);

  max += 1.5;
  if (data.q3_a === 'sensorial') points += 0.5;
  if (data.q3_b === 'interneurona') points += 0.5;
  if (data.q3_c === 'motora') points += 0.5;

  max += 2;
  if (data.q4_encefalo === 'integra') points += 0.5;
  if (data.q4_medula === 'reflejos') points += 0.5;
  if (data.q4_nervios === 'conducen') points += 0.5;
  if (data.q4_receptores === 'detectan') points += 0.5;

  max += 1;
  if (data.q6 === 'b') points += 1;

  max += 2;
  if (data.q8_a === 'mecanica') points += 0.5;
  if (data.q8_b === 'luminosa') points += 0.5;
  if (data.q8_c === 'termica') points += 0.5;
  if (data.q8_d === 'electrica') points += 0.5;

  max += 2;
  const q9Correct = [
    correctNumber_(data.q9_reposo_inicial, 1), correctNumber_(data.q9_umbral, 2),
    correctNumber_(data.q9_despolarizacion, 3), correctNumber_(data.q9_repolarizacion, 4),
    correctNumber_(data.q9_hiperpolarizacion, 5), correctNumber_(data.q9_retorno, 6)
  ].reduce((sum, item) => sum + item, 0);
  points += q9Correct * (2 / 6);

  max += 1.5;
  if (data.q10 === 'b') points += 1.5;

  max += 1;
  if (data.q11 === 'b') points += 1;

  return { points: round_(points), max: round_(max) };
}

function submissionStatus_(submissionId) {
  try {
    validateConfiguration_();
    if (!submissionId) return json_({ ok: false, found: false, error: 'Falta submissionId.' });
    const sheet = getOrCreateSheet_(RESPONSES_SHEET);
    ensureHeaders_(sheet);
    return json_({ ok: true, found: findSubmissionRow_(sheet, submissionId) > 0 });
  } catch (err) {
    return json_({ ok: false, found: false, error: String(err && err.message ? err.message : err) });
  }
}

function findSubmissionRow_(sheet, submissionId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const values = sheet.getRange(2, 2, lastRow - 1, 1).getDisplayValues();
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (values[index][0] === submissionId) return index + 2;
  }
  return -1;
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) throw new Error('No llegó información del examen.');
  return JSON.parse(e.postData.contents);
}

function getOrCreateSheet_(name) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function ensureHeaders_(sheet) {
  const currentWidth = Math.max(sheet.getLastColumn(), HEADERS.length);
  const current = sheet.getRange(1, 1, 1, currentWidth).getDisplayValues()[0].slice(0, HEADERS.length);
  if (current.join('|') !== HEADERS.join('|')) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function styleHeader_(sheet) {
  if (sheet.getLastColumn() < 1) return;
  sheet.getRange(1, 1, 1, sheet.getLastColumn())
    .setBackground('#eeeeee')
    .setFontWeight('bold')
    .setWrap(true);
}

function correctNumber_(value, expected) {
  return Number(value) === expected ? 1 : 0;
}

function round_(value) {
  return Math.round(value * 100) / 100;
}

function orderSummary_(payload, prefix) {
  return Object.keys(payload)
    .filter(key => key.indexOf(prefix + '_') === 0)
    .sort()
    .map(key => key + ': ' + payload[key])
    .join(' | ');
}

function value_(value) {
  return String(value || '').trim();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
