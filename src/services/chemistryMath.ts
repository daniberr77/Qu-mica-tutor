/**
 * Pure Mathematical and Chemical Computation Engine for Quimica-Tutor
 * 100% deterministic code calculations (no external AI dependency)
 */

export interface ElementMassData {
  symbol: string;
  name: string;
  atomicMass: number;
}

// Complete atomic masses for chemical calculations
export const ATOMIC_DATA: Record<string, ElementMassData> = {
  H: { symbol: 'H', name: 'Hidrógeno', atomicMass: 1.008 },
  He: { symbol: 'He', name: 'Helio', atomicMass: 4.0026 },
  Li: { symbol: 'Li', name: 'Litio', atomicMass: 6.94 },
  Be: { symbol: 'Be', name: 'Berilio', atomicMass: 9.0122 },
  B: { symbol: 'B', name: 'Boro', atomicMass: 10.81 },
  C: { symbol: 'C', name: 'Carbono', atomicMass: 12.011 },
  N: { symbol: 'N', name: 'Nitrógeno', atomicMass: 14.007 },
  O: { symbol: 'O', name: 'Oxígeno', atomicMass: 15.999 },
  F: { symbol: 'F', name: 'Flúor', atomicMass: 18.998 },
  Ne: { symbol: 'Ne', name: 'Neón', atomicMass: 20.180 },
  Na: { symbol: 'Na', name: 'Sodio', atomicMass: 22.990 },
  Mg: { symbol: 'Mg', name: 'Magnesio', atomicMass: 24.305 },
  Al: { symbol: 'Al', name: 'Aluminio', atomicMass: 26.982 },
  Si: { symbol: 'Si', name: 'Silicio', atomicMass: 28.085 },
  P: { symbol: 'P', name: 'Fósforo', atomicMass: 30.974 },
  S: { symbol: 'S', name: 'Azufre', atomicMass: 32.06 },
  Cl: { symbol: 'Cl', name: 'Cloro', atomicMass: 35.45 },
  Ar: { symbol: 'Ar', name: 'Argón', atomicMass: 39.948 },
  K: { symbol: 'K', name: 'Potasio', atomicMass: 39.098 },
  Ca: { symbol: 'Ca', name: 'Calcio', atomicMass: 40.078 },
  Sc: { symbol: 'Sc', name: 'Escandio', atomicMass: 44.956 },
  Ti: { symbol: 'Ti', name: 'Titanio', atomicMass: 47.867 },
  V: { symbol: 'V', name: 'Vanadio', atomicMass: 50.942 },
  Cr: { symbol: 'Cr', name: 'Cromo', atomicMass: 51.996 },
  Mn: { symbol: 'Mn', name: 'Manganeso', atomicMass: 54.938 },
  Fe: { symbol: 'Fe', name: 'Hierro', atomicMass: 55.845 },
  Co: { symbol: 'Co', name: 'Cobalto', atomicMass: 58.933 },
  Ni: { symbol: 'Ni', name: 'Níquel', atomicMass: 58.693 },
  Cu: { symbol: 'Cu', name: 'Cobre', atomicMass: 63.546 },
  Zn: { symbol: 'Zn', name: 'Cinc', atomicMass: 65.38 },
  Ga: { symbol: 'Ga', name: 'Galio', atomicMass: 69.723 },
  Ge: { symbol: 'Ge', name: 'Germanio', atomicMass: 72.630 },
  As: { symbol: 'As', name: 'Arsénico', atomicMass: 74.922 },
  Se: { symbol: 'Se', name: 'Selenio', atomicMass: 78.971 },
  Br: { symbol: 'Br', name: 'Bromo', atomicMass: 79.904 },
  Kr: { symbol: 'Kr', name: 'Kriptón', atomicMass: 83.798 },
  Rb: { symbol: 'Rb', name: 'Rubidio', atomicMass: 85.468 },
  Sr: { symbol: 'Sr', name: 'Estroncio', atomicMass: 87.62 },
  Y: { symbol: 'Y', name: 'Itrio', atomicMass: 88.906 },
  Zr: { symbol: 'Zr', name: 'Circonio', atomicMass: 91.224 },
  Nb: { symbol: 'Nb', name: 'Niobio', atomicMass: 92.906 },
  Mo: { symbol: 'Mo', name: 'Molibdeno', atomicMass: 95.95 },
  Tc: { symbol: 'Tc', name: 'Tecnecio', atomicMass: 98.0 },
  Ru: { symbol: 'Ru', name: 'Rutenio', atomicMass: 101.07 },
  Rh: { symbol: 'Rh', name: 'Rodio', atomicMass: 102.91 },
  Pd: { symbol: 'Pd', name: 'Paladio', atomicMass: 106.42 },
  Ag: { symbol: 'Ag', name: 'Plata', atomicMass: 107.87 },
  Cd: { symbol: 'Cd', name: 'Cadmio', atomicMass: 112.41 },
  In: { symbol: 'In', name: 'Indio', atomicMass: 114.82 },
  Sn: { symbol: 'Sn', name: 'Estaño', atomicMass: 118.71 },
  Sb: { symbol: 'Sb', name: 'Antimonio', atomicMass: 121.76 },
  Te: { symbol: 'Te', name: 'Telurio', atomicMass: 127.60 },
  I: { symbol: 'I', name: 'Yodo', atomicMass: 126.90 },
  Xe: { symbol: 'Xe', name: 'Xenón', atomicMass: 131.29 },
  Cs: { symbol: 'Cs', name: 'Cesio', atomicMass: 132.91 },
  Ba: { symbol: 'Ba', name: 'Bario', atomicMass: 137.33 },
  La: { symbol: 'La', name: 'Lantano', atomicMass: 138.91 },
  Ce: { symbol: 'Ce', name: 'Cerio', atomicMass: 140.12 },
  W: { symbol: 'W', name: 'Wolframio', atomicMass: 183.84 },
  Pt: { symbol: 'Pt', name: 'Platino', atomicMass: 195.08 },
  Au: { symbol: 'Au', name: 'Oro', atomicMass: 196.97 },
  Hg: { symbol: 'Hg', name: 'Mercurio', atomicMass: 200.59 },
  Pb: { symbol: 'Pb', name: 'Plomo', atomicMass: 207.2 },
  Bi: { symbol: 'Bi', name: 'Bismuto', atomicMass: 208.98 },
  U: { symbol: 'U', name: 'Uranio', atomicMass: 238.03 },
};

