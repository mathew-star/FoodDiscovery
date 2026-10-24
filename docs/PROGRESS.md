# Progress

Update at the end of every phase in the PR that closes it: tick items, note deviations (and add them to `docs/ARCHITECTURE.md` §Decisions), record the closing PR.

| Phase | Status | Closing PR |
| --- | --- | --- |
| P0 Foundations | Done | branch `claude/food-discovery-audit-7wepur` |
| P1 Catalogue | In progress | — |
| P2 Search and Discover | Not started | — |
| P3 Accounts and ratings | Not started | — |
| P4 Posts, comments, communities | Not started | — |
| P5 Battles, leaderboards, living facts | Not started | — |
| P6 Safety, notifications, admin, launch | Not started | — |

## Done before P0

- [x] Infra clients: Neon (Drizzle HTTP), Upstash Redis (ioredis), R2 (S3 client), pino logger, startup checks, `onRequestError`
- [x] MVP spec (`docs/spec/MVP-SPEC.md`)
- [x] Project docs: AGENTS.md, CLAUDE.md, ARCHITECTURE, DESIGN-SYSTEM, PRODUCT-FLOWS, ROADMAP, PROGRESS

## P0 Foundations

- [x] `.env.example` committed (names only)
- [x] `bun.lock` synced (`--frozen-lockfile` passes); pre-1.0 deps pinned; runtime `dotenv` removed
- [x] `lib/` → `infra/`, `drizzle/src/` → `db/`; Pool client with `withTransaction`; startup checks behind `STARTUP_CHECKS=1`
- [x] Scripts: typecheck, test, test:e2e, format, format:check; ESLint import boundaries; stricter tsconfig
- [x] CI workflow (`.github/workflows/ci.yml`)
- [x] Tokens (contrast-tested), fonts, theme switch without flash
- [x] `shared/ui`: Button, IconButton, Input, Textarea, ChipButton/ChipLink, Badge, Card, Avatar, Skeleton, EmptyState, VisuallyHidden, Dialog/Sheet, Tooltip, Tabs, Checkbox, Switch, SegmentedControl. Select, Combobox, Popover, Toast, InfiniteList land with their first consumer
- [x] Shell: TopBar, BottomNav, CitySwitcher, SiteFooter, `/` → `/hyderabad`, 404 guard for unknown paths (D14)
- [x] i18n (`t()` with typed keys, `en` catalog); PWA manifest, icons, service worker with offline page; robots, sitemap
- [x] Static pages `/about`, `/guidelines` (`/privacy`, `/terms`, `/grievance` moved to P6, D13)
- [x] Exit: LCP ≈ 0.65 s on `/hyderabad`, `/about`, `/guidelines` (Pixel 7, 4× CPU, 1.6 Mbps / 150 ms); axe 0 serious/critical in light and dark; contrast test passes

Verified: `bun run typecheck`, `bun run lint`, `bun run format:check`, `bun run test` (125 passing), `bun run build`, `bun run test:e2e` (20 passing, 2 viewport-specific skips).

Notes for later phases:
- `/hyderabad` transfers ~520 KiB on first load, mostly fonts; revisit font axes/subsets in P6 hardening.
- Nav links to `/hyderabad/search`, `/post/new`, `/communities`, `/battles`, `/saved` 404 until their phases land.

## P1 Catalogue

- [x] Landing page at `/` (D17)
- [x] Schema + extensions (`postgis`, `pg_trgm`, `unaccent`) + migrations: geo, places, facts, dishes, `ranking_config`
- [x] `DATABASE_DRIVER` switch for local/CI Postgres (D18); CI runs migrate + seed on a PostGIS service
- [x] Sample seed: 5 localities (3 launch), 12 fictional brands, 17 branches, 100 dishes, 24 canonical dishes (D19)
- [x] Scoring (§6.1 dish score, §6.2 food score), What to order here (§6.3), opening hours with overnight/split shifts — unit tested
- [x] Branch page (E2-1, E2-2, E2-3, E2-4, E2-6, E2-7), branch dish page (E3-1), city dish ranking with area/price/open-now filters (E3-2), area page (E4-6), cuisine page
- [x] Discover home: popular dishes by category and explore areas (partial E4-4)
- [x] JSON-LD (Restaurant, BreadcrumbList, ItemList), OG images per branch, branch dish and city dish (E12-1, E12-2), DB-backed sitemap
- [ ] Minimal `/admin` entity CRUD + canonical dish/alias merge (E3-5)
- [ ] Static map + MapLibre on expand (E2-8; needs tile provider decision D11)
- [ ] Exit: OG verified in WhatsApp debugger on a deployed URL

