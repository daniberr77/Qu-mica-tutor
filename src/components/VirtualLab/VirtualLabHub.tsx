import React, { useState, Suspense, lazy } from 'react';
import {
  FlaskConical,
  Atom,
  Layers,
  Flame,
  Droplet,
  Bot,
  Cpu,
  Sparkles,
  Zap,
  Lock,
  Crown,
  Wind,
  Box,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useStudent } from '../../context';
import { Loading3DFallback } from './Loading3DFallback';
import {
  createCheckoutSession,
  buildStripeWebhookEvent,
  handleStripeWebhook,
} from '../../services/stripeService';
import confetti from 'canvas-confetti';

// ========================================================================
// LAZY LOADING (CARGA DIFERIDA) DE LOS SIMULADORES 3D
// ========================================================================
const AtomSimulator3D = lazy(() =>
  import('../Simulator3D/AtomMoleculeSimulator').then((m) => ({
    default: (props: any) => <m.AtomMoleculeSimulator {...props} initialMode="atom" />,
  }))
);

const MoleculeSimulator3D = lazy(() =>
  import('../Simulator3D/AtomMoleculeSimulator').then((m) => ({
    default: (props: any) => <m.AtomMoleculeSimulator {...props} initialMode="molecule" />,
  }))
);

const ReactionLab3D = lazy(() =>
  import('../ReactionLab/ReactionLab3D').then((m) => ({
    default: m.ReactionLab3D,
  }))
);

const SolutionsLab3D = lazy(() =>
  import('../SolutionsLab/SolutionsLab').then((m) => ({
    default: m.SolutionsLab,
  }))
);

// Simuladores 3D avanzados exclusivos del Modo Premium
const GasKinetics3D = lazy(() =>
  import('./simulators/GasKinetics3D').then((m) => ({
    default: m.GasKinetics3D || m.default,
  }))
);

const CrystalLattices3D = lazy(() =>
  import('./simulators/CrystalLattices3D').then((m) => ({
    default: m.CrystalLattices3D || m.default,
  }))
);

export type VirtualLabTab =
  | 'atom'
  | 'molecule'
  | 'reactions'
  | 'solutions'
  | 'gas'
  | 'lattices';

interface VirtualLabHubProps {
  initialTab?: VirtualLabTab;
  onAskTutor?: (question: string) => void;
  onNavigateToPlans?: () => void;
}

