# Roadmap

Seven phases, each shippable to the beta environment. Story IDs from `docs/spec/MVP-SPEC.md` §5; workflow IDs from §4. P0 stories block launch; P1 stories ride their phase if time holds, else the first post-launch sprint.

## P0 Foundations

**Scope:** repo hygiene, tooling, shell, design system.
- Fix `.gitignore` so `.env.example` is committed; sync `bun.lock`; pin pre-1.0 deps; drop `dotenv` from runtime code; resolve `sharp` script config.
- Move `lib/` → `infra/`, `drizzle/src/` → `db/`; add Pool client (D8); gate startup checks behind `STARTUP_CHECKS=1`.
- Scripts: `typecheck`, `test`, `test:e2e`, `format`; ESLint boundaries; `noUncheckedIndexedAccess`.
- CI workflow (ARCHITECTURE §11).
- Tokens + fonts + `shared/ui` primitives (DESIGN-SYSTEM §1–2); light/dark theme switch.
- App shell: `TopBar`, `BottomNav`, `CitySwitcher` (§3.1); `/` → `/hyderabad`; i18n scaffolding (en keys, te/hi files).
- PWA `manifest.ts`, icons, offline fallback page; `robots.ts`.
- Static pages `/about`, `/guidelines` (§7.7). `/privacy`, `/terms`, `/grievance` move to P6 (D13).

**Exit:** CI green on a PR; shell LCP < 2 s on Lighthouse mobile (throttled); axe 0 serious; contrast test passes.
**Tests:** Vitest contrast/token test, Result/slug utils; Playwright smoke (shell, nav, theme toggle, static pages) + axe.

## P1 Catalogue (read-only)

**Scope:** E2-1…E2-8, E3-1, E3-2, E3-5, E4-6, E12-1, E12-2; §3.2 routes `/r/*`, `/hyderabad/dish/*`, `/hyderabad/cuisine/*`, `/hyderabad/area/*`.
- Schema: geo, places, facts (read side), dishes, `ranking_config`; extensions `postgis`, `pg_trgm`, `unaccent`.
- Seed tooling (CSV → validated import) for 3 launch localities; minimal `/admin` entity CRUD + canonical dish/alias merge (E3-5).
- Branch, branch-dish, city-dish, cuisine, area pages; static map; slug redirects.
- OG images per entity, JSON-LD (Restaurant, BreadcrumbList), `sitemap.ts`, canonical URLs.

**Exit:** seeded localities browsable as guest; E2-1 above-the-fold at 390×844; OG renders in WhatsApp debugger; pages LCP < 2 s.
**Tests:** integration (repos on PostGIS container), slug collision + redirect, open-now computation incl. overnight hours; Playwright branch/dish pages + axe; OG route snapshot.

## P2 Search and Discover

**Scope:** W1; E4-1…E4-5, E4-7; E9-1; §6.5; E16-1 (pipeline + discovery events).
- Typeahead route handler, grouped results, typo tolerance, filters, context chips as in-place toggles (DESIGN-SYSTEM §7.2).
- Landing previews (hero proof card, mode panels) read live queries instead of illustrative content (D28) — moved to P5, when ratings and battles make the live numbers meaningful.
- Discover sections with city-wide fallback ("Across Hyderabad").
- `LocationBanner`, distance labels, Directions/Call/Share with events; guest device saves.
- `analytics_events` table + beacon endpoint + device id cookie.

**Exit:** typeahead p95 < 150 ms server on seed data; "biriyani" → biryani; every Discover section non-empty; events land with device id.
**Tests:** §6.5 ranking unit tests; search relevance fixtures; chip → filter mapping; Playwright W1 end-to-end.

## P3 Accounts and ratings

**Scope:** W2, W3; E1-2 (as email + password, D1), E1-3…E1-7, E4-5, E6-1…E6-4, E9-2, E9-3; §2.2 trust, §7.1 limits; Inngest. E1-1 Google sign-in deferred (button shown disabled).
- Better Auth email + password, verification and reset emails via Resend (D1/D2), sessions, onboarding, device-save import.
- Profiles, settings (sessions list/revoke, data export, delete account).
- Rating sheet, aspect ratings, score jobs (§6.1–6.3), nightly recompute, What to order here goes live.
- Trust levels, `infra/ratelimit.ts` (D3), lists (default + custom).

**Exit:** sign-in resumes original intent; under-18 blocked; score visible < 60 s after rating; re-rate keeps history; limits return `rate_limited` with retry.
**Tests:** score/aspect/trust unit tests with spec examples; limiter tests against Redis container; `@inngest/test` for recompute; Playwright W2 + W3 (verification emails captured by a test transport).

## P4 Posts, comments, communities

**Scope:** W4, W5, W6; E5-1, E5-3…E5-8, E7-1…E7-4, E8-1…E8-4, E14-2 (rule-based, D4); E5-2 reduced to nearby branches (D5).
- R2 presigned uploads, client compression, `media/screen-photo` (pHash).
- Experience / question / discussion posts, embeds (lite YouTube, Instagram link card), disclosure, on-site mark.
- Threaded comments (depth 6), votes (optimistic), Hot/Top/New, Best/New, accepted answers.
- Seeded communities, join/leave, moderator pin/remove/lock, community requests.

**Exit:** experience post publishes in < 15 s on 4G profile; held content invisible to others; sort orders match §6.4 fixtures.
**Tests:** hot/Wilson unit tests; screener rule tests; comment depth/edit-window tests; Playwright W4–W6 with real R2 stubbed by a local S3-compatible mock.

## P5 Battles, leaderboards, living facts

**Scope:** W7, W8, W9; E10-1…E10-4, E3-3, E9-4, E11-1…E11-4, E12-3; §6.6–6.8.
- Battle create/approve, vote with hidden shares, close job, result card, city-community post.
- Leaderboards hourly + weekly snapshot; rank arrows.
- Fact confirm/propose, consensus engine, Ops corrections queue.
- Public lists with map; 1080×1350 share images.
- Landing previews (hero proof card, mode panels) switch to live queries (D28, from P2).

**Exit:** consensus rule table fully covered; battle results exclude flagged votes and log the count; leaderboard minimums enforced.
**Tests:** consensus table-driven tests (every §6.6 branch); battle eligibility (24 h) and hidden-share tests; Playwright W7–W9.

## P6 Safety, notifications, admin, launch

**Scope:** W10, W11; E13-1…E13-4, E14-1, E14-3…E14-5, E16-2, §7.3–7.6, admin console (§3.4), E3-4.
- Reports, auto-hide, queue by severity, actions, strikes, appeals, audit log, user blocks.
- Review-bombing detection (§7.3), brand affiliations zero-weighting.
- In-app notifications, web push (prompt after first post/save), visit nudge, weekly digest (Resend).
- Admin: users, communities, battles, queues, audit, seeding, analytics dashboard views.
- `/privacy`, `/terms`, `/grievance` with reviewed legal copy and officer details (D13, E14-6).
- Google sign-in (E1-1) if prioritised.
- Launch hardening: perf budget on every public route, full a11y pass.

**Exit:** every moderation action writes audit + notifies; nudge max 1/day; all public routes LCP < 2 s; 0 serious axe issues; §1.4 metrics queryable.
**Tests:** detection rule unit tests; admin RBAC e2e; push/email contract tests; Lighthouse CI budgets; Playwright W10, W11.
