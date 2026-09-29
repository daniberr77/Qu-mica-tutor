import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle2, XCircle, Wand2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubstanceSpec {
  formula: string;
  name: string;
  atoms: Record<string, number>;
}

interface ReactionSpec {
  id: string;
  title: string;
  type: string;
  reactants: SubstanceSpec[];
  products: SubstanceSpec[];
  balancedCoeffs: {
    reactants: number[];
    products: number[];
  };
  explanation: string;
}

const REACTIONS: ReactionSpec[] = [
  {
    id: 'combustion-propano',
    title: 'Combustión completa del propano',
    type: 'Combustión',
    reactants: [
      { formula: 'C3H8', name: 'Propano', atoms: { C: 3, H: 8 } },
      { formula: 'O2', name: 'Oxígeno', atoms: { O: 2 } },
    ],
    products: [
      { formula: 'CO2', name: 'Dióxido de carbono', atoms: { C: 1, O: 2 } },
      { formula: 'H2O', name: 'Agua', atoms: { H: 2, O: 1 } },
    ],
    balancedCoeffs: {
      reactants: [1, 5],
      products: [3, 4],
    },
    explanation: '1 C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O (Balance: 3 Carbonos, 8 Hidrógenos y 10 Oxígenos).'
  },
  {
    id: 'sintesis-amoniaco',
    title: 'Síntesis de Amoníaco (Haber-Bosch)',
    type: 'Síntesis',
    reactants: [
      { formula: 'N2', name: 'Nitrógeno molecular', atoms: { N: 2 } },
      { formula: 'H2', name: 'Hidrógeno molecular', atoms: { H: 2 } },
    ],
    products: [
      { formula: 'NH3', name: 'Amoníaco', atoms: { N: 1, H: 3 } },
    ],
    balancedCoeffs: {
      reactants: [1, 3],
      products: [2],
    },
    explanation: '1 N₂ + 3 H₂ → 2 NH₃ (Balance: 2 Nitrógenos y 6 Hidrógenos).'
  },
  {
    id: 'formacion-agua',
    title: 'Síntesis del Agua',
    type: 'Síntesis / Redox',
    reactants: [
      { formula: 'H2', name: 'Hidrógeno', atoms: { H: 2 } },
      { formula: 'O2', name: 'Oxígeno', atoms: { O: 2 } },
    ],
    products: [
      { formula: 'H2O', name: 'Agua', atoms: { H: 2, O: 1 } },
    ],
    balancedCoeffs: {
      reactants: [2, 1],
      products: [2],
    },
    explanation: '2 H₂ + 1 O₂ → 2 H₂O (Balance: 4 Hidrógenos y 2 Oxígenos).'
  },
  {
    id: 'descomposicion-kclo3',
    title: 'Descomposición del Clorato de Potasio',
    type: 'Descomposición',
    reactants: [
      { formula: 'KClO3', name: 'Clorato de potasio', atoms: { K: 1, Cl: 1, O: 3 } },
    ],
    products: [
      { formula: 'KCl', name: 'Cloruro de potasio', atoms: { K: 1, Cl: 1 } },
      { formula: 'O2', name: 'Oxígeno', atoms: { O: 2 } },
    ],
    balancedCoeffs: {
      reactants: [2],
      products: [2, 3],
    },
    explanation: '2 KClO₃ → 2 KCl + 3 O₂ (Balance: 2 K, 2 Cl y 6 O).'
  },
  {
    id: 'neutralizacion',
    title: 'Neutralización Ácido-Base',
    type: 'Neutralización / Doble sustitución',
    reactants: [
      { formula: 'HCl', name: 'Ácido clorhídrico', atoms: { H: 1, Cl: 1 } },
      { formula: 'Ca(OH)2', name: 'Hidróxido de calcio', atoms: { Ca: 1, O: 2, H: 2 } },
    ],
    products: [
      { formula: 'CaCl2', name: 'Cloruro de calcio', atoms: { Ca: 1, Cl: 2 } },
      { formula: 'H2O', name: 'Agua', atoms: { H: 2, O: 1 } },
    ],
    balancedCoeffs: {
      reactants: [2, 1],
      products: [1, 2],
    },
    explanation: '2 HCl + 1 Ca(OH)₂ → 1 CaCl₂ + 2 H₂O (Balance: 2 H de ácido + 2 H de hidróxido = 4 H).'
  }
];

