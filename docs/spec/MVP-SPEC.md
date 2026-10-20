# Food Discovery Network — MVP Product & Technical Specification

Oct 17, 2026 · @Mathew joseph

## 1. Product summary

The MVP is a fast, mobile-first web app (installable PWA) for Hyderabad where anyone can find the best dishes and restaurants without signing up, and signed-up members rate dishes, post photos and experiences, comment and vote Reddit-style. Working name in this spec: **FDN**.

### 1.1 Decisions locked for the MVP

| Decision | Choice | Why |
| --- | --- | --- |
| Platform | Responsive web app + PWA (no native apps) | Shared links, SEO and WhatsApp previews are the growth engine; one codebase |
| Access | Read everything as a guest; sign up only to engage | Public pages get indexed and shared; signup asked at the moment of intent |
| Core entity | Dish at a specific restaurant branch | Dish-first discovery is the wedge; branches differ |
| Rating model | Dishes: Loved / Good / Okay / Skip. Restaurant: derived from dishes + 3 quick aspects | Low friction, more honest than 4.2 stars |
| Media | Photos + text. Video only as an embedded YouTube/Instagram link | Native video is costly, slow to post and Instagram already owns it |
| Launch geography | Hyderabad, 3 dense localities, then city-wide | Density beats coverage |
| Data | Own seeded data + community corrections; no BYT, no scraped competitor data | Legal safety and data we control |
| Language | English UI, Telugu/Hindi-ready (i18n keys from day one) | Ship fast without a rewrite later |
| Stack (phase 1) | Next.js on Vercel, Neon Postgres + Drizzle, Upstash Redis, Inngest, Cloudflare R2 | Lowest cost and ops load before traction; moves to the full stack only when triggers in section 8.6 fire |

### 1.2 Who it serves

- **Guest explorer**: lands from Google or a WhatsApp link, wants an answer in under 30 seconds (what to eat, where, how far, is it open).
- **Member foodie**: eats out weekly, rates dishes, saves places, asks and answers questions.
- **Founding contributor**: a local food creator or serious foodie seeded before launch; produces lists, battles and high-quality posts.
- **Moderator / Ops**: internal team and trusted locality moderators who keep data and content clean.

### 1.3 Signature features (what makes this different)

1. **What to order here** — every restaurant page leads with its dishes ranked by community sentiment.
2. **Dish pages across the city** — “Haleem in Hyderabad” ranks every branch that serves it.
3. **Dish Battles** — head-to-head community votes between two branches’ versions of a dish.
4. **Snap-to-post** — photo in, AI suggests the dish and the restaurant, user confirms and rates in under 15 seconds.
5. **Living facts** — every price and timing shows when it was last confirmed; one-tap “still true?” checks.
6. **Context chips** — “late night”, “under ₹300”, “rainy day”, “date night”, “family” as one-tap filters.
7. **WhatsApp-native sharing** — every dish, list, battle and post has a designed preview card.
8. **Honest by design** — disclosure tags, trust-weighted ratings, “posted on-site” marks, no pay-to-rank, ever.

### 1.4 Success metrics (closed beta, first 8 weeks)

North star: **Weekly Food Decisions** = count of distinct (user or guest device, branch) pairs per week with a strong intent action: directions click, call click, save, or an “I ate here” rating.

| Metric | Definition | Beta target |
| --- | --- | --- |
| Weekly Food Decisions | As above | Grows week over week for 6 consecutive weeks |
| Guest → member conversion | Signups ÷ guest devices with ≥2 sessions | ≥ 8% |
| Member W4 retention | Members active in week 4 after signup | ≥ 25% |
| Contribution rate | Weekly members who rate, post or comment ÷ weekly active members | ≥ 30% |
| Content density | Launch-locality branches with ≥ 3 rated dishes | ≥ 70% |
| Data accuracy | Fact reports confirmed wrong ÷ branch page views | < 0.5% |
| Search success | Searches followed by a click within 30 s | ≥ 60% |

Targets are starting hypotheses; adjust after the first two beta weeks.

### 1.5 Product principles

- **Useful with zero friends.** Guests get full value; social features add to it.
- **Answer first.** Every page shows the decision-useful information above the fold (open now, distance, price, top dishes).
- **Facts are separate from opinions.** Restaurant facts carry a source and a “last confirmed” time; opinions carry an author.
- **Trust is never for sale.** Nothing paid can change organic rank, dish scores, battles or leaderboards.
- **Fast on a cheap phone.** Every public page loads in under 2 s on a mid-range Android over 4G.
- **Decisions over doomscrolling.** We optimise for a confident food choice, not time spent.

### 1.6 Scope

| In MVP | Not in MVP (later phases) |
| --- | --- |
| Guest browsing, search, restaurant/dish/post/list/battle pages | Native iOS/Android apps |
| Google + phone-OTP signup | Native video upload |
| Dish ratings, restaurant aspect ratings | Restaurant owner accounts and replies |
| Posts (experience, question, discussion) with photos | Direct messages, stories, live |
| Threaded comments, up/down votes | Reservations, ordering, payments |
| Communities (city, locality, topic) | Paid placements or any ads |
| Saves and lists, guest saves | Follower feed and taste-match scores |
| Dish Battles and leaderboards | Creator analytics and monetisation |
| Fact confirmations and corrections | Multi-city expansion |
| Web push + email notifications | Gamified points or loyalty |
| Moderation, admin and data-ops console | Recommendation ML models |

