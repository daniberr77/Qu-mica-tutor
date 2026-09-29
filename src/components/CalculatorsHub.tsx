import React, { useState } from 'react';
import { MolarMassCalc } from './Calculators/MolarMassCalc';
import { GasLawCalc } from './Calculators/GasLawCalc';
import { PhCalc } from './Calculators/PhCalc';
import { EquationBalancer } from './Calculators/EquationBalancer';
import { Calculator, Wind, Droplet, Scale } from 'lucide-react';

export const CalculatorsHub: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'mol' | 'gas' | 'ph' | 'balance'>('mol');

  return (
    <div className="space-y-6">
      {/* Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTool('mol')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTool === 'mol'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Masa Molar & Moles</span>
        </button>

        <button
          onClick={() => setActiveTool('gas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTool === 'gas'
              ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>Gases Ideales (PV=nRT)</span>
        </button>

        <button
          onClick={() => setActiveTool('ph')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTool === 'ph'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>Escala y Cálculo de pH</span>
        </button>

        <button
          onClick={() => setActiveTool('balance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTool === 'balance'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Balanceador de Ecuaciones</span>
        </button>
      </div>

      {/* Render active tool */}
      {activeTool === 'mol' && <MolarMassCalc />}
      {activeTool === 'gas' && <GasLawCalc />}
      {activeTool === 'ph' && <PhCalc />}
      {activeTool === 'balance' && <EquationBalancer />}
    </div>
  );
};
