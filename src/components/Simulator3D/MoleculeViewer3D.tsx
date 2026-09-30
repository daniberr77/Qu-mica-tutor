import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { MoleculeAtom, MoleculeBond } from './types';

interface MoleculeViewer3DProps {
  atoms: MoleculeAtom[];
  bonds: MoleculeBond[];
  selectedAtomId?: string | null;
  onSelectAtom?: (atomId: string) => void;
  simSpeed: number;
  isPaused: boolean;
  autoRotate: boolean;
  showLabels: boolean;
  cameraControlAction?: { type: 'rotate' | 'zoom' | 'reset'; dx?: number; dy?: number; zoom?: number; id: number } | null;
}

export const MoleculeViewer3D: React.FC<MoleculeViewer3DProps> = ({
  atoms,
  bonds,
  selectedAtomId,
  onSelectAtom,
  simSpeed,
  isPaused,
  autoRotate,
  showLabels,
  cameraControlAction,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number | null>(null);

  const moleculeGroupRef = useRef<THREE.Group>(new THREE.Group());
  const atomMeshesRef = useRef<Map<string, { mesh: THREE.Mesh; basePos: THREE.Vector3; index: number }>>(new Map());
  const bondMeshesRef = useRef<{ group: THREE.Group; sourceId: string; targetId: string; order: number; type: string }[]>([]);
  const labelsGroupRef = useRef<THREE.Group>(new THREE.Group());

  // 1. Initial Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 11);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 40;
    controls.minDistance = 2;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight1.position.set(10, 15, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.7);
    dirLight2.position.set(-10, -8, -10);
    scene.add(dirLight2);

    // Subtle star background
    const starGeo = new THREE.BufferGeometry();
    const starCount = 250;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 70;
      starPos[i + 1] = (Math.random() - 0.5) * 70;
      starPos[i + 2] = (Math.random() - 0.5) * 70;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x475569, size: 0.16, transparent: true, opacity: 0.5 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    scene.add(moleculeGroupRef.current);
    scene.add(labelsGroupRef.current);

    // Click handler for 3D atom selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      if (!onSelectAtom) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(atomMeshesRef.current.values()).map(a => a.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        for (const [id, val] of atomMeshesRef.current.entries()) {
          if (val.mesh === hitMesh) {
            onSelectAtom(id);
            break;
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

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

    let clock = new THREE.Clock();
    let accumulatedTime = 0;

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (!isPaused) {
        accumulatedTime += delta * simSpeed;
      }

      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 1.0;
      controls.update();

      // Subtle dynamic molecular vibration
      atomMeshesRef.current.forEach(({ mesh, basePos, index }) => {
        if (!isPaused) {
          const jitter = 0.025;
          mesh.position.x = basePos.x + Math.sin(accumulatedTime * 4.2 + index * 1.5) * jitter;
          mesh.position.y = basePos.y + Math.cos(accumulatedTime * 3.8 + index * 2.2) * jitter;
          mesh.position.z = basePos.z + Math.sin(accumulatedTime * 4.5 + index * 0.8) * jitter;
        }
      });

      // Update bond cylinder orientations and positions according to moving atoms
      bondMeshesRef.current.forEach(({ group, sourceId, targetId, order, type }) => {
        const srcData = atomMeshesRef.current.get(sourceId);
        const tgtData = atomMeshesRef.current.get(targetId);
        if (!srcData || !tgtData) return;

        const p1 = srcData.mesh.position;
        const p2 = tgtData.mesh.position;
        const distance = p1.distanceTo(p2);
        const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        group.position.copy(midPoint);

        const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        group.quaternion.setFromUnitVectors(up, dir);

        // Adjust cylinder scale height
        group.children.forEach(child => {
          child.scale.set(1, distance, 1);
        });
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onSelectAtom]);

  // 2. Rebuild Molecule Geometry when Atoms or Bonds change
  useEffect(() => {
    const molGroup = moleculeGroupRef.current;
    const labelsGroup = labelsGroupRef.current;

    // Clear old 3D elements
    while (molGroup.children.length > 0) {
      const child = molGroup.children[0];
      molGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
      }
    }

    while (labelsGroup.children.length > 0) {
      const child = labelsGroup.children[0];
      labelsGroup.remove(child);
    }

    atomMeshesRef.current.clear();
    bondMeshesRef.current = [];

    if (atoms.length === 0) return;

    // Helper to create text sprite for atom symbol
    const createTextSprite = (text: string, color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.arc(64, 64, 52, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 64, 64);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.95 });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.7, 0.7, 1);
      return sprite;
    };

    // A. Create Atom Spheres
    atoms.forEach((atom, idx) => {
      const isSelected = atom.id === selectedAtomId;
      const geo = new THREE.SphereGeometry(atom.radius, 32, 32);

      const colorHex = parseInt(atom.color.replace('#', '0x'), 16);
      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: isSelected ? 0x10b981 : colorHex,
        emissiveIntensity: isSelected ? 0.6 : 0.15,
        roughness: 0.28,
        metalness: 0.18,
      });

      const mesh = new THREE.Mesh(geo, mat);
      const basePos = new THREE.Vector3(...atom.position);
      mesh.position.copy(basePos);
      molGroup.add(mesh);

      // Selected ring indicator
      if (isSelected) {
        const ringGeo = new THREE.RingGeometry(atom.radius + 0.12, atom.radius + 0.2, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        mesh.add(ringMesh);
      }

      // Atom Label Sprite
      if (showLabels) {
        const labelSprite = createTextSprite(atom.symbol, atom.color);
        labelSprite.position.set(0, atom.radius + 0.55, 0);
        mesh.add(labelSprite);
      }

      atomMeshesRef.current.set(atom.id, {
        mesh,
        basePos,
        index: idx,
      });
    });

    // B. Create Bonds (Cylinders)
    bonds.forEach((bond) => {
      const src = atomMeshesRef.current.get(bond.sourceId);
      const tgt = atomMeshesRef.current.get(bond.targetId);
      if (!src || !tgt) return;

      const p1 = src.basePos;
      const p2 = tgt.basePos;
      const distance = p1.distanceTo(p2);
      const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

      const bondGroup = new THREE.Group();
      bondGroup.position.copy(midPoint);

      const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      bondGroup.quaternion.setFromUnitVectors(up, dir);

      const bondRadius = bond.type === 'ionic' ? 0.06 : 0.08;
      const bondColor = bond.type === 'ionic' ? 0xa855f7 : 0x94a3b8;

      const bondMat = new THREE.MeshStandardMaterial({
        color: bondColor,
        roughness: 0.35,
        metalness: 0.2,
        transparent: bond.type === 'ionic',
        opacity: bond.type === 'ionic' ? 0.75 : 0.95,
      });

      if (bond.order === 1) {
        // Single Bond
        const cylGeo = new THREE.CylinderGeometry(bondRadius, bondRadius, 1, 16);
        const cyl = new THREE.Mesh(cylGeo, bondMat);
        cyl.scale.set(1, distance, 1);
        bondGroup.add(cyl);
      } else if (bond.order === 2) {
        // Double Bond (two parallel cylinders)
        const offset = 0.12;
        const cylGeo = new THREE.CylinderGeometry(bondRadius * 0.85, bondRadius * 0.85, 1, 16);

        const cyl1 = new THREE.Mesh(cylGeo, bondMat);
        cyl1.position.set(offset, 0, 0);
        cyl1.scale.set(1, distance, 1);
        bondGroup.add(cyl1);

        const cyl2 = new THREE.Mesh(cylGeo, bondMat);
        cyl2.position.set(-offset, 0, 0);
        cyl2.scale.set(1, distance, 1);
        bondGroup.add(cyl2);
      } else if (bond.order === 3) {
        // Triple Bond (three cylinders)
        const offset = 0.14;
        const cylGeo = new THREE.CylinderGeometry(bondRadius * 0.75, bondRadius * 0.75, 1, 16);

        const cyl1 = new THREE.Mesh(cylGeo, bondMat);
        cyl1.position.set(0, 0, 0);
        cyl1.scale.set(1, distance, 1);
        bondGroup.add(cyl1);

        const cyl2 = new THREE.Mesh(cylGeo, bondMat);
        cyl2.position.set(offset, 0, 0);
        cyl2.scale.set(1, distance, 1);
        bondGroup.add(cyl2);

        const cyl3 = new THREE.Mesh(cylGeo, bondMat);
        cyl3.position.set(-offset, 0, 0);
        cyl3.scale.set(1, distance, 1);
        bondGroup.add(cyl3);
      }

      molGroup.add(bondGroup);

      bondMeshesRef.current.push({
        group: bondGroup,
        sourceId: bond.sourceId,
        targetId: bond.targetId,
        order: bond.order,
        type: bond.type,
      });
    });
  }, [atoms, bonds, selectedAtomId, showLabels]);

  // 3. Camera Controls (UI Buttons)
  useEffect(() => {
    if (!cameraControlAction || !controlsRef.current || !cameraRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;

    switch (cameraControlAction.type) {
      case 'rotate': {
        const dx = cameraControlAction.dx || 0;
        const dy = cameraControlAction.dy || 0;
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
        if (offset.length() > 2 && offset.length() < 40) {
          camera.position.addVectors(controls.target, offset);
          controls.update();
        }
        break;
      }
      case 'reset': {
        camera.position.set(0, 3, 11);
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
        <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs font-mono font-medium text-teal-400 flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          Three.js Molecular Engine
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-800/80 backdrop-blur-md border border-slate-700 text-[11px] text-slate-300 font-mono">
          {atoms.length} Átomos | {bonds.length} Enlaces
        </span>
      </div>

      {/* Orbit & Interaction Hints */}
      <div className="absolute bottom-3 left-3 text-[11px] font-mono text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 pointer-events-none hidden sm:flex items-center gap-3">
        <span>🖱️ Arrastrar para rotar</span>
        <span>•</span>
        <span>🔍 Rueda para zoom</span>
        <span>•</span>
        <span>👆 Clic en átomo para seleccionar</span>
      </div>
    </div>
  );
};
