'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { Scene } from '@/components/3d/Scene';
import { ContentOverlay } from '@/components/ui/ContentOverlay';
import { Coffee, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PartMetadata {
  title: string;
  desc: string;
  specs: string;
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollVal, setScrollVal] = useState(0);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [hoveredMetadata, setHoveredMetadata] = useState<PartMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<'dark' | 'beige'>('dark');

  // Hook up scroll progress on the main container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Sync scroll progress to React state for the HTML content updates
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setScrollVal(latest);
  });

  // Premium entry loading animation simulating model hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800); // 1.8s for a premium feel
    return () => clearTimeout(timer);
  }, []);

  const handleHoverPart = (partName: string | null, metadata: PartMetadata | null) => {
    setHoveredPart(partName);
    setHoveredMetadata(metadata);
  };

  return (
    <main
      ref={containerRef}
      className="relative w-full min-h-[400vh] text-white font-sans overflow-x-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      {/* Premium Loader */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 transition-colors duration-400"
            style={{ background: 'var(--bg)' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative flex items-center justify-center"
            >
              <div className="absolute w-24 h-24 rounded-full border border-amber-500/20 border-t-amber-500 animate-spin" />
              <div className="absolute w-20 h-20 rounded-full border border-rose-500/10 border-b-rose-500 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
              <div className="p-5 rounded-full bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md">
                <Coffee className="w-8 h-8 text-amber-400" />
              </div>
            </motion.div>

            <div className="text-center space-y-2">
              <h3 className="font-bold tracking-widest text-lg text-white">BIALETTI LABS</h3>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                Calibrating 3D Physics Engine...
              </p>
              <p className="text-[10px] font-mono text-zinc-600 tracking-widest">
                by{' '}
                <a
                  href="https://almonther.studio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-500/70 hover:text-amber-400 transition-colors"
                >
                  Almonther
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D SCENE BACKGROUND CONTAINER (Pinned & fills screen) */}
      <div
        id="canvas-container"
        className="fixed inset-0 w-screen h-screen z-0 pointer-events-auto"
        style={{ touchAction: 'pan-y' }}
      >
        <Scene scrollProgress={scrollYProgress} onHoverPart={handleHoverPart} variant={selectedVariant} />
      </div>

      {/* HTML OVERLAY CONTENT (Drives narrative, navigates, and shows metadata) */}
      <ContentOverlay
        scrollProgress={scrollVal}
        hoveredPartName={hoveredPart}
        hoveredPartData={hoveredMetadata}
        selectedVariant={selectedVariant}
        onVariantChange={setSelectedVariant}
      />

      {/* SCROLL SPACING SECTIONS (Allows scrolling that drives the 3D model) */}
      <div className="relative z-10 w-full pointer-events-none">
        {/* Section 1: Hero Overview */}
        <section
          id="section-hero"
          className="w-full h-screen flex items-center px-6 sm:px-12 pointer-events-none"
        >
          {/* Empty spacer to align with the fixed overlay */}
        </section>

        {/* Section 2: Anatomy */}
        <section
          id="section-anatomy"
          className="w-full h-screen flex items-center px-6 sm:px-12 pointer-events-none"
        >
          {/* Spacer */}
        </section>

        {/* Section 3: Physics */}
        <section
          id="section-physics"
          className="w-full h-screen flex items-center px-6 sm:px-12 pointer-events-none"
        >
          {/* Spacer */}
        </section>

        {/* Section 4: Brew */}
        <section
          id="section-brew"
          className="w-full h-screen flex items-center px-6 sm:px-12 pointer-events-none"
        >
          {/* Spacer */}
        </section>
      </div>
    </main>
  );
}
