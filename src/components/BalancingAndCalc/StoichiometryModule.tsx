import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Percent,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  calculateStoichiometry,
  balanceAlgebraic,
  formatFormulaSubscripts,
  getMolarMass,
  parseEquation,
  StoichiometryResult,
} from '../../services/chemistryMath';

interface StoichPreset {
  id: string;
  name: string;
  equation: string;
  defaultInputs: Record<string, { amount: number; unit: 'g' | 'mol' }>;
  description: string;
}

const STOICH_PRESETS: StoichPreset[] = [
  {
    id: 'haber',
    name: 'Síntesis de Amoníaco (Haber)',
    equation: 'N2 + 3 H2 -> 2 NH3',
    defaultInputs: {
      N2: { amount: 28, unit: 'g' },
      H2: { amount: 9, unit: 'g' },
    },
    description: '28 g de N₂ reaccionan con 9 g de H₂. ¿Cuál es el reactivo limitante?',
  },
  {
    id: 'al-cl2',
    name: 'Cloruro de Aluminio',
    equation: '2 Al + 3 Cl2 -> 2 AlCl3',
    defaultInputs: {
      Al: { amount: 54, unit: 'g' },
      Cl2: { amount: 100, unit: 'g' },
    },
    description: '54 g de Aluminio y 100 g de Cloro molecular.',
  },
  {
    id: 'combustion-ch4',
    name: 'Combustión de Metano',
    equation: 'CH4 + 2 O2 -> CO2 + 2 H2O',
    defaultInputs: {
      CH4: { amount: 32, unit: 'g' },
      O2: { amount: 64, unit: 'g' },
    },
    description: '32 g de gas natural (CH₄) en presencia de 64 g de O₂.',
  },
  {
    id: 'agua',
    name: 'Formación de Agua',
    equation: '2 H2 + O2 -> 2 H2O',
    defaultInputs: {
      H2: { amount: 4, unit: 'g' },
      O2: { amount: 32, unit: 'g' },
    },
    description: 'Proporción estequiométrica exacta de gases detonantes.',
  },
  {
    id: 'hierro-oxigeno',
    name: 'Oxidación del Hierro',
    equation: '4 Fe + 3 O2 -> 2 Fe2O3',
    defaultInputs: {
      Fe: { amount: 100, unit: 'g' },
      O2: { amount: 50, unit: 'g' },
    },
    description: '100 g de virutas de hierro en atmósfera enriquecida con 50 g de oxígeno.',
  },
];

