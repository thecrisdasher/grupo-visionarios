import { UserLevel, Value } from '@/types'

// App configuration
export const APP_CONFIG = {
  name: 'Grupo Visionarios',
  description: 'Plataforma profesional de marketing de afiliados multinivel',
  version: '1.0.0',
} as const

// User levels configuration
export const USER_LEVELS: UserLevel[] = [
  {
    name: 'BÁSICO',
    color: 'primary',
    minReferrals: 0,
    maxReferrals: 19,
    commissionRate: 0.20,
    benefits: [
      'Comisión del 20% por referidos directos',
      'Acceso a materiales de capacitación básicos',
      'Soporte por email',
      'Dashboard personal'
    ]
  },
  {
    name: 'INTERMEDIO',
    color: 'secondary',
    minReferrals: 20,
    maxReferrals: 49,
    commissionRate: 0.25,
    benefits: [
      'Comisión del 25% por referidos directos',
      'Comisión del 15% segundo nivel',
      'Acceso a capacitación avanzada',
      'Soporte prioritario'
    ]
  },
  {
    name: 'AVANZADO',
    color: 'accent',
    minReferrals: 50,
    commissionRate: 0.30,
    benefits: [
      'Comisión del 30% por referidos directos',
      'Comisión del 20% segundo nivel',
      'Comisión del 10% tercer nivel',
      'Capacitación VIP personalizada'
    ]
  }
]

