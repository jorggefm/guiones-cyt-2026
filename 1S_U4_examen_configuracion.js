/** Configuración independiente — 1.° Secundaria, Unidad 4. */
var EXAM_CONFIG = Object.freeze({
  schemaVersion: 1,
  grade: "1.° Secundaria",
  unit: "Unidad 4",
  title: "1.° Secundaria · Examen oficial C2 · Unidad 4",
  subject: "Ciencia y Tecnología",
  examId: "1S-U4-C2-OFICIAL-2026",
  version: "2026-07-17-R2",
  date: "2026-07-17",
  schoolDomain: "colegiomilagrosdedios.edu.pe",
  spreadsheetId: "1sgBXCl3-RWWN7qUUOev5i9SxqQRIvrNJsX1TATCpt7o",
  appsScriptEndpoint: "https://script.google.com/macros/s/AKfycbyN74Mg-AaI0UZY7V7Ple3-5fM61A55y3YezvEaTX0hIQUjDuAhmlmOmR1_dAR94UNQJQ/exec",
  googleClientId: "120108159327-flo4qh7s1goq2acdjdnu725lv5i1m138.apps.googleusercontent.com",
  reportsEnabled: false,
  achievementScale: [
    { label: "AD", minRatio: 0.90 },
    { label: "A", minRatio: 0.70 },
    { label: "B", minRatio: 0.00 }
  ],
  images: {
    permeabilidad: {
      src: "https://jorggefm.github.io/guiones-cyt-2026/assets/1s-u4-examen/01_permeabilidad_suelos.png",
      alt: "Experimento visual de permeabilidad en suelo arenoso, con humus y arcilloso",
      caption: "Compara la cantidad de agua que atraviesa cada tipo de suelo."
    },
    gei_glaciares: {
      src: "https://jorggefm.github.io/guiones-cyt-2026/assets/1s-u4-examen/02_gei_glaciares.png",
      alt: "Cadena visual de contaminación, gases de efecto invernadero, glaciares y menos agua",
      caption: "Sigue la cadena causal de izquierda a derecha."
    },
    formacion_suelo: {
      src: "https://jorggefm.github.io/guiones-cyt-2026/assets/1s-u4-examen/03_formacion_suelo.png",
      alt: "Cuatro escenas desordenadas sobre la formación del suelo",
      caption: "Identifica el inicio en la roca madre y el final con suelo fértil."
    },
    cinturon_subduccion: {
      src: "https://jorggefm.github.io/guiones-cyt-2026/assets/1s-u4-examen/04_cinturon_subduccion.png",
      alt: "Mapa del Cinturón de Fuego del Pacífico con subducción de la placa de Nazca bajo Sudamérica",
      caption: "Observa la ubicación del Perú y el movimiento de las placas."
    }
  },
  questions: [
    {
      id: "q1", type: "single", label: "Alternativa contextualizada",
      prompt: "Un estudiante dice: “En el Perú hay muchos sismos solo porque estamos cerca del mar”. ¿Cuál sería la mejor corrección científica?",
      imageKey: null,
      options: [
        { value: "A", label: "Sí, el mar causa directamente los sismos." },
        { value: "B", label: "No; ocurren porque el Perú está cerca del Cinturón de Fuego del Pacífico, donde hay mucha actividad tectónica." },
        { value: "C", label: "No; ocurren porque hay muchos ríos." },
        { value: "D", label: "Sí; mientras más grande el océano, más sismos hay." }
      ],
      hint: "La clave es la actividad tectónica alrededor del Pacífico.", points: 1,
      grading: { method: "automatic", correct: "B" }
    },
    {
      id: "q2", type: "sequence", label: "Ordenamiento desplegable",
      prompt: "Ordena el proceso de formación del suelo: fragmentación de rocas, roca madre, mezcla con materia orgánica, meteorización por lluvia y temperatura.",
      imageKey: null,
      items: ["Roca madre", "Meteorización por lluvia y temperatura", "Fragmentación de rocas", "Mezcla con materia orgánica"],
      hint: "Empieza con la roca completa y termina con suelo fértil.", points: 2,
      grading: { method: "automatic", correct: ["1", "2", "3", "4"] }
    },
    {
      id: "q3", type: "dropdown", label: "Palabras clave desplegables",
      prompt: "Observa la imagen de los tres suelos. Identifica cuál filtra rápido, cuál filtra de forma equilibrada y cuál filtra lento.",
      imageKey: "permeabilidad",
      options: [
        { value: "rapido", label: "Filtra rápido" },
        { value: "equilibrado", label: "Filtra de forma equilibrada" },
        { value: "lento", label: "Filtra lento" }
      ],
      items: ["Suelo arenoso", "Suelo con humus", "Suelo arcilloso"],
      hint: "Mira cuánta agua logra pasar hacia abajo.", points: 2,
      grading: { method: "automatic", correct: ["rapido", "equilibrado", "lento"] }
    },
    {
      id: "q4", type: "sequence", label: "Cadena causal desplegable",
      prompt: "Observa la imagen y ordena la cadena que conecta contaminación, GEI, calor atrapado, glaciares y menos agua.",
      imageKey: "gei_glaciares",
      items: ["Contaminación", "Aumento de GEI", "Calor atrapado", "Derretimiento de glaciares", "Menos agua disponible"],
      hint: "Sigue el orden de causa y consecuencia.", points: 2,
      grading: { method: "automatic", correct: ["1", "2", "3", "4", "5"] }
    },
    {
      id: "q5", type: "dropdown", label: "Relación desplegable",
      prompt: "Relaciona cada tipo de suelo con su función frente al agua: suelo arenoso, suelo con humus y suelo arcilloso.",
      imageKey: null,
      options: [
        { value: "pasa", label: "Deja pasar el agua rápidamente" },
        { value: "equilibra", label: "Retiene y filtra de forma equilibrada" },
        { value: "retiene", label: "Deja pasar lentamente y retiene más" }
      ],
      items: ["Suelo arenoso", "Suelo con humus", "Suelo arcilloso"],
      hint: "La función depende de cómo el suelo permite pasar o retener agua.", points: 3,
      grading: { method: "automatic", correct: ["pasa", "equilibra", "retiene"] }
    },
    {
      id: "q6", type: "single", label: "Alternativa causal",
      prompt: "¿Por qué la subducción de la placa de Nazca bajo la placa Sudamericana puede causar sismos en el Perú?",
      imageKey: null,
      options: [
        { value: "A", label: "Porque la placa de Nazca se hunde bajo la Sudamericana, se acumula energía y luego se libera." },
        { value: "B", label: "Porque el agua del océano empuja directamente a las ciudades." },
        { value: "C", label: "Porque los ríos desgastan el suelo y hacen temblar las rocas." },
        { value: "D", label: "Porque la placa Sudamericana deja de moverse para siempre." }
      ],
      hint: "Usa “placa de Nazca”, “placa Sudamericana” y “subducción”.", points: 1,
      grading: { method: "automatic", correct: "A" }
    },
    {
      id: "q7", type: "sequence", label: "Secuencia visual desplegable",
      prompt: "Observa las cuatro escenas y asigna su orden desde roca madre hasta suelo fértil.",
      imageKey: "formacion_suelo",
      items: ["Escena A", "Escena B", "Escena C", "Escena D"],
      hint: "No empieces por la escena donde ya hay planta.", points: 2,
      grading: { method: "automatic", correct: ["4", "1", "2", "3"] }
    },
    {
      id: "q8", type: "dropdown", label: "Vocabulario desplegable",
      prompt: "Completa las ideas sobre los GEI seleccionando la palabra o expresión correcta.",
      imageKey: null,
      items: [
        { label: "CO₂, CH₄ y CO son", options: [{ value: "gei", label: "gases de efecto invernadero" }, { value: "suelos", label: "tipos de suelo" }, { value: "placas", label: "placas tectónicas" }] },
        { label: "En la atmósfera, estos gases", options: [{ value: "atrapan", label: "atrapan parte del calor" }, { value: "eliminan", label: "eliminan todo el calor" }, { value: "filtran", label: "filtran el agua" }] },
        { label: "Cuando aumentan demasiado", options: [{ value: "calientan", label: "aumenta la temperatura" }, { value: "enfrian", label: "se enfría toda la Tierra" }, { value: "sismos", label: "producen sismos" }] }
      ],
      hint: "Debe aparecer la idea de “calor atrapado”.", points: 1,
      grading: { method: "automatic", correct: ["gei", "atrapan", "calientan"] }
    },
    {
      id: "q9", type: "sequence", label: "Ordenamiento causal",
      prompt: "Ordena la cadena: menos agua en ríos, contaminación, calor atrapado, derretimiento de glaciares, GEI.",
      imageKey: null,
      items: ["Menos agua en ríos", "Contaminación", "Calor atrapado", "Derretimiento de glaciares", "GEI"],
      hint: "Empieza con la acción humana y termina con la consecuencia.", points: 2,
      grading: { method: "automatic", correct: ["5", "1", "3", "4", "2"] }
    },
    {
      id: "q10", type: "single", label: "Alternativa comparativa",
      prompt: "Compara el suelo arenoso y el suelo arcilloso. ¿Cuál deja pasar más rápido el agua y cuál la retiene más?",
      imageKey: null,
      options: [
        { value: "A", label: "El arenoso deja pasar el agua más rápido y el arcilloso la retiene más." },
        { value: "B", label: "El arcilloso deja pasar el agua más rápido y el arenoso la retiene más." },
        { value: "C", label: "Ambos dejan pasar y retienen exactamente la misma cantidad de agua." },
        { value: "D", label: "Ninguno permite el paso del agua." }
      ],
      hint: "Son comportamientos opuestos frente al agua.", points: 2,
      grading: { method: "automatic", correct: "A" }
    },
    {
      id: "q11", type: "text", label: "Caso visual",
      prompt: "Observa el mapa-diagrama. ¿Por qué el Perú presenta muchos sismos? Responde usando las palabras Océano Pacífico, Cinturón de Fuego, placa de Nazca, placa Sudamericana y subducción.",
      imageKey: "cinturon_subduccion", placeholder: "Conecta ubicación, placas y movimiento.", minLength: 1,
      hint: "Conecta ubicación, placas y movimiento.", points: 1,
      grading: { method: "mixed", accepted: ["El Perú se ubica junto al Océano Pacífico, dentro del Cinturón de Fuego, una zona de mucha actividad tectónica. Allí la placa de Nazca subduce bajo la placa Sudamericana, y ese movimiento puede producir sismos."], threshold: 0.68, automaticPoints: 0.5, rubric: "Debe conectar Océano Pacífico, Cinturón de Fuego, ambas placas, subducción y sismos." }
    },
    {
      id: "q12", type: "text", label: "Integración escrita",
      prompt: "Explica en un párrafo cómo se conectan tres ideas de la unidad: actividad tectónica del Pacífico, contaminación/GEI y formación o permeabilidad del suelo.",
      imageKey: null,
      placeholder: "Conecta al menos tres ideas de la unidad.", minLength: 1,
      hint: "Organiza tu respuesta en tres partes: Tierra, atmósfera y suelo.", points: 4,
      grading: { method: "teacher", rubric: "El estudiante conecta al menos tres ideas correctamente: actividad tectónica del Pacífico y sismos; contaminación, GEI, calor y glaciares; formación lenta o permeabilidad del suelo." }
    }
  ]
});
