/** Configuración independiente — 5.° Secundaria, Unidad 4. */
var EXAM_CONFIG = Object.freeze({
  schemaVersion: 1,
  grade: "5.° Secundaria",
  unit: "Unidad 4",
  title: "5.° Secundaria · Examen oficial C2 · Unidad 4",
  subject: "Ciencia y Tecnología",
  examId: "5S-U4-C2-OFICIAL-2026",
  version: "2026-07-17-R2",
  date: "2026-07-17",
  schoolDomain: "colegiomilagrosdedios.edu.pe",
  spreadsheetId: "1AJwwuQFj1vS5J5AmK77V7DWwYSIwZssz7orL6pATHKo",
  appsScriptEndpoint: "https://script.google.com/macros/s/AKfycbwbFPuBdmDLOttOkss1dvh5nUO8uVDO_D917tJHiXhRhIF7y3Yx8EfVreFkFhqiZiboYw/exec",
  googleClientId: "120108159327-6i879klq0bjv0q3n8a1monar07sp0250.apps.googleusercontent.com",
  reportsEnabled: true,
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
      id: "q1", type: "multiple", label: "Selección múltiple",
      prompt: "Define ecosistema usando sus tres elementos centrales.",
      imageKey: null,
      options: [
        { value: "bioticos", label: "Componentes bióticos" },
        { value: "abioticos", label: "Componentes abióticos" },
        { value: "interacciones", label: "Interacciones entre los componentes" },
        { value: "solo_clima", label: "Únicamente el clima" },
        { value: "solo_especies", label: "Únicamente las especies" }
      ],
      hint: "Incluye componentes vivos, componentes no vivos y la relación entre ellos.", points: 1,
      grading: { method: "automatic", correct: ["bioticos", "abioticos", "interacciones"] }
    },
    {
      id: "q2", type: "dropdown", label: "Identificación desplegable",
      prompt: "Diferencia hábitat y nicho ecológico.",
      imageKey: null,
      items: [
        { label: "Hábitat", options: [{ value: "lugar", label: "Lugar donde vive el organismo" }, { value: "rol", label: "Rol funcional del organismo" }] },
        { label: "Nicho ecológico", options: [{ value: "lugar", label: "Lugar donde vive el organismo" }, { value: "rol", label: "Rol funcional, recursos, alimentación y competencia" }] }
      ],
      hint: "Distingue el lugar donde vive un organismo de su función ecológica.", points: 2,
      grading: { method: "automatic", correct: ["lugar", "rol"] }
    },
    {
      id: "q3", type: "text", label: "Interpretación",
      prompt: "Observa la imagen. Explica por qué representa una red trófica y no solo una cadena trófica.",
      imageKey: "red_trofica", placeholder: "Escribe tu respuesta.", minLength: 1,
      hint: "Compara la cantidad de relaciones y rutas posibles.", points: 2,
      grading: { method: "mixed", accepted: ["Porque hay varias relaciones y rutas de reciclaje, no una sola secuencia lineal."], threshold: 0.68, automaticPoints: 1, rubric: "Debe explicar que existen varias relaciones o rutas conectadas y no una sola secuencia lineal." }
    },
    {
      id: "q4", type: "single", label: "Alternativa de análisis",
      prompt: "Según la pirámide, ¿por qué disminuye la energía en cada nivel trófico?",
      imageKey: "piramide_energia",
      options: [
        { value: "A", label: "Porque parte se usa en metabolismo y movimiento y otra parte se disipa como calor; queda menos disponible." },
        { value: "B", label: "Porque los productores no almacenan ninguna energía." },
        { value: "C", label: "Porque la energía desaparece por completo al pasar de un organismo a otro." },
        { value: "D", label: "Porque los consumidores superiores producen toda la energía del ecosistema." }
      ],
      hint: "Considera metabolismo, movimiento y calor.", points: 2,
      grading: { method: "automatic", correct: "A" }
    },
    {
      id: "q5", type: "dropdown", label: "Relación desplegable",
      prompt: "Relaciona cada escena con su ciclo: agua, carbono, nitrógeno y oxígeno.",
      imageKey: "ciclos_biogeoquimicos",
      items: ["Escena A", "Escena B", "Escena C", "Escena D"],
      options: [
        { value: "agua", label: "Ciclo del agua" },
        { value: "carbono", label: "Ciclo del carbono" },
        { value: "nitrogeno", label: "Ciclo del nitrógeno" },
        { value: "oxigeno", label: "Ciclo del oxígeno" }
      ],
      hint: "Responde con una relación para cada letra.", points: 2,
      grading: { method: "automatic", correct: ["agua", "carbono", "nitrogeno", "oxigeno"] }
    },
    {
      id: "q6", type: "multiple", label: "Selección múltiple",
      prompt: "¿Por qué los microorganismos son importantes en los ciclos biogeoquímicos?",
      imageKey: null,
      options: [
        { value: "fijan", label: "Pueden fijar nitrógeno." },
        { value: "degradan", label: "Degradan materia orgánica." },
        { value: "devuelven", label: "Devuelven nutrientes al ecosistema." },
        { value: "detienen", label: "Detienen definitivamente todos los ciclos." },
        { value: "eliminan", label: "Eliminan todos los nutrientes del suelo." }
      ],
      hint: "Piensa en fijación, degradación y retorno de nutrientes.", points: 2,
      grading: { method: "automatic", correct: ["fijan", "degradan", "devuelven"] }
    },
    {
      id: "q7", type: "text", label: "Interpretación",
      prompt: "Explica cuándo el efecto invernadero pasa de fenómeno natural a problema ambiental.",
      imageKey: "efecto_invernadero", placeholder: "Escribe tu respuesta.", minLength: 1,
      hint: "Relaciona actividad humana, gases y retención adicional de calor.", points: 2,
      grading: { method: "mixed", accepted: ["Cuando aumentan CO2, CH4 y N2O por actividad humana, reteniendo más calor."], threshold: 0.68, automaticPoints: 1, rubric: "Debe indicar que el aumento de gases por actividad humana intensifica la retención de calor." }
    },
    {
      id: "q8", type: "multiple", label: "Selección múltiple",
      prompt: "¿Por qué el retroceso glaciar afecta más que solo el hielo?",
      imageKey: null,
      options: [
        { value: "agua", label: "Reduce o altera la disponibilidad de agua." },
        { value: "caudales", label: "Modifica los caudales de los ríos." },
        { value: "agricultura", label: "Afecta la agricultura." },
        { value: "habitats", label: "Transforma hábitats." },
        { value: "biodiversidad", label: "Afecta la biodiversidad." },
        { value: "ninguno", label: "No produce ningún cambio fuera del glaciar." }
      ],
      hint: "Considera agua, actividades humanas, hábitats y seres vivos.", points: 2,
      grading: { method: "automatic", correct: ["agua", "caudales", "agricultura", "habitats", "biodiversidad"] }
    },
    {
      id: "q9", type: "dropdown", label: "Clasificación desplegable",
      prompt: "Explica las cuatro dimensiones de la biodiversidad.",
      imageKey: null,
      items: [
        "Variación de genes dentro de una especie",
        "Variedad de especies presentes",
        "Variedad de ecosistemas y ambientes",
        "Diversidad de funciones y roles ecológicos"
      ],
      options: [
        { value: "genetica", label: "Biodiversidad genética" },
        { value: "especies", label: "Biodiversidad de especies" },
        { value: "ecosistemas", label: "Biodiversidad de ecosistemas" },
        { value: "funcional", label: "Biodiversidad funcional" }
      ],
      hint: "Incluye genética, especies, ecosistemas y función.", points: 1,
      grading: { method: "automatic", correct: ["genetica", "especies", "ecosistemas", "funcional"] }
    },
    {
      id: "q10", type: "dropdown", label: "Identificación desplegable",
      prompt: "Observa el filtro. Explica qué mejora y qué NO garantiza.",
      imageKey: "filtro_capas",
      items: [
        { label: "El filtro mejora", options: [{ value: "turbidez", label: "La apariencia o turbidez del agua" }, { value: "potabilidad", label: "La potabilidad garantizada" }, { value: "esterilizacion", label: "La esterilización completa" }] },
        { label: "El filtro NO garantiza", options: [{ value: "aspecto", label: "Un cambio de apariencia" }, { value: "seguridad", label: "Potabilidad ni esterilización" }, { value: "retencion", label: "La retención de partículas visibles" }] }
      ],
      hint: "Distingue apariencia o turbidez de seguridad microbiológica.", points: 2,
      grading: { method: "automatic", correct: ["turbidez", "seguridad"] }
    },
    {
      id: "q11", type: "single", label: "Alternativa técnica",
      prompt: "¿Qué significa que el carbón activado adsorbe contaminantes?",
      imageKey: null,
      options: [
        { value: "A", label: "Retiene moléculas en su superficie interna, pero no necesariamente las destruye." },
        { value: "B", label: "Destruye instantáneamente todas las moléculas contaminantes." },
        { value: "C", label: "Convierte todos los contaminantes en oxígeno." },
        { value: "D", label: "Solo cambia el color del agua sin retener sustancias." }
      ],
      hint: "Distingue retener en la superficie de destruir.", points: 2,
      grading: { method: "automatic", correct: "A" }
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

