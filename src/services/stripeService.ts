import type {
  PricingPlan,
  StripeCheckoutSession,
  StripeWebhookEvent,
  WebhookLogEntry,
} from '../types/billing';
import type { StudentProfile } from '../types';
import { getStoredProfile, saveStoredProfile } from './storage';

// Constantes y claves de Stripe (pueden ser configuradas en el archivo .env)
export const STRIPE_PUBLIC_KEY =
  (import.meta as any).env?.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51QuimicaTutorStripeMockKeyLiveMode000';
export const STRIPE_WEBHOOK_SECRET =
  (import.meta as any).env?.VITE_STRIPE_WEBHOOK_SECRET || 'whsec_quimicatutor_supersecret_stripe_webhook_key';

const KEY_WEBHOOK_LOGS = 'quimica_stripe_webhook_logs_v1';

// Catálogo oficial de Planes de Acceso a QuímicaTutor
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Plan Estudiante (Gratuito)',
    tagline: 'Ideal para iniciar y consultas básicas diarias',
    price: 0,
    currency: 'USD',
    interval: 'month',
    mode: 'subscription',
    description: 'Acceso a los conceptos fundamentales de química con límite de 15 créditos diarios de IA.',
    stripePriceId: 'price_free_tier',
    ctaText: 'Plan Actual',
    features: [
      '15 créditos diarios para consultas al tutor QuimiBot IA',
      'Acceso a Visualizador 3D Básico de Átomos y Moléculas',
      'Calculadoras estequiométricas y leyes de gases básicas',
      'Historial de aprendizaje guardado localmente',
      'Simuladores 3D avanzados con acceso limitado',
    ],
  },
  {
    id: 'premium_monthly',
    name: 'Modo Premium Mensual',
    tagline: 'Suscripción flexible para potenciar tu semestre',
    price: 9.99,
    originalPrice: 14.99,
    currency: 'USD',
    interval: 'month',
    mode: 'subscription',
    popular: true,
    badge: 'MÁS POPULAR',
    description: 'Suscripción mensual recurrente. Desactiva inmediatamente la reducción de créditos y desbloquea el 100% de los laboratorios.',
    stripePriceId: 'price_1Hh98StripePremiumMonthly_123',
    ctaText: 'Suscribirme por $9.99 / mes',
    features: [
      '⚡ Consultas ILIMITADAS al tutor QuimiBot IA (cero reducción de créditos)',
      '🔓 Desbloqueo total de TODOS los simuladores 3D (Cinética de Gases, Redes Cristalinas)',
      '🔬 Resolución estequiométrica profunda paso a paso',
      '📊 Perfiles de energía de activación y colisiones moleculares completas',
      '🚀 Respuestas socráticas inmediatas con prioridad en servidores de IA',
      '📥 Exportación ilimitada en formato Markdown, JSON y reportes listos para entregar',
      '🔄 Cancela en cualquier momento con un solo clic',
    ],
  },
  {
    id: 'premium_annual',
    name: 'Modo Premium Anual',
    tagline: 'Ahorra más del 40% con facturación anual',
    price: 59.99,
    originalPrice: 119.88,
    currency: 'USD',
    interval: 'year',
    mode: 'subscription',
    badge: 'AHORRA 50%',
    description: 'Suscripción anual equivalente a solo $4.99/mes. Máximo rendimiento para todo el ciclo universitario o escolar.',
    stripePriceId: 'price_1Hh98StripePremiumAnnual_456',
    ctaText: 'Elegir Plan Anual ($59.99 / año)',
    features: [
      '⚡ Todo lo incluido en el Plan Premium Mensual',
      '💰 Ahorro del 50% frente al pago mensual tradicional',
      '🧪 Simuladores 3D exclusivos con física cuántica y termodinámica avanzada',
      '🏆 Insignia VIP en el perfil del estudiante y logros exclusivos',
      '📜 Certificado de avance pedagógico descargable',
    ],
  },
  {
    id: 'premium_lifetime',
    name: 'Pase Vitalicio (Pago Único)',
    tagline: 'Un único pago para siempre, sin suscripciones recurrentes',
    price: 79.99,
    originalPrice: 199.00,
    currency: 'USD',
    interval: 'one_time',
    mode: 'payment',
    badge: 'PAGO ÚNICO • DE POR VIDA',
    description: 'Paga una sola vez y disfruta del Modo Premium para siempre. Sin renovaciones mensuales ni cargos futuros.',
    stripePriceId: 'price_1Hh98StripeLifetimeOneTime_789',
    ctaText: 'Comprar Acceso de Por Vida ($79.99)',
    features: [
      '👑 Acceso PERMANENTE de por vida al Modo Premium',
      '💳 Cero pagos recurrentes ni suscripciones (pago único)',
      '⚡ Consultas ILIMITADAS perpetuas (sin límite de créditos jamás)',
      '🧪 Acceso inmediato a todos los simuladores 3D actuales y futuros',
      '✨ Todas las actualizaciones de QuimiBot y nuevos laboratorios incluidas',
      '🛡️ Garantía de satisfacción de 30 días o devolución de tu dinero',
    ],
  },
];

