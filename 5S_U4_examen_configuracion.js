/** Configuración independiente — 5.° Secundaria, Unidad 4. */
var EXAM_CONFIG = Object.freeze({
  schemaVersion: 1,
  grade: "5.° Secundaria",
  unit: "Unidad 4",
  title: "5.° Secundaria · Examen oficial C2 · Unidad 4",
  subject: "Ciencia y Tecnología",
  examId: "5S-U4-C2-OFICIAL-2026",
  version: "2026-07-17-R1",
  date: "2026-07-17",
  schoolDomain: "colegiomilagrosdedios.edu.pe",
  spreadsheetId: "1AJwwuQFj1vS5J5AmK77V7DWwYSIwZssz7orL6pATHKo",
  appsScriptEndpoint: "https://script.google.com/macros/s/AKfycbwbFPuBdmDLOttOkss1dvh5nUO8uVDO_D917tJHiXhRhIF7y3Yx8EfVreFkFhqiZiboYw/exec",
  googleClientId: "120108159327-6i879klq0bjv0q3n8a1monar07sp0250.apps.googleusercontent.com",
  reportsEnabled: false,
  achievementScale: [
    { label: "AD", minRatio: 0.90 },
    { label: "A", minRatio: 0.70 },
    { label: "B", minRatio: 0.00 }
  ],
  images: {
    red_trofica: {
      src: "https://jorggefm.github.io/guiones-cyt-2026/assets/5s_u4_examen/01_red_trofica.png",
      alt: "Red trófica con varias relaciones alimentarias y rutas de reciclaje",
      caption: "Observa las conexiones entre los organismos y las rutas de reciclaje."
    },
    piramide_energia: {
      src: "https://jorggefm.github.io/guiones-cyt-2026/assets/5s_u4_examen/02_piramide_energia.png",
      alt: "Pirámide de energía organizada por niveles tróficos",
      caption: "Compara la energía disponible entre los niveles tróficos."
    },
    ciclos_biogeoquimicos: {
      src: "https://jorggefm.github.io/guiones-cyt-2026/assets/5s_u4_examen/03_ciclos_biogeoquimicos.png",
      alt: "Escenas A, B, C y D sobre ciclos biogeoquímicos",
      caption: "Relaciona cada escena con el ciclo correspondiente."
    },
    efecto_invernadero: {
      src: "https://jorggefm.github.io/guiones-cyt-2026/assets/5s_u4_examen/04_efecto_invernadero.png",
      alt: "Esquema del efecto invernadero y la retención de calor",
      caption: "Distingue el fenómeno natural de su intensificación por actividad humana."
    },
    filtro_capas: {
      src: "https://jorggefm.github.io/guiones-cyt-2026/assets/5s_u4_examen/05_filtro_capas.png",
      alt: "Filtro de aguas grises construido con varias capas",
      caption: "Evalúa qué cambia después del filtrado y qué no puede asegurarse."
    },
    celda_mfc: {
      src: "https://jorggefm.github.io/guiones-cyt-2026/assets/5s_u4_examen/06_celda_mfc.png",
      alt: "Celda de combustible microbiana conectada a un medidor de voltaje",
      caption: "Diferencia una medición de voltaje de una evaluación completa de energía útil."
    }
  },
  questions: [
    {
      id: "q1", type: "text", label: "Definición",
      prompt: "Define ecosistema usando sus tres elementos centrales.",
      imageKey: null, placeholder: "Escribe tu respuesta.", minLength: 1,
      hint: "Incluye componentes vivos, componentes no vivos y la relación entre ellos.", points: 1,
      grading: { method: "mixed", accepted: ["Sistema formado por componentes bióticos, abióticos e interacciones."], threshold: 0.68, automaticPoints: 0.5, rubric: "Debe mencionar componentes bióticos, componentes abióticos e interacciones." }
    },
    {
      id: "q2", type: "text", label: "Comparación",
      prompt: "Diferencia hábitat y nicho ecológico.",
      imageKey: null, placeholder: "Escribe tu respuesta.", minLength: 1,
      hint: "Distingue el lugar donde vive un organismo de su función ecológica.", points: 2,
      grading: { method: "mixed", accepted: ["Hábitat: lugar donde vive. Nicho: rol funcional, qué come, recursos, competencia y regulación."], threshold: 0.68, automaticPoints: 1, rubric: "Debe distinguir el lugar donde vive del rol funcional, recursos, alimentación, competencia o regulación." }
    },
    {
      id: "q3", type: "text", label: "Interpretación",
      prompt: "Observa la imagen. Explica por qué representa una red trófica y no solo una cadena trófica.",
      imageKey: "red_trofica", placeholder: "Escribe tu respuesta.", minLength: 1,
      hint: "Compara la cantidad de relaciones y rutas posibles.", points: 2,
      grading: { method: "mixed", accepted: ["Porque hay varias relaciones y rutas de reciclaje, no una sola secuencia lineal."], threshold: 0.68, automaticPoints: 1, rubric: "Debe explicar que existen varias relaciones o rutas conectadas y no una sola secuencia lineal." }
    },
    {
      id: "q4", type: "text", label: "Análisis",
      prompt: "Según la pirámide, ¿por qué disminuye la energía en cada nivel trófico?",
      imageKey: "piramide_energia", placeholder: "Escribe tu respuesta.", minLength: 1,
      hint: "Considera metabolismo, movimiento y calor.", points: 2,
      grading: { method: "mixed", accepted: ["Porque parte se usa o pierde en metabolismo, movimiento y calor; queda menos disponible."], threshold: 0.68, automaticPoints: 1, rubric: "Debe indicar que parte de la energía se usa o se disipa y queda menos disponible para el nivel siguiente." }
    },
    {
      id: "q5", type: "text", label: "Relación",
      prompt: "Relaciona cada escena con su ciclo: agua, carbono, nitrógeno y oxígeno.",
      imageKey: "ciclos_biogeoquimicos", placeholder: "Escribe la relación para A, B, C y D.", minLength: 1,
      hint: "Responde con una relación para cada letra.", points: 2,
      grading: { method: "automatic", accepted: ["A: agua. B: carbono. C: nitrógeno. D: oxígeno."], threshold: 0.72, automaticPoints: 2, rubric: "A: agua; B: carbono; C: nitrógeno; D: oxígeno." }
    },
    {
      id: "q6", type: "text", label: "Explicación",
      prompt: "¿Por qué los microorganismos son importantes en los ciclos biogeoquímicos?",
      imageKey: null, placeholder: "Escribe tu respuesta.", minLength: 1,
      hint: "Piensa en fijación, degradación y retorno de nutrientes.", points: 2,
      grading: { method: "mixed", accepted: ["Fijan nitrógeno, degradan materia orgánica y devuelven nutrientes al ecosistema."], threshold: 0.68, automaticPoints: 1, rubric: "Debe relacionar microorganismos con fijación de nitrógeno, degradación de materia orgánica o devolución de nutrientes." }
    },
    {
      id: "q7", type: "text", label: "Interpretación",
      prompt: "Explica cuándo el efecto invernadero pasa de fenómeno natural a problema ambiental.",
      imageKey: "efecto_invernadero", placeholder: "Escribe tu respuesta.", minLength: 1,
      hint: "Relaciona actividad humana, gases y retención adicional de calor.", points: 2,
      grading: { method: "mixed", accepted: ["Cuando aumentan CO2, CH4 y N2O por actividad humana, reteniendo más calor."], threshold: 0.68, automaticPoints: 1, rubric: "Debe indicar que el aumento de gases por actividad humana intensifica la retención de calor." }
    },
    {
      id: "q8", type: "text", label: "Aplicación",
      prompt: "¿Por qué el retroceso glaciar afecta más que solo el hielo?",
      imageKey: null, placeholder: "Escribe tu respuesta.", minLength: 1,
      hint: "Considera agua, actividades humanas, hábitats y seres vivos.", points: 2,
      grading: { method: "mixed", accepted: ["Altera agua, caudales, agricultura, hábitats y biodiversidad."], threshold: 0.68, automaticPoints: 1, rubric: "Debe relacionar el retroceso glaciar con agua o caudales y con agricultura, hábitats o biodiversidad." }
    },
    {
      id: "q9", type: "text", label: "Clasificación",
      prompt: "Explica las cuatro dimensiones de la biodiversidad.",
      imageKey: null, placeholder: "Escribe tu respuesta.", minLength: 1,
      hint: "Incluye genética, especies, ecosistemas y función.", points: 1,
      grading: { method: "mixed", accepted: ["Genética, especies, ecosistemas y funcional."], threshold: 0.68, automaticPoints: 0.5, rubric: "Debe explicar las dimensiones genética, de especies, de ecosistemas y funcional." }
    },
    {
      id: "q10", type: "text", label: "Interpretación",
      prompt: "Observa el filtro. Explica qué mejora y qué NO garantiza.",
      imageKey: "filtro_capas", placeholder: "Escribe tu respuesta.", minLength: 1,
      hint: "Distingue apariencia o turbidez de seguridad microbiológica.", points: 2,
      grading: { method: "mixed", accepted: ["Mejora apariencia/turbidez; no garantiza potabilidad ni esterilización."], threshold: 0.68, automaticPoints: 1, rubric: "Debe indicar que mejora la apariencia o turbidez, pero no garantiza potabilidad ni esterilización." }
    },
    {
      id: "q11", type: "text", label: "Técnica",
      prompt: "¿Qué significa que el carbón activado adsorbe contaminantes?",
      imageKey: null, placeholder: "Escribe tu respuesta.", minLength: 1,
      hint: "Distingue retener en la superficie de destruir.", points: 2,
      grading: { method: "mixed", accepted: ["Retiene moléculas en su superficie interna; no las destruye."], threshold: 0.68, automaticPoints: 1, rubric: "Debe explicar que las moléculas quedan retenidas en la superficie interna y que no son destruidas." }
    },
    {
      id: "q12", type: "text", label: "Alta dificultad",
      prompt: "Un alumno mide voltaje en una MFC y afirma que produce mucha energía útil. Evalúa científicamente esa conclusión.",
      imageKey: "celda_mfc", placeholder: "Escribe tu evaluación científica.", minLength: 1,
      hint: "Compara voltaje abierto con potencia bajo carga, estabilidad y tratamiento real.", points: 4,
      grading: { method: "teacher", rubric: "No basta medir voltaje abierto. Se debe medir potencia bajo carga, estabilidad y tratamiento real; una MFC produce energía limitada." }
    }
  ]
});

