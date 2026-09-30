import { GoogleGenAI } from '@google/genai';

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
   - Utiliza nomenclatura IUPAC correcta, fórmulas químicas precisas ($H_2SO_4$, $Ca(OH)_2$, $PV = nRT$), números de oxidación, unidades de medida ($g/mol$, $mol$, $L$, $atm$, $M$, $K$) y balanceo de masas y cargas.
5. **Tono y Estilo:**
   - Cálido, motivador, riguroso, paciente y científico.

### MODOS DE TUTORÍA:
- **Modo Didáctico (${mode === 'didactic' ? 'ACTIVO' : 'DISPONIBLE'}):** Concéntrate en la comprensión conceptual profunda y las conexiones lógicas detrás de las leyes químicas. Usa analogías intuitivas.
- **Modo Paso a Paso (${mode === 'stepbystep' ? 'ACTIVO' : 'DISPONIBLE'}):** Divide el problema numérico en etapas secuenciales. Pide al estudiante realizar el Paso 1 antes de avanzar al Paso 2.
- **Modo Quiz (${mode === 'quiz' ? 'ACTIVO' : 'DISPONIBLE'}):** Plantea una pregunta desafiante con opciones de respuesta y pídele al alumno justificar su razonamiento antes de revelarle la solución.

${topicContext ? `### CONTEXTO TEMÁTICO ACTUAL:\nEl estudiante está estudiando el tema: "${topicContext}". Adapta tus preguntas y ejemplos a esta temática.` : ''}

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
