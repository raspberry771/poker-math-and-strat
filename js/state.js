const ALL_SCENARIO_KEYS = ["RFI", "VS3BET", ...MATRIX_KEYS];

const state = {
  view: "trainer", // "trainer" | "editor"
  scenario: "RFI", // "RFI" | "VS3BET" | "IP_3BET" | "OOP_3BET" | "IP_DEFENSE" | "OOP_DEFENSE"
  settings: {
    mode: "random",
    position: "UTG",
    edgeWeight: 0.7,
    dealMode: "drill", // "drill" | "live"
    showGrid: true,
    showNeighbors: true,
    debug: false,
  },
  derived: {
    grids:  { RFI: {}, VS3BET: {}, MATRIX: Object.fromEntries(MATRIX_KEYS.map(k => [k, {}])) },
    freqs:  { RFI: {}, VS3BET: {}, MATRIX: Object.fromEntries(MATRIX_KEYS.map(k => [k, {}])) },
    border: { RFI: {}, VS3BET: {}, MATRIX: Object.fromEntries(MATRIX_KEYS.map(k => [k, {}])) },
  },
  current: null, // { pos, villainPos, hand, cards, correct, isBorder, user, isCorrect }
  phase: "ASKING",
  stats: {
    hands: 0, correct: 0, streak: 0, best: 0,
    byPos: Object.fromEntries(POSITIONS.map(p => [p, { hands: 0, correct: 0 }])),
    byScenario: Object.fromEntries(ALL_SCENARIO_KEYS.map(k => [k, { hands: 0, correct: 0 }])),
    mistakes: new Map(),
  },
  editor: {
    pos: "UTG",       // RFI position
    heroPos: "BTN",   // matrix hero position
    villainPos: "CO", // matrix villain position
    matrix: null,     // active matrix key, or null for RFI
    brush: "RAISE",
    mixedFreq: 0.5,
    isPainting: false,
  },
};

function buildGridForMatrix(matrix, heroPos, villainPos) {
  const ranges = THREBET_RANGES[matrix]?.[heroPos]?.[villainPos] || {};
  const acts = MATRIX_CONFIG[matrix].actions;
  const grid = Array.from({ length: 13 }, () => Array.from({ length: 13 }, () => null));
  const freqByCell = Array.from({ length: 13 }, () => Array.from({ length: 13 }, () => null));
  for (let r = 0; r < 13; r++)
    for (let c = 0; c < 13; c++) {
      const hand = handLabelFromCell(r, c);
      const freq = ranges[hand] || Object.fromEntries(acts.map(a => [a, a === "FOLD" ? 1.0 : 0]));
      grid[r][c] = dominantAction(freq, acts);
      freqByCell[r][c] = freq;
    }
  return { grid, freqByCell };
}

function buildGridForVs3bet(heroPos, villainPos) {
  const ranges = VS3BET_RANGES[heroPos][villainPos];
  const grid = Array.from({ length: 13 }, () => Array.from({ length: 13 }, () => null));
  const freqByCell = Array.from({ length: 13 }, () => Array.from({ length: 13 }, () => null));
  for (let r = 0; r < 13; r++)
    for (let c = 0; c < 13; c++) {
      const hand = handLabelFromCell(r, c);
      const freq = ranges[hand] || { FOUR_BET: 0, CALL: 0, FOLD: 1.0 };
      grid[r][c] = dominantAction(freq, VS3BET_ACTIONS);
      freqByCell[r][c] = freq;
    }
  return { grid, freqByCell };
}

function initDerived() {
  // RFI grids
  for (const pos of POSITIONS) {
    const { grid, freqByCell } = buildGridForPosition(pos);
    state.derived.grids.RFI[pos] = grid;
    state.derived.freqs.RFI[pos] = freqByCell;
    state.derived.border.RFI[pos] = computeBorderSet(pos, grid);
  }
  // VS3BET grids
  for (const heroPos of POSITIONS) {
    state.derived.grids.VS3BET[heroPos] = {};
    state.derived.freqs.VS3BET[heroPos] = {};
    state.derived.border.VS3BET[heroPos] = {};
    for (const villainPos of (VS3BET_VILLAIN_POSITIONS[heroPos] || [])) {
      const { grid, freqByCell } = buildGridForVs3bet(heroPos, villainPos);
      state.derived.grids.VS3BET[heroPos][villainPos] = grid;
      state.derived.freqs.VS3BET[heroPos][villainPos] = freqByCell;
      state.derived.border.VS3BET[heroPos][villainPos] = computeBorderSet(heroPos, grid);
    }
  }
  // Matrix grids
  for (const [matrix, cfg] of Object.entries(MATRIX_CONFIG)) {
    state.derived.grids.MATRIX[matrix] = {};
    state.derived.freqs.MATRIX[matrix] = {};
    state.derived.border.MATRIX[matrix] = {};
    for (const heroPos of cfg.heroPositions) {
      state.derived.grids.MATRIX[matrix][heroPos] = {};
      state.derived.freqs.MATRIX[matrix][heroPos] = {};
      state.derived.border.MATRIX[matrix][heroPos] = {};
      for (const villainPos of (cfg.villainPositions[heroPos] || [])) {
        const { grid, freqByCell } = buildGridForMatrix(matrix, heroPos, villainPos);
        state.derived.grids.MATRIX[matrix][heroPos][villainPos] = grid;
        state.derived.freqs.MATRIX[matrix][heroPos][villainPos] = freqByCell;
        state.derived.border.MATRIX[matrix][heroPos][villainPos] = computeBorderSet(heroPos, grid);
      }
    }
  }
}