/**
 * GCD and LCM utilities
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b > 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round(a * b)) / gcd(a, b);
}

/**
 * Exact Rational (Fraction) class for exact nullspace and linear algebra
 */
export class Fraction {
  n: number; // numerator
  d: number; // denominator

  constructor(n: number, d: number = 1) {
    if (d === 0) throw new Error('El denominador no puede ser 0');
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    this.n = Math.round(n / g);
    this.d = Math.round(d / g);
  }

  add(other: Fraction): Fraction {
    return new Fraction(this.n * other.d + other.n * this.d, this.d * other.d);
  }

  sub(other: Fraction): Fraction {
    return new Fraction(this.n * other.d - other.n * this.d, this.d * other.d);
  }

  mul(other: Fraction): Fraction {
    return new Fraction(this.n * other.n, this.d * other.d);
  }

  div(other: Fraction): Fraction {
    return new Fraction(this.n * other.d, this.d * other.n);
  }

  isZero(): boolean {
    return this.n === 0;
  }

  neg(): Fraction {
    return new Fraction(-this.n, this.d);
  }

  toNumber(): number {
    return this.n / this.d;
  }

  toString(): string {
    return this.d === 1 ? `${this.n}` : `${this.n}/${this.d}`;
  }
}

/**
 * Converts numbers in chemical formulas into clean Unicode subscripts
 * e.g., "C3H8" -> "C₃H₈", "Ca(OH)2" -> "Ca(OH)₂"
 */
export function formatFormulaSubscripts(formula: string): string {
  const subscripts: Record<string, string> = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  };
  return formula.replace(/\d+/g, (match) => {
    return match
      .split('')
      .map((c) => subscripts[c] || c)
      .join('');
  });
}

/**
 * Parses a chemical formula (handling parentheses and hydrates)
 * e.g. "Ca(OH)2" -> { Ca: 1, O: 2, H: 2 }
 * e.g. "Fe2(SO4)3" -> { Fe: 2, S: 3, O: 12 }
 */
export function parseFormula(formula: string): Record<string, number> {
  let clean = formula.trim().replace(/\s+/g, '');
  if (!clean) return {};

  // Strip leading coefficient if present: e.g. "2 H2O" -> "H2O"
  clean = clean.replace(/^\d+/, '');

  // Hydrate support: CuSO4*5H2O or CuSO4•5H2O
  if (clean.includes('*') || clean.includes('•') || clean.includes('.')) {
    const parts = clean.split(/[*•.]/);
    if (parts.length === 2 && parts[1].includes('H2O')) {
      const main = parseFormula(parts[0]);
      const hydMatch = parts[1].match(/^(\d*)(.*)$/);
      const hydCoeff = hydMatch && hydMatch[1] ? parseInt(hydMatch[1], 10) : 1;
      const hydFormula = hydMatch && hydMatch[2] ? hydMatch[2] : 'H2O';
      const hyd = parseFormula(hydFormula);
      const result = { ...main };
      for (const [el, count] of Object.entries(hyd)) {
        result[el] = (result[el] || 0) + count * hydCoeff;
      }
      return result;
    }
  }

  // Expand parentheses recursively: e.g. Ca(OH)2 -> CaO2H2
  let expanded = clean;
  const parenRegex = /\(([^()]+)\)(\d*)/g;
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
  if (!matches) return {};

  for (const match of matches) {
    const sub = match.match(/([A-Z][a-z]*)(\d*)/);
    if (!sub) continue;
    const symbol = sub[1];
    const count = sub[2] ? parseInt(sub[2], 10) : 1;
    counts[symbol] = (counts[symbol] || 0) + count;
  }

  return counts;
}

/**
 * Calculates the molar mass of a chemical formula
 */
export function getMolarMass(formula: string): {
  molarMass: number;
  breakdown: { symbol: string; name: string; count: number; atomicMass: number; subtotal: number; percentage: number }[];
} {
  const counts = parseFormula(formula);
  let total = 0;
  const breakdown: { symbol: string; name: string; count: number; atomicMass: number; subtotal: number; percentage: number }[] = [];

  for (const [sym, count] of Object.entries(counts)) {
    const data = ATOMIC_DATA[sym] || { symbol: sym, name: sym, atomicMass: 1.0 };
    const subtotal = data.atomicMass * count;
    total += subtotal;
    breakdown.push({
      symbol: sym,
      name: data.name,
      count,
      atomicMass: data.atomicMass,
      subtotal,
      percentage: 0,
    });
  }

  if (total > 0) {
    breakdown.forEach((item) => {
      item.percentage = (item.subtotal / total) * 100;
    });
  }

  return {
    molarMass: Math.round(total * 1000) / 1000,
    breakdown,
  };
}

export interface ParsedSpecies {
  raw: string;
  formula: string;
  initialCoeff: number;
  atoms: Record<string, number>;
}

export interface ParsedEquation {
  reactants: ParsedSpecies[];
  products: ParsedSpecies[];
}

/**
 * Parses an equation string like "C3H8 + 5 O2 -> 3 CO2 + 4 H2O" or "C3H8 + O2 -> CO2 + H2O"
 */
