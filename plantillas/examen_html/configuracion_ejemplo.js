/**
 * Configuración neutral de ejemplo.
 *
 * Este archivo es JavaScript válido tanto en el navegador como en Apps Script V8.
 * Al crear un examen, cópialo como `configuracion.js` junto al HTML y como
 * `Configuracion.gs` dentro del proyecto independiente de Apps Script.
 * No coloques secretos aquí: el client ID OAuth y el endpoint son públicos.
 */
var EXAM_CONFIG = Object.freeze({
  schemaVersion: 1,
  grade: "__GRADO__",
  unit: "__UNIDAD__",
  title: "__TITULO_DEL_EXAMEN__",
  subject: "Ciencia y Tecnología",
  examId: "__EXAM_ID_UNICO__",
  version: "__VERSION__",
  schoolDomain: "colegiomilagrosdedios.edu.pe",
  spreadsheetId: "__SPREADSHEET_ID_EXCLUSIVO__",
  appsScriptEndpoint: "__ENDPOINT_APPS_SCRIPT_EXCLUSIVO__",
  googleClientId: "__IDENTIFICADOR_PUBLICO_OAUTH__",
  reportsEnabled: false,
  // Escala institucional sin nivel C. Se aplica cuando la calificación está completa.
  achievementScale: [
    { label: "AD", minRatio: 0.90 },
    { label: "A", minRatio: 0.70 },
    { label: "B", minRatio: 0.00 }
  ],

  // Manifiesto de imágenes. Las preguntas solo hacen referencia a imageKey.
  images: {
    esquema_01: {
      src: "__RUTA_O_URL_IMAGEN_01__",
      alt: "__DESCRIPCION_ACCESIBLE_IMAGEN_01__",
      caption: "__PIE_DE_IMAGEN_OPCIONAL__"
    }
  },

  // Deben existir exactamente 12 preguntas, con id q1 ... q12.
  // grading.method: automatic | mixed | teacher
  // type: single | multiple | text | sequence
  questions: [
    {
      id: "q1", type: "single", label: "Alternativa", prompt: "__PREGUNTA_01__",
      imageKey: null, options: [
        { value: "A", label: "__ALTERNATIVA_A__" },
        { value: "B", label: "__ALTERNATIVA_B__" },
        { value: "C", label: "__ALTERNATIVA_C__" },
        { value: "D", label: "__ALTERNATIVA_D__" }
      ],
      hint: "__PISTA_01__", points: 1,
      grading: { method: "automatic", correct: "A" }
    },
    {
      id: "q2", type: "sequence", label: "Ordenamiento", prompt: "__PREGUNTA_02__",
      imageKey: null, items: ["__PASO_1__", "__PASO_2__", "__PASO_3__", "__PASO_4__"],
      hint: "__PISTA_02__", points: 2,
      grading: { method: "automatic", correct: ["1", "2", "3", "4"] }
    },
    {
      id: "q3", type: "text", label: "Lectura de imagen", prompt: "__PREGUNTA_03__",
      imageKey: "esquema_01", placeholder: "Escribe tu respuesta", minLength: 1,
      hint: "__PISTA_03__", points: 2,
      grading: { method: "mixed", accepted: ["__RESPUESTA_MODELO_BREVE__"], threshold: 0.82, automaticPoints: 1 }
    },
    {
      id: "q4", type: "multiple", label: "Selección múltiple", prompt: "__PREGUNTA_04__",
      imageKey: null, options: [
        { value: "A", label: "__ALTERNATIVA_A__" }, { value: "B", label: "__ALTERNATIVA_B__" },
        { value: "C", label: "__ALTERNATIVA_C__" }, { value: "D", label: "__ALTERNATIVA_D__" }
      ],
      hint: "__PISTA_04__", points: 2,
      grading: { method: "automatic", correct: ["A", "C"] }
    },
    {
      id: "q5", type: "text", label: "Explicación", prompt: "__PREGUNTA_05__", imageKey: null,
      placeholder: "Explica con vocabulario científico", minLength: 1, hint: "__PISTA_05__", points: 3,
      grading: { method: "teacher", rubric: "__CRITERIO_DE_REVISION_DOCENTE__" }
    },
    {
      id: "q6", type: "single", label: "Alternativa", prompt: "__PREGUNTA_06__", imageKey: null,
      options: [{ value: "A", label: "__A__" }, { value: "B", label: "__B__" }, { value: "C", label: "__C__" }],
      hint: "__PISTA_06__", points: 1, grading: { method: "automatic", correct: "B" }
    },
    {
      id: "q7", type: "text", label: "Comparación", prompt: "__PREGUNTA_07__", imageKey: null,
      placeholder: "Compara ambos elementos", minLength: 1, hint: "__PISTA_07__", points: 2,
      grading: { method: "mixed", accepted: ["__IDEA_CLAVE__"], threshold: 0.8, automaticPoints: 1 }
    },
    {
      id: "q8", type: "single", label: "Interpretación", prompt: "__PREGUNTA_08__", imageKey: null,
      options: [{ value: "A", label: "__A__" }, { value: "B", label: "__B__" }, { value: "C", label: "__C__" }],
      hint: "__PISTA_08__", points: 1, grading: { method: "automatic", correct: "C" }
    },
    {
      id: "q9", type: "sequence", label: "Secuencia", prompt: "__PREGUNTA_09__", imageKey: null,
      items: ["__ETAPA_A__", "__ETAPA_B__", "__ETAPA_C__"], hint: "__PISTA_09__", points: 2,
      grading: { method: "automatic", correct: ["2", "1", "3"] }
    },
    {
      id: "q10", type: "text", label: "Respuesta causal", prompt: "__PREGUNTA_10__", imageKey: null,
      placeholder: "Explica la causa", minLength: 1, hint: "__PISTA_10__", points: 2,
      grading: { method: "teacher", rubric: "__CRITERIO_DE_REVISION_DOCENTE__" }
    },
    {
      id: "q11", type: "single", label: "Caso", prompt: "__PREGUNTA_11__", imageKey: null,
      options: [{ value: "A", label: "__A__" }, { value: "B", label: "__B__" }, { value: "C", label: "__C__" }],
      hint: "__PISTA_11__", points: 1, grading: { method: "automatic", correct: "A" }
    },
    {
      id: "q12", type: "text", label: "Integración", prompt: "__PREGUNTA_12__", imageKeys: [],
      placeholder: "Integra los conceptos", minLength: 1, hint: "__PISTA_12__", points: 4,
      grading: { method: "teacher", rubric: "__RUBRICA_DE_INTEGRACION__" }
    }
  ]
});
