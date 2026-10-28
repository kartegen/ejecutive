// Aquí se edita todo el contenido. Cada parte necesita:
//   id, nodo (nombre de la pieza en el modelo 3D), nombre, color,
//   resumen, secciones, videos (id de YouTube) y referencias.
// Si una parte no tiene secciones, la ventana muestra "contenido en preparación".

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
    ],
    aviso: 'Contenido académico: no sirve para diagnosticar ni decidir un tratamiento. Los síntomas neurológicos tras un golpe en la cabeza requieren valoración médica.',
    referencias: [
      { texto: 'Samudio Domínguez, G. C., Ortiz Cuquejo, L. M., González, L., Kusley, J., Almirón, C., & Leguizamón, K. (2019). «Mi niño ya no es mi niño». A propósito de un caso de síndrome disejecutivo secundario a higroma bifrontal. Pediatría (Asunción), 46(3), 204–208.', url: 'https://doi.org/10.31698/ped.46032019009' },
      { texto: 'Mujica-Alfonzo, A. M. (2011). Nuevo objetivo en la mira de la neuropsiquiatría: el síndrome disejecutivo y disejecutividad. Hallazgos clínicos neurológicos y psiquiátricos. Revista Chilena de Neuropsicología, 6(1), 7–11.', url: 'http://www.redalyc.org/articulo.oa?id=179322533002' },
    ],
  },
  { id: 'parietal', nodo: 'pariet', nombre: 'Lóbulo parietal', color: '#35B3A3' },
  { id: 'temporal', nodo: 'temp', nombre: 'Lóbulo temporal', color: '#2C5FA8' },
  { id: 'occipital', nodo: 'occipit', nombre: 'Lóbulo occipital', color: '#7FD1AE' },
  { id: 'cerebelo', nodo: 'cereb', nombre: 'Cerebelo', color: '#4CAF6E' },
  { id: 'tronco', nodo: 'stem', nombre: 'Tronco encefálico', color: '#6FA8DC' },
  { id: 'calloso', nodo: 'corpus', nombre: 'Cuerpo calloso', color: '#F2C14E' },
  { id: 'hipofisis', nodo: 'pitua', nombre: 'Hipófisis', color: '#F28C38' },
];
