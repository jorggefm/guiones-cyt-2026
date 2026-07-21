/**
 * Rezagada.gs — Examen de recuperación 2S U4 C2
 * =============================================
 * Archivo NUEVO. Se agrega al mismo proyecto de Apps Script, junto a Codigo.gs.
 * No reemplaza nada. Todo va prefijado con REZ_ para no chocar con los globales
 * del examen oficial.
 *
 * Comparte: SPREADSHEET_ID, GOOGLE_CLIENT_ID, SCHOOL_DOMAIN, ADMIN_EMAILS,
 * EDITABLE_REVIEW_QUESTIONS y los helpers de Codigo.gs (accepted_, normalize_,
 * levelFromScore_, reviewStatus_, getOrCreateSheet_, json_, verifyGoogleIdentity_).
 *
 * Estructura idéntica al oficial: 12 preguntas, 14 pts automáticos + 6 docentes.
 * Preguntas docentes: 4 (1pt), 6 (2pts), 10 (1pt), 12 (2pts).
 */

const REZ_EXAM_ID = '2S-U4-C2-REZAGADA-2026';
const REZ_EXAM_VERSION = '2026-07-21';
const REZ_RESPONSES_SHEET = 'Respuestas rezagada';

const REZ_HEADERS = [
  'timestamp', 'submissionId', 'examId', 'version', 'nombre', 'correo',
  'grado', 'seccion', 'salidasPantalla', 'puntajeAutomatico', 'maximoAutomatico',
  'revisionDocente',
  'q1_implantacion', 'q2_cronologia', 'q3_blastocisto', 'q4_evidencia',
  'q5_capas', 'q6_gastrulacion', 'q7_mesodermo', 'q8_neurulacion',
  'q9_cierre_tubo', 'q10_soporte', 'q11_comparacion', 'q12_integradora',
  'respuestas_json'
];

/** Derivados válidos del mesodermo para la Q7 (acepta cualquier par distinto). */
const REZ_MESODERMO = [
  ['musculos', 'musculo', 'tejido muscular'],
  ['huesos', 'hueso', 'esqueleto', 'tejido oseo'],
  ['sangre', 'tejido sanguineo', 'celulas sanguineas'],
  ['corazon', 'sistema circulatorio'],
  ['riñones', 'rinones', 'riñon', 'sistema urinario'],
  ['dermis', 'piel profunda']
];

const REZ_KEY_ROWS = [
  ['1', 'Alternativa', 'Implantación', 'b', 'La implantación permite que el blastocisto se adhiera e introduzca en el endometrio.', 1, 'Automática'],
  ['2', 'Ordenamiento', 'Fecundación → mórula → blastocisto → implantación → gastrulación', 'fecundación=1; mórula=2; blastocisto=3; implantación=4; gastrulación=5', 'Secuencia cronológica desde la fecundación hasta la formación de las tres capas.', 2, 'Automática'],
  ['3', 'Lectura de imagen', 'A: trofoblasto (implantación y placenta); B: masa celular interna (forma el embrión); C: blastocele (cavidad interna)', 'Relación exacta letra–función', 'Cada región del blastocisto cumple una función distinta en el desarrollo temprano.', 2, 'Automática'],
  ['4', 'Interpretación de imagen', 'El trofoblasto está adherido y penetrando el endometrio; permite el anclaje y el inicio del soporte e intercambio con la madre.', 'Estructura automática; explicación docente', 'Debe reconocer la penetración del trofoblasto y explicar por qué el anclaje es necesario.', 1.5, 'Mixta'],
  ['5', 'Relacionar', 'Ectodermo: encéfalo, médula espinal y epidermis; mesodermo: músculos, huesos, corazón y sangre; endodermo: revestimiento digestivo y respiratorio', 'Coincidencia exacta de relaciones', 'Cada capa embrionaria origina grupos de órganos y tejidos diferentes.', 2, 'Automática'],
  ['6', 'Explicación', 'Durante la gastrulación aparecen las tres capas embrionarias, y cada una origina distintos tejidos y órganos durante la organogénesis.', 'Respuesta abierta', 'Evaluar la relación causal entre formación de capas y diferenciación posterior.', 2, 'Docente'],
  ['7', 'Lectura de imagen', 'B es el mesodermo. Dos derivados entre: músculos, huesos, sangre, corazón, riñones o dermis.', 'Capa exacta; dos derivados distintos con tolerancia ortográfica', 'El mesodermo es la capa media y origina tejidos de sostén, movimiento y circulación.', 1.5, 'Automática'],
  ['8', 'Vocabulario', 'Neurulación', 'Aceptar errores ortográficos leves que permitan reconocer el término', 'Es el proceso por el que el ectodermo forma la placa, los pliegues y el tubo neural.', 1, 'Automática'],
  ['9', 'Secuencia visual', 'Los pliegues neurales se aproximan y se fusionan', 'b', 'Entre las imágenes 2 y 3 los pliegues se elevan y fusionan, cerrando el tubo neural.', 1.5, 'Automática'],
  ['10', 'Comparación visual', 'A: embrión; D: placenta; se relacionan por C, el cordón umbilical', 'Identificación automática; relación docente', 'El cordón umbilical conecta al embrión con la placenta y permite el transporte de sustancias.', 2, 'Mixta'],
  ['11', 'Caso visual', 'En A el tubo neural está cerrado normalmente; en B el cierre es incompleto', 'a', 'El cierre incompleto del tubo neural se asocia a defectos como la espina bífida.', 1.5, 'Automática'],
  ['12', 'Integración', 'La gastrulación ocurrió bien (tres capas); el problema fue la neurulación; se afecta el sistema nervioso.', 'Respuesta abierta', 'Evaluar que distinga proceso logrado, proceso fallido y sistema afectado.', 2, 'Docente']
];

