import React from 'react';
import {
  Boxes,
  Atom,
  Sparkles,
  Scale,
  Droplets,
  Flame,
  Dna,
  Bot,
  Layers,
  Calculator,
  BarChart2,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { modulesData } from '../data/curriculum';

interface SidebarProps {
  activeTab: string;
  selectedModuleId: number;
  completedModules: number[];
  onSelectTab: (tab: string) => void;
  onSelectModule: (id: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  selectedModuleId,
  completedModules,
  onSelectTab,
  onSelectModule,
}) => {
  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Boxes': return <Boxes className="w-4 h-4" />;
      case 'Atom': return <Atom className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Scale': return <Scale className="w-4 h-4" />;
      case 'Droplets': return <Droplets className="w-4 h-4" />;
      case 'Flame': return <Flame className="w-4 h-4" />;
      case 'Dna': return <Dna className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
      {/* Primary Navigation Sections */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-1">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'dashboard'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Panel de Estudio</span>
        </button>

        <button
          onClick={() => onSelectTab('chat')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'chat'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <Bot className="w-4 h-4" />
            <span>Chat Tutor Virtual</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        <button
          onClick={() => onSelectTab('tools')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'tools'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Simuladores & Cálculos</span>
        </button>

        <button
          onClick={() => onSelectTab('periodictable')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'periodictable'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Atom className="w-4 h-4" />
          <span>Tabla Periódica</span>
        </button>

        <button
          onClick={() => onSelectTab('flashcards')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'flashcards'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Flashcards de Repaso</span>
        </button>
      </div>

      {/* Curriculum Modules List (All 7 from syllabus) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>Temario del Curso (7 Módulos)</span>
        </div>

        <div className="space-y-1 mt-1">
          {modulesData.map((m) => {
            const isSelected = activeTab === 'module' && selectedModuleId === m.id;
            const isCompleted = completedModules.includes(m.id);

            return (
              <button
                key={m.id}
                onClick={() => onSelectModule(m.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all ${
                  isSelected
                    ? 'bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-xl ${
                    isSelected
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {getModuleIcon(m.iconName)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">{m.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{m.subtopics.length} subtemas</div>
                  </div>
                </div>

                {isCompleted && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-1.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