export function parseEquation(eqStr: string): ParsedEquation | null {
  try {
    const arrowRegex = /->|-->|=>|⇌|=/;
    const sides = eqStr.split(arrowRegex);
    if (sides.length !== 2) return null;

    const parseSide = (sideStr: string): ParsedSpecies[] => {
      return sideStr
        .split('+')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const match = part.match(/^(\d*)\s*([A-Za-z0-9()•*.]+)/);
          if (!match) {
            return {
              raw: part,
              formula: part,
              initialCoeff: 1,
              atoms: parseFormula(part),
            };
          }
          const coeff = match[1] ? parseInt(match[1], 10) : 1;
          const formula = match[2];
          return {
            raw: part,
            formula,
            initialCoeff: coeff,
            atoms: parseFormula(formula),
          };
        });
    };

    const reactants = parseSide(sides[0]);
    const products = parseSide(sides[1]);

    if (reactants.length === 0 || products.length === 0) return null;
    return { reactants, products };
  } catch {
    return null;
  }
}

/**
 * Verifies atom conservation for an equation with given coefficients
 */
export interface BalanceVerification {
  isBalanced: boolean;
  elements: {
    symbol: string;
    name: string;
    reactantCount: number;
    productCount: number;
    balanced: boolean;
    difference: number;
  }[];
  reactantAtomsTotal: number;
  productAtomsTotal: number;
}

export function verifyBalance(
  reactants: { formula: string; coeff: number }[],
  products: { formula: string; coeff: number }[]
): BalanceVerification {
  const reactantCounts: Record<string, number> = {};
  const productCounts: Record<string, number> = {};

  reactants.forEach((r) => {
    const atoms = parseFormula(r.formula);
    for (const [el, count] of Object.entries(atoms)) {
      reactantCounts[el] = (reactantCounts[el] || 0) + count * (r.coeff || 1);
    }
  });

  products.forEach((p) => {
    const atoms = parseFormula(p.formula);
    for (const [el, count] of Object.entries(atoms)) {
      productCounts[el] = (productCounts[el] || 0) + count * (p.coeff || 1);
    }
  });

  const allElements = Array.from(
    new Set([...Object.keys(reactantCounts), ...Object.keys(productCounts)])
  );

  let isBalanced = true;
  let reactantAtomsTotal = 0;
  let productAtomsTotal = 0;

  const elements = allElements.map((sym) => {
    const rCount = reactantCounts[sym] || 0;
    const pCount = productCounts[sym] || 0;
    reactantAtomsTotal += rCount;
    productAtomsTotal += pCount;
    const balanced = rCount === pCount;
    if (!balanced) isBalanced = false;
    return {
      symbol: sym,
      name: ATOMIC_DATA[sym]?.name || sym,
      reactantCount: rCount,
      productCount: pCount,
      balanced,
      difference: pCount - rCount,
    };
  });

  return {
    isBalanced,
    elements,
    reactantAtomsTotal,
    productAtomsTotal,
  };
}

/**
 * Algebraic Balancer: Solves any chemical equation using linear algebra and exact fraction Gaussian elimination
 */
export interface AlgebraicSolution {
  variableNames: string[]; // ['a', 'b', 'c', 'd', ...]
  reactants: string[];
  products: string[];
  reactantCoeffs: number[];
  productCoeffs: number[];
  balancedEquationString: string;
  elementEquations: {
    element: string;
    name: string;
    rawEquation: string; // e.g. "3a = 1c"
    homogeneousEquation: string; // e.g. "3a - c = 0"
  }[];
  matrix: {
    headers: string[]; // ['Elemento', 'a', 'b', 'c', 'd']
    rows: { element: string; values: number[] }[];
  };
  resolutionSteps: {
    title: string;
    explanation: string;
    math?: string;
  }[];
}

const VARIABLE_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];

