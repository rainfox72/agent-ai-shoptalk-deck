# Agent AI Shoptalk Deck

An interactive web presentation covering AI agent concepts — from LLMs and prompts to autonomous multi-agent systems. Built for a live shoptalk with embedded interactive demos.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.8 |
| Build | Vite 6.2 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| PDF Export | jsPDF + html-to-image |

No backend — this is a purely static single-page application.

## Setup

```bash
npm install
npm run dev        # Dev server on http://localhost:3000
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

## Architecture

```
src/
  main.tsx                # React root mount
  App.tsx                 # Slide renderer, navigation, PDF export
  index.css               # Tailwind imports + theme + animations
  contexts/
    AnimationContext.tsx   # Disables animations during PDF export
  components/
    Diagrams.tsx          # Diagram layouts (Node/Edge primitives)
    ParticleField.tsx     # Background particle animation
  data/
    slides.ts             # Slide content (13 main + 4 backup)
public/
  llm-xray/               # Interactive LLM demo (embedded iframe)
  agent-xray/             # Interactive Agent demo (embedded iframe)
```

### Design Decisions

- **Fixed canvas**: 1400x787.5px scaled via CSS `transform: scale()`
- **Diagrams**: Pure React JSX with `Node`/`Edge` primitives (no charting library)
- **PDF export**: Renders slides sequentially in a hidden container with animations disabled
- **Fonts**: Inter (Google Fonts)

## Slides

**Main deck (13 slides):**
1. Title
2. The Big Picture (overview flowchart)
3. The Foundation: LLMs
4. LLM Demo (interactive)
5. AI Agents
6. Prompts & Context
7. Instructions
8. Your Knowledge Base (RAG)
9. MCP — Model Context Protocol
10. Skills
11. Agent Demo (interactive)
12. Context Engineering
13. AI Dev Tools & Q&A

**Backup slides (4):** Context Window, Global Instructions, Project Instructions, Progressive Disclosure

## Controls

- **Arrow keys / Space**: Navigate slides
- **Save PDF**: Export all slides as PDF
- **Fullscreen**: Toggle fullscreen mode