## 2. Users, roles and permissions

Permissions depend on role plus a trust level that grows with account age and good contributions; this is the main defence against fake ratings.

### 2.1 Roles

| Role | Who | How assigned |
| --- | --- | --- |
| Guest | Anyone not signed in | Default |
| Member | Signed-up user, 18+ | Signup |
| Founding contributor | Seeded creators and foodies | Admin grants; badge shown publicly |
| Community moderator | Trusted member moderating one community | Admin grants per community |
| Ops | Internal data and content team | Admin console role |
| Admin | Founders / engineering leads | Admin console role |

### 2.2 Trust levels (members only)

| Level | Rule to reach | Rating weight | Effect |
| --- | --- | --- | --- |
| T0 New | Signup | 0.5 | Strict rate limits; posts with links held for review |
| T1 Regular | Account ≥ 3 days AND ≥ 3 approved contributions AND no upheld reports in 30 days | 1.0 | Normal limits |
| T2 Trusted | Account ≥ 30 days AND ≥ 25 approved contributions AND ≥ 80% of fact confirmations agree with consensus | 1.2 | Higher limits; reports from T2 count double |
| Founding | Admin grant | 1.2 | As T2 plus badge |

Trust level is recomputed nightly and on demand after moderation actions. Upheld reports drop the user one level for 30 days.

### 2.3 Permission matrix

| Action | Guest | T0 | T1+ / Founding | Moderator (own community) | Ops / Admin |
| --- | --- | --- | --- | --- | --- |
| Browse, search, read all public pages | Yes | Yes | Yes | Yes | Yes |
| Get directions, call, share | Yes | Yes | Yes | Yes | Yes |
| Save to device (guest saves, max 20) | Yes | — | — | — | — |
| Save to account, create lists | No | Yes | Yes | Yes | Yes |
| Rate dishes and restaurant aspects | No | Yes (weight 0.5) | Yes | Yes | Yes |
| Create post with photos | No | Yes (3/day) | Yes (20/day) | Yes | Yes |
| Comment | No | Yes (20/day) | Yes (200/day) | Yes | Yes |
| Up/down vote posts and comments | No | Yes | Yes | Yes | Yes |
| Vote in Dish Battles | No | After 24 h | Yes | Yes | Yes |
| Create Dish Battle | No | No | Founding / T2 only | Yes | Yes |
| Confirm a fact (“still true?”) | No | Yes | Yes | Yes | Yes |
| Suggest a correction | No | Yes | Yes | Yes | Yes |
| Add a missing restaurant or dish | No | No | Yes (goes to review) | Yes | Yes (direct) |
| Report content | No | Yes | Yes | Yes | Yes |
| Remove posts/comments, lock threads | No | No | No | Yes | Yes |
| Ban users, edit facts directly, merge entities | No | No | No | No | Yes |

Rate limits are enforced server-side per user and per IP (see section 7).

## 3. Information architecture

Every entity has one public, indexable URL that works without login and renders a WhatsApp preview; only creation, saved items, notifications and settings require login.

### 3.1 Navigation

- **Mobile (bottom bar, 5 items):** Discover · Search · Post (+) · Communities · You. The Post button opens the auth sheet for guests.
- **Desktop (≥ 1024 px):** top bar with logo, a global search field, Communities, Battles, Post button, avatar menu. Content max width 1200 px; restaurant and dish pages use a two-column layout (main + sticky facts card).
- **City switcher:** in the header; MVP has only Hyderabad but the URL and data model carry the city.

### 3.2 Public routes (SSR/ISR, indexable)

| Route | Page | Revalidate |
| --- | --- | --- |
| `/` | Redirect to `/hyderabad` (or last city) | — |
| `/hyderabad` | City Discover home | 5 min |
| `/hyderabad/search?q=&...` | Search results (noindex for filtered pages) | Dynamic |
| `/hyderabad/area/{locality-slug}` | Locality page: top dishes, restaurants, community | 15 min |
| `/hyderabad/dish/{canonical-dish-slug}` | City dish page: “Best haleem in Hyderabad” ranking | 15 min |
| `/hyderabad/cuisine/{cuisine-slug}` | Cuisine landing | 1 h |
| `/r/{branch-slug}` | Restaurant branch page | 10 min + on-demand |
| `/r/{branch-slug}/dish/{branch-dish-slug}` | Dish at this branch | 10 min + on-demand |
| `/p/{post-id}/{title-slug}` | Post with comments | 2 min + on-demand |
| `/c/{community-slug}` | Community feed (Hot / New / Top) | 2 min |
| `/battles` and `/battles/{battle-id}/{slug}` | Battle list and battle page | 1 min |
| `/hyderabad/top/{canonical-dish-slug}` | Leaderboard (top 10) | 15 min |
| `/lists/{list-id}/{slug}` | Public list (shareable) | 10 min |
| `/u/{username}` | Public profile: posts, lists, ratings count, badges | 10 min |
| `/about`, `/guidelines`, `/privacy`, `/terms`, `/grievance` | Static pages | Build |

Branch slug format: `{brand-slug}-{locality-slug}` (e.g. `pista-house-shalibanda`); collisions get `-2`. Slugs never change once published; renames create a 301 from the old slug.

### 3.3 Authenticated routes (noindex)

