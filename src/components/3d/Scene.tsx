'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Preload, ContactShadows } from '@react-three/drei';
import { MokaPot } from './MokaPot';

interface SceneProps {
  scrollProgress: any;
  onHoverPart?: (partName: string | null, metadata: any) => void;
  variant?: 'dark' | 'beige';
}

export function Scene({ scrollProgress, onHoverPart, variant = 'dark' }: SceneProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="relative w-full h-full bg-[#070a13]" />;
  }

  return (
    <div className="relative w-full h-full select-none outline-none">
      <Canvas
        shadows="percentage"
        camera={{ position: [0, 1.2, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        eventSource={typeof window !== 'undefined' ? document.getElementById('canvas-container') || undefined : undefined}
        className="w-full h-full pointer-events-auto"
      >
        {/* Soft Ambient Light */}
        <ambientLight intensity={0.5} />

        {/* Dynamic Directional Light casting high-quality shadows */}
        <directionalLight
          castShadow
          position={[5, 8, 5]}
          intensity={1.8}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={20}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
          shadow-bias={-0.0001}
        />

        {/* Back Light / Rim Light for depth */}
        <directionalLight position={[-5, 3, -5]} intensity={0.8} color="#93c5fd" />

        {/* 3D Model — single pot, centered, variant-controlled */}
        <Suspense fallback={null}>
          <MokaPot scrollProgress={scrollProgress} onHoverPart={onHoverPart} variant={variant} xOffset={0} />
          
          {/* Studio HDR Environment Map for metallic reflections */}
          <Environment preset="studio" />
          
          {/* Caches assets to prevent lag during interactions */}
          <Preload all />
        </Suspense>

        {/* Realistic ground contact shadow */}
        <ContactShadows
          position={[0, -4.0, 0]}
          opacity={0.5}
          scale={12}
          blur={2.5}
          far={5.0}
        />

        {/* Orbit Controls with limited tilt and disabled zoom/pan to prevent page scroll hijack */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
