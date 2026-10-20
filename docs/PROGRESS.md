# Progress

Update at the end of every phase in the PR that closes it: tick items, note deviations (and add them to `docs/ARCHITECTURE.md` §Decisions), record the closing PR.

| Phase | Status | Closing PR |
| --- | --- | --- |
| P0 Foundations | Done | branch `claude/food-discovery-audit-7wepur` |
| P1 Catalogue | Not started | — |
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

- [ ] Schema + extensions + migrations
- [ ] Seed tooling; 3 localities seeded
- [ ] Admin entity CRUD + dish merge (E3-5)
- [ ] Branch, branch-dish, city-dish, cuisine, area pages
- [ ] OG images, JSON-LD, sitemap, canonical URLs
- [ ] Exit criteria met

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
