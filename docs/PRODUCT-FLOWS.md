# Product flows

Condensed W1–W11 from `docs/spec/MVP-SPEC.md` §4, mapped to routes, components (feature in brackets), server entry points and jobs. Core loop: find a dish → act (directions, call, save) → eat → rate → better ranking for the next guest. Deviations: see `docs/ARCHITECTURE.md` §Decisions (D1 email OTP, D4/D5 no LLM).

Legend — **A** server action (`features/x/server/actions.ts`), **R** route handler, **J** Inngest job, **Q** cached query.

## W1 Guest discovery

1. Arrive from Google / WhatsApp / direct → `/` redirects to `/hyderabad` (or last city cookie).
2. Soft "Show food near you?" banner (never a browser prompt on first paint); declined → locality picker or city centre.
3. Search or tap a context chip → results: dishes first, then restaurants, each with distance, open status, price, loved %.
4. Open branch page → What to order here, facts, posts → Directions (Google Maps dir URL, new tab), Call (`tel:`), Share (Web Share, copy fallback).
5. Each action emits an analytics event (counts toward Weekly Food Decisions).

| Step | Route | Components | Server |
| --- | --- | --- | --- |
| Home | `/hyderabad` | `DiscoverIntro` (`CommandBar` with typeahead + `ContextChips` toggles), `Trending` + `LocationBanner`, `Shelf`, `AreaBoard` [discover, search, geo] | Q `getCityShelves`, Q `getTrendingCandidates` (D40) |
| Typeahead | any `CommandBar` | ARIA combobox in `CommandBar`, `useSuggestions` [search] | R `GET /api/search/suggest?city=&q=` → Q `getSuggestions` |
| Results | `/hyderabad/search?q=&chip=&area=&cuisine=&diet=&price=&km=` | `SearchSection` (server), `SearchBoard` (chips, filters, ranking in place), `BranchCard`, `NoResults` [search] | Q `getSearchResults(city, text)`; typed phrases → chips/area (D36) |
| Branch | `/r/[branch]` | `BranchHeader`, `ActionRow` (Directions, Call, Share, Save), `FactsCard`, posts tabs [places, facts, posts] | Q `getBranch(slug)` |
| Actions | — | `TrackedAnchor`, `ShareButton`, `SaveButton` | R `POST /api/events` (`directions_click`, `call_click`, `share`, `save`) |

## W2 Guest → member

1. Save as guest → stored on device (≤ 20) + toast "Saved on this phone. Sign in to keep it everywhere."
2. Rate / Post / Comment / Vote / Answer / Confirm fact / 21st save → sign-in prompt stating the reason (DESIGN-SYSTEM §7.11, §9.1). Today this is the toast from `useSignInPrompt` [shell] (`IntentButton` for one-tap actions); its Sign in link carries `?next=<path>`. P3 swaps the toast action for `AuthSheet`.
3. Sign up / sign in with **email + password**; new accounts verify their email via a Resend link (30-min expiry). A disabled "Continue with Google" button is shown until Google sign-in ships (D1).
4. First sign-in → `/onboarding`: display name, username (suggested), 18+ checkbox (required; under 18 → no account), diet, ≤ 5 cuisines, home locality.
5. Device saves migrated and cleared; original action resumes (`?intent=` param restores the sheet).

| Step | Route | Components | Server |
| --- | --- | --- | --- |
| Guest save | branch, branch dish; list at `/saved` | `SaveButton`, `SavedList` [saves] | `localStorage` `fdn:saves` (≤ 20, D39) |
| Member save | same buttons; lists at `/saved` | `SaveButton`, `MemberSync`, `SavedContent`, `RemoveSaveButton` [saves] | A `toggleSaveAction`, A `importDeviceSavesAction`, A `listSavedKeysAction` (D42) |
| Intent prompt | any | `useSignInPrompt`, `IntentButton` [shell], `ToastProvider` [shared/ui] | — |
| Sign in / up | `/login`, `/login/create`, `/login/forgot`, `/login/reset` | `AuthCard`, `SignInForm`, `SignUpForm`, `ForgotForm`, `ResetForm`, `GoogleButton` (disabled) [auth] | R `/api/auth/*` (Better Auth email + password; verification and reset via Resend, D41) |
| Onboarding | `/onboarding?next=` (every sign-in and verification link passes through; forwards when done) | `OnboardingPage`, `OnboardingForm` [profile] | A `completeOnboardingAction`, A `declineUnderageAction`; Q `getViewer`, `getUsernameSuggestion` |

## W3 Quick rate (< 20 s)

1. Tap Rate (branch/dish page) or "I ate here" (list item).
2. Sheet: top 12 dishes as chips + "add a dish" typeahead (new names → review).
3. Each selected dish → Loved / Good / Okay / Skip.
4. Optional aspects (Value, Service, Ambience: Good/Okay/Poor) + Would return.
5. Optional "Add photos and a few words" → W4 with ratings attached.
6. Submit → saved; scores update < 1 min; thank-you card with Share. Re-rate replaces, history kept.

| Route | Components | Server |
| --- | --- | --- |
| `/rate/[branch]` (also sheet on `/r/[branch]`) | `RatingPicker`, `Chip`, `PlacePicker` [ratings, dishes] | A `submitRatingsAction` → J `ratings/recompute-dish`, J `moderation/review-bomb-scan`; A `proposeDishAction` (T1+) |

## W4 Snap-to-post (experience)

