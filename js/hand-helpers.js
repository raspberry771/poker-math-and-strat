// ============================================================
// CARD ENGINE — 52-card deck dealing
// ============================================================
function createDeck() {
  return RANKS.flatMap(rank => SUITS.map(suit => ({ rank, suit })));
}
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
function dealTwo() {
  return shuffleDeck(createDeck()).slice(0, 2);
}
function deriveCategory(c1, c2) {
  const [hi, lo] = RANK_IDX[c1.rank] <= RANK_IDX[c2.rank] ? [c1, c2] : [c2, c1];
  if (hi.rank === lo.rank) return hi.rank + lo.rank;
  return hi.rank + lo.rank + (hi.suit === lo.suit ? "s" : "o");
}
function assignSuits(handLabel) {
  const a = handLabel[0], b = handLabel[1];
  const tag = handLabel.length === 2 ? null : handLabel[2];
  if (tag === "s") {
    const suit = SUITS[Math.floor(Math.random() * 4)];
    return [{ rank: a, suit }, { rank: b, suit }];
  }
  // pair or offsuit: two different suits
  const s1 = SUITS[Math.floor(Math.random() * 4)];
  const rest = SUITS.filter(s => s !== s1);
  const s2 = rest[Math.floor(Math.random() * 3)];
  return [{ rank: a, suit: s1 }, { rank: b, suit: s2 }];
}

// ============================================================

// ============================================================
// HAND HELPERS
// ============================================================
function handLabelFromCell(r, c) {
  const a = RANKS[r], b = RANKS[c];
  if (r === c) return a + a;
  if (r < c) return a + b + "s";
  return a + b + "o";
}
function combosForHand(hand) {
  if (hand.length === 2) return 6;
  if (hand.endsWith("s")) return 4;
  if (hand.endsWith("o")) return 12;
  return 0;
}
function dominantAction(freq, acts = ACTIONS) {
  let best = acts[acts.length - 1], bestV = -1;
  for (const a of acts) {
    const v = freq[a] ?? 0;
    if (v > bestV) { bestV = v; best = a; }
  }
  return best;
}
function isMixed(freq) {
  const vals = ACTIONS.map(a => freq[a] ?? 0).filter(v => v > 0);
  return vals.length > 1;
}
function posActions(pos) {
  if (isMatrixScenario()) return MATRIX_CONFIG[state.scenario].actions;
  if (state.scenario === "VS3BET") return ["FOUR_BET", "CALL", "FOLD"];
  return pos === "SB" ? ["RAISE", "CALL", "FOLD"] : ["RAISE", "FOLD"];
}
function actionToClass(a) {
  if (a === "RAISE" || a === "FOUR_BET" || a === "VALUE_3BET") return "raise";
  if (a === "BLUFF_3BET") return "bluff";
  if (a === "CALL") return "call";
  return "fold";
}
function actionDisplayName(a) {
  if (a === "FOUR_BET")   return "4-Bet";
  if (a === "VALUE_3BET") return "Value 3-Bet";
  if (a === "BLUFF_3BET") return "Bluff 3-Bet";
  return a[0] + a.slice(1).toLowerCase();
}

function buildGridForPosition(pos) {
  const grid = Array.from({ length: 13 }, () => Array.from({ length: 13 }, () => null));
  const freqByCell = Array.from({ length: 13 }, () => Array.from({ length: 13 }, () => null));
  for (let r = 0; r < 13; r++)
    for (let c = 0; c < 13; c++) {
      const hand = handLabelFromCell(r, c);
      const freq = RANGES[pos][hand];
      grid[r][c] = dominantAction(freq);
      freqByCell[r][c] = freq;
    }
  return { grid, freqByCell };
}

function computeBorderSet(pos, grid) {
  const border = new Set();
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (let r = 0; r < 13; r++)
    for (let c = 0; c < 13; c++) {
      const a = grid[r][c];
      for (const [dr, dc] of dirs) {
        const rr = r+dr, cc = c+dc;
        if (rr < 0 || rr >= 13 || cc < 0 || cc >= 13) continue;
        if (grid[rr][cc] !== a) { border.add(handLabelFromCell(r, c)); break; }
      }
    }
  return border;
}

function neighborsForCell(r, c) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r+dr, cc = c+dc;
      if (rr < 0 || rr >= 13 || cc < 0 || cc >= 13) continue;
      out.push([rr, cc]);
    }
  return out;
}

function cellFromHand(hand) {
  for (let r = 0; r < 13; r++)
    for (let c = 0; c < 13; c++)
      if (handLabelFromCell(r, c) === hand) return [r, c];
  return null;
}

function weightedTotals(pos) {
  const totals = { RAISE: 0, CALL: 0, FOLD: 0 };
  let denom = 0;
  for (const [hand, freq] of Object.entries(RANGES[pos])) {
    const w = combosForHand(hand);
    denom += w;
    totals.RAISE += w * (freq.RAISE || 0);
    totals.CALL  += w * (freq.CALL  || 0);
    totals.FOLD  += w * (freq.FOLD  || 0);
  }
  if (denom === 0) return totals;
  totals.RAISE /= denom; totals.CALL /= denom; totals.FOLD /= denom;
  return totals;
}

// ============================================================
// SOUND ENGINE  (Web Audio API — no files needed)

// ============================================================
// CARD DISPLAY UTILITIES
// ============================================================
function parseHandToCards(hand) {
  const a = hand[0], b = hand[1];
  const tag = hand.length === 2 ? null : hand[2];
  return { a, b, tag };
}

function seatHTML(pos, label, { active = false, dim = false, showCards = "back" } = {}) {
  let cards = "";
  if (showCards === "hand" && state.current?.cards) {
    const [c1, c2] = state.current.cards;
    cards = `<div class="cards">
      <div class="card-mini ${SUIT_COLOR[c1.suit]}"><span class="rank">${c1.rank}</span><span class="suit">${c1.suit}</span></div>
      <div class="card-mini ${SUIT_COLOR[c2.suit]}"><span class="rank">${c2.rank}</span><span class="suit">${c2.suit}</span></div>
    </div>`;
  } else if (showCards === "villain") {
    cards = `<div class="cards"><div class="card-mini back villain-back"></div><div class="card-mini back villain-back"></div></div>`;
  } else if (showCards === "aggressor") {
    cards = `<div class="cards"><div class="card-mini back aggressor-back"></div><div class="card-mini back aggressor-back"></div></div>`;
  } else {
    cards = `<div class="cards">
      <div class="card-mini back"></div>
      <div class="card-mini back"></div>
    </div>`;
  }
  const extraClass = showCards === "villain" ? " villain" : showCards === "aggressor" ? " aggressor" : "";
  return `
    <div class="seat ${pos.toLowerCase()} ${active ? "active" : ""} ${dim ? "dim" : ""}${extraClass}">
      <div class="seat-chip">
        <div class="pos">${label}</div>
        <div class="stack">100</div>
      </div>
      ${cards}
    </div>`;
}

// ============================================================
