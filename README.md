# WorldNote

Local-first worldbuilding desktop platform — **Layered Monorepo**

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Desktop:** Tauri v2 + React 19 + Vite
- **Marketing:** Next.js 15
- **Design system:** Tailwind CSS 4 + HeroUI + OKLCH tokens (`packages/pkg-ui`)
- **Contract:** Zod schemas (`packages/pkg-shared`)
- **Persistence:** Rust crate JSON + SQLite index (`packages/pkg-persistence`)
- **2D canvas:** React Flow (`packages/canvas`)
- **Lint/format:** Biome

## Prerequisites

- Node 22+, pnpm 10+
- Rust stable + **MSVC Build Tools** (Windows) for Tauri
- WebView2 (bundled on recent Windows)

## Commands

```bash
pnpm install
pnpm run check      # Biome
pnpm run build      # All packages + apps
pnpm run dev        # Turbo dev (desktop + others as configured)
```

### Desktop only

```bash
pnpm run dev --filter=app-worldnote
```

### Web only

```bash
pnpm run dev --filter=app-web
```

### Storybook

```bash
pnpm run dev --filter=app-storybook
```

## Layout

See Monorepo: `apps/` (platform, web, storybook) and `packages/` (shared, persistence, ui, canvas).

