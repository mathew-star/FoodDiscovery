# Design system — Token & Stamp

FDN looks like the counter of a busy Hyderabad eatery: kitchen order tickets (KOT) on newsprint, carbon-ink type, a haldi highlighter, the "now serving" token board, the house rules painted on an Irani café wall, and rubber stamps. Every screen uses the same objects, so a screenshot is recognisable without the logo.

## 1. Brief

| | |
| --- | --- |
| Product & user | A guest on a mid-range Android, often outdoors or late at night, deciding what to eat in under 30 seconds. A member rating a dish in under 20 seconds. |
| Emotional target | **Hungry-urgent** (big, fast, decisive), **street-honest** (local, plain-spoken, a bit cheeky), **stamped-trustworthy** (facts carry a timestamp, opinions carry ink). |
| Concept | *The counter.* Dishes are tickets, facts are receipts, ratings are stamps, live information is the token board, rules are painted on the wall. |
| Signature element | **The stamp.** Double-ruled, slightly rotated, ink-distressed. It thumps in once on first paint. Used for ratings (Loved/Good/Okay/Skip), the food verdict, "Checked" on the facts receipt, "Top pick" and "Known for", 404 ("Not on the menu"), offline ("Closed"), error ("Spilled"), the logo, OG cards. |
| Anti-references | No delivery-app red/orange with rounded image cards. No purple-gradient SaaS hero with three feature cards. No five-star widgets or soft drop-shadow card grids. |

## 2. Tokens

All colours live in `app/globals.css` as CSS variables on `:root` (day counter) and `[data-theme='dark']` (night counter, also used for system dark), exposed to Tailwind through `@theme inline`. Components use token classes only (`bg-paper`, `text-ink`, `bg-haldi`, `border-ink`); hex appears only in `globals.css` and the OG image renderer, which cannot read CSS variables. `shared/ui/tokens.test.ts` fails the build if any text pair drops below 4.5:1 or `rule-strong` below 3:1, and if the system-dark and explicit-dark blocks drift apart.

### Colour

| Token | Day | Night | Role |
| --- | --- | --- | --- |
| `--paper` | `#F4EEE1` | `#111220` | page (newsprint / night ink) |
| `--paper-raised` | `#FFFCF5` | `#1B1C2E` | tickets, receipts |
| `--paper-sunk` | `#E8DFCB` | `#0A0B15` | bands, tiles |
| `--ink` | `#1A1C2E` | `#F3ECDD` | text, borders, primary buttons |
| `--ink-soft` | `#55516A` | `#B9B1A1` | secondary text |
| `--rule` / `--rule-strong` | `#D9CFB9` / `#7F745E` | `#2E2F44` / `#6F6B84` | decorative rules / dashed rules (≥ 3:1) |
| `--haldi` | `#F2B300` | `#FFC21A` | the one accent: highlighter, selected chips, Directions, rank 01 |
| `--live` | `#0E6B60` | `#4FD1C0` | open now, checked facts |
| `--danger` | `#A3241A` | `#FF8A7A` | stale facts, errors |
| `--rate-loved/good/okay/skip` | `#B0102C` `#2C6A2E` `#83560A` `#4F4F5D` | `#FF8A97` `#86D38F` `#E9BC5E` `#B8B8C6` | stamp inks |
| `--diet-veg/egg/nonveg` | `#18692D` `#7E5A00` `#7A3410` | `#62CF7E` `#E8C155` `#EC9A70` | FSSAI marks |

Haldi is never used for text on paper; text on haldi is always `--on-haldi` (ink, 9:1). Closed is shown in `ink-soft` with a moon icon, not red: closed is not an error.

### Type

| Role | Face | Why |
| --- | --- | --- |
| Display | **Anek Latin** (variable `wdth`, set at 70–80 %, weights 700–800), falls back to **Anek Telugu** / **Anek Devanagari** | An Indian-foundry family that looks like hand-painted shop signs when condensed, and keeps the same voice in Telugu and Hindi |
| Text | **Hind** (400/500/600), Telugu via **Hind Guntur** | Readable at 16 px on cheap screens, Devanagari built in |
| Mono | **Martian Mono** | Thermal-receipt voice for facts, prices, timestamps, the token board |

