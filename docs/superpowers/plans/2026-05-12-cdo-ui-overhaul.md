# Refined Financial Journal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the CDO Dashboard into a high-end "Financial Journal" aesthetic with an inverted waterfall visualizer.

**Architecture:** Update data generation to include a 4th tranche (Super Senior), then overhaul the React frontend with premium typography, atmospheric CSS, and a dynamic top-down loss visualizer.

**Tech Stack:** Python (Scipy), React, Tailwind CSS, Lucide Icons.

---

### Task 1: Update Simulation Data (4th Tranche)

**Files:**
- Modify: `calculate_cdo.py`
- Output: `cdo_results.json`

- [ ] **Step 1: Modify `calculate_cdo.py` to add Super Senior tranche**

```python
# Around line 105 in calculate_cdo.py
tranches = [
    {"name": "Equity", "lower": 0.0, "upper": 0.03, "color": "#ff6b8a"},
    {"name": "Mezzanine", "lower": 0.03, "upper": 0.06, "color": "#ffb74d"},
    {"name": "Senior", "lower": 0.06, "upper": 0.10, "color": "#5dd3ff"},
    {"name": "Super Senior", "lower": 0.10, "upper": 1.00, "color": "#9aa6c2"}
]
```

- [ ] **Step 2: Run script to generate new JSON**

Run: `python calculate_cdo.py`
Expected: `cdo_results.json` updated with 4 tranches per scenario.

- [ ] **Step 3: Copy JSON to frontend src**

Run: `cp cdo_results.json cdo-artifact/src/cdo_results.json`

- [ ] **Step 4: Commit**

```bash
git add calculate_cdo.py cdo_results.json cdo-artifact/src/cdo_results.json
git commit -m "feat(data): add Super Senior tranche (10-100%)"
```

---

### Task 2: Typography & Base Styles

**Files:**
- Modify: `cdo-artifact/index.html`
- Modify: `cdo-artifact/src/index.css`

- [ ] **Step 1: Add Google Fonts to `index.html`**

Add to `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Update `index.css` with atmospheric background and typography**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0a0e1a;
  --border: #243056;
}

body {
  background-color: var(--bg);
  background-image: 
    radial-gradient(circle at 20% 0%, rgba(93, 211, 255, 0.05), transparent 40%),
    radial-gradient(circle at 80% 100%, rgba(255, 183, 77, 0.03), transparent 40%);
  color: #e8edf7;
  font-family: 'Inter', system-ui, sans-serif;
}

.font-serif {
  font-family: 'Cormorant Garamond', serif;
}

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}

.journal-panel {
  background: linear-gradient(180deg, #131a2e 0%, #0a0e1a 100%);
  border: 1px solid var(--border);
  position: relative;
}

.journal-panel::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #5dd3ff, transparent);
  opacity: 0.3;
}
```

- [ ] **Step 3: Commit**

```bash
git add cdo-artifact/index.html cdo-artifact/src/index.css
git commit -m "style: add Cormorant Garamond and JetBrains Mono fonts"
```

---

### Task 3: Inverted Waterfall Visualizer Component

**Files:**
- Modify: `cdo-artifact/src/App.tsx`

- [ ] **Step 1: Implement the `TrancheWaterfall` component**

```tsx
const TrancheWaterfall = ({ tranches }: { tranches: any[] }) => {
  return (
    <div className="flex flex-col gap-1 h-[450px]">
      {tranches.map((t, i) => {
        const fillPercent = (t.expected_loss / t.size) * 100;
        return (
          <div 
            key={i} 
            className="relative border border-zinc-800 bg-zinc-900/30 flex items-center justify-center overflow-hidden transition-all duration-500"
            style={{ 
                height: `${i === 3 ? 60 : 13}%`, // Scale Super Senior (i=3) larger for visibility
                borderColor: `${t.color}30`
            }}
          >
            {/* Loss Fill - Top Down */}
            <div 
              className="absolute top-0 left-0 w-full transition-all duration-700 ease-out"
              style={{ 
                height: `${fillPercent}%`,
                backgroundColor: t.color,
                opacity: 0.25 
              }}
            />
            <div className="relative z-10 text-center">
              <span className="block font-mono text-[10px] uppercase tracking-tighter opacity-50" style={{ color: t.color }}>
                {t.name}
              </span>
              <span className="block font-serif text-sm font-bold text-zinc-100">
                {(t.lower * 100).toFixed(0)}-{(t.upper * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add cdo-artifact/src/App.tsx
git commit -m "feat(ui): implement Inverted Waterfall component"
```

---

### Task 4: UI Overhaul (Layout & Branding)

**Files:**
- Modify: `cdo-artifact/src/App.tsx`

- [ ] **Step 1: Refactor `App` component with Journal aesthetic**

Apply the following changes:
- Header: Use `font-serif` for "5-Year CDO Analysis" and `font-mono` for eyebrows.
- Cards: Apply `journal-panel` class.
- Slider: Update labels to include "Independence" and "Systemic Crisis".
- Layout: Move Waterfall to a sidebar next to the Tranche risk cards.

- [ ] **Step 2: Update narrative section to use editorial styling**

- [ ] **Step 3: Commit**

```bash
git add cdo-artifact/src/App.tsx
git commit -m "feat(ui): complete Refined Financial Journal overhaul"
```

---

### Task 5: Build & Finalize

- [ ] **Step 1: Run production build**

Run: `npm.cmd --prefix cdo-artifact run build`

- [ ] **Step 2: Sync to root index.html**

Run: `cp cdo-artifact/dist/index.html index.html`

- [ ] **Step 3: Verification**

- Open `index.html` in browser.
- Verify fonts are loading.
- Verify Waterfall fills top-down as ρ increases.
- Verify 4 tranches are present.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "build: final UI update"
```
