import React, { useState, Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { AppProviders, useChatHistory, useAuth, useStudent } from './context';
import { GlobalNavbar } from './components/Navigation/GlobalNavbar';
import { StudentStatsBar } from './components/StudentStatsBar';
import { LandingPage } from './components/Landing/LandingPage';
import { LoginPage } from './components/Auth/LoginPage';
import { AuthGuard } from './components/Auth/AuthGuard';
import { ChatInterface } from './components/Chat/ChatInterface';
import { PeriodicTableWidget } from './components/PeriodicTableWidget';
import { MolarMassCalc } from './components/Calculators/MolarMassCalc';
import { GasLawCalc } from './components/Calculators/GasLawCalc';
import { PhCalc } from './components/Calculators/PhCalc';
import { ChallengeZone } from './components/ChallengeZone';
import { BalancingAndCalcHub } from './components/BalancingAndCalc/BalancingAndCalcHub';
import { Loading3DFallback } from './components/VirtualLab/Loading3DFallback';
import { PlansUpgradeView } from './components/Billing/PlansUpgradeView';
import { StripeCheckoutModal } from './components/Billing/StripeCheckoutModal';
import { PremiumModal } from './components/PremiumModal';
import {
  History,
  Download,
  Trash2,
  Plus,
  Pin,
  Edit2,
  Check,
  Search,
  FlaskConical,
} from 'lucide-react';

const VirtualLabHub = lazy(() => import('./components/VirtualLab/VirtualLabHub'));

// ============================================================================
// COMPONENTE PRINCIPAL CON RUTAS DE REACT ROUTER
// ============================================================================
const AppRoutesContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    isPremiumModalOpen,
    setIsPremiumModalOpen,
    isCheckoutOpen,
    checkoutPlanId,
    openCheckout,
    closeCheckout,
  } = useStudent();

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

  // Estados para Calculadoras e Historial
  const [calcSubTab, setCalcSubTab] = useState<'molar' | 'gas' | 'ph'>('molar');
  const [historySearch, setHistorySearch] = useState('');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [newTitleText, setNewTitleText] = useState('');

  // Rutas de estudio donde se muestra la barra de progreso y créditos
  const isStudyRoute =
    user &&
    [
      '/tutor',
      '/lab',
      '/balancing',
      '/retos',
      '/calculators',
      '/table',
      '/history',
    ].some((path) => location.pathname.startsWith(path));

  const filteredHistory = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(historySearch.toLowerCase()) ||
      c.messages.some((m) => m.text.toLowerCase().includes(historySearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans">
      {/* 1. BARRA DE NAVEGACIÓN GLOBAL (VISIBLE EN TODAS LAS PANTALLAS) */}
      <GlobalNavbar />

      {/* 2. BARRA DE ESTADÍSTICAS DEL ESTUDIANTE (VISIBLE CUANDO ESTÁ AUTENTICADO EN MÓDULOS) */}
      {isStudyRoute && (
        <StudentStatsBar onNavigateToPlans={() => navigate('/planes')} />
      )}

      {/* 3. ENRUTAMIENTO DINÁMICO CON REACT ROUTER */}
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* RUTA PRINCIPAL (/): LANDING PAGE PÚBLICA */}
          <Route path="/" element={<LandingPage />} />

          {/* RUTA DE AUTENTICACIÓN (LOGIN & REGISTRO) */}
          <Route path="/login" element={<LoginPage />} />

          {/* RUTA DE PLANES Y CARRITO DE COMPRAS */}
          <Route
            path="/planes"
            element={
              <PlansUpgradeView
                onOpenCheckout={(planId) => openCheckout(planId)}
                onNavigateToTab={(tab) => navigate(`/${tab}`)}
              />
            }
          />
          <Route
            path="/carrito"
            element={
              <PlansUpgradeView
                onOpenCheckout={(planId) => openCheckout(planId)}
                onNavigateToTab={(tab) => navigate(`/${tab}`)}
              />
            }
          />

          {/* RUTAS PROTEGIDAS CON AUTHGUARD */}
          {/* TUTOR QUIMIBOT */}
          <Route
            path="/tutor"
            element={
              <AuthGuard>
                <div className="flex-1 h-[calc(100vh-130px)]">
                  <ChatInterface />
                </div>
              </AuthGuard>
            }
          />
          <Route path="/chat" element={<Navigate to="/tutor" replace />} />

          {/* LABORATORIO VIRTUAL 3D */}
          <Route
            path="/lab"
            element={
              <AuthGuard>
                <Suspense
                  fallback={
                    <div className="flex-1 max-w-7xl mx-auto w-full p-6">
                      <Loading3DFallback message="Cargando entorno de Laboratorio Virtual 3D y librerías WebGL..." />
                    </div>
                  }
                >
                  <VirtualLabHub
                    onAskTutor={(question) => {
                      navigate('/tutor');
                      sendMessage(question);
                    }}
                    onNavigateToPlans={() => navigate('/planes')}
                  />
                </Suspense>
              </AuthGuard>
            }
          />

          {/* BALANCEO Y CÁLCULOS */}
          <Route
            path="/balancing"
            element={
              <AuthGuard>
                <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
                  <BalancingAndCalcHub />
                </div>
              </AuthGuard>
            }
          />

          {/* ZONA DE RETOS */}
          <Route
            path="/retos"
            element={
              <AuthGuard>
                <ChallengeZone
                  onAskTutor={(question) => {
                    navigate('/tutor');
                    sendMessage(question);
                  }}
                />
              </AuthGuard>
            }
          />
          <Route path="/challenges" element={<Navigate to="/retos" replace />} />

          {/* CALCULADORAS QUÍMICAS */}
          <Route
            path="/calculators"
            element={
              <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
                  <button
                    onClick={() => setCalcSubTab('molar')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      calcSubTab === 'molar'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    Masa Molar & Moles
                  </button>
                  <button
                    onClick={() => setCalcSubTab('gas')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      calcSubTab === 'gas'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    Gases Ideales (PV = nRT)
                  </button>
                  <button
                    onClick={() => setCalcSubTab('ph')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      calcSubTab === 'ph'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    Escala y Cálculo de pH / pOH
                  </button>
                  <button
                    onClick={() => navigate('/lab')}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 flex items-center gap-1.5 transition-all ml-auto cursor-pointer"
                  >
                    <FlaskConical className="w-4 h-4" />
                    <span>Ir al Laboratorio Virtual 3D →</span>
                  </button>
                </div>

                {calcSubTab === 'molar' && <MolarMassCalc />}
                {calcSubTab === 'gas' && <GasLawCalc />}
                {calcSubTab === 'ph' && <PhCalc />}
              </div>
            }
          />

          {/* TABLA PERIÓDICA */}
          <Route
            path="/table"
            element={
              <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
                <PeriodicTableWidget
                  onAskTutor={(question) => {
                    navigate('/tutor');
                    sendMessage(question);
                  }}
                />
              </div>
            }
          />

          {/* HISTORIAL DE CONSULTAS */}
          <Route
            path="/history"
            element={
              <AuthGuard>
                <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
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
                          navigate('/tutor');
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nueva Consulta</span>
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm('¿Seguro que deseas eliminar todas las conversaciones guardadas? Esta acción no se puede deshacer.')) {
                            clearAllConversations();
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Borrar todo el historial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Búsqueda */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por tema o texto en el historial..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Lista de consultas */}
                  <div className="space-y-3">
                    {filteredHistory.length === 0 && (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
                        No se encontraron consultas registradas.
                      </div>
                    )}

                    {filteredHistory.map((conv) => {
                      const isActive = conv.id === activeConversationId;
                      const isEditing = editingTitleId === conv.id;

                      return (
                        <div
                          key={conv.id}
                          className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all ${
                            isActive
                              ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {conv.pinned && (
                                  <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                                )}

                                {isEditing ? (
                                  <div className="flex items-center gap-1.5 flex-1">
                                    <input
                                      type="text"
                                      value={newTitleText}
                                      onChange={(e) => setNewTitleText(e.target.value)}
                                      className="px-2 py-0.5 text-sm bg-slate-100 dark:bg-slate-800 rounded border border-emerald-500 text-slate-900 dark:text-white focus:outline-hidden"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => {
                                        renameConversation(conv.id, newTitleText);
                                        setEditingTitleId(null);
                                      }}
                                      className="p-1 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <h3
                                    onClick={() => {
                                      selectConversation(conv.id);
                                      navigate('/tutor');
                                    }}
                                    className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate cursor-pointer hover:text-emerald-600 transition-colors"
                                  >
                                    {conv.title}
                                  </h3>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                                <span>
                                  {new Date(conv.updatedAt).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <span>•</span>
                                <span>{conv.messages.length} mensajes</span>
                              </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center gap-1 self-end sm:self-center text-xs">
                              <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <button
                                  onClick={() => downloadConversation(conv.id, 'markdown')}
                                  className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                                  title="Descargar en formato Markdown (.md)"
                                >
                                  <Download className="w-3 h-3" />
                                  <span className="text-[10px] font-mono">MD</span>
                                </button>
                                <div className="w-[1px] h-3 bg-slate-200 dark:bg-slate-800" />
                                <button
                                  onClick={() => downloadConversation(conv.id, 'text')}
                                  className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-mono cursor-pointer"
                                  title="Descargar en formato Texto (.txt)"
                                >
                                  TXT
                                </button>
                              </div>

                              <button
                                onClick={() => togglePinConversation(conv.id)}
                                className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                                  conv.pinned
                                    ? 'text-amber-500'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                                title={conv.pinned ? 'Desfijar' : 'Fijar al inicio'}
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setEditingTitleId(conv.id);
                                  setNewTitleText(conv.title);
                                }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                title="Cambiar título"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  selectConversation(conv.id);
                                  navigate('/tutor');
                                }}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-2xs transition-colors cursor-pointer"
                              >
                                Continuar
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`¿Eliminar la conversación "${conv.title}"?`)) {
                                    deleteConversation(conv.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
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
              </AuthGuard>
            }
          />

          {/* CUALQUIER OTRA RUTA: REDIRIGE A LA LANDING PAGE */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 4. MODALES GLOBALES DE STRIPE CHECKOUT Y PREMIUM */}
      <StripeCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
        initialPlanId={checkoutPlanId || 'premium_monthly'}
        onSuccessNavigate={(tab) => navigate(`/${tab}`)}
      />

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />
    </div>
  );
};

// ============================================================================
// ROOT APP CON BROWSER ROUTER Y PROVIDERS
// ============================================================================
export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutesContent />
      </AppProviders>
    </BrowserRouter>
  );
}
