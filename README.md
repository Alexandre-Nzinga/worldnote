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

### Releases

Desktop installers are built in CI when a `v*` tag is pushed (see `.github/workflows/release.yml`).

```bash
# Bump version, commit, tag, and push (triggers Windows / macOS / Linux builds)
pnpm release patch --push

# Or set an explicit version
pnpm release 0.1.3 --push

# Local only (commit + tag, no push)
pnpm release patch --no-push
```

Version is synced in `apps/app-worldnote/src-tauri/tauri.conf.json`, `package.json`, `Cargo.toml`, and `Cargo.lock`.

Manual equivalent:

```bash
# 1. Edit version in the four files above (or run pnpm release 0.1.3 --no-push)
# 2. Commit and tag
git add apps/app-worldnote/package.json apps/app-worldnote/src-tauri/Cargo.toml apps/app-worldnote/src-tauri/tauri.conf.json Cargo.lock
git commit -m "Release v0.1.3"
git tag -a v0.1.3 -m "WorldNote v0.1.3"
# 3. Push branch + tag to trigger CI
git push && git push origin v0.1.3
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
