const SPREADSHEET_ID = '1J_zSUrgqXN0fg9H2ylyOpaXctvrxZpB6ewAutZwN9lQ';
const RESPONSES_SHEET = 'Respuestas oficial';
const EXAM_ID = '2S-U4-C2-OFICIAL-2026';
const EXAM_VERSION = '2026-07-16';
const GOOGLE_CLIENT_ID = '120108159327-6toqcr7bt3rljc8gfhtm7bonpnmueme3.apps.googleusercontent.com';
const SCHOOL_DOMAIN = 'colegiomilagrosdedios.edu.pe';
const ADMIN_EMAILS = ['jorge.fernandez@colegiomilagrosdedios.edu.pe'];

const HEADERS = [
  'timestamp',
  'submissionId',
  'examId',
  'version',
  'nombre',
  'correo',
  'grado',
  'seccion',
  'salidasPantalla',
  'puntajeAutomatico',
  'maximoAutomatico',
  'revisionDocente',
  'q1_implantacion',
  'q2_orden',
  'q3_blastocisto',
  'q4_implantacion_imagen',
  'q5_capas',
  'q6_desarrollo',
  'q7_ectodermo',
  'q8_organogenesis',
  'q9_neurulacion',
  'q10_soporte_temprano',
  'q11_tubo_neural',
  'q12_integradora',
  'respuestas_json'
];

