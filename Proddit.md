# Proddit — Antigravity Product Specification

> **Version:** 2.0 | **Prepared for:** Antigravity Prototyping Tool | **Horizon:** 24–48hr Hackathon Build
> **Change Summary (v1→v2):** Conservation pivot — roles renamed, task taxonomy restructured, GitHub/LeetCode integrations removed, ProdCoin shop replaced with Eco Rewards redemption, squad forum added, priority system removed.

---

## 1. Persona

**Primary User: The Everyday Environmentalist (Age 16–28)**

- High schooler, college student, or young professional who cares about sustainability but struggles to stay consistent without a community around them
- Already doing *some* conservation acts (carrying a tote bag, segregating waste) but wants to do more and be held accountable
- Motivated by peer validation and collective impact — not just personal discipline
- Frustrated by solo eco-apps that feel preachy and don't have social stakes

**Secondary User: The Community Organizer**

- Creates a squad, often around a shared local cause (neighbourhood cleanup, campus composting initiative)
- Hosts or attends macro conservation events and wants the app to reflect that level of effort
- Higher engagement frequency; uses the Herbalist Bloom Bomb to nudge slacking members before squad HP drops

---

## 2. Objective

Build a **multiplayer conservation habit survival game** that:

1. **Narrows the authenticity gap** — all task completions are photo-verified via Gemini Flash Vision; failed or suspected fakes are flagged and reported to the squad, not just the individual
2. **Creates shared ecological stakes** — a Squad HP Bar ties every member's daily conservation behavior to a visible collective consequence
3. **Sustains long-term engagement** via a real-world reward economy (ProdCoins redeemable for eco-friendly products) and a credit score system that compounds over time
4. **Centres conservation, not productivity** — every mechanic (roles, tasks, rewards, squad feed) is thematically grounded in environmental action

**Primary success signals:**
- Image verification pass rate (Gemini confidence ≥ 0.65)
- Daily ProdCoin redemption volume (proxy for real-world engagement)
- Squad survival duration (days before HP hits 0)
- Cumulative impact metrics logged per squad (kg waste, trees planted, etc.)

---

## 3. Scope

### In Scope (Hackathon MVP)

- Google Auth login and conservation-focused onboarding (persona + conservation category selection)
- Squad matchmaking by conservation category (direct join, browse, create, auto-fill)
- Role selection with 5 conservation-themed character classes
- Daily task check-in via image upload (Gemini Flash Vision verification)
- Squad HP bar (shared, real-time via Firestore)
- Individual HP bar and XP system
- Credit score engine (daily delta, no priority weighting — all tasks equal)
- ProdCoin earning, in-game item drops/trading, and Eco Rewards shop (real-world redemption)
- Role abilities with cooldown enforcement
- Squad-scoped forum feed (Discord-style: posts, proof photos, emoji reactions, Bloom Bomb nudges)
- Fake submission flagging — Gemini failure or repeated borderline attempts reported to squad
- Leaderboard (credit score, streak, impact score)
- AI Assistant chatbot (task planning, squad switching, score explanations, impact summaries)
- Individual goal-setting (personal goals tracked on profile, separate from squad goals)
- Impact Ledger (tracks real-world metrics per user and squad)

### Out of Scope (Post-Hackathon)

- Native iOS/Android app
- External API integrations (no GitHub/LeetCode — not conservation-relevant)
- Geolocation-based event check-in
- Cross-squad tournaments or seasonal events
- Real payment processing for physical reward fulfillment
- Social profile sharing outside the app

---

## 4. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React (Web) | Fast prototyping; component-based for dashboard widgets |
| **Auth** | Firebase Auth | Google OAuth in <1hr setup; handles session tokens |
| **Backend** | Python / FastAPI | Async-first; efficient for concurrent Gemini Vision calls and cron-driven HP decay |
| **Database** | Supabase (PostgreSQL) | Relational model for economy ledger, impact tracking, and credit scores |
| **Realtime Sync** | Firestore (Firebase) | Sub-second sync for Squad HP bar, squad forum feed, and online status |
| **Verification Engine** | Gemini Flash Vision API | Validates conservation proof photos; checks metadata + SHA-256 hash for duplicate detection; flags suspicious submissions to squad |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Powers Bloom Bomb (Herbalist), daily check-in reminders, fake-flag alerts |
| **Cron Jobs** | Firebase Scheduled Functions | Midnight check-in window close, HP decay, credit score update, item decay |
| **AI Assistant** | Gemini (conversational) | Task planning chatbot; impact summaries; squad switching advisor; score explainer |
| **Storage** | Supabase Storage | Proof photo storage at `/proofs/{user_id}/{date}/{uuid}.jpg` |

