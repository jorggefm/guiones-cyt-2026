const SPREADSHEET_ID = '1NFZXNfXq1qfyXv4ihx49yIzN5ZcCN1WObLcookO5bK4';
const RESPONSES_SHEET = 'Respuestas oficial';
const EXAM_ID = '4S-U4-C2-OFICIAL-2026';
const EXAM_VERSION = '2026-07-16';
const GOOGLE_CLIENT_ID = '120108159327-6toqcr7bt3rljc8gfhtm7bonpnmueme3.apps.googleusercontent.com';
const SCHOOL_DOMAIN = 'colegiomilagrosdedios.edu.pe';

const HEADERS = [
  'timestamp', 'submissionId', 'examId', 'version', 'nombre', 'correo',
  'grado', 'seccion', 'salidasPantalla', 'puntajeAutomatico',
  'maximoAutomatico', 'revisionDocente', 'q1_respuesta_rapida',
  'q2_secuencia_comunicacion', 'q3_neurona', 'q4_estructura_funcion',
  'q5_interneurona', 'q6_sinapsis', 'q7_comparacion_sistemas',
  'q8_glandulas', 'q9_ruta_hormonal', 'q10_potencial_reposo',
  'q11_potencial_accion', 'q12_glucosa_insulina', 'respuestas_json'
];

