import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { slides } from './data/slides';
import { ChevronLeft, ChevronRight, Presentation, Maximize, Printer, Keyboard } from 'lucide-react';
import { Diagrams } from './components/Diagrams';
import { ParticleField } from './components/ParticleField';
import { AnimationProvider, useAnimationsEnabled } from './contexts/AnimationContext';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';

const SlideComponent = ({ slide }: { slide: any }) => {
  const Icon = slide.icon;
  const animate = useAnimationsEnabled();

  // Staggered entrance variants for content sections
  const containerVariants = animate
    ? {
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.12, delayChildren: 0.15 },
        },
      }
    : undefined;

  const fadeUpVariant = animate
    ? {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
      }
    : undefined;

  return (
    <>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none text-white">
        <Icon size={400} />
      </div>

      {slide.type === 'visual' ? (
        <div className="flex-1 flex flex-col z-10 w-full h-full">
          <motion.div
            className="flex items-center gap-4 mb-4"
            initial={animate ? { opacity: 0, x: -15 } : undefined}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Icon size={28} strokeWidth={1.5} />
            </div>
            <h2 className="text-base text-indigo-400 font-mono tracking-widest uppercase">
              {slide.subtitle}
            </h2>
            {slide.title && (
              <>
                <div className="h-4 w-px bg-white/10 mx-1" />
                <h1 className="text-2xl font-bold text-neutral-200 tracking-tight">
                  {slide.title}
                </h1>
              </>
            )}
          </motion.div>

          <motion.div
            className="flex-1 flex items-center justify-center bg-[#050505]/50 rounded-3xl border border-white/5 p-8 relative shadow-inner"
            initial={animate ? { opacity: 0, scale: 0.96 } : undefined}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="relative z-10 w-full">
              <Diagrams type={slide.id} />
            </div>
          </motion.div>
        </div>
      ) : slide.type === 'demo' ? (() => {
        const demoColors: Record<string, { bg: string; text: string; border: string }> = {
          purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
          indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
        };
        const c = demoColors[slide.theme] || demoColors.purple;
        return (
        <div className="flex-1 flex flex-col z-10 w-full h-full">
          {/* Compact header bar */}
          <motion.div
            className="flex items-center gap-3 mb-3 shrink-0"
            initial={animate ? { opacity: 0, x: -15 } : undefined}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className={`p-2 ${c.bg} rounded-lg ${c.text} ${c.border} border`}>
              <Icon size={20} strokeWidth={1.5} />
            </div>
            <h2 className={`text-sm ${c.text} font-mono tracking-widest uppercase`}>
              {slide.subtitle}
            </h2>
            <span className="text-neutral-600 mx-2">|</span>
            <h1 className="text-lg font-semibold text-neutral-200 tracking-tight">
              {slide.title}
            </h1>
          </motion.div>
          {/* Iframe container (or static placeholder for PDF export) */}
          <motion.div
            className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-[#07080f]"
            initial={animate ? { opacity: 0, scale: 0.98 } : undefined}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {animate ? (
              <iframe
                src={slide.demoSrc}
                className="w-full h-full border-0"
                title={slide.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                <Icon size={64} className={`${c.text} opacity-40`} strokeWidth={1} />
                <div className="text-2xl font-semibold text-neutral-300">{slide.title}</div>
                <div className="text-base text-neutral-500 font-mono">Interactive Demo — See live presentation</div>
              </div>
            )}
          </motion.div>
        </div>
        );
      })() : slide.type === 'title' ? (
        <motion.div
          className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full h-full"
          initial={animate ? 'hidden' : 'visible'}
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            variants={fadeUpVariant}
            className="mb-10 p-8 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.15)]"
          >
            <Icon size={72} strokeWidth={1.5} />
          </motion.div>
          <motion.h1
            variants={fadeUpVariant}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500"
          >
            {slide.title}
          </motion.h1>
          <motion.h2
            variants={fadeUpVariant}
            className="text-2xl md:text-3xl text-indigo-400 font-mono tracking-tight mb-10"
          >
            {slide.subtitle}
          </motion.h2>
          <motion.p
            variants={fadeUpVariant}
            className="text-2xl text-neutral-300 max-w-2xl leading-relaxed font-normal"
          >
            {slide.content}
          </motion.p>
        </motion.div>
      ) : (
        <div className="flex-1 flex flex-col z-10 w-full h-full">
          <motion.div
            className="flex items-center gap-4 mb-4"
            initial={animate ? { opacity: 0, x: -15 } : undefined}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Icon size={28} strokeWidth={1.5} />
            </div>
            <h2 className="text-base text-indigo-400 font-mono tracking-widest uppercase">
              {slide.subtitle}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-12 gap-10 flex-1 items-center">
            {/* Text Content (5 columns) */}
            <motion.div
              className="col-span-5 flex flex-col justify-center h-full pr-8"
              initial={animate ? 'hidden' : 'visible'}
              animate="visible"
              variants={containerVariants}
            >
              <motion.h1
                variants={fadeUpVariant}
                className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 leading-tight"
              >
                {slide.title}
              </motion.h1>
              <motion.p
                variants={fadeUpVariant}
                className="text-2xl text-neutral-300 leading-relaxed mb-4 font-normal"
              >
                {slide.content}
              </motion.p>

              {slide.points && (
                <motion.ul
                  className="space-y-3"
                  initial={animate ? 'hidden' : 'visible'}
                  animate="visible"
                  variants={
                    animate
                      ? {
                          visible: {
                            transition: { staggerChildren: 0.15, delayChildren: 0.4 },
                          },
                          hidden: {},
                        }
                      : undefined
                  }
                >
                  {slide.points.map((point: string, idx: number) => (
                    <motion.li
                      key={idx}
                      variants={
                        animate
                          ? {
                              hidden: { opacity: 0, x: -20 },
                              visible: { opacity: 1, x: 0 },
                            }
                          : undefined
                      }
                      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="flex items-start gap-4 text-xl text-neutral-200 font-normal"
                    >
                      <span className="mt-2.5 w-2.5 h-2.5 rounded-sm bg-indigo-500/60 border border-indigo-400/80 shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
                      <span className="leading-snug">{point}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </motion.div>

            {/* Diagram Area (7 columns) — no overflow-hidden so tooltips aren't clipped */}
            <motion.div
              className="col-span-7 h-full flex items-center justify-center bg-[#050505]/50 rounded-3xl border border-white/5 p-8 relative shadow-inner"
              initial={animate ? { opacity: 0, scale: 0.96 } : undefined}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              <div className="relative z-10 w-full">
                <Diagrams type={slide.id} />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
};

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0); // -1 = prev, 1 = next
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSlideIndex, setExportSlideIndex] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const padding = isFullscreen ? 120 : 64;
        const availableWidth = width - padding;
        const availableHeight = height - padding;

        const scaleX = availableWidth / 1400;
        const scaleY = availableHeight / 787.5;
        setScale(Math.min(scaleX, scaleY));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isFullscreen]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      if (prev === slides.length - 1) return prev;
      setDirection(1);
      setShowHint(false);
      return prev + 1;
    });
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      if (prev === 0) return prev;
      setDirection(-1);
      setShowHint(false);
      return prev - 1;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.error(e));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // PDF export: renders one slide at a time to avoid stacking/overlap issues
  const handleExportPDF = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1400, 787.5],
      });

      for (let i = 0; i < slides.length; i++) {
        // Render single slide in the hidden container
        setExportSlideIndex(i);
        // Wait for React to render and paint
        await new Promise((resolve) => setTimeout(resolve, 300));

        const printContainer = document.getElementById('print-container');
        if (!printContainer) throw new Error('Print container not found');

        const slideEl = printContainer.querySelector('.slide-page') as HTMLElement;
        if (!slideEl) throw new Error(`Slide ${i} element not found`);

        const imgData = await htmlToImage.toJpeg(slideEl, {
          quality: 0.95,
          backgroundColor: '#050505',
          pixelRatio: 2,
          width: 1400,
          height: 787.5,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
          },
        });

        if (i > 0) {
          pdf.addPage([1400, 787.5], 'landscape');
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, 1400, 787.5);
      }

      pdf.save('AI_Agent_101_Deck.pdf');
    } catch (error: any) {
      console.error('Failed to generate PDF', error);
      alert(`Failed to generate PDF: ${error.message || error}`);
    } finally {
      setExportSlideIndex(null);
      setIsExporting(false);
    }
  };

  const slide = slides[currentSlide];

  return (
    <>
      {/* --- EXPORT LOADING OVERLAY --- */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505]/90 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <div className="p-8 bg-neutral-900/80 rounded-3xl border border-white/10 flex flex-col items-center gap-6 shadow-2xl">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <div className="text-indigo-400 font-mono text-lg tracking-widest uppercase animate-pulse">
                Generating PDF...
              </div>
              <div className="text-neutral-500 text-sm font-mono">
                {exportSlideIndex !== null
                  ? `Slide ${exportSlideIndex + 1} of ${slides.length}`
                  : 'Preparing...'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SCREEN VIEW (Interactive, animations enabled) --- */}
      <AnimationProvider value={true}>
        <div className="min-h-screen bg-[#050505] text-neutral-50 flex flex-col font-sans overflow-hidden selection:bg-indigo-500/30 relative z-0">
          {/* Subtle Technical Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,#4f46e510,transparent)] pointer-events-none" />

          {/* Aurora animated gradients */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute w-[600px] h-[600px] top-[-10%] left-[20%] bg-[radial-gradient(circle,rgba(99,102,241,0.06),transparent_70%)] animate-aurora-1" />
            <div className="absolute w-[500px] h-[500px] top-[30%] right-[10%] bg-[radial-gradient(circle,rgba(168,85,247,0.04),transparent_70%)] animate-aurora-2" />
            <div className="absolute w-[550px] h-[550px] bottom-[-5%] left-[40%] bg-[radial-gradient(circle,rgba(16,185,129,0.04),transparent_70%)] animate-aurora-3" />
          </div>

          {/* Particle field */}
          <ParticleField slideIndex={currentSlide} />

          {/* Header / Controls */}
          <header className="p-4 flex justify-between items-center border-b border-white/5 z-10 bg-[#050505]/60 backdrop-blur-xl">
            <div className="flex items-center gap-3 text-neutral-400">
              <div className="p-1.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">
                <Presentation size={16} className="text-indigo-400" />
              </div>
              <span className="font-mono tracking-widest text-[10px] uppercase text-neutral-300">
                AI Concepts Deck
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">
                  Live
                </span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              {/* Slide title in header */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentSlide}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  className="text-[11px] text-neutral-400 font-mono tracking-wide hidden md:inline-block max-w-[200px] truncate"
                >
                  {slide.subtitle}
                </motion.span>
              </AnimatePresence>
              <div className="text-sm text-neutral-200 font-mono tracking-widest bg-white/8 px-5 py-2 rounded-full border border-white/15 flex items-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentSlide}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block min-w-[1.5ch] text-right text-indigo-400 font-bold text-base"
                  >
                    {String(currentSlide + 1).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
                <span className="text-neutral-500">/</span>
                <span className="text-neutral-400">{String(slides.length).padStart(2, '0')}</span>
              </div>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-400 hover:text-white flex items-center gap-2 disabled:opacity-50"
                title="Save as PDF"
              >
                <Printer size={16} />
                <span className="text-[10px] font-bold tracking-widest uppercase hidden sm:inline">
                  {isExporting ? 'Generating...' : 'Save PDF'}
                </span>
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-400 hover:text-white"
                title="Toggle Fullscreen"
              >
                <Maximize size={16} />
              </button>
            </div>
          </header>

          {/* Slide Area */}
          <main
            ref={containerRef}
            className="flex-1 relative flex items-center justify-center p-4 md:p-8 z-10 overflow-hidden"
          >
            <div
              className="relative flex items-center justify-center origin-center"
              style={{
                width: 1400,
                height: 787.5,
                transform: `scale(${scale})`,
              }}
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  initial={(d: number) => ({
                    opacity: 0,
                    x: d >= 0 ? 60 : -60,
                    scale: 0.97,
                    filter: 'blur(4px)',
                  })}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                  }}
                  exit={(d: number) => ({
                    opacity: 0,
                    x: d >= 0 ? -60 : 60,
                    scale: 0.97,
                    filter: 'blur(4px)',
                  })}
                  transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0 w-full h-full bg-[#0a0a0a]/80 rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)] flex flex-col p-14 overflow-hidden backdrop-blur-3xl ring-1 ring-white/5 noise-overlay"
                >
                  <SlideComponent slide={slide} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="absolute left-4 md:left-8 p-3 md:p-4 rounded-2xl bg-[#0a0a0a]/90 border border-white/15 text-neutral-400 hover:bg-indigo-500/15 hover:text-white hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 backdrop-blur-md z-20 group"
            >
              <ChevronLeft size={24} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="absolute right-4 md:right-8 p-3 md:p-4 rounded-2xl bg-[#0a0a0a]/90 border border-white/15 text-neutral-400 hover:bg-indigo-500/15 hover:text-white hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] disabled:opacity-0 disabled:pointer-events-none transition-all duration-300 backdrop-blur-md z-20 group"
            >
              <ChevronRight size={24} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            </button>

            {/* Keyboard hint — shown briefly on first slide */}
            <AnimatePresence>
              {showHint && currentSlide === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, delay: 2.5 }}
                  className="absolute bottom-4 right-8 flex items-center gap-2 text-neutral-500 text-xs font-mono z-20"
                >
                  <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-neutral-400">
                    &larr;
                  </span>
                  <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-neutral-400">
                    &rarr;
                  </span>
                  <span className="ml-1">or</span>
                  <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-neutral-400">
                    Space
                  </span>
                  <span className="ml-1">to navigate</span>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Slide minimap */}
          <div className="flex items-center justify-center gap-1.5 py-3 z-10 bg-[#050505]/60 backdrop-blur-sm relative">
            {slides.map((s: any, idx: number) => {
              const isFirstBackup = s.backup && (idx === 0 || !slides[idx - 1].backup);
              const themeColors: Record<string, string> = {
                indigo: 'bg-indigo-500',
                emerald: 'bg-emerald-500',
                purple: 'bg-purple-500',
                amber: 'bg-amber-500',
                blue: 'bg-blue-500',
                cyan: 'bg-cyan-500',
              };
              const glowColors: Record<string, string> = {
                indigo: 'rgba(99,102,241,0.6)',
                emerald: 'rgba(16,185,129,0.6)',
                purple: 'rgba(168,85,247,0.6)',
                amber: 'rgba(245,158,11,0.6)',
                blue: 'rgba(59,130,246,0.6)',
                cyan: 'rgba(6,182,212,0.6)',
              };
              const dotColor = themeColors[s.theme] || 'bg-neutral-500';
              const glow = glowColors[s.theme] || 'rgba(255,255,255,0.3)';
              const isActive = idx === currentSlide;
              const isHovered = hoveredDot === idx;
              return (
                <React.Fragment key={s.id}>
                  {isFirstBackup && (
                    <div className="flex items-center gap-1 mx-1.5">
                      <div className="w-px h-3 bg-neutral-600" />
                      <span className="text-[7px] text-neutral-600 font-mono uppercase tracking-widest">backup</span>
                      <div className="w-px h-3 bg-neutral-600" />
                    </div>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setDirection(idx > currentSlide ? 1 : -1);
                        setCurrentSlide(idx);
                        setShowHint(false);
                      }}
                      onMouseEnter={() => setHoveredDot(idx)}
                      onMouseLeave={() => setHoveredDot(null)}
                      className={`transition-all duration-300 rounded-full ${
                        isActive
                          ? `w-8 h-3 ${dotColor} animate-dot-glow`
                          : isHovered
                            ? `w-4 h-3 ${dotColor}/70`
                            : `w-3 h-3 ${dotColor}/30 hover:${dotColor}/60`
                      }`}
                      style={isActive ? { boxShadow: `0 0 12px ${glow}, 0 0 24px ${glow}` } : undefined}
                      title={s.backup ? `[Backup] ${s.title}` : s.title}
                    />
                    {/* Tooltip on hover */}
                    <AnimatePresence>
                      {isHovered && !isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-neutral-900/95 border border-white/10 rounded-lg text-[11px] text-neutral-300 whitespace-nowrap pointer-events-none shadow-xl z-50"
                        >
                          {s.backup && <span className="text-neutral-600 mr-1">[Backup]</span>}
                          <span className="text-neutral-500 mr-1">{String(idx + 1).padStart(2, '0')}</span>
                          {s.title}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900/95 border-r border-b border-white/10 rotate-45" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Footer / Progress */}
          <footer className="h-2 bg-neutral-900/50 z-10 relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-400"
              style={{ boxShadow: '0 0 20px rgba(99,102,241,0.8), 0 -2px 10px rgba(99,102,241,0.4)' }}
              initial={{ width: 0 }}
              animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </footer>
        </div>
      </AnimationProvider>

      {/* --- HIDDEN EXPORT VIEW (animations disabled, one slide at a time) --- */}
      <div className="fixed top-0 left-0 pointer-events-none z-[-10] opacity-0 w-[1400px] h-[787.5px] overflow-hidden">
        <div
          id="print-container"
          className="bg-[#050505] text-neutral-50 font-sans w-[1400px] h-[787.5px] relative"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {exportSlideIndex !== null && (
            <AnimationProvider value={false}>
              <div className="slide-page w-[1400px] h-[787.5px] relative overflow-hidden bg-[#050505]">
                {/* Grid background for print */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,#4f46e510,transparent)] pointer-events-none" />

                <div className="absolute inset-0 w-full h-full bg-[#0a0a0a]/80 rounded-3xl border border-white/10 flex flex-col p-14 overflow-hidden ring-1 ring-white/5 z-10">
                  <SlideComponent slide={slides[exportSlideIndex]} />
                </div>
              </div>
            </AnimationProvider>
          )}
        </div>
      </div>
    </>
  );
}
