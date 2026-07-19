const CONFIG = {
  REPORT_ID: "6P_U4_REPORTE_C2_2026",
  SPREADSHEET_ID: "1IlrY5LJdtw-twmZrmPo60d6x2ehiDVhGo8Z0oYXiEhs",
  GOOGLE_CLIENT_ID: "120108159327-6i879klq0bjv0q3n8a1monar07sp0250.apps.googleusercontent.com",
  SCHOOL_DOMAIN: "colegiomilagrosdedios.edu.pe",
  ADMIN_EMAILS: ["jorge.fernandez@colegiomilagrosdedios.edu.pe"],
  RESPONSES_SHEET: "Respuestas de formulario 1",
  EMAILS_SHEET: "Correos",
  REVIEWS_SHEET: "Revisiones",
};

const QUESTIONS = [
  {
    n: 1,
    type: "Alternativa contextualizada",
    max: 1,
    ideal: "Separar residuos y evitar contaminar el rio.",
    explanation: "Cuidar un ecosistema implica evitar que los residuos contaminen el agua y afecten a los seres vivos.",
    image: "",
    auto: true,
  },
  {
    n: 2,
    type: "Ordenamiento",
    max: 1,
    ideal: "sol -> planta -> saltamontes -> ave",
    explanation: "La energia empieza en el Sol, pasa al productor y luego a los consumidores.",
    image: "",
    auto: true,
  },
  {
    n: 3,
    type: "Imagen con flechas",
    max: 1,
    ideal: "El saltamontes",
    explanation: "El saltamontes se alimenta directamente de la planta en la cadena alimenticia.",
    image: "assets/6p_u4_examen/01_cadena_alimenticia.png",
    auto: true,
  },
  {
    n: 4,
    type: "Imagen interpretativa",
    max: 1,
    ideal: "Deforestacion y contaminacion que afectan la biodiversidad.",
    explanation: "La tala, el humo y la basura alteran el habitat y reducen la biodiversidad.",
    image: "assets/6p_u4_examen/02_amenaza_biodiversidad.png",
    auto: true,
  },
  {
    n: 5,
    type: "Relacion estructura-funcion",
    max: 1,
    ideal: "La abeja - ayuda en la polinizacion.",
    explanation: "Las abejas cumplen una funcion ecologica importante al transportar polen y favorecer la formacion de frutos.",
    image: "",
    auto: true,
  },
  {
    n: 6,
    type: "Respuesta breve causal",
    max: 1,
    ideal: "La perdida de variedades reduce la diversidad genetica y puede afectar alimentos, adaptacion y resistencia ante plagas o cambios ambientales.",
    explanation: "Con menos variedades de papa o maiz hay menos alternativas para alimentarse y menos diversidad genetica para enfrentar cambios.",
    image: "",
    auto: false,
  },
  {
    n: 7,
    type: "Seleccion multiple con puntaje parcial",
    max: 1,
    ideal: "Arbol; Ave; Hongo",
    explanation: "Los elementos bioticos son seres vivos. En la imagen, arbol, ave y hongo son bioticos; agua, luz solar y suelo son abioticos.",
    image: "assets/6p_u4_examen/03_bioticos_abioticos.png",
    auto: true,
    checkbox: true,
    correct: ["Arbol", "Ave", "Hongo"],
  },
  {
    n: 8,
    type: "Vocabulario cientifico",
    max: 1,
    ideal: "Biodiversidad significa variedad de seres vivos, especies, ecosistemas y relaciones en un lugar.",
    explanation: "La biodiversidad no es solo cuidar el ambiente: es la variedad de vida y de relaciones ecologicas.",
    image: "",
    auto: false,
  },
  {
    n: 9,
    type: "Secuencia visual",
    max: 1,
    ideal: "separar -> reutilizar -> reciclar -> cuidar el lugar",
    explanation: "La secuencia muestra acciones positivas de manejo de residuos y cuidado ambiental.",
    image: "assets/6p_u4_examen/04_secuencia_cuidado_ambiente.png",
    auto: true,
  },
  {
    n: 10,
    type: "Comparacion",
    max: 1,
    ideal: "Un elemento biotico tiene vida; un elemento abiotico no tiene vida. Ejemplo: ave o planta frente a agua, suelo o luz solar.",
    explanation: "La comparacion correcta identifica vida/no vida y da ejemplos del ecosistema.",
    image: "",
    auto: false,
  },
  {
    n: 11,
    type: "Caso simple",
    max: 1,
    ideal: "La polinizacion, que es parte de la biodiversidad funcional.",
    explanation: "Si faltan abejas, disminuye una funcion ecologica: la polinizacion de plantas.",
    image: "",
    auto: true,
  },
  {
    n: 12,
    type: "Pregunta integradora",
    max: 1,
    ideal: "Se alteran componentes abioticos como agua y suelo por basura y menos agua, y componentes bioticos como aves y otros seres vivos. Una accion concreta es retirar residuos, colocar tachos, reciclar y recuperar o proteger el humedal.",
    explanation: "Una respuesta integradora conecta seres vivos, elementos no vivos, amenaza ambiental y una solucion concreta.",
    image: "",
    auto: false,
  },
];

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.action === "report" && params.requestId) {
    const cached = CacheService.getScriptCache().get(cacheKey_(params.requestId));
    return json_(cached ? JSON.parse(cached) : { ok: false, pending: true });
  }
  return json_({ ok: true, reportId: CONFIG.REPORT_ID, status: "ready" });
}

