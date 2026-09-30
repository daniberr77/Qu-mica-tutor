import type { PresetMolecule, MoleculeAtom, MoleculeBond } from './types';

export const CPK_ELEMENTS: Record<string, {
  name: string;
  symbol: string;
  color: string;
  radius: number;
  valency: number;
  mass: number;
}> = {
  H: { name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, valency: 1, mass: 1.008 },
  C: { name: 'Carbono', symbol: 'C', color: '#334155', radius: 0.70, valency: 4, mass: 12.011 },
  N: { name: 'Nitrógeno', symbol: 'N', color: '#3B82F6', radius: 0.65, valency: 3, mass: 14.007 },
  O: { name: 'Oxígeno', symbol: 'O', color: '#EF4444', radius: 0.65, valency: 2, mass: 15.999 },
  F: { name: 'Flúor', symbol: 'F', color: '#10B981', radius: 0.55, valency: 1, mass: 18.998 },
  Na: { name: 'Sodio', symbol: 'Na', color: '#8B5CF6', radius: 0.85, valency: 1, mass: 22.990 },
  Cl: { name: 'Cloro', symbol: 'Cl', color: '#22C55E', radius: 0.80, valency: 1, mass: 35.453 },
  P: { name: 'Fósforo', symbol: 'P', color: '#F97316', radius: 0.75, valency: 3, mass: 30.974 },
  S: { name: 'Azufre', symbol: 'S', color: '#EAB308', radius: 0.75, valency: 2, mass: 32.060 },
};

