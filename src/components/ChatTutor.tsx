import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, Trash2, GraduationCap, Calculator, Target, Check, Copy } from 'lucide-react';
import { ChatMessage } from '../types';
import { INITIAL_GREETING, TUTOR_MODES, getTutorResponse } from '../data/tutorKnowledge';
import { sendSocraticTutorPrompt, isGeminiConfigured } from '../services/gemini';

interface ChatTutorProps {
  onNavigateToModule?: (moduleId: number) => void;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export const ChatTutor: React.FC<ChatTutorProps> = ({
  onNavigateToModule,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState<'didactic' | 'stepbystep' | 'quiz'>('didactic');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle external incoming prompt (e.g. from Periodic Table or Module button)
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMessage: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    if (isGeminiConfigured()) {
      const history = messages
        .filter((m) => m.text && m.text.trim())
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          text: m.text,
        }));

      sendSocraticTutorPrompt({
        userMessage: query,
        conversationHistory: history,
        mode: activeMode,
      })
        .then((res) => {
          let replyText = res.text;
          const is503 =
            res.error === '503_SERVICE_UNAVAILABLE' ||
            res.error?.includes('503') ||
            res.error?.includes('UNAVAILABLE') ||
            replyText.includes('503') ||
            replyText.includes('UNAVAILABLE') ||
            replyText.includes('overloaded');

          if (is503) {
            replyText =
              'El tutor está procesando muchas consultas en este momento. Dame un par de segundos y vuelve a intentarlo';
          }

          const response: ChatMessage = {
            id: 'tutor-' + Date.now(),
            sender: 'tutor',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedFollowUps: res.suggestedFollowUps,
          };
          setMessages((prev) => [...prev, response]);
        })
        .catch((err) => {
          const errStr = typeof err?.message === 'string' ? err.message : JSON.stringify(err || '');
          const is503 =
            err?.status === 503 ||
            err?.code === 503 ||
            errStr.includes('503') ||
            errStr.includes('UNAVAILABLE') ||
            errStr.includes('overloaded');

          const response: ChatMessage = {
            id: 'tutor-' + Date.now(),
            sender: 'tutor',
            text: is503
              ? 'El tutor está procesando muchas consultas en este momento. Dame un par de segundos y vuelve a intentarlo'
              : 'Ocurrió un error al conectar con el tutor de química. Intenta de nuevo en unos segundos.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedFollowUps: ['Reintentar pregunta', 'Consultar otro tema'],
          };
          setMessages((prev) => [...prev, response]);
        })
        .finally(() => {
          setIsTyping(false);
        });
    } else {
      // Simulate natural AI tutor response latency with local fallback
      setTimeout(() => {
        const response = getTutorResponse(query, activeMode);
        response.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        response.text += '\n\n*(💡 Modo sin conexión: Configura tu `VITE_GEMINI_API_KEY` en `.env` para respuestas en vivo con Gemini).*';
        setMessages(prev => [...prev, response]);
        setIsTyping(false);
      }, 600);
    }
  };

  const clearChat = () => {
    setMessages([INITIAL_GREETING]);
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderModeIcon = (modeId: string) => {
    switch (modeId) {
      case 'didactic': return <GraduationCap className="w-4 h-4" />;
      case 'stepbystep': return <Calculator className="w-4 h-4" />;
      case 'quiz': return <Target className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-[750px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white">QuimiBot Tutor IA</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">En línea</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tutor interactivo de química con los 7 módulos del temario</p>
          </div>
        </div>

        {/* Mode selector pills & Clear button */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TUTOR_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeMode === m.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={m.description}
            >
              {renderModeIcon(m.id)}
              <span>{m.label}</span>
            </button>
          ))}

          <button
            onClick={clearChat}
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Limpiar conversación"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`rounded-2xl p-4 text-sm relative group leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <div className="whitespace-pre-line font-sans">
                {msg.text}
              </div>

              {/* Step by step calculation card if present */}
              {msg.calculationDetails && (
                <div className="mt-3 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-purple-200 dark:border-purple-800 text-xs">
                  <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 mb-2">
                    <Calculator className="w-4 h-4" />
                    {msg.calculationDetails.title}
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 font-mono">
                    {msg.calculationDetails.steps.map((step, idx) => (
                      <li key={idx} className="leading-snug">{step}</li>
                    ))}
                  </ol>
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-purple-600 dark:text-purple-400">
                    💡 Conclusión: {msg.calculationDetails.result}
                  </div>
                </div>
              )}

              {/* Related module link if provided */}
              {msg.relatedModuleId && onNavigateToModule && (
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Tema del temario relacionado:</span>
                  <button
                    onClick={() => onNavigateToModule(msg.relatedModuleId!)}
                    className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Ir al Módulo {msg.relatedModuleId}
                  </button>
                </div>
              )}

              {/* Footer time & copy */}
              <div className="flex items-center justify-between mt-2 pt-1 text-[10px] opacity-70">
                <span>{msg.timestamp}</span>
                <button
                  onClick={() => copyMessage(msg.id, msg.text)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  title="Copiar texto"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {/* Suggested follow-up prompt chips */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-700/70">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                    Preguntas sugeridas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(prompt)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-purple-700 dark:text-purple-300 font-medium hover:bg-purple-50 dark:hover:bg-purple-950/40 transition text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 mr-auto items-center">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntale a QuimiBot sobre cualquier tema de química o cálculo..."
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl shadow-sm transition flex items-center justify-center"
            title="Enviar mensaje"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
