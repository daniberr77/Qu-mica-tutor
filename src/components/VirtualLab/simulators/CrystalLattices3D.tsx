import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Grid,
  Sparkles,
  Info,
  Layers,
  Box,
} from 'lucide-react';

interface LatticeConfig {
  id: string;
  name: string;
  type: string;
  coordinationNumber: number;
  atomsPerCell: number;
  packingEfficiency: string;
  examples: string;
  description: string;
}

const LATTICES: LatticeConfig[] = [
  {
    id: 'sc',
    name: 'Cúbica Simple (SC)',
    type: 'Cúbica Primitiva',
    coordinationNumber: 6,
    atomsPerCell: 1,
    packingEfficiency: '52.4%',
    examples: 'Polonio (Po α)',
    description: 'Estructura con átomos solo en los 8 vértices del cubo. Cada vértice aporta 1/8 de átomo a la celda unitaria (8 × 1/8 = 1 átomo neto).',
  },
  {
    id: 'bcc',
    name: 'Cúbica Centrada en el Cuerpo (BCC)',
    type: 'Body-Centered Cubic',
    coordinationNumber: 8,
    atomsPerCell: 2,
    packingEfficiency: '68.0%',
    examples: 'Hierro (Fe α), Sodio (Na), Cromo (Cr), Wolframio (W)',
    description: '8 átomos en los vértices (1 átomo neto) más 1 átomo completo ubicado exactamente en el centro geométrico del cubo.',
  },
  {
    id: 'fcc',
    name: 'Cúbica Centrada en las Caras (FCC)',
    type: 'Face-Centered Cubic',
    coordinationNumber: 12,
    atomsPerCell: 4,
    packingEfficiency: '74.0% (Máxima)',
    examples: 'Cobre (Cu), Oro (Au), Plata (Ag), Aluminio (Al)',
    description: 'Posee átomos en los 8 vértices y en el centro de las 6 caras del cubo (6 × 1/2 = 3 átomos de cara + 1 de vértice = 4 átomos netos).',
  },
  {
    id: 'nacl',
    name: 'Red Iónica de Halita (NaCl)',
    type: 'Red Iónica FCC Interpenetrada',
    coordinationNumber: 6,
    atomsPerCell: 4,
    packingEfficiency: 'Empaquetamiento Iónico',
    examples: 'Cloruro de Sodio (Sal de mesa), MgO, LiF',
    description: 'Red cúbica formada por cationes Na⁺ (pequeños, morados) y aniones Cl⁻ (grandes, verdes) con coordinación octaédrica 6:6.',
  },
];

