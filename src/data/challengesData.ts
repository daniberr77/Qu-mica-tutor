import type {
  Challenge,
  ChallengeCategory,
  ChallengeDifficulty,
  NumericChallenge,
  BalancingChallenge,
} from '../types/challenges';

export const CURATED_CHALLENGES: Challenge[] = [
  // ==========================================
  // RETOS DE GASES
  // ==========================================
  {
    id: 'gas-boyle-1',
    category: 'gases',
    difficulty: 'facil',
    type: 'numeric',
    title: 'Ley de Boyle - Compresión de Helio',
    question:
      'Una muestra de gas helio tiene un volumen inicial de 4.0 L a una presión de 1.5 atm. Si la temperatura permanece constante y se comprime hasta un volumen final de 2.0 L, ¿cuál será la nueva presión del gas?',
    chemicalEquation: 'P₁ · V₁ = P₂ · V₂ (T = constante)',
    targetValue: 3.0,
    tolerance: 0.1,
    unit: 'atm',
    placeholder: 'Ej. 3.0',
    hint: 'Aplica la ley de Boyle: el producto presión por volumen es constante (P₁ · V₁ = P₂ · V₂). Despeja P₂.',
    formula: 'P₂ = (P₁ · V₁) / V₂',
    explanation:
      'Por la Ley de Boyle a temperatura constante: P₁ · V₁ = P₂ · V₂. Despejando: P₂ = (1.5 atm × 4.0 L) / 2.0 L = 6.0 / 2.0 = 3.0 atm. Al reducir el volumen a la mitad, la presión se duplica.',
    points: 20,
  },
  {
    id: 'gas-charles-1',
    category: 'gases',
    difficulty: 'facil',
    type: 'numeric',
    title: 'Ley de Charles - Dilatación Térmica',
    question:
      'Un globo contiene 500 mL de nitrógeno a una temperatura de 27 °C (300.15 K). Si la presión permanece constante y se calienta hasta 127 °C (400.15 K), ¿cuál será el nuevo volumen en mL?',
    chemicalEquation: 'V₁ / T₁ = V₂ / T₂ (P = constante)',
    targetValue: 666.6,
    tolerance: 3.0,
    unit: 'mL',
    placeholder: 'Ej. 666.6',
    hint: 'Recuerda que la temperatura SIEMPRE debe estar en escala Kelvin absoluta: T(K) = T(°C) + 273.15.',
    formula: 'V₂ = V₁ · (T₂ / T₁)',
    explanation:
      '1. Convertir temperaturas a Kelvin: T₁ = 27 + 273.15 = 300.15 K; T₂ = 127 + 273.15 = 400.15 K.\n2. Aplicar la Ley de Charles: V₂ = V₁ × (T₂ / T₁) = 500 mL × (400.15 / 300.15) ≈ 666.6 mL (o ~667 mL).',
    points: 25,
  },
  {
    id: 'gas-gay-lussac-1',
    category: 'gases',
    difficulty: 'facil',
    type: 'numeric',
    title: 'Ley de Gay-Lussac - Presión en un Recipiente Rígido',
    question:
      'Un tanque de gas rígido de volumen constante contiene gas a 2.0 atm y 20 °C (293.15 K). Si el tanque se calienta hasta 80 °C (353.15 K), ¿cuál será la presión final dentro del tanque en atm?',
    chemicalEquation: 'P₁ / T₁ = P₂ / T₂ (V = constante)',
    targetValue: 2.41,
    tolerance: 0.05,
    unit: 'atm',
    placeholder: 'Ej. 2.41',
    hint: 'La presión es directamente proporcional a la temperatura absoluta en Kelvin: P₂ = P₁ · (T₂ / T₁).',
    formula: 'P₂ = P₁ · (T₂ / T₁)',
    explanation:
      'T₁ = 20 + 273.15 = 293.15 K; T₂ = 80 + 273.15 = 353.15 K.\nP₂ = 2.0 atm × (353.15 K / 293.15 K) ≈ 2.409 ≈ 2.41 atm.',
    points: 20,
  },
  {
    id: 'gas-ideal-moles',
    category: 'gases',
    difficulty: 'medio',
    type: 'numeric',
    title: 'Gas Ideal - Moles en un Recipiente',
    question:
      '¿Cuántos moles de gas ideal están contenidos en un matraz de 8.21 L a una presión de 1.50 atm y una temperatura de 300 K? (Usa R = 0.0821 atm·L / mol·K).',
    chemicalEquation: 'P · V = n · R · T',
    targetValue: 0.50,
    tolerance: 0.03,
    unit: 'mol',
    placeholder: 'Ej. 0.50',
    hint: 'Despeja n de la ecuación de los gases ideales: n = (P · V) / (R · T).',
    formula: 'n = (P · V) / (R · T)',
    explanation:
      'Aplicamos la ecuación de los gases ideales: n = (P · V) / (R · T) = (1.50 atm × 8.21 L) / (0.0821 atm·L/mol·K × 300 K) = 12.315 / 24.63 = 0.50 mol.',
    points: 35,
  },
  {
    id: 'gas-ideal-volumen-cnpt',
    category: 'gases',
    difficulty: 'medio',
    type: 'numeric',
    title: 'Volumen Molar en Condiciones Normales (CNPT)',
    question:
      '¿Qué volumen en litros ocuparán 2.50 moles de dióxido de carbono (CO₂) en Condiciones Normales de Presión y Temperatura (1 atm y 0 °C, donde el volumen molar Vm = 22.4 L/mol)?',
    chemicalEquation: 'V = n · Vm (CNPT: 1 atm, 273.15 K)',
    targetValue: 56.0,
    tolerance: 0.5,
    unit: 'L',
    placeholder: 'Ej. 56.0',
    hint: 'En CNPT, 1 mol de cualquier gas ideal ocupa aproximadamente 22.4 L. Multiplica los moles por 22.4 L/mol.',
    formula: 'V = n × 22.4 L/mol',
    explanation:
      'En CNPT (0 °C y 1 atm), el volumen molar es 22.4 L/mol. Por lo tanto: V = 2.50 mol × 22.4 L/mol = 56.0 L de CO₂.',
    points: 30,
  },
  {
    id: 'gas-dalton-parcial',
    category: 'gases',
    difficulty: 'medio',
    type: 'numeric',
    title: 'Ley de Dalton - Presiones Parciales',
    question:
      'Una mezcla de gases contiene gas nitrógeno (N₂) a 0.65 atm, gas oxígeno (O₂) a 0.25 atm y vapor de agua a 0.03 atm. ¿Cuál es la presión total ejercida por la mezcla en atm?',
    chemicalEquation: 'P(total) = P(N₂) + P(O₂) + P(H₂O)',
    targetValue: 0.93,
    tolerance: 0.02,
    unit: 'atm',
    placeholder: 'Ej. 0.93',
    hint: 'La ley de Dalton establece que la presión total de una mezcla es la suma de las presiones parciales de cada gas.',
    formula: 'P(total) = Σ Pᵢ',
    explanation:
      'P(total) = 0.65 atm + 0.25 atm + 0.03 atm = 0.93 atm.',
    points: 25,
  },
  {
    id: 'gas-ideal-temperatura',
    category: 'gases',
    difficulty: 'avanzado',
    type: 'numeric',
    title: 'Gas Ideal - Cálculo de Temperatura',
    question:
      'Una muestra de 0.200 moles de gas ocupa un volumen de 4.105 L a una presión de 1.20 atm. ¿A qué temperatura en grados Celsius (°C) se encuentra el gas? (Usa R = 0.0821 atm·L/mol·K).',
    chemicalEquation: 'T(K) = (P · V) / (n · R)',
    targetValue: 27.0,
    tolerance: 1.5,
    unit: '°C',
    placeholder: 'Ej. 27.0',
    hint: 'Despeja T en Kelvin primero con T = (P · V) / (n · R), y luego convierte a Celsius: T(°C) = T(K) - 273.15.',
    formula: 'T(K) = (P · V)/(n · R); T(°C) = T(K) - 273.15',
    explanation:
      '1. T(K) = (1.20 atm × 4.105 L) / (0.200 mol × 0.0821) = 4.926 / 0.01642 = 300.0 K.\n2. T(°C) = 300.0 - 273.15 = 26.85 °C ≈ 27.0 °C.',
    points: 50,
  },

  // ==========================================
  // RETOS DE ESTEQUIOMETRÍA
  // ==========================================
  {
    id: 'esteq-masa-mol-1',
    category: 'estequiometria',
    difficulty: 'facil',
    type: 'numeric',
    title: 'Conversión de Masa a Moles de Agua',
    question:
      '¿Cuántos moles hay exactamente en 36.04 gramos de agua pura (H₂O)? (Masa molar del H = 1.008 g/mol, O = 16.00 g/mol -> H₂O = 18.02 g/mol).',
    chemicalEquation: 'n = m / M',
    targetValue: 2.0,
    tolerance: 0.05,
    unit: 'mol',
    placeholder: 'Ej. 2.0',
    hint: 'Usa la relación n = masa / masa molar. Divide 36.04 g entre 18.02 g/mol.',
    formula: 'n = m / M',
    explanation:
      'Masa molar del H₂O = (2 × 1.008) + 16.00 = 18.016 ≈ 18.02 g/mol.\nn = 36.04 g / 18.02 g/mol = 2.00 moles de H₂O.',
    points: 20,
  },
  {
    id: 'esteq-mol-a-masa-naoh',
    category: 'estequiometria',
    difficulty: 'facil',
    type: 'numeric',
    title: 'Conversión de Moles a Masa de NaOH',
    question:
      '¿Cuántos gramos de hidróxido de sodio (NaOH) corresponden a 0.50 moles de esta sustancia? (Masa molar de NaOH = 40.0 g/mol).',
    chemicalEquation: 'm = n · M',
    targetValue: 20.0,
    tolerance: 0.2,
    unit: 'g',
    placeholder: 'Ej. 20.0',
    hint: 'Multiplica el número de moles por la masa molar: m = n · M.',
    formula: 'm = n · M',
    explanation:
      'm = 0.50 mol × 40.0 g/mol = 20.0 gramos de NaOH.',
    points: 20,
  },
  {
    id: 'esteq-molar-propano',
    category: 'estequiometria',
    difficulty: 'medio',
    type: 'numeric',
    title: 'Combustión del Propano - Moles de CO₂',
    question:
      'Dada la reacción balanceada: C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O. Si se queman completamente 4.0 moles de propano (C₃H₈) con suficiente oxígeno, ¿cuántos moles de dióxido de carbono (CO₂) se producen?',
    chemicalEquation: 'C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O',
    targetValue: 12.0,
    tolerance: 0.1,
    unit: 'mol',
    placeholder: 'Ej. 12.0',
    hint: 'Observa la relación estequiométrica: 1 mol de C₃H₈ produce 3 moles de CO₂. Multiplica por 4.',
    formula: 'n(CO₂) = n(C₃H₈) × (3 mol CO₂ / 1 mol C₃H₈)',
    explanation:
      'Por la relación molar de la ecuación: 1 mol de C₃H₈ genera 3 moles de CO₂.\nPara 4.0 moles de propano: n(CO₂) = 4.0 × 3 = 12.0 moles de CO₂.',
    points: 30,
  },
  {
    id: 'esteq-haber-bosch',
    category: 'estequiometria',
    difficulty: 'medio',
    type: 'numeric',
    title: 'Síntesis de Haber-Bosch - Masa de Amoníaco',
    question:
      'En la síntesis de amoníaco: N₂ + 3 H₂ → 2 NH₃. Si reaccionan 6.0 moles de hidrógeno (H₂) con exceso de nitrógeno, ¿cuántos gramos de amoníaco (NH₃, masa molar = 17.03 g/mol) se obtendrán teóricamente?',
    chemicalEquation: 'N₂ + 3 H₂ → 2 NH₃',
    targetValue: 68.12,
    tolerance: 1.0,
    unit: 'g',
    placeholder: 'Ej. 68.1',
    hint: '1) Convierte moles de H₂ a moles de NH₃ usando la relación (2 mol NH₃ / 3 mol H₂). 2) Convierte moles de NH₃ a gramos multiplicando por 17.03 g/mol.',
    formula: 'm(NH₃) = [n(H₂) × (2/3)] × 17.03 g/mol',
    explanation:
      '1. Relación molar: 3 mol H₂ producen 2 mol NH₃. Con 6.0 mol H₂: n(NH₃) = 6.0 × (2/3) = 4.0 moles de NH₃.\n2. Masa producida: m = 4.0 mol × 17.03 g/mol = 68.12 g de NH₃.',
    points: 35,
  },
  {
    id: 'esteq-rendimiento-porcentual',
    category: 'estequiometria',
    difficulty: 'medio',
    type: 'numeric',
    title: 'Cálculo de Rendimiento Porcentual',
    question:
      'En una reacción de laboratorio, el rendimiento teórico calculado fue de 45.0 g de aspirina. Al finalizar y purificar el producto, se obtuvieron 36.0 g reales. ¿Cuál fue el porcentaje de rendimiento (% Rendimiento)?',
    chemicalEquation: '% Rendimiento = (Rendimiento Real / Rendimiento Teórico) × 100',
    targetValue: 80.0,
    tolerance: 0.5,
    unit: '%',
    placeholder: 'Ej. 80.0',
    hint: 'Divide el rendimiento real (36.0 g) entre el rendimiento teórico (45.0 g) y multiplica por 100.',
    formula: '% = (m_real / m_teorico) × 100',
    explanation:
      '% Rendimiento = (36.0 g / 45.0 g) × 100 = 0.80 × 100 = 80.0%.',
    points: 30,
  },
  {
    id: 'esteq-reactivo-limitante',
    category: 'estequiometria',
    difficulty: 'avanzado',
    type: 'numeric',
    title: 'Reactivo Limitante - Formación de Al₂O₃',
    question:
      'Considera la reacción: 4 Al + 3 O₂ → 2 Al₂O₃. Si se ponen a reaccionar 8.0 moles de aluminio (Al) con 9.0 moles de oxígeno (O₂), ¿cuántos moles de óxido de aluminio (Al₂O₃) se pueden producir como máximo?',
    chemicalEquation: '4 Al + 3 O₂ → 2 Al₂O₃',
    targetValue: 4.0,
    tolerance: 0.1,
    unit: 'mol',
    placeholder: 'Ej. 4.0',
    hint: 'Determina cuál reactivo se agota primero. Con 8.0 mol Al: 8.0 × (2/4) = 4.0 mol Al₂O₃. Con 9.0 mol O₂: 9.0 × (2/3) = 6.0 mol Al₂O₃.',
    formula: 'n_max(Al₂O₃) = min(8.0 × 2/4, 9.0 × 2/3)',
    explanation:
      '1. Desde Al: 8.0 mol Al × (2 mol Al₂O₃ / 4 mol Al) = 4.0 mol Al₂O₃.\n2. Desde O₂: 9.0 mol O₂ × (2 mol Al₂O₃ / 3 mol O₂) = 6.0 mol Al₂O₃.\nEl aluminio (Al) es el reactivo limitante porque produce la menor cantidad (4.0 mol). Por tanto, la cantidad máxima formada es 4.0 moles.',
    points: 45,
  },

  // ==========================================
  // RETOS DE BALANCEO DE ECUACIONES
  // ==========================================
  {
    id: 'bal-combustion-metano',
    category: 'balanceo',
    difficulty: 'facil',
    type: 'coefficients',
    title: 'Balanceo: Combustión del Metano',
    question:
      'Ingresa los coeficientes enteros mínimos para balancear la ecuación de combustión del gas natural (metano).',
    chemicalEquation: '_ CH₄ + _ O₂ → _ CO₂ + _ H₂O',
    reactants: [
      { formula: 'CH₄', name: 'Metano' },
      { formula: 'O₂', name: 'Oxígeno' },
    ],
    products: [
      { formula: 'CO₂', name: 'Dióxido de carbono' },
      { formula: 'H₂O', name: 'Agua' },
    ],
    correctCoefficients: {
      reactants: [1, 2],
      products: [1, 2],
    },
    hint: 'Comienza balanceando el carbono (1 C a cada lado), luego el hidrógeno (4 H a la izquierda -> 2 H₂O), y al final el oxígeno.',
    explanation:
      '1 CH₄ + 2 O₂ → 1 CO₂ + 2 H₂O.\nÁtomos: C: 1 = 1 | H: 4 = 4 (2×2) | O: 4 (2×2) = 2 + 2 = 4.',
    points: 25,
  },
  {
    id: 'bal-sintesis-agua',
    category: 'balanceo',
    difficulty: 'facil',
    type: 'coefficients',
    title: 'Balanceo: Síntesis del Agua',
    question:
      'Balancea la reacción entre gas hidrógeno y gas oxígeno para formar vapor de agua.',
    chemicalEquation: '_ H₂ + _ O₂ → _ H₂O',
    reactants: [
      { formula: 'H₂', name: 'Hidrógeno' },
      { formula: 'O₂', name: 'Oxígeno' },
    ],
    products: [{ formula: 'H₂O', name: 'Agua' }],
    correctCoefficients: {
      reactants: [2, 1],
      products: [2],
    },
    hint: 'El oxígeno entra como O₂ (2 átomos), por lo que necesitas al menos 2 moléculas de H₂O en los productos. Eso requerirá ajustar el H₂.',
    explanation:
      '2 H₂ + 1 O₂ → 2 H₂O.\nÁtomos: H: 4 (2×2) = 4 (2×2) | O: 2 (1×2) = 2 (2×1).',
    points: 20,
  },
  {
    id: 'bal-haber-bosch',
    category: 'balanceo',
    difficulty: 'facil',
    type: 'coefficients',
    title: 'Balanceo: Proceso Haber-Bosch',
    question:
      'Ingresa los coeficientes mínimos para balancear la síntesis industrial de amoníaco a partir de nitrógeno e hidrógeno.',
    chemicalEquation: '_ N₂ + _ H₂ → _ NH₃',
    reactants: [
      { formula: 'N₂', name: 'Nitrógeno molecular' },
      { formula: 'H₂', name: 'Hidrógeno molecular' },
    ],
    products: [{ formula: 'NH₃', name: 'Amoníaco' }],
    correctCoefficients: {
      reactants: [1, 3],
      products: [2],
    },
    hint: 'Tienes 2 N a la izquierda, por lo que necesitas 2 NH₃ a la derecha. Luego ajusta los 6 H resultantes con el coeficiente de H₂.',
    explanation:
      '1 N₂ + 3 H₂ → 2 NH₃.\nÁtomos: N: 2 = 2 | H: 6 (3×2) = 6 (2×3).',
    points: 20,
  },
  {
    id: 'bal-combustion-propano',
    category: 'balanceo',
    difficulty: 'medio',
    type: 'coefficients',
    title: 'Balanceo: Combustión Completa del Propano',
    question:
      'Balancea la ecuación de combustión completa del gas propano (C₃H₈).',
    chemicalEquation: '_ C₃H₈ + _ O₂ → _ CO₂ + _ H₂O',
    reactants: [
      { formula: 'C₃H₈', name: 'Propano' },
      { formula: 'O₂', name: 'Oxígeno' },
    ],
    products: [
      { formula: 'CO₂', name: 'Dióxido de carbono' },
      { formula: 'H₂O', name: 'Agua' },
    ],
    correctCoefficients: {
      reactants: [1, 5],
      products: [3, 4],
    },
    hint: 'Balancea en orden: 1) Carbono (3 CO₂), 2) Hidrógeno (8 H -> 4 H₂O), 3) Oxígeno total en productos (3×2 + 4×1 = 10 O -> 5 O₂).',
    explanation:
      '1 C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O.\nÁtomos: C: 3 = 3 | H: 8 = 8 (4×2) | O: 10 (5×2) = 6 + 4 = 10.',
    points: 35,
  },
  {
    id: 'bal-descomposicion-kclo3',
    category: 'balanceo',
    difficulty: 'medio',
    type: 'coefficients',
    title: 'Balanceo: Descomposición de Clorato de Potasio',
    question:
      'El clorato de potasio se descompone térmicamente en cloruro de potasio y oxígeno gaseoso. Encuentra los coeficientes correctos.',
    chemicalEquation: '_ KClO₃ → _ KCl + _ O₂',
    reactants: [{ formula: 'KClO₃', name: 'Clorato de potasio' }],
    products: [
      { formula: 'KCl', name: 'Cloruro de potasio' },
      { formula: 'O₂', name: 'Oxígeno molecular' },
    ],
    correctCoefficients: {
      reactants: [2],
      products: [2, 3],
    },
    hint: 'Observa que en los reactivos hay 3 átomos de O por KClO₃ y en los productos hay O₂ (pares). El mínimo común múltiplo entre 3 y 2 es 6.',
    explanation:
      '2 KClO₃ → 2 KCl + 3 O₂.\nÁtomos: K: 2 = 2 | Cl: 2 = 2 | O: 6 (2×3) = 6 (3×2).',
    points: 35,
  },
  {
    id: 'bal-herrumbre-hierro',
    category: 'balanceo',
    difficulty: 'medio',
    type: 'coefficients',
    title: 'Balanceo: Oxidación del Hierro (Herrumbre)',
    question:
      'El hierro reacciona con el oxígeno del aire formando óxido férrico (Fe₂O₃). Balancea la reacción.',
    chemicalEquation: '_ Fe + _ O₂ → _ Fe₂O₃',
    reactants: [
      { formula: 'Fe', name: 'Hierro' },
      { formula: 'O₂', name: 'Oxígeno' },
    ],
    products: [{ formula: 'Fe₂O₃', name: 'Óxido de hierro (III)' }],
    correctCoefficients: {
      reactants: [4, 3],
      products: [2],
    },
    hint: 'Busca el mínimo común múltiplo para el oxígeno: O₂ (2) y Fe₂O₃ (3) dan 6 oxígenos (3 O₂ y 2 Fe₂O₃). Luego balancea el Fe.',
    explanation:
      '4 Fe + 3 O₂ → 2 Fe₂O₃.\nÁtomos: Fe: 4 = 4 (2×2) | O: 6 (3×2) = 6 (2×3).',
    points: 35,
  },
  {
    id: 'bal-termita',
    category: 'balanceo',
    difficulty: 'avanzado',
    type: 'coefficients',
    title: 'Balanceo: Reacción Termita',
    question:
      'La reacción termita es altamente exotérmica y se utiliza en soldadura de rieles: el aluminio desplaza al hierro en el óxido de hierro (III).',
    chemicalEquation: '_ Al + _ Fe₂O₃ → _ Al₂O₃ + _ Fe',
    reactants: [
      { formula: 'Al', name: 'Aluminio' },
      { formula: 'Fe₂O₃', name: 'Óxido de hierro (III)' },
    ],
    products: [
      { formula: 'Al₂O₃', name: 'Óxido de aluminio' },
      { formula: 'Fe', name: 'Hierro metálico' },
    ],
    correctCoefficients: {
      reactants: [2, 1],
      products: [1, 2],
    },
    hint: 'Observa que el oxígeno ya está balanceado (3 O en reactivos y 3 O en productos). Solo necesitas balancear los metales Al y Fe.',
    explanation:
      '2 Al + 1 Fe₂O₃ → 1 Al₂O₃ + 2 Fe.\nÁtomos: Al: 2 = 2 | Fe: 2 = 2 | O: 3 = 3.',
    points: 40,
  },
  {
    id: 'bal-fotosintesis-inversa',
    category: 'balanceo',
    difficulty: 'avanzado',
    type: 'coefficients',
    title: 'Balanceo: Combustión Celular de la Glucosa',
    question:
      'Balancea la ecuación de la respiración celular / combustión de la glucosa (C₆H₁₂O₆).',
    chemicalEquation: '_ C₆H₁₂O₆ + _ O₂ → _ CO₂ + _ H₂O',
    reactants: [
      { formula: 'C₆H₁₂O₆', name: 'Glucosa' },
      { formula: 'O₂', name: 'Oxígeno' },
    ],
    products: [
      { formula: 'CO₂', name: 'Dióxido de carbono' },
      { formula: 'H₂O', name: 'Agua' },
    ],
    correctCoefficients: {
      reactants: [1, 6],
      products: [6, 6],
    },
    hint: 'Balancea C primero (6 CO₂), luego H (12 H -> 6 H₂O). Suma los O de productos (12 + 6 = 18). Como la glucosa ya tiene 6 O, faltan 12 O que provienen de 6 O₂.',
    explanation:
      '1 C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O.\nÁtomos: C: 6 = 6 | H: 12 = 12 (6×2) | O: 6 + 12 = 18 = 12 + 6 = 18.',
    points: 50,
  },
];

