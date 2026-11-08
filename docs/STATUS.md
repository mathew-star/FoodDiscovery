# FDN status

The current state of the project in one page: what is built, where it is, how to release it, what comes next. Updated 2026-11-08. Detail lives in the documents linked from each section.

## 1. What we are building

FDN (Food Discovery Network) is a mobile-first web app and installable PWA for Hyderabad that answers one question fast: **what should I order, and where?**

- **Dish first.** Every rating attaches to a dish at a specific branch ("Mutton Haleem at Noor-e-Deccan Kitchen, Old City"), not to a restaurant as a whole.
- **Honest verdicts, not stars.** Members rate dishes Loved / Good / Okay / Skip. Scores are trust-weighted, decay with age and are shrunk toward the city average until there is enough evidence (spec §6.1).
- **Guests read everything.** An account is asked for only at the moment of a write action (rate, save beyond 20, post, vote).
- **Owned data.** Seeded catalogue plus community contributions; no scraped data, no paid ranking, no third-party analytics.

Sources: product spec `docs/spec/MVP-SPEC.md`; deviations and decisions D1–D54 in `docs/ARCHITECTURE.md` §1; design system `docs/DESIGN-SYSTEM.md`.

## 2. Where it stands

| Place | State |
| --- | --- |
| Branch `claude/food-discovery-audit-7wepur` | Everything below. All checks green locally on a fresh seed |
| `main` (and the Vercel site) | Up to onboarding (commit `31a9893`). **Not yet merged:** member saves, ratings, adding a missing dish, nightly jobs (4 commits) |
| Neon database | Migrated by you up to `20261025113625_auth_profiles` (assumed from your last update). Three newer migrations are waiting (§7) |

Phase summary (`docs/ROADMAP.md`, checklist in `docs/PROGRESS.md`):

| Phase | Status |
| --- | --- |
| P0 Foundations | Done |
| P1 Catalogue | Done except admin entity editing, maps and a live OG check |
| P2 Search and Discover | Done except two Discover sections that need P4/P5 data |
| P3 Accounts and ratings | Most of it built; places, Ops queue, owner claims, settings and custom lists remain |
| P4 Posts, comments, communities | Not started |
| P5 Battles, leaderboards, living facts | Not started |
| P6 Safety, notifications, admin, launch | Not started |

## 3. What works today

### For a guest (no account)

| Area | What they can do | Spec |
| --- | --- | --- |
| Landing `/` | Marketing page: live proof card, dish battle demo, six-step journey, four ways in, community preview, Score X-Ray, FAQ, install prompt | D17, D28 |
| Discover `/hyderabad` | Search bar with typeahead, context chips, "Trending near you" (falls back to "across Hyderabad"), top dishes, category shelves, area board | E4-4, §6.5 |
| Search `/hyderabad/search` | Typo-tolerant search ("biriyani" finds biryani) over dishes, restaurants, areas and cuisines; typed phrases become filters ("biryani under ₹300"); chips and filters apply instantly and stay in the URL; "did you mean" and nearby areas when nothing matches | E4-1, E4-2, E4-3, E4-7 |
| Restaurant `/r/{branch}` | Open now and next change, price band, cuisines, food score plus value / service / ambience words and "would go back" share, What to order here, full menu, living facts with "confirmed N days ago", nearby alternatives; Directions, Call, Share, Save, Rate | E2-1…E2-4, E2-6, E2-7 |
| Dish at a restaurant | Loved %, rating breakdown, the same dish at other branches ranked | E3-1 |
| City dish ranking `/hyderabad/dish/{dish}` | Every branch serving it, ranked, filterable by area, price, open now | E3-2 |
| Area and cuisine pages | Top dishes and restaurants per area or cuisine | E4-6 |
| Location | Asked only from a soft banner; stays on the phone; drives distances, "within 3 km" and Trending | D37 |
| Saves | Up to 20 on the phone; the 21st asks to sign in | E9-1 |
| Veg only | One toggle hides egg and non-veg dishes everywhere | D31 |

### For a member

