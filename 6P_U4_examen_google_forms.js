function buildSixthGradeU4Exam() {
  var config = {
    title: '6P U4 - Examen de Ecosistemas y Biodiversidad',
    description: [
      'Sexto de Primaria - Unidad 4',
      'Temas: ecosistemas, biodiversidad, amenazas y cuidado del ambiente.',
      'Escribe tu nombre completo antes de empezar.',
      'Este formulario no recoge correo y no exige correo institucional.',
      'Nota tecnica: algunas preguntas fueron adaptadas al formato disponible en Google Forms.'
    ].join('\n'),
    showHints: false,
    imageBase: 'https://jorggefm.github.io/guiones-cyt-2026/assets/6p_u4_examen/'
  };

  var imageUrls = {
    cadena: config.imageBase + '01_cadena_alimenticia.png',
    amenaza: config.imageBase + '02_amenaza_biodiversidad.png',
    clasifica: config.imageBase + '03_bioticos_abioticos.png',
    secuencia: config.imageBase + '04_secuencia_cuidado_ambiente.png'
  };

  var form = FormsApp.create(config.title);
  form.setDescription(config.description);
  form.setIsQuiz(true);
  form.setCollectEmail(false);
  form.setShuffleQuestions(false);
  form.setProgressBar(true);
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(true);
  form.setConfirmationMessage('Tu examen fue enviado. Gracias por participar.');
  if (typeof form.setRequireLogin === 'function') {
    form.setRequireLogin(false);
  }

  addIntroSection_(form);
  addStudentName_(form);

  addMultipleChoice_(
    form,
    '1. Alternativa contextualizada',
    'En una comunidad cercana al bosque, algunas personas botan basura al rio. ¿Que accion ayuda mas a cuidar el ecosistema?',
    [
      { value: 'Seguir botando residuos porque el agua se los lleva.', correct: false },
      { value: 'Separar residuos y evitar contaminar el rio.', correct: true },
      { value: 'Cortar mas arboles para que el area se vea ordenada.', correct: false },
      { value: 'Atrapar animales del lugar para alejarlos.', correct: false }
    ],
    'Piensa en la accion que protege a los seres vivos y al agua.',
    config.showHints,
    1
  );

  addMultipleChoice_(
    form,
    '2. Ordenamiento',
    '¿Cual es el orden correcto desde lo que produce energia hasta el consumidor final?',
    [
      { value: 'planta -> ave -> saltamontes -> zorro', correct: false },
      { value: 'sol -> planta -> saltamontes -> ave', correct: true },
      { value: 'zorro -> ave -> planta -> sol', correct: false },
      { value: 'saltamontes -> planta -> ave -> sol', correct: false }
    ],
    'Recuerda que la energia empieza en el Sol y pasa a los productores.',
    config.showHints,
    1
  );

  addImageQuestion_(
    form,
    imageUrls.cadena,
    'Cadena alimenticia para interpretar',
    'Observa la imagen y responde la siguiente pregunta.'
  );
  addMultipleChoice_(
    form,
    '3. Imagen con flechas',
    'Segun la imagen, ¿que ser vivo se alimenta directamente de la planta?',
    [
      { value: 'El zorro', correct: false },
      { value: 'El ave', correct: false },
      { value: 'El saltamontes', correct: true },
      { value: 'Todos al mismo tiempo', correct: false }
    ],
    'Observa la primera flecha que sale de la planta.',
    config.showHints,
    1
  );

  addImageQuestion_(
    form,
    imageUrls.amenaza,
    'Amenaza a la biodiversidad',
    'Observa la escena y responde.'
  );
  addMultipleChoice_(
    form,
    '4. Imagen interpretativa',
    '¿Que problema ambiental se observa principalmente en la imagen?',
    [
      { value: 'Cuidado responsable de un bosque.', correct: false },
      { value: 'Deforestacion y contaminacion que afectan la biodiversidad.', correct: true },
      { value: 'Siembra de cultivos nativos.', correct: false },
      { value: 'Proteccion de animales en su habitat.', correct: false }
    ],
    'Fijate en los arboles cortados, el humo y la basura en el agua.',
    config.showHints,
    1
  );

  addMultipleChoice_(
    form,
    '5. Relacion estructura-funcion',
    '¿Que opcion relaciona correctamente un ser vivo con una funcion de la biodiversidad?',
    [
      { value: 'La abeja - ayuda en la polinizacion.', correct: true },
      { value: 'La roca - produce semillas.', correct: false },
      { value: 'El agua - vuela para llevar polen.', correct: false },
      { value: 'El suelo - caza insectos en el aire.', correct: false }
    ],
    'Busca la opcion donde la funcion si corresponde al ser vivo.',
    config.showHints,
    1
  );

  addParagraph_(
    form,
    '6. Respuesta breve causal',
    '¿Por que la perdida de variedades de papa o maiz puede ser un problema para las personas y para la biodiversidad?',
    'Piensa en la idea de variedad genetica y en lo que pasaria si todas fueran iguales.',
    config.showHints
  );

  addImageQuestion_(
    form,
    imageUrls.clasifica,
    'Elementos para clasificar',
    'Observa los seis elementos y responde.'
  );
  addCheckbox_(
    form,
    '7. Imagen',
    'Marca los elementos bioticos que ves en la imagen.',
    [
      { value: 'Arbol', correct: true },
      { value: 'Ave', correct: true },
      { value: 'Hongo', correct: true },
      { value: 'Agua', correct: false },
      { value: 'Luz solar', correct: false },
      { value: 'Suelo', correct: false }
    ],
    'Los elementos bioticos son seres vivos.',
    config.showHints,
    1
  );

  addShortAnswer_(
    form,
    '8. Vocabulario cientifico tolerante',
    'Escribe con tus palabras que significa biodiversidad.',
    'Usa ideas como variedad de seres vivos, ecosistemas o relaciones.',
    config.showHints
  );

  addImageQuestion_(
    form,
    imageUrls.secuencia,
    'Secuencia de cuidado ambiental',
    'Observa las cuatro escenas y responde.'
  );
  addMultipleChoice_(
    form,
    '9. Ordenamiento o secuencia visual',
    '¿Cual opcion resume mejor la secuencia que muestra la imagen?',
    [
      { value: 'contaminar -> botar -> olvidar -> ensuciar', correct: false },
      { value: 'separar -> reutilizar -> reciclar -> cuidar el lugar', correct: true },
      { value: 'cortar -> quemar -> botar -> esconder', correct: false },
      { value: 'reusar -> ensuciar -> mezclar -> abandonar', correct: false }
    ],
    'Mira el orden de las acciones positivas de izquierda a derecha.',
    config.showHints,
    1
  );

  addParagraph_(
    form,
    '10. Comparacion',
    'Compara un elemento biotico y un elemento abiotico del ecosistema. ¿En que se diferencian?',
    'Uno es un ser vivo y el otro no. Da un ejemplo de cada uno.',
    config.showHints
  );

  addMultipleChoice_(
    form,
    '11. Caso simple del tema',
    'En un campo ya no se ven muchas abejas y por eso algunas plantas producen menos frutos. ¿Que nivel de biodiversidad o funcion esta siendo afectado principalmente?',
    [
      { value: 'La polinizacion, que es parte de la biodiversidad funcional.', correct: true },
      { value: 'Solo el color de las flores, sin afectar nada mas.', correct: false },
      { value: 'El tamaño de las rocas del campo.', correct: false },
      { value: 'La cantidad de nubes en el cielo, sin relacion con las abejas.', correct: false }
    ],
    'Piensa en la funcion que ayudan a cumplir las abejas.',
    config.showHints,
    1
  );

  addParagraph_(
    form,
    '12. Pregunta integradora',
    'Imagina que en un humedal hay basura, menos agua y menos aves. Explica que componentes del ecosistema se estan alterando y propone una accion para ayudar a recuperarlo.',
    'Relaciona seres vivos, elementos no vivos, amenazas y una solucion concreta.',
    config.showHints
  );

  Logger.log('Formulario creado: ' + form.getPublishedUrl());
  Logger.log('Editar formulario: ' + form.getEditUrl());
}

