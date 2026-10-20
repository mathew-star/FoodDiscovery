# Design system — "Ghee & Saffron"

Warm, appetising, trustworthy. Cream neutrals, a saffron primary and a cardamom-teal accent for trust signals (verified facts, founding badges). No red-pink primary; this is not a delivery app. Information first, decoration second.

## 1. Tokens

Defined as CSS variables in `app/globals.css` on `:root` (light) and `[data-theme="dark"]` (plus `prefers-color-scheme` when no explicit theme), exposed to Tailwind through `@theme inline`. Components use token classes only (`bg-surface`, `text-muted`, `border-default`); no raw hex.

### Colour

Ratios are WCAG 2.2 contrast against `bg` (and `surface`). Text tokens ≥ 4.5:1, non-text UI ≥ 3:1.

| Token | Light | Dark | Ratio L / D |
| --- | --- | --- | --- |
| `--bg` | `#FBF7F1` | `#16110C` | — |
| `--surface` | `#FFFFFF` | `#211912` | — |
| `--surface-2` | `#F4ECE1` | `#2C231A` | — |
| `--text` | `#2A1D12` | `#F6EEE3` | 15.3 / 16.3 |
| `--text-muted` | `#6A5644` | `#BCAA95` | 6.5 / 8.3 |
| `--border` | `#E4D8C8` | `#3D3226` | decorative only |
| `--border-strong` (inputs, focus-adjacent) | `#8F7E6B` | `#80705E` | ≥ 3.3 on bg, surface, surface-2 |
| `--primary` | `#B4410F` | `#F2914F` | 5.3 / 8.0 |
| `--on-primary` | `#FFFFFF` | `#16110C` | 5.7 / 8.0 on primary |
| `--accent` | `#1F6F6B` | `#5FC4BC` | 5.6 / 9.0 |
| `--danger` | `#B42318` | `#F97066` | 6.2 / 6.7 |
| `--focus-ring` | `#B4410F` | `#F2914F` | 2 px ring, 2 px offset |
| `--diet-veg` | `#1D7A3E` | `#5CC27F` | 5.0 / 8.5 |
| `--diet-nonveg` | `#8A3A10` | `#E58E5E` | 7.3 / 7.5 |
| `--diet-egg` | `#8A5A00` | `#E2B54A` | 5.6 / 9.8 |
| `--rate-loved` | `#B4262D` | `#F2777C` | 6.0 / 6.9 |
| `--rate-good` | `#2F6A3A` | `#7BC98A` | 6.1 / 9.4 |
| `--rate-okay` | `#7A5A12` | `#D9B45A` | 6.0 / 9.5 |
| `--rate-skip` | `#55565C` | `#A9ABB2` | 6.9 / 8.2 |

Tinted backgrounds (`--rate-*-soft`, `--diet-*-soft`, `--primary-soft`) are the base hue at 10 % (light) / 18 % (dark) over `surface`, and always carry text in the full-strength token. A Vitest test parses `globals.css` and fails if any text pair drops below 4.5:1 or non-text pair below 3:1.

### Never colour alone

| Meaning | Glyph | Label | Extra cue |
| --- | --- | --- | --- |
| Loved | filled heart | "Loved" | — |
| Good | thumbs-up | "Good" | — |
| Okay | horizontal bar in circle | "Okay" | — |
| Skip | crossed circle | "Skip" | — |
| Veg | square outline + filled circle | "Veg" (visible or `sr-only`) | FSSAI shape |
| Non-veg | square outline + filled triangle | "Non-veg" | FSSAI shape |
| Egg | square outline + filled oval | "Egg" | — |
| Jain-friendly | none | text badge "Jain" | — |
| Open / Closed | dot + text "Open · closes 23:00" | always text | — |
| Stale fact | clock glyph | "Confirmed 92 days ago" | muted warning style |

Rating distribution bars show the label and percentage beside each bar; selected rating buttons add a check glyph and `aria-pressed`.

### Type

| Role | Face | Fallback chain |
| --- | --- | --- |
| Display (h1–h3, battle titles, list titles) | Fraunces (variable, opsz, `SOFT` 50) | Noto Serif, Georgia, serif |
| Text (UI, body, numbers) | Noto Sans (variable) | Noto Sans Telugu, Noto Sans Devanagari, system-ui, sans-serif |

Loaded with `next/font/google`, `display: swap`; Telugu and Devanagari faces load only for matching unicode ranges. Telugu/Hindi headings use the text face at weight 700 (Fraunces has no Indic glyphs). Prices, percentages and counts use `font-variant-numeric: tabular-nums`.

Scale (rem at 16 px): `xs` 0.75 · `sm` 0.875 · `base` 1 · `lg` 1.125 · `xl` 1.25 · `2xl` 1.5 · `3xl` 1.875 · `4xl` 2.25. Body line-height 1.5, headings 1.2. Minimum body size on mobile 16 px; minimum meta text 12 px.