export const CrystalLattices3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLatticeId, setSelectedLatticeId] = useState<string>('fcc');
  const [gridMultiplicity, setGridMultiplicity] = useState<'unit' | '2x2'>('unit');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(6.0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeLattice = LATTICES.find((l) => l.id === selectedLatticeId) || LATTICES[2];

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, zoomLevel);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(6, 10, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.5);
    dirLight2.position.set(-6, -4, -6);
    scene.add(dirLight2);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    groupRef.current = rootGroup;

    // Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (rootGroup && isRotating && !isDraggingRef.current) {
        rootGroup.rotation.y += 0.006;
      }

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
      cameraRef.current.position.set(0, 2, zoomLevel);
    }
  }, [zoomLevel]);

  // Build Crystal Lattice Geometry
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

    const cubeSize = 2.4;
    const half = cubeSize / 2;
    const atomRadius = 0.32;

    const cornerAtomGeo = new THREE.SphereGeometry(atomRadius, 24, 24);
    const cornerAtomMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.25,
      metalness: 0.3,
    });

    const addUnitCell = (ox: number, oy: number, oz: number) => {
      const cellGroup = new THREE.Group();
      cellGroup.position.set(ox, oy, oz);

      // Wireframe Box outline
      const boxWireGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const boxWireMat = new THREE.MeshBasicMaterial({
        color: 0x94a3b8,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      });
      cellGroup.add(new THREE.Mesh(boxWireGeo, boxWireMat));

      // 8 Corner Atoms
      const corners = [
        [-half, -half, -half],
        [half, -half, -half],
        [-half, half, -half],
        [half, half, -half],
        [-half, -half, half],
        [half, -half, half],
        [-half, half, half],
        [half, half, half],
      ];

      corners.forEach(([cx, cy, cz]) => {
        const atomMesh = new THREE.Mesh(cornerAtomGeo, cornerAtomMat);
        atomMesh.position.set(cx, cy, cz);
        cellGroup.add(atomMesh);
      });

      // Special atoms based on lattice type:
      if (selectedLatticeId === 'bcc') {
        // 1 Center Atom
        const centerGeo = new THREE.SphereGeometry(atomRadius * 1.1, 24, 24);
        const centerMat = new THREE.MeshStandardMaterial({
          color: 0xec4899,
          roughness: 0.2,
          metalness: 0.4,
        });
        const centerMesh = new THREE.Mesh(centerGeo, centerMat);
        centerMesh.position.set(0, 0, 0);
        cellGroup.add(centerMesh);
      } else if (selectedLatticeId === 'fcc') {
        // 6 Face-Centered Atoms
        const faceGeo = new THREE.SphereGeometry(atomRadius, 24, 24);
        const faceMat = new THREE.MeshStandardMaterial({
          color: 0xa855f7,
          roughness: 0.25,
          metalness: 0.3,
        });

        const faceCenters = [
          [half, 0, 0],
          [-half, 0, 0],
          [0, half, 0],
          [0, -half, 0],
          [0, 0, half],
          [0, 0, -half],
        ];

        faceCenters.forEach(([fx, fy, fz]) => {
          const faceMesh = new THREE.Mesh(faceGeo, faceMat);
          faceMesh.position.set(fx, fy, fz);
          cellGroup.add(faceMesh);
        });
      } else if (selectedLatticeId === 'nacl') {
        // Alternating Na+ (purple) and Cl- (emerald)
        const clGeo = new THREE.SphereGeometry(atomRadius * 1.15, 24, 24);
        const clMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
        const naGeo = new THREE.SphereGeometry(atomRadius * 0.75, 24, 24);
        const naMat = new THREE.MeshStandardMaterial({ color: 0xa855f7 });

        // Edge centers for Na+
        const edgeCenters = [
          [half, half, 0],
          [-half, half, 0],
          [half, -half, 0],
          [-half, -half, 0],
          [half, 0, half],
          [-half, 0, half],
          [half, 0, -half],
          [-half, 0, -half],
          [0, half, half],
          [0, -half, half],
          [0, half, -half],
          [0, -half, -half],
          [0, 0, 0], // Central Na+
        ];

        edgeCenters.forEach(([ex, ey, ez]) => {
          const naMesh = new THREE.Mesh(naGeo, naMat);
          naMesh.position.set(ex, ey, ez);
          cellGroup.add(naMesh);
        });
      }

      group.add(cellGroup);
    };

    if (gridMultiplicity === 'unit') {
      addUnitCell(0, 0, 0);
    } else {
      // 2x2 multi-cell lattice
      const shift = cubeSize / 2;
      addUnitCell(-shift, -shift, 0);
      addUnitCell(shift, -shift, 0);
      addUnitCell(-shift, shift, 0);
      addUnitCell(shift, shift, 0);
    }
  }, [selectedLatticeId, gridMultiplicity]);

  // Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !groupRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    groupRef.current.rotation.y += deltaX * 0.008;
    groupRef.current.rotation.x += deltaY * 0.008;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* 3D Viewport */}
      <div className="flex-1 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col relative min-h-[480px]">
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base font-bold text-white tracking-wide">
              {activeLattice.name}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {activeLattice.packingEfficiency}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Multiplicity Toggle */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl text-xs font-semibold text-slate-300">
              <button
                onClick={() => setGridMultiplicity('unit')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  gridMultiplicity === 'unit' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:text-white'
                }`}
              >
                Celda Unitaria
              </button>
              <button
                onClick={() => setGridMultiplicity('2x2')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  gridMultiplicity === '2x2' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:text-white'
                }`}
              >
                Red 2×2
              </button>
            </div>

            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                isRotating
                  ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 3D Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => (isDraggingRef.current = false)}
          onMouseLeave={() => (isDraggingRef.current = false)}
          className="flex-1 w-full h-[400px] cursor-grab active:cursor-grabbing select-none relative"
        />

        {/* Bottom Hint */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Cristalografía:</span>
            <span>Inspecciona los vértices, aristas y centro de caras en perspectiva tridimensional.</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(3.5, z - 0.5))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(9.5, z + 0.5))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Lattice Type Selector */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Box className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tipo de Red Cristalina</span>
          </h4>

          <div className="grid grid-cols-1 gap-2">
            {LATTICES.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedLatticeId(l.id)}
                className={`p-3 rounded-2xl text-left border transition flex items-center justify-between ${
                  selectedLatticeId === l.id
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="font-extrabold text-xs">{l.name}</div>
                  <div className={`text-[10px] ${selectedLatticeId === l.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {l.type}
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                  selectedLatticeId === l.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {l.packingEfficiency}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Crystallographic Metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-500" />
            <span>Propiedades de Empaquetamiento</span>
          </h4>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">N° de Coordinación (NC)</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">{activeLattice.coordinationNumber} vecinos</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Átomos Netos/Celda</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{activeLattice.atomsPerCell}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 col-span-2">
              <span className="text-[10px] text-slate-400 font-bold block">Ejemplos Reales</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeLattice.examples}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
            {activeLattice.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrystalLattices3D;
