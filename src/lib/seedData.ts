import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  limit,
} from 'firebase/firestore'
import { db, COLLECTIONS } from './firebase'

// ─── Seed mínimo — solo estructura de categorías y subtemas de ejemplo ─────────
// Las respuestas reales se crean desde el panel administrador.

const CATEGORIES_SEED = [
  {
    name: 'Comités de Aplicación',
    description: 'Conformación, roles y funcionamiento de los comités responsables de aplicar el protocolo',
    keywords: ['comité', 'comites', 'aplicación', 'aplicacion', 'conformar', 'integrantes', 'miembros', 'roles', 'funciones', 'estructura', 'organizar', 'comite'],
    icon: '👥',
    order: 1,
    active: true,
    updatedBy: 'Sistema',
  },
  {
    name: 'Difusión',
    description: 'Estrategias para comunicar e informar el protocolo a los colaboradores',
    keywords: ['difusion', 'difusión', 'comunicar', 'informar', 'colaboradores', 'divulgar', 'socializar', 'comunicacion', 'comunicación', 'sensibilizar', 'campaña', 'mensaje'],
    icon: '📢',
    order: 2,
    active: true,
    updatedBy: 'Sistema',
  },
  {
    name: 'Uso Plataforma y Aplicación Cuestionario',
    description: 'Acceso, configuración y uso de la plataforma para aplicar el cuestionario',
    keywords: ['plataforma', 'cuestionario', 'aplicar', 'acceso', 'sistema', 'aplicacion', 'aplicación', 'formulario', 'encuesta', 'login', 'usuario', 'contraseña', 'clave', 'claves', 'link', 'enlace'],
    icon: '💻',
    order: 3,
    active: true,
    updatedBy: 'Sistema',
  },
  {
    name: 'Análisis de Resultados',
    description: 'Interpretación de resultados, informes y reportes del protocolo',
    keywords: ['análisis', 'analisis', 'resultados', 'interpretacion', 'interpretación', 'informe', 'datos', 'reporte', 'dimensiones', 'puntaje', 'score', 'nivel', 'riesgo', 'estadistica', 'estadística'],
    icon: '📊',
    order: 4,
    active: true,
    updatedBy: 'Sistema',
  },
  {
    name: 'Grupo de Discusión',
    description: 'Organización y facilitación de grupos de discusión con colaboradores',
    keywords: ['grupo', 'discusion', 'discusión', 'grupos', 'sesion', 'sesión', 'participantes', 'facilitador', 'taller', 'reunion', 'reunión', 'focus'],
    icon: '🗣️',
    order: 5,
    active: true,
    updatedBy: 'Sistema',
  },
  {
    name: 'Intervención y Prescripción Psicosocial',
    description: 'Diseño e implementación de medidas de intervención y prescripción psicosocial',
    keywords: ['intervencion', 'intervención', 'prescripcion', 'prescripción', 'medidas', 'acciones', 'plan', 'psicosocial', 'implementar', 'actividades', 'programa', 'prescribir'],
    icon: '🧠',
    order: 6,
    active: true,
    updatedBy: 'Sistema',
  },
  {
    name: 'Verificación Cumplimiento Intervención Psicosocial',
    description: 'Seguimiento y verificación del cumplimiento de las intervenciones psicosociales',
    keywords: ['verificacion', 'verificación', 'cumplimiento', 'seguimiento', 'evidencia', 'comprobar', 'validar', 'control', 'monitoreo', 'check', 'auditoria', 'auditoría'],
    icon: '✅',
    order: 7,
    active: true,
    updatedBy: 'Sistema',
  },
  {
    name: 'Reevaluación',
    description: 'Proceso y plazos para la reevaluación del protocolo psicosocial',
    keywords: ['reevaluacion', 'reevaluación', 'reevaluar', 'nueva evaluacion', 'plazo', 'periodo', 'volver', 'repetir', 'segunda evaluacion', 'ciclo'],
    icon: '🔄',
    order: 8,
    active: true,
    updatedBy: 'Sistema',
  },
]

