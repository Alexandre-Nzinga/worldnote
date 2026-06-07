# WorldNote

Building better worlds

Local-first worldbuilding desktop platform — **Layered Monorepo**

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Desktop:** Tauri v2 + React 19 + Vite
- **Marketing:** Next.js 16
- **Design system:** Tailwind CSS 4 + HeroUI + OKLCH tokens (`packages/pkg-ui`)
- **Contract:** Zod schemas (`packages/pkg-shared`)
- **Persistence:** Rust crate JSON + SQLite index (`packages/pkg-persistence`)
- **Canvas:** React Flow + Three.js (`packages/canvas`)
- **Lint/format:** Biome

## Prerequisites

- Node 22+, pnpm 10+
- Rust stable + **MSVC Build Tools** (Windows) for Tauri
- WebView2 (bundled on recent Windows)

## Commands

```bash
pnpm install
pnpm run check         # Biome (lint + format)
pnpm run check-types   # TypeScript across packages
pnpm run test          # Vitest / package tests
pnpm run build         # All packages + apps
```

### Dev servers

`pnpm run dev` starts every turbo `dev` task (desktop, web, storybook, and package watchers). Prefer the scoped scripts when working on one app:

```bash
pnpm run dev:worldnote   # Desktop (Tauri)
pnpm run dev:web         # Marketing site (Next.js)
pnpm run dev:storybook   # Component docs (port 6006)
pnpm run dev:all         # All apps under apps/
```

## Layout

| Path | Package | Role |
|------|---------|------|
| `apps/app-worldnote` | — | Tauri desktop app |
| `apps/app-web` | — | Next.js marketing / landing site |
| `apps/app-storybook` | — | Storybook for `@worldnote/ui` |
| `packages/pkg-shared` | `@worldnote/shared` | Zod schemas, TipTap editor, shared React |
| `packages/pkg-ui` | `@worldnote/ui` | Design system (tokens, atoms, molecules) |
| `packages/pkg-persistence` | — | Rust persistence (JSON files + SQLite index) |
| `packages/canvas` | `@worldnote/canvas` | 2D flow canvas and 3D views |
