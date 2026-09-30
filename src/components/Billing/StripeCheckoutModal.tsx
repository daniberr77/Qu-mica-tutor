import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  Flame,
  ArrowRight,
  Atom,
  Layers,
  Crown,
  Info,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useStudent } from '../../context';
import {
  PRICING_PLANS,
  STRIPE_TEST_CARDS,
  createCheckoutSession,
  buildStripeWebhookEvent,
  handleStripeWebhook,
} from '../../services/stripeService';
import type { StripeCheckoutSession } from '../../types/billing';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanId?: string;
  onSuccessNavigate?: (tabName: 'chat' | 'lab') => void;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  isOpen,
  onClose,
  initialPlanId = 'premium_monthly',
  onSuccessNavigate,
}) => {
  const { profile, upgradeToPremium } = useStudent();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId);
  const [email, setEmail] = useState<string>('estudiante@quimicatutor.edu');
  const [nameOnCard, setNameOnCard] = useState<string>(profile.name || 'Estudiante de Química');
  const [cardNumber, setCardNumber] = useState<string>('4242 4242 4242 4242');
  const [expDate, setExpDate] = useState<string>('12/28');
  const [cvc, setCvc] = useState<string>('123');
  const [postalCode, setPostalCode] = useState<string>('90210');

  // Estados de procesamiento
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [completedSession, setCompletedSession] = useState<StripeCheckoutSession | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialPlanId) {
      setSelectedPlanId(initialPlanId);
    }
  }, [initialPlanId]);

  if (!isOpen) return null;

  const currentPlan =
    PRICING_PLANS.find((p) => p.id === selectedPlanId) || PRICING_PLANS[1];

  const handleCardNumberChange = (value: string) => {
    // Formatear automáticamente en grupos de 4 dígitos
    const clean = value.replace(/\D/g, '').slice(0, 16);
    const parts = clean.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const handleExpChange = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      setExpDate(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setExpDate(clean);
    }
  };

  const autofillTestCard = () => {
    setCardNumber(STRIPE_TEST_CARDS.success.number);
    setExpDate(STRIPE_TEST_CARDS.success.exp);
    setCvc(STRIPE_TEST_CARDS.success.cvc);
    setPostalCode(STRIPE_TEST_CARDS.success.zip);
    setErrorMsg(null);
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#06b6d4', '#ec4899'],
      });
    } catch (e) {
      console.log('Confetti triggered', e);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validación básica de tarjeta
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 16) {
      setErrorMsg('Por favor ingresa un número de tarjeta válido de 16 dígitos.');
      return;
    }

    if (cleanNum === '4000000000000002') {
      setErrorMsg('Error de Stripe: La tarjeta fue declinada por fondos insuficientes (Tarjeta de error simulada).');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessStep('1/4 Creando sesión de Stripe Checkout...');

      // 1. Generar la sesión de pago de Stripe
      const session = await createCheckoutSession({
        planId: currentPlan.id,
        customerEmail: email,
        customerName: nameOnCard,
        studentId: profile.id,
      });

      setProcessStep('2/4 Autenticando transacción con 3D Secure / Stripe...');
      await new Promise((resolve) => setTimeout(resolve, 600));

      setProcessStep('3/4 Disparando Webhook simulado (checkout.session.completed)...');
      // 2. Construir y enviar el webhook simulado a la base de datos
      const webhookEvent = buildStripeWebhookEvent('checkout.session.completed', session);
      const webhookResult = await handleStripeWebhook(webhookEvent);

      if (!webhookResult.success) {
        throw new Error(webhookResult.message);
      }

      setProcessStep('4/4 ¡Pago aprobado! Actualizando perfil a isPremium: true...');
      // 3. Actualizar contexto
      upgradeToPremium(currentPlan.interval === 'one_time' ? 'one_time' : 'subscription');

      await new Promise((resolve) => setTimeout(resolve, 500));
      setCompletedSession(session);
      triggerCelebration();
    } catch (err: any) {
      console.error('Error procesando pago:', err);
      setErrorMsg(err.message || 'Error inesperado al conectar con Stripe.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          title="Cerrar ventana de pago"
        >
          <X className="w-5 h-5" />
        </button>

        {completedSession ? (
          /* ========================================================= */
          /* PANTALLA DE ÉXITO TRAS PAGO Y WEBHOOK APROBADO           */
          /* ========================================================= */
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 tracking-wider">
                Stripe Checkout Aprobado
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                ¡Bienvenido al Modo Premium!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Tu pago por el <span className="font-bold text-emerald-600">{currentPlan.name}</span> fue procesado con éxito. El webhook simulado actualizó tu perfil a{' '}
                <code className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-mono text-xs">
                  isPremium: true
                </code>.
              </p>
            </div>

            {/* Recibo y detalles */}
            <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>ID de Sesión Stripe:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                  {completedSession.id}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Modalidad:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">
                  {completedSession.mode === 'subscription' ? 'Suscripción Recurrente' : 'Pago Único Vitalicio'}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Total Cobrado:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ${(completedSession.amountTotal / 100).toFixed(2)} {completedSession.currency.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Estado de Créditos:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-emerald-500" /> Consultas Ilimitadas (Reducción desactivada)
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Simuladores 3D:</span>
                <span className="font-bold text-emerald-600">
                  100% Desbloqueados (Gases, Redes Cristalinas)
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  if (onSuccessNavigate) onSuccessNavigate('lab');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Atom className="w-4 h-4" />
                <span>Explorar Laboratorio 3D Desbloqueado</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onSuccessNavigate) onSuccessNavigate('chat');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Consultar sin límites a QuimiBot</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* FORMULARIO DE STRIPE CHECKOUT (2 COLUMNAS)               */
          /* ========================================================= */
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
            {/* COLUMNA IZQUIERDA: RESUMEN DE LA ORDEN & PLAN (45%) */}
            <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700/60">
              <div className="space-y-5">
                {/* Brand / Logo */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                    <Atom className="w-5 h-5 animate-spin [animation-duration:15s]" />
                  </div>
                  <div>
                    <span className="font-black text-sm tracking-tight">
                      Química<span className="text-emerald-400">Tutor</span>
                    </span>
                    <span className="ml-1.5 text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-white/20 text-white">
                      Stripe Checkout
                    </span>
                  </div>
                </div>

                {/* Plan Selector Mini Tabs */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Selecciona tu modalidad:
                  </span>
                  <div className="space-y-2">
                    {PRICING_PLANS.filter((p) => p.id !== 'free').map((p) => {
                      const isSel = p.id === selectedPlanId;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPlanId(p.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSel
                              ? 'bg-white/15 border-emerald-400 shadow-md ring-1 ring-emerald-400/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold">{p.name}</span>
                              {p.badge && (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 uppercase">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {p.interval === 'one_time' ? 'Un solo pago vitalicio' : 'Suscripción automática'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-white">${p.price}</span>
                            <span className="text-[10px] text-slate-400 block">
                              {p.interval === 'month' ? '/mes' : p.interval === 'year' ? '/año' : 'único'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resumen del cobro actual */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-300">Total a pagar hoy:</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-400">
                        ${currentPlan.price}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">USD</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {currentPlan.interval === 'one_time'
                      ? 'Sin cobros posteriores. Acceso de por vida a todas las herramientas.'
                      : `Facturación recurrente cada ${currentPlan.interval === 'month' ? 'mes' : 'año'}. Cancela cuando desees sin penalizaciones.`}
                  </p>
                </div>

                {/* Beneficios directos del Modo Premium */}
                <div className="pt-2 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Incluido de inmediato:
                  </span>
                  <ul className="text-xs space-y-1.5 text-slate-300">
                    <li className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Consultas socráticas ilimitadas con IA</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Desbloqueo total de simuladores 3D</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Cero reducción de créditos en tu cuenta</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Security Footnote */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cifrado SSL de 256 bits</span>
                </div>
                <span className="font-semibold text-slate-400">Stripe Verified</span>
              </div>
            </div>

            {/* COLUMNA DERECHA: FORMULARIO DE STRIPE ELEMENTS (55%) */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                {/* Header de Stripe */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Pago seguro con Stripe
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={autofillTestCard}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                    title="Autocompletar con la tarjeta de prueba estándar de Stripe"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Llenar tarjeta de prueba</span>
                  </button>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                    {errorMsg}
                  </div>
                )}

                {/* Formulario de Checkout */}
                <form id="stripe-checkout-form" onSubmit={handleSubmitPayment} className="space-y-4">
                  {/* Correo Electrónico del Cliente */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Correo electrónico de facturación
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="estudiante@universidad.edu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* Nombre en la tarjeta */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nombre del titular de la tarjeta
                    </label>
                    <input
                      type="text"
                      required
                      value={nameOnCard}
                      onChange={(e) => setNameOnCard(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* Tarjeta de Crédito (Stripe Element UI) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Información de la tarjeta (Visa, Mastercard, Amex)
                    </label>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 overflow-hidden divide-y divide-slate-200 dark:divide-slate-700 shadow-2xs">
                      {/* Número de tarjeta */}
                      <div className="relative flex items-center px-3.5 py-2.5">
                        <CreditCard className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          className="w-full bg-transparent text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden"
                        />
                        <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 ml-2">
                          TEST
                        </span>
                      </div>

                      {/* Expiración, CVC y Código Postal */}
                      <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700">
                        <div className="px-3 py-2">
                          <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                            MM / AA
                          </span>
                          <input
                            type="text"
                            required
                            value={expDate}
                            onChange={(e) => handleExpChange(e.target.value)}
                            placeholder="12/28"
                            maxLength={5}
                            className="w-full bg-transparent text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                          />
                        </div>

                        <div className="px-3 py-2">
                          <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                            CVC
                          </span>
                          <input
                            type="text"
                            required
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="123"
                            maxLength={4}
                            className="w-full bg-transparent text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                          />
                        </div>

                        <div className="px-3 py-2">
                          <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                            C. Postal
                          </span>
                          <input
                            type="text"
                            required
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value.slice(0, 8))}
                            placeholder="90210"
                            className="w-full bg-transparent text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Botón de pago y estados */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                {isProcessing ? (
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-center space-y-2">
                    <div className="w-6 h-6 mx-auto border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      {processStep}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Por favor espera un instante mientras Stripe valida la transacción...
                    </p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    form="stripe-checkout-form"
                    className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      Pagar ${currentPlan.price} USD con Stripe (
                      {currentPlan.interval === 'one_time' ? 'Pago Único' : 'Suscripción'}
                      )
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Garantía de reembolso de 30 días</span>
                  </div>
                  <span>Procesado por Stripe Payments</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
