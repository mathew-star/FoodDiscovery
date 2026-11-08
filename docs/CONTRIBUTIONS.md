# Contributions, ratings and owner claims

How restaurants and dishes get added, how ratings attach and start counting, how duplicates are stopped, and how owners take over official information. This is the reviewed design for spec W3, W8, E3-4, E6-1…E6-4 and the owner-claim proposal; `docs/ARCHITECTURE.md` §Decisions (D43–D52) records where it departs from the spec or the proposal.

## 1. Principles

1. **Ratings attach to a dish card (`branch_dishes`) and nowhere else.** Renames, merges and owner takeovers move or relabel the card; ratings never move by themselves and are never lost.
2. **Save first, decide later.** A member is never blocked from rating because a dish or place is unknown. What is saved does not have to count.
3. **Whether a rating counts is a rule, not a storage state.** Ratings are always plain rows. A rating counts when:
   - it is the member's current one (`is_current`),
   - its dish is `active` and its branch is `listed`,
   - it is not `suspect`,
   - its disclosure is `none` and the member has no affiliation with the brand.
4. **Abuse limits still apply.** "Never refused" means never refused for being unknown; rate limits, spam checks and trust weights apply as everywhere else (spec §7).

## 2. Two status axes, not one

The proposal put lifecycle and operations in one `status`. They change for different reasons and are set by different people, so they are separate columns.

| Entity | Listing (moderation, who decides) | Operation (real world) |
| --- | --- | --- |
| Branch | `listing`: `provisional` → `listed`; or `rejected`, `merged` (Ops) | `status`: `active`, `temporarily_closed`, `permanently_closed` (facts consensus, Ops for permanent) |
| Dish | `status`: `pending` → `active`; or `rejected`, `merged`, `archived` (rules + Ops) | `is_active`, "served now" (owner or Ops; unserved dishes keep their ratings, greyed) |

Claimed is not a status. A claim is a `branch_owners` row; a listed branch with an owner shows "Verified owner". Revoking a claim deletes the row and changes nothing else.

## 3. Data model

Existing tables keep their names; new ones follow AGENTS naming.

| Table | New or changed fields | Purpose |
| --- | --- | --- |
| `branches` | `listing`, `created_by`, `merged_into_id`, `format`, aspect scores (`value_score`, `service_score`, `ambience_score`, `would_return_pct`, `aspect_count`) | The restaurant page |
| `branch_dishes` | `status`, `source` (`seed`, `community`, `owner`, `ops`), `normalized_name`, `fingerprint`, `created_by`, `merged_into_id`, `owner_managed` | The dish card |
| `branch_dish_aliases` | `branch_dish_id`, `raw_text`, `created_by`, `submitted_price_paise`, `how` (`typed`, `merge`, `owner`) | Every spelling, for search and matching |
| `dish_ratings` | `user_id`, `branch_dish_id`, `sentiment`, `is_current`, `disclosure`, `suspect`, `trust_at_time`, `post_id`, `created_at` | One current row per member and dish; older rows are history |
| `branch_aspect_ratings` | `user_id`, `branch_id`, `value`, `service`, `ambience` (`good`, `okay`, `poor`, nullable each), `would_return`, `is_current` | Restaurant-level opinions |
| `brand_affiliations` | `user_id`, `brand_id`, `role` | "I work at / own" (spec §7.6): those ratings weigh 0 |
| `review_tasks` | `kind` (`new_dish`, `new_branch`, `dish_duplicate`, `claim`, `correction`), `entity_id`, `priority`, `state`, `resolution`, `assigned_to` | The Ops queue |
| `entity_merges` | `kind`, `survivor_id`, `merged_id`, `actor_id`, `reason`, `moved` (jsonb counts) | Record of every merge |
| `branch_claims`, `branch_owners` | claim evidence (FSSAI number, documents as media ids), state; owner role | Owner takeover (R5) |
| `audit_log` | `actor_id`, `action`, `entity`, `before`, `after`, `reason` | Who changed what (shared with moderation, P6) |

Unique rules enforced by the database:

- `dish_ratings`: partial unique `(user_id, branch_dish_id) WHERE is_current`.
- `branch_aspect_ratings`: partial unique `(user_id, branch_id) WHERE is_current`.
- `branch_dishes`: partial unique `(branch_id, fingerprint) WHERE status IN ('pending', 'active')` — two people adding the same dish at the same moment get one card.

## 4. Scores

Unchanged from spec §6.1–6.2, computed from `dish_ratings`:

