import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Atom,
  FlaskConical,
  MessageSquare,
  Flame,
  Scale,
  Calculator,
  Crown,
  ShoppingCart,
  LogIn,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Wind,
  Box,
  Droplet,
  GraduationCap,
  Award,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { profile, openCheckout } = useStudent();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200">
      {/* ======================================================== */}
      {/* 1. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-xs animate-in fade-in duration-300">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Plataforma Educativa de Química con IA Socrática & 3D</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
            Aprende Química Experimentando en{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-300 bg-clip-text text-transparent">
              Laboratorios 3D
            </span>{' '}
            con Tutor de IA
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-slate-900 dark:text-white">QuímicaTutor</strong> combina física molecular WebGL en tiempo real con <strong className="text-emerald-600 dark:text-emerald-400">QuimiBot</strong>: un tutor inteligente que te guía paso a paso en estequiometría, gases y reacciones complejas.
          </p>

          {/* Main Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {/* Primary Action Button */}
            <Link
              to={user ? '/tutor' : '/login'}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-5 h-5 text-amber-300" />
              <span>{user ? 'Entrar al Tutor QuimiBot' : 'Comenzar Gratis (15 Créditos/día)'}</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </Link>

            {/* Secondary Action Button: Ver Planes (Carrito) */}
            <Link
              to="/planes"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-2 border-amber-400/80 text-amber-700 dark:text-amber-300 font-extrabold text-base shadow-md flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5 text-amber-500" />
              <span>Ver Planes (Carrito de Compras)</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase">
                PRO
              </span>
            </Link>
          </div>

          {/* Quick Platform Metrics */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-200 dark:border-slate-800 text-left">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                6 Labs 3D
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Gases, cristales, átomos y cinética
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block">
                15 Créditos
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Gratis cada día con tutor de IA
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 block">
                118 Elementos
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Tabla periódica con masa y configuración
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-2xl font-black text-amber-500 block">
                100% WebGL
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Sin descargas, corre en tu navegador
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. LOS 4 PILARES DE LA PLATAFORMA                        */}
      {/* ======================================================== */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Características Principales
          </h2>
          <p className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Todo lo que necesitas para aprobar y dominar la química
          </p>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Diseñado especialmente para estudiantes de secundaria, preuniversitario y primeros ciclos de universidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Laboratorio Virtual 3D */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <FlaskConical className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Laboratorio Virtual 3D
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-[10px] font-black uppercase">
                  WebGL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Visualiza átomos en capas cuánticas de Bohr, moléculas tridimensionales con ángulos VSEPR, cinética de gases y redes cristalinas cúbicas (SC, BCC, FCC).
              </p>
            </div>

            <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Simulador de gases ideales (PV = nRT)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Perfiles de energía y colisiones moleculares</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Vaso de precipitados con solubilidad en vivo</span>
              </li>
            </ul>

            <Link
              to={user ? '/lab' : '/login'}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline pt-2"
            >
              <span>Explorar Laboratorio 3D</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Tutor QuimiBot IA */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Tutor Socrático QuimiBot
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
                  IA
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                QuimiBot no solo te da la respuesta: te guía con preguntas socráticas para que entiendas la estequiometría, el reactivo limitante y el balanceo químico por ti mismo.
              </p>
            </div>

            <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>3 Modos: Didáctico, Paso a Paso y Examen</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Exportación de tareas en Markdown y JSON</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Adaptado a tu nivel académico</span>
              </li>
            </ul>

            <Link
              to={user ? '/tutor' : '/login'}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-2"
            >
              <span>Consultar a QuimiBot</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Zona de Retos & Gamificación */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Zona de Retos & Gamificación
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase">
                  XP & Rangos
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Resuelve problemas cronometrados, gana puntos de experiencia (XP), mantén tu racha diaria de estudio y sube de rango desde Aprendiz hasta Gran Catedrático.
              </p>
            </div>

            <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Desafíos de estequiometría y nomenclatura</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Retroalimentación instantánea y explicaciones</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Registro de mejores marcas y récords</span>
              </li>
            </ul>

            <Link
              to={user ? '/retos' : '/login'}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline pt-2"
            >
              <span>Entrar a la Zona de Retos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Balanceo y Cálculos */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Scale className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Balanceo Estequiométrico
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Aprende y balancea reacciones por tanteo guiado, método algebraico y oxido-reducción (redox) con balances de masa y carga automáticos.
              </p>
            </div>

            <Link
              to={user ? '/balancing' : '/login'}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-2"
            >
              <span>Ver Módulo de Balanceo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 5: Calculadoras Químicas */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Calculadoras Especializadas
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Herramientas interactivas para masa molar de fórmulas complejas, leyes de los gases ideales y escala de pH/pOH con concentración hidronio.
              </p>
            </div>

            <Link
              to="/calculators"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline pt-2"
            >
              <span>Usar Calculadoras</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 6: Tabla Periódica Interactiva */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
              <Atom className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Tabla Periódica Completa
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Los 118 elementos con electronegatividad, masa atómica, configuraciones electrónicas detalladas e integración con el tutor QuimiBot.
              </p>
            </div>

            <Link
              to="/table"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline pt-2"
            >
              <span>Abrir Tabla Periódica</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. BANNER DE PLANES Y MODO PREMIUM (CARRITO)             */}
      {/* ======================================================== */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white relative overflow-hidden border-y border-slate-700/60">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase">
                <Crown className="w-3.5 h-3.5" />
                <span>Modo Premium con Stripe Checkout</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                ¿Necesitas consultas ilimitadas y todos los simuladores 3D?
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                El Modo Premium desactiva de inmediato la reducción de créditos y te da acceso sin restricciones a los laboratorios de Cinética de Gases y Redes Cristalinas. Suscripción mensual flexible o un solo pago vitalicio.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Consultas con IA 100% ilimitadas</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Todos los laboratorios 3D desbloqueados</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cálculos estequiométricos paso a paso</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Garantía de satisfacción de 30 días</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xs text-center space-y-5">
              <span className="text-xs uppercase font-extrabold text-amber-300 tracking-wider">
                Membresía Recomendada
              </span>
              <div className="space-y-1">
                <span className="text-4xl font-black text-white">$9.99</span>
                <span className="text-xs text-slate-400 block">USD / mes (Cancela cuando desees)</span>
              </div>

              <div className="space-y-2">
                <Link
                  to="/planes"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Ver Planes y Agregar al Carrito</span>
                </Link>

                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pago seguro y encriptado por Stripe</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. FOOTER                                                */}
      {/* ======================================================== */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Atom className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                QuímicaTutor
              </span>
              <p className="text-[11px]">Tutoría interactiva de química con IA y WebGL 3D</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Inicio
            </Link>
            <Link to="/planes" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Planes & Carrito
            </Link>
            <Link to="/tutor" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Tutor IA
            </Link>
            <Link to="/lab" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Laboratorio 3D
            </Link>
            <Link to="/table" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Tabla Periódica
            </Link>
            <Link to="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Iniciar Sesión
            </Link>
          </div>

          <p className="text-[11px]">
            © {new Date().getFullYear()} QuímicaTutor. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