Scale (1.25 ratio): `2xs` 11 · `xs` 13 · `sm` 15 · `base` 16 · `lg` 20 · `xl` 25 · `2xl` 31 · `3xl` 39 · `4xl` 49 · `5xl` 61 · `6xl` 76 · `7xl` 95 px. Page titles use `clamp()` up to ~104 px with `leading-[0.88]`. Body 16 px, line-height 1.5. Mono is always uppercase with wide tracking; it never carries paragraphs.

### Shape, depth, texture

- Radius: `2px` (tickets, buttons, inputs), `5px` (stamps), `full` only for the Post button and the live dot.
- Borders: 2 px ink on every interactive surface. Dashed rule-strong lines separate items inside a ticket.
- Depth: hard offset "lift" shadows (`2px`, `3px`, `6px` in ink; black at night). Pressing moves the element into its shadow (`press` utility).
- Edges: `perforate-b` (tear-off bottom), `notch-x` (KOT side notches), `leader` (dotted receipt leaders), `highlight` (haldi swipe), `grain` (3–8 % paper noise on the body).

### Spacing and layout

4 px base. Gutter 16 px mobile, 24 px from 768 px. Content max 1240 px. Desktop entity pages are two columns (`minmax(0,1fr) 23rem`) with the receipt sticky on the right; on mobile the receipt follows What to order here.

### Motion

| Token | Value | Use |
| --- | --- | --- |
| `--dur-micro` | 140 ms | press, hover, toggles |
| `--dur-ui` | 260 ms | fans, tabs, indicators |
| `--dur-hero` | 820 ms | landing entrances |
| `--motion-snap` | `cubic-bezier(.2,.9,.1,1)` | enters |
| `--motion-out` | `cubic-bezier(.4,0,1,1)` | exits (always faster than enters) |

| Where | How | Library |
| --- | --- | --- |
| Stamp thump on first paint | CSS keyframes `thump`, staggered by `--i` | CSS |
| Page title entrance | `rise-in`, transform only (never opacity, so LCP is not delayed) | CSS |
| Section reveals on landing | `reveal`: scroll-driven `animation-timeline: view()`; content is visible where unsupported | CSS |
| Bottom-nav active bar | shared `layoutId` spring | Motion |
| City ranking filters | `LayoutGroup` + `AnimatePresence`: rows re-rank with springs, rank numbers roll | Motion |
| Stamp-it-yourself demo | spring stamp from 2.4× with rotation, `whileTap` on buttons | Motion |
| Magnetic CTAs (mouse only) | `useSpring` on pointer offset | Motion |
| Hand-drawn scribble around "order" | SVG `createDrawable` path draw | anime.js |
| Loved % counter on dish pages | numeric roll to value | anime.js |
| Token board | 38 s CSS marquee, pauses on hover/focus | CSS |

Rules: animate `transform`/`opacity` only; Motion runs through `LazyMotion` (`domAnimation`, strict) under `MotionConfig reducedMotion="user"`; anime.js islands check `prefers-reduced-motion` and leave the final state; a global reduced-motion rule collapses CSS animation to 1 ms. Motion never hides decision information before hydration.

### Iconography

Lucide only, stroke 1.8–2.5, `aria-hidden` unless standalone (then `aria-label`). Diet marks are custom FSSAI-style SVGs. No emoji in UI.

## 3. Components

### Primitives (`shared/ui`)

