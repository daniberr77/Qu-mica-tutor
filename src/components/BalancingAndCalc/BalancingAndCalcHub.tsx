import React, { useState } from 'react';
import { Scale, FlaskConical, Sparkles, Layers } from 'lucide-react';
import { EquationBalancingModule } from './EquationBalancingModule';
import { StoichiometryModule } from './StoichiometryModule';

export const BalancingAndCalcHub: React.FC = () => {
  const [activeMainModule, setActiveMainModule] = useState<'balancer' | 'stoichiometry'>('balancer');

  return (
    <div className="space-y-6">
      {/* Top Banner & Module Selector */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-extrabold uppercase tracking-wider text-emerald-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Herramientas de Balanceo y Cálculo Químico</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Balanceo de Ecuaciones y Estequiometría Numérica
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Resuelve balances por inspección directa (tanteo), asignación sistemática de estados de oxidación (redox) y formulación de sistemas algebraicos lineales exactos. Calcula reactivos limitantes, excesos y rendimientos teóricos al instante con matemática pura.
            </p>
          </div>

          {/* Module Switcher Buttons */}
          <div className="flex bg-slate-900/40 p-1.5 rounded-2xl backdrop-blur-md self-start md:self-auto border border-white/10">
            <button
              onClick={() => setActiveMainModule('balancer')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeMainModule === 'balancer'
                  ? 'bg-white text-emerald-700 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Balanceo de Ecuaciones</span>
            </button>

            <button
              onClick={() => setActiveMainModule('stoichiometry')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeMainModule === 'stoichiometry'
                  ? 'bg-white text-teal-700 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>Calculadora Estequiométrica</span>
            </button>
          </div>
        </div>

        {/* Ambient background blur elements */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Main Module Content */}
      <div className="transition-all">
        {activeMainModule === 'balancer' && <EquationBalancingModule />}
        {activeMainModule === 'stoichiometry' && <StoichiometryModule />}
      </div>
    </div>
  );
};
