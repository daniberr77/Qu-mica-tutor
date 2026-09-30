import React, { useState, useRef, useEffect } from 'react';
import { useChatHistory, useStudent } from '../../context';
import { ConversationHistoryDrawer } from './ConversationHistoryDrawer';
import { PremiumModal } from '../PremiumModal';
import { TUTOR_MODES } from '../../data/tutorKnowledge';
import type { TutorModeType } from '../../types';
import {
  Send,
  Sparkles,
  History,
  RotateCcw,
  Download,
  GraduationCap,
  Calculator,
  Target,
  Plus,
  BookOpen,
  ArrowRight,
  Loader2,
  Zap,
  Crown,
  AlertCircle,
} from 'lucide-react';

export const ChatInterface: React.FC = () => {
  const {
    activeConversation,
    currentMode,
    isTyping,
    sendMessage,
    setCurrentMode,
    createNewConversation,
    clearActiveConversation,
    downloadConversation,
    conversations,
    isGeminiActive,
  } = useChatHistory();

  const {
    profile,
    isPremiumModalOpen,
    setIsPremiumModalOpen,
  } = useStudent();

  const [inputText, setInputText] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasNoCredits = !profile.isPremium && profile.credits <= 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    if (hasNoCredits) {
      setIsPremiumModalOpen(true);
      return;
    }

    setInputText('');
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasNoCredits) {
        setIsPremiumModalOpen(true);
        return;
      }
      handleSend();
    }
  };

  const modeIcons: Record<TutorModeType, React.ReactNode> = {
    didactic: <GraduationCap className="w-4 h-4" />,
    stepbystep: <Calculator className="w-4 h-4" />,
    quiz: <Target className="w-4 h-4" />,
  };

  const messages = activeConversation?.messages || [];

  // Format message text with basic formatting (paragraphs, bold, list items, inline formulas)
  const renderFormattedText = (raw: string) => {
    const paragraphs = raw.split('\n\n');
    return paragraphs.map((paragraph, pIdx) => {
      // Check for headings
      if (paragraph.startsWith('### ')) {
        return (
          <h4 key={pIdx} className="font-bold text-slate-900 dark:text-white text-base mt-2 mb-1">
            {paragraph.replace('### ', '')}
          </h4>
        );
      }
      if (paragraph.startsWith('🎯 ')) {
        return (
          <div key={pIdx} className="font-bold text-amber-600 dark:text-amber-400 text-sm mt-1 mb-1 flex items-center gap-1.5">
            <span>{paragraph}</span>
          </div>
        );
      }

      // Format bulleted or numbered lines
      const lines = paragraph.split('\n');
      return (
        <p key={pIdx} className="mb-2 leading-relaxed text-slate-800 dark:text-slate-200">
          {lines.map((line, lIdx) => {
            // Process bold markers (**text**)
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
              <span key={lIdx} className="block">
                {parts.map((part, partIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong key={partIdx} className="font-semibold text-slate-900 dark:text-white">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  if (part.startsWith('$') && part.endsWith('$')) {
                    return (
                      <code key={partIdx} className="px-1 py-0.5 rounded bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-semibold">
                        {part.slice(1, -1)}
                      </code>
                    );
                  }
                  return part;
                })}
              </span>
            );
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative">
      {/* Chat Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 shrink-0 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Active session info & mode */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  {activeConversation?.title || 'Tutor de Química QuimiBot'}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                  Activo
                </span>

                {isGeminiActive ? (
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    Gemini 3.8 Flash
                  </span>
                ) : (
                  <span
                    className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40"
                    title="Agrega tu VITE_GEMINI_API_KEY en el archivo .env para respuestas en vivo con Gemini"
                  >
                    Modo Local (.env)
                  </span>
                )}

                {/* Credits / Premium Pill in Header */}
                {profile.isPremium ? (
                  <button
                    onClick={() => setIsPremiumModalOpen(true)}
                    title="Membresía Premium activa: Consultas ilimitadas"
                    className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 text-white border border-amber-400/40 flex items-center gap-1 shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Crown className="w-3 h-3 text-amber-200" />
                    <span>Premium Ilimitado</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsPremiumModalOpen(true)}
                    title="Créditos diarios restantes para consultas con Gemini. Haz clic para adquirir Premium"
                    className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 shadow-xs transition-transform hover:scale-105 cursor-pointer ${
                      profile.credits > 5
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300/60'
                        : profile.credits > 0
                        ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300/60 animate-pulse'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-400 font-extrabold animate-bounce'
                    }`}
                  >
                    <Zap className={`w-3 h-3 ${profile.credits === 0 ? 'text-rose-600 fill-rose-600' : 'text-amber-500 fill-amber-500'}`} />
                    <span>{profile.credits} / 20 créditos</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tu tutor interactivo con persistencia automática en base de datos
              </p>
            </div>
          </div>

          {/* Mode Switcher & History Button */}
          <div className="flex items-center gap-2">
            {/* Tutor pedagogical modes */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {TUTOR_MODES.map((mode) => {
                const isSelected = currentMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setCurrentMode(mode.id as TutorModeType)}
                    title={mode.description}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {modeIcons[mode.id as TutorModeType]}
                    <span className="hidden md:inline">{mode.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <button
              onClick={() => createNewConversation(currentMode)}
              title="Iniciar nueva sesión"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>

            {activeConversation && (
              <button
                onClick={() => downloadConversation(activeConversation.id, 'markdown')}
                title="Descargar esta conversación en Markdown (.md)"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* History Drawer Trigger */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <History className="w-4 h-4" />
              <span>Historial ({conversations.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold shadow-xs ${
                  isUser
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-tr from-teal-600 to-emerald-500 text-white'
                }`}
              >
                {isUser ? 'Tú' : '🤖'}
              </div>

              {/* Message Bubble */}
              <div className="max-w-[85%] sm:max-w-[75%] space-y-2">
                <div
                  className={`p-4 rounded-2xl shadow-xs text-sm ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-75">
                    <span className="font-semibold">{isUser ? 'Estudiante' : 'QuimiBot'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  ) : (
                    <div>{renderFormattedText(msg.text)}</div>
                  )}

                  {/* Step-by-Step Calculation Card */}
                  {msg.calculationDetails && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-emerald-200 dark:border-emerald-800/60">
                      <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wide">
                        <Calculator className="w-4 h-4" />
                        <span>{msg.calculationDetails.title}</span>
                      </div>

                      <div className="space-y-1.5 pl-1">
                        {msg.calculationDetails.steps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span className="flex-1 leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-950/50 p-2 rounded-lg">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{msg.calculationDetails.result}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested follow-ups */}
                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedFollowUps.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => {
                          if (hasNoCredits) {
                            setIsPremiumModalOpen(true);
                          } else {
                            handleSend(suggestion);
                          }
                        }}
                        className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <ArrowRight className="w-3 h-3 text-emerald-500" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold shadow-xs">
              🤖
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                QuimiBot está formulando la explicación...
              </span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar if low message count */}
      {messages.length <= 1 && (
        <div className="max-w-4xl mx-auto w-full px-4 pb-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span>Consultas sugeridas para tu nivel de estudio:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              '¿Cómo calcular el Reactivo Limitante en una reacción?',
              'Explícame la ley de los gases ideales (PV = nRT)',
              '¿Cómo balancear una ecuación química por tanteo?',
              '¿Cuál es la diferencia entre enlace iónico y covalente?',
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (hasNoCredits) {
                    setIsPremiumModalOpen(true);
                  } else {
                    handleSend(prompt);
                  }
                }}
                className="text-left p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs text-slate-700 dark:text-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <span className="line-clamp-1">{prompt}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* High Availability & Rate Limiting Status Notice */}
      {isTyping && (
        <div className="max-w-4xl mx-auto w-full px-4 pb-2">
          <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 shadow-2xs">
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">
                QuimiBot está formulando la explicación socrática...
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
              Envío pausado temporalmente para evitar saturación
            </span>
          </div>
        </div>
      )}

      {/* Out of Credits Warning Banner */}
      {hasNoCredits && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-indigo-500/15 border-t border-rose-300 dark:border-rose-900/60 px-4 py-3 shrink-0">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 animate-bounce" />
              <div>
                <p className="font-bold text-sm">Has alcanzado tu límite de 20 créditos diarios</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Tus 20 créditos gratuitos se renovarán a las 00:00. Pásate a Premium para consultas ilimitadas con Gemini AI.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPremiumModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-200" />
              <span>Adquirir Versión Premium</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            </button>
          </div>
        </div>
      )}

      {/* Input Form Bar */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 shrink-0 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('¿Reiniciar la conversación actual con el saludo inicial?')) {
                clearActiveConversation();
              }
            }}
            title="Reiniciar mensajes de esta consulta"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-rose-500 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={
                hasNoCredits
                  ? '⛔ Límite de 20 consultas diarias alcanzado. Adquiere Premium para continuar.'
                  : isTyping
                  ? 'QuimiBot está procesando tu respuesta... Por favor espera'
                  : 'Pregúntale a QuimiBot sobre estequiometría, gases, Lewis, molaridad...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping || hasNoCredits}
              className={`w-full pl-4 pr-10 py-3 text-sm rounded-xl transition-all ${
                hasNoCredits
                  ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900/60 text-slate-500 dark:text-slate-400 cursor-not-allowed placeholder:text-rose-400/90'
                  : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed'
              }`}
            />
          </div>

          <button
            onClick={() => {
              if (hasNoCredits) {
                setIsPremiumModalOpen(true);
              } else {
                handleSend();
              }
            }}
            disabled={!inputText.trim() || isTyping || hasNoCredits}
            title={
              hasNoCredits
                ? 'Límite de créditos alcanzado. Haz clic para adquirir Premium'
                : isTyping
                ? 'QuimiBot está formulando una respuesta... Por favor espera un momento'
                : !inputText.trim()
                ? 'Escribe una consulta para enviar'
                : 'Enviar mensaje a QuimiBot'
            }
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
              !inputText.trim() || isTyping || hasNoCredits
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* History Slide-over Drawer */}
      <ConversationHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Premium Upgrade Modal */}
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />
    </div>
  );
};
