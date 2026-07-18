const SPREADSHEET_ID = '1J_zSUrgqXN0fg9H2ylyOpaXctvrxZpB6ewAutZwN9lQ';
const RESPONSES_SHEET = 'Respuestas oficial';
const EXAM_ID = '2S-U4-C2-OFICIAL-2026';
const EXAM_VERSION = '2026-07-16';
const GOOGLE_CLIENT_ID = '120108159327-6toqcr7bt3rljc8gfhtm7bonpnmueme3.apps.googleusercontent.com';
const SCHOOL_DOMAIN = 'colegiomilagrosdedios.edu.pe';
const ADMIN_EMAILS = ['jorge.fernandez@colegiomilagrosdedios.edu.pe'];
// El docente puede ajustar el puntaje y el comentario de las doce preguntas.
// Las preguntas automáticas actualizan ese subtotal; las abiertas o mixtas
// conservan el desglose de revisión docente.
const EDITABLE_REVIEW_QUESTIONS = {
  1: { scoreBucket: 'automatic' },
  2: { scoreBucket: 'automatic' },
  3: { scoreBucket: 'automatic' },
  4: { scoreBucket: 'teacher', maxTeacher: 1 },
  5: { scoreBucket: 'automatic' },
  6: { scoreBucket: 'teacher', maxTeacher: 2 },
  7: { scoreBucket: 'automatic' },
  8: { scoreBucket: 'automatic' },
  9: { scoreBucket: 'automatic' },
  10: { scoreBucket: 'teacher', maxTeacher: 1 },
  11: { scoreBucket: 'automatic' },
  12: { scoreBucket: 'teacher', maxTeacher: 2 }
};

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
  let payload = {};
  try {
    payload = parsePayload_(e);
    const action = String(payload.action || '').toLowerCase();
    if (action === 'requestreport') {
      return requestReport_(payload);
    }
    if (action === 'savereportreview') {
      return saveReportReview_(payload);
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
    const message = String(err && err.message ? err.message : err);
    const requestId = String(payload && payload.requestId || '').trim();
    if (/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) {
      CacheService.getScriptCache().put('report:' + requestId, JSON.stringify({ ok: false, error: message }), 300);
    }
    return json_({ ok: false, error: message });
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
    const detail = String(row[5] || '');
    cache.put(cacheKey, JSON.stringify({
      ok: true,
      status: 'ready',
      report: isAdmin ? prepareAdminReport_(report, detail) : report,
      admin: isAdmin
    }), 300);
  }
  return json_({ ok: true, accepted: true, requestId: requestId });
}