/** Enunciados, para que el reporte los muestre junto a la respuesta de la alumna. */
const REZ_PROMPTS = {
  1: 'Un blastocisto se fija al endometrio y comienza a establecer contacto con el tejido materno. ¿Qué proceso está ocurriendo?',
  2: 'Ordena cronológicamente: fecundación, mórula, blastocisto, implantación y gastrulación.',
  3: 'Observa A, B y C en el blastocisto. Relaciona cada letra con su función.',
  4: '¿Qué evidencia visual permite afirmar que el blastocisto ya está implantándose y no solamente apoyado sobre el endometrio? Explica por qué este proceso es necesario.',
  5: 'Relaciona cada capa embrionaria con los órganos y tejidos que origina.',
  6: '¿Por qué la gastrulación es indispensable para que posteriormente puedan formarse órganos diferentes?',
  7: 'Observa el disco trilaminar. ¿Qué capa representa B y qué dos estructuras se formarán a partir de ella?',
  8: '¿Cómo se llama el proceso durante el cual el ectodermo forma la placa neural, los pliegues neurales y posteriormente el tubo neural?',
  9: 'Al comparar las imágenes 2 y 3, ¿qué cambio principal permite que aparezca el tubo neural?',
  10: 'Identifica las estructuras A y D. Después explica cómo se relacionan mediante la estructura C.',
  11: '¿Cuál interpretación de A y B es correcta?',
  12: 'Un embrión ya posee ectodermo, mesodermo y endodermo, pero su tubo neural no se cierra correctamente. Explica qué proceso ocurrió correctamente, cuál presentó el problema y qué sistema podría resultar afectado.'
};

/* ------------------------------------------------------------------ *
 * ENTRADA — se invoca desde doPost de Codigo.gs
 * ------------------------------------------------------------------ */

