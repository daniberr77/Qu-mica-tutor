import React, { useState } from 'react';
import type { ModuleData } from '../types';
import {
  Boxes,
  Atom,
  Sparkles,
  Scale,
  Droplets,
  Flame,
  Dna,
  BookOpen,
  CheckCircle,
  Award,
  Calculator,
  MessageSquare,
  Layers
} from 'lucide-react';

interface ModuleViewerProps {
  module: ModuleData;
  onOpenQuiz: (module: ModuleData) => void;
  onOpenFlashcards: (moduleId: number) => void;
  onAskTutor: (prompt: string) => void;
  isCompleted?: boolean;
  onToggleComplete?: (moduleId: number) => void;
}

export const ModuleViewer: React.FC<ModuleViewerProps> = ({
  module,
  onOpenQuiz,
  onOpenFlashcards,
  onAskTutor,
  isCompleted = false,
  onToggleComplete,
}) => {
  const [activeSubtopicId, setActiveSubtopicId] = useState<string>(module.subtopics[0]?.id || '');

  const activeSubtopic = module.subtopics.find((s) => s.id === activeSubtopicId) || module.subtopics[0];

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Boxes': return <Boxes className="w-6 h-6" />;
      case 'Atom': return <Atom className="w-6 h-6" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6" />;
      case 'Scale': return <Scale className="w-6 h-6" />;
      case 'Droplets': return <Droplets className="w-6 h-6" />;
      case 'Flame': return <Flame className="w-6 h-6" />;
      case 'Dna': return <Dna className="w-6 h-6" />;
      default: return <BookOpen className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex-shrink-0 shadow-sm">
              {getModuleIcon(module.iconName)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                  Módulo {module.id} de 7
                </span>
                {isCompleted && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Completado
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {module.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1">
                {module.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Module Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenQuiz(module)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-sm transition"
            >
              <Award className="w-4 h-4" />
              Evaluar con Quiz ({module.quiz.length})
            </button>

            <button
              onClick={() => onOpenFlashcards(module.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition"
            >
              <Layers className="w-4 h-4" />
              Flashcards
            </button>

            {onToggleComplete && (
              <button
                onClick={() => onToggleComplete(module.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition ${
                  isCompleted
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {isCompleted ? 'Módulo visto' : 'Marcar visto'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subtopics Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
        {module.subtopics.map((sub, idx) => (
          <button
            key={sub.id}
            onClick={() => setActiveSubtopicId(sub.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeSubtopicId === sub.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              activeSubtopicId === sub.id ? 'bg-purple-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {idx + 1}
            </span>
            <span>{sub.title}</span>
          </button>
        ))}
      </div>

      {/* Subtopic Main Content Area */}
      {activeSubtopic && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Reading & Theory (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Subtema Teórico
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {activeSubtopic.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-2 leading-relaxed italic bg-purple-50/50 dark:bg-purple-950/20 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/50">
                  {activeSubtopic.summary}
                </p>
              </div>

              {/* Rich Content View */}
              <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed space-y-3 font-sans whitespace-pre-line">
                {activeSubtopic.content}
              </div>

              {/* Formulas Box if present */}
              {activeSubtopic.formulas && activeSubtopic.formulas.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5 mb-2.5">
                    <Calculator className="w-4 h-4" />
                    Fórmulas y Leyes Clave
                  </h4>
                  <div className="space-y-1.5 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    {activeSubtopic.formulas.map((form, i) => (
                      <div key={i} className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-purple-700 dark:text-purple-300">
                        {form}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real-world Problem & Solution Examples */}
              {activeSubtopic.examples && activeSubtopic.examples.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Ejercicios Prácticos Resueltos
                  </h4>
                  {activeSubtopic.examples.map((ex, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs sm:text-sm">
                      <div className="font-bold text-slate-900 dark:text-white flex items-start gap-2">
                        <span className="p-1 rounded bg-purple-100 dark:bg-purple-950 text-purple-600 text-xs">Ej {i+1}</span>
                        <span>{ex.problem}</span>
                      </div>
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl font-mono text-emerald-800 dark:text-emerald-300">
                        <strong>Solución:</strong> {ex.solution}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-xs italic">
                        <strong>Explicación:</strong> {ex.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Key Points & Ask Tutor Action (1 col) */}
          <div className="space-y-6">
            {/* Key concepts card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                Puntos Fundamentales
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeSubtopic.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 mt-1.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ask Tutor Quick Card */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <h4 className="font-bold text-sm">¿Dudas con este subtema?</h4>
              </div>
              <p className="text-xs text-purple-100 leading-relaxed">
                QuimiBot puede resolver problemas con números personalizados, darte ejemplos analógicos o prepararte para exámenes.
              </p>
              <button
                onClick={() => onAskTutor(`Hola QuimiBot, explícame a fondo el tema: "${activeSubtopic.title}" con un ejemplo práctico.`)}
                className="w-full py-2.5 px-4 bg-white text-purple-700 hover:bg-purple-50 font-bold text-xs rounded-xl shadow-sm transition"
              >
                Consultar a QuimiBot sobre esto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
