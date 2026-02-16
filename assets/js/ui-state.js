/**
 * Sdílený stav UI pro prstoklad – centralizace proměnných pro ostatní moduly.
 */

export const STORAGE_LAST_FINGERING = 'fingering:last';

// Výsledek a vstup
let lastResult = null;
let lastInputForSolve = null;
/** Původní vstup uživatele (bez enharmonických převodů). Používá se pro zobrazení výstupu. */
let lastInput = null;

// Režim editace
let editModeEnabled = false;
let activeNoteIndex = null;
let pendingActiveNoteIndex = null;
let fingerTargets = [];
let staffScrollContainer = null;

// Modaly
let modalEl = null;
let modalErrorTimeout = null;
let saveTestModalEl = null;
let saveTestNameInputEl = null;
let saveTestDefaultName = '';
let saveTestReturnFocusEl = null;

// Highlight a edit keyboard
let activeFingerHighlightEl = null;
let activeFingerHighlightSvg = null;
let editKeyboardInputEl = null;

// Režim výstupu
let currentOutputFormat = 'staff';

// Přehrávání
/** Přehrávání: zvýraznění aktuální noty na osnově */
let currentSetStaffHighlight = null;
let playbackState = { bpm: 480, playing: false, currentIndex: 0, timeoutId: null, audioContext: null };

// Označení poloh
let currentPositionLabelMode = 'diatonic';

export const state = {
    get lastResult() { return lastResult; },
    set lastResult(v) { lastResult = v; },
    get lastInputForSolve() { return lastInputForSolve; },
    set lastInputForSolve(v) { lastInputForSolve = v; },
    get lastInput() { return lastInput; },
    set lastInput(v) { lastInput = v; },
    get editModeEnabled() { return editModeEnabled; },
    set editModeEnabled(v) { editModeEnabled = v; },
    get activeNoteIndex() { return activeNoteIndex; },
    set activeNoteIndex(v) { activeNoteIndex = v; },
    get pendingActiveNoteIndex() { return pendingActiveNoteIndex; },
    set pendingActiveNoteIndex(v) { pendingActiveNoteIndex = v; },
    get fingerTargets() { return fingerTargets; },
    set fingerTargets(v) { fingerTargets = v; },
    get staffScrollContainer() { return staffScrollContainer; },
    set staffScrollContainer(v) { staffScrollContainer = v; },
    get modalEl() { return modalEl; },
    set modalEl(v) { modalEl = v; },
    get modalErrorTimeout() { return modalErrorTimeout; },
    set modalErrorTimeout(v) { modalErrorTimeout = v; },
    get saveTestModalEl() { return saveTestModalEl; },
    set saveTestModalEl(v) { saveTestModalEl = v; },
    get saveTestNameInputEl() { return saveTestNameInputEl; },
    set saveTestNameInputEl(v) { saveTestNameInputEl = v; },
    get saveTestDefaultName() { return saveTestDefaultName; },
    set saveTestDefaultName(v) { saveTestDefaultName = v; },
    get saveTestReturnFocusEl() { return saveTestReturnFocusEl; },
    set saveTestReturnFocusEl(v) { saveTestReturnFocusEl = v; },
    get activeFingerHighlightEl() { return activeFingerHighlightEl; },
    set activeFingerHighlightEl(v) { activeFingerHighlightEl = v; },
    get activeFingerHighlightSvg() { return activeFingerHighlightSvg; },
    set activeFingerHighlightSvg(v) { activeFingerHighlightSvg = v; },
    get editKeyboardInputEl() { return editKeyboardInputEl; },
    set editKeyboardInputEl(v) { editKeyboardInputEl = v; },
    get currentOutputFormat() { return currentOutputFormat; },
    set currentOutputFormat(v) { currentOutputFormat = v; },
    get currentSetStaffHighlight() { return currentSetStaffHighlight; },
    set currentSetStaffHighlight(v) { currentSetStaffHighlight = v; },
    get playbackState() { return playbackState; },
    get currentPositionLabelMode() { return currentPositionLabelMode; },
    set currentPositionLabelMode(v) { currentPositionLabelMode = v; },
};

export function saveLastFingeringState(stateObj) {
    if (!stateObj || !stateObj.input || !stateObj.fingering) return;
    localStorage.setItem(STORAGE_LAST_FINGERING, JSON.stringify(stateObj));
}

export function loadLastFingeringState() {
    try {
        const raw = localStorage.getItem(STORAGE_LAST_FINGERING);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || !Array.isArray(data.input) || !Array.isArray(data.fingering)) return null;
        if (data.input.length !== data.fingering.length) return null;
        if (data.inputNormalized && data.inputNormalized.length !== data.input.length) return null;
        return data;
    } catch (e) {
        return null;
    }
}