| Route | Page |
| --- | --- |
| `/login` | Sheet/page: Google One Tap, phone OTP |
| `/onboarding` | Name/username, 18+ confirmation, diet type, up to 5 favourite cuisines, home locality |
| `/post/new` | Create post (type picker → flow) |
| `/rate/{branch-slug}` | Quick rating flow (also reachable from branch page) |
| `/saved` | Saved dishes/restaurants and lists |
| `/notifications` | In-app notification centre |
| `/settings` | Profile, notifications, privacy, data download, delete account |

### 3.4 Admin (`/admin` route group in the same app, staff role required)

Entities (branches, brands, dishes, canonical dishes), Review queues (new entities, corrections, dish matches, reports), Users, Communities, Battles, Audit log, Seeding tools. Detailed in section 13.

### 3.5 Page blueprints (top to bottom)

**Discover (`/hyderabad`)**: search bar → context chips (Open now, Under ₹300, Late night, Veg, Biryani, Breakfast, Date night, Family) → “Trending dishes near you” (horizontal cards) → “Live Dish Battle” → “Top dishes by category” (Biryani, Haleem, Mandi, Irani chai, Tiffins, Desserts) → “Fresh from the community” (posts) → “Explore areas” → footer.

**Restaurant branch (`/r/...`)**: photo strip → name, locality, distance, open/closed with next change time, price band, cuisines, veg badge → action row (Directions, Call, Save, Share, Rate) → **What to order here** (top 5 dishes with loved %, price, last-seen date) → overall summary (food score, value/service/ambience) → living facts card (hours, price range, address, “last confirmed” + “Still true?”) → posts about this place (tabs: Top / New / Questions) → more dishes (full list) → nearby alternatives → “Report a problem”.

**Branch dish (`/r/.../dish/...`)**: hero photo → name, price, diet, loved % and count → rating breakdown (Loved/Good/Okay/Skip bars) → photos grid → posts mentioning it → same dish at other branches (ranked) → Rate this dish.

**City dish (`/hyderabad/dish/haleem`)**: intro line → filters (area, price, open now, distance) → ranked list of branch dishes → battle CTA → community questions about this dish.

**Post**: author + badges + disclosure tag → attached restaurant/dish cards → title, body, photos/embeds → dish ratings inside the post → vote bar, share → threaded comments (Best / New).

## 4. Core workflows

The product runs on one loop: a guest finds a dish, acts on it (directions, call, save), eats, and comes back to rate it, which improves the ranking for the next guest.

&#91;embedded content: Core loop · 5 steps\]

The post-visit nudge (W11) is what closes the loop; without it, most people who act on a recommendation never come back to rate.

### W1. Guest discovery (no account)

1. Guest arrives from Google, a shared WhatsApp link, or directly.
2. If location permission was never asked, show a soft banner “Show food near you?” (never a browser prompt on first paint). If declined, use the locality picker or city centre.
3. Guest searches (“haleem”) or taps a chip (“Open now”, “Under ₹300”).
4. Results show dishes first, then restaurants, each with distance, open status, price and loved %.
5. Guest opens a branch page and reads **What to order here**, facts and posts.
6. Guest taps Directions (opens Google Maps directions URL in a new tab), Call (`tel:`), or Share.
7. Each action fires an analytics event and counts toward Weekly Food Decisions.

### W2. Guest → member conversion

1. Guest taps Save: item is stored on the device (max 20) and a toast says “Saved on this phone. Sign in to keep it everywhere.”
2. Guest taps Rate, Post, Comment, Vote or a 21st save: the sign-in sheet opens with the reason (“Sign in to rate this dish”).
3. Sign-in options: Google One Tap, or phone number → 6-digit OTP (expires 5 min, max 5 attempts).
4. First sign-in runs onboarding (one screen): display name, username (suggested), “I am 18 or older” checkbox (required), diet type (Veg / Non-veg / Egg / Jain), up to 5 cuisines, home locality. Under 18 → account not created, explained politely.
5. Device saves are migrated into the account; the original action resumes (the rating sheet opens on the same dish).

### W3. Quick rate (most common contribution, target under 20 seconds)

1. Member taps **Rate** on a branch or dish page, or “I ate here” on a list item.
2. Sheet shows the branch’s top 12 dishes as chips plus “+ add a dish” (typeahead over this branch’s dishes; new dish names go to review).
3. Member taps the dishes they ate; each selected dish shows four buttons: Loved / Good / Okay / Skip.
4. Optional: three aspects (Value, Service, Ambience: Good / Okay / Poor) and “Would you return?” (Yes / No).
5. Optional: “Add photos and a few words” turns this into an experience post (W4) with ratings pre-attached.
6. Submit → ratings saved, dish scores update asynchronously (< 1 min), and a thank-you card offers Share.
7. Re-rating the same dish replaces the previous rating (history kept).

### W4. Snap-to-post (experience post)

1. Member taps + → “Share what you ate”. Picks up to 10 photos (camera or gallery).
2. Client compresses images (long edge 2048 px, WebP/JPEG \~85%) and uploads directly to storage via presigned URLs; upload progress shown per photo.
3. In parallel the client asks the server for suggestions: if browser location was granted, the nearest 5 branches within 300 m; plus an AI dish suggestion from the first photo (top 3 canonical dishes with confidence).
4. Member confirms the restaurant (or searches) and confirms/edits dishes; each dish gets a rating.
5. Optional title (auto-generated if empty: “Mutton Haleem at Pista House”), text up to 5,000 chars, YouTube or Instagram link, disclosure (None / Hosted / Paid partnership / I work here).
6. Post is published to the branch page, dish pages, the locality community and the city community. T0 posts with external links go to the review queue first.
7. If the user was within 150 m of the branch when posting, the post shows a small “posted on-site” mark (location used once, not stored as coordinates).