> **Removed from v1:** GitHub REST API and LeetCode GraphQL integrations — not applicable to conservation task verification. Image upload is the sole verification path in MVP.

> **Architecture note:** Supabase = authoritative persistent store (economy, scores, impact). Firestore = ephemeral real-time layer (HP bar display, forum feed, chat). HP writes go to Supabase first; Firestore mirrors for display. Conflict resolution: Supabase wins.

---

## 5. Data Model

### `users`
| Field | Type | Notes |
|---|---|---|
| `user_id` | UUID (PK) | Firebase UID mirrored here |
| `username` | VARCHAR(32) | Unique, no spaces |
| `email` | VARCHAR | From Google Auth |
| `persona` | ENUM | `high_schooler`, `college_student`, `professional` |
| `conservation_category` | ENUM | Primary interest: `waste_management`, `water_conservation`, `energy_efficiency`, `biodiversity`, `climate_action`, `sustainable_transport`, `food_sustainability`, `community_education` |
| `task_description` | TEXT | Free text: what the user commits to doing daily |
| `hours_per_day` | FLOAT | AI-generated or user-declared |
| `days_per_week` | INT | 1–7 |
| `role` | ENUM | `terraformer`, `healer`, `ranger`, `herbalist`, `hydromancer` |
| `individual_hp` | INT | 0–100, default 100 |
| `xp` | INT | Lifetime XP, default 0 |
| `level` | INT | 1–10, derived from XP thresholds |
| `credit_score` | INT | 0–1000, default 500 |
| `prodcoins` | INT | Current balance, default 0 |
| `streak_count` | INT | Consecutive verified days |
| `impact_trees_planted` | INT | Cumulative, incremented on verified biodiversity tasks |
| `impact_waste_kg` | FLOAT | Cumulative kg of waste logged via verified check-ins |
| `impact_events_attended` | INT | Cumulative verified macro-event participations |
| `created_at` | TIMESTAMP | |

> **Removed from v1:** `habit_type`, `habit_priority`. Replaced by `conservation_category`. No priority weighting — all conservation acts are treated as equally important.

### `squads`
| Field | Type | Notes |
|---|---|---|
| `squad_id` | UUID (PK) | |
| `group_id` | VARCHAR(8) | Human-readable invite code |
| `name` | VARCHAR(64) | |
| `conservation_focus` | ENUM | Mirrors members' dominant `conservation_category`; used for matchmaking |
| `squad_hp` | INT | 0–100, shared, default 100 |
| `member_count` | INT | Min 4, Max 6 |
| `status` | ENUM | `active`, `dissolution_warning`, `disbanded` |
| `dissolution_at` | TIMESTAMP | Set when HP hits 0; 24hr grace period |
| `total_impact_score` | INT | Aggregate of all member impact contributions; shown on squad leaderboard |
| `created_at` | TIMESTAMP | |

### `squad_members`
| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `squad_id` | UUID (FK → squads) | |
| `user_id` | UUID (FK → users) | |
| `joined_at` | TIMESTAMP | |

### `check_ins`
| Field | Type | Notes |
|---|---|---|
| `checkin_id` | UUID (PK) | |
| `user_id` | UUID (FK) | |
| `squad_id` | UUID (FK) | |
| `date` | DATE | Local date of check-in window |
| `conservation_category` | ENUM | Category of the task submitted (inherits from user profile, overridable per check-in) |
| `task_tier` | ENUM | `micro`, `meso`, `macro` — descriptive only, no XP/coin weighting |
| `proof_url` | TEXT | Supabase Storage URL |
| `image_hash` | VARCHAR(64) | SHA-256 of uploaded image; used for duplicate detection |
| `ai_verdict` | ENUM | `pass`, `fail`, `borderline` |
| `ai_confidence` | FLOAT | 0.0–1.0 |
| `fake_flag_count` | INT | Number of `fail` or low-confidence verdicts by this user in last 7 days; triggers squad notification at threshold |
| `override_votes` | JSONB | `{ "user_id": "approve" \| "suspicious" }` |
| `final_verdict` | ENUM | `pass`, `fail` |
| `coins_earned` | INT | |
| `xp_earned` | INT | |
| `submitted_at` | TIMESTAMP | |