function REZ_handleSubmit_(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);

    const identity = verifyGoogleIdentity_(payload.googleCredential || '');
    if (!payload.submissionId) throw new Error('Falta el identificador del envío.');
    payload.studentName = identity.name || payload.studentName || '';
    payload.studentEmail = String(identity.email || '').toLowerCase();
    delete payload.googleCredential;

    const sheet = getOrCreateSheet_(REZ_RESPONSES_SHEET);
    REZ_ensureHeaders_(sheet);

    if (REZ_findSubmissionRow_(sheet, payload.submissionId) > 0) {
      return json_({ ok: true, duplicate: true, submissionId: payload.submissionId });
    }

    const result = REZ_scoreAutomatic_(payload);
    sheet.appendRow(REZ_buildResponseRow_(payload, result));
    SpreadsheetApp.flush();

    // La fila del reporte se genera sola, pero un fallo acá JAMÁS puede
    // costarle el examen a la alumna. Si truena, sus respuestas ya están
    // guardadas arriba y la fila se puede rehacer con REZ_regenerarReporte().
    let reportOk = true;
    try {
      REZ_buildReportRow_(payload, result);
    } catch (err) {
      reportOk = false;
      console.error('REZ: fallo al generar el reporte: ' + err);
    }

    return json_({
      ok: true,
      duplicate: false,
      submissionId: payload.submissionId,
      reportGenerated: reportOk
    });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/* ------------------------------------------------------------------ *
 * CALIFICACIÓN AUTOMÁTICA — 14 puntos
 * ------------------------------------------------------------------ */

function REZ_scoreAutomatic_(data) {
  const per = {};
  let max = 0;

  // Q1 — alternativa. 1 pt
  max += 1;
  per[1] = data.q1 === 'b' ? 1 : 0;

  // Q2 — cronología, 5 componentes de 0.4
  max += 2;
  per[2] = [
    correctNumber_(data.q2_fecundacion, 1),
    correctNumber_(data.q2_morula, 2),
    correctNumber_(data.q2_blastocisto, 3),
    correctNumber_(data.q2_implantacion, 4),
    correctNumber_(data.q2_gastrulacion, 5)
  ].reduce((sum, item) => sum + item, 0) * 0.4;

  // Q3 — letra → función, 3 componentes de 0.667
  max += 2;
  const tercio = 2 / 3;
  per[3] = (data.q3_a === 'implantacion_placenta' ? tercio : 0)
         + (data.q3_b === 'forma_embrion' ? tercio : 0)
         + (data.q3_c === 'cavidad_interna' ? tercio : 0);

  // Q4 — parte automática (0.5). La explicación la califica el docente (1 pt).
  max += 0.5;
  per[4] = data.q4_estructura === 'trofoblasto' ? 0.5 : 0;

  // Q5 — capa → derivados, 3 componentes de 0.667
  max += 2;
  per[5] = (data.q5_ecto === 'encefalo_medula_epidermis' ? tercio : 0)
         + (data.q5_meso === 'musculos_huesos_corazon_sangre' ? tercio : 0)
         + (data.q5_endo === 'digestivo_respiratorio' ? tercio : 0);

  // Q7 — capa + dos derivados distintos, 3 componentes de 0.5
  max += 1.5;
  per[7] = (accepted_(data.q7_layer, ['mesodermo']) ? 0.5 : 0)
         + REZ_scoreMesodermo_(data.q7_d1, data.q7_d2);

  // Q8 — vocabulario. 1 pt
  max += 1;
  per[8] = accepted_(data.q8, ['neurulacion', 'neurulación'], 0.78) ? 1 : 0;

  // Q9 — alternativa. 1.5 pts
  max += 1.5;
  per[9] = data.q9 === 'b' ? 1.5 : 0;

  // Q10 — parte automática (2 × 0.5). La relación la califica el docente (1 pt).
  max += 1;
  per[10] = (data.q10_a === 'embrion' ? 0.5 : 0)
          + (data.q10_d === 'placenta' ? 0.5 : 0);

  // Q11 — alternativa. 1.5 pts  (ojo: la correcta es 'a', no 'b')
  max += 1.5;
  per[11] = data.q11 === 'a' ? 1.5 : 0;

  const points = Object.keys(per).reduce((sum, k) => sum + per[k], 0);
  Object.keys(per).forEach(k => { per[k] = REZ_round_(per[k]); });

  return { points: REZ_round_(points), max: REZ_round_(max), per: per };
}

/**
 * Q7: dos derivados del mesodermo, 0.5 cada uno.
 * Un mismo derivado no puede puntuar dos veces — si escribe "huesos" en
 * ambos campos obtiene 0.5, no 1.0.
 */
