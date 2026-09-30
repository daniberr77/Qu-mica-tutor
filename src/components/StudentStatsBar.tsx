import React, { useState } from 'react';
import { useStudent } from '../context';
import type { StudyLevel } from '../types';
import {
  Flame,
  Award,
  GraduationCap,
  Sparkles,
  Edit3,
  Check,
  RotateCcw,
  Zap,
  Crown,
  Database,
} from 'lucide-react';

export const StudentStatsBar: React.FC<{ onNavigateToPlans?: () => void }> = ({ onNavigateToPlans }) => {
  const {
    profile,
    updateName,
    updateLevel,
    resetProgress,
    openCheckout,
    setIsPremiumModalOpen,
    dbStatus,
  } = useStudent();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [showLevelMenu, setShowLevelMenu] = useState(false);

  const handleSaveName = () => {
    updateName(tempName);
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') {
      setTempName(profile.name);
      setIsEditingName(false);
    }
  };

  // Calculate student level tier based on XP
  const calculateTier = (xp: number) => {
    if (xp < 200) return { title: 'Aprendiz Alquimista', level: 1, next: 200, icon: '🧪' };
    if (xp < 500) return { title: 'Explorador Molecular', level: 2, next: 500, icon: '⚗️' };
    if (xp < 1000) return { title: 'Químico Analista', level: 3, next: 1000, icon: '🔬' };
    if (xp < 2000) return { title: 'Maestro de Reacciones', level: 4, next: 2000, icon: '⚡' };
    return { title: 'Gran Catedrático Químico', level: 5, next: 5000, icon: '🌟' };
  };

  const tier = calculateTier(profile.xp);
  const progressPercent = Math.min(100, Math.round((profile.xp / tier.next) * 100));

  const levels: StudyLevel[] = ['Secundaria', 'Preuniversitario', 'Universidad'];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Student info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-xl shadow-xs">
            {profile.avatar}
          </div>

          <div>
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="text-sm font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-emerald-500 focus:outline-hidden"
                  />
                  <button
                    onClick={handleSaveName}
                    title="Guardar nombre"
                    className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                    {profile.name}
                  </span>
                  <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              )}

              {/* Study Level Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLevelMenu(!showLevelMenu)}
                  className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                >
                  <GraduationCap className="w-3 h-3" />
                  <span>{profile.level}</span>
                </button>

                {showLevelMenu && (
                  <div className="absolute left-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                    <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Nivel Académico
                    </div>
                    {levels.map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => {
                          updateLevel(lvl);
                          setShowLevelMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700/60 ${
                          profile.level === lvl
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{lvl}</span>
                        {profile.level === lvl && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{tier.icon} {tier.title} (Nvl. {tier.level})</span>
              <span>•</span>
              <span>{profile.completedSubtopics.length} temas repasados</span>
            </div>
          </div>
        </div>

        {/* Gamification Stats: Daily Credits, Streak & XP */}
        <div className="flex items-center gap-3">
          {/* Daily Credits / Premium Pill */}
          {profile.isPremium ? (
            <button
              onClick={() => {
                if (onNavigateToPlans) onNavigateToPlans();
                else openCheckout('premium_monthly');
              }}
              title="Membresía QuimiBot Premium Activa: Consultas ilimitadas con Gemini y Simuladores 3D desbloqueados"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white border border-amber-300 shadow-xs hover:opacity-95 transition-all cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-200" />
              <span className="text-xs font-bold">Premium Ilimitado ✨</span>
            </button>
          ) : (
            <button
              onClick={() => openCheckout('premium_monthly')}
              title="Créditos diarios gratuitos para consultas con Gemini. Haz clic para adquirir Modo Premium con Stripe"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-xs transition-transform hover:scale-105 cursor-pointer ${
                profile.credits > 5
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : profile.credits > 0
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 animate-pulse'
                  : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-extrabold'
              }`}
            >
              <Zap className={`w-4 h-4 ${profile.credits === 0 ? 'text-rose-600 fill-rose-600' : 'text-amber-500 fill-amber-500'}`} />
              <span className="text-xs font-bold">{profile.credits}/{profile.dailyCreditLimit || 15}</span>
              <span className="text-xs hidden sm:inline">créditos</span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400 text-slate-900 ml-1">
                Upgrade
              </span>
            </button>
          )}

          {/* Study streak */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 shadow-xs"
            title={`Racha de estudio: ${profile.streakDays} día(s) consecutivos`}
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span className="text-xs font-bold">{profile.streakDays}</span>
            <span className="text-xs hidden sm:inline">días racha</span>
          </div>

          {/* XP & Progress */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-xs">
            <Award className="w-4 h-4 text-indigo-500" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-xs font-bold leading-none">
                <span>{profile.xp} XP</span>
                <Sparkles className="w-3 h-3 text-indigo-400" />
              </div>
              <div className="w-20 bg-indigo-200 dark:bg-indigo-900 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Database status indicator */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-xs"
            title={
              dbStatus === 'firestore'
                ? 'Base de datos Firestore conectada en tiempo real'
                : dbStatus === 'connecting'
                ? 'Conectando con base de datos Firestore...'
                : 'Almacenamiento seguro activo (Configura Firestore en .env para sincronización multi-dispositivo)'
            }
          >
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'firestore' ? 'bg-emerald-500' : dbStatus === 'connecting' ? 'bg-amber-500 animate-ping' : 'bg-blue-400'}`} />
            <span className="text-[11px] font-medium hidden lg:inline">
              {dbStatus === 'firestore' ? 'Firestore DB' : 'Local DB'}
            </span>
          </div>

          {/* Reset progress button */}
          <button
            onClick={() => {
              if (window.confirm('¿Reiniciar puntos de experiencia y temas completados? Las conversaciones guardadas se mantendrán.')) {
                resetProgress();
              }
            }}
            title="Reiniciar progreso del estudiante"
            className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
