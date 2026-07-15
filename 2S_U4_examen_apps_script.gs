const SPREADSHEET_ID = '1J_zSUrgqXN0fg9H2ylyOpaXctvrxZpB6ewAutZwN9lQ';
const SHEET_NAME = 'Respuestas';

const HEADERS = [
  'timestamp',
  'nombre',
  'correo',
  'grado',
  'seccion',
  'salidasPantalla',
  'intentosInteractivos',
  'puntajeInterno',
  'nivel',
  'q1',
  'q2_orden',
  'q3_imagen_blastocisto',
  'q4_relacion_capas',
  'q5_desarrollo',
  'q6',
  'q7_orden_neurulacion',
  'q8_desarrollo',
  'q9',
  'q10_vocabulario',
  'q11_caso_etapa',
  'q12_integradora',
  'respuestas_json'
];

function doGet() {
  return json_({ ok: true, message: 'Endpoint activo para el examen 2S U4 C2.' });
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const result = score_(payload);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    ensureHeaders_(sheet);

    sheet.appendRow([
      payload.finishedAt || new Date().toISOString(),
      payload.studentName || '',
      payload.studentEmail || payload.email || '',
      payload.grade || '',
      payload.section || '',
      Number(payload.screenExits || 0),
      Number(payload.interactiveAttempts || 0),
      result.score,
      result.level,
      payload.q1 || '',
      orderSummary_(payload, 'q2'),
      ['A: ' + (payload.q3_a || ''), 'B: ' + (payload.q3_b || ''), 'C: ' + (payload.q3_c || '')].join(' | '),
      ['Ectodermo: ' + (payload.q4_ecto || ''), 'Mesodermo: ' + (payload.q4_meso || ''), 'Endodermo: ' + (payload.q4_endo || '')].join(' | '),
      payload.q5 || '',
      payload.q6 || '',
      orderSummary_(payload, 'q7'),
      payload.q8 || '',
      payload.q9 || '',
      ['A: ' + (payload.q10_a || ''), 'B: ' + (payload.q10_b || ''), 'C: ' + (payload.q10_c || ''), 'D: ' + (payload.q10_d || '')].join(' | '),
      ['Espina bifida: ' + (payload.q11_a || ''), 'Gemelos unidos: ' + (payload.q11_b || ''), 'Transfusion feto-fetal: ' + (payload.q11_c || '')].join(' | '),
      payload.q12 || '',
      JSON.stringify(payload)
    ]);

    return json_({ ok: true, level: result.level, score: result.score });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('No llego informacion del examen.');
  }
  return JSON.parse(e.postData.contents);
}

function ensureHeaders_(sheet) {
  const lastColumn = sheet.getLastColumn();
  const current = lastColumn ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0] : [];
  if (current.join('|') !== HEADERS.join('|')) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function score_(data) {
  let raw = 0;
  let max = 0;

  max += 1;
  if (data.q1 === 'b') raw += 1;

  max += 6;
  raw += correctNumber_(data.q2_fecundacion, 1);
  raw += correctNumber_(data.q2_cigoto, 2);
  raw += correctNumber_(data.q2_segmentacion, 3);
  raw += correctNumber_(data.q2_morula, 4);
  raw += correctNumber_(data.q2_blastocisto, 5);
  raw += correctNumber_(data.q2_implantacion, 6);

  max += 3;
  if (containsAny_(data.q3_a, ['trofoblasto'])) raw += 1;
  if (containsAny_(data.q3_b, ['masa celular interna', 'embrioblasto'])) raw += 1;
  if (containsAny_(data.q3_c, ['blastocele', 'cavidad'])) raw += 1;

  max += 3;
  if (data.q4_ecto === 'Piel y sistema nervioso') raw += 1;
  if (data.q4_meso === 'Musculos, huesos y sangre') raw += 1;
  if (data.q4_endo === 'Revestimiento digestivo y respiratorio') raw += 1;

  max += 2;
  if (longAnswer_(data.q5, ['ectodermo', 'mesodermo', 'endodermo', 'germinal'])) raw += 2;
  else if (String(data.q5 || '').trim().length >= 50) raw += 1;

  max += 1;
  if (data.q6 === 'b') raw += 1;

  max += 4;
  raw += correctNumber_(data.q7_ecto, 1);
  raw += correctNumber_(data.q7_placa, 2);
  raw += correctNumber_(data.q7_tubo, 3);
  raw += correctNumber_(data.q7_cierre, 4);

  max += 2;
  if (longAnswer_(data.q8, ['saco vitelino', 'cordon', 'placenta'])) raw += 2;
  else if (String(data.q8 || '').trim().length >= 50) raw += 1;

  max += 1;
  if (data.q9 === 'b') raw += 1;

  max += 4;
  if (containsAny_(data.q10_a, ['somitas'])) raw += 1;
  if (containsAny_(data.q10_b, ['tubo neural'])) raw += 1;
  if (containsAny_(data.q10_c, ['organogenesis'])) raw += 1;
  if (containsAny_(data.q10_d, ['feto'])) raw += 1;

  max += 3;
  if (data.q11_a === 'Cierre del tubo neural') raw += 1;
  if (data.q11_b === 'Separacion incompleta temprana') raw += 1;
  if (data.q11_c === 'Conexion vascular en placenta') raw += 1;

  max += 2;
  if (longAnswer_(data.q12, ['proceso', 'riesgo', 'decision'])) raw += 2;
  else if (String(data.q12 || '').trim().length >= 60) raw += 1;

  const exits = Number(data.screenExits || 0);
  const penalty = exits >= 8 ? 2 : exits >= 4 ? 1 : 0;
  const score = Math.max(0, Math.round(((raw / max) * 20 - penalty) * 10) / 10);
  const level = score >= 18 ? 'AD' : score >= 14 ? 'A' : score >= 11 ? 'B' : 'C';
  return { score, level };
}

function correctNumber_(value, expected) {
  return Number(value) === expected ? 1 : 0;
}

function containsAny_(value, words) {
  const text = normalize_(value);
  return words.some(word => text.indexOf(normalize_(word)) !== -1);
}

function longAnswer_(value, requiredWords) {
  const text = String(value || '').trim();
  if (text.length < 80) return false;
  const normalized = normalize_(text);
  return requiredWords.every(word => normalized.indexOf(normalize_(word)) !== -1);
}

function normalize_(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function orderSummary_(payload, prefix) {
  return Object.keys(payload)
    .filter(key => key.indexOf(prefix + '_') === 0)
    .sort()
    .map(key => key + ': ' + payload[key])
    .join(' | ');
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
