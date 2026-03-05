function switchView(view) {
  state.view = view;
  el.viewTrainer.hidden  = view !== "trainer";
  el.viewEditor.hidden   = view !== "editor";
  el.sidebarTrainer.hidden = view !== "trainer";
  el.sidebarEditor.hidden  = view !== "editor";
  el.tabTrainer.classList.toggle("active", view === "trainer");
  el.tabEditor.classList.toggle("active", view === "editor");
  if (view === "editor") {
    // Sync editor matrix context from current trainer scenario
    if (isMatrixScenario()) {
      const cfg = MATRIX_CONFIG[state.scenario];
      state.editor.matrix = state.scenario;
      if (!cfg.heroPositions.includes(state.editor.heroPos))
        state.editor.heroPos = cfg.heroPositions[0];
      const vills = cfg.villainPositions[state.editor.heroPos] || [];
      if (!vills.includes(state.editor.villainPos))
        state.editor.villainPos = vills[0];
      if (el.editorMatrixContext) el.editorMatrixContext.hidden = false;
      if (el.editorPosField) el.editorPosField.style.display = "none";
      populateEditorHeroSelect();
      populateEditorVillainSelect();
    } else {
      state.editor.matrix = null;
      if (el.editorMatrixContext) el.editorMatrixContext.hidden = true;
      if (el.editorPosField) el.editorPosField.style.display = "";
    }
    syncBrushButtonsForEditor();
    renderEditorGrid();
    setSaveStatus("saved");
  }
}

// ============================================================
// RENDER — TRAINER
// ============================================================
function renderTable() {
  const pos = state.current?.pos || "UTG";
  const villainPos = state.current?.villainPos || null;
  const reveal = state.phase === "REVEAL";
  const isMx = isMatrixScenario();
  const mxCfg = isMx ? MATRIX_CONFIG[state.scenario] : null;
  const isVs3bet = state.scenario === "VS3BET";
  const seats = [
    { key: "UTG", cls: "utg",      label: "UTG" },
    { key: "HJ",  cls: "hj",       label: "HJ"  },
    { key: "CO",  cls: "co",       label: "CO"  },
    { key: "BTN", cls: "seat-btn", label: "BTN" },
    { key: "SB",  cls: "sb",       label: "SB"  },
    { key: "BB",  cls: "bb",       label: "BB"  },
  ];
  const seatBlocks = seats.map(s => {
    let showCards = "back";
    if (s.key === pos) showCards = "hand";
    else if (s.key === villainPos) showCards = isMx ? "aggressor" : "villain";
    return seatHTML(s.cls, s.label, {
      active: s.key === pos,
      dim: s.key === "BB" && s.key !== villainPos,
      showCards,
    });
  }).join("");

  let potLabel, hintText;
  if (isMx) {
    potLabel = mxCfg.label;
    if (reveal) hintText = "Reveal shown below";
    else if (mxCfg.category === "offense") hintText = `${villainPos} opened → 3-bet?`;
    else hintText = `${pos} raised → ${villainPos} 3-bets`;
  } else if (isVs3bet) {
    potLabel = "vs 3-Bet";
    hintText = reveal ? "Reveal shown below" : `You raised → ${villainPos} 3-bets`;
  } else {
    potLabel = "RFI spot";
    hintText = reveal ? "Reveal shown below" : "Choose Raise / Fold";
  }

  el.tableStage.innerHTML = `
    <div class="poker-table">
      ${seatBlocks}
      <div class="table-center">
        <div class="pot">${potLabel}</div>
        <div class="hint">${hintText}</div>
      </div>
    </div>`;
  // Only pulse + deal on a fresh ASKING phase, not on reveal re-renders
  if (state.phase === "ASKING") {
    requestAnimationFrame(() => {
      triggerChipPulse();
      triggerCardDeal();
    });
  }
}

function renderActionButtons() {
  const pos = state.current?.pos || "UTG";
  const acts = posActions(pos);
  el.actionButtons.innerHTML = "";
  const mapKbd = a => {
    if (isMatrixScenario()) return String(acts.indexOf(a) + 1);
    if (state.scenario === "VS3BET") {
      if (a === "FOUR_BET") return "1";
      if (a === "CALL") return "2";
      return "3";
    }
    return a === "RAISE" ? "1" : a === "CALL" ? "2" : pos === "SB" ? "3" : "2";
  };
  for (const a of acts) {
    const btn = document.createElement("button");
    btn.className = `action-btn ${actionToClass(a)}`;
    btn.innerHTML = `<span>${actionDisplayName(a)}</span><span class="kbd">${mapKbd(a)}</span>`;
    btn.disabled = state.phase !== "ASKING";
    btn.addEventListener("click", () => answer(a));
    el.actionButtons.appendChild(btn);
  }
}

