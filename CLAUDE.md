# PAULI-CLIP™ — Fork Context for Agents

**Fork:** executiveusa/paperclip-pauli-clip
**Authority:** Emerald Tablets™ | ZTE v2.0 | Kupuri Media™
**Brand:** Tecito de La Verdad™ (Ivette's brand — the Tea of Truth)

---

## What This Repo Is

This is a fork of `paperclipai/paperclip` with the **El Panorama™ Viewing Room**
layered on top. It is an AI orchestration system with a 3D ceremonial interface.

---

## CRITICAL: What NOT to Touch

```
server/       ← Upstream Paperclip API. Do not modify.
packages/     ← Upstream shared types/adapters. Do not modify.
cli/          ← Upstream Paperclip CLI. Do not modify.
```

These are synced from upstream via `./sync-upstream.sh`. Any changes will be overwritten.

---

## What to Work On

```
ui-panorama/  ← OUR CUSTOM UI — El Panorama 3D Viewing Room
skills/       ← El Panorama skill files for agents
```

---

## ui-panorama Architecture

**Stack:** Vite + React 19 + TypeScript + Three.js r128 + TailwindCSS v4

```
ui-panorama/src/
  lib/
    types.ts              ← Core types (Mision, SphereId, AppState, etc.)
    sphere-identities.ts  ← 6 sphere identities + color/status system
    scene-config.ts       ← Three.js scene configuration
    model-registry.ts     ← LLM routing by domain
    council-protocol.ts   ← Karpathy protocol (Position → Rebuttal → Synthesis)
    sound-system.ts       ← Audio management singleton
    mock-data.ts          ← Seed missions for development
  components/
    LaVistaKanban.tsx     ← GTD Kanban (default view)
    ElPanoramaScene.tsx   ← Three.js 3D room
    CouncilOrchestrator.tsx ← LLM council UI
    SoundToggle.tsx       ← Sound/silent toggle
    DemoMode.tsx          ← Sales demo autoplay
    TransitionOverlay.tsx ← Kanban ↔ 3D fade
  context/
    AppContext.tsx         ← Global state (useReducer)
  styles/
    panorama.css          ← Full design system
```

---

## The 6 Sphere Identities

| Sphere | Color | Role |
|--------|-------|------|
| SYNTHIA™ Prime | #c8a04a (Gold) | Directora — Head Chef |
| Darya — Diseño | #8a4a7a (Malva) | Awwwards-Level Frontend |
| Investigadora | #4a6a8a (Acero) | Research + Data + Scraping |
| Desplegadora | #4a8a5a (Bosque) | Vercel + Cloudflare + CI/CD |
| Embajadora | #8a6a4a (Ámbar) | WhatsApp + Email + Outreach |
| Constructora | #5a4a8a (Índigo) | Site Factory + Code Generation |

---

## Running the Panorama UI

```bash
pnpm dev:panorama        # runs on http://localhost:5174
pnpm dev:panorama -- ?demo=true  # demo mode auto-starts
```

---

## Design System

- **Display font:** Cormorant Garamond (historical, elegant)
- **Mono font:** JetBrains Mono (technical labels)
- **Background:** #080c14 (deep night)
- **Gold accent:** #c8a04a (El Panorama gold)
- **Text:** #d8cdb0 (warm white)

**Aesthetic:** Expedition cartography × luxury restaurant × Linear

---

## Council Protocol (Karpathy)

1. **CONVOCATORIA** — Spheres gather to center table
2. **POSICIÓN** — Each sphere states position (domain-optimal model)
3. **RÉPLICA** — Adversarial rebuttal (Opus-class models)
4. **SÍNTESIS** — Consensus decision (best available model)
5. **RETORNO** — Spheres return to tables, UI returns to Kanban

Council triggers: estimated cost >$5, affects >2 mesas, irreversible decisions,
or keyword "consejo"/"council" detected.

---

## Sub-Sphere Dissolution Ceremony

The most important visual in the system:
- Sub-spheres spawn from parent (47% size, lighter color)
- On completion: return animation → gratitude acknowledgment → dissolve into 200 particles
- Particles drift upward and fade (GLSL-like animation via Three.js PointsMaterial)
- Parent sphere absorbs a brief glow

---

## Demo Mode

URL: `?demo=true` — runs the full sales demo automatically (~33 seconds).
Shows: Kanban → mission creation → sub-sphere spawn → El Panorama → Council → dissolution → result.

---

## Sync from Upstream

```bash
./sync-upstream.sh   # pulls server/, packages/, cli/ only
```

Never sync ui-panorama/.
