import React, { useState, useEffect } from 'react';
import { SOLUTES, calculateSolution, SolutionState, SoluteData } from '../../services/solutionsEngine';
import { SolutionsBeaker3D } from './SolutionsBeaker3D';
import {
  FlaskConical,
  Droplet,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Info,
  Thermometer,
  Calculator,
  Layers,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SolutionsLab: React.FC = () => {
  const [state, setState] = useState<SolutionState>({
    soluteId: 'nacl',
    volumeMl: 500, // Default 500 mL water
    addedSoluteGrams: 50, // Default 50 g
    temperatureC: 20, // Default 20°C
  });

  const [isPouringWater, setIsPouringWater] = useState<boolean>(false);
  const [isDispensingSolute, setIsDispensingSolute] = useState<boolean>(false);
  const [isStirring, setIsStirring] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'math' | 'microscopic'>('controls');

  const calculation = calculateSolution(state);
  const currentSolute: SoluteData = SOLUTES[state.soluteId] || SOLUTES.nacl;

  // Handler for adding water smoothly or stepped
  const handleAddWater = (deltaMl: number) => {
    setIsPouringWater(true);
    setTimeout(() => setIsPouringWater(false), 900);
    setState((prev) => ({
      ...prev,
      volumeMl: Math.max(0, Math.min(1000, prev.volumeMl + deltaMl)),
    }));
  };

  // Handler for adding solute with visual sprinkle effect
  const handleAddSolute = (deltaGrams: number) => {
    setIsDispensingSolute(true);
    setTimeout(() => setIsDispensingSolute(false), 900);
    setState((prev) => ({
      ...prev,
      addedSoluteGrams: Math.max(0, Math.min(500, prev.addedSoluteGrams + deltaGrams)),
    }));
  };

  // Reset to initial clean beaker
  const handleReset = () => {
    setState({
      soluteId: state.soluteId,
      volumeMl: 500,
      addedSoluteGrams: 0,
      temperatureC: 20,
    });
    setIsStirring(false);
  };

  // Saturate beaker automatically with exact limit
  const handleSaturateExact = () => {
    handleAddSolute(calculation.maxSolubleMassGrams - state.addedSoluteGrams);
  };

  // Supersaturate with precipitate
  const handleSupersaturate = () => {
    const target = calculation.maxSolubleMassGrams + 40;
    setState((prev) => ({ ...prev, addedSoluteGrams: Math.min(500, Math.round(target)) }));
    setIsDispensingSolute(true);
    setTimeout(() => setIsDispensingSolute(false), 900);
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Laboratorio 3D: Formación de Soluciones
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                  Simulador 3D
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Experimenta con solvente (agua) y diferentes solutos. Observa la disolución, el cálculo dinámico de Molaridad y la formación de precipitado al alcanzar la saturación.
              </p>
            </div>
          </div>

          {/* Quick preset action buttons */}
          <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
            <button
              onClick={handleSaturateExact}
              className="flex-1 md:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 transition-all flex items-center justify-center gap-1.5"
              title="Llevar la solución al punto de saturación exacto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Saturar Solución</span>
            </button>
            <button
              onClick={handleSupersaturate}
              className="flex-1 md:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition-all flex items-center justify-center gap-1.5"
              title="Superar el límite para formar precipitado en el fondo"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Crear Precipitado</span>
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all"
              title="Limpiar vaso y reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Solute Selector Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
            Selecciona el Soluto a Disolver:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {Object.values(SOLUTES).map((sol) => {
              const isSelected = state.soluteId === sol.id;
              return (
                <button
                  key={sol.id}
                  onClick={() => setState((prev) => ({ ...prev, soluteId: sol.id }))}
                  className={`p-3 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/40 shadow-sm ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{sol.formula}</span>
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs"
                      style={{ backgroundColor: sol.colorAtSaturation }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                    {sol.name}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                    MM: {sol.molarMass.toFixed(1)} g/mol
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Workspace Grid: 3D Beaker on Left, Metrology & Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Beaker Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <SolutionsBeaker3D
            calculation={calculation}
            solute={currentSolute}
            isPouringWater={isPouringWater}
            isDispensingSolute={isDispensingSolute}
            isStirring={isStirring}
            onToggleStirring={() => setIsStirring(!isStirring)}
          />

          {/* Quick Metrology Cards Under Beaker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Molarity (M) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                Molaridad (M)
              </span>
              <div className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
                {calculation.molarity.toFixed(3)}{' '}
                <span className="text-xs font-semibold text-slate-500">M</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                mol / L solución
              </span>
            </div>

            {/* Concentration (g/L) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                Concentración
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {calculation.massVolumeConcentrationGL.toFixed(1)}{' '}
                <span className="text-xs font-semibold text-slate-500">g/L</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                {calculation.massVolumePercentage.toFixed(2)} % m/v
              </span>
            </div>

            {/* Dissolved Solute */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                Soluto Disuelto
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {calculation.dissolvedMassGrams.toFixed(1)}{' '}
                <span className="text-xs font-semibold text-slate-500">g</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                {calculation.dissolvedMoles.toFixed(3)} moles
              </span>
            </div>

            {/* Precipitate Solute */}
            <div
              className={`rounded-2xl p-3.5 shadow-2xs border transition-all ${
                calculation.precipitatedMassGrams > 0.05
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                Precipitado Fondo
              </span>
              <div
                className={`text-xl sm:text-2xl font-black mt-0.5 ${
                  calculation.precipitatedMassGrams > 0.05
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {calculation.precipitatedMassGrams.toFixed(1)}{' '}
                <span className="text-xs font-semibold text-slate-500">g</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                {calculation.precipitatedMassGrams > 0.05 ? 'Sólido visible' : 'Sin precipitar'}
              </span>
            </div>
          </div>

          {/* Saturation Progress Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Nivel de Saturación ({calculation.saturationPercentage.toFixed(1)}%)</span>
              </span>
              <span className="font-mono text-slate-500">
                Máx: {calculation.maxSolubleMassGrams.toFixed(1)} g en {state.volumeMl} mL
              </span>
            </div>

            {/* Bar */}
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  calculation.saturationPercentage > 100
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                    : calculation.saturationPercentage >= 80
                    ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                }`}
                style={{ width: `${Math.min(100, calculation.saturationPercentage)}%` }}
              />
              {/* 100% Saturation marker tick */}
              <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-rose-500 shadow-xs" />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-semibold">
              <span>0% (Puro H₂O)</span>
              <span>50% (Concentrada)</span>
              <span className="text-rose-500 font-bold">100% (Punto de Saturación)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Controls & Analysis (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Sub Navigation (Controls / Math Breakdown / Microscopic) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'controls'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>Controles</span>
            </button>
            <button
              onClick={() => setActiveTab('math')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'math'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Cálculos</span>
            </button>
            <button
              onClick={() => setActiveTab('microscopic')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'microscopic'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Iones</span>
            </button>
          </div>

          {/* TAB 1: Controls Panel */}
          {activeTab === 'controls' && (
            <div className="space-y-4">
              {/* Solvent (Water) Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Solvente: Agua (H₂O)
                      </h2>
                      <span className="text-[11px] text-slate-500">Volumen en el vaso</span>
                    </div>
                  </div>
                  <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">
                    {state.volumeMl} mL
                  </span>
                </div>

                {/* Water Volume Slider */}
                <div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={state.volumeMl}
                    onChange={(e) => {
                      setIsPouringWater(true);
                      setTimeout(() => setIsPouringWater(false), 600);
                      setState((prev) => ({ ...prev, volumeMl: parseInt(e.target.value, 10) }));
                    }}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>0 mL (Vacío)</span>
                    <span>500 mL</span>
                    <span>1000 mL (Lleno)</span>
                  </div>
                </div>

                {/* Quick Water Action Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <button
                    onClick={() => handleAddWater(50)}
                    className="flex-1 py-1.5 px-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition-all"
                  >
                    +50 mL
                  </button>
                  <button
                    onClick={() => handleAddWater(100)}
                    className="flex-1 py-1.5 px-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition-all"
                  >
                    +100 mL
                  </button>
                  <button
                    onClick={() => handleAddWater(-50)}
                    disabled={state.volumeMl <= 0}
                    className="flex-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                    title="Evaporar o retirar agua"
                  >
                    -50 mL
                  </button>
                  <button
                    onClick={() => setState((prev) => ({ ...prev, volumeMl: 0 }))}
                    className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all"
                    title="Drenar completamente"
                  >
                    Vaciar
                  </button>
                </div>
              </div>

              {/* Solute (Mass) Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: currentSolute.colorAtSaturation }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Soluto: {currentSolute.formula}
                      </h2>
                      <span className="text-[11px] text-slate-500">Masa total agregada</span>
                    </div>
                  </div>
                  <span className="text-base font-black text-cyan-600 dark:text-cyan-400 font-mono">
                    {state.addedSoluteGrams} g
                  </span>
                </div>

                {/* Solute Mass Slider */}
                <div>
                  <input
                    type="range"
                    min="0"
                    max="400"
                    step="1"
                    value={state.addedSoluteGrams}
                    onChange={(e) => {
                      setIsDispensingSolute(true);
                      setTimeout(() => setIsDispensingSolute(false), 500);
                      setState((prev) => ({ ...prev, addedSoluteGrams: parseFloat(e.target.value) }));
                    }}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>0 g</span>
                    <span>200 g</span>
                    <span>400 g</span>
                  </div>
                </div>

                {/* Quick Solute Buttons & Dispenser */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <button
                    onClick={() => handleAddSolute(5)}
                    className="flex-1 py-1.5 px-2 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 rounded-xl text-xs font-bold transition-all"
                  >
                    +5 g
                  </button>
                  <button
                    onClick={() => handleAddSolute(15)}
                    className="flex-1 py-1.5 px-2 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 rounded-xl text-xs font-bold transition-all"
                  >
                    🥄 +15 g
                  </button>
                  <button
                    onClick={() => handleAddSolute(50)}
                    className="flex-1 py-1.5 px-2 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 rounded-xl text-xs font-bold transition-all"
                  >
                    +50 g
                  </button>
                  <button
                    onClick={() => setState((prev) => ({ ...prev, addedSoluteGrams: 0 }))}
                    className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all"
                    title="Remover todo el soluto"
                  >
                    0 g
                  </button>
                </div>
              </div>

              {/* Temperature Control Card (Impact on Solubility) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Temperatura de la Solución
                      </h2>
                      <span className="text-[11px] text-slate-500">
                        Modifica la curva de solubilidad
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                    {state.temperatureC} °C
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={state.temperatureC}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, temperatureC: parseInt(e.target.value, 10) }))
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />

                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <span>❄️ 0°C (Fría)</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Solubilidad: {calculation.solubilityG100ml.toFixed(1)} g / 100 mL
                  </span>
                  <span>🔥 100°C (Ebullición)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Mathematical Step-by-Step Breakdown */}
          {activeTab === 'math' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Calculator className="w-5 h-5 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Desglose Matemático y Estequiométrico
                </h2>
              </div>

              {/* Step 1: Volume conversion */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                  Paso 1: Conversión de Volumen a Litros
                </span>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-200">
                  V = {state.volumeMl} mL ÷ 1000 ={' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {calculation.volumeL.toFixed(3)} L
                  </span>
                </p>
              </div>

              {/* Step 2: Solubility Limit check */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                  Paso 2: Límite de Solubilidad a {state.temperatureC}°C
                </span>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-200 leading-relaxed">
                  m<sub>máx</sub> = ({calculation.solubilityG100ml.toFixed(1)} g / 100 mL) × {state.volumeMl} mL
                  = <span className="font-bold">{calculation.maxSolubleMassGrams.toFixed(2)} g</span>
                </p>
                <div className="text-[11px] text-slate-500 mt-1">
                  Masa disuelta = <strong>{calculation.dissolvedMassGrams.toFixed(2)} g</strong> |
                  Precipitado = <strong className="text-rose-500">{calculation.precipitatedMassGrams.toFixed(2)} g</strong>
                </div>
              </div>

              {/* Step 3: Moles calculation */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                  Paso 3: Cálculo de Moles de Soluto Disuelto (n)
                </span>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-200 leading-relaxed">
                  n = m<sub>disuelta</sub> ÷ Masa Molar (MM)
                  <br />
                  n = {calculation.dissolvedMassGrams.toFixed(2)} g ÷ {currentSolute.molarMass.toFixed(2)} g/mol
                  = <span className="font-bold text-purple-600 dark:text-purple-400">{calculation.dissolvedMoles.toFixed(4)} mol</span>
                </p>
              </div>

              {/* Step 4: Molarity equation */}
              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                  Paso 4: Molaridad de la Disolución (M)
                </span>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl font-mono text-xs text-center border border-purple-100 dark:border-purple-900">
                  M = n ÷ V(L) = {calculation.dissolvedMoles.toFixed(4)} mol ÷ {calculation.volumeL.toFixed(3)} L
                  <div className="text-base font-black text-purple-600 dark:text-purple-400 mt-1">
                    M = {calculation.molarity.toFixed(4)} M (mol/L)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Microscopic / Chemical Nature */}
          {activeTab === 'microscopic' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Visión Submicroscópica: {currentSolute.name}
                </h2>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentSolute.description}
              </p>

              {/* Dissociation Equation */}
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block mb-1">
                  Ecuación de Disolución / Disociación:
                </span>
                <p className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-100">
                  {currentSolute.ionsDescription}
                </p>
              </div>

              {/* Particle Legend in 3D View */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Partículas en suspensión (Simulación 3D):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: currentSolute.cation.color }}
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {currentSolute.cation.symbol}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Carga: {currentSolute.cation.charge}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: currentSolute.anion.color }}
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {currentSolute.anion.symbol}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Carga: {currentSolute.anion.charge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <p>
                  <strong>Equilibrio de Solubilidad:</strong> Cuando la solución llega a saturación, la velocidad de disolución iguala la velocidad de precipitación/cristalización.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
