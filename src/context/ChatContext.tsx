import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ConversationSession, TutorModeType, ChatExportFormat } from '../types';
import {
  getStoredConversations,
  saveStoredConversations,
  getStoredActiveConversationId,
  saveStoredActiveConversationId,
  createDefaultInitialConversation,
  exportConversationToString,
  downloadConversation as downloadConversationFile,
} from '../services/storage';
import { getTutorResponse, INITIAL_GREETING } from '../data/tutorKnowledge';
import { sendSocraticTutorPrompt, isGeminiConfigured } from '../services/gemini';
import { useStudent } from './StudentContext';

interface ChatContextType {
  conversations: ConversationSession[];
  activeConversationId: string;
  activeConversation: ConversationSession | null;
  currentMode: TutorModeType;
  isGeminiActive: boolean;
  isTyping: boolean;
  sendMessage: (text: string) => Promise<void>;
  createNewConversation: (mode?: TutorModeType, title?: string) => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  togglePinConversation: (id: string) => void;
  clearActiveConversation: () => void;
  clearAllConversations: () => void;
  exportConversation: (id: string, format: ChatExportFormat) => string;
  downloadConversation: (id: string, format?: ChatExportFormat) => void;
  setCurrentMode: (mode: TutorModeType) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addXp, deductCredit, profile, setIsPremiumModalOpen } = useStudent();

  const [conversations, setConversations] = useState<ConversationSession[]>(() => {
    return getStoredConversations();
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    const savedId = getStoredActiveConversationId();
    const storedList = getStoredConversations();
    if (savedId && storedList.some((c) => c.id === savedId)) {
      return savedId;
    }
    return storedList[0]?.id || 'conv-default';
  });

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const lastSendTimestampRef = useRef<number>(0);
  const RATE_LIMIT_COOLDOWN_MS = 1200; // Control de frecuencia para evitar saturación del servicio

  // Persist conversations
  useEffect(() => {
    saveStoredConversations(conversations);
  }, [conversations]);

  // Persist active ID
  useEffect(() => {
    saveStoredActiveConversationId(activeConversationId);
  }, [activeConversationId]);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || conversations[0] || null;
  }, [conversations, activeConversationId]);

  const currentMode: TutorModeType = activeConversation?.mode || 'didactic';

  const setCurrentMode = useCallback((mode: TutorModeType) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === activeConversationId ? { ...conv, mode } : conv))
    );
  }, [activeConversationId]);

  const createNewConversation = useCallback(
    (mode: TutorModeType = 'didactic', title?: string): string => {
      const now = new Date().toISOString();
      const newId = 'conv-' + Date.now();
      const newSession: ConversationSession = {
        id: newId,
        title: title || 'Nueva Consulta de Química',
        createdAt: now,
        updatedAt: now,
        mode,
        pinned: false,
        messages: [
          {
            ...INITIAL_GREETING,
            id: 'welcome-' + Date.now(),
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          },
        ],
        tags: ['química'],
      };

      setConversations((prev) => [newSession, ...prev]);
      setActiveConversationId(newId);
      setCurrentMode(mode);
      return newId;
    },
    []
  );

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (filtered.length === 0) {
          const fresh = createDefaultInitialConversation();
          setActiveConversationId(fresh.id);
          return [fresh];
        }
        if (activeConversationId === id) {
          setActiveConversationId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeConversationId]
  );

  const renameConversation = useCallback((id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: trimmed, updatedAt: new Date().toISOString() } : c))
    );
  }, []);

  const togglePinConversation = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  }, []);

  const clearActiveConversation = useCallback(() => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              updatedAt: new Date().toISOString(),
              messages: [
                {
                  ...INITIAL_GREETING,
                  id: 'welcome-' + Date.now(),
                  timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }
          : c
      )
    );
  }, [activeConversationId]);

  const clearAllConversations = useCallback(() => {
    const fresh = createDefaultInitialConversation();
    setConversations([fresh]);
    setActiveConversationId(fresh.id);
    setCurrentMode('didactic');
  }, []);

  const exportConversation = useCallback(
    (id: string, format: ChatExportFormat): string => {
      const conv = conversations.find((c) => c.id === id) || activeConversation;
      if (!conv) return '';
      return exportConversationToString(conv, format);
    },
    [conversations, activeConversation]
  );

  const downloadConversation = useCallback(
    (id: string, format: ChatExportFormat = 'markdown') => {
      const conv = conversations.find((c) => c.id === id) || activeConversation;
      if (!conv) return;
      downloadConversationFile(conv, format);
    },
    [conversations, activeConversation]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      const now = Date.now();
      // Control de envíos (Rate Limiting): Bloquear peticiones duplicadas o envíos consecutivos rápidos
      if (!trimmed || isTyping || now - lastSendTimestampRef.current < RATE_LIMIT_COOLDOWN_MS) {
        return;
      }

      // Verificación estricta de créditos diarios y Premium
      if (!profile.isPremium && profile.credits <= 0) {
        setIsPremiumModalOpen(true);
        return;
      }

      // Deducir 1 crédito por mensaje enviado al tutor Gemini
      const creditDeducted = await deductCredit();
      if (!creditDeducted) {
        setIsPremiumModalOpen(true);
        return;
      }

      lastSendTimestampRef.current = now;

      const userTime = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const userMsg = {
        id: 'user-' + Date.now(),
        sender: 'user' as const,
        text: trimmed,
        timestamp: userTime,
      };

      // Add user message immediately
      setConversations((prev) => {
        return prev.map((c) => {
          if (c.id === activeConversationId) {
            // Auto update title if it has default title and only 1 welcome message
            let updatedTitle = c.title;
            if (
              (c.title === 'Bienvenida a QuimiBot' || c.title === 'Nueva Consulta de Química') &&
              c.messages.length <= 2
            ) {
              const cleanPrompt = trimmed
                .replace(/^[¿¡?!\s]+|[¿¡?!\s]+$/g, '')
                .slice(0, 32);
              updatedTitle = cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);
            }

            return {
              ...c,
              title: updatedTitle,
              updatedAt: new Date().toISOString(),
              messages: [...c.messages, userMsg],
            };
          }
          return c;
        });
      });

      // Award XP to student for asking questions
      addXp(10, 'Consulta realizada al tutor QuimiBot');

      // Tutor thinking simulation
      setIsTyping(true);

      try {
        let replyWithTime;

        if (isGeminiConfigured()) {
          const currentConv = conversations.find((c) => c.id === activeConversationId);
          const geminiHistory = (currentConv?.messages || [])
            .filter((m) => m.text && m.text.trim())
            .map((m) => ({
              role: m.sender === 'user' ? ('user' as const) : ('model' as const),
              text: m.text,
            }));

          const socraticResult = await sendSocraticTutorPrompt({
            userMessage: trimmed,
            conversationHistory: geminiHistory,
            mode: currentMode,
          });

          let replyText = socraticResult.text;
          const is503 =
            socraticResult.error === '503_SERVICE_UNAVAILABLE' ||
            socraticResult.error?.includes('503') ||
            socraticResult.error?.includes('UNAVAILABLE') ||
            replyText.includes('503') ||
            replyText.includes('UNAVAILABLE') ||
            replyText.includes('overloaded');

          if (is503) {
            replyText =
              'El tutor está procesando muchas consultas en este momento. Dame un par de segundos y vuelve a intentarlo';
          }

          replyWithTime = {
            id: 'tutor-' + Date.now(),
            sender: 'tutor' as const,
            text: replyText,
            timestamp: new Date().toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            suggestedFollowUps: socraticResult.suggestedFollowUps,
          };
        } else {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const localReply = getTutorResponse(trimmed, currentMode);
          replyWithTime = {
            ...localReply,
            id: 'tutor-' + Date.now(),
            text:
              localReply.text +
              '\n\n*(💡 Modo sin conexión: Configura tu `VITE_GEMINI_API_KEY` en el archivo `.env` para dialogar con el tutor socrático en vivo vía Gemini API).*',
            timestamp: new Date().toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId
              ? {
                  ...c,
                  updatedAt: new Date().toISOString(),
                  messages: [...c.messages, replyWithTime],
                }
              : c
          )
        );
      } finally {
        setIsTyping(false);
      }
    },
    [activeConversationId, isTyping, currentMode, addXp, conversations, profile, deductCredit, setIsPremiumModalOpen]
  );

  const value = {
    conversations,
    activeConversationId,
    activeConversation,
    currentMode,
    isGeminiActive: isGeminiConfigured(),
    isTyping,
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    clearActiveConversation,
    clearAllConversations,
    exportConversation,
    downloadConversation,
    setCurrentMode,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatHistory = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatHistory debe ser utilizado dentro de un ChatProvider');
  }
  return context;
};
