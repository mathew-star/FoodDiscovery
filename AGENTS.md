<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# FDN — Food Discovery Network

Mobile-first web app + PWA for Hyderabad: dish-first discovery, Loved/Good/Okay/Skip ratings, posts, threaded comments, votes, communities, lists, Dish Battles, living facts. Guests read everything; sign-in only to engage. Source of truth: `docs/spec/MVP-SPEC.md`. Where this repo deviates from the spec, `docs/ARCHITECTURE.md` §Decisions wins.

## Stack

| Concern | Choice |
| --- | --- |
| Runtime / PM | Bun 1.3.11 (`bun --bun next …`), Node 22 on Vercel |
| Framework | Next.js 16.4 App Router, React 19.3, `cacheComponents` + `partialPrefetching` on |
| Language | TypeScript strict; zod for every external input |
| Styling | Tailwind v4 (`@theme inline` over `--fdn-*` tokens in `app/globals.css`, default palette reset), Base UI headless primitives, `cva` + `tailwind-merge`, Lucide icons; "warm brutalist" FDN design system (`docs/DESIGN-SYSTEM.md`, visual reference `docs/reference/fdn-landing-full.html`) |
| Fonts | Bricolage Grotesque (headings) + Inder (everything else) via `next/font/google`; nothing else |
| Motion | CSS only (transitions, keyframes and the motion tokens in DESIGN-SYSTEM §8); no JS animation libraries |
| Data | Neon Postgres + Drizzle 1.0 rc (HTTP driver for reads, Pool for transactions), PostGIS, `pg_trgm`, `unaccent` |
| Cache / limits | Upstash Redis via `ioredis` (`rediss://`), sliding-window limiter on the same client |
| Auth | Better Auth: email + password with verification via Resend; DB sessions. Google sign-in deferred (button shown disabled) |
| Jobs | Inngest (`app/api/inngest/route.ts`) |
| Storage | Cloudflare R2 via S3 API, presigned PUT from the browser |
| Email | Resend |
| Observability | pino JSON logs + `instrumentation.ts`; no third-party tracker or analytics SaaS |
| Hosting | Vercel — `https://food-discovery-eta.vercel.app`, auth base path `/api/auth` |

No LLM, no SMS, no PostHog, no Google sign-in yet in the MVP. Do not add vendors without an ARCHITECTURE.md decision entry.

## Commands

```bash
bun install                 # commit bun.lock changes; CI uses --frozen-lockfile
bun run dev                 # next dev (Bun runtime)
bun run build && bun run start
bun run typecheck           # next typegen + tsc --noEmit
bun run lint                # eslint, zero warnings, import boundaries
bun run format              # prettier (format:check in CI)
bun run test                # vitest unit tests (*.test.ts beside code)
bun run test:e2e            # playwright against next start on :3100 (build first)
bun run db:generate         # SQL migration from db schema diff; review before commit
bun run db:migrate          # never against production from a laptop
bun run db:check
bun run db:test             # read-only connectivity check
bun run db:seed             # sample catalogue into an empty database
bun run db:reseed           # truncate catalogue tables and reseed (never on production)
```

`next build`, e2e and integration tests need a migrated, seeded database. Locally use Postgres 16 + PostGIS with `DATABASE_DRIVER=pg`; e2e also needs `REDIS_URL` (a local `redis://localhost:6379` works, D33). In cloud sessions, run e2e with `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium`. `inngest:dev` lands in P3.

## Architecture rules

Full detail: `docs/ARCHITECTURE.md`.

- `app/` is routing only: read params, call a feature query, render a feature component, export metadata. No SQL, no business rules.
- Features live in `features/<domain>/{components,server,queries,schemas,hooks,jobs,lib}`; `lib/` is pure, client-safe domain logic.
  - `server/actions.ts` (`'use server'`) is the only mutation entry point from UI.
  - `server/service.ts` holds rules; `server/repo.ts` holds Drizzle. Both `import 'server-only'` and are private to the feature.
  - `queries/` are cached reads: `'use cache'` + `cacheLife(profile)` + `cacheTag('<entity>:<id>')`.
  - `schemas/` are zod; types derive from them (`z.infer`).
- Cross-feature imports: only another feature's `components/`, `queries/`, `schemas/`, `server/actions.ts`. Never `repo.ts`/`service.ts`.
- `shared/ui` (design-system primitives), `shared/lib` (pure utils) never import `features/`, `db/`, `infra/`.
- `db/` owns schema, migrations, seed. `infra/` owns env, logger, redis, r2, inngest, ratelimit, email clients.
- Route handlers only for: Better Auth, Inngest, typeahead GET, analytics beacon, OG images (file convention). Everything else is a server action.
- Long, scheduled or fan-out work is an Inngest function in `features/<domain>/jobs/`, registered in `infra/inngest/functions.ts`.
- Every tunable ranking constant reads from `ranking_config`, never a literal.