### W5. Ask the locals (question post)

1. Member creates a Question in a community (default: their locality), optionally attaching a dish, restaurant or area.
2. Answers are comments; commenters can attach restaurant/dish cards using an inline “@place” picker.
3. Asker can mark one answer as **Accepted**; accepted answers pin to the top and give the answerer a reputation event.
4. Questions with no answer after 2 hours are boosted in the locality feed and pushed to T1+ members who opted into “help others” notifications for that locality.

### W6. Discussion, comments and votes

1. Any member creates a Discussion post in a community (title required, body, photos optional, entity attachments optional).
2. Members up/down vote posts and comments; one vote per user per item; changing a vote updates the score.
3. Comments are threaded to depth 6 (deeper replies attach to depth 6 with “replying to @user”).
4. Sorting: posts Hot / New / Top (day, week, month, all); comments Best / New.

### W7. Dish Battle

1. Ops, a moderator, or a Founding/T2 member creates a battle: one canonical dish, two branch dishes, duration 3–7 days.
2. Battle page shows both dishes side by side with photos, price, loved % and distance; members vote once (changeable until close) and can comment.
3. Voting requires account age ≥ 24 h; vote shares are hidden until the member votes (avoids herding), always visible to guests after close.
4. On close: result card generated (shareable image), result posted in the city community; battle stays as an archive page.

### W8. Living facts: confirm and correct

1. Facts card shows each fact with “confirmed N days ago”. Facts older than their freshness window (hours 60 days, prices 90 days) show a subtle “Help confirm” prompt.
2. Member taps “Still true?” → Yes / No. “No” asks for the new value (e.g. new price, new closing time, “permanently closed”).
3. Server applies the consensus rule (section 6.6); when reached, the fact updates automatically and an audit record is written. Otherwise a correction goes to the Ops queue.
4. Contributors whose confirmations later match consensus gain trust.

### W9. Lists and sharing

1. Member creates a list (“Top 10 biryanis in Hyderabad”), adds branches or branch dishes with an optional note and rank.
2. List is public by default (private option). Public list URL renders a designed preview image for WhatsApp/Instagram.
3. Recipients view the list and map without login; “Save this list” prompts sign-in.

### W10. Report and moderation

1. Anyone signed in can report a post, comment, user, photo or fact with a reason (Spam / Fake or paid without disclosure / Offensive / Wrong place or dish / Privacy / Other + note).
2. Report goes to the moderation queue; auto-hide rules apply (section 7).
3. Moderator or Ops acts: dismiss, remove, edit attachment, warn, suspend, ban; every action writes an audit record and notifies the author with the reason.
4. Author can appeal once per action; appeals go to Ops (not the same moderator).

### W11. Post-visit nudge

1. Signed-in member taps Directions or Call on a branch.
2. Next day at 12:30 local time (or 19:30 if the tap was in the morning), a web push or in-app notification asks “Did you make it to Pista House? Rate what you had.” Maximum one nudge per day per user; opt-out in settings.
3. Tapping opens W3 pre-filled with that branch.

## 5. Epics and user stories

The MVP is 16 epics and 74 stories (plus the admin epic in section 13); P0 stories block launch, P1 stories ship in the MVP if the schedule holds and otherwise move to the first post-launch sprint.

### E1. Accounts and auth

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E1-1 | As a guest I can sign in with Google | Google Identity Services One Tap + button; new user goes to onboarding; returning user returns to the page they were on | P0 |
| E1-2 | As a guest I can sign in with my phone number | +91 numbers only in MVP; 6-digit OTP; 5-min expiry; max 5 verify attempts per OTP, 3 sends per number per 15 min, 10 per IP per hour; resend after 30 s | P0 |
| E1-3 | As a new member I complete onboarding in one screen | Fields: display name, username (3–20, a–z 0–9 \_, unique, suggested), 18+ checkbox required, diet type, ≤ 5 cuisines, home locality; under-18 blocks account creation | P0 |
| E1-4 | As a member my guest saves move into my account | Device saves (≤ 20) are imported on first login, de-duplicated, then cleared from the device | P0 |
| E1-5 | As a member I stay signed in safely | Better Auth database session, 30-day sliding expiry, HttpOnly Secure SameSite=Lax cookie; active sessions listed and revocable in settings; all sessions revoked on ban or account deletion | P0 |
| E1-6 | As a member I can edit my profile | Avatar upload, display name, bio (160 chars), diet type, cuisines, home locality; username change once per 30 days with 301 from old profile URL | P1 |
| E1-7 | As a member I can download or delete my data | Settings → “Download my data” emails a JSON export link within 24 h; “Delete account” soft-deletes immediately, anonymises posts/comments to “deleted user”, hard-deletes personal data after 30 days | P0 |

