import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface AtomViewer3DProps {
  protons: number;
  neutrons: number;
  electrons: number;
  showOrbits: boolean;
  showLabels: boolean;
  simSpeed: number;
  isPaused: boolean;
  autoRotate: boolean;
  cameraControlAction?: { type: 'rotate' | 'zoom' | 'reset'; dx?: number; dy?: number; zoom?: number; id: number } | null;
}

export const AtomViewer3D: React.FC<AtomViewer3DProps> = ({
  protons,
  neutrons,
  electrons,
  showOrbits,
  showLabels,
  simSpeed,
  isPaused,
  autoRotate,
  cameraControlAction,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Groups
  const nucleusGroupRef = useRef<THREE.Group>(new THREE.Group());
  const orbitsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const electronsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const labelsGroupRef = useRef<THREE.Group>(new THREE.Group());

  // Dynamic references
  const electronMeshesRef = useRef<{
    mesh: THREE.Mesh;
    radius: number;
    speed: number;
    initialPhase: number;
    tiltX: number;
    tiltZ: number;
    shell: number;
  }[]>([]);

  const nucleonsDataRef = useRef<{
    mesh: THREE.Mesh;
    basePos: THREE.Vector3;
    type: 'proton' | 'neutron';
    id: number;
  }[]>([]);

  // 1. Initial Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x090d16);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4.5, 18);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 50;
    controls.minDistance = 3;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 0.6);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Nucleus glow point light
    const nucleusPointLight = new THREE.PointLight(0xff6b6b, 2.0, 15);
    nucleusPointLight.position.set(0, 0, 0);
    scene.add(nucleusPointLight);

    // Starfield background particles
    const starGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 80;
      starPos[i + 1] = (Math.random() - 0.5) * 80;
      starPos[i + 2] = (Math.random() - 0.5) * 80;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x475569, size: 0.18, transparent: true, opacity: 0.5 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Add main groups to scene
    scene.add(nucleusGroupRef.current);
    scene.add(orbitsGroupRef.current);
    scene.add(electronsGroupRef.current);
    scene.add(labelsGroupRef.current);

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let clock = new THREE.Clock();
    let accumulatedTime = 0;

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (!isPaused) {
        accumulatedTime += delta * simSpeed;
      }

      // Update Controls
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 1.2;
      controls.update();

      // Jiggle / vibrate nucleons in the nucleus
      nucleonsDataRef.current.forEach(({ mesh, basePos, id }) => {
        if (!isPaused) {
          const jitterScale = 0.035;
          mesh.position.x = basePos.x + Math.sin(accumulatedTime * 7 + id * 1.7) * jitterScale;
          mesh.position.y = basePos.y + Math.cos(accumulatedTime * 6.3 + id * 2.1) * jitterScale;
          mesh.position.z = basePos.z + Math.sin(accumulatedTime * 6.8 + id * 0.9) * jitterScale;
        }
      });

      // Animate Electrons along their orbital planes
      electronMeshesRef.current.forEach(({ mesh, radius, speed, initialPhase, tiltX, tiltZ }) => {
        const currentAngle = initialPhase + (isPaused ? 0 : accumulatedTime * speed);
        // Parametric circle on tilted plane
        const unrotatedX = Math.cos(currentAngle) * radius;
        const unrotatedZ = Math.sin(currentAngle) * radius;

        // Apply tilt rotation
        const pos = new THREE.Vector3(unrotatedX, 0, unrotatedZ);
        pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), tiltX);
        pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), tiltZ);

        mesh.position.copy(pos);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 2. Rebuild Nucleus when Protons or Neutrons change
  useEffect(() => {
    const group = nucleusGroupRef.current;
    // Clear old children
    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
    }
    nucleonsDataRef.current = [];

    const totalNucleons = protons + neutrons;
    if (totalNucleons === 0) return;

    // Materials
    // Protons: Vibrant Red with glowing emissive sheen
    const protonMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.15,
    });

    // Neutrons: Sleek Cyan-Blue with soft neutral sheen
    const neutronMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x075985,
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.25,
    });

    const sphereGeo = new THREE.SphereGeometry(0.38, 24, 24);

    // Distribute nucleons evenly in order
    const list: ('proton' | 'neutron')[] = [];
    let pCount = protons;
    let nCount = neutrons;
    while (pCount > 0 || nCount > 0) {
      if (pCount > 0) {
        list.push('proton');
        pCount--;
      }
      if (nCount > 0) {
        list.push('neutron');
        nCount--;
      }
    }

    // Packing algorithm: Fibonacci spherical distribution
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 rad

    list.forEach((type, i) => {
      const mat = type === 'proton' ? protonMat : neutronMat;
      const mesh = new THREE.Mesh(sphereGeo, mat);

      let x = 0, y = 0, z = 0;
      if (totalNucleons === 1) {
        x = 0; y = 0; z = 0;
      } else {
        // Radius scales with cube root of nucleon count for realistic dense nucleus volume
        const normalizedIndex = (i + 0.5) / totalNucleons;
        const radialDistance = Math.pow(normalizedIndex, 0.45) * Math.max(0.4, Math.pow(totalNucleons, 0.36) * 0.52);

        // Spherical coordinates
        const yFrac = 1 - (i / (totalNucleons - 1)) * 2; // from 1 to -1
        const radiusAtY = Math.sqrt(Math.max(0, 1 - yFrac * yFrac));
        const theta = goldenAngle * i;

        x = Math.cos(theta) * radiusAtY * radialDistance;
        y = yFrac * radialDistance;
        z = Math.sin(theta) * radiusAtY * radialDistance;
      }

      mesh.position.set(x, y, z);
      group.add(mesh);

      nucleonsDataRef.current.push({
        mesh,
        basePos: new THREE.Vector3(x, y, z),
        type,
        id: i,
      });
    });
  }, [protons, neutrons]);

  // 3. Rebuild Electron Shells & Orbiting Electrons
  useEffect(() => {
    const orbitsGroup = orbitsGroupRef.current;
    const electronsGroup = electronsGroupRef.current;

    // Clear old elements
    while (orbitsGroup.children.length > 0) {
      const child = orbitsGroup.children[0] as THREE.Mesh;
      orbitsGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }

    while (electronsGroup.children.length > 0) {
      const child = electronsGroup.children[0] as THREE.Mesh;
      electronsGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }
    electronMeshesRef.current = [];

    // Shell configuration (Bohr / Aufbau capacity)
    // Shell 1 (K): 2 max
    // Shell 2 (L): 8 max
    // Shell 3 (M): 18 max (or 8 for main valence representation)
    // Shell 4 (N): 32 max
    const shells = [
      { index: 1, name: 'K (n=1)', capacity: 2, radius: 3.4, speed: 2.4, tiltX: 0.15, tiltZ: 0.2 },
      { index: 2, name: 'L (n=2)', capacity: 8, radius: 5.6, speed: 1.7, tiltX: -0.45, tiltZ: 0.35 },
      { index: 3, name: 'M (n=3)', capacity: 18, radius: 8.2, speed: 1.2, tiltX: 0.55, tiltZ: -0.4 },
      { index: 4, name: 'N (n=4)', capacity: 32, radius: 11.0, speed: 0.9, tiltX: -0.3, tiltZ: -0.6 },
    ];

    // Electron Geometry & Material (Glowing Neon Cyan)
    const electronGeo = new THREE.SphereGeometry(0.24, 20, 20);
    const electronMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });

    let remainingElectrons = electrons;

    shells.forEach((shell) => {
      const electronsInShell = Math.min(remainingElectrons, shell.capacity);
      remainingElectrons -= electronsInShell;

      // Always draw orbit ring if showOrbits is true AND (electrons in shell > 0 or it's shell 1)
      if (showOrbits && (electronsInShell > 0 || shell.index === 1)) {
        // Torus Ring for orbital path
        const ringGeo = new THREE.TorusGeometry(shell.radius, 0.03, 8, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x0284c7,
          transparent: true,
          opacity: 0.38,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2 + shell.tiltX;
        ringMesh.rotation.z = shell.tiltZ;
        orbitsGroup.add(ringMesh);
      }

      // Create electrons on this shell
      for (let j = 0; j < electronsInShell; j++) {
        const mesh = new THREE.Mesh(electronGeo, electronMat);
        const initialPhase = (j / electronsInShell) * Math.PI * 2;

        electronsGroup.add(mesh);

        electronMeshesRef.current.push({
          mesh,
          radius: shell.radius,
          speed: shell.speed * (j % 2 === 0 ? 1 : -1), // alternating orbit directions for visual depth!
          initialPhase,
          tiltX: shell.tiltX,
          tiltZ: shell.tiltZ,
          shell: shell.index,
        });
      }
    });

    orbitsGroup.visible = showOrbits;
  }, [electrons, showOrbits]);

  // 4. Toggle visibility of orbits
  useEffect(() => {
    orbitsGroupRef.current.visible = showOrbits;
  }, [showOrbits]);

  // 5. Handle Programmatic Camera Controls (Buttons on UI)
  useEffect(() => {
    if (!cameraControlAction || !controlsRef.current || !cameraRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    switch (cameraControlAction.type) {
      case 'rotate': {
        const dx = cameraControlAction.dx || 0;
        const dy = cameraControlAction.dy || 0;
        // Rotate camera position around target
        const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
        const spherical = new THREE.Spherical().setFromVector3(offset);
        spherical.theta += dx;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi + dy));
        offset.setFromSpherical(spherical);
        camera.position.addVectors(controls.target, offset);
        controls.update();
        break;
      }
      case 'zoom': {
        const zoomDelta = cameraControlAction.zoom || 0;
        const factor = zoomDelta > 0 ? 0.85 : 1.15;
        const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
        offset.multiplyScalar(factor);
        if (offset.length() > 3 && offset.length() < 50) {
          camera.position.addVectors(controls.target, offset);
          controls.update();
        }
        break;
      }
      case 'reset': {
        camera.position.set(0, 4.5, 18);
        controls.target.set(0, 0, 0);
        controls.update();
        break;
      }
    }
  }, [cameraControlAction]);

  return (
    <div className="relative w-full h-[480px] sm:h-[560px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center select-none">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Dynamic 3D Badge Overlay */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
        <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs font-mono font-medium text-emerald-400 flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Three.js WebGL Engine
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-800/80 backdrop-blur-md border border-slate-700 text-[11px] text-slate-300 font-mono">
          {electrons} e⁻ | {protons} p⁺ | {neutrons} n⁰
        </span>
      </div>

      {/* Orbit & Interaction Hints */}
      <div className="absolute bottom-3 left-3 text-[11px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 pointer-events-none hidden sm:flex items-center gap-3">
        <span>🖱️ Arrastrar para rotar</span>
        <span>•</span>
        <span>🔍 Rueda para zoom</span>
        <span>•</span>
        <span>⚡ {autoRotate ? 'Auto-giro ON' : 'Libre'}</span>
      </div>
    </div>
  );
};
