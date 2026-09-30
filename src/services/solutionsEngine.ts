/**
 * Solutions & Concentration Engine (Soluciones y Concentraciones)
 * Chemistry simulation for solubility, molarity, dissociation and saturation.
 */

export interface SoluteData {
  id: string;
  name: string;
  formula: string;
  molarMass: number; // g/mol
  solubility20C: number; // g / 100 mL of H2O at 20°C
  tempSolubilityCoeff: (tempC: number) => number; // calculates solubility in g / 100 mL at given temp
  colorAtZero: string; // hex
  colorAtSaturation: string; // hex
  solidColor: string; // hex for crystals
  type: 'ionic_strong' | 'covalent_polar' | 'ionic_colored';
  ionsDescription: string;
  cation: { symbol: string; charge: string; color: string };
  anion: { symbol: string; charge: string; color: string };
  description: string;
}

export const SOLUTES: Record<string, SoluteData> = {
  nacl: {
    id: 'nacl',
    name: 'Cloruro de Sodio (Sal de mesa)',
    formula: 'NaCl',
    molarMass: 58.44,
    solubility20C: 36.0, // 36 g per 100 mL -> 360 g/L
    tempSolubilityCoeff: (T: number) => {
      // NaCl solubility is relatively flat with temperature
      // 35.7 at 0°C, 36.0 at 20°C, 39.1 at 100°C
      return 35.7 + 0.034 * T;
    },
    colorAtZero: '#e0f2fe',
    colorAtSaturation: '#bae6fd',
    solidColor: '#f8fafc',
    type: 'ionic_strong',
    ionsDescription: 'Na⁺(ac) + Cl⁻(ac) — Electrolito fuerte 100% disociado',
    cation: { symbol: 'Na⁺', charge: '+1', color: '#60a5fa' },
    anion: { symbol: 'Cl⁻', charge: '-1', color: '#4ade80' },
    description: 'La sal común forma una red iónica cristalina cúbica. En agua se disocia completamente en cationes sodio y aniones cloruro hidratados.',
  },
  sucrose: {
    id: 'sucrose',
    name: 'Sacarosa (Azúcar de mesa)',
    formula: 'C₁₂H₂₂O₁₁',
    molarMass: 342.30,
    solubility20C: 204.0, // 204 g per 100 mL -> 2040 g/L!
    tempSolubilityCoeff: (T: number) => {
      // Sucrose solubility increases steeply with temp
      // 179 g at 0°C, 204 g at 20°C, 487 g at 100°C
      return 179 + 1.25 * T + 0.018 * Math.pow(T, 2) * 0.1;
    },
    colorAtZero: '#e0f2fe',
    colorAtSaturation: '#fde047',
    solidColor: '#fef08a',
    type: 'covalent_polar',
    ionsDescription: 'C₁₂H₂₂O₁₁(ac) — Compuesto molecular neutro (No electrolito)',
    cation: { symbol: 'C₁₂H₂₂O₁₁', charge: '0', color: '#fbbf24' },
    anion: { symbol: 'H₂O', charge: '0', color: '#93c5fd' },
    description: 'El azúcar común no se disocia en iones; sus moléculas intactas forman múltiples puentes de hidrógeno con las moléculas de agua circundantes.',
  },
  cuso4: {
    id: 'cuso4',
    name: 'Sulfato de Cobre (II)',
    formula: 'CuSO₄',
    molarMass: 159.61,
    solubility20C: 32.0, // 32 g per 100 mL -> 320 g/L
    tempSolubilityCoeff: (T: number) => {
      // 14.3 g at 0°C, 32.0 g at 20°C, 75.4 g at 100°C
      return 14.3 + 0.61 * T;
    },
    colorAtZero: '#bae6fd',
    colorAtSaturation: '#0369a1',
    solidColor: '#2563eb',
    type: 'ionic_colored',
    ionsDescription: 'Cu²⁺(ac) [Azul hidratado] + SO₄²⁻(ac) — Electrolito fuerte',
    cation: { symbol: 'Cu²⁺', charge: '+2', color: '#0284c7' },
    anion: { symbol: 'SO₄²⁻', charge: '-2', color: '#94a3b8' },
    description: 'Genera una solución de intenso color azul debido a los iones complejos hexaaquacobre(II) [Cu(H₂O)₆]²⁺ en disolución acuosa.',
  },
  kmno4: {
    id: 'kmno4',
    name: 'Permanganato de Potasio',
    formula: 'KMnO₄',
    molarMass: 158.03,
    solubility20C: 6.4, // 6.4 g per 100 mL -> 64 g/L
    tempSolubilityCoeff: (T: number) => {
      // 2.8 g at 0°C, 6.4 g at 20°C, 22.2 g at 60°C
      return 2.8 + 0.18 * T + 0.001 * T * T;
    },
    colorAtZero: '#fbcfe8',
    colorAtSaturation: '#701a75',
    solidColor: '#3b0764',
    type: 'ionic_colored',
    ionsDescription: 'K⁺(ac) + MnO₄⁻(ac) [Púrpura intenso] — Fuerte oxidante',
    cation: { symbol: 'K⁺', charge: '+1', color: '#c084fc' },
    anion: { symbol: 'MnO₄⁻', charge: '-1', color: '#a21caf' },
    description: 'Posee una coloración violeta/púrpura sumamente potente debida a una transferencia de carga ligando-metal (MnO₄⁻). Se satura con poca masa.',
  },
  k2cr2o7: {
    id: 'k2cr2o7',
    name: 'Dicromato de Potasio',
    formula: 'K₂Cr₂O₇',
    molarMass: 294.18,
    solubility20C: 12.0, // 12 g per 100 mL -> 120 g/L
    tempSolubilityCoeff: (T: number) => {
      // 4.9 g at 0°C, 12 g at 20°C, 80 g at 100°C
      return 4.9 + 0.35 * T + 0.004 * T * T;
    },
    colorAtZero: '#fef08a',
    colorAtSaturation: '#ea580c',
    solidColor: '#c2410c',
    type: 'ionic_colored',
    ionsDescription: '2K⁺(ac) + Cr₂O₇²⁻(ac) [Naranja intenso]',
    cation: { symbol: 'K⁺', charge: '+1', color: '#fb923c' },
    anion: { symbol: 'Cr₂O₇²⁻', charge: '-2', color: '#ea580c' },
    description: 'Sal soluble de color naranja brillante. El equilibrio cromato-dicromato depende fuertemente de la concentración y el pH.',
  },
};