function renderGrid() {
  const pos = state.current.pos;
  const grid = getCurrentGrid();
  const ranges = getScenarioRanges(pos, state.current.villainPos);
  const acts = getScenarioActions();
  const [r, c] = cellFromHand(state.current.hand);
  el.gridWrap.innerHTML = "";
  for (let rr = 0; rr < 13; rr++)
    for (let cc = 0; cc < 13; cc++) {
      const hand = handLabelFromCell(rr, cc);
      const defaultFreq = Object.fromEntries(acts.map(a => [a, a === "FOLD" ? 1.0 : 0]));
      const freq = ranges[hand] || defaultFreq;
      const dom = grid ? grid[rr][cc] : "FOLD";
      const cell = document.createElement("div");
      cell.className = `cell ${actionToClass(dom)}${rr === r && cc === c ? " active" : ""}`;
      cell.textContent = hand;
      const bar = document.createElement("div"); bar.className = "bar";
      acts.forEach(a => {
        const seg = document.createElement("div");
        seg.className = `seg ${actionToClass(a)}`;
        seg.style.width = `${Math.round((freq[a] || 0) * 100)}%`;
        bar.appendChild(seg);
      });
      cell.appendChild(bar);
      cell.addEventListener("mouseenter", () => {
        if (!state.settings.debug) return;
        el.debugCell.textContent = JSON.stringify({ pos, hand, freq, dominant: dom }, null, 2);
      });
      el.gridWrap.appendChild(cell);
    }
}

function renderNeighbors() {
  const [r, c] = cellFromHand(state.current.hand);
  const grid = getCurrentGrid();
  el.neighborsList.innerHTML = "";
  neighborsForCell(r, c).forEach(([rr, cc]) => {
    const hand = handLabelFromCell(rr, cc);
    const dom = grid ? grid[rr][cc] : "FOLD";
    const row = document.createElement("div");
    row.className = "nei";
    row.innerHTML = `
      <div class="left"><span class="chip ${actionToClass(dom)}"></span><span class="hand">${hand}</span></div>
      <div class="act">${actionDisplayName(dom)}</div>`;
    el.neighborsList.appendChild(row);
  });
}

function renderStats() {
  el.statHands.textContent = String(state.stats.hands);
  const acc = state.stats.hands ? (state.stats.correct / state.stats.hands) * 100 : 0;
  el.statAcc.textContent = `${acc.toFixed(1)}%`;
  el.statStreak.textContent = String(state.stats.streak);
  el.statBest.textContent = String(state.stats.best);
  el.posBreakdown.innerHTML = "";
  for (const pos of POSITIONS) {
    const p = state.stats.byPos[pos];
    const a = p.hands ? (p.correct / p.hands) * 100 : 0;
    const row = document.createElement("div");
    row.className = "mini-row";
    row.innerHTML = `<div>${pos}</div><div>${a.toFixed(0)}%</div><div>${p.hands}</div>`;
    el.posBreakdown.appendChild(row);
  }
}