function REZ_scoreMesodermo_(first, second) {
  const usados = {};
  let puntos = 0;
  [first, second].forEach(respuesta => {
    const texto = String(respuesta || '').trim();
    if (!texto) return;
    for (let i = 0; i < REZ_MESODERMO.length; i += 1) {
      if (usados[i]) continue;                       // ya lo contó el otro campo
      if (accepted_(texto, REZ_MESODERMO[i])) {
        usados[i] = true;
        puntos += 0.5;
        return;
      }
    }
  });
  return puntos;
}

/* ------------------------------------------------------------------ *
 * FILA DE RESPUESTAS
 * ------------------------------------------------------------------ */

function REZ_buildResponseRow_(payload, result) {
  return [
    payload.finishedAt || new Date().toISOString(),
    payload.submissionId,
    payload.examId,
    payload.examVersion || REZ_EXAM_VERSION,
    payload.studentName || '',
    payload.studentEmail || '',
    payload.grade || '',
    payload.section || '',
    Number(payload.screenExits || 0),
    result.points,
    result.max,
    'PENDIENTE',
    payload.q1 || '',
    ['Fecundación: ' + value_(payload.q2_fecundacion), 'Mórula: ' + value_(payload.q2_morula), 'Blastocisto: ' + value_(payload.q2_blastocisto), 'Implantación: ' + value_(payload.q2_implantacion), 'Gastrulación: ' + value_(payload.q2_gastrulacion)].join(' | '),
    ['A: ' + value_(payload.q3_a), 'B: ' + value_(payload.q3_b), 'C: ' + value_(payload.q3_c)].join(' | '),
    ['Estructura: ' + value_(payload.q4_estructura), 'Explica: ' + value_(payload.q4_why)].join(' | '),
    ['Ectodermo: ' + value_(payload.q5_ecto), 'Mesodermo: ' + value_(payload.q5_meso), 'Endodermo: ' + value_(payload.q5_endo)].join(' | '),
    payload.q6 || '',
    ['Capa: ' + value_(payload.q7_layer), 'Derivado 1: ' + value_(payload.q7_d1), 'Derivado 2: ' + value_(payload.q7_d2)].join(' | '),
    payload.q8 || '',
    payload.q9 || '',
    ['A: ' + value_(payload.q10_a), 'D: ' + value_(payload.q10_d), 'Relación: ' + value_(payload.q10_rel)].join(' | '),
    payload.q11 || '',
    payload.q12 || '',
    JSON.stringify(payload)
  ];
}

/* ------------------------------------------------------------------ *
 * GENERACIÓN DEL REPORTE — el "salto" que antes hacía Codex a mano
 * ------------------------------------------------------------------ */

function REZ_buildReportRow_(payload, result) {
  const per = result.per || {};
  const automatic = REZ_round_(result.points);
  const teacher = 0;                       // los 6 pts docentes se califican después
  const total = REZ_round_(automatic + teacher);

  const questions = REZ_KEY_ROWS.map(fila => {
    const number = Number(fila[0]);
    const pointsMax = Number(fila[5]);
    const earned = REZ_round_(Number(per[number] || 0));
    return {
      number: number,
      label: fila[1],
      prompt: REZ_PROMPTS[number] || '',
      studentAnswer: REZ_formatAnswer_(number, payload),
      idealAnswer: fila[2],
      explanation: fila[4],
      pointsEarned: earned,
      pointsMax: pointsMax,
      status: reviewStatus_(earned, pointsMax, REZ_formatAnswer_(number, payload)),
      feedback: REZ_defaultFeedback_(number, earned, pointsMax)
    };
  });

  const report = {
    examId: REZ_EXAM_ID,
    version: REZ_EXAM_VERSION,
    grade: payload.grade || '2S',
    unit: 'Unidad 4',
    title: 'Examen de recuperación — Desarrollo embrionario',
    submissionId: payload.submissionId,
    studentName: payload.studentName || '',
    studentEmail: payload.studentEmail || '',
    section: payload.section || '',
    submittedAt: payload.finishedAt || new Date().toISOString(),
    score: { automatic: automatic, teacher: teacher, total: total, level: levelFromScore_(total) },
    comment: 'Reporte preliminar: faltan calificar las preguntas 4, 6, 10 y 12.',
    questions: questions,
    reviewedAt: ''
  };

  const breakdown = { 4: 0, 6: 0, 10: 0, 12: 0 };
  const detail = buildTeacherDetail_(report, breakdown);

  const sheet = getOrCreateSheet_('Reportes');
  const lastRow = sheet.getLastRow();
  const email = String(payload.studentEmail || '').toLowerCase();

  // Si ya existe una fila suya, se actualiza en lugar de duplicar.
  let destino = 0;
  if (lastRow >= 2) {
    const correos = sheet.getRange(2, 2, lastRow - 1, 1).getDisplayValues();
    const idx = correos.findIndex(item => String(item[0] || '').trim().toLowerCase() === email);
    if (idx >= 0) destino = idx + 2;
  }

  const fila = [
    payload.submissionId, email, payload.studentName || '',
    total, levelFromScore_(total), detail, report.comment,
    'NO',                                   // <- NO liberado: ella ve "pendiente de revisión"
    JSON.stringify(report)
  ];

  if (destino > 0) {
    sheet.getRange(destino, 1, 1, 9).setValues([fila]);
  } else {
    sheet.appendRow(fila);
  }
  SpreadsheetApp.flush();
  return { ok: true, total: total };
}