export interface SolutionState {
  soluteId: string;
  volumeMl: number; // Volume of water in mL (0 to 1000)
  addedSoluteGrams: number; // Total mass added in grams
  temperatureC: number; // Temperature in °C (0 to 100)
}

export interface SolutionCalculationResult {
  solute: SoluteData;
  volumeMl: number;
  volumeL: number;
  addedMassGrams: number;
  temperatureC: number;
  solubilityG100ml: number;
  solubilityGL: number;
  maxSolubleMassGrams: number;
  dissolvedMassGrams: number;
  precipitatedMassGrams: number;
  dissolvedMoles: number;
  molarity: number; // mol / L
  massVolumeConcentrationGL: number; // g / L
  massVolumePercentage: number; // % m/v
  saturationRatio: number; // 0 to 1+
  saturationPercentage: number; // 0% to 100%+
  stateType: 'empty' | 'unsaturated_dilute' | 'unsaturated_concentrated' | 'saturated_exact' | 'supersaturated_precipitate';
  stateLabel: string;
  stateBadgeColor: string;
  liquidColor: string; // RGB css/hex for 3D liquid
  liquidOpacity: number; // 0 to 1
  precipitateHeightNormalized: number; // 0 to 1 for 3D sediment mound
}

/**
 * Perform exact chemical calculations for a given solution state.
 */
