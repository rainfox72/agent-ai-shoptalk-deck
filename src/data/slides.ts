import {
  Brain,
  MessageSquare,
  Search,
  Bot,
  Plug,
  Zap,
  LayoutGrid,
  Microscope,
  SlidersHorizontal,
  Monitor,
  Settings,
  FileText,
  FolderOpen,
  Filter,
  Map,
  Database
} from 'lucide-react';

export const slides = [
  // =========================================================================
  // MAIN DECK (13 slides)
  // =========================================================================

  // Page 1: Title
  {
    id: 'title',
    title: "AI Agent 101 and Vibe Coding Demo",
    subtitle: "From LLMs to Autonomous Agents",
    icon: Brain,
    content: "A visual guide to the modern AI ecosystem and how its building blocks fit together.",
    type: "title",
    theme: 'indigo'
  },

  // Page 2: Overview Flow Chart (NEW)
  {
    id: 'overview-flowchart',
    title: "The Big Picture",
    subtitle: "How It All Connects",
    icon: Map,
    content: "",
    points: [],
    theme: 'indigo',
    type: 'visual'
  },

  // Page 3: LLMs
  {
    id: 'llm',
    title: "The Foundation: LLMs",
    subtitle: "Large Language Models",
    icon: MessageSquare,
    content: "Core text-prediction engines that power modern AI.",
    points: [
      "Predicts the next word \u2014 one token at a time",
      "Doesn't think, remember, or understand"
    ],
    theme: 'purple'
  },

  // Page 4: LLM Demo
  {
    id: 'llm-demo',
    title: "LLM in Action",
    subtitle: "Interactive Demonstration",
    icon: Microscope,
    content: "",
    points: [],
    theme: 'purple',
    type: 'demo',
    demoSrc: '/llm-xray/index.html'
  },

  // Page 5: Agents (moved up — introduce agents before context management)
  {
    id: 'agent',
    title: "AI Agents",
    subtitle: "The Shift",
    icon: Bot,
    content: "",
    points: [],
    theme: 'indigo',
    type: 'visual'
  },

  // Page 6: Prompts & Context
  {
    id: 'in-context-learning',
    title: "The One Lever You Control",
    subtitle: "Prompts & Context",
    icon: SlidersHorizontal,
    content: "Two inputs shape every AI response.",
    points: [
      "Prompt: What to do \u2014 instructions, role, task",
      "Context: What to know \u2014 data, history, documents",
      "Same model + different context = different answer"
    ],
    theme: 'cyan'
  },

  // Page 7: Instructions (NEW — global CLAUDE.md focus)
  {
    id: 'instructions',
    title: "Instructions",
    subtitle: "Shaping AI Behavior",
    icon: FileText,
    content: "",
    points: [],
    theme: 'indigo',
    type: 'visual'
  },

  // Page 8: RAG - Your Knowledge Base
  {
    id: 'rag',
    title: "Your Knowledge Base",
    subtitle: "Enhancing AI Context",
    icon: Database,
    content: "",
    points: [],
    theme: 'purple',
    type: 'visual'
  },

  // Page 8: MCP
  {
    id: 'tools-mcp',
    title: "MCP \u2014 Model Context Protocol",
    subtitle: "Standardized Connections",
    icon: Plug,
    content: "One universal standard for AI tool connections.",
    points: [
      "Like USB-C \u2014 one plug format for everything",
      "Code execution, data & APIs, file systems",
      "One protocol, any agent, any tool"
    ],
    theme: 'emerald'
  },

  // Page 9: Skills
  {
    id: 'skills',
    title: "Skills: Flexible Automation",
    subtitle: "Skills",
    icon: Zap,
    content: "Pre-packaged capabilities for repeatable tasks.",
    points: [
      "Prompt + Executable Code",
      "Tells Agent HOW, not WHEN",
      "Balances stability & autonomy"
    ],
    theme: 'amber'
  },

  // Page 10: Agent Demo
  {
    id: 'agent-demo',
    title: "Agent in Action",
    subtitle: "Interactive Demonstration",
    icon: Microscope,
    content: "",
    points: [],
    theme: 'indigo',
    type: 'demo',
    demoSrc: '/agent-xray/agent.html'
  },

  // Page 11: Context Engineering (redesigned as visual)
  {
    id: 'context-engineering',
    title: "Context Engineering",
    subtitle: "From Concepts to Practice",
    icon: Settings,
    content: "",
    points: [],
    theme: 'indigo',
    type: 'visual'
  },

  // Page 12: AI Dev Tools (redesigned as visual)
  {
    id: 'tools-qa',
    title: "Which Tools Should We Use?",
    subtitle: "AI Dev Tools & Q&A",
    icon: LayoutGrid,
    content: "",
    points: [],
    theme: 'blue',
    type: 'visual'
  },

  // =========================================================================
  // BACKUP SLIDES (4 slides)
  // =========================================================================

  // Backup 1: Context Window (was main page 5)
  {
    id: 'context-window',
    title: "Context Window",
    subtitle: "What the LLM Actually Sees",
    icon: Monitor,
    content: "Everything the model reads in a single inference call.",
    points: [
      "System Prompt, Memories, Tools, Conversation, User Input",
      "200K\u20131M tokens typical limit"
    ],
    theme: 'cyan',
    backup: true
  },

  // Backup 2: Global Instructions (was main page 11)
  {
    id: 'global-instructions',
    title: "Global Instructions",
    subtitle: "Your Baseline",
    icon: FileText,
    content: "A single file that applies to ALL AI interactions.",
    points: [
      "~/.claude/CLAUDE.md \u2014 always loaded",
      "User profile, environment, coding style"
    ],
    theme: 'amber',
    backup: true
  },

  // Backup 3: Project Instructions (was main page 12)
  {
    id: 'project-instructions',
    title: "Project Instructions",
    subtitle: "Per-Repo Context",
    icon: FolderOpen,
    content: "Project-specific context loaded per-repo.",
    points: [
      "project-root/CLAUDE.md \u2014 per-repo",
      "Architecture, dependencies, build steps"
    ],
    theme: 'emerald',
    backup: true
  },

  // Backup 4: Progressive Disclosure (was main page 13)
  {
    id: 'progressive-disclosure',
    title: "Progressive Disclosure",
    subtitle: "Layering Context",
    icon: Filter,
    content: "Load only what's needed.",
    points: [
      "Global \u2192 Project \u2192 On-Demand Skills & Tools",
      "Each layer adds specificity without waste"
    ],
    theme: 'purple',
    backup: true
  }
];
