// Aquí se edita todo el contenido. Cada parte necesita:
//   id, nodo (nombre de la pieza en el modelo 3D), nombre, color,
//   resumen, secciones, videos (id de YouTube) y referencias.
// Si una parte no tiene secciones, la ventana muestra "contenido en preparación".

const AVISO = 'Contenido académico: no sirve para diagnosticar ni decidir un tratamiento. Los síntomas neurológicos tras un golpe en la cabeza requieren valoración médica.';
const REF_SAMUDIO = { texto: 'Samudio Domínguez, G. C., Ortiz Cuquejo, L. M., González, L., Kusley, J., Almirón, C., & Leguizamón, K. (2019). «Mi niño ya no es mi niño». A propósito de un caso de síndrome disejecutivo secundario a higroma bifrontal. Pediatría (Asunción), 46(3), 204–208.', url: 'https://doi.org/10.31698/ped.46032019009' };
const REF_MUJICA = { texto: 'Mujica-Alfonzo, A. M. (2011). Nuevo objetivo en la mira de la neuropsiquiatría: el síndrome disejecutivo y disejecutividad. Hallazgos clínicos neurológicos y psiquiátricos. Revista Chilena de Neuropsicología, 6(1), 7–11.', url: 'http://www.redalyc.org/articulo.oa?id=179322533002' };

