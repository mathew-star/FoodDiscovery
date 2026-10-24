# FDN Design System — `DESIGN.md`

> **Audience:** AI coding agents (Claude Code, Cursor, etc.) and humans building any FDN screen.
> **Source of truth:** this doc. `docs/reference/fdn-landing-full.html` is the visual reference for every rule below; when the two disagree, this doc wins (§16 lists the known differences). The production implementation lives in `app/globals.css`, `shared/ui/` and the feature components mapped in §12.4.
> **Product spec:** `docs/spec/MVP-SPEC.md` (Oct 17, 2026). This doc covers *how it looks and behaves*; the spec covers *what it does*.

---

## 0. TL;DR for agents (read this first)

1. **Palette is fixed.** Use only the tokens in §3. Never invent a hex value.
2. **Two fonts only.** Headings = **Bricolage Grotesque**. Everything else = **Inder**. No third font, no monospace.
3. **The look is "warm brutalist":** cream paper background, 2px ink borders, hard offset shadows (`4px 4px 0 #141612`), no blur shadows, no gradients as decoration.
4. **No decorative circles.** No illustrated plates, rings, blobs or circular food stand-ins. Where a real image will go, render an **image slot** (§7.5).
5. **Answer first.** Every card shows decision data (open now, distance, price, loved %) before opinion or decoration.
6. **Guests can read everything.** Any write action (rate, vote, post, comment, answer, 21st save) opens the **sign-in-at-intent** toast/sheet with a reason (§9.1). Never block reading.
7. **Ratings are words, not stars.** Loved / Good / Okay / Skip, each with a fixed colour (§3.3). Never show stars or a "4.2".
8. **Sentence case everywhere.** No ALL-CAPS labels. No "→" appended to buttons.
9. **Mobile first.** Design at 390 × 844, then scale up. Respect `prefers-reduced-motion`.
10. **Accessibility is not optional:** visible focus ring, keyboard-operable tabs, `aria-pressed` on toggles, `aria-live` on changing results.

---

## 1. Brand in one paragraph

FDN (Food Discovery Network) helps people in Hyderabad decide **what dish to order and where**, using honest, trust-weighted verdicts from locals. The visual language borrows from the things on a Hyderabad food table — paper bills, chalk menus, stamped price tags — and turns them into a bold, tactile, slightly loud interface. It should feel **confident, local, honest and fast**, never glossy, corporate or "AI-generic".

**Personality sliders**

| Axis | FDN sits at |
| --- | --- |
| Playful ↔ Serious | 65% playful (copy is warm; data is precise) |
| Loud ↔ Quiet | 60% loud (big type, hard shadows) — but one loud thing per screen |
| Dense ↔ Airy | 55% dense (food decisions need data) |
| Polished ↔ Raw | 60% raw (visible borders, offset shadows, no soft blur) |

---

## 2. Design principles (use to break ties)

1. **Answer first.** Above the fold: open/closed + next change time, distance, price, top dishes. Decoration comes last or not at all.
2. **Facts ≠ opinions.** Facts carry a "checked N ago" timestamp and a "Still true?" control. Opinions carry an author and trust badge. Never style them the same.
3. **Trust is visible.** Show *why* a number is what it is: counts, trust level, disclosure tags, "held for review" states.
4. **One bold moment per screen.** Spend the boldness on one element (e.g., the hero proof card, the Score X-Ray). Keep everything around it quiet.
5. **Motion answers actions.** Animate because the user did something (tapped a chip, swapped the six steps to one page). No scroll-triggered fade-ins on every section.
6. **Fast on a cheap phone.** No heavy JS animation libs, no autoplay video, no large hero images above the fold on mobile.
7. **Never sell trust.** Nothing styled as "Sponsored", "Featured" or "Promoted" ever exists.

---

## 3. Colour

### 3.1 Core tokens

| Token | Hex | Role |
| --- | --- | --- |
| `cream` | `#ECEBC9` | Page background |
| `creamDark` | `#E2E0B5` | Secondary surface, card header strips, hover on cream |
| `paper` | `#F8F7E8` | Card surface, inputs, pills |
| `ink` | `#141612` | Text, borders, shadows, dark sections |
| `inkMuted` | `#4A4D43` | Secondary text, meta lines |
| `lime` | `#C7EA76` | Primary highlight: active chip, score badge, CTA band, "Good" |
| `limeBright` | `#B8E94A` | Hover state of lime |
| `olive` | `#76A02B` | "Loved", active nav pill, success, live dot |
| `oliveDeep` | `#4F6E17` | Olive used as **text** on light backgrounds (passes contrast) |
| `oliveBtn` | `#97AE42` | Secondary filled button |
| `terracotta` | `#C8524B` | Focus ring, bar segments ("Skip"), borders, live dot, underline and strike-through decoration. Never carries text below 18px |
| `terracottaDeep` | `#A9443D` | Terracotta that **carries text**: primary CTA fill, Skip pill, warning words, burst alert, selection. Added for AA (§3.4) |
| `saffron` | `#F2B33D` | "Okay", avatars, secondary accent (use sparingly) |