function addIntroSection_(form) {
  form.addSectionHeaderItem()
    .setTitle('Instrucciones')
    .setHelpText(
      'Lee con calma cada pregunta. Algunas incluyen imagenes. ' +
      'Marca una sola respuesta cuando corresponda y escribe con tus propias palabras en las preguntas abiertas. ' +
      'Antes de empezar, coloca tu nombre completo.'
    );
}

function addStudentName_(form) {
  var item = form.addTextItem();
  item.setTitle('Nombre completo');
  item.setRequired(true);
  item.setHelpText('Escribe tus nombres y apellidos.');
}

function addImageQuestion_(form, imageUrl, title, helpText) {
  var blob = UrlFetchApp.fetch(imageUrl).getBlob().setName(title + '.png');
  form.addImageItem()
    .setTitle(title)
    .setHelpText(helpText || '')
    .setImage(blob);
}

function addMultipleChoice_(form, title, question, options, hint, showHint, points) {
  var item = form.addMultipleChoiceItem();
  item.setTitle(title + '\n' + question);
  item.setRequired(true);
  if (showHint && hint) {
    item.setHelpText('Pista: ' + hint);
  }
  item.setChoices(options.map(function(option) {
    return item.createChoice(option.value, option.correct);
  }));
  if (typeof points === 'number') {
    item.setPoints(points);
  }
}

function addCheckbox_(form, title, question, options, hint, showHint, points) {
  var item = form.addCheckboxItem();
  item.setTitle(title + '\n' + question);
  item.setRequired(true);
  if (showHint && hint) {
    item.setHelpText('Pista: ' + hint);
  }
  item.setChoices(options.map(function(option) {
    return item.createChoice(option.value, option.correct);
  }));
  if (typeof points === 'number') {
    item.setPoints(points);
  }
}

function addShortAnswer_(form, title, question, hint, showHint) {
  var item = form.addTextItem();
  item.setTitle(title + '\n' + question);
  item.setRequired(true);
  if (showHint && hint) {
    item.setHelpText('Pista: ' + hint);
  }
}

function addParagraph_(form, title, question, hint, showHint) {
  var item = form.addParagraphTextItem();
  item.setTitle(title + '\n' + question);
  item.setRequired(true);
  if (showHint && hint) {
    item.setHelpText('Pista: ' + hint);
  }
}