// Subtemas de ejemplo — sin respuestas. El administrador los completa desde el panel.
const SUBTOPICS_SEED: Record<string, Array<{ name: string; description: string; keywords: string[]; order: number }>> = {
  'Comités de Aplicación': [
    {
      name: '¿Quiénes deben integrar el comité?',
      description: 'Integrantes obligatorios y recomendados del comité de aplicación',
      keywords: ['quienes', 'integrantes', 'miembros', 'participar', 'integrar', 'componer'],
      order: 1,
    },
    {
      name: '¿Cuántas personas debe tener el comité?',
      description: 'Número mínimo y máximo de integrantes',
      keywords: ['cuantos', 'cantidad', 'numero', 'tamaño', 'personas'],
      order: 2,
    },
    {
      name: '¿Cuál es el rol del comité?',
      description: 'Funciones y responsabilidades del comité',
      keywords: ['rol', 'funcion', 'responsabilidad', 'tarea', 'labor'],
      order: 3,
    },
    {
      name: '¿Con qué frecuencia se reúne el comité?',
      description: 'Periodicidad de las reuniones del comité',
      keywords: ['frecuencia', 'reunion', 'reuniones', 'periodica', 'cuando'],
      order: 4,
    },
  ],
  'Difusión': [
    {
      name: '¿Cómo comunicar el proceso a los trabajadores?',
      description: 'Estrategias y canales para informar a los colaboradores',
      keywords: ['comunicar', 'trabajadores', 'informar', 'canales', 'estrategia'],
      order: 1,
    },
    {
      name: '¿Qué información debe incluir la difusión?',
      description: 'Contenido mínimo que debe comunicarse en la difusión',
      keywords: ['información', 'contenido', 'incluir', 'mensaje'],
      order: 2,
    },
    {
      name: '¿Cuándo debe realizarse la difusión?',
      description: 'Momento oportuno para realizar la difusión del protocolo',
      keywords: ['cuando', 'momento', 'plazo', 'antes'],
      order: 3,
    },
  ],
  'Uso Plataforma y Aplicación Cuestionario': [
    {
      name: '¿Cómo acceder a la plataforma?',
      description: 'Pasos para acceder y configurar la plataforma',
      keywords: ['acceder', 'acceso', 'entrar', 'plataforma', 'link', 'url'],
      order: 1,
    },
    {
      name: '¿Cómo se solicitan las claves?',
      description: 'Proceso para solicitar claves de acceso para los trabajadores',
      keywords: ['claves', 'contraseña', 'solicitar', 'pedir', 'generar'],
      order: 2,
    },
    {
      name: '¿Cómo se aplica el cuestionario?',
      description: 'Procedimiento para aplicar el cuestionario a los trabajadores',
      keywords: ['aplicar', 'cuestionario', 'encuesta', 'proceso', 'pasos'],
      order: 3,
    },
    {
      name: '¿Qué hacer si un trabajador no puede responder?',
      description: 'Solución cuando un trabajador no puede completar el cuestionario',
      keywords: ['no puede', 'problema', 'error', 'dificultad', 'ayuda', 'soporte'],
      order: 4,
    },
  ],
  'Análisis de Resultados': [
    {
      name: '¿Cómo se interpretan los niveles de riesgo?',
      description: 'Criterios para interpretar los niveles de riesgo psicosocial',
      keywords: ['interpretar', 'niveles', 'riesgo', 'alto', 'medio', 'bajo', 'nivel'],
      order: 1,
    },
    {
      name: '¿Qué son las 12 dimensiones psicosociales?',
      description: 'Explicación de cada una de las dimensiones evaluadas',
      keywords: ['dimensiones', '12 dimensiones', 'dimension', 'que son', 'variables'],
      order: 2,
    },
    {
      name: '¿Cómo se genera el informe de resultados?',
      description: 'Proceso para generar y descargar el informe',
      keywords: ['informe', 'generar', 'reporte', 'descargar'],
      order: 3,
    },
    {
      name: '¿Cómo priorizar las áreas a intervenir?',
      description: 'Criterios para priorizar dimensiones o áreas con mayor riesgo',
      keywords: ['priorizar', 'prioridad', 'areas', 'focalizar', 'urgente', 'critico'],
      order: 4,
    },
  ],
  'Grupo de Discusión': [
    {
      name: '¿Quiénes deben participar en el grupo de discusión?',
      description: 'Selección de participantes para los grupos de discusión',
      keywords: ['participantes', 'quienes', 'seleccionar', 'invitar', 'convocar'],
      order: 1,
    },
    {
      name: '¿Cuántas personas debe tener el grupo?',
      description: 'Tamaño recomendado para los grupos de discusión',
      keywords: ['cuantos', 'tamaño', 'numero', 'cantidad', 'personas'],
      order: 2,
    },
    {
      name: '¿Cuál es el rol del facilitador?',
      description: 'Funciones del facilitador en el grupo de discusión',
      keywords: ['facilitador', 'rol', 'funcion', 'guiar', 'moderar'],
      order: 3,
    },
    {
      name: '¿Cómo se registra el grupo de discusión?',
      description: 'Herramientas y formato para registrar la sesión',
      keywords: ['registrar', 'registro', 'documentar', 'acta', 'formato'],
      order: 4,
    },
  ],
  'Intervención y Prescripción Psicosocial': [
    {
      name: '¿Qué son las medidas de intervención?',
      description: 'Definición y tipos de medidas de intervención psicosocial',
      keywords: ['que son', 'medidas', 'intervencion', 'tipos', 'definicion'],
      order: 1,
    },
    {
      name: '¿Cómo se diseña el plan de intervención?',
      description: 'Pasos para elaborar un plan de intervención psicosocial',
      keywords: ['diseñar', 'plan', 'elaborar', 'como hacer', 'pasos', 'formato'],
      order: 2,
    },
    {
      name: '¿Qué plazo tiene la empresa para implementar las medidas?',
      description: 'Plazos legales y recomendados para implementar las intervenciones',
      keywords: ['plazo', 'tiempo', 'cuando', 'implementar', 'fecha', 'meses'],
      order: 3,
    },
    {
      name: '¿Cómo se documenta la prescripción?',
      description: 'Formato y requisitos para documentar la prescripción psicosocial',
      keywords: ['documentar', 'prescripcion', 'formato', 'registro', 'acreditar'],
      order: 4,
    },
  ],
  'Verificación Cumplimiento Intervención Psicosocial': [
    {
      name: '¿Qué evidencia se requiere para la verificación?',
      description: 'Documentos y evidencias necesarias para acreditar el cumplimiento',
      keywords: ['evidencia', 'documentos', 'acreditar', 'verificar', 'prueba', 'respaldo'],
      order: 1,
    },
    {
      name: '¿Quién realiza la verificación?',
      description: 'Responsable de verificar el cumplimiento de las intervenciones',
      keywords: ['quien', 'responsable', 'verifica', 'fiscaliza', 'supervisa'],
      order: 2,
    },
    {
      name: '¿Cuándo se realiza la verificación?',
      description: 'Plazos y momentos para realizar la verificación',
      keywords: ['cuando', 'plazo', 'momento', 'fecha', 'periodo'],
      order: 3,
    },
  ],
  'Reevaluación': [
    {
      name: '¿Cada cuánto tiempo se debe reevaluar?',
      description: 'Periodicidad obligatoria de la reevaluación del protocolo',
      keywords: ['cada cuanto', 'periodicidad', 'frecuencia', 'cada', 'tiempo', 'anos', 'años'],
      order: 1,
    },
    {
      name: '¿Qué pasa si los resultados empeoran?',
      description: 'Acciones requeridas cuando los resultados de reevaluación no mejoran',
      keywords: ['empeoran', 'peor', 'no mejora', 'sube', 'aumenta', 'consecuencias'],
      order: 2,
    },
    {
      name: '¿Se repite todo el proceso o solo partes?',
      description: 'Etapas que deben repetirse en la reevaluación',
      keywords: ['repetir', 'todo', 'partes', 'que hacer', 'proceso', 'etapas'],
      order: 3,
    },
  ],
}

