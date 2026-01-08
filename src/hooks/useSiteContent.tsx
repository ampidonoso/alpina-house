// ============================================================================
// Site Content Hooks - Static fallback data (no DB tables exist for this content)
// ============================================================================

// Types for content that would come from CMS tables (not yet implemented)
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Step {
  id: string;
  number: string;
  title: string;
  description: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface TimelineItem {
  id: string;
  month: number;
  phase?: string;
  title: string;
  description: string;
  duration?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
  image_url?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface SuccessCase {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image_url?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

// ============================================================================
// Fallback static data (tables don't exist in DB)
// ============================================================================

const fallbackFaqs: FAQ[] = [
  {
    id: 'fallback-1',
    question: "¿Cuánto tiempo demora la construcción y entrega de la casa?",
    answer: "En Alpina, optimizamos los tiempos para que puedas disfrutar de tu hogar lo antes posible. Nuestros modelos están diseñados para ser entregados de manera inmediata y construidos en un plazo de aproximadamente 6 meses, dependiendo de la ubicación y condiciones del terreno.",
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    question: "¿Las casas son personalizables?",
    answer: "Sí, cada modelo permite ciertos grados de personalización interna en materiales, distribución y terminaciones, manteniendo siempre la esencia de diseño y eficiencia que caracteriza a Alpina.",
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-3',
    question: "¿Qué incluye el precio de la casa?",
    answer: "Las casas Alpina incluyen todos los planos de arquitectura, revestimientos, ventanas, puertas, cálculo estructural y proyecto sanitario listo para ser construido.",
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-4',
    question: "¿Cuánto cuesta construir mi casa Alpina?",
    answer: "Valor de compra: 1 UF/m² (incluye proyecto apto para construcción con todas las especialidades). Un proyecto de arquitectura tradicional cuesta aprox. 40 UF/m², mientras que en ALPINA logramos un promedio de 30 UF/m² con el mismo estándar constructivo.",
    order_index: 4,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-5',
    question: "¿Qué viene después de la compra?",
    answer: "Te ponemos en contacto con el constructor con el que tenemos cotizado el modelo comprado para poder cotizar si es que existirá un diferencial de presupuesto por el terreno donde vayas a construir.",
    order_index: 5,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const fallbackSteps: Step[] = [
  { id: 'step-1', number: "01", title: "Elige uno de nuestros diseños", description: "Selecciona el modelo que mejor se adapte a tus necesidades.", order_index: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'step-2', number: "02", title: "Pago fácil y seguro", description: "Haz el pago desde nuestra página. Valores en USD Dólares.", order_index: 2, is_active: true, created_at: new Date().toISOString() },
  { id: 'step-3', number: "03", title: "Recibe tu proyecto completo", description: "Recibe tu modelo de casa con todos los planos y documentos necesarios para construirla.", order_index: 3, is_active: true, created_at: new Date().toISOString() },
  { id: 'step-4', number: "04", title: "Cotización en tu terreno", description: "Recibe la cotización de tu casa construida en tu terreno específico.", order_index: 4, is_active: true, created_at: new Date().toISOString() },
];

const fallbackTimeline: TimelineItem[] = [
  { id: 'timeline-1', month: 1, phase: "Fase 1", title: "Diseño & Permisos", description: "Planos aprobados y trámites", duration: "2-3 semanas", order_index: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'timeline-2', month: 2, phase: "Fase 2", title: "Fundaciones", description: "Preparación y cimientos", duration: "4-6 semanas", order_index: 2, is_active: true, created_at: new Date().toISOString() },
  { id: 'timeline-3', month: 3, phase: "Fase 3", title: "Estructura", description: "Levantamiento y techado", duration: "1-2 semanas", order_index: 3, is_active: true, created_at: new Date().toISOString() },
  { id: 'timeline-4', month: 4, phase: "Fase 4", title: "Entrega", description: "Terminaciones y llaves", duration: "2-3 semanas", order_index: 4, is_active: true, created_at: new Date().toISOString() },
];

const fallbackTestimonial: Testimonial = {
  id: 'testimonial-1',
  quote: "Junto a mis amigos, pudimos hacer nuestro refugio en la nieve y ya podremos disfrutarlo la siguiente temporada.",
  author: "Mathias",
  is_featured: true,
  is_active: true,
  created_at: new Date().toISOString(),
};

const fallbackSuccessCase: SuccessCase = {
  id: 'success-1',
  title: "Casa Refugio",
  subtitle: "Dos refugios de 120 m² construidos en 4 meses",
  description: "Adaptada como refugio de Ski para recibir a 14 personas en simultáneo.",
  is_featured: true,
  is_active: true,
  created_at: new Date().toISOString(),
};

// ============================================================================
// Public hooks - Return static fallback data (no DB calls)
// ============================================================================

export function useFaqs() {
  return {
    data: fallbackFaqs,
    isLoading: false,
    error: null,
  };
}

export function useSteps() {
  return {
    data: fallbackSteps,
    isLoading: false,
    error: null,
  };
}

export function useTimeline() {
  return {
    data: fallbackTimeline,
    isLoading: false,
    error: null,
  };
}

export function useTestimonials() {
  return {
    data: [fallbackTestimonial],
    isLoading: false,
    error: null,
  };
}

export function useFeaturedTestimonial() {
  return {
    data: fallbackTestimonial,
    isLoading: false,
    error: null,
  };
}

export function useSuccessCases() {
  return {
    data: [fallbackSuccessCase],
    isLoading: false,
    error: null,
  };
}

export function useFeaturedSuccessCase() {
  return {
    data: fallbackSuccessCase,
    isLoading: false,
    error: null,
  };
}

// ============================================================================
// Admin hooks - Placeholder stubs with mutate method (tables don't exist yet)
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noopMutation = { mutate: (..._args: any[]) => {}, mutateAsync: async () => {}, isPending: false };

export function useAdminFaqs() {
  return {
    faqs: { data: fallbackFaqs, isLoading: false, error: null },
    createFaq: noopMutation,
    updateFaq: noopMutation,
    deleteFaq: noopMutation,
  };
}

export function useAdminSteps() {
  return {
    steps: { data: fallbackSteps, isLoading: false, error: null },
    createStep: noopMutation,
    updateStep: noopMutation,
    deleteStep: noopMutation,
  };
}

export function useAdminTimeline() {
  return {
    timeline: { data: fallbackTimeline, isLoading: false, error: null },
    createItem: noopMutation,
    updateItem: noopMutation,
    deleteItem: noopMutation,
  };
}

export function useAdminTestimonials() {
  return {
    testimonials: { data: [fallbackTestimonial], isLoading: false, error: null },
    createTestimonial: noopMutation,
    updateTestimonial: noopMutation,
    deleteTestimonial: noopMutation,
  };
}

export function useAdminSuccessCases() {
  return {
    successCases: { data: [fallbackSuccessCase], isLoading: false, error: null },
    createSuccessCase: noopMutation,
    updateSuccessCase: noopMutation,
    deleteSuccessCase: noopMutation,
  };
}