## Code standards

- No `any`, no non-null `!`, no `@ts-ignore`. `noUncheckedIndexedAccess` on.
- Actions return `Result<T, AppError>` (`{ ok: true, data } | { ok: false, error }`); never throw to the client. Order: session → zod parse → permission + trust → rate limit → service → `updateTag`.
- Server Components by default; client files end in `.client.tsx` and stay leaf-level.
- All user-visible strings go through i18n keys (`i18n/messages/en.json`); no string literals in JSX.
- Colours, type, radii, shadows, motion only via tokens (`docs/DESIGN-SYSTEM.md` §3–§8, §12). No hex in components; off-palette Tailwind classes do not exist.
- Reuse `shared/ui` primitives and their variants (`Button`, `ChipButton`, `Badge`, `Card`, tabs, `ImageSlot`, `Ticker`, toast) before writing new markup. A new primitive goes into DESIGN-SYSTEM §7 and §12.4 in the same PR.
- Rating states and diet marks use `VerdictPill`/`VerdictBar`/`DietMark` — never colour alone, never stars or a "4.2". Text on olive is ink; terracotta that carries text is `terracottaDeep`.
- Sentence case for every label; no ALL-CAPS, no italics, no trailing "→". Inder has one weight: no `font-bold` on Inder text except tiny pills and badges.
- Every dish element in a list carries `data-diet`; guest write actions go through `useSignInPrompt`/`IntentButton`, never a sign-up wall.
- Never hide decision information (scores, open status, prices, titles) behind JS-driven entrance animation; entrances on LCP elements are transform-only.
- Money is integer paise; time is `timestamptz` UTC, rendered in `Asia/Kolkata`. Coordinates are PostGIS `geography(Point,4326)`.
- IDs are uuidv7; public slugs are immutable, renames write a redirect row.
- Comments only where intent is non-obvious. No TODOs or placeholders in merged code.
- Names: files kebab-case; components PascalCase; actions `verbNounAction`; schemas `nounInputSchema`; tables snake_case plural.

## Git and PR workflow

- Branch from `main`: `feat/p<phase>-<slug>`, `fix/<slug>`, `chore/<slug>`. Never push to `main` directly.
- Conventional commits (`feat(ratings): …`). One concern per PR; ≤ ~400 changed lines excluding migrations and generated files.
- PR body: spec story IDs covered, screenshots (390 px and 1280 px) for UI, migration notes.
- Squash-merge after CI green and review. Migrations merge before code that depends on them.
- At the end of every phase update `docs/PROGRESS.md` in the same PR that closes the phase.

## Definition of done

1. Acceptance criteria of the referenced story IDs met; deviations recorded in ARCHITECTURE.md §Decisions.
2. Typecheck, lint, unit, e2e, build pass locally and in CI.
3. New rules (scores, limits, permissions, consensus) have unit tests; new flows have a Playwright test.
4. axe: no serious/critical violations; keyboard path works; reduced-motion respected.
5. Public pages: metadata, OG image, JSON-LD where applicable; LCP < 2 s on throttled mid-range Android profile.
6. Strings in i18n; no horizontal scroll at 390 px; no console errors.
7. Logs contain no secrets or personal data; analytics events emitted per `docs/ARCHITECTURE.md` §Analytics.

## Do not

- Do not read, print, request or commit secrets. Reference `.env.example` names only.
- Do not use `export const revalidate`/`dynamic` segment configs; Cache Components uses `use cache` + `cacheLife`.
- Do not use `middleware.ts`; the Next 16 convention is `proxy.ts`. It only returns 404s for unknown top-level paths and (later) optimistic redirects — authorise in the server. New top-level routes must be added to its matcher and `proxy.test.ts`.
- Do not query the database from components, `app/` files or client code.
- Do not add paid ranking, ads, scraped competitor data or third-party fingerprinting.
- Do not auto-apply "permanently closed", count disclosed ratings in scores, or show vote shares before a member votes.
- Do not skip, disable or `.only` tests; do not weaken lint/tsconfig rules to pass CI.
- Do not add dependencies without checking bundle impact and pinning exact versions for pre-1.0 packages.
- Do not run migrations against production outside the release workflow.

## Docs

- `docs/spec/MVP-SPEC.md` — product spec (source of truth)
- `docs/ARCHITECTURE.md` — structure, boundaries, data model, caching, jobs, decisions
- `docs/DESIGN-SYSTEM.md` — tokens, type, motion, components, a11y rules
- `docs/reference/fdn-landing-full.html` — visual reference for the design system (the doc wins on conflicts)
- `docs/PRODUCT-FLOWS.md` — W1–W11 mapped to routes, components, actions, jobs
- `docs/ROADMAP.md` — 7 phases with scope, exit criteria, tests
- `docs/PROGRESS.md` — phase checklist; update at the end of every phase