export const PARTES = [
  {
    id: 'frontal', nodo: 'frontal', nombre: 'Lóbulo frontal', color: '#3F8FD2',
    resumen: 'Participa en dirigir y regular la conducta. Su lesión puede producir el síndrome disejecutivo.',
    videos: [
      { id: 'yrCPnNc-YJY', titulo: 'Síndrome disejecutivo' },
      { id: 'o4Vpj6Zkfuc', titulo: 'Funciones ejecutivas y síndrome disejecutivo' },
    ],
    secciones: [
      {
        titulo: 'Síndrome disejecutivo',
        parrafos: [
          'También llamado síndrome prefrontal o frontal, es un conjunto de alteraciones asociadas a lesiones de la zona frontal, sobre todo de la corteza prefrontal. Puede afectar la cognición, la memoria, la atención, el movimiento y la conducta.',
          'No es «portarse mal» ni falta de voluntad: hay una alteración cerebral que dificulta regular respuestas, iniciar acciones, mantener la atención o tomar decisiones. A veces el cambio de personalidad es tan notorio que la familia siente que la persona «ya no es la misma».',
        ],
      },
      {
        titulo: 'Funciones ejecutivas',
        parrafos: ['Funcionan como un sistema de dirección: formular una meta, organizar los pasos, mantener la información necesaria, cambiar de estrategia, frenar respuestas automáticas y revisar si lo que se hace funciona.'],
        items: [
          ['**Flexibilidad (shifting)**', 'Cambiar entre tareas, reglas o procesos mentales cuando una estrategia deja de servir.'],
          ['**Inhibición**', 'Frenar respuestas automáticas que no son pertinentes.'],
          ['**Memoria de trabajo**', 'Mantener información de forma temporal y actualizarla según la tarea.'],
          ['Planificación y supervisión', 'Anticipar y ordenar los pasos; revisar lo que se hace y corregir errores.'],
          ['Toma de decisiones', 'Comparar alternativas y elegir una respuesta.'],
        ],
      },
      {
        titulo: 'Relación con los lóbulos frontales',
        parrafos: [
          'Los lóbulos frontales, en particular la corteza prefrontal, participan en el control del comportamiento y se conectan con otras áreas cerebrales. Una lesión frontal puede afectar también funciones de las cortezas motora y premotora y de regiones conectadas; por eso pueden aparecer a la vez alteraciones cognitivas, de atención, memoria, movimiento y conducta.',
          'Distintas regiones frontales participan en procesos parcialmente diferentes, así que las lesiones no producen un único patrón de síntomas. Como antecedente histórico se cita a Phineas Gage, un trabajador ferroviario que, tras una lesión frontal, tuvo cambios importantes de personalidad.',
        ],
      },
      {
        titulo: 'Tres perfiles frontales',
        parrafos: ['Descritos por Samudio Domínguez et al. (2019). Organizan las manifestaciones; no sirven para autodiagnosticarse.'],
        items: [
          ['Dorsolateral', 'Perfil seudodepresivo con dificultades de flexibilidad. Rasgo característico: la **perseveración**, repetir una respuesta aunque ya no sea útil. También alteraciones de la memoria de trabajo y de contexto.'],
          ['Orbitofrontal', 'Conductas desinhibidas, pueriles y egocéntricas, a veces de apariencia maníaca (perfil seudopsicopático). Cuesta frenar respuestas y valorar si una conducta es apropiada.'],
          ['Mediobasal o cingular', 'Alteraciones de la memoria emocional, la supervisión atencional y la toma de decisiones.'],
        ],
      },
      {
        titulo: 'Manifestaciones clínicas',
        parrafos: ['No aparecen todas en cada paciente; se interpretan junto con la evolución, la historia clínica y la exploración médica.'],
        items: [
          ['Conducta y emociones', 'Irritabilidad, agresividad, **desinhibición**, **apatía** (menor interés o motivación) y **abulia** (reducción marcada de la iniciativa).'],
          ['Actividad', 'Acinesia, mutismo acinético, agitación psicomotora y coprolalia.'],
          ['Memoria y marcha', 'Lagunas de memoria, marcha frontal, ataxia y apraxia de la marcha.'],
          ['Causas posibles', 'Traumatismo craneoencefálico, procesos degenerativos y tumores.'],
        ],
      },
      {
        titulo: 'Caso clínico: «Mi niño ya no es mi niño»',
        parrafos: [
          'Adolescente de 14 años que fue golpeado por un automóvil. Al inicio no hubo pérdida del conocimiento ni déficit motor o sensitivo. Con los días aparecieron abulia, irritabilidad, mutismo acinético, alteración de la marcha, pérdida de memoria y agresividad hacia sus padres; después, agitación psicomotora, coprolalia y ataxia.',
          'La resonancia mostró microcontusiones bifrontales y biparietales y, más tarde, un **higroma subdural** frontal bilateral (acumulación de líquido cefalorraquídeo en el espacio subdural) con importante **efecto de masa**.',
          'Tras la trepanación y el drenaje mejoraron los síntomas y las funciones ejecutivas, pero el síndrome no desapareció por completo. Había otras lesiones, así que no todo se atribuye al higroma.',
        ],
      },
      {
        titulo: 'Evaluación y relevancia clínica',
        parrafos: [
          'La valoración integra la historia del problema (qué ocurrió, cuándo empezaron los cambios y cómo evolucionaron), los cambios de personalidad y conducta que notan la persona y su familia, la atención, la memoria, la iniciativa, la flexibilidad y el control de respuestas, la marcha y otros signos neurológicos, la exploración médica y los estudios de imagen cuando el cuadro lo indique.',
          'Los autores recomiendan tener presente la posibilidad de un higroma prefrontal cuando, tras un traumatismo craneoencefálico, aparecen o empeoran con los días síntomas disejecutivos. No es adecuado inferir una lesión o un diagnóstico a partir de una conducta aislada.',
        ],
      },
      {
        titulo: 'Aportación de Mujica-Alfonzo (2011)',
        parrafos: ['Su artículo sitúa el síndrome disejecutivo y la disejecutividad en la neuropsiquiatría: interesa reconocer tanto las manifestaciones neurológicas como las psiquiátricas, y cómo se expresa la alteración ejecutiva en la vida de la persona (tareas cognitivas, regulación de respuestas, conducta e interacción social).'],
      },
      {
        titulo: 'Conclusión',
        parrafos: ['Algunos cambios de conducta tras un traumatismo tienen una base neurológica y deben entenderse dentro de la historia clínica de la persona, no como simple mala conducta. Reconocerlos y evaluarlos a tiempo es importante para orientar la atención.'],
      },
    ],
    aviso: AVISO,
    referencias: [REF_SAMUDIO, REF_MUJICA],
  },
  {
    id: 'parietal', nodo: 'pariet', nombre: 'Lóbulo parietal', color: '#35B3A3',
    resumen: 'Procesa la información sensorial del cuerpo y participa en la orientación espacial.',
    secciones: [
      { titulo: 'Función', parrafos: [
        'Procesa la información sensorial del cuerpo, como el tacto, la temperatura, el dolor y la posición corporal. También participa en la **orientación espacial**.',
        'Ejemplo: sentir que un objeto está caliente al tocarlo.',
      ] },
      {
        titulo: 'Hallazgos en el caso clínico',
        parrafos: [
          'La primera resonancia magnética del adolescente mostró múltiples microcontusiones hemorrágicas en proceso de reabsorción, principalmente bifrontales y **biparietales**.',
          'También se describió una hemorragia subaracnoidea traumática. Como el paciente tenía varias lesiones, no es posible atribuir cada síntoma a una sola de ellas.',
        ],
      },
    ],
    aviso: AVISO,
    referencias: [REF_SAMUDIO],
  },
  {
    id: 'temporal', nodo: 'temp', nombre: 'Lóbulo temporal', color: '#2C5FA8',
    resumen: 'Participa en el lenguaje, la memoria y el procesamiento auditivo.',
    secciones: [
      { titulo: 'Función', parrafos: [
        'Participa en la comprensión del lenguaje, la **memoria**, el reconocimiento de sonidos y el procesamiento de la información auditiva.',
        'Ejemplo: recordar una conversación o comprender lo que dice un profesor.',
      ] },
    ],
  },
  {
    id: 'occipital', nodo: 'occipit', nombre: 'Lóbulo occipital', color: '#7FD1AE',
    resumen: 'Es el principal encargado de procesar la información visual.',
    secciones: [
      { titulo: 'Función', parrafos: [
        'Es el principal encargado de procesar la **información visual** que recibimos a través de los ojos, como formas, colores y movimiento.',
        'Ejemplo: reconocer el color rojo de una manzana.',
      ] },
    ],
  },
  {
    id: 'cerebelo', nodo: 'cereb', nombre: 'Cerebelo', color: '#4CAF6E',
    resumen: 'Coordina los movimientos y mantiene el equilibrio.',
    secciones: [
      { titulo: 'Función', parrafos: [
        'Es la estructura encargada de **coordinar los movimientos**, mantener el **equilibrio**, regular la postura y contribuir a la precisión de los movimientos y al aprendizaje motor.',
        'Ejemplo: mantener el equilibrio al caminar o coordinar los movimientos al correr.',
      ] },
    ],
  },
  {
    id: 'tronco', nodo: 'stem', nombre: 'Tronco encefálico', color: '#6FA8DC',
    resumen: 'Conecta el cerebro con la médula espinal y regula funciones vitales.',
    secciones: [
      { titulo: 'Función', parrafos: [
        'Conecta el cerebro con la médula espinal y regula **funciones vitales** automáticas, como la respiración, la frecuencia cardíaca y la presión arterial. También participa en el sueño y el estado de alerta.',
        'Ejemplo: respirar automáticamente mientras dormimos.',
      ] },
    ],
  },
  {
    id: 'calloso', nodo: 'corpus', nombre: 'Cuerpo calloso', color: '#F2C14E',
    resumen: 'Conecta los hemisferios derecho e izquierdo y les permite intercambiar información.',
    secciones: [
      { titulo: 'Función', parrafos: [
        'Es una estructura formada por fibras nerviosas que **conecta los hemisferios** cerebrales derecho e izquierdo y permite que intercambien información.',
        'Ejemplo: integrar información que se procesa en ambos hemisferios para realizar una actividad.',
      ] },
      {
        titulo: 'Hallazgo en el caso clínico',
        parrafos: [
          'La discusión del caso menciona una **lesión axonal** en el esplenio del cuerpo calloso, junto con las microcontusiones frontales y parietales y una hemorragia subaracnoidea traumática.',
          'Esta lesión se suma al higroma subdural frontal bilateral, por eso el caso no permite atribuir cada síntoma a una sola lesión, aunque la mejoría tras el drenaje muestra la relevancia clínica de la colección.',
        ],
      },
    ],
    aviso: AVISO,
    referencias: [REF_SAMUDIO],
  },
  {
    id: 'hipofisis', nodo: 'pitua', nombre: 'Hipófisis', color: '#F28C38',
    resumen: 'Glándula endocrina que produce y libera hormonas.',
    secciones: [
      { titulo: 'Función', parrafos: [
        'También llamada glándula pituitaria, es una glándula endocrina situada en la base del cerebro que produce y libera **hormonas** que regulan funciones como el crecimiento, la reproducción y la actividad de otras glándulas. Su funcionamiento está coordinado principalmente con el hipotálamo.',
        'Ejemplo: liberar la hormona del crecimiento durante el desarrollo.',
      ] },
    ],
  },
];