/** Comentario de arranque, para no encontrar la caja vacía al calificar. */
function REZ_defaultFeedback_(number, earned, maximum) {
  if ([4, 6, 10, 12].indexOf(number) !== -1) {
    return 'Pendiente de revisión docente.';
  }
  if (earned >= maximum) return 'Respuesta correcta y completa.';
  if (earned > 0) return 'Respuesta parcialmente correcta. Revisa la respuesta ideal para completar lo que faltó.';
  return 'Revisa la respuesta ideal y la explicación de esta pregunta.';
}

function REZ_formatAnswer_(number, p) {
  switch (number) {
    case 1: return REZ_alt_(p.q1, { a: 'Segmentación', b: 'Implantación', c: 'Neurulación', d: 'Organogénesis' });
    case 2: return 'Fecundación: ' + value_(p.q2_fecundacion) + ' · Mórula: ' + value_(p.q2_morula) + ' · Blastocisto: ' + value_(p.q2_blastocisto) + ' · Implantación: ' + value_(p.q2_implantacion) + ' · Gastrulación: ' + value_(p.q2_gastrulacion);
    case 3: return 'A: ' + REZ_fn_(p.q3_a) + ' · B: ' + REZ_fn_(p.q3_b) + ' · C: ' + REZ_fn_(p.q3_c);
    case 4: return 'Estructura: ' + value_(p.q4_estructura) + '. Explicación: ' + (value_(p.q4_why) || '(sin responder)');
    case 5: return 'Ectodermo: ' + REZ_cap_(p.q5_ecto) + ' · Mesodermo: ' + REZ_cap_(p.q5_meso) + ' · Endodermo: ' + REZ_cap_(p.q5_endo);
    case 6: return value_(p.q6) || '(sin responder)';
    case 7: return 'Capa: ' + value_(p.q7_layer) + ' · Derivados: ' + value_(p.q7_d1) + ', ' + value_(p.q7_d2);
    case 8: return value_(p.q8) || '(sin responder)';
    case 9: return REZ_alt_(p.q9, { a: 'El blastocisto penetra el endometrio', b: 'Los pliegues neurales se aproximan y se fusionan', c: 'Se forma la placenta completa', d: 'Comienza el periodo fetal' });
    case 10: return 'A: ' + value_(p.q10_a) + ' · D: ' + value_(p.q10_d) + '. Relación: ' + (value_(p.q10_rel) || '(sin responder)');
    case 11: return REZ_alt_(p.q11, { a: 'A cerrado normalmente; B cierre incompleto', b: 'A placenta y B saco vitelino', c: 'A gastrulación y B implantación', d: 'Desarrollo idéntico' });
    case 12: return value_(p.q12) || '(sin responder)';
    default: return '';
  }
}

