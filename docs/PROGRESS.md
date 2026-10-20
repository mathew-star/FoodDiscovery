# Progress

Update at the end of every phase in the PR that closes it: tick items, note deviations (and add them to `docs/ARCHITECTURE.md` §Decisions), record the closing PR.

| Phase | Status | Closing PR |
| --- | --- | --- |
| P0 Foundations | Not started | — |
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
- [ ] `bun.lock` synced; pre-1.0 deps pinned
- [ ] `lib/` → `infra/`, `drizzle/src/` → `db/`; Pool client; gated startup checks
- [ ] Scripts: typecheck, test, test:e2e, format; ESLint boundaries
- [ ] CI workflow green
- [ ] Tokens, fonts, theme switch, `shared/ui` primitives
- [ ] Shell: TopBar, BottomNav, CitySwitcher, `/` redirect
- [ ] i18n scaffolding; PWA manifest; robots
- [ ] Static pages incl. grievance
- [ ] Exit: LCP < 2 s, axe clean, contrast test

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