const DOCUMENTS_SEED = [
  { name: 'Protocolo de Vigilancia de Riesgos Psicosociales', description: 'Documento oficial del Minsal con el protocolo completo', accessLevel: 'public', fileName: 'protocolo_psicosocial.pdf' },
  { name: 'Manual del Método SUSESO/ISTAS-21', description: 'Manual técnico del cuestionario de evaluación psicosocial', accessLevel: 'public', fileName: 'manual_suseso_istas21.pdf' },
  { name: 'Compendio Normativo', description: 'Compendio de normas y resoluciones relacionadas', accessLevel: 'public', fileName: 'compendio_normativo.pdf' },
  { name: 'Guía Grupo de Discusión', description: 'Guía paso a paso para facilitar grupos de discusión', accessLevel: 'public', fileName: 'guia_grupo_discusion.pdf' },
  { name: 'Planilla Solicitud de Claves', description: 'Formato para solicitar claves de acceso a la plataforma', accessLevel: 'public', fileName: 'planilla_solicitud_claves.xlsx' },
  { name: 'Ficha 12 Dimensiones Psicosociales', description: 'Descripción detallada de las 12 dimensiones evaluadas', accessLevel: 'public', fileName: 'ficha_12_dimensiones.pdf' },
  { name: 'Procedimiento Implementación Protocolo', description: 'Procedimiento interno paso a paso para implementar el protocolo', accessLevel: 'advisor', fileName: 'procedimiento_implementacion.pdf' },
  { name: 'Procedimiento Riesgo Alto', description: 'Protocolo específico para empresas con riesgo alto', accessLevel: 'advisor', fileName: 'procedimiento_riesgo_alto.pdf' },
  { name: 'PPT Análisis de Resultados', description: 'Presentación para explicar análisis de resultados a clientes', accessLevel: 'advisor', fileName: 'ppt_analisis_resultados.pptx' },
  { name: 'Guías para Prescripción', description: 'Guías detalladas para prescribir medidas de intervención', accessLevel: 'advisor', fileName: 'guias_prescripcion.pdf' },
  { name: 'Formato Matriz de Medidas', description: 'Plantilla para elaborar la matriz de medidas de intervención', accessLevel: 'advisor', fileName: 'formato_matriz_medidas.xlsx' },
  { name: 'Excel con Medidas para Prescribir', description: 'Banco de medidas psicosociales clasificadas por dimensión', accessLevel: 'advisor', fileName: 'medidas_prescribir.xlsx' },
]