export const PRESET_MOLECULES: PresetMolecule[] = [
  {
    id: 'h2o',
    name: 'Agua',
    formula: 'H2O',
    category: 'inorganic',
    description: 'Molécula vital formada por 1 átomo de oxígeno y 2 de hidrógeno con enlaces covalentes polares y geometría angular.',
    geometry: 'Angular (Doblada)',
    bondAngle: '104.5°',
    polarity: 'Polar',
    molarMass: 18.015,
    atoms: [
      { id: 'o1', element: 'O', name: 'Oxígeno', symbol: 'O', color: '#EF4444', radius: 0.68, position: [0, 0.35, 0], valency: 2 },
      { id: 'h1', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [1.15, -0.45, 0], valency: 1 },
      { id: 'h2', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [-1.15, -0.45, 0], valency: 1 },
    ],
    bonds: [
      { id: 'b1', sourceId: 'o1', targetId: 'h1', order: 1, type: 'polar_covalent' },
      { id: 'b2', sourceId: 'o1', targetId: 'h2', order: 1, type: 'polar_covalent' },
    ]
  },
  {
    id: 'co2',
    name: 'Dióxido de Carbono',
    formula: 'CO2',
    category: 'inorganic',
    description: 'Gas de efecto invernadero esencial en fotosíntesis. Posee enlaces dobles C=O lineales y es una molécula apolar por simetría.',
    geometry: 'Lineal',
    bondAngle: '180°',
    polarity: 'Apolar',
    molarMass: 44.01,
    atoms: [
      { id: 'c1', element: 'C', name: 'Carbono', symbol: 'C', color: '#334155', radius: 0.70, position: [0, 0, 0], valency: 4 },
      { id: 'o1', element: 'O', name: 'Oxígeno', symbol: 'O', color: '#EF4444', radius: 0.68, position: [-2.1, 0, 0], valency: 2 },
      { id: 'o2', element: 'O', name: 'Oxígeno', symbol: 'O', color: '#EF4444', radius: 0.68, position: [2.1, 0, 0], valency: 2 },
    ],
    bonds: [
      { id: 'b1', sourceId: 'c1', targetId: 'o1', order: 2, type: 'polar_covalent' },
      { id: 'b2', sourceId: 'c1', targetId: 'o2', order: 2, type: 'polar_covalent' },
    ]
  },
  {
    id: 'ch4',
    name: 'Metano',
    formula: 'CH4',
    category: 'organic',
    description: 'Hidrocarburo alcano más simple y principal componente del gas natural. Presenta hibridación sp³ y geometría tetraédrica perfecta.',
    geometry: 'Tetraédrica',
    bondAngle: '109.5°',
    polarity: 'Apolar',
    molarMass: 16.04,
    atoms: [
      { id: 'c1', element: 'C', name: 'Carbono', symbol: 'C', color: '#334155', radius: 0.70, position: [0, 0, 0], valency: 4 },
      { id: 'h1', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [0.95, 0.95, 0.95], valency: 1 },
      { id: 'h2', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [-0.95, -0.95, 0.95], valency: 1 },
      { id: 'h3', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [-0.95, 0.95, -0.95], valency: 1 },
      { id: 'h4', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [0.95, -0.95, -0.95], valency: 1 },
    ],
    bonds: [
      { id: 'b1', sourceId: 'c1', targetId: 'h1', order: 1, type: 'covalent' },
      { id: 'b2', sourceId: 'c1', targetId: 'h2', order: 1, type: 'covalent' },
      { id: 'b3', sourceId: 'c1', targetId: 'h3', order: 1, type: 'covalent' },
      { id: 'b4', sourceId: 'c1', targetId: 'h4', order: 1, type: 'covalent' },
    ]
  },
  {
    id: 'nh3',
    name: 'Amoníaco',
    formula: 'NH3',
    category: 'inorganic',
    description: 'Gas incoloro de olor penetrante con un par solitario de electrones en el nitrógeno que genera una geometría piramidal trigonal y alta basicidad.',
    geometry: 'Piramidal Trigonal',
    bondAngle: '107°',
    polarity: 'Polar',
    molarMass: 17.031,
    atoms: [
      { id: 'n1', element: 'N', name: 'Nitrógeno', symbol: 'N', color: '#3B82F6', radius: 0.65, position: [0, 0.45, 0], valency: 3 },
      { id: 'h1', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [1.2, -0.35, 0], valency: 1 },
      { id: 'h2', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [-0.6, -0.35, 1.04], valency: 1 },
      { id: 'h3', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [-0.6, -0.35, -1.04], valency: 1 },
    ],
    bonds: [
      { id: 'b1', sourceId: 'n1', targetId: 'h1', order: 1, type: 'polar_covalent' },
      { id: 'b2', sourceId: 'n1', targetId: 'h2', order: 1, type: 'polar_covalent' },
      { id: 'b3', sourceId: 'n1', targetId: 'h3', order: 1, type: 'polar_covalent' },
    ]
  },
  {
    id: 'o2',
    name: 'Oxígeno Molecular',
    formula: 'O2',
    category: 'inorganic',
    description: 'Gas indispensable para la respiración celular aeróbica. Dos átomos de oxígeno comparten dos pares de electrones en un enlace doble covalente no polar.',
    geometry: 'Lineal',
    bondAngle: '180°',
    polarity: 'Apolar',
    molarMass: 31.998,
    atoms: [
      { id: 'o1', element: 'O', name: 'Oxígeno', symbol: 'O', color: '#EF4444', radius: 0.68, position: [-1.2, 0, 0], valency: 2 },
      { id: 'o2', element: 'O', name: 'Oxígeno', symbol: 'O', color: '#EF4444', radius: 0.68, position: [1.2, 0, 0], valency: 2 },
    ],
    bonds: [
      { id: 'b1', sourceId: 'o1', targetId: 'o2', order: 2, type: 'covalent' },
    ]
  },
  {
    id: 'nacl',
    name: 'Cloruro de Sodio',
    formula: 'NaCl',
    category: 'ionic',
    description: 'Sal común de mesa constituida por atracción electrostática pura entre el catión Na⁺ y el anión Cl⁻.',
    geometry: 'Iónica / Reticular',
    bondAngle: '180° (Par iónico)',
    polarity: 'Iónico',
    molarMass: 58.44,
    atoms: [
      { id: 'na1', element: 'Na', name: 'Sodio (Na⁺)', symbol: 'Na', color: '#8B5CF6', radius: 0.65, position: [-1.4, 0, 0], valency: 1 },
      { id: 'cl1', element: 'Cl', name: 'Cloro (Cl⁻)', symbol: 'Cl', color: '#22C55E', radius: 0.95, position: [1.4, 0, 0], valency: 1 },
    ],
    bonds: [
      { id: 'b1', sourceId: 'na1', targetId: 'cl1', order: 1, type: 'ionic' },
    ]
  },
  {
    id: 'hcl',
    name: 'Ácido Clorhídrico',
    formula: 'HCl',
    category: 'inorganic',
    description: 'Ácido fuerte componente principal del jugo gástrico estomacal. Enlace covalente fuertemente polarizado hacia el cloro.',
    geometry: 'Lineal',
    bondAngle: '180°',
    polarity: 'Polar',
    molarMass: 36.46,
    atoms: [
      { id: 'h1', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [-1.4, 0, 0], valency: 1 },
      { id: 'cl1', element: 'Cl', name: 'Cloro', symbol: 'Cl', color: '#22C55E', radius: 0.85, position: [0.9, 0, 0], valency: 1 },
    ],
    bonds: [
      { id: 'b1', sourceId: 'h1', targetId: 'cl1', order: 1, type: 'polar_covalent' },
    ]
  },
  {
    id: 'ethanol',
    name: 'Etanol',
    formula: 'C2H5OH',
    category: 'organic',
    description: 'Alcohol primario ampliamente utilizado como desinfectante, solvente industrial y biocombustible.',
    geometry: 'Cadena con Vértices Tetraédricos y Angular en -OH',
    bondAngle: '109.5° (C-C-O) / 104.5° (C-O-H)',
    polarity: 'Polar',
    molarMass: 46.07,
    atoms: [
      { id: 'c1', element: 'C', name: 'Carbono 1', symbol: 'C', color: '#334155', radius: 0.70, position: [-1.6, 0, 0], valency: 4 },
      { id: 'c2', element: 'C', name: 'Carbono 2', symbol: 'C', color: '#334155', radius: 0.70, position: [0.1, 0.4, 0], valency: 4 },
      { id: 'o1', element: 'O', name: 'Oxígeno', symbol: 'O', color: '#EF4444', radius: 0.65, position: [1.6, -0.3, 0], valency: 2 },
      { id: 'ho', element: 'H', name: 'Hidrógeno (OH)', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [2.5, 0.2, 0], valency: 1 },
      // Hydrogens on C1
      { id: 'h1', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [-2.6, 0, 0], valency: 1 },
      { id: 'h2', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [-1.6, 1.1, 0], valency: 1 },
      { id: 'h3', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [-1.6, -0.6, 0.9], valency: 1 },
      // Hydrogens on C2
      { id: 'h4', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [0.1, 1.5, 0], valency: 1 },
      { id: 'h5', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [0.1, 0.4, -1.1], valency: 1 },
    ],
    bonds: [
      { id: 'b1', sourceId: 'c1', targetId: 'c2', order: 1, type: 'covalent' },
      { id: 'b2', sourceId: 'c2', targetId: 'o1', order: 1, type: 'polar_covalent' },
      { id: 'b3', sourceId: 'o1', targetId: 'ho', order: 1, type: 'polar_covalent' },
      { id: 'b4', sourceId: 'c1', targetId: 'h1', order: 1, type: 'covalent' },
      { id: 'b5', sourceId: 'c1', targetId: 'h2', order: 1, type: 'covalent' },
      { id: 'b6', sourceId: 'c1', targetId: 'h3', order: 1, type: 'covalent' },
      { id: 'b7', sourceId: 'c2', targetId: 'h4', order: 1, type: 'covalent' },
      { id: 'b8', sourceId: 'c2', targetId: 'h5', order: 1, type: 'covalent' },
    ]
  }
];
