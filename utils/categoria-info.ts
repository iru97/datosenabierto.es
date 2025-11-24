/**
 * Información educativa específica por categoría
 * Define qué encontrará el usuario, para quién es útil, y consejos prácticos
 */

export interface CategoriaInfo {
  queEncontraras: string[]
  paraQuien: string[]
  consejos: string[]
  ejemplosTipos: string[]
}

export const CATEGORIA_INFO: Record<string, CategoriaInfo> = {
  'oposiciones': {
    queEncontraras: [
      'Convocatorias oficiales de oposiciones (cuántas plazas, dónde, cuándo)',
      'Listas de admitidos y excluidos (comprueba si estás en la lista)',
      'Fechas de exámenes y calendarios oficiales',
      'Resultados y puntuaciones finales',
      'Bases y requisitos de cada convocatoria'
    ],
    paraQuien: [
      'Personas que buscan empleo público estable',
      'Opositores preparándose para exámenes',
      'Docentes, administrativos, personal sanitario',
      'Fuerzas y cuerpos de seguridad',
      'Cualquiera interesado en trabajar para el Estado'
    ],
    consejos: [
      'Revisa las listas de admitidos/excluidos en cuanto salgan',
      'Guarda las fechas de examen en tu calendario',
      'Lee bien los requisitos antes de presentarte',
      'Las plazas suelen publicarse entre enero y marzo'
    ],
    ejemplosTipos: [
      'Convocatoria',
      'Lista admitidos',
      'Fecha examen',
      'Resultado',
      'Bases'
    ]
  },

  'ayudas': {
    queEncontraras: [
      'Subvenciones para empresas y autónomos',
      'Ayudas económicas para familias y particulares',
      'Becas de estudio y formación',
      'Programas de financiación pública',
      'Bonificaciones fiscales y deducciones'
    ],
    paraQuien: [
      'Empresas y autónomos que necesitan financiación',
      'Familias con dificultades económicas',
      'Estudiantes que necesitan becas',
      'ONGs y asociaciones sin ánimo de lucro',
      'Cualquiera que pueda beneficiarse de ayuda pública'
    ],
    consejos: [
      'Comprueba los plazos de solicitud (suelen ser cortos)',
      'Lee bien los requisitos antes de solicitar',
      'Guarda toda la documentación necesaria',
      'Muchas ayudas se publican al inicio del año'
    ],
    ejemplosTipos: [
      'Subvención',
      'Ayuda',
      'Beca',
      'Bonificación',
      'Financiación'
    ]
  },

  'legislacion': {
    queEncontraras: [
      'Nuevas leyes que entran en vigor',
      'Real Decretos y modificaciones normativas',
      'Regulaciones que afectan a ciudadanos y empresas',
      'Cambios en impuestos, derechos y obligaciones',
      'Normativa laboral, fiscal, administrativa'
    ],
    paraQuien: [
      'Empresarios que deben cumplir nueva normativa',
      'Profesionales que necesitan estar al día',
      'Ciudadanos afectados por cambios legales',
      'Asesores fiscales y jurídicos',
      'Cualquiera que quiera entender las leyes'
    ],
    consejos: [
      'Comprueba la fecha de entrada en vigor',
      'Lee el resumen antes del texto completo',
      'Si te afecta, consulta con un profesional',
      'Los cambios fiscales suelen publicarse en diciembre'
    ],
    ejemplosTipos: [
      'Ley',
      'Real Decreto',
      'Orden',
      'Resolución',
      'Reglamento'
    ]
  },

  'licitaciones': {
    queEncontraras: [
      'Contratos públicos abiertos para empresas',
      'Obras, servicios y suministros del Estado',
      'Plazos de presentación de ofertas',
      'Adjudicaciones y resultados de licitaciones',
      'Pliegos y condiciones técnicas'
    ],
    paraQuien: [
      'Empresas que quieren trabajar con administraciones',
      'Autónomos que ofrecen servicios',
      'Constructoras y empresas de obras',
      'Proveedores de suministros',
      'Consultores y profesionales'
    ],
    consejos: [
      'Los plazos de presentación son muy estrictos',
      'Lee bien los requisitos técnicos y económicos',
      'Prepara documentación con antelación',
      'Las grandes licitaciones salen a inicio de año'
    ],
    ejemplosTipos: [
      'Licitación',
      'Adjudicación',
      'Contrato',
      'Concurso',
      'Obra pública'
    ]
  },

  'educacion': {
    queEncontraras: [
      'Convocatorias de becas y ayudas de estudio',
      'Calendario escolar oficial',
      'Homologaciones y convalidaciones de títulos',
      'Planes de estudio y currículos',
      'Acceso a universidades y centros educativos'
    ],
    paraQuien: [
      'Estudiantes que buscan becas',
      'Padres informándose sobre educación',
      'Docentes y personal educativo',
      'Personas con títulos extranjeros',
      'Futuros universitarios'
    ],
    consejos: [
      'Las becas suelen convocarse en primavera',
      'Comprueba los requisitos académicos y económicos',
      'Guarda las fechas de solicitud',
      'Homologar un título puede tardar meses'
    ],
    ejemplosTipos: [
      'Beca',
      'Calendario',
      'Homologación',
      'Plan estudios',
      'Acceso'
    ]
  },

  'vivienda': {
    queEncontraras: [
      'Ayudas al alquiler y bonos joven',
      'Planes de rehabilitación de viviendas',
      'Vivienda protegida y acceso a VPO',
      'Subvenciones para eficiencia energética',
      'Programas de acceso a primera vivienda'
    ],
    paraQuien: [
      'Jóvenes buscando ayudas de alquiler',
      'Familias que necesitan vivienda',
      'Propietarios que quieren rehabilitar',
      'Personas buscando vivienda protegida',
      'Inquilinos con dificultades para pagar'
    ],
    consejos: [
      'Las ayudas al alquiler tienen requisitos de renta',
      'La rehabilitación puede tener bonificaciones fiscales',
      'Las VPO tienen lista de espera',
      'Comprueba las ayudas autonómicas además de estatales'
    ],
    ejemplosTipos: [
      'Ayuda alquiler',
      'VPO',
      'Rehabilitación',
      'Bono joven',
      'Acceso vivienda'
    ]
  },

  'empleo': {
    queEncontraras: [
      'Convenios colectivos por sectores',
      'Salarios mínimos y tablas salariales',
      'Normativa laboral y derechos trabajadores',
      'EREs y regulación de empleo',
      'Contratos y modalidades de contratación'
    ],
    paraQuien: [
      'Trabajadores que quieren conocer sus derechos',
      'Empresarios que contratan personal',
      'Sindicatos y representantes laborales',
      'Asesores laborales',
      'Personas en búsqueda de empleo'
    ],
    consejos: [
      'Comprueba el convenio de tu sector',
      'Los cambios salariales salen al inicio de año',
      'Lee bien tus derechos laborales',
      'Si hay ERE en tu empresa, revisa la normativa'
    ],
    ejemplosTipos: [
      'Convenio',
      'Salario mínimo',
      'ERE',
      'Normativa laboral',
      'Derechos'
    ]
  },

  'nombramientos': {
    queEncontraras: [
      'Nuevos cargos públicos en administración',
      'Ceses y cambios en la estructura del Estado',
      'Nombramientos de altos cargos',
      'Cambios en órganos colegiados',
      'Toma de posesión de funcionarios'
    ],
    paraQuien: [
      'Periodistas e interesados en política',
      'Funcionarios de carrera',
      'Ciudadanos que siguen la actualidad',
      'Investigadores y académicos',
      'Profesionales del sector público'
    ],
    consejos: [
      'Estos documentos suelen ser informativos',
      'No requieren acción por tu parte',
      'Útil para entender cambios en administración',
      'Busca por nombre si conoces al cargo'
    ],
    ejemplosTipos: [
      'Nombramiento',
      'Cese',
      'Toma posesión',
      'Alto cargo',
      'Funcionario'
    ]
  },

  'medio-ambiente': {
    queEncontraras: [
      'Espacios naturales protegidos',
      'Normativa de gestión de residuos',
      'Evaluaciones de impacto ambiental',
      'Planes de sostenibilidad',
      'Regulación de emisiones y calidad aire'
    ],
    paraQuien: [
      'Empresas con impacto ambiental',
      'ONGs y ecologistas',
      'Agricultores y ganaderos',
      'Constructoras que necesitan evaluaciones',
      'Ciudadanos preocupados por el medio ambiente'
    ],
    consejos: [
      'Si tu actividad afecta al medio ambiente, revisa',
      'Los espacios protegidos tienen restricciones',
      'Las evaluaciones ambientales son obligatorias',
      'Comprueba ayudas para sostenibilidad'
    ],
    ejemplosTipos: [
      'Espacio protegido',
      'Gestión residuos',
      'Impacto ambiental',
      'Sostenibilidad',
      'Emisiones'
    ]
  },

  'trafico': {
    queEncontraras: [
      'Cambios en normas de circulación',
      'Nuevos límites de velocidad',
      'Regulación de permisos de conducir',
      'ITV y revisiones obligatorias',
      'Sanciones y puntos del carnet'
    ],
    paraQuien: [
      'Conductores habituales',
      'Autoescuelas y formadores',
      'Empresas de transporte',
      'Motoristas y ciclistas',
      'Cualquier persona que conduzca'
    ],
    consejos: [
      'Comprueba cambios en límites de velocidad',
      'Lee bien las nuevas sanciones',
      'Si te sacan el carnet, revisa la normativa',
      'Los cambios suelen entrar en vigor con plazo'
    ],
    ejemplosTipos: [
      'Norma circulación',
      'Permiso conducir',
      'ITV',
      'Sanción',
      'Límite velocidad'
    ]
  },

  'salud': {
    queEncontraras: [
      'Autorizaciones de medicamentos nuevos',
      'Normativa sanitaria y seguridad alimentaria',
      'Regulación de profesiones sanitarias',
      'Campañas de salud pública',
      'Protocolos y procedimientos médicos'
    ],
    paraQuien: [
      'Profesionales sanitarios',
      'Pacientes con enfermedades crónicas',
      'Empresas del sector salud',
      'Farmacias y distribuidores',
      'Ciudadanos preocupados por su salud'
    ],
    consejos: [
      'Si tomas medicación crónica, revisa autorizaciones',
      'Los protocolos sanitarios pueden cambiar',
      'Comprueba normativa de tu profesión',
      'Las campañas públicas son gratuitas'
    ],
    ejemplosTipos: [
      'Medicamento',
      'Normativa sanitaria',
      'Profesión sanitaria',
      'Campaña salud',
      'Protocolo'
    ]
  },

  'tecnologia': {
    queEncontraras: [
      'Regulación de telecomunicaciones',
      'Protección de datos y privacidad (RGPD)',
      'Administración digital y certificados',
      'Normativa de ciberseguridad',
      'Regulación de plataformas digitales'
    ],
    paraQuien: [
      'Empresas tecnológicas y startups',
      'Desarrolladores y programadores',
      'Responsables de protección de datos',
      'Usuarios de servicios digitales',
      'Cualquier empresa con presencia online'
    ],
    consejos: [
      'La RGPD es obligatoria para todas las empresas',
      'Los certificados digitales caducan',
      'Comprueba normativa de tu plataforma',
      'La ciberseguridad es cada vez más regulada'
    ],
    ejemplosTipos: [
      'Telecomunicaciones',
      'Protección datos',
      'Certificado digital',
      'Ciberseguridad',
      'Plataforma digital'
    ]
  }
}