### E2. Restaurant and branch pages

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E2-1 | As a guest I see everything I need to decide at the top of a branch page | Above the fold on a 390×844 screen: name, locality, distance (if location), open/closed + next change time, price band, cuisines, diet badge, action row | P0 |
| E2-2 | As a guest I see “What to order here” | Top 5 branch dishes by score with ≥ 2 ratings; each shows photo, name, loved %, rating count, price + “seen N days ago”; empty state invites the first rating | P0 |
| E2-3 | As a guest I can get directions, call or share | Directions opens `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`; Call uses `tel:`; Share uses the Web Share API with copy-link fallback | P0 |
| E2-4 | As a guest I see trustworthy facts | Hours per day, address, phone, price range, payment modes, veg-only flag, each with “confirmed N days ago” | P0 |
| E2-5 | As a guest I see posts about this place | Tabs Top / New / Questions; 10 per page; infinite scroll on client | P0 |
| E2-6 | As a guest I see the full dish list | Grouped by category; shows price and score; unrated dishes listed last | P0 |
| E2-7 | As a guest I see nearby alternatives | 6 branches within 2 km sharing a top cuisine, ranked by food score | P1 |
| E2-8 | As a guest I see the restaurant on a map | Static map image on the page (MapLibre on click to expand) | P1 |

### E3. Dish catalogue and dish pages

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E3-1 | As a guest I can view a dish at a branch | Branch dish page per section 3.5; rating distribution bars; photos grid | P0 |
| E3-2 | As a guest I can see the best version of a dish across the city | City dish page lists every branch dish linked to the canonical dish, ranked by score, filterable by area, price, open now | P0 |
| E3-3 | As a guest I see leaderboards | `/hyderabad/top/{dish}` shows top 10 with minimum 5 ratings each; updated hourly | P0 |
| E3-4 | As a member I can add a missing dish to a branch | Name, price (optional), diet type, photo optional; goes to review queue (T1+); auto-suggest canonical match | P1 |
| E3-5 | As Ops I can manage canonical dishes and aliases | CRUD canonical dishes, aliases, categories, diet defaults; merge two canonical dishes with relinking | P0 |

### E4. Search and discovery

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E4-1 | As a guest I can search dishes, restaurants, areas and cuisines | Typeahead after 2 chars, results in < 150 ms p95 server time; typo tolerant (“biriyani” → biryani); grouped results | P0 |
| E4-2 | As a guest I can filter results | Open now, distance (1/3/5/10 km), price band, diet (veg/egg/non-veg), cuisine, area | P0 |
| E4-3 | As a guest I can use context chips | Chips map to saved filter sets + tag matching (late night = open after 23:00; under ₹300 = dish price ≤ 300) | P0 |
| E4-4 | As a guest I see a useful Discover home | Sections per section 3.5; never empty: each section falls back to city-wide results | P0 |
| E4-5 | As a member my diet type is respected | Veg members see only veg dishes by default with a visible toggle; Jain/egg likewise | P0 |
| E4-6 | As a guest I can browse an area | Locality page with top dishes, top restaurants, latest posts and the area community | P1 |
| E4-7 | As a guest I see a “no results” helper | Suggests spelling fixes, nearby areas, and “Ask the locals” prefilled with the query | P0 |

### E5. Posts

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E5-1 | As a member I can post an experience with photos | Flow W4; 1–10 photos; ≥ 1 branch; ≥ 1 dish rating; text optional | P0 |
| E5-2 | As a member I get AI help tagging dish and place | Nearby branch suggestions (if location) and top-3 dish suggestions from the first photo within 4 s p95; user must confirm; never auto-publishes | P0 |
| E5-3 | As a member I can ask a question | Title required (10–150 chars), body optional, community required, entities optional | P0 |
| E5-4 | As a member I can start a discussion | Title required, body up to 10,000 chars, photos optional | P0 |
| E5-5 | As a member I can attach a YouTube or Instagram link | URL validated against allowlist; YouTube shown as lite embed (click to load iframe); Instagram as oEmbed if available else link card | P1 |
| E5-6 | As a member I can declare a disclosure | None / Hosted (free meal) / Paid partnership / I work here; non-None shows a visible tag on the post and on its ratings | P0 |
| E5-7 | As a member I can edit or delete my post | Edit within 24 h shows “edited”; ratings editable anytime; delete removes post, keeps ratings unless “delete ratings too” | P0 |
| E5-8 | As a member I can mention places in text | Typing @ opens a branch/dish picker; renders as a card link | P1 |

### E6. Ratings

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E6-1 | As a member I can rate dishes | Flow W3; one active rating per (user, branch dish); re-rate replaces, history kept | P0 |
| E6-2 | As a member I can rate restaurant aspects | Value, Service, Ambience (Good / Okay / Poor) + would return; one active set per (user, branch) | P0 |
| E6-3 | As a guest I trust the scores | Score shown only with ≥ 3 weighted ratings, else “New: N ratings”; each score has an info tooltip explaining how it is calculated | P0 |
| E6-4 | As the system I keep scores fresh | Score recompute job runs within 60 s of a rating; nightly full recompute | P0 |

### E7. Comments and votes

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E7-1 | As a member I can comment and reply | Markdown-lite (bold, italic, links, line breaks); 1–5,000 chars; depth ≤ 6; edit within 15 min without “edited” tag, later with tag | P0 |
| E7-2 | As a member I can up/down vote posts and comments | Optimistic UI; one vote per item; author cannot vote on own content | P0 |
| E7-3 | As a reader I can sort | Posts: Hot/New/Top(window); comments: Best/New; defaults Hot and Best | P0 |
| E7-4 | As an asker I can accept an answer | Only on Question posts; one accepted comment; pinned with badge | P1 |