### Spacing, radius, elevation

- Spacing (4 px base): `0, 1=4, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 12=48, 16=64`. Page gutter 16 px mobile, 24 px ≥ 768 px; content max 1200 px.
- Radius: `xs 4` (badges) · `sm 8` (inputs, chips) · `md 12` (cards) · `lg 16` (sheets) · `xl 24` (hero media) · `full` (avatars, pills).
- Elevation: `0` flat · `1` cards `0 1px 2px rgb(42 29 18 / .08)` · `2` popovers `0 4px 12px rgb(42 29 18 / .12)` · `3` sheets/dialogs `0 12px 32px rgb(42 29 18 / .18)`. Dark mode drops shadows and steps surface lightness (`surface` → `surface-2`) instead.
- Touch targets ≥ 44 × 44 px; chips 36 px tall with 44 px hit area.

### Motion

| Token | Value | Use |
| --- | --- | --- |
| `--dur-fast` | 120 ms | press, toggle, optimistic vote tick |
| `--dur-base` | 200 ms | popover, toast, tab indicator |
| `--dur-slow` | 320 ms | sheet, dialog |
| `--ease-standard` | `cubic-bezier(.2,0,0,1)` | default |
| `--ease-emphasized` | `cubic-bezier(.3,0,0,1)` | sheet enter |

Rules: nothing over 400 ms; no parallax, autoplay or looping animation; animate `transform`/`opacity` only; `prefers-reduced-motion: reduce` swaps movement for a 120 ms opacity fade; skeletons pulse at most once per 1.5 s and stop under reduced motion.

### Iconography

Lucide, stroke 1.75, sizes 16/20/24, `currentColor`, `aria-hidden` unless standalone (then `aria-label`). Custom SVG components in `shared/ui/icons/` for diet marks and rating glyphs. No emoji as UI.

## 2. Components

### Primitives (`shared/ui`)

Button (primary, secondary, ghost, danger; sm/md/lg; loading), IconButton, Link, Input, Textarea (counter), Select, Combobox, Checkbox, SegmentedControl, Switch, Chip (toggle, removable), Badge, Avatar, Card, Sheet (bottom on mobile, side on desktop), Dialog, Popover, Tooltip, Tabs, Toast, Skeleton, EmptyState, VisuallyHidden, InfiniteList, Divider. Built on Base UI for focus management and ARIA; styled with `cva`.

### Domain components (in their feature)

| Component | Feature | Notes |
| --- | --- | --- |
| `RatingPicker`, `RatingBadge`, `RatingDistribution`, `ScoreBadge` | ratings | ScoreBadge shows "New · N ratings" below threshold; info tooltip explains score |
| `DietMark` | dishes | shapes above; `size` sm/md |
| `DishCard`, `BranchDishRow`, `LeaderboardRow` | dishes | rank arrows vs last week |
| `BranchCard`, `BranchHeader`, `ActionRow`, `OpenStatus`, `DistanceLabel`, `PriceBand`, `MapStatic` | places | ActionRow: Directions, Call, Save, Share, Rate |
| `FactsCard`, `FactRow`, `StillTrueSheet` | facts | |
| `PostCard`, `PostComposer`, `DisclosureTag`, `OnSiteMark`, `EmbedLite` | posts | |
| `CommentThread`, `CommentComposer`, `VoteBar` | comments, votes | optimistic, `aria-pressed` |
| `CommunityCard`, `CommunityHeader`, `JoinButton` | communities | |
| `BattleCard`, `BattleVote`, `BattleResult` | battles | share hidden until voted |
| `SaveButton`, `ListCard`, `ListMap` | saves | guest save toast |
| `SearchTypeahead`, `ContextChips`, `FilterSheet`, `NoResults` | search | |
| `TopBar`, `BottomNav`, `CitySwitcher`, `LocationBanner` | discover (shell) | |
| `AuthSheet`, `OnboardingForm` | auth, profile | reason line ("Sign in to rate this dish") |
| `PhotoUploader`, `PlacePicker` | media, places | per-photo progress |
| `TrustBadge`, `FoundingBadge` | profile | |
| `ReportSheet` | moderation | |

## 3. Accessibility rules

- WCAG 2.2 AA. Visible focus ring on every interactive element. Skip link to main.
- One `h1` per page; landmarks `header`, `nav`, `main`, `footer`.
- Sheets/dialogs trap focus, close on Esc, return focus to trigger.
- Live regions for toasts, optimistic vote counts and upload progress.
- Images: `alt` from dish + branch names when the author leaves it blank; decorative images `alt=""`.
- Form errors linked with `aria-describedby`; never colour-only error state.
- Language: `lang` on `<html>`; Telugu/Hindi strings wrapped with matching `lang` when mixed.