export function balanceAlgebraic(eqStr: string): AlgebraicSolution | null {
  const parsed = parseEquation(eqStr);
  if (!parsed) return null;

  const reactants = parsed.reactants.map((r) => r.formula);
  const products = parsed.products.map((p) => p.formula);
  const species = [...reactants, ...products];
  const numReactants = reactants.length;
  const numSpecies = species.length;

  const varNames = species.map((_, i) => VARIABLE_LETTERS[i] || `x${i + 1}`);

  const speciesCounts = species.map((s) => parseFormula(s));
  const elementSet = new Set<string>();
  speciesCounts.forEach((c) => Object.keys(c).forEach((el) => elementSet.add(el)));
  const elements = Array.from(elementSet);

  // Build Element Equations: sum_reactants (count * var) = sum_products (count * var)
  const elementEquations = elements.map((el) => {
    const leftParts: string[] = [];
    const rightParts: string[] = [];
    const homoParts: string[] = [];

    reactants.forEach((_, i) => {
      const cnt = speciesCounts[i][el] || 0;
      if (cnt > 0) {
        const term = cnt === 1 ? varNames[i] : `${cnt}${varNames[i]}`;
        leftParts.push(term);
        homoParts.push(term);
      }
    });

    products.forEach((_, j) => {
      const idx = numReactants + j;
      const cnt = speciesCounts[idx][el] || 0;
      if (cnt > 0) {
        const term = cnt === 1 ? varNames[idx] : `${cnt}${varNames[idx]}`;
        rightParts.push(term);
        homoParts.push(`- ${term}`);
      }
    });

    return {
      element: el,
      name: ATOMIC_DATA[el]?.name || el,
      rawEquation: `${leftParts.join(' + ') || '0'} = ${rightParts.join(' + ') || '0'}`,
      homogeneousEquation: `${homoParts.join(' ').replace(/\+ -/g, '-')} = 0`,
    };
  });

  // Build Matrix A (elements x species)
  const matrixRows = elements.map((el) => {
    const values = species.map((_, j) => {
      const count = speciesCounts[j][el] || 0;
      return j < numReactants ? count : -count;
    });
    return { element: el, values };
  });

  // Gaussian elimination with Fraction class
  const fractionMatrix = elements.map((el) => {
    return species.map((_, j) => {
      const count = speciesCounts[j][el] || 0;
      return new Fraction(j < numReactants ? count : -count);
    });
  });

  const R = elements.length;
  const C = numSpecies;

  let lead = 0;
  for (let r = 0; r < R && lead < C; r++) {
    let pivot = r;
    while (pivot < R && fractionMatrix[pivot][lead].isZero()) {
      pivot++;
    }
    if (pivot === R) {
      lead++;
      r--;
      continue;
    }
    // Swap rows
    const temp = fractionMatrix[r];
    fractionMatrix[r] = fractionMatrix[pivot];
    fractionMatrix[pivot] = temp;

    // Scale row
    const div = fractionMatrix[r][lead];
    for (let c = 0; c < C; c++) {
      fractionMatrix[r][c] = fractionMatrix[r][c].div(div);
    }

    // Eliminate other rows
    for (let i = 0; i < R; i++) {
      if (i !== r && !fractionMatrix[i][lead].isZero()) {
        const factor = fractionMatrix[i][lead];
        for (let c = 0; c < C; c++) {
          fractionMatrix[i][c] = fractionMatrix[i][c].sub(factor.mul(fractionMatrix[r][c]));
        }
      }
    }
    lead++;
  }

  // Assign free variable (last variable = 1) and back substitute
  const coeffs = new Array<Fraction>(C).fill(new Fraction(0));
  coeffs[C - 1] = new Fraction(1);

  for (let r = R - 1; r >= 0; r--) {
    let pCol = -1;
    for (let c = 0; c < C; c++) {
      if (!fractionMatrix[r][c].isZero()) {
        pCol = c;
        break;
      }
    }
    if (pCol === -1 || pCol === C - 1) continue;

    let sum = new Fraction(0);
    for (let c = pCol + 1; c < C; c++) {
      if (!fractionMatrix[r][c].isZero() && coeffs[c]) {
        sum = sum.add(fractionMatrix[r][c].mul(coeffs[c]));
      }
    }
    coeffs[pCol] = sum.neg();
  }

  // Normalize signs
  coeffs.forEach((c, idx) => {
    if (c.n < 0) coeffs[idx] = c.neg();
    if (c.isZero()) coeffs[idx] = new Fraction(1);
  });

  // Calculate LCM of denominators
  let totalLcm = 1;
  for (const c of coeffs) {
    totalLcm = lcm(totalLcm, c.d);
  }

  const intCoeffs = coeffs.map((c) => Math.round((c.n * totalLcm) / c.d));
  let overallGcd = intCoeffs[0] || 1;
  for (let i = 1; i < intCoeffs.length; i++) {
    overallGcd = gcd(overallGcd, intCoeffs[i]);
  }
  const finalCoeffs = intCoeffs.map((c) => Math.max(1, c / overallGcd));

  const reactantCoeffs = finalCoeffs.slice(0, numReactants);
  const productCoeffs = finalCoeffs.slice(numReactants);

  // Resolution steps narrative
  const resolutionSteps = [
    {
      title: 'Paso 1: Asignación de variables a cada término químico',
      explanation: `Se asigna una incógnita algebraica a cada sustancia de la reacción: ${species
        .map((s, i) => `${varNames[i]} · ${formatFormulaSubscripts(s)}`)
        .join(' + ')
        .replace(new RegExp(`(\\+ )(?=${formatFormulaSubscripts(products[0])})`), '→ ')}.`,
      math: species.map((s, i) => `${varNames[i]} = [${formatFormulaSubscripts(s)}]`).join(', '),
    },
    {
      title: 'Paso 2: Planteamiento del sistema por conservación de átomos',
      explanation:
        'Por la Ley de Conservación de la Materia de Lavoisier, la cantidad de átomos de cada elemento en los reactivos debe igualar a los de los productos.',
      math: elementEquations.map((e) => `${e.element}: ${e.rawEquation}`).join(' \\quad | \\quad '),
    },
    {
      title: 'Paso 3: Matriz del sistema lineal homogéneo [A][x] = [0]',
      explanation:
        'Se trasponen todos los términos al lado izquierdo formando un sistema homogéneo donde cada fila representa un elemento químico.',
      math: elementEquations.map((e) => e.homogeneousEquation).join(' \\quad ; \\quad '),
    },
    {
      title: 'Paso 4: Solución paramétrica inicial con coeficientes racionales',
      explanation: `Se fija arbitrariamente la variable paramétrica ${varNames[C - 1]} = 1 y se resuelven las variables dependientes mediante eliminación gaussiana exacta:`,
      math: varNames.map((v, i) => `${v} = ${coeffs[i].toString()}`).join(', '),
    },
    {
      title: 'Paso 5: Conversión a números enteros mínimos',
      explanation:
        totalLcm > 1
          ? `Dado que hay denominadores fraccionarios, se multiplican todas las incógnitas por el mínimo común múltiplo (mcm = ${totalLcm}) para obtener números enteros mínimos.`
          : 'Todos los coeficientes ya son números enteros directos.',
      math: varNames.map((v, i) => `${v} = ${finalCoeffs[i]}`).join(', '),
    },
  ];

  const balancedEquationString = `${reactants
    .map((r, i) => `${reactantCoeffs[i] > 1 ? reactantCoeffs[i] : ''} ${formatFormulaSubscripts(r)}`.trim())
    .join(' + ')} → ${products
    .map((p, i) => `${productCoeffs[i] > 1 ? productCoeffs[i] : ''} ${formatFormulaSubscripts(p)}`.trim())
    .join(' + ')}`;

  return {
    variableNames: varNames,
    reactants,
    products,
    reactantCoeffs,
    productCoeffs,
    balancedEquationString,
    elementEquations,
    matrix: {
      headers: ['Elemento', ...varNames],
      rows: matrixRows,
    },
    resolutionSteps,
  };
}

