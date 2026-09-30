import React, { useState } from 'react';
import { Scale, Zap, Binary } from 'lucide-react';
import { TanteoTab } from './TanteoTab';
import { RedoxTab } from './RedoxTab';
import { AlgebraicTab } from './AlgebraicTab';

export type BalancingMethod = 'tanteo' | 'redox' | 'algebraic';

export const EquationBalancingModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<BalancingMethod>('tanteo');

  return (
    <div className="space-y-6">
      {/* Subtab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('tanteo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'tanteo'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Balanceo por Tanteo</span>
        </button>

        <button
          onClick={() => setActiveSubTab('redox')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'redox'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Balanceo Redox (Estados de Oxidación)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('algebraic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'algebraic'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Binary className="w-4 h-4" />
          <span>Método Algebraico (Sistema de Ecuaciones)</span>
        </button>
      </div>

      {/* Render selected subtab */}
      {activeSubTab === 'tanteo' && <TanteoTab />}
      {activeSubTab === 'redox' && <RedoxTab />}
      {activeSubTab === 'algebraic' && <AlgebraicTab />}
    </div>
  );
};