export const VirtualLabHub: React.FC<VirtualLabHubProps> = ({
  initialTab = 'reactions',
  onAskTutor,
  onNavigateToPlans,
}) => {
  const { profile, openCheckout, upgradeToPremium } = useStudent();
  const [activeTab, setActiveTab] = useState<VirtualLabTab>(initialTab);
  const [isSimulatingQuickUnlock, setIsSimulatingQuickUnlock] = useState(false);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#06b6d4'],
      });
    } catch (e) {
      console.log('Confetti', e);
    }
  };

  const handleQuickWebhookUnlock = async () => {
    try {
      setIsSimulatingQuickUnlock(true);
      const session = await createCheckoutSession({
        planId: 'premium_monthly',
        studentId: profile.id,
      });
      const webhookEvent = buildStripeWebhookEvent('checkout.session.completed', session);
      await handleStripeWebhook(webhookEvent);
      upgradeToPremium('subscription');
      triggerCelebration();
    } catch (err) {
      console.error('Error al simular webhook:', err);
    } finally {
      setIsSimulatingQuickUnlock(false);
    }
  };

  const simulators = [
    {
      id: 'atom' as const,
      name: 'Estructura Atómica 3D',
      shortName: 'Átomo Cuántico',
      badge: 'Bohr & Orbitales',
      requiresPremium: false,
      icon: Atom,
      color: 'from-purple-600 via-indigo-600 to-cyan-500',
      activeText: 'text-purple-600 dark:text-purple-400',
      activeBorder: 'border-purple-500',
      activeBg: 'bg-purple-50 dark:bg-purple-950/50',
      description: 'Explora protones, neutrones, electrones en capas cuánticas y configuración electrónica en 3D.',
      tutorPrompt:
        'Hola QuimiBot, estoy en el Simulador Atómico 3D del Laboratorio Virtual. ¿Podrías explicarme cómo se distribuyen los electrones en los diferentes niveles de energía de Bohr y cómo calcular la carga nuclear efectiva?',
    },
    {
      id: 'molecule' as const,
      name: 'Modelos Moleculares 3D',
      shortName: 'Moléculas (VSEPR)',
      badge: 'Enlaces & Geometría',
      requiresPremium: false,
      icon: Layers,
      color: 'from-cyan-500 to-blue-600',
      activeText: 'text-cyan-600 dark:text-cyan-400',
      activeBorder: 'border-cyan-500',
      activeBg: 'bg-cyan-50 dark:bg-cyan-950/50',
      description: 'Construye y visualiza moléculas 3D, ángulos de enlace, repulsión electrónica y modelos de esferas y varillas.',
      tutorPrompt:
        'Hola QuimiBot, estoy visualizando Moléculas en 3D. ¿Por qué el agua tiene un ángulo de enlace de 104.5° en vez de 109.5° según la teoría de repulsión de pares electrónicos de la capa de valencia (RPECV)?',
    },
    {
      id: 'reactions' as const,
      name: 'Reacciones Químicas y Cinética 3D',
      shortName: 'Reacciones & Cinética',
      badge: 'Colisiones & ΔH',
      requiresPremium: false,
      icon: Flame,
      color: 'from-amber-500 to-rose-600',
      activeText: 'text-amber-600 dark:text-amber-400',
      activeBorder: 'border-amber-500',
      activeBg: 'bg-amber-50 dark:bg-amber-950/50',
      description: 'Observa la ruptura y formación de enlaces átomo por átomo, perfiles energéticos y estados de transición en tiempo real.',
      tutorPrompt:
        'Hola QuimiBot, estoy analizando la simulación 3D de una reacción química y su perfil de energía. ¿Qué representa el complejo activado en el pico de la curva y cómo influye la energía de activación en la velocidad de reacción?',
    },
    {
      id: 'solutions' as const,
      name: 'Disoluciones y Solubilidad 3D',
      shortName: 'Disoluciones & pH',
      badge: 'Solubilidad & Molaridad',
      requiresPremium: false,
      icon: Droplet,
      color: 'from-emerald-500 to-teal-600',
      activeText: 'text-emerald-600 dark:text-emerald-400',
      activeBorder: 'border-emerald-500',
      activeBg: 'bg-emerald-50 dark:bg-emerald-950/50',
      description: 'Vaso de precipitados interactivo con cálculo en vivo de Molaridad, Molalidad, % m/m, solubilidad con temperatura y precipitado.',
      tutorPrompt:
        'Hola QuimiBot, estoy en el Laboratorio de Disoluciones 3D. Si agrego más soluto del límite de solubilidad a 20°C, ¿por qué precipita y cómo cambia la concentración molar si caliento la solución?',
    },
    {
      id: 'gas' as const,
      name: 'Cinética y Difusión de Gases Ideales 3D',
      shortName: 'Gases Ideales 3D',
      badge: 'PV=nRT & Maxwell',
      requiresPremium: true,
      icon: Wind,
      color: 'from-blue-600 via-teal-600 to-emerald-500',
      activeText: 'text-teal-600 dark:text-teal-400',
      activeBorder: 'border-teal-500',
      activeBg: 'bg-teal-50 dark:bg-teal-950/50',
      description: 'Cámara volumétrica 3D con simulación de partículas en movimiento browniano, leyes de Boyle, Charles, Gay-Lussac, difusión molecular y distribución de Maxwell-Boltzmann.',
      tutorPrompt:
        'Hola QuimiBot, estoy explorando el Simulador 3D de Gases Ideales. ¿Cómo se relaciona la velocidad cuadrática media de las partículas con la temperatura absoluta según la teoría cinética molecular?',
    },
    {
      id: 'lattices' as const,
      name: 'Redes Cristalinas y Celdas Unitarias 3D',
      shortName: 'Redes Cristalinas 3D',
      badge: 'SC, BCC, FCC & Empaque',
      requiresPremium: true,
      icon: Box,
      color: 'from-indigo-600 via-purple-600 to-pink-500',
      activeText: 'text-indigo-600 dark:text-indigo-400',
      activeBorder: 'border-indigo-500',
      activeBg: 'bg-indigo-50 dark:bg-indigo-950/50',
      description: 'Celdas unitarias tridimensionales (Cúbica Simple, BCC, FCC). Manipula radios atómicos, planos de corte cristalográficos y factor de empaquetamiento atómico.',
      tutorPrompt:
        'Hola QuimiBot, estoy en el Simulador 3D de Redes Cristalinas. ¿Por qué la celda FCC (cúbica centrada en las caras) tiene una eficiencia de empaquetamiento del 74% frente al 68% de la BCC?',
    },
  ];

  const currentSim = simulators.find((s) => s.id === activeTab) || simulators[0];
  const isLockedForFree = currentSim.requiresPremium && !profile.isPremium;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
      {/* ======================================================== */}
      {/* TOP HEADER: LABORATORIO VIRTUAL & OPTIMIZACIÓN LAZY      */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <FlaskConical className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Laboratorio Virtual 3D
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">
                  6 Simuladores 3D
                </span>
                {profile.isPremium && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span>Premium Desbloqueado</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Experimentación científica tridimensional interactiva con física WebGL y cálculo en tiempo real.
              </p>
            </div>
          </div>

          {/* Performance Status & Tutor Assistance */}
          <div className="flex items-center flex-wrap gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <Cpu className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 leading-none">
                  Rendimiento
                </div>
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                  <span>Carga Diferida Activa</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </div>
              </div>
            </div>

            {onAskTutor && (
              <button
                onClick={() => onAskTutor(currentSim.tutorPrompt)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md transition cursor-pointer"
                title="Consultar al tutor QuimiBot sobre este simulador"
              >
                <Bot className="w-4 h-4" />
                <span>Consultar a QuimiBot</span>
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SIMULATOR SWITCHER NAVIGATION MENU (6 VISTAS 3D)         */}
        {/* ======================================================== */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {simulators.map((sim) => {
            const Icon = sim.icon;
            const isActive = activeTab === sim.id;
            const isLocked = sim.requiresPremium && !profile.isPremium;

            return (
              <button
                key={sim.id}
                onClick={() => setActiveTab(sim.id)}
                className={`relative p-3 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  isActive
                    ? `${sim.activeBg} ${sim.activeBorder} shadow-sm ring-1 ${sim.activeBorder}`
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {/* Lock or Premium indicator badge */}
                {isLocked ? (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase flex items-center gap-0.5 shadow-xs">
                    <Lock className="w-2.5 h-2.5" />
                    <span>PRO</span>
                  </span>
                ) : sim.requiresPremium && profile.isPremium ? (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-md bg-emerald-500 text-white text-[9px] font-black uppercase flex items-center gap-0.5 shadow-xs">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>PRO</span>
                  </span>
                ) : null}

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive
                      ? `bg-gradient-to-tr ${sim.color} text-white shadow-xs`
                      : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-black truncate ${
                        isActive ? sim.activeText : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {sim.shortName}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {sim.badge}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3D VIEWPORT WITH SUSPENSE O PAYWALL PREVIEW CARD         */}
      {/* ======================================================== */}
      <div className="relative">
        {isLockedForFree ? (
          /* ======================================================= */
          /* PAYWALL CARD: SIMULADOR 3D BLOQUEADO                   */
          /* ======================================================= */
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white border border-indigo-500/30 shadow-2xl relative overflow-hidden text-center space-y-6">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-lg mx-auto space-y-3">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10 animate-pulse">
                <Lock className="w-8 h-8" />
              </div>

              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Simulador 3D Exclusivo de Modo Premium
              </span>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {currentSim.name}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentSim.description}
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Física WebGL en Tiempo Real</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Manipula variables de estado (P, V, T, n) y observa la respuesta gráfica inmediata.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cero Reducción de Créditos</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Accede a consultas ilimitadas con el tutor QuimiBot IA mientras experimentas.
                </p>
              </div>
            </div>

            {/* CTAs de Desbloqueo */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => openCheckout('premium_monthly')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 hover:from-emerald-400 hover:to-indigo-400 text-white font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Crown className="w-4 h-4 text-amber-200" />
                <span>Desbloquear con Stripe ($9.99/mes)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleQuickWebhookUnlock}
                disabled={isSimulatingQuickUnlock}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
                title="Dispara el webhook simulado para probar el desbloqueo instantáneo"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>
                  {isSimulatingQuickUnlock
                    ? 'Procesando Webhook...'
                    : '⚡ Simular Webhook (Test Rápido)'}
                </span>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantía de satisfacción de 30 días • Procesado por Stripe</span>
            </div>
          </div>
        ) : (
          /* ======================================================= */
          /* 3D VIEWPORT WITH SUSPENSE (NORMAL LOAD)                 */
          /* ======================================================= */
          <Suspense
            fallback={
              <Loading3DFallback
                title={`Cargando ${currentSim.name}...`}
                message={`Carga diferida (Lazy Loading) en curso para ${currentSim.shortName}. Las librerías de Three.js y WebGL se descargan bajo demanda.`}
              />
            }
          >
            {activeTab === 'atom' && <AtomSimulator3D onAskTutor={onAskTutor} />}
            {activeTab === 'molecule' && <MoleculeSimulator3D onAskTutor={onAskTutor} />}
            {activeTab === 'reactions' && <ReactionLab3D onAskTutor={onAskTutor} />}
            {activeTab === 'solutions' && <SolutionsLab3D />}
            {activeTab === 'gas' && <GasKinetics3D />}
            {activeTab === 'lattices' && <CrystalLattices3D />}
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default VirtualLabHub;