/**
 * Redox Reaction Definition and Solver Data
 */
export interface RedoxReactionPreset {
  id: string;
  title: string;
  description: string;
  equation: string;
  medium: 'Ácido' | 'Básico' | 'Neutro';
  reactants: {
    formula: string;
    oxidationStates: Record<string, number>;
  }[];
  products: {
    formula: string;
    oxidationStates: Record<string, number>;
  }[];
  oxidizedElement: string;
  reducedElement: string;
  reducingAgent: string; // agente reductor (se oxida)
  oxidizingAgent: string; // agente oxidante (se reduce)
  oxidationHalfReaction: string;
  reductionHalfReaction: string;
  electronsTransferred: number;
  multiplierOx: number;
  multiplierRed: number;
  balancedEquation: string;
  rulesExplanation: string[];
}

export const REDOX_PRESETS: RedoxReactionPreset[] = [
  {
    id: 'cu-hno3',
    title: 'Cobre metálico con Ácido Nítrico concentrado',
    description: 'Reacción clásica de laboratorio donde el cobre se oxida a ion cúprico y el nitrógeno se reduce a dióxido de nitrógeno.',
    equation: 'Cu + HNO3 -> Cu(NO3)2 + NO2 + H2O',
    medium: 'Ácido',
    reactants: [
      { formula: 'Cu', oxidationStates: { Cu: 0 } },
      { formula: 'HNO3', oxidationStates: { H: 1, N: 5, O: -2 } },
    ],
    products: [
      { formula: 'Cu(NO3)2', oxidationStates: { Cu: 2, N: 5, O: -2 } },
      { formula: 'NO2', oxidationStates: { N: 4, O: -2 } },
      { formula: 'H2O', oxidationStates: { H: 1, O: -2 } },
    ],
    oxidizedElement: 'Cu (de 0 a +2)',
    reducedElement: 'N (de +5 a +4)',
    reducingAgent: 'Cu (Cobre)',
    oxidizingAgent: 'HNO3 (Ácido nítrico)',
    oxidationHalfReaction: 'Cu⁰ → Cu⁺² + 2e⁻',
    reductionHalfReaction: 'N⁺⁵ + 1e⁻ → N⁺⁴',
    electronsTransferred: 2,
    multiplierOx: 1,
    multiplierRed: 2,
    balancedEquation: '1 Cu + 4 HNO₃ → 1 Cu(NO₃)₂ + 2 NO₂ + 2 H₂O',
    rulesExplanation: [
      'Cu libre tiene E.O. = 0 (elemento en estado elemental no combinado).',
      'En HNO₃: H es +1, O es -2 (3 × -2 = -6). Para carga neta cero: +1 + N - 6 = 0 ⇒ N = +5.',
      'En Cu(NO₃)₂: El anión nitrato es NO₃⁻ (N=+5, O=-2). Como hay dos nitratos (-2 total), el Cu debe ser +2.',
      'En NO₂: El O es -2 (2 × -2 = -4). Para especie neutra: N - 4 = 0 ⇒ N = +4.',
      'En H₂O: H es +1 (2 × +1 = +2) y O es -2.',
    ],
  },
  {
    id: 'kmno4-hcl',
    title: 'Permanganato de Potasio con Ácido Clorhídrico',
    description: 'El potente oxidante permanganato oxida al ion cloruro a cloro gaseoso molecular.',
    equation: 'KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O',
    medium: 'Ácido',
    reactants: [
      { formula: 'KMnO4', oxidationStates: { K: 1, Mn: 7, O: -2 } },
      { formula: 'HCl', oxidationStates: { H: 1, Cl: -1 } },
    ],
    products: [
      { formula: 'KCl', oxidationStates: { K: 1, Cl: -1 } },
      { formula: 'MnCl2', oxidationStates: { Mn: 2, Cl: -1 } },
      { formula: 'Cl2', oxidationStates: { Cl: 0 } },
      { formula: 'H2O', oxidationStates: { H: 1, O: -2 } },
    ],
    oxidizedElement: 'Cl (de -1 en HCl a 0 en Cl₂)',
    reducedElement: 'Mn (de +7 en KMnO₄ a +2 en MnCl₂)',
    reducingAgent: 'HCl (Ácido clorhídrico)',
    oxidizingAgent: 'KMnO4 (Permanganato de potasio)',
    oxidationHalfReaction: '2 Cl⁻¹ → Cl₂⁰ + 2e⁻',
    reductionHalfReaction: 'Mn⁺⁷ + 5e⁻ → Mn⁺²',
    electronsTransferred: 10,
    multiplierOx: 5,
    multiplierRed: 2,
    balancedEquation: '2 KMnO₄ + 16 HCl → 2 KCl + 2 MnCl₂ + 5 Cl₂ + 8 H₂O',
    rulesExplanation: [
      'En KMnO₄: K es metal alcalino (+1), O es -2 (4 × -2 = -8). Para suma = 0: +1 + Mn - 8 = 0 ⇒ Mn = +7.',
      'En HCl: H es +1, por tanto Cl es -1.',
      'En MnCl₂: Cl es haluro (-1, total -2), por lo tanto Mn es +2.',
      'En Cl₂: Molécula homonuclear biatómica elemental ⇒ E.O. = 0.',
      'El Mn se reduce ganando 5 electrones; cada Cl se oxida perdiendo 1 electrón (2e⁻ por molécula de Cl₂).',
    ],
  },
  {
    id: 'fe-cuso4',
    title: 'Desplazamiento simple: Hierro y Sulfato de Cobre',
    description: 'Un clavo de hierro sumergido en sulfato cúprico se recubre de cobre rojizo elemental.',
    equation: 'Fe + CuSO4 -> FeSO4 + Cu',
    medium: 'Neutro',
    reactants: [
      { formula: 'Fe', oxidationStates: { Fe: 0 } },
      { formula: 'CuSO4', oxidationStates: { Cu: 2, S: 6, O: -2 } },
    ],
    products: [
      { formula: 'FeSO4', oxidationStates: { Fe: 2, S: 6, O: -2 } },
      { formula: 'Cu', oxidationStates: { Cu: 0 } },
    ],
    oxidizedElement: 'Fe (de 0 a +2)',
    reducedElement: 'Cu (de +2 a 0)',
    reducingAgent: 'Fe (Hierro metálico)',
    oxidizingAgent: 'CuSO4 (Ion Cúprico)',
    oxidationHalfReaction: 'Fe⁰ → Fe⁺² + 2e⁻',
    reductionHalfReaction: 'Cu⁺² + 2e⁻ → Cu⁰',
    electronsTransferred: 2,
    multiplierOx: 1,
    multiplierRed: 1,
    balancedEquation: '1 Fe + 1 CuSO₄ → 1 FeSO₄ + 1 Cu',
    rulesExplanation: [
      'Fe inicial está libre en su estado metálico: E.O. = 0.',
      'En CuSO₄: El anión sulfato SO₄²⁻ tiene carga -2 (S=+6, O=-2). Para neutralidad, Cu = +2.',
      'En FeSO₄: El sulfato sigue siendo SO₄²⁻, por lo que el catión ferroso es Fe = +2.',
      'El Cu final queda libre como metal precipitado: E.O. = 0.',
    ],
  },
  {
    id: 'zn-hcl',
    title: 'Cinc metálico con Ácido Clorhídrico',
    description: 'Generación de hidrógeno gaseoso por reducción del protón y oxidación del cinc metálico.',
    equation: 'Zn + HCl -> ZnCl2 + H2',
    medium: 'Ácido',
    reactants: [
      { formula: 'Zn', oxidationStates: { Zn: 0 } },
      { formula: 'HCl', oxidationStates: { H: 1, Cl: -1 } },
    ],
    products: [
      { formula: 'ZnCl2', oxidationStates: { Zn: 2, Cl: -1 } },
      { formula: 'H2', oxidationStates: { H: 0 } },
    ],
    oxidizedElement: 'Zn (de 0 a +2)',
    reducedElement: 'H (de +1 a 0)',
    reducingAgent: 'Zn (Cinc metálico)',
    oxidizingAgent: 'HCl (Protón H⁺)',
    oxidationHalfReaction: 'Zn⁰ → Zn⁺² + 2e⁻',
    reductionHalfReaction: '2 H⁺¹ + 2e⁻ → H₂⁰',
    electronsTransferred: 2,
    multiplierOx: 1,
    multiplierRed: 1,
    balancedEquation: '1 Zn + 2 HCl → 1 ZnCl₂ + 1 H₂',
    rulesExplanation: [
      'Zn metálico tiene E.O. = 0.',
      'En HCl: H=+1 y Cl=-1.',
      'En ZnCl₂: Cl=-1 (total -2), por tanto Zn = +2.',
      'En H₂: Gas biatómico libre elemental ⇒ E.O. = 0.',
    ],
  },
  {
    id: 'k2cr2o7-feso4',
    title: 'Dicromato de Potasio y Sulfato Ferroso en medio ácido',
    description: 'Oxidación cuantitativa de Fe(II) a Fe(III) mediante la reducción del dicromato anaranjado a cromo(III) verde.',
    equation: 'K2Cr2O7 + FeSO4 + H2SO4 -> Cr2(SO4)3 + Fe2(SO4)3 + K2SO4 + H2O',
    medium: 'Ácido',
    reactants: [
      { formula: 'K2Cr2O7', oxidationStates: { K: 1, Cr: 6, O: -2 } },
      { formula: 'FeSO4', oxidationStates: { Fe: 2, S: 6, O: -2 } },
      { formula: 'H2SO4', oxidationStates: { H: 1, S: 6, O: -2 } },
    ],
    products: [
      { formula: 'Cr2(SO4)3', oxidationStates: { Cr: 3, S: 6, O: -2 } },
      { formula: 'Fe2(SO4)3', oxidationStates: { Fe: 3, S: 6, O: -2 } },
      { formula: 'K2SO4', oxidationStates: { K: 1, S: 6, O: -2 } },
      { formula: 'H2O', oxidationStates: { H: 1, O: -2 } },
    ],
    oxidizedElement: 'Fe (de +2 en FeSO₄ a +3 en Fe₂(SO₄)₃)',
    reducedElement: 'Cr (de +6 en K₂Cr₂O₇ a +3 en Cr₂(SO₄)₃)',
    reducingAgent: 'FeSO4 (Sulfato ferroso)',
    oxidizingAgent: 'K2Cr2O7 (Dicromato de potasio)',
    oxidationHalfReaction: '2 Fe⁺² → 2 Fe⁺³ + 2e⁻',
    reductionHalfReaction: 'Cr₂⁺⁶ + 6e⁻ → 2 Cr⁺³',
    electronsTransferred: 6,
    multiplierOx: 3,
    multiplierRed: 1,
    balancedEquation: '1 K₂Cr₂O₇ + 6 FeSO₄ + 7 H₂SO₄ → 1 Cr₂(SO₄)₃ + 3 Fe₂(SO₄)₃ + 1 K₂SO₄ + 7 H₂O',
    rulesExplanation: [
      'En K₂Cr₂O₇: K=+1 (total +2), O=-2 (7 × -2 = -14). Para neutralidad: +2 + 2(Cr) - 14 = 0 ⇒ 2(Cr) = +12 ⇒ Cr = +6.',
      'En FeSO₄: El anión sulfato es SO₄²⁻ ⇒ Fe = +2.',
      'En Fe₂(SO₄)₃: Tres sulfatos suman -6 ⇒ 2(Fe) = +6 ⇒ Fe = +3.',
      'En Cr₂(SO₄)₃: Tres sulfatos suman -6 ⇒ 2(Cr) = +6 ⇒ Cr = +3.',
    ],
  },
];

