const BASE_URL = 'https://jorggefm.github.io/guiones-cyt-2026';
const IMAGE_URLS = {
  neurona: `${BASE_URL}/assets/4s_u4_examen/neurona_cuadrada.png`,
  sinapsis: `${BASE_URL}/assets/4s_u4_examen/sinapsis_cuadrada.png`,
  endocrino: `${BASE_URL}/assets/4s_u4_examen/sistema_endocrino_cuadrada.png`,
  potencial: `${BASE_URL}/assets/4s_u4_examen/potencial_membrana_cuadrada.png`
};

function create4SU4ExamForm() {
  const form = FormApp.create('4.° Secundaria — U4 — Examen de Relación y Coordinación');
  form
    .setDescription(
      'Examen adaptado a Google Forms a partir de las fichas de estudio de 4.° de Secundaria: ' +
      'señales y comunicación, sistema nervioso, sistema endocrino y potencial de membrana.'
    )
    .setConfirmationMessage('Tu examen fue enviado correctamente. Gracias.')
    .setIsQuiz(true)
    .setShuffleQuestions(false)
    .setProgressBar(true);

  addSection_(form, 'Bloque 1 · Señales y coordinación');

  addMultipleChoiceQuestion_(form, {
    title: '1. Según la ficha de estudio, ¿cuál es la secuencia general correcta de la comunicación en el cuerpo?',
    helpText: 'Pista: revisa el esquema central de la hoja "Señales y comunicación en el cuerpo".',
    points: 1,
    choices: [
      { text: 'Estímulo → receptor → coordinador → señal → efector → respuesta', correct: true },
      { text: 'Estímulo → coordinador → receptor → señal → respuesta → efector', correct: false },
      { text: 'Receptor → estímulo → señal → coordinador → respuesta → efector', correct: false },
      { text: 'Estímulo → efector → receptor → coordinador → señal → respuesta', correct: false }
    ]
  });

  addMultipleChoiceQuestion_(form, {
    title: '2. Cuando aumenta la glucosa en sangre y se libera insulina, la señal que predomina es:',
    helpText: 'Pista: mira la lista de tipos de señales y el ejemplo de glucosa alta.',
    points: 1,
    choices: [
      { text: 'Eléctrica', correct: false },
      { text: 'Química', correct: true },
      { text: 'Lumínica', correct: false },
      { text: 'Mecánica', correct: false }
    ]
  });

  addSection_(form, 'Bloque 2 · Sistema nervioso');
  addImageItem_(form, IMAGE_URLS.neurona, 'Imagen de apoyo 1 · Neurona');

  addMultipleChoiceQuestion_(form, {
    title: '3. En la imagen de la neurona, ¿qué letra señala el axón?',
    helpText: 'Pista: el axón conduce el impulso nervioso desde el soma hacia otras células.',
    points: 1,
    choices: [
      { text: 'A', correct: false },
      { text: 'B', correct: false },
      { text: 'C', correct: true },
      { text: 'D', correct: false }
    ]
  });

  addMultipleChoiceQuestion_(form, {
    title: '4. ¿Qué opción explica mejor la función de la interneurona?',
    helpText: 'Pista: revisa la sección "Tipos de neuronas".',
    points: 1,
    choices: [
      { text: 'Lleva información desde los receptores al sistema nervioso central.', correct: false },
      { text: 'Conecta neuronas dentro del sistema nervioso central e integra la información.', correct: true },
      { text: 'Lleva órdenes hacia los efectores, como músculos o glándulas.', correct: false },
      { text: 'Produce hormonas que viajan por la sangre.', correct: false }
    ]
  });

  addMultipleChoiceQuestion_(form, {
    title: '5. Según la ficha del sistema nervioso, ¿cuál es la ruta nerviosa correcta?',
    helpText: 'Pista: sigue el esquema "Receptor → ... → Efector".',
    points: 1,
    choices: [
      { text: 'Receptor → neurona sensorial → sistema nervioso central → neurona motora → efector', correct: true },
      { text: 'Receptor → neurona motora → sistema nervioso central → neurona sensorial → efector', correct: false },
      { text: 'Sistema nervioso central → receptor → neurona sensorial → efector → neurona motora', correct: false },
      { text: 'Receptor → hormona → sangre → sistema nervioso central → efector', correct: false }
    ]
  });

  addImageItem_(form, IMAGE_URLS.sinapsis, 'Imagen de apoyo 2 · Sinapsis');

  addMultipleChoiceQuestion_(form, {
    title: '6. En la imagen de la sinapsis, ¿qué letra señala la parte desde la que se liberan neurotransmisores?',
    helpText: 'Pista: relaciona la imagen con la función de las terminales axónicas.',
    points: 1,
    choices: [
      { text: 'A', correct: true },
      { text: 'B', correct: false },
      { text: 'C', correct: false }
    ]
  });

  addSection_(form, 'Bloque 3 · Sistema endocrino');

  addCheckboxQuestion_(form, {
    title: '7. Selecciona todas las características del sistema endocrino que aparecen en la ficha.',
    helpText: 'Pista: revisa la sección "Características" del sistema endocrino.',
    points: 1,
    choices: [
      { text: 'Más lento que los impulsos nerviosos', correct: true },
      { text: 'Viaja por la sangre y puede actuar en lugares lejanos', correct: true },
      { text: 'Su efecto suele ser sostenido o duradero', correct: true },
      { text: 'Conduce impulsos por axones', correct: false },
      { text: 'Actúa en milisegundos como respuesta típica', correct: false }
    ]
  });

  addImageItem_(form, IMAGE_URLS.endocrino, 'Imagen de apoyo 3 · Glándulas principales');

  addMultipleChoiceQuestion_(form, {
    title: '8. En la imagen del sistema endocrino, ¿qué letra señala el páncreas?',
    helpText: 'Pista: busca la glándula relacionada con insulina y glucagón.',
    points: 1,
    choices: [
      { text: 'A', correct: false },
      { text: 'B', correct: false },
      { text: 'C', correct: true },
      { text: 'D', correct: false }
    ]
  });

  addMultipleChoiceQuestion_(form, {
    title: '9. Según la ruta hormonal de la ficha, ¿cuál es el orden correcto?',
    helpText: 'Pista: empieza con "cambio interno o estímulo".',
    points: 1,
    choices: [
      { text: 'Cambio interno o estímulo → glándula endocrina → hormona → sangre → célula diana → respuesta', correct: true },
      { text: 'Hormona → glándula endocrina → sangre → célula diana → respuesta → cambio interno', correct: false },
      { text: 'Cambio interno o estímulo → sangre → glándula endocrina → célula diana → hormona → respuesta', correct: false },
      { text: 'Glándula endocrina → cambio interno o estímulo → hormona → célula diana → sangre → respuesta', correct: false }
    ]
  });

  addSection_(form, 'Bloque 4 · Potencial de membrana y aplicación');

  addCheckboxQuestion_(form, {
    title: '10. Marca todas las afirmaciones correctas sobre el potencial de membrana en reposo.',
    helpText: 'Pista: revisa la parte superior de la hoja "Potencial de membrana y potencial de acción".',
    points: 1,
    choices: [
      { text: 'Hay más Na+ afuera que adentro.', correct: true },
      { text: 'Hay más K+ adentro que afuera.', correct: true },
      { text: 'Dentro de la célula hay proteínas con carga negativa.', correct: true },
      { text: 'La bomba Na+/K+ expulsa 3 Na+ e introduce 2 K+.', correct: true },
      { text: 'La membrana deja pasar todos los iones por igual.', correct: false },
      { text: 'En reposo, el interior es más positivo que el exterior.', correct: false }
    ]
  });

  addImageItem_(form, IMAGE_URLS.potencial, 'Imagen de apoyo 4 · Potencial de membrana');

  addMultipleChoiceQuestion_(form, {
    title: '11. En la imagen, ¿qué momento representa la entrada de Na+ y la subida del voltaje?',
    helpText: 'Pista: identifica el cuadro en el que Na+ entra a la célula.',
    points: 1,
    choices: [
      { text: 'A', correct: false },
      { text: 'B', correct: true },
      { text: 'C', correct: false },
      { text: 'D', correct: false }
    ]
  });

  addMultipleChoiceQuestion_(form, {
    title: '12. Después de comer, aumenta la glucosa en sangre. ¿Qué explicación es la más completa según tus fichas?',
    helpText: 'Pista: integra el ejemplo de glucosa e insulina con la ruta hormonal.',
    points: 1,
    choices: [
      { text: 'Predomina una respuesta endocrina: el páncreas libera insulina, la hormona viaja por la sangre y actúa en células diana.', correct: true },
      { text: 'Predomina una respuesta nerviosa: la glucosa viaja por axones hasta los músculos.', correct: false },
      { text: 'Predomina una señal lumínica porque el cuerpo detecta el cambio muy rápido.', correct: false },
      { text: 'No interviene ninguna glándula, solo la médula espinal.', correct: false }
    ]
  });

  Logger.log('Formulario creado: %s', form.getPublishedUrl());
  Logger.log('Editar formulario: %s', form.getEditUrl());
  return {
    publishedUrl: form.getPublishedUrl(),
    editUrl: form.getEditUrl()
  };
}

function addSection_(form, title) {
  form.addPageBreakItem().setTitle(title);
}

function addImageItem_(form, url, title) {
  const blob = UrlFetchApp.fetch(url).getBlob().setName(title + '.png');
  form.addImageItem().setTitle(title).setImage(blob).setWidth(480);
}

function addMultipleChoiceQuestion_(form, config) {
  const item = form.addMultipleChoiceItem();
  item.setTitle(config.title).setHelpText(config.helpText || '').setRequired(true).setPoints(config.points || 1);
  item.setChoices(
    config.choices.map(choice => item.createChoice(choice.text, choice.correct))
  );
}

function addCheckboxQuestion_(form, config) {
  const item = form.addCheckboxItem();
  item.setTitle(config.title).setHelpText(config.helpText || '').setRequired(true).setPoints(config.points || 1);
  item.setChoices(
    config.choices.map(choice => item.createChoice(choice.text, choice.correct))
  );
}
