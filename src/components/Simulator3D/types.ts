export interface Nucleon {
  id: string;
  type: 'proton' | 'neutron';
  position: [number, number, number];
  basePosition: [number, number, number];
}

export interface ElectronParticle {
  id: string;
  shellIndex: number; // 0 for K, 1 for L, etc.
  orbitalRadius: number;
  initialAngle: number;
  speed: number;
  inclination: number; // orbital tilt in radians
  rotationY: number;   // orbital plane rotation
}

export interface ShellInfo {
  index: number;
  name: string; // K, L, M, N
  maxCapacity: number;
  count: number;
  radius: number;
  tiltX: number;
  tiltY: number;
}

export interface MoleculeAtom {
  id: string;
  element: string; // 'H', 'C', 'O', 'N', 'Cl', 'Na'
  name: string;
  symbol: string;
  color: string;
  radius: number;
  position: [number, number, number];
  valency: number;
}

export interface MoleculeBond {
  id: string;
  sourceId: string;
  targetId: string;
  order: 1 | 2 | 3; // single, double, triple bond
  type: 'covalent' | 'ionic' | 'polar_covalent';
}

export interface PresetMolecule {
  id: string;
  name: string;
  formula: string;
  formulaHtml?: string;
  category: 'inorganic' | 'organic' | 'ionic';
  description: string;
  geometry: string;
  bondAngle: string;
  polarity: 'Polar' | 'Apolar' | 'Iónico';
  molarMass: number;
  atoms: MoleculeAtom[];
  bonds: MoleculeBond[];
}