function doPost(e) {
  const payload = parsePayload_(e);
  const requestId = payload.requestId || Utilities.getUuid();
  try {
    const user = verifyToken_(payload.credential);
    let result;
    if (payload.action === "saveQuestionReview") {
      if (!user.isAdmin) throw new Error("Solo el docente administrador puede guardar cambios.");
      saveQuestionReview_(payload, user);
      result = buildResponse_(user, payload.targetId || payload.studentId || "");
    } else {
      result = buildResponse_(user, payload.targetId || "");
    }
    CacheService.getScriptCache().put(cacheKey_(requestId), JSON.stringify({ ok: true, data: result }), 300);
  } catch (err) {
    CacheService.getScriptCache().put(cacheKey_(requestId), JSON.stringify({ ok: false, message: err.message || String(err) }), 300);
  }
  return json_({ ok: true, queued: true, requestId });
}

function buildResponse_(user, targetId) {
  const reports = buildAllReports_();
  if (user.isAdmin) {
    const selected = targetId ? reports.find((report) => report.id === targetId) : reports[0];
    return {
      mode: "admin",
      user,
      reports: reports.map((report) => ({
        id: report.id,
        name: report.name,
        email: report.email,
        score20: report.score20,
        grade: report.grade,
      })),
      report: selected || null,
    };
  }

  const emailMap = getEmailMap_();
  const match = Object.keys(emailMap).find((studentId) => normalize_(emailMap[studentId].email) === normalize_(user.email));
  if (!match) {
    return {
      mode: "student",
      user,
      report: null,
      message: "No hay reporte asociado a este correo institucional. El docente debe completar la pestaña Correos.",
    };
  }
  return {
    mode: "student",
    user,
    report: reports.find((report) => report.id === match) || null,
  };
}