### 3.2 Usage ratios (per screen)

- ~70% cream / paper
- ~20% ink (text, borders, one dark section)
- ~10% accents (lime, olive, terracotta, saffron). **Max two accent colours dominant in any one card.**

### 3.3 Verdict colours (fixed — never change)

| Verdict | Value | Fill | Text on fill |
| --- | --- | --- | --- |
| Loved | 1.0 | `olive` | `ink` |
| Good | 0.7 | `lime` (bars: `limeBright`) | `ink` |
| Okay | 0.4 | `saffron` | `ink` |
| Skip | 0.0 | `terracottaDeep` pill, `terracotta` bar segment | `paper` |

The distribution bar is always in this order: Loved → Good → Okay → Skip, left to right, separated by 1px ink lines. Pills: `VerdictPill`; bars: `VerdictBar` (both in `features/ratings/components/`).

### 3.4 Contrast rules

- Body text: `ink` on `cream`/`paper`. Secondary: `inkMuted` on `cream`/`paper` (passes AA).
- **Never** put `olive` text on `lime` (fails). Use `ink` text on lime.
- Olive as text on light background → use `oliveDeep` (4.8:1 on cream, 5.4:1 on paper).
- Text **on** an `olive` fill is `ink` (5.9:1). `paper` on olive is 2.9:1 and fails, so the active tab, Loved pill and ✓ Accepted badge use ink text.
- On `ink` backgrounds: text `cream` (primary), `cream/70` (secondary), `cream/50` minimum for fine print. Accent text on ink: `lime` or `saffron`.
- `terracotta` never carries small text: paper on it is 4.1:1 and terracotta on cream 3.6:1. Use `terracottaDeep` instead (paper on it 5.4:1; as text 4.8:1 on cream, 5.4:1 on paper). Avoid it as text on `creamDark` (4.3:1).
- Every pairing above is enforced by `shared/ui/tokens.test.ts`; add a row there when you introduce a new text/surface pair.

### 3.5 Dark sections

Use full-bleed `bg-ink text-cream` for **at most one section per page** plus the footer (landing page: "Honest by design" + footer). Cards inside dark sections are `paper` with a `cream` border and a **lime offset shadow** (`6px 6px 0 #C7EA76`).

---

## 4. Typography

### 4.1 Families

