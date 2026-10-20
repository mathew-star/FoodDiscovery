# Architecture

One Next.js 16 app on Vercel serves the public site, member features, the API surface and the admin console. Postgres (Neon) is the system of record; Redis (Upstash) holds rate-limit windows, hot counters and short-lived locks; R2 holds photos; Inngest runs every asynchronous or scheduled job.

## 1. Decisions

Deviations from `docs/spec/MVP-SPEC.md` and choices the spec leaves open. Add a row for every new one.

| # | Decision | Replaces / fills | Reason |
| --- | --- | --- | --- |
| D1 | Sign-in = Google (One Tap + button) **or email OTP** via Resend | Spec phone OTP (E1-2, W2.3) | No SMS vendor in MVP; Resend already provisioned |
| D2 | Email OTP rules: 6 digits, 5-min expiry, 5 verify attempts, 3 sends per email / 15 min, 10 per IP / hour, resend after 30 s | E1-2 limits | Same abuse envelope as the spec's phone OTP |
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

## 2. Repository layout

```
app/                         routes only
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
shared/ui/      design-system primitives
shared/lib/     result, geo, time, slug, money, format, i18n helpers
db/             schema/<domain>.ts  client.ts  migrations/  seed/
infra/          env, logger, redis, ratelimit, r2, inngest/{client,functions}.ts, email, startup
i18n/           messages/{en,te,hi}.json  config.ts
proxy.ts        optimistic redirect for (member)/(admin) when no session cookie
instrumentation.ts
tests/e2e/      Playwright; unit tests sit beside code as *.test.ts
```

Phase 0 moves today's `lib/*` → `infra/*` and `drizzle/src/*` → `db/*` (and `drizzle.config.ts` paths).

**Domains:** `auth`, `profile`, `geo` (cities, localities), `places` (brands, branches, hours), `dishes` (canonical dishes, branch dishes, leaderboards), `search`, `discover`, `ratings`, `posts`, `comments`, `votes`, `communities`, `saves` (saves, lists), `battles`, `facts`, `media`, `notifications`, `moderation`, `analytics`, `admin`.

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
- Providers: Google social + One Tap plugin; Email OTP plugin sending through Resend (`features/auth/emails/otp.tsx`).
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
| `DATABASE_URL` | Drizzle (HTTP + Pool), drizzle-kit |
| `REDIS_URL` | ioredis (`rediss://`) |
| `R2_ACCOUNT_ID`, `S3_API`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` (optional) | R2 client |
| `API_TOKEN` | Cloudflare API token; not read by app code |
| `RESEND_API_KEY` | OTP and transactional email |
| `BETTER_AUTH_API_KEY` | Better Auth dashboard connection |
| `BETTER_AUTH_SECRET` | Better Auth signing/encryption secret |
| `BETTER_AUTH_URL` | Better Auth base URL: `http://localhost:3000` locally, `https://food-discovery-eta.vercel.app` on Vercel |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in; OAuth redirect URI `{BETTER_AUTH_URL}/api/auth/callback/google` |
| `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | Inngest (to add before Phase 3) |
| `R2_PUBLIC_URL` | Public/CDN origin for photos (to add before Phase 4) |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Web push (to add before Phase 6) |
| `LOG_LEVEL` | pino |

## 11. Testing and CI

- Unit: Vitest, beside code (`*.test.ts`) — scores, hot/Wilson, consensus, trust, limits, slugs, schemas.
- Integration: Vitest against a `postgis/postgis` container (CI service) with migrations applied; repos and services only.
- Jobs: `@inngest/test`.
- E2E: Playwright on `next build && next start` with seeded DB; `@axe-core/playwright` on every page visited.
- CI (`.github/workflows/ci.yml`, Phase 0): `bun install --frozen-lockfile` → `next typegen` → `tsc --noEmit` → lint → unit → integration → build → e2e.