### E8. Communities

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E8-1 | As a guest I can browse communities | Seeded: Hyderabad Food (city), one per launch locality, topics: Biryani, Haleem & Ramzan, Cafes, Street Food, Budget Eats, Desserts, Veg Hyderabad | P0 |
| E8-2 | As a member I can join communities | Join/leave; joined communities appear first on Communities tab and feed “From your communities” | P0 |
| E8-3 | As a moderator I can pin and manage | Pin ≤ 2 posts, remove, lock comments, edit community rules and description | P0 |
| E8-4 | As a member I can request a new community | Request form → Ops approval; members cannot create communities directly in MVP | P1 |

### E9. Saves and lists

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E9-1 | As a guest I can save on my device | ≤ 20 saves in local storage; Saved indicator persists | P0 |
| E9-2 | As a member I can save branches and dishes | Default lists “Want to try” and “Been there”; one tap to save; long-press/secondary to choose list | P0 |
| E9-3 | As a member I can create custom lists | Title, description, public/private, ordered items with notes; ≤ 100 items | P0 |
| E9-4 | As anyone I can view a public list with a map | List page shows ranked items and a map with numbered pins | P1 |

### E10. Dish Battles and leaderboards

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E10-1 | As Founding/T2/Ops I can create a battle | Same canonical dish, two different branches, 3–7 days; Ops approval for non-staff creators | P0 |
| E10-2 | As a member I can vote in a battle | Account ≥ 24 h; one vote per battle, changeable until close; vote share hidden until I vote | P0 |
| E10-3 | As anyone I can share a battle | Dynamic preview image with both dish photos, names and (after close) result | P0 |
| E10-4 | As anyone I see battle results archived | Closed battles list with results; result posted to city community automatically | P1 |

### E11. Living facts and corrections

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E11-1 | As a member I can confirm a fact | “Still true?” Yes/No on hours, price, phone, closed status; one response per user per fact per 30 days | P0 |
| E11-2 | As a member I can propose a new value | Structured inputs per field type; free text only for “Other” | P0 |
| E11-3 | As the system I auto-apply consensus | Rules in section 6.6; every change writes provenance and audit | P0 |
| E11-4 | As Ops I can review corrections | Queue with old vs new value, confirmers, trust levels; approve/reject/edit | P0 |

### E12. Sharing and SEO

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E12-1 | As a sharer my link looks great on WhatsApp | Every public page has og:title, og:description, og:image 1200×630 generated per entity, cached on CDN | P0 |
| E12-2 | As the business we get found on Google | SSR HTML, JSON-LD (Restaurant, BreadcrumbList, DiscussionForumPosting), sitemaps, canonical URLs | P0 |
| E12-3 | As a sharer I can share a result card | Battle results, leaderboards and lists have a downloadable 1080×1350 image for Instagram | P1 |

### E13. Notifications

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E13-1 | As a member I see in-app notifications | Replies, answer accepted, upvote milestones (1, 10, 50, 100), battle results, moderation outcomes | P0 |
| E13-2 | As a member I can enable web push | Prompt only after a meaningful action (first post or first save), never on first visit | P0 |
| E13-3 | As a member I get the post-visit nudge | Flow W11; max 1/day; opt-out | P0 |
| E13-4 | As a member I can get a weekly email digest | Opt-in; top posts and new battles in my communities | P1 |

### E14. Moderation and safety

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E14-1 | As a member I can report | Reasons per W10; one open report per user per item | P0 |
| E14-2 | As the system I pre-screen content | Text and images scanned before publish; flagged items held for review (section 7) | P0 |
| E14-3 | As a moderator I can act from a queue | Queue sorted by severity then age; actions: dismiss, remove, warn, suspend 1/7/30 days, ban; reason required | P0 |
| E14-4 | As a member I can block another member | Their content is hidden from me; they cannot reply to me | P0 |
| E14-5 | As an author I can appeal | One appeal per action; reviewed by Ops | P1 |
| E14-6 | As the company we meet grievance rules | Public grievance page with officer name and email; tickets acknowledged ≤ 24 h, resolved ≤ 15 days | P0 |

### E15. Admin and data ops

Detailed in section 13. All stories P0 except bulk CSV export (P1).

### E16. Analytics

| ID | Story | Acceptance criteria | Pri |
| --- | --- | --- | --- |
| E16-1 | As the team we track every event in section 14.1 | Client + server events with shared schema; guest device id + user id stitched on login | P0 |
| E16-2 | As the team we have a launch dashboard | North star, funnel, retention cohorts, contribution rate, content density by locality | P0 |

## 6. Scoring, ranking and feeds

All ranking in the MVP is deterministic, explainable SQL plus small worker jobs; no ML models until real behaviour data exists. Every constant below lives in a `ranking_config` table so it can be tuned without a deploy.

### 6.1 Dish score (per branch dish)

Sentiment values: Loved = 1.0, Good = 0.7, Okay = 0.4, Skip = 0.0. Each rating carries a weight = trust weight × time weight × disclosure weight.

- Trust weight: T0 0.5, T1 1.0, T2/Founding 1.2.
- Time weight: half-life of 270 days.
- Disclosure weight: None 1.0; Hosted, Paid partnership or I work here = 0 (shown on the post, never counted in scores).

