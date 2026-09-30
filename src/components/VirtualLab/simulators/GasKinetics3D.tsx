import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  RotateCcw,
  Flame,
  Snowflake,
  Play,
  Pause,
  Gauge,
  Wind,
  Info,
  Sliders,
  Maximize2,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Compass,
  Layers,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';

// ============================================================================
// CONSTANTES FÍSICAS Y QUÍMICAS
// ============================================================================
const R_ATM = 0.08205746; // (atm * L) / (mol * K)
const R_JOULES = 8.314462; // J / (mol * K)
const K_BOLTZMANN = 1.380649e-23; // J / K
const N_AVOGADRO = 6.02214076e23; // partículas / mol

export type GasLawMode = 'general' | 'boyle' | 'charles' | 'gay-lussac' | 'avogadro' | 'dalton';

interface GasSpecie {
  id: string;
  name: string;
  formula: string;
  molarMass: number; // g / mol
  colorHex: number;
  colorCss: string;
  radius: number;
  description: string;
}

const GAS_SPECIES: Record<string, GasSpecie> = {
  he: {
    id: 'he',
    name: 'Helio',
    formula: 'He',
    molarMass: 4.0026,
    colorHex: 0x38bdf8, // Cyan vibrante
    colorCss: '#38bdf8',
    radius: 0.09,
    description: 'Gas noble monoatómico ultraligero. Máxima velocidad de difusión.',
  },
  n2: {
    id: 'n2',
    name: 'Nitrógeno',
    formula: 'N₂',
    molarMass: 28.0134,
    colorHex: 0xf43f5e, // Rosa / Rojo carmesí
    colorCss: '#f43f5e',
    radius: 0.12,
    description: 'Componente principal del aire (~78%). Molécula diatómica con triple enlace.',
  },
  co2: {
    id: 'co2',
    name: 'Dióxido de Carbono',
    formula: 'CO₂',
    molarMass: 44.01,
    colorHex: 0x10b981, // Verde esmeralda
    colorCss: '#10b981',
    radius: 0.15,
    description: 'Molécula triatómica lineal más pesada. Menor velocidad cuadrática media.',
  },
};

interface Particle3D {
  mesh: THREE.Mesh;
  specieId: string;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  mass: number;
}