function render() {
  const isLive = state.settings.dealMode === "live";
  const isVs3bet = state.scenario === "VS3BET";
  const isMx = isMatrixScenario();
  const mxCfg = isMx ? MATRIX_CONFIG[state.scenario] : null;

  el.positionField.style.display = state.settings.mode === "single" ? "flex" : "none";
  el.edgeWeightField.style.display = isLive ? "none" : "flex";
  el.edgePctLabel.textContent = `${Math.round(state.settings.edgeWeight * 100)}%`;
  el.edgeWeight.value = String(Math.round(state.settings.edgeWeight * 100));
  el.showGridToggle.checked = state.settings.showGrid;
  el.showNeighborsToggle.checked = state.settings.showNeighbors;
  el.debugToggle.checked = state.settings.debug;
  el.dealModeSelect.value = state.settings.dealMode;

  // Sync two-level scenario selector
  const cat = isMx ? mxCfg.category : isVs3bet ? "defense" : "rfi";
  if (el.scenarioCategorySelect) {
    el.scenarioCategorySelect.value = cat;
    populateScenarioMatrixSelect();
    if (el.scenarioMatrixSelect) el.scenarioMatrixSelect.value = state.scenario;
  }

  renderStats();
  if (!state.current) return;

  const { pos, villainPos, hand } = state.current;
  el.pillPos.textContent = pos;
  if (isMx) {
    el.pillSpot.textContent = mxCfg.label;
  } else {
    el.pillSpot.textContent = isVs3bet ? "vs 3-Bet" : "RFI";
  }
  el.pillSource.textContent = isLive ? "Live simulation"
    : `${Math.round(state.settings.edgeWeight * 100)}/${100 - Math.round(state.settings.edgeWeight * 100)} edge mix`;

  if (isMx) {
    el.qTitle.textContent = `${mxCfg.label} — ${mxCfg.nickname}`;
    el.qSub.textContent = mxCfg.category === "offense"
      ? `${villainPos} opened → you 3-bet?`
      : `${pos} raised → ${villainPos} 3-bets back`;
  } else if (isVs3bet) {
    el.qTitle.textContent = `vs 3-Bet — ${pos}`;
    el.qSub.textContent = `You raised → ${villainPos} 3-bets`;
  } else {
    el.qTitle.textContent = `RFI — ${pos}`;
    el.qSub.textContent = isLive ? "Dealt from deck"
      : state.current.isBorder ? "Border hand (adjacent to boundary)" : "Random hand";
  }
  el.handLabel.textContent = hand;
  renderTable();
  renderActionButtons();

  const reveal = state.phase === "REVEAL";
  el.revealCard.hidden = !reveal;
  el.nextBtnTop.disabled = !reveal;
  if (reveal) {
    el.revealTitle.textContent = state.current.isCorrect ? "Correct ✓" : "Incorrect ✕";
    el.revealDetail.textContent = `Your answer: ${actionDisplayName(state.current.user)} • Correct: ${actionDisplayName(state.current.correct)}`;
    el.gridPanel.style.display = state.settings.showGrid ? "block" : "none";
    el.neighborsPanel.style.display = state.settings.showNeighbors ? "block" : "none";
    if (state.settings.showGrid) renderGrid();
    if (state.settings.showNeighbors) renderNeighbors();
    el.debugArea.hidden = !state.settings.debug;
    if (state.settings.debug) {
      el.debugTotals.textContent = JSON.stringify({ pos, totals: weightedTotals(pos) }, null, 2);
      const ranges = getScenarioRanges(pos, villainPos);
      const freq = ranges[hand];
      const acts = getScenarioActions();
      el.debugCell.textContent = JSON.stringify({ pos, hand, freq, dominant: dominantAction(freq, acts) }, null, 2);
    }
  }
}

// ============================================================
// RENDER — EDITOR GRID
// ============================================================
function renderEditorGrid() {
  const isMatrix = !!state.editor.matrix;
  let pos, ranges, acts;

  if (isMatrix) {
    const { matrix, heroPos, villainPos } = state.editor;
    pos = heroPos;
    ranges = THREBET_RANGES[matrix]?.[heroPos]?.[villainPos] || {};
    acts = MATRIX_CONFIG[matrix].actions;
    el.editorPosLabel.textContent = `${heroPos} vs ${villainPos}`;
    if (el.editorMatrixLabel) el.editorMatrixLabel.textContent = `${MATRIX_CONFIG[matrix].label} — ${heroPos}`;
  } else {
    pos = state.editor.pos;
    ranges = RANGES[pos];
    acts = ACTIONS;
    el.editorPosLabel.textContent = pos;
  }

  el.editorGridWrap.innerHTML = "";

  for (let rr = 0; rr < 13; rr++)
    for (let cc = 0; cc < 13; cc++) {
      const hand = handLabelFromCell(rr, cc);
      const defaultFreq = Object.fromEntries(acts.map(a => [a, a === "FOLD" ? 1.0 : 0]));
      const freq = ranges[hand] || defaultFreq;
      const dom = dominantAction(freq, acts);
      const vals = acts.map(a => freq[a] ?? 0).filter(v => v > 0);
      const mixed = vals.length > 1;

      const cell = document.createElement("div");
      cell.className = `cell editor-cell ${mixed ? "mixed" : actionToClass(dom)}`;
      cell.dataset.hand = hand;
      cell.textContent = hand;

      // Frequency bar at bottom
      const bar = document.createElement("div"); bar.className = "bar";
      acts.forEach(a => {
        const seg = document.createElement("div");
        seg.className = `seg ${actionToClass(a)}`;
        seg.style.width = `${Math.round((freq[a] || 0) * 100)}%`;
        bar.appendChild(seg);
      });
      cell.appendChild(bar);

      // Hover info
      cell.addEventListener("mouseenter", () => {
        const pct = v => Math.round((v || 0) * 100);
        const parts = acts.filter(a => (freq[a] || 0) > 0).map(a => `${actionDisplayName(a)[0]}:${pct(freq[a])}%`);
        el.editorHandInfo.textContent = `${hand} — ${parts.join(" / ")}`;
        if (state.editor.isPainting) applyEditorPaint(hand, state.editor.paintShift);
      });

      // Mouse events for painting
      cell.addEventListener("mousedown", (e) => {
        e.preventDefault();
        if (e.button === 2) {
          const next = cycleAction(hand, pos);
          state.editor.brush = next;
          updateBrushUI(next);
          applyEditorPaint(hand, false);
        } else {
          state.editor.isPainting = true;
          state.editor.paintShift = e.shiftKey;
          applyEditorPaint(hand, e.shiftKey);
        }
      });

      cell.addEventListener("contextmenu", e => e.preventDefault());
      el.editorGridWrap.appendChild(cell);
    }
}

