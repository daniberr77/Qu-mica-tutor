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
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Loading3DFallback } from './Loading3DFallback';

// ========================================================================
// LAZY LOADING (CARGA DIFERIDA) DE LOS 4 SIMULADORES 3D PESADOS
// Se cargan dinámicamente mediante React.lazy() solo cuando el estudiante
// entra al Laboratorio Virtual y selecciona la vista correspondiente.
// Esto aísla las librerías 3D (Three.js/OrbitControls/Shaders) en chunks
// separados y evita ralentizar el arranque y navegación de la aplicación.
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

export type VirtualLabTab = 'atom' | 'molecule' | 'reactions' | 'solutions';

interface VirtualLabHubProps {
  initialTab?: VirtualLabTab;
  onAskTutor?: (question: string) => void;
}

export const VirtualLabHub: React.FC<VirtualLabHubProps> = ({ initialTab = 'reactions', onAskTutor }) => {
  const [activeTab, setActiveTab] = useState<VirtualLabTab>(initialTab);

  const simulators = [
    {
      id: 'atom' as const,
      name: 'Estructura Atómica 3D',
      shortName: 'Átomo Cuántico',
      badge: 'Bohr & Orbitales',
      icon: Atom,
      color: 'from-purple-600 via-indigo-600 to-cyan-500',
      activeText: 'text-purple-600 dark:text-purple-400',
      activeBorder: 'border-purple-500',
      activeBg: 'bg-purple-50 dark:bg-purple-950/50',
      description: 'Explora protones, neutrones, electrones en capas cuánticas y configuración electrónica en 3D.',
      tutorPrompt: 'Hola QuimiBot, estoy en el Simulador Atómico 3D del Laboratorio Virtual. ¿Podrías explicarme cómo se distribuyen los electrones en los diferentes niveles de energía de Bohr y cómo calcular la carga nuclear efectiva?',
    },
    {
      id: 'molecule' as const,
      name: 'Modelos Moleculares 3D',
      shortName: 'Moléculas (VSEPR)',
      badge: 'Enlaces & Geometría',
      icon: Layers,
      color: 'from-cyan-500 to-blue-600',
      activeText: 'text-cyan-600 dark:text-cyan-400',
      activeBorder: 'border-cyan-500',
      activeBg: 'bg-cyan-50 dark:bg-cyan-950/50',
      description: 'Construye y visualiza moléculas 3D, ángulos de enlace, repulsión electrónica y modelos de esferas y varillas.',
      tutorPrompt: 'Hola QuimiBot, estoy visualizando Moléculas en 3D. ¿Por qué el agua tiene un ángulo de enlace de 104.5° en vez de 109.5° según la teoría de repulsión de pares electrónicos de la capa de valencia (RPECV)?',
    },
    {
      id: 'reactions' as const,
      name: 'Reacciones Químicas y Cinética 3D',
      shortName: 'Reacciones & Cinética',
      badge: 'Colisiones & ΔH',
      icon: Flame,
      color: 'from-amber-500 to-rose-600',
      activeText: 'text-amber-600 dark:text-amber-400',
      activeBorder: 'border-amber-500',
      activeBg: 'bg-amber-50 dark:bg-amber-950/50',
      description: 'Observa la ruptura y formación de enlaces átomo por átomo, perfiles energéticos y estados de transición en tiempo real.',
      tutorPrompt: 'Hola QuimiBot, estoy analizando la simulación 3D de una reacción química y su perfil de energía. ¿Qué representa el complejo activado en el pico de la curva y cómo influye la energía de activación en la velocidad de reacción?',
    },
    {
      id: 'solutions' as const,
      name: 'Disoluciones y Solubilidad 3D',
      shortName: 'Disoluciones & pH',
      badge: 'Solubilidad & Molaridad',
      icon: Droplet,
      color: 'from-emerald-500 to-teal-600',
      activeText: 'text-emerald-600 dark:text-emerald-400',
      activeBorder: 'border-emerald-500',
      activeBg: 'bg-emerald-50 dark:bg-emerald-950/50',
      description: 'Vaso de precipitados interactivo con cálculo en vivo de Molaridad, Molalidad, % m/m, solubilidad con temperatura y precipitado.',
      tutorPrompt: 'Hola QuimiBot, estoy en el Laboratorio de Disoluciones 3D. Si agrego más soluto del límite de solubilidad a 20°C, ¿por qué precipita y cómo cambia la concentración molar si caliento la solución?',
    },
  ];

  const currentSim = simulators.find((s) => s.id === activeTab) || simulators[0];

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
                  4 Simuladores 3D
                </span>
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
        {/* SIMULATOR SWITCHER NAVIGATION MENU (4 VISTAS 3D)         */}
        {/* ======================================================== */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {simulators.map((sim) => {
            const Icon = sim.icon;
            const isActive = activeTab === sim.id;

            return (
              <button
                key={sim.id}
                onClick={() => setActiveTab(sim.id)}
                className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  isActive
                    ? `${sim.activeBg} ${sim.activeBorder} shadow-sm ring-1 ${sim.activeBorder}`
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
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
      {/* 3D VIEWPORT WITH SUSPENSE (LAZY LOADING FALLBACK)        */}
      {/* ======================================================== */}
      <div className="relative">
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
        </Suspense>
      </div>
    </div>
  );
};

export default VirtualLabHub;
