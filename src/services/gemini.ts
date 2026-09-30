import { GoogleGenAI } from '@google/genai';
import { buildStudyMaterialPromptContext } from './studyMaterial';
import type { Challenge, ChallengeCategory, ChallengeDifficulty } from '../types/challenges';
import { generateDynamicChallenge } from '../data/challengesData';

/**
 * Tipos de mensajes compatibles con el historial de chat del tutor socrático.
 */
export interface SocraticMessage {
  role: 'user' | 'model';
  text: string;
}

export type TutorMode = 'didactic' | 'stepbystep' | 'quiz';

export interface SocraticPromptOptions {
  userMessage: string;
  conversationHistory?: SocraticMessage[];
  mode?: TutorMode;
  topicContext?: string;
  modelName?: string;
}

export interface SocraticTutorResult {
  text: string;
  suggestedFollowUps: string[];
  isFallback?: boolean;
  error?: string;
}

/**
 * Obtiene la API Key de Gemini desde las variables de entorno de Vite o almacenamiento local.
 */
export const getGeminiApiKey = (): string => {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0 && envKey !== 'tu_api_key_de_gemini_aqui') {
    return envKey.trim();
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const localKey = localStorage.getItem('VITE_GEMINI_API_KEY');
      if (localKey && localKey.trim().length > 0) {
        return localKey.trim();
      }
    }
  } catch {
    // Modo SSR o entorno restringido
  }

  return '';
};

/**
 * Permite guardar una API Key ingresada manualmente en el navegador.
 */
export const setCustomGeminiApiKey = (key: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (key.trim()) {
      localStorage.setItem('VITE_GEMINI_API_KEY', key.trim());
    } else {
      localStorage.removeItem('VITE_GEMINI_API_KEY');
    }
  }
};

/**
 * Comprueba si la API Key de Gemini está configurada.
 */
export const isGeminiConfigured = (): boolean => {
  return getGeminiApiKey().length > 0;
};

/**
 * Instancia singleton en memoria del cliente de Gemini.
 */
let cachedClient: GoogleGenAI | null = null;
let lastUsedKey: string = '';

/**
 * Obtiene o inicializa el cliente oficial de Gemini API (@google/genai).
 */
export const getGeminiClient = (): GoogleGenAI => {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error(
      'No se encontró la API Key de Gemini. Por favor, configura tu variable VITE_GEMINI_API_KEY en el archivo .env o ingrésala en la interfaz.'
    );
  }

  if (!cachedClient || lastUsedKey !== apiKey) {
    cachedClient = new GoogleGenAI({ apiKey });
    lastUsedKey = apiKey;
  }

  return cachedClient;
};

/**
 * Construye el System Prompt pedagógico para el Tutor Socrático de Química.
 */