```latex
w_i = \text{trust}_i \cdot 0.5^{\text{age\_days}_i / 270} \cdot \text{disclosure}_i
```

Bayesian score, shrunk toward the prior m (mean score of that canonical dish across the city, or 0.65 if fewer than 20 ratings exist) with prior strength C = 5:

```latex
\text{score} = \frac{C \cdot m + \sum_i w_i v_i}{C + \sum_i w_i}
```

Displayed numbers:

- **Loved %** = Σw of Loved ÷ Σw of all, shown only when Σw ≥ 3; otherwise “New · N ratings”.
- **Count** = raw number of ratings (unweighted), so users see real volume.
- Stored on `branch_dishes`: `score`, `loved_pct`, `rating_count`, `weight_sum`, `scored_at`.

### 6.2 Restaurant (branch) scores

- **Food score** = weighted mean of the branch’s top 5 dish scores, weighted by each dish’s weight\_sum (so a dish with 40 ratings counts more than one with 3). Requires ≥ 2 scored dishes.
- **Aspects**: Good = 1, Okay = 0.5, Poor = 0; same weights and Bayesian shrink (C = 5, m = city mean per aspect). Shown as a 3-word label: Great (≥ 0.8), Good (≥ 0.6), Mixed (≥ 0.4), Poor.
- **Would return %**: weighted share of Yes, shown with ≥ 5 responses.
- No single “overall star rating” is shown. Food score drives restaurant ranking.

### 6.3 What to order here

Candidates: active branch dishes with Σw ≥ 2. Order by score desc, then rating\_count desc. Top 5 shown. If fewer than 3 qualify, fill with the branch’s ops-tagged “signature” dishes marked “Known for” (no score).

### 6.4 Post and comment ranking

Post **Hot** (Reddit-style, recomputed on each vote and every 15 min by a job for decay):

```latex
\text{hot} = \text{sign}(s) \cdot \log_{10}(\max(|s|, 1)) + \frac{t_{\text{created}} - 1735689600}{45000}
```

where s = upvotes − downvotes, t in Unix seconds. Experience posts with ≥ 3 photos get +0.3 (quality nudge). Posts from T0 with score ≤ 0 are excluded from Hot in city-level feeds.

**Top**: score desc within window (24 h, 7 d, 30 d, all). **New**: created desc.

Comment **Best** = Wilson lower bound at 95% on up vs total votes, tie-break newer first:

```latex
\text{best} = \frac{\hat p + \frac{z^2}{2n} - z\sqrt{\frac{\hat p(1-\hat p)}{n} + \frac{z^2}{4n^2}}}{1 + \frac{z^2}{n}}, \quad z = 1.96
```

Accepted answer always first, then pinned moderator comments.

### 6.5 Discover and search ranking

Card score for “Trending dishes near you” and dish search results:

```latex
R = 0.35\,Q + 0.20\,D + 0.15\,P + 0.15\,F + 0.15\,M
```

- Q = dish score (0–1).
- D = distance score = exp(−km / 3); 0.5 when the user’s location is unknown.
- P = popularity = min(1, log10(1 + saves₇ + 2·ratings₇ + directions₇) / 2), using 7-day counts.
- F = freshness = 0.5^(days since last rating / 30).
- M = preference match = 1 if the dish cuisine is in the member’s cuisines, 0.5 for guests, 0 otherwise.

Hard filters before scoring: diet type, open now (when the chip is on), distance radius, price band. Search adds text relevance: final = 0.6 × text rank (normalised 0–1) + 0.4 × R.

**Discover sections** (each is one query, cached 5 min per locality):

| Section | Query |
| --- | --- |
| Trending near you | R with popularity weight raised to 0.35 (Q 0.25), radius 5 km, top 12, max 2 per branch |
| Top by category | Per category: canonical dishes in category, best branch dish each, by score, min Σw 3 |
| Live Dish Battle | Active battle with most votes in last 24 h |
| Fresh from the community | Posts by Hot, city scope, last 72 h, max 2 per author |
| Explore areas | Launch localities by recent activity |

Fallback rule: if a section returns fewer than 4 items in the user’s radius, widen to city scope and label it “Across Hyderabad”.

### 6.6 Living-facts consensus

For a fact (e.g. Monday closing time):

- **Confirm**: a “Yes” from any member updates `verified_at` to now if the confirmer is T1+, or if two T0 confirmations arrive within 7 days.
- **Change**: the new value is applied automatically when proposals for the same value reach a trust-weighted sum ≥ 2.0 within 14 days and exceed opposing “Yes” confirmations in the same window. Otherwise the proposal goes to the Ops queue after 14 days or immediately if any proposer is T2.
- **Permanently closed**: never auto-applied; always Ops-reviewed (high impact).
- **Freshness windows**: hours 60 days, price 90 days, phone 180 days, address 365 days. Past the window, the UI shows the date in a muted warning style and the “Help confirm” prompt.

### 6.7 Battles

One vote per member per battle. Result = vote share. Battles do not change dish scores or leaderboards (they are engagement, not measurement). Votes from accounts flagged by the anti-abuse rules are dropped before the result is computed, and the dropped count is logged.

### 6.8 Leaderboards

