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
| D6 | Analytics is first-party: `analytics_events` table (partitioning deferred, D34), client beacon + server emit, launch dashboard as SQL views in `/admin/analytics` | PostHog / external analytics | Product decision; keeps data owned |
| D7 | Error tracking = pino structured logs → Vercel logs (log drain optional); `onRequestError` + Inngest failure handlers log with route, digest, job id | Third-party error tracker | Product decision |
| D8 | Writes needing transactions use `drizzle-orm/neon-serverless` Pool; reads use `neon-http` | Spec silent | HTTP driver has no interactive transactions |
| D9 | Caching via Cache Components: spec "Revalidate N" → named `cacheLife` profiles + `cacheTag`; "on-demand" → `updateTag`/`revalidateTag` from actions/jobs | Route-segment ISR | `cacheComponents: true` in `next.config.ts` |
| D10 | Search = Postgres (`pg_trgm` `word_similarity` over an immutable `f_unaccent` wrapper, D35), alias table for canonical dishes; no `tsvector` until menus carry long descriptions | Spec silent | No extra service; meets 150 ms p95 at MVP scale |
| D11 | Maps: static map image + MapLibre GL on expand; tile provider chosen in Phase 1 (free tier, attribution shown) | E2-8 | Provider not yet fixed |
| D12 | Spec has no sections after §8; data model, API surface, admin and analytics events are defined here | Spec §9–14 references | Spec is final at its current length |
| D13 | `/privacy`, `/terms`, `/grievance` ship in P6 with reviewed legal copy and the grievance officer's details; P0 ships `/about` and `/guidelines` | Spec §3.2 static pages, E14-6 | Legal text and officer identity must come from the business, not be drafted by engineering |
| D14 | `proxy.ts` returns a real 404 for any first path segment that is not a known city or top-level route | Spec silent | `[city]` is a top-level dynamic segment; without the guard a first hit on an unknown slug streams a 200 soft-404 and is cached |
| D15 | Active state in the bottom nav is read after hydration | — | `usePathname()` under a fallback `[city]` param blocks the static shell; the nav renders without `aria-current` in the shell and updates on hydrate |
| D16 | Only `en` messages exist; `te`/`hi` catalogs are added when translations are ready, through the same `t()` helper | Spec "Telugu/Hindi-ready" | i18n keys from day one without shipping empty catalogs |
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
| D28 | The landing page is static and never reads the database or any data-layer module (the footer's area and dish links are static; the Score X-Ray uses its own demo constants in `features/landing/lib/score-xray.ts`), and its previews are illustrative (`features/landing/lib/content.ts`): places use the fictional brand names of the sample catalogue, numbers are sample values, and links go to existing pages or to spec routes that ship later (`/c/*`, `/communities`, `/battles`). Previews move to live queries once P2 search and chips land | Reference HTML used real restaurants with invented scores | No made-up verdicts about real businesses (same reason as D19); links resolve |
| D29 | AA colour pairing: `terracottaDeep` (#A9443D) is added for terracotta that carries text (CTA, Skip pill, warnings); text on olive fills is ink. `shared/ui/tokens.test.ts` enforces every text/surface pair | Design doc as received (paper on olive 2.9:1, paper on terracotta 4.1:1) | WCAG AA and the axe gate in the Definition of done |
| D30 | The landing commit changes no database, schema, seed, ranking config or data-layer module. Rating weights (§6.1) get their production home in `ranking_config` with ratings in P3; the landing Score X-Ray uses demo copies of the spec values | — | The landing work is UI/UX only |
| D31 | Veg-only is a device preference: `localStorage` plus `vegOnlyBootScript` (a `beforeInteractive` script in the root layout) set `.veg-only` on `<html>`, and CSS hides list items whose `data-diet` is `egg` or `nonveg`. Client lists (city dish board) also filter in JS so counts stay right. Members get a server-side default in P3 (E4-5) | Spec E4-5 (members only) | Works for guests with no cookie or flash |
| D32 | Until auth ships (P3), every guest write action shows the sign-in toast (`useSignInPrompt`, `IntentButton`) whose action links to `/login?next=<path>`; the Post button is a button, not a link to `/post/new` | W2 `AuthSheet` | Same intent copy and resume path now; P3 swaps the toast action for the sheet |
| D33 | `infra/ratelimit.ts` exposes `limit(policy, identifier)`: a sliding window over two fixed windows, one Lua script on the shared ioredis client (atomic read + conditional increment), mirroring the pure `shared/lib/sliding-window.ts`. It **fails closed** when Redis is unreachable. Without `REDIS_URL` an in-memory store is used outside production only; plain `redis://` is accepted in development and for a loopback host in production builds (CI and local e2e). Abuse guards for the beacon and typeahead are constants beside their handlers; §7.1 per-action quotas arrive in P3 as policies read from `ranking_config` | `@upstash/ratelimit` (§7.1); D3 detail | One client, testable formula, an outage never opens the gates |
| D34 | `analytics_events` has no foreign keys (events outlive entities and never wait on catalogue locks) and is one table; monthly partitions are added by migration when it nears ~10 M rows. The beacon accepts only same-origin requests (`Sec-Fetch-Site`, else `Origin` = `Host`), ≤ 4 KB, a strict zod union of client events, and inserts in `after()`. `fdn_did` is an httpOnly uuidv7 cookie (400 days, `SameSite=Lax`, `Secure` in production); IPs are hashed and used only as rate-limit keys, never stored. `user_id` stays null until P3 | D6 "monthly partitions"; §8 "device id hashed with UA family" | Partitions cost migrations and planner work before there is volume; a UA hash adds collisions without adding privacy |
| D35 | Search runs in two halves. Server: cached per normalised query (`cacheLife('search')`), one transaction sets `pg_trgm.word_similarity_threshold` (0.45, `ranking_config.search`) and collects dishes (own name, canonical name, aliases), restaurants, areas and cuisines through trigram GIN indexes on `f_unaccent(lower(…))`; with no query it returns the city's best 200 dishes (browse mode). Browser: chips, E4-2 filters, open status, distance and the §6.5 rank (0.6 text + 0.4 R) apply in place, so toggles never refetch; filters live in the URL. Search pages are `noindex, follow`. Restaurant results are not narrowed by dish filters | Spec silent on where filtering runs | One cached query per text; instant toggles; location never leaves the phone. Revisit browse mode when a city passes ~2 000 live dishes (move chips into SQL) |
| D36 | Phrases typed into search become chips or an area ("biryani under ₹300", "haleem near Old City", "open now") and are removed from the text before matching (`features/search/lib/query-intents.ts`) | Spec silent | The placeholder examples work as typed |
| D37 | Location is a device preference: a coarsened fix (3 decimals ≈ 110 m) in `localStorage` for 6 h, asked only from the soft banner. Distance, the Within 3 km chip, the distance filter and Trending's 5 km radius are computed in the browser; the server never receives coordinates. The §6.5 popularity term counts distinct devices that saved or asked directions in 7 days; its ratings term is 0 until P3 | §6.5 "R per user location" computed server-side | No personal data on the server, and pages stay cacheable |
| D38 | Context chips use the DESIGN-SYSTEM §7.2 vocabulary (Breakfast dropped; Rainy day, Within 3 km added). Occasion chips (rainy day, date night, family Sunday) match `branches.tags`, set by Ops; Biryani leaderboard matches the biryani category. On Discover the chips are toggles inside the search form and submit with the query | Earlier chip set | Matches the design system; tags are editorial, not inferred |
| D39 | Guest saves are a device list (`fdn:saves`, ≤ 20, validated on read) that stores a display snapshot (name, place, link, diet) so `/saved` renders without a request; the 21st save shows the sign-in prompt. `/saved` is a public route until accounts import device saves in P3 | Spec W2 "stored on device" | No server state for guests |
| D40 | Discover "Trending near you" ships at most 60 candidates, pre-ranked server-side with trending weights and no location; the browser narrows to 5 km and falls back to "Trending across Hyderabad" below 4 items | Spec §3.5 per-locality cached query | Bounded page weight; same cache for every guest |
| D41 | Email goes through `infra/email.ts`: Resend's HTTP API via `fetch` (no SDK) with sender `EMAIL_FROM` (Resend's test sender when unset). Without a key outside production, or when `EMAIL_OUTBOX_DIR` is set, each email is written as a JSON file instead; Playwright reads the links from there. The outbox is refused on Vercel production. Logs record only the email kind. D2 sign-in limits count attempts, not only failures | Resend SDK; spec silent on test transport | One small fetch call instead of a dependency; e2e covers the real verification and reset links |
| D42 | Member saves go to the default "Want to try" list. `MemberSync` (a header `<Suspense>` slot) marks the browser as signed in, imports any device saves through `importDeviceSavesAction` (valid targets only, de-duplicated, then the device list is cleared) and loads the saved keys; Save buttons toggle optimistically and roll back on failure. Default lists are created lazily and idempotently (partial unique index). "Been there" fills from ratings in P3 | Spec E1-4 "imported on first login" | Import runs at every sign-in while the device still holds saves, so a failed first attempt retries; no session state on the client beyond a flag |

## 2. Repository layout

```
app/                         routes only
  (marketing)/page.tsx                          / landing (D17)
  (public)/[city]/page.tsx                      /hyderabad
  (public)/[city]/search/page.tsx               noindex (D35)
  (public)/saved/page.tsx                       device saves (D39)
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
  (member)/post/new  rate/[branch]  notifications  settings
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

- **Read (public page):** `app/.../page.tsx` → `features/x/queries/*` (`'use cache'`, `cacheLife`, `cacheTag`) → `repo.ts` → Neon HTTP. Device-only state (distance, guest saves, veg-only, chip and filter toggles) is applied in client leaves over cached data (D25, D35, D37); member state ("your vote", saved lists) renders in a `<Suspense>` island that reads the session and passes values into cached functions as arguments.
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
| `search` | 10 min (expire 1 h) | search results, typeahead, Trending candidates |

Tags: `city:{slug}`, `locality:{id}`, `branch:{id}`, `branch-dish:{id}`, `dish:{canonicalId}`, `post:{id}`, `community:{id}`, `battle:{id}`, `list:{id}`, `user:{id}`.

## 5. Auth

- Better Auth (`features/auth/server/auth.ts`, built lazily by `getAuth()`) with the Drizzle adapter on the pooled client (`getWriteDb()`, transactions on); tables `users`, `sessions`, `accounts`, `verifications` in `db/schema/auth.ts` (`usePlural`), uuidv7 ids. Endpoints at `/api/auth/*` (`app/api/auth/[...all]/route.ts`). Telemetry off.
- Email + password with required verification; the verification link signs the member in and returns to `?next=` (checked by `safeNextPath`, no open redirects). Verification and reset emails go through `infra/email.ts` (Resend; a JSON outbox in development and e2e, D41). Links expire in 30 min; a password reset signs out every other session. Google is shown disabled (D1).
- D2 limits run in a Better Auth `before` hook on the shared Redis limiter, only on sign-up, sign-in, reset and email-sending endpoints, so session reads never touch it. Password policy: `features/auth/lib/password-policy.ts`, checked in the browser and again on the server.
- Session: database-backed, 30-day `expiresIn`, sliding `updateAge` 1 day, cookie `fdn.session_token` HttpOnly, SameSite=Lax, Secure on https. `getSession()` (`features/auth/queries/session.ts`) is per-request (`react.cache`) and renders inside `<Suspense>`; a failing auth backend degrades to guest instead of failing the page.
- Routes: `/login`, `/login/create`, `/login/forgot`, `/login/reset` (all `noindex`). The header shows Sign in or the member's avatar; `/saved` shows who is signed in and Sign out.
- Base URL `https://food-discovery-eta.vercel.app`, base path `/api/auth`. `BETTER_AUTH_API_KEY` is reserved for the Better Auth dashboard connection (`@better-auth/infra`, not wired yet).
- Roles on `profiles.role`: `member | ops | admin`; community moderators in `community_moderators`; trust in `profiles.trust_level` (`t0`/`t1`/`t2`/`founding`) recomputed nightly and after moderation.
- Onboarding gate: a user without `profiles.onboarded_at` is redirected to `/onboarding` by the session helper, not by `proxy.ts`.

## 6. Data model (Postgres, Drizzle)

All tables: `id uuid` (v7), `created_at`, `updated_at`; soft delete via `deleted_at` where content is user-generated.

| Domain | Tables |
| --- | --- |
| geo | `cities`, `localities` (center `geography`, boundary polygon, is_launch) |
| places | `brands`, `branches` (slug, brand, locality, `location geography(Point)`, status, price_band, veg_only, tags[] for occasion chips, food_score, aspect scores), `branch_hours`, `branch_cuisines`, `cuisines`, `slug_redirects` |
| facts | `facts` (branch, field, value jsonb, source, verified_at, freshness_days), `fact_confirmations`, `fact_proposals` |
| dishes | `dish_categories`, `canonical_dishes`, `canonical_dish_aliases`, `branch_dishes` (price_paise, diet, is_signature, score, loved_pct, rating_count, weight_sum, scored_at, last_seen_at), `leaderboard_snapshots` |
| users | Better Auth tables `users`, `sessions`, `accounts`, `verifications`; `profiles` (user_id pk, username lower-unique `^[a-z0-9_]{3,20}$`, display_name, bio ≤ 160, diet `veg|jain|egg|nonveg`, cuisines[] ≤ 5, home_locality, role, trust_level, adult_confirmed_at, onboarded_at), `username_redirects`, `brand_affiliations`, `user_blocks`, `devices` |
| ratings | `dish_ratings` (user, branch_dish, sentiment, post_id, disclosure, suspect, active, superseded_at), `aspect_ratings` (value/service/ambience, would_return) |
| content | `posts` (type experience/question/discussion, community, title, body, disclosure, embed_url, status, score, hot, on_site), `post_media`, `post_entities`, `comments` (parent, depth ≤ 6, path, accepted, status), `post_votes`, `comment_votes` |
| communities | `communities` (kind city/locality/topic), `community_members`, `community_moderators`, `community_pins`, `community_requests` |
| saves | `lists` (user, kind `want_to_try|been_there|custom` with one default of each per member, title, description, visibility `private|public`), `list_items` (branch, optional branch dish, note ≤ 280, position; unique per list and entity; ≤ 100 per list in the service) |
| battles | `battles` (canonical dish, two branch dishes, opens_at, closes_at, status, result), `battle_votes` |
| media | `media` (r2 key, mime, width, height, phash, screen_status) |
| notifications | `notifications`, `push_subscriptions`, `notification_prefs`, `visit_nudges` |
| moderation | `reports`, `moderation_cases`, `moderation_actions`, `strikes`, `appeals`, `audit_log` |
| analytics | `analytics_events` (name, device_id, user_id, branch_id, branch_dish_id, props jsonb, occurred_at; no FKs, partitions deferred, D34) |
| config | `ranking_config` (key, value jsonb, updated_by) |

Extensions: `postgis`, `pg_trgm`, `unaccent`. Required indexes: GiST on locations, trigram GIN on `f_unaccent(lower(name))` for dishes, canonical dishes, aliases, branches, localities and cuisines (D35), GIN on `branches.tags`, partial unique `(user_id, branch_dish_id) where active` on `dish_ratings`, unique votes per `(user, target)`.

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

`infra/ratelimit.ts` exposes `limit(policy, identifier)` (D33): sliding window in Redis, fails closed, `429` with `Retry-After` from route handlers. Identifiers are opaque: the `fdn_did` device cookie, a member id, or `clientIpKey()` (`infra/client-ip.ts`, a SHA-256 of the first `x-forwarded-for` hop).

| Policy | Limit | Where |
| --- | --- | --- |
| `events:ip` / `events:device` | 1 200 / 120 per minute | `POST /api/events` |
| `suggest:ip` | 300 per minute | `GET /api/search/suggest` |
| §7.1 per-action quotas by trust level | from `ranking_config` | server actions, P3 |

## 9. Analytics

Shared zod schema in `features/analytics/schemas/events.ts`; client sends via `track()` (`features/analytics/lib/track.ts`: `navigator.sendBeacon('/api/events')` with a text/plain body, `fetch(keepalive)` fallback), server emits directly. Entity ids go to indexed columns, the rest to `props` (D34). Live since P2: `search`, `search_result_click`, `chip_toggle`, `directions_click`, `call_click`, `share`, `save`, `location_prompt`; `page_view` is in the schema and gets an emitter with the P6 admin views. Guest `device_id` stitched to `user_id` on login. Minimum event set: `page_view`, `search`, `search_result_click`, `chip_toggle`, `directions_click`, `call_click`, `share`, `save`, `rate_submit`, `post_publish`, `comment_create`, `vote_cast`, `battle_vote`, `fact_confirm`, `signup_start`, `signup_complete`, `report_create`. Weekly Food Decisions and §1.4 metrics are SQL views.

## 10. Environment

Names only; values live in local `.env` and Vercel project settings, never in chat, code or commits. `.env.example` lists every name with empty values and is the only committed env file. Server code reads them through `infra/env.ts` (`requireEnv`).

| Variable | Used by |
| --- | --- |
| `DATABASE_URL` | Drizzle (HTTP + Pool), drizzle-kit, seed |
| `DATABASE_DRIVER` | `neon` (default) or `pg` for local/CI Postgres (D18) |
| `REDIS_URL` | ioredis (`rediss://`; `redis://` in development and for a loopback host, D33). Rate limiting fails closed without it in production |
| `R2_ACCOUNT_ID`, `S3_API`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` (optional) | R2 client |
| `API_TOKEN` | Cloudflare API token; not read by app code |
| `RESEND_API_KEY` | Verification and reset email via Resend (D41) |
| `EMAIL_FROM` | Verified Resend sender, e.g. `FDN <hello@your-domain>`; defaults to Resend's test sender |
| `EMAIL_OUTBOX_DIR` | Development and e2e only: write emails as JSON files instead of sending (D41) |
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
- CI (`.github/workflows/ci.yml`): `postgis/postgis:16-3.4` and `redis:7-alpine` services → `bun install --frozen-lockfile` → typecheck → lint → format check → `db:migrate` → `db:check` → `db:seed` → unit + integration → build → e2e.
