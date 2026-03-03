/* RFI Trainer — session-only, strict grading (top-frequency action) */
const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const POSITIONS = ["UTG", "HJ", "CO", "BTN", "SB"];
const ACTIONS = ["RAISE", "CALL", "FOLD"]; // CALL only used for SB

// Hardcoded ranges extracted from your charts (frequency-based per hand).
const RANGES = {
  UTG: {
    AA: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AKs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AQs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AJs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    ATs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A6s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A5s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A4s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A3s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A2s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KK: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KQs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KJs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K6s: { RAISE: 0.7707, CALL: 0.0, FOLD: 0.2293 },
    K5s: { RAISE: 0.0811, CALL: 0.0, FOLD: 0.9189 },
    K4s: { RAISE: 0.54, CALL: 0.0, FOLD: 0.46 },
    K3s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    K2s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    QAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QKo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QQ: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QJs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q9s: { RAISE: 0.5827, CALL: 0.0, FOLD: 0.4173 },
    Q8s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    Q7s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    Q6s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    Q5s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    Q4s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    Q3s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    Q2s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    JAo: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    JKo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JQo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JJ: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J9s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J8s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J7s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J6s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J5s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J4s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J3s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J2s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    TAo: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    TKo: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    TQo: { RAISE: 0.492, CALL: 0.0, FOLD: 0.508 },
    TJo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    TT: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    T9s: { RAISE: 0.3463, CALL: 0.0, FOLD: 0.6537 },
    T8s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T7s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T6s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T5s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T4s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T3s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T2s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9To": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    99: { RAISE: 0.7644, CALL: 0.0, FOLD: 0.2356 },
    "98s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "97s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "96s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "95s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "94s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "93s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "92s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "89o": { RAISE: 0.6501, CALL: 0.0, FOLD: 0.3499 },
    88: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "87s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "86s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "85s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "84s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "83s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "82s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "79o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "78o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    77: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "76s": { RAISE: 0.483, CALL: 0.0, FOLD: 0.517 },
    "75s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "74s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "73s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "72s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "69o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "68o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "67o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    66: { RAISE: 0.7713, CALL: 0.0, FOLD: 0.2287 },
    "65s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "64s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "63s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "62s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "59o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "58o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "57o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "56o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    55: { RAISE: 0.0811, CALL: 0.0, FOLD: 0.9189 },
    "54s": { RAISE: 0.5246, CALL: 0.0, FOLD: 0.4754 },
    "53s": { RAISE: 0.1809, CALL: 0.0, FOLD: 0.8191 },
    "52s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "49o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "48o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "47o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "46o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "45o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    44: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "43s": { RAISE: 0.4415, CALL: 0.0, FOLD: 0.5585 },
    "42s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "39o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "38o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "37o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "36o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "35o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "34o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    33: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "32s": { RAISE: 0.2151, CALL: 0.0, FOLD: 0.7849 },
    "2Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "29o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "28o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "27o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "26o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "25o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "24o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "23o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    22: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
  },
  HJ: {
    AA: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AKs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AQs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AJs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    ATs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A6s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A5s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A4s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A3s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A2s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KK: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KQs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KJs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K6s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K5s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K4s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K3s: { RAISE: 0.4255, CALL: 0.0, FOLD: 0.5745 },
    K2s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    QAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QKo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QQ: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QJs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q7s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    Q6s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    Q5s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    Q4s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    Q3s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    Q2s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    JAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JKo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JQo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JJ: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J8s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J7s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J6s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J5s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J4s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J3s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J2s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    TAo: { RAISE: 0.3264, CALL: 0.0, FOLD: 0.6736 },
    TKo: { RAISE: 0.6471, CALL: 0.0, FOLD: 0.3529 },
    TQo: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    TJo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    TT: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    T9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    T8s: { RAISE: 0.8317, CALL: 0.0, FOLD: 0.1683 },
    T7s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T6s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T5s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T4s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T3s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T2s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9To": { RAISE: 0.7696, CALL: 0.0, FOLD: 0.2304 },
    99: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "98s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "97s": { RAISE: 0.03, CALL: 0.0, FOLD: 0.97 },
    "96s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "95s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "94s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "93s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "92s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "89o": { RAISE: 0.0286, CALL: 0.0, FOLD: 0.9714 },
    88: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "87s": { RAISE: 0.4094, CALL: 0.0, FOLD: 0.5906 },
    "86s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "85s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "84s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "83s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "82s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "79o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "78o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    77: { RAISE: 0.9433, CALL: 0.0, FOLD: 0.0567 },
    "76s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "75s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "74s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "73s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "72s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "69o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "68o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "67o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    66: { RAISE: 0.1862, CALL: 0.0, FOLD: 0.8138 },
    "65s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "64s": { RAISE: 0.1639, CALL: 0.0, FOLD: 0.8361 },
    "63s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "62s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "59o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "58o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "57o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "56o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    55: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "54s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "53s": { RAISE: 0.8214, CALL: 0.0, FOLD: 0.1786 },
    "52s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "49o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "48o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "47o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "46o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "45o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    44: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "43s": { RAISE: 0.3352, CALL: 0.0, FOLD: 0.6648 },
    "42s": { RAISE: 0.0811, CALL: 0.0, FOLD: 0.9189 },
    "3Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "39o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "38o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "37o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "36o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "35o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "34o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    33: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "32s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "29o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "28o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "27o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "26o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "25o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "24o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "23o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    22: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
  },
  CO: {
    AA: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AKs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AQs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AJs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    ATs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A6s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A5s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A4s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A3s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A2s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KK: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KQs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KJs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K6s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K5s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K4s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K3s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K2s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QKo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QQ: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QJs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q6s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q5s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q4s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q3s: { RAISE: 0.1171, CALL: 0.0, FOLD: 0.8829 },
    Q2s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    JAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JKo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JQo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JJ: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J6s: { RAISE: 0.5004, CALL: 0.0, FOLD: 0.4996 },
    J5s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J4s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J3s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    J2s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    TAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    TKo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    TQo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    TJo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    TT: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    T9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    T8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    T7s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T6s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T5s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T4s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T3s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T2s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9Ko": { RAISE: 0.0266, CALL: 0.0, FOLD: 0.9734 },
    "9Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9To": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    99: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "98s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "97s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "96s": { RAISE: 0.277, CALL: 0.0, FOLD: 0.723 },
    "95s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "94s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "93s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "92s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "89o": { RAISE: 0.577, CALL: 0.0, FOLD: 0.423 },
    88: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "87s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "86s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "85s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "84s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "83s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "82s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "79o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "78o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    77: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "76s": { RAISE: 0.7775, CALL: 0.0, FOLD: 0.2225 },
    "75s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "74s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "73s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "72s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "69o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "68o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "67o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    66: { RAISE: 0.727, CALL: 0.0, FOLD: 0.273 },
    "65s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "64s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "63s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "62s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "59o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "58o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "57o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "56o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    55: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "54s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "53s": { RAISE: 0.4532, CALL: 0.0, FOLD: 0.5468 },
    "52s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "49o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "48o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "47o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "46o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "45o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    44: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "43s": { RAISE: 0.8854, CALL: 0.0, FOLD: 0.1146 },
    "42s": { RAISE: 0.8649, CALL: 0.0, FOLD: 0.1351 },
    "3Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "39o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "38o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "37o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "36o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "35o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "34o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    33: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "32s": { RAISE: 0.1351, CALL: 0.0, FOLD: 0.8649 },
    "2Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "29o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "28o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "27o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "26o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "25o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "24o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "23o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    22: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
  },
  BTN: {
    AA: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AKs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AQs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AJs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    ATs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A6s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A5s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A4s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A3s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A2s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KK: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KQs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KJs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K6s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K5s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K4s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K3s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K2s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QKo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QQ: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QJs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q6s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q5s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q4s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q3s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q2s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JKo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JQo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JJ: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J6s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J5s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J4s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J3s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J2s: { RAISE: 0.6928, CALL: 0.0, FOLD: 0.3072 },
    TAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    TKo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    TQo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    TJo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    TT: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    T9s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    T8s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    T7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    T6s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    T5s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    T4s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T3s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    T2s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9Ao": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "9Ko": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "9Qo": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "9Jo": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "9To": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    99: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "98s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "97s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "96s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "95s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "94s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "93s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "92s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Ko": { RAISE: 0.4184, CALL: 0.0, FOLD: 0.5816 },
    "8Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Jo": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "8To": { RAISE: 0.1523, CALL: 0.0, FOLD: 0.8477 },
    "89o": { RAISE: 0.0811, CALL: 0.0, FOLD: 0.9189 },
    88: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "87s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "86s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "85s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "84s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "83s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "82s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "79o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "78o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    77: { RAISE: 0.9429, CALL: 0.0, FOLD: 0.0571 },
    "76s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "75s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "74s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "73s": { RAISE: 0.2814, CALL: 0.0, FOLD: 0.7186 },
    "72s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "69o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "68o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "67o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    66: { RAISE: 0.1944, CALL: 0.0, FOLD: 0.8056 },
    "65s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "64s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "63s": { RAISE: 0.6748, CALL: 0.0, FOLD: 0.3252 },
    "62s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "59o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "58o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "57o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "56o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    55: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "54s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "53s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "52s": { RAISE: 0.6366, CALL: 0.0, FOLD: 0.3634 },
    "4Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "49o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "48o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "47o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "46o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "45o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    44: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "43s": { RAISE: 0.332, CALL: 0.0, FOLD: 0.668 },
    "42s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "3Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "39o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "38o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "37o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "36o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "35o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "34o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    33: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "32s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "29o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "28o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "27o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "26o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "25o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "24o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "23o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    22: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
  },
  SB: {
    AA: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AKs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AQs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    AJs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    ATs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A9s: { RAISE: 0.6674, CALL: 0.3326, FOLD: 0.0 },
    A8s: { RAISE: 0.7429, CALL: 0.2571, FOLD: 0.0 },
    A7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A6s: { RAISE: 0.6511, CALL: 0.3489, FOLD: 0.0 },
    A5s: { RAISE: 0.3135, CALL: 0.6865, FOLD: 0.0 },
    A4s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    A3s: { RAISE: 0.8, CALL: 0.2, FOLD: 0.0 },
    A2s: { RAISE: 0.3514, CALL: 0.6486, FOLD: 0.0 },
    KAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KK: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KQs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    KJs: { RAISE: 0.8606, CALL: 0.1394, FOLD: 0.0 },
    KTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K9s: { RAISE: 0.5256, CALL: 0.4744, FOLD: 0.0 },
    K8s: { RAISE: 0.6389, CALL: 0.3611, FOLD: 0.0 },
    K7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K6s: { RAISE: 0.6509, CALL: 0.3491, FOLD: 0.0 },
    K5s: { RAISE: 0.8333, CALL: 0.1667, FOLD: 0.0 },
    K4s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    K3s: { RAISE: 0.7994, CALL: 0.2006, FOLD: 0.0 },
    K2s: { RAISE: 0.6944, CALL: 0.3056, FOLD: 0.0 },
    QAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QKo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    QQ: { RAISE: 0.4462, CALL: 0.5538, FOLD: 0.0 },
    QJs: { RAISE: 0.5912, CALL: 0.4088, FOLD: 0.0 },
    QTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q9s: { RAISE: 0.5263, CALL: 0.4737, FOLD: 0.0 },
    Q8s: { RAISE: 0.9429, CALL: 0.0571, FOLD: 0.0 },
    Q7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q6s: { RAISE: 0.7377, CALL: 0.2623, FOLD: 0.0 },
    Q5s: { RAISE: 0.8333, CALL: 0.1667, FOLD: 0.0 },
    Q4s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    Q3s: { RAISE: 0.7989, CALL: 0.2011, FOLD: 0.0 },
    Q2s: { RAISE: 0.6944, CALL: 0.3056, FOLD: 0.0 },
    JAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JKo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    JQo: { RAISE: 0.768, CALL: 0.232, FOLD: 0.0 },
    JJ: { RAISE: 0.5946, CALL: 0.4054, FOLD: 0.0 },
    JTs: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J9s: { RAISE: 0.5256, CALL: 0.4744, FOLD: 0.0 },
    J8s: { RAISE: 0.8611, CALL: 0.1389, FOLD: 0.0 },
    J7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J6s: { RAISE: 0.7964, CALL: 0.2036, FOLD: 0.0 },
    J5s: { RAISE: 0.7297, CALL: 0.2703, FOLD: 0.0 },
    J4s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    J3s: { RAISE: 0.803, CALL: 0.197, FOLD: 0.0 },
    J2s: { RAISE: 0.2778, CALL: 0.7222, FOLD: 0.0 },
    TAo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    TKo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    TQo: { RAISE: 0.6516, CALL: 0.3484, FOLD: 0.0 },
    TJo: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    TT: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    T9s: { RAISE: 0.5357, CALL: 0.4643, FOLD: 0.0 },
    T8s: { RAISE: 0.5833, CALL: 0.4167, FOLD: 0.0 },
    T7s: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    T6s: { RAISE: 0.7622, CALL: 0.2378, FOLD: 0.0 },
    T5s: { RAISE: 0.8333, CALL: 0.1667, FOLD: 0.0 },
    T4s: { RAISE: 0.323, CALL: 0.677, FOLD: 0.0 },
    T3s: { RAISE: 0.0, CALL: 0.6369, FOLD: 0.3631 },
    T2s: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "9Ao": { RAISE: 0.8859, CALL: 0.1141, FOLD: 0.0 },
    "9Ko": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "9Qo": { RAISE: 0.3796, CALL: 0.6204, FOLD: 0.0 },
    "9Jo": { RAISE: 0.8316, CALL: 0.1684, FOLD: 0.0 },
    "9To": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    99: { RAISE: 0.526, CALL: 0.474, FOLD: 0.0 },
    "98s": { RAISE: 0.6286, CALL: 0.3714, FOLD: 0.0 },
    "97s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "96s": { RAISE: 0.8544, CALL: 0.1456, FOLD: 0.0 },
    "95s": { RAISE: 0.8108, CALL: 0.1892, FOLD: 0.0 },
    "94s": { RAISE: 0.5067, CALL: 0.4933, FOLD: 0.0 },
    "93s": { RAISE: 0.0, CALL: 0.2025, FOLD: 0.7975 },
    "92s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "8Ao": { RAISE: 0.0, CALL: 0.9711, FOLD: 0.0289 },
    "8Ko": { RAISE: 0.6856, CALL: 0.3144, FOLD: 0.0 },
    "8Qo": { RAISE: 0.3793, CALL: 0.0, FOLD: 0.6207 },
    "8Jo": { RAISE: 0.5633, CALL: 0.4367, FOLD: 0.0 },
    "8To": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "89o": { RAISE: 0.5237, CALL: 0.4763, FOLD: 0.0 },
    88: { RAISE: 0.5556, CALL: 0.4444, FOLD: 0.0 },
    "87s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "86s": { RAISE: 0.7655, CALL: 0.2345, FOLD: 0.0 },
    "85s": { RAISE: 0.7568, CALL: 0.2432, FOLD: 0.0 },
    "84s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "83s": { RAISE: 0.0, CALL: 0.2027, FOLD: 0.7973 },
    "82s": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7Qo": { RAISE: 0.0, CALL: 0.113, FOLD: 0.887 },
    "7Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "7To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "79o": { RAISE: 0.2264, CALL: 0.2826, FOLD: 0.491 },
    "78o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    77: { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "76s": { RAISE: 0.6545, CALL: 0.3455, FOLD: 0.0 },
    "75s": { RAISE: 0.8333, CALL: 0.1667, FOLD: 0.0 },
    "74s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "73s": { RAISE: 0.8024, CALL: 0.1976, FOLD: 0.0 },
    "72s": { RAISE: 0.0, CALL: 0.9189, FOLD: 0.0811 },
    "6Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "6To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "69o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "68o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "67o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    66: { RAISE: 0.6494, CALL: 0.0, FOLD: 0.3506 },
    "65s": { RAISE: 0.3889, CALL: 0.6111, FOLD: 0.0 },
    "64s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "63s": { RAISE: 0.8006, CALL: 0.1994, FOLD: 0.0 },
    "62s": { RAISE: 0.2432, CALL: 0.6757, FOLD: 0.0811 },
    "5Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "5To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "59o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "58o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "57o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "56o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    55: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "54s": { RAISE: 1.0, CALL: 0.0, FOLD: 0.0 },
    "53s": { RAISE: 0.8005, CALL: 0.1995, FOLD: 0.0 },
    "52s": { RAISE: 0.4054, CALL: 0.5946, FOLD: 0.0 },
    "4Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "4To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "49o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "48o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "47o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "46o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "45o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    44: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "43s": { RAISE: 0.8003, CALL: 0.0, FOLD: 0.1997 },
    "42s": { RAISE: 0.3243, CALL: 0.5946, FOLD: 0.0811 },
    "3Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "3To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "39o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "38o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "37o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "36o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "35o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "34o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    33: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "32s": { RAISE: 0.0811, CALL: 0.0, FOLD: 0.9189 },
    "2Ao": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Ko": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Qo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2Jo": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "2To": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "29o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "28o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "27o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "26o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "25o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "24o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    "23o": { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
    22: { RAISE: 0.0, CALL: 0.0, FOLD: 1.0 },
  },
};

// ============================================================
// DEFAULT RANGES — used for "Reset to defaults"
// ============================================================
const DEFAULT_RANGES = JSON.parse(JSON.stringify(RANGES));

// ============================================================
// LOCALSTORAGE — load saved ranges on startup
// ============================================================
(function loadSavedRanges() {
  try {
    const saved = localStorage.getItem('rfi_ranges');
    if (!saved) return;
    const parsed = JSON.parse(saved);
    // Validate: must have all 5 positions with hand data
    const positions = ["UTG","HJ","CO","BTN","SB"];
    const ok = positions.every(p =>
      parsed[p] && typeof parsed[p] === 'object' && Object.keys(parsed[p]).length > 10
    );
    if (!ok) {
      console.warn('RFI Trainer: saved ranges failed validation, using defaults');
      return;
    }
    for (const pos of positions) {
      RANGES[pos] = parsed[pos];
    }
    console.log('RFI Trainer: loaded saved ranges from localStorage');
  } catch(e) {
    console.warn('RFI Trainer: could not load saved ranges:', e.message);
  }
})();

function saveRangesToStorage() {
  try {
    // Deep clone to ensure we capture current state, not references
    const snapshot = JSON.parse(JSON.stringify(RANGES));
    localStorage.setItem('rfi_ranges', JSON.stringify(snapshot));
    setSaveStatus('saved');
  } catch(e) {
    console.error('RFI Trainer: save failed:', e.message);
    setSaveStatus('error');
  }
}

// Call this in browser console to debug: window.debugRanges()
window.debugRanges = function() {
  const saved = localStorage.getItem('rfi_ranges');
  if (!saved) { console.log('Nothing saved in localStorage'); return; }
  const parsed = JSON.parse(saved);
  console.log('Saved positions:', Object.keys(parsed));
  console.log('UTG AA:', parsed.UTG?.AA);
  console.log('Total UTG hands:', Object.keys(parsed.UTG || {}).length);
};

function setSaveStatus(status) {
  const dot = document.getElementById('saveDot');
  const txt = document.getElementById('saveStatusText');
  if (!dot || !txt) return;
  dot.className = 'save-dot ' + status;
  txt.textContent = status === 'saved' ? 'Saved to browser'
    : status === 'saving' ? 'Saving...'
    : 'Error saving';
}

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
function dominantAction(freq) {
  let best = "FOLD", bestV = -1;
  for (const a of ACTIONS) {
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
  return pos === "SB" ? ["RAISE", "CALL", "FOLD"] : ["RAISE", "FOLD"];
}
function actionToClass(a) {
  if (a === "RAISE") return "raise";
  if (a === "CALL") return "call";
  return "fold";
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
const Audio = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function resume() {
    const c = getCtx();
    if (c.state === "suspended") c.resume();
  }

  // Soft ding — correct answer
  function playCorrect() {
    try {
      resume();
      const c = getCtx();
      const t = c.currentTime;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1320, t + 0.08);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      osc.start(t); osc.stop(t + 0.45);
    } catch(e) {}
  }

  // Low thud — wrong answer
  function playWrong() {
    try {
      resume();
      const c = getCtx();
      const t = c.currentTime;
      // Low sine drop
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.18);
      gain.gain.setValueAtTime(0.0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.start(t); osc.stop(t + 0.3);
    } catch(e) {}
  }

  // Ascending chime — milestone streak
  function playMilestone() {
    try {
      resume();
      const c = getCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      notes.forEach((freq, i) => {
        const t = c.currentTime + i * 0.1;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain); gain.connect(c.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        osc.start(t); osc.stop(t + 0.38);
      });
    } catch(e) {}
  }

  return { playCorrect, playWrong, playMilestone };
})();