const KEY_ROWS = [
  ['1', 'Alternativa', 'Implantación', 'b', 'La implantación permite que el blastocisto se adhiera e introduzca en el endometrio.', 1, 'Automática'],
  ['2', 'Ordenamiento', 'Disco bilaminar → gastrulación → tubo neural → organogénesis → etapa fetal', 'bilaminar=1; gastrulación=2; tubo=3; organogénesis=4; fetal=5', 'Orden temporal desde la organización inicial hasta el crecimiento fetal.', 2, 'Automática'],
  ['3', 'Imagen y vocabulario', 'A: trofoblasto; B: masa celular interna; C: blastocele; futura placenta: A', 'Sinónimos científicos aceptados', 'La capa externa interviene en implantación y placenta; la masa interna forma el embrión.', 2, 'Automática'],
  ['4', 'Imagen y explicación', 'A: trofoblasto; permite anclaje e inicio del intercambio con la madre', 'Estructura automática; explicación docente', 'Debe relacionar trofoblasto, endometrio, anclaje y soporte/intercambio.', 1.5, 'Mixta'],
  ['5', 'Relacionar', 'Ectodermo: sistema nervioso y piel; mesodermo: músculos, huesos y sangre; endodermo: revestimiento digestivo y respiratorio', 'Coincidencia exacta de relaciones', 'Cada capa origina grupos de tejidos diferentes.', 2, 'Automática'],
  ['6', 'Explicación', 'El blastocisto debe implantarse en el endometrio para recibir soporte, protección e intercambio inicial.', 'Respuesta abierta', 'Evaluar relación causal y vocabulario científico, no coincidencia literal.', 2, 'Docente'],
  ['7', 'Imagen y vocabulario', 'A: ectodermo; estructura posterior: tubo neural', 'Aceptar tubo neural/tubo neuronal y errores leves', 'El ectodermo origina el sistema nervioso; durante la neurulación forma el tubo neural.', 1.5, 'Automática'],
  ['8', 'Vocabulario', 'Organogénesis', 'Aceptar errores ortográficos leves y formación de órganos', 'Es el proceso de formación inicial de órganos y sistemas.', 1, 'Automática'],
  ['9', 'Secuencia visual', 'Formación de la placa y los pliegues neurales', 'b', 'La imagen 2 representa la neurulación inicial previa al cierre del tubo.', 1.5, 'Automática'],
  ['10', 'Comparación visual', 'B: saco vitelino; C: cordón/tallo de conexión', 'Identificación automática; diferencia docente', 'El saco vitelino brinda apoyo temprano; el tallo conecta con la zona placentaria.', 2, 'Mixta'],
  ['11', 'Caso visual', 'Espina bífida', 'b', 'La espina bífida se relaciona con cierre incompleto del tubo neural.', 1.5, 'Automática'],
  ['12', 'Integración', 'Capas embrionarias → neurulación/tubo neural → organogénesis → etapa fetal', 'Respuesta abierta', 'Evaluar secuencia, relaciones y al menos tres términos científicos pertinentes.', 2, 'Docente']
];

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'health').toLowerCase();
  if (action === 'status') return submissionStatus_(e.parameter.submissionId || '');
  if (action === 'report') return reportStatus_(e.parameter.requestId || '');
  return json_({
    ok: true,
    examId: EXAM_ID,
    version: EXAM_VERSION,
    message: 'Endpoint activo para el examen oficial 2S U4 C2.'
  });
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    if (String(payload.action || '').toLowerCase() === 'requestreport') {
      return requestReport_(payload);
    }

    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(15000);
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
    } finally {
      try { lock.releaseLock(); } catch (_) {}
    }
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function requestReport_(payload) {
  if (!payload || payload.examId !== EXAM_ID) throw new Error('Examen no reconocido.');
  const requestId = String(payload.requestId || '').trim();
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) throw new Error('Identificador de consulta no válido.');

  const identity = verifyGoogleIdentity_(payload.googleCredential || '');
  const email = String(identity.email || '').trim().toLowerCase();
  const isAdmin = ADMIN_EMAILS.indexOf(email) !== -1;
  const targetEmail = String(payload.targetEmail || '').trim().toLowerCase();
  const cache = CacheService.getScriptCache();
  const cacheKey = 'report:' + requestId;

  if (!reportsEnabled_()) {
    cache.put(cacheKey, JSON.stringify({ ok: true, status: 'disabled' }), 300);
    return json_({ ok: true, accepted: true, requestId: requestId });
  }

  const sheet = getOrCreateSheet_('Reportes');
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    cache.put(cacheKey, JSON.stringify({ ok: true, status: 'not_found' }), 300);
    return json_({ ok: true, accepted: true, requestId: requestId });
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, 9).getDisplayValues();
  if (isAdmin && !targetEmail) {
    const reports = rows
      .filter(item => String(item[7] || '').trim().toUpperCase() === 'SI')
      .filter(item => String(item[1] || '').trim().toLowerCase() !== email)
      .map(item => {
        let section = '';
        try { section = String(JSON.parse(String(item[8] || '{}')).section || ''); } catch (_) {}
        return {
          email: String(item[1] || '').trim().toLowerCase(),
          name: String(item[2] || '').trim(),
          section: section,
          total: Number(item[3] || 0),
          level: String(item[4] || '').trim()
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    cache.put(cacheKey, JSON.stringify({ ok: true, status: 'admin_index', reports: reports }), 300);
    return json_({ ok: true, accepted: true, requestId: requestId });
  }

  const lookupEmail = isAdmin && targetEmail ? targetEmail : email;
  const row = rows.find(item => String(item[1] || '').trim().toLowerCase() === lookupEmail);
  if (!row) {
    cache.put(cacheKey, JSON.stringify({ ok: true, status: 'not_found' }), 300);
  } else if (String(row[7] || '').trim().toUpperCase() !== 'SI') {
    cache.put(cacheKey, JSON.stringify({ ok: true, status: 'pending', message: 'La revisión docente todavía no ha sido liberada.' }), 300);
  } else {
    const report = JSON.parse(String(row[8] || '{}'));
    if (!report.studentEmail || String(report.studentEmail).trim().toLowerCase() !== lookupEmail) {
      throw new Error('El reporte no coincide con la identidad verificada.');
    }
    cache.put(cacheKey, JSON.stringify({ ok: true, status: 'ready', report: report, admin: isAdmin }), 300);
  }
  return json_({ ok: true, accepted: true, requestId: requestId });
}

function reportStatus_(requestId) {
  const cleanId = String(requestId || '').trim();
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(cleanId)) return json_({ ok: false, error: 'Consulta no válida.' });
  const value = CacheService.getScriptCache().get('report:' + cleanId);
  if (!value) return json_({ ok: true, pendingRequest: true });
  return json_(JSON.parse(value));
}

function reportsEnabled_() {
  const sheet = getOrCreateSheet_('Control');
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  const values = sheet.getRange(2, 1, lastRow - 1, 2).getDisplayValues();
  const row = values.find(item => String(item[0] || '').trim().toUpperCase() === 'REPORTES_ACTIVOS');
  return !!row && String(row[1] || '').trim().toUpperCase() === 'SI';
}

function setupExamWorkbook() {
  const responses = getOrCreateSheet_(RESPONSES_SHEET);
  ensureHeaders_(responses);
  responses.setFrozenRows(1);

  const key = getOrCreateSheet_('Clave oficial');
  key.clearContents();
  key.getRange(1, 1, 1, 7).setValues([[
    'pregunta', 'tipo', 'respuestaIdeal', 'criterioAutomatico', 'explicacion', 'puntajeMaximo', 'revision'
  ]]);
  key.getRange(2, 1, KEY_ROWS.length, KEY_ROWS[0].length).setValues(KEY_ROWS);
  key.setFrozenRows(1);

  const grading = getOrCreateSheet_('Calificacion oficial');
  if (grading.getLastRow() === 0) {
    grading.getRange(1, 1, 1, 11).setValues([[
      'submissionId', 'correo', 'nombre', 'puntajeAutomatico', 'puntajeDocente', 'puntajeFinal', 'nivel', 'comentario', 'revisado', 'liberado', 'fechaRevision'
    ]]);
  }
  grading.setFrozenRows(1);

  const control = getOrCreateSheet_('Control');
  control.clearContents();
  control.getRange(1, 1, 4, 2).setValues([
    ['clave', 'valor'],
    ['REPORTES_ACTIVOS', 'NO'],
    ['EXAM_ID', EXAM_ID],
    ['VERSION', EXAM_VERSION]
  ]);
  control.setFrozenRows(1);

  const reports = getOrCreateSheet_('Reportes');
  if (reports.getLastRow() === 0) {
    reports.getRange(1, 1, 1, 9).setValues([[
      'submissionId', 'correo', 'nombre', 'puntajeFinal', 'nivel', 'detallePreguntas', 'comentario', 'liberado', 'reporte_json'
    ]]);
  }
  reports.setFrozenRows(1);

  [responses, key, grading, control, reports].forEach(sheet => {
    sheet.autoResizeColumns(1, sheet.getLastColumn());
  });
}

function validatePayload_(payload) {
  if (!payload || payload.examId !== EXAM_ID) throw new Error('Examen no reconocido.');
  if (!payload.submissionId) throw new Error('Falta el identificador del envío.');
  return verifyGoogleIdentity_(payload.googleCredential || '');
}

function verifyGoogleIdentity_(credential) {
  if (!credential) throw new Error('Falta iniciar sesión con Google.');
  if (GOOGLE_CLIENT_ID.indexOf('__') === 0) throw new Error('OAuth institucional aún no configurado.');

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

function authorizeGoogleIdentityVerification() {
  return UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=authorization-check',
    { muteHttpExceptions: true }
  ).getResponseCode();
}

function buildResponseRow_(payload, result) {
  return [
    payload.finishedAt || new Date().toISOString(),
    payload.submissionId,
    payload.examId,
    payload.examVersion || '',
    payload.studentName || '',
    payload.studentEmail || '',
    payload.grade || '',
    payload.section || '',
    Number(payload.screenExits || 0),
    result.points,
    result.max,
    'PENDIENTE',
    payload.q1 || '',
    orderSummary_(payload, 'q2'),
    ['A: ' + value_(payload.q3_a), 'B: ' + value_(payload.q3_b), 'C: ' + value_(payload.q3_c), 'Placenta: ' + value_(payload.q3_placenta)].join(' | '),
    ['A: ' + value_(payload.q4_a), 'Explica: ' + value_(payload.q4_why)].join(' | '),
    ['Ectodermo: ' + value_(payload.q5_ecto), 'Mesodermo: ' + value_(payload.q5_meso), 'Endodermo: ' + value_(payload.q5_endo)].join(' | '),
    payload.q6 || '',
    ['Capa: ' + value_(payload.q7_layer), 'Estructura: ' + value_(payload.q7_structure)].join(' | '),
    payload.q8 || '',
    payload.q9 || '',
    ['B: ' + value_(payload.q10_b), 'C: ' + value_(payload.q10_c), 'Diferencia: ' + value_(payload.q10_diff)].join(' | '),
    payload.q11 || '',
    payload.q12 || '',
    JSON.stringify(payload)
  ];
}

function scoreAutomatic_(data) {
  let points = 0;
  let max = 0;

  max += 1;
  if (data.q1 === 'b') points += 1;

  max += 2;
  const q2Correct = [
    correctNumber_(data.q2_bilaminar, 1),
    correctNumber_(data.q2_gastrulacion, 2),
    correctNumber_(data.q2_tubo, 3),
    correctNumber_(data.q2_organogenesis, 4),
    correctNumber_(data.q2_fetal, 5)
  ].reduce((sum, item) => sum + item, 0);
  points += q2Correct * 0.4;

  max += 2;
  points += accepted_(data.q3_a, ['trofoblasto', 'trofoblast']) ? 0.5 : 0;
  points += accepted_(data.q3_b, ['masa celular interna', 'embrioblasto']) ? 0.5 : 0;
  points += accepted_(data.q3_c, ['blastocele', 'cavidad del blastocisto', 'cavidad blastocistica']) ? 0.5 : 0;
  points += String(data.q3_placenta || '').toUpperCase() === 'A' ? 0.5 : 0;

  max += 0.5;
  if (data.q4_a === 'trofoblasto') points += 0.5;

  max += 2;
  if (data.q5_ecto === 'nervioso_piel') points += 2 / 3;
  if (data.q5_meso === 'musculo_hueso_sangre') points += 2 / 3;
  if (data.q5_endo === 'digestivo_respiratorio') points += 2 / 3;

  max += 1.5;
  if (data.q7_layer === 'ectodermo') points += 0.75;
  if (accepted_(data.q7_structure, ['tubo neural', 'tubo neuronal'])) points += 0.75;

  max += 1;
  if (accepted_(data.q8, ['organogenesis', 'formacion de organos'], 0.78)) points += 1;

  max += 1.5;
  if (data.q9 === 'b') points += 1.5;

  max += 1;
  if (data.q10_b === 'saco_vitelino') points += 0.5;
  if (data.q10_c === 'cordon') points += 0.5;

  max += 1.5;
  if (data.q11 === 'b') points += 1.5;

  return { points: Math.round(points * 100) / 100, max: Math.round(max * 100) / 100 };
}

function submissionStatus_(submissionId) {
  if (!submissionId) return json_({ ok: false, found: false, error: 'Falta submissionId.' });
  const sheet = getOrCreateSheet_(RESPONSES_SHEET);
  ensureHeaders_(sheet);
  return json_({ ok: true, found: findSubmissionRow_(sheet, submissionId) > 0 });
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

function accepted_(value, candidates, threshold) {
  const actual = normalize_(value);
  if (!actual) return false;
  const limit = threshold || 0.82;
  return candidates.some(candidate => {
    const expected = normalize_(candidate);
    return actual.indexOf(expected) !== -1 || expected.indexOf(actual) !== -1 || similarity_(actual, expected) >= limit;
  });
}

function similarity_(a, b) {
  const longest = Math.max(a.length, b.length);
  if (!longest) return 1;
  return 1 - levenshtein_(a, b) / longest;
}

function levenshtein_(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i += 1) matrix[i] = [i];
  for (let j = 0; j <= a.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
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

function correctNumber_(value, expected) {
  return Number(value) === expected ? 1 : 0;
}

function normalize_(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
