// --- UI ORCHESTRATOR ---
import { germanToCanonical, normalizeOctaveAccidentalSwap } from './fingering-staff-utils.js';
import { state, saveLastFingeringState, loadLastFingeringState } from './ui-state.js';
import {
    getClefPerNote,
    getMidiNumber,
    toPositionLabel,
    toDisplayNote,
    renderStaffOutput,
    renderTextOutput,
} from './ui-staff.js';
import { drawFingerboard } from './ui-fingerboard.js';
import { initSettings } from './ui-settings.js';
import * as modals from './ui-modals.js';
import * as fingerEditor from './ui-finger-editor.js';

const V = typeof window !== 'undefined' && window.__JS_VERSIONS__ || {};
const q = (path, k) => path + (V[k] != null ? '?v=' + V[k] : '');

let solve, model, appendLocalTest, t, setNoteNaming, getNoteNaming, getNoteNamingCurrent, applyTranslations;

export const ready = Promise.all([
    import(q('./fingering.js', 'fingering')).then((m) => { solve = m.solve; model = m.model; }),
    import(q('./tests.js', 'tests')).then((m) => { appendLocalTest = m.appendLocalTest; }),
    import(q('./i18n.js', 'i18n')).then((m) => {
        t = m.t;
        setNoteNaming = m.setNoteNaming;
        getNoteNaming = m.getNoteNaming;
        getNoteNamingCurrent = m.getNoteNamingCurrent;
        applyTranslations = m.applyTranslations;
    }),
]);

// Re-export pro test-runner
export { getClefPerNote, toPositionLabel, renderStaffOutput };

const bToHMap = {
    B: 'H', Bb: 'Hb', b: 'h', bb: 'hb', b1: 'h1', bb1: 'hb1', B1: 'H1', Bb1: 'Hb1'
};

function normalizeInputTokens(input) {
    const flatToSharpMap = {
        Cb: 'H', Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Hb: 'A#',
        cb: 'h', db: 'c#', eb: 'd#', fb: 'e', gb: 'f#', ab: 'g#', bb: 'a#', hb: 'a#',
        cb1: 'h1', db1: 'c1#', eb1: 'd1#', fb1: 'e1', gb1: 'f1#', ab1: 'g1#', hb1: 'a1#', bb1: 'a1#',
        cb2: 'h1', db2: 'c2#'
    };
    const sharpToNaturalMap = {
        'E#': 'F', 'e#': 'f', 'e1#': 'f1', 'E1#': 'f1',
        'H#': 'c', 'h#': 'c1'
    };
    return input.map((token) => {
        let x = germanToCanonical(token);
        x = normalizeOctaveAccidentalSwap(x);
        x = bToHMap[x] || bToHMap[x.toLowerCase()] || x;
        const flat = flatToSharpMap[x] || flatToSharpMap[x.toLowerCase()];
        if (flat) return flat;
        const sharp = sharpToNaturalMap[x] || sharpToNaturalMap[x.toLowerCase()];
        if (sharp) return sharp;
        return x;
    });
}

function arraysEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
}

function playNote(ctx, midi, durationSeconds) {
    if (!ctx) return;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationSeconds);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + durationSeconds);
}

function stopPlayback() {
    const ps = state.playbackState;
    if (ps.timeoutId != null) {
        clearTimeout(ps.timeoutId);
        ps.timeoutId = null;
    }
    ps.playing = false;
    if (state.currentSetStaffHighlight) state.currentSetStaffHighlight(-1);
}

