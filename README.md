# 🌱 Proddit

**Proddit** is a multiplayer conservation habit survival game that narrows the authenticity gap in sustainability. It ties your daily eco-friendly actions to a collective, real-time consequence via a **Squad HP Bar** and verifies completion via AI image analysis.

Build real-world habits, track your ecological impact, play coop-survival with your squad, and redeem rewards for real, physical eco-friendly goods!

---

## 🌍 Key Features

1. **Multiplayer Conservation Survival**
   - **Squad HP Bar**: Form a squad of 4–6 members grouped by an overarching conservation focus (e.g., Water Conservation).
   - **Co-op Accountability**: Every verified daily check-in sustains the squad. Missed check-ins deal heavy HP damage to the group. Survive the week, or risk your squad disbanding!

2. **AI-Verified Proofs via Gemini Flash Vision**
   - Ditch generic to-do checklists. Proddit requires a **photo proof** of your daily task.
   - Google Gemini Flash Vision instantly grades your proof (`pass`, `fail`, `borderline`), flagging duplicate or highly suspicious submissions to your squad for peer review.

3. **In-Game Roles & Abilities**
   - **Terraformer**: Shields the squad from missed check-in damage.
   - **Healer**: Restores raw HP to the Squad Bar.
   - **Herbalist**: Sends full-screen "Bloom Bomb" nudges to slacking squadmates.
   - **Ranger**: Duplicates items for squadmates via Seed Share.
   - **Hydromancer**: Earns 2× in-game coins for early-morning check-ins.

4. **Authentic Real-World Economy**
   - Earn **ProdCoins** for every verified task.
   - **Eco Rewards Shop**: Spend earned coins on real-world items like *sapling kits, bamboo straw sets, branded eco-apparel, and plant-based goods*. (Fulfillment workflow mapped for MVP/Production).

5. **Impact Ledger**
   - Move beyond points: Track actual, quantifiable impact including *Trees Planted, kg of Waste Diverted, and Macro Events Attended*.

6. **Squad Forum & Trading Hub**
   - A Discord-style live feed per squad to react to peers' proofs using eco-emojis (🌱 🌊 ♻️).
   - Trade drops, class-locked items, and raw coins to optimize squad survival.

---

## 🛠 Tech Stack

- **Frontend**: React (Vite) for rapid, component-based dashboard widget generation.
- **Backend**: Supabase (PostgreSQL) for relational state (economy ledger, users, impact scores, check-ins) and Storage (image proof retention).
- **Realtime Sync**: Firebase Firestore handling sub-second, ephemeral state distribution for the Squad HP Bar, Forum Feed, and Alerts.
- **Auth**: Firebase Auth (Google OAuth).
- **Verification Engine**: Google Gemini Flash Vision API.
- **Push / Cron Jobs**: Firebase Cloud Messaging (FCM) & Scheduled Functions (midnight window closures, HP decay logic, daily resets).

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed along with `npm` (v18+ recommended).

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/proddit-v2.git
   cd proddit-v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file at the root of the project with your Supabase and Firebase keys (refer to `.env.example` if applicable):
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   # Add Firebase / Gemini keys as needed
   ```

4. Run the Dev Server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to view the app in your browser!

---

## 🌲 The "Why" Behind Proddit

Eco-apps often fail because they are either completely solo (lacking accountability) or overly preachy. Proddit focuses on peer validation over personal discipline. It's built for those who deeply care about conservation, but need strong community ties to maintain momentum. By forcing **real photographic proof**, creating **shared visual stakes**, and offering **real-world eco-rewards**, Proddit changes the game for environmental activism.

## 🤝 Contributing

We welcome improvements! Feel free to open issues or submit pull requests for:
- Refining the Supabase queries & Firebase sync logic.
- Refining Gemini vision prompting for better task accuracy.
- Expanding the Eco Rewards items catalog.

*Built with ❤️ for a Greener Planet.*
