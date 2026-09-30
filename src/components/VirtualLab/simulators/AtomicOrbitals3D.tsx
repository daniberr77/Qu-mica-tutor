import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Atom,
  Sparkles,
  Info,
  Zap,
} from 'lucide-react';

interface ElementAtom {
  symbol: string;
  name: string;
  z: number;
  protons: number;
  neutrons: number;
  electrons: number;
  config: string;
  shells: number[]; // electrons per shell [n=1, n=2, n=3]
  description: string;
}

const ATOMIC_ELEMENTS: ElementAtom[] = [
  {
    symbol: 'H',
    name: 'Hidrógeno',
    z: 1,
    protons: 1,
    neutrons: 0,
    electrons: 1,
    config: '1s¹',
    shells: [1],
    description: 'El elemento más simple del universo. Un solo protón central rodeado por 1 electrón en el orbital 1s esférico.',
  },
  {
    symbol: 'He',
    name: 'Helio',
    z: 2,
    protons: 2,
    neutrons: 2,
    electrons: 2,
    config: '1s²',
    shells: [2],
    description: 'Gas noble con su primera capa electrónica completamente saturada con 2 electrones de espines opuestos (+1/2, -1/2).',
  },
  {
    symbol: 'Li',
    name: 'Litio',
    z: 3,
    protons: 3,
    neutrons: 4,
    electrons: 3,
    config: '1s² 2s¹',
    shells: [2, 1],
    description: 'Metal alcalino. Posee 1 electrón de valencia en la capa n=2 (orbital 2s) que cede fácilmente para formar el catión Li⁺.',
  },
  {
    symbol: 'C',
    name: 'Carbono',
    z: 6,
    protons: 6,
    neutrons: 6,
    electrons: 6,
    config: '1s² 2s² 2p²',
    shells: [2, 4],
    description: 'Pilar de la química orgánica con 4 electrones de valencia capaces de formar enlaces covalentes simples, dobles y triples.',
  },
  {
    symbol: 'O',
    name: 'Oxígeno',
    z: 8,
    protons: 8,
    neutrons: 8,
    electrons: 8,
    config: '1s² 2s² 2p⁴',
    shells: [2, 6],
    description: 'Elemento altamente electronegativo (3.44 de Pauling) que busca completar su octeto admitiendo 2 electrones.',
  },
  {
    symbol: 'Na',
    name: 'Sodio',
    z: 11,
    protons: 11,
    neutrons: 12,
    electrons: 11,
    config: '[Ne] 3s¹',
    shells: [2, 8, 1],
    description: 'Posee 3 capas de energía cuántica. Su electrón solitario en el orbital 3s le confiere una reactividad metálica vigorosa.',
  },
];

