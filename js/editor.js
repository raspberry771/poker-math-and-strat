// ============================================================
// EDITOR LOGIC
// ============================================================

// Cycle: RAISE → FOLD → (CALL if SB) → RAISE, or matrix action cycle
function cycleAction(hand, pos) {
  if (state.editor.matrix) {
    const { matrix, heroPos, villainPos } = state.editor;
    const ranges = THREBET_RANGES[matrix]?.[heroPos]?.[villainPos] || {};
    const freq = ranges[hand] || {};
    const acts = MATRIX_CONFIG[matrix].actions;
    const dom = dominantAction(freq, acts);
    const idx = acts.indexOf(dom);
    return acts[(idx + 1) % acts.length];
  }
  const freq = RANGES[pos][hand];
  const dom = dominantAction(freq);
  const actions = pos === "SB" ? ["RAISE", "FOLD", "CALL"] : ["RAISE", "FOLD"];
  const idx = actions.indexOf(dom);
  return actions[(idx + 1) % actions.length];
}

function paintCell(hand, pos, shiftKey) {
  const brush = state.editor.brush;
  const mf = state.editor.mixedFreq;

  if (state.editor.matrix) {
    const { matrix, heroPos, villainPos } = state.editor;
    const ranges = THREBET_RANGES[matrix]?.[heroPos]?.[villainPos];
    if (!ranges) return;
    const acts = MATRIX_CONFIG[matrix].actions;
    if (shiftKey) {
      const currentFreq = ranges[hand] || {};
      const current = dominantAction(currentFreq, acts);
      const other = acts.find(a => a !== brush) || "FOLD";
      const newFreq = Object.fromEntries(acts.map(a => [a, 0]));
      newFreq[brush] = mf;
      newFreq[current === brush ? other : current] = parseFloat((1 - mf).toFixed(4));
      ranges[hand] = newFreq;
    } else {
      const newFreq = Object.fromEntries(acts.map(a => [a, 0]));
      newFreq[brush] = 1.0;
      ranges[hand] = newFreq;
    }
    return;
  }

  if (shiftKey) {
    // Shift+paint: set a mixed frequency between brush action and the "other" dominant
    const current = dominantAction(RANGES[pos][hand]);
    const other = current === brush ? "FOLD" : current;
    const newFreq = { RAISE: 0, CALL: 0, FOLD: 0 };
    newFreq[brush] = mf;
    newFreq[other === brush ? "FOLD" : other] = parseFloat((1 - mf).toFixed(4));
    RANGES[pos][hand] = newFreq;
  } else {
    // Normal paint: pure action
    RANGES[pos][hand] = { RAISE: 0, CALL: 0, FOLD: 0, [brush]: 1.0 };
  }
}

function applyEditorPaint(hand, shiftKey) {
  if (state.editor.matrix) {
    const { matrix, heroPos, villainPos } = state.editor;
    paintCell(hand, null, shiftKey);
    rebuildMatrixDerived(matrix, heroPos, villainPos);
    setSaveStatus('saving');
    saveThreebetRangesToStorage();
    renderEditorGrid();
    return;
  }
  const pos = state.editor.pos;
  paintCell(hand, pos, shiftKey);
  const { grid, freqByCell } = buildGridForPosition(pos);
  state.derived.grids.RFI[pos] = grid;
  state.derived.freqs.RFI[pos] = freqByCell;
  state.derived.border.RFI[pos] = computeBorderSet(pos, grid);
  setSaveStatus('saving');
  saveRangesToStorage();
  renderEditorGrid();
}

