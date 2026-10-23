# FDN — Food Discovery Network

Mobile-first web app and PWA for finding the best dishes in Hyderabad. Product spec: `docs/spec/MVP-SPEC.md`. Engineering guide: `AGENTS.md`.

## Setup

```bash
bun install
cp .env.example .env   # fill values locally; never commit them
bun run dev
```

## Checks

```bash
bun run typecheck
bun run lint
bun run format:check
bun run test
bun run build && bun run test:e2e
```

## Docs

| File | Contents |
| --- | --- |
| `docs/ARCHITECTURE.md` | Layout, import boundaries, data model, caching, jobs, environment, decisions |
| `docs/DESIGN-SYSTEM.md` | Tokens, type, motion, components, accessibility |
| `docs/PRODUCT-FLOWS.md` | User flows W1–W11 mapped to routes, components and server code |
| `docs/ROADMAP.md` | Seven phases with scope, exit criteria and tests |
| `docs/PROGRESS.md` | Phase checklist |

## Infrastructure

Server-only clients live in `infra/` (env, logger, Redis, R2, startup checks) and `db/` (Drizzle on Neon: HTTP for reads, `withTransaction` on a Pool for writes). Set `STARTUP_CHECKS=1` to log Neon, Redis and R2 readiness at server start. Define tables in `db/schema/`, then `bun run db:generate` and review the SQL before `bun run db:migrate`.

## Local database

```bash
# Postgres 16 with PostGIS, then in .env:
# DATABASE_URL=postgres://postgres:postgres@localhost:5432/fdn_dev
# DATABASE_DRIVER=pg
bun run db:migrate
bun run db:seed        # fictional sample catalogue; db:reseed to start over
```

`next build` prerenders every catalogue page, so it needs a migrated and seeded database.
