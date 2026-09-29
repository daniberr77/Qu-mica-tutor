import React, { useState } from 'react';
import { ModuleData } from '../types';
import { X, CheckCircle, XCircle, Award, RotateCcw, MessageSquare, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizModalProps {
  module: ModuleData;
  onClose: () => void;
  onAskTutor: (prompt: string) => void;
  onSaveScore?: (moduleId: number, score: number, total: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  module,
  onClose,
  onAskTutor,
  onSaveScore,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const questions = module.quiz;
  const currentQ = questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      const finalScore = score + (selectedOption === currentQ.correctIndex ? 0 : 0);
      if (onSaveScore) {
        onSaveScore(module.id, score, questions.length);
      }
      if (score / questions.length >= 0.6) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {!isFinished ? (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Quiz: {module.title}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                Pregunta {currentIdx + 1} de {questions.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6 leading-snug">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-2.5 mb-6">
              {currentQ.options.map((opt, i) => {
                let btnStyle = 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:border-purple-300';
                if (isAnswered) {
                  if (i === currentQ.correctIndex) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (i === selectedOption) {
                    btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                  } else {
                    btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && i === currentQ.correctIndex && (
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 ml-2" />
                    )}
                    {isAnswered && i === selectedOption && i !== currentQ.correctIndex && (
                      <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answer */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 text-xs sm:text-sm text-purple-900 dark:text-purple-200 mb-6">
                <strong>Explicación:</strong> {currentQ.explanation}
              </div>
            )}

            {/* Next / Submit button */}
            {isAnswered && (
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl shadow-sm transition"
                >
                  <span>{currentIdx < questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Finished Screen */
          <div className="text-center py-4">
            <div className="w-20 h-20 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center mb-4 shadow-sm">
              <Award className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              ¡Quiz Completado!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {percentage >= 70
                ? '¡Excelente dominio del temario! Continúa con el siguiente módulo.'
                : 'Buen intento. Te recomendamos repasar los subtemas con el tutor.'}
            </p>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 inline-block mb-6 min-w-[220px]">
              <div className="text-4xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
                {score} / {questions.length}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                Puntuación ({percentage}%)
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={restartQuiz}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reintentar Quiz
              </button>

              <button
                onClick={() => {
                  onClose();
                  onAskTutor(`Hola QuimiBot, acabo de terminar el quiz de "${module.title}" y obtuve ${score}/${questions.length}. ¿Podrías darme un resumen para reforzar mis debilidades?`);
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-sm transition"
              >
                <MessageSquare className="w-4 h-4" />
                Reforzar con QuimiBot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
