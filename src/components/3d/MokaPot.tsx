'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion-3d';
import { useTransform, useSpring } from 'framer-motion';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface PartMetadata {
  title: string;
  desc: string;
  specs: string;
}

// Graphics helper to dynamically split a combined BufferGeometry along a height axis (Z in local space)
function splitGeometry(geometry: THREE.BufferGeometry, threshold: number) {
  const nonIndexed = geometry.toNonIndexed();
  const posAttr = nonIndexed.getAttribute('position') as THREE.BufferAttribute;
  const normAttr = nonIndexed.getAttribute('normal') as THREE.BufferAttribute;
  const uvAttr = nonIndexed.getAttribute('uv') as THREE.BufferAttribute;
  const tanAttr = nonIndexed.getAttribute('tangent') as THREE.BufferAttribute;

  const basePositions: number[] = [];
  const baseNormals: number[] = [];
  const baseUvs: number[] = [];
  const baseTangents: number[] = [];

  const colPositions: number[] = [];
  const colNormals: number[] = [];
  const colUvs: number[] = [];
  const colTangents: number[] = [];

  const vCount = posAttr.count;

  for (let i = 0; i < vCount; i += 3) {
    const z0 = posAttr.getZ(i);
    const z1 = posAttr.getZ(i + 1);
    const z2 = posAttr.getZ(i + 2);

    const avgZ = (z0 + z1 + z2) / 3;

    const targetPos = avgZ < threshold ? basePositions : colPositions;
    const targetNorm = avgZ < threshold ? baseNormals : colNormals;
    const targetUv = avgZ < threshold ? baseUvs : colUvs;
    const targetTan = avgZ < threshold ? baseTangents : colTangents;

    for (let j = 0; j < 3; j++) {
      const idx = i + j;
      targetPos.push(posAttr.getX(idx), posAttr.getY(idx), posAttr.getZ(idx));
      targetNorm.push(normAttr.getX(idx), normAttr.getY(idx), normAttr.getZ(idx));

      if (uvAttr) {
        targetUv.push(uvAttr.getX(idx), uvAttr.getY(idx));
      }
      if (tanAttr) {
        targetTan.push(tanAttr.getX(idx), tanAttr.getY(idx), tanAttr.getZ(idx), tanAttr.getW(idx));
      }
    }
  }

  const baseGeo = new THREE.BufferGeometry();
  baseGeo.setAttribute('position', new THREE.Float32BufferAttribute(basePositions, 3));
  baseGeo.setAttribute('normal', new THREE.Float32BufferAttribute(baseNormals, 3));
  if (uvAttr) {
    baseGeo.setAttribute('uv', new THREE.Float32BufferAttribute(baseUvs, 2));
  }
  if (tanAttr) {
    baseGeo.setAttribute('tangent', new THREE.Float32BufferAttribute(baseTangents, 4));
  }

  const colGeo = new THREE.BufferGeometry();
  colGeo.setAttribute('position', new THREE.Float32BufferAttribute(colPositions, 3));
  colGeo.setAttribute('normal', new THREE.Float32BufferAttribute(colNormals, 3));
  if (uvAttr) {
    colGeo.setAttribute('uv', new THREE.Float32BufferAttribute(colUvs, 2));
  }
  if (tanAttr) {
    colGeo.setAttribute('tangent', new THREE.Float32BufferAttribute(colTangents, 4));
  }

  baseGeo.computeBoundingSphere();
  baseGeo.computeBoundingBox();
  colGeo.computeBoundingSphere();
  colGeo.computeBoundingBox();

  return { baseGeo, colGeo };
}

// Pre-instantiated WebGL assets for procedural coffee beans to optimize memory and GPU performance
const coffeeBeanMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#4a2c11"), // Rich roasted dark espresso brown
  roughness: 0.65,
  metalness: 0.1,
});

const coffeeBeanGeometry = new THREE.SphereGeometry(0.024, 16, 16);

