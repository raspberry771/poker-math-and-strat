const el = {
  // Tabs & views
  tabTrainer:        document.getElementById("tabTrainer"),
  tabEditor:         document.getElementById("tabEditor"),
  viewTrainer:       document.getElementById("viewTrainer"),
  viewEditor:        document.getElementById("viewEditor"),
  sidebarTrainer:    document.getElementById("sidebarTrainer"),
  sidebarEditor:     document.getElementById("sidebarEditor"),

  // Trainer controls
  scenarioCategorySelect: document.getElementById("scenarioCategorySelect"),
  scenarioMatrixSelect:   document.getElementById("scenarioMatrixSelect"),
  scenarioMatrixField:    document.getElementById("scenarioMatrixField"),
  dealModeSelect:    document.getElementById("dealModeSelect"),
  modeSelect:        document.getElementById("modeSelect"),
  positionField:     document.getElementById("positionField"),
  positionSelect:    document.getElementById("positionSelect"),
  edgeWeightField:   document.getElementById("edgeWeightField"),
  edgeWeight:        document.getElementById("edgeWeight"),
  edgePctLabel:      document.getElementById("edgePctLabel"),
  showGridToggle:    document.getElementById("showGridToggle"),
  showNeighborsToggle: document.getElementById("showNeighborsToggle"),
  debugToggle:       document.getElementById("debugToggle"),
  resetBtn:          document.getElementById("resetBtn"),

  // Trainer display
  pillSpot:          document.getElementById("pillSpot"),
  pillPos:           document.getElementById("pillPos"),
  pillSource:        document.getElementById("pillSource"),
  qTitle:            document.getElementById("qTitle"),
  qSub:              document.getElementById("qSub"),
  handLabel:         document.getElementById("handLabel"),
  tableStage:        document.getElementById("tableStage"),
  actionButtons:     document.getElementById("actionButtons"),
  revealCard:        document.getElementById("revealCard"),
  revealTitle:       document.getElementById("revealTitle"),
  revealDetail:      document.getElementById("revealDetail"),
  nextBtn:           document.getElementById("nextBtn"),
  nextBtnTop:        document.getElementById("nextBtnTop"),
  gridPanel:         document.getElementById("gridPanel"),
  gridWrap:          document.getElementById("gridWrap"),
  neighborsPanel:    document.getElementById("neighborsPanel"),
  neighborsList:     document.getElementById("neighborsList"),
  statHands:         document.getElementById("statHands"),
  statAcc:           document.getElementById("statAcc"),
  statStreak:        document.getElementById("statStreak"),
  statBest:          document.getElementById("statBest"),
  posBreakdown:      document.getElementById("posBreakdown"),
  debugArea:         document.getElementById("debugArea"),
  debugTotals:       document.getElementById("debugTotals"),
  debugCell:         document.getElementById("debugCell"),
  downloadCsvBtn:    document.getElementById("downloadCsvBtn"),

  // Editor controls
  editorPosField:         document.getElementById("editorPosField"),
  editorPosSelect:        document.getElementById("editorPosSelect"),
  editorPosLabel:         document.getElementById("editorPosLabel"),
  editorMatrixContext:    document.getElementById("editorMatrixContext"),
  editorMatrixLabel:      document.getElementById("editorMatrixLabel"),
  editorHeroPosSelect:    document.getElementById("editorHeroPosSelect"),
  editorVillainPosSelect: document.getElementById("editorVillainPosSelect"),
  brushRaise:        document.getElementById("brushRaise"),
  brushBluff:        document.getElementById("brushBluff"),
  brushCall:         document.getElementById("brushCall"),
  brushFold:         document.getElementById("brushFold"),
  mixedFreq:         document.getElementById("mixedFreq"),
  mixedPctLabel:     document.getElementById("mixedPctLabel"),
  fillRaiseBtn:      document.getElementById("fillRaiseBtn"),
  fillFoldBtn:       document.getElementById("fillFoldBtn"),
  clearPosBtn:       document.getElementById("clearPosBtn"),
  exportBtn:         document.getElementById("exportBtn"),
  exportAllBtn:      document.getElementById("exportAllBtn"),
  importBtn:         document.getElementById("importBtn"),
  importFile:        document.getElementById("importFile"),
  resetRangesBtn:    document.getElementById("resetRangesBtn"),
  editorGridWrap:    document.getElementById("editorGridWrap"),
  editorHandInfo:    document.getElementById("editorHandInfo"),
};