- Weight = trust weight (the member's **current** level, so bans and upgrades apply retroactively; `trust_at_time` is kept for audit) × time weight (270-day half-life) × disclosure/affiliation weight (0 or 1).
- Bayesian shrink toward the canonical dish's city mean (default 0.65 below 20 ratings), C = 5.
- **Recompute is synchronous for what a submission touched** (the rated dishes and their branch, inside the same transaction) and nightly for everything (P3 job). This meets "within 60 s" without an outbox or queue; the nightly job repairs anything a failed request missed.

Seed data gets real rating rows from fictional sample members (D19), so every score on the site is reproducible from `dish_ratings`.

## 5. Dish lifecycle

### 5.1 Fingerprint (Gate 2)

`features/dishes/lib/fingerprint.ts` (pure, unit tested):

1. Lowercase, strip accents and punctuation, collapse spaces.
2. Map token synonyms (`biriyani`, `briyani` → `biryani`; `chk`, `chkn` → `chicken`; `mtn` → `mutton`; `halim` → `haleem`; …).
3. If the whole cleaned name equals a known canonical dish name or alias, use that canonical's tokens (protects names like "Double ka meetha" from losing "double").
4. Otherwise drop portion and filler words (`plate`, `half`, `full`, `single`, `family`, `pack`, `regular`, `pcs`, `piece`, `with`, `and`, `the`, …) but never variant words (`boneless`, `fry`, `roast`, `special`, `dum`, `tandoori`, …).
5. Sort unique tokens and join with `_`.

"Chk Biryani (Single)", "Chicken biriyani" and "Full plate chicken biryani" all become `biryani_chicken`; "Chicken fry piece biryani" stays `biryani_chicken_fry`.

### 5.2 Adding a missing dish (Flow C)

- Gate 1: the rate sheet's dish typeahead shows existing dishes (with rating counts) above "Add a dish".
- Gate 2: on submit the fingerprint is checked; a match saves the typed text as an alias and attaches the rating to the existing card.
- Otherwise a `pending` card is created (`source = community`), the alias is saved, the rating is saved normally and a `new_dish` task opens.

### 5.3 Activation

A `pending` dish becomes `active` at the first of:

1. **Corroboration:** at least 2 distinct current raters whose summed trust weight is ≥ 1.5 (`ranking_config.dish_activation`). Two brand-new accounts (0.5 + 0.5) are not enough; a new account plus a regular is.
2. **Ops approval.**
3. **Confident match:** a T1+ member adds it at a listed branch and the fingerprint equals a canonical dish's fingerprint.

The proposal's "a second person rates it" alone would let two throwaway accounts list any dish; the trust sum closes that.

### 5.4 Who sees a pending dish

Inline in the menu with a "New" badge, never in a separate section:

- Added by T1+: everyone.
- Added by T0: everyone else sees it only in the rate sheet when they search for it, after it passed the text check, so a second person can confirm it without retyping. The adder sees it in their own rate sheet. Unprompted rate-sheet chips show only live dishes.
- Never in What to order here, city rankings, search, leaderboards or sitemaps until `active`.

### 5.5 Duplicates and merges (Gate 3)

A nightly job flags near-duplicates at the same branch (trigram similarity on `normalized_name`, same diet) as `dish_duplicate` tasks. Merging moves ratings, posts and aliases to the survivor; when one member rated both, their newest rating stays current and the other becomes history. The merged card keeps `merged_into_id` so its URL redirects (301).

## 6. Branch lifecycle (Flow D)

- "Can't find it? Add it": name (live duplicate check: similar name within 150 m, or the same phone) → format and diet → pin and **required storefront photo** → optional dishes eaten.
- Creates a `provisional` branch and a `new_branch` task. Limits: T0 2 per day, T1+ 10 per day.
- A provisional page is reachable by its URL (`noindex`, "Added by the community, not verified yet" banner) so a shared link never 404s; it is excluded from search, Discover, area pages and sitemaps. Its creator can edit it until it is listed.
- Ops approves (→ `listed`, page goes public, ratings start counting), rejects (reason sent) or merges into an existing branch (everything moves, 301). No decision in 14 days reminds Ops; 30 days auto-rejects.

## 7. Facts (Flow G)

Unchanged from spec §6.6 and W8. Once listed, facts change only through consensus, Ops or the verified owner. "Permanently closed" is always Ops-reviewed.

## 8. Owner claims (Flow H)

- Claim: sign in, role, FSSAI number, licence photo; optional walkthrough video. Two claims on one branch → 7-day cooling period and Ops decides.
- Approved: a `branch_owners` row, "Verified owner" badge, owner dashboard.
- **Reconcile:** community dishes listed with their ratings; per dish the owner can link and rename (official name and price, `owner_managed`; ratings stay), mark "not currently served", or ask Ops to remove a dish never served there (Ops confirms, so a poorly rated real dish cannot be hidden).
- Owners control photos, bio, hours, phone, pin, official names, prices, categories and "served now" (`is_active`). They never control ratings, loved %, What to order here, posts or comments.
- Revoked claim: the owner row goes; ratings are untouched.

## 9. Not in this design

- **Menu photo reading (Flow E):** it needs a vision model, and the MVP has no LLM (D4). Owners and Ops enter menus by hand; members add dishes one at a time. Revisit when D4 changes.
- **Outbox table:** synchronous recompute plus the nightly job covers scores (§4). An outbox arrives with Inngest fan-out in P4 (notifications, screening), where losing an event matters.

## 10. Build order

| Step | Scope | Done when |
| --- | --- | --- |
| R1 | Lifecycle columns, `dish_ratings`, aspect ratings, affiliations; score service; rate sheet on branch and dish pages; intent resume; sample ratings in seed | A rating changes the dish score and the branch food score on the next page load; re-rating keeps history |
| R2 | Fingerprint, aliases, add-and-rate a missing dish, activation rule, "New" badge, `review_tasks` | Flow F examples pass; a corroborated dish becomes active and counts |
| R3 | Add a place (provisional), media upload (R2 storage), provisional page | Add place → rate → Ops lists → ratings count |
| R4 | Ops queue in `/admin` (new dishes, new branches, duplicates), merges with redirects | Merging two dishes rated by one member keeps their newest rating current |
| R5 | Claims, owner dashboard, reconcile | Renaming "Chk 65" to "Chicken 65" keeps all 24 ratings |
| Later | Fraud scans (§7.3), trust job, provisional expiry, fact proposals | P5–P6 |
