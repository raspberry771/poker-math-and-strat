// ============================================================
function isHeroIP(heroPos, villainPos) {
  return PF_ORDER_IDX[heroPos] > PF_ORDER_IDX[villainPos];
}

function computeVs3betFreq(hand, ip) {
  const tag = hand.length === 2 ? null : hand[2];
  const isPair = tag === null;
  const isSuited = tag === "s";
  const r1 = RANK_IDX[hand[0]];

  // AA, KK — always 4-bet
  if (isPair && r1 <= 1) return { FOUR_BET: 1.0, CALL: 0, FOLD: 0 };
  // QQ — value 4-bet + call mix
  if (isPair && r1 === 2) return ip
    ? { FOUR_BET: 0.35, CALL: 0.65, FOLD: 0 }
    : { FOUR_BET: 0.6,  CALL: 0.4,  FOLD: 0 };
  // JJ — mainly call
  if (isPair && r1 === 3) return ip
    ? { FOUR_BET: 0,    CALL: 1.0,  FOLD: 0 }
    : { FOUR_BET: 0.15, CALL: 0.85, FOLD: 0 };
  // TT — call IP, mixed OOP
  if (isPair && r1 === 4) return ip
    ? { FOUR_BET: 0, CALL: 1.0,  FOLD: 0 }
    : { FOUR_BET: 0, CALL: 0.45, FOLD: 0.55 };
  // 99 — call somewhat IP, fold OOP
  if (isPair && r1 === 5) return ip
    ? { FOUR_BET: 0, CALL: 0.65, FOLD: 0.35 }
    : { FOUR_BET: 0, CALL: 0,    FOLD: 1.0 };
  // 88 — small call IP, fold OOP
  if (isPair && r1 === 6) return ip
    ? { FOUR_BET: 0, CALL: 0.3, FOLD: 0.7 }
    : { FOUR_BET: 0, CALL: 0,   FOLD: 1.0 };
  // 77 and below — fold
  if (isPair) return { FOUR_BET: 0, CALL: 0, FOLD: 1.0 };

  // AK
  if (hand === "AKs") return ip
    ? { FOUR_BET: 0.5,  CALL: 0.5,  FOLD: 0 }
    : { FOUR_BET: 0.75, CALL: 0.25, FOLD: 0 };
  if (hand === "AKo") return ip
    ? { FOUR_BET: 0.4,  CALL: 0.6,  FOLD: 0 }
    : { FOUR_BET: 0.65, CALL: 0.35, FOLD: 0 };

  // AQ
  if (hand === "AQs") return ip
    ? { FOUR_BET: 0, CALL: 1.0,  FOLD: 0 }
    : { FOUR_BET: 0, CALL: 0.7,  FOLD: 0.3 };
  if (hand === "AQo") return ip
    ? { FOUR_BET: 0, CALL: 0.65, FOLD: 0.35 }
    : { FOUR_BET: 0, CALL: 0.25, FOLD: 0.75 };

  // AJ
  if (hand === "AJs") return ip
    ? { FOUR_BET: 0, CALL: 0.85, FOLD: 0.15 }
    : { FOUR_BET: 0, CALL: 0.4,  FOLD: 0.6 };
  if (hand === "AJo") return ip
    ? { FOUR_BET: 0, CALL: 0.4, FOLD: 0.6 }
    : { FOUR_BET: 0, CALL: 0,   FOLD: 1.0 };

  // AT
  if (hand === "ATs") return ip
    ? { FOUR_BET: 0, CALL: 0.65, FOLD: 0.35 }
    : { FOUR_BET: 0, CALL: 0.2,  FOLD: 0.8 };

  // Ax suited — bluff 4-bets with ace blocker (A5s–A2s)
  if (isSuited && hand[0] === "A") {
    const r2 = RANK_IDX[hand[1]];
    if (r2 === 9)  return { FOUR_BET: 0.75, CALL: 0, FOLD: 0.25 }; // A5s
    if (r2 === 10) return { FOUR_BET: 0.55, CALL: 0, FOLD: 0.45 }; // A4s
    if (r2 === 11) return { FOUR_BET: 0.35, CALL: 0, FOLD: 0.65 }; // A3s
    if (r2 === 12) return { FOUR_BET: 0.2,  CALL: 0, FOLD: 0.8  }; // A2s
  }

  // KQ
  if (hand === "KQs") return ip
    ? { FOUR_BET: 0, CALL: 0.8,  FOLD: 0.2 }
    : { FOUR_BET: 0, CALL: 0.35, FOLD: 0.65 };
  if (hand === "KQo") return ip
    ? { FOUR_BET: 0, CALL: 0.35, FOLD: 0.65 }
    : { FOUR_BET: 0, CALL: 0,    FOLD: 1.0 };

  // KJs
  if (hand === "KJs") return ip
    ? { FOUR_BET: 0, CALL: 0.5, FOLD: 0.5 }
    : { FOUR_BET: 0, CALL: 0,   FOLD: 1.0 };

  // QJs
  if (hand === "QJs") return ip
    ? { FOUR_BET: 0, CALL: 0.4, FOLD: 0.6 }
    : { FOUR_BET: 0, CALL: 0,   FOLD: 1.0 };

  // JTs
  if (hand === "JTs") return ip
    ? { FOUR_BET: 0, CALL: 0.35, FOLD: 0.65 }
    : { FOUR_BET: 0, CALL: 0,    FOLD: 1.0 };

  return { FOUR_BET: 0, CALL: 0, FOLD: 1.0 };
}

function buildVs3betRanges() {
  const result = {};
  for (const heroPos of POSITIONS) {
    result[heroPos] = {};
    for (const villainPos of (VS3BET_VILLAIN_POSITIONS[heroPos] || [])) {
      result[heroPos][villainPos] = {};
      const ip = isHeroIP(heroPos, villainPos);
      for (const hand of Object.keys(RANGES[heroPos])) {
        const heroFreq = RANGES[heroPos][hand];
        if (dominantAction(heroFreq) === "FOLD") {
          result[heroPos][villainPos][hand] = { FOUR_BET: 0, CALL: 0, FOLD: 1.0 };
        } else {
          result[heroPos][villainPos][hand] = computeVs3betFreq(hand, ip);
        }
      }
    }
  }
  return result;
}

const VS3BET_RANGES = buildVs3betRanges();

// ============================================================
// 3-BET MATRIX RANGES — blank slate (all FOLD), user paints them
// ============================================================
function buildThreebetRanges() {
  const result = {};
  for (const [matrix, cfg] of Object.entries(MATRIX_CONFIG)) {
    result[matrix] = {};
    for (const heroPos of cfg.heroPositions) {
      result[matrix][heroPos] = {};
      for (const villainPos of (cfg.villainPositions[heroPos] || [])) {
        result[matrix][heroPos][villainPos] = {};
        for (let r = 0; r < 13; r++)
          for (let c = 0; c < 13; c++) {
            const hand = handLabelFromCell(r, c);
            const freq = Object.fromEntries(cfg.actions.map(a => [a, a === "FOLD" ? 1.0 : 0]));
            result[matrix][heroPos][villainPos][hand] = freq;
          }
      }
    }
  }
  return result;
}
let THREBET_RANGES = buildThreebetRanges();
