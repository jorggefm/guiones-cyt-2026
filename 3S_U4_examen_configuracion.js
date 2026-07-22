/** Configuración independiente — 3.° Secundaria, Unidad 4. */
var EXAM_CONFIG = Object.freeze({
  schemaVersion: 1,
  grade: "3.° Secundaria",
  unit: "Unidad 4",
  title: "3.° Secundaria · Examen oficial C2 · Unidad 4",
  subject: "Ciencia y Tecnología",
  examId: "3S-U4-C2-OFICIAL-2026",
  version: "2026-07-18-R1",
  date: "2026-07-21",
  schoolDomain: "colegiomilagrosdedios.edu.pe",
  spreadsheetId: "1bkNqkOtCfLmn_icVFPsgZVO8tUHJUFrAZy_-SIgxkfc",
  appsScriptEndpoint: "https://script.google.com/macros/s/AKfycbwcu8b674jxWTiw0nvBNd-mHf0u7pRc1QCG-2h_b9RVer8b9wSbcht2RuHpeAm1Ual3sA/exec",
  googleClientId: "120108159327-jelirkkan3gdkdijdpqejrfkk61f09bl.apps.googleusercontent.com",
  reportsEnabled: true,
  achievementScale: [
    { label: "AD", minRatio: 0.90 },
    { label: "A", minRatio: 0.70 },
    { label: "B", minRatio: 0.00 }
  ],
  images: {
    evidencias_reaccion: {
      src: "https://jorggefm.github.io/guiones-cyt-2026/assets/3s-u4-examen/01_evidencias_reaccion_quimica.png",
      alt: "Evidencias observables de una reacción química como cambio de color, gas, precipitado y temperatura.",
      caption: "Observa señales visibles que pueden indicar formación de nuevas sustancias."
    },
    conservacion_balanceo: {
      src: "https://jorggefm.github.io/guiones-cyt-2026/assets/3s-u4-examen/02_conservacion_masa_balanceo.png",
      alt: "Esquema de conservación de masa y balanceo de una ecuación química.",
      caption: "Recuerda: se ajustan coeficientes, no se cambian fórmulas ni subíndices."
    },
    mol_docena: {
      src: "https://jorggefm.github.io/guiones-cyt-2026/assets/3s-u4-examen/03_mol_docena_huevos.png",
      alt: "Comparación visual entre una docena de huevos y un mol de partículas.",
      caption: "La docena y el mol son formas de contar cantidades de unidades."
    },
    molaridad_naoh: {
      src: "https://jorggefm.github.io/guiones-cyt-2026/assets/3s-u4-examen/04_molaridad_beakers_naoh.png",
      alt: "Tres vasos con soluciones de NaOH para calcular molaridad.",
      caption: "Convierte gramos a moles y mililitros a litros antes de calcular la molaridad."
    }
  },
  questions: [
    {
      id: "q1", type: "multiple", label: "Selección múltiple",
      prompt: "Observa la imagen. Para inferir que ocurrió una reacción química y no solo un cambio físico, ¿qué evidencias observables serían científicamente válidas? Marca todas las correctas.",
      imageKey: "evidencias_reaccion",
      options: [
        { value: "color", label: "Cambio de color persistente" },
        { value: "gas", label: "Formación de gas o burbujeo" },
        { value: "precipitado", label: "Aparición de un sólido o precipitado" },
        { value: "temperatura", label: "Cambio de temperatura sin calentar ni enfriar desde afuera" },
        { value: "mezclar", label: "Que dos sustancias estén en el mismo recipiente" },
        { value: "forma", label: "Que una sustancia cambie solo de tamaño o forma" }
      ],
      hint: "Elige señales de formación de nuevas sustancias; descarta acciones o cambios físicos simples.",
      points: 2,
      grading: { method: "automatic", correct: ["color", "gas", "precipitado", "temperatura"] }
    },
    {
      id: "q2", type: "text", label: "Respuesta corta",
      prompt: "Explica por qué observar burbujas, cambio de color o precipitado puede indicar una reacción química y no solo una mezcla.",
      imageKey: null,
      placeholder: "Escribe tu explicación.",
      minLength: 1,
      hint: "Piensa: ¿hay nueva sustancia?",
      points: 2,
      grading: {
        method: "mixed",
        accepted: ["Porque esas señales pueden indicar formación de nuevas sustancias; no basta con juntar materiales, debe haber cambio en propiedades o productos."],
        threshold: 0.62,
        automaticPoints: 1,
        rubric: "Debe distinguir evidencia observable de simple mezcla física y mencionar formación de nuevas sustancias o cambio de propiedades/productos."
      }
    },
    {
      id: "q3", type: "dropdown", label: "Balanceo desplegable",
      prompt: "Balancea la ecuación: H₂ + O₂ → H₂O.",
      imageKey: "conservacion_balanceo",
      items: [
        { label: "Coeficiente de H₂", options: [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
        { label: "Coeficiente de O₂", options: [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
        { label: "Coeficiente de H₂O", options: [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] }
      ],
      hint: "Cuenta H y O en ambos lados.",
      points: 2,
      grading: { method: "automatic", correct: ["2", "1", "2"] }
    },
    {
      id: "q4", type: "dropdown", label: "Balanceo de combustión",
      prompt: "Balancea la combustión del propano: C₃H₈ + O₂ → CO₂ + H₂O.",
      imageKey: null,
      items: [
        { label: "Coeficiente de C₃H₈", options: [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }] },
        { label: "Coeficiente de O₂", options: [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }] },
        { label: "Coeficiente de CO₂", options: [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }] },
        { label: "Coeficiente de H₂O", options: [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }] }
      ],
      hint: "Primero C, luego H, al final O.",
      points: 2,
      grading: { method: "automatic", correct: ["1", "5", "3", "4"] }
    },
    {
      id: "q5", type: "dropdown", label: "Relación desplegable",
      prompt: "Relaciona cada ecuación con su tipo de reacción.",
      imageKey: null,
      items: [
        "2H₂ + O₂ → 2H₂O",
        "2H₂O₂ → 2H₂O + O₂",
        "CH₄ + 2O₂ → CO₂ + 2H₂O",
        "HCl + NaOH → NaCl + H₂O"
      ],
      options: [
        { value: "sintesis", label: "Síntesis" },
        { value: "descomposicion", label: "Descomposición" },
        { value: "combustion", label: "Combustión" },
        { value: "neutralizacion", label: "Neutralización" }
      ],
      hint: "Mira si se une, se rompe, arde o es ácido-base.",
      points: 2,
      grading: { method: "automatic", correct: ["sintesis", "descomposicion", "combustion", "neutralizacion"] }
    },
    {
      id: "q6", type: "text", label: "Respuesta corta",
      prompt: "¿Por qué una reacción puede no ocurrir aunque los reactivos estén juntos?",
      imageKey: null,
      placeholder: "Escribe tu explicación.",
      minLength: 1,
      hint: "No basta con estar cerca: deben chocar correctamente.",
      points: 2,
      grading: {
        method: "mixed",
        accepted: ["Porque las partículas necesitan choques efectivos y suficiente energía de activación para iniciar la reacción."],
        threshold: 0.62,
        automaticPoints: 1,
        rubric: "Debe aparecer la idea de energía mínima o energía de activación y/o choques efectivos."
      }
    },
    {
      id: "q7", type: "text", label: "Interpretación visual",
      prompt: "Según la imagen, ¿por qué se compara una docena con un mol?",
      imageKey: "mol_docena",
      placeholder: "Explica la comparación.",
      minLength: 1,
      hint: "No mide masa directamente; mide cantidad de partículas.",
      points: 1,
      grading: {
        method: "mixed",
        accepted: ["Porque ambos son formas de contar: una docena cuenta 12 unidades y un mol cuenta 6,022 × 10²³ partículas."],
        threshold: 0.60,
        automaticPoints: 1,
        rubric: "Debe indicar que docena y mol son unidades para contar; el mol cuenta 6,022 × 10²³ partículas."
      }
    },
    {
      id: "q8", type: "text", label: "Cálculo breve",
      prompt: "¿Cuántos moles hay en 36 g de H₂O? Masa molar H₂O = 18 g/mol.",
      imageKey: null,
      placeholder: "Escribe el cálculo y la respuesta.",
      minLength: 1,
      hint: "Divide masa entre masa molar.",
      points: 2,
      grading: {
        method: "mixed",
        accepted: ["2 mol", "n = 36 g / 18 g/mol = 2 mol"],
        threshold: 0.60,
        automaticPoints: 1,
        rubric: "Debe usar n = m / MM y obtener 2 mol con unidad."
      }
    },
    {
      id: "q9", type: "text", label: "Cálculo breve",
      prompt: "¿Qué masa tienen 0,75 mol de CO₂? Masa molar CO₂ = 44 g/mol.",
      imageKey: null,
      placeholder: "Escribe el cálculo y la respuesta.",
      minLength: 1,
      hint: "Multiplica moles por masa molar.",
      points: 2,
      grading: {
        method: "mixed",
        accepted: ["33 g", "m = 0,75 mol × 44 g/mol = 33 g", "m = 0.75 mol × 44 g/mol = 33 g"],
        threshold: 0.60,
        automaticPoints: 1,
        rubric: "Debe usar m = n × MM y obtener 33 g con unidad."
      }
    },
    {
      id: "q10", type: "dropdown", label: "Cálculo con imagen",
      prompt: "Observa los tres beakers. Calcula la molaridad de A, B y C. MM NaOH = 40 g/mol.",
      imageKey: "molaridad_naoh",
      items: [
        { label: "Beaker A", options: [{ value: "0.5M", label: "0,5 M" }, { value: "1M", label: "1 M" }, { value: "2M", label: "2 M" }] },
        { label: "Beaker B", options: [{ value: "0.5M", label: "0,5 M" }, { value: "1M", label: "1 M" }, { value: "2M", label: "2 M" }] },
        { label: "Beaker C", options: [{ value: "0.5M", label: "0,5 M" }, { value: "1M", label: "1 M" }, { value: "2M", label: "2 M" }] }
      ],
      hint: "Primero gramos a moles; luego mL a L.",
      points: 2,
      grading: { method: "automatic", correct: ["1M", "0.5M", "1M"] }
    },
    {
      id: "q11", type: "text", label: "Ejercicio aplicado",
      prompt: "Se disuelven 5,85 g de NaCl en agua hasta completar 250 mL de solución. Si MM NaCl = 58,5 g/mol, calcula la molaridad.",
      imageKey: null,
      placeholder: "Escribe el cálculo y la respuesta.",
      minLength: 1,
      hint: "Convierte mL a L antes de dividir.",
      points: 1,
      grading: {
        method: "mixed",
        accepted: ["0,4 M", "0.4 M", "n = 5,85 g / 58,5 g/mol = 0,1 mol; V = 0,25 L; M = 0,4 M"],
        threshold: 0.60,
        automaticPoints: 1,
        rubric: "Debe evidenciar gramos a moles, conversión de 250 mL a 0,25 L y resultado 0,4 M."
      }
    },
    {
      id: "q12", type: "text", label: "Integración escrita",
      prompt: "Un estudiante dice: “Si agrego más gramos de soluto, siempre obtengo una solución más concentrada”. ¿Estás de acuerdo? Justifica usando mol, masa molar, volumen y molaridad.",
      imageKey: null,
      placeholder: "Justifica usando n = m / MM y M = n / V.",
      minLength: 1,
      hint: "La concentración no depende solo de la masa.",
      points: 4,
      grading: {
        method: "teacher",
        rubric: "No siempre. La concentración depende de los moles de soluto y del volumen de solución. Aumentar masa puede aumentar moles, pero si también aumenta mucho el volumen, la molaridad puede no aumentar. Debe usar las ideas n = m / MM y M = n / V."
      }
    }
  ]
});
