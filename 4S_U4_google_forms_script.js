const BASE_URL = 'https://jorggefm.github.io/guiones-cyt-2026';
const IMAGE_URLS = {
  neurona: `${BASE_URL}/assets/4s_u4_examen/neurona_cuadrada.png`,
  sinapsis: `${BASE_URL}/assets/4s_u4_examen/sinapsis_cuadrada.png`,
  endocrino: `${BASE_URL}/assets/4s_u4_examen/sistema_endocrino_cuadrada.png`,
  potencial: `${BASE_URL}/assets/4s_u4_examen/potencial_membrana_cuadrada.png`
};

function create4SU4ExamForm() {
  const form = FormApp.create('4. Secundaria - U4 - Examen de Relacion y Coordinacion');

  form
    .setDescription(
      'Examen adaptado a Google Forms a partir de las fichas de estudio de 4. de Secundaria: ' +
      'senales y comunicacion, sistema nervioso, sistema endocrino y potencial de membrana.'
    )
    .setConfirmationMessage('Tu examen fue enviado correctamente.')
    .setIsQuiz(true)
    .setShuffleQuestions(false)
    .setProgressBar(true);

  addIdentityItem_(form);
  addSectionHeader_(form, 'Bloque 1 - Senales y coordinacion');

  addMultipleChoiceQuestion_(form, {
    title: '1. Segun la ficha de estudio, cual es la secuencia general correcta de la comunicacion en el cuerpo?',
    helpText: 'Pista: revisa el esquema central de la hoja "Senales y comunicacion en el cuerpo".',
    points: 1,
    choices: [
      { text: 'Estimulo -> receptor -> coordinador -> senal -> efector -> respuesta', correct: true },
      { text: 'Estimulo -> coordinador -> receptor -> senal -> respuesta -> efector', correct: false },
      { text: 'Receptor -> estimulo -> senal -> coordinador -> respuesta -> efector', correct: false },
      { text: 'Estimulo -> efector -> receptor -> coordinador -> senal -> respuesta', correct: false }
    ]
  });

  addMultipleChoiceQuestion_(form, {
    title: '2. Cuando aumenta la glucosa en sangre y se libera insulina, la senal que predomina es:',
    helpText: 'Pista: mira la lista de tipos de senales y el ejemplo de glucosa alta.',
    points: 1,
    choices: [
      { text: 'Electrica', correct: false },
      { text: 'Quimica', correct: true },
      { text: 'Luminica', correct: false },
      { text: 'Mecanica', correct: false }
    ]
  });

  addSection_(form, 'Bloque 2 - Sistema nervioso');
  addImageItem_(form, IMAGE_URLS.neurona, 'Imagen de apoyo 1 - Neurona');

  addMultipleChoiceQuestion_(form, {
    title: '3. En la imagen de la neurona, que letra senala el axon?',
    helpText: 'Pista: el axon conduce el impulso nervioso desde el soma hacia otras celulas.',
    points: 1,
    choices: [
      { text: 'A', correct: false },
      { text: 'B', correct: false },
      { text: 'C', correct: true },
      { text: 'D', correct: false }
    ]
  });

  addMultipleChoiceQuestion_(form, {
    title: '4. Que opcion explica mejor la funcion de la interneurona?',
    helpText: 'Pista: revisa la seccion "Tipos de neuronas".',
    points: 1,
    choices: [
      { text: 'Lleva informacion desde los receptores al sistema nervioso central.', correct: false },
      { text: 'Conecta neuronas dentro del sistema nervioso central e integra la informacion.', correct: true },
      { text: 'Lleva ordenes hacia los efectores, como musculos o glandulas.', correct: false },
      { text: 'Produce hormonas que viajan por la sangre.', correct: false }
    ]
  });

  addMultipleChoiceQuestion_(form, {
    title: '5. Segun la ficha del sistema nervioso, cual es la ruta nerviosa correcta?',
    helpText: 'Pista: sigue el esquema "Receptor -> ... -> Efector".',
    points: 1,
    choices: [
      { text: 'Receptor -> neurona sensorial -> sistema nervioso central -> neurona motora -> efector', correct: true },
      { text: 'Receptor -> neurona motora -> sistema nervioso central -> neurona sensorial -> efector', correct: false },
      { text: 'Sistema nervioso central -> receptor -> neurona sensorial -> efector -> neurona motora', correct: false },
      { text: 'Receptor -> hormona -> sangre -> sistema nervioso central -> efector', correct: false }
    ]
  });

  addImageItem_(form, IMAGE_URLS.sinapsis, 'Imagen de apoyo 2 - Sinapsis');

  addMultipleChoiceQuestion_(form, {
    title: '6. En la imagen de la sinapsis, que letra senala la parte desde la que se liberan neurotransmisores?',
    helpText: 'Pista: relaciona la imagen con la funcion de las terminales axonicas.',
    points: 1,
    choices: [
      { text: 'A', correct: true },
      { text: 'B', correct: false },
      { text: 'C', correct: false }
    ]
  });

  addSection_(form, 'Bloque 3 - Sistema endocrino');

  addCheckboxQuestion_(form, {
    title: '7. Selecciona todas las caracteristicas del sistema endocrino que aparecen en la ficha.',
    helpText: 'Pista: revisa la seccion "Caracteristicas" del sistema endocrino.',
    points: 1,
    choices: [
      { text: 'Mas lento que los impulsos nerviosos', correct: true },
      { text: 'Viaja por la sangre y puede actuar en lugares lejanos', correct: true },
      { text: 'Su efecto suele ser sostenido o duradero', correct: true },
      { text: 'Conduce impulsos por axones', correct: false },
      { text: 'Actua en milisegundos como respuesta tipica', correct: false }
    ]
  });

  addImageItem_(form, IMAGE_URLS.endocrino, 'Imagen de apoyo 3 - Glandulas principales');

  addMultipleChoiceQuestion_(form, {
    title: '8. En la imagen del sistema endocrino, que letra senala el pancreas?',
    helpText: 'Pista: busca la glandula relacionada con insulina y glucagon.',
    points: 1,
    choices: [
      { text: 'A', correct: false },
      { text: 'B', correct: false },
      { text: 'C', correct: true },
      { text: 'D', correct: false }
    ]
  });

  addMultipleChoiceQuestion_(form, {
    title: '9. Segun la ruta hormonal de la ficha, cual es el orden correcto?',
    helpText: 'Pista: empieza con "cambio interno o estimulo".',
    points: 1,
    choices: [
      { text: 'Cambio interno o estimulo -> glandula endocrina -> hormona -> sangre -> celula diana -> respuesta', correct: true },
      { text: 'Hormona -> glandula endocrina -> sangre -> celula diana -> respuesta -> cambio interno', correct: false },
      { text: 'Cambio interno o estimulo -> sangre -> glandula endocrina -> celula diana -> hormona -> respuesta', correct: false },
      { text: 'Glandula endocrina -> cambio interno o estimulo -> hormona -> celula diana -> sangre -> respuesta', correct: false }
    ]
  });

  addSection_(form, 'Bloque 4 - Potencial de membrana y aplicacion');

  addCheckboxQuestion_(form, {
    title: '10. Marca todas las afirmaciones correctas sobre el potencial de membrana en reposo.',
    helpText: 'Pista: revisa la parte superior de la hoja "Potencial de membrana y potencial de accion".',
    points: 1,
    choices: [
      { text: 'Hay mas Na+ afuera que adentro.', correct: true },
      { text: 'Hay mas K+ adentro que afuera.', correct: true },
      { text: 'Dentro de la celula hay proteinas con carga negativa.', correct: true },
      { text: 'La bomba Na+/K+ expulsa 3 Na+ e introduce 2 K+.', correct: true },
      { text: 'La membrana deja pasar todos los iones por igual.', correct: false },
      { text: 'En reposo, el interior es mas positivo que el exterior.', correct: false }
    ]
  });

  addImageItem_(form, IMAGE_URLS.potencial, 'Imagen de apoyo 4 - Potencial de membrana');

  addMultipleChoiceQuestion_(form, {
    title: '11. En la imagen, que momento representa la entrada de Na+ y la subida del voltaje?',
    helpText: 'Pista: identifica el cuadro en el que Na+ entra a la celula.',
    points: 1,
    choices: [
      { text: 'A', correct: false },
      { text: 'B', correct: true },
      { text: 'C', correct: false },
      { text: 'D', correct: false }
    ]
  });

  addMultipleChoiceQuestion_(form, {
    title: '12. Despues de comer, aumenta la glucosa en sangre. Que explicacion es la mas completa segun tus fichas?',
    helpText: 'Pista: integra el ejemplo de glucosa e insulina con la ruta hormonal.',
    points: 1,
    choices: [
      { text: 'Predomina una respuesta endocrina: el pancreas libera insulina, la hormona viaja por la sangre y actua en celulas diana.', correct: true },
      { text: 'Predomina una respuesta nerviosa: la glucosa viaja por axones hasta los musculos.', correct: false },
      { text: 'Predomina una senal luminica porque el cuerpo detecta el cambio muy rapido.', correct: false },
      { text: 'No interviene ninguna glandula, solo la medula espinal.', correct: false }
    ]
  });

  Logger.log('Formulario creado: %s', form.getPublishedUrl());
  Logger.log('Editar formulario: %s', form.getEditUrl());

  return {
    publishedUrl: form.getPublishedUrl(),
    editUrl: form.getEditUrl()
  };
}

