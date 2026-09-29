import type { ChatMessage } from '../types';

export interface TutorMode {
  id: 'didactic' | 'stepbystep' | 'quiz';
  label: string;
  icon: string;
  description: string;
}

export const TUTOR_MODES: TutorMode[] = [
  { id: 'didactic', label: 'Modo Didáctico', icon: 'GraduationCap', description: 'Explicaciones claras y analogías intuitivas para comprender los fundamentos.' },
  { id: 'stepbystep', label: 'Paso a Paso', icon: 'Calculator', description: 'Metodología estructurada para resolver problemas numéricos y estequiométricos.' },
  { id: 'quiz', label: 'Entréname (Quiz)', icon: 'Target', description: 'Preguntas desafiantes con retroalimentación inmediata para poner a prueba tus conocimientos.' },
];

export const INITIAL_GREETING: ChatMessage = {
  id: 'welcome-msg',
  sender: 'tutor',
  text: `¡Hola! Soy **QuimiBot**, tu tutor interactivo de química. Estoy programado para guiarte en todos los temas del plan de estudio:

1. **Conceptos Básicos y Materia** (estados, mezclas, separación, unidades SI)
2. **Estructura Atómica y Tabla Periódica** (modelos, cuántica, propiedades)
3. **Enlaces Químicos y Nomenclatura** (Lewis, óxidos, ácidos, número de oxidación)
4. **Reacciones y Estequiometría** (balanceo, mol, reactivo limitante, rendimiento)
5. **Estados de la Materia y Disoluciones** (gases ideales PV=nRT, concentración, pH)
6. **Termodinámica, Cinética y Equilibrio** (Gibbs, Le Chatelier, celdas electroquímicas)
7. **Química del Carbono** (hidrocarburos, grupos funcionales y biomoléculas)

¿En qué módulo o ejercicio te gustaría que trabajemos hoy? Puedes elegir una de las sugerencias abajo o escribir tu propia duda.`,
  timestamp: 'Ahora',
  suggestedFollowUps: [
    '¿Cómo calcular el Reactivo Limitante?',
    'Explícame la ley de los gases ideales (PV=nRT)',
    '¿Cómo determinar el Número de Oxidación?',
    '¿Qué predice el Principio de Le Chatelier?',
    'Ponme un reto de examen sobre Estequiometría'
  ]
};

interface KnowledgeItem {
  keywords: string[];
  moduleRef: number;
  responseGenerator: (query: string, mode: string) => {
    text: string;
    suggestedFollowUps: string[];
    calculationDetails?: {
      title: string;
      steps: string[];
      result: string;
    };
  };
}