function saveReportReview_(payload) {
  if (!payload || payload.examId !== EXAM_ID) throw new Error('Examen no reconocido.');
  const requestId = String(payload.requestId || '').trim();
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) throw new Error('Identificador de actualización no válido.');

  const identity = verifyGoogleIdentity_(payload.googleCredential || '');
  const adminEmail = String(identity.email || '').trim().toLowerCase();
  if (ADMIN_EMAILS.indexOf(adminEmail) === -1) throw new Error('Esta cuenta no tiene permisos para editar calificaciones.');

  const targetEmail = String(payload.targetEmail || '').trim().toLowerCase();
  if (!targetEmail.endsWith('@' + SCHOOL_DOMAIN)) throw new Error('Correo de estudiante no válido.');
  const questionNumber = Number(payload.questionNumber);
  const reviewConfig = EDITABLE_REVIEW_QUESTIONS[questionNumber];
  if (!reviewConfig) throw new Error('Esta pregunta no admite revisión manual.');
  const requestedPoints = Number(payload.pointsEarned);
  if (!Number.isFinite(requestedPoints)) throw new Error('El puntaje no es válido.');
  const feedback = String(payload.feedback || '').trim();
  if (!feedback) throw new Error('Escribe un comentario para el estudiante.');
  if (feedback.length > 1200) throw new Error('El comentario es demasiado extenso.');

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const reportsSheet = getOrCreateSheet_('Reportes');
    const lastRow = reportsSheet.getLastRow();
    if (lastRow < 2) throw new Error('No existen reportes para actualizar.');
    const rows = reportsSheet.getRange(2, 1, lastRow - 1, 9).getDisplayValues();
    const relativeIndex = rows.findIndex(item => String(item[1] || '').trim().toLowerCase() === targetEmail);
    if (relativeIndex < 0) throw new Error('No se encontró el reporte del estudiante.');

    const sheetRow = relativeIndex + 2;
    const row = rows[relativeIndex];
    if (String(row[7] || '').trim().toUpperCase() !== 'SI') throw new Error('El reporte aún no está liberado.');
    const report = JSON.parse(String(row[8] || '{}'));
    const questions = Array.isArray(report.questions) ? report.questions : [];
    const question = questions.find(item => Number(item.number) === questionNumber);
    if (!question) throw new Error('No se encontró la pregunta en el reporte.');

    const breakdown = parseTeacherBreakdown_(String(row[5] || ''));
    const previousTeacherPoints = Number(breakdown[questionNumber] || 0);
    const previousQuestionPoints = Number(question.pointsEarned || 0);
    const previousAutomaticPoints = reviewConfig.scoreBucket === 'teacher'
      ? Math.max(0, previousQuestionPoints - previousTeacherPoints)
      : previousQuestionPoints;
    const maximumPoints = Number(question.pointsMax || 0);
    const roundedPoints = Math.round(requestedPoints * 100) / 100;
    if (roundedPoints < 0 || roundedPoints > maximumPoints) {
      throw new Error('El puntaje debe estar entre 0 y ' + maximumPoints + '.');
    }

    let automaticDelta = roundedPoints - previousQuestionPoints;
    if (reviewConfig.scoreBucket === 'teacher') {
      const newTeacherPoints = Math.max(0, Math.min(Number(reviewConfig.maxTeacher || 0), roundedPoints - previousAutomaticPoints));
      const newAutomaticPoints = roundedPoints - newTeacherPoints;
      breakdown[questionNumber] = Math.round(newTeacherPoints * 100) / 100;
      automaticDelta = newAutomaticPoints - previousAutomaticPoints;
    }
    question.pointsEarned = roundedPoints;
    question.feedback = feedback;
    question.status = reviewStatus_(roundedPoints, maximumPoints, question.studentAnswer);

    const previousAutomaticScore = Number(report.score && report.score.automatic || 0);
    const automaticScore = Math.round(Math.max(0, Math.min(14, previousAutomaticScore + automaticDelta)) * 100) / 100;
    const teacherScore = [4, 6, 10, 12].reduce((sum, number) => sum + Number(breakdown[number] || 0), 0);
    const roundedTeacher = Math.round(Math.max(0, Math.min(6, teacherScore)) * 100) / 100;
    const total = Math.round(Math.max(0, Math.min(20, automaticScore + roundedTeacher)) * 100) / 100;
    const level = levelFromScore_(total);
    report.score = { automatic: automaticScore, teacher: roundedTeacher, total: total, level: level };
    report.reviewedAt = new Date().toISOString();

    const detail = buildTeacherDetail_(report, breakdown);
    reportsSheet.getRange(sheetRow, 4, 1, 6).setValues([[
      total, level, detail, report.comment || '', 'SI', JSON.stringify(report)
    ]]);

    const grading = getOrCreateSheet_('Calificacion oficial');
    const gradingLastRow = grading.getLastRow();
    if (gradingLastRow >= 2) {
      const gradingRows = grading.getRange(2, 1, gradingLastRow - 1, 2).getDisplayValues();
      const gradingIndex = gradingRows.findIndex(item =>
        String(item[0] || '').trim() === String(report.submissionId || row[0] || '').trim() ||
        String(item[1] || '').trim().toLowerCase() === targetEmail
      );
      if (gradingIndex >= 0) {
        const gradingRow = gradingIndex + 2;
        grading.getRange(gradingRow, 4, 1, 4).setValues([[automaticScore, roundedTeacher, total, level]]);
        grading.getRange(gradingRow, 9, 1, 3).setValues([['SI', 'SI', report.reviewedAt]]);
      }
    }
    SpreadsheetApp.flush();

    const prepared = prepareAdminReport_(report, detail);
    CacheService.getScriptCache().put('report:' + requestId, JSON.stringify({
      ok: true,
      status: 'ready',
      report: prepared,
      admin: true,
      saved: true,
      savedQuestion: questionNumber
    }), 300);
    return json_({ ok: true, accepted: true, requestId: requestId });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function parseTeacherBreakdown_(detail) {
  const result = { 4: 0, 6: 0, 10: 0, 12: 0 };
  [4, 6, 10, 12].forEach(number => {
    const match = String(detail || '').match(new RegExp('P' + number + '\\s+([0-9]+(?:\\.[0-9]+)?)/'));
    if (match) result[number] = Number(match[1] || 0);
  });
  return result;
}

function buildTeacherDetail_(report, breakdown) {
  const automatic = Number(report.score && report.score.automatic || 0);
  const teacher = Number(report.score && report.score.teacher || 0);
  return [
    'Automático ' + automatic + '/14',
    'Docente ' + teacher + '/6',
    'P4 ' + Number(breakdown[4] || 0) + '/1',
    'P6 ' + Number(breakdown[6] || 0) + '/2',
    'P10 ' + Number(breakdown[10] || 0) + '/1',
    'P12 ' + Number(breakdown[12] || 0) + '/2'
  ].join(' · ');
}

function prepareAdminReport_(report, detail) {
  const safeReport = JSON.parse(JSON.stringify(report || {}));
  const breakdown = parseTeacherBreakdown_(detail);
  (safeReport.questions || []).forEach(question => {
    const number = Number(question.number);
    if (!EDITABLE_REVIEW_QUESTIONS[number]) return;
    question.adminEditable = true;
    const reviewConfig = EDITABLE_REVIEW_QUESTIONS[number];
    question.minimumPoints = 0;
  });
  return safeReport;
}

function reviewStatus_(points, maximum, studentAnswer) {
  if (points <= 0) {
    const answer = String(studentAnswer || '').trim();
    return !answer || answer === '.' ? 'unanswered' : 'incorrect';
  }
  if (points >= maximum) return 'correct';
  return 'partial';
}

function levelFromScore_(value) {
  const score = Math.max(0, Math.min(20, Number(value) || 0));
  if (score < 12) return 'B';
  if (score < 17) return 'A';
  return 'AD';
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