export const STRIPE_TEST_CARDS = {
  success: {
    number: '4242 4242 4242 4242',
    exp: '12/28',
    cvc: '123',
    zip: '90210',
    description: 'Aprobación exitosa automática (Tarjeta de prueba Stripe)',
  },
  declined: {
    number: '4000 0000 0000 0002',
    exp: '12/28',
    cvc: '123',
    zip: '90210',
    description: 'Fondos insuficientes (Error simulado)',
  },
};

// ============================================================================
// FUNCIÓN 1: GENERAR SESIÓN DE PAGO DE STRIPE CHECKOUT
// ============================================================================
export interface CreateCheckoutSessionParams {
  planId: string;
  customerEmail?: string;
  customerName?: string;
  studentId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Genera una sesión de Stripe Checkout para suscripción o pago único
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<StripeCheckoutSession> {
  const plan = PRICING_PLANS.find((p) => p.id === params.planId) || PRICING_PLANS[1];
  const profile = getStoredProfile();

  const studentId = params.studentId || profile.id;
  const customerEmail = params.customerEmail || 'estudiante@quimicatutor.edu';
  const customerName = params.customerName || profile.name;

  // Simular pequeña latencia de red de Stripe API
  await new Promise((resolve) => setTimeout(resolve, 350));

  const now = Math.floor(Date.now() / 1000);
  const sessionId = `cs_test_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;

  const session: StripeCheckoutSession = {
    id: sessionId,
    url: `https://checkout.stripe.com/c/pay/${sessionId}`,
    status: 'open',
    mode: plan.mode,
    planId: plan.id,
    customerEmail,
    customerName,
    studentId,
    amountTotal: Math.round(plan.price * 100), // En centavos según convención Stripe
    currency: plan.currency.toLowerCase(),
    created: now,
    expiresAt: now + 3600 * 24, // Expira en 24 horas
    paymentStatus: 'unpaid',
    livemode: false,
    metadata: {
      studentId,
      planId: plan.id,
      interval: plan.interval,
      isLifetime: plan.interval === 'one_time' ? 'true' : 'false',
    },
  };

  return session;
}

// ============================================================================
// FUNCIÓN 2: CONSTRUCTOR Y SIMULADOR DE EVENTOS DE WEBHOOK DE STRIPE
// ============================================================================
/**
 * Crea la estructura oficial de un evento de webhook de Stripe
 */
export function buildStripeWebhookEvent(
  eventType: StripeWebhookEvent['type'],
  session: StripeCheckoutSession
): StripeWebhookEvent {
  const eventId = `evt_test_${Math.random().toString(36).substring(2, 14)}_${Date.now()}`;

  return {
    id: eventId,
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    type: eventType,
    livemode: false,
    data: {
      object: {
        id: session.id,
        object: 'checkout.session',
        amount_total: session.amountTotal,
        currency: session.currency,
        customer_email: session.customerEmail,
        customer_details: {
          email: session.customerEmail,
          name: session.customerName,
        },
        mode: session.mode,
        payment_status: 'paid',
        status: 'complete',
        subscription: session.mode === 'subscription' ? `sub_test_${Date.now()}` : null,
        metadata: session.metadata,
      },
    },
  };
}

// ============================================================================
// FUNCIÓN 3: PROCESADOR DEL WEBHOOK DE STRIPE (HANDLER DEL SERVIDOR)
// ============================================================================
/**
 * Procesa un webhook de Stripe entrante.
 * Cuando se recibe checkout.session.completed o invoice.payment_succeeded:
 * Pasa el perfil del estudiante en la base de datos a `isPremium: true`,
 * lo cual desactiva inmediatamente la reducción de créditos y da acceso
 * a todos los simuladores 3D bloqueados.
 */
