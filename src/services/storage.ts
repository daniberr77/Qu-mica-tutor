import type { StudentProfile, ConversationSession, ChatExportFormat } from '../types';
import { INITIAL_GREETING } from '../data/tutorKnowledge';

const KEY_PROFILE = 'quimica_tutor_profile_v1';
const KEY_CONVERSATIONS = 'quimica_tutor_conversations_v1';
const KEY_ACTIVE_CONV = 'quimica_tutor_active_conv_id';

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: 'student-main',
  name: 'Estudiante de Química',
  level: 'Preuniversitario',
  avatar: '🔬',
  xp: 120,
  streakDays: 1,
  lastActiveDate: getTodayDateString(),
  completedModules: [],
  completedSubtopics: [],
  quizScores: {},
  masteredFlashcards: [],
  favoriteElements: [1, 6, 8],
  notes: {},
};

export const createDefaultInitialConversation = (): ConversationSession => {
  const now = new Date().toISOString();
  return {
    id: 'conv-' + Date.now(),
    title: 'Bienvenida a QuimiBot',
    createdAt: now,
    updatedAt: now,
    mode: 'didactic',
    pinned: true,
    messages: [INITIAL_GREETING],
    tags: ['introducción', 'tutor'],
  };
};

// Safe LocalStorage helpers
function safeGet<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    const item = window.localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`[StorageService] Error reading key "${key}":`, err);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[StorageService] Error writing key "${key}":`, err);
    return false;
  }
}

// Student Profile Methods
export function getStoredProfile(): StudentProfile {
  const profile = safeGet<StudentProfile>(KEY_PROFILE, DEFAULT_STUDENT_PROFILE);
  // Ensure all keys exist in case of schema migrations
  return {
    ...DEFAULT_STUDENT_PROFILE,
    ...profile,
  };
}

export function saveStoredProfile(profile: StudentProfile): boolean {
  return safeSet(KEY_PROFILE, profile);
}

// Conversations Storage Methods
export function getStoredConversations(): ConversationSession[] {
  const stored = safeGet<ConversationSession[]>(KEY_CONVERSATIONS, []);
  if (!Array.isArray(stored) || stored.length === 0) {
    const defaultConv = createDefaultInitialConversation();
    safeSet(KEY_CONVERSATIONS, [defaultConv]);
    return [defaultConv];
  }
  return stored;
}

export function saveStoredConversations(conversations: ConversationSession[]): boolean {
  return safeSet(KEY_CONVERSATIONS, conversations);
}

export function getStoredActiveConversationId(): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(KEY_ACTIVE_CONV);
  } catch {
    return null;
  }
}

export function saveStoredActiveConversationId(id: string | null): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (id) {
      window.localStorage.setItem(KEY_ACTIVE_CONV, id);
    } else {
      window.localStorage.removeItem(KEY_ACTIVE_CONV);
    }
  } catch (err) {
    console.error('[StorageService] Error setting active conversation ID:', err);
  }
}

// Export & File Download Utilities
export function exportConversationToString(conv: ConversationSession, format: ChatExportFormat): string {
  if (format === 'json') {
    return JSON.stringify(conv, null, 2);
  }

  const dateStr = new Date(conv.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (format === 'markdown') {
    let md = `# Historial de Tutoría: ${conv.title}\n\n`;
    md += `* **Fecha de inicio:** ${dateStr}\n`;
    md += `* **Modo pedagógico:** ${conv.mode.toUpperCase()}\n`;
    md += `* **ID de sesión:** \`${conv.id}\`\n\n`;
    md += `---\n\n`;

    conv.messages.forEach((msg, idx) => {
      const senderName = msg.sender === 'user' ? '🧑 Estudiante' : '🤖 QuimiBot (Tutor)';
      md += `### ${idx + 1}. ${senderName} _(${msg.timestamp})_\n\n`;
      md += `${msg.text}\n\n`;

      if (msg.calculationDetails) {
        md += `> **Cálculo Estequiométrico / Numérico:** ${msg.calculationDetails.title}\n`;
        msg.calculationDetails.steps.forEach((step, sIdx) => {
          md += `> - **Paso ${sIdx + 1}:** ${step}\n`;
        });
        md += `> **Resultado:** ${msg.calculationDetails.result}\n\n`;
      }

      if (msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0) {
        md += `*Preguntas sugeridas:* ${msg.suggestedFollowUps.join(' • ')}\n\n`;
      }
      md += `---\n\n`;
    });

    return md;
  }

  // Plain Text
  let txt = `========================================================\n`;
  txt += `SESION DE QUIMIBOT: ${conv.title.toUpperCase()}\n`;
  txt += `Fecha: ${dateStr} | Modo: ${conv.mode}\n`;
  txt += `========================================================\n\n`;

  conv.messages.forEach((msg, idx) => {
    const sender = msg.sender === 'user' ? 'ESTUDIANTE' : 'QUIMIBOT';
    txt += `[#${idx + 1} - ${sender} (${msg.timestamp})]\n`;
    txt += `${msg.text.replace(/\*\*/g, '').replace(/###/g, '')}\n`;

    if (msg.calculationDetails) {
      txt += `\n[DETALLES DE CALCULO]\n${msg.calculationDetails.title}\n`;
      msg.calculationDetails.steps.forEach((step, sIdx) => {
        txt += `  ${sIdx + 1}. ${step}\n`;
      });
      txt += `  Resultado: ${msg.calculationDetails.result}\n`;
    }
    txt += `\n--------------------------------------------------------\n\n`;
  });

  return txt;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function downloadConversation(conv: ConversationSession, format: ChatExportFormat = 'markdown'): void {
  const content = exportConversationToString(conv, format);
  const safeTitle = conv.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 30);
  
  const extensions: Record<ChatExportFormat, { ext: string; mime: string }> = {
    markdown: { ext: 'md', mime: 'text/markdown;charset=utf-8' },
    json: { ext: 'json', mime: 'application/json;charset=utf-8' },
    text: { ext: 'txt', mime: 'text/plain;charset=utf-8' },
  };

  const { ext, mime } = extensions[format];
  const filename = `conversacion_${safeTitle}_${Date.now()}.${ext}`;
  downloadFile(content, filename, mime);
}