export async function isSeedNeeded(): Promise<boolean> {
  const q = query(collection(db, COLLECTIONS.CATEGORIES), limit(1))
  const snap = await getDocs(q)
  return snap.empty
}

export async function runSeed(): Promise<void> {
  const ts = serverTimestamp()

  // Advisor password (usado por validateAdvisorPassword en firebase.ts)
  await setDoc(doc(db, 'config', 'advisor-secret'), {
    password: 'asesor2024',
    updatedAt: ts,
  })

  // Admin config
  await setDoc(doc(db, COLLECTIONS.CONFIG, 'admin'), {
    adminPassword: 'admin2024',
    appName: 'SicoBot',
    version: '1.0.0',
    updatedAt: ts,
  })

  // Stats init
  await setDoc(doc(db, COLLECTIONS.STATS, 'queries'), {
    total: 0,
    byCategory: {},
    bySubtopic: {},
    lastUpdated: ts,
  })
  await setDoc(doc(db, COLLECTIONS.STATS, 'downloads'), {
    total: 0,
    byDocument: {},
    lastUpdated: ts,
  })
  await setDoc(doc(db, COLLECTIONS.STATS, 'leads'), {
    total: 0,
    byStatus: {},
    lastUpdated: ts,
  })

  // Sample advisor
  await setDoc(doc(db, COLLECTIONS.ADVISORS, 'asesor_demo'), {
    name: 'Asesor Demo',
    email: 'asesor@sicobot.cl',
    password: 'asesor2024',
    active: true,
    createdAt: ts,
    updatedAt: ts,
  })

  // Categories + subtopics — SIN respuestas (se crean desde el panel admin)
  for (const catData of CATEGORIES_SEED) {
    const catRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), {
      ...catData,
      createdAt: ts,
      updatedAt: ts,
    })

    const subtopicsForCat = SUBTOPICS_SEED[catData.name] ?? []
    for (const subData of subtopicsForCat) {
      await addDoc(collection(db, COLLECTIONS.SUBTOPICS), {
        ...subData,
        categoryId: catRef.id,
        categoryName: catData.name,
        active: true,
        updatedBy: 'Sistema',
        createdAt: ts,
        updatedAt: ts,
      })
    }
  }

  // Documents (metadata only — archivos se suben desde el panel admin)
  for (const docData of DOCUMENTS_SEED) {
    await addDoc(collection(db, COLLECTIONS.DOCUMENTS), {
      ...docData,
      storagePath: '',
      fileSize: 0,
      mimeType: 'application/pdf',
      downloadCount: 0,
      createdAt: ts,
      updatedAt: ts,
    })
  }
}