1. + → "Share what you ate"; pick ≤ 10 photos.
2. Client compresses (long edge 2048 px, WebP/JPEG ~85 %) and uploads via presigned PUT with per-photo progress.
3. Parallel: nearest 5 branches within 300 m (if location granted). No photo-based dish suggestion in MVP (D5).
4. Confirm restaurant, pick dishes, rate each.
5. Optional title (auto "Mutton Haleem at Pista House"), text ≤ 5,000, YouTube/Instagram link, disclosure.
6. Screen (D4) → publish to branch, dish, locality and city communities; T0 with links → review queue.
7. Within 150 m at post time → "posted on-site" (coordinates not stored).

| Route | Components | Server |
| --- | --- | --- |
| `/post/new?type=experience` | `PostComposer`, `PhotoUploader`, `PlacePicker`, `RatingPicker`, `DisclosureTag` [posts, media, places, ratings] | A `createUploadUrlsAction`, A `suggestNearbyBranchesAction`, A `publishExperiencePostAction` → J `media/screen-photo`, J `ratings/recompute-dish` |

## W5 Ask the locals (question)

1. Question in a community (default home locality), optional dish/restaurant/area.
2. Answers are comments; `@place` picker attaches cards.
3. Asker accepts one answer → pinned + reputation event.
4. Unanswered after 2 h → boosted in locality feed + push to opted-in T1+ locals.

| Route | Components | Server |
| --- | --- | --- |
| `/post/new?type=question`, `/p/[postId]/[slug]` | `PostComposer`, `CommentComposer`, `PlacePicker` | A `publishQuestionPostAction`, A `createCommentAction`, A `acceptAnswerAction` → J `posts/boost-unanswered` |

## W6 Discussion, comments, votes

1. Discussion post in a community (title required, body ≤ 10,000, photos/entities optional).
2. Up/down vote posts and comments; one per user per item; not on own content.
3. Threads to depth 6 (deeper → depth 6 with "replying to @user").
4. Sort: posts Hot / New / Top (day, week, month, all); comments Best / New.

| Route | Components | Server |
| --- | --- | --- |
| `/c/[community]`, `/p/[postId]/[slug]` | `CommunityHeader`, `JoinButton`, `PostCard`, `CommentThread`, `VoteBar` | Q `getCommunityFeed(sort, window)`, Q `getComments(sort)`; A `publishDiscussionPostAction`, A `castVoteAction`, A `joinCommunityAction` → J `posts/hot-decay` |

## W7 Dish Battle

1. Ops / moderator / Founding / T2 creates: one canonical dish, two branch dishes, 3–7 days (non-staff → Ops approval).
2. Side-by-side photos, price, loved %, distance; vote once, changeable until close; comments.
3. Account ≥ 24 h to vote; shares hidden until voted; visible to guests after close.
4. Close → result card image, auto post in city community, archived page.

| Route | Components | Server |
| --- | --- | --- |
| `/battles`, `/battles/[battleId]/[slug]` (+ `opengraph-image.tsx`) | `BattleCard`, `BattleVote`, `BattleResult` [battles] | A `createBattleAction`, A `castBattleVoteAction` → J `battles/close` |

## W8 Living facts

1. Each fact shows "confirmed N days ago"; past freshness window (hours 60 d, price 90 d, phone 180 d, address 365 d) → "Help confirm".
2. "Still true?" Yes / No → No asks for the structured new value.
3. Consensus (§6.6) auto-applies + audit; else → Ops queue. Permanently closed always reviewed.
4. Confirmations matching consensus raise trust.

| Route | Components | Server |
| --- | --- | --- |
| `/r/[branch]` facts card; `/admin/queues/corrections` | `FactsCard`, `FactRow`, `StillTrueSheet` [facts] | A `confirmFactAction`, A `proposeFactAction` → J `facts/escalate-proposals`; A `reviewCorrectionAction` (Ops) |

## W9 Lists and sharing

1. Create list, add branches or branch dishes with note and rank.
2. Public by default; designed preview image for WhatsApp/Instagram.
3. Recipients view list + map without login; "Save this list" prompts sign-in.

| Route | Components | Server |
| --- | --- | --- |
| `/saved`, `/lists/[listId]/[slug]` (+ OG image) | `ListCard`, `ListMap`, `SaveButton` [saves] | A `createListAction`, A `addListItemAction`, A `reorderListAction`, A `saveListAction` |

## W10 Report and moderation

1. Signed-in user reports post / comment / user / photo / fact with a reason.
2. Queue; auto-hide at ≥ 3 distinct T1+ reports in 24 h (T2 counts 2).
3. Moderator / Ops: dismiss, remove, fix attachment, lock, warn, suspend, ban — audit + author notified with reason.
4. One appeal per action, reviewed by Ops (not the same moderator).

| Route | Components | Server |
| --- | --- | --- |
| any content; `/admin/queues/reports`, `/admin/audit` | `ReportSheet` [moderation] | A `createReportAction`, A `moderateAction`, A `appealAction` → J `profile/recompute-trust` |

## W11 Post-visit nudge

1. Signed-in member taps Directions or Call.
2. Next day 12:30 IST (19:30 if the tap was in the morning) → web push or in-app "Did you make it to {branch}? Rate what you had." Max 1/day; opt-out in settings.
3. Tap opens W3 pre-filled.

| Route | Components | Server |
| --- | --- | --- |
| `/r/[branch]` → `/notifications` → `/rate/[branch]` | `ActionRow`, notification item [notifications] | R `POST /api/events` (`branch/action`) → J `notifications/visit-nudge` |
