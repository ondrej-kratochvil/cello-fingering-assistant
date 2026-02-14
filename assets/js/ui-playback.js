/**
 * Přehrávání prstokladu – playNote, startPlayback, stopPlayback, playback bar.
 * Volající musí před použitím volat initPlayback(state, deps).
 */
let _state = null;
let _deps = null;

export function initPlayback(state, deps) {
    _state = state;
    _deps = deps;
}

function getDeps() {
    if (!_state || !_deps) throw new Error('ui-playback: initPlayback(state, deps) must be called first');
    return { state: _state, ..._deps };
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

export function stopPlayback() {
    const { state } = getDeps();
    const ps = state.playbackState;
    if (ps.timeoutId != null) {
        clearTimeout(ps.timeoutId);
        ps.timeoutId = null;
    }
    ps.playing = false;
}

export function startPlayback(noteTokens, bpm) {
    const { state } = getDeps();
    const { getMidiNumber } = getDeps();
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
        if (!ps.playing) return;
        if (ps.currentIndex >= noteTokens.length) {
            ps.currentIndex = 0;
        }
        const idx = ps.currentIndex;
        if (state.currentSetStaffHighlight) state.currentSetStaffHighlight(idx);
        if (state.playbackState.onIndexChange) state.playbackState.onIndexChange();
        let midi = getMidiNumber(noteTokens[idx]);
        if (midi < 48) midi += 12;
        playNote(ctx, midi, durationSec * 0.9);
        ps.currentIndex += 1;
        ps.timeoutId = setTimeout(scheduleNext, durationSec * 1000);
    }
}

function updateRestartDisabled(state) {
    const ps = state.playbackState;
    const restartBtn = document.getElementById('playbackRestartBtn');
    if (!restartBtn) return;
    restartBtn.disabled = ps.currentIndex === 0 && !ps.playing;
}

export function createPlaybackBar(state, t, inputForSolve, container) {
    const heading = document.createElement('h3');
    heading.className = 'text-lg font-bold text-slate-800';
    heading.textContent = t('playback.heading');
    container.appendChild(heading);

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
    const playPauseBtn = document.createElement('button');
    playPauseBtn.type = 'button';
    playPauseBtn.className = 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2';
    playPauseBtn.innerHTML = '<svg class="playback-icon-play w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><svg class="playback-icon-pause w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg><span class="playback-btn-text">' + t('playback.play') + '</span>';
    const restartBtn = document.createElement('button');
    restartBtn.type = 'button';
    restartBtn.id = 'playbackRestartBtn';
    restartBtn.className = 'bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';
    restartBtn.textContent = t('playback.restart');

    function updatePlayPauseUI() {
        const playing = state.playbackState.playing;
        const iconPlay = playPauseBtn.querySelector('.playback-icon-play');
        const iconPause = playPauseBtn.querySelector('.playback-icon-pause');
        const btnText = playPauseBtn.querySelector('.playback-btn-text');
        if (iconPlay) iconPlay.classList.toggle('hidden', playing);
        if (iconPause) iconPause.classList.toggle('hidden', !playing);
        if (btnText) btnText.textContent = playing ? t('playback.pause') : t('playback.play');
        playPauseBtn.classList.toggle('bg-emerald-600', !playing);
        playPauseBtn.classList.toggle('hover:bg-emerald-700', !playing);
        playPauseBtn.classList.toggle('bg-amber-600', playing);
        playPauseBtn.classList.toggle('hover:bg-amber-700', playing);
        updateRestartDisabled(state);
    }

    bpmInput.addEventListener('change', () => {
        const v = parseInt(bpmInput.value, 10);
        if (!Number.isNaN(v) && v >= 60 && v <= 600) state.playbackState.bpm = v;
    });
    playPauseBtn.addEventListener('click', () => {
        if (state.playbackState.playing) {
            stopPlayback();
        } else {
            const bpm = parseInt(bpmInput.value, 10);
            if (!Number.isNaN(bpm) && bpm >= 60 && bpm <= 600) state.playbackState.bpm = bpm;
            startPlayback(inputForSolve, state.playbackState.bpm);
        }
        updatePlayPauseUI();
    });
    state.playbackState.onIndexChange = () => updateRestartDisabled(state);
    restartBtn.addEventListener('click', () => {
        stopPlayback();
        state.playbackState.currentIndex = 0;
        if (state.currentSetStaffHighlight) state.currentSetStaffHighlight(0);
        const bpm = parseInt(bpmInput.value, 10);
        if (!Number.isNaN(bpm) && bpm >= 60 && bpm <= 600) state.playbackState.bpm = bpm;
        startPlayback(inputForSolve, state.playbackState.bpm);
        updatePlayPauseUI();
    });

    playbackBar.appendChild(bpmLabel);
    playbackBar.appendChild(bpmInput);
    playbackBar.appendChild(playPauseBtn);
    playbackBar.appendChild(restartBtn);
    container.appendChild(playbackBar);

    updatePlayPauseUI();
}