export const AtomicOrbitals3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('C');
  const [viewMode, setViewMode] = useState<'bohr' | 'orbitals'>('bohr');
  const [activeOrbitalShape, setActiveOrbitalShape] = useState<'s' | 'px' | 'py' | 'pz' | 'd'>('s');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(6.5);
  const [quantumJump, setQuantumJump] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const electronsGroupRef = useRef<THREE.Object3D[]>([]);

  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeElement = ATOMIC_ELEMENTS.find((el) => el.symbol === selectedSymbol) || ATOMIC_ELEMENTS[3];

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = zoomLevel;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Ambient and Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xa855f7, 2.5, 20);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    groupRef.current = rootGroup;

    let time = 0;

    // Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      time += 0.02;

      if (rootGroup && isRotating && !isDraggingRef.current) {
        rootGroup.rotation.y += 0.005;
      }

      // Animate orbiting electrons along their respective shell paths
      electronsGroupRef.current.forEach((elMesh, idx) => {
        const speed = (idx % 2 === 0 ? 1 : -1) * (1.2 + (idx % 3) * 0.4);
        const radius = Number(elMesh.userData.radius || 1.5);
        const tiltX = Number(elMesh.userData.tiltX || 0);
        const tiltZ = Number(elMesh.userData.tiltZ || 0);

        const currentAngle = time * speed + idx * (Math.PI / 2);
        const x = Math.cos(currentAngle) * radius;
        const y = Math.sin(currentAngle) * radius * Math.cos(tiltX);
        const z = Math.sin(currentAngle) * radius * Math.sin(tiltZ);

        elMesh.position.set(x, y, z);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = zoomLevel;
    }
  }, [zoomLevel]);

  // Build Nucleus, Orbits and Quantum Orbitals
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Clean up
    while (group.children.length > 0) {
      const child = group.children[0] as any;
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose());
        else child.material.dispose();
      }
      group.remove(child);
    }
    electronsGroupRef.current = [];

    if (viewMode === 'bohr') {
      // 1. Build Dense Nucleus (Protons + Neutrons)
      const nucleusGroup = new THREE.Group();
      const totalParticles = activeElement.protons + activeElement.neutrons;
      const pCount = activeElement.protons;

      for (let i = 0; i < totalParticles; i++) {
        const isProton = i < pCount;
        const pGeo = new THREE.SphereGeometry(0.18, 16, 16);
        const pMat = new THREE.MeshStandardMaterial({
          color: isProton ? 0xef4444 : 0x3b82f6, // Red protons, blue neutrons
          roughness: 0.3,
          metalness: 0.2,
        });

        const particle = new THREE.Mesh(pGeo, pMat);
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random()) * 0.45;
        const sinPhi = Math.sin(phi);

        particle.position.set(
          r * sinPhi * Math.cos(theta),
          r * sinPhi * Math.sin(theta),
          r * Math.cos(phi)
        );
        nucleusGroup.add(particle);
      }
      group.add(nucleusGroup);

      // 2. Build Energy Shells & Orbiting Electrons
      activeElement.shells.forEach((electronCount, shellIndex) => {
        const shellRadius = 1.3 + shellIndex * 1.0;

        // Torus Ring representing orbit trajectory
        const ringGeo = new THREE.TorusGeometry(shellRadius, 0.015, 8, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x475569,
          transparent: true,
          opacity: 0.5,
        });

        // Add 2 tilted rings per shell for 3D realism
        const ring1 = new THREE.Mesh(ringGeo, ringMat);
        ring1.rotation.x = Math.PI / 2 + shellIndex * 0.25;
        group.add(ring1);

        const ring2 = new THREE.Mesh(ringGeo, ringMat);
        ring2.rotation.y = Math.PI / 3 + shellIndex * 0.35;
        group.add(ring2);

        // Create electrons for this shell
        for (let e = 0; e < electronCount; e++) {
          const elGeo = new THREE.SphereGeometry(0.12, 16, 16);
          const elMat = new THREE.MeshStandardMaterial({
            color: 0x22d3ee,
            emissive: 0x06b6d4,
            emissiveIntensity: 0.8,
            roughness: 0.1,
          });

          const electronMesh = new THREE.Mesh(elGeo, elMat);
          electronMesh.userData = {
            radius: shellRadius,
            tiltX: (shellIndex * 0.4) + (e * 0.3),
            tiltZ: (shellIndex * 0.5) + (e * 0.4),
          };

          group.add(electronMesh);
          (electronsGroupRef.current as any[]).push(electronMesh);
        }
      });
    } else {
      // 3. Mode: Quantum Probability Clouds (Orbital Shapes: s, px, py, pz, d)
      // Small core
      const coreGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
      group.add(new THREE.Mesh(coreGeo, coreMat));

      if (activeOrbitalShape === 's') {
        // Spherical cloud
        const sGeo = new THREE.SphereGeometry(1.6, 32, 32);
        const sMat = new THREE.MeshStandardMaterial({
          color: 0x8b5cf6,
          transparent: true,
          opacity: 0.4,
          roughness: 0.2,
          wireframe: false,
        });
        group.add(new THREE.Mesh(sGeo, sMat));
      } else if (activeOrbitalShape === 'px' || activeOrbitalShape === 'py' || activeOrbitalShape === 'pz') {
        // Dumbbell shape (2 lobes)
        const lobeGeo = new THREE.SphereGeometry(0.9, 32, 32);
        lobeGeo.scale(1.8, 1, 1);

        const lobeMat1 = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.5,
          roughness: 0.3,
        });
        const lobeMat2 = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0.5,
          roughness: 0.3,
        });

        const lobe1 = new THREE.Mesh(lobeGeo, lobeMat1);
        const lobe2 = new THREE.Mesh(lobeGeo, lobeMat2);

        lobe1.position.set(1.0, 0, 0);
        lobe2.position.set(-1.0, 0, 0);

        const pGroup = new THREE.Group();
        pGroup.add(lobe1);
        pGroup.add(lobe2);

        if (activeOrbitalShape === 'py') {
          pGroup.rotation.z = Math.PI / 2;
        } else if (activeOrbitalShape === 'pz') {
          pGroup.rotation.y = Math.PI / 2;
        }

        group.add(pGroup);
      } else if (activeOrbitalShape === 'd') {
        // 4-lobed cloverleaf orbital
        const dLobeGeo = new THREE.SphereGeometry(0.75, 24, 24);
        dLobeGeo.scale(1.6, 0.7, 0.7);

        const dMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.5,
          roughness: 0.2,
        });

        [
          { rot: Math.PI / 4, pos: [0.9, 0.9, 0] },
          { rot: -Math.PI / 4, pos: [-0.9, 0.9, 0] },
          { rot: Math.PI / 4, pos: [-0.9, -0.9, 0] },
          { rot: -Math.PI / 4, pos: [0.9, -0.9, 0] },
        ].forEach((cfg) => {
          const m = new THREE.Mesh(dLobeGeo, dMat);
          m.position.set(cfg.pos[0] * 0.7, cfg.pos[1] * 0.7, 0);
          m.rotation.z = cfg.rot;
          group.add(m);
        });
      }
    }
  }, [activeElement, viewMode, activeOrbitalShape]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !groupRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    groupRef.current.rotation.y += deltaX * 0.01;
    groupRef.current.rotation.x += deltaY * 0.01;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const triggerQuantumTransition = (type: 'excite' | 'emit') => {
    setQuantumJump(
      type === 'excite'
        ? '¡Absorción Cuántica! Electrón promovido: n=1 → n=2 (ΔE = +h·ν)'
        : '¡Emisión de Fotón! Relajación n=2 → n=1 (Fotón UV emitido: E = h·c/λ)'
    );
    setTimeout(() => setQuantumJump(null), 3500);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* 3D Viewport */}
      <div className="flex-1 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col relative min-h-[480px]">
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Átomo de {activeElement.name} ({activeElement.symbol})
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Z = {activeElement.z}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl text-xs font-semibold text-slate-300">
              <button
                onClick={() => setViewMode('bohr')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  viewMode === 'bohr' ? 'bg-purple-600 text-white shadow-xs' : 'hover:text-white'
                }`}
              >
                Órbitas Bohr
              </button>
              <button
                onClick={() => setViewMode('orbitals')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  viewMode === 'orbitals' ? 'bg-purple-600 text-white shadow-xs' : 'hover:text-white'
                }`}
              >
                Nube de Orbitales
              </button>
            </div>

            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                isRotating
                  ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Quantum Jump Banner Notification */}
        {quantumJump && (
          <div className="absolute top-16 left-4 right-4 z-20 p-3 rounded-2xl bg-cyan-950/90 border border-cyan-500/60 text-cyan-200 text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
              <span>{quantumJump}</span>
            </div>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
        )}

        {/* 3D Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => (isDraggingRef.current = false)}
          onMouseLeave={() => (isDraggingRef.current = false)}
          className="flex-1 w-full h-[400px] cursor-grab active:cursor-grabbing select-none relative"
        />

        {/* Bottom Interactive Bar */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Interactúa:</span>
            <span>Gira en 3D para inspeccionar la simetría de las nubes de probabilidad.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerQuantumTransition('excite')}
              className="px-2.5 py-1 rounded-lg bg-indigo-900/70 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 text-[11px] font-bold transition flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>Excitar (ΔE)</span>
            </button>
            <button
              onClick={() => triggerQuantumTransition('emit')}
              className="px-2.5 py-1 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-[11px] font-bold transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Emitir Fotón</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Element Selector */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Atom className="w-3.5 h-3.5 text-purple-500" />
            <span>Seleccionar Elemento</span>
          </h4>

          <div className="grid grid-cols-3 gap-2">
            {ATOMIC_ELEMENTS.map((el) => (
              <button
                key={el.symbol}
                onClick={() => setSelectedSymbol(el.symbol)}
                className={`p-2 rounded-2xl text-center border transition flex flex-col items-center ${
                  selectedSymbol === el.symbol
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span className="font-extrabold text-sm">{el.symbol}</span>
                <span className={`text-[10px] ${selectedSymbol === el.symbol ? 'text-purple-200' : 'text-slate-400'}`}>
                  Z = {el.z}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* If in Orbital Mode: Select Sublevel s, px, py, pz, d */}
        {viewMode === 'orbitals' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Forma de Orbital (Nube Cuántica)
            </h4>
            <div className="grid grid-cols-5 gap-1.5">
              {(['s', 'px', 'py', 'pz', 'd'] as const).map((orb) => (
                <button
                  key={orb}
                  onClick={() => setActiveOrbitalShape(orb)}
                  className={`py-2 rounded-xl text-xs font-extrabold uppercase transition border ${
                    activeOrbitalShape === orb
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {orb}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantum Numbers & Nuclear Data */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-500" />
            <span>Estructura Cuántica</span>
          </h4>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Protones (p⁺)</span>
              <span className="text-base font-black text-rose-500">{activeElement.protons}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Neutrones (n⁰)</span>
              <span className="text-base font-black text-blue-500">{activeElement.neutrons}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Electrones (e⁻)</span>
              <span className="text-base font-black text-cyan-500">{activeElement.electrons}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Configuración Electrónica:
            </span>
            <code className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
              {activeElement.config}
            </code>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 leading-relaxed font-medium">
            {activeElement.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtomicOrbitals3D;