function REZ_alt_(valor, mapa) {
  const clave = String(valor || '').toLowerCase();
  return clave && mapa[clave] ? clave.toUpperCase() + ') ' + mapa[clave] : '(sin responder)';
}

function REZ_fn_(valor) {
  const mapa = {
    implantacion_placenta: 'Participa en la implantación y la futura placenta',
    forma_embrion: 'Forma el embrión',
    cavidad_interna: 'Constituye la cavidad interna'
  };
  return mapa[String(valor || '')] || '(sin responder)';
}

function REZ_cap_(valor) {
  const mapa = {
    encefalo_medula_epidermis: 'Encéfalo, médula espinal y epidermis',
    musculos_huesos_corazon_sangre: 'Músculos, huesos, corazón y sangre',
    digestivo_respiratorio: 'Revestimiento digestivo y respiratorio'
  };
  return mapa[String(valor || '')] || '(sin responder)';
}

/* ------------------------------------------------------------------ *
 * UTILIDADES PARA EL DOCENTE — se corren a mano desde el editor
 * ------------------------------------------------------------------ */

/**
 * Libera el reporte de la alumna para que pueda verlo.
 * Correr DESPUÉS de calificar las preguntas 4, 6, 10 y 12.
 */
function REZ_liberarReporte(correo) {
  const email = String(correo || '').trim().toLowerCase();
  if (!email) throw new Error('Indica el correo: REZ_liberarReporte("nombre@colegiomilagrosdedios.edu.pe")');
  const sheet = getOrCreateSheet_('Reportes');
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('La hoja Reportes está vacía.');
  const correos = sheet.getRange(2, 2, lastRow - 1, 1).getDisplayValues();
  const idx = correos.findIndex(item => String(item[0] || '').trim().toLowerCase() === email);
  if (idx < 0) throw new Error('No se encontró el reporte de ' + email);
  sheet.getRange(idx + 2, 8).setValue('SI');
  SpreadsheetApp.flush();
  return 'Reporte liberado para ' + email;
}

/** Vuelve a ocultar un reporte ya liberado. */
function REZ_ocultarReporte(correo) {
  const email = String(correo || '').trim().toLowerCase();
  const sheet = getOrCreateSheet_('Reportes');
  const lastRow = sheet.getLastRow();
  const correos = sheet.getRange(2, 2, lastRow - 1, 1).getDisplayValues();
  const idx = correos.findIndex(item => String(item[0] || '').trim().toLowerCase() === email);
  if (idx < 0) throw new Error('No se encontró el reporte de ' + email);
  sheet.getRange(idx + 2, 8).setValue('NO');
  SpreadsheetApp.flush();
  return 'Reporte oculto para ' + email;
}

/**
 * Rehace la fila del reporte desde las respuestas guardadas.
 * Úsalo solo si la generación automática falló al enviar el examen.
 * OJO: descarta la calificación docente que ya hubieras puesto.
 */