export const EquationBalancer: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const currentReaction = REACTIONS[selectedIdx];

  const [reactantCoeffs, setReactantCoeffs] = useState<number[]>(
    currentReaction.reactants.map(() => 1)
  );
  const [productCoeffs, setProductCoeffs] = useState<number[]>(
    currentReaction.products.map(() => 1)
  );

  // Reset coefficients when selecting a new reaction
  useEffect(() => {
    setReactantCoeffs(currentReaction.reactants.map(() => 1));
    setProductCoeffs(currentReaction.products.map(() => 1));
  }, [selectedIdx]);

  // Count atoms on reactants side
  const reactantAtoms: Record<string, number> = {};
  currentReaction.reactants.forEach((sub, i) => {
    const coeff = reactantCoeffs[i] || 1;
    for (const [el, count] of Object.entries(sub.atoms)) {
      reactantAtoms[el] = (reactantAtoms[el] || 0) + count * coeff;
    }
  });

  // Count atoms on products side
  const productAtoms: Record<string, number> = {};
  currentReaction.products.forEach((sub, i) => {
    const coeff = productCoeffs[i] || 1;
    for (const [el, count] of Object.entries(sub.atoms)) {
      productAtoms[el] = (productAtoms[el] || 0) + count * coeff;
    }
  });

  // Get all unique elements in the reaction
  const allElements = Array.from(
    new Set([...Object.keys(reactantAtoms), ...Object.keys(productAtoms)])
  );

  // Check balance
  const isBalanced = allElements.every(
    (el) => (reactantAtoms[el] || 0) === (productAtoms[el] || 0)
  );

  const [hasCelebrated, setHasCelebrated] = useState(false);

  useEffect(() => {
    if (isBalanced && !hasCelebrated) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
      setHasCelebrated(true);
    } else if (!isBalanced) {
      setHasCelebrated(false);
    }
  }, [isBalanced, hasCelebrated]);

  const autoBalance = () => {
    setReactantCoeffs([...currentReaction.balancedCoeffs.reactants]);
    setProductCoeffs([...currentReaction.balancedCoeffs.products]);
  };

  const resetCoeffs = () => {
    setReactantCoeffs(currentReaction.reactants.map(() => 1));
    setProductCoeffs(currentReaction.products.map(() => 1));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Balanceador Interactivo de Ecuaciones</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ajusta los coeficientes estequiométricos y comprueba la conservación de átomos en tiempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetCoeffs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar
          </button>
          <button
            onClick={autoBalance}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Resolver Automáticamente
          </button>
        </div>
      </div>

      {/* Reaction presets */}
      <div className="flex flex-wrap gap-2 mb-6">
        {REACTIONS.map((rx, idx) => (
          <button
            key={rx.id}
            onClick={() => setSelectedIdx(idx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedIdx === idx
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {rx.title}
          </button>
        ))}
      </div>

      {/* Interactive Equation Card */}
      <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
        <div className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 mb-4 tracking-wider">
          Tipo: {currentReaction.type}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-900 dark:text-white font-mono text-lg">
          {/* Reactants */}
          {currentReaction.reactants.map((sub, i) => (
            <React.Fragment key={sub.formula}>
              {i > 0 && <span className="text-2xl font-bold text-slate-400">+</span>}
              <div className="flex items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col gap-1 mr-2.5">
                  <button
                    onClick={() => {
                      const updated = [...reactantCoeffs];
                      updated[i] = Math.min(20, updated[i] + 1);
                      setReactantCoeffs(updated);
                    }}
                    className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900 rounded text-xs font-bold"
                  >
                    +
                  </button>
                  <button
                    onClick={() => {
                      const updated = [...reactantCoeffs];
                      updated[i] = Math.max(1, updated[i] - 1);
                      setReactantCoeffs(updated);
                    }}
                    className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900 rounded text-xs font-bold"
                  >
                    -
                  </button>
                </div>
                <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mr-2 min-w-[20px] text-center">
                  {reactantCoeffs[i]}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{sub.formula}</span>
              </div>
            </React.Fragment>
          ))}

          {/* Reaction Arrow */}
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 px-2">
            ➔
          </div>

          {/* Products */}
          {currentReaction.products.map((sub, i) => (
            <React.Fragment key={sub.formula}>
              {i > 0 && <span className="text-2xl font-bold text-slate-400">+</span>}
              <div className="flex items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col gap-1 mr-2.5">
                  <button
                    onClick={() => {
                      const updated = [...productCoeffs];
                      updated[i] = Math.min(20, updated[i] + 1);
                      setProductCoeffs(updated);
                    }}
                    className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900 rounded text-xs font-bold"
                  >
                    +
                  </button>
                  <button
                    onClick={() => {
                      const updated = [...productCoeffs];
                      updated[i] = Math.max(1, updated[i] - 1);
                      setProductCoeffs(updated);
                    }}
                    className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900 rounded text-xs font-bold"
                  >
                    -
                  </button>
                </div>
                <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mr-2 min-w-[20px] text-center">
                  {productCoeffs[i]}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{sub.formula}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Real-time Atom Balance Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          isBalanced
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
        }`}>
          {isBalanced ? (
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="w-6 h-6 flex-shrink-0 text-amber-600" />
          )}
          <div>
            <div className="font-bold text-sm">
              {isBalanced ? '¡Ecuación perfectamente balanceada!' : 'La ecuación no está balanceada aún'}
            </div>
            <div className="text-xs opacity-90">
              {isBalanced ? currentReaction.explanation : 'Ajusta los coeficientes hasta que cada elemento tenga igual número en reactivos y productos.'}
            </div>
          </div>
        </div>

        {/* Atom Table */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Conteo de Átomos: Reactivos vs Productos</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {allElements.map((el) => {
              const rCount = reactantAtoms[el] || 0;
              const pCount = productAtoms[el] || 0;
              const matched = rCount === pCount;
              return (
                <div
                  key={el}
                  className={`p-2 rounded-lg border text-center font-mono text-xs ${
                    matched
                      ? 'bg-emerald-100/50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-100/50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <span className="font-bold block text-sm">{el}</span>
                  <span>{rCount} ➔ {pCount}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