function buildAllReports_() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const emailMap = getEmailMap_();
  const overrides = getReviewOverrides_();
  const reports = [];
  for (let i = 1; i < values.length; i += 1) {
    const row = values[i];
    const name = String(row[2] || "").trim();
    if (!name) continue;
    const id = "6P-U4-" + String(i).padStart(2, "0");
    const details = QUESTIONS.map((question, qIndex) => {
      const answer = String(row[3 + qIndex] || "").trim();
      let score = scoreQuestion_(question, answer);
      let comment = commentQuestion_(question, answer, score);
      const override = overrides[id + "|" + question.n];
      if (override) {
        score = override.score;
        comment = override.comment;
      }
      return {
        id,
        n: question.n,
        type: question.type,
        prompt: headers[3 + qIndex],
        answer,
        ideal: question.ideal,
        explanation: question.explanation,
        image: question.image,
        score,
        max: question.max,
        status: status_(score, question.max),
        comment,
        editable: true,
      };
    });
    const automatic = round2_(details.filter((item) => QUESTIONS[item.n - 1].auto).reduce((sum, item) => sum + Number(item.score || 0), 0));
    const teacher = round2_(details.filter((item) => !QUESTIONS[item.n - 1].auto).reduce((sum, item) => sum + Number(item.score || 0), 0));
    const total = round2_(automatic + teacher);
    const score20 = round2_(total / 12 * 20);
    reports.push({
      id,
      name,
      email: (emailMap[id] && emailMap[id].email && emailMap[id].email !== "PENDIENTE") ? emailMap[id].email : "",
      section: "6P",
      rawGoogleScore: row[1],
      automatic,
      teacher,
      total,
      score20,
      grade: grade_(score20),
      general: generalComment_(score20),
      reviewedAt: Utilities.formatDate(new Date(), "America/Lima", "dd/MM/yyyy HH:mm"),
      details,
    });
  }
  return reports;
}

function scoreQuestion_(question, answer) {
  if (question.checkbox) {
    const selected = String(answer || "").split(",").map((part) => normalize_(part)).filter(Boolean);
    const correct = question.correct.map((part) => normalize_(part));
    const hits = selected.filter((part) => correct.indexOf(part) !== -1).length;
    return round2_(hits / correct.length * question.max);
  }
  if (question.auto) {
    return normalize_(answer) === normalize_(question.ideal) ? question.max : 0;
  }
  return scoreOpen_(question.n, answer);
}

function scoreOpen_(n, answer) {
  const text = normalize_(answer);
  if (!text || text === "nose" || text === "no se") return 0;
  let points = 0;
  if (n === 6) {
    if (containsAny_(text, ["alimento", "comida", "comer", "sin alimentos", "desaparecer"])) points += 0.5;
    if (containsAny_(text, ["biodiversidad", "variedad", "genetica", "diferentes", "especies"])) points += 0.5;
  } else if (n === 8) {
    if (containsAny_(text, ["variedad", "diversidad", "diversos", "muchos", "conjunto"])) points += 0.5;
    if (containsAny_(text, ["seres vivos", "animales", "plantas", "flora", "fauna", "ecosistemas", "vida"])) points += 0.5;
  } else if (n === 10) {
    if (containsAny_(text, ["vivo", "vida", "tienen vida", "no tiene vida"])) points += 0.6;
    if (containsAny_(text, ["agua", "sol", "suelo", "luz", "ave", "animal", "planta", "animales"])) points += 0.4;
  } else if (n === 12) {
    if (containsAny_(text, ["agua", "suelo", "basura", "contamina", "humedal", "escasez"])) points += 0.35;
    if (containsAny_(text, ["ave", "aves", "seres vivos", "flora", "fauna", "animales"])) points += 0.25;
    if (containsAny_(text, ["tacho", "recic", "limpiar", "quitar", "retirar", "cuidar", "recuper", "reutilizar"])) points += 0.4;
  }
  return Math.min(1, round2_(points));
}

function commentQuestion_(question, answer, score) {
  if (question.checkbox) {
    const selected = String(answer || "").split(",").map((part) => normalize_(part)).filter(Boolean);
    const correct = question.correct.map((part) => normalize_(part));
    const hits = selected.filter((part) => correct.indexOf(part) !== -1).length;
    return "Marcaste " + hits + " de " + correct.length + " elementos bioticos correctos. No se descuenta por distractores.";
  }
  if (question.auto) {
    return score >= question.max ? "Respuesta correcta." : "Revisa la respuesta ideal y la explicacion cientifica.";
  }
  if (score >= 0.9) return "Respuesta lograda: incluye las ideas cientificas principales.";
  if (score > 0) return "Incluiste algunas ideas correctas, pero falta precision o completar la relacion cientifica.";
  return "Revisa la respuesta ideal y vuelve a intentarlo con vocabulario cientifico.";
}

