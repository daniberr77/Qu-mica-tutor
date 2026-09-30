export type ReactionCategory =
  | 'sintesis'
  | 'descomposicion'
  | 'sustitucion_simple'
  | 'sustitucion_doble'
  | 'neutralizacion'
  | 'combustion'
  | 'redox';

export type BondType = 'single' | 'double' | 'triple' | 'ionic' | 'hydrogen' | 'metallic';

export interface ElementData {
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicMass: number;
  color: string;
  radius: number; // visual scale in 3D
  electronegativity?: number;
}

export interface Atom3D {
  id: string;
  element: string; // 'H', 'O', 'C', 'N', 'Cl', 'Na', 'Zn', 'Cu', 'Ag', etc.
  label: string;
  startPos: [number, number, number];
  collisionPos: [number, number, number];
  endPos: [number, number, number];
  role: string;
  initialMolecule: string;
  finalMolecule: string;
  chargeStart?: string;
  chargeEnd?: string;
  color?: string; // override element color if needed
}

export interface Bond3D {
  id: string;
  atom1Id: string;
  atom2Id: string;
  type: BondType;
  order: 1 | 2 | 3;
}

export interface ReactionPhaseInfo {
  phase: number; // 1, 2, 3, 4
  name: string;
  timeRange: [number, number]; // [0.0, 0.35], [0.35, 0.55], etc.
  description: string;
  chemicalEvent: string;
}

export interface ReactionDefinition {
  id: string;
  category: ReactionCategory;
  categoryLabel: string;
  title: string;
  subtitle: string;
  equation: string;
  equationFormatted: {
    reactants: { text: string; sub?: string; color?: string }[];
    arrow: string;
    products: { text: string; sub?: string; color?: string }[];
  };
  description: string;
  thermodynamics: {
    type: 'Exotérmica' | 'Endotérmica';
    deltaH: string;
    activationEnergy: string;
    activationEnergyValue: number; // 0 to 1 scale for chart
    deltaHValue: number; // relative change: negative for exo, positive for endo
    notes: string;
  };
  bondsBroken: string[];
  bondsFormed: string[];
  phases: ReactionPhaseInfo[];
  atoms: Atom3D[];
  initialBonds: Bond3D[];
  finalBonds: Bond3D[];
  electronTransfers?: {
    fromAtomId: string;
    toAtomId: string;
    electrons: number;
  }[];
  conservationOfMass: {
    element: string;
    reactantCount: number;
    productCount: number;
  }[];
  promptForTutor: string;
}