interface CoffeeBeanProps {
  position: [number, number, number];
  randomRotation: [number, number, number];
  speed: number;
  orbitRadius: number;
  scrollProgress: any;
}

// Self-animating coffee bean component
const CoffeeBean = ({ position: initialPos, randomRotation, speed, orbitRadius, scrollProgress }: CoffeeBeanProps) => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const scrollVal = scrollProgress.get();

    // Beans burst outwards radially on scroll. 
    // At scroll = 0, spread is 0 (hidden inside the filter basket).
    const spread = scrollVal;

    // Zero-gravity orbital physics
    const angle = t * speed * 0.3 + initialPos[0] * 50; // Phase shift based on initial position
    const x = Math.cos(angle) * orbitRadius * spread;
    const z = Math.sin(angle) * orbitRadius * spread;

    // Gentle float upwards and micro sine-wave drift
    const y = initialPos[1] + (scrollVal * 0.12) + Math.sin(t * speed * 1.5 + initialPos[2] * 10) * 0.015;

    ref.current.position.set(x, y, z);

    // Dynamic spin
    ref.current.rotation.x = randomRotation[0] + t * speed * 0.8;
    ref.current.rotation.y = randomRotation[1] + t * speed * 0.5;
    ref.current.rotation.z = randomRotation[2];

    // Smooth scale-in as the pot disassembles
    const scale = Math.min(scrollVal * 2.0, 1.0);
    ref.current.scale.set(scale, scale, scale);
  });

  return (
    <group ref={ref}>
      {/* Form a realistic coffee bean with a central crease using two squashed half-spheres */}
      <group scale={[0.22, 0.22, 0.22]}>
        {/* Left lobe */}
        <mesh
          geometry={coffeeBeanGeometry}
          material={coffeeBeanMaterial}
          position={[-0.005, 0, 0]}
          scale={[0.78, 0.82, 1.4]}
          rotation={[0, 0, 0.12]}
          castShadow
        />
        {/* Right lobe */}
        <mesh
          geometry={coffeeBeanGeometry}
          material={coffeeBeanMaterial}
          position={[0.005, 0, 0]}
          scale={[0.78, 0.82, 1.4]}
          rotation={[0, 0, -0.12]}
          castShadow
        />
      </group>
    </group>
  );
};

interface MokaPotProps {
  scrollProgress: any;
  onHoverPart?: (partName: string | null, metadata: PartMetadata | null) => void;
}

