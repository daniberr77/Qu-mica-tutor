import React, { useState } from 'react';
import { flashcardsData } from '../data/flashcards';
import { Flashcard } from '../types';
import { RotateCw, ChevronLeft, ChevronRight, Shuffle, Check, BookOpen, Layers } from 'lucide-react';

interface FlashcardsViewProps {
  initialModuleId?: number | null;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ initialModuleId }) => {
  const [selectedModule, setSelectedModule] = useState<number | 'all'>(
    initialModuleId || 'all'
  );
  const [cards, setCards] = useState<Flashcard[]>(() => {
    if (initialModuleId) {
      return flashcardsData.filter((c) => c.moduleId === initialModuleId);
    }
    return flashcardsData;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  const handleModuleFilter = (mod: number | 'all') => {
    setSelectedModule(mod);
    const filtered = mod === 'all' ? flashcardsData : flashcardsData.filter((c) => c.moduleId === mod);
    setCards(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const toggleMastered = (id: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tarjetas de Repaso Rápido (Flashcards)</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Memorización activa de fórmulas, leyes fundamentales y definiciones de examen
          </p>
        </div>

        <button
          onClick={shuffleCards}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Barajar Tarjetas
        </button>
      </div>

      {/* Module filter pills */}
      <div className="flex flex-wrap gap-1.5 pb-2">
        <button
          onClick={() => handleModuleFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            selectedModule === 'all'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Todos los módulos ({flashcardsData.length})
        </button>
        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
          <button
            key={num}
            onClick={() => handleModuleFilter(num)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedModule === num
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Módulo {num}
          </button>
        ))}
      </div>

      {/* Flashcard Card Container */}
      {cards.length > 0 && currentCard ? (
        <div className="flex flex-col items-center">
          {/* Card counter */}
          <div className="text-xs font-mono font-bold text-slate-400 mb-3">
            Tarjeta {currentIndex + 1} de {cards.length} • Módulo {currentCard.moduleId} ({currentCard.category})
          </div>

          {/* Interactive Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`w-full max-w-xl min-h-[260px] sm:min-h-[300px] p-8 rounded-3xl border cursor-pointer transition-all duration-300 transform flex flex-col justify-between select-none relative shadow-sm ${
              isFlipped
                ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-950 dark:text-purple-100'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:shadow-md'
            }`}
          >
            {/* Top badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                {isFlipped ? 'Respuesta / Explicación' : 'Pregunta o Concepto'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" />
                Haz clic para girar
              </span>
            </div>

            {/* Main content */}
            <div className="my-auto py-6 text-center">
              {!isFlipped ? (
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                    {currentCard.front}
                  </h4>
                  {currentCard.formula && (
                    <div className="mt-4 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 inline-block font-mono text-sm font-bold text-purple-600 dark:text-purple-400">
                      {currentCard.formula}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-base sm:text-lg font-medium leading-relaxed">
                  {currentCard.back}
                </div>
              )}
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400">Categoría: {currentCard.category}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMastered(currentCard.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition ${
                  masteredIds.has(currentCard.id)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-100'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                {masteredIds.has(currentCard.id) ? 'Aprendido' : 'Marcar como aprendido'}
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={prevCard}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition shadow-sm"
              title="Tarjeta anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition shadow-sm"
            >
              {isFlipped ? 'Ver Pregunta' : 'Ver Respuesta'}
            </button>
            <button
              onClick={nextCard}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition shadow-sm"
              title="Siguiente tarjeta"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400">
          No hay tarjetas disponibles para esta selección.
        </div>
      )}
    </div>
  );
};
