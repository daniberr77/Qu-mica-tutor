import React, { useState } from 'react';
import { AppProviders, useChatHistory } from './context';
import { StudentStatsBar } from './components/StudentStatsBar';
import { ChatInterface } from './components/Chat/ChatInterface';
import { PeriodicTableWidget } from './components/PeriodicTableWidget';
import { MolarMassCalc } from './components/Calculators/MolarMassCalc';
import { GasLawCalc } from './components/Calculators/GasLawCalc';
import { PhCalc } from './components/Calculators/PhCalc';
import { ChallengeZone } from './components/ChallengeZone';
import { BalancingAndCalcHub } from './components/BalancingAndCalc/BalancingAndCalcHub';
import {
  MessageSquare,
  History,
  Calculator,
  Atom,
  Flame,
  Scale,
  Download,
  Trash2,
  Plus,
  Pin,
  Edit2,
  Check,
  Search,
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'challenges' | 'history' | 'balancing' | 'calculators' | 'table'>('chat');
  const [calcSubTab, setCalcSubTab] = useState<'molar' | 'gas' | 'ph'>('molar');
  const [historySearch, setHistorySearch] = useState('');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [newTitleText, setNewTitleText] = useState('');

  const {
    conversations,
    activeConversationId,
    selectConversation,
    createNewConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    downloadConversation,
    clearAllConversations,
    sendMessage,
  } = useChatHistory();

  const handleAskTutorFromTable = (question: string) => {
    setActiveTab('chat');
    sendMessage(question);
  };

  const filteredHistory = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(historySearch.toLowerCase()) ||
      c.messages.some((m) => m.text.toLowerCase().includes(historySearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Atom className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                  Química<span className="text-emerald-600">Tutor</span>
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  IA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Tutor interactivo de química y resolución estequiométrica
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Tutor QuimiBot</span>
            </button>

            <button
              onClick={() => setActiveTab('balancing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'balancing'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Balanceo y Cálculo</span>
            </button>

            <button
              onClick={() => setActiveTab('challenges')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'challenges'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame
                className={`w-4 h-4 ${
                  activeTab === 'challenges'
                    ? 'text-white fill-white'
                    : 'text-orange-500 fill-orange-500'
                }`}
              />
              <span>Zona de Retos</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'challenges'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                }`}
              >
                Retos
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historial</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                {conversations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('calculators')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'calculators'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calculadoras</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'table'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Atom className="w-4 h-4" />
              <span className="hidden sm:inline">Tabla Periódica</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Global Student Stats and Variables Header */}
      <StudentStatsBar />

      {/* Tab Views */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'chat' && (
          <div className="flex-1 h-[calc(100vh-130px)]">
            <ChatInterface />
          </div>
        )}

        {activeTab === 'challenges' && (
          <ChallengeZone
            onAskTutor={(question) => {
              setActiveTab('chat');
              sendMessage(question);
            }}
          />
        )}

        {activeTab === 'history' && (
          <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-6 h-6 text-emerald-600" />
                  <span>Historial de Aprendizaje y Consultas</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Todas las sesiones y cálculos se conservan automáticamente en tu dispositivo. Puedes exportarlas para repasar o entregar como tarea.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    createNewConversation('didactic');
                    setActiveTab('chat');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Consulta</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('¿Vaciar TODO el historial de consultas?')) {
                      clearAllConversations();
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Eliminar todo el historial"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por tema, fórmula, problema o palabra clave en tus consultas..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 shadow-2xs"
              />
            </div>

            {/* List of Saved Sessions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHistory.map((conv) => {
                const isSelected = conv.id === activeConversationId;
                const isEditing = editingTitleId === conv.id;
                const dateFormatted = new Date(conv.updatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={conv.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all ${
                      isSelected
                        ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={newTitleText}
                              onChange={(e) => setNewTitleText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  renameConversation(conv.id, newTitleText);
                                  setEditingTitleId(null);
                                }
                                if (e.key === 'Escape') setEditingTitleId(null);
                              }}
                              autoFocus
                              className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-emerald-500 focus:outline-hidden"
                            />
                            <button
                              onClick={() => {
                                renameConversation(conv.id, newTitleText);
                                setEditingTitleId(null);
                              }}
                              className="p-1 text-emerald-600"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {conv.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                              {conv.title}
                            </h3>
                          </div>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {dateFormatted} • Modo: <span className="capitalize font-medium">{conv.mode}</span>
                        </p>
                      </div>

                      {/* Top actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePinConversation(conv.id)}
                          title={conv.pinned ? 'Desfijar' : 'Fijar'}
                          className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${
                            conv.pinned ? 'text-amber-500' : 'text-slate-400'
                          }`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTitleId(conv.id);
                            setNewTitleText(conv.title);
                          }}
                          title="Renombrar título"
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Preview of last message */}
                    <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-3 my-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic border border-slate-100 dark:border-slate-800">
                      "{conv.messages[conv.messages.length - 1]?.text.slice(0, 140)}..."
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-400 font-medium">
                        {conv.messages.length} mensaje(s)
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Export Markdown */}
                        <button
                          onClick={() => downloadConversation(conv.id, 'markdown')}
                          title="Descargar en formato Markdown"
                          className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>MD</span>
                        </button>

                        {/* Export JSON */}
                        <button
                          onClick={() => downloadConversation(conv.id, 'json')}
                          title="Descargar en formato JSON"
                          className="flex items-center gap-1 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>JSON</span>
                        </button>

                        {/* Open in Chat */}
                        <button
                          onClick={() => {
                            selectConversation(conv.id);
                            setActiveTab('chat');
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-2xs transition-colors"
                        >
                          Continuar
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar la conversación "${conv.title}"?`)) {
                              deleteConversation(conv.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Eliminar sesión"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'balancing' && (
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
            <BalancingAndCalcHub />
          </div>
        )}

        {activeTab === 'calculators' && (
          <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
            {/* Sub navigation for calculators */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
              <button
                onClick={() => setCalcSubTab('molar')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  calcSubTab === 'molar'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                Masa Molar & Moles
              </button>
              <button
                onClick={() => setCalcSubTab('gas')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  calcSubTab === 'gas'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                Gases Ideales (PV = nRT)
              </button>
              <button
                onClick={() => setCalcSubTab('ph')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  calcSubTab === 'ph'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                Escala y Cálculo de pH / pOH
              </button>
              <button
                onClick={() => setActiveTab('balancing')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 transition-all ml-auto"
              >
                <Scale className="w-4 h-4" />
                <span>Ir a Balanceo & Estequiometría →</span>
              </button>
            </div>

            {calcSubTab === 'molar' && <MolarMassCalc />}
            {calcSubTab === 'gas' && <GasLawCalc />}
            {calcSubTab === 'ph' && <PhCalc />}
          </div>
        )}

        {activeTab === 'table' && (
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
            <PeriodicTableWidget onAskTutor={handleAskTutorFromTable} />
          </div>
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProviders>
      <DashboardContent />
    </AppProviders>
  );
}
