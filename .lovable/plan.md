
# Plan: Consolidate to Single "NOW" Font (Inter)

## Overview
Currently the app uses two fonts:
- **Inter** (called "NOW" / `font-now`) - for body, h1, h2
- **DM Serif Display** (`font-serif-display`) - for h3-h6 and subtitles

This plan will consolidate everything to use only the Inter font (your "NOW" font).

## Changes Required

### 1. Remove DM Serif Display font import
**File:** `index.html`
- Remove the Google Fonts link for "DM Serif Display"
- Keep only the Inter font import

### 2. Update Tailwind configuration
**File:** `tailwind.config.ts`
- Remove the `serif-display` font family definition
- Keep only the `now` font family (Inter)

### 3. Update base CSS styles
**File:** `src/index.css`
- Change h3, h4, h5, h6 from `font-serif-display` to `font-now`
- Change `.subtitle` class from `font-serif-display` to `font-now`

## Technical Details

```text
Files to modify:
+---------------------------+----------------------------------------+
| File                      | Change                                 |
+---------------------------+----------------------------------------+
| index.html                | Remove DM Serif Display font link      |
| tailwind.config.ts        | Remove 'serif-display' font definition |
| src/index.css             | Replace font-serif-display with        |
|                           | font-now in h3-h6 and .subtitle        |
+---------------------------+----------------------------------------+
```

## Result
After these changes, the entire app will use Inter (your "NOW" font) consistently across all text elements including headings, body text, and subtitles.
