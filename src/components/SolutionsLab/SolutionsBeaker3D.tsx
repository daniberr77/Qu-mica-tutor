import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { SolutionCalculationResult, SoluteData } from '../../services/solutionsEngine';
import { Rotate3d, Compass, Eye, Sparkles, Waves } from 'lucide-react';

interface SolutionsBeaker3DProps {
  calculation: SolutionCalculationResult;
  solute: SoluteData;
  isPouringWater: boolean;
  isDispensingSolute: boolean;
  isStirring: boolean;
  onToggleStirring: () => void;
}

export const SolutionsBeaker3D: React.FC<SolutionsBeaker3DProps> = ({
  calculation,
  solute,
  isPouringWater,
  isDispensingSolute,
  isStirring,
  onToggleStirring,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [viewAngle, setViewAngle] = useState<'front' | 'iso' | 'top'>('front');

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Mesh & Object references
  const beakerGroupRef = useRef<THREE.Group | null>(null);
  const liquidMeshRef = useRef<THREE.Mesh | null>(null);
  const liquidTopMeniscusRef = useRef<THREE.Mesh | null>(null);
  const precipitateGroupRef = useRef<THREE.Group | null>(null);
  const stirrerBarRef = useRef<THREE.Mesh | null>(null);
  const waterStreamMeshRef = useRef<THREE.Mesh | null>(null);
  const fallingParticlesRef = useRef<{ x: number; y: number; z: number; vy: number; mesh: THREE.Mesh }[]>([]);
  const fallingContainerRef = useRef<THREE.Group | null>(null);

  // Dissolved particles
  const dissolvedPointsRef = useRef<THREE.Points | null>(null);
  const particleVelocitiesRef = useRef<Float32Array | null>(null);

  // Animated values
  const currentLiquidHeightRef = useRef<number>(0);
  const currentPrecipitateHeightRef = useRef<number>(0);

  // Mouse orbit controls state
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraRotationRef = useRef<{ theta: number; phi: number; distance: number }>({
    theta: 0.35, // Horizontal angle (radians)
    phi: 1.35, // Vertical angle (radians)
    distance: 12.5, // Camera distance
  });

  // Calculate target heights based on max volume = 1000 mL and beaker height ~5.2
  const MAX_LIQUID_HEIGHT = 5.0;
  const BEAKER_RADIUS = 2.2;
  const LIQUID_RADIUS = 2.12;

  // Generate beaker graduation texture
  const createGraduationTexture = useCallback((): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Beaker label box (white frosted zone)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.roundRect(140, 160, 260, 140, 16);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('BORO 3.3', 165, 215);
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('1000 mL ±5%', 165, 255);
    ctx.font = '18px sans-serif';
    ctx.fillText('Química Lab', 165, 285);

    // Graduation lines on the left side
    const startY = 880; // Bottom mark (100 mL)
    const endY = 220; // Top mark (1000 mL)
    const step = (startY - endY) / 9;

    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 4;

    for (let i = 0; i <= 9; i++) {
      const ml = (i + 1) * 100;
      const y = startY - i * step;

      // Major tick mark
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(420, y);
      ctx.lineTo(520, y);
      ctx.stroke();

      // Number label
      ctx.font = 'bold 28px monospace';
      ctx.fillText(`${ml}`, 535, y + 9);

      // Minor tick mark (50 mL)
      if (i < 9) {
        const midY = y - step / 2;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(450, midY);
        ctx.lineTo(500, midY);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(6, 12, 8);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    dirLight1.shadow.bias = -0.001;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.6);
    dirLight2.position.set(-8, 6, -6);
    scene.add(dirLight2);

    const rimLight = new THREE.PointLight(0xffffff, 1.2, 20);
    rimLight.position.set(0, 8, -4);
    scene.add(rimLight);

    // 5. Lab Table Surface & Shadow Receiver
    const tableGeo = new THREE.CylinderGeometry(6.5, 6.5, 0.4, 48);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.1,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = -0.2;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // Table accent ring
    const ringGeo = new THREE.TorusGeometry(6.5, 0.05, 16, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -0.01;
    scene.add(ringMesh);

    // 6. Beaker Group
    const beakerGroup = new THREE.Group();
    beakerGroupRef.current = beakerGroup;
    scene.add(beakerGroup);

    // Glass Beaker Mesh
    const beakerHeight = 5.8;
    const beakerWallGeo = new THREE.CylinderGeometry(
      BEAKER_RADIUS,
      BEAKER_RADIUS,
      beakerHeight,
      64,
      1,
      true
    );
    const beakerBottomGeo = new THREE.CylinderGeometry(
      BEAKER_RADIUS,
      BEAKER_RADIUS,
      0.2,
      64
    );

    // High quality glass material
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      transmission: 0.92,
      opacity: 0.35,
      transparent: true,
      roughness: 0.05,
      ior: 1.52,
      thickness: 0.5,
      reflectivity: 0.9,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const beakerWall = new THREE.Mesh(beakerWallGeo, glassMat);
    beakerWall.position.y = beakerHeight / 2;
    beakerGroup.add(beakerWall);

    const beakerBottom = new THREE.Mesh(beakerBottomGeo, glassMat);
    beakerBottom.position.y = 0.1;
    beakerGroup.add(beakerBottom);

    // Beaker Top Lip / Rim
    const rimGeo = new THREE.TorusGeometry(BEAKER_RADIUS, 0.07, 16, 64);
    const rimMesh = new THREE.Mesh(rimGeo, glassMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = beakerHeight;
    beakerGroup.add(rimMesh);

    // Spout (pico vertedor)
    const spoutShape = new THREE.Shape();
    spoutShape.moveTo(-0.4, 0);
    spoutShape.lineTo(0, 0.35);
    spoutShape.lineTo(0.4, 0);
    spoutShape.closePath();
    const spoutExtrude = new THREE.ExtrudeGeometry(spoutShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.04 });
    const spoutMesh = new THREE.Mesh(spoutExtrude, glassMat);
    spoutMesh.position.set(0, beakerHeight - 0.05, BEAKER_RADIUS - 0.1);
    spoutMesh.rotation.x = -Math.PI / 2.8;
    beakerGroup.add(spoutMesh);

    // Graduation Lines Decal Cylinder
    const gradGeo = new THREE.CylinderGeometry(
      BEAKER_RADIUS + 0.005,
      BEAKER_RADIUS + 0.005,
      beakerHeight,
      64,
      1,
      true
    );
    const gradTexture = createGraduationTexture();
    const gradMat = new THREE.MeshBasicMaterial({
      map: gradTexture,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const gradMesh = new THREE.Mesh(gradGeo, gradMat);
    gradMesh.position.y = beakerHeight / 2;
    gradMesh.rotation.y = -Math.PI / 2.2;
    beakerGroup.add(gradMesh);

    // 7. Liquid Mesh
    const liquidGeo = new THREE.CylinderGeometry(
      LIQUID_RADIUS,
      LIQUID_RADIUS,
      1,
      48,
      1,
      false
    );
    const liquidMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(calculation.liquidColor),
      roughness: 0.1,
      metalness: 0.05,
      transparent: true,
      opacity: calculation.liquidOpacity,
      side: THREE.DoubleSide,
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.y = 0.5;
    liquidMesh.scale.set(1, 0.001, 1);
    beakerGroup.add(liquidMesh);
    liquidMeshRef.current = liquidMesh;

    // Liquid Top Meniscus Disk
    const meniscusGeo = new THREE.CircleGeometry(LIQUID_RADIUS, 48);
    const meniscusMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(calculation.liquidColor),
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: Math.min(1, calculation.liquidOpacity + 0.15),
      side: THREE.DoubleSide,
    });
    const liquidMeniscus = new THREE.Mesh(meniscusGeo, meniscusMat);
    liquidMeniscus.rotation.x = -Math.PI / 2;
    liquidMeniscus.position.y = 0.01;
    beakerGroup.add(liquidMeniscus);
    liquidTopMeniscusRef.current = liquidMeniscus;

    // 8. Dissolved Particles (Brownian motion & concentration density)
    const PARTICLE_COUNT = 600;
    const particlePositions = new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3);
    const particleColors = new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3);
    const particleVelocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = Math.sqrt(Math.random()) * (LIQUID_RADIUS - 0.25);
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0.2 + Math.random() * (MAX_LIQUID_HEIGHT - 0.3);

      particlePositions.setXYZ(i, x, y, z);

      // Half cation, half anion colors
      const isCation = i % 2 === 0;
      const col = new THREE.Color(isCation ? solute.cation.color : solute.anion.color);
      particleColors.setXYZ(i, col.r, col.g, col.b);

      particleVelocities[i * 3] = (Math.random() - 0.5) * 0.015;
      particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.015;
      particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.015;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', particlePositions);
    particlesGeo.setAttribute('color', particleColors);

    // Particle sprite using canvas
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    pGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
    pGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)');
    pGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const particlesMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      map: pTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dissolvedPoints = new THREE.Points(particlesGeo, particlesMat);
    beakerGroup.add(dissolvedPoints);
    dissolvedPointsRef.current = dissolvedPoints;
    particleVelocitiesRef.current = particleVelocities;

    // 9. Precipitate Group (Solid sediment crystals at beaker bottom)
    const precipitateGroup = new THREE.Group();
    precipitateGroup.position.y = 0.2;
    beakerGroup.add(precipitateGroup);
    precipitateGroupRef.current = precipitateGroup;

    // Base mound dome
    const moundGeo = new THREE.CylinderGeometry(1.6, 1.9, 0.5, 32);
    const moundMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(solute.solidColor),
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true,
    });
    const moundMesh = new THREE.Mesh(moundGeo, moundMat);
    moundMesh.position.y = 0.25;
    precipitateGroup.add(moundMesh);

    // Individual faceted crystal clusters on the bottom
    const crystalGeo = new THREE.DodecahedronGeometry(0.14, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(solute.solidColor),
      roughness: 0.3,
      metalness: 0.2,
      flatShading: true,
    });

    for (let c = 0; c < 48; c++) {
      const crMesh = new THREE.Mesh(crystalGeo, crystalMat);
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 1.7;
      crMesh.position.set(
        Math.cos(angle) * r,
        Math.random() * 0.4 + 0.1,
        Math.sin(angle) * r
      );
      crMesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      crMesh.scale.setScalar(0.7 + Math.random() * 0.8);
      precipitateGroup.add(crMesh);
    }
    precipitateGroup.scale.set(1, 0.001, 1);

    // 10. Magnetic Stirrer Bar
    const stirrerGeo = new THREE.CapsuleGeometry(0.12, 0.9, 12, 12);
    const stirrerMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.2,
      metalness: 0.3,
    });
    const stirrerBar = new THREE.Mesh(stirrerGeo, stirrerMat);
    stirrerBar.rotation.z = Math.PI / 2;
    stirrerBar.position.y = 0.28;
    stirrerBar.castShadow = true;
    beakerGroup.add(stirrerBar);
    stirrerBarRef.current = stirrerBar;

    // 11. Falling / Dispensing Container
    const fallingContainer = new THREE.Group();
    beakerGroup.add(fallingContainer);
    fallingContainerRef.current = fallingContainer;

    // 12. Water Stream Mesh
    const streamGeo = new THREE.CylinderGeometry(0.12, 0.18, 4.0, 16);
    const streamMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
    });
    const waterStreamMesh = new THREE.Mesh(streamGeo, streamMat);
    waterStreamMesh.position.set(0, 6.2, 0);
    waterStreamMesh.visible = false;
    beakerGroup.add(waterStreamMesh);
    waterStreamMeshRef.current = waterStreamMesh;

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 450;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth liquid height lerp
      const targetHeight = Math.max(0.01, (calculation.volumeMl / 1000) * MAX_LIQUID_HEIGHT);
      currentLiquidHeightRef.current += (targetHeight - currentLiquidHeightRef.current) * 0.08;
      const currentH = currentLiquidHeightRef.current;

      if (liquidMeshRef.current && liquidTopMeniscusRef.current) {
        if (calculation.volumeMl > 0) {
          liquidMeshRef.current.visible = true;
          liquidTopMeniscusRef.current.visible = true;
          liquidMeshRef.current.scale.set(1, currentH, 1);
          liquidMeshRef.current.position.y = 0.2 + currentH / 2;
          liquidTopMeniscusRef.current.position.y = 0.2 + currentH;
        } else {
          liquidMeshRef.current.visible = false;
          liquidTopMeniscusRef.current.visible = false;
        }
      }

      // Smooth precipitate height lerp
      const targetPrecipitateScale = calculation.precipitatedMassGrams > 0.1
        ? Math.min(1.8, 0.15 + (calculation.precipitatedMassGrams / 120) * 1.2)
        : 0.001;
      currentPrecipitateHeightRef.current += (targetPrecipitateScale - currentPrecipitateHeightRef.current) * 0.1;
      if (precipitateGroupRef.current) {
        precipitateGroupRef.current.visible = currentPrecipitateHeightRef.current > 0.01;
        precipitateGroupRef.current.scale.set(
          1 + currentPrecipitateHeightRef.current * 0.2,
          currentPrecipitateHeightRef.current,
          1 + currentPrecipitateHeightRef.current * 0.2
        );
      }

      // Magnetic Stirrer spinning & vortex
      if (stirrerBarRef.current) {
        if (isStirring) {
          stirrerBarRef.current.rotation.y += 0.35;
          if (liquidTopMeniscusRef.current && calculation.volumeMl > 100) {
            liquidTopMeniscusRef.current.position.y = 0.2 + currentH - Math.sin(elapsedTime * 15) * 0.04;
          }
        }
      }

      // Water stream visibility & animation
      if (waterStreamMeshRef.current) {
        waterStreamMeshRef.current.visible = isPouringWater;
        if (isPouringWater) {
          waterStreamMeshRef.current.position.y = 0.2 + currentH + (7.0 - (0.2 + currentH)) / 2;
          const streamLen = Math.max(0.5, 7.0 - (0.2 + currentH));
          waterStreamMeshRef.current.scale.set(
            1 + Math.sin(elapsedTime * 20) * 0.15,
            streamLen / 4.0,
            1 + Math.cos(elapsedTime * 20) * 0.15
          );
        }
      }

      // Falling solute crystals animation
      if (isDispensingSolute && Math.random() < 0.6 && fallingContainerRef.current) {
        const fallMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(solute.solidColor) });
        const fallGeo = new THREE.DodecahedronGeometry(0.06, 0);
        const fallMesh = new THREE.Mesh(fallGeo, fallMat);
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 0.8;
        fallMesh.position.set(Math.cos(angle) * dist, 6.5, Math.sin(angle) * dist);
        fallingContainerRef.current.add(fallMesh);
        fallingParticlesRef.current.push({
          x: fallMesh.position.x,
          y: fallMesh.position.y,
          z: fallMesh.position.z,
          vy: 0.1 + Math.random() * 0.08,
          mesh: fallMesh,
        });
      }

      // Update falling particles
      for (let i = fallingParticlesRef.current.length - 1; i >= 0; i--) {
        const fp = fallingParticlesRef.current[i];
        fp.y -= fp.vy;
        fp.mesh.position.y = fp.y;
        fp.mesh.rotation.x += 0.1;
        fp.mesh.rotation.y += 0.1;

        // Reached liquid surface
        if (fp.y <= 0.2 + currentH || fp.y <= 0.2) {
          fallingContainerRef.current?.remove(fp.mesh);
          fallingParticlesRef.current.splice(i, 1);
        }
      }

      // Dissolved particles movement (Brownian + Stirring Vortex)
      if (dissolvedPointsRef.current && particleVelocitiesRef.current) {
        const posAttr = dissolvedPointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const vel = particleVelocitiesRef.current;
        const activeCount = Math.floor(
          Math.min(PARTICLE_COUNT, (calculation.dissolvedMoles / (1.5 * (calculation.volumeL || 0.001) || 1)) * 300)
        );

        // Adjust visible count
        dissolvedPointsRef.current.geometry.setDrawRange(
          0,
          calculation.volumeMl > 0 ? Math.max(10, Math.min(PARTICLE_COUNT, activeCount)) : 0
        );

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          let x = posAttr.getX(i);
          let y = posAttr.getY(i);
          let z = posAttr.getZ(i);

          if (isStirring) {
            // Swirl around central Y axis (vortex)
            const angle = Math.atan2(z, x) + 0.08;
            const dist = Math.sqrt(x * x + z * z);
            x = Math.cos(angle) * dist;
            z = Math.sin(angle) * dist;
            y += vel[i * 3 + 1] * 3;
          } else {
            // Natural Brownian motion
            x += vel[i * 3] + Math.sin(elapsedTime * 2 + i) * 0.004;
            y += vel[i * 3 + 1] + Math.cos(elapsedTime * 2 + i) * 0.004;
            z += vel[i * 3 + 2] + Math.sin(elapsedTime * 1.5 + i) * 0.004;
          }

          // Boundary checks inside liquid cylinder
          const distXZ = Math.sqrt(x * x + z * z);
          if (distXZ > LIQUID_RADIUS - 0.15) {
            const factor = (LIQUID_RADIUS - 0.2) / distXZ;
            x *= factor;
            z *= factor;
            vel[i * 3] *= -1;
            vel[i * 3 + 2] *= -1;
          }

          const topY = 0.2 + currentH - 0.1;
          const bottomY = 0.35 + currentPrecipitateHeightRef.current * 0.4;
          if (y > topY) {
            y = topY - 0.05;
            vel[i * 3 + 1] *= -1;
          }
          if (y < bottomY) {
            y = bottomY + 0.05;
            vel[i * 3 + 1] *= -1;
          }

          posAttr.setXYZ(i, x, y, z);
        }
        posAttr.needsUpdate = true;
      }

      // Auto rotation
      if (autoRotate && beakerGroupRef.current) {
        beakerGroupRef.current.rotation.y += 0.006;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update camera position helper
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, distance } = cameraRotationRef.current;
    const x = distance * Math.sin(phi) * Math.sin(theta);
    const y = distance * Math.cos(phi) + 2.8;
    const z = distance * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 2.8, 0);
  };

  // Update colors & materials when solute or calculation changes
  useEffect(() => {
    if (liquidMeshRef.current && liquidTopMeniscusRef.current) {
      const col = new THREE.Color(calculation.liquidColor);
      (liquidMeshRef.current.material as THREE.MeshStandardMaterial).color = col;
      (liquidMeshRef.current.material as THREE.MeshStandardMaterial).opacity = calculation.liquidOpacity;

      (liquidTopMeniscusRef.current.material as THREE.MeshStandardMaterial).color = col;
      (liquidTopMeniscusRef.current.material as THREE.MeshStandardMaterial).opacity = Math.min(
        1,
        calculation.liquidOpacity + 0.15
      );
    }

    // Update precipitate colors
    if (precipitateGroupRef.current) {
      precipitateGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshStandardMaterial).color = new THREE.Color(solute.solidColor);
        }
      });
    }

    // Update dissolved particles colors
    if (dissolvedPointsRef.current) {
      const colorAttr = dissolvedPointsRef.current.geometry.attributes.color as THREE.BufferAttribute;
      const count = colorAttr.count;
      for (let i = 0; i < count; i++) {
        const isCation = i % 2 === 0;
        const col = new THREE.Color(isCation ? solute.cation.color : solute.anion.color);
        colorAttr.setXYZ(i, col.r, col.g, col.b);
      }
      colorAttr.needsUpdate = true;
    }
  }, [calculation, solute]);

  // Preset camera angle views
  const handleSetViewAngle = (angle: 'front' | 'iso' | 'top') => {
    setViewAngle(angle);
    if (angle === 'front') {
      cameraRotationRef.current = { theta: 0, phi: Math.PI / 2.05, distance: 12.0 };
    } else if (angle === 'iso') {
      cameraRotationRef.current = { theta: 0.55, phi: 1.25, distance: 12.5 };
    } else if (angle === 'top') {
      cameraRotationRef.current = { theta: 0.1, phi: 0.45, distance: 12.5 };
    }
    updateCameraPosition();
  };

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    cameraRotationRef.current.theta -= deltaX * 0.008;
    cameraRotationRef.current.phi = Math.max(
      0.2,
      Math.min(Math.PI / 2 - 0.05, cameraRotationRef.current.phi + deltaY * 0.008)
    );

    updateCameraPosition();
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraRotationRef.current.distance = Math.max(
      7.0,
      Math.min(18.0, cameraRotationRef.current.distance + e.deltaY * 0.01)
    );
    updateCameraPosition();
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
    const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

    cameraRotationRef.current.theta -= deltaX * 0.009;
    cameraRotationRef.current.phi = Math.max(
      0.2,
      Math.min(Math.PI / 2 - 0.05, cameraRotationRef.current.phi + deltaY * 0.009)
    );

    updateCameraPosition();
    previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="relative w-full h-[460px] sm:h-[500px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl select-none">
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Top Overlay: Beaker Status & Saturation Notice */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Solute & Volume Tag */}
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700/60 shadow-lg pointer-events-auto">
          <div
            className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
            style={{ backgroundColor: solute.colorAtSaturation }}
          />
          <span className="text-xs font-bold text-white tracking-wide">{solute.formula}</span>
          <span className="text-xs text-slate-400 font-mono">
            {calculation.volumeMl} mL H₂O
          </span>
        </div>

        {/* Dynamic Saturation Badge */}
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold shadow-lg transition-all border pointer-events-auto ${
            calculation.stateType === 'supersaturated_precipitate'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-950/40 animate-pulse'
              : calculation.stateType === 'saturated_exact'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : calculation.stateType === 'unsaturated_concentrated'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{calculation.stateLabel}</span>
        </div>
      </div>

      {/* Floating Alert: If Precipitate is Present */}
      {calculation.precipitatedMassGrams > 0.1 && (
        <div className="absolute bottom-16 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md bg-rose-950/90 backdrop-blur-md border border-rose-500/60 rounded-2xl p-3 shadow-xl text-rose-100 flex items-start gap-3 pointer-events-auto animate-bounce-subtle">
          <div className="w-7 h-7 rounded-xl bg-rose-600/30 border border-rose-400/50 flex items-center justify-center shrink-0 text-rose-300 font-bold text-sm">
            !
          </div>
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-rose-200">
              ¡Precipitado Sólido en el Fondo! ({calculation.precipitatedMassGrams.toFixed(1)} g)
            </p>
            <p className="text-rose-300/80 leading-relaxed">
              El límite de solubilidad ({calculation.maxSolubleMassGrams.toFixed(1)} g) se ha superado.
              El exceso no puede disolverse y sedimenta como cristales sólidos visibles.
            </p>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar (Stirrer, Camera Presets, Auto-rotate) */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-auto">
        {/* Stirrer Toggle */}
        <button
          onClick={onToggleStirring}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
            isStirring
              ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40 ring-2 ring-purple-500/30'
              : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
          title="Activar / Desactivar agitador magnético"
        >
          <Waves className={`w-3.5 h-3.5 ${isStirring ? 'animate-spin' : ''}`} />
          <span>{isStirring ? 'Agitando (Vórtice Activo)' : 'Agitador Magnético'}</span>
        </button>

        {/* Camera Views & Rotate */}
        <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
          <button
            onClick={() => handleSetViewAngle('front')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              viewAngle === 'front'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista Frontal (Graduación del vaso)"
          >
            Frontal
          </button>
          <button
            onClick={() => handleSetViewAngle('iso')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              viewAngle === 'iso'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista Isométrica 3D"
          >
            3D
          </button>
          <button
            onClick={() => handleSetViewAngle('top')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              viewAngle === 'top'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista Superior (Menisco)"
          >
            Cenital
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg transition-all ${
              autoRotate
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Giro automático 360°"
          >
            <Rotate3d className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