// Los 12 valores de Grupo Visionarios
export const COMPANY_VALUES: Value[] = [
  {
    id: '1',
    title: 'Integridad',
    description: 'Actuamos con honestidad y transparencia en todas nuestras acciones',
    content: `
      La integridad es el pilar fundamental de nuestro éxito. Significa hacer lo correcto 
      incluso cuando nadie nos está observando. En Grupo Visionarios, la integridad se 
      manifiesta en cada decisión que tomamos, cada promesa que hacemos y cada relación 
      que construimos.
      
      Principios clave:
      • Honestidad absoluta en todas las comunicaciones
      • Transparencia en procesos y resultados
      • Cumplimiento de compromisos adquiridos
      • Respeto por los recursos y tiempo de otros
    `,
    imageUrl: '/images/values/integridad.jpg',
    videoUrl: 'https://youtube.com/embed/valor-integridad',
    order: 1,
    isActive: true
  },
  {
    id: '2',
    title: 'Excelencia',
    description: 'Buscamos la perfección en cada detalle y superamos las expectativas',
    content: `
      La excelencia no es un destino, es un camino. Es el compromiso constante de mejorar 
      cada día, de superar nuestros propios límites y de ofrecer siempre más de lo esperado.
      
      En nuestro trabajo diario:
      • Atención meticulosa a los detalles
      • Mejora continua de procesos
      • Innovación constante
      • Superación de estándares establecidos
    `,
    imageUrl: '/images/values/excelencia.jpg',
    videoUrl: 'https://youtube.com/embed/valor-excelencia',
    order: 2,
    isActive: true
  },
  {
    id: '3',
    title: 'Liderazgo',
    description: 'Inspiramos y guiamos a otros hacia el logro de metas extraordinarias',
    content: `
      El liderazgo verdadero no se trata de autoridad, sino de influencia positiva. 
      Desarrollamos líderes que inspiran, motivan y empoderan a otros para alcanzar 
      su máximo potencial.
      
      Características del liderazgo visionario:
      • Visión clara del futuro
      • Capacidad de inspirar y motivar
      • Toma de decisiones asertiva
      • Desarrollo de otros líderes
    `,
    imageUrl: '/images/values/liderazgo.jpg',
    videoUrl: 'https://youtube.com/embed/valor-liderazgo',
    order: 3,
    isActive: true
  },
  {
    id: '4',
    title: 'Innovación',
    description: 'Abramos nuevas posibilidades y creamos soluciones disruptivas',
    content: `
      La innovación es nuestro motor de crecimiento. No nos conformamos con lo establecido, 
      sino que constantemente buscamos maneras mejores, más eficientes y más creativas 
      de hacer las cosas.
      
      Pilares de la innovación:
      • Pensamiento creativo y disruptivo
      • Experimentación constante
      • Adopción de nuevas tecnologías
      • Cultura de aprendizaje continuo
    `,
    imageUrl: '/images/values/innovacion.jpg',
    videoUrl: 'https://youtube.com/embed/valor-innovacion',
    order: 4,
    isActive: true
  },
  {
    id: '5',
    title: 'Colaboración',
    description: 'Trabajamos juntos para lograr resultados extraordinarios',
    content: `
      Creemos firmemente que juntos somos más fuertes. La colaboración efectiva 
      multiplica nuestras capacidades individuales y nos permite alcanzar metas 
      que serían imposibles en solitario.
      
      Elementos de la colaboración efectiva:
      • Comunicación abierta y constante
      • Respeto por las ideas de otros
      • Sinergia de talentos diversos
      • Objetivos compartidos
    `,
    imageUrl: '/images/values/colaboracion.jpg',
    videoUrl: 'https://youtube.com/embed/valor-colaboracion',
    order: 5,
    isActive: true
  },
  {
    id: '6',
    title: 'Perseverancia',
    description: 'Mantenemos la determinación ante los desafíos y obstáculos',
    content: `
      Los grandes logros requieren perseverancia. Entendemos que el éxito no es 
      inmediato y que los obstáculos son oportunidades de crecimiento disfrazadas.
      
      Manifestaciones de la perseverancia:
      • Resistencia ante las adversidades
      • Aprendizaje de los fracasos
      • Constancia en la ejecución
      • Fe inquebrantable en la visión
    `,
    imageUrl: '/images/values/perseverancia.jpg',
    videoUrl: 'https://youtube.com/embed/valor-perseverancia',
    order: 6,
    isActive: true
  },
  {
    id: '7',
    title: 'Pasión',
    description: 'Amamos lo que hacemos y eso se refleja en nuestros resultados',
    content: `
      La pasión es el combustible que enciende la excelencia. Cuando amamos lo que 
      hacemos, el trabajo se transforma en propósito y los desafíos en oportunidades.
      
      Indicadores de la pasión:
      • Entusiasmo contagioso
      • Dedicación más allá del horario
      • Búsqueda constante de mejora
      • Inspiración a otros
    `,
    imageUrl: '/images/values/pasion.jpg',
    videoUrl: 'https://youtube.com/embed/valor-pasion',
    order: 7,
    isActive: true
  },
  {
    id: '8',
    title: 'Responsabilidad',
    description: 'Asumimos las consecuencias de nuestras acciones y decisiones',
    content: `
      La responsabilidad es la base de la confianza. Cada uno de nosotros asume 
      completamente las consecuencias de sus acciones y decisiones, tanto en 
      los éxitos como en los errores.
      
      Dimensiones de la responsabilidad:
      • Rendición de cuentas personal
      • Cuidado del bien común
      • Compromiso con resultados
      • Aprendizaje de errores
    `,
    imageUrl: '/images/values/responsabilidad.jpg',
    videoUrl: 'https://youtube.com/embed/valor-responsabilidad',
    order: 8,
    isActive: true
  },
  {
    id: '9',
    title: 'Respeto',
    description: 'Valoramos la dignidad y diversidad de cada persona',
    content: `
      El respeto es fundamental para crear un ambiente donde todos puedan prosperar. 
      Valoramos las diferencias, celebramos la diversidad y tratamos a cada persona 
      con la dignidad que merece.
      
      Expresiones del respeto:
      • Escucha activa y empática
      • Valoración de la diversidad
      • Trato equitativo para todos
      • Consideración por las diferencias
    `,
    imageUrl: '/images/values/respeto.jpg',
    videoUrl: 'https://youtube.com/embed/valor-respeto',
    order: 9,
    isActive: true
  },
  {
    id: '10',
    title: 'Gratitud',
    description: 'Apreciamos y reconocemos las contribuciones de cada persona',
    content: `
      La gratitud transforma nuestra perspectiva y fortalece nuestras relaciones. 
      Reconocemos y valoramos cada contribución, por pequeña que parezca, 
      entendiendo que el éxito es colectivo.
      
      Prácticas de gratitud:
      • Reconocimiento público de logros
      • Apreciación de esfuerzos
      • Celebración de hitos
      • Valoración de contribuciones únicas
    `,
    imageUrl: '/images/values/gratitud.jpg',
    videoUrl: 'https://youtube.com/embed/valor-gratitud',
    order: 10,
    isActive: true
  },
  {
    id: '11',
    title: 'Prosperidad',
    description: 'Creamos abundancia y bienestar para todos los involucrados',
    content: `
      Creemos en la prosperidad compartida. Nuestro éxito se mide no solo por 
      nuestros logros individuales, sino por la capacidad de generar abundancia 
      y bienestar para toda nuestra comunidad.
      
      Elementos de la prosperidad:
      • Crecimiento económico sostenible
      • Desarrollo personal continuo
      • Bienestar integral
      • Impacto positivo en la comunidad
    `,
    imageUrl: '/images/values/prosperidad.jpg',
    videoUrl: 'https://youtube.com/embed/valor-prosperidad',
    order: 11,
    isActive: true
  },
  {
    id: '12',
    title: 'Legado',
    description: 'Construimos algo que perdure y trascienda generaciones',
    content: `
      Pensamos más allá del presente. Cada decisión que tomamos, cada acción 
      que ejecutamos, está orientada a construir un legado duradero que 
      inspire y beneficie a las futuras generaciones.
      
      Construcción del legado:
      • Visión de largo plazo
      • Impacto transformador
      • Valores transmisibles
      • Sostenibilidad generacional
    `,
    imageUrl: '/images/values/legado.jpg',
    videoUrl: 'https://youtube.com/embed/valor-legado',
    order: 12,
    isActive: true
  }
]