| Role | Family | Weights | Load |
| --- | --- | --- | --- |
| Headings, display numbers, wordmark, card titles, tab titles | **Bricolage Grotesque** | 400–800 (variable, `opsz` 12–96) | Google Fonts |
| Everything else: body, labels, buttons, chips, meta, numbers in tables | **Inder** | 400 (only weight available) | Google Fonts |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inder&display=swap" rel="stylesheet">
```

`app/layout.tsx` loads `Bricolage_Grotesque` (variable weight + `opsz` axis) and `Inder` through `next/font/google` with `display: 'swap'` as `--font-bricolage` / `--font-inder`. `app/globals.css` maps them to `--fdn-font-display` / `--fdn-font-body` and to Tailwind's `font-display` / `font-sans`. Telugu and Devanagari text (language switcher, later catalogs) falls back to system fonts until those catalogs ship.

**Inder has one weight.** Don't rely on `font-bold` for hierarchy in Inder text — the browser fakes it. Create emphasis with **size, colour, a filled pill, or switch to Bricolage** for that word. Faux bold is acceptable only for tiny pills/badges.

There is **no italic** in either font. Don't use `italic`. Emphasis in headlines = underline in terracotta (`decoration-4 underline-offset-8`), used once per page at most.

There is **no monospace font**. Tailwind's `font-mono` class is mapped to Inder in config so legacy markup still renders correctly; new code should use `font-sans`.

### 4.2 Type scale

| Token | Mobile | Desktop | Family / weight | Line height | Tracking | Use |
| --- | --- | --- | --- | --- | --- | --- |
| `display-xl` | 40px | 76px | Bricolage 800 | 0.95 | -0.02em | Hero H1 only |
| `display-l` | 36px | 60px | Bricolage 800 | 0.98 | -0.02em | Section H2 |
| `title-l` | 24px | 30px | Bricolage 800 | 1.15 | -0.01em | Panel/page titles |
| `title-m` | 20px | 24px | Bricolage 700–800 | 1.2 | 0 | Card titles |
| `title-s` | 17px | 18px | Bricolage 700 | 1.25 | 0 | Tab titles, small card heads |
| `score` | 24–40px | 24–40px | Bricolage 800 | 1 | -0.01em | Loved %, big numbers |
| `body-l` | 16px | 18px | Inder | 1.6 | 0 | Section intros |
| `body` | 15px | 16px | Inder | 1.6 | 0 | Paragraphs |
| `body-s` | 14px | 14px | Inder | 1.5 | 0 | Card body, list items |
| `label` | 12px | 12px | Inder | 1.4 | 0 | Buttons, chips, meta |
| `micro` | 10–11px | 11px | Inder | 1.4 | 0 | Badges, timestamps, legends |

Rules: line length ≤ 75 characters (`max-w-prose`/`max-w-xl`). Headings `text-balance` where supported. **Sentence case** for everything (headings, buttons, tabs, labels).

Implementation: the Bricolage tokens are utilities `type-display-xl`, `type-display-l`, `type-title-l`, `type-title-m`, `type-title-s` and `type-score` in `app/globals.css` (named `type-*` so they never collide with `text-*` colour classes). Inder sizes use Tailwind `text-*` (`text-base`, `text-sm`, `text-xs`, `text-[11px]`, `text-[10px]`).

---

## 5. Layout & spacing

- **Container:** `max-w-[1360px] mx-auto px-5 md:px-10`. Reading content max 1200px in app pages (per spec).
- **Grid:** 12 columns desktop (`lg:grid-cols-12`), 6 on tablet (`md:grid-cols-6`), single column on mobile. Gaps: 20px (cards), 32–48px (columns).
- **Asymmetry is intentional:** hero = 7/5, sections = 5/7 or 4/8. Avoid 6/6 splits on the landing page.
- **Section rhythm:** `py-16 md:py-24`; hero `pt-8 pb-14 md:py-16 lg:py-20`. Sections separated by `border-b-4 border-ink`.
- **Spacing scale:** Tailwind default 4px base. Common: 8, 12, 16, 20, 24, 32, 40, 56, 96.
- **Background texture:** `.grain-overlay` = 1px dots at 6% ink every 20px on `body`. Don't add other textures.
- **Breakpoints:** `sm 640`, `md 768`, `lg 1024`, `xl 1280`. Desktop nav and sticky side columns start at `lg`.

---

## 6. Shape, borders, elevation

| Element | Radius | Border | Shadow |
| --- | --- | --- | --- |
| Large card | 22px | 2px ink | `brutal-lg` 7px 7px 0 ink |
| Medium card / panel | 18px | 2px ink | `brutal` 4px 4px 0 ink |
| Inner item / row | 12px | 1.5px ink | none |
| Input bar | 16px | 2px ink | `brutal-lg` |
| Pill / chip / tab | 999px | 1.5px ink | `brutal-sm` 2px 2px 0 ink when active |
| Primary CTA (rectangular) | 0 | 2px ink | `brutal` |
| Badge | 4–6px | 1px ink | none |
| Card on dark section | 24px | 2px cream | `brutal-lime` 6px 6px 0 lime |

- **Never** use soft/blurred shadows (`shadow-md`, `rgba(0,0,0,.1)`).
- Dashed dividers (`border-dashed border-ink/25–40`) separate *meta/actions* from content inside cards.
- Hierarchy comes from radius + shadow size: bigger card → bigger radius → bigger shadow.

---

## 7. Components

Each component lists: anatomy → states → rules. Class names are Tailwind with the FDN config (§12).

### 7.1 Buttons

| Variant | Look | Use |
| --- | --- | --- |
| **Primary** | `bg-terracottaDeep text-paper border-2 border-ink shadow-brutal`, square corners, `px-5 py-3` | One per view: "Explore Hyderabad", "Browse communities" |
| **Secondary filled** | `bg-oliveBtn text-ink`, same shape | Second CTA next to primary |
| **Dark pill** | `bg-ink text-cream rounded-full`, hover `bg-terracottaDeep` | In-card actions: "Add your answer", "Find dish" |
| **Outline pill** | `border-[1.5px] border-ink rounded-full bg-paper`, hover `bg-cream` | Comments, Share, Call |
| **Text link** | underline, `underline-offset-4`, hover terracotta | "Why we built this", "Open list and map" |

**Press interaction (brutal buttons):** on hover, `translate(2px,2px)` and shadow shrinks to `brutal-sm` — the button "presses into" the page (utility `press`).
Primitive: `Button` / `buttonVariants({ variant, size })` in `shared/ui/button.tsx`; links use `buttonVariants` on `<Link>`.
Labels say what happens: "Save changes", "Find dish", "Add your answer". No trailing "→". The resulting toast uses the same verb ("Saved on this phone").

### 7.2 Chips (context filters)

- Primitive `ChipButton` / `ChipLink` (`shared/ui/chip.tsx`, `chipVariants`): Inder 12px, `px-3 py-1.5`, pill, 1.5px ink border, `paper` fill.
- **Active** (`aria-pressed="true"`): `lime` fill, `brutal-sm` shadow, lifts `-1px,-1px`.
- Chips are **toggle buttons** (`<button aria-pressed>`), not links. On mobile they scroll horizontally edge-to-edge (`overflow-x-auto no-scrollbar -mx-5 px-5`).
- Approved chip vocabulary: Open now, Under ₹300, After 11 pm, Pure veg, Biryani leaderboard, Rainy day, Date night, Family Sunday, Within 3 km.

### 7.3 Segmented tabs (feed sort)

Pill container `p-1.5 rounded-full border-[1.5px] border-ink bg-paper shadow-brutal-sm`; active tab `bg-olive text-ink border-ink`. Use `role="tablist"`/`role="tab"`/`aria-selected`. Primitive: `TabsRoot` + `SegmentedTabsList` + `SegmentedTab` + `TabsPanel` (`shared/ui/tabs.client.tsx`, Base UI); arrow keys move the selection. Labels: Hot today, Photo posts, Questions, Lists & battles (posts in-app: Hot / New / Top).

### 7.4 Mode tabs (vertical, "How it works")

Stacked cards `rounded-2xl border-2`, title in Bricolage 18px + one-line description. Primitive: `ModeTabsList` + `ModeTab` (`shared/ui/tabs.client.tsx`). **Active:** `bg-ink text-cream`, `4px 4px 0 terracotta` shadow, lifts `-2px,-2px`. Horizontal scroll on mobile. Arrow keys move selection (roving `tabIndex`).

### 7.5 Image slots (replaces all illustrations)

FDN uses **real photos and real map images only**. Until assets exist, render a slot (primitive `ImageSlot`, `shared/ui/image-slot.tsx`, with a `label` such as "Dish photo · 800 × 600" and `kind="photo" | "map"`):

```html
<!-- IMAGE SLOT: replace with
<img src="/images/..." alt="Describe the food/place" class="w-full h-full object-cover" loading="lazy" width="800" height="300"> -->
<div class="map-slot relative h-36 border-b-2 border-ink overflow-hidden">
  <div class="absolute inset-0 flex flex-col items-center justify-center gap-1 text-inkMuted">
    <svg>…map icon…</svg>
    <span class="text-xs">Map image · 800 × 300</span>
  </div>
