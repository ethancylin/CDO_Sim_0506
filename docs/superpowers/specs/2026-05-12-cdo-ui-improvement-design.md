# Design Spec: Refined Financial Journal (CDO Dashboard)

## 1. Overview
The goal is to elevate the "Gaussian Copula CDO Dashboard" from a standard dark-mode interface to a high-precision, "Financial Journal" aesthetic. This involves a shift in typography, atmospheric visual details, and an interactive "Inverted Waterfall" visualizer.

## 2. Visual System
### 2.1 Typography
- **Headlines/Serif**: `Cormorant Garamond` (Google Fonts). Used for the main title, section headings, and large stat values.
- **Data/Mono**: `JetBrains Mono` (Google Fonts). Used for numerical data, labels, and technical parameter readouts.
- **Body**: Standard Sans (Inter/system) for paragraphs.

### 2.2 Palette & Atmosphere
- **Base Background**: Deep Indigo/Black (`#0a0e1a`).
- **Accent Colors**: 
  - Cyan (`#5dd3ff`): Technical parameters and highlights.
  - Emerald (`#52e3a4`): Safe/low-risk states.
  - Rose (`#ff6b8a`): Loss/risk/wipeout states.
  - Amber (`#ffb74d`): Warnings/Mezzanine risk.
- **Depth**: Sublte radial glows (`radial-gradient`) behind major charts and panels. 1px borders (`#243056`) with a top "light-leak" highlight for cards.

## 3. Core Components
### 3.1 Inverted Waterfall Visualizer
- **Structure**: A vertical sidebar showing the capital structure of the CDO.
- **Tranches (Top to Bottom)**:
  - **Equity**: 0–3%
  - **Mezzanine**: 3–6%
  - **Senior**: 6–10%
  - **Super Senior**: 10–100%
- **Behavior**: As the correlation slider moves, the "loss fill" (Rose color) will grow **downward** from the top (Equity). 
- **Mapping**: Fill percentage in each tranche is calculated as `Expected Loss / Tranche Size`.

### 3.2 Dynamic Narrative
- The "Simultaneous Wipeout Analysis" section will be enhanced with the new typography to feel like an editorial sidebar.
- Labels on the slider will be expanded to describe the regimes (e.g., "Independence" at 0.0, "Systemic Crisis" at 1.0).

## 4. Technical Requirements
- **Framework**: React + Tailwind CSS.
- **Fonts**: Add Google Fonts `<link>` to `index.html`.
- **Assets**: No external image assets required; use CSS for all gradients and glows.
- **Data**: Update `cdo_results.json` generation logic (if needed) to ensure the 10-100% Super Senior tranche data is available.

## 5. Success Criteria
- The dashboard looks like a high-end quantitative research piece.
- The Waterfall Visualizer provides an immediate visual intuition for how systemic correlation erodes the capital structure from top to bottom.
- No regression in calculation accuracy or interactivity.