| Component | Notes |
| --- | --- |
| `Stamp` | the signature; `size` xs–xl, `tilt`, `animate`, `index` for stagger |
| `Ticket`, `TicketRule` | `plain`, `notched`, `perforated`, `receipt` edges |
| `TokenBoard` | ink strip, haldi "Now serving" label, marquee with a non-duplicated accessible list |
| `Button` / `IconButton` | `primary` (ink), `haldi`, `secondary` (paper), `ghost`; display face, uppercase |
| `ChipButton` / `ChipLink` | square tags with lift; selected = haldi |
| `Badge` | mono outlined tag |
| `EmptyState` | dashed slip with an optional stamp |
| `CountUp` | anime.js number roll |
| `MotionRoot` | LazyMotion + reduced-motion config |
| `Input`, `Textarea`, `Dialog` (sheet), `Tooltip`, `Tabs`, `Checkbox`, `Switch`, `SegmentedControl`, `Skeleton`, `Avatar`, `Breadcrumbs`, `JsonLd`, `og-card` | restyled to tokens |

### Domain

| Component | Feature | Notes |
| --- | --- | --- |
| `RatingBadge` | ratings | sentiment stamp: icon + word + ink colour + per-sentiment tilt |
| `ScoreBadge` | ratings | big condensed "92% loved" + mono count; below threshold a dashed "New · N ratings" tag |
| `RatingDistribution` | ratings | four labelled ink bars that grow on paint |
| `FoodScore` | ratings | mono label + verdict stamp (Great/Good/Mixed/Poor) + info tooltip |
| `DishTile` | dishes | typographic tile (dish initials) in haldi/ink/sunk/loved; stands in until photos exist |
| `DishRow` | dishes | `feature` = ranked KOT ticket; `compact` = menu line with dotted leader |
| `PlacedDishRow` | dishes | token-numbered ranking row; rank 01 is haldi |
| `CityDishBoard` | dishes | client filters (area, price, open now) with animated re-ranking and URL sync |
| `BranchHeader`, `ActionRow`, `OpenStatus`, `PriceBand`, `BranchCard`, `FactsCard` | places | sign-board title, status strip, haldi Directions, live dot, receipt facts, notched cards |
| `Shelf`, `AreaBoard`, `DiscoverIntro` | discover | category rails of tear-off tickets, route board of areas |
| `KotStack`, `ShuffleReceipt`, `HowStrip`, `StampDemo`, `HouseRules`, `MenuBoard`, `NoticeBoard`, `FinalTicket` | landing | the counter, itemised |
| `Logo`, `TopBar`, `BottomNav`, `CitySwitcher`, `SiteFooter` | shell | stamp logo, haldi city tag, haldi Post button, receipt footer ("Thank you · Visit again") |

## 4. Never colour alone

| Meaning | Cue besides colour |
| --- | --- |
| Loved / Good / Okay / Skip | heart / thumbs-up / minus / ban icon + the word, always |
| Veg / Egg / Non-veg | FSSAI square with circle / oval / triangle + label (visible or `sr-only`) |
| Open / Closed | "Open · closes 23:30" with a live dot vs "Closed · opens 11:30" with a moon icon |
| Stale fact | alert icon + "May be out of date" |
| Selected chip / filter | `aria-pressed` + haldi fill + ink border |
| Rank 01 | the number itself; haldi is extra |

## 5. Accessibility

WCAG 2.2 AA: 4.5:1 text and 3:1 non-text, enforced by test. Focus is a 3 px haldi outline with a 5 px ink halo, visible on paper and night. Touch targets are at least 44 px (chips get an invisible hit-area extension). Every interactive ticket uses one stretched link; secondary actions in a ticket sit above it with `z-10`. Marquees have a static accessible list. Live regions announce filter result counts and stamp-demo choices. axe runs in light and dark on every public page in e2e.

## 6. Rationale

- **Why the counter metaphor:** the product's promise is "know what to order". Tickets, receipts and stamps are the physical objects of ordering, so the metaphor explains the product as well as styling it. It also separates facts from opinions visually: receipts in mono with timestamps for facts, stamps in ink for opinions.
- **Why haldi and ink:** every delivery app owns red or orange. Turmeric is local and appetising, and on ink it is loud enough to mean "do this now" (Directions, rank 01, selected filters).
- **Why Anek condensed:** big dish names and rank numbers fit 375 px screens without truncation, and the family carries the same voice into Telugu and Devanagari.
- **Why mostly CSS motion:** the "fast on a cheap phone" budget. Motion and anime.js load only in the islands that need physics or path drawing.