export function MokaPot({ scrollProgress, onHoverPart }: MokaPotProps) {
  const [activeHover, setActiveHover] = useState<string | null>(null);

  // Load user's high-quality Moka Pot model
  const { nodes, materials } = useGLTF('/moka_pot/scene.gltf') as any;

  // Refs for useFrame organic float and mouse reaction
  const baseRef = useRef<THREE.Group>(null);
  const filterRef = useRef<THREE.Group>(null);
  const gasketRef = useRef<THREE.Group>(null);
  const collectorRef = useRef<THREE.Group>(null);
  const parentRef = useRef<THREE.Group>(null);
  const activeTimeRef = useRef(0); // Tracks real elapsed time after mounting and GLTF load

  // Framer Motion spring config for smooth transitions
  const springConfig = { mass: 1, stiffness: 70, damping: 20 };

  // 1. BASE ANIMATION (moves down slightly in exploded view)
  const baseYRaw = useTransform(scrollProgress, [0, 0.4, 0.8], [0, -0.02, -0.04]);
  const baseY = useSpring(baseYRaw, springConfig);

  // 2. FILTER BASKET ANIMATION (slides straight up out of the base)
  const filterYRaw = useTransform(scrollProgress, [0.1, 0.5, 0.8], [0.09, 0.12, 0.15]);
  const filterY = useSpring(filterYRaw, springConfig);

  // 3. GASKET ANIMATION (slides up between filter and collector)
  const gasketYRaw = useTransform(scrollProgress, [0.15, 0.55, 0.8], [0.095, 0.14, 0.18]);
  const gasketY = useSpring(gasketYRaw, springConfig);

  // 4. COLLECTOR / COVER ANIMATION (floats high and tilts)
  const collectorYRaw = useTransform(scrollProgress, [0.2, 0.6, 0.8], [0, 0.08, 0.15]);
  const collectorY = useSpring(collectorYRaw, springConfig);
  const collectorRotXRaw = useTransform(scrollProgress, [0.2, 0.6, 0.8], [0, 0.15, 0.22]);
  const collectorRotX = useSpring(collectorRotXRaw, springConfig);
  const collectorRotZRaw = useTransform(scrollProgress, [0.2, 0.6, 0.8], [0, -0.03, -0.06]);
  const collectorRotZ = useSpring(collectorRotZRaw, springConfig);

  // Organic floating and mouse reactivity using useFrame
  useFrame((state, delta) => {
    activeTimeRef.current += delta;
    const t = activeTimeRef.current;
    const mouseX = state.pointer.x;
    const mouseY = state.pointer.y;
    const aspect = state.viewport.aspect;

    const scrollVal = scrollProgress.get();

    // A. Dynamic responsive scaling based on device aspect ratio (narrow screens get scaled down)
    const scale = aspect < 1 ? 8.5 : 12.0;
    if (parentRef.current) {
      parentRef.current.scale.set(scale, scale, scale);

      // B. Dynamic Y translation of parent group to keep the center of deconstructed pot exactly at Y = 0
      const localCenter = THREE.MathUtils.lerp(0.09, 0.154, scrollVal);
      parentRef.current.position.y = -localCenter * scale;

      // C. Swipe teaser animation on load (simulates a swipe to the right and holds the angle)
      let teaserY = 0;
      let teaserX = 0;
      if (t > 0.4) {
        const progress = Math.min((t - 0.4) / 1.8, 1.0);
        // Cubic ease-out transition
        const easeOut = 1 - Math.pow(1 - progress, 3);
        teaserY = -0.7 * easeOut;
        teaserX = 0.12 * easeOut;
      }
      parentRef.current.rotation.y = teaserY;
      parentRef.current.rotation.x = teaserX;
    }

    // C. Dynamic camera zoom (Z-axis) and vertical position (Y-axis) to frame the pot as it explodes
    const baseZ = aspect < 1 ? 6.5 : 5;
    const zoomOut = aspect < 1 ? 3.0 : 1.6;
    const targetZ = baseZ + scrollVal * zoomOut;
    const targetY = aspect < 1 ? 1.2 + scrollVal * 0.6 : 0.8 + scrollVal * 0.4;

    state.camera.position.z += (targetZ - state.camera.position.z) * 0.1;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.1;

    // D. Lock OrbitControls target to world Y=0 (the exact center of the pot)
    const controls = state.controls as any;
    if (controls) {
      controls.target.set(0, 0, 0);
    }

    // Float intensity scales up after 25% scroll
    const floatIntensity = Math.min(Math.max((scrollVal - 0.25) * 1.6, 0), 1);

    if (floatIntensity > 0) {
      // Base: slow heavy drift
      if (baseRef.current) {
        baseRef.current.position.x += (mouseX * 0.02 * floatIntensity - baseRef.current.position.x) * 0.05;
        baseRef.current.position.z += (mouseY * 0.02 * floatIntensity - baseRef.current.position.z) * 0.05;
        baseRef.current.position.y = Math.sin(t * 0.8) * 0.005 * floatIntensity;
        baseRef.current.rotation.x = Math.sin(t * 0.2) * 0.01 * floatIntensity;
        baseRef.current.rotation.z = Math.cos(t * 0.25) * 0.01 * floatIntensity;
      }

      // Filter Basket: floats higher and oscillates  
      if (filterRef.current) {
        filterRef.current.position.x += (mouseX * 0.03 * floatIntensity - filterRef.current.position.x) * 0.05;
        filterRef.current.position.z += (mouseY * 0.03 * floatIntensity - filterRef.current.position.z) * 0.05;
        filterRef.current.position.y = Math.sin(t * 1.1 + 1.2) * 0.01 * floatIntensity;
        filterRef.current.rotation.x = Math.sin(t * 0.25 + 1.0) * 0.015 * floatIntensity;
        filterRef.current.rotation.z = Math.cos(t * 0.2 + 0.5) * 0.015 * floatIntensity;
      }

      // Gasket: floats lightweight
      if (gasketRef.current) {
        gasketRef.current.position.x += (mouseX * 0.035 * floatIntensity - gasketRef.current.position.x) * 0.05;
        gasketRef.current.position.z += (mouseY * 0.035 * floatIntensity - gasketRef.current.position.z) * 0.05;
        gasketRef.current.position.y = Math.sin(t * 0.95 + 2.5) * 0.012 * floatIntensity;
        gasketRef.current.rotation.x = Math.cos(t * 0.22 + 2.0) * 0.015 * floatIntensity;
        gasketRef.current.rotation.z = Math.sin(t * 0.26 + 1.5) * 0.015 * floatIntensity;
      }

      // Collector: floats high, large mass drift
      if (collectorRef.current) {
        collectorRef.current.position.x += (mouseX * 0.04 * floatIntensity - collectorRef.current.position.x) * 0.05;
        collectorRef.current.position.z += (mouseY * 0.04 * floatIntensity - collectorRef.current.position.z) * 0.05;
        collectorRef.current.position.y = Math.sin(t * 0.7 + 3.8) * 0.012 * floatIntensity;
        collectorRef.current.rotation.x = Math.sin(t * 0.18 + 3.0) * 0.012 * floatIntensity;
        collectorRef.current.rotation.z = Math.cos(t * 0.24 + 2.5) * 0.012 * floatIntensity;
      }
    } else {
      // Re-align perfectly when scroll is at 0
      if (baseRef.current) {
        baseRef.current.position.set(0, 0, 0);
        baseRef.current.rotation.set(0, 0, 0);
      }
      if (filterRef.current) {
        filterRef.current.position.set(0, 0, 0);
        filterRef.current.rotation.set(0, 0, 0);
      }
      if (gasketRef.current) {
        gasketRef.current.position.set(0, 0, 0);
        gasketRef.current.rotation.set(0, 0, 0);
      }
      if (collectorRef.current) {
        collectorRef.current.position.set(0, 0, 0);
        collectorRef.current.rotation.set(0, 0, 0);
      }
    }
  });

  // TECHNICAL METADATA FOR HOVER OVERLAYS
  const metadataMap: Record<string, PartMetadata> = {
    base: {
      title: 'Heating Chamber (Base)',
      desc: 'Heavy-gauge aluminum water tank. Houses the safety valve and absorbs heat to build vapor pressure.',
      specs: 'Capacity: 150ml | Output Pressure: ~1.5 bar | Safety Release: Brass spring valve',
    },
    filter: {
      title: 'Filter Basket',
      desc: 'Funnel-shaped coffee grounds container. Pressurized hot water is forced upward through the coffee cake.',
      specs: 'Coffee Capacity: 15-18g | Grind Size: Medium-Fine | Funnel Length: 75mm',
    },
    gasket: {
      title: 'Gasket & Filter Plate',
      desc: 'High-temperature silicone seal and stainless steel micro-filter plate. Prevents pressure bypass.',
      specs: 'Material: Food-safe Silicone & SS304 | Mesh Pore Size: 200 microns',
    },
    collector: {
      title: 'Collector Assembly (Upper Pot)',
      desc: 'The upper chamber where brewed espresso accumulates. Includes the aluminum body, aroma-sealing lid, and heat-resistant handle.',
      specs: 'Volume: 130ml | Material: Premium Aluminum Alloy | Handle: Insulated Bakelite',
    },
  };

  const handleHoverChange = (partName: string | null) => {
    setActiveHover(partName);
    if (partName && onHoverPart) {
      onHoverPart(partName, metadataMap[partName]);
    } else if (onHoverPart) {
      onHoverPart(null, null);
    }
  };

  // Materials definitions for procedural parts and highlights
  const metalMaterial = React.useMemo(() => new THREE.MeshStandardMaterial({
    color: "#e2e8f0",
    metalness: 0.92,
    roughness: 0.18,
  }), []);

  const gasketMaterial = React.useMemo(() => new THREE.MeshStandardMaterial({
    color: "#f4f4f5",
    metalness: 0.05,
    roughness: 0.8,
  }), []);

  const activeHoverMaterial = React.useMemo(() => new THREE.MeshStandardMaterial({
    color: "#f43f5e",
    metalness: 0.5,
    roughness: 0.1,
    emissive: "#f43f5e",
    emissiveIntensity: 0.5,
  }), []);

  // Procedural canvas-based micro-perforated texture for the steel filter plate
  const filterTexture = React.useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Fill background (steel plate surface)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    // Draw concentric rings of tiny filter holes
    ctx.fillStyle = '#1e293b'; // Slate dark holes (gives a nice depth color)
    const centerX = 128;
    const centerY = 128;
    
    // Ring radii from center to edge
    const rings = [15, 30, 45, 60, 75, 90, 105];
    rings.forEach((r) => {
      const circumference = 2 * Math.PI * r;
      // Spacing of approx 9 pixels between holes on circumference
      const count = Math.floor(circumference / 9);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  const filterPlateMaterial = React.useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: "#cbd5e1",
      metalness: 0.95,
      roughness: 0.22,
    });
    if (filterTexture) {
      mat.map = filterTexture;
      mat.bumpMap = filterTexture;
      mat.bumpScale = -0.0012; // Inward bump indent
    }
    return mat;
  }, [filterTexture]);

  // Split the combined heating chamber and upper chamber geometries
  const { baseGeo, colGeo } = React.useMemo(() => {
    return splitGeometry(nodes['moka-pot_base_moka-pot-material1_0'].geometry, 0.045);
  }, [nodes]);

  // Procedural data for 22 floating coffee beans
  const beansData = React.useMemo(() => {
    const beans = [];
    for (let i = 0; i < 22; i++) {
      beans.push({
        id: i,
        initialPos: [
          (Math.random() - 0.5) * 0.03,
          0.09 + (Math.random() - 0.5) * 0.02, // Clustered inside the filter basket initially
          (Math.random() - 0.5) * 0.03,
        ] as [number, number, number],
        randomRotation: [
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
        ] as [number, number, number],
        speed: 0.3 + Math.random() * 0.5,
        orbitRadius: 0.15 + Math.random() * 0.16, // Orbital radius at full expansion
      });
    }
    return beans;
  }, []);

  return (
    <group ref={parentRef}>
      {/* 1. BASE (Heating Chamber) */}
      <motion.group {...({ y: baseY } as any)}>
        <group ref={baseRef}>
          <mesh
            geometry={baseGeo}
            material={activeHover === 'base' ? activeHoverMaterial : materials['moka-pot-material1']}
            position={[0, 0.02419, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            castShadow
            receiveShadow
            onPointerOver={(e) => {
              e.stopPropagation();
              handleHoverChange('base');
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              handleHoverChange(null);
            }}
          />
        </group>
      </motion.group>

      {/* 2. FILTER BASKET (Procedural, nested between base and collector) */}
      <motion.group {...({ y: filterY } as any)}>
        <group ref={filterRef}>
          <group
            onPointerOver={(e) => {
              e.stopPropagation();
              handleHoverChange('filter');
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              handleHoverChange(null);
            }}
          >
            {/* Funnel cup */}
            <mesh
              position={[0, 0, 0]}
              castShadow
              material={activeHover === 'filter' ? activeHoverMaterial : metalMaterial}
            >
              <cylinderGeometry args={[0.048, 0.045, 0.015, 32]} />
            </mesh>
            {/* Funnel rim */}
            <mesh
              position={[0, 0.0075, 0]}
              material={activeHover === 'filter' ? activeHoverMaterial : metalMaterial}
            >
              <cylinderGeometry args={[0.05, 0.05, 0.0015, 32]} />
            </mesh>
            {/* Funnel tube extending down */}
            <mesh
              position={[0, -0.04, 0]}
              castShadow
              material={activeHover === 'filter' ? activeHoverMaterial : metalMaterial}
            >
              <cylinderGeometry args={[0.006, 0.006, 0.065, 16]} />
            </mesh>
          </group>
        </group>
      </motion.group>

      {/* 3. GASKET (Procedural, nested between base and collector) */}
      <motion.group {...({ y: gasketY } as any)}>
        <group ref={gasketRef}>
          <mesh
            position={[0, 0, 0]}
            material={activeHover === 'gasket' ? activeHoverMaterial : gasketMaterial}
            onPointerOver={(e) => {
              e.stopPropagation();
              handleHoverChange('gasket');
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              handleHoverChange(null);
            }}
          >
            <cylinderGeometry args={[0.051, 0.051, 0.003, 32]} />
          </mesh>
          {/* Steel filter plate sitting inside gasket */}
          <group position={[0, 0.001, 0]}>
            {/* Flat top face with uniform normals to prevent radial reflection artifacts (fan look) */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              material={activeHover === 'gasket' ? activeHoverMaterial : filterPlateMaterial}
              onPointerOver={(e) => {
                e.stopPropagation();
                handleHoverChange('gasket');
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                handleHoverChange(null);
              }}
              receiveShadow
            >
              <circleGeometry args={[0.047, 32]} />
            </mesh>
            {/* Open-ended cylindrical side wall to give 3D depth without cap normal bleeding */}
            <mesh
              position={[0, -0.0005, 0]}
              material={activeHover === 'gasket' ? activeHoverMaterial : metalMaterial}
            >
              <cylinderGeometry args={[0.047, 0.047, 0.001, 32, 1, true]} />
            </mesh>
          </group>
        </group>
      </motion.group>

      {/* 4. COLLECTOR (Upper Coffee Pot & Lid & Handle Combined GLTF) */}
      <motion.group {...({ y: collectorY, rotationX: collectorRotX, rotationZ: collectorRotZ } as any)}>
        <group ref={collectorRef}>
          {/* Main Upper Chamber (Split from the base geometry) */}
          <mesh
            geometry={colGeo}
            material={activeHover === 'collector' ? activeHoverMaterial : materials['moka-pot-material1']}
            position={[0, 0.02419, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            castShadow
            receiveShadow
            onPointerOver={(e) => {
              e.stopPropagation();
              handleHoverChange('collector');
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              handleHoverChange(null);
            }}
          />
          {/* Lid (Original cover mesh) */}
          <mesh
            geometry={nodes['moka-pot_cover_moka-pot-material1_0'].geometry}
            material={activeHover === 'collector' ? activeHoverMaterial : materials['moka-pot-material1']}
            position={[0, 0.15596, -0.05453]}
            rotation={[-2.356, 0, 0]}
            castShadow
            receiveShadow
            onPointerOver={(e) => {
              e.stopPropagation();
              handleHoverChange('collector');
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              handleHoverChange(null);
            }}
          />
        </group>
      </motion.group>

      {/* 5. FLOATING COFFEE BEANS (burst out during deconstruction) */}
      {beansData.map((bean) => (
        <CoffeeBean
          key={bean.id}
          position={bean.initialPos}
          randomRotation={bean.randomRotation}
          speed={bean.speed}
          orbitRadius={bean.orbitRadius}
          scrollProgress={scrollProgress}
        />
      ))}
    </group>
  );
}

useGLTF.preload('/moka_pot/scene.gltf');