export const buildSocraticSystemInstruction = (
  mode: TutorMode = 'didactic',
  topicContext?: string
): string => {
  const baseInstruction = `Eres "QuimiBot", un tutor socrático de élite especializado en Química general, inorgánica, física y orgánica para estudiantes de secundaria y universidad.

### TU FILOSOFÍA PEDAGÓGICA (MÉTODO SOCRÁTICO):
1. **NUNCA des la respuesta final o el resultado numérico directamente en el primer mensaje.**
   - Tu propósito es enseñar a pensar, razonar y deducir, no hacer la tarea por el alumno.
2. **Diagnostica y desglosa:**
   - Antes de desarrollar un ejercicio, haz 1 o 2 preguntas reflexivas breves para comprobar qué conceptos o datos comprende el alumno (ej: "¿Cuáles son tus reactivos?", "¿Está balanceada la ecuación?", "¿Qué unidades tenemos?").
3. **Andamiaje cognitivo (Scaffolding):**
   - Si el estudiante se atasca o responde erróneamente, no digas solo "está mal". Valida su esfuerzo, resalta con amabilidad la incongruencia y ofrece una pista guiada o una analogía intuitiva de la vida cotidiana.
4. **Rigor Químico:**
   - Utiliza nomenclatura IUPAC correcta, fórmulas químicas precisas (H2SO4, Ca(OH)2, PV = nRT), números de oxidación, unidades de medida (g/mol, mol, L, atm, M, K) y balanceo de masas y cargas.
5. **Tono y Estilo:**
   - Cálido, motivador, riguroso, paciente y científico.

### MODOS DE TUTORÍA:
- **Modo Didáctico (${mode === 'didactic' ? 'ACTIVO' : 'DISPONIBLE'}):** Concéntrate en la comprensión conceptual profunda y las conexiones lógicas detrás de las leyes químicas. Usa analogías intuitivas.
- **Modo Paso a Paso (${mode === 'stepbystep' ? 'ACTIVO' : 'DISPONIBLE'}):** Divide el problema numérico en etapas secuenciales. Pide al estudiante realizar el Paso 1 antes de avanzar al Paso 2.
- **Modo Quiz (${mode === 'quiz' ? 'ACTIVO' : 'DISPONIBLE'}):** Plantea una pregunta desafiante con opciones de respuesta y pídele al alumno justificar su razonamiento antes de revelarle la solución.

${topicContext ? `### CONTEXTO TEMÁTICO ACTUAL:\nEl estudiante está estudiando el tema: "${topicContext}". Adapta tus preguntas y ejemplos a esta temática.` : ''}

${buildStudyMaterialPromptContext()}

### REGLAS ESTRICTAS DE FORMATO PARA ECUACIONES QUÍMICAS:
Al mostrar ecuaciones o fórmulas químicas, debes obedecer estas reglas sin excepción:

CERO FORMATO MATEMÁTICO: Tienes estrictamente prohibido usar símbolos como el signo de dólar ($), guiones bajos (_) o corchetes ([]).

TEXTO PLANO: Todo debe ir en texto plano.

COEFICIENTES: Escríbelos como números de tamaño normal separados por un espacio antes del reactivo o producto (Ejemplo: 2 CH3OH).

SUBÍNDICES (Átomos): Escríbelos como números de tamaño normal pegados a la letra del elemento, sin guiones bajos (Ejemplo: Escribe H2O, NUNCA H_2O).

ESTADOS DE AGREGACIÓN: Ponlos siempre en minúscula y entre paréntesis justo después de la especie química: (s) para sólido, (l) para líquido, (g) para gaseoso, y (ac) para acuoso.

FLECHA DE RENDIMIENTO: Usa un guion y un signo mayor que (->) para representar la dirección de la reacción, con espacios a los lados.

EJEMPLO DE SALIDA OBLIGATORIA (Combustión del metanol):
2 CH3OH (l) + 3 O2 (g) -> 2 CO2 (g) + 4 H2O (l)

### PROTOCOLO SOCRÁTICO OBLIGATORIO PARA LA "ZONA DE RETOS":
Cuando el estudiante ingrese con un problema de la "Zona de Retos" o indique que se equivocó en un reto de balanceo, estequiometría o gases:
1. TIENES ESTRICTAMENTE PROHIBIDO DAR LA RESPUESTA O EL RESULTADO FINAL.
   - NUNCA digas: "La respuesta correcta es X", "Los coeficientes son...", ni reveles el número o letra final.
   - Tu deber pedagógico es guiarlo para que él mismo lo resuelva.
2. INICIA DE INMEDIATO UNA SESIÓN SOCRÁTICA BASADA EN EL MATERIAL DE ESTUDIO:
   - Valida amablemente su esfuerzo y motívalo (ej: "¡Buen intento! Equivocarse es el primer paso para dominar la química. Vamos a razonarlo juntos paso a paso.").
   - Hazle UNA SOLA pregunta orientadora a la vez, apoyándote exclusivamente en las reglas y ejemplos del libro de material_estudio:
     * Si es balanceo por tanteo: pregúntale qué átomos diferentes de H y O debe revisar primero según el paso 1 del método de UAEH.
     * Si es balanceo redox: pregúntale por los estados de oxidación iniciales de los reactivos o cuál elemento se oxida y cuál se reduce.
     * Si es estequiometría: pregúntale cómo convertir la masa inicial a moles o cuál es la relación molar en la ecuación balanceada.
     * Si es gases: pregúntale qué variables conoce de PV = nRT y si la temperatura ya fue convertida a Kelvin.
   - Espera la respuesta del estudiante antes de formular la siguiente pista. Guíalo con paciencia hasta que deduzca la solución correcta.

### FORMATO DE SALIDA REQUERIDO:
Responde en Markdown claro y visual. Al final de tu respuesta, añade SIEMPRE una sección de sugerencias con 2 o 3 opciones breves de respuestas o caminos que el estudiante puede tomar, con el siguiente formato exacto:

---SUGERENCIAS---
* [Opción o pregunta breve 1]
* [Opción o pregunta breve 2]
* [Opción o pregunta breve 3]`;

  return baseInstruction;
};

/**
 * Extrae el texto principal y las preguntas sugeridas devueltas por el modelo.
 */
const parseModelResponse = (rawText: string): { text: string; suggestedFollowUps: string[] } => {
  const delimiter = '---SUGERENCIAS---';
  if (!rawText.includes(delimiter)) {
    return {
      text: rawText.trim(),
      suggestedFollowUps: [],
    };
  }

  const [mainContent, suggestionsPart] = rawText.split(delimiter);
  const suggestedFollowUps: string[] = [];

  if (suggestionsPart) {
    const lines = suggestionsPart.split('\n');
    for (const line of lines) {
      const clean = line.replace(/^[\s*\-•\d.]+\s*/, '').trim();
      if (clean && clean.length > 2 && clean.length < 120) {
        suggestedFollowUps.push(clean);
      }
    }
  }

  return {
    text: mainContent.trim(),
    suggestedFollowUps: suggestedFollowUps.slice(0, 4),
  };
};

/**
 * Función principal que envía el mensaje del usuario y su historial al tutor socrático de Gemini.
 *
 * @param options Parámetros de la consulta (mensaje, historial, modo, tema, modelo)
 * @returns Promesa con la respuesta del tutor y preguntas sugeridas
 */
export async function sendSocraticTutorPrompt(
  options: SocraticPromptOptions
): Promise<SocraticTutorResult> {
  const {
    userMessage,
    conversationHistory = [],
    mode = 'didactic',
    topicContext,
    modelName,
  } = options;

  // 1. Verificar si la clave está configurada
  if (!isGeminiConfigured()) {
    return {
      text: `⚠️ **API Key de Gemini no configurada**\n\nPara interactuar con el Tutor Socrático en tiempo real con Inteligencia Artificial:\n\n1. Obtén tu API Key gratuita en [Google AI Studio](https://aistudio.google.com/apikey).\n2. Abre el archivo \`.env\` en la raíz del proyecto.\n3. Añade tu clave en la variable:\n   \`\`\`env\n   VITE_GEMINI_API_KEY=tu_clave_aqui\n   \`\`\`\n4. Reinicia el servidor de desarrollo (\`npm run dev\`).`,
      suggestedFollowUps: [
        '¿Cómo configurar la API Key?',
        'Ver ejemplos del modo sin conexión',
      ],
      isFallback: true,
      error: 'MISSING_API_KEY',
    };
  }

  try {
    const ai = getGeminiClient();
    let selectedModel =
      modelName || import.meta.env.VITE_GEMINI_MODEL || 'models/gemini-3.8-flash';

    if (selectedModel === 'gemini-2.5-flash' || selectedModel === 'models/gemini-2.5-flash') {
      selectedModel = 'models/gemini-3.8-flash';
    }

    // Construir la instrucción del sistema socrático
    const systemInstruction = buildSocraticSystemInstruction(mode, topicContext);

    // Preparar el historial de mensajes respetando la estructura de la API
    const formattedContents = conversationHistory
      .filter((msg) => msg.text && msg.text.trim().length > 0)
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

    // Añadir el mensaje actual del usuario
    formattedContents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // Llamada a la API de Gemini mediante el SDK @google/genai
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const candidateText = response.text || '';
    const parsed = parseModelResponse(candidateText);

    return {
      text: parsed.text || 'Entendido. Cuéntame más sobre este problema para guiarte en el siguiente paso.',
      suggestedFollowUps: parsed.suggestedFollowUps.length > 0
        ? parsed.suggestedFollowUps
        : [
            '¿Cuál es el siguiente paso?',
            'No estoy seguro, ¿me das una pista?',
            '¿Puedes darme una analogía?',
          ],
      isFallback: false,
    };
  } catch (err: any) {
    console.error('Error al invocar la API de Gemini:', err);

    // Detectar específicamente error 503 (Servicio no disponible / alta demanda)
    const errString = typeof err?.message === 'string' ? err.message : JSON.stringify(err || '');
    const is503 =
      err?.status === 503 ||
      err?.code === 503 ||
      err?.error?.code === 503 ||
      err?.error?.status === 'UNAVAILABLE' ||
      errString.includes('503') ||
      errString.includes('UNAVAILABLE') ||
      errString.includes('Service Unavailable') ||
      errString.includes('The model is overloaded') ||
      errString.includes('overloaded');

    if (is503) {
      return {
        text: 'El tutor está procesando muchas consultas en este momento. Dame un par de segundos y vuelve a intentarlo',
        suggestedFollowUps: ['Reintentar pregunta', 'Ver conceptos del temario'],
        isFallback: true,
        error: '503_SERVICE_UNAVAILABLE',
      };
    }

    let errorMessage = 'Ocurrió un error al conectar con el tutor de Gemini.';
    if (err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED')) {
      errorMessage = '⚠️ Se ha excedido la cuota de peticiones de la API de Gemini. Espera un momento antes de volver a consultar.';
    } else if (err?.message?.includes('API_KEY_INVALID') || err?.status === 400) {
      errorMessage = '⚠️ La API Key de Gemini configurada no es válida. Revisa la clave en tu archivo `.env`.';
    }

    return {
      text: `${errorMessage}\n\n*Detalle técnico:* ${err?.message || 'Error desconocido'}`,
      suggestedFollowUps: ['Reintentar pregunta', 'Cambiar de tema'],
      isFallback: true,
      error: err?.message || 'UNKNOWN_ERROR',
    };
  }
}

