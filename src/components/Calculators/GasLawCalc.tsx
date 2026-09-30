import React, { useState, Suspense, lazy } from 'react';
import { Wind, Zap, Box, Calculator } from 'lucide-react';
import { Loading3DFallback } from '../VirtualLab/Loading3DFallback';

const GasKinetics3D = lazy(() => import('../VirtualLab/simulators/GasKinetics3D'));

export const GasLawCalc: React.FC = () => {
  const [viewMode, setViewMode] = useState<'3d' | 'calc'>('3d');

  // Solver mode: which variable is computed
  const [solveFor, setSolveFor] = useState<'P' | 'V' | 'n' | 'T'>('V');

  // Input states
  const [pressure, setPressure] = useState<number>(1.0); // atm
  const [volume, setVolume] = useState<number>(22.414); // L
  const [moles, setMoles] = useState<number>(1.0); // mol
  const [tempC, setTempC] = useState<number>(0.0); // Celsius

  const R = 0.082057; // (atm * L) / (mol * K)
  const tempK = tempC + 273.15;

  // Compute calculated variable
  let computedP = pressure;
  let computedV = volume;
  let computedN = moles;
  let computedT = tempK;

  if (solveFor === 'P') {
    computedP = volume > 0 ? (moles * R * tempK) / volume : 0;
  } else if (solveFor === 'V') {
    computedV = pressure > 0 ? (moles * R * tempK) / pressure : 0;
  } else if (solveFor === 'n') {
    computedN = tempK > 0 ? (pressure * volume) / (R * tempK) : 0;
  } else if (solveFor === 'T') {
    computedT = moles > 0 ? (pressure * volume) / (moles * R) : 0;
  }

  // Set CNPT conditions: 1 atm, 0 °C (273.15 K), 1 mol => 22.414 L
  const setCNPT = () => {
    setPressure(1.0);
    setMoles(1.0);
    setTempC(0.0);
    setVolume(22.414);
    setSolveFor('V');
  };

  return (
    <div className="space-y-6">
      {/* Selector de modo: Vista 3D Three.js vs Calculadora Numérica */}
      <div className="flex items-center justify-between gap-4 p-2 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              viewMode === '3d'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>Laboratorio 3D Interactivo (Three.js)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">3D</span>
          </button>

          <button
            onClick={() => setViewMode('calc')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              viewMode === 'calc'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Calculadora Paso a Paso</span>
          </button>
        </div>

        <button
          onClick={setCNPT}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" />
          Restablecer a CNPT (1 atm, 0 °C, 22.4 L)
        </button>
      </div>

      {viewMode === '3d' ? (
        <Suspense
          fallback={
            <Loading3DFallback
              title="Cargando Laboratorio 3D de Gases..."
              message="Inicializando motor de renderizado Three.js y física de partículas."
            />
          }
        >
          <GasKinetics3D />
        </Suspense>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 rounded-xl">
                <Wind className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Simulador Numérico de Gases Ideales (PV = nRT)
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Calcula y visualiza la relación entre presión, volumen, cantidad y temperatura
                </p>
              </div>
            </div>
          </div>

          {/* Selector: Qué variable despejar */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Variable a calcular (Incógnita)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'P', label: 'Presión (P)', unit: 'atm' },
                { id: 'V', label: 'Volumen (V)', unit: 'Litros' },
                { id: 'n', label: 'Moles (n)', unit: 'mol' },
                { id: 'T', label: 'Temperatura (T)', unit: 'Kelvin / °C' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSolveFor(tab.id as any)}
                  className={`p-3 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                    solveFor === tab.id
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-sm">{tab.label}</div>
                  <div className={`text-xs ${solveFor === tab.id ? 'text-cyan-100' : 'text-slate-400'}`}>
                    {tab.unit}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Input controls & Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              {/* Pressure */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  solveFor === 'P'
                    ? 'bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-300 dark:border-cyan-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Presión (P){' '}
                    {solveFor === 'P' && (
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">[Resultado]</span>
                    )}
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {(solveFor === 'P' ? computedP : pressure).toFixed(3)} atm
                  </span>
                </div>
                {solveFor !== 'P' ? (
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.05"
                    value={pressure}
                    onChange={(e) => setPressure(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                ) : (
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 font-mono mt-1">
                    Calculado: P = (n · R · T) / V
                  </div>
                )}
              </div>

              {/* Volume */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  solveFor === 'V'
                    ? 'bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-300 dark:border-cyan-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Volumen (V){' '}
                    {solveFor === 'V' && (
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">[Resultado]</span>
                    )}
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {(solveFor === 'V' ? computedV : volume).toFixed(3)} L
                  </span>
                </div>
                {solveFor !== 'V' ? (
                  <input
                    type="range"
                    min="0.5"
                    max="100"
                    step="0.5"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                ) : (
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 font-mono mt-1">
                    Calculado: V = (n · R · T) / P
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Moles */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  solveFor === 'n'
                    ? 'bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-300 dark:border-cyan-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Cantidad de sustancia (n){' '}
                    {solveFor === 'n' && (
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">[Resultado]</span>
                    )}
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {(solveFor === 'n' ? computedN : moles).toFixed(3)} mol
                  </span>
                </div>
                {solveFor !== 'n' ? (
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={moles}
                    onChange={(e) => setMoles(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                ) : (
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 font-mono mt-1">
                    Calculado: n = (P · V) / (R · T)
                  </div>
                )}
              </div>

              {/* Temperature */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  solveFor === 'T'
                    ? 'bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-300 dark:border-cyan-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Temperatura (T){' '}
                    {solveFor === 'T' && (
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">[Resultado]</span>
                    )}
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {solveFor === 'T' ? (computedT - 273.15).toFixed(1) : tempC.toFixed(1)} °C /{' '}
                    <span className="text-cyan-600 dark:text-cyan-400">
                      {(solveFor === 'T' ? computedT : tempK).toFixed(2)} K
                    </span>
                  </span>
                </div>
                {solveFor !== 'T' ? (
                  <input
                    type="range"
                    min="-100"
                    max="500"
                    step="5"
                    value={tempC}
                    onChange={(e) => setTempC(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                ) : (
                  <div className="text-xs text-cyan-600 dark:text-cyan-400 font-mono mt-1">
                    Calculado: T = (P · V) / (n · R)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GasLawCalc;
