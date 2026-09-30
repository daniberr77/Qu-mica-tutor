import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Crown,
  Sparkles,
  Zap,
  Check,
  X,
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowRight,
  Flame,
  Atom,
  Layers,
  Terminal,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Copy,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
} from 'lucide-react';
import { useStudent } from '../../context';
import {
  PRICING_PLANS,
  buildStripeWebhookEvent,
  handleStripeWebhook,
  createCheckoutSession,
  getStoredWebhookLogs,
  clearStoredWebhookLogs,
  STRIPE_WEBHOOK_SECRET,
} from '../../services/stripeService';
import type { PricingPlan, WebhookLogEntry } from '../../types/billing';

interface PlansUpgradeViewProps {
  onOpenCheckout?: (planId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const PlansUpgradeView: React.FC<PlansUpgradeViewProps> = ({
  onOpenCheckout,
  onNavigateToTab,
}) => {
  const { profile, upgradeToPremium, cancelPremium, restoreDailyCredits, openCheckout } = useStudent();
  const handleOpenCheckout = onOpenCheckout || openCheckout;
  const [billingType, setBillingType] = useState<'subscription' | 'one_time'>('subscription');
  const [webhookLogs, setWebhookLogs] = useState<WebhookLogEntry[]>([]);
  const [activeWebhookPayload, setActiveWebhookPayload] = useState<any | null>(null);
  const [webhookStatusNotice, setWebhookStatusNotice] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);

  useEffect(() => {
    setWebhookLogs(getStoredWebhookLogs());
  }, []);

  const refreshLogs = () => {
    setWebhookLogs(getStoredWebhookLogs());
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#06b6d4'],
      });
    } catch (e) {
      console.log('Confetti', e);
    }
  };

  // Simular la ejecución directa de un webhook de Stripe
  const handleSimulateWebhook = async (
    eventType: 'checkout.session.completed' | 'customer.subscription.deleted',
    mode: 'subscription' | 'payment' = 'subscription'
  ) => {
    try {
      setIsSimulatingWebhook(true);
      setWebhookStatusNotice('Disparando llamada HTTP POST a /api/webhooks/stripe...');

      // 1. Crear sesión de prueba
      const planId = mode === 'payment' ? 'premium_lifetime' : 'premium_monthly';
      const session = await createCheckoutSession({
        planId,
        studentId: profile.id,
        customerEmail: 'estudiante.demo@quimicatutor.edu',
      });

      // 2. Construir el payload del evento Stripe
      const event = buildStripeWebhookEvent(eventType, session);
      setActiveWebhookPayload(event);

      // 3. Procesar en el webhook handler
      const result = await handleStripeWebhook(event, STRIPE_WEBHOOK_SECRET);

      if (eventType === 'checkout.session.completed') {
        upgradeToPremium(mode === 'payment' ? 'one_time' : 'subscription');
        triggerCelebration();
      } else {
        cancelPremium();
      }

      setWebhookStatusNotice(result.message);
      refreshLogs();
    } catch (err: any) {
      console.error('Error simulando webhook:', err);
      setWebhookStatusNotice(`Error en webhook: ${err.message}`);
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  const plansToDisplay =
    billingType === 'subscription'
      ? PRICING_PLANS.filter((p) => p.mode === 'subscription')
      : PRICING_PLANS.filter((p) => p.mode === 'payment' || p.id === 'free');

  const faqs = [
    {
      q: '¿Cómo funciona el cobro y la activación del Modo Premium?',
      a: 'Al realizar el pago con Stripe Checkout (suscripción o pago único), Stripe emite el evento de webhook `checkout.session.completed`. Nuestro sistema procesa inmediatamente la notificación y actualiza tu perfil a isPremium: true, desbloqueando todas las funciones en milisegundos.',
    },
    {
      q: '¿Qué significa que se desactiva la reducción de créditos?',
      a: 'En el Plan Gratuito, cada consulta a QuimiBot IA descuenta 1 crédito de tu límite diario de 15. En el Modo Premium, la reducción de créditos queda completamente desactivada, permitiéndote preguntar sin límites de mensajes.',
    },
    {
      q: '¿Cuáles simuladores 3D se desbloquean?',
      a: 'Se desbloquean inmediatamente el Simulador 3D de Cinética y Difusión de Gases (Leyes de Boyle, Charles, Gay-Lussac, difusión molecular) y el Simulador 3D de Redes Cristalinas y Celdas Unitarias (Cúbica Simple, BCC, FCC, empaquetamiento atómico), además de funciones avanzadas en el laboratorio de reacciones.',
    },
    {
      q: '¿Puedo cancelar la suscripción mensual en cualquier momento?',
      a: 'Sí, la suscripción mensual no tiene compromiso de permanencia. Puedes cancelarla con un solo clic y conservarás el acceso hasta el final de tu período de facturación.',
    },
    {
      q: '¿Qué incluye el Pase Vitalicio (Pago Único)?',
      a: 'El Pase Vitalicio se paga una única vez ($79.99 USD) y te otorga acceso permanente de por vida a todas las funciones actuales y futuras de QuímicaTutor, sin cuotas mensuales ni suscripciones.',
    },
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-8 animate-in fade-in duration-300">
      {/* ======================================================== */}
      {/* 1. HERO HEADER DE PLANES Y UPGRADE                       */}
      {/* ======================================================== */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-10 border border-slate-700/60 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Membresías y Acceso Oficial con Stripe</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Eleva tu Aprendizaje con el{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
              Modo Premium
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Consultas ilimitadas con el tutor QuimiBot IA, cero reducción de créditos y acceso completo
            a todos los simuladores 3D WebGL bloqueados. Elige entre suscripción flexible o acceso de por vida en un solo pago.
          </p>
        </div>

        {/* Current Status Pill */}
        <div className="relative mt-6 pt-5 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                profile.isPremium
                  ? 'bg-gradient-to-tr from-amber-500 to-indigo-600 shadow-md shadow-indigo-500/30'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              {profile.isPremium ? <Crown className="w-6 h-6 text-amber-200" /> : <Zap className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold uppercase">Estado Actual:</span>
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    profile.isPremium
                      ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {profile.isPremium
                    ? `PREMIUM ACTIVO (${profile.premiumPlanType === 'one_time' ? 'Vitalicio' : 'Suscripción'})`
                    : 'Plan Gratuito'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {profile.isPremium ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Consultas Ilimitadas Activas • Reducción de créditos desactivada
                  </span>
                ) : (
                  <span>
                    Te quedan <strong className="text-amber-400">{profile.credits}/15</strong> créditos gratuitos hoy.
                  </span>
                )}
              </p>
            </div>
          </div>

          {profile.isPremium ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onNavigateToTab) onNavigateToTab('lab');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <Atom className="w-4 h-4" />
                <span>Ir al Laboratorio 3D</span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm('¿Deseas probar la cancelación de suscripción en Stripe (revertir a plan gratuito)?')) {
                    handleSimulateWebhook('customer.subscription.deleted');
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
                title="Simular cancelación de suscripción para pruebas"
              >
                Revertir a Gratuito (Demo)
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleOpenCheckout('premium_monthly')}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 hover:from-emerald-400 hover:to-indigo-400 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-200" />
              <span>Mejorar a Premium Ahora</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SELECTOR DE MODALIDAD (SUSCRIPCIÓN VS PAGO ÚNICO)     */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="bg-white dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs inline-flex">
          <button
            onClick={() => setBillingType('subscription')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              billingType === 'subscription'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Suscripciones Recurrentes (Mensual / Anual)</span>
          </button>

          <button
            onClick={() => setBillingType('one_time')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              billingType === 'one_time'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>Pago Único (Pase Vitalicio)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
              Para Siempre
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TARJETAS DE PLANES DE STRIPE CHECKOUT                 */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plansToDisplay.map((plan) => {
          const isCurrent =
            (plan.id === 'free' && !profile.isPremium) ||
            (profile.isPremium &&
              ((plan.interval === 'one_time' && profile.premiumPlanType === 'one_time') ||
                (plan.interval !== 'one_time' && profile.premiumPlanType !== 'one_time')));

          const isHighlighted = plan.popular || plan.mode === 'payment';

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all border ${
                isHighlighted
                  ? 'bg-white dark:bg-slate-900 border-emerald-500/60 dark:border-emerald-500/60 shadow-xl ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Badge top */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  {plan.id !== 'free' && (
                    <CreditCard className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[32px]">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-4 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {plan.originalPrice && (
                      <span className="line-through text-slate-400 block text-[11px]">
                        ${plan.originalPrice}
                      </span>
                    )}
                    <span>
                      {plan.interval === 'month'
                        ? 'USD / mes'
                        : plan.interval === 'year'
                        ? 'USD / año'
                        : 'USD pago único'}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="mt-5 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Lo que incluye:
                  </span>
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 font-bold" />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Tu Plan Actual</span>
                  </button>
                ) : plan.id === 'free' ? (
                  <button
                    onClick={() => {
                      if (window.confirm('¿Volver al plan gratuito de prueba con 15 créditos diarios?')) {
                        cancelPremium();
                      }
                    }}
                    className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Regresar a Gratuito</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCheckout(plan.id)}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isHighlighted
                        ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 shadow-emerald-500/20 hover:shadow-lg'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{plan.ctaText}</span>
                  </button>
                )}

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Stripe Checkout cifrado de 256 bits</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 4. TABLA COMPARATIVA DE CARACTERÍSTICAS                 */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>Comparativa Detallada: Plan Gratuito vs Modo Premium</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Descubre por qué miles de estudiantes activan el Modo Premium para sus exámenes y proyectos.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[11px] font-black">
                <th className="pb-3 w-1/2">Característica / Módulo</th>
                <th className="pb-3 text-center w-1/4">Plan Gratuito</th>
                <th className="pb-3 text-center w-1/4 text-emerald-600 dark:text-emerald-400 font-extrabold">
                  Modo Premium ✨
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-3 font-semibold">Consultas socráticas con QuimiBot IA</td>
                <td className="py-3 text-center text-slate-500">15 preguntas / día</td>
                <td className="py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                  ⚡ ILIMITADAS
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Reducción de créditos por consulta</td>
                <td className="py-3 text-center text-rose-500 font-medium">Activa (1 crédito/msg)</td>
                <td className="py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                  🚫 DESACTIVADA (Sin consumo)
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Simulador 3D de Átomos y Bohr</td>
                <td className="py-3 text-center text-emerald-600">✓ Incluido</td>
                <td className="py-3 text-center text-emerald-600 font-bold">✓ Incluido</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Simulador 3D de Moléculas (VSEPR)</td>
                <td className="py-3 text-center text-emerald-600">✓ Incluido</td>
                <td className="py-3 text-center text-emerald-600 font-bold">✓ Incluido</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">
                  Simulador 3D de Cinética y Difusión de Gases
                </td>
                <td className="py-3 text-center text-slate-400">
                  <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
                    <Lock className="w-3.5 h-3.5" /> Bloqueado
                  </span>
                </td>
                <td className="py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                  🔓 Desbloqueado 100%
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">
                  Simulador 3D de Redes Cristalinas y Celdas Unitarias
                </td>
                <td className="py-3 text-center text-slate-400">
                  <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
                    <Lock className="w-3.5 h-3.5" /> Bloqueado
                  </span>
                </td>
                <td className="py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                  🔓 Desbloqueado 100%
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Explicaciones estequiométricas paso a paso</td>
                <td className="py-3 text-center text-slate-500">Básicas</td>
                <td className="py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                  Avanzadas + Desglose de moles
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Exportación de tareas (Markdown / JSON)</td>
                <td className="py-3 text-center text-emerald-600">✓ Incluido</td>
                <td className="py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ Incluido + Reportes pro
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Prioridad de cómputo en servidores</td>
                <td className="py-3 text-center text-slate-500">Estándar</td>
                <td className="py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                  🚀 Alta Prioridad (Cero esperas)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. CONSOLA DE PRUEBAS DE WEBHOOKS DE STRIPE             */}
      {/* ======================================================== */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 text-white shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Consola de Pruebas: Webhook Simulado de Stripe
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  HTTP 200 OK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Prueba el ciclo completo de Stripe Checkout: emisión de payload JSON, validación de firma y actualización de la base de datos a <code className="text-emerald-400 font-mono">isPremium: true</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                restoreDailyCredits(15);
                setWebhookStatusNotice('Créditos diarios reiniciados a 15.');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset 15 Créditos</span>
            </button>
            <button
              onClick={() => {
                clearStoredWebhookLogs();
                setWebhookLogs([]);
                setWebhookStatusNotice('Logs de webhook vaciados.');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-semibold border border-slate-700 transition"
            >
              Limpiar Logs
            </button>
          </div>
        </div>

        {/* Botones de simulación de Webhooks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleSimulateWebhook('checkout.session.completed', 'subscription')}
            disabled={isSimulatingWebhook}
            className="p-3.5 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-700/60 text-left transition flex items-start gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-indigo-300 transition">
                Simular Pago Suscripción
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                checkout.session.completed ($9.99)
              </span>
            </div>
          </button>

          <button
            onClick={() => handleSimulateWebhook('checkout.session.completed', 'payment')}
            disabled={isSimulatingWebhook}
            className="p-3.5 rounded-2xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-700/60 text-left transition flex items-start gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <Crown className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-purple-300 transition">
                Simular Pago Único Vitalicio
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                checkout.session.completed ($79.99)
              </span>
            </div>
          </button>

          <button
            onClick={() => handleSimulateWebhook('customer.subscription.deleted', 'subscription')}
            disabled={isSimulatingWebhook}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition flex items-start gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-rose-600/80 text-white shadow-xs">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-rose-300 transition">
                Simular Cancelación
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                customer.subscription.deleted
              </span>
            </div>
          </button>
        </div>

        {/* Notice Message */}
        {webhookStatusNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{webhookStatusNotice}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">STATUS 200</span>
          </div>
        )}

        {/* Live Payload Viewer */}
        {activeWebhookPayload && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] text-indigo-300">
                Payload Stripe Webhook Reciente:
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(activeWebhookPayload, null, 2));
                  alert('Payload copiado al portapapeles');
                }}
                className="hover:text-white flex items-center gap-1 text-[10px]"
              >
                <Copy className="w-3 h-3" />
                <span>Copiar JSON</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56 leading-relaxed">
              {JSON.stringify(activeWebhookPayload, null, 2)}
            </pre>
          </div>
        )}

        {/* Logs Table */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Historial de Eventos Recibidos ({webhookLogs.length}):
          </span>
          {webhookLogs.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
              No hay eventos de webhook registrados aún. Realiza un pago con Stripe o dispara una simulación arriba.
            </div>
          ) : (
            <div className="divide-y divide-slate-800 rounded-2xl bg-slate-950/60 border border-slate-800 overflow-hidden text-xs">
              {webhookLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        log.status === 'success'
                          ? 'bg-emerald-400'
                          : log.status === 'warning'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span className="font-mono font-bold text-indigo-300">{log.eventType}</span>
                    <span className="text-slate-400 line-clamp-1">{log.message}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString('es-ES')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. PREGUNTAS FRECUENTES (FAQ)                            */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            Preguntas Frecuentes sobre la Facturación
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-2">
          {faqs.map((faq, idx) => {
            const isExp = expandedFaq === idx;
            return (
              <div key={idx} className="pt-2">
                <button
                  onClick={() => setExpandedFaq(isExp ? null : idx)}
                  className="w-full text-left py-2 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isExp ? <ChevronUp className="w-4 h-4 text-emerald-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isExp && (
                  <p className="pb-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlansUpgradeView;