// ==========================================
// GENERADOR PROCEDIMENTAL DE RETOS DINÁMICOS
// Genera retos con números aleatorios infinitos
// ==========================================

export function generateDynamicChallenge(
  category?: ChallengeCategory,
  difficulty?: ChallengeDifficulty
): Challenge {
  const chosenCategory: ChallengeCategory =
    category || (['gases', 'estequiometria', 'balanceo'][Math.floor(Math.random() * 3)] as ChallengeCategory);

  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randFloat = (min: number, max: number, decimals: number = 2) => {
    const factor = Math.pow(10, decimals);
    return Math.round((Math.random() * (max - min) + min) * factor) / factor;
  };

  const id = `dynamic-${chosenCategory}-${Date.now()}-${randInt(100, 999)}`;

  if (chosenCategory === 'gases') {
    const gasType = randInt(1, 3);

    if (gasType === 1) {
      // Procedural Boyle
      const p1 = randFloat(1.0, 5.0, 1);
      const v1 = randFloat(2.0, 10.0, 1);
      const v2 = randFloat(1.0, 6.0, 1);
      const p2 = Math.round(((p1 * v1) / v2) * 100) / 100;

      return {
        id,
        category: 'gases',
        difficulty: difficulty || 'facil',
        type: 'numeric',
        title: 'Desafío Dinámico: Ley de Boyle',
        question: `Un cilindro contiene un gas a una presión de ${p1} atm ocupando un volumen de ${v1} L. Manteniendo la temperatura constante, el émbolo se desplaza hasta que el volumen es de ${v2} L. ¿Cuál es la nueva presión del gas en atm?`,
        chemicalEquation: 'P₁ · V₁ = P₂ · V₂',
        targetValue: p2,
        tolerance: 0.1,
        unit: 'atm',
        placeholder: `Ej. ${p2}`,
        hint: 'Aplica P₂ = (P₁ · V₁) / V₂ con los valores dados.',
        formula: 'P₂ = (P₁ · V₁) / V₂',
        explanation: `P₂ = (${p1} atm × ${v1} L) / ${v2} L = ${p2} atm.`,
        points: 25,
      };
    } else if (gasType === 2) {
      // Procedural Charles
      const v1 = randInt(200, 800); // mL
      const t1C = randInt(10, 40); // °C
      const t2C = randInt(50, 120); // °C
      const t1K = t1C + 273.15;
      const t2K = t2C + 273.15;
      const v2 = Math.round((v1 * (t2K / t1K)) * 10) / 10;

      return {
        id,
        category: 'gases',
        difficulty: difficulty || 'medio',
        type: 'numeric',
        title: 'Desafío Dinámico: Ley de Charles',
        question: `Una masa de gas ocupa ${v1} mL a ${t1C} °C. Si se expande a presión constante calentándose hasta ${t2C} °C, ¿cuál será el nuevo volumen en mL?`,
        chemicalEquation: 'V₁ / T₁ = V₂ / T₂',
        targetValue: v2,
        tolerance: 2.0,
        unit: 'mL',
        placeholder: `Ej. ${v2}`,
        hint: `Convierte las temperaturas a Kelvin: T₁ = ${t1C} + 273.15 = ${t1K.toFixed(1)} K; T₂ = ${t2C} + 273.15 = ${t2K.toFixed(1)} K. Luego V₂ = V₁ · (T₂ / T₁).`,
        formula: 'V₂ = V₁ · (T₂ / T₁)',
        explanation: `1. T₁ = ${t1K.toFixed(2)} K, T₂ = ${t2K.toFixed(2)} K.\n2. V₂ = ${v1} mL × (${t2K.toFixed(2)} / ${t1K.toFixed(2)}) = ${v2} mL.`,
        points: 30,
      };
    } else {
      // Procedural Ideal Gas Law (PV = nRT)
      const n = randFloat(0.2, 2.5, 2);
      const v = randFloat(5.0, 25.0, 1);
      const tK = randInt(280, 360);
      const R = 0.0821;
      const p = Math.round(((n * R * tK) / v) * 100) / 100;

      return {
        id,
        category: 'gases',
        difficulty: difficulty || 'medio',
        type: 'numeric',
        title: 'Desafío Dinámico: Gas Ideal (Presión)',
        question: `Calcula la presión en atm ejercida por ${n} moles de un gas confinado en un tanque de ${v} L a una temperatura de ${tK} K. (Usa R = 0.0821 atm·L/mol·K).`,
        chemicalEquation: 'P · V = n · R · T',
        targetValue: p,
        tolerance: 0.1,
        unit: 'atm',
        placeholder: `Ej. ${p}`,
        hint: 'Despeja la presión: P = (n · R · T) / V.',
        formula: 'P = (n · R · T) / V',
        explanation: `P = (${n} mol × 0.0821 atm·L/mol·K × ${tK} K) / ${v} L = ${p} atm.`,
        points: 35,
      };
    }
  } else if (chosenCategory === 'estequiometria') {
    const esteqType = randInt(1, 3);

    if (esteqType === 1) {
      // Procedural mass to moles
      const compounds = [
        { name: 'dióxido de carbono (CO₂)', formula: 'CO₂', mm: 44.01 },
        { name: 'cloruro de sodio (NaCl)', formula: 'NaCl', mm: 58.44 },
        { name: 'ácido sulfúrico (H₂SO₄)', formula: 'H₂SO₄', mm: 98.08 },
        { name: 'glucosa (C₆H₁₂O₆)', formula: 'C₆H₁₂O₆', mm: 180.16 },
        { name: 'metano (CH₄)', formula: 'CH₄', mm: 16.04 },
      ];
      const comp = compounds[randInt(0, compounds.length - 1)];
      const moles = randFloat(0.5, 4.0, 2);
      const grams = Math.round(moles * comp.mm * 100) / 100;

      return {
        id,
        category: 'estequiometria',
        difficulty: difficulty || 'facil',
        type: 'numeric',
        title: `Desafío Dinámico: Moles de ${comp.formula}`,
        question: `¿Cuántos moles de ${comp.name} hay en una muestra que pesa ${grams} gramos? (Masa molar de ${comp.formula} = ${comp.mm} g/mol).`,
        chemicalEquation: 'n = m / M',
        targetValue: moles,
        tolerance: 0.05,
        unit: 'mol',
        placeholder: `Ej. ${moles}`,
        hint: `Divide la masa en gramos (${grams} g) entre la masa molar (${comp.mm} g/mol).`,
        formula: 'n = m / M',
        explanation: `n = ${grams} g / ${comp.mm} g/mol = ${moles} mol de ${comp.formula}.`,
        points: 25,
      };
    } else if (esteqType === 2) {
      // Procedural percent yield
      const theoretical = randFloat(20.0, 90.0, 1);
      const percent = randInt(65, 95);
      const actual = Math.round((theoretical * (percent / 100)) * 10) / 10;

      return {
        id,
        category: 'estequiometria',
        difficulty: difficulty || 'medio',
        type: 'numeric',
        title: 'Desafío Dinámico: % de Rendimiento',
        question: `En una síntesis orgánica, el rendimiento teórico calculado fue de ${theoretical} g. Tras filtrar y secar el precipitado se obtuvieron ${actual} g reales. ¿Cuál es el porcentaje de rendimiento?`,
        chemicalEquation: '% Rendimiento = (m_real / m_teórico) × 100',
        targetValue: percent,
        tolerance: 1.0,
        unit: '%',
        placeholder: `Ej. ${percent}`,
        hint: 'Divide el rendimiento real entre el teórico y multiplica por 100.',
        formula: '% = (m_real / m_teorico) × 100',
        explanation: `% Rendimiento = (${actual} g / ${theoretical} g) × 100 ≈ ${percent}%.`,
        points: 30,
      };
    } else {
      // Procedural moles to moles in Haber-Bosch
      const nH2 = randInt(3, 15);
      const nNH3 = Math.round(((nH2 * 2) / 3) * 100) / 100;

      return {
        id,
        category: 'estequiometria',
        difficulty: difficulty || 'medio',
        type: 'numeric',
        title: 'Desafío Dinámico: Relación Molar N₂ + 3 H₂ → 2 NH₃',
        question: `En la reacción balanceada N₂ + 3 H₂ → 2 NH₃, ¿cuántos moles de amoníaco (NH₃) se formarán si reaccionan por completo ${nH2} moles de H₂ con exceso de N₂?`,
        chemicalEquation: 'N₂ + 3 H₂ → 2 NH₃',
        targetValue: nNH3,
        tolerance: 0.1,
        unit: 'mol',
        placeholder: `Ej. ${nNH3}`,
        hint: `Usa el factor estequiométrico: por cada 3 moles de H₂ se generan 2 moles de NH₃. Multiplica ${nH2} por (2/3).`,
        formula: 'n(NH₃) = n(H₂) × (2 mol NH₃ / 3 mol H₂)',
        explanation: `n(NH₃) = ${nH2} mol H₂ × (2 / 3) = ${nNH3} moles de NH₃.`,
        points: 30,
      };
    }
  } else {
    // Balancing challenge chosen from curated balancing set
    const balancingList = CURATED_CHALLENGES.filter(
      (c) => c.category === 'balanceo'
    ) as BalancingChallenge[];
    const pick = balancingList[randInt(0, balancingList.length - 1)];
    return {
      ...pick,
      id,
    };
  }
}

/**
 * Obtener un reto aleatorio respetando filtros opcionales de categoría y dificultad
 */
export function getRandomChallenge(
  categoryFilter?: ChallengeCategory | 'all',
  difficultyFilter?: ChallengeDifficulty | 'all'
): Challenge {
  let pool = CURATED_CHALLENGES;

  if (categoryFilter && categoryFilter !== 'all') {
    pool = pool.filter((c) => c.category === categoryFilter);
  }

  if (difficultyFilter && difficultyFilter !== 'all') {
    pool = pool.filter((c) => c.difficulty === difficultyFilter);
  }

  // Si la piscina tiene retos y con un 60% de probabilidad o si pool está vacío, usar o generar
  if (pool.length > 0 && Math.random() < 0.65) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  // Generar dinámico
  const targetCategory = categoryFilter !== 'all' ? categoryFilter : undefined;
  const targetDiff = difficultyFilter !== 'all' ? difficultyFilter : undefined;
  return generateDynamicChallenge(targetCategory, targetDiff);
}
