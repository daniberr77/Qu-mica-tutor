import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Layers,
  Sparkles,
  Info,
  Maximize2,
} from 'lucide-react';

interface AtomData {
  element: string;
  name: string;
  color: number;
  radius: number;
  position: [number, number, number];
}

interface MoleculeConfig {
  id: string;
  name: string;
  formula: string;
  geometry: string;
  hybridization: string;
  bondAngle: string;
  dipole: string;
  description: string;
  atoms: AtomData[];
  bonds: [number, number][]; // indices of atoms to connect
}

const MOLECULES: MoleculeConfig[] = [
  {
    id: 'h2o',
    name: 'Agua',
    formula: 'H2O',
    geometry: 'Angular',
    hybridization: 'sp3',
    bondAngle: '104.5°',
    dipole: '1.85 D (Polar)',
    description: 'Posee 2 pares enlazantes y 2 pares solitarios de electrones que repelen los enlaces H-O reduciendo el ángulo a 104.5°.',
    atoms: [
      { element: 'O', name: 'Oxígeno', color: 0xef4444, radius: 0.65, position: [0, 0, 0] },
      { element: 'H', name: 'Hidrógeno', color: 0xf8fafc, radius: 0.35, position: [-0.95, -0.65, 0] },
      { element: 'H', name: 'Hidrógeno', color: 0xf8fafc, radius: 0.35, position: [0.95, -0.65, 0] },
    ],
    bonds: [[0, 1], [0, 2]],
  },
  {
    id: 'co2',
    name: 'Dióxido de Carbono',
    formula: 'CO2',
    geometry: 'Lineal',
    hybridization: 'sp',
    bondAngle: '180°',
    dipole: '0 D (Apolar)',
    description: 'Geometría lineal perfecta sin pares de electrones libres sobre el carbono central. Los dipolos de enlace C=O se cancelan.',
    atoms: [
      { element: 'C', name: 'Carbono', color: 0x334155, radius: 0.6, position: [0, 0, 0] },
      { element: 'O', name: 'Oxígeno', color: 0xef4444, radius: 0.55, position: [-1.4, 0, 0] },
      { element: 'O', name: 'Oxígeno', color: 0xef4444, radius: 0.55, position: [1.4, 0, 0] },
    ],
    bonds: [[0, 1], [0, 2]],
  },
  {
    id: 'ch4',
    name: 'Metano',
    formula: 'CH4',
    geometry: 'Tetraédrica',
    hybridization: 'sp3',
    bondAngle: '109.5°',
    dipole: '0 D (Apolar)',
    description: 'El carbono forma 4 enlaces simples equivalentes orientados hacia los vértices de un tetraedro regular, minimizando la repulsión electrónica.',
    atoms: [
      { element: 'C', name: 'Carbono', color: 0x334155, radius: 0.6, position: [0, 0, 0] },
      { element: 'H', name: 'Hidrógeno', color: 0xf8fafc, radius: 0.35, position: [0.75, 0.75, 0.75] },
      { element: 'H', name: 'Hidrógeno', color: 0xf8fafc, radius: 0.35, position: [-0.75, -0.75, 0.75] },
      { element: 'H', name: 'Hidrógeno', color: 0xf8fafc, radius: 0.35, position: [-0.75, 0.75, -0.75] },
      { element: 'H', name: 'Hidrógeno', color: 0xf8fafc, radius: 0.35, position: [0.75, -0.75, -0.75] },
    ],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4]],
  },
  {
    id: 'nh3',
    name: 'Amoniaco',
    formula: 'NH3',
    geometry: 'Piramidal Trigonal',
    hybridization: 'sp3',
    bondAngle: '107.3°',
    dipole: '1.47 D (Polar)',
    description: 'Un par no enlazante en el ápice empuja a los 3 enlaces N-H hacia abajo, reduciendo el ángulo tetraédrico de 109.5° a 107.3°.',
    atoms: [
      { element: 'N', name: 'Nitrógeno', color: 0x3b82f6, radius: 0.6, position: [0, 0.35, 0] },
      { element: 'H', name: 'Hidrógeno', color: 0xf8fafc, radius: 0.35, position: [0.9, -0.3, 0] },
      { element: 'H', name: 'Hidrógeno', color: 0xf8fafc, radius: 0.35, position: [-0.45, -0.3, 0.8] },
      { element: 'H', name: 'Hidrógeno', color: 0xf8fafc, radius: 0.35, position: [-0.45, -0.3, -0.8] },
    ],
    bonds: [[0, 1], [0, 2], [0, 3]],
  },
  {
    id: 'bf3',
    name: 'Trifluoruro de Boro',
    formula: 'BF3',
    geometry: 'Trigonal Plana',
    hybridization: 'sp2',
    bondAngle: '120°',
    dipole: '0 D (Apolar)',
    description: 'Molécula plana con 3 enlaces B-F simétricos separados por 120°. El boro tiene un octeto incompleto con 6 electrones de valencia.',
    atoms: [
      { element: 'B', name: 'Boro', color: 0xf59e0b, radius: 0.55, position: [0, 0, 0] },
      { element: 'F', name: 'Flúor', color: 0x10b981, radius: 0.45, position: [0, 1.3, 0] },
      { element: 'F', name: 'Flúor', color: 0x10b981, radius: 0.45, position: [1.12, -0.65, 0] },
      { element: 'F', name: 'Flúor', color: 0x10b981, radius: 0.45, position: [-1.12, -0.65, 0] },
    ],
    bonds: [[0, 1], [0, 2], [0, 3]],
  },
  {
    id: 'sf6',
    name: 'Hexafluoruro de Azufre',
    formula: 'SF6',
    geometry: 'Octaédrica',
    hybridization: 'sp3d2',
    bondAngle: '90°',
    dipole: '0 D (Apolar)',
    description: 'El átomo central de azufre expande su octeto a 12 electrones formando 6 enlaces octaédricos altamente simétricos en los 3 ejes cartesianos.',
    atoms: [
      { element: 'S', name: 'Azufre', color: 0xeab308, radius: 0.65, position: [0, 0, 0] },
      { element: 'F', name: 'Flúor', color: 0x10b981, radius: 0.45, position: [1.2, 0, 0] },
      { element: 'F', name: 'Flúor', color: 0x10b981, radius: 0.45, position: [-1.2, 0, 0] },
      { element: 'F', name: 'Flúor', color: 0x10b981, radius: 0.45, position: [0, 1.2, 0] },
      { element: 'F', name: 'Flúor', color: 0x10b981, radius: 0.45, position: [0, -1.2, 0] },
      { element: 'F', name: 'Flúor', color: 0x10b981, radius: 0.45, position: [0, 0, 1.2] },
      { element: 'F', name: 'Flúor', color: 0x10b981, radius: 0.45, position: [0, 0, -1.2] },
    ],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]],
  },
];

