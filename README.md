# If My Feelings Were a City

A cinematic self-reflection web app that turns emotional inputs into a symbolic, explorable 2D city map.

## Concept

"If My Feelings Were a City" helps users make sense of mixed emotional states by mapping them into districts, roads, weather, lighting, landmarks, and movement patterns.

This product is **not therapy** and does **not** provide diagnosis. It is reflective guidance for emotional clarity and action.

## MVP Scope

This hackathon MVP delivers one polished end-to-end flow:

1. Landing page with visual identity
2. Multi-step prompt wizard (8 prompts including free-text reflection)
3. Lightweight AI interpretation layer for emotional scoring
4. Deterministic city generation engine
5. Interactive SVG city map with clickable districts
6. Final reflection section with emotional summary and action guidance

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- shadcn-style UI components
- Local browser storage (no auth, no DB)

## Emotion Mapping Engine

The app uses a typed two-stage interpretation pipeline:

1. **AI/ML interpretation layer** (`lib/emotion-engine.ts`)
- Accepts free-text reflection + guided prompt answers
- Infers a normalized multi-dimensional emotional vector across:
  - anxiety, hope, loneliness, grief, love, ambition, burnout, nostalgia,
  - confusion, peace, anger, curiosity, joy, fear, restlessness, shame
- Supports mixed states (for example anxious + hopeful + burned out)

2. **Deterministic city generation layer** (`lib/city-generator.ts`)
- Converts emotional vector into city systems:
  - districts
  - buildings
  - roads
  - landmarks
  - weather
  - lighting
  - emotional summary
  - needs statement
  - 3 suggested real-world actions

### Required symbolic mappings included

- Anxiety -> dense roads, congestion, flickering lights, narrow blocks
- Hope -> sunrise lighting, parks, cranes, open boulevards, upward growth
- Loneliness -> sparse districts, long roads, empty stations, distant lights
- Love -> bridges, warm homes, community plazas, connected neighborhoods
- Grief -> rain, memorial park, quiet streets, abandoned structures
- Ambition -> skyscrapers, transit movement, construction zones
- Nostalgia -> old town district, warm lamps, preserved buildings
- Burnout -> power outages, stalled traffic, fog, unfinished towers

## Final Screen Output

- Emotional Summary
- Dominant Forces in Your City
- What Your City Needs
- 3 Suggested Real-World Actions

Language is intentionally reflective and non-clinical:
- "Your city suggests you may need..."
- "A helpful next step could be..."
- "What this city seems to be asking for is..."

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key Files

- `app/page.tsx` - landing page
- `app/start/page.tsx` - prompt flow
- `app/city/page.tsx` - generated city experience
- `components/prompt-wizard.tsx` - multi-step questionnaire
- `components/city-map.tsx` - stylized interactive map renderer
- `components/district-details-panel.tsx` - district interpretation panel
- `components/emotional-insights.tsx` - summary + action guidance section
- `lib/emotion-engine.ts` - emotional inference / normalized vector
- `lib/city-generator.ts` - deterministic city generation logic

## Demo Defaults

Demo seed answers are available in `lib/prompts.ts` and can be launched via the "Use demo city" shortcut in the wizard.
