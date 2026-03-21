# Stride: The Digital Sanctuary

Stride is a next-generation financial mindfulness ecosystem designed to transition users from financial anxiety to a state of botanical harmony. It utilizes **Biophilic Minimalism** to create a sensory regulator experience, moving away from stressful ledgers toward a restorative digital garden.

## 🌿 Creative Philosophy

Stride is built on the concept of **Biophilic Minimalism**. We reject high-stress UI tropes (sharp edges, alarming reds, rigid grids) in favor of organic forms, high-contrast editorial typography, and tonal layering.

### Key Pillars:

- **Digital Sanctuary:** A "sensory regulator" experience with intentional asymmetry and negative space.
- **Biophilic Palette:** Colors inspired by botanical greens and oat-milk creams.
- **No-Line Rule:** Boundaries are defined solely through background shifts, not solid borders.
- **Editorial Rhythm:** High-contrast typography transitions making financial data feel like a lifestyle magazine.

## 🛠️ Tech Stack

- **Frontend:** [Next.js](https://nextjs.org) (App Router)
- **Styling:** [Tailwind CSS 4.0](https://tailwindcss.com) with custom `@theme` configuration.
- **Typography:** Plus Jakarta Sans (Headers) & Manrope (Body).
- **Architecture:** T3 Stack (TypeScript, tRPC, Drizzle ORM).
- **PWA Ready:** Designed as a Progressive Web Application for a native "Digital Sanctuary" experience.

## 🚀 Getting Started

1. **Install Dependencies:**

   ```bash
   npm install --legacy-peer-deps
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in the required database and auth keys.

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

## 🏗️ Core Screens

- **Community Pulse (`/`):** Real-time financial mindfulness and peer comparisons.
- **Action Deck (`/actions`):** Micro-decision cards for quick financial wins.
- **Growth Garden (`/growth`):** Visualized savings goals and long-term security.
- **Bloom Collective (`/bloom`):** Friendship forest and educational "Wellness Blooms".
- **AI Council (`/council`):** Strategic analysis for major life decisions.
- **The Harvest Review (`/harvest`):** Weekly growth visualization with the Lotus Vessel.

## 🎨 Design Tokens

Defined in `src/styles/globals.css`:

- **Surface:** `#fafaf5` (Base)
- **Primary:** `#516144` (Forest Green)
- **Secondary:** `#4c6455` (Botanical Green)
- **Tertiary:** `#884b3b` (Terracotta - used for neutral focus/warnings)
- **Radius:** Standard `2rem` superellipses for containers.

---

_Created with Mindfulness by Stride Team._