// ============================================================
// ANIMATION HELPERS
// ============================================================

// Milestone streak thresholds
const MILESTONES = new Set([5, 10, 25, 50, 100]);

// Create or reuse milestone toast element
let _toastEl = null;
function getToast() {
  if (!_toastEl) {
    _toastEl = document.createElement("div");
    _toastEl.className = "milestone-toast";
    document.body.appendChild(_toastEl);
  }
  return _toastEl;
}

function showMilestoneToast(streak) {
  const toast = getToast();
  const labels = { 5:"🔥 5 in a row!", 10:"⚡ 10 streak!", 25:"🎯 25 streak!", 50:"🏆 50 streak!", 100:"👑 100 streak!" };
  toast.textContent = labels[streak] || `🔥 ${streak} streak!`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function popStreakCounter() {
  el.statStreak.classList.remove("pop");
  // Force reflow so the animation restarts if already playing
  void el.statStreak.offsetWidth;
  el.statStreak.classList.add("pop");
  el.statStreak.addEventListener("animationend", () => el.statStreak.classList.remove("pop"), { once: true });
}

// Trigger chip pulse on the active seat after renderTable
function triggerChipPulse() {
  const chip = el.tableStage.querySelector(".seat.active .seat-chip");
  if (!chip) return;
  chip.classList.remove("pulse");
  void chip.offsetWidth; // reflow
  chip.classList.add("pulse");
}

// Add deal classes to the active seat's cards after renderTable
function triggerCardDeal() {
  const cards = el.tableStage.querySelectorAll(".seat.active .card-mini");
  cards.forEach((c, i) => {
    c.classList.remove("deal-1", "deal-2");
    void c.offsetWidth;
    c.classList.add(i === 0 ? "deal-1" : "deal-2");
  });
}

// transitionQuestion removed — card deal animation is the transition

// ============================================================
// STATE
// ============================================================
const state = {
  view: "trainer", // "trainer" | "editor"
  settings: {
    mode: "random",
    position: "UTG",
    edgeWeight: 0.7,
    showGrid: true,
    showNeighbors: true,
    debug: false,
  },
  derived: { grids: {}, freqs: {}, border: {} },
  current: null,
  phase: "ASKING",
  stats: {
    hands: 0, correct: 0, streak: 0, best: 0,
    byPos: Object.fromEntries(POSITIONS.map(p => [p, { hands: 0, correct: 0 }])),
    mistakes: new Map(),
  },
  editor: {
    pos: "UTG",
    brush: "RAISE",
    mixedFreq: 0.5,
    isPainting: false,
  },
};

function initDerived() {
  for (const pos of POSITIONS) {
    const { grid, freqByCell } = buildGridForPosition(pos);
    state.derived.grids[pos] = grid;
    state.derived.freqs[pos] = freqByCell;
    state.derived.border[pos] = computeBorderSet(pos, grid);
  }
}

// ============================================================
// TRAINER LOGIC
// ============================================================
function choosePosition() {
  if (state.settings.mode === "single") return state.settings.position;
  return POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
}

function chooseHand(pos) {
  const edgeP = state.settings.edgeWeight;
  const allHands = Object.keys(RANGES[pos]);
  if (Math.random() < edgeP) {
    const arr = Array.from(state.derived.border[pos]);
    return arr[Math.floor(Math.random() * arr.length)];
  }
  return allHands[Math.floor(Math.random() * allHands.length)];
}

function setPhase(phase) { state.phase = phase; render(); }

function newQuestion() {
  const pos = choosePosition();
  const hand = chooseHand(pos);
  const correct = dominantAction(RANGES[pos][hand]);
  const isBorder = state.derived.border[pos].has(hand);
  state.current = { pos, hand, correct, isBorder };
  setPhase("ASKING");
}

function recordResult(isCorrect) {
  const pos = state.current.pos;
  state.stats.hands += 1;
  state.stats.byPos[pos].hands += 1;
  if (isCorrect) {
    state.stats.correct += 1;
    state.stats.byPos[pos].correct += 1;
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
    mistakes: new Map(),
  };
  render();
}

// ============================================================
// EDITOR LOGIC
// ============================================================

// Cycle: RAISE → FOLD → (CALL if SB) → RAISE
function cycleAction(hand, pos) {
  const freq = RANGES[pos][hand];
  const dom = dominantAction(freq);
  const actions = pos === "SB" ? ["RAISE", "FOLD", "CALL"] : ["RAISE", "FOLD"];
  const idx = actions.indexOf(dom);
  return actions[(idx + 1) % actions.length];
}

function paintCell(hand, pos, shiftKey) {
  const brush = state.editor.brush;
  const mf = state.editor.mixedFreq;

  if (shiftKey) {
    // Shift+paint: set a mixed frequency between brush action and the "other" dominant
    const current = dominantAction(RANGES[pos][hand]);
    const other = current === brush ? (pos === "SB" ? "FOLD" : "FOLD") : current;
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
  const pos = state.editor.pos;
  paintCell(hand, pos, shiftKey);
  // Rebuild derived for this position
  const { grid, freqByCell } = buildGridForPosition(pos);
  state.derived.grids[pos] = grid;
  state.derived.freqs[pos] = freqByCell;
  state.derived.border[pos] = computeBorderSet(pos, grid);
  setSaveStatus('saving');
  saveRangesToStorage();
  renderEditorGrid();
}

function fillPosition(action) {
  const pos = state.editor.pos;
  for (const hand of Object.keys(RANGES[pos])) {
    RANGES[pos][hand] = { RAISE: 0, CALL: 0, FOLD: 0, [action]: 1.0 };
  }
  const { grid, freqByCell } = buildGridForPosition(pos);
  state.derived.grids[pos] = grid;
  state.derived.freqs[pos] = freqByCell;
  state.derived.border[pos] = computeBorderSet(pos, grid);
  saveRangesToStorage();
  renderEditorGrid();
}

function clearPosition() {
  fillPosition("FOLD");
}

function exportRanges() {
  const pos = state.editor.pos;
  // Export only the currently selected position, named after it
  const data = { [pos]: RANGES[pos] };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rfi_${pos.toLowerCase()}_range.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportAllRanges() {
  const json = JSON.stringify(RANGES, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rfi_all_ranges.json";
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
      const ok = positions.every(p => parsed[p]);
      if (!ok) { alert("Invalid ranges file — missing one or more positions."); return; }
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
// ============================================================
function parseHandToCards(hand) {
  const a = hand[0], b = hand[1];
  const tag = hand.length === 2 ? null : hand[2];
  return { a, b, tag };
}

function seatHTML(pos, label, { active = false, dim = false, showCards = "back" } = {}) {
  let cards = "";
  if (showCards === "hand") {
    const { a, b, tag } = parseHandToCards(state.current.hand);
    const suit1 = "♠";
    const suit2 = tag === "o" ? "♥" : "♠";
    const isRed2 = suit2 === "♥";
    cards = `<div class="cards">
      <div class="card-mini black"><span class="rank">${a}</span><span class="suit">${suit1}</span></div>
      <div class="card-mini ${isRed2 ? "red" : "black"}"><span class="rank">${b}</span><span class="suit">${suit2}</span></div>
    </div>`;
  } else if (showCards === "back") {
    cards = `<div class="cards">
      <div class="card-mini back"></div>
      <div class="card-mini back"></div>
    </div>`;
  }
  return `
    <div class="seat ${pos.toLowerCase()} ${active ? "active" : ""} ${dim ? "dim" : ""}">
      <div class="seat-chip">
        <div class="pos">${label}</div>
        <div class="stack">100</div>
      </div>
      ${cards}
    </div>`;
}

// ============================================================
// EL — DOM REFERENCES
// ============================================================
const el = {
  // Tabs & views
  tabTrainer:        document.getElementById("tabTrainer"),
  tabEditor:         document.getElementById("tabEditor"),
  viewTrainer:       document.getElementById("viewTrainer"),
  viewEditor:        document.getElementById("viewEditor"),
  sidebarTrainer:    document.getElementById("sidebarTrainer"),
  sidebarEditor:     document.getElementById("sidebarEditor"),

  // Trainer controls
  modeSelect:        document.getElementById("modeSelect"),
  positionField:     document.getElementById("positionField"),
  positionSelect:    document.getElementById("positionSelect"),
  edgeWeight:        document.getElementById("edgeWeight"),
  edgePctLabel:      document.getElementById("edgePctLabel"),
  showGridToggle:    document.getElementById("showGridToggle"),
  showNeighborsToggle: document.getElementById("showNeighborsToggle"),
  debugToggle:       document.getElementById("debugToggle"),
  resetBtn:          document.getElementById("resetBtn"),

  // Trainer display
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
  editorPosSelect:   document.getElementById("editorPosSelect"),
  editorPosLabel:    document.getElementById("editorPosLabel"),
  brushRaise:        document.getElementById("brushRaise"),
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

// ============================================================
// VIEW SWITCHING
// ============================================================
function switchView(view) {
  state.view = view;
  el.viewTrainer.hidden  = view !== "trainer";
  el.viewEditor.hidden   = view !== "editor";
  el.sidebarTrainer.hidden = view !== "trainer";
  el.sidebarEditor.hidden  = view !== "editor";
  el.tabTrainer.classList.toggle("active", view === "trainer");
  el.tabEditor.classList.toggle("active", view === "editor");
  if (view === "editor") {
    renderEditorGrid();
    setSaveStatus("saved");
  }
}

// ============================================================
// RENDER — TRAINER
// ============================================================
function renderTable() {
  const pos = state.current?.pos || "UTG";
  const reveal = state.phase === "REVEAL";
  const seats = [
    { key: "UTG", cls: "utg", label: "UTG" },
    { key: "HJ",  cls: "hj",  label: "HJ"  },
    { key: "CO",  cls: "co",  label: "CO"  },
    { key: "BTN", cls: "seat-btn", label: "BTN" },
    { key: "SB",  cls: "sb",  label: "SB"  },
    { key: "BB",  cls: "bb",  label: "BB"  },
  ];
  const seatBlocks = seats.map(s => seatHTML(s.cls, s.label, {
    active: s.key === pos,
    dim: s.key === "BB",
    showCards: s.key === pos ? "hand" : "back",
  })).join("");
  el.tableStage.innerHTML = `
    <div class="poker-table">
      ${seatBlocks}
      <div class="table-center">
        <div class="pot">RFI spot</div>
        <div class="hint">${reveal ? "Reveal shown below" : "Choose Raise / Fold"}</div>
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
  const mapKbd = a => a === "RAISE" ? "1" : a === "CALL" ? "2" : pos === "SB" ? "3" : "2";
  for (const a of acts) {
    const btn = document.createElement("button");
    btn.className = `action-btn ${actionToClass(a)}`;
    btn.innerHTML = `<span>${a}</span><span class="kbd">${mapKbd(a)}</span>`;
    btn.disabled = state.phase !== "ASKING";
    btn.addEventListener("click", () => answer(a));
    el.actionButtons.appendChild(btn);
  }
}

function renderGrid() {
  const pos = state.current.pos;
  const grid = state.derived.grids[pos];
  const [r, c] = cellFromHand(state.current.hand);
  el.gridWrap.innerHTML = "";
  for (let rr = 0; rr < 13; rr++)
    for (let cc = 0; cc < 13; cc++) {
      const hand = handLabelFromCell(rr, cc);
      const freq = RANGES[pos][hand];
      const dom = grid[rr][cc];
      const cell = document.createElement("div");
      cell.className = `cell ${actionToClass(dom)}${rr === r && cc === c ? " active" : ""}`;
      cell.textContent = hand;
      const bar = document.createElement("div"); bar.className = "bar";
      const segR = document.createElement("div"); segR.className = "seg raise"; segR.style.width = `${Math.round((freq.RAISE||0)*100)}%`;
      const segC = document.createElement("div"); segC.className = "seg call";  segC.style.width = `${Math.round((freq.CALL ||0)*100)}%`;
      const segF = document.createElement("div"); segF.className = "seg fold";  segF.style.width = `${Math.round((freq.FOLD ||0)*100)}%`;
      bar.append(segR, segC, segF);
      cell.appendChild(bar);
      cell.addEventListener("mouseenter", () => {
        if (!state.settings.debug) return;
        el.debugCell.textContent = JSON.stringify({ pos, hand, freq, dominant: dom }, null, 2);
      });
      el.gridWrap.appendChild(cell);
    }
}

function renderNeighbors() {
  const pos = state.current.pos;
  const [r, c] = cellFromHand(state.current.hand);
  const grid = state.derived.grids[pos];
  el.neighborsList.innerHTML = "";
  neighborsForCell(r, c).forEach(([rr, cc]) => {
    const hand = handLabelFromCell(rr, cc);
    const dom = grid[rr][cc];
    const row = document.createElement("div");
    row.className = "nei";
    row.innerHTML = `
      <div class="left"><span class="chip ${actionToClass(dom)}"></span><span class="hand">${hand}</span></div>
      <div class="act">${dom}</div>`;
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
  el.positionField.style.display = state.settings.mode === "single" ? "flex" : "none";
  el.edgePctLabel.textContent = `${Math.round(state.settings.edgeWeight * 100)}%`;
  el.edgeWeight.value = String(Math.round(state.settings.edgeWeight * 100));
  el.showGridToggle.checked = state.settings.showGrid;
  el.showNeighborsToggle.checked = state.settings.showNeighbors;
  el.debugToggle.checked = state.settings.debug;
  renderStats();
  if (!state.current) return;
  el.pillPos.textContent = state.current.pos;
  el.pillSource.textContent = `${Math.round(state.settings.edgeWeight * 100)}/${100 - Math.round(state.settings.edgeWeight * 100)} edge mix`;
  el.qTitle.textContent = `RFI — ${state.current.pos}`;
  el.qSub.textContent = state.current.isBorder ? "Border hand (adjacent to boundary)" : "Random hand";
  el.handLabel.textContent = state.current.hand;
  renderTable();
  renderActionButtons();
  const reveal = state.phase === "REVEAL";
  el.revealCard.hidden = !reveal;
  el.nextBtnTop.disabled = !reveal;
  if (reveal) {
    el.revealTitle.textContent = state.current.isCorrect ? "Correct ✓" : "Incorrect ✕";
    el.revealDetail.textContent = `Your answer: ${state.current.user} • Correct: ${state.current.correct}`;
    el.gridPanel.style.display = state.settings.showGrid ? "block" : "none";
    el.neighborsPanel.style.display = state.settings.showNeighbors ? "block" : "none";
    if (state.settings.showGrid) renderGrid();
    if (state.settings.showNeighbors) renderNeighbors();
    el.debugArea.hidden = !state.settings.debug;
    if (state.settings.debug) {
      const pos = state.current.pos;
      el.debugTotals.textContent = JSON.stringify({ pos, totals: weightedTotals(pos) }, null, 2);
      const freq = RANGES[pos][state.current.hand];
      el.debugCell.textContent = JSON.stringify({ pos, hand: state.current.hand, freq, dominant: dominantAction(freq) }, null, 2);
    }
  }
}

// ============================================================
// RENDER — EDITOR GRID
// ============================================================
function renderEditorGrid() {
  const pos = state.editor.pos;
  el.editorGridWrap.innerHTML = "";
  el.editorPosLabel.textContent = pos;

  for (let rr = 0; rr < 13; rr++)
    for (let cc = 0; cc < 13; cc++) {
      const hand = handLabelFromCell(rr, cc);
      const freq = RANGES[pos][hand];
      const dom = dominantAction(freq);
      const mixed = isMixed(freq);

      const cell = document.createElement("div");
      cell.className = `cell editor-cell ${mixed ? "mixed" : actionToClass(dom)}`;
      cell.dataset.hand = hand;
      cell.textContent = hand;

      // Frequency bar at bottom
      const bar = document.createElement("div"); bar.className = "bar";
      const segR = document.createElement("div"); segR.className = "seg raise"; segR.style.width = `${Math.round((freq.RAISE||0)*100)}%`;
      const segC = document.createElement("div"); segC.className = "seg call";  segC.style.width = `${Math.round((freq.CALL ||0)*100)}%`;
      const segF = document.createElement("div"); segF.className = "seg fold";  segF.style.width = `${Math.round((freq.FOLD ||0)*100)}%`;
      bar.append(segR, segC, segF);
      cell.appendChild(bar);

      // Hover info
      cell.addEventListener("mouseenter", () => {
        const pct = v => Math.round((v||0)*100);
        const parts = [];
        if (freq.RAISE > 0) parts.push(`R:${pct(freq.RAISE)}%`);
        if (freq.CALL  > 0) parts.push(`C:${pct(freq.CALL)}%`);
        if (freq.FOLD  > 0) parts.push(`F:${pct(freq.FOLD)}%`);
        el.editorHandInfo.textContent = `${hand} — ${parts.join(" / ")}`;
        // Paint if dragging
        if (state.editor.isPainting) applyEditorPaint(hand, state.editor.paintShift);
      });

      // Mouse events for painting
      cell.addEventListener("mousedown", (e) => {
        e.preventDefault();
        if (e.button === 2) {
          // Right-click: cycle action
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
  [el.brushRaise, el.brushCall, el.brushFold].forEach(b => {
    b.classList.toggle("active", b.dataset.action === action);
  });
}

// ============================================================
// BIND — ALL EVENT LISTENERS
// ============================================================
function bind() {
  // View switching
  el.tabTrainer.addEventListener("click", () => switchView("trainer"));
  el.tabEditor.addEventListener("click",  () => switchView("editor"));

  // Trainer controls
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
    if (e.key === "1") return answer("RAISE");
    if (e.key === "2" && pos === "SB") return answer("CALL");
    if (e.key === "3" || e.key === "2") return answer("FOLD");
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
    // Show/hide call brush — only available for SB
    el.brushCall.style.display = state.editor.pos === "SB" ? "" : "none";
    renderEditorGrid();
  });

  [el.brushRaise, el.brushCall, el.brushFold].forEach(btn => {
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

  // Hide Call brush for non-SB positions initially
  el.brushCall.style.display = "none";
}

// ============================================================
// BOOT
// ============================================================
initDerived();
bind();
setSaveStatus("saved");
// Resume AudioContext on first interaction (browser autoplay policy)
document.addEventListener("click", () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) new AudioCtx();
  } catch(e) {}
}, { once: true });
newQuestion();
