# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**RFI Trainer** — A browser-based poker training app for mastering 6-max No Limit Hold'em opening ranges (Raise First In scenarios). No build system, no dependencies, no server required.

## Running the App

Open `index.html` directly in a browser (file:// works fine), or serve it with any static file server:

```bash
python3 -m http.server 8080
```

There are no build, lint, or test commands — this is vanilla HTML/CSS/JS.

## Architecture

All application logic lives in three files:

- [app.js](app.js) — 1,800+ lines of vanilla JS: all state, rendering, training logic, editor, and audio
- [styles.css](styles.css) — All styling (dark theme, CSS variables for colors)
- [index.html](index.html) — HTML structure only; no inline scripts or styles

### State Model

A single global `state` object drives everything. Key sections:

```
state.view          → "trainer" | "editor"
state.settings      → mode, position, edgeWeight, showGrid, etc.
state.derived       → grids, freqs, border sets (computed from RANGES)
state.current       → active hand/position/user-answer/correctness
state.phase         → "ASKING" | "REVEAL"
state.stats         → hands, correct, streak, best, byPos, mistakes
state.editor        → pos, brush, mixedFreq, isPainting
```

`render()` is the single re-render function — call it after any state mutation.

### Ranges Data

`RANGES` (lines 7–862 of app.js) is the hardcoded default: a nested object keyed by position (`UTG`, `HJ`, `CO`, `BTN`, `SB`), then hand name (`AA`, `AKs`, `AKo`, etc.), each mapping to `{ RAISE, CALL, FOLD }` frequencies that sum to 1.0.

User edits are persisted to `localStorage.rfiRanges` and loaded on startup. `rfi_all_ranges.json` is a backup of the default ranges.

### Two Views

**Trainer** — Drills hands weighted toward "border" hands (edge-of-range hands). Grades strictly: only the dominant action (highest frequency) is correct. Tracks streaks, per-position accuracy, milestones at 5/10/25/50/100.

**Editor** — Interactive 13×13 grid for painting hand ranges. Left-click/drag paints with selected brush; right-click cycles actions; Shift+click sets mixed frequencies. Auto-saves to LocalStorage.

### Key Functions

| Function | Purpose |
|---|---|
| `newQuestion()` | Pick next hand (weighted by border/random ratio) |
| `answer(action)` | Grade user response, update stats, transition to REVEAL |
| `render()` | Full UI re-render from state |
| `renderGrid()` | Draw range visualization in reveal card |
| `buildGridForPosition(pos)` | Build 13×13 matrix for a position |
| `computeBorderSet(pos, grid)` | Find hands on raise/fold boundary |
| `chooseHand(pos)` | Weighted hand selection (edgeWeight controls border bias) |
| `paintCell(hand, pos, shiftKey)` | Update a hand's frequencies in editor |
| `exportAllRanges()` | Download all ranges as JSON |
| `importRanges(file)` | Load ranges from JSON file |

### Audio

`Audio` is an IIFE using the Web Audio API — synthesized tones only, no audio files. `Audio.playCorrect()`, `Audio.playWrong()`, `Audio.playMilestone()`.

### Keyboard Shortcuts (Trainer)

| Key | Action |
|---|---|
| `1` | RAISE |
| `2` | CALL (SB) or FOLD |
| `3` | FOLD |
| `Enter` | Next hand (REVEAL phase) |
