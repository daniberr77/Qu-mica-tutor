import React, { useState, useEffect } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Wand2,
  ArrowRight,
  Plus,
  Minus,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  formatFormulaSubscripts,
  parseEquation,
  verifyBalance,
  balanceAlgebraic,
} from '../../services/chemistryMath';

interface TanteoPreset {
  id: string;
  name: string;
  category: string;
  equation: string;
}

const TANTEO_PRESETS: TanteoPreset[] = [
  {
    id: 'propano',
    name: 'Combustión de Propano',
    category: 'Combustión',
    equation: 'C3H8 + O2 -> CO2 + H2O',
  },
  {
    id: 'amoniaco',
    name: 'Síntesis de Amoníaco',
    category: 'Síntesis',
    equation: 'N2 + H2 -> NH3',
  },
  {
    id: 'al-hcl',
    name: 'Aluminio y Ácido Clorhídrico',
    category: 'Desplazamiento',
    equation: 'Al + HCl -> AlCl3 + H2',
  },
  {
    id: 'kclo3',
    name: 'Descomposición de Clorato',
    category: 'Descomposición',
    equation: 'KClO3 -> KCl + O2',
  },
  {
    id: 'fe2o3-co',
    name: 'Reducción de Óxido de Hierro',
    category: 'Metalurgia',
    equation: 'Fe2O3 + CO -> Fe + CO2',
  },
  {
    id: 'ca-h3po4',
    name: 'Neutralización Ácido-Base',
    category: 'Neutralización',
    equation: 'Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O',
  },
];