function startPlayback(noteTokens, bpm) {
    if (!noteTokens || noteTokens.length === 0) return;
    const ps = state.playbackState;
    if (ps.playing) return;
    ps.playing = true;
    if (ps.currentIndex === undefined || ps.currentIndex >= noteTokens.length) {
        ps.currentIndex = 0;
    }
    ps.bpm = bpm;
    const durationSec = (4 * 60) / bpm;
    if (!ps.audioContext) {
        ps.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = ps.audioContext;
    ctx.resume().then(() => {
        scheduleNext();
    }).catch(() => {
        ps.playing = false;
    });

    function scheduleNext() {
        if (!ps.playing || ps.currentIndex >= noteTokens.length) {
            ps.playing = false;
            if (state.currentSetStaffHighlight) state.currentSetStaffHighlight(-1);
            return;
        }
        const idx = ps.currentIndex;
        if (state.currentSetStaffHighlight) state.currentSetStaffHighlight(idx);
        const midi = getMidiNumber(noteTokens[idx]);
        playNote(ctx, midi, durationSec * 0.9);
        ps.currentIndex += 1;
        ps.timeoutId = setTimeout(scheduleNext, durationSec * 1000);
    }
}

function setEditMode(enabled, focusIndex = 0) {
    if (!enabled) {
        state.editModeEnabled = false;
        state.activeNoteIndex = null;
        state.pendingActiveNoteIndex = null;
        modals.closeModal();
        modals.clearActiveFingerHighlight();
        modals.blurEditKeyboardInput();
        updateEditButtonLabel();
        return;
    }
    if (!state.lastResult || state.currentOutputFormat !== 'staff') {
        state.editModeEnabled = false;
        updateEditButtonLabel();
        return;
    }
    state.editModeEnabled = true;
    state.pendingActiveNoteIndex = Math.min(focusIndex, state.lastResult.length - 1);
    if (state.fingerTargets.length) {
        fingerEditor.setActiveNoteIndex(state.pendingActiveNoteIndex);
    }
    updateEditButtonLabel();
    modals.focusEditKeyboardInput();
}

function runSolver(options = {}) {
    const { skipHideAbout = false, preserveState = false } = options;
    const inputEl = document.getElementById('melodyInput');
    const inputVal = inputEl ? inputEl.value.trim() : '';
    const display = document.getElementById('pathDisplay');
    const wrapper = document.getElementById('resultsWrapper');

    let result = null;
    let inputForSolve = null;
    let input = null;

    if (inputVal) {
        input = inputVal.split(/\s+/);
        const shouldReuse = preserveState && state.lastResult && state.lastInput && arraysEqual(input, state.lastInput);
        if (shouldReuse) {
            result = state.lastResult;
            inputForSolve = state.lastInputForSolve;
        } else {
            inputForSolve = normalizeInputTokens(input);
            result = solve(inputForSolve);
        }
    } else {
        if (!state.lastResult || !state.lastInputForSolve) return;
        result = state.lastResult;
        inputForSolve = state.lastInputForSolve;
    }

    const inputForDisplay = input !== null ? input : (state.lastInput || state.lastInputForSolve);
    renderResults({
        result,
        inputForSolve,
        inputForDisplay,
        inputOriginal: input,
        skipHideAbout,
        display,
        wrapper
    });
}

function renderResults({ result, inputForSolve, inputForDisplay, inputOriginal, skipHideAbout, display, wrapper }) {
    if (!display) return;
    const displayTokens = (inputOriginal !== null && inputOriginal.length === inputForDisplay.length ? inputOriginal : inputForDisplay).map((tok) => {
        const canon = normalizeOctaveAccidentalSwap(germanToCanonical(tok));
        const forDisplay = toDisplayNote(canon);
        return forDisplay !== canon ? forDisplay : tok;
    });

    display.innerHTML = '';
    if (result === null || result === undefined) {
        display.innerHTML = `<p class="text-red-500 font-bold p-4 text-center w-full">${t('errors.outOfRange')}</p>`;
        setEditMode(false);
        updateEditButtonState();
        return;
    }

    if (!skipHideAbout) {
        const aboutBlock = document.getElementById('fingeringAboutBlock');
        const aboutContent = document.getElementById('fingeringAboutContent');
        if (aboutBlock && aboutContent && !aboutContent.classList.contains('hidden')) {
            aboutContent.classList.add('hidden');
            const toggleBtn = document.getElementById('fingeringAboutToggle');
            const toggleText = document.getElementById('fingeringAboutToggleText');
            const chevron = document.getElementById('fingeringAboutChevron');
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            if (toggleText) toggleText.textContent = t('fingering.toggleAbout');
            if (chevron) chevron.style.transform = 'rotate(-90deg)';
            localStorage.setItem('aboutCollapsed', 'true');
        }
    }

    const bodyStyles = getComputedStyle(document.body);
    const rootStyles = getComputedStyle(document.documentElement);
    const stringColors = {
        'C': bodyStyles.getPropertyValue('--cello-string-c').trim() || rootStyles.getPropertyValue('--cello-string-c').trim(),
        'G': bodyStyles.getPropertyValue('--cello-string-g').trim() || rootStyles.getPropertyValue('--cello-string-g').trim(),
        'D': bodyStyles.getPropertyValue('--cello-string-d').trim() || rootStyles.getPropertyValue('--cello-string-d').trim(),
        'A': bodyStyles.getPropertyValue('--cello-string-a').trim() || rootStyles.getPropertyValue('--cello-string-a').trim()
    };

    const toPositionLabelFn = (p) => toPositionLabel(p, state.currentPositionLabelMode);

    const positionChanges = [];
    let lastNonZeroPosition = null;
    for (let i = 0; i < result.length; i++) {
        const currentPos = result[i].p;
        if (currentPos > 0) {
            if (lastNonZeroPosition === null || currentPos !== lastNonZeroPosition) {
                positionChanges.push(i);
                lastNonZeroPosition = currentPos;
            }
        }
    }

    const container = document.createElement('div');
    container.className = 'w-full space-y-4';

    stopPlayback();
    state.playbackState.currentIndex = 0;
    state.currentSetStaffHighlight = null;

    let staffDiv = null;
    if (state.currentOutputFormat === 'staff') {
        const staffResult = renderStaffOutput(container, result, displayTokens, positionChanges, stringColors, toPositionLabelFn, { enableHighlight: true });
        staffDiv = staffResult && staffResult.staffDiv ? staffResult.staffDiv : staffResult;
        const hasStaffHighlight = staffResult && typeof staffResult.setHighlight === 'function';
        if (hasStaffHighlight) state.currentSetStaffHighlight = staffResult.setHighlight;

        if (hasStaffHighlight) {
            const playbackBar = document.createElement('div');
            playbackBar.className = 'playback-bar flex flex-wrap items-center gap-3 py-2';
            const bpmLabel = document.createElement('label');
            bpmLabel.className = 'text-sm font-bold text-slate-700';
            bpmLabel.textContent = t('playback.bpm');
            bpmLabel.htmlFor = 'playbackBpm';
            const bpmInput = document.createElement('input');
            bpmInput.type = 'number';
            bpmInput.id = 'playbackBpm';
            bpmInput.min = 60;
            bpmInput.max = 600;
            bpmInput.value = state.playbackState.bpm;
            bpmInput.className = 'w-20 px-2 py-1 border border-slate-300 rounded font-mono text-sm';
            const playBtn = document.createElement('button');
            playBtn.type = 'button';
            playBtn.className = 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg';
            playBtn.textContent = t('playback.play');
            const pauseBtn = document.createElement('button');
            pauseBtn.type = 'button';
            pauseBtn.className = 'bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg';
            pauseBtn.textContent = t('playback.pause');
            const restartBtn = document.createElement('button');
            restartBtn.type = 'button';
            restartBtn.className = 'bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg';
            restartBtn.textContent = t('playback.restart');

            bpmInput.addEventListener('change', () => {
                const v = parseInt(bpmInput.value, 10);
                if (!Number.isNaN(v) && v >= 60 && v <= 600) state.playbackState.bpm = v;
            });
            playBtn.addEventListener('click', () => {
                if (!state.playbackState.playing) {
                    const bpm = parseInt(bpmInput.value, 10);
                    if (!Number.isNaN(bpm) && bpm >= 60 && bpm <= 600) state.playbackState.bpm = bpm;
                    startPlayback(inputForSolve, state.playbackState.bpm);
                }
            });
            pauseBtn.addEventListener('click', stopPlayback);
            restartBtn.addEventListener('click', () => {
                stopPlayback();
                state.playbackState.currentIndex = 0;
                if (state.currentSetStaffHighlight) state.currentSetStaffHighlight(-1);
                const bpm = parseInt(bpmInput.value, 10);
                if (!Number.isNaN(bpm) && bpm >= 60 && bpm <= 600) state.playbackState.bpm = bpm;
                startPlayback(inputForSolve, state.playbackState.bpm);
            });

            playbackBar.appendChild(bpmLabel);
            playbackBar.appendChild(bpmInput);
            playbackBar.appendChild(playBtn);
            playbackBar.appendChild(pauseBtn);
            playbackBar.appendChild(restartBtn);
            container.appendChild(playbackBar);
        }
    } else {
        renderTextOutput(container, result, displayTokens, positionChanges, stringColors, toPositionLabelFn);
    }

    display.appendChild(container);

    state.lastResult = result;
    state.lastInputForSolve = inputForSolve;
    if (inputOriginal !== null) state.lastInput = inputOriginal;

    if (state.lastInput && state.lastInputForSolve && state.lastResult) {
        saveLastFingeringState({
            input: state.lastInput,
            inputNormalized: state.lastInputForSolve,
            fingering: state.lastResult
        });
    }

    drawFingerboard(result, displayTokens, state.currentPositionLabelMode);

    if (wrapper) wrapper.classList.remove('hidden');

    const settingsSection = document.getElementById('settingsSection');
    if (settingsSection) settingsSection.classList.remove('hidden');

    if (state.currentOutputFormat === 'staff') {
        fingerEditor.setupFingeringEditor(staffDiv, result);
    } else {
        fingerEditor.teardownFingeringEditor();
    }
    updateEditButtonState();
}

function updateEditButtonLabel() {
    const editButton = document.getElementById('editFingeringButton');
    if (!editButton) return;
    editButton.textContent = state.editModeEnabled ? t('button.editStop') : t('button.editStart');
}

function updateEditButtonState() {
    const editButton = document.getElementById('editFingeringButton');
    if (!editButton) return;
    const disabled = state.currentOutputFormat !== 'staff' || !state.lastResult;
    editButton.disabled = disabled;
    editButton.classList.toggle('opacity-60', disabled);
    editButton.classList.toggle('cursor-not-allowed', disabled);
    editButton.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    if (disabled && state.editModeEnabled) {
        setEditMode(false);
    }
}

function toggleJson() {
    document.getElementById('jsonContainer').classList.toggle('hidden');
}

// Export na window
window.runSolver = runSolver;
window.toggleJson = toggleJson;
window.drawFingerboard = (path, input) => drawFingerboard(path, input, state.currentPositionLabelMode);

window.redrawResults = function redrawResults() {
    if (state.lastResult && state.lastInputForSolve) runSolver({ skipHideAbout: true, preserveState: true });
};

if (!Object.getOwnPropertyDescriptor(window, 'lastResult')) {
    Object.defineProperty(window, 'lastResult', {
        configurable: true,
        enumerable: true,
        get: () => state.lastResult,
        set: (val) => { state.lastResult = val; }
    });
}
if (!Object.getOwnPropertyDescriptor(window, 'lastInputForSolve')) {
    Object.defineProperty(window, 'lastInputForSolve', {
        configurable: true,
        enumerable: true,
        get: () => state.lastInputForSolve,
        set: (val) => { state.lastInputForSolve = val; }
    });
}

export function initUI() {
    if (!document.getElementById('pathDisplay')) return;

    modals.initModals({
        state,
        t,
        model,
        toPositionLabel,
        applyModalSelection: fingerEditor.applyModalSelection,
        appendLocalTest,
    });

    fingerEditor.initFingerEditor({
        state,
        solve,
        t,
        renderResults,
        showModalError: modals.showModalError,
        focusEditKeyboardInput: modals.focusEditKeyboardInput,
        setEditMode,
    });

    const jsonDisplay = document.getElementById('jsonDisplay');
    if (jsonDisplay) jsonDisplay.textContent = JSON.stringify(model, null, 2);

    const urlParams = new URLSearchParams(window.location.search);
    const sequenceParam = urlParams.get('sequence');
    const melodyInputEl = document.getElementById('melodyInput');
    if (sequenceParam && melodyInputEl) {
        melodyInputEl.value = decodeURIComponent(sequenceParam);
    }
    if (!sequenceParam && melodyInputEl) {
        const savedState = loadLastFingeringState();
        if (savedState) {
            melodyInputEl.value = savedState.input.join(' ');
            state.lastResult = savedState.fingering;
            state.lastInput = savedState.input;
            state.lastInputForSolve = savedState.inputNormalized || normalizeInputTokens(savedState.input);
        }
    }

    const fingeringAboutBlock = document.getElementById('fingeringAboutBlock');
    const fingeringAboutContent = document.getElementById('fingeringAboutContent');
    const fingeringAboutToggle = document.getElementById('fingeringAboutToggle');
    const fingeringAboutToggleText = document.getElementById('fingeringAboutToggleText');
    const fingeringAboutChevron = document.getElementById('fingeringAboutChevron');

    if (fingeringAboutBlock && fingeringAboutContent) {
        const collapsed = localStorage.getItem('aboutCollapsed') === 'true';
        fingeringAboutContent.classList.toggle('hidden', collapsed);
        if (fingeringAboutToggle) fingeringAboutToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        if (fingeringAboutToggleText) fingeringAboutToggleText.textContent = t(collapsed ? 'fingering.toggleAbout' : 'fingering.toggleAboutClose');
        if (fingeringAboutChevron) fingeringAboutChevron.style.transform = collapsed ? 'rotate(-90deg)' : '';
        if (fingeringAboutToggle) {
            fingeringAboutToggle.addEventListener('click', () => {
                const isHidden = fingeringAboutContent.classList.toggle('hidden');
                fingeringAboutToggle.setAttribute('aria-expanded', isHidden ? 'false' : 'true');
                if (fingeringAboutToggleText) fingeringAboutToggleText.textContent = t(isHidden ? 'fingering.toggleAbout' : 'fingering.toggleAboutClose');
                if (fingeringAboutChevron) fingeringAboutChevron.style.transform = isHidden ? 'rotate(-90deg)' : '';
                localStorage.setItem('aboutCollapsed', isHidden ? 'true' : 'false');
            });
        }
    }

    function resizeMelodyTextarea() {
        if (!melodyInputEl || melodyInputEl.nodeName !== 'TEXTAREA') return;
        melodyInputEl.style.height = 'auto';
        melodyInputEl.style.height = Math.max(melodyInputEl.scrollHeight, 48) + 'px';
    }

    if (melodyInputEl) {
        if (melodyInputEl.nodeName === 'TEXTAREA') {
            melodyInputEl.addEventListener('input', resizeMelodyTextarea);
            melodyInputEl.addEventListener('change', resizeMelodyTextarea);
            resizeMelodyTextarea();
        }
        melodyInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); runSolver(); }
        });
    }

    const clearInputButton = document.getElementById('clearInputButton');
    if (clearInputButton && melodyInputEl) {
        clearInputButton.addEventListener('click', () => {
            melodyInputEl.value = '';
            if (melodyInputEl.nodeName === 'TEXTAREA') resizeMelodyTextarea();
            melodyInputEl.focus();
        });
    }

    const solveButton = document.getElementById('solveButton');
    if (solveButton) solveButton.addEventListener('click', () => runSolver());

    const editButton = document.getElementById('editFingeringButton');
    if (editButton) {
        editButton.addEventListener('click', () => {
            if (state.editModeEnabled) {
                setEditMode(false);
                return;
            }
            if (!state.lastResult) runSolver();
            if (state.lastResult) setEditMode(true, 0);
        });
    }

    const saveTestButton = document.getElementById('saveTestButton');
    if (saveTestButton) {
        saveTestButton.addEventListener('click', () => {
            if (!state.lastResult || !state.lastInputForSolve) {
                runSolver();
            }
            if (!state.lastResult || !state.lastInputForSolve) return;
            const inputVal = melodyInputEl ? melodyInputEl.value.trim() : '';
            const defaultName = inputVal || (state.lastInput ? state.lastInput.join(' ') : state.lastInputForSolve.join(' '));
            modals.openSaveTestModal(defaultName);
        });
    }

    const toggleJsonButton = document.getElementById('toggleJsonButton');
    if (toggleJsonButton) toggleJsonButton.addEventListener('click', toggleJson);

    initSettings({
        state,
        runSolver,
        setEditMode,
        t,
        getNoteNaming,
        setNoteNaming,
    });

    updateEditButtonLabel();
    modals.ensureEditKeyboardInput();

    window.addEventListener('languageChange', () => {
        modals.updateSaveTestModalTexts();
        updateEditButtonLabel();
        if (state.lastResult && state.lastInputForSolve) runSolver({ skipHideAbout: true, preserveState: true });
    });

    document.addEventListener('keydown', (e) => {
        if (!state.editModeEnabled || state.currentOutputFormat !== 'staff') return;
        if (e.key === 'Escape') {
            setEditMode(false);
            return;
        }
        if (fingerEditor.isTypingTarget(e.target)) return;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const direction = e.key === 'ArrowLeft' ? -1 : 1;
            const currentIndex = state.activeNoteIndex ?? 0;
            fingerEditor.setActiveNoteIndex(currentIndex + direction);
            return;
        }
        if (!/^[0-4]$/.test(e.key)) return;
        e.preventDefault();
        fingerEditor.applyModalSelection('f', e.key, false);
    });

    document.addEventListener('mousedown', (e) => {
        if (!state.editModeEnabled) return;
        if (state.modalEl && state.modalEl.contains(e.target)) return;
        if (e.target.closest && e.target.closest('.fingering-hitbox')) return;
        if (editButton && editButton.contains(e.target)) return;
        setEditMode(false);
    });

    window.addEventListener('resize', () => {
        if (state.editModeEnabled && state.activeNoteIndex !== null) {
            const target = state.fingerTargets[state.activeNoteIndex];
            if (target && target.anchorEl) fingerEditor.positionModal(target.anchorEl);
        }
    });

    runSolver({ skipHideAbout: true, preserveState: true });
}
