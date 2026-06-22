'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, ArrowRight, Activity, Cpu, Sparkles, Layers, X, Volume2, BookOpen, Play, VolumeX, Sun, Moon } from 'lucide-react';

interface PartMetadata {
  title: string;
  desc: string;
  specs: string;
}

interface ContentOverlayProps {
  scrollProgress: number;
  hoveredPartName: string | null;
  hoveredPartData: PartMetadata | null;
  selectedVariant: 'dark' | 'beige';
  onVariantChange: (v: 'dark' | 'beige') => void;
}

export function ContentOverlay({
  scrollProgress,
  hoveredPartName,
  hoveredPartData,
  selectedVariant,
  onVariantChange,
}: ContentOverlayProps) {
  // Determine current active section based on scroll progress (0 to 1)
  const getActiveSection = () => {
    if (scrollProgress < 0.25) return 0;
    if (scrollProgress < 0.55) return 1;
    if (scrollProgress < 0.85) return 2;
    return 3;
  };

  const activeSection = getActiveSection();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window));
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Theme toggle
  const [isLight, setIsLight] = useState(false);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  // Modals state & procedural sound simulation
  const [activeModal, setActiveModal] = useState<'history' | 'acoustics' | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const audioSourceRef = React.useRef<any>(null);
  const bubblesIntervalRef = React.useRef<any>(null);

  const startBrewingSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // 1. STEAM PRESSURE HISS GENERATION
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Bandpass filter centered at 3200Hz to shape the hiss
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(3200, ctx.currentTime);
      bandpass.Q.setValueAtTime(1.2, ctx.currentTime);

      // Highpass filter to cut out low rumbles, keeping only the steam hiss
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(1800, ctx.currentTime);

      const steamGain = ctx.createGain();
      // Fade in nicely
      steamGain.gain.setValueAtTime(0, ctx.currentTime);
      steamGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.3);

      whiteNoise.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(steamGain);
      steamGain.connect(ctx.destination);
      whiteNoise.start();
      audioSourceRef.current = whiteNoise;

      setIsPlayingAudio(true);
    } catch (e) {
      console.error('AudioContext error:', e);
    }
  };

  const stopBrewingSound = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) { }
      audioSourceRef.current = null;
    }
    if (bubblesIntervalRef.current) {
      clearInterval(bubblesIntervalRef.current);
      bubblesIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) { }
      audioCtxRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  // Close popovers when clicking outside
  React.useEffect(() => {
    if (!activeModal) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.popover-card') && !target.closest('.footer-trigger')) {
        stopBrewingSound();
        setActiveModal(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeModal]);

  const sections = [
    { id: 'hero', label: 'Overview' },
    { id: 'anatomy', label: 'Anatomy' },
    { id: 'physics', label: 'Physics' },
    { id: 'brew', label: 'Brew' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 sm:p-12 select-none w-screen h-screen">
      {/* 1. HEADER */}
      <header className="w-full flex justify-between items-center pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/10 shadow-lg flex items-center justify-center p-1.5 backdrop-blur-sm">
            <img src="/moka_logo.png" alt="Moka Pot Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-white font-bold tracking-widest text-lg font-sans leading-none block">BIALETTI</span>
            <span className="text-amber-500 text-[9px] font-bold block tracking-widest uppercase mt-0.5">Almonther LABS // 3D</span>
          </div>
        </motion.div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Engine Pill */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md"
            style={{ background: 'var(--pill-bg)', border: '1px solid var(--pill-border)' }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>Engine: R3F + Framer 3D</span>
          </motion.div>

          {/* Theme Toggle */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onClick={() => setIsLight(v => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 cursor-pointer"
            style={{ background: 'var(--pill-bg)', border: '1px solid var(--pill-border)' }}
            aria-label="Toggle theme"
          >
            {isLight
              ? <Moon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              : <Sun className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            }
          </motion.button>
        </div>
      </header>

      {/* 2. SIDE NAVIGATION DOTS */}
      <div className="fixed right-6 sm:right-12 top-1/2 -translate-y-1/2 flex flex-col gap-6 pointer-events-auto z-20">
        {sections.map((sec, idx) => {
          const isActive = idx === activeSection;
          return (
            <button
              key={sec.id}
              id={`nav-dot-${sec.id}`}
              onClick={() => {
                // Scroll smoothly to the target section
                const el = document.getElementById(`section-${sec.id}`);
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group flex items-center justify-end gap-3 focus:outline-none cursor-pointer"
            >
              <span className={`text-[10px] font-mono tracking-wider transition-all duration-300 uppercase ${isActive ? 'text-amber-400 opacity-100' : 'text-zinc-500 opacity-0 group-hover:opacity-100'
                }`}>
                {sec.label}
              </span>
              <div className="relative flex items-center justify-center">
                <motion.div
                  className={`w-3 h-3 rounded-full border transition-all duration-300 ${isActive ? 'border-amber-400 bg-amber-400' : 'border-zinc-600 bg-transparent group-hover:border-zinc-400'
                    }`}
                  layoutId={isActive ? 'activeDotOuter' : undefined}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
                {isActive && (
                  <motion.div
                    className="absolute w-6 h-6 rounded-full border border-amber-400/30"
                    layoutId="activeDotRing"
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. CENTER / BOTTOM CONTENT PANEL (Responsive Layout) */}
      <div className="w-full grow flex flex-col justify-end max-w-xl pointer-events-none">
        <div className="relative min-h-[180px] sm:min-h-[260px] flex flex-col justify-end pb-12 sm:pb-20">
          <AnimatePresence mode="wait">
            {activeSection === 0 && (
              <motion.div
                key="sec-hero"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="space-y-2.5 sm:space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-semibold tracking-wider font-mono">
                  <Coffee className="w-3.5 h-3.5" />
                  THE DESIGN CLASSIC
                </div>
                <h1 className="text-2xl sm:text-6xl font-black text-white tracking-tight leading-none uppercase">
                  MOKA <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-rose-400 to-rose-600">
                    EXPRESS
                  </span>
                </h1>
                <p className="text-zinc-400 text-xs sm:text-base leading-relaxed">
                  Crafting the art of Italian coffee since 1933. Scroll down to see the design deconstruct, float, and defy gravity.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-amber-500/70 font-semibold font-mono animate-pulse pt-1">
                  <span>Scroll to disassemble</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-90" />
                </div>

                {/* Color variant swatches */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase">Finish</span>
                  <button
                    onClick={() => onVariantChange('dark')}
                    title="Dark Metallic"
                    className="w-5 h-5 rounded-full border-2 transition-all duration-200 cursor-pointer pointer-events-auto"
                    style={{
                      background: '#2a2a2a',
                      borderColor: selectedVariant === 'dark' ? '#f59e0b' : 'transparent',
                      boxShadow: selectedVariant === 'dark' ? '0 0 0 1px #f59e0b' : 'none',
                    }}
                  />
                  <button
                    onClick={() => onVariantChange('beige')}
                    title="Sandy Beige"
                    className="w-5 h-5 rounded-full border-2 transition-all duration-200 cursor-pointer pointer-events-auto"
                    style={{
                      background: '#C8A882',
                      borderColor: selectedVariant === 'beige' ? '#f59e0b' : 'transparent',
                      boxShadow: selectedVariant === 'beige' ? '0 0 0 1px #f59e0b' : 'none',
                    }}
                  />
                </div>
              </motion.div>
            )}

            {activeSection === 1 && (
              <motion.div
                key="sec-anatomy"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="space-y-2.5 sm:space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] sm:text-xs font-semibold tracking-wider font-mono">
                  <Layers className="w-3.5 h-3.5" />
                  EXPLODED ANATOMY
                </div>
                <h2 className="text-2xl sm:text-5xl font-black text-white tracking-tight leading-none uppercase">
                  DECONSTRUCTED <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-400 to-amber-500">
                    ENGINEERING
                  </span>
                </h2>
                <p className="text-zinc-400 text-xs sm:text-base leading-relaxed">
                  Observe the intricate internal components. An elegant configuration of chambers, filters, and gaskets working in fluid harmony.
                </p>
              </motion.div>
            )}

            {activeSection === 2 && (
              <motion.div
                key="sec-physics"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="space-y-2.5 sm:space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-semibold tracking-wider font-mono">
                  <Cpu className="w-3.5 h-3.5" />
                  ANTI-GRAVITY EXTRACTION
                </div>
                <h2 className="text-2xl sm:text-5xl font-black text-white tracking-tight leading-none uppercase">
                  WEIGHTLESS <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-rose-500 to-purple-600">
                    EXTRACTION
                  </span>
                </h2>
                <p className="text-zinc-400 text-xs sm:text-base leading-relaxed">
                  {isMobile ? (
                    "Tap on the floating parts to inspect materials and micro-mechanics. Swipe and drag to rotate the view."
                  ) : (
                    "Hover over the floating parts to inspect materials and micro-mechanics. Rotate and tilt the view using your mouse."
                  )}
                </p>
              </motion.div>
            )}

            {activeSection === 3 && (
              <motion.div
                key="sec-brew"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="space-y-2.5 sm:space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-semibold tracking-wider font-mono">
                  <Activity className="w-3.5 h-3.5" />
                  PERFECT SYNERGY
                </div>
                <h2 className="text-2xl sm:text-5xl font-black text-white tracking-tight leading-none uppercase">
                  PURE COFFEE <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-500">
                    ESSENCE
                  </span>
                </h2>
                <p className="text-zinc-400 text-xs sm:text-base leading-relaxed">
                  A perfect union of physics, thermodynamics, and aesthetic design. Brew espresso at home that honors Italian tradition.
                </p>
                <button
                  id="cta-restart"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex items-center gap-2 text-[10px] sm:text-xs text-amber-500/70 font-semibold font-mono tracking-widest uppercase hover:text-amber-400 transition-colors cursor-pointer pointer-events-auto pt-1 animate-pulse"
                >
                  <span>↺ Restart Experience</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. HOVER TECHNICAL OVERLAY CARD */}
      <div className="absolute top-24 left-6 sm:left-12 max-w-[280px] sm:max-w-[340px] pointer-events-auto z-30">
        <AnimatePresence>
          {hoveredPartName && hoveredPartData ? (
            <motion.div
              id="spec-card"
              initial={{ opacity: 0, x: -30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="backdrop-blur-xl bg-black/40 border border-white/15 p-5 rounded-2xl shadow-2xl overflow-hidden relative"
            >
              {/* Gold/amber highlight glow */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-amber-500 via-rose-500 to-rose-600" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-semibold">
                    Interactive Spec
                  </span>
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono bg-white/10 text-white font-bold uppercase">
                    {hoveredPartName}
                  </span>
                </div>
                <h3 className="text-white text-base font-bold tracking-tight">
                  {hoveredPartData.title}
                </h3>
                <p className="text-zinc-300 text-xs leading-relaxed">
                  {hoveredPartData.desc}
                </p>
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <span className="text-[9px] font-mono text-zinc-400 tracking-wider block uppercase">
                    Technical Specifications
                  </span>
                  <span className="text-[11px] font-semibold text-amber-300 leading-snug font-mono block">
                    {hoveredPartData.specs}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            // Show subtle prompt when in anti-gravity phase and no part is hovered
            activeSection >= 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                exit={{ opacity: 0 }}
                className="backdrop-blur-md bg-white/5 border border-white/5 px-4 py-3 rounded-xl flex items-center gap-3 text-zinc-400 text-xs"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="font-mono">Hover over the floating parts to inspect specifications</span>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* 5. FOOTER INFO */}
      <footer className="w-full flex justify-between items-center text-[10px] text-zinc-500 font-mono tracking-widest mt-auto pointer-events-auto relative">
        <a
          href="https://almonther.studio/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-rose-400 transition-colors uppercase"
        >
          My Bialetti Lab — Made with ♥ by Almonther
        </a>
        <div className="flex gap-6 relative">

          {/* Popover Card */}
          <AnimatePresence>
            {activeModal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="popover-card absolute bottom-full right-0 mb-3 w-80 sm:w-96 max-w-[calc(100vw-2.5rem)] backdrop-blur-xl bg-black/90 border border-white/10 p-5 rounded-2xl shadow-2xl z-50 text-left pointer-events-auto select-text"
              >
                {activeModal === 'history' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-xs text-white uppercase tracking-wider font-sans">Moka History</span>
                      </div>
                      <button
                        onClick={() => setActiveModal(null)}
                        className="text-zinc-400 hover:text-white cursor-pointer transition-colors outline-none"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-3.5 relative before:absolute before:left-[5px] before:top-1.5 before:bottom-1 before:w-px before:bg-white/15 pl-1 text-[11px] leading-relaxed text-zinc-300 font-sans">
                      <div className="relative pl-4">
                        <div className="absolute left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="font-mono text-amber-400 font-bold mr-1.5">1933 — INVENTION</span>
                        <p className="mt-0.5 text-zinc-400">Alfonso Bialetti designs the Moka Express in Italy, inspired by a laundry washer.</p>
                      </div>
                      <div className="relative pl-4">
                        <div className="absolute left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span className="font-mono text-rose-400 font-bold mr-1.5">1953 — BRAND ICON</span>
                        <p className="mt-0.5 text-zinc-400">Renato Bialetti introduces the mascot "L'omino con i baffi" (the mustache man).</p>
                      </div>
                      <div className="relative pl-4">
                        <div className="absolute left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span className="font-mono text-purple-400 font-bold mr-1.5">TODAY — MUSEUMS</span>
                        <p className="mt-0.5 text-zinc-400">Permanently exhibited at MoMA NY as an Art Deco industrial masterpiece.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-rose-400" />
                        <span className="font-bold text-xs text-white uppercase tracking-wider font-sans">Acoustic Guide</span>
                      </div>
                      <button
                        onClick={() => { stopBrewingSound(); setActiveModal(null); }}
                        className="text-zinc-400 hover:text-white cursor-pointer transition-colors outline-none"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                      Acoustic feedback is essential. The transition from silent heating to steam hiss indicates the water has risen, and the gurgling steam pressure tells you to **kill the heat immediately**.
                    </p>

                    {/* Simple Sound Player with play button and vibrating line */}
                    <div className="flex items-center gap-4 py-2 px-3 rounded-xl bg-zinc-950/50 border border-white/5">
                      <button
                        onClick={isPlayingAudio ? stopBrewingSound : startBrewingSound}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-black hover:bg-zinc-200 transition-all cursor-pointer pointer-events-auto outline-none shrink-0"
                      >
                        {isPlayingAudio ? (
                          <X className="w-3.5 h-3.5 text-black" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-black translate-x-px" />
                        )}
                      </button>

                      {/* Vibrating line representation */}
                      <div className="flex items-center h-4 grow overflow-hidden gap-[2.5px]">
                        <style>{`
                          @keyframes steamVibrate {
                            0% { transform: scaleY(0.25); }
                            100% { transform: scaleY(1.8); }
                          }
                        `}</style>
                        {[...Array(30)].map((_, i) => (
                          <span
                            key={i}
                            className="w-[2px] bg-rose-500/80 rounded-full transition-all duration-200"
                            style={{
                              height: isPlayingAudio ? '8px' : '2px',
                              transformOrigin: 'center',
                              animationName: isPlayingAudio ? 'steamVibrate' : 'none',
                              animationDuration: isPlayingAudio ? `${0.35 + (i % 5) * 0.06}s` : '0s',
                              animationTimingFunction: 'ease-in-out',
                              animationIterationCount: 'infinite',
                              animationDirection: 'alternate',
                              animationDelay: `${i * 0.015}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setActiveModal(activeModal === 'acoustics' ? null : 'acoustics')}
            className={`footer-trigger hover:text-amber-400 transition-colors uppercase cursor-pointer text-[10px] font-mono tracking-widest bg-transparent border-none outline-none ${activeModal === 'acoustics' ? 'text-amber-400 font-bold scale-105' : 'text-zinc-500 hover:scale-105'} duration-200`}
          >
            Acoustics
          </button>
          <button
            onClick={() => setActiveModal(activeModal === 'history' ? null : 'history')}
            className={`footer-trigger hover:text-amber-400 transition-colors uppercase cursor-pointer text-[10px] font-mono tracking-widest bg-transparent border-none outline-none ${activeModal === 'history' ? 'text-amber-400 font-bold scale-105' : 'text-zinc-500 hover:scale-105'} duration-200`}
          >
            History
          </button>
        </div>
      </footer>
      {/* 6. ELITE TOP PROGRESS BAR */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-white/5 z-50 pointer-events-none">
        <div
          className="h-full bg-linear-to-r from-amber-500 via-rose-500 to-rose-600 transition-transform duration-75 ease-out"
          style={{
            transform: `scaleX(${scrollProgress})`,
            transformOrigin: 'left',
          }}
        />
      </div>

      {/* 7. ELITE SCROLL INDICATOR (Desktop Only) */}
      <AnimatePresence>
        {scrollProgress < 0.05 && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 15, x: '-50%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex fixed bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 pointer-events-none z-10"
          >
            {/* Minimalist interactive mouse/touch pill */}
            <div className="w-[18px] h-[30px] rounded-full border border-white/20 flex justify-center p-[3px] backdrop-blur-xs shadow-lg">
              <motion.div
                animate={{
                  y: [0, 12, 0],
                  opacity: [1, 0.4, 1],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"
              />
            </div>
            <span className="text-[8px] font-mono tracking-[0.25em] text-zinc-500 uppercase select-none">
              Scroll
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
