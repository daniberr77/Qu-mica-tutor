import React, { useState } from 'react';
import { periodicTableElements } from '../../data/periodicTable';
import { Calculator, Sparkles, AlertCircle } from 'lucide-react';

interface ParsedElement {
  symbol: string;
  name: string;
  count: number;
  atomicMass: number;
  totalMass: number;
  percentage: number;
}

export const MolarMassCalc: React.FC = () => {
  const [formula, setFormula] = useState<string>('H2SO4');
  const [sampleGrams, setSampleGrams] = useState<string>('98.08');

  // Parse formula with support for parentheses: e.g. Ca(OH)2, Fe2(SO4)3
  const parseFormula = (str: string): Record<string, number> | null => {
    try {
      const clean = str.trim();
      if (!clean) return null;

      // Expand parentheses: e.g. Ca(OH)2 -> Ca O2 H2
      let expanded = clean;
      const parenRegex = /\(([^()]+)\)(\d+)?/g;
      
      while (parenRegex.test(expanded)) {
        expanded = expanded.replace(parenRegex, (_, group, multStr) => {
          const mult = multStr ? parseInt(multStr, 10) : 1;
          const groupElements = group.match(/([A-Z][a-z]*)(\d*)/g) || [];
          return groupElements
            .map((item: string) => {
              const m = item.match(/([A-Z][a-z]*)(\d*)/);
              if (!m) return item;
              const sym = m[1];
              const count = m[2] ? parseInt(m[2], 10) : 1;
              return `${sym}${count * mult}`;
            })
            .join('');
        });
      }

      const counts: Record<string, number> = {};
      const matches = expanded.match(/([A-Z][a-z]*)(\d*)/g);
      if (!matches) return null;

      let reconstructedLength = 0;
      for (const match of matches) {
        reconstructedLength += match.length;
        const sub = match.match(/([A-Z][a-z]*)(\d*)/);
        if (!sub) return null;
        const symbol = sub[1];
        const count = sub[2] ? parseInt(sub[2], 10) : 1;
        counts[symbol] = (counts[symbol] || 0) + count;
      }

      if (reconstructedLength !== expanded.length) {
        return null;
      }

      return counts;
    } catch {
      return null;
    }
  };

  const parsedCounts = parseFormula(formula);
  let elementsList: ParsedElement[] = [];
  let totalMolarMass = 0;
  let hasUnknownElement = false;

  if (parsedCounts) {
    for (const [sym, count] of Object.entries(parsedCounts)) {
      const el = periodicTableElements.find(e => e.symbol === sym);
      if (!el) {
        hasUnknownElement = true;
        break;
      }
      const mass = el.atomicMass;
      const total = mass * count;
      totalMolarMass += total;
      elementsList.push({
        symbol: sym,
        name: el.name,
        count,
        atomicMass: mass,
        totalMass: total,
        percentage: 0
      });
    }

    if (totalMolarMass > 0) {
      elementsList = elementsList.map(e => ({
        ...e,
        percentage: (e.totalMass / totalMolarMass) * 100
      }));
    }
  }

  const grams = parseFloat(sampleGrams) || 0;
  const moles = totalMolarMass > 0 && grams > 0 ? grams / totalMolarMass : 0;
  const molecules = moles * 6.02214076e23;

  const presets = [
    { name: 'Agua', formula: 'H2O' },
    { name: 'Ácido Sulfúrico', formula: 'H2SO4' },
    { name: 'Glucosa', formula: 'C6H12O6' },
    { name: 'Hidróxido de Calcio', formula: 'Ca(OH)2' },
    { name: 'Sulfato Férrico', formula: 'Fe2(SO4)3' },
    { name: 'Permanganato de Potasio', formula: 'KMnO4' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Calculadora de Masa Molar y Moles</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Analiza fórmulas químicas, calcula porcentajes de masa y convierte gramos a moles</p>
        </div>
      </div>

      {/* Preset pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 py-1">Ejemplos:</span>
        {presets.map(p => (
          <button
            key={p.formula}
            onClick={() => {
              setFormula(p.formula);
            }}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
              formula === p.formula
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {p.name} ({p.formula})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Fórmula Química
          </label>
          <div className="relative">
            <input
              type="text"
              value={formula}
              onChange={(e) => {
                setFormula(e.target.value);
              }}
              placeholder="Ej: Ca(OH)2, H2SO4, C6H12O6"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
            <Sparkles className="w-5 h-5 text-purple-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Distingue mayúsculas y minúsculas (ej: <code className="text-purple-600 dark:text-purple-400">NaCl</code>, no <code className="line-through">nacl</code>).
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Masa de muestra (gramos)
          </label>
          <input
            type="number"
            value={sampleGrams}
            onChange={(e) => setSampleGrams(e.target.value)}
            placeholder="Gramos para convertir a moles"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Convierte a moles automáticamente usando $n = m / M$.
          </p>
        </div>
      </div>

      {hasUnknownElement && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-300 text-sm mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Uno o más elementos no fueron reconocidos en la fórmula. Asegúrate de usar símbolos válidos con su primera letra mayúscula (ej. <strong>Cl</strong>, no <strong>CL</strong>).</span>
        </div>
      )}

      {elementsList.length > 0 && totalMolarMass > 0 && !hasUnknownElement ? (
        <div className="space-y-6">
          {/* Main result cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 block mb-1">Masa Molar (M)</span>
              <div className="text-2xl font-bold font-mono text-purple-900 dark:text-purple-200">
                {totalMolarMass.toFixed(3)} <span className="text-sm font-normal">g/mol</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-1">Cantidad de Moles (n)</span>
              <div className="text-2xl font-bold font-mono text-blue-900 dark:text-blue-200">
                {moles.toFixed(4)} <span className="text-sm font-normal">mol</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">Moléculas Totales</span>
              <div className="text-2xl font-bold font-mono text-emerald-900 dark:text-emerald-200">
                {moles > 0 ? (molecules).toExponential(3) : '0'}
              </div>
            </div>
          </div>

          {/* Elemental composition breakdown */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              Composición Porcentual por Elemento
            </h4>
            
            {/* Visual stacked bar */}
            <div className="h-4 w-full flex rounded-full overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800">
              {elementsList.map((el, i) => {
                const colors = ['bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
                return (
                  <div
                    key={el.symbol}
                    style={{ width: `${el.percentage}%` }}
                    className={`${colors[i % colors.length]} transition-all duration-500`}
                    title={`${el.name} (${el.symbol}): ${el.percentage.toFixed(1)}%`}
                  />
                );
              })}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-3">Elemento</th>
                    <th className="py-2.5 px-3">Átomos</th>
                    <th className="py-2.5 px-3">Masa Atómica</th>
                    <th className="py-2.5 px-3">Masa Aportada</th>
                    <th className="py-2.5 px-3">% Masa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {elementsList.map(el => (
                    <tr key={el.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-3 font-sans font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-purple-600 dark:text-purple-400">
                          {el.symbol}
                        </span>
                        <span>{el.name}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{el.count}</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{el.atomicMass.toFixed(3)} u</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{el.totalMass.toFixed(3)} g/mol</td>
                      <td className="py-2 px-3 font-semibold text-purple-600 dark:text-purple-400">{el.percentage.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