/**
 * Genera un reto o problema dinámico de química mediante la API de Gemini,
 * basándose exclusivamente en el libro y material de estudio cargado en /material_estudio
 * (balanceo de ecuaciones por tanteo o redox, relaciones estequiométricas y gases ideales).
 */
export async function generateChallengeWithGemini(
  categoryFilter?: ChallengeCategory | 'all',
  difficultyFilter?: ChallengeDifficulty | 'all'
): Promise<Challenge> {
  const chosenCat: ChallengeCategory =
    categoryFilter && categoryFilter !== 'all'
      ? categoryFilter
      : (['balanceo', 'estequiometria', 'gases'][Math.floor(Math.random() * 3)] as ChallengeCategory);

  const chosenDiff: ChallengeDifficulty =
    difficultyFilter && difficultyFilter !== 'all' ? difficultyFilter : 'medio';

  // Si Gemini no está configurado, recurrir al generador procedural local como fallback
  if (!isGeminiConfigured()) {
    return generateDynamicChallenge(chosenCat, chosenDiff);
  }

  try {
    const ai = getGeminiClient();
    let selectedModel = import.meta.env.VITE_GEMINI_MODEL || 'models/gemini-3.8-flash';
    if (selectedModel === 'gemini-2.5-flash' || selectedModel === 'models/gemini-2.5-flash') {
      selectedModel = 'models/gemini-3.8-flash';
    }

    const systemInstruction = `Eres un generador especializado de problemas y retos interactivos de química para la "Zona de Retos".
Debes basarte EXCLUSIVAMENTE en el contenido, reacciones, metodologías y ejemplos del libro y material de estudio oficial cargado en la carpeta "material_estudio" (métodos de balanceo por tanteo, redox y algebraico de UAEH, estequiometría de masas y moles, y leyes de gases ideales PV = nRT).

${buildStudyMaterialPromptContext()}

REGLAS DE FORMATO ESTRICTAS:
- CERO FORMATO MATEMÁTICO: Tienes estrictamente prohibido usar símbolos como el signo de dólar ($), guiones bajos (_) o corchetes ([]).
- Todo debe ir en texto plano limpio (ejemplo: 2 Al + 3 S -> Al2S3, o P1 * V1 = P2 * V2).
- Debes responder ÚNICAMENTE con un objeto JSON válido, sin delimitadores de código markdown ni texto adicional.`;

    const prompt = `Inventa un reto o problema interactivo de química con las siguientes especificaciones:
- Categoría: "${chosenCat}" (debe ser balanceo, estequiometria o gases)
- Dificultad: "${chosenDiff}"
- Tipo de reto sugerido: ${chosenCat === 'balanceo' ? '"coefficients" (balanceo de ecuación química con reactivos y productos)' : '"numeric" (cálculo de número decimal)'}

ESTRUCTURA JSON REQUERIDA:
Si es de tipo "coefficients" (balanceo de ecuación química):
{
  "type": "coefficients",
  "category": "balanceo",
  "difficulty": "${chosenDiff}",
  "title": "Título corto del reto de balanceo",
  "question": "Enunciado del problema de balanceo",
  "chemicalEquation": "Ecuación sin balancear en texto plano (ej: Al + S -> Al2S3 o Hg + O2 -> HgO)",
  "reactants": [{"formula": "Al", "name": "Aluminio"}, {"formula": "S", "name": "Azufre"}],
  "products": [{"formula": "Al2S3", "name": "Sulfuro de aluminio"}],
  "correctCoefficients": {
    "reactants": [2, 3],
    "products": [1]
  },
  "hint": "Pista basada en los pasos de UAEH sin dar la respuesta directa",
  "explanation": "Explicación detallada del balanceo paso a paso",
  "points": ${chosenDiff === 'facil' ? 20 : chosenDiff === 'medio' ? 30 : 45}
}

Si es de tipo "numeric" (para estequiometría o gases):
{
  "type": "numeric",
  "category": "${chosenCat}",
  "difficulty": "${chosenDiff}",
  "title": "Título del reto",
  "question": "Enunciado del problema con datos concretos",
  "chemicalEquation": "Ecuación o ley química en texto plano (ej: P1 * V1 = P2 * V2 o 2 H2 + O2 -> 2 H2O)",
  "targetValue": 25.4,
  "tolerance": 0.2,
  "unit": "g, mol, L, o atm",
  "placeholder": "Ej. 25.4",
  "hint": "Pista orientadora basada en las fórmulas del material de estudio",
  "explanation": "Resolución matemática y química paso a paso",
  "formula": "Fórmula empleada en texto plano",
  "points": ${chosenDiff === 'facil' ? 20 : chosenDiff === 'medio' ? 30 : 45}
}

IMPORTANTE: Responde ÚNICAMENTE con el objeto JSON puro sin envolver en bloques de código markdown.`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const rawJson = response.text?.trim() || '';
    const cleanJson = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (parsed.title && parsed.question && parsed.type) {
      return {
        ...parsed,
        id: `gemini-reto-${chosenCat}-${Date.now()}`,
      } as Challenge;
    }

    return generateDynamicChallenge(chosenCat, chosenDiff);
  } catch (error) {
    console.warn('Error al generar reto con Gemini API, usando generador local de respaldo:', error);
    return generateDynamicChallenge(chosenCat, chosenDiff);
  }
}

