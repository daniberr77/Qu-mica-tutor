import React, { useState } from 'react';
import { useStudent } from '../context';
import confetti from 'canvas-confetti';
import {
  Crown,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  ShieldCheck,
  Flame,
  Atom,
  RotateCcw,
  Check,
  CreditCard,
} from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const { profile, upgradeToPremium, restoreDailyCredits, openCheckout } = useStudent();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semester'>('semester');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899'],
      });
    } catch (e) {
      console.log('Confetti triggered', e);
    }
  };

  const handleUpgrade = () => {
    upgradeToPremium();
    setIsSuccess(true);
    triggerConfetti();
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  const handleResetCredits = () => {
    restoreDailyCredits(20);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 p-6 text-white text-center overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex p-3 rounded-2xl bg-white/20 backdrop-blur-md mb-3 shadow-inner">
            <Crown className="w-8 h-8 text-amber-300 drop-shadow-md animate-bounce" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mb-1">
            {profile.isPremium ? '¡Ya eres QuimiBot Premium!' : '¡Desbloquea QuimiBot Premium!'}
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-sm mx-auto">
            {profile.credits <= 0
              ? 'Has agotado tus 20 consultas gratuitas de hoy. Continúa estudiando química sin límites.'
              : 'Obtén acceso ilimitado al tutor Gemini con resolución socrática profunda y laboratorios 3D.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Success Banner */}
          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-pulse" />
              <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                ¡Membresía Premium Activada con Éxito!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Ahora tienes consultas ilimitadas con Gemini AI. Disfruta tu aprendizaje.
              </p>
            </div>
          ) : (
            <>
              {/* Features List */}
              <div className="space-y-2.5">
                {[
                  {
                    icon: <Zap className="w-4 h-4 text-amber-500" />,
                    title: 'Consultas Ilimitadas con Gemini AI',
                    desc: 'Sin límite de 20 mensajes diarios. Pregunta cuantas veces necesites.',
                  },
                  {
                    icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
                    title: 'Tutor Socrático y Cálculos Paso a Paso',
                    desc: 'Estequiometría, balanceo redox, equilibrio químico y pH explicados al detalle.',
                  },
                  {
                    icon: <Atom className="w-4 h-4 text-indigo-500" />,
                    title: 'Simuladores 3D y Laboratorio Virtual Completo',
                    desc: 'Acceso a cinéticas de gases, orbitales y estructuras cristalinas.',
                  },
                  {
                    icon: <Flame className="w-4 h-4 text-rose-500" />,
                    title: 'Zona de Retos y Modo Examen',
                    desc: 'Preguntas estilo universidad con retroalimentación inmediata.',
                  },
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-700 shadow-2xs shrink-0 mt-0.5">
                      {feat.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {feat.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Plan Picker */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Monthly */}
                <div
                  onClick={() => setSelectedPlan('monthly')}
                  className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Plan Mensual
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    $4.99
                    <span className="text-[11px] font-normal text-slate-500"> /mes</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Cancela cuando quieras</div>
                  {selectedPlan === 'monthly' && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Semester */}
                <div
                  onClick={() => setSelectedPlan('semester')}
                  className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === 'semester'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] font-extrabold text-white uppercase tracking-wider shadow-xs">
                    Ahorra 35%
                  </span>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Semestral Escolar
                  </div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    $19.99
                    <span className="text-[11px] font-normal text-slate-500"> /6 meses</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Solo $3.33 al mes</div>
                  {selectedPlan === 'semester' && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>

              {/* Main CTA */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    openCheckout(selectedPlan === 'monthly' ? 'premium_monthly' : 'premium_annual');
                    onClose();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pagar con Stripe Checkout</span>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                </button>

                <button
                  onClick={handleUpgrade}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  O activar directamente en modo Demo
                </button>

                {/* Demo / Testing Actions */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleResetCredits}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                    title="Restablece 20 créditos para probar el sistema de nuevo"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Recargar 20 créditos (Demo)</span>
                  </button>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Garantía de satisfacción</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
