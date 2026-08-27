---
name: EduScrapeApp
description: Utilitarian Minimalist Curriculum Platform with High-Craft GSAP Motion
colors:
  primary: "#141413"
  primary-dark: "#EDEDED"
  neutral-bg: "#FBFBFA"
  neutral-bg-dark: "#0E0E10"
  card-bg: "#FFFFFF"
  card-bg-dark: "#151518"
  border: "#E5E4DE"
  border-dark: "rgba(255, 255, 255, 0.08)"
  muted: "#706F6A"
  muted-dark: "#8A8A93"
  pastel-green: "#2D5A34"
  pastel-green-bg: "#EDF3EC"
  pastel-blue: "#1E5C8A"
  pastel-blue-bg: "#E3EFFB"
  pastel-amber: "#8A5B00"
  pastel-amber-bg: "#FBF3DB"
  pastel-red: "#9F2F2D"
  pastel-red-bg: "#FDEBEC"
typography:
  display:
    fontFamily: "Geist Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  display-serif:
    fontFamily: "Instrument Serif, Newsreader, Georgia, serif"
    fontSize: "clamp(2rem, 4.5vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Geist Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Geist Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.012em"
  mono:
    fontFamily: "Geist Mono, SF Mono, JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
  caption:
    fontFamily: "Geist Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
  micro:
    fontFamily: "Geist Mono, SF Mono, JetBrains Mono, monospace"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.04em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-dark:
    backgroundColor: "{colors.primary-dark}"
    textColor: "#0E0E10"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  bento-card:
    backgroundColor: "{colors.card-bg}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "24px 28px"
---

# Design System: EduScrapeApp

## Overview

**Creative North Star: "The Editorial Hardware Laboratory"**

EduScrapeApp embodies the disciplined restraint of precision scientific instrumentation combined with the typography of an elite architectural journal. The interface prioritizes scannability, dense tabular taxonomy, high-contrast monochrome surfaces, and 60fps compositor physics over generic SaaS gradient mush and decorative filler.

Every component feels machined and tactile: hairline 1px borders, subtle millimeter dot-matrix grids, Faux-OS window chrome, and spot pastels reserved strictly for telemetry and semantic status. Motion is purposeful, fluid, and non-blocking, orchestrated through GSAP timelines, ScrollTrigger batch reveals, and quickTo 3D cursor physics.

