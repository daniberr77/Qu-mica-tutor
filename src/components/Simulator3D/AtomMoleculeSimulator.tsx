import React, { useState, useEffect, useId } from 'react';
import {
  Atom,
  FlaskConical,
  Plus,
  Minus,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Sparkles,
  Link2,
  Trash2,
  HelpCircle,
  Layers,
  Compass,
  Info,
  CheckCircle2,
  AlertTriangle,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AtomViewer3D } from './AtomViewer3D';
import { MoleculeViewer3D } from './MoleculeViewer3D';
import { PRESET_MOLECULES, CPK_ELEMENTS } from './moleculeData';
import type { MoleculeAtom, MoleculeBond, PresetMolecule } from './types';
import { periodicTableElements } from '../../data/periodicTable';

interface AtomMoleculeSimulatorProps {
  onAskTutor?: (question: string) => void;
  initialMode?: 'atom' | 'molecule';
}

export const AtomMoleculeSimulator: React.FC<AtomMoleculeSimulatorProps> = ({
  onAskTutor,
  initialMode = 'atom',
}) => {
  // Main Tab: 'atom' | 'molecule'
  const [mainMode, setMainMode] = useState<'atom' | 'molecule'>(initialMode);

  useEffect(() => {
    if (initialMode) {
      setMainMode(initialMode);
    }
  }, [initialMode]);

  // Shared 3D Camera & Dynamics States
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [cameraAction, setCameraAction] = useState<{
    type: 'rotate' | 'zoom' | 'reset';
    dx?: number;
    dy?: number;
    zoom?: number;
    id: number;
  } | null>(null);

  const triggerCamera = (action: { type: 'rotate' | 'zoom' | 'reset'; dx?: number; dy?: number; zoom?: number }) => {
    setCameraAction({ ...action, id: Date.now() });
  };

  // ==========================================
  // ATOM BUILDER STATE
  // ==========================================
  const [protons, setProtons] = useState<number>(6); // Default: Carbon
  const [neutrons, setNeutrons] = useState<number>(6);
  const [electrons, setElectrons] = useState<number>(6);

  // Find periodic table element for current protons
  const currentElement = periodicTableElements.find((el) => el.number === protons);
  const elementName = currentElement ? currentElement.name : protons > 0 ? `Elemento ${protons}` : 'Vacío';
  const elementSymbol = currentElement ? currentElement.symbol : protons > 0 ? `E${protons}` : '-';
  const massNumber = protons + neutrons;
  const netCharge = protons - electrons;

  // Nuclear stability heuristic:
  // For light elements (Z <= 20), stable if N/Z is ~1.0 (between 0.8 and 1.3)
  // For heavier elements (Z > 20), stable if N/Z is ~1.2 to 1.6
  const nToPRatio = protons > 0 ? neutrons / protons : 0;
  const isStable =
    protons === 1
      ? neutrons <= 2
      : protons <= 20
      ? nToPRatio >= 0.85 && nToPRatio <= 1.35
      : nToPRatio >= 1.15 && nToPRatio <= 1.65;

  // Shell occupation breakdown
  const shellK = Math.min(electrons, 2);
  const shellL = Math.min(Math.max(0, electrons - 2), 8);
  const shellM = Math.min(Math.max(0, electrons - 10), 18);
  const shellN = Math.min(Math.max(0, electrons - 28), 32);

  // Quick Atom Presets
  const setAtomPreset = (p: number, n: number, e: number) => {
    setProtons(p);
    setNeutrons(n);
    setElectrons(e);
  };

  const handleNeutralize = () => {
    setElectrons(protons);
  };

  const handleStabilizeNeutrons = () => {
    if (protons === 1) {
      setNeutrons(0);
      return;
    }
    if (currentElement) {
      const stableNeutrons = Math.round(currentElement.atomicMass) - protons;
      setNeutrons(Math.max(0, stableNeutrons));
    } else {
      setNeutrons(protons);
    }
  };

  // ==========================================
  // MOLECULE BUILDER STATE
  // ==========================================
  const [moleculeSubMode, setMoleculeSubMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('h2o');

  // Custom molecule building state
  const [customAtoms, setCustomAtoms] = useState<MoleculeAtom[]>([
    { id: 'ca1', element: 'O', name: 'Oxígeno', symbol: 'O', color: '#EF4444', radius: 0.68, position: [0, 0.35, 0], valency: 2 },
    { id: 'ca2', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [1.15, -0.45, 0], valency: 1 },
    { id: 'ca3', element: 'H', name: 'Hidrógeno', symbol: 'H', color: '#F8FAFC', radius: 0.42, position: [-1.15, -0.45, 0], valency: 1 },
  ]);
  const [customBonds, setCustomBonds] = useState<MoleculeBond[]>([
    { id: 'cb1', sourceId: 'ca1', targetId: 'ca2', order: 1, type: 'polar_covalent' },
    { id: 'cb2', sourceId: 'ca1', targetId: 'ca3', order: 1, type: 'polar_covalent' },
  ]);
  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null);
  const [secondAtomId, setSecondAtomId] = useState<string | null>(null);
  const [bondOrderToCreate, setBondOrderToCreate] = useState<1 | 2 | 3>(1);

  const activePreset = PRESET_MOLECULES.find((m) => m.id === selectedPresetId) || PRESET_MOLECULES[0];

  // Current active molecule representation
  const activeMoleculeAtoms = moleculeSubMode === 'preset' ? activePreset.atoms : customAtoms;
  const activeMoleculeBonds = moleculeSubMode === 'preset' ? activePreset.bonds : customBonds;

  // Add custom atom
  const handleAddCustomAtom = (symbol: string) => {
    const el = CPK_ELEMENTS[symbol];
    if (!el) return;

    // Distribute newly added atoms gently in a circular / offset pattern
    const count = customAtoms.length;
    const angle = (count * 1.3) % (Math.PI * 2);
    const radius = 1.6 + (count % 3) * 0.4;
    const posX = Math.cos(angle) * radius;
    const posY = Math.sin(angle) * radius * 0.7;
    const posZ = ((count % 5) - 2) * 0.4;

    const newAtom: MoleculeAtom = {
      id: `atom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      element: symbol,
      name: el.name,
      symbol: el.symbol,
      color: el.color,
      radius: el.radius,
      position: [posX, posY, posZ],
      valency: el.valency,
    };

    setCustomAtoms((prev) => [...prev, newAtom]);
    setSelectedAtomId(newAtom.id);
  };

  // Link selected atoms
  const handleLinkAtoms = () => {
    if (!selectedAtomId || !secondAtomId || selectedAtomId === secondAtomId) return;

    // Check if bond already exists
    const existing = customBonds.find(
      (b) =>
        (b.sourceId === selectedAtomId && b.targetId === secondAtomId) ||
        (b.sourceId === secondAtomId && b.targetId === selectedAtomId)
    );

    if (existing) {
      // Toggle or update bond order
      setCustomBonds((prev) =>
        prev.map((b) => (b.id === existing.id ? { ...b, order: bondOrderToCreate } : b))
      );
      return;
    }

    const srcAtom = customAtoms.find((a) => a.id === selectedAtomId);
    const tgtAtom = customAtoms.find((a) => a.id === secondAtomId);
    const isIonic = (srcAtom?.element === 'Na' && tgtAtom?.element === 'Cl') || (srcAtom?.element === 'Cl' && tgtAtom?.element === 'Na');

    const newBond: MoleculeBond = {
      id: `bond_${Date.now()}`,
      sourceId: selectedAtomId,
      targetId: secondAtomId,
      order: bondOrderToCreate,
      type: isIonic ? 'ionic' : 'covalent',
    };

    setCustomBonds((prev) => [...prev, newBond]);
  };

  // Remove selected atom
  const handleRemoveSelectedAtom = () => {
    if (!selectedAtomId) return;
    setCustomAtoms((prev) => prev.filter((a) => a.id !== selectedAtomId));
    setCustomBonds((prev) => prev.filter((b) => b.sourceId !== selectedAtomId && b.targetId !== selectedAtomId));
    setSelectedAtomId(null);
    setSecondAtomId(null);
  };

  // Clear custom molecule
  const handleClearCustomMolecule = () => {
    setCustomAtoms([]);
    setCustomBonds([]);
    setSelectedAtomId(null);
    setSecondAtomId(null);
  };

  // VSEPR Geometry Relaxation (spring simulation to spread bonded atoms naturally)
  const handleRelaxGeometry = () => {
    if (customAtoms.length < 2) return;

    const newPositions = customAtoms.map((a) => [...a.position] as [number, number, number]);

    // Simple relaxation iterations
    for (let iter = 0; iter < 40; iter++) {
      // 1. Bond attractive/distance constraint
      customBonds.forEach((bond) => {
        const i1 = customAtoms.findIndex((a) => a.id === bond.sourceId);
        const i2 = customAtoms.findIndex((a) => a.id === bond.targetId);
        if (i1 === -1 || i2 === -1) return;

        const p1 = newPositions[i1];
        const p2 = newPositions[i2];
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const dz = p2[2] - p1[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
        const targetDist = 1.45;
        const force = (dist - targetDist) * 0.12;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        const fz = (dz / dist) * force;

        p1[0] += fx;
        p1[1] += fy;
        p1[2] += fz;
        p2[0] -= fx;
        p2[1] -= fy;
        p2[2] -= fz;
      });

      // 2. Electrostatic / spatial repulsion between all atom pairs
      for (let i = 0; i < customAtoms.length; i++) {
        for (let j = i + 1; j < customAtoms.length; j++) {
          const p1 = newPositions[i];
          const p2 = newPositions[j];
          const dx = p2[0] - p1[0];
          const dy = p2[1] - p1[1];
          const dz = p2[2] - p1[2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
          if (dist < 2.8) {
            const repulse = ((2.8 - dist) / dist) * 0.08;
            p1[0] -= dx * repulse;
            p1[1] -= dy * repulse;
            p1[2] -= dz * repulse;
            p2[0] += dx * repulse;
            p2[1] += dy * repulse;
            p2[2] += dz * repulse;
          }
        }
      }
    }

    setCustomAtoms((prev) =>
      prev.map((atom, idx) => ({
        ...atom,
        position: newPositions[idx],
      }))
    );
  };

  // Compute empirical formula & mass for custom molecule
  const customElementCounts = customAtoms.reduce<Record<string, number>>((acc, atom) => {
    acc[atom.element] = (acc[atom.element] || 0) + 1;
    return acc;
  }, {});

  const customFormula = Object.entries(customElementCounts)
    .sort(([a], [b]) => {
      // Hill system: C first, then H, then alphabetical
      if (a === 'C') return -1;
      if (b === 'C') return 1;
      if (a === 'H') return -1;
      if (b === 'H') return 1;
      return a.localeCompare(b);
    })
    .map(([el, count]) => `${el}${count > 1 ? count : ''}`)
    .join('');

  const customMolarMass = customAtoms.reduce((acc, a) => {
    return acc + (CPK_ELEMENTS[a.element]?.mass || 0);
  }, 0);

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-800/40 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
                <Atom className="w-6 h-6 animate-spin text-slate-950" style={{ animationDuration: '18s' }} />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Simulador 3D de Átomos y Moléculas
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Three.js Interactivo
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Construye partículas subatómicas en tiempo real (protones, neutrones y electrones en capas de Bohr) o
              ensambla moléculas químicas tridimensionales con enlaces covalentes e iónicos.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 shadow-inner gap-1.5">
            <button
              onClick={() => setMainMode('atom')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mainMode === 'atom'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Atom className="w-4 h-4" />
              <span>Constructor Atómico</span>
            </button>
            <button
              onClick={() => setMainMode('molecule')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mainMode === 'molecule'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>Constructor de Moléculas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Viewport on Left, Dynamic Particle/Molecule Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Central Viewport & Camera Toolbar (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Central 3D Canvas Box */}
          <div className="relative">
            {mainMode === 'atom' ? (
              <AtomViewer3D
                protons={protons}
                neutrons={neutrons}
                electrons={electrons}
                showOrbits={showOrbits}
                showLabels={showLabels}
                simSpeed={simSpeed}
                isPaused={isPaused}
                autoRotate={autoRotate}
                cameraControlAction={cameraAction}
              />
            ) : (
              <MoleculeViewer3D
                atoms={activeMoleculeAtoms}
                bonds={activeMoleculeBonds}
                selectedAtomId={selectedAtomId}
                onSelectAtom={(id) => {
                  if (!selectedAtomId) {
                    setSelectedAtomId(id);
                  } else if (selectedAtomId === id) {
                    setSelectedAtomId(null);
                  } else {
                    setSecondAtomId(id);
                  }
                }}
                simSpeed={simSpeed}
                isPaused={isPaused}
                autoRotate={autoRotate}
                showLabels={showLabels}
                cameraControlAction={cameraAction}
              />
            )}
          </div>

          {/* Interactive Floating Camera & Simulation Controls Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-md flex items-center justify-between flex-wrap gap-2 text-xs">
            {/* Camera Directional Pad */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
                Cámara:
              </span>
              <button
                onClick={() => triggerCamera({ type: 'rotate', dx: -0.25 })}
                title="Girar Izquierda"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => triggerCamera({ type: 'rotate', dx: 0.25 })}
                title="Girar Derecha"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => triggerCamera({ type: 'rotate', dy: -0.2 })}
                title="Inclinar Arriba"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => triggerCamera({ type: 'rotate', dy: 0.2 })}
                title="Inclinar Abajo"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => triggerCamera({ type: 'zoom', zoom: 1 })}
                title="Acercar (Zoom In)"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => triggerCamera({ type: 'zoom', zoom: -1 })}
                title="Alejar (Zoom Out)"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => triggerCamera({ type: 'reset' })}
                title="Centrar y Resetear Vista"
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            {/* Animation & Display Controls */}
            <div className="flex items-center gap-1.5">
              {/* Auto rotate toggle */}
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  autoRotate
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
                title="Rotación orbital continua automática"
              >
                <Compass className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                <span>Auto-giro</span>
              </button>

              {/* Pause / Play */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`p-1.5 rounded-lg font-medium transition-all ${
                  isPaused
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
                title={isPaused ? 'Reanudar dinámica' : 'Pausar dinámica'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              {/* Sim Speed */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                {[0.5, 1.0, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSimSpeed(s)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      simSpeed === s
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Toggle Orbits / Labels */}
              <button
                onClick={() => (mainMode === 'atom' ? setShowOrbits(!showOrbits) : setShowLabels(!showLabels))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  (mainMode === 'atom' ? showOrbits : showLabels)
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {mainMode === 'atom' ? (showOrbits ? 'Órbitas ON' : 'Órbitas OFF') : (showLabels ? 'Etiquetas ON' : 'Etiquetas OFF')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Particle Controls / Molecule Controls & Data (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {mainMode === 'atom' ? (
            /* ============================================================== */
            /* ATOM BUILDER CONTROLS                                          */
            /* ============================================================== */
            <div className="space-y-4">
              {/* Element Card Status */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex flex-col items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                      <span className="text-[10px] font-mono leading-none opacity-80">{massNumber}</span>
                      <span className="text-xl font-black leading-none">{elementSymbol}</span>
                      <span className="text-[9px] font-mono leading-none opacity-80">{protons}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        {elementName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {currentElement?.category ? `Categoría: ${currentElement.category}` : 'Átomo configurable'}
                      </p>
                    </div>
                  </div>

                  {/* Net charge badge */}
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        netCharge === 0
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : netCharge > 0
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300'
                      }`}
                    >
                      {netCharge === 0 ? 'Neutro (0)' : netCharge > 0 ? `Catión (+${netCharge})` : `Anión (${netCharge})`}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      Masa: {massNumber} u
                    </div>
                  </div>
                </div>

                {/* Nuclear Stability Alert */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {isStable ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Núcleo Estable
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          Isótopo Inestable (Radiactivo)
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Relación N/P: {nToPRatio.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Particle Adder Controls */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Control de Partículas Subatómicas</span>
                </h4>

                {/* Protons Control */}
                <div className="flex items-center justify-between bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
                    <div>
                      <div className="text-xs font-bold text-red-900 dark:text-red-300">
                        Protones (p⁺)
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Núcleo • Carga +1
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProtons(Math.max(1, protons - 1))}
                      disabled={protons <= 1}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 disabled:opacity-40 transition-all shadow-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-base text-red-600 dark:text-red-400">
                      {protons}
                    </span>
                    <button
                      onClick={() => setProtons(Math.min(92, protons + 1))}
                      disabled={protons >= 92}
                      className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-40 transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Neutrons Control */}
                <div className="flex items-center justify-between bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50"></span>
                    <div>
                      <div className="text-xs font-bold text-sky-900 dark:text-sky-300">
                        Neutrones (n⁰)
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Núcleo • Carga 0
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setNeutrons(Math.max(0, neutrons - 1))}
                      disabled={neutrons <= 0}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 disabled:opacity-40 transition-all shadow-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-base text-sky-600 dark:text-sky-400">
                      {neutrons}
                    </span>
                    <button
                      onClick={() => setNeutrons(Math.min(146, neutrons + 1))}
                      disabled={neutrons >= 146}
                      className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center hover:bg-sky-700 disabled:opacity-40 transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Electrons Control */}
                <div className="flex items-center justify-between bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/40 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
                    <div>
                      <div className="text-xs font-bold text-cyan-900 dark:text-cyan-300">
                        Electrones (e⁻)
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Órbitas / Capas • Carga -1
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setElectrons(Math.max(0, electrons - 1))}
                      disabled={electrons <= 0}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 disabled:opacity-40 transition-all shadow-xs"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-base text-cyan-600 dark:text-cyan-400">
                      {electrons}
                    </span>
                    <button
                      onClick={() => setElectrons(Math.min(60, electrons + 1))}
                      disabled={electrons >= 60}
                      className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center hover:bg-cyan-700 disabled:opacity-40 transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons: Neutral, Stable, Reset */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleNeutralize}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Átomo Neutro (e⁻ = p⁺)</span>
                  </button>
                  <button
                    onClick={handleStabilizeNeutrons}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ajustar n⁰ Estable</span>
                  </button>
                </div>
              </div>

              {/* Electron Shells (Bohr Distribution) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Configuración en Capas de Bohr</span>
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                    <span className="font-mono font-bold text-slate-400 block text-[10px]">Capa K (n=1)</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {shellK}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/ 2 máx</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                    <span className="font-mono font-bold text-slate-400 block text-[10px]">Capa L (n=2)</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {shellL}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/ 8 máx</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                    <span className="font-mono font-bold text-slate-400 block text-[10px]">Capa M (n=3)</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {shellM}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/ 18 máx</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                    <span className="font-mono font-bold text-slate-400 block text-[10px]">Capa N (n=4)</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {shellN}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/ 32 máx</span>
                  </div>
                </div>
              </div>

              {/* Quick Element Presets */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Elementos Rápidos Predefinidos
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '¹H Hidrógeno', p: 1, n: 0, e: 1 },
                    { label: '⁴He Helio', p: 2, n: 2, e: 2 },
                    { label: '⁷Li Litio', p: 3, n: 4, e: 3 },
                    { label: '¹²C Carbono', p: 6, n: 6, e: 6 },
                    { label: '¹⁴N Nitrógeno', p: 7, n: 7, e: 7 },
                    { label: '¹⁶O Oxígeno', p: 8, n: 8, e: 8 },
                    { label: '²⁰Ne Neón', p: 10, n: 10, e: 10 },
                    { label: '²³Na Sodio', p: 11, n: 12, e: 11 },
                    { label: '³⁵Cl Cloro', p: 17, n: 18, e: 17 },
                    { label: '⁵⁶Fe Hierro', p: 26, n: 30, e: 26 },
                  ].map((elem) => (
                    <button
                      key={elem.label}
                      onClick={() => setAtomPreset(elem.p, elem.n, elem.e)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        protons === elem.p && neutrons === elem.n && electrons === elem.e
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {elem.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ask Tutor Integration */}
              {onAskTutor && (
                <button
                  onClick={() =>
                    onAskTutor(
                      `Explícame la estructura atómica y configuración electrónica del elemento ${elementName} (Z=${protons}, Masa=${massNumber}, Carga=${netCharge}).`
                    )
                  }
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs sm:text-sm shadow-md hover:from-emerald-500 hover:to-teal-500 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Preguntar a QuimiBot sobre el {elementName}</span>
                </button>
              )}
            </div>
          ) : (
            /* ============================================================== */
            /* MOLECULE BUILDER CONTROLS                                      */
            /* ============================================================== */
            <div className="space-y-4">
              {/* Molecule Submode Switcher: Preset vs Custom */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setMoleculeSubMode('preset')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    moleculeSubMode === 'preset'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Moléculas de Referencia (Presets)
                </button>
                <button
                  onClick={() => setMoleculeSubMode('custom')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    moleculeSubMode === 'custom'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Constructor Libre (Unir Átomos)
                </button>
              </div>

              {moleculeSubMode === 'preset' ? (
                <>
                  {/* Preset Molecule Selector Grid */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                      Selecciona una Molécula Química
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_MOLECULES.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedPresetId(m.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            selectedPresetId === m.id
                              ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-200 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-mono font-bold text-sm block">{m.formula}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                            {m.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Preset Molecule Info Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {activePreset.name}
                          </h3>
                          <span className="font-mono text-sm px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold">
                            {activePreset.formula}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {activePreset.category === 'inorganic'
                            ? 'Compuesto Inorgánico'
                            : activePreset.category === 'organic'
                            ? 'Compuesto Orgánico'
                            : 'Compuesto Iónico'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {activePreset.polarity}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1 font-mono">
                          {activePreset.molarMass} g/mol
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {activePreset.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                        <span className="text-slate-400 block text-[10px]">Geometría Molecular</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {activePreset.geometry}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                        <span className="text-slate-400 block text-[10px]">Ángulo de Enlace</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">
                          {activePreset.bondAngle}
                        </span>
                      </div>
                    </div>

                    {/* Ask Tutor Integration */}
                    {onAskTutor && (
                      <button
                        onClick={() =>
                          onAskTutor(
                            `Explícame la geometría molecular, hibridación y polaridad de la molécula de ${activePreset.name} (${activePreset.formula}).`
                          )
                        }
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold text-xs shadow-md hover:from-teal-500 hover:to-cyan-500 flex items-center justify-center gap-2 transition-all mt-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Preguntar a QuimiBot sobre {activePreset.name}</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* Custom Molecule Builder Controls */
                <div className="space-y-4">
                  {/* Atom Palette */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Añadir Átomos al Espacio 3D</span>
                      <span className="text-[10px] text-slate-400 normal-case font-normal">
                        Haz clic para agregar
                      </span>
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {Object.entries(CPK_ELEMENTS).map(([sym, data]) => (
                        <button
                          key={sym}
                          onClick={() => handleAddCustomAtom(sym)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-800 hover:border-teal-500 hover:scale-105 active:scale-95 transition-all text-xs font-bold text-slate-800 dark:text-slate-200"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: data.color }}
                          />
                          <span>{sym}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({data.name})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Linking / Bond Controls */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-teal-500" />
                      <span>Unir Átomos (Crear Enlace Químico)</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block">Átomo 1 Seleccionado:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedAtomId
                            ? customAtoms.find((a) => a.id === selectedAtomId)?.name || 'Seleccionado'
                            : 'Ninguno (haz clic en 3D)'}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block">Átomo 2 Seleccionado:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {secondAtomId
                            ? customAtoms.find((a) => a.id === secondAtomId)?.name || 'Seleccionado'
                            : 'Ninguno (haz clic en 3D)'}
                        </span>
                      </div>
                    </div>

                    {/* Order Selection */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Tipo de enlace:</span>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {[
                          { order: 1, label: 'Simple (—)' },
                          { order: 2, label: 'Doble (=)' },
                          { order: 3, label: 'Triple (≡)' },
                        ].map((b) => (
                          <button
                            key={b.order}
                            onClick={() => setBondOrderToCreate(b.order as 1 | 2 | 3)}
                            className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                              bondOrderToCreate === b.order
                                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                                : 'text-slate-500'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Link button & actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={handleLinkAtoms}
                        disabled={!selectedAtomId || !secondAtomId || selectedAtomId === secondAtomId}
                        className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Enlazar (Unir)</span>
                      </button>

                      <button
                        onClick={handleRelaxGeometry}
                        disabled={customAtoms.length < 2}
                        className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Optimizar VSEPR</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={handleRemoveSelectedAtom}
                        disabled={!selectedAtomId}
                        className="text-xs text-rose-500 hover:text-rose-600 disabled:opacity-30 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Eliminar seleccionado</span>
                      </button>

                      <button
                        onClick={handleClearCustomMolecule}
                        disabled={customAtoms.length === 0}
                        className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 transition-colors"
                      >
                        Limpiar lienzo
                      </button>
                    </div>
                  </div>

                  {/* Custom Molecule Live Metrics */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        Fórmula Generada:
                      </span>
                      <span className="font-mono font-bold text-base text-teal-600 dark:text-teal-400">
                        {customFormula || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        Masa Molar Estimada:
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {customMolarMass.toFixed(3)} g/mol
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        Total Átomos / Enlaces:
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {customAtoms.length} átomos • {customBonds.length} enlaces
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