// Commission rates by level
export const COMMISSION_RATES = {
  1: 0.30, // 30% for direct referrals
  2: 0.15, // 15% for second level
  3: 0.10, // 10% for third level
} as const

// Payment methods
export const PAYMENT_METHODS = [
  {
    id: 'wompi',
    name: 'Wompi',
    type: 'digital_wallet',
    isActive: true,
    config: {
      publicKey: process.env.WOMPI_PUBLIC_KEY,
      currency: 'COP'
    }
  },
  {
    id: 'mercadopago',
    name: 'MercadoPago',
    type: 'digital_wallet',
    isActive: true,
    config: {
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
      currency: 'COP'
    }
  },
  {
    id: 'payu',
    name: 'PayU',
    type: 'card',
    isActive: true,
    config: {
      publicKey: process.env.PAYU_PUBLIC_KEY,
      currency: 'COP'
    }
  }
] as const

// Default messages for WhatsApp
export const WHATSAPP_MESSAGES = {
  registration: '¡Hola! Me interesa conocer más sobre Grupo Visionarios y cómo puedo ser parte de esta oportunidad de negocio.',
  support: 'Hola, necesito ayuda con mi cuenta en Grupo Visionarios.',
  payment: 'Hola, quiero realizar el pago para activar mi membresía en Grupo Visionarios.',
} as const

// Routes configuration
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  REFERRALS: '/referrals',
  TRAINING: '/training',
  VALUES: '/values',
  PAYMENTS: '/payments',
} as const

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
  },
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users',
    UPDATE: '/api/users',
    DELETE: '/api/users',
  },
  REFERRALS: {
    LIST: '/api/referrals',
    STATS: '/api/referrals/stats',
    CREATE: '/api/referrals',
  },
  PAYMENTS: {
    LIST: '/api/payments',
    CREATE: '/api/payments',
    WEBHOOK: '/api/payments/webhook',
  },
  TRAINING: {
    MODULES: '/api/training/modules',
    PROGRESS: '/api/training/progress',
  },
  VALUES: {
    LIST: '/api/values',
  },
} as const

// Validation rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  REFERRAL_CODE_LENGTH: 8,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const

// Colors mapping for levels
export const LEVEL_COLORS = {
  'BÁSICO': {
    background: 'bg-primary-50',
    text: 'text-primary-700',
    border: 'border-primary-200',
    badge: 'bg-primary-500'
  },
  'INTERMEDIO': {
    background: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    badge: 'bg-gray-500'
  },
  'AVANZADO': {
    background: 'bg-accent-50',
    text: 'text-accent-700',
    border: 'border-accent-200',
    badge: 'bg-accent-500'
  }
} as const 