### `forum_posts`
| Field | Type | Notes |
|---|---|---|
| `post_id` | UUID (PK) | |
| `squad_id` | UUID (FK) | All posts are squad-scoped; no public feed |
| `author_user_id` | UUID (FK) | |
| `content_text` | TEXT | Optional caption |
| `proof_url` | TEXT | Optional image; if present, triggers Gemini verification |
| `ai_verdict` | ENUM | `pass`, `fail`, `borderline`, `no_image` |
| `ai_confidence` | FLOAT | Null if no image |
| `reactions` | JSONB | `{ "emoji": count }` e.g. `{ "🌱": 3, "💧": 2 }` |
| `is_check_in_linked` | BOOLEAN | True if post was auto-generated from a check-in proof |
| `created_at` | TIMESTAMP | |

> **Note:** Forum posts with images are verified by Gemini independently from the daily check-in. A post with a failed/borderline image does not directly affect HP or coins — it only triggers a squad notification. The daily check-in is the sole HP/coin-affecting action.

### `fake_flag_events`
| Field | Type | Notes |
|---|---|---|
| `flag_id` | UUID (PK) | |
| `user_id` | UUID (FK) | User who submitted the suspicious proof |
| `squad_id` | UUID (FK) | |
| `checkin_id` | UUID (FK) | |
| `trigger` | ENUM | `ai_fail`, `ai_borderline_repeat`, `squad_vote_suspicious` |
| `notified_squad` | BOOLEAN | Whether the squad was sent a notification about this flag |
| `created_at` | TIMESTAMP | |

### `items`
| Field | Type | Notes |
|---|---|---|
| `item_id` | UUID (PK) | |
| `owner_user_id` | UUID (FK) | |
| `item_type` | ENUM | `shield`, `hp_potion`, `streak_freeze`, `terraformers_bulwark`, `healers_salve`, `rangers_compass`, `hydromancers_tide_chart`, `herbalists_bloom_flare`, `limited_edition` |
| `rarity` | ENUM | `common`, `rare`, `legendary` |
| `class_locked` | VARCHAR | Role name or null |
| `acquired_at` | TIMESTAMP | |
| `decays_at` | TIMESTAMP | `acquired_at + 48hrs` |
| `decay_value` | FLOAT | Market value multiplier, starts at 1.0 |
| `used` | BOOLEAN | Default false |

> **v2 note:** In-game items are earned only via gameplay (check-in drops, quest rewards) — not purchasable with ProdCoins. The coin shop is now exclusively the Eco Rewards Shop (real-world products). Items remain tradeable between squadmates.

### `eco_rewards_shop`
| Field | Type | Notes |
|---|---|---|
| `reward_id` | UUID (PK) | |
| `name` | VARCHAR | e.g., "Seed & Sapling Kit" |
| `description` | TEXT | What the product is and its eco-impact |
| `coin_cost` | INT | See pricing table below |
| `category` | ENUM | `seeds_plants`, `reusable_goods`, `apparel`, `education_kits`, `local_partner` |
| `stock_available` | INT | Null = unlimited (digital voucher); integer = physical stock |
| `is_active` | BOOLEAN | |

**Eco Rewards Pricing (suggested):**

| Reward | Coin Cost | Notes |
|---|---|---|
| Wildflower Seed Packet | 300 | Low barrier; encourages early redemption |
| Plant-Based Soap Bar | 350 | Partner brand |
| Bamboo Straw Set | 400 | |
| Sapling / Seed Kit | 500 | Most popular expected reward |
| Eco-Notebook (recycled paper) | 600 | |
| Branded Tote Bag | 800 | App merch |
| Reusable Water Bottle | 1,200 | |
| Eco Apparel (T-shirt) | 1,500 | App merch |
| Local Partner Voucher | 700–1,000 | Redeemable at partner eco-stores; varies by partner |

