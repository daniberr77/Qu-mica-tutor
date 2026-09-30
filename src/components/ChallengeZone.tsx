import React, { useState, useEffect, useCallback, useId, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Flame,
  Trophy,
  Zap,
  Heart,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Lightbulb,
  ArrowRight,
  Volume2,
  VolumeX,
  Bot,
  Shuffle,
  Scale,
  Wind,
  Atom,
  Plus,
  Minus,
  Check,
  HelpCircle,
  Award,
} from 'lucide-react';
import { useStudent } from '../context';
import type {
  Challenge,
  ChallengeCategory,
  ChallengeDifficulty,
  GameMode,
  NumericChallenge,
  BalancingChallenge,
} from '../types/challenges';
import { getRandomChallenge } from '../data/challengesData';
import { generateChallengeWithGemini, isGeminiConfigured } from '../services/gemini';
import {
  playSuccessSound,
  playStreakSound,
  playErrorSound,
  isSoundEnabled,
  setSoundEnabled,
} from '../services/soundEffects';

interface ChallengeZoneProps {
  onAskTutor?: (question: string) => void;
}

const STORAGE_BEST_STREAK = 'quimica_tutor_best_streak';

export const ChallengeZone: React.FC<ChallengeZoneProps> = ({ onAskTutor }) => {
  const { addXp, profile } = useStudent();
  const numericInputId = useId();

  // Mode & Filters
  const [gameMode, setGameMode] = useState<GameMode>('practice');
  const [categoryFilter, setCategoryFilter] = useState<ChallengeCategory | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<ChallengeDifficulty | 'all'>('all');

  // Game Stats
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_BEST_STREAK) || '0', 10);
    } catch {
      return 0;
    }
  });
  const [sessionXp, setSessionXp] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());

  // Current Challenge & Answers
  const [challenge, setChallenge] = useState<Challenge>(() => getRandomChallenge('all', 'all'));
  const [isLoadingChallenge, setIsLoadingChallenge] = useState<boolean>(false);
  const [numericAnswer, setNumericAnswer] = useState<string>('');
  const [reactantCoeffs, setReactantCoeffs] = useState<number[]>([]);
  const [productCoeffs, setProductCoeffs] = useState<number[]>([]);

  // State of interaction
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect' | 'revealed'>('idle');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [lastEarnedPoints, setLastEarnedPoints] = useState<number>(0);
  const [streakMultiplier, setStreakMultiplier] = useState<number>(1.0);

  // Initialize coefficients whenever challenge changes
  const initChallengeState = useCallback((c: Challenge) => {
    setChallenge(c);
    setNumericAnswer('');
    setStatus('idle');
    setShowHint(false);
    setLastEarnedPoints(0);

    if (c.type === 'coefficients') {
      const bal = c as BalancingChallenge;
      setReactantCoeffs(new Array(bal.reactants.length).fill(1));
      setProductCoeffs(new Array(bal.products.length).fill(1));
    } else {
      setReactantCoeffs([]);
      setProductCoeffs([]);
    }
  }, []);

  // Load challenge (dynamically using Gemini based on study material or local generator)
  const loadChallenge = useCallback(
    async (
      cat: ChallengeCategory | 'all' = categoryFilter,
      diff: ChallengeDifficulty | 'all' = difficultyFilter
    ) => {
      setIsLoadingChallenge(true);
      try {
        if (isGeminiConfigured()) {
          const dynamicChallenge = await generateChallengeWithGemini(cat, diff);
          initChallengeState(dynamicChallenge);
        } else {
          const localChallenge = getRandomChallenge(cat, diff);
          initChallengeState(localChallenge);
        }
      } catch (err) {
        console.warn('Error al cargar reto dinámico con Gemini:', err);
        const localChallenge = getRandomChallenge(cat, diff);
        initChallengeState(localChallenge);
      } finally {
        setIsLoadingChallenge(false);
      }
    },
    [categoryFilter, difficultyFilter, initChallengeState]
  );

  // Next Challenge
  const handleNextChallenge = useCallback(() => {
    loadChallenge(categoryFilter, difficultyFilter);
  }, [categoryFilter, difficultyFilter, loadChallenge]);

  // Restart Game in Survival Mode
  const handleRestartSurvival = () => {
    setLives(3);
    setIsGameOver(false);
    setCurrentStreak(0);
    handleNextChallenge();
  };

  // On mount: generate dynamic challenge when student enters section
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (isGeminiConfigured()) {
        loadChallenge(categoryFilter, difficultyFilter);
      }
    }
  }, [loadChallenge, categoryFilter, difficultyFilter]);

  // Sound toggle
  const toggleSound = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setSoundEnabled(nextState);
  };

  // Update coefficients for balancing
  const updateCoeff = (side: 'reactants' | 'products', index: number, delta: number) => {
    if (status === 'correct') return;
    if (side === 'reactants') {
      setReactantCoeffs((prev) => {
        const next = [...prev];
        next[index] = Math.max(1, Math.min(20, (next[index] || 1) + delta));
        return next;
      });
    } else {
      setProductCoeffs((prev) => {
        const next = [...prev];
        next[index] = Math.max(1, Math.min(20, (next[index] || 1) + delta));
        return next;
      });
    }
  };

  const setDirectCoeff = (side: 'reactants' | 'products', index: number, value: string) => {
    if (status === 'correct') return;
    const num = parseInt(value, 10);
    const valid = isNaN(num) ? 1 : Math.max(1, Math.min(20, num));
    if (side === 'reactants') {
      setReactantCoeffs((prev) => {
        const next = [...prev];
        next[index] = valid;
        return next;
      });
    } else {
      setProductCoeffs((prev) => {
        const next = [...prev];
        next[index] = valid;
        return next;
      });
    }
  };

  // Calculate Streak Multiplier
  const getMultiplier = (streak: number): number => {
    if (streak >= 5) return 2.0;
    if (streak >= 3) return 1.5;
    return 1.0;
  };

  // Verification Logic
  const handleVerify = () => {
    if (status === 'correct') {
      handleNextChallenge();
      return;
    }

    let isCorrect = false;

    if (challenge.type === 'numeric') {
      const numChallenge = challenge as NumericChallenge;
      const cleanVal = numericAnswer.trim().replace(',', '.');
      const studentVal = parseFloat(cleanVal);

      if (isNaN(studentVal)) {
        alert('Por favor ingresa un número válido antes de verificar.');
        return;
      }

      const diff = Math.abs(studentVal - numChallenge.targetValue);
      const relativeDiff =
        Math.abs(studentVal - numChallenge.targetValue) /
        Math.max(Math.abs(numChallenge.targetValue), 0.0001);

      isCorrect = diff <= numChallenge.tolerance || relativeDiff <= 0.035;
    } else if (challenge.type === 'coefficients') {
      const balChallenge = challenge as BalancingChallenge;
      const rTarget = balChallenge.correctCoefficients.reactants;
      const pTarget = balChallenge.correctCoefficients.products;

      // Check exact minimum integer coefficients
      const rMatch =
        reactantCoeffs.length === rTarget.length &&
        reactantCoeffs.every((c, i) => c === rTarget[i]);
      const pMatch =
        productCoeffs.length === pTarget.length &&
        productCoeffs.every((c, i) => c === pTarget[i]);

      if (rMatch && pMatch) {
        isCorrect = true;
      } else {
        // Also check if user entered proportional multiple (e.g., 2x of all coefficients)
        const ratioR0 = reactantCoeffs[0] / rTarget[0];
        const allRRatio = reactantCoeffs.every((c, i) => c / rTarget[i] === ratioR0);
        const allPRatio = productCoeffs.every((c, i) => c / pTarget[i] === ratioR0);

        if (allRRatio && allPRatio && ratioR0 > 1) {
          isCorrect = true; // Still chemically balanced!
        }
      }
    }

    if (isCorrect) {
      // Correct answer!
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);

      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        try {
          localStorage.setItem(STORAGE_BEST_STREAK, newStreak.toString());
        } catch {
          // ignore
        }
      }

      const mult = getMultiplier(newStreak);
      setStreakMultiplier(mult);
      const earned = Math.round(challenge.points * mult);
      setLastEarnedPoints(earned);
      setSessionXp((prev) => prev + earned);
      setSolvedCount((prev) => prev + 1);

      // Add to global student profile XP!
      addXp(earned, `Reto de química superado: ${challenge.title} (Racha ${newStreak})`);

      setStatus('correct');

      // Sound & Visuals
      if (newStreak >= 3) {
        playStreakSound();
      } else {
        playSuccessSound();
      }

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6'],
        });
      } catch {
        // confetti fallback
      }
    } else {
      // Incorrect answer
      playErrorSound();
      setStatus('incorrect');

      if (gameMode === 'survival') {
        const nextLives = lives - 1;
        setLives(nextLives);
        setCurrentStreak(0);
        if (nextLives <= 0) {
          setIsGameOver(true);
        }
      } else {
        setCurrentStreak(0);
      }
    }
  };

  const handleRevealSolution = () => {
    setStatus('revealed');
    setCurrentStreak(0);
  };

  const handleConsultTutor = () => {
    if (!onAskTutor) return;
    const prompt = `Hola QuimiBot, estoy en la 'Zona de Retos' practicando el problema: "${challenge.title}".\n\nPregunta: ${challenge.question}\nFórmula o contexto: ${challenge.chemicalEquation || challenge.formula || ''}\n\n¿Podrías explicarme paso a paso con claridad cómo se resuelve y qué conceptos químicos debo aplicar?`;
    onAskTutor(prompt);
  };

  const handleStartSocraticSession = () => {
    if (!onAskTutor) return;
    const wrongDetail =
      challenge.type === 'numeric' && numericAnswer
        ? `Mi respuesta ingresada fue: ${numericAnswer} ${(challenge as NumericChallenge).unit}`
        : challenge.type === 'coefficients' && reactantCoeffs.length > 0
        ? `Mis coeficientes intentados fueron: Reactivos [${reactantCoeffs.join(', ')}], Productos [${productCoeffs.join(', ')}]`
        : '';

    const prompt = `Hola QuimiBot, me equivoqué en este reto de la 'Zona de Retos' y necesito ayuda. Por favor NO me des la respuesta ni el resultado final. Inicia una sesión socrática haciéndome preguntas guía paso a paso, basándote exclusivamente en el libro de material_estudio, para ayudarme a razonar y encontrar la solución por mí mismo.

Reto: "${challenge.title}"
Categoría: ${challenge.category} (Nivel: ${challenge.difficulty})
Enunciado: ${challenge.question}
${challenge.chemicalEquation ? `Ecuación/Fórmula: ${challenge.chemicalEquation}` : ''}
${wrongDetail}

¿Cuál es la primera pregunta o concepto clave del material de estudio que debo analizar para comenzar a corregirlo?`;

    onAskTutor(prompt);
  };

  const handleVerifyRef = useRef(handleVerify);
  const handleNextChallengeRef = useRef(handleNextChallenge);

  useEffect(() => {
    handleVerifyRef.current = handleVerify;
    handleNextChallengeRef.current = handleNextChallenge;
  });

  // Keyboard shortcut: Enter to verify or advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // If focus is on an input or button, allow normal or custom trigger
        if (status === 'correct') {
          handleNextChallengeRef.current();
        } else if (status === 'idle' || status === 'incorrect') {
          handleVerifyRef.current();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  // Color & Category styling
  const categoryConfig = {
    gases: {
      name: 'Gases Ideales',
      color: 'text-cyan-600 dark:text-cyan-400',
      badgeBg: 'bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      icon: Wind,
    },
    estequiometria: {
      name: 'Estequiometría',
      color: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: Scale,
    },
    balanceo: {
      name: 'Balanceo de Ecuaciones',
      color: 'text-purple-600 dark:text-purple-400',
      badgeBg: 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      icon: Atom,
    },
  };

  const currentCat = categoryConfig[challenge.category];
  const CategoryIcon = currentCat.icon;

  const difficultyLabels = {
    facil: { label: 'Fácil', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300' },
    medio: { label: 'Intermedio', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300' },
    avanzado: { label: 'Avanzado', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300' },
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
      {/* ======================================================== */}
      {/* TOP HEADER: GAMIFICATION STATUS & RACHAS                 */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title and game introduction */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Flame className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Zona de Retos
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                  Gamificado
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Desafía tus conocimientos en gases, estequiometría y balanceo con problemas aleatorios.
              </p>
            </div>
          </div>

          {/* Gamification Counters: Streak, Best Streak, XP, Lives */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Streak Counter */}
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all ${
                currentStreak >= 3
                  ? 'bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 border-orange-400 dark:border-orange-500/50 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
              }`}
            >
              <div className="relative">
                <Flame
                  className={`w-5 h-5 ${
                    currentStreak > 0
                      ? 'text-orange-500 fill-orange-500 animate-bounce'
                      : 'text-slate-400'
                  }`}
                />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 leading-none">
                  Racha Actual
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1">
                  <span>{currentStreak}</span>
                  {currentStreak >= 3 && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-orange-500 text-white animate-pulse">
                      x{getMultiplier(currentStreak)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Best Streak */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 leading-none">
                  Récord
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {bestStreak} <span className="text-[10px] font-normal text-slate-400">seg</span>
                </div>
              </div>
            </div>

            {/* Session XP */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" />
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 leading-none">
                  XP Ganado
                </div>
                <div className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                  +{sessionXp}
                </div>
              </div>
            </div>

            {/* Lives (Survival Mode) */}
            {gameMode === 'survival' && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                {[1, 2, 3].map((heartIndex) => (
                  <Heart
                    key={heartIndex}
                    className={`w-4 h-4 transition-all ${
                      heartIndex <= lives
                        ? 'text-rose-500 fill-rose-500 scale-100'
                        : 'text-slate-300 dark:text-slate-700 scale-90'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={soundOn ? 'Silenciar sonidos' : 'Activar sonidos'}
              className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 transition"
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Game Mode & Category Switchers Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Game Mode */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => {
                setGameMode('practice');
                setIsGameOver(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                gameMode === 'practice'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🎮 Práctica Libre
            </button>
            <button
              onClick={() => {
                setGameMode('survival');
                setLives(3);
                setIsGameOver(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 ${
                gameMode === 'survival'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Heart className="w-3 h-3 fill-current" />
              <span>Supervivencia (3 Vidas)</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-400 text-[11px] font-medium mr-1 hidden sm:inline">Materia:</span>
            {[
              { id: 'all', label: '🎲 Todo Mixto' },
              { id: 'gases', label: '💨 Gases' },
              { id: 'estequiometria', label: '⚖️ Estequiometría' },
              { id: 'balanceo', label: '⚗️ Balanceo' },
            ].map((cat) => (
              <button
                key={cat.id}
                disabled={isLoadingChallenge}
                onClick={() => {
                  const newCat = cat.id as ChallengeCategory | 'all';
                  setCategoryFilter(newCat);
                  loadChallenge(newCat, difficultyFilter);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap disabled:opacity-50 ${
                  categoryFilter === cat.id
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <span className="text-slate-300 dark:text-slate-700 mx-1 hidden sm:inline">|</span>
            <span className="text-slate-400 text-[11px] font-medium mr-1 hidden sm:inline">Nivel:</span>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'facil', label: 'Fácil' },
              { id: 'medio', label: 'Medio' },
              { id: 'avanzado', label: 'Avanzado' },
            ].map((diff) => (
              <button
                key={diff.id}
                disabled={isLoadingChallenge}
                onClick={() => {
                  const newDiff = diff.id as ChallengeDifficulty | 'all';
                  setDifficultyFilter(newDiff);
                  loadChallenge(categoryFilter, newDiff);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap disabled:opacity-50 ${
                  difficultyFilter === diff.id
                    ? 'bg-amber-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GAME OVER CARD (SURVIVAL MODE ONLY)                      */}
      {/* ======================================================== */}
      {isGameOver ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-rose-200 dark:border-rose-900/50 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
            <Heart className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ¡Se acabaron tus vidas!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Completaste una gran sesión de entrenamiento. Tu perseverancia es la clave para dominar la química.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-400 font-medium">Retos Resueltos</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{solvedCount}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-400 font-medium">Racha Máxima</div>
              <div className="text-xl font-bold text-orange-500">{bestStreak} 🔥</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-400 font-medium">XP Obtenido</div>
              <div className="text-xl font-bold text-emerald-600">+{sessionXp}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestartSurvival}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar de nuevo (3 Vidas)</span>
            </button>
            <button
              onClick={() => {
                setGameMode('practice');
                setIsGameOver(false);
                handleNextChallenge();
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm transition cursor-pointer"
            >
              Cambiar a Modo Práctica
            </button>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* MAIN CHALLENGE INTERACTIVE ARENA                         */
        /* ======================================================== */
        <div
          className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-300 shadow-sm ${
            status === 'correct'
              ? 'border-emerald-500/80 shadow-emerald-500/10 ring-2 ring-emerald-500/20'
              : status === 'incorrect'
              ? 'border-rose-400 dark:border-rose-800/80 shadow-rose-500/5 ring-1 ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          {/* Card Header: Category & Difficulty Badges & Actions */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Pill */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${currentCat.badgeBg}`}
              >
                <CategoryIcon className="w-3.5 h-3.5" />
                <span>{currentCat.name}</span>
              </span>

              {/* Difficulty Pill */}
              <span
                className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                  difficultyLabels[challenge.difficulty].color
                }`}
              >
                {difficultyLabels[challenge.difficulty].label}
              </span>

              {/* Points badge */}
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>+{challenge.points} XP base</span>
              </span>

              {/* Dynamic Gemini Badge */}
              {challenge.id?.startsWith('gemini-') && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-950/80 dark:to-indigo-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
                  <span>Dinámico Gemini (material_estudio)</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Hint button */}
              <button
                onClick={() => setShowHint((prev) => !prev)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  showHint
                    ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>{showHint ? 'Ocultar Pista' : 'Ver Pista'}</span>
              </button>

              {/* Skip / Random challenge button */}
              <button
                onClick={handleNextChallenge}
                disabled={isLoadingChallenge}
                title="Generar otro problema con Gemini IA"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-50"
              >
                <Shuffle className={`w-3.5 h-3.5 ${isLoadingChallenge ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isLoadingChallenge ? 'Generando...' : 'Otro Reto'}</span>
              </button>
            </div>
          </div>

          {/* Problem Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {isLoadingChallenge ? (
              <div className="py-12 px-4 text-center space-y-4 animate-in fade-in duration-200">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 animate-bounce">
                  <Bot className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Formulando reto dinámico con Gemini IA...
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Consultando el libro oficial en <code className="font-mono text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded">material_estudio</code> para inventar un reto único de {categoryFilter === 'all' ? 'química' : categoryFilter}.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>Basado en métodos de balanceo UAEH, estequiometría y leyes de gases</span>
                </div>
              </div>
            ) : (
              <>
                {/* Title & Question Statement */}
                <div className="space-y-3">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                    {challenge.title}
                  </h2>
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {challenge.question}
              </div>
            </div>

            {/* Optional Chemical Formula or Equation Context */}
            {challenge.chemicalEquation && (
              <div className="bg-slate-100/80 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Ecuación / Contexto Químico
                </div>
                <div className="text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-white tracking-wide">
                  {challenge.chemicalEquation}
                </div>
              </div>
            )}

            {/* Hint Box (if revealed) */}
            {showHint && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Pista pedagógica: </span>
                  {challenge.hint}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* STUDENT INPUT AREA                                       */}
            {/* ======================================================== */}

            {challenge.type === 'numeric' && (
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                <label htmlFor={numericInputId} className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  Ingresa tu resultado numérico:
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Numeric Input with Unit Addon */}
                  <div className="relative flex-1">
                    <input
                      id={numericInputId}
                      type="text"
                      inputMode="decimal"
                      disabled={status === 'correct'}
                      value={numericAnswer}
                      onChange={(e) => setNumericAnswer(e.target.value)}
                      placeholder={(challenge as NumericChallenge).placeholder || 'Escribe tu respuesta...'}
                      className="w-full text-lg sm:text-xl font-bold px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-inner"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg pointer-events-none">
                      {(challenge as NumericChallenge).unit}
                    </div>
                  </div>

                  {/* Verify Button */}
                  <button
                    onClick={handleVerify}
                    disabled={status === 'correct'}
                    className={`px-7 py-3 rounded-2xl font-bold text-sm sm:text-base text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                      status === 'correct'
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95'
                    }`}
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>Verificar</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tip: Acepta decimales con punto (.) o coma (,). También puedes presionar <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono">Enter</kbd> para verificar.
                </p>
              </div>
            )}

            {/* Balancing Coefficients UI */}
            {challenge.type === 'coefficients' && (
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  Ajusta los coeficientes estequiométricos mínimos para cada compuesto:
                </div>

                {/* Equation interactive blocks */}
                <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto">
                  <div className="flex items-center justify-center gap-3 sm:gap-4 min-w-max">
                    {/* Reactants */}
                    {(challenge as BalancingChallenge).reactants.map((sub, idx) => (
                      <React.Fragment key={`r-${idx}`}>
                        {idx > 0 && <span className="text-xl font-bold text-slate-400">+</span>}
                        <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateCoeff('reactants', idx, -1)}
                              disabled={status === 'correct'}
                              className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-white font-bold transition cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              disabled={status === 'correct'}
                              value={reactantCoeffs[idx] || 1}
                              onChange={(e) => setDirectCoeff('reactants', idx, e.target.value)}
                              className="w-12 text-center text-lg font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-600 py-1"
                            />
                            <button
                              type="button"
                              onClick={() => updateCoeff('reactants', idx, 1)}
                              disabled={status === 'correct'}
                              className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-white font-bold transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="font-mono font-bold text-base sm:text-lg text-emerald-600 dark:text-emerald-400">
                            {sub.formula}
                          </span>
                        </div>
                      </React.Fragment>
                    ))}

                    {/* Arrow */}
                    <div className="px-2 text-2xl font-bold text-slate-500">→</div>

                    {/* Products */}
                    {(challenge as BalancingChallenge).products.map((sub, idx) => (
                      <React.Fragment key={`p-${idx}`}>
                        {idx > 0 && <span className="text-xl font-bold text-slate-400">+</span>}
                        <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateCoeff('products', idx, -1)}
                              disabled={status === 'correct'}
                              className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-white font-bold transition cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              disabled={status === 'correct'}
                              value={productCoeffs[idx] || 1}
                              onChange={(e) => setDirectCoeff('products', idx, e.target.value)}
                              className="w-12 text-center text-lg font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-600 py-1"
                            />
                            <button
                              type="button"
                              onClick={() => updateCoeff('products', idx, 1)}
                              disabled={status === 'correct'}
                              className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-white font-bold transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="font-mono font-bold text-base sm:text-lg text-emerald-600 dark:text-emerald-400">
                            {sub.formula}
                          </span>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleVerify}
                    disabled={status === 'correct'}
                    className={`px-7 py-3 rounded-2xl font-bold text-sm sm:text-base text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                      status === 'correct'
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95'
                    }`}
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>Verificar Balanceo</span>
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* FEEDBACK STATE: SUCCESS / ERROR / EXPLANATION            */}
            {/* ======================================================== */}

            {status === 'correct' && (
              <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-emerald-900 dark:text-emerald-200">
                        ¡Respuesta Correcta!
                      </h4>
                      <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                        +{lastEarnedPoints} XP sumados a tu perfil ({challenge.points} XP base
                        {streakMultiplier > 1 ? ` × ${streakMultiplier} bonus de racha 🔥` : ''}).
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleNextChallenge}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Siguiente Reto</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Step by step explanation */}
                <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800/60 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed space-y-1">
                  <div className="font-bold flex items-center gap-1 text-emerald-900 dark:text-emerald-300">
                    <Award className="w-4 h-4" />
                    <span>Explicación del método:</span>
                  </div>
                  <div className="whitespace-pre-line font-normal pl-5">
                    {challenge.explanation}
                  </div>
                </div>
              </div>
            )}

            {status === 'incorrect' && (
              <div className="p-5 sm:p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-md">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-rose-900 dark:text-rose-200">
                      Respuesta Incorrecta
                    </h4>
                    <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300">
                      {gameMode === 'survival'
                        ? `Has perdido 1 vida. Te quedan ${lives} ${lives === 1 ? 'vida' : 'vidas'}.`
                        : 'Revisa las unidades y redondeos o consulta una pista.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200 dark:border-rose-900/50">
                  <button
                    onClick={() => {
                      setStatus('idle');
                      setShowHint(true);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Intentar de nuevo</span>
                  </button>

                  <button
                    onClick={handleRevealSolution}
                    className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs transition cursor-pointer"
                  >
                    Ver Solución
                  </button>

                  {onAskTutor && (
                    <button
                      onClick={handleStartSocraticSession}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer ml-auto"
                      title="QuimiBot no te dará la respuesta: te guiará con preguntas socráticas paso a paso"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Pedir ayuda socrática (QuimiBot)</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {status === 'revealed' && (
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    <span>Solución Paso a Paso:</span>
                  </h4>
                  <button
                    onClick={handleNextChallenge}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Siguiente Reto</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed pl-6 border-l-2 border-emerald-500">
                  {challenge.explanation}
                </div>
              </div>
            )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FOOTER STATS & TIPS                                      */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Multiplicador</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {currentStreak >= 5 ? 'x2.0 (¡Fuego Alquímico!)' : currentStreak >= 3 ? 'x1.5 (En llamas)' : 'x1.0 Estándar'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Aciertos en Sesión</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {solvedCount} {solvedCount === 1 ? 'reto' : 'retos'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600">
            <Atom className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Tu Rango Químico</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {profile.xp > 1000 ? 'Maestro Químico' : profile.xp > 300 ? 'Explorador Molecular' : 'Aprendiz'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
