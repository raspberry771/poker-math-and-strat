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

(function loadSavedThreebetRanges() {
  try {
    const saved = localStorage.getItem('rfi_threbet_ranges');
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (!MATRIX_KEYS.every(k => parsed[k])) {
      console.warn('RFI Trainer: threbet ranges failed validation, using defaults');
      return;
    }
    // Discard data saved with old THREE_BET action name (now split into VALUE_3BET / BLUFF_3BET)
    const sampleMatrix = parsed["IP_3BET"];
    if (sampleMatrix) {
      const samplePos = Object.values(sampleMatrix)[0];
      const sampleVill = samplePos && Object.values(samplePos)[0];
      const sampleHand = sampleVill && Object.values(sampleVill)[0];
      if (sampleHand && "THREE_BET" in sampleHand) {
        console.warn('RFI Trainer: threbet ranges use old THREE_BET format, resetting');
        return;
      }
    }
    THREBET_RANGES = parsed;
    console.log('RFI Trainer: loaded threbet ranges from localStorage');
  } catch(e) {
    console.warn('RFI Trainer: could not load threbet ranges:', e.message);
  }
})();

function saveThreebetRangesToStorage() {
  try {
    localStorage.setItem('rfi_threbet_ranges', JSON.stringify(THREBET_RANGES));
    setSaveStatus('saved');
  } catch(e) {
    console.error('RFI Trainer: threbet save failed:', e.message);
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