| Area | What they can do | Spec |
| --- | --- | --- |
| Account | Sign up with email and password, confirm by email link, sign in, sign out, reset a forgotten password; Google shown as "soon" | E1-2 as D1, E1-5 |
| Onboarding | One screen: name, username (suggested), diet, up to 5 cuisines, home area, 18+ required; "I'm under 18" deletes the account | E1-3 |
| Saves | Saves follow the account ("Want to try"); phone saves move in at sign-in; "Been there" lists every place they rated | E9-2, E1-4 |
| Rating | Rate sheet on restaurant and dish pages: pick dishes, Loved / Good / Okay / Skip each, optionally value / service / ambience and "go back?"; re-rating replaces the verdict and keeps history; scores update immediately | W3, E6-1, E6-2, E6-4 |
| Adding a dish | Type a dish the menu lacks; existing names are offered first; otherwise "Add and rate it" creates a pending dish that goes live when trusted members corroborate it | E3-4, docs/CONTRIBUTIONS.md §5 |
| Sign-in resume | A guest who taps Rate or Save signs in and lands back where they were, with the rate sheet open | W2.5 |

### Behind the scenes

| Area | What happens |
| --- | --- |
| Scores | Each rating recomputes its dishes and restaurant in the same transaction; every night a full recompute repairs everything (D46) |
| Trust | Nightly job moves members T0 → T1 → T2 by account age and counted contributions; T2 waits on fact confirmations in P5 (D53) |
| Limits | Daily quotas per trust level and per IP for ratings and new dishes (spec §7.1, D50); sign-in, sign-up and email sends limited (D2) |
| Analytics | First-party events (search, chips, directions, call, share, save, location) stored in our own database (D34) |
| Duplicates | Dish names are fingerprinted so "Chk biryani (full plate)" joins "Chicken Biryani"; the database guarantees one card per dish per branch (D48) |

## 4. How it is built

Next.js 16 (App Router, Cache Components), React 19, TypeScript strict, Tailwind v4 with the FDN tokens, Drizzle on Neon Postgres (PostGIS, trigram search), Upstash Redis for limits, Better Auth, Resend, Inngest, Cloudflare R2 (wired, first used in R3). Hosted on Vercel.

Code is organised by feature (`features/<domain>/{components,server,queries,schemas,lib,jobs}`); `app/` only routes. Import boundaries are enforced by lint. Full rules: `AGENTS.md` and `docs/ARCHITECTURE.md`.

| Feature | Owns |
| --- | --- |
| `landing`, `shell`, `content` | Landing page, header, bottom bar, footer, static pages |
| `geo`, `places`, `dishes` | Cities and areas, restaurants and facts, dishes and rankings, fingerprints |
| `search`, `discover` | Search, typeahead, chips, ranking, Trending |
| `auth`, `profile` | Accounts, sessions, onboarding, trust levels |
| `ratings` | Ratings, scores, dish contributions, the rate sheet |
| `saves` | Phone saves, account lists |
| `analytics`, `jobs` | Event beacon, Inngest endpoint |

## 5. Data

Nine migrations, all additive:

| Migration | Adds |
| --- | --- |
| `20261020213501_extensions` | PostGIS, pg_trgm, unaccent |
| `20261020213508_catalogue` | Cities, areas, brands, branches, hours, cuisines, facts, dishes, ranking config |
| `20261025080156_analytics` | Analytics events |
| `20261025080655_branch_tags` | Occasion tags for chips |
| `20261025080657_search_trigram` | Accent-insensitive trigram search indexes |
| `20261025113625_auth_profiles` | Users, sessions, accounts, verifications, profiles |
| `20261025122537_lists` | Lists and list items |
| `20261104175853_ratings_lifecycle` | Dish ratings, aspect ratings, brand affiliations, listing and dish status columns |
| `20261108170450_dish_contributions` | Dish fingerprints, dish aliases, Ops review tasks |

Sample data (`bun run db:seed` / `db:reseed`): 5 areas, 12 fictional brands, 17 branches, 100 dishes, 24 canonical dishes, and 7,411 ratings by 180 fictional sample members who cannot sign in (D19, D44).