function saveQuestionReview_(payload, user) {
  const studentId = String(payload.studentId || "").trim();
  const question = Number(payload.question);
  const score = Math.max(0, Math.min(1, Number(payload.score)));
  const comment = String(payload.comment || "").trim();
  if (!studentId || !question || !isFinite(score)) throw new Error("Datos incompletos para guardar.");
  const sheet = getOrCreateSheet_(CONFIG.REVIEWS_SHEET, ["Id estudiante", "Pregunta", "Puntaje", "Comentario docente", "Actualizado por", "Actualizado en", "Motivo", "Activo"]);
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i += 1) {
    if (String(values[i][0]) === studentId && Number(values[i][1]) === question && String(values[i][7]).toUpperCase() === "SI") {
      sheet.getRange(i + 1, 8).setValue("NO");
    }
  }
  sheet.appendRow([studentId, question, score, comment, user.email, new Date(), "Ajuste docente desde reporte web", "SI"]);
}

function getEmailMap_() {
  const sheet = getOrCreateSheet_(CONFIG.EMAILS_SHEET, ["Id estudiante", "Nombre", "Correo institucional", "Estado"]);
  const values = sheet.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < values.length; i += 1) {
    const id = String(values[i][0] || "").trim();
    if (id) map[id] = { name: String(values[i][1] || "").trim(), email: String(values[i][2] || "").trim() };
  }
  return map;
}

function getReviewOverrides_() {
  const sheet = getOrCreateSheet_(CONFIG.REVIEWS_SHEET, ["Id estudiante", "Pregunta", "Puntaje", "Comentario docente", "Actualizado por", "Actualizado en", "Motivo", "Activo"]);
  const values = sheet.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < values.length; i += 1) {
    if (String(values[i][7]).toUpperCase() !== "SI") continue;
    const id = String(values[i][0] || "").trim();
    const q = Number(values[i][1]);
    map[id + "|" + q] = { score: Number(values[i][2]), comment: String(values[i][3] || "") };
  }
  return map;
}

function getOrCreateSheet_(name, headers) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
}

function verifyToken_(credential) {
  if (!credential) throw new Error("Falta iniciar sesion con Google.");
  const response = UrlFetchApp.fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(credential), { muteHttpExceptions: true });
  if (response.getResponseCode() !== 200) throw new Error("No se pudo verificar el token de Google.");
  const info = JSON.parse(response.getContentText());
  if (info.aud !== CONFIG.GOOGLE_CLIENT_ID) throw new Error("El identificador OAuth no coincide.");
  const email = String(info.email || "").toLowerCase();
  if (!email.endsWith("@" + CONFIG.SCHOOL_DOMAIN)) throw new Error("Usa tu cuenta institucional @" + CONFIG.SCHOOL_DOMAIN + ".");
  return {
    email,
    name: info.name || email,
    picture: info.picture || "",
    isAdmin: CONFIG.ADMIN_EMAILS.map((item) => item.toLowerCase()).indexOf(email) !== -1,
  };
}

function parsePayload_(e) {
  const text = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
  return JSON.parse(text || "{}");
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function cacheKey_(requestId) {
  return CONFIG.REPORT_ID + ":" + requestId;
}

function normalize_(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function containsAny_(text, fragments) {
  return fragments.some((fragment) => text.indexOf(fragment) !== -1);
}

function round2_(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function status_(score, max) {
  if (score >= max) return "CORRECTA";
  if (score > 0) return "PARCIAL";
  return "INCORRECTA";
}

function grade_(score20) {
  if (score20 >= 17) return "AD";
  if (score20 >= 12) return "A";
  return "B";
}

function generalComment_(score20) {
  if (score20 >= 17) return "Logro destacado: comprende muy bien ecosistemas, biodiversidad y cuidado ambiental.";
  if (score20 >= 12) return "Vas por buen camino. Revisa los comentarios puntuales para precisar mejor las relaciones ecologicas.";
  return "Necesitas reforzar conceptos centrales de ecosistema, biodiversidad y cuidado ambiental.";
}