function fillPosition(action) {
  if (state.editor.matrix) {
    const { matrix, heroPos, villainPos } = state.editor;
    const ranges = THREBET_RANGES[matrix]?.[heroPos]?.[villainPos];
    if (!ranges) return;
    const acts = MATRIX_CONFIG[matrix].actions;
    // "RAISE" maps to the primary aggressive action for this matrix
    const normalizedAction = (action === "RAISE" && !acts.includes("RAISE")) ? acts[0] : action;
    for (const hand of Object.keys(ranges)) {
      const newFreq = Object.fromEntries(acts.map(a => [a, 0]));
      newFreq[normalizedAction] = 1.0;
      ranges[hand] = newFreq;
    }
    rebuildMatrixDerived(matrix, heroPos, villainPos);
    saveThreebetRangesToStorage();
    renderEditorGrid();
    return;
  }
  const pos = state.editor.pos;
  for (const hand of Object.keys(RANGES[pos])) {
    RANGES[pos][hand] = { RAISE: 0, CALL: 0, FOLD: 0, [action]: 1.0 };
  }
  const { grid, freqByCell } = buildGridForPosition(pos);
  state.derived.grids.RFI[pos] = grid;
  state.derived.freqs.RFI[pos] = freqByCell;
  state.derived.border.RFI[pos] = computeBorderSet(pos, grid);
  saveRangesToStorage();
  renderEditorGrid();
}

function clearPosition() {
  fillPosition("FOLD");
}

function exportRanges() {
  let data, filename;
  if (state.editor.matrix) {
    const { matrix, heroPos, villainPos } = state.editor;
    data = { [matrix]: { [heroPos]: { [villainPos]: THREBET_RANGES[matrix][heroPos][villainPos] } } };
    filename = `rfi_${matrix.toLowerCase()}_${heroPos.toLowerCase()}_vs_${villainPos.toLowerCase()}.json`;
  } else {
    const pos = state.editor.pos;
    data = { [pos]: RANGES[pos] };
    filename = `rfi_${pos.toLowerCase()}_range.json`;
  }
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportAllRanges() {
  const data = { RANGES, THREBET_RANGES };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rfi_complete_ranges.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importRanges(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      const positions = ["UTG", "HJ", "CO", "BTN", "SB"];

      // Case 1: Complete export (has both RANGES and THREBET_RANGES keys)
      if (parsed.RANGES && parsed.THREBET_RANGES) {
        if (!positions.every(p => parsed.RANGES[p])) { alert("Invalid file — missing RFI positions."); return; }
        if (!MATRIX_KEYS.every(k => parsed.THREBET_RANGES[k])) { alert("Invalid file — missing matrix keys."); return; }
        for (const pos of positions) RANGES[pos] = parsed.RANGES[pos];
        THREBET_RANGES = parsed.THREBET_RANGES;
        initDerived();
        saveRangesToStorage();
        saveThreebetRangesToStorage();
        renderEditorGrid();
        alert("Complete ranges imported successfully!");
        return;
      }

      // Case 2: Matrix export (top-level key is a matrix key)
      if (MATRIX_KEYS.some(k => parsed[k])) {
        for (const [matrix, heroData] of Object.entries(parsed)) {
          if (!MATRIX_KEYS.includes(matrix)) continue;
          for (const [heroPos, villainData] of Object.entries(heroData)) {
            for (const [villainPos, hands] of Object.entries(villainData)) {
              if (THREBET_RANGES[matrix]?.[heroPos]?.[villainPos] !== undefined)
                THREBET_RANGES[matrix][heroPos][villainPos] = hands;
            }
          }
        }
        for (const [matrix, cfg] of Object.entries(MATRIX_CONFIG))
          for (const heroPos of cfg.heroPositions)
            for (const villainPos of (cfg.villainPositions[heroPos] || []))
              rebuildMatrixDerived(matrix, heroPos, villainPos);
        saveThreebetRangesToStorage();
        renderEditorGrid();
        alert("Matrix ranges imported successfully!");
        return;
      }

      // Case 3: RFI all-positions export
      if (!positions.every(p => parsed[p])) { alert("Invalid ranges file — missing one or more positions."); return; }
      for (const pos of positions) RANGES[pos] = parsed[pos];
      initDerived();
      saveRangesToStorage();
      renderEditorGrid();
      alert("Ranges imported successfully!");
    } catch(err) {
      alert("Could not parse JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}

function resetToDefaults() {
  if (!confirm("Reset ALL ranges to the original defaults? This cannot be undone.")) return;
  for (const pos of POSITIONS) {
    RANGES[pos] = JSON.parse(JSON.stringify(DEFAULT_RANGES[pos]));
  }
  initDerived();
  saveRangesToStorage();
  renderEditorGrid();
}

// ============================================================
// CARD / TABLE HELPERS
