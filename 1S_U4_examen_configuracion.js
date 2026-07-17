/** Configuración independiente — 1.° Secundaria, Unidad 4. */
var EXAM_CONFIG = Object.freeze({
  schemaVersion: 1,
  grade: "1.° Secundaria",
  unit: "Unidad 4",
  title: "1.° Secundaria · Examen oficial C2 · Unidad 4",
  subject: "Ciencia y Tecnología",
  examId: "1S-U4-C2-OFICIAL-2026",
  version: "2026-07-17",
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
      id: "q2", type: "text", label: "Ordenamiento",
      prompt: "Ordena el proceso de formación del suelo: fragmentación de rocas, roca madre, mezcla con materia orgánica, meteorización por lluvia y temperatura.",
      imageKey: null, placeholder: "Escribe el proceso en orden.", minLength: 1,
      hint: "Empieza con la roca completa y termina con suelo fértil.", points: 2,
      grading: { method: "mixed", accepted: ["Roca madre → meteorización por lluvia y temperatura → fragmentación de rocas → mezcla con materia orgánica."], threshold: 0.70, automaticPoints: 1, rubric: "Verificar el orden: roca madre, meteorización, fragmentación y mezcla con materia orgánica." }
    },
    {
      id: "q3", type: "text", label: "Lectura de imagen / flechas",
      prompt: "Observa la imagen de los tres suelos. Identifica cuál filtra rápido, cuál filtra de forma equilibrada y cuál filtra lento.",
      imageKey: "permeabilidad", placeholder: "Identifica el comportamiento de cada suelo.", minLength: 1,
      hint: "Mira cuánta agua logra pasar hacia abajo.", points: 2,
      grading: { method: "mixed", accepted: ["Suelo arenoso: filtra rápido. Suelo con humus: filtra equilibrado. Suelo arcilloso: filtra lento."], threshold: 0.72, automaticPoints: 1, rubric: "Confirmar las tres correspondencias: arenoso rápido, humus equilibrado y arcilloso lento." }
    },
    {
      id: "q4", type: "text", label: "Interpretación de imagen",
      prompt: "Observa la imagen. Explica la cadena que conecta contaminación, GEI, calor atrapado, glaciares y menos agua.",
      imageKey: "gei_glaciares", placeholder: "Explica la cadena de causa y consecuencia.", minLength: 1,
      hint: "Sigue el orden de causa y consecuencia.", points: 2,
      grading: { method: "teacher", rubric: "Debe relacionar contaminación, GEI, calor atrapado, aumento de temperatura, derretimiento de glaciares y menor disponibilidad de agua." }
    },
    {
      id: "q5", type: "text", label: "Relación estructura-función",
      prompt: "Relaciona cada tipo de suelo con su función frente al agua: suelo arenoso, suelo con humus y suelo arcilloso.",
      imageKey: null, placeholder: "Relaciona los tres suelos.", minLength: 1,
      hint: "La función depende de cómo el suelo permite pasar o retener agua.", points: 3,
      grading: { method: "teacher", rubric: "Arenoso: deja pasar el agua rápido. Con humus: retiene y filtra de forma equilibrada. Arcilloso: deja pasar el agua lentamente." }
    },
    {
      id: "q6", type: "text", label: "Explicación breve causal",
      prompt: "¿Por qué la subducción de la placa de Nazca bajo la placa Sudamericana puede causar sismos en el Perú?",
      imageKey: null, placeholder: "Explica la causa.", minLength: 1,
      hint: "Usa “placa de Nazca”, “placa Sudamericana” y “subducción”.", points: 1,
      grading: { method: "mixed", accepted: ["Porque las placas se mueven y chocan; al hundirse la placa de Nazca bajo la Sudamericana se acumula y libera energía, lo que produce sismos."], threshold: 0.68, automaticPoints: 0.5, rubric: "Revisar movimiento, acumulación y liberación de energía." }
    },
    {
      id: "q7", type: "text", label: "Secuencia visual",
      prompt: "Observa las cuatro escenas. Ordénalas desde roca madre hasta suelo fértil y explica qué ocurre en la meteorización.",
      imageKey: "formacion_suelo", placeholder: "Escribe el orden y explica la meteorización.", minLength: 1,
      hint: "No empieces por la escena donde ya hay planta.", points: 2,
      grading: { method: "mixed", accepted: ["B → C → D → A. La meteorización ocurre cuando la lluvia y los cambios de temperatura rompen la roca poco a poco."], threshold: 0.70, automaticPoints: 1, rubric: "Verificar B → C → D → A y la ruptura gradual de la roca por lluvia y temperatura." }
    },
    {
      id: "q8", type: "text", label: "Vocabulario científico",
      prompt: "Explica con tus palabras qué son los GEI y qué efecto producen en la atmósfera.",
      imageKey: null, placeholder: "Explica qué son y qué efecto producen.", minLength: 1,
      hint: "Debe aparecer la idea de “calor atrapado”.", points: 1,
      grading: { method: "mixed", accepted: ["Son gases de efecto invernadero, como CO2, CH4 y CO, que calientan la atmósfera porque atrapan parte del calor."], threshold: 0.66, automaticPoints: 0.5, rubric: "Aceptar explicaciones equivalentes que identifiquen los GEI y el calor atrapado." }
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
      id: "q10", type: "text", label: "Comparación",
      prompt: "Compara el suelo arenoso y el suelo arcilloso. ¿Cuál deja pasar más rápido el agua y cuál la retiene más?",
      imageKey: null, placeholder: "Compara ambos suelos.", minLength: 1,
      hint: "Son comportamientos opuestos frente al agua.", points: 2,
      grading: { method: "teacher", rubric: "El suelo arenoso deja pasar el agua más rápido. El suelo arcilloso la deja pasar lentamente y la retiene más." }
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
