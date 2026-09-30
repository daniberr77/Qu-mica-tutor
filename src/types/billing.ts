// Definición de tipos y esquemas para la integración de Stripe Checkout,
// planes de suscripción, pagos únicos y simulación de webhooks.

export type PlanBillingInterval = 'month' | 'year' | 'one_time';
export type StripeCheckoutMode = 'subscription' | 'payment';

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  popular?: boolean;
  price: number;
  originalPrice?: number;
  currency: string;
  interval: PlanBillingInterval;
  mode: StripeCheckoutMode;
  tagline: string;
  description: string;
  features: string[];
  stripePriceId: string;
  ctaText: string;
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
  status: 'open' | 'complete' | 'expired';
  mode: StripeCheckoutMode;
  planId: string;
  customerEmail: string;
  customerName: string;
  studentId: string;
  amountTotal: number;
  currency: string;
  created: number;
  expiresAt: number;
  paymentStatus: 'unpaid' | 'paid';
  livemode: boolean;
  metadata: {
    studentId: string;
    planId: string;
    interval: PlanBillingInterval;
    isLifetime?: string;
  };
}

export interface StripeWebhookEvent {
  id: string;
  object: 'event';
  api_version: string;
  created: number;
  type: 
    | 'checkout.session.completed'
    | 'customer.subscription.created'
    | 'customer.subscription.updated'
    | 'customer.subscription.deleted'
    | 'invoice.payment_succeeded'
    | 'payment_intent.succeeded';
  livemode: boolean;
  data: {
    object: any;
  };
}

export interface WebhookLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  payload: any;
  profileStateAfter?: {
    isPremium: boolean;
    planType?: string | null;
    credits: number;
  };
}
