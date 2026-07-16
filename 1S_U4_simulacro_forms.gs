const SIMULACRO_1S_U4 = {
  title: '1S U4 - Simulacro de examen - La Tierra y los suelos',
  description:
    'Simulacro previo al examen de Ciencia y Tecnologia para 1.° de secundaria. ' +
    'Basado en Oceano Pacifico y Cinturon de Fuego, contaminacion y gases de efecto invernadero, ' +
    'formacion del suelo y permeabilidad del suelo.',
  images: {
    aguaSuelos: 'https://jorggefm.github.io/guiones-cyt-2026/assets/1s-simulacro/01_direccion_agua_suelos.png',
    geiCalor: 'https://jorggefm.github.io/guiones-cyt-2026/assets/1s-simulacro/02_efecto_invernadero_calor.png',
    chacraLluvia: 'https://jorggefm.github.io/guiones-cyt-2026/assets/1s-simulacro/03_chacra_lluvia_suelos.png',
    cuadernoPacifico: 'https://jorggefm.github.io/guiones-cyt-2026/assets/1s-simulacro/04_cuaderno_pacifico_cinturon_fuego.png',
    cuadernoGei: 'https://jorggefm.github.io/guiones-cyt-2026/assets/1s-simulacro/05_cuaderno_contaminacion_gei.png',
    cuadernoSuelo: 'https://jorggefm.github.io/guiones-cyt-2026/assets/1s-simulacro/06_cuaderno_formacion_suelo.png',
    cuadernoPermeabilidad: 'https://jorggefm.github.io/guiones-cyt-2026/assets/1s-simulacro/07_cuaderno_permeabilidad.png'
  }
};

