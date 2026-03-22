# Stride Frontend Redesign

## Overview

Complete visual redesign of the Stride financial wellness app to a luxury dark immersive aesthetic inspired by premium wellness apps. The app retains all existing routes and functionality while adopting a new design language.

## Design System

### Color Palette
- **Background**: `#000000` (pure black)
- **Primary**: `#e6ddc5` (warm cream)
- **Secondary**: `#c9b183` (gold)
- **Surface hierarchy**: `#0a0a0a` → `#141414` → `#1f1f1f`
- **Muted text**: `#888888` / `#666666`
- **Outlines**: `#333333` / `#222222`

### Typography
- **Headlines**: Plus Jakarta Sans (400–800)
- **Body/Labels**: Manrope (400–700)
- **Editorial/Quotes**: Playfair Display (serif, italic)

### Key Patterns
- **Glass cards**: `rgba(255,255,255,0.05)` with backdrop blur and subtle border
- **Gradient avatars**: Warm gold gradient ring around circular avatars
- **Section headers**: Uppercase, letter-spaced, with optional "SEE ALL →" links
- **Pill buttons**: Rounded-full with arrow, outline or filled variants
- **Horizontal carousels**: Scrollbar-hidden overflow containers

## Reusable UI Primitives (`src/components/ui/`)

| Component | Purpose |
|---|---|
| `SectionHeader` | Uppercase tracking-widest headers with optional link |
| `Divider` | Thin horizontal line (`bg-outline`) |
| `PillButton` | Rounded button with arrow (outline/filled) |
| `HeroImage` | Full-width rounded image container with overlay |
| `CardCarousel` | Horizontal scrolling card container |
| `GradientAvatar` | Circular avatar with warm gradient ring |
| `QuoteBlock` | Serif italic quote with attribution |

## Page Mapping

| Route | Tab Label | View Name |
|---|---|---|
| `/` | Today | Home — hero, card swipes, carousels |
| `/social` | Community | Activity feed, monthly challenge |
| `/check` | Discover | Spend checker, content cards |
| `/decide` | Studio | Decision hero, experience cards |
| `/progress` | Profile | Avatar, stats, goals, integrations |
| `/onboarding` | — | 6-step financial profiling flow |

## Bottom Navigation

5 tabs with thin-line Material Symbols icons. Only the active tab shows its text label. Maps: Community → `/social`, Discover → `/check`, Today → `/`, Studio → `/decide`, Profile → `/progress`.