export async function handleStripeWebhook(
  event: StripeWebhookEvent,
  signatureHeader?: string
): Promise<{
  success: boolean;
  message: string;
  profileUpdated?: StudentProfile;
}> {
  // Validación de firma de Stripe (simulada o verificada si se pasa el secreto)
  if (signatureHeader && signatureHeader !== STRIPE_WEBHOOK_SECRET) {
    const errorMsg = 'Stripe Signature verification failed: Invalide webhook secret';
    addWebhookLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: event.type,
      status: 'error',
      message: errorMsg,
      payload: event,
    });
    return { success: false, message: errorMsg };
  }

  const profile = getStoredProfile();
  const sessionObject = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed':
    case 'invoice.payment_succeeded': {
      const mode = sessionObject.mode as 'subscription' | 'payment';
      const planType: 'subscription' | 'one_time' =
        mode === 'payment' || sessionObject.metadata?.interval === 'one_time'
          ? 'one_time'
          : 'subscription';

      const updatedProfile: StudentProfile = {
        ...profile,
        isPremium: true,
        premiumPlanType: planType,
        premiumSince: new Date().toISOString(),
        // Al ser premium los créditos son ilimitados (9999 o sin decremento)
        credits: 9999,
        dailyCreditLimit: 9999,
      };

      // Guardar en la base de datos local
      saveStoredProfile(updatedProfile);

      // Disparar evento global en el navegador para sincronizar instantáneamente
      // cualquier componente React montado
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('quimica_stripe_webhook_received', {
            detail: {
              event,
              updatedProfile,
            },
          })
        );
      }

      const logMsg = `Pago aprobado con éxito. El perfil del estudiante '${profile.name}' pasó a isPremium: true (${planType === 'one_time' ? 'Pase Vitalicio' : 'Suscripción'}). Reducción de créditos desactivada y simuladores 3D desbloqueados.`;

      addWebhookLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: event.type,
        status: 'success',
        message: logMsg,
        payload: event,
        profileStateAfter: {
          isPremium: updatedProfile.isPremium,
          planType: updatedProfile.premiumPlanType,
          credits: updatedProfile.credits,
        },
      });

      return {
        success: true,
        message: logMsg,
        profileUpdated: updatedProfile,
      };
    }

    case 'customer.subscription.deleted': {
      // Revertir a plan gratuito si se cancela la suscripción
      const updatedProfile: StudentProfile = {
        ...profile,
        isPremium: false,
        premiumPlanType: null,
        credits: 15,
        dailyCreditLimit: 15,
      };

      saveStoredProfile(updatedProfile);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('quimica_stripe_webhook_received', {
            detail: {
              event,
              updatedProfile,
            },
          })
        );
      }

      const logMsg = `Suscripción cancelada en Stripe. Perfil revertido a isPremium: false con 15 créditos diarios.`;

      addWebhookLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: event.type,
        status: 'warning',
        message: logMsg,
        payload: event,
        profileStateAfter: {
          isPremium: updatedProfile.isPremium,
          planType: null,
          credits: updatedProfile.credits,
        },
      });

      return {
        success: true,
        message: logMsg,
        profileUpdated: updatedProfile,
      };
    }

    default: {
      const msg = `Evento '${event.type}' recibido y registrado sin cambios en el estado premium.`;
      addWebhookLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: event.type,
        status: 'success',
        message: msg,
        payload: event,
      });
      return { success: true, message: msg };
    }
  }
}

// ============================================================================
// HISTORIAL Y LOGS DE WEBHOOKS PARA INSPECCIÓN EN VIVO
// ============================================================================
export function getStoredWebhookLogs(): WebhookLogEntry[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const item = window.localStorage.getItem(KEY_WEBHOOK_LOGS);
    if (!item) return [];
    return JSON.parse(item) as WebhookLogEntry[];
  } catch (err) {
    console.error('Error al leer los logs de webhook:', err);
    return [];
  }
}

export function addWebhookLog(entry: WebhookLogEntry): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const logs = getStoredWebhookLogs();
    const updated = [entry, ...logs].slice(0, 50); // Mantener últimos 50 eventos
    window.localStorage.setItem(KEY_WEBHOOK_LOGS, JSON.stringify(updated));
  } catch (err) {
    console.error('Error al guardar el log de webhook:', err);
  }
}

export function clearStoredWebhookLogs(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(KEY_WEBHOOK_LOGS);
  } catch (err) {
    console.error('Error al limpiar los logs de webhook:', err);
  }
}
