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