export const GasKinetics3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // ESTADOS DEL SIMULADOR Y LEYES
  // ============================================================================
  const [activeLaw, setActiveLaw] = useState<GasLawMode>('general');
  const [solveFor, setSolveFor] = useState<'P' | 'V' | 'T' | 'n'>('P');

  // Variables de Estado (PV = nRT)
  const [temperature, setTemperature] = useState<number>(298.15); // Kelvin (25 °C)
  const [volume, setVolume] = useState<number>(22.414); // Litros (5.0 a 50.0 L)
  const [totalMoles, setTotalMoles] = useState<number>(1.0); // Moles totales (0.2 a 4.0 mol)
  const [pressure, setPressure] = useState<number>(1.092); // atm

  // Composición para Ley de Dalton (Moles de cada gas)
  const [molesHe, setMolesHe] = useState<number>(0.5);
  const [molesN2, setMolesN2] = useState<number>(0.3);
  const [molesCO2, setMolesCO2] = useState<number>(0.2);

  // Especie activa en modo de gas único
  const [singleGasType, setSingleGasType] = useState<'he' | 'n2' | 'co2'>('he');

  // Controles de Simulación
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1.0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [pressureUnit, setPressureUnit] = useState<'atm' | 'kPa' | 'bar' | 'mmHg'>('atm');

  // Métricas en tiempo real calculadas por el motor físico
  const [collisionCount, setCollisionCount] = useState<number>(0);
  const [collisionRate, setCollisionRate] = useState<number>(0);

  // ============================================================================
  // REFERENCIAS THREE.JS
  // ============================================================================
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const particlesGroupRef = useRef<THREE.Group | null>(null);
  const particlesListRef = useRef<Particle3D[]>([]);

  // Referencias a partes móviles 3D
  const pistonHeadRef = useRef<THREE.Mesh | null>(null);
  const pistonRodRef = useRef<THREE.Mesh | null>(null);
  const pistonHandleRef = useRef<THREE.Mesh | null>(null);
  const pistonLocksRef = useRef<THREE.Group | null>(null);
  const heaterLightRef = useRef<THREE.PointLight | null>(null);
  const heaterCoilsRef = useRef<THREE.Mesh | null>(null);
  const manometerNeedleRef = useRef<THREE.Mesh | null>(null);
  const thermometerLiquidRef = useRef<THREE.Mesh | null>(null);

  // Métricas físicas internas
  const collisionCounterRef = useRef<number>(0);
  const lastCollisionRateCalcRef = useRef<number>(performance.now());
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastSoundTimeRef = useRef<number>(0);

  // Límites espaciales del cilindro transparente 3D
  const CYLINDER_RADIUS = 2.4;
  const FLOOR_Y = -2.2;
  const PISTON_MIN_Y = -1.2; // Para V = 5.0 L
  const PISTON_MAX_Y = 2.6; // Para V = 50.0 L

  // Calcula la posición Y del émbolo en función del volumen en Litros
  const calculatePistonY = useCallback((volL: number) => {
    const clampedV = Math.max(5.0, Math.min(50.0, volL));
    const factor = (clampedV - 5.0) / (50.0 - 5.0);
    return PISTON_MIN_Y + factor * (PISTON_MAX_Y - PISTON_MIN_Y);
  }, []);

  // ============================================================================
  // CÁLCULOS QUÍMICOS Y TERMODINÁMICOS
  // ============================================================================
  // En modo Dalton, los moles totales son la suma de las especies
  const effectiveTotalMoles = useMemo(() => {
    if (activeLaw === 'dalton') {
      return Number((molesHe + molesN2 + molesCO2).toFixed(3));
    }
    return totalMoles;
  }, [activeLaw, molesHe, molesN2, molesCO2, totalMoles]);

  // Presión calculada según gas ideal (atm)
  const computedPressureAtm = useMemo(() => {
    if (volume <= 0) return 0;
    return (effectiveTotalMoles * R_ATM * temperature) / volume;
  }, [effectiveTotalMoles, temperature, volume]);

  // Presiones parciales según la Ley de Dalton: Pi = Xi * Ptotal
  const daltonBreakdown = useMemo(() => {
    if (effectiveTotalMoles <= 0) {
      return {
        pHe: 0,
        pN2: 0,
        pCO2: 0,
        fracHe: 0,
        fracN2: 0,
        fracCO2: 0,
      };
    }
    const fracHe = molesHe / effectiveTotalMoles;
    const fracN2 = molesN2 / effectiveTotalMoles;
    const fracCO2 = molesCO2 / effectiveTotalMoles;

    return {
      pHe: fracHe * computedPressureAtm,
      pN2: fracN2 * computedPressureAtm,
      pCO2: fracCO2 * computedPressureAtm,
      fracHe,
      fracN2,
      fracCO2,
    };
  }, [effectiveTotalMoles, molesHe, molesN2, molesCO2, computedPressureAtm]);

  // Conversión de unidades de presión
  const convertedPressure = useMemo(() => {
    const pAtm = activeLaw === 'general' && solveFor !== 'P' ? pressure : computedPressureAtm;
    switch (pressureUnit) {
      case 'kPa':
        return { val: (pAtm * 101.325).toFixed(1), unit: 'kPa' };
      case 'bar':
        return { val: (pAtm * 1.01325).toFixed(3), unit: 'bar' };
      case 'mmHg':
        return { val: (pAtm * 760).toFixed(0), unit: 'mmHg' };
      default:
        return { val: pAtm.toFixed(3), unit: 'atm' };
    }
  }, [pressureUnit, activeLaw, solveFor, pressure, computedPressureAtm]);

  // Masa molar media de la mezcla o gas puro
  const meanMolarMass = useMemo(() => {
    if (activeLaw === 'dalton') {
      if (effectiveTotalMoles <= 0) return 20;
      return (
        (molesHe * GAS_SPECIES.he.molarMass +
          molesN2 * GAS_SPECIES.n2.molarMass +
          molesCO2 * GAS_SPECIES.co2.molarMass) /
        effectiveTotalMoles
      );
    }
    return GAS_SPECIES[singleGasType].molarMass;
  }, [activeLaw, singleGasType, molesHe, molesN2, molesCO2, effectiveTotalMoles]);

  // Velocidad media cuadrática (v_rms = sqrt(3RT / M)) en m/s
  const vRmsSpeed = useMemo(() => {
    const massKgMol = meanMolarMass / 1000;
    return Math.round(Math.sqrt((3 * R_JOULES * temperature) / massKgMol));
  }, [meanMolarMass, temperature]);

  // Energía cinética media por molécula <Ek> = 3/2 * kB * T en Joules
  const avgKineticEnergy = useMemo(() => {
    return (1.5 * K_BOLTZMANN * temperature).toExponential(3);
  }, [temperature]);

  // ============================================================================
  // SÍNTESIS DE AUDIO (Web Audio API)
  // Sonido suave de choques de partículas y deslizamiento del émbolo
  // ============================================================================
  const playCollisionSound = useCallback(() => {
    if (!soundEnabled) return;
    const now = performance.now();
    if (now - lastSoundTimeRef.current < 80) return; // Limitar frecuencia de reproducción
    lastSoundTimeRef.current = now;

    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume();
      }
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignorar restricciones de audio del navegador
    }
  }, [soundEnabled]);

  // ============================================================================
  // CONFIGURACIÓN DE LA ESCENA THREE.JS
  // ============================================================================
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 520;

    // 1. Escena y Fondo
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Cámara de Perspectiva
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 8.8);
    cameraRef.current = camera;

    // 3. Renderizador WebGL de alta definición con antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // 4. Controles de Órbita Suaves (OrbitControls)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 4.5;
    controls.maxDistance = 16.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.25; // Permite ver ligeramente desde abajo
    controls.target.set(0, 0.2, 0);
    controlsRef.current = controls;

    // 5. Sistema de Iluminación de Laboratorio
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.65);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 1.3);
    mainKeyLight.position.set(6, 10, 8);
    scene.add(mainKeyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    rimLight.position.set(-6, -4, -6);
    scene.add(rimLight);

    // Luz dinámica del calefactor / criogenizador de base
    const heaterLight = new THREE.PointLight(0xffedd5, 1.2, 7);
    heaterLight.position.set(0, FLOOR_Y + 0.2, 0);
    scene.add(heaterLight);
    heaterLightRef.current = heaterLight;

    // ========================================================================
    // CONSTRUCCIÓN DEL RECIPIENTE CILÍNDRICO TRANSPARENTE 3D
    // ========================================================================
    const labGroup = new THREE.Group();
    scene.add(labGroup);

    // Cilindro de Vidrio de Laboratorio (Transparente y Refractivo)
    const cylinderHeight = 5.2;
    const glassGeo = new THREE.CylinderGeometry(
      CYLINDER_RADIUS,
      CYLINDER_RADIUS,
      cylinderHeight,
      48,
      1,
      true // Abierto arriba y abajo
    );
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.18,
      roughness: 0.06,
      metalness: 0.05,
      transmission: 0.88,
      ior: 1.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.y = 0.4;
    labGroup.add(glassMesh);

    // Anillos graduados de escala volumétrica (5L a 50L) grabados en el vidrio
    const graduationsGroup = new THREE.Group();
    labGroup.add(graduationsGroup);

    for (let l = 10; l <= 50; l += 10) {
      const yPos = calculatePistonY(l);
      const ringGeo = new THREE.TorusGeometry(CYLINDER_RADIUS + 0.015, 0.018, 8, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: l === 20 || l === 40 ? 0x38bdf8 : 0x64748b,
        transparent: true,
        opacity: 0.45,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = yPos;
      graduationsGroup.add(ring);
    }

    // Base metálica pesada inferior
    const baseGeo = new THREE.CylinderGeometry(CYLINDER_RADIUS + 0.35, CYLINDER_RADIUS + 0.45, 0.4, 48);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const baseMesh = new THREE.Mesh(baseGeo, metalMat);
    baseMesh.position.y = FLOOR_Y - 0.2;
    labGroup.add(baseMesh);

    // Suelo interior del cilindro (Placa térmica reflectiva)
    const floorGeo = new THREE.CylinderGeometry(CYLINDER_RADIUS - 0.02, CYLINDER_RADIUS - 0.02, 0.05, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.2,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = FLOOR_Y - 0.025;
    labGroup.add(floorMesh);

    // Espirales de resistencia calefactora / serpentín criogénico
    const coilsGeo = new THREE.TorusGeometry(CYLINDER_RADIUS * 0.65, 0.07, 12, 36);
    const coilsMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xf97316,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    const coilsMesh = new THREE.Mesh(coilsGeo, coilsMat);
    coilsMesh.rotation.x = Math.PI / 2;
    coilsMesh.position.y = FLOOR_Y + 0.04;
    labGroup.add(coilsMesh);
    heaterCoilsRef.current = coilsMesh;

    // ========================================================================
    // ÉMBOLO MÓVIL PESADO (PISTON SYSTEM)
    // ========================================================================
    const pistonGroup = new THREE.Group();
    labGroup.add(pistonGroup);

    // Disco principal del émbolo hermético
    const pistonGeo = new THREE.CylinderGeometry(CYLINDER_RADIUS - 0.03, CYLINDER_RADIUS - 0.03, 0.26, 48);
    const pistonHeadMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.85,
      roughness: 0.2,
    });
    const pistonHead = new THREE.Mesh(pistonGeo, pistonHeadMat);
    pistonGroup.add(pistonHead);
    pistonHeadRef.current = pistonHead;

    // Varilla central de empuje (Piston Rod)
    const rodGeo = new THREE.CylinderGeometry(0.14, 0.14, 3.2, 24);
    const rodMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.1,
    });
    const pistonRod = new THREE.Mesh(rodGeo, rodMat);
    pistonRod.position.y = 1.7;
    pistonHead.add(pistonRod);
    pistonRodRef.current = pistonRod;

    // Manillar ergonómico superior
    const handleGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.8, 16);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.7,
      roughness: 0.3,
    });
    const pistonHandle = new THREE.Mesh(handleGeo, handleMat);
    pistonHandle.rotation.z = Math.PI / 2;
    pistonHandle.position.y = 1.6;
    pistonRod.add(pistonHandle);
    pistonHandleRef.current = pistonHandle;

    // Cerrojos de bloqueo lateral para Ley de Gay-Lussac (Volumen constante)
    const locksGroup = new THREE.Group();
    const lockBoltGeo = new THREE.BoxGeometry(0.45, 0.16, 0.2);
    const lockBoltMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48, // Rojo advertencia
      metalness: 0.8,
      roughness: 0.2,
    });
    const leftLock = new THREE.Mesh(lockBoltGeo, lockBoltMat);
    leftLock.position.set(-CYLINDER_RADIUS - 0.1, 0, 0);
    const rightLock = new THREE.Mesh(lockBoltGeo, lockBoltMat);
    rightLock.position.set(CYLINDER_RADIUS + 0.1, 0, 0);
    locksGroup.add(leftLock);
    locksGroup.add(rightLock);
    locksGroup.visible = false;
    labGroup.add(locksGroup);
    pistonLocksRef.current = locksGroup;

    // ========================================================================
    // MANÓMETRO LATERAL 3D CON AGUJA MÓVIL
    // ========================================================================
    const manometerGroup = new THREE.Group();
    manometerGroup.position.set(-CYLINDER_RADIUS - 0.45, -0.6, 0);
    labGroup.add(manometerGroup);

    // Tubo conector al cilindro
    const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.x = 0.25;
    manometerGroup.add(pipe);

    // Caja del manómetro circular
    const gaugeCaseGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.14, 32);
    const gaugeCaseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 });
    const gaugeCase = new THREE.Mesh(gaugeCaseGeo, gaugeCaseMat);
    gaugeCase.rotation.x = Math.PI / 2;
    manometerGroup.add(gaugeCase);

    // Esfera blanca del manómetro
    const gaugeDialGeo = new THREE.CircleGeometry(0.42, 32);
    const gaugeDialMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const gaugeDial = new THREE.Mesh(gaugeDialGeo, gaugeDialMat);
    gaugeDial.position.z = 0.075;
    manometerGroup.add(gaugeDial);

    // Aguja indicadora roja
    const needleGeo = new THREE.BoxGeometry(0.03, 0.32, 0.015);
    needleGeo.translate(0, 0.14, 0); // Pivote en la base
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const manometerNeedle = new THREE.Mesh(needleGeo, needleMat);
    manometerNeedle.position.z = 0.085;
    manometerGroup.add(manometerNeedle);
    manometerNeedleRef.current = manometerNeedle;

    // ========================================================================
    // TERMÓMETRO LATERAL 3D CON COLUMNA DE MERCURIO
    // ========================================================================
    const thermoGroup = new THREE.Group();
    thermoGroup.position.set(CYLINDER_RADIUS + 0.35, -0.6, 0);
    labGroup.add(thermoGroup);

    // Bulbo de vidrio
    const thermoGlassGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.8, 16);
    const thermoGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      transmission: 0.9,
      roughness: 0.1,
    });
    const thermoGlass = new THREE.Mesh(thermoGlassGeo, thermoGlassMat);
    thermoGroup.add(thermoGlass);

    // Columna de mercurio / líquido termométrico
    const thermoLiquidGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.6, 16);
    thermoLiquidGeo.translate(0, 0.8, 0); // Escala desde la base
    const thermoLiquidMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const thermometerLiquid = new THREE.Mesh(thermoLiquidGeo, thermoLiquidMat);
    thermometerLiquid.position.y = -0.8;
    thermoGroup.add(thermometerLiquid);
    thermometerLiquidRef.current = thermometerLiquid;

    // ========================================================================
    // GRUPO DE PARTÍCULAS
    // ========================================================================
    const particlesGroup = new THREE.Group();
    labGroup.add(particlesGroup);
    particlesGroupRef.current = particlesGroup;

    // Posición inicial del émbolo
    pistonHead.position.y = calculatePistonY(volume);

    // ========================================================================
    // BUCLE DE FÍSICA CINÉTICA Y RENDERIZADO (60 FPS)
    // ========================================================================
    let lastFrameTime = performance.now();

    const animateLoop = () => {
      frameIdRef.current = requestAnimationFrame(animateLoop);

      const now = performance.now();
      const dt = Math.min((now - lastFrameTime) / 1000, 0.05) * simulationSpeed;
      lastFrameTime = now;

      // Actualizar cálculo de choques por segundo cada 500ms
      if (now - lastCollisionRateCalcRef.current >= 500) {
        const elapsedSec = (now - lastCollisionRateCalcRef.current) / 1000;
        setCollisionRate(Math.round(collisionCounterRef.current / elapsedSec));
        collisionCounterRef.current = 0;
        lastCollisionRateCalcRef.current = now;
      }

      // Animación física de partículas
      if (isSimulating && particlesGroupRef.current) {
        const pList = particlesListRef.current;
        const currentPistonY = pistonHeadRef.current ? pistonHeadRef.current.position.y : 0.5;
        const ceilingY = currentPistonY - 0.13; // Borde inferior del émbolo

        for (let i = 0; i < pList.length; i++) {
          const p = pList[i];
          const mesh = p.mesh;

          // Integración Euler del movimiento
          mesh.position.x += p.vx * dt;
          mesh.position.y += p.vy * dt;
          mesh.position.z += p.vz * dt;

          let hasCollided = false;

          // 1. Colisión contra las paredes cilíndricas radiales
          const rSq = mesh.position.x * mesh.position.x + mesh.position.z * mesh.position.z;
          const maxR = CYLINDER_RADIUS - p.radius - 0.03;
          const maxRSq = maxR * maxR;

          if (rSq >= maxRSq) {
            const r = Math.sqrt(rSq);
            const nx = mesh.position.x / r;
            const nz = mesh.position.z / r;

            // Producto escalar v · n
            const vDotN = p.vx * nx + p.vz * nz;
            if (vDotN > 0) {
              // Reflexión elástica: v' = v - 2(v·n)n
              p.vx -= 2 * vDotN * nx;
              p.vz -= 2 * vDotN * nz;

              // Corrección de penetración
              mesh.position.x = nx * maxR;
              mesh.position.z = nz * maxR;

              hasCollided = true;
            }
          }

          // 2. Colisión con el suelo calefactor
          const minY = FLOOR_Y + p.radius + 0.02;
          if (mesh.position.y <= minY) {
            if (p.vy < 0) {
              p.vy = -p.vy;
              mesh.position.y = minY;
              hasCollided = true;
            }
          }

          // 3. Colisión con el émbolo móvil superior
          const maxY = ceilingY - p.radius;
          if (mesh.position.y >= maxY) {
            if (p.vy > 0) {
              p.vy = -p.vy;
              mesh.position.y = maxY;
              hasCollided = true;
            }
          }

          // Asegurar que si el émbolo desciende rápidamente, no atrape partículas arriba
          if (mesh.position.y > maxY) {
            mesh.position.y = maxY;
            p.vy = -Math.abs(p.vy);
            hasCollided = true;
          }

          if (hasCollided) {
            collisionCounterRef.current += 1;
            setCollisionCount((prev) => prev + 1);
            playCollisionSound();
          }
        }
      }

      // Actualizar controles de cámara
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Renderizar escena
      renderer.render(scene, camera);
    };

    animateLoop();

    // Redimensionado responsivo
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (controlsRef.current) controlsRef.current.dispose();
      renderer.dispose();
    };
  }, [calculatePistonY, playCollisionSound]);

  // ============================================================================
  // ACTUALIZACIÓN DE PARTÍCULAS EN EL ESCENARIO 3D
  // Refleja cambios en especies, moles, temperatura y velocidades Maxwell
  // ============================================================================
  useEffect(() => {
    const group = particlesGroupRef.current;
    if (!group) return;

    // Limpieza de mallas previas
    particlesListRef.current.forEach((p) => {
      p.mesh.geometry.dispose();
      if (Array.isArray(p.mesh.material)) {
        p.mesh.material.forEach((m) => m.dispose());
      } else {
        p.mesh.material.dispose();
      }
      group.remove(p.mesh);
    });
    particlesListRef.current = [];

    // Determinar la mezcla de partículas
    const particleSpecs: { specie: GasSpecie; count: number }[] = [];

    if (activeLaw === 'dalton') {
      // Proporcional a los moles de cada gas en la mezcla
      const countHe = Math.max(4, Math.round(molesHe * 35));
      const countN2 = Math.max(4, Math.round(molesN2 * 35));
      const countCO2 = Math.max(4, Math.round(molesCO2 * 35));

      particleSpecs.push({ specie: GAS_SPECIES.he, count: countHe });
      particleSpecs.push({ specie: GAS_SPECIES.n2, count: countN2 });
      particleSpecs.push({ specie: GAS_SPECIES.co2, count: countCO2 });
    } else {
      // Modo de gas individual
      const totalCount = Math.max(15, Math.min(130, Math.round(effectiveTotalMoles * 50)));
      particleSpecs.push({ specie: GAS_SPECIES[singleGasType], count: totalCount });
    }

    const currentPistonY = pistonHeadRef.current ? pistonHeadRef.current.position.y : 0.5;
    const ceilingY = currentPistonY - 0.15;
    const newParticles: Particle3D[] = [];

    particleSpecs.forEach(({ specie, count }) => {
      const geo = new THREE.SphereGeometry(specie.radius, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: specie.colorHex,
        roughness: 0.15,
        metalness: 0.35,
        emissive: specie.colorHex,
        emissiveIntensity: 0.25,
      });

      // Factor de velocidad cuadrática media: v ~ sqrt(T / M)
      const speedMagnitude = Math.sqrt(temperature / 300) * Math.sqrt(28 / specie.molarMass) * 3.2;

      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geo.clone(), mat.clone());

        // Posición aleatoria dentro de las dimensiones cilíndricas
        const rPos = Math.sqrt(Math.random()) * (CYLINDER_RADIUS - specie.radius - 0.1);
        const thetaPos = Math.random() * 2 * Math.PI;
        const x = rPos * Math.cos(thetaPos);
        const z = rPos * Math.sin(thetaPos);
        const y = FLOOR_Y + specie.radius + 0.1 + Math.random() * (ceilingY - FLOOR_Y - 2 * specie.radius - 0.2);

        mesh.position.set(x, y, z);

        // Vector de velocidad isotrópico en 3D
        const u = Math.random() * 2 - 1;
        const phi = Math.random() * 2 * Math.PI;
        const sinT = Math.sqrt(1 - u * u);

        const vx = speedMagnitude * sinT * Math.cos(phi);
        const vy = speedMagnitude * u;
        const vz = speedMagnitude * sinT * Math.sin(phi);

        group.add(mesh);
        newParticles.push({
          mesh,
          specieId: specie.id,
          vx,
          vy,
          vz,
          radius: specie.radius,
          mass: specie.molarMass,
        });
      }
    });

    particlesListRef.current = newParticles;
  }, [activeLaw, singleGasType, molesHe, molesN2, molesCO2, effectiveTotalMoles, temperature]);

  // ============================================================================
  // ACTUALIZACIÓN DE VELOCIDAD DE PARTÍCULAS CUANDO CAMBIA T
  // Modifica las componentes de velocidad existentes dinámicamente
  // ============================================================================
  useEffect(() => {
    const pList = particlesListRef.current;
    if (pList.length === 0) return;

    pList.forEach((p) => {
      const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy + p.vz * p.vz);
      if (currentSpeed > 0.0001) {
        const targetSpeed = Math.sqrt(temperature / 300) * Math.sqrt(28 / p.mass) * 3.2;
        const ratio = targetSpeed / currentSpeed;
        p.vx *= ratio;
        p.vy *= ratio;
        p.vz *= ratio;
      }
    });
  }, [temperature]);

  // ============================================================================
  // ACTUALIZACIÓN DE ALTURA DEL ÉMBOLO (VOLUMEN 3D)
  // ============================================================================
  useEffect(() => {
    const targetY = calculatePistonY(volume);
    if (pistonHeadRef.current) {
      pistonHeadRef.current.position.y = targetY;
    }
    if (pistonLocksRef.current) {
      pistonLocksRef.current.position.y = targetY;
      // Mostrar cerrojos en modo Gay-Lussac (volumen constante)
      pistonLocksRef.current.visible = activeLaw === 'gay-lussac';
    }
  }, [volume, calculatePistonY, activeLaw]);

  // ============================================================================
  // ACTUALIZACIÓN DE ELEMENTOS TÉRMICOS Y MANÓMETRO 3D
  // ============================================================================
  useEffect(() => {
    // 1. Color e intensidad del calefactor según temperatura
    if (heaterCoilsRef.current && heaterLightRef.current) {
      const coilsMat = heaterCoilsRef.current.material as THREE.MeshStandardMaterial;

      if (temperature < 260) {
        // Criogénico / Icy Cyan
        coilsMat.color.setHex(0x38bdf8);
        coilsMat.emissive.setHex(0x0284c7);
        coilsMat.emissiveIntensity = 0.6;
        heaterLightRef.current.color.setHex(0x38bdf8);
        heaterLightRef.current.intensity = 1.0;
      } else if (temperature <= 340) {
        // Temperatura ambiente (25 °C aprox)
        coilsMat.color.setHex(0x94a3b8);
        coilsMat.emissive.setHex(0x475569);
        coilsMat.emissiveIntensity = 0.2;
        heaterLightRef.current.color.setHex(0xffedd5);
        heaterLightRef.current.intensity = 0.4;
      } else {
        // Calentamiento intenso (Rojo / Naranja incandescente)
        const heatNorm = Math.min(1.0, (temperature - 340) / 400);
        coilsMat.color.setHex(0xef4444);
        coilsMat.emissive.setHex(0xf97316);
        coilsMat.emissiveIntensity = 0.4 + heatNorm * 1.2;
        heaterLightRef.current.color.setHex(0xf97316);
        heaterLightRef.current.intensity = 0.6 + heatNorm * 1.5;
      }
    }

    // 2. Rotación de aguja del manómetro 3D según presión
    if (manometerNeedleRef.current) {
      const pAtm = activeLaw === 'general' && solveFor !== 'P' ? pressure : computedPressureAtm;
      // Ángulo: de -45° a 225° según presión (0 a 8 atm)
      const pNorm = Math.max(0, Math.min(1.0, pAtm / 6.0));
      const angle = (1 - pNorm) * (Math.PI * 0.75) - pNorm * (Math.PI * 0.75);
      manometerNeedleRef.current.rotation.z = angle;
    }

    // 3. Altura de columna del termómetro 3D
    if (thermometerLiquidRef.current) {
      const tNorm = Math.max(0.1, Math.min(1.0, (temperature - 100) / 700));
      thermometerLiquidRef.current.scale.set(1, tNorm, 1);
    }
  }, [temperature, computedPressureAtm, pressure, activeLaw, solveFor]);

  // ============================================================================
  // MANEJADORES DE INTERACCIÓN DE CONTROLES
  // ============================================================================
  // Cuando el usuario mueve la temperatura
  const handleTemperatureChange = (newT: number) => {
    setTemperature(newT);

    if (activeLaw === 'charles') {
      // Ley de Charles: P = cte => V = nRT / P
      const newV = Math.max(5.0, Math.min(50.0, (effectiveTotalMoles * R_ATM * newT) / pressure));
      setVolume(Number(newV.toFixed(2)));
    } else if (activeLaw === 'gay-lussac') {
      // Ley de Gay-Lussac: V = cte => P = nRT / V
      const newP = (effectiveTotalMoles * R_ATM * newT) / volume;
      setPressure(Number(newP.toFixed(3)));
    }
  };

  // Cuando el usuario mueve el volumen
  const handleVolumeChange = (newV: number) => {
    setVolume(newV);

    if (activeLaw === 'boyle') {
      // Ley de Boyle: T = cte => P = nRT / V
      const newP = (effectiveTotalMoles * R_ATM * temperature) / newV;
      setPressure(Number(newP.toFixed(3)));
    } else if (activeLaw === 'charles') {
      // Mantener presión constante despejando temperatura
      const newT = Math.max(100, Math.min(800, (pressure * newV) / (effectiveTotalMoles * R_ATM)));
      setTemperature(Number(newT.toFixed(1)));
    }
  };

  // Cuando el usuario mueve la presión
  const handlePressureChange = (newP: number) => {
    setPressure(newP);

    if (activeLaw === 'boyle') {
      // Ley de Boyle: T = cte => V = nRT / P
      const newV = Math.max(5.0, Math.min(50.0, (effectiveTotalMoles * R_ATM * temperature) / newP));
      setVolume(Number(newV.toFixed(2)));
    } else if (activeLaw === 'gay-lussac') {
      // Ley de Gay-Lussac: V = cte => T = PV / nR
      const newT = Math.max(100, Math.min(800, (newP * volume) / (effectiveTotalMoles * R_ATM)));
      setTemperature(Number(newT.toFixed(1)));
    }
  };

  // Restablecer a CNPT (Condiciones Normales de Presión y Temperatura)
  const setCNPT = () => {
    setTemperature(273.15); // 0 °C
    setTotalMoles(1.0);
    setVolume(22.414); // 22.414 L
    setPressure(1.0); // 1 atm
    setMolesHe(0.5);
    setMolesN2(0.3);
    setMolesCO2(0.2);
  };

  // Posicionar la cámara en ángulos predefinidos
  const setCameraView = (view: 'perspective' | 'front' | 'top') => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (view === 'perspective') {
      cameraRef.current.position.set(0, 2.2, 8.8);
    } else if (view === 'front') {
      cameraRef.current.position.set(0, 0.4, 9.2);
    } else if (view === 'top') {
      cameraRef.current.position.set(0, 10.0, 0.1);
    }
    controlsRef.current.target.set(0, 0.2, 0);
    controlsRef.current.update();
  };

  // ============================================================================
  // RENDERIZADO VISUAL
  // ============================================================================
  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full">
      {/* ==================================================================== */}
      {/* ÁREA CENTRAL: ESCENARIO 3D INTERACTIVO CON THREE.JS                  */}
      {/* ==================================================================== */}
      <div className="flex-1 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative min-h-[580px]">
        {/* Barra Superior con Lecturas Físicas Digitales */}
        <div className="p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400/50" />
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide flex items-center gap-2">
              <span>Laboratorio 3D de Gases Ideales</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                {activeLaw.toUpperCase()}
              </span>
            </h3>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Manómetro Digital */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-700/80 text-cyan-300 text-xs font-mono font-bold shadow-xs">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                P = {convertedPressure.val} {convertedPressure.unit}
              </span>
            </div>

            {/* Termómetro Digital */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-700/80 text-amber-300 text-xs font-mono font-bold shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>
                T = {temperature.toFixed(1)} K ({(temperature - 273.15).toFixed(1)} °C)
              </span>
            </div>

            {/* Volumen Digital */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-700/80 text-purple-300 text-xs font-mono font-bold shadow-xs">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>V = {volume.toFixed(2)} L</span>
            </div>

            {/* Botón Pausa / Reanudar */}
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isSimulating
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
              }`}
              title={isSimulating ? 'Pausar simulación' : 'Reanudar simulación'}
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Botón Audio */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                soundEnabled
                  ? 'bg-cyan-600 text-white border-cyan-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={soundEnabled ? 'Silenciar choques' : 'Activar efectos sonoros'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Lienzo WebGL Three.js */}
        <div
          ref={containerRef}
          className="flex-1 w-full min-h-[440px] cursor-grab active:cursor-grabbing select-none relative"
        >
          {/* Overlay Flotante de Ángulos de Cámara */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-lg">
            <span className="text-[10px] text-slate-400 font-bold px-2 flex items-center gap-1">
              <Compass className="w-3 h-3 text-cyan-400" /> Cámara:
            </span>
            <button
              onClick={() => setCameraView('perspective')}
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-medium transition cursor-pointer"
            >
              3D
            </button>
            <button
              onClick={() => setCameraView('front')}
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-medium transition cursor-pointer"
            >
              Frente
            </button>
            <button
              onClick={() => setCameraView('top')}
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-medium transition cursor-pointer"
            >
              Cénit
            </button>
          </div>

          {/* Overlay de Ayuda de Interacción 3D */}
          <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400">
            <span>🖱️ Arrastrar para rotar órbita</span>
            <span>•</span>
            <span>🔍 Rueda para zoom</span>
          </div>

          {/* Indicador de Frecuencia de Choques en Directo */}
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs font-mono text-cyan-300 shadow-lg">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>
              Choques con paredes:{' '}
              <strong className="text-white font-extrabold">{collisionRate}</strong> imp/s
            </span>
          </div>
        </div>

        {/* Barra Inferior de Métricas Cinéticas */}
        <div className="p-3 bg-slate-900/95 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] uppercase font-bold text-slate-500">Vel. Cuadrática Media:</span>
              <span className="font-mono font-extrabold text-cyan-400">{vRmsSpeed} m/s</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] uppercase font-bold text-slate-500">Energía Cinética Media:</span>
              <span className="font-mono font-extrabold text-purple-400">{avgKineticEnergy} J</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] uppercase font-bold text-slate-500">Total Colisiones:</span>
              <span className="font-mono font-bold text-slate-300">{collisionCount}</span>
            </div>
          </div>

          {/* Control de Velocidad de Reproducción */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-bold">Velocidad:</span>
            {[0.5, 1.0, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => setSimulationSpeed(s)}
                className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  simulationSpeed === s
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* PANEL LATERAL: ECUACIÓN DE ESTADO, SLIDERS Y LEYES                   */}
      {/* ==================================================================== */}
      <div className="w-full xl:w-[460px] flex flex-col gap-4">
        {/* Selector de Ley de Gases / Experimento Didáctico */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span>Modalidad Didáctica (Leyes de Gases)</span>
            </label>
            <button
              onClick={setCNPT}
              className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              title="Restablecer a Condiciones Normales de Presión y Temperatura"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer CNPT</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'general', label: 'Ecuación General', sub: 'PV = nRT' },
              { id: 'boyle', label: 'Boyle-Mariotte', sub: 'T = cte (Isotérmico)' },
              { id: 'charles', label: 'Charles', sub: 'P = cte (Isobárico)' },
              { id: 'gay-lussac', label: 'Gay-Lussac', sub: 'V = cte (Isocórico)' },
              { id: 'avogadro', label: 'Avogadro', sub: 'V ∝ n' },
              { id: 'dalton', label: 'Dalton', sub: 'P_total = Σ P_i' },
            ].map((law) => (
              <button
                key={law.id}
                onClick={() => setActiveLaw(law.id as GasLawMode)}
                className={`p-2.5 rounded-2xl border text-left transition flex flex-col cursor-pointer ${
                  activeLaw === law.id
                    ? 'bg-gradient-to-tr from-cyan-600 to-teal-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="font-extrabold text-xs">{law.label}</span>
                <span
                  className={`text-[10px] mt-0.5 truncate ${
                    activeLaw === law.id ? 'text-cyan-100 font-mono' : 'text-slate-400'
                  }`}
                >
                  {law.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ================================================================== */}
        {/* PANEL DE LA ECUACIÓN DE ESTADO EN TIEMPO REAL                       */}
        {/* ================================================================== */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/80 rounded-3xl p-5 border border-cyan-900/60 shadow-xl text-white space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Ecuación de Estado en Tiempo Real</span>
            </span>

            {/* Selector de Unidades de Presión */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-[10px] font-mono">
              {(['atm', 'kPa', 'bar', 'mmHg'] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() => setPressureUnit(unit)}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                    pressureUnit === unit ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Fórmula Simbólica Formateada */}
          <div className="text-center py-2 bg-slate-950/60 rounded-2xl border border-cyan-900/40">
            <div className="text-2xl sm:text-3xl font-black tracking-wider font-mono">
              <span className="text-cyan-400">P</span>
              <span className="text-slate-500 mx-1">·</span>
              <span className="text-purple-400">V</span>
              <span className="text-slate-400 mx-2">=</span>
              <span className="text-emerald-400">n</span>
              <span className="text-slate-500 mx-1">·</span>
              <span className="text-slate-300">R</span>
              <span className="text-slate-500 mx-1">·</span>
              <span className="text-amber-400">T</span>
            </div>
          </div>

          {/* Sustitución Numérica Exacta */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-slate-300 flex-wrap gap-1">
              <span>Sustitución directa:</span>
              <span className="text-[11px] text-slate-500">R = 0.08206 atm·L/(mol·K)</span>
            </div>

            <div className="text-sm font-bold text-slate-200 break-words leading-relaxed">
              (<span className="text-cyan-400">{computedPressureAtm.toFixed(3)} atm</span>) · (
              <span className="text-purple-400">{volume.toFixed(2)} L</span>) = (
              <span className="text-emerald-400">{effectiveTotalMoles.toFixed(2)} mol</span>) · (
              <span className="text-slate-300">0.08206</span>) · (
              <span className="text-amber-400">{temperature.toFixed(1)} K</span>)
            </div>

            {/* Cálculo de despeje de la incógnita */}
            <div className="pt-2 border-t border-slate-800/80 text-[11px] flex items-center justify-between">
              <span className="text-slate-400 font-sans">Despeje de Presión:</span>
              <span className="font-bold text-cyan-300">
                P = (n · R · T) / V = {computedPressureAtm.toFixed(3)} atm
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* LEY DE DALTON: DESGLOSE DE PRESIONES PARCIALES                      */}
        {/* ================================================================== */}
        {activeLaw === 'dalton' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-cyan-500" />
                <span>Ley de Dalton: P_total = P_He + P_N₂ + P_CO₂</span>
              </h4>
            </div>

            {/* Barra Visual Proporcional de Presión Parcial */}
            <div className="h-4 w-full rounded-xl overflow-hidden flex bg-slate-200 dark:bg-slate-800">
              <div
                style={{ width: `${daltonBreakdown.fracHe * 100}%` }}
                className="bg-cyan-500 transition-all duration-300"
                title={`Helio: ${(daltonBreakdown.fracHe * 100).toFixed(1)}%`}
              />
              <div
                style={{ width: `${daltonBreakdown.fracN2 * 100}%` }}
                className="bg-rose-500 transition-all duration-300"
                title={`Nitrógeno: ${(daltonBreakdown.fracN2 * 100).toFixed(1)}%`}
              />
              <div
                style={{ width: `${daltonBreakdown.fracCO2 * 100}%` }}
                className="bg-emerald-500 transition-all duration-300"
                title={`CO₂: ${(daltonBreakdown.fracCO2 * 100).toFixed(1)}%`}
              />
            </div>

            {/* Sliders Independientes para cada Gas */}
            <div className="space-y-3 pt-1">
              {/* Helio */}
              <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-extrabold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <span>Helio (He, M=4):</span>
                  </span>
                  <span className="font-mono font-black text-cyan-900 dark:text-cyan-100">
                    {molesHe.toFixed(2)} mol • P_He = {daltonBreakdown.pHe.toFixed(3)} atm
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  value={molesHe}
                  onChange={(e) => setMolesHe(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Nitrógeno */}
              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-extrabold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Nitrógeno (N₂, M=28):</span>
                  </span>
                  <span className="font-mono font-black text-rose-900 dark:text-rose-100">
                    {molesN2.toFixed(2)} mol • P_N₂ = {daltonBreakdown.pN2.toFixed(3)} atm
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  value={molesN2}
                  onChange={(e) => setMolesN2(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              {/* CO2 */}
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Dióxido de Carbono (CO₂, M=44):</span>
                  </span>
                  <span className="font-mono font-black text-emerald-900 dark:text-emerald-100">
                    {molesCO2.toFixed(2)} mol • P_CO₂ = {daltonBreakdown.pCO2.toFixed(3)} atm
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  value={molesCO2}
                  onChange={(e) => setMolesCO2(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* CONTROLES DESLIZANTES PRINCIPALES (SLIDERS V, T, P, n)              */}
        {/* ================================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-purple-500" />
            <span>Controles Deslizantes de Variables Físicas</span>
          </h4>

          {/* SLIDER DE VOLUMEN (V) */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-500" />
                <span>Volumen del Recipiente (V):</span>
                {activeLaw === 'gay-lussac' && (
                  <span className="flex items-center gap-0.5 text-[10px] text-rose-500 font-bold">
                    <Lock className="w-3 h-3" /> Bloqueado
                  </span>
                )}
              </span>
              <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                {volume.toFixed(2)} Litros
              </span>
            </div>
            <input
              type="range"
              min={5.0}
              max={50.0}
              step={0.5}
              value={volume}
              disabled={activeLaw === 'gay-lussac'}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className={`w-full accent-purple-600 cursor-pointer ${
                activeLaw === 'gay-lussac' ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5.0 L (Comprimido)</span>
              <span>22.4 L (CNPT)</span>
              <span>50.0 L (Expandido)</span>
            </div>
          </div>

          {/* SLIDER DE TEMPERATURA (T) */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Temperatura Absoluta (T):</span>
                {activeLaw === 'boyle' && (
                  <span className="flex items-center gap-0.5 text-[10px] text-rose-500 font-bold">
                    <Lock className="w-3 h-3" /> Constante
                  </span>
                )}
              </span>
              <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                {temperature.toFixed(1)} K{' '}
                <span className="text-xs text-slate-500">({(temperature - 273.15).toFixed(1)} °C)</span>
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={800}
              step={5}
              value={temperature}
              disabled={activeLaw === 'boyle'}
              onChange={(e) => handleTemperatureChange(Number(e.target.value))}
              className={`w-full accent-amber-500 cursor-pointer ${
                activeLaw === 'boyle' ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            />

            {/* Accesos Rápidos de Temperatura */}
            <div className="flex items-center justify-between pt-1 gap-1">
              <button
                onClick={() => handleTemperatureChange(150)}
                disabled={activeLaw === 'boyle'}
                className="px-2 py-0.5 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Snowflake className="w-3 h-3" /> 150 K (Frío)
              </button>
              <button
                onClick={() => handleTemperatureChange(273.15)}
                disabled={activeLaw === 'boyle'}
                className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold cursor-pointer"
              >
                0 °C (273.15 K)
              </button>
              <button
                onClick={() => handleTemperatureChange(298.15)}
                disabled={activeLaw === 'boyle'}
                className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold cursor-pointer"
              >
                25 °C (Ambiente)
              </button>
              <button
                onClick={() => handleTemperatureChange(600)}
                disabled={activeLaw === 'boyle'}
                className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Flame className="w-3 h-3" /> 600 K (Calor)
              </button>
            </div>
          </div>

          {/* SLIDER DE PRESIÓN (P) */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-900/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-500" />
                <span>Presión del Gas (P):</span>
                {activeLaw === 'charles' && (
                  <span className="flex items-center gap-0.5 text-[10px] text-rose-500 font-bold">
                    <Lock className="w-3 h-3" /> Constante
                  </span>
                )}
              </span>
              <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                {computedPressureAtm.toFixed(3)} atm
              </span>
            </div>
            <input
              type="range"
              min={0.2}
              max={8.0}
              step={0.05}
              value={computedPressureAtm}
              disabled={activeLaw === 'charles' || activeLaw === 'dalton'}
              onChange={(e) => handlePressureChange(Number(e.target.value))}
              className={`w-full accent-cyan-600 cursor-pointer ${
                activeLaw === 'charles' || activeLaw === 'dalton' ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.2 atm (Baja)</span>
              <span>1.0 atm (1 bar)</span>
              <span>8.0 atm (Alta)</span>
            </div>
          </div>

          {/* CANTIDAD DE SUSTANCIA / MOLES (En Modo Gas Único) */}
          {activeLaw !== 'dalton' && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-emerald-500" />
                  <span>Cantidad de Gas (n):</span>
                </span>
                <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                  {totalMoles.toFixed(2)} mol
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={4.0}
                step={0.1}
                value={totalMoles}
                onChange={(e) => setTotalMoles(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />

              {/* Selector de Gas Puro */}
              <div className="flex items-center justify-between pt-1 gap-1">
                {(['he', 'n2', 'co2'] as const).map((specieKey) => {
                  const sp = GAS_SPECIES[specieKey];
                  const isSelected = singleGasType === specieKey;
                  return (
                    <button
                      key={sp.id}
                      onClick={() => setSingleGasType(specieKey)}
                      className={`flex-1 py-1 px-2 rounded-xl text-[11px] font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sp.colorCss }} />
                      <span>{sp.name} ({sp.formula})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================================================================== */}
        {/* TARJETA DE EXPLICACIÓN DIDÁCTICA DE LA LEY ACTIVA                  */}
        {/* ================================================================== */}
        <div className="p-4 rounded-3xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/80 text-xs text-cyan-950 dark:text-cyan-200 space-y-2">
          <div className="font-extrabold flex items-center gap-1.5 text-cyan-900 dark:text-cyan-100">
            <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Fundamento Físico de la Simulación:</span>
          </div>

          {activeLaw === 'boyle' && (
            <p className="leading-relaxed">
              <strong>Ley de Boyle-Mariotte (T y n constantes):</strong> Al reducir el volumen moviendo el émbolo hacia abajo, el espacio disponible se reduce. Las partículas chocan con mayor frecuencia contra las paredes, elevando la presión de forma inversamente proporcional: <em>P₁ · V₁ = P₂ · V₂</em>.
            </p>
          )}

          {activeLaw === 'charles' && (
            <p className="leading-relaxed">
              <strong>Ley de Charles (P y n constantes):</strong> Al calentar el recipiente, la velocidad media cuadrática de las partículas aumenta (<em>v ∝ √T</em>). Para mantener la presión constante contra el émbolo, este se eleva expandiendo el volumen: <em>V₁ / T₁ = V₂ / T₂</em>.
            </p>
          )}

          {activeLaw === 'gay-lussac' && (
            <p className="leading-relaxed">
              <strong>Ley de Gay-Lussac (V y n constantes):</strong> El émbolo está bloqueado por cerrojos mecánicos. Al subir la temperatura, las partículas impactan con mayor ímpetu y frecuencia, incrementando directamente la presión manométrica: <em>P₁ / T₁ = P₂ / T₂</em>.
            </p>
          )}

          {activeLaw === 'avogadro' && (
            <p className="leading-relaxed">
              <strong>Hipótesis de Avogadro (P y T constantes):</strong> Volúmenes iguales de gases a la misma presión y temperatura contienen el mismo número de moléculas. Al inyectar más moles (n↑), el gas empuja el émbolo expandiendo el volumen proporcionalmente: <em>V ∝ n</em>.
            </p>
          )}

          {activeLaw === 'dalton' && (
            <p className="leading-relaxed">
              <strong>Ley de Dalton de las Presiones Parciales:</strong> En una mezcla gaseosa, cada gas se comporta como si ocupase el volumen total por sí solo. Las partículas ligeras de Helio (He) se mueven con mayor rapidez que el CO₂, y la presión total es la suma exacta de sus presiones parciales: <em>P_total = P_He + P_N₂ + P_CO₂</em>.
            </p>
          )}

          {activeLaw === 'general' && (
            <p className="leading-relaxed">
              <strong>Ecuación General del Gas Ideal (PV = nRT):</strong> Sintetiza las 4 leyes fundamentales de la física de fluidos en una relación de estado microscópica y macroscópica unificada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GasKinetics3D;