</div>
```

- Slot background: diagonal stripes `creamDark`/`cream` (`.map-slot`).
- Always print the expected dimensions in the slot.
- Real images: WebP/AVIF, `object-cover`, explicit `width`/`height` (zero CLS), `loading="lazy"` below the fold, meaningful `alt` (dish + place).
- Food photos sit inside a 2px ink border; **no rounded-full crops, no rings, no plates, no circular decorative shapes.** Avatars (small 28–40px initials) are the only circles allowed.
- Photo aspect ratios: post photos 4:5 or 1:1; branch hero strip 16:9; list map 8:3; share cards 1200×630 (OG) and 1080×1350 (Instagram).

### 7.6 Cards (catalogue)

| Card | Surface | Key contents (top → bottom) |
| --- | --- | --- |
| **Proof card** (hero) | paper, `rounded-[22px]`, `brutal-lg` | Rank badge (ink) + distance · Open-till pill (lime) → branch (meta) + dish (title-m) + loved % badge (lime box) → verdict bar + legend → price + "checked N ago by @user" + "Still true?" → link row showing route |
| **Experience post** | paper, large | Header strip (`creamDark`, "Posted on-site" pill right) → avatar + handle + trust badge + community · time → title (title-l) → body → dish verdict rows (2-col) → dashed divider → vote pill, comments, share, save (dark pill, right) |
| **Question** | lime | Community pill + answer count → question (title-m) → accepted answer box (paper) with "✓ Accepted" olive badge + attached place card → "Add your answer" |
| **List** | paper | Image slot (map) → title + "by @user" → top 3 ranked rows (number in Inder, price right) → saved count + "Open list and map" |
| **Receipt** | paper with torn bottom edge (`.receipt-bottom`), slight rotation `-1.2deg` | Place + "Ordered by @user · time" → dish rows with verdict words → dashed line → Paid total → one-line note. *Used in community content only — not in footer.* |
| **Battle** | ink | Live dot + "ends in" + votes → question → two option buttons → note "split hidden until you vote". Closed battle shows result bars (lime winner, terracotta loser) |
| **Facts** | paper | Big count → updated fact (old value, number of locals, time) → "Still true?" Yes/No |

Card rules: one primary action per card; meta lines in `micro`/`label` Inder `inkMuted`; never more than 4 badges in a card.

### 7.7 Badges & pills

| Badge | Style |
| --- | --- |
| Trust: Founding | `bg-lime border border-ink rounded px-1.5` micro |
| Trust: T2/Trusted, T1/Regular, T0/New | plain `inkMuted` meta text ("T2 local", "Regular") |
| Verdict | filled pill per §3.3 |
| ✓ Accepted / ✓ Answered by FDN | `bg-olive text-ink rounded` micro |
| Open till HH:MM | `bg-lime border border-ink rounded` |
| Closed / opens HH:MM | `bg-paper border border-ink` + `inkMuted` text |
| Rank (#1 in …) | `bg-ink text-cream rounded` |
| Disclosure (Hosted / Paid partnership / I work here) | `bg-terracotta/10 border border-terracotta text-ink` — always visible on post and its ratings |

Primitive: `Badge` with `tone="lime" | "paper" | "ink" | "olive" | "disclosure" | "neutral"` (`shared/ui/badge.tsx`). Open/closed badges come from `OpenStatus` (request-time, ARCHITECTURE D21).
| Held for review | terracotta text + diagonal terracotta stripes on the row |

### 7.8 Verdict distribution bar

`h-3 rounded-full border-[1.5px] border-ink overflow-hidden flex`; segments in fixed order; segment widths animate (`.w-bar`, 450ms). Legend below in micro: "Loved 78%  Good 16%  Okay 4%  Skip 2%". Show **"New · N ratings"** instead when weighted sum < 3 (spec 6.1).

### 7.9 Ranked rows

- **X-ray row** (what to order here): rank · dish · mini bar (hidden < 520px) · loved % · price. Last row may be the **Skip warning**: terracotta border, `terracotta/10` fill, "Skip: …, 41% of locals said skip".
- **Leaderboard row**: big rank number (Bricolage 800, 24px) · name + meta (price · distance · open) · loved % pill (lime) · trend (`▲n` oliveDeep, `▼n` terracotta, `–` muted).

### 7.10 Search bar (command bar)

`paper`, 2px ink, `rounded-2xl`, `brutal-lg`, focus ring `ring-4 ring-lime`. Search icon left, input Inder 14–16px, dark "Find dish" button right. Placeholder types example queries (stops on focus, disabled under reduced motion). Submit → `/hyderabad/search?q=`. Always `role="search"` with a visually hidden label.

### 7.11 Toast / sign-in-at-intent

Fixed bottom-centre (above mobile nav: `bottom: 96px`), `bg-ink text-cream rounded-2xl border-2`, `brutal-lime` shadow, message + lime pill action. `ToastProvider` / `useToast` (`shared/ui/toast.client.tsx`, mounted once in `app/layout.tsx`); write actions use `useSignInPrompt` or `IntentButton` (`features/shell`), whose Sign in link is `/login?next=<current path>`. Auto-dismiss 3.8s. `role="status" aria-live="polite"`. Copy pattern: **"[Reassurance]. Sign in to [action]."** e.g. "Reading stays free. Sign in to vote, it takes 10 seconds." Informational toasts omit the action button.

### 7.12 Navigation

- **Desktop header** (sticky, 72px, `bg-cream/95 backdrop-blur border-b-2`): FDN wordmark box (ink, `brutal-sm`) · city pill (live olive dot) · centre pill nav (active = olive, follows scroll via IntersectionObserver) · diet toggle · primary CTA.
- **Mobile bottom bar** (`lg:hidden`, fixed, safe-area padding): Discover · Search · **Post** (raised terracotta-deep square, 56px, `brutal`; a button that shows the sign-in prompt for guests) · Communities · You. Body gets `padding-bottom: 76px + safe-area`.
- **Diet toggle** (`DietToggle`, `features/dishes`): a chip-style toggle with the veg-mark square (olive outline, dot fills when on) and the constant label "Veg only"; the pressed state shows as lime fill + `aria-pressed`. The label does not switch to "All diets", so the accessible name never contradicts the visible text (WCAG 2.5.3). Turning it on adds `.veg-only` to `<html>` (restored before first paint from `localStorage`), which hides every `[data-diet="egg"]` and `[data-diet="nonveg"]` element. Every dish element in a list carries `data-diet` with the `Diet` value (`veg` | `egg` | `nonveg`); an entity's own page never does. Text shown only in veg-only mode uses `.veg-only-hint`.

### 7.13 Accordion (FAQ)

Native `<details name="faq">` (exclusive), styled as question posts: vote count column (desktop) · question (Bricolage 18–20px) · "+" in 36px circle button rotating 45° when open. Open item gets `brutal` shadow. Answers start with "✓ Answered by FDN". Include `FAQPage` JSON-LD.

### 7.14 Live ticker

Full-bleed ink strip, Inder 12px, handles in lime, verdict words coloured. Loops via CSS (`48s linear`), pauses on hover/focus, static under reduced motion. Max one ticker per page.

### 7.15 Footer

Ink background. Brand column (FDN wordmark, one-line promise, "No ads. No paid ranks. Ever." in lime) + 4 link columns (Eat by area, Best in the city, Community, FDN) + grievance officer block (required by spec E14-6) + language switcher (English active; తెలుగు, हिन्दी disabled "soon") + giant outlined FDN wordmark (lime 2px text-stroke) + bottom bar. **No bill/receipt element in the footer.**

---

## 8. Motion

| Token | Duration | Easing | Use |
| --- | --- | --- | --- |
| `instant` | 150ms | ease | Hover colour, chip press |
| `swap` | 180–250ms | ease-out | Card content swap (fade to 15% → update → fade in), tab panel in (6px rise) |
| `bar` | 450ms | `cubic-bezier(.2,.8,.2,1)` | Bar widths, score changes |
| `collapse` | 600ms | `cubic-bezier(.6,0,.2,1)` | Reserved for large layout changes (no current use) |
| `pop` | 450ms | `cubic-bezier(.2,1.4,.4,1)` | Reserved for a result appearing after an action (no current use) |
| `flash` | 800ms | ease-out | Lime background flash on a row the user just changed |

Rules:
- Motion must be **caused by the user** (tap, toggle) except: live dots pulsing, ticker, placeholder typing.
- No scroll-reveal animations on sections. No parallax.
- Only animate `transform`, `opacity`, `width` of small bars. Zero layout shift.
- Wrap everything in `@media (prefers-reduced-motion: reduce)` → no animation, instant state change.

---

## 9. UX patterns (behaviour every screen must follow)

### 9.1 Sign-in at intent (spec W2)
- Reading, searching, directions, call, share: **never** gated.
- Save as guest: stored on device (max 20), toast "Saved on this phone. Sign in to keep it everywhere."
- Rate / vote / post / comment / answer / confirm fact / 21st save → sign-in toast or sheet stating the reason, then **resume the original action** after login.

### 9.2 Battles
- Guests and non-voters never see the split. After voting, show percentages.
- Copy always states: battles never change dish scores.

### 9.3 Living facts
- Each fact shows "checked N ago by @user". Past freshness window (hours 60d, price 90d, phone 180d) → muted warning style + "Help confirm".
- "Still true?" → Yes/No; No asks for the new value with structured input.

### 9.4 Scores
- Show score only with ≥ 3 weighted ratings; else "New · N ratings".
- Every score has an info affordance explaining how it's computed.
- Disclosed (hosted/paid/I work here) ratings are shown, labelled, and visibly counted as 0.

### 9.5 Empty states
Direct the next action, no apologies. Examples: "Nothing matches all those filters. Remove one to see more." / "No answer matches that yet. Ask it in Hyderabad Food and someone will."

### 9.6 Location
Never trigger the browser location prompt on first paint. Use a soft in-page banner "Show food near you?"; fallback to locality picker. Distance shows only when known.

---

## 10. Copy & voice

- **Voice:** a well-fed local friend. Warm, specific, short. Hyderabadi references welcome (Irani chai, haleem, Charminar), never forced slang.
- **Sentence case** for all UI text.
- Use real numbers and specifics: "₹360, checked 14 h ago", not "affordable".
- Buttons = verb + object. Tabs/nav = nouns.
- Errors say what happened and how to fix it. No "Oops".
- Banned: "Sponsored", "Featured partner", "Top rated" (without a number), "★", "4.2", ALL-CAPS labels, emoji anywhere in the UI (icons are Lucide, on a palette tile when they stand for an app or a place).
- Currency: `₹` with Indian grouping (`toLocaleString('en-IN')` → 1,204 / 1,20,400). Time: 24h `01:30` in facts; "After 11 pm" in casual chips.
- i18n: every string must be a translation key in app code (English now, Telugu/Hindi later). Avoid text baked into images.

---

## 11. Accessibility checklist

- Focus: `:focus-visible { outline: 3px solid #C8524B; outline-offset: 3px }` — never remove.
- Contrast: AA for all text (see §3.4).
- Toggles: `<button aria-pressed>`; tabs: `role=tablist/tab/tabpanel`, `aria-selected`, `aria-controls`, arrow-key navigation.
- Live regions: proof card, X-ray rows, toast use `aria-live="polite"`.
- Decorative SVGs `aria-hidden="true"`; icon-only buttons have `aria-label`.
- Tap targets ≥ 44 × 44px on mobile (chips may be 32px tall if spaced ≥ 8px).
- Every section has an `aria-labelledby` heading. One `h1` per page.
- Images have meaningful `alt`; image slots are not focusable.

---

## 12. Implementation tokens

### 12.1 Tailwind v4 theme (`app/globals.css`)

There is no `tailwind.config.ts`. `:root` holds the `--fdn-*` values (§12.2) and `@theme inline` maps them to utilities. Tailwind's default colour, shadow and font scales are reset, so off-palette classes such as `bg-white`, `text-gray-500` or `shadow-md` do not exist.

```css
@theme inline {
  --color-*: initial;
  --color-cream: var(--fdn-cream);        /* bg-cream, text-cream, border-cream … */
  --color-creamDark: var(--fdn-cream-dark);
  --color-inkMuted: var(--fdn-ink-muted);
  --color-terracottaDeep: var(--fdn-terracotta-deep);
  /* …every token in §3.1 */
  --font-display: var(--fdn-font-display);
  --font-sans: var(--fdn-font-body);
  --font-mono: var(--fdn-font-body);      /* legacy alias, §4.1 */
  --shadow-*: initial;
  --shadow-brutal-sm: 2px 2px 0 var(--fdn-ink);
  --shadow-brutal: 4px 4px 0 var(--fdn-ink);
  --shadow-brutal-lg: 7px 7px 0 var(--fdn-ink);
  --shadow-brutal-lime: 6px 6px 0 var(--fdn-lime);
  --shadow-brutal-terracotta: 4px 4px 0 var(--fdn-terracotta); /* active mode tab, §7.4 */
  --radius-card: 22px;  --radius-panel: 18px;  --radius-row: 12px;
  --ease-bar: cubic-bezier(.2,.8,.2,1);  --ease-collapse: cubic-bezier(.6,0,.2,1);  --ease-pop: cubic-bezier(.2,1.4,.4,1);
}
```

Class names keep the camelCase token names (`bg-creamDark`, `text-inkMuted`, `bg-oliveBtn`). `shared/lib/cn.ts` teaches tailwind-merge the custom radius, shadow and `type-*` names so overrides merge correctly.

### 12.2 CSS variables (for non-Tailwind code, OG image renderers, emails)

```css
:root {
  --fdn-cream:#ECEBC9; --fdn-cream-dark:#E2E0B5; --fdn-paper:#F8F7E8;
  --fdn-ink:#141612; --fdn-ink-muted:#4A4D43;
  --fdn-lime:#C7EA76; --fdn-lime-bright:#B8E94A;
  --fdn-olive:#76A02B; --fdn-olive-deep:#4F6E17; --fdn-olive-btn:#97AE42;
  --fdn-terracotta:#C8524B; --fdn-terracotta-deep:#A9443D; --fdn-saffron:#F2B33D;
  --fdn-shadow:4px 4px 0 var(--fdn-ink);
  --fdn-font-display:var(--font-bricolage),'Bricolage Grotesque',system-ui,sans-serif;
  --fdn-font-body:var(--font-inder),'Inder',system-ui,sans-serif;
  --dur-instant:150ms; --dur-swap:200ms; --dur-bar:450ms; --dur-collapse:600ms; --dur-pop:450ms; --dur-flash:800ms;
}
```

### 12.3 Global CSS utilities

Defined once in `app/globals.css`:

| Utility | Use |
| --- | --- |
| grain on `body` | 1px ink dots at 6% every 20px (§5) |
| `press` | Brutal button press on hover (§7.1) |
| `no-scrollbar` | Edge-to-edge horizontal chip and card rows |
| `map-slot` | Diagonal stripes for `ImageSlot` (§7.5) |
| `receipt-bottom` | Torn bottom edge of the receipt card (§7.6) |
| `held-stripes` | Terracotta stripes on rows held for review (§7.7) |
| `wordmark-outline` | Lime 2px text-stroke footer wordmark (§7.15) |
| `w-bar` | Width transition for verdict and weight bars (§8 `bar`) |
| `animate-live-dot`, `animate-ticker`, `animate-panel-in`, `animate-flash` | §8 motions; all stop under reduced motion |
| `.veg-only`, `.veg-only-hint` | Diet filter (§7.12) |

### 12.4 Component map

```
app/globals.css                    tokens, type scale, utilities
app/layout.tsx                     fonts, veg-only boot script, ToastProvider
shared/ui/                         primitives: no data fetching, no feature imports
  button.tsx      Button, buttonVariants (primary | secondary | dark | outline | link)
  chip.tsx        ChipButton, ChipLink, chipVariants
  badge.tsx       Badge (lime | paper | ink | olive | disclosure | neutral)
  card.tsx        Card, cardVariants (size lg | md | flat; tone paper | cream | lime | ink | onDark)
  tabs.client.tsx TabsRoot, TabsPanel, SegmentedTabsList, SegmentedTab, ModeTabsList, ModeTab
  image-slot.tsx  accordion.tsx  ticker.tsx  toast.client.tsx  tooltip.client.tsx  dialog.client.tsx
  input.tsx  avatar.tsx  breadcrumbs.tsx  empty-state.tsx  skeleton.tsx  og-card.tsx
features/ratings/components/       VerdictPill, VerdictBar, RatingDistribution, ScoreBadge (box | pill | inline), FoodScore, ScoreInfo
features/dishes/components/        DietMark, DietToggle, DishRow (xray | menu), PlacedDishRow + LeaderboardList
features/places/components/        BranchHeader, ActionRow, OpenStatus, FactsCard, BranchCard, ShareButton
features/search/components/        CommandBar (§7.10), SearchBox (header), ContextChips
features/shell/components/         TopBar, BottomNav, SiteFooter, Logo, CityPill, NavPills, PostButton, IntentButton
features/landing/                  landing sections; illustrative content in lib/content.ts (ARCHITECTURE D28)
```

Primitive props expose variants named exactly as in this doc (`variant="primary" | "secondary" | "dark" | "outline" | "link"`, `verdict="loved" | "good" | "okay" | "skip"`). Landing cards in §7.6 (post, question, list, receipt, battle, facts) live in `features/landing/components/feed-cards.tsx` until their features ship in P4–P5, then move to those features.

---

## 13. Landing page map (reference)

| # | Section | Anchor | Bold moment | Primary action |
| --- | --- | --- | --- | --- |
| — | Header | — | — | Explore Hyderabad |
| 1 | Hero: "Know exactly what to order, before you go." | — | Chips swap the live proof card | Find dish |
| 2A | One dinner. Six apps. | `#six-apps` | The six steps of one dinner decision (question, app, frustration, minutes) swap, staggered, to FDN's answer for each; the total drops from 25 min to under 30 s | Do it in one page |
| 2B | Four ways in. One confident order. | `#how-it-works` | Browser frame shows the real route | Open this page |
| 3 | Hyderabad, eating out loud. | `#community` | Live ticker + bento | Browse communities |
| 4 | A score you can take apart. (dark) | `#rules` | Score X-Ray + fake-burst demo | Try a fake-review burst |
| 5 | Fair questions before you trust us. | `#faq` | — | Ask Hyderabad |
| — | Closing CTA (lime) | — | — | Find dish / Add to home screen |
| — | Footer (ink) | — | Outlined wordmark | — |

---

## 14. Do / Don't

| Do | Don't |
| --- | --- |
| Hard offset shadows in ink | Blurred grey shadows |
| Real photos in ink-bordered frames, or a labelled image slot | Illustrated plates, rings, circular food crops, stock "food" emoji as imagery |
| Verdict words with fixed colours | Stars, half-stars, "4.2" |
| One dark section + footer | Alternating dark/light every section |
| Bricolage for headings, Inder for everything else | Any third font, monospace, italics |
| Sentence case labels | ALL CAPS eyebrows above headings |
| "checked 14 h ago by @user" on facts | Facts without a timestamp |
| Sign-in prompt that names the action | Signup walls on read pages |
| Motion after a tap | Fade-up on every section on scroll |
| `data-diet` on every dish element | Dishes that ignore the veg toggle |

---

## 15. Agent workflow (when building or changing UI)

1. Read §0, then the component(s) in §7 you are touching.
2. Reuse an existing primitive before creating a new one. New primitive → add it to §7 in the same PR.
3. Use tokens only (§3, §4, §6). If a value is missing, propose a token; don't hard-code.
4. Build mobile (390px) first, then `md`, then `lg`.
5. Wire the UX behaviour from §9 (sign-in at intent, veg filter, facts freshness).
6. Run the §11 checklist and test with `prefers-reduced-motion`.
7. Compare against `docs/reference/fdn-landing-full.html` visually at 390 px and 1280 px; spacing and shadows should match.
8. Copy-check against §10 (sentence case, verbs, no banned words).

---

## 16. Where the build differs from the reference file

The reference HTML is a prototype; these differences are intentional.

| Reference file | Build | Why |
| --- | --- | --- |
| Real Hyderabad restaurants with invented scores | Fictional seeded brands; every place links to its real page | No made-up verdicts about real businesses; links never 404 (ARCHITECTURE D28) |
| `bg-terracotta text-paper` CTAs, Skip pills; `bg-olive text-paper` pills and tabs | `terracottaDeep` under text; ink text on olive | WCAG AA (§3.4) |
| `font-bold` / `font-semibold` on Inder labels | Regular Inder, except tiny pills and badges | Inder has one weight; faux bold only for badges (§4.1) |
| "Do it in one page" in ink | `primary` button | It is the section's primary action (§13) |
| Diet toggle label "All diets" / "Veg only" | Constant "Veg only" with pressed state | Accessible name matches visible label (§7.12) |
| Six emoji app cards at random tilts that collapse into one card | A straight bento grid of six numbered journey steps, Lucide icons on palette tiles, and a full-width total card; the toggle swaps each step to its FDN answer in place | Tells the user's story in order, keeps the layout stable (no tilt, no overlap), fixed palette (§0.1) |
| Section grids without a mobile column template (page scrolls sideways at 390 px) | `grid-cols-1` / `min-w-0` on every section grid | No horizontal scroll on mobile (§9) |
| Search submits show a toast with the route | Real navigation to `/hyderabad/search?q=`; an empty query shows a hint instead | Production behaviour |
| `#` links in feed cards | Real routes; comment count and attached place card are plain text until posts exist | No dead links |
| Grievance officer block with "[Name]" | Omitted until `/grievance` ships with the officer's details | No placeholders (ARCHITECTURE D13) |
