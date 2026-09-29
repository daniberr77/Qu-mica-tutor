import React from 'react';
import { modulesData } from '../data/curriculum';
import { flashcardsData } from '../data/flashcards';
import { Award, CheckCircle2, BookOpen, Layers, Sparkles, ArrowRight } from 'lucide-react';

interface ProgressDashboardProps {
  completedModules: number[];
  quizScores: Record<number, { score: number; total: number }>;
  onSelectModule: (id: number) => void;
  onOpenChat: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  completedModules,
  quizScores,
  onSelectModule,
  onOpenChat,
}) => {
  const totalModules = modulesData.length;
  const completedCount = completedModules.length;
  const progressPercent = Math.round((completedCount / totalModules) * 100);

  // Calculate quiz performance
  const testedModulesCount = Object.keys(quizScores).length;
  let totalScoreSum = 0;
  let totalPossibleSum = 0;
  for (const q of Object.values(quizScores)) {
    totalScoreSum += q.score;
    totalPossibleSum += q.total;
  }
  const avgQuizPercent = totalPossibleSum > 0 ? Math.round((totalScoreSum / totalPossibleSum) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
            Panel de Progreso y Tutoría
          </span>
          <h2 className="text-3xl font-extrabold mt-3 mb-2">
            Plan de Estudio de Química
          </h2>
          <p className="text-purple-100 text-sm leading-relaxed mb-6">
            Seguimiento de los 7 módulos del temario: desde los conceptos básicos de la materia hasta la química orgánica y biomoléculas.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onSelectModule(completedModules.length < 7 ? (completedModules.length + 1) : 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-800 font-bold text-sm hover:bg-purple-50 transition shadow-sm"
            >
              <span>{completedCount === 0 ? 'Comenzar Módulo 1' : 'Continuar Estudio'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenChat}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600/60 hover:bg-purple-600 border border-purple-400/40 text-white font-bold text-sm transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Chatear con QuimiBot</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Módulos Completados</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {completedCount} <span className="text-sm font-normal text-slate-400">/ {totalModules}</span>
            </div>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">{progressPercent}% completado</span>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Promedio en Quizzes</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {testedModulesCount > 0 ? `${avgQuizPercent}%` : 'Sin evaluar'}
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">{testedModulesCount} de 7 evaluados</span>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Tarjetas de Repaso</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {flashcardsData.length}
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Fórmulas y conceptos listos</span>
          </div>
        </div>
      </div>

      {/* Modules Roadmap Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Temario Oficial de Estudio
        </h3>

        <div className="space-y-3">
          {modulesData.map((mod) => {
            const isDone = completedModules.includes(mod.id);
            const scoreObj = quizScores[mod.id];

            return (
              <div
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                    isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                      : 'bg-purple-100 dark:bg-purple-950 text-purple-600'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : mod.id}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {mod.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {mod.subtopics.length} subtemas • {mod.subtopics.map(s => s.title).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {scoreObj && (
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      Quiz: {scoreObj.score}/{scoreObj.total} ({Math.round((scoreObj.score / scoreObj.total) * 100)}%)
                    </span>
                  )}
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    Estudiar <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
