import React, { useState } from 'react';
import {
  Binary,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Table,
  Calculator,
  Layers,
  Lightbulb,
} from 'lucide-react';
import {
  balanceAlgebraic,
  formatFormulaSubscripts,
  AlgebraicSolution,
} from '../../services/chemistryMath';

interface AlgebraicPreset {
  id: string;
  name: string;
  equation: string;
  description: string;
}

const ALGEBRAIC_PRESETS: AlgebraicPreset[] = [
  {
    id: 'propano',
    name: 'Combustión de Propano',
    equation: 'C3H8 + O2 -> CO2 + H2O',
    description: 'Sistema clásico de 3 elementos (C, H, O) y 4 incógnitas (a, b, c, d).',
  },
  {
    id: 'kmno4',
    name: 'Permanganato y HCl',
    equation: 'KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O',
    description: 'Sistema avanzado de 5 elementos (K, Mn, O, H, Cl) y 6 incógnitas (a, b, c, d, e, f).',
  },
  {
    id: 'sulfato-ferrico',
    name: 'Sulfato Férrico con KOH',
    equation: 'Fe2(SO4)3 + KOH -> Fe(OH)3 + K2SO4',
    description: 'Ecuación con iones poliatómicos complejos entre paréntesis.',
  },
  {
    id: 'fosfato-calcio',
    name: 'Neutralización Ácido Fosfórico',
    equation: 'Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O',
    description: 'Reacción ácido-base con múltiples reactivos poliatómicos.',
  },
  {
    id: 'al-hcl',
    name: 'Aluminio y Ácido Clorhídrico',
    equation: 'Al + HCl -> AlCl3 + H2',
    description: 'Desplazamiento redox simple resuelto algebraicamente.',
  },
];

export const AlgebraicTab: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('propano');
  const [inputEquation, setInputEquation] = useState<string>('C3H8 + O2 -> CO2 + H2O');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute algebraic solution
  const solution: AlgebraicSolution | null = balanceAlgebraic(inputEquation);

  const handleSelectPreset = (preset: AlgebraicPreset) => {
    setSelectedPresetId(preset.id);
    setInputEquation(preset.equation);
    setErrorMessage(null);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedPresetId('custom');
    const res = balanceAlgebraic(inputEquation);
    if (!res) {
      setErrorMessage('No se pudo balancear la ecuación. Verifica que los símbolos químicos sean válidos y use el formato: A + B -> C + D');
    } else {
      setErrorMessage(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Binary className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Método Algebraico (Sistema de Ecuaciones Lineales)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Plantea variables algebraicas ($a, b, c, d\dots$) y resuelve el sistema homogéneo exacto aplicando conservación elemental de la materia.
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Reacciones de ejemplo para el método algebraico:
          </label>
          <div className="flex flex-wrap gap-2">
            {ALGEBRAIC_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedPresetId === preset.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputEquation}
            onChange={(e) => setInputEquation(e.target.value)}
            placeholder="Ingresa cualquier reacción, ej: Fe2O3 + CO -> Fe + CO2"
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Armar Sistema
          </button>
        </form>
        {errorMessage && <p className="text-xs text-rose-500 font-medium mt-2">{errorMessage}</p>}
      </div>

      {solution ? (
        <div className="space-y-6">
          {/* Reaction with Algebraic Variables Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                Ecuación Química con Coeficientes Incógnita
              </div>
              <div className="p-4 sm:p-6 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-base sm:text-xl font-mono font-bold text-slate-900 dark:text-white">
                {/* Reactants with variable */}
                {solution.reactants.map((r, i) => (
                  <React.Fragment key={`alg-r-${i}`}>
                    {i > 0 && <span className="text-slate-400">+</span>}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold italic text-lg sm:text-2xl">
                        {solution.variableNames[i]}
                      </span>
                      <span>{formatFormulaSubscripts(r)}</span>
                    </div>
                  </React.Fragment>
                ))}

                <ArrowRight className="w-6 h-6 text-indigo-500 stroke-[2.5]" />

                {/* Products with variable */}
                {solution.products.map((p, j) => {
                  const idx = solution.reactants.length + j;
                  return (
                    <React.Fragment key={`alg-p-${j}`}>
                      {j > 0 && <span className="text-slate-400">+</span>}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 shadow-2xs">
                        <span className="text-teal-600 dark:text-teal-400 font-extrabold italic text-lg sm:text-2xl">
                          {solution.variableNames[idx]}
                        </span>
                        <span>{formatFormulaSubscripts(p)}</span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Section 1: Linear Equations Formulated */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>1. Sistema de Ecuaciones Lineales Planteado (Por Conservación de Átomos)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {solution.elementEquations.map((eq) => (
                  <div
                    key={eq.element}
                    className="p-4 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono">
                          {eq.element}
                        </span>
                        <span>{eq.name}</span>
                      </span>
                    </div>

                    <div className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white py-1">
                      {eq.rawEquation}
                    </div>

                    <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      Forma homogénea: {eq.homogeneousEquation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Matrix Representation */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-500" />
                <span>2. Matriz de Coeficientes del Sistema Homogéneo [A] · [X] = [0]</span>
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                    <tr>
                      {solution.matrix.headers.map((h, idx) => (
                        <th key={idx} className="px-4 py-3 font-extrabold text-center first:text-left">
                          {h}
                        </th>
                      ))}
                      <th className="px-4 py-3 font-extrabold text-center text-slate-400">= 0</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {solution.matrix.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">
                          Átomo de {row.element}
                        </td>
                        {row.values.map((val, cIdx) => (
                          <td
                            key={cIdx}
                            className={`px-4 py-2.5 text-center font-bold ${
                              val > 0
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : val < 0
                                ? 'text-teal-600 dark:text-teal-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                        <td className="px-4 py-2.5 text-center text-slate-400">0</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Step-by-Step Resolution */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-500" />
                <span>3. Deducción Matemática Paso a Paso</span>
              </h3>

              <div className="space-y-3">
                {solution.resolutionSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {step.title}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      {step.explanation}
                    </div>
                    {step.math && (
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800">
                        {step.math}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Final Balanced Equation Card */}
            <div className="p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-teal-500/10 rounded-2xl border border-indigo-300 dark:border-indigo-800/80 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-indigo-700 dark:text-indigo-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Ecuación Química Balanceada Final
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
                {solution.balancedEquationString}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                {solution.variableNames.map((v, i) => (
                  <span
                    key={v}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 font-mono text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <span className="text-indigo-600 dark:text-indigo-400 italic">{v}</span> ={' '}
                    {i < solution.reactants.length
                      ? solution.reactantCoeffs[i]
                      : solution.productCoeffs[i - solution.reactants.length]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          Ingresa una ecuación química válida para formular el sistema de ecuaciones.
        </div>
      )}
    </div>
  );
};