### `redemptions`
| Field | Type | Notes |
|---|---|---|
| `redemption_id` | UUID (PK) | |
| `user_id` | UUID (FK) | |
| `reward_id` | UUID (FK → eco_rewards_shop) | |
| `coins_spent` | INT | |
| `status` | ENUM | `pending`, `fulfilled`, `cancelled` |
| `shipping_address` | TEXT | Collected at redemption; encrypted at rest |
| `redeemed_at` | TIMESTAMP | |

### `individual_goals`
| Field | Type | Notes |
|---|---|---|
| `goal_id` | UUID (PK) | |
| `user_id` | UUID (FK) | |
| `title` | VARCHAR(128) | e.g., "Compost daily for 30 days" |
| `description` | TEXT | |
| `conservation_category` | ENUM | |
| `target_days` | INT | |
| `progress_days` | INT | Incremented by verified check-ins matching this goal's category |
| `completed` | BOOLEAN | |
| `created_at` | TIMESTAMP | |

### `trades`
| Field | Type | Notes |
|---|---|---|
| `trade_id` | UUID (PK) | |
| `initiator_user_id` | UUID (FK) | |
| `recipient_user_id` | UUID (FK) | |
| `offered_item_id` | UUID (FK → items) | |
| `offered_coins` | INT | Optional coin supplement |
| `requested_item_id` | UUID (FK → items) | Nullable |
| `status` | ENUM | `pending`, `accepted`, `declined`, `countered`, `expired` |
| `counter_offer_id` | UUID (FK → trades) | Self-referential |
| `created_at` | TIMESTAMP | |
| `resolved_at` | TIMESTAMP | |

### `role_ability_cooldowns`
| Field | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID (FK) | |
| `ability` | VARCHAR | `earthwall`, `mend`, `seed_share`, `bloom_bomb`, `tidal_surge` |
| `last_used_at` | TIMESTAMP | |
| `next_available_at` | TIMESTAMP | |

### `squad_quests`
| Field | Type | Notes |
|---|---|---|
| `quest_id` | UUID (PK) | |
| `squad_id` | UUID (FK) | |
| `week_start` | DATE | |
| `description` | VARCHAR | e.g., "35 combined check-ins this week" |
| `target_checkins` | INT | |
| `current_checkins` | INT | |
| `completed` | BOOLEAN | |
| `reward_distributed` | BOOLEAN | |

---

## 6. Roles & Abilities

All five roles are conservation-themed. One per squad is encouraged (warning shown on duplicate, not blocked). Abilities are squad-scoped and interact with the shared HP bar.

| Role | Conservation Identity | Special Ability | Ability Name | Cooldown | HP Interaction |
|---|---|---|---|---|---|
| **Terraformer** | Shapes and restores land ecosystems | Blocks next squad HP damage event from a missed check-in | Earthwall | Daily | Negates −10 HP (or exponential hit) for one event |
| **Healer** | Restores balance to damaged environments | Restores 10 HP to squad bar | Mend | Daily | +10 Squad HP (Level 5+: +15 HP) |
| **Ranger** | Moves freely through ecosystems, shares resources | Duplicates an item from a squadmate without removing theirs | Seed Share | Weekly | No direct HP effect; keeps economy liquid |
| **Herbalist** | Deeply rooted in community; alerts when ecosystem is at risk | Sends a forced full-screen nudge to all squadmates | Bloom Bomb | Daily | Indirectly protects HP by triggering action from slacking members before window closes |
| **Hydromancer** | Channels water energy; thrives on momentum | Earns 2× ProdCoins on any check-in verified before noon | Tidal Surge | Daily | No direct HP effect; accelerates coin earning |

**Class-locked items:**

| Item | Locked To | Effect |
|---|---|---|
| Terraformer's Bulwark | Terraformer | Earthwall usable twice today |
| Healer's Salve | Healer | Mend restores 25 HP instead of 10 |
| Ranger's Compass | Ranger | Seed Share usable twice this week |
| Hydromancer's Tide Chart | Hydromancer | Tidal Surge window extends to 14:00 |
| Herbalist's Bloom Flare | Herbalist | Bloom Bomb usable twice today |

---

## 7. Conservation Task Taxonomy