- [x] UI redesign "Token & Stamp" across shell, landing, discover, branch, dish, city ranking, area, cuisine, static and error pages (D23–D25)

Verified: typecheck, lint, format, 164 unit + integration tests, build (160+ prerendered catalogue pages), 58 Playwright tests incl. axe light/dark. Throttled mobile LCP (Pixel 7, 4× CPU, 1.6 Mbps): 1.0–1.5 s across `/`, `/hyderabad`, branch, branch dish and city dish pages.

Deferred by design: photo strip and photos grid (P4 media), posts tabs (E2-5, P4), Save/Rate actions (P2/P3), "Still true?" (P5), distance from user (P2 location).

- [x] Design system v2 (warm brutalist, `docs/DESIGN-SYSTEM.md`) replaces "Token & Stamp" everywhere: tokens and type scale in `app/globals.css`, every `shared/ui` primitive, shell (top bar, bottom nav, ink footer), Discover, branch, branch dish, city ranking, area, cuisine, static, error and offline pages (D26, D27, D29)
- [x] Landing page rebuilt from `docs/reference/fdn-landing-full.html`: live proof card, live battle, six-step dinner journey, four modes with real routes, community feed with tabs and ticker, Score X-Ray on the production scoring code (default weights, no database), searchable FAQ with FAQPage JSON-LD, closing CTA with install prompt (D28, D30)
- [x] Veg-only device filter (D31) and sign-in-at-intent toast for guest write actions (D32)
- [x] `bun.lock`: removed four duplicated entries left by the merge (frozen install failed); `motion` and `animejs` removed

Verified on a local PostGIS 15 database (migrate + seed): typecheck, lint, format, unit tests, `next build` (Node), 75 Playwright tests passed / 3 viewport skips, axe 0 serious/critical on `/`, `/hyderabad`, `/about`, `/guidelines`, `/offline`, branch, branch dish, city dish and area pages; no horizontal scroll at 390 px.

Notes for later phases:
- `bun --bun next build` fails locally while collecting page data ("Expected CommonJS module to have a function wrapper … bug in Bun"); the same failure reproduces on the commit before this change, and `next build` under Node succeeds. Check CI on the next push.
- Landing and footer links to `/c/*`, `/communities`, `/battles` light up in P4/P5; the footer shows Privacy, Terms and Grievances as "soon", and the grievance officer block, until P6 (D13).
- No migrations or seed changes in this work. Rating weights stay a code constant until P3 adds them to `ranking_config` (D30).

## P2 Search and Discover

- [ ] Typeahead + search results + filters + chips
- [ ] Discover sections with fallback
- [ ] Location banner, Directions/Call/Share, guest saves
- [ ] Analytics pipeline
- [ ] Exit criteria met

## P3 Accounts and ratings

- [ ] Better Auth (Google, One Tap, email OTP), onboarding, device-save import
- [ ] Settings: sessions, export, delete
- [ ] Ratings + aspect ratings + score jobs
- [ ] Trust levels, rate limits, lists
- [ ] Exit criteria met

## P4 Posts, comments, communities

- [ ] Uploads + photo screening
- [ ] Post types, embeds, disclosure, on-site mark
- [ ] Comments, votes, sorting, accepted answers
- [ ] Communities + moderator tools
- [ ] Exit criteria met

## P5 Battles, leaderboards, living facts

- [ ] Battles end to end
- [ ] Leaderboards + snapshots
- [ ] Facts confirm/propose/consensus + Ops queue
- [ ] Public lists with map, share images
- [ ] Exit criteria met

## P6 Safety, notifications, admin, launch

- [ ] Reports, queue, actions, appeals, audit, blocks
- [ ] Review-bomb detection
- [ ] Notifications, push, nudge, digest
- [ ] Admin console + analytics views
- [ ] Launch hardening
- [ ] Exit criteria met