function crearSimulacro1SU4() {
  const form = FormApp.create(SIMULACRO_1S_U4.title)
    .setDescription(SIMULACRO_1S_U4.description)
    .setConfirmationMessage('Simulacro enviado.')
    .setShuffleQuestions(false)
    .setProgressBar(true)
    .setAllowResponseEdits(false);

  agregarIntro_(form);

  agregarImagen_(form, SIMULACRO_1S_U4.images.cuadernoPacifico, 'Material 1: Oceano Pacifico, Cinturon de Fuego y subduccion');
  agregarPreguntaOpcion_(
    form,
    '1. Alternativa contextualizada',
    'En el Peru ocurren muchos sismos porque:',
    [
      'A) esta lejos del oceano Pacifico',
      'B) la placa de Nazca se hunde bajo la placa Sudamericana',
      'C) no existen montanas',
      'D) el clima es muy calido'
    ],
    'B) la placa de Nazca se hunde bajo la placa Sudamericana'
  );
  agregarPreguntaOpcion_(
    form,
    '2. Ordenamiento',
    'Elige la secuencia correcta que explica la relacion geologica en el Peru:',
    [
      'Placa Sudamericana subduce debajo de la placa de Nazca -> se forma el oceano Pacifico -> no hay sismos',
      'Placa de Nazca subduce debajo de la placa Sudamericana -> ocurren sismos -> se relaciona con la cordillera de los Andes',
      'Primero se forman los Andes -> luego aparece la placa de Nazca -> despues ocurren sismos',
      'Los sismos ocurren sin relacion con las placas tectonicas'
    ],
    'Placa de Nazca subduce debajo de la placa Sudamericana -> ocurren sismos -> se relaciona con la cordillera de los Andes'
  );

  agregarImagen_(form, SIMULACRO_1S_U4.images.aguaSuelos, 'Material 2: Direccion del agua en distintos suelos');
  agregarPreguntaTexto_(
    form,
    '3. Imagen con flechas',
    'Observa la imagen y explica como pasa el agua en el suelo arenoso, en el suelo con humus y en el suelo arcilloso.'
  );
  agregarPreguntaTexto_(
    form,
    '4. Relacion estructura-funcion',
    'Explica por que el suelo con humus conserva mejor la humedad que el suelo arenoso.'
  );

  agregarImagen_(form, SIMULACRO_1S_U4.images.cuadernoPermeabilidad, 'Material 3: Idea clave sobre permeabilidad');
  agregarPreguntaTexto_(
    form,
    '5. Comparacion',
    'Compara el suelo arenoso y el suelo arcilloso en su permeabilidad.'
  );
  agregarPreguntaTexto_(
    form,
    '6. Caso simple',
    'En una chacra en ladera llueve fuerte. Que tipo de suelo ayudaria mas a conservar humedad sin perder el agua demasiado rapido: arenoso, con humus o arcilloso? Justifica.'
  );

  agregarImagen_(form, SIMULACRO_1S_U4.images.geiCalor, 'Material 4: Como los gases de efecto invernadero atrapan el calor');
  agregarPreguntaTexto_(
    form,
    '7. Imagen interpretativa',
    'Explica por que el calor del Sol entra, pero una parte queda atrapada cuando hay gases de efecto invernadero.'
  );
  agregarPreguntaTexto_(
    form,
    '8. Imagen con capas o niveles',
    'Que capa o zona rodea a la Tierra en la imagen y participa en el atrapamiento del calor? Explica su funcion.'
  );

  agregarImagen_(form, SIMULACRO_1S_U4.images.cuadernoGei, 'Material 5: Contaminacion, GEI, glaciares y consecuencias');
  agregarPreguntaTexto_(
    form,
    '9. Vocabulario cientifico tolerante',
    'Explica con tus palabras que son los gases de efecto invernadero y nombra al menos dos ejemplos.'
  );
  agregarPreguntaOpcion_(
    form,
    '10. Ordenamiento o secuencia visual',
    'Elige la secuencia correcta desde la causa hasta la consecuencia:',
    [
      'Mas agua en rios -> glaciares crecen -> disminuyen los gases -> baja la temperatura',
      'Gases de efecto invernadero -> mas calor atrapado -> deshielo de glaciares -> menos agua en rios',
      'Glaciares se derriten -> aparecen los gases -> luego entra la luz solar',
      'Contaminacion -> aparecen montanas -> aumenta el nivel del mar'
    ],
    'Gases de efecto invernadero -> mas calor atrapado -> deshielo de glaciares -> menos agua en rios'
  );

  agregarImagen_(form, SIMULACRO_1S_U4.images.cuadernoSuelo, 'Material 6: Formacion del suelo');
  agregarPreguntaTexto_(
    form,
    '11. Respuesta breve causal',
    'Por que la meteorizacion es importante para que exista suelo fertil?'
  );

  agregarImagen_(form, SIMULACRO_1S_U4.images.chacraLluvia, 'Material 7: Que pasa con el agua en una chacra despues de una lluvia');
  agregarPreguntaTexto_(
    form,
    '12. Pregunta integradora',
    'Relaciona lo aprendido sobre placas tectonicas, sismos, formacion del suelo y permeabilidad para explicar por que en el Peru es importante cuidar el suelo.'
  );

  Logger.log('Editar: ' + form.getEditUrl());
  Logger.log('Responder: ' + form.getPublishedUrl());

  return {
    editUrl: form.getEditUrl(),
    responderUrl: form.getPublishedUrl()
  };
}

function agregarIntro_(form) {
  form.addSectionHeaderItem()
    .setTitle('Indicaciones')
    .setHelpText('Responde usando vocabulario cientifico cuando corresponda. Justifica con ideas de las imagenes y de clase.');
}

function agregarImagen_(form, url, titulo) {
  const blob = UrlFetchApp.fetch(url).getBlob();
  blob.setName(titulo + '.png');
  form.addImageItem()
    .setTitle(titulo)
    .setImage(blob);
}

function agregarPreguntaOpcion_(form, titulo, enunciado, opciones, correcta) {
  const item = form.addMultipleChoiceItem();
  item.setTitle(titulo)
    .setHelpText(enunciado)
    .setRequired(true)
    .setChoices(
      opciones.map(function(opcion) {
        return item.createChoice(opcion, opcion === correcta);
      })
    );
}

function agregarPreguntaTexto_(form, titulo, enunciado) {
  form.addParagraphTextItem()
    .setTitle(titulo)
    .setHelpText(enunciado)
    .setRequired(true);
}