function bind() {
  // View switching
  el.tabTrainer.addEventListener("click", () => switchView("trainer"));
  el.tabEditor.addEventListener("click",  () => switchView("editor"));

  // Trainer controls — two-level scenario selector
  el.scenarioCategorySelect.addEventListener("change", () => {
    populateScenarioMatrixSelect();
    setScenarioFromSelectors();
  });
  el.scenarioMatrixSelect.addEventListener("change", setScenarioFromSelectors);
  el.dealModeSelect.addEventListener("change", () => {
    state.settings.dealMode = el.dealModeSelect.value;
    newQuestion();
  });
  el.modeSelect.addEventListener("change", () => { state.settings.mode = el.modeSelect.value; render(); });
  el.positionSelect.addEventListener("change", () => { state.settings.position = el.positionSelect.value; render(); });
  el.edgeWeight.addEventListener("input", () => { state.settings.edgeWeight = parseInt(el.edgeWeight.value, 10) / 100; render(); });
  el.showGridToggle.addEventListener("change", () => { state.settings.showGrid = el.showGridToggle.checked; render(); });
  el.showNeighborsToggle.addEventListener("change", () => { state.settings.showNeighbors = el.showNeighborsToggle.checked; render(); });
  el.debugToggle.addEventListener("change", () => { state.settings.debug = el.debugToggle.checked; render(); });
  el.resetBtn.addEventListener("click", resetStats);
  el.nextBtn.addEventListener("click", newQuestion);
  el.nextBtnTop.addEventListener("click", newQuestion);

  // Keyboard shortcuts (trainer only)
  window.addEventListener("keydown", (e) => {
    if (state.view !== "trainer") return;
    if (e.key === "Enter" && state.phase === "REVEAL") return newQuestion();
    if (state.phase !== "ASKING") return;
    const pos = state.current?.pos;
    if (!pos) return;
    if (isMatrixScenario()) {
      const acts = MATRIX_CONFIG[state.scenario].actions;
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < acts.length) return answer(acts[idx]);
      return;
    }
    if (e.key === "1") return answer(state.scenario === "VS3BET" ? "FOUR_BET" : "RAISE");
    if (e.key === "2") {
      if (state.scenario === "VS3BET") return answer("CALL");
      if (pos === "SB") return answer("CALL");
      return answer("FOLD");
    }
    if (e.key === "3") return answer("FOLD");
  });

  // CSV download
  el.downloadCsvBtn.addEventListener("click", () => {
    const rows = [["position","hand","raise_pct","call_pct","fold_pct","dominant"]];
    for (const pos of POSITIONS)
      for (const hand of Object.keys(RANGES[pos])) {
        const f = RANGES[pos][hand];
        rows.push([pos, hand, f.RAISE||0, f.CALL||0, f.FOLD||0, dominantAction(f)]);
      }
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "rfi_ranges.csv";
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  // Editor controls
  el.editorPosSelect.addEventListener("change", () => {
    state.editor.pos = el.editorPosSelect.value;
    syncBrushButtonsForEditor();
    renderEditorGrid();
  });

  el.editorHeroPosSelect.addEventListener("change", () => {
    state.editor.heroPos = el.editorHeroPosSelect.value;
    // Re-validate villain pos for new hero
    const cfg = MATRIX_CONFIG[state.editor.matrix];
    const vills = cfg.villainPositions[state.editor.heroPos] || [];
    if (!vills.includes(state.editor.villainPos)) state.editor.villainPos = vills[0];
    populateEditorVillainSelect();
    renderEditorGrid();
  });

  el.editorVillainPosSelect.addEventListener("change", () => {
    state.editor.villainPos = el.editorVillainPosSelect.value;
    renderEditorGrid();
  });

  [el.brushRaise, el.brushBluff, el.brushCall, el.brushFold].forEach(btn => {
    btn.addEventListener("click", () => updateBrushUI(btn.dataset.action));
  });

  el.mixedFreq.addEventListener("input", () => {
    state.editor.mixedFreq = parseInt(el.mixedFreq.value, 10) / 100;
    el.mixedPctLabel.textContent = el.mixedFreq.value + "%";
  });

  el.fillRaiseBtn.addEventListener("click", () => fillPosition("RAISE"));
  el.fillFoldBtn.addEventListener("click",  () => fillPosition("FOLD"));
  el.clearPosBtn.addEventListener("click", clearPosition);

  el.exportBtn.addEventListener("click", exportRanges);
  el.exportAllBtn.addEventListener("click", exportAllRanges);
  el.importBtn.addEventListener("click", () => el.importFile.click());
  el.importFile.addEventListener("change", (e) => {
    if (e.target.files[0]) { importRanges(e.target.files[0]); e.target.value = ""; }
  });
  el.resetRangesBtn.addEventListener("click", resetToDefaults);

  // Stop painting on mouseup anywhere
  window.addEventListener("mouseup", () => { state.editor.isPainting = false; });

  // Initialize brush buttons for the default (RFI UTG) state
  syncBrushButtonsForEditor();
}

// ============================================================
// BOOT
// ============================================================
initDerived();
bind();
populateScenarioMatrixSelect();
setSaveStatus("saved");
// Resume AudioContext on first interaction (browser autoplay policy)
document.addEventListener("click", () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) new AudioCtx();
  } catch(e) {}
}, { once: true });
newQuestion();