## 6. Quality

| Check | Result on the branch |
| --- | --- |
| Typecheck, lint (zero warnings), format | Pass |
| Unit and integration tests (Vitest, real Postgres) | 262 pass |
| End-to-end tests (Playwright, mobile and desktop, axe accessibility) | 113 pass, 3 skipped by viewport |
| Production build | Pass |
| CI (`.github/workflows/ci.yml`) | Runs all of the above on PostGIS and Redis services |

## 7. What you need to do to release the branch

1. Merge and install:
   ```bash
   git checkout claude/food-discovery-audit-7wepur && git pull
   git checkout main && git merge claude/food-discovery-audit-7wepur
   bun install
   ```
2. Migrate Neon: `bun run db:migrate` (applies `20261025122537_lists`, `20261104175853_ratings_lifecycle`, `20261108170450_dish_contributions`).
3. Data, one of:
   - `bun run db:reseed` to get the sample ratings and fingerprints. It deletes the catalogue and every rating and saved item, your test accounts' included (accounts stay). Only while Neon holds test data.
   - `bun run db:backfill` to keep current data (fills dish fingerprints; scores then rebuild from real ratings only).
4. Vercel environment variables (Production), then redeploy:

   | Name | Status |
   | --- | --- |
   | `DATABASE_URL`, `REDIS_URL`, `RESEND_API_KEY`, R2 names | Set by you |
   | `BETTER_AUTH_SECRET` | Random value (`openssl rand -base64 32`) |
   | `BETTER_AUTH_URL` | `https://food-discovery-eta.vercel.app` |
   | `EMAIL_FROM` | Sender on a domain verified in Resend, e.g. `FDN <hello@your-domain>` |
   | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | From the Inngest–Vercel integration (it sets them) |
   | `EMAIL_OUTBOX_DIR`, `INNGEST_DEV` | Must **not** be set on Vercel |

5. `git push origin main`, then check: sign up, finish onboarding, rate two dishes, add a missing dish, save a place, and in Inngest invoke `profile-recompute-trust`.

## 8. Known gaps and open items

- **Not reachable from this cloud environment:** Neon, Upstash and the Vercel site are blocked by the environment's network policy, so production checks are yours until those hosts are allowed (ideally with a Neon dev branch).
- **Spec departures (by decision):** email + password instead of phone OTP and Google (D1); no AI screening, menu reading or dish suggestions (D4, D49); per-action quotas from `ranking_config` instead of `@upstash/ratelimit` (D33, D50). All listed in ARCHITECTURE §1.
- **Spec document:** `docs/spec/MVP-SPEC.md` stops mid §8 and has stray prompt text at its end; sections it cites after §8 do not exist (D12).
- **Unused dependency:** `@better-auth/infra` (caret range) is installed but not wired; pin or remove when the Better Auth dashboard is connected.
- **Pending dishes added by new accounts** are visible only through the rate sheet search until corroborated; there is no Ops screen yet to approve or reject them (R4).

## 9. What comes next

| Order | Work | Spec |
| --- | --- | --- |
| 1 | R3 Add a missing restaurant: 4-step form, duplicate check (similar name within 150 m or same phone), storefront photo to R2, provisional page by link, Ops task | docs/CONTRIBUTIONS.md §6 |
| 2 | R4 Ops queue in `/admin`: approve or reject new dishes and places, merge duplicates with redirects | §5.5, E3-5, E15 |
| 3 | Settings: active sessions, data export, delete account; custom lists | E1-5, E1-7, E9-3 |
| 4 | R5 Owner claims, owner dashboard, reconcile | docs/CONTRIBUTIONS.md §8 |
| 5 | P4 Posts with photos, comments, votes, communities | E5, E7, E8 |
| 6 | P5 Living facts ("Still true?"), battles, leaderboards, public lists with map | E10, E11, E9-4 |
| 7 | P6 Reports and moderation, notifications, admin analytics, launch hardening | E13, E14, E16 |