export function calculateSolution(state: SolutionState): SolutionCalculationResult {
  const solute = SOLUTES[state.soluteId] || SOLUTES.nacl;
  const volumeMl = Math.max(0, state.volumeMl);
  const volumeL = volumeMl / 1000;
  const addedMassGrams = Math.max(0, state.addedSoluteGrams);
  const tempC = Math.max(0, Math.min(100, state.temperatureC));

  // Solubility at current temperature (g per 100 mL)
  const solubilityG100ml = solute.tempSolubilityCoeff(tempC);
  const solubilityGL = solubilityG100ml * 10;

  // Maximum mass of solute that can dissolve in the available water volume
  const maxSolubleMassGrams = (solubilityG100ml * volumeMl) / 100;

  if (volumeMl <= 0) {
    return {
      solute,
      volumeMl: 0,
      volumeL: 0,
      addedMassGrams,
      temperatureC: tempC,
      solubilityG100ml,
      solubilityGL,
      maxSolubleMassGrams: 0,
      dissolvedMassGrams: 0,
      precipitatedMassGrams: addedMassGrams,
      dissolvedMoles: 0,
      molarity: 0,
      massVolumeConcentrationGL: 0,
      massVolumePercentage: 0,
      saturationRatio: addedMassGrams > 0 ? 1 : 0,
      saturationPercentage: addedMassGrams > 0 ? 100 : 0,
      stateType: 'empty',
      stateLabel: 'Vaso Vacío (Sin Solvente)',
      stateBadgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      liquidColor: '#e0f2fe',
      liquidOpacity: 0.1,
      precipitateHeightNormalized: addedMassGrams > 0 ? Math.min(1, addedMassGrams / 100) : 0,
    };
  }

  // Mass dissolved vs mass precipitated
  const dissolvedMassGrams = Math.min(addedMassGrams, maxSolubleMassGrams);
  const precipitatedMassGrams = Math.max(0, addedMassGrams - maxSolubleMassGrams);

  // Moles of dissolved solute
  const dissolvedMoles = dissolvedMassGrams / solute.molarMass;

  // Molarity (M = mol/L)
  const molarity = volumeL > 0 ? dissolvedMoles / volumeL : 0;

  // Concentration in g/L and % m/v
  const massVolumeConcentrationGL = volumeL > 0 ? dissolvedMassGrams / volumeL : 0;
  const massVolumePercentage = volumeMl > 0 ? (dissolvedMassGrams / volumeMl) * 100 : 0;

  // Saturation ratio & percentage
  const saturationRatio = maxSolubleMassGrams > 0 ? addedMassGrams / maxSolubleMassGrams : 0;
  const saturationPercentage = saturationRatio * 100;

  // Categorize solution state
  let stateType: SolutionCalculationResult['stateType'] = 'unsaturated_dilute';
  let stateLabel = 'Solución Diluida (Insaturada)';
  let stateBadgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';

  if (precipitatedMassGrams > 0.05) {
    stateType = 'supersaturated_precipitate';
    stateLabel = '¡Solución Saturada con Precipitado!';
    stateBadgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse';
  } else if (saturationPercentage >= 98 && saturationPercentage <= 100.5) {
    stateType = 'saturated_exact';
    stateLabel = 'Solución Saturada (Límite de Equilibrio)';
    stateBadgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
  } else if (saturationPercentage >= 40) {
    stateType = 'unsaturated_concentrated';
    stateLabel = 'Solución Concentrada (Insaturada)';
    stateBadgeColor = 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300';
  }

  // Calculate dynamic liquid color (interpolate between water and saturation color)
  const frac = Math.min(1, Math.max(0, dissolvedMassGrams / (maxSolubleMassGrams || 1)));
  const liquidColor = interpolateHex(solute.colorAtZero, solute.colorAtSaturation, frac);
  const liquidOpacity = 0.45 + frac * 0.45;

  // Precipitate mound normalized height (0 to 1) based on precipitated grams
  // Assume ~150g fills max mound
  const precipitateHeightNormalized = Math.min(1, precipitatedMassGrams / 120);

  return {
    solute,
    volumeMl,
    volumeL,
    addedMassGrams,
    temperatureC: tempC,
    solubilityG100ml,
    solubilityGL,
    maxSolubleMassGrams,
    dissolvedMassGrams,
    precipitatedMassGrams,
    dissolvedMoles,
    molarity,
    massVolumeConcentrationGL,
    massVolumePercentage,
    saturationRatio,
    saturationPercentage,
    stateType,
    stateLabel,
    stateBadgeColor,
    liquidColor,
    liquidOpacity,
    precipitateHeightNormalized,
  };
}

/**
 * Interpolate two hex colors linearly.
 */
function interpolateHex(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}