function REZ_regenerarReporte(correo) {
  const email = String(correo || '').trim().toLowerCase();
  const sheet = getOrCreateSheet_(REZ_RESPONSES_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('No hay respuestas registradas.');
  const filas = sheet.getRange(2, 1, lastRow - 1, REZ_HEADERS.length).getDisplayValues();
  const fila = filas.find(item => String(item[5] || '').trim().toLowerCase() === email);
  if (!fila) throw new Error('No se encontró la respuesta de ' + email);
  const payload = JSON.parse(fila[REZ_HEADERS.length - 1] || '{}');
  const result = REZ_scoreAutomatic_(payload);
  REZ_buildReportRow_(payload, result);
  return 'Reporte regenerado para ' + email + ' — automático ' + result.points + '/14';
}

/** Prepara la hoja de respuestas y la clave. No toca nada del examen oficial. */
function REZ_setupWorkbook() {
  const responses = getOrCreateSheet_(REZ_RESPONSES_SHEET);
  REZ_ensureHeaders_(responses);
  responses.setFrozenRows(1);

  const key = getOrCreateSheet_('Clave rezagada');
  key.clearContents();
  key.getRange(1, 1, 1, 7).setValues([[
    'pregunta', 'tipo', 'respuestaIdeal', 'criterioAutomatico', 'explicacion', 'puntajeMaximo', 'revision'
  ]]);
  key.getRange(2, 1, REZ_KEY_ROWS.length, 7).setValues(REZ_KEY_ROWS);
  key.setFrozenRows(1);
  return 'Hojas listas: "' + REZ_RESPONSES_SHEET + '" y "Clave rezagada".';
}

/* ------------------------------------------------------------------ *
 * HELPERS INTERNOS
 * ------------------------------------------------------------------ */

function REZ_ensureHeaders_(sheet) {
  const ancho = Math.max(sheet.getLastColumn(), REZ_HEADERS.length);
  const actual = sheet.getRange(1, 1, 1, ancho).getDisplayValues()[0].slice(0, REZ_HEADERS.length);
  if (actual.join('|') !== REZ_HEADERS.join('|')) {
    sheet.getRange(1, 1, 1, REZ_HEADERS.length).setValues([REZ_HEADERS]);
  }
}

function REZ_findSubmissionRow_(sheet, submissionId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const valores = sheet.getRange(2, 2, lastRow - 1, 1).getDisplayValues();
  for (let i = valores.length - 1; i >= 0; i -= 1) {
    if (valores[i][0] === submissionId) return i + 2;
  }
  return -1;
}

function REZ_round_(n) {
  return Math.round(Number(n || 0) * 100) / 100;
}

/**
 * [BOTON LIBERAR] Cambia el estado de liberacion desde el propio reporte.
 * Solo administradores. Sirve para liberar y para volver a ocultar.
 */
function REZ_handleRelease_(payload) {
  const identity = verifyGoogleIdentity_(payload.googleCredential || '');
  const adminEmail = String(identity.email || '').trim().toLowerCase();
  if (ADMIN_EMAILS.indexOf(adminEmail) === -1) {
    throw new Error('Esta cuenta no tiene permisos para liberar reportes.');
  }

  const targetEmail = String(payload.targetEmail || '').trim().toLowerCase();
  if (!targetEmail.endsWith('@' + SCHOOL_DOMAIN)) throw new Error('Correo de estudiante no valido.');
  const liberar = payload.liberar !== false;   // por defecto libera

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const sheet = getOrCreateSheet_('Reportes');
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) throw new Error('No existen reportes.');
    const correos = sheet.getRange(2, 2, lastRow - 1, 1).getDisplayValues();
    const idx = correos.findIndex(item => String(item[0] || '').trim().toLowerCase() === targetEmail);
    if (idx < 0) throw new Error('No se encontro el reporte de ' + targetEmail);
    sheet.getRange(idx + 2, 8).setValue(liberar ? 'SI' : 'NO');
    SpreadsheetApp.flush();

    const requestId = String(payload.requestId || '').trim();
    if (/^[a-zA-Z0-9-]{16,100}$/.test(requestId)) {
      CacheService.getScriptCache().put('report:' + requestId, JSON.stringify({
        ok: true, status: 'released', liberado: liberar, targetEmail: targetEmail
      }), 300);
    }
    return json_({ ok: true, accepted: true, liberado: liberar });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/**
 * Señal de vida. Sirve para comprobar que este archivo está realmente
 * instalado y publicado: si no lo está, doGet cae en su respuesta por
 * defecto y devuelve el examId del examen OFICIAL.
 *   ...exec?action=rezagada
 */
function REZ_health_() {
  return json_({
    ok: true,
    instalado: true,
    examId: REZ_EXAM_ID,
    version: REZ_EXAM_VERSION,
    hoja: REZ_RESPONSES_SHEET
  });
}

/** Estado del envío, para la pantalla de confirmación del examen. */
function REZ_submissionStatus_(submissionId) {
  if (!submissionId) return json_({ ok: false, found: false, error: 'Falta submissionId.' });
  const sheet = getOrCreateSheet_(REZ_RESPONSES_SHEET);
  REZ_ensureHeaders_(sheet);
  return json_({ ok: true, found: REZ_findSubmissionRow_(sheet, submissionId) > 0 });
}
