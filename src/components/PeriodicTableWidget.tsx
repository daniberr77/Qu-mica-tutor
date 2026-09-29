import React, { useState } from 'react';
import { periodicTableElements } from '../data/periodicTable';
import type { ChemicalElement } from '../types';
import { Search, X, MessageSquare, Atom } from 'lucide-react';

interface PeriodicTableWidgetProps {
  onAskTutor?: (question: string) => void;
}

export const PeriodicTableWidget: React.FC<PeriodicTableWidgetProps> = ({ onAskTutor }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeElement, setActiveElement] = useState<ChemicalElement | null>(null);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'nonmetal', label: 'No Metales', color: 'bg-emerald-500' },
    { id: 'noble', label: 'Gases Nobles', color: 'bg-purple-500' },
    { id: 'alkali', label: 'Alcalinos', color: 'bg-rose-500' },
    { id: 'alkaline', label: 'Alcalinotérreos', color: 'bg-amber-500' },
    { id: 'metalloid', label: 'Metaloides', color: 'bg-teal-500' },
    { id: 'halogen', label: 'Halógenos', color: 'bg-cyan-500' },
    { id: 'transition', label: 'Metales de Transición', color: 'bg-blue-500' },
    { id: 'post-transition', label: 'Metales Post-Transición', color: 'bg-indigo-500' },
  ];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'nonmetal': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'noble': return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300';
      case 'alkali': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
      case 'alkaline': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'metalloid': return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300';
      case 'halogen': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300';
      case 'transition': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
      case 'post-transition': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300';
    }
  };

  const filteredElements = periodicTableElements.filter((el) => {
    const matchesSearch =
      el.name.toLowerCase().includes(search.toLowerCase()) ||
      el.symbol.toLowerCase().includes(search.toLowerCase()) ||
      el.number.toString().includes(search);
    const matchesCategory =
      selectedCategory === 'all' || el.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Atom className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tabla Periódica Interactiva</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Explora las propiedades periódicas, configuraciones electrónicas y electronegatividades
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar elemento o símbolo..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === c.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Elements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {filteredElements.map((el) => {
          const colorClass = getCategoryColor(el.category);
          return (
            <div
              key={el.number}
              onClick={() => setActiveElement(el)}
              className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 hover:shadow-md hover:scale-[1.02] flex flex-col justify-between ${colorClass}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold opacity-75">{el.number}</span>
                <span className="text-[11px] font-mono opacity-80">{el.atomicMass.toFixed(2)}</span>
              </div>
              <div className="text-center my-1">
                <span className="text-2xl font-black tracking-tight">{el.symbol}</span>
                <div className="text-xs font-medium truncate mt-0.5">{el.name}</div>
              </div>
              <div className="text-[10px] text-center font-mono opacity-70 truncate">
                {el.electronConfiguration}
              </div>
            </div>
          );
        })}
      </div>

      {/* Element Detail Modal / Drawer */}
      {activeElement && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveElement(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex flex-col items-center justify-center shadow-lg">
                <span className="text-xs font-mono font-bold">{activeElement.number}</span>
                <span className="text-2xl font-black">{activeElement.symbol}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeElement.name}</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Categoría: {activeElement.category}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              {activeElement.summary}
            </p>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Masa Atómica:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{activeElement.atomicMass.toFixed(3)} u</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Electronegatividad:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {activeElement.electronegativity !== undefined ? `${activeElement.electronegativity} (Pauling)` : 'N/A (Inerte)'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Período / Grupo:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">Período {activeElement.period} | Grupo {activeElement.group}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block mb-0.5">Configuración Electrónica:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{activeElement.electronConfiguration}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {onAskTutor && (
                <button
                  onClick={() => {
                    const q = `Cuéntame sobre las propiedades periódicas y aplicaciones del ${activeElement.name} (${activeElement.symbol})`;
                    setActiveElement(null);
                    onAskTutor(q);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Preguntar a QuimiBot sobre {activeElement.name}
                </button>
              )}
              <button
                onClick={() => setActiveElement(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