const KEY_ROWS = [
  ['1', 'Alternativa contextualizada', 'Sistema nervioso: respuesta rápida y localizada', 'b', 'Distingue coordinación nerviosa y endocrina por velocidad y precisión.', 1, 'Automática'],
  ['2', 'Ordenamiento', 'Estímulo → receptor → coordinador → señal → efector → respuesta', 'Coincidencia de seis posiciones', 'Reconstruye la ruta general de comunicación corporal.', 2, 'Automática'],
  ['3', 'Imagen con flechas', 'A: dendritas; B: soma; D: terminales axónicas', 'Coincidencia de tres estructuras', 'La letra C no se evalúa porque señala mielina, concepto fuera de las fichas entregadas.', 1.5, 'Automática'],
  ['4', 'Relación estructura-función', 'Dendritas reciben; soma mantiene; axón conduce; terminales liberan neurotransmisores', 'Coincidencia de cuatro relaciones', 'Evalúa el recorrido funcional de la información en la neurona.', 2, 'Automática'],
  ['5', 'Vocabulario científico tolerante', 'Conecta neuronas dentro del SNC e integra o procesa información', 'Respuesta abierta', 'Aceptar redacciones equivalentes con conexión e integración de información.', 1.5, 'Docente'],
  ['6', 'Imagen interpretativa', 'Terminal presináptica → célula postsináptica', 'b', 'Interpreta el sentido de liberación de neurotransmisores.', 1, 'Automática'],
  ['7', 'Comparación', 'Nervioso: rápido, neuronas, breve. Endocrino: lento, sangre, sostenido', 'Respuesta abierta', 'Debe comparar velocidad, transporte y duración.', 2, 'Docente'],
  ['8', 'Imagen con flechas', 'A: hipófisis; B: tiroides; C: páncreas; D: suprarrenales', 'Coincidencia de cuatro glándulas', 'Identifica glándulas trabajadas en las fichas.', 2, 'Automática'],
  ['9', 'Ordenamiento', 'Estímulo → glándula → hormona → sangre → célula diana → respuesta', 'Coincidencia de seis posiciones', 'Reconstruye la ruta de señalización endocrina.', 2, 'Automática'],
  ['10', 'Respuesta causal', 'Gradientes de Na+/K+, proteínas negativas y bomba Na+/K+', 'b', 'Explica la polaridad de la membrana en reposo.', 1.5, 'Automática'],
  ['11', 'Imagen interpretativa', 'B: entrada de Na+ y voltaje máximo', 'b', 'Relaciona flujo iónico con la curva del potencial de acción.', 1, 'Automática'],
  ['12', 'Integración', 'Páncreas → insulina → sangre → células diana → regulación de glucosa', 'Respuesta abierta', 'Evaluar la cadena causal completa y el vocabulario científico.', 2.5, 'Mixta']
];

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'health').toLowerCase();
  if (action === 'status') return submissionStatus_(e.parameter.submissionId || '');
  return json_({
    ok: true,
    examId: EXAM_ID,
    version: EXAM_VERSION,
    message: 'Endpoint activo para el examen oficial 4S U4 C2.'
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
    const existingRow = findSubmissionRow_(sheet, payload.submissionId);
    if (existingRow > 0) {
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
    grading.getRange(1, 1, 1, 11).setValues([[
      'submissionId', 'correo', 'nombre', 'puntajeAutomatico',
      'puntajeDocente', 'puntajeFinal', 'nivel AD/A/B/C', 'comentario',
      'revisado', 'liberado', 'fechaRevision'
    ]]);
  }
  grading.setFrozenRows(1);

  const control = getOrCreateSheet_('Control');
  control.clearContents();
  control.getRange(1, 1, 6, 2).setValues([
    ['clave', 'valor'],
    ['REPORTES_ACTIVOS', 'NO'],
    ['EXAM_ID', EXAM_ID],
    ['VERSION', EXAM_VERSION],
    ['DOMINIO', SCHOOL_DOMAIN],
    ['PUNTAJE_TOTAL_INTERNO', 20]
  ]);
  control.setFrozenRows(1);

  const reports = getOrCreateSheet_('Reportes');
  if (reports.getLastRow() === 0) {
    reports.getRange(1, 1, 1, 8).setValues([[
      'submissionId', 'correo', 'nombre', 'puntajeFinal',
      'nivel AD/A/B/C', 'detallePreguntas', 'comentario', 'liberado'
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
    submissionId: 'TEST-4S-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss'),
    examId: EXAM_ID,
    examVersion: EXAM_VERSION,
    studentName: 'PRUEBA TÉCNICA 4S',
    studentEmail: 'prueba.tecnica@' + SCHOOL_DOMAIN,
    grade: '4.° Secundaria',
    section: 'TEST',
    screenExits: 0,
    finishedAt: new Date().toISOString(),
    q1: 'b',
    q2_estimulo: '1', q2_receptor: '2', q2_coordinador: '3',
    q2_senal: '4', q2_efector: '5', q2_respuesta: '6',
    q3_a: 'dendritas', q3_b: 'soma', q3_d: 'terminales',
    q4_dendritas: 'reciben', q4_soma: 'mantiene', q4_axon: 'conduce', q4_terminales: 'liberan',
    q5: 'Conecta neuronas dentro del sistema nervioso central e integra información.',
    q6: 'b',
    q7: 'El sistema nervioso es rápido y usa neuronas; el endocrino es más lento y usa hormonas en sangre.',
    q8_a: 'hipofisis', q8_b: 'tiroides', q8_c: 'pancreas', q8_d: 'suprarrenales',
    q9_estimulo: '1', q9_glandula: '2', q9_hormona: '3',
    q9_sangre: '4', q9_celula: '5', q9_respuesta: '6',
    q10: 'b', q11: 'b',
    q12: 'El páncreas libera insulina, que viaja por la sangre y actúa sobre células diana para regular la glucosa.'
  };
  const sheet = getOrCreateSheet_(RESPONSES_SHEET);
  ensureHeaders_(sheet);
  const result = scoreAutomatic_(payload);
  sheet.appendRow(buildResponseRow_(payload, result));
  SpreadsheetApp.flush();
  return payload.submissionId;
}

function validateConfiguration_() {
  if (SPREADSHEET_ID.indexOf('__') === 0) throw new Error('Falta configurar el Google Sheets exclusivo de 4S.');
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
    ['A: ' + value_(payload.q3_a), 'B: ' + value_(payload.q3_b), 'D: ' + value_(payload.q3_d)].join(' | '),
    ['Dendritas: ' + value_(payload.q4_dendritas), 'Soma: ' + value_(payload.q4_soma), 'Axón: ' + value_(payload.q4_axon), 'Terminales: ' + value_(payload.q4_terminales)].join(' | '),
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
    correctNumber_(data.q2_estimulo, 1), correctNumber_(data.q2_receptor, 2),
    correctNumber_(data.q2_coordinador, 3), correctNumber_(data.q2_senal, 4),
    correctNumber_(data.q2_efector, 5), correctNumber_(data.q2_respuesta, 6)
  ].reduce((sum, item) => sum + item, 0);
  points += q2Correct * (2 / 6);

  max += 1.5;
  if (data.q3_a === 'dendritas') points += 0.5;
  if (data.q3_b === 'soma') points += 0.5;
  if (data.q3_d === 'terminales') points += 0.5;

  max += 2;
  if (data.q4_dendritas === 'reciben') points += 0.5;
  if (data.q4_soma === 'mantiene') points += 0.5;
  if (data.q4_axon === 'conduce') points += 0.5;
  if (data.q4_terminales === 'liberan') points += 0.5;

  max += 1;
  if (data.q6 === 'b') points += 1;

  max += 2;
  if (data.q8_a === 'hipofisis') points += 0.5;
  if (data.q8_b === 'tiroides') points += 0.5;
  if (data.q8_c === 'pancreas') points += 0.5;
  if (data.q8_d === 'suprarrenales') points += 0.5;

  max += 2;
  const q9Correct = [
    correctNumber_(data.q9_estimulo, 1), correctNumber_(data.q9_glandula, 2),
    correctNumber_(data.q9_hormona, 3), correctNumber_(data.q9_sangre, 4),
    correctNumber_(data.q9_celula, 5), correctNumber_(data.q9_respuesta, 6)
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