export const knowledgeBase: KnowledgeItem[] = [
  // 1. Reactivo Limitante
  {
    keywords: ['reactivo limitante', 'limitante', 'exceso', 'estequiometria', 'rendimiento', 'reactivos'],
    moduleRef: 4,
    responseGenerator: (_q, mode) => {
      if (mode === 'stepbystep') {
        return {
          text: `### Guía Paso a Paso para Encontrar el Reactivo Limitante

Para cualquier reacción química balanceada $aA + bB \\rightarrow cC$:

1. **Paso 1: Balancear la ecuación química.** Sin una ecuación balanceada, los coeficientes no tendrán validez estequiométrica.
2. **Paso 2: Convertir los datos a Moles ($n$).** Si te dan gramos, divide entre la masa molar: $n = m / M$.
3. **Paso 3: Calcular la Relación Molar.** Divide los moles disponibles de cada reactivo entre su respectivo coeficiente estequiométrico:
   - Para el reactivo A: $\\text{Cociente}_A = \\frac{n_A}{a}$
   - Para el reactivo B: $\\text{Cociente}_B = \\frac{n_B}{b}$
4. **Paso 4: El menor valor es el Reactivo Limitante.** El reactivo con el cociente más bajo se agotará primero.
5. **Paso 5: Cálculos posteriores.** Usa **únicamente** los moles del reactivo limitante para calcular la cantidad teórica de productos formados.`,
          suggestedFollowUps: [
            '¿Cómo calcular el reactivo en exceso sobrante?',
            '¿Cómo se calcula el porcentaje de rendimiento?',
            'Ver la Calculadora de Estequiometría'
          ],
          calculationDetails: {
            title: 'Ejemplo: 4 mol de H₂ reaccionan con 3 mol de O₂ (2 H₂ + O₂ → 2 H₂O)',
            steps: [
              'Cociente H₂: 4 mol / 2 = 2.0',
              'Cociente O₂: 3 mol / 1 = 3.0',
              'Comparación: 2.0 < 3.0 → H₂ es el Reactivo Limitante.',
              'Moles de H₂O formados: 4 mol H₂ × (2 mol H₂O / 2 mol H₂) = 4 mol H₂O.',
              'O₂ consumido: 4 mol H₂ × (1 mol O₂ / 2 mol H₂) = 2 mol O₂.',
              'O₂ en exceso sobrante: 3 mol iniciales - 2 mol reaccionados = 1 mol en exceso.'
            ],
            result: 'Reactivo Limitante: H₂ | Producto teórico: 4 mol H₂O | Exceso sobrante: 1 mol O₂'
          }
        };
      }

      if (mode === 'quiz') {
        return {
          text: `🎯 **Pregunta de Reto: Reactivo Limitante**

Se hacen reaccionar **28 g de Nitrógeno ($N_2$, $M=28\\text{ g/mol}$)** con **9 g de Hidrógeno ($H_2$, $M=2\\text{ g/mol}$)** según la reacción:
$$N_2 + 3 H_2 \\rightarrow 2 NH_3$$

¿Cuál es el reactivo limitante y cuántos gramos de amoníaco ($NH_3$, $M=17\\text{ g/mol}$) se forman con un 100% de rendimiento?

*(Pista: Convierte primero a moles: $n(N_2) = 28/28 = 1\\text{ mol}$; $n(H_2) = 9/2 = 4.5\\text{ moles}$).*`,
          suggestedFollowUps: [
            'Dame la solución a este reto',
            '¿Qué pasaría si el rendimiento fuera del 80%?',
            'Otro ejercicio de este tema'
          ]
        };
      }

      return {
        text: `### ¿Qué es el Reactivo Limitante? (Explicación Didáctica)

Imagina que vas a preparar sandwiches: necesitas **2 rebanadas de pan** y **1 rebanada de jamón** por sandwich.
Si tienes **10 rebanadas de pan** y solo **3 rebanadas de jamón**, solo podrás hacer **3 sandwiches**.
El jamón se acabó primero; por lo tanto, el jamón es el **reactivo limitante**, y el pan es el **reactivo en exceso** (te sobraron 4 panes).

En química ocurre exactamente lo mismo:
* **Reactivo Limitante**: La sustancia que se consume íntegramente primero, dictando el límite máximo de producto que puede sintetizarse.
* **Reactivo en Exceso**: La sustancia que sobra cuando la reacción se detiene porque ya no queda más reactivo limitante.`,
        suggestedFollowUps: [
          '¿Cómo se calcula paso a paso?',
          'Explicar porcentaje de rendimiento',
          'Ir al Módulo 4: Reacciones y Estequiometría'
        ]
      };
    }
  },

  // 2. Gases Ideales PV=nRT
  {
    keywords: ['gas', 'gases', 'pv=nrt', 'boyle', 'charles', 'presion', 'volumen', 'temperatura', 'kelvin'],
    moduleRef: 5,
    responseGenerator: (_q, mode) => {
      if (mode === 'stepbystep') {
        return {
          text: `### Resolución Sistemática de Problemas con $PV = nRT$

1. **Anotar las variables e incógnita**: $P$ (Presión), $V$ (Volumen), $n$ (Moles), $T$ (Temperatura).
2. **Homogeneizar unidades**:
   - $P$ debe estar en **atm** ($1\\text{ atm} = 760\\text{ mmHg} = 101325\\text{ Pa}$).
   - $V$ debe estar en **Litros (L)** ($1\\text{ L} = 1000\\text{ mL} = 1\\text{ dm}^3$).
   - $T$ **invariablemente en Kelvin (K)**: $T(K) = ^\\circ C + 273.15$.
   - $n$ en **moles**: si te dan gramos, $n = m / M$.
3. **Elegir el valor de $R$**:
   - $R = 0.08206\\text{ atm}\\cdot\\text{L}/(\\text{mol}\\cdot\\text{K})$.
4. **Despejar la incógnita**:
   - Para Presión: $P = \\frac{nRT}{V}$
   - Para Volumen: $V = \\frac{nRT}{P}$
   - Para Moles: $n = \\frac{PV}{RT}$
   - Para Temperatura: $T = \\frac{PV}{nR}$`,
          suggestedFollowUps: [
            '¿Qué es CNPT y cuánto vale el volumen molar?',
            'Probar el Simulador Interactivo de Gases Ideales',
            'Explícame la ley de Boyle y Charles'
          ]
        };
      }

      return {
        text: `### La Ecuación Universal de los Gases Ideales: $PV = nRT$

Esta ecuación unifica los descubrimientos experimentales de Boyle, Charles y Avogadro:
* **$P$ (Presión)**: Fuerza que ejercen los impactos de las partículas contra las paredes del recipiente.
* **$V$ (Volumen)**: Espacio tridimensional accesible para las moléculas gaseosas.
* **$n$ (Moles)**: Cantidad de partículas del gas ($n = 6.022 \\times 10^{23}$ moléculas por mol).
* **$R$**: Constante de los gases ideales ($0.08206\\text{ atm}\\cdot\\text{L}/(\\text{mol}\\cdot\\text{K})$).
* **$T$**: Temperatura termodinámica absoluta en **Kelvin**.

> **Dato Clave de Examen**: En Condiciones Normales de Presión y Temperatura (**CNPT**: 1 atm y 0 °C / 273.15 K), exactamente **1 mol de cualquier gas ideal ocupa 22.4 Litros**.`,
        suggestedFollowUps: [
          '¿Por qué la temperatura siempre debe estar en Kelvin?',
          '¿Cuáles son las fuerzas intermoleculares en los gases reales?',
          'Simular PV=nRT en la pestaña de herramientas'
        ]
      };
    }
  },

  // 3. Número de Oxidación
  {
    keywords: ['oxidacion', 'numero de oxidacion', 'estado de oxidacion', 'redox', 'reglas', 'asignar'],
    moduleRef: 3,
    responseGenerator: (_q, _mode) => {
      return {
        text: `### Reglas de Oro para Asignar Números de Oxidación

1. **Elemento libre sin combinar**: Siempre tiene estado **0** (ej. $Fe, Cu, H_2, O_2, N_2, P_4, S_8 = 0$).
2. **Flúor ($F$)**: Siempre tiene **-1** en todos sus compuestos (es el elemento más electronegativo).
3. **Oxígeno ($O$)**: Casi siempre tiene **-2**. Excepciones:
   - En peróxidos ($H_2O_2, Na_2O_2$): es **-1**.
   - Con flúor ($OF_2$): es **+2**.
4. **Hidrógeno ($H$)**:
   - **+1** unido a no metales ($H_2O, HCl, NH_3$).
   - **-1** unido a metales (hidruros: $NaH, CaH_2$).
5. **Metales Alcalinos (Grupo 1: Li, Na, K)**: Siempre **+1**.
6. **Metales Alcalinotérreos (Grupo 2: Be, Mg, Ca, Ba)**: Siempre **+2**.
7. **Suma algebraica**:
   - En una molécula neutra, la suma de los estados de oxidación de todos los átomos es igual a **0**.
   - En un ion poliatómico, la suma es igual a la **carga neta del ion**.`,
        suggestedFollowUps: [
          'Calcular el número de oxidación del Cr en K₂Cr₂O₇',
          'Calcular el número de oxidación del Mn en KMnO₄',
          '¿Cuál es la diferencia entre valencia y número de oxidación?'
        ],
        calculationDetails: {
          title: 'Ejemplo guiado: Hallar el estado de oxidación del N en el ión Nitrato (NO₃⁻)',
          steps: [
            'Oxígenos presentes: 3 átomos × (-2) = -6 de carga aportada.',
            'Carga total del ion = -1.',
            'Ecuación: x + (-6) = -1',
            'Despejamos: x = -1 + 6 = +5.'
          ],
          result: 'El Nitrógeno tiene estado de oxidación +5 en el NO₃⁻.'
        }
      };
    }
  },

  // 4. Equilibrio y Le Chatelier
  {
    keywords: ['le chatelier', 'chatelier', 'equilibrio', 'kc', 'kp', 'desplazamiento', 'principio'],
    moduleRef: 6,
    responseGenerator: (_q, _mode) => {
      return {
        text: `### El Principio de Le Chatelier (Regla de la "Resistencia al Cambio")

> *"Si un sistema químico en equilibrio dinámico es perturbado por una alteración en la concentración, la presión o la temperatura, el sistema responderá desplazándose en la dirección que tienda a contrarrestar parcialmente dicha perturbación."*

#### 1. Perturbación de Concentración:
* Si agregas un reactivo $\\rightarrow$ el sistema se desplaza hacia la **DERECHA** (para consumirlo).
* Si retiras un producto $\\rightarrow$ el sistema se desplaza hacia la **DERECHA** (para reponerlo).

#### 2. Perturbación de Presión / Volumen (Gases):
* Al **aumentar la presión** (o reducir volumen) $\\rightarrow$ el equilibrio favorece el lado con **MENOR número de moles de gas**.
* Al **disminuir la presión** (o expandir volumen) $\\rightarrow$ el equilibrio favorece el lado con **MAYOR número de moles de gas**.

#### 3. Perturbación de Temperatura:
* En reacciones **Exotérmicas** ($\\Delta H < 0$, liberan calor):
  - Calentar desplaza a la **IZQUIERDA** (disminuye $K_c$).
* En reacciones **Endotérmicas** ($\\Delta H > 0$, absorben calor):
  - Calentar desplaza a la **DERECHA** (aumenta $K_c$).`,
        suggestedFollowUps: [
          '¿Qué efecto tiene agregar un catalizador al equilibrio?',
          'Explicar el proceso Haber-Bosch para sintetizar amoníaco',
          'Ver el Módulo 6: Termodinámica y Equilibrio'
        ]
      };
    }
  },

  // 5. pH, pOH, Ácidos y Bases
  {
    keywords: ['ph', 'poh', 'acido', 'base', 'concentracion', 'arrhenius', 'bronsted', 'alcalino', 'hidronio'],
    moduleRef: 5,
    responseGenerator: (_q, _mode) => {
      return {
        text: `### Ácidos, Bases y el Cálculo de pH y pOH

La escala de pH cuantifica cuán ácida o alcalina es una disolución acuosa mediante una función logarítmica decimal:

* **$pH = -\\log_{10}[H^+]$**  o  $[H^+] = 10^{-pH}$
* **$pOH = -\\log_{10}[OH^-]$**  o  $[OH^-] = 10^{-pOH}$
* A $25^\\circ\\text{C}$: **$pH + pOH = 14$**

#### Clasificación según el pH:
* **$pH < 7$**: Solución Ácida (mayor $[H^+]$ que $[OH^-]$; jugo de limón $\\sim 2$, café $\\sim 5$).
* **$pH = 7$**: Solución Neutra ($[H^+] = [OH^-] = 10^{-7}\\text{ M}$; agua pura).
* **$pH > 7$**: Solución Básica / Alcalina (mayor $[OH^-]$; sangre $\\sim 7.4$, lejía $\\sim 12$).`,
        suggestedFollowUps: [
          'Calcular el pH de una solución de HCl 0.005 M',
          '¿Cómo funciona la neutralización ácido-base?',
          'Ir a la Calculadora de pH en las herramientas'
        ],
        calculationDetails: {
          title: 'Ejemplo: Calcular el pH de una disolución de NaOH 0.001 M',
          steps: [
            'El NaOH es una base fuerte: NaOH → Na⁺ + OH⁻.',
            '[OH⁻] = 0.001 M = 1.0 × 10⁻³ M.',
            'Calculamos pOH: pOH = -log(10⁻³) = 3.',
            'Calculamos pH: pH = 14 - pOH = 14 - 3 = 11.'
          ],
          result: 'pH = 11 (Disolución fuertemente alcalina).'
        }
      };
    }
  },

  // 6. Configuración electrónica y modelos atómicos
  {
    keywords: ['configuracion electronica', 'orbitales', 'aufbau', 'hund', 'pauli', 'numeros cuanticos', 'atomo', 'protones', 'electrones'],
    moduleRef: 2,
    responseGenerator: (_q, _mode) => {
      return {
        text: `### Configuración Electrónica y Números Cuánticos

La configuración electrónica describe cómo se disponen los electrones en los niveles y orbitales atómicos siguiendo tres reglas capitales:

1. **Principio de Aufbau (Construcción Progresiva)**: Los electrones ocupan primero los orbitales de mínima energía disponible:
   $$1s \\rightarrow 2s \\rightarrow 2p \\rightarrow 3s \\rightarrow 3p \\rightarrow 4s \\rightarrow 3d \\rightarrow 4p \\dots$$
2. **Principio de Exclusión de Pauli**: Un orbital aloja como máximo **2 electrones**, y deben poseer espines antiparalelos ($+1/2$ y $-1/2$).
3. **Regla de Hund (Máxima Multiplicidad)**: En orbitales degenerados (como los 3 orbitales $p$ o los 5 orbitales $d$), los electrones entran de uno en uno con espines paralelos antes de emparejarse.

#### Los 4 Números Cuánticos:
* **$n$ (Principal, $1, 2, 3...$)**: Nivel de energía y distancia promedio al núcleo.
* **$l$ (Azimutal, $0$ a $n-1$)**: Forma del orbital ($s=0, p=1, d=2, f=3$).
* **$m_l$ (Magnético, $-l$ a $+l$)**: Orientación del orbital en el espacio.
* **$m_s$ (Espín, $+1/2, -1/2$)**: Sentido de rotación electromagnética.`,
        suggestedFollowUps: [
          '¿Cuál es la configuración electrónica abreviada con gas noble?',
          'Explicar las excepciones del Cromo (Cr) y Cobre (Cu)',
          'Ver el Módulo 2: Estructura Atómica'
        ]
      };
    }
  },

  // 7. Química Orgánica y Grupos Funcionales
  {
    keywords: ['organica', 'carbono', 'alcanos', 'alquenos', 'alquinos', 'grupos funcionales', 'alcohol', 'aldehido', 'cetona', 'ester', 'biomoleculas', 'proteinas'],
    moduleRef: 7,
    responseGenerator: (_q, _mode) => {
      return {
        text: `### Química Orgánica y los Grupos Funcionales Clave

El carbono es único porque posee **tetravalencia** (forma 4 enlaces covalentes estables) y gran capacidad de **concatenación**.

#### Principales Familias:
* **Hidrocarburos**:
  - *Alcanos* ($C_n H_{2n+2}$): Enlaces simples (ej. metano $CH_4$, propano $C_3H_8$).
  - *Alquenos* ($C_n H_{2n}$): Doble enlace $C=C$ (ej. etileno $C_2H_4$).
  - *Alquinos* ($C_n H_{2n-2}$): Triple enlace $C\\equiv C$ (ej. acetileno $C_2H_2$).
  - *Aromáticos*: Anillo con electrones $\\pi$ deslocalizados (Benceno $C_6H_6$).
* **Grupos Oxigenados**:
  - **Alcoholes** ($-OH$): ej. Etanol.
  - **Aldehídos** ($-CHO$ terminal): ej. Formaldehído.
  - **Cetonas** ($>C=O$ interno): ej. Acetona.
  - **Ácidos Carboxílicos** ($-COOH$): ej. Ácido acético (vinagre).
  - **Ésteres** ($-COO-$): Aromas y perfumes frutales.
* **Biomoléculas**: Carbohidratos, Lípidos, Proteínas (enlaces peptídicos) y Ácidos Nucleicos (ADN/ARN).`,
        suggestedFollowUps: [
          '¿Cómo distinguir un aldehído de una cetona?',
          '¿Cómo se forma un enlace peptídico en proteínas?',
          'Explorar el Módulo 7 de Química Orgánica'
        ]
      };
    }
  },

  // 8. Métodos de separación y conceptos básicos
  {
    keywords: ['separacion', 'mezcla', 'filtracion', 'destilacion', 'decantacion', 'evaporacion', 'homogenea', 'heterogenea', 'sustancia pura'],
    moduleRef: 1,
    responseGenerator: (_q, _mode) => {
      return {
        text: `### Clasificación de la Materia y Métodos de Separación

La materia se divide en:
* **Sustancias Puras**:
  - **Elementos**: Formados por átomos idénticos (ej. $Fe, O_2, Au$). No pueden descomponerse por reacciones químicas.
  - **Compuestos**: Combinaciones fijas de elementos (ej. $H_2O, NaCl$). Se separan solo por métodos químicos.
* **Mezclas**:
  - **Homogéneas (Disoluciones)**: Una sola fase uniforme (ej. aire, agua con sal disuelta, acero).
  - **Heterogéneas**: Varias fases visibles (ej. agua con aceite, granito, suspensiones).

#### Métodos de Separación Físicos:
1. **Filtración**: Separa sólidos insolubles de un líquido (diferencia de tamaño).
2. **Destilación**: Separa líquidos miscibles con diferente punto de ebullición.
3. **Decantación**: Separa fases con diferente densidad e inmiscibles (embudo de decantación).
4. **Evaporación**: Recupera un soluto sólido disuelto evaporando el solvente.`,
        suggestedFollowUps: [
          '¿Cómo separarías sal, arena y agua?',
          '¿Qué es el efecto Tyndall en coloides?',
          'Ir al Módulo 1: Conceptos Básicos'
        ]
      };
    }
  }
];

