import type { Flashcard } from '../types';

export const flashcardsData: Flashcard[] = [
  // Módulo 1
  {
    id: 'fc-1-1',
    moduleId: 1,
    category: 'Materia y Energía',
    front: '¿Cuál es la diferencia entre evaporación y ebullición?',
    back: 'La evaporación ocurre solo en la superficie del líquido a cualquier temperatura; la ebullición ocurre en toda la masa del líquido a una temperatura fija (punto de ebullición) cuando la presión de vapor iguala la presión externa.'
  },
  {
    id: 'fc-1-2',
    moduleId: 1,
    category: 'Clasificación',
    front: '¿Qué distingue a una sustancia pura de una mezcla?',
    back: 'Una sustancia pura tiene composición química fija e invariable y se separa solo por métodos químicos. Una mezcla tiene proporción variable y sus componentes se separan físicamente.'
  },
  {
    id: 'fc-1-3',
    moduleId: 1,
    category: 'Métodos de Separación',
    front: '¿En qué principio físico se basa la destilación fraccionada?',
    back: 'En la diferencia entre los puntos de ebullición de líquidos miscibles, utilizando una columna de fraccionamiento para múltiples condensaciones sucesivas.'
  },
  {
    id: 'fc-1-4',
    moduleId: 1,
    category: 'Unidades SI',
    front: '¿Cómo se convierte una temperatura de Celsius (°C) a Kelvin (K)?',
    formula: 'T(K) = T(°C) + 273.15',
    back: 'Sumando exactamente 273.15 a la temperatura en grados Celsius. La escala Kelvin no tiene valores negativos (cero absoluto = 0 K).'
  },

  // Módulo 2
  {
    id: 'fc-2-1',
    moduleId: 2,
    category: 'Estructura Atómica',
    front: '¿Qué información indican el número atómico (Z) y el número másico (A)?',
    formula: 'A = Z + N',
    back: 'Z indica el número de protones nucleares (define el elemento). A indica la suma total de protones y neutrones en el núcleo.'
  },
  {
    id: 'fc-2-2',
    moduleId: 2,
    category: 'Configuración Electrónica',
    front: '¿Qué enuncia el Principio de Exclusión de Pauli?',
    back: 'En un mismo átomo no pueden existir dos electrones con los cuatro números cuánticos (n, l, ml, ms) idénticos. Cada orbital alberga como máximo 2 electrones con espines opuestos.'
  },
  {
    id: 'fc-2-3',
    moduleId: 2,
    category: 'Propiedades Periódicas',
    front: '¿Cómo varía la Electronegatividad en la Tabla Periódica?',
    back: 'Aumenta de izquierda a derecha a lo largo de un período y disminuye hacia abajo en un grupo. El Flúor (F) es el más electronegativo (4.0).'
  },
  {
    id: 'fc-2-4',
    moduleId: 2,
    category: 'Modelos Atómicos',
    front: '¿Cuál fue el descubrimiento clave del experimento de la lámina de oro de Rutherford?',
    back: 'Descubrió que el átomo tiene un núcleo diminuto, central y masivo con carga positiva, y que la gran mayoría del átomo es espacio vacío.'
  },

  // Módulo 3
  {
    id: 'fc-3-1',
    moduleId: 3,
    category: 'Enlaces Químicos',
    front: '¿Cuándo se considera un enlace como predominantemente iónico según Pauling?',
    back: 'Cuando la diferencia de electronegatividad entre los dos átomos enlazados es igual o mayor a 1.7 (ΔEN ≥ 1.7).'
  },
  {
    id: 'fc-3-2',
    moduleId: 3,
    category: 'Estructuras de Lewis',
    front: '¿Qué es el octeto expandido y qué elementos pueden presentarlo?',
    back: 'Es la capacidad de albergar más de 8 electrones de valencia en el átomo central. Ocurre en elementos del período 3 en adelante (como P, S, Cl, Xe) gracias a sus orbitales "d" vacíos de baja energía.'
  },
  {
    id: 'fc-3-3',
    moduleId: 3,
    category: 'Nomenclatura Inorgánica',
    front: '¿Cuál es la fórmula del Ácido Sulfúrico y del Sulfato de Sodio?',
    back: 'Ácido sulfúrico: H₂SO₄. Sulfato de sodio: Na₂SO₄ (formado por dos cationes Na⁺ y un oxianión SO₄²⁻).'
  },
  {
    id: 'fc-3-4',
    moduleId: 3,
    category: 'Número de Oxidación',
    front: '¿Cuáles son las reglas para el estado de oxidación del Oxígeno y del Hidrógeno?',
    back: 'El Oxígeno casi siempre es -2 (excepto en peróxidos como H₂O₂ donde es -1, y en OF₂ donde es +2). El Hidrógeno es +1 con no metales y -1 con metales (hidruros).'
  },

  // Módulo 4
  {
    id: 'fc-4-1',
    moduleId: 4,
    category: 'Estequiometría',
    front: '¿Qué es el Número de Avogadro y qué representa?',
    formula: 'N_A = 6.022 × 10²³ partículas/mol',
    back: 'Es la cantidad de partículas fundamentales (átomos, moléculas, fórmulas unitarias) presentes exactamente en 1 mol de cualquier sustancia pura.'
  },
  {
    id: 'fc-4-2',
    moduleId: 4,
    category: 'Reacciones Químicas',
    front: 'En una reacción redox, ¿qué experimenta el "agente reductor"?',
    back: 'El agente reductor se OXIDA: cede electrones a otra especie, provocando su reducción y aumentando su propio número de oxidación.'
  },
  {
    id: 'fc-4-3',
    moduleId: 4,
    category: 'Reactivo Limitante',
    front: '¿Cómo se determina matemáticamente cuál es el reactivo limitante?',
    back: 'Se calculan los moles disponibles de cada reactivo y se dividen entre su respectivo coeficiente estequiométrico en la ecuación balanceada. El reactivo con el menor cociente es el limitante.'
  },
  {
    id: 'fc-4-4',
    moduleId: 4,
    category: 'Rendimiento',
    front: '¿Cuál es la fórmula del porcentaje de rendimiento?',
    formula: '% Rendimiento = (Rendimiento Real / Rendimiento Teórico) × 100%',
    back: 'Divide la masa de producto obtenida en la práctica entre la masa máxima calculada por estequiometría y multiplícala por 100.'
  },

  // Módulo 5
  {
    id: 'fc-5-1',
    moduleId: 5,
    category: 'Gases Ideales',
    front: '¿Cuál es la Ecuación del Gas Ideal y qué valor tiene la constante R?',
    formula: 'P · V = n · R · T',
    back: 'Presión en atm, Volumen en L, n en moles, T en Kelvin. La constante R vale 0.08206 atm·L/(mol·K) o 8.314 J/(mol·K).'
  },
  {
    id: 'fc-5-2',
    moduleId: 5,
    category: 'Fuerzas Intermoleculares',
    front: '¿Qué condiciones son necesarias para la formación de puentes de hidrógeno?',
    back: 'El hidrógeno debe estar unido covalentemente a un átomo altamente electronegativo y de pequeño tamaño: Flúor (F), Oxígeno (O) o Nitrógeno (N).'
  },
  {
    id: 'fc-5-3',
    moduleId: 5,
    category: 'Disoluciones',
    front: '¿Qué diferencia hay entre Molaridad (M) y Molalidad (m)?',
    back: 'La Molaridad (M) es moles de soluto por litro de disolución total (mol/L) y cambia con la temperatura. La Molalidad (m) es moles de soluto por kilogramo de disolvente puro (mol/kg) y es independiente de la temperatura.'
  },
  {
    id: 'fc-5-4',
    moduleId: 5,
    category: 'Ácidos y Bases',
    front: '¿Cómo se define el pH y cuál es el producto iónico del agua (Kw)?',
    formula: 'pH = -log[H⁺]  |  Kw = [H⁺][OH⁻] = 10⁻¹⁴',
    back: 'El pH es el logaritmo negativo de la concentración molar de protones. A 25 °C, pH + pOH = 14.'
  },

  // Módulo 6
  {
    id: 'fc-6-1',
    moduleId: 6,
    category: 'Termodinámica',
    front: '¿Qué predice el signo de la Energía Libre de Gibbs (ΔG)?',
    formula: 'ΔG = ΔH - T · ΔS',
    back: 'ΔG < 0: Reacción espontánea. ΔG > 0: Reacción no espontánea (espontánea en reversa). ΔG = 0: Sistema en equilibrio dinámico.'
  },
  {
    id: 'fc-6-2',
    moduleId: 6,
    category: 'Cinética',
    front: '¿Cómo afecta la temperatura a la velocidad de reacción según Arrhenius?',
    back: 'Un aumento de temperatura incrementa la energía cinética de las moléculas, aumentando la frecuencia de colisiones y la proporción de choque con energía mayor o igual a la energía de activación (Ea).'
  },
  {
    id: 'fc-6-3',
    moduleId: 6,
    category: 'Equilibrio Químico',
    front: '¿Cómo responde un sistema en equilibrio ante un aumento de presión según Le Chatelier?',
    back: 'El equilibrio se desplaza en la dirección que produce MENOR número total de moles de especies gaseosas para amortiguar el aumento de presión.'
  },
  {
    id: 'fc-6-4',
    moduleId: 6,
    category: 'Electroquímica',
    front: '¿Qué ocurre en el ánodo y en el cátodo de una celda galvánica?',
    back: 'Regla mnemotécnica AnOx / RedCat: En el Ánodo siempre ocurre la Oxidación (libera e⁻), y en el Cátodo siempre ocurre la Reducción (gana e⁻).'
  },

  // Módulo 7
  {
    id: 'fc-7-1',
    moduleId: 7,
    category: 'Hidrocarburos',
    front: '¿Cuál es la fórmula general de los alcanos, alquenos y alquinos?',
    formula: 'Alcanos: C_n H_{2n+2} | Alquenos: C_n H_{2n} | Alquinos: C_n H_{2n-2}',
    back: 'Alcanos tienen enlaces simples saturados; alquenos contienen al menos un doble enlace (insaturados); alquinos contienen al menos un triple enlace.'
  },
  {
    id: 'fc-7-2',
    moduleId: 7,
    category: 'Grupos Funcionales',
    front: '¿Cuál es la diferencia estructural entre un aldehído y una cetona?',
    back: 'Ambos tienen grupo carbonilo (C=O). En el aldehído el carbonilo es terminal (-CHO, unido al menos a un H); en la cetona el carbonilo es interno (unido a dos carbonos R-CO-R).'
  },
  {
    id: 'fc-7-3',
    moduleId: 7,
    category: 'Biomoléculas',
    front: '¿Qué es el enlace peptídico y qué monómeros une?',
    back: 'Es un enlace amida covalente formado por reacción de condensación entre el grupo carboxilo (-COOH) de un aminoácido y el grupo amino (-NH₂) de otro, formando proteínas.'
  },
  {
    id: 'fc-7-4',
    moduleId: 7,
    category: 'Ácidos Nucleicos',
    front: '¿Cuáles son las 3 diferencias clave entre ADN y ARN?',
    back: '1) Azúcar: desoxirribosa en ADN vs ribosa en ARN. 2) Bases: Timina en ADN vs Uracilo en ARN. 3) Estructura: Doble hélice en ADN vs hebra simple en ARN.'
  }
];
