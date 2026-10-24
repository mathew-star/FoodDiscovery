# Architecture

One Next.js 16 app on Vercel serves the public site, member features, the API surface and the admin console. Postgres (Neon) is the system of record; Redis (Upstash) holds rate-limit windows, hot counters and short-lived locks; R2 holds photos; Inngest runs every asynchronous or scheduled job.

## 1. Decisions

Deviations from `docs/spec/MVP-SPEC.md` and choices the spec leaves open. Add a row for every new one.

| # | Decision | Replaces / fills | Reason |
| --- | --- | --- | --- |
| D1 | Sign-in = **email + password** (Better Auth `emailAndPassword`) with email verification and password reset via Resend. Google sign-in is deferred: the auth pages show a disabled "Continue with Google" button until it ships | Spec Google One Tap + phone OTP (E1-1, E1-2, W2.3) | Ship the core product first; no SMS vendor |
| D2 | Auth limits: password ≥ 10 chars checked against a common-password list; 5 failed sign-ins per email / 15 min and 20 per IP / hour; verification and reset emails 3 per email / 15 min; links expire in 30 min | E1-2 limits | Same abuse envelope as the spec's OTP rules |
| D3 | Redis client stays `ioredis` over `rediss://` (Upstash TCP); sliding-window limiter implemented as a Lua script on that client in `infra/ratelimit.ts` | `@upstash/ratelimit` (§7.1) | Upstash's documented ioredis path; one client for limiter, counters, locks. Singleton reused across warm Fluid invocations |
| D4 | No LLM in MVP. Pre-publish screening (E14-2, §7.2) is rule-based: link allowlist, PII regexes (Indian phone numbers, emails), blocklist, T0 link hold, pHash match against removed images. Screening is behind a `Screener` interface so a model can plug in later | LLM text + vision moderation | Product decision |
| D5 | Snap-to-post suggests **nearby branches only** (PostGIS ≤ 300 m) plus typeahead; no photo-based dish suggestion | E5-2 AI dish suggestion | Follows D4 |
| D6 | Analytics is first-party: `analytics_events` table (monthly partitions), client beacon + server emit, launch dashboard as SQL views in `/admin/analytics` | PostHog / external analytics | Product decision; keeps data owned |
| D7 | Error tracking = pino structured logs → Vercel logs (log drain optional); `onRequestError` + Inngest failure handlers log with route, digest, job id | Third-party error tracker | Product decision |
| D8 | Writes needing transactions use `drizzle-orm/neon-serverless` Pool; reads use `neon-http` | Spec silent | HTTP driver has no interactive transactions |
| D9 | Caching via Cache Components: spec "Revalidate N" → named `cacheLife` profiles + `cacheTag`; "on-demand" → `updateTag`/`revalidateTag` from actions/jobs | Route-segment ISR | `cacheComponents: true` in `next.config.ts` |
| D10 | Search = Postgres (`pg_trgm` similarity + `unaccent` + `tsvector`), alias table for canonical dishes; distance via PostGIS | Spec silent | No extra service; meets 150 ms p95 at MVP scale |
| D11 | Maps: static map image + MapLibre GL on expand; tile provider chosen in Phase 1 (free tier, attribution shown) | E2-8 | Provider not yet fixed |
| D12 | Spec has no sections after §8; data model, API surface, admin and analytics events are defined here | Spec §9–14 references | Spec is final at its current length |
| D13 | `/privacy`, `/terms`, `/grievance` ship in P6 with reviewed legal copy and the grievance officer's details; P0 ships `/about` and `/guidelines` | Spec §3.2 static pages, E14-6 | Legal text and officer identity must come from the business, not be drafted by engineering |
| D14 | `proxy.ts` returns a real 404 for any first path segment that is not a known city or top-level route | Spec silent | `[city]` is a top-level dynamic segment; without the guard a first hit on an unknown slug streams a 200 soft-404 and is cached |
| D15 | Active state in the bottom nav is read after hydration | — | `usePathname()` under a fallback `[city]` param blocks the static shell; the nav renders without `aria-current` in the shell and updates on hydrate |
| D17 | `/` is a marketing landing page (static) that leads into `/hyderabad`; it no longer redirects | Spec §3.2 `/` redirect | Product request; first-time visitors need the pitch, deep links still land on entity pages |
| D18 | `DATABASE_DRIVER=pg` switches Drizzle to node-postgres for local and CI databases; default `neon` uses Neon HTTP for reads and the Neon Pool for transactions | D8 | Same schema and queries everywhere; Neon drivers cannot talk to a plain Postgres |
| D19 | Sample catalogue (`db/seed/`) uses fictional brands, real locality names, no phone numbers, and writes dish/branch aggregates directly from simulated ratings using the real §6.1/6.2 formulas. From P3 the seed creates sample ratings and the recompute job owns aggregates | Spec §13 seeding | Realistic pages before ratings exist, without inventing facts about real businesses |
| D20 | Features may contain `lib/` for pure, client-safe domain logic (opening hours, scoring, JSON-LD builders) | §2 layout | Keeps rules testable and shareable between queries, jobs and components |
| D21 | Open/closed status renders as a request-time hole (`connection()` inside `<Suspense>`) on otherwise static pages | Spec "Answer first" | Cached HTML must never show a stale open state |
| D22 | Catalogue routes prerender from `generateStaticParams` at build, so `next build` needs a migrated, seeded database (CI uses a PostGIS service; Vercel uses Neon) | — | Static shells for every public entity page; unknown slugs get the not-found UI with a 200 and `noindex` on first hit (framework behaviour under Cache Components) |
| D23 | ~~Visual identity "Token & Stamp"~~ — superseded by D26 | Earlier "Ghee & Saffron" tokens | — |
| D24 | ~~Motion with `motion` and `animejs`~~ — superseded by D27 | Spec silent | — |
| D25 | City dish filters run client-side over the cached ranking (area, price cap, open now) and sync the URL with `history.replaceState`; the server still parses `searchParams` for the initial state | E3-2 | Instant, animated filtering without extra requests; shareable URLs |
| D26 | Visual identity is the warm-brutalist FDN design system (`docs/DESIGN-SYSTEM.md`, reference `docs/reference/fdn-landing-full.html`): Bricolage Grotesque + Inder, fixed cream/ink/lime/olive/terracotta/saffron palette, 2px ink borders, hard offset shadows. One light theme: the theme switch, theme cookie and dark tokens are removed, and Tailwind's default palette is reset so off-palette classes don't exist | D23 "Token & Stamp", light/dark themes | Product request; the palette and its single dark section are designed as fixed |
| D27 | Motion is CSS only (DESIGN-SYSTEM §8 tokens); `motion` and `animejs` are removed. No scroll-reveal; motion follows a user action except live dots, the ticker and the typed placeholder | D24 | Design-system rule; smaller client bundles on cheap phones |
| D28 | The landing page is static and never reads the database (the footer's area and dish links are static too; the Score X-Ray uses `rankingConfigDefaults` and `defaultRatingWeights`), and its previews are illustrative (`features/landing/lib/content.ts`): places are the fictional seeded brands (a unit test checks every slug against `db/seed`), numbers are sample values, and links go to existing pages or to spec routes that ship later (`/c/*`, `/communities`, `/battles`). Previews move to live queries once P2 search and chips land | Reference HTML used real restaurants with invented scores | No made-up verdicts about real businesses (same reason as D19); links resolve |
| D29 | AA colour pairing: `terracottaDeep` (#A9443D) is added for terracotta that carries text (CTA, Skip pill, warnings); text on olive fills is ink. `shared/ui/tokens.test.ts` enforces every text/surface pair | Design doc as received (paper on olive 2.9:1, paper on terracotta 4.1:1) | WCAG AA and the axe gate in the Definition of done |
| D30 | `ratingWeight()` in `features/ratings/lib/score.ts` applies the §6.1 weights (trust T0 0.5, T1 1.0, T2/Founding 1.2; 270-day half-life; disclosed or held ratings at 0). Until P3 the weights are a code constant, `defaultRatingWeights`, with no database row or migration; P3 moves them into `ranking_config` with its own migration | Spec §6.1 constants; AGENTS rule that tunable constants live in `ranking_config` | No database changes during the UI phase. The landing Score X-Ray runs this code (D28) |
| D31 | Veg-only is a device preference: `localStorage` plus `vegOnlyBootScript` (a `beforeInteractive` script in the root layout) set `.veg-only` on `<html>`, and CSS hides list items whose `data-diet` is `egg` or `nonveg`. Client lists (city dish board) also filter in JS so counts stay right. Members get a server-side default in P3 (E4-5) | Spec E4-5 (members only) | Works for guests with no cookie or flash |
| D32 | Until auth ships (P3), every guest write action shows the sign-in toast (`useSignInPrompt`, `IntentButton`) whose action links to `/login?next=<path>`; the Post button is a button, not a link to `/post/new` | W2 `AuthSheet` | Same intent copy and resume path now; P3 swaps the toast action for the sheet |
| D16 | Only `en` messages exist; `te`/`hi` catalogs are added when translations are ready, through the same `t()` helper | Spec "Telugu/Hindi-ready" | i18n keys from day one without shipping empty catalogs |

## 2. Repository layout

```
app/                         routes only
  (marketing)/page.tsx                          / landing (D17)
  (public)/[city]/page.tsx                      /hyderabad
  (public)/[city]/search/page.tsx
  (public)/[city]/area/[locality]/page.tsx
  (public)/[city]/dish/[dish]/page.tsx
  (public)/[city]/cuisine/[cuisine]/page.tsx
  (public)/[city]/top/[dish]/page.tsx
  (public)/r/[branch]/page.tsx  r/[branch]/dish/[branchDish]/page.tsx
  (public)/p/[postId]/[slug]/page.tsx  c/[community]/page.tsx
  (public)/battles/page.tsx  battles/[battleId]/[slug]/page.tsx
  (public)/lists/[listId]/[slug]/page.tsx  u/[username]/page.tsx
  (public)/(static)/{about,guidelines,privacy,terms,grievance}/page.tsx
  (auth)/login  (auth)/onboarding
  (member)/post/new  rate/[branch]  saved  notifications  settings
  (admin)/admin/…                               staff role required
  api/auth/[...all]/route.ts                    Better Auth
  api/inngest/route.ts                          Inngest serve
  api/search/suggest/route.ts                   typeahead GET
  api/events/route.ts                           analytics beacon
  manifest.ts  robots.ts  sitemap.ts  **/opengraph-image.tsx
features/<domain>/
  components/   *.tsx (RSC) and *.client.tsx
  server/       actions.ts  service.ts  repo.ts  permissions.ts
  queries/      cached reads
  schemas/      zod
  hooks/        client hooks
  jobs/         Inngest functions
  lib/          pure domain logic, safe on client and server (D20)
shared/ui/      design-system primitives (+ og-card, json-ld, breadcrumbs); map in DESIGN-SYSTEM §12.4
shared/lib/     cn, result, time, geo, slug, money, uuid
shared/config/  site URL, sign-in path
db/             schema/<domain>.ts  client.ts (getDb, withTransaction)  migrations/  seed/ (sample catalogue)
infra/          env, logger, redis, ratelimit, r2, inngest/{client,functions}.ts, email, startup
i18n/           index.ts (typed t), messages/en.json
proxy.ts        404 for unknown first segments (D14); later optimistic redirect for (member)/(admin) without a session cookie
instrumentation.ts
tests/e2e/      Playwright; unit tests sit beside code as *.test.ts
```

**Domains:** `shell` (top bar, bottom nav, footer, sign-in prompt, service worker), `landing` (marketing page at `/`, D17/D28), `content` (static pages), `auth`, `profile`, `geo` (cities, localities), `places` (brands, branches, hours), `dishes` (canonical dishes, branch dishes, leaderboards), `search`, `discover`, `ratings`, `posts`, `comments`, `votes`, `communities`, `saves` (saves, lists), `battles`, `facts`, `media`, `notifications`, `moderation`, `analytics`, `admin`.

**Top-level routes** are listed in the `proxy.ts` matcher (D14). Adding a top-level route means adding it there and to `proxy.test.ts`.

## 3. Boundaries

| From \ To | app | features/x (public) | features/x (private) | shared | db | infra |
| --- | --- | --- | --- | --- | --- | --- |
| `app/` | — | yes | no | yes | no | no |
| `features/y` | no | yes | no | yes | own `repo.ts` only | yes (server files) |
| `shared/` | no | no | no | yes | no | no |
| client files | no | components, schemas, hooks, actions | no | yes | no | no |

Public surface = `components/`, `queries/`, `schemas/`, `hooks/`, `server/actions.ts`. Private = `server/service.ts`, `server/repo.ts`, `server/permissions.ts`, `jobs/`. Enforced by `eslint-plugin-boundaries` + `no-restricted-imports`; `server-only` guards runtime.

## 4. Request paths

- **Read (public page):** `app/.../page.tsx` → `features/x/queries/*` (`'use cache'`, `cacheLife`, `cacheTag`) → `repo.ts` → Neon HTTP. Personalised bits (distance, saved state, diet filter, "your vote") render in a `<Suspense>` island that reads cookies/location and passes values into cached functions as arguments.
- **Write:** client form → `server/actions.ts` → session → `schemas` parse → `permissions.ts` (role + trust) → `infra/ratelimit` → `service.ts` (transaction on Pool) → `updateTag(...)` → optional `inngest.send(...)` → `Result`.
- **Route handlers** return JSON with `Cache-Control` set explicitly; limiter failures return `429` with `{ retry_after }`.
- **Jobs:** emitted events (`rating/created`, `post/published`, `vote/cast`, `branch/action`, …) or crons. Jobs are idempotent (event id as key), retry with backoff, and call `revalidateTag` for affected entities.

### Cache profiles (`next.config.ts` `cacheLife`)

| Profile | revalidate | Used by |
| --- | --- | --- |
| `feed` | 60–120 s | battles, posts, communities |
| `city` | 5 min | Discover home, Discover sections per locality |
| `branch` | 10 min | branch, branch dish, list, profile pages |
| `catalog` | 15 min | area, city dish, leaderboard |
| `cuisine` | 1 h | cuisine landing |

Tags: `city:{slug}`, `locality:{id}`, `branch:{id}`, `branch-dish:{id}`, `dish:{canonicalId}`, `post:{id}`, `community:{id}`, `battle:{id}`, `list:{id}`, `user:{id}`.

## 5. Auth

- Better Auth with Drizzle adapter; tables `user`, `session`, `account`, `verification` in `db/schema/auth.ts`.
- Providers: email + password with required email verification; verification and reset emails sent through Resend (`features/auth/emails/`). Google social provider added later (D1).
- Session: database-backed, 30-day `expiresIn`, sliding `updateAge` 1 day, cookie HttpOnly, Secure, SameSite=Lax. Sessions listed/revocable in settings; all revoked on ban or deletion.
- Base URL `https://food-discovery-eta.vercel.app`, base path `/api/auth`. Dashboard connection uses `BETTER_AUTH_API_KEY`.
- Roles on `profiles.role`: `member | ops | admin`; community moderators in `community_moderators`; trust in `profiles.trust_level` (T0/T1/T2/FOUNDING) recomputed nightly and after moderation.
- Onboarding gate: a user without `profiles.onboarded_at` is redirected to `/onboarding` by the session helper, not by `proxy.ts`.

## 6. Data model (Postgres, Drizzle)

All tables: `id uuid` (v7), `created_at`, `updated_at`; soft delete via `deleted_at` where content is user-generated.

| Domain | Tables |
| --- | --- |
| geo | `cities`, `localities` (center `geography`, boundary polygon, is_launch) |
| places | `brands`, `branches` (slug, brand, locality, `location geography(Point)`, status, price_band, veg_only, food_score, aspect scores), `branch_hours`, `branch_cuisines`, `cuisines`, `slug_redirects` |
| facts | `facts` (branch, field, value jsonb, source, verified_at, freshness_days), `fact_confirmations`, `fact_proposals` |
| dishes | `dish_categories`, `canonical_dishes`, `canonical_dish_aliases`, `branch_dishes` (price_paise, diet, is_signature, score, loved_pct, rating_count, weight_sum, scored_at, last_seen_at), `leaderboard_snapshots` |
| users | Better Auth tables, `profiles` (username, display_name, bio, diet, cuisines[], home_locality, role, trust_level, adult_confirmed_at, onboarded_at), `username_redirects`, `brand_affiliations`, `user_blocks`, `devices` |
| ratings | `dish_ratings` (user, branch_dish, sentiment, post_id, disclosure, suspect, active, superseded_at), `aspect_ratings` (value/service/ambience, would_return) |
| content | `posts` (type experience/question/discussion, community, title, body, disclosure, embed_url, status, score, hot, on_site), `post_media`, `post_entities`, `comments` (parent, depth ≤ 6, path, accepted, status), `post_votes`, `comment_votes` |
| communities | `communities` (kind city/locality/topic), `community_members`, `community_moderators`, `community_pins`, `community_requests` |
| saves | `lists` (kind want_to_try/been_there/custom, visibility), `list_items` (branch or branch_dish, rank, note) |
| battles | `battles` (canonical dish, two branch dishes, opens_at, closes_at, status, result), `battle_votes` |
| media | `media` (r2 key, mime, width, height, phash, screen_status) |
| notifications | `notifications`, `push_subscriptions`, `notification_prefs`, `visit_nudges` |
| moderation | `reports`, `moderation_cases`, `moderation_actions`, `strikes`, `appeals`, `audit_log` |
| analytics | `analytics_events` (name, device_id, user_id, props jsonb, occurred_at; monthly partitions) |
| config | `ranking_config` (key, value jsonb, updated_by) |

Extensions: `postgis`, `pg_trgm`, `unaccent`. Required indexes: GiST on locations, trigram GIN on names/aliases, partial unique `(user_id, branch_dish_id) where active` on `dish_ratings`, unique votes per `(user, target)`.

## 7. Jobs (Inngest)

| Function | Trigger | Spec |
| --- | --- | --- |
| `ratings/recompute-dish` | `rating/created` debounced 30 s per branch dish | §6.1, E6-4 |
| `ratings/recompute-all` | cron nightly 03:00 IST | §6.1–6.2 |
| `posts/hot-decay` | cron every 15 min | §6.4 |
| `profile/recompute-trust` | cron nightly + `moderation/action` | §2.2 |
| `dishes/leaderboards` | cron hourly; weekly snapshot Mon 00:00 | §6.8 |
| `moderation/review-bomb-scan` | `rating/created` + nightly | §7.3 |
| `media/screen-photo` | `media/uploaded` | §7.2 (D4) |
| `facts/escalate-proposals` | cron daily (14-day window) | §6.6 |
| `battles/close` | `battle/opened` → `sleepUntil(closes_at)` | W7, E10-4 |
| `posts/boost-unanswered` | `post/published` (question) → sleep 2 h | W5 |
| `notifications/visit-nudge` | `branch/action` (directions/call) → sleep to 12:30/19:30 IST | W11 |
| `notifications/weekly-digest` | cron weekly | E13-4 |
| `profile/export-data` | `profile/export.requested` | E1-7 |
| `profile/hard-delete` | `profile/deleted` → sleep 30 d | E1-7 |

## 8. Rate limits and anti-abuse

`infra/ratelimit.ts` exposes `limit(action, { userId, trust, ip })`; windows and quotas from §7.1 live in `ranking_config` so they tune without a deploy. Device id = first-party `fdn_did` cookie hashed with UA family.

## 9. Analytics

Shared zod schema in `features/analytics/schemas/events.ts`; client sends via `navigator.sendBeacon('/api/events')`, server emits directly. Guest `device_id` stitched to `user_id` on login. Minimum event set: `page_view`, `search`, `search_result_click`, `chip_toggle`, `directions_click`, `call_click`, `share`, `save`, `rate_submit`, `post_publish`, `comment_create`, `vote_cast`, `battle_vote`, `fact_confirm`, `signup_start`, `signup_complete`, `report_create`. Weekly Food Decisions and §1.4 metrics are SQL views.

## 10. Environment

Names only; values live in local `.env` and Vercel project settings, never in chat, code or commits. `.env.example` lists every name with empty values and is the only committed env file. Server code reads them through `infra/env.ts` (`requireEnv`).

| Variable | Used by |
| --- | --- |
| `DATABASE_URL` | Drizzle (HTTP + Pool), drizzle-kit, seed |
| `DATABASE_DRIVER` | `neon` (default) or `pg` for local/CI Postgres (D18) |
| `REDIS_URL` | ioredis (`rediss://`) |
| `R2_ACCOUNT_ID`, `S3_API`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` (optional) | R2 client |
| `API_TOKEN` | Cloudflare API token; not read by app code |
| `RESEND_API_KEY` | OTP and transactional email |
| `BETTER_AUTH_API_KEY` | Better Auth dashboard connection |
| `BETTER_AUTH_SECRET` | Better Auth signing/encryption secret |
| `BETTER_AUTH_URL` | Better Auth base URL: `http://localhost:3000` locally, `https://food-discovery-eta.vercel.app` on Vercel |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in when enabled (D1); OAuth redirect URI `{BETTER_AUTH_URL}/api/auth/callback/google` |
| `STARTUP_CHECKS` | `1` runs Neon/Redis/R2 checks at server start; unset on Vercel |
| `VERCEL_PROJECT_PRODUCTION_URL` | Set by Vercel; used for `metadataBase`, sitemap and robots (falls back to `http://localhost:3000`) |
| `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | Inngest (to add before Phase 3) |
| `R2_PUBLIC_URL` | Public/CDN origin for photos (to add before Phase 4) |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Web push (to add before Phase 6) |
| `LOG_LEVEL` | pino |

## 11. Testing and CI

- Unit: Vitest, beside code (`*.test.ts`) — scores, hot/Wilson, consensus, trust, limits, slugs, schemas.
- Integration: `tests/integration/*.test.ts`, Vitest against a migrated and seeded Postgres (`DATABASE_DRIVER=pg`); skipped when no database is configured.
- Jobs: `@inngest/test`.
- E2E: Playwright on `next build && next start` with seeded DB; `@axe-core/playwright` on every page visited (one light theme, D26). `tests/e2e/landing.spec.ts` covers the landing interactions.
- Design tokens: `shared/ui/tokens.test.ts` pins the palette to DESIGN-SYSTEM §3.1, checks AA for every text/surface pair and keeps the OG palette in sync.
- CI (`.github/workflows/ci.yml`): `postgis/postgis:16-3.4` service → `bun install --frozen-lockfile` → typecheck → lint → format check → `db:migrate` → `db:check` → `db:seed` → unit + integration → build → e2e.
