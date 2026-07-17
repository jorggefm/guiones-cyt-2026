/** Configuración independiente — 1.° Secundaria, Unidad 4. */
var EXAM_CONFIG = Object.freeze({
  schemaVersion: 1,
  grade: "1.° Secundaria",
  unit: "Unidad 4",
  title: "1.° Secundaria · Examen oficial C2 · Unidad 4",
  subject: "Ciencia y Tecnología",
  examId: "1S-U4-C2-OFICIAL-2026",
  version: "2026-07-16",
  date: "2026-07-16",
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
      prompt: "En el Perú ocurren muchos sismos porque está ubicado cerca del Océano Pacífico. ¿Cuál es la explicación científica más completa?",
      imageKey: "cinturon_subduccion",
      options: [
        { value: "A", label: "Porque el Pacífico es el océano más grande." },
        { value: "B", label: "Porque el Perú está en una zona de mucha actividad tectónica donde la placa de Nazca se mueve debajo de la Sudamericana." },
        { value: "C", label: "Porque hay más lluvias cerca del mar." },
        { value: "D", label: "Porque el suelo peruano es fértil." }
      ],
      hint: "Usa las palabras “placa” y “subducción”.", points: 1,
      grading: { method: "automatic", correct: "B" }
    },
    {
      id: "q2", type: "text", label: "Ordenamiento",
      prompt: "Ordena las escenas de la imagen desde el inicio hasta la formación del suelo fértil. Luego escribe una frase explicando el proceso.",
      imageKey: "formacion_suelo", placeholder: "Escribe el orden y luego explica el proceso.", minLength: 25,
      hint: "Empieza por la roca más grande y termina donde aparece vida vegetal.", points: 2,
      grading: { method: "mixed", accepted: ["B C D A. Primero está la roca madre, luego la lluvia y los cambios de temperatura la meteorizan, después se fragmenta y finalmente se mezcla con materia orgánica para formar suelo fértil."], threshold: 0.72, automaticPoints: 1, rubric: "Verificar el orden B → C → D → A y una explicación causal del proceso." }
    },
    {
      id: "q3", type: "text", label: "Imagen con flechas",
      prompt: "Observa las columnas A, B y C. Escribe debajo de cada una: “filtra rápido”, “filtra equilibrado” o “filtra lento”.",
      imageKey: "permeabilidad", placeholder: "A: …  B: …  C: …", minLength: 20,
      hint: "Mira cuánta agua pasa hacia el vaso inferior.", points: 2,
      grading: { method: "mixed", accepted: ["A filtra rápido. B filtra equilibrado. C filtra lento."], threshold: 0.78, automaticPoints: 1, rubric: "Confirmar las tres correspondencias." }
    },
    {
      id: "q4", type: "text", label: "Imagen interpretativa",
      prompt: "Observa la imagen. Explica cómo la contaminación puede terminar causando menos agua disponible para pueblos y agricultura.",
      imageKey: "gei_glaciares", placeholder: "Explica la cadena de causa y efecto.", minLength: 35,
      hint: "Sigue la cadena de izquierda a derecha.", points: 2,
      grading: { method: "teacher", rubric: "Debe relacionar contaminación, GEI, calor atrapado, aumento de temperatura, derretimiento de glaciares y menor disponibilidad de agua." }
    },
    {
      id: "q5", type: "text", label: "Relación estructura-función",
      prompt: "Relaciona cada suelo con su comportamiento frente al agua y explica por qué: suelo arenoso, suelo con humus y suelo arcilloso.",
      imageKey: "permeabilidad", placeholder: "Relaciona los tres suelos y explica.", minLength: 35,
      hint: "Piensa en qué suelo deja pasar más o menos agua.", points: 3,
      grading: { method: "teacher", rubric: "Arenoso: rápido; humus: equilibrado; arcilloso: lento. Explicar partículas, espacios y materia orgánica." }
    },
    {
      id: "q6", type: "text", label: "Respuesta breve causal",
      prompt: "¿Por qué la subducción de la placa de Nazca bajo la placa Sudamericana puede producir sismos en el Perú?",
      imageKey: "cinturon_subduccion", placeholder: "Explica la causa.", minLength: 25,
      hint: "La causa no es solo “estar cerca del mar”, sino el movimiento de placas.", points: 1,
      grading: { method: "mixed", accepted: ["Porque las placas se mueven y chocan; al hundirse la placa de Nazca bajo la Sudamericana se acumula y libera energía, lo que produce sismos."], threshold: 0.68, automaticPoints: 0.5, rubric: "Revisar movimiento, acumulación y liberación de energía." }
    },
    {
      id: "q7", type: "text", label: "Imagen con capas/secuencia",
      prompt: "En la secuencia de formación del suelo, ¿en qué momento aparece la materia orgánica y por qué es importante?",
      imageKey: "formacion_suelo", placeholder: "Indica el momento y su importancia.", minLength: 25,
      hint: "Busca la escena donde aparecen planta, restos orgánicos o suelo oscuro.", points: 2,
      grading: { method: "mixed", accepted: ["Aparece al final, cuando los fragmentos de roca se mezclan con restos de seres vivos. Es importante porque ayuda a formar suelo fértil."], threshold: 0.70, automaticPoints: 1, rubric: "Debe indicar el final de la secuencia y la formación de suelo fértil." }
    },
    {
      id: "q8", type: "text", label: "Vocabulario científico tolerante",
      prompt: "Explica con tus palabras qué significa “meteorización”.",
      imageKey: "formacion_suelo", placeholder: "Explica la idea con tus palabras.", minLength: 20,
      hint: "No necesitas memorizar una definición exacta; explica la idea.", points: 1,
      grading: { method: "mixed", accepted: ["Es el proceso por el cual la roca se rompe poco a poco por acción de la lluvia y los cambios de temperatura."], threshold: 0.66, automaticPoints: 0.5, rubric: "Aceptar explicaciones equivalentes sobre ruptura gradual de la roca por lluvia y cambios de temperatura." }
    },
    {
      id: "q9", type: "sequence", label: "Ordenamiento o secuencia visual",
      prompt: "Ordena esta cadena causal: derretimiento de glaciares, contaminación, GEI, menos agua en ríos, calor atrapado.",
      imageKey: "gei_glaciares",
      items: ["Derretimiento de glaciares", "Contaminación", "GEI", "Menos agua en ríos", "Calor atrapado"],
      hint: "Empieza con la acción humana y termina con la consecuencia.", points: 2,
      grading: { method: "automatic", correct: ["4", "1", "2", "5", "3"] }
    },
    {
      id: "q10", type: "text", label: "Comparación",
      prompt: "Compara el suelo con humus y el suelo arcilloso. ¿Cuál conserva mejor la humedad sin impedir demasiado el paso del agua?",
      imageKey: "permeabilidad", placeholder: "Compara y justifica.", minLength: 30,
      hint: "La mejor opción no siempre es la que deja pasar más rápido el agua.", points: 2,
      grading: { method: "teacher", rubric: "Suelo con humus: filtración equilibrada y conservación de humedad; arcilloso: filtración lenta que puede dificultar el paso." }
    },
    {
      id: "q11", type: "text", label: "Caso simple",
      prompt: "Un agricultor quiere un suelo que conserve humedad y se erosione menos. Según la imagen y el resumen, ¿qué tipo de suelo le conviene más? Explica.",
      imageKey: "permeabilidad", placeholder: "Elige el suelo y explica.", minLength: 25,
      hint: "Busca el suelo que está entre el arenoso y el arcilloso.", points: 1,
      grading: { method: "mixed", accepted: ["Le conviene el suelo con humus, porque filtra de forma equilibrada, conserva mejor la humedad y ayuda a que el suelo se erosione menos."], threshold: 0.68, automaticPoints: 0.5, rubric: "Debe elegir suelo con humus y justificar humedad, filtración y menor erosión." }
    },
    {
      id: "q12", type: "text", label: "Pregunta integradora",
      prompt: "Explica en un párrafo cómo se relacionan estas ideas: Cinturón de Fuego, subducción, sismos, formación lenta del suelo y permeabilidad.",
      imageKeys: ["permeabilidad", "formacion_suelo", "cinturon_subduccion"],
      placeholder: "Escribe un párrafo integrador.", minLength: 55,
      hint: "Ordena tu respuesta: primero placas y sismos, luego formación del suelo, luego permeabilidad.", points: 4,
      grading: { method: "teacher", rubric: "Relacionar Cinturón de Fuego, subducción Nazca-Sudamericana y sismos; formación lenta desde roca madre; y filtración rápida, equilibrada o lenta según el suelo." }
    }
  ]
});
