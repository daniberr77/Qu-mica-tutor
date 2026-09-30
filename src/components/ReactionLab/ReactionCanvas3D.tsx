import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ReactionDefinition, Atom3D } from '../../types/reactions3d';
import { ELEMENTS_MAP } from '../../data/reactions3dData';

interface ReactionCanvas3DProps {
  reaction: ReactionDefinition;
  progress: number; // 0.0 to 1.0
  onAtomSelect?: (atom: Atom3D | null) => void;
  selectedAtomId?: string | null;
  cameraPreset?: 'perspective' | 'front' | 'top';
  onResetCameraPreset?: () => void;
}

// Helper to create high-resolution text sprites for atom labels
function createLabelSprite(text: string, bgColor: string = '#1E293B'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Circle background with subtle glow
    ctx.beginPath();
    ctx.arc(64, 64, 48, 0, Math.PI * 2);
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Text symbol
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 66);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.65, 0.65, 0.65);
  return sprite;
}

// Smoothstep interpolation
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export const ReactionCanvas3D: React.FC<ReactionCanvas3DProps> = ({
  reaction,
  progress,
  onAtomSelect,
  selectedAtomId,
  cameraPreset = 'perspective',
  onResetCameraPreset,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // References to dynamic scene objects
  const atomsGroupRef = useRef<THREE.Group | null>(null);
  const initialBondsGroupRef = useRef<THREE.Group | null>(null);
  const finalBondsGroupRef = useRef<THREE.Group | null>(null);
  const collisionLightRef = useRef<THREE.PointLight | null>(null);
  const shockwaveMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const electronSpritesRef = useRef<THREE.Mesh[]>([]);

  // Maps of meshes by ID
  const atomMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // Hover state
  const [hoveredAtom, setHoveredAtom] = useState<Atom3D | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    // CAMERA
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 9.5);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 22;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controlsRef.current = controls;

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(6, 12, 8);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-6, -4, -6);
    scene.add(dirLight2);

    // Dynamic collision flash point light
    const collisionLight = new THREE.PointLight(0xf59e0b, 0, 12);
    collisionLight.position.set(0, 0, 0);
    scene.add(collisionLight);
    collisionLightRef.current = collisionLight;

    // PLATFORM GRID & SCIENTIFIC STAGE
    const stageGroup = new THREE.Group();

    // Subtle laboratory grid
    const grid = new THREE.GridHelper(12, 24, 0x1e293b, 0x0f172a);
    grid.position.y = -2.4;
    stageGroup.add(grid);

    // Concentric orbital guidance rings
    [2, 4, 6].forEach((r) => {
      const ringGeo = new THREE.RingGeometry(r - 0.02, r + 0.02, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x1e293b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -2.39;
      stageGroup.add(ring);
    });

    scene.add(stageGroup);

    // SHOCKWAVE RING (Energy burst at collision)
    const shockwaveGeo = new THREE.RingGeometry(0.1, 0.4, 48);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwave.rotation.x = Math.PI / 2;
    shockwave.position.y = 0;
    scene.add(shockwave);
    shockwaveMeshRef.current = shockwave;

    // COLLISION SPARK PARTICLES
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = 0;

      // Random spherical outward velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 1.2 + Math.random() * 2.5;

      particleVelocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
      particleVelocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
      particleVelocities[i * 3 + 2] = speed * Math.cos(phi);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('velocity', new THREE.BufferAttribute(particleVelocities, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffedd5,
      size: 0.12,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // GROUPS FOR ATOMS AND BONDS
    const atomsGroup = new THREE.Group();
    scene.add(atomsGroup);
    atomsGroupRef.current = atomsGroup;

    const initialBondsGroup = new THREE.Group();
    scene.add(initialBondsGroup);
    initialBondsGroupRef.current = initialBondsGroup;

    const finalBondsGroup = new THREE.Group();
    scene.add(finalBondsGroup);
    finalBondsGroupRef.current = finalBondsGroup;

    // ANIMATION LOOP
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // RESIZE OBSERVER
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Camera based on preset
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (cameraPreset === 'perspective') {
      camera.position.set(0, 3.5, 9.5);
      controls.target.set(0, 0, 0);
    } else if (cameraPreset === 'front') {
      camera.position.set(0, 0, 11);
      controls.target.set(0, 0, 0);
    } else if (cameraPreset === 'top') {
      camera.position.set(0, 12, 0.01);
      controls.target.set(0, 0, 0);
    }
    controls.update();

    if (onResetCameraPreset) {
      onResetCameraPreset();
    }
  }, [cameraPreset, onResetCameraPreset]);

  // Build Scene Graph whenever `reaction` changes
  useEffect(() => {
    const scene = sceneRef.current;
    const atomsGroup = atomsGroupRef.current;
    const initialBondsGroup = initialBondsGroupRef.current;
    const finalBondsGroup = finalBondsGroupRef.current;

    if (!scene || !atomsGroup || !initialBondsGroup || !finalBondsGroup) return;

    // Clear previous atoms & bonds
    while (atomsGroup.children.length > 0) {
      const obj = atomsGroup.children[0];
      atomsGroup.remove(obj);
    }
    while (initialBondsGroup.children.length > 0) {
      const obj = initialBondsGroup.children[0];
      initialBondsGroup.remove(obj);
    }
    while (finalBondsGroup.children.length > 0) {
      const obj = finalBondsGroup.children[0];
      finalBondsGroup.remove(obj);
    }

    // Clean electron sprites
    electronSpritesRef.current.forEach((mesh) => scene.remove(mesh));
    electronSpritesRef.current = [];

    atomMeshesRef.current.clear();

    // 1. CREATE ATOM MESHES
    reaction.atoms.forEach((atom) => {
      const elem = ELEMENTS_MAP[atom.element] || {
        color: '#E2E8F0',
        radius: 0.5,
        name: atom.element,
      };

      const radius = elem.radius;
      const isMetal = ['Zn', 'Cu', 'Ag', 'Na'].includes(atom.element);

      const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(atom.color || elem.color),
        roughness: isMetal ? 0.25 : 0.4,
        metalness: isMetal ? 0.8 : 0.05,
      });

      const atomMesh = new THREE.Mesh(sphereGeo, sphereMat);
      atomMesh.castShadow = true;
      atomMesh.receiveShadow = true;
      atomMesh.userData = { atomData: atom };

      // Element text badge floating on top of atom
      const label = createLabelSprite(atom.element, '#0F172A');
      label.position.set(0, radius + 0.35, 0);
      atomMesh.add(label);

      // Selection halo mesh (hidden by default)
      const haloGeo = new THREE.RingGeometry(radius + 0.08, radius + 0.16, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.name = 'selectionHalo';
      halo.rotation.x = Math.PI / 2;
      atomMesh.add(halo);

      atomsGroup.add(atomMesh);
      atomMeshesRef.current.set(atom.id, atomMesh);
    });

    // 2. CREATE INITIAL BONDS
    reaction.initialBonds.forEach((bond) => {
      const bondContainer = new THREE.Group();
      bondContainer.userData = { bondData: bond };

      const isDouble = bond.order === 2;
      const cylinderRadius = isDouble ? 0.06 : 0.09;

      const bondMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: 0.95,
      });

      if (isDouble) {
        // Two parallel cylinders
        const cyl1 = new THREE.Mesh(new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, 1, 12), bondMat);
        cyl1.position.x = 0.11;
        const cyl2 = new THREE.Mesh(new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, 1, 12), bondMat);
        cyl2.position.x = -0.11;
        bondContainer.add(cyl1);
        bondContainer.add(cyl2);
      } else {
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, 1, 12), bondMat);
        bondContainer.add(cyl);
      }

      initialBondsGroup.add(bondContainer);
    });

    // 3. CREATE FINAL BONDS
    reaction.finalBonds.forEach((bond) => {
      const bondContainer = new THREE.Group();
      bondContainer.userData = { bondData: bond };

      const isDouble = bond.order === 2;
      const cylinderRadius = isDouble ? 0.06 : 0.09;

      const bondMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8, // vibrant cyan for newly forged chemical bonds
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: 0,
      });

      if (isDouble) {
        const cyl1 = new THREE.Mesh(new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, 1, 12), bondMat);
        cyl1.position.x = 0.11;
        const cyl2 = new THREE.Mesh(new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, 1, 12), bondMat);
        cyl2.position.x = -0.11;
        bondContainer.add(cyl1);
        bondContainer.add(cyl2);
      } else {
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, 1, 12), bondMat);
        bondContainer.add(cyl);
      }

      finalBondsGroup.add(bondContainer);
    });

    // 4. CREATE ELECTRON TRANSFER SPHERES IF REDOX
    if (reaction.electronTransfers && reaction.electronTransfers.length > 0) {
      reaction.electronTransfers.forEach((et) => {
        for (let i = 0; i < et.electrons; i++) {
          const eGeo = new THREE.SphereGeometry(0.14, 16, 16);
          const eMat = new THREE.MeshBasicMaterial({
            color: 0x67e8f9,
            transparent: true,
            opacity: 0,
          });
          const eMesh = new THREE.Mesh(eGeo, eMat);
          eMesh.userData = { transfer: et, index: i };
          scene.add(eMesh);
          electronSpritesRef.current.push(eMesh);
        }
      });
    }
  }, [reaction]);

  // UPDATE SCENE BASED ON `progress` (0.0 to 1.0)
  useEffect(() => {
    const t = Math.max(0, Math.min(1, progress));
    const atomPositionsMap = new Map<string, THREE.Vector3>();

    // 1. UPDATE ATOM POSITIONS AND VIBRATION
    reaction.atoms.forEach((atom) => {
      const mesh = atomMeshesRef.current.get(atom.id);
      if (!mesh) return;

      const pStart = new THREE.Vector3(...atom.startPos);
      const pCol = new THREE.Vector3(...atom.collisionPos);
      const pEnd = new THREE.Vector3(...atom.endPos);

      const currentPos = new THREE.Vector3();

      if (t <= 0.5) {
        // Approaching phase (0.0 -> 0.5)
        const factor = smoothstep(0.0, 0.5, t);
        currentPos.lerpVectors(pStart, pCol, factor);
      } else {
        // Product dispersion phase (0.5 -> 1.0)
        const factor = smoothstep(0.5, 1.0, t);
        currentPos.lerpVectors(pCol, pEnd, factor);
      }

      // Add molecular thermal excitation jitter near transition complex (t ~ 0.40 to 0.54)
      if (t >= 0.38 && t <= 0.54) {
        const jitterIntensity = (1 - Math.abs(t - 0.46) / 0.08) * 0.06;
        currentPos.x += (Math.sin(t * 120 + atom.id.charCodeAt(0)) - 0.5) * jitterIntensity;
        currentPos.y += (Math.cos(t * 140 + atom.id.charCodeAt(0)) - 0.5) * jitterIntensity;
      }

      mesh.position.copy(currentPos);
      atomPositionsMap.set(atom.id, currentPos);

      // Color transition for Redox copper atom
      if (reaction.category === 'redox' && atom.element === 'Cu') {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (t > 0.52) {
          const mix = smoothstep(0.52, 0.7, t);
          mat.color.lerpColors(new THREE.Color('#D97706'), new THREE.Color('#06B6D4'), mix);
        } else {
          mat.color.set('#D97706');
        }
      }

      // Update selection halo
      const halo = mesh.getObjectByName('selectionHalo') as THREE.Mesh | undefined;
      if (halo && halo.material) {
        const isSelected = selectedAtomId === atom.id;
        const isHovered = hoveredAtom?.id === atom.id;
        const haloMat = halo.material as THREE.MeshBasicMaterial;
        haloMat.opacity = isSelected ? 0.9 : isHovered ? 0.5 : 0;
      }
    });

    // Helper to position and orient a bond between two atoms
    const updateBondGroup = (
      group: THREE.Group,
      atom1Pos: THREE.Vector3,
      atom2Pos: THREE.Vector3,
      scaleY: number,
      opacity: number,
      colorHex?: number
    ) => {
      const midPoint = new THREE.Vector3().addVectors(atom1Pos, atom2Pos).multiplyScalar(0.5);
      group.position.copy(midPoint);

      const distance = atom1Pos.distanceTo(atom2Pos);
      group.scale.set(1, distance * scaleY, 1);

      // Orientation quaternion
      const dir = new THREE.Vector3().subVectors(atom2Pos, atom1Pos).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      group.quaternion.setFromUnitVectors(up, dir);

      // Update material
      group.children.forEach((child) => {
        const m = child as THREE.Mesh;
        if (m.material) {
          const mat = m.material as THREE.MeshStandardMaterial;
          mat.opacity = opacity;
          mat.transparent = opacity < 0.99;
          if (colorHex !== undefined) {
            mat.color.setHex(colorHex);
          }
        }
      });
    };

    // 2. UPDATE INITIAL BONDS (Break around t = 0.38 - 0.52)
    const initialBondsGroup = initialBondsGroupRef.current;
    if (initialBondsGroup) {
      initialBondsGroup.children.forEach((child) => {
        const bondData = child.userData.bondData;
        const pos1 = atomPositionsMap.get(bondData.atom1Id);
        const pos2 = atomPositionsMap.get(bondData.atom2Id);
        if (!pos1 || !pos2) return;

        let scale = 1;
        let opacity = 0.95;
        let colorHex = 0x94a3b8;

        if (t < 0.35) {
          scale = 1;
          opacity = 0.95;
        } else if (t >= 0.35 && t <= 0.52) {
          // Bonds stretching, glowing warm amber before breaking!
          const breakProgress = (t - 0.35) / 0.17;
          scale = 1 - breakProgress;
          opacity = 0.95 * (1 - breakProgress);
          colorHex = 0xf59e0b; // amber warning glow as bond breaks
        } else {
          scale = 0.001;
          opacity = 0;
        }

        updateBondGroup(child as THREE.Group, pos1, pos2, scale, opacity, colorHex);
      });
    }

    // 3. UPDATE FINAL BONDS (Form around t = 0.52 - 0.72)
    const finalBondsGroup = finalBondsGroupRef.current;
    if (finalBondsGroup) {
      finalBondsGroup.children.forEach((child) => {
        const bondData = child.userData.bondData;
        const pos1 = atomPositionsMap.get(bondData.atom1Id);
        const pos2 = atomPositionsMap.get(bondData.atom2Id);
        if (!pos1 || !pos2) return;

        let scale = 0.001;
        let opacity = 0;
        let colorHex = 0x38bdf8; // electric cyan for newly created bond

        if (t < 0.5) {
          scale = 0.001;
          opacity = 0;
        } else if (t >= 0.5 && t <= 0.7) {
          // New bond forming and locking into place!
          const formProgress = (t - 0.5) / 0.2;
          scale = formProgress;
          opacity = formProgress * 0.95;
          colorHex = 0x38bdf8;
        } else {
          scale = 1;
          opacity = 0.95;
          colorHex = 0x64748b; // settles to stable bond color
        }

        updateBondGroup(child as THREE.Group, pos1, pos2, scale, opacity, colorHex);
      });
    }

    // 4. UPDATE COLLISION FLASH & SHOCKWAVE
    const light = collisionLightRef.current;
    const shockwave = shockwaveMeshRef.current;
    const particles = particlesRef.current;

    if (t >= 0.38 && t <= 0.62) {
      const peak = 1 - Math.abs(t - 0.5) / 0.12;
      const intensity = Math.max(0, peak) * 4.5;
      if (light) light.intensity = intensity;

      if (shockwave) {
        const swProgress = (t - 0.38) / 0.24;
        const ringScale = 0.5 + swProgress * 6.5;
        shockwave.scale.set(ringScale, ringScale, ringScale);
        (shockwave.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - swProgress) * 0.8;
      }

      if (particles) {
        const pMat = particles.material as THREE.PointsMaterial;
        const burstProgress = (t - 0.42) / 0.2;
        if (burstProgress > 0 && burstProgress <= 1) {
          pMat.opacity = (1 - burstProgress) * 0.9;
          const posAttr = particles.geometry.getAttribute('position') as THREE.BufferAttribute;
          const velAttr = particles.geometry.getAttribute('velocity') as THREE.BufferAttribute;

          for (let i = 0; i < posAttr.count; i++) {
            posAttr.setXYZ(
              i,
              velAttr.getX(i) * burstProgress * 1.5,
              velAttr.getY(i) * burstProgress * 1.5,
              velAttr.getZ(i) * burstProgress * 1.5
            );
          }
          posAttr.needsUpdate = true;
        } else {
          pMat.opacity = 0;
        }
      }
    } else {
      if (light) light.intensity = 0;
      if (shockwave) (shockwave.material as THREE.MeshBasicMaterial).opacity = 0;
      if (particles) (particles.material as THREE.PointsMaterial).opacity = 0;
    }

    // 5. UPDATE ELECTRON TRANSFERS (FOR REDOX)
    if (electronSpritesRef.current.length > 0 && reaction.electronTransfers) {
      electronSpritesRef.current.forEach((eMesh) => {
        const transfer = eMesh.userData.transfer;
        const donorPos = atomPositionsMap.get(transfer.fromAtomId);
        const acceptorPos = atomPositionsMap.get(transfer.toAtomId);

        if (!donorPos || !acceptorPos) return;

        if (t >= 0.42 && t <= 0.6) {
          const eProgress = (t - 0.42) / 0.18;
          (eMesh.material as THREE.MeshBasicMaterial).opacity = 0.95;

          // Parabolic jump arc in 3D
          const curPos = new THREE.Vector3().lerpVectors(donorPos, acceptorPos, eProgress);
          curPos.y += Math.sin(eProgress * Math.PI) * 1.2; // arc upward
          eMesh.position.copy(curPos);
        } else {
          (eMesh.material as THREE.MeshBasicMaterial).opacity = 0;
        }
      });
    }
  }, [progress, reaction, selectedAtomId, hoveredAtom]);

  // MOUSE CLICK & HOVER INTERACTION WITH RAYCASTER
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      if (!container || !camera || !scene) return;

      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const meshes: THREE.Mesh[] = [];
      atomMeshesRef.current.forEach((m) => meshes.push(m));

      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const atomData = clickedMesh.userData.atomData as Atom3D;
        if (onAtomSelect) {
          onAtomSelect(atomData);
        }
      } else {
        if (onAtomSelect) {
          onAtomSelect(null);
        }
      }
    },
    [onAtomSelect]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      const camera = cameraRef.current;
      if (!container || !camera) return;

      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const meshes: THREE.Mesh[] = [];
      atomMeshesRef.current.forEach((m) => meshes.push(m));

      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object as THREE.Mesh;
        const atomData = hoveredMesh.userData.atomData as Atom3D;
        setHoveredAtom(atomData);
        container.style.cursor = 'pointer';
      } else {
        setHoveredAtom(null);
        container.style.cursor = 'grab';
      }
    },
    []
  );

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      className="w-full h-full min-h-[380px] sm:min-h-[460px] relative select-none rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner"
    >
      {/* 3D Scene Controls HUD hint */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex items-center gap-2">
        <span className="text-[10px] font-semibold tracking-wider text-slate-400 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-700/50">
          Click y arrastrar: rotar 360° • Scroll: zoom
        </span>
      </div>

      {/* Hovered Atom Tooltip */}
      {hoveredAtom && (
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2.5 rounded-xl text-white shadow-xl max-w-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full border border-white/40"
              style={{
                backgroundColor:
                  hoveredAtom.color || ELEMENTS_MAP[hoveredAtom.element]?.color || '#FFFFFF',
              }}
            />
            <span className="font-bold text-xs text-white">
              {hoveredAtom.label} ({ELEMENTS_MAP[hoveredAtom.element]?.name})
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            <span className="text-slate-400">Rol:</span> {hoveredAtom.role}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Reactivo: <span className="text-emerald-400">{hoveredAtom.initialMolecule}</span> ➔ Producto:{' '}
            <span className="text-sky-400">{hoveredAtom.finalMolecule}</span>
          </p>
        </div>
      )}
    </div>
  );
};
