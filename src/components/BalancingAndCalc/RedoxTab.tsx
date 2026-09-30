import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  REDOX_PRESETS,
  RedoxReactionPreset,
  formatFormulaSubscripts,
} from '../../services/chemistryMath';

export const RedoxTab: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(REDOX_PRESETS[0].id);
  const currentPreset: RedoxReactionPreset =
    REDOX_PRESETS.find((p) => p.id === selectedPresetId) || REDOX_PRESETS[0];

  // User input oxidation states: key is "reactant_0_Cu" or "product_1_N"
  const [userStates, setUserStates] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<{
    checked: boolean;
    allCorrect: boolean;
    details: Record<string, boolean>;
  } | null>(null);

  const [showRules, setShowRules] = useState<boolean>(false);
  const [revealed, setRevealed] = useState<boolean>(false);

  // When changing reaction preset
  const handleSelectPreset = (preset: RedoxReactionPreset) => {
    setSelectedPresetId(preset.id);
    setUserStates({});
    setValidationResult(null);
    setRevealed(false);
  };

  const handleStateChange = (key: string, val: string) => {
    setUserStates((prev) => ({ ...prev, [key]: val }));
    // reset check state when user types
    if (validationResult) setValidationResult(null);
  };

  // Validate user oxidation states
  const handleValidateStates = () => {
    let allCorrect = true;
    const details: Record<string, boolean> = {};

    // Reactants
    currentPreset.reactants.forEach((r, rIdx) => {
      for (const [el, expected] of Object.entries(r.oxidationStates)) {
        const key = `r_${rIdx}_${el}`;
        const inputVal = (userStates[key] || '').replace('+', '').trim();
        const numVal = parseInt(inputVal, 10);
        const isOk = !isNaN(numVal) && numVal === expected;
        details[key] = isOk;
        if (!isOk) allCorrect = false;
      }
    });

    // Products
    currentPreset.products.forEach((p, pIdx) => {
      for (const [el, expected] of Object.entries(p.oxidationStates)) {
        const key = `p_${pIdx}_${el}`;
        const inputVal = (userStates[key] || '').replace('+', '').trim();
        const numVal = parseInt(inputVal, 10);
        const isOk = !isNaN(numVal) && numVal === expected;
        details[key] = isOk;
        if (!isOk) allCorrect = false;
      }
    });

    setValidationResult({
      checked: true,
      allCorrect,
      details,
    });
  };

  // Auto-reveal oxidation states
  const handleRevealStates = () => {
    const filled: Record<string, string> = {};
    const details: Record<string, boolean> = {};

    currentPreset.reactants.forEach((r, rIdx) => {
      for (const [el, expected] of Object.entries(r.oxidationStates)) {
        const key = `r_${rIdx}_${el}`;
        filled[key] = expected > 0 ? `+${expected}` : `${expected}`;
        details[key] = true;
      }
    });

    currentPreset.products.forEach((p, pIdx) => {
      for (const [el, expected] of Object.entries(p.oxidationStates)) {
        const key = `p_${pIdx}_${el}`;
        filled[key] = expected > 0 ? `+${expected}` : `${expected}`;
        details[key] = true;
      }
    });

    setUserStates(filled);
    setValidationResult({ checked: true, allCorrect: true, details });
    setRevealed(true);
  };

  const isSolvedOrRevealed = validationResult?.allCorrect || revealed;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
                <Zap className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Balanceo por Método Redox (Óxido-Reducción)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Ingresa los Estados de Oxidación (E.O.) de cada átomo para descubrir qué elemento se oxida, cuál se reduce y balancear el intercambio de electrones.
            </p>
          </div>

          <button
            onClick={() => setShowRules(!showRules)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition self-start md:self-auto"
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>Reglas de Asignación de E.O.</span>
            {showRules ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Rules Explanation */}
        {showRules && (
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 space-y-2 mb-4">
            <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <Info className="w-4 h-4" />
              <span>Reglas clave para determinar los Estados de Oxidación:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li><strong>Elementos libres sin combinar:</strong> Su estado de oxidación siempre es <strong>0</strong> (ej: Cu⁰, Fe⁰, Cl₂⁰, H₂⁰).</li>
              <li><strong>Hidrógeno (H):</strong> Suele actuar con <strong>+1</strong> (excepto en hidruros metálicos donde es -1).</li>
              <li><strong>Oxígeno (O):</strong> Suele actuar con <strong>-2</strong> (excepto en peróxidos como H₂O₂ donde es -1, o con flúor).</li>
              <li><strong>Metales alcalinos (Grupo 1: Na, K, Li):</strong> Siempre tienen E.O. = <strong>+1</strong> en compuestos.</li>
              <li><strong>Metales alcalinotérreos (Grupo 2: Ca, Mg, Ba):</strong> Siempre tienen E.O. = <strong>+2</strong>.</li>
              <li><strong>Suma de estados de oxidación:</strong> En una molécula neutra, la suma de los E.O. multiplicados por sus subíndices debe ser exactamente <strong>0</strong>.</li>
            </ul>
          </div>
        )}

        {/* Reaction Presets */}
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Selecciona una reacción redox para balancear:
          </label>
          <div className="flex flex-wrap gap-2">
            {REDOX_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedPresetId === preset.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{preset.title}</span>
                <span className="text-[10px] ml-1.5 opacity-75 font-normal">[{preset.medium}]</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Oxidation States Step */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Paso 1: Asignación interactiva de Estados de Oxidación</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold uppercase">
                Requerido
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Escribe el número de oxidación (ej: 0, +1, +2, +7, -2) para cada átomo en los reactivos y productos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRevealStates}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
            >
              Completar E.O.
            </button>
            <button
              onClick={handleValidateStates}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition"
            >
              Comprobar E.O.
            </button>
          </div>
        </div>

        {/* Validation Feedback Badge */}
        {validationResult?.checked && (
          <div
            className={`p-3.5 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-semibold border ${
              validationResult.allCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {validationResult.allCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              )}
              <span>
                {validationResult.allCorrect
                  ? '¡Excelente! Todos los estados de oxidación han sido asignados correctamente.'
                  : 'Hay estados de oxidación incorrectos o faltantes. Revisa las casillas en rojo o consulta las reglas.'}
              </span>
            </div>
            {!validationResult.allCorrect && (
              <button
                onClick={handleRevealStates}
                className="text-xs underline hover:text-rose-950 dark:hover:text-white"
              >
                Ver correctos
              </button>
            )}
          </div>
        )}

        {/* Compounds Grid with inputs above/below each atom */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <div className="flex items-center justify-center gap-4 sm:gap-6 min-w-max">
            {/* Reactants */}
            {currentPreset.reactants.map((reactant, rIdx) => (
              <React.Fragment key={`rx-r-${rIdx}`}>
                {rIdx > 0 && <span className="text-2xl font-bold text-slate-400">+</span>}
                <div className="flex flex-col items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-2 font-mono">
                    {formatFormulaSubscripts(reactant.formula)}
                  </div>

                  {/* Inputs for each element in this reactant */}
                  <div className="flex items-center gap-3">
                    {Object.entries(reactant.oxidationStates).map(([el, correctVal]) => {
                      const key = `r_${rIdx}_${el}`;
                      const isChecked = validationResult?.checked;
                      const isCorrect = validationResult?.details[key];

                      return (
                        <div key={key} className="flex flex-col items-center">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            {el}
                          </label>
                          <input
                            type="text"
                            placeholder="?"
                            value={userStates[key] || ''}
                            onChange={(e) => handleStateChange(key, e.target.value)}
                            className={`w-12 h-9 text-center text-sm font-bold font-mono rounded-xl border focus:outline-none transition-all ${
                              isChecked
                                ? isCorrect
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500'
                            }`}
                          />
                          {isChecked && !isCorrect && (
                            <span className="text-[10px] text-rose-600 font-bold mt-0.5">
                              {correctVal > 0 ? `+${correctVal}` : correctVal}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </React.Fragment>
            ))}

            {/* Reaction Arrow */}
            <div className="flex items-center justify-center p-2 text-amber-500">
              <ArrowRight className="w-8 h-8 stroke-[2.5]" />
            </div>

            {/* Products */}
            {currentPreset.products.map((product, pIdx) => (
              <React.Fragment key={`rx-p-${pIdx}`}>
                {pIdx > 0 && <span className="text-2xl font-bold text-slate-400">+</span>}
                <div className="flex flex-col items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-2 font-mono">
                    {formatFormulaSubscripts(product.formula)}
                  </div>

                  {/* Inputs for each element in this product */}
                  <div className="flex items-center gap-3">
                    {Object.entries(product.oxidationStates).map(([el, correctVal]) => {
                      const key = `p_${pIdx}_${el}`;
                      const isChecked = validationResult?.checked;
                      const isCorrect = validationResult?.details[key];

                      return (
                        <div key={key} className="flex flex-col items-center">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            {el}
                          </label>
                          <input
                            type="text"
                            placeholder="?"
                            value={userStates[key] || ''}
                            onChange={(e) => handleStateChange(key, e.target.value)}
                            className={`w-12 h-9 text-center text-sm font-bold font-mono rounded-xl border focus:outline-none transition-all ${
                              isChecked
                                ? isCorrect
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500'
                            }`}
                          />
                          {isChecked && !isCorrect && (
                            <span className="text-[10px] text-rose-600 font-bold mt-0.5">
                              {correctVal > 0 ? `+${correctVal}` : correctVal}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 2: Redox Analysis and Electron Transfer */}
        {isSolvedOrRevealed && (
          <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Paso 2: Análisis de Oxidación, Reducción y Semirreacciones</span>
            </h3>

            {/* Oxidation & Reduction Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Oxidation */}
              <div className="p-5 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Proceso de Oxidación
                  </span>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                    Pierde Electrones
                  </span>
                </div>

                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Elemento oxidado: <span className="font-extrabold text-rose-700 dark:text-rose-300">{currentPreset.oxidizedElement}</span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl font-mono text-sm font-bold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 text-center">
                  {currentPreset.oxidationHalfReaction}
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <strong>Agente Reductor: </strong>
                  <span className="text-slate-900 dark:text-white font-bold">{currentPreset.reducingAgent}</span>
                  <span className="text-slate-500"> (Provoca la reducción de la otra especie al ceder electrones).</span>
                </div>
              </div>

              {/* Reduction */}
              <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-2xl border border-blue-200 dark:border-blue-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Proceso de Reducción
                  </span>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    Gana Electrones
                  </span>
                </div>

                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Elemento reducido: <span className="font-extrabold text-blue-700 dark:text-blue-300">{currentPreset.reducedElement}</span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl font-mono text-sm font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 text-center">
                  {currentPreset.reductionHalfReaction}
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <strong>Agente Oxidante: </strong>
                  <span className="text-slate-900 dark:text-white font-bold">{currentPreset.oxidizingAgent}</span>
                  <span className="text-slate-500"> (Provoca la oxidación al capturar electrones).</span>
                </div>
              </div>
            </div>

            {/* Electron Balancing Multipliers */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Paso 3: Balance de Cargas e Intercambio Electrónico
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400 font-semibold">Factor Semirreacción Ox.</div>
                  <div className="text-lg font-mono font-bold text-rose-600">× {currentPreset.multiplierOx}</div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400 font-semibold">Factor Semirreacción Red.</div>
                  <div className="text-lg font-mono font-bold text-blue-600">× {currentPreset.multiplierRed}</div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-400 font-semibold">Electrones Transferidos</div>
                  <div className="text-lg font-mono font-bold text-amber-600">{currentPreset.electronsTransferred} e⁻</div>
                </div>
              </div>

              {/* Justification of Rules */}
              <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-200">Justificación paso a paso del balance:</div>
                {currentPreset.rulesExplanation.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Balanced Equation */}
            <div className="p-6 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl border border-amber-300 dark:border-amber-800/80 text-center space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Ecuación Molecular Balanceada Final
              </div>
              <div className="text-lg sm:text-xl font-mono font-extrabold text-slate-900 dark:text-white">
                {currentPreset.balancedEquation}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Se completó el ajuste de átomos de hidrógeno, oxígeno e iones espectadores mediante inspección sistemática.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