export const TanteoTab: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('propano');
  const [equationInput, setEquationInput] = useState<string>('C3H8 + O2 -> CO2 + H2O');
  const [customError, setCustomError] = useState<string | null>(null);

  // Parsed species state
  const [reactants, setReactants] = useState<{ formula: string; coeff: number }[]>([
    { formula: 'C3H8', coeff: 1 },
    { formula: 'O2', coeff: 1 },
  ]);
  const [products, setProducts] = useState<{ formula: string; coeff: number }[]>([
    { formula: 'CO2', coeff: 1 },
    { formula: 'H2O', coeff: 1 },
  ]);

  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);

  // Load equation when preset changes or when user confirms custom equation
  const loadEquation = (eqStr: string) => {
    const parsed = parseEquation(eqStr);
    if (!parsed) {
      setCustomError('Formato de ecuación inválido. Usa formato como: A + B -> C + D');
      return;
    }
    setCustomError(null);
    setReactants(parsed.reactants.map((r) => ({ formula: r.formula, coeff: 1 })));
    setProducts(parsed.products.map((p) => ({ formula: p.formula, coeff: 1 })));
    setHasCelebrated(false);
  };

  const handlePresetSelect = (preset: TanteoPreset) => {
    setSelectedPresetId(preset.id);
    setEquationInput(preset.equation);
    loadEquation(preset.equation);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedPresetId('custom');
    loadEquation(equationInput);
  };

  // Change coefficients
  const updateReactantCoeff = (index: number, delta: number) => {
    setReactants((prev) => {
      const next = [...prev];
      const val = Math.max(1, Math.min(30, next[index].coeff + delta));
      next[index] = { ...next[index], coeff: val };
      return next;
    });
  };

  const setReactantCoeffDirect = (index: number, val: number) => {
    setReactants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], coeff: Math.max(1, Math.min(30, val || 1)) };
      return next;
    });
  };

  const updateProductCoeff = (index: number, delta: number) => {
    setProducts((prev) => {
      const next = [...prev];
      const val = Math.max(1, Math.min(30, next[index].coeff + delta));
      next[index] = { ...next[index], coeff: val };
      return next;
    });
  };

  const setProductCoeffDirect = (index: number, val: number) => {
    setProducts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], coeff: Math.max(1, Math.min(30, val || 1)) };
      return next;
    });
  };

  // Reset to 1
  const resetCoeffs = () => {
    setReactants((prev) => prev.map((r) => ({ ...r, coeff: 1 })));
    setProducts((prev) => prev.map((p) => ({ ...p, coeff: 1 })));
    setHasCelebrated(false);
  };

  // Auto-solve with code (mathematical algebraic solver)
  const handleAutoSolve = () => {
    const rawEq = `${reactants.map((r) => r.formula).join(' + ')} -> ${products.map((p) => p.formula).join(' + ')}`;
    const solution = balanceAlgebraic(rawEq);
    if (solution) {
      setReactants(solution.reactants.map((f, i) => ({ formula: f, coeff: solution.reactantCoeffs[i] })));
      setProducts(solution.products.map((f, i) => ({ formula: f, coeff: solution.productCoeffs[i] })));
    }
  };

  // Verification
  const verification = verifyBalance(reactants, products);

  // Celebration trigger
  useEffect(() => {
    if (verification.isBalanced && !hasCelebrated) {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.65 },
      });
      setHasCelebrated(true);
    } else if (!verification.isBalanced) {
      setHasCelebrated(false);
    }
  }, [verification.isBalanced, hasCelebrated]);

  // Strategy hint calculation
  const getStrategicHint = () => {
    if (verification.isBalanced) {
      return {
        text: '¡Excelente! Todos los átomos en reactivos y productos cumplen rigurosamente la Ley de Conservación de la Masa.',
        type: 'success',
      };
    }

    // Check metals/non-metals first
    const unbalanced = verification.elements.filter((e) => !e.balanced);
    if (unbalanced.length === 0) return null;

    // Check if there is an element not H or O
    const nonHO = unbalanced.find((e) => e.symbol !== 'H' && e.symbol !== 'O');
    if (nonHO) {
      const side = nonHO.difference > 0 ? 'reactivos (izquierda)' : 'productos (derecha)';
      return {
        text: `Regla de tanteo: Ajusta primero elementos distintos de H y O. En este momento el elemento ${nonHO.name} (${nonHO.symbol}) tiene ${nonHO.reactantCount} en reactivos y ${nonHO.productCount} en productos. Aumenta coeficientes en los ${side}.`,
        type: 'tip',
      };
    }

    const unbH = unbalanced.find((e) => e.symbol === 'H');
    if (unbH) {
      const side = unbH.difference > 0 ? 'reactivos' : 'productos';
      return {
        text: `Regla de tanteo: Una vez equilibrados los demás átomos, balancea los Hidrógenos (H). Actualmente hay ${unbH.reactantCount} en reactivos y ${unbH.productCount} en productos. Incrementa el coeficiente en los ${side}.`,
        type: 'tip',
      };
    }

    const unbO = unbalanced.find((e) => e.symbol === 'O');
    if (unbO) {
      const side = unbO.difference > 0 ? 'reactivos' : 'productos';
      return {
        text: `Regla de tanteo: El Oxígeno (O) suele ser el último en ajustarse. Tienes ${unbO.reactantCount} átomos de O en reactivos y ${unbO.productCount} en productos. Ajusta coeficientes en ${side}.`,
        type: 'tip',
      };
    }

    return null;
  };

  const hint = getStrategicHint();

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Scale className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Balanceo por Tanteo (Ensayo y Error)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Modifica interactivamente los coeficientes estequiométricos enteros y observa la conservación atómica en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={resetCoeffs}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
              title="Reiniciar todos los coeficientes a 1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar a 1</span>
            </button>
            <button
              onClick={handleAutoSolve}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition"
              title="Resolver con el algoritmo estequiométrico exacto"
            >
              <Wand2 className="w-4 h-4" />
              <span>Auto-Resolver</span>
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Reacciones de práctica recomendadas:
          </label>
          <div className="flex flex-wrap gap-2">
            {TANTEO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedPresetId === preset.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{preset.name}</span>
                <span className="text-[10px] ml-1.5 opacity-75 font-normal">({preset.category})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Equation Input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={equationInput}
              onChange={(e) => setEquationInput(e.target.value)}
              placeholder="Escribe tu propia ecuación, ej: Fe + O2 -> Fe2O3 o CH4 + O2 -> CO2 + H2O"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 font-semibold text-xs rounded-xl shadow-xs transition"
          >
            Cargar Ecuación
          </button>
        </form>
        {customError && <p className="text-xs text-rose-500 font-medium mt-1.5">{customError}</p>}
      </div>

      {/* Interactive Visual Equation Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Status Banner */}
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
            verification.isBalanced
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {verification.isBalanced ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 animate-bounce" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            )}
            <div>
              <div className="text-sm font-extrabold">
                {verification.isBalanced ? '¡Ecuación Balanceada con Éxito!' : 'Ecuación Desbalanceada'}
              </div>
              <div className="text-xs opacity-90">
                {verification.isBalanced
                  ? 'Hay exactamente el mismo número de átomos de cada elemento a ambos lados.'
                  : 'Ajusta los coeficientes estequiométricos de los reactivos o productos.'}
              </div>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold uppercase tracking-wider opacity-75">Total Átomos</div>
            <div className="text-sm font-mono font-bold">
              {verification.reactantAtomsTotal} R ⇄ {verification.productAtomsTotal} P
            </div>
          </div>
        </div>

        {/* Stepper Equation Builder */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
            Ajuste directo de coeficientes
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* Reactants */}
            {reactants.map((reactant, idx) => (
              <React.Fragment key={`r-${reactant.formula}-${idx}`}>
                {idx > 0 && <span className="text-2xl font-bold text-slate-400">+</span>}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  {/* Stepper buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => updateReactantCoeff(idx, 1)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 rounded transition"
                      title="Aumentar coeficiente"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateReactantCoeff(idx, -1)}
                      disabled={reactant.coeff <= 1}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 disabled:opacity-30 rounded transition"
                      title="Disminuir coeficiente"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Input value */}
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={reactant.coeff}
                    onChange={(e) => setReactantCoeffDirect(idx, parseInt(e.target.value, 10))}
                    className="w-12 text-center text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl py-1 border border-emerald-300 dark:border-emerald-800 focus:outline-none"
                  />

                  {/* Chemical Formula */}
                  <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white px-1">
                    {formatFormulaSubscripts(reactant.formula)}
                  </div>
                </div>
              </React.Fragment>
            ))}

            {/* Reaction Arrow */}
            <div className="flex items-center justify-center p-2 text-slate-400">
              <ArrowRight className="w-6 h-6 stroke-[2.5]" />
            </div>

            {/* Products */}
            {products.map((product, idx) => (
              <React.Fragment key={`p-${product.formula}-${idx}`}>
                {idx > 0 && <span className="text-2xl font-bold text-slate-400">+</span>}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  {/* Stepper buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => updateProductCoeff(idx, 1)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 rounded transition"
                      title="Aumentar coeficiente"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateProductCoeff(idx, -1)}
                      disabled={product.coeff <= 1}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 disabled:opacity-30 rounded transition"
                      title="Disminuir coeficiente"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Input value */}
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={product.coeff}
                    onChange={(e) => setProductCoeffDirect(idx, parseInt(e.target.value, 10))}
                    className="w-12 text-center text-lg font-bold font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 rounded-xl py-1 border border-teal-300 dark:border-teal-800 focus:outline-none"
                  />

                  {/* Chemical Formula */}
                  <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white px-1">
                    {formatFormulaSubscripts(product.formula)}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Atom Balance Table (Conservation Monitor) */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span>Inventario de Átomos por Elemento</span>
            <span className="text-xs text-slate-400 font-normal">
              (Ley de conservación de la materia)
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {verification.elements.map((el) => {
              const isOk = el.balanced;
              return (
                <div
                  key={el.symbol}
                  className={`p-4 rounded-2xl border transition-all ${
                    isOk
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80'
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 shadow-2xs flex items-center justify-center font-bold font-mono text-sm text-slate-800 dark:text-slate-100">
                        {el.symbol}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {el.name}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOk
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {isOk ? 'Balanceado ✓' : `Diferencia: ${Math.abs(el.difference)}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono font-bold mt-2">
                    <div className="text-slate-600 dark:text-slate-400">
                      Reactivos:{' '}
                      <span className={isOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}>
                        {el.reactantCount}
                      </span>
                    </div>
                    <div className="text-slate-400 font-sans font-normal">vs</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Productos:{' '}
                      <span className={isOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}>
                        {el.productCount}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar comparison */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2.5 flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOk ? 'bg-emerald-500 w-full' : 'bg-rose-500'
                      }`}
                      style={{
                        width: isOk
                          ? '100%'
                          : `${Math.min(
                              100,
                              Math.max(
                                10,
                                (Math.min(el.reactantCount, el.productCount) /
                                  Math.max(el.reactantCount, el.productCount, 1)) *
                                  100
                              )
                            )}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strategic Guidance Box */}
        {hint && (
          <div
            className={`p-4 rounded-2xl flex items-start gap-3 border ${
              hint.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
            }`}
          >
            <Lightbulb className="w-5 h-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold">Estrategia Pedagógica de Tanteo: </span>
              <span>{hint.text}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
