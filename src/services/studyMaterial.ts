/**
 * Servicio de extracción y carga del material de estudio (carpeta /material_estudio).
 * Provee la base de conocimiento principal para el tutor de química con Gemini.
 */

// Intentar carga dinámica de todos los archivos raw en /material_estudio vía Vite import.meta.glob
const rawStudyFiles = import.meta.glob('/material_estudio/*.{md,txt}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Respaldo estático pre-extraído para garantizar máxima disponibilidad en cualquier entorno de despliegue
const STATIC_MATERIAL_ARCHIVE: Record<string, { title: string; content: string }> = {
  'Metodos_de_balanceo_de_ecuaciones_quimicas.md': {
    title: 'Métodos de balanceo de ecuaciones químicas (UAEH - Lizeth Gómez Chávez)',
    content: `DOCUMENTO: Métodos de balanceo de ecuaciones químicas
AUTOR: Lizeth Gómez Chávez (Universidad Autónoma del Estado de Hidalgo - UAEH, Prepa 3)

RESUMEN Y CONCEPTOS FUNDAMENTALES:
Para representar una reacción química empleamos ecuaciones químicas, que permiten expresar con números, letras y símbolos las reacciones químicas. Las ecuaciones químicas son importantes al momento de realizar cálculos estequiométricos. Para realizar esos cálculos se necesitan ecuaciones balanceadas.

MÉTODOS DE BALANCEO:
1. Método de tanteo:
   - Consiste en identificar la cantidad de átomos de cada elemento presente en reactivos y productos.
   - La ecuación se encuentra en balanceo cuando se tiene la misma cantidad de reactivos y productos.
2. Método algebraico:
   - Se agregan literales (a, b, c, d...) como coeficientes estequiométricos a los compuestos o elementos que forman la ecuación química.
   - Se enlistan los elementos que participan en la ecuación química.
   - Se escriben ecuaciones algebraicas para cada elemento (multiplicando la cantidad de elemento por la literal que se colocó como coeficiente estequiométrico tanto en reactivos como en productos).
   - Se asigna el valor de 1 a la letra que representa el coeficiente estequiométrico que se repita mayor número de veces.
   - Se resuelven las ecuaciones algebraicas para conocer al resto de los coeficientes estequiométricos.
3. Método redox (óxido-reducción):
   - A los hidrógenos presentes en reactivos y productos se les asigna como número de oxidación +1.
   - A los oxígenos -2.
   - A los elementos puros o en estado libre: cero (0).
   - A los elementos que faltan de número de oxidación generamos ecuaciones y las igualamos a cero para conocer su valor.
   - Identificamos elementos que cambiaron de número de oxidación.
   - Analizamos si se reducen (ganan electrones) o se oxidan (pierden electrones), lo que permitirá encontrar el valor de los coeficientes estequiométricos para lograr el balanceo.

RELACIONES ESTEQUIOMÉTRICAS POST-BALANCEO:
Una vez balanceadas las ecuaciones químicas se pueden realizar relaciones estequiométricas como:
- Relación masa-masa
- Relación mol-mol
- Relación mol-masa
Referencias citadas: Chang, R. (2013) Química; Garritz & Chamizo (2001) Tú y la Química.`
  },
  'webmaster,+5.-Resumen(27-29).md': {
    title: 'Balanceo de ecuaciones químicas (UAEH - Yuliana Vicente-Martínez)',
    content: `DOCUMENTO: Balanceo de ecuaciones químicas
AUTOR: Yuliana Vicente-Martínez (UAEH - Escuela Preparatoria Número Cinco)

RESUMEN Y DEFINICIONES:
Una ecuación química la podemos definir como el proceso mediante el cual dos o más sustancias se combinan entre sí para obtener un producto. Indican las cantidades que se combinan de los diferentes reactivos y las cantidades de los productos que se obtendrán. Deben existir el mismo número de átomos tanto en los reactivos como en los productos para que se cumpla con la ley de la conservación de la masa.

PASOS GENERALES PARA BALANCEAR:
- Paso 1: Indicar correctamente cuáles son los reactivos y cuáles son los productos.
- Paso 2: Escribir las fórmulas de los reactivos del lado izquierdo de la flecha y los productos del lado derecho (Reactivos -> Productos).
- Paso 3: Balancear la ecuación por el método adecuado.

MÉTODO DE TANTEO (PASO A PASO):
- Paso 1: Se balancean todos los elementos diferentes al hidrógeno y al oxígeno (metales y no metales).
- Paso 2: Se balancean los hidrógenos.
- Paso 3: Se balancean los oxígenos.
- Paso 4: Se comprueban todos los elementos.
- Paso 5: Se repite el procedimiento en el mismo orden hasta que todos los elementos estén igualados.

EJEMPLOS DE TANTEO RESUELTOS EN EL TEXTO:
Ejemplo 1:
Hg (l) + O2 (g) -> HgO (s)
Paso 1: Hg está 1 a 1.
Paso 3: Balancear oxígenos con un 2 delante de HgO: Hg + O2 -> 2 HgO
Paso 4: Ajustar Hg con un 2: 2 Hg + O2 -> 2 HgO (Ecuación balanceada: 2 átomos de Hg y 2 átomos de O en ambos lados).

Ejemplo 2:
2 KClO3 -> 2 KCl + 3 O2 (Balance de clorato de potasio).

MÉTODO DE ÓXIDO-REDUCCIÓN (REDOX):
Paso 1: Se determinan los números de oxidación de cada uno de los elementos.
Paso 2: Se identifican los elementos que cambian su número de oxidación.
Paso 3: Se escriben las semirreacciones del agente oxidante y el agente reductor, anotando el número de electrones que se ganan o se pierden.
Paso 4: Se iguala el número de electrones ganados y perdidos, multiplicando en forma cruzada los coeficientes de cada átomo por el número de electrones que se transfieren.
Paso 5: Se sustituyen estos coeficientes en la ecuación original.
Paso 6: Se comprueba y termina de ajustar por tanteo si fuera necesario.

EJEMPLO REDOX RESUELTO EN EL TEXTO:
Reacción: Al + S -> Al2S3
- Estados de oxidación iniciales: Al(0) + S(0) -> Al(+3) y S(-2)
- Semirreacción de oxidación: Al(0) - 3 e- -> Al(+3)  (multiplicado por 2 átomos = 2 Al - 6 e- -> 2 Al)
- Semirreacción de reducción: S(0) + 2 e- -> S(-2)   (multiplicado por 3 átomos = 3 S + 6 e- -> 3 S)
- Ecuación balanceada final:
  2 Al (s) + 3 S (s) -> Al2S3 (s)
- Elemento oxidado: Al
- Elemento reducido: S
- Electrones intercambiados: 6 e-
- Agente oxidante: S (provoca la oxidación del Al y se reduce)
- Agente reductor: Al (provoca la reducción del S y se oxida)`
  }
};

/**
 * Obtiene el texto consolidado de todo el material de estudio cargado en /material_estudio.
 */
export function getStudyMaterialKnowledge(): string {
  const sections: string[] = [];

  // 1. Agregar archivos cargados dinámicamente vía Vite glob
  if (rawStudyFiles && Object.keys(rawStudyFiles).length > 0) {
    for (const [filePath, content] of Object.entries(rawStudyFiles)) {
      if (content && typeof content === 'string' && content.trim().length > 0) {
        const fileName = filePath.split('/').pop() || filePath;
        // Evitar el README si solo tiene descripción
        if (fileName.toLowerCase() === 'readme.md' && content.length < 150) {
          continue;
        }
        sections.push(`--- ARCHIVO DE ESTUDIO: ${fileName} ---\n${content.trim()}`);
      }
    }
  }

  // 2. Si no hay archivos dinámicos o para complementar, usar el archivo estructurado
  if (sections.length === 0) {
    for (const [key, doc] of Object.entries(STATIC_MATERIAL_ARCHIVE)) {
      sections.push(`--- DOCUMENTO: ${doc.title} (${key}) ---\n${doc.content}`);
    }
  }

  return sections.join('\n\n');
}

/**
 * Genera la instrucción de contexto del material de estudio para incluir en el System Prompt de Gemini.
 */
export function buildStudyMaterialPromptContext(): string {
  const material = getStudyMaterialKnowledge();

  return `### BASE DE CONOCIMIENTO PRINCIPAL (MATERIAL DE ESTUDIO OFICIAL - CARPETA material_estudio):
Tienes acceso al libro y material de estudio oficial cargado por el docente en la carpeta "material_estudio".
DEBES UTILIZAR ESTE MATERIAL COMO TU FUENTE DE VERDAD Y REFERENCIA PRIORITARIA en tus explicaciones, ejemplos, metodologías y ejercicios.

${material}

DIRECTRICES RESPECTO AL MATERIAL DE ESTUDIO:
1. Si el estudiante te consulta sobre balanceo de ecuaciones (tanteo, algebraico o redox), estequiometría, o temas presentes en los documentos anteriores, sigue fielmente los pasos, la terminología y los ejemplos explicados en este material.
2. Si te pide ejercicios, puedes proponerle los ejemplos y problemas planteados en estas publicaciones (como el balanceo de Hg + O2, KClO3, Al + S, combustión de alcoholes o relaciones masa-masa y mol-mol).
3. Mantén siempre las reglas estrictas de formato de texto plano sin signos de dólar ni formatos matemáticos complejos.`;
}