export const MolecularGeometry3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedMoleculeId, setSelectedMoleculeId] = useState<string>('h2o');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [modelStyle, setModelStyle] = useState<'ball-stick' | 'space-filling'>('ball-stick');
  const [zoomLevel, setZoomLevel] = useState<number>(5);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Mouse interaction state for manual 3D dragging
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeMolecule = MOLECULES.find((m) => m.id === selectedMoleculeId) || MOLECULES[0];

  // Initialize Three.js scene once
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

    // Clear previous children and append canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-5, -5, -3);
    scene.add(dirLight2);

    // Molecule root group
    const molGroup = new THREE.Group();
    scene.add(molGroup);
    groupRef.current = molGroup;

    // Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (molGroup && isRotating && !isDraggingRef.current) {
        molGroup.rotation.y += 0.008;
        molGroup.rotation.x += 0.003;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
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

  // Update zoom when state changes
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = zoomLevel;
    }
  }, [zoomLevel]);

  // Build 3D Molecule Mesh when selected molecule or style changes
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Clear previous molecule meshes
    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      group.remove(child);
    }

    const isSpaceFilling = modelStyle === 'space-filling';

    // 1. Create Atoms (Spheres)
    activeMolecule.atoms.forEach((atom) => {
      const radius = isSpaceFilling ? atom.radius * 1.5 : atom.radius;
      const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: atom.color,
        roughness: 0.25,
        metalness: 0.15,
      });

      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(...atom.position);
      group.add(mesh);
    });

    // 2. Create Bonds (Cylinders) if Ball & Stick
    if (!isSpaceFilling) {
      activeMolecule.bonds.forEach(([idxA, idxB]) => {
        const atomA = activeMolecule.atoms[idxA];
        const atomB = activeMolecule.atoms[idxB];
        if (!atomA || !atomB) return;

        const posA = new THREE.Vector3(...atomA.position);
        const posB = new THREE.Vector3(...atomB.position);
        const distance = posA.distanceTo(posB);
        const midpoint = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);

        const cylinderGeo = new THREE.CylinderGeometry(0.08, 0.08, distance, 16);
        const cylinderMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.4,
          metalness: 0.2,
        });

        const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
        cylinder.position.copy(midpoint);

        // Align cylinder to connection vector
        const orientation = new THREE.Vector3().subVectors(posB, posA).normalize();
        const axis = new THREE.Vector3(0, 1, 0);
        cylinder.quaternion.setFromUnitVectors(axis, orientation);

        group.add(cylinder);
      });
    }
  }, [activeMolecule, modelStyle]);

  // Mouse & Touch Dragging Listeners
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

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const resetView = () => {
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
    }
    setZoomLevel(5);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* 3D Canvas Viewport */}
      <div className="flex-1 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col relative min-h-[480px]">
        {/* Viewport Top Bar */}
        <div className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-base font-bold text-white tracking-wide">
              {activeMolecule.name} ({activeMolecule.formula})
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {activeMolecule.geometry}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                isRotating
                  ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title={isRotating ? 'Pausar rotación automática' : 'Reanudar rotación'}
            >
              {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isRotating ? 'Pausar' : 'Girar'}</span>
            </button>

            <button
              onClick={() => setModelStyle(modelStyle === 'ball-stick' ? 'space-filling' : 'ball-stick')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Alternar estilo de visualización"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">
                {modelStyle === 'ball-stick' ? 'Varillas' : 'Espacio Lleno'}
              </span>
            </button>

            <button
              onClick={resetView}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition"
              title="Restablecer posición de cámara"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas Container */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex-1 w-full h-[400px] cursor-grab active:cursor-grabbing select-none relative"
        />

        {/* Interactive Floating Hint & Zoom Controls */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Tip:</span>
            <span>Arrastra con el ratón o pantalla táctil para rotar 360° en 3D.</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(2.5, z - 0.5))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Acercar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(8.5, z + 0.5))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Alejar zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Configuration & Chemical Properties Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Molecule Selector Chips */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Seleccionar Molécula</span>
          </h4>

          <div className="grid grid-cols-2 gap-2">
            {MOLECULES.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMoleculeId(m.id)}
                className={`p-2.5 rounded-2xl text-left border transition flex flex-col gap-0.5 ${
                  selectedMoleculeId === m.id
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="font-extrabold text-xs">{m.formula}</div>
                <div className={`text-[10px] truncate ${selectedMoleculeId === m.id ? 'text-purple-200' : 'text-slate-400'}`}>
                  {m.geometry}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Molecular Properties */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-500" />
            <span>Parámetros de Enlace RPECV</span>
          </h4>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Ángulo de Enlace</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">{activeMolecule.bondAngle}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Hibridación</span>
              <span className="text-sm font-black text-purple-600 dark:text-purple-400">{activeMolecule.hybridization}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Momento Dipolar</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">{activeMolecule.dipole}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Geometría</span>
              <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">{activeMolecule.geometry}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 leading-relaxed font-medium">
            {activeMolecule.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MolecularGeometry3D;