Replaces the old `habit_type` + `habit_priority` system. All tasks carry equal XP and coin weight — no priority tiers. The `task_tier` field is descriptive only (for display and impact tracking), not a scoring multiplier.

| Category | Micro Examples | Meso Examples | Macro Examples |
|---|---|---|---|
| `waste_management` | Segregating garbage, refusing single-use plastic | Picking up trash in a park, drop-off recycling | Organising a neighbourhood cleanup drive |
| `water_conservation` | Shorter showers, turning off taps | Fixing a leaking tap, rainwater harvesting setup | Hosting a water conservation awareness meeting |
| `energy_efficiency` | Unplugging devices, switching to LED | Reducing AC usage, tracking electricity bill | Installing solar panels, community energy audit |
| `biodiversity` | Watering a plant, no-pesticide gardening | Planting a sapling, setting up a bird feeder | Participating in a tree plantation drive |
| `climate_action` | Signing a petition, sharing climate content | Attending a local climate workshop | Going on a climate march or protest |
| `sustainable_transport` | Walking instead of driving, cycling | Carpooling, using public transit for a week | Advocating for cycle lanes at a civic meeting |
| `food_sustainability` | Meatless meal, reducing food waste | Composting, buying local produce | Starting a community garden or food co-op |
| `community_education` | Sharing an eco-tip with someone | Hosting a small awareness chat | Organising a school/college sustainability talk |

---

## 8. UI Elements

### Screen 1 — Login / Onboarding
- Google Sign-In button
- Persona selector: `High Schooler`, `College Student`, `Working Professional`
- Conservation category selector: 8 category cards with icons and short descriptions — user picks their primary focus
- Task declaration: free-text input ("What will you do daily?") + curated examples per category
- AI schedule output: suggested `hours/day` + `days/week` + sample task list — editable before confirm
- Progress stepper (4 steps): Auth → Persona → Conservation Focus → Task Setup

### Screen 2 — Squad Dashboard *(Primary Screen)*
- **Persistent header:** Squad HP bar (large, dominant, green-fill) with HP number and squad name + conservation focus tag
- Member grid: avatar + username + role icon + streak count + today's status (✓ / ⏳ / ✗)
- Bloom Bomb button per member row (Herbalist only; visible to all; active only for Herbalist user)
- Squad quest progress bar (weekly collective target, below member grid)
- Squad Impact Ledger summary (e.g., "🌱 12 trees planted · ♻️ 34 kg waste · 🌍 8 events")
- CTA: "Log Today's Action" (full-width, primary green)

### Screen 3 — My Profile
- Role icon (large) + class name + level badge
- Individual HP bar + XP bar with level progress
- Credit score with ↑/↓ delta from yesterday
- Green Streak counter with milestone markers (7 / 30 / 100 days)
- Personal Impact Ledger (trees, waste kg, events — cumulative)
- Individual Goals section: active goals with progress bars, + "Add Goal" button
- "Verified Guardian" badge if credit score ≥ 850

### Screen 4 — Check-In
- Single submission path: "Upload Proof Photo" (camera icon, drag-and-drop zone)
- Optional caption field (appears in squad forum post if shared)
- "Share to Squad Feed" toggle (on by default)
- AI verdict card: pass/fail/borderline with confidence score
- Borderline state: squad reaction prompt (✓ Legit / 👀 Suspicious)
- Fake flag warning (shown to user if `fake_flag_count` ≥ 2 in 7 days): "Your squad has been notified of repeated verification issues."
- Coins earned + XP earned notification card post-verification
- Item drop notification (20% chance on pass)

### Screen 5 — Squad Forum *(replaces old Squad Feed)*
- Discord-style scrollable feed, squad-scoped
- Post types: check-in proof (auto-posted if toggle on), manual post (text + optional image)
- Each post: avatar, role icon, username, caption, proof image (if any), AI verdict badge (✓ / ⚠️), emoji reaction row
- Eco-themed reaction set: 🌱 🌊 ♻️ ☀️ 🌍 💧 🐝 🌿
- Bloom Bomb events appear as a system card in the feed ("🌿 @herbalist sent a Bloom Bomb — check in before midnight!")
- Fake flag events appear as a discreet system notice ("⚠️ A squad member's proof was flagged. Verification pending.")
- Post composer pinned at bottom: text + image attach + send

