/**
 * Diagram components for the AI Agent slide deck.
 *
 * All diagrams are pure React JSX using two primitives: Node and Edge.
 * Each diagram case corresponds to a slide id from slides.ts.
 *
 * Features:
 * - Hover tooltips: each Node can show a description popover on hover
 * - Staggered entrance: nodes animate in sequentially via DiagramContainer
 * - Animated edges: SVG dashed lines with flowing animation
 * - All animations gated by AnimationContext for PDF export safety
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  Database, FileText, MessageSquare, Brain, Search,
  Settings, Code, Box, ArrowLeftRight,
  Server, Laptop, Zap, Network,
  Heart, MousePointer2, Rocket, Figma, Framer, Sparkles, Github, Triangle,
  Globe, Bot,
  Monitor, Terminal, FolderOpen, Layers, Filter, Plug,
  User, Cpu, HardDrive, Eye
} from 'lucide-react';
import { useAnimationsEnabled } from '../contexts/AnimationContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NodeProps {
  icon: LucideIcon;
  label: string;
  color?: 'indigo' | 'emerald' | 'purple' | 'amber' | 'blue' | 'slate' | 'cyan';
  description?: string;
  highlight?: boolean;
}

interface EdgeProps {
  direction?: 'right' | 'both' | 'down' | 'up-down';
  label?: string;
  delay?: number;
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const nodeVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// ---------------------------------------------------------------------------
// DiagramHoverContext — spotlight mode dims non-hovered nodes
// ---------------------------------------------------------------------------

const DiagramHoverContext = React.createContext<{
  hoveredNode: string | null;
  setHoveredNode: (id: string | null) => void;
}>({ hoveredNode: null, setHoveredNode: () => {} });

// ---------------------------------------------------------------------------
// DiagramContainer — applies staggered entrance to children
// ---------------------------------------------------------------------------

function DiagramContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const animate = useAnimationsEnabled();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <DiagramHoverContext.Provider value={{ hoveredNode, setHoveredNode }}>
      <motion.div
        className={className}
        initial={animate ? 'hidden' : 'visible'}
        animate="visible"
        variants={
          animate
            ? {
                visible: {
                  transition: { staggerChildren: 0.12, delayChildren: 0.2 },
                },
                hidden: {},
              }
            : undefined
        }
      >
        {children}
      </motion.div>
    </DiagramHoverContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Node — diagram node with optional hover tooltip
// ---------------------------------------------------------------------------

const colorMap: Record<string, string> = {
  indigo:
    'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:shadow-[0_0_40px_rgba(99,102,241,0.35)]',
  emerald:
    'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.35)]',
  purple:
    'text-purple-400 bg-purple-500/10 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:shadow-[0_0_40px_rgba(168,85,247,0.35)]',
  amber:
    'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.35)]',
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_40px_rgba(59,130,246,0.35)]',
  slate: 'text-neutral-300 bg-neutral-800/50 border-neutral-700 shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.35)]',
};

function Node({ icon: Icon, label, color = 'indigo', description, highlight }: NodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const animate = useAnimationsEnabled();

  // Task 14: Spotlight mode — consume hover context
  const { hoveredNode, setHoveredNode } = React.useContext(DiagramHoverContext);
  const nodeId = label;
  const isDimmed = hoveredNode !== null && hoveredNode !== nodeId;

  const handleMouseEnter = () => {
    setIsHovered(true);
    setHoveredNode(nodeId);
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      setShowAbove(rect.bottom > viewportHeight * 0.6);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoveredNode(null);
  };

  // Task 13: Escape key handler for modal
  useEffect(() => {
    if (!isExpanded) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isExpanded]);

  return (
    <div
      ref={nodeRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: isDimmed ? 0.3 : 1,
        filter: isDimmed ? 'blur(1px)' : 'none',
        transition: 'opacity 0.3s ease, filter 0.3s ease',
      }}
    >
      <motion.div
        className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border backdrop-blur-md w-36 md:w-40 aspect-square transition-all duration-300 ${animate && description ? 'cursor-pointer' : 'cursor-default'} ${colorMap[color]}${highlight ? ' gradient-border' : ''}`}
        animate={{ scale: isHovered ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={() => animate && description && setIsExpanded(true)}
      >
        <Icon size={40} strokeWidth={1.5} />
        <span className="text-lg font-semibold tracking-wide text-center leading-tight">
          {label}
        </span>
      </motion.div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {isHovered && description && (
          <motion.div
            initial={{ opacity: 0, y: showAbove ? -8 : 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: showAbove ? -8 : 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-[100] left-1/2 -translate-x-1/2 px-4 py-2.5 bg-neutral-900/95 border border-white/10 rounded-xl text-sm text-neutral-200 backdrop-blur-md shadow-xl pointer-events-none max-w-[260px] text-center leading-snug whitespace-normal ${showAbove ? 'bottom-full mb-3' : 'top-full mt-3'}`}
          >
            {description}
            {showAbove ? (
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-900/95 border-r border-b border-white/10 rotate-45" />
            ) : (
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-900/95 border-l border-t border-white/10 rotate-45" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-to-expand modal */}
      <AnimatePresence>
        {isExpanded && description && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`relative p-8 rounded-3xl border backdrop-blur-xl max-w-md mx-4 ${colorMap[color]}`}
              style={{ width: 'auto', aspectRatio: 'auto' }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <Icon size={48} strokeWidth={1.5} />
                <h3 className="text-xl font-bold tracking-wide">{label}</h3>
                <p className="text-base text-neutral-200 leading-relaxed">{description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edge — animated connection between nodes
// ---------------------------------------------------------------------------

function Edge({ direction = 'right', label, delay = 0 }: EdgeProps) {
  const animate = useAnimationsEnabled();
  const isVertical = direction === 'down' || direction === 'up-down';
  const isBidirectional = direction === 'both' || direction === 'up-down';

  if (isBidirectional) {
    // Bidirectional edges keep the Lucide icon with a pulse effect
    return (
      <div
        className={`flex items-center justify-center relative ${isVertical ? 'py-5' : 'px-5'}`}
      >
        {label && (
          <span
            className={`absolute font-bold text-amber-300 tracking-widest uppercase whitespace-nowrap z-10 ${isVertical ? 'left-1/2 ml-4 text-sm' : '-top-7 text-sm'}`}
          >
            {label}
          </span>
        )}
        <div
          className={`flex items-center text-neutral-400 ${animate ? 'animate-edge-pulse' : ''}`}
        >
          <ArrowLeftRight
            size={30}
            strokeWidth={2}
            className={isVertical ? 'rotate-90' : ''}
          />
        </div>
      </div>
    );
  }

  // Directional edges use SVG with flowing dash animation
  const svgW = isVertical ? 30 : 60;
  const svgH = isVertical ? 60 : 30;
  const pathLength = 50;

  return (
    <div
      className={`flex items-center justify-center relative ${isVertical ? 'py-4' : 'px-4'}`}
    >
      {label && (
        <span
          className={`absolute font-bold text-amber-300 tracking-widest uppercase whitespace-nowrap z-10 ${isVertical ? 'left-1/2 ml-4 text-sm' : '-top-7 text-sm'}`}
        >
          {label}
        </span>
      )}
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="text-neutral-400"
        fill="none"
      >
        {isVertical ? (
          <>
            <line
              x1={15}
              y1={0}
              x2={15}
              y2={50}
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray="8 5"
              style={
                animate
                  ? {
                      strokeDashoffset: pathLength,
                      animation: `edge-trace 0.6s ease-out ${delay}s forwards, edge-flow 1.5s linear ${delay + 0.6}s infinite`,
                    }
                  : undefined
              }
            />
            <polygon
              points="9,50 15,60 21,50"
              fill="currentColor"
              style={
                animate
                  ? {
                      opacity: 0,
                      animation: `edge-trace 0.3s ease-out ${delay + 0.4}s forwards`,
                    }
                  : undefined
              }
            />
          </>
        ) : (
          <>
            <line
              x1={0}
              y1={15}
              x2={50}
              y2={15}
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray="8 5"
              style={
                animate
                  ? {
                      strokeDashoffset: pathLength,
                      animation: `edge-trace 0.6s ease-out ${delay}s forwards, edge-flow 1.5s linear ${delay + 0.6}s infinite`,
                    }
                  : undefined
              }
            />
            <polygon
              points="50,9 60,15 50,21"
              fill="currentColor"
              style={
                animate
                  ? {
                      opacity: 0,
                      animation: `edge-trace 0.3s ease-out ${delay + 0.4}s forwards`,
                    }
                  : undefined
              }
            />
          </>
        )}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LayerBand — wide horizontal band for the in-context-learning diagram
// ---------------------------------------------------------------------------

interface LayerBandProps {
  icon: LucideIcon;
  label: string;
  sub: string;
  color: 'cyan' | 'slate';
  description: string;
  locked: boolean;
  highlight: boolean;
}

function LayerBand({ icon: Icon, label, sub, color, description, locked, highlight }: LayerBandProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const bandRef = useRef<HTMLDivElement>(null);
  const animate = useAnimationsEnabled();

  const { hoveredNode, setHoveredNode } = React.useContext(DiagramHoverContext);
  const isDimmed = hoveredNode !== null && hoveredNode !== label;

  const handleMouseEnter = () => {
    setIsHovered(true);
    setHoveredNode(label);
    if (bandRef.current) {
      const rect = bandRef.current.getBoundingClientRect();
      setShowAbove(rect.bottom > window.innerHeight * 0.6);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoveredNode(null);
  };

  const baseClasses = locked
    ? 'border-neutral-700 bg-neutral-800/40 text-neutral-500'
    : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.35)]';

  return (
    <div
      ref={bandRef}
      className="relative w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: isDimmed ? 0.3 : 1,
        filter: isDimmed ? 'blur(1px)' : 'none',
        transition: 'opacity 0.3s ease, filter 0.3s ease',
      }}
    >
      <motion.div
        className={`flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-md transition-all duration-300 ${baseClasses}${highlight ? ' gradient-border' : ''}`}
        animate={{ scale: isHovered ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Icon size={28} strokeWidth={1.5} />
        <div className="flex flex-col min-w-0">
          <span className="text-lg font-semibold tracking-wide">{label}</span>
          <span className={`text-sm ${locked ? 'text-neutral-600' : 'text-cyan-400/60'} font-mono`}>{sub}</span>
        </div>
        {!locked && (
          <span className="ml-auto text-xs text-cyan-400/50 font-mono uppercase tracking-widest">You control this</span>
        )}
      </motion.div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: showAbove ? -8 : 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: showAbove ? -8 : 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-[100] left-1/2 -translate-x-1/2 px-4 py-2.5 bg-neutral-900/95 border border-white/10 rounded-xl text-sm text-neutral-200 backdrop-blur-md shadow-xl pointer-events-none max-w-[320px] text-center leading-snug whitespace-normal ${showAbove ? 'bottom-full mb-3' : 'top-full mt-3'}`}
          >
            {description}
            {showAbove ? (
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-900/95 border-r border-b border-white/10 rotate-45" />
            ) : (
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-900/95 border-l border-t border-white/10 rotate-45" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Diagrams switch — one case per slide id
// ---------------------------------------------------------------------------

export function Diagrams({ type }: { type: string }) {
  switch (type) {
    // =======================================================================
    // PART 1: FOUNDATION
    // =======================================================================

    // Slide 2: LLMs (compressed)
    case 'llm':
      return (
        <DiagramContainer className="flex flex-col items-center gap-6 w-full scale-[0.9] origin-center">
          <motion.div variants={nodeVariants}>
            <Node icon={Database} label="Training Data" color="purple" description="Billions of text tokens the model learned from" />
          </motion.div>
          <Edge direction="down" label="Learned Patterns" delay={0.3} />
          <div className="flex items-center justify-center gap-4 md:gap-6 w-full">
            <motion.div variants={nodeVariants}>
              <Node icon={MessageSquare} label="Input Text" color="slate" description="Raw user prompt or query sent to the model" />
            </motion.div>
            <Edge label="Predicts" delay={0.6} />
            <motion.div variants={nodeVariants}>
              <Node icon={Brain} label="LLM" color="indigo" description="Predicts the next token based on input context" />
            </motion.div>
            <Edge label="Generates" delay={0.9} />
            <motion.div variants={nodeVariants}>
              <Node icon={FileText} label="Output Text" color="emerald" description="Generated response based on probability distribution" />
            </motion.div>
          </div>
        </DiagramContainer>
      );

    // Slide 3: LLM Demo (iframe handled by App.tsx)
    case 'llm-demo':
      return null;

    // Slide 4: Prompts & Context — The One Lever You Control (enlarged)
    case 'in-context-learning':
      return (
        <DiagramContainer className="flex flex-col items-center gap-6 w-full">
          <div className="flex items-center justify-center gap-6 w-full">
            <motion.div variants={nodeVariants} className="flex flex-col items-center gap-2 flex-1">
              <div className="px-8 py-6 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex flex-col items-center gap-3 w-full">
                <span className="text-cyan-400 font-bold text-lg tracking-widest uppercase">Prompt</span>
                <span className="text-neutral-300 text-lg text-center">What to do</span>
              </div>
            </motion.div>
            <motion.div variants={nodeVariants} className="text-4xl text-neutral-600 font-bold">+</motion.div>
            <motion.div variants={nodeVariants} className="flex flex-col items-center gap-2 flex-1">
              <div className="px-8 py-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col items-center gap-3 w-full shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <span className="text-emerald-400 font-bold text-lg tracking-widest uppercase">Context</span>
                <span className="text-neutral-300 text-lg text-center">What to know</span>
              </div>
            </motion.div>
          </div>
          <Edge direction="down" label="Shapes prediction" delay={0.4} />
          <motion.div variants={nodeVariants}>
            <Node icon={Brain} label="LLM" color="indigo" description="Same model + different context = different answer" />
          </motion.div>
          <motion.div variants={nodeVariants} className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full mt-2">
            <span className="text-base font-semibold text-emerald-400">Context is the lever you control</span>
          </motion.div>
        </DiagramContainer>
      );

    // Slide 2: Overview Flow Chart — 4 items in row 2 with individual connections
    case 'overview-flowchart':
      return (
        <DiagramContainer className="flex flex-col items-center w-full scale-[0.92] origin-top">
          {/* Row 1: Question → Agent → LLM */}
          <div className="flex items-center justify-center gap-5">
            <motion.div variants={nodeVariants}>
              <Node icon={Search} label="Your Question" color="slate" description="User prompt or task request" />
            </motion.div>
            <Edge delay={0.2} />
            <motion.div variants={nodeVariants}>
              <Node icon={Bot} label="Agent" color="cyan" highlight description="Central coordinator that orchestrates everything" />
            </motion.div>
            <Edge delay={0.4} />
            <motion.div variants={nodeVariants}>
              <Node icon={Brain} label="LLM" color="indigo" description="The AI reasoning engine (Gen AI Brain)" />
            </motion.div>
          </div>

          {/* Vertical stem from Agent to horizontal rail */}
          <motion.div variants={nodeVariants} className="flex justify-center">
            <div className="w-0.5 h-8 bg-cyan-500/40" />
          </motion.div>

          {/* Row 2: tree-branch connector — horizontal rail + vertical drops + nodes */}
          <div className="relative">
            <div className="flex items-start justify-center gap-10">
              <motion.div variants={nodeVariants} className="flex flex-col items-center w-40 shrink-0">
                <div className="w-0.5 h-8 bg-indigo-500/40" />
                <Node icon={FileText} label="Instructions" color="indigo" description="Global rules and behavior" />
              </motion.div>
              <motion.div variants={nodeVariants} className="flex flex-col items-center w-40 shrink-0">
                <div className="w-0.5 h-8 bg-purple-500/40" />
                <Node icon={Database} label="Knowledge (RAG)" color="purple" description="Your documents and domain knowledge" />
              </motion.div>
              <motion.div variants={nodeVariants} className="flex flex-col items-center w-40 shrink-0">
                <div className="w-0.5 h-8 bg-amber-500/40" />
                <Node icon={Zap} label="Skills Library" color="amber" description="Pre-packaged workflow automation" />
              </motion.div>
              <motion.div variants={nodeVariants} className="flex flex-col items-center w-40 shrink-0">
                <div className="w-0.5 h-8 bg-emerald-500/40" />
                <Node icon={Plug} label="Tools (MCP)" color="emerald" description="Universal protocol for external tool connections" />
              </motion.div>
            </div>
            {/* Horizontal rail — spans center of first node to center of last node */}
            <div className="absolute top-0 h-0.5 bg-neutral-500/40" style={{ left: 80, right: 80 }} />
          </div>

          {/* Vertical stems from Skills+MCP down to row 3 rail */}
          <motion.div variants={nodeVariants} className="flex justify-center gap-10">
            <div className="w-40 shrink-0" />
            <div className="w-40 shrink-0" />
            <div className="w-40 shrink-0 flex justify-center">
              <div className="w-0.5 h-8 bg-amber-500/40" />
            </div>
            <div className="w-40 shrink-0 flex justify-center">
              <div className="w-0.5 h-8 bg-emerald-500/40" />
            </div>
          </motion.div>

          {/* Row 3: tree-branch connector — horizontal rail + drops + nodes */}
          <div className="relative">
            <div className="flex justify-center gap-10">
              <div className="w-40 shrink-0" />
              <div className="w-40 shrink-0" />
              <motion.div variants={nodeVariants} className="flex flex-col items-center w-40 shrink-0">
                <div className="w-0.5 h-8 bg-amber-500/40" />
                <Node icon={Globe} label="Web Search" color="amber" description="Real-time internet information" />
              </motion.div>
              <motion.div variants={nodeVariants} className="flex flex-col items-center w-40 shrink-0">
                <div className="w-0.5 h-8 bg-emerald-500/40" />
                <Node icon={Code} label="Local Tools" color="slate" description="File access, code execution, APIs" />
              </motion.div>
            </div>
            {/* Horizontal rail — spans center of Web Search to center of Local Tools */}
            <div className="absolute top-0 h-0.5 bg-neutral-500/40" style={{ left: 480, right: 80 }} />
          </div>
        </DiagramContainer>
      );

    // Slide 7: RAG — Your Knowledge Base (with highlighted RAG frame)
    case 'rag':
      return (
        <DiagramContainer className="flex flex-col items-center gap-4 w-full">
          {/* Header */}
          <motion.div variants={nodeVariants} className="text-center">
            <span className="text-xl font-bold text-neutral-200">Two Ways to Give AI Better Context</span>
          </motion.div>

          {/* Three columns: Web Search | Knowledge Base + RAG frame */}
          <div className="flex gap-8 w-full justify-center items-start">
            {/* Left: Web Search */}
            <motion.div variants={nodeVariants} className="flex flex-col items-center gap-3 w-56">
              <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col items-center gap-3 w-full shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <Globe size={40} className="text-amber-400" strokeWidth={1.5} />
                <span className="text-lg font-bold text-amber-300">Web Search</span>
                <span className="text-sm text-neutral-400 text-center">Real-time retrieval</span>
              </div>
              <span className="text-xs text-neutral-500 text-center">News, live data, public sources</span>
            </motion.div>

            {/* Divider */}
            <motion.div variants={nodeVariants} className="flex flex-col items-center justify-center self-stretch">
              <div className="w-px h-full bg-neutral-700/50" />
            </motion.div>

            {/* Right: Knowledge Base + RAG frame */}
            <motion.div variants={nodeVariants} className="flex flex-col items-center gap-3 w-56">
              <div className="p-5 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex flex-col items-center gap-3 w-full shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                <Database size={40} className="text-purple-400" strokeWidth={1.5} />
                <span className="text-lg font-bold text-purple-300">Knowledge Base</span>
                <span className="text-sm text-neutral-400 text-center">Your documents</span>
              </div>
              {/* Connector line */}
              <div className="w-px h-4 bg-purple-500/40" />
              {/* RAG individual frame — highlighted */}
              <div className="p-5 bg-purple-500/15 border-2 border-purple-400/50 rounded-2xl flex flex-col items-center gap-2 w-full shadow-[0_0_40px_rgba(168,85,247,0.2)] gradient-border">
                <span className="text-xs font-bold text-purple-400/70 tracking-widest uppercase">Technique</span>
                <span className="text-lg font-bold text-purple-200">RAG</span>
                <span className="text-sm text-purple-300/80 text-center">Retrieval Augmented Generation</span>
                <span className="text-xs text-neutral-500 text-center">Converts docs into searchable context for AI</span>
              </div>
              <span className="text-xs text-neutral-500 text-center">Internal docs, domain expertise</span>
            </motion.div>
          </div>

          {/* Bottom: Both converge */}
          <motion.div variants={nodeVariants} className="flex items-center gap-4 mt-1">
            <div className="w-12 h-px bg-amber-500/30" />
            <div className="px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <span className="text-sm font-semibold text-emerald-400">Better Context {'\u2192'} Better AI Output</span>
            </div>
            <div className="w-12 h-px bg-purple-500/30" />
          </motion.div>
        </DiagramContainer>
      );

    // Slide 7: Instructions — global instructions visual flow
    case 'instructions':
      return (
        <DiagramContainer className="flex flex-col items-center gap-2 w-full">
          {/* Header — Global Instructions concept (highlighted) */}
          <motion.div variants={nodeVariants} className="px-10 py-5 bg-indigo-500/10 border-2 border-indigo-500/40 rounded-2xl flex flex-col items-center gap-2 shadow-[0_0_40px_rgba(99,102,241,0.15)] gradient-border">
            <FileText size={36} className="text-indigo-400" strokeWidth={1.5} />
            <span className="text-xl font-bold text-indigo-200">Global Instructions {'\u2014'} Always Loaded</span>
            <span className="text-sm text-indigo-400/50 font-mono">e.g. ~/.claude/CLAUDE.md</span>
          </motion.div>

          {/* Three thin connector lines */}
          <motion.div variants={nodeVariants} className="flex items-start justify-center w-full" style={{ gap: '6rem' }}>
            <div className="w-0.5 h-6 bg-indigo-500/30" />
            <div className="w-0.5 h-6 bg-indigo-500/30" />
            <div className="w-0.5 h-6 bg-indigo-500/30" />
          </motion.div>

          {/* Three category cards */}
          <div className="flex gap-5 justify-center">
            <motion.div variants={nodeVariants} className="w-52 p-5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex flex-col items-center gap-3 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
              <User size={32} className="text-cyan-400" strokeWidth={1.5} />
              <span className="text-lg font-bold text-cyan-300">Identity</span>
              <span className="text-sm text-neutral-400 text-center">Who you are, platform, tools</span>
            </motion.div>
            <motion.div variants={nodeVariants} className="w-52 p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col items-center gap-3 shadow-[0_0_25px_rgba(245,158,11,0.1)]">
              <Settings size={32} className="text-amber-400" strokeWidth={1.5} />
              <span className="text-lg font-bold text-amber-300">Rules</span>
              <span className="text-sm text-neutral-400 text-center">Behavior, verification, coding style*</span>
            </motion.div>
            <motion.div variants={nodeVariants} className="w-52 p-5 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex flex-col items-center gap-3 shadow-[0_0_25px_rgba(168,85,247,0.1)]">
              <Database size={32} className="text-purple-400" strokeWidth={1.5} />
              <span className="text-lg font-bold text-purple-300">Additions</span>
              <span className="text-sm text-neutral-400 text-center">Environment, architecture, preferences</span>
            </motion.div>
          </div>

          {/* Thin connector to System Prompt */}
          <motion.div variants={nodeVariants} className="flex justify-center">
            <div className="w-0.5 h-6 bg-indigo-500/30" />
          </motion.div>

          {/* System Prompt destination */}
          <motion.div variants={nodeVariants} className="px-8 py-4 bg-indigo-500/15 border border-indigo-500/30 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.1)]">
            <span className="text-lg font-semibold text-indigo-300">Injected into System Prompt {'\u2014'} shapes every AI response</span>
          </motion.div>
        </DiagramContainer>
      );

    // Backup: Context Window — horizontal segmented bar
    case 'context-window': {
      const segments = [
        { label: 'System Prompt', sub: 'Instructions, Rules', color: 'bg-indigo-500/80', textColor: 'text-white', flex: 2 },
        { label: 'Memories', sub: 'Persisted', color: 'bg-purple-500/80', textColor: 'text-white', flex: 1.5 },
        { label: 'Static Tools', sub: 'IDE definitions', color: 'bg-neutral-600/80', textColor: 'text-neutral-200', flex: 1.5 },
        { label: 'Conversation + Tools', sub: 'User \u00b7 Assistant \u00b7 Tools', color: 'bg-emerald-500/60', textColor: 'text-white', flex: 3.5 },
        { label: 'User Input', sub: 'Just sent!', color: 'bg-pink-500/80', textColor: 'text-white', flex: 1.5 },
      ];
      return (
        <DiagramContainer className="flex flex-col items-center gap-6 w-full">
          <motion.p variants={nodeVariants} className="text-base text-neutral-400 font-mono tracking-wide">
            What the LLM actually "sees" during inference
          </motion.p>
          <motion.div variants={nodeVariants} className="flex w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(99,102,241,0.15)]" style={{ height: 120 }}>
            {segments.map((seg) => (
              <div key={seg.label} className={`${seg.color} ${seg.textColor} flex flex-col items-center justify-center gap-1 px-2 border-r border-white/10 last:border-r-0`} style={{ flex: seg.flex }}>
                <span className="font-bold text-sm tracking-wide text-center leading-tight">{seg.label}</span>
                <span className="text-xs opacity-70 text-center">{seg.sub}</span>
              </div>
            ))}
          </motion.div>
          <div className="flex gap-6 justify-center">
            <motion.div variants={nodeVariants} className="px-5 py-2 bg-red-500/10 border border-red-500/30 rounded-full">
              <span className="text-sm font-semibold"><span className="text-red-400">200K{'\u2013'}1M tokens</span> <span className="text-neutral-300">typical limit</span></span>
            </motion.div>
            <motion.div variants={nodeVariants} className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <span className="text-sm font-semibold"><span className="text-emerald-400">You and the IDE</span> <span className="text-neutral-300">control what fills it</span></span>
            </motion.div>
          </div>
        </DiagramContainer>
      );
    }

    // =======================================================================
    // PART 2: AGENTS
    // =======================================================================

    // Slide 5: AI Agents — visual comparison flow (enlarged)
    case 'agent':
      return (
        <DiagramContainer className="flex flex-col items-center gap-4 w-full">
          {/* Side-by-side: ChatGPT vs Agent */}
          <div className="flex gap-8 w-full">
            {/* Left: Yesterday (ChatGPT) — simple flow */}
            <motion.div variants={nodeVariants} className="flex-1 flex flex-col items-center gap-4">
              <span className="text-neutral-500 font-bold text-base tracking-widest uppercase">Yesterday: ChatGPT</span>
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="w-full px-6 py-4 bg-neutral-800/50 border border-neutral-700/50 rounded-xl flex items-center gap-4">
                  <User size={28} className="text-neutral-500 shrink-0" />
                  <span className="text-base text-neutral-400">You ask a question</span>
                </div>
                <div className="w-px h-4 bg-neutral-700" />
                <div className="w-full px-6 py-4 bg-neutral-800/50 border border-neutral-700/50 rounded-xl flex items-center gap-4">
                  <Brain size={28} className="text-neutral-500 shrink-0" />
                  <span className="text-base text-neutral-400">LLM generates text</span>
                </div>
                <div className="w-px h-4 bg-neutral-700" />
                <div className="w-full px-6 py-4 bg-neutral-800/50 border border-neutral-700/50 rounded-xl flex items-center gap-4">
                  <MessageSquare size={28} className="text-neutral-500 shrink-0" />
                  <span className="text-base text-neutral-400">Text answer only</span>
                </div>
              </div>
              <span className="text-sm text-neutral-600 italic">Can answer. Can{'\u2019'}t act.</span>
            </motion.div>

            {/* Divider with arrow */}
            <motion.div variants={nodeVariants} className="flex flex-col items-center justify-center gap-3 px-2">
              <div className="w-px h-10 bg-neutral-700/50" />
              <div className="px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full">
                <span className="text-sm font-bold text-indigo-400 tracking-widest uppercase">Shift</span>
              </div>
              <div className="text-indigo-400 text-2xl">{'\u2192'}</div>
              <div className="w-px h-10 bg-neutral-700/50" />
            </motion.div>

            {/* Right: Today (Agent) — rich flow */}
            <motion.div variants={nodeVariants} className="flex-1 flex flex-col items-center gap-4">
              <span className="text-indigo-400 font-bold text-base tracking-widest uppercase">Today: Agent</span>
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="w-full px-6 py-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center gap-4 shadow-[0_0_20px_rgba(99,102,241,0.08)]">
                  <User size={28} className="text-indigo-400 shrink-0" />
                  <span className="text-base text-neutral-200">You describe a task</span>
                </div>
                <div className="w-px h-3 bg-indigo-500/40" />
                <div className="w-full px-6 py-5 bg-cyan-500/10 border-2 border-cyan-500/40 rounded-xl flex items-center gap-4 shadow-[0_0_25px_rgba(6,182,212,0.12)]">
                  <Bot size={30} className="text-cyan-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-cyan-300">Agent orchestrates</span>
                    <span className="text-sm text-neutral-400">Plans, uses tools, manages context</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1 h-px bg-indigo-500/30" />
                  <div className="flex-1 h-px bg-indigo-500/30" />
                  <div className="flex-1 h-px bg-indigo-500/30" />
                </div>
                <div className="flex gap-3 w-full">
                  <div className="flex-1 px-3 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex flex-col items-center gap-1.5">
                    <Globe size={22} className="text-amber-400" />
                    <span className="text-sm text-amber-300 font-medium">Search</span>
                  </div>
                  <div className="flex-1 px-3 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex flex-col items-center gap-1.5">
                    <Code size={22} className="text-emerald-400" />
                    <span className="text-sm text-emerald-300 font-medium">Run Code</span>
                  </div>
                  <div className="flex-1 px-3 py-3 bg-purple-500/10 border border-purple-500/30 rounded-lg flex flex-col items-center gap-1.5">
                    <Database size={22} className="text-purple-400" />
                    <span className="text-sm text-purple-300 font-medium">Data</span>
                  </div>
                  <div className="flex-1 px-3 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex flex-col items-center gap-1.5">
                    <FileText size={22} className="text-blue-400" />
                    <span className="text-sm text-blue-300 font-medium">Files</span>
                  </div>
                </div>
              </div>
              <span className="text-sm text-indigo-400/70 font-medium italic">Can answer AND act.</span>
            </motion.div>
          </div>

          {/* Bottom takeaway */}
          <motion.div variants={nodeVariants} className="px-7 py-3 bg-emerald-500/8 border border-emerald-500/25 rounded-full mt-1">
            <span className="text-base text-emerald-400 font-semibold">Less re-explaining {'\u00b7'} More repeatability {'\u00b7'} Safer autonomy</span>
          </motion.div>
        </DiagramContainer>
      );

    // Slide 7: Tools & MCP
    case 'tools-mcp':
      return (
        <DiagramContainer className="flex flex-col items-center gap-5 w-full">
          <div className="flex items-center justify-center gap-5">
            <motion.div variants={nodeVariants}>
              <Node icon={Box} label="Agent" color="indigo" description="Needs to interact with external systems" />
            </motion.div>
            <Edge delay={0.2} />
            <motion.div variants={nodeVariants} className="px-6 py-3 bg-emerald-500/15 border-2 border-emerald-500/50 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.2)] flex flex-col items-center gap-1">
              <Plug size={24} className="text-emerald-400" />
              <span className="font-bold text-emerald-300 text-sm tracking-widest uppercase">MCP</span>
              <span className="text-xs text-neutral-400">Universal Protocol</span>
            </motion.div>
            <Edge delay={0.4} />
            <div className="flex flex-col gap-3">
              <motion.div variants={nodeVariants}>
                <Node icon={Code} label="Code Exec" color="amber" description="Run scripts, shell commands" />
              </motion.div>
              <motion.div variants={nodeVariants}>
                <Node icon={Database} label="Data & APIs" color="blue" description="Query databases, call services" />
              </motion.div>
              <motion.div variants={nodeVariants}>
                <Node icon={FileText} label="File System" color="purple" description="Read, write, search files" />
              </motion.div>
            </div>
          </div>
          <motion.div variants={nodeVariants} className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <span className="text-sm font-semibold text-emerald-400">One plug format {'\u2014'} any agent, any tool</span>
          </motion.div>
        </DiagramContainer>
      );

    // Slide 9: Agent Demo (iframe)
    case 'agent-demo':
      return null;

    // Slide 9: Skills
    case 'skills':
      return (
        <DiagramContainer className="flex flex-col items-center justify-center gap-6 w-full scale-[1.15]">
          <div className="flex flex-col gap-3 p-6 bg-amber-500/5 border border-amber-500/20 rounded-[1.5rem] items-center shadow-[0_0_30px_rgba(245,158,11,0.08)] relative">
            <span className="absolute -top-3 bg-[#0a0a0a] px-3 text-xs font-bold text-amber-500/70 tracking-widest uppercase">Skill Package</span>
            <div className="flex gap-6">
              <motion.div variants={nodeVariants}><Node icon={Settings} label="Prompt" color="amber" description="Natural language instructions for the agent" /></motion.div>
              <motion.div variants={nodeVariants}><Node icon={Code} label="Code" color="amber" description="Executable logic paired with the prompt" /></motion.div>
            </div>
          </div>
          <Edge direction="down" label="Equips" />
          <motion.div variants={nodeVariants}><Node icon={Box} label="Agent" color="indigo" description="Receives the skill package for on-demand use" /></motion.div>
        </DiagramContainer>
      );

    // =======================================================================
    // PART 3: PRACTICE
    // =======================================================================

    // Slide 12: Context Engineering — four pillars color-matched to context window
    case 'context-engineering': {
      const cwSegments = [
        { label: 'System Prompt', sub: 'Instructions', color: 'bg-indigo-500/80', textColor: 'text-white', flex: 2.5 },
        { label: 'Memories', sub: 'RAG', color: 'bg-purple-500/80', textColor: 'text-white', flex: 1.5 },
        { label: 'Tools', sub: 'MCP', color: 'bg-emerald-500/70', textColor: 'text-white', flex: 1.5 },
        { label: 'Conversation', sub: 'Skills', color: 'bg-cyan-500/60', textColor: 'text-white', flex: 3 },
        { label: 'User Input', sub: 'Latest message', color: 'bg-pink-500/80', textColor: 'text-white', flex: 1.5 },
      ];
      return (
        <DiagramContainer className="flex flex-col items-center gap-4 w-full">
          {/* Transition message */}
          <motion.div variants={nodeVariants} className="text-center">
            <span className="text-base text-neutral-400 italic">From concepts to real-world coding</span>
          </motion.div>

          {/* Four pillar cards — color-matched to context window */}
          <div className="flex gap-4 w-full">
            {/* Instructions = indigo (System Prompt) */}
            <motion.div variants={nodeVariants} className="flex-1 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-5 flex flex-col items-center gap-3 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
              <FileText size={36} strokeWidth={1.5} className="text-indigo-400" />
              <span className="text-lg font-bold text-indigo-300">Instructions</span>
              <div className="w-10 h-px bg-indigo-500/50" />
              <span className="text-base text-neutral-200 font-semibold">= Rules</span>
            </motion.div>

            {/* RAG = purple (Memories) */}
            <motion.div variants={nodeVariants} className="flex-1 bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5 flex flex-col items-center gap-3 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              <Database size={36} strokeWidth={1.5} className="text-purple-400" />
              <span className="text-lg font-bold text-purple-300">RAG</span>
              <div className="w-10 h-px bg-purple-500/50" />
              <span className="text-base text-neutral-200 font-semibold">= Knowledge</span>
            </motion.div>

            {/* MCP = emerald (Tools) */}
            <motion.div variants={nodeVariants} className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex flex-col items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <Plug size={36} strokeWidth={1.5} className="text-emerald-400" />
              <span className="text-lg font-bold text-emerald-300">MCP</span>
              <div className="w-10 h-px bg-emerald-500/50" />
              <span className="text-base text-neutral-200 font-semibold">= Tool Calls</span>
            </motion.div>

            {/* Skills = cyan (Conversation) */}
            <motion.div variants={nodeVariants} className="flex-1 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-5 flex flex-col items-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
              <Zap size={36} strokeWidth={1.5} className="text-cyan-400" />
              <span className="text-lg font-bold text-cyan-300">Skills</span>
              <div className="w-10 h-px bg-cyan-500/50" />
              <span className="text-base text-neutral-200 font-semibold">= Automation</span>
            </motion.div>
          </div>

          {/* Context Window Bar — color-matched to pillars above */}
          <motion.div variants={nodeVariants} className="w-full flex flex-col gap-2 mt-1">
            <span className="text-xs text-neutral-500 font-mono tracking-wide text-center uppercase">What the LLM actually sees (Context Window)</span>
            <div className="flex w-full rounded-xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.1)]" style={{ height: 56 }}>
              {cwSegments.map((seg) => (
                <div key={seg.label} className={`${seg.color} ${seg.textColor} flex flex-col items-center justify-center gap-0.5 px-1.5 border-r border-white/10 last:border-r-0`} style={{ flex: seg.flex }}>
                  <span className="font-bold text-[11px] tracking-wide text-center leading-tight">{seg.label}</span>
                  <span className="text-[9px] opacity-70 text-center">{seg.sub}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-neutral-600 font-mono px-1">
              <span>You shape this via Instructions, RAG, MCP & Skills</span>
              <span>200K{'\u2013'}1M tokens</span>
            </div>
          </motion.div>
        </DiagramContainer>
      );
    }

    // Slide 12: Global Instructions
    case 'global-instructions':
      return (
        <DiagramContainer className="flex flex-col gap-5 w-full">
          <div className="flex gap-6 w-full">
            <motion.div variants={nodeVariants} className="flex-1 flex flex-col gap-4">
              <h3 className="text-xl font-bold text-neutral-200">The File</h3>
              <div className="px-4 py-2.5 bg-neutral-900/80 border border-amber-500/30 rounded-lg font-mono text-amber-400 text-sm">~/.claude/CLAUDE.md</div>
              <ul className="space-y-2.5 text-neutral-300 text-base">
                <li className="flex items-start gap-3"><span className="mt-1.5 w-2 h-2 rounded-sm bg-amber-500/60 border border-amber-400/80 shrink-0" /><span>Applies to <strong className="text-white">all</strong> AI interactions</span></li>
                <li className="flex items-start gap-3"><span className="mt-1.5 w-2 h-2 rounded-sm bg-amber-500/60 border border-amber-400/80 shrink-0" /><span>Markdown format with your standards</span></li>
                <li className="flex items-start gap-3"><span className="mt-1.5 w-2 h-2 rounded-sm bg-amber-500/60 border border-amber-400/80 shrink-0" /><span>Automatically loaded {'\u2014'} no manual activation</span></li>
              </ul>
            </motion.div>
            <motion.div variants={nodeVariants} className="flex-1 flex flex-col gap-4">
              <h3 className="text-xl font-bold text-neutral-200">What to Include</h3>
              <div className="bg-neutral-900/80 border border-white/10 rounded-xl p-5 font-mono text-[13px] leading-relaxed">
                <div className="text-amber-400 font-bold">## User Profile</div>
                <div className="text-neutral-400 pl-3">- Platform, shell, language versions</div>
                <div className="h-3" />
                <div className="text-amber-400 font-bold">## Environment</div>
                <div className="text-neutral-400 pl-3">- GPU, CUDA, special hardware</div>
                <div className="h-3" />
                <div className="text-amber-400 font-bold">## Behavior</div>
                <div className="text-neutral-400 pl-3">- Summarize changes, verify before patching</div>
                <div className="h-3" />
                <div className="text-amber-400 font-bold">## Coding Style</div>
                <div className="text-neutral-400 pl-3">- Immutability, small files, error handling</div>
                <div className="h-3" />
                <div className="text-amber-400 font-bold">## Verification</div>
                <div className="text-neutral-400 pl-3">- Check console errors, run tests</div>
              </div>
            </motion.div>
          </div>
        </DiagramContainer>
      );

    // Slide 13: Project Instructions
    case 'project-instructions':
      return (
        <DiagramContainer className="flex flex-col gap-5 w-full">
          <div className="flex gap-6 w-full">
            <motion.div variants={nodeVariants} className="flex-1 flex flex-col gap-4">
              <h3 className="text-xl font-bold text-neutral-200">The File</h3>
              <div className="px-4 py-2.5 bg-neutral-900/80 border border-emerald-500/30 rounded-lg font-mono text-emerald-400 text-sm">project-root/CLAUDE.md</div>
              <ul className="space-y-2.5 text-neutral-300 text-base">
                <li className="flex items-start gap-3"><span className="mt-1.5 w-2 h-2 rounded-sm bg-emerald-500/60 border border-emerald-400/80 shrink-0" /><span>Loaded only in <strong className="text-white">this project</strong></span></li>
                <li className="flex items-start gap-3"><span className="mt-1.5 w-2 h-2 rounded-sm bg-emerald-500/60 border border-emerald-400/80 shrink-0" /><span>Committed to repo {'\u2014'} shared with team</span></li>
                <li className="flex items-start gap-3"><span className="mt-1.5 w-2 h-2 rounded-sm bg-emerald-500/60 border border-emerald-400/80 shrink-0" /><span>Overrides/extends global instructions</span></li>
              </ul>
            </motion.div>
            <motion.div variants={nodeVariants} className="flex-1 flex flex-col gap-4">
              <h3 className="text-xl font-bold text-neutral-200">What to Include</h3>
              <div className="bg-neutral-900/80 border border-white/10 rounded-xl p-5 font-mono text-[13px] leading-relaxed">
                <div className="text-emerald-400 font-bold">## Project Structure</div>
                <div className="text-neutral-400 pl-3">- src/ layout, key directories</div>
                <div className="h-3" />
                <div className="text-emerald-400 font-bold">## Architecture</div>
                <div className="text-neutral-400 pl-3">- Stack: React + Express + PostgreSQL</div>
                <div className="h-3" />
                <div className="text-emerald-400 font-bold">## Dependencies</div>
                <div className="text-neutral-400 pl-3">- Key libraries, version constraints</div>
                <div className="h-3" />
                <div className="text-emerald-400 font-bold">## Build & Run</div>
                <div className="text-neutral-400 pl-3">- npm run dev, npm run build</div>
                <div className="h-3" />
                <div className="text-emerald-400 font-bold">## Testing</div>
                <div className="text-neutral-400 pl-3">- Jest for unit, Playwright for E2E</div>
              </div>
            </motion.div>
          </div>
        </DiagramContainer>
      );

    // Slide 13: Progressive Disclosure — layered pyramid with parallel on-demand row
    case 'progressive-disclosure': {
      const baseLayers = [
        { label: 'Project: CLAUDE.md', sub: 'Architecture, deps, build steps', color: 'emerald', bgColor: 'bg-emerald-500/10 border-emerald-500/30', width: 'w-[85%]', tag: 'always loaded' },
        { label: 'Global: ~/.claude/CLAUDE.md', sub: 'User profile, coding style, behavior', color: 'indigo', bgColor: 'bg-indigo-500/10 border-indigo-500/30', width: 'w-full', tag: 'always loaded' },
      ];
      const onDemandItems = [
        { label: 'MCP Tools', sub: 'Activated by tool calls', color: 'amber', bgColor: 'bg-amber-500/10 border-amber-500/30', textColor: 'text-amber-400' },
        { label: 'Skills', sub: 'Activated by /command', color: 'purple', bgColor: 'bg-purple-500/10 border-purple-500/30', textColor: 'text-purple-400' },
      ];
      const textColorMap: Record<string, string> = { emerald: 'text-emerald-400', indigo: 'text-indigo-400' };
      return (
        <DiagramContainer className="flex flex-col items-center gap-3 w-full">
          {/* On-demand row: Tools and Skills side by side */}
          <motion.div variants={nodeVariants} className="w-[70%] flex gap-3">
            {onDemandItems.map((item) => (
              <div key={item.label} className={`flex-1 ${item.bgColor} border rounded-xl px-5 py-3 flex items-center justify-between`}>
                <div className="flex flex-col">
                  <span className={`font-bold text-base ${item.textColor}`}>{item.label}</span>
                  <span className="text-sm text-neutral-500">{item.sub}</span>
                </div>
                <span className={`text-xs font-mono ${item.textColor} opacity-60`}>on-demand</span>
              </div>
            ))}
          </motion.div>
          {/* Always-loaded layers */}
          {baseLayers.map((layer) => (
            <motion.div key={layer.label} variants={nodeVariants} className={`${layer.width} ${layer.bgColor} border rounded-xl px-6 py-3 flex items-center justify-between`}>
              <div className="flex flex-col">
                <span className={`font-bold text-base ${textColorMap[layer.color]}`}>{layer.label}</span>
                <span className="text-sm text-neutral-500">{layer.sub}</span>
              </div>
              <span className={`text-xs font-mono ${textColorMap[layer.color]} opacity-60`}>{layer.tag}</span>
            </motion.div>
          ))}
          <motion.p variants={nodeVariants} className="text-base text-purple-400/70 font-mono tracking-wide mt-2 italic">
            Load only what{'\u2019'}s needed {'\u2014'} don{'\u2019'}t burn tokens on irrelevant context
          </motion.p>
        </DiagramContainer>
      );
    }

    // Slide 12: AI Dev Tools — full-width chart
    case 'tools-qa':
      return (
        <div className="flex flex-col w-full relative p-2 md:p-4">
          {/* Y-axis */}
          <div className="absolute left-2 top-0 bottom-10 w-px bg-neutral-700">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 border-t border-l border-neutral-700 rotate-45" />
          </div>
          <span className="absolute -left-27 top-24 -rotate-90 origin-center whitespace-nowrap text-neutral-300 text-sm font-bold tracking-widest uppercase">Complete Applications</span>
          <span className="absolute -left-15 bottom-32 -rotate-90 origin-center whitespace-nowrap text-neutral-300 text-sm font-bold tracking-widest uppercase">Components</span>

          {/* X-axis */}
          <div className="absolute bottom-8 left-10 right-0 h-px bg-neutral-700">
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 border-t border-r border-neutral-700 rotate-45" />
          </div>
          <div className="absolute bottom-2 left-10 right-0 flex items-center justify-between text-neutral-300 text-sm font-bold tracking-widest uppercase">
            <span>Low Technical Barrier</span>
            <span>Deep Engineering Control</span>
          </div>

          {/* 2x2 Grid — enlarged */}
          <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full ml-10 mb-12">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 shadow-[0_0_30px_rgba(59,130,246,0.05)]">
              <span className="text-blue-400 font-bold text-xl tracking-wide">Zero-Code / Low-Code</span>
              <div className="flex flex-wrap justify-center gap-5">
                <div className="flex flex-col items-center gap-2"><div className="p-3.5 bg-blue-500/20 rounded-xl text-blue-400"><Heart size={30} /></div><span className="text-base text-neutral-300">Lovable</span></div>
                <div className="flex flex-col items-center gap-2"><div className="p-3.5 bg-yellow-500/20 rounded-xl text-yellow-400"><Zap size={30} /></div><span className="text-base text-neutral-300">Bolt</span></div>
                <div className="flex flex-col items-center gap-2"><div className="p-3.5 bg-orange-500/20 rounded-xl text-orange-400 font-bold text-xl w-14 h-14 flex items-center justify-center">R</div><span className="text-base text-neutral-300">Replit</span></div>
                <div className="flex flex-col items-center gap-2"><div className="p-3.5 bg-purple-500/20 rounded-xl text-purple-400 font-bold text-xl w-14 h-14 flex items-center justify-center">v0</div><span className="text-base text-neutral-300">v0</span></div>
              </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
              <span className="text-emerald-400 font-bold text-xl tracking-wide">Agentic IDEs</span>
              <div className="flex flex-wrap justify-center gap-5">
                <div className="flex flex-col items-center gap-2 relative">
                  <div className="absolute -top-2 -right-4 bg-emerald-500 text-[#050505] text-[9px] font-bold px-2 py-0.5 rounded-sm z-10 shadow-lg whitespace-nowrap">DAILY DRIVER</div>
                  <div className="p-3.5 bg-blue-500/20 rounded-xl text-blue-400"><Code size={30} /></div>
                  <span className="text-base text-neutral-300 text-center leading-tight">VS Code +<br />AI Ext</span>
                </div>
                <div className="flex flex-col items-center gap-2"><div className="p-3.5 bg-emerald-500/20 rounded-xl text-emerald-400"><MousePointer2 size={30} /></div><span className="text-base text-neutral-300">Cursor</span></div>
                <div className="flex flex-col items-center gap-2"><div className="p-3.5 bg-purple-500/20 rounded-xl text-purple-400 font-bold text-xl w-14 h-14 flex items-center justify-center">C</div><span className="text-base text-neutral-300">Claude Code</span></div>
                <div className="flex flex-col items-center gap-2"><div className="p-3.5 bg-blue-500/20 rounded-xl text-blue-400"><Rocket size={30} /></div><span className="text-base text-neutral-300">Windsurf</span></div>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 shadow-[0_0_30px_rgba(245,158,11,0.05)]">
              <span className="text-amber-400 font-bold text-xl tracking-wide">Design & Prototyping</span>
              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex flex-col items-center gap-2"><div className="p-3.5 bg-pink-500/20 rounded-xl text-pink-400"><Figma size={30} /></div><span className="text-base text-neutral-300">Figma AI</span></div>
                <div className="flex flex-col items-center gap-2"><div className="p-3.5 bg-neutral-500/20 rounded-xl text-neutral-300"><Framer size={30} /></div><span className="text-base text-neutral-300">Framer AI</span></div>
                <div className="flex flex-col items-center gap-2"><div className="p-3.5 bg-amber-500/20 rounded-xl text-amber-400"><Sparkles size={30} /></div><span className="text-base text-neutral-300">AI Studio</span></div>
              </div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 shadow-[0_0_30px_rgba(168,85,247,0.05)]">
              <span className="text-purple-400 font-bold text-xl tracking-wide">AI Coding Assistants</span>
              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex flex-col items-center gap-2"><div className="p-3.5 bg-neutral-500/20 rounded-xl text-neutral-300"><Github size={30} /></div><span className="text-base text-neutral-300">GitHub Copilot</span></div>
                <div className="flex flex-col items-center gap-2"><div className="p-3.5 bg-blue-500/20 rounded-xl text-blue-400 font-bold text-xl w-14 h-14 flex items-center justify-center">L</div><span className="text-base text-neutral-300">LangChain</span></div>
                <div className="flex flex-col items-center gap-2"><div className="p-3.5 bg-emerald-500/20 rounded-xl text-emerald-400 font-bold text-xl w-14 h-14 flex items-center justify-center">O</div><span className="text-base text-neutral-300">OpenAI API</span></div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
