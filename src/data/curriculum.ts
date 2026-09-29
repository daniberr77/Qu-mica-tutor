import type { ModuleData } from '../types';

export const modulesData: ModuleData[] = [
  {
    id: 1,
    slug: 'conceptos-basicos-y-materia',
    title: '1. Conceptos Básicos y Materia',
    subtitle: 'Propiedades de la materia, estados de agregación, mezclas y unidades SI',
    iconName: 'Boxes',
    color: 'emerald',
    subtopics: [
      {
        id: '1-1',
        title: 'Materia y energía',
        summary: 'Definición de masa, volumen, estados de agregación (sólido, líquido, gas, plasma) y cambios de fase.',
        keyPoints: [
          'Masa: Cantidad de materia que posee un cuerpo (unidad fundamental SI: kg).',
          'Volumen: Espacio tridimensional que ocupa un cuerpo (unidad SI: m³ o L).',
          'Sólido: Forma y volumen definidos; partículas fuertemente cohesionadas en red fija.',
          'Líquido: Volumen constante, forma variable adoptando la del recipiente; partículas con movilidad.',
          'Gas: Forma y volumen indefinidos; partículas muy separadas con alta energía cinética.',
          'Plasma: Gas ionizado a altas temperaturas con electrones libres e iones positivos (ej. el Sol, lámparas de plasma).',
          'Cambios de fase: Fusión (S→L), Solidificación (L→S), Evaporación/Ebullición (L→G), Condensación (G→L), Sublimación progresiva (S→G) y Sublimación regresiva o Deposición (G→S).'
        ],
        formulas: [
          'Densidad (ρ): ρ = m / V  (kg/m³ o g/cm³)',
          'Ley de conservación de la masa (Lavoisier): La materia no se crea ni se destruye, solo se transforma.'
        ],
        content: `### La Materia y sus Transformaciones

La materia es todo aquello que tiene **masa** y ocupa un lugar en el espacio (**volumen**). La energía es la capacidad para realizar un trabajo o transferir calor.

#### Estados de Agregación:
1. **Sólido**: Cohesión intermolecular muy alta. Estructura ordenada, baja compresibilidad.
2. **Líquido**: Cohesión media. Fluyen, adoptan la forma del contenedor pero mantienen su volumen.
3. **Gas**: Cohesión prácticamente nula. Se expanden hasta llenar todo el volumen disponible.
4. **Plasma**: Estado de alta energía en el que los átomos se despojan de sus electrones, formando un fluido de cargas libres.

#### Diagrama de Cambios de Fase:
* **Fusión**: Sólido a Líquido (absorbe calor, endotérmico).
* **Solidificación / Congelación**: Líquido a Sólido (libera calor, exotérmico).
* **Vaporización / Ebullición**: Líquido a Gas.
* **Condensación / Licuefacción**: Gas a Líquido.
* **Sublimación**: Sólido directamente a Gas sin pasar por líquido (ej. hielo seco, yodo).
* **Deposición / Sublimación Inversa**: Gas a Sólido (ej. formación de escarcha).`,
        examples: [
          {
            problem: 'Un bloque de metal tiene una masa de 312 g y un volumen de 40 cm³. ¿Cuál es su densidad e identifica de qué metal podría tratarse?',
            solution: 'ρ = m / V = 312 g / 40 cm³ = 7.8 g/cm³',
            explanation: 'La densidad obtenida (7.8 g/cm³) coincide aproximadamente con la densidad del hierro (Fe).'
          }
        ]
      },
      {
        id: '1-2',
        title: 'Clasificación de la Materia',
        summary: 'Sustancias puras (elementos y compuestos) frente a mezclas homogéneas y heterogéneas.',
        keyPoints: [
          'Sustancia pura: Composición química fija y propiedades características definidas.',
          'Elemento: Formado por un solo tipo de átomo; no puede descomponerse por métodos químicos (ej. O₂, Fe, Au).',
          'Compuesto: Unión química de dos o más elementos en proporciones fijas; se descompone solo por métodos químicos (ej. H₂O, NaCl, C₆H₁₂O₆).',
          'Mezcla: Combinación física de dos o más sustancias que conservan sus identidades.',
          'Mezcla homogénea (Solución): Presenta una sola fase uniforme (ej. aire limpio, salmuera, aleaciones como el bronce).',
          'Mezcla heterogénea: Presenta dos o más fases distinguibles a simple vista o al microscopio (ej. agua con aceite, granito, emulsiones, suspensiones).'
        ],
        formulas: [],
        content: `### Clasificación Sistemática

Toda materia puede clasificarse según su pureza y homogeneidad:

* **Sustancias Puras**:
  * **Elementos**: Registrados en la Tabla Periódica. Átomos con igual número atómico.
  * **Compuestos**: Combinaciones estequiométricas fijas. Por ejemplo, en el agua pura ($H_2O$), la relación de masa de hidrógeno a oxígeno siempre es 1:8.

* **Mezclas**:
  * **Homogéneas**: Cada porción tiene exactamente la misma concentración y propiedades físicas. Las partículas son de escala molecular (< 1 nm).
  * **Heterogéneas**: Composición no uniforme. Se dividen en suspensiones (sedimentan por gravedad) y coloides (efecto Tyndall visible, partículas de 1 nm a 1000 nm).`,
        examples: [
          {
            problem: 'Clasifica: (a) Bronce, (b) Cloruro de sodio, (c) Agua turbia de río, (d) Gas helio en un globo.',
            solution: '(a) Mezcla homogénea (aleación Cu-Sn), (b) Sustancia pura compuesta, (c) Mezcla heterogénea (suspensión), (d) Sustancia pura elemental.',
            explanation: 'El bronce no tiene enlaces estequiométricos fijos entre cobre y estaño; el cloruro de sodio es NaCl con fórmula fija.'
          }
        ]
      },
      {
        id: '1-3',
        title: 'Métodos de Separación de Mezclas',
        summary: 'Filtración, destilación, decantación y evaporación.',
        keyPoints: [
          'Filtración: Separa sólidos insolubles suspendidos en un líquido utilizando una barrera porosa (filtro).',
          'Destilación: Separa líquidos miscibles con diferentes puntos de ebullición mediante vaporización y condensación controlada.',
          'Decantación: Separa mezclas heterogéneas por diferencia de densidad (líquido-líquido inmiscible con embudo o sólido-líquido por sedimentación).',
          'Evaporación / Cristalización: Separa un soluto sólido disuelto en un solvente líquido evaporando el solvente.',
          'Cromatografía: Separa componentes según su afinidad diferencial entre una fase estacionaria y una fase móvil.'
        ],
        formulas: [],
        content: `### Métodos Físicos de Separación

Los componentes de una mezcla no están unidos químicamente, por lo que pueden separarse aprovechando diferencias en sus propiedades físicas:

1. **Filtración**:
   * Fundamento: Diferencia de tamaño de partícula.
   * Aplicación típica: Arena en agua, precipitados químicos en laboratorio.
2. **Destilación**:
   * Destilación simple: Para diferencias de punto de ebullición > 25 °C (ej. agua y alcohol).
   * Destilación fraccionada: Para puntos de ebullición muy cercanos (ej. refinación del petróleo).
3. **Decantación**:
   * Fundamento: Diferencia de densidad e inmiscibilidad.
   * Dispositivo: Embudo de decantación para separar agua y aceite.
4. **Evaporación**:
   * Fundamento: El solvente líquido tiene un punto de ebullición mucho menor que el soluto sólido (ej. obtención de sal marina).`,
        examples: [
          {
            problem: '¿Cómo separarías una mezcla que contiene arena, sal común (NaCl) y agua?',
            solution: '1° Filtración: retiene la arena en el papel filtro. 2° Evaporación o destilación del filtrado: el agua se evapora/condensa y queda la sal cristalizada.',
            explanation: 'Se aprovecha la insolubilidad de la arena y la solubilidad de la sal, seguido de la volatilidad del agua.'
          }
        ]
      },
      {
        id: '1-4',
        title: 'Unidades y Medidas: Sistema Internacional (SI) y Cifras Significativas',
        summary: 'El Sistema Internacional de Unidades y el manejo riguroso de cifras significativas en cálculos científicos.',
        keyPoints: [
          '7 Unidades Fundamentales SI: Longitud (m), Masa (kg), Tiempo (s), Corriente eléctrica (A), Temperatura (K), Cantidad de sustancia (mol), Intensidad luminosa (cd).',
          'Escala Kelvin: T(K) = T(°C) + 273.15.',
          'Cifras significativas: Dígitos que aportan precisión a una medición.',
          'Regla de ceros: Los ceros a la izquierda NUNCA son significativos (0.0045 tiene 2 cs); ceros intermedios SIEMPRE son significativos (4005 tiene 4 cs); ceros a la derecha después del punto decimal SIEMPRE son significativos (4.500 tiene 4 cs).',
          'En multiplicación y división: El resultado conserva el menor número de cifras significativas de los factores.',
          'En suma y resta: El resultado conserva el menor número de decimales.'
        ],
        formulas: [
          'T(K) = T(°C) + 273.15',
          'T(°F) = 1.8 × T(°C) + 32'
        ],
        content: `### Medición Científica y Precisión

En química, toda cantidad numérica debe acompañarse de su unidad y del número correcto de cifras significativas para no sobreestimar la precisión experimental.

#### Reglas de Cifras Significativas:
1. Cualquier dígito distinto de cero es significativo: \`14.28\` (4 c.s.).
2. Ceros entre dígitos no nulos son significativos: \`2008\` (4 c.s.).
3. Ceros a la izquierda del primer dígito no nulo **no** son significativos: \`0.0072\` (2 c.s.).
4. Ceros finales a la derecha de la coma decimal son significativos: \`52.00\` (4 c.s.).`,
        examples: [
          {
            problem: 'Calcula el área de una lámina metálica que mide 12.4 cm de largo y 4.8 cm de ancho, respetando cifras significativas.',
            solution: '12.4 cm (3 c.s.) × 4.8 cm (2 c.s.) = 59.52 cm² → Se redondea a 60. cm² (o 6.0 × 10¹ cm²)',
            explanation: 'Como 4.8 cm tiene solo 2 cifras significativas, el resultado no puede tener más de 2 cifras significativas.'
          }
        ]
      }
    ],
    quiz: [
      {
        id: 'q1-1',
        question: '¿Qué cambio de fase ocurre cuando el hielo seco (CO₂ sólido) pasa directamente a gas sin derretirse?',
        options: ['Evaporación', 'Sublimación', 'Fusión', 'Condensación'],
        correctIndex: 1,
        explanation: 'La sublimación es la transición directa del estado sólido al gaseoso sin transitar por el estado líquido.'
      },
      {
        id: 'q1-2',
        question: '¿Cuál de los siguientes ejemplos corresponde a una mezcla homogénea?',
        options: ['Agua con aceite', 'Ensalada de frutas', 'Salmuera totalmente disuelta', 'Granito'],
        correctIndex: 2,
        explanation: 'La salmuera (cloruro de sodio en agua) forma una solución homogénea de una sola fase líquida uniforme.'
      },
      {
        id: 'q1-3',
        question: '¿Cuántas cifras significativas tiene la medición 0.004050 kg?',
        options: ['3', '4', '6', '7'],
        correctIndex: 1,
        explanation: 'Los ceros a la izquierda no cuentan; los dígitos 4, 0 intermedio, 5 y el cero final después de la coma son significativos (4 cifras: 4, 0, 5, 0).'
      }
    ],
    flashcardIds: ['fc-1-1', 'fc-1-2', 'fc-1-3', 'fc-1-4']
  },
  {
    id: 2,
    slug: 'estructura-atomica-y-tabla-periodica',
    title: '2. Estructura Atómica y Tabla Periódica',
    subtitle: 'El átomo, isótopos, modelos históricos, números cuánticos y propiedades periódicas',
    iconName: 'Atom',
    color: 'blue',
    subtopics: [
      {
        id: '2-1',
        title: 'El Átomo y Partículas Subatómicas',
        summary: 'Protones, neutrones y electrones. Número atómico (Z) y número másico (A).',
        keyPoints: [
          'Protón (p⁺): Carga positiva (+1), masa ~ 1.0073 u, ubicado en el núcleo.',
          'Neutrón (n⁰): Carga neutra (0), masa ~ 1.0087 u, ubicado en el núcleo.',
          'Electrón (e⁻): Carga negativa (-1), masa ~ 1/1836 de la masa del protón, orbita en la corteza electrónica.',
          'Número atómico (Z): Número de protones en el núcleo. Define la identidad del elemento.',
          'Número másico (A): Suma total de protones y neutrones: A = Z + N.',
          'Ión: Átomo con carga neta. Catión (+): pierde electrones; Anión (-): gana electrones.'
        ],
        formulas: [
          'A = Z + N  (donde N = número de neutrones)',
          'N = A - Z',
          'Carga = p⁺ - e⁻'
        ],
        content: `### Estructura Fundamental del Átomo

El átomo está constituido por un núcleo denso y pequeño de carga positiva rodeado por una nube difusa de electrones de carga negativa.

* **Número atómico ($Z$)**: Es la huella dactilar del átomo. Por ejemplo, todo átomo con $Z = 6$ es Carbono.
* **Número másico ($A$)**: Representa la masa nuclear en unidades de masa atómica ($u$).
* En un átomo neutro: $\\text{número de electrones} = Z$.
* En un catión $X^{2+}$: ha perdido 2 electrones ($e^- = Z - 2$).
* En un anión $Y^{3-}$: ha ganado 3 electrones ($e^- = Z + 3$).`,
        examples: [
          {
            problem: 'Determina protones, electrones y neutrones del ión de Aluminio: ²⁷₁₃Al³⁺.',
            solution: 'Z = 13 (protones = 13), A = 27 (neutrones = 27 - 13 = 14). Como tiene carga +3, electrones = 13 - 3 = 10.',
            explanation: 'El catión trivalente conserva los 13 protones nucleares pero ha cedido 3 electrones de valencia.'
          }
        ]
      },
      {
        id: '2-2',
        title: 'Isótopos',
        summary: 'Átomos de un mismo elemento con diferente número másico (distinta cantidad de neutrones).',
        keyPoints: [
          'Tienen idéntico número atómico (Z) pero diferente número másico (A).',
          'Comparten las mismas propiedades químicas (mismo número de electrones de valencia) pero difieren ligeramente en propiedades físicas (masa, densidad).',
          'Masa atómica relativa del elemento en la tabla periódica: promedio ponderado según la abundancia natural de sus isótopos.',
          'Ejemplos clásicos: Hidrógeno (Protio ¹H, Deuterio ²H, Tritio ³H); Carbono (¹²C, ¹³C, ¹⁴C radiactivo).'
        ],
        formulas: [
          'Masa atómica promedio = Σ (Masa_isótopo × %Abundancia) / 100'
        ],
        content: `### Isótopos y Masas Ponderadas

La masa registrada en la tabla periódica rara vez es un número entero exacto porque representa la media ponderada de todos los isótopos estables presentes en la naturaleza.

Ejemplo del Cloro:
* $^{35}\\text{Cl}$ (34.97 u) con abundancia del 75.77%
* $^{37}\\text{Cl}$ (36.97 u) con abundancia del 24.23%
$$\\text{Masa Cl} = \\frac{(34.97 \\times 75.77) + (36.97 \\times 24.23)}{100} = 35.45\\text{ u}$$`,
        examples: [
          {
            problem: 'Un elemento hipotético tiene dos isótopos: Isótopo-10 (10 u, 20% abundancia) e Isótopo-11 (11 u, 80% abundancia). ¿Cuál es su masa atómica promedio?',
            solution: 'Masa = (10 × 20 + 11 × 80) / 100 = (200 + 880) / 100 = 10.8 u',
            explanation: 'El resultado está más próximo a 11 u porque es el isótopo más abundante (80%).'
          }
        ]
      },
      {
        id: '2-3',
        title: 'Modelos Atómicos',
        summary: 'Evolución histórica: Dalton, Thomson, Rutherford, Bohr y el modelo cuántico ondulatorio.',
        keyPoints: [
          'Dalton (1808): Esferas indivisibles, macizas e inmutables.',
          'Thomson (1897): "Pudín de pasas" tras descubrir el electrón mediante rayos catódicos; esfera positiva con cargas negativas incrustadas.',
          'Rutherford (1911): Experimento de la lámina de oro; núcleo denso central positivo y corteza casi vacía donde orbitan electrones.',
          'Bohr (1913): Órbitas circulares cuantizadas; el electrón absorbe o emite fotones solo al saltar entre niveles específicos (E = h·ν).',
          'Modelo Cuántico Actual (Schrödinger, Heisenberg, De Broglie): Dualidad onda-partícula, principio de incertidumbre y concepto de orbital (zona de máxima probabilidad de encontrar al electrón).'
        ],
        formulas: [
          'ΔE = E₂ - E₁ = h · ν = (h · c) / λ',
          'Constante de Planck (h): 6.626 × 10⁻³⁴ J·s'
        ],
        content: `### Cronología de los Modelos Atómicos

1. **John Dalton**: La materia está formada por átomos indivisibles y homogéneos.
2. **J.J. Thomson**: Descubrimiento del electrón. El átomo es eléctricamente neutro.
3. **Ernest Rutherford**: Descubrimiento del núcleo atómico. La mayor parte del átomo es espacio vacío.
4. **Niels Bohr**: Introduce la cuantización energética. Los electrones viajan en órbitas estacionarias.
5. **Modelo Mecano-cuántico**: Erwin Schrödinger formula la ecuación de onda. No existen órbitas fijas, sino **orbitales** definidos por densidades de probabilidad.`,
        examples: []
      },
      {
        id: '2-4',
        title: 'Configuración Electrónica y Números Cuánticos',
        summary: 'Distribución de electrones en niveles, subniveles y orbitales según los principios de Aufbau, Pauli y Hund.',
        keyPoints: [
          'Número cuántico principal (n = 1, 2, 3...): Nivel de energía y tamaño del orbital.',
          'Número cuántico azimutal o momento angular (l = 0 a n-1): Forma del orbital (0=s, 1=p, 2=d, 3=f).',
          'Número cuántico magnético (ml = -l a +l): Orientación espacial del orbital.',
          'Número cuántico de espín (ms = +1/2 o -1/2): Giro intrínseco del electrón.',
          'Principio de Aufbau: Los electrones llenan primero los orbitales de menor energía (regla de las diagonales / n+l).',
          'Principio de exclusión de Pauli: Dos electrones en un mismo átomo no pueden tener los cuatro números cuánticos idénticos (máx. 2 electrones con espines opuestos por orbital).',
          'Regla de Hund: En orbitales de igual energía (degenerados), los electrones se distribuyen con espines paralelos antes de aparearse.'
        ],
        formulas: [
          'Capacidad máxima de electrones por nivel = 2n²',
          'Capacidad por subnivel: s (2 e⁻), p (6 e⁻), d (10 e⁻), f (14 e⁻)'
        ],
        content: `### Números Cuánticos y Configuración Electrónica

Los cuatro números cuánticos determinan unívocamente el estado de un electrón en un átomo:

| Cuántico | Símbolo | Valores posibles | Significado físico |
|---|---|---|---|
| Principal | $n$ | $1, 2, 3, 4, ...$ | Nivel de energía y distancia al núcleo |
| Azimutal | $l$ | $0, 1, ..., n-1$ | Forma del orbital: $s(0), p(1), d(2), f(3)$ |
| Magnético | $m_l$ | $-l, ..., 0, ..., +l$ | Orientación en el espacio tridimensional |
| Espín | $m_s$ | $+1/2, -1/2$ | Sentido de rotación electromagnética |

#### Regla de las Diagonales:
Secuencia: $1s \\rightarrow 2s \\rightarrow 2p \\rightarrow 3s \\rightarrow 3p \\rightarrow 4s \\rightarrow 3d \\rightarrow 4p \\rightarrow 5s \\rightarrow 4d \\dots$`,
        examples: [
          {
            problem: 'Escribe la configuración electrónica del Sodio (Z = 11) y del Hierro (Z = 26).',
            solution: 'Na (11): 1s² 2s² 2p⁶ 3s¹ (o [Ne] 3s¹). Fe (26): 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶ (o [Ar] 4s² 3d⁶).',
            explanation: 'En el Fe, el subnivel 4s se llena antes que el 3d porque tiene menor energía según la regla n+l (4+0=4 vs 3+2=5).'
          }
        ]
      },
      {
        id: '2-5',
        title: 'Tabla Periódica y Propiedades Periódicas',
        summary: 'Estructura por períodos y familias, y tendencias periódicas: electronegatividad, radio atómico y energía de ionización.',
        keyPoints: [
          'Períodos (7 filas horizontales): Indican el nivel de energía más externo (n) ocupado.',
          'Grupos o Familias (18 columnas verticales): Elementos con la misma configuración en la capa de valencia y propiedades químicas similares.',
          'Radio atómico: Disminuye a lo largo de un período (de izquierda a derecha por mayor atracción nuclear efectiva Z_eff) y aumenta al descender en un grupo (más capas electrónicas).',
          'Energía de Ionización (EI): Energía mínima requerida para arrancar un electrón de un átomo gaseoso en estado fundamental. Aumenta de izquierda a derecha y de abajo hacia arriba.',
          'Electronegatividad (Escala de Pauling): Capacidad de un átomo para atraer electrones hacia sí en un enlace químico. El Flúor (F) es el más electronegativo (4.0); el Francio (Fr) el menor (~0.7).'
        ],
        formulas: [
          'Afinidad Electrónica: X(g) + e⁻ → X⁻(g) + energía',
          'Energía de Ionización: X(g) + EI → X⁺(g) + e⁻'
        ],
        content: `### Tendencias Periódicas Clave

* **Radio Atómico**: Mayor hacia la **esquina inferior izquierda** ($\swarrow$).
* **Energía de Ionización**: Mayor hacia la **esquina superior derecha** ($\nearrow$).
* **Electronegatividad**: Mayor hacia la **esquina superior derecha** ($\nearrow$) sin considerar los gases nobles.
* **Carácter metálico**: Mayor hacia la **esquina inferior izquierda** ($\swarrow$).`,
        examples: [
          {
            problem: 'Ordena de menor a mayor electronegatividad los elementos: K (Potasio), Cl (Cloro), Br (Bromo).',
            solution: 'K < Br < Cl',
            explanation: 'El potasio es un metal alcalino con muy baja electronegatividad (0.82). Entre los halógenos del grupo 17, el Cloro está por encima del Bromo, por lo que tiene mayor electronegatividad (Cl: 3.16 > Br: 2.96).'
          }
        ]
      }
    ],
    quiz: [
      {
        id: 'q2-1',
        question: '¿Cuántos neutrones posee un átomo de Uranio-238 cuyo número atómico Z es 92?',
        options: ['92', '146', '238', '330'],
        correctIndex: 1,
        explanation: 'N = A - Z = 238 - 92 = 146 neutrones.'
      },
      {
        id: 'q2-2',
        question: '¿Cuál es el elemento con mayor electronegatividad en la tabla periódica?',
        options: ['Oxígeno', 'Cloro', 'Flúor', 'Francio'],
        correctIndex: 2,
        explanation: 'El Flúor (F) posee el valor más alto en la escala de Pauling con 4.0.'
      },
      {
        id: 'q2-3',
        question: '¿Qué principio estipula que ningún par de electrones en un átomo puede compartir los 4 números cuánticos idénticos?',
        options: ['Regla de Hund', 'Principio de Aufbau', 'Principio de exclusión de Pauli', 'Principio de incertidumbre de Heisenberg'],
        correctIndex: 2,
        explanation: 'El principio de exclusión de Wolfgang Pauli garantiza que cada electrón tiene una combinación única de números cuánticos.'
      }
    ],
    flashcardIds: ['fc-2-1', 'fc-2-2', 'fc-2-3', 'fc-2-4']
  },
  {
    id: 3,
    slug: 'enlaces-quimicos-y-nomenclatura',
    title: '3. Enlaces Químicos y Nomenclatura',
    subtitle: 'Tipos de enlace, estructuras de Lewis, formulación inorgánica y números de oxidación',
    iconName: 'Sparkles',
    color: 'amber',
    subtopics: [
      {
        id: '3-1',
        title: 'Tipos de Enlace Químico',
        summary: 'Enlace iónico, covalente (polar y no polar) y metálico.',
        keyPoints: [
          'Enlace Iónico: Transferencia de electrones desde un metal (baja EN) hacia un no metal (alta EN). ΔEN ≥ 1.7. Forman redes cristalinas sólidas, altos puntos de fusión, conducen electricidad fundidos o en solución acuosa.',
          'Enlace Covalente: Compartición de pares de electrones entre no metales.',
          'Covalente no polar: ΔEN < 0.4. Compartición equitativa (ej. H₂, O₂, CH₄).',
          'Covalente polar: 0.4 ≤ ΔEN < 1.7. El átomo más electronegativo atrae más la densidad electrónica creando un dipolo permanente (ej. H₂O, HCl).',
          'Enlace Metálico: Modelo del "mar de electrones"; cationes metálicos fijos inmersos en una nube deslocalizada de electrones libres. Alta conductividad térmica y eléctrica, maleabilidad y ductilidad.'
        ],
        formulas: [
          'ΔEN = |EN_átomo1 - EN_átomo2|'
        ],
        content: `### Clasificación de los Enlaces Químicos

Los átomos forman enlaces para alcanzar una configuración electrónica estable similar a la de los gases nobles (regla del octeto).

1. **Iónico**: Atracción electrostática entre iones de carga opuesta (ej. $Na^+ + Cl^- \\rightarrow NaCl$).
2. **Covalente**:
   * *Apolar / Puro*: Los electrones se comparten equitativamente (ej. $N_2$, $Cl_2$).
   * *Polar*: Se genera un momento dipolar no nulo $\\mu > 0$ (ej. $HF$, $NH_3$).
   * *Coordinado o Dativo*: El par de electrones compartido es aportado enteramente por uno solo de los átomos.
3. **Metálico**: Cohesiona átomos metálicos mediante electrones deslocalizados.`,
        examples: [
          {
            problem: 'Determina el tipo de enlace predominante en el Fluoruro de Cesio (CsF), sabiendo que EN(Cs) = 0.79 y EN(F) = 3.98.',
            solution: 'ΔEN = 3.98 - 0.79 = 3.19. Como 3.19 > 1.7, el enlace es fuertemente iónico.',
            explanation: 'Existe una transferencia neta del electrón del cesio al flúor, formando los iones Cs⁺ y F⁻.'
          }
        ]
      },
      {
        id: '3-2',
        title: 'Estructuras de Lewis',
        summary: 'Representación de electrones de valencia y aplicación de la regla del octeto.',
        keyPoints: [
          'Símbolos de puntos de Lewis: Muestran los electrones de la capa más externa alrededor del símbolo del elemento.',
          'Regla del octeto: Los átomos tienden a ganar, perder o compartir electrones hasta rodearse de 8 electrones de valencia.',
          'Excepciones al octeto:',
          '  - Octeto incompleto: Hidrógeno (dueto con 2 e⁻), Berilio (4 e⁻), Boro en BF₃ (6 e⁻).',
          '  - Electrones impares: Moléculas con radicales libres como NO y NO₂.',
          '  - Octeto expandido: Elementos del período 3 en adelante (P, S, Cl) que pueden usar orbitales d vacíos (ej. PCl₅ con 10 e⁻, SF₆ con 12 e⁻).'
        ],
        formulas: [
          'Carga formal = (Electrones de valencia libres) - (Pares libres × 2) - (Enlaces / 2)'
        ],
        content: `### Cómo Dibujar una Estructura de Lewis

1. Sumar los electrones de valencia de todos los átomos del compuesto.
2. Identificar el átomo central (suele ser el menos electronegativo, nunca el Hidrógeno).
3. Dibujar enlaces simples entre el átomo central y los ligandos (cada enlace = 2 electrones).
4. Completar octetos de los átomos periféricos.
5. Asignar los electrones restantes al átomo central.
6. Si el átomo central no alcanza el octeto, formar enlaces dobles o triples.`,
        examples: [
          {
            problem: 'Dibuja la estructura de Lewis para el Dióxido de Carbono (CO₂).',
            solution: 'Valencias: C (4) + 2 × O (6) = 16 electrones. Enlaces simples C-O dejarían al carbono con solo 4 e⁻. Por tanto, se forman dos enlaces dobles: O = C = O, con 2 pares solitarios sobre cada oxígeno.',
            explanation: 'Cada átomo de oxígeno y el carbono central satisfacen plenamente la regla del octeto (8 e⁻).'
          }
        ]
      },
      {
        id: '3-3',
        title: 'Nomenclatura Inorgánica',
        summary: 'Formulación y denominación de óxidos, ácidos, hidróxidos y sales según IUPAC, Stock y Tradicional.',
        keyPoints: [
          'Óxidos básicos: Metal + Oxígeno (ej. Na₂O óxido de sodio; FeO óxido de hierro(II)).',
          'Óxidos ácidos (Anhídridos): No metal + Oxígeno (ej. SO₃ trióxido de azufre).',
          'Hidróxidos: Metal + anión hidróxido (OH)⁻ (ej. Ca(OH)₂ hidróxido de calcio).',
          'Ácidos hidrácidos: Hidrógeno + no metal del grupo 16/17 en disolución acuosa (ej. HCl(ac) ácido clorhídrico).',
          'Ácidos oxácidos: Hidrógeno + No metal + Oxígeno (ej. H₂SO₄ ácido sulfúrico, HNO₃ ácido nítrico).',
          'Sales haloideas: Metal + no metal (ej. NaCl cloruro de sodio).',
          'Oxisales: Metal + radical oxácido (ej. CaCO₃ carbonato de calcio, CuSO₄ sulfato de cobre(II)).'
        ],
        formulas: [],
        content: `### Reglas de Formulación Química Inorgánica

#### Sistemas de Nomenclatura:
* **Sistemática (IUPAC)**: Prefijos multiplicadores griegos (*mono-, di-, tri-, tetra-, penta-*). Ej. $CO_2$ es dióxido de carbono.
* **Stock**: Nombre de la función + nombre del elemento + número de oxidación en números romanos entre paréntesis. Ej. $Fe_2O_3$ es óxido de hierro(III).
* **Tradicional**: Sufijos *-oso* (menor estado de oxidación) e *-ico* (mayor estado), y prefijos *hipo-...-oso* o *per-...-ico*.`,
        examples: [
          {
            problem: 'Nombra el compuesto Fe₂(SO₄)₃ en los sistemas Stock y Tradicional.',
            solution: 'Stock: Sulfato de hierro(III). Tradicional: Sulfato férrico.',
            explanation: 'El hierro actúa con número de oxidación +3 (su estado mayor entre +2 y +3).'
          }
        ]
      },
      {
        id: '3-4',
        title: 'Número de Oxidación',
        summary: 'Reglas universales para determinar los estados de oxidación de los átomos en cualquier especie química.',
        keyPoints: [
          'Regla 1: Cualquier elemento libre sin combinar tiene número de oxidación 0 (ej. Na, H₂, O₂, P₄, S₈ = 0).',
          'Regla 2: El Flúor siempre tiene estado de oxidación -1 en todos sus compuestos.',
          'Regla 3: El Oxígeno tiene estado de oxidación -2 (excepción: peróxidos como H₂O₂ donde es -1, y con flúor OF₂ donde es +2).',
          'Regla 4: El Hidrógeno tiene estado de oxidación +1 cuando está unido a no metales, y -1 cuando se une a metales (hidruros metálicos como NaH, CaH₂).',
          'Regla 5: Los metales del Grupo 1 (alcalinos) siempre son +1; Grupo 2 (alcalinotérreos) siempre son +2; Al siempre +3.',
          'Regla 6: La suma algebraica de los números de oxidación en una molécula neutra es 0.',
          'Regla 7: En un ión poliatómico, la suma algebraica es igual a la carga neta del ión.'
        ],
        formulas: [
          'Σ (N° átomos × N° oxidación) = Carga de la especie'
        ],
        content: `### Asignación Sistemática del Número de Oxidación

El número de oxidación es la carga eléctrica aparente que poseería un átomo si todos los enlaces compartidos fueran puramente iónicos.

Ejemplo en el anión Permanganato ($MnO_4^-$):
* Sea $x$ el estado de oxidación del Manganeso.
* Cada oxígeno aporta $-2$.
* $x + 4(-2) = -1 \\implies x - 8 = -1 \\implies x = +7$.
* El manganeso actúa con estado de oxidación $+7$.`,
        examples: [
          {
            problem: 'Determina el número de oxidación del Cromo (Cr) en el dicromato de potasio: K₂Cr₂O₇.',
            solution: 'K es +1 (Grupo 1) → 2(+1) = +2. O es -2 → 7(-2) = -14. Ecuación: +2 + 2x - 14 = 0 → 2x = 12 → x = +6.',
            explanation: 'Cada átomo de Cromo tiene un estado de oxidación de +6.'
          }
        ]
      }
    ],
    quiz: [
      {
        id: 'q3-1',
        question: '¿Qué tipo de enlace predomina entre el Sodio (metal) y el Cloro (no metal)?',
        options: ['Covalente apolar', 'Iónico', 'Covalente polar', 'Metálico'],
        correctIndex: 1,
        explanation: 'Por la enorme diferencia de electronegatividad (ΔEN > 1.7), se transfieren electrones formando un enlace iónico.'
      },
      {
        id: 'q3-2',
        question: '¿Cuál es el estado de oxidación del azufre en el ácido sulfúrico (H₂SO₄)?',
        options: ['+2', '+4', '+6', '-2'],
        correctIndex: 2,
        explanation: '2(+1) + x + 4(-2) = 0 → 2 + x - 8 = 0 → x = +6.'
      },
      {
        id: 'q3-3',
        question: '¿Cuál de las siguientes moléculas presenta una excepción de octeto expandido?',
        options: ['CH₄', 'H₂O', 'SF₆', 'NH₃'],
        correctIndex: 2,
        explanation: 'En el SF₆, el átomo central de azufre comparte 6 pares de electrones, teniendo 12 electrones de valencia en su capa externa.'
      }
    ],
    flashcardIds: ['fc-3-1', 'fc-3-2', 'fc-3-3', 'fc-3-4']
  },
  {
    id: 4,
    slug: 'reacciones-y-estequiometria',
    title: '4. Reacciones y Estequiometría',
    subtitle: 'Tipos de reacción, balanceo por tanteo y redox, el mol, reactivo limitante y rendimiento',
    iconName: 'Scale',
    color: 'purple',
    subtopics: [
      {
        id: '4-1',
        title: 'Reacciones Químicas y Métodos de Balanceo',
        summary: 'Tipos de reacción (síntesis, descomposición, sustitución simple y doble, combustión) y balanceo por tanteo y método redox.',
        keyPoints: [
          'Síntesis / Combinación: A + B → AB (ej. 2 H₂ + O₂ → 2 H₂O).',
          'Descomposición: AB → A + B (ej. 2 KClO₃ → 2 KCl + 3 O₂).',
          'Sustitución simple / Desplazamiento: A + BC → AC + B (ej. Zn + 2 HCl → ZnCl₂ + H₂).',
          'Doble sustitución / Metátesis: AB + CD → AD + CB (ej. AgNO₃ + NaCl → AgCl↓ + NaNO₃).',
          'Combustión: Hidrocarburo + O₂ → CO₂ + H₂O + calor.',
          'Balanceo por tanteo: Ajustar coeficientes estequiométricos para igualar el número de átomos de cada elemento a ambos lados (orden sugerido: Metales → No metales → Hidrógeno → Oxígeno).',
          'Reacciones Redox: Ocurre transferencia de electrones. Oxidación: pérdida de electrones (aumenta n° oxidación). Reducción: ganancia de electrones (disminuye n° oxidación). El agente oxidante se reduce; el agente reductor se oxida.'
        ],
        formulas: [
          'Mnemotecnia Redox: O.P.E. / R.G.E. (Oxidación Pierde Electrones, Reducción Gana Electrones)'
        ],
        content: `### Balanceo y Tipos de Reacciones Químicas

Toda reacción química debe cumplir la Ley de Conservación de la Materia: la cantidad de átomos de cada elemento en los reactivos debe ser idéntica a la de los productos.

#### Tipos Principales:
1. **Síntesis**: $2\\text{Mg} + \\text{O}_2 \\rightarrow 2\\text{MgO}$
2. **Descomposición**: $\\text{CaCO}_3 \\xrightarrow{\\Delta} \\text{CaO} + \\text{CO}_2$
3. **Desplazamiento simple**: $\\text{Fe} + \\text{CuSO}_4 \\rightarrow \\text{FeSO}_4 + \\text{Cu}$
4. **Doble sustitución**: $\\text{BaCl}_2 + \\text{Na}_2\\text{SO}_4 \\rightarrow \\text{BaSO}_4\\downarrow + 2\\text{NaCl}$

#### Concepto Redox:
* Especie oxidada = Aumenta su número de oxidación (actúa como agente reductor).
* Especie reducida = Disminuye su número de oxidación (actúa como agente oxidante).`,
        examples: [
          {
            problem: 'Balancea por tanteo la combustión completa del propano: C₃H₈ + O₂ → CO₂ + H₂O.',
            solution: '1) Carbonos: 3 CO₂. 2) Hidrógenos: 4 H₂O (8 H). 3) Oxígenos en productos: (3×2) + (4×1) = 10 O → 5 O₂. Ecuación: C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O.',
            explanation: 'Se verifica: 3 C, 8 H y 10 O en ambos miembros de la ecuación.'
          }
        ]
      },
      {
        id: '4-2',
        title: 'El Mol y Masa Molar',
        summary: 'Concepto de mol como unidad de conteo, masa molar (g/mol) y el Número de Avogadro.',
        keyPoints: [
          'Mol: Cantidad de sustancia que contiene exactamente 6.02214076 × 10²³ entidades elementales (átomos, moléculas o iones).',
          'Número de Avogadro (N_A): 6.022 × 10²³ partículas/mol.',
          'Masa Molar (M): Masa en gramos de 1 mol de una sustancia (g/mol). Numéricamente equivalente a la masa atómica o molecular en unidades de masa atómica (u).',
          'Conversión fundamental: n = m / M  (donde n = moles, m = masa en gramos, M = masa molar en g/mol).'
        ],
        formulas: [
          'n = m / M',
          'N° de partículas = n × N_A = n × 6.022 × 10²³'
        ],
        content: `### El Puente Microscópico-Macroscópico: El Mol

Un solo gramo de sustancia contiene trillones de partículas. El concepto de **mol** permite a los químicos "pesar" cantidades calculadas de moléculas y átomos.

Ejemplos de Masa Molar ($M$):
* $H_2O$: $(2 \\times 1.008) + 16.00 = 18.016\\text{ g/mol}$
* $CO_2$: $12.011 + (2 \\times 16.00) = 44.01\\text{ g/mol}$
* $NaCl$: $22.99 + 35.45 = 58.44\\text{ g/mol}$`,
        examples: [
          {
            problem: '¿Cuántos moles y cuántas moléculas hay en 90 g de agua pura (H₂O)?',
            solution: 'Masa molar H₂O = 18 g/mol. n = 90 g / 18 g/mol = 5 moles de H₂O. Moléculas = 5 × 6.022 × 10²³ = 3.011 × 10²⁴ moléculas.',
            explanation: 'Se divide la masa entre la masa molar y luego se multiplica por la constante de Avogadro.'
          }
        ]
      },
      {
        id: '4-3',
        title: 'Estequiometría, Reactivo Limitante y Rendimiento',
        summary: 'Cálculos estequiométricos masa-mol, determinación de reactivo limitante y cálculo de rendimiento porcentual.',
        keyPoints: [
          'Relación estequiométrica: Proporción en moles dada por los coeficientes de la ecuación balanceada.',
          'Reactivo Limitante (RL): Es el reactivo que se consume por completo primero y determina la cantidad máxima de producto obtenible.',
          'Reactivo en Exceso (RE): El reactivo que sobra tras agotarse el reactivo limitante.',
          'Rendimiento Teórico: Cantidad máxima calculada de producto que se formaría si todo el RL reaccionara al 100%.',
          'Rendimiento Real: Cantidad de producto efectivamente recuperada en el laboratorio.',
          'Porcentaje de Rendimiento: % Rendimiento = (Rendimiento Real / Rendimiento Teórico) × 100%.'
        ],
        formulas: [
          'n_producto = n_RL × (coef_producto / coef_RL)',
          '% Rendimiento = (Masa Real / Masa Teórica) × 100'
        ],
        content: `### Pasos para Resolver Problemas de Estequiometría

1. **Escribir y balancear** la ecuación química.
2. **Convertir** las cantidades dadas de reactivos a **moles** ($n = m/M$).
3. **Determinar el Reactivo Limitante**: Dividir los moles disponibles de cada reactivo entre su respectivo coeficiente estequiométrico. El menor cociente indica el reactivo limitante.
4. **Calcular la cantidad teórica de producto** empleando exclusivamente los moles del reactivo limitante.
5. **Convertir** los moles de producto a gramos si se solicita.
6. **Calcular el rendimiento** porcentual si se proporciona el producto real obtenido.`,
        examples: [
          {
            problem: 'Se hacen reaccionar 4 moles de H₂ con 3 moles de O₂ para formar agua (2 H₂ + O₂ → 2 H₂O). ¿Cuál es el reactivo limitante y cuántos moles de H₂O se forman?',
            solution: 'Cociente H₂: 4 / 2 = 2. Cociente O₂: 3 / 1 = 3. Como 2 < 3, el H₂ es el reactivo limitante. Moles H₂O = 4 mol H₂ × (2 mol H₂O / 2 mol H₂) = 4 moles de H₂O.',
            explanation: 'El hidrógeno se consume por completo primero; sobra 1 mol de O₂ (reactivo en exceso).'
          }
        ]
      }
    ],
    quiz: [
      {
        id: 'q4-1',
        question: 'En la reacción N₂ + 3 H₂ → 2 NH₃, ¿cuántos moles de NH₃ se producen a partir de 6 moles de H₂ con suficiente N₂?',
        options: ['2 moles', '4 moles', '6 moles', '12 moles'],
        correctIndex: 1,
        explanation: 'Por estequiometría: 6 moles H₂ × (2 moles NH₃ / 3 moles H₂) = 4 moles de NH₃.'
      },
      {
        id: 'q4-2',
        question: '¿Qué ocurre con la especie química que experimenta "oxidación" en una reacción redox?',
        options: ['Gana electrones', 'Pierde protones', 'Pierde electrones', 'Disminuye su número de oxidación'],
        correctIndex: 2,
        explanation: 'La oxidación se define como la pérdida de electrones, lo que incrementa el estado de oxidación de la especie.'
      },
      {
        id: 'q4-3',
        question: 'Si el rendimiento teórico de un fármaco es de 50 g y en el laboratorio se aislaron 40 g, ¿cuál es el porcentaje de rendimiento?',
        options: ['75%', '80%', '85%', '90%'],
        correctIndex: 1,
        explanation: '% Rendimiento = (40 g / 50 g) × 100% = 80%.'
      }
    ],
    flashcardIds: ['fc-4-1', 'fc-4-2', 'fc-4-3', 'fc-4-4']
  },
  {
    id: 5,
    slug: 'estados-de-la-materia-y-disoluciones',
    title: '5. Estados de la Materia y Disoluciones',
    subtitle: 'Leyes de los gases ideales (PV=nRT), fuerzas intermoleculares, concentración de disoluciones, ácidos y bases',
    iconName: 'Droplets',
    color: 'cyan',
    subtopics: [
      {
        id: '5-1',
        title: 'Gases Ideales y Teoría Cinética Molecular',
        summary: 'Leyes de Boyle, Charles, Gay-Lussac, ecuación general de los gases ideales (PV=nRT) y postulados cinéticos.',
        keyPoints: [
          'Postulados de la teoría cinética: Partículas puntuales en movimiento rectilíneo aleatorio continuo, choques perfectamente elásticos, volumen de las partículas despreciable frente al volumen del recipiente, no existen fuerzas de atracción ni repulsión entre ellas.',
          'Ley de Boyle (T constante): P₁·V₁ = P₂·V₂ (Presión y volumen son inversamente proporcionales).',
          'Ley de Charles (P constante): V₁ / T₁ = V₂ / T₂ (Volumen y temperatura absoluta son directamente proporcionales).',
          'Ley de Gay-Lussac (V constante): P₁ / T₁ = P₂ / T₂.',
          'Ecuación del Gas Ideal: P·V = n·R·T.',
          'Constante universal R: R = 0.08206 (atm·L)/(mol·K) = 8.314 J/(mol·K).',
          'Condiciones Normales de Presión y Temperatura (CNPT): P = 1 atm, T = 273.15 K (0 °C). A CNPT, 1 mol de gas ideal ocupa 22.4 L.'
        ],
        formulas: [
          'P · V = n · R · T',
          'R = 0.08206 atm·L / (mol·K)',
          '(P₁ · V₁) / T₁ = (P₂ · V₂) / T₂'
        ],
        content: `### Comportamiento de los Gases

Los gases reales se aproximan al comportamiento ideal a **altas temperaturas** y **bajas presiones**, donde las interacciones atractivas son mínimas.

#### Variables de Estado:
* **Presión ($P$)**: en atmósferas ($1\\text{ atm} = 760\\text{ mmHg} = 101325\\text{ Pa}$).
* **Volumen ($V$)**: en litros ($L$).
* **Cantidad ($n$)**: en moles ($mol$).
* **Temperatura ($T$)**: ¡SIEMPRE en Kelvin ($K = ^\\circ C + 273.15$)!`,
        examples: [
          {
            problem: '¿Qué volumen ocuparán 2 moles de gas helio a una presión de 1.5 atm y una temperatura de 27 °C?',
            solution: 'T = 27 + 273.15 = 300.15 K. V = (n·R·T) / P = (2 mol × 0.0821 atm·L/mol·K × 300.15 K) / 1.5 atm = 32.85 L.',
            explanation: 'Es crucial convertir la temperatura de Celsius a Kelvin antes de aplicar PV=nRT.'
          }
        ]
      },
      {
        id: '5-2',
        title: 'Fuerzas Intermoleculares',
        summary: 'Puentes de hidrógeno, fuerzas de Van der Waals (dipolo-dipolo y dispersión de London) y su impacto físico.',
        keyPoints: [
          'Las fuerzas intermoleculares son fuerzas electrostáticas atractivas entre moléculas distintas (más débiles que los enlaces intramoleculares covalentes o iónicos).',
          'Fuerzas de London (dispersión): Presentes en TODAS las moléculas por fluctuaciones temporales de la nube electrónica. Aumentan con el tamaño y masa molar.',
          'Fuerzas Dipolo-Dipolo: Atracción entre los extremos positivo y negativo de moléculas polares permanentes (ej. HCl, SO₂).',
          'Puentes de Hidrógeno: Interacción dipolo-dipolo excepcionalmente fuerte. Ocurre cuando el Hidrógeno está unido directamente a un átomo pequeño y muy electronegativo: Flúor, Oxígeno o Nitrógeno (F, O, N). Explica el anómalamente alto punto de ebullición del agua ($H_2O$), la estructura en doble hélice del ADN y la baja densidad del hielo.'
        ],
        formulas: [],
        content: `### Jerarquía de Fuerzas Intermoleculares

De menor a mayor intensidad relativa:
1. **Fuerzas de dispersión de London** (débiles, dominantes en no polares como $CH_4, O_2$).
2. **Dipolo-Dipolo** (fuerza intermedia en moléculas polares como $H_2S, HCl$).
3. **Puente de Hidrógeno** (las más intensas entre fuerzas moleculares neutras: $H_2O, NH_3, HF$).
4. **Ion-Dipolo** (atracción entre un ion y agua, responsable de la solvatación de sales).`,
        examples: [
          {
            problem: '¿Por qué el agua (H₂O, 18 g/mol) hierve a 100 °C mientras que el sulfuro de hidrógeno (H₂S, 34 g/mol) hierve a -60 °C a pesar de ser más pesado?',
            solution: 'El agua forma redes extensas de puentes de hidrógeno por la gran electronegatividad del oxígeno. El H₂S solo tiene fuerzas dipolo-dipolo mucho más débiles.',
            explanation: 'Romper los puentes de hidrógeno requiere considerablemente más energía térmica.'
          }
        ]
      },
      {
        id: '5-3',
        title: 'Disoluciones y Unidades de Concentración',
        summary: 'Formas de medir la concentración: Molaridad, molalidad, porcentaje en masa y porcentaje en volumen.',
        keyPoints: [
          'Solución = Soluto (menor proporción) + Solvente (mayor proporción, comúnmente agua).',
          'Molaridad (M): Moles de soluto por litro de disolución (mol/L). M = n_soluto / V_disolución(L).',
          'Molalidad (m): Moles de soluto por kilogramo de disolvente puro (mol/kg). No varía con la temperatura.',
          'Porcentaje en masa (% m/m): (Masa soluto / Masa total disolución) × 100.',
          'Porcentaje en volumen (% v/v): (Volumen soluto / Volumen total disolución) × 100.',
          'Fórmula de dilución: C₁ · V₁ = C₂ · V₂.'
        ],
        formulas: [
          'M = n / V_L = (m_soluto / M_soluto) / V_L',
          'm = n_soluto / kg_solvente',
          '% m/m = (g_soluto / g_solución) × 100',
          'C₁ · V₁ = C₂ · V₂'
        ],
        content: `### Concentración de Disoluciones

La concentración expresa cuantitativamente la proporción entre el soluto disuelto y la disolución o el disolvente.

#### Ejemplo de Dilución:
Al añadir agua a una disolución concentrada, la cantidad de moles de soluto no cambia:
$$n_1 = n_2 \\implies M_1 \\cdot V_1 = M_2 \\cdot V_2$$`,
        examples: [
          {
            problem: 'Calcula la Molaridad de una disolución preparada disolviendo 20 g de NaOH (Masa molar = 40 g/mol) en agua hasta completar 500 mL de solución.',
            solution: 'n = 20 g / 40 g/mol = 0.5 moles de NaOH. Volumen = 500 mL = 0.5 L. Molaridad = 0.5 mol / 0.5 L = 1.0 M (1.0 mol/L).',
            explanation: 'Siempre se debe expresar el volumen de la solución en litros.'
          }
        ]
      },
      {
        id: '5-4',
        title: 'Ácidos, Bases y Escala de pH',
        summary: 'Teorías de Arrhenius y Brønsted-Lowry, cálculo de pH, pOH y neutralización.',
        keyPoints: [
          'Arrhenius: Ácido libera H⁺ (o H₃O⁺) en agua; Base libera OH⁻.',
          'Brønsted-Lowry: Ácido es donador de protones (H⁺); Base es aceptor de protones. Genera pares conjugados ácido-base.',
          'Producto iónico del agua a 25 °C: Kw = [H⁺][OH⁻] = 1.0 × 10⁻¹⁴.',
          'pH: Medida logarítmica de la concentración de iones hidrógeno: pH = -log[H⁺].',
          'pOH: pOH = -log[OH⁻].',
          'Relación fundamental a 25 °C: pH + pOH = 14.',
          'Escala de pH: pH < 7 Ácido; pH = 7 Neutro; pH > 7 Básico / Alcalino.'
        ],
        formulas: [
          'pH = -log₁₀[H⁺]',
          'pOH = -log₁₀[OH⁻]',
          '[H⁺] = 10^(-pH)',
          'pH + pOH = 14'
        ],
        content: `### Ácidos, Bases y Escala de pH

* **Ácidos Fuertes**: Se disocian al 100% en agua (ej. $HCl, HNO_3, H_2SO_4$). Para $HCl$ 0.01 M: $[H^+] = 0.01\\text{ M} \\implies pH = -\\log(10^{-2}) = 2$.
* **Bases Fuertes**: Se disocian completamente liberando $OH^-$ (ej. $NaOH, KOH, Ca(OH)_2$).
* **Ácidos Débiles**: Se disocian parcialmente, estableciendo un equilibrio con constante ácida $K_a$ (ej. ácido acético $CH_3COOH$).`,
        examples: [
          {
            problem: 'Una disolución tiene una concentración [H⁺] = 1.0 × 10⁻³ M. Calcula su pH y su pOH.',
            solution: 'pH = -log(1.0 × 10⁻³) = 3. Como pH + pOH = 14, pOH = 14 - 3 = 11.',
            explanation: 'La disolución es ácida (pH = 3 < 7).'
          }
        ]
      }
    ],
    quiz: [
      {
        id: 'q5-1',
        question: '¿Qué ocurre con el volumen de un gas si duplicamos su temperatura absoluta (en Kelvin) a presión constante según la ley de Charles?',
        options: ['Se reduce a la mitad', 'Se duplica', 'Permanece constante', 'Se cuadruplica'],
        correctIndex: 1,
        explanation: 'Según la ley de Charles, el volumen y la temperatura absoluta son directamente proporcionales (V₁/T₁ = V₂/T₂).'
      },
      {
        id: 'q5-2',
        question: '¿Cuál es el pH de una solución que tiene [OH⁻] = 1.0 × 10⁻⁴ M?',
        options: ['4', '7', '10', '14'],
        correctIndex: 2,
        explanation: 'pOH = -log(10⁻⁴) = 4. Por tanto, pH = 14 - pOH = 14 - 4 = 10 (solución básica).'
      },
      {
        id: 'q5-3',
        question: '¿Entre qué elementos se forman los puentes de hidrógeno más intensos con el átomo de hidrógeno?',
        options: ['Carbono, Silicio y Fósforo', 'Flúor, Oxígeno y Nitrógeno', 'Cloro, Bromo y Yodo', 'Sodio, Potasio y Calcio'],
        correctIndex: 1,
        explanation: 'Los puentes de hidrógeno se dan exclusivamente cuando el H se une covalentemente a elementos pequeños y sumamente electronegativos: F, O o N.'
      }
    ],
    flashcardIds: ['fc-5-1', 'fc-5-2', 'fc-5-3', 'fc-5-4']
  },
  {
    id: 6,
    slug: 'termodinamica-cinetica-y-equilibrio',
    title: '6. Termodinámica, Cinética y Equilibrio',
    subtitle: 'Entalpía, entropía, Gibbs, velocidad de reacción, Le Chatelier y celdas electroquímicas',
    iconName: 'Flame',
    color: 'rose',
    subtopics: [
      {
        id: '6-1',
        title: 'Termoquímica: Entalpía, Entropía y Energía Libre de Gibbs',
        summary: 'Procesos endotérmicos y exotérmicos, entalpía (ΔH), entropía (ΔS) y criterio de espontaneidad de Gibbs (ΔG).',
        keyPoints: [
          'Entalpía (H): Contenido calórico del sistema a presión constante.',
          'Proceso Exotérmico (ΔH < 0): Libera calor al entorno (ej. combustiones).',
          'Proceso Endotérmico (ΔH > 0): Absorbe calor del entorno (ej. fotosíntesis, fusión del hielo).',
          'Entropía (S): Medida del desorden o dispersión de la energía en el sistema. ΔS > 0 indica aumento de desorden (ej. sólido → gas).',
          'Energía Libre de Gibbs (ΔG): ΔG = ΔH - T·ΔS.',
          'Criterio de Espontaneidad:',
          '  - Si ΔG < 0: Proceso espontáneo.',
          '  - Si ΔG > 0: Proceso no espontáneo (espontáneo en sentido inverso).',
          '  - Si ΔG = 0: Sistema en equilibrio químico.'
        ],
        formulas: [
          'ΔH_reacción = Σ n·ΔH_f°(productos) - Σ m·ΔH_f°(reactivos)',
          'ΔG = ΔH - T · ΔS  (T en Kelvin)'
        ],
        content: `### Termodinámica Química

La espontaneidad de una reacción no depende solo de que libere calor, sino del balance entre la tendencia a la mínima entalpía y la máxima entropía:

| $\\Delta H$ | $\\Delta S$ | $\\Delta G = \\Delta H - T\\Delta S$ | Espontaneidad |
|---|---|---|---|
| $-$ (Exo) | $+$ (Más desorden) | Siempre negativo ($-$) | Espontáneo a cualquier temperatura |
| $+$ (Endo) | $-$ (Menos desorden)| Siempre positivo ($+$) | No espontáneo a cualquier temperatura |
| $-$ (Exo) | $-$ (Menos desorden)| Negativo a bajas temperaturas | Espontáneo a bajas temperaturas |
| $+$ (Endo) | $+$ (Más desorden) | Negativo a altas temperaturas | Espontáneo a altas temperaturas |`,
        examples: [
          {
            problem: 'Una reacción tiene ΔH = -80 kJ y ΔS = -200 J/K (-0.200 kJ/K). ¿Es espontánea a 298 K (25 °C)?',
            solution: 'ΔG = ΔH - T·ΔS = -80 kJ - (298 K × -0.200 kJ/K) = -80 kJ + 59.6 kJ = -20.4 kJ.',
            explanation: 'Como ΔG = -20.4 kJ < 0, la reacción es espontánea a 298 K.'
          }
        ]
      },
      {
        id: '6-2',
        title: 'Cinética Química y Factores de Reacción',
        summary: 'Velocidad de reacción, teoría de colisiones, energía de activación (Ea) y factores que la modifican.',
        keyPoints: [
          'Velocidad de reacción: Cambio en la concentración de reactivos o productos por unidad de tiempo: v = -d[R]/dt = d[P]/dt.',
          'Teoría de colisiones: Para que una reacción ocurra, las partículas deben colisionar con la orientación geométrica adecuada y con una energía mínima suficiente (Energía de Activación, Ea).',
          'Factores que afectan la velocidad:',
          '  1. Concentración: Mayor concentración → más choques por segundo.',
          '  2. Temperatura: Aumenta la energía cinética promedio y la fracción de moléculas con E ≥ Ea (Regla empírica: +10 °C duplica la velocidad).',
          '  3. Superficie de contacto: Mayor grado de división en sólidos acelera la reacción.',
          '  4. Catalizadores: Sustancias que aceleran la reacción disminuyendo la energía de activación (Ea) sin consumirse en el proceso.'
        ],
        formulas: [
          'Ecuación de Arrhenius: k = A · e^(-Ea / (R·T))'
        ],
        content: `### Cinética: ¿Cuán rápido ocurre una reacción?

* **Complejo activado**: Estado de transición de máxima energía e inestabilidad donde los enlaces viejos se rompen y los nuevos se forman.
* **Energía de Activación ($E_a$)**: Barrera energética que los reactivos deben superar para convertirse en productos.
* **Catalizador**: Ofrece un mecanismo alternativo con menor $E_a$. No altera el $\\Delta H$ ni el equilibrio termodinámico, solo reduce el tiempo necesario para alcanzarlo.`,
        examples: []
      },
      {
        id: '6-3',
        title: 'Equilibrio Químico y Principio de Le Chatelier',
        summary: 'Constante de equilibrio (Kc, Kp) y respuesta del sistema ante perturbaciones externas.',
        keyPoints: [
          'Equilibrio dinámico: Estado en el que las velocidades de la reacción directa e inversa se igualan: v_directa = v_inversa. Las concentraciones macroscópicas permanecen constantes.',
          'Ley de acción de masas: Para aA + bB ⇌ cC + dD: Kc = ([C]^c · [D]^d) / ([A]^a · [B]^b). (Solo gases y especies acuosas; sólidos y líquidos puros no se incluyen).',
          'Principio de Le Chatelier: Si un sistema en equilibrio es sometido a una perturbación (cambio de concentración, presión/volumen o temperatura), el sistema se desplazará en el sentido que contrarreste dicha perturbación.',
          'Efecto concentración: Al añadir reactivo, se desplaza hacia productos (derecha).',
          'Efecto presión (en gases): Al aumentar la presión, se desplaza hacia el lado con MENOS moles de gas.',
          'Efecto temperatura: Al calentar, favorece el sentido endotérmico (+ΔH).'
        ],
        formulas: [
          'K_c = ([C]^c · [D]^d) / ([A]^a · [B]^b)',
          'K_p = K_c · (R·T)^(Δn_gases)'
        ],
        content: `### Principio de Le Chatelier en Acción

Consideremos el proceso Haber-Bosch para sintetizar amoníaco:
$$N_2(g) + 3 H_2(g) \\rightleftharpoons 2 NH_3(g) \\quad (\\Delta H = -92.4\\text{ kJ, exotérmica})$$

* **Aumentar presión**: Como reactivos tienen 4 moles de gas ($1+3$) y productos 2 moles, el equilibrio se desplaza a la **derecha** (hacia $NH_3$).
* **Aumentar temperatura**: Por ser exotérmica hacia la derecha, el calor actúa como producto; calentarla desplaza el sistema a la **izquierda** (descomposición).
* **Retirar $NH_3$ continuo**: Desplaza el equilibrio hacia la **derecha** produciendo más amoníaco.`,
        examples: [
          {
            problem: 'En el equilibrio: 2 SO₂(g) + O₂(g) ⇌ 2 SO₃(g) + calor. ¿Hacia dónde se desplaza el equilibrio si se aumenta el volumen del recipiente a temperatura constante?',
            solution: 'Aumentar el volumen equivale a disminuir la presión. El sistema contrarresta desplazándose hacia donde hay mayor número de moles de gas: 3 moles a la izquierda (reactivos) vs 2 a la derecha. Por tanto, se desplaza a la IZQUIERDA.',
            explanation: 'Disminuir la presión favorece la disociación hacia más moléculas gaseosas.'
          }
        ]
      },
      {
        id: '6-4',
        title: 'Electroquímica: Celdas Galvánicas y Electrólisis',
        summary: 'Celdas galvánicas/voltaicas, potenciales estándar de reducción (E°), ánodo, cátodo y electrólisis.',
        keyPoints: [
          'Celda Galvánica / Voltaica: Transforma energía química de una reacción redox espontánea en energía eléctrica continua (ej. pilas, baterías).',
          'Ánodo: Electrodo donde ocurre la OXIDACIÓN (carga negativa en celda galvánica). Mnemotecnia: AnOx (Ánodo = Oxidación).',
          'Cátodo: Electrodo donde ocurre la REDUCCIÓN (carga positiva en celda galvánica). Mnemotecnia: RedCat (Reducción = Cátodo).',
          'Potencial de Celda Estándar (E°celda): E°celda = E°cátodo - E°ánodo. Si E°celda > 0, la reacción es espontánea.',
          'Puente salino: Mantiene la neutralidad eléctrica permitiendo el flujo de aniones y cationes entre semiceldas.',
          'Electrólisis: Proceso no espontáneo forzado mediante corriente eléctrica externa (E° < 0, requiere energía para recubrimientos galvánicos o purificación de metales).'
        ],
        formulas: [
          'E°_celda = E°_cátodo - E°_ánodo',
          'ΔG° = -n · F · E°_celda  (F = 96485 C/mol e⁻)'
        ],
        content: `### Fundamentos de Electroquímica

* **Pila Daniell**:
  * Ánodo (Oxidación): $Zn(s) \\rightarrow Zn^{2+}(ac) + 2e^-\\quad (E^\\circ = -0.76\\text{ V})$
  * Cátodo (Reducción): $Cu^{2+}(ac) + 2e^- \\rightarrow Cu(s)\\quad (E^\\circ = +0.34\\text{ V})$
  * Potencial estándar: $E^\\circ_{\\text{celda}} = +0.34 - (-0.76) = +1.10\\text{ V}$ (Espontáneo).`,
        examples: []
      }
    ],
    quiz: [
      {
        id: 'q6-1',
        question: 'Una reacción tiene ΔH < 0 y ΔS > 0. ¿En qué condiciones será espontánea (ΔG < 0)?',
        options: ['Solo a temperaturas muy altas', 'Solo a temperaturas muy bajas', 'A cualquier temperatura', 'En ninguna temperatura'],
        correctIndex: 2,
        explanation: 'Dado que ΔG = ΔH - T·ΔS, un valor negativo menos un valor positivo siempre produce un ΔG negativo a toda temperatura absoluta.'
      },
      {
        id: 'q6-2',
        question: '¿Qué función cumple un catalizador en una reacción química?',
        options: ['Aumenta el rendimiento teórico de productos', 'Reduce la energía de activación acelerando la velocidad', 'Aumenta el ΔH de la reacción', 'Desplaza el equilibrio hacia los productos'],
        correctIndex: 1,
        explanation: 'Un catalizador reduce la energía de activación sin alterar las constantes termodinámicas de equilibrio ni la entalpía global.'
      },
      {
        id: 'q6-3',
        question: 'En cualquier celda electroquímica (galvánica o electrolítica), ¿qué proceso ocurre invariablemente en el cátodo?',
        options: ['Oxidación', 'Reducción', 'Precipitación sin transferencia de carga', 'Disolución del metal'],
        correctIndex: 1,
        explanation: 'Por definición (RedCat), en el cátodo siempre ocurre el proceso de reducción (ganancia de electrones).'
      }
    ],
    flashcardIds: ['fc-6-1', 'fc-6-2', 'fc-6-3', 'fc-6-4']
  },
  {
    id: 7,
    slug: 'quimica-del-carbono-organica',
    title: '7. Química del Carbono (Orgánica)',
    subtitle: 'Hidrocarburos, grupos funcionales oxigenados/nitrogenados y biomoléculas esenciales',
    iconName: 'Dna',
    color: 'indigo',
    subtopics: [
      {
        id: '7-1',
        title: 'Hidrocarburos: Alcanos, Alquenos, Alquinos y Aromáticos',
        summary: 'Compuestos formados exclusivamente por carbono e hidrógeno, hibridación y aromaticidad.',
        keyPoints: [
          'Propiedades del carbono: Tetravalencia (capacidad de formar 4 enlaces covalentes) y concatenación (habilidad de formar cadenas estables C-C).',
          'Alcanos (Parafinas): Enlaces simples C-C (hibridación sp³). Fórmula general: C_n H_{2n+2}. Hidrocarburos saturados poco reactivos salvo en combustión y halogenación por radicales.',
          'Alquenos (Olefinas): Contienen al menos un doble enlace C=C (hibridación sp²). Fórmula general: C_n H_{2n}. Experimentan reacciones de adición electrofílica.',
          'Alquinos: Contienen al menos un triple enlace C≡C (hibridación sp). Fórmula general: C_n H_{2n-2}. Muy reactivos.',
          'Compuestos Aromáticos: Estructuras cíclicas conjugadas muy estables con electrones π deslocalizados según la regla de Hückel (4n + 2 electrones π). El representante paradigmático es el Benceno (C₆H₆).'
        ],
        formulas: [
          'Alcanos: C_n H_{2n+2}',
          'Alquenos: C_n H_{2n}',
          'Alquinos: C_n H_{2n-2}'
        ],
        content: `### Clasificación de Hidrocarburos

* **Alcanos**: Metano ($CH_4$), Etano ($C_2H_6$), Propano ($C_3H_8$), Butano ($C_4H_{10}$). Sufijo: *-ano*.
* **Alquenos**: Eteno o Etileno ($CH_2=CH_2$), Propeno ($CH_2=CH-CH_3$). Sufijo: *-eno*.
* **Alquinos**: Etino o Acetileno ($CH\\equiv CH$). Sufijo: *-ino*.
* **Aromáticos**: Presentan resonancia electrónica simétrica. Sufren sustitución electrofílica aromática en lugar de adición.`,
        examples: [
          {
            problem: '¿Cuál es la fórmula molecular de un alcano lineal de 8 átomos de carbono (octano)?',
            solution: 'C_n H_{2n+2} con n = 8 → C₈ H_{(2×8 + 2)} = C₈H₁₈.',
            explanation: 'El octano contiene 8 átomos de carbono y 18 átomos de hidrógeno.'
          }
        ]
      },
      {
        id: '7-2',
        title: 'Grupos Funcionales',
        summary: 'Alcoholes, aldehídos, cetonas, ácidos carboxílicos y ésteres: estructuras, nomenclatura y reactividad.',
        keyPoints: [
          'Grupo funcional: Átomo o conjunto de átomos que confiere propiedades químicas características a una familia orgánica.',
          'Alcoholes (-OH grupo hidroxilo): Sufijo *-ol* (ej. etanol CH₃CH₂OH). Forman puentes de hidrógeno, solubles en agua las cadenas cortas.',
          'Aldehídos (-CHO grupo carbonilo terminal): Sufijo *-al* (ej. metanal o formaldehído HCHO, etanal CH₃CHO).',
          'Cetonas (C=O grupo carbonilo intermedio): Sufijo *-ona* (ej. propanona o acetona CH₃COCH₃).',
          'Ácidos Carboxílicos (-COOH grupo carboxilo): Ácido ... *-oico* (ej. ácido etanoico o acético CH₃COOH del vinagre). Carácter ácido débil.',
          'Ésteres (-COO-): Formados por condensación de un ácido carboxílico y un alcohol (esterificación de Fischer). Responsables de fragancias y aromas frutales (ej. etanoato de etilo).'
        ],
        formulas: [
          'Esterificación: Ácido Carboxílico + Alcohol ⇌ Éster + H₂O'
        ],
        content: `### Principales Familias Orgánicas Oxigenadas

| Familia | Grupo Funcional | Fórmula General | Ejemplo | Sufijo |
|---|---|---|---|---|
| Alcohol | Hidroxilo ($-OH$) | $R-OH$ | Etanol ($CH_3CH_2OH$) | -ol |
| Éter | Alcoxi ($-O-$) | $R-O-R'$ | Dietil éter | éter |
| Aldehído | Carbonilo terminal ($-CHO$) | $R-CHO$ | Etanal ($CH_3CHO$) | -al |
| Cetona | Carbonilo interno ($>C=O$) | $R-CO-R'$ | Propanona ($CH_3COCH_3$) | -ona |
| Ácido Carboxílico | Carboxilo ($-COOH$) | $R-COOH$ | Ác. acético ($CH_3COOH$) | ác. ...-oico |
| Éster | Éster ($-COO-$) | $R-COO-R'$ | Acetato de etilo | -oato de ...ilo |`,
        examples: [
          {
            problem: 'Identifica los grupos funcionales presentes en la aspirina (ácido acetilsalicílico): posee un anillo aromático, un grupo -COOH y un grupo -OCOCH₃.',
            solution: '1) Anillo bencénico aromático, 2) Ácido carboxílico (-COOH), 3) Éster (-OCOCH₃).',
            explanation: 'La aspirina es a la vez un ácido aromático y un éster acetilado.'
          }
        ]
      },
      {
        id: '7-3',
        title: 'Biomoléculas: Carbohidratos, Lípidos, Proteínas y Ácidos Nucleicos',
        summary: 'Estructura y función biológica de las 4 macromoléculas de la vida.',
        keyPoints: [
          'Carbohidratos (Glúcidos): Monómeros monosacáridos (glucosa, fructosa). Enlace glucosídico. Reserva energética (glucógeno en animales, almidón en plantas) y estructural (celulosa, quitina).',
          'Lípidos: Compuestos hidrofóbicos insolubles en agua. Triglicéridos (grasas y aceites para reserva energética de largo plazo), Fosfolípidos (bicapa lipídica de membranas celulares) y Esteroides (colesterol, hormonas sexuales).',
          'Proteínas: Polímeros de 20 tipos de L-aminoácidos unidos por enlaces peptídicos (enlace amida). Funciones enzimáticas catalíticas, estructurales (colágeno), inmunológicas (anticuerpos) y transporte (hemoglobina).',
          'Ácidos Nucleicos (ADN y ARN): Polímeros de nucleótidos (base nitrogenada + azúcar pentosa + grupo fosfato). Enlace fosfodiéster. Almacenamiento, replicación y transcripción de la información genética hereditaria.'
        ],
        formulas: [],
        content: `### Las Cuatro Grandes Macromoléculas Biológicas

1. **Carbohidratos**: Fórmula empírica $(CH_2O)_n$. Fuente primaria e inmediata de energía celular (ATP vía glucólisis y respiración celular).
2. **Lípidos**: Moléculas anfipáticas (cabeza polar hidrofílica y cola no polar hidrofóbica).
3. **Proteínas**: Poseen cuatro niveles de organización estructural (primaria, secundaria en $\\alpha$-hélice o lámina $\\beta$, terciaria globular y cuaternaria como la hemoglobina).
4. **Ácidos Nucleicos**:
   * **ADN**: Azúcar desoxirribosa, bases A, T, C, G; doble hélice antiparalela.
   * **ARN**: Azúcar ribosa, bases A, U, C, G; cadena monocatenaria (ARNm, ARNt, ARNr).`,
        examples: []
      }
    ],
    quiz: [
      {
        id: 'q7-1',
        question: '¿Qué tipo de enlace covalente específico une a los aminoácidos para formar cadenas polipeptídicas en las proteínas?',
        options: ['Enlace glucosídico', 'Enlace peptídico', 'Enlace fosfodiéster', 'Enlace metálico'],
        correctIndex: 1,
        explanation: 'El enlace peptídico es una unión tipo amida entre el grupo carboxilo (-COOH) de un aminoácido y el grupo amino (-NH₂) del siguiente.'
      },
      {
        id: 'q7-2',
        question: '¿Cuál es el grupo funcional que distingue a los ésteres, conocidos por sus agradables aromas a frutas?',
        options: ['-OH', '-COOH', '-COO-', '-NH₂'],
        correctIndex: 2,
        explanation: 'El grupo funcional éster es -COO- (o -COOR), resultante de la reacción entre un ácido carboxílico y un alcohol.'
      },
      {
        id: 'q7-3',
        question: '¿Cuál de las siguientes bases nitrogenadas se encuentra presente en el ARN pero NO en el ADN?',
        options: ['Timina', 'Uracilo', 'Guanina', 'Citosina'],
        correctIndex: 1,
        explanation: 'El Uracilo (U) reemplaza a la Timina (T) en los ribonucleótidos del ARN.'
      }
    ],
    flashcardIds: ['fc-7-1', 'fc-7-2', 'fc-7-3', 'fc-7-4']
  }
];