### Screen 6 — Inventory
- Item grid: card per item (icon, rarity badge, name, decay timer, use/trade buttons)
- Decay timer as progress bar draining over 48hrs
- Class-locked items show lock icon if user's role doesn't match
- "Use" triggers role ability or HP restoration immediately
- "Trade" opens trade proposal modal

### Screen 7 — Eco Rewards Shop *(replaces old item shop)*
- Product cards: photo, name, eco-impact blurb, coin cost, category tag
- "Redeem" button opens address/details collection modal
- User's current coin balance pinned at top
- Filter tabs: `All` / `Seeds & Plants` / `Reusable Goods` / `Apparel` / `Local Partners`
- Stock indicator on physical items ("Only 12 left")
- Redemption confirmation: "Your order is pending. We'll email you within 3 business days."

### Screen 8 — Trade Hub
- Three tabs: `Active Offers` / `Send Trade` / `History`
- Active offers: initiator avatar, item offered, coin supplement, Accept / Decline / Counter
- Send Trade: squadmate picker → item selector → optional coin supplement → send
- History: resolved trade log

### Screen 9 — Leaderboard
- Three sortable tabs: `Credit Score` / `Green Streak` / `Impact Score`
- Impact Score = weighted sum of `impact_trees_planted × 10` + `impact_waste_kg × 2` + `impact_events_attended × 25`
- "Verified Guardian" badge next to eligible users
- Conservation category filter (see only users in your category)

### Screen 10 — AI Assistant
- Private chat interface (not visible to squad)
- Pre-suggested prompts: "Why did my score drop?", "Help me plan my week", "What's my total impact?", "Should I switch squads?"
- Mood flag input: "I don't have time this week" → suggests a lower-effort micro-task in the user's category
- Ability cooldown reminders as system messages ("Your Tidal Surge resets at midnight")
- Monthly Impact Summary: "This month you helped divert 8.5kg of waste and logged 3 events 🌍"

### Global UI Rules
- **Background:** `#0D1A0D` (deep forest black-green) — replaces pure black; reinforces conservation identity
- **Primary accent:** `#4CAF50` (natural leaf green) — replaces terminal neon green; warmer, less harsh
- **Secondary accent:** `#2196F3` (water blue) — used for Hydromancer elements and water conservation category
- **Earth accent:** `#8D6E63` (soil brown) — used for Terraformer elements and biodiversity tasks
- **Danger accent:** `#FF3B30` — HP damage, failed checks, fake flag alerts (unchanged)
- **Typography:** Helvetica Neue exclusively
- **Animations:** Minimal easing; snap transitions preferred — purposeful, not decorative
- **HP bar:** Persistent fixed header on Squad Dashboard; never hidden
- **Role icons:** Botanically or ecologically themed illustrations (leaf, water drop, mountain, root, tree)

---

## 9. Data Input Validations

### Onboarding
| Field | Rule |
|---|---|
| `username` | 3–32 chars, alphanumeric + underscores only, unique across users |
| `task_description` | 10–500 chars; non-empty after trim |
| `conservation_category` | Must be one of the 8 defined ENUM values |
| `hours_per_day` | Float, 0.5–8.0 (conservation tasks cap lower than productivity tasks) |
| `days_per_week` | Integer, 1–7 |
| `persona` | Must be one of: `high_schooler`, `college_student`, `professional` |

### Check-In Submission
| Field | Rule |
|---|---|
| `image_upload` | JPEG/PNG only; max 10MB; EXIF metadata extracted and logged |
| `image_hash` | SHA-256 computed on upload; rejected if hash exists in last 30 days for this user (duplicate detection) |
| `submission_time` | Must fall within 00:00–23:59 user local time; late submissions rejected |
| `ai_confidence` | < 0.65 → `borderline`; triggers squad vote. Three or more `borderline` or `fail` verdicts in 7 days → `fake_flag_event` created and squad notified |
| `override_vote` | Unanimous squad approval required (all non-submitting members); abstentions do not count as approval |

### Forum Posts
| Field | Rule |
|---|---|
| `content_text` | Max 1,000 chars; at least one of text or image required |
| `proof_url` | If image present: JPEG/PNG only; max 10MB; Gemini verification triggered automatically |
| `post frequency` | Max 5 manual posts per user per day to prevent spam |