// Rebuild derived grids for a single matrix×hero×villain slot (after editor paints)
function rebuildMatrixDerived(matrix, heroPos, villainPos) {
  const { grid, freqByCell } = buildGridForMatrix(matrix, heroPos, villainPos);
  state.derived.grids.MATRIX[matrix][heroPos][villainPos] = grid;
  state.derived.freqs.MATRIX[matrix][heroPos][villainPos] = freqByCell;
  state.derived.border.MATRIX[matrix][heroPos][villainPos] = computeBorderSet(heroPos, grid);
}

// Scenario-aware helpers
function isMatrixScenario() { return MATRIX_KEYS.includes(state.scenario); }

function getCurrentGrid() {
  if (isMatrixScenario())
    return state.derived.grids.MATRIX[state.scenario]?.[state.current?.pos]?.[state.current?.villainPos];
  if (state.scenario === "VS3BET" && state.current?.villainPos)
    return state.derived.grids.VS3BET[state.current.pos]?.[state.current.villainPos];
  return state.derived.grids.RFI[state.current?.pos];
}
function getScenarioRanges(heroPos, villainPos) {
  if (isMatrixScenario()) return THREBET_RANGES[state.scenario]?.[heroPos]?.[villainPos] || {};
  if (state.scenario === "VS3BET") return VS3BET_RANGES[heroPos]?.[villainPos] || {};
  return RANGES[heroPos];
}
function getScenarioActions() {
  if (isMatrixScenario()) return MATRIX_CONFIG[state.scenario].actions;
  return state.scenario === "VS3BET" ? VS3BET_ACTIONS : ACTIONS;
}
function getCurrentBorder() {
  if (isMatrixScenario())
    return state.derived.border.MATRIX[state.scenario]?.[state.current?.pos]?.[state.current?.villainPos];
  if (state.scenario === "VS3BET" && state.current?.villainPos)
    return state.derived.border.VS3BET[state.current.pos]?.[state.current.villainPos];
  return state.derived.border.RFI[state.current?.pos];
}

// ============================================================
// TRAINER LOGIC
// ============================================================
function choosePosition() {
  if (isMatrixScenario()) {
    const heroes = MATRIX_CONFIG[state.scenario].heroPositions;
    if (state.settings.mode === "single" && heroes.includes(state.settings.position))
      return state.settings.position;
    return heroes[Math.floor(Math.random() * heroes.length)];
  }
  if (state.settings.mode === "single") return state.settings.position;
  return POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
}

function chooseVillainPos(heroPos) {
  if (isMatrixScenario()) {
    const eligible = MATRIX_CONFIG[state.scenario].villainPositions[heroPos] || [];
    return eligible[Math.floor(Math.random() * eligible.length)];
  }
  const eligible = VS3BET_VILLAIN_POSITIONS[heroPos] || [];
  return eligible[Math.floor(Math.random() * eligible.length)];
}

function chooseHand(pos, villainPos) {
  const edgeP = state.settings.edgeWeight;
  const ranges = getScenarioRanges(pos, villainPos);
  const allHands = Object.keys(ranges);
  const border = getCurrentBorderFor(pos, villainPos);
  if (Math.random() < edgeP) {
    const arr = border ? Array.from(border) : allHands;
    if (arr.length > 0) return arr[Math.floor(Math.random() * arr.length)];
  }
  return allHands[Math.floor(Math.random() * allHands.length)];
}

// Border lookup without requiring state.current (used in chooseHand before state.current is set)
function getCurrentBorderFor(pos, villainPos) {
  if (isMatrixScenario())
    return state.derived.border.MATRIX[state.scenario]?.[pos]?.[villainPos];
  if (state.scenario === "VS3BET")
    return state.derived.border.VS3BET[pos]?.[villainPos];
  return state.derived.border.RFI[pos];
}