Top 10 branch dishes per canonical dish by score, minimum Σw ≥ 5 and at least one rating in the last 120 days. Recomputed hourly; a snapshot is stored weekly for “last week’s rank” arrows.

## 7. Trust, moderation and anti-abuse

Trust is the product, so abuse controls ship in the MVP: pre-screening before publish, trust-weighted ratings, rate limits, review-bombing detection and a moderation queue with an audit trail.

### 7.1 Rate limits

Enforced with Upstash Redis and @upstash/ratelimit (sliding window) per user and per IP; exceeding a limit returns HTTP 429 with `retry_after`.

| Action | T0 | T1 | T2 / Founding | Per IP |
| --- | --- | --- | --- | --- |
| Posts | 3 / day | 20 / day | 40 / day | 30 / day |
| Comments | 20 / day | 200 / day | 400 / day | 300 / day |
| Dish ratings | 30 / day | 100 / day | 200 / day | 200 / day |
| Votes | 200 / day | 1,000 / day | 2,000 / day | 3,000 / day |
| Reports | 10 / day | 30 / day | 60 / day | 60 / day |
| Fact confirmations | 30 / day | 100 / day | 200 / day | 200 / day |
| Photo uploads | 30 / day | 150 / day | 300 / day | 300 / day |
| OTP sends | — | — | — | 10 / hour; 3 per number per 15 min |

### 7.2 Pre-publish screening

Every post, comment and photo passes a screening job before it is visible (synchronous for text, ≤ 3 s; photos are visible after their screen finishes, typically < 10 s).

- **Text**: an LLM moderation call (a small, fast model) classifies spam, harassment, hate, sexual content, personal data (phone numbers, addresses of private people), and undisclosed promotion. Returns allow / hold / block with categories.
- **Images**: a vision safety classifier (e.g. Google Cloud Vision SafeSearch or an LLM vision call) for adult, violence, and “not food or restaurant related”; plus perceptual hash (pHash) against previously removed images.
- **Links**: allowlist for embeds (youtube.com, youtu.be, instagram.com); other links allowed only for T1+; T0 posts with links → hold.
- **Hold** → review queue; the author sees “Pending review”. **Block** → rejected with a reason and a link to the guidelines.

### 7.3 Review-bombing and fake-rating detection

A nightly job and a near-real-time trigger (on each rating) look for these signals; any hit sets `ratings.suspect = true` (weight 0 until reviewed) and opens a case.

| Signal | Rule |
| --- | --- |
| Burst | A branch receives > 4× its 30-day daily average ratings in 24 h AND ≥ 10 ratings |
| New-account cluster | ≥ 5 ratings on one branch within 48 h from accounts < 7 days old |
| Shared device/network | ≥ 3 accounts rating the same branch from the same device fingerprint hash or /24 IPv4 within 7 days |
| One-note account | Account whose first 5 ratings are all Loved or all Skip for one brand |
| Self-promotion | User declared “I work here” on a brand and rates that brand’s branches positively without disclosure |

Device fingerprint = hash of a first-party device id cookie + user agent family; never third-party fingerprinting.

### 7.4 Reports and auto-hide

- Any item with reports from ≥ 3 distinct T1+ users (T2 counts as 2) within 24 h is auto-hidden pending review.
- Severity order in queue: illegal content / personal data > harassment / hate > fake or undisclosed promotion > spam > wrong entity > other.
- Moderation SLA targets: high severity 4 h, others 24 h (7 am to 11 pm IST staffing).

### 7.5 Moderation actions

| Action | Effect | Who |
| --- | --- | --- |
| Dismiss report | Item stays; reporter notified | Moderator, Ops |
| Remove content | Hidden publicly, author sees reason | Moderator (own community), Ops |
| Fix attachment | Re-link a post to the right branch/dish | Moderator, Ops |
| Lock thread | No new comments | Moderator, Ops |
| Warn | Notification to user; counts toward strikes | Moderator, Ops |
| Suspend 1 / 7 / 30 days | No contributions; reading allowed | Ops |
| Ban | Account disabled; ratings weighted 0 | Admin |
| Purge ratings | Remove a user’s ratings from scores | Admin |

Three strikes in 90 days → automatic 7-day suspension. Every action writes `moderation_actions` + `audit_log` (actor, target, before/after, reason, timestamp).

### 7.6 Disclosure and conflicts

- Disclosure is per post; non-None disclosures show a tag on the post and on every rating attached to it, and those ratings weigh 0 in scores.
- Members can declare “I work at / own” a brand in settings; their ratings for that brand weigh 0 automatically.
- Undisclosed promotion found by moderators → content removed + strike; repeated → ban.

### 7.7 Public guidelines (must exist before launch)

Community guidelines, how scores work, disclosure rules, what we remove, how to appeal, and the grievance officer contact. Linked from the footer, post composer, and every moderation notice.

## 8. System architecture and stack

Phase 1 runs on managed services with free or entry-level tiers: one Next.js app on Vercel holds the public site, the API and the admin console, with Neon Postgres (through Drizzle), Upstash Redis, Inngest for background jobs and Cloudflare R2 for photos. The schema, API contract.
You needed to first analyze the project understand the project , First things you needed to write is the document, product docs , docs about the product flow. Write the AGENT.md , CLUADE.md the files should mention everything about the project files, decide the folder file project architecture, workflow , the techs we use, mention everything. write the perfect docs. 
Completly plan the project, how a senior engineer would be doing this. 