**Key Characteristics:**
- Warm bone (#FBFBFA) and deep obsidian (#0E0E10) canvas architecture.
- Dual typographic pairing: ultra-tight Geist Sans display with dramatic Instrument Serif italic accents.
- Monospace telemetry bands for high-density curriculum stats and hardware specs.
- Zero AI-slop: banned purple/teal gradients, neon glow blobs, and heavy blurred drop shadows.
- Micro-interactions powered by GSAP with 60fps GPU acceleration.

## Colors

The color palette is strictly restrained warm monochrome with semantic muted spot pastels.

### Primary
- **Obsidian Black / Crisp Bone** (`#141413` in light / `#EDEDED` in dark): Carries primary typography, primary action fills, and active states.

### Neutral
- **Bone Canvas** (`#FBFBFA` / `#0E0E10`): Warm off-white light background avoiding harsh `#FFFFFF`, and pure obsidian dark background avoiding murky blues.
- **Card Surface** (`#FFFFFF` / `#151518`): Crisp, elevated card surfaces with hairline structural boundaries.
- **Hairline Border** (`#E5E4DE` / `rgba(255, 255, 255, 0.08)`): Precise 1px structural dividing lines.
- **Muted Slate** (`#706F6A` / `#8A8A93`): Secondary descriptive copy and technical labels.

### Spot Pastels
- **Pale Sage Green** (`#EDF3EC` bg, `#2D5A34` text): Semantic indicators for live sync, clean OCR status, and verified author badges.
- **Pale Glacier Blue** (`#E3EFFB` bg, `#1E5C8A` text): Web platform, Python automation, and curriculum grade tags.
- **Pale Honey Amber** (`#FBF3DB` bg, `#8A5B00` text): ESP32 hardware, offline badges, and AI vision highlights.
- **Pale Crimson** (`#FDEBEC` bg, `#9F2F2D` text): Error states and raw watermarked artifact warnings.

### Named Rules
**The Rarity Rule.** Color accents occupy ≤5% of screen real estate. The monochrome canvas provides clarity; color exists exclusively for functional meaning.  
**The No-Gradient Rule.** Gradients across card surfaces, backgrounds, or text fills are prohibited. Depth is established through 1px border contrast, architectural dot grids, and Faux-OS elevation.

## Typography

**Display Font:** Geist Sans (with -apple-system, BlinkMacSystemFont fallback)  
**Editorial Serif Accent:** Instrument Serif / Newsreader (with Georgia fallback)  
**Telemetry / Code Font:** Geist Mono (with SF Mono, JetBrains Mono fallback)

**Character:** Technical, confident, and editorial. The juxtaposition of modern geometric grotesque with classical italic serif creates an immediate visual distinction between utilitarian data and human craftsmanship.

### Hierarchy
- **Display** (700, `clamp(2.25rem, 5vw, 3.75rem)`, 1.08): Hero titles with tight tracking (`-0.035em`).
- **Editorial Serif Accent** (400 italic, `clamp(2rem, 4.5vw, 3.5rem)`, 1.15): Distinctive italic emphasis phrases within hero headlines.
- **Headline** (700, `clamp(1.5rem, 3vw, 2.25rem)`, 1.2): Section titles with tracking (`-0.03em`).
- **Title** (600, `1.125rem` to `1.25rem`, 1.3): Card headings and bento cell labels.
- **Body** (400, `0.875rem`, 1.6): Feature descriptions and body paragraphs (max line length: 55ch).
- **Label / Monospace** (500, `0.75rem`, 1.4): Metadata telemetry, status badges, and code snippets.

## Layout

A modular 12-column asymmetric grid with unified container constraints (`max-width: 72rem / 1152px`). Spatial rhythm follows an 8px base scale (8px, 16px, 24px, 32px, 48px, 96px).

- **Header:** Fixed 56px minimalist navigation bar with hair-thin scroll progress scrubber and blurred backdrop.
- **Hero:** Asymmetric 7:5 split between value proposition and interactive Faux-OS curriculum indexer.
- **Bento Grid:** Asymmetric 7:5 and 5:7 column distribution creating balanced visual tension across ingestion, OCR, vision AI, and embedded hardware.
- **Dual Showcase:** 2-column equal split for Cloud Web Platform vs. Embedded ESP32 Hardware.

## Elevation & Depth

**The Flat-By-Default Rule.** Surfaces rest entirely flat on the canvas bounded by crisp 1px borders. Heavy blurred shadows are banned. Depth is rendered via:
1. **Faux-OS Window Chrome:** Window dots, header strips, and inset backgrounds.
2. **Subtle Horizon Glow:** Ultra-diffuse 2% opacity ambient radial horizon light (`.ambient-glow-top`).
3. **Interactive 3D Tilt:** Real-time compositor rotation (`rotationX`, `rotationY` via `gsap.quickTo`) tracking cursor coordinates.

## Shapes

- **Corner Radius:** Standardized 6px (`--radius: 0.375rem`) for buttons, cards, and modal dialogs.
- **Micro-Pills:** 4px (`rounded-sm`) for keystroke `<kbd>` elements and badge tags.
- **Borders:** Consistent `1px solid var(--border)` across all cards, inputs, and containers.

## Components

### Buttons
- **Shape:** 6px radius (`0.375rem`).
- **Primary:** Dark obsidian fill (`#141413`) with white text (`#FFFFFF`) in light mode; crisp bone fill (`#EDEDED`) with dark text (`#0E0E10`) in dark mode.
- **Outline / Secondary:** Transparent background, `1px solid var(--border)`, text `var(--muted-foreground)` transitioning to `var(--foreground)` on hover.
- **State Transitions:** 150ms transform scale (`0.98`) on active press.

### Bento Cards
- **Corner Style:** 6px radius.
- **Background:** `var(--card)`.
- **Border:** `1px solid var(--border)`, brightening on hover.
- **Padding:** 24px to 32px (`p-6 sm:p-8`).

### Faux-OS Windows
- **Header:** 3 muted window dots (`width: 8px, height: 8px`), terminal path name, and live status badge.
- **Interactive Content:** Tabbed curriculum pills, live formula display, and monospace telemetry.

### Telemetry Stat Cards
- **Style:** Compact card with uppercase 10px monospace label, bold 24–30px metric value, and subtle micro-description.

## Do's and Don'ts

### Do:
- **Do** maintain strict 1px hair-thin borders (`#E5E4DE` / `rgba(255,255,255,0.08)`) on all containers.
- **Do** pair Geist Sans with Instrument Serif italics for primary headline statements.
- **Do** use `gsap.quickTo()` for cursor tracking to ensure 60fps compositor performance without layout reflow.
- **Do** use `ScrollToPlugin` for all anchor navigation links with automatic 56px header offset compensation.
- **Do** credit exclusively **Reyansh Niranjan** as the solo architect and creator.

### Don't:
- **Don't** add purple/teal radial glow blobs, blur bubbles, or generic AI-slop gradients.
- **Don't** use emojis in technical UI elements; use crisp Lucide icons.
- **Don't** use heavy multi-stop drop shadows.
- **Don't** reference CPX-SE or fictional team rosters anywhere in the platform.
- **Don't** animate `top`, `left`, `width`, or `height`; always animate `transform` (`x`, `y`, `scale`, `rotation`) and `opacity`.