/**
 * Stoichiometry Calculation Engine
 */
export interface ReactantInput {
  formula: string;
  amount: number;
  unit: 'g' | 'mol';
}

export interface StoichiometryResult {
  equation: string;
  reactants: {
    formula: string;
    coeff: number;
    molarMass: number;
    initialGrams: number;
    initialMoles: number;
    stoichRatio: number; // initialMoles / coeff
    isLimiting: boolean;
    isExcess: boolean;
    consumedMoles: number;
    consumedGrams: number;
    remainingMoles: number;
    remainingGrams: number;
    percentConsumed: number;
  }[];
  products: {
    formula: string;
    coeff: number;
    molarMass: number;
    theoreticalMoles: number;
    theoreticalGrams: number;
  }[];
  limitingReagentFormula: string;
  excessReagents: string[];
  totalMassConsumed: number;
  totalTheoreticalProductMass: number;
  percentYield?: {
    actualGrams: number;
    productFormula: string;
    percentage: number;
    status: 'excelente' | 'normal' | 'bajo' | 'anomalo';
    comment: string;
  };
  calculationSteps: {
    stepNumber: number;
    title: string;
    description: string;
    formula?: string;
    valuesText: string;
  }[];
}

export function calculateStoichiometry(
  equationStr: string,
  inputs: Record<string, { amount: number; unit: 'g' | 'mol' }>,
  actualYield?: { productFormula: string; actualGrams: number }
): StoichiometryResult | null {
  // First, balance the equation if needed
  const balanced = balanceAlgebraic(equationStr);
  if (!balanced) return null;

  const { reactants: rFormulas, products: pFormulas, reactantCoeffs, productCoeffs } = balanced;

  // Compute molar masses and initial moles for all reactants
  const reactantsData = rFormulas.map((formula, idx) => {
    const coeff = reactantCoeffs[idx];
    const { molarMass } = getMolarMass(formula);
    const userInp = inputs[formula] || { amount: 0, unit: 'g' };

    let initialMoles = 0;
    let initialGrams = 0;

    if (userInp.unit === 'mol') {
      initialMoles = userInp.amount;
      initialGrams = initialMoles * molarMass;
    } else {
      initialGrams = userInp.amount;
      initialMoles = molarMass > 0 ? initialGrams / molarMass : 0;
    }

    const stoichRatio = coeff > 0 ? initialMoles / coeff : 0;

    return {
      formula,
      coeff,
      molarMass,
      initialGrams: Math.round(initialGrams * 1000) / 1000,
      initialMoles: Math.round(initialMoles * 10000) / 10000,
      stoichRatio: Math.round(stoichRatio * 10000) / 10000,
      isLimiting: false,
      isExcess: false,
      consumedMoles: 0,
      consumedGrams: 0,
      remainingMoles: 0,
      remainingGrams: 0,
      percentConsumed: 0,
    };
  });

  // Filter reactants that have active positive input
  const reactantsWithInput = reactantsData.filter((r) => r.initialMoles > 0);
  if (reactantsWithInput.length === 0) return null;

  // Determine Limiting Reagent (minimum non-zero stoichRatio among provided inputs)
  // If only 1 reactant provided, that reactant acts as limiting, assuming other reactants in excess
  let minRatio = Infinity;
  let limitingFormula = reactantsWithInput[0].formula;

  reactantsWithInput.forEach((r) => {
    if (r.stoichRatio < minRatio) {
      minRatio = r.stoichRatio;
      limitingFormula = r.formula;
    }
  });

  const limitingReagent = reactantsData.find((r) => r.formula === limitingFormula)!;
  const limitingStoichRatio = minRatio; // R_RL = moles_RL / coeff_RL

  // Mark limiting and excess, and compute consumption / remaining amounts
  let totalMassConsumed = 0;
  const excessReagentsList: string[] = [];

  reactantsData.forEach((r) => {
    if (r.formula === limitingFormula) {
      r.isLimiting = true;
      r.isExcess = false;
      r.consumedMoles = r.initialMoles;
      r.consumedGrams = r.initialGrams;
      r.remainingMoles = 0;
      r.remainingGrams = 0;
      r.percentConsumed = 100;
    } else {
      r.isLimiting = false;
      r.isExcess = true;
      excessReagentsList.push(r.formula);

      const requiredMoles = limitingStoichRatio * r.coeff;
      const consumedMoles = Math.min(r.initialMoles > 0 ? r.initialMoles : requiredMoles, requiredMoles);
      const consumedGrams = consumedMoles * r.molarMass;
      const remainingMoles = Math.max(0, r.initialMoles - consumedMoles);
      const remainingGrams = remainingMoles * r.molarMass;
      const percent = r.initialMoles > 0 ? (consumedMoles / r.initialMoles) * 100 : 100;

      r.consumedMoles = Math.round(consumedMoles * 10000) / 10000;
      r.consumedGrams = Math.round(consumedGrams * 1000) / 1000;
      r.remainingMoles = Math.round(remainingMoles * 10000) / 10000;
      r.remainingGrams = Math.round(remainingGrams * 1000) / 1000;
      r.percentConsumed = Math.round(percent * 10) / 10;
    }
    totalMassConsumed += r.consumedGrams;
  });

  // Calculate Theoretical Yield for each Product
  let totalTheoreticalProductMass = 0;
  const productsData = pFormulas.map((formula, idx) => {
    const coeff = productCoeffs[idx];
    const { molarMass } = getMolarMass(formula);
    const theoreticalMoles = limitingStoichRatio * coeff;
    const theoreticalGrams = theoreticalMoles * molarMass;
    totalTheoreticalProductMass += theoreticalGrams;

    return {
      formula,
      coeff,
      molarMass,
      theoreticalMoles: Math.round(theoreticalMoles * 10000) / 10000,
      theoreticalGrams: Math.round(theoreticalGrams * 1000) / 1000,
    };
  });

  // Percent Yield calculation
  let percentYieldResult: StoichiometryResult['percentYield'] | undefined;
  if (actualYield && actualYield.actualGrams > 0) {
    const prod = productsData.find((p) => p.formula === actualYield.productFormula) || productsData[0];
    if (prod && prod.theoreticalGrams > 0) {
      const percentage = (actualYield.actualGrams / prod.theoreticalGrams) * 100;
      let status: 'excelente' | 'normal' | 'bajo' | 'anomalo' = 'normal';
      let comment = '';

      if (percentage > 102) {
        status = 'anomalo';
        comment = 'Rendimiento > 100%: Muy probablemente la muestra contiene humedad residual, disolvente atrapado o impurezas sólidas.';
      } else if (percentage >= 90) {
        status = 'excelente';
        comment = 'Rendimiento sobresaliente (>90%): Proceso de síntesis y recuperación de alta pureza y eficiencia.';
      } else if (percentage >= 60) {
        status = 'normal';
        comment = 'Rendimiento típico de laboratorio (60-89%): Pérdidas atribuibles a transferencias, solubilidad en lavado o reacciones secundarias.';
      } else {
        status = 'bajo';
        comment = 'Rendimiento bajo (<60%): Se recomienda revisar la temperatura, tiempo de reacción o técnicas de purificación.';
      }

      percentYieldResult = {
        actualGrams: actualYield.actualGrams,
        productFormula: prod.formula,
        percentage: Math.round(percentage * 100) / 100,
        status,
        comment,
      };
    }
  }

  // Generate step-by-step mathematical cards
  const calculationSteps = [
    {
      stepNumber: 1,
      title: 'Ecuación química balanceada y Masas Molares',
      description: 'Se verifica el balance de masa y se determinan las masas molares exactas de cada especie involucrada.',
      valuesText: `Ecuación: ${balanced.balancedEquationString} | Masas: ${reactantsData
        .concat(productsData as any)
        .map((s) => `M(${formatFormulaSubscripts(s.formula)}) = ${s.molarMass} g/mol`)
        .join(' • ')}`,
    },
    {
      stepNumber: 2,
      title: 'Conversión de cantidades a Moles iniciales',
      description: 'Se convierten los gramos suministrados a moles empleando la relación n = m / M.',
      formula: 'n = \\frac{m}{M}',
      valuesText: reactantsWithInput
        .map(
          (r) =>
            `${formatFormulaSubscripts(r.formula)}: ${r.initialGrams} g ÷ ${r.molarMass} g/mol = ${r.initialMoles} mol`
        )
        .join(' | '),
    },
    {
      stepNumber: 3,
      title: 'Determinación del Reactivo Limitante',
      description:
        'Se calcula la relación molar estequiométrica (moles / coeficiente) para cada reactivo. El reactivo con el menor cociente se consumirá por completo primero y limitará la reacción.',
      formula: 'Cociente = \\frac{n_{reactivo}}{coeficiente}',
      valuesText: reactantsWithInput
        .map(
          (r) =>
            `${formatFormulaSubscripts(r.formula)}: ${r.initialMoles} mol ÷ ${r.coeff} = ${r.stoichRatio} ${
              r.isLimiting ? '★ (MENOR → LIMITANTE)' : '(EXCESO)'
            }`
        )
        .join(' | '),
    },
    {
      stepNumber: 4,
      title: 'Cálculo del Reactivo en Exceso Consumido y Sobrante',
      description:
        'A partir de los moles del reactivo limitante, se calculan los moles y gramos que realmente reaccionan y lo que queda sin reaccionar en el recipiente.',
      valuesText: reactantsData
        .filter((r) => r.isExcess)
        .map(
          (r) =>
            `${formatFormulaSubscripts(r.formula)}: Consumido = ${r.consumedGrams} g (${r.consumedMoles} mol) | Sobrante = ${r.remainingGrams} g (${r.remainingMoles} mol)`
        )
        .join(' • ') || 'No hay reactivos en exceso configurados.',
    },
    {
      stepNumber: 5,
      title: 'Cálculo del Rendimiento Teórico de los Productos',
      description:
        'Se calcula la cantidad estequiométrica máxima de producto que se obtendría con una conversión del 100% a partir del reactivo limitante.',
      formula: 'm_{teórica} = n_{RL} \\times \\left(\\frac{c_{producto}}{c_{RL}}\\right) \\times M_{producto}',
      valuesText: productsData
        .map(
          (p) =>
            `${formatFormulaSubscripts(p.formula)}: ${p.theoreticalMoles} mol (${p.theoreticalGrams} g)`
        )
        .join(' | '),
    },
  ];

  return {
    equation: balanced.balancedEquationString,
    reactants: reactantsData,
    products: productsData,
    limitingReagentFormula: limitingFormula,
    excessReagents: excessReagentsList,
    totalMassConsumed: Math.round(totalMassConsumed * 1000) / 1000,
    totalTheoreticalProductMass: Math.round(totalTheoreticalProductMass * 1000) / 1000,
    percentYield: percentYieldResult,
    calculationSteps,
  };
}