function addIdentityItem_(form) {
  form
    .addTextItem()
    .setTitle('Nombre o codigo del estudiante')
    .setHelpText('Escribe tu nombre o un codigo identificador.')
    .setRequired(true);
}

function addSectionHeader_(form, title) {
  form
    .addSectionHeaderItem()
    .setTitle(title)
    .setHelpText('Responde las preguntas de este bloque antes de pasar al siguiente.');
}

function addSection_(form, title) {
  form.addPageBreakItem().setTitle(title);
}

function addImageItem_(form, url, title) {
  const blob = UrlFetchApp.fetch(url).getBlob().setName(`${title}.png`);
  form.addImageItem().setTitle(title).setImage(blob).setWidth(480);
}

function addMultipleChoiceQuestion_(form, config) {
  const item = form.addMultipleChoiceItem();
  item.setTitle(config.title).setHelpText(config.helpText || '').setRequired(true).setPoints(config.points || 1);
  item.setChoices(config.choices.map(choice => item.createChoice(choice.text, choice.correct)));
}

function addCheckboxQuestion_(form, config) {
  const item = form.addCheckboxItem();
  item.setTitle(config.title).setHelpText(config.helpText || '').setRequired(true).setPoints(config.points || 1);
  item.setChoices(config.choices.map(choice => item.createChoice(choice.text, choice.correct)));
}
