import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Zap,
  Flame,
  Sparkles,
  Layers,
  Eye,
  Info,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Activity,
  CheckCircle2,
  Atom,
  HelpCircle,
  MessageSquare,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';
import { REACTIONS_DATA, ELEMENTS_MAP } from '../../data/reactions3dData';
import { ReactionDefinition, ReactionCategory, Atom3D } from '../../types/reactions3d';
import { ReactionCanvas3D } from './ReactionCanvas3D';
import { EnergyProfileChart } from './EnergyProfileChart';

interface ReactionLab3DProps {
  onAskTutor?: (question: string) => void;
}

export const ReactionLab3D: React.FC<ReactionLab3DProps> = ({ onAskTutor }) => {
  // 1. REACTION SELECTION STATE
  const [selectedReactionId, setSelectedReactionId] = useState<string>('sintesis-agua');
  const currentReaction =
    REACTIONS_DATA.find((r) => r.id === selectedReactionId) || REACTIONS_DATA[0];

  // 2. PLAYBACK & ANIMATION STATE
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0.0); // 0.0 to 1.0
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // 0.25x to 2x
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // 3. 3D VIEW & INSPECTION STATE
  const [cameraPreset, setCameraPreset] = useState<'perspective' | 'front' | 'top'>('perspective');
  const [selectedAtom, setSelectedAtom] = useState<Atom3D | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Reference for requestAnimationFrame
  const animationReqRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Total nominal duration of one cycle in milliseconds at 1x speed (e.g. 7.5 seconds)
  const NOMINAL_DURATION = 7500;

  // ANIMATION LOOP
  const updateAnimation = useCallback(
    (currentTime: number) => {
      if (lastTimeRef.current !== null) {
        const delta = currentTime - lastTimeRef.current;
        const deltaProgress = (delta / NOMINAL_DURATION) * playbackSpeed;

        setProgress((prev) => {
          let next = prev + deltaProgress;
          if (next >= 1.0) {
            if (isLooping) {
              next = 0.0;
            } else {
              next = 1.0;
              setIsPlaying(false);
            }
          }
          return next;
        });
      }
      lastTimeRef.current = currentTime;
      if (isPlaying) {
        animationReqRef.current = requestAnimationFrame(updateAnimation);
      }
    },
    [isPlaying, playbackSpeed, isLooping]
  );

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      animationReqRef.current = requestAnimationFrame(updateAnimation);
    } else {
      if (animationReqRef.current) {
        cancelAnimationFrame(animationReqRef.current);
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (animationReqRef.current) {
        cancelAnimationFrame(animationReqRef.current);
      }
    };
  }, [isPlaying, updateAnimation]);

  // Handle Play / Pause
  const handleTogglePlay = () => {
    if (progress >= 1.0) {
      setProgress(0.0);
    }
    setIsPlaying((prev) => !prev);
  };

  // Handle Reset
  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0.0);
    setSelectedAtom(null);
  };

  // Step Forward / Step Backward
  const handleStep = (stepSize: number) => {
    setIsPlaying(false);
    setProgress((prev) => Math.max(0, Math.min(1, prev + stepSize)));
  };

  // When changing reaction, reset timeline
  const handleSelectReaction = (reactionId: string) => {
    setSelectedReactionId(reactionId);
    setProgress(0.0);
    setIsPlaying(false);
    setSelectedAtom(null);
  };

  // Determine current active phase
  const currentPhaseIndex =
    progress < 0.35 ? 0 : progress < 0.55 ? 1 : progress < 0.75 ? 2 : 3;
  const currentPhase = currentReaction.phases[currentPhaseIndex];

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  // Category Icon & Badge
  const getCategoryIcon = (category: ReactionCategory) => {
    switch (category) {
      case 'sintesis':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'descomposicion':
        return <Activity className="w-4 h-4 text-amber-400" />;
      case 'sustitucion_simple':
        return <Sparkles className="w-4 h-4 text-sky-400" />;
      case 'sustitucion_doble':
        return <Atom className="w-4 h-4 text-indigo-400" />;
      case 'neutralizacion':
        return <CheckCircle2 className="w-4 h-4 text-teal-400" />;
      case 'combustion':
        return <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'redox':
        return <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />;
      default:
        return <Atom className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-6 w-full ${
        isFullscreen ? 'p-6 bg-slate-950 overflow-y-auto min-h-screen' : ''
      }`}
    >
      {/* 1. MAIN HEADER & LAB INTRO */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 border border-slate-700/80 shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-xs">
                <Atom className="w-3.5 h-3.5 animate-spin" />
                Laboratorio Virtual 3D
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Cinética Molecular & Termodinámica
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Laboratorio 3D de Reacciones Químicas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Explora en tiempo real la colisión molecular, la ruptura de enlaces en el complejo activado y la síntesis de nuevas moléculas con física abstracta de alta fidelidad.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {onAskTutor && (
              <button
                onClick={() => onAskTutor(currentReaction.promptForTutor)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                title="Consultar a QuimiBot sobre esta reacción"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Preguntar a QuimiBot</span>
              </button>
            )}
            <button
              onClick={handleToggleFullscreen}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. REACTION TYPE SELECTOR PILLS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Seleccionar Tipo de Reacción Química ({REACTIONS_DATA.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Haz clic para cargar el modelo 3D
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {REACTIONS_DATA.map((rxn) => {
            const isSelected = rxn.id === selectedReactionId;
            return (
              <button
                key={rxn.id}
                onClick={() => handleSelectReaction(rxn.id)}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 w-full mb-1">
                  {getCategoryIcon(rxn.category)}
                  <span className={`text-[10px] font-bold uppercase truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {rxn.category.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs font-bold line-clamp-1">{rxn.title}</span>
                <span className={`text-[10px] font-mono mt-0.5 truncate w-full ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                  {rxn.equation}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: 3D VIEWPORT + REAL-TIME CONTROL CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER: 3D CANVAS & PLAYBACK CONTROLS (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Reaction Header Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                {getCategoryIcon(currentReaction.category)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {currentReaction.categoryLabel}
                  </span>
                  <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {currentReaction.title}
                  </span>
                </div>
                <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-slate-900 dark:text-white mt-0.5">
                  {currentReaction.equation}
                </div>
              </div>
            </div>

            {/* Camera View Selector Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <button
                onClick={() => setCameraPreset('perspective')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  cameraPreset === 'perspective'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Perspectiva
              </button>
              <button
                onClick={() => setCameraPreset('front')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  cameraPreset === 'front'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Frontal
              </button>
              <button
                onClick={() => setCameraPreset('top')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  cameraPreset === 'top'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Superior
              </button>
            </div>
          </div>

          {/* 3D WebGL Canvas Container */}
          <div className="relative w-full h-[420px] sm:h-[480px] rounded-2xl overflow-hidden shadow-lg border border-slate-800">
            <ReactionCanvas3D
              reaction={currentReaction}
              progress={progress}
              onAtomSelect={(atom) => setSelectedAtom(atom)}
              selectedAtomId={selectedAtom?.id}
              cameraPreset={cameraPreset}
              onResetCameraPreset={() => {}}
            />

            {/* Current Phase HUD Overlay (Top-Right) */}
            <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5 pointer-events-none">
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-extrabold uppercase tracking-wide text-white">
                  Fase {currentPhase.phase}: {currentPhase.name}
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  {Math.round(progress * 100)}%
                </span>
              </div>
              <div className="bg-slate-900/80 backdrop-blur-xs border border-slate-800 px-3 py-1 rounded-lg max-w-xs text-right">
                <p className="text-[11px] text-slate-300 font-medium">{currentPhase.description}</p>
              </div>
            </div>

            {/* Selected Atom Overlay (Bottom-Right) */}
            {selectedAtom && (
              <div className="absolute bottom-3 right-3 z-10 bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 p-3 rounded-2xl text-white shadow-2xl max-w-xs animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/40"
                      style={{
                        backgroundColor:
                          selectedAtom.color || ELEMENTS_MAP[selectedAtom.element]?.color || '#FFF',
                      }}
                    />
                    <span className="font-bold text-xs text-white">
                      {selectedAtom.label} ({ELEMENTS_MAP[selectedAtom.element]?.name})
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedAtom(null)}
                    className="text-slate-400 hover:text-white text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-[11px] space-y-1 text-slate-300">
                  <div>
                    <span className="text-slate-400">Número Atómico:</span>{' '}
                    <span className="font-semibold">{ELEMENTS_MAP[selectedAtom.element]?.atomicNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Masa Atómica:</span>{' '}
                    <span className="font-semibold">{ELEMENTS_MAP[selectedAtom.element]?.atomicMass} g/mol</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Rol:</span>{' '}
                    <span className="font-semibold text-emerald-400">{selectedAtom.role}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    Transformación: {selectedAtom.initialMolecule} ➔ {selectedAtom.finalMolecule}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PLAYBACK CONTROLS BAR */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            {/* Timeline Slider with 4 Phase Markers */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Línea de Tiempo de la Reacción
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {Math.round(progress * 100)}% ({((progress * NOMINAL_DURATION) / 1000).toFixed(1)}s /{' '}
                  {(NOMINAL_DURATION / 1000).toFixed(1)}s)
                </span>
              </div>

              {/* Range Input */}
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.005"
                  value={progress}
                  onChange={(e) => {
                    setProgress(parseFloat(e.target.value));
                    setIsPlaying(false);
                  }}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 transition-all"
                />
              </div>

              {/* Phase visual tags under slider */}
              <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center mt-1">
                <span className={`p-1 rounded ${currentPhaseIndex === 0 ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold' : ''}`}>
                  1. Reactivos (0-35%)
                </span>
                <span className={`p-1 rounded ${currentPhaseIndex === 1 ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold' : ''}`}>
                  2. Choque & Ea (35-55%)
                </span>
                <span className={`p-1 rounded ${currentPhaseIndex === 2 ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold' : ''}`}>
                  3. Ruptura (55-75%)
                </span>
                <span className={`p-1 rounded ${currentPhaseIndex === 3 ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-bold' : ''}`}>
                  4. Productos (75-100%)
                </span>
              </div>
            </div>

            {/* Play / Pause / Reset / Speed Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Playback Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePlay}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-all transform active:scale-95 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Iniciar</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                  title="Reiniciar animación (0%)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleStep(-0.05)}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                  title="Retroceder 5%"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleStep(0.05)}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
                  title="Avanzar 5%"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isLooping
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
                  }`}
                  title="Repetir en bucle continuo"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLooping ? 'animate-spin' : ''}`} />
                  <span>Bucle</span>
                </button>
              </div>

              {/* SPEED CONTROLLER */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold mr-1">
                  <Gauge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Velocidad:</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  {[0.25, 0.5, 1.0, 1.5, 2.0].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: CHEMICAL PEDAGOGICAL DASHBOARD (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Energy Profile Diagram */}
          <EnergyProfileChart reaction={currentReaction} progress={progress} />

          {/* Current Event Didactic Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Evento Químico Actual (Fase {currentPhase.phase})
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-3">
              <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {currentPhase.name}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentPhase.chemicalEvent}
              </p>
            </div>

            {/* Bonds Broken vs Formed Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="font-bold text-rose-500 flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Enlaces que se Rompen:
                </span>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 pl-1 space-y-0.5">
                  {currentReaction.bondsBroken.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Enlaces Nuevos que se Forman:
                </span>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 pl-1 space-y-0.5">
                  {currentReaction.bondsFormed.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Conservation of Mass / Atom Balance */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Atom className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Ley de Conservación de la Masa
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Lavoisier
              </span>
            </div>

            <div className="space-y-2">
              {currentReaction.conservationOfMass.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {item.element}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-500">{item.reactantCount} reactivos</span>
                    <span className="text-emerald-500 font-bold">═</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {item.productCount} productos
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 italic">
              "La materia ni se crea ni se destruye, solo se transforma mediante el reordenamiento de enlaces."
            </p>
          </div>

          {/* Socratic Question / AI Prompt */}
          {onAskTutor && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  ¿Quieres profundizar?
                </span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-200/90 mb-3">
                Consulta a QuimiBot para entender cómo influye la energía de activación, los catalizadores y los cálculos estequiométricos de esta reacción.
              </p>
              <button
                onClick={() => onAskTutor(currentReaction.promptForTutor)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Consultar mecanismo en QuimiBot</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