### Squad Operations
| Field | Rule |
|---|---|
| `group_id` (join) | Must exist; squad status must be `active`; member count must be < 6 |
| `squad_name` (create) | 3–32 chars; hyphens and spaces allowed; no special characters |
| `member count` | Minimum 4 to begin daily check-in cycle |
| `role selection` | One per user; duplicate role in squad triggers advisory warning (not blocked) |

### Economy & Redemptions
| Field | Rule |
|---|---|
| `trade offer` | Item must be owned by initiator; `used = false`; both parties in same squad |
| `coin_supplement` | Integer ≥ 0; cannot exceed initiator's current balance |
| `item use` | Class-locked: role must match; `next_available_at` must be ≤ now |
| `redemption` | `prodcoins` balance must be ≥ `coin_cost` at time of redemption; balance deducted atomically on confirm |
| `shipping_address` | Required for physical rewards; encrypted at rest; not shared with other users |

### Individual Goals
| Field | Rule |
|---|---|
| `title` | 5–128 chars |
| `target_days` | Integer, 1–365 |
| `conservation_category` | Must match one of the 8 defined values |
| Max active goals | 3 per user simultaneously (prevents overcommitment) |

### Credit Score
- Computed server-side via daily cron — no client input accepted
- All verified check-ins contribute equally — no priority multiplier
- Score clamped to 0–1000 at all times
- Daily delta: +15 on verified check-in; −12 on missed day; streak milestone bonuses (+50 at 7/30/100 days)

---

## 10. Persistence

### Supabase (PostgreSQL) — Source of Truth
- All user profiles, credit scores, XP, levels, streaks
- Impact metrics (`impact_trees_planted`, `impact_waste_kg`, `impact_events_attended`)
- Economy: coin balances, in-game item ownership, trade ledger
- Redemption orders and status
- Check-in records, verification verdicts, fake flag events
- Forum posts (stored; Firestore used only for real-time delivery)
- Individual goals and progress
- Squad composition, HP values, quest state, impact score
- Role ability cooldown timestamps

### Firestore (Firebase) — Real-Time Layer
- Squad HP bar current value (mirrored from Supabase; Firestore is display source)
- Squad forum feed (real-time post delivery; Supabase is record of truth)
- Online/active status per user
- Bloom Bomb trigger events (ephemeral push)

> **Sync rule:** All HP mutations written to Supabase first, then mirrored to Firestore. Conflict resolution: Supabase wins.

### Supabase Storage
- Proof photos at `/proofs/{user_id}/{date}/{uuid}.jpg`
- Forum post images at `/forum/{squad_id}/{post_id}/{uuid}.jpg`
- Retained 90 days, then purged

### Cron Jobs (Firebase Scheduled Functions)
| Job | Frequency | Action |
|---|---|---|
| `close_checkin_window` | Daily at 23:59 (user local TZ) | Marks non-submitted users as failed; triggers HP decay |
| `apply_hp_decay` | Post-window-close | −10 HP per missed member; exponential if 2+ misses same day |
| `update_credit_scores` | Daily at 00:05 UTC | Flat +15 on pass, −12 on miss; no priority weighting |
| `decay_items` | Every 6 hours | −10% `decay_value` for unused items past 48hrs |
| `reset_daily_cooldowns` | Daily at 00:00 UTC | Clears daily cooldowns for Terraformer, Healer, Hydromancer, Herbalist |
| `reset_weekly_cooldowns` | Monday 00:00 UTC | Clears weekly cooldown for Ranger |
| `check_squad_dissolution` | Daily at 00:10 UTC | Sets `dissolution_warning` if HP = 0; disbands after 24hr grace |
| `compute_impact_scores` | Daily at 00:15 UTC | Recalculates `total_impact_score` per squad for leaderboard |

### Session & Offline Handling
- JWT tokens from Firebase Auth; client-side refresh
- No offline mode in MVP — all actions require connectivity
- Optimistic UI on HP bar and coin balance; rollback on server error

---

## 11. Additional Conservation-Oriented Suggestions

These are additions beyond the user's explicit requests — recommended to strengthen the conservation identity without disrupting existing mechanics:

**1. Impact Ledger (already in data model above)**
Track real-world metrics per user and squad — trees planted, kg of waste diverted, events attended. Show these prominently on the Squad Dashboard and Profile. This makes the app feel consequential, not just gamified. The squad leaderboard's third tab becomes `Impact Score` instead of `Net Worth`.

**2. Conservation Category Leaderboard Filter**
Let users filter the leaderboard by category ("Show me the top Water Conservation squads this month"). This rewards depth of commitment within a cause, not just general activity.

**3. Eco-Themed Reaction Set in Forum**
Replace generic emoji reactions with a conservation-themed set: 🌱 🌊 ♻️ ☀️ 🌍 💧 🐝 🌿. Small change, strong thematic signal.

**4. Seasonal Squad Quests (Post-Hackathon)**
Tie weekly squad quests to real-world environmental calendar events — World Water Day (March 22), Earth Day (April 22), World Environment Day (June 5). Completing a seasonal quest during its active window gives a double-item-drop reward and a limited-edition cosmetic.

**5. "Adopt a Cause" Squad Label**
During squad creation, the organiser can choose a local cause label (e.g., "Juhu Beach Cleanup Crew", "IIT Composting Initiative"). This is purely cosmetic/identity — no mechanical effect — but it builds place-based community identity, which is a strong retention signal for conservation-motivated users.

**6. AI Impact Summary (Monthly)**
The AI Assistant auto-generates a monthly personal impact report: tasks completed, streak highlights, coins redeemed, and a real-world equivalence statement ("Your 30 verified check-ins this month are equivalent to offsetting ~12kg of CO₂ — roughly 4 long car trips"). These equivalences are estimates, clearly labelled as such.

**7. Fake Submission Deterrence — Squad Transparency**
Already implemented via `fake_flag_events` and squad notifications. Suggest also adding a `trust_score` sub-field visible only to the squad (not publicly): a member's rolling 30-day pass rate. Not punitive — just transparent. This creates organic social pressure without a formal punishment mechanic.

**8. Visual Theme Shift**
Changed from terminal neon green (#00FF41) on pure black to natural leaf green (#4CAF50) on deep forest black-green (#0D1A0D), with water blue (#2196F3) as a secondary accent. This keeps the high-contrast brutalist feel of v1 but feels ecologically grounded rather than cyberpunk.

---

## Assumptions & Clarifications Needed

| # | Assumption | Clarification Needed |
|---|---|---|
| 1 | All conservation tasks carry equal XP and coin weight regardless of effort level (micro vs. macro) | Confirm: should a climate march (macro) truly earn the same coins as refusing a plastic straw (micro)? If not, define the multiplier without reintroducing "priority" |
| 2 | Forum posts do not earn coins or XP — they are social/accountability only | Confirm: should verified forum posts (image passes Gemini) earn a small XP bonus (e.g. +5 XP, capped at 1/day)? |
| 3 | Physical reward fulfillment (tote bags, saplings) is handled manually by the team outside the app in MVP — the app only tracks redemption status | Confirm fulfillment workflow for the hackathon demo; consider using a voucher/code system to avoid logistics entirely |
| 4 | Eco Rewards pricing assumes roughly 7–14 days of active daily check-ins to reach the cheapest reward (300 coins at 50 coins/day base rate) | Adjust pricing if the team wants faster or slower redemption cycles |
| 5 | In-game items (Shield, HP Potion, etc.) are still earned via gameplay drops but are no longer purchasable with coins | Confirm: should items be purchasable at all, or strictly earned via drops and quests? |
| 6 | `task_tier` (micro/meso/macro) is logged per check-in for impact tracking display but has zero effect on scoring | Confirm this is intentional — otherwise specify which tiers earn bonuses |
| 7 | Squad rebirth coin tax remains at 20% of each member's balance | Confirm exact percentage |
| 8 | Check-in window is 00:00–23:59 in user's local timezone; timezone auto-detected from device | Confirm: auto-detect or manual selection at onboarding? |
| 9 | The Hydromancer "Tidal Surge" 2× window is before 12:00 noon in user's local time | Confirm timezone reference — local or UTC? |
| 10 | Override vote for borderline Gemini verdicts requires unanimous squad approval; abstentions within 2hrs auto-expire the override attempt as failed | Confirm timeout duration |