export const StoichiometryModule: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('haber');
  const [equationStr, setEquationStr] = useState<string>('N2 + 3 H2 -> 2 NH3');
  const [customEquationInput, setCustomEquationInput] = useState<string>('N2 + 3 H2 -> 2 NH3');

  // Reactant inputs: { [formula]: { amount: number, unit: 'g' | 'mol' } }
  const [reactantInputs, setReactantInputs] = useState<
    Record<string, { amount: number; unit: 'g' | 'mol' }>
  >({
    N2: { amount: 28, unit: 'g' },
    H2: { amount: 9, unit: 'g' },
  });

  // Optional experimental yield input for % yield calculation
  const [actualYieldGrams, setActualYieldGrams] = useState<string>('30');
  const [actualYieldProduct, setActualYieldProduct] = useState<string>('');

  const [showDetailedSteps, setShowDetailedSteps] = useState<boolean>(true);

  // Automatically balance equation and find reactant/product species
  const balancedData = useMemo(() => {
    return balanceAlgebraic(equationStr);
  }, [equationStr]);

  // When changing presets
  const handleSelectPreset = (preset: StoichPreset) => {
    setSelectedPresetId(preset.id);
    setEquationStr(preset.equation);
    setCustomEquationInput(preset.equation);
    setReactantInputs(preset.defaultInputs);
    setActualYieldGrams('');
  };

  // Custom equation submit
  const handleEquationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseEquation(customEquationInput);
    if (!parsed) return;

    const balanced = balanceAlgebraic(customEquationInput);
    if (balanced) {
      setEquationStr(balanced.balancedEquationString);
      setSelectedPresetId('custom');

      // Initialize inputs for reactants
      const newInputs: Record<string, { amount: number; unit: 'g' | 'mol' }> = {};
      balanced.reactants.forEach((r, idx) => {
        newInputs[r] = { amount: idx === 0 ? 50 : 0, unit: 'g' };
      });
      setReactantInputs(newInputs);
    }
  };

  const updateReactantAmount = (formula: string, amount: number) => {
    setReactantInputs((prev) => ({
      ...prev,
      [formula]: {
        amount: Math.max(0, amount || 0),
        unit: prev[formula]?.unit || 'g',
      },
    }));
  };

  const updateReactantUnit = (formula: string, unit: 'g' | 'mol') => {
    setReactantInputs((prev) => ({
      ...prev,
      [formula]: {
        amount: prev[formula]?.amount || 0,
        unit,
      },
    }));
  };

  // Target product for % yield
  const defaultProductFormula = balancedData?.products[0] || '';
  const selectedProductFormula = actualYieldProduct || defaultProductFormula;

  // Run pure mathematical stoichiometric calculation
  const stoichResult: StoichiometryResult | null = useMemo(() => {
    if (!equationStr) return null;
    const actualGramsNum = parseFloat(actualYieldGrams);
    const actualYield =
      !isNaN(actualGramsNum) && actualGramsNum > 0
        ? { productFormula: selectedProductFormula, actualGrams: actualGramsNum }
        : undefined;

    return calculateStoichiometry(equationStr, reactantInputs, actualYield);
  }, [equationStr, reactantInputs, actualYieldGrams, selectedProductFormula]);

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
                <FlaskConical className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Calculadora Estequiométrica y Rendimiento
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Ingresa los gramos o moles de los reactivos para calcular matemáticamente el reactivo limitante, reactivo en exceso y el rendimiento teórico de los productos.
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Problemas estequiométricos clásicos:
          </label>
          <div className="flex flex-wrap gap-2">
            {STOICH_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedPresetId === preset.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Equation Input */}
        <form onSubmit={handleEquationSubmit} className="flex gap-2">
          <input
            type="text"
            value={customEquationInput}
            onChange={(e) => setCustomEquationInput(e.target.value)}
            placeholder="Escribe una ecuación (ej: Al + O2 -> Al2O3 o Ca(OH)2 + HCl -> CaCl2 + H2O)"
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Cargar Ecuación
          </button>
        </form>
      </div>

      {/* Balanced Reaction Display Card */}
      {balancedData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2">
              Ecuación Química Balanceada de Trabajo
            </div>
            <div className="p-4 sm:p-5 bg-teal-50/50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-900/60 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-base sm:text-xl font-mono font-bold text-slate-900 dark:text-white">
              {balancedData.reactants.map((r, i) => (
                <React.Fragment key={`rx-r-${i}`}>
                  {i > 0 && <span className="text-slate-400">+</span>}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    {balancedData.reactantCoeffs[i] > 1 && (
                      <span className="text-teal-600 dark:text-teal-400 font-extrabold text-lg sm:text-2xl">
                        {balancedData.reactantCoeffs[i]}
                      </span>
                    )}
                    <span>{formatFormulaSubscripts(r)}</span>
                  </div>
                </React.Fragment>
              ))}

              <ArrowRight className="w-6 h-6 text-teal-500 stroke-[2.5]" />

              {balancedData.products.map((p, j) => (
                <React.Fragment key={`rx-p-${j}`}>
                  {j > 0 && <span className="text-slate-400">+</span>}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    {balancedData.productCoeffs[j] > 1 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg sm:text-2xl">
                        {balancedData.productCoeffs[j]}
                      </span>
                    )}
                    <span>{formatFormulaSubscripts(p)}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Reactants Input Cards */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
              <span>Cantidades de Reactivos Alimentados</span>
              <span className="text-xs font-normal text-slate-400">
                (Ingresa masa en gramos o cantidad en moles)
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {balancedData.reactants.map((formula, idx) => {
                const { molarMass } = getMolarMass(formula);
                const currentInput = reactantInputs[formula] || { amount: 0, unit: 'g' };

                return (
                  <div
                    key={formula}
                    className="p-5 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                          {formatFormulaSubscripts(formula)}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Coeficiente: {balancedData.reactantCoeffs[idx]}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        M = {molarMass} g/mol
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={currentInput.amount || ''}
                          onChange={(e) =>
                            updateReactantAmount(formula, parseFloat(e.target.value))
                          }
                          placeholder="0.00"
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      {/* Unit selector pill */}
                      <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1">
                        <button
                          type="button"
                          onClick={() => updateReactantUnit(formula, 'g')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                            currentInput.unit === 'g'
                              ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-2xs'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Gramos (g)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateReactantUnit(formula, 'mol')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                            currentInput.unit === 'mol'
                              ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-2xs'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Moles (mol)
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results Section */}
          {stoichResult && (
            <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-500" />
                <span>Resultados Estequiométricos de la Reacción</span>
              </h3>

              {/* Limiting vs Excess summary badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Limiting Reagent Card */}
                {(() => {
                  const rl = stoichResult.reactants.find((r) => r.isLimiting);
                  if (!rl) return null;
                  return (
                    <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Reactivo Limitante (RL)
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200">
                          Se Agota al 100%
                        </span>
                      </div>

                      <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
                        {formatFormulaSubscripts(rl.formula)}
                      </div>

                      <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex justify-between">
                          <span>Cantidad inicial alimentada:</span>
                          <span className="font-mono font-bold">{rl.initialGrams} g ({rl.initialMoles} mol)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Relación molar estequiométrica (n/coef):</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {rl.stoichRatio} mol/coef (Mínimo valor)
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 border border-emerald-100 dark:border-emerald-900/40">
                        Este reactivo determina y limita la cantidad máxima teórica de productos que pueden generarse.
                      </div>
                    </div>
                  );
                })()}

                {/* Excess Reagent Card */}
                {(() => {
                  const re = stoichResult.reactants.filter((r) => r.isExcess);
                  if (re.length === 0) {
                    return (
                      <div className="p-5 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
                        Proporción estequiométrica exacta o solo un reactivo con cantidad ingresada.
                      </div>
                    );
                  }

                  return (
                    <div className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-300 dark:border-amber-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          Reactivo en Exceso (RE)
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
                          Queda Sin Reaccionar
                        </span>
                      </div>

                      {re.map((excess) => (
                        <div key={excess.formula} className="space-y-2">
                          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
                            {formatFormulaSubscripts(excess.formula)}
                          </div>

                          <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                            <div className="flex justify-between">
                              <span>Cantidad reaccionada (consumida):</span>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {excess.consumedGrams} g ({excess.consumedMoles} mol)
                              </span>
                            </div>
                            <div className="flex justify-between font-bold text-amber-700 dark:text-amber-300">
                              <span>Cantidad sobrante en el medio:</span>
                              <span className="font-mono">
                                {excess.remainingGrams} g ({excess.remainingMoles} mol)
                              </span>
                            </div>
                          </div>

                          {/* Consumption progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>Consumo: {excess.percentConsumed}%</span>
                              <span>Sobrante: {(100 - excess.percentConsumed).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-amber-200/50 dark:bg-amber-950/60 h-2 rounded-full overflow-hidden flex">
                              <div
                                className="bg-amber-600 h-full transition-all duration-300"
                                style={{ width: `${Math.min(100, excess.percentConsumed)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Theoretical Yield of Products */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-500" />
                  <span>Rendimiento Teórico Máximo de Productos (Conversión al 100%)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {stoichResult.products.map((prod) => (
                    <div
                      key={prod.formula}
                      className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">
                          {formatFormulaSubscripts(prod.formula)}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          M = {prod.molarMass} g/mol
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="text-xs text-slate-500">Masa teórica obtenida:</div>
                        <div className="text-2xl font-mono font-extrabold text-teal-600 dark:text-teal-400">
                          {prod.theoreticalGrams} g
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          {prod.theoreticalMoles} moles teóricos
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional: Experimental Yield and % Yield Calculator */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-teal-500" />
                      <span>Cálculo de Rendimiento Real y Porcentual (% de Eficiencia)</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ingresa la masa de producto recuperada experimentalmente en la práctica de laboratorio.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedProductFormula}
                      onChange={(e) => setActualYieldProduct(e.target.value)}
                      className="text-xs font-bold font-mono px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                    >
                      {stoichResult.products.map((p) => (
                        <option key={p.formula} value={p.formula}>
                          Producto: {formatFormulaSubscripts(p.formula)}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={actualYieldGrams}
                        onChange={(e) => setActualYieldGrams(e.target.value)}
                        placeholder="Masa real (g)"
                        className="w-28 px-3 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="text-xs font-bold text-slate-500">g</span>
                    </div>
                  </div>
                </div>

                {stoichResult.percentYield && (
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-teal-200 dark:border-teal-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500">Rendimiento Porcentual Calculado:</div>
                      <div className="text-2xl font-mono font-extrabold text-teal-600 dark:text-teal-400">
                        {stoichResult.percentYield.percentage}%
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {stoichResult.percentYield.comment}
                      </p>
                    </div>

                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      % = ({stoichResult.percentYield.actualGrams} g ÷{' '}
                      {
                        stoichResult.products.find(
                          (p) => p.formula === stoichResult.percentYield?.productFormula
                        )?.theoreticalGrams
                      }{' '}
                      g) × 100%
                    </div>
                  </div>
                )}
              </div>

              {/* Step-by-Step Mathematical Calculation Breakdown */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowDetailedSteps(!showDetailedSteps)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/70 hover:bg-slate-100 dark:hover:bg-slate-900 text-left transition"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Memoria de Cálculo y Pasos Detallados (Resolución Numérica)
                    </span>
                  </div>
                  {showDetailedSteps ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showDetailedSteps && (
                  <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                    {stoichResult.calculationSteps.map((step) => (
                      <div key={step.stepNumber} className="pt-3 first:pt-0 space-y-1.5">
                        <div className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-[10px]">
                            {step.stepNumber}
                          </span>
                          <span>{step.title}</span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          {step.description}
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                          {step.valuesText}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
