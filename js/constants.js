/* RFI Trainer — session-only, strict grading (top-frequency action) */
const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const POSITIONS = ["UTG", "HJ", "CO", "BTN", "SB"];
const ACTIONS = ["RAISE", "CALL", "FOLD"]; // CALL only used for SB RFI

// Card engine constants
const SUITS = ["♠", "♥", "♦", "♣"];
const SUIT_COLOR = { "♠": "black", "♥": "red", "♦": "red", "♣": "black" };
const RANK_IDX = Object.fromEntries(RANKS.map((r, i) => [r, i]));

// VS 3-Bet scenario constants
const VS3BET_ACTIONS = ["FOUR_BET", "CALL", "FOLD"];
const VS3BET_VILLAIN_POSITIONS = {
  UTG: ["CO", "BTN", "SB", "BB"],
  HJ:  ["CO", "BTN", "SB", "BB"],
  CO:  ["BTN", "SB", "BB"],
  BTN: ["SB", "BB"],
  SB:  ["BB"],
};
// Postflop action order (earlier index = acts first = OOP)
const PF_ORDER_IDX = Object.fromEntries(
  ["SB", "BB", "UTG", "HJ", "CO", "BTN"].map((p, i) => [p, i])
);

// 3-Bet matrix action sets
// VALUE_3BET = 3-betting strong hands for value; BLUFF_3BET = 3-betting for fold equity / board coverage
const THREE_BET_ACTIONS     = ["VALUE_3BET", "BLUFF_3BET", "CALL", "FOLD"];
const THREE_BET_OOP_ACTIONS = ["VALUE_3BET", "BLUFF_3BET", "FOLD"];
const FOUR_BET_ACTIONS      = ["FOUR_BET",  "CALL", "FOLD"];
const FOUR_BET_OOP_ACTIONS  = ["FOUR_BET",  "FOLD"];

// Matrix definitions — single source of truth for all four 3-bet training matrices
const MATRIX_CONFIG = {
  IP_3BET: {
    label: "IP 3-Bet", nickname: "The Sniper",
    heroPositions: ["BTN"],
    villainPositions: { BTN: ["UTG", "HJ", "CO"] },
    actions: THREE_BET_ACTIONS,
    category: "offense",
  },
  OOP_3BET: {
    label: "OOP 3-Bet", nickname: "The Hammer",
    heroPositions: ["SB"],
    villainPositions: { SB: ["UTG", "HJ", "CO", "BTN"] },
    actions: THREE_BET_OOP_ACTIONS,
    category: "offense",
  },
  IP_DEFENSE: {
    label: "IP Defense", nickname: "The Shield",
    heroPositions: ["BTN"],
    villainPositions: { BTN: ["SB", "BB"] },
    actions: FOUR_BET_ACTIONS,
    category: "defense",
  },
  OOP_DEFENSE: {
    label: "OOP Defense", nickname: "The Red Alert",
    heroPositions: ["UTG", "HJ", "CO"],
    villainPositions: {
      UTG: ["CO", "BTN", "SB", "BB"],
      HJ:  ["CO", "BTN", "SB", "BB"],
      CO:  ["BTN", "SB", "BB"],
    },
    actions: FOUR_BET_OOP_ACTIONS,
    category: "defense",
  },
};
const MATRIX_KEYS = Object.keys(MATRIX_CONFIG);