export function getTutorResponse(userText: string, currentMode: 'didactic' | 'stepbystep' | 'quiz'): ChatMessage {
  const normalized = userText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Match against knowledge items
  let bestMatch: KnowledgeItem | null = null;
  let maxScore = 0;

  for (const item of knowledgeBase) {
    let score = 0;
    for (const kw of item.keywords) {
      const normalizedKw = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(normalizedKw)) {
        score += normalizedKw.length;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  // Check if user is asking to solve a specific molar calculation
  const moleMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:g|gramos)\s*de\s*([a-z0-9()]+)/i);
  if (moleMatch) {
    const mass = parseFloat(moleMatch[1]);
    const formula = moleMatch[2].toUpperCase();
    return {
      id: 'calc-' + Date.now(),
      sender: 'tutor',
      text: `¡Claro! He detectado un cálculo estequiométrico para **${mass} g de ${formula}**:`,
      timestamp: 'Ahora',
      calculationDetails: {
        title: `Cálculo de Moles para ${mass} g de ${formula}`,
        steps: [
          `Fórmula química dada: ${formula}`,
          `Masa dada (m): ${mass} gramos`,
          `Fórmula fundamental: n = m / M`,
          `Puedes obtener la masa molar exacta en la sección de Calculadoras.`
        ],
        result: `Aplica n = ${mass} / M para obtener los moles correspondientes.`
      },
      suggestedFollowUps: [
        'Abrir la Calculadora de Moles y Masa Molar',
        '¿Cómo convertir moles a moléculas?',
        'Resolver un ejercicio de estequiometría'
      ]
    };
  }

  if (bestMatch && maxScore > 2) {
    const result = bestMatch.responseGenerator(userText, currentMode);
    return {
      id: 'msg-' + Date.now(),
      sender: 'tutor',
      text: result.text,
      timestamp: 'Ahora',
      suggestedFollowUps: result.suggestedFollowUps,
      relatedModuleId: bestMatch.moduleRef,
      calculationDetails: result.calculationDetails
    };
  }

  // Fallback intelligent general chemistry assistant reply
  return {
    id: 'msg-' + Date.now(),
    sender: 'tutor',
    text: `Excelente consulta sobre: *"${userText}"*. 

Para responderte con máxima precisión pedagógica, ¿en cuál de las 7 áreas clave del temario encaja mejor tu duda?

1. **Conceptos Básicos**: Materia, estados, cambios de fase, mezclas y unidades SI.
2. **Estructura Atómica**: Átomo, números cuánticos, configuración electrónica y tabla periódica.
3. **Enlaces Químicos**: Iónico, covalente, Lewis, nomenclatura inorgánica y números de oxidación.
4. **Estequiometría**: Reacciones, el mol, balanceo, reactivo limitante y rendimiento.
5. **Gases y Disoluciones**: $PV=nRT$, fuerzas intermoleculares, Molaridad y escala de pH.
6. **Termodinámica y Cinética**: Gibbs ($\\Delta G$), Le Chatelier, velocidad y celdas galvánicas.
7. **Química del Carbono**: Hidrocarburos, grupos funcionales oxigenados y biomoléculas.

Puedes seleccionar cualquiera de las sugerencias rápidas abajo o reformular tu duda.`,
    timestamp: 'Ahora',
    suggestedFollowUps: [
      'Explícame cómo balancear por tanteo',
      '¿Cómo calcular el Reactivo Limitante?',
      '¿Cómo saber si una reacción es espontánea (ΔG)?',
      '¿Cómo funciona la ley de los gases ideales?'
    ]
  };
}