function updateBrushUI(action) {
  state.editor.brush = action;
  [el.brushRaise, el.brushBluff, el.brushCall, el.brushFold].forEach(b => {
    b.classList.toggle("active", b.dataset.action === action);
  });
}

// Sync brush button labels/visibility to current editor mode
function syncBrushButtonsForEditor() {
  const isMatrix = !!state.editor.matrix;
  if (isMatrix) {
    const acts = MATRIX_CONFIG[state.editor.matrix].actions;
    const hasSplit3bet = acts.includes("VALUE_3BET");
    // Primary raise button: VALUE_3BET or FOUR_BET
    el.brushRaise.dataset.action = acts[0];
    el.brushRaise.textContent = hasSplit3bet ? "Value 3B" : actionDisplayName(acts[0]);
    el.brushRaise.className = `brush-btn raise`;
    // Bluff 3-Bet brush (only for split-3bet scenarios)
    if (hasSplit3bet) {
      el.brushBluff.style.display = "";
      el.brushBluff.dataset.action = "BLUFF_3BET";
      el.brushBluff.className = "brush-btn bluff";
    } else {
      el.brushBluff.style.display = "none";
    }
    // Call button only if matrix has CALL
    const hasCall = acts.includes("CALL");
    el.brushCall.style.display = hasCall ? "" : "none";
    el.brushCall.dataset.action = "CALL";
    el.brushCall.textContent = "Call";
    el.brushFold.dataset.action = "FOLD";
    el.brushFold.textContent = "Fold";
    // Ensure brush is valid for current scenario
    if (!acts.includes(state.editor.brush)) state.editor.brush = acts[0];
  } else {
    el.brushRaise.dataset.action = "RAISE";
    el.brushRaise.textContent = "Raise";
    el.brushRaise.className = `brush-btn raise`;
    el.brushBluff.style.display = "none";
    el.brushCall.style.display = state.editor.pos === "SB" ? "" : "none";
    el.brushCall.dataset.action = "CALL";
    el.brushCall.textContent = "Call";
    el.brushFold.dataset.action = "FOLD";
    el.brushFold.textContent = "Fold";
  }
  updateBrushUI(state.editor.brush);
}

// Populate hero position select for current matrix editor
function populateEditorHeroSelect() {
  if (!state.editor.matrix || !el.editorHeroPosSelect) return;
  const cfg = MATRIX_CONFIG[state.editor.matrix];
  el.editorHeroPosSelect.innerHTML = cfg.heroPositions
    .map(p => `<option value="${p}"${p === state.editor.heroPos ? " selected" : ""}>${p}</option>`)
    .join("");
}

// Populate villain position select based on current hero
function populateEditorVillainSelect() {
  if (!state.editor.matrix || !el.editorVillainPosSelect) return;
  const cfg = MATRIX_CONFIG[state.editor.matrix];
  const vills = cfg.villainPositions[state.editor.heroPos] || [];
  el.editorVillainPosSelect.innerHTML = vills
    .map(p => `<option value="${p}"${p === state.editor.villainPos ? " selected" : ""}>${p}</option>`)
    .join("");
}

// Populate the scenario matrix select based on category
function populateScenarioMatrixSelect() {
  if (!el.scenarioCategorySelect || !el.scenarioMatrixSelect) return;
  const cat = el.scenarioCategorySelect.value;
  let options;
  if (cat === "rfi") {
    options = [{ value: "RFI", label: "RFI — Raise First In" }];
  } else if (cat === "offense") {
    options = MATRIX_KEYS.filter(k => MATRIX_CONFIG[k].category === "offense")
      .map(k => ({ value: k, label: `${MATRIX_CONFIG[k].label} — ${MATRIX_CONFIG[k].nickname}` }));
  } else {
    options = [
      { value: "VS3BET", label: "vs 3-Bet (Quick)" },
      ...MATRIX_KEYS.filter(k => MATRIX_CONFIG[k].category === "defense")
        .map(k => ({ value: k, label: `${MATRIX_CONFIG[k].label} — ${MATRIX_CONFIG[k].nickname}` })),
    ];
  }
  el.scenarioMatrixSelect.innerHTML = options
    .map(o => `<option value="${o.value}">${o.label}</option>`)
    .join("");
}

function setScenarioFromSelectors() {
  if (!el.scenarioMatrixSelect) return;
  const val = el.scenarioMatrixSelect.value;
  if (val) { state.scenario = val; newQuestion(); }
}

// ============================================================
// BIND — ALL EVENT LISTENERS
