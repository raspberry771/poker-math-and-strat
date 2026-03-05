function setPhase(phase) { state.phase = phase; render(); }

function newQuestion() {
  const pos = choosePosition();
  const needsVillain = state.scenario === "VS3BET" || isMatrixScenario();
  const villainPos = needsVillain ? chooseVillainPos(pos) : null;
  const acts = getScenarioActions();

  let hand, cards;
  if (state.settings.dealMode === "live") {
    cards = dealTwo();
    hand = deriveCategory(cards[0], cards[1]);
    const ranges = getScenarioRanges(pos, villainPos);
    if (!ranges[hand]) { cards = dealTwo(); hand = deriveCategory(cards[0], cards[1]); }
  } else {
    hand = chooseHand(pos, villainPos);
    cards = assignSuits(hand);
  }

  const ranges = getScenarioRanges(pos, villainPos);
  const freq = ranges[hand] || { FOLD: 1.0 };
  const correct = dominantAction(freq, acts);
  const border = isMatrixScenario()
    ? state.derived.border.MATRIX[state.scenario]?.[pos]?.[villainPos]
    : state.scenario === "VS3BET"
    ? state.derived.border.VS3BET[pos]?.[villainPos]
    : state.derived.border.RFI[pos];
  const isBorder = border ? border.has(hand) : false;

  state.current = { pos, villainPos, hand, cards, correct, isBorder };
  setPhase("ASKING");
}

function recordResult(isCorrect) {
  const pos = state.current.pos;
  state.stats.hands += 1;
  state.stats.byPos[pos].hands += 1;
  state.stats.byScenario[state.scenario].hands += 1;
  if (isCorrect) {
    state.stats.correct += 1;
    state.stats.byPos[pos].correct += 1;
    state.stats.byScenario[state.scenario].correct += 1;
    state.stats.streak += 1;
    if (state.stats.streak > state.stats.best) state.stats.best = state.stats.streak;
    Audio.playCorrect();
    // Streak pop + milestone
    setTimeout(() => {
      popStreakCounter();
      if (MILESTONES.has(state.stats.streak)) {
        Audio.playMilestone();
        showMilestoneToast(state.stats.streak);
      }
    }, 120);
  } else {
    Audio.playWrong();
    state.stats.streak = 0;
    const key = pos + ":" + state.current.hand;
    state.stats.mistakes.set(key, (state.stats.mistakes.get(key) || 0) + 1);
  }
}

function answer(action) {
  if (state.phase !== "ASKING") return;
  state.current.user = action;
  state.current.isCorrect = action === state.current.correct;
  recordResult(state.current.isCorrect);
  setPhase("REVEAL");
}

function resetStats() {
  state.stats = {
    hands: 0, correct: 0, streak: 0, best: 0,
    byPos: Object.fromEntries(POSITIONS.map(p => [p, { hands: 0, correct: 0 }])),
    byScenario: Object.fromEntries(ALL_SCENARIO_KEYS.map(k => [k, { hands: 0, correct: 0 }])),
    mistakes: new Map(),
  };
  render();
}
