import React, { useState } from 'react';
import { Sun, Moon, Search, Bot, Atom } from 'lucide-react';
import { modulesData } from '../data/curriculum';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onSelectModule: (id: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  activeTab,
  onSelectTab,
  onSelectModule,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search logic across modules and subtopics
  const searchResults = searchQuery.trim()
    ? modulesData.flatMap((mod) => {
        const matchingSubtopics = mod.subtopics.filter(
          (sub) =>
            sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.keyPoints.some((kp) => kp.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        const matchesModule = mod.title.toLowerCase().includes(searchQuery.toLowerCase());

        if (matchesModule || matchingSubtopics.length > 0) {
          return [
            {
              moduleId: mod.id,
              moduleTitle: mod.title,
              subtopics: matchingSubtopics,
            },
          ];
        }
        return [];
      })
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none group flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Atom className="w-6 h-6 animate-spin" style={{ animationDuration: '15s' }} />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Quimi<span className="text-purple-600 dark:text-purple-400">Tutor</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                PRO
              </span>
            </span>
            <div className="text-[10px] text-slate-400 hidden sm:block font-medium">Tutorías Interactivas de Química</div>
          </div>
        </div>

        {/* Global Search Bar with Live Popover Results */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Buscar tema (ej. Le Chatelier, mol, pH, Lewis...)"
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Search Dropdown */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute top-12 left-0 right-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((res) => (
                  <div key={res.moduleId} className="p-2 border-b border-slate-100 dark:border-slate-800 last:border-none">
                    <button
                      onClick={() => {
                        onSelectModule(res.moduleId);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left font-bold text-xs text-purple-600 dark:text-purple-400 hover:underline mb-1"
                    >
                      {res.moduleTitle}
                    </button>
                    <div className="space-y-1">
                      {res.subtopics.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            onSelectModule(res.moduleId);
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left px-2 py-1 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                        >
                          <span className="truncate">{s.title}</span>
                          <span className="text-[10px] text-slate-400">Ver tema</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No se encontraron resultados para "{searchQuery}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Quick Chat Button */}
          <button
            onClick={() => onSelectTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'chat'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Tutor Virtual</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition"
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
