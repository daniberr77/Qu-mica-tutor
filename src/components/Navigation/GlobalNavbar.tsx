import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Atom,
  MessageSquare,
  FlaskConical,
  Scale,
  Flame,
  History,
  Calculator,
  Crown,
  ShoppingCart,
  LogIn,
  Zap,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { UserAuthButton } from '../Auth/UserAuthButton';

export const GlobalNavbar: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, openCheckout } = useStudent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* ======================================================== */}
        {/* LOGO & BRAND                                             */}
        {/* ======================================================== */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer select-none shrink-0 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Atom className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                Química<span className="text-emerald-600 dark:text-emerald-400">Tutor</span>
              </span>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                IA 3D
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden lg:block leading-none font-medium">
              Laboratorios 3D & Tutor Socrático
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* NAVIGATION LINKS (DESKTOP)                               */}
        {/* ======================================================== */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto text-xs font-semibold">
          {/* Si el usuario NO está logueado, links a Landing / Características */}
          {!user && (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                Inicio
              </NavLink>

              <NavLink
                to="/planes"
                className={({ isActive }) =>
                  `flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-xs'
                      : 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
                  }`
                }
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Planes & Membresías</span>
              </NavLink>
            </>
          )}

          {/* Si el usuario SÍ está logueado, menú completo con secciones protegidas */}
          {user && (
            <>
              <NavLink
                to="/tutor"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Tutor QuimiBot</span>
              </NavLink>

              <NavLink
                to="/lab"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Laboratorio 3D</span>
                <span className="px-1 py-0.2 rounded-full text-[9px] font-black bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                  3D
                </span>
              </NavLink>

              <NavLink
                to="/balancing"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Balanceo</span>
              </NavLink>

              <NavLink
                to="/retos"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span>Retos</span>
              </NavLink>

              <NavLink
                to="/calculators"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calculadoras</span>
              </NavLink>

              <NavLink
                to="/table"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Atom className="w-3.5 h-3.5" />
                <span>Tabla</span>
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <History className="w-3.5 h-3.5" />
                <span>Historial</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* ======================================================== */}
        {/* RIGHT SIDE BUTTONS                                       */}
        {/* ======================================================== */}
        <div className="flex items-center gap-2 shrink-0">
          {/* SI EL USUARIO NO ESTÁ LOGUEADO */}
          {!user ? (
            <div className="flex items-center gap-2">
              {/* Botón 1: Ver Planes (Carrito) */}
              <Link
                to="/planes"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-xs shadow-xs transition-all cursor-pointer"
                title="Explora los planes y promociones en el carrito de compras"
              >
                <ShoppingCart className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Ver Planes (Carrito)</span>
                <span className="sm:hidden">Planes</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px] font-black uppercase">
                  PRO
                </span>
              </Link>

              {/* Botón 2: Iniciar Sesión / Registrarse */}
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión / Registrarse</span>
              </Link>
            </div>
          ) : (
            /* SI EL USUARIO SÍ ESTÁ LOGUEADO */
            <div className="flex items-center gap-2.5">
              {/* Contador de Créditos o Badge Premium */}
              {profile.isPremium ? (
                <Link
                  to="/planes"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white border border-amber-300 shadow-xs hover:opacity-95 transition-all text-xs font-bold"
                  title="Modo Premium activo: Consultas ilimitadas y simuladores 3D desbloqueados"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-200" />
                  <span className="hidden sm:inline">Premium Ilimitado</span>
                  <Sparkles className="w-3 h-3 text-amber-200" />
                </Link>
              ) : (
                <button
                  onClick={() => openCheckout('premium_monthly')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-transform hover:scale-105 cursor-pointer ${
                    profile.credits > 5
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 animate-pulse'
                  }`}
                  title="Tus créditos diarios para consultas al tutor de IA. Haz clic para adquirir Premium"
                >
                  <Zap className={`w-3.5 h-3.5 ${profile.credits === 0 ? 'text-rose-500 fill-rose-500' : 'text-amber-500 fill-amber-500'}`} />
                  <span>{profile.credits}/{profile.dailyCreditLimit || 15}</span>
                  <span className="text-[10px] hidden sm:inline">créditos</span>
                </button>
              )}

              {/* Botón Carrito / Upgrade a Pro */}
              <Link
                to="/planes"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Ir al Carrito de compras y revisar planes"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{profile.isPremium ? 'Carrito' : 'Upgrade a Pro'}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[9px] font-black uppercase">
                  PRO
                </span>
              </Link>

              {/* Foto, Nombre y Dropdown del Usuario */}
              <UserAuthButton onOpenLogin={() => navigate('/login')} />
            </div>
          )}

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MENÚ MÓVIL DESPLEGABLE                                   */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-2 animate-in fade-in duration-150">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span>🏠 Inicio</span>
          </NavLink>

          <NavLink
            to="/planes"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-600" />
              <span>Ver Planes (Carrito)</span>
            </div>
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
              PRO
            </span>
          </NavLink>

          {user ? (
            <>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-3 mb-1">
                  Módulos de Aprendizaje
                </span>
                <NavLink
                  to="/tutor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Tutor QuimiBot IA</span>
                </NavLink>

                <NavLink
                  to="/lab"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <FlaskConical className="w-4 h-4 text-cyan-600" />
                  <span>Laboratorio Virtual 3D</span>
                </NavLink>

                <NavLink
                  to="/balancing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Scale className="w-4 h-4 text-indigo-600" />
                  <span>Balanceo y Cálculos</span>
                </NavLink>

                <NavLink
                  to="/retos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Zona de Retos</span>
                </NavLink>

                <NavLink
                  to="/calculators"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Calculator className="w-4 h-4 text-teal-600" />
                  <span>Calculadoras Químicas</span>
                </NavLink>

                <NavLink
                  to="/table"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Atom className="w-4 h-4 text-purple-600" />
                  <span>Tabla Periódica</span>
                </NavLink>

                <NavLink
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Historial de Consultas</span>
                </NavLink>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión / Registrarse</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default GlobalNavbar;
