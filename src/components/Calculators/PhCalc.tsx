import React, { useState } from 'react';
import { Droplet, Info } from 'lucide-react';

interface SubstanceBenchmark {
  ph: number;
  name: string;
  category: string;
}

const BENCHMARKS: SubstanceBenchmark[] = [
  { ph: 0.0, name: 'Ácido de batería / HCl 1M', category: 'Fuertemente Ácido' },
  { ph: 2.0, name: 'Jugo gástrico / Jugo de limón', category: 'Ácido' },
  { ph: 3.0, name: 'Vinagre (ácido acético)', category: 'Ácido' },
  { ph: 5.0, name: 'Café negro / Lluvia ácida', category: 'Ligeramente Ácido' },
  { ph: 6.5, name: 'Leche de vaca', category: 'Débilmente Ácido' },
  { ph: 7.0, name: 'Agua destilada pura', category: 'Neutro' },
  { ph: 7.4, name: 'Sangre humana fisiológica', category: 'Ligeramente Básico' },
  { ph: 8.5, name: 'Bicarbonato de sodio', category: 'Básico' },
  { ph: 10.5, name: 'Leche de magnesia (Mg(OH)₂)', category: 'Básico' },
  { ph: 11.5, name: 'Amoníaco de limpieza', category: 'Básico' },
  { ph: 13.0, name: 'Lejía doméstica (hipoclorito)', category: 'Fuertemente Básico' },
  { ph: 14.0, name: 'Sosa cáustica (NaOH 1M)', category: 'Fuertemente Básico' },
];

export const PhCalc: React.FC = () => {
  const [ph, setPh] = useState<number>(7.0);

  const poh = Math.max(0, Math.min(14, 14 - ph));
  const hConcentration = Math.pow(10, -ph);
  const ohConcentration = Math.pow(10, -poh);

  // Get indicator color matching standard universal pH paper
  const getPhColor = (val: number): string => {
    if (val < 2) return '#ef4444'; // Red
    if (val < 4) return '#f97316'; // Orange
    if (val < 6) return '#eab308'; // Yellow
    if (val <= 7.5) return '#22c55e'; // Green (Neutral)
    if (val < 9) return '#06b6d4'; // Cyan
    if (val < 11) return '#3b82f6'; // Blue
    return '#8b5cf6'; // Violet / Purple
  };

  const currentColor = getPhColor(ph);

  const getClassification = (val: number) => {
    if (val < 6.8) return { label: 'Disolución Ácida ([H⁺] > [OH⁻])', textClass: 'text-rose-600 dark:text-rose-400' };
    if (val > 7.2) return { label: 'Disolución Básica / Alcalina ([OH⁻] > [H⁺])', textClass: 'text-blue-600 dark:text-blue-400' };
    return { label: 'Disolución Neutra ([H⁺] = [OH⁻])', textClass: 'text-emerald-600 dark:text-emerald-400' };
  };

  const status = getClassification(ph);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
          <Droplet className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Calculadora y Escala de pH / pOH</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Determina acidez y basicidad, concentraciones molares [H⁺] y [OH⁻]</p>
        </div>
      </div>

      {/* Main pH Visual Dial & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden bg-slate-50 dark:bg-slate-800/40">
          <div
            className="w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg transition-colors duration-300 text-white font-mono mb-3"
            style={{ backgroundColor: currentColor }}
          >
            <span className="text-xs uppercase font-sans font-bold tracking-widest opacity-90">pH</span>
            <span className="text-3xl font-extrabold">{ph.toFixed(2)}</span>
          </div>

          <span className={`text-xs font-bold ${status.textClass} tracking-wide`}>
            {status.label}
          </span>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center space-y-4 bg-slate-50 dark:bg-slate-800/40">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">pOH (Potencial Hidroxilo)</span>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {poh.toFixed(2)}
            </div>
            <span className="text-xs text-slate-500">pH + pOH = 14.00</span>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Concentración de [H⁺]</span>
            <div className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
              {hConcentration.toExponential(3)} M
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center space-y-4 bg-slate-50 dark:bg-slate-800/40">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Concentración de [OH⁻]</span>
            <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
              {ohConcentration.toExponential(3)} M
            </div>
            <span className="text-xs text-slate-500">Kw = [H⁺][OH⁻] = 1.0 × 10⁻¹⁴</span>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Carácter Químico</span>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {ph < 7 ? 'Donador de protones (Arrhenius / Brønsted)' : ph > 7 ? 'Aceptor de protones (Brønsted)' : 'Neutro'}
            </div>
          </div>
        </div>
      </div>

      {/* Slider Control */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Ajustar valor de pH
          </label>
          <input
            type="number"
            min="0"
            max="14"
            step="0.1"
            value={ph}
            onChange={e => setPh(Math.max(0, Math.min(14, parseFloat(e.target.value) || 0)))}
            className="w-20 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-center font-mono font-bold text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
          />
        </div>

        {/* Universal Color Gradient Bar */}
        <div
          className="h-6 w-full rounded-xl shadow-inner mb-2 cursor-pointer relative"
          style={{
            background: 'linear-gradient(to right, #ef4444 0%, #f97316 20%, #eab308 35%, #22c55e 50%, #06b6d4 65%, #3b82f6 80%, #8b5cf6 100%)'
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newPh = (clickX / rect.width) * 14;
            setPh(parseFloat(newPh.toFixed(1)));
          }}
        >
          {/* Indicator pin */}
          <div
            className="absolute top-0 bottom-0 w-3 bg-white border-2 border-slate-900 rounded-full -ml-1.5 shadow-md transition-all duration-75"
            style={{ left: `${(ph / 14) * 100}%` }}
          />
        </div>

        <div className="flex justify-between text-xs font-mono font-bold text-slate-400">
          <span>0 (Muy Ácido)</span>
          <span>7 (Neutro)</span>
          <span>14 (Muy Alcalino)</span>
        </div>
      </div>

      {/* Reference Substances Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Sustancias de Referencia Cotidianas (Haz clic para cargar)
          </h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {BENCHMARKS.map((b) => (
            <button
              key={b.name}
              onClick={() => setPh(b.ph)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                Math.abs(ph - b.ph) < 0.2
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{b.name}</span>
                <span
                  className="text-xs font-mono font-bold px-1.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: getPhColor(b.ph) }}
                >
                  {b.ph}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{b.category}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